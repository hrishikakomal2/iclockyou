const CACHE='iclockyou-v10';
const FILES=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
const CIACT={wake:[['yes',"I'm awake"],['snooze','Snooze']],breakfast:[['yes','Yes'],['later','Later']],work:[['yes','Start work'],['wfh','Working from home']],lunch:[['yes','Yes'],['later','Later']],workend:[['yes',"I'm done"],['late','Working late']],dinner:[['yes','Yes'],['later','Later']],sleep:[['yes','Going to sleep'],['notyet','Not yet']],exercise:[['yes','Yes'],['later','Later']]};
self.addEventListener('push',e=>{
  let d={};
  try{d=e.data?e.data.json():{}}catch(_){d={title:'I Clock You',body:e.data?e.data.text():''}}
  const tag=d.tag||'iclock',kind=tag.indexOf('ci-')===0?tag.slice(3):'';
  const actions=kind&&CIACT[kind]?CIACT[kind].map(a=>({action:a[0],title:a[1]})):[];
  e.waitUntil(self.registration.showNotification(d.title||'I Clock You',{
    body:d.body||'',tag:tag,renotify:true,actions:actions,
    icon:'icons/icon-192.png',badge:'icons/icon-192.png',data:{url:'./',kind:kind}
  }));
});
self.addEventListener('notificationclick',e=>{
  const act=e.action,kind=e.notification.data&&e.notification.data.kind,ans=act&&kind;
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
    for(const c of cs){if('focus' in c){c.postMessage(ans?{t:'answer',kind:kind,opt:act}:{t:'poll'});return c.focus()}}
    return clients.openWindow(ans?'./?ans='+kind+':'+act:'./');
  }));
});
