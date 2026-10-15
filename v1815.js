/* SharkHabits V18.15 — flexible scheduling and scaled cumulative rewards */
(()=>{
'use strict';
const day=d=>new Date(d+'T12:00'),isoDay=d=>iso(d),shift=(d,n)=>{let x=day(d);x.setDate(x.getDate()+n);return isoDay(x)};
const goal=id=>data.goals.find(g=>String(g.id)===String(id));
const pauseAt=(g,d)=>!!g.pausedFrom&&d>=g.pausedFrom&&(!g.pausedUntil||d<=g.pausedUntil);
const moveAt=(g,d)=>(g.moves||[]).find(m=>m.from===d);
const moveTo=(g,d)=>(g.moves||[]).some(m=>m.to===d);
const originalScheduled=scheduledOn;
scheduledOn=function(g,d){if(pauseAt(g,d))return false;if(moveAt(g,d))return false;return moveTo(g,d)||originalScheduled(g,d)};
const originalReward=reward;
const units={page:50,pages:50,km:5,kilometre:5,kilomètre:5,minute:60,minutes:60,min:60,heure:2,heures:2,h:2,fois:10,repetition:30,'répétition':30};
function unitScale(g){const u=String(g.unit||'').toLowerCase().trim();return units[u]||Math.max(1,+g.target||1)}
function coefficient(g){
 const target=Math.max(1,+g.target||1),scale=unitScale(g),period=g.repeat==='week'?1:g.repeat==='month'?4:g.repeat==='day'?1/7:Math.max(1,Math.round((day(g.deadline||today())-day(g.created||today()))/86400000/7));
 const intensity=target/scale/Math.max(.2,period);
 return Math.min(2.5,Math.max(1,Math.round((1+Math.log2(Math.max(1,intensity))/4)*4)/4));
}
function periodKey(g,date){const [a]=bounds(g,date);return g.id+':'+(g.repeat==='day'?date:g.repeat==='week'||g.repeat==='month'?a:(g.deadline||a))}
function earned(g,date){
 const value=Math.max(0,Math.min(+g.target||1,current(g,date))),target=Math.max(1,+g.target||1),rate=value/target;
 const base=g.repeat==='month'?25:g.repeat==='week'?15:20,bonus=g.repeat==='month'?10:g.repeat==='week'?5:10;
 const scale=coefficient(g),progress=Math.round(base*scale*Math.pow(rate,1.35));
 const started=value>0?Math.max(1,progress):0;
 return started+(rate>=1?Math.round(bonus*scale):0);
}
function reconcile(g,date){
 if(!g||g.type!=='cumulative')return 0;
 data.rewardLedger||={};
 const key=periodKey(g,date),old=+data.rewardLedger[key]||0,amount=earned(g,date),delta=amount-old;
 if(delta){data.rewardLedger[key]=amount;data.teeth=Math.max(0,data.teeth+delta)}
 return delta;
}
reward=function(g,date){if(g?.type==='cumulative'){if(date>today())return;reconcile(g,date);return}return originalReward(g,date)};
function reconcileAll(){
 data.rewardLedger||={};
 for(const g of data.goals.filter(x=>x.type==='cumulative')){
  const periods=new Map();
  for(const e of data.entries.filter(e=>e.goal===g.id&&e.date<=today()))periods.set(periodKey(g,e.date),e.date);
  for(const d of periods.values())reconcile(g,d);
 }
 save();
}
reconcileAll();
function promptPause(g){
 const start=today(),until=prompt('Pause jusqu’au (AAAA-MM-JJ). Laisse vide pour une pause sans fin.',shift(start,7));
 if(until===null)return;
 if(until&&!/^\d{4}-\d{2}-\d{2}$/.test(until)){alert('Date invalide');return}
 g.pausedFrom=start;g.pausedUntil=until||'';save();render();
}
function promptMove(g){
 const from=selectedDate,to=prompt('Reporter au (AAAA-MM-JJ)',shift(from,1));
 if(!to)return;if(!/^\d{4}-\d{2}-\d{2}$/.test(to)||to<=from){alert('Choisis une date future valide.');return}
 const collision=originalScheduled(g,to)||moveTo(g,to);
 if(collision&&!confirm('Une séance est déjà prévue à cette date. OK : cumuler les deux séances. Annuler : ne pas reporter.'))return;
 g.moves||=[];g.moves=g.moves.filter(m=>m.from!==from);g.moves.push({from,to});save();render();
}
const oldTask=window.__v1811?.compactTask;
function decorate(){
 document.querySelectorAll('.v1811Task[data-detail]').forEach(el=>{
  if(el.querySelector('.v1815Actions'))return;
  const g=goal(el.dataset.detail);if(!g)return;
  const actions=document.createElement('div');actions.className='v1815Actions';
  actions.innerHTML='<button type="button" data-v1815-menu="'+g.id+'" aria-label="Actions de l’objectif">•••</button>';
  el.appendChild(actions);
  if(g.type==='cumulative'){
   const v=current(g,selectedDate),c=coefficient(g);
   const small=el.querySelector('.v1811Text small');if(small)small.textContent+=' · Difficulté ×'+c.toLocaleString('fr-FR');
  }
 });
 const list=document.getElementById('todayGroups');if(!list)return;
 const paused=data.goals.filter(g=>!g.archived&&pauseAt(g,selectedDate));
 if(paused.length){
  const s=document.createElement('section');s.className='v1815Paused';
  s.innerHTML='<strong>En pause · '+paused.length+'</strong>'+paused.map(g=>'<div><span>⏸ '+g.name+'</span><button data-v1815-resume="'+g.id+'">Reprendre</button></div>').join('');
  list.appendChild(s);
 }
}
const previous=renderToday;
renderToday=function(){previous();decorate()};
document.addEventListener('click',e=>{
 const menu=e.target.closest('[data-v1815-menu]'),resume=e.target.closest('[data-v1815-resume]');
 if(resume){e.preventDefault();e.stopImmediatePropagation();const g=goal(resume.dataset.v1815Resume);if(g){delete g.pausedFrom;delete g.pausedUntil;save();render()}return}
 if(!menu)return;
 e.preventDefault();e.stopImmediatePropagation();
 const g=goal(menu.dataset.v1815Menu);if(!g)return;
 const action=prompt('Actions pour '+g.name+' :\n1 — Reporter cette séance\n2 — Mettre en pause\n3 — Reprendre\n4 — Annuler un report','1');
 if(action==='1')promptMove(g);
 if(action==='2')promptPause(g);
 if(action==='3'){delete g.pausedFrom;delete g.pausedUntil;save();render()}
 if(action==='4'){g.moves=(g.moves||[]).filter(m=>m.from!==selectedDate);save();render()}
},true);
renderToday();
window.__v1815={version:'18.15',coefficient,earned,reconcile,pauseAt,moveAt,moveTo};
})();