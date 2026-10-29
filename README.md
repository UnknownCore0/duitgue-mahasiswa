# 💸 Duit Gue - Catatan Keuangan Mahasiswa

**Duit Gue** adalah aplikasi *Progressive Web App* (PWA) pencatatan keuangan yang dirancang khusus untuk mahasiswa Gen Z. Aplikasi ini ringan, cepat, estetik, dan bisa di-*install* langsung ke layar utama HP (Android/iOS) tanpa perlu mengunduh dari App Store/Play Store.

## ✨ Fitur Utama

- **📱 PWA (Progressive Web App)**: Bisa di-*install* di HP/Laptop dan tetap bisa dibuka meskipun sedang offline (tanpa internet).
- **📝 Pencatatan Transaksi**: Catat pemasukan dan pengeluaran dengan mudah, dilengkapi ringkasan Saldo, Pemasukan, Pengeluaran, dan Selisih secara *real-time*.
- **🌙 Dark Mode & 5 Tema Gradasi**: Tampilan nyaman untuk mata. Dilengkapi pilihan warna gradasi (Indigo, Emerald, Blue, Pink, Orange) yang mengubah latar belakang aplikasi secara dinamis.
- **🌐 Dwibahasa (ID/EN)**: Mendukung dua bahasa (Indonesia & Inggris) yang mencakup seluruh teks antarmuka, *dropdown*, *placeholder*, hingga format tanggal.
- **📊 Analitik & Grafik**: 
  - Visualisasi pengeluaran per kategori menggunakan *Donut Chart* (CSS `conic-gradient`).
  - **Dana Statement**: Grafik batang perbandingan Pemasukan vs Pengeluaran 2 bulan terakhir.
  - Perbandingan otomatis kenaikan/penurunan pengeluaran dibanding bulan lalu.
- **🎯 Budget Bulanan**: Atur batas pengeluaran per kategori. *Progress bar* akan berubah warna (Hijau -> Kuning -> Merah) jika budget hampir habis.
- **📈 Halaman Rekap**: Laporan tahunan dan bulanan yang rapi. Bisa difilter berdasarkan tahun untuk melihat evaluasi keuangan.
- **🤝 Hutang & Piutang**: Catat pinjaman dengan teman. Dilengkapi fitur "Tandai Lunas" dan ringkasan total "Aku Berhutang" vs "Aku Meminjamkan".
- **🎯 Impian & Tabungan**: Buat target barang impian (misal: "Beli HP") dan masukkan tabungan secara berkala. Dilengkapi *progress bar* visual dan status "Target Tercapai!".
- **🔥 Daily Streak**: Gamifikasi untuk memotivasi pengguna agar rajin mencatat setiap hari.
- **💾 Backup & Restore**: Simpan seluruh data (Transaksi, Budget, Hutang, Impian, Profil) ke file `.json` dan pulihkan kapan saja.
- **📥 Export CSV**: Fitur *backup* data transaksi ke format Excel/Spreadsheet.
- **↩️ Undo Hapus**: Transaksi yang terhapus bisa dikembalikan dalam waktu 5 detik (*Toast Notification*).
- **🛡️ Data Privacy**: Semua data transaksi disimpan secara lokal di perangkat pengguna (`localStorage`), tidak ada data yang dikirim ke server.

## 🛠️ Teknologi yang Digunakan
- **HTML5** (Semantic & Accessible)
- **CSS3** (Custom Properties/Variables, Flexbox, CSS Grid, `conic-gradient`, Strict Media Queries)
- **Vanilla JavaScript** (ES6+, DOM Manipulation, LocalStorage, Service Worker, FileReader, Blob)
- **Netlify / GitHub Pages** (Hosting & Deployment)
- **Google Fonts** (Plus Jakarta Sans)

## 🚀 Cara Menjalankan Secara Lokal
1. *Clone* repositori ini: `git clone https://github.com/UnknownCore0/duitgue-mahasiswa.git`
2. Buka folder proyek di VS Code.
3. Jalankan menggunakan ekstensi **Live Server** di VS Code.
4. Buka `http://127.0.0.1:5500` di browser.

## 🌐 Live Demo
Kamu bisa mencoba aplikasinya secara langsung di sini: 
- **GitHub Pages**: [https://unknowncore0.github.io/duitgue-mahasiswa/](https://unknowncore0.github.io/duitgue-mahasiswa/)
- **Netlify**: [https://duitgue-mahasiswa.netlify.app/](https://duitgue-mahasiswa.netlify.app/)

## 📱 Cara Install PWA
1. Buka link Live Demo di browser HP (Chrome/Safari).
2. **Android**: Ketuk menu titik tiga -> pilih **"Install App"** atau **"Add to Home Screen"**.
3. **iOS (Safari)**: Ketuk ikon **Share** (kotak dengan panah ke atas) -> pilih **"Add to Home Screen"**.
4. Aplikasi akan muncul di layar utama dan siap digunakan seperti aplikasi *native*.

---
*Dibuat untuk memenuhi tugas/proyek pribadi pengembangan web.*
*Dikembangkan dengan ❤️ oleh [UnknownCore0](https://github.com/UnknownCore0)*
