
const SAVE_KEY="yefeng_v10_save";
const OLD_KEYS=["yefeng_v09_save","yefeng_v08_save","yefeng_v07_save","yefeng_v061_save","yefeng_v06_save"];
const ROLES=["上路","打野","中路","下路","輔助"];
const DAYS=["一","二","三","四","五","六","日"];
const WEEKDAY_SLOTS=["放學後","晚間","深夜"];
const WEEKEND_SLOTS=["上午","下午","傍晚","晚間","深夜"];
const HEROES=[
 {id:"liyue",name:"璃月",type:"幻術法師"},
 {id:"yingren",name:"影刃",type:"刺客"},
 {id:"xinghuo",name:"星火",type:"爆發法師"},
 {id:"canglan",name:"蒼嵐",type:"控制法師"},
 {id:"lingfeng",name:"凌風",type:"機動戰士"}
];

function newGame(){
 return {
  version:"1.2.7",started:false,
  player:{
   name:"夜鋒",age:16,role:"中路",cash:8000,rank:"鑽石 IV",lp:23,wins:0,losses:0,
   followers:0,proAttention:0,energy:82,stress:22,mood:72,passion:91,school:62,family:28,
   relations:{阿哲:64,林雨晴:0,Kaito:0,子辰:0},
   stats:{操作:61,反應:65,對線:58,補刀:62,換血:57,團戰:56,遊戲理解:52,地圖意識:51,決策:48,心態:57,英雄池:45,溝通:50},
   mastery:{
    liyue:{level:67,games:42,wins:24},yingren:{level:54,games:28,wins:14},xinghuo:{level:31,games:12,wins:5},
    canglan:{level:18,games:5,wins:2},lingfeng:{level:9,games:2,wins:0}
   }
  },
  date:{year:2026,month:9,week:1,day:1},
  dayState:{usedSlots:0,actions:[]},
  weeklyPlan:{},
  tournament:null,
  characters:{
   阿哲:{name:"阿哲",known:true,desc:"高中好友，翡翠分段。很常找你打遊戲。"},
   林雨晴:{name:"林雨晴",known:false,desc:"同班同學。"},
   Kaito:{name:"Kaito",known:false,desc:"高分段玩家。"},
   子辰:{name:"子辰",known:false,desc:"常出沒在附近電競館的高中生。"}
  },
  eventFlags:{},
  logs:["新的學期開始了。你還只是個默默無名的16歲高中生。"],
  news:["高中電競盃秋季預賽即將開放報名。"],
  messages:[
   {id:"azhe-duo",from:"阿哲",text:"今天晚上要不要雙排？我剛上翡翠。",unread:true,resolved:false,type:"duoInvite"}
  ]
 };
}
function normalize(s){
 if(!s.player)s=newGame();
 if(!s.player.mastery)s.player.mastery=newGame().player.mastery;
 if(!s.player.relations)s.player.relations={阿哲:64,林雨晴:0,Kaito:0,子辰:0};
 if(!s.dayState)s.dayState={usedSlots:0,actions:[]};
 if(!s.weeklyPlan)s.weeklyPlan={};
 if(!s.characters)s.characters=newGame().characters;
 if(!s.eventFlags)s.eventFlags={};
 if(!s.messages)s.messages=[];
 if(!("tournament" in s))s.tournament=null;
 s.version="1.2.7";return s;
}
function load(){
 try{
  let x=JSON.parse(localStorage.getItem(SAVE_KEY));if(x)return normalize(x);
  for(const k of OLD_KEYS){x=JSON.parse(localStorage.getItem(k));if(x)return normalize(x)}
 }catch(e){}
 return newGame();
}
let state=load(),activeTab="home";
const save=()=>localStorage.setItem(SAVE_KEY,JSON.stringify(state));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const avg=()=>Object.values(state.player.stats).reduce((a,b)=>a+b,0)/Object.keys(state.player.stats).length;
const slots=()=>state.date.day<=5?WEEKDAY_SLOTS:WEEKEND_SLOTS;
const remain=()=>slots().length-state.dayState.usedSlots;
const todayPlan=()=>state.weeklyPlan[state.date.day]||[];
const dateLabel=()=>`第${state.date.week}週・週${DAYS[state.date.day-1]}`;
function consume(name,cost=1){
 if(remain()<cost)return false;
 for(let i=0;i<cost;i++){let s=slots()[state.dayState.usedSlots];state.dayState.actions.push(`${s}：${name}`);state.dayState.usedSlots++}
 return true;
}
function addPlan(day,item){
 if(!state.weeklyPlan[day])state.weeklyPlan[day]=[];
 if(!state.weeklyPlan[day].some(x=>x.id===item.id))state.weeklyPlan[day].push(item);
}
function hardEventToday(){return todayPlan().find(x=>x.lockDay&&!x.completed)}
function pendingAppointments(){return todayPlan().filter(x=>!x.completed)}

