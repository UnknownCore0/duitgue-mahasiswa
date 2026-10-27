# 💸 DuitGue - Catatan Keuangan Mahasiswa

**DuitGue** adalah aplikasi *Progressive Web App* (PWA) pencatatan keuangan yang dirancang khusus untuk mahasiswa Gen Z. Aplikasi ini ringan, cepat, dan bisa di-*install* langsung ke layar utama HP (Android/iOS) tanpa perlu mengunduh dari App Store/Play Store.

## ✨ Fitur Utama

- **PWA (Progressive Web App)**: Bisa di-install di HP/Laptop dan tetap bisa dibuka meskipun sedang offline (tanpa internet).
- **🌙 Dark Mode**: Tampilan nyaman untuk mata, mendukung mode gelap dan terang (tersimpan otomatis).
- **📊 Analitik & Grafik**: Visualisasi pengeluaran per kategori menggunakan Donut Chart (CSS `conic-gradient`).
- **🎯 Budget Bulanan**: Atur batas pengeluaran per kategori. Progress bar akan berubah warna (Hijau -> Kuning -> Merah) jika budget hampir habis.
- **📈 Perbandingan Bulan**: Menampilkan persentase kenaikan/penurunan pengeluaran dibanding bulan lalu.
- **🔥 Daily Streak**: Gamifikasi untuk memotivasi pengguna agar rajin mencatat setiap hari.
- **📥 Export CSV**: Fitur *backup* data transaksi ke format Excel/Spreadsheet.
- **↩️ Undo Hapus**: Transaksi yang terhapus bisa dikembalikan dalam waktu 5 detik (Toast Notification).
- **🛡️ Data Privacy**: Semua data transaksi disimpan secara lokal di perangkat pengguna (`localStorage`), tidak ada data yang dikirim ke server.

## 🛠️ Teknologi yang Digunakan
- **HTML5** (Semantic & Accessible)
- **CSS3** (Custom Properties/Variables, Flexbox, CSS Grid, `conic-gradient`)
- **Vanilla JavaScript** (ES6+, DOM Manipulation, LocalStorage, Service Worker)
- **Netlify / GitHub Pages** (Hosting & Deployment)

## 🚀 Cara Menjalankan Secara Lokal
1. *Clone* repositori ini: `git clone https://github.com/username/duitku-mahasiswa.git`
2. Buka folder proyek di VS Code.
3. Jalankan menggunakan ekstensi **Live Server** di VS Code.
4. Buka `http://127.0.0.1:5500` di browser.

## 🌐 Live Demo
Kamu bisa mencoba aplikasinya secara langsung di sini: 
**[[https://duitku-mahasiswa.netlify.app/]([https://duitgue-mahasiswa.netlify.app/](https://unknowncore0.github.io/duitgue-mahasiswa/))]([https://duitku-mahasiswa.netlify.app/](https://unknowncore0.github.io/duitgue-mahasiswa/))** *(ganti dengan link Netlify/GitHub Pages milikmu)*

---
*Dibuat untuk memenuhi tugas/proyek pribadi pengembangan web.*
