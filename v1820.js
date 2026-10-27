/* SharkHabits V18.20 — one reward ledger, one reward calculation */
(()=>{
'use strict';
const VERSION='18.20';
const same=(a,b)=>String(a)===String(b);
const n=x=>Number.isFinite(+x)?+x:0;
const key=(g,d)=>{
 const [start]=bounds(g,d);
 const period=g.type==='habit'&&g.scheduleMode==='timesweek'?'week':g.repeat;
 return String(g.id)+':'+(period==='day'?d:period==='week'||period==='month'?start:(g.deadline||start));
};
const coefficient=g=>window.__v1815?.coefficient?.(g)||1;
function earned(g,d){
 if(g.type==='metric')return 0;
 if(g.type==='cumulative'){
  const target=Math.max(1,n(g.target)),value=Math.max(0,n(current(g,d))),rate=value/target;
  if(!value)return 0;
  const c=coefficient(g),base=g.repeat==='month'?25:g.repeat==='week'?15:20;
  const finish=g.repeat==='month'?10:g.repeat==='week'?5:10;
  const progress=Math.max(1,Math.round(base*c*Math.pow(Math.min(1,rate),1.35)));
  const bonus=rate>=1?Math.round(finish*c):0;
  const over=Math.round(12*c*Math.min(1,Math.max(0,rate-1)));
  return progress+bonus+over;
 }
 const [start,end]=bounds(g,d);
 const rows=data.entries.filter(e=>same(e.goal,g.id)&&e.date>=start&&e.date<=end);
 if(g.type==='habit'){
  const count=g.scheduleMode==='timesweek'?new Set(rows.filter(e=>n(e.value)>0).map(e=>e.date)).size:rows.reduce((s,e)=>s+n(e.value),0);
  return count>=Math.max(1,g.scheduleMode==='timesweek'?n(g.timesPerWeek):1)?5:0;
 }
 const total=rows.reduce((s,e)=>s+n(e.value),0);
 return total>=Math.max(1,n(g.target))?8:0;
}
data.economy1820||={periods:{},version:VERSION};
const eco=data.economy1820;
eco.periods||={};
function seed(){
 if(eco.seeded)return;
 const found=new Map();
 for(const g of data.goals){
  for(const e of data.entries){
   if(!same(e.goal,g.id)||!e.date||e.date>today())continue;
   found.set(key(g,e.date),{g,d:e.date});
  }
 }
 for(const [k,{g,d}] of found){if(!eco.periods[k])eco.periods[k]={baseline:earned(g,d),paid:0};if(g.type==='cumulative'){data.rewardLedger||={};data.rewardLedger[k]=window.__v1815?.earned?.(g,d)||0}}
 eco.seeded=true;
 save();
}
seed();
function reconcile(g,d,notify=true){
 if(!g||!d||d>today()||g.type==='metric')return 0;
 const k=key(g,d);
 const existing=eco.periods[k];
 const row=existing||{baseline:0,paid:0};
 if(!existing)eco.periods[k]=row;
 const target=Math.max(0,earned(g,d)-n(row.baseline));
 const delta=target-n(row.paid);
 if(g.type==='cumulative'){data.rewardLedger||={};data.rewardLedger[k]=window.__v1815?.earned?.(g,d)||0}
 if(!delta)return 0;
 row.paid=target;
 data.teeth=Math.max(0,n(data.teeth)+delta);
 if(notify&&delta>0&&typeof showRewardToast==='function')showRewardToast(delta);
 return delta;
}
reward=function(g,d){return reconcile(g,d,true)};
window.__v1820={version:VERSION,earned,key,reconcile};
})();