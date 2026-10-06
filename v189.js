/* SharkHabits V18.9 — infinite dates + clear Ocean buy/edit modes */
(()=>{
'use strict';
/* Continuous date rail: 121 days, centered on selected date, extended as needed. */
const week=document.getElementById('week'), nav=document.querySelector('.dateNavigator'), range=document.getElementById('weekRange');
let railStart=null,railEnd=null,railBusy=false;
const D=86400000, dateObj=s=>new Date(s+'T12:00');
function dayHTML(d){const id=iso(d),done=data.goals.some(g=>data.entries.some(e=>e.goal===g.id&&e.date===id));return '<button class="day '+(id===selectedDate?'active ':'')+(done?'done':'')+'" data-date="'+id+'"><span>'+d.toLocaleDateString('fr-FR',{weekday:'short'}).replace('.','').toUpperCase()+'</span><b>'+d.getDate()+'</b><small>'+d.toLocaleDateString('fr-FR',{month:'short'}).replace('.','')+'</small></button>'}
function buildRail(center=selectedDate){
 if(!week)return; const c=dateObj(center); railStart=new Date(c.getTime()-60*D);railEnd=new Date(c.getTime()+60*D);
 week.innerHTML=Array.from({length:121},(_,i)=>dayHTML(new Date(railStart.getTime()+i*D))).join('');
 requestAnimationFrame(()=>centerSelected(false));
}
function centerSelected(smooth=true){const el=week?.querySelector('[data-date="'+selectedDate+'"]');if(!el)return;railBusy=true;el.scrollIntoView({behavior:smooth?'smooth':'auto',inline:'center',block:'nearest'});setTimeout(()=>railBusy=false,smooth?400:30)}
function extendRail(){
 if(!week||railBusy)return;
 if(week.scrollLeft<week.clientWidth*1.2){const before=week.scrollWidth,arr=[];for(let i=30;i>=1;i--)arr.push(dayHTML(new Date(railStart.getTime()-i*D)));week.insertAdjacentHTML('afterbegin',arr.join(''));railStart=new Date(railStart.getTime()-30*D);week.scrollLeft+=week.scrollWidth-before}
 if(week.scrollWidth-week.scrollLeft-week.clientWidth<week.clientWidth*1.2){let arr=[];for(let i=1;i<=30;i++)arr.push(dayHTML(new Date(railEnd.getTime()+i*D)));week.insertAdjacentHTML('beforeend',arr.join(''));railEnd=new Date(railEnd.getTime()+30*D)}
}
if(nav)nav.remove(); if(range)range.remove();
if(week){week.classList.add('v189DateRail');buildRail();week.addEventListener('scroll',extendRail,{passive:true});week.addEventListener('click',e=>{const b=e.target.closest('[data-date]');if(!b)return;setTimeout(()=>{week.querySelectorAll('.day').forEach(x=>x.classList.toggle('active',x.dataset.date===selectedDate));centerSelected(true)},0)},true)}
const oldRenderToday=window.renderToday;
if(typeof oldRenderToday==='function')window.renderToday=function(){const left=week?.scrollLeft||0;oldRenderToday();if(week){buildRail(selectedDate);if(left&&!week.querySelector('[data-date="'+selectedDate+'"]'))week.scrollLeft=left}};

/* Ocean: purchasing and aquarium editing are deliberately separate. */
let oceanMode='view';
const EX=()=>window.SHARKHABITS_LIVING_DECORS||[];
const bad=new Set(['clownfish','bluefish','school','turtle','babyturtle']);
const allDecor=()=>[...DECORS.filter(d=>!bad.has(d.id)),...EX()];
const def=id=>allDecor().find(d=>d.id===id);
const visual=d=>d.img?'<img src="'+d.img+'" alt="'+d.name+'">':'<span>'+(d.emoji||'🪸')+'</span>';
function inventoryCount(id){return data.inventory?.[id]||0}
function refreshControls(){
 const c=document.querySelector('.livingControls');if(!c)return;
 c.innerHTML='<button id="oceanBuy">🛍 Acheter</button><button id="oceanEdit">✦ Modifier l’aquarium</button><button id="livingSharks">🦈 Requins</button>';
}
function buyDrawer(){
 oceanMode='buy';const dr=document.getElementById('livingDrawer');if(!dr)return;dr.classList.add('open');
 dr.innerHTML='<div class="drawerHead"><div><strong>Boutique</strong><small>Les achats vont dans ton inventaire.</small></div><button data-close-drawer>✕</button></div><div class="livingShop">'+allDecor().map(d=>'<button data-v189-buy="'+d.id+'">'+visual(d)+'<b>'+d.name+'</b><small>🦷 '+d.cost+' · Possédé '+inventoryCount(d.id)+'</small></button>').join('')+'</div>';
}
function editDrawer(){
 oceanMode='edit';const dr=document.getElementById('livingDrawer');if(!dr)return;dr.classList.add('open');
 const inv=allDecor().filter(d=>inventoryCount(d.id)>0);
 dr.innerHTML='<div class="drawerHead"><div><strong>Modifier l’aquarium</strong><small>Place puis déplace les objets directement dans l’océan.</small></div><button data-close-drawer>✕</button></div><div class="livingShop">'+(inv.map(d=>'<button data-v189-place="'+d.id+'">'+visual(d)+'<b>'+d.name+'</b><small>'+inventoryCount(d.id)+' disponible'+(inventoryCount(d.id)>1?'s':'')+' · Placer</small></button>').join('')||'<p class="drawerHint">Ton inventaire est vide. Passe par Acheter pour obtenir des décorations.</p>')+'</div><small class="drawerHint">Touchez un objet placé pour le retirer. Faites-le glisser pour le déplacer.</small>';
}
function place(id){const d=def(id);if(!d||inventoryCount(id)<1)return;data.inventory[id]--;const z=d.zone||'floor',y=z==='surface'?12:z==='mid'?45:72;data.placed.push({id:uid(),decor:id,x:20+Math.random()*60,y});save();render();setTimeout(editDrawer,0)}
document.addEventListener('click',e=>{
 if(e.target.closest('[data-page="ocean"]'))setTimeout(refreshControls,20);
 if(e.target.closest('#oceanBuy')){e.preventDefault();e.stopImmediatePropagation();buyDrawer();return}
 if(e.target.closest('#oceanEdit')){e.preventDefault();e.stopImmediatePropagation();editDrawer();return}
 const buy=e.target.closest('[data-v189-buy]');if(buy){e.preventDefault();e.stopImmediatePropagation();const d=def(buy.dataset.v189Buy);if(!d)return;if(data.teeth<d.cost)return alert('Pas assez de dents.');data.teeth-=d.cost;data.inventory[d.id]=(data.inventory[d.id]||0)+1;save();render();setTimeout(buyDrawer,0);return}
 const pl=e.target.closest('[data-v189-place]');if(pl){e.preventDefault();e.stopImmediatePropagation();place(pl.dataset.v189Place);return}
 const obj=e.target.closest('[data-move-decor]');if(obj&&oceanMode==='edit'&&!obj.classList.contains('dragging')){const p=data.placed.find(x=>String(x.id)===String(obj.dataset.moveDecor));if(p&&confirm('Remettre cette décoration dans l’inventaire ?')){data.placed=data.placed.filter(x=>x!==p);data.inventory[p.decor]=(data.inventory[p.decor]||0)+1;save();render();setTimeout(editDrawer,0)}}
},true);
const obs=new MutationObserver(()=>refreshControls());const ocean=document.getElementById('ocean');if(ocean)obs.observe(ocean,{childList:true});
setTimeout(refreshControls,30);
window.__v189={version:'18.9',buildRail,buyDrawer,editDrawer};
})();