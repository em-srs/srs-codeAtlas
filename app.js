const $ = s => document.querySelector(s);
const state = {view:"companies", search:"", company:"", topic:"", pattern:"", difficulty:"", status:"", sort:"count", showAll:false, page:1, pageSize:30};
let problems=[], meta={}, solved=new Set(), bookmarked=new Set(), toastTimer;
const fmt = n => Number(n||0).toLocaleString("en-IN");
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const slugify = title => title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const leetcodeUrl = p => `https://leetcode.com/problems/${slugify(p.title)}/`;
const key = "codeatlas-progress-v1";
function loadProgress(){try{const x=JSON.parse(localStorage.getItem(key)||"{}");solved=new Set(x.solved||[]);bookmarked=new Set(x.bookmarked||[])}catch{}}
function saveProgress(){localStorage.setItem(key,JSON.stringify({solved:[...solved],bookmarked:[...bookmarked]}));}
function notify(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),1800)}
function counts(list){return {total:list.length,easy:list.filter(p=>p.difficulty==="Easy").length,medium:list.filter(p=>p.difficulty==="Medium").length,hard:list.filter(p=>p.difficulty==="Hard").length}}
function filtered(){
 let arr=problems.filter(p=>{
  if(state.company&&!p.companies.includes(state.company))return false;
  if(state.topic&&!p.topics.includes(state.topic))return false;
  if(state.pattern&&p.pattern!==state.pattern)return false;
  if(state.difficulty&&p.difficulty!==state.difficulty)return false;
  if(state.status==="solved"&&!solved.has(p.id))return false;
  if(state.status==="unsolved"&&solved.has(p.id))return false;
  if(state.status==="bookmarked"&&!bookmarked.has(p.id))return false;
  if(state.search){const q=state.search.toLowerCase();if(!String(p.id).includes(q)&&!p.title.toLowerCase().includes(q)&&!p.companies.some(c=>c.toLowerCase().includes(q))&&!p.topics.some(t=>t.toLowerCase().includes(q))&&!p.pattern.toLowerCase().includes(q))return false}
  return true;
 });
 if(state.sort==="easy")arr.sort((a,b)=>({Easy:0,Medium:1,Hard:2}[a.difficulty]-({Easy:0,Medium:1,Hard:2}[b.difficulty])||b.companyCount-a.companyCount));
 else if(state.sort==="hard")arr.sort((a,b)=>({Hard:0,Medium:1,Easy:2}[a.difficulty]-({Hard:0,Medium:1,Easy:2}[b.difficulty])||b.companyCount-a.companyCount));
 else if(state.sort==="az")arr.sort((a,b)=>a.title.localeCompare(b.title));
 else if(state.sort==="acceptance")arr.sort((a,b)=>(b.acceptance??-1)-(a.acceptance??-1));
 else if(state.sort==="likes")arr.sort((a,b)=>b.likes-a.likes);
 else if(state.sort==="popularity")arr.sort((a,b)=>b.companyCount-a.companyCount);
 else arr.sort((a,b)=>b.companyCount-a.companyCount||a.id-b.id);
 return arr;
}
function setView(v){state.view=v;state.page=1;document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===v));render();syncURL()}
function updateSelects(){
 const fill=(id,items,label)=>{const el=$(id),old=el.value;el.innerHTML=`<option value="">${label}</option>`+items.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join("");el.value=old};
 fill("#companyFilter",meta.companies.map(x=>x[0]).sort((a,b)=>a.localeCompare(b)),"All companies");
 fill("#topicFilter",meta.topics.map(x=>x[0]).sort((a,b)=>a.localeCompare(b)),"All topics");
 fill("#patternFilter",meta.patterns.map(x=>x[0]).sort((a,b)=>a.localeCompare(b)),"All patterns");
}
function syncControls(){
 $("#companyFilter").value=state.company;$("#topicFilter").value=state.topic;$("#patternFilter").value=state.pattern;$("#difficultyFilter").value=state.difficulty;$("#statusFilter").value=state.status;$("#searchInput").value=state.search;$("#sortSelect").value=state.sort;
}
function syncURL(){
 const u=new URL(location.href);["company","topic","pattern","difficulty","status","search"].forEach(k=>state[k]?u.searchParams.set(k,state[k]):u.searchParams.delete(k));u.searchParams.set("view",state.view);u.searchParams.set("page",state.page);history.replaceState({}, "",u);
}
function loadURL(){const u=new URL(location.href);["company","topic","pattern","difficulty","status"].forEach(k=>state[k]=u.searchParams.get(k)||"");state.search=u.searchParams.get("search")||"";state.page=Math.max(1,Number(u.searchParams.get("page")||1));state.view=["companies","topics","problems"].includes(u.searchParams.get("view"))?u.searchParams.get("view"):"companies"}
function renderStats(){
 $("#stats").innerHTML=[[fmt(meta.companies.length),"COMPANIES"],[fmt(problems.length),"PROBLEMS"],[fmt(meta.companyProblemPairs),"COMPANY · PROBLEM PAIRS"]].map(([n,l])=>`<div class="stat"><strong>${n}</strong><span>${l}</span></div>`).join("");
}
function renderProgress(){
 const n=solved.size, pct=problems.length?Math.min(100,n/problems.length*100):0;
 $("#progressStrip").innerHTML=`<strong>${fmt(n)} / ${fmt(problems.length)}</strong><span>problems solved</span><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div><span>${pct.toFixed(1)}%</span><span>·</span><span>${fmt(bookmarked.size)} bookmarked</span>`;
}
function difficultyDots(c){return `<div class="difficulty-dots"><b><i class="easy"></i>${fmt(c.easy)}</b><b><i class="medium"></i>${fmt(c.medium)}</b><b><i class="hard"></i>${fmt(c.hard)}</b></div>`}
function entityCard(name,total,c,kind){
 const monogram=name.split(/[\s.-]/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();
 return `<article class="entity-card" data-kind="${kind}" data-name="${esc(name)}"><div class="entity-icon">${esc(monogram||"•")}</div><div class="entity-main"><div class="entity-name">${esc(name)}</div><div class="entity-sub">${fmt(total)} PROBLEMS</div>${difficultyDots(c)}</div><span class="entity-arrow">↗</span></article>`;
}
function pagination(total, pageSize){
 const pages=Math.max(1,Math.ceil(total/pageSize));
 state.page=Math.min(Math.max(1,state.page),pages);
 const start=(state.page-1)*pageSize+1, end=Math.min(state.page*pageSize,total);
 let nums=[];
 const add=n=>{if(!nums.includes(n))nums.push(n)};
 add(1);for(let n=Math.max(2,state.page-2);n<=Math.min(pages-1,state.page+2);n++)add(n);if(pages>1)add(pages);
 nums.sort((a,b)=>a-b);
 let buttons="",prev=0;
 for(const n of nums){if(prev&&n-prev>1)buttons+=`<span class="page-ellipsis">…</span>`;buttons+=`<button class="page-btn ${n===state.page?"active":""}" data-page="${n}" ${n===state.page?"aria-current=page":""}>${n}</button>`;prev=n;}
 return `<div class="pagination"><span class="page-info">Showing <strong>${fmt(start)}–${fmt(end)}</strong> of <strong>${fmt(total)}</strong></span><div class="page-controls"><button class="page-btn page-arrow" data-page="${state.page-1}" ${state.page===1?"disabled":""}>← Prev</button>${buttons}<button class="page-btn page-arrow" data-page="${state.page+1}" ${state.page===pages?"disabled":""}>Next →</button></div><label class="page-size">Rows <select id="pageSizeSelect"><option value="20" ${pageSize===20?"selected":""}>20</option><option value="30" ${pageSize===30?"selected":""}>30</option><option value="50" ${pageSize===50?"selected":""}>50</option><option value="100" ${pageSize===100?"selected":""}>100</option></select></label></div>`;
}
function wirePagination(total,pageSize){
 document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>{if(b.disabled)return;state.page=Number(b.dataset.page);render();window.scrollTo({top:document.querySelector(".workspace").offsetTop-70,behavior:"smooth"})}));
 $("#pageSizeSelect")?.addEventListener("change",e=>{state.pageSize=Number(e.target.value);state.page=1;render()});
}
function renderEntities(kind){
 const all=filtered(), map=new Map();
 if(kind==="companies"){
  all.forEach(p=>p.companies.forEach(c=>{if(!map.has(c))map.set(c,[]);map.get(c).push(p)}));
 }else{
  all.forEach(p=>p.topics.forEach(t=>{if(!map.has(t))map.set(t,[]);map.get(t).push(p)}));
 }
 let items=[...map.entries()].map(([name,ps])=>({name,ps,c:counts(ps),total:ps.length}));
 if(state.sort==="az")items.sort((a,b)=>a.name.localeCompare(b.name));
 else if(state.sort==="hard")items.sort((a,b)=>b.c.hard-a.c.hard||b.total-a.total);
 else if(state.sort==="easy")items.sort((a,b)=>a.c.easy-b.c.easy||b.total-a.total);
 else items.sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name));
 if(kind==="companies"&&!state.showAll&&!state.search&&!state.company&&!state.topic&&!state.pattern&&!state.difficulty&&!state.status)items=items.filter(x=>x.total>1);
 const title=kind==="companies"?"Companies":"Topics";
 $("#sectionTitle").textContent=title;$("#sectionKicker").textContent=kind==="companies"?"THE COMPANY INDEX":"THE TOPIC INDEX";
 $("#resultCount").textContent=`${fmt(items.length)} ${kind}`;
 const pageSize=state.pageSize, pages=Math.max(1,Math.ceil(items.length/pageSize));
 state.page=Math.min(state.page,pages);
 const pageItems=items.slice((state.page-1)*pageSize,state.page*pageSize);
 $("#content").innerHTML=items.length?`<div class="entity-grid">${pageItems.map(x=>entityCard(x.name,x.total,x.c,kind)).join("")}</div>${kind==="companies"&&!state.showAll&&!state.search&&!state.company&&!state.topic&&!state.pattern&&!state.difficulty&&!state.status?`<button class="show-more" id="showAll">Show all companies, including single-problem entries ↗</button>`:""}${pagination(items.length,pageSize)}`:`<div class="empty"><strong>No matching ${title.toLowerCase()}</strong>Try removing a filter or changing your search.</div>`;
 $("#showAll")?.addEventListener("click",()=>{state.showAll=true;state.page=1;render()});
 wirePagination(items.length,pageSize);
 document.querySelectorAll(".entity-card").forEach(el=>el.addEventListener("click",()=>{const kind=el.dataset.kind;if(kind==="companies")state.company=el.dataset.name;else state.topic=el.dataset.name;state.page=1;state.view="problems";syncControls();setView("problems")}));
}
function renderProblems(){
 let arr=filtered();
 $("#sectionTitle").textContent="Problem explorer";$("#sectionKicker").textContent="THE FULL PRACTICE LIBRARY";
 $("#resultCount").textContent=`${fmt(arr.length)} problems`;
 const pageSize=state.pageSize, pages=Math.max(1,Math.ceil(arr.length/pageSize));
 state.page=Math.min(state.page,pages);
 const shown=arr.slice((state.page-1)*pageSize,state.page*pageSize);
 $("#content").innerHTML=arr.length?`<div class="table-wrap"><table><thead><tr><th>#</th><th>PROBLEM</th><th>DIFFICULTY</th><th>ACCEPTANCE</th><th>TOPICS</th><th>PATTERN</th><th>ASKED AT</th><th>DONE</th></tr></thead><tbody>${shown.map(p=>`<tr data-id="${p.id}"><td>${p.id}</td><td><a class="problem-title problem-link" href="${leetcodeUrl(p)}" target="_blank" rel="noopener noreferrer" title="Open ${esc(p.title)} on LeetCode">${esc(p.title)} <span class="external-mark">↗</span></a>${bookmarked.has(p.id)?' <span style="color:var(--accent)">★</span>':''}</td><td><span class="diff-pill ${esc(p.difficulty)}">${esc(p.difficulty)}</span></td><td>${p.acceptance==null?"—":p.acceptance.toFixed(1)+"%"}</td><td><div class="tag-list">${p.topics.slice(0,2).map(t=>`<span class="tag">${esc(t)}</span>`).join("")}${p.topics.length>2?`<span class="tag">+${p.topics.length-2}</span>`:""}</div></td><td>${esc(p.pattern)}</td><td><strong class="asked-count-cell">${fmt(p.companies.length)}</strong></td><td><input class="status-check" type="checkbox" aria-label="Mark ${esc(p.title)} solved" data-check="${p.id}" ${solved.has(p.id)?"checked":""}></td></tr>`).join("")}</tbody></table></div>${arr.length?pagination(arr.length,pageSize):""}`:`<div class="empty"><strong>No problems found</strong>Try clearing one or more filters.</div>`;
 if(arr.length)wirePagination(arr.length,pageSize);
 document.querySelectorAll("tbody tr").forEach(row=>row.addEventListener("click",e=>{if(e.target.closest("input, a, button"))return;openProblem(Number(row.dataset.id))}));
 document.querySelectorAll("[data-check]").forEach(box=>box.addEventListener("click",e=>e.stopPropagation()));
 document.querySelectorAll("[data-check]").forEach(box=>box.addEventListener("change",()=>toggleSolved(Number(box.dataset.check),box.checked)));
}
function render(){
 syncControls();renderProgress();
 if(state.view==="problems")renderProblems();else renderEntities(state.view);
 const chips=[];for(const [k,label] of [["company","Company"],["topic","Topic"],["pattern","Pattern"],["difficulty","Difficulty"],["status","Status"],["search","Search"]])if(state[k])chips.push(`<span class="filter-chip">${label}: ${esc(state[k])}</span>`);
 $("#activeFilters").innerHTML=chips.join("");
 syncURL();
}
function toggleSolved(id,on){on?solved.add(id):solved.delete(id);saveProgress();renderProgress();notify(on?"Marked as solved":"Marked as unsolved");}
function openProblem(id){
 const p=problems.find(x=>x.id===id);if(!p)return;
 const askedCount=p.companies.length;
 const url=leetcodeUrl(p);
 $("#modalBody").innerHTML=`<div class="modal-kicker">PROBLEM #${p.id}</div><h2 class="modal-title" id="modalTitle">${esc(p.title)}</h2>
 <div class="modal-top-action"><a class="action-btn primary" href="${url}" target="_blank" rel="noopener noreferrer">Open on LeetCode ↗</a></div>
 <div class="asked-summary"><div class="asked-number">${fmt(askedCount)}</div><div><strong>${askedCount===1?"company has":"companies have"} asked this</strong><span>Based on the company list in your spreadsheet</span></div></div>
 <div class="modal-meta problem-meta"><span class="diff-pill ${esc(p.difficulty)}">${esc(p.difficulty)}</span><span>Suggested: ${esc(p.suggestedDifficulty)}</span><span>Acceptance: ${p.acceptance==null?"—":p.acceptance.toFixed(1)+"%"}</span><span>♥ ${fmt(p.likes)} · ${fmt(p.dislikes)} dislikes</span></div>
 <div class="modal-section"><h3>TOPICS</h3><div class="tag-list">${p.topics.map(t=>`<button class="company-chip" data-topic="${esc(t)}">${esc(t)}</button>`).join("")||"Uncategorized"}</div></div>
 <div class="modal-section"><h3>PATTERN</h3><button class="company-chip" data-pattern="${esc(p.pattern)}">${esc(p.pattern)}</button></div>
 <div class="modal-section companies-section"><div class="companies-heading"><h3>COMPANIES THAT ASK THIS</h3><span class="count-pill">${fmt(askedCount)} total</span></div><div class="company-chip-list">${p.companies.length?p.companies.map(c=>`<button class="company-chip" data-company="${esc(c)}">${esc(c)}</button>`).join(""):"<span class='modal-meta'>No company data in the source sheet.</span>"}</div></div>
 <div class="modal-actions"><button class="action-btn" id="solveBtn">${solved.has(id)?"✓ Solved":"Mark solved"}</button><button class="action-btn" id="bookmarkBtn">${bookmarked.has(id)?"★ Bookmarked":"☆ Bookmark"}</button></div>`;
 $("#modalBackdrop").classList.add("open");$("#modalBackdrop").setAttribute("aria-hidden","false");
 $("#solveBtn").onclick=()=>{toggleSolved(id,!solved.has(id));openProblem(id)};
 $("#bookmarkBtn").onclick=()=>{bookmarked.has(id)?bookmarked.delete(id):bookmarked.add(id);saveProgress();notify(bookmarked.has(id)?"Bookmarked":"Bookmark removed");openProblem(id)};
 document.querySelectorAll("[data-topic]").forEach(b=>b.onclick=()=>{state.topic=b.dataset.topic;state.page=1;closeModal();setView("problems")});
 document.querySelectorAll("[data-company]").forEach(b=>b.onclick=()=>{state.company=b.dataset.company;state.page=1;closeModal();setView("problems")});
 document.querySelectorAll("[data-pattern]").forEach(b=>b.onclick=()=>{state.pattern=b.dataset.pattern;state.page=1;closeModal();setView("problems")});
}
function closeModal(){$("#modalBackdrop").classList.remove("open");$("#modalBackdrop").setAttribute("aria-hidden","true")}
function wire(){
 document.querySelectorAll(".nav-link").forEach(b=>b.onclick=()=>setView(b.dataset.view));
 $("#brandHome").onclick=e=>{e.preventDefault();state.company=state.topic=state.pattern=state.difficulty=state.status=state.search="";setView("companies")};
 $("#themeToggle").onclick=()=>{const t=document.documentElement.dataset.theme==="light"?"dark":"light";document.documentElement.dataset.theme=t;localStorage.setItem("codeatlas-theme",t)};
 $("#aboutBtn").onclick=()=>{ $("#modalBody").innerHTML=`<div class="modal-kicker">ABOUT THIS PROJECT</div><h2 class="modal-title" id="modalTitle">A map for deliberate practice.</h2><p class="hero-copy">CodeAtlas turns the supplied LeetCode spreadsheet into a searchable practice library. Browse by company, topic, or problem; combine filters; and track solved and bookmarked problems locally.</p><div class="modal-section"><h3>DATA & CREDITS</h3><p class="modal-meta">Source: LEETCODE SHEET.xlsx · All Problems. Data is provided as-is from the supplied workbook. This independent practice tool is not affiliated with LeetCode or any listed company. LeetCode links open search results; no problem statements are reproduced here.</p><p class="modal-meta">Progress stays in this browser using local storage. The dataset contains ${fmt(problems.length)} problems, ${fmt(meta.companyProblemPairs)} company–problem pairs and ${fmt(meta.companies.length)} companies.</p></div>`;$("#modalBackdrop").classList.add("open")};
 $("#modalClose").onclick=closeModal;$("#modalBackdrop").onclick=e=>{if(e.target===$("#modalBackdrop"))closeModal()};
 ["company","topic","pattern","difficulty","status"].forEach(k=>$("#"+k+"Filter").addEventListener("change",e=>{state[k]=e.target.value;state.page=1;render()}));
 $("#searchInput").addEventListener("input",e=>{state.search=e.target.value;state.page=1;render()});
 $("#sortSelect").addEventListener("change",e=>{state.sort=e.target.value;state.page=1;render()});
 $("#clearFilters").onclick=()=>{["company","topic","pattern","difficulty","status","search"].forEach(k=>state[k]="");state.showAll=false;state.page=1;render()};
 document.addEventListener("keydown",e=>{if(e.key==="/"&&!["INPUT","TEXTAREA"].includes(document.activeElement.tagName)){e.preventDefault();$("#searchInput").focus()}if(e.key==="Escape"){closeModal();if(document.activeElement===$("#searchInput")){$("#searchInput").value="";state.search="";render()}}});
}
async function init(){
 try{
  const [p,m]=await Promise.all([fetch("data/problems.json"),fetch("data/meta.json")]);if(!p.ok||!m.ok)throw Error("Could not load dataset");
  problems=await p.json();meta=await m.json();loadProgress();loadURL();updateSelects();wire();
  const saved=localStorage.getItem("codeatlas-theme");if(saved)document.documentElement.dataset.theme=saved;
  renderStats();render();
 }catch(e){$("#content").innerHTML=`<div class="empty"><strong>Could not load the practice dataset.</strong>Make sure you opened this project through a local web server and that the <code>data</code> folder is beside index.html.</div>`;console.error(e)}
}
init();
