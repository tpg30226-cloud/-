
const SAVE_KEY = "yefeng_v07_save";
const PREV_SAVE_KEY = "yefeng_v061_save";
const OLD_SAVE_KEY = "yefeng_v06_save";

const ROLES = ["上路","打野","中路","下路","輔助"];
const DAYS = ["一","二","三","四","五","六","日"];
const WEEKDAY_SLOTS = ["放學後","晚間","深夜"];
const WEEKEND_SLOTS = ["上午","下午","傍晚","晚間","深夜"];

function newGame() {
  return {
    version:"0.7",
    started:false,
    player:{
      name:"夜鋒", age:16, role:"中路",
      cash:8000, allowance:3000,
      rank:"鑽石 IV", lp:23, mmr:54,
      wins:0, losses:0, followers:0, proAttention:0,
      energy:82, stress:22, mood:72, passion:91,
      school:62, family:28,
      relations:{阿哲:64},
      stats:{
        操作:61,反應:65,對線:58,補刀:62,換血:57,團戰:56,
        遊戲理解:52,地圖意識:51,決策:48,心態:57,英雄池:45,溝通:50
      }
    },
    date:{year:2026, month:9, week:1, day:1},
    dayState:{usedSlots:0, actions:[]},
    schedule: makeDefaultSchedule(),
    weeklyPlan:{},
    logs:["新的學期開始了。你還只是個默默無名的16歲高中生。"],
    news:["本週高分段競爭激烈，多名年輕玩家開始衝擊宗師。"],
    messages:[
      {id:"azhe-duo-1",from:"阿哲",text:"今天晚上要不要雙排？我剛上翡翠。",unread:true,replied:false,type:"invite-duo"}
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
function normalizeState(x){
  if(!x.dayState) x.dayState={usedSlots:0,actions:[]};
  if(!Array.isArray(x.dayState.actions)) x.dayState.actions=[];
  if(typeof x.dayState.usedSlots!=="number") x.dayState.usedSlots=0;
  if(!x.player.relations) x.player.relations={阿哲:64};
  if(!x.weeklyPlan) x.weeklyPlan={};
  if(!x.messages) x.messages=[];
  x.messages=x.messages.map((m,i)=>({id:m.id||`m${i+1}`,from:m.from||"未知",text:m.text||"",unread:m.unread??true,replied:m.replied??false,type:m.type||(m.from==="阿哲"&&m.text.includes("雙排")?"invite-duo":"normal")}));
  x.version="0.7";
  return x;
}
function load(){
  try{
    const x = JSON.parse(localStorage.getItem(SAVE_KEY));
    if(x && x.version) return normalizeState(x);
    const prev = JSON.parse(localStorage.getItem(PREV_SAVE_KEY));
    if(prev && prev.version) return normalizeState(prev);
    const old = JSON.parse(localStorage.getItem(OLD_SAVE_KEY));
    if(old && old.version) return normalizeState(old);
  }catch(e){}
  return newGame();
}
function currentSlots(){ return state.date.day<=5 ? WEEKDAY_SLOTS : WEEKEND_SLOTS; }
function slotsRemaining(){ return Math.max(0,currentSlots().length-state.dayState.usedSlots); }
function canAct(cost=1){ return slotsRemaining()>=cost; }
function consumeSlots(name,cost=1){
  if(!canAct(cost)) return false;
  const slots=currentSlots();
  for(let i=0;i<cost;i++){
    const slot=slots[state.dayState.usedSlots];
    state.dayState.actions.push(`${slot}：${name}`);
    state.dayState.usedSlots++;
  }
  return true;
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
  const slots=currentSlots();
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
    <div class="section-title"><h2>今日時間</h2><span class="badge">剩餘 ${slotsRemaining()} 格</span></div>
    <div class="slot-grid">
      ${slots.map((slot,i)=>{
        const used=i<state.dayState.usedSlots;
        const current=i===state.dayState.usedSlots;
        const action=used ? (state.dayState.actions[i]?.split("：")[1]||"已使用") : (current?"目前":"未使用");
        return `<div class="slot ${used?"used":""} ${current?"current":""}"><strong>${slot}</strong><div class="small">${action}</div></div>`;
      }).join("")}
    </div>
    <p class="small" style="margin-bottom:0">${state.date.day<=5?"平日白天固定上課，可自由安排 3 個時段。":"週末可自由安排 5 個時段。"} 一般行動目前各消耗 1 格。</p>
  </section>

  <section class="card">
    <div class="section-title"><h2>今日狀態</h2><span class="small">行動後立即更新</span></div>
    ${statusBar("體力",p.energy)}
    ${statusBar("心情",p.mood)}
    ${statusBar("壓力",100-p.stress,true)}
    ${statusBar("遊戲熱情",p.passion)}
  </section>

  <section class="card">
    <div class="section-title"><h2>今天要做什麼？</h2><span class="small">週${DAYS[state.date.day-1]}</span></div>
    <div class="choice-grid">
      <button class="choice action-btn" data-action="rank" ${!canAct()?"disabled":""}><strong>打一場 Rank</strong><span class="small">1時段 · 體力 -6</span></button>
      <button class="choice action-btn" data-action="train" ${!canAct()?"disabled":""}><strong>個人訓練</strong><span class="small">1時段 · 穩定成長</span></button>
      <button class="choice action-btn" data-action="study" ${!canAct()?"disabled":""}><strong>讀書</strong><span class="small">1時段 · 維持學業</span></button>
      <button class="choice action-btn" data-action="stream" ${!canAct()?"disabled":""}><strong>📺 直播</strong><span class="small">1時段 · 累積觀眾</span></button>
      <button class="choice action-btn" data-action="social" ${!canAct()?"disabled":""}><strong>👥 社交</strong><span class="small">1時段 · 維持關係</span></button>
      <button class="choice action-btn" data-action="work" ${!canAct(2)?"disabled":""}><strong>💼 打工</strong><span class="small">2時段 · 賺取收入</span></button>
      <button class="choice action-btn" data-action="shop" ${!canAct()?"disabled":""}><strong>🛒 外出/購物</strong><span class="small">1時段 · 花錢與放鬆</span></button>
      <button class="choice action-btn" data-action="rest" ${!canAct()?"disabled":""}><strong>🛏️ 休息</strong><span class="small">1時段 · 恢復狀態</span></button>
    </div>
    <button class="btn secondary" id="nextDayBtn" style="width:100%;margin-top:12px">${slotsRemaining()===0?"今日行程完成，進入下一天":"提早結束今天"}</button>
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
  const plan=state.weeklyPlan[state.date.day]||[];
  return `
  <section class="card">
    <div class="section-title"><h2>本週行程</h2><span class="badge">第${state.date.week}週</span></div>
    <div class="timeline">${DAYS.map((d,i)=>{const arr=state.weeklyPlan[i+1]||[];return `<div class="day-chip"><strong>週${d}</strong><span class="small">${arr.length?arr.map(x=>x.title).join(" · "):"無特殊行程"}</span></div>`}).join("")}</div>
  </section>
  <section class="card"><h2>今天已安排</h2>${plan.length?plan.map(x=>`<div class="log"><strong>${x.slot||"待定"}</strong>｜${x.title}</div>`).join(""):`<div class="small">今天目前沒有額外邀約。</div>`}</section>
  <section class="card"><div class="notice">V0.7 已開始把「手機訊息 → 回覆 → 行程」串起來。完整每週日排程與自動執行會繼續擴充。</div></section>`;
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
  <section class="card"><h2>訊息</h2>
    ${state.messages.map(m=>`<button data-msg="${m.id}" style="width:100%;text-align:left;background:${m.unread?"#17233d":"#111a2e"};color:white;border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:10px"><div class="row space"><strong>${m.from}</strong><span class="small">${m.replied?"已回覆":m.unread?"未讀":"已讀"}</span></div><div style="margin-top:6px">${m.text.split("\n")[0]}</div></button>`).join("")}
  </section>
  <section class="card"><h2>電競新聞</h2>${state.news.slice().reverse().map(n=>`<div class="log">${n}</div>`).join("")}</section>`;
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
    <h2>版本</h2>
    <p class="muted">V0.7：可回覆訊息、邀約加入行程，並新增直播、社交、打工與購物。</p>
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
  document.querySelectorAll("[data-msg]").forEach(b=>b.onclick=()=>openMessage(b.dataset.msg));
  const ex=document.querySelector("#exportBtn");
  if(ex) ex.onclick=()=>showModal(`<h2>存檔文字</h2><p class="small">複製並保存這段JSON即可備份。</p><textarea style="width:100%;height:240px;background:#0b1324;color:white;border:1px solid var(--line);border-radius:12px;padding:10px">${JSON.stringify(state)}</textarea><button class="btn close-modal" style="width:100%;margin-top:10px">關閉</button>`);
}

function performAction(type){
  if(!canAct()){
    showModal(`<h2>今天已經沒有時間了</h2><p>今天的可用時段已全部用完，請進入下一天。</p><button class="btn close-modal" style="width:100%">知道了</button>`); return;
  }
  if(state.player.energy<=5 && type!=="rest"){
    showModal(`<h2>你太累了</h2><p>現在硬撐只會讓表現變差。先休息吧。</p><button class="btn close-modal" style="width:100%">知道了</button>`); return;
  }
  if(type==="rank") playRank();
  if(type==="train") train();
  if(type==="study") study();
  if(type==="rest") rest();
  if(type==="stream") stream();
  if(type==="social") social();
  if(type==="work") work();
  if(type==="shop") shop();
}

function playRank(){
  const p=state.player;
  if(!consumeSlots("Rank",1)) return;
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
  render();
  showModal(`
    <h2 class="${win?"goodtext":"badtext"}">${win?"勝利":"敗北"}</h2>
    <div class="big-number">${k} / ${d} / ${a}</div>
    <p>${p.rank} · ${p.lp} LP</p>
    <p class="small">已消耗 1 個時段，今日剩餘 ${slotsRemaining()} 格。V0.7會接上英雄選擇、對線事件與龍／巴龍等關鍵決策。</p>
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
  if(!consumeSlots("訓練",1)) return;
  const keys=Object.keys(p.stats);
  const focus=keys[rand(0,keys.length-1)];
  const gain=(Math.random()*0.18+0.08);
  p.stats[focus]+=gain; p.energy=clamp(p.energy-8,0,100); p.stress=clamp(p.stress+2,0,100);
  state.logs.push(`完成訓練：${focus} +${gain.toFixed(2)}。`);
  save(); render();
}
function study(){
  const p=state.player;
  if(!consumeSlots("讀書",1)) return;
  p.school=clamp(p.school+1.2,0,100); p.family=clamp(p.family+0.5,0,100); p.energy=clamp(p.energy-5,0,100);
  state.logs.push("你花了一段時間讀書。學業略有提升。");
  save(); render();
}
function rest(){
  const p=state.player;
  if(!consumeSlots("休息",1)) return;
  p.energy=clamp(p.energy+18,0,100); p.stress=clamp(p.stress-8,0,100); p.mood=clamp(p.mood+4,0,100);
  state.logs.push("你放下遊戲休息了一段時間。");
  save(); render();
}

function stream(){
  if(!consumeSlots("直播",1)) return;
  showModal(`<h2>選擇直播內容</h2><div class="choice-grid"><button class="choice" data-stream="Rank實況"><strong>Rank實況</strong></button><button class="choice" data-stream="教學台"><strong>教學台</strong></button><button class="choice" data-stream="雜談"><strong>雜談</strong></button><button class="choice" data-stream="娛樂場"><strong>娛樂場</strong></button></div>`);
  setTimeout(()=>document.querySelectorAll("[data-stream]").forEach(b=>b.onclick=()=>{const gain=rand(2,9);state.player.followers+=gain;state.player.energy=clamp(state.player.energy-7,0,100);state.logs.push(`直播「${b.dataset.stream}」，新增 ${gain} 位粉絲。`);save();document.querySelector(".modal-backdrop")?.remove();render();showModal(`<h2>直播結束</h2><p>新增 ${gain} 位粉絲。</p><button class="btn close-modal" style="width:100%">繼續</button>`)}),0);
}
function social(){
  if(!consumeSlots("社交",1)) return;
  showModal(`<h2>社交</h2><button class="choice" data-social="azhe" style="width:100%"><strong>找阿哲</strong><span class="small">聊天、吃飯或約下一次雙排</span></button><button class="choice" data-social="solo" style="width:100%;margin-top:8px"><strong>自己出去走走</strong></button>`);
  setTimeout(()=>document.querySelectorAll("[data-social]").forEach(b=>b.onclick=()=>{if(b.dataset.social==="azhe"){state.player.relations.阿哲=clamp(state.player.relations.阿哲+2,0,100);state.player.mood=clamp(state.player.mood+5,0,100);state.logs.push("你和阿哲聊了一陣子，關係變得更好。") }else{state.player.mood=clamp(state.player.mood+3,0,100);state.logs.push("你一個人出去晃了晃，心情稍微放鬆。")};save();document.querySelector(".modal-backdrop")?.remove();render()}),0);
}
function work(){
  if(!consumeSlots("打工",2)) return; state.player.cash+=1200;state.player.energy=clamp(state.player.energy-17,0,100);state.player.stress=clamp(state.player.stress+5,0,100);state.logs.push("完成打工，收入 NT$1,200。 ");save();render();showModal(`<h2>打工完成</h2><p>收入 NT$1,200，但消耗 2 個時段。</p><button class="btn close-modal" style="width:100%">繼續</button>`);
}
function shop(){
  if(!consumeSlots("外出/購物",1)) return;
  showModal(`<h2>外出 / 購物</h2><button class="choice" data-buy="120" style="width:100%">飲料與點心 NT$120</button><button class="choice" data-buy="450" style="width:100%;margin-top:8px">衣服 NT$450</button><button class="choice" data-buy="0" style="width:100%;margin-top:8px">只逛不買</button>`);
  setTimeout(()=>document.querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>{const c=Number(b.dataset.buy);if(state.player.cash>=c){state.player.cash-=c;state.player.mood=clamp(state.player.mood+(c?2:1),0,100);state.logs.push(c?`外出購物花了 NT$${c}。`:"你出去逛了一圈，沒有買東西。")};save();document.querySelector(".modal-backdrop")?.remove();render()}),0);
}
function openMessage(id){
  const m=state.messages.find(x=>x.id===id);if(!m)return;m.unread=false;save();render();
  if(m.type==="invite-duo"&&!m.replied){showModal(`<h2>${m.from}</h2><p>${m.text}</p><button class="choice" data-reply="yes" style="width:100%"><strong>好啊，晚上一起打。</strong></button><button class="choice" data-reply="no" style="width:100%;margin-top:8px"><strong>今天想自己單排，下次吧。</strong></button><button class="choice" data-reply="seen" style="width:100%;margin-top:8px"><strong>先已讀，不回覆。</strong></button>`);setTimeout(()=>document.querySelectorAll("[data-reply]").forEach(b=>b.onclick=()=>replyDuo(m,b.dataset.reply)),0)}else showModal(`<h2>${m.from}</h2><p style="white-space:pre-wrap">${m.text}</p><button class="btn close-modal" style="width:100%">關閉</button>`)
}
function replyDuo(m,choice){
  m.replied=true;
  if(choice==="yes"){if(!state.weeklyPlan[state.date.day])state.weeklyPlan[state.date.day]=[];state.weeklyPlan[state.date.day].push({title:"與阿哲雙排",slot:"晚間"});m.text+="\n\n你：好啊，晚上一起打。";state.messages.push({id:`azhe-${Date.now()}`,from:"阿哲",text:"行，那九點上線！",unread:true,replied:true,type:"normal"});state.player.relations.阿哲=clamp(state.player.relations.阿哲+1,0,100);state.logs.push("你答應阿哲今晚雙排，已加入行程。")}
  else if(choice==="no"){m.text+="\n\n你：今天想自己單排，下次吧。";state.messages.push({id:`azhe-${Date.now()}`,from:"阿哲",text:"OK，下次再約。",unread:true,replied:true,type:"normal"})}
  else m.text+="\n\n（你已讀了訊息）";
  save();document.querySelector(".modal-backdrop")?.remove();render();
}

function nextDay(){
  const p=state.player;
  state.date.day++;
  state.dayState={usedSlots:0,actions:[]};
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
  document.querySelectorAll(".close-modal").forEach(b=>b.onclick=()=>{ document.querySelector(".modal-backdrop")?.remove(); render(); });
}

document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>{activeTab=b.dataset.tab;render();});
document.querySelector("#resetBtn").onclick=()=>{
  if(confirm("確定要刪除目前V0.6存檔並重開生涯嗎？")){
    localStorage.removeItem(SAVE_KEY); localStorage.removeItem(OLD_SAVE_KEY); state=newGame(); activeTab="home"; render();
  }
};

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
render();
