// Bei jeder Änderung an der App die Versionsnummer erhöhen (v6 -> v7 ...)
const CACHE = 'kochbuch-v6';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Eigene Dateien: erst Netzwerk (immer aktuell), offline aus dem Cache.
// Fremde Dateien (z. B. Schriften): erst Cache.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const same = new URL(e.request.url).origin === location.origin;
  const store = r => { if (r && (r.ok || r.type === 'opaque')) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; };
  e.respondWith(same
    ? fetch(e.request, { cache: 'no-cache' }).then(store).catch(() => caches.match(e.request).then(h => h || caches.match('./index.html')))
    : caches.match(e.request).then(h => h || fetch(e.request).then(store))
  );
});
