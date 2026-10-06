/* SharkHabits V18.8 — swipe weeks, movable ocean decor, one-off goals */
(()=>{
'use strict';
const form=document.getElementById('goalForm');
const week=document.getElementById('week');
const ONE='oneoff';

function installOneOff(){
  if(!form)return;
  const sel=form.elements.type;
  if(sel && ![...sel.options].some(o=>o.value===ONE)){
    const o=document.createElement('option'); o.value=ONE; o.textContent='Ponctuel'; sel.appendChild(o);
  }
  const chooser=form.querySelector('.v183Types');
  if(chooser && !chooser.querySelector('[data-type="oneoff"]')){
    chooser.insertAdjacentHTML('beforeend','<button type="button" class="v183Type v188OneOff" data-type="oneoff"><b>●</b><strong>Ponctuel</strong><small>Une fois, un jour</small></button>');
  }
}
function applyOneOff(){
  if(!form)return;
  const on=form.elements.type?.value===ONE;
  form.classList.toggle('v188OneOffForm',on);
  if(!on)return;
  const set=(n,v)=>{if(form.elements[n])form.elements[n].value=v};
  set('target',1); set('unit','fois'); set('repeat','once'); set('direction','increase');
  set('rule','atleast'); set('scheduleMode','period'); set('timesPerWeek',1);
  const title=document.getElementById('goalDialogTitle'); if(title)title.textContent='Ajouter un objectif ponctuel';
  form.querySelectorAll('.v183Type').forEach(b=>b.classList.toggle('active',b.dataset.type===ONE));
  const dl=form.querySelector('[data-v="deadline"]'); if(dl)dl.hidden=false;
  let n=1; form.querySelectorAll('.v183Section').forEach(s=>{if(getComputedStyle(s).display==='none')return;const i=s.querySelector('.v183Step');if(i)i.textContent=n++});
}
installOneOff();
const goalDialog=document.getElementById('goalDialog');
if(goalDialog){
  const mo=new MutationObserver(()=>{installOneOff();applyOneOff()});
  mo.observe(goalDialog,{attributes:true,subtree:true,childList:true});
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-type="oneoff"]');
  if(!b)return;
  e.preventDefault(); e.stopPropagation();
  installOneOff();
  form.elements.type.value=ONE;
  applyOneOff();
},true);
form?.addEventListener('input',()=>setTimeout(applyOneOff,0));
form?.addEventListener('change',()=>setTimeout(applyOneOff,0));

try{
  const oldScheduled=scheduledOn;
  scheduledOn=function(g,dateStr){
    if(g?.type===ONE)return Boolean(g.deadline)&&g.deadline===dateStr;
    return oldScheduled(g,dateStr);
  };
  const oldMeta=typeMeta;
  typeMeta=function(g){
    if(g?.type===ONE)return {icon:'●',label:'PONCTUEL',cls:'oneoff'};
    return oldMeta(g);
  };
  const oldPeriod=periodLabel;
  periodLabel=function(g){return g?.type===ONE?'ce jour':oldPeriod(g)};
}catch(err){console.warn('[V18.8] goal hooks',err)}

/* Swipe horizontally to move by one week. */
if(week){
  let x0=null,y0=null,t0=0;
  week.style.touchAction='pan-y';
  week.addEventListener('pointerdown',e=>{x0=e.clientX;y0=e.clientY;t0=Date.now()});
  week.addEventListener('pointerup',e=>{
    if(x0==null)return;
    const dx=e.clientX-x0,dy=e.clientY-y0,dt=Date.now()-t0; x0=y0=null;
    if(Math.abs(dx)<45||Math.abs(dx)<Math.abs(dy)*1.25||dt>900)return;
    const d=new Date(selectedDate+'T12:00'); d.setDate(d.getDate()+(dx<0?7:-7)); selectedDate=iso(d); renderToday();
  });
}

/* Ocean editor: drag every placed decoration and persist its position. */
let drag=null, moved=false;
function annotateDecor(){
  const scene=document.getElementById('livingScene'); if(!scene||!Array.isArray(data?.placed))return;
  const old=[...scene.querySelectorAll('.livingOldDecor')];
  const oldPlaced=data.placed.filter(p=>!window.SHARKHABITS_LIVING_DECORS?.some(x=>x.id===p.decor) && !['clownfish','bluefish','school','turtle','babyturtle'].includes(p.decor));
  old.forEach((el,i)=>{if(oldPlaced[i])el.dataset.moveDecor=oldPlaced[i].id});
  scene.querySelectorAll('.livingDecor[data-remove-extra]').forEach(el=>el.dataset.moveDecor=el.dataset.removeExtra);
}
const ocean=document.getElementById('ocean');
if(ocean){
  new MutationObserver(annotateDecor).observe(ocean,{childList:true,subtree:true});
  ocean.addEventListener('pointerdown',e=>{
    const el=e.target.closest('[data-move-decor]'); if(!el)return;
    const scene=document.getElementById('livingScene'); if(!scene)return;
    const p=data.placed.find(x=>String(x.id)===String(el.dataset.moveDecor)); if(!p)return;
    drag={el,p,scene,id:e.pointerId}; moved=false; el.setPointerCapture?.(e.pointerId); el.classList.add('dragging'); e.preventDefault();
  });
  ocean.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    const r=drag.scene.getBoundingClientRect();
    let x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;
    x=Math.max(5,Math.min(95,x)); y=Math.max(4,Math.min(92,y));
    drag.p.x=x; drag.p.y=y; drag.el.style.left=x+'%'; drag.el.style.top=y+'%'; moved=true; e.preventDefault();
  });
  const finish=e=>{
    if(!drag||e.pointerId!==drag.id)return;
    drag.el.classList.remove('dragging'); if(moved)save(); drag=null;
  };
  ocean.addEventListener('pointerup',finish); ocean.addEventListener('pointercancel',finish);
  ocean.addEventListener('click',e=>{
    if(moved){e.preventDefault();e.stopPropagation();moved=false;return}
    const el=e.target.closest('[data-move-decor]'); if(!el)return;
    const drawer=document.getElementById('livingDrawer');
    if(!drawer?.classList.contains('open'))return;
    e.preventDefault();e.stopImmediatePropagation();
    if(confirm('Retirer cette décoration de l’océan ?')){
      const p=data.placed.find(x=>String(x.id)===String(el.dataset.moveDecor));
      if(p){data.placed=data.placed.filter(x=>x!==p);data.inventory[p.decor]=(data.inventory[p.decor]||0)+1;save();render();}
    }
  },true);
}
setTimeout(()=>{installOneOff();applyOneOff();annotateDecor()},0);
window.__v188={version:'18.8',applyOneOff,annotateDecor};
})();