
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
  version:"1.8.9.8",started:false,
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
 s.version="1.8.9.8";return s;
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
  main.innerHTML=activeTab==="home"?home():activeTab==="schedule"?schedule():activeTab==="rank"?rankPage():activeTab==="phone"?phone():activeTab==="children"?childrenPage():career();
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
 if(t==="fan")return meetFemaleFan();
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
function finishTraining(type){
 if(type==="scrim")return proScrim();
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
 document.querySelectorAll(".stream-choice").forEach(b=>b.onclick=()=>{if(!consume("直播",1))return;const p=state.player;let g=rand(2,9)+Math.floor((p.followers||0)/5000);p.followers+=g;p.energy=clamp(p.energy-7,0,100);let income=(p.followers>=5000)?Math.round(rand(180,520)*(1+Math.log10(Math.max(1,p.followers/5000)))):0;p.cash+=income;state.logs.push(`直播「${b.dataset.v}」，新增${g}位粉絲${income?`，收益 NT$${income.toLocaleString()}`:""}。`);save();document.querySelector(".modal-backdrop")?.remove();render();modal(`<h2>直播結束</h2><p>新增 ${g} 位粉絲。</p>${income?`<div class="notice">💰 直播收益 NT$${income.toLocaleString()}</div>`:""}${closeBtn()}`)});
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
function isInternationalTrip(){return isProfessionalStage()&&["MSI","世界賽"].includes(proAnnualPhase())}

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
 const pc=state.player.proCareer||{},team=pc.team||"",r=pc.region||"PCS";
 if(TEAM_RESIDENCE[team])return {...TEAM_RESIDENCE[team],region:r};
 if(r==="LCK")return {country:"韓國",city:"首爾",region:r};
 if(r==="LPL")return {country:"中國",city:"上海",region:r};
 if(r==="LCS")return {country:"美國",city:"洛杉磯",region:r};
 if(r==="LEC")return {country:"德國",city:"柏林",region:r};
 return {country:"台灣",city:"台北",region:r};
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
 const serial=state.date.year*364+(state.date.week-1)*7+state.date.day;p.activeTravel={country:d.country,city:d.city,companion:companion||"",startedSerial:serial,untilSerial:serial+2};
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
 const common=[["mall","購物中心"],["cafe","咖啡廳"],["restaurant","餐廳"],["arcade","電競館"],["gym","健身房"],["cinema","電影院"],["bar","酒吧"],["night","夜間街區"]];
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
function placeName(p){return {mall:"商場",arcade:"電競館",cafe:"咖啡廳",restaurant:"餐廳",gym:"健身房",cinema:"電影院",nightmarket:"夜市",bar:"酒吧",store:"便利商店",book:"書店",landmark:"當地景點",hotel:"飯店設施",night:"夜間街區",pcbang:"PC Bang",river:"河岸／海邊",tea:"茶館",sports:"運動場館",diner:"美式餐館",square:"城市廣場",bakery:"烘焙咖啡館",museum:"博物館",pub:"英式酒吧",park:"城市公園",plaza:"廣場",tapas:"Tapas餐館"}[p]||p}
function localEncounterPool(country){
 return {
  台灣:["蘇妍希","夏寧","語芯","林若彤","陳子晴","許雅涵","江庭妤","周語柔"],
  日本:["水野凜","藤原美月","小川葵","高橋結衣","佐藤奈緒","中村琴音","山本優花","松本玲奈"],
  韓國:["金瑞妍","朴智恩","李夏恩","崔秀雅","韓智媛","尹彩英","姜敏書","徐恩彩"],
  中國:["林若曦","沈佳寧","蘇雨桐","顧清妍","程以晴","周芷寧","葉清禾","宋知夏"],
  美國:["Mia Carter","Olivia Brooks","Ava Johnson","Ella Davis","Zoe Parker","Nora Lee","Chloe Adams","Avery Kim"],
  德國:["Lena Weber","Mia Hoffmann","Sophie Keller","Anna Vogel","Clara Baumann"],
  法國:["Emma Laurent","Chloé Martin","Camille Dubois","Léa Bernard","Manon Petit"],
  英國:["Sophie Miller","Olivia Clarke","Emily Turner","Amelia Scott","Grace Wilson"],
  西班牙:["Lucía Martín","Carmen Ruiz","Paula Navarro","Elena Torres","Sofía Vega"]
 }[country]||["Maya Lee","Nina Chen","Emma Park"];
}
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
function makeLocalAcquaintanceMeta(name,country,city,context){
 const gamer=shouldLocalAcquaintanceBeGamer(name,context),gameRole=gamer?diversifiedGameRole(name):null;
 return {
   gender:"女",age:19+stableAgeOffset(name,9),nationality:country,
   role:gamer?gameRole:(context==="bar"||context==="pub"?"酒吧認識":"當地生活認識"),
   playsGame:gamer,identityType:gamer?"業餘玩家":"一般人",
   acquaintanceSource:`${country}・${city}${placeName(context)}`,
   romanceable:true,traits:["外向","好奇"],
   desc:gamer?`在${city}生活期間認識的${gameRole}玩家。`:`在${city}生活期間認識。`
 };
}
function repairFlexibleAcquaintanceRoles(){
 const protectedNames=new Set(Object.keys(STORY_SOCIAL_IDENTITIES||{}));
 Object.values(state.characters||{}).forEach(c=>{
  if(!c?.name||protectedNames.has(c.name)||c.isPro||c.isProStaff)return;
  const src=`${c.acquaintanceSource||""} ${c.desc||""} ${c.role||""}`;
  const flexible=/旅行|當地|生活期間|國際賽期間|酒吧認識|海外|城市|電競館|PC Bang/.test(src);
  if(!flexible)return;
  const context=/電競館|PC Bang/.test(src)?"arcade":/酒吧/.test(src)?"bar":"local";
  const gamer=shouldLocalAcquaintanceBeGamer(c.name,context);
  if(gamer){
   c.playsGame=true;c.identityType="業餘玩家";c.role=diversifiedGameRole(c.name);
   c.desc=(c.desc||"").replace(/中路玩家/g,`${c.role}玩家`);
  }else{
   c.playsGame=false;c.identityType="一般人";
   if(["上路","打野","中路","ADC","輔助","下路","射手"].includes(c.role))c.role="一般人";
  }
 });
}
function createResidenceEncounter(context){
 const p=state.player,{country,city}=currentLocationProfile(),female=Math.random()<.68;
 if(female){
   const pool=localEncounterPool(country),unseen=pool.filter(n=>!state.characters?.[n]?.known),name=(unseen.length?unseen:pool)[rand(0,(unseen.length?unseen:pool).length-1)];
   if(!state.characters[name]){
     const meta=makeLocalAcquaintanceMeta(name,country,city,context);meta.birthYear=state.date.year-meta.age;
     addSocialAcquaintance(name,rand(12,28),meta);
   }
   state.logs.push(`🏙️ 當地生活：在${country}・${city}${placeName(context)}遇到 ${name}。`);
   modal(`<h2>🏙️ ${city}生活</h2><p>你在${placeName(context)}遇到 ${name}。${state.characters[name]?.known?"你們聊了一會。":"你們交換了聯絡方式。"}</p>${(context==="bar"||context==="pub")&&p.age>=18?`<button id="barPrivate" class="reply">🌙 詢問是否願意共度私人時間</button>`:""}${closeBtn()}`);
   document.querySelector("#barPrivate")?.addEventListener("click",()=>attemptConsensualPrivateEvent(name,"bar"));
 }else{
   p.followers+=rand(15,80);state.logs.push(`📸 ${city}的當地粉絲認出夜鋒，當地人氣小幅上升。`);
   modal(`<h2>📸 當地粉絲</h2><p>${city}有粉絲認出你並要求合照。</p>${closeBtn()}`);
 }
 save();
}
function createForeignEncounter(context){
 const p=state.player,ev=chooseHost(proAnnualPhase(),state.date.year),female=Math.random()<.62;
 if(female){const pools={韓國:["韓智媛","尹書妍","崔娜恩"],日本:["水野凜","藤原美月","小川葵"],中國:["沈雨薇","周若彤","林可欣"],法國:["Camille Laurent","Léa Martin"],英國:["Emily Clarke","Sophie Reed"],美國:["Mia Carter","Olivia Brooks"]},pool=pools[ev.host.country]||["Emma Lee","Nina Park","Maya Chen"],unseen=pool.filter(n=>!state.characters?.[n]?.known),name=(unseen.length?unseen:pool)[rand(0,(unseen.length?unseen:pool).length-1)];if(!state.characters[name]){const meta=makeLocalAcquaintanceMeta(name,ev.host.country,ev.host.city,context);meta.age=19+stableAgeOffset(name,8);meta.birthYear=state.date.year-meta.age;meta.acquaintanceSource=`${proAnnualPhase()}・${ev.host.city}`;meta.desc=meta.playsGame?`在${ev.host.city}國際賽期間認識的${meta.role}玩家。`:`在${ev.host.city}國際賽期間認識。`;addSocialAcquaintance(name,rand(15,35),meta)}state.logs.push(`✈️ 海外奇遇：在${ev.host.city}${placeName(context)}遇到 ${name}。`);modal(`<h2>✈️ 海外奇遇｜${ev.host.city}</h2><p>你遇到 ${name}（${state.characters[name].age}歲）。</p>${context==="bar"&&p.age>=18?`<button id="barPrivate" class="reply">🌙 詢問是否願意共度私人時間</button>`:""}${closeBtn()}`);document.querySelector("#barPrivate")?.addEventListener("click",()=>attemptConsensualPrivateEvent(name,"bar"));}
 else{p.followers+=rand(40,160);p.stress=clamp(p.stress+rand(0,3),0,100);state.logs.push(`🌍 海外奇遇：${ev.host.city}當地粉絲認出夜鋒，海外粉絲增加。`);modal(`<h2>🌍 海外粉絲</h2><p>當地粉絲認出你並要求合照，海外人氣上升。</p>${closeBtn()}`)}save();
}
function randomEncounter(context){
 if(isInternationalTrip()){createForeignEncounter(context);return}
 if(isProfessionalStage()){createResidenceEncounter(context);return}
 if(context==="bar"&&state.player.age>=18){const n=["陳映彤","蘇婕妤","葉心妍"][rand(0,2)];if(!state.characters[n])state.characters[n]={name:n,known:true,gender:"女",age:18+stableAgeOffset(n,8),role:"酒吧認識",romanceable:true,traits:["外向"]};state.player.relations[n]=state.player.relations[n]??rand(10,30);save();modal(`<h2>🍸 酒吧奇遇</h2><p>你認識了 ${n}，彼此聊得不錯。</p><button id="barPrivate" class="reply">🌙 詢問是否願意共度私人時間</button>${closeBtn()}`);document.querySelector("#barPrivate")?.addEventListener("click",()=>attemptConsensualPrivateEvent(n,"bar"));return}
 const r=Math.random();if(context==="arcade"&&!state.eventFlags.zichen){state.eventFlags.zichen=true;state.characters.子辰.known=true;state.player.relations.子辰=8;modal(`<h2>🎲 奇遇｜電競館</h2><p>隔壁五排少一人，子辰邀你補位。</p><button class="reply encounter" data-e="join">加入他們</button>${closeBtn()}`);document.querySelectorAll(".encounter").forEach(b=>b.onclick=()=>resolveArcade(b.dataset.e));return}
 if(context==="mall"&&!state.eventFlags.mallRain){state.eventFlags.mallRain=true;state.characters.林雨晴.known=true;state.player.relations.林雨晴=Math.max(state.player.relations.林雨晴,6);state.logs.push("生活事件：在國內商場偶遇同班同學林雨晴。");save();render();return}
 const t={cafe:"休息後壓力稍微下降。",restaurant:"吃了一頓不錯的飯。",gym:"活動筋骨，狀態稍微改善。",cinema:"看電影放鬆心情。",nightmarket:"在人群中放鬆了一晚。",store:"買了些生活用品。",book:"翻閱職業選手訪談。"}[context]||"今天沒有特別事件。";if(context==="cafe")state.player.stress=clamp(state.player.stress-3,0,100);state.logs.push("生活事件："+t);save();render();modal(`<h2>生活事件</h2><p>${t}</p>${closeBtn()}`)
}
function adultEstablishedPartnerEvent(name){
 const p=state.player,c=state.characters?.[name],spouse=p.romance?.spouse===name,partner=(p.romance?.partners||[]).includes(name);
 if(p.age<18||!c||Number(c.age||0)<18||(!spouse&&!partner))return;adultPrivateEvent(name,spouse?"spouse":"partner");
}
function attemptConsensualPrivateEvent(name,kind="social"){
 const p=state.player,c=state.characters[name];if(p.age<18||!c||c.gender!=="女"||c.age<18)return;const consent=Math.random()<clamp(.48+(p.relations[name]||20)*.004+(p.mood-50)*.002,.35,.82);if(!consent){state.logs.push(`${name}婉拒了更進一步的邀請。`);modal(`<h2>私人邀約</h2><p>${name}婉拒了邀請，你尊重她的決定。</p>${closeBtn()}`);return}adultPrivateEvent(name,kind==="bar"?"bar":"lover");if(Math.random()<.12){p.prCrisis={type:"私人關係曝光",severity:rand(1,3),source:name};state.logs.push("⚠️ 私人關係被外界注意，可能形成公關危機。")}
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
   state.weeklyPlan={};if(!isProfessionalStage()){state.player.cash+=750;state.logs.push(`第${finishedWeek}週結束：上週行程已歸檔，零用錢入帳 NT$750。`)}else{state.logs.push(`第${finishedWeek}週結束：職業週行程已歸檔。`);professionalWeeklyTick()}
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

function ensureV10(){(state.player.proFriends||[]).forEach(n=>ensureProCharacter(n));Object.keys(state.characters||{}).filter(n=>state.characters[n]?.isPro).forEach(n=>ensureProCharacter(n));
 const previousVersion=state?.version||"";
 state=normalize(state);
 const p=state.player;
 ensureFixedMidExpansionHeroes();
 ensureSavedAnnualHeroes();
 repairFlexibleAcquaintanceRoles();
 ensureLegacyChildSystem();
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
 migrateProV183();
 if(!p.v170Migrated){
   if(isProfessionalStage()){
    p.proCareer.lockerRoom=p.proCareer.lockerRoom||65;ensureProEconomy();ensureMeta();ensurePublicImage();cleanupUnnamedFriends();
    state.world.tournaments=[];state.tournament=null;Object.keys(state.weeklyPlan||{}).forEach(d=>state.weeklyPlan[d]=(state.weeklyPlan[d]||[]).filter(e=>e.type!=="amateurTournament"&&e.type!=="tournament"));
    if(p.proCareer.contract)completeContract(p.proCareer.contract);
    state.logs.push("🆕 V1.7.0：職業生活切換為每日5格，業餘杯賽關閉；合約、薪資補發、版本Meta、Scrim、贊助與公關系統啟用。");
   }
   p.v170Migrated=true;
 }
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
 if(c?.playsGame||["上路","打野","中路","ADC","輔助"].includes(normalizeRole(c?.role)))return "業餘玩家";
 return "一般人";
}
function currentRelationshipLabel(name){
 const p=state.player,c=state.characters?.[name],rel=p.relations?.[name]||0;
 if(p.name===name)return "本人";
 if(p.romance?.spouse===name)return "老婆";
 if((p.romance?.partners||[]).includes(name))return "戀人";
 if(c?.relationshipType==="炮友")return "固定關係";
 if(c?.formerPartner)return "前任";
 if(c?.isRival)return "對手／宿敵";
 return relationTier(rel,name);
}
function socialIdentity(name){
 const c=state.characters?.[name],story=STORY_SOCIAL_IDENTITIES[name],pro=confirmedProfessionalRecord(name),type=identityTypeFor(name),pc=state.player.proCareer||{};
 const currentCoach=(pc.coaches||[]).find(x=>x.name===name);if(currentCoach)return `${pc.team}｜${currentCoach.role}`;
 if(c?.formerTeam&&c?.isProStaff)return `前 ${c.formerTeam}｜${c.formerRole||c.role||"教練"}`;
 if(pro)return `${pro.team}｜${pro.role}｜${pro.type}`;
 if(type==="業餘玩家"){const r=normalizeRole(c?.role||story?.gameRole);return `${type}${r?`｜${r}`:""}`}
 return type;
}
function socialProfileMeta(name){
 const c=state.characters?.[name],story=STORY_SOCIAL_IDENTITIES[name];
 return {identity:socialIdentity(name),source:story?.source||inferAcquaintanceSource(c),relationship:currentRelationshipLabel(name),special:story?.special||c?.specialRelation||""};
}
function relationTier(v,name){
 const c=state.characters?.[name];
 if(state.player?.romance?.spouse===name)return "老婆";
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
 {id:"sedan",kind:"vehicle",name:"房車",price:1200000,maint:6000,quality:2},{id:"sport",kind:"vehicle",name:"跑車",price:6800000,maint:24000,quality:6},{id:"supercar",kind:"vehicle",name:"頂級超跑",price:18000000,maint:60000,quality:10}
];
function assetCard(){if(!isProfessionalStage())return "";const p=ensureLifestyle(),owned=[...p.assets.homes,...p.assets.vehicles];return `<section class="card"><h2>🏠 資產與生活</h2><div class="small">持有資產：${owned.length?owned.map(id=>ASSET_CATALOG.find(x=>x.id===id)?.name||id).join("、"):"尚無"}</div>${ASSET_CATALOG.map(x=>`<div class="schedule-item"><div><strong>${x.name}</strong><div class="small">NT$${x.price.toLocaleString()}｜每4週維護約 NT$${x.maint.toLocaleString()}</div></div><button class="ghost asset-buy" data-id="${x.id}" ${owned.includes(x.id)||p.cash<x.price?"disabled":""}>${owned.includes(x.id)?"已擁有":"購買"}</button></div>`).join("")}</section>`}
function buyAsset(id){const p=ensureLifestyle(),x=ASSET_CATALOG.find(a=>a.id===id);if(!x||p.cash<x.price)return;p.cash-=x.price;(x.kind==="home"?p.assets.homes:p.assets.vehicles).push(x.id);p.mood=clamp(p.mood+x.quality,0,100);state.logs.push(`🏠 購入資產：${x.name}，支出 NT$${x.price.toLocaleString()}。`);save();render()}
function alumniCard(){if(!isProfessionalStage())return "";const p=ensureLifestyle();return `<section class="card"><h2>🎓 回饋母校</h2><div class="small">累計回饋 NT$${p.alumni.donated.toLocaleString()}。可贊助電競社、獎學金或校園設備。</div><div class="reply-grid"><button class="reply alumni-donate" data-amt="50000">贊助電競社 5萬</button><button class="reply alumni-donate" data-amt="200000">設立獎學金 20萬</button><button class="reply alumni-donate" data-amt="1000000">校園大型回饋 100萬</button></div></section>`}
function alumniDonate(amt){const p=ensureLifestyle();if(p.cash<amt)return;p.cash-=amt;p.alumni.donated+=amt;p.alumni.events++;changeEthics(Math.min(8,2+amt/250000),"回饋母校");p.followers+=Math.round(amt/10000);state.logs.push(`🎓 回饋母校 NT$${amt.toLocaleString()}，校方與學弟妹表達感謝。`);save();render()}
function fanMeetingCard(){if(!isProfessionalStage()||state.player.followers<5000)return "";return `<section class="card"><h2>🤝 粉絲見面會</h2><div class="small">安排簽名、合照與粉絲交流。需要1個活動時段。</div><button id="fanMeeting" class="reply">舉辦粉絲見面會</button></section>`}
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
function pregnancyByName(name){return (state.player.adultLife?.pregnancies||[]).find(x=>x.name===name)}
function resolveBirthEvent(name){
 const pg=pregnancyByName(name);if(!pg||!pg.birthPending||pg.born)return;
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
function career(){
 ensureV10();const p=state.player;
 return `${proCareerCard()}${recentProMatchCard()}${annualCalendarCard()}${freeAgentCard()}${internationalCard()}${internationalGroupsCard()}${achievementCard()}${contractCenter()}${contractLookupCard()}${reputationDetailCard()}${donationCard()}${sponsorCard()}${fanMeetingCard()}${assetCard()}${alumniCard()}${leaveCard()}${pregnancyCard()}${marriageCard()}${healthCard()}<section class="card"><h2>生涯中心</h2><div class="stat-grid">${isProfessionalStage()?stat("職業風評",Math.round(p.adultLife.careerReputation))+stat("黑粉",p.publicImage?.haters||0):stat("學業",Math.round(p.school))+stat("家庭支持",Math.round(p.family))}${stat("粉絲",p.followers)}${stat("聲譽",p.reputation)}</div></section>
 ${worldCards()}${isProfessionalStage()?metaCard()+financeCard():amateurCard()}${shopCard()}${masteryCard()}
 <section class="card"><h2>💾 存檔與救援</h2><div class="reply-grid"><button id="exportSaveBtn" class="reply">匯出 JSON 存檔</button><button id="importSaveBtn" class="reply">匯入 JSON 存檔</button><button id="recoverW15Btn" class="reply">🛠️ 回朔第15週星期五早上</button><button id="repairAdvanceBtn" class="reply">🔧 修復目前行程鎖定</button></div><input id="importSaveFile" type="file" accept=".json,application/json" style="display:none"><div class="small">回朔救援會保留角色能力、Rank、金錢、人際與裝備，重置第15週星期五當日狀態並重建電競社課。</div></section>
 <section class="card"><h2>版本</h2><div class="log"><strong>V1.8.9.8</strong>｜動態新聞、全服菁英榜、好感階段、校園朋友圈、花錢系統、段考週、業餘賽事與緋聞架構。</div></section>`;
}
function bind(){
 document.querySelectorAll(".action-btn").forEach(b=>b.onclick=()=>act(b.dataset.action));document.querySelector("#doTryout")?.addEventListener("click",doProTryout);document.querySelector("#signProContract")?.addEventListener("click",signProContract);document.querySelector("#counterOffer")?.addEventListener("click",counterInitialOffer);document.querySelector("#declineOffer")?.addEventListener("click",declineInitialOffer);document.querySelector("#playLeagueMatch")?.addEventListener("click",playLeagueMatch);document.querySelector("#askRaise")?.addEventListener("click",()=>negotiateContract("raise"));document.querySelector("#offerCut")?.addEventListener("click",()=>negotiateContract("cut"));document.querySelector("#requestTransfer")?.addEventListener("click",()=>negotiateContract("transfer"));document.querySelector("#earlyRenewal")?.addEventListener("click",earlyRenewalTalk);document.querySelectorAll(".pregnancy-talk").forEach(b=>b.onclick=()=>pregnancyDecisionByName(b.dataset.name));document.querySelectorAll(".child-choice").forEach(b=>b.onclick=()=>childSupportDecision(b.dataset.name,b.dataset.choice));document.querySelectorAll(".sponsor-action").forEach(b=>b.onclick=()=>sponsorAction(b.dataset.action));document.querySelector("#launchMerch")?.addEventListener("click",launchSponsorMerch);document.querySelectorAll(".donate-btn").forEach(b=>b.onclick=()=>makeDonation(+b.dataset.amt));document.querySelector("#proposeMarriage")?.addEventListener("click",proposeMarriage);document.querySelector("#marriageTalk")?.addEventListener("click",resolveMarriageCrisis);document.querySelector("#prAction")?.addEventListener("click",openPRResponse);document.querySelector("#suggestRecruit")?.addEventListener("click",openRecruitSuggestion);document.querySelector("#stiScreen")?.addEventListener("click",doStiScreen);document.querySelectorAll(".asset-buy").forEach(b=>b.onclick=()=>buyAsset(b.dataset.id));document.querySelectorAll(".alumni-donate").forEach(b=>b.onclick=()=>alumniDonate(+b.dataset.amt));document.querySelector("#fanMeeting")?.addEventListener("click",runFanMeeting);document.querySelectorAll(".leave-request").forEach(b=>b.onclick=()=>requestCoachLeave(b.dataset.reason));document.querySelectorAll(".birth-event").forEach(b=>b.onclick=()=>resolveBirthEvent(b.dataset.name));document.querySelectorAll(".child-care-action").forEach(b=>b.onclick=()=>spendTimeWithChild(b.dataset.name));document.querySelectorAll(".infant-care-action").forEach(b=>b.onclick=()=>infantCare(b.dataset.name));document.querySelectorAll(".legacy-birth-choice").forEach(b=>b.onclick=()=>recordLegacyBirthChoice(b.dataset.name,b.dataset.choice));document.querySelectorAll(".legacy-child-choice").forEach(b=>b.onclick=()=>childSupportDecision(b.dataset.name,b.dataset.choice));document.querySelector("#injuryTreat")?.addEventListener("click",treatInjury);document.querySelector("#injuryRehab")?.addEventListener("click",rehabInjury);document.querySelector("#healthCheck")?.addEventListener("click",generalHealthCheck);document.querySelector("#stiTreat")?.addEventListener("click",treatSti);document.querySelector("#viewLastMatchReport")?.addEventListener("click",showMatchReport);document.querySelector("#resumePostInterview")?.addEventListener("click",showPostMatchMedia);
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
 const p=state.player,c=state.characters?.[name];if(p.age<18||!p.adultLife?.enabled){modal(`<h2>尚未開放</h2><p>此內容只在主角成年後開放。</p>${closeBtn()}`);return}
 if(remain()<1)return;const established=kind==="spouse"||kind==="partner";if(!consume(established?(kind==="spouse"?"夫妻親密時光":"親密相處"):"私人約會",1))return;
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
 const p=state.player;if(p.age<18||p.followers<300){modal(`<h2>女粉絲事件</h2><p>成年且累積一定直播人氣後才可能認識粉絲。</p>${closeBtn()}`);return}
 let name=`女粉絲${rand(100,999)}`,named=Math.random()<.22;if(named)name=["夏語晴","林沐妍","許若曦","陳心妤"][rand(0,3)];const intent=named?(Math.random()<.45?"想發展關係":Math.random()<.65?"願意維持固定關係":"保持聯絡"):"一次性互動";state.characters[name]={name,known:named,gender:"女",romanceable:named&&intent!=="保持聯絡",role:"粉絲",relationshipType:intent==="願意維持固定關係"?"炮友":null,desc:`透過直播與社群認識的成年女性粉絲。${named?"目前傾向："+intent:""}`,traits:["熱情","粉絲"],temporaryFan:!named};p.relations[name]=rand(35,55);p.adultLife.fanIncidents++;save();adultPrivateEvent(name,"fan");if(!named){setTimeout(()=>{const pg=(p.adultLife.pregnancies||[]).some(x=>x.name===name);if(!pg){delete state.characters[name];delete p.relations[name];save()}},0)}
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
function ensureMeta(){const w=state.world;if(!w.meta||w.meta.block!==Math.floor((state.date.week-1)/8)){const block=Math.floor((state.date.week-1)/8),ids=HEROES.map(h=>h.id),launch=ids.filter(id=>id.startsWith(`y${state.date.year}_`)||["mid_duskwalker","mid_luofei","mid_astrologer","mid_helan","mid_frostspeaker"].includes(id)),weighted=[...ids,...launch,...launch],shuffle=[...weighted].sort(()=>Math.random()-.5),strong=[];shuffle.forEach(id=>{if(strong.length<3&&!strong.includes(id))strong.push(id)});const weak=[...ids].filter(id=>!strong.includes(id)).sort(()=>Math.random()-.5).slice(0,2);w.meta={block,version:`${state.date.year}.${block+1}`,style:META_ARCHETYPES[block%META_ARCHETYPES.length],strong,weak,newHeroBias:launch.length>0};state.news.unshift(`版本更新 ${w.meta.version}：${w.meta.style}成為主流，${w.meta.strong.map(id=>HEROES.find(h=>h.id===id)?.name).join("、")}較強勢。${launch.some(id=>strong.includes(id))?" 新英雄正在影響版本Meta。":""}`)}return w.meta}
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
 p.energy=clamp(p.energy-10,0,100);p.stress=clamp(p.stress+(win?-2:4),0,100);p.mood=clamp(p.mood+(win?4:-4),0,100);
 const report=[
  `05:${rand(10,59)}｜雙方中野第一次河道碰撞，${teamChemistry()>=60?"隊伍溝通順暢":"語音出現短暫分歧"}。`,
  `11:${rand(10,59)}｜第一條小龍爭奪，${win?pc.team+"取得主動權":opp+"先拿資源優勢"}。`,
  `18:${rand(10,59)}｜中期團戰，夜鋒的版本適應度${playerMetaFit()>=1?"帶來明顯優勢":"仍需要更多磨合"}。`,
  `25:${rand(10,59)}｜Baron區拉扯，${win?"隊伍成功找到開戰窗口":"對方抓到視野空檔擴大領先"}。`,
  `${rand(29,36)}:${rand(10,59)}｜訓練賽結束：${pc.team} ${score} ${opp}。`
 ];
 if(pc.scrimStreak<=-3)state.logs.push("💢 訓練賽連敗，更衣室開始出現爭執與互相質疑。");
 state.logs.push(`🆚 Scrim：${pc.team} ${score} ${opp}，更衣室氣氛 ${Math.round(pc.lockerRoom)}。`);
 save();render();modal(`<h2>🆚 訓練賽${win?"勝利":"敗北"}｜${score}</h2><div class="log">${report.join("<br>")}</div><div class="notice">${win?"團隊配合提升，隊友關係小幅上升。":"失利讓壓力與摩擦增加；連敗可能導致爭吵。"}</div>${closeBtn()}`);
}
function updateTeamRelationsAfterMatch(win){const p=state.player,pc=p.proCareer,mates=(pc.roster||[]).filter(x=>!x.isPlayer);if(win){mates.forEach(x=>p.relations[x.name]=clamp((p.relations[x.name]||50)+rand(0,2),0,100));pc.lossStreak=0;pc.lockerRoom=clamp((pc.lockerRoom||65)+2,0,100)}else{pc.lossStreak=(pc.lossStreak||0)+1;mates.forEach(x=>p.relations[x.name]=clamp((p.relations[x.name]||50)-rand(0,pc.lossStreak>=3?3:1),0,100));pc.lockerRoom=clamp((pc.lockerRoom||65)-(pc.lossStreak>=3?5:2),0,100);if(pc.lossStreak>=3)state.logs.push(`💢 正式賽${pc.lossStreak}連敗，更衣室氣氛惡化，隊員開始互相質疑。`)}}
function updateProfessionalReputation(win,mvp){const p=state.player;if(mvp)p.adultLife.careerReputation=clamp(p.adultLife.careerReputation+1,0,100);if(win&&p.adultLife.careerReputation<70&&Math.random()<.25)p.adultLife.careerReputation=clamp(p.adultLife.careerReputation+.5,0,100)}
function ensureProEconomy(){const p=state.player,pc=p.proCareer;if(!pc.finance)pc.finance={lastPaidSerial:null,history:[]};if(!pc.contract)return;completeContract(pc.contract);if(pc.finance.lastPaidSerial==null){const joined=pc.joinedAt||{year:state.date.year,week:state.date.week},now=(state.date.year*52+state.date.week),start=(joined.year*52+joined.week),cycles=Math.max(0,Math.floor((now-start)/4));if(cycles){const amt=cycles*pc.contract.salary;p.cash+=amt;pc.finance.history.unshift({type:"歷史薪資補發",amount:amt,week:state.date.week});state.logs.push(`💰 歷史薪資補發：${cycles}個月，共 NT$${amt.toLocaleString()}。`)}pc.finance.lastPaidSerial=start+cycles*4}}
function completeContract(c){const pc=state.player.proCareer;if(c.complete)return;c.start=c.start||{year:pc.joinedAt?.year||state.date.year,week:pc.joinedAt?.week||state.date.week};c.years=c.years||Math.max(1,Math.min(3,Math.round((c.lengthWeeks||52)/52)));c.lengthWeeks=c.lengthWeeks||c.years*52;c.buyout=c.buyout||Math.max(c.salary*12,600000);c.requirements=c.requirements||{appearance:70,season:"前8",reputation:55,rank:"菁英",noMajorScandal:true};c.bonuses=c.bonuses||{leagueChampion:300000,worlds:200000,mvp:100000};c.complete=true}
function salaryTick(){if(!isProfessionalStage())return;ensureProEconomy();const p=state.player,pc=p.proCareer,f=pc.finance,c=pc.contract,now=state.date.year*52+state.date.week;if(!c)return;while(now-(f.lastPaidSerial||now)>=4){p.cash+=c.salary;f.lastPaidSerial+=4;f.history.unshift({type:"戰隊月薪",amount:c.salary,week:state.date.week});state.logs.push(`💰 ${pc.team} 月薪入帳 NT$${c.salary.toLocaleString()}。`)}}
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
 const p=state.player;ensureEthics();const rh=p.adultLife.reputationHistory.slice(0,6);
 return `<section class="card"><h2>📊 職業評價</h2><div class="stat-grid">${stat("職業風評",Math.round(p.adultLife.careerReputation))}${stat("人品",Math.round(p.ethics))}</div>
 <div class="small">職業風評＝訓練、紀律、媒體、合約與業界專業評價；人品＝私人行為與責任感。未曝光的私人感情不會直接改變職業風評。</div>
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
function maybeNpcInvitation(){
 if(!isProfessionalStage()||Math.random()>.055)return;const p=state.player,pc=p.proCareer,cands=Object.values(state.characters||{}).filter(c=>c?.known&&c.name!==p.name&&proSocialAllowed(c));if(!cands.length)return;
 const c=cands[rand(0,cands.length-1)],rel=p.relations[c.name]||50,pro=!!proIdentity(c.name),dating=(p.romance.partners||[]).includes(c.name);
 const opts=dating?["吃晚餐","約會","一起休息"]:pro?["吃飯聊比賽","Rank雙排","一起覆盤"]:["吃飯","逛街","聊天"];
 const activity=opts[rand(0,opts.length-1)];
 state.messages.push({id:"invite-"+Date.now()+rand(1,999),from:c.name,text:`${dating?"最近都沒什麼時間見面。":""}要不要找時間${activity}？`,unread:true,resolved:true,type:"normal"});
 state.logs.push(`📱 ${c.name} 主動邀約你${activity}。`);
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
 const discover=clamp(.10+a.count*.055+(p.followers>100000?.05:0)-(ensureMarriageState().trust||80)*.0005,.06,.38);
 if(!a.exposedToSpouse&&Math.random()<discover){a.exposedToSpouse=true;triggerMarriageAffairCrisis(name)}
 else state.logs.push(`🌙 與 ${name} 的婚外接觸目前沒有被配偶發現；曝光風險會隨次數增加。`);
}
function triggerMarriageAffairCrisis(otherName){
 const p=state.player,spouse=p.romance?.spouse;if(!spouse||otherName===spouse)return;
 const m=ensureMarriageState();if(m.crisis)return;
 const severity=rand(2,4);m.trust=clamp((m.trust||80)-rand(25,45),0,100);
 p.relations[spouse]=clamp((p.relations[spouse]||90)-rand(25,45),0,100);
 m.crisis={type:"婚外關係被發現",other:otherName,severity,stage:"等待溝通",week:state.date.week};
 changeEthics(-rand(8,15),"婚外關係被配偶發現");
 state.logs.push(`💥 ${spouse} 發現你與 ${otherName} 有不忠關係。婚姻進入重大危機，必須先溝通處理。`);
 state.messages.push({id:"marriage-crisis-"+Date.now(),from:spouse,text:"我已經知道那件事了。我們必須好好談清楚，否則這段婚姻可能沒辦法繼續。",unread:true,resolved:true,type:"normal"});
}
function marriageCrisisCard(){
 const p=state.player,m=ensureMarriageState(),x=m.crisis;if(!p.romance?.spouse||!x)return "";
 return `<section class="card"><h2>⚠️ 婚姻危機</h2><div class="notice badtext">${x.type}｜婚姻信任 ${Math.round(m.trust||0)}</div><p class="small">目前階段：${x.stage}。先溝通處理；若處理失敗，可能進入分居、離婚、爆料或黑料事件。</p><button id="marriageTalk" class="reply">與老婆溝通處理</button></section>`;
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
 const p=state.player,spouse=p.romance?.spouse;if(!spouse)return;const m=ensureMarriageState();
 m.divorced.push({name:spouse,year:state.date.year,week:state.date.week,reason});p.relations[spouse]=clamp((p.relations[spouse]||50)-rand(20,35),0,100);
 p.romance.partners=(p.romance.partners||[]).filter(n=>n!==spouse);p.romance.partner=p.romance.partners[0]||null;p.romance.spouse=null;m.crisis=null;
 state.logs.push(`💔 你與 ${spouse} 正式離婚。原因：${reason}。`);
 if(Math.random()<.55){p.prCrisis={type:"離婚後黑料／爆料",severity:rand(2,5),source:spouse};state.world.rumors.unshift(`夜鋒離婚消息曝光，前妻可能公開更多婚姻內幕。`)}
}
function marriageCard(){const p=state.player;if(!isProfessionalStage())return "";const spouse=p.romance?.spouse;if(spouse){const m=ensureMarriageState();return `<section class="card"><h2>💍 婚姻</h2><div class="notice">老婆：${spouse}｜婚姻信任 ${Math.round(m.trust||0)}</div></section>${marriageCrisisCard()}`;}const partner=(p.romance?.partners||[]).find(n=>(p.relations[n]||0)>=88);return partner?`<section class="card"><h2>💍 婚姻</h2><p>與 ${partner} 的關係已足夠穩定，可以考慮求婚。</p><button id="proposeMarriage" class="reply">向 ${partner} 求婚</button></section>`:""}
function proposeMarriage(){const p=state.player,n=(p.romance?.partners||[]).find(x=>(p.relations[x]||0)>=88);if(!n)return;const trust=p.romance.trust?.[n]??70,chance=clamp(.35+(p.relations[n]-80)*.025+(trust-50)*.004-(p.romance.partners.length>1?.25:0),.12,.92);if(Math.random()<chance){p.romance.spouse=n;p.romance.partners=[n];p.romance.marriage={trust:90,crisis:null,divorced:p.romance.marriage?.divorced||[]};state.logs.push(`💍 ${n}接受求婚，你們正式結婚。關係狀態改為「老婆」。`)}else{p.relations[n]=clamp(p.relations[n]-3,0,100);state.logs.push(`💍 ${n}目前還沒有準備好結婚。`)}save();render()}
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
function triggerPrivateLifePRCrisis(source,reason="親子爭議"){
 const p=state.player,pc=p.proCareer||{},chaos=privateLifeChaosScore(),severity=clamp(2+Math.floor(chaos/2)+rand(0,1),2,5);
 p.prCrisis={type:severity>=4?"大型私生活公關危機":reason,severity,source,privateLife:true};
 ensurePublicImage().haters+=severity*rand(6,12);p.followers=Math.max(0,p.followers-severity*rand(120,420));
 changeCareerRep(-severity*1.5,"私生活爭議公開後影響職業形象");pc.coachTrust=clamp((pc.coachTrust||50)-severity*2,0,100);
 if(pc.sponsor&&severity>=4&&Math.random()<.45){state.logs.push(`📣 ${pc.sponsor.brand} 因大型私生活爭議終止代言合作。`);pc.sponsor=null}
 const spouse=p.romance?.spouse;if(spouse&&source!==spouse){const x=pregnancyByName(source);if(x){x.spouseKnows=true;x.publicExposure=true};p.relations[spouse]=clamp((p.relations[spouse]||50)-severity*rand(3,6),0,100);p.romance.marriageCrisis={type:"婚外親子／私生活曝光",source,severity};}
 state.news.unshift(`🚨 ${severity>=4?"大型公關危機":"公關危機"}：夜鋒的私人生活爭議遭到公開，戰隊、粉絲與商業合作都開始關注。`);
}
function childSupportTick(){const p=state.player;(p.adultLife?.pregnancies||[]).filter(x=>x.born).forEach(x=>{if(x.supportMonthly>0){p.cash-=x.supportMonthly;state.logs.push(`👶 子女扶養支出 NT$${x.supportMonthly.toLocaleString()}。`)}else if(x.supportChoice==="拒絕撫養"&&Math.random()<.08){const demand=rand(50000,250000);x.publicExposure=true;triggerPrivateLifePRCrisis(x.name,"親子爆料");p.prCrisis.demand=demand;state.news.unshift(`${x.name}表示將公開親子爭議，並要求協商扶養責任。`)}})}
function ensurePublicImage(){const p=state.player;p.publicImage=p.publicImage||{traits:{穩健:0,自信:0,狂傲:0,護隊友:0,甩鍋:0,冷淡:0},haters:0};return p.publicImage}
function mediaTrait(t,n=1){const im=ensurePublicImage();im.traits[t]=(im.traits[t]||0)+n;im.haters=Math.max(0,Math.round(im.haters+(t==="狂傲"||t==="甩鍋"?rand(5,20):-rand(0,3))))}
function blackFanTick(){const p=state.player,im=ensurePublicImage();im.haters=Math.max(0,im.haters+rand(-2,4)+(p.followers>10000?1:0));if(im.haters>30&&Math.random()<clamp(im.haters/1200,.02,.18)){p.prCrisis={type:["舊聞翻出","斷章取義","私人爆料"][rand(0,2)],severity:rand(1,4)};state.news.unshift(`🚨 黑粉話題：有人整理夜鋒過往爭議，公關危機正在發酵。`)}}
function openPRResponse(){
 const p=state.player;if(!p.prCrisis)return;const crisis=p.prCrisis,privateIssue=/婚姻|離婚|親子|懷孕|私人|劈腿|不忠/.test(crisis.type||"");
 modal(`<h2>🚨 公關危機</h2><p>${crisis.type}</p><div class="reply-grid"><button class="reply pr-choice" data-a="apology">公開道歉</button><button class="reply pr-choice" data-a="evidence">提出證據澄清</button><button class="reply pr-choice" data-a="club">交由戰隊公關</button><button class="reply pr-choice" data-a="silent">保持沉默</button></div>`);
 document.querySelectorAll(".pr-choice").forEach(b=>b.onclick=()=>{
   const a=b.dataset.a,good=a==="evidence"?Math.random()<.65:a==="club"?Math.random()<.6:a==="apology"?Math.random()<.55:Math.random()<.25;
   if(privateIssue){
     if(good){if(a==="apology")changeEthics(2,"願意面對私人爭議並負責");ensurePublicImage().haters=Math.max(0,p.publicImage.haters-10);state.logs.push("🛡️ 私人爭議處理得當。此事件主要影響人品與公眾觀感，不直接扣職業風評。")}
     else{changeEthics(-rand(2,7),"私人爭議處理不當");ensurePublicImage().haters+=rand(4,12);state.logs.push("⚠️ 私人爭議處理失敗，人品與公眾觀感下降，但不直接扣職業風評。")}
   }else{
     if(good){changeCareerRep(2,"公關危機處理得當");ensurePublicImage().haters=Math.max(0,p.publicImage.haters-10);state.logs.push("🛡️ 職業公關危機處理得當，業界評價回升。")}
     else{changeCareerRep(-rand(2,7),"職業公關處理效果不佳");state.logs.push("⚠️ 職業公關處理效果不佳，職業風評下降。")}
   }
   p.prCrisis=null;save();document.querySelector('.modal-backdrop')?.remove();render();
 });
}
function contractDetails(c){completeContract(c);return `出賽率≥${c.requirements.appearance}%｜賽季${c.requirements.season}｜風評≥${c.requirements.reputation}｜Rank ${c.requirements.rank}｜違約金 NT$${c.buyout.toLocaleString()}`}
function poachingTick(){const p=state.player,pc=p.proCareer;if(!isProfessionalStage()||Math.random()>.035)return;const team=PRO_TEAMS.filter(x=>x!==pc.team)[rand(0,10)];pc.poachOffer={team,salary:Math.round((pc.contract.salary*rand(105,145)/100)/1000)*1000};state.messages.push({id:"poach-"+Date.now(),from:`${team} 經紀窗口`,text:`我們對你有興趣，初步薪資可到 NT$${pc.poachOffer.salary.toLocaleString()}。若仍有合約，必須走正式轉會程序。`,unread:true,resolved:true,type:"normal"});state.logs.push(`👀 ${team} 對夜鋒展開挖角。`)}
function openRecruitSuggestion(){const p=state.player,pc=p.proCareer,cands=Object.values(state.characters).filter(c=>c.isPro&&c.name!==p.name).slice(0,8);modal(`<h2>🧲 建議戰隊補強</h2><div class="reply-grid">${cands.map(c=>`<button class="reply recruit-choice" data-n="${c.name}">${c.name}｜${proIdentity(c.name)||c.role}</button>`).join("")}</div>${closeBtn()}`);document.querySelectorAll('.recruit-choice').forEach(b=>b.onclick=()=>{const n=b.dataset.n,rel=p.relations[n]||0,illegal=Math.random()<clamp((rel-40)/180,.03,.28);if(illegal){const fine=rand(30000,150000);p.cash-=fine;p.adultLife.careerReputation=clamp(p.adultLife.careerReputation-5,0,100);pc.suspension=rand(1,3);state.news.unshift(`⚖️ 聯盟認定夜鋒涉及不當私下招募，罰款 NT$${fine.toLocaleString()} 並禁賽 ${pc.suspension} 場。`)}else state.logs.push(`🧲 你向管理層推薦挖角 ${n}，戰隊將評估合約、轉會費與陣容需求。`);save();document.querySelector('.modal-backdrop')?.remove();render()})}
function rankCompetitionTick(){const p=state.player;if(!["宗師","菁英"].includes(p.rank))return;const decay=p.rank==="菁英"?rand(8,24):rand(3,12);p.lp=Math.max(0,p.lp-decay);state.logs.push(`📉 高端Rank競爭：本週其他玩家持續上分，你的排名積分相對回落 ${decay} LP。`);refreshLeaderboard()}
function professionalWeeklyTick(){const lp=ensureLifestyle();if(state.date.week%4===0){const ids=[...lp.assets.homes,...lp.assets.vehicles],cost=ids.reduce((sum,id)=>sum+(ASSET_CATALOG.find(x=>x.id===id)?.maint||0),0);if(cost){lp.cash=Math.max(0,lp.cash-cost);state.logs.push(`🏠 本期資產維護費 NT$${cost.toLocaleString()}。`)}}salaryTick();sponsorTick();sponsorMerchTick();childSupportTick();rankCompetitionTick();blackFanTick();poachingTick();maybeTeamEarlyRenewalOffer();ensureMeta();const p=state.player,pc=p.proCareer;if(pc.contract){completeContract(pc.contract);if(p.adultLife.careerReputation<pc.contract.requirements.reputation&&Math.random()<.2)state.logs.push("⚠️ 合約警告：目前職業風評低於戰隊要求。")}}
function professionalDailyTick(){if(!isProfessionalStage())return;salaryTick();if(state.player.proCareer.suspension>0&&isProMatchToday()){state.logs.push(`⛔ 你仍有 ${state.player.proCareer.suspension} 場禁賽處分。`)}}
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
function ensureProRoster(){
 const p=state.player,pc=p.proCareer;if(!pc?.team)return;pc.roster=pc.roster||[];pc.coaches=pc.coaches||[];
 const roles=["上路","打野","中路","ADC","輔助"],pr=p.role==="下路"?"ADC":p.role,pi=Math.max(0,roles.indexOf(pr)),baseNames=[...(PRO_ROSTER_NAMES[pc.team]||["韓曜辰","周凱文","季凌川","林承皓","江允澤"])];
 baseNames[pi]=p.name;pc.roster=baseNames.map((name,i)=>({name,role:roles[i],isPlayer:i===pi,relation:i===pi?100:(p.relations[name]??rand(48,68)),trust:i===pi?100:rand(48,70),chemistry:i===pi?100:rand(45,68)}));
 if(!pc.coaches.length){pc.coaches=coachNamesForTeam(pc.team,pc.region||"PCS");pc.coachJoinedYear=state.date.year}
 [...pc.roster,...pc.coaches].forEach(x=>{if(x.isPlayer)return;const isCoach=x.role.includes("教練");if(!state.characters[x.name])state.characters[x.name]={name:x.name,known:true,gender:"男",age:isCoach?32+stableAgeOffset(x.name,12):18+stableAgeOffset(x.name,10),role:x.role,isProStaff:isCoach,isPro:!isCoach,traits:[["冷靜","努力","直率","溫和"][stableAgeOffset(x.name,4)]]};const c=state.characters[x.name];c.known=true;c.socialContact=true;if(isCoach){c.isPro=false;c.isProStaff=true;c.identityType="教練";c.currentTeam=pc.team;c.currentRole=x.role;c.role=x.role;c.acquaintanceSource=`${pc.team} 戰隊`;delete c.formerTeam}p.relations[x.name]=p.relations[x.name]??x.relation??55;p.proFriends=p.proFriends||[];if(!p.proFriends.includes(x.name))p.proFriends.push(x.name)});
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
 LCK:["Seoul Crown","Busan Storm","Han River Fox","Incheon Nova"],
 LPL:["Shanghai Dragons","Beijing Pulse","Chengdu Blaze","Hangzhou Tide"],
 LEC:["Berlin Knights","Paris Arc","Madrid Solar","London Forge"],
 LCS:["LA Comets","New York Guard","Austin Rift","Seattle Waves"],
 PCS:["KNG Esports","Nova Gaming","Titan Core","Astra Five"]
};
const REGION_PRO_NAMES={
 LCK:["Park Min-jun","Kim Do-yun","Lee Hyun-woo","Choi Jun-seo","Jung Si-woo","Kang Tae-yang","Han Ji-ho","Yoon Seung-min","Seo Woo-jin","Lim Jae-hyun"],
 LPL:["陳景曜","周奕衡","林澤宇","顧承安","沈曜","葉子謙","唐昊然","蘇景川","許墨","江予辰"],
 LEC:["Luca Moretti","Noah Fischer","Elias Novak","Theo Martin","Milan Kovac","Oscar Lind","Leo Wagner","Hugo Costa","Felix Meyer","Adam Laurent"],
 LCS:["Ethan Cole","Ryan Park","Mason Lee","Logan Reed","Caleb Stone","Dylan Chen","Owen Brooks","Aiden Kim","Lucas Grant","Nate Wilson"],
 PCS:["沈奕辰","顧言澈","許哲宇","陸子昂","程以安","高宇謙","陳柏勳","葉知衡","吳昊恩","方子墨"]
};
function ensureGlobalProDatabase(){
 const p=state.player,pc=p.proCareer;pc.proDatabase=pc.proDatabase||{};const roles=["上路","打野","中路","ADC","輔助"];
 PRO_REGIONS.forEach(region=>{pc.proDatabase[region]=pc.proDatabase[region]||{};(GLOBAL_PRO_TEAMS[region]||[]).forEach((team,ti)=>{
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
 const m=slot.match(/^(LCK|LPL|LEC|LCS|PCS)\s+(Spring|Summer)\s+#(\d)$/i),region=m[1].toUpperCase(),rank=Number(m[3]),teams=GLOBAL_PRO_TEAMS[region]||[];
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
 {country:"韓國",city:"首爾"},{country:"韓國",city:"釜山"},{country:"日本",city:"東京"},{country:"中國",city:"上海"},
 {country:"中國",city:"成都"},{country:"法國",city:"巴黎"},{country:"英國",city:"倫敦"},{country:"美國",city:"洛杉磯"}
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
   c.birthYear=state.date.year-c.age;
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
function annualAgeAndDecline(year){
 const p=state.player;if(p.lastAgingYear===year)return;p.lastAgingYear=year;ensureAges();
 p.age++;Object.values(state.characters||{}).forEach(c=>{if(Number.isFinite(c.age))c.age++});
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
function chooseHost(kind,year){const it=ensureInternationalWorld(),key=kind==="MSI"?"msi":"worlds";if(!it[key]){const h=INTERNATIONAL_HOSTS[(year+kind.length)%INTERNATIONAL_HOSTS.length];it[key]={host:h,groups:[],stage:"尚未開始",qualified:false}}return it[key]}
function internationalRecoveryMultiplier(){const ph=proAnnualPhase();return (ph==="MSI"||ph==="世界賽")?.55:1}
function majorEventExperienceFactor(){
 const p=state.player,pc=p.proCareer,roster=pc.roster||[],rookies=roster.filter(x=>x.isPlayer?(p.internationalExperience?.世界賽||0)===0:((state.characters[x.name]?.proSinceYear||state.date.year)===state.date.year)).length;
 const exp=(p.internationalExperience?.世界賽||0)+(p.internationalExperience?.MSI||0)*.7;
 return clamp(exp*.018-rookies*.018,-.10,.10);
}
function buildInternationalTournament(kind){
 const pc=state.player.proCareer,ev=chooseHost(kind,state.date.year),myRegion=pc.region||"PCS",team=pc.team||"KNG Esports";if(ev.groups?.length)return ev;
 if(kind==="MSI"){const e=[];PRO_REGIONS.forEach(r=>e.push(r===myRegion?team:`${r} Spring #1`,`${r} Spring #2`));const u=[...new Set(e)].slice(0,10);ev.groups=[{name:"A",teams:u.filter((_,i)=>i%2===0),standings:[]},{name:"B",teams:u.filter((_,i)=>i%2===1),standings:[]}];ev.format="雙循環；各組前二晉級四強BO5";ev.stage="分組賽";}
 else{const e=[];PRO_REGIONS.forEach(r=>e.push(r===myRegion?team:`${r} Summer #1`,`${r} Summer #2`,`${r} Summer #3`));e.push(`${myRegion} Summer #4`);const u=[...new Set(e)];while(u.length<16)u.push(`Wildcard ${u.length+1}`);ev.groups=["A","B","C","D"].map((g,i)=>({name:g,teams:u.filter((_,j)=>j%4===i).slice(0,4),standings:[]}));ev.format="四組雙循環；各組前二晉級八強BO5";ev.stage="抽籤完成";}
 ev.groups.forEach(g=>g.teams=g.teams.map(actualTeamForSlot));
 return ev;
}
function internationalGroupsCard(){const ph=proAnnualPhase();if(!["MSI","世界賽"].includes(ph))return "";const ev=buildInternationalTournament(ph);return `<section class="card"><h2>🎲 ${ph}分組</h2>${ev.groups.map(g=>`<div class="notice"><strong>${g.name}組</strong><br>${g.teams.join("｜")}</div>`).join("")}<div class="small">${ev.format}</div></section>`;}
function internationalCard(){
 if(!isProfessionalStage())return "";const ph=proAnnualPhase(),it=ensureInternationalWorld(),p=state.player;if(ph!=="MSI"&&ph!=="世界賽")return "";
 const ev=chooseHost(ph,state.date.year);
 return `<section class="card"><h2>${ph==="MSI"?"🌍 MSI":"🌎 世界賽"}｜${state.date.year}</h2><div class="notice">📍 ${ev.host.country}・${ev.host.city}<br>${ph==="MSI"?"10隊｜A/B兩組各5隊｜雙循環｜各組前2晉級BO5淘汰賽":"16隊｜A/B/C/D四組各4隊｜雙循環｜各組前2晉級BO5淘汰賽"}</div><p class="small">國際大賽期間版本適應、大賽經驗與壓力權重提高；體力與壓力恢復速度約為聯賽期的55%。海外活動也可能帶來國外粉絲、媒體與新的社交邂逅。</p></section>`;
}
function maybeInternationalSocial(){
 const ph=proAnnualPhase();if(!isProfessionalStage()||(ph!=="MSI"&&ph!=="世界賽")||Math.random()>.075)return;
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
 state.logs.push(`🏆 ${year}年度頒獎完成：五大賽區評選最佳戰隊、最佳教練、五路最佳選手、年度MVP與最佳新秀。${awards.length?`夜鋒獲得：${awards.join("、")}`:""}`);
}
function internationalQualificationRules(){
 return {MSI:"五大賽區春季季後賽前二，共10隊；A/B兩組各5隊雙循環，各組前二進BO5淘汰賽。",
 WORLDS:"五大賽區夏季季後賽前三共15隊＋MSI冠軍保障1席。若MSI冠軍已在夏季前三，由該賽區夏季第4名遞補；固定16隊。四組各4隊雙循環，各組前二進BO5八強。"};
}
function annualCalendarCard(){
 if(!isProfessionalStage())return "";const ph=proAnnualPhase(),m=careerMonthFromWeek(state.date.week);
 return `<section class="card"><h2>🗓️ 職業年度賽曆</h2><div class="notice">目前：${m}月｜${ph}</div><div class="small">1月冬季轉會｜2–4月春季聯賽22場｜5月春季季後賽｜6月MSI｜7月夏季轉會｜8–10月夏季聯賽22場｜11月夏季季後賽｜12月世界賽<br>${internationalQualificationRules().MSI}<br>${internationalQualificationRules().WORLDS}</div></section>`;
}
function buildSeasonScheduleByCalendar(seasonName){
 const pc=state.player.proCareer,sn=pc.season;if(!sn)return;const months=seasonName==="春季"?[2,4]:[8,10],range1=monthWeekRange(months[0]),range2=monthWeekRange(months[1]),start=range1[0],end=range2[1],slots=[];
 for(let w=start;w<=end;w++){slots.push([w,3],[w,6])}
 const opponents=sn.teams.filter(x=>x.name!==pc.team),chosen=slots.slice(0,22);
 sn.schedule=chosen.map((x,i)=>({id:`${seasonName}-REG-${i+1}`,phase:"例行賽",season:seasonName,round:i+1,year:state.date.year,week:x[0],day:x[1],opp:opponents[i%11].name,bo:3,played:false}));
 sn.seasonName=seasonName;sn.phase="例行賽";
}
function syncAnnualCompetition(){
 if(!isProfessionalStage()||state.player.proCareer.stage!=="starter")return;const pc=state.player.proCareer,ph=proAnnualPhase();
 if((ph==="春季聯賽"||ph==="夏季聯賽")){
  const seasonName=ph.startsWith("春")?"春季":"夏季";
  if(!pc.season||pc.season.seasonName!==seasonName||pc.season.year!==state.date.year){
   let teams=PRO_TEAMS.map(name=>({name,w:0,l:0,gw:0,gl:0}));pc.season={year:state.date.year,seasonName,week:1,phase:"例行賽",teams,matchesPlayed:0,myMatches:0,playoffs:false,champion:null,schedule:[]};buildSeasonScheduleByCalendar(seasonName);
  }
 }
 if(ph==="MSI")chooseHost("MSI",state.date.year);if(ph==="世界賽")chooseHost("世界賽",state.date.year);
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
 const pc=state.player.proCareer,ev=buildInternationalTournament(ph),team=pc.team;
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
   const slots=ph==="世界賽"?[[51,2],[51,5],[52,3]]:[[25,6],[26,3]];
   const labels=ph==="世界賽"?["八強","四強","決賽"]:["四強","決賽"];
   const opps=ph==="世界賽"?["LCK Summer #1","LPL Summer #1","LEC Summer #1"]:["LCK Spring #1","LPL Spring #1"];
   slots.forEach((x,i)=>ev.schedule.push({id:`${ph}-KO-${i+1}`,phase:`${ph}${labels[i]}`,international:true,event:ph,knockout:true,round:i+1,year:state.date.year,week:x[0],day:x[1],opp:opps[i],bo:5,played:false}));
   state.news.unshift(`🌍 ${pc.team} 從 ${ph} 分組賽晉級淘汰賽！`);
 }
}

const REGION_STRENGTH={LCK:92,LPL:89,LEC:83,LCS:79,PCS:75};
function teamRegion(name){for(const r of PRO_REGIONS)if(String(name).includes(r))return r;return state.player.proCareer.region||"PCS"}
function regionMatchAdjustment(opp){const mine=REGION_STRENGTH[state.player.proCareer.region||"PCS"]||75,theirs=REGION_STRENGTH[teamRegion(opp)]||82;return clamp((mine-theirs)*.009,-.16,.12)}
function offFieldMatchAdjustment(){const p=state.player,pc=p.proCareer;let x=0;x+=(p.mood-60)*.0015+(p.energy-60)*.002-(p.stress-45)*.0025;x+=(pc.lockerRoom-60)*.0015;if(p.prCrisis)x-=.05;if(p.condition?.injury)x-=.06;if((p.condition?.fatigue||0)>70)x-=.05;return clamp(x,-.22,.12)}
function runInternationalMatch(){
 const p=state.player,pc=p.proCareer,ev=ensureInternationalSchedule(),m=currentInternationalMatch();if(!ev||!m)return;
 const chem=teamChemistry(),inj=p.condition.injury?-.07:0,lifeAdj=clamp((p.energy-60)*.0015+(p.mood-60)*.0012-(p.stress-35)*.0018,-.18,.12);
 const metaAdj=playerMetaFit()*.028,expAdj=majorEventExperienceFactor(),regionAdj=regionMatchAdjustment(m.opp),offAdj=offFieldMatchAdjustment(),need=m.bo===1?1:3;let my=0,his=0,logs=[],g=0;
 const fakeOpp={name:m.opp};
 while(my<need&&his<need){g++;const wc=clamp(.45+(avg()-72)*.009+(chem-55)*.0018+inj+lifeAdj+metaAdj+expAdj+regionAdj+offAdj,.10,.76),win=Math.random()<wc;if(win)my++;else his++;logs.push(...richGameEvents(g,fakeOpp,win))}
 m.played=true;const win=my>his;if(m.phase.includes("分組")){ev.playerRecord.w+=win?1:0;ev.playerRecord.l+=win?0:1}
 p.internationalExperience[m.event]=(p.internationalExperience[m.event]||0)+1;if(m.bo===5)p.internationalExperience.國際BO5=(p.internationalExperience.國際BO5||0)+1;
 if(m.knockout&&!win){ev.eliminated=true;ev.stage=`${m.phase}淘汰`;const title=m.event==="世界賽"?m.phase.replace("世界賽","世界賽"):`${m.event}${m.phase.replace(m.event,"")}`;if(m.event==="世界賽"&&/八強|四強/.test(m.phase))addAchievement(`world-${m.phase}`,m.phase,`${state.date.year}國際賽`,state.date.year,false)}
 if(m.knockout&&win&&/決賽/.test(m.phase)){ev.champion=true;ev.stage="冠軍";addAchievement(`${m.event}-champion`,`${m.event}冠軍`,`${pc.team}奪冠`,state.date.year,false);if(m.event==="世界賽")applyWorldChampionContractBoost()}
 const k=rand(win?4:1,win?11:7),d=rand(1,7),as=rand(4,15),cs=rand(235,365),mvp=win&&Math.random()<.3;
 pc.careerStats.matches++;pc.careerStats.seriesW+=win?1:0;pc.careerStats.seriesL+=win?0:1;pc.careerStats.gameW+=my;pc.careerStats.gameL+=his;pc.careerStats.kills+=k;pc.careerStats.deaths+=d;pc.careerStats.assists+=as;pc.careerStats.mvp+=mvp?1:0;
 pc.matchHistory.unshift({opp:m.opp,score:`${my}:${his}`,win,k,d,a:as,cs,mvp,week:state.date.week,event:m.event,phase:m.phase});
 pc.lastMatch={opp:m.opp,win,score:`${my}:${his}`,logs:[...logs],k,d,a:as,cs,mvp,event:m.event,phase:m.phase,year:state.date.year,week:state.date.week,day:state.date.day,postInterviewDone:false};
 pc.pendingPostInterview=true;
 const stageLoad=m.knockout?(/決賽/.test(m.phase)?12:8):4,gameLoad=(my+his)*3;p.energy=clamp(p.energy-(10+gameLoad+stageLoad),0,100);p.condition.fatigue=clamp(p.condition.fatigue+14+gameLoad+stageLoad,0,100);p.stress=clamp(p.stress+(win?4:9)+stageLoad,0,100);updateTeamRelationsAfterMatch(win);updateProfessionalReputation(win,mvp);
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
function schedulePlayoffMatch(){
 const pc=state.player.proCareer,sn=pc.season;if(!sn||sn.phase!=="季後賽")return;
 const opp=currentProOpponent();if(!opp)return;
 let w=state.date.week,y=state.date.year,d=6;
 // 下一個週六；若今天已是週六則排下一週，確保有明確準備時間。
 if(state.date.day>=6){w++;if(w>52){w=1;y++}}
 sn.playoffSchedule={id:`PO-${(sn.playoffRound||0)+1}`,phase:"季後賽",round:(sn.playoffRound||0)+1,year:y,week:w,day:d,opp:opp.name,bo:5,played:false};
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
 const sorted=[...sn.teams].sort((a,b)=>(b.w-a.w)||((b.gw-b.gl)-(a.gw-a.gl))),seed=sorted.findIndex(x=>x.name===pc.team)+1;
 sn.playoffs=true;sn.phase=seed<=8?"季後賽":"賽季結束";sn.seed=seed;sn.playoffRound=seed<=8?0:null;sn.playoffWins=0;
 if(seed<=8)state.news.unshift(`${pc.team} 以例行賽第 ${seed} 名晉級季後賽，接下來全面採 BO5。`);
 else state.news.unshift(`${pc.team} 例行賽排名第 ${seed}，無緣季後賽。`);
}
function currentProOpponent(){
 const pc=state.player.proCareer,sn=pc.season;if(!sn)return null;
 if(sn.phase==="例行賽"){const m=currentScheduledProMatch();return m?sn.teams.find(x=>x.name===m.opp):null;}
 if(sn.phase==="季後賽"){
   const sorted=[...sn.teams].sort((a,b)=>(b.w-a.w)||((b.gw-b.gl)-(a.gw-a.gl))),candidates=sorted.filter(x=>x.name!==pc.team);
   const targets=[sn.seed<=4?8-sn.seed:9-sn.seed,rand(0,Math.min(5,candidates.length-1)),rand(0,Math.min(3,candidates.length-1))];
   return candidates[Math.max(0,Math.min(candidates.length-1,targets[sn.playoffRound]??0))];
 }
 return null;
}
function startPreMatchMedia(){
 const pc=state.player.proCareer,sn=pc.season;if(!sn||pc.stage!=="starter")return;
 const guard=proMatchDueGuard();if(!guard.ok){modal(`<h2>📅 尚未到比賽日</h2><p>${guard.msg}</p>${closeBtn()}`);return}
 preparePlayoffs();const scheduled=currentScheduledProMatch(),opp=scheduled?.international?{name:scheduled.opp}:currentProOpponent();if(!opp){modal(`<h2>🏆 賽季</h2><p>目前沒有待進行的正式比賽。</p>${closeBtn()}`);return;}
 modal(`<h2>🎙️ 賽前媒體</h2><p>記者：「今天對上 <strong>${opp.name}</strong>，你怎麼看這場比賽？」</p>
 <div class="reply-grid"><button class="reply pre-media" data-a="humble">尊重對手，做好自己</button><button class="reply pre-media" data-a="confident">我們準備好贏下比賽</button><button class="reply pre-media" data-a="trash">希望他們撐得過對線</button><button class="reply pre-media" data-a="humble">版本很重要，我們會尊重每個對手</button><button class="reply pre-media" data-a="confident">我相信我們的訓練成果</button></div>${closeBtn()}`);
 document.querySelectorAll(".pre-media").forEach(b=>b.onclick=()=>applyPreMedia(b.dataset.a,opp.name));
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
function runRichLeagueMatch(){
 const p=state.player,pc=p.proCareer,sn=pc.season;if(!sn||pc.stage!=="starter")return;
 preparePlayoffs();
 sn.teams=Array.isArray(sn.teams)?sn.teams:[];
 let me=sn.teams.find(x=>x.name===pc.team);
 if(!me){me={name:pc.team,w:0,l:0,gw:0,gl:0};sn.teams.push(me)}
 let opp=currentProOpponent();
 const scheduled=currentScheduledProMatch();
 if(!opp&&scheduled?.opp){opp=sn.teams.find(x=>x.name===scheduled.opp)||{name:scheduled.opp,w:0,l:0,gw:0,gl:0};if(!sn.teams.includes(opp))sn.teams.push(opp)}
 if(!opp){modal(`<h2>⚠️ 賽程修復</h2><p>找不到本場對手資料，已保留賽程，請重新進入比賽。</p>${closeBtn()}`);save();return}
 const chem=teamChemistry(),inj=p.condition.injury?-.07:0;const lifeAdj=clamp((p.energy-60)*.0015+(p.mood-60)*.0012-(p.stress-35)*.0015,-.16,.12),metaAdj=playerMetaFit()*.004;
 const major=["MSI","世界賽"].includes(proAnnualPhase()),majorAdj=major?majorEventExperienceFactor()+playerMetaFit()*.018-(p.stress-50)*.002:0;
 const need=sn.phase==="季後賽"?3:2;let my=0,his=0,logs=[],games=0;
 while(my<need&&his<need){games++;const wc=clamp(.50+(avg()-68)*.012+(p.condition.form-60)*.003+(chem-50)*.002+inj+lifeAdj+metaAdj+majorAdj,.18,.84),win=Math.random()<wc;if(win)my++;else his++;logs.push(...richGameEvents(games,opp,win))}
 if(sn.phase==="例行賽"){const sched=currentScheduledProMatch();if(sched)sched.played=true;me.w+=my>his?1:0;me.l+=my>his?0:1;me.gw+=my;me.gl+=his;opp.w+=my>his?0:1;opp.l+=my>his?1:0;opp.gw+=his;opp.gl+=my;sn.myMatches++;sn.matchesPlayed++;simulateOtherLeagueRound(me,opp);if(sn.myMatches>=22){preparePlayoffs();if(sn.phase==="季後賽")schedulePlayoffMatch();}}
 else if(sn.phase==="季後賽"){if(sn.playoffSchedule)sn.playoffSchedule.played=true;sn.matchesPlayed++;if(my>his){sn.playoffRound++;if(sn.playoffRound>=3){sn.phase="世界賽資格";sn.champion=pc.team;sn.playoffSchedule=null;state.news.unshift(`🏆 ${pc.team} 奪下聯賽冠軍，取得世界賽資格！`)}else{state.news.unshift(`🏆 ${pc.team} 贏下季後賽 BO5，晉級下一輪。`);schedulePlayoffMatch()}}else{sn.phase="賽季結束";sn.playoffSchedule=null;state.news.unshift(`${pc.team} 在季後賽遭淘汰，本季旅程結束。`)}}
 const cs=rand(245,360),k=rand(my>his?4:1,my>his?10:6),d=rand(1,6),a=rand(5,14),mvp=my>his&&Math.random()<.28;
 pc.careerStats.matches++;pc.careerStats.seriesW+=my>his?1:0;pc.careerStats.seriesL+=my>his?0:1;pc.careerStats.gameW+=my;pc.careerStats.gameL+=his;pc.careerStats.kills+=k;pc.careerStats.deaths+=d;pc.careerStats.assists+=a;pc.careerStats.mvp+=mvp?1:0;
 pc.matchHistory.unshift({opp:opp.name,score:`${my}:${his}`,win:my>his,k,d,a,cs,mvp,week:state.date.week});
 p.condition.form=clamp(p.condition.form+(my>his?rand(1,4):-rand(2,5)),0,100);p.condition.fatigue=clamp(p.condition.fatigue+12,0,100);
 state.news.unshift(`職業聯賽：${pc.team} ${my}:${his} ${opp.name}；${p.name} ${k}/${d}/${a}${mvp?"，獲選MVP":""}。`);
 pc.lastMatch={opp:opp.name,win:my>his,score:`${my}:${his}`,logs:[...logs],k,d,a,cs,mvp,year:state.date.year,week:state.date.week,day:state.date.day,phase:sn.phase||"正式比賽",postInterviewDone:false};
 pc.pendingPostInterview=true;
 updateTeamRelationsAfterMatch(my>his);updateProfessionalReputation(my>his,mvp);
 state.logs.push(`🏆 正式賽事：${pc.team} ${my}:${his} ${opp.name}｜系列賽${my>his?"勝":"負"}｜累計 ${me.w}勝${me.l}敗。`);
 save();render();showMatchReport();
}
function simulateOtherLeagueRound(me,opp){const sn=state.player.proCareer.season;sn.teams.filter(x=>x!==me&&x!==opp).forEach((t,i,a)=>{if(i%2)return;const o=a[i+1];if(!o)return;const home=Math.random()<.5,w=home?t:o,l=home?o:t,lg=Math.random()<.45?1:0;w.w++;l.l++;w.gw+=2;w.gl+=lg;l.gw+=lg;l.gl+=2})}
function showMatchReport(){
 const m=state.player.proCareer.lastMatch;if(!m)return;
 modal(`<h2>🏆 ${state.player.proCareer.team} ${m.score} ${m.opp}</h2><div class="log">${m.logs.join("<br>")}</div><div class="notice">${state.player.name}｜KDA ${m.k}/${m.d}/${m.a}｜CS ${m.cs}${m.mvp?"｜⭐ MVP":""}</div><button id="postMedia" class="primary">🎙️ 接受賽後採訪</button>${closeBtn()}`);
 document.querySelector("#postMedia").onclick=showPostMatchMedia;
}
function recentProMatchCard(){
 if(!isProfessionalStage())return "";const pc=state.player.proCareer,m=pc.lastMatch,cs=pc.careerStats||{};
 if(!m)return `<section class="card"><h2>📋 比賽紀錄</h2><div class="small">目前尚無正式比賽紀錄。</div></section>`;
 return `<section class="card"><div class="row space"><h2>📋 最近一場正式比賽</h2><span class="badge">${m.win?"勝利":"敗北"}</span></div>
 <div class="notice"><strong>${pc.team} ${m.score} ${m.opp}</strong><br>${m.phase||"正式比賽"}｜KDA ${m.k}/${m.d}/${m.a}｜CS ${m.cs}${m.mvp?"｜⭐ MVP":""}</div>
 <div class="stat-grid">${stat("生涯系列賽",`${cs.seriesW||0}勝${cs.seriesL||0}敗`)}${stat("生涯小局",`${cs.gameW||0}勝${cs.gameL||0}敗`)}${stat("正式場次",cs.matches||0)}${stat("MVP",cs.mvp||0)}</div>
 <div class="reply-grid"><button id="viewLastMatchReport" class="reply">查看完整戰報</button>${pc.pendingPostInterview&&!m.postInterviewDone?`<button id="resumePostInterview" class="reply">🎙️ 完成賽後採訪</button>`:""}</div></section>`;
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
function ensureContractMarket(){
 const p=state.player,pc=p.proCareer,c=pc.contract;if(!isProfessionalStage()||!c)return;
 completeContract(c);const elapsed=(state.date.year-c.start.year)*52+(state.date.week-c.start.week);if(elapsed<(c.lengthWeeks||52)||pc.contractMarketYear===state.date.year)return;
 pc.contractMarketYear=state.date.year;pc.freeAgentOffers=[];pc.stage="freeagent";
 const regions=["LCK","LPL","LEC","LCS","PCS"],worldChamp=(pc.worldChampionYear===state.date.year||pc.worldChampionYear===state.date.year-1),base=avg()+p.adultLife.careerReputation*.12+(pc.careerStats?.mvp||0)*.7+(worldChamp?18:0);
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
}function contractCenter(){
 const p=state.player,pc=p.proCareer,c=pc.contract||{};if(!isProfessionalStage())return "";
 completeContract(c);const elapsed=(state.date.year-(c.start?.year||state.date.year))*52+(state.date.week-(c.start?.week||state.date.week)),remainWeeks=Math.max(0,(c.lengthWeeks||52)-elapsed),remainYears=Math.ceil(remainWeeks/52);return `<section class="card"><h2>📄 合約／轉會</h2><div class="stat-grid">${stat("月薪",`NT$${Number(c.salary||0).toLocaleString()}`)}${stat("合約",`${c.years||1}年｜剩約${remainYears}年`)}${stat("身份",pc.stage==="starter"?"一軍":pc.stage==="sub"?"替補":"青訓")}${stat("違約金",`NT$${c.buyout.toLocaleString()}`)}${stat("更衣室",Math.round(pc.lockerRoom||65))}</div><div class="notice">${contractDetails(c)}</div><div class="reply-grid"><button id="askRaise" class="reply">💰 要求加薪</button><button id="offerCut" class="reply">🤝 降薪留隊</button><button id="requestTransfer" class="reply">🔄 要求轉會</button><button id="earlyRenewal" class="reply">📝 洽談提前續約</button><button id="suggestRecruit" class="reply">🧲 建議挖角選手</button>${p.prCrisis?`<button id="prAction" class="reply">🚨 處理公關危機</button>`:""}</div></section>`;
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
  const last=pc.negotiation.raiseWeek||0;if(now-last<4){state.logs.push(`💬 距離上次加薪談判太近，管理層要求至少再等 ${4-(now-last)} 週。`);save();render();return}
  pc.negotiation.raiseWeek=now;
  const want=Math.round((c.salary||50000)*1.25/1000)*1000;
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
  if(roll<chance){pc.transferRequest={status:"同意尋找買家",week:state.date.week};state.logs.push(`🔄 轉會申請獲准（成功率約 ${Math.round(chance*100)}%）。戰隊同意聽取其他隊伍報價，但仍不代表一定有人出價。`)}
  else{pc.transferRequest={status:"暫時拒絕",week:state.date.week};pc.coachTrust=clamp(pc.coachTrust-rand(1,4),0,100);state.logs.push(`⛔ 轉會申請遭拒（成功率約 ${Math.round(chance*100)}%）。戰隊目前不願放人。`)}
 }
 save();render();
}
function maybeTeammateConflict(){
 const p=state.player,pc=p.proCareer;if(!isProfessionalStage()||Math.random()>.08)return;const mates=(pc.roster||[]).filter(x=>!x.isPlayer);if(!mates.length)return;const x=mates[rand(0,mates.length-1)],rel=p.relations[x.name]||50;if(rel<35){state.logs.push(`⚠️ 更衣室：你與 ${x.name} 的關係持續惡化，管理層開始擔心有人會要求離隊。`);if(rel<22&&Math.random()<.25){x.wantsOut=true;state.news.unshift(`${pc.team} 內部傳出陣容不合消息，${x.name}可能考慮離隊。`)}}else if(rel>75){state.logs.push(`🤝 ${x.name}與你在團練中配合出色，隊伍默契提升。`)}}
const PRO_TEAMS=["KNG Esports","Nova Gaming","Titan Core","Astra Five","Vortex","Eclipse","Phoenix","Orion","Tempest","Mirage","Vertex","Radiant"];
function formLabel(){const v=state.player.condition?.form||65;return v>=85?"🔥 火熱":v>=70?"良好":v>=55?"普通":v>=40?"低迷":"極差"}
function proCareerTick(){
 const p=state.player,pc=p.proCareer;if(p.adultLife?.graduationPath!=="職業圈"||["starter","academy","sub"].includes(pc.stage))return;
 pc.stage=pc.stage==="amateur"?"scouting":pc.stage;
 if(pc.stage==="scouting"&&Math.random()<.16+Math.min(.18,p.proAttention/300)){const team=PRO_TEAMS[rand(0,PRO_TEAMS.length-1)];pc.stage="contact";state.messages.push({id:"scout-"+Date.now(),from:`${team} 星探`,text:`我們觀察你一段時間了，想邀請你參加 ${team} 的試訓。`,unread:true,resolved:true,type:"normal"});state.logs.push(`🔎 ${team} 星探主動接觸你，提出試訓邀請。`);pc.tryout={team,status:"待試訓"}}
}
function proCareerCard(){
 const p=state.player,pc=p.proCareer;if(p.adultLife?.graduationPath!=="職業圈")return "";
 if(pc.stage==="contact"&&pc.tryout)return `<section class="card"><h2>🔎 職業試訓</h2><p>${pc.tryout.team} 邀請你參加試訓。</p><button id="doTryout" class="primary">參加試訓</button></section>`;
 if(pc.stage==="offer"&&pc.contract)return `<section class="card"><h2>📄 合約報價</h2><p>${pc.contract.team}｜${pc.contract.type}｜月薪 NT$${pc.contract.salary.toLocaleString()}</p><div class="reply-grid"><button id="signProContract" class="primary">接受並簽約</button><button id="counterOffer" class="reply">💰 要求加薪25%</button><button id="declineOffer" class="reply">拒絕／等待其他隊伍</button></div></section>`;
 if(["starter","sub","academy"].includes(pc.stage)){const cs=pc.careerStats||{seriesW:0,seriesL:0,gameW:0,gameL:0,matches:0,mvp:0};return `<section class="card"><h2>🏢 ${pc.team}</h2><div class="stat-grid">${stat("身份",pc.stage==="academy"?"青訓":pc.stage==="sub"?"替補":"一軍")}${stat("競技狀態",formLabel())}${stat("教練信任",Math.round(pc.coachTrust))}${stat("職業風評",Math.round(p.adultLife.careerReputation))}${stat("人品",Math.round(p.ethics??65))}${stat("本季大場",`${cs.seriesW}勝${cs.seriesL}敗`)}${stat("MVP",cs.mvp||0)}</div>${pc.stage==="academy"?`<div class="notice">青訓選手目前沒有正式聯賽出賽資格，需透過訓練與教練評價爭取升上一軍。</div>`:leagueCard()}</section>`;}
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
function initProSeason(){const pc=state.player.proCareer;if(!pc.season){let teams=PRO_TEAMS.map(name=>({name,w:0,l:0,gw:0,gl:0}));pc.season={week:1,phase:"例行賽",teams,matchesPlayed:0,myMatches:0,playoffs:false,champion:null,schedule:[]}}pc.careerStats=pc.careerStats||{seriesW:0,seriesL:0,gameW:0,gameL:0,matches:0,mvp:0,kills:0,deaths:0,assists:0};buildProRegularSchedule()}
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
  if(["確認懷孕","決定繼續","對方決定繼續"].includes(pg.status)){pg.progressWeeks=(pg.progressWeeks||0)+1/7;if(pg.progressWeeks>=40&&!pg.born&&!pg.birthPending){pg.birthPending=true;pg.status="即將生產";state.messages.push({id:"labor-"+Date.now()+i,from:pg.name,text:"醫院說差不多要生了。你會過來陪我嗎？",unread:true,resolved:true,type:"birth"});state.logs.push(`🏥 ${pg.name}進入生產階段，等待你決定是否陪產。`)}}
  if(pg.born&&!(p.romance?.partners||[]).includes(pg.name)){pg.singleMother=true;if((p.followers||0)>50000&&!pg.exposureChecked&&Math.random()<.015){pg.exposureChecked=true;const responsible=(pg.supportScore||0)>=3;if(!responsible){p.adultLife.careerReputation=clamp(p.adultLife.careerReputation-rand(8,15),0,100);state.news.unshift(`場外爭議：${pg.name}公開批評成名後的夜鋒未妥善面對過去的親子責任。`)}else state.news.unshift(`私人生活曝光：夜鋒已有孩子的消息受到關注，但長期扶養紀錄讓輿論相對平和。`)}}
 });
}
function pregnancyCard(){const p=state.player,arr=(p.adultLife?.pregnancies||[]).filter(x=>["確認懷孕","決定繼續","對方決定繼續","即將生產","孩子已出生"].includes(x.status));if(!arr.length)return "";return `<section class="card"><h2>家庭／親子事件</h2>${arr.map(x=>`<div class="schedule-item"><div><strong>${x.name}</strong><div class="small">${x.status}${x.born?`｜扶養：${x.supportChoice||"尚未決定"}`:`｜約 ${Math.floor(x.progressWeeks||0)}/40 週`}</div></div>${x.born?`<div>${!x.birthChoice?`<button class="ghost legacy-birth-choice" data-name="${x.name}" data-choice="陪產">補登：當時有陪產</button><button class="ghost legacy-birth-choice" data-name="${x.name}" data-choice="工作">補登：當時未陪產</button>`:""}${!x.supportChoice?`<button class="ghost child-choice" data-name="${x.name}" data-choice="共同撫養">共同照顧</button><button class="ghost child-choice" data-name="${x.name}" data-choice="經濟扶養">扶養費／媽媽照顧</button><button class="ghost child-choice" data-name="${x.name}" data-choice="拒絕撫養">不參與照顧</button>`:`<span class="small">已決定：${x.supportChoice}</span>`}</div>`:x.birthPending?`<button class="ghost birth-event" data-name="${x.name}">🏥 處理生產事件</button>`:`<button class="ghost pregnancy-talk" data-name="${x.name}">討論後續</button>`}</div>`).join("")}</section>`}
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
function chooseSocial(){
 ensureV10();if(isProfessionalStage())ensureProRoster();if(remain()<1){modal(`<h2>今天沒有剩餘時段</h2><p>社交需要 1 個時段。</p>${closeBtn()}`);return}
 const people=Object.values(state.characters||{}).filter(c=>c&&c.known&&c.name&&c.name!==state.player.name&&!isPlaceholderPersonName(c.name)&&proSocialAllowed(c)).sort((a,b)=>Number(!!b.isProStaff)-Number(!!a.isProStaff)),main=document.querySelector("#main");
 main.innerHTML=`<section class="card"><div class="row space"><h2>👥 社交／閒聊</h2><button id="socialReturn" class="ghost">← 返回</button></div><p class="small">選擇要互動的角色。</p><div class="social-page-grid">${people.map(c=>`<button type="button" class="choice social-person-page" data-person="${c.name}"><strong>找 ${c.name}</strong><span class="small">${relationTier(state.player.relations?.[c.name]||0,c.name)} · ${Math.round(state.player.relations?.[c.name]||0)} · ${Number.isFinite(c.age)?c.age+"歲 · ":""}${safeTraits(c).join("、")||"個性尚未熟悉"} · ${socialProfileMeta(c.name).identity} · ${socialProfileMeta(c.name).relationship}</span></button>`).join("")}</div><button id="socialFive" class="btn secondary" style="width:100%;margin-top:12px">揪朋友五排開黑</button></section>`;
 document.querySelector("#socialReturn")?.addEventListener("click",render);document.querySelector("#socialFive")?.addEventListener("click",friendFiveStack);
 document.querySelectorAll(".social-person-page").forEach(b=>b.addEventListener("click",()=>openSocialPersonPage(b.dataset.person)));
}
function openSocialPersonPage(name){
 const c=state.characters?.[name];if(!c){chooseSocial();return}
 const rel=state.player.relations?.[name]||0,female=c.gender==="女",esports=isEsportsFriend(name),dating=(state.player.romance?.partners||[]).includes(name),pro=isProFriend(name),staff=!!c.isProStaff;
 let acts=staff?[["coachTactics","🧠 討論戰術"],["coachEval","📋 詢問近期評價"],["coachRole","🎯 討論先發競爭"]]:female?[["chat","聊天散步"],["food","一起吃飯"],["cafe","咖啡廳"],["movie","看電影"],["date","正式約會"],["confess","💗 告白"]]:[["food","吃飯聊天"],["arcade","去電競館"],["hangout","逛街／閒晃"],["game","一起打遊戲"],["latefood","吃宵夜"]];
 if(!staff&&esports)acts.splice(1,0,["duo","Rank雙排"]);if(!staff&&dating)acts.push(["communicate","💬 感情溝通"]);
 const spouse=state.player.romance?.spouse===name,isFwb=c.relationshipType==="炮友"||name==="許安然";
 if(!staff&&state.player.age>=18&&female&&Number(c.age||18)>=18){if(spouse)acts.push(["intimate","❤️ 夫妻親密時光"]);else if(dating)acts.push(["intimate","❤️ 親密相處"]);else acts.push(["private",isFwb?"🌙 炮友見面（NT$3,000）":"🌙 詢問私人約會"])}
 if(!staff&&dating)acts.push(["breakup","💔 提出分手"]);if(!staff&&pro)acts.push(["spar","⚔️ 與職業選手切磋"]);
 document.querySelector("#main").innerHTML=`<section class="card"><div class="row space"><h2>${female?"💗":"🤝"} ${name}</h2><button id="socialBack" class="ghost">← 換人</button></div><p class="small">關係值 ${Math.round(rel)}｜性別：${c.gender}｜個性：${safeTraits(c).join("、")||"尚未熟悉"}<br>身分：${socialProfileMeta(name).identity}｜認識來源：${socialProfileMeta(name).source}｜目前關係：${socialProfileMeta(name).relationship}${socialProfileMeta(name).special?`｜特殊關係：${socialProfileMeta(name).special}`:""}${pro?`｜${c.rank||"宗師"} ${c.lp||""} LP`:""}</p>${pro?`<div class="notice goodtext">⚔️ 已解鎖職業選手切磋，可直接在下方選擇。</div>`:""}<div class="social-page-grid">${acts.map(a=>`<button type="button" class="choice social-act-page" data-act="${a[0]}" ${(a[0]==="date"&&rel<75&&!dating)||(a[0]==="confess"&&(rel<75||dating))?"disabled":""}><strong>${a[1]}</strong></button>`).join("")}</div></section>`;
 document.querySelector("#socialBack")?.addEventListener("click",chooseSocial);document.querySelectorAll(".social-act-page").forEach(b=>b.addEventListener("click",()=>b.dataset.act.startsWith("coach")?coachSocialActivity(name,b.dataset.act):b.dataset.act==="confess"?resolveRomance(name,"confess"):b.dataset.act==="communicate"?relationshipTalk(name):b.dataset.act==="spar"?sparWithPro(name):b.dataset.act==="intimate"?adultEstablishedPartnerEvent(name):b.dataset.act==="private"?attemptConsensualPrivateEvent(name,name==="許安然"?"fwb":"social"):b.dataset.act==="breakup"?requestBreakup(name):socialActivity(name,b.dataset.act)));
}
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
  p.relations[name]=clamp(rel-rand(40,60),0,100);p.mood=clamp(p.mood-28,0,100);p.stress=clamp(p.stress+24,0,100);if(Math.random()<.35)p.prCrisis={type:"劈腿分手後互相指控",severity:rand(1,4),source:name};
  p.emotion={betrayalUntil:state.date.week+2,betrayalBy:name};
  state.world.rumors.unshift(`${name} 被人看到和別人過度親密，你們的感情因此破裂。`);
  state.logs.push(`💔 ${name} 劈腿。夜鋒受到很大打擊，未來兩週Rank與比賽發揮下降。`);
  state.messages.push({id:"betray-"+Date.now(),from:name,text:"對不起……我做了很傷你的事。我們可能沒辦法再像以前一樣了。",unread:true,resolved:true,type:"normal"});
  break;
 }
}
function offFieldFactorTick(){
 if(!isProfessionalStage())return;const p=state.player,pc=p.proCareer;if(Math.random()>.07)return;
 const e=["睡眠品質不佳","贊助商臨時追加拍攝","直播言論被截圖討論","交通延誤影響訓練","隊友爭吵","感情訊息影響專注","黑粉洗版","合約談判分心"][rand(0,7)];
 let de=0,ds=0,df=0;if(e.includes("睡眠")){de=rand(8,14);df=rand(2,5)}else if(e.includes("隊友")){ds=rand(5,10);pc.lockerRoom=clamp(pc.lockerRoom-rand(3,7),0,100)}else if(e.includes("黑粉")||e.includes("言論")){ds=rand(6,12);df=rand(1,4)}else{ds=rand(3,8);de=rand(2,6)}p.energy=clamp(p.energy-de,0,100);p.stress=clamp(p.stress+ds,0,100);p.condition.form=clamp(p.condition.form-df,0,100);state.logs.push(`🌐 場外因素：${e}｜體力 -${de}、壓力 +${ds}${df?`、狀態 -${df}`:""}。`)
}
function nextDay(){
 ensureV10();let oldWeek=state.date.week,oldDay=state.date.day;baseNextDay();
 const advanced=state.date.day!==oldDay||state.date.week!==oldWeek;
 if(!advanced)return;
 simulateNpcRanks();syncAnnualCompetition();ensureContractMarket();conditionTick();pregnancyTick();proCareerTick();if(state.player.proCareer?.leave?.days>0){state.player.proCareer.leave.days--;if(state.player.proCareer.leave.days<=0){state.player.proCareer.leave.approved=false;state.logs.push("🗓️ 請假結束，返回戰隊正常行程。")}}frequentEsportsNews();maybeInternationalSocial();maybeTeammateConflict();maybeRomanceExposure();maybePartnerBetrayal();maybePartnerBreakup();maybeRomanceEvent();maybeNpcInvitation();esportsCircleEvent();rumorWarTick();offFieldFactorTick();
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
render();
