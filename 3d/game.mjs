import {SAVE_KEY,WEAPONS,ENEMIES,SPAWNS,LANDMARKS,clamp,distance,walkable,inStrike} from './world-data.mjs?v=20260908-last-light-reviewed';
import {resolveMove,contact} from './battle.mjs?v=20260908-last-light-reviewed';
import {migratedPrologue,PROLOGUE_TARGETS,PROLOGUE_TEXT,PROLOGUE_DIALOGUE,REGULATOR_LINES,CROSSING_DURATION} from './prologue.mjs?v=20260908-last-light-reviewed';

export function freshProgress(){return {version:1,x:0,z:25,weapon:'shear',hp:120,teeth:[],defeated:[],caches:[],briefed:false,won:false,returned:false,rescueBriefed:false,rescueWon:false,rescueDone:false,relayStarted:[],relays:[],prologue:'arrival',prologueInspected:false,prologueDeparture:false,gentle:false,sound:true,quality:'balanced',shake:true};}
export function readProgress(storage){try{const p=JSON.parse(storage.getItem(SAVE_KEY));if(!p||p.version!==1)return freshProgress();const d=freshProgress();d.prologue=migratedPrologue(p);d.prologueInspected=d.prologue==='coupling'&&p.prologueInspected===true;d.prologueDeparture=d.prologue==='complete'?(p.prologueDeparture!==false):false;for(const k of ['briefed','won','returned','rescueBriefed','rescueWon','rescueDone','gentle','sound','shake'])if(typeof p[k]==='boolean')d[k]=p[k];d.teeth=Array.isArray(p.teeth)?[...new Set(p.teeth.filter(v=>['west','north','east'].includes(v)))]:[];d.caches=Array.isArray(p.caches)?[...new Set(p.caches.filter(v=>LANDMARKS.some(l=>l.type==='cache'&&l.id===v)))]:[];d.defeated=Array.isArray(p.defeated)?[...new Set(p.defeated.filter(v=>Number.isInteger(v)&&v>=0&&v<SPAWNS.length))]:[];for(const k of ['relayStarted','relays'])d[k]=Array.isArray(p[k])?[...new Set(p[k].filter(v=>['relay-west','relay-east'].includes(v)))]:[];if(WEAPONS[p.weapon])d.weapon=p.weapon;if(Number.isFinite(p.x)&&Number.isFinite(p.z)&&walkable(p.x,p.z)){d.x=p.x;d.z=p.z;}if(Number.isFinite(p.hp))d.hp=clamp(p.hp,1,120+d.caches.length*10+(d.rescueDone?20:0));if(['balanced','low','high'].includes(p.quality))d.quality=p.quality;return d;}catch{return freshProgress();}}
export function saveProgress(storage,game){try{storage.setItem(SAVE_KEY,JSON.stringify({...game.progress,x:game.player.x,z:game.player.z,hp:game.player.hp,weapon:game.player.weapon}));return true;}catch{return false;}}
// Both the menu restart and its regression test use this same entry point.
export function restartChapter(game){
 const p=freshProgress();for(const k of ['sound','quality','gentle','shake'])p[k]=game.progress[k];
 const next=new Game(p);next.beginPrologue();return next;
}
export class Game {
 constructor(progress=freshProgress()){
  this.progress=progress;this.time=0;this.events=[];this.effects=[];this.shots=[];this.pickups=[];this.serial=0;this.hitstop=0;this.relayWaves=new Map();this.prologueTimer=0;
  this.player={x:progress.x,z:progress.z,hp:progress.hp,weapon:progress.weapon,yaw:Math.PI,charge:30,combo:0,comboWindow:0,attack:null,recovery:0,dodge:0,dash:0,invulnerable:0,flash:0,move:0,lastHit:-20,vx:0,vz:0,buffer:null};
  this.enemies=SPAWNS.map(([type,x,z,relay,wave,prologue],id)=>({id,type,x,z,relay,wave,prologue,homeX:x,homeZ:z,hp:ENEMIES[type].hp,posture:0,alive:!progress.defeated.includes(id),yaw:0,state:'idle',timer:0,cooldown:1+id*.1,flash:0,knockX:0,knockZ:0,attackX:x,attackZ:z,attackYaw:0,attackCount:0,exposed:0}));
 }
 get maxHP(){return 120+this.progress.caches.length*10+(this.progress.rescueDone?20:0);}
 emit(type,detail={}){this.events.push({type,...detail});}
 fx(type,x,z,life=.4,extra={}){this.effects.push({id:++this.serial,type,x,z,life,maxLife:life,...extra});}
 get ventCost(){return this.progress.rescueDone?20:30;}
 relayWave(id){return this.enemies.some(e=>e.relay===id&&e.wave===1&&e.alive)?1:2;}
 active(e){if(!e.alive)return false;if(e.prologue)return this.progress.prologue==='landingThreat';if(this.progress.prologue!=='complete')return false;if(e.relay)return this.progress.rescueBriefed&&this.progress.relayStarted.includes(e.relay)&&e.wave<=this.relayWave(e.relay);if(e.type==='harrow')return this.progress.rescueBriefed&&this.progress.relays.length===2;return e.type!=='engine'||this.progress.teeth.length===3;}


