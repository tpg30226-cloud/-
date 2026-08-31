
const SAVE_KEY="yefeng_v10_save";
const OLD_KEYS=["yefeng_v09_save","yefeng_v08_save","yefeng_v07_save","yefeng_v061_save","yefeng_v06_save"];
const ROLES=["上路","打野","中路","下路","輔助"];
const DAYS=["一","二","三","四","五","六","日"];
const WEEKDAY_SLOTS=["放學後","晚間","深夜"];
const WEEKEND_SLOTS=["上午","下午","傍晚","晚間","深夜"];
const HEROES=[
 {id:"liyue",name:"璃月",type:"幻術法師"},{id:"yingren",name:"影刃",type:"刺客"},
 {id:"xinghuo",name:"星火",type:"爆發法師"},{id:"canglan",name:"蒼嵐",type:"控制法師"},
 {id:"lingfeng",name:"凌風",type:"機動戰士"},{id:"xuanshuang",name:"玄霜",type:"冰霜法師"},
 {id:"chiyan",name:"赤焰",type:"近戰法刺"},{id:"shiguang",name:"時光",type:"支援法師"},
 {id:"leiming",name:"雷鳴",type:"爆發刺客"},{id:"xingchen",name:"星辰",type:"遠程炮台"}
];

function newGame(){
 return {
  version:"1.3.8",started:false,
  player:{
   name:"夜鋒",age:16,role:"中路",cash:8000,rank:"鑽石 IV",lp:23,wins:0,losses:0,
   followers:0,proAttention:0,energy:82,stress:22,mood:72,passion:91,school:62,family:28,
   relations:{阿哲:64,林雨晴:0,Kaito:0,子辰:0},
   stats:{操作:66,反應:70,對線:63,補刀:67,換血:62,團戰:61,遊戲理解:57,地圖意識:56,決策:53,心態:62,英雄池:50,溝通:55},
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
 const base=newGame();
 if(!s||typeof s!=="object")return base;
 if(!s.player||typeof s.player!=="object")s.player=base.player;
 const p=s.player,bp=base.player;
 ["name","age","role","cash","rank","lp","wins","losses","followers","proAttention","energy","stress","mood","passion","school","family"].forEach(k=>{if(p[k]==null)p[k]=bp[k]});
 p.stats={...bp.stats,...(p.stats||{})};
 if(!p.v138AllStatsBoosted){
   Object.keys(p.stats).forEach(k=>{if(Number.isFinite(p.stats[k]))p.stats[k]=clamp(p.stats[k]+5,0,100)});
   p.v138AllStatsBoosted=true;
   s.logs=Array.isArray(s.logs)?s.logs:[];
   s.logs.push("V1.3.8 能力校正：夜鋒所有能力永久 +5。");
 }
 p.mastery=p.mastery||{};
 Object.entries(bp.mastery).forEach(([id,m])=>{p.mastery[id]={...m,...(p.mastery[id]||{})}});
 HEROES.forEach((h,i)=>{if(!p.mastery[h.id])p.mastery[h.id]={level:Math.max(3,22-i*2),games:0,wins:0}});
 p.relations={...bp.relations,...(p.relations||{})};
 if(!s.date||typeof s.date!=="object")s.date={...base.date};
 ["year","month","week","day"].forEach(k=>{if(s.date[k]==null)s.date[k]=base.date[k]});
 if(!s.dayState||typeof s.dayState!=="object")s.dayState={usedSlots:0,actions:[]};
 if(!Array.isArray(s.dayState.actions))s.dayState.actions=[];
 if(!Number.isFinite(s.dayState.usedSlots))s.dayState.usedSlots=0;
 if(!s.weeklyPlan||typeof s.weeklyPlan!=="object")s.weeklyPlan={};
 if(!s.characters||typeof s.characters!=="object")s.characters={...base.characters};
 if(!s.eventFlags||typeof s.eventFlags!=="object")s.eventFlags={};
 if(!Array.isArray(s.logs))s.logs=[];
 if(!Array.isArray(s.news))s.news=[];
 if(!Array.isArray(s.messages))s.messages=[];
 if(!("tournament" in s))s.tournament=null;
 s.version="1.3.8";return s;
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
const monthFromWeek=w=>{
 const idx=Math.min(11,Math.floor(((Math.max(1,w)-1)*12)/52));
 return [9,10,11,12,1,2,3,4,5,6,7,8][idx];
};
const calendarYearForWeek=(schoolYear,w)=>monthFromWeek(w)>=9?schoolYear:schoolYear+1;
const dateLabel=()=>{
 const m=monthFromWeek(state.date.week),y=calendarYearForWeek(state.date.year,state.date.week);
 return `${y}年${m}月・第${state.date.week}週・週${DAYS[state.date.day-1]}`;
};
function syncCalendarFields(){
 if(!state.date||typeof state.date!=="object")return;
 state.date.week=Math.max(1,Math.min(52,Math.floor(state.date.week||1)));
 state.date.month=monthFromWeek(state.date.week);
 if(!Number.isFinite(state.date.year))state.date.year=2026;
 if(!Number.isFinite(state.player.birthdaysPassed))state.player.birthdaysPassed=0;
 // Start age 16 in Sep 2026; birthday is in May. May begins around week 35.
 const shouldHavePassed=Math.max(0,(state.date.year-2026)+(state.date.week>=35?1:0));
 if(shouldHavePassed>state.player.birthdaysPassed){
   const diff=shouldHavePassed-state.player.birthdaysPassed;
   state.player.age+=diff;
   state.player.birthdaysPassed=shouldHavePassed;
   state.logs?.push(`🎂 ${state.player.name}迎來生日，現在${state.player.age}歲。`);
 }
}
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
function practicalScale(v){return v>=90?.42:v>=85?.55:v>=80?.68:v>=75?.82:1}
function addAbilityGrowth(key,raw){
 const p=state.player,old=p.stats[key]||0,g=+(raw*practicalScale(old)).toFixed(2);
 p.stats[key]=clamp(old+g,0,100);return +(p.stats[key]-old).toFixed(2);
}
function rankAbilityGrowth(heroId,win,metPro){
 const p=state.player,m=p.mastery[heroId],role=normalizeRole(p.role),rolePools={
  上路:["對線","換血","操作","團戰"],打野:["地圖意識","決策","遊戲理解","溝通"],
  中路:["對線","操作","決策","遊戲理解"],ADC:["操作","反應","補刀","團戰"],輔助:["溝通","地圖意識","決策","團戰"]
 },pool=rolePools[role]||["操作","決策","團戰","遊戲理解"],out=[];
 const count=metPro?3:2;
 for(let i=0;i<count;i++){const k=pool[rand(0,pool.length-1)];if(out.some(x=>x[0]===k))continue;const g=addAbilityGrowth(k,(Math.random()*.055+.035)*(win?1.15:1)*(metPro?1.25:1));out.push([k,g])}
 const usedHeroes=Object.values(p.mastery).filter(x=>x.games>0).length,qualified=Object.values(p.mastery).filter(x=>x.level>=30).length;
 let hpRaw=.018+(usedHeroes>=5?.012:0)+(qualified>=4?.012:0)+(metPro?.012:0);
 const hp=addAbilityGrowth("英雄池",hpRaw);out.push(["英雄池",hp]);
 return out.filter(x=>x[1]>0);
}
function clubAbilityGrowth(type){
 const map={
  "教練觀念課":["遊戲理解","決策","地圖意識"],
  "隊內對抗賽":["操作","對線","團戰","溝通"],
  "比賽覆盤":["遊戲理解","地圖意識","決策"],
  "BP與溝通訓練":["英雄池","溝通","決策","遊戲理解"],
  "他校訓練賽":["團戰","溝通","心態","地圖意識","英雄池"]
 },pool=map[type]||["遊戲理解","溝通"],out=[],n=type==="他校訓練賽"?3:2;
 for(let i=0;i<n;i++){const k=pool[rand(0,pool.length-1)];if(out.some(x=>x[0]===k))continue;const raw=type==="他校訓練賽"?Math.random()*.10+.12:Math.random()*.09+.10;out.push([k,addAbilityGrowth(k,raw)])}
 return out.filter(x=>x[1]>0);
}
function playRank(isDuo=false){
 if(remain()<1)return;
 chooseHero(heroId=>{
  if(!consume(isDuo?"雙排 Rank":"Rank",1))return;
  const p=state.player,m=p.mastery[heroId],hero=HEROES.find(h=>h.id===heroId),beforeLP=p.lp,beforeMastery=m.level;
  const target=p.rank==="菁英"?78:p.rank==="宗師"?72:p.rank==="大師"?65:58;
  const masteryAdj=m.level<20?-18:m.level<30?-10:m.level<50?-5:m.level<70?0:m.level<85?2:Math.min(5,3+(m.level-85)*.13);
  const betrayalPenalty=(p.emotion?.betrayalUntil||0)>=state.date.week?5:0;
  const conditionAdj=clamp((p.mood-60)*.10-(p.stress-25)*.08-(p.energy<45?(45-p.energy)*.12:0),-9,5);
  const poolCount=Object.values(p.mastery).filter(x=>x.level>=50).length,poolAdj=["宗師","菁英"].includes(p.rank)&&poolCount<3?-(3-poolCount)*2:0;
  let baseChance=.50+(avg()-target)*.018;
  const mentalAdj=clamp((p.stats.心態-60)*.0015,-.045,.06);
  let winChance=clamp(baseChance+masteryAdj/100+conditionAdj/100+poolAdj/100+mentalAdj+(isDuo?.015:0)-betrayalPenalty/100,.12,.82);
  const proChance=p.rank==="菁英"?.42:p.rank==="宗師"?.22:p.rank==="大師"?.07:0,metPro=Math.random()<proChance;
  const proNames=["Eclipse.Raven","KNG.Nox","Vortex.Luna","Astra.Zero9","Nova.Mori","Titan.Haku"],pro=metPro?proNames[rand(0,proNames.length-1)]:null;
  if(metPro){winChance=clamp(winChance-.045,.10,.78);ensureProCharacter(pro);p.proEncounters[pro]=(p.proEncounters[pro]||0)+1}
  const win=Math.random()<winChance,k=rand(win?3:0,win?10:6),d=rand(win?1:4,win?7:11),a=rand(2,13);
  const high=["宗師","菁英"].includes(p.rank);let delta=win?rand(high?15:18,high?23:27):-rand(high?17:15,high?25:23);if(m.level<25)delta-=2;
  if(win){p.wins++;p.lp+=delta;p.mood=clamp(p.mood+2,0,100);m.wins++;if(winChance<.46&&Math.random()<.35){const g=+(Math.random()*.10+.05).toFixed(2);p.stats.心態=clamp(p.stats.心態+g,0,100);state.logs.push(`🧠 逆風局取勝，心態 +${g.toFixed(2)}。`)}}else{p.losses++;p.lp+=delta;p.mood=clamp(p.mood-4,0,100);const resilience=clamp((p.stats.心態-55)/45,0,.65);p.stress=clamp(p.stress+5*(1-resilience*.45),0,100);if(Math.random()<.12){const g=+(Math.random()*.07+.03).toFixed(2);p.stats.心態=clamp(p.stats.心態+g,0,100);state.logs.push(`🧠 從失利中累積抗壓經驗，心態 +${g.toFixed(2)}。`)}}
  m.games++;m.level=clamp(m.level+(win?.14:.09),0,100);p.energy=clamp(p.energy-6,0,100);
  const rankGrowth=rankAbilityGrowth(heroId,win,metPro);adjustRank();
  if(rankGrowth.length)state.logs.push(`📈 Rank實戰成長：${rankGrowth.map(x=>`${x[0]} +${x[1].toFixed(2)}`).join("、")}。`);
  let friendNote="";
  if(metPro&&win){p.proAttention=clamp(p.proAttention+rand(1,3),0,100);p.relations[pro]=clamp((p.relations[pro]||20)+2,0,100);state.logs.push(`高分Rank：你擊敗職業圈玩家 ${pro}。`)}
  else if(metPro){p.relations[pro]=clamp((p.relations[pro]||20)+1,0,100);state.logs.push(`高分Rank：你排到職業圈玩家 ${pro}。`)}
  if(metPro&&!isProFriend(pro)&&(p.proEncounters[pro]>=3||(win&&Math.random()<.18))){p.proFriends.push(pro);p.relations[pro]=Math.max(p.relations[pro]||0,35);friendNote=`<div class="notice goodtext">🤝 ${pro} 賽後與你互加好友，可以邀請切磋。</div>`;state.logs.push(`🤝 你和職業選手 ${pro} 互加好友。`)}
  const factors={對線:p.stats.對線,團戰:p.stats.團戰,溝通:p.stats.溝通,決策:p.stats.決策,地圖意識:p.stats.地圖意識,心態:p.stats.心態,"角色熟練度":m.level};
  let lossReason="";
  if(!win){const weak=Object.entries(factors).sort((a,b)=>a[1]-b[1])[0],reasons={對線:"對線處理不足，換血與兵線細節被壓制。",團戰:"團戰站位與進場時機不足。",溝通:"溝通不足，資源與開戰判斷不同步。",決策:"中後期決策不足，轉線與資源交換失誤。",地圖意識:"地圖意識不足，對敵方動向判斷較慢。",心態:"心態波動影響操作與判斷。","角色熟練度":`角色熟練度只有 ${m.level.toFixed(1)}，高分段細節不夠穩定。`};lossReason=masteryAdj<=-10?reasons["角色熟練度"]:reasons[weak[0]]}
  state.logs.push(`${isDuo?"雙排":"Rank"} ${win?"勝利":"敗北"}｜預估勝率${Math.round(winChance*100)}%｜${delta>0?"+":""}${delta} LP${lossReason?`｜${lossReason}`:""}`);
  save();render();
  modal(`<h2 class="${win?"goodtext":"badtext"}">${win?"勝利":"敗北"}</h2>${metPro?`<div class="notice">🔥 本局遇到職業圈玩家 <strong>${pro}</strong>。</div>`:""}${friendNote}<div class="big-number">${k} / ${d} / ${a}</div><div class="stat-grid">${stat("使用角色",hero.name)}${stat("熟練度",m.level.toFixed(1))}${stat("實力基準",`${avg().toFixed(1)} / ${target}`)}${stat("本局預估勝率",`${Math.round(winChance*100)}%`)}</div>${!win?`<div class="notice badtext"><strong>落敗主因：</strong>${lossReason}</div>`:""}<div class="notice goodtext">📈 Rank實戰成長：${rankGrowth.map(x=>`${x[0]} +${x[1].toFixed(2)}`).join("、")}</div>${closeBtn()}`);
 });
}
function adjustRank(){
 const p=state.player,order=["鑽石 IV","鑽石 III","鑽石 II","鑽石 I"];let i=order.indexOf(p.rank);
 while(i>=0&&p.lp>=100){p.lp-=100;if(i<3){i++;p.rank=order[i]}else{p.rank="大師";break}}
 if(p.rank==="大師"&&p.lp>=500){p.lp-=500;p.rank="宗師"}
 if(p.lp<0)p.lp=0;
 if(["宗師","菁英"].includes(p.rank))refreshLeaderboard();
}
function training(){
 if(remain()<1)return;
 modal(`<h2>訓練方式</h2><div class="reply-grid"><button class="reply train-type" data-train="stat">基礎能力訓練</button><button class="reply train-type" data-train="hero">角色專項訓練</button><button class="reply train-type" data-train="review">復盤研究</button><button class="reply train-type" data-train="mental">心理訓練</button></div>`);
 document.querySelectorAll(".train-type").forEach(b=>b.onclick=()=>{document.querySelector(".modal-backdrop")?.remove();finishTraining(b.dataset.train)});
}
function finishTraining(type){
 if(type==="mental"){
  if(!consume("心理訓練",1))return;
  const p=state.player,before=p.stats.心態,scale=before>=90?.42:before>=85?.55:before>=80?.70:1,gain=(Math.random()*.15+.20)*scale,stress0=p.stress;
  p.stats.心態=clamp(before+gain,0,100);p.stress=clamp(p.stress-rand(4,8),0,100);p.energy=clamp(p.energy-5,0,100);
  state.logs.push(`心理訓練：心態 ${before.toFixed(2)} → ${p.stats.心態.toFixed(2)}，壓力 -${Math.round(stress0-p.stress)}。`);save();render();
  modal(`<h2>🧠 心理訓練完成</h2><div class="big-number">${before.toFixed(2)} → ${p.stats.心態.toFixed(2)}</div><p class="goodtext">心態 +${gain.toFixed(2)}</p><p>壓力 -${Math.round(stress0-p.stress)}</p>${closeBtn()}`);return;
 }
 if(type==="hero"){
  chooseHero(id=>{if(!consume("角色專項訓練",1))return;let m=state.player.mastery[id],h=HEROES.find(x=>x.id===id),before=m.level,scale=before>=90?.45:before>=80?.65:before>=70?.82:1,gain=(Math.random()*.28+.28)*scale;m.level=clamp(m.level+gain,0,100);const hpGain=addAbilityGrowth("英雄池",Math.random()*.06+.05);state.player.energy=clamp(state.player.energy-8,0,100);state.player.stress=clamp(state.player.stress+2,0,100);state.logs.push(`專項訓練：${h.name} 熟練度 +${gain.toFixed(2)}、英雄池 +${hpGain.toFixed(2)}`);save();render();modal(`<h2>角色專項訓練</h2><div class="big-number">${before.toFixed(2)} → ${m.level.toFixed(2)}</div><p class="goodtext">+${gain.toFixed(2)}</p>${closeBtn()}`)});
  return;
 }
 if(!consume(type==="review"?"復盤研究":"基礎訓練",1))return;
 const p=state.player,keys=type==="review"?["遊戲理解","地圖意識","決策","溝通"]:["操作","反應","對線","補刀","換血","團戰"],k=keys[rand(0,keys.length-1)],before=p.stats[k];
 const scale=before>=90?.45:before>=85?.58:before>=80?.70:before>=75?.82:1;
 let gain=(Math.random()*.15+.20)*scale;
 if(type!=="review"&&p.inventory?.includes("mouse"))gain*=1.05;if(k==="溝通"&&p.inventory?.includes("headset"))gain*=1.08;
 p.stats[k]=clamp(p.stats[k]+gain,0,100);p.energy=clamp(p.energy-8,0,100);p.stress=clamp(p.stress+2,0,100);
 state.logs.push(`訓練：${k} ${before.toFixed(2)} → ${p.stats[k].toFixed(2)}`);save();render();modal(`<h2>訓練完成</h2><p>${k}</p><div class="big-number">${before.toFixed(2)} → ${p.stats[k].toFixed(2)}</div><p class="goodtext">+${gain.toFixed(2)}</p>${closeBtn()}`);
}
function chooseStream(){
 if(remain()<1)return;modal(`<h2>直播內容</h2><div class="reply-grid">${["Rank實況","教學台","雜談","娛樂場"].map(x=>`<button class="reply stream-choice" data-v="${x}">${x}</button>`).join("")}</div>`);
 document.querySelectorAll(".stream-choice").forEach(b=>b.onclick=()=>{if(!consume("直播",1))return;let g=rand(2,9);state.player.followers+=g;state.player.energy=clamp(state.player.energy-7,0,100);state.logs.push(`直播「${b.dataset.v}」，新增${g}位粉絲。`);save();document.querySelector(".modal-backdrop")?.remove();render();modal(`<h2>直播結束</h2><p>新增 ${g} 位粉絲。</p>${closeBtn()}`)});
}
function fallbackTraits(c){
 const male=["努力","老實","外向","冷靜","好勝","溫和","講義氣","謹慎"];
 const female=["努力","老實","可愛","天然呆","成熟","現實","溫柔","好勝"];
 const pool=c?.gender==="女"?female:male,name=String(c?.name||"角色");
 let h=0;for(const ch of name)h=(h*31+ch.charCodeAt(0))>>>0;
 const a=pool[h%pool.length],b=pool[(Math.floor(h/7)+3)%pool.length];
 return a===b?[a]:[a,b];
}
function normalizeTraits(c){
 if(!c)return[];
 const t=c.traits;
 if(Array.isArray(t))return t.filter(Boolean);
 if(typeof t==="string")return t.split(/[、,，/]/).map(x=>x.trim()).filter(Boolean);
 return [];
}
function safeTraits(c){return normalizeTraits(c)}




function socialActivity(person,type){
 const costs={group:200,chat:0,food:350,cafe:280,movie:650,date:900,arcade:250,hangout:180,game:100,latefood:220,duo:0};
 const cost=costs[type]??0;
 if(remain()<1){modal(`<h2>今天沒有剩餘時段</h2><p>社交需要 1 個時段。</p>${closeBtn()}`);return}
 if(state.player.cash<cost){modal(`<h2>錢不夠</h2><p>這個活動需要 NT$${cost.toLocaleString()}。</p>${closeBtn()}`);return}
 if(!consume("社交",1))return;
 document.querySelector(".modal-backdrop")?.remove();
 state.player.cash-=cost;
 if(person==="同學群"){
   state.player.mood=clamp(state.player.mood+4,0,100);
   state.logs.push(`社交：和班上同學一起聚會，支出 NT$${cost}。`);
   save();render();return;
 }
 const c=state.characters?.[person];
 if(!c){save();render();return}
 const traits=safeTraits(c);
 let gain={chat:2,food:3,cafe:3,movie:4,date:5,arcade:3,hangout:2,game:3,latefood:3,duo:3}[type]||2;
 if(state.player.inventory?.includes("phone"))gain+=1;
 if(traits.includes("拜金")&&["food","cafe","movie","date"].includes(type))gain+=type==="date"?2:1;
 if(traits.includes("天然呆")&&["chat","cafe","hangout"].includes(type))gain+=1;
 if(traits.includes("努力")&&["duo","game","arcade"].includes(type))gain+=1;
 if(traits.includes("老實")&&["food","latefood","chat"].includes(type))gain+=1;
 if(traits.includes("心機")&&type==="chat"&&Math.random()<.35)gain=1;
 if(type==="date"&&(state.player.relations?.[person]||0)>=88)gain+=1;
 state.player.relations=state.player.relations||{};
 state.player.relations[person]=clamp((state.player.relations[person]||0)+gain,0,100);
 state.player.mood=clamp(state.player.mood+3,0,100);
 if(type==="duo"){
   const f=state.friends?.[person],npcForm=f?.form??0,win=Math.random()<clamp(.50+npcForm/100,.30,.70);
   state.logs.push(`社交：和 ${person} Rank雙排，${win?"拿下一勝":"這場輸掉了"}，關係 +${gain}。`);
   if(!win&&Math.random()<.25){
     state.player.relations[person]=clamp(state.player.relations[person]-2,0,100);
     state.logs.push(`${person} 因失利心情不好，關係額外 -2。`);
   }
 }else{
   const labels={chat:"聊天散步",food:"一起吃飯",cafe:"去咖啡廳",movie:"看電影",date:"正式約會",arcade:"去電競館",hangout:"逛街閒晃",game:"一起打遊戲",latefood:"吃宵夜"};
   state.logs.push(`社交：和 ${person}${labels[type]||"相處"}，支出 NT$${cost.toLocaleString()}，關係 +${gain}。`);
 }
 save();render();
 setTimeout(()=>maybeRomanceEvent(),0);
}
function chooseOuting(){
 if(remain()<1)return;
 modal(`<h2>去哪裡？</h2><div class="reply-grid">
 <button class="reply outing-choice" data-place="mall">商場<div class="small">服飾、餐飲，容易遇到同學</div></button>
 <button class="reply outing-choice" data-place="arcade">電競館<div class="small">玩家、業餘隊伍與比賽資訊</div></button>
 <button class="reply outing-choice" data-place="cafe">咖啡廳<div class="small">休息、讀書，也可能偶遇熟人</div></button>
 <button class="reply outing-choice" data-place="store">便利商店<div class="small">便宜、快速，生活型事件較多</div></button>
 <button class="reply outing-choice" data-place="book">書店<div class="small">課業與安靜事件</div></button></div>`);
 document.querySelectorAll(".outing-choice").forEach(b=>b.onclick=()=>{if(!consume("外出",1))return;let place=b.dataset.place;document.querySelector(".modal-backdrop")?.remove();state.player.energy=clamp(state.player.energy-4,0,100);state.player.mood=clamp(state.player.mood+2,0,100);state.logs.push(`外出：去了${placeName(place)}。`);save();render();randomEncounter(place)});
}
function placeName(p){return {mall:"商場",arcade:"電競館",cafe:"咖啡廳",store:"便利商店",book:"書店"}[p]||p}
function randomEncounter(context){
 const r=Math.random();
 if(context==="arcade"&&!state.eventFlags.zichen){
  state.eventFlags.zichen=true;state.characters.子辰.known=true;state.player.relations.子辰=8;
  modal(`<h2>🎲 奇遇｜電競館</h2><p>隔壁五排突然少一個人。一名叫子辰的高中生看向你：「欸，你打${state.player.role}嗎？能不能幫我們補一場？」</p>
  <div class="reply-grid"><button class="reply encounter" data-e="join">加入他們</button><button class="reply encounter" data-e="ask">先問他們什麼段位</button><button class="reply encounter" data-e="watch">在旁邊觀戰</button><button class="reply encounter" data-e="leave">婉拒離開</button></div>`);
  document.querySelectorAll(".encounter").forEach(b=>b.onclick=()=>resolveArcade(b.dataset.e));return;
 }
 if(context==="mall"&&!state.eventFlags.mallRain){
  state.eventFlags.mallRain=true;state.characters.林雨晴.known=true;state.player.relations.林雨晴=Math.max(state.player.relations.林雨晴,6);
  modal(`<h2>🎲 奇遇｜商場</h2><p>你在飲料店排隊時碰到同班的林雨晴。她也認出了你：「欸？你一個人來喔？」</p><div class="reply-grid"><button class="reply mall-e" data-e="invite">問她要不要一起逛</button><button class="reply mall-e" data-e="chat">聊幾句就好</button><button class="reply mall-e" data-e="shy">打招呼後離開</button></div>`);
  document.querySelectorAll(".mall-e").forEach(b=>b.onclick=()=>{let e=b.dataset.e,g=e==="invite"?4:e==="chat"?2:0;state.player.relations.林雨晴=clamp((state.player.relations.林雨晴||0)+g,0,100);state.player.mood=clamp(state.player.mood+(e==="invite"?4:1),0,100);state.messages.push({id:"yu-"+Date.now(),from:"林雨晴",text:e==="invite"?"今天滿好玩的，下次學校見。":"剛剛在商場遇到你好巧 😂",unread:true,resolved:true,type:"normal"});state.logs.push("奇遇後續：你和林雨晴第一次在學校外互動。");save();document.querySelector(".modal-backdrop")?.remove();render()});return;
 }
 const texts={
  cafe:"你安靜坐了一會兒，意外把最近累積的壓力放掉不少。",
  store:"你碰到以前國中的同學，簡單聊了近況。",
  book:"你翻到一本電競選手訪談集，其中談到職業選手每天的訓練方式。",
  social:"聊天途中聽到同學提起最近的高中電競盃。"
 };
 let t=texts[context]||"今天沒有特別的事情發生，但也算是普通生活的一天。";
 state.logs.push("生活事件："+t);save();render();modal(`<h2>生活事件</h2><p>${t}</p><div class="reply-grid"><button class="reply close-modal">繼續</button></div>`);
}
function resolveArcade(e){
 document.querySelector(".modal-backdrop")?.remove();
 if(e==="join"){state.player.relations.子辰=clamp((state.player.relations.子辰||0)+5,0,100);state.player.mood=clamp(state.player.mood+4,0,100);state.messages.push({id:"zc-"+Date.now(),from:"子辰",text:"剛才那場謝啦。你操作不錯，我們有時會缺人，下次再找你。",unread:true,resolved:true,type:"normal"});state.logs.push("奇遇後續：你替子辰的隊伍補了一場，留下了聯絡方式。")}
 else if(e==="ask"){state.player.relations.子辰=clamp((state.player.relations.子辰||0)+2,0,100);state.messages.push({id:"zc2-"+Date.now(),from:"子辰",text:"我們大概翡翠到鑽石啦。下次缺人我再問你。",unread:true,resolved:true,type:"normal"});state.logs.push("奇遇後續：你和子辰交換了遊戲ID。")}
 else if(e==="watch"){state.player.stats.遊戲理解+=.12;state.logs.push("你觀戰了幾局，遊戲理解 +0.12。")}
 else state.logs.push("你婉拒了陌生隊伍，繼續自己的行程。");
 save();render();
}
function openMessage(id){
 const m=state.messages.find(x=>x.id===id);if(!m)return;m.unread=false;save();
 const replySets={
  duoInvite:[
   ["yes","好啊，晚上一起打。"],["no","今天想自己單排，下次吧。"],["later","今天不確定，晚點再說。"]
  ],
  teamInvite:[
   ["join","好，我們組隊報名。"],["ask","先問比賽時間跟隊友。"],["decline","最近沒辦法參加。"]
  ]
 };
 if(!m.resolved&&replySets[m.type]){
  modal(`<h2>${m.from}</h2><p style="white-space:pre-line">${m.text}</p><div class="reply-grid">${replySets[m.type].map(x=>`<button class="reply msg-reply" data-r="${x[0]}">${x[1]}</button>`).join("")}</div>`);
  document.querySelectorAll(".msg-reply").forEach(b=>b.onclick=()=>resolveMessage(m,b.dataset.r));
 }else modal(`<h2>${m.from}</h2><p style="white-space:pre-line">${m.text}</p>${closeBtn()}`);
 render();
}
function resolveMessage(m,r){
 if(m.type==="duoInvite"){
  if(r==="yes"){addPlan(state.date.day,{id:"duo-"+state.date.week+"-"+state.date.day,title:"與阿哲雙排",slot:"晚間",type:"duoAppointment",lockDay:false,completed:false,desc:"你已經答應阿哲，別忘記上線。"});state.player.relations.阿哲=clamp((state.player.relations.阿哲||0)+1,0,100);state.messages.push({id:"duo-ok-"+Date.now(),from:"阿哲",text:"好，那九點上線！",unread:true,resolved:true,type:"normal"});state.logs.push("約定已加入行程：晚間與阿哲雙排。")}
  if(r==="no"){state.player.relations.阿哲=clamp((state.player.relations.阿哲||0)-.5,0,100);state.messages.push({id:"duo-no-"+Date.now(),from:"阿哲",text:"OK，下次再約。",unread:true,resolved:true,type:"normal"})}
  if(r==="later"){state.messages.push({id:"duo-later-"+Date.now(),from:"阿哲",text:"行，有空再敲我。",unread:true,resolved:true,type:"normal"})}
 }
 if(m.type==="teamInvite"){
  if(r==="join"){registerTournament();state.player.relations.阿哲=clamp((state.player.relations.阿哲||0)+3,0,100);state.messages.push({id:"team-ok-"+Date.now(),from:"阿哲",text:"太好了！我去拉人。賽程確定後我傳給你。",unread:true,resolved:true,type:"normal"})}
  if(r==="ask"){state.messages.push({id:"team-info-"+Date.now(),from:"阿哲",text:"預賽在下週六，BO1。現在還缺打野跟輔助。你想打的話我就先報名。",unread:true,resolved:false,type:"teamInvite"})}
  if(r==="decline"){state.player.relations.阿哲=clamp((state.player.relations.阿哲||0)-1,0,100);state.messages.push({id:"team-no-"+Date.now(),from:"阿哲",text:"可惜，那我再找別人。",unread:true,resolved:true,type:"normal"})}
 }
 m.resolved=true;save();document.querySelector(".modal-backdrop")?.remove();render();
}
function registerTournament(){
 state.tournament={name:"高中電競盃秋季預賽",registered:true,played:false};
 let targetDay=6;
 addPlan(targetDay,{id:"hs-cup-1",title:"高中電競盃秋季預賽",slot:"全天",type:"tournament",lockDay:true,completed:false,desc:"正式賽事。比賽日全天鎖定。"});
 state.logs.push("報名成功：高中電競盃秋季預賽已寫入週六行程。");
}

function playScheduledDuo(ev){
 if(!consume("與阿哲雙排",1))return;ev.completed=true;
 const p=state.player,win=avg()+rand(-8,8)>=54,delta=win?rand(18,25):-rand(16,22);
 if(win){p.wins++;p.lp+=delta}else{p.losses++;p.lp+=delta}p.relations.阿哲=clamp((p.relations.阿哲||0)+2,0,100);p.energy=clamp(p.energy-6,0,100);adjustRank();
 state.logs.push(`約定完成：與阿哲雙排，${win?"勝利":"敗北"} ${delta>0?"+":""}${delta} LP。`);
 state.messages.push({id:"afterduo-"+Date.now(),from:"阿哲",text:win?"今天手感不錯欸。對了，要不要乾脆組隊報高中盃？":"今天有點可惜。對了，高中盃快報名了，要不要找人組隊？",unread:true,resolved:false,type:"teamInvite"});
 save();render();modal(`<h2>與阿哲雙排</h2><p>${win?"你們成功拿下這局。":"你們輸掉這局，但阿哲似乎有別的事情想跟你談。"}</p><p>${delta>0?"+":""}${delta} LP · 阿哲關係 +2</p>${closeBtn()}`);
}
function playTournament(ev){
 const p=state.player;state.dayState.usedSlots=slots().length;state.dayState.actions=slots().map(x=>`${x}：高中電競盃`);
 modal(`<h2>🏆 高中電競盃</h2><p>報到完成。第一場即將開始，阿哲在語音裡問：「第一場要怎麼打？」</p><div class="reply-grid"><button class="reply tour-choice" data-v="safe">穩定營運，等對手失誤</button><button class="reply tour-choice" data-v="aggressive">前期主動打架</button><button class="reply tour-choice" data-v="mid">圍繞中路打開突破口</button></div>`);
 document.querySelectorAll(".tour-choice").forEach(b=>b.onclick=()=>finishTournament(ev,b.dataset.v));
}
function finishTournament(ev,strategy){
 const p=state.player,bonus=strategy==="mid"?2:strategy==="safe"?1:0;
 const win=avg()+bonus+rand(-7,8)>=54;
 ev.completed=true;state.tournament.played=true;p.energy=clamp(p.energy-22,0,100);p.stress=clamp(p.stress+8,0,100);
 if(win){p.proAttention=clamp(p.proAttention+3,0,100);p.relations.阿哲=clamp((p.relations.阿哲||0)+4,0,100);state.logs.push("高中電競盃：首輪勝利，職業關注 +3。");state.messages.push({id:"cupwin-"+Date.now(),from:"阿哲",text:"我們真的贏了！下一輪對手更強，回去要不要研究一下？",unread:true,resolved:true,type:"normal"})}
 else{p.relations.阿哲=clamp((p.relations.阿哲||0)+2,0,100);state.logs.push("高中電競盃：首輪落敗。這次經驗成為新的起點。");state.messages.push({id:"cuplose-"+Date.now(),from:"阿哲",text:"輸了有點不甘心。不過我覺得我們可以繼續組。",unread:true,resolved:true,type:"normal"})}
 save();document.querySelector(".modal-backdrop")?.remove();render();modal(`<h2>${win?"首輪勝利！":"首輪落敗"}</h2><p>${win?"你們的第一次正式賽事取得勝利。":"正式比賽的壓力和Rank完全不同。"}</p><p>今天已被比賽完整占用，無法再進行其他活動。</p>${closeBtn()}`);
}
function repairTodayBeforeAdvance(){
 const plan=todayPlan();
 // 社課、雙排約定等非正式全天賽事不應鎖死換日。
 plan.forEach(e=>{if(["clubSession","duoAppointment"].includes(e.type))e.lockDay=false});
 // 舊版本留下的未知 lockDay 事件直接解除，避免永久卡關。
 plan.forEach(e=>{if(e.lockDay&&!["tournament","amateurTournament"].includes(e.type)){e.lockDay=false;state.logs.push(`系統修復：已解除異常鎖定行程「${e.title||e.id}」。`)}});
}
function skipOptionalAppointmentsForNextDay(){
 const pending=pendingAppointments().filter(e=>!e.lockDay);
 pending.forEach(e=>{
   e.completed=true;e.skipped=true;
   if(e.type==="clubSession"){
     if(state.school?.esportsClub){state.school.esportsClub.coachRelation=clamp((state.school.esportsClub.coachRelation||0)-1,0,100)}
     state.logs.push(`你沒有參加「${e.title}」，教練評價 -1。`);
   }else state.logs.push(`未完成行程「${e.title}」已略過。`);
 });
}
function baseNextDay(){
 repairTodayBeforeAdvance();
 const hard=hardEventToday();
 if(hard){
   modal(`<h2>🏆 今天有正式賽事</h2><p><strong>${hard.title}</strong> 是全天必要行程，完成比賽後才能進入下一天。</p><button class="btn primary" onclick="runEventById('${hard.id}')">前往比賽</button>${closeBtn()}`);
   return;
 }
 // 一般約定/社課不再攔截換日；玩家選擇下一天即視為略過未完成行程。
 skipOptionalAppointmentsForNextDay();
 state.date.day++;state.player.energy=clamp(state.player.energy+10,0,100);state.player.stress=clamp(state.player.stress-2,0,100);state.dayState={usedSlots:0,actions:[]};
 if(state.date.day>7){
   state.date.day=1;
   const finishedWeek=state.date.week;
   state.date.week++;
   if(state.date.week>52){
     const oldYear=state.date.year;
     state.date.week=1;
     state.date.year++;
     state.logs.push(`🎆 ${oldYear}學年度結束，時間進入 ${state.date.year} 學年度。`);
   }
   state.date.month=monthFromWeek(state.date.week);
   state.weeklyPlan={};state.player.cash+=750;
   state.logs.push(`第${finishedWeek}週結束：上週行程已歸檔，零用錢入帳 NT$750。`);
   syncCalendarFields();
 }
 scriptedEvents();
 syncTournamentSchedule();
 if(state.school?.esportsClub?.joined && state.date.day===5 && !(state.weeklyPlan[5]||[]).some(e=>e.type==="clubSession")){
   addPlan(5,{id:"club-"+state.date.week,title:"電競社固定社課",slot:"放學後",type:"clubSession",lockDay:false,completed:false,desc:"教練課、隊內賽、覆盤或他校訓練賽。"});
 }
 save();render();
}
function scriptedEvents(){
 if(state.date.week===1&&state.date.day===3&&!state.eventFlags.schoolCupHint){
  state.eventFlags.schoolCupHint=true;state.news.push("高中電競盃正式開放報名，預賽將在近期舉行。");
 }
 if(state.date.week===1&&state.date.day===4&&!state.eventFlags.rain){
  state.eventFlags.rain=true;state.characters.林雨晴.known=true;state.player.relations.林雨晴=Math.max(state.player.relations.林雨晴,5);
  state.messages.push({id:"rainmsg-"+Date.now(),from:"林雨晴",text:"今天謝謝你提醒我外面下雨，不然我真的直接走出去了 😂",unread:true,resolved:true,type:"normal"});
  modal(`<h2>🎲 放學奇遇</h2><p>外面突然下起大雨。你在走廊碰到同班的林雨晴，她正站在窗邊看著雨。</p><div class="reply-grid"><button class="reply rain-e" data-v="umbrella">問她要不要一起撐傘</button><button class="reply rain-e" data-v="wait">陪她等雨小一點</button><button class="reply rain-e" data-v="bye">提醒她下雨後先離開</button></div>`);
  setTimeout(()=>document.querySelectorAll(".rain-e").forEach(b=>b.onclick=()=>{let g=b.dataset.v==="umbrella"?4:b.dataset.v==="wait"?3:1;state.player.relations.林雨晴=clamp((state.player.relations.林雨晴||0)+g,0,100);state.logs.push(`奇遇後續：和林雨晴的關係 +${g}。`);save();document.querySelector(".modal-backdrop")?.remove();render()}),0);
 }
}

// ======================== V1.0 WORLD / SCHOOL / SOCIAL EXPANSION ========================
const RELATION_TIERS=[
 {min:0,name:"陌生"},{min:20,name:"認識"},{min:40,name:"朋友"},{min:60,name:"親近"},{min:75,name:"曖昧"},{min:88,name:"非常親密"}
];
const SHOP_ITEMS=[
 {id:"drink",name:"飲料",price:65,desc:"心情 +2",effect:p=>p.mood=clamp(p.mood+2,0,100)},
 {id:"meal",name:"朋友聚餐",price:320,desc:"心情 +4",effect:p=>p.mood=clamp(p.mood+4,0,100)},
 {id:"mouse",name:"入門電競滑鼠",price:1290,desc:"設備收藏；操作訓練微幅加成",once:true},
 {id:"keyboard",name:"機械鍵盤",price:2490,desc:"設備收藏；直播品質微幅提升",once:true},
 {id:"headset",name:"電競耳機",price:1890,desc:"設備收藏；團隊溝通訓練微幅加成",once:true},
 {id:"gift",name:"小禮物",price:450,desc:"購買後可選擇角色送禮",gift:true},
 {id:"premiumGift",name:"精緻禮盒",price:1200,desc:"較高級的禮物；不同個性反應不同",gift:true},
 {id:"fashion",name:"新衣服",price:1800,desc:"生活消費；心情 +6",effect:p=>p.mood=clamp(p.mood+6,0,100)},
 {id:"movie",name:"電影＋餐點",price:650,desc:"休閒消費；心情 +5",effect:p=>p.mood=clamp(p.mood+5,0,100)},
 {id:"game",name:"新遊戲",price:1590,desc:"放鬆娛樂；遊戲熱情 +4",effect:p=>p.passion=clamp(p.passion+4,0,100)},
 {id:"chair",name:"人體工學椅",price:6990,desc:"高額設備消費；長期設備收藏",once:true},
 {id:"phone",name:"新手機",price:24900,desc:"高額生活消費；直播與社交設備收藏",once:true}
];
const LADDER_NAMES=["Raven","Luna","Kaito","Zero9","Mori","Nox","Aster","Haku","ViperX","Nagi","Frost","Mika","Rex","Nova","Sena","Crow","Yuzu","Kairos","Melo","Tide"];

function ensureV10(){
 const previousVersion=state?.version||"";
 state=normalize(state);
 const p=state.player;
 if(!Array.isArray(p.inventory))p.inventory=[];
 if(p.reputation==null)p.reputation=5;
 if(p.reputation===50 && (!state.world?.amateurHistory || state.world.amateurHistory.length<3))p.reputation=5;
 if(!p.romance||typeof p.romance!=="object")p.romance={partner:null,trust:{},jealousy:{},rumorRisk:0};
 if(!Array.isArray(p.romance.partners))p.romance.partners=p.romance.partner?[p.romance.partner]:[];
 p.romance.partners=[...new Set(p.romance.partners.filter(Boolean))];
 p.romance.partner=p.romance.partners[0]||null;
 p.romance.flags=p.romance.flags||{};
 p.romance.trust=p.romance.trust||{};
 p.romance.jealousy=p.romance.jealousy||{};
 p.romance.rumorRisk=Number.isFinite(p.romance.rumorRisk)?p.romance.rumorRisk:0;
 p.gifts=p.gifts||{};
 if(!p.emotion||typeof p.emotion!=="object")p.emotion={betrayalUntil:0,betrayalBy:null};
 if(!Number.isFinite(p.emotion.betrayalUntil))p.emotion.betrayalUntil=0;
 if(!p.romance.polyConsent||typeof p.romance.polyConsent!=="object")p.romance.polyConsent={};
 if(!Array.isArray(p.proFriends))p.proFriends=[];
 if(!p.proEncounters||typeof p.proEncounters!=="object")p.proEncounters={};

 if(!state.school||typeof state.school!=="object")state.school={};
 if(!Number.isFinite(state.school.examWeek))state.school.examWeek=7;
 if(!Number.isFinite(state.school.examPrepared))state.school.examPrepared=0;
 if(!Array.isArray(state.school.examHistory))state.school.examHistory=[];
 if(state.school.examProcessedWeek==null)state.school.examProcessedWeek=state.school.lastExam!=null?state.school.examWeek:null;
 if(state.school.lastExam!=null&&!state.school.examHistory.length)state.school.examHistory.push({week:state.school.examProcessedWeek,score:state.school.lastExam});
 if(state.school.clubFame==null)state.school.clubFame=0;
 if(!state.school.esportsClub)state.school.esportsClub={joined:false,coachRelation:0,clubRep:0,officer:false,scrims:0};
 if(state.school.lastExam!=null && state.school.examWeek<state.date.week){
   while(state.school.examWeek<state.date.week)state.school.examWeek+=8;
 }

 if(!state.world||typeof state.world!=="object")state.world={};
 if(!Number.isFinite(state.world.newsWeek))state.world.newsWeek=0;
 if(!Array.isArray(state.world.leaderboard))state.world.leaderboard=[];
 if(!Array.isArray(state.world.rumors))state.world.rumors=[];
 if(!Array.isArray(state.world.amateurHistory))state.world.amateurHistory=[];
 if(!Array.isArray(state.world.tournaments))state.world.tournaments=[];

 if(!state.friends||typeof state.friends!=="object")state.friends={};
 Object.entries(newGame().characters).forEach(([n,c])=>{if(!state.characters[n])state.characters[n]={...c}});
 const fixed={
  俊凱:{known:true,relation:48,role:"上路",rank:"白金 I"},
  小宇:{known:true,relation:43,role:"輔助",rank:"翡翠 IV"},
  阿哲:{known:true,relation:p.relations.阿哲||64,role:"ADC",rank:"翡翠 IV"},
  子辰:{known:!!state.characters.子辰?.known,relation:p.relations.子辰||0,role:"打野",rank:"翡翠 I"},
  Kaito:{known:!!state.characters.Kaito?.known,relation:p.relations.Kaito||0,role:"輔助",rank:"宗師"},
  陳語彤:{known:!!state.characters.陳語彤?.known,relation:p.relations.陳語彤||0,role:"ADC",rank:"白金 I"}
 };
 Object.entries(fixed).forEach(([n,d])=>state.friends[n]={...d,...(state.friends[n]||{})});

 if(!state.characters.俊凱)state.characters.俊凱={name:"俊凱",known:true,gender:"男",romanceable:false,desc:"同班好友，個性外向，偶爾一起開黑。"};
 if(!state.characters.小宇)state.characters.小宇={name:"小宇",known:true,gender:"男",romanceable:false,desc:"隔壁班朋友，主玩輔助，常約宵夜。"};
 if(!state.characters.陳語彤)state.characters.陳語彤={name:"陳語彤",known:false,gender:"女",romanceable:true,desc:"高一學妹，校內電競社成員。"};
 if(!state.characters.沈若晴)state.characters.沈若晴={name:"沈若晴",known:false,gender:"女",romanceable:true,desc:"高三學姊，學生會活動組。"};
 if(!state.characters.許安然)state.characters.許安然={name:"許安然",known:false,gender:"女",romanceable:true,desc:"國中時曾暗戀過的同學。"};
 ["俊凱","小宇","陳語彤","沈若晴","許安然"].forEach(n=>{if(p.relations[n]==null)p.relations[n]=state.friends[n]?.relation||0});
 if(state.characters.阿哲){state.characters.阿哲.gender="男";state.characters.阿哲.romanceable=false}
 if(state.characters.子辰){state.characters.子辰.gender="男";state.characters.子辰.romanceable=false}
 if(state.characters.Kaito){state.characters.Kaito.gender="男";state.characters.Kaito.romanceable=false}
 if(state.characters.林雨晴){state.characters.林雨晴.gender="女";state.characters.林雨晴.romanceable=true}
 ["陳語彤","沈若晴","許安然"].forEach(n=>{if(state.characters[n]){state.characters[n].gender="女";state.characters[n].romanceable=true}});

 const personalities={"阿哲":["老實","講義氣"],"子辰":["努力","好勝"],"Kaito":["冷靜","心機"],"俊凱":["外向","衝動"],"小宇":["老實","溫和"],"林雨晴":["可愛","天然呆"],"陳語彤":["努力","可愛"],"沈若晴":["成熟","心機"],"許安然":["現實","拜金"]};
 Object.values(state.characters).forEach(c=>{
   if(!c||!c.name)return;
   if(!c.gender)c.gender="男";
   c.romanceable=c.gender==="女";
   let t=normalizeTraits(c);
   if(!t.length)t=personalities[c.name]||fallbackTraits(c);
   c.traits=t;
 });

 if(!state.world.leaderboard.length || state.world.leaderboard.length<100 || !state.world.eliteCutoff){
   const legacyEliteVersions=["1.0","1.0.1","1.0.2","1.0.3","1.0.4","1.1","1.1.1","1.1.2","1.1.3","1.1.4","1.1.5","1.1.6","1.1.7","1.1.8","1.2.0","1.2.1"];
   if(p.rank==="菁英" && !state.world.eliteMigrated && legacyEliteVersions.includes(previousVersion)){
     p.lp=(p.lp||0)+800;
   }
   state.world.eliteMigrated=true;
   refreshLeaderboard();
 }else{
   refreshLeaderboard();
 }
 generateWeeklyNews();

 syncCalendarFields();
}
function isProFriend(name){return (state.player.proFriends||[]).includes(name)}
function ensureProCharacter(name){
 if(!name)return null;
 if(!state.characters[name])state.characters[name]={name,known:true,gender:"男",romanceable:false,role:"職業選手",desc:"在高分Rank認識的職業選手。",traits:["努力","好勝"]};
 state.characters[name].known=true;state.characters[name].isPro=true;
 if(state.player.relations[name]==null)state.player.relations[name]=20;
 return state.characters[name];
}
function esportsRole(name){
 const roles={"阿哲":"ADC","子辰":"打野","Kaito":"輔助","俊凱":"上路","小宇":"輔助","陳語彤":"ADC"};
 return state.friends?.[name]?.role||state.characters?.[name]?.role||roles[name]||null;
}
function isEsportsFriend(name){return !!esportsRole(name)}
function relationTier(v,name){
 const c=state.characters?.[name];
 const romanceable=!!(c&&c.romanceable&&c.gender==="女");
 const tiers=romanceable?RELATION_TIERS:[
  {min:0,name:"陌生"},{min:20,name:"認識"},{min:40,name:"朋友"},{min:60,name:"好友"},{min:75,name:"摯友"},{min:88,name:"死黨"}
 ];
 let t=tiers[0];tiers.forEach(x=>{if(v>=x.min)t=x});return t.name
}
function eliteCutoffLP(){return state.world?.eliteCutoff||820}
function refreshLeaderboard(){
 const p=state.player;
 const topNames=["Raven","Luna","Kaito","Zero9","Mori","Nox","Aster","Haku","ViperX","Nagi","Frost","Mika","Rex","Nova","Sena","Crow","Yuzu","Kairos","Melo","Tide"];
 const weekSeed=(state.date?.week||1);
 const baseCut=805+((weekSeed*17)%41);
 let npcs=[];
 for(let i=0;i<200;i++){
   const name=i<topNames.length?topNames[i]:`菁英路人${String(i+1).padStart(3,"0")}`;
   const curve=2050-(2050-baseCut)*(i/199),wobble=((i*13+weekSeed*7)%17)-8;
   npcs.push({name,lp:Math.round(curve+wobble),role:ROLES[i%5],type:i%8===0?"職業選手":i%8===1?"青訓":"高分路人",isPlayer:false});
 }
 npcs.sort((a,b)=>b.lp-a.lp);
 const cutoff=(npcs[199]?.lp||baseCut)+1;
 state.world.eliteCutoff=cutoff;
 let arr=npcs;
 if((p.lp||0)>=cutoff)arr=[...npcs,{name:p.name,lp:p.lp,role:p.role,type:"玩家",isPlayer:true}];
 arr.sort((a,b)=>b.lp-a.lp||(a.isPlayer?-1:b.isPlayer?1:0));
 state.world.leaderboard=arr.slice(0,200);
 const idx=state.world.leaderboard.findIndex(x=>x.isPlayer===true);
 state.world.playerEliteRank=idx>=0?idx+1:null;
 if(["宗師","菁英"].includes(p.rank))p.rank=idx>=0?"菁英":"宗師";
}
function generateWeeklyNews(){
 if(state.world.newsWeek===state.date.week)return;
 state.world.newsWeek=state.date.week;refreshLeaderboard();
 const pool=[
  `KCL豪門「Eclipse」宣布青訓招募計畫，特別關注高分段${state.player.role}玩家。`,
  `本週版本更新：控制型中路與前排打野勝率上升，高分段BP正在改變。`,
  `城市青年盃開放報名，冠軍獎金 NT$20,000，部分業餘戰隊已開始組隊。`,
  `全服菁英榜洗牌：${state.world.leaderboard[0].name} 目前暫居第一。`,
  `知名實況主 Nox 在高分段連勝，引發「路人王能否打職業」討論。`,
  `多間網咖將舉辦週末盃，冠軍隊伍可獲現金與設備獎品。`
 ];
 state.news.unshift(`【第${state.date.week}週】${pool[rand(0,pool.length-1)]}`);
 if(state.news.length>20)state.news.length=20;
}
function relationshipCard(){
 const p=state.player,known=Object.values(state.characters||{}).filter(c=>c?.known),partners=p.romance.partners||[];
 return `<section class="card"><div class="row space"><h2>人際關係</h2><span class="badge">${partners.length?`交往中 ×${partners.length}`:"單身"}</span></div>
 ${known.map(c=>{let v=p.relations[c.name]||0,dating=partners.includes(c.name),traits=safeTraits(c);return `<div class="log"><div class="row space"><strong>${c.name}${dating?" 💞":""}</strong><span>${dating?"戀人":relationTier(v,c.name)} · ${Math.round(v)}</span></div><div class="small">${c.desc||""}｜性別：${c.gender||"未設定"}${traits.length?`｜個性：${traits.join("、")}`:""}${isEsportsFriend(c.name)?`｜遊戲路線：${esportsRole(c.name)}`:""}</div><button class="ghost send-gift" data-name="${c.name}">🎁 送禮物</button></div>`}).join("")}</section>`;
}
function worldCards(){
 const p=state.player,rank=state.world.playerEliteRank||null,cut=eliteCutoffLP();
 let ladderStatus;
 if(rank)ladderStatus=`菁英 #${rank}`;
 else if(["宗師","菁英"].includes(p.rank))ladderStatus=`宗師 · 距前200門檻 ${Math.max(0,cut-(p.lp||0))} LP`;
 else ladderStatus=`${p.rank} · 尚未進入菁英榜競爭`;
 const playerRow=rank&&rank>10?`<div class="schedule-item selected"><div><strong>#${rank} ${p.name}</strong><div class="small">${p.role} · 玩家</div></div><span>${p.lp} LP</span></div>`:"";
 return `<section class="card"><div class="row space"><h2>👑 伺服器菁英 Top 200</h2><span class="badge">${ladderStatus}</span></div>
 ${state.world.leaderboard.slice(0,10).map((x,i)=>`<div class="schedule-item ${x.isPlayer?"selected":""}"><div><strong>#${i+1} ${x.name}</strong><div class="small">${x.role} · ${x.type}</div></div><span>${x.lp} LP</span></div>`).join("")}
 ${playerRow}
 <div class="notice">本週第200名實際門檻：${cut} LP。只有真正擠進伺服器前200才會顯示「菁英」，門檻會隨每週榜單浮動。</div></section>`;
}
function schoolCard(){
 const s=state.school,left=s.examWeek-state.date.week;
 return `<section class="card"><div class="row space"><h2>🏫 校園生活</h2><span class="badge">${left>0?`距段考 ${left} 週`:left===0?"段考週":"本次段考結束"}</span></div>
 ${stat("學業",Math.round(state.player.school))}${stat("段考準備",`${Math.round(s.examPrepared)}/100`)}${stat("電競社",s.esportsClub?.joined?"社員":"未加入")}
 <div class="log">${left===0?"本週是段考週。白天考試，晚上仍能安排活動，但考差可能影響家庭支持與心情。":left>0?"可以利用「讀書」累積段考準備；完全不準備會有明顯風險。":s.lastExam?`上次段考：${s.lastExam}分。`:"新的考試週之後還會再出現。"}</div></section>`;
}

function tournamentDateInfo(x){
 const day=x.day||6;
 let week=state.date.week;
 if(state.date.day>day)week+=1;
 const sameWeek=week===state.date.week;
 const events=sameWeek?(state.weeklyPlan?.[day]||[]):[];
 const conflicts=events.filter(e=>!e.completed && e.type!=="amateurTournament");
 return {week,day,dayName:DAYS[day-1],sameWeek,conflicts,label:`第${week}週・週${DAYS[day-1]}・全天`};
}
function tournamentConflictText(info){
 if(!info.conflicts.length)return "";
 return info.conflicts.map(e=>`${e.slot||"全天"}｜${e.title}`).join("、");
}
function tournamentCatalog(){
 const all=[
  {name:"霓虹電競館夜戰盃",fee:300,day:6,id:"neon-cup",rounds:["八強","四強","冠軍戰"],prize:5500,rep:1,need:1,tier:"local"},
  {name:"高校聯盟交流賽",fee:0,day:6,id:"school-league",rounds:["16強","八強","四強","冠軍戰"],prize:8000,rep:2,need:2,tier:"school"},
  {name:"城市青年公開賽",fee:500,day:7,id:"city-open",rounds:["32強","16強","八強","四強","冠軍戰"],prize:20000,rep:3,need:4,tier:"city"},
  {name:"週末線上挑戰賽",fee:200,day:7,id:"online-weekend",rounds:["64強","32強","16強","八強","四強","冠軍戰"],prize:9000,rep:1,need:3,tier:"online"},
  {name:"HyperX校園贊助盃",fee:0,day:6,id:"sponsor-campus",rounds:["小組出線戰","八強","四強","冠軍戰"],prize:15000,rep:3,need:6,tier:"sponsor"},
  {name:"主播明星邀請賽",fee:0,day:7,id:"streamer-invite",rounds:["首輪","八強","四強","冠軍戰"],prize:18000,rep:3,need:8,tier:"invite"},
  {name:"北區業餘菁英賽",fee:600,day:6,id:"regional-elite",rounds:["32強","16強","八強","四強","冠軍戰"],prize:30000,rep:4,need:10,tier:"regional"},
  {name:"青訓觀察公開賽",fee:400,day:7,id:"academy-scout",rounds:["資格賽","32強","16強","八強","四強","冠軍戰"],prize:25000,rep:5,need:12,tier:"scout"}
 ];
 const w=state.date.week||1,start=(w*3)%all.length;
 return [all[start],all[(start+1)%all.length],all[(start+3)%all.length]];
}
function amateurCard(){
 const upcoming=tournamentCatalog();
 return `<section class="card"><h2>🏆 本週可報名賽事</h2><div class="small">報名前會先確認正式比賽日期；正式賽事為全天行程，若當天已有其他安排就不能報名。</div>${upcoming.map((x,i)=>{const info=tournamentDateInfo(x),conflict=info.conflicts.length>0,active=activeTournamentByBaseId(x.id);return `<div class="schedule-item"><div><strong>${x.name}</strong><div class="small">📅 ${info.label}</div><div class="small">報名費 NT$${x.fee} · 冠軍 NT$${x.prize.toLocaleString()} · ${x.tier==="scout"?"青訓觀察":"業餘賽事"}</div>${conflict?`<div class="small badtext">⚠️ 行程衝突：${tournamentConflictText(info)}</div>`:""}</div><button class="ghost amateur-signup" data-i="${i}" ${(state.date.week<x.need||conflict||active)?"disabled":""}>${active?"已報名・進行中":state.date.week<x.need?`第${x.need}週開放`:conflict?"行程衝突":"查看／報名"}</button></div>`}).join("")}</section>`;
}
function shopCard(){
 return `<section class="card"><div class="row space"><h2>🛍️ 商店與消費</h2><span class="badge">NT$${state.player.cash.toLocaleString()}</span></div>
 ${SHOP_ITEMS.map(x=>`<div class="schedule-item"><div><strong>${x.name}</strong><div class="small">NT$${x.price.toLocaleString()} · ${x.desc}</div></div><button class="ghost buy-item" data-item="${x.id}" ${state.player.cash<x.price||(x.once&&state.player.inventory.includes(x.id))?"disabled":""}>${x.once&&state.player.inventory.includes(x.id)?"已擁有":"購買"}</button></div>`).join("")}</section>`;
}
function rumorCard(){
 return `<section class="card"><h2>💬 校園緋聞</h2>${state.world.rumors.length?state.world.rumors.slice(0,5).map(r=>`<div class="log">${r}</div>`).join(""):`<div class="small">目前沒有特別的傳聞。隨著人際關係與知名度提高，這裡可能出現真假難辨的八卦。</div>`}</section>`;
}

function home(){
 ensureV10();const p=state.player,hard=hardEventToday();
 return `<section class="card hero"><div class="row space"><div><div class="small">${dateLabel()}</div><h2>${p.name} · ${p.age}歲 · ${p.role}</h2></div><span class="badge">綜合 ${avg().toFixed(1)}</span></div>
 <div class="stat-grid">${stat("Rank",`${p.rank} ${p.lp} LP`)}${stat("現金",`NT$${p.cash.toLocaleString()}`)}${stat("職業關注",`${p.proAttention}/100`)}${stat("聲譽",`${p.reputation}/100`)}</div></section>
 <section class="card"><h2>今日狀態</h2><div class="stat-grid">${stat("體力",`${Math.round(p.energy)}/100`)}${stat("心情",`${Math.round(p.mood)}/100`)}${stat("壓力",`${Math.round(p.stress)}/100`)}${stat("遊戲熱情",`${Math.round(p.passion)}/100`)}</div></section>
 ${hard?lockedDayCard(hard):timeCard()}${schoolCard()}${appointmentCard()}
 ${hard?`<section class="card"><div class="notice">今天是正式賽事日，一般活動全部鎖定。</div></section>`:actionCard()}
 <section class="card"><h2>最近紀錄</h2>${state.logs.slice(-6).reverse().map(x=>`<div class="log">${x}</div>`).join("")}</section>`;
}
function phone(){
 ensureV10();const unread=state.messages.filter(m=>m.unread).length;
 return `<section class="card"><div class="row space"><h2>訊息</h2><span class="badge">${unread} 未讀</span></div>${state.messages.slice().reverse().map(m=>`<div class="message ${m.unread?"unread":""}"><button class="message-open" data-msg="${m.id}" style="width:100%;border:0;background:transparent;color:white;text-align:left;padding:0"><div class="meta"><strong>${m.from}</strong><span class="small">${m.resolved?"已處理":m.unread?"未讀":"待回覆"}</span></div><div style="margin-top:6px;white-space:pre-line">${m.text}</div><div class="small" style="margin-top:8px">點擊開啟對話 ›</div></button></div>`).join("")}</section>
 ${relationshipCard()}${rumorCard()}<section class="card"><h2>📰 電競新聞</h2>${state.news.slice(0,12).map(n=>`<div class="log">${n}</div>`).join("")}</section>`;
}
function career(){
 ensureV10();const p=state.player;
 return `<section class="card"><h2>生涯中心</h2><div class="stat-grid">${stat("學業",Math.round(p.school))}${stat("家庭支持",Math.round(p.family))}${stat("粉絲",p.followers)}${stat("聲譽",p.reputation)}</div></section>
 ${worldCards()}${amateurCard()}${shopCard()}${masteryCard()}
 <section class="card"><h2>💾 存檔與救援</h2><div class="reply-grid"><button id="exportSaveBtn" class="reply">匯出 JSON 存檔</button><button id="importSaveBtn" class="reply">匯入 JSON 存檔</button><button id="recoverW15Btn" class="reply">🛠️ 回朔第15週星期五早上</button><button id="repairAdvanceBtn" class="reply">🔧 修復目前行程鎖定</button></div><input id="importSaveFile" type="file" accept=".json,application/json" style="display:none"><div class="small">回朔救援會保留角色能力、Rank、金錢、人際與裝備，重置第15週星期五當日狀態並重建電競社課。</div></section>
 <section class="card"><h2>版本</h2><div class="log"><strong>V1.3.8</strong>｜動態新聞、全服菁英榜、好感階段、校園朋友圈、花錢系統、段考週、業餘賽事與緋聞架構。</div></section>`;
}
function bind(){
 document.querySelectorAll(".action-btn").forEach(b=>b.onclick=()=>act(b.dataset.action));
 document.querySelector("#nextDayBtn")?.addEventListener("click",nextDay);
 document.querySelectorAll(".message-open").forEach(b=>b.onclick=e=>{e.preventDefault();openMessage(b.dataset.msg)});
 document.querySelectorAll(".event-run").forEach(b=>b.onclick=()=>runEventById(b.dataset.event));
 document.querySelectorAll(".buy-item").forEach(b=>b.onclick=()=>buyItem(b.dataset.item));
 document.querySelectorAll(".send-gift").forEach(b=>b.onclick=()=>openGift(b.dataset.name));
 const uiBack=document.querySelector("#uiBack");if(uiBack)uiBack.onclick=()=>{const m=document.querySelector(".modal-backdrop");if(m)m.remove();else{activeTab="home";render()}};
 document.querySelectorAll(".amateur-signup").forEach(b=>{const x=tournamentCatalog()[Number(b.dataset.i)],a=x&&activeTournamentByBaseId(x.id);if(a){b.disabled=true;b.textContent="已報名・進行中"}else b.onclick=()=>signupAmateur(Number(b.dataset.i))});
 document.querySelector("#exportSaveBtn")?.addEventListener("click",exportSaveJSON);
 document.querySelector("#importSaveBtn")?.addEventListener("click",()=>document.querySelector("#importSaveFile")?.click());
 document.querySelector("#importSaveFile")?.addEventListener("change",importSaveJSON);
 document.querySelector("#recoverW15Btn")?.addEventListener("click",recoverWeek15Friday);
 document.querySelector("#repairAdvanceBtn")?.addEventListener("click",()=>{repairTodayBeforeAdvance();save();render();modal(`<h2>🔧 行程鎖定已檢查</h2><p>已解除社課、約定或舊版本異常事件造成的換日鎖定。正式比賽日仍會正常鎖定。</p>${closeBtn()}`)});
}
function buyItem(id){
 const x=SHOP_ITEMS.find(a=>a.id===id);if(!x||state.player.cash<x.price)return;
 state.player.cash-=x.price;if(x.once)state.player.inventory.push(x.id);if(x.gift)state.player.gifts[x.id]=(state.player.gifts[x.id]||0)+1;if(x.effect)x.effect(state.player);
 state.logs.push(`消費：購買${x.name}，支出 NT$${x.price.toLocaleString()}。`);save();render();
 modal(`<h2>購買完成</h2><p>${x.name}｜NT$${x.price.toLocaleString()}</p><p>${x.desc}</p>${closeBtn()}`);
}
function activeTournamentByBaseId(baseId){return (state.world?.tournaments||[]).find(t=>t.id&&t.id.startsWith(baseId+"-")&&["進行中","等待下一輪"].includes(t.status))}
function syncTournamentSchedule(){if(!state.world?.tournaments)return;state.world.tournaments.forEach(t=>{if(!["進行中","等待下一輪"].includes(t.status))return;if(t.nextWeek<state.date.week){t.nextWeek=state.date.week;t.status="進行中"}if(t.nextWeek===state.date.week){const d=t.nextDay||6;if(state.date.day>d){t.nextWeek=state.date.week+1;t.status="等待下一輪";return}t.status="進行中";if(!(state.weeklyPlan?.[d]||[]).some(e=>e.tournamentId===t.id&&!e.completed))addPlan(d,{id:"round-"+t.id+"-"+t.roundIndex,title:`${t.name}｜${t.rounds[t.roundIndex]}`,slot:"全天",type:"amateurTournament",lockDay:true,completed:false,tournamentId:t.id,week:state.date.week,roster:t.roster,desc:`正式比賽日：${t.rounds[t.roundIndex]}。全天鎖定，只能比賽。`})}})}
function signupAmateur(i){
 const x=tournamentCatalog()[i];if(!x)return;
 const info=tournamentDateInfo(x);
 if(state.date.week<x.need){modal(`<h2>🏆 尚未開放</h2><p>${x.name} 將於第 ${x.need} 週後開放報名。</p>${closeBtn()}`);return}
 if(state.player.cash<x.fee){modal(`<h2>現金不足</h2><p>報名費需要 NT$${x.fee.toLocaleString()}。</p>${closeBtn()}`);return}
 const active=activeTournamentByBaseId(x.id);if(active){modal(`<h2>🏆 已報名</h2><p>${active.name}目前進行到 <strong>${active.rounds[active.roundIndex]}</strong>。賽事結束前不能再次報名。</p>${closeBtn()}`);return}
 if(info.conflicts.length){
   modal(`<h2>⚠️ 無法報名｜行程衝突</h2><p><strong>${x.name}</strong></p><p>正式比賽日期：<strong>${info.label}</strong></p><div class="notice">當天已有行程：${tournamentConflictText(info)}</div><p>正式賽事會鎖定全天，因此無法與其他行程重疊。</p>${closeBtn()}`);return;
 }
 modal(`<h2>🏆 賽事資訊確認</h2><p><strong>${x.name}</strong></p><div class="log">📅 比賽日期：<strong>${info.label}</strong><br>💰 報名費：NT$${x.fee.toLocaleString()}<br>🏆 冠軍獎金：NT$${x.prize.toLocaleString()}<br>🎮 首輪：${x.rounds[0]}</div><p>比賽日為全天鎖定行程。確認日期沒有問題後，再進入組隊邀請。</p><button id="continueTournamentSignup" class="primary" style="width:100%">日期沒問題，開始組隊</button>${closeBtn()}`);
 document.querySelector("#continueTournamentSignup").onclick=()=>{document.querySelector(".modal-backdrop")?.remove();openTeamBuilder({...x,targetWeek:info.week,targetDay:info.day})};
}
function tournamentCandidates(){
 return Object.values(state.characters).filter(c=>c.known&&c.name!==state.player.name&&isEsportsFriend(c.name))
 .map(c=>({name:c.name,role:esportsRole(c.name),relation:state.player.relations[c.name]||0,rank:(state.friends?.[c.name]?.rank||"未紀錄")+((state.friends?.[c.name]?.lp??null)!==null?` ${state.friends[c.name].lp}LP`:"")+((state.friends?.[c.name]?.form??0)>=8?" 🔥":(state.friends?.[c.name]?.form??0)<=-8?" ❄️":"")}));
}
function discoverTeammate(role,source){
 const male={上路:["承翰","Leo","柏宇"],打野:["宇辰","小凱","Rin"],中路:["子墨","Aki","哲宇"],ADC:["曜廷","Ming","小楓"],輔助:["恩碩","Naru","家豪"]};
 const female={上路:["若彤","夏寧"],打野:["凜月","語芯"],中路:["沐晴","星妍"],ADC:["心妤","若璃"],輔助:["雨柔","可欣"]};
 const gender=Math.random()<.34?"女":"男",pool=(gender==="女"?female:male)[role]||["新朋友"];
 let name=pool.find(n=>!state.characters[n])||`${gender==="女"?"女":"男"}${role}玩家${rand(10,99)}`;
 state.characters[name]={name,known:true,gender,romanceable:gender==="女",role,desc:`透過${source}認識的${gender==="女"?"女性":"男性"}電競好友，主打${role}。`};
 state.characters[name].traits=fallbackTraits(state.characters[name]);state.player.relations[name]=rand(18,32);
 if(!state.friends)state.friends={};state.friends[name]={known:true,relation:state.player.relations[name],role,rank:["白金 I","翡翠 III","翡翠 I","鑽石 IV"][rand(0,3)]};
 state.logs.push(`新好友：透過${source}認識了${name}（${gender}・${role}）。`);save();return name;
}
function normalizeRole(r){
 const m={"Top":"上路","上":"上路","上路":"上路","Jungle":"打野","JG":"打野","野":"打野","打野":"打野","Mid":"中路","MID":"中路","中":"中路","中路":"中路","ADC":"ADC","AD":"ADC","下路":"ADC","射手":"ADC","Bot":"ADC","Support":"輔助","SUP":"輔助","輔助":"輔助","輔":"輔助"};
 return m[r]||r;
}
function openTeamBuilder(x){
 const myRole=normalizeRole(state.player.role);
 const need=["上路","打野","中路","ADC","輔助"].filter(r=>r!==myRole);
 // Persist draft while modal is open/re-rendered.
 if(!state.teamDraft||state.teamDraft.tournament!==x.id)state.teamDraft={tournament:x.id,picked:{},accepted:{}};
 const picked=state.teamDraft.picked,accepted=state.teamDraft.accepted;

 function validCandidates(){
   return tournamentCandidates().map(c=>({...c,role:normalizeRole(c.role)})).filter(c=>need.includes(c.role));
 }
 function complete(){return need.every(r=>picked[r]&&accepted[picked[r]]===true)}
 function draw(){
   const dateInfo={week:x.targetWeek||tournamentDateInfo(x).week,day:x.targetDay||x.day,label:`第${x.targetWeek||tournamentDateInfo(x).week}週・週${DAYS[(x.targetDay||x.day)-1]}・全天`};
   modal(`<h2>👥 組隊報名｜${x.name}</h2>
   <div class="notice">📅 正式比賽：<strong>${dateInfo.label}</strong></div>
   <p>你主打 <strong>${myRole}</strong>。四名隊友都必須<strong>答應邀請</strong>後才能報名。</p>
   <div class="notice">需要：${need.join("、")}</div>
   <div class="reply-grid">${validCandidates().map(c=>`<button class="reply invite-player" data-name="${c.name}" data-role="${c.role}"><strong>${c.name}</strong><div class="small">${c.role} · ${c.rank} · 關係 ${Math.round(c.relation)} ${accepted[c.name]===true?"· ✅ 已答應":accepted[c.name]===false?"· ❌ 已婉拒":""}</div></button>`).join("")||"<div class='small'>目前沒有可邀請的電競好友，請使用下方方式找人。</div>"}</div>
   <div class="reply-grid"><button class="reply find-team" data-src="Rank">🎮 遊戲中找人</button><button class="reply find-team" data-src="好友介紹">🤝 請好友介紹</button><button class="reply find-team" data-src="電競社">🎓 問社團成員</button></div>
   <div class="log"><strong>目前陣容</strong><br>${state.player.name}（${myRole}）<br>${need.map(r=>`${r}：${picked[r]?(picked[r]+(accepted[picked[r]]===true?" ✅":" ⏳")):"尚未確認"}`).join("<br>")}</div>
   <div id="inviteFeedback" class="notice" style="display:none"></div>
   <button id="confirmTeamSignup" class="primary" ${complete()?"":"disabled"}>${complete()?"✅ 確認陣容並報名":"尚未湊齊四名已答應隊友"}</button>${closeBtn()}`);

   document.querySelectorAll(".invite-player").forEach(b=>{
     b.onclick=()=>{
       const role=normalizeRole(b.dataset.role),name=b.dataset.name;
       const fb=document.querySelector("#inviteFeedback");
       if(fb){fb.style.display="block";fb.innerHTML=`正在邀請 <strong>${name}</strong>…`}
       // Immediate synchronous resolution so Safari taps always produce visible feedback.
       const result=resolveTournamentInvite(name,role,x,picked,accepted);
       save();
       if(fb){fb.innerHTML=result.message}
       setTimeout(draw,900);
     };
   });
   document.querySelectorAll(".find-team").forEach(b=>b.onclick=()=>{
     const missing=need.find(r=>!picked[r]||accepted[picked[r]]!==true);
     const fb=document.querySelector("#inviteFeedback");
     if(!missing){if(fb){fb.style.display="block";fb.innerHTML="五個位置都已完成，可以直接確認報名。"}return}
     if(b.dataset.src==="電競社"&&!state.school.esportsClub.joined){if(fb){fb.style.display="block";fb.innerHTML="你還不是電競社員，無法透過社團找人。"}return}
     const n=discoverTeammate(missing,b.dataset.src);
     if(fb){fb.style.display="block";fb.innerHTML=`認識了 <strong>${n}</strong>（${missing}）。請再點他的名字正式邀請。`}
     save();setTimeout(draw,900);
   });
   const confirm=document.querySelector("#confirmTeamSignup");
   if(confirm)confirm.onclick=()=>{
     if(!complete()){const fb=document.querySelector("#inviteFeedback");if(fb){fb.style.display="block";fb.innerHTML="仍有位置尚未得到隊友同意。"}return}
     confirm.disabled=true;confirm.textContent="報名處理中…";
     confirmTeamSignup(x,picked,accepted);
   };
 }
 draw();
}
function resolveTournamentInvite(name,role,x,picked,accepted){
 role=normalizeRole(role);
 const rel=state.player.relations[name]||0;
 let chance=42+Math.floor(rel*.45);
 if(x.id==="school-cup"&&state.school.esportsClub?.joined)chance+=8;
 if(rel<20)chance-=12;
 chance=clamp(chance,18,92);
 const yes=rand(1,100)<=chance;
 if(yes){
   if(picked[role]&&picked[role]!==name)delete accepted[picked[role]];
   Object.keys(picked).forEach(r=>{if(picked[r]===name&&r!==role)delete picked[r]});
   picked[role]=name;accepted[name]=true;
   state.player.relations[name]=clamp(rel+1,0,100);
   state.logs.push(`${name}答應參加${x.name}，擔任${role}。`);
   return {yes:true,message:`✅ <strong>${name}</strong>答應參賽，位置：${role}。`};
 }
 accepted[name]=false;
 if(picked[role]===name)delete picked[role];
 const reasons=["這週已經有其他安排。","最近想專心衝Rank。","覺得目前隊伍磨合還不夠。","家裡臨時有事。"];
 state.logs.push(`${name}婉拒${x.name}邀請。`);
 return {yes:false,message:`❌ <strong>${name}</strong>婉拒：${reasons[rand(0,reasons.length-1)]}（本次成功率約 ${chance}%）`};
}
function confirmTeamSignup(x,picked,accepted){
 const duplicate=activeTournamentByBaseId(x.id);if(duplicate){alert(`你已經報名 ${duplicate.name}，請先完成目前賽事。`);return}
 const myRole=normalizeRole(state.player.role),need=["上路","打野","中路","ADC","輔助"].filter(r=>r!==myRole);
 const missing=need.filter(r=>!picked[r]||accepted[picked[r]]!==true);
 if(missing.length){alert(`陣容尚未完成：${missing.join("、")}`);return}
 if(state.player.cash<x.fee){alert("現金不足，無法支付報名費。");return}
 const targetWeek=x.targetWeek||tournamentDateInfo(x).week,targetDay=x.targetDay||x.day;
 if(targetWeek===state.date.week){
   const conflicts=(state.weeklyPlan?.[targetDay]||[]).filter(e=>!e.completed&&e.type!=="amateurTournament");
   if(conflicts.length){alert(`行程發生衝突：${conflicts.map(e=>e.title).join("、")}。目前無法報名。`);return}
 }
 const roster=[{name:state.player.name,role:myRole},...need.map(r=>({name:picked[r],role:r}))];
 if(new Set(roster.map(a=>a.name)).size!==5){alert("陣容資料重複，請重新選擇隊友。");return}
 state.player.cash-=x.fee;
 const t={id:x.id+"-"+Date.now(),name:x.name,roster,rounds:x.rounds,roundIndex:0,status:targetWeek>state.date.week?"等待下一輪":"進行中",nextWeek:targetWeek,nextDay:targetDay,prize:x.prize,rep:x.rep,tier:x.tier||"local",history:[]};
 state.world.tournaments.push(t);state.teamDraft=null;
 if(targetWeek===state.date.week)scheduleTournamentRound(t);
 save();document.querySelector(".modal-backdrop")?.remove();render();
 const when=`第 ${t.nextWeek} 週・週${DAYS[(t.nextDay||6)-1]}・全天`;
 modal(`<h2>✅ 報名完成</h2><p>${x.name}首輪 <strong>${x.rounds[0]}</strong> 已安排：<strong>${when}</strong></p><div class="log">${roster.map(a=>`${a.role}：${a.name}`).join("<br>")}</div><p>正式比賽日會全天鎖定，不能安排其他活動。</p>${closeBtn()}`);
}
function scheduleTournamentRound(t){
 if(t.status!=="進行中")return;
 const day=t.nextDay||6;
 if(state.date.day>day){
   t.nextWeek=state.date.week+1;t.status="等待下一輪";
   state.logs.push(`${t.name}｜${t.rounds[t.roundIndex]} 已排定第 ${t.nextWeek} 週${DAYS[day-1]}。`);
   return;
 }
 t.nextWeek=state.date.week;
 addPlan(day,{id:"round-"+t.id+"-"+t.roundIndex,title:`${t.name}｜${t.rounds[t.roundIndex]}`,slot:"全天",type:"amateurTournament",lockDay:true,completed:false,tournamentId:t.id,week:state.date.week,roster:t.roster,desc:`正式比賽日：${t.rounds[t.roundIndex]}。全天鎖定，只能進行本輪賽事。`});
 state.logs.push(`${t.name}｜${t.rounds[t.roundIndex]} 已加入本週${DAYS[day-1]}行程。`);
}
function runEventById(id){
 const ev=todayPlan().find(x=>x.id===id);if(!ev||ev.completed)return;
 if(ev.type==="duoAppointment"){let idx=slots().indexOf(ev.slot);if(idx>state.dayState.usedSlots){modal(`<h2>還沒到${ev.slot}</h2><p>先完成前面的時段，或提早結束今天。</p>${closeBtn()}`);return}playScheduledDuo(ev)}
 if(ev.type==="tournament")playTournament(ev);
 if(ev.type==="amateurTournament")playAmateur(ev);
 if(ev.type==="clubSession")playClubSession(ev);
}
function playAmateur(ev){
 state.dayState.usedSlots=slots().length;state.dayState.actions=slots().map(x=>`${x}：${ev.title}`);
 const t=state.world.tournaments.find(x=>x.id===ev.tournamentId),rosterText=ev.roster?.map(a=>`${a.role}：${a.name}`).join("｜")||"既有隊伍";
 modal(`<h2>🏆 ${ev.title}</h2><p class="small">${rosterText}</p><p>系列賽即將開始。這輪你想採取什麼方針？</p><div class="reply-grid"><button class="reply amat" data-v="stable">穩健營運</button><button class="reply amat" data-v="fight">主動打架</button><button class="reply amat" data-v="carry">圍繞夜鋒Carry</button></div>`);
 document.querySelectorAll(".amat").forEach(b=>b.onclick=()=>finishAmateur(ev,b.dataset.v));
}
const NPC_RANKS=["鐵牌 IV","鐵牌 III","鐵牌 II","鐵牌 I","銅牌 IV","銅牌 III","銅牌 II","銅牌 I","銀牌 IV","銀牌 III","銀牌 II","銀牌 I","金牌 IV","金牌 III","金牌 II","金牌 I","白金 IV","白金 III","白金 II","白金 I","翡翠 IV","翡翠 III","翡翠 II","翡翠 I","鑽石 IV","鑽石 III","鑽石 II","鑽石 I","大師","宗師","菁英"];
function npcRankIndex(r){const i=NPC_RANKS.indexOf(r);return i<0?19:i}
function npcPowerByName(name){const c=state.characters?.[name],f=state.friends?.[name]||{};return 42+npcRankIndex(f.rank||c?.rank||"白金 I")*1.65+(f.form??0)*.65}
function simulateNpcRanks(){
 Object.values(state.characters||{}).forEach(c=>{
  if(!c?.known||!isEsportsFriend(c.name))return;
  const f=state.friends[c.name]||(state.friends[c.name]={rank:c.rank||"白金 I"});
  f.form=f.form??0;
  if(!Number.isFinite(f.lp))f.lp=rand(0,f.rank==="大師"?499:99);
  for(let g=0;g<rand(1,4);g++){
   const w=Math.random()<clamp(.5+f.form/100,.30,.70);
   f.lp+=w?rand(16,26):-rand(14,25);f.form=clamp(f.form+(w?rand(1,4):-rand(1,4)),-18,18);
   let ri=npcRankIndex(f.rank);
   if(ri<28){
    if(f.lp>=100){f.lp-=100;f.rank=NPC_RANKS[ri+1];state.logs.push(`${c.name} 排位升至 ${f.rank}。`)}
    else if(f.lp<0&&ri>0){f.lp+=100;f.rank=NPC_RANKS[ri-1];state.logs.push(`${c.name} 近期連敗，掉至 ${f.rank}。`)}
    else if(f.lp<0&&ri===0)f.lp=0;
   }else if(f.rank==="大師"){
    if(f.lp>=500){f.lp-=500;f.rank="宗師";state.logs.push(`${c.name} 排位升至 宗師。`)}
    else if(f.lp<0){f.rank="鑽石 I";f.lp=75;state.logs.push(`${c.name} 近期連敗，掉至 鑽石 I。`)}
   }else if(f.rank==="宗師"){
    if(f.lp>=eliteCutoffLP()){f.rank="菁英";state.logs.push(`${c.name} 擠進伺服器菁英門檻。`)}
    else if(f.lp<0){f.rank="大師";f.lp=475;state.logs.push(`${c.name} 近期連敗，掉至 大師。`)}
   }else if(f.rank==="菁英"&&f.lp<eliteCutoffLP()-25){
    f.rank="宗師";state.logs.push(`${c.name} 掉出伺服器前200，回到宗師。`);
   }
  }
 })
}
function amateurTeamPower(t){return (t.roster||[]).reduce((s,a)=>s+(a.name===state.player.name||a.name==="夜鋒"?avg()+npcRankIndex(state.player.rank)*1.3:npcPowerByName(a.name)),0)/Math.max(1,(t.roster||[]).length)}
function amateurRelations(t,win){(t.roster||[]).forEach(a=>{if(a.name===state.player.name||a.name==="夜鋒")return;const d=win?rand(0,2):-rand(1,3);state.player.relations[a.name]=clamp((state.player.relations[a.name]||0)+d,0,100);if(d)state.logs.push(`${a.name}：比賽${win?"勝利":"失利"}，關係 ${d>0?"+":""}${d}。`)})}
function matchNarrative(win,strategy){
 const early=["3分鐘，雙方打野在河蟹區第一次碰撞。","6分鐘，夜鋒抓到對手走位失誤完成一波漂亮換血。","8分鐘，第一條小龍附近爆發4人會戰。"];
 const mid=["14分鐘，先鋒團雙方拉扯超過20秒，輔助率先開戰。","19分鐘，對手試圖抓邊，夜鋒及時後撤並呼叫隊友反包。","23分鐘，中路二塔前爆發關鍵團戰，雙方技能幾乎全交。"];
 const late=win?["28分鐘，你們逼出大龍區視野優勢，成功拿下大龍。","32分鐘，夜鋒側翼進場牽制兩人，隊友正面完成收割。","35分鐘，兵線進入高地，你們拆掉主堡拿下勝利。"]:["27分鐘，對手偷掉大龍，你們被迫回防。","31分鐘，高地前的團戰出現溝通失誤，後排遭到切入。","34分鐘，最後一波防守失敗，主堡被拆除。"];
 return [...early,...mid,...late].map((x,i)=>`<div class="log"><strong>${[3,6,8,14,19,23,28,32,35][i]||""}分</strong> ${x.replace(/^[0-9]+分鐘，/,"")}</div>`).join("");
}
function gainTournamentExperience(t,win,strategy){
 const p=state.player;
 const tierMul={local:1,school:1.05,online:1.05,city:1.15,sponsor:1.18,invite:1.2,regional:1.3,scout:1.4}[t.tier]||1;
 const roundMul=1+Math.min(.35,t.roundIndex*.07),resultMul=win?1.12:1;
 const pools=strategy==="fight"?["團戰","反應","操作","決策"]:strategy==="carry"?["對線","操作","換血","團戰"]:["遊戲理解","地圖意識","決策","溝通"];
 const chosen=[pools[rand(0,pools.length-1)],pools[rand(0,pools.length-1)]].filter((x,i,a)=>a.indexOf(x)===i);
 while(chosen.length<2){const x=pools[rand(0,pools.length-1)];if(!chosen.includes(x))chosen.push(x)}
 const gains=[];
 chosen.forEach((key,i)=>{
   const cur=p.stats[key]||50;
   const highScale=cur>=90?.42:cur>=85?.55:cur>=80?.68:cur>=75?.8:1;
   const base=(i===0?rand(14,24):rand(9,18))/100;
   const gain=+(base*tierMul*roundMul*resultMul*highScale).toFixed(2);
   p.stats[key]=Math.min(100,cur+gain);gains.push(`${key} +${gain.toFixed(2)}`);
 });
 // 正式賽事的高壓環境也會鍛鍊心態，越後段與高層級賽事機率越高。
 const mentalChance=clamp(.18+t.roundIndex*.08+(t.tier==="scout"?.18:t.tier==="regional"?.14:t.tier==="city"?.08:0),.18,.62);
 if(Math.random()<mentalChance){const cur=p.stats.心態,scale=cur>=90?.4:cur>=85?.55:cur>=80?.72:1,g=+((Math.random()*.12+.08)*tierMul*roundMul*scale).toFixed(2);p.stats.心態=clamp(cur+g,0,100);gains.push(`心態 +${g.toFixed(2)}`)}
 p.passion=clamp(p.passion+(win?1:0),0,100);
 return gains;
}
function finishAmateur(ev,v){
 const p=state.player,t=state.world.tournaments.find(x=>x.id===ev.tournamentId);if(!t)return;
 const heartbreak=(p.emotion?.betrayalUntil||0)>=state.date.week?5:0,bonus=v==="carry"?2:v==="stable"?1:0,teamPower=amateurTeamPower(t)-heartbreak,enemyPower=66+t.roundIndex*4+(t.tier==="scout"?10:t.tier==="regional"?8:t.tier==="city"?7:t.tier==="sponsor"?5:t.tier==="school"?3:0)+rand(-8,8),winChance=clamp(.50+(teamPower+bonus-enemyPower)/90,.18,.82),win=Math.random()<winChance;amateurRelations(t,win);
 ev.completed=true;p.energy=clamp(p.energy-18,0,100);p.stress=clamp(p.stress+6,0,100);
 const round=t.rounds[t.roundIndex],report=matchNarrative(win,v),expGain=gainTournamentExperience(t,win,v);t.history.push(`${round}：${win?"勝":"敗"}`);
 state.logs.push(`賽事實戰成長：${expGain.join("、")}。`);
 if(win && t.roundIndex<t.rounds.length-1){
   t.roundIndex++;t.nextWeek=state.date.week+1;t.status="等待下一輪";
   // 小型賽事每輪只給極少量職業關注，不直接灌聲望。
   if(round==="四強")p.proAttention=clamp(p.proAttention+1,0,100);
   state.logs.push(`${t.name} ${round}勝利，晉級${t.rounds[t.roundIndex]}。下一輪安排在下週末。`);
   save();document.querySelector(".modal-backdrop")?.remove();render();
   modal(`<h2>${round}勝利｜成功晉級</h2>${report}<div class="notice">📈 正式賽事實戰成長：${expGain.join("、")}</div><div class="notice">下一輪：${t.rounds[t.roundIndex]}，預計下週末進行。</div>${closeBtn()}`);
 }else{
   t.status=win?"冠軍":"淘汰";
   let prize=win?t.prize:0;p.cash+=prize;
   if(win){p.reputation=clamp(p.reputation+t.rep,0,100);p.proAttention=clamp(p.proAttention+Math.max(1,t.rep-1),0,100);state.news.unshift(`【賽事】${p.name}與隊友拿下${t.name}冠軍。`)}
   state.world.amateurHistory.unshift(`${t.name}｜${win?"冠軍":round+"止步"}`);
   state.logs.push(`${t.name}：${win?"奪冠":round+"淘汰"}。`);
   save();document.querySelector(".modal-backdrop")?.remove();render();
   modal(`<h2>${win?"🏆 冠軍！":`${round}止步`}</h2>${report}<div class="notice">📈 正式賽事實戰成長：${expGain.join("、")}</div><div class="stat-grid">${stat("獎金",`NT$${prize.toLocaleString()}`)}${stat("聲望",win?`+${t.rep}`:"+0")}</div>${closeBtn()}`);
 }
}
function advanceTournaments(){
 state.world.tournaments.filter(t=>t.status==="等待下一輪"&&t.nextWeek<=state.date.week).forEach(t=>{t.status="進行中";scheduleTournamentRound(t)});
}
function chooseSocial(){
 ensureV10();if(remain()<1){modal(`<h2>今天沒有剩餘時段</h2><p>社交需要 1 個時段。</p>${closeBtn()}`);return}
 const people=Object.values(state.characters||{}).filter(c=>c&&c.known&&c.name),main=document.querySelector("#main");
 main.innerHTML=`<section class="card"><div class="row space"><h2>👥 社交／閒聊</h2><button id="socialReturn" class="ghost">← 返回</button></div><p class="small">選擇要互動的角色。</p><div class="social-page-grid">${people.map(c=>`<button type="button" class="choice social-person-page" data-person="${c.name}"><strong>找 ${c.name}</strong><span class="small">${relationTier(state.player.relations?.[c.name]||0,c.name)} · ${Math.round(state.player.relations?.[c.name]||0)} · ${safeTraits(c).join("、")||"個性尚未熟悉"}${esportsRole(c.name)?" · "+esportsRole(c.name):""}</span></button>`).join("")}</div><button id="socialFive" class="btn secondary" style="width:100%;margin-top:12px">揪朋友五排開黑</button></section>`;
 document.querySelector("#socialReturn")?.addEventListener("click",render);document.querySelector("#socialFive")?.addEventListener("click",friendFiveStack);
 document.querySelectorAll(".social-person-page").forEach(b=>b.addEventListener("click",()=>openSocialPersonPage(b.dataset.person)));
}
function openSocialPersonPage(name){
 const c=state.characters?.[name];if(!c){chooseSocial();return}
 const rel=state.player.relations?.[name]||0,female=c.gender==="女",esports=isEsportsFriend(name),dating=(state.player.romance?.partners||[]).includes(name),pro=isProFriend(name);
 let acts=female?[["chat","聊天散步"],["food","一起吃飯"],["cafe","咖啡廳"],["movie","看電影"],["date","正式約會"],["confess","💗 告白"]]:[["food","吃飯聊天"],["arcade","去電競館"],["hangout","逛街／閒晃"],["game","一起打遊戲"],["latefood","吃宵夜"]];
 if(esports)acts.splice(1,0,["duo","Rank雙排"]);if(dating)acts.push(["communicate","💬 感情溝通"]);if(pro)acts.push(["spar","⚔️ 與職業選手切磋"]);
 document.querySelector("#main").innerHTML=`<section class="card"><div class="row space"><h2>${female?"💗":"🤝"} ${name}</h2><button id="socialBack" class="ghost">← 換人</button></div><p class="small">${dating?"戀人":relationTier(rel,name)} · 關係 ${Math.round(rel)}｜性別：${c.gender}｜個性：${safeTraits(c).join("、")||"尚未熟悉"}${pro?"｜職業選手好友":""}</p><div class="social-page-grid">${acts.map(a=>`<button type="button" class="choice social-act-page" data-act="${a[0]}" ${(a[0]==="date"&&rel<75&&!dating)||(a[0]==="confess"&&(rel<75||dating))?"disabled":""}><strong>${a[1]}</strong></button>`).join("")}</div></section>`;
 document.querySelector("#socialBack")?.addEventListener("click",chooseSocial);document.querySelectorAll(".social-act-page").forEach(b=>b.addEventListener("click",()=>b.dataset.act==="confess"?resolveRomance(name,"confess"):b.dataset.act==="communicate"?relationshipTalk(name):b.dataset.act==="spar"?sparWithPro(name):socialActivity(name,b.dataset.act)));
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
 reader.onload=()=>{try{const data=JSON.parse(reader.result);if(!data.player||!data.date)throw 0;state=normalize(data);ensureV10();save();render();modal(`<h2>📥 匯入完成</h2><p>第 ${state.date.week} 週・${DAYS[state.date.day-1]}</p>${closeBtn()}`)}catch(e){alert("無效的夜鋒存檔 JSON。")}};
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
 const growth=clubAbilityGrowth(type);
 state.player.passion=clamp(state.player.passion+2,0,100);
 if(Math.random()<.25){const missing=ROLES.filter(r=>r!==state.player.role)[rand(0,3)];discoverTeammate(missing,"電競社社課")}
 state.logs.push(`電競社：${type}。社內評價 +1。`);
 if(growth.length)state.logs.push(`📈 社團成長：${growth.map(x=>`${x[0]} +${x[1].toFixed(2)}`).join("、")}。`);
 save();render();modal(`<h2>🎓 ${type}</h2><p>${type==="他校訓練賽"?"教練安排與鄰校進行BO3。正式團隊賽讓你得到更多實戰經驗。":"教練帶著社員完成今天的訓練內容。"}</p><div class="notice goodtext">📈 ${growth.map(x=>`${x[0]} +${x[1].toFixed(2)}`).join("<br>")}</div><p>教練信任：${c.coachRelation}｜社內評價：${c.clubRep}</p>${closeBtn()}`);
}
function maybeRumor(){
 const p=state.player,candidates=["林雨晴","陳語彤","沈若晴","許安然"].filter(n=>state.characters[n]?.known&&(p.relations[n]||0)>=55);
 if(!candidates.length||Math.random()>.28)return;
 let n=candidates[rand(0,candidates.length-1)],r=`「${p.name}最近是不是常跟${n}待在一起？」班上的群組開始有人討論。`;
 state.world.rumors.unshift(r);p.mood=clamp(p.mood+rand(-4,2),0,100);p.romance.rumorRisk=clamp(p.romance.rumorRisk+8,0,100);
 state.logs.push(`校園緋聞出現：你和${n}的關係開始被注意。`);
}
function processExam(){
 const s=state.school;
 if(state.date.week!==s.examWeek||state.date.day!==5||s.examProcessedWeek===state.date.week)return;
 let p=state.player,score=Math.round(clamp(p.school*.55+s.examPrepared*.45+rand(-8,8),0,100));
 s.lastExam=score;s.examProcessedWeek=state.date.week;s.examHistory.unshift({week:state.date.week,score});
 if(s.examHistory.length>8)s.examHistory.length=8;
 if(score<60){p.family=clamp(p.family-8,0,100);p.mood=clamp(p.mood-6,0,100);state.logs.push(`段考平均 ${score} 分。父母很不滿意，家庭支持 -8。`)}
 else if(score>=85){p.family=clamp(p.family+5,0,100);p.mood=clamp(p.mood+4,0,100);state.logs.push(`段考平均 ${score} 分，成績很好。家庭支持 +5。`)}
 else state.logs.push(`段考平均 ${score} 分，順利過關。`);
 s.examPrepared=0;s.examWeek+=8;
}
function simple(name,cost,fn){
 if(name==="休息"){
  if(!consume(name,cost))return;
  const p=state.player;
  const e0=p.energy,m0=p.mood,s0=p.stress;
  p.energy=clamp(p.energy+24+(p.inventory?.includes("chair")?2:0),0,100);
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
function relationshipTalk(name){
 const p=state.player,c=state.characters?.[name];if(!c||!(p.romance.partners||[]).includes(name))return;
 if(remain()<1){modal(`<h2>沒有剩餘時段</h2>${closeBtn()}`);return}if(!consume("感情溝通",1))return;
 const rel=p.relations[name]||0,tr=safeTraits(c),others=(p.romance.partners||[]).filter(x=>x!==name),already=!!p.romance.polyConsent[name];
 let chance=.30+(rel-60)*.012+(tr.includes("成熟")?.10:0)+(tr.includes("溫柔")?.08:0)-(tr.includes("老實")?.05:0)-(tr.includes("拜金")?.04:0);chance=clamp(chance,.12,.78);
 let text="";
 if(!others.length){p.relations[name]=clamp(rel+rand(2,4),0,100);text=`你們認真聊了彼此的期待，${name}覺得被重視，關係有所改善。`;}
 else if(already){p.relations[name]=clamp(rel+2,0,100);text=`${name} 已經知道並接受目前的多角關係，你們再次確認彼此的界線。`;}
 else if(Math.random()<chance){p.romance.polyConsent[name]=true;p.relations[name]=clamp(rel+2,0,100);text=`${name} 經過溝通後，願意在知情與有界線的前提下接受目前的多角戀關係。`;state.logs.push(`💬 ${name} 同意知情的多角戀關係。`)}
 else{p.relations[name]=clamp(rel-rand(2,5),0,100);text=`${name} 無法接受和其他人共享戀愛關係。這次談話讓氣氛有些僵。`;}
 save();render();modal(`<h2>💬 與 ${name} 溝通</h2><p>${text}</p><div class="small">多角戀是否接受會受好感與個性影響，不保證成功。</div>${closeBtn()}`);
}
function sparWithPro(name){
 const p=state.player;if(!isProFriend(name)){modal(`<h2>無法切磋</h2><p>必須先和職業選手成為好友。</p>${closeBtn()}`);return}if(remain()<1)return;if(!consume(`與${name}切磋`,1))return;
 const c=state.characters[name]||{},role=normalizeRole(c.role||"中路"),roleKeys={上路:["對線","換血","操作","團戰"],打野:["地圖意識","決策","遊戲理解","心態"],中路:["對線","操作","決策","遊戲理解"],ADC:["操作","反應","補刀","團戰"],輔助:["溝通","地圖意識","決策","心態"]}[role]||["操作","決策","遊戲理解","團戰"],gains=[];
 const excellent=Math.random()<.24,insight=Math.random()<.08;
 for(let i=0;i<2;i++){const k=roleKeys.splice(rand(0,roleKeys.length-1),1)[0],cur=p.stats[k],scale=cur>=90?.42:cur>=85?.55:cur>=80?.68:cur>=75?.82:1;let g=(excellent?Math.random()*.25+.40:Math.random()*.25+.30)*scale;if(insight&&i===0)g=Math.max(g,(Math.random()*.10+.70)*scale);g=+g.toFixed(2);p.stats[k]=clamp(cur+g,0,100);gains.push(`${k} +${g.toFixed(2)}`)}
 p.energy=clamp(p.energy-12,0,100);p.stress=clamp(p.stress+3,0,100);p.relations[name]=clamp((p.relations[name]||0)+1,0,100);state.logs.push(`⚔️ 與 ${name} 切磋：${gains.join("、")}。`);save();render();modal(`<h2>⚔️ 職業選手切磋</h2><p>${name}（${role}）針對你的實戰細節給予回饋。</p>${excellent?`<div class="notice goodtext">🔥 今天切磋表現很好。</div>`:""}${insight?`<div class="notice goodtext">💡 你在切磋中有所領悟！</div>`:""}<div class="notice goodtext">${gains.join("<br>")}</div><p class="small">能力越高，切磋收益會逐步遞減。</p>${closeBtn()}`);
}
function maybePartnerBreakup(){
 const p=state.player,ps=[...(p.romance.partners||[])];for(const name of ps){const rel=p.relations[name]||0;if(rel>45)continue;const c=state.characters?.[name],tr=safeTraits(c),chance=rel<=25?.70:rel<=35?.38:.16;if(Math.random()>=chance)continue;p.romance.partners=p.romance.partners.filter(x=>x!==name);p.romance.partner=p.romance.partners[0]||null;delete p.romance.polyConsent[name];p.mood=clamp(p.mood-12,0,100);p.stress=clamp(p.stress+8,0,100);state.logs.push(`💔 ${name} 因長期關係惡化，主動提出分手。`);state.messages.push({id:"breakup-"+Date.now(),from:name,text:"我想了很久……我們現在的相處讓我很累。我覺得還是分開比較好。",unread:true,resolved:true,type:"normal"});break}
}
function maybeRomanceEvent(){
 const p=state.player,partners=p.romance.partners||[];
 const cs=Object.values(state.characters||{}).filter(c=>c?.known&&c.gender==="女"&&!partners.includes(c.name)&&(p.relations[c.name]||0)>=75&&!p.romance.flags[c.name]?.friendOnly);
 if(!cs.length)return;
 cs.sort((a,b)=>(p.relations[b.name]||0)-(p.relations[a.name]||0));const c=cs[0],rel=p.relations[c.name]||0,f=p.romance.flags[c.name]||{};
 if(f.cooldown&&state.date.week<f.cooldown)return;
 let chance=rel>=90?.34:rel>=85?.18:.08;
 if(safeTraits(c).includes("害羞"))chance*=.65;if(safeTraits(c).includes("外向"))chance*=1.25;
 if(Math.random()>chance)return;
 modal(`<h2>💌 ${c.name} 主動告白</h2><p>${c.name} 找到只有你們兩人的時候，認真告訴你：「我好像真的喜歡上你了。」${partners.length?"她知道你目前可能已經有交往中的對象。":""}</p><div class="reply-grid"><button class="reply romance-go" data-n="${c.name}" data-v="accept">接受告白</button><button class="reply romance-go" data-n="${c.name}" data-v="wait">我需要想一下</button><button class="reply romance-go" data-n="${c.name}" data-v="friend">婉拒，只當朋友</button></div>`);
 document.querySelectorAll(".romance-go").forEach(b=>b.onclick=()=>resolveRomance(b.dataset.n,b.dataset.v));
}
function resolveRomance(name,v){
 const p=state.player,c=state.characters[name],rel=p.relations[name]||0;if(!c||c.gender!=="女")return;
 if(v==="wait"){p.romance.flags[name]={cooldown:state.date.week+1};state.logs.push(`你和 ${name} 暫時維持曖昧。`)}
 else if(v==="friend"){p.romance.flags[name]={cooldown:state.date.week+4,friendOnly:true};state.logs.push(`你決定和 ${name} 維持朋友關係。`)}
 else if(v==="accept"){
   if(!p.romance.partners.includes(name))p.romance.partners.push(name);p.romance.partner=p.romance.partners[0]||name;p.relations[name]=clamp(rel+3,0,100);state.logs.push(`💞 你接受了 ${name} 的告白，正式開始交往。`);
 }else{
  let chance=.38+(rel-75)*.023;const tr=safeTraits(c);
  if(tr.includes("現實"))chance-=.05;if(tr.includes("天然呆"))chance-=.03;if(tr.includes("拜金")&&p.cash<10000)chance-=.10;if(tr.includes("老實"))chance+=.04;
  chance=clamp(chance,.28,.88);
  if(Math.random()<chance){if(!p.romance.partners.includes(name))p.romance.partners.push(name);p.romance.partner=p.romance.partners[0]||name;p.relations[name]=clamp(rel+3,0,100);state.logs.push(`💞 ${name} 接受你的告白，你們正式開始交往。`)}
  else{p.relations[name]=clamp(rel-2,0,100);p.romance.flags[name]={cooldown:state.date.week+3};state.logs.push(`${name} 還沒有準備好成為戀人。`)}
 }
 save();document.querySelector(".modal-backdrop")?.remove();render();
}
function maybeRomanceExposure(){
 const p=state.player,ps=p.romance.partners||[];if(ps.length<2)return;
 const nonConsenting=ps.filter(n=>!p.romance.polyConsent?.[n]);if(!nonConsenting.length){if(Math.random()<.06)state.logs.push("多角關係：彼此知情且已溝通界線，本週沒有爆發衝突。");return}
 if(Math.random()>.14)return;const a=nonConsenting[rand(0,nonConsenting.length-1)],b=ps.find(x=>x!==a);p.relations[a]=clamp((p.relations[a]||0)-rand(5,12),0,100);state.world.rumors.unshift(`有人開始傳你同時和 ${a}、${b} 走得非常近。`);state.logs.push(`⚠️ ${a} 尚未接受多角關係，信任明顯下降。`);
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

function maybePartnerBetrayal(){
 const p=state.player,ps=p.romance.partners||[];if(!ps.length)return;
 for(const name of [...ps]){
  const c=state.characters?.[name];if(!c)continue;
  const tr=safeTraits(c),rel=p.relations[name]||0;
  let chance=.004+(rel<65?.012:0)+(tr.includes("心機")?.008:0)+(tr.includes("拜金")&&p.cash<5000?.006:0)-(tr.includes("老實")?.004:0);
  if(Math.random()>=clamp(chance,0,.035))continue;
  p.romance.partners=p.romance.partners.filter(x=>x!==name);p.romance.partner=p.romance.partners[0]||null;
  p.relations[name]=clamp(rel-25,0,100);p.mood=clamp(p.mood-28,0,100);p.stress=clamp(p.stress+24,0,100);
  p.emotion={betrayalUntil:state.date.week+2,betrayalBy:name};
  state.world.rumors.unshift(`${name} 被人看到和別人過度親密，你們的感情因此破裂。`);
  state.logs.push(`💔 ${name} 劈腿。夜鋒受到很大打擊，未來兩週Rank與比賽發揮下降。`);
  state.messages.push({id:"betray-"+Date.now(),from:name,text:"對不起……我做了很傷你的事。我們可能沒辦法再像以前一樣了。",unread:true,resolved:true,type:"normal"});
  break;
 }
}
function nextDay(){
 ensureV10();let oldWeek=state.date.week,oldDay=state.date.day;baseNextDay();
 const advanced=state.date.day!==oldDay||state.date.week!==oldWeek;
 if(!advanced)return;
 simulateNpcRanks();maybeRomanceExposure();maybePartnerBetrayal();maybePartnerBreakup();maybeRomanceEvent();
 if(state.date.week!==oldWeek){
   generateWeeklyNews();advanceTournaments();maybeRumor();
   (state.player.romance.partners||[]).forEach(n=>{
     if(Math.random()<.25){
       state.player.relations[n]=clamp((state.player.relations[n]||0)-2,0,100);
       state.logs.push(`${n}覺得你最近把太多時間放在其他事情上，感情 -2。`);
     }
   });
   maybePartnerBreakup();
 }
 processExam();
 if(state.date.week>=3&&!state.characters.沈若晴.known&&Math.random()<.08){state.characters.沈若晴.known=true;state.player.relations.沈若晴=7;state.logs.push("校園事件：學生會活動中認識了高三學姊沈若晴。")}
 if(state.date.week>=4&&!state.characters.許安然.known&&Math.random()<.06){state.characters.許安然.known=true;state.player.relations.許安然=12;state.messages.push({id:"oldcrush-"+Date.now(),from:"許安然",text:"好久不見，我好像在朋友的限動看到你？你現在還在打遊戲喔？",unread:true,resolved:true,type:"normal"})}
 save();render();
}

document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>{activeTab=b.dataset.tab;render()});
document.querySelector("#resetBtn").onclick=()=>{if(confirm("確定刪除目前存檔並重開嗎？")){[SAVE_KEY,...OLD_KEYS].forEach(k=>localStorage.removeItem(k));state=newGame();activeTab="home";render()}};
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"}).then(r=>r.update()).catch(()=>{}));
render();
