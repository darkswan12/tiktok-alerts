const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg'); // Ganti jadi PostgreSQL
const { TikTokLive } = require('@tiktool/live');

// ======================================================
// CONFIG & ENV VARIABLES (Diset nanti di dashboard Railway)
// ======================================================
const TIKTOOL_API_KEY = process.env.TIKTOOL_API_KEY || 'YOUR_TIKTOOLS_KEY';
const PORT = process.env.PORT || 3000; // Wajib dinamis buat Railway

// ======================================================
// DATABASE (Supabase / PostgreSQL)
// ======================================================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Wajib true/false tergantung settingan Supabase lu
    }
});

// Setup tabel dengan sintaks PostgreSQL (SERIAL PRIMARY KEY)
pool.query(`
    CREATE TABLE IF NOT EXISTS gifts (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255),
        giftName VARCHAR(255),
        count INTEGER,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`).then(() => {
    console.log('✅ Tabel PostgreSQL siap!');
}).catch(err => {
    console.error('❌ Gagal bikin tabel:', err.message);
});

// ======================================================
// EXPRESS + SOCKET.IO
// ======================================================
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let tiktokLive = null;

function startTikTokConnection(username, socketToNotify = null) {
    if (tiktokLive) {
        try {
            tiktokLive.disconnect();
        } catch (e) {
            console.log('Disconnect lama:', e.message);
        }
        tiktokLive = null;
    }

    const cleanUsername = String(username).replace(/^@/, '').trim();
    if (!cleanUsername) return;

    console.log(`📡 Connecting ke @${cleanUsername}...`);
    if (socketToNotify) socketToNotify.emit('status', `Menghubungkan ke @${cleanUsername}...`);

    tiktokLive = new TikTokLive({
        uniqueId: cleanUsername,
        apiKey: TIKTOOL_API_KEY
    });

    tiktokLive.on('connected', () => {
        console.log(`✅ TERHUBUNG ke @${cleanUsername}`);
        io.emit('status', `Terhubung ke @${cleanUsername}`);
    });

    tiktokLive.on('gift', async (data) => {
        const username = data.nickname || data.user?.uniqueId || 'Unknown';
        const giftName = data.giftName || 'Unknown Gift';
        const count = data.repeatCount || 1;

        console.log(`🎁 ${username} -> ${giftName} x${count}`);

        // Insert ke PostgreSQL pakai Parameterized Query biar aman
        try {
            await pool.query(
                `INSERT INTO gifts (username, giftName, count) VALUES ($1, $2, $3)`,
                [username, giftName, count]
            );
        } catch (err) {
            console.error('❌ Gagal insert ke DB:', err.message);
        }

        io.emit('gift_event', { username, giftName, count });
        io.emit('event', `🎁 ${username} mengirim ${giftName} x${count}`);
    });

    tiktokLive.on('like', (data) => {
        const username = data.nickname || data.user?.uniqueId || 'Unknown';
        const count = data.likeCount || 1;
        io.emit('event', `❤️ ${username} menyukai LIVE (${count}x)`);
    });

    tiktokLive.on('follow', (data) => {
        const username = data.nickname || data.user?.uniqueId || 'Unknown';
        io.emit('event', `👤 ${username} mulai mengikuti!`);
    });

    tiktokLive.on('member', (data) => {
        const username = data.nickname || data.user?.uniqueId || 'Unknown';
        console.log(`👋 ${username} bergabung ke LIVE`);
        io.emit('event', `👋 ${username} bergabung ke LIVE!`);
    });

    tiktokLive.connect().catch(err => {
        console.error('❌ GAGAL KONEK:', err);
        io.emit('status', `Gagal konek: ${err.message || 'Unknown error'}`);
    });
}

io.on('connection', (socket) => {
    console.log('🌐 Browser connected');

    socket.on('test_gift', () => {
        io.emit('gift_event', { username: 'TestUser', giftName: 'Rose', count: 1 });
    });
    
    socket.on('connect_tiktok', (username) => {
        startTikTokConnection(username, socket);
    });

    socket.on('disconnect', () => {
        console.log('🌐 Browser disconnected');
    });
});

// Pakai variabel PORT dari Railway
server.listen(PORT, () => {
    console.log('\n==========================================');
    console.log('🚀 TikTok OBS Notification Server (Cloud Edition)');
    console.log('==========================================');
    console.log(`🌐 Server jalan di port ${PORT}\n`);
});