/* MY HOMS — Service Worker (dibuat otomatis oleh build_gh.py, versi 1.37.3). */
const CACHE_NAME = 'myhoms-1-37-3-231f9f';
const PRECACHE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './assets/style.c3118d52eb.css', './assets/app.231f9ff5fe.js'];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (c) { return c.addAll(PRECACHE); }));
  self.skipWaiting();
});
self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { if (k !== CACHE_NAME) return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;            // POST ke GAS dan lainnya: langsung jaringan
  const url = new URL(event.request.url);
  if (url.hostname.indexOf('script.google') >= 0 || url.hostname.indexOf('googleusercontent') >= 0) return;
  if (url.origin === location.origin && url.pathname.endsWith('/config.js')) {
    event.respondWith(fetch(event.request).catch(function () { return caches.match(event.request); }));
    return;
  }
  if (url.origin === location.origin && url.pathname.indexOf('/assets/') >= 0) {
    event.respondWith(caches.match(event.request).then(function (hit) {
      return hit || fetch(event.request).then(function (res) {
        if (res && res.status === 200) caches.open(CACHE_NAME).then(function (c) { c.put(event.request, res.clone()); });
        return res;
      });
    }));
    return;
  }
  event.respondWith(fetch(event.request).then(function (res) {  // index.html, font, CDN: jaringan dulu
    if (res && res.status === 200 && url.origin === location.origin) caches.open(CACHE_NAME).then(function (c) { c.put(event.request, res.clone()); });
    return res;
  }).catch(function () { return caches.match(event.request); }));
});
