/* SharkHabits V18.11 — one-off goal compatibility */
(()=>{
'use strict';
const form=document.getElementById('goalForm'),ONE='oneoff';
function installOneOff(){
 if(!form)return;
 const sel=form.elements.type;
 if(sel&&![...sel.options].some(o=>o.value===ONE)){const o=document.createElement('option');o.value=ONE;o.textContent='Ponctuel';sel.appendChild(o)}
 const chooser=form.querySelector('.v183Types');
 if(chooser&&!chooser.querySelector('[data-type="oneoff"]'))chooser.insertAdjacentHTML('beforeend','<button type="button" class="v183Type v188OneOff" data-type="oneoff"><b>●</b><strong>Ponctuel</strong><small>Une fois, un jour</small></button>');
}
function applyOneOff(){
 if(!form)return;const on=form.elements.type?.value===ONE;form.classList.toggle('v188OneOffForm',on);if(!on)return;
 const set=(n,v)=>{if(form.elements[n])form.elements[n].value=v};
 set('target',1);set('unit','fois');set('repeat','once');set('direction','increase');set('rule','atleast');set('scheduleMode','period');set('timesPerWeek',1);
 const title=document.getElementById('goalDialogTitle');if(title)title.textContent='Ajouter un objectif ponctuel';
 form.querySelectorAll('.v183Type').forEach(b=>b.classList.toggle('active',b.dataset.type===ONE));
 const dl=form.querySelector('[data-v="deadline"]');if(dl)dl.hidden=false;
 let n=1;form.querySelectorAll('.v183Section').forEach(s=>{if(getComputedStyle(s).display==='none')return;const i=s.querySelector('.v183Step');if(i)i.textContent=n++});
}
installOneOff();
document.getElementById('goalDialog')?.addEventListener('toggle',()=>{installOneOff();setTimeout(applyOneOff,0)});
document.addEventListener('click',e=>{const b=e.target.closest('[data-type="oneoff"]');if(!b)return;e.preventDefault();e.stopPropagation();installOneOff();form.elements.type.value=ONE;applyOneOff()},true);
form?.addEventListener('input',()=>setTimeout(applyOneOff,0));form?.addEventListener('change',()=>setTimeout(applyOneOff,0));
const oldBounds=bounds;bounds=function(g,dateStr=selectedDate){return g?.type===ONE&&g.deadline?[g.deadline,g.deadline]:oldBounds(g,dateStr)};
const oldScheduled=scheduledOn;scheduledOn=function(g,dateStr){return g?.type===ONE?Boolean(g.deadline)&&g.deadline===dateStr:oldScheduled(g,dateStr)};
const oldMeta=typeMeta;typeMeta=function(g){return g?.type===ONE?{icon:'●',label:'PONCTUEL',cls:'oneoff'}:oldMeta(g)};
const oldPeriod=periodLabel;periodLabel=function(g){return g?.type===ONE?'ce jour':oldPeriod(g)};
setTimeout(()=>{installOneOff();applyOneOff()},0);
window.__v188={version:'18.11',applyOneOff};
})();