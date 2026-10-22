/* SharkHabits V18.18 — balanced economy, no retroactive windfall */
(()=>{
'use strict';
const factor=1.45;
const priceFactor=cost=>cost<=600?.88:cost<=1600?.92:cost<=4000?.95:.97;
for(const shark of SHARKS){if(shark.cost>0)shark.cost=Math.max(1,Math.round(shark.cost*priceFactor(shark.cost)/10)*10)}
const prevReward=reward;
const key=(g,d)=>{const [start]=bounds(g,d);return String(g.id)+':'+(g.repeat==='day'?d:g.repeat==='week'||g.repeat==='month'?start:(g.deadline||start))};
const extra=(g,d)=>{const total=window.__v1815?.earned?.(g,d)||0;return Math.max(0,Math.round(total*(factor-1)))};
data.economy1818||={baseline:{},extra:{},daily:{}};
const eco=data.economy1818;
function initialize(){
 if(eco.initialized)return;
 for(const g of data.goals.filter(x=>x.type==='cumulative')){
  const dates=new Map();
  for(const e of data.entries.filter(e=>String(e.goal)===String(g.id)&&e.date<=today()))dates.set(key(g,e.date),e.date);
  for(const [k,d] of dates)eco.baseline[k]=extra(g,d);
 }
 eco.initialized=true;save();
}
initialize();
reward=function(g,d){
 if(!g||d>today())return;
 if(g.type==='cumulative'){
  prevReward(g,d);
  const k=key(g,d),previous=Number(eco.extra[k]||0),baseline=Number(eco.baseline[k]||0),desired=Math.max(0,extra(g,d)-baseline);
  const diff=desired-previous;
  if(diff){data.teeth=Math.max(0,data.teeth+diff);eco.extra[k]=desired}
  return;
 }
 const k=key(g,d),before=!!data.rewardLog[k];
 prevReward(g,d);
 if(g.type!=='metric'&&!before&&data.rewardLog[k]&&!eco.daily[k]){
  data.teeth+=g.type==='oneoff'?5:2;
  eco.daily[k]=true;
 }
};
const prevSubtract=subtract;
subtract=function(g){prevSubtract(g);if(g?.type==='cumulative'){reward(g,selectedDate);save();render()}};
renderSharks();renderShop();
window.__v1818={version:'18.18',priceFactor,extra};
})();