
const SAVE_KEY = "yefeng_v06_save";

const ROLES = ["上路","打野","中路","下路","輔助"];
const DAYS = ["一","二","三","四","五","六","日"];

function newGame() {
  return {
    version:"0.6",
    started:false,
    player:{
      name:"夜鋒", age:16, role:"中路",
      cash:8000, allowance:3000,
      rank:"鑽石 IV", lp:23, mmr:54,
      wins:0, losses:0, followers:0, proAttention:0,
      energy:82, stress:22, mood:72, passion:91,
      school:62, family:28,
      stats:{
        操作:61,反應:65,對線:58,補刀:62,換血:57,團戰:56,
        遊戲理解:52,地圖意識:51,決策:48,心態:57,英雄池:45,溝通:50
      }
    },
    date:{year:2026, month:9, week:1, day:1},
    schedule: makeDefaultSchedule(),
    logs:["新的學期開始了。你還只是個默默無名的16歲高中生。"],
    news:["本週高分段競爭激烈，多名年輕玩家開始衝擊宗師。"],
    messages:[
      {from:"阿哲",text:"今天晚上要不要雙排？我剛上翡翠。"}
    ]
  };
}

function makeDefaultSchedule(){
  const s = {};
  for(let i=1;i<=7;i++){
    s[i]= i<=5 ? ["上課","Rank","休息"] : ["休息","Rank","訓練"];
  }
  return s;
}

let state = load();
let activeTab = "home";

function save(){
  localStorage.setItem(SAVE_KEY,JSON.stringify(state));
}
function load(){
  try{
    const x = JSON.parse(localStorage.getItem(SAVE_KEY));
    if(x && x.version) return x;
  }catch(e){}
  return newGame();
}
function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function statAvg(){
  const vals = Object.values(state.player.stats);
  return vals.reduce((a,b)=>a+b,0)/vals.length;
}
function pct(v){ return `${Math.round(clamp(v,0,100))}%`; }

function render(){
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.tab===activeTab));
  const main = document.querySelector("#main");
  if(!state.started){ main.innerHTML = startScreen(); bindStart(); return; }
  main.innerHTML = activeTab==="home" ? homeScreen()
    : activeTab==="schedule" ? scheduleScreen()
    : activeTab==="rank" ? rankScreen()
    : activeTab==="phone" ? phoneScreen()
    : careerScreen();
  bindDynamic();
}

function startScreen(){
  return `
  <section class="card hero center">
    <div class="eyebrow">2026 · 一切從零開始</div>
    <h2 style="font-size:28px;margin-top:8px">登頂之路：夜鋒</h2>
    <p class="muted">16歲，高二。沒有戰隊、沒有粉絲、沒有保證成功的天賦。你只有一個目標：試著走進職業圈。</p>
  </section>
  <section class="card">
    <label>角色名稱</label>
    <input id="nameInput" value="夜鋒" style="width:100%;margin:7px 0 14px;background:#0b1324;border:1px solid var(--line);color:white;padding:12px;border-radius:12px">
    <h3>選擇你的主位置</h3>
    <div class="choice-grid" id="roleGrid">
      ${ROLES.map(r=>`<button class="choice ${r==="中路"?"selected":""}" data-role="${r}"><strong>${r}</strong><span class="small">這會影響早期事件與能力成長。</span></button>`).join("")}
    </div>
    <button id="startBtn" class="btn" style="width:100%;margin-top:14px">開始新生涯</button>
  </section>`;
}

function bindStart(){
  document.querySelectorAll("[data-role]").forEach(b=>{
    b.onclick=()=>{
      document.querySelectorAll("[data-role]").forEach(x=>x.classList.remove("selected"));
      b.classList.add("selected");
      state.player.role=b.dataset.role;
    };
  });
  document.querySelector("#startBtn").onclick=()=>{
    const n=document.querySelector("#nameInput").value.trim();
    if(n) state.player.name=n;
    state.started=true; save(); render();
  }
}

