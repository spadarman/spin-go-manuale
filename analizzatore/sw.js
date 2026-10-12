// Service worker dell'analizzatore. Versione = impronta della pagina: ogni build nuova sostituisce la cache.
const CACHE = 'analizzatore-3e7b6cf3a87a';
const FILE = ["./","index.html","manifest.webmanifest","icone/icona-192.png","icone/icona-512.png","icone/icona-maskable-512.png","icone/apple-touch-icon.png"];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x.startsWith('analizzatore-') && x !== CACHE && x !== 'analizzatore-caratteri').map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // pagina: prima la rete (per avere gli aggiornamenti), senza rete la copia salvata
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((r) => { const copia = r.clone(); caches.open(CACHE).then((c) => c.put('index.html', copia)); return r; }).catch(() => caches.match('index.html')));
    return;
  }
  // caratteri di Google: salvati al primo uso
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open('analizzatore-caratteri').then((c) => c.match(req).then((h) => h || fetch(req).then((r) => { c.put(req, r.clone()); return r; }))));
    return;
  }
  if (url.origin === location.origin) e.respondWith(caches.match(req).then((h) => h || fetch(req)));
});
