
const SAVE_KEY="yefeng_v10_save";
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
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
  version:"1.9.1.8",started:false,
  player:{
   name:"夜鋒",age:16,role:"中路",cash:8000,rank:"鑽石 IV",lp:23,wins:0,losses:0,v138AllStatsBoosted:true,
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
 s.version="1.9.1.8";return s;
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
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const avg=()=>Object.values(state.player.stats).reduce((a,b)=>a+b,0)/Object.keys(state.player.stats).length;
const PRO_SLOTS=["上午","中午","下午","晚間","深夜"];
const slots=()=>isProfessionalStage()?PRO_SLOTS:(state.date.day<=5?WEEKDAY_SLOTS:WEEKEND_SLOTS);
const remain=()=>slots().length-state.dayState.usedSlots;
const todayPlan=()=>state.weeklyPlan[state.date.day]||[];
const monthFromWeek=w=>{
 const idx=Math.min(11,Math.floor(((Math.max(1,w)-1)*12)/52));
 return [9,10,11,12,1,2,3,4,5,6,7,8][idx];
};
const calendarYearForWeek=(schoolYear,w)=>monthFromWeek(w)>=9?schoolYear:schoolYear+1;
const dateLabel=()=>{
 const pro=typeof isProfessionalStage==="function"&&isProfessionalStage();
 const m=pro?careerMonthFromWeek(state.date.week):monthFromWeek(state.date.week);
 const y=pro?state.date.year:calendarYearForWeek(state.date.year,state.date.week);
 return `${y}年${m}月・第${state.date.week}週・週${DAYS[state.date.day-1]}`;
};
function syncCalendarFields(){
 if(!state.date||typeof state.date!=="object")return;
 state.date.week=Math.max(1,Math.min(52,Math.floor(state.date.week||1)));
 state.date.month=(typeof isProfessionalStage==="function"&&isProfessionalStage())?careerMonthFromWeek(state.date.week):monthFromWeek(state.date.week);
 if(!Number.isFinite(state.date.year))state.date.year=2026;
 if(!Number.isFinite(state.player.birthdaysPassed))state.player.birthdaysPassed=0;
 // Start age 16 in Sep 2026; birthday is in May. May begins around week 35.
 const shouldHavePassed=Math.max(0,(state.date.year-2026)+(state.date.week>=35?1:0));
 if(state.player.v1952AgeTimelineFixed){
   // V1.9.5.2+: age follows the canonical story season (2026=16, 2028=18, 2030=20).
   // Birthday tracking remains for events only and must never add another year.
   state.player.age=Math.max(16,16+(state.date.year-2026));
   state.player.birthYear=2010;
   state.player.birthdaysPassed=shouldHavePassed;
   if(typeof syncCanonicalAges==="function")syncCanonicalAges();
 }else if(shouldHavePassed>state.player.birthdaysPassed){
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
 const p=state.player,pc=p.proCareer||{},pro=["starter","sub","academy"].includes(pc.stage);
 if(pro){
  const matchLabel=pc.stage==="academy"?"🆚 訓練賽":"🏆 比賽";
  return `<section class="card"><h2>今天要做什麼？</h2>${pc.stage==="starter"&&ensureMandatoryProMatchToday()?`<div class="notice">🔴 今天有指定職業比賽。即使5個一般活動時段已全部用完，「比賽」仍可進入，而且必須完成後才能換日。</div>`:""}<div class="choice-grid">
  ${actionBtn("rank","🎮 Rank","1時段")}${actionBtn("train","🏋️ 訓練","1時段")}
  ${actionBtn("social","👥 社交","隊友／教練／重要人物")}${actionBtn("stream","📺 直播","1時段")}
  ${actionBtn("proMatch",matchLabel,pc.stage==="academy"?"青訓無正式聯賽":"查看／進行賽事")}${p.age>=18?actionBtn("fan","💌 女粉絲","成人社交"):""}
  ${actionBtn("outing","🏙️ 外出/逛街","1時段")}${actionBtn("travel","✈️ 出國","自己去／邀人同行")}${actionBtn("rest","🛏️ 休息","1時段")}
  </div><button id="nextDayBtn" class="btn secondary" style="width:100%;margin-top:12px">${remain()<=0?"結束今天":"前往下一天"}</button></section>`;
 }
 return `<section class="card"><h2>今天要做什麼？</h2><div class="choice-grid">
 ${actionBtn("rank","🎮 Rank","1時段")}${actionBtn("train","🏋️ 訓練","1時段")}${actionBtn("study","📚 讀書","1時段")}
 ${actionBtn("stream","📺 直播","1時段")}${actionBtn("social","👥 社交","1時段")}${p.age>=18?actionBtn("fan","💌 女粉絲","成人社交"):""}${actionBtn("work","💼 打工","2時段")}
 ${actionBtn("outing","🏙️ 外出/逛街","1時段")}${actionBtn("travel","✈️ 出國","自己去／邀人同行")}${actionBtn("club","🎓 電競社",state.date.day===5?"週五社課":"查看社團")}${actionBtn("team","🛡️ 戰隊",p.team?.formed?"一起訓練":"成立固定戰隊")}${actionBtn("rest","🛏️ 休息","1時段")}
 </div><button id="nextDayBtn" class="btn secondary" style="width:100%;margin-top:12px">${remain()<=0?"結束今天":"前往下一天"}</button></section>`;
}
function actionBtn(t,title,sub){
 let c=t==="work"?2:1;
 const mandatoryProMatch=t==="proMatch"&&state.player.proCareer?.stage==="starter"&&!!ensureMandatoryProMatchToday();
 const disabled=!mandatoryProMatch&&remain()<c;
 return `<button class="choice action-btn" data-action="${t}" ${disabled?"disabled":""}><strong>${mandatoryProMatch?"🔴 今日必要比賽":title}</strong><span class="small">${mandatoryProMatch?"不消耗一般活動時段・完成後才能換日":sub}</span></button>`;
}

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
  main.innerHTML=activeTab==="home"?home():activeTab==="rank"?rankPage():activeTab==="phone"?phone():activeTab==="children"?childrenPage():career();
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
 if(t==="proMatch"&&state.player.proCareer?.stage==="starter"&&ensureMandatoryProMatchToday())return proMatchHub();
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
 if(t==="fan")return openFemaleFanEvent();
 if(t==="outing")chooseOuting();
 if(t==="travel")chooseTravelDestination();
 if(t==="club")return esportsClubAction();
 if(t==="team")return openTeamPage();
 if(t==="proMatch")return proMatchHub();
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
  let baseChance=.525+(avg()-target)*.0175;
  const mentalAdj=clamp((p.stats.心態-60)*.0015,-.045,.06);
  let winChance=clamp(baseChance+masteryAdj/100+conditionAdj/100+poolAdj/100+mentalAdj+(isDuo?.015:0)-betrayalPenalty/100,.15,.84);
  const proChance=p.rank==="菁英"?.42:p.rank==="宗師"?.22:p.rank==="大師"?.07:0,metPro=Math.random()<proChance;
  const proNames=["Eclipse.Raven","KNG.Nox","Vortex.Luna","Astra.Zero9","Nova.Mori","Titan.Haku"],pro=metPro?proNames[rand(0,proNames.length-1)]:null;
  if(metPro){winChance=clamp(winChance-.035,.12,.80);ensureProCharacter(pro);p.proEncounters[pro]=(p.proEncounters[pro]||0)+1}
  const win=Math.random()<winChance,k=rand(win?3:0,win?10:6),d=rand(win?1:4,win?7:11),a=rand(2,13);
  const high=["宗師","菁英"].includes(p.rank);let delta=win?rand(high?15:18,high?23:27):-rand(high?17:15,high?25:23);if(m.level<25)delta-=2;
  if(win){p.wins++;p.lp+=delta;p.mood=clamp(p.mood+2,0,100);m.wins++;if(winChance<.46&&Math.random()<.35){const g=+(Math.random()*.10+.05).toFixed(2);p.stats.心態=clamp(p.stats.心態+g,0,100);state.logs.push(`🧠 逆風局取勝，心態 +${g.toFixed(2)}。`)}}else{p.losses++;p.lp+=delta;p.mood=clamp(p.mood-4,0,100);const resilience=clamp((p.stats.心態-55)/45,0,.65);p.stress=clamp(p.stress+5*(1-resilience*.45),0,100);if(Math.random()<.12){const g=+(Math.random()*.07+.03).toFixed(2);p.stats.心態=clamp(p.stats.心態+g,0,100);state.logs.push(`🧠 從失利中累積抗壓經驗，心態 +${g.toFixed(2)}。`)}}
  m.games++;m.level=clamp(m.level+(win?.14:.09),0,100);p.energy=clamp(p.energy-6,0,100);
  if(isProfessionalStage())changeCompetitiveForm(win?.6:-.4,win?"Rank勝利":"Rank失利");
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
 modal(`<h2>訓練方式</h2><div class="reply-grid"><button class="reply train-type" data-train="stat">基礎能力訓練</button><button class="reply train-type" data-train="hero">角色專項訓練</button><button class="reply train-type" data-train="review">復盤研究</button><button class="reply train-type" data-train="mental">心理訓練</button>${isProfessionalStage()?`<button class="reply train-type" data-train="scrim">🆚 戰隊訓練賽</button>`:""}</div>`);
 document.querySelectorAll(".train-type").forEach(b=>b.onclick=()=>{document.querySelector(".modal-backdrop")?.remove();finishTraining(b.dataset.train)});
}
function rewardCoachTrustForTraining(kind="訓練",amount=.6){if(!isProfessionalStage())return;const pc=state.player.proCareer;pc.weeklyTrainingTrust=pc.weeklyTrainingTrust||{week:state.date.week,gain:0};if(pc.weeklyTrainingTrust.week!==state.date.week)pc.weeklyTrainingTrust={week:state.date.week,gain:0};const room=Math.max(0,2.5-pc.weeklyTrainingTrust.gain),g=Math.min(room,amount);if(g>0){pc.coachTrust=clamp((pc.coachTrust||50)+g,0,100);pc.weeklyTrainingTrust.gain+=g;state.logs.push(`🧑‍🏫 ${kind}態度獲教練肯定，教練信任 +${g.toFixed(1)}。`)}}
function finishTraining(type){
 if(type==="scrim")return proScrim();
 if(type==="mental"){
  if(!consume("心理訓練",1))return;
  const p=state.player,before=p.stats.心態,scale=before>=90?.42:before>=85?.55:before>=80?.70:1,gain=(Math.random()*.15+.20)*scale,stress0=p.stress;
  p.stats.心態=clamp(before+gain,0,100);p.stress=clamp(p.stress-rand(4,8),0,100);p.energy=clamp(p.energy-5,0,100);
  rewardCoachTrustForTraining("心理訓練",.35);changeCompetitiveForm(1.5,"心理訓練與壓力調整");state.logs.push(`心理訓練：心態 ${before.toFixed(2)} → ${p.stats.心態.toFixed(2)}，壓力 -${Math.round(stress0-p.stress)}。`);save();render();
  modal(`<h2>🧠 心理訓練完成</h2><div class="big-number">${before.toFixed(2)} → ${p.stats.心態.toFixed(2)}</div><p class="goodtext">心態 +${gain.toFixed(2)}</p><p>壓力 -${Math.round(stress0-p.stress)}</p>${closeBtn()}`);return;
 }
 if(type==="hero"){
  chooseHero(id=>{if(!consume("角色專項訓練",1))return;let m=state.player.mastery[id],h=HEROES.find(x=>x.id===id),before=m.level,scale=before>=90?.45:before>=80?.65:before>=70?.82:1,gain=(Math.random()*.28+.28)*scale;m.level=clamp(m.level+gain,0,100);const hpGain=addAbilityGrowth("英雄池",Math.random()*.06+.05);state.player.energy=clamp(state.player.energy-8,0,100);state.player.stress=clamp(state.player.stress+2,0,100);rewardCoachTrustForTraining("角色專項訓練",.55);changeCompetitiveForm(1.2,"角色專項訓練");state.logs.push(`專項訓練：${h.name} 熟練度 +${gain.toFixed(2)}、英雄池 +${hpGain.toFixed(2)}`);save();render();modal(`<h2>角色專項訓練</h2><div class="big-number">${before.toFixed(2)} → ${m.level.toFixed(2)}</div><p class="goodtext">+${gain.toFixed(2)}</p>${closeBtn()}`)});
  return;
 }
 if(!consume(type==="review"?"復盤研究":"基礎訓練",1))return;
 const p=state.player,keys=type==="review"?["遊戲理解","地圖意識","決策","溝通"]:["操作","反應","對線","補刀","換血","團戰"],k=keys[rand(0,keys.length-1)],before=p.stats[k];
 const scale=before>=90?.45:before>=85?.58:before>=80?.70:before>=75?.82:1;
 let gain=(Math.random()*.15+.20)*scale;
 if(type!=="review"&&p.inventory?.includes("mouse"))gain*=1.05;if(k==="溝通"&&p.inventory?.includes("headset"))gain*=1.08;
 p.stats[k]=clamp(p.stats[k]+gain,0,100);p.energy=clamp(p.energy-8,0,100);p.stress=clamp(p.stress+2,0,100);
 rewardCoachTrustForTraining(type==="review"?"復盤研究":"基礎訓練",type==="review"?.7:.55);changeCompetitiveForm(type==="review"?1.4:1.2,type==="review"?"復盤研究":"基礎訓練");state.logs.push(`訓練：${k} ${before.toFixed(2)} → ${p.stats[k].toFixed(2)}`);save();render();modal(`<h2>訓練完成</h2><p>${k}</p><div class="big-number">${before.toFixed(2)} → ${p.stats[k].toFixed(2)}</div><p class="goodtext">+${gain.toFixed(2)}</p>${closeBtn()}`);
}
function chooseStream(){
 if(remain()<1)return;modal(`<h2>直播內容</h2><div class="reply-grid">${["Rank實況","教學台","雜談","娛樂場"].map(x=>`<button class="reply stream-choice" data-v="${x}">${x}</button>`).join("")}</div>`);
 document.querySelectorAll(".stream-choice").forEach(b=>b.onclick=()=>{if(!consume("直播",1))return;const p=state.player;let g=rand(2,9)+Math.floor((p.followers||0)/5000);p.followers+=g;p.energy=clamp(p.energy-7,0,100);let income=(p.followers>=5000)?Math.round(rand(180,520)*(1+Math.log10(Math.max(1,p.followers/5000)))):0;p.cash+=income;ensureCommercial().filter(x=>x.category==="直播平台").forEach(x=>x.done=(x.done||0)+1);state.logs.push(`直播「${b.dataset.v}」，新增${g}位粉絲${income?`，收益 NT$${income.toLocaleString()}`:""}。`);save();document.querySelector(".modal-backdrop")?.remove();render();modal(`<h2>直播結束</h2><p>新增 ${g} 位粉絲。</p>${income?`<div class="notice">💰 直播收益 NT$${income.toLocaleString()}</div>`:""}${closeBtn()}`)});
}
function fallbackTraits(c){
 const male=["努力","老實","外向","冷靜","好勝","溫和","講義氣","謹慎","野心","責任感強","內向","冒險","領袖氣質","大心臟","慢熱","容易上頭"];
 const female=["努力","老實","可愛","天然呆","成熟","現實","溫柔","好勝","獨立","理性","浪漫","高依附","責任感強","冒險","內向","外向","冷靜","敏感","忠誠","自由奔放"];
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




// V1.9.2.9: social activities must never abort after consuming a time slot.
function addSecretRomanceRisk(person,amount=0){
 const c=state.characters?.[person];
 if(!c||!Number.isFinite(Number(amount)))return 0;
 const dating=(state.player.romance?.partners||[]).includes(person)||state.player.romance?.spouse===person||c.relationshipType==="地下戀人";
 if(!dating||!c.publicFigure||c.publicRomance)return 0;
 c.secretRomanceRisk=clamp(Number(c.secretRomanceRisk||0)+Number(amount||0),0,100);
 return c.secretRomanceRisk;
}

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
 state.player.mood=clamp(state.player.mood+3,0,100);if(["food","cafe","movie","date","hangout","latefood"].includes(type)){try{addSecretRomanceRisk(person,type==="date"?8:4)}catch(err){state.logs.push(`⚠️ 社交風險相容修復：${err?.message||err}`)}}
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
 save();
 if(type==="date"){
   const rel=state.player.relations?.[person]||0;
   // V1.9.2.8 hard regression: never render between date settlement and result modal.
   // Safari could replace the social page before the deferred modal was painted, making the date look skipped.
   modal(`<h2>💗 正式約會完成</h2><p>你和 <strong>${person}</strong> 完成了今天的正式約會。</p><div class="notice goodtext">關係 +${gain}${cost?`<br>花費 NT$${cost.toLocaleString()}`:""}<br>目前關係值：${rel}</div><p>心情有所放鬆，這次正常約會不會降低競技狀態。</p><p class="small">已消耗 1 格生活時段。</p><button id="dateResultOk" class="primary">確定</button>`);
   document.querySelector("#dateResultOk")?.addEventListener("click",()=>{document.querySelector('.modal-backdrop')?.remove();render();});
   return;
 }
 render();
 setTimeout(()=>maybeRomanceEvent(),0);
}
function isInternationalTrip(){const ph=proAnnualPhase();return isProfessionalStage()&&["MSI","世界賽"].includes(ph)&&playerQualifiedForInternational(ph)}

const FREE_TRAVEL_DESTINATIONS=[
 {id:"taipei",country:"台灣",city:"台北",cost:18000},{id:"taoyuan",country:"台灣",city:"桃園",cost:17000},
 {id:"tokyo",country:"日本",city:"東京",cost:22000},{id:"osaka",country:"日本",city:"大阪",cost:21000},
 {id:"seoul",country:"韓國",city:"首爾",cost:19000},{id:"busan",country:"韓國",city:"釜山",cost:20000},
 {id:"shanghai",country:"中國",city:"上海",cost:18000},{id:"paris",country:"法國",city:"巴黎",cost:52000},
 {id:"london",country:"英國",city:"倫敦",cost:55000},{id:"berlin",country:"德國",city:"柏林",cost:52000},
 {id:"madrid",country:"西班牙",city:"馬德里",cost:52000},{id:"la",country:"美國",city:"洛杉磯",cost:50000}
];
const TEAM_RESIDENCE={
 "Berlin Knights":{country:"德國",city:"柏林"},"Paris Arc":{country:"法國",city:"巴黎"},
 "Madrid Solar":{country:"西班牙",city:"馬德里"},"London Forge":{country:"英國",city:"倫敦"},
 "Seoul Crown":{country:"韓國",city:"首爾"},"Busan Storm":{country:"韓國",city:"釜山"},
 "Han River Fox":{country:"韓國",city:"首爾"},"Incheon Nova":{country:"韓國",city:"仁川"},
 "Shanghai Dragons":{country:"中國",city:"上海"},"Beijing Pulse":{country:"中國",city:"北京"},
 "Chengdu Blaze":{country:"中國",city:"成都"},"Hangzhou Tide":{country:"中國",city:"杭州"},
 "LA Comets":{country:"美國",city:"洛杉磯"},"New York Guard":{country:"美國",city:"紐約"},
 "Austin Rift":{country:"美國",city:"奧斯汀"},"Seattle Waves":{country:"美國",city:"西雅圖"}
};
function currentResidenceProfile(){
 const pc=state.player.proCareer||{},team=pc.team||"",r=fixedTeamRegion(team)||pc.region||"PCS";
 if(TEAM_RESIDENCE[team])return {...TEAM_RESIDENCE[team],region:r};
 return {...(REGION_DEFAULT_RESIDENCE[r]||REGION_DEFAULT_RESIDENCE.PCS),region:r};
}
function currentResidenceCountry(){return currentResidenceProfile().country}
function currentResidenceCity(){return currentResidenceProfile().city}
function activePrivateTravel(){
 const t=state.player.activeTravel;if(!t)return null;const serial=state.date.year*364+(state.date.week-1)*7+state.date.day;
 if(t.untilSerial!=null&&serial>t.untilSerial){state.player.activeTravel=null;return null}return t;
}
function currentLocationProfile(){
 if(isInternationalTrip()){const ev=chooseHost(proAnnualPhase(),state.date.year);return {...ev.host,reason:"國際賽"}}
 const t=activePrivateTravel();if(t)return {country:t.country,city:t.city,reason:"私人旅行"};
 return {...currentResidenceProfile(),reason:"常駐地"};
}
function privateTravelRemainingDays(){
 const t=activePrivateTravel();if(!t)return 0;
 const serial=state.date.year*364+(state.date.week-1)*7+state.date.day;
 return Math.max(0,(t.untilSerial||serial)-serial+1);
}
function locationStatusCard(){
 const here=currentLocationProfile(),home=currentResidenceProfile(),t=activePrivateTravel();
 if(!t)return `<section class="card"><h2>📍 所在地</h2><div class="stat-grid">${stat("目前所在地",`${here.country}・${here.city}`)}${stat("常駐地",`${home.country}・${home.city}`)}</div></section>`;
 return `<section class="card"><h2>✈️ 旅行中</h2><div class="stat-grid">${stat("目前所在地",`${here.country}・${here.city}`)}${stat("旅行剩餘",`${privateTravelRemainingDays()}天`)}${stat("常駐地",`${home.country}・${home.city}`)}</div><div class="notice">旅行時間結束後會自動返回 ${home.country}・${home.city}。</div></section>`;
}
function availableTravelDestinations(){
 const home=currentResidenceCountry();
 return FREE_TRAVEL_DESTINATIONS.filter(d=>d.country!==home);
}
function travelBlockedReason(){
 if(hardEventToday())return "今天已有鎖定的重要行程。";
 if(isInternationalTrip())return "目前正在參加MSI／世界賽，不能另外安排私人出國旅行。";
 const m=state.player.proCareer?.stage==="starter"?currentScheduledProMatch():null;
 if(m){const now=proDaySerial(),target=((m.year*52+m.week)*7+m.day);if(target-now<=2)return "兩天內有正式比賽，戰隊不允許安排出國旅行。"}
 return "";
}
function chooseTravelDestination(){
 if(remain()<1)return;const blocked=travelBlockedReason();if(blocked){modal(`<h2>✈️ 無法出國</h2><p>${blocked}</p>${closeBtn()}`);return}
 const destinations=availableTravelDestinations();
 modal(`<h2>✈️ 出國旅行</h2><p class="small">目前生活據點：${currentResidenceCountry()}・${currentResidenceCity()}。目前所在國家不會出現在「出國」目的地。</p><div class="reply-grid">${destinations.map(d=>`<button class="reply travel-dest" data-dest="${d.id}"><strong>${d.country}・${d.city}</strong><div class="small">預估 NT$${d.cost.toLocaleString()}</div></button>`).join("")}</div>${closeBtn()}`);
 document.querySelectorAll(".travel-dest").forEach(b=>b.onclick=()=>chooseTravelCompanion(b.dataset.dest));
}
function travelCompanionCandidates(){
 const p=state.player;return Object.values(state.characters||{}).filter(c=>c?.known&&c.name!==p.name&&proSocialAllowed(c)&&Number.isFinite(p.relations?.[c.name])).sort((a,b)=>(p.relations[b.name]||0)-(p.relations[a.name]||0)).slice(0,18);
}
function chooseTravelCompanion(destId){
 const d=FREE_TRAVEL_DESTINATIONS.find(x=>x.id===destId);if(!d)return;const people=travelCompanionCandidates();
 modal(`<h2>✈️ ${d.country}・${d.city}</h2><p>要跟誰一起去？</p><div class="reply-grid"><button class="reply travel-with" data-dest="${d.id}" data-person=""><strong>🧳 自己去</strong><div class="small">海外奇遇機率較高</div></button>${people.map(c=>`<button class="reply travel-with" data-dest="${d.id}" data-person="${c.name}"><strong>${c.name}</strong><div class="small">${relationTier(state.player.relations[c.name]||0,c.name)}｜關係 ${Math.round(state.player.relations[c.name]||0)}</div></button>`).join("")}</div>${closeBtn()}`);
 document.querySelectorAll(".travel-with").forEach(b=>b.onclick=()=>confirmFreeTravel(b.dataset.dest,b.dataset.person||""));
}
function confirmFreeTravel(destId,person){
 const p=state.player,d=FREE_TRAVEL_DESTINATIONS.find(x=>x.id===destId);if(!d)return;
 if(person){const rel=p.relations[person]||0,c=state.characters[person],dating=(p.romance?.partners||[]).includes(person)||p.romance?.spouse===person,chance=clamp(.28+rel*.006+(dating?.18:0)-(c?.isPro?.08:0),.18,.92);
  if(Math.random()>chance){state.logs.push(`✈️ ${person}婉拒了${d.city}旅行邀請。`);modal(`<h2>旅行邀請</h2><p>${person}這次沒辦法同行。</p><button id="travelAloneAfterReject" class="reply">改成自己去</button>${closeBtn()}`);document.querySelector("#travelAloneAfterReject")?.addEventListener("click",()=>executeFreeTravel(d.id,""));return}}
 executeFreeTravel(d.id,person||"");
}
function executeFreeTravel(destId,companion){
 const p=state.player,d=FREE_TRAVEL_DESTINATIONS.find(x=>x.id===destId);if(!d||remain()<1)return;
 if(p.cash<d.cost){modal(`<h2>✈️ 旅費不足</h2><p>${d.city}預估需要 NT$${d.cost.toLocaleString()}。</p>${closeBtn()}`);return}
 if(!consume(`出國：${d.city}`,1))return;p.cash-=d.cost;p.energy=clamp(p.energy-rand(5,10),0,100);p.mood=clamp(p.mood+rand(6,12),0,100);p.stress=clamp(p.stress-rand(4,9),0,100);
 p.travelHistory=p.travelHistory||[];p.travelHistory.unshift({year:state.date.year,week:state.date.week,country:d.country,city:d.city,companion:companion||"自己"});
 const serial=state.date.year*364+(state.date.week-1)*7+state.date.day;p.activeTravel={country:d.country,city:d.city,companion:companion||"",startedSerial:serial,untilSerial:serial+2};if(companion&&state.characters?.[companion]){const c=state.characters[companion];c.travellingWithPlayer=true;c.currentCountry=d.country;c.currentCity=d.city;c.currentTravelReason="與夜鋒旅行中";}
 if(companion){const gain=rand(4,9);p.relations[companion]=clamp((p.relations[companion]||0)+gain,0,100);state.logs.push(`✈️ 你和 ${companion} 前往${d.country}・${d.city}旅行，關係 +${gain}。`)}else state.logs.push(`✈️ 你獨自前往${d.country}・${d.city}旅行。`);
 document.querySelector(".modal-backdrop")?.remove();save();render();freeTravelEncounter(d,companion);
}
function freeTravelEncounter(d,companion){
 const p=state.player,r=Math.random(),solo=!companion;
 if(r<(solo?.58:.34)){const pools={日本:["森川澪","橘花音","白石奈緒"],韓國:["姜敏書","徐恩彩","柳多賢"],中國:["葉清禾","宋知夏","唐若琳"],法國:["Élise Bernard","Clara Moreau","Nina Roux"],英國:["Isla Brown","Maya Evans","Freya Hall"],美國:["Chloe Adams","Avery Kim","Hailey Moore"]},pool=pools[d.country]||["Maya Lee","Nina Chen","Emma Park"],unseen=pool.filter(n=>!state.characters?.[n]?.known);
  if(unseen.length){const n=unseen[rand(0,unseen.length-1)],age=19+stableAgeOffset(n,9);addSocialAcquaintance(n,rand(15,28),{gender:"女",age,birthYear:state.date.year-age,nationality:d.country,role:"旅行認識",desc:`在${d.city}私人旅行期間認識`,romanceable:true,traits:["好奇","獨立"]});modal(`<h2>🌏 旅行奇遇</h2><p>在${d.city}旅行時，你第一次認識了 ${n}（${age}歲），她已加入社交好友。</p>${closeBtn()}`)}
  else{p.followers+=rand(20,80);modal(`<h2>🌏 ${d.city}</h2><p>沒有認識新的固定人物，但你被幾位當地電競粉絲認出。</p>${closeBtn()}`)}
 }else if(companion&&r<.72){const gain=rand(3,7);p.relations[companion]=clamp((p.relations[companion]||0)+gain,0,100);modal(`<h2>🧳 同行事件</h2><p>你和 ${companion} 在${d.city}留下很好的回憶，關係再 +${gain}。</p>${closeBtn()}`)}
 else{p.mood=clamp(p.mood+3,0,100);modal(`<h2>📸 ${d.city}旅行</h2><p>你觀光、品嘗當地料理並好好放鬆。</p>${closeBtn()}`)}
 save();
}
function residenceOutingPlaces(){
 const {country,city}=currentLocationProfile();
 const common=[["university","大學校園"],["highschool","高中／回母校"],["mall","購物中心"],["cafe","咖啡廳"],["restaurant","餐廳"],["arcade","電競館"],["gym","健身房"],["cinema","電影院"],["bar","酒吧"],["night","夜間街區"]];
 const local={
  台灣:[["nightmarket","夜市"],["landmark","台北城市景點"]],
  韓國:[["landmark",`${city}城市景點`],["pcbang","PC Bang"],["river","漢江／海雲台散步"]],
  中國:[["landmark",`${city}城市景點`],["mall","大型商圈"],["tea","茶館"]],
  美國:[["landmark",`${city}城市景點`],["sports","運動場館"],["diner","美式餐館"]],
  德國:[["landmark",`${city}城市景點`],["square","城市廣場"],["bakery","烘焙咖啡館"]],
  法國:[["landmark",`${city}城市景點`],["museum","博物館"],["bakery","甜點咖啡館"]],
  英國:[["landmark",`${city}城市景點`],["pub","英式酒吧"],["park","城市公園"]],
  西班牙:[["landmark",`${city}城市景點`],["plaza","廣場"],["tapas","Tapas餐館"]]
 };
 return [...(local[country]||[["landmark",`${city}城市景點`]]),...common];
}
function chooseOuting(){
 if(remain()<1)return;
 const intl=isInternationalTrip(),profile=currentLocationProfile(),places=intl?[["landmark","當地景點"],["mall","購物中心"],["cafe","咖啡廳"],["restaurant","餐廳"],["arcade","電競館"],["bar","酒吧"],["hotel","飯店設施"],["night","夜間街區"]]:residenceOutingPlaces();
 modal(`<h2>去哪裡？｜📍${profile.country}・${profile.city}</h2><div class="reply-grid">${places.map(x=>`<button class="reply outing-choice" data-place="${x[0]}">${x[1]}</button>`).join("")}</div>`);
 document.querySelectorAll(".outing-choice").forEach(b=>b.onclick=()=>{if(!consume("外出",1))return;const place=b.dataset.place;document.querySelector(".modal-backdrop")?.remove();state.player.energy=clamp(state.player.energy-(place==="bar"||place==="pub"?8:4),0,100);state.player.mood=clamp(state.player.mood+((place==="bar"||place==="pub")?4:2),0,100);state.logs.push(`外出：在${profile.country}・${profile.city}去了${placeName(place)}。`);save();render();randomEncounter(place)});
}
function placeName(p){return {university:"大學校園",highschool:"高中／母校",mall:"商場",arcade:"電競館",cafe:"咖啡廳",restaurant:"餐廳",gym:"健身房",cinema:"電影院",nightmarket:"夜市",bar:"酒吧",store:"便利商店",book:"書店",landmark:"當地景點",hotel:"飯店設施",night:"夜間街區",pcbang:"PC Bang",river:"河岸／海邊",tea:"茶館",sports:"運動場館",diner:"美式餐館",square:"城市廣場",bakery:"烘焙咖啡館",museum:"博物館",pub:"英式酒吧",park:"城市公園",plaza:"廣場",tapas:"Tapas餐館"}[p]||p}
function localEncounterPool(country){
 const pools={
 台灣:{女:["蘇妍希","夏寧","語芯","林若彤","陳子晴","許雅涵"],男:["陳奕廷","林柏宇","周承翰","許家豪","江宇辰"]},
 日本:{女:["水野凜","藤原美月","小川葵","高橋結衣"],男:["佐藤悠真","高橋蓮","中村海斗","山本翔"]},
 韓國:{女:["金瑞妍","朴智恩","李夏恩","崔秀雅"],男:["金敏俊","朴志勳","李俊昊","崔賢宇"]},
 中國:{女:["林若曦","沈佳寧","蘇雨桐","顧清妍"],男:["陳景川","周子謙","沈昊然","葉承澤"]},
 美國:{女:["Mia Carter","Olivia Brooks","Ava Johnson"],男:["Ethan Carter","Ryan Brooks","Noah Davis"]},
 德國:{女:["Lena Weber","Mia Hoffmann"],男:["Leon Weber","Felix Hoffmann"]},法國:{女:["Emma Laurent","Chloé Martin"],男:["Louis Martin","Hugo Laurent"]},英國:{女:["Sophie Miller","Olivia Clarke"],男:["Oliver Clarke","Harry Miller"]},西班牙:{女:["Lucía Martín","Carmen Ruiz"],男:["Mateo Ruiz","Hugo Martín"]}};
 return pools[country]||{女:["Maya Lee","Nina Chen"],男:["Leo Chen","Alex Park"]};
}
function civilianCareerFor(name,context,gender){
 const common=["大學生","研究生","一般上班族","醫師","護理師","空服員","記者","攝影師","設計師","健身教練","餐飲業","企業家","富二代"];
 const publicJobs=gender==="女"?["藝人","歌手／偶像","知名主播","啦啦隊員","模特兒","網紅"]:["藝人","歌手／偶像","知名主播","YouTuber","模特兒","網紅"];
 const pool=(context==="bar"||context==="night"||context==="landmark")?[...common,...publicJobs,...publicJobs]:[...common,...publicJobs];
 return pool[socialStableHash(name,`career:${context}`)%pool.length];
}
function isPublicFigureCareer(job){return /藝人|歌手|偶像|知名主播|啦啦隊|網紅|YouTuber|模特兒/.test(job||"")}
function socialStableHash(name,salt=""){
 let h=2166136261>>>0;for(const ch of `${name}|${salt}`){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0}return h>>>0;
}
function diversifiedGameRole(name){
 const roles=["上路","打野","中路","ADC","輔助"];
 return roles[socialStableHash(name,"role")%roles.length];
}
function shouldLocalAcquaintanceBeGamer(name,context){
 if(["arcade","pcbang"].includes(context))return true;
 return socialStableHash(name,`gamer:${context}`)%100<44;
}
function makeLocalAcquaintanceMeta(name,country,city,context,gender="女"){
 const gamer=shouldLocalAcquaintanceBeGamer(name,context)&&socialStableHash(name,"civilian")%100<36,gameRole=gamer?diversifiedGameRole(name):null;
 const career=civilianCareerFor(name,context,gender);
 const personalityPool=["外向","內向","理性","感性","獨立","浪漫","責任感強","好勝","冷靜","冒險","忠誠","敏感"];const traits=[personalityPool[socialStableHash(name,"traitA")%personalityPool.length],personalityPool[socialStableHash(name,"traitB")%personalityPool.length]].filter((x,i,a)=>a.indexOf(x)===i);return {gender,age:18+stableAgeOffset(name,13),nationality:country,homeCountry:country,homeCity:city,currentCountry:country,currentCity:city,career,occupation:career,gameRole,role:gamer?gameRole:career,playsGame:gamer,identityType:career,publicFigure:isPublicFigureCareer(career),acquaintanceSource:`${country}・${city}${placeName(context)}`,romanceable:gender==="女",traits,desc:`在${city}${placeName(context)}認識的${career}${gamer?`，平時也會玩${gameRole}`:""}。`};
}
function repairFlexibleAcquaintanceRoles(){
 const protectedNames=new Set(Object.keys(STORY_SOCIAL_IDENTITIES||{}));
 Object.values(state.characters||{}).forEach(c=>{
  if(!c?.name||protectedNames.has(c.name)||c.isPro||c.isProStaff)return;
  const src=`${c.acquaintanceSource||""} ${c.desc||""} ${c.role||""}`;
  const flexible=/旅行|當地|生活期間|國際賽期間|酒吧|海外|城市|電競館|PC Bang|夜間街區/.test(src);
  if(!flexible)return;
  const context=/電競館|PC Bang/.test(src)?"arcade":/酒吧/.test(src)?"bar":/夜間街區/.test(src)?"night":/景點/.test(src)?"landmark":"local";
  const gender=c.gender||"女";
  const career=c.career||c.occupation||civilianCareerFor(c.name,context,gender);
  c.career=career;c.occupation=career;c.identityType=career;c.publicFigure=isPublicFigureCareer(career);
  const gamer=c.playsGame===true||shouldLocalAcquaintanceBeGamer(c.name,context)&&socialStableHash(c.name,"civilian")%100<36;
  c.playsGame=!!gamer;
  if(gamer){c.gameRole=c.gameRole||(["上路","打野","中路","ADC","輔助"].includes(normalizeRole(c.role))?normalizeRole(c.role):diversifiedGameRole(c.name));c.role=c.gameRole}
  else if(["上路","打野","中路","ADC","輔助","下路","射手","業餘玩家","一般人"].includes(c.role))c.role=career;
 });
}
function repairPermanentCivilianProfessions(){
 const p=state.player;
 Object.values(state.characters||{}).forEach(c=>{
  if(!c?.name||STORY_SOCIAL_IDENTITIES[c.name]||c.isPro||c.isProStaff||confirmedProfessionalRecord(c.name)||c.formerSpouse)return;
  const src=`${c.acquaintanceSource||""} ${c.desc||""}`;
  if(!/台灣|日本|韓國|中國|美國|德國|法國|英國|西班牙|酒吧|夜間街區|當地|旅行|國際賽/.test(src))return;
  let context=/酒吧/.test(src)?"bar":/夜間街區/.test(src)?"night":/電競館|PC Bang/.test(src)?"arcade":/景點/.test(src)?"landmark":"local";
  let career=c.career||c.occupation;
  if(!career||["業餘玩家","一般人"].includes(career))career=civilianCareerFor(c.name,context,c.gender||"女");
  c.career=career;c.occupation=career;c.identityType=career;c.publicFigure=isPublicFigureCareer(career);
  if(c.playsGame){c.gameRole=c.gameRole||(["上路","打野","中路","ADC","輔助"].includes(normalizeRole(c.role))?normalizeRole(c.role):diversifiedGameRole(c.name));c.role=c.gameRole}
  else if(["上路","打野","中路","ADC","輔助","下路","射手","業餘玩家","一般人"].includes(c.role))c.role=career;
 });
 // 已知 V1.9.1.8 截圖中的舊存檔人物：依當時生成規則還原永久職業。
 [["許家豪","藝人","男"],["許雅涵","模特兒","女"]].forEach(([name,career,gender])=>{const c=state.characters?.[name];if(!c)return;c.gender=c.gender||gender;c.career=career;c.occupation=career;c.identityType=career;c.publicFigure=isPublicFigureCareer(career);if(c.playsGame){c.gameRole=c.gameRole||diversifiedGameRole(name);c.role=c.gameRole}else c.role=career});
}

function createResidenceEncounter(context){
 const p=state.player,{country,city}=currentLocationProfile();
 if(Math.random()<.78){
   const female=Math.random()<.52,pools=localEncounterPool(country),pool=female?pools.女:pools.男,unseen=pool.filter(n=>!state.characters?.[n]?.known),name=(unseen.length?unseen:pool)[rand(0,(unseen.length?unseen:pool).length-1)];
   if(!state.characters[name]){const meta=makeLocalAcquaintanceMeta(name,country,city,context,female?"女":"男");meta.birthYear=state.date.year-meta.age;addSocialAcquaintance(name,rand(12,28),meta)}
   const c=state.characters[name];state.logs.push(`🏙️ 當地生活：在${country}・${city}${placeName(context)}遇到 ${name}（${c.career||c.identityType}）。`);
   modal(`<h2>🏙️ ${city}生活</h2><p>你在${placeName(context)}遇到 ${name}。</p><div class="notice">${c.gender}｜${c.career||c.identityType}｜${country}・${city}</div>${female&&(context==="bar"||context==="pub")&&p.age>=18?`<button id="barPrivate" class="reply">🌙 詢問是否願意共度私人時間</button>`:""}${closeBtn()}`);document.querySelector('#barPrivate')?.addEventListener('click',()=>attemptConsensualPrivateEvent(name,'bar'));
 }else{p.followers+=rand(15,80);state.logs.push(`📸 ${city}的當地粉絲認出夜鋒，當地人氣小幅上升。`);modal(`<h2>📸 當地粉絲</h2><p>${city}有粉絲認出你並要求合照。</p>${closeBtn()}`)}save();
}
function createForeignEncounter(context){
 const p=state.player,ev=chooseHost(proAnnualPhase(),state.date.year),female=Math.random()<.62;
 if(female){const pools={韓國:["韓智媛","尹書妍","崔娜恩"],日本:["水野凜","藤原美月","小川葵"],中國:["沈雨薇","周若彤","林可欣"],法國:["Camille Laurent","Léa Martin"],英國:["Emily Clarke","Sophie Reed"],美國:["Mia Carter","Olivia Brooks"]},pool=pools[ev.host.country]||["Emma Lee","Nina Park","Maya Chen"],unseen=pool.filter(n=>!state.characters?.[n]?.known),name=(unseen.length?unseen:pool)[rand(0,(unseen.length?unseen:pool).length-1)];if(!state.characters[name]){const meta=makeLocalAcquaintanceMeta(name,ev.host.country,ev.host.city,context);meta.age=19+stableAgeOffset(name,8);meta.birthYear=state.date.year-meta.age;meta.acquaintanceSource=`${proAnnualPhase()}・${ev.host.city}`;meta.desc=meta.playsGame?`在${ev.host.city}國際賽期間認識的${meta.role}玩家。`:`在${ev.host.city}國際賽期間認識。`;addSocialAcquaintance(name,rand(15,35),meta)}state.logs.push(`✈️ 海外奇遇：在${ev.host.city}${placeName(context)}遇到 ${name}。`);modal(`<h2>✈️ 海外奇遇｜${ev.host.city}</h2><p>你遇到 ${name}（${state.characters[name].age}歲）。</p>${context==="bar"&&p.age>=18?`<button id="barPrivate" class="reply">🌙 詢問是否願意共度私人時間</button>`:""}${closeBtn()}`);document.querySelector("#barPrivate")?.addEventListener("click",()=>attemptConsensualPrivateEvent(name,"bar"));}
 else{p.followers+=rand(40,160);p.stress=clamp(p.stress+rand(0,3),0,100);state.logs.push(`🌍 海外奇遇：${ev.host.city}當地粉絲認出夜鋒，海外粉絲增加。`);modal(`<h2>🌍 海外粉絲</h2><p>當地粉絲認出你並要求合照，海外人氣上升。</p>${closeBtn()}`)}save();
}
function randomEncounter(context){
 if(context==="highschool"||context==="university"){schoolEncounter(context);return}
 if(isInternationalTrip()){createForeignEncounter(context);return}
 if(isProfessionalStage()){createResidenceEncounter(context);return}
 if(context==="bar"&&state.player.age>=18){const n=["陳映彤","蘇婕妤","葉心妍"][rand(0,2)];if(!state.characters[n])state.characters[n]={name:n,known:true,gender:"女",age:18+stableAgeOffset(n,8),role:"酒吧認識",romanceable:true,traits:["外向"]};state.player.relations[n]=state.player.relations[n]??rand(10,30);save();modal(`<h2>🍸 酒吧奇遇</h2><p>你認識了 ${n}，彼此聊得不錯。</p><button id="barPrivate" class="reply">🌙 詢問是否願意共度私人時間</button>${closeBtn()}`);document.querySelector("#barPrivate")?.addEventListener("click",()=>attemptConsensualPrivateEvent(n,"bar"));return}
 const r=Math.random();if(context==="arcade"&&!state.eventFlags.zichen){state.eventFlags.zichen=true;state.characters.子辰.known=true;state.player.relations.子辰=8;modal(`<h2>🎲 奇遇｜電競館</h2><p>隔壁五排少一人，子辰邀你補位。</p><button class="reply encounter" data-e="join">加入他們</button>${closeBtn()}`);document.querySelectorAll(".encounter").forEach(b=>b.onclick=()=>resolveArcade(b.dataset.e));return}
 if(context==="mall"&&!state.eventFlags.mallRain){state.eventFlags.mallRain=true;state.characters.林雨晴.known=true;state.player.relations.林雨晴=Math.max(state.player.relations.林雨晴,6);state.logs.push("生活事件：在國內商場偶遇同班同學林雨晴。");save();render();return}
 const t={cafe:"休息後壓力稍微下降。",restaurant:"吃了一頓不錯的飯。",gym:"活動筋骨，狀態稍微改善。",cinema:"看電影放鬆心情。",nightmarket:"在人群中放鬆了一晚。",store:"買了些生活用品。",book:"翻閱職業選手訪談。"}[context]||"今天沒有特別事件。";if(context==="cafe")state.player.stress=clamp(state.player.stress-3,0,100);state.logs.push("生活事件："+t);save();render();modal(`<h2>生活事件</h2><p>${t}</p>${closeBtn()}`)
}
function adultEstablishedPartnerEvent(name){
 const p=state.player,c=state.characters?.[name];
 try{
  if(!c){modal(`<h2>❤️ 親密相處</h2><p>找不到 ${name} 的人物資料，請重新進入社交頁。</p>${closeBtn()}`);return}
  const spouse=p.romance?.spouse===name;
  const relType=String(c.relationshipType||"");
  const partner=(p.romance?.partners||[]).includes(name)||["女友","戀人","地下戀人","地下戀情","未婚妻"].includes(relType);
  const knownAge=Number.isFinite(Number(c.age))?Number(c.age):(Number.isFinite(Number(c.birthYear))?state.date.year-Number(c.birthYear):null);
  if(p.age<18||knownAge!==null&&knownAge<18){modal(`<h2>❤️ 親密相處</h2><p>目前無法進行這項成人互動。</p>${closeBtn()}`);return}
  if(!spouse&&!partner){modal(`<h2>❤️ 親密相處</h2><p>${name} 目前不是你的正式伴侶或地下戀人。</p>${closeBtn()}`);return}
  if(knownAge===null)c.age=Math.max(18,p.age||18);
  // 舊存檔若只留下「地下戀人／女友」標籤，先補回伴侶陣列，避免按鈕有顯示但事件被跳過。
  p.romance=p.romance||{};p.romance.partners=p.romance.partners||[];
  if(!spouse&&!p.romance.partners.includes(name))p.romance.partners.push(name);
  adultPrivateEvent(name,spouse?"spouse":"partner");
 }catch(err){
  console.error("adultEstablishedPartnerEvent",name,err);
  modal(`<h2>❤️ 親密相處</h2><p>這次互動遇到舊存檔資料異常，系統已保留人物關係。請關閉視窗後再試一次。</p><div class="small">${String(err?.message||err)}</div>${closeBtn()}`);
 }
}
function attemptConsensualPrivateEvent(name,kind="social"){
 const p=state.player,c=state.characters?.[name];
 if(!c){modal(`<h2>🌙 私人約會</h2><p>人物資料異常，請重新進入社交頁再試。</p>${closeBtn()}`);return}
 if(p.age<18||Number(c.age||18)<18||c.gender!=="女"){modal(`<h2>🌙 私人約會</h2><p>目前無法進行這項互動。</p>${closeBtn()}`);return}
 if(remain()<1){modal(`<h2>🌙 私人約會</h2><p>今天已經沒有剩餘時段。</p>${closeBtn()}`);return}

 // 隊友女友仍有額外的拒絕與被隊友發現風險。
 if(c.teammatePartnerOf){
   const special=teammatePartnerRisk(name);
   if(special===false)return;
 }

 // 第一步直接判定是否接受；拒絕一定顯示結果。
 const consent=Math.random()<clamp(.48+(p.relations[name]||20)*.004+(p.mood-50)*.002,.35,.82);
 if(!consent){
   c.adultBoundary=c.adultBoundary||{};
   c.adultBoundary.lastRefusalStamp=state.date.year*60+state.date.week;
   c.adultBoundary.refusalSource=kind;
   state.logs.push(`🌙 私人約會：${name} 拒絕了邀請。`);
   save();
   modal(`<h2>🌙 私人約會結果</h2><p><strong>${name}</strong> 拒絕了你的邀請。</p>${closeBtn()}`);
   return;
 }

 // 接受後才消耗時段；不再呼叫 adultPrivateEvent，避免 render/modal 被覆蓋。
 if(!consume("私人約會",1)){
   modal(`<h2>🌙 私人約會</h2><p>目前無法安排這次約會。</p>${closeBtn()}`);
   return;
 }

 let cost=0;
 if(name==="許安然"){
   cost=3000;
   if(p.cash<cost){
     // 還原剛才消耗的時段，避免沒錢卻吃掉行動。
     state.dayState.usedSlots=Math.max(0,(state.dayState.usedSlots||0)-1);
     state.dayState.actions?.pop();
     modal(`<h2>🌙 私人約會</h2><p>這次見面需要 NT$${cost.toLocaleString()}，目前現金不足。</p>${closeBtn()}`);
     return;
   }
   p.cash-=cost;
 }

 // 成人私人事件的既有狀態影響。
 try{stiRiskEvent(name,kind==="fan"?"一次性關係":"私人關係")}catch(e){console.warn("stiRiskEvent",e)}
 p.energy=clamp(p.energy-15,0,100);
 p.mood=clamp(p.mood+5,0,100);
 p.condition=p.condition||{};
 p.condition.privateRecent=(p.condition.privateRecent||0)+1;
 p.condition.fatigue=clamp((p.condition.fatigue||0)+8,0,100);
 p.relations[name]=clamp((p.relations[name]||40)+2,0,100);

 if(p.romance?.spouse&&name!==p.romance.spouse){
   try{registerAffair(name)}catch(e){console.warn("registerAffair",e)}
 }

 if(p.condition.privateRecent>=5){
   changeCompetitiveForm(-2,"短期內私人行程過度密集造成疲勞");
   if(Math.random()<.18&&!p.condition.injury){
     p.condition.injury={type:["腰背疲勞","肩頸不適","睡眠不足"][rand(0,2)],severity:"輕微",days:rand(2,5)};
   }
 }

 // 直接在這裡建立懷孕事件，並立刻把結果告知玩家。
 let pregnancyRisk=false;
 if(c.gender==="女"&&Math.random()<.08){
   p.adultLife=p.adultLife||{};
   p.adultLife.pregnancies=p.adultLife.pregnancies||[];
   const already=p.adultLife.pregnancies.some(pg=>pg.name===name&&!pg.born&&pg.status!=="已結束");
   if(!already){
     pregnancyRisk=true;
     p.adultLife.pregnancies.push({
       name,
       week:state.date.week,
       year:state.date.year,
       progressWeeks:0,
       status:"可能懷孕",
       birthPending:false,
       source:"私人約會"
     });
     state.logs.push(`🤰 私人約會後，${name} 出現懷孕可能，需要後續確認。`);
   }
 }

 let text=pregnancyRisk
   ?`你和 <strong>${name}</strong> 度過了一段私人時光。之後她告訴你，<strong>可能懷孕了</strong>。`
   :`你和 <strong>${name}</strong> 度過了一段私人時光。`;

 state.logs.push(`🌙 私人約會：${name}${pregnancyRisk?"，並出現懷孕可能":"，度過了一段私人時光"}。`);

 if(Math.random()<.12){
   p.prCrisis={type:"私人關係曝光",severity:rand(1,3),source:name};
   state.logs.push("⚠️ 私人關係被外界注意，可能形成公關危機。");
 }

 // 關鍵：先 save/render，最後才開結果視窗，之後不再呼叫 render。
 save();
 render();
 modal(`<h2>🌙 私人約會結果</h2><p>${text}</p>${cost?`<div class="notice">本次花費 NT$${cost.toLocaleString()}。</div>`:""}${closeBtn()}`);
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
  duoInvite:[["yes","接受邀約"],["no","婉拒邀約"]],
  socialInvite:[["yes","接受邀約"],["no","婉拒邀約"]],
  socialVisit:[["yes","好，這幾天見面"],["no","這次先不要"]],
  private:[["yes","接受私人邀約"],["no","婉拒私人邀約"]],
  poach:[["interest","有興趣，進入正式轉會程序"],["decline","婉拒挖角"]],
  poachContract:[["accept","接受合約並完成轉會"],["demands","先談附加條件"],["decline","拒絕這份合約"]],
  teamInvite:[
   ["join","好，我們組隊報名。"],["ask","先問比賽時間跟隊友。"],["decline","最近沒辦法參加。"]
  ]
 };
 if(!m.resolved&&replySets[m.type]){
  modal(`<h2>${m.from}</h2><p style="white-space:pre-line">${m.text}</p><div class="reply-grid">${replySets[m.type].map(x=>`<button type="button" class="reply msg-reply" data-r="${x[0]}">${x[1]}</button>`).join("")}</div>${closeBtn()}`);
  document.querySelectorAll(".msg-reply").forEach(b=>b.onclick=()=>resolveMessage(m,b.dataset.r));
 }else if(!m.replied){
  const generic=[["ok","收到，我知道了。"],["talk","好，晚點再聊。"],["thanks","謝謝你告訴我。"]];
  modal(`<h2>${m.from}</h2><p style="white-space:pre-line">${m.text}</p><div class="reply-grid">${generic.map(x=>`<button type="button" class="reply msg-generic-reply" data-r="${x[0]}">${x[1]}</button>`).join("")}</div>${closeBtn()}`);
  document.querySelectorAll(".msg-generic-reply").forEach(b=>b.onclick=()=>resolveGenericMessage(m,b.dataset.r));
 }else modal(`<h2>${m.from}</h2><p style="white-space:pre-line">${m.text}</p><div class="small">你已回覆這則訊息。</div>${closeBtn()}`);
 render();
}
function resolveGenericMessage(m,r){
 const p=state.player;
 const text=r==="talk"?"好，晚點再聊。":r==="thanks"?"謝謝你告訴我。":"收到，我知道了。";
 m.replied=true;m.replyText=text;m.resolved=true;
 if(state.characters?.[m.from]||p.relations?.[m.from]!=null){
   p.relations[m.from]=clamp((p.relations[m.from]||0)+(r==="thanks"?.5:.2),0,100);
 }
 state.logs.push(`📱 你回覆 ${m.from}：「${text}」`);
 save();document.querySelector(".modal-backdrop")?.remove();render();
}
function resolveMessage(m,r){
 if(m.type==="duoInvite"){
  if(r==="yes"){addPlan(state.date.day,{id:"duo-"+state.date.week+"-"+state.date.day,title:"與阿哲雙排",slot:"晚間",type:"duoAppointment",lockDay:false,completed:false,desc:"你已經答應阿哲，別忘記上線。"});state.player.relations.阿哲=clamp((state.player.relations.阿哲||0)+1,0,100);state.messages.push({id:"duo-ok-"+Date.now(),from:"阿哲",text:"好，那九點上線！",unread:true,resolved:true,type:"normal"});state.logs.push("約定已加入行程：晚間與阿哲雙排。")}
  if(r==="no"){state.player.relations.阿哲=clamp((state.player.relations.阿哲||0)-.5,0,100);state.messages.push({id:"duo-no-"+Date.now(),from:"阿哲",text:"OK，下次再約。",unread:true,resolved:true,type:"normal"})}
  if(r==="later"){state.messages.push({id:"duo-later-"+Date.now(),from:"阿哲",text:"行，有空再敲我。",unread:true,resolved:true,type:"normal"})}
 }
 if(m.type==="socialInvite"||m.type==="private"){
  const person=m.from,remote=m.type==="socialInvite"&&isRemoteInviteLabel(m.inviteLabel);
  if(r==="yes"){
    if(remain()<1){modal(`<h2>行程已滿</h2><p>接受邀約需要1格生活時段。</p>${closeBtn()}`);return}
    // 手機聊天、視訊、Rank 等遠端邀約不受所在地限制；只有實體赴約才檢查所在地。
    if(!remote&&!socialLocationAvailable(person)){modal(`<h2>📍 目前無法赴約</h2><p>${person} 與你不在同一地區。</p><p class="small">聊天／視訊等遠端邀約不受地區限制。</p>${closeBtn()}`);return}
    if(!consume(`接受${person}邀約`,1))return;
    state.player.relations[person]=clamp((state.player.relations[person]||0)+(m.type==="private"?4:2),0,100);
    state.logs.push(remote?`📱 接受 ${person} 的${m.inviteLabel||"聊天"}，你們透過手機／網路完成互動，不受所在地限制。`:`📱 接受 ${person} 的${m.inviteLabel||"邀約"}，已占用1格生活時段並完成赴約。`);
    if(m.type==="private")state.logs.push(`🌙 與 ${person} 度過私人約會時光。`)
  }else{state.player.relations[person]=clamp((state.player.relations[person]||0)-rand(1,3),0,100);state.logs.push(`📱 婉拒 ${person} 的${m.inviteLabel||"邀約"}，關係小幅下降。`)}
  m.resolved=true;m.replied=true;save();document.querySelector('.modal-backdrop')?.remove();render();return;
 }
 if(m.type==="socialVisit"){
  const person=m.from,c=state.characters?.[person];
  if(r==="yes"){
    if(c?.currentVisit){c.currentCountry=c.currentVisit.country;c.currentCity=c.currentVisit.city;c.currentTravelReason="主動來找夜鋒";}
    state.player.relations[person]=clamp((state.player.relations[person]||0)+1,0,100);
    state.logs.push(`✈️ 你答應 ${person} 這幾天見面；對方目前停留在你所在城市，可從社交頁安排活動。`);
  }else{
    if(c){delete c.currentVisit;c.currentCountry=c.homeCountry;c.currentCity=c.homeCity;delete c.currentTravelReason;}
    state.logs.push(`📱 你婉拒了 ${person} 這次來訪的見面邀請。`);
  }
  m.resolved=true;m.replied=true;m.replyText=r==="yes"?"好，這幾天見面。":"這次先不要。";
  save();document.querySelector('.modal-backdrop')?.remove();render();return;
 }
 if(m.type==="poach"){
  resolvePoachMessage(m,r);return;
 }
 if(m.type==="poachContract"){
  resolvePoachContractMessage(m,r);return;
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
 const proDue=ensureMandatoryProMatchToday();
 if(proDue&&substituteMatchIfOnLeave()){save();render();return}
 if(proDue){modal(`<h2>🏆 正式比賽尚未完成</h2><p>${proScheduleDayLabel(proDue)} 對 <strong>${proDue.opp}</strong> 的 BO${proDue.bo} 是指定賽程。即使今天5個一般活動時段都已使用完，正式比賽仍然可以進行；完成後才能進入下一天。</p><button id="goScheduledProMatch" class="btn primary">立即前往比賽</button>${closeBtn()}`);document.querySelector("#goScheduledProMatch")?.addEventListener("click",()=>{document.querySelector(".modal-backdrop")?.remove();proMatchHub()});return}

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
     state.logs.push(isProfessionalStage()?`🎆 ${oldYear}賽季年度結束，時間進入 ${state.date.year} 年。`:`🎆 ${oldYear}學年度結束，時間進入 ${state.date.year} 學年度。`);
   }
   state.date.month=isProfessionalStage()?careerMonthFromWeek(state.date.week):monthFromWeek(state.date.week);
   state.weeklyPlan={};if(!isProfessionalStage()){state.player.cash+=750;state.logs.push(`第${finishedWeek}週結束：上週行程已歸檔，零用錢入帳 NT$750。`)}else{state.logs.push(`第${finishedWeek}週結束：職業週行程已歸檔。`);try{professionalWeeklyTick()}catch(err){state.logs.push(`⚠️ 週結算相容修復：${err?.message||err}`)}}
   syncCalendarFields();
 }
 scriptedEvents();
 professionalDailyTick();
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
 {id:"phone",name:"新手機",price:24900,desc:"高額生活消費；直播與社交設備收藏",once:true},
 {id:"pc",name:"旗艦電競主機",price:78000,desc:"職業級設備收藏；訓練環境提升",once:true},
 {id:"watch",name:"精品腕錶",price:125000,desc:"明星形象與收藏",once:true},
 {id:"sofa",name:"高階居家設備",price:56000,desc:"改善休息品質",once:true,effect:p=>p.mood=clamp(p.mood+8,0,100)},
 {id:"designer",name:"設計師服飾",price:38000,desc:"明星公開活動穿搭",effect:p=>p.mood=clamp(p.mood+5,0,100)}
];
const LADDER_NAMES=["Raven","Luna","Kaito","Zero9","Mori","Nox","Aster","Haku","ViperX","Nagi","Frost","Mika","Rex","Nova","Sena","Crow","Yuzu","Kairos","Melo","Tide"];

function migrateProV1962(){const p=state.player;if(p.v1963CompetitionFixed)return;if(isProfessionalStage()){const pc=p.proCareer,sn=pc.season;if(sn?.seasonName==="春季"&&sn.playoffs)archiveCurrentPlayerPlayoff();const it=ensureInternationalWorld();if(it.msi){it.msi.groups=[];it.msi.qualifiers=[];it.msi.qualified=false;it.msi.stage="尚未開始"}if(proAnnualPhase()==="MSI")buildInternationalTournament("MSI");state.logs.push("🔧 V1.9.6.3：修正季後賽硬月份、MSI資格與重複分組；新增季後賽對戰表與國際賽主辦地輪換。") }p.v1963CompetitionFixed=true}

function migrateProV1964(){const p=state.player;if(p.v1964RosterTacticsFixed)return;if(isProfessionalStage()){const pc=ensureCareer20();for(const t of pc.managementTasks||[]){if(t.type==="補強"&&t.status==="完成"&&!t.signedPlayer&&/鎖定|合約|註冊|補強方案/.test(t.note||"")){t.status="待修復";t.note="舊版任務只有完成標記、沒有實際球員；已重新進入球探／簽約流程";t.age=0}}ensureRosterSubstitutes();Object.keys(TACTIC_DEFS).forEach(k=>{if(!Number.isFinite(pc.tactics.mastery[k]))pc.tactics.mastery[k]=40+stableAgeOffset((pc.team||"")+k,16)});state.logs.push("🔧 V1.9.6.4：修復補強完成卻未寫入Roster；擴充18套教練戰術體系與執行方案。")}p.v1964RosterTacticsFixed=true}
function migrateProV1965(){const p=state.player;if(!isProfessionalStage())return;const pc=ensureCareer20();ensureProRoster();for(const t of pc.managementTasks||[]){if(t.type!=="補強")continue;const actual=t.signedPlayer&&(pc.roster||[]).some(x=>x.name===t.signedPlayer);if(t.status==="完成"&&!actual){t.status="待修復";t.signedPlayer=null;t.note="舊任務沒有實際球員進入Roster，已重新啟動簽約流程";t.age=1}if(t.status==="待修復"&&t.age>1)t.age=1}ensureRosterContracts();if(!p.v1965RosterContractFixed){state.logs.push("🔧 V1.9.6.5：補強完成必須實際寫入Roster；戰術熟練改由Scrim成長；新增隊友合約期限與轉會窗到期規則。");p.v1965RosterContractFixed=true}}
function syncCanonicalPartnerLinks1972(){
 const p=state.player,chars=state.characters||{};
 const links=["智雅","林映辰"];
 links.forEach(name=>{
   const c=chars[name];if(!c)return;
   c.gender="女";c.romanceable=true;
   if(!Number.isFinite(Number(c.age))&&p.age>=18)c.age=Math.max(18,p.age);
   c.partnerName="程以安";c.romanticPartner="程以安";c.identityType="程以安的女友";
   // 她們與夜鋒同時交往時，對夜鋒必須顯示為地下戀情。
   if((p.romance?.partners||[]).includes(name)){c.relationshipType="地下戀人";c.secretRomanceRisk=Math.max(10,Number(c.secretRomanceRisk||0));}
 });
 const cheng=chars["程以安"];if(cheng){cheng.partnerNames=[...new Set([...(cheng.partnerNames||[]),...links.filter(n=>chars[n])])];}
}
function ensureV10(){migrateProV1962();migrateProV1964();migrateProV1965();(state.player.proFriends||[]).forEach(n=>ensureProCharacter(n));Object.keys(state.characters||{}).filter(n=>state.characters[n]?.isPro).forEach(n=>ensureProCharacter(n));
 const previousVersion=state?.version||"";
 state=normalize(state);
 const p=state.player;
 ensureFixedMidExpansionHeroes();
 ensureSavedAnnualHeroes();
 repairFlexibleAcquaintanceRoles();
 dedupePregnancies();ensureLegacyChildSystem();ensurePregnancyEventIds();repairDuePregnancyProgress();(state.player.adultLife?.pregnancies||[]).forEach(pg=>{if(!pg.born&&(pg.progressWeeks||0)>=40){pg.birthPending=true;pg.status="即將生產"}});
 if(!p.adultLife||typeof p.adultLife!=="object")p.adultLife={enabled:p.age>=18,pregnancies:[],fanIncidents:0,publicRomanceKnown:false,careerReputation:50,graduationPath:null};
 p.adultLife.enabled=p.age>=18;
 if(!p.proCareer||typeof p.proCareer!=="object")p.proCareer={stage:p.adultLife.graduationPath==="職業圈"?"scouting":"amateur",team:null,contract:null,tryout:null,coachTrust:50,season:null};
 if(!p.condition||typeof p.condition!=="object")p.condition={form:65,fatigue:0,injury:null,privateRecent:0};
 p.condition.form=clamp(Number(p.condition.form)||65,0,100);p.condition.fatigue=clamp(Number(p.condition.fatigue)||0,0,100);p.condition.privateRecent=Number(p.condition.privateRecent)||0;
if(p.age>=18&&state.characters?.["許安然"]){state.characters["許安然"].desc="成年後與夜鋒維持非戀愛、彼此同意的固定成人關係。";state.characters["許安然"].relationshipType="炮友";}
 if(!p.team||typeof p.team!=="object")p.team={name:"",members:[],formed:false,trainingCount:0};p.team.members=Array.isArray(p.team.members)?p.team.members:[];
 if(!Array.isArray(p.inventory))p.inventory=[];
 if(p.reputation==null)p.reputation=5;
 if(p.reputation===50 && (!state.world?.amateurHistory || state.world.amateurHistory.length<3))p.reputation=5;
 if(!p.romance||typeof p.romance!=="object")p.romance={partner:null,trust:{},jealousy:{},rumorRisk:0};
 if(!Array.isArray(p.romance.partners))p.romance.partners=p.romance.partner?[p.romance.partner]:[];
 p.romance.partners=[...new Set(p.romance.partners.filter(Boolean))];
 p.romance.partner=p.romance.partners[0]||null;
 syncCanonicalPartnerLinks1972();
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

 migrateProV160();
 migrateProV1601();
 migrateProV1602();
 migrateProV1603();
 migrateProV171();
 migrateProV180();
 migrateProV181();
 migrateProV182();
 migrateProV184();
 migrateProV185();
 migrateProV186();
 previewSocialIdentityFix();
 migrateProV187();
 migrateProV188();
 migrateProV189();
 migrateProV1891();
 migrateProV1892();
 migrateProV1893();
 migrateProV1894();
 migrateProV1895();
 migrateProV1896();
 migrateProV1897();
 migrateProV1898();
 migrateProV1899();
 migrateProV1900();
 migrateProV1901();
 migrateProV1902();
 migrateProV1903();
 migrateProV1904();
 migrateProV1905();
 migrateProV1906();
 migrateProV1907();
 migrateProV1908();
 migrateProV1909();
 migrateProV1910();
 migrateProV1911();
 migrateProV1912();
 migrateProV1913();
 migrateProV1914();
 migrateProV1915();
 migrateProV1916();
 migrateProV1917();
 migrateProV1918();
 migrateProV1919();
 migrateProV1921();
 migrateProV1922();
 migrateProV1926();migrateProV1928();migrateProV1924();migrateProV1923();
 migrateProV183();
 if(!p.v170Migrated){
   if(isProfessionalStage()){
    p.proCareer.lockerRoom=p.proCareer.lockerRoom||65;ensureProEconomy();ensureMeta();ensurePublicImage();cleanupUnnamedFriends();migrateProV1941();migrateProV1951AgeRepair();migrateProV1952AgeTimelineRepair();syncCanonicalAges();
    state.world.tournaments=[];state.tournament=null;Object.keys(state.weeklyPlan||{}).forEach(d=>state.weeklyPlan[d]=(state.weeklyPlan[d]||[]).filter(e=>e.type!=="amateurTournament"&&e.type!=="tournament"));
    if(p.proCareer.contract)completeContract(p.proCareer.contract);
    state.logs.push("🆕 V1.7.0：職業生活切換為每日5格，業餘杯賽關閉；合約、薪資補發、版本Meta、Scrim、贊助與公關系統啟用。");
   }
   p.v170Migrated=true;
 }
 // V1.9.5.3: age repair must run for every loaded save.
 // Older professional saves already have v170Migrated=true, so nesting this repair inside the V1.7 migration made it unreachable.
 migrateProV1952AgeTimelineRepair();
 syncCalendarFields();
 syncCanonicalAges();
 migrateProV1930();
 migrateProV1932();
 migrateProV1933();
 migrateProV1935();migrateProV1934();migrateProV1936();migrateProV1937();migrateProV1938();
}
function isProFriend(name){return !!confirmedProfessionalRecord(name)}
function ensureProCharacter(name){
 if(!name)return null;
 const profiles={"Eclipse.Raven":{role:"中路",rank:"菁英",lp:1180},"KNG.Nox":{role:"打野",rank:"菁英",lp:1040},"Vortex.Luna":{role:"ADC",rank:"菁英",lp:1120},"Astra.Zero9":{role:"上路",rank:"菁英",lp:980},"Nova.Mori":{role:"輔助",rank:"菁英",lp:930},"Titan.Haku":{role:"打野",rank:"菁英",lp:1010}},pf=profiles[name]||{role:"中路",rank:"宗師",lp:650};
 if(!state.characters[name])state.characters[name]={name,known:true,gender:"男",romanceable:false,role:pf.role,rank:pf.rank,lp:pf.lp,desc:"在高分Rank認識的職業選手。",traits:["努力","好勝"]};
 const c=state.characters[name];c.known=true;c.isPro=true;
 if(!["上路","打野","中路","ADC","輔助"].includes(normalizeRole(c.role)))c.role=pf.role;
 if(!["宗師","菁英"].includes(c.rank))c.rank=pf.rank;
 c.lp=Math.max(Number(c.lp)||0,pf.rank==="菁英"?850:500);
 if(state.player.relations[name]==null)state.player.relations[name]=20;
 return c;
}
function esportsRole(name){
 const roles={"阿哲":"ADC","子辰":"打野","Kaito":"輔助","俊凱":"上路","小宇":"ADC","陳語彤":"ADC","承翰":"上路"};
 return state.friends?.[name]?.role||state.characters?.[name]?.role||roles[name]||null;
}
function isEsportsFriend(name){return !!esportsRole(name)}
const STORY_SOCIAL_IDENTITIES={
 "林雨晴":{identityType:"一般人",source:"高中同班同學",playsGame:false,isPro:false},
 "小宇":{identityType:"業餘玩家",source:"學生時期朋友",playsGame:true,gameRole:"ADC",isPro:false},
 "陳語彤":{identityType:"業餘玩家",source:"學生時期五排認識",playsGame:true,gameRole:"ADC",isPro:false},
 "沈若晴":{identityType:"一般人",source:"高中學姊",playsGame:false,isPro:false},
 "許安然":{identityType:"一般人",source:"國中同學",special:"初戀",playsGame:false,isPro:false},
 "承翰":{identityType:"業餘玩家",source:"學生時期朋友",playsGame:true,gameRole:"上路",isPro:false}
};
function applyStoryIdentityFixes(){
 Object.entries(STORY_SOCIAL_IDENTITIES).forEach(([name,x])=>{
   const c=state.characters?.[name];if(!c)return;
   c.isPro=false;delete c.team;delete c.region;c.identityType=x.identityType;c.acquaintanceSource=x.source;
   if(x.special)c.specialRelation=x.special;
   if(x.playsGame){c.playsGame=true;c.role=x.gameRole}
   else{c.playsGame=false;if(["上路","打野","中路","ADC","輔助","射手"].includes(c.role))delete c.role}
   if(name==="林雨晴")c.desc="高中同班同學，沒有玩競技遊戲。";
   if(name==="沈若晴")c.desc="高中學姊，沒有打電競。";
   if(name==="許安然"){c.desc="國中同學，也是夜鋒的初戀。";c.relationshipType=c.relationshipType||"初戀";}
 });
}
function confirmedProfessionalRecord(name){
 const pc=state.player.proCareer||{};
 const roster=(pc.roster||[]).find(x=>x.name===name&&!x.isPlayer);if(roster)return {team:pc.team,role:roster.role,type:"隊友"};
 for(const [team,names] of Object.entries(PRO_ROSTER_NAMES||{})){const i=names.indexOf(name);if(i>=0)return {team,role:["上路","打野","中路","ADC","輔助"][i],type:team===pc.team?"隊友":"職業選手"}}
 const db=pc.proDatabase||{};
 for(const [region,teams] of Object.entries(db))for(const [team,roster2] of Object.entries(teams||{})){const x=(roster2||[]).find(v=>v.name===name&&v.active!==false&&!v.retired);if(x)return {team,region,role:x.role,type:"職業選手"}}
 return null;
}
function inferAcquaintanceSource(c){
 if(!c)return "未記錄";
 if(c.acquaintanceSource)return c.acquaintanceSource;
 const t=`${c.role||""} ${c.desc||""}`;
 if(/粉絲|直播/.test(t))return "粉絲／直播活動";
 if(/酒吧/.test(t))return "酒吧";
 if(/旅行/.test(t))return "私人旅行";
 if(/國際賽|MSI|世界賽|海外活動/.test(t))return "國際賽／海外活動";
 if(/Rank|高分/.test(t))return "Rank";
 if(/同班/.test(t))return "高中同班同學";
 if(/國中/.test(t))return "國中同學";
 if(/學姊/.test(t))return "高中學姊";
 if(/比賽|對手/.test(t))return "正式比賽";
 if(/隊友/.test(t))return "戰隊";
 return "遊戲／社交活動";
}
function identityTypeFor(name){
 const c=state.characters?.[name],story=STORY_SOCIAL_IDENTITIES[name],pro=confirmedProfessionalRecord(name),pc=state.player.proCareer||{};
 if(story)return story.identityType;
 if((pc.coaches||[]).some(x=>x.name===name))return "教練";
 if(pro)return pro.type==="隊友"?"職業選手／隊友":"職業選手";
 const t=`${c?.role||""} ${c?.desc||""}`;
 if(/粉絲|直播/.test(t))return "女粉絲";
 if(/媒體|記者/.test(t))return "媒體";
 if(/翻譯|工作人員/.test(t))return "工作人員";
 if(c?.career||c?.occupation)return c.career||c.occupation;
 if(c?.playsGame||["上路","打野","中路","ADC","輔助"].includes(normalizeRole(c?.role)))return "業餘玩家";
 return "一般人";
}
function spouseHasFinalDivorceSignal(name){
 const p=state.player,m=p.romance?.marriage;if(!name||!m)return false;
 if((m.divorced||[]).some(x=>x?.name===name))return true;
 const c=state.characters?.[name];
 if(c?.formerSpouse||c?.divorced)return true;
 const crisis=m.crisis;
 if(crisis&&p.romance?.spouse===name){
   const text=`${crisis.type||""} ${crisis.stage||""} ${crisis.status||""} ${crisis.decision||""}`;
   if(/提出離婚|要求離婚|決定離婚|正式離婚|離婚成立|婚姻終止/.test(text))return true;
 }
 // Legacy saves sometimes stored the spouse's final divorce decision only in message/log text.
 const evidence=[
   ...(state.messages||[]).filter(x=>x?.from===name).slice(-12).map(x=>x.text||""),
   ...(state.logs||[]).slice(-80)
 ].join("\n");
 return new RegExp(`${name}.{0,24}(提出離婚|要求離婚|決定離婚|正式離婚|婚姻終止)|(提出離婚|要求離婚|決定離婚).{0,24}${name}`).test(evidence);
}
function finalizeFormerSpouseState(name,reason="對方已提出並決定離婚"){
 const p=state.player;if(!name)return false;
 const m=ensureMarriageState();m.divorced=m.divorced||[];
 if(!m.divorced.some(x=>x?.name===name))m.divorced.push({name,year:state.date.year,week:state.date.week,reason});
 const c=state.characters?.[name];
 if(c){c.formerSpouse=true;c.formerPartner=true;c.divorced=true;c.identityType="前妻";c.specialRelation="前妻";if(["老婆","妻子","戀人","伴侶"].includes(c.relationshipType))c.relationshipType=null}
 p.romance.partners=(p.romance.partners||[]).filter(n=>n!==name);
 if(p.romance.partner===name)p.romance.partner=p.romance.partners[0]||null;
 if(p.romance.spouse===name)p.romance.spouse=null;
 if(m.crisis&&spouseHasFinalDivorceSignal(name))m.crisis=null;
 return true;
}
function normalizeFormerSpouseSocialState(){
 const p=state.player;if(!p?.romance)return;
 const m=ensureMarriageState();m.divorced=m.divorced||[];
 const spouse=p.romance.spouse;
 if(spouse&&spouseHasFinalDivorceSignal(spouse))finalizeFormerSpouseState(spouse,"舊存檔：配偶已提出／決定離婚");
 (m.divorced||[]).map(x=>x?.name).filter(Boolean).forEach(name=>{if(p.romance.spouse===name||(p.romance.partners||[]).includes(name))return;finalizeFormerSpouseState(name,xReasonForFormerSpouse(name))});
}
function xReasonForFormerSpouse(name){
 const m=state.player?.romance?.marriage;
 return (m?.divorced||[]).find(x=>x?.name===name)?.reason||"已離婚";
}
function isActiveEnemy19781(name){
 const pc=state.player?.proCareer||{},rupt=pc.teamRuptures?.[name],legacy=pc.legacy?.enemies?.[name];
 return !!legacy||!!(rupt&&(rupt.severity||0)>=4&&["決裂","嚴重衝突","冷戰共存","隊友待轉隊","隊友可能解約","夜鋒被轉隊","夜鋒可能解約"].includes(rupt.status));
}
function currentRelationshipLabel(name){
 normalizeFormerSpouseSocialState();
 const p=state.player,c=state.characters?.[name],rel=p.relations?.[name]||0;
 if(p.name===name)return "本人";
 if(p.romance?.spouse===name)return "老婆";
 if((p.romance?.partners||[]).includes(name))return (c?.teammatePartnerOf||c?.partnerName||c?.romanticPartner)?"地下戀情":(c?.formerSpouse||c?.specialRelation?.includes("前妻")?"復合戀人":"戀人");
 if((p.romance?.marriage?.divorced||[]).some(x=>x.name===name)||c?.formerSpouse)return "前妻";
 if((p.romance?.partners||[]).includes(name))return c?.teammatePartnerOf?"地下戀情":"戀人";
 if(c?.relationshipType==="炮友")return "固定關係";
 if(c?.formerPartner)return "前任";
 if(isActiveEnemy19781(name))return "仇人";
 if(c?.isRival)return "對手／宿敵";
 return relationTier(rel,name);
}
function socialIdentity(name){
 normalizeFormerSpouseSocialState();
 const c=state.characters?.[name],story=STORY_SOCIAL_IDENTITIES[name],pro=confirmedProfessionalRecord(name),type=identityTypeFor(name),pc=state.player.proCareer||{};
 if((state.player?.romance?.marriage?.divorced||[]).some(x=>x.name===name)||c?.formerSpouse)return "前妻";
 const currentCoach=(pc.coaches||[]).find(x=>x.name===name);if(currentCoach)return `${pc.team}｜${currentCoach.role}`;
 if(c?.formerTeam&&c?.isProStaff)return `前 ${c.formerTeam}｜${c.formerRole||c.role||"教練"}`;
 // Dynamic social identities must follow the live world state, not stale identityType fields.
 if(c?.teammatePartnerOf)return `${c.teammatePartnerOf}的女友`;
 if(c?.partnerName){const partner=state.characters?.[c.partnerName];const label=c.gender==="女"?"女友":c.gender==="男"?"男友":"交往對象";return `${c.partnerName}的${label}${type&&type!=="一般人"?`｜${type}`:""}`}
 if(pro){const currentRoster=(pc.roster||[]).some(x=>x?.name===name);const former=!!c?.formerTeammate&&!currentRoster;return `${pro.team}｜${pro.role}｜${former?"前隊友":pro.type}`;}
 if(c?.formerTeammate)return `${c.currentTeam||c.team||"職業圈"}｜${c.role||"選手"}｜前隊友`;
 if(type==="業餘玩家"){const r=normalizeRole(c?.role||story?.gameRole);return `${type}${r?`｜${r}`:""}`}
 return type;
}
function socialProfileMeta(name){
 normalizeFormerSpouseSocialState();
 const c=state.characters?.[name],story=STORY_SOCIAL_IDENTITIES[name];
 const active=state.player?.romance?.spouse===name||(state.player?.romance?.partners||[]).includes(name),ex=!active&&((state.player?.romance?.marriage?.divorced||[]).some(x=>x.name===name)||c?.formerSpouse);
 return {identity:ex?"前妻":socialIdentity(name),source:story?.source||inferAcquaintanceSource(c),relationship:ex?"前妻":currentRelationshipLabel(name),special:active&&((state.player?.romance?.marriage?.divorced||[]).some(x=>x.name===name)||c?.specialRelation?.includes("前妻"))?"曾為前妻・已復合":ex?"前妻":(story?.special||c?.specialRelation||"")};
}
function relationTier(v,name){
 const c=state.characters?.[name];
 if((state.player?.romance?.marriage?.divorced||[]).some(x=>x.name===name)||c?.formerSpouse)return "前妻";
 if(state.player?.romance?.spouse===name)return "老婆";
 if(isActiveEnemy19781(name))return "仇人";
 const romanceable=!!(c&&c.romanceable&&c.gender==="女");
 const tiers=romanceable?RELATION_TIERS:[
  {min:0,name:"陌生"},{min:20,name:"認識"},{min:40,name:"朋友"},{min:60,name:"好友"},{min:75,name:"摯友"},{min:88,name:"死黨"}
 ];
 let t=tiers[0];tiers.forEach(x=>{if(v>=x.min)t=x});return t.name
}
function eliteCutoffLP(){return state.world?.eliteCutoff||820}
function resetRankForNewSeason(year){
 const p=state.player;if(p.lastRankResetYear===year)return;const prevRank=p.rank,prevLp=p.lp||0;let startRank="鑽石 I",startLp=0;
 if(["菁英","宗師"].includes(prevRank)){startRank="大師";startLp=120}else if(prevRank==="大師"){startRank="鑽石 I";startLp=50}else if(String(prevRank).startsWith("鑽石")){startRank="鑽石 II";startLp=20}
 p.rank=startRank;p.lp=startLp;p.lastRankResetYear=year;state.world.playerEliteRank=null;state.world.leaderboard=[];state.world.eliteCutoff=820;state.world.rankSeasonYear=year;state.world.newsWeek=null;
 Object.values(state.characters||{}).forEach(c=>{if(c.isPro||c.playsGame){if(c.rank==="菁英")c.rank="大師";if(Number.isFinite(c.lp))c.lp=rand(40,260)}});
 state.logs.push(`🔄 ${year} Rank新賽季：積分與排行榜重新計算。夜鋒由 ${prevRank} ${prevLp} LP 重置為 ${startRank} ${startLp} LP。`);refreshLeaderboard();
}
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
function migrateProV1601(){
 const p=state.player;if(p.v1601Migrated)return;
 if(isProfessionalStage()){ensureProRoster();(p.adultLife?.pregnancies||[]).forEach((pg,i)=>promoteImportantPregnancyNpc(pg,i));cleanupUnnamedFriends()}
 p.v1601Migrated=true;
}
function migrateProV1602(){
 const p=state.player;if(p.v1602Migrated)return;
 if(isProfessionalStage()&&p.proCareer?.season){
  const sn=p.proCareer.season,played=Math.max(0,sn.myMatches||0);sn.schedule=[];
  buildProRegularSchedule();
  // Existing saves: mark already-recorded rounds played, then place remaining fixtures from the current week forward.
  sn.schedule.forEach((m,i)=>{if(i<played)m.played=true;else{let offset=i-played,w=state.date.week+offset,y=state.date.year;while(w>52){w-=52;y++}m.week=w;m.year=y;m.day=6}});
  if(sn.phase==="季後賽"&&!sn.playoffSchedule)schedulePlayoffMatch();
  state.logs.push("📅 賽程修正：職業正式比賽改為指定日期，例行賽每週六一場；非比賽日無法提前進行。");
 }
 p.v1602Migrated=true;
}
function migrateProV1603(){
 const p=state.player;if(p.v1603Migrated)return;
 if(isProfessionalStage()&&p.proCareer?.stage==="starter"){
   const due=ensureMandatoryProMatchToday();
   if(due)state.logs.push("🔧 V1.6.0.3修正：正式職業比賽不再占用一般活動時段，即使當日3項活動已做完仍可進入比賽。");
 }
 p.v1603Migrated=true;
}
function migrateProV171(){
 const p=state.player;if(p.v171Migrated)return;ensureEthics();
 if(isProfessionalStage()){
  changeCareerRep(30,"V1.7.1 職業風評校正回歸");
  state.logs.push("🔧 職業風評校正：+30。人品與職業風評已正式拆分。");
 }
 p.v171Migrated=true;
}
function relationshipCard(){
 const p=state.player,known=Object.values(state.characters||{}).filter(c=>c?.known&&proSocialAllowed(c)),partners=p.romance.partners||[];
 return `<section class="card"><div class="row space"><h2>人際關係</h2><span class="badge">${partners.length?`交往中 ×${partners.length}`:"單身"}</span></div>
 ${known.map(c=>{let v=p.relations[c.name]||0,dating=partners.includes(c.name),traits=safeTraits(c);return `<div class="log"><div class="row space"><strong>${c.name}${dating?" 💞":""}</strong><span>${dating?"戀人":relationTier(v,c.name)} · ${Math.round(v)}</span></div><div class="small">${c.desc||""}｜性別：${c.gender||"未設定"}${traits.length?`｜個性：${traits.join("、")}`:""}｜身分：${socialIdentity(c.name)}</div><button class="ghost send-gift" data-name="${c.name}">🎁 送禮物</button></div>`}).join("")}</section>`;
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
function ensureLifestyle(){
 const p=state.player;p.assets=p.assets||{homes:[],vehicles:[]};p.alumni=p.alumni||{donated:0,events:0};p.fanEvents=p.fanEvents||{meetings:0};p.proCareer.leave=p.proCareer.leave||{days:0,approved:false,reason:"",subStarts:0,subScore:50};p.romance.affairs=p.romance.affairs||{};return p;
}
const ASSET_CATALOG=[
 {id:"apt",kind:"home",name:"市中心公寓",price:6800000,maint:12000,quality:4},{id:"luxapt",kind:"home",name:"高級景觀宅",price:16800000,maint:28000,quality:8},{id:"villa",kind:"home",name:"獨棟豪宅",price:36000000,maint:65000,quality:12},
 {id:"sedan",kind:"vehicle",name:"房車",price:1200000,maint:6000,quality:2},{id:"sport",kind:"vehicle",name:"跑車",price:6800000,maint:24000,quality:6},{id:"supercar",kind:"vehicle",name:"頂級超跑",price:18000000,maint:60000,quality:10},
 {id:"ergonomic",kind:"home",name:"頂級人體工學電競室",price:1800000,maint:5000,quality:4},{id:"rehabroom",kind:"home",name:"私人健身／復健室",price:3500000,maint:12000,quality:5},
 {id:"yacht",kind:"vehicle",name:"豪華私人遊艇",price:80000000,maint:650000,quality:14},{id:"superyacht",kind:"vehicle",name:"超級遊艇",price:300000000,maint:2200000,quality:20},{id:"privatejet",kind:"vehicle",name:"私人飛機",price:480000000,maint:3500000,quality:22}
];
function assetCard(){if(!isProfessionalStage())return "";const p=ensureLifestyle(),owned=[...p.assets.homes,...p.assets.vehicles];return `<section class="card"><h2>🏠 資產與生活</h2><div class="small">持有資產：${owned.length?owned.map(id=>ASSET_CATALOG.find(x=>x.id===id)?.name||id).join("、"):"尚無"}</div>${ASSET_CATALOG.map(x=>`<div class="schedule-item"><div><strong>${x.name}</strong><div class="small">NT$${x.price.toLocaleString()}｜每4週維護約 NT$${x.maint.toLocaleString()}</div></div><button class="ghost asset-buy" data-id="${x.id}" ${owned.includes(x.id)||p.cash<x.price?"disabled":""}>${owned.includes(x.id)?"已擁有":"購買"}</button></div>`).join("")}</section>`}
function buyAsset(id){const p=ensureLifestyle(),x=ASSET_CATALOG.find(a=>a.id===id);if(!x||p.cash<x.price)return;p.cash-=x.price;(x.kind==="home"?p.assets.homes:p.assets.vehicles).push(x.id);p.mood=clamp(p.mood+x.quality,0,100);state.logs.push(`🏠 購入資產：${x.name}，支出 NT$${x.price.toLocaleString()}。`);save();render()}
function alumniCard(){if(!isProfessionalStage())return "";const p=ensureLifestyle();return `<section class="card"><h2>🎓 回饋母校</h2><div class="small">累計回饋 NT$${p.alumni.donated.toLocaleString()}。可贊助電競社、獎學金或校園設備。</div><div class="reply-grid"><button class="reply alumni-donate" data-amt="50000">贊助電競社 5萬</button><button class="reply alumni-donate" data-amt="200000">設立獎學金 20萬</button><button class="reply alumni-donate" data-amt="1000000">校園大型回饋 100萬</button></div></section>`}
function alumniDonate(amt){const p=ensureLifestyle();if(p.cash<amt)return;p.cash-=amt;p.alumni.donated+=amt;p.alumni.events++;changeEthics(Math.min(8,2+amt/250000),"回饋母校");positiveImageRepair("長期回饋母校與公益",Math.min(3,1+amt/500000));p.followers+=Math.round(amt/10000);state.logs.push(`🎓 回饋母校 NT$${amt.toLocaleString()}，校方與學弟妹表達感謝。`);save();render()}
function teamBuildingCard(){if(!isProfessionalStage())return "";return `<section class="card"><h2>🏢 俱樂部團建</h2><div class="small">聚餐、慶功、KTV、烤肉、家屬活動或贊助商活動。消耗1格生活時段，可提升默契並認識隊友生活圈。</div><button id="teamBuilding" class="reply">參加俱樂部團建</button></section>`}
function runTeamBuilding(){if(!consume("俱樂部團建",1))return;const p=state.player,pc=p.proCareer;ensureTeammatePartners();const mates=(pc.roster||[]).filter(x=>!x.isPlayer);mates.forEach(x=>p.relations[x.name]=clamp((p.relations[x.name]||50)+rand(1,3),0,100));pc.lockerRoom=clamp((pc.lockerRoom||65)+rand(2,5),0,100);pc.coachTrust=clamp((pc.coachTrust||50)+.5,0,100);const available=Object.entries(pc.teammatePartners||{}).filter(([mate,x])=>x?.name&&!state.characters?.[x.name]?.known);if(available.length&&Math.random()<.75){const [mate,x]=available[rand(0,available.length-1)];addSocialAcquaintance(x.name,25,{gender:"女",age:20+stableAgeOffset(x.name,8),identityType:`${mate}的女友`,role:"一般人",acquaintanceSource:"戰隊團建",romanceable:true,teammatePartnerOf:mate,homeCountry:currentResidenceCountry(),homeCity:currentResidenceCity()});state.logs.push(`🎉 團建時 ${mate} 帶女友 ${x.name} 出席，你們正式認識。`)}else state.logs.push("🎉 參加俱樂部團建，隊友關係與團隊默契提升。");save();render()}
function ensureTeammatePartners(){
 const p=state.player,pc=p.proCareer;if(!isProfessionalStage()||!pc?.roster)return;
 pc.teammatePartners=pc.teammatePartners||{};
 const names=["夏寧","若依","映彤","采恩","允熙","智雅","美咲","凜花","艾琳","Sofia","Chloe","Emma"];
 (pc.roster||[]).filter(x=>x?.name&&x.name!==p.name&&!x.isSub).forEach((mate,i)=>{
  if(pc.teammatePartners[mate.name]||socialStableHash(mate.name,"partner")%100>=48)return;
  const name=names[socialStableHash(mate.name,"partnerName")%names.length]+(Object.values(pc.teammatePartners).some(v=>v.name===names[socialStableHash(mate.name,"partnerName")%names.length])?`・${mate.name.slice(0,1)}`:"");
  pc.teammatePartners[mate.name]={name,known:false,together:true};
 });
}
function maybeMeetTeammateGirlfriend(){
 ensureTeammatePartners();const p=state.player,pc=p.proCareer,entries=Object.entries(pc.teammatePartners||{}).filter(([m,v])=>v.together&&!v.known);
 if(!entries.length||Math.random()>.32)return;
 const [mate,v]=entries[rand(0,entries.length-1)];v.known=true;
 const c=state.characters[v.name]=state.characters[v.name]||{name:v.name,gender:"女",age:Math.max(18,p.age+rand(-2,2)),known:true};
 c.known=true;c.identityType=`${mate}的女友`;c.acquaintanceSource="戰隊聚會";c.teammatePartnerOf=mate;c.playsGame=false;c.role="一般人";
 p.relations[v.name]=p.relations[v.name]??rand(28,42);
 state.logs.push(`👥 在戰隊聚會中，你認識了隊友 ${mate} 的女友 ${v.name}。`);
}
function ensureTeamRuptures(){const pc=state.player.proCareer;pc.teamRuptures=pc.teamRuptures||{};return pc.teamRuptures}
function createTeamRupture(mate,source,reason="私人關係衝突"){const pc=state.player.proCareer,r=ensureTeamRuptures(),x=r[mate]=r[mate]||{mate,source,reason,severity:0,status:"衝突",ultimatum:false,sabotageRisk:0,weeks:0};x.severity=clamp(Math.max(x.severity||0,rand(3,5)),1,5);x.status=x.severity>=4?"決裂":"嚴重衝突";x.sabotageRisk=clamp(.04+x.severity*.035,0,.24);pc.teammateConflict=x;if(x.severity>=4&&!x.ultimatum&&Math.random()<.62){x.ultimatum=true;x.refusesToPlay=true;x.lineupHandled=false;state.messages.push({id:"ult-"+Date.now(),from:mate,text:"我已經跟管理層講清楚了，有他就沒有我。",unread:true,resolved:true,type:"team_crisis"});state.logs.push(`💥 ${mate} 向戰隊提出「有夜鋒就沒有我」的最後通牒。`)}}
function emergencyAmateurForRole(role,mate){
 const pc=state.player.proCareer,seed=`${pc.team}-${role}-${state.date.year}-${state.date.week}-${mate}`,first=["陳","林","張","黃","吳","李","許","周"][stableAgeOffset(seed,8)],last=["宇翔","柏廷","冠霖","承恩","子謙","昱辰","家豪","品睿"][stableAgeOffset(seed+"n",8)],name=`${first}${last}`;
 const x={name,role,isPlayer:false,isSub:false,rating:rand(58,69),relation:45,trust:40,chemistry:28,salary:rand(60000,95000),proGames:0,emergencySigning:true,joinedYear:state.date.year};pc.roster.push(x);
 addSocialAcquaintance(name,45,{gender:"男",age:18+stableAgeOffset(name,6),role,isPro:true,identityType:"緊急簽約新人",team:pc.team,acquaintanceSource:`${pc.team} 緊急徵召`});state.news.unshift(`🆘 ${pc.team} 因陣容危機緊急簽下零職業經驗的路人新人 ${name}（${role}）。`);return x;
}
function prepareRuptureEmergencyLineup(){
 const pc=state.player.proCareer,active=Object.values(pc.teamRuptures||{}).find(x=>x.refusesToPlay&&["決裂","嚴重衝突","冷戰共存"].includes(x.status));if(!active)return null;
 const starter=(pc.roster||[]).find(x=>x.name===active.mate);if(!starter)return null;const role=normalizeRosterRole(starter.role),subs=(pc.roster||[]).filter(x=>x.isSub&&!x.refusesToPlay);
 let rep=subs.find(x=>normalizeRosterRole(x.role)===role),note="";starter.isSub=true;starter.refusesToPlay=true;
 if(rep){rep.isSub=false;rep.emergencyFor=active.mate;note=`同位置替補 ${rep.name} 緊急頂替 ${active.mate}`;pc.emergencyLineupPenalty=.025;}
 else if(subs.length){rep=subs.sort((a,b)=>rosterRating(b)-rosterRating(a))[0];rep.isSub=false;rep.emergencyFor=active.mate;rep.originalRole=rep.originalRole||rep.role;rep.role=role;rep.forcedRoleSwap=true;note=`${rep.name} 從 ${rep.originalRole} 被迫轉路至 ${role}`;pc.emergencyLineupPenalty=.075;}
 else {const international=["MSI","世界賽"].includes(proAnnualPhase());if(!international){rep=emergencyAmateurForRole(role,active.mate);note=`緊急簽下路人新人 ${rep.name} 頂替 ${active.mate}`;pc.emergencyLineupPenalty=.11}else{note=`國際賽名單鎖定，無法臨時簽人；${active.mate} 拒絕出賽造成嚴重陣容缺口`;pc.emergencyLineupPenalty=.16}}
 active.emergencyReplacement=rep?.name||null;active.lineupHandled=true;state.logs.push(`🚨 陣容危機：${active.mate} 拒絕共同出賽；${note}。`);state.news.unshift(`🚨 ${pc.team} 賽前臨時變陣：${note}。`);return {mate:active.mate,replacement:rep?.name||null,note};
}
function teamAssetScore(name){const p=state.player,pc=p.proCareer;if(name===p.name)return avg()*1.15+(pc.coachTrust||50)*.18+(p.followers||0)/30000;const c=state.characters?.[name]||{},rel=p.relations?.[name]||50;return (c.power||c.rating||70)+(100-rel)*.03+rand(-5,5)}
function resolveTeamRupture(mate){const p=state.player,pc=p.proCareer,x=ensureTeamRuptures()[mate];if(!x||["已轉隊","已解約","已和解"].includes(x.status))return;const my=teamAssetScore(p.name),his=teamAssetScore(mate),roll=Math.random();if(x.severity<4&&roll<.28){x.status="已和解";pc.teamChemistry=clamp((pc.teamChemistry||60)+4,0,100);state.logs.push(`🤝 教練與管理層成功調停你和 ${mate} 的衝突。`);return}if(his+rand(-8,8)>my+8){if(roll<.48){x.status="夜鋒被轉隊";pc.forcedTransferPending={reason:`與 ${mate} 決裂`,preferredKeep:mate};state.logs.push(`🔄 管理層決定優先保留 ${mate}，開始尋找夜鋒的交易方案。`)}else{x.status="夜鋒可能解約";pc.releaseRisk=clamp((pc.releaseRisk||0)+35,0,100);state.logs.push(`⚠️ 你的解約風險大幅提高。`)}}else if(my>his+rand(-5,7)){if(roll<.68){x.status="隊友待轉隊";x.transferOutPending=true;state.logs.push(`🔄 管理層選擇保住夜鋒，開始為 ${mate} 尋找轉隊。`)}else{x.status="隊友可能解約";x.releasePending=true;state.logs.push(`📄 ${mate} 進入解約評估。`)}}else{x.status="冷戰共存";x.sabotageRisk=clamp(x.sabotageRisk+.05,0,.30);pc.teamChemistry=clamp((pc.teamChemistry||60)-8,0,100);state.logs.push(`🧊 沒有人離隊，你與 ${mate} 被迫繼續共事。`)}}
function teamRuptureWeeklyTick(){const pc=state.player.proCareer,r=ensureTeamRuptures();Object.values(r).forEach(x=>{if(!["決裂","嚴重衝突","冷戰共存"].includes(x.status))return;x.weeks=(x.weeks||0)+1;if((x.ultimatum||x.weeks>=2)&&Math.random()<.34)resolveTeamRupture(x.mate);if(x.transferOutPending&&Math.random()<.42){x.transferOutPending=false;x.status="已轉隊";state.logs.push(`🔄 ${x.mate} 因隊內決裂正式轉隊。`);if(pc.roster)pc.roster=pc.roster.filter(v=>v.name!==x.mate)}if(x.releasePending&&Math.random()<.35){x.releasePending=false;x.status="已解約";state.logs.push(`📄 ${x.mate} 與戰隊解約。`);if(pc.roster)pc.roster=pc.roster.filter(v=>v.name!==x.mate)}})}
function ruptureMatchPenalty(){const active=Object.values(state.player.proCareer?.teamRuptures||{}).filter(x=>["決裂","嚴重衝突","冷戰共存"].includes(x.status));if(!active.length)return 0;let penalty=active.reduce((n,x)=>n+.018*x.severity,0),sab=active.find(x=>Math.random()<(x.sabotageRisk||0));if(sab){penalty+=rand(8,16)/100;state.logs.push(`⚠️ ${sab.mate} 在比賽中出現明顯消極配合，團隊執行嚴重失常。`);if(Math.random()<.12){sab.disciplineInvestigation=true;state.news.unshift("戰隊內部傳出比賽態度與紀律爭議，管理層已展開調查。")}}return clamp(penalty,0,.28)}
function disciplineRuptureTick(){const pc=state.player.proCareer;Object.values(pc.teamRuptures||{}).forEach(x=>{if(!x.disciplineInvestigation)return;x.disciplineInvestigation=false;if(Math.random()<.55){x.status="已解約";if(pc.roster)pc.roster=pc.roster.filter(v=>v.name!==x.mate);state.news.unshift(`🚨 ${x.mate} 因嚴重職業紀律問題遭戰隊解約。`)}else state.logs.push(`📋 ${x.mate} 因消極比賽遭內部處分與警告。`)})}
function teamRuptureCard(){const arr=Object.values(state.player.proCareer?.teamRuptures||{});if(!isProfessionalStage()||!arr.length)return "";return `<section class="card"><h2>⚡ 隊內關係危機</h2>${arr.map(x=>`<div class="schedule-item"><div><strong>${x.mate}</strong><div class="small">${x.status}｜嚴重度 ${x.severity}/5${x.ultimatum?"｜已提出有他沒我":""}</div></div>${["決裂","嚴重衝突","冷戰共存"].includes(x.status)?`<button class="ghost rupture-talk" data-mate="${x.mate}">請管理層處理</button>`:""}</div>`).join("")}</section>`}
function teammatePartnerRisk(name){
 const c=state.characters?.[name];if(!c?.teammatePartnerOf)return null;
 const p=state.player,mate=c.teammatePartnerOf,rel=p.relations?.[name]||0;
 const consent=clamp(.10+(rel-35)*.009,.05,.55);
 if(Math.random()>consent){state.logs.push(`🚫 ${name} 拒絕了超越朋友界線的邀請。`);modal(`<h2>${name}</h2><p>她拒絕了你的邀請，希望維持普通朋友關係。</p>${closeBtn()}`);return false}
 const loc=currentLocationProfile(),res=currentResidenceProfile(),abroad=loc?.country&&res?.country&&loc.country!==res.country;
 const caught=clamp(.16+(rel>70?.03:0))*(abroad?.5:1);
 if(Math.random()<caught){
  p.relations[mate]=clamp((p.relations[mate]||50)-rand(28,48),0,100);
  p.proCareer.teamChemistry=clamp((p.proCareer.teamChemistry||60)-rand(8,18),0,100);
  p.proCareer.teammateConflict={mate,source:name,severity:rand(2,4)};createTeamRupture(mate,name,"與隊友女友的私人關係");
  state.logs.push(`💥 ${mate} 發現你和 ${name} 的關係，隊友之間嚴重鬧翻，團隊默契下降。`);
 }
 return true;
}
function openFemaleFanEvent(){
 const p=state.player;
 if(!isProfessionalStage()){
   modal(`<h2>💌 女粉絲</h2><p>目前還沒有職業階段的粉絲事件。</p>${closeBtn()}`);
   return;
 }
 return meetFemaleFan();
}
function fanMeetingCard(){if(!isProfessionalStage())return "";const f=state.player.followers||0,ok=f>=5000;return `<section class="card"><h2>🤝 粉絲見面會</h2><div class="small">${ok?"已解鎖。依人氣規模安排簽名、合照、冠軍紀念與商業活動，消耗1格生活時段。":`🔒 需要 5,000 粉絲｜目前 ${f.toLocaleString()} / 5,000`}</div><button id="fanMeeting" class="reply" ${ok?"":"disabled"}>舉辦粉絲見面會</button></section>`}
function runFanMeeting(){if(!consume("粉絲見面會",1))return;const p=ensureLifestyle(),gain=rand(180,650);p.followers+=gain;p.fanEvents.meetings++;p.mood=clamp(p.mood+5,0,100);p.energy=clamp(p.energy-8,0,100);state.logs.push(`🤝 粉絲見面會完成，新增約 ${gain} 名粉絲。`);if(Math.random()<.28)state.messages.push({id:"fanmeet-"+Date.now(),from:"粉絲活動工作人員",text:"今天有幾位粉絲特別想和你保持聯絡，社群討論度也明顯上升。",unread:true,resolved:true,type:"normal"});save();render()}
function leaveCard(){if(!isProfessionalStage())return "";const p=ensureLifestyle(),l=p.proCareer.leave;return `<section class="card"><h2>🗓️ 向教練請假</h2><div class="small">${l.days>0?`已核准假期：剩餘 ${l.days} 天｜${l.reason}`:`教練信任 ${Math.round(p.proCareer.coachTrust||50)}。重要賽事較難批准；若比賽日請假，替補會上場。`}</div>${l.days<=0?`<div class="reply-grid"><button class="reply leave-request" data-reason="私人事務">私人事務</button><button class="reply leave-request" data-reason="家庭事件">家庭事件</button><button class="reply leave-request" data-reason="身體休養">身體休養</button></div>`:""}</section>`}
function requestCoachLeave(reason){const p=ensureLifestyle(),pc=p.proCareer,m=currentScheduledProMatch(),important=m&&["季後賽","MSI","世界賽"].some(x=>(m.phase||"").includes(x)),chance=clamp(.35+(pc.coachTrust||50)*.006-(important?.28:0)-(pc.leave.subStarts||0)*.025,.12,.88);if(Math.random()<chance){pc.leave={...pc.leave,days:rand(1,3),approved:true,reason};pc.coachTrust=clamp((pc.coachTrust||50)-1,0,100);state.logs.push(`🗓️ 教練批准${reason}請假 ${pc.leave.days} 天。若撞到比賽將由替補上場。`)}else{pc.coachTrust=clamp((pc.coachTrust||50)-2,0,100);state.logs.push(`🗓️ 教練拒絕了「${reason}」請假申請。`)}save();render()}
function substituteMatchIfOnLeave(){
 const p=ensureLifestyle(),pc=p.proCareer,l=pc.leave,m=currentScheduledProMatch();if(!m||l.days<=0||!l.approved)return false;
 const now=proDaySerial(),target=((m.year*52+m.week)*7+m.day);if(now<target||m.played)return false;
 const good=Math.random()<clamp(.42+(l.subScore-50)*.006,.25,.72),score=m.bo===5?(good?["3:0","3:1","3:2"][rand(0,2)]:["0:3","1:3","2:3"][rand(0,2)]):(good?(Math.random()<.5?"2:0":"2:1"):(Math.random()<.5?"0:2":"1:2"));
 const [gw,gl]=score.split(":").map(Number);m.played=true;l.subStarts++;l.subScore=clamp(l.subScore+(good?rand(5,12):-rand(3,7)),0,100);
 const sn=pc.season,me=sn?.teams?.find(x=>x.name===pc.team),opp=sn?.teams?.find(x=>x.name===m.opp);
 if(me){me.w+=good?1:0;me.l+=good?0:1;me.gw+=gw;me.gl+=gl}if(opp){opp.w+=good?0:1;opp.l+=good?1:0;opp.gw+=gl;opp.gl+=gw}
 if(sn?.phase==="例行賽"){sn.myMatches=(sn.myMatches||0)+1;sn.matchesPlayed=(sn.matchesPlayed||0)+1}
 pc.coachTrust=clamp((pc.coachTrust||50)+(good?-rand(2,5):rand(1,3)),0,100);
 if(good&&l.subScore>=68){pc.starterSecurity=clamp((pc.starterSecurity??75)-rand(8,15),0,100);state.logs.push(`⚠️ 替補代打 ${score} 獲勝且表現出色，你的先發位置受到挑戰。`)}else state.logs.push(`🪑 你請假缺席正式賽，替補代打：${pc.team} ${score} ${m.opp}。`);
 state.news.unshift(`職業聯賽：${pc.team} ${score} ${m.opp}；夜鋒因核准請假未出賽，由替補上場。`);save();return true;
}

function ensureLegacyChildSystem(){
 const p=state.player,arr=p.adultLife?.pregnancies||[];
 arr.forEach(pg=>{
  if(!pg.born)return;
  pg.child=pg.child||{name:`${pg.name.slice(0,1)}小星`,age:0,public:false,birthYear:state.date.year,bond:0};
  pg.child.birthYear=pg.child.birthYear||state.date.year;
  pg.child.bond=Number(pg.child.bond)||0;
  if(!pg.birthChoice)pg.legacyBirthReview=true;
  if(pg.supportChoice==="共同撫養")pg.playerCare=true;
  else if(["經濟扶養","拒絕撫養"].includes(pg.supportChoice))pg.playerCare=false;
 });
}
function recordLegacyBirthChoice(name,choice){
 const pg=pregnancyByName(name),p=state.player;if(!pg||!pg.born||pg.birthChoice)return;
 pg.birthChoice=choice;pg.legacyBirthReview=false;
 if(choice==="陪產"){
  p.relations[pg.name]=clamp((p.relations[pg.name]||50)+5,0,100);
  pg.supportScore=(pg.supportScore||0)+2;pg.child.bond=clamp((pg.child.bond||0)+2,0,100);
  state.logs.push(`📝 補登生產紀錄：當時你有陪同 ${pg.name} 生產。`);
 }else{
  p.relations[pg.name]=clamp((p.relations[pg.name]||50)-2,0,100);
  if(p.romance?.spouse===pg.name)p.relations[pg.name]=clamp((p.relations[pg.name]||50)-2,0,100);
  state.logs.push(`📝 補登生產紀錄：當時你沒有陪同 ${pg.name} 生產。`);
 }
 save();render();
}
function infantCare(name){
 const x=pregnancyByName(name);if(!x?.born||!x.playerCare||!x.child)return;
 const age=Math.max(0,state.date.year-(x.child.birthYear||state.date.year));
 if(age>3){modal(`<h2>育嬰階段已結束</h2><p>${x.child.name} 已超過幼兒育嬰階段，可以改用一般陪伴孩子。</p>${closeBtn()}`);return}
 if(!consume("育嬰照顧",1))return;
 const p=state.player;
 x.child.bond=clamp((x.child.bond||0)+rand(6,10),0,100);
 p.energy=clamp(p.energy-rand(7,11),0,100);p.mood=clamp(p.mood+3,0,100);
 p.relations[x.name]=clamp((p.relations[x.name]||50)+3,0,100);
 if(p.romance?.spouse===x.name)p.relations[x.name]=clamp((p.relations[x.name]||50)+2,0,100);
 state.logs.push(`🍼 你花了一個時段照顧 ${x.child.name}，親子與家庭關係提升。`);
 save();render();
}
function ensurePregnancyEventIds(){(state.player.adultLife?.pregnancies||[]).forEach((pg,i)=>{if(!pg.eventId)pg.eventId=`preg_${state.date.year}_${i}_${Math.abs(socialStableHash(pg.name||String(i),"preg"))}`})}
function pregnancyByEventId(id){ensurePregnancyEventIds();return (state.player.adultLife?.pregnancies||[]).find(x=>x.eventId===id)}
function resolveBirthEventById(id){const pg=pregnancyByEventId(id);if(!pg)return;resolveBirthEvent(pg.name)}
function repairDuePregnancyProgress(){
 (state.player.adultLife?.pregnancies||[]).forEach(pg=>{
  if(pg.born)return;
  if(pg.birthPending||pg.status==="即將生產"){
   pg.progressWeeks=Math.max(40,Number(pg.progressWeeks)||0);
   pg.birthPending=true;
   pg.status="即將生產";
  }
 });
}
function pregnancyRecordPriority(pg){
 if(pg?.born)return 10000+(Number(pg.progressWeeks)||40);
 if(pg?.birthPending||pg?.status==="即將生產")return 8000+Math.max(40,Number(pg.progressWeeks)||0);
 return (Number(pg?.progressWeeks)||0)+(pg?.status==="決定繼續"?100:0);
}
function mergePregnancyRecordData(keep,drop){
 if(!keep||!drop)return keep;
 ["supportChoice","supportMonthly","supportScore","playerCare","birthChoice","child","eventId","spouseKnows","publicExposure"].forEach(k=>{if(keep[k]==null&&drop[k]!=null)keep[k]=drop[k]});
 keep.progressWeeks=Math.max(Number(keep.progressWeeks)||0,Number(drop.progressWeeks)||0);
 if(keep.birthPending||drop.birthPending||keep.status==="即將生產"||drop.status==="即將生產"){
  keep.progressWeeks=Math.max(40,keep.progressWeeks);keep.birthPending=true;keep.status="即將生產";
 }
 return keep;
}
function dedupePregnancies(){
 const p=state.player,arr=p.adultLife?.pregnancies;if(!Array.isArray(arr)||!arr.length)return;
 const byName=new Map(),out=[];
 arr.forEach(pg=>{
  if(!pg?.name){out.push(pg);return}
  if(!byName.has(pg.name)){byName.set(pg.name,pg);out.push(pg);return}
  const current=byName.get(pg.name);
  const keep=pregnancyRecordPriority(pg)>pregnancyRecordPriority(current)?pg:current;
  const drop=keep===pg?current:pg;
  mergePregnancyRecordData(keep,drop);
  if(keep!==current){const ix=out.indexOf(current);if(ix>=0)out[ix]=keep;byName.set(pg.name,keep)}
 });
 p.adultLife.pregnancies=out;
}
function pregnancyByName(name){return (state.player.adultLife?.pregnancies||[]).find(x=>x.name===name)}
function resolveBirthEvent(name){
 const pg=pregnancyByName(name);if(!pg||pg.born)return;
 const due=(pg.progressWeeks||0)>=40||pg.status==="即將生產"||pg.birthPending;
 if(!due){modal(`<h2>尚未進入生產</h2><p>${pg.name} 目前約 ${Math.floor(pg.progressWeeks||0)}/40 週。</p>${closeBtn()}`);return}
 pg.birthPending=true;pg.status="即將生產";save();
 modal(`<h2>🏥 ${pg.name} 即將生產</h2><p>你要如何處理這次生產事件？如果正在國外效力，陪產代表你需要處理戰隊私人行程。</p><div class="reply-grid"><button class="reply birth-choice" data-c="陪產">前往醫院陪產</button><button class="reply birth-choice" data-c="工作">留隊／工作，保持聯絡</button></div>${closeBtn()}`);
 document.querySelectorAll(".birth-choice").forEach(b=>b.onclick=()=>finishBirthEvent(pg,b.dataset.c));
}
function finishBirthEvent(pg,choice){
 const p=state.player;pg.birthPending=false;pg.born=true;pg.status="孩子已出生";pg.child=pg.child||{name:`${pg.name.slice(0,1)}小星`,age:0,public:false,birthYear:state.date.year,bond:0};
 pg.child.birthYear=pg.child.birthYear||state.date.year;pg.child.bond=Number(pg.child.bond)||0;pg.birthChoice=choice;
 if(choice==="陪產"){
  p.relations[pg.name]=clamp((p.relations[pg.name]||50)+8,0,100);pg.supportScore=(pg.supportScore||0)+2;pg.child.bond+=3;
  state.logs.push(`👶 你陪同 ${pg.name} 完成生產，孩子平安出生。`);
 }else{
  pg.supportScore=pg.supportScore||0;p.relations[pg.name]=clamp((p.relations[pg.name]||50)-2,0,100);
  state.logs.push(`👶 ${pg.name}生下孩子。你因工作未能陪產，但保持聯絡。`);
 }
 if(p.romance?.spouse===pg.name&&choice!=="陪產")p.relations[pg.name]=clamp((p.relations[pg.name]||50)-3,0,100);
 state.messages.push({id:"birth-"+Date.now(),from:pg.name,text:"孩子平安出生了。接下來我們要談扶養、探望與生活安排。",unread:true,resolved:true,type:"birth"});
 save();document.querySelector(".modal-backdrop")?.remove();render();
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
 return `${proHomeHeader()}<section class="card hero"><div class="row space"><div><div class="small">${dateLabel()}</div><h2>${p.name} · ${p.age}歲 · ${p.role}</h2></div><span class="badge">綜合 ${avg().toFixed(1)}</span></div>
 <div class="stat-grid">${stat("Rank",`${p.rank} ${p.lp} LP`)}${stat("現金",`NT$${p.cash.toLocaleString()}`)}${stat("職業關注",`${p.proAttention}/100`)}${stat("聲譽",`${p.reputation}/100`)}</div></section>
 ${locationStatusCard()}
 <section class="card"><h2>今日狀態</h2><div class="stat-grid">${stat("競技狀態",formLabel())}${stat("傷病",p.condition?.injury?`${p.condition.injury.type}・${p.condition.injury.severity}`:"健康")}${stat("體力",`${Math.round(p.energy)}/100`)}${stat("心情",`${Math.round(p.mood)}/100`)}${stat("壓力",`${Math.round(p.stress)}/100`)}${stat("遊戲熱情",`${Math.round(p.passion)}/100`)}</div></section>
 ${hard?lockedDayCard(hard):timeCard()}${isProfessionalStage()?proLifeCard():schoolCard()}${appointmentCard()}
 ${hard?`<section class="card"><div class="notice">今天是正式賽事日，一般活動全部鎖定。</div></section>`:actionCard()}
 <section class="card"><h2>最近紀錄</h2>${state.logs.slice(-6).reverse().map(x=>`<div class="log">${x}</div>`).join("")}</section>`;
}
function isImportantMessage(m){
 if(!m)return false;
 if(m.unread||m.resolved===false)return true;
 const importantTypes=new Set(["duoInvite","romance","pregnancy","contract","scout","transfer","poach","marriage","birth"]);
 if(importantTypes.has(m.type))return true;
 return /懷孕|孩子|結婚|離婚|合約|轉會|星探|試訓|禁賽|公關危機|世界賽|MSI/.test(`${m.from||""} ${m.text||""}`);
}
function cleanupOldMessages(manual=false){
 state.messages=Array.isArray(state.messages)?state.messages:[];
 const keepRecent=manual?20:35,important=[],normal=[];
 state.messages.forEach((m,i)=>(isImportantMessage(m)?important:normal).push({m,i}));
 const keepNormal=new Set(normal.slice(-keepRecent).map(x=>x.i));
 const before=state.messages.length;
 state.messages=state.messages.filter((m,i)=>isImportantMessage(m)||keepNormal.has(i));
 const removed=before-state.messages.length;
 state.messageArchiveCount=(state.messageArchiveCount||0)+removed;
 if(manual)state.logs.push(`📱 訊息整理完成：清除 ${removed} 則已結束的一般舊訊息；未讀、待處理與重要劇情訊息保留。`);
 return removed;
}
function phone(){
 ensureV10();cleanupOldMessages(false);const unread=state.messages.filter(m=>m.unread).length,msgs=state.messages.slice(-40).reverse();
 return `<section class="card"><div class="row space"><h2>訊息</h2><span class="badge">${unread} 未讀</span></div>
 <div class="small">顯示最近訊息；未讀、待處理及重要劇情訊息不會被自動清除。已整理 ${state.messageArchiveCount||0} 則舊訊息。</div>
 ${msgs.map(m=>`<div class="message ${m.unread?"unread":""}"><button type="button" class="message-open" data-msg="${m.id}" style="width:100%;border:0;background:transparent;color:white;text-align:left;padding:0"><div class="meta"><strong>${m.from}</strong><span class="small">${m.resolved?"已處理":m.unread?"未讀":"待回覆"}</span></div><div style="margin-top:6px;white-space:pre-line">${m.text}</div><div class="small" style="margin-top:8px">點擊開啟對話 ›</div></button></div>`).join("")}
 <button id="cleanupMessages" class="reply" style="width:100%;margin-top:12px">🧹 整理一般舊訊息</button></section>
 ${relationshipCard()}${rumorCard()}<section class="card"><h2>📰 電競新聞</h2>${state.news.slice(0,12).map(n=>`<div class="log">${n}</div>`).join("")}</section>`;
}
function rosterRating(x){if(x?.isPlayer)return Math.round(avg());if(Number.isFinite(x?.rating))return Math.round(x.rating);const c=state.characters?.[x?.name]||{};return Math.round(c.rating||c.strength||68+stableAgeOffset(x?.name||"player",19));}
function rosterStatus(x){if(x?.isPlayer){if(state.player.condition?.injury)return `傷病：${state.player.condition.injury.type}`;return `${formLabel()}｜體力 ${Math.round(state.player.energy)}`;}const c=state.characters?.[x?.name]||{};return c.injury?`傷病：${c.injury}`:(c.form>=75?"狀態火熱":c.form<=45?"狀態低迷":"狀態正常");}
function enforceUltimatumLineup19781(){
 const pc=state.player?.proCareer;if(!pc||!Array.isArray(pc.roster))return;
 const active=Object.values(pc.teamRuptures||{}).find(x=>x&&x.ultimatum&&(x.severity||0)>=4&&!["已轉隊","已解約","已和解"].includes(x.status));
 if(!active)return;
 const mate=pc.roster.find(x=>x.name===active.mate),me=pc.roster.find(x=>x.isPlayer||x.name===state.player.name);if(!mate||!me)return;
 // 「有他沒我」：兩人仍同隊時絕不能同時先發。夜鋒目前是一軍先發則衝突隊友必須進替補。
 if(pc.stage==="starter"){mate.isSub=true;mate.refusesToPlay=true;active.refusesToPlay=true;}else{mate.isSub=false;me.isSub=true;}
 if(pc.stage==="starter"){
   const role=normalizeRosterRole(mate.role),starters=pc.roster.filter(x=>!x.isSub&&x!==mate),hasRole=starters.some(x=>normalizeRosterRole(x.role)===role);
   if(!hasRole){const subs=pc.roster.filter(x=>x.isSub&&x.name!==mate&&!x.refusesToPlay);let rep=subs.find(x=>normalizeRosterRole(x.role)===role);
     if(!rep&&subs.length)rep=subs.sort((a,b)=>rosterRating(b)-rosterRating(a))[0];
     if(rep){rep.isSub=false;rep.originalRole=rep.originalRole||rep.role;if(normalizeRosterRole(rep.role)!==role){rep.role=role;rep.forcedRoleSwap=true;}rep.emergencyFor=mate.name;active.emergencyReplacement=rep.name;}
   }
 }
 pc.substitutes=pc.roster.filter(x=>x.isSub).slice(0,2);
}
function proTeamPageCard(){
 if(!isProfessionalStage())return "";ensureProRoster();ensureRosterSubstitutes();enforceUltimatumLineup19781();const p=state.player,pc=p.proCareer,subs=(pc.roster||[]).filter(x=>x.isSub),coaches=pc.coaches||[];pc.substitutes=subs;
 const rows=(pc.roster||[]).filter(x=>!x.isSub).map(x=>`<div class="schedule-item"><div><strong>${x.isPlayer?"⭐ ":""}${x.name}</strong><div class="small">${x.role}｜能力 ${rosterRating(x)}｜${rosterStatus(x)}${x.isPlayer?"":`<br>${rosterContractText(x)}`}</div></div><span class="badge">${x.isPlayer?"先發・你":"先發"}</span></div>`).join("");
 const subrows=subs.length?subs.map(x=>`<div class="schedule-item"><div><strong>${x.name}</strong><div class="small">${x.role}｜能力 ${rosterRating(x)}｜${rosterStatus(x)}<br>${rosterContractText(x)}</div></div><span class="badge">替補</span></div>`).join(""):`<div class="small">目前戰隊沒有替補選手。</div>`;
 const coachrows=coaches.map(x=>`<div class="schedule-item"><div><strong>${x.name}</strong><div class="small">${x.role}｜對夜鋒信任 ${Math.round(pc.coachTrust||50)}</div></div><span class="badge">教練團</span></div>`).join("");
 return `<section class="card"><div class="row space"><div><div class="small">${pc.region||fixedTeamRegion(pc.team)} 賽區</div><h2>🛡️ ${pc.team} 戰隊頁面</h2></div><span class="badge">${pc.stage==="starter"?"一軍先發":pc.stage==="sub"?"替補":"青訓"}</span></div><h3>先發陣容</h3>${rows}<h3>替補隊友（最多2名）</h3>${subrows}<h3>教練團</h3>${coachrows}<div class="stat-grid">${stat("更衣室",Math.round(pc.lockerRoom||65))}${stat("團隊默契",Math.round(teamChemistry()))}${stat("教練信任",Math.round(pc.coachTrust||50))}${stat("夜鋒狀態",`${Math.round(p.condition.form)}/100`)}</div></section>`;
}
function matchReviewAnalysis(m){
 if(!m)return [];
 const p=state.player,pc=p.proCareer,out=[];
 if(m.tactic&&TACTIC_DEFS[m.tactic])out.push(`戰術：${TACTIC_DEFS[m.tactic].name}｜適配評估 ${tacticFit(m.tactic)>=1?"良好":"需要調整"}。`);
 if(m.win){
   out.push("勝因：團隊在關鍵資源與中後期決策上執行較完整。");
   if(m.mvp)out.push("夜鋒是本場主要勝因之一，個人影響力明顯。");
 }else{
   const reasons=[];
   if((m.d||0)>=5)reasons.push("夜鋒死亡次數偏高，部分時間點讓隊伍失去地圖主動權");
   if(((m.k||0)+(m.a||0))<10)reasons.push("夜鋒參戰影響不足，中期沒有建立足夠的個人節奏");
   if(teamChemistry()<55)reasons.push("團隊默契偏低，資源交換與團戰協同不同步");
   if((p.condition?.form||65)<55)reasons.push("競技狀態偏低，操作與臨場穩定度受到影響");
   if((p.stress||0)>70)reasons.push("壓力過高，影響臨場判斷與決策");
   if((p.energy||0)<45)reasons.push("體力偏低，長局與連續對局表現下滑");
   if(playerMetaFit()<0)reasons.push("英雄池與目前版本強勢角色契合度不足");
   if(m.tactic&&TACTIC_DEFS[m.tactic]&&tacticFit(m.tactic)<1)reasons.push(`教練安排的「${TACTIC_DEFS[m.tactic].name}」與目前陣容適配不足`);
   if(!reasons.length)reasons.push("關鍵團戰與資源交換處理較差，未能把局面轉化為勝勢");
   out.push(`失利原因：${reasons.slice(0,3).join("；")}。`);
 }
 out.push(`建議：${!m.win&&playerMetaFit()<0?"優先練版本強勢英雄並安排Scrim":"利用復盤研究＋Scrim針對本場問題修正"}。`);
 return out;
}
function showMatchReview(){const m=state.player.proCareer?.lastMatch;if(!m)return;const a=matchReviewAnalysis(m);modal(`<h2>🧠 比賽復盤｜${m.team} ${m.score} ${m.opp}</h2><div class="notice">${a.join("<br><br>")}</div><div class="small">復盤依本場KDA、競技狀態、體力、壓力、團隊默契與版本適應分析。</div>${closeBtn()}`);}

// === V1.9.5.0 Career 2.0: additive modules; legacy social/date flows are intentionally untouched ===
const TACTIC_DEFS={
 midjungle:{name:"中野聯動",roles:["中路","打野"],desc:"以中野節奏帶動河道與邊線。",plan:"中野搶線權→河道控制→支援邊線"},
 botcarry:{name:"下路核心",roles:["ADC","輔助"],desc:"資源傾斜下路，保護射手接管團戰。",plan:"下路資源傾斜→控龍→四保一團戰"},
 topside:{name:"上野核心",roles:["上路","打野"],desc:"上半區建立領先並轉化先鋒資源。",plan:"上野壓制→先鋒→邊線擴張"},
 split:{name:"四一分推",roles:["上路","中路"],desc:"單帶牽制，四人組控圖交換資源。",plan:"單帶牽制→四人控圖→交換物件"},
 oneThreeOne:{name:"131分推",roles:["上路","中路","打野"],desc:"雙邊線同時施壓，中野掌握中線與野區。",plan:"雙邊帶線→中路控場→拉扯轉線"},
 teamfight:{name:"團戰陣容",roles:["中路","ADC","輔助"],desc:"圍繞龍魂、大龍與正面團戰。",plan:"物件逼團→正面接戰→雙C輸出"},
 tempo:{name:"前期速攻",roles:["打野","中路","輔助"],desc:"前期主動碰撞，快速滾大經濟差。",plan:"入侵→越塔→快速轉線滾雪球"},
 scaling:{name:"後期營運",roles:["中路","ADC"],desc:"降低前期風險，以資源交換進入後期。",plan:"穩定發育→交換小資源→後期接管"},
 junglecarry:{name:"野核",roles:["打野","中路"],desc:"讓打野吃高資源並成為主輸出點。",plan:"中路讓線權→野區高資源→野核接管"},
 midcarry:{name:"中路核心",roles:["中路","打野"],desc:"資源集中夜鋒，讓中路成為主要勝利條件。",plan:"中路資源→打野護航→中期主導"},
 doublecarry:{name:"雙C體系",roles:["中路","ADC","輔助"],desc:"中下雙核心共同承擔中後期輸出。",plan:"中下平衡發育→前排保護→雙C接管"},
 objective:{name:"物件控制",roles:["打野","輔助","中路"],desc:"以視野、河道站位與懲戒節奏掌握中立資源。",plan:"提前布視野→河道佔位→龍／大龍逼戰"},
 sidelane:{name:"邊線壓制",roles:["上路","中路"],desc:"持續利用邊線兵線迫使對手分兵處理。",plan:"兵線同步→邊線施壓→人數差開物件"},
 engage:{name:"強開團",roles:["輔助","打野","上路"],desc:"依靠先手控制主動製造團戰。",plan:"視野埋伏→先手開團→快速集火"},
 disengage:{name:"反開團",roles:["輔助","ADC","中路"],desc:"保護後排並懲罰對手強行進場。",plan:"保留控制→拉扯反打→追擊收割"},
 pick:{name:"抓單／視野窒息",roles:["輔助","打野","中路"],desc:"壓縮視野並利用落單製造人數差。",plan:"清視野→蹲伏抓單→轉化大物件"},
 rotation:{name:"換線／轉線",roles:["輔助","中路","ADC"],desc:"利用兵線與轉線速度取得塔皮、塔與人數差。",plan:"快速推線→提前轉點→多打少"},
 global:{name:"全圖支援",roles:["上路","中路","輔助"],desc:"依靠全球流與快速支援形成跨線人數優勢。",plan:"保留支援技能→跨線包夾→連續轉點"}
};
function ensureCareer20(){const p=state.player,pc=p.proCareer||{};pc.tactics=pc.tactics||{selected:"midjungle",mastery:{midjungle:62,botcarry:55,topside:52,split:45,teamfight:60,tempo:56,scaling:58,junglecarry:48,midcarry:64,doublecarry:58},history:[]};pc.tactics.mastery=pc.tactics.mastery||{};Object.keys(TACTIC_DEFS).forEach(k=>{if(!Number.isFinite(pc.tactics.mastery[k]))pc.tactics.mastery[k]=45});pc.clubEquity=pc.clubEquity||{team:pc.team||null,shares:{},dividends:0};pc.clubEquity.shares=pc.clubEquity.shares||{};pc.managementRelation=Number.isFinite(pc.managementRelation)?pc.managementRelation:70;pc.managementTasks=pc.managementTasks||[];pc.clubFinance=pc.clubFinance||{cash:180000000,revenue:0,expenses:0,merchRevenue:0,eventRevenue:0,sponsorRevenue:0,prizeRevenue:0,lastYear:state.date.year,dividendRate:.30,lastDividendYear:0,capitalRaised:0};pc.clubFinance.cash=Math.max(0,Number(pc.clubFinance.cash)||0);pc.clubFinance.debt=Math.max(0,Number(pc.clubFinance.debt)||0);pc.clubFinance.salaryArrears=Math.max(0,Number(pc.clubFinance.salaryArrears)||0);pc.clubFinance.loanPayment=Math.max(0,Number(pc.clubFinance.loanPayment)||0);pc.clubFinance.clubMerch=Array.isArray(pc.clubFinance.clubMerch)?pc.clubFinance.clubMerch:[];pc.clubFinance.financeCrisis=!!pc.clubFinance.financeCrisis;pc.agentRights=pc.agentRights||"部分戰隊代理";pc.merchShare=Number.isFinite(pc.merchShare)?pc.merchShare:.10;pc.legacy=pc.legacy||{starPower:0,rivals:{},enemies:{},apprentices:{},hallOfFame:{eligible:false,inducted:false,consideredYears:[]},postCareer:null};pc.mediaNetwork=pc.mediaNetwork||[];ensureCoachProfile();return pc}
function rosterRoleRating(role){const pc=state.player.proCareer,me=role===(state.player.role==="下路"?"ADC":state.player.role)?avg():0,x=(pc.roster||[]).filter(v=>!v.isSub&&(v.role===role||(role==="ADC"&&v.role==="下路"))).map(rosterRating);return Math.max(me,...x,62)}
function roleHeroReadiness(role){const p=state.player;if(role===(p.role==="下路"?"ADC":p.role)){const vals=Object.values(p.mastery||{}).map(x=>Number(x?.level)||0).sort((a,b)=>b-a).slice(0,4);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:Math.round(p.stats?.英雄池||60)}const pc=p.proCareer,member=(pc.roster||[]).filter(x=>!x.isSub&&(x.role===role||(role==="ADC"&&x.role==="下路"))).sort((a,b)=>rosterRating(b)-rosterRating(a))[0];return clamp((rosterRating(member)||65)-4+stableAgeOffset((member?.name||role)+"hero",9),45,98)}
function tacticMetaFit(key){const m=state.world?.meta||{},txt=JSON.stringify(m);let v=0;if(key==="botcarry"&&/ADC|下路|射手/.test(txt))v+=5;if(key==="midjungle"&&/中路|打野|節奏/.test(txt))v+=4;if(key==="teamfight"&&/團戰|龍/.test(txt))v+=4;if(key==="scaling"&&/後期|發育/.test(txt))v+=4;if(key==="junglecarry"&&/打野|野區/.test(txt))v+=4;return v}
function tacticAbilityCeiling(key){const t=TACTIC_DEFS[key]||TACTIC_DEFS.midjungle,ratings=t.roles.map(rosterRoleRating),heroes=t.roles.map(roleHeroReadiness),core=Math.min(...ratings),roleAvg=ratings.reduce((a,b)=>a+b,0)/ratings.length,heroAvg=heroes.reduce((a,b)=>a+b,0)/heroes.length;return clamp(Math.round(core*.48+roleAvg*.27+heroAvg*.25),45,98)}
function tacticFit(key){ensureCareer20();const p=state.player,pc=p.proCareer,t=TACTIC_DEFS[key]||TACTIC_DEFS.midjungle,master=Math.min(pc.tactics.mastery[key]||45,tacticAbilityCeiling(key)),role=t.roles.reduce((a,r)=>a+rosterRoleRating(r),0)/t.roles.length,hero=t.roles.reduce((a,r)=>a+roleHeroReadiness(r),0)/t.roles.length,form=p.condition?.form||65,meta=tacticMetaFit(key),chem=teamChemistry(),coach=coachTacticScore();return clamp((master-50)*.08+(role-70)*.11+(hero-65)*.055+(form-60)*.025+(chem-55)*.02+(coach-65)*.035+meta*.12,-8,9)}
function coachProfileSeed(name){return {bp:58+stableAgeOffset(name+"bp",37),tactics:58+stableAgeOffset(name+"tac",37),meta:58+stableAgeOffset(name+"meta",37),adjust:58+stableAgeOffset(name+"adj",37),management:58+stableAgeOffset(name+"mgmt",37)}}
function ensureCoachProfile(){const pc=state.player.proCareer;if(!pc)return null;const coach=(pc.coaches||[]).find(x=>String(x.role||"").includes("主教練"))||(pc.coaches||[])[0];if(!coach)return null;coach.skills=coach.skills||coachProfileSeed(coach.name);coach.preferredTactics=coach.preferredTactics||Object.keys(TACTIC_DEFS).sort((a,b)=>stableAgeOffset(coach.name+b,100)-stableAgeOffset(coach.name+a,100)).slice(0,3);return coach}
function coachTacticScore(){const c=ensureCoachProfile();return c?((c.skills.tactics+c.skills.meta+c.skills.bp)/3):65}
function coachChooseTactic(reason="賽前"){const pc=ensureCareer20(),coach=ensureCoachProfile();let best=pc.tactics.selected||"midjungle",bestScore=-999;Object.keys(TACTIC_DEFS).forEach(k=>{const pref=coach?.preferredTactics?.includes(k)?1.2:0,noise=(100-(coach?.skills?.tactics||65))/18*(Math.random()-.5),score=tacticFit(k)+pref+noise;if(score>bestScore){bestScore=score;best=k}});pc.tactics.selected=best;pc.tactics.history.unshift({year:state.date.year,week:state.date.week,tactic:best,source:"教練",reason});return best}
function tacticMatchAdjustment(){const k=ensureCareer20().tactics.selected||"midjungle";return tacticFit(k)*.008}
function tacticsCard(){if(!isProfessionalStage())return "";const pc=ensureCareer20(),coach=ensureCoachProfile(),sel=pc.tactics.selected||"midjungle",fit=tacticFit(sel),ceil=tacticAbilityCeiling(sel),c=coach?.skills||{},defs=Object.entries(TACTIC_DEFS),overview=defs.map(([k,t])=>`${t.name} ${Math.round(pc.tactics.mastery[k]||45)}${coach?.preferredTactics?.includes(k)?"★":""}`).join("｜");return `<section class="card"><div class="row space"><h2>🧠 戰隊戰術體系</h2><span class="badge">教練安排：${TACTIC_DEFS[sel].name}</span></div><div class="notice">${TACTIC_DEFS[sel].desc}<br>執行方案：${TACTIC_DEFS[sel].plan||"依教練臨場安排"}<br>目前適配：${fit>=4?"非常適合":fit>=1?"適合":fit>-2?"普通":"不理想"}｜熟練度 ${Math.round(pc.tactics.mastery[sel])}／陣容上限約 ${ceil}</div>${coach?`<div class="small">主教練 ${coach.name}｜BP ${c.bp}｜戰術 ${c.tactics}｜版本 ${c.meta}｜臨場 ${c.adjust}｜管理 ${c.management}<br>擅長：${coach.preferredTactics.map(k=>TACTIC_DEFS[k].name).join("、")}</div>`:""}<details><summary>查看全部 ${defs.length} 套戰術熟練度</summary><div class="small" style="margin-top:8px;line-height:1.8">${overview}</div></details><div class="reply-grid"><button class="reply tactic-advice">💬 向教練提出戰術建議</button></div><div class="small">★代表主教練偏好。戰術熟練度主要透過 VS 戰隊訓練賽與正式實戰磨合；選手不能直接刷戰術等級，也不能指定正式比賽打法。</div></section>`}
function openTacticAdvice(){const options=[["midjungle","重視中野"],["botcarry","重視下路"],["topside","重視上半區"],["teamfight","加強團戰"],["sidepressure","加強邊線"],["objective","加強物件控制"],["tempo","加強前期"],["scaling","加強後期"]];modal(`<h2>💬 向教練提出戰術建議</h2><p class="small">你可以提出訓練方向，但Scrim與正式比賽最終由教練安排。</p><div class="reply-grid">${options.filter(([k])=>TACTIC_DEFS[k]).map(([k,n])=>`<button class="reply tactic-suggest" data-tactic="${k}">${n}</button>`).join("")}</div>${closeBtn()}`);document.querySelectorAll(".tactic-suggest").forEach(b=>b.onclick=()=>suggestTactic(b.dataset.tactic))}
function practiceTactic(k){if(!TACTIC_DEFS[k]||remain()<1)return;const pc=ensureCareer20(),ceil=tacticAbilityCeiling(k),cur=pc.tactics.mastery[k]||45;if(!consume(`戰術訓練：${TACTIC_DEFS[k].name}`,1))return;const room=Math.max(0,ceil-cur),gain=room<=0?0:Math.min(room,(room>15?rand(8,18)/10:rand(2,8)/10));pc.tactics.mastery[k]=clamp(cur+gain,0,100);rewardCoachTrustForTraining("戰術訓練",.45);state.logs.push(gain>0?`🧠 ${TACTIC_DEFS[k].name}訓練：熟練度 +${gain.toFixed(1)}（陣容上限約 ${ceil}）。`:`🧠 ${TACTIC_DEFS[k].name}訓練已接近目前陣容上限；需要選手成長、英雄池改善或補強才能突破。`);save();render()}
function suggestTactic(k){const pc=ensureCareer20(),coach=ensureCoachProfile(),trust=pc.coachTrust||50,chance=clamp(.18+trust*.004+(coach?.skills?.management||65)*.002, .2,.82),accepted=Math.random()<chance;pc.tactics.playerSuggestion={tactic:k,accepted,week:state.date.week};if(accepted){pc.tactics.selected=k;state.logs.push(`💬 你向教練提出「${TACTIC_DEFS[k].name}」方向，教練願意納入本週戰術準備。`)}else state.logs.push(`💬 你提出「${TACTIC_DEFS[k].name}」建議，但教練決定維持自己的戰術判斷。`);save();render();modal(`<h2>🧑‍🏫 戰術溝通</h2><p>${accepted?`教練接受你的意見，會把「${TACTIC_DEFS[k].name}」納入準備；正式比賽仍由教練最終決定。`:`教練聽取意見後沒有採納，正式比賽仍依教練團判斷。`}</p>${closeBtn()}`)}
function starPowerForPlayer(){const p=state.player,pc=ensureCareer20(),cs=pc.careerStats||{},ach=p.achievements||[];let n=Math.log10(Math.max(10,p.followers||0))*9+(cs.mvp||0)*1.1+(pc.worldChampionYear?18:0)+ach.filter(x=>/世界賽|MSI|冠軍|MVP/.test(x.name||x.title||"")).length*4+(p.adultLife?.careerReputation||50)*.18;pc.legacy.starPower=clamp(Math.round(n),0,100);return pc.legacy.starPower}
function starLabel(v){return v>=90?"超級巨星":v>=78?"明星選手":v>=65?"焦點選手":v>=50?"受到關注":"一般職業選手"}
function equityPct(){const pc=ensureCareer20(),e=pc.clubEquity;if(e.team!==pc.team){e.team=pc.team;e.shares=e.shares||{}}return Number(e.shares[pc.team]||0)}
function equityRights(pct){return pct>=34?"重大管理權":pct>=20?"正式管理指示權":pct>=10?"董事會影響力":pct>=5?"正式提案權":"財務投資"}
function equityPricePerPct(){const pc=state.player.proCareer,base=900000+(REGION_STRENGTH[pc.region||"PCS"]||75)*22000;return Math.round(base*(1+starPowerForPlayer()/180)/10000)*10000}
function clubEquityCard(){if(!isProfessionalStage())return "";const p=state.player,pc=ensureCareer20(),pct=equityPct(),price=equityPricePerPct(),md=pc.managementDirective,cf=pc.clubFinance,tasks=(pc.managementTasks||[]).slice(-3).reverse(),offer=cf.equityOffer;return `<section class="card"><div class="row space"><h2>🏢 ${pc.team} 股權／經營</h2><span class="badge">持股 ${pct.toFixed(1)}%</span></div><div class="notice">目前權力：${equityRights(pct)}｜管理層關係 ${Math.round(pc.managementRelation)}/100<br>估計每1%股權：NT$${price.toLocaleString()}<br>俱樂部現金 NT$${Math.round(cf.cash).toLocaleString()}｜銀行負債 NT$${Math.round(cf.debt||0).toLocaleString()}｜欠薪 NT$${Math.round(cf.salaryArrears||0).toLocaleString()}<br>本年營收 NT$${Math.round(cf.revenue).toLocaleString()}｜支出 NT$${Math.round(cf.expenses).toLocaleString()}${md?`<br>最近管理事項：${md.type}${md.role?`・${md.role}`:""}｜${md.status}`:""}</div>${offer?`<div class="notice badtext">📨 管理層因資金壓力提出增資：出售 ${offer.pct}% 新股份給夜鋒，價格 NT$${offer.price.toLocaleString()}。<div class="reply-grid"><button id="acceptClubEquityOffer" class="reply">認購股份</button><button id="declineClubEquityOffer" class="reply">暫不認購</button></div></div>`:""}<div class="reply-grid"><button class="reply equity-buy" data-pct="1">購買1%</button><button class="reply equity-buy" data-pct="5">購買5%</button>${pct>=20?`<button class="reply equity-direct" data-role="上路">補強上路</button><button class="reply equity-direct" data-role="打野">補強打野</button><button class="reply equity-direct" data-role="中路">補強中路</button><button class="reply equity-direct" data-role="ADC">補強ADC</button><button class="reply equity-direct" data-role="輔助">補強輔助</button><button class="reply equity-direct" data-role="替補">補充替補</button><button class="reply coach-change">🧑‍🏫 提案更換總教練</button><button id="capitalInjection" class="reply">💰 股東增資</button><button id="clubBankLoan" class="reply">🏦 申請銀行貸款</button><button id="clubSeekSponsor" class="reply">🤝 尋找戰隊贊助</button><button id="clubLaunchMerch" class="reply">👕 推出選手周邊</button>`:`<button class="reply coach-suggest">💬 建議評估總教練</button>`}</div>${tasks.length?`<div class="small">${tasks.map(x=>`📋 ${x.type}${x.role?`・${x.role}`:""}｜${x.status}${x.note?`｜${x.note}`:""}`).join("<br>")}</div>`:""}<div class="small">俱樂部現金不會低於0；資金不足會形成欠薪／債務並影響隊員心情。管理層可透過增資、貸款、贊助、周邊或出售選手籌資。</div></section>`}
function buyEquity(pct){const p=state.player,pc=ensureCareer20(),now=equityPct(),buy=Math.min(Number(pct)||0,49-now),cost=Math.round(equityPricePerPct()*buy);if(buy<=0)return modal(`<h2>🏢 股權</h2><p>目前無法再增加這筆持股。</p>${closeBtn()}`);if(p.cash<cost)return modal(`<h2>資金不足</h2><p>購買 ${buy}% 需要 NT$${cost.toLocaleString()}。</p>${closeBtn()}`);p.cash-=cost;pc.clubEquity.shares[pc.team]=now+buy;state.logs.push(`🏢 投資 ${pc.team}：購入 ${buy}% 股權，持股來到 ${(now+buy).toFixed(1)}%。`);save();render();modal(`<h2>🏢 股權購入完成</h2><p>持股 ${(now+buy).toFixed(1)}%｜${equityRights(now+buy)}</p>${closeBtn()}`)}
function equityDirective(role){const pc=ensureCareer20();if(equityPct()<20)return;const task={id:`mg-${Date.now()}`,type:"補強",role,status:"已受理",note:"球探部門開始盤點候選人",year:state.date.year,week:state.date.week,age:0};pc.managementTasks.push(task);pc.managementDirective=task;pc.recruitDemand={role,source:"股東正式指示",mandatoryResponse:true};state.logs.push(`📋 股東正式指示：要求 ${pc.team} 補強${role}，管理層已建立執行任務。`);save();render();modal(`<h2>📋 管理指示已受理</h2><p>補強「${role}」已建立正式任務。管理層將逐週回報候選、談判或失敗原因，不會永久停在「執行中」。</p>${closeBtn()}`)}

function coachChangeProposal(force=false){const pc=ensureCareer20(),pct=equityPct(),coach=ensureCoachProfile();if(force&&pct<20)return;const poor=((coach?.skills?.tactics||65)+(coach?.skills?.meta||65)+(coach?.skills?.adjust||65))/3<68||(pc.lossStreak||0)>=3;if(!force){const accept=poor||Math.random()<.35;pc.managementDirective={type:"教練評估",status:accept?"管理層同意進行評估":"管理層暫時支持現任教練",year:state.date.year,week:state.date.week};save();render();return modal(`<h2>🏢 管理層回覆</h2><p>${accept?"管理層已正式記錄你的意見，將評估近期戰術、版本理解與戰績。":"管理層認為目前尚未達到換帥門檻，會繼續觀察，但已正式回覆你的建議。"}</p>${closeBtn()}`)}const region=pc.region||fixedTeamRegion(pc.team)||"PCS",pool=coachNamesForTeam(pc.team+state.date.year+"new",region),candidate=pool[0];candidate.skills=coachProfileSeed(candidate.name);candidate.preferredTactics=Object.keys(TACTIC_DEFS).sort((a,b)=>stableAgeOffset(candidate.name+b,100)-stableAgeOffset(candidate.name+a,100)).slice(0,3);pc.pendingCoachCandidate=candidate;modal(`<h2>🧑‍🏫 總教練更換提案</h2><p>現任：${coach?.name||"未定"}</p><div class="notice"><strong>候選：${candidate.name}</strong><br>BP ${candidate.skills.bp}｜戰術 ${candidate.skills.tactics}｜版本 ${candidate.skills.meta}｜臨場 ${candidate.skills.adjust}｜管理 ${candidate.skills.management}<br>擅長：${candidate.preferredTactics.map(k=>TACTIC_DEFS[k].name).join("、")}</div><button id="confirmCoachChange" class="primary">正式推動更換</button>${closeBtn()}`);document.querySelector("#confirmCoachChange").onclick=()=>confirmCoachChange()}
function confirmCoachChange(){const pc=ensureCareer20(),cand=pc.pendingCoachCandidate;if(!cand)return;archiveCurrentCoaches(pc.team);const assistant=(pc.coaches||[]).find(x=>String(x.role||"").includes("助理"));pc.coaches=[{...cand,role:"主教練"},...(assistant?[assistant]:[])];pc.coachJoinedYear=state.date.year;pc.coachTrust=clamp((pc.coachTrust||50)-5,0,100);pc.managementDirective={type:"更換總教練",status:`已任命 ${cand.name}`,year:state.date.year,week:state.date.week};pc.pendingCoachCandidate=null;ensureProRoster();state.news.unshift(`🧑‍🏫 ${pc.team} 宣布更換總教練，由 ${cand.name} 接掌兵符。`);save();document.querySelector(".modal-backdrop")?.remove();render()}
function legacyRelationsCard(){if(!isProfessionalStage())return "";syncLegacyRelations();const pc=ensureCareer20(),l=pc.legacy,star=starPowerForPlayer(),r=Object.entries(pc.rivals||{}).sort((a,b)=>(b[1].meetings||0)-(a[1].meetings||0))[0];if(r&&!l.rivals[r[0]])l.rivals[r[0]]={name:r[0],meetings:r[1].meetings||0,respect:60};return `<section class="card"><h2>🌟 職業圈地位</h2><div class="stat-grid">${stat("明星度",`${star}/100`)}${stat("社會定位",starLabel(star))}${stat("宿敵",Object.keys(l.rivals).length)}${stat("仇敵",Object.keys(l.enemies).length)}${stat("徒弟",Object.keys(l.apprentices).length)}</div>${r?`<div class="notice">⚔️ 主要宿敵：${r[0]}｜正式交手 ${r[1].meetings||0} 次</div>`:""}<div class="small">宿敵是競技競爭；仇敵屬私人／職業敵對。重大背叛、隊內決裂或公開衝突可能形成仇敵；資深後可培養徒弟。</div><button id="seekApprentice" class="reply">🎓 尋找值得指導的新秀</button></section>`}
function hallScorePlayer(){const p=state.player,pc=ensureCareer20(),cs=pc.careerStats||{},ach=pc.achievements||[],world=ach.filter(x=>/世界賽冠軍/.test(x.name||x.title||"")).length+(pc.worldChampionYear?1:0),msi=ach.filter(x=>/MSI冠軍/.test(x.name||x.title||"")).length,dom=ach.filter(x=>/聯賽冠軍|國內聯賽冠軍/.test(x.name||x.title||"")).length;const grand=ach.some(x=>/大滿貫/.test(x.title||""))?12:0,golden=ach.filter(x=>/燦金之路/.test(x.title||"")).length*24,dyn=ach.filter(x=>/王朝之路/.test(x.title||"")).length*18,fmvp=ach.filter(x=>/決賽FMVP/.test(x.title||"")).length*16;return world*28+msi*14+dom*5+grand+golden+dyn+fmvp+(cs.mvp||0)*1.4+Math.max(0,(pc.careerStats?.matches||0)-120)*.035+starPowerForPlayer()*.12}

function ensureHallUniverse(){const pc=ensureCareer20();pc.hallUniverse=pc.hallUniverse||{records:[],profiles:{},lastEvalYear:null};return pc.hallUniverse}
function updateHallProfilesFromAwards(year){const pc=state.player.proCareer,h=ensureHallUniverse();Object.values(pc.regionalAwards||{}).filter((_,i)=>true).forEach(a=>{if(!a)return;const n=a.年度MVP;if(n&&n!=="未定"){const q=h.profiles[n]=h.profiles[n]||{name:n,mvp:0,eliteYears:0,worlds:0,msi:0,domestic:0};q.mvp++}});const db=ensureGlobalProDatabase();Object.values(db).forEach(reg=>Object.values(reg).forEach(roster=>roster.forEach(x=>{const q=h.profiles[x.name]=h.profiles[x.name]||{name:x.name,mvp:0,eliteYears:0,worlds:0,msi:0,domestic:0};if(x.rating>=90)q.eliteYears++;q.rating=x.rating;q.retired=!!x.retired;if(x.retired&&!q.retirementYear)q.retirementYear=year})));}
function evaluateHallOfFame(year){const pc=state.player.proCareer,h=ensureHallUniverse();if(h.lastEvalYear===year)return;h.lastEvalYear=year;updateHallProfilesFromAwards(year);const inducted=[];Object.values(h.profiles).forEach(q=>{if(!q.retired||year-(q.retirementYear||year)<3||q.inducted)return;const score=(q.mvp||0)*13+(q.eliteYears||0)*7+(q.worlds||0)*30+(q.msi||0)*16+(q.domestic||0)*5+(q.rating>=94?8:0);if(score>=105&&((q.mvp||0)>=3||(q.eliteYears||0)>=8)){q.inducted=true;q.inductedYear=year;inducted.push(q.name);h.records.unshift({year,name:q.name,type:"NPC"})}});if(inducted.length)state.news.unshift(`🏛️ ${year} 電競名人堂：${inducted.join("、")} 正式入選。`);else state.logs.push(`🏛️ ${year} 名人堂評選：本年度沒有任何退役選手達到極高入選標準，從缺。`)}
function syncLegacyRelations(){const pc=ensureCareer20(),l=pc.legacy;Object.values(pc.teamRuptures||{}).forEach(x=>{if(["決裂","冷戰共存","已解約","已轉隊"].includes(x.status)&&(x.severity||0)>=4)l.enemies[x.mate]=l.enemies[x.mate]||{name:x.mate,hostility:70,source:x.reason||"隊內決裂"}});Object.entries(pc.rivals||{}).forEach(([name,x])=>{if((x.meetings||0)>=3)l.rivals[name]=l.rivals[name]||{name,meetings:x.meetings,respect:60}})}
function apprenticeAction(){const p=state.player,pc=ensureCareer20(),l=pc.legacy;if(p.age<24)return modal(`<h2>🎓 師徒</h2><p>目前夜鋒仍處於職業生涯前中期，還沒有足夠資歷正式帶徒弟。</p>${closeBtn()}`);const db=ensureGlobalProDatabase(),pool=Object.values(db).flatMap(r=>Object.values(r).flat()).filter(x=>x.active&&!x.retired&&x.age<=21&&x.name!==p.name&&!l.apprentices[x.name]);if(!pool.length)return modal(`<h2>🎓 師徒</h2><p>目前沒有合適的新生代選手。</p>${closeBtn()}`);const x=pool.sort((a,b)=>b.rating-a.rating)[0];l.apprentices[x.name]={name:x.name,role:x.role,team:x.team,progress:10};addSocialAcquaintance(x.name,45,{isPro:true,role:x.role,team:x.team,age:x.age,identityType:"職業選手・徒弟",acquaintanceSource:"職業圈指導"});state.logs.push(`🎓 ${x.name} 開始固定向夜鋒請教，建立師徒關係。`);save();render()}
function hallOfFameCard(){if(!isProfessionalStage())return "";const pc=ensureCareer20(),h=pc.legacy.hallOfFame,score=hallScorePlayer(),status=h.inducted?"🏛️ 名人堂成員":score>=95?"傳奇級呼聲":score>=78?"熱門候選討論":score>=60?"開始受到評審關注":"尚未達到歷史級討論";return `<section class="card"><div class="row space"><h2>🏛️ 電競名人堂</h2><span class="badge">${status}</span></div><div class="small">由遊戲公司從所有職業選手的完整生涯評估。沒有固定入選名額，任何年度都可以0人入選；明星度高也不保證入選。正式門檻與評分不向玩家公開。</div></section>`}
function postCareerCard(){const p=state.player,pc=ensureCareer20();if(p.age<26&&!pc.legacy.postCareer)return "";return `<section class="card"><h2>🛤️ 生涯第二曲線</h2><div class="small">資深選手可以嘗試轉位置延長職業生命；退役後可走教練團、母校電競班、主播／賽評、管理層或股東經營。轉型不是必定成功。</div><div class="reply-grid"><button class="reply career-shift" data-path="轉輔助">嘗試轉輔助</button><button class="reply career-shift" data-path="教練準備">準備教練路線</button><button class="reply career-shift" data-path="主播準備">培養主播／賽評能力</button></div></section>`}
function careerShift(path){const p=state.player,pc=ensureCareer20(),chance=clamp(.25+(p.stats?.gameSense||p.stats?.decision||60)/180+(pc.coachTrust||50)/300-(p.age-28)*.018,.18,.82),ok=Math.random()<chance;pc.legacy.postCareer={path,progress:clamp((pc.legacy.postCareer?.progress||0)+(ok?18:7),0,100),lastResult:ok?"順利":"受挫"};state.logs.push(`${ok?"✅":"⚠️"} 生涯轉型「${path}」${ok?"取得明顯進展":"本階段適應不順，仍可繼續嘗試"}。`);save();render()}
function mediaNetworkCard(){if(!isProfessionalStage())return "";const pc=ensureCareer20(),major=majorMediaContext();return `<section class="card"><h2>🎙️ 媒體與電競圈</h2><div class="small">正式大型專訪只在季後賽、MSI、世界賽、重大轉會、明星退役、超級新秀等焦點事件出現；不再用一般媒體活動刷數值。</div>${pc.mediaNetwork.length?`<div class="notice">媒體人脈：${pc.mediaNetwork.slice(0,5).map(x=>`${x.name}（${x.job}）`).join("、")}</div>`:""}${major?`<div class="notice">📡 當前焦點：${major.title}<br>符合大型專訪條件，會在相關賽事／事件流程中觸發完整問答。</div>`:`<div class="small">目前沒有需要大型專訪的焦點事件。</div>`}</section>`}
function ensureMediaHost(){const pc=ensureCareer20(),jobs=["電競主播","賽事主持人","電競記者","賽後採訪主持","賽評"],names=["周子晴","林以辰","夏妍","陳洛","許芷晴","高宇衡"];let x=pc.mediaNetwork[0];if(!x){const name=names[stableAgeOffset(pc.team+state.date.year,names.length)],job=jobs[stableAgeOffset(name,jobs.length)];x={name,job,relation:30};pc.mediaNetwork.push(x);addSocialAcquaintance(name,30,{gender:/晴|妍|芷/.test(name)?"女":"男",age:22+stableAgeOffset(name,9),identityType:job,career:job,occupation:job,acquaintanceSource:"重大賽事專訪",romanceable:/晴|妍|芷/.test(name)})}return x}
function majorMediaContext(){if(!isProfessionalStage())return null;const pc=state.player.proCareer,phase=proAnnualPhase(),sn=pc.season||{};if(sn.phase==="季後賽"||/季後賽/.test(phase))return {key:"playoffs",title:"季後賽焦點專訪"};if(phase==="MSI")return {key:"msi",title:"MSI 國際賽專訪"};if(phase==="世界賽")return {key:"worlds",title:"世界賽焦點專訪"};if(isTransferWindow()&&(pc.transferRequest||pc.contractOffer||pc.managementDirective))return {key:"transfer",title:"轉會期重大動向專訪"};return null}
function startMajorInterview(ctx,after){const pc=ensureCareer20(),host=ensureMediaHost(),scheduled=currentScheduledProMatch(),opp=scheduled?.opp||currentProOpponent()?.name||"下一個對手";if(after==="match"&&scheduled?.opp)pc.lockedMatchOpponent=scheduled.opp;const questions=[{q:`${host.name}：「${ctx.title}即將開始。面對 ${opp}，你認為現在最重要的是什麼？」`,a:[["team","把團隊準備做好"],["confident","我們的目標就是贏"],["calm","先專注每一個細節"]]},{q:`${host.name}：「外界對夜鋒與 ${pc.team} 的期待很高，你如何面對這種關注？」`,a:[["team","壓力由全隊一起承擔"],["self","我會用表現回應"],["calm","不讓外界改變準備節奏"]]},{q:`${host.name}：「如果這次結果不如預期，你最希望外界記住什麼？」`,a:[["team","我們會一起承擔結果"],["confident","我們還沒想過輸"],["self","我會先檢討自己"]]}];pc.activeInterview={ctx,host,questions,index:0,answers:[],after};showInterviewQuestion()}
function showInterviewQuestion(){const pc=ensureCareer20(),iv=pc.activeInterview;if(!iv)return;const x=iv.questions[iv.index];modal(`<h2>🎙️ ${iv.ctx.title}</h2><p class="small">${iv.host.name}｜${iv.host.job}</p><p>${x.q}</p><div class="reply-grid">${x.a.map(([v,t])=>`<button class="reply interview-answer" data-a="${v}">${t}</button>`).join("")}</div>`);document.querySelectorAll(".interview-answer").forEach(b=>b.onclick=()=>answerMajorInterview(b.dataset.a))}
function answerMajorInterview(a){const p=state.player,pc=ensureCareer20(),iv=pc.activeInterview;if(!iv)return;iv.answers.push(a);if(a==="team"){p.adultLife.careerReputation=clamp(p.adultLife.careerReputation+.5,0,100);mediaTrait("護隊友",1)}if(a==="confident"){p.followers+=rand(80,240);mediaTrait("自信",1)}if(a==="self")p.stats.心態=clamp((p.stats.心態||60)+.08,0,100);if(a==="calm")p.stress=clamp(p.stress-1,0,100);iv.index++;document.querySelector(".modal-backdrop")?.remove();if(iv.index<iv.questions.length)return showInterviewQuestion();const after=iv.after,host=iv.host;pc.mediaHistory=pc.mediaHistory||[];pc.mediaHistory.unshift({year:state.date.year,week:state.date.week,title:iv.ctx.title,host:host.name,answers:[...iv.answers]});pc.activeInterview=null;state.logs.push(`🎙️ 完成 ${iv.ctx.title}，由 ${host.name} 主持，共回答 ${iv.questions.length} 題。`);save();render();modal(`<h2>📺 專訪結束</h2><p>${host.name}：「謝謝夜鋒接受訪問，接下來就讓比賽說話。」</p><button id="finishMajorInterview" class="primary">繼續</button>`);document.querySelector("#finishMajorInterview").onclick=()=>{document.querySelector(".modal-backdrop")?.remove();if(after==="match"){const im=currentInternationalMatch();if(im&&im.international)runInternationalMatch();else runRichLeagueMatch()}}}

function career(){
 ensureV10();const p=state.player;
 return `${proCareerCard()}${competitiveFormCard()}${tacticsCard()}${clubEquityCard()}${legacyRelationsCard()}${hallOfFameCard()}${postCareerCard()}${mediaNetworkCard()}${proTeamPageCard()}${recentProMatchCard()}${playoffBracketCard()}${annualCalendarCard()}${transferMarketCard()}${freeAgentCard()}${internationalCard()}${internationalGroupsCard()}${bigMatchStoryCard1979()}${clubMerchCard1982()}${championMerchCard1979()}${achievementCard()}${contractCenter()}${contractLookupCard()}${reputationDetailCard()}${donationCard()}${sponsorCard()}${commercialCard()}${fanMeetingCard()}${teamBuildingCard()}${legalMediaCard()}${assetCard()}${privatePartyCard()}${alumniCard()}${leaveCard()}${pregnancyCard()}${marriageCard()}${teamRuptureCard()}${healthCard()}<section class="card"><h2>生涯中心</h2><div class="stat-grid">${isProfessionalStage()?stat("職業風評",Math.round(p.adultLife.careerReputation))+stat("黑粉",p.publicImage?.haters||0):stat("學業",Math.round(p.school))+stat("家庭支持",Math.round(p.family))}${stat("粉絲",p.followers)}${isProfessionalStage()?stat("大眾評價",Math.round(ensureAudienceRating().rating)):""}${stat("聲譽",p.reputation)}</div></section>
 ${worldCards()}${isProfessionalStage()?metaCard()+financeCard():amateurCard()}${shopCard()}${masteryCard()}
 <section class="card"><h2>💾 存檔與救援</h2><div class="reply-grid"><button id="exportSaveBtn" class="reply">匯出 JSON 存檔</button><button id="importSaveBtn" class="reply">匯入 JSON 存檔</button><button id="recoverW15Btn" class="reply">🛠️ 回朔第15週星期五早上</button><button id="repairAdvanceBtn" class="reply">🔧 修復目前行程鎖定</button></div><input id="importSaveFile" type="file" accept=".json,application/json" style="display:none"><div class="small">回朔救援會保留角色能力、Rank、金錢、人際與裝備，重置第15週星期五當日狀態並重建電競社課。</div></section>
 <section class="card"><h2>版本</h2><div class="log"><strong>V1.9.8.2</strong>｜俱樂部財務・仇敵互動：俱樂部現金不再為負；新增欠薪、貸款、增資邀請、戰隊贊助、選手周邊；仇人改用獨立衝突／和解互動。</div></section>`;
}
function bind(){
 document.querySelector(".tactic-advice")?.addEventListener("click",openTacticAdvice);document.querySelectorAll(".tactic-suggest").forEach(b=>b.onclick=()=>suggestTactic(b.dataset.tactic));document.querySelectorAll(".equity-buy").forEach(b=>b.onclick=()=>buyEquity(+b.dataset.pct));document.querySelectorAll(".equity-direct").forEach(b=>b.onclick=()=>equityDirective(b.dataset.role));document.querySelectorAll(".career-shift").forEach(b=>b.onclick=()=>careerShift(b.dataset.path));document.querySelector(".coach-suggest")?.addEventListener("click",()=>coachChangeProposal(false));document.querySelector(".coach-change")?.addEventListener("click",()=>coachChangeProposal(true));document.querySelector("#capitalInjection")?.addEventListener("click",injectClubCapital);document.querySelector("#clubBankLoan")?.addEventListener("click",()=>clubTakeLoan1982(false));document.querySelector("#clubSeekSponsor")?.addEventListener("click",()=>clubSeekSponsor1982(false));document.querySelector("#clubLaunchMerch")?.addEventListener("click",launchClubMerch1982);document.querySelector("#acceptClubEquityOffer")?.addEventListener("click",acceptClubEquityOffer1982);document.querySelector("#declineClubEquityOffer")?.addEventListener("click",declineClubEquityOffer1982);document.querySelector("#seekApprentice")?.addEventListener("click",apprenticeAction);
 document.querySelectorAll(".action-btn").forEach(b=>b.onclick=()=>act(b.dataset.action));document.querySelector("#doTryout")?.addEventListener("click",doProTryout);document.querySelector("#signProContract")?.addEventListener("click",signProContract);document.querySelector("#counterOffer")?.addEventListener("click",counterInitialOffer);document.querySelector("#declineOffer")?.addEventListener("click",declineInitialOffer);document.querySelector("#playLeagueMatch")?.addEventListener("click",playLeagueMatch);document.querySelector("#askRaise")?.addEventListener("click",()=>negotiateContract("raise"));document.querySelector("#offerCut")?.addEventListener("click",()=>negotiateContract("cut"));document.querySelector("#requestTransfer")?.addEventListener("click",()=>negotiateContract("transfer"));document.querySelector("#earlyRenewal")?.addEventListener("click",earlyRenewalTalk);document.querySelectorAll(".pregnancy-talk").forEach(b=>b.onclick=()=>pregnancyDecisionByName(b.dataset.name));document.querySelectorAll(".child-choice").forEach(b=>b.onclick=()=>childSupportDecision(b.dataset.name,b.dataset.choice));document.querySelectorAll(".sponsor-action").forEach(b=>b.onclick=()=>sponsorAction(b.dataset.action));document.querySelector("#launchMerch")?.addEventListener("click",launchSponsorMerch);document.querySelectorAll(".donate-btn").forEach(b=>b.onclick=()=>makeDonation(+b.dataset.amt));document.querySelector("#proposeMarriage")?.addEventListener("click",proposeMarriage);document.querySelector("#marriageTalk")?.addEventListener("click",resolveMarriageCrisis);document.querySelector("#prAction")?.addEventListener("click",openPRResponse);document.querySelector("#suggestRecruit")?.addEventListener("click",openRecruitSuggestionV1918);document.querySelector("#contractDemands")?.addEventListener("click",contractDemandTalk);document.querySelector("#stiScreen")?.addEventListener("click",doStiScreen);document.querySelectorAll(".rupture-talk").forEach(b=>b.onclick=()=>{resolveTeamRupture(b.dataset.mate);save();render()});document.querySelectorAll(".asset-buy").forEach(b=>b.onclick=()=>buyAsset(b.dataset.id));document.querySelector("#normalPrivateParty")?.addEventListener("click",()=>runPrivateParty(false));document.querySelector("#adultPrivateParty")?.addEventListener("click",()=>runPrivateParty(true));document.querySelectorAll(".alumni-donate").forEach(b=>b.onclick=()=>alumniDonate(+b.dataset.amt));document.querySelector("#fanMeeting")?.addEventListener("click",runFanMeeting);document.querySelector("#teamBuilding")?.addEventListener("click",runTeamBuilding);document.querySelector("#seekCommercial")?.addEventListener("click",seekCommercial);document.querySelectorAll(".legal-action").forEach(b=>b.onclick=()=>handleLegalAction(b.dataset.a));document.querySelector("#hireLawyer")?.addEventListener("click",()=>hireMediaTeam(1));document.querySelector("#hirePRTeam")?.addEventListener("click",()=>hireMediaTeam(2));document.querySelector("#leakSomeone")?.addEventListener("click",leakSomeone);document.querySelectorAll(".support-settlement").forEach(b=>b.onclick=()=>openSupportSettlement(b.dataset.name));document.querySelectorAll(".leave-request").forEach(b=>b.onclick=()=>requestCoachLeave(b.dataset.reason));document.querySelector("#main")?.addEventListener("click",e=>{const b=e.target.closest?.(".birth-event");if(b){e.preventDefault();e.stopPropagation();b.dataset.pregId?resolveBirthEventById(b.dataset.pregId):resolveBirthEvent(b.dataset.name)}});document.querySelectorAll(".child-care-action").forEach(b=>b.onclick=()=>spendTimeWithChild(b.dataset.name));document.querySelectorAll(".infant-care-action").forEach(b=>b.onclick=()=>infantCare(b.dataset.name));document.querySelectorAll(".legacy-birth-choice").forEach(b=>b.onclick=()=>recordLegacyBirthChoice(b.dataset.name,b.dataset.choice));document.querySelectorAll(".legacy-child-choice").forEach(b=>b.onclick=()=>childSupportDecision(b.dataset.name,b.dataset.choice));document.querySelector("#injuryTreat")?.addEventListener("click",treatInjury);document.querySelector("#injuryRehab")?.addEventListener("click",rehabInjury);document.querySelector("#healthCheck")?.addEventListener("click",generalHealthCheck);document.querySelector("#stiTreat")?.addEventListener("click",treatSti);document.querySelector("#viewLastMatchReport")?.addEventListener("click",showMatchReport);document.querySelector("#viewMatchReview")?.addEventListener("click",showMatchReview);document.querySelector("#resumePostInterview")?.addEventListener("click",showPostMatchMedia);
 document.querySelector("#nextDayBtn")?.addEventListener("click",nextDay);
 document.querySelectorAll(".message-open").forEach(b=>b.onclick=e=>{e.preventDefault();openMessage(b.dataset.msg)});
 document.querySelector("#cleanupMessages")?.addEventListener("click",()=>{cleanupOldMessages(true);save();render()});document.querySelectorAll(".fa-offer").forEach(b=>b.addEventListener("click",()=>acceptFreeAgentOffer(+b.dataset.i)));
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
function syncTournamentSchedule(){if(isProfessionalStage())return;if(!state.world?.tournaments)return;state.world.tournaments.forEach(t=>{if(!["進行中","等待下一輪"].includes(t.status))return;if(t.nextWeek<state.date.week){t.nextWeek=state.date.week;t.status="進行中"}if(t.nextWeek===state.date.week){const d=t.nextDay||6;if(state.date.day>d){t.nextWeek=state.date.week+1;t.status="等待下一輪";return}t.status="進行中";if(!(state.weeklyPlan?.[d]||[]).some(e=>e.tournamentId===t.id&&!e.completed))addPlan(d,{id:"round-"+t.id+"-"+t.roundIndex,title:`${t.name}｜${t.rounds[t.roundIndex]}`,slot:"全天",type:"amateurTournament",lockDay:true,completed:false,tournamentId:t.id,week:state.date.week,roster:t.roster,desc:`正式比賽日：${t.rounds[t.roundIndex]}。全天鎖定，只能比賽。`})}})}
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
 document.querySelector("#continueTournamentSignup").onclick=()=>{document.querySelector(".modal-backdrop")?.remove();if(!maybeIncomingTournamentInvite(x,info))openTeamBuilder({...x,targetWeek:info.week,targetDay:info.day})};
}
function flexibleRole(name,targetRole){const c=state.characters?.[name],base=normalizeRole(esportsRole(name)),rel=state.player.relations?.[name]||0;if(!c||base===targetRole)return base===targetRole;const tr=safeTraits(c);return rel>=72&&(tr.includes("努力")||tr.includes("溫柔")||tr.includes("老實")||rel>=88)?targetRole:null}
function openTeamPage(){const p=state.player,t=p.team;if(!t.formed){const cs=tournamentCandidates().filter(c=>c.relation>=45).slice(0,12);document.querySelector("#main").innerHTML=`<section class="card"><h2>🛡️ 成立固定戰隊</h2><p>選四名熟識的電競好友成立固定五人隊。團練會特別提升<strong>溝通、團戰、決策</strong>。</p><div class="notice">高好感的部分好友願意為了與你同隊更換位置。</div><div class="reply-grid">${cs.map(c=>`<button class="reply team-pick" data-name="${c.name}">${c.name}<div class="small">${c.role}｜關係 ${Math.round(c.relation)}</div></button>`).join("")||"目前熟識的電競好友還不夠。"}</div><div id="teamPickInfo" class="log">已選：無</div><button id="createFixedTeam" class="primary" disabled>成立戰隊</button></section>`;let a=[];document.querySelectorAll(".team-pick").forEach(b=>b.onclick=()=>{let n=b.dataset.name;a=a.includes(n)?a.filter(x=>x!==n):(a.length<4?[...a,n]:a);b.classList.toggle("selected",a.includes(n));document.querySelector("#teamPickInfo").textContent=`已選：${a.join("、")||"無"}`;document.querySelector("#createFixedTeam").disabled=a.length!==4});document.querySelector("#createFixedTeam").onclick=()=>{p.team={name:`${p.name}戰隊`,members:a,formed:true,trainingCount:0};a.forEach(n=>p.relations[n]=clamp((p.relations[n]||0)+2,0,100));state.logs.push(`🛡️ 固定戰隊成立：${a.join("、")}。`);save();render();modal(`<h2>🛡️ 戰隊成立</h2><p>${p.team.name}</p>${closeBtn()}`)};return}modal(`<h2>🛡️ ${t.name}</h2><p>隊員：${t.members.join("、")}</p><p>團練 ${t.trainingCount||0} 次</p><button id="fixedTeamTrain" class="primary">🎮 一起團練</button>${closeBtn()}`);document.querySelector("#fixedTeamTrain").onclick=trainFixedTeam}
function trainFixedTeam(){const p=state.player,t=p.team;if(!t?.formed||remain()<1)return;if(!consume("固定戰隊團練",1))return;const gs=[["溝通",addAbilityGrowth("溝通",Math.random()*.13+.18)],["團戰",addAbilityGrowth("團戰",Math.random()*.09+.10)],["決策",addAbilityGrowth("決策",Math.random()*.07+.07)]];t.trainingCount=(t.trainingCount||0)+1;t.members.forEach(n=>p.relations[n]=clamp((p.relations[n]||0)+1,0,100));p.energy=clamp(p.energy-9,0,100);state.logs.push(`🛡️ 團練：${gs.map(x=>`${x[0]} +${x[1].toFixed(2)}`).join("、")}。`);save();render();modal(`<h2>🎮 團練完成</h2><div class="notice goodtext">${gs.map(x=>`${x[0]} +${x[1].toFixed(2)}`).join("<br>")}</div>${closeBtn()}`)}
function maybeIncomingTournamentInvite(x,info){const p=state.player;if(p.team?.formed||Math.random()>=.32)return false;const cs=tournamentCandidates().filter(c=>c.relation>=35);if(!cs.length)return false;const cap=cs[rand(0,cs.length-1)];modal(`<h2>📩 收到參賽邀請</h2><p><strong>${cap.name}</strong>主動邀請你加入他們參加 <strong>${x.name}</strong>。</p><div class="notice">📅 ${info.label}</div><button id="acceptIncomingCup" class="primary">加入他們</button><button id="declineIncomingCup" class="ghost">婉拒，自己組隊</button>${closeBtn()}`);document.querySelector("#acceptIncomingCup").onclick=()=>{const need=["上路","打野","中路","ADC","輔助"].filter(r=>r!==normalizeRole(p.role)),picked={},accepted={};need.forEach((r,i)=>{let n=i===0?cap.name:discoverTeammate(r,`${cap.name}的隊伍`);picked[r]=n;accepted[n]=true});document.querySelector(".modal-backdrop")?.remove();confirmTeamSignup({...x,targetWeek:info.week,targetDay:info.day},picked,accepted)};document.querySelector("#declineIncomingCup").onclick=()=>{document.querySelector(".modal-backdrop")?.remove();openTeamBuilder({...x,targetWeek:info.week,targetDay:info.day})};return true}
function tournamentCandidates(){
 return Object.values(state.characters).filter(c=>c.known&&c.name!==state.player.name&&isEsportsFriend(c.name))
 .map(c=>({name:c.name,role:esportsRole(c.name),relation:state.player.relations[c.name]||0,rank:(state.friends?.[c.name]?.rank||"未紀錄")+((state.friends?.[c.name]?.lp??null)!==null?` ${state.friends[c.name].lp}LP`:"")+((state.friends?.[c.name]?.form??0)>=8?" 🔥":(state.friends?.[c.name]?.form??0)<=-8?" ❄️":"")}));
}
function discoverTeammate(role,source){
 const pools={
  上路:["承翰","Leo","柏宇","若彤","夏寧","顧明哲","葉承恩","周亦凡","林佳穎"],
  打野:["宇辰","小凱","Rin","凜月","語芯","陳昱翔","沈子謙","許庭安","唐雨彤"],
  中路:["子墨","Aki","哲宇","沐晴","星妍","江以辰","蘇柏翰","林昕妍","葉思晴"],
  ADC:["曜廷","Ming","小楓","心妤","若璃","陳皓宇","許家維","周語柔","林芷涵"],
  輔助:["恩碩","Naru","家豪","雨柔","可欣","王奕安","李承祐","陳若希","沈安琪"]
 };
 const pool=pools[role]||[];let name=pool.find(n=>!state.characters[n]);
 if(!name){name=`${["晨","景","昱","宥","子","若","語","安"][stableAgeOffset(source+role+state.date.week,8)]}${["衡","澤","晴","寧","辰","希","妍","宇"][stableAgeOffset(role+source+state.date.year,8)]}`;if(state.characters[name])name+=String(state.date.year).slice(-2)}
 const female=/若彤|夏寧|凜月|語芯|沐晴|星妍|心妤|若璃|雨柔|可欣|佳穎|雨彤|思晴|語柔|芷涵|若希|安琪|晴|妍|希|寧/.test(name),gender=female?"女":"男";
 state.characters[name]={name,known:true,gender,romanceable:female,role,playsGame:true,identityType:"業餘玩家",acquaintanceSource:source,desc:`透過${source}認識的業餘電競玩家，主打${role}。`};
 state.characters[name].traits=fallbackTraits(state.characters[name]);state.player.relations[name]=rand(18,32);
 if(!state.friends)state.friends={};state.friends[name]={known:true,relation:state.player.relations[name],role,rank:["白金 I","翡翠 III","翡翠 I","鑽石 IV"][rand(0,3)]};
 state.logs.push(`新好友：透過${source}認識了${name}（${gender}・業餘${role}）。`);save();return name;
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
   return tournamentCandidates().flatMap(c=>{const base=normalizeRole(c.role),a=need.includes(base)?[{...c,role:base}]:[];need.forEach(r=>{if(r!==base&&flexibleRole(c.name,r))a.push({...c,role:r,rank:c.rank+" 🔄願意轉位"})});return a});
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
 const heartbreak=(p.emotion?.betrayalUntil||0)>=state.date.week?5:0,cohesion=p.team?.formed?Math.min(4,(p.team.trainingCount||0)*.35):0,bonus=(v==="carry"?2:v==="stable"?1:0)+cohesion,teamPower=amateurTeamPower(t)-heartbreak,enemyPower=66+t.roundIndex*4+(t.tier==="scout"?10:t.tier==="regional"?8:t.tier==="city"?7:t.tier==="sponsor"?5:t.tier==="school"?3:0)+rand(-8,8),winChance=clamp(.53+(teamPower+bonus-enemyPower)/92,.22,.84),win=Math.random()<winChance;amateurRelations(t,win);
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
function adultPrivateEvent(name,kind="lover"){
 const p=state.player,c=state.characters?.[name];p.condition=p.condition||{privateRecent:0,fatigue:0,form:65,injury:null};p.adultLife=p.adultLife||{enabled:p.age>=18};p.adultLife.pregnancies=p.adultLife.pregnancies||[];if(p.age<18||!p.adultLife?.enabled){modal(`<h2>尚未開放</h2><p>此內容只在主角成年後開放。</p>${closeBtn()}`);return}
 if(remain()<1){modal(`<h2>私人約會</h2><p>今天已經沒有剩餘時段。</p>${closeBtn()}`);return}const established=kind==="spouse"||kind==="partner";if(!consume(established?(kind==="spouse"?"夫妻親密時光":"親密相處"):"私人約會",1)){modal(`<h2>私人約會</h2><p>目前無法安排這次約會。</p>${closeBtn()}`);return}
 stiRiskEvent(name,kind==="fan"?"一次性關係":kind==="spouse"?"夫妻關係":kind==="partner"?"伴侶關係":"私人關係");
 let cost=0;if(name==="許安然"){cost=3000;if(p.cash<cost){modal(`<h2>現金不足</h2><p>這次見面需要 NT$${cost.toLocaleString()}。</p>${closeBtn()}`);return}p.cash-=cost}
 p.energy=clamp(p.energy-15,0,100);p.mood=clamp(p.mood+5,0,100);p.condition.privateRecent=(p.condition.privateRecent||0)+1;p.condition.fatigue=clamp(p.condition.fatigue+8,0,100);
 if(p.romance?.spouse&&name!==p.romance.spouse)registerAffair(name);
 if(p.condition.privateRecent>=3){p.condition.form=clamp(p.condition.form-rand(3,7),0,100);if(Math.random()<.18&&!p.condition.injury)p.condition.injury={type:["腰背疲勞","肩頸不適","睡眠不足"][rand(0,2)],severity:"輕微",days:rand(2,5)};}p.relations[name]=clamp((p.relations[name]||40)+2,0,100);
 const pregnancyRisk=c?.gender==="女"&&Math.random()<.08;if(pregnancyRisk){p.adultLife.pregnancies.push({name,week:state.date.week,year:state.date.year,status:"可能懷孕"});state.logs.push(`私人事件：${name}之後出現懷孕可能，需要後續確認。`)}
 let caught=false;if(kind==="fan"&&(p.romance.partners||[]).length&&Math.random()<.28){caught=true;(p.romance.partners||[]).forEach(n=>p.relations[n]=clamp((p.relations[n]||0)-rand(8,16),0,100));changeEthics(-4,"對伴侶不忠被發現");state.logs.push("感情風波：戀人發現你與女粉絲有私下關係。這屬於私人關係問題，未公開前不影響職業風評。")}
 save();render();modal(`<h2>${kind==="spouse"?"❤️ 夫妻親密時光":kind==="partner"?"❤️ 親密相處":"🌙 私人時間"}</h2><p>你與 ${name} ${kind==="spouse"?"度過了夫妻間的親密時光":kind==="partner"?"以伴侶身分親密相處":"度過了一段私人的成人時間"}。</p>${cost?`<div class="notice">本次花費 NT$${cost.toLocaleString()}。</div>`:""}${pregnancyRisk?`<div class="notice">之後可能出現懷孕相關事件。</div>`:""}${caught?`<div class="notice badtext">⚠️ 戀人得知此事，關係明顯下降。</div>`:""}${closeBtn()}`);
}
function meetFemaleFan(){
 const p=state.player;
 if(p.age<18){
   modal(`<h2>💌 女粉絲</h2><p>成年後才會開放成人粉絲事件。</p>${closeBtn()}`);
   return;
 }
 if(p.followers<300){
   modal(`<h2>💌 女粉絲</h2><p>目前粉絲人氣還不足，累積至少 300 名粉絲後才可能觸發。</p>${closeBtn()}`);
   return;
 }
 if(remain()<1){
   modal(`<h2>💌 女粉絲</h2><p>今天已經沒有剩餘時段。</p>${closeBtn()}`);
   return;
 }

 const named=Math.random()<.22;
 let name=named?["夏語晴","林沐妍","許若曦","陳心妤"][rand(0,3)]:`女粉絲${rand(100,999)}`;
 while(state.characters?.[name]&&!named)name=`女粉絲${rand(100,999)}`;

 const intent=named
   ?(Math.random()<.45?"想發展關係":Math.random()<.65?"願意維持固定關係":"保持聯絡")
   :"一次性互動";

 state.characters[name]={
   ...(state.characters[name]||{}),
   name,known:named,gender:"女",age:Math.max(18,p.age+rand(-3,3)),
   romanceable:named&&intent!=="保持聯絡",
   role:"粉絲",identityType:"女粉絲",acquaintanceSource:"直播／社群",
   relationshipType:intent==="願意維持固定關係"?"炮友":null,
   desc:`透過直播與社群認識的成年女性粉絲。${named?"目前傾向："+intent:""}`,
   traits:["熱情","粉絲"],temporaryFan:!named
 };
 p.relations[name]=p.relations[name]??rand(35,55);
 p.adultLife=p.adultLife||{};
 p.adultLife.fanIncidents=(p.adultLife.fanIncidents||0)+1;

 // 觸發女粉絲事件即代表雙方自願進入私人關係事件。

 // 使用 1 個時段，結果完全在此函式結算，
 // 避免 adultPrivateEvent 的 render/modal 把視窗蓋掉。
 if(!consume("女粉絲私人互動",1)){
   if(!named){delete state.characters[name];delete p.relations[name]}
   modal(`<h2>💌 女粉絲</h2><p>目前無法安排這次互動。</p>${closeBtn()}`);
   return;
 }

 try{stiRiskEvent(name,"女粉絲私人關係")}catch(e){console.warn("stiRiskEvent",e)}
 p.energy=clamp(p.energy-15,0,100);
 p.mood=clamp(p.mood+5,0,100);
 p.condition=p.condition||{};
 p.condition.privateRecent=(p.condition.privateRecent||0)+1;
 p.condition.fatigue=clamp((p.condition.fatigue||0)+8,0,100);
 p.relations[name]=clamp((p.relations[name]||40)+2,0,100);

 if(p.romance?.spouse){
   try{registerAffair(name)}catch(e){console.warn("registerAffair",e)}
 }

 let pregnancyRisk=false;
 p.adultLife.pregnancies=p.adultLife.pregnancies||[];
 if(Math.random()<.08){
   const already=p.adultLife.pregnancies.some(pg=>pg.name===name&&!pg.born&&pg.status!=="已結束");
   if(!already){
     pregnancyRisk=true;
     p.adultLife.pregnancies.push({
       name,week:state.date.week,year:state.date.year,progressWeeks:0,
       status:"可能懷孕",birthPending:false,source:"女粉絲事件"
     });
     state.characters[name].known=true;
     state.characters[name].important=true;
     state.characters[name].temporaryFan=false;
     state.logs.push(`🤰 女粉絲事件後，${name} 出現懷孕可能，需要後續確認。`);
   }
 }

 let caught=false;
 if((p.romance?.partners||[]).length&&Math.random()<.28){
   caught=true;
   (p.romance.partners||[]).forEach(n=>p.relations[n]=clamp((p.relations[n]||0)-rand(8,16),0,100));
   changeEthics(-4,"對伴侶不忠被發現");
   state.logs.push("感情風波：戀人發現你與女粉絲有私下關係。未公開前不影響職業風評。");
 }

 state.logs.push(`💌 女粉絲事件：你與 ${name} 發生了關係${pregnancyRisk?"，之後出現懷孕可能":""}。`);

 const resultText=pregnancyRisk
   ?`你與 <strong>${name}</strong> 發生了關係。之後她告訴你，<strong>可能懷孕了</strong>。`
   :`你與 <strong>${name}</strong> 發生了關係。`;

 // 匿名粉絲若沒有重要後續不留社交；具名粉絲永久保留。
 if(!named&&!pregnancyRisk){
   delete state.characters[name];delete p.relations[name];
 }else if(named){
   state.characters[name].known=true;state.characters[name].socialContact=true;state.characters[name].temporaryFan=false;
 }

 save();
 render();
 modal(`<h2>💌 女粉絲事件結果</h2><p>${resultText}</p>${named?`<div class="notice">${name} 已加入社交好友。</div>`:""}${caught?`<div class="notice badtext">⚠️ 戀人得知此事，關係下降。</div>`:""}${closeBtn()}`);
}
function maybePublicRomanceScandal(){
 const p=state.player,partners=p.romance?.partners||[];if(partners.length<2&&!p.adultLife?.fanIncidents)return;
 const risk=clamp(.03+partners.length*.025+(p.reputation||0)*.0005,0,.18);if(Math.random()>=risk)return;
 p.adultLife.publicRomanceKnown=true;changeCareerRep(-rand(4,9),"私人感情風波遭公開");p.proAttention=clamp(p.proAttention-rand(1,4),0,100);state.world.news.unshift(`場外話題：夜鋒複雜的私人感情關係在社群引發討論，部分戰隊開始評估他的職業形象。`);state.logs.push("⚠️ 私生活被公開後才影響職業風評；未曝光時不影響。");
}
function graduationChoice(){
 const p=state.player;if(p.adultLife.graduationPath)return;
 modal(`<h2>🎓 畢業道路</h2><p>高中即將結束，你必須決定下一階段。</p><button id="gradPro" class="primary">🎮 全力進入職業圈</button><button id="gradUni" class="ghost">🏫 進入大學繼續磨練</button>${closeBtn()}`);
 document.querySelector("#gradPro").onclick=()=>{p.adultLife.graduationPath="職業圈";p.proCareer=p.proCareer||{};p.proCareer.stage="scouting";p.proAttention=clamp(p.proAttention+5,0,100);state.logs.push("🎓 畢業選擇：全力挑戰職業圈。");save();render()};
 document.querySelector("#gradUni").onclick=()=>{p.adultLife.graduationPath="大學";p.stats.遊戲理解=clamp(p.stats.遊戲理解+1,0,100);p.stats.心態=clamp(p.stats.心態+1,0,100);state.logs.push("🎓 畢業選擇：進入大學，同時繼續訓練。");save();render()};
}


const META_ARCHETYPES=["刺客節奏","控制法師","後期團戰","中野聯動","邊線營運"];
function proIdentity(name){
 const pc=state.player.proCareer||{},coach=(pc.coaches||[]).find(x=>x.name===name);if(coach)return `${pc.team}｜${coach.role}`;
 const pro=confirmedProfessionalRecord(name);return pro?`${pro.team}｜${pro.role}｜${pro.type}`:"";
}
function proLifeCard(){const p=state.player,pc=p.proCareer;return `<section class="card"><div class="row space"><h2>🏢 職業生活</h2><span class="badge">每日 5 格</span></div><div class="small">${pc.team}｜${pc.stage==="starter"?"一軍":pc.stage==="sub"?"替補":"青訓"}。校園與業餘盃賽已轉入生涯歷史。</div>${metaCard()}</section>`}
function currentNewHeroIds(){
 const y=state.date.year;
 const annual=HEROES.filter(h=>h.id?.startsWith(`y${y}_`)).map(h=>h.id);
 const fixed=["mid_duskwalker","mid_luofei","mid_astrologer","mid_helan","mid_frostspeaker"].filter(id=>HEROES.some(h=>h.id===id));
 return [...new Set([...annual,...fixed])];
}
function ensureMeta(){
 const w=state.world,block=Math.floor((state.date.week-1)/8);
 if(!w.meta||w.meta.block!==block||!w.meta.strong?.some(id=>currentNewHeroIds().includes(id))){
  const ids=HEROES.map(h=>h.id),newIds=currentNewHeroIds(),strong=[];
  // Every version guarantees at least one newly added hero in the strong/meta pool.
  if(newIds.length)strong.push(newIds[(block+state.date.year)%newIds.length]);
  [...ids].sort(()=>Math.random()-.5).forEach(id=>{if(strong.length<3&&!strong.includes(id))strong.push(id)});
  const weak=ids.filter(id=>!strong.includes(id)).sort(()=>Math.random()-.5).slice(0,2);
  w.meta={block,version:`${state.date.year}.${block+1}`,style:META_ARCHETYPES[block%META_ARCHETYPES.length],strong,weak,newHeroBias:true};
  state.news.unshift(`版本更新 ${w.meta.version}：${w.meta.style}成為主流，${strong.map(id=>HEROES.find(h=>h.id===id)?.name).join("、")}進入強勢Meta。`);
 }
 return w.meta;
}
function metaCard(){if(!isProfessionalStage())return "";const m=ensureMeta(),nm=id=>HEROES.find(h=>h.id===id)?.name||id;return `<div class="notice"><strong>🎮 版本 ${m.version}</strong>｜${m.style}<br>🔥 強勢：${m.strong.map(nm).join("、")}<br>📉 弱勢：${m.weak.map(nm).join("、")}</div>`}
function playerMetaFit(){const m=ensureMeta(),p=state.player;let best=Math.max(...m.strong.map(id=>p.mastery[id]?.level||0)),weak=Math.max(...m.weak.map(id=>p.mastery[id]?.level||0));return clamp((best-60)/10-(weak>90?1:0),-3,4)}
function proScrim(){
 if(!isProfessionalStage()||remain()<1)return;if(!consume("戰隊訓練賽",1))return;
 const p=state.player,pc=p.proCareer,opp=PRO_TEAMS.filter(x=>x!==pc.team)[rand(0,10)],
 chance=clamp(.48+(avg()-68)*.012+(teamChemistry()-50)*.002+playerMetaFit()*.025+(p.mood-60)*.002-(p.stress-40)*.002,.2,.82),
 win=Math.random()<chance,score=win?(Math.random()<.55?"2:0":"2:1"):(Math.random()<.55?"0:2":"1:2"),
 mates=(pc.roster||[]).filter(x=>!x.isPlayer);
 mates.forEach(x=>p.relations[x.name]=clamp((p.relations[x.name]||50)+(win?rand(1,2):-rand(1,2)),0,100));
 pc.scrimStreak=win?Math.max(1,(pc.scrimStreak||0)+1):Math.min(-1,(pc.scrimStreak||0)-1);pc.lockerRoom=clamp((pc.lockerRoom||65)+(win?2:-3),0,100);
 [["溝通",.16],["團戰",.14],["決策",.11],["英雄池",.08]].forEach(([k,g])=>addAbilityGrowth(k,g*Math.random()+g));
 p.energy=clamp(p.energy-10,0,100);p.stress=clamp(p.stress+(win?-2:4),0,100);p.mood=clamp(p.mood+(win?4:-4),0,100);changeCompetitiveForm(win?3:0.5,win?"Scrim勝利與團隊磨合":"Scrim失利但完成高強度實戰");
 const report=[
  `05:${rand(10,59)}｜雙方中野第一次河道碰撞，${teamChemistry()>=60?"隊伍溝通順暢":"語音出現短暫分歧"}。`,
  `11:${rand(10,59)}｜第一條小龍爭奪，${win?pc.team+"取得主動權":opp+"先拿資源優勢"}。`,
  `18:${rand(10,59)}｜中期團戰，夜鋒的版本適應度${playerMetaFit()>=1?"帶來明顯優勢":"仍需要更多磨合"}。`,
  `25:${rand(10,59)}｜Baron區拉扯，${win?"隊伍成功找到開戰窗口":"對方抓到視野空檔擴大領先"}。`,
  `${rand(29,36)}:${rand(10,59)}｜訓練賽結束：${pc.team} ${score} ${opp}。`
 ];
 if(pc.scrimStreak<=-3)state.logs.push("💢 訓練賽連敗，更衣室開始出現爭執與互相質疑。");
 const tk=(pc.tactics?.selected&&TACTIC_DEFS[pc.tactics.selected]?pc.tactics.selected:coachChooseTactic("Scrim訓練安排")),ceil=tacticAbilityCeiling(tk),cur=pc.tactics.mastery[tk]||45,room=Math.max(0,ceil-cur),coach=ensureCoachProfile(),eff=((coach?.skills?.tactics||65)/100)*(win?.95:.55),tg=room>0?Math.min(room,Math.max(.1,eff*Math.min(1.35,room/10))):0;pc.tactics.mastery[tk]=clamp(cur+tg,0,100);const others=Object.keys(TACTIC_DEFS).filter(k=>k!==tk).sort((a,b)=>tacticFit(b)-tacticFit(a)),sk=others[0],scur=pc.tactics.mastery[sk]||45,sceil=tacticAbilityCeiling(sk),sg=Math.max(0,Math.min(sceil-scur,tg*.25));if(sg>0)pc.tactics.mastery[sk]=clamp(scur+sg,0,100);pc.coachTrust=clamp((pc.coachTrust||50)+(win?1.2:.35),0,100);state.logs.push(`🆚 Scrim：${pc.team} ${score} ${opp}｜教練安排 ${TACTIC_DEFS[tk].name}${tg>0?` +${tg.toFixed(1)}`:"（已接近陣容上限）"}${sg>0?`，${TACTIC_DEFS[sk].name} +${sg.toFixed(1)}`:""}。`);
 save();render();modal(`<h2>🆚 訓練賽${win?"勝利":"敗北"}｜${score}</h2><div class="notice"><strong>教練安排：${TACTIC_DEFS[tk].name}</strong><br>熟練度 ${cur.toFixed(1)} → ${pc.tactics.mastery[tk].toFixed(1)}${sg>0?`<br>副體系 ${TACTIC_DEFS[sk].name} +${sg.toFixed(1)}`:""}<br>陣容上限約 ${ceil}</div><div class="log">${report.join("<br>")}</div><div class="notice">${win?"團隊配合提升，隊友關係小幅上升。":"失利仍累積實戰磨合，但效率較低。"}</div>${closeBtn()}`);
}
function updateTeamRelationsAfterMatch(win){const p=state.player,pc=p.proCareer,mates=(pc.roster||[]).filter(x=>!x.isPlayer);if(win){mates.forEach(x=>p.relations[x.name]=clamp((p.relations[x.name]||50)+rand(0,2),0,100));pc.lossStreak=0;pc.lockerRoom=clamp((pc.lockerRoom||65)+2,0,100)}else{pc.lossStreak=(pc.lossStreak||0)+1;mates.forEach(x=>p.relations[x.name]=clamp((p.relations[x.name]||50)-rand(0,pc.lossStreak>=3?3:1),0,100));pc.lockerRoom=clamp((pc.lockerRoom||65)-(pc.lossStreak>=3?5:2),0,100);if(pc.lossStreak>=3)state.logs.push(`💢 正式賽${pc.lossStreak}連敗，更衣室氣氛惡化，隊員開始互相質疑。`)}}
function ensureAudienceRating(){const p=state.player;p.publicImage=p.publicImage||{};if(!Number.isFinite(p.publicImage.rating))p.publicImage.rating=50;return p.publicImage}
function awardMatchPopularity(win,mvp,stage="聯賽"){const p=state.player,im=ensureAudienceRating();let base=stage.includes("世界賽")?rand(18000,55000):stage.includes("MSI")?rand(9000,30000):stage.includes("季後賽")?rand(2500,8000):rand(500,2200);if(!win)base=Math.round(base*.35);if(mvp)base=Math.round(base*1.8);const halo=p.proCareer?.worldChampionYear?1.35:1;p.followers+=Math.round(base*halo);im.rating=clamp(im.rating+(win?1.2:.15)+(mvp?1.3:0),0,100);state.logs.push(`📣 ${stage}${win?"勝利":"出賽"}${mvp?"＋MVP":""}帶來曝光，粉絲 +${Math.round(base*halo).toLocaleString()}，大眾評價提升。`)}
function repairChampionFollowers(){const p=state.player,pc=p.proCareer;if(p.v1918FollowerRepair)return;let floor=0;if(pc.worldChampionYear)floor=Math.max(floor,350000);const ach=pc.achievements||[];if(ach.some(x=>/世界賽冠軍/.test(x.name||x.title||"")))floor=Math.max(floor,350000);if(ach.some(x=>/MSI冠軍/.test(x.name||x.title||"")))floor=Math.max(floor,180000);if(floor&&p.followers<floor){const add=floor-p.followers;p.followers=floor;state.logs.push(`🎁 舊版本人氣補償：依既有冠軍履歷補回 ${add.toLocaleString()} 名粉絲，目前至少 ${floor.toLocaleString()}。`)}p.v1918FollowerRepair=true}
function updateProfessionalReputation(win,mvp){const p=state.player;if(mvp)p.adultLife.careerReputation=clamp(p.adultLife.careerReputation+1,0,100);if(win&&p.adultLife.careerReputation<70&&Math.random()<.25)p.adultLife.careerReputation=clamp(p.adultLife.careerReputation+.5,0,100)}
function ensureProEconomy(){const p=state.player,pc=p.proCareer;if(!pc.finance)pc.finance={lastPaidSerial:null,history:[]};if(!pc.contract)return;completeContract(pc.contract);if(pc.finance.lastPaidSerial==null){const joined=pc.joinedAt||{year:state.date.year,week:state.date.week},now=(state.date.year*52+state.date.week),start=(joined.year*52+joined.week),cycles=Math.max(0,Math.floor((now-start)/4));if(cycles){const amt=cycles*pc.contract.salary;p.cash+=amt;pc.finance.history.unshift({type:"歷史薪資補發",amount:amt,week:state.date.week});state.logs.push(`💰 歷史薪資補發：${cycles}個月，共 NT$${amt.toLocaleString()}。`)}pc.finance.lastPaidSerial=start+cycles*4}}
function contractDetails(c){completeContract(c);const r=c.requirements||{};return `出賽率≥${r.appearance??70}%｜賽季${r.season||"前8"}｜風評≥${r.reputation??55}｜Rank ${r.rank||"菁英"}｜違約金 NT$${Number(c.buyout||0).toLocaleString()}`}
function completeContract(c){const pc=state.player.proCareer;if(c.complete)return;c.start=c.start||{year:pc.joinedAt?.year||state.date.year,week:pc.joinedAt?.week||state.date.week};c.years=c.years||Math.max(1,Math.min(3,Math.round((c.lengthWeeks||52)/52)));c.lengthWeeks=c.lengthWeeks||c.years*52;c.buyout=c.buyout||Math.max(c.salary*12,600000);c.requirements=c.requirements||{appearance:70,season:"前8",reputation:55,rank:"菁英",noMajorScandal:true};c.bonuses=c.bonuses||{leagueChampion:300000,worlds:200000,mvp:100000};c.complete=true}
function salaryTick(){if(!isProfessionalStage())return;ensureProEconomy();const p=state.player,pc=ensureCareer20(),f=pc.finance,c=pc.contract,cf=pc.clubFinance,now=state.date.year*52+state.date.week;if(!c)return;while(now-(f.lastPaidSerial||now)>=4){f.lastPaidSerial+=4;if((cf.salaryArrears||0)>0||cf.financeCrisis){cf.playerSalaryArrears=(cf.playerSalaryArrears||0)+c.salary;p.mood=clamp(p.mood-rand(3,7),0,100);p.stress=clamp(p.stress+rand(2,6),0,100);f.history.unshift({type:"俱樂部欠薪",amount:0,week:state.date.week});state.logs.push(`🚨 ${pc.team} 因財務危機未能準時支付夜鋒月薪 NT$${c.salary.toLocaleString()}；心情與壓力受到影響。`)}else{p.cash+=c.salary;f.history.unshift({type:"戰隊月薪",amount:c.salary,week:state.date.week});state.logs.push(`💰 ${pc.team} 月薪入帳 NT$${c.salary.toLocaleString()}。`)}}if((cf.playerSalaryArrears||0)>0&&!cf.financeCrisis&&cf.cash>cf.playerSalaryArrears){const pay=cf.playerSalaryArrears;cf.cash-=pay;cf.playerSalaryArrears=0;p.cash+=pay;f.history.unshift({type:"欠薪補發",amount:pay,week:state.date.week});state.logs.push(`💵 ${pc.team} 財務恢復後補發夜鋒欠薪 NT$${pay.toLocaleString()}。`)}}
function financeCard(){const f=state.player.proCareer?.finance;if(!isProfessionalStage())return "";return `<section class="card"><h2>💳 財務紀錄</h2>${(f?.history||[]).slice(0,6).map(x=>`<div class="log">${x.type}｜NT$${Number(x.amount).toLocaleString()}</div>`).join("")||"<div class=small>尚無職業收入紀錄。</div>"}</section>`}
function donationCard(){
 if(!isProfessionalStage())return "";const p=state.player;ensureEthics();
 return `<section class="card"><h2>❤️ 捐款／公益</h2><p class="small">捐款會提升人品，但金額越高不是無限增加；同一週重複捐款收益會遞減。</p><div class="reply-grid"><button class="reply donate-btn" data-amt="5000">捐 NT$5,000</button><button class="reply donate-btn" data-amt="20000">捐 NT$20,000</button><button class="reply donate-btn" data-amt="50000">捐 NT$50,000</button></div></section>`;
}
function makeDonation(amount){
 const p=state.player;amount=Number(amount)||0;if(amount<=0||p.cash<amount){modal(`<h2>無法捐款</h2><p>現金不足。</p>${closeBtn()}`);return}
 const key=`${state.date.year}-${state.date.week}`,same=p.lastDonationWeek===key;p.lastDonationWeek=key;
 let gain=amount>=50000?4:amount>=20000?2.5:1.2;if(same)gain*=.45;
 p.cash-=amount;changeEthics(gain,"公益捐款");
 p.proCareer.finance?.history?.unshift({type:"公益捐款",amount:-amount,week:state.date.week});
 state.logs.push(`❤️ 公益捐款 NT$${amount.toLocaleString()}，人品 +${gain.toFixed(1)}。`);
 save();render();
}function sponsorCard(){
 if(!isProfessionalStage())return "";const p=state.player,sp=p.proCareer.sponsor;
 return `<section class="card"><h2>📣 贊助／代言</h2>${sp?`<div class="notice">${sp.brand}｜剩餘${sp.weeks}週｜每4週 NT$${sp.pay.toLocaleString()}</div>
 ${sp.merch?`<div class="log">🛍️ 聯名周邊：${sp.merch.name}<br>累積銷售：${sp.merch.units||0}件｜累積分潤 NT$${Number(sp.merch.revenue||0).toLocaleString()}｜帶來粉絲 +${sp.merch.fans||0}</div>`:`<button id="launchMerch" class="reply">推出聯名周邊商品</button>`}`:
 `<p class="small">粉絲、職業風評與比賽成績越高，越容易收到品牌合作。</p><button class="reply sponsor-action" data-action="seek">尋找代言機會</button>`}</section>`;
}
function sponsorAction(){const p=state.player,pc=p.proCareer;if(pc.sponsor)return;const chance=clamp(.15+p.followers/500000+p.adultLife.careerReputation/300,.12,.75);if(Math.random()<chance){pc.sponsor={brand:["Apex Gear","Pulse Energy","Nova Mobile","Stride Wear"][rand(0,3)],pay:rand(30000,120000),weeks:12,lastPay:state.date.week};state.logs.push(`📣 簽下代言：${pc.sponsor.brand}。`)}else state.logs.push("📣 目前沒有品牌願意提出正式代言。 ");save();render()}
function launchSponsorMerch(){
 const p=state.player,sp=p.proCareer?.sponsor;if(!sp||sp.merch)return;
 const names=[`${p.name} 聯名隊服`,`夜鋒限定滑鼠墊`,`夜鋒選手帽T`,`夜鋒簽名周邊包`];
 sp.merch={name:names[rand(0,names.length-1)],units:0,revenue:0,fans:0,lastWeek:state.date.week};
 state.logs.push(`🛍️ 與 ${sp.brand} 推出「${sp.merch.name}」。銷售會依粉絲與公眾形象每週變動。`);save();render();
}
function sponsorMerchTick(){
 const p=state.player,sp=p.proCareer?.sponsor;if(!sp?.merch)return;const im=ensurePublicImage(),m=sp.merch;
 const appeal=clamp(1+(p.followers||0)/50000-(im.haters||0)/180+(p.adultLife.careerReputation-50)/120,.35,3.5);
 const units=Math.max(10,Math.round(rand(25,90)*appeal)),revenue=units*rand(80,180),fans=Math.max(0,Math.round(units*rand(1,5)/10));
 m.units+=units;m.revenue+=revenue;m.fans+=fans;p.cash+=revenue;p.followers+=fans;
 p.proCareer.finance?.history?.unshift({type:`${sp.brand}周邊分潤`,amount:revenue,week:state.date.week});
 state.logs.push(`🛍️ 聯名周邊本週售出 ${units} 件，分潤 NT$${revenue.toLocaleString()}，粉絲 +${fans}。`);
}
function sponsorTick(){const p=state.player,sp=p.proCareer?.sponsor;if(!sp)return;sp.weeks--;if((state.date.week-sp.lastPay+52)%52>=4){p.cash+=sp.pay;sp.lastPay=state.date.week;p.proCareer.finance?.history.unshift({type:`${sp.brand}代言`,amount:sp.pay,week:state.date.week})}if(sp.weeks<=0){state.logs.push(`📣 ${sp.brand} 代言合約到期。`);p.proCareer.sponsor=null}}

function ensureEthics(){
 const p=state.player;
 if(!Number.isFinite(p.ethics))p.ethics=65;
 if(!Array.isArray(p.adultLife.reputationHistory))p.adultLife.reputationHistory=[];
 if(!Array.isArray(p.adultLife.ethicsHistory))p.adultLife.ethicsHistory=[];
 if(!p.health)p.health={sti:null,lastScreenWeek:null};
 return p.ethics;
}
function changeCareerRep(delta,reason){
 const p=state.player;ensureEthics();const before=p.adultLife.careerReputation;
 p.adultLife.careerReputation=clamp(before+delta,0,100);
 p.adultLife.reputationHistory.unshift({delta:+delta.toFixed(1),reason,year:state.date.year,week:state.date.week});
 p.adultLife.reputationHistory=p.adultLife.reputationHistory.slice(0,20);
}
function changeEthics(delta,reason){
 const p=state.player;ensureEthics();p.ethics=clamp(p.ethics+delta,0,100);
 p.adultLife.ethicsHistory.unshift({delta:+delta.toFixed(1),reason,year:state.date.year,week:state.date.week});
 p.adultLife.ethicsHistory=p.adultLife.ethicsHistory.slice(0,20);
}
function reputationDetailCard(){
 if(!isProfessionalStage())return "";
 const p=state.player;ensureEthics();const rh=p.adultLife.reputationHistory.slice(0,6),ir=ensureImageRepair();
 const repairLabel=ir.score>=70?"形象已大幅修復":ir.score>=40?"持續改善中":ir.score>=15?"開始重新建立信任":"仍在修復初期";
 return `<section class="card"><h2>📊 職業評價</h2><div class="stat-grid">${stat("職業風評",Math.round(p.adultLife.careerReputation))}${stat("人品",Math.round(p.ethics))}${stat("改過自新",`${Math.round(ir.score)}/100`)}</div>
 <div class="small">職業風評＝訓練、紀律、媒體、合約與業界專業評價；人品＝私人行為與責任感。私人舊聞不會因同一件事被反覆扣完整職業風評。</div>
 <div class="notice">🕊️ ${repairLabel}。長期無新爭議、履行扶養責任、公益與穩定職業態度都會逐步改善目前觀感；歷史事件仍會保留。</div>
 ${rh.length?`<div class="log">${rh.map(x=>`${x.delta>=0?"+":""}${x.delta}｜${x.reason}`).join("<br>")}</div>`:""}</section>`;
}
function renewalOutlookCard(){
 if(!isProfessionalStage())return "";const p=state.player,pc=p.proCareer,cs=pc.careerStats||{},perf=clamp(45+(cs.seriesW-cs.seriesL)*2+(cs.mvp||0)*2+(avg()-70)*1.2,0,100);
 const score=Math.round(perf*.42+p.adultLife.careerReputation*.34+p.ethics*.24),label=score>=75?"高度願意續約":score>=58?"傾向續約":score>=42?"尚未決定":"續約意願偏低";
 return `<div class="notice">📑 下一年續約評估：<strong>${label}</strong>（${score}）<br><span class="small">競技表現 ${Math.round(perf)}｜職業風評 ${Math.round(p.adultLife.careerReputation)}｜人品 ${Math.round(p.ethics)}</span></div>`;
}
function contractLookupCard(){
 if(!isProfessionalStage())return "";const c=state.player.proCareer?.contract;if(!c)return "";
 completeContract(c);const req=c.requirements||{},bon=c.bonuses||{};
 return `<section class="card"><h2>📜 合約查詢</h2><div class="notice"><strong>${c.team}</strong>｜${c.type||"職業選手"}｜月薪 NT$${Number(c.salary||0).toLocaleString()}｜合約 ${c.lengthWeeks||52}週</div>
 <div class="log">出賽率要求：≥ ${req.appearance??70}%<br>賽季目標：${req.season||"前8"}<br>職業風評：≥ ${req.reputation??55}<br>Rank要求：${req.rank||"菁英"}<br>重大負評限制：${req.noMajorScandal===false?"無":"有"}<br>違約金：NT$${Number(c.buyout||0).toLocaleString()}<br>聯賽冠軍獎金：NT$${Number(bon.leagueChampion||0).toLocaleString()}<br>世界賽資格獎金：NT$${Number(bon.worlds||0).toLocaleString()}<br>MVP獎金：NT$${Number(bon.mvp||0).toLocaleString()}</div>${renewalOutlookCard()}</section>`;
}
function isRemoteInviteLabel(label){return /聊天|視訊|語音|Rank|雙排|覆盤|線上|訊息/.test(String(label||""))}
function maybeNpcInvitation(){
 if(!isProfessionalStage()||Math.random()>.16)return;const p=state.player,pc=p.proCareer,cands=Object.values(state.characters||{}).filter(c=>c?.known&&c.name!==p.name&&proSocialAllowed(c));if(!cands.length)return;
 const c=cands[rand(0,cands.length-1)],rel=p.relations[c.name]||50,pro=!!proIdentity(c.name),dating=(p.romance.partners||[]).includes(c.name);
 const opts=dating?["吃晚餐","約會","一起休息"]:pro?["吃飯聊比賽","Rank雙排","一起覆盤"]:["吃飯","逛街","聊天"];
 const activity=opts[rand(0,opts.length-1)];
 state.messages.push({id:"invite-"+Date.now()+rand(1,999),from:c.name,text:`${dating?"最近都沒什麼時間見面。":""}要不要找時間${activity}？`,unread:true,resolved:false,type:"socialInvite",inviteLabel:activity});
 state.logs.push(`📱 ${c.name} 主動邀約你${activity}，等待你接受或婉拒。`);
}
function esportsCircleEvent(){
 if(!isProfessionalStage()||Math.random()>.07)return;const p=state.player,pc=p.proCareer,events=[
  `電競圈事件：${pc.team}訓練賽內容疑似外流，教練要求全隊注意資訊保密。`,
  `電競圈事件：其他戰隊選手在直播中談到夜鋒近期表現，引發社群討論。`,
  `電競圈事件：聯盟舉辦選手交流活動，夜鋒有機會認識其他戰隊選手。`,
  `電競圈事件：版本理解成為熱門話題，分析台開始比較各隊英雄池。`,
  `電競圈事件：隊內語音片段被截取討論，更衣室氣氛受到外界關注。`
 ];state.logs.push(events[rand(0,events.length-1)]);
}
function rumorWarTick(){
 if(!isProfessionalStage()||Math.random()>.025)return;const p=state.player,ex=Object.values(state.characters||{}).filter(c=>c?.known&&(p.relations[c.name]||50)<25);
 if(!ex.length)return;const c=ex[rand(0,ex.length-1)],falseRumor=Math.random()<.55;
 state.world.rumors.unshift(falseRumor?`${c.name}相關帳號散播夜鋒的未證實負面傳聞。`:`夜鋒與${c.name}的過往衝突被重新翻出。`);
 if(falseRumor){p.prCrisis={type:"遭到造謠",severity:rand(1,3),source:c.name,falseRumor:true};}
 else{p.prCrisis={type:"舊關係爆料",severity:rand(1,4),source:c.name};}
}
function stiRiskEvent(name,context="私人關係"){
 const p=state.player;ensureEthics();if(p.health.sti)return;
 const risk=context==="一次性關係"?.035:.018;
 if(Math.random()<risk){p.health.sti={type:["可治療性感染","需要追蹤的感染"][rand(0,1)],detected:false,source:name||"未知",week:state.date.week};state.logs.push("⚕️ 私人健康：近期出現需要檢查的症狀。建議進行健康檢查。")}
}
function ensureHealthManagement(){
 const p=state.player;ensureEthics();p.health=p.health||{};p.health.history=Array.isArray(p.health.history)?p.health.history:[];
 p.health.lastGeneralCheck=p.health.lastGeneralCheck||null;return p.health;
}
function healthCard(){
 if(!isProfessionalStage())return "";const p=state.player,hp=ensureHealthManagement(),sti=hp.sti,inj=p.condition?.injury,fat=Math.round(p.condition?.fatigue||0);
 const injText=inj?`${inj.type}｜${inj.severity||"一般"}｜預估剩餘 ${Math.max(0,inj.days||0)}天`:"目前無傷病";
 const stiText=sti?(sti.detected?`${sti.type}｜${sti.treated?"治療後追蹤中":"等待治療"}`:"有異常症狀，尚未檢查"):"目前沒有已知感染問題";
 return `<section class="card"><h2>⚕️ 健康管理</h2>
 <div class="stat-grid">${stat("傷病",injText)}${stat("疲勞",`${fat}/100`)}${stat("體力",`${Math.round(p.energy)}/100`)}${stat("健康追蹤",stiText)}</div>
 <div class="reply-grid">
 ${inj?`<button id="injuryTreat" class="reply">🏥 接受傷病治療</button><button id="injuryRehab" class="reply">🩹 復健／物理治療</button>`:""}
 ${sti&&!sti.detected?`<button id="stiScreen" class="reply">🧪 接受健康檢查</button>`:""}
 ${sti?.detected&&!sti.treated?`<button id="stiTreat" class="reply">💊 接受治療</button>`:""}
 <button id="healthCheck" class="reply">🩺 一般健康檢查</button>
 </div>
 ${hp.history.length?`<div class="log"><strong>最近健康紀錄</strong><br>${hp.history.slice(0,6).map(x=>x.text).join("<br>")}</div>`:""}
 </section>`;
}
function pushHealthHistory(text){
 const h=ensureHealthManagement();h.history.unshift({year:state.date.year,week:state.date.week,day:state.date.day,text});h.history=h.history.slice(0,20);
}
function doStiScreen(){
 const p=state.player,h=ensureHealthManagement();if(!h.sti)return;h.sti.detected=true;h.lastScreenWeek=state.date.week;p.cash=Math.max(0,p.cash-1500);pushHealthHistory(`第${state.date.week}週｜健康檢查：${h.sti.type}，等待治療。`);state.logs.push(`⚕️ 完成健康檢查：${h.sti.type}。可在健康管理進行治療。`);save();render();
}
function treatSti(){
 const p=state.player,h=ensureHealthManagement(),x=h.sti;if(!x||!x.detected||x.treated)return;const cost=2800;if(p.cash<cost){modal(`<h2>💊 治療</h2><p>治療費需要 NT$${cost.toLocaleString()}。</p>${closeBtn()}`);return}
 p.cash-=cost;x.treated=true;x.followupDays=7;pushHealthHistory(`第${state.date.week}週｜完成感染治療，7天後追蹤。`);state.logs.push("💊 已接受治療，進入7天追蹤期。");save();render();
}
function treatInjury(){
 const p=state.player,inj=p.condition?.injury;if(!inj)return;const cost=3500;if(p.cash<cost){modal(`<h2>🏥 傷病治療</h2><p>治療費需要 NT$${cost.toLocaleString()}。</p>${closeBtn()}`);return}
 p.cash-=cost;const cut=Math.max(1,Math.ceil((inj.days||3)*.35));inj.days=Math.max(1,(inj.days||3)-cut);p.condition.form=clamp(p.condition.form+2,0,100);pushHealthHistory(`第${state.date.week}週｜${inj.type}接受治療，恢復期縮短 ${cut} 天。`);state.logs.push(`🏥 ${inj.type}完成治療，預估恢復期縮短 ${cut} 天。`);save();render();
}
function rehabInjury(){
 const p=state.player,inj=p.condition?.injury;if(!inj||remain()<1)return;if(!consume("傷病復健",1))return;inj.days=Math.max(0,(inj.days||1)-1);p.condition.fatigue=clamp(p.condition.fatigue-8,0,100);p.energy=clamp(p.energy+6,0,100);p.condition.form=clamp(p.condition.form+1,0,100);pushHealthHistory(`第${state.date.week}週｜完成${inj.type}復健，疲勞下降。`);if(inj.days<=0){state.logs.push(`🩹 ${inj.type} 經復健後恢復。`);p.condition.injury=null}else state.logs.push(`🩹 完成${inj.type}復健，剩餘約 ${inj.days} 天。`);save();render();
}
function generalHealthCheck(){
 const p=state.player,h=ensureHealthManagement(),cost=1200;if(p.cash<cost){modal(`<h2>🩺 健康檢查</h2><p>檢查費需要 NT$${cost.toLocaleString()}。</p>${closeBtn()}`);return}
 p.cash-=cost;h.lastGeneralCheck={year:state.date.year,week:state.date.week,day:state.date.day};p.stress=clamp(p.stress-2,0,100);pushHealthHistory(`第${state.date.week}週｜完成一般健康檢查。${p.condition?.injury?"持續追蹤傷病。":"目前無重大傷病。"} `);state.logs.push("🩺 完成一般健康檢查，健康狀態已更新。");save();render();
}

function terminatePregnancyChoice(x){
 const p=state.player;if(!x)return;const agree=Math.random()<.62;
 if(agree){x.status="雙方同意終止";x.ended=true;state.logs.push(`${x.name}的懷孕事件：雙方討論後同意終止妊娠。`);changeEthics(0,"私人醫療決定")}
 else{x.status="對方決定繼續";state.logs.push(`${x.name}決定繼續懷孕。`);if(Math.random()<.28){p.prCrisis={type:"懷孕爭議曝光",severity:rand(1,3),source:x.name};state.news.unshift(`私人事件曝光：夜鋒與 ${x.name} 的懷孕爭議被公開。`)}}
 save();document.querySelector(".modal-backdrop")?.remove();render();
}

function ensureMarriageState(){
 const p=state.player;p.romance=p.romance||{};p.romance.marriage=p.romance.marriage||{trust:80,crisis:null,divorced:[]};return p.romance.marriage;
}
function registerAffair(name){
 const p=ensureLifestyle(),spouse=p.romance?.spouse;if(!spouse||name===spouse)return;
 const a=p.romance.affairs[name]=p.romance.affairs[name]||{name,count:0,exposedToSpouse:false,public:false};a.count++;
 if(a.count>=2)state.characters[name].relationshipType="婚外關係";
 const loc=currentLocationProfile(),res=currentResidenceProfile(),abroad=!!(loc?.country&&res?.country&&loc.country!==res.country),privateTrip=!!p.activeTravel;
 const distanceFactor=abroad?(privateTrip?.38:.58):1;
 const discover=clamp((.10+a.count*.055+(p.followers>100000?.05:0)-(ensureMarriageState().trust||80)*.0005)*distanceFactor,abroad?.02:.06,abroad?.22:.38);
 a.lastEncounterCountry=loc?.country||res?.country||"未知";a.lastEncounterAbroad=abroad;
 if(!a.exposedToSpouse&&Math.random()<discover){a.exposedToSpouse=true;triggerMarriageAffairCrisis(name)}
 else state.logs.push(`🌙 與 ${name} 的婚外接觸目前沒有被配偶發現；曝光風險會隨次數增加。`);
}
function triggerMarriageAffairCrisis(otherName){
 const p=state.player,spouse=p.romance?.spouse;if(!spouse||otherName===spouse)return;
 const m=ensureMarriageState();if(m.crisis)return;
 const severity=rand(2,4);m.trust=clamp((m.trust||80)-rand(25,45),0,100);
 p.relations[spouse]=clamp((p.relations[spouse]||90)-rand(25,45),0,100);
 m.crisis={type:"婚外關係被發現",other:otherName,severity,stage:"等待溝通",week:state.date.week};p.romance.marriageCrisis={...m.crisis};
 changeEthics(-rand(8,15),"婚外關係被配偶發現");
 state.logs.push(`💥 ${spouse} 發現你與 ${otherName} 有不忠關係。婚姻進入重大危機，必須先溝通處理。`);
 state.messages.push({id:"marriage-crisis-"+Date.now(),from:spouse,text:"我已經知道那件事了。我們必須好好談清楚，否則這段婚姻可能沒辦法繼續。",unread:true,resolved:true,type:"normal"});
}
function marriageCrisisCard(){
 const p=state.player,m=ensureMarriageState(),x=m.crisis;if(!p.romance?.spouse||!x)return "";
 return `<section class="card"><h2>⚠️ 婚姻危機</h2><div class="notice badtext">${x.type}｜婚姻信任 ${Math.round(m.trust||0)}</div><p class="small">目前階段：${x.stage}。先溝通處理；若處理失敗，可能進入分居、離婚、爆料或黑料事件。</p><button id="marriageTalk" class="reply">與老婆溝通處理</button></section>`;
}
function ensurePendingMarriageCrisis1978(name){
 const p=state.player;p.romance=p.romance||{};
 if(!p.romance.spouse&&name){p.romance.spouse=name}
 const spouse=p.romance.spouse,m=ensureMarriageState();if(!spouse||spouse!==name)return null;
 if(m.crisis)return m.crisis;
 // 相容舊版曾把危機寫在 romance.marriageCrisis 的資料。
 const legacy=p.romance.marriageCrisis;
 if(legacy){m.crisis={type:legacy.type||"婚外關係被發現",other:legacy.other||legacy.source||"其他人",severity:Number(legacy.severity)||3,stage:legacy.stage||"等待溝通",week:legacy.week||state.date.week,recovered:true};return m.crisis}
 // V1.9.7.7 曾只恢復按鈕而沒有穩定保存 crisis；按下按鈕時直接從事件紀錄補建。
 const logs=(state.logs||[]).slice(-600).reverse().map(String);
 const hit=logs.find(t=>t.includes(`${spouse} 發現你與`)&&t.includes("不忠關係"));
 if(hit){const mm=hit.match(/發現你與\s*([^\s]+)\s*有不忠關係/);m.crisis={type:"婚外關係被發現",other:mm?.[1]||"其他人",severity:3,stage:"等待溝通",week:state.date.week,recovered:true};p.romance.marriageCrisis={...m.crisis};state.logs.push(`🔧 V1.9.7.9：已補建 ${spouse} 的待處理婚姻危機。`);save();return m.crisis}
 return null;
}
function openMarriageCrisisTalk(name){
 const p=state.player;recoverLegacyMarriageCrisis1977();const spouse=p.romance?.spouse,m=ensureMarriageState(),x=ensurePendingMarriageCrisis1978(name);
 if(!spouse||spouse!==name||!x){modal(`<h2>💬 婚姻溝通</h2><p>目前沒有找到可恢復的待處理婚姻危機紀錄。</p>${closeBtn()}`);return}
 modal(`<h2>💥 與 ${spouse} 處理婚姻危機</h2><p>${spouse} 已經知道你與 <strong>${x.other||"其他人"}</strong> 的不忠關係。這次談話會影響婚姻是否能繼續。</p><div class="notice badtext">婚姻信任 ${Math.round(m.trust||0)}/100｜目前：${x.stage}</div><div class="reply-grid"><button class="reply marriage-crisis-choice" data-a="apologize">坦白並道歉</button><button class="reply marriage-crisis-choice" data-a="endAffair">承諾結束婚外關係並挽回</button><button class="reply marriage-crisis-choice" data-a="negotiate">希望維持其他關係並協商</button><button class="reply marriage-crisis-choice" data-a="separate">先暫時分開冷靜</button><button class="reply marriage-crisis-choice" data-a="divorce">提出離婚</button></div>${closeBtn()}`);
 document.querySelectorAll('.marriage-crisis-choice').forEach(b=>b.onclick=()=>resolveMarriageCrisisChoice(b.dataset.a));
}
function resolveMarriageCrisisChoice(action){
 const p=state.player,spouse=p.romance?.spouse,m=ensureMarriageState(),x=m.crisis;if(!spouse||!x)return;
 if(action==="divorce"){divorceSpouse("婚姻危機中主動提出離婚");save();document.querySelector('.modal-backdrop')?.remove();render();return}
 if(action==="separate"){x.stage="分居冷靜期";m.trust=clamp((m.trust||0)-2,0,100);state.logs.push(`🏠 你與 ${spouse} 決定先分開冷靜，婚姻尚未結束。`);save();document.querySelector('.modal-backdrop')?.remove();render();modal(`<h2>🏠 暫時分居</h2><p>${spouse} 同意先拉開距離。之後仍需要再次處理婚姻危機。</p>${closeBtn()}`);return}
 const c=state.characters?.[spouse]||{},traits=safeTraits(c).join("、"),rel=p.relations[spouse]||0,trust=m.trust||0;
 let chance=.16+rel*.004+trust*.004+(p.ethics||50)*.0015-x.severity*.065;
 if(action==="apologize")chance+=.08;
 if(action==="endAffair")chance+=.20;
 if(action==="negotiate")chance-=.18;
 if(/成熟|理性|溫柔/.test(traits))chance+=.05;if(/忠誠|保守|嫉妒/.test(traits)&&action==="negotiate")chance-=.12;
 chance=clamp(chance,.05,.82);
 if(action==="endAffair"&&x.other){p.romance.partners=(p.romance.partners||[]).filter(n=>n!==x.other);if(p.romance.affairs?.[x.other])p.romance.affairs[x.other].ended=true;const oc=state.characters?.[x.other];if(oc&&["地下戀人","婚外關係","戀人"].includes(oc.relationshipType))oc.relationshipType=null;state.logs.push(`💔 為挽回婚姻，你結束了與 ${x.other} 的婚外／地下關係。`)}
 if(Math.random()<chance){const gain=action==="endAffair"?rand(12,22):rand(6,14);m.trust=clamp(trust+gain,0,100);p.relations[spouse]=clamp(rel+rand(4,10),0,100);m.history=m.history||[];m.history.push(`第${state.date.week}週：不忠危機後完成溝通，進入信任修復期`);m.crisis=null;p.romance.marriageCrisis=null;state.logs.push(`🤝 你與 ${spouse} 完成婚姻危機溝通。婚姻暫時維持，但信任需要長期修復。`);save();document.querySelector('.modal-backdrop')?.remove();render();modal(`<h2>🤝 暫時和解</h2><p>${spouse} 願意暫時繼續婚姻。這不代表事情已完全過去，之後的行為仍會影響信任。</p>${closeBtn()}`);return}
 x.stage="溝通未果";m.trust=clamp(trust-rand(3,9),0,100);const roll=Math.random();let result=`${spouse} 目前無法接受你的說法，婚姻危機仍未解除。`;
 if(roll<.22){divorceSpouse("不忠事件後婚姻溝通破裂");result=`${spouse} 決定結束婚姻。`}
 else if(roll<.46){x.stage="分居";result=`${spouse} 決定暫時分居，之後仍可能再次溝通。`}
 else if(roll<.60){p.prCrisis={type:"婚姻不忠黑料曝光",severity:rand(3,5),source:spouse};state.world.rumors.unshift(`${spouse}與夜鋒的婚姻危機消息外流。`);result=`談話沒有成功，婚姻危機的消息也開始外流。`}
 state.logs.push(`💥 與 ${spouse} 的婚姻危機溝通未果：${result}`);save();document.querySelector('.modal-backdrop')?.remove();render();modal(`<h2>💥 溝通未果</h2><p>${result}</p>${closeBtn()}`);
}
function recoverLegacyMarriageCrisis1977(){
 const p=state.player;p.romance=p.romance||{};
 // 舊存檔可能只在人物資料留下「老婆」，卻遺失 romance.spouse。先把真正配偶補回來。
 let spouse=p.romance.spouse;
 if(!spouse){
   const wife=Object.values(state.characters||{}).find(c=>c?.known&&!c.formerSpouse&&!c.divorced&&(c.relationshipType==="老婆"||c.specialRelation==="老婆"||c.currentRelationship==="老婆"));
   if(wife?.name){spouse=wife.name;p.romance.spouse=wife.name;p.romance.partners=p.romance.partners||[];if(!p.romance.partners.includes(wife.name))p.romance.partners.push(wife.name);state.logs.push(`🔧 V1.9.7.7：已修復舊存檔配偶欄位，${wife.name} 重新同步為老婆。`)}
 }
 // 若人物欄位也不完整，從「某人發現你與…不忠」的既有紀錄辨識配偶。
 const logs=(state.logs||[]).slice(-240).reverse();
 if(!spouse){const h=logs.find(t=>/發現你與\s*[^\s]+\s*有不忠關係/.test(String(t))&&String(t).includes("必須先溝通"));const sm=String(h||"").match(/💥\s*([^\s]+)\s*發現你與/);if(sm?.[1]&&state.characters?.[sm[1]]){spouse=sm[1];p.romance.spouse=spouse;const c=state.characters[spouse];c.relationshipType="老婆";p.romance.partners=p.romance.partners||[];if(!p.romance.partners.includes(spouse))p.romance.partners.push(spouse)}}
 if(!spouse)return;const m=ensureMarriageState();if(m.crisis)return;
 const hit=logs.find(t=>String(t).includes(`${spouse} 發現你與`)&&String(t).includes("不忠關係")&&String(t).includes("必須先溝通"));if(!hit)return;
 const mm=String(hit).match(/發現你與\s*([^\s]+)\s*有不忠關係/);m.crisis={type:"婚外關係被發現",other:mm?.[1]||"其他人",severity:3,stage:"等待溝通",week:state.date.week,recovered:true};state.logs.push(`🔧 V1.9.7.7：已從既有紀錄恢復 ${spouse} 的待處理婚姻危機，可在手機→社交→老婆處理。`);
}
function resolveMarriageCrisis(){
 const p=state.player,spouse=p.romance?.spouse,m=ensureMarriageState(),x=m.crisis;if(!spouse||!x)return;
 const rel=p.relations[spouse]||0,trust=m.trust||0,chance=clamp(.18+rel*.004+trust*.004+p.ethics*.002-x.severity*.07,.08,.72);
 if(Math.random()<chance){
   m.trust=clamp(trust+rand(8,18),0,100);p.relations[spouse]=clamp(rel+rand(4,10),0,100);x.stage="暫時和解";
   state.logs.push(`🤝 你與 ${spouse} 完成一次艱難溝通。她願意暫時繼續婚姻，但信任需要長期修復。`);m.crisis=null;
 }else{
   x.stage="溝通失敗";const roll=Math.random();
   if(roll<.42){divorceSpouse("不忠事件與溝通破裂");}
   else if(roll<.76){p.prCrisis={type:"婚姻不忠黑料曝光",severity:rand(3,5),source:spouse};state.world.rumors.unshift(`${spouse}與夜鋒婚姻破裂的消息外流，疑似涉及婚外關係。`);state.logs.push(`📰 婚姻危機外流，黑料開始在社群擴散。`);}
   else{m.trust=clamp(trust-rand(5,12),0,100);state.logs.push(`🏠 溝通失敗，${spouse}選擇暫時分居，婚姻仍未正式結束。`);x.stage="分居";}
 }
 save();document.querySelector(".modal-backdrop")?.remove();render();
}
function divorceSpouse(reason){
 const p=state.player,spouse=p.romance?.spouse;if(!spouse)return;
 p.relations[spouse]=clamp((p.relations[spouse]||50)-rand(20,35),0,100);
 finalizeFormerSpouseState(spouse,reason);ensureMarriageState().crisis=null;
 state.logs.push(`💔 你與 ${spouse} 正式離婚。原因：${reason}。`);
 if(Math.random()<.55){p.prCrisis={type:"離婚後黑料／爆料",severity:rand(2,5),source:spouse};state.world.rumors.unshift(`夜鋒離婚消息曝光，前妻可能公開更多婚姻內幕。`)}
}
function marriageCard(){normalizeFormerSpouseSocialState();syncCompanionCurrentLocation();const p=state.player;if(!isProfessionalStage())return "";const spouse=p.romance?.spouse;if(spouse){const m=ensureMarriageState();m.history=m.history||[];return `<section class="card"><h2>💍 婚姻</h2><div class="notice">老婆：${spouse}｜婚姻信任 ${Math.round(m.trust||0)}/100<br>${socialLocationLabel(spouse)}</div><div class="small">信任會因夫妻約會、旅行、家庭責任與衝突溝通增加；地下戀情曝光、失約與家庭責任失衡會降低。${m.history.length?`<br>最近變化：${m.history.slice(-3).reverse().join("｜")}`:""}</div></section>${marriageCrisisCard()}`;}const eligible=(p.romance?.partners||[]).filter(n=>(p.relations[n]||0)>=88);return eligible.length?`<section class="card"><h2>💍 婚姻</h2><p>有 ${eligible.length} 位戀愛對象符合求婚條件，由你選擇對象。</p><button id="proposeMarriage" class="reply">💍 選擇求婚對象</button></section>`:""}
function proposeMarriage(){const p=state.player,eligible=(p.romance?.partners||[]).filter(n=>(p.relations[n]||0)>=88);if(!eligible.length)return;modal(`<h2>💍 選擇求婚對象</h2><div class="reply-grid">${eligible.map(n=>`<button class="reply proposal-target" data-n="${n}">${n}｜關係 ${Math.round(p.relations[n]||0)}｜信任 ${Math.round(p.romance.trust?.[n]??70)}</button>`).join("")}</div>${closeBtn()}`);document.querySelectorAll('.proposal-target').forEach(b=>b.onclick=()=>resolveProposalTo(b.dataset.n))}
function resolveProposalTo(n){const p=state.player;if(!(p.romance?.partners||[]).includes(n))return;const trust=p.romance.trust?.[n]??70,chance=clamp(.35+(p.relations[n]-80)*.025+(trust-50)*.004-(p.romance.partners.length>1?.18:0),.12,.94);if(Math.random()<chance){p.romance.spouse=n;p.romance.marriage={trust:90,crisis:null,divorced:p.romance.marriage?.divorced||[]};const c=state.characters?.[n],home=currentResidenceProfile();if(c){c.homeCountry=home.country;c.homeCity=home.city;c.currentCountry=home.country;c.currentCity=home.city;c.relationshipType="老婆";if(c.formerSpouse){c.formerSpouse=false;c.divorced=false;c.specialRelation="前妻・再婚"}}state.logs.push(`💍 ${n}接受求婚，你們正式結婚並以 ${home.country}・${home.city} 為共同生活據點。`)}else{p.relations[n]=clamp(p.relations[n]-3,0,100);state.logs.push(`💍 ${n}目前還沒有準備好結婚。`)}save();document.querySelector('.modal-backdrop')?.remove();render()}
function applyChildFamilyImpact(x,choice){
 const p=state.player,spouse=p.romance?.spouse,mother=x.name;
 if(mother===spouse){
  const d=choice==="共同撫養"?6:choice==="經濟扶養"?-3:-12;
  p.relations[spouse]=clamp((p.relations[spouse]||50)+d,0,100);
  if(d<0)state.logs.push(`💍 對孩子的安排讓 ${spouse} 對婚姻感到失望，夫妻關係 ${d}。`);
 }else if(spouse&&(x.spouseKnows||x.publicExposure)){
  const d=choice==="共同撫養"?-3:choice==="經濟扶養"?-5:-9;
  p.relations[spouse]=clamp((p.relations[spouse]||50)+d,0,100);
  state.logs.push(`💍 婚外親子事件影響你與 ${spouse} 的關係 ${d}。`);
 }
}
function childSupportDecision(name,choice){
 const p=state.player,x=pregnancyByName(name);if(!x||!x.born)return;
 x.supportChoice=choice;x.child=x.child||{name:`${x.name.slice(0,1)}小星`,birthYear:state.date.year,bond:0,public:false};
 if(choice==="共同撫養"){x.supportMonthly=12000;x.supportScore=(x.supportScore||0)+5;x.playerCare=true;x.child.bond=Math.max(5,x.child.bond||0)}
 else if(choice==="經濟扶養"){x.supportMonthly=8000;x.supportScore=(x.supportScore||0)+3;x.playerCare=false}
 else{x.supportMonthly=0;x.supportScore=(x.supportScore||0)-4;x.playerCare=false}
 applyChildFamilyImpact(x,choice);
 state.logs.push(`👶 親子決定：對 ${x.name} 的孩子選擇「${choice}」。${x.playerCare?"孩子已加入「小孩」分頁。":"孩子由媽媽主要照顧，不會顯示在你的「小孩」分頁。"} `);
 save();render();
}
function childrenPage(){
 ensureV10();ensureLegacyChildSystem();const p=state.player,allBorn=(p.adultLife?.pregnancies||[]).filter(x=>x.born&&x.child),children=allBorn.filter(x=>x.playerCare);
 const pending=allBorn.filter(x=>!x.birthChoice||!x.supportChoice);
 return `<section class="card"><div class="row space"><h2>👶 小孩</h2><span class="badge">${children.length} 位</span></div>${children.length?children.map(x=>{const age=Math.max(0,state.date.year-(x.child.birthYear||state.date.year)),bond=Math.round(x.child.bond||0);return `<div class="schedule-item"><div><strong>${x.child.name}</strong><div class="small">母親：${x.name}｜${age}歲｜親子關係 ${bond}/100｜扶養：${x.supportChoice||"共同撫養"}｜生產：${x.birthChoice==="陪產"?"有陪產":x.birthChoice==="工作"?"未陪產":"待補登"}</div></div><div><button class="ghost child-care-action" data-name="${x.name}">陪伴孩子</button>${age<=3?`<button class="ghost infant-care-action" data-name="${x.name}">🍼 育嬰照顧</button>`:""}</div></div>`}).join(""):`<div class="notice">目前沒有由你實際照顧的小孩。由媽媽單獨扶養的孩子仍存在於世界資料中，但不會列入你的主要小孩清單。</div>`}</section>
 ${pending.length?`<section class="card"><h2>📝 既有親子紀錄補登</h2><p class="small">這是為舊存檔已經出生的小孩補上新版系統。請補登當時是否陪產，以及後續是否參與照顧。</p>${pending.map(x=>`<div class="schedule-item"><div><strong>${x.child.name}</strong><div class="small">母親：${x.name}｜${x.birthChoice?`生產：${x.birthChoice==="陪產"?"有陪產":"未陪產"}`:"尚未補登陪產"}｜${x.supportChoice?`扶養：${x.supportChoice}`:"尚未決定扶養方式"}</div></div><div>${!x.birthChoice?`<button class="ghost legacy-birth-choice" data-name="${x.name}" data-choice="陪產">補登：有陪產</button><button class="ghost legacy-birth-choice" data-name="${x.name}" data-choice="工作">補登：未陪產</button>`:""}${!x.supportChoice?`<button class="ghost legacy-child-choice" data-name="${x.name}" data-choice="共同撫養">共同照顧</button><button class="ghost legacy-child-choice" data-name="${x.name}" data-choice="經濟扶養">媽媽照顧／扶養費</button><button class="ghost legacy-child-choice" data-name="${x.name}" data-choice="拒絕撫養">不參與照顧</button>`:""}</div></div>`).join("")}</section>`:""}
 <section class="card"><h2>家庭說明</h2><p class="small">共同照顧會影響親子關係，也會影響孩子母親與婚姻關係。婚外親子事件在配偶尚未得知前，不會讓配偶憑空知道；一旦曝光，可能升級為婚姻或大型公關危機。</p></section>`;
}
function spendTimeWithChild(name){
 const x=pregnancyByName(name);if(!x?.playerCare||!x.child)return;if(!consume("陪伴孩子",1))return;
 const p=state.player;x.child.bond=clamp((x.child.bond||0)+rand(4,8),0,100);p.mood=clamp(p.mood+4,0,100);p.energy=clamp(p.energy-4,0,100);
 p.relations[x.name]=clamp((p.relations[x.name]||50)+2,0,100);
 if(p.romance?.spouse===x.name)p.relations[x.name]=clamp((p.relations[x.name]||50)+1,0,100);
 state.logs.push(`👶 你花時間陪伴 ${x.child.name}，親子關係提升。`);save();render();
}
function privateLifeChaosScore(){
 const p=state.player,born=(p.adultLife?.pregnancies||[]).filter(x=>x.born),affairs=Object.values(p.romance?.affairs||{}).filter(a=>(a.count||0)>0);
 return born.filter(x=>x.name!==p.romance?.spouse).length*2+born.filter(x=>x.supportChoice==="拒絕撫養").length*2+affairs.length+affairs.reduce((n,a)=>n+Math.min(2,Math.max(0,(a.count||0)-1)),0);
}
function scandalSerial(){return (state.date.year||2026)*52+(state.date.week||1)}
function ensureControversyLedger(){const p=state.player,ml=ensureMediaLaw();ml.events=ml.events||{};return ml.events}
function controversyKey(type,source="",extra=""){return `${String(type||"事件").trim()}|${String(source||"未知").trim()}|${String(extra||"").trim()}`}
function registerControversy(type,source="",extra=""){
 const ledger=ensureControversyLedger(),key=controversyKey(type,source,extra),now=scandalSerial(),x=ledger[key]||{id:`controversy-${Object.keys(ledger).length+1}`,type,source,extra,count:0,firstSerial:now,lastSerial:now,resolved:false};
 x.count++;x.lastSerial=now;ledger[key]=x;if(x.count===1)ensureImageRepair().lastScandalSerial=now;return {key,event:x,isRepeat:x.count>1};
}
function triggerPrivateLifePRCrisis(source,reason="親子爭議"){
 const p=state.player,pc=p.proCareer||{},chaos=privateLifeChaosScore(),severity=clamp(2+Math.floor(chaos/2)+rand(0,1),2,5),reg=registerControversy(reason,source);
 if(reg.isRepeat){
   p.prCrisis={type:`舊聞再被提起：${reason}`,severity:Math.min(2,severity),source,privateLife:true,eventKey:reg.key,repeat:true};
   ensurePublicImage().haters+=rand(1,4);ensureAudienceRating().rating=clamp(ensureAudienceRating().rating-rand(0,1),0,100);
   state.news.unshift(`📰 舊聞再被討論：${source}相關的「${reason}」再次被提起，但不會重複計算完整職業風評懲罰。`);return;
 }
 p.prCrisis={type:severity>=4?"大型私生活公關危機":reason,severity,source,privateLife:true,eventKey:reg.key,repeat:false};
 ensurePublicImage().haters+=severity*rand(6,12);p.followers=Math.max(0,p.followers-severity*rand(120,420));
 ensureAudienceRating().rating=clamp(ensureAudienceRating().rating-severity*2,0,100);changeEthics(-Math.max(1,severity-1),"私人爭議公開，需要承擔責任");pc.coachTrust=clamp((pc.coachTrust||50)-Math.max(0,severity-3),0,100);
 if(pc.sponsor&&severity>=4&&Math.random()<.35){state.logs.push(`📣 ${pc.sponsor.brand} 因大型私生活爭議重新評估代言合作。`)}
 const spouse=p.romance?.spouse;if(spouse&&source!==spouse){const x=pregnancyByName(source);if(x){x.spouseKnows=true;x.publicExposure=true};p.relations[spouse]=clamp((p.relations[spouse]||50)-severity*rand(3,6),0,100);p.romance.marriageCrisis={type:"婚外親子／私生活曝光",source,severity};}
 state.news.unshift(`🚨 ${severity>=4?"大型公關危機":"公關危機"}：夜鋒的私人生活爭議遭到公開。這類事件主要影響人品與大眾觀感，不再因同一件事反覆扣職業風評。`);
}
function ensureSupportAgreement(pg){pg.supportAgreement=pg.supportAgreement||{status:"未協議",type:null,amount:0,startedSerial:null,lastPaidSerial:null};return pg.supportAgreement}
function childSupportTick(){const p=state.player;(p.adultLife?.pregnancies||[]).filter(x=>x.born).forEach(x=>{
 const ag=ensureSupportAgreement(x),now=scandalSerial();
 if(x.supportMonthly>0){p.cash-=x.supportMonthly;ag.lastPaidSerial=now;state.logs.push(`👶 子女扶養支出 NT$${x.supportMonthly.toLocaleString()}。`);if(state.date.week%4===0){x.supportScore=(x.supportScore||0)+1;positiveImageRepair("持續履行子女扶養責任",1)}}
 else if(x.supportChoice==="拒絕撫養"&&ag.status!=="已和解"&&!x.supportDisputeOpen&&Math.random()<.035){const demand=rand(50000,250000);x.publicExposure=true;x.supportDisputeOpen=true;triggerPrivateLifePRCrisis(x.name,"親子扶養爭議");if(p.prCrisis)p.prCrisis.demand=demand;state.news.unshift(`${x.name}要求正式協商扶養責任；你可以透過「家庭／親子事件」進行和解。`)}
 })}
function openSupportSettlement(name){const p=state.player,x=pregnancyByName(name);if(!x?.born)return;const ag=ensureSupportAgreement(x);
 modal(`<h2>🤝 與 ${name} 協商扶養</h2><p class="small">達成協議後，只要照約履行，同一筆扶養爭議不會反覆成為新的完整爆料事件。</p><div class="reply-grid"><button class="reply support-settle" data-type="monthly" data-amount="10000">每月 NT$10,000</button><button class="reply support-settle" data-type="monthly" data-amount="20000">每月 NT$20,000</button><button class="reply support-settle" data-type="lump" data-amount="500000">一次性和解 NT$500,000</button></div>${closeBtn()}`);
 document.querySelectorAll('.support-settle').forEach(b=>b.onclick=()=>{const type=b.dataset.type,amt=+b.dataset.amount;if(type==="lump"&&p.cash<amt){modal(`<h2>資金不足</h2><p>目前沒有足夠現金支付一次性和解金。</p>${closeBtn()}`);return}const base=type==="lump"?.88:amt>=20000?.92:.78,rel=p.relations[name]||50,chance=clamp(base+(rel-50)*.002+(p.ethics-50)*.002,.55,.98);if(Math.random()<chance){ag.status="已和解";ag.type=type;ag.amount=amt;ag.startedSerial=scandalSerial();x.supportDisputeOpen=false;x.supportChoice="經濟扶養";x.supportScore=Math.max(x.supportScore||0,4);if(type==="lump"){p.cash-=amt;x.supportMonthly=0;ag.lastPaidSerial=scandalSerial()}else x.supportMonthly=amt;const ledger=ensureControversyLedger();const k=controversyKey("親子扶養爭議",name);if(ledger[k])ledger[k].resolved=true;changeEthics(3,"主動與孩子母親完成扶養和解");positiveImageRepair("主動處理並履行親子責任",3);state.logs.push(`🤝 你與 ${name} 達成扶養和解：${type==="lump"?`一次性 NT$${amt.toLocaleString()}`:`每月 NT$${amt.toLocaleString()}`}。`)}else{state.logs.push(`🗣️ ${name} 暫未接受這次扶養方案，雙方仍可再次協商。`)}save();document.querySelector('.modal-backdrop')?.remove();render()})
}
function ensurePublicImage(){const p=state.player;p.publicImage=p.publicImage||{traits:{穩健:0,自信:0,狂傲:0,護隊友:0,甩鍋:0,冷淡:0},haters:0};return p.publicImage}
function mediaTrait(t,n=1){const im=ensurePublicImage();im.traits[t]=(im.traits[t]||0)+n;im.haters=Math.max(0,Math.round(im.haters+(t==="狂傲"||t==="甩鍋"?rand(5,20):-rand(0,3))))}
function blackFanTick(){const p=state.player,im=ensurePublicImage(),ml=ensureMediaLaw(),now=scandalSerial();im.haters=Math.max(0,im.haters+rand(-2,3)+(p.followers>50000?1:0));if(im.haters<=30||Math.random()>=clamp(im.haters/2200,.008,.08))return;const past=Object.values(ensureControversyLedger()).filter(x=>x.count>0);if(past.length&&Math.random()<.72){const old=past[rand(0,past.length-1)];if(now-(old.lastRevivedSerial||0)<8)return;old.lastRevivedSerial=now;old.count++;p.prCrisis={type:`舊聞再被提起：${old.type}`,severity:1,source:old.source||"黑粉",repeat:true,eventKey:old.id};ensureAudienceRating().rating=clamp(ensureAudienceRating().rating-1,0,100);state.news.unshift(`📰 黑粉重新整理「${old.type}」舊聞。由於沒有新證據，不會再次扣完整職業風評。`);return}p.prCrisis={type:"斷章取義",severity:1,source:"匿名黑粉",repeat:false,eventKey:`black-${now}`};state.news.unshift(`🚨 黑粉話題：有人以斷章取義內容帶風向，公關團隊正在關注。`)}
function openPRResponse(){
 const p=state.player;if(!p.prCrisis)return;const crisis=p.prCrisis,privateIssue=/婚姻|離婚|親子|懷孕|私人|劈腿|不忠/.test(crisis.type||""),repeat=!!crisis.repeat;
 modal(`<h2>🚨 公關危機</h2><p>${crisis.type}</p>${repeat?`<div class="notice">這是舊聞／同一事件再次被提起，不會再次計算完整職業風評懲罰。</div>`:""}<div class="reply-grid"><button class="reply pr-choice" data-a="apology">公開回應</button><button class="reply pr-choice" data-a="evidence">提出證據澄清</button><button class="reply pr-choice" data-a="club">交由戰隊／公關處理</button><button class="reply pr-choice" data-a="silent">保持沉默</button></div>`);
 document.querySelectorAll(".pr-choice").forEach(b=>b.onclick=()=>{const a=b.dataset.a,good=a==="evidence"?Math.random()<.68:a==="club"?Math.random()<.65:a==="apology"?Math.random()<.58:Math.random()<.25;if(repeat){if(good){ensurePublicImage().haters=Math.max(0,p.publicImage.haters-rand(2,6));state.logs.push("🛡️ 舊聞回應完成；沒有再次扣除職業風評。")}else{ensureAudienceRating().rating=clamp(ensureAudienceRating().rating-1,0,100);state.logs.push("📰 舊聞短期造成討論，但沒有再次扣除職業風評。")}}else if(privateIssue){if(good){if(a==="apology")changeEthics(2,"願意面對私人爭議並負責");ensurePublicImage().haters=Math.max(0,p.publicImage.haters-10);positiveImageRepair("妥善面對私人爭議",1);state.logs.push("🛡️ 私人爭議處理得當，主要影響人品與公眾觀感，不直接扣職業風評。")}else{changeEthics(-rand(1,4),"私人爭議處理不當");ensurePublicImage().haters+=rand(3,8);state.logs.push("⚠️ 私人爭議處理失敗，但不直接扣職業風評。")} }else{if(good){changeCareerRep(2,"新的職業公關危機處理得當");ensurePublicImage().haters=Math.max(0,p.publicImage.haters-10)}else changeCareerRep(-rand(2,5),"新的職業公關危機處理效果不佳")}p.prCrisis=null;save();document.querySelector('.modal-backdrop')?.remove();render()})
}
function ensureImageRepair(){const p=state.player;p.imageRepair=p.imageRepair||{score:0,lastScandalWeek:0,lastScandalSerial:0};return p.imageRepair}
function positiveImageRepair(reason,amount=1){const p=state.player,r=ensureImageRepair();r.score=clamp(r.score+amount,0,100);ensureAudienceRating().rating=clamp(ensureAudienceRating().rating+amount*.25,0,100);if(r.score>=20&&ensurePublicImage().haters>0)ensurePublicImage().haters=Math.max(0,ensurePublicImage().haters-Math.ceil(amount));state.logs.push(`🕊️ ${reason}，長期形象修復 +${amount.toFixed(1)}。過去事件仍保留，但目前觀感可逐步改善。`)}
function imageRepairTick(){const p=state.player,r=ensureImageRepair(),now=scandalSerial(),quiet=now-(r.lastScandalSerial||now);if(quiet>=4&&p.ethics>=60&&state.date.week%2===0){const amt=quiet>=12?1:.5;r.score=clamp(r.score+amt,0,100);ensureAudienceRating().rating=clamp(ensureAudienceRating().rating+amt*.2,0,100)}if(quiet>=8&&r.score>=25&&ensurePublicImage().haters>0&&state.date.week%4===0)ensurePublicImage().haters=Math.max(0,ensurePublicImage().haters-1)}
function ensureMediaLaw(){const p=state.player;p.mediaLaw=p.mediaLaw||{};const ml=p.mediaLaw;ml.cases=Array.isArray(ml.cases)?ml.cases:[];ml.leaks=Array.isArray(ml.leaks)?ml.leaks:[];ml.events=ml.events||{};ml.lastSourceSerial=ml.lastSourceSerial||{};const lv=Number(ml.teamLevel);ml.teamLevel=Number.isFinite(lv)?clamp(Math.round(lv),0,2):0;return ml}
function maybeDefamation(){if(!isProfessionalStage())return;const p=state.player,ml=ensureMediaLaw(),now=scandalSerial(),chance=ml.teamLevel>=2?0.006:ml.teamLevel===1?0.009:0.012;if(Math.random()>chance)return;const sources=["匿名黑粉","八卦帳號","自媒體","前圈內人士"],source=sources[rand(0,3)];if(now-(ml.lastSourceSerial[source]||0)<10)return;ml.lastSourceSerial[source]=now;const truth=Math.random()<.32,claim=["私生活混亂","隊內霸凌","收錢打假賽","耍大牌"][rand(0,3)],key=controversyKey(`爆料：${claim}`,source);const old=ml.events[key];if(old&&now-old.lastSerial<16)return;const reg=registerControversy(`爆料：${claim}`,source),x={id:`law-${Date.now()}`,eventKey:reg.key,source,claim,truth,evidence:truth?rand(25,80):rand(5,35),status:"待處理",repeat:reg.isRepeat};ml.cases.unshift(x);if(!truth&&ml.teamLevel>0&&Math.random()<(ml.teamLevel>=2?0.75:0.5)){x.status="顧問已處理";ensurePublicImage().haters=Math.max(0,ensurePublicImage().haters-rand(2,8));state.logs.push(`⚖️ ${ml.teamLevel>=2?"法律／公關團隊":"法律顧問"}自動處理 ${source} 的不實指控「${claim}」。`);return}state.messages.push({id:x.id,from:"經紀／法律顧問",text:`${source}公開指稱你「${claim}」。${x.repeat?"這與過去同一爭議高度重疊，不會再次計算完整懲罰。":""}你可以澄清、蒐證或追究法律責任。`,unread:true,resolved:true,type:"legal"})}
function legalMediaCard(){if(!isProfessionalStage())return "";const ml=ensureMediaLaw(),x=ml.cases.find(x=>x.status==="待處理"),team=ml.teamLevel===2?"法律＋公關團隊":ml.teamLevel===1?"法律顧問":"未聘請";return `<section class="card"><h2>⚖️ 輿論／法律</h2><div class="small">目前協助：${team}。同一事件再次被翻出時，不會重複扣完整職業風評。</div>${x?`<div class="notice">${x.source}：${x.claim}${x.repeat?"｜舊聞／重複事件":""}</div><div class="reply-grid"><button class="reply legal-action" data-a="clarify">公開澄清</button><button class="reply legal-action" data-a="sue">追究法律責任</button></div>`:`<div class="small">目前沒有待處理的惡意爆料。</div>`}<div class="reply-grid">${ml.teamLevel<1?`<button id="hireLawyer" class="reply">聘法律顧問｜每4週 NT$15,000</button>`:""}${ml.teamLevel<2?`<button id="hirePRTeam" class="reply">法律＋公關團隊｜每4週 NT$35,000</button>`:""}<button id="leakSomeone" class="reply">🗞️ 對外爆料</button></div></section>`}
function hireMediaTeam(level){const p=state.player,ml=ensureMediaLaw(),cost=level===2?35000:15000;if(p.cash<cost){modal(`<h2>資金不足</h2><p>至少需要 NT$${cost.toLocaleString()}。</p>${closeBtn()}`);return}p.cash-=cost;ml.teamLevel=Math.max(ml.teamLevel||0,level);ml.lastTeamPaySerial=scandalSerial();state.logs.push(`⚖️ 你聘請了${level===2?"法律＋公關團隊":"法律顧問"}，可降低惡意爆料頻率並自動處理部分不實指控。`);save();render()}
function legalTeamTick(){const p=state.player,ml=ensureMediaLaw();if(!ml.teamLevel)return;const now=scandalSerial(),due=(ml.lastTeamPaySerial??now)+4;if(now<due)return;const cost=ml.teamLevel===2?35000:15000;if(p.cash>=cost){p.cash-=cost;ml.lastTeamPaySerial=now;state.logs.push(`⚖️ 本期${ml.teamLevel===2?"法律＋公關團隊":"法律顧問"}費用 NT$${cost.toLocaleString()}。`)}else{state.logs.push("⚠️ 因資金不足，法律／公關顧問合約暫停。");ml.teamLevel=0}}
function handleLegalAction(a){const p=state.player,x=ensureMediaLaw().cases.find(x=>x.status==="待處理");if(!x)return;if(a==="clarify"){const good=Math.random()<clamp(.45+(100-x.evidence)*.004,.3,.9);if(good){ensurePublicImage().haters=Math.max(0,ensurePublicImage().haters-rand(5,15));ensureAudienceRating().rating=clamp(ensureAudienceRating().rating+2,0,100);x.status="已澄清"}else x.status="爭議持續";state.logs.push(`📣 對「${x.claim}」公開澄清：${good?"部分輿論接受說明":"爭議仍持續"}。${x.repeat?"本次不重複扣完整職業風評。":""}`)}else{const win=!x.truth&&Math.random()<clamp(.55+(50-x.evidence)*.006,.35,.92);x.status=win?"法律處理成功":"法律處理失敗";if(win){p.cash+=rand(30000,180000);ensurePublicImage().haters=Math.max(0,ensurePublicImage().haters-15);ensureAudienceRating().rating=clamp(ensureAudienceRating().rating+4,0,100);positiveImageRepair("成功證明惡意造謠並依法處理",2)}else if(x.truth){changeEthics(-3,"對真實爆料提告反噬")}state.logs.push(`⚖️ 法律處理：${win?"證明對方惡意造謠，獲得道歉／賠償":"未能證明對方惡意造謠"}。`)}save();render()}
function leakSomeone(){const p=state.player,cands=Object.values(state.characters||{}).filter(c=>c?.known&&c.name!==p.name).slice(0,12);modal(`<h2>🗞️ 選擇爆料對象</h2><div class="reply-grid">${cands.map(c=>`<button class="reply leak-target" data-n="${c.name}">${c.name}</button>`).join("")}</div>${closeBtn()}`);document.querySelectorAll('.leak-target').forEach(b=>b.onclick=()=>{const truthful=Math.random()<.72;if(truthful){state.logs.push(`🗞️ 你向外界提供關於 ${b.dataset.n} 的真實消息，輿論開始關注。`)}else{changeEthics(-6,"散播未經證實的抹黑");ensureAudienceRating().rating=clamp(ensureAudienceRating().rating-5,0,100);state.logs.push(`⚠️ 你對 ${b.dataset.n} 的爆料缺乏證據，面臨反告與形象反噬。`)}save();document.querySelector('.modal-backdrop')?.remove();render()})}
function nextLegalContractEnd(year,month,durationMonths=12){const target=year*12+(month-1)+durationMonths;for(let y=year;y<=year+6;y++)for(const m of [1,7]){const a=y*12+(m-1);if(a>=target)return {year:y,month:m}}return {year:year+2,month:1}}
function ensureRosterContract(x){if(!x||x.isPlayer)return x?.contract;if(x.contract?.endYear&&[1,7].includes(x.contract.endMonth))return x.contract;const months=[12,18,24,30,36][stableAgeOffset((x.name||"")+"contract",5)],end=nextLegalContractEnd(state.date.year,careerMonthFromWeek(state.date.week),months);x.contract={startYear:x.joinedYear||state.date.year,startMonth:careerMonthFromWeek(state.date.week),endYear:end.year,endMonth:end.month,salary:Number(x.salary)||Math.max(80000,Math.round(rosterRating(x)*9000/10000)*10000)};x.salary=x.contract.salary;return x.contract}
function ensureRosterContracts(){if(!isProfessionalStage())return;const pc=state.player.proCareer;(pc.roster||[]).forEach(ensureRosterContract)}
function rosterContractText(x){const c=ensureRosterContract(x);if(!c)return "";const now=state.date.year*12+(careerMonthFromWeek(state.date.week)-1),end=c.endYear*12+(c.endMonth-1),left=Math.max(0,end-now),txt=left>=12?`${Math.floor(left/12)}年${left%12?`${left%12}個月`:""}`:`${left}個月`;return `月薪 NT$${Math.round(c.salary||x.salary||0).toLocaleString()}｜合約剩餘 ${txt}｜${c.endYear}年${c.endMonth===1?"冬季":"夏季"}轉會期到期`}
function rosterContractTick(){if(!isProfessionalStage()||!isTransferWindow())return;const pc=state.player.proCareer,nowM=careerMonthFromWeek(state.date.week);for(const x of [...(pc.roster||[])]){if(x.isPlayer)continue;const c=ensureRosterContract(x);if(c.endYear===state.date.year&&c.endMonth===nowM&&!c.expiryHandled){c.expiryHandled=true;const renewChance=clamp(.45+(pc.clubFinance?.cash||0)/500000000+(pc.managementRelation||60)/500, .35,.88);if(Math.random()<renewChance){const raise=1+rand(3,18)/100;c.salary=Math.round(c.salary*raise/10000)*10000;x.salary=c.salary;const age=Number(state.characters?.[x.name]?.age||x.age||24),pool=age<=22?[12,12,18,24]:age>=29?[12,24,24,36]:[12,18,24,36],e=nextLegalContractEnd(state.date.year,nowM,pool[stableAgeOffset(x.name+state.date.year,pool.length)]);c.startYear=state.date.year;c.startMonth=nowM;c.endYear=e.year;c.endMonth=e.month;c.expiryHandled=false;state.logs.push(`📝 ${pc.team} 與 ${x.name} 完成續約，新合約至 ${e.year}年${e.month===1?"冬季":"夏季"}轉會期。`)}else{pc.roster=pc.roster.filter(v=>v!==x);state.logs.push(`🆓 ${x.name} 合約到期未續約，離開 ${pc.team} 成為自由選手。`)}}}pc.substitutes=(pc.roster||[]).filter(x=>x.isSub).slice(0,2)}
function ensureRosterSubstitutes(){const p=state.player,pc=p.proCareer;if(!isProfessionalStage()||!pc.roster)return;let subs=pc.roster.filter(x=>x.isSub);if(!pc.subRosterInitialized){pc.subRosterInitialized=true;const count=stableAgeOffset(pc.team+state.date.year,3),roles=["上路","打野","中路","ADC","輔助"];for(let i=0;i<count&&subs.length<2;i++){const role=roles[stableAgeOffset(pc.team+"sub"+i,5)],name=`${pc.team.split(" ")[0]}·${["Echo","Mori","Kai","Jun","Neo"][stableAgeOffset(pc.team+i,5)]}${i+1}`;const x={name,role,isPlayer:false,isSub:true,rating:rand(62,82),relation:50,trust:50,chemistry:45,salary:rand(80000,220000)};pc.roster.push(x);subs.push(x);addSocialAcquaintance(name,50,{gender:"男",age:18+stableAgeOffset(name,8),role,isPro:true,identityType:"替補選手",team:pc.team,acquaintanceSource:`${pc.team} 戰隊`})}}pc.substitutes=pc.roster.filter(x=>x.isSub).slice(0,2)}
function scoutingTalentPool(){const db=ensureGlobalProDatabase(),out=[],year=state.date.year,roles=["上路","打野","中路","ADC","輔助"];Object.values(state.characters||{}).filter(c=>c.playsGame&&!c.isPro).slice(0,4).forEach(c=>{const r=60+stableAgeOffset(c.name+year,25);out.push({name:c.name,role:c.role||diversifiedGameRole(c.name),source:"高分路人",rating:r,min:r-4,max:r+4,proGames:0,free:true})});for(let i=0;i<5;i++){const name=["夜鴉","白河","Kirin","Rook","Mika"][i]+(year>2030?`·${String(year).slice(-2)}`:"");const r=66+stableAgeOffset(name+year,25);out.push({name,role:roles[i],source:i<2?"業餘／高分路人":"青訓／次級聯賽",rating:r,min:r-5,max:r+5,proGames:i<2?0:rand(1,18),free:i<2})}for(const reg of PRO_REGIONS){const teams=Object.values(db[reg]||{}),x=teams[stableAgeOffset(reg+year,Math.max(1,teams.length))]?.[0];if(x)out.push({...x,source:"現役職業選手",rating:Math.round(Number(x.rating)||75),proGames:50,free:false})}return out.slice(0,14)}
function openRecruitSuggestionV1918(){const cands=scoutingTalentPool();modal(`<h2>🧲 動態人才市場</h2><div class="small">非轉會期僅可直接簽下「0場職業經驗＋無職業合約」新人；現役職業選手需等待轉會窗。</div><div class="reply-grid">${cands.map((c,i)=>`<button class="reply recruit1918" data-i="${i}">${c.name}｜${c.role}｜${c.source}｜${c.min!=null?`球探 ${c.min}～${c.max}`:`評估 ${Math.round(c.rating)}`}</button>`).join("")}</div>${closeBtn()}`);document.querySelectorAll(".recruit1918").forEach(b=>b.onclick=()=>{const c=cands[+b.dataset.i],canNow=isTransferWindow()||(c.proGames===0&&c.free);if(!canNow)return modal(`<h2>⛔ 非轉會期限制</h2><p>${c.name} 已有職業經驗或職業身分，目前只能列入觀察，等轉會窗再正式接觸。</p>${closeBtn()}`);const pc=ensureCareer20();pc.managementTasks.push({id:`tal-${Date.now()}`,type:"人才接觸",role:c.role,status:"評估中",note:`${c.name}｜${c.source}`,year:state.date.year,week:state.date.week,age:0,candidate:c});state.logs.push(`🧲 管理層開始評估 ${c.name}（${c.source}／${c.role}）。`);save();document.querySelector(".modal-backdrop")?.remove();render()})}
const COMMERCIAL_CATEGORIES=["鍵盤","滑鼠","耳機","螢幕","電競椅","PC硬體","手機","服飾","飲料","金融","汽車","直播平台"];
function ensureCommercial(){const pc=state.player.proCareer;pc.commercialContracts=pc.commercialContracts||[];return pc.commercialContracts}
function commercialCard(){if(!isProfessionalStage())return "";const pc=ensureCareer20(),a=ensureCommercial();return `<section class="card"><h2>💼 商業／經紀權</h2><div class="notice">目前經紀權：${pc.agentRights}｜個人周邊分成 ${Math.round(pc.merchShare*100)}%</div><div class="small">戰隊周邊、粉絲活動與主要商演由俱樂部經營。若經紀權被戰隊綁定，個人合作必須先送戰隊協商。</div>${a.map(x=>`<div class="notice">${x.category}｜${x.brand}｜每4週 NT$${x.pay.toLocaleString()}</div>`).join("")}<button id="seekCommercial" class="reply">收到／尋找個人合作</button></section>`}
function seekCommercial(){const pc=ensureCareer20(),a=ensureCommercial(),free=COMMERCIAL_CATEGORIES.filter(c=>!a.some(x=>x.category===c));if(!free.length)return;const cat=free[rand(0,free.length-1)],brand=`${["Apex","Nova","Pulse","Vertex","Prime"][rand(0,4)]} ${cat}`,pay=Math.round((rand(30000,180000)+(state.player.followers||0)/20)/1000)*1000;if(pc.agentRights!=="自由經紀"){const approved=Math.random()<.72;if(!approved){state.logs.push(`📑 ${brand} 個人合作送交 ${pc.team} 協商，但因現有贊助／商業衝突遭拒。`);save();render();return}state.logs.push(`📑 ${brand} 合作經 ${pc.team} 協商通過，戰隊依經紀條款參與分成。`)}const required=cat==="直播平台"?rand(6,12):0;a.push({category:cat,brand,pay,weeks:rand(12,52),lastPay:state.date.week,required,done:0});state.logs.push(`💼 簽下 ${brand}「${cat}」合作。`);save();render()}
function commercialTick(){const p=state.player,a=ensureCommercial();a.forEach(x=>{x.weeks--;if((state.date.week-x.lastPay+52)%52>=4){let pay=x.pay;if(x.category==="直播平台"&&(x.done||0)<x.required){pay=Math.round(pay*.55);state.logs.push(`⚠️ ${x.brand} 直播履約不足 ${x.done||0}/${x.required}，本期酬勞遭扣減。`)}p.cash+=pay;x.lastPay=state.date.week;x.done=0}});p.proCareer.commercialContracts=a.filter(x=>x.weeks>0)}
// V1.9.2.4 compatibility: restore weekly systems that older builds referenced but did not define.
function undergroundRomanceTick(){ if(typeof maybeRomanceExposure==="function") maybeRomanceExposure(); }
function maybeSocialInvitation(){ if(typeof maybeNpcInvitation==="function") maybeNpcInvitation(); }
function rankCompetitionTick(){ if(typeof syncAnnualCompetition==="function") syncAnnualCompetition(); }
function poachingTick(){ if(typeof recoverPoachFlow==="function") recoverPoachFlow(); }
function clubPayrollEstimate(){const pc=ensureCareer20(),roster=pc.roster||[];let monthly=Number(pc.contract?.salary||0);for(const x of roster){if(x.isPlayer)continue;monthly+=Number(x.salary||Math.max(60000,Math.round((Number(x.rating)||72)*9000)))}return monthly*12}
function clubFinanceWeeklyTick(){if(!isProfessionalStage())return;const p=state.player,pc=ensureCareer20(),f=pc.clubFinance,star=pc.legacy?.starPower||Math.min(100,Math.round((p.followers||0)/12000)),base=1200000+star*35000+Math.min(2500000,(p.followers||0)*2);f.cash=Math.max(0,Number(f.cash)||0);f.revenue+=base;f.sponsorRevenue+=Math.round(base*.45);f.eventRevenue+=Math.round(base*.12);f.cash+=base;clubMerchWeeklyTick1982();const weeklyCost=Math.round(clubPayrollEstimate()/52+650000+(f.loanPayment||0)/4);f.expenses+=weeklyCost;if(f.cash>=weeklyCost)f.cash-=weeklyCost;else{const gap=weeklyCost-f.cash;f.cash=0;f.salaryArrears=(f.salaryArrears||0)+gap;f.financeCrisis=true;p.mood=clamp(p.mood-rand(2,5),0,100);(pc.roster||[]).forEach(x=>{if(x.isPlayer)return;x.morale=clamp(Number(x.morale??70)-rand(2,6),0,100)});state.logs.push(`🚨 ${pc.team} 資金不足，本週新增欠薪／應付款 NT$${gap.toLocaleString()}；隊員心情受到影響。`);clubEmergencyFunding1982()}if((f.salaryArrears||0)>0&&f.cash>0){const pay=Math.min(f.cash,f.salaryArrears);f.cash-=pay;f.salaryArrears-=pay;if(pay>0)state.logs.push(`💵 ${pc.team} 補發欠款 NT$${pay.toLocaleString()}，尚欠 NT$${Math.round(f.salaryArrears).toLocaleString()}。`);if(f.salaryArrears<=0)f.financeCrisis=false}if(state.date.week%8===0)state.logs.push(`🏢 ${pc.team} 財務：現金 NT$${Math.round(f.cash).toLocaleString()}｜負債 NT$${Math.round(f.debt||0).toLocaleString()}｜欠薪 NT$${Math.round(f.salaryArrears||0).toLocaleString()}。`);if(f.lastYear!==state.date.year){const profit=f.revenue-f.expenses,rate=profit>0&&!f.salaryArrears?f.dividendRate:0,pool=Math.max(0,Math.round(profit*rate)),mine=Math.round(pool*equityPct()/100);if(mine>0&&f.lastDividendYear!==f.lastYear){p.cash+=mine;pc.clubEquity.dividends=(pc.clubEquity.dividends||0)+mine;state.logs.push(`💰 ${pc.team} 股東分紅：夜鋒收到 NT$${mine.toLocaleString()}。`)}f.lastDividendYear=f.lastYear;f.lastYear=state.date.year;f.revenue=0;f.expenses=0;f.merchRevenue=0;f.eventRevenue=0;f.sponsorRevenue=0;f.prizeRevenue=0}f.cash=Math.max(0,f.cash)}
function clubEmergencyFunding1982(){const pc=ensureCareer20(),f=pc.clubFinance;if(f.equityOffer)return;const pct=Math.min(5,Math.max(1,Math.ceil((f.salaryArrears||0)/Math.max(1,equityPricePerPct()))));if(equityPct()<49&&Math.random()<.55){f.equityOffer={pct,price:Math.round(equityPricePerPct()*pct*.92),created:state.date.year*52+state.date.week};state.messages.push({id:`fund-${Date.now()}`,from:`${pc.team} 管理層`,text:`俱樂部出現資金缺口，希望夜鋒認購 ${pct}% 新股份協助補充營運資金。`,unread:true,resolved:true,type:"clubFinance"});return}if(Math.random()<.55)clubTakeLoan1982(true);else clubSeekSponsor1982(true)}
function clubTakeLoan1982(auto=false){const pc=ensureCareer20(),f=pc.clubFinance;if((f.debt||0)>80000000){if(!auto)modal(`<h2>🏦 銀行貸款</h2><p>目前負債過高，銀行拒絕新增授信。</p>${closeBtn()}`);return}const amt=20000000,interest=.06;f.cash+=amt;f.debt=(f.debt||0)+Math.round(amt*(1+interest));f.loanPayment=Math.round((f.loanPayment||0)+amt*(1+interest)/24);state.logs.push(`🏦 ${pc.team} 取得銀行貸款 NT$${amt.toLocaleString()}，需分期償還。`);if(!auto){save();render();modal(`<h2>🏦 融資完成</h2><p>取得 NT$${amt.toLocaleString()} 貸款；負債與每期還款壓力同步增加。</p>${closeBtn()}`)}}
function clubSeekSponsor1982(auto=false){const pc=ensureCareer20(),f=pc.clubFinance,star=starPowerForPlayer(),chance=clamp(.38+star/220+(pc.recentChampions?.length||0)*.03,.35,.9);if(Math.random()<chance){const amt=Math.round(rand(6000000,18000000)/100000)*100000;f.cash+=amt;f.revenue+=amt;f.sponsorRevenue+=amt;state.logs.push(`🤝 ${pc.team} 簽下新的戰隊贊助，取得 NT$${amt.toLocaleString()} 商業資金。`);if(!auto){save();render();modal(`<h2>🤝 戰隊贊助</h2><p>新贊助合作帶來 NT$${amt.toLocaleString()}。</p>${closeBtn()}`)}}else if(!auto)modal(`<h2>🤝 贊助談判</h2><p>本次沒有品牌願意立即簽約，之後仍可再次尋找。</p>${closeBtn()}`)}
function launchClubMerch1982(){const pc=ensureCareer20(),f=pc.clubFinance,roster=(pc.roster||[]).filter(x=>!x.isSub),stars=roster.sort((a,b)=>rosterRating(b)-rosterRating(a)).slice(0,3),pick=stars[stableAgeOffset(pc.team+state.date.week,Math.max(1,stars.length))]||{name:state.player.name,rating:avg()};const item={id:`merch-${Date.now()}`,name:`${pick.name} 選手應援系列`,player:pick.name,launchedYear:state.date.year,units:0,revenue:0,active:true};f.clubMerch.unshift(item);state.logs.push(`👕 ${pc.team} 推出「${item.name}」，銷售收入將進入俱樂部；選手依商業權取得分紅。`);save();render();modal(`<h2>👕 新選手周邊</h2><p>${item.name} 正式上市。</p>${closeBtn()}`)}
function clubMerchWeeklyTick1982(){const p=state.player,pc=ensureCareer20(),f=pc.clubFinance,items=f.clubMerch||[];if((!items.length||state.date.week%13===0)&&items.length<8){const roster=(pc.roster||[]).filter(x=>!x.isSub),pick=roster.sort((a,b)=>rosterRating(b)-rosterRating(a))[stableAgeOffset(pc.team+state.date.year+state.date.week,Math.max(1,Math.min(3,roster.length)))]||{name:p.name};items.unshift({id:`auto-merch-${state.date.year}-${state.date.week}`,name:`${pick.name} 官方選手系列`,player:pick.name,launchedYear:state.date.year,units:0,revenue:0,active:true});state.logs.push(`👕 ${pc.team} 商業部推出「${pick.name} 官方選手系列」。`)};for(const m of items.filter(x=>x.active).slice(0,8)){const r=(pc.roster||[]).find(x=>x.name===m.player),rating=r?rosterRating(r):(m.player===p.name?avg():75),units=Math.max(8,Math.round(rand(15,65)*(1+rating/100+(m.player===p.name?(p.followers||0)/150000:0)))),gross=units*rand(700,1800);m.units+=units;m.revenue+=gross;f.cash+=gross;f.revenue+=gross;f.merchRevenue+=gross;if(m.player===p.name){const share=Math.round(gross*(pc.merchShare||.1));p.cash+=share;f.cash=Math.max(0,f.cash-share);p.proCareer.finance?.history?.unshift({type:`${pc.team}選手周邊分紅`,amount:share,week:state.date.week})}}}
function acceptClubEquityOffer1982(){const p=state.player,pc=ensureCareer20(),f=pc.clubFinance,o=f.equityOffer;if(!o)return;if(p.cash<o.price)return modal(`<h2>資金不足</h2><p>認購需要 NT$${o.price.toLocaleString()}。</p>${closeBtn()}`);p.cash-=o.price;f.cash+=o.price;pc.clubEquity.shares[pc.team]=equityPct()+o.pct;f.capitalRaised=(f.capitalRaised||0)+o.price;f.equityOffer=null;state.logs.push(`💰 夜鋒認購 ${pc.team} ${o.pct}% 新股份，俱樂部取得 NT$${o.price.toLocaleString()}。`);save();render()}
function declineClubEquityOffer1982(){const f=ensureCareer20().clubFinance;f.equityOffer=null;state.logs.push("📨 夜鋒暫不參與本次俱樂部增資，管理層將尋找其他融資方式。");clubTakeLoan1982(true);save();render()}
function normalizeRosterRole(r){return r==="下路"?"ADC":r}
function recruitCandidateForTask(t){const pc=ensureCareer20(),want=normalizeRosterRole(t.role),pool=scoutingTalentPool().filter(c=>want==="替補"||normalizeRosterRole(c.role)===want);let legal=pool.filter(c=>isTransferWindow()||(c.proGames===0&&c.free));if(!legal.length)return null;legal.sort((a,b)=>(Number(b.rating)||0)-(Number(a.rating)||0));return legal[Math.min(legal.length-1,stableAgeOffset(t.id+state.date.week,Math.min(3,legal.length)))]}
function signManagementRecruit(t,c){const pc=ensureCareer20();if(!c)return false;const subs=(pc.roster||[]).filter(x=>x.isSub);let role=normalizeRosterRole(c.role||t.role);if(role==="替補")role=["上路","打野","中路","ADC","輔助"][stableAgeOffset(c.name,5)];const salary=Math.max(80000,Math.round((Number(c.rating)||70)*11000/10000)*10000),signing=Math.max(150000,Math.round(salary*2));if(pc.clubFinance.cash<signing){t.status="失敗";t.note=`已找到 ${c.name}，但簽約預算不足（需要約 NT$${signing.toLocaleString()}）`;return false}if((pc.roster||[]).some(x=>x.name===c.name)){t.status="完成";t.signedPlayer=c.name;t.note=`${c.name} 已在正式名單中`;return true}const x={name:c.name,role,isPlayer:false,isSub:t.role==="替補",rating:Math.round(Number(c.rating)||70),relation:50,trust:50,chemistry:42,salary,proGames:Number(c.proGames)||0,joinedYear:state.date.year};const end=nextLegalContractEnd(state.date.year,careerMonthFromWeek(state.date.week),[12,18,24,36][stableAgeOffset(c.name+"deal",4)]);x.contract={startYear:state.date.year,startMonth:careerMonthFromWeek(state.date.week),endYear:end.year,endMonth:end.month,salary};if(t.role==="替補"){if(subs.length>=2){t.status="失敗";t.note="替補名額已滿（最多2名），需先釋出或調整現有替補";return false}pc.roster.push(x)}else{const starter=(pc.roster||[]).find(v=>!v.isSub&&!v.isPlayer&&normalizeRosterRole(v.role)===normalizeRosterRole(t.role));if(starter&&x.rating>rosterRating(starter)){starter.isSub=true;if(subs.length>=2){const weakest=subs.sort((a,b)=>rosterRating(a)-rosterRating(b))[0];pc.roster=pc.roster.filter(v=>v!==weakest);state.logs.push(`📤 ${weakest.name} 因名額調整離開 ${pc.team} 替補名單。`)}pc.roster.push(x)}else{if(subs.length<2){x.isSub=true;pc.roster.push(x)}else{t.status="失敗";t.note=`${c.name} 完成評估，但目前先發與替補名額皆無適合空間`;return false}}}pc.clubFinance.cash-=signing;pc.clubFinance.expenses+=signing;pc.substitutes=pc.roster.filter(v=>v.isSub).slice(0,2);addSocialAcquaintance(c.name,50,{gender:"男",age:18+stableAgeOffset(c.name,10),role,isPro:true,identityType:x.isSub?"替補選手":"職業選手",team:pc.team,acquaintanceSource:`${pc.team} 戰隊`});t.status="完成";t.signedPlayer=c.name;t.signedRole=role;t.note=`已正式簽下 ${c.name}（${role}／${x.isSub?"替補":"先發"}），已完成合約與名單註冊`;pc.managementRelation=clamp(pc.managementRelation+2,0,100);state.news.unshift(`📝 ${pc.team} 宣布簽下 ${c.name}（${role}），${x.isSub?"加入替補陣容":"進入先發競爭"}。`);return true}
function managementTaskTick(){if(!isProfessionalStage())return;const pc=ensureCareer20(),tasks=pc.managementTasks||[];for(const t of tasks.filter(x=>!["完成","失敗","取消"].includes(x.status))){t.age=(t.age||0)+1;if(t.type!=="補強"){if(t.age>=2){t.status="完成";t.note="評估完成並正式回報";pc.managementRelation=clamp(pc.managementRelation+1,0,100)}else{t.status="執行中";t.note="管理層正在評估"}continue}if(t.age===1){t.status="執行中";t.note="球探已提出候選名單";continue}const c=t.candidate||recruitCandidateForTask(t);if(!c){if(!isTransferWindow()){t.status="等待轉會窗";t.note="目前沒有符合非轉會期規則的0場職業經驗自由新人；將在轉會窗繼續執行";t.age=1}else{t.status="失敗";t.note="本次市場沒有符合位置與預算要求的人選";pc.managementRelation=clamp(pc.managementRelation-2,0,100)}pc.managementDirective=t;continue}t.candidate=c;if(Math.random()>=.78){t.status="失敗";t.note=`${c.name} 拒絕目前合約／加盟條件`;pc.managementRelation=clamp(pc.managementRelation-1,0,100)}else{signManagementRecruit(t,c);if(t.status==="完成"&&!(pc.roster||[]).some(x=>x.name===t.signedPlayer)){t.status="待修復";t.signedPlayer=null;t.note="簽約資料未成功寫入Roster，任務已退回簽約階段";t.age=1}}pc.managementDirective=t;state.logs.push(`🏢 管理層回報：${t.type}${t.role?`「${t.role}」`:""}${t.status}｜${t.note}`)}ensureRosterSubstitutes()}
function injectClubCapital(){const p=state.player,pc=ensureCareer20(),amt=10000000;if(p.cash<amt)return modal(`<h2>資金不足</h2><p>本次增資需要 NT$${amt.toLocaleString()}。</p>${closeBtn()}`);p.cash-=amt;pc.clubFinance.cash+=amt;pc.clubFinance.capitalRaised+=amt;state.logs.push(`💰 夜鋒以股東身份向 ${pc.team} 增資 NT$${amt.toLocaleString()}。`);save();render()}
function professionalWeeklyTick(){dynamicWorldWeeklyTick1967();clubFinanceWeeklyTick();managementTaskTick();rosterContractTick();Object.values(state.characters||{}).forEach(c=>partnerCurrentLocationByMode(c));syncCompanionCurrentLocation();undergroundRomanceTick();ensureRosterSubstitutes();repairSocialHomeLocations();maybeNpcVisitsPlayer();maybeSocialInvitation();maybeDefamation();legalTeamTick();imageRepairTick();commercialTick();transferMarketTick();teamRuptureWeeklyTick();disciplineRuptureTick();ensureTeammatePartners();if(Math.random()<.22)maybeMeetTeammateGirlfriend();const lp=ensureLifestyle();if(state.date.week%4===0){const ids=[...lp.assets.homes,...lp.assets.vehicles],cost=ids.reduce((sum,id)=>sum+(ASSET_CATALOG.find(x=>x.id===id)?.maint||0),0);if(cost){lp.cash=Math.max(0,lp.cash-cost);state.logs.push(`🏠 本期資產維護費 NT$${cost.toLocaleString()}。`)}}salaryTick();sponsorTick();sponsorMerchTick();childSupportTick();rankCompetitionTick();blackFanTick();poachingTick();maybeTeamEarlyRenewalOffer();ensureMeta();const p=state.player,pc=p.proCareer;if(pc.contract){completeContract(pc.contract);if(p.adultLife.careerReputation<pc.contract.requirements.reputation&&Math.random()<.2)state.logs.push("⚠️ 合約警告：目前職業風評低於戰隊要求。")}}
function professionalDailyTick(){if(!isProfessionalStage())return;syncAnnualCompetition();if(isTransferWindow())ensureTransferMarket();repairPermanentCivilianProfessions();recoverPoachFlow();salaryTick();if(state.player.proCareer.suspension>0&&isProMatchToday()){state.logs.push(`⛔ 你仍有 ${state.player.proCareer.suspension} 場禁賽處分。`)}}
const PRO_ROSTER_NAMES={
 "KNG Esports":["韓曜辰","周凱文","夜鋒","林承皓","江允澤"],
 "Nova Gaming":["沈奕辰","顧言澈","許哲宇","陸子昂","程以安"],
 "Titan Core":["高宇謙","陳柏勳","葉知衡","吳昊恩","方子墨"],
 "Astra Five":["謝景曜","宋承恩","Zero","梁昱廷","白允成"],
 "Vortex":["羅奕凡","唐子軒","Eon","魏晨皓","簡亦航"],
 "Eclipse":["徐知遠","Raven","季凌川","蘇景和","賀允文"],
 "Phoenix":["杜昱安","江廷皓","凌越","周予辰","林浩宇"],
 "Orion":["顏子謙","秦昊","曜星","許澤恩","沈嘉佑"],
 "Tempest":["顧承熙","葉辰","凜夜","韓子皓","陳宇森"],
 "Mirage":["宋昱廷","洛川","祁言","周景然","林奕程"],
 "Vertex":["白承宇","陸景","Nox","許宥辰","江墨"],
 "Radiant":["程曜","林子澈","Haku","陳以衡","蘇允安"]
};
function isProfessionalStage(){return ["starter","sub","academy"].includes(state.player.proCareer?.stage)}
function migrateProV160(){
 const p=state.player;if(p.v160Migrated)return;
 if(isProfessionalStage()){
   const pc=p.proCareer;
   // 回到剛加盟：只清除職業測試賽事資料，保留人生/感情/懷孕/合約。
   pc.season=null;pc.careerStats={seriesW:0,seriesL:0,gameW:0,gameL:0,matches:0,mvp:0,kills:0,deaths:0,assists:0};
   pc.matchHistory=[];pc.rivals={};pc.mediaHistory=[];pc.joinedAt={year:state.date.year,week:state.date.week};state.news=(state.news||[]).filter(x=>!/(職業聯賽：|賽後話題：)/.test(x));state.logs=(state.logs||[]).filter(x=>!/(職業BO3|職業聯賽：)/.test(x));
   // 舊自組戰隊停止活動。
   if(p.team?.formed){p.teamHistory=p.teamHistory||[];p.teamHistory.push({name:p.team.name||"固定戰隊",members:[...(p.team.members||[])],status:"加盟職業隊後解散"});p.team={name:"",members:[],formed:false,trainingCount:0}}
   ensureProRoster();
   initProSeason();
   // 保留懷孕重要人物；若是隨機女粉絲，轉為正式姓名。
   (p.adultLife?.pregnancies||[]).forEach((pg,i)=>promoteImportantPregnancyNpc(pg,i));
   cleanupUnnamedFriends();
   state.logs.push("🏢 職業篇起點校正完成：回到剛加盟戰隊、尚未進行第一場正式比賽；既有職業測試戰績歸零。");
 }
 p.v160Migrated=true;
}
function promoteImportantPregnancyNpc(pg,i){
 const p=state.player;if(!pg?.name||!/^女粉絲\d+$/.test(pg.name))return;
 const pool=["蘇妍希","林若彤","許芷晴","陳語柔","沈佳寧"],old=pg.name,name=pool[i%pool.length];
 if(!state.characters[name]){
   const oldC=state.characters?.[old]||{};
   state.characters[name]={...oldC,name,known:true,gender:"女",romanceable:true,important:true,role:"重要關係人物",desc:"曾透過直播認識夜鋒，目前有尚未結束的重要私人事件。"};
   p.relations[name]=p.relations[old]??45;
 }
 pg.formerName=old;pg.name=name;
 (p.romance?.partners||[]).forEach((n,j)=>{if(n===old)p.romance.partners[j]=name});
 if(p.romance?.partner===old)p.romance.partner=name;
 delete state.characters[old];delete p.relations[old];
}
function coachNamesForTeam(team,region){
 const seeds={LCK:["金泰勳","朴賢秀","李正民","崔東赫","尹成浩","姜敏哲"],LPL:["陳志遠","周文昊","林啟峰","趙子昂","沈博文","葉承安"],LEC:["Marco Klein","Julien Moreau","Daniel Rossi","Thomas Berg","Luis Vega","Erik Novak"],LCS:["Michael Reed","Jason Park","Ryan Cole","Kevin Brooks","Ethan Moore","David Kim"],PCS:["姜泰勳","陳啟峰","林冠宇","許博翔","周明哲","葉承恩"]};
 const pool=seeds[region]||seeds.PCS,idx=stableAgeOffset(team,Math.max(1,pool.length-1));
 return [{name:pool[idx],role:"主教練"},{name:pool[(idx+1)%pool.length],role:"助理教練"}];
}
function archiveCurrentCoaches(team){
 const p=state.player,pc=p.proCareer;if(!pc.coaches?.length)return;pc.coachHistory=pc.coachHistory||[];
 pc.coaches.forEach(x=>{pc.coachHistory.push({name:x.name,team,role:x.role,fromYear:pc.coachJoinedYear||state.date.year,toYear:state.date.year});const c=state.characters?.[x.name];if(c){c.isPro=false;c.isProStaff=true;c.formerTeam=team;c.formerRole=x.role;c.currentTeam=null;c.socialContact=true;c.identityType="教練";c.acquaintanceSource=`${team} 任職期間`}});
}
function regionalReplacementName(region,team,role){
 const pools={
  PCS:["林冠宇","陳奕翔","黃柏鈞","張曜廷","周昱辰","江承恩","許皓軒","葉宇哲","吳柏翰","方俊傑"],
  LCK:["Kim Min-jae","Park Ji-hoon","Lee Hyun-woo","Choi Jun-seo","Kang Tae-yun","Han Seung-min","Yoon Do-hyun","Jung Woo-jin"],
  LPL:["Chen Yuze","Li Haoran","Wang Zixuan","Zhao Yichen","Xu Minghao","Liu Tianyu","Sun Haoxuan","Zhou Yifan"],
  LEC:["Lukas Weber","Noah Fischer","Elias Novak","Milan Keller","Leo Moreau","Oscar Lind","Felix Bauer","Nico Rossi"],
  LCS:["Ethan Cole","Mason Reed","Ryan Brooks","Dylan Hayes","Logan Price","Caleb Stone","Owen Parker","Jack Bennett"]
 };
 const used=new Set(Object.keys(state.characters||{}));
 const arr=pools[region]||pools.PCS;
 for(let i=0;i<arr.length;i++){const n=arr[(stableAgeOffset(team+role,arr.length)+i)%arr.length];if(!used.has(n))return n}
 return `${arr[stableAgeOffset(team+role+state.date.year,arr.length)]} ${state.date.year%100}`;
}
function signImmediateRosterReplacement(role,reason="轉會後補強"){
 const p=state.player,pc=p.proCareer;if(!pc?.team)return null;pc.roster=pc.roster||[];
 const nr=normalizeRole(role)||role,existing=pc.roster.find(x=>!x.isSub&&normalizeRole(x.role)===nr);if(existing)return existing;
 const name=regionalReplacementName(pc.region||fixedTeamRegion(pc.team)||"PCS",pc.team,nr),rating=clamp(64+stableAgeOffset(name+pc.team,22),58,86);
 const x={name,role:nr,isPlayer:false,isSub:false,rating,relation:50,trust:50,chemistry:45,recruitedYear:state.date.year,recruitedWeek:state.date.week};pc.roster.push(x);
 state.characters[name]=Object.assign(state.characters[name]||{},{name,known:true,gender:"男",age:18+stableAgeOffset(name,9),role:nr,isPro:true,identityType:"職業選手",currentTeam:pc.team,team:pc.team,region:pc.region||fixedTeamRegion(pc.team)||"PCS",acquaintanceSource:`${pc.team} 戰隊`,socialContact:true,rating});
 p.relations[name]=p.relations[name]??50;p.proFriends=p.proFriends||[];if(!p.proFriends.includes(name))p.proFriends.push(name);
 state.logs.push(`✍️ ${pc.team} 在${reason}後補進 ${name}（${nr}｜能力 ${rating}），填補一軍空缺。`);return x;
}
function repairCurrentProRosterVacancies(reason="陣容校正"){
 const p=state.player,pc=p.proCareer;if(!pc?.team||!isProfessionalStage())return;pc.roster=Array.isArray(pc.roster)?pc.roster:[];
 // A player recorded as sold away from the current club must never be restored by the fixed default roster.
 const sold=new Set([...(pc.transferMarket?.history||[]),...(pc.transferMarket?.listings||[])].filter(x=>x?.status==="已成交"&&x.team===pc.team&&x.name!==p.name).map(x=>x.name));
 pc.roster=pc.roster.filter(x=>x?.name&&!sold.has(x.name));
 const roles=["上路","打野","中路","ADC","輔助"],myRole=normalizeRole(p.role)==="下路"?"ADC":normalizeRole(p.role);
 let me=pc.roster.find(x=>x.isPlayer||x.name===p.name);if(!me){me={name:p.name,role:myRole||"中路",isPlayer:true,relation:100,trust:100,chemistry:100};pc.roster.push(me)}else{me.name=p.name;me.role=myRole||me.role;me.isPlayer=true;me.isSub=false}
 roles.forEach(role=>{if(role===normalizeRole(me.role))return;if(!pc.roster.some(x=>!x.isSub&&normalizeRole(x.role)===role))signImmediateRosterReplacement(role,reason)});
}
function ensureProRoster(){
 const p=state.player,pc=p.proCareer;if(!pc?.team)return;pc.roster=Array.isArray(pc.roster)?pc.roster:[];pc.coaches=Array.isArray(pc.coaches)?pc.coaches:[];
 // Only create the fixed five once. Existing rosters are persistent and may change through transfers.
 if(!pc.roster.length){
  const roles=["上路","打野","中路","ADC","輔助"],pr=normalizeRole(p.role)==="下路"?"ADC":normalizeRole(p.role),pi=Math.max(0,roles.indexOf(pr)),baseNames=[...(PRO_ROSTER_NAMES[pc.team]||["韓曜辰","周凱文","季凌川","林承皓","江允澤"])];
  baseNames[pi]=p.name;pc.roster=baseNames.map((name,i)=>({name,role:roles[i],isPlayer:i===pi,relation:i===pi?100:(p.relations[name]??rand(48,68)),trust:i===pi?100:rand(48,70),chemistry:i===pi?100:rand(45,68)}));
 }
 if(!isTransferWindow()||isTransferWindowFinalWeek())repairCurrentProRosterVacancies("轉會窗截止前補強");
 if(!pc.coaches.length){pc.coaches=coachNamesForTeam(pc.team,pc.region||"PCS");pc.coachJoinedYear=state.date.year}
 [...pc.roster,...pc.coaches].forEach(x=>{if(x.isPlayer)return;const isCoach=String(x.role||"").includes("教練");if(!state.characters[x.name])state.characters[x.name]={name:x.name,known:true,gender:"男",age:isCoach?32+stableAgeOffset(x.name,12):18+stableAgeOffset(x.name,10),role:x.role,isProStaff:isCoach,isPro:!isCoach,traits:[["冷靜","努力","直率","溫和"][stableAgeOffset(x.name,4)]]};const c=state.characters[x.name];c.known=true;c.socialContact=true;if(isCoach){c.isPro=false;c.isProStaff=true;c.identityType="教練";c.currentTeam=pc.team;c.currentRole=x.role;c.role=x.role;c.acquaintanceSource=`${pc.team} 戰隊`;delete c.formerTeam}else{c.isPro=true;c.currentTeam=pc.team;c.team=pc.team;c.region=pc.region||fixedTeamRegion(pc.team)||"PCS"}p.relations[x.name]=p.relations[x.name]??x.relation??55;p.proFriends=p.proFriends||[];if(!p.proFriends.includes(x.name))p.proFriends.push(x.name)});
}

function isPlaceholderPersonName(name){
 const n=String(name||"").trim();if(!n)return true;
 return /^(女粉絲|粉絲|神秘女子|路人|某選手|陌生人|酒吧女性|國外女性|對手)\d*$/i.test(n)
   || /^(上路|打野|中路|ADC|下路|輔助|射手)玩家\d+$/i.test(n)
   || /^(男|女)(上路|打野|中路|ADC|下路|輔助|射手)玩家\d+$/i.test(n)
   || /^(LCK|LPL|LEC|LCS|PCS)\s+(Spring|Summer)\s+#\d+(?:\s+(上路|打野|中路|ADC|下路|輔助))?$/i.test(n)
   || /^(LCK|LPL|LEC|LCS|PCS)\s+#\d+(?:\s+(上路|打野|中路|ADC|下路|輔助))?$/i.test(n);
}
const GLOBAL_PRO_TEAMS={
 LCK:["Seoul Crown","Busan Storm","Han River Fox","Incheon Nova","Daejeon Falcons","Daegu Titans","Gwangju Blaze","Suwon Guardians","Jeonju Royals","Ulsan Waves","Jeju Tempest","Goyang Stars"],
 LPL:["Shanghai Dragons","Beijing Pulse","Chengdu Blaze","Hangzhou Tide","Wuhan Phoenix","Nanjing Wolves","Shenzhen Thunder","Guangzhou Lions","Suzhou Eclipse","Chongqing Forge","Xi'an Dynasty","Tianjin Harbor"],
 LEC:["Berlin Knights","Paris Arc","Madrid Solar","London Forge","Rome Legion","Amsterdam Orbit","Stockholm Aurora","Copenhagen Ravens","Vienna Vanguard","Prague Golems","Lisbon Navigators","Warsaw Hussars"],
 LCS:["LA Comets","New York Guard","Austin Rift","Seattle Waves","Chicago Cyclones","Miami Surge","Boston Sentinels","San Francisco Pulse","Dallas Outlaws","Denver Summit","Toronto North","Vancouver Orcas"],
 PCS:["KNG Esports","Nova Gaming","Titan Core","Astra Five","Vortex","Eclipse","Phoenix","Orion","Tempest","Mirage","Vertex","Radiant"]
};
const TEAM_REGION_BASE=Object.fromEntries(Object.entries(GLOBAL_PRO_TEAMS).flatMap(([r,teams])=>teams.map(t=>[t,r])));
const REGION_DEFAULT_RESIDENCE={LCK:{country:"韓國",city:"首爾"},LPL:{country:"中國",city:"上海"},LEC:{country:"德國",city:"柏林"},LCS:{country:"美國",city:"洛杉磯"},PCS:{country:"台灣",city:"台北"}};
function fixedTeamRegion(team){
 const pc=state?.player?.proCareer||{};if(!team)return pc.region||"PCS";
 if(pc.leagueTeamOverrides)for(const r of PRO_REGIONS)if((pc.leagueTeamOverrides[r]||[]).includes(team))return r;
 return TEAM_REGION_BASE[team]||null;
}
function regionTeams(region){
 const pc=state?.player?.proCareer||{},base=[...(GLOBAL_PRO_TEAMS[region]||[])],extra=pc.leagueTeamOverrides?.[region]||[];
 for(const t of extra)if(t&&!base.includes(t))base[base.length-1]=t;
 return [...new Set(base)].slice(0,12);
}
function registerLegacyTeam(team,region){
 if(!team||!region||TEAM_REGION_BASE[team])return;const pc=state.player.proCareer;pc.leagueTeamOverrides=pc.leagueTeamOverrides||{};pc.leagueTeamOverrides[region]=pc.leagueTeamOverrides[region]||[];
 if(!pc.leagueTeamOverrides[region].includes(team))pc.leagueTeamOverrides[region].push(team);
}
function repairTeamRegionAndHistory(){
 const pc=state.player.proCareer;if(!pc)return;pc.transferHistory=pc.transferHistory||[];
 const logs=(state.logs||[]).filter(x=>/正式轉會：/.test(x));
 for(const line of logs){const m=String(line).match(/正式轉會：(.+?) → (.+?)(?:，|$)/);if(!m)continue;const old=m[1].trim(),now=m[2].trim();if(!pc.transferHistory.some(x=>x.from===old&&x.to===now)){const oldRegion=fixedTeamRegion(old)||pc.region||"PCS";pc.transferHistory.push({from:old,to:now,fromRegion:oldRegion,toRegion:fixedTeamRegion(now)||null,legacy:true});registerLegacyTeam(old,oldRegion)}}
 const r=fixedTeamRegion(pc.team);if(r)pc.region=r;
}
const REGION_PRO_NAMES={
 LCK:["Park Min-jun","Kim Do-yun","Lee Hyun-woo","Choi Jun-seo","Jung Si-woo","Kang Tae-yang","Han Ji-ho","Yoon Seung-min","Seo Woo-jin","Lim Jae-hyun"],
 LPL:["陳景曜","周奕衡","林澤宇","顧承安","沈曜","葉子謙","唐昊然","蘇景川","許墨","江予辰"],
 LEC:["Luca Moretti","Noah Fischer","Elias Novak","Theo Martin","Milan Kovac","Oscar Lind","Leo Wagner","Hugo Costa","Felix Meyer","Adam Laurent"],
 LCS:["Ethan Cole","Ryan Park","Mason Lee","Logan Reed","Caleb Stone","Dylan Chen","Owen Brooks","Aiden Kim","Lucas Grant","Nate Wilson"],
 PCS:["沈奕辰","顧言澈","許哲宇","陸子昂","程以安","高宇謙","陳柏勳","葉知衡","吳昊恩","方子墨"]
};
function ensureGlobalProDatabase(){
 const p=state.player,pc=p.proCareer;pc.proDatabase=pc.proDatabase||{};const roles=["上路","打野","中路","ADC","輔助"];
 PRO_REGIONS.forEach(region=>{pc.proDatabase[region]=pc.proDatabase[region]||{};regionTeams(region).forEach((team,ti)=>{
   if(pc.proDatabase[region][team])return;
   pc.proDatabase[region][team]=roles.map((role,ri)=>{
     const pool=REGION_PRO_NAMES[region],base=pool[(ti*5+ri)%pool.length],name=ti<2?base:`${base} ${ti+1}`;
     const age=18+stableAgeOffset(name,10),rating=clamp(70+stableAgeOffset(name+"r",24)+(region==="LCK"?4:region==="LPL"?2:region==="PCS"?-2:0),60,97);
     return {name,team,region,role,age,birthYear:state.date.year-age,rating,active:true,retired:false,contractYears:1,salary:50000+rating*2500};
   });
 })});
 return pc.proDatabase;
}
function actualTeamForSlot(slot){
 if(!/^(LCK|LPL|LEC|LCS|PCS)\s+(Spring|Summer)\s+#(\d)$/i.test(slot||""))return slot;
 const m=slot.match(/^(LCK|LPL|LEC|LCS|PCS)\s+(Spring|Summer)\s+#(\d)$/i),region=m[1].toUpperCase(),rank=Number(m[3]),teams=regionTeams(region);
 return teams[(rank-1)%teams.length]||slot;
}
function actualProOpponent(team,role){
 const pc=state.player.proCareer,db=ensureGlobalProDatabase(),realTeam=actualTeamForSlot(team),r=role==="下路"?"ADC":role;
 for(const region of PRO_REGIONS){const roster=db[region]?.[realTeam];if(roster){const x=roster.find(v=>v.role===r&&v.active&&!v.retired)||roster.find(v=>v.active&&!v.retired);if(x)return x}}
 return null;
}
function addSocialAcquaintance(name,relation=20,meta={}){
 const p=state.player;if(!name||name===p.name||isPlaceholderPersonName(name))return null;
 state.characters=state.characters||{};let c=state.characters[name];
 if(!c)c=state.characters[name]={name,known:true,...meta};
 else Object.assign(c,meta,{known:true});
 c.socialContact=true;c.metYear=c.metYear||state.date.year;c.metWeek=c.metWeek||state.date.week;
 c.acquaintanceSource=c.acquaintanceSource||meta.acquaintanceSource||inferAcquaintanceSource(c);
 c.identityType=c.identityType||meta.identityType||identityTypeFor(name);
 const pro=confirmedProfessionalRecord(name);
 if(pro){c.isPro=true;c.team=pro.team;c.role=pro.role}
 else if(c.identityType!=="職業選手"){c.isPro=false;if(!c.isProStaff){delete c.team;delete c.region}}
 p.relations[name]=p.relations[name]??relation;
 p.proFriends=p.proFriends||[];
 if(isProfessionalStage()&&!p.proFriends.includes(name))p.proFriends.push(name);
 return c;
}
function proSocialAllowed(c){
 const p=state.player,pc=p.proCareer;if(!isProfessionalStage())return true;
 const importantPreg=new Set((p.adultLife?.pregnancies||[]).map(x=>x.name));
 const roster=new Set([...(pc.roster||[]).map(x=>x.name),...(pc.coaches||[]).map(x=>x.name)]);
 return roster.has(c.name)||importantPreg.has(c.name)||(p.romance?.partners||[]).includes(c.name)||(p.proFriends||[]).includes(c.name)||c.socialContact||c.important||c.isRival||c.formerTeammate;
}

const PRO_REGIONS=["PCS","LCK","LPL","LEC","LCS"];
const careerMonthFromWeek=w=>Math.min(12,Math.max(1,Math.floor(((Math.max(1,w)-1)*12)/52)+1));
const INTERNATIONAL_HOSTS=[
 {country:"韓國",city:"首爾"},{country:"韓國",city:"釜山"},{country:"日本",city:"東京"},{country:"日本",city:"大阪"},
 {country:"中國",city:"上海"},{country:"中國",city:"成都"},{country:"台灣",city:"台北"},{country:"新加坡",city:"新加坡"},
 {country:"法國",city:"巴黎"},{country:"德國",city:"柏林"},{country:"英國",city:"倫敦"},{country:"西班牙",city:"馬德里"},
 {country:"美國",city:"洛杉磯"},{country:"美國",city:"紐約"},{country:"加拿大",city:"溫哥華"},{country:"加拿大",city:"多倫多"}
];
function monthWeekRange(month){const start=Math.floor((month-1)*52/12)+1,end=Math.floor(month*52/12);return [start,end]}
function proAnnualPhase(){
 const m=careerMonthFromWeek(state.date.week);
 if(m===1)return "冬季轉會期";if(m>=2&&m<=4)return "春季聯賽";if(m===5)return "春季季後賽";if(m===6)return "MSI";
 if(m===7)return "夏季轉會期";if(m>=8&&m<=10)return "夏季聯賽";if(m===11)return "夏季季後賽";return "世界賽";
}
function ensureCareerHistory(){
 const p=state.player;p.achievements=p.achievements||[];p.awards=p.awards||[];p.internationalExperience=p.internationalExperience||{MSI:0,世界賽:0,國際BO5:0};
 p.proCareer.yearbook=p.proCareer.yearbook||{};return p.achievements;
}
function addAchievement(id,title,detail="",year=state.date.year,retro=false){
 const p=state.player;ensureCareerHistory();if(p.achievements.some(a=>a.id===id&&a.year===year))return;
 p.achievements.unshift({id,title,detail,year,team:p.proCareer?.team||"",retro,week:state.date.week});state.logs.push(`🏅 成就解鎖：${title}`);
}

function recordDomesticChampion1979(seasonName,team,year=state.date.year,retro=false){
 const pc=state.player.proCareer,region=pc.region||fixedTeamRegion(team)||"PCS",season=/夏/.test(seasonName)?"夏季":"春季";
 addAchievement(`domestic-${region}-${season}`,`${region}${season}賽冠軍`,`${team}奪冠`,year,retro);evaluateCareerMilestones1979();
}
function careerTitleYears1979(rx){return (state.player.achievements||[]).filter(a=>rx.test(a.title||"")).map(a=>a.year)}
function evaluateCareerMilestones1979(){
 ensureCareerHistory();const a=state.player.achievements||[],has=rx=>a.some(x=>rx.test(x.title||""));
 if(has(/春季賽冠軍/)&&has(/夏季賽冠軍/)&&has(/^MSI冠軍$/)&&has(/世界賽冠軍/))addAchievement("career-grand-slam","生涯大滿貫","生涯曾取得春季、MSI、夏季與世界賽冠軍",state.date.year,false);
 const years=[...new Set(a.map(x=>x.year))];for(const y of years){const yy=a.filter(x=>x.year===y),ok=[/春季賽冠軍/,/^MSI冠軍$/,/夏季賽冠軍/,/世界賽冠軍/].every(rx=>yy.some(x=>rx.test(x.title||"")));if(ok)addAchievement(`golden-road-${y}`,"燦金之路",`${y} 同年包辦春季、MSI、夏季與世界賽冠軍`,y,false)}
 for(const [kind,rx] of [["MSI",/^MSI冠軍$/],["世界",/世界賽冠軍/]]){const ys=careerTitleYears1979(rx);if(ys.length>=3)addAchievement(`dynasty-${kind}`,`${kind}王朝之路`,`生涯取得至少3座${kind==="MSI"?"MSI":"世界賽"}冠軍`,state.date.year,false)}
}
function awardInternationalTitle1979(kind,team){
 const p=state.player,pc=ensureCareer20(),f=pc.clubFinance,world=kind==="世界賽",prize=world?45000000:22000000;f.cash+=prize;f.revenue+=prize;f.prizeRevenue=(f.prizeRevenue||0)+prize;
 pc.championMerch=pc.championMerch||[];const item={id:`${state.date.year}-${kind}`,year:state.date.year,event:kind,team,permanent:true,limitedWeeks:8,playerShare:pc.merchShare||.10};if(!pc.championMerch.some(x=>x.id===item.id))pc.championMerch.unshift(item);
 const finalMvp=Math.random()<(world?.52:.45);if(finalMvp){addAchievement(`${kind}-finals-mvp`,`${kind}決賽FMVP`,`國際賽決賽最有價值選手，市場身價大幅提升`,state.date.year,false);pc.finalMvpBoostUntil=state.date.year+2;p.followers+=world?120000:65000;p.adultLife.careerReputation=clamp(p.adultLife.careerReputation+(world?8:5),0,100);state.news.unshift(`🏅 ${p.name} 獲選 ${state.date.year} ${kind} 決賽FMVP，身價與商業價值暴漲。`)}else{const mates=(pc.roster||[]).filter(x=>!x.isPlayer),fm=mates.length?mates[stableAgeOffset(`${kind}${state.date.year}`,mates.length)]:null;if(fm){fm.finalMvp=(fm.finalMvp||0)+1;fm.rating=clamp((fm.rating||75)+2,45,99);state.news.unshift(`🏅 ${fm.name} 獲選 ${state.date.year} ${kind} 決賽FMVP。`)}}
 state.news.unshift(`💰 ${team} 因${kind}奪冠獲得 NT$${prize.toLocaleString()} 賽事獎金，並推出永久冠軍紀念商品；選手依肖像／商業權取得分紅。`);evaluateCareerMilestones1979();
}
function backfillDomesticTitles1979(){
 const pc=state.player.proCareer,arc=pc.playoffArchive||pc.playoffsArchive||state.world?.playoffArchive||{};Object.values(arc||{}).forEach(b=>{if(b?.champion===pc.team&&b?.year&&b?.seasonName)recordDomesticChampion1979(b.seasonName,pc.team,b.year,true)});
 const sn=pc.season;if(sn?.champion===pc.team&&sn?.seasonName)recordDomesticChampion1979(sn.seasonName,pc.team,state.date.year,true);
 // 2031 screenshot-era repair: if the current spring bracket already names the player's team champion, preserve it permanently.
 const key=`${state.date.year}-春季-${pc.region||"PCS"}`,b=ensurePlayoffArchive?.()?.[key];if(b?.champion===pc.team)recordDomesticChampion1979("春季",pc.team,state.date.year,true);
 evaluateCareerMilestones1979();
}
function enforceSevenManRoster1979(){const pc=state.player.proCareer;if(!Array.isArray(pc.roster))return;const starters=pc.roster.filter(x=>!x.isSub).slice(0,5),subs=pc.roster.filter(x=>x.isSub).slice(0,2);pc.roster=[...starters,...subs];pc.substitutes=subs}
function migrateProV1979(){const p=state.player;if(p.v1979Migrated)return;if(isProfessionalStage()){backfillDomesticTitles1979();enforceSevenManRoster1979();const pc=ensureCareer20();pc.worldEra=pc.worldEra||{rareGeniusLastYear:0};state.logs.push("🆕 V1.9.7.9：冠軍王朝篇啟用：國內冠軍永久履歷／大滿貫／燦金之路／三冠王朝、國際決賽FMVP與冠軍獎金商品、7人一軍上限、簡化轉會市場；Scrim改為成長實際選擇的戰術體系。")}p.v1979Migrated=true}
function repairPrematureTitles1981(){
 const p=state.player;if(!isProfessionalStage())return;ensureCareerHistory();const y=state.date.year,m=careerMonthFromWeek(state.date.week),a=p.achievements||[];
 // A current-year summer title cannot exist before the November summer playoffs have actually been completed.
 const summerFinished=(()=>{if(m<11)return false;const pc=p.proCareer||{},arc=pc.playoffArchive||pc.playoffsArchive||state.world?.playoffArchive||{};return Object.values(arc||{}).some(b=>b?.year===y&&/夏/.test(b?.seasonName||b?.season||"")&&b?.champion===pc.team&&b?.finished!==false) || (pc.season?.year===y&&/夏/.test(pc.season?.seasonName||"")&&pc.season?.champion===pc.team&&pc.season?.finished);})();
 if(!summerFinished){
  const before=a.length;p.achievements=a.filter(x=>!(x.year===y&&(/夏季賽冠軍/.test(x.title||"")||/燦金之路/.test(x.title||"")||/生涯大滿貫/.test(x.title||""))));
  if(before!==p.achievements.length)state.logs.push(`🛠️ ${y} 夏季賽尚未完成：已移除提前產生的夏季冠軍／大滿貫成就。`);
 }
 // Re-evaluate only from championships that have truly been earned and persisted.
 evaluateCareerMilestones1979();
 p.v1981PrematureTitleRepair=true;
}

function migrateProV1982(){const p=state.player;if(p.v1982Migrated)return;if(isProfessionalStage()){const pc=ensureCareer20(),f=pc.clubFinance;if(Number(f.cash)<0){f.salaryArrears=(f.salaryArrears||0)+Math.abs(Number(f.cash));f.cash=0;f.financeCrisis=true;state.logs.push("🛠️ V1.9.8.2：舊存檔的俱樂部負現金已轉為應付款／欠薪，現金校正為0。")}Object.values(pc.legacy?.enemies||{}).forEach(e=>{if(!Number.isFinite(e.hostility))e.hostility=75})}p.v1982Migrated=true}
function migrateProV1981(){const p=state.player;if(p.v1981Migrated)return;if(isProfessionalStage()){repairPrematureTitles1981();state.logs.push("🛠️ V1.9.8.1：修正未開賽的夏季聯賽被提前回溯為冠軍，並同步撤銷因此誤判的生涯大滿貫／燦金之路。")}p.v1981Migrated=true}
function clubMerchCard1982(){if(!isProfessionalStage())return "";const pc=ensureCareer20(),f=pc.clubFinance,items=f.clubMerch||[];return `<section class="card"><h2>🛍️ ${pc.team} 選手周邊商店</h2><div class="notice">本年戰隊周邊營收 NT$${Math.round(f.merchRevenue||0).toLocaleString()}｜俱樂部會自行推出明星／人氣選手商品，不需要夜鋒親自經營。</div>${items.length?items.slice(0,6).map(x=>`<div class="log"><strong>${x.name}</strong><br>累計售出 ${Math.round(x.units||0).toLocaleString()} 件｜營收 NT$${Math.round(x.revenue||0).toLocaleString()}</div>`).join(""):`<div class="small">目前尚無常態選手商品；俱樂部會依明星度、戰績與商業評估推出新品。</div>`}</section>`}
function championMerchCard1979(){if(!isProfessionalStage())return "";const pc=ensureCareer20(),arr=pc.championMerch||[];if(!arr.length)return "";return `<section class="card"><h2>👕 冠軍紀念商品</h2><div class="small">冠軍紀念商品永久保留；奪冠初期有銷售高峰，選手依合約肖像／商業權比例分紅。</div><div class="log">${arr.slice(0,8).map(x=>`<strong>${x.year} ${x.event}冠軍紀念系列</strong>｜${x.team}<br>永久商品｜夜鋒分紅比例 ${Math.round((x.playerShare||.1)*100)}%`).join("<br><br>")}</div></section>`}
function bigMatchStoryCard1979(){if(!isProfessionalStage())return "";const pc=state.player.proCareer,phase=proAnnualPhase();if(!/MSI|世界賽|季後賽/.test(phase))return "";const a=state.player.achievements||[],world=a.filter(x=>/世界賽冠軍/.test(x.title||"")).length,msi=a.filter(x=>/^MSI冠軍$/.test(x.title||"")).length,lines=[];if(phase==="世界賽"){if(world)lines.push(`傳奇再臨：夜鋒帶著 ${world} 座世界冠軍履歷再次挑戰世界舞台。`);if(world>=1)lines.push(`王朝挑戰：本屆若再度奪冠，將向世界三冠王朝更進一步。`)}if(phase==="MSI"&&msi)lines.push(`MSI榮耀：夜鋒目前已有 ${msi} 座MSI冠軍，將繼續累積國際賽歷史。`);const opp=currentScheduledProMatch?.()?.opp||currentInternationalMatch?.()?.opp;if(opp)lines.push(`焦點對手：${pc.team} 下一戰將面對 ${opp}。`);return `<section class="card"><h2>🔥 大賽賽前看點</h2><div class="log">${(lines.length?lines:["新王與老將的故事將依本屆實際參賽名單、冠軍履歷與對戰歷史持續生成。"]).join("<br><br>")}</div></section>`}
function achievementCard(){
 ensureCareerHistory();const a=state.player.achievements||[];
 return `<section class="card"><h2>🏅 成就室</h2>${a.length?`<div class="log">${a.slice(0,30).map(x=>`${x.title}｜${x.year}${x.team?`｜${x.team}`:""}${x.retro?"｜歷史回溯":""}${x.detail?`<br><span class="small">${x.detail}</span>`:""}`).join("<br><br>")}</div>`:`<p class="small">尚未取得正式成就。</p>`}</section>`;
}
function backfillAchievements(){
 const p=state.player;ensureCareerHistory();const pc=p.proCareer,cs=pc.careerStats||{};
 if(cs.matches>0)addAchievement("first-pro","職業生涯首次出賽","由舊存檔比賽紀錄回溯",state.date.year,true);
 if((cs.mvp||0)>0)addAchievement("first-mvp","首次職業MVP","由舊存檔MVP紀錄回溯",state.date.year,true);
 if(pc.season?.champion===pc.team){
   addAchievement("domestic-champion","國內聯賽冠軍","由既有冠軍紀錄回溯",state.date.year,true);
 }
 if((p.rank?.tier||"")==="菁英")addAchievement("elite","首次登上菁英","由現有Rank紀錄回溯",state.date.year,true);
}
function stableAgeOffset(name,span){
 let h=0;for(const ch of String(name||""))h=(h*31+ch.charCodeAt(0))>>>0;return span? h%span:0;
}
function inferCharacterAge(c){
 const p=state.player,desc=String(c?.desc||""),role=String(c?.role||""),name=String(c?.name||"");
 if(name==="林雨晴"||name==="許安然"||/同班同學|國中同學|同屆同學|高中好友|同班好友/.test(desc))return p.age;
 if(/學妹|高一/.test(desc))return Math.max(16,p.age-1);
 if(/學姊|高三/.test(desc))return p.age+1;
 if(c?.isProStaff||role.includes("教練")){
   if(/助教|分析/.test(role))return 27+stableAgeOffset(name,8);
   return 32+stableAgeOffset(name,13);
 }
 if(c?.isPro){
   if(Number.isFinite(c.proSinceYear)){
     const years=Math.max(0,state.date.year-c.proSinceYear);
     return clamp(18+years+stableAgeOffset(name,4),18,34);
   }
   return 18+stableAgeOffset(name,10); // 18–27，固定依姓名分布，不再全員22
 }
 if(c?.nationality||role.includes("國際賽"))return 19+stableAgeOffset(name,9);
 if(role==="粉絲")return 18+stableAgeOffset(name,11);
 if(/星探|經紀|記者|工作人員/.test(role))return 25+stableAgeOffset(name,16);
 return Number.isFinite(c.age)?c.age:p.age;
}
function ensureAges(forceStoryRules=false){
 const p=state.player;if(!Number.isFinite(p.age))p.age=18;
 Object.values(state.characters||{}).forEach(c=>{
   if(!c||!c.name)return;
   const inferred=inferCharacterAge(c);
   const storyFixed=c.name==="林雨晴"||c.name==="許安然"||/同班同學|國中同學|同屆同學/.test(String(c.desc||""));
   const suspiciousProAge=forceStoryRules&&c.isPro&&c.age===22;
   if(!Number.isFinite(c.age)||forceStoryRules&&storyFixed||suspiciousProAge)c.age=inferred;
   // Repair obviously impossible student ages left by V1.8.0 random migration.
   if(/同班同學|國中同學|高中好友|同班好友/.test(String(c.desc||""))&&Math.abs(c.age-p.age)>1)c.age=inferred;
   if(/學妹/.test(String(c.desc||""))&&c.age>=p.age)c.age=Math.max(16,p.age-1);
   if(/學姊/.test(String(c.desc||""))&&c.age<=p.age)c.age=p.age+1;
   // Keep established birth years stable; recalculating them every load caused age drift.
   if(!Number.isFinite(c.birthYear))c.birthYear=state.date.year-c.age;
   if(c.isPro&&!Number.isFinite(c.proSinceYear))c.proSinceYear=Math.max(state.date.year-(Math.max(18,c.age)-18),state.date.year-10);
 });
}
const FIXED_MID_EXPANSION_HEROES=[
 {id:"mid_duskwalker",name:"燼夜行者",type:"刺客",lane:"中路"},
 {id:"mid_luofei",name:"洛緋",type:"法師",lane:"中路"},
 {id:"mid_astrologer",name:"星界司辰",type:"法師",lane:"中路"},
 {id:"mid_helan",name:"赫嵐",type:"戰士",lane:"中路"},
 {id:"mid_frostspeaker",name:"霜語者",type:"法師",lane:"中路"}
];
function ensureFixedMidExpansionHeroes(){
 const p=state.player;p.mastery=p.mastery||{};
 FIXED_MID_EXPANSION_HEROES.forEach(h=>{
   const found=HEROES.find(x=>x.id===h.id);
   if(!found)HEROES.push({...h});
   else Object.assign(found,h);
   if(!p.mastery[h.id])p.mastery[h.id]={level:3,games:0,wins:0};
 });
}
const ANNUAL_HERO_NAME_SETS=[
 ["霧華","曜辰","緋羽","蒼牙","璃歌"],
 ["玄燼","曦刃","星紗","嵐矢","靈汐"],
 ["夜麟","赤霄","月璃","逐風","白澤"],
 ["蒼珀","影棘","星鑄","流螢","青祈"],
 ["焰牙","霜羽","天璇","疾影","雨歌"]
];
function annualHeroNames(year){
 const set=ANNUAL_HERO_NAME_SETS[Math.abs(Number(year)||0)%ANNUAL_HERO_NAME_SETS.length];
 return [...set];
}
function ensureAnnualHeroDefinitions(year){
 const p=state.player,names=annualHeroNames(year),types=["刺客","爆發法師","控制法師","戰士法師","炮台法師"];
 for(let i=0;i<5;i++){
   const id=`y${year}_${i}`,name=names[i];
   if(!HEROES.some(h=>h.id===id))HEROES.push({id,name,type:types[i],lane:"中路"});
   p.mastery=p.mastery||{};p.mastery[id]=p.mastery[id]||{level:3,games:0,wins:0};
 }
}
function ensureSavedAnnualHeroes(){
 const p=state.player;(p.heroYears||[]).forEach(y=>ensureAnnualHeroDefinitions(y));
}
function addAnnualHeroes(year){
 const p=state.player;p.heroYears=p.heroYears||[];
 const firstTime=!p.heroYears.includes(year);
 if(firstTime)p.heroYears.push(year);
 ensureAnnualHeroDefinitions(year);
 if(firstTime){
   const names=annualHeroNames(year);
   state.news.unshift(`🎮 ${year}賽季新增5名中路英雄：${names.join("、")}。聯盟需要重新適應版本。`);
 }
}
function annualNpcCareerLifecycle(year){
 const p=state.player,pc=p.proCareer,db=ensureGlobalProDatabase();pc.proCareerNews=pc.proCareerNews||[];
 Object.values(db).forEach(region=>Object.values(region).forEach(roster=>roster.forEach(x=>{
   if(!x.active||x.retired)return;
   x.age++;x.birthYear=year-x.age;
   if(x.age>=26)x.rating=clamp(x.rating-(.25+(x.age-25)*.28)*Math.random(),45,100);
   const old=x.age>=29,elite=x.rating>=86,retireChance=x.age<28?0:x.age===28?.03:x.age===29?.07:x.age===30?.13:clamp(.18+(x.age-31)*.10,0,.70);
   if(Math.random()<retireChance-(elite?.04:0)){x.retired=true;x.active=false;x.careerStatus="退役";pc.proCareerNews.unshift(`${year}｜${x.name}（${x.team}・${x.role}・${x.age}歲）宣布退役。`);return}
   if(old&&Math.random()<.42){x.salary=Math.round(x.salary*(.72+Math.random()*.16)/1000)*1000;x.contractYears=1;x.careerStatus="降薪續戰一年";pc.proCareerNews.unshift(`${year}｜老將 ${x.name} 選擇降薪，以一年約續戰 ${x.team}。`)}
   else if(x.age>=28&&x.rating<76&&Math.random()<.34){x.active=false;x.careerStatus="未獲續約／自由人";pc.proCareerNews.unshift(`${year}｜${x.name} 因年齡與近況未獲 ${x.team} 續約，成為自由人。`)}
   else{x.contractYears=1;x.careerStatus=old?"一年短約續約":"續約";}
 })));
}
function syncCanonicalAges(){
 const p=state.player;
 // Keep a stable birth year once established; age must never be incremented by both year rollover and birthday.
 if(!Number.isFinite(p.birthYear))p.birthYear=state.date.year-(Number(p.age)||16);
 Object.values(state.characters||{}).forEach(c=>{
   if(!c||!c.name)return;
   if(!Number.isFinite(c.birthYear)&&Number.isFinite(c.age))c.birthYear=state.date.year-c.age;
   // Story relationships have a fixed age gap to Nightblade and must age together.
   const d=String(c.desc||"");
   if(c.name==="林雨晴"||c.name==="許安然"||/同班同學|國中同學|同屆同學|高中好友|同班好友/.test(d)){
     c.age=p.age;c.birthYear=p.birthYear;
   }else if(/學妹|高一/.test(d)){
     c.age=Math.max(16,p.age-1);c.birthYear=p.birthYear+1;
   }else if(/學姊|高三/.test(d)){
     c.age=p.age+1;c.birthYear=p.birthYear-1;
   }
 });
}
function migrateProV1941(){
 const p=state.player;if(p.v1941AgeFixed)return;
 // Saves affected by the former double-aging path are one year too old at this point.
 // Correct the protagonist once, then anchor all story-relative NPC ages to the corrected age.
 if(Number.isFinite(p.age)&&p.age>=18)p.age=Math.max(16,p.age-1);
 p.birthYear=state.date.year-p.age;
 p.v1941AgeFixed=true;
 syncCanonicalAges();
 state.logs?.push(`🎂 V1.9.4.1：修正年齡重複成長；夜鋒目前 ${p.age} 歲，同學／學妹／學姊年齡已同步校正。`);
}

function migrateProV1951AgeRepair(){
 const p=state.player,pc=p.proCareer||{};if(p.v1951AgeFixed)return;
 // Canonical pro timeline: Nightblade enters the top league at age 18 and gains exactly one year per season.
 // Use the recorded debut year instead of the previously corrupted age counter.
 const debutYear=Number(pc.proDebutYear||pc.joinedAt?.year);
 if(Number.isFinite(debutYear)&&state.date.year>=debutYear){
   p.age=Math.max(18,18+(state.date.year-debutYear));
 }
 // Mark all birthdays through the current calendar point as already accounted for, so syncCalendarFields
 // cannot immediately add the old duplicated years again. The next real May birthday will add exactly one.
 p.birthdaysPassed=Math.max(0,(state.date.year-2026)+(state.date.week>=35?1:0));
 p.birthYear=state.date.year-p.age;
 p.v1951AgeFixed=true;
 syncCanonicalAges();
 state.logs?.push(`🎂 V1.9.5.1：依18歲職業出道時間線重新校正年齡；夜鋒目前 ${p.age} 歲，同學同歲、學妹小1歲、學姊大1歲。`);
}

function migrateProV1952AgeTimelineRepair(){
 const p=state.player;if(p.v1952AgeTimelineFixed)return;
 // Canonical story timeline: Sep 2026 starts at 16; each new season/year adds exactly one year.
 // Therefore 2028=18 (pro-league entry) and 2030=20. Do not trust legacy age/birthYear/debut fields,
 // because older migrations could already have stored the duplicated +2/year value.
 const canonicalAge=Math.max(16,16+(Number(state.date.year||2026)-2026));
 p.age=canonicalAge;
 p.birthYear=2026-16;
 // Calendar birthday counter is synchronized without modifying age again.
 p.birthdaysPassed=Math.max(0,(Number(state.date.year||2026)-2026)+(Number(state.date.week||1)>=35?1:0));
 p.v1952AgeTimelineFixed=true;
 syncCanonicalAges();
 state.logs?.push(`🎂 V1.9.5.2：重新以2026年16歲的故事時間線校正；${state.date.year}年夜鋒為 ${p.age} 歲，同班／同屆同歲、學妹小1歲、學姊大1歲。`);
}

function annualAgeAndDecline(year){
 const p=state.player;if(p.lastAgingYear===year)return;p.lastAgingYear=year;ensureAges();
 // V1.9.4.1: age is advanced only by the birthday/calendar system.
 // The old annual rollover incremented everyone again, making Nightblade gain 2 years in one year.
 syncCanonicalAges();
 const decline=(obj,stats,age)=>{
   if(age<26)return;const years=age-25,op=Math.min(3.5,.25+years*.28);
   ["對線","團戰"].forEach(k=>{if(Number.isFinite(stats[k]))stats[k]=clamp(stats[k]-Math.random()*op,0,100)});
   if(Number.isFinite(stats.心態))stats.心態=clamp(stats.心態+Math.random()*.7,0,100);
   if(Number.isFinite(stats.溝通))stats.溝通=clamp(stats.溝通+Math.random()*.5,0,100);
 };
 decline(p,p.stats,p.age);
 Object.values(state.characters||{}).forEach(c=>{if(c.isPro&&c.age>=26){c.rating=clamp((c.rating||rand(65,90))-Math.random()*(.3+(c.age-25)*.3),40,100);if(c.age>=31&&Math.random()<.08+(c.age-31)*.04)c.retired=true}});
 annualNpcCareerLifecycle(year);
 state.logs.push(`🎂 ${year} 年度年齡結算完成。26歲以上職業選手開始依個體狀況產生年度衰退。`);
}
function ensureInternationalWorld(){
 const p=state.player,pc=p.proCareer;ensureCareerHistory();
 pc.region=pc.region||"PCS";pc.international=pc.international||{year:state.date.year,regions:{},msi:null,worlds:null};
 const it=pc.international;if(it.year!==state.date.year)pc.international={year:state.date.year,regions:{},msi:null,worlds:null};
 const cur=pc.international;
 PRO_REGIONS.forEach(r=>{if(!cur.regions[r])cur.regions[r]={springTop:["#1 "+r,"#2 "+r],summerTop:["#1 "+r,"#2 "+r,"#3 "+r,"#4 "+r]};});
 return cur;
}
function chooseHost(kind,year){
 const pc=state.player.proCareer,it=ensureInternationalWorld(),key=kind==="MSI"?"msi":"worlds";pc.internationalHostHistory=pc.internationalHostHistory||[];
 if(!it[key]){
  const hist=pc.internationalHostHistory.filter(x=>x.kind===kind&&x.year<year).sort((a,b)=>b.year-a.year),recentCountries=new Set(hist.filter(x=>year-x.year<=3).map(x=>x.country)),recentCities=new Set(hist.filter(x=>year-x.year<=2).map(x=>x.city));
  let pool=INTERNATIONAL_HOSTS.filter(h=>!recentCountries.has(h.country)&&!recentCities.has(h.city));if(!pool.length)pool=INTERNATIONAL_HOSTS.filter(h=>!recentCities.has(h.city));if(!pool.length)pool=INTERNATIONAL_HOSTS;
  const h=pool[Math.abs((year*17+kind.length*13))%pool.length];it[key]={host:{...h},groups:[],stage:"尚未開始",qualified:false};
  if(!pc.internationalHostHistory.some(x=>x.kind===kind&&x.year===year))pc.internationalHostHistory.push({kind,year,country:h.country,city:h.city});
 }
 return it[key]
}
function internationalRecoveryMultiplier(){const ph=proAnnualPhase();return ((ph==="MSI"||ph==="世界賽")&&playerQualifiedForInternational(ph))?.55:1}
function majorEventExperienceFactor(){
 const p=state.player,pc=p.proCareer,roster=pc.roster||[],rookies=roster.filter(x=>x.isPlayer?(p.internationalExperience?.世界賽||0)===0:((state.characters[x.name]?.proSinceYear||state.date.year)===state.date.year)).length;
 const exp=(p.internationalExperience?.世界賽||0)+(p.internationalExperience?.MSI||0)*.7;
 return clamp(exp*.018-rookies*.018,-.10,.10);
}
function internationalTeamRegion(team){
 const text=String(team||"");
 const m=text.match(/^(LCK|LPL|LEC|LCS|PCS)\b/i);if(m)return m[1].toUpperCase();
 for(const r of PRO_REGIONS)if((GLOBAL_PRO_TEAMS[r]||[]).includes(team))return r;
 if(team===state.player.proCareer?.team)return state.player.proCareer?.region||"PCS";
 return null;
}
function ensureInternationalChampionHistory(){
 const pc=state.player.proCareer;pc.internationalChampions=pc.internationalChampions||[];
 return pc.internationalChampions;
}
function recordInternationalChampion(kind,team,region,year=state.date.year){
 const pc=state.player.proCareer,h=ensureInternationalChampionHistory(),r=region||internationalTeamRegion(team)||"未知";
 let x=h.find(v=>v.year===year&&v.event===kind);
 if(!x){x={year,event:kind,team,region:r};h.unshift(x)}else{Object.assign(x,{team,region:r})}
 const it=ensureInternationalWorld(),ev=kind==="MSI"?it.msi:it.worlds;
 if(ev){ev.championTeam=team;ev.championRegion=r;ev.finalized=true}
 const line=`🏆 ${year} ${kind} 冠軍：${team}${r!=="未知"?`（${r}）`:""}`;
 if(!state.logs.includes(line))state.logs.push(line);
 if(!state.news.includes(line))state.news.unshift(line);
 return x;
}
function weightedInternationalChampion(ev){
 const pc=state.player.proCareer,all=[...new Set((ev?.groups||[]).flatMap(g=>g.teams||[]))].filter(Boolean);
 const pool=all.filter(t=>t!==pc.team);if(!pool.length)return pc.team;
 let bag=[];pool.forEach(t=>{const r=internationalTeamRegion(t)||"PCS",w=Math.max(1,Math.round((REGION_STRENGTH[r]||75)-68));for(let i=0;i<w;i++)bag.push(t)});
 return bag[rand(0,bag.length-1)]||pool[0];
}
function finalizeInternationalChampion(ev,kind,forcedTeam=null){
 if(!ev||ev.finalized)return ev?.championTeam||null;
 const team=forcedTeam||weightedInternationalChampion(ev),region=internationalTeamRegion(team)||"未知";
 recordInternationalChampion(kind,team,region,state.date.year);ev.championTeam=team;ev.championRegion=region;ev.finalized=true;
 return team;
}
function finalizePendingInternationalChampion(){
 if(!isProfessionalStage())return;
 const pc=state.player.proCareer,it=pc.international;if(!it)return;
 const week=state.date.week,month=careerMonthFromWeek(week);
 const msi=it.msi,worlds=it.worlds;
 if(msi&&!msi.finalized&&msi.eliminated&&(week>=26||month>=7))finalizeInternationalChampion(msi,"MSI");
 if(worlds&&!worlds.finalized&&worlds.eliminated&&week>=52)finalizeInternationalChampion(worlds,"世界賽");
}
function msiChampionRegionForYear(year=state.date.year){
 const pc=state.player.proCareer,h=ensureInternationalChampionHistory();
 const rec=h.find(x=>x.year===year&&x.event==="MSI");
 return rec?.region||pc.international?.msi?.championRegion||null;
}
function internationalChampionRecentLines(){
 const h=ensureInternationalChampionHistory().filter(x=>x?.team).slice(0,6);
 return h.map(x=>`🏆 ${x.year} ${x.event} 冠軍：${x.team}${x.region?`（${x.region}）`:""}`);
}
function leagueRegularOrder(region){
 const pc=state.player.proCareer,myRegion=pc.region||"PCS";
 if(region===myRegion&&pc.season?.teams?.length){return [...pc.season.teams].sort((a,b)=>(b.w-a.w)||((b.gw-b.gl)-(a.gw-a.gl))).map(x=>x.name).filter(Boolean)}
 return regionTeams(region);
}
function regionSummerPlayoffResult(region){
 const pc=state.player.proCareer,myRegion=pc.region||"PCS",regular=leagueRegularOrder(region),top8=regular.slice(0,8);
 if(region===myRegion&&pc.season?.playoffs){
   const sn=pc.season,played=sn.playoffOpponents||[],round=Number(sn.playoffRound)||0,me=pc.team;
   let champion=null,runnerUp=null,semiLosers=[];
   if(sn.champion===me){champion=me;runnerUp=played[2]||top8.find(x=>x!==me)||null;semiLosers=top8.filter(x=>x!==champion&&x!==runnerUp).slice(0,2)}
   else if(sn.phase==="賽季結束"){
     if(round>=2){runnerUp=me;champion=played[2]||top8.find(x=>x!==me)||null;semiLosers=top8.filter(x=>x!==champion&&x!==runnerUp).slice(0,2)}
     else if(round===1){semiLosers=[me];const finalists=top8.filter(x=>x!==me&&x!==played[0]);champion=finalists[0]||top8[0];runnerUp=finalists[1]||top8[1];const other=top8.find(x=>x!==me&&x!==champion&&x!==runnerUp);if(other)semiLosers.push(other)}
   }
   if(champion&&runnerUp)return {champion,runnerUp,semiLosers:[...new Set(semiLosers)].slice(0,2),regular};
 }
 // 非玩家賽區仍先完整模擬季後賽，再依例行賽排名作同輪淘汰排序。
 const shift=(state.date.year+PRO_REGIONS.indexOf(region))%Math.max(1,Math.min(4,top8.length));
 const champion=top8[shift]||regular[0],runnerUp=top8[(shift+1)%Math.max(1,top8.length)]||regular[1];
 const semiLosers=top8.filter(x=>x!==champion&&x!==runnerUp).slice(0,2);
 return {champion,runnerUp,semiLosers,regular};
}
function worldsSeedsForRegion(region,hasBonus=false){
 const r=regionSummerPlayoffResult(region),picked=[];
 const add=x=>{if(x&&!picked.includes(x))picked.push(x)};
 // 季後賽成績優先：冠軍 #1、亞軍 #2。
 add(r.champion);add(r.runnerUp);
 // #3 為例行賽最高、且尚未因季後賽冠亞軍取得資格者。
 add(r.regular.find(x=>!picked.includes(x)));
 if(hasBonus){
   // MSI 額外 #4：兩支四強敗隊中，以例行賽成績較高者優先；已取得資格者跳過。
   const semis=(r.semiLosers||[]).filter(x=>!picked.includes(x)).sort((a,b)=>r.regular.indexOf(a)-r.regular.indexOf(b));
   add(semis[0]||r.regular.find(x=>!picked.includes(x)));
 }
 // 硬性保證每個賽區名額完整：一般3席、MSI冠軍賽區4席。
 // 若舊存檔的季後賽結果資料不完整或冠亞軍與例行賽欄位重疊，依例行賽順位補足「尚未取得資格」的真實戰隊，絕不留下空席。
 const need=hasBonus?4:3;
 for(const t of r.regular||[]){if(picked.length>=need)break;add(t)}
 for(const t of regionTeams(region)){if(picked.length>=need)break;add(t)}
 return picked.slice(0,need);
}
function buildWorldsGroups(entries,playerTeam){
 const groups=["A","B","C","D"].map(name=>({name,teams:[],standings:[],regions:[]}));
 const ordered=[...entries].sort((a,b)=>(a.team===playerTeam?-1:b.team===playerTeam?1:(a.seed-b.seed)));
 for(const e of ordered){let choices=groups.filter(g=>g.teams.length<4&&!g.regions.includes(e.region));if(!choices.length)choices=groups.filter(g=>g.teams.length<4);choices.sort((a,b)=>a.teams.length-b.teams.length);const g=e.team===playerTeam&&groups[0].teams.length<4&&!groups[0].regions.includes(e.region)?groups[0]:choices[0];g.teams.push(e.team);g.regions.push(e.region)}
 return groups.map(({regions,...g})=>g);
}
function deterministicSeriesWinner(a,b,salt=""){const ra=REGION_STRENGTH[internationalTeamRegion(a)||""]||75,rb=REGION_STRENGTH[internationalTeamRegion(b)||""]||75,h=[...`${a}|${b}|${state.date.year}|${salt}`].reduce((n,c)=>(n*33+c.charCodeAt(0))>>>0,5381)%100;return h<clamp(50+(ra-rb)*2,25,75)?a:b}
function simulateRegionPlayoffBracket(region,seasonName="春季"){
 const regular=leagueRegularOrder(region),top=regular.slice(0,8),q=[];for(let i=0;i<4;i++){const a=top[i],b=top[7-i];if(a&&b)q.push({round:"八強",a,b,winner:deterministicSeriesWinner(a,b,`${region}-${seasonName}-Q${i}`)})}
 const semis=[];if(q.length===4){[[0,3],[1,2]].forEach((pair,i)=>{const a=q[pair[0]].winner,b=q[pair[1]].winner;semis.push({round:"四強",a,b,winner:deterministicSeriesWinner(a,b,`${region}-${seasonName}-S${i}`)})})}
 let final=null;if(semis.length===2){const a=semis[0].winner,b=semis[1].winner;final={round:"冠亞賽",a,b,winner:deterministicSeriesWinner(a,b,`${region}-${seasonName}-F`)}}
 return {region,seasonName,year:state.date.year,quarterfinals:q,semifinals:semis,final,champion:final?.winner||null,runnerUp:final?(final.winner===final.a?final.b:final.a):null};
}
function ensurePlayoffArchive(){const pc=state.player.proCareer;pc.playoffArchive=pc.playoffArchive||{};return pc.playoffArchive}
function archiveCurrentPlayerPlayoff(){const pc=state.player.proCareer,sn=pc.season;if(!sn?.seasonName||!sn.playoffs)return null;const key=`${state.date.year}-${sn.seasonName}-${pc.region||"PCS"}`,arc=ensurePlayoffArchive();if(!arc[key])arc[key]=simulateRegionPlayoffBracket(pc.region||"PCS",sn.seasonName);const b=arc[key],me=pc.team,played=sn.playoffOpponents||[];
 if(sn.phase==="賽季結束"&&played.length){const lostRound=Math.max(0,Math.min(2,Number(sn.playoffRound)||0)),opp=played[played.length-1],arr=[b.quarterfinals,b.semifinals,[b.final]][lostRound]||[];let m=arr.find(x=>x&&(x.a===me||x.b===me));if(!m&&lostRound===0){m={round:"八強",a:me,b:opp,winner:opp};b.quarterfinals[0]=m}else if(m)m.winner=opp;if(lostRound===0&&b.quarterfinals.length===4){b.semifinals=[];[[0,3],[1,2]].forEach((pair,i)=>{const a=b.quarterfinals[pair[0]].winner,bb=b.quarterfinals[pair[1]].winner;b.semifinals.push({round:"四強",a,b:bb,winner:deterministicSeriesWinner(a,bb,`${b.region}-${b.seasonName}-repairS${i}`)})});const a=b.semifinals[0].winner,bb=b.semifinals[1].winner,w=deterministicSeriesWinner(a,bb,`${b.region}-${b.seasonName}-repairF`);b.final={round:"冠亞賽",a,b:bb,winner:w};b.champion=w;b.runnerUp=w===a?bb:a}b.playerFinish=playoffRoundLabel(lostRound);b.playerEliminated=true;b.playerEliminatedBy=opp}
 if(sn.champion===me){b.champion=me;b.playerFinish="冠軍";b.playerEliminated=false}
 return b}
function springPlayoffResult(region){const pc=state.player.proCareer,key=`${state.date.year}-春季-${region}`,arc=ensurePlayoffArchive();if(region===(pc.region||"PCS")&&pc.season?.seasonName==="春季")archiveCurrentPlayerPlayoff();if(!arc[key])arc[key]=simulateRegionPlayoffBracket(region,"春季");return arc[key]}
function msiQualifiers(){const out=[];for(const r of PRO_REGIONS){const b=springPlayoffResult(r),add=t=>{if(t&&!out.some(x=>x.team===t))out.push({team:t,region:r})};add(b.champion);add(b.runnerUp);if(out.filter(x=>x.region===r).length<2){for(const t of leagueRegularOrder(r)){add(t);if(out.filter(x=>x.region===r).length>=2)break}}}return out.slice(0,10)}
function playerQualifiedForInternational(kind){const pc=state.player.proCareer;if(kind==="MSI")return msiQualifiers().some(x=>x.team===pc.team);const ev=pc.international?.worlds;return !!ev?.seedEntries?.some(x=>x.team===pc.team)}
function playoffBracketCard(){
 if(!isProfessionalStage())return "";
 const pc=state.player.proCareer,sn=pc.season,season=sn?.seasonName;if(!season)return "";
 const key=`${state.date.year}-${season}-${pc.region||"PCS"}`,arc=ensurePlayoffArchive();if(sn?.playoffs)archiveCurrentPlayerPlayoff();const b=arc[key];if(!b)return "";
 const me=pc.team,round=Number(sn?.playoffRound)||0,finished=sn?.phase==="賽季結束"||sn?.phase==="世界賽資格";
 const qLine=(x)=>{if(!x)return "尚未產生";const involves=x.a===me||x.b===me;if(involves&&round===0&&!finished)return `${x.a} → <strong>尚未進行</strong> ← ${x.b}`;return `${x.a} → <strong>${x.winner||"尚未進行"}</strong> ← ${x.b}`};
 const normalLine=x=>x?`${x.a} → <strong>${x.winner||"尚未進行"}</strong> ← ${x.b}`:"尚未產生";
 let semi="尚未產生",final="尚未產生",champ="";
 if(round>=1||finished){semi=(b.semifinals||[]).map(x=>{const involves=x&&(x.a===me||x.b===me);return involves&&round===1&&!finished?`${x.a} → <strong>尚未進行</strong> ← ${x.b}`:normalLine(x)}).join("<br>")||"尚未產生"}
 if(round>=2||finished){if(b.final){const involves=b.final.a===me||b.final.b===me;final=involves&&round===2&&!finished?`${b.final.a} → <strong>尚未進行</strong> ← ${b.final.b}`:normalLine(b.final)}if(finished&&b.champion)champ=`<br>🏆 冠軍：${b.champion}`}
 return `<section class="card"><h2>🏆 ${pc.region||"PCS"} ${state.date.year}${season}季後賽對戰表</h2><div class="small">八強 → 四強 → 冠亞賽；只有已完成的輪次才會產生賽果，未開打的後續輪次不會提前顯示冠軍。</div><div class="notice"><strong>八強</strong><br>${(b.quarterfinals||[]).map(qLine).join("<br>")}</div><div class="notice"><strong>四強</strong><br>${semi}</div><div class="notice"><strong>冠亞賽</strong><br>${final}${champ}</div>${b.playerEliminated?`<div class="small badtext">${pc.team}：${b.playerFinish}淘汰｜淘汰者：${b.playerEliminatedBy}</div>`:""}</section>`
}
function buildInternationalTournament(kind){
 const pc=state.player.proCareer,ev=chooseHost(kind,state.date.year),myRegion=pc.region||"PCS",team=pc.team||"KNG Esports";if(ev.groups?.length)return ev;
 if(kind==="MSI"){const q=msiQualifiers(),u=[...new Set(q.map(x=>x.team))].slice(0,10);ev.qualifiers=q;ev.qualified=u.includes(team);ev.groups=[{name:"A",teams:u.filter((_,i)=>i%2===0),standings:[]},{name:"B",teams:u.filter((_,i)=>i%2===1),standings:[]}];ev.format="五大賽區春季季後賽前二，共10隊；雙循環，各組前二晉級四強BO5";ev.stage="分組賽";}
 else{
   const bonusRegion=msiChampionRegionForYear(state.date.year)||myRegion,entries=[];
   PRO_REGIONS.forEach(r=>worldsSeedsForRegion(r,r===bonusRegion).forEach((t,i)=>entries.push({team:t,region:r,seed:i+1})));
   const unique=[];for(const x of entries)if(x.team&&!unique.some(y=>y.team===x.team))unique.push(x);
   ev.groups=buildWorldsGroups(unique.slice(0,16),team);ev.seedEntries=unique.slice(0,16);ev.msiBonusRegion=bonusRegion;
   ev.format=`世界賽種子：各賽區季後賽冠軍#1、亞軍#2、例行賽最高且未取得資格者#3；${bonusRegion}因MSI冠軍多1席，兩支四強敗隊比較例行賽成績決定#4。季後賽成績優先於例行賽。四組雙循環，各組前二晉級八強BO5。`;ev.stage="抽籤完成";
 }
 return ev;
}
function internationalGroupsCard(){const ph=proAnnualPhase();if(!["MSI","世界賽"].includes(ph))return "";const ev=buildInternationalTournament(ph),q=ph==="MSI"?ev.qualified:playerQualifiedForInternational(ph);return `<section class="card"><h2>🎲 ${ph}分組</h2>${!q?`<div class="notice badtext">${state.player.proCareer.team} 未取得本屆${ph}參賽資格；你仍可查看其他戰隊賽況。</div>`:""}${ev.groups.map(g=>`<div class="notice"><strong>${g.name}組</strong><br>${g.teams.join("｜")}</div>`).join("")}<div class="small">${ev.format}</div></section>`;}
function internationalCard(){
 if(!isProfessionalStage())return "";const ph=proAnnualPhase(),it=ensureInternationalWorld(),p=state.player;if(ph!=="MSI"&&ph!=="世界賽")return "";
 const ev=buildInternationalTournament(ph),qualified=ph==="MSI"?ev.qualified:playerQualifiedForInternational(ph);
 return `<section class="card"><h2>${ph==="MSI"?"🌍 MSI":"🌎 世界賽"}｜${state.date.year}</h2><div class="notice">📍 ${ev.host.country}・${ev.host.city}<br>${ph==="MSI"?"10隊｜A/B兩組各5隊｜雙循環｜各組前2晉級BO5淘汰賽":"16隊｜A/B/C/D四組各4隊｜雙循環｜各組前2晉級BO5淘汰賽"}</div>${!qualified?`<div class="notice badtext">❌ ${state.player.proCareer.team} 未取得本屆${ph}資格。國際賽照常進行，但夜鋒不會被排入賽程或隨隊前往。</div>`:""}<p class="small">主辦地按年度輪換；同一賽事原則上3年內不重複國家、2年內不重複城市。</p></section>`;
}
function maybeInternationalSocial(){
 const ph=proAnnualPhase();if(!isProfessionalStage()||(ph!=="MSI"&&ph!=="世界賽")||!playerQualifiedForInternational(ph)||Math.random()>.075)return;
 const p=state.player,ev=chooseHost(ph,state.date.year),foreign=Math.random()<.7;
 if(foreign){
  const pools={
   "韓國":["金瑞妍","朴智恩","李夏恩","崔秀雅","韓智媛","尹彩英"],
   "日本":["佐藤美咲","高橋凜","中村葵","小林結衣","伊藤玲奈","山田七海"],
   "中國":["林若曦","沈佳寧","蘇雨桐","顧清妍","程以晴","周芷寧"],
   "法國":["Emma Laurent","Chloé Martin","Camille Dubois","Léa Bernard","Manon Petit","Juliette Moreau"],
   "英國":["Sophie Miller","Olivia Clarke","Emily Turner","Amelia Scott","Grace Wilson","Lucy Taylor"],
   "美國":["Lina Chen","Ava Johnson","Mia Carter","Ella Davis","Zoe Parker","Nora Lee"]
  };
  const pool=pools[ev.host.country]||["Emma Laurent","Sophie Miller","Lina Chen","Mia Carter","Nora Lee","Ava Johnson"];
  const unseen=pool.filter(n=>!state.characters?.[n]?.known);
  if(unseen.length){
   const n=unseen[rand(0,unseen.length-1)],age=19+stableAgeOffset(n,9);
   addSocialAcquaintance(n,rand(15,30),{gender:"女",age,birthYear:state.date.year-age,nationality:ev.host.country,role:"國際賽活動認識",desc:`${ph}期間於${ev.host.city}認識`,romanceable:true,traits:["獨立","好奇"],important:true});
   state.logs.push(`✈️ ${ph}海外事件：你在${ev.host.city}第一次認識了 ${n}，她已加入社交好友。`);
  }else{
   p.followers+=rand(35,130);state.logs.push(`🌍 ${ev.host.city}已沒有新的固定人物可認識；這次活動改為與當地粉絲交流，海外粉絲增加。`);
  }
 }else{p.followers+=rand(30,120);state.logs.push(`🌍 ${ev.host.city}的當地粉絲活動讓夜鋒增加了一批海外支持者。`)}
}
function annualAwards(year){
 const p=state.player,pc=p.proCareer;ensureCareerHistory();if(pc.lastAwardsYear===year)return;pc.lastAwardsYear=year;
 const cs=pc.careerStats||{},rookie=(pc.proDebutYear||year)===year,score=avg()+(cs.mvp||0)*1.5+(cs.seriesW||0)*.3;
 pc.regionalAwards=pc.regionalAwards||{};PRO_REGIONS.forEach(r=>{{const db=ensureGlobalProDatabase()[r]||{},all=Object.values(db).flat().filter(x=>x.active&&!x.retired),pick=role=>all.filter(x=>x.role===role).sort((a,b)=>b.rating-a.rating)[0]?.name||"未定";pc.regionalAwards[`${year}-${r}`]={最佳戰隊:Object.keys(db)[0]||`${r}年度強隊`,最佳教練:`${r}年度教練`,最佳上路:pick("上路"),最佳打野:pick("打野"),最佳中路:pick("中路"),最佳ADC:pick("ADC"),最佳輔助:pick("輔助"),最佳新秀:all.filter(x=>x.age<=20).sort((a,b)=>b.rating-a.rating)[0]?.name||pick("中路"),年度MVP:all.sort((a,b)=>b.rating-a.rating)[0]?.name||"未定"};}});
 const awards=[];if(score>78)awards.push(`年度最佳${p.role==="下路"?"ADC":p.role}`);if(score>86)awards.push("年度MVP");if(rookie&&score>72)awards.push("年度最佳新秀");
 awards.forEach(x=>{p.awards.unshift({year,title:x,region:pc.region||"PCS",team:pc.team});addAchievement(`award-${x}`,x,"年度頒獎",year,false)});
 state.logs.push(`🏆 ${year}年度頒獎完成：五大賽區評選最佳戰隊、最佳教練、五路最佳選手、年度MVP與最佳新秀。${awards.length?`夜鋒獲得：${awards.join("、")}`:""}`);evaluateHallOfFame(year);
}
function internationalQualificationRules(){
 return {MSI:"五大賽區春季季後賽前二，共10隊；A/B兩組各5隊雙循環，各組前二進BO5淘汰賽。",
 WORLDS:"各賽區世界賽種子依夏季季後賽優先：冠軍#1、亞軍#2、例行賽最高且尚未取得資格者#3；MSI冠軍賽區額外#4，由兩支季後賽四強敗隊比較例行賽成績決定。固定16隊，四組各4隊雙循環，各組前二進BO5八強。"};
}
function annualCalendarCard(){
 if(!isProfessionalStage())return "";const ph=proAnnualPhase(),m=careerMonthFromWeek(state.date.week);
 return `<section class="card"><h2>🗓️ 職業年度賽曆</h2><div class="notice">目前：${m}月｜${ph}</div><div class="small">1月冬季轉會｜2–4月春季聯賽22場｜5月春季季後賽｜6月MSI｜7月夏季轉會｜8–10月夏季聯賽22場｜11月夏季季後賽｜12月世界賽<br>${internationalQualificationRules().MSI}<br>${internationalQualificationRules().WORLDS}</div></section>`;
}
function canonicalDomesticTeams(){
 const pc=state.player.proCareer,region=fixedTeamRegion(pc?.team)||pc?.region||"PCS";pc.region=region;
 const base=regionTeams(region),team=pc?.team;if(team&&!base.includes(team)){base[base.length-1]=team;registerLegacyTeam(team,region)}
 return [...new Set(base)].slice(0,12);
}
function repairDomesticLeagueTeams(){
 const pc=state.player.proCareer,sn=pc?.season;if(!sn)return;
 const canonical=canonicalDomesticTeams(),old=new Map((sn.teams||[]).map(x=>[x.name,x]));
 sn.teams=canonical.map(name=>old.get(name)||{name,w:0,l:0,gw:0,gl:0});
 // Hard cap 12; never append a 13th team.
 if(sn.teams.length>12)sn.teams=sn.teams.slice(0,12);
}
function ensureDomesticPlayoffPhase(){
 const pc=state.player.proCareer,sn=pc?.season;if(!sn||pc.stage!=="starter")return;
 repairDomesticLeagueTeams();
 const ph=proAnnualPhase(),spring=ph==="春季季後賽",summer=ph==="夏季季後賽";
 if(!spring&&!summer)return;
 const wanted=spring?"春季":"夏季";
 if(sn.seasonName!==wanted)return;
 if(sn.phase==="例行賽"){
   // May/November is the hard calendar boundary: unfinished old fixtures no longer block playoffs.
   // Existing standings decide seeding; if the player has fewer recorded games because of an old schedule bug,
   // preserve results and still enter the postseason.
   const sorted=[...sn.teams].sort((a,b)=>(b.w-a.w)||((b.gw-b.gl)-(a.gw-a.gl))),seed=Math.max(1,sorted.findIndex(x=>x.name===pc.team)+1);
   sn.playoffs=true;sn.seed=seed;sn.phase=seed<=8?"季後賽":"賽季結束";sn.playoffRound=seed<=8?(sn.playoffRound||0):null;sn.playoffWins=sn.playoffWins||0;
   if(seed<=8){schedulePlayoffMatch();state.news.unshift(`🏆 ${pc.team} 以第 ${seed} 種子進入${wanted}季後賽，全面採 BO5。`);state.logs.push(`🏆 月份進入${spring?"5":"11"}月，${wanted}季後賽正式開打。`)}
   else state.news.unshift(`${pc.team} 例行賽第 ${seed} 名，未晉級${wanted}季後賽。`);
 }
}
function buildSeasonScheduleByCalendar(seasonName){
 const pc=state.player.proCareer,sn=pc.season;if(!sn)return;repairDomesticLeagueTeams();const months=seasonName==="春季"?[2,4]:[8,10],range1=monthWeekRange(months[0]),range2=monthWeekRange(months[1]),start=range1[0],end=range2[1],slots=[];
 for(let w=start;w<=end;w++){slots.push([w,3],[w,6])}
 const opponents=sn.teams.filter(x=>x.name!==pc.team),chosen=slots.slice(0,22);
 sn.schedule=chosen.map((x,i)=>({id:`${seasonName}-REG-${i+1}`,phase:"例行賽",season:seasonName,round:i+1,year:state.date.year,week:x[0],day:x[1],opp:opponents[i%opponents.length].name,bo:3,played:false}));
 sn.seasonName=seasonName;sn.phase="例行賽";
}
function ensureDomesticRegularSeasonPhase(){
 if(!isProfessionalStage()||state.player.proCareer.stage!=="starter")return;
 const pc=state.player.proCareer,ph=proAnnualPhase();
 if(ph!=="春季聯賽"&&ph!=="夏季聯賽")return;
 const seasonName=ph==="春季聯賽"?"春季":"夏季";
 const needsNew=!pc.season||pc.season.seasonName!==seasonName||pc.season.year!==state.date.year;
 if(needsNew){
   const teams=canonicalDomesticTeams().map(name=>({name,w:0,l:0,gw:0,gl:0}));
   pc.season={year:state.date.year,seasonName,week:1,phase:"例行賽",teams,matchesPlayed:0,myMatches:0,playoffs:false,champion:null,schedule:[]};
   buildSeasonScheduleByCalendar(seasonName);
   const month=seasonName==="春季"?2:8;
   const key=`${state.date.year}-${seasonName}-open`;
   pc.seasonOpenNotices=pc.seasonOpenNotices||{};
   if(!pc.seasonOpenNotices[key]){
     pc.seasonOpenNotices[key]=true;
     state.news.unshift(`${seasonName==="春季"?"🌸":"☀️"} ${state.date.year} ${seasonName}例行賽正式開打！共22場 BO3。`);
     state.logs.push(`${seasonName==="春季"?"🌸":"☀️"} 進入${month}月，${seasonName}例行賽自動建立並正式開打。`);
   }
 }
 repairDomesticLeagueTeams();
 if(pc.season?.seasonName===seasonName&&pc.season.phase==="例行賽"&&!(pc.season.schedule||[]).length)buildSeasonScheduleByCalendar(seasonName);
}
function syncAnnualCompetition(){
 if(!isProfessionalStage()||state.player.proCareer.stage!=="starter")return;
 ensureDomesticRegularSeasonPhase();
 ensureDomesticPlayoffPhase();
 const ph=proAnnualPhase();
 if(ph==="MSI")chooseHost("MSI",state.date.year);
 if(ph==="世界賽")chooseHost("世界賽",state.date.year);
 finalizePendingInternationalChampion();
}
function migrateProV180(){
 const p=state.player;if(p.v180Migrated)return;ensureCareerHistory();ensureAges();backfillAchievements();
 if(isProfessionalStage()){
   // Requested timeline correction: return to the previous December, immediately before Worlds.
   state.date.year=Math.max(2026,(state.date.year||2027)-1);state.date.week=49;state.date.day=1;
   const pc=p.proCareer;pc.proDebutYear=pc.proDebutYear||state.date.year;pc.region=pc.region||"PCS";
   if(pc.season){pc.season.phase="世界賽資格";pc.season.schedule=[];pc.season.playoffSchedule=null;}
   const it=ensureInternationalWorld(),w=chooseHost("世界賽",state.date.year);w.qualified=true;w.stage="抽籤前";
   state.logs.push("🕰️ V1.8.0時間線校正：回到前一年12月世界賽開賽前；人物養成、關係、合約、財務與可確認成就均保留。");
 }
 p.v180Migrated=true;
}
function migrateProV181(){
 const p=state.player;if(p.v181Migrated)return;
 // V1.8.0 stored week 49 using the old Sep-Aug school calendar. Convert the visible intended year to natural pro calendar.
 if(isProfessionalStage()&&p.v180Migrated){
   const oldDisplayedYear=calendarYearForWeek(state.date.year,state.date.week);
   state.date.year=oldDisplayedYear;
   state.date.month=careerMonthFromWeek(state.date.week);
 }
 ensureCareerHistory();
 p.achievements=(p.achievements||[]).filter(a=>a.id!=="worlds-qualified"&&!/世界賽資格/.test(a.title||""));
 // First pro year cannot precede the actual professional timeline after correction.
 if(isProfessionalStage()){
   p.proCareer.proDebutYear=Math.max(p.proCareer.proDebutYear||state.date.year,state.date.year);
   (p.achievements||[]).forEach(a=>{if(a.retro&&a.year< p.proCareer.proDebutYear)a.year=p.proCareer.proDebutYear});
 }
 ensureAges(true);
 cleanupOldMessages(false);
 state.logs.push("🔧 V1.8.1校正：職業日期改為自然年度；刪除『世界賽資格』成就；修正同學年齡與舊訊息累積。");
 p.v181Migrated=true;
}function migrateProV182(){
 const p=state.player;if(p.v182Migrated)return;
 if(isProfessionalStage()){
   state.date.week=49;state.date.day=1;state.date.month=12;
   ensureAges(true);
   const pc=p.proCareer,it=ensureInternationalWorld();it.worlds=null;
   const ev=buildInternationalTournament("世界賽");ev.qualified=true;ev.stage="分組賽";ev.schedule=[];ensureInternationalSchedule();
   state.logs.push("🔧 V1.8.2校正：時間回到第49週週一，世界賽正式賽程重新生成；職業選手年齡依身分、資歷與人物資料重新分布。");
 }
 p.v182Migrated=true;
}function migrateProV183(){const p=state.player;if(p.v183Migrated)return;p.proCareer.region=p.proCareer.region||"PCS";addAnnualHeroes(state.date.year);ensureAges(true);p.v183Migrated=true;state.logs.push("🔧 V1.8.3：五大賽區強度、國際賽難度與疲勞、海外生活、自由市場、直播收益、位置與年度新英雄已啟用。") }
function migrateProV184(){
 const p=state.player;if(p.v184Migrated)return;
 p.proFriends=p.proFriends||[];
 Object.values(state.characters||{}).forEach(c=>{
   if(!c?.known||!c.name)return;
   const meaningful=c.important||c.isRival||c.formerTeammate||c.isPro||c.romanceable||/認識|朋友|同學|粉絲|隊友|教練/.test(`${c.role||""} ${c.desc||""}`);
   if(meaningful){c.socialContact=true;if(isProfessionalStage()&&!p.proFriends.includes(c.name))p.proFriends.push(c.name)}
 });
 state.logs.push("🔧 V1.8.4社交校正：已認識的具名人物補入社交好友；海外固定NPC改為每人只會觸發一次初次認識。");
 p.v184Migrated=true;
}function migrateProV185(){const p=state.player;if(p.v185Migrated)return;p.travelHistory=p.travelHistory||[];state.logs.push("✈️ V1.8.5新增自由出國：可選目的地、自己旅行或邀請社交人物同行。");p.v185Migrated=true;}
function migrateProV186(){
 const p=state.player,pc=p.proCareer;if(p.v186Migrated)return;
 ensureGlobalProDatabase();p.proFriends=p.proFriends||[];
 const removeNames=[];
 Object.entries(state.characters||{}).forEach(([name,c])=>{
   if(isPlaceholderPersonName(name)){removeNames.push(name);return}
   const text=`${c.role||""} ${c.desc||""}`;
   const clearlyNonPro=/粉絲|旅行認識|國際賽活動認識|酒吧|同學|一般朋友|媒體|記者|翻譯|工作人員/.test(text);
   if(clearlyNonPro){c.isPro=false;delete c.team;delete c.region}
   // only a named roster/database member may retain professional status
   if(c.isPro&&!c.team){
     let found=null,db=pc.proDatabase||{};for(const region of Object.values(db))for(const roster of Object.values(region)){const x=roster.find(v=>v.name===name);if(x)found=x}
     const localTeam=Object.entries(PRO_ROSTER_NAMES).find(([t,names])=>names.includes(name));
     if(found){c.team=found.team;c.region=found.region;c.role=found.role}
     else if(localTeam)c.team=localTeam[0];
     else c.isPro=false;
   }
 });
 removeNames.forEach(name=>{delete state.characters[name];delete p.relations[name];p.proFriends=p.proFriends.filter(x=>x!==name);if(pc.rivals)delete pc.rivals[name]});
 p.proFriends=p.proFriends.filter((n,i,a)=>n&&!isPlaceholderPersonName(n)&&state.characters?.[n]&&a.indexOf(n)===i);
 Object.values(state.characters||{}).forEach(c=>{if(c.known&&!isPlaceholderPersonName(c.name)&&proSocialAllowed(c))c.socialContact=true});
 state.logs.push(`🔧 V1.8.6 NPC資料校正：清除 ${removeNames.length} 個無名／席位代號社交人物；女粉絲與一般朋友恢復正確身分；國際對手改用固定具名職業選手。`);
 p.v186Migrated=true;
}
function previewSocialIdentityFix(){
 const p=state.player;if(p.socialIdentityPreviewFixed)return;
 applyStoryIdentityFixes();
 Object.values(state.characters||{}).forEach(c=>{
   if(!c?.name)return;
   const nonPro=/粉絲|旅行認識|國際賽活動認識|酒吧|同班同學|國中同學|學姊|初戀/.test(`${c.role||""} ${c.desc||""} ${c.socialIdentity||""}`);
   if(nonPro){c.isPro=false;if(!STORY_SOCIAL_IDENTITIES[c.name]){delete c.team;delete c.region}}
 });
 state.logs.push("🔧 社交身分預覽校正：同學、學姊、初戀、一般遊戲朋友、女粉絲與旅行人物不再誤標成職業選手。");
 p.socialIdentityPreviewFixed=true;
}
function migrateProV187(){
 const p=state.player,pc=p.proCareer;if(p.v187Migrated)return;
 applyStoryIdentityFixes();ensureGlobalProDatabase();
 const removed=[];
 Object.entries(state.characters||{}).forEach(([name,c])=>{
   if(name===p.name||isPlaceholderPersonName(name)){removed.push(name);return}
   const pro=confirmedProfessionalRecord(name);
   if(pro){c.isPro=true;c.team=pro.team;c.role=pro.role;c.identityType="職業選手";c.acquaintanceSource=c.acquaintanceSource||(/對手|比賽/.test(c.desc||"")?"正式比賽":"職業圈")}
   else{
     c.isPro=false;if(!c.isProStaff){delete c.team;delete c.region}
     c.identityType=identityTypeFor(name);c.acquaintanceSource=inferAcquaintanceSource(c);
   }
 });
 removed.forEach(name=>{
   delete state.characters[name];delete p.relations[name];if(state.friends)delete state.friends[name];
   p.proFriends=(p.proFriends||[]).filter(x=>x!==name);if(pc.rivals)delete pc.rivals[name];
   if(p.romance?.partners)p.romance.partners=p.romance.partners.filter(x=>x!==name);
 });
 p.proFriends=(p.proFriends||[]).filter((n,i,a)=>n&&n!==p.name&&!isPlaceholderPersonName(n)&&state.characters?.[n]&&a.indexOf(n)===i);
 state.logs.push(`🧹 V1.8.7 社交資料重整：刪除 ${removed.length} 個無名／編號／賽事席位／主角本人項目；其餘人物重新拆分為「身分、認識來源、目前關係」。`);
 p.v187Migrated=true;
}
function migrateProV188(){
 const p=state.player,pc=p.proCareer;if(p.v188Migrated)return;
 // Rename old numbered annual heroes while keeping IDs/mastery intact.
 HEROES.forEach(h=>{
   const m=String(h.id||"").match(/^y(\d{4})_(\d)$/);if(!m)return;
   const year=Number(m[1]),i=Number(m[2]),names=annualHeroNames(year);if(names[i])h.name=names[i];
 });
 const worldChamp=(p.achievements||[]).some(a=>/世界賽冠軍/.test(a.title||""));
 if(worldChamp&&pc.contract)applyWorldChampionContractBoost();
 const home=currentResidenceProfile();pc.residence={...home};
 state.logs.push(`🔧 V1.8.8：年度英雄名稱去除年份尾碼；世界冠軍薪資／身價校正；生活據點改為 ${home.country}・${home.city}，外出與遇見人物改用當地事件池。`);
 p.v188Migrated=true;
}function migrateProV189(){
 const p=state.player,pc=p.proCareer;if(p.v189Migrated)return;ensureFixedMidExpansionHeroes();
 if(pc.contract){completeContract(pc.contract);pc.contract.years=pc.contract.years||Math.max(1,Math.min(3,Math.round((pc.contract.lengthWeeks||52)/52)))}
 if(isProfessionalStage()){ensureProRoster();pc.residence=currentResidenceProfile()}
 state.logs.push("🆕 V1.8.9：新增5名中路英雄；教練社交履歷、1–3年合約、提前續約、海外返台與年度Rank重置啟用。");p.v189Migrated=true;
}
function migrateProV1891(){
 const p=state.player;if(p.v1891Migrated)return;if(p.activeTravel&&!p.activeTravel.country)p.activeTravel=null;
 state.logs.push("🔧 V1.8.9.1：老婆／情侶改用正式伴侶親密互動；私人旅行期間外出改為旅行目的國。");p.v1891Migrated=true;
}
function migrateProV1892(){
 const p=state.player;if(p.v1892Migrated)return;
 ensureFixedMidExpansionHeroes();ensureSavedAnnualHeroes();
 state.logs.push("🔧 V1.8.9.2：修正新增英雄重新開啟遊戲後消失；固定5名中路英雄與歷年新增英雄現在每次讀檔都會自動重建，熟練度保留。");
 p.v1892Migrated=true;
}
function migrateProV1893(){
 const p=state.player;if(p.v1893Migrated)return;
 ensureFixedMidExpansionHeroes();ensureSavedAnnualHeroes();
 state.logs.push("🆕 V1.8.9.3：旅行所在地／剩餘天數顯示、國籍姓名池與NPC多位置分布完成；新增英雄持久化檢查再次強化。");
 p.v1893Migrated=true;
}
function migrateProV1894(){
 const p=state.player;if(p.v1894Migrated)return;
 ensureFixedMidExpansionHeroes();ensureSavedAnnualHeroes();
 const m=p.proCareer?.stage==="starter"?currentScheduledProMatch():null;
 if(m){const now=((state.date.year||2026)*52+(state.date.week||1))*7+(state.date.day||1),target=((m.year*52+m.week)*7+m.day);if(now>target&&!m.played)state.logs.push(`🔧 V1.8.9.4：偵測到逾期未完成賽程 ${m.opp}，現在可直接進入補賽，不再卡住換日。`)}
 p.v1894Migrated=true;
}
function migrateProV1895(){
 const p=state.player,pc=p.proCareer;if(p.v1895Migrated)return;
 ensureFixedMidExpansionHeroes();ensureSavedAnnualHeroes();ensureHealthManagement();
 pc.careerStats=pc.careerStats||{matches:0,seriesW:0,seriesL:0,gameW:0,gameL:0,kills:0,deaths:0,assists:0,mvp:0};
 ["matches","seriesW","seriesL","gameW","gameL","kills","deaths","assists","mvp"].forEach(k=>{if(!Number.isFinite(pc.careerStats[k]))pc.careerStats[k]=0});
 state.logs.push("🔧 V1.8.9.5：正式賽勝負／戰報／賽後採訪流程加固，並新增完整健康治療與追蹤中心。");p.v1895Migrated=true;
}
function migrateProV1896(){const p=state.player;if(p.v1896Migrated)return;ensureFixedMidExpansionHeroes();ensureSavedAnnualHeroes();ensureLifestyle();state.logs.push("🆕 V1.8.9.6：新英雄Meta、生產事件、資產／母校回饋、粉絲見面會、請假替補競爭與婚外關係系統上線。");p.v1896Migrated=true;}
function migrateProV1897(){
 const p=state.player;if(p.v1897Migrated)return;
 repairFlexibleAcquaintanceRoles();if(isProfessionalStage())ensureProRoster();
 (p.adultLife?.pregnancies||[]).forEach(pg=>{if(pg.progressWeeks>=40&&!pg.born){pg.birthPending=true;pg.status="即將生產"}if(pg.child){pg.child.bond=Number(pg.child.bond)||0;if(pg.supportChoice==="共同撫養")pg.playerCare=true}});
 state.logs.push("🔧 V1.8.9.7：修正社交位置分布、雙重生產事件與教練顯示；新增小孩分頁及大型私生活公關危機。");
 p.v1897Migrated=true;
}
function migrateProV1898(){
 const p=state.player;if(p.v1898Migrated)return;
 ensureLegacyChildSystem();
 (p.adultLife?.pregnancies||[]).forEach(pg=>{if(pg.born&&!pg.birthChoice)pg.legacyBirthReview=true});
 state.logs.push("🔧 V1.8.9.8：為舊存檔已出生小孩補上陪產補登、扶養選擇與育嬰照顧系統。");
 p.v1898Migrated=true;
}
function migrateProV1899(){const p=state.player;if(p.v1899Migrated)return;(p.adultLife?.pregnancies||[]).forEach(pg=>{if(!pg.born&&(pg.progressWeeks||0)>=40){pg.birthPending=true;pg.status="即將生產"}});state.logs.push("🔧 V1.8.9.9：修正生產按鈕、移除行程分頁、海外婚外事件降低曝光率，並提高職業比賽難度。");p.v1899Migrated=true;}
function migrateProV1900(){const p=state.player;if(p.v1900Migrated)return;ensurePregnancyEventIds();(p.adultLife?.pregnancies||[]).forEach(pg=>{if(!pg.born&&((pg.progressWeeks||0)>=40||pg.status==="即將生產"||pg.birthPending)){pg.progressWeeks=Math.max(40,Number(pg.progressWeeks)||0);pg.birthPending=true;pg.status="即將生產"}});state.logs.push("🔧 V1.9.0.0：生產事件按鈕改為獨立事件ID＋直接觸發，不再依賴生涯頁 bind() 是否完整執行。");p.v1900Migrated=true;}
function migrateProV1901(){
 const p=state.player;if(p.v1901Migrated)return;
 (p.adultLife?.pregnancies||[]).forEach(pg=>{
  if(!pg.born&&(pg.birthPending||pg.status==="即將生產")){
   pg.progressWeeks=Math.max(40,Number(pg.progressWeeks)||0);
   pg.birthPending=true;pg.status="即將生產";
  }
 });
 state.logs.push("🔧 V1.9.0.1：修正已進入生產階段的舊孕期被顯示成 0/40；即將生產者會恢復為至少 40/40。");
 p.v1901Migrated=true;
}
function migrateProV1902(){
 const p=state.player;if(p.v1902Migrated)return;
 dedupePregnancies();
 const anran=(p.adultLife?.pregnancies||[]).find(pg=>pg.name==="許安然"&&!pg.born);
 if(anran&&(anran.birthPending||anran.status==="即將生產"||(anran.progressWeeks||0)>=40)){
  anran.progressWeeks=40;anran.birthPending=true;anran.status="即將生產";
 }
 ensurePregnancyEventIds();repairDuePregnancyProgress();
 state.logs.push("🔧 V1.9.0.2：移除同一人物重複懷孕紀錄；許安然保留真正的40/40即將生產資料，刪除錯誤0/40資料。");
 p.v1902Migrated=true;
}
function migrateProV1903(){const p=state.player;if(p.v1903Migrated)return;state.logs.push("🔧 V1.9.0.3：修正詢問私人約會點擊無後續，社交動作改為統一派送。");p.v1903Migrated=true;}
function migrateProV1904(){const p=state.player;if(p.v1904Migrated)return;ensureFixedMidExpansionHeroes();ensureSavedAnnualHeroes();ensureMeta();ensureTeammatePartners();state.logs.push("🆕 V1.9.0.4：版本Meta強制納入新英雄、正式賽難度再次提高，並新增認識隊友女友與隊友衝突事件。");p.v1904Migrated=true;}
function migrateProV1905(){const p=state.player;if(p.v1905Migrated)return;ensureTeamRuptures();if(p.proCareer?.teammateConflict?.mate){const x=p.proCareer.teammateConflict;if((x.severity||0)>=3)createTeamRupture(x.mate,x.source||"既有衝突","既有隊內衝突")}state.logs.push("🆕 V1.9.0.5：新增隊內決裂、有他沒我、管理層選邊、轉隊／解約、冷戰與消極比賽事件。");p.v1905Migrated=true;}
function migrateProV1906(){const p=state.player;if(p.v1906Migrated)return;state.logs.push("🔧 V1.9.0.6：重做私人約會流程。邀請成功後一定先顯示接受結果，再由玩家點擊「繼續私人約會」進入下一步，不再直接跳過。");p.v1906Migrated=true;}
function migrateProV1907(){const p=state.player;if(p.v1907Migrated)return;state.logs.push("🔧 V1.9.0.7：私人約會恢復成單次點擊直接顯示結果；修正女粉絲按鈕無法點選。");p.v1907Migrated=true;}
function migrateProV1908(){const p=state.player;if(p.v1908Migrated)return;state.logs.push("🔧 V1.9.0.8：私人約會改為完全獨立的一鍵結果流程，最後一步才顯示結果視窗，避免被 render 覆蓋；女粉絲入口改回正確的 meetFemaleFan。");p.v1908Migrated=true;}
function migrateProV1909(){const p=state.player;if(p.v1909Migrated)return;state.logs.push("🔧 V1.9.0.9：修正女粉絲首頁按鈕實際走錯入口；女粉絲事件改成與私人約會相同的穩定小視窗結果流程。");p.v1909Migrated=true;}
function migrateProV1910(){const p=state.player;if(p.v1910Migrated)return;state.logs.push("🆕 V1.9.1.0：女粉絲事件取消拒絕結果；具名女粉絲加入社交、匿名女粉絲不保留；社交好友新增分類。");p.v1910Migrated=true;}
function migrateProV1911(){
 const p=state.player;if(p.v1911Migrated)return;
 repairDomesticLeagueTeams();
 const divorced=p.romance?.marriage?.divorced||[];
 divorced.forEach(x=>{const c=state.characters?.[x.name];if(c){c.formerPartner=true;c.formerSpouse=true;if(c.relationshipType==="老婆"||c.relationshipType==="戀人")c.relationshipType=null}});
 if(p.romance?.spouse&&divorced.some(x=>x.name===p.romance.spouse))p.romance.spouse=null;
 ensureDomesticPlayoffPhase();
 state.logs.push("🔧 V1.9.1.1：修正5月/11月季後賽未啟動、離婚後仍顯示老婆、國內聯賽超過12隊。");
 p.v1911Migrated=true;
}
function migrateProV1912(){
 const p=state.player;if(p.v1912Migrated)return;
 const q=state.characters?.["顧清顏"];
 if(q&&p.romance?.spouse!=="顧清顏"){
   q.formerPartner=true;q.formerSpouse=true;
   if(q.relationshipType==="老婆"||q.relationshipType==="戀人")q.relationshipType=null;
   p.romance=p.romance||{};p.romance.marriage=p.romance.marriage||{trust:80,crisis:null,divorced:[]};
   p.romance.marriage.divorced=p.romance.marriage.divorced||[];
   if(!p.romance.marriage.divorced.some(x=>x.name==="顧清顏"))p.romance.marriage.divorced.push({name:"顧清顏",year:state.date.year,week:state.date.week,reason:"舊存檔離婚狀態修復"});
 }
 const sn=p.proCareer?.season;
 if(sn?.phase==="季後賽"&&sn.playoffSchedule){
   const label=playoffRoundLabel(sn.playoffRound||0);
   sn.playoffSchedule.phase=`${sn.seasonName||""}季後賽${label}`;sn.playoffSchedule.stageLabel=label;
 }
 const intl=p.proCareer?.international||{};
 [intl.msi,intl.worlds].forEach(ev=>{
   if(!ev?.schedule)return;
   const kos=ev.schedule.filter(x=>x.knockout).sort((a,b)=>(a.round||0)-(b.round||0));
   const labels=["八強","四強","冠亞賽"];
   kos.forEach((m,i)=>{m.phase=`${m.event||""}${labels[Math.min(i,2)]}`;m.stageLabel=labels[Math.min(i,2)]});
 });
 state.logs.push("🔧 V1.9.1.2：修正顧清顏離婚後仍顯示舊身分；國內季後賽、MSI、世界賽淘汰賽明確顯示八強／四強／冠亞賽。");
 p.v1912Migrated=true;
}
function migrateProV1913(){
 const p=state.player;if(p.v1913Migrated)return;
 normalizeFormerSpouseSocialState();
 const q=state.characters?.["顧清顏"];
 if(q){
   q.formerSpouse=true;q.formerPartner=true;q.identityType="前妻";q.specialRelation="前妻";q.relationshipType=null;
   if(p.romance?.spouse==="顧清顏")p.romance.spouse=null;
   p.romance.partners=(p.romance.partners||[]).filter(n=>n!=="顧清顏");
   if(p.romance.partner==="顧清顏")p.romance.partner=p.romance.partners[0]||null;
 }
 state.logs.push("🔧 V1.9.1.3：社交頁面的前妻身分改為即時校正；顧清顏會固定顯示「身分：前妻／目前關係：前妻」，並清除殘留老婆資料。");
 p.v1913Migrated=true;
}
function migrateProV1914(){
 const p=state.player;if(p.v1914Migrated)return;
 ensureInternationalChampionHistory();
 ensureDomesticRegularSeasonPhase();
 const it=p.proCareer?.international;
 if(it?.msi?.championTeam&&!it.msi.finalized)recordInternationalChampion("MSI",it.msi.championTeam,it.msi.championRegion||internationalTeamRegion(it.msi.championTeam),state.date.year);
 if(it?.worlds?.championTeam&&!it.worlds.finalized)recordInternationalChampion("世界賽",it.worlds.championTeam,it.worlds.championRegion||internationalTeamRegion(it.worlds.championTeam),state.date.year);
 state.logs.push("🔧 V1.9.1.4：2月／8月例行賽加入每日硬性開季保險；最近記錄新增MSI／世界賽冠軍；MSI冠軍賽區獲世界賽第4種子門票。");
 p.v1914Migrated=true;
}
function migrateProV1915(){
 const p=state.player;if(p.v1915Migrated)return;
 ensureTransferMarket();
 state.logs.push("🆕 V1.9.1.5：冬季／夏季轉會期新增掛牌出售市場。戰隊可因成績、財務、戰術適配、紀律或陣容重整出售選手；掛牌不保證成交，買家也可能將選手交易至次級聯賽／二隊。");
 p.v1915Migrated=true;
}
function migrateProV1916(){
 const p=state.player;if(p.v1916Migrated)return;
 const before=p.romance?.spouse;
 normalizeFormerSpouseSocialState();
 // Exact old-save repair shown in current screenshot: 顧清妍 (not 顧清顏).
 const q=state.characters?.["顧清妍"];
 if(before==="顧清妍"&&spouseHasFinalDivorceSignal("顧清妍"))finalizeFormerSpouseState("顧清妍","舊存檔：顧清妍已提出／決定離婚");
 if(q?.formerSpouse)finalizeFormerSpouseState("顧清妍",xReasonForFormerSpouse("顧清妍"));
 state.logs.push("🔧 V1.9.1.6：修正離婚身分判定。舊版誤把「顧清妍」寫成「顧清顏」；現在會依正式離婚紀錄、前妻旗標，以及舊存檔中的『提出／決定離婚』訊號自動完成前妻狀態，並同步清除婚姻卡的老婆資料。");
 p.v1916Migrated=true;
}
function migrateProV1917(){
 const p=state.player;if(p.v1917Migrated)return;
 repairSocialHomeLocations();
 state.logs.push("🆕 V1.9.1.8：異地認識的異性加入所在地限制。吃飯、電影、約會與成人私人相處等實體互動，必須雙方位於同一地區；NPC也可能主動飛到夜鋒目前所在地並停留數天。");
 p.v1917Migrated=true;
}
function migrateProV1918(){const p=state.player;if(p.v1918Migrated)return;repairChampionFollowers();ensureAudienceRating();ensureImageRepair();ensureMediaLaw();ensureCommercial();ensureRosterSubstitutes();syncCompanionCurrentLocation();state.logs.push("🆕 V1.9.1.8：職業生涯與社會關係大型更新完成：粉絲補償、比賽吸粉、大眾評價、教練信任、NPC所在地／多職業男女、求婚選人、婚後住所、主動邀約、粉絲見面會、團建、替補、球探挖角、法律爆料、形象修復、地下戀情、合約要求與多重商業合作。");p.v1918Migrated=true}
function migrateProV1919(){
 const p=state.player;if(p.v1919Migrated)return;
 repairPermanentCivilianProfessions();
 (state.messages||[]).forEach(m=>{if(m&&m.type==="normal"&&!m.replied&&/要不要找時間|有空嗎？想約你一起/.test(m.text||"")&&state.characters?.[m.from]){m.type="socialInvite";m.resolved=false;m.inviteLabel=(m.text.match(/找時間(.+?)？/)||m.text.match(/一起(.+?)。/)||[])[1]||"見面"}});
 const pc=p.proCareer;if(pc?.poachOffer?.team){pc.poachOffer.status=pc.poachOffer.status||"等待回覆";recoverPoachFlow()}
 repairTeamRegionAndHistory();
 state.logs.push("🔧 V1.9.1.9：修正NPC主動邀約可接受／婉拒；挖角正式串接轉會放行、轉會費與個人合約；生活圈人物永久保留真實職業，藝人／模特兒等不再被業餘玩家覆蓋。");
 p.v1919Migrated=true;
}
function inferHistoricLastMatchTeam(){
 const pc=state.player.proCareer,m=pc?.lastMatch;if(!m||m.team)return m?.team||null;
 const esc=x=>String(x||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
 const score=esc(m.score),opp=esc(m.opp);
 const lines=[...(state.news||[]),...(state.logs||[])];
 for(const line of lines){const text=String(line||"");if(!text.includes(m.score||"")||!text.includes(m.opp||""))continue;let x=text.match(new RegExp(`(?:職業聯賽：|🌍\\s*[^：]+：)?\\s*([^：｜]+?)\\s+${score}\\s+${opp}`));if(x&&x[1]){let team=x[1].replace(/^.*：/,"").trim();if(team&&team!==m.opp){m.team=team;return team}}}
 const h=(pc.matchHistory||[]).find(x=>x&&x.opp===m.opp&&x.score===m.score&&x.week===m.week&&x.team);if(h?.team){m.team=h.team;return h.team}
 return null;
}
function migrateProV1921(){const p=state.player;if(p.v1921Migrated)return;const pc=p.proCareer;if(pc?.lastMatch&&!pc.lastMatch.team)inferHistoricLastMatchTeam();(pc?.matchHistory||[]).forEach(x=>{if(!x.team&&pc.lastMatch&&x.opp===pc.lastMatch.opp&&x.score===pc.lastMatch.score&&x.week===pc.lastMatch.week&&pc.lastMatch.team)x.team=pc.lastMatch.team});state.logs.push("🔧 V1.9.2.1：最近比賽紀錄改為保存『比賽當時戰隊』，轉隊後不再被新戰隊名稱覆蓋；合約『補強指定位置』可選上路／打野／中路／下路／輔助，並保存為正式談判條件。");p.v1921Migrated=true}
function migrateProV1926(){const p=state.player;if(p.v1928Migrated)return;ensureMediaLaw();p.v1928Migrated=true;state.logs.push("🔧 V1.9.2.8：修復換日容錯與法律／公關舊存檔 teamLevel 異常，聘請按鈕恢復顯示。");}
function migrateProV1924(){const p=state.player;if(p.v1924Migrated)return;ensureMediaLaw();ensureImageRepair();(p.adultLife?.pregnancies||[]).filter(x=>x.born).forEach(ensureSupportAgreement);p.v1924Migrated=true;state.logs.push("🔧 V1.9.2.4：修復職業週換日缺失函式；法律／公關與既有子女扶養和解入口恢復顯示。");}

function migrateProV1936(){
 const p=state.player;if(p.v1936VisitFix)return;
 const serial=state.date.year*364+(state.date.week-1)*7+state.date.day;
 for(const m of (state.messages||[])){
   if(!m?.from||!state.characters?.[m.from])continue;
   const text=String(m.text||""),hit=text.match(/已經飛到\s*([^・。\s]+)・([^。\s]+)\s*了。這幾天要不要見面/);
   if(!hit)continue;
   const c=state.characters[m.from],country=hit[1],city=hit[2];
   if(!c.homeCountry)c.homeCountry=c.currentCountry||c.nationality||null;
   if(!c.homeCity)c.homeCity=c.currentCity||null;
   c.currentVisit={country,city,from:{country:c.homeCountry||null,city:c.homeCity||null},untilSerial:Math.max(serial+3,c.currentVisit?.untilSerial||0),reason:"主動來找夜鋒"};
   c.currentCountry=country;c.currentCity=city;c.currentTravelReason="主動來找夜鋒";
   // 舊版把這類訊息直接標成已處理，導致只能按「繼續」。恢復為可接受／婉拒。
   if(!m.replied){m.type="socialVisit";m.resolved=false;m.inviteLabel="來訪見面";}
 }
 p.v1936VisitFix=true;state.logs.push("🔧 V1.9.3.6：修復NPC主動飛來找你後所在地未更新，以及來訪邀請缺少接受／婉拒選項。");
}
function migrateProV1935(){
 const p=state.player,pc=p?.proCareer;if(!pc||p.v1935World16Fix)return;
 const ev=pc.international?.worlds;
 if(ev?.groups?.length){
   const bonus=ev.msiBonusRegion||msiChampionRegionForYear(state.date.year)||pc.region||"PCS",correct=[];
   for(const r of PRO_REGIONS){const teams=worldsSeedsForRegion(r,r===bonus);for(let i=0;i<teams.length;i++)correct.push({team:teams[i],region:r,seed:i+1})}
   // 60隊資料庫是唯一合法來源；每屆必須精確16隊且不得重複。
   const legal=new Set(PRO_REGIONS.flatMap(r=>regionTeams(r))),uniq=[];
   for(const x of correct){if(x?.team&&legal.has(x.team)&&!uniq.some(y=>y.team===x.team))uniq.push(x)}
   // 理論上資格規則必定產生16隊；若舊資料異常，再按各賽區固定名單補足，但仍維持每區3/bonus4上限。
   const quota=Object.fromEntries(PRO_REGIONS.map(r=>[r,r===bonus?4:3]));
   for(const r of PRO_REGIONS){for(const t of regionTeams(r)){if(uniq.length>=16)break;if(uniq.filter(x=>x.region===r).length>=quota[r])break;if(!uniq.some(x=>x.team===t))uniq.push({team:t,region:r,seed:uniq.filter(x=>x.region===r).length+1})}}
   ev.seedEntries=uniq.slice(0,16);ev.msiBonusRegion=bonus;
   const allowed=new Set(ev.seedEntries.map(x=>x.team)),seen=new Set();
   // 保留既有分組位置與已完成賽事，只移除重複／不合資格隊，再把缺少的合資格隊補進不足4隊的組。
   for(const g of ev.groups){g.teams=(g.teams||[]).filter(t=>allowed.has(t)&&!seen.has(t)&&(seen.add(t),true))}
   const missing=ev.seedEntries.map(x=>x.team).filter(t=>!seen.has(t));
   for(const t of missing){const e=ev.seedEntries.find(x=>x.team===t),targets=ev.groups.filter(g=>(g.teams||[]).length<4);let target=targets.find(g=>!(g.teams||[]).some(n=>ev.seedEntries.find(x=>x.team===n)?.region===e.region))||targets[0];if(target){target.teams.push(t);seen.add(t)}}
   // 最後一道硬檢查：若仍不是4x4，依完整16隊重新排組；玩家隊伍仍優先A組。
   const flat=ev.groups.flatMap(g=>g.teams||[]);if(ev.groups.length!==4||ev.groups.some(g=>(g.teams||[]).length!==4)||flat.length!==16||new Set(flat).size!==16)ev.groups=buildWorldsGroups(ev.seedEntries,pc.team);
   state.logs.push(`🔧 V1.9.3.6：世界賽名單硬性校正為16隊（${bonus} 4席，其餘賽區各3席），並補回舊版刪除重複隊伍後遺失的資格隊。`);
 }
 p.v1935World16Fix=true;
}
function migrateProV1934(){
 const p=state.player,pc=p?.proCareer;if(!pc||p.v1934WorldIdentityFix)return;
 const ev=pc.international?.worlds;
 if(ev){
   // 修復舊存檔分組：同一戰隊只能出現一次；玩家戰隊固定保留原本所在組（通常 A 組）。
   if(ev.groups?.length){
     const seen=new Set();let playerKept=false;
     for(const g of ev.groups){
       g.teams=(g.teams||[]).filter(t=>{if(!t)return false;if(t===pc.team){if(playerKept)return false;playerKept=true}if(seen.has(t))return false;seen.add(t);return true});
     }
     const valid=(ev.seedEntries||[]).map(x=>x?.team).filter(Boolean);
     for(const t of valid){if(seen.has(t))continue;const target=[...ev.groups].sort((a,b)=>(a.teams?.length||0)-(b.teams?.length||0)).find(g=>(g.teams?.length||0)<4);if(target){target.teams.push(t);seen.add(t)}}
     // 若舊版 seedEntries 本身已錯誤，且尚未開打，依 V1.9.3.2 規則重建整屆名單與分組。
     const flat=ev.groups.flatMap(g=>g.teams||[]),bad=flat.length!==16||new Set(flat).size!==16;
     if(bad&&!ev.schedule?.some(x=>x.played)){ev.groups=[];ev.seedEntries=[];ev.stage="抽籤前";buildInternationalTournament("世界賽")}
   }
   // 已晉級淘汰賽的舊存檔：把 LCK Summer #1 等槽位代號立即換成該屆真實種子戰隊。
   for(const m of ev.schedule||[]){
     if(m?.knockout&&!m.played&&/^(LCK|LPL|LEC|LCS|PCS)\s+(Spring|Summer)\s+#(\d)$/i.test(m.opp||"")){
       const z=m.opp.match(/^(LCK|LPL|LEC|LCS|PCS)\s+(Spring|Summer)\s+#(\d)$/i),region=z[1].toUpperCase(),seed=Number(z[3]);
       const real=(ev.seedEntries||[]).find(x=>x.region===region&&Number(x.seed)===seed)?.team||worldsSeedsForRegion(region,region===ev.msiBonusRegion)[seed-1];
       if(real)m.opp=real;
     }
   }
 }
 p.v1934WorldIdentityFix=true;state.logs.push("🔧 V1.9.3.6：世界賽淘汰賽改用真實戰隊名稱；修復舊存檔重複 Nova Gaming 分組與 LCK Summer #1 等槽位代號。");
}
function migrateProV1933(){
 const p=state.player;if(p.v1933BetrayalSpouseFix)return;
 const spouse=p.romance?.spouse,by=p.emotion?.betrayalBy;
 if(spouse&&by===spouse){
   finalizeFormerSpouseState(spouse,"舊存檔修復：配偶劈腿，婚姻已破裂");
   state.logs.push(`🔧 V1.9.3.3：${spouse} 已發生劈腿分手事件，身分由「老婆」修正為「前妻」，並清除婚姻／伴侶殘留狀態。`);
 }
 p.v1933BetrayalSpouseFix=true;
}
function migrateProV1932(){
 const p=state.player,pc=p?.proCareer;if(!pc||p.v1932WorldSeedFix)return;
 const it=ensureInternationalWorld(),ev=it?.worlds;
 if(ev?.groups?.length&&state.date.year===it.year&&!ev.schedule?.some(x=>x.played)){
   ev.groups=[];ev.seedEntries=[];ev.stage="抽籤前";buildInternationalTournament("世界賽");
   state.logs.push("🔧 V1.9.3.2：世界賽資格改為季後賽優先：冠軍#1、亞軍#2、例行賽最高未取得資格者#3；MSI冠軍賽區四強敗隊比較例行賽決定#4，並重抽尚未開打的錯誤分組。");
 }
 p.v1932WorldSeedFix=true;
}
function migrateProV1930(){
 const p=state.player,pc=p?.proCareer,sn=pc?.season;if(!sn)return;
 if(sn.phase==="季後賽"&&(sn.playoffRound||0)===0&&sn.playoffSchedule&&!sn.playoffSchedule.played){
   const sorted=[...sn.teams].sort((a,b)=>(b.w-a.w)||((b.gw-b.gl)-(a.gw-a.gl)));
   const seed=Number(sn.seed)||Math.max(1,sorted.findIndex(x=>x.name===pc.team)+1),correct=sorted[(9-seed)-1];
   if(correct&&sn.playoffSchedule.opp!==correct.name){const old=sn.playoffSchedule.opp;sn.playoffSchedule.opp=correct.name;state.logs.push(`🔧 V1.9.3.0：修正季後賽八強種子配對，${pc.team} 第 ${seed} 種子應對第 ${9-seed} 種子 ${correct.name}（原錯誤對手 ${old}）。`)}
 }
 p.v1930PlayoffSeedFix=true;
}
function migrateProV1928(){const p=state.player;if(p.v1928Migrated)return;repairCompetitiveFormV1928();ensureProRoster();ensureRosterSubstitutes();p.v1928Migrated=true;state.logs.push("🔧 V1.9.2.8：重製競技狀態、修正正常約會不降狀態；新增戰隊頁面與比賽復盤。");}
function migrateProV1923(){const p=state.player;if(p.v1923Migrated)return;const pc=p.proCareer||{};if(pc.contract)completeContract(pc.contract);p.v1923Migrated=true;state.logs.push("🔧 V1.9.2.3：修復舊存檔載入時 contractDetails 缺失造成的生涯頁錯誤。")}
function migrateProV1922(){const p=state.player;if(p.v1922Migrated)return;ensureEthics();ensureMediaLaw();ensureImageRepair();(p.adultLife?.pregnancies||[]).filter(x=>x.born).forEach(ensureSupportAgreement);if(!p.v1922CareerRepRefunded){const before=p.adultLife.careerReputation;p.adultLife.careerReputation=clamp(before+50,0,100);p.adultLife.reputationHistory.unshift({delta:+(p.adultLife.careerReputation-before).toFixed(1),reason:"V1.9.2.2 重複爆料職業風評補償",year:state.date.year,week:state.date.week});p.v1922CareerRepRefunded=true;state.logs.push(`🎁 V1.9.2.2 補償：因舊版同一事件重複扣除職業風評，已返還 ${Math.round(p.adultLife.careerReputation-before)} 點（上限100）。`)}state.logs.push("🔧 V1.9.2.2：同一爆料改為事件追蹤，舊聞不再重複扣完整職業風評；加入改過自新、法律／公關團隊，以及前女友親子扶養和解協議。");p.v1922Migrated=true}
function proDaySerial(){return ((state.date.year||2026)*52+(state.date.week||1))*7+(state.date.day||1)}
function proScheduleDayLabel(x){
 if(!x)return "未排定";const days=["一","二","三","四","五","六","日"],m=careerMonthFromWeek(x.week),y=x.year;
 return `${y}年${m}月・第${x.week}週・週${days[x.day-1]}`;
}
function buildProRegularSchedule(){
 const pc=state.player.proCareer,sn=pc.season;if(!sn||sn.schedule?.length)return;
 const seasonName=sn.seasonName||(careerMonthFromWeek(state.date.week)<=6?"春季":"夏季");buildSeasonScheduleByCalendar(seasonName);
}
function ensureInternationalSchedule(){
 const ph=proAnnualPhase();if(!["MSI","世界賽"].includes(ph)||state.player.proCareer.stage!=="starter")return null;
 const pc=state.player.proCareer,ev=buildInternationalTournament(ph),team=pc.team;if(!playerQualifiedForInternational(ph)){ev.qualified=false;ev.schedule=[];return null}ev.qualified=true;
 ev.schedule=ev.schedule||[];
 if(!ev.schedule.length){
   const myGroup=ev.groups.find(g=>g.teams.includes(team))||ev.groups[0],opps=myGroup.teams.filter(x=>x!==team);
   // If generated group missed the player's exact team, replace first slot so the player's matches exist.
   if(!myGroup.teams.includes(team)){myGroup.teams[0]=team;opps.splice(0,opps.length,...myGroup.teams.filter(x=>x!==team))}
   const slots=ph==="世界賽"?[[49,2],[49,4],[49,6],[50,2],[50,4],[50,6]]:[[23,2],[23,4],[23,6],[24,2],[24,4],[24,6],[25,2],[25,4]];
   const groupGames=ph==="世界賽"?6:8;
   for(let i=0;i<groupGames;i++)ev.schedule.push({id:`${ph}-G-${i+1}`,phase:`${ph}分組賽`,international:true,event:ph,round:i+1,year:state.date.year,week:slots[i][0],day:slots[i][1],opp:opps[i%opps.length],bo:1,played:false});
   ev.playerRecord={w:0,l:0};ev.knockoutRound=0;ev.eliminated=false;ev.champion=false;ev.stage="分組賽";
 }
 return ev;
}
function currentInternationalMatch(){
 const ev=ensureInternationalSchedule();if(!ev||ev.eliminated||ev.champion)return null;
 let m=ev.schedule.find(x=>!x.played)||null;
 if(!m&&ev.stage==="淘汰賽")return null;
 return m;
}
function advanceInternationalTournament(ev){
 const ph=ev===state.player.proCareer.international?.msi?"MSI":"世界賽",pc=state.player.proCareer,p=state.player;
 const groupGames=ph==="MSI"?8:6;
 if(ev.schedule.filter(x=>x.phase.includes("分組")).every(x=>x.played)&&ev.stage==="分組賽"){
   // Player qualification uses group record, with a forgiving tiebreak simulation.
   const qualify=ev.playerRecord.w>ev.playerRecord.l||(ev.playerRecord.w===ev.playerRecord.l&&Math.random()<.55);
   if(!qualify){ev.eliminated=true;ev.stage="分組淘汰";state.news.unshift(`${pc.team} 結束 ${ph} 分組賽旅程。`);return}
   ev.stage="淘汰賽";ev.knockoutRound=0;
   const slots=ph==="世界賽"?[[51,2],[51,5],[52,3]]:[[25,2],[25,5],[26,3]];
   const labels=["八強","四強","冠亞賽"];
   // 淘汰賽一律使用本屆世界賽已取得資格的真實戰隊名稱，不再顯示 LCK Summer #1 這類槽位代號。
   const qualified=[...new Set((ev.seedEntries||[]).map(x=>x?.team).filter(Boolean).concat((ev.groups||[]).flatMap(g=>g.teams||[])))].filter(t=>t!==pc.team);
   const myGroup=ev.groups?.find(g=>(g.teams||[]).includes(pc.team));
   const sameGroup=new Set(myGroup?.teams||[]);
   let pool=qualified.filter(t=>!sameGroup.has(t));if(pool.length<3)pool=qualified;
   pool=[...pool].sort((a,b)=>{const ea=(ev.seedEntries||[]).find(x=>x.team===a),eb=(ev.seedEntries||[]).find(x=>x.team===b);return ((ea?.seed||9)-(eb?.seed||9))||String(a).localeCompare(String(b))});
   const opps=[pool[0],pool.find(x=>x!==pool[0]),pool.find(x=>x!==pool[0]&&x!==pool[1])].filter(Boolean);
   slots.forEach((x,i)=>ev.schedule.push({id:`${ph}-KO-${i+1}`,phase:`${ph}${labels[i]}`,international:true,event:ph,knockout:true,round:i+1,year:state.date.year,week:x[0],day:x[1],opp:opps[i]||qualified[i%Math.max(1,qualified.length)]||"待定戰隊",bo:5,played:false}));
   state.news.unshift(`🌍 ${pc.team} 從 ${ph} 分組賽晉級淘汰賽！`);
 }
}

const REGION_STRENGTH={LCK:92,LPL:89,LEC:83,LCS:79,PCS:75};
function teamRegion(name){return fixedTeamRegion(actualTeamForSlot(name))||state.player.proCareer.region||"PCS"}
function regionMatchAdjustment(opp){const mine=REGION_STRENGTH[state.player.proCareer.region||"PCS"]||75,theirs=REGION_STRENGTH[teamRegion(opp)]||82;return clamp((mine-theirs)*.009,-.16,.12)}
function offFieldMatchAdjustment(){const p=state.player,pc=p.proCareer;let x=0;x+=(p.mood-60)*.0015+(p.energy-60)*.002-(p.stress-45)*.0025;x+=(pc.lockerRoom-60)*.0015;if(p.prCrisis)x-=.05;if(p.condition?.injury)x-=.06;if((p.condition?.fatigue||0)>70)x-=.05;return clamp(x,-.22,.12)}
function runInternationalMatch(){
 const p=state.player,pc=p.proCareer,ev=ensureInternationalSchedule(),m=currentInternationalMatch();if(!ev||!m)return;
 const chem=teamChemistry(),inj=p.condition.injury?-.07:0,lifeAdj=clamp((p.energy-60)*.0015+(p.mood-60)*.0012-(p.stress-35)*.0018,-.18,.12);
 const metaAdj=playerMetaFit()*.028,expAdj=majorEventExperienceFactor(),regionAdj=regionMatchAdjustment(m.opp),offAdj=offFieldMatchAdjustment(),need=m.bo===1?1:3;let my=0,his=0,logs=[],g=0;
 const fakeOpp={name:m.opp};
 while(my<need&&his<need){g++;const wc=clamp((.45+(avg()-72)*.009+(chem-55)*.0018+inj+lifeAdj+metaAdj+expAdj+regionAdj+offAdj)-.125,.08,.64),win=Math.random()<wc;if(win)my++;else his++;logs.push(...richGameEvents(g,fakeOpp,win))}
 m.played=true;const win=my>his;if(m.phase.includes("分組")){ev.playerRecord.w+=win?1:0;ev.playerRecord.l+=win?0:1}
 p.internationalExperience[m.event]=(p.internationalExperience[m.event]||0)+1;if(m.bo===5)p.internationalExperience.國際BO5=(p.internationalExperience.國際BO5||0)+1;
 if(m.knockout&&!win){
   ev.eliminated=true;ev.stage=`${m.phase}淘汰`;
   const title=m.event==="世界賽"?m.phase.replace("世界賽","世界賽"):`${m.event}${m.phase.replace(m.event,"")}`;
   if(m.event==="世界賽"&&/八強|四強|冠亞賽/.test(m.phase))addAchievement(`world-${m.phase}`,m.phase,`${state.date.year}國際賽`,state.date.year,false);
   if(/冠亞賽/.test(m.phase))finalizeInternationalChampion(ev,m.event,m.opp);
 }
 if(m.knockout&&win&&/決賽|冠亞賽/.test(m.phase)){
   ev.champion=true;ev.stage="冠軍";
   finalizeInternationalChampion(ev,m.event,pc.team);
   addAchievement(`${m.event}-champion`,`${m.event}冠軍`,`${pc.team}奪冠`,state.date.year,false);
   awardInternationalTitle1979(m.event,pc.team);
   if(m.event==="世界賽")applyWorldChampionContractBoost();
 }
 const k=rand(win?4:1,win?11:7),d=rand(1,7),as=rand(4,15),cs=rand(235,365),mvp=win&&Math.random()<.3;
 pc.careerStats.matches++;pc.careerStats.seriesW+=win?1:0;pc.careerStats.seriesL+=win?0:1;pc.careerStats.gameW+=my;pc.careerStats.gameL+=his;pc.careerStats.kills+=k;pc.careerStats.deaths+=d;pc.careerStats.assists+=as;pc.careerStats.mvp+=mvp?1:0;
 pc.matchHistory.unshift({team:pc.team,opp:m.opp,score:`${my}:${his}`,win,k,d,a:as,cs,mvp,week:state.date.week,event:m.event,phase:m.phase});
 pc.lastMatch={team:pc.team,opp:m.opp,win,score:`${my}:${his}`,logs:[...logs],k,d,a:as,cs,mvp,event:m.event,phase:m.phase,year:state.date.year,week:state.date.week,day:state.date.day,postInterviewDone:false};
 pc.pendingPostInterview=true;
 const stageLoad=m.knockout?(/決賽|冠亞賽/.test(m.phase)?12:8):4,gameLoad=(my+his)*3;p.energy=clamp(p.energy-(10+gameLoad+stageLoad),0,100);p.condition.fatigue=clamp(p.condition.fatigue+14+gameLoad+stageLoad,0,100);p.stress=clamp(p.stress+(win?4:9)+stageLoad,0,100);updateTeamRelationsAfterMatch(win);updateProfessionalReputation(win,mvp);awardMatchPopularity(win,mvp,m.phase);
 state.news.unshift(`${m.phase}：${pc.team} ${my}:${his} ${m.opp}。`);
 advanceInternationalTournament(ev);state.logs.push(`🌍 ${m.phase}：${pc.team} ${my}:${his} ${m.opp}｜系列賽${win?"勝":"負"}。`);save();render();showMatchReport();
}function currentScheduledProMatch(){
 const pc=state.player.proCareer,im=currentInternationalMatch();if(im)return im;
 const sn=pc.season;if(!sn)return null;
 if(sn.phase==="例行賽"){buildProRegularSchedule();return sn.schedule.find(x=>!x.played)||null}
 if(sn.phase==="季後賽")return sn.playoffSchedule||null;
 return null;
}
function isProMatchToday(m=currentScheduledProMatch()){return !!m&&m.year===state.date.year&&m.week===state.date.week&&m.day===state.date.day}
function playoffRoundLabel(round){return ["八強","四強","冠亞賽"][Math.max(0,Math.min(2,Number(round)||0))]||"季後賽"}
function schedulePlayoffMatch(){
 const pc=state.player.proCareer,sn=pc.season;if(!sn||sn.phase!=="季後賽")return;
 const opp=currentProOpponent();if(!opp)return;
 let w=state.date.week,y=state.date.year,d=6;
 // 下一個週六；若今天已是週六則排下一週，確保有明確準備時間。
 if(state.date.day>=6){w++;if(w>52){w=1;y++}}
 const label=playoffRoundLabel(sn.playoffRound||0);
 sn.playoffSchedule={id:`PO-${(sn.playoffRound||0)+1}`,phase:`${sn.seasonName||""}季後賽${label}`,round:(sn.playoffRound||0)+1,stageLabel:label,year:y,week:w,day:d,opp:opp.name,bo:5,played:false};
}
function proMatchDueGuard(){
 const m=currentScheduledProMatch();if(!m)return {ok:false,msg:"目前沒有排定的正式比賽。"};
 const now=proDaySerial(),target=((m.year*52+m.week)*7+m.day);
 if(now>=target&&!m.played)return {ok:true,match:m,overdue:now>target};
 return {ok:false,match:m,msg:`下一場正式比賽是 ${proScheduleDayLabel(m)} 對 ${m.opp}，今天尚未到比賽日。`};
}
function ensureMandatoryProMatchToday(){
 const pc=state.player.proCareer;if(pc?.stage!=="starter")return null;const m=currentScheduledProMatch();if(!m)return null;
 const now=proDaySerial(),target=((m.year*52+m.week)*7+m.day);
 return now>=target&&!m.played?m:null;
}
function proHomeHeader(){
 const p=state.player,pc=p.proCareer;if(!isProfessionalStage())return "";
 const sn=pc.season,me=sn?.teams?.find(x=>x.name===pc.team),match=pc.stage==="starter"?currentScheduledProMatch():null;
 return `<section class="card"><div class="row space"><div><div class="small">${pc.team}</div><h2>${pc.stage==="academy"?"青訓":pc.stage==="sub"?"替補":"先發"} · ${p.role} ${p.name}</h2></div><span class="badge">${formLabel()}</span></div>
 <div class="stat-grid">${stat("聯賽戰績",me?`${me.w}勝${me.l}敗`:"0勝0敗")}${stat("教練信任",Math.round(pc.coachTrust||50))}${stat("職業風評",Math.round(p.adultLife.careerReputation||50))}${stat("傷病",p.condition?.injury?p.condition.injury.type:"健康")}</div>
 ${match?`<div class="notice">${isProMatchToday(match)?"🔴 今天是比賽日":"📅 下一場"}：${match.phase||"正式比賽"}｜${proScheduleDayLabel(match)}｜${pc.team} vs ${match.opp}｜BO${match.bo}</div>`:pc.stage==="academy"?`<div class="notice">青訓身份：目前沒有頂級聯賽正式出賽資格。</div>`:""}</section>`;
}
function proMatchHub(){
 const p=state.player,pc=p.proCareer;if(pc.stage==="academy"){modal(`<h2>🆚 青訓訓練賽</h2><p>你目前是青訓選手，沒有正式聯賽出賽資格。團隊訓練賽會影響教練信任與升上一軍的機會。</p><button id="academyScrim" class="primary">進行訓練賽</button>${closeBtn()}`);document.querySelector("#academyScrim").onclick=()=>{if(!consume("青訓訓練賽",1))return;pc.coachTrust=clamp(pc.coachTrust+rand(1,4),0,100);p.condition.fatigue=clamp(p.condition.fatigue+8,0,100);state.logs.push("🆚 完成青訓訓練賽，教練持續評估你的表現。");save();render()};return}
 if(pc.stage==="sub"){modal(`<h2>🏆 職業比賽</h2><p>你目前是替補。是否上場由教練與先發狀態決定；平時仍需準備比賽。</p>${closeBtn()}`);return}
 const guard=proMatchDueGuard();if(!guard.ok){modal(`<h2>📅 職業賽程</h2><p>${guard.msg}</p>${closeBtn()}`);return}
 if(guard.overdue)state.logs.push(`🛠️ 賽程補賽：允許立即補打原定 ${proScheduleDayLabel(guard.match)} 對 ${guard.match.opp} 的比賽，解除換日卡死。`);
 startPreMatchMedia();
}
function preparePlayoffs(){
 const pc=state.player.proCareer,sn=pc.season;if(!sn||sn.myMatches<22||sn.playoffs)return;
 const required=sn.seasonName==="春季"?"春季季後賽":"夏季季後賽";
 if(proAnnualPhase()!==required){sn.regularComplete=true;sn.phase="例行賽";return}
 const sorted=[...sn.teams].sort((a,b)=>(b.w-a.w)||((b.gw-b.gl)-(a.gw-a.gl))),seed=sorted.findIndex(x=>x.name===pc.team)+1;
 sn.playoffs=true;sn.phase=seed<=8?"季後賽":"賽季結束";sn.seed=seed;sn.playoffRound=seed<=8?0:null;sn.playoffWins=0;
 if(seed<=8)state.news.unshift(`${pc.team} 以例行賽第 ${seed} 名晉級季後賽，接下來全面採 BO5。`);
 else state.news.unshift(`${pc.team} 例行賽排名第 ${seed}，無緣季後賽。`);
}
function currentProOpponent(){
 const pc=state.player.proCareer,sn=pc.season;if(!sn)return null;
 if(sn.phase==="例行賽"){const m=currentScheduledProMatch();return m?sn.teams.find(x=>x.name===m.opp):null;}
 if(sn.phase==="季後賽"){
   const sorted=[...sn.teams].sort((a,b)=>(b.w-a.w)||((b.gw-b.gl)-(a.gw-a.gl)));
   // 八強固定依例行賽種子配對：1v8、2v7、3v6、4v5。不得從未晉級隊伍抽對手。
   if((sn.playoffRound||0)===0){
     const seed=Number(sn.seed)||Math.max(1,sorted.findIndex(x=>x.name===pc.team)+1);
     const opponentSeed=9-seed;
     return sorted[opponentSeed-1]||null;
   }
   // 四強／冠亞賽只從季後賽前八名中產生後續對手；排除自己與已交手對手。
   const qualified=sorted.slice(0,8).filter(x=>x.name!==pc.team);
   const played=new Set((sn.playoffOpponents||[]));
   const available=qualified.filter(x=>!played.has(x.name));
   const pool=available.length?available:qualified;
   return pool.length?pool[rand(0,pool.length-1)]:null;
 }
 return null;
}
function startPreMatchMedia(){
 const pc=state.player.proCareer,sn=pc.season;if(!sn||pc.stage!=="starter")return;
 const guard=proMatchDueGuard();if(!guard.ok){modal(`<h2>📅 尚未到比賽日</h2><p>${guard.msg}</p>${closeBtn()}`);return}
 preparePlayoffs();const scheduled=currentScheduledProMatch(),opp=scheduled?.international?{name:scheduled.opp}:currentProOpponent();if(!opp){modal(`<h2>🏆 賽季</h2><p>目前沒有待進行的正式比賽。</p>${closeBtn()}`);return;}
 const tactic=coachChooseTactic("正式比賽賽前");const coach=ensureCoachProfile(),fit=tacticFit(tactic);
 const proceed=()=>{const ctx=majorMediaContext();if(ctx)return startMajorInterview(ctx,"match");const im=currentInternationalMatch();if(im&&im.international)runInternationalMatch();else runRichLeagueMatch()};
 modal(`<h2>🧑‍🏫 賽前戰術會議</h2><p><strong>${coach?.name||"教練團"}</strong> 決定本場採用「${TACTIC_DEFS[tactic].name}」。</p><div class="notice">${TACTIC_DEFS[tactic].desc}<br>適配：${fit>=4?"非常適合":fit>=1?"適合":fit>-2?"普通":"不理想"}｜熟練度 ${Math.round(pc.tactics.mastery[tactic])}／陣容上限約 ${tacticAbilityCeiling(tactic)}</div><p class="small">選手可以提出意見，但正式比賽戰術由教練最終決定。</p><button id="acceptCoachPlan" class="primary">進入賽前流程</button>${closeBtn()}`);
 document.querySelector("#acceptCoachPlan").onclick=()=>{document.querySelector(".modal-backdrop")?.remove();proceed()};
}
function applyPreMedia(a,opp){
 const p=state.player,pc=p.proCareer;pc.pendingMedia=a;
 if(a==="humble"){mediaTrait("穩健",2);p.adultLife.careerReputation=clamp(p.adultLife.careerReputation+1,0,100);p.stress=clamp(p.stress-2,0,100)}
 if(a==="confident"){mediaTrait("自信",2);p.followers+=rand(15,45);p.condition.form=clamp(p.condition.form+2,0,100);p.stress=clamp(p.stress+2,0,100)}
 if(a==="trash"){mediaTrait("狂傲",3);p.followers+=rand(40,90);p.stress=clamp(p.stress+5,0,100);ensureOpponentRelationship(opp,true)}
 document.querySelector(".modal-backdrop")?.remove();const im=currentInternationalMatch();if(im&&im.international)runInternationalMatch();else runRichLeagueMatch();
}
function ensureOpponentRelationship(team,heated=false){
 const p=state.player,pc=p.proCareer,pr=p.role==="下路"?"ADC":p.role,realTeam=actualTeamForSlot(team),pro=actualProOpponent(realTeam,pr);
 let oppName=pro?.name;
 if(!oppName){
   const names=PRO_ROSTER_NAMES[realTeam]||[],roles=["上路","打野","中路","ADC","輔助"],ri=Math.max(0,roles.indexOf(pr));oppName=names[ri];
 }
 if(!oppName||isPlaceholderPersonName(oppName))return "對方選手";
 const role=pro?.role||pr;
 addSocialAcquaintance(oppName,heated?35:45,{isPro:true,isRival:true,role,team:realTeam,region:pro?.region||"",age:pro?.age,rating:pro?.rating,traits:["競爭心"]});
 const c=state.characters[oppName];c.known=true;c.isRival=true;c.isPro=true;c.team=realTeam;
 pc.rivals=pc.rivals||{};pc.rivals[oppName]=pc.rivals[oppName]||{team:realTeam,score:heated?20:5,status:heated?"競爭對手":"對手",meetings:0};pc.rivals[oppName].meetings++;
 return oppName;
}
function richGameEvents(gameNo,opp,win){
 const p=state.player,pc=p.proCareer,rival=ensureOpponentRelationship(opp.name,pc.pendingMedia==="trash"),good=p.condition.form>=65&&!p.condition.injury;
 const events=[
 `03:${rand(10,55)}｜${rival} 主動換血，夜鋒${good?"冷靜拉開距離並反打":"被迫交出召喚師技能"}`,
 `08:${rand(10,55)}｜河道爆發第一波碰撞，${pc.team}${win?"取得一血":"遭到對手先開局"}`,
 `14:${rand(10,55)}｜小龍團，${good?"夜鋒找到側翼輸出位置":"雙方拉扯後夜鋒狀態不佳"}`,
 `21:${rand(10,55)}｜中路團戰，隊友默契${teamChemistry()>=60?"發揮作用":"出現溝通落差"}`,
 `28:${rand(10,55)}｜Baron區域視野爭奪，${win?pc.team+"掌握主動權":opp.name+"逼退夜鋒一方"}`,
 `${rand(31,39)}:${rand(10,55)}｜GAME ${gameNo} END｜${win?pc.team:opp.name} 拿下本局`
 ];return events;
}
function teamChemistry(){const p=state.player,pc=p.proCareer,arr=(pc.roster||[]).filter(x=>!x.isPlayer);return arr.length?arr.reduce((a,x)=>a+(p.relations[x.name]||50),0)/arr.length:50}
function runRichLeagueMatch(){prepareRuptureEmergencyLineup();const difficultyPressure=.025+Math.max(0,(state.player.proCareer?.careerStats?.seriesW||0)-(state.player.proCareer?.careerStats?.seriesL||0))*.002+ruptureMatchPenalty()+Number(state.player.proCareer?.emergencyLineupPenalty||0);
 const p=state.player,pc=p.proCareer,sn=pc.season;if(!sn||pc.stage!=="starter")return;
 preparePlayoffs();
 sn.teams=Array.isArray(sn.teams)?sn.teams:[];
 let me=sn.teams.find(x=>x.name===pc.team);
 if(!me){me={name:pc.team,w:0,l:0,gw:0,gl:0};sn.teams.push(me)}
 const scheduled=currentScheduledProMatch();
 const lockedOpp=pc.lockedMatchOpponent||scheduled?.opp;
 let opp=lockedOpp?(sn.teams.find(x=>x.name===lockedOpp)||{name:lockedOpp,w:0,l:0,gw:0,gl:0}):currentProOpponent();
 if(opp&&!sn.teams.includes(opp)&&!sn.teams.some(x=>x.name===opp.name))sn.teams.push(opp);
 pc.lockedMatchOpponent=null;
 if(!opp){modal(`<h2>⚠️ 賽程修復</h2><p>找不到本場對手資料，已保留賽程，請重新進入比賽。</p>${closeBtn()}`);save();return}
 const chem=teamChemistry(),inj=p.condition.injury?-.07:0;const lifeAdj=clamp((p.energy-60)*.0015+(p.mood-60)*.0012-(p.stress-35)*.0015,-.16,.12),metaAdj=playerMetaFit()*.004;
 const major=["MSI","世界賽"].includes(proAnnualPhase()),majorAdj=major?majorEventExperienceFactor()+playerMetaFit()*.018-(p.stress-50)*.002:0;
 const need=sn.phase==="季後賽"?3:2;let my=0,his=0,logs=[],games=0;
 while(my<need&&his<need){games++;if(games>1){const coach=ensureCoachProfile(),behind=my<his,adjustRoll=(coach?.skills?.adjust||65)+rand(-18,18);if(behind&&adjustRoll>=72){const before=pc.tactics.selected,next=coachChooseTactic(`GAME ${games} 局間調整`);if(next!==before)logs.push(`🧑‍🏫 GAME ${games} 前｜教練臨場調整：${TACTIC_DEFS[before].name} → ${TACTIC_DEFS[next].name}`)}else logs.push(`🧑‍🏫 GAME ${games} 前｜教練決定維持 ${TACTIC_DEFS[pc.tactics.selected].name}`)}const liveTacticAdj=tacticMatchAdjustment(),wc=clamp((.50+(avg()-68)*.012+(p.condition.form-60)*.003+(chem-50)*.002+inj+lifeAdj+metaAdj+majorAdj+liveTacticAdj)-.105-difficultyPressure,.10,.66),win=Math.random()<wc;if(win)my++;else his++;logs.push(...richGameEvents(games,opp,win))}
 if(sn.phase==="例行賽"){const sched=currentScheduledProMatch();if(sched)sched.played=true;me.w+=my>his?1:0;me.l+=my>his?0:1;me.gw+=my;me.gl+=his;opp.w+=my>his?0:1;opp.l+=my>his?1:0;opp.gw+=his;opp.gl+=my;sn.myMatches++;sn.matchesPlayed++;simulateOtherLeagueRound(me,opp);if(sn.myMatches>=22){preparePlayoffs();if(sn.phase==="季後賽")schedulePlayoffMatch();}}
 else if(sn.phase==="季後賽"){if(sn.playoffSchedule){sn.playoffSchedule.played=true;sn.playoffOpponents=sn.playoffOpponents||[];if(sn.playoffSchedule.opp&&!sn.playoffOpponents.includes(sn.playoffSchedule.opp))sn.playoffOpponents.push(sn.playoffSchedule.opp)}sn.matchesPlayed++;if(my>his){sn.playoffRound++;if(sn.playoffRound>=3){sn.phase="世界賽資格";sn.champion=pc.team;sn.playoffSchedule=null;recordDomesticChampion1979(sn.seasonName||"聯賽",pc.team,state.date.year);state.news.unshift(`🏆 ${pc.team} 奪下聯賽冠軍，取得世界賽資格！`)}else{state.news.unshift(`🏆 ${pc.team} 贏下${playoffRoundLabel(sn.playoffRound-1)}，晉級${playoffRoundLabel(sn.playoffRound)}。`);schedulePlayoffMatch()}}else{sn.phase="賽季結束";sn.playoffSchedule=null;state.news.unshift(`${pc.team} 在季後賽遭淘汰，本季旅程結束。`)}}
 const cs=rand(245,360),k=rand(my>his?4:1,my>his?10:6),d=rand(1,6),a=rand(5,14),mvp=my>his&&Math.random()<.28;
 pc.careerStats.matches++;pc.careerStats.seriesW+=my>his?1:0;pc.careerStats.seriesL+=my>his?0:1;pc.careerStats.gameW+=my;pc.careerStats.gameL+=his;pc.careerStats.kills+=k;pc.careerStats.deaths+=d;pc.careerStats.assists+=a;pc.careerStats.mvp+=mvp?1:0;
 pc.matchHistory.unshift({team:pc.team,opp:opp.name,score:`${my}:${his}`,win:my>his,k,d,a,cs,mvp,week:state.date.week});
 changeCompetitiveForm(my>his?(mvp?6:4):-2,my>his?(mvp?"正式比賽勝利＋MVP":"正式比賽勝利"):"正式比賽失利");p.condition.fatigue=clamp(p.condition.fatigue+12,0,100);
 state.news.unshift(`職業聯賽：${pc.team} ${my}:${his} ${opp.name}；${p.name} ${k}/${d}/${a}${mvp?"，獲選MVP":""}。`);
 pc.lastMatch={team:pc.team,opp:opp.name,win:my>his,score:`${my}:${his}`,logs:[...logs],k,d,a,cs,mvp,year:state.date.year,week:state.date.week,day:state.date.day,phase:sn.phase||"正式比賽",tactic:pc.tactics?.selected||"midjungle",postInterviewDone:false};
 pc.pendingPostInterview=true;
 updateTeamRelationsAfterMatch(my>his);updateProfessionalReputation(my>his,mvp);awardMatchPopularity(my>his,mvp,sn.phase==="季後賽"?`${sn.seasonName}季後賽`:"職業聯賽");
 state.logs.push(`🏆 正式賽事：${pc.team} ${my}:${his} ${opp.name}｜系列賽${my>his?"勝":"負"}｜累計 ${me.w}勝${me.l}敗。`);
 save();render();showMatchReport();
}
function simulateOtherLeagueRound(me,opp){const sn=state.player.proCareer.season;sn.teams.filter(x=>x!==me&&x!==opp).forEach((t,i,a)=>{if(i%2)return;const o=a[i+1];if(!o)return;const home=Math.random()<.5,w=home?t:o,l=home?o:t,lg=Math.random()<.45?1:0;w.w++;l.l++;w.gw+=2;w.gl+=lg;l.gw+=lg;l.gl+=2})}
function showMatchReport(){
 const m=state.player.proCareer.lastMatch;if(!m)return;
 modal(`<h2>🏆 ${m.team||state.player.proCareer.team} ${m.score} ${m.opp}</h2><div class="log">${m.logs.join("<br>")}</div><div class="notice">${state.player.name}｜KDA ${m.k}/${m.d}/${m.a}｜CS ${m.cs}${m.mvp?"｜⭐ MVP":""}</div><button id="postMedia" class="primary">🎙️ 接受賽後採訪</button>${closeBtn()}`);
 document.querySelector("#postMedia").onclick=showPostMatchMedia;
}
function recentProMatchCard(){
 if(!isProfessionalStage())return "";const pc=state.player.proCareer,m=pc.lastMatch,cs=pc.careerStats||{},champions=internationalChampionRecentLines();
 if(!m)return `<section class="card"><h2>📋 最近記錄</h2><div class="small">目前尚無正式比賽紀錄。</div>${champions.length?`<div class="notice">${champions.join("<br>")}</div>`:""}</section>`;
 return `<section class="card"><div class="row space"><h2>📋 最近記錄</h2><span class="badge">${m.win?"勝利":"敗北"}</span></div>
 <div class="notice"><strong>${m.team||pc.team} ${m.score} ${m.opp}</strong><br>${m.phase||"正式比賽"}｜KDA ${m.k}/${m.d}/${m.a}｜CS ${m.cs}${m.mvp?"｜⭐ MVP":""}</div>
 ${champions.length?`<div class="notice"><strong>國際賽冠軍</strong><br>${champions.join("<br>")}</div>`:""}
 <div class="stat-grid">${stat("生涯系列賽",`${cs.seriesW||0}勝${cs.seriesL||0}敗`)}${stat("生涯小局",`${cs.gameW||0}勝${cs.gameL||0}敗`)}${stat("正式場次",cs.matches||0)}${stat("MVP",cs.mvp||0)}</div>
 <div class="reply-grid"><button id="viewLastMatchReport" class="reply">查看完整戰報</button><button id="viewMatchReview" class="reply">🧠 比賽復盤</button>${pc.pendingPostInterview&&!m.postInterviewDone?`<button id="resumePostInterview" class="reply">🎙️ 完成賽後採訪</button>`:""}</div></section>`;
}
function showPostMatchMedia(){
 const m=state.player.proCareer.lastMatch;
 modal(`<h2>🎙️ 賽後媒體</h2><p>${m.win?"記者：「今天贏下比賽，你最想把功勞給誰？」":"記者：「今天輸掉比賽，你認為最大的問題在哪裡？」"}</p><div class="reply-grid"><button class="reply post-media" data-a="team">我們一起承擔／功勞屬於團隊</button><button class="reply post-media" data-a="self">我會為自己的表現負責</button><button class="reply post-media" data-a="blame">隊友的決策確實有問題</button><button class="reply post-media" data-a="team">輸贏都由五個人一起承擔</button><button class="reply post-media" data-a="self">我會先檢討自己的細節</button></div>`);
 document.querySelectorAll(".post-media").forEach(b=>b.onclick=()=>applyPostMedia(b.dataset.a));
}
function applyPostMedia(a){
 const p=state.player,pc=p.proCareer,m=pc.lastMatch;
 if(a==="team"){mediaTrait("護隊友",2);(pc.roster||[]).filter(x=>!x.isPlayer).forEach(x=>p.relations[x.name]=clamp((p.relations[x.name]||50)+2,0,100));p.adultLife.careerReputation=clamp(p.adultLife.careerReputation+2,0,100)}
 if(a==="self"){p.stats.心態=clamp(p.stats.心態+.15,0,100);p.followers+=rand(10,35)}
 if(a==="blame"){mediaTrait("甩鍋",3);(pc.roster||[]).filter(x=>!x.isPlayer).forEach(x=>p.relations[x.name]=clamp((p.relations[x.name]||50)-rand(2,5),0,100));p.followers+=rand(20,60);p.adultLife.careerReputation=clamp(p.adultLife.careerReputation-3,0,100);state.news.unshift(`賽後話題：夜鋒在採訪中直指隊友決策問題，更衣室氣氛受到關注。`)}
 const rival=ensureOpponentRelationship(m.opp,false),rv=pc.rivals[rival];if(m.win&&Math.random()<.35){p.relations[rival]=clamp((p.relations[rival]||45)+(a==="team"?4:-1),0,100);rv.status=p.relations[rival]>=60?"友好對手":rv.status}else if(!m.win&&pc.pendingMedia==="trash"){rv.score+=15;rv.status=rv.score>=35?"宿敵":"競爭對手";p.relations[rival]=clamp((p.relations[rival]||40)-5,0,100)}
 pc.pendingMedia=null;pc.pendingPostInterview=false;if(m)m.postInterviewDone=true;save();document.querySelector(".modal-backdrop")?.remove();render();
}

function isTransferWindow(){
 const m=careerMonthFromWeek(state.date.week);
 return m===1||m===7;
}
function ensureTransferMarket(){
 const pc=state.player.proCareer;
 pc.transferMarket=pc.transferMarket||{year:state.date.year,window:null,listings:[],history:[],teamFinancePressure:{}};
 const tm=pc.transferMarket,windowKey=`${state.date.year}-${careerMonthFromWeek(state.date.week)===1?"冬季":"夏季"}`;
 if(tm.year!==state.date.year){tm.year=state.date.year}
 if(isTransferWindow()&&tm.window!==windowKey){
   tm.window=windowKey;tm.listings=[];tm.generatedWeeks=[];
   PRO_REGIONS.forEach(r=>{tm.teamFinancePressure[r]=tm.teamFinancePressure[r]||{};(GLOBAL_PRO_TEAMS[r]||[]).forEach(team=>tm.teamFinancePressure[r][team]=rand(10,85))});
   tm.teamFinancePressure[pc.region||"PCS"]=tm.teamFinancePressure[pc.region||"PCS"]||{};
   tm.teamFinancePressure[pc.region||"PCS"][pc.team]=rand(12,82);
   state.news.unshift(`🔄 ${windowKey.includes("冬季")?"冬季":"夏季"}轉會窗開啟：戰隊可掛牌出售選手，也可能把選手交易至次級聯賽；掛牌不代表一定能成交。`);
 }
 return tm;
}
function transferPlayerRating(name,rosterEntry=null){
 if(name===state.player.name)return clamp(Math.round(avg()),50,99);
 const c=state.characters?.[name],base=Number(c?.rating||rosterEntry?.rating||0);
 if(base)return clamp(Math.round(base),45,99);
 return clamp(62+stableAgeOffset(name+"rating",27),50,91);
}
function transferListingReason(name,team,rating,financePressure,rosterEntry=null){
 const p=state.player,pc=p.proCareer,c=state.characters?.[name],rel=p.relations?.[name]??50;
 const reasons=[];
 if(rating<70)reasons.push("近期成績不佳");
 if(financePressure>=68)reasons.push("戰隊財務壓力");
 if(rosterEntry?.wantsOut||rel<30)reasons.push("隊內關係／離隊意願");
 if(c?.disciplineIssue||Object.values(pc.teamRuptures||{}).some(x=>x.mate===name&&["決裂","嚴重衝突","冷戰共存"].includes(x.status)))reasons.push("紀律或隊內衝突");
 if(rosterEntry?.role&&pc.roster?.filter(x=>x.role===rosterEntry.role).length>1)reasons.push("位置競爭／戰術不適配");
 if(name===p.name){
   if((pc.coachTrust||50)<38)reasons.push("教練評價偏低");
   if((p.condition?.form||60)<48)reasons.push("近期狀態低迷");
   if((pc.releaseRisk||0)>=30||pc.forcedTransferPending)reasons.push("管理層已評估離隊");
 }
 return reasons[0]||["陣容重整","薪資結構調整","戰術適配評估"][stableAgeOffset(name+team,3)];
}
function makeTransferListing(name,team,region,role,rating,reason,isPlayer=false,source="一軍"){
 const tm=ensureTransferMarket(),exists=tm.listings.find(x=>x.name===name&&x.status==="掛牌中");
 if(exists)return exists;
 const base=Math.max(180000,Math.round((rating*rating*900+(source==="次級聯賽"?-250000:0))/10000)*10000);
 const asking=Math.max(120000,Math.round(base*(.78+Math.random()*.55)/10000)*10000);
 const x={id:`TL-${state.date.year}-${state.date.week}-${Date.now()}-${rand(10,99)}`,name,team,region,role:normalizeRole(role)||role||"中路",rating,reason,asking,status:"掛牌中",listedWeek:state.date.week,isPlayer,source,destination:null,buyer:null,buyerRegion:null,soldWeek:null};
 tm.listings.unshift(x);state.logs.push(`🏷️ ${team} 將 ${name}（${x.role}）掛牌，原因：${reason}，要價約 NT$${asking.toLocaleString()}。`);
 return x;
}
function maybeGenerateTransferListings(){
 if(!isProfessionalStage()||!isTransferWindow())return;
 const p=state.player,pc=p.proCareer,tm=ensureTransferMarket(),wk=`${state.date.year}-${state.date.week}`;
 tm.generatedWeeks=tm.generatedWeeks||[];if(tm.generatedWeeks.includes(wk))return;tm.generatedWeeks.push(wk);
 const fin=tm.teamFinancePressure?.[pc.region||"PCS"]?.[pc.team]??rand(10,80);
 // Current roster can be listed for poor form, finances, fit, conflict, or management reasons.
 (pc.roster||[]).forEach(x=>{
   const rating=transferPlayerRating(x.name,x),rel=p.relations?.[x.name]??50;
   let chance=.035+(fin>=68?.11:0)+(rating<68?.09:0)+(rel<28?.10:0)+(x.wantsOut?.16:0);
   if(x.isPlayer)chance+=(pc.coachTrust<38?.10:0)+(p.condition?.form<48?.10:0)+(pc.forcedTransferPending?.30:0)+(pc.releaseRisk||0)/500;
   if(Math.random()<clamp(chance,.02,.58)){
      const reason=transferListingReason(x.name,pc.team,rating,fin,x);
      makeTransferListing(x.name,pc.team,pc.region||"PCS",x.role,rating,reason,!!x.isPlayer,pc.stage==="academy"?"次級聯賽":"一軍");
   }
 });
 // Other clubs also list players so the market feels league-wide.
 const db=ensureGlobalProDatabase();
 PRO_REGIONS.forEach(region=>{
   (GLOBAL_PRO_TEAMS[region]||[]).forEach(team=>{
     if(team===pc.team)return;
     const roster=db[region]?.[team]||[],pressure=tm.teamFinancePressure?.[region]?.[team]??rand(10,80);
     if(!roster.length||Math.random()>.18)return;
     const cand=roster[rand(0,roster.length-1)];if(!cand||cand.retired||!cand.active)return;
     const rating=transferPlayerRating(cand.name,cand),chance=.18+(pressure>=68?.22:0)+(rating<68?.14:0);
     if(Math.random()<chance)makeTransferListing(cand.name,team,region,cand.role,rating,transferListingReason(cand.name,team,rating,pressure,cand),false,"一軍");
   });
 });
}
function transferBuyerPool(listing){
 const teams=[];
 PRO_REGIONS.forEach(region=>(GLOBAL_PRO_TEAMS[region]||[]).forEach(team=>{if(team!==listing.team)teams.push({team,region})}));
 return teams;
}
function moveDatabaseProAfterTransfer(listing,buyer,buyerRegion,toAcademy=false){
 const db=ensureGlobalProDatabase();let found=null,fromRegion=null,fromTeam=null;
 for(const r of PRO_REGIONS)for(const [team,roster] of Object.entries(db[r]||{})){const i=roster.findIndex(v=>v.name===listing.name);if(i>=0){found=roster.splice(i,1)[0];fromRegion=r;fromTeam=team;break}if(found)break}
 if(found){
   found.team=buyer;found.region=buyerRegion;found.level=toAcademy?"次級聯賽":"一軍";found.active=true;
   db[buyerRegion]=db[buyerRegion]||{};db[buyerRegion][buyer]=db[buyerRegion][buyer]||[];db[buyerRegion][buyer].push(found);
 }
 const c=state.characters?.[listing.name];if(c){c.formerTeam=fromTeam||listing.team;c.currentTeam=buyer;c.team=buyer;c.region=buyerRegion;c.identityType=toAcademy?"次級聯賽選手":"職業選手";c.desc=toAcademy?`${buyer} 次級聯賽／二隊選手。`:c.desc}
}
function applyPlayerTransferListing(listing,buyer,buyerRegion,toAcademy){
 const p=state.player,pc=p.proCareer,old=pc.team,oldRegion=pc.region||"PCS";
 archiveCurrentCoaches(old);pc.team=buyer;pc.region=buyerRegion;pc.stage=toAcademy?"academy":(listing.rating>=82?"starter":"sub");
 const salaryBase=toAcademy?rand(28000,65000):rand(75000,220000),years=rand(1,2);
 pc.contract={team:buyer,type:toAcademy?"青訓／次級聯賽":pc.stage==="starter"?"一軍":"替補",salary:salaryBase,years,start:{year:state.date.year,week:state.date.week},lengthWeeks:years*52};
 completeContract(pc.contract);pc.roster=[];pc.coaches=[];pc.season=null;pc.transferRequest=null;pc.forcedTransferPending=null;pc.releaseRisk=Math.max(0,(pc.releaseRisk||0)-25);ensureProRoster();pc.residence=currentResidenceProfile();
 state.messages.push({id:"transfer-"+Date.now(),from:`${old} 管理層`,text:toAcademy?`掛牌後與 ${buyer} 達成交易，你將加入該隊次級聯賽／二隊。`:`掛牌後與 ${buyer} 達成交易，你將轉隊，身份為${pc.stage==="starter"?"一軍先發":"替補"}。`,unread:true,resolved:true,type:"contract"});
 state.logs.push(`🔄 夜鋒由 ${old} 轉往 ${buyer}${toAcademy?" 次級聯賽／二隊":""}。`);
 if(oldRegion!==buyerRegion)state.logs.push(`✈️ 轉會跨賽區：${oldRegion} → ${buyerRegion}。`);
}
function applyNpcTransferListing(listing,buyer,buyerRegion,toAcademy){
 const pc=state.player.proCareer;
 if(listing.team===pc.team){
   const entry=(pc.roster||[]).find(x=>x.name===listing.name);
   if(entry){pc.roster=pc.roster.filter(x=>x.name!==listing.name);pc.pendingRosterVacancies=pc.pendingRosterVacancies||[];if(!pc.pendingRosterVacancies.includes(normalizeRole(entry.role)))pc.pendingRosterVacancies.push(normalizeRole(entry.role));state.logs.push(`📋 ${pc.team} 因 ${listing.name} 轉會出現 ${normalizeRole(entry.role)} 空缺，管理層必須在本次轉會窗結束前完成補強。`);}
 }
 moveDatabaseProAfterTransfer(listing,buyer,buyerRegion,toAcademy);
 const c=state.characters?.[listing.name];if(c){c.formerTeammate=c.formerTeammate||listing.team===pc.team;c.socialContact=true}updatePartnerResidenceAfterProTransfer(listing.name,buyer,buyerRegion);
}
function isTransferWindowFinalWeek(){
 if(!isTransferWindow())return false;const m=careerMonthFromWeek(state.date.week),next=careerMonthFromWeek(Math.min(52,state.date.week+1));return next!==m;
}
function finalizeRosterBeforeTransferDeadline(){
 const p=state.player,pc=p.proCareer;if(!isProfessionalStage()||!pc?.team)return;
 const roles=["上路","打野","中路","ADC","輔助"],meRole=normalizeRole(p.role)==="下路"?"ADC":normalizeRole(p.role);
 const missing=roles.filter(r=>r!==meRole&&!pc.roster?.some(x=>!x.isSub&&normalizeRole(x.role)===r));
 missing.forEach(r=>signImmediateRosterReplacement(r,"轉會窗截止補強"));pc.pendingRosterVacancies=[];
 if(missing.length)state.news.unshift(`✍️ ${pc.team} 在轉會窗截止前完成 ${missing.join("、")} 補強，一軍五個位置已補齊。`);
}
function partnerCurrentLocationByMode(c){
 if(!c?.partnerMobility)return;const m=c.partnerMobility;
 if(m.mode==="跟隨男友"){c.currentCountry=m.partnerCountry;c.currentCity=m.partnerCity;c.currentTravelReason=`陪 ${c.teammatePartnerOf} 在海外生活`;return}
 if(m.mode==="留在台灣"){c.currentCountry="台灣";c.currentCity="台北";c.currentTravelReason="留在台灣生活";return}
 // 兩邊跑：以週次穩定切換，不會每次 render 亂跳。
 const abroad=stableAgeOffset(c.name+state.date.year+"-"+state.date.week,2)===1;c.currentCountry=abroad?m.partnerCountry:"台灣";c.currentCity=abroad?m.partnerCity:"台北";c.currentTravelReason=abroad?`兩邊跑・目前陪 ${c.teammatePartnerOf}`:"兩邊跑・目前在台灣";
}
function updatePartnerResidenceAfterProTransfer(proName,buyer,buyerRegion){
 const p=state.player,pc=p.proCareer||{},entry=pc.teammatePartners?.[proName],name=entry?.name;if(!name)return;
 const c=state.characters?.[name];if(!c)return;
 // 隊友女友的原生常住地不因男友轉會被程式覆蓋；采恩固定是台灣人。
 if(name==="采恩"){c.nationality="台灣";c.homeCountry="台灣";c.homeCity="台北"}
 const dest=TEAM_RESIDENCE[buyer]||REGION_DEFAULT_RESIDENCE[buyerRegion]||{country:"台灣",city:"台北"};
 const underground=(p.romance?.partners||[]).includes(name),modes=underground?["跟隨男友","留在台灣","兩邊跑"]:["跟隨男友","留在台灣","兩邊跑"];
 const mode=modes[stableAgeOffset(name+proName+buyer+state.date.year,modes.length)];
 c.partnerMobility={mode,partnerTeam:buyer,partnerCountry:dest.country,partnerCity:dest.city,sinceYear:state.date.year,sinceWeek:state.date.week};
 partnerCurrentLocationByMode(c);state.logs.push(`✈️ ${proName} 轉往 ${buyer} 後，${name} 決定「${mode}」。她的常住地仍記錄為台灣・台北，目前所在地會依生活安排變化。`);
}
function resolveTransferListings(){
 if(!isProfessionalStage())return;const tm=ensureTransferMarket();
 (tm.listings||[]).filter(x=>x.status==="掛牌中").forEach(x=>{
   const age=state.characters?.[x.name]?.age||22,priceFactor=clamp(1-(x.asking-1500000)/7000000,.18,1.15);
   const demand=clamp(.12+(x.rating-65)*.018+(age<=24?.08:0)+(x.reason==="戰隊財務壓力"?.03:0),.05,.78)*priceFactor;
   // A listing can stay unsold for several weeks.
   if(Math.random()>demand)return;
   const pool=transferBuyerPool(x);if(!pool.length)return;
   const b=pool[rand(0,pool.length-1)];
   const academyChance=clamp(.10+(72-x.rating)*.025+(age<20?.08:0),.06,.46),toAcademy=Math.random()<academyChance;
   x.status="已成交";x.buyer=b.team;x.buyerRegion=b.region;x.destination=toAcademy?"次級聯賽／二隊":"一軍";x.soldWeek=state.date.week;
   if(x.isPlayer)applyPlayerTransferListing(x,b.team,b.region,toAcademy);else applyNpcTransferListing(x,b.team,b.region,toAcademy);
   tm.history.unshift({...x});
   state.news.unshift(`🔄 轉會成交：${x.name}｜${x.team} → ${b.team}${toAcademy?" 次級聯賽／二隊":""}。`);
 });
 // At the end of the window, unsold listings remain with their club.
 const m=careerMonthFromWeek(state.date.week),nextMonth=careerMonthFromWeek(Math.min(52,state.date.week+1));
 if((m===1&&nextMonth!==1)||(m===7&&nextMonth!==7)){
   (tm.listings||[]).filter(x=>x.status==="掛牌中").forEach(x=>{x.status="未售出";tm.history.unshift({...x});state.logs.push(`🏷️ ${x.name} 轉會窗未找到買家，暫時留在 ${x.team}。`)});
 }
}
function transferMarketTick(){
 if(!isTransferWindow())return;
 ensureTransferMarket();maybeGenerateTransferListings();resolveTransferListings();if(isTransferWindowFinalWeek())finalizeRosterBeforeTransferDeadline();
}
function transferMarketCard(){
 if(!isProfessionalStage())return "";const tm=ensureTransferMarket(),active=isTransferWindow();
 const live=(tm.listings||[]).filter(x=>x.status==="掛牌中").slice(0,6),recent=(tm.history||[])[0]||null;
 if(!active&&!live.length&&!recent)return "";
 const row=x=>`<strong>${x.name}</strong>｜${x.team}｜${x.role}｜評價 ${Math.round(Number(x.rating)||0)}<br>要價 NT$${Number(x.asking||0).toLocaleString()}｜${x.reason||"陣容調整"}`;
 return `<section class="card"><h2>🏷️ 轉會市場｜${tm.window||"最近動態"}</h2><div class="small">主畫面只保留目前有效掛牌與最近一筆結果；已成交／未售出的舊紀錄不再全部堆在這裡。</div>${live.length?`<div class="log"><strong>目前掛牌 ${live.length}人</strong><br><br>${live.map(row).join("<br><br>")}</div>`:`<div class="small">目前沒有有效掛牌選手。</div>`}${recent?`<div class="notice"><strong>🔄 最近一筆轉會結果</strong><br>${recent.name}｜${recent.team||"原戰隊"}${recent.buyer?` → ${recent.buyer}`:"｜留隊"}<br>${recent.status}${recent.destination?`｜${recent.destination}`:""}</div>`:""}</section>`;
}
function ensureContractMarket(){
 const p=state.player,pc=p.proCareer,c=pc.contract;if(!isProfessionalStage()||!c)return;
 completeContract(c);const elapsed=(state.date.year-c.start.year)*52+(state.date.week-c.start.week);if(elapsed<(c.lengthWeeks||52)||pc.contractMarketYear===state.date.year)return;
 pc.contractMarketYear=state.date.year;pc.freeAgentOffers=[];pc.stage="freeagent";
 const regions=["LCK","LPL","LEC","LCS","PCS"],worldChamp=(pc.worldChampionYear===state.date.year||pc.worldChampionYear===state.date.year-1),base=avg()+p.adultLife.careerReputation*.12+(pc.careerStats?.mvp||0)*.7+(worldChamp?18:0)+(pc.finalMvpBoostUntil>=state.date.year?14:0);
 regions.forEach(r=>{
   let chance=clamp(.12+(base-70)*.018+(r==="PCS"?.12:0)+(worldChamp?.18:0),.03,.92);
   if(Math.random()<chance){
     const teamPool=GLOBAL_PRO_TEAMS[r]||PRO_TEAMS,team=teamPool[stableAgeOffset(r+state.date.year+p.name,teamPool.length)];
     const floor=worldChamp?worldChampionSalaryFloor(r):70000,salary=Math.max(floor,Math.round((rand(90000,240000)+(REGION_STRENGTH[r]-75)*5000+(worldChamp?180000:0))/1000)*1000);
     const years=worldChamp?rand(2,3):(avg()>=85?rand(1,3):rand(1,2));pc.freeAgentOffers.push({region:r,team,salary,type:"一軍",years});
   }
 });
 state.logs.push(`📄 一年合約到期，夜鋒成為自由選手。${worldChamp?"世界冠軍身價讓市場競爭明顯升高。":""}收到 ${pc.freeAgentOffers.length} 份報價。`);
}
function freeAgentCard(){const pc=state.player.proCareer;if(pc.stage!=="freeagent")return "";return `<section class="card"><h2>🌐 自由市場</h2><p class="small">可加盟五大賽區；沒有戰隊報價也是可能結果。</p>${(pc.freeAgentOffers||[]).length?(pc.freeAgentOffers||[]).map((o,i)=>`<button class="reply fa-offer" data-i="${i}">${o.team}｜${o.region}｜${o.years||1}年約｜月薪 NT$${o.salary.toLocaleString()}</button>`).join(""):`<div class="notice badtext">目前沒有戰隊提出正式報價。</div>`}</section>`}
function acceptFreeAgentOffer(i){
 const p=state.player,pc=p.proCareer,o=pc.freeAgentOffers?.[i];if(!o)return;const old=pc.team,oldRegion=pc.region||"PCS",foreign=o.region!==oldRegion;
 archiveCurrentCoaches(old);pc.team=o.team;pc.region=o.region;pc.stage="starter";const years=o.years||1;pc.contract={team:o.team,type:"一軍",salary:o.salary,years,start:{year:state.date.year,week:state.date.week},lengthWeeks:years*52};pc.freeAgentOffers=[];completeContract(pc.contract);
 if(foreign){(pc.roster||[]).filter(x=>!x.isPlayer).forEach(x=>p.relations[x.name]=clamp((p.relations[x.name]||50)-rand(2,10),0,100));const lost=rand(2,8);p.followers=Math.max(0,p.followers-Math.round(p.followers*lost/100));ensurePublicImage().haters+=rand(4,15);state.logs.push(`✈️ 從 ${old} 轉戰 ${o.region}，部分前隊友與原隊粉絲不滿，黑粉增加。`)}
 pc.roster=[];pc.coaches=[];ensureProRoster();pc.season=null;pc.residence=currentResidenceProfile();state.logs.push(`✍️ 與 ${o.team} 簽下 ${years} 年合約。`);save();render();
}
function worldChampionSalaryFloor(region){
 return ({LCK:650000,LPL:620000,LEC:560000,LCS:560000,PCS:480000})[region||"PCS"]||500000;
}
function applyWorldChampionContractBoost(){
 const p=state.player,pc=p.proCareer,c=pc.contract;if(!c)return;
 const floor=worldChampionSalaryFloor(pc.region),old=Number(c.salary||0);
 if(old<floor){
   c.salary=floor;
   c.buyout=Math.max(Number(c.buyout||0),Math.round(floor*8));
   pc.marketValue=Math.max(Number(pc.marketValue||0),Math.round(floor*12));
   state.logs.push(`🏆 世界冠軍身價校正：月薪由 NT$${old.toLocaleString()} 調整至 NT$${floor.toLocaleString()}，並同步提高違約金與市場身價。`);
 }
 pc.worldChampionYear=state.date.year;
}function contractDemandPositionLabel(role){return ({TOP:"上路",JUNGLE:"打野",MID:"中路",ADC:"下路",SUPPORT:"輔助"})[role]||role}
function chooseContractReinforcementPosition(onPick){const roles=[["TOP","上路"],["JUNGLE","打野"],["MID","中路"],["ADC","下路"],["SUPPORT","輔助"]];modal(`<h2>🎯 指定補強位置</h2><p class="small">選擇希望戰隊優先補強的位置。戰隊接受此條件後，會把該位置列為轉會期優先目標，但不保證一定簽到指定選手。</p><div class="reply-grid">${roles.map(([v,l])=>`<button class="reply reinforce-position" data-v="${v}">${l}</button>`).join("")}</div>${closeBtn()}`);document.querySelectorAll('.reinforce-position').forEach(b=>b.onclick=()=>onPick(b.dataset.v))}
function contractDemandTalk(){const p=state.player,pc=p.proCareer,c=pc.contract;if(!c)return;const opts=["保證先發","公平競爭先發","補強指定位置","重大轉會先溝通","不過度干涉合法私生活","允許個人直播","允許個人商業代言","解約條款"];modal(`<h2>📝 合約附加要求</h2><p class="small">要求越多越可能讓談判失敗；世界冠軍、實力與人氣會提高話語權。</p><div class="reply-grid">${opts.map(x=>`<button class="reply contract-demand" data-v="${x}">${x}</button>`).join("")}</div>${closeBtn()}`);document.querySelectorAll('.contract-demand').forEach(b=>b.onclick=()=>{const raw=b.dataset.v;if(raw==="補強指定位置"){document.querySelector('.modal-backdrop')?.remove();chooseContractReinforcementPosition(role=>resolveCurrentContractDemand(`補強指定位置：${contractDemandPositionLabel(role)}`,role));return}resolveCurrentContractDemand(raw,null)})}
function resolveCurrentContractDemand(d,role){const p=state.player,pc=p.proCareer,c=pc.contract;if(!c)return;c.demands=c.demands||[];if(c.demands.includes(d)){document.querySelector('.modal-backdrop')?.remove();render();return}const leverage=avg()+(p.followers||0)/100000+(pc.worldChampionYear?12:0),chance=clamp(.62+(leverage-75)*.012-c.demands.length*.10,.18,.92);if(Math.random()<chance){c.demands.push(d);if(role){c.reinforcementDemand={role,label:contractDemandPositionLabel(role),accepted:true,year:state.date.year,week:state.date.week};pc.recruitPriority=pc.recruitPriority||{};pc.recruitPriority[role]=Math.max(pc.recruitPriority[role]||0,3)}state.logs.push(`📝 戰隊接受合約要求：「${d}」。`)}else state.logs.push(`⛔ 戰隊拒絕合約要求：「${d}」，談判氣氛轉差。`);save();document.querySelector('.modal-backdrop')?.remove();render()}
function contractCenter(){
 const p=state.player,pc=p.proCareer,c=pc.contract||{};if(!isProfessionalStage())return "";
 completeContract(c);const elapsed=(state.date.year-(c.start?.year||state.date.year))*52+(state.date.week-(c.start?.week||state.date.week)),remainWeeks=Math.max(0,(c.lengthWeeks||52)-elapsed),remainYears=Math.ceil(remainWeeks/52);return `<section class="card"><h2>📄 合約／轉會</h2><div class="stat-grid">${stat("月薪",`NT$${Number(c.salary||0).toLocaleString()}`)}${stat("合約",`${c.years||1}年｜剩約${remainYears}年`)}${stat("身份",pc.stage==="starter"?"一軍":pc.stage==="sub"?"替補":"青訓")}${stat("違約金",`NT$${c.buyout.toLocaleString()}`)}${stat("更衣室",Math.round(pc.lockerRoom||65))}</div><div class="notice">${contractDetails(c)}</div><div class="reply-grid"><button id="askRaise" class="reply">💰 要求加薪</button><button id="offerCut" class="reply">🤝 降薪留隊</button><button id="requestTransfer" class="reply">🔄 要求轉會</button><button id="earlyRenewal" class="reply">📝 洽談提前續約</button><button id="suggestRecruit" class="reply">🧲 球探／挖角人才</button><button id="contractDemands" class="reply">📝 提出合約附加要求</button>${p.prCrisis?`<button id="prAction" class="reply">🚨 處理公關危機</button>`:""}</div></section>`;
}
function earlyRenewalTalk(){
 const p=state.player,pc=p.proCareer,c=pc.contract;if(!c)return;completeContract(c);
 const elapsed=(state.date.year-c.start.year)*52+(state.date.week-c.start.week),remaining=(c.lengthWeeks||52)-elapsed;if(remaining<=0)return;
 const leverage=avg()+p.adultLife.careerReputation*.10+(pc.worldChampionYear>=state.date.year-1?14:0)+(pc.careerStats?.mvp||0)*.8,teamInterest=clamp(.18+(leverage-70)*.02+(remaining<=52?.15:0),.08,.92);
 if(Math.random()>teamInterest){state.logs.push(`📝 ${pc.team} 暫時不願提前續約，還想觀察後續表現。`);save();render();return}
 const years=leverage>=90?3:leverage>=80?rand(2,3):rand(1,2),raise=leverage>=88?1.30:leverage>=78?1.18:1.10,newSalary=Math.round(c.salary*raise/1000)*1000;
 pc.pendingRenewalOffer={years,salary:newSalary};modal(`<h2>📝 提前續約報價</h2><p>${pc.team} 願意提前續約。</p><div class="notice">${years}年約｜月薪 NT$${newSalary.toLocaleString()}</div><div class="reply-grid"><button id="acceptEarlyRenewal" class="primary">接受續約</button><button id="declineEarlyRenewal" class="reply">暫不續約</button></div>`);
 document.querySelector("#acceptEarlyRenewal")?.addEventListener("click",()=>{const o=pc.pendingRenewalOffer;c.years=o.years;c.lengthWeeks=o.years*52;c.salary=o.salary;c.start={year:state.date.year,week:state.date.week};c.complete=false;completeContract(c);pc.pendingRenewalOffer=null;state.logs.push(`✍️ 與 ${pc.team} 提前續約 ${o.years} 年，月薪 NT$${o.salary.toLocaleString()}。`);save();document.querySelector(".modal-backdrop")?.remove();render()});
 document.querySelector("#declineEarlyRenewal")?.addEventListener("click",()=>{pc.pendingRenewalOffer=null;state.logs.push("📝 你暫時拒絕提前續約。");save();document.querySelector(".modal-backdrop")?.remove();render()});
}
function maybeTeamEarlyRenewalOffer(){
 const p=state.player,pc=p.proCareer,c=pc.contract;if(!isProfessionalStage()||!c||pc.pendingRenewalOffer||Math.random()>.018)return;completeContract(c);
 const elapsed=(state.date.year-c.start.year)*52+(state.date.week-c.start.week),remaining=(c.lengthWeeks||52)-elapsed,leverage=avg()+p.adultLife.careerReputation*.10+(pc.worldChampionYear>=state.date.year-1?15:0);
 if(remaining>78||remaining<8||leverage<82)return;const years=leverage>=92?3:rand(2,3),salary=Math.round(c.salary*(leverage>=90?1.28:1.16)/1000)*1000;
 pc.pendingRenewalOffer={years,salary,unsolicited:true};state.messages.push({id:"renew-"+Date.now(),from:`${pc.team} 管理層`,text:`我們不想讓你進入自由市場，想提前談 ${years} 年續約，月薪 NT$${salary.toLocaleString()}。`,unread:true,resolved:true,type:"contract"});state.logs.push(`📝 ${pc.team} 主動提出提前續約。`);
}
function negotiateContract(kind){
 const p=state.player,pc=p.proCareer,c=pc.contract||{},cs=pc.careerStats||{},now=(state.date.year||2026)*52+(state.date.week||1);
 pc.negotiation=pc.negotiation||{};
 if(kind==="raise"){
  const last=pc.negotiation.raiseWeek||0;if(now-last<12){state.logs.push(`💬 薪資談判有冷卻期，管理層要求至少再等 ${12-(now-last)} 週。`);save();render();return}
  pc.negotiation.raiseWeek=now;
  const want=Math.round((c.salary||50000)*1.25/1000)*1000;const cf=ensureCareer20().clubFinance,annualExtra=(want-c.salary)*12;if(cf.cash<annualExtra*1.5){state.logs.push(`⛔ 加薪要求遭財務否決：俱樂部現金與預算不足，無法安全承擔新增年薪 NT$${annualExtra.toLocaleString()}。`);pc.managementRelation=clamp((pc.managementRelation||70)-1,0,100);save();render();return}
  const chance=clamp(.18+(avg()-65)*.012+(pc.coachTrust-50)*.004+(p.adultLife.careerReputation-50)*.002+Math.min(.18,(cs.mvp||0)*.025),.08,.78);
  const roll=Math.random();
  if(roll<chance){c.salary=want;state.logs.push(`💰 加薪談判成功（成功率約 ${Math.round(chance*100)}%），${pc.team} 同意月薪調整為 NT$${want.toLocaleString()}。`)}
  else if(roll<chance+.22){const counter=Math.round((c.salary||50000)*1.08/1000)*1000;c.salary=counter;state.logs.push(`🤝 戰隊拒絕25%加薪，但願意折衷調薪至 NT$${counter.toLocaleString()}。`)}
  else state.logs.push(`⛔ 加薪談判失敗（成功率約 ${Math.round(chance*100)}%）。管理層認為目前表現不足以支持調薪。`);
 }
 if(kind==="cut"){
  const salary=Math.max(20000,Math.round((c.salary||50000)*.85/1000)*1000),accept=Math.random()<.90;
  if(accept){c.salary=salary;pc.coachTrust=clamp(pc.coachTrust+5,0,100);state.logs.push(`🤝 戰隊接受你降薪至 NT$${salary.toLocaleString()} 的提議，留隊意願提高。`)}
  else state.logs.push(`💬 戰隊表示問題不在薪資，目前仍無法承諾留隊。`);
 }
 if(kind==="transfer"){
  const last=pc.negotiation.transferWeek||0;if(now-last<3){state.logs.push(`💬 管理層剛處理過你的轉會要求，至少再等 ${3-(now-last)} 週才能重新提出。`);save();render();return}
  pc.negotiation.transferWeek=now;
  const chance=clamp(.22+(100-pc.coachTrust)*.003+(cs.matches>8?.08:0)+(p.adultLife.careerReputation<40?.06:0),.15,.62),roll=Math.random();
  if(roll<chance){pc.transferRequest={status:"同意尋找買家",week:state.date.week};state.logs.push(`🔄 轉會申請獲准（成功率約 ${Math.round(chance*100)}%）。戰隊同意聽取其他隊伍報價。`);if(pc.poachOffer&&!['拒絕','失敗'].includes(pc.poachOffer.status)){pc.poachOffer.status='有興趣';advancePoachTransfer()}}
  else{pc.transferRequest={status:"暫時拒絕",week:state.date.week};pc.coachTrust=clamp(pc.coachTrust-rand(1,4),0,100);state.logs.push(`⛔ 轉會申請遭拒（成功率約 ${Math.round(chance*100)}%）。戰隊目前不願放人。`)}
 }
 save();render();
}
function maybeTeammateConflict(){
 const p=state.player,pc=p.proCareer;if(!isProfessionalStage()||Math.random()>.08)return;const mates=(pc.roster||[]).filter(x=>!x.isPlayer);if(!mates.length)return;const x=mates[rand(0,mates.length-1)],rel=p.relations[x.name]||50;if(rel<35){state.logs.push(`⚠️ 更衣室：你與 ${x.name} 的關係持續惡化，管理層開始擔心有人會要求離隊。`);if(rel<22&&Math.random()<.25){x.wantsOut=true;state.news.unshift(`${pc.team} 內部傳出陣容不合消息，${x.name}可能考慮離隊。`)}}else if(rel>75){state.logs.push(`🤝 ${x.name}與你在團練中配合出色，隊伍默契提升。`)}}
const PRO_TEAMS=["KNG Esports","Nova Gaming","Titan Core","Astra Five","Vortex","Eclipse","Phoenix","Orion","Tempest","Mirage","Vertex","Radiant"];
function ensureCompetitiveForm(){
 const p=state.player;p.condition=p.condition||{};
 if(!Number.isFinite(p.condition.form))p.condition.form=65;
 p.condition.form=clamp(p.condition.form,0,100);
 p.condition.formHistory=Array.isArray(p.condition.formHistory)?p.condition.formHistory:[];
 return p.condition;
}
function changeCompetitiveForm(delta,reason){
 const p=state.player,c=ensureCompetitiveForm(),before=c.form;
 c.form=clamp(c.form+delta,0,100);const actual=+(c.form-before).toFixed(1);
 if(actual!==0){c.formHistory.unshift({year:state.date.year,week:state.date.week,day:state.date.day,delta:actual,reason});c.formHistory=c.formHistory.slice(0,20);state.logs.push(`🔥 競技狀態 ${actual>0?"+":""}${actual.toFixed(1)}：${reason}。`)}
 return actual;
}
function repairCompetitiveFormV1928(){
 const p=state.player,c=ensureCompetitiveForm();if(p.v1928FormRepaired)return;
 const cs=p.proCareer?.careerStats||{},recent=p.proCareer?.lastMatch;
 let baseline=58+(avg()-70)*.22+(p.energy-60)*.08+(p.mood-60)*.07-(p.stress-40)*.08;
 if(recent?.win)baseline+=4;if(recent?.mvp)baseline+=3;if((cs.seriesW||0)>(cs.seriesL||0))baseline+=3;if(p.condition?.injury)baseline-=7;
 const repaired=clamp(Math.round(baseline),48,82);
 if(c.form<55&&repaired>c.form){const before=c.form;c.form=repaired;c.formHistory.unshift({year:state.date.year,week:state.date.week,day:state.date.day,delta:+(repaired-before).toFixed(1),reason:"V1.9.2.8 舊版低迷狀態重新校正"});state.logs.push(`🛠️ V1.9.2.8：競技狀態由 ${Math.round(before)} 校正為 ${Math.round(repaired)}。`)}
 p.v1928FormRepaired=true;
}
function competitiveFormCard(){
 if(!isProfessionalStage())return "";const c=ensureCompetitiveForm(),h=(c.formHistory||[]).slice(0,7);
 return `<section class="card"><div class="row space"><h2>🔥 競技狀態</h2><span class="badge">${Math.round(c.form)}/100｜${formLabel()}</span></div><div class="small">正式比賽、Scrim與訓練是主要來源；Rank只提供小幅影響。正常約會、吃飯、團建不會無故降低狀態。</div>${h.length?`<div class="log">${h.map(x=>`${x.delta>0?"+":""}${x.delta}｜${x.reason}`).join("<br>")}</div>`:"<div class=small>尚無近期狀態變化。</div>"}</section>`;
}
function formLabel(){const v=state.player.condition?.form||65;return v>=85?"🔥 火熱":v>=70?"良好":v>=55?"普通":v>=40?"低迷":"極差"}
function proCareerTick(){
 const p=state.player,pc=p.proCareer;if(p.adultLife?.graduationPath!=="職業圈"||["starter","academy","sub"].includes(pc.stage))return;
 pc.stage=pc.stage==="amateur"?"scouting":pc.stage;
 if(pc.stage==="scouting"&&Math.random()<.16+Math.min(.18,p.proAttention/300)){const team=PRO_TEAMS[rand(0,PRO_TEAMS.length-1)];pc.stage="contact";state.messages.push({id:"scout-"+Date.now(),from:`${team} 星探`,text:`我們觀察你一段時間了，想邀請你參加 ${team} 的試訓。`,unread:true,resolved:true,type:"normal"});state.logs.push(`🔎 ${team} 星探主動接觸你，提出試訓邀請。`);pc.tryout={team,status:"待試訓"}}
}

function fiveRegionTeamDirectoryCard(){
 const pc=state.player.proCareer;if(!isProfessionalStage())return "";
 return `<section class="card"><h2>🌏 五大賽區戰隊</h2><div class="small">共60支固定戰隊，名稱不重複。你目前：<b>${pc.team||"—"}</b>｜${fixedTeamRegion(pc.team)||pc.region||"未知"}</div>${PRO_REGIONS.map(r=>`<details ${r===(fixedTeamRegion(pc.team)||pc.region)?"open":""}><summary><b>${r}</b>｜12隊</summary><div class="small">${regionTeams(r).map((t,i)=>`${i+1}. ${t}${t===pc.team?" ← 目前戰隊":""}`).join("<br>")}</div></details>`).join("")}</section>`;
}
function proCareerCard(){
 const p=state.player,pc=p.proCareer;if(p.adultLife?.graduationPath!=="職業圈")return "";
 if(pc.stage==="contact"&&pc.tryout)return `<section class="card"><h2>🔎 職業試訓</h2><p>${pc.tryout.team} 邀請你參加試訓。</p><button id="doTryout" class="primary">參加試訓</button></section>`;
 if(pc.stage==="offer"&&pc.contract)return `<section class="card"><h2>📄 合約報價</h2><p>${pc.contract.team}｜${pc.contract.type}｜月薪 NT$${pc.contract.salary.toLocaleString()}</p><div class="reply-grid"><button id="signProContract" class="primary">接受並簽約</button><button id="counterOffer" class="reply">💰 要求加薪25%</button><button id="declineOffer" class="reply">拒絕／等待其他隊伍</button></div></section>`;
 if(["starter","sub","academy"].includes(pc.stage)){const cs=pc.careerStats||{seriesW:0,seriesL:0,gameW:0,gameL:0,matches:0,mvp:0};return `<section class="card"><h2>🏢 ${pc.team}</h2><div class="stat-grid">${stat("身份",pc.stage==="academy"?"青訓":pc.stage==="sub"?"替補":"一軍")}${stat("競技狀態",formLabel())}${stat("教練信任",Math.round(pc.coachTrust))}${stat("職業風評",Math.round(p.adultLife.careerReputation))}${stat("人品",Math.round(p.ethics??65))}${stat("本季大場",`${cs.seriesW}勝${cs.seriesL}敗`)}${stat("MVP",cs.mvp||0)}</div>${pc.stage==="academy"?`<div class="notice">青訓選手目前沒有正式聯賽出賽資格，需透過訓練與教練評價爭取升上一軍。</div>`:leagueCard()}</section>${fiveRegionTeamDirectoryCard()}`;}
 return `<section class="card"><h2>🔎 職業圈</h2><p>星探正在根據你的Rank、能力、英雄池、比賽履歷與風評進行評估。</p></section>`;
}
function doProTryout(){const p=state.player,pc=p.proCareer,t=pc.tryout;if(!t)return;const score=avg()*.62+p.stats.溝通*.10+p.stats.英雄池*.08+p.stats.心態*.08+p.condition.form*.07+p.adultLife.careerReputation*.05+rand(-9,9),pass=score>=64;if(pass){const r=Math.random(),type=score>=76&&r>.35?"一軍":score>=70&&r>.25?"替補":"青訓";pc.stage="offer";const leverage=avg()+p.adultLife.careerReputation*.08+(type==="一軍"?8:0),years=leverage>=85?rand(2,3):leverage>=72?rand(1,3):1;pc.contract={team:t.team,type,salary:type==="一軍"?rand(65000,110000):type==="替補"?rand(42000,70000):rand(28000,45000),years,lengthWeeks:years*52};state.logs.push(`✅ 通過 ${t.team} 試訓，收到${type}合約。`)}else{pc.stage="scouting";pc.tryout=null;state.logs.push(`❌ ${t.team} 試訓未通過，回到自由選手狀態。`)}save();render()}
function counterInitialOffer(){
 const p=state.player,pc=p.proCareer,c=pc.contract;if(!c)return;const requested=Math.round(c.salary*1.25/1000)*1000,leverage=avg()+p.adultLife.careerReputation*.08+p.proAttention*.08+rand(-12,12);
 if(leverage>=70){c.salary=requested;state.logs.push(`💰 ${c.team} 接受你的反報價，新月薪 NT$${requested.toLocaleString()}。`)}
 else if(leverage>=62){c.salary=Math.round(c.salary*1.10/1000)*1000;state.logs.push(`🤝 ${c.team} 不接受25%加薪，但提出折衷月薪 NT$${c.salary.toLocaleString()}。`)}
 else{state.logs.push(`⛔ ${c.team} 拒絕加薪要求，原報價仍暫時有效。`)}
 save();render();
}
function declineInitialOffer(){const pc=state.player.proCareer,team=pc.contract?.team;pc.stage="scouting";pc.contract=null;pc.tryout=null;state.logs.push(`你拒絕了 ${team||"戰隊"} 的合約，繼續等待其他機會。`);save();render()}
function signProContract(){const p=state.player,pc=p.proCareer,c=pc.contract;if(!c)return;if(pc.team&&pc.team!==c.team)archiveCurrentCoaches(pc.team);pc.team=c.team;pc.stage=c.type==="一軍"?"starter":c.type==="替補"?"sub":"academy";pc.coachTrust=50;pc.tryout=null;if(p.team?.formed){p.teamHistory=p.teamHistory||[];p.teamHistory.push({name:p.team.name,members:[...(p.team.members||[])],status:"加盟職業隊後解散"});p.team={name:"",members:[],formed:false,trainingCount:0}}ensureProRoster();cleanupUnnamedFriends();if(pc.stage!=="academy")initProSeason();state.logs.push(`✍️ 正式加盟 ${c.team}，身份：${c.type}。原固定戰隊停止活動。`);save();render()}
function cleanupUnnamedFriends(){
 const p=state.player,keep=new Set([...(p.romance?.partners||[]),...(p.proFriends||[]),...(p.adultLife?.pregnancies||[]).map(x=>x.name),...(p.proCareer?.roster||[]).map(x=>x.name),...(p.proCareer?.coaches||[]).map(x=>x.name)]);
 Object.keys(state.characters||{}).forEach(n=>{const c=state.characters[n],generic=/^(男|女).+玩家\d+$|^女粉絲\d+$|^新朋友$|^新朋友\d+$/.test(n);if(generic&&!keep.has(n)&&!c.important){delete state.characters[n];delete p.relations[n];if(state.friends)delete state.friends[n]}})
}
function initProSeason(){const pc=state.player.proCareer;if(!pc.season){let teams=canonicalDomesticTeams().map(name=>({name,w:0,l:0,gw:0,gl:0}));pc.season={week:1,phase:"例行賽",teams,matchesPlayed:0,myMatches:0,playoffs:false,champion:null,schedule:[]}}repairDomesticLeagueTeams();pc.careerStats=pc.careerStats||{seriesW:0,seriesL:0,gameW:0,gameL:0,matches:0,mvp:0,kills:0,deaths:0,assists:0};buildProRegularSchedule()}
function leagueCard(){const pc=state.player.proCareer,sn=pc.season;if(!sn)return "";const sorted=[...sn.teams].sort((a,b)=>(b.w-a.w)||((b.gw-b.gl)-(a.gw-a.gl)));return `<div class="notice">🏆 ${sn.phase}｜你的隊伍 ${pc.team}</div><div class="log">${sorted.map((t,i)=>`${i+1}. ${t.name} ${t.w}-${t.l}｜小局 ${t.gw}-${t.gl}${i===7?" ← 季後賽線":""}`).join("<br>")}</div>`}
function playLeagueMatch(){startPreMatchMedia();}

function requestBreakup(name){
 const p=state.player,rel=p.relations[name]||0,tr=safeTraits(state.characters[name]),retaliate=Math.random()<clamp(.08+(rel>80?.08:0)+(tr.includes("心機")?.18:0)+(p.adultLife.publicRomanceKnown?.08:0),.05,.38);
 p.romance.partners=p.romance.partners.filter(x=>x!==name);p.romance.partner=p.romance.partners[0]||null;p.relations[name]=clamp(rel-rand(25,45),0,100);
 if(retaliate){p.prCrisis={type:"分手後爆料",severity:rand(2,4),source:name};state.news.unshift(`場外風波：${name}在分手後公開夜鋒部分私人爭議，引發社群討論。`)}
 state.logs.push(`💔 你與 ${name} 分手，雙方關係嚴重惡化。${retaliate?"對方隨後公開部分私事。":""}`);save();render();
}
function pregnancyTick(){
 const p=state.player;(p.adultLife?.pregnancies||[]).forEach((pg,i)=>{
  if(pg.status==="可能懷孕"&&!pg.eventQueued){pg.eventQueued=true;const confirmed=Math.random()<.72;pg.status=confirmed?"確認懷孕":"未懷孕";pg.progressWeeks=0;state.messages.push({id:"preg-"+Date.now()+rand(1,999),from:pg.name,text:confirmed?"我確認懷孕了，我們需要談談接下來怎麼辦。":"檢查結果出來了，沒有懷孕。",unread:true,resolved:true,type:"normal"});if(confirmed)state.logs.push(`⚠️ ${pg.name}確認懷孕，等待後續討論。`)}
  if(["確認懷孕","決定繼續","對方決定繼續"].includes(pg.status)){pg.progressWeeks=(pg.progressWeeks||0)+1/7;if((pg.status==="即將生產"||pg.birthPending)&&!pg.born)pg.progressWeeks=Math.max(40,Number(pg.progressWeeks)||0);
if(pg.progressWeeks>=40&&!pg.born&&!pg.birthPending){pg.progressWeeks=40;pg.birthPending=true;pg.status="即將生產";state.messages.push({id:"labor-"+Date.now()+i,from:pg.name,text:"醫院說差不多要生了。你會過來陪我嗎？",unread:true,resolved:true,type:"birth"});state.logs.push(`🏥 ${pg.name}進入生產階段，等待你決定是否陪產。`)}}
  if(pg.born&&!(p.romance?.partners||[]).includes(pg.name)){pg.singleMother=true;if((p.followers||0)>50000&&!pg.exposureChecked&&Math.random()<.015){pg.exposureChecked=true;const responsible=(pg.supportScore||0)>=3;if(!responsible){triggerPrivateLifePRCrisis(pg.name,"親子扶養爭議");state.news.unshift(`場外爭議：${pg.name}公開批評成名後的夜鋒未妥善面對過去的親子責任。`)}else state.news.unshift(`私人生活曝光：夜鋒已有孩子的消息受到關注，但長期扶養紀錄讓輿論相對平和。`)}}
 });
}
function pregnancyCard(){const p=state.player;dedupePregnancies();repairDuePregnancyProgress();const arr=(p.adultLife?.pregnancies||[]).filter(x=>x.born||["確認懷孕","決定繼續","對方決定繼續","即將生產","孩子已出生"].includes(x.status));if(!arr.length)return "";return `<section class="card"><h2>家庭／親子事件</h2>${arr.map(x=>{const ag=x.born?ensureSupportAgreement(x):null;return `<div class="schedule-item"><div><strong>${x.name}</strong><div class="small">${x.status}${x.born?`｜扶養：${x.supportChoice||"尚未決定"}${ag?.status==="已和解"?`｜🤝 已和解${ag.type==="monthly"?` 每月 NT$${Number(ag.amount||0).toLocaleString()}`:` 一次性 NT$${Number(ag.amount||0).toLocaleString()}`}`:""}`:`｜約 ${Math.floor(x.progressWeeks||0)}/40 週`}</div></div>${x.born?`<div>${!x.birthChoice?`<button class="ghost legacy-birth-choice" data-name="${x.name}" data-choice="陪產">補登：當時有陪產</button><button class="ghost legacy-birth-choice" data-name="${x.name}" data-choice="工作">補登：當時未陪產</button>`:""}${!x.supportChoice?`<button class="ghost child-choice" data-name="${x.name}" data-choice="共同撫養">共同照顧</button><button class="ghost child-choice" data-name="${x.name}" data-choice="經濟扶養">扶養費／媽媽照顧</button><button class="ghost child-choice" data-name="${x.name}" data-choice="拒絕撫養">不參與照顧</button>`:`<span class="small">已決定：${x.supportChoice}</span>`}${x.name!==p.romance?.spouse&&ag?.status!=="已和解"?`<button class="ghost support-settlement" data-name="${x.name}">🤝 協商扶養和解</button>`:""}</div>`:x.birthPending?`<button type="button" class="ghost birth-event" data-name="${x.name}" data-preg-id="${x.eventId}" onclick="resolveBirthEventById('${x.eventId}')">🏥 處理生產事件</button>`:`<button class="ghost pregnancy-talk" data-name="${x.name}">討論後續</button>`}</div>`}).join("")}</section>`}
function pregnancyDecisionByName(name){const p=state.player,x=pregnancyByName(name);if(!x)return;
 modal(`<h2>與 ${x.name} 討論</h2><p>可以討論繼續懷孕或終止妊娠。這是雙方的重大私人醫療決定，最終仍取決於懷孕者本人的意願。</p><button id="pregKeep" class="primary">希望繼續懷孕</button><button id="pregEnd" class="ghost">討論終止妊娠</button>${closeBtn()}`);
 document.querySelector("#pregKeep").onclick=()=>{x.status="決定繼續";state.logs.push(`${x.name}的懷孕事件：雙方決定繼續。`);save();document.querySelector(".modal-backdrop")?.remove();render()};
 document.querySelector("#pregEnd").onclick=()=>terminatePregnancyChoice(x);
}
function pregnancyDecision(i){
 const p=state.player,arr=(p.adultLife.pregnancies||[]).filter(y=>["確認懷孕","決定繼續","對方決定繼續"].includes(y.status)),x=arr[i];if(!x)return;
 modal(`<h2>與 ${x.name} 討論</h2><p>可以討論繼續懷孕或終止妊娠。這是雙方的重大私人醫療決定，最終仍取決於懷孕者本人的意願。</p><button id="pregKeep" class="primary">希望繼續懷孕</button><button id="pregEnd" class="ghost">討論終止妊娠</button>${closeBtn()}`);
 document.querySelector("#pregKeep").onclick=()=>{x.status="決定繼續";state.logs.push(`${x.name}的懷孕事件：雙方決定繼續。`);save();document.querySelector(".modal-backdrop")?.remove();render()};
 document.querySelector("#pregEnd").onclick=()=>terminatePregnancyChoice(x);
}
function conditionTick(){const p=state.player,c=p.condition,major=["MSI","世界賽"].includes(proAnnualPhase()),rec=internationalRecoveryMultiplier();c.fatigue=clamp(c.fatigue-4*rec+(major?1.5:0),0,100);if(major){p.energy=clamp(p.energy-1.5,0,100);p.stress=clamp(p.stress+1.2,0,100)}c.privateRecent=Math.max(0,c.privateRecent-1);if(c.injury){c.injury.days--;if(c.injury.days<=0){state.logs.push(`🩹 ${c.injury.type} 已恢復。`);pushHealthHistory(`第${state.date.week}週｜${c.injury.type}恢復完成。`);c.injury=null}}const h=p.health;if(h?.sti?.treated&&h.sti.followupDays!=null){h.sti.followupDays--;if(h.sti.followupDays<=0){pushHealthHistory(`第${state.date.week}週｜感染治療追蹤完成。`);state.logs.push("✅ 健康追蹤完成，感染已治療。");h.sti=null}}if(c.fatigue>65)c.form=clamp(c.form-2,0,100);else if(p.energy>70)c.form=clamp(c.form+1,0,100)}
function frequentEsportsNews(){if(Math.random()<.42){const a=PRO_TEAMS[rand(0,PRO_TEAMS.length-1)],b=PRO_TEAMS.filter(x=>x!==a)[rand(0,PRO_TEAMS.length-2)];state.news.unshift(`電競快訊：${a} 與 ${b} 近期訓練賽與陣容動向受到討論。`);state.news=state.news.slice(0,30)}}

function syncCompanionCurrentLocation(){
 const p=state.player,t=activePrivateTravel(),here=currentLocationProfile();
 Object.values(state.characters||{}).forEach(c=>{if(c?.travellingWithPlayer){if(t){c.currentCountry=here.country;c.currentCity=here.city;c.currentTravelReason="與夜鋒旅行中"}else{c.travellingWithPlayer=false;c.currentCountry=c.homeCountry;c.currentCity=c.homeCity;delete c.currentTravelReason}}});
 const spouse=p.romance?.spouse,c=state.characters?.[spouse];if(spouse&&c&&!c.careerLockedResidence){const home=currentResidenceProfile();c.homeCountry=home.country;c.homeCity=home.city;if(!c.currentVisit&&!c.travellingWithPlayer){c.currentCountry=home.country;c.currentCity=home.city}}
}
function socialHomeLocation(name){
 const c=state.characters?.[name];if(!c)return null;
 if(c.currentVisit?.country&&c.currentVisit?.city)return {country:c.currentVisit.country,city:c.currentVisit.city,temporary:true};
 if(c.homeCountry||c.homeCity)return {country:c.homeCountry||c.nationality||null,city:c.homeCity||null};
 const src=`${c.acquaintanceSource||""} ${c.desc||""}`;
 const countries=["台灣","日本","韓國","中國","美國","德國","法國","英國","西班牙"];
 const country=c.nationality||countries.find(x=>src.includes(x))||null;
 let city=null;
 for(const d of FREE_TRAVEL_DESTINATIONS||[])if(src.includes(d.city)){city=d.city;break}
 return country?{country,city}:null;
}
function isLocationBoundSocial(name){
 const c=state.characters?.[name];if(!c)return false;
 const story=STORY_SOCIAL_IDENTITIES?.[name];
 if(story)return false; // school/story friends are not restricted by encounter geography.
 if(confirmedProfessionalRecord(name)||c.isProStaff)return false;
 const src=`${c.acquaintanceSource||""} ${c.desc||""}`;
 return /旅行|當地|生活期間|酒吧|海外|國際賽期間|MSI|世界賽|PC Bang|城市/.test(src)||!!c.homeCountry||!!c.homeCity;
}
function npcIsVisitingPlayer(name){
 const c=state.characters?.[name],v=c?.currentVisit;if(!v)return false;
 const serial=state.date.year*364+(state.date.week-1)*7+state.date.day;
 if((v.untilSerial||0)<serial){delete c.currentVisit;return false}
 const here=currentLocationProfile();return v.country===here.country&&(!v.city||v.city===here.city);
}
function socialLocationAvailable(name){
 if(!isLocationBoundSocial(name))return true;
 if(npcIsVisitingPlayer(name))return true;
 const c=state.characters?.[name],h=socialHomeLocation(name),here=currentLocationProfile();
 // 實體見面判定必須使用「目前所在地」，常住地只作為沒有動態所在地時的 fallback。
 const loc=(c?.currentCountry||c?.currentCity)?{country:c.currentCountry||h?.country||null,city:c.currentCity||null}:h;
 if(!loc?.country)return true;
 if(loc.country!==here.country)return false;
 return !loc.city||!here.city||loc.city===here.city;
}
function socialLocationLabel(name){
 syncCompanionCurrentLocation();const c=state.characters?.[name],h=socialHomeLocation(name),here=currentLocationProfile();
 if(c?.travellingWithPlayer)return `✈️ 目前所在地：${here.country}・${here.city}｜與夜鋒旅行中｜🏠 常住地：${h?.country||"未知"}${h?.city?`・${h.city}`:""}`;
 if(npcIsVisitingPlayer(name))return `✈️ 目前所在地：${here.country}・${here.city}｜主動來找你｜🏠 常住地：${h?.country||"未知"}${h?.city?`・${h.city}`:""}`;
 if(c?.currentCountry)return `📍 目前所在地：${c.currentCountry}${c.currentCity?`・${c.currentCity}`:""}｜🏠 常住地：${h?.country||c.currentCountry}${h?.city?`・${h.city}`:""}`;
 if(!isLocationBoundSocial(name)||!h?.country)return "可正常見面";return `🏠 常住地：${h.country}${h.city?`・${h.city}`:""}`;
}
function locationRestrictedSocialAction(act){
 return ["food","cafe","movie","date","intimate","private","hangout","latefood","arcade"].includes(act);
}
function maybeNpcVisitsPlayer(){
 if(!isProfessionalStage())return;
 const p=state.player,here=currentLocationProfile(),serial=state.date.year*364+(state.date.week-1)*7+state.date.day;
 const candidates=Object.values(state.characters||{}).filter(c=>c?.known&&c.gender==="女"&&Number(c.age||18)>=18&&isLocationBoundSocial(c.name)&&!socialLocationAvailable(c.name)&&(p.relations?.[c.name]||0)>=45&&!c.currentVisit);
 if(!candidates.length||Math.random()>.055)return;
 candidates.sort((a,b)=>(p.relations[b.name]||0)-(p.relations[a.name]||0));
 const c=candidates[Math.min(candidates.length-1,rand(0,Math.min(4,candidates.length-1)))],rel=p.relations[c.name]||0;
 const chance=clamp(.20+rel*.006+((p.romance?.partners||[]).includes(c.name)?.16:0)+(p.romance?.spouse===c.name?.22:0),.28,.88);
 if(Math.random()>chance)return;
 c.currentVisit={country:here.country,city:here.city,from:{country:c.homeCountry||c.nationality||null,city:c.homeCity||null},untilSerial:serial+rand(2,5),reason:"主動來找夜鋒"};
 c.currentCountry=here.country;c.currentCity=here.city;c.currentTravelReason="主動來找夜鋒";
 state.messages.push({id:"visit-"+Date.now(),from:c.name,text:`我最近剛好有時間，已經飛到 ${here.country}・${here.city} 了。這幾天要不要見面？`,unread:true,resolved:false,type:"socialVisit",inviteLabel:"來訪見面"});
 state.logs.push(`✈️ ${c.name} 主動飛到 ${here.country}・${here.city} 找夜鋒，等待你決定是否見面。`);
}
function repairSocialHomeLocations(){
 Object.values(state.characters||{}).forEach(c=>{
   if(!c?.name||!isLocationBoundSocial(c.name))return;
   if(!c.homeCountry){
     const src=`${c.acquaintanceSource||""} ${c.desc||""}`,countries=["台灣","日本","韓國","中國","美國","德國","法國","英國","西班牙"];
     c.homeCountry=c.nationality||countries.find(x=>src.includes(x))||null;
   }
   if(!c.homeCity){
     const src=`${c.acquaintanceSource||""} ${c.desc||""}`;
     const d=(FREE_TRAVEL_DESTINATIONS||[]).find(x=>src.includes(x.city));if(d)c.homeCity=d.city;
   }
 });
}
function runSocialActionByName(name,act){
 const c=state.characters?.[name];if(!c){modal(`<h2>無法執行社交</h2><p>找不到 ${name} 的人物資料。</p>${closeBtn()}`);return}
 if(locationRestrictedSocialAction(act)&&!socialLocationAvailable(name)){
   const cLoc=state.characters?.[name],h=socialHomeLocation(name),here=currentLocationProfile(),loc=(cLoc?.currentCountry||cLoc?.currentCity)?{country:cLoc.currentCountry||h?.country||null,city:cLoc.currentCity||null}:h;
   modal(`<h2>📍 無法見面</h2><p><strong>${name}</strong> 目前不在你所在的地區。</p><div class="notice">${name}：${loc?.country||"其他地區"}${loc?.city?`・${loc.city}`:""}<br>夜鋒：${here.country}・${here.city}</div><p class="small">你需要前往對方目前所在地才能安排吃飯、電影、約會或私人相處；常住地只代表她平時的生活據點。</p>${closeBtn()}`);
   return;
 }
 if(act?.startsWith("enemy"))return enemySocialAction1982(name,act);
 if(act?.startsWith("coach"))return coachSocialActivity(name,act);
 if(act==="confess")return resolveRomance(name,"confess");
 if(act==="marriageCrisis")return openMarriageCrisisTalk(name);
 if(act==="communicate")return relationshipTalk(name);
 if(act==="spar")return sparWithPro(name);
 if(act==="intimate")return adultEstablishedPartnerEvent(name);
 if(act==="private")return attemptConsensualPrivateEvent(name,name==="許安然"?"fwb":"social");
 if(act==="breakup")return requestBreakup(name);
 return socialActivity(name,act);
}
function socialCategoryFor(name){
 const p=state.player,c=state.characters?.[name];
 if((p.romance?.marriage?.divorced||[]).some(x=>x.name===name)||c?.formerSpouse)return "女生朋友";
 if(p.romance?.spouse===name)return "老婆";
 if(isActiveEnemy19781(name))return "仇人";
 if(confirmedProfessionalRecord(name))return "職業選手";
 if((p.proCareer?.coaches||[]).some(x=>x.name===name)||c?.isProStaff)return "教練／工作人員";
 if(c?.gender==="女")return "女生朋友";
 if(c?.gender==="男")return "男生朋友";
 return "其他";
}
function chooseSocial(){
 normalizeFormerSpouseSocialState();ensureV10();if(isProfessionalStage())ensureProRoster();if(remain()<1){modal(`<h2>今天沒有剩餘時段</h2><p>社交需要 1 個時段。</p>${closeBtn()}`);return}
 const all=Object.values(state.characters||{}).filter(c=>c&&c.known&&c.name&&c.name!==state.player.name&&!isPlaceholderPersonName(c.name)&&proSocialAllowed(c));
 const order=["老婆","仇人","職業選手","教練／工作人員","女生朋友","男生朋友","其他"],groups={};all.forEach(c=>(groups[socialCategoryFor(c.name)]??=[]).push(c));
 state.ui=state.ui||{};let active=state.ui.socialCategory;if(!active||!groups[active])active=order.find(x=>groups[x]?.length)||"其他";state.ui.socialCategory=active;
 const people=(groups[active]||[]).sort((a,b)=>(state.player.relations?.[b.name]||0)-(state.player.relations?.[a.name]||0)),main=document.querySelector("#main");
 const tabs=order.filter(x=>groups[x]?.length).map(x=>`<button type="button" class="${x===active?"primary":"ghost"} social-cat" data-cat="${x}">${x} (${groups[x].length})</button>`).join("");
 main.innerHTML=`<section class="card"><div class="row space"><h2>👥 社交／閒聊</h2><button id="socialReturn" class="ghost">← 返回</button></div><div class="reply-grid">${tabs}</div></section><section class="card"><h2>${active}</h2><div class="social-page-grid">${people.map(c=>`<button type="button" class="choice social-person-page" data-person="${c.name}"><strong>找 ${c.name}</strong><span class="small">${relationTier(state.player.relations?.[c.name]||0,c.name)} · ${Math.round(state.player.relations?.[c.name]||0)} · ${Number.isFinite(c.age)?c.age+"歲 · ":""}${safeTraits(c).join("、")||"個性尚未熟悉"} · ${socialProfileMeta(c.name).identity} · ${socialProfileMeta(c.name).relationship}</span></button>`).join("")||`<div class="small">此分類目前沒有人。</div>`}</div><button id="socialFive" class="btn secondary" style="width:100%;margin-top:12px">揪朋友五排開黑</button></section>`;
 document.querySelector("#socialReturn")?.addEventListener("click",render);document.querySelector("#socialFive")?.addEventListener("click",friendFiveStack);
 document.querySelectorAll(".social-cat").forEach(b=>b.onclick=()=>{state.ui.socialCategory=b.dataset.cat;chooseSocial()});
 document.querySelectorAll(".social-person-page").forEach(b=>b.addEventListener("click",()=>openSocialPersonPage(b.dataset.person)));
}
function openSocialPersonPage(name){
 normalizeFormerSpouseSocialState();
 const c=state.characters?.[name];if(!c){chooseSocial();return}
 const rel=state.player.relations?.[name]||0,female=c.gender==="女",esports=isEsportsFriend(name),dating=(state.player.romance?.partners||[]).includes(name),pro=isProFriend(name),staff=!!c.isProStaff;
 const enemy=isActiveEnemy19781(name);let acts=enemy?[["enemyConfront","🔥 當面嗆聲"],["enemyFight","👊 爆發肢體衝突"],["enemyPublic","🎙️ 公開互嗆"],["enemyDistance","🚫 保持距離"],["enemyReconcile","🕊️ 嘗試和解"]]:staff?[["coachTactics","🧠 討論戰術"],["coachEval","📋 詢問近期評價"],["coachRole","🎯 討論先發競爭"]]:female?[["chat","📱 聊天／視訊"],["food","一起吃飯"],["cafe","咖啡廳"],["movie","看電影"],["date","正式約會"],["confess","💗 告白"]]:[["food","吃飯聊天"],["arcade","去電競館"],["hangout","逛街／閒晃"],["game","一起打遊戲"],["latefood","吃宵夜"]];
 if(!enemy&&!staff&&esports)acts.splice(1,0,["duo","Rank雙排"]);if(!staff&&dating)acts.push(["communicate","💬 感情溝通"]);if(dating&&c.publicFigure&&!c.publicRomance){c.relationshipType=c.relationshipType||"地下戀人";c.secretRomanceRisk=c.secretRomanceRisk||5}
 recoverLegacyMarriageCrisis1977();const spouse=state.player.romance?.spouse===name,isFwb=c.relationshipType==="炮友"||name==="許安然";
 const marriageCrisis=spouse?ensurePendingMarriageCrisis1978(name):null;if(marriageCrisis)acts.unshift(["marriageCrisis","💥 處理婚姻危機"]);
 if(!enemy&&!staff&&state.player.age>=18&&female&&Number(c.age||18)>=18){if(spouse)acts.push(["intimate","❤️ 夫妻親密時光"]);else if(dating)acts.push(["intimate","❤️ 親密相處"]);else acts.push(["private",isFwb?"🌙 炮友見面（NT$3,000）":"🌙 詢問私人約會"])}
 if(!enemy&&!staff&&dating)acts.push(["breakup","💔 提出分手"]);if(!staff&&pro)acts.push(["spar","⚔️ 與職業選手切磋"]);
 document.querySelector("#main").innerHTML=`<section class="card"><div class="row space"><h2>${female?"💗":"🤝"} ${name}</h2><button id="socialBack" class="ghost">← 換人</button></div><p class="small">關係值 ${Math.round(rel)}｜性別：${c.gender}｜個性：${safeTraits(c).join("、")||"尚未熟悉"}<br>身分：${socialProfileMeta(name).identity}｜認識來源：${socialProfileMeta(name).source}｜目前關係：${socialProfileMeta(name).relationship}<br>📍 ${socialLocationLabel(name)}${socialProfileMeta(name).special?`｜特殊關係：${socialProfileMeta(name).special}`:""}${pro?`｜${c.rank||"宗師"} ${c.lp||""} LP`:""}</p>${pro?`<div class="notice goodtext">⚔️ 已解鎖職業選手切磋，可直接在下方選擇。</div>`:""}<div class="social-page-grid">${acts.map(a=>`<button type="button" class="choice social-act-page" data-act="${a[0]}" ${(a[0]==="date"&&rel<75&&!dating)||(a[0]==="confess"&&(rel<75||dating))?"disabled":""}><strong>${a[1]}</strong></button>`).join("")}</div></section>`;
 document.querySelector("#socialBack")?.addEventListener("click",chooseSocial);document.querySelectorAll(".social-act-page").forEach(b=>{b.dataset.name=name;b.onclick=e=>{e.preventDefault();e.stopPropagation();runSocialActionByName(name,b.dataset.act)}});
}

function enemySocialAction1982(name,act){const p=state.player,pc=ensureCareer20(),c=state.characters?.[name];if(!c||!isActiveEnemy19781(name))return openSocialPersonPage(name);const remote=["enemyPublic","enemyDistance"].includes(act);if(!remote&&!socialLocationAvailable(name))return modal(`<h2>📍 無法當面衝突</h2><p>${name}目前不在同一地區；公開互嗆或保持距離仍可進行。</p>${closeBtn()}`);if(remain()<1)return modal(`<h2>今天沒有剩餘時段</h2><p>這項互動需要1個時段。</p>${closeBtn()}`);if(!consume("仇敵互動",1))return;let text="";const e=pc.legacy.enemies[name]||(pc.legacy.enemies[name]={name,hostility:75});e.hostility=Number(e.hostility||75);if(act==="enemyConfront"){e.hostility=clamp(e.hostility+rand(3,8),0,100);p.stress=clamp(p.stress+rand(3,7),0,100);text=`你與 ${name} 正面嗆聲，雙方敵意進一步升高。`}else if(act==="enemyFight"){const injury=Math.random()<.28;e.hostility=clamp(e.hostility+rand(8,15),0,100);p.energy=clamp(p.energy-rand(8,18),0,100);p.stress=clamp(p.stress+rand(6,12),0,100);pc.coachTrust=clamp((pc.coachTrust||50)-rand(3,8),0,100);pc.managementRelation=clamp((pc.managementRelation||70)-rand(2,6),0,100);if(injury){p.health=p.health||{};p.health.injury={type:"肢體衝突造成的輕傷",weeks:rand(1,3),severity:1};text=`你與 ${name} 爆發肢體衝突，隊友將你們拉開；你出現輕傷，可能影響近期訓練與比賽。`}else text=`你與 ${name} 爆發推擠與扭打，隊友及教練迅速將雙方拉開。`;if(Math.random()<.22){changeCareerRep(-rand(2,6),"隊內肢體衝突曝光");state.news.unshift(`🚨 ${pc.team} 隊內衝突曝光：夜鋒與 ${name} 發生肢體衝突。`)} }else if(act==="enemyPublic"){e.hostility=clamp(e.hostility+rand(4,9),0,100);ensurePublicImage().haters+=rand(1,5);text=`你公開回應 ${name}，兩人的矛盾成為媒體話題。`}else if(act==="enemyDistance"){e.hostility=clamp(e.hostility-rand(1,4),0,100);p.stress=clamp(p.stress-rand(2,5),0,100);text=`你選擇與 ${name} 保持距離，避免衝突繼續升級。`}else if(act==="enemyReconcile"){const chance=clamp(.08+(100-e.hostility)/180+(p.relations?.[name]||0)/500,.08,.5);if(Math.random()<chance){e.hostility=clamp(e.hostility-rand(18,30),0,100);if(e.hostility<35){delete pc.legacy.enemies[name];const r=pc.teamRuptures?.[name];if(r){r.status="已和解";r.severity=Math.min(2,r.severity||2)}text=`你和 ${name} 終於把話說開，仇敵狀態解除；過去決裂紀錄仍會保留。`}else text=`${name} 願意談，但雙方仍未真正和解。`}else text=`${name} 拒絕和解，現在還不是修復關係的時候。`}state.logs.push(`⚔️ ${text}`);save();render();modal(`<h2>⚔️ ${name}</h2><p>${text}</p>${closeBtn()}`)}
function coachSocialActivity(name,type){
 if(!consume("與教練交流",1))return;const p=state.player,pc=p.proCareer;c=state.characters?.[name];
 let text="";
 if(type==="coachTactics"){p.stats.遊戲理解=clamp(p.stats.遊戲理解+.35,0,100);pc.coachTrust=clamp((pc.coachTrust||50)+1,0,100);text="你和教練討論近期版本與戰術，遊戲理解與教練信任小幅提升。"}
 if(type==="coachEval"){const sec=Math.round(pc.starterSecurity??75);text=`教練給你的近期評價：信任 ${Math.round(pc.coachTrust||50)}/100，先發安全度 ${sec}/100。`}
 if(type==="coachRole"){pc.coachTrust=clamp((pc.coachTrust||50)+.5,0,100);text=`你主動和教練談先發競爭。目前替補評價 ${Math.round(pc.leave?.subScore||50)}/100，先發安全度 ${Math.round(pc.starterSecurity??75)}/100。`}
 p.relations[name]=clamp((p.relations[name]||50)+2,0,100);state.logs.push(`🧑‍🏫 與 ${name} 交流：${text}`);save();render();modal(`<h2>🧑‍🏫 ${name}</h2><p>${text}</p>${closeBtn()}`);
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
  if(isProfessionalStage()&&p.condition.form<75)changeCompetitiveForm(1.5,"充分休息與恢復");
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
   if(c.formerSpouse){c.divorced=false;c.relationshipType="戀人";c.specialRelation="前妻・復合";state.logs.push(`❤️ 你與前妻 ${name} 重新建立感情關係；過去婚姻紀錄仍保留。`)}
   if(!p.romance.partners.includes(name))p.romance.partners.push(name);p.romance.partner=p.romance.partners[0]||name;p.relations[name]=clamp(rel+3,0,100);if(c.teammatePartnerOf){c.relationshipType="地下戀人";c.secretRomanceRisk=Math.max(10,Number(c.secretRomanceRisk||0));state.logs.push(`🤫 你與隊友 ${c.teammatePartnerOf} 的女友 ${name} 開始地下交往。`)}else state.logs.push(`💞 你接受了 ${name} 的告白，正式開始交往。`);
 }else{
  let chance=.38+(rel-75)*.023;const tr=safeTraits(c);
  if(tr.includes("現實"))chance-=.05;if(tr.includes("天然呆"))chance-=.03;if(tr.includes("拜金")&&p.cash<10000)chance-=.10;if(tr.includes("老實"))chance+=.04;
  chance=clamp(chance,.28,.88);
  if(Math.random()<chance){if(!p.romance.partners.includes(name))p.romance.partners.push(name);p.romance.partner=p.romance.partners[0]||name;p.relations[name]=clamp(rel+3,0,100);if(c.teammatePartnerOf){c.relationshipType="地下戀人";c.secretRomanceRisk=Math.max(10,Number(c.secretRomanceRisk||0));state.logs.push(`🤫 ${name} 接受告白；因她仍是隊友 ${c.teammatePartnerOf} 的女友，你們成為地下戀情。`)}else state.logs.push(`💞 ${name} 接受你的告白，你們正式開始交往。`)}
  else{p.relations[name]=clamp(rel-2,0,100);p.romance.flags[name]={cooldown:state.date.week+3};state.logs.push(`${name} 還沒有準備好成為戀人。`)}
 }
 save();document.querySelector(".modal-backdrop")?.remove();render();
}
function relationshipNetworkFor(name){
 const chars=state.characters||{},c=chars[name]||{},out=new Set();
 [c.partnerName,c.romanticPartner,c.teammatePartnerOf,...(c.partnerNames||[])].filter(Boolean).forEach(x=>out.add(x));
 Object.values(chars).forEach(x=>{if(!x?.name||x.name===name)return;const links=[x.partnerName,x.romanticPartner,x.teammatePartnerOf,...(x.partnerNames||[])];if(links.includes(name))out.add(x.name)});
 return [...out];
}
function exposeSecretRomance(name,reason="地下戀情線索累積"){
 const p=state.player,c=state.characters?.[name];if(!c)return false;
 c.secretRomanceExposed=true;c.publicRomance=true;c.relationshipType=(p.romance?.partners||[]).includes(name)?"地下戀情曝光":"戀人";c.secretRomanceRisk=100;
 p.adultLife.publicRomanceKnown=true;
 const links=relationshipNetworkFor(name),mate=c.teammatePartnerOf||c.partnerName||c.romanticPartner||null;
 state.news.unshift(`🚨 地下戀情曝光：夜鋒與 ${name} 的秘密關係遭到公開。`);
 state.logs.push(`📰 ${name} 的地下戀情因「${reason}」曝光。`);
 // 媒體會沿著已存在的人際關係追查，但不把多重交往自動描述成劈腿。
 links.forEach(link=>{
   const lc=state.characters?.[link];if(!lc)return;lc.mediaRelationshipScrutiny=clamp(Number(lc.mediaRelationshipScrutiny||0)+rand(25,45),0,100);
   const partners=relationshipNetworkFor(link).filter(x=>x!==name);
   if(partners.length){state.news.unshift(`🔎 關係網延燒：${link} 同時與 ${[name,...partners].join("、")} 存在感情關係，成為大眾討論焦點。`);lc.publicRelationshipNetwork=true;}
 });
 // 同一人物的其他地下戀情可能被順藤摸瓜，但不保證一次全部爆完。
 const connectedSecrets=(p.romance?.partners||[]).filter(n=>n!==name&&!state.characters?.[n]?.secretRomanceExposed&&relationshipNetworkFor(n).some(x=>links.includes(x)||x===mate));
 connectedSecrets.forEach(n=>{const x=state.characters?.[n];if(!x)return;x.secretSuspicion=clamp(Number(x.secretSuspicion||0)+rand(30,55),0,100);if(x.secretSuspicion>=80&&Math.random()<.55){x.secretRomanceExposed=true;x.publicRomance=true;x.relationshipType="地下戀情曝光";state.news.unshift(`🔥 連鎖曝光：媒體追查後又發現夜鋒與 ${n} 的地下戀情。`)}});
 if(mate&&(p.proCareer?.roster||[]).some(x=>x.name===mate&&!x.isPlayer)){
   createTeamRupture(mate,name,`${name} 地下戀情曝光`);const r=ensureTeamRuptures()[mate];
   if(r&&r.severity>=4&&Math.random()<.72){r.refusesToPlay=true;r.refusalReason=`${name} 地下戀情曝光`;state.logs.push(`⛔ ${mate} 因重大私人衝突表示暫時不願與夜鋒共同出賽。`)}
 }
 triggerPrivateLifePRCrisis(name,"地下戀情曝光");return true;
}
function maybeRomanceExposure(){
 const p=state.player,ps=p.romance?.partners||[];
 const secrets=ps.filter(n=>{const c=state.characters?.[n];return c&&(c.relationshipType==="地下戀人"||c.teammatePartnerOf||c.partnerName||c.romanticPartner)&&!c.secretRomanceExposed});
 for(const name of secrets){const c=state.characters[name],base=Number(c.secretRomanceRisk||10),clues=Number(c.secretSuspicion||0);let add=rand(0,3)+(c.publicFigure?2:0)+(p.followers>100000?1:0);c.secretSuspicion=clamp(clues+add,0,100);const chance=clamp(.002+base*.00022+c.secretSuspicion*.00035,.002,.065);if(Math.random()<chance){exposeSecretRomance(name,c.secretSuspicion>=60?"媒體與共同友人累積多項線索":"意外留下可辨識線索");break}}
 // 保留原本多角關係內部信任事件。
 if(ps.length>=2){const nonConsenting=ps.filter(n=>!p.romance.polyConsent?.[n]);if(nonConsenting.length&&Math.random()<.035){const a=nonConsenting[rand(0,nonConsenting.length-1)],b=ps.find(x=>x!==a);p.relations[a]=clamp((p.relations[a]||0)-rand(3,8),0,100);state.world.rumors.unshift(`有人開始傳你同時和 ${a}、${b} 走得非常近。`)}}
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
 for(const name of [...ps]){const c=state.characters?.[name];if(!c)continue;const tr=safeTraits(c),rel=p.relations[name]||0;
  let chance=.0008+(rel<55?.0035:0)+(tr.includes("自由奔放")?.0015:0)+(tr.includes("心機")?.0015:0)+(tr.includes("高依附")&&rel<60?.001:0)-(tr.includes("忠誠")?.0007:0)-(tr.includes("老實")?.0005:0)-(tr.includes("責任感強")?.0004:0);chance=clamp(chance,0,.006);
  if(Math.random()>=chance)continue;
  const wasSpouse=p.romance?.spouse===name;p.romance.partners=p.romance.partners.filter(x=>x!==name);p.romance.partner=p.romance.partners[0]||null;p.relations[name]=clamp(rel-rand(35,55),0,100);p.mood=clamp(p.mood-28,0,100);p.stress=clamp(p.stress+24,0,100);p.emotion={betrayalUntil:state.date.week+2,betrayalBy:name};if(wasSpouse)finalizeFormerSpouseState(name,"配偶劈腿，婚姻破裂");state.world.rumors.unshift(`${name} 被人看到和別人過度親密，你們的感情因此破裂。`);state.logs.push(`💔 ${name} 劈腿。這是依人物個性與關係狀況觸發的低機率事件。`);state.messages.push({id:"betray-"+Date.now(),from:name,text:"對不起……我做了很傷你的事。",unread:true,resolved:true,type:"normal"});break;}
}
function offFieldFactorTick(){
 if(!isProfessionalStage())return;const p=state.player,pc=p.proCareer;if(Math.random()>.07)return;
 const e=["睡眠品質不佳","贊助商臨時追加拍攝","直播言論被截圖討論","交通延誤影響訓練","隊友爭吵","感情訊息影響專注","黑粉洗版","合約談判分心"][rand(0,7)];
 let de=0,ds=0,df=0;if(e.includes("睡眠")){de=rand(8,14);df=rand(2,5)}else if(e.includes("隊友")){ds=rand(5,10);pc.lockerRoom=clamp(pc.lockerRoom-rand(3,7),0,100)}else if(e.includes("黑粉")||e.includes("言論")){ds=rand(6,12);df=rand(1,4)}else{ds=rand(3,8);de=rand(2,6)}p.energy=clamp(p.energy-de,0,100);p.stress=clamp(p.stress+ds,0,100);p.condition.form=clamp(p.condition.form-df,0,100);state.logs.push(`🌐 場外因素：${e}｜體力 -${de}、壓力 +${ds}${df?`、狀態 -${df}`:""}。`)
}
function migrateProV1937(){
 const p=state.player;if(p.v1937Migrated)return;const pc=p.proCareer||{};
 Object.entries(pc.teammatePartners||{}).forEach(([mate,v])=>{if(!v?.name)return;const c=state.characters?.[v.name];if(!c)return;c.teammatePartnerOf=mate;c.identityType=`${mate}的女友`;if((p.romance?.partners||[]).includes(v.name)){c.relationshipType="地下戀人";c.secretRomanceRisk=Math.max(10,Number(c.secretRomanceRisk||0));}});
 // Known legacy repair: 采恩 belongs to teammate 沈奕辰 when that teammate-partner pairing exists or she was introduced through the team circle.
 const cai=state.characters?.["采恩"];if(cai&&!cai.teammatePartnerOf&&(pc.teammatePartners?.["沈奕辰"]?.name==="采恩"||String(cai.acquaintanceSource||"").includes("戰隊"))){cai.teammatePartnerOf="沈奕辰";cai.identityType="沈奕辰的女友";if((p.romance?.partners||[]).includes("采恩")){cai.relationshipType="地下戀人";cai.secretRomanceRisk=Math.max(10,Number(cai.secretRomanceRisk||0));}}
 p.v1937Migrated=true;state.logs.push("🔧 V1.9.3.7：隊友女友身分改為明確標示所屬隊友；與隊友女友交往一律標記為地下戀情。");
}
function migrateProV1938(){
 const p=state.player;if(p.v1938Migrated)return;const pc=p.proCareer||{};
 if(isProfessionalStage()&&pc.team){
  const sold=[...(pc.transferMarket?.history||[]),...(pc.transferMarket?.listings||[])].filter(x=>x?.status==="已成交"&&x.team===pc.team&&x.name!==p.name);
  const soldNames=new Set(sold.map(x=>x.name));pc.roster=(pc.roster||[]).filter(x=>!soldNames.has(x.name));
  sold.forEach(x=>{const c=state.characters?.[x.name];if(c){c.formerTeammate=true;c.formerTeam=pc.team;if(x.buyer){c.currentTeam=x.buyer;c.team=x.buyer;c.region=x.buyerRegion||c.region}}});
  repairCurrentProRosterVacancies("轉會市場補強");
 }
 p.v1938Migrated=true;state.logs.push("🔧 V1.9.3.8：已成交選手立即移出原戰隊陣容；戰隊會依缺少位置立即補進具名新選手，固定初始名單不再覆蓋轉會結果。");
}

// V1.9.6.7 dynamic world systems
function npcDevelopmentTick(){if(!isProfessionalStage())return;const pc=state.player.proCareer,db=ensureGlobalProDatabase();[...(pc.roster||[])].forEach(x=>{if(!Number.isFinite(x.rating))return;const age=x.age||22,potential=x.potential??(x.potential=clamp(x.rating+6+stableAgeOffset(x.name+"pot",10),x.rating,99));if(age<=25&&x.rating<potential&&Math.random()<.58)x.rating=clamp(x.rating+(Math.random()*.22+.05),0,potential)});Object.values(db||{}).forEach(reg=>Object.values(reg||{}).forEach(roster=>(roster||[]).forEach(x=>{if(!x.active||x.retired||!Number.isFinite(x.rating))return;const potential=x.potential??(x.potential=clamp(x.rating+4+stableAgeOffset(x.name+"pot",9),x.rating,99));if((x.age||23)<=25&&x.rating<potential&&Math.random()<.20)x.rating=clamp(x.rating+(Math.random()*.12+.02),0,potential)})))}
function ensureTwinLinks(){Object.values(state.characters||{}).forEach(c=>{if(c?.twinOf&&state.characters[c.twinOf]){const t=state.characters[c.twinOf];t.twinOf=c.name;t.familyRelation=t.familyRelation||`${c.name}的雙胞胎`}})}
function maybeCreateTwinFor(c){if(!c||c.twinOf||Math.random()>.035)return null;const suffix=c.gender==="女"?["若晴","若曦","語晴","語彤"][rand(0,3)]:["承宇","承恩","子謙","子辰"][rand(0,3)],family=(c.name||"").slice(0,1),name=family+suffix;if(state.characters[name])return null;const t=addSocialAcquaintance(name,rand(8,18),{gender:c.gender,age:c.age,birthYear:c.birthYear,nationality:c.nationality,homeCountry:c.homeCountry,homeCity:c.homeCity,currentCountry:c.currentCountry,currentCity:c.currentCity,career:c.career===undefined?"學生":civilianCareerFor(name,"local",c.gender),occupation:c.career===undefined?"學生":civilianCareerFor(name,"local",c.gender),romanceable:c.gender==="女",traits:fallbackTraits({name,gender:c.gender}),acquaintanceSource:`透過雙胞胎 ${c.name} 認識`,twinOf:c.name,familyRelation:`${c.name}的雙胞胎`});if(t){c.twinOf=name;c.familyRelation=`${name}的雙胞胎`;state.logs.push(`🧬 你得知 ${c.name} 還有一位雙胞胎 ${name}。`)}return t}
function schoolEncounter(place){const p=state.player,here=currentLocationProfile(),minor=place==="highschool"&&Math.random()<.62,age=minor?rand(15,17):rand(18,24),gender=Math.random()<.52?"女":"男",names=gender==="女"?["林沛晴","陳昕妤","周語安","許若寧","葉芷晴"]:["林子皓","陳奕安","周承澤","許宇辰","葉景皓"],name=names.find(n=>!state.characters?.[n]?.known)||names[rand(0,names.length-1)],career=minor?"高中生":age<=22?"大學生":"研究生";if(!state.characters[name])addSocialAcquaintance(name,rand(8,22),{gender,age,birthYear:state.date.year-age,nationality:here.country,homeCountry:here.country,homeCity:here.city,currentCountry:here.country,currentCity:here.city,career,occupation:career,role:career,identityType:career,romanceable:gender==="女"&&age>=18,traits:fallbackTraits({name,gender}),acquaintanceSource:place==="highschool"?"回母校／高中參訪":"大學校園",desc:`在${place==="highschool"?"高中／母校":"大學"}認識的${career}`});const c=state.characters[name];maybeCreateTwinFor(c);let extra="";if(place==="highschool"&&Math.random()<.28){c.menteeCandidate=true;c.playsGame=true;c.gameRole=c.gameRole||diversifiedGameRole(name);extra=`<div class="notice goodtext">🎮 ${name} 對職業電競有興趣，可能成為未來需要你引路的後輩。</div>`}modal(`<h2>${place==="highschool"?"🏫 回到高中／母校":"🎓 大學校園"}</h2><p>你遇到 ${name}（${age}歲｜${career}）。</p>${extra}${age<18?`<div class="notice">未成年人物只開放朋友、聊天、指導與師徒互動，不進入成人親密事件。</div>`:""}${closeBtn()}`);save()}
function maybeMediaContact(){if(!isProfessionalStage()||Math.random()>.10)return;const p=state.player,roles=["電競記者","賽事主持人","主播／賽評","轉會記者","場邊主持","攝影師","製作人","經紀人","實況主"],role=roles[rand(0,roles.length-1)],names=["林映辰","周予安","陳語珊","許庭瑜","葉子謙","蘇婕寧","高承宇","沈若凡"],name=names.find(n=>!state.characters?.[n]?.known)||names[rand(0,names.length-1)];if(!state.characters[name])addSocialAcquaintance(name,rand(15,28),{gender:socialStableHash(name,"g")%2?"女":"男",age:22+stableAgeOffset(name,10),career:role,occupation:role,identityType:"媒體",publicFigure:/主持|主播|實況/.test(role),traits:fallbackTraits({name,gender:"女"}),acquaintanceSource:"電競媒體圈"});state.messages.push({id:"media-"+Date.now(),from:name,text:role.includes("記者")?"最近在做聯賽／轉會專題，想找你聊聊今年的狀況。":"最近有個電競圈活動，想邀你參與。",unread:true,resolved:true,type:"normal"})}
function seasonOpeningInterviewTick(){if(!isProfessionalStage())return;const pc=state.player.proCareer;if(state.date.week>7||pc.openingInterviewYear===state.date.year)return;pc.openingInterviewYear=state.date.year;const goal=["聯賽冠軍","打進MSI／世界賽","世界冠軍"][rand(0,2)];pc.publicSeasonGoal=goal;state.messages.push({id:"season-iv-"+state.date.year,from:"聯賽媒體",text:`🎙️ ${state.date.year} 開季專訪：外界想知道 ${pc.team} 今年的目標。預設公開目標記錄為「${goal}」，後續重大採訪會回顧。`,unread:true,resolved:true,type:"normal"});state.logs.push(`🎙️ ${state.date.year} 開季展望專訪已排入媒體紀錄：${pc.team} 公開目標「${goal}」。`)}
function ensureProHealth1967(){const p=state.player;p.proHealth=p.proHealth||{occupational:null,mental:null,clutchTrait:null};return p.proHealth}
function proHealthTick(){if(!isProfessionalStage())return;const p=state.player,h=ensureProHealth1967();if(!h.clutchTrait&&Math.random()<.025)h.clutchTrait=Math.random()<.45?"大心臟":["慢熱","逆風韌性","國際賽緊張","容易上頭"][rand(0,3)];if(!h.occupational&&Math.random()<.012){h.occupational={type:["手腕過度使用","肩頸慢性疲勞","腰背疼痛","眼睛疲勞","睡眠節律問題"][rand(0,4)],weeks:rand(4,10),severity:rand(1,3)};state.logs.push(`🩺 職業健康：出現「${h.occupational.type}」，需要較長週期管理，可能影響訓練與比賽。`)}if(h.occupational){h.occupational.weeks--;p.condition.form=clamp(p.condition.form-h.occupational.severity*.18,0,100);if(h.occupational.weeks<=0){state.logs.push(`🩺 ${h.occupational.type} 經過休養／管理後明顯改善。`);h.occupational=null}}const cs=p.proCareer?.careerStats||{};if(!h.mental&&(cs.seriesL||0)>=6&&Math.random()<.018){h.mental={type:"關鍵賽心魔",weeks:rand(5,12)};state.logs.push("🧠 連續重要失利累積成競技心理壓力；關鍵局需要更多調整與支持。")}}
function dynamicWorldWeeklyTick1967(){npcDevelopmentTick();ensureTwinLinks();maybeMediaContact();seasonOpeningInterviewTick();proHealthTick()}
function privatePartyCard(){if(!isProfessionalStage())return "";const p=ensureLifestyle(),owned=[...p.assets.vehicles,...p.assets.homes],hasYacht=owned.includes("yacht")||owned.includes("superyacht"),hasVilla=owned.includes("villa");if(!hasYacht&&!hasVilla)return "";return `<section class="card"><h2>🎉 私人活動</h2><div class="small">豪宅／遊艇可舉辦生日、一般聚會與成年人限定私人派對。成人私人派對由你自己挑選邀請對象；接受邀請代表該名成年人自願參與成人性質活動，因此不願進行成人親密互動的人會直接拒絕邀請。</div><div class="reply-grid"><button id="normalPrivateParty" class="reply">🎂 舉辦私人派對</button><button id="adultPrivateParty" class="reply" ${state.player.age<18?"disabled":""}>🔞 成人私人派對</button></div></section>`}
function partyInviteCandidates(adult=false){const p=state.player;return Object.values(state.characters||{}).filter(c=>c?.known&&c.name!==p.name&&proSocialAllowed(c)&&(!adult||Number(c.age||0)>=18)).sort((a,b)=>(p.relations[b.name]||0)-(p.relations[a.name]||0)).slice(0,40)}
function runPrivateParty(adult=false){const p=state.player;if(adult&&p.age<18)return;const people=partyInviteCandidates(adult);if(!people.length){modal(`<h2>🎉 派對</h2><p>目前沒有可邀請的人物。</p>${closeBtn()}`);return}modal(`<h2>${adult?"🔞 成人私人派對":"🎂 私人派對"}</h2><p>請自己選擇邀請對象。${adult?"只有18歲以上人物會出現在名單中；受邀不代表一定接受。":""}</p><div class="log" style="max-height:48vh;overflow:auto">${people.map(c=>`<label class="choice" style="display:block;margin:6px 0"><input type="checkbox" class="party-pick" value="${c.name}"> <strong>${c.name}</strong>｜${Number(c.age||0)}歲｜${c.occupation||c.career||c.identityType||"一般人物"}｜關係 ${Math.round(p.relations[c.name]||0)}${c.teammatePartnerOf?`｜${c.teammatePartnerOf}的伴侶`:""}</label>`).join("")}</div><div class="reply-grid"><button id="partyInviteGo" class="reply">送出邀請</button><button id="partyInviteCancel" class="reply">取消</button></div>`);document.querySelector("#partyInviteCancel")?.addEventListener("click",()=>document.querySelector(".modal-backdrop")?.remove());document.querySelector("#partyInviteGo")?.addEventListener("click",()=>{const names=[...document.querySelectorAll(".party-pick:checked")].map(x=>x.value);if(!names.length){modal(`<h2>尚未選人</h2><p>請至少選擇一位邀請對象。</p>${closeBtn()}`);return}document.querySelector(".modal-backdrop")?.remove();resolvePartyInvites(adult,names,0,[])})}
function adultPartyWillingness(c){const p=state.player,rel=p.relations[c.name]||0,traits=safeTraits(c).join("、"),stamp=state.date.year*60+state.date.week,last=Number(c.adultBoundary?.lastRefusalStamp??-9999);if(Number(c.age||0)<18)return 0;if(stamp-last<=4)return 0;let ch=.30+rel*.005+(p.mood-50)*.0015;if(/外向|冒險|自由|浪漫|衝動/.test(traits))ch+=.08;if(/內向|保守|責任感強|忠誠/.test(traits))ch-=.12;if(c.teammatePartnerOf||c.partnerName||["女友","老婆","男友","未婚妻","未婚夫"].includes(c.relationshipType))ch-=.15;return clamp(ch,.04,.86)}
function partyAcceptanceChance(c,adult){const p=state.player,rel=p.relations[c.name]||0,traits=safeTraits(c).join("、");if(adult)return adultPartyWillingness(c);let ch=.22+rel*.006;if(/外向|冒險|自由/.test(traits))ch+=.10;if(/內向|保守|責任感強|忠誠/.test(traits))ch-=.04;return clamp(ch,.06,.92)}
function resolvePartyInvites(adult,names,i,accepted){if(i>=names.length)return finishPrivateParty(adult,accepted);const name=names[i],c=state.characters?.[name];if(!c)return resolvePartyInvites(adult,names,i+1,accepted);const ok=Math.random()<partyAcceptanceChance(c,adult);if(ok)accepted.push(name);modal(`<h2>${ok?"✅ 接受邀請":"❌ 拒絕邀請"}</h2><p><strong>${name}</strong>${ok?`同意參加${adult?"成人私人派對":"私人派對"}。`:`婉拒了這次${adult?"成人私人派對":"私人派對"}邀請。`}</p><button id="partyInviteNext" class="reply">${i===names.length-1?"查看派對結果":"下一位"}</button>`);document.querySelector("#partyInviteNext")?.addEventListener("click",()=>{document.querySelector(".modal-backdrop")?.remove();resolvePartyInvites(adult,names,i+1,accepted)})}
function partyPartnerFallout(c){if(!c)return null;const partner=c.teammatePartnerOf||c.partnerName||c.romanticPartner||null;if(!partner)return null;const traits=safeTraits(c).join("、"),risk=clamp(.10+(/冒險|衝動/.test(traits)?.08:0)+(/忠誠|責任感強/.test(traits)?-.04:0),.05,.28);if(Math.random()>=risk)return null;c.formerPartnerOf=partner;c.teammatePartnerOf=null;c.partnerName=null;if(c.relationshipType==="女友"||c.relationshipType==="老婆")c.relationshipType="單身";const pc=state.characters?.[partner];if(pc){pc.formerPartnerOf=c.name;if(pc.partnerName===c.name)pc.partnerName=null}state.logs.push(`💔 ${c.name} 參加成人私人派對後與 ${partner} 的感情爆發嚴重衝突，最終分手。`);return `${c.name} 與 ${partner} 因此爆發感情危機並分手`}
function maybePartyPregnancy(guests){const p=state.player;p.adultLife=p.adultLife||{};p.adultLife.pregnancies=p.adultLife.pregnancies||[];const chars=guests.map(n=>state.characters?.[n]).filter(Boolean),women=chars.filter(c=>c.gender==="女"&&Number(c.age||0)>=18),maleGuests=chars.filter(c=>c.gender==="男"&&Number(c.age||0)>=18).map(c=>c.name),events=[];women.forEach(c=>{if(Math.random()>=.055)return;const already=p.adultLife.pregnancies.some(pg=>pg.name===c.name&&!pg.born&&pg.status!=="已結束");if(already)return;const candidates=[p.name,...maleGuests.filter(n=>n!==c.name)],uncertain=candidates.length>1&&Math.random()<.55,possible=uncertain?candidates:[p.name],pg={name:c.name,week:state.date.week,year:state.date.year,progressWeeks:0,status:"可能懷孕",birthPending:false,source:"成人私人派對",fatherKnown:!uncertain,father:uncertain?null:p.name,possibleFathers:possible};p.adultLife.pregnancies.push(pg);const msg=uncertain?`${c.name} 出現懷孕可能；目前無法確定生父（可能：${possible.join("／")}）`:`${c.name} 出現懷孕可能`;events.push(msg);state.logs.push(`🤰 ${msg}。`)});return events}
function partyGuestRomance(guests){const formed=[],used=new Set();const eligible=guests.filter(c=>Number(c?.age||0)>=18&&!c.partnerName&&!c.teammatePartnerOf&&!["老婆","女友","男友","未婚妻","未婚夫"].includes(c.relationshipType));for(let i=0;i<eligible.length;i++){const a=eligible[i];if(used.has(a.name))continue;for(let j=i+1;j<eligible.length;j++){const b=eligible[j];if(used.has(b.name)||a.gender===b.gender)continue;const ta=safeTraits(a).join("、"),tb=safeTraits(b).join("、");let chance=.035+Math.max(0,(pRel(a.name)+pRel(b.name)-80))*.0002;if(/外向|浪漫|冒險|衝動/.test(ta))chance+=.018;if(/外向|浪漫|冒險|衝動/.test(tb))chance+=.018;if(Math.random()>=clamp(chance,.02,.12))continue;a.partnerName=b.name;b.partnerName=a.name;a.relationshipType=a.gender==="女"?"女友":a.gender==="男"?"男友":"交往對象";b.relationshipType=b.gender==="女"?"女友":b.gender==="男"?"男友":"交往對象";a.metPartnerAtParty=true;b.metPartnerAtParty=true;used.add(a.name);used.add(b.name);formed.push(`${a.name} 與 ${b.name} 在派對後互有好感，之後正式開始交往`);state.logs.push(`💕 ${a.name} 與 ${b.name} 因私人派對認識並開始交往。`);break}}return formed}
function pRel(name){return Number(state.player?.relations?.[name]||0)}
function finishPrivateParty(adult,acceptedNames){const p=state.player;if(!acceptedNames.length){modal(`<h2>🎉 派對取消</h2><p>這次受邀者都沒有接受，因此沒有舉辦派對，也不消耗生活時段。</p>${closeBtn()}`);return}if(!consume(adult?"成人私人派對":"私人派對",1))return;const guests=acceptedNames.map(n=>state.characters?.[n]).filter(Boolean);guests.forEach(c=>p.relations[c.name]=clamp((p.relations[c.name]||0)+rand(1,3),0,100));const energyCost=adult?clamp(28+guests.length*2+rand(0,8),30,48):rand(7,12);p.energy=clamp(p.energy-energyCost,0,100);if(adult){p.condition=p.condition||{};p.condition.fatigue=clamp((p.condition.fatigue||0)+rand(12,20),0,100);p.stress=clamp(p.stress+rand(1,5),0,100)}const breakups=adult?guests.map(partyPartnerFallout).filter(Boolean):[];const newCouples=partyGuestRomance(guests);const pregnancies=adult?maybePartyPregnancy(acceptedNames):[];const exposure=adult&&Math.random()<clamp(.006+guests.length*.0035+(guests.some(c=>c.publicFigure)?.012:0),.006,.055);if(exposure){changeCareerRep(-rand(6,14),"私人成人派對曝光");p.prCrisis={type:"私人成人派對照片外流",severity:rand(3,5),source:"匿名外流"};state.news.unshift("🚨 夜鋒高度私密的成人派對內容外流，引發贊助商與媒體關注。")}state.logs.push(`🎉 ${adult?"成人私人":"私人"}派對完成，來賓 ${acceptedNames.join("、")}；體力 -${energyCost}${exposure?"；事件意外曝光":"；維持私人"}。`);save();render();modal(`<h2>🎉 派對結束</h2><p>實際參加者：${acceptedNames.join("、")}</p><div class="notice ${adult?"badtext":""}">⚡ ${adult?"成人私人派對消耗大量體力":"派對消耗體力"}：體力 -${energyCost}${adult?"，並增加疲勞。":"。"}</div>${newCouples.length?`<div class="notice goodtext">💕 ${newCouples.join("；")}。</div>`:""}${breakups.length?`<div class="notice badtext">💔 ${breakups.join("；")}。</div>`:""}${pregnancies.length?`<div class="notice">🤰 ${pregnancies.join("；")}。後續會進入既有懷孕追蹤；生父不確定時不會直接認定夜鋒是父親。</div>`:""}${exposure?`<div class="notice badtext">⚠️ 低機率曝光事件發生，造成較大的公關風險。</div>`:`<div class="notice goodtext">活動維持私人，沒有影響職業風評。</div>`}${closeBtn()}`)}
function migrateProV1967(){const p=state.player;if(p.v1967Migrated)return;ensureProHealth1967();Object.values(state.characters||{}).forEach(c=>{if(c?.known&&!safeTraits(c).length)c.traits=fallbackTraits(c)});p.v1967Migrated=true;state.logs.push("🆕 V1.9.6.7：動態世界・人物深化篇啟用；跨國聊天、前妻復合再婚、NPC成長與主動生活、校園／師徒、媒體、職業健康、高端資產與私人派對開始運作。");}
function migrateProV1973(){const p=state.player;if(p.v1973Migrated)return;syncCanonicalPartnerLinks1972();["智雅","林映辰"].forEach(n=>{const c=state.characters?.[n];if(c&&(p.romance?.partners||[]).includes(n)){c.relationshipType="地下戀人";c.secretSuspicion=Number(c.secretSuspicion||0);c.secretRomanceRisk=Math.max(10,Number(c.secretRomanceRisk||0))}});p.v1973Migrated=true;state.logs.push("🆕 V1.9.7.3：地下戀情改為懷疑／線索累積與關係網連鎖曝光；重大隊內決裂可觸發拒絕共同出賽與緊急替補／轉路／新人救火。");}
function nextDay(){
 ensureV10();let oldWeek=state.date.week,oldDay=state.date.day;try{baseNextDay()}catch(err){state.logs.push(`⚠️ 換日相容修復：${err?.message||err}`);save();render()}
 const advanced=state.date.day!==oldDay||state.date.week!==oldWeek;
 if(!advanced)return;
 try{simulateNpcRanks();syncAnnualCompetition();ensureContractMarket();conditionTick();pregnancyTick();proCareerTick();if(state.player.proCareer?.leave?.days>0){state.player.proCareer.leave.days--;if(state.player.proCareer.leave.days<=0){state.player.proCareer.leave.approved=false;state.logs.push("🗓️ 請假結束，返回戰隊正常行程。")}}frequentEsportsNews();maybeInternationalSocial();maybeTeammateConflict();maybeRomanceExposure();maybePartnerBetrayal();maybePartnerBreakup();maybeRomanceEvent();maybeNpcInvitation();esportsCircleEvent();rumorWarTick();offFieldFactorTick()}catch(err){state.logs.push(`⚠️ 換日後事件相容修復：${err?.message||err}`)}
 if(state.date.week!==oldWeek){
   if(state.date.week===1){resetRankForNewSeason(state.date.year);addAnnualHeroes(state.date.year);annualAgeAndDecline(state.date.year);annualAwards(state.date.year-1)}
   generateWeeklyNews();advanceTournaments();if(!isProfessionalStage())maybeRumor();
   (state.player.romance.partners||[]).forEach(n=>{
     if(Math.random()<.25){
       state.player.relations[n]=clamp((state.player.relations[n]||0)-2,0,100);
       state.logs.push(`${n}覺得你最近把太多時間放在其他事情上，感情 -2。`);
     }
   });
   maybePartnerBreakup();maybePublicRomanceScandal();if(state.player.age>=18&&state.date.week>=48&&!state.player.adultLife?.graduationPath)graduationChoice();
 }
 processExam();
 if(!isProfessionalStage()&&state.date.week>=3&&!state.characters.沈若晴.known&&Math.random()<.08){state.characters.沈若晴.known=true;state.player.relations.沈若晴=7;state.logs.push("校園事件：學生會活動中認識了高三學姊沈若晴。")}
 if(!isProfessionalStage()&&state.date.week>=4&&!state.characters.許安然.known&&Math.random()<.06){state.characters.許安然.known=true;state.player.relations.許安然=12;state.messages.push({id:"oldcrush-"+Date.now(),from:"許安然",text:"好久不見，我好像在朋友的限動看到你？你現在還在打遊戲喔？",unread:true,resolved:true,type:"normal"})}
 save();render();
}

document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>{activeTab=b.dataset.tab;render()});
document.querySelector("#resetBtn").onclick=()=>{if(confirm("確定刪除目前存檔並重開嗎？")){[SAVE_KEY,...OLD_KEYS].forEach(k=>localStorage.removeItem(k));state=newGame();activeTab="home";render()}};
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"}).then(r=>r.update()).catch(()=>{}));
function migrateProV1939(){
 const p=state.player;if(p.v1939Migrated)return;const pc=p.proCareer||{},c=state.characters?.["采恩"];
 if(c){c.nationality="台灣";c.homeCountry="台灣";c.homeCity="台北";c.teammatePartnerOf=c.teammatePartnerOf||"沈奕辰";c.identityType=`${c.teammatePartnerOf}的女友`;}
 const sold=[...(pc.transferMarket?.history||[]),...(pc.transferMarket?.listings||[])].find(x=>x?.name==="沈奕辰"&&x.status==="已成交"&&x.buyer);
 if(c&&sold){updatePartnerResidenceAfterProTransfer("沈奕辰",sold.buyer,sold.buyerRegion||fixedTeamRegion(sold.buyer)||"LEC");}
 // 既有存檔若仍有一軍空缺，允許在轉會期內保留，但截止週一定補齊；非轉會期立即補齊。
 if(isProfessionalStage()&&(!isTransferWindow()||isTransferWindowFinalWeek()))finalizeRosterBeforeTransferDeadline();
 p.v1939Migrated=true;state.logs.push("🔧 V1.9.3.9：一軍空缺必須在轉會窗截止前補齊；修正采恩為台灣人，沈奕辰跨賽區轉會後可跟隨、留台或兩邊跑。");
}
function migrateProV1940(){
 const p=state.player;if(p.v1940Migrated)return;const c=state.characters?.["采恩"];
 if(c){c.nationality="台灣";c.homeCountry="台灣";c.homeCity="台北";if(c.partnerMobility)partnerCurrentLocationByMode(c);}
 p.v1940Migrated=true;state.logs.push("🔧 V1.9.4.1：社交實體見面改以目前所在地判定，不再誤用常住地；采恩常住台北但可依生活安排身處柏林等地。");
}
migrateProV1937();migrateProV1938();migrateProV1939();migrateProV1940();migrateProV1967();migrateProV1973();migrateProV1979();migrateProV1981();migrateProV1982();recoverLegacyMarriageCrisis1977();
if(isProfessionalStage()){ensureCareer20();if(!state.player.v1950Migrated){state.player.v1950Migrated=true;state.logs.push("🆕 V1.9.5.0：職業生涯2.0第一階段啟用；既有社交、約會、懷孕、比賽、轉會流程保持原邏輯。");save();}}
render();
