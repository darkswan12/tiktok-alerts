# 🚀 TikTok OBS Alerts Server

Sistem notifikasi real-time untuk TikTok Live, dirancang khusus untuk diintegrasikan sebagai Overlay di OBS Studio. Proyek ini dibangun menggunakan Node.js, Express, Socket.io, dan ditenagai oleh library @tiktool/live.

## ✨ Fitur Utama

- **Real-time Events:** Menangkap notifikasi Gift, Like, Follow, Member (Join), dan Chat secara instan tanpa delay.
- **Custom Audio Alerts:** Putar efek suara berbeda berdasarkan nama Gift (misalnya: suara khusus untuk Rose/Mawar, dan suara default untuk gift lainnya).
- **OBS Ready:** Desain overlay transparan dengan animasi slide-in yang mulus, siap dipasang di OBS via Browser Source.
- **Cloud Database (PostgreSQL):** Terintegrasi dengan PostgreSQL bawaan Railway untuk menyimpan riwayat gift secara permanen, aman dari siklus restart server.
- **Web Control Panel:** Dashboard responsif untuk menghubungkan username TikTok ke sistem secara dinamis dan melakukan uji coba (test gift).

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **WebSocket:** Socket.io
- **TikTok API:** @tiktool/live
- **Database:** PostgreSQL (pg) via Railway

---

## 💻 Instalasi Lokal (Development)

Pastikan kamu sudah menginstal Node.js di komputermu.

1. **Clone Repositori Ini**
   git clone https://github.com/username-kamu/tiktok-alerts.git
   cd tiktok-alerts

2. **Install Dependencies**
   npm install

3. **Konfigurasi Environment Variables**
   Buat file bernama .env di folder utama proyek, lalu isi dengan kunci berikut:
   TIKTOOL_API_KEY=api_key_kamu_di_sini
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/railway
   PORT=3000

4. **Siapkan Folder Suara (Assets)**
   Pastikan terdapat folder public/sounds/ di dalam proyek, dan masukkan file audio MP3 (contoh: default.mp3, rose.mp3).

5. **Jalankan Server**
   node server.js
   Server akan berjalan di http://localhost:3000.

---

## ☁️ Deployment ke Railway (Cloud)

Proyek ini sudah dikonfigurasi untuk berjalan 100% di dalam ekosistem Railway tanpa layanan pihak ketiga.

1. Buat akun dan login ke Railway.app.
2. Klik **New Project** -> **Deploy from GitHub repo**.
3. Pilih repositori tiktok-alerts.
4. Tambahkan Database: Di dashboard project Railway kamu, klik **New** -> **Database** -> **Add PostgreSQL**.
5. Masuk ke menu **Variables** di bagian aplikasi web kamu (bukan di bagian database), tambahkan:
   - TIKTOOL_API_KEY : Isi dengan API Key kamu.
   - DATABASE_URL : Ketik `${{` lalu pilih `PostgreSQL` -> `DATABASE_URL` (ini akan otomatis menyambungkan database bawaan Railway ke aplikasi kamu).
6. Masuk ke tab **Settings** -> **Networking**, lalu klik **Generate Domain** untuk mendapatkan URL publik kamu.

---

## 🎥 Integrasi ke OBS Studio

1. Buka **OBS Studio**.
2. Di bagian Sources, klik tombol **+** dan pilih **Browser**.
3. Beri nama (misal: "TikTok Alerts"), lalu klik OK.
4. Pada kolom **URL**, masukkan:
   - Jika berjalan lokal: http://localhost:3000/overlay.html (sesuaikan dengan nama file HTML overlay kamu)
   - Jika di-deploy (Railway): https://domain-railway-kamu.up.railway.app/overlay.html
5. Atur **Width** ke 1920 dan **Height** ke 1080 (atau sesuaikan dengan resolusi kanvas OBS).
6. Centang opsi **Control audio via OBS** jika ingin mengatur volume notifikasi langsung dari mixer OBS.
7. Klik **OK**.

---

## 🎮 Cara Menggunakan

1. Buka URL utama aplikasi (lokal atau domain Railway) di browser untuk membuka **Control Panel**.
2. Masukkan username TikTok yang sedang LIVE (tanpa menggunakan simbol @).
3. Klik tombol **Connect to LIVE**.
4. Tunggu hingga status berubah menjadi "Terhubung".
5. (Opsional) Klik tombol **TEST GIFT** untuk memastikan overlay dan suara di OBS berjalan dengan baik.
6. Kamu bisa menutup tab browser Control Panel; koneksi TikTok akan tetap berjalan di background server.

---
Dibuat untuk mempermudah streamer berinteraksi dengan audiens.