function homeScreen(){
  const p=state.player;
  return `
  <section class="card hero">
    <div class="row space">
      <div>
        <div class="small">2026年9月 · 第${state.date.week}週 · 週${DAYS[state.date.day-1]}</div>
        <h2 style="margin-top:4px">${p.name} · ${p.age}歲 · ${p.role}</h2>
      </div>
      <span class="badge">綜合 ${statAvg().toFixed(1)}</span>
    </div>
    <div class="stat-grid">
      ${miniStat("Rank",`${p.rank} ${p.lp} LP`)}
      ${miniStat("現金",`NT$${p.cash.toLocaleString()}`)}
      ${miniStat("職業關注",`${p.proAttention}/100`)}
      ${miniStat("粉絲",p.followers.toLocaleString())}
    </div>
  </section>

  <section class="card">
    <div class="section-title"><h2>今日狀態</h2><span class="small">每個選擇都會留下代價</span></div>
    ${statusBar("體力",p.energy)}
    ${statusBar("心情",p.mood)}
    ${statusBar("壓力",100-p.stress,true)}
    ${statusBar("遊戲熱情",p.passion)}
  </section>

  <section class="card">
    <div class="section-title"><h2>今天要做什麼？</h2><span class="small">週${DAYS[state.date.day-1]}</span></div>
    <div class="choice-grid">
      <button class="choice action-btn" data-action="rank"><strong>打一場 Rank</strong><span class="small">約50分鐘 · 體力 -6</span></button>
      <button class="choice action-btn" data-action="train"><strong>個人訓練</strong><span class="small">成長慢，但穩定</span></button>
      <button class="choice action-btn" data-action="study"><strong>讀書</strong><span class="small">維持學業與家庭支持</span></button>
      <button class="choice action-btn" data-action="rest"><strong>休息</strong><span class="small">恢復體力、降低壓力</span></button>
    </div>
    <button class="btn secondary" id="nextDayBtn" style="width:100%;margin-top:12px">結束今天</button>
  </section>

  <section class="card">
    <h2>最近紀錄</h2>
    ${state.logs.slice(-5).reverse().map(x=>`<div class="log">${x}</div>`).join("")}
  </section>`;
}

function miniStat(label,value){
  return `<div class="stat"><div class="label">${label}</div><div class="value">${value}</div></div>`;
}
function statusBar(label,v,invert=false){
  return `<div style="margin:10px 0"><div class="row space"><span>${label}</span><span class="small">${Math.round(invert?100-v:v)}/100</span></div><div class="bar"><span style="width:${pct(v)}"></span></div></div>`;
}

function scheduleScreen(){
  return `
  <section class="card">
    <div class="section-title"><h2>本週行程</h2><span class="badge">第${state.date.week}週</span></div>
    <div class="timeline">
      ${DAYS.map((d,i)=>`<div class="day-chip"><strong>週${d}</strong><span class="small">${state.schedule[i+1].join(" · ")}</span></div>`).join("")}
    </div>
  </section>
  <section class="card">
    <h2>調整今天</h2>
    ${["Rank","訓練","讀書","直播","社交","休息"].map(a=>`
      <div class="activity">
        <div><strong>${a}</strong><div class="small">${activityDesc(a)}</div></div>
        <div class="activity-actions"><button data-add="${a}">加入</button></div>
      </div>`).join("")}
    <div class="notice" style="margin-top:12px">V0.6先採簡化排程。完整早晨／放學／晚間／深夜時段會在後續版本接上。</div>
  </section>`;
}

function activityDesc(a){
  return ({
    Rank:"提升排名與實戰經驗",
    訓練:"微幅提升能力",
    讀書:"提高學業、增加家庭支持",
    直播:"累積粉絲，但消耗體力",
    社交:"改善心情，可能觸發人際事件",
    休息:"恢復體力並降低壓力"
  })[a];
}

function rankScreen(){
  const p=state.player;
  const wr = p.wins+p.losses ? Math.round(p.wins/(p.wins+p.losses)*100) : 0;
  return `
  <section class="card rank-card center">
    <div class="eyebrow">RANKED SOLO</div>
    <div class="big-number">${p.rank}</div>
    <div>${p.lp} LP</div>
    <p class="small">戰績 ${p.wins}勝 ${p.losses}敗 · 勝率 ${wr}%</p>
    <button class="btn action-btn" data-action="rank">開始配對</button>
  </section>
  <section class="card">
    <h2>能力摘要</h2>
    <div class="stat-grid">
      ${Object.entries(p.stats).map(([k,v])=>miniStat(k,v.toFixed(1))).join("")}
    </div>
  </section>`;
}

