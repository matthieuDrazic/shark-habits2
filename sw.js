const CACHE="sharkhabits-v18.12-polish-18130";
const CORE=["./","./index.html","./style.css","./reports.css","./v18.css","./v187.css","./v188.css","./v189.css","./v1810.css","./v1811.css","./v1812.css","./app.js","./v167.js","./v169.js","./reports-runtime.js","./v18.js","./v187.js","./v188.js","./v189.js","./v1810.js","./v1811.js","./v1812.js","./v1813.js","./manifest.json","./icon.svg"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).catch(()=>{}).then(()=>self.skipWaiting()))});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET")return;
 event.respondWith(fetch(event.request,{cache:"no-store"}).then(response=>{
   if(response.ok&&new URL(event.request.url).origin===self.location.origin)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));
   return response;
 }).catch(()=>caches.match(event.request).then(hit=>hit||caches.match(new URL(event.request.url).pathname.replace(/^\//,"./")))));
});