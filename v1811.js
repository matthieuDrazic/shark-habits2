/* SharkHabits V18.11 — Compact Today */
(()=>{
'use strict';
window.__v1811Active=true;
let completedOpen=false;
const oldTask=task, oldRenderToday=renderToday;

function dayValue(g,date=selectedDate){
 return data.entries.filter(e=>e.goal===g.id&&e.date===date).reduce((s,e)=>s+(+e.value||0),0);
}
function completed(g){
 const has=data.entries.some(e=>e.goal===g.id&&e.date===selectedDate);
 if(g.type==='metric')return has;
 if(g.type==='habit')return dayValue(g)>=1;
 return isDone(g,selectedDate);
}
function metaLine(g,v,p){
 if(g.type==='oneoff')return completed(g)?'Réalisé':'À faire aujourd’hui';
 if(g.type==='habit')return completed(g)?'Fait aujourd’hui':'Habitude · aujourd’hui';
 if(g.type==='cumulative')return fmt(v)+' / '+fmt(g.target)+' '+(g.unit||'')+' · '+Math.round(p)+' %';
 if(g.type==='metric')return 'Mesure · '+(data.entries.some(e=>e.goal===g.id&&e.date===selectedDate)?fmt(v)+' '+(g.unit||''):'à saisir');
 return Math.round(p)+' % · '+(g.deadline||'sans échéance');
}
function compactTask(g,kind){
 const s=strideStatus(g),p=pct(g),m=typeMeta(g),v=s.v,done=completed(g);
 let action='';
 if(g.type==='oneoff'||g.type==='habit'){
   action='<button class="v1811Check '+(done?'checked':'')+'" data-v1811-toggle="'+g.id+'" aria-label="'+(done?'Annuler la validation':'Valider')+'">'+(done?'✓':'○')+'</button>';
 }else if(g.type==='metric'){
   action='<button class="v1811Measure" data-add="'+g.id+'">'+(data.entries.some(e=>e.goal===g.id&&e.date===selectedDate)?'Modifier':'Saisir')+'</button>';
 }else{
   action='<div class="v1811Stepper"><button data-minus="'+g.id+'">−</button><strong>'+fmt(v)+'</strong><button data-add="'+g.id+'">＋</button></div>';
 }
 return '<article class="v1811Task '+m.cls+' '+(kind==='missed'?'missed ':'')+(done?'isDone':'')+'" data-detail="'+g.id+'">'+
 '<div class="v1811Mark">'+m.icon+'</div><div class="v1811Text"><h4>'+g.name+'</h4><small>'+metaLine(g,v,p)+'</small><i><span style="width:'+p+'%"></span></i></div>'+
 '<div class="v1811Action">'+action+'</div></article>';
}
function group(title,items,kind,collapsible=false){
 if(!items.length)return '';
 const head=collapsible?'<button class="v1811GroupHead" data-v1811-completed><span>'+title+'</span><b>'+items.length+'</b><i>'+(completedOpen?'⌃':'⌄')+'</i></button>':'<div class="v1811GroupHead"><span>'+title+'</span><b>'+items.length+'</b></div>';
 return head+'<div class="v1811Group '+(collapsible&&!completedOpen?'collapsed':'')+'">'+items.map(g=>compactTask(g,kind)).join('')+'</div>';
}
renderToday=function(){
 renderWeek();
 const gs=data.goals.filter(g=>!g.archived&&scheduledOn(g,selectedDate)),todo=[],done=[],miss=[];
 gs.forEach(g=>{if(completed(g))done.push(g);else if(selectedDate<today())miss.push(g);else todo.push(g)});
 document.getElementById('todayGroups').innerHTML=group('À faire',todo,'todo')+group('Manqué',miss,'missed')+group('Terminés',done,'done',true)||
 '<div class="emptyState v1811Empty"><div class="emptyIcon">✓</div><strong>Rien de prévu</strong><p class="muted">Aucun objectif n’est planifié ce jour.</p></div>';
 const avg=gs.length?gs.reduce((sum,g)=>sum+pct(g),0)/gs.length:0;
 document.getElementById('dayScore').textContent=Math.round(avg)+' %';document.getElementById('dayBar').style.width=avg+'%';
};
function rewardKey(g,date){
 const ab=bounds(g,date),a=ab[0];
 return g.id+':'+(g.repeat==='day'?date:g.repeat==='week'?a:g.repeat==='month'?a:(g.deadline||a));
}
function toggleBinary(g){
 if(!g||(g.type!=='oneoff'&&g.type!=='habit'))return;
 const rows=data.entries.filter(e=>e.goal===g.id&&e.date===selectedDate);
 const was=completed(g),key=rewardKey(g,selectedDate);
 if(was){
   data.entries=data.entries.filter(e=>!(e.goal===g.id&&e.date===selectedDate));
   if(data.rewardLog[key]){delete data.rewardLog[key];data.teeth=Math.max(0,data.teeth-3)}
 }else{
   data.entries.push({id:uid(),goal:g.id,value:1,date:selectedDate});
   reward(g,selectedDate);
 }
 save();render();
}
document.addEventListener('click',e=>{
 const toggle=e.target.closest('[data-v1811-toggle]');
 if(toggle){e.preventDefault();e.stopImmediatePropagation();toggleBinary(data.goals.find(g=>g.id===toggle.dataset.v1811Toggle));return}
 const head=e.target.closest('[data-v1811-completed]');
 if(head){e.preventDefault();e.stopImmediatePropagation();completedOpen=!completedOpen;renderToday();return}
},true);
renderToday();
window.__v1811={version:'18.11',compactTask,toggleBinary,completed};
})();