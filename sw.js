// Caches the app shell so it opens instantly; live bike-lane, street and search data always come from the network.
const CACHE = 'abr-v2';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './icon-192.png', './apple-touch-icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (e.request.method !== 'GET') return;
  const isShell = SHELL.some(s => url.endsWith(s.replace('./', '/')) || url === s) || e.request.mode === 'navigate';
  if (!isShell) return; // data, tiles, search: straight to network
  // network first for the page (so updates show up), cache as fallback
  e.respondWith(
    fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
