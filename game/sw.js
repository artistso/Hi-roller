const CACHE = 'hi-roller-v3';
const ASSETS = [
  './', './index.html', './manifest.json', './css/game.css',
  './js/data.js', './js/towers.js', './js/audio.js', './js/save.js', './js/engine.js', './js/app.js',
  './assets/ui/logo.png', './assets/ui/chip.png', './assets/ui/bg-casino.png', './assets/ui/splash.png',
  './assets/avatars/avatar-01.png', './assets/avatars/avatar-02.png', './assets/avatars/avatar-03.png',
  './assets/avatars/avatar-04.png', './assets/avatars/avatar-05.png', './assets/avatars/avatar-06.png',
  './assets/avatars/avatar-07.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      }
      return response;
    })),
  );
});
