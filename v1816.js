/* SharkHabits V18.16 — Today by goal type, compact mobile UI */
(()=>{
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sections=[
 {key:'cumulative',name:'Objectifs cumulés',icon:'↗'},
 {key:'habit',name:'Habitudes',icon:'✓'},
 {key:'oneoff',name:'Objectifs ponctuels',icon:'◉'},
 {key:'metric',name:'Mesures',icon:'∿'},
 {key:'deadline',name:'Projets',icon:'◇'}
];
const state={completed:false,paused:true,groups:{}};
function type(g){return g.type==='cumulative'?'cumulative':g.type==='habit'?'habit':g.type==='metric'?'metric':g.type==='oneoff'?'oneoff':'deadline'}
function shortMeta(g,row){
 const small=row.querySelector('.v1811Text small');if(!small)return;
 if(g.type==='cumulative')small.textContent=fmt(current(g,selectedDate))+' / '+fmt(g.target)+(g.unit?' '+g.unit:'')+' · '+Math.round(pct(g,selectedDate))+' %';
 else if(g.type==='habit')small.textContent=row.classList.contains('isDone')?'Fait aujourd’hui':'À faire';
 else if(g.type==='oneoff')small.textContent=row.classList.contains('isDone')?'Réalisé':'À faire';
 else if(g.type==='metric')small.textContent=data.entries.some(e=>e.goal===g.id&&e.date===selectedDate)?'Mesure enregistrée':'À renseigner';
 else small.textContent=Math.round(pct(g,selectedDate))+' %'+(g.deadline?' · échéance '+g.deadline:'');
 row.classList.toggle('v1816NoBar',g.type==='habit'||g.type==='oneoff'||g.type==='metric');
 row.classList.add('v1816Compact');
}
function header(label,count,key,collapsed){
 const b=document.createElement('button');b.type='button';b.className='v1816Head';b.dataset.v1816Toggle=key;
 b.setAttribute('aria-expanded',String(!collapsed));
 b.innerHTML='<span>'+label+' <b>'+count+'</b></span><span class="v1816Chevron">'+(collapsed?'⌄':'⌃')+'</span>';
 return b;
}
function group(label,rows,key,collapsed){
 if(!rows.length)return null;
 const s=document.createElement('section');s.className='v1816Section';s.dataset.v1816Section=key;
 s.append(header(label,rows.length,key,collapsed));
 const content=document.createElement('div');content.className='v1816Rows';if(collapsed)content.hidden=true;
 rows.forEach(row=>content.append(row));s.append(content);return s;
}
function rebuild(){
 const root=document.getElementById('todayGroups');if(!root)return;
 const rows=[...root.querySelectorAll('.v1811Task[data-detail]')];
 const paused=root.querySelector('.v1815Paused');
 const gs=new Map(data.goals.map(g=>[String(g.id),g]));
 const pending=rows.filter(r=>!r.classList.contains('isDone')),done=rows.filter(r=>r.classList.contains('isDone'));
 rows.forEach(r=>{const g=gs.get(r.dataset.detail);if(g)shortMeta(g,r)});
 const frag=document.createDocumentFragment();
 const total=rows.length,finished=done.length;
 const summary=document.createElement('div');summary.className='v1816Summary';
 summary.innerHTML='<span><strong>'+Math.max(0,total-finished)+'</strong> à faire</span><span><strong>'+finished+'</strong> terminés</span>';
 frag.append(summary);
 for(const section of sections){
  const filtered=pending.filter(r=>{const g=gs.get(r.dataset.detail);return g&&type(g)===section.key});
  const el=group('<span class="v1816Icon">'+section.icon+'</span> '+section.name,filtered,section.key,!!state.groups[section.key]);
  if(el)frag.append(el);
 }
 const doneGroup=group('✓ Terminés',done,'completed',!state.completed);if(doneGroup)frag.append(doneGroup);
 if(paused){
  const names=[...paused.querySelectorAll('div > span')].map(x=>x.textContent.trim());
  const container=document.createElement('section');container.className='v1816Section v1816Pause';
  container.append(header('Ⅱ En pause',names.length,'paused',state.paused));
  const body=document.createElement('div');body.className='v1816PausedRows';body.hidden=state.paused;
  const existing=[...paused.querySelectorAll(':scope > div')];
  existing.forEach(item=>body.append(item));
  container.append(body);frag.append(container);
 }
 if(!rows.length&&!paused){const empty=document.createElement('div');empty.className='v1816Empty';empty.textContent='Aucun objectif prévu pour cette journée.';frag.append(empty)}
 root.replaceChildren(frag);
}
const oldRenderToday=renderToday;
renderToday=function(){oldRenderToday();rebuild()};
document.addEventListener('click',e=>{
 const btn=e.target.closest('[data-v1816-toggle]');if(!btn)return;
 e.preventDefault();e.stopImmediatePropagation();
 const key=btn.dataset.v1816Toggle;
 if(key==='completed')state.completed=!state.completed;
 else if(key==='paused')state.paused=!state.paused;
 else state.groups[key]=!state.groups[key];
 const content=btn.nextElementSibling,closed=key==='completed'?!state.completed:key==='paused'?state.paused:!!state.groups[key];
 if(content)content.hidden=closed;
 btn.setAttribute('aria-expanded',String(!closed));
 const chevron=btn.querySelector('.v1816Chevron');if(chevron)chevron.textContent=closed?'⌄':'⌃';
},true);
renderToday();
window.__v1816={version:'18.16',rebuild,state};
})();