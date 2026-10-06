/* SharkHabits V18.13 — authoritative goal editor */
(()=>{
'use strict';
const form=document.getElementById('goalForm'),dialog=document.getElementById('goalDialog');
if(!form||!dialog)return;
const byId=id=>data.goals.find(g=>String(g.id)===String(id));
function fill(g){
 form.dataset.editingId=String(g.id);
 if(form.elements.id)form.elements.id.value=g.id;
 for(const [k,v] of Object.entries(g)){
  if(k==='scheduleDays'||!form.elements[k])continue;
  form.elements[k].value=v??'';
 }
 form.querySelectorAll('input[name="day"]').forEach(x=>x.checked=(g.scheduleDays||[]).map(Number).includes(+x.value));
 document.getElementById('goalDialogTitle').textContent='Modifier l’objectif';
 form.querySelectorAll('.v183Type').forEach(b=>b.classList.toggle('active',b.dataset.type===String(g.type)));
}
function openEditor(id){
 const g=byId(id);if(!g)return false;
 const detail=document.getElementById('detailDialog');
 if(detail?.open)detail.close();
 if(dialog.open)dialog.close();
 fill(g);
 dialog.showModal();
 /* v18/v188 have contextual show hooks; restore the persisted values after those hooks. */
 requestAnimationFrame(()=>{fill(g);window.__v188?.applyOneOff?.();});
 return true;
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-report-edit],[data-goal-edit],#editGoal');
 if(!b||e.defaultPrevented)return;
 const id=b.dataset.reportEdit||b.dataset.goalEdit||document.getElementById('detailBody')?.dataset.goal;
 if(!id)return;
 e.preventDefault();e.stopImmediatePropagation();
 openEditor(id);
},true);
/* Expose one editor implementation to older runtime callers too. */
window.openGoalForEdit=openEditor;
window.__v1813={version:'18.14',openEditor,fill};
})();