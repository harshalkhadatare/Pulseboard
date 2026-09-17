const KEY = "pulseboard-v1";
let state = JSON.parse(localStorage.getItem(KEY) || "null") || {items:[], theme:"light", welcomed:false};
let filter = "all";

const $ = s => document.querySelector(s);
const input = $("#thoughtInput"), energy = $("#energySelect"), cards = $("#cards"), empty = $("#empty");

function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }
function escapeHTML(str){ const d=document.createElement("div"); d.textContent=str; return d.innerHTML; }

function addThought(){
  const text = input.value.trim();
  if(!text){ input.focus(); input.placeholder="Give that thought a few words…"; return; }
  state.items.unshift({id:crypto.randomUUID(), text, energy:energy.value, done:false, created:Date.now()});
  input.value=""; input.placeholder="What's taking up space in your head?";
  save(); render(); input.focus();
}

function toggle(id){
  const item=state.items.find(x=>x.id===id); if(!item)return;
  item.done=!item.done; save(); render();
}
function remove(id){
  state.items=state.items.filter(x=>x.id!==id); save(); render();
}
function render(){
  const visible=state.items.filter(x=>filter==="all" || (filter==="done"?x.done:!x.done));
  cards.innerHTML=visible.map((x,i)=>`
    <article class="card ${x.done?"done":""}" style="animation-delay:${i*35}ms">
      <button class="check" data-action="toggle" data-id="${x.id}" aria-label="${x.done?"Mark open":"Mark moved"}">${x.done?"✓":"○"}</button>
      <div>
        <div class="card-title">${escapeHTML(x.text)}</div>
        <div class="meta">${new Date(x.created).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}</div>
      </div>
      <div><span class="energy ${x.energy}">${x.energy==="high"?"Deep focus":x.energy==="low"?"Low energy":"Some energy"}</span>
      <button class="delete" data-action="delete" data-id="${x.id}" aria-label="Delete thought">×</button></div>
    </article>`).join("");
  empty.style.display=visible.length?"none":"block";
  const total=state.items.length, done=state.items.filter(x=>x.done).length, pct=total?Math.round(done/total*100):0;
  $("#allCount").textContent=total; $("#openCount").textContent=total-done; $("#doneCount").textContent=done;
  $("#progressValue").textContent=pct+"%"; $("#progressText").textContent=`${done} of ${total}`;
  $("#progressRing").style.setProperty("--progress",pct+"%");
  $("#summaryTitle").textContent=total===0?"A clean slate.":done===total?"Everything moved forward.":done===0?"Choose one thing to move.":`${total-done} thing${total-done===1?"":"s"} still open.`;
  document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b.dataset.filter===filter));
}

function setTheme(){
  document.documentElement.dataset.theme=state.theme==="dark"?"dark":"light";
  $("#themeBtn").textContent=state.theme==="dark"?"☼":"◐";
}
function init(){
  setTheme(); render();
  $("#dateLabel").textContent=new Intl.DateTimeFormat(undefined,{weekday:"short",month:"short",day:"numeric"}).format(new Date());
  if(!state.welcomed){ setTimeout(()=>$("#welcome").showModal(),450); }
}
$("#addBtn").addEventListener("click",addThought);
$("#addTopBtn").addEventListener("click",()=>{input.focus();input.scrollIntoView({behavior:"smooth",block:"center"});});
$("#emptyAdd").addEventListener("click",()=>input.focus());
$("#startBtn").addEventListener("click",()=>{$("#welcome").close();state.welcomed=true;save();input.focus();});
$("#closeWelcome").addEventListener("click",()=>{$("#welcome").close();state.welcomed=true;save();});
input.addEventListener("keydown",e=>{if(e.key==="Enter")addThought();});
document.addEventListener("keydown",e=>{if(e.key.toLowerCase()==="n" && document.activeElement.tagName!=="INPUT"){$("#addTopBtn").click();}});
cards.addEventListener("click",e=>{
  const b=e.target.closest("[data-action]"); if(!b)return;
  b.dataset.action==="toggle"?toggle(b.dataset.id):remove(b.dataset.id);
});
document.querySelector(".filters").addEventListener("click",e=>{
  const b=e.target.closest(".filter"); if(!b)return; filter=b.dataset.filter; render();
});
$("#themeBtn").addEventListener("click",()=>{state.theme=state.theme==="dark"?"light":"dark";save();setTheme();});
init();