function phoneScreen(){
  return `
  <section class="card">
    <h2>訊息</h2>
    ${state.messages.map(m=>`<div class="log"><strong>${m.from}</strong><div>${m.text}</div></div>`).join("")}
  </section>
  <section class="card">
    <h2>電競新聞</h2>
    ${state.news.slice().reverse().map(n=>`<div class="log">${n}</div>`).join("")}
  </section>`;
}

function careerScreen(){
  const p=state.player;
  return `
  <section class="card">
    <div class="section-title"><h2>生涯檔案</h2><span class="badge">正式存檔</span></div>
    <div class="stat-grid">
      ${miniStat("年齡",`${p.age}歲`)}
      ${miniStat("主位置",p.role)}
      ${miniStat("學業",`${p.school}/100`)}
      ${miniStat("家庭支持",`${p.family}/100`)}
    </div>
  </section>
  <section class="card">
    <h2>目前目標</h2>
    <div class="log"><strong>短期：</strong>在17歲前盡可能接近大師。</div>
    <div class="log"><strong>職業：</strong>讓職業關注從0累積到20以上。</div>
    <div class="log"><strong>生活：</strong>別讓學業、家庭、體力與熱情一起崩掉。</div>
  </section>
  <section class="card">
    <h2>存檔</h2>
    <p class="muted">V0.6會在每次行動與換日後自動儲存在你的瀏覽器。</p>
    <button class="btn secondary" id="exportBtn">匯出存檔文字</button>
  </section>`;
}

function bindDynamic(){
  document.querySelectorAll(".action-btn").forEach(b=>b.onclick=()=>performAction(b.dataset.action));
  const nd=document.querySelector("#nextDayBtn");
  if(nd) nd.onclick=nextDay;
  document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>{
    state.schedule[state.date.day].push(b.dataset.add);
    state.logs.push(`你把「${b.dataset.add}」加入了今天的行程。`);
    save(); render();
  });
  const ex=document.querySelector("#exportBtn");
  if(ex) ex.onclick=()=>showModal(`<h2>存檔文字</h2><p class="small">複製並保存這段JSON即可備份。</p><textarea style="width:100%;height:240px;background:#0b1324;color:white;border:1px solid var(--line);border-radius:12px;padding:10px">${JSON.stringify(state)}</textarea><button class="btn close-modal" style="width:100%;margin-top:10px">關閉</button>`);
}

function performAction(type){
  if(state.player.energy<=5 && type!=="rest"){
    showModal(`<h2>你太累了</h2><p>現在硬撐只會讓表現變差。先休息吧。</p><button class="btn close-modal" style="width:100%">知道了</button>`); return;
  }
  if(type==="rank") playRank();
  if(type==="train") train();
  if(type==="study") study();
  if(type==="rest") rest();
}

function playRank(){
  const p=state.player;
  const strength = statAvg() + (p.mood-50)*0.05 - p.stress*0.05 + rand(-8,8);
  const win = strength >= 54;
  const k=rand(win?4:1,win?11:6), d=rand(win?1:4,win?5:10), a=rand(2,13);
  let delta;
  if(win){
    delta=rand(19,27); p.wins++; p.lp += delta; p.mood=clamp(p.mood+3,0,100); p.stress=clamp(p.stress-1,0,100);
  }else{
    delta=-rand(17,24); p.losses++; p.lp += delta; p.mood=clamp(p.mood-4,0,100); p.stress=clamp(p.stress+4,0,100);
  }
  p.energy=clamp(p.energy-6,0,100);
  p.stats.對線 += Math.random()*0.08;
  p.stats.決策 += Math.random()*0.06;
  adjustRank();
  const scouting = (p.rank.includes("大師")||p.rank.includes("宗師")) && win && k>=8;
  if(scouting) p.proAttention=clamp(p.proAttention+1,0,100);
  state.logs.push(`${win?"勝利":"敗北"}｜${k}/${d}/${a}｜${delta>0?"+":""}${delta} LP。`);
  save();
  showModal(`
    <h2 class="${win?"goodtext":"badtext"}">${win?"勝利":"敗北"}</h2>
    <div class="big-number">${k} / ${d} / ${a}</div>
    <p>${p.rank} · ${p.lp} LP</p>
    <p class="small">這只是簡化比賽核心。V0.7會接上英雄選擇、對線事件與龍／巴龍等關鍵決策。</p>
    <button class="btn close-modal" style="width:100%">繼續</button>`);
}

