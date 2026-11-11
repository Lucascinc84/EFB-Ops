/* EFB service worker — app shell offline, network-first for the page so updates arrive */
const CACHE="efb-v1";
const SHELL=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","apple-touch-icon.png"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET") return;
  if(u.origin===location.origin){
    if(e.request.mode==="navigate"||u.pathname.endsWith("index.html")){
      e.respondWith(fetch(e.request).then(r=>{ const c=r.clone(); caches.open(CACHE).then(x=>x.put("index.html",c)); return r; }).catch(()=>caches.match("index.html")));
    } else {
      e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{ const c=n.clone(); caches.open(CACHE).then(x=>x.put(e.request,c)); return n; })));
    }
  } else if(u.hostname.endsWith("gstatic.com")||u.hostname.endsWith("googleapis.com")){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{ const c=n.clone(); caches.open(CACHE).then(x=>x.put(e.request,c)); return n; }).catch(()=>r)));
  }
});
