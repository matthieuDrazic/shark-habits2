/* SharkHabits V16.8.1 — lean iPhone interaction layer, no focus zoom/recentering */
const V168='16.8.1';
function v168EnhanceForms(){const f=document.querySelector('#goalForm');if(!f||f.dataset.v168)return;f.dataset.v168='1';const advancedNames=new Set(['direction','startValue','deadline','rule','note','category']);const nodes=[...f.children].filter(el=>{if(el.matches('label'))return advancedNames.has(el.querySelector('[name]')?.name);return false});if(nodes.length){const d=document.createElement('details');d.className='v168Advanced';const s=document.createElement('summary');s.textContent='Options avancées';d.appendChild(s);nodes[0].before(d);nodes.forEach(n=>d.appendChild(n))}}
function v168PrepareDialog(dialog){if(!dialog)return;dialog.addEventListener('close',()=>{const a=document.activeElement;if(a&&a.matches('input,select,textarea'))a.blur()})}
v168EnhanceForms();v168PrepareDialog(document.querySelector('#goalDialog'));v168PrepareDialog(document.querySelector('#entryDialog'));
// Do not call scrollIntoView/focus programmatically on iOS: Safari handles keyboard visibility natively.
document.addEventListener('click',e=>{if(e.target.closest('[data-close],.dialogHead button[type="submit"]')){const a=document.activeElement;if(a&&a.matches('input,select,textarea'))a.blur()}},{capture:true});
if(typeof data!=='undefined'){data.version=V168;save();render()}
