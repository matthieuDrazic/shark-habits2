/* SharkHabits V18.12 — Polish + weekly/max/backfill */
(()=>{
'use strict';
window.__v1812Active=true;
const DAY=86400000;
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function periodRange(g,date=selectedDate){const [a,b]=bounds(g,date);return{a,b}}
function shortDate(s){return new Date(s+'T12:00').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'}).replace('.','')}
function goal(id){return data.goals.find(g=>String(g.id)===String(id))}
function toast(msg,kind='info'){
 let n=document.getElementById('v1812Toast');if(!n){n=document.createElement('div');n.id='v1812Toast';document.body.appendChild(n)}
 n.className='show '+kind;n.textContent=msg;clearTimeout(toast.t);toast.t=setTimeout(()=>n.classList.remove('show'),1700);
}
function decorateToday(){
 const future=selectedDate>today(),past=selectedDate<today(),summary=document.querySelector('#today .summary');
 if(summary){
  let chip=document.getElementById('v1812DateState');
  if(!chip){chip=document.createElement('div');chip.id='v1812DateState';summary.appendChild(chip)}
  chip.textContent=future?'À venir · consultation uniquement':past?'Date passée · rattrapage':'Aujourd’hui';
  chip.className=future?'future':past?'past':'now';
 }
 document.querySelectorAll('.v1811Task[data-detail]').forEach(row=>{
  const g=goal(row.dataset.detail);if(!g)return;
  row.classList.toggle('v1812Maximum',g.rule==='atmost');
  row.classList.toggle('v1812Weekly',g.type==='cumulative'&&g.repeat==='week');
  const small=row.querySelector('.v1811Text small'),bar=row.querySelector('.v1811Text i span');
  if(g.type==='cumulative'&&g.repeat==='week'){
   const v=current(g,selectedDate),r=periodRange(g),unit=g.unit?' '+g.unit:'';
   if(g.rule==='atmost'){
    const left=Math.max(0,(+g.target||0)-v),over=Math.max(0,v-(+g.target||0));
    small.textContent=(over?fmt(over)+unit+' au-dessus du maximum':fmt(v)+' / '+fmt(g.target)+unit+' · reste '+fmt(left))+ ' · '+shortDate(r.a)+' → '+shortDate(r.b);
    if(bar)bar.style.width=Math.max(0,Math.min(100,100-(+g.target?100*v/+g.target:0)))+'%';
   }else small.textContent=fmt(v)+' / '+fmt(g.target)+unit+' · cette semaine · '+shortDate(r.a)+' → '+shortDate(r.b);
  }else if(g.rule==='atmost'){
   const v=current(g,selectedDate),left=Math.max(0,(+g.target||0)-v),unit=g.unit?' '+g.unit:'';
   small.textContent='Maximum '+fmt(g.target)+unit+' · utilisé '+fmt(v)+' · reste '+fmt(left);
   if(bar)bar.style.width=Math.max(0,Math.min(100,100-(+g.target?100*v/+g.target:0)))+'%';
  }
  row.querySelectorAll('button').forEach(b=>{if(future)b.disabled=true});
 });
 decorateRail();
}
function decorateRail(){
 document.querySelectorAll('.v189DateRail .day[data-date]').forEach(b=>{
  const d=b.dataset.date,gs=data.goals.filter(g=>!g.archived&&scheduledOn(g,d));
  b.classList.remove('v1812Success','v1812Partial','v1812Missed');
  if(!gs.length||d>today())return;
  let touched=gs.filter(g=>data.entries.some(e=>e.goal===g.id&&e.date===d)).length;
  let successes=gs.filter(g=>{
   if(g.rule==='atmost')return current(g,d)<=+g.target;
   if(g.type==='habit')return data.entries.some(e=>e.goal===g.id&&e.date===d&&+e.value>0);
   if(g.type==='metric')return data.entries.some(e=>e.goal===g.id&&e.date===d);
   return pct(g,d)>=100;
  }).length;
  if(successes===gs.length&&touched)b.classList.add('v1812Success');
  else if(touched)b.classList.add('v1812Partial');
  else if(d<today())b.classList.add('v1812Missed');
 });
}
const oldRenderToday=renderToday;
renderToday=function(){oldRenderToday();decorateToday()};
const oldRender=render;
render=function(){oldRender();requestAnimationFrame(()=>{decorateToday();decorateRail()})};

/* Creation UI: expose "maximum" as a first-class rule without adding a new goal type. */
function polishForm(){
 const form=document.getElementById('goalForm');if(!form)return;
 const rule=form.elements.rule;if(rule){
  [...rule.options].forEach(o=>{if(o.value==='atleast')o.textContent='Au moins — atteindre ou dépasser';if(o.value==='atmost')o.textContent='Maximum — ne pas dépasser';if(o.value==='about')o.textContent='Autour de la valeur'});
  const lab=rule.closest('label');if(lab&&!lab.querySelector('.v1812RuleHint'))lab.insertAdjacentHTML('beforeend','<small class="v1812RuleHint">Choisis « Maximum » pour limiter une quantité (ex. 2 sodas/semaine).</small>');
 }
}
polishForm();document.getElementById('goalDialog')?.addEventListener('toggle',polishForm);

/* Future dates are browse-only. Past dates deliberately keep normal add/edit controls for backfill. */
document.addEventListener('click',e=>{
 const action=e.target.closest('[data-add],[data-minus],[data-v1811-toggle]');
 if(action&&selectedDate>today()){e.preventDefault();e.stopImmediatePropagation();toast('Cette date est à venir · saisie désactivée','future');return}
 const before=data.teeth;
 if(action)setTimeout(()=>{const gain=data.teeth-before;if(gain>0)toast('+'+gain+' 🦷','reward');decorateToday()},40);
},true);

/* Make at-most semantics consistent in detail/reward logic: success is evaluated at period end. */
const oldDone=isDone;
isDone=function(g,dateStr=selectedDate){
 if(g?.rule!=='atmost')return oldDone(g,dateStr);
 const [,end]=bounds(g,dateStr);
 return dateStr>=end&&current(g,dateStr)<=+g.target;
};
renderToday();
window.__v1812={version:'18.12',decorateToday,decorateRail,toast};
})();