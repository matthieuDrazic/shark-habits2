/* SharkHabits V18.17 — daily accuracy and useful reports */
(()=>{
'use strict';
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const N=x=>Number.isFinite(+x)?+x:0;
const pct100=x=>Math.max(0,Math.min(100,x));
const same=(a,b)=>String(a)===String(b);
const active=g=>!g.archived&&!g.archivedAt&&!g.completedAt;
const entriesFor=g=>data.entries.filter(e=>same(e.goal,g.id));
const doneOn=(g,d)=>entriesFor(g).some(e=>e.date===d&&N(e.value)>0);
function firstCompleted(g){
 if(!['deadline','oneoff'].includes(g.type))return null;
 const list=entriesFor(g).filter(e=>e.date<=today()).sort((a,b)=>a.date.localeCompare(b.date));
 if(!list.length)return null;
 let total=0;for(const e of list){total+=N(e.value);if(total>=Math.max(1,N(g.target)))return e.date}
 return null;
}
function dueToday(g,d){
 if(!active(g)||!scheduledOn(g,d))return false;
 if(g.created&&d<g.created)return false;
 const finished=firstCompleted(g);
 if(finished&&d>finished)return false;
 if(g.type==='oneoff')return g.deadline===d;
 if(g.type==='deadline')return !finished||d===finished;
 if(g.type==='cumulative')return g.repeat==='day'||(g.scheduleMode==='days'&&(g.scheduleDays||[]).includes(new Date(d+'T12:00').getDay()));
 if(g.scheduleMode==='timesweek')return false;
 if(g.type==='habit')return g.repeat==='day'||g.scheduleMode==='days';
 if(g.type==='metric')return !g.deadline&&g.repeat==='day';
 return false;
}
function achievedToday(g,d){
 if(g.type==='habit'||g.type==='oneoff'||g.type==='metric')return doneOn(g,d);
 if(g.type==='cumulative'&&g.repeat==='day')return isDone(g,d);
 if(g.type==='cumulative')return doneOn(g,d);
 return !!firstCompleted(g)&&firstCompleted(g)===d;
}
function filterToday(){
 const root=document.getElementById('todayGroups');if(!root)return;
 root.querySelectorAll('.v1811Task[data-detail]').forEach(row=>{
  const g=data.goals.find(x=>same(x.id,row.dataset.detail));
  if(!g)return;
  const completion=firstCompleted(g);
  const stale=(g.type==='oneoff'&&g.deadline!==selectedDate)||(g.type==='deadline'&&completion&&selectedDate>completion)||(g.created&&selectedDate<g.created);
  if(stale)row.remove();
 });
 root.querySelectorAll('.v1816Section').forEach(s=>{
  if(s.classList.contains('v1816Pause'))return;
  const rows=s.querySelectorAll('.v1811Task');if(!rows.length)s.remove();
  else{const count=s.querySelector('.v1816Head b');if(count)count.textContent=rows.length}
 });
 const gs=data.goals.filter(g=>dueToday(g,selectedDate)),completed=gs.filter(g=>achievedToday(g,selectedDate)).length;
 const percent=gs.length?Math.round(completed/gs.length*100):0;
 const score=document.getElementById('dayScore'),bar=document.getElementById('dayBar');
 if(score)score.textContent=gs.length?percent+' %':'—';if(bar)bar.style.width=percent+'%';
 const summary=root.querySelector('.v1816Summary');
 if(summary)summary.innerHTML='<span><strong>'+completed+'/'+gs.length+'</strong> tâches du jour</span><span><strong>'+percent+' %</strong> réalisées</span>';
 const caption=document.getElementById('v1817DailyNote')||document.createElement('small');
 caption.id='v1817DailyNote';caption.textContent='Les objectifs flexibles de la semaine ne diminuent pas ce score.';
 caption.className='v1817DailyNote';if(summary&&!caption.isConnected)summary.after(caption);
}
const prevToday=renderToday;
renderToday=function(){prevToday();filterToday()};
let period='week',category='all';
const types={cumulative:'Cumulés',habit:'Habitudes',oneoff:'Ponctuels',metric:'Mesures',deadline:'Projets'};
const dateRange=()=>{
 const end=today(),d=new Date(end+'T12:00');d.setDate(d.getDate()-(period==='week'?6:period==='month'?29:364));
 return [iso(d),end];
};
function reportPercent(g){
 if(g.type==='habit'||g.type==='oneoff'){
  const [start,end]=dateRange();let due=0,done=0;
  for(let d=new Date(start+'T12:00');iso(d)<=end;d.setDate(d.getDate()+1)){
   const k=iso(d);if(!dueToday(g,k))continue;due++;if(achievedToday(g,k))done++;
  }
  return{p:due?Math.round(done/due*100):0,value:done+'/'+due,sub:'jours prévus réalisés',good:due>0&&done===due};
 }
 if(g.type==='metric'){
  const v=N(current(g,today())),target=N(g.target),p=pct100(pct(g,today()));
  return{p:Math.round(p),value:fmt(v)+' '+(g.unit||''),sub:'Cible '+fmt(target)+' '+(g.unit||''),good:isDone(g,today())};
 }
 const v=N(current(g,today())),target=Math.max(1,N(g.target)),p=pct100(v/target*100);
 return{p:Math.round(p),value:fmt(v)+' / '+fmt(target)+' '+(g.unit||''),sub:g.repeat==='week'?'Cette semaine':g.repeat==='month'?'Ce mois':g.deadline?'Échéance '+g.deadline:'Progression',good:p>=100};
}
function sparkline(g){
 const [start,end]=dateRange(),a=entriesFor(g).filter(e=>e.date>=start&&e.date<=end).sort((x,y)=>x.date.localeCompare(y.date));
 const buckets=period==='week'?7:period==='month'?10:12,vals=Array(buckets).fill(0),t0=new Date(start+'T12:00').getTime(),span=Math.max(1,new Date(end+'T12:00').getTime()-t0);
 a.forEach(e=>{const idx=Math.min(buckets-1,Math.floor((new Date(e.date+'T12:00').getTime()-t0)/span*(buckets-1)));vals[idx]+=N(e.value)});
 const max=Math.max(1,...vals),points=vals.map((v,i)=>(8+i*284/(buckets-1)).toFixed(1)+','+(72-v/max*56).toFixed(1)).join(' ');
 return '<svg class="v1817Spark" viewBox="0 0 300 85" role="img" aria-label="Entrées de la période"><line x1="8" y1="72" x2="292" y2="72" stroke="#315569"/><polyline fill="none" stroke="#42d1d2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="'+points+'"/></svg>';
}
function row(g){
 const s=reportPercent(g),kind=types[g.type]||'Autre';
 return '<article class="v1817Goal" data-report-goal="'+E(g.id)+'"><button type="button" class="v1817Open" data-detail="'+E(g.id)+'"><span><strong>'+E(g.name)+'</strong><small>'+E(kind)+' · '+E(s.sub)+'</small></span><span class="v1817Value">'+E(s.value)+'</span></button>'+
 ((g.type==='cumulative'||g.type==='metric'||g.type==='deadline')?'<div class="v1817Rail"><i style="width:'+s.p+'%"></i></div>':'')+
 '<div class="v1817GoalBottom"><span>'+((g.type==='habit'||g.type==='oneoff')?E(s.value):s.p+' %')+'</span><button type="button" aria-label="Actions pour '+E(g.name)+'" data-v1817-menu="'+E(g.id)+'">•••</button></div></article>';
}
function renderReports17(){
 const summary=document.getElementById('reportSummary'),list=document.getElementById('reportList');if(!summary||!list)return;
 const gs=data.goals.filter(active),[start,end]=dateRange(),due=gs.filter(g=>g.type==='habit'||g.type==='oneoff'),success=due.reduce((a,g)=>{const s=reportPercent(g);return{done:a.done+N(s.value.split('/')[0]),total:a.total+N(s.value.split('/')[1])}}, {done:0,total:0});
 const rate=success.total?Math.round(success.done/success.total*100):null;
 const cumul=gs.filter(g=>g.type==='cumulative'),achieved=cumul.filter(g=>reportPercent(g).good).length;
 summary.innerHTML='<div class="v1817Intro"><h2>Mes progrès</h2><div class="v1817Periods">'+[['week','Semaine'],['month','Mois'],['year','Année']].map(([v,t])=>'<button data-v1817-period="'+v+'" class="'+(period===v?'active':'')+'">'+t+'</button>').join('')+'</div></div>'+
 '<div class="v1817Kpis"><div><small>Habitudes et tâches prévues</small><strong>'+(rate===null?'—':rate+' %')+'</strong><span>'+success.done+'/'+success.total+' réalisations</span></div><div><small>Cumuls atteints</small><strong>'+achieved+'/'+cumul.length+'</strong><span>sur la période en cours</span></div></div>'+
 '<div class="v1817ChartCard"><strong>Activité · '+(period==='week'?'7 jours':period==='month'?'30 jours':'12 mois')+'</strong>'+sparkline({id:'__all',type:'habit'})+'</div>'+
 '<div class="v1817Filters">'+[['all','Tous'],['cumulative','Cumulés'],['habit','Habitudes'],['oneoff','Ponctuels'],['metric','Mesures'],['deadline','Projets']].map(([v,t])=>'<button data-v1817-filter="'+v+'" class="'+(category===v?'active':'')+'">'+t+'</button>').join('')+'</div>';
 const visible=gs.filter(g=>category==='all'||g.type===category);
 list.innerHTML='<div class="v1817GoalList">'+visible.map(row).join('')+'</div>'+(visible.length?'':'<p class="v1817Empty">Aucun objectif dans cette catégorie.</p>');
 const inactive=data.goals.filter(g=>g.archived||g.archivedAt||g.completedAt);
 if(inactive.length)list.insertAdjacentHTML('beforeend','<details class="v1817Archive"><summary>Terminés et archivés ('+inactive.length+')</summary>'+inactive.map(g=>'<div><button data-detail="'+E(g.id)+'">'+E(g.name)+'</button><button data-report-restore="'+E(g.id)+'">Restaurer</button></div>').join('')+'</details>');
}
const oldReports=renderReports;
renderReports=function(){oldReports();renderReports17()};
document.addEventListener('click',e=>{
 const periodBtn=e.target.closest('[data-v1817-period]'),filterBtn=e.target.closest('[data-v1817-filter]'),menu=e.target.closest('[data-v1817-menu]');
 if(periodBtn){e.preventDefault();e.stopImmediatePropagation();period=periodBtn.dataset.v1817Period;renderReports17();return}
 if(filterBtn){e.preventDefault();e.stopImmediatePropagation();category=filterBtn.dataset.v1817Filter;renderReports17();return}
 if(menu){e.preventDefault();e.stopImmediatePropagation();const id=menu.dataset.v1817Menu,g=data.goals.find(x=>same(x.id,id));if(!g)return;
 const choice=prompt('Actions pour '+g.name+'\n1 — Modifier\n2 — Archiver\n3 — Supprimer','1');
 if(choice==='1'){window.openGoalForEdit?window.openGoalForEdit(id):openGoal(g)}
 else if(choice==='2'){if(confirm('Archiver cet objectif ?')){g.archivedAt=today();save();render()}}
 else if(choice==='3'&&confirm('Supprimer définitivement cet objectif et son historique ?')){data.goals=data.goals.filter(x=>!same(x.id,id));data.entries=data.entries.filter(x=>!same(x.goal,id));save();render()}
 }
},true);
document.addEventListener('click',e=>{if(e.target.closest('[data-page="reports"]'))setTimeout(renderReports17,0)},true);
renderToday();renderReports17();
window.__v1817={version:'18.17',dueToday,achievedToday,firstCompleted,filterToday,renderReports:renderReports17,reportPercent};
})();