 beginPrologue(){
  if(this.progress.prologue!=='arrival')return false;
  this.progress.prologue='landingThreat';this.emit('prologue',{state:'landingThreat'});this.emit('caption',{speaker:'Sera',text:PROLOGUE_TEXT.arrival});this.emit('save');return true;
 }
 setPrologue(state){
  if(this.progress.prologue===state)return false;this.progress.prologue=state;this.prologueTimer=0;this.emit('prologue',{state});this.emit('save');return true;
 }
 prologueTarget(){
  const p=this.progress;
  if(p.prologue==='landingThreat')return PROLOGUE_TARGETS.dock;
  if(p.prologue==='coupling')return p.prologueInspected?PROLOGUE_TARGETS.jam:PROLOGUE_TARGETS.dock;
  if(p.prologue==='briefing')return PROLOGUE_TARGETS.sera;
  if(p.prologue==='complete'&&!p.prologueDeparture)return PROLOGUE_TARGETS.exit;
  return null;
 }
 finishPrologueBriefing(){
  if(this.progress.prologue!=='briefing')return false;
  this.progress.briefed=true;this.progress.prologueDeparture=false;this.setPrologue('complete');this.emit('caption',{speaker:'Sera',text:PROLOGUE_TEXT.exit});return true;
 }
 departPrologue(){
  if(this.progress.prologue!=='complete'||this.progress.prologueDeparture)return false;
  this.progress.prologueDeparture=true;this.emit('chapter',{title:'THE LAST LIGHT',subtitle:'Free the Storm Engine'});this.emit('save');return true;
 }
 hitCoupling(a,origin){
  const p=this.progress;if(p.prologue!=='coupling'||!p.prologueInspected)return false;
  if(!contact(a,origin,PROLOGUE_TARGETS.jam,.62).hit)return false;
  this.setPrologue('crossing');this.emit('coupling-hit',{weapon:a.weapon});this.emit('coupling-cleared');this.fx('shatter',PROLOGUE_TARGETS.jam.x,PROLOGUE_TARGETS.jam.z,.65,{weapon:a.weapon});return true;
 }
 nearestEnemy(range=10){return this.enemies.filter(e=>this.active(e)&&distance(e,this.player)<range).sort((a,b)=>distance(a,this.player)-distance(b,this.player))[0];}
 setWeapon(id){if(!WEAPONS[id]||this.player.attack||this.player.weapon===id)return false;this.player.weapon=id;this.player.combo=0;this.player.comboWindow=0;this.emit('equip',{weapon:id});this.emit('save');return true;}
 attack(){
  const p=this.player;if(p.attack||p.recovery>0||p.dash>0){if(p.attack&&p.attack.duration-p.attack.age<.18&&p.buffer?.type!=='vent')p.buffer={type:'attack',until:this.time+.2};return false;}const w=WEAPONS[p.weapon];
  const target=this.nearestEnemy(w.reach+1);if(target&&!p.move)p.yaw=Math.atan2(target.x-p.x,target.z-p.z);
  const form=p.form||'runner',count=resolveMove(form,p.weapon).chainLength;
  p.combo=p.comboWindow>0?(p.combo+1)%count:0;
  const move=resolveMove(form,p.weapon,p.combo);p.comboWindow=move.duration+.75;
  p.attack={...move,weapon:p.weapon,yaw:p.yaw,combo:p.combo,age:0,hit:false,vent:false};this.emit('windup',{weapon:p.weapon});return true;
 }
 vent(){
  const p=this.player;if(p.attack||p.recovery>0||p.dash>0){if(p.attack&&p.attack.duration-p.attack.age<.18)p.buffer={type:'vent',until:this.time+.2};return false;}if(p.charge<this.ventCost){this.emit('toast',{text:`Land hits or dodge through a strike to build ${this.ventCost} pressure.`});return false;}
  p.charge-=this.ventCost;const w=WEAPONS[p.weapon],target=this.nearestEnemy(14);if(target&&!p.move)p.yaw=Math.atan2(target.x-p.x,target.z-p.z);
  p.attack={...resolveMove(p.form||'runner',p.weapon,0,true),weapon:p.weapon,yaw:p.yaw,combo:2,age:0,hit:false,vent:true};this.emit('windup',{weapon:p.weapon});return true;
 }
 resolveAttack(a){
  const p=this.player,w=WEAPONS[a.weapon],origin={x:p.x,z:p.z,yaw:a.yaw};
  this.move(p,Math.sin(a.yaw)*a.lunge,Math.cos(a.yaw)*a.lunge);this.fx(a.vent?'vent':'strike',origin.x,origin.z,a.weapon==='maul'?.48:.23,{weapon:a.weapon,yaw:a.yaw,combo:a.combo,reach:a.reach,width:a.width,shape:a.shape});this.emit('swing',{weapon:a.weapon,vent:a.vent,combo:a.combo});
  for(const e of this.enemies.filter(e=>this.active(e))){const hit=contact(a,origin,e,ENEMIES[e.type].radius*.35);if(hit.hit){this.hurtEnemy(e,hit.damage,hit.posture,a.weapon==='maul'?8:3,origin);if(hit.precise){this.emit('precision');this.fx('perfect',e.x,e.z,.35);}}}
  this.hitCoupling(a,origin);
 }
 dodge(){
  const p=this.player;if(p.dodge>0||p.attack?.hit)return false;p.attack=null;p.buffer=null;p.comboWindow=0;p.vx=0;p.vz=0;p.dodge=.8;p.dash=.23;p.invulnerable=.28;
  const threatened=this.enemies.some(e=>this.active(e)&&e.state==='windup'&&e.timer<.38&&inStrike({x:e.attackX,z:e.attackZ,yaw:e.attackYaw},p,ENEMIES[e.type].reach,ENEMIES[e.type].width));
  if(threatened){p.charge=Math.min(100,p.charge+20);this.emit('perfect');this.fx('perfect',p.x,p.z,.6,{yaw:p.yaw});}
  this.fx('dash',p.x,p.z,.3,{yaw:p.yaw});this.emit('dodge');return true;
 }
 hurtEnemy(e,damage,posture=0,knock=0,origin=this.player){
  if(!this.active(e))return;const broken=e.state==='stagger';const amount=damage*(broken?1.45:1);e.hp-=amount;e.flash=.16;e.recoil=.22;e.posture+=posture;
  const d=Math.max(.1,distance(e,origin));e.knockX=(e.x-origin.x)/d*knock;e.knockZ=(e.z-origin.z)/d*knock;
  this.player.charge=clamp(this.player.charge+7,0,100);this.hitstop=Math.max(this.hitstop,damage>50?.075:.045);this.fx('impact',e.x,e.z,.45,{amount:Math.round(amount),heavy:damage>50,yaw:origin.yaw||0});this.emit('hit',{heavy:damage>50,amount});
  if(e.posture>=ENEMIES[e.type].posture){e.posture=0;e.state='stagger';e.timer=['engine','harrow'].includes(e.type)?2.6:1.6;this.emit('stagger');this.fx('break',e.x,e.z,.7);}
  if(e.hp<=0){e.alive=false;if(!e.prologue)this.progress.defeated.push(e.id);this.fx('shatter',e.x,e.z,.8,{heavy:e.type==='engine'});this.emit('kill');if(!e.prologue)this.pickups.push({id:++this.serial,x:e.x,z:e.z,life:120});if(e.type==='engine'){this.progress.won=true;this.emit('victory');}if(e.type==='harrow'){this.progress.rescueWon=true;this.emit('rescue-victory');}this.emit('save');}
 }
 hurtPlayer(amount){const p=this.player;if(p.invulnerable>0)return;p.hp-=amount*(this.progress.gentle?.45:1);p.invulnerable=.7;p.flash=.28;p.lastHit=this.time;this.emit('damage');if(p.hp<=0){p.x=0;p.z=25;p.hp=this.maxHP;p.charge=Math.max(30,p.charge);p.invulnerable=3;p.attack=null;p.buffer=null;p.vx=0;p.vz=0;p.dash=0;for(const e of this.enemies)if(e.alive||(e.prologue&&this.progress.prologue==='landingThreat')){if(e.prologue&&this.progress.prologue==='landingThreat')e.alive=true;e.x=e.homeX;e.z=e.homeZ;e.hp=ENEMIES[e.type].hp;e.state='idle';e.cooldown=2;e.posture=0;}this.shots=[];this.emit('respawn');this.emit('save');}}
 move(e,dx,dz,radius=.5){const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.3));for(let i=0;i<steps;i++){if(walkable(e.x+dx/steps,e.z,radius))e.x+=dx/steps;if(walkable(e.x,e.z+dz/steps,radius))e.z+=dz/steps;}}
 nearby(){const prologue=this.prologueTarget();if(this.progress.prologue!=='complete'||!this.progress.prologueDeparture)return prologue&&distance(prologue,this.player)<prologue.radius?prologue:null;return LANDMARKS.filter(l=>l.type!=='boss'&&((l.type!=='relay'&&l.id!=='iona')||this.progress.returned)&&distance(l,this.player)<l.radius&&!(l.type==='cache'&&this.progress.caches.includes(l.id))).sort((a,b)=>distance(a,this.player)-distance(b,this.player))[0];}
 interact(){
  const l=this.nearby();if(!l)return;const p=this.progress;
  if(l.id==='dock-reel'){
   if(p.prologue==='coupling'&&!p.prologueInspected){p.prologueInspected=true;this.emit('coupling-ready');this.emit('caption',{speaker:'Sera',text:PROLOGUE_TEXT.inspect});this.emit('save');}
   return;
  }
  if(l.id==='exit'&&p.prologue==='complete'&&!p.prologueDeparture){this.departPrologue();return;}
  if(l.id==='sera'&&p.prologue==='briefing'){this.emit('dialogue',{speaker:'Sera Vale',beats:PROLOGUE_DIALOGUE,complete:'last-light-briefing'});return;}
  if(l.id==='sera'){
   p.briefed=true;if(p.rescueDone){this.emit('dialogue',{speaker:'Sera Vale',lines:['I counted every skiff. Every crew. For once, every berth is accounted for.','Iona has the radio running day and night. We are going to need a bigger anchorage.']});}else if(p.returned&&!p.rescueDone){this.emit('dialogue',{speaker:'Sera Vale',lines:['Iona made it back with a cracked receiver. She is waiting by the southern shelters.','The engine is running steadily, but our crews are still out there. Help her bring the stormline back.']});}else if(p.won){p.returned=true;this.emit('dialogue',{speaker:'Sera Vale',lines:['The pressure is falling. Look at the sky, Veyr. For the first time in six years, it is only weather.','I thought you came back for the engine. You came back for us.','Iona is waiting by the southern shelters. Her receiver caught a distress call. We still have people out there.']});}
   else if(p.teeth.length)this.emit('dialogue',{speaker:'Sera Vale',lines:[REGULATOR_LINES[p.teeth.length-1],'The engine keeps our home in the air. Restore its controls so the missing crews have somewhere safe to land.']});
   else this.emit('dialogue',{speaker:'Sera Vale',lines:['You made it through the breach. I kept your rig running, but the island is losing altitude.','The Storm Engine tore its regulator apart. Three regulator pieces are scattered across the field stations. Recover them before we approach its heart.','Your tools are already fitted: an edge, a lance, and a hammer. Strike to build pressure. Vent it when you need to break a line. I will keep the anchorage lit.']});
  }else if(l.id==='iona'){
   if(p.rescueWon){p.rescueDone=true;this.player.hp=this.maxHP;this.player.charge=100;this.emit('dialogue',{speaker:'Iona Rusk',lines:['Three skiffs on approach. I can hear them laughing over the radio. You did it.','I fitted the recovered regulator to your rig. Your vents now cost 20 pressure, and the reinforced harness gives you 20 more health.','Sera says we should call this place home again. I think she is right.']});this.emit('crew-home');}
   else{p.rescueBriefed=true;this.emit('dialogue',{speaker:'Iona Rusk',lines:['I heard the engine settle from the far side of the storm. Then I heard our missing crews. They are alive, Veyr.','Bring up the western and eastern relays. The signal will pull in two patrols at each tower. Clear them, then lock the transmitter.','Once both relays are broadcasting, we can find the Tempest Harrow. It is hunting the skiffs. Cut it down and I can guide everyone home.']});}
  }else if(l.type==='relay'){
   if(!p.rescueBriefed){this.emit('toast',{text:'Iona at the anchorage has the transmitter codes.'});return;}
   if(p.relays.includes(l.id)){this.emit('toast',{text:'The relay is broadcasting. The crews can hear us.'});return;}
   if(!p.relayStarted.includes(l.id)){p.relayStarted.push(l.id);this.player.charge=100;this.player.hp=Math.min(this.maxHP,this.player.hp+25);this.emit('relay-start',{id:l.id});}
   else if(this.enemies.some(e=>e.relay===l.id&&e.alive)){this.emit('toast',{text:'Clear both patrols, then return to lock the transmitter.'});return;}
   else{p.relays.push(l.id);this.player.hp=this.maxHP;this.player.charge=100;this.emit('relay-secured',{count:p.relays.length});this.fx('salvage',l.x,l.z,1.3);}
  }else if(l.id==='oren')this.emit('dialogue',{speaker:'Oren Flint',lines:['I used to maintain those dredgers. The engine has put a storm inside every one of them.','Their joints still lock under impact. Break their posture with the hammer, then drive the lance through the exposed core.','The regulator case is up the cut. Clear its patrol before you touch the clamps.']});
  else if(l.type==='chart')this.emit('dialogue',{speaker:'Crew field chart',lines:['BLACKGLASS CUT: west. SEVERED SPIRE: northeast. COPPER REACHES: east. Each field station holds a regulator piece.','Amber pressure builds with each hit. A last-moment dodge through a marked attack supplies an extra burst.','Find survey cases to reinforce your rig. Repairs are available at the anchorage.']});
  else if(l.type==='bench'){this.player.hp=this.maxHP;this.player.charge=Math.max(30,this.player.charge);this.fx('repair',l.x,l.z,1);this.emit('toast',{text:'Rig repaired. Pressure primed.'});}
  else if(l.type==='cache'){p.caches.push(l.id);this.player.hp=Math.min(this.maxHP,this.player.hp+35);this.fx('salvage',l.x,l.z,1);this.emit('salvage',{count:p.caches.length});}
  else if(l.type==='station'){
   if(p.teeth.includes(l.id)){this.emit('toast',{text:'Regulator piece secured.'});return;}
   if(this.enemies.some(e=>this.active(e)&&distance(e,l)<9)){this.emit('toast',{text:'The clamps are locked. Clear the station patrol first.'});return;}
   p.teeth.push(l.id);this.player.hp=Math.min(this.maxHP,this.player.hp+35);this.player.charge=100;this.fx('salvage',l.x,l.z,1.3);this.emit('tooth',{count:p.teeth.length,id:l.id});this.emit('caption',{speaker:'Sera · radio',text:REGULATOR_LINES[p.teeth.length-1]});if(p.teeth.length===3)this.emit('awaken');
  }
  this.emit('save');
 }
 quest(){const p=this.progress;
  if(p.prologue!=='complete'){
   if(p.prologue==='arrival')return {title:'Help the people at the dock',detail:'A boat is drifting near home. Reach the landing platform.',count:'THE LAST ANCHORAGE',target:PROLOGUE_TARGETS.dock};
   if(p.prologue==='landingThreat')return {title:'Help the people at the dock',detail:'Clear the landing platform so the boat can come in.',count:'REACH THE CABLE REEL',target:PROLOGUE_TARGETS.dock};
   if(p.prologue==='coupling')return p.prologueInspected?{title:'Hold their boat steady',detail:'Break the scrap jammed in the cable reel.',count:'USE ANY TOOL',target:PROLOGUE_TARGETS.jam}:{title:'Hold their boat steady',detail:'Inspect the cable reel beside the dock.',count:'SECURE THE BOAT',target:PROLOGUE_TARGETS.dock};
   if(p.prologue==='crossing')return {title:'Help the people at the dock',detail:'The boat is coming in. Stay close while the crew crosses.',count:'THE CABLE IS HOLDING',target:null};
   return {title:'Save the island',detail:'Talk to Sera at the secured dock.',count:'THE STORM ENGINE',target:PROLOGUE_TARGETS.sera};
  }
  if(!p.prologueDeparture)return {title:'Save the island',detail:'Leave the dock and take a road toward a repair station.',count:'THE NORTH ROAD',target:PROLOGUE_TARGETS.exit};
  if(p.rescueDone)return {title:'The crews are home',detail:'Regulator fitted: vents cost 20. Find any remaining survey cases.',count:p.caches.length+' / 3 survey cases',target:null};
  if(p.rescueWon)return {title:'Bring the skiffs home',detail:'Return to Iona for your upgraded pressure regulator.',count:'Harrow destroyed',target:LANDMARKS.find(l=>l.id==='iona')};
  if(p.returned){
   if(!p.rescueBriefed)return {title:'A voice beyond the storm',detail:'Iona caught a distress call. Meet her by the southern shelters.',count:'STORMLINE RESCUE',target:LANDMARKS.find(l=>l.id==='iona')};
   if(p.relays.length===2)return {title:'Clear the stormline',detail:'Destroy the Tempest Harrow in the northwest. Evade its volleys and break its core.',count:'Both relays online',target:LANDMARKS.find(l=>l.id==='harrow')};
   const relay=LANDMARKS.filter(l=>l.type==='relay'&&!p.relays.includes(l.id)).sort((a,b)=>Number(p.relayStarted.includes(b.id))-Number(p.relayStarted.includes(a.id))||distance(a,this.player)-distance(b,this.player))[0];const remaining=this.enemies.filter(e=>e.relay===relay.id&&e.alive).length;
   return {title:'Restore the stormline',detail:p.relayStarted.includes(relay.id)?remaining?`Clear ${relay.area}: ${remaining} defenders left across both patrols.`:'Patrols cleared. Return to the relay to lock its transmitter.':'Activate either relay. Hold off two patrols, then secure the transmitter.',count:p.relays.length+' / 2 relays online',target:relay};
  }

  if(p.won)return {title:'Bring the crews home',detail:'Return to Sera at the Last Anchorage. The island is holding.',count:'Regulator freed',target:LANDMARKS[0]};
  if(p.teeth.length===3)return {title:'Free the Storm Engine',detail:'Face the Keelbreaker at the northern engine scar. Break its posture, then free the regulator.',count:'Regulator complete',target:LANDMARKS.find(l=>l.id==='engine')};
  const target=LANDMARKS.filter(l=>l.type==='station'&&!p.teeth.includes(l.id)).sort((a,b)=>distance(a,this.player)-distance(b,this.player))[0];return {title:'Free the Storm Engine',detail:'Restore the machine keeping our home in the sky. Recover three regulator pieces from the field stations.',count:p.teeth.length+' / 3 pieces recovered',target};
 }
 update(dt,input={x:0,z:0}){
  dt=clamp(dt,0,.05);this.time+=dt;const p=this.player;
  // Impact freeze stops motion briefly while the renderer continues the impact flash.
  if(this.hitstop>0){this.hitstop=Math.max(0,this.hitstop-dt);if(p.buffer)p.buffer.until+=dt;return;}
  for(const k of ['recovery','dodge','dash','invulnerable','flash','comboWindow'])p[k]=Math.max(0,p[k]-dt);
  const len=Math.hypot(input.x||0,input.z||0);p.move=Math.min(1,len);
  const speed=WEAPONS[p.weapon].speed,blend=1-Math.exp(-dt*24);p.vx+=((input.x||0)/Math.max(1,len)*speed-p.vx)*blend;p.vz+=((input.z||0)/Math.max(1,len)*speed-p.vz)*blend;
  if(!p.attack&&p.dash===0){if(len>.08)p.yaw=Math.atan2(input.x,input.z);this.move(p,p.vx*dt,p.vz*dt);}

  if(p.attack){const a=p.attack;a.age+=dt;if(!a.hit&&a.age>=a.windup){a.hit=true;this.resolveAttack(a);}if(a.age>=a.duration)p.attack=null;}
  if(p.buffer&&!p.attack){const queued=p.buffer;p.buffer=null;if(this.time<=queued.until)this[queued.type]();}
  if(p.dash>0)this.move(p,Math.sin(p.yaw)*27*dt,Math.cos(p.yaw)*27*dt);
  if(this.progress.prologue==='complete'&&!this.progress.prologueDeparture&&distance(p,PROLOGUE_TARGETS.exit)<2.8)this.departPrologue();
  if(this.progress.gentle&&this.time-p.lastHit>5)p.hp=Math.min(this.maxHP,p.hp+6*dt);
  if(this.progress.prologue==='landingThreat'&&!this.enemies.some(e=>e.prologue&&e.alive)){this.setPrologue('coupling');this.emit('caption',{speaker:'Sera',text:'The platform is clear. Check the cable reel.'});}
  if(this.progress.prologue==='crossing'){const before=this.prologueTimer;this.prologueTimer+=dt;if(before<4.5&&this.prologueTimer>=4.5)this.emit('caption',{speaker:'Sera',text:PROLOGUE_TEXT.safe});if(this.prologueTimer>=CROSSING_DURATION){this.setPrologue('briefing');this.emit('engine-answer');this.emit('caption',{speaker:'Sera',text:PROLOGUE_TEXT.engine});}}
  for(const id of this.progress.relayStarted){const wave=this.relayWave(id);if(!this.progress.relays.includes(id)&&this.relayWaves.get(id)!==wave){this.relayWaves.set(id,wave);if(wave===2&&this.enemies.some(e=>e.relay===id&&e.alive))this.emit('relay-wave',{id});}}
  for(const e of this.enemies){
   if(!this.active(e))continue;const s=ENEMIES[e.type];e.flash=Math.max(0,e.flash-dt);e.recoil=Math.max(0,(e.recoil||0)-dt);e.cooldown=Math.max(0,e.cooldown-dt);e.posture=Math.max(0,e.posture-dt*3);
   if(Math.abs(e.knockX)+Math.abs(e.knockZ)>.1){this.move(e,e.knockX*dt,e.knockZ*dt);e.knockX*=Math.exp(-7*dt);e.knockZ*=Math.exp(-7*dt);}
   const d=distance(e,p),home=distance(e,{x:e.homeX,z:e.homeZ});
   if(e.state==='windup'){
    e.timer-=dt;if(e.timer<=0){
     if(e.type==='harrow'){for(const offset of (e.hp<s.hp*.5?[-.6,-.3,0,.3,.6]:[-.3,0,.3]))this.shots.push({id:++this.serial,x:e.x,z:e.z,vx:Math.sin(e.attackYaw+offset)*12,vz:Math.cos(e.attackYaw+offset)*12,life:2.3,damage:s.damage});}
     else if(e.type==='kite'){this.shots.push({id:++this.serial,x:e.x,z:e.z,vx:Math.sin(e.attackYaw)*14,vz:Math.cos(e.attackYaw)*14,life:2.5,damage:s.damage});}
     else{if(inStrike({x:e.attackX,z:e.attackZ,yaw:e.attackYaw},p,s.reach,s.width))this.hurtPlayer(s.damage);this.fx('enemy-strike',e.attackX,e.attackZ,.4,{yaw:e.attackYaw,reach:s.reach,width:s.width,heavy:e.type==='engine'});if(e.type==='engine'&&e.hp<s.hp*.5)for(const offset of [-.5,.5])this.shots.push({id:++this.serial,x:e.x,z:e.z,vx:Math.sin(e.attackYaw+offset)*10,vz:Math.cos(e.attackYaw+offset)*10,life:2,damage:15});}
     e.state='recover';e.timer=s.recovery;e.cooldown=s.cooldown;e.attackCount++;this.emit('enemy-strike');
    }
   }else if(e.state==='recover'||e.state==='stagger'){e.timer-=dt;if(e.timer<=0)e.state='idle';}
   else if(d<s.aggro&&home<24){e.yaw=Math.atan2(p.x-e.x,p.z-e.z);if(d<s.reach-.5&&e.cooldown===0&&this.enemies.filter(other=>other!==e&&this.active(other)&&other.state==='windup'&&distance(other,p)<20).length<2){e.state='windup';e.timer=s.windup;e.attackX=e.x;e.attackZ=e.z;e.attackYaw=e.yaw;}else if(d>Math.max(2,s.reach*.55))this.move(e,(p.x-e.x)/d*s.speed*dt,(p.z-e.z)/d*s.speed*dt,s.radius*.45);}
   else if(home>.3)this.move(e,(e.homeX-e.x)/home*s.speed*dt,(e.homeZ-e.z)/home*s.speed*dt);
  }
  for(const shot of this.shots){const steps=Math.max(1,Math.ceil(Math.hypot(shot.vx,shot.vz)*dt/.3));for(let i=0;i<steps;i++){const nx=shot.x+shot.vx*dt/steps,nz=shot.z+shot.vz*dt/steps;if(!walkable(nx,nz,.1)){shot.life=0;break;}shot.x=nx;shot.z=nz;}shot.life-=dt;if(shot.life>0&&distance(shot,p)<1.1){if(p.invulnerable>0&&p.dash>0){p.charge=Math.min(100,p.charge+10);this.emit('perfect');}this.hurtPlayer(shot.damage);shot.life=0;}}
  this.shots=this.shots.filter(s=>s.life>0);
  for(const f of this.effects)f.life-=dt;this.effects=this.effects.filter(f=>f.life>0);
  for(const item of this.pickups){item.life-=dt;const d=distance(item,p);if(d<9){item.x+=(p.x-item.x)*dt*5;item.z+=(p.z-item.z)*dt*5;}if(d<1.3){p.hp=Math.min(this.maxHP,p.hp+12);p.charge=Math.min(100,p.charge+8);item.life=0;this.fx('repair',p.x,p.z,.4);this.emit('pickup');}}
  this.pickups=this.pickups.filter(i=>i.life>0);
 }
}
