const CACHE_NAME = 'duitgue-v1'; // Naikkan versi ini setiap kali update kode
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Simpan file ke cache saat pertama kali di-install
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Paksa Service Worker baru langsung aktif
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Hapus cache lama saat Service Worker baru aktif
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Ambil kendali atas halaman yang sedang terbuka
});

// Strategi: Network First, Fallback to Cache (Selalu cek server dulu)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Jika berhasil ambil dari server, simpan ke cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Jika offline/gagal, ambil dari cache
        return caches.match(e.request);
      })
  );
});