function adjustRank(){
  const p=state.player;
  const order=["鑽石 IV","鑽石 III","鑽石 II","鑽石 I","大師","宗師","菁英"];
  let i=order.indexOf(p.rank);
  while(p.lp>=100 && i<3){ p.lp-=100; i++; p.rank=order[i]; state.logs.push(`晉升！你來到了 ${p.rank}。`); }
  if(i===3 && p.lp>=100){ p.lp-=100; p.rank="大師"; state.logs.push("你第一次踏入大師分段。"); }
  if(p.rank==="大師" && p.lp>=500){ p.rank="宗師"; p.lp-=500; state.logs.push("你升上宗師，開始真正進入高分段視野。"); }
  if(p.rank==="宗師" && p.lp>=800){ p.rank="菁英"; p.lp-=800; state.logs.push("你登上菁英。你的ID開始被更多人記住。"); }
  if(p.lp<0){
    if(i>0 && i<=3){ i--; p.rank=order[i]; p.lp=75; state.logs.push(`掉階到 ${p.rank}。`); }
    else p.lp=0;
  }
}

function train(){
  const p=state.player;
  const keys=Object.keys(p.stats);
  const focus=keys[rand(0,keys.length-1)];
  const gain=(Math.random()*0.18+0.08);
  p.stats[focus]+=gain; p.energy=clamp(p.energy-8,0,100); p.stress=clamp(p.stress+2,0,100);
  state.logs.push(`完成訓練：${focus} +${gain.toFixed(2)}。`);
  save(); render();
}
function study(){
  const p=state.player;
  p.school=clamp(p.school+1.2,0,100); p.family=clamp(p.family+0.5,0,100); p.energy=clamp(p.energy-5,0,100);
  state.logs.push("你花了一段時間讀書。學業略有提升。");
  save(); render();
}
function rest(){
  const p=state.player;
  p.energy=clamp(p.energy+18,0,100); p.stress=clamp(p.stress-8,0,100); p.mood=clamp(p.mood+4,0,100);
  state.logs.push("你放下遊戲休息了一段時間。");
  save(); render();
}

function nextDay(){
  const p=state.player;
  state.date.day++;
  p.energy=clamp(p.energy+10,0,100);
  p.stress=clamp(p.stress-2,0,100);
  if(state.date.day>7){
    state.date.day=1;
    state.date.week++;
    weeklySettlement();
  }
  save(); render();
}

function weeklySettlement(){
  const p=state.player;
  p.cash += 750; // weekly allowance approximation
  if(p.school<50) p.family=clamp(p.family-2,0,100);
  if(p.stress>70) p.passion=clamp(p.passion-3,0,100);
  else p.passion=clamp(p.passion+0.5,0,100);

  const newsPool=[
    "Nova Academy宣布正在觀察新一批高分段年輕玩家。",
    "本週版本更新後，刺客型中路的登場率明顯提高。",
    "高中電競盃公布秋季預賽日期，報名將於近期開放。",
    "高分段玩家 Shika 本週排名快速上升，引起社群討論。",
    "多支青訓隊開始準備冬季測試名單。"
  ];
  const n=newsPool[rand(0,newsPool.length-1)];
  state.news.push(n);
  state.logs.push(`第${state.date.week-1}週結束：零用錢入帳 NT$750。`);
  if(state.date.week===4){
    state.messages.push({from:"阿哲",text:"聽說最近有高中盃要開，你要不要找人組隊？"});
  }
}

function showModal(html){
  const tpl=document.querySelector("#modalTemplate");
  const node=tpl.content.cloneNode(true);
  node.querySelector(".modal-content").innerHTML=html;
  document.body.appendChild(node);
  document.querySelectorAll(".close-modal").forEach(b=>b.onclick=()=>document.querySelector(".modal-backdrop")?.remove());
}

document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>{activeTab=b.dataset.tab;render();});
document.querySelector("#resetBtn").onclick=()=>{
  if(confirm("確定要刪除目前V0.6存檔並重開生涯嗎？")){
    localStorage.removeItem(SAVE_KEY); state=newGame(); activeTab="home"; render();
  }
};

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
render();
