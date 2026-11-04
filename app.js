const $ = s => document.querySelector(s);
const state = {view:"companies", search:"", company:"", topic:"", pattern:"", difficulty:"", status:"", sort:"count", showAll:false, page:1, pageSize:30};
let problems=[], meta={}, solved=new Set(), bookmarked=new Set(), toastTimer, modalReturnFocus=null;
const MAX_SEARCH_LENGTH=200;
const fmt = n => Number(n||0).toLocaleString("en-IN");
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
// LeetCode problem URLs use a slug derived from the title (e.g. "Two Sum" -> two-sum).
// Add an entry here when a problem's real slug differs from its title.
const SLUG_OVERRIDES = {
 "Add and Search Word - Data structure design":"design-add-and-search-words-data-structure"
};
const slugify = t => String(t).normalize("NFKD").toLowerCase().replace(/['\u2019`]/g,"").replace(/[()]/g,"").replace(/[^a-z0-9]+/g," ").trim().replace(/ +/g,"-");
const leetcodeSearchUrl = p => {
 const url = new URL("https://leetcode.com/problemset/");
 url.searchParams.set("search",p.title);
 return url.href;
};
const leetcodeUrl = p => {
 const slug = SLUG_OVERRIDES[p.title] || slugify(p.title);
 return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? `https://leetcode.com/problems/${slug}/` : leetcodeSearchUrl(p);
};
const key = "codeatlas-progress-v1";
function validIds(values){
 const known=new Set(problems.map(p=>p.id));
 return Array.isArray(values)?values.filter(id=>Number.isSafeInteger(id)&&known.has(id)):[];
}
function loadProgress(){
 try{
  const raw=localStorage.getItem(key);
  if(!raw)return;
  const x=JSON.parse(raw);
  if(!x||typeof x!=="object"||Array.isArray(x))throw new Error("Saved progress has an invalid format");
  solved=new Set(validIds(x.solved));
  bookmarked=new Set(validIds(x.bookmarked));
 }catch(e){solved=new Set();bookmarked=new Set();console.warn("Could not read saved CodeAtlas progress; starting with an empty list.",e)}
}
function saveProgress(){
 try{localStorage.setItem(key,JSON.stringify({solved:[...solved],bookmarked:[...bookmarked]}));return true}
 catch(e){console.error("Could not save CodeAtlas progress.",e);notify("Progress changed but could not be saved in this browser");return false}
}
function loadTheme(){
 try{const theme=localStorage.getItem("codeatlas-theme");if(theme==="light"||theme==="dark")setTheme(theme)}
 catch(e){console.warn("Could not read the saved CodeAtlas theme.",e)}
}
function setTheme(theme){
 document.documentElement.dataset.theme=theme;
 $("#themeToggle").setAttribute("aria-pressed",String(theme==="light"));
}
function saveTheme(theme){
 setTheme(theme);
 try{localStorage.setItem("codeatlas-theme",theme)}
 catch(e){console.error("Could not save the CodeAtlas theme.",e);notify("Theme changed but could not be saved in this browser")}
}
function normalizeProblem(p){
 if(!p||!Number.isSafeInteger(p.id)||p.id<1||typeof p.title!=="string"||!p.title.trim())return null;
 const list=value=>Array.isArray(value)?value.filter(item=>typeof item==="string"&&item.trim()):[];
 const number=(value,fallback=0)=>typeof value==="number"&&Number.isFinite(value)?value:fallback;
 const difficulty=["Easy","Medium","Hard"].includes(p.difficulty)?p.difficulty:"Unknown";
 return {
  id:p.id,title:p.title,likes:number(p.likes),dislikes:number(p.dislikes),likeRatio:number(p.likeRatio),
  acceptance:p.acceptance===null||p.acceptance===undefined?null:number(p.acceptance,null),
  topics:list(p.topics),pattern:typeof p.pattern==="string"?p.pattern:"General",difficulty,
  suggestedDifficulty:typeof p.suggestedDifficulty==="string"?p.suggestedDifficulty:difficulty,
  companies:list(p.companies),companyCount:list(p.companies).length
 };
}
function normalizeMetadata(data){
 const facet=(value,fallback)=>Array.isArray(value)?value.filter(x=>Array.isArray(x)&&typeof x[0]==="string"&&typeof x[1]==="number"&&Number.isFinite(x[1])):fallback;
 const countFacet=select=>{const counts=new Map();problems.forEach(p=>select(p).forEach(name=>counts.set(name,(counts.get(name)||0)+1)));return [...counts.entries()]};
 const companies=countFacet(p=>p.companies);
 const topics=countFacet(p=>p.topics);
 const patterns=countFacet(p=>[p.pattern]);
 return {
  companies:facet(data?.companies,companies),topics:facet(data?.topics,topics),patterns:facet(data?.patterns,patterns),
  companyProblemPairs:typeof data?.companyProblemPairs==="number"&&Number.isFinite(data.companyProblemPairs)?data.companyProblemPairs:companies.reduce((n,x)=>n+x[1],0)
 };
}
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
function syncNav(){
 document.querySelectorAll(".nav-link").forEach(b=>{
  const active=b.dataset.view===state.view;
  b.classList.toggle("active",active);
  if(active)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");
 });
}
function setView(v){state.view=v;state.page=1;syncNav();render();syncURL()}
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
function loadURL(){const u=new URL(location.href);["company","topic","pattern","difficulty","status"].forEach(k=>state[k]=u.searchParams.get(k)||"");state.search=(u.searchParams.get("search")||"").slice(0,MAX_SEARCH_LENGTH);const page=Number(u.searchParams.get("page")||1);state.page=Number.isSafeInteger(page)&&page>0?page:1;state.view=["companies","topics","problems"].includes(u.searchParams.get("view"))?u.searchParams.get("view"):"companies"}
function renderStats(){
 $("#stats").innerHTML=[[fmt(meta.companies.length),"COMPANIES"],[fmt(problems.length),"PROBLEMS"],[fmt(meta.companyProblemPairs),"COMPANY · PROBLEM PAIRS"]].map(([n,l])=>`<div class="stat"><strong>${n}</strong><span>${l}</span></div>`).join("");
}
function renderProgress(){
 const n=solved.size, pct=problems.length?Math.min(100,n/problems.length*100):0;
 $("#progressStrip").innerHTML=`<strong>${fmt(n)} / ${fmt(problems.length)}</strong><span>problems solved</span><progress class="progress-track" value="${pct}" max="100" aria-label="Problems solved">${pct.toFixed(1)}%</progress><span>${pct.toFixed(1)}%</span><span>·</span><span>${fmt(bookmarked.size)} bookmarked</span>`;
}
function difficultyDots(c){return `<div class="difficulty-dots"><b><i class="easy"></i>${fmt(c.easy)}</b><b><i class="medium"></i>${fmt(c.medium)}</b><b><i class="hard"></i>${fmt(c.hard)}</b></div>`}
function entityCard(name,total,c,kind){
 const monogram=name.split(/[\s.-]/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();
 return `<article class="entity-card" role="button" tabindex="0" aria-label="${esc(name)}: ${fmt(total)} problems, browse" data-kind="${kind}" data-name="${esc(name)}"><div class="entity-icon" aria-hidden="true">${esc(monogram||"•")}</div><div class="entity-main"><div class="entity-name">${esc(name)}</div><div class="entity-sub">${fmt(total)} PROBLEMS</div>${difficultyDots(c)}</div><span class="entity-arrow" aria-hidden="true">↗</span></article>`;
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
 document.querySelectorAll(".entity-card").forEach(el=>{
  const open=()=>{const kind=el.dataset.kind;if(kind==="companies")state.company=el.dataset.name;else state.topic=el.dataset.name;state.page=1;state.view="problems";syncControls();setView("problems")};
  el.addEventListener("click",open);
  el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open()}});
 });
}
function renderProblems(){
 let arr=filtered();
 $("#sectionTitle").textContent="Problem explorer";$("#sectionKicker").textContent="THE FULL PRACTICE LIBRARY";
 $("#resultCount").textContent=`${fmt(arr.length)} problems`;
 const pageSize=state.pageSize, pages=Math.max(1,Math.ceil(arr.length/pageSize));
 state.page=Math.min(state.page,pages);
 const shown=arr.slice((state.page-1)*pageSize,state.page*pageSize);
 $("#content").innerHTML=arr.length?`<div class="table-wrap"><table><thead><tr><th>#</th><th>PROBLEM</th><th>DIFFICULTY</th><th>ACCEPTANCE</th><th>TOPICS</th><th>PATTERN</th><th>ASKED AT</th><th>DONE</th></tr></thead><tbody>${shown.map(p=>`<tr data-id="${p.id}"><td>${p.id}</td><td><a class="problem-title problem-link" href="${leetcodeUrl(p)}" target="_blank" rel="noopener noreferrer" title="Open ${esc(p.title)} on LeetCode">${esc(p.title)} <span class="external-mark" aria-hidden="true">↗</span></a>${bookmarked.has(p.id)?' <span class="bookmark-indicator" aria-label="Bookmarked">★</span>':''}</td><td><span class="diff-pill ${esc(p.difficulty)}">${esc(p.difficulty)}</span></td><td>${p.acceptance==null?"—":p.acceptance.toFixed(1)+"%"}</td><td><div class="tag-list">${p.topics.slice(0,2).map(t=>`<span class="tag">${esc(t)}</span>`).join("")}${p.topics.length>2?`<span class="tag">+${p.topics.length-2}</span>`:""}</div></td><td>${esc(p.pattern)}</td><td><strong class="asked-count-cell">${fmt(p.companies.length)}</strong></td><td><input class="status-check" type="checkbox" aria-label="Mark ${esc(p.title)} solved" data-check="${p.id}" ${solved.has(p.id)?"checked":""}></td></tr>`).join("")}</tbody></table></div>${arr.length?pagination(arr.length,pageSize):""}`:`<div class="empty"><strong>No problems found</strong>Try clearing one or more filters.</div>`;
 if(arr.length)wirePagination(arr.length,pageSize);
 document.querySelectorAll("tbody tr").forEach(row=>{
  row.tabIndex=0;
  row.setAttribute("aria-label",`View details for ${row.querySelector(".problem-title").textContent.trim()}`);
  row.addEventListener("click",e=>{if(e.target.closest("input, a, button"))return;openProblem(Number(row.dataset.id))});
  row.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target===row){e.preventDefault();openProblem(Number(row.dataset.id))}});
 });
 document.querySelectorAll("[data-check]").forEach(box=>box.addEventListener("click",e=>e.stopPropagation()));
 document.querySelectorAll("[data-check]").forEach(box=>box.addEventListener("change",()=>toggleSolved(Number(box.dataset.check),box.checked)));
}
function render(){
 syncNav();syncControls();renderProgress();
 if(state.view==="problems")renderProblems();else renderEntities(state.view);
 const chips=[];for(const [k,label] of [["company","Company"],["topic","Topic"],["pattern","Pattern"],["difficulty","Difficulty"],["status","Status"],["search","Search"]])if(state[k])chips.push(`<span class="filter-chip">${label}: ${esc(state[k])}</span>`);
 $("#activeFilters").innerHTML=chips.join("");
 syncURL();
}
function toggleSolved(id,on){on?solved.add(id):solved.delete(id);renderProgress();if(saveProgress())notify(on?"Marked as solved":"Marked as unsolved");}
function openModal(){
 if(!$("#modalBackdrop").classList.contains("open"))modalReturnFocus=document.activeElement;
 const backdrop=$("#modalBackdrop");
 backdrop.classList.add("open");backdrop.setAttribute("aria-hidden","false");
 $("#modalClose").focus();
}
function openProblem(id){
 const p=problems.find(x=>x.id===id);if(!p)return;
 const askedCount=p.companies.length;
 const url=leetcodeUrl(p);
 $("#modalBody").innerHTML=`<div class="modal-kicker">PROBLEM #${p.id}</div><h2 class="modal-title" id="modalTitle">${esc(p.title)}</h2>
 <div class="modal-top-action"><a class="action-btn primary" href="${url}" target="_blank" rel="noopener noreferrer">Open on LeetCode ↗</a> <a class="action-btn" href="${leetcodeSearchUrl(p)}" target="_blank" rel="noopener noreferrer">Link not working? Search ↗</a></div>
 <div class="asked-summary"><div class="asked-number">${fmt(askedCount)}</div><div><strong>${askedCount===1?"company has":"companies have"} asked this</strong><span>Based on the company list in your spreadsheet</span></div></div>
 <div class="modal-meta problem-meta"><span class="diff-pill ${esc(p.difficulty)}">${esc(p.difficulty)}</span><span>Suggested: ${esc(p.suggestedDifficulty)}</span><span>Acceptance: ${p.acceptance==null?"—":p.acceptance.toFixed(1)+"%"}</span><span>♥ ${fmt(p.likes)} · ${fmt(p.dislikes)} dislikes</span></div>
 <div class="modal-section"><h3>TOPICS</h3><div class="tag-list">${p.topics.map(t=>`<button class="company-chip" data-topic="${esc(t)}">${esc(t)}</button>`).join("")||"Uncategorized"}</div></div>
 <div class="modal-section"><h3>PATTERN</h3><button class="company-chip" data-pattern="${esc(p.pattern)}">${esc(p.pattern)}</button></div>
 <div class="modal-section companies-section"><div class="companies-heading"><h3>COMPANIES THAT ASK THIS</h3><span class="count-pill">${fmt(askedCount)} total</span></div><div class="company-chip-list">${p.companies.length?p.companies.map(c=>`<button class="company-chip" data-company="${esc(c)}">${esc(c)}</button>`).join(""):"<span class='modal-meta'>No company data in the source sheet.</span>"}</div></div>
 <div class="modal-actions"><button class="action-btn" id="solveBtn">${solved.has(id)?"✓ Solved":"Mark solved"}</button><button class="action-btn" id="bookmarkBtn">${bookmarked.has(id)?"★ Bookmarked":"☆ Bookmark"}</button></div>`;
 openModal();
 $("#solveBtn").onclick=()=>{toggleSolved(id,!solved.has(id));openProblem(id)};
 $("#bookmarkBtn").onclick=()=>{bookmarked.has(id)?bookmarked.delete(id):bookmarked.add(id);if(saveProgress())notify(bookmarked.has(id)?"Bookmarked":"Bookmark removed");openProblem(id)};
 document.querySelectorAll("[data-topic]").forEach(b=>b.onclick=()=>{state.topic=b.dataset.topic;state.page=1;closeModal();setView("problems")});
 document.querySelectorAll("[data-company]").forEach(b=>b.onclick=()=>{state.company=b.dataset.company;state.page=1;closeModal();setView("problems")});
 document.querySelectorAll("[data-pattern]").forEach(b=>b.onclick=()=>{state.pattern=b.dataset.pattern;state.page=1;closeModal();setView("problems")});
}
function closeModal(){
 const backdrop=$("#modalBackdrop");
 if(!backdrop.classList.contains("open"))return;
 backdrop.classList.remove("open");backdrop.setAttribute("aria-hidden","true");
 if(modalReturnFocus?.isConnected)modalReturnFocus.focus();
 modalReturnFocus=null;
}
function showAbout(){
 $("#modalBody").innerHTML=`<div class="modal-kicker">ABOUT THIS PROJECT</div><h2 class="modal-title" id="modalTitle">A map for deliberate practice.</h2><p class="hero-copy">CodeAtlas turns the supplied LeetCode spreadsheet into a searchable practice library. Browse by company, topic, or problem; combine filters; and track solved and bookmarked problems locally.</p><div class="modal-section"><h3>DATA & CREDITS</h3><p class="modal-meta">Source: LEETCODE SHEET.xlsx · All Problems. Data is provided as-is from the supplied workbook. This independent practice tool is not affiliated with LeetCode or any listed company. LeetCode links open search results; no problem statements are reproduced here.</p><p class="modal-meta">Progress stays in this browser using local storage. The dataset contains ${fmt(problems.length)} problems, ${fmt(meta.companyProblemPairs)} company–problem pairs and ${fmt(meta.companies.length)} companies.</p></div>`;
 openModal();
}
function wire(){
 document.querySelectorAll(".nav-link").forEach(b=>b.onclick=()=>setView(b.dataset.view));
 $("#brandHome").onclick=e=>{e.preventDefault();state.company=state.topic=state.pattern=state.difficulty=state.status=state.search="";setView("companies")};
 $("#themeToggle").onclick=()=>saveTheme(document.documentElement.dataset.theme==="light"?"dark":"light");
 $("#aboutBtn").onclick=showAbout;
 $("#modalClose").onclick=closeModal;$("#modalBackdrop").onclick=e=>{if(e.target===$("#modalBackdrop"))closeModal()};
 ["company","topic","pattern","difficulty","status"].forEach(k=>$("#"+k+"Filter").addEventListener("change",e=>{state[k]=e.target.value;state.page=1;render()}));
 $("#searchInput").addEventListener("input",e=>{state.search=e.target.value.slice(0,MAX_SEARCH_LENGTH);e.target.value=state.search;state.page=1;render()});
 $("#sortSelect").addEventListener("change",e=>{state.sort=e.target.value;state.page=1;render()});
 $("#clearFilters").onclick=()=>{["company","topic","pattern","difficulty","status","search"].forEach(k=>state[k]="");state.showAll=false;state.page=1;render()};
 document.addEventListener("keydown",e=>{
  const backdrop=$("#modalBackdrop");
  if(backdrop.classList.contains("open")){
   if(e.key==="Escape"){e.preventDefault();closeModal();return}
   if(e.key==="Tab"){
    const controls=[...backdrop.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex]:not([tabindex="-1"])')];
    if(!controls.length)return;
    const first=controls[0],last=controls[controls.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
   }
   return;
  }
  if(e.key==="/"&&!["INPUT","TEXTAREA"].includes(document.activeElement.tagName)){e.preventDefault();$("#searchInput").focus()}
  if(e.key==="Escape"&&document.activeElement===$("#searchInput")){$("#searchInput").value="";state.search="";render()}
 });
}
async function init(){
 try{
  const [p,m]=await Promise.all([fetch("data/problems.json"),fetch("data/meta.json")]);if(!p.ok||!m.ok)throw Error("Could not load dataset");
  const [problemData,metadata]=await Promise.all([p.json(),m.json()]);
  if(!Array.isArray(problemData))throw new Error("Problem data must be a JSON array");
  const rejected=problemData.length;
  problems=problemData.map(normalizeProblem).filter(Boolean);
  if(!problems.length)throw new Error("Problem data contains no valid records");
  if(problems.length!==rejected)console.warn(`Skipped ${rejected-problems.length} invalid problem record(s).`);
  meta=normalizeMetadata(metadata);
  loadProgress();loadURL();updateSelects();wire();loadTheme();
  renderStats();render();
 }catch(e){$("#content").textContent="Could not load the practice dataset. Make sure you opened this project through a local web server and that the data folder is beside index.html.";console.error("CodeAtlas initialization failed.",e)}
}
init();