function stat(label,value){return `<div class="stat"><div class="label">${label}</div><div class="value">${value}</div></div>`}
function bar(label,v,reverse=false){return `<div style="margin:10px 0"><div class="row space"><span>${label}</span><span class="small">${Math.round(reverse?100-v:v)}/100</span></div><div class="bar"><span style="width:${Math.round(clamp(v,0,100))}%"></span></div></div>`}
function closeBtn(){return `<button class="btn close-modal" style="width:100%;margin-top:12px">繼續</button>`}
function modal(html){
 document.querySelector(".modal-backdrop")?.remove();
 const tpl=document.querySelector("#modalTemplate"),node=tpl.content.cloneNode(true);
 node.querySelector(".modal-content").innerHTML=html;document.body.appendChild(node);
 document.querySelectorAll(".close-modal").forEach(b=>b.onclick=()=>{document.querySelector(".modal-backdrop")?.remove();render()});
}
function startScreen(){
 return `<section class="card hero"><div class="eyebrow">2026 · 一切從零開始</div><h2 style="font-size:28px">登頂之路：夜鋒</h2><p class="small">16歲，高二。生活、課業、朋友與職業夢都會一起前進。</p></section>
 <section class="card"><input id="nameInput" value="夜鋒" style="width:100%;padding:12px;border-radius:12px;border:1px solid var(--line);background:#0b1324;color:white"><h3>選擇主位置</h3><div class="choice-grid">${ROLES.map(r=>`<button class="choice ${r==="中路"?"selected":""}" data-role="${r}"><strong>${r}</strong><span class="small">影響成長與事件</span></button>`).join("")}</div><button id="startBtn" class="btn" style="width:100%;margin-top:12px">開始新生涯</button></section>`;
}
function home(){
 const p=state.player,hard=hardEventToday();
 return `<section class="card hero"><div class="row space"><div><div class="small">${dateLabel()}</div><h2>${p.name} · ${p.age}歲 · ${p.role}</h2></div><span class="badge">綜合 ${avg().toFixed(1)}</span></div>
 <div class="stat-grid">${stat("Rank",`${p.rank} ${p.lp} LP`)}${stat("現金",`NT$${p.cash.toLocaleString()}`)}${stat("職業關注",`${p.proAttention}/100`)}${stat("粉絲",p.followers)}</div></section>
 ${hard?lockedDayCard(hard):timeCard()}
 <section class="card"><h2>今日狀態</h2>${bar("體力",p.energy)}${bar("心情",p.mood)}${bar("壓力",100-p.stress,true)}${bar("遊戲熱情",p.passion)}</section>
 ${appointmentCard()}
 ${hard?`<section class="card"><div class="notice">今天是正式賽事日。一般 Rank、訓練、社交、直播、打工與逛街全部鎖定。</div></section>`:actionCard()}
 <section class="card"><h2>最近紀錄</h2>${state.logs.slice(-6).reverse().map(x=>`<div class="log">${x}</div>`).join("")}</section>`;
}
function timeCard(){
 return `<section class="card"><div class="row space"><h2>今日時間</h2><span class="badge">剩餘 ${remain()} 格</span></div><div class="slot-grid">${slots().map((x,i)=>`<div class="slot ${i<state.dayState.usedSlots?"used":""} ${i===state.dayState.usedSlots?"current":""}"><strong>${x}</strong><div class="small">${i<state.dayState.actions.length?(state.dayState.actions[i].split("：")[1]||"已使用"):"未安排"}</div></div>`).join("")}</div></section>`;
}
function lockedDayCard(ev){return `<section class="card hero"><div class="eyebrow">🔒 正式賽事日</div><h2>${ev.title}</h2><p>${ev.desc||"今天的主要行程只有正式比賽。"}</p><button class="btn event-run" data-event="${ev.id}" style="width:100%">前往比賽</button></section>`}
function appointmentCard(){
 const p=pendingAppointments().filter(x=>!x.lockDay);if(!p.length)return "";
 return `<section class="card"><div class="row space"><h2>今日約定</h2><span class="badge">${p.length}項</span></div>${p.map(x=>`<div class="schedule-item"><div><strong>${x.slot} · ${x.title}</strong><div class="small">${x.desc||""}</div></div><button class="ghost event-run" data-event="${x.id}">前往</button></div>`).join("")}</section>`;
}
function actionCard(){
 return `<section class="card"><h2>今天要做什麼？</h2><div class="choice-grid">
 ${actionBtn("rank","🎮 Rank","1時段")}${actionBtn("train","🏋️ 訓練","1時段")}${actionBtn("study","📚 讀書","1時段")}
 ${actionBtn("stream","📺 直播","1時段")}${actionBtn("social","👥 社交","1時段")}${actionBtn("work","💼 打工","2時段")}
 ${actionBtn("outing","🏙️ 外出/逛街","1時段")}${actionBtn("club","🎓 電競社",state.date.day===5?"週五社課":"查看社團")}${actionBtn("rest","🛏️ 休息","1時段")}
 </div><button id="nextDayBtn" class="btn secondary" style="width:100%;margin-top:12px">${remain()===0?"進入下一天":"提早結束今天"}</button></section>`;
}
function actionBtn(t,title,sub){let c=t==="work"?2:1;return `<button class="choice action-btn" data-action="${t}" ${remain()<c?"disabled":""}><strong>${title}</strong><span class="small">${sub}</span></button>`}

