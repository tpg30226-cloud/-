
const SAVE_KEY="yefeng_v09_save";
const OLD_KEYS=["yefeng_v08_save","yefeng_v07_save","yefeng_v061_save","yefeng_v06_save"];
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
  version:"0.9",started:false,
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
 s.version="0.9";return s;
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
 ${actionBtn("outing","🏙️ 外出/逛街","1時段")}${actionBtn("rest","🛏️ 休息","1時段")}
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
 const p=state.player;return `<section class="card"><h2>生涯檔案</h2><div class="stat-grid">${stat("學業",Math.round(p.school))}${stat("家庭支持",Math.round(p.family))}${stat("阿哲關係",Math.round(p.relations.阿哲))}${stat("粉絲",p.followers)}</div></section>${masteryCard()}<section class="card"><h2>版本</h2><div class="log"><strong>V0.9</strong>｜事件/訊息/行程重構、正式比賽日、生活奇遇、角色熟練度、完整Rank與訓練回饋。</div></section>`;
}
function render(){
 document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.tab===activeTab));
 const main=document.querySelector("#main");
 if(!state.started){main.innerHTML=startScreen();bindStart();return}
 main.innerHTML=activeTab==="home"?home():activeTab==="schedule"?schedule():activeTab==="rank"?rankPage():activeTab==="phone"?phone():career();
 bind();
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
 if(hardEventToday())return;
 if(t==="rank")playRank(false);
 if(t==="train")training();
 if(t==="study")simple("讀書",1,()=>{state.player.school=clamp(state.player.school+1.2,0,100);state.player.family=clamp(state.player.family+.5,0,100);state.player.energy=clamp(state.player.energy-5,0,100);return "學業 +1.2、家庭支持 +0.5。"});
 if(t==="rest")simple("休息",1,()=>{state.player.energy=clamp(state.player.energy+18,0,100);state.player.stress=clamp(state.player.stress-8,0,100);state.player.mood=clamp(state.player.mood+4,0,100);return "體力 +18、壓力 -8、心情 +4。"});
 if(t==="stream")chooseStream();
 if(t==="social")chooseSocial();
 if(t==="work")simple("打工",2,()=>{state.player.cash+=1200;state.player.energy=clamp(state.player.energy-17,0,100);state.player.stress=clamp(state.player.stress+5,0,100);return "收入 NT$1,200，體力 -17、壓力 +5。"});
 if(t==="outing")chooseOuting();
}
function simple(name,cost,fn){if(!consume(name,cost))return;let d=fn();state.logs.push(`${name}：${d}`);save();render();modal(`<h2>${name}完成</h2><p>${d}</p>${closeBtn()}`)}
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
 if(p.rank==="宗師"&&p.lp>=800){p.lp-=800;p.rank="菁英"}
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
function chooseSocial(){
 if(remain()<1)return;
 const people=Object.values(state.characters).filter(c=>c.known);
 modal(`<h2>社交</h2><div class="reply-grid">${people.map(c=>`<button class="reply social-choice" data-person="${c.name}">找 ${c.name}<div class="small">${c.desc}</div></button>`).join("")}<button class="reply social-choice" data-person="同學群">看看班上同學在做什麼</button></div>`);
 document.querySelectorAll(".social-choice").forEach(b=>b.onclick=()=>socialEvent(b.dataset.person));
}
function socialEvent(person){
 if(!consume("社交",1))return;document.querySelector(".modal-backdrop")?.remove();
 if(person==="阿哲"){
  modal(`<h2>跟阿哲做什麼？</h2><div class="reply-grid"><button class="reply soc2" data-v="duo">去網咖雙排</button><button class="reply soc2" data-v="food">吃晚餐聊天</button><button class="reply soc2" data-v="walk">放學亂晃</button></div>`);
  document.querySelectorAll(".soc2").forEach(b=>b.onclick=()=>{let v=b.dataset.v,g=v==="duo"?3:2;state.player.relations.阿哲=clamp(state.player.relations.阿哲+g,0,100);state.player.mood=clamp(state.player.mood+4,0,100);state.logs.push(`社交：和阿哲${v==="duo"?"去網咖雙排":v==="food"?"吃飯聊天":"放學閒晃"}。`);save();document.querySelector(".modal-backdrop")?.remove();render()});
 }else{
  state.player.mood=clamp(state.player.mood+3,0,100);if(state.player.relations[person]!=null)state.player.relations[person]=clamp(state.player.relations[person]+2,0,100);
  state.logs.push(`社交：和${person}相處了一段時間。`);save();render();randomEncounter("social");
 }
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
  document.querySelectorAll(".mall-e").forEach(b=>b.onclick=()=>{let e=b.dataset.e,g=e==="invite"?4:e==="chat"?2:0;state.player.relations.林雨晴+=g;state.player.mood+=e==="invite"?4:1;state.messages.push({id:"yu-"+Date.now(),from:"林雨晴",text:e==="invite"?"今天滿好玩的，下次學校見。":"剛剛在商場遇到你好巧 😂",unread:true,resolved:true,type:"normal"});state.logs.push("奇遇後續：你和林雨晴第一次在學校外互動。");save();document.querySelector(".modal-backdrop")?.remove();render()});return;
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
 if(e==="join"){state.player.relations.子辰+=5;state.player.mood+=4;state.messages.push({id:"zc-"+Date.now(),from:"子辰",text:"剛才那場謝啦。你操作不錯，我們有時會缺人，下次再找你。",unread:true,resolved:true,type:"normal"});state.logs.push("奇遇後續：你替子辰的隊伍補了一場，留下了聯絡方式。")}
 else if(e==="ask"){state.player.relations.子辰+=2;state.messages.push({id:"zc2-"+Date.now(),from:"子辰",text:"我們大概翡翠到鑽石啦。下次缺人我再問你。",unread:true,resolved:true,type:"normal"});state.logs.push("奇遇後續：你和子辰交換了遊戲ID。")}
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
  if(r==="yes"){addPlan(state.date.day,{id:"duo-"+state.date.week+"-"+state.date.day,title:"與阿哲雙排",slot:"晚間",type:"duoAppointment",lockDay:false,completed:false,desc:"你已經答應阿哲，別忘記上線。"});state.player.relations.阿哲+=1;state.messages.push({id:"duo-ok-"+Date.now(),from:"阿哲",text:"好，那九點上線！",unread:true,resolved:true,type:"normal"});state.logs.push("約定已加入行程：晚間與阿哲雙排。")}
  if(r==="no"){state.player.relations.阿哲-=.5;state.messages.push({id:"duo-no-"+Date.now(),from:"阿哲",text:"OK，下次再約。",unread:true,resolved:true,type:"normal"})}
  if(r==="later"){state.messages.push({id:"duo-later-"+Date.now(),from:"阿哲",text:"行，有空再敲我。",unread:true,resolved:true,type:"normal"})}
 }
 if(m.type==="teamInvite"){
  if(r==="join"){registerTournament();state.player.relations.阿哲+=3;state.messages.push({id:"team-ok-"+Date.now(),from:"阿哲",text:"太好了！我去拉人。賽程確定後我傳給你。",unread:true,resolved:true,type:"normal"})}
  if(r==="ask"){state.messages.push({id:"team-info-"+Date.now(),from:"阿哲",text:"預賽在下週六，BO1。現在還缺打野跟輔助。你想打的話我就先報名。",unread:true,resolved:false,type:"teamInvite"})}
  if(r==="decline"){state.player.relations.阿哲-=1;state.messages.push({id:"team-no-"+Date.now(),from:"阿哲",text:"可惜，那我再找別人。",unread:true,resolved:true,type:"normal"})}
 }
 m.resolved=true;save();document.querySelector(".modal-backdrop")?.remove();render();
}
function registerTournament(){
 state.tournament={name:"高中電競盃秋季預賽",registered:true,played:false};
 let targetDay=6;
 addPlan(targetDay,{id:"hs-cup-1",title:"高中電競盃秋季預賽",slot:"全天",type:"tournament",lockDay:true,completed:false,desc:"正式賽事。比賽日全天鎖定。"});
 state.logs.push("報名成功：高中電競盃秋季預賽已寫入週六行程。");
}
function runEventById(id){
 const ev=todayPlan().find(x=>x.id===id);if(!ev||ev.completed)return;
 if(ev.type==="duoAppointment"){
  let idx=slots().indexOf(ev.slot);
  if(idx>state.dayState.usedSlots){modal(`<h2>還沒到${ev.slot}</h2><p>先完成前面的時段，或按「提早結束今天」，系統會推進到約定時間。</p>${closeBtn()}`);return}
  playScheduledDuo(ev);
 }
 if(ev.type==="tournament")playTournament(ev);
}
function playScheduledDuo(ev){
 if(!consume("與阿哲雙排",1))return;ev.completed=true;
 const p=state.player,win=avg()+rand(-8,8)>=54,delta=win?rand(18,25):-rand(16,22);
 if(win){p.wins++;p.lp+=delta}else{p.losses++;p.lp+=delta}p.relations.阿哲+=2;p.energy=clamp(p.energy-6,0,100);adjustRank();
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
 if(win){p.proAttention=clamp(p.proAttention+3,0,100);p.relations.阿哲+=4;state.logs.push("高中電競盃：首輪勝利，職業關注 +3。");state.messages.push({id:"cupwin-"+Date.now(),from:"阿哲",text:"我們真的贏了！下一輪對手更強，回去要不要研究一下？",unread:true,resolved:true,type:"normal"})}
 else{p.relations.阿哲+=2;state.logs.push("高中電競盃：首輪落敗。這次經驗成為新的起點。");state.messages.push({id:"cuplose-"+Date.now(),from:"阿哲",text:"輸了有點不甘心。不過我覺得我們可以繼續組。",unread:true,resolved:true,type:"normal"})}
 save();document.querySelector(".modal-backdrop")?.remove();render();modal(`<h2>${win?"首輪勝利！":"首輪落敗"}</h2><p>${win?"你們的第一次正式賽事取得勝利。":"正式比賽的壓力和Rank完全不同。"}</p><p>今天已被比賽完整占用，無法再進行其他活動。</p>${closeBtn()}`);
}
function nextDay(){
 const hard=hardEventToday();if(hard){runEventById(hard.id);return}
 const pending=pendingAppointments().find(x=>!x.completed);
 if(pending){
  let idx=slots().indexOf(pending.slot);
  while(idx>=0&&state.dayState.usedSlots<idx)consume("自由時間",1);
  runEventById(pending.id);return;
 }
 state.date.day++;state.player.energy=clamp(state.player.energy+10,0,100);state.player.stress=clamp(state.player.stress-2,0,100);state.dayState={usedSlots:0,actions:[]};
 if(state.date.day>7){state.date.day=1;state.date.week++;state.player.cash+=750;state.logs.push(`第${state.date.week-1}週結束：零用錢入帳 NT$750。`)}
 scriptedEvents();save();render();
}
function scriptedEvents(){
 if(state.date.week===1&&state.date.day===3&&!state.eventFlags.schoolCupHint){
  state.eventFlags.schoolCupHint=true;state.news.push("高中電競盃正式開放報名，預賽將在近期舉行。");
 }
 if(state.date.week===1&&state.date.day===4&&!state.eventFlags.rain){
  state.eventFlags.rain=true;state.characters.林雨晴.known=true;state.player.relations.林雨晴=Math.max(state.player.relations.林雨晴,5);
  state.messages.push({id:"rainmsg-"+Date.now(),from:"林雨晴",text:"今天謝謝你提醒我外面下雨，不然我真的直接走出去了 😂",unread:true,resolved:true,type:"normal"});
  modal(`<h2>🎲 放學奇遇</h2><p>外面突然下起大雨。你在走廊碰到同班的林雨晴，她正站在窗邊看著雨。</p><div class="reply-grid"><button class="reply rain-e" data-v="umbrella">問她要不要一起撐傘</button><button class="reply rain-e" data-v="wait">陪她等雨小一點</button><button class="reply rain-e" data-v="bye">提醒她下雨後先離開</button></div>`);
  setTimeout(()=>document.querySelectorAll(".rain-e").forEach(b=>b.onclick=()=>{let g=b.dataset.v==="umbrella"?4:b.dataset.v==="wait"?3:1;state.player.relations.林雨晴+=g;state.logs.push(`奇遇後續：和林雨晴的關係 +${g}。`);save();document.querySelector(".modal-backdrop")?.remove();render()}),0);
 }
}
document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>{activeTab=b.dataset.tab;render()});
document.querySelector("#resetBtn").onclick=()=>{if(confirm("確定刪除目前存檔並重開嗎？")){[SAVE_KEY,...OLD_KEYS].forEach(k=>localStorage.removeItem(k));state=newGame();activeTab="home";render()}};
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();
