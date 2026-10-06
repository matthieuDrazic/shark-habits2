/* SharkHabits V18.9 — infinite dates + clear Ocean buy/edit modes */
(()=>{
'use strict';
/* Continuous date rail: 121 days, centered on selected date, extended as needed. */
const week=document.getElementById('week'), nav=document.querySelector('.dateNavigator'), range=document.getElementById('weekRange');
let railStart=null,railEnd=null,railBusy=false;
const D=86400000, dateObj=s=>new Date(s+'T12:00');
function dayHTML(d){const id=iso(d),done=data.goals.some(g=>data.entries.some(e=>e.goal===g.id&&e.date===id));return '<button class="day '+(id===selectedDate?'active ':'')+(done?'done':'')+'" data-date="'+id+'"><span>'+d.toLocaleDateString('fr-FR',{weekday:'short'}).replace('.','').toUpperCase()+'</span><b>'+d.getDate()+'</b><small>'+d.toLocaleDateString('fr-FR',{month:'short'}).replace('.','')+'</small></button>'}
function buildRail(center=selectedDate){
 if(!week)return; const c=dateObj(center); railStart=new Date(c.getTime()-60*D);railEnd=new Date(c.getTime()+60*D);
 week.innerHTML=Array.from({length:121},(_,i)=>dayHTML(new Date(railStart.getTime()+i*D))).join('');
 requestAnimationFrame(()=>centerSelected(false));
}
function centerSelected(smooth=true){const el=week?.querySelector('[data-date="'+selectedDate+'"]');if(!el)return;railBusy=true;el.scrollIntoView({behavior:smooth?'smooth':'auto',inline:'center',block:'nearest'});setTimeout(()=>railBusy=false,smooth?400:30)}
function extendRail(){
 if(!week||railBusy)return;
 if(week.scrollLeft<week.clientWidth*1.2){const before=week.scrollWidth,arr=[];for(let i=30;i>=1;i--)arr.push(dayHTML(new Date(railStart.getTime()-i*D)));week.insertAdjacentHTML('afterbegin',arr.join(''));railStart=new Date(railStart.getTime()-30*D);week.scrollLeft+=week.scrollWidth-before}
 if(week.scrollWidth-week.scrollLeft-week.clientWidth<week.clientWidth*1.2){let arr=[];for(let i=1;i<=30;i++)arr.push(dayHTML(new Date(railEnd.getTime()+i*D)));week.insertAdjacentHTML('beforeend',arr.join(''));railEnd=new Date(railEnd.getTime()+30*D)}
}
if(nav)nav.remove(); if(range)range.remove();
if(week){week.classList.add('v189DateRail');buildRail();week.addEventListener('scroll',extendRail,{passive:true});week.addEventListener('click',e=>{const b=e.target.closest('[data-date]');if(!b)return;setTimeout(()=>{week.querySelectorAll('.day').forEach(x=>x.classList.toggle('active',x.dataset.date===selectedDate));centerSelected(true)},0)},true)}
const oldRenderToday=window.renderToday;
if(typeof oldRenderToday==='function')window.renderToday=function(){const left=week?.scrollLeft||0;oldRenderToday();if(week){buildRail(selectedDate);if(left&&!week.querySelector('[data-date="'+selectedDate+'"]'))week.scrollLeft=left}};


/* Ocean editing moved to V18.10. */
window.__v189={version:'18.9',buildRail};
})();