function schedule(){
 return `<section class="card"><div class="row space"><h2>本週行程</h2><span class="badge">第${state.date.week}週</span></div><div class="timeline">${DAYS.map((d,i)=>`<div class="day-chip"><strong>週${d}</strong><div class="small">${(state.weeklyPlan[i+1]||[]).length?(state.weeklyPlan[i+1]||[]).map(x=>`${x.lockDay?"🔒 ":""}${x.title}`).join(" · "):"無特殊行程"}</div></div>`).join("")}</div></section>
 <section class="card"><h2>今天</h2>${todayPlan().length?todayPlan().map(x=>`<div class="schedule-item"><div><strong>${x.lockDay?"🔒 ":""}${x.title}</strong><div class="small">${x.slot||"全天"} · ${x.completed?"已完成":"待進行"}</div></div></div>`).join(""):`<div class="small">沒有特殊約定。</div>`}</section>
 <section class="card"><div class="notice">正式比賽、試訓與重要考試屬於「鎖定行程」；比賽日不能安排其他一般活動。</div></section>`;
}
function rankPage(){
 const p=state.player,wr=p.wins+p.losses?Math.round(p.wins/(p.wins+p.losses)*100):0;
 return `<section class="card rank-card" style="text-align:center"><div class="eyebrow">RANKED SOLO</div><div class="big-number">${p.rank}</div><div>${p.lp} LP</div><p class="small">${p.wins}勝 ${p.losses}敗 · 勝率 ${wr}%</p><button class="btn action-btn" data-action="rank" ${remain()<1||hardEventToday()?"disabled":""}>開始配對</button></section>
 <section class="card"><h2>能力摘要</h2><div class="stat-grid">${Object.entries(p.stats).map(([k,v])=>stat(k,v.toFixed(1))).join("")}</div></section>
 ${masteryCard()}`;
}
function masteryCard(){
 return `<section class="card"><div class="row space"><h2>角色熟練度</h2><span class="badge">角色池</span></div>${HEROES.map(h=>{let m=state.player.mastery[h.id]||{level:0,games:0,wins:0};let wr=m.games?Math.round(m.wins/m.games*100):0;return `<div class="log"><div class="row space"><strong>${h.name}｜${h.type}</strong><span>${m.level.toFixed(1)}/100</span></div><div class="small">${m.games}場 · ${m.wins}勝 · 勝率${wr}%</div><div class="bar"><span style="width:${m.level}%"></span></div></div>`}).join("")}</section>`;
}
function phone(){
 const unread=state.messages.filter(m=>m.unread).length;
 return `<section class="card"><div class="row space"><h2>訊息</h2><span class="badge">${unread} 未讀</span></div>${state.messages.slice().reverse().map(m=>`<div class="message ${m.unread?"unread":""}"><button class="message-open" data-msg="${m.id}" style="width:100%;border:0;background:transparent;color:white;text-align:left;padding:0"><div class="meta"><strong>${m.from}</strong><span class="small">${m.resolved?"已處理":m.unread?"未讀":"待回覆"}</span></div><div style="margin-top:6px;white-space:pre-line">${m.text}</div><div class="small" style="margin-top:8px">點擊開啟對話 ›</div></button></div>`).join("")}</section>
 <section class="card"><h2>人物</h2>${Object.values(state.characters).filter(c=>c.known).map(c=>`<div class="log"><strong>${c.name}</strong><div class="small">${c.desc}</div><div class="small">關係 ${Math.round(state.player.relations[c.name]||0)}/100</div></div>`).join("")}</section>
 <section class="card"><h2>電競新聞</h2>${state.news.slice().reverse().map(n=>`<div class="log">${n}</div>`).join("")}</section>`;
}
function career(){
 const p=state.player;return `<section class="card"><h2>生涯檔案</h2><div class="stat-grid">${stat("學業",Math.round(p.school))}${stat("家庭支持",Math.round(p.family))}${stat("阿哲關係",Math.round(p.relations.阿哲))}${stat("粉絲",p.followers)}</div></section>${masteryCard()}<section class="card"><h2>版本</h2><div class="log"><strong>V1.2.7</strong>｜事件/訊息/行程重構、正式比賽日、生活奇遇、角色熟練度、完整Rank與訓練回饋。</div></section>`;
}
function render(){
 try{
  ensureV10();
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.tab===activeTab));
  const main=document.querySelector("#main");
  if(!state.started){main.innerHTML=startScreen();bindStart();return}
  main.innerHTML=activeTab==="home"?home():activeTab==="schedule"?schedule():activeTab==="rank"?rankPage():activeTab==="phone"?phone():career();
  bind();
 }catch(err){
  console.error(err);
  const main=document.querySelector("#main");
  if(main)main.innerHTML=`<section class="card"><h2>⚠️ 存檔相容性修復</h2><p>新版讀取舊存檔時遇到資料異常。</p><button class="primary" onclick="ensureV10();save();location.reload()">修復並重新載入</button><div class="small">${String(err.message||err)}</div></section>`;
 }
}
function bindStart(){
 document.querySelectorAll("[data-role]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-role]").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");state.player.role=b.dataset.role});
 document.querySelector("#startBtn").onclick=()=>{let n=document.querySelector("#nameInput").value.trim();if(n)state.player.name=n;state.started=true;save();render()}
}
function bind(){
 document.querySelectorAll(".action-btn").forEach(b=>b.onclick=()=>act(b.dataset.action));
 document.querySelector("#nextDayBtn")?.addEventListener("click",nextDay);
 document.querySelectorAll(".message-open").forEach(b=>b.onclick=e=>{e.preventDefault();openMessage(b.dataset.msg)});
 document.querySelectorAll(".event-run").forEach(b=>b.onclick=()=>runEventById(b.dataset.event));
}
function act(t){
 const lockedTournament=(todayPlan()||[]).find(e=>e.lockDay&&!e.completed&&e.type==="amateurTournament");
 if(lockedTournament){
   modal(`<h2>🏆 正式比賽日</h2><p>今天是 <strong>${lockedTournament.title}</strong>。全天行程已鎖定，不能安排其他活動。</p><button class="primary" onclick="runEventById('${lockedTournament.id}')">🏆 前往比賽</button>${closeBtn()}`);
   return;
 }
 if(hardEventToday())return;
 if(t==="rank")playRank(false);
 if(t==="train")training();
 if(t==="study")simple("讀書",1,()=>{state.player.school=clamp(state.player.school+1.2,0,100);state.player.family=clamp(state.player.family+.5,0,100);state.player.energy=clamp(state.player.energy-5,0,100);return "學業 +1.2、家庭支持 +0.5。"});
 if(t==="rest")simple("休息",1,()=>{state.player.energy=clamp(state.player.energy+18,0,100);state.player.stress=clamp(state.player.stress-8,0,100);state.player.mood=clamp(state.player.mood+4,0,100);return "體力 +18、壓力 -8、心情 +4。"});
 if(t==="stream")chooseStream();
 if(t==="social")chooseSocial();
 if(t==="work")simple("打工",2,()=>{state.player.cash+=1200;state.player.energy=clamp(state.player.energy-17,0,100);state.player.stress=clamp(state.player.stress+5,0,100);return "收入 NT$1,200，體力 -17、壓力 +5。"});
 if(t==="outing")chooseOuting();
 if(t==="club")return esportsClubAction();
}
function baseSimple(name,cost,fn){if(!consume(name,cost))return;let d=fn();state.logs.push(`${name}：${d}`);save();render();modal(`<h2>${name}完成</h2><p>${d}</p>${closeBtn()}`)}
function chooseHero(cb){
 modal(`<h2>選擇角色</h2><div class="reply-grid">${HEROES.map(h=>{let m=state.player.mastery[h.id];return `<button class="reply hero-choice" data-hero="${h.id}"><strong>${h.name}</strong><div class="small">${h.type} · 熟練度 ${m.level.toFixed(1)}</div></button>`}).join("")}</div>`);
 document.querySelectorAll(".hero-choice").forEach(b=>b.onclick=()=>{document.querySelector(".modal-backdrop")?.remove();cb(b.dataset.hero)});
}
function playRank(isDuo=false){
 if(remain()<1)return;
 chooseHero(heroId=>{
  if(!consume(isDuo?"雙排 Rank":"Rank",1))return;
  const p=state.player,m=p.mastery[heroId],hero=HEROES.find(h=>h.id===heroId);
  const beforeLP=p.lp,beforeMastery=m.level;
  const win=avg()+m.level*.07+(p.mood-50)*.04-p.stress*.04+rand(-10,10)>=58;
  const k=rand(win?4:1,win?12:7),d=rand(win?1:3,win?6:10),a=rand(2,14),cs=rand(175,295),damage=rand(18000,39000);
  let delta=win?rand(19,27):-rand(17,24);
  if(win){p.wins++;p.lp+=delta;p.mood=clamp(p.mood+3,0,100);m.wins++}else{p.losses++;p.lp+=delta;p.mood=clamp(p.mood-4,0,100);p.stress=clamp(p.stress+4,0,100)}
  m.games++;m.level=clamp(m.level+(win?.18:.11),0,100);
  p.energy=clamp(p.energy-6,0,100);p.stats.對線+=.04;p.stats.決策+=.03;adjustRank();
  const lane=["A+","A","A-","B+","B"][rand(0,4)],team=["A","A-","B+","B","B-"][rand(0,4)];
  state.logs.push(`${isDuo?"雙排":"Rank"} ${win?"勝利":"敗北"}｜${hero.name}｜${k}/${d}/${a}｜${delta>0?"+":""}${delta} LP`);
  save();render();
  modal(`<h2 class="${win?"goodtext":"badtext"}">${win?"勝利":"敗北"}</h2><div class="big-number">${k} / ${d} / ${a}</div>
   <div class="stat-grid">${stat("使用角色",hero.name)}${stat("LP",`${beforeLP} → ${p.lp}`)}${stat("補刀",cs)}${stat("傷害",damage.toLocaleString())}</div>
   <div class="log">對線評級：<strong>${lane}</strong>　團戰評級：<strong>${team}</strong></div>
   <div class="log">${hero.name} 熟練度：${beforeMastery.toFixed(1)} → <strong>${m.level.toFixed(1)}</strong>（+${(m.level-beforeMastery).toFixed(2)}）</div>${closeBtn()}`);
 });
}
function adjustRank(){
 const p=state.player,order=["鑽石 IV","鑽石 III","鑽石 II","鑽石 I"];let i=order.indexOf(p.rank);
 while(i>=0&&p.lp>=100){p.lp-=100;if(i<3){i++;p.rank=order[i]}else{p.rank="大師";break}}
 if(p.rank==="大師"&&p.lp>=500){p.lp-=500;p.rank="宗師"}
 // 宗師之後不再有固定晉級分數：LP持續累積，真正進入全服前200才變成菁英。
 if(["宗師","菁英"].includes(p.rank)){
   refreshLeaderboard();
   const inTop200=state.world.leaderboard.some(x=>x.name===p.name);
   p.rank=inTop200?"菁英":"宗師";
 }
 if(p.lp<0)p.lp=0;
}
function training(){
 if(remain()<1)return;
 modal(`<h2>訓練方式</h2><div class="reply-grid"><button class="reply train-type" data-train="stat">基礎能力訓練</button><button class="reply train-type" data-train="hero">角色專項訓練</button><button class="reply train-type" data-train="review">復盤研究</button></div>`);
 document.querySelectorAll(".train-type").forEach(b=>b.onclick=()=>{document.querySelector(".modal-backdrop")?.remove();finishTraining(b.dataset.train)});
}
function finishTraining(type){
 if(type==="hero"){
  chooseHero(id=>{if(!consume("角色專項訓練",1))return;let m=state.player.mastery[id],h=HEROES.find(x=>x.id===id),before=m.level,gain=Math.random()*.35+.22;m.level=clamp(m.level+gain,0,100);state.player.energy=clamp(state.player.energy-8,0,100);state.player.stress=clamp(state.player.stress+2,0,100);state.logs.push(`專項訓練：${h.name} 熟練度 +${gain.toFixed(2)}`);save();render();modal(`<h2>角色專項訓練</h2><p>${h.name}</p><div class="big-number">${before.toFixed(2)} → ${m.level.toFixed(2)}</div><p class="goodtext">熟練度 +${gain.toFixed(2)}</p>${closeBtn()}`)});
  return;
 }
 if(!consume(type==="review"?"復盤研究":"基礎訓練",1))return;
 const p=state.player,keys=type==="review"?["遊戲理解","地圖意識","決策"]:["操作","反應","對線","補刀","換血","團戰"];
 const k=keys[rand(0,keys.length-1)],before=p.stats[k],gain=Math.random()*.18+.08;p.stats[k]+=gain;p.energy=clamp(p.energy-8,0,100);p.stress=clamp(p.stress+2,0,100);
 state.logs.push(`訓練：${k} ${before.toFixed(2)} → ${p.stats[k].toFixed(2)}`);save();render();
 modal(`<h2>訓練完成</h2><p>${k}</p><div class="big-number">${before.toFixed(2)} → ${p.stats[k].toFixed(2)}</div><p class="goodtext">+${gain.toFixed(2)}</p>${closeBtn()}`);
}
function chooseStream(){
 if(remain()<1)return;modal(`<h2>直播內容</h2><div class="reply-grid">${["Rank實況","教學台","雜談","娛樂場"].map(x=>`<button class="reply stream-choice" data-v="${x}">${x}</button>`).join("")}</div>`);
 document.querySelectorAll(".stream-choice").forEach(b=>b.onclick=()=>{if(!consume("直播",1))return;let g=rand(2,9);state.player.followers+=g;state.player.energy=clamp(state.player.energy-7,0,100);state.logs.push(`直播「${b.dataset.v}」，新增${g}位粉絲。`);save();document.querySelector(".modal-backdrop")?.remove();render();modal(`<h2>直播結束</h2><p>新增 ${g} 位粉絲。</p>${closeBtn()}`)});
}
function safeTraits(c){
 const t=c?.traits;
 if(Array.isArray(t))return t;
 if(typeof t==="string")return t.split(/[、,，/]/).map(x=>x.trim()).filter(Boolean);
 return [];
}
function chooseSocial(){
 ensureV10();
 if(remain()<1){modal(`<h2>今天沒有剩餘時段</h2><p>社交需要 1 個時段。</p>${closeBtn()}`);return}
 showSocialPeople();
}
function safeSocialTraits(c){const t=c?.traits;if(Array.isArray(t))return t;if(typeof t==="string")return t.split(/[、,，/]/).map(x=>x.trim()).filter(Boolean);return []}
function showSocialPeople(){
 const main=document.querySelector("#main");if(!main)return;
 const people=Object.values(state.characters||{}).filter(c=>c&&c.known&&c.name);
 main.innerHTML=`<section class="card social-page"><div class="row space"><h2>👥 社交／閒聊</h2><button type="button" id="socialHome" class="ghost">← 返回</button></div><p class="small">選擇角色後，再決定吃飯、約會、雙排或其他活動。</p><div class="social-page-grid">${people.map(c=>`<button type="button" class="choice social-person-page" data-person="${c.name}"><strong>找 ${c.name}</strong><span class="small">${c.gender==="女"?"女生":"男生"} · ${safeSocialTraits(c).join("、")||"個性尚未熟悉"} · 關係 ${Math.round(state.player.relations?.[c.name]||0)}</span></button>`).join("")}</div><button type="button" id="socialGroup" class="btn secondary" style="width:100%;margin-top:12px">揪朋友五排開黑</button></section>`;
 document.querySelector("#socialHome").onclick=render;document.querySelector("#socialGroup").onclick=friendFiveStack;
 document.querySelectorAll(".social-person-page").forEach(b=>b.onclick=()=>showSocialActivities(b.dataset.person));
}
function openSocialActivities(person){showSocialActivities(person)}
function showSocialActivities(person){
 const main=document.querySelector("#main"),c=state.characters?.[person];if(!main||!c){showSocialPeople();return}
 const rel=state.player.relations?.[person]||0,dating=(state.player.romance?.partners||[]).includes(person),esports=isEsportsFriend(person);
 let opts=c.gender==="女"?[["chat","聊天散步","免費"],["food","一起吃飯","NT$350"],["cafe","咖啡廳","NT$280"],["movie","看電影","NT$650"],["date","正式約會",`NT$900 · ${rel>=75||dating?"可進行":"需要關係75+"}`]]:[["food","吃飯聊天","NT$350"],["arcade","去電競館","NT$250"],["hangout","逛街／閒晃","NT$180"],["game","一起打遊戲","NT$100"],["latefood","吃宵夜","NT$220"]];
 if(esports)opts.splice(c.gender==="女"?2:1,0,["duo","Rank雙排","免費"]);
 main.innerHTML=`<section class="card social-page"><div class="row space"><h2>${c.gender==="女"?"💗":"🤝"} ${person}</h2><button type="button" id="socialBack" class="ghost">← 換人</button></div><p class="small">個性：${safeSocialTraits(c).join("、")||"尚未熟悉"}｜關係 ${Math.round(rel)}</p><div class="social-page-grid">${opts.map(o=>`<button type="button" class="choice social-action-page" data-v="${o[0]}" ${(o[0]==="date"&&rel<75&&!dating)?"disabled":""}><strong>${o[1]}</strong><span class="small">${o[2]}</span></button>`).join("")}</div></section>`;
 document.querySelector("#socialBack").onclick=showSocialPeople;document.querySelectorAll(".social-action-page").forEach(b=>b.onclick=()=>socialActivity(person,b.dataset.v));
}
function friendFiveStack(){
 if(!consume("朋友五排",1))return;document.querySelector(".modal-backdrop")?.remove();
 let p=state.player,win=avg()+rand(-9,10)>54,g=win?3:1;
 ["阿哲","俊凱","小宇"].forEach(n=>p.relations[n]=clamp((p.relations[n]||0)+g,0,100));
 p.mood=clamp(p.mood+(win?6:2),0,100);p.energy=clamp(p.energy-7,0,100);
 state.logs.push(`朋友五排：${win?"連勝，語音裡超吵但氣氛很好。":"戰績普通，但大家約好下次再打。"} 好友關係 +${g}。`);
 if(Math.random()<.25&&!state.characters.陳語彤.known){state.characters.陳語彤.known=true;p.relations.陳語彤=8;state.messages.push({id:"junior-"+Date.now(),from:"陳語彤",text:"學長你好，我是剛剛跟小宇一起五排的語彤，下次缺人可以找我。",unread:true,resolved:true,type:"normal"})}
 save();render();
}
function exportSaveJSON(){
 save();const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`yefeng-save-w${state.date.week}-d${state.date.day}.json`;
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function importSaveJSON(ev){
 const f=ev.target.files?.[0];if(!f)return;const reader=new FileReader();
 reader.onload=()=>{try{const data=JSON.parse(reader.result);if(!data.player||!data.date)throw 0;state=data;ensureV10();save();render();modal(`<h2>📥 匯入完成</h2><p>第 ${state.date.week} 週・${DAYS[state.date.day-1]}</p>${closeBtn()}`)}catch(e){alert("無效的夜鋒存檔 JSON。")}};
 reader.readAsText(f);ev.target.value="";
}
function recoverWeek15Friday(){
 if(!confirm("回朔至第15週星期五早上？角色能力、Rank、金錢、人際與裝備會保留。"))return;
 ensureV10();state.date.week=15;state.date.day=5;state.dayState={usedSlots:0,actions:[]};
 if(!state.weeklyPlan)state.weeklyPlan={};
 state.weeklyPlan[5]=(state.weeklyPlan[5]||[]).filter(e=>e.type!=="clubSession"&&!(e.lockDay&&!e.completed));
 if(!state.school.esportsClub)state.school.esportsClub={joined:true,coachRelation:0,clubRep:0,officer:false,scrims:0};
 state.school.esportsClub.joined=true;
 addPlan(5,{id:"club-recovery-w15",title:"電競社固定社課",slot:"放學後",type:"clubSession",lockDay:false,completed:false,desc:"第15週週五社課：教練課、隊內賽、覆盤或他校訓練賽。"});
 state.logs.push("系統修復：回朔至第15週星期五早上，並重建電競社課。");save();activeTab="home";render();
 modal(`<h2>🛠️ 回朔完成</h2><p><strong>第15週・星期五・早上</strong></p><p>角色累積進度已保留，今日行動已清空，放學後社課已重新建立。</p>${closeBtn()}`);
}
function esportsClubAction(){
 ensureV10();const c=state.school.esportsClub;
 if(!c.joined){
  modal(`<h2>🎓 校內電競社</h2><p>社團正在招募社員。每週五放學後固定社課，會有教練培訓、隊內賽與他校訓練賽。</p><button id="joinClub" class="primary">加入電競社</button>${closeBtn()}`);
  document.querySelector("#joinClub").onclick=()=>{c.joined=true;c.clubRep=5;state.logs.push("你正式加入校內電競社。每週五放學後會有社團活動。");document.querySelector(".modal-backdrop")?.remove();save();render()};return;
 }
 if(state.date.day!==5){modal(`<h2>電競社</h2><p>你已經是社員。固定社課在每週五放學後。</p><div class="stat-grid">${stat("社內評價",c.clubRep)}${stat("教練信任",c.coachRelation)}${stat("訓練賽",c.scrims)}</div>${closeBtn()}`);return}
 playClubSession({title:"週五電競社活動"});
}
function playClubSession(ev){
 if(remain()<1)return;consume("電競社活動",1);
 const c=state.school.esportsClub,types=["教練觀念課","隊內對抗賽","比賽覆盤","BP與溝通訓練","他校訓練賽"],type=types[rand(0,types.length-1)];
 c.clubRep=clamp(c.clubRep+1,0,100);c.coachRelation=clamp(c.coachRelation+(type==="他校訓練賽"?2:1),0,100);
 if(type==="他校訓練賽")c.scrims++;
 state.player.passion=clamp(state.player.passion+2,0,100);
 if(Math.random()<.25){const missing=ROLES.filter(r=>r!==state.player.role)[rand(0,3)];discoverTeammate(missing,"電競社社課")}
 state.logs.push(`電競社：${type}。社內評價 +1。`);
 save();render();modal(`<h2>🎓 ${type}</h2><p>${type==="他校訓練賽"?"教練安排與鄰校進行BO3。你開始感受到正式團隊賽與Rank完全不同。":"教練帶著社員完成今天的訓練內容。"}</p><p>教練信任：${c.coachRelation}｜社內評價：${c.clubRep}</p>${closeBtn()}`);
}
function maybeRumor(){
 const p=state.player,candidates=["林雨晴","陳語彤","沈若晴","許安然"].filter(n=>state.characters[n]?.known&&(p.relations[n]||0)>=55);
 if(!candidates.length||Math.random()>.28)return;
 let n=candidates[rand(0,candidates.length-1)],r=`「${p.name}最近是不是常跟${n}待在一起？」班上的群組開始有人討論。`;
 state.world.rumors.unshift(r);p.mood=clamp(p.mood+rand(-4,2),0,100);p.romance.rumorRisk=clamp(p.romance.rumorRisk+8,0,100);
 state.logs.push(`校園緋聞出現：你和${n}的關係開始被注意。`);
}
function processExam(){
 if(state.date.week!==state.school.examWeek||state.date.day!==5||state.school.lastExam)return;
 let p=state.player,score=Math.round(clamp(p.school*.55+state.school.examPrepared*.45+rand(-8,8),0,100));
 state.school.lastExam=score;
 if(score<60){p.family=clamp(p.family-8,0,100);p.mood=clamp(p.mood-6,0,100);state.logs.push(`段考平均 ${score} 分。父母很不滿意，家庭支持 -8。`)}
 else if(score>=85){p.family=clamp(p.family+5,0,100);p.mood=clamp(p.mood+4,0,100);state.logs.push(`段考平均 ${score} 分，成績很好。家庭支持 +5。`)}
 else state.logs.push(`段考平均 ${score} 分，順利過關。`);
}
function simple(name,cost,fn){
 if(name==="休息"){
  if(!consume(name,cost))return;
  const p=state.player;
  const e0=p.energy,m0=p.mood,s0=p.stress;
  p.energy=clamp(p.energy+24,0,100);
  p.mood=clamp(p.mood+7,0,100);
  p.stress=clamp(p.stress-14,0,100);
  state.logs.push(`休息：體力 +${Math.round(p.energy-e0)}、心情 +${Math.round(p.mood-m0)}、壓力 -${Math.round(s0-p.stress)}。`);
  save();render();
  modal(`<h2>休息完成</h2><p>你放下遊戲，好好休息了一段時間。</p><div class="stat-grid">${stat("體力",`${Math.round(e0)} → ${Math.round(p.energy)}`)}${stat("心情",`${Math.round(m0)} → ${Math.round(p.mood)}`)}${stat("壓力",`${Math.round(s0)} → ${Math.round(p.stress)}`)}</div>${closeBtn()}`);
  return;
 }
 if(name==="讀書"){
  if(!consume(name,cost))return;
  state.player.school=clamp(state.player.school+1.2,0,100);state.player.family=clamp(state.player.family+.5,0,100);state.player.energy=clamp(state.player.energy-5,0,100);
  state.school.examPrepared=clamp(state.school.examPrepared+8,0,100);
  state.logs.push(`讀書：學業 +1.2、段考準備 +8。`);save();render();modal(`<h2>讀書完成</h2><p>學業 +1.2、段考準備 +8。</p>${closeBtn()}`);return;
 }
 return baseSimple(name,cost,fn);
}
function maybeRomanceEvent(){
 const p=state.player,partners=p.romance.partners||[];
 const cs=Object.values(state.characters||{}).filter(c=>c.known&&c.gender==="女"&&c.romanceable&&!partners.includes(c.name)&&(p.relations[c.name]||0)>=75&&!p.romance.flags[c.name]?.friendOnly);
 if(!cs.length)return;
 cs.sort((a,b)=>(p.relations[b.name]||0)-(p.relations[a.name]||0));const c=cs[0],rel=p.relations[c.name]||0,f=p.romance.flags[c.name]||{};
 if(f.cooldown&&state.date.week<f.cooldown)return;
 const personality=(c.traits||[]),chance=rel>=90?.48:rel>=85?.28:.14;
 if(Math.random()>chance)return;
 modal(`<h2>💗 ${c.name}｜關係事件</h2><p>你和 ${c.name} 最近的距離已經不太像普通朋友。${partners.length?"你目前已經有交往中的對象。":""}</p><div class="reply-grid"><button class="reply romance-go" data-n="${c.name}" data-v="confess">確認彼此心意</button><button class="reply romance-go" data-n="${c.name}" data-v="wait">先維持曖昧</button><button class="reply romance-go" data-n="${c.name}" data-v="friend">只當朋友</button></div>`);
 document.querySelectorAll(".romance-go").forEach(b=>b.onclick=()=>resolveRomance(b.dataset.n,b.dataset.v));
}
function resolveRomance(name,v){
 const p=state.player,c=state.characters[name],rel=p.relations[name]||0;
 if(v==="wait"){p.romance.flags[name]={cooldown:state.date.week+1};state.logs.push(`你和 ${name} 暫時維持曖昧。`)}
 else if(v==="friend"){p.romance.flags[name]={cooldown:state.date.week+4,friendOnly:true};state.logs.push(`你決定和 ${name} 維持朋友關係。`)}
 else{
  let chance=.40+(rel-75)*.025;if(c.traits?.includes("現實"))chance-=.05;if(c.traits?.includes("天然呆"))chance-=.03;chance=clamp(chance,.35,.90);
  if(Math.random()<chance){p.romance.partners.push(name);p.romance.partner=p.romance.partners[0];p.relations[name]=clamp(rel+3,0,100);state.logs.push(`💞 你和 ${name} 正式開始交往。`)}
  else{p.relations[name]=clamp(rel-2,0,100);p.romance.flags[name]={cooldown:state.date.week+3};state.logs.push(`${name} 還沒有準備好成為戀人。`)}
 }
 save();document.querySelector(".modal-backdrop")?.remove();render();
}
function maybeRomanceExposure(){
 const p=state.player,ps=p.romance.partners||[];if(ps.length<2||Math.random()>.10)return;
 const a=ps[rand(0,ps.length-1)],b=ps.find(x=>x!==a);p.relations[a]=clamp((p.relations[a]||0)-rand(4,10),0,100);
 state.world.rumors.unshift(`有人開始傳你同時和 ${a}、${b} 走得非常近。`);
 state.logs.push(`⚠️ 多重戀情出現曝光風險，${a} 對你的信任下降。`);
}
function openGift(name){
 const g=state.player.gifts||{},items=SHOP_ITEMS.filter(x=>x.gift&&(g[x.id]||0)>0);
 if(!items.length){modal(`<h2>🎁 沒有可送的禮物</h2><p>先到生涯中心的商店購買「小禮物」或「精緻禮盒」。</p>${closeBtn()}`);return}
 modal(`<h2>🎁 送禮給 ${name}</h2>${items.map(x=>`<button class="reply gift-pick" data-id="${x.id}" data-n="${name}">${x.name} ×${g[x.id]}</button>`).join("")}`);
 document.querySelectorAll(".gift-pick").forEach(b=>b.onclick=()=>giveGift(b.dataset.n,b.dataset.id));
}
function giveGift(name,id){
 const p=state.player,c=state.characters[name],x=SHOP_ITEMS.find(a=>a.id===id);if(!x||(p.gifts[id]||0)<1)return;
 p.gifts[id]--;let gain=id==="premiumGift"?5:3;
 if(c.traits?.includes("拜金"))gain+=id==="premiumGift"?4:-1;
 if(c.traits?.includes("老實"))gain=Math.min(gain,4);
 if(c.traits?.includes("可愛"))gain+=1;
 p.relations[name]=clamp((p.relations[name]||0)+gain,0,100);state.logs.push(`🎁 送給 ${name}「${x.name}」，關係 +${gain}。`);
 save();document.querySelector(".modal-backdrop")?.remove();render();
}
function nextDay(){
 ensureV10();let oldWeek=state.date.week,oldDay=state.date.day;baseNextDay();
 if(state.date.day!==oldDay||state.date.week!==oldWeek){simulateNpcRanks();maybeRomanceExposure();maybeRomanceEvent();}
 if(state.date.week!==oldWeek){generateWeeklyNews();advanceTournaments();maybeRumor();
   // long periods of ignoring a partner create jealousy; training-heavy weeks can also hurt romance
   if(state.player.romance.partner&&Math.random()<.35){let n=state.player.romance.partner;state.player.relations[n]=clamp(state.player.relations[n]-2,0,100);state.logs.push(`${n}覺得你最近把太多時間放在遊戲上，感情 -2。`)}
 }
 processExam();
 // school encounters unlock additional NPCs organically
 if(state.date.week>=3&&!state.characters.沈若晴.known&&Math.random()<.08){state.characters.沈若晴.known=true;state.player.relations.沈若晴=7;state.logs.push("校園事件：學生會活動中認識了高三學姊沈若晴。")}
 if(state.date.week>=4&&!state.characters.許安然.known&&Math.random()<.06){state.characters.許安然.known=true;state.player.relations.許安然=12;state.messages.push({id:"oldcrush-"+Date.now(),from:"許安然",text:"好久不見，我好像在朋友的限動看到你？你現在還在打遊戲喔？",unread:true,resolved:true,type:"normal"})}
 save();render();
}

document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>{activeTab=b.dataset.tab;render()});
document.querySelector("#resetBtn").onclick=()=>{if(confirm("確定刪除目前存檔並重開嗎？")){[SAVE_KEY,...OLD_KEYS].forEach(k=>localStorage.removeItem(k));state=newGame();activeTab="home";render()}};
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();
