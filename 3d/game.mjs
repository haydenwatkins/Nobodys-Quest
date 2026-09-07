import {SAVE_KEY,WEAPONS,ENEMIES,SPAWNS,LANDMARKS,clamp,distance,walkable,inStrike} from './world-data.mjs';

export function freshProgress(){return {version:1,x:0,z:25,weapon:'shear',hp:120,teeth:[],defeated:[],caches:[],briefed:false,won:false,returned:false,gentle:false,sound:true,quality:'balanced',shake:true};}
export function readProgress(storage){try{const p=JSON.parse(storage.getItem(SAVE_KEY));if(!p||p.version!==1)return freshProgress();const d=freshProgress();for(const k of ['briefed','won','returned','gentle','sound','shake'])if(typeof p[k]==='boolean')d[k]=p[k];d.teeth=Array.isArray(p.teeth)?[...new Set(p.teeth.filter(v=>['west','north','east'].includes(v)))]:[];d.caches=Array.isArray(p.caches)?[...new Set(p.caches.filter(v=>LANDMARKS.some(l=>l.type==='cache'&&l.id===v)))]:[];d.defeated=Array.isArray(p.defeated)?[...new Set(p.defeated.filter(v=>Number.isInteger(v)&&v>=0&&v<SPAWNS.length))]:[];if(WEAPONS[p.weapon])d.weapon=p.weapon;if(Number.isFinite(p.x)&&Number.isFinite(p.z)&&walkable(p.x,p.z)){d.x=p.x;d.z=p.z;}if(Number.isFinite(p.hp))d.hp=clamp(p.hp,1,120+d.caches.length*10);if(['balanced','low','high'].includes(p.quality))d.quality=p.quality;return d;}catch{return freshProgress();}}
export function saveProgress(storage,game){try{storage.setItem(SAVE_KEY,JSON.stringify({...game.progress,x:game.player.x,z:game.player.z,hp:game.player.hp,weapon:game.player.weapon}));return true;}catch{return false;}}
export class Game {
 constructor(progress=freshProgress()){
  this.progress=progress;this.time=0;this.events=[];this.effects=[];this.shots=[];this.pickups=[];this.serial=0;this.hitstop=0;
  this.player={x:progress.x,z:progress.z,hp:progress.hp,weapon:progress.weapon,yaw:Math.PI,charge:30,combo:0,comboWindow:0,attack:null,recovery:0,dodge:0,dash:0,invulnerable:0,flash:0,move:0,lastHit:-20};
  this.enemies=SPAWNS.map(([type,x,z],id)=>({id,type,x,z,homeX:x,homeZ:z,hp:ENEMIES[type].hp,posture:0,alive:!progress.defeated.includes(id),yaw:0,state:'idle',timer:0,cooldown:1+id*.1,flash:0,knockX:0,knockZ:0,attackX:x,attackZ:z,attackYaw:0,attackCount:0,exposed:0}));
 }
 get maxHP(){return 120+this.progress.caches.length*10;}
 emit(type,detail={}){this.events.push({type,...detail});}
 fx(type,x,z,life=.4,extra={}){this.effects.push({id:++this.serial,type,x,z,life,maxLife:life,...extra});}
 active(e){return e.alive&&(e.type!=='engine'||this.progress.teeth.length===3);}
 nearestEnemy(range=10){return this.enemies.filter(e=>this.active(e)&&distance(e,this.player)<range).sort((a,b)=>distance(a,this.player)-distance(b,this.player))[0];}
 setWeapon(id){if(!WEAPONS[id]||this.player.attack||this.player.weapon===id)return false;this.player.weapon=id;this.player.combo=0;this.emit('equip',{weapon:id});this.emit('save');return true;}
 attack(){
  const p=this.player;if(p.attack||p.recovery>0||p.dash>0)return false;const w=WEAPONS[p.weapon];
  const target=this.nearestEnemy(w.reach+1);if(target&&!p.move)p.yaw=Math.atan2(target.x-p.x,target.z-p.z);
  p.combo=p.comboWindow>0?(p.combo+1)%3:0;p.comboWindow=1.3;
  p.attack={weapon:p.weapon,yaw:p.yaw,combo:p.combo,age:0,hit:false,vent:false,duration:w.windup+w.recovery,windup:w.windup};this.emit('windup',{weapon:p.weapon});return true;
 }
 vent(){
  const p=this.player;if(p.attack||p.recovery>0||p.dash>0)return false;if(p.charge<30){this.emit('toast',{text:'Land hits or dodge through a strike to build 30 pressure.'});return false;}
  p.charge-=30;const w=WEAPONS[p.weapon],target=this.nearestEnemy(14);if(target&&!p.move)p.yaw=Math.atan2(target.x-p.x,target.z-p.z);
  p.attack={weapon:p.weapon,yaw:p.yaw,combo:2,age:0,hit:false,vent:true,duration:.7,windup:.2};this.emit('windup',{weapon:p.weapon});return true;
 }
 resolveAttack(a){
  const p=this.player,w=WEAPONS[a.weapon],origin={x:p.x,z:p.z,yaw:a.yaw};
  let reach=w.reach,width=w.width,damage=w.damage*(a.combo===2?1.6:1),posture=a.weapon==='maul'?55:a.combo===2?28:12;
  if(a.vent){reach=a.weapon==='pike'?20:a.weapon==='maul'?13:7;width=a.weapon==='pike'?1.6:a.weapon==='maul'?2.5:5;damage=a.weapon==='maul'?125:a.weapon==='pike'?100:80;posture=80;}
  this.move(p,Math.sin(a.yaw)*.55,Math.cos(a.yaw)*.55);this.fx(a.vent?'vent':'strike',p.x,p.z,a.vent?.5:.23,{weapon:a.weapon,yaw:a.yaw,combo:a.combo,reach,width});this.emit('swing',{weapon:a.weapon,vent:a.vent,combo:a.combo});
  for(const e of this.enemies)if(this.active(e)&&inStrike(origin,e,reach+ENEMIES[e.type].radius*.4,width+ENEMIES[e.type].radius*.35))this.hurtEnemy(e,damage,posture,a.weapon==='maul'?8:3,origin);
 }
 dodge(){
  const p=this.player;if(p.dodge>0||p.attack?.hit)return false;p.attack=null;p.dodge=.95;p.dash=.23;p.invulnerable=.28;
  const threatened=this.enemies.some(e=>this.active(e)&&e.state==='windup'&&e.timer<.38&&inStrike({x:e.attackX,z:e.attackZ,yaw:e.attackYaw},p,ENEMIES[e.type].reach,ENEMIES[e.type].width));
  if(threatened){p.charge=Math.min(100,p.charge+20);this.emit('perfect');this.fx('perfect',p.x,p.z,.6,{yaw:p.yaw});}
  this.fx('dash',p.x,p.z,.3,{yaw:p.yaw});this.emit('dodge');return true;
 }
 hurtEnemy(e,damage,posture=0,knock=0,origin=this.player){
  if(!this.active(e))return;const broken=e.state==='stagger';const amount=damage*(broken?1.45:1);e.hp-=amount;e.flash=.16;e.posture+=posture;
  const d=Math.max(.1,distance(e,origin));e.knockX=(e.x-origin.x)/d*knock;e.knockZ=(e.z-origin.z)/d*knock;
  this.player.charge=clamp(this.player.charge+7,0,100);this.hitstop=Math.max(this.hitstop,damage>50?.075:.045);this.fx('impact',e.x,e.z,.45,{amount:Math.round(amount),heavy:damage>50,yaw:origin.yaw||0});this.emit('hit',{heavy:damage>50,amount});
  if(e.posture>=ENEMIES[e.type].posture){e.posture=0;e.state='stagger';e.timer=e.type==='engine'?2.6:1.6;this.emit('stagger');this.fx('break',e.x,e.z,.7);}
  if(e.hp<=0){e.alive=false;this.progress.defeated.push(e.id);this.fx('shatter',e.x,e.z,.8,{heavy:e.type==='engine'});this.emit('kill');this.pickups.push({id:++this.serial,x:e.x,z:e.z,life:120});if(e.type==='engine'){this.progress.won=true;this.emit('victory');}this.emit('save');}
 }
 hurtPlayer(amount){const p=this.player;if(p.invulnerable>0)return;p.hp-=amount*(this.progress.gentle?.45:1);p.invulnerable=.7;p.flash=.28;p.lastHit=this.time;this.emit('damage');if(p.hp<=0){p.x=0;p.z=25;p.hp=this.maxHP;p.charge=Math.max(30,p.charge);p.invulnerable=3;p.attack=null;p.dash=0;for(const e of this.enemies)if(e.alive){e.x=e.homeX;e.z=e.homeZ;e.hp=ENEMIES[e.type].hp;e.state='idle';e.cooldown=2;e.posture=0;}this.shots=[];this.emit('respawn');this.emit('save');}}
 move(e,dx,dz,radius=.5){const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.3));for(let i=0;i<steps;i++){if(walkable(e.x+dx/steps,e.z,radius))e.x+=dx/steps;if(walkable(e.x,e.z+dz/steps,radius))e.z+=dz/steps;}}
 nearby(){return LANDMARKS.filter(l=>l.type!=='boss'&&distance(l,this.player)<l.radius&&!(l.type==='cache'&&this.progress.caches.includes(l.id))).sort((a,b)=>distance(a,this.player)-distance(b,this.player))[0];}
 interact(){
  const l=this.nearby();if(!l)return;const p=this.progress;
  if(l.id==='sera'){
   p.briefed=true;if(p.won){p.returned=true;this.emit('dialogue',{speaker:'Sera Vale',lines:['The pressure is falling. Look at the sky, Veyr. For the first time in six years, it is only weather.','I thought you came back for the engine. You came back for us.','The causeway is holding. We can bring the scattered crews home. This is where we start.']});}
   else this.emit('dialogue',{speaker:'Sera Vale',lines:['You made it through the breach. I kept your rig running, but the island is losing altitude.','The Storm Engine tore its governor apart. Three teeth are scattered across the field stations. Recover them before we approach its heart.','Your tools are already fitted: an edge, a lance, and a hammer. Strike to build pressure. Vent it when you need to break a line. I will keep the anchorage lit.']});
  }else if(l.id==='oren')this.emit('dialogue',{speaker:'Oren Flint',lines:['I used to maintain those dredgers. The engine has put a storm inside every one of them.','Their joints still lock under impact. Break their posture with the hammer, then drive the lance through the exposed core.','The governor case is up the cut. Clear its patrol before you touch the clamps.']});
  else if(l.type==='chart')this.emit('dialogue',{speaker:'Crew field chart',lines:['BLACKGLASS CUT: west. SEVERED SPIRE: northeast. COPPER REACHES: east. Each field station holds a governor tooth.','Amber pressure builds with each hit. A last-moment dodge through a marked attack supplies an extra burst.','Find survey cases to reinforce your rig. Repairs are available at the anchorage.']});
  else if(l.type==='bench'){this.player.hp=this.maxHP;this.player.charge=Math.max(30,this.player.charge);this.fx('repair',l.x,l.z,1);this.emit('toast',{text:'Rig repaired. Pressure primed.'});}
  else if(l.type==='cache'){p.caches.push(l.id);this.player.hp=Math.min(this.maxHP,this.player.hp+35);this.fx('salvage',l.x,l.z,1);this.emit('salvage',{count:p.caches.length});}
  else if(l.type==='station'){
   if(p.teeth.includes(l.id)){this.emit('toast',{text:'Governor tooth secured.'});return;}
   if(this.enemies.some(e=>this.active(e)&&distance(e,l)<9)){this.emit('toast',{text:'The clamps are locked. Clear the station patrol first.'});return;}
   p.teeth.push(l.id);this.player.hp=Math.min(this.maxHP,this.player.hp+35);this.player.charge=100;this.fx('salvage',l.x,l.z,1.3);this.emit('tooth',{count:p.teeth.length});if(p.teeth.length===3)this.emit('awaken');
  }
  this.emit('save');
 }
 quest(){const p=this.progress;
  if(p.returned)return {title:'A sky worth fighting for',detail:'Find the remaining survey cases. The anchorage is safe.',count:p.caches.length+' / 3 rig reinforcements',target:null};
  if(p.won)return {title:'Bring the crew home',detail:'Return to Sera at the Last Anchorage.',count:'Engine severed',target:LANDMARKS[0]};
  if(!p.briefed)return {title:'Report to Sera',detail:'Find the pilot beside the mooring engine.',count:'The Last Anchorage',target:LANDMARKS[0]};
  if(p.teeth.length===3)return {title:'Sever the storm',detail:'Face the Keelbreaker at the northern engine scar. Break its posture, then strike its core.',count:'Governor complete',target:LANDMARKS.find(l=>l.id==='engine')};
  const target=LANDMARKS.filter(l=>l.type==='station'&&!p.teeth.includes(l.id)).sort((a,b)=>distance(a,this.player)-distance(b,this.player))[0];return {title:'Rebuild the governor',detail:'Clear the field stations and recover three engine teeth. Any route. Any weapon.',count:p.teeth.length+' / 3 teeth recovered',target};
 }
 update(dt,input={x:0,z:0}){
  dt=clamp(dt,0,.05);this.time+=dt;const p=this.player;
  // Impact freeze stops motion briefly while the renderer continues the impact flash.
  if(this.hitstop>0){this.hitstop=Math.max(0,this.hitstop-dt);return;}
  for(const k of ['recovery','dodge','dash','invulnerable','flash','comboWindow'])p[k]=Math.max(0,p[k]-dt);
  const len=Math.hypot(input.x||0,input.z||0);p.move=Math.min(1,len);
  if(len>.08&&!p.attack){p.yaw=Math.atan2(input.x,input.z);if(p.dash===0)this.move(p,input.x/Math.max(1,len)*WEAPONS[p.weapon].speed*dt,input.z/Math.max(1,len)*WEAPONS[p.weapon].speed*dt);}
  if(p.attack){const a=p.attack;a.age+=dt;if(!a.hit&&a.age>=a.windup){a.hit=true;this.resolveAttack(a);}if(a.age>=a.duration)p.attack=null;}
  if(p.dash>0)this.move(p,Math.sin(p.yaw)*27*dt,Math.cos(p.yaw)*27*dt);
  if(this.progress.gentle&&this.time-p.lastHit>5)p.hp=Math.min(this.maxHP,p.hp+6*dt);
  for(const e of this.enemies){
   if(!this.active(e))continue;const s=ENEMIES[e.type];e.flash=Math.max(0,e.flash-dt);e.cooldown=Math.max(0,e.cooldown-dt);e.posture=Math.max(0,e.posture-dt*3);
   if(Math.abs(e.knockX)+Math.abs(e.knockZ)>.1){this.move(e,e.knockX*dt,e.knockZ*dt);e.knockX*=Math.exp(-7*dt);e.knockZ*=Math.exp(-7*dt);}
   const d=distance(e,p),home=distance(e,{x:e.homeX,z:e.homeZ});
   if(e.state==='windup'){
    e.timer-=dt;if(e.timer<=0){
     if(e.type==='kite'){this.shots.push({id:++this.serial,x:e.x,z:e.z,vx:Math.sin(e.attackYaw)*14,vz:Math.cos(e.attackYaw)*14,life:2.5,damage:s.damage});}
     else{if(inStrike({x:e.attackX,z:e.attackZ,yaw:e.attackYaw},p,s.reach,s.width))this.hurtPlayer(s.damage);this.fx('enemy-strike',e.attackX,e.attackZ,.4,{yaw:e.attackYaw,reach:s.reach,width:s.width,heavy:e.type==='engine'});if(e.type==='engine'&&e.hp<s.hp*.5)for(const offset of [-.5,.5])this.shots.push({id:++this.serial,x:e.x,z:e.z,vx:Math.sin(e.attackYaw+offset)*10,vz:Math.cos(e.attackYaw+offset)*10,life:2,damage:15});}
     e.state='recover';e.timer=s.recovery;e.cooldown=s.cooldown;e.attackCount++;this.emit('enemy-strike');
    }
   }else if(e.state==='recover'||e.state==='stagger'){e.timer-=dt;if(e.timer<=0)e.state='idle';}
   else if(d<s.aggro&&home<24){e.yaw=Math.atan2(p.x-e.x,p.z-e.z);if(d<s.reach-.5&&e.cooldown===0){e.state='windup';e.timer=s.windup;e.attackX=e.x;e.attackZ=e.z;e.attackYaw=e.yaw;}else if(d>Math.max(2,s.reach*.55))this.move(e,(p.x-e.x)/d*s.speed*dt,(p.z-e.z)/d*s.speed*dt,s.radius*.45);}
   else if(home>.3)this.move(e,(e.homeX-e.x)/home*s.speed*dt,(e.homeZ-e.z)/home*s.speed*dt);
  }
  for(const shot of this.shots){shot.x+=shot.vx*dt;shot.z+=shot.vz*dt;shot.life-=dt;if(distance(shot,p)<1.1){if(p.invulnerable>0&&p.dash>0){p.charge=Math.min(100,p.charge+10);this.emit('perfect');}this.hurtPlayer(shot.damage);shot.life=0;}}
  this.shots=this.shots.filter(s=>s.life>0);
  for(const f of this.effects)f.life-=dt;this.effects=this.effects.filter(f=>f.life>0);
  for(const item of this.pickups){item.life-=dt;const d=distance(item,p);if(d<9){item.x+=(p.x-item.x)*dt*5;item.z+=(p.z-item.z)*dt*5;}if(d<1.3){p.hp=Math.min(this.maxHP,p.hp+12);p.charge=Math.min(100,p.charge+8);item.life=0;this.fx('repair',p.x,p.z,.4);this.emit('pickup');}}
  this.pickups=this.pickups.filter(i=>i.life>0);
 }
}
