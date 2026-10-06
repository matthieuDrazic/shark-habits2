/* SharkHabits V18.10 — touch-first Ocean editor */
(()=>{
'use strict';
window.__v1810Active=true;
const BAD=new Set(['clownfish','bluefish','school','turtle','babyturtle']);
const extras=()=>window.SHARKHABITS_LIVING_DECORS||[];
const defs=()=>[...DECORS.filter(d=>!BAD.has(d.id)),...extras()];
const def=id=>defs().find(d=>d.id===id);
const placedCount=id=>data.placed.filter(p=>p.decor===id).length;
const available=id=>Math.max(0,(data.inventory?.[id]||0)-placedCount(id));
const vis=d=>d.img?'<img src="'+d.img+'" alt="'+d.name+'">':'<span>'+(d.emoji||'🪸')+'</span>';
let mode='view',selected=null,drag=null,ghost=null,undo=null,suppressInventoryClick=false;

function repairInventory(){
 data.inventory||={}; data.placed||=[];
 for(const d of defs()){const used=placedCount(d.id);if((data.inventory[d.id]||0)<used)data.inventory[d.id]=used}
 save();
}
function annotate(){
 const scene=document.getElementById('livingScene');if(!scene)return;
 const old=data.placed.filter(p=>!extras().some(x=>x.id===p.decor)&&!BAD.has(p.decor));
 [...scene.querySelectorAll('.livingOldDecor')].forEach((el,i)=>{if(old[i])el.dataset.v1810Placed=old[i].id});
 scene.querySelectorAll('.livingDecor[data-remove-extra]').forEach(el=>el.dataset.v1810Placed=el.dataset.removeExtra);
 scene.querySelectorAll('[data-v1810-placed]').forEach(el=>{el.classList.toggle('v1810Selected',el.dataset.v1810Placed===selected);const p=data.placed.find(x=>String(x.id)===String(el.dataset.v1810Placed));el.style.setProperty('--v1810-scale',p?.size==='s'?'.72':p?.size==='l'?'1.3':'1')});
}
function controls(){
 const c=document.querySelector('.livingControls');if(!c)return;
 if(mode==='edit'&&c.querySelector('#v1810Done'))return;
 if(mode!=='edit'&&c.querySelector('#v1810Buy'))return;
 if(mode==='edit')c.innerHTML='<button id="v1810Done" class="v1810Done">✓ Terminer</button>';
 else c.innerHTML='<button id="v1810Buy">🛍 Acheter</button><button id="v1810Edit">✦ Modifier</button><button id="livingSharks">🦈 Requins</button>';
}
function closeDrawer(){document.getElementById('livingDrawer')?.classList.remove('open')}
function buy(){
 mode='buy';selected=null;controls();const dr=document.getElementById('livingDrawer');if(!dr)return;dr.classList.add('open');
 dr.innerHTML='<div class="drawerHead"><div><strong>Boutique décorations</strong><small>Un achat ajoute l’objet à ton inventaire. Il ne sera pas placé automatiquement.</small></div><button data-close-drawer>✕</button></div><div class="livingShop">'+defs().map(d=>'<button data-v1810-buy="'+d.id+'">'+vis(d)+'<b>'+d.name+'</b><small>🦷 '+d.cost+' · Possédé '+(data.inventory[d.id]||0)+'</small></button>').join('')+'</div>';
}
function editor(){
 mode='edit';selected=null;document.getElementById('ocean')?.classList.add('v1810Editing');closeDrawer();controls();renderTray();annotate();
}
function renderTray(){
 let tray=document.getElementById('v1810Tray');if(!tray){tray=document.createElement('div');tray.id='v1810Tray';document.getElementById('ocean')?.appendChild(tray)}
 const items=defs().filter(d=>available(d.id)>0);
 tray.innerHTML='<div class="v1810TrayHead"><div><b>Inventaire</b><small>Glisse un objet dans l’océan ou touche-le pour le placer.</small></div></div><div class="v1810Inventory">'+(items.map(d=>'<button data-v1810-inv="'+d.id+'">'+vis(d)+'<span>'+d.name+'</span><i>×'+available(d.id)+'</i></button>').join('')||'<p>Tout ton inventaire est déjà placé.</p>')+'</div>';
 renderTools();
}
function renderTools(){
 let bar=document.getElementById('v1810Tools');if(!bar){bar=document.createElement('div');bar.id='v1810Tools';document.getElementById('ocean')?.appendChild(bar)}
 const p=data.placed.find(x=>String(x.id)===String(selected)),d=p&&def(p.decor);
 if(!p||!d){bar.classList.remove('show');bar.innerHTML='';return}
 const size=p.size||'m';
 bar.innerHTML='<div><b>'+d.name+'</b><small>Fais glisser l’objet pour le déplacer</small></div><div class="v1810ToolBtns"><button data-v1810-size="s" class="'+(size==='s'?'active':'')+'">Petit</button><button data-v1810-size="m" class="'+(size==='m'?'active':'')+'">Moyen</button><button data-v1810-size="l" class="'+(size==='l'?'active':'')+'">Grand</button><button data-v1810-remove>Retirer</button></div>';
 bar.classList.add('show');annotate();
}
function place(id,x=50,y=50){
 if(available(id)<1)return;const d=def(id);if(!d)return;
 const zone=d.zone||'floor';if(y===50)y=zone==='surface'?16:zone==='mid'?45:72;
 const p={id:uid(),decor:id,x:Math.max(6,Math.min(94,x)),y:Math.max(6,Math.min(90,y)),size:'m'};
 data.placed.push(p);selected=p.id;save();render();setTimeout(()=>{mode='edit';document.getElementById('ocean')?.classList.add('v1810Editing');controls();renderTray();annotate()},0);
}
function removeSelected(){
 const i=data.placed.findIndex(x=>String(x.id)===String(selected));if(i<0)return;
 undo={p:data.placed[i],until:Date.now()+5000};data.placed.splice(i,1);selected=null;save();render();
 setTimeout(()=>{mode='edit';document.getElementById('ocean')?.classList.add('v1810Editing');controls();renderTray();showUndo()},0);
}
function showUndo(){
 let n=document.getElementById('v1810Undo');if(!n){n=document.createElement('div');n.id='v1810Undo';document.getElementById('ocean')?.appendChild(n)}
 if(!undo||Date.now()>undo.until){n.remove();undo=null;return}
 n.innerHTML='Décoration retirée <button data-v1810-undo>Annuler</button>';setTimeout(()=>{if(Date.now()>undo?.until){n?.remove();undo=null}},5100);
}
function finish(){mode='view';selected=null;document.getElementById('ocean')?.classList.remove('v1810Editing');document.getElementById('v1810Tray')?.remove();document.getElementById('v1810Tools')?.remove();document.getElementById('v1810Undo')?.remove();controls();annotate()}

function sceneXY(e,scene){const r=scene.getBoundingClientRect();return{x:Math.max(5,Math.min(95,(e.clientX-r.left)/r.width*100)),y:Math.max(5,Math.min(91,(e.clientY-r.top)/r.height*100))}}
function startPlaced(e,el){
 if(mode!=='edit')return;const p=data.placed.find(x=>String(x.id)===String(el.dataset.v1810Placed));if(!p)return;
 selected=p.id;renderTools();const pt=sceneXY(e,document.getElementById('livingScene'));drag={kind:'placed',id:e.pointerId,p,el,dx:(p.x??pt.x)-pt.x,dy:(p.y??pt.y)-pt.y,moved:false};el.setPointerCapture?.(e.pointerId);el.classList.add('dragging');e.preventDefault();
}
function startInventory(e,b){
 if(mode!=='edit')return;const id=b.dataset.v1810Inv;if(available(id)<1)return;
 drag={kind:'inventory',id:e.pointerId,decor:id,moved:false};ghost=document.createElement('div');ghost.className='v1810Ghost';ghost.innerHTML=vis(def(id));document.body.appendChild(ghost);moveGhost(e);b.setPointerCapture?.(e.pointerId);e.preventDefault();
}
function moveGhost(e){if(ghost){ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px'}}
function move(e){
 if(!drag||e.pointerId!==drag.id)return;
 if(drag.kind==='inventory'){drag.moved=true;moveGhost(e);return}
 const scene=document.getElementById('livingScene'),pt=sceneXY(e,scene);drag.p.x=Math.max(5,Math.min(95,pt.x+drag.dx));drag.p.y=Math.max(5,Math.min(91,pt.y+drag.dy));drag.el.style.left=drag.p.x+'%';drag.el.style.top=drag.p.y+'%';drag.moved=true;e.preventDefault();
}
function end(e){
 if(!drag||e.pointerId!==drag.id)return;
 if(drag.kind==='placed'){drag.el.classList.remove('dragging');if(drag.moved)save();else{selected=drag.p.id;renderTools()}}
 else{const scene=document.getElementById('livingScene'),r=scene?.getBoundingClientRect();suppressInventoryClick=drag.moved;if(r&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom){const pt=sceneXY(e,scene);place(drag.decor,pt.x,pt.y)}else if(!drag.moved)place(drag.decor)}
 ghost?.remove();ghost=null;drag=null;
}
document.addEventListener('click',e=>{
 if(e.target.closest('[data-page="ocean"]'))setTimeout(()=>{mode='view';controls();annotate()},30);
 if(e.target.closest('#v1810Buy')){e.preventDefault();buy();return}
 if(e.target.closest('#v1810Edit')){e.preventDefault();editor();return}
 if(e.target.closest('#v1810Done')){e.preventDefault();finish();return}
 const b=e.target.closest('[data-v1810-buy]');if(b){e.preventDefault();const d=def(b.dataset.v1810Buy);if(!d)return;if(data.teeth<d.cost)return alert('Pas assez de dents.');data.teeth-=d.cost;data.inventory[d.id]=(data.inventory[d.id]||0)+1;save();render();setTimeout(buy,0);return}
 const inv=e.target.closest('[data-v1810-inv]');if(inv&&mode==='edit'&&!drag){e.preventDefault();if(suppressInventoryClick){suppressInventoryClick=false;return}place(inv.dataset.v1810Inv);return}
 const size=e.target.closest('[data-v1810-size]');if(size){const p=data.placed.find(x=>String(x.id)===String(selected));if(p){p.size=size.dataset.v1810Size;save();annotate();renderTools()}return}
 if(e.target.closest('[data-v1810-remove]')){removeSelected();return}
 if(e.target.closest('[data-v1810-undo]')&&undo){data.placed.push(undo.p);selected=undo.p.id;undo=null;save();render();setTimeout(editor,0)}
},true);
const ocean=document.getElementById('ocean');
if(ocean){
 ocean.addEventListener('pointerdown',e=>{const p=e.target.closest('[data-v1810-placed]');if(p)return startPlaced(e,p);const i=e.target.closest('[data-v1810-inv]');if(i)return startInventory(e,i)},true);
 ocean.addEventListener('pointermove',move,true);ocean.addEventListener('pointerup',end,true);ocean.addEventListener('pointercancel',end,true);
 new MutationObserver(()=>{annotate();controls();if(mode==='edit'){ocean.classList.add('v1810Editing');if(!document.getElementById('v1810Tray'))renderTray()}}).observe(ocean,{childList:true,subtree:true});
}
repairInventory();setTimeout(()=>{controls();annotate()},50);
window.__v1810={version:'18.10',editor,buy,finish,available};
})();