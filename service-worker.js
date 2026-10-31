const CACHE_NAME = 'pwta-app-v1'; // (Jab bhi aap naya code update karein, iske aage v2, v3, v4 karte jaayein)
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './logo.png.jpeg'
];

// Install Event: Naya data save karna
self.addEventListener('install', (e) => {
  self.skipWaiting(); // 🔥 Ye line naya update turant laga degi
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate Event: Purana data delete karna
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // 🔥 Purana cache delete
          }
        })
      );
    }).then(() => self.clients.claim()) // 🔥 Naya update turant apply
  );
});

// Fetch Event: Internet check karna (Network First Strategy)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      // Agar internet nahi hai, toh saved data dikhao
      return caches.match(e.request);
    })
  );
});
