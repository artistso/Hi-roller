const CACHE = 'hi-roller-v2';
const ASSETS = [
  './', './index.html', './css/game.css',
  './js/data.js', './js/towers.js', './js/audio.js', './js/save.js', './js/engine.js', './js/app.js',
  './assets/ui/logo.png', './assets/ui/chip.png', './assets/ui/bg-casino.png', './assets/ui/splash.png',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
