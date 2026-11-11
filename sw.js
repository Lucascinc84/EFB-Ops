/* EFB service worker — app shell offline, network-first for the page so updates arrive.
   Also keeps the PDF engine and the coastlines for offline use. */
const CACHE="efb-v4";
const SHELL=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","apple-touch-icon.png"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())); });
let puts=0;
function cacheFirst(e,name,trim){
  e.respondWith(caches.open(name).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(n=>{
    if(n&&n.ok){ c.put(e.request,n.clone()); if(trim&&++puts%60===0) c.keys().then(k=>{ const extra=k.length-trim; for(let i=0;i<extra;i++) c.delete(k[i]); }); }
    return n; }).catch(()=>r||Response.error()))));
}
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET") return;
  if(u.origin===location.origin){
    if(e.request.mode==="navigate"||u.pathname.endsWith("index.html")){
      e.respondWith(fetch(e.request).then(r=>{ const c=r.clone(); caches.open(CACHE).then(x=>x.put("index.html",c)); return r; }).catch(()=>caches.match("index.html")));
    } else cacheFirst(e,CACHE);
  } else if(u.hostname.endsWith("gstatic.com")||u.hostname.endsWith("googleapis.com")||u.hostname==="cdn.jsdelivr.net"){
    cacheFirst(e,CACHE);
  }
});
