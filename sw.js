// Offline-Speicher für die App. Bei einer neuen Version die Zahl erhöhen.
const C='training-v54';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin&&u.hostname!=='cdnjs.cloudflare.com')return;
  e.respondWith(caches.open(C).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:true});
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>hit||Response.error());
    // Seite selbst: erst Internet (max. 3 s), sonst gespeicherte Version -> neueste Version schon beim 1. Öffnen
    if(r.mode==='navigate'&&hit)return Promise.race([net,new Promise(ok=>setTimeout(()=>ok(hit),3000))]);
    return hit||net;
  }));
});
