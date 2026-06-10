const CACHE='svns-stats-v1';
const ASSETS=['/','/index.html','/manifest.webmanifest','/icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||caches.match('/'))));});
