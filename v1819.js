/* SharkHabits V18.19 — reliable rewards and controlled overachievement */
(()=>{
'use strict';
const previous=reward;
const award=g=>g.type==='oneoff'||g.type==='deadline'?8:5;
const periodKey=(g,d)=>{const [start]=bounds(g,d);return g.id+':'+(g.repeat==='day'?d:g.repeat==='week'||g.repeat==='month'?start:(g.deadline||start))};
const overBonus=(g,d)=>{
 if(g.type!=='cumulative'||!(+g.target>0))return 0;
 const target=+g.target,done=Math.max(0,current(g,d)),extra=Math.max(0,done-target);
 const ratio=Math.min(1,extra/target);
 // At 150% of target, half the bonus is earned; at 200%, cap reached.
 const coefficient=window.__v1815?.coefficient?.(g)||1;
 return Math.round(12*coefficient*ratio);
};
data.economy1819||={baseline:{},paid:{},binaryPaid:{}};
const ledger=data.economy1819;
if(!ledger.initialized){
 for(const g of data.goals.filter(g=>g.type==='cumulative')){
  const dates=new Map();
  for(const e of data.entries.filter(e=>String(e.goal)===String(g.id)&&e.date<=today()))dates.set(periodKey(g,e.date),e.date);
  for(const [k,d] of dates)ledger.baseline[k]=overBonus(g,d);
 }
 ledger.initialized=true;save();
}
reward=function(g,d){
 if(!g||d>today())return;
 const k=periodKey(g,d),was=!!data.rewardLog[k];
 previous(g,d);
 if(g.type==='cumulative'){
  const before=Number(ledger.paid[k]||0);
  const wanted=Math.max(0,overBonus(g,d)-Number(ledger.baseline[k]||0));
  const diff=wanted-before;
  if(diff){data.teeth=Math.max(0,data.teeth+diff);ledger.paid[k]=wanted}
 }else if(g.type!=='metric'&&!was&&data.rewardLog[k]){
  // v18.18 awards 5/8 already; this handles legacy paths with 3.
  const already=3+(data.economy1818?.daily?.[k]?(g.type==='oneoff'?5:2):0);
  const supplement=Math.max(0,award(g)-already);
  if(supplement){data.teeth+=supplement;ledger.binaryPaid[k]=supplement}
 }
};
const originalToggle=window.__v1811?.toggleBinary;
if(originalToggle){
 // v1811 uses a fixed subtraction; updated v1811 consults binaryAward.
 window.__v1819={version:'18.19',binaryAward:g=>award(g),overBonus};
}else window.__v1819={version:'18.19',binaryAward:award,overBonus};
const oldSubtract=subtract;
subtract=function(g){oldSubtract(g);if(g?.type==='cumulative'){reward(g,selectedDate);save();render()}};
})();