// Jeda Report service worker: network-first, cache sbg cadangan offline.
const CACHE_NAME = "jeda-report-v4";
const ASSETS = ["./", "./index.html", "./manifest.json", "./logo.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  // Data Apps Script selalu langsung ke jaringan (tidak di-cache).
  if(url.hostname.indexOf("script.google") >= 0 || url.hostname.indexOf("googleusercontent") >= 0) return;
  e.respondWith(
    fetch(req).then(res => {
      if(res && res.status === 200 && (url.origin === self.location.origin || url.hostname.indexOf("cdnjs") >= 0 || url.hostname.indexOf("fonts.g") >= 0)){
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
  );
});
