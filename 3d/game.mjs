import {SAVE_KEY,FORMS,ARTS,ENEMIES,ENEMY_SPAWNS,LANDMARKS,clamp,distance,walkable} from './world-data.mjs';

export function freshProgress(){return {version:1,x:0,z:24,form:'nobody',art:'cartwheel',hp:100,metMayor:false,kills:0,beacons:[],defeated:[],chests:[],won:false,returned:false,unlocked:['nobody'],gentle:false,sound:true,quality:'balanced'};}
export function readProgress(storage){
  try{
    const p=JSON.parse(storage.getItem(SAVE_KEY));if(!p||p.version!==1)return freshProgress();
    const d=freshProgress();
    for(const k of ['metMayor','won','returned','gentle','sound'])if(typeof p[k]==='boolean')d[k]=p[k];
    d.beacons=Array.isArray(p.beacons)?[...new Set(p.beacons.filter(v=>['hollow','tower','shore'].includes(v)))]:[];
    d.defeated=Array.isArray(p.defeated)?[...new Set(p.defeated.filter(v=>Number.isInteger(v)&&v>=0&&v<ENEMY_SPAWNS.length))]:[];
    d.chests=Array.isArray(p.chests)?[...new Set(p.chests.filter(v=>LANDMARKS.some(l=>l.type==='chest'&&l.id===v)))]:[];
    d.kills=Number.isFinite(p.kills)?clamp(Math.floor(p.kills),0,1e5):0;
    d.unlocked=['nobody'];if(d.kills>=3)d.unlocked.push('rat');if(d.beacons.includes('hollow'))d.unlocked.push('knight');
    d.form=d.unlocked.includes(p.form)?p.form:'nobody';d.art=ARTS[p.art]&&d.unlocked.includes(ARTS[p.art].form)?p.art:'cartwheel';
    if(Number.isFinite(p.x)&&Number.isFinite(p.z)&&walkable(p.x,p.z)){d.x=p.x;d.z=p.z;}
    d.hp=Number.isFinite(p.hp)?clamp(p.hp,1,FORMS[d.form].hp):FORMS[d.form].hp;
    if(['balanced','low','high'].includes(p.quality))d.quality=p.quality;
    return d;
  }catch{return freshProgress();}
}
export function saveProgress(storage,game){
  const p={...game.progress,x:game.player.x,z:game.player.z,hp:game.player.hp,form:game.player.form,art:game.player.art};
  try{storage.setItem(SAVE_KEY,JSON.stringify(p));return true;}catch{return false;}
}
export class Game {
  constructor(progress=freshProgress()){
    this.progress=progress;this.time=0;this.events=[];this.effects=[];this.projectiles=[];this.pickups=[];this.serial=0;
    this.player={x:progress.x,z:progress.z,form:progress.form,art:progress.art,hp:progress.hp,yaw:Math.PI,attack:0,special:0,dodge:0,invulnerable:0,dash:0,shield:0,flash:0,anim:0,move:0,lastHit:-20};
    this.enemies=ENEMY_SPAWNS.map(([type,x,z],id)=>({id,type,x,z,homeX:x,homeZ:z,hp:ENEMIES[type].hp,alive:!progress.defeated.includes(id),yaw:0,state:'idle',timer:id*.17,cooldown:1,poison:0,poisonTick:0,flash:0,knockX:0,knockZ:0,attackX:x,attackZ:z}));
    this.events.push({type:'ready'});
  }
  emit(type,detail={}){this.events.push({type,...detail});}
  fx(type,x,z,life=.5,extra={}){this.effects.push({id:++this.serial,type,x,z,life,maxLife:life,...extra});}
  setForm(form){
    if(!this.progress.unlocked.includes(form)||this.player.form===form)return false;
    const p=this.player;const ratio=p.hp/FORMS[p.form].hp;p.form=form;p.hp=ratio*FORMS[form].hp;this.progress.form=form;
    this.fx('shift',p.x,p.z,.7);this.emit('shift',{form});return true;
  }
  setArt(art){if(!ARTS[art]||!this.progress.unlocked.includes(ARTS[art].form))return false;this.player.art=art;this.progress.art=art;this.emit('save');return true;}
  nearestEnemy(range=10){return this.enemies.filter(e=>e.alive&&(e.type!=='warden'||this.progress.beacons.length===3)&&distance(e,this.player)<range).sort((a,b)=>distance(a,this.player)-distance(b,this.player))[0];}
  attack(){
    const p=this.player;if(p.attack>0)return false;
    const f=FORMS[p.form];p.attack=f.cooldown;p.anim=.25;
    const target=this.nearestEnemy(f.range+1.5);if(target)p.yaw=Math.atan2(target.x-p.x,target.z-p.z);
    this.fx('slash',p.x,p.z,.24,{yaw:p.yaw,form:p.form,radius:f.range});this.emit('attack',{form:p.form});
    for(const e of this.enemies){
      const dx=e.x-p.x,dz=e.z-p.z,d=Math.hypot(dx,dz);
      if(e.alive&&d<f.range+ENEMIES[e.type].radius*.35&&(d<1.5||(dx*Math.sin(p.yaw)+dz*Math.cos(p.yaw))/d>-.15)){
        this.hurtEnemy(e,f.damage,p.form==='rat'?4:0,2.5);
      }
    }
    return true;
  }
  special(){
    const p=this.player;if(p.special>0)return false;
    p.special=ARTS[p.art].cooldown;
    if(p.art==='cartwheel'){p.dash=.42;p.invulnerable=.6;this.fx('roll',p.x,p.z,.45);}
    if(p.art==='poison'){this.fx('cloud',p.x,p.z,4,{radius:5,tick:0});}
    if(p.art==='spin'){p.shield=2;this.fx('spin',p.x,p.z,.5,{radius:6});for(const e of this.enemies)if(e.alive&&distance(e,p)<6)this.hurtEnemy(e,40,0,7);}
    this.emit('special',{art:p.art});return true;
  }
  dodge(){const p=this.player;if(p.dodge>0)return false;p.dodge=1.2;p.dash=.22;p.invulnerable=.35;this.fx('dust',p.x,p.z,.35);this.emit('dodge');return true;}
  hurtEnemy(e,amount,poison=0,knock=0){
    if(!e.alive||(e.type==='warden'&&this.progress.beacons.length<3))return;
    e.hp-=amount;e.flash=.13;e.poison=Math.max(e.poison,poison);
    const d=Math.max(.1,distance(e,this.player));e.knockX=(e.x-this.player.x)/d*knock;e.knockZ=(e.z-this.player.z)/d*knock;
    this.fx('hit',e.x,e.z,.35,{amount:Math.round(amount),color:poison?'#bedc7b':'#fff5c8'});this.emit('hit');
    if(e.hp<=0){
      e.alive=false;this.progress.kills++;this.progress.defeated.push(e.id);this.fx('burst',e.x,e.z,.65,{color:e.type==='warden'?0xf7d57b:0xb7dba3});this.emit('kill',{enemy:e.type});
      this.pickups.push({id:++this.serial,x:e.x,z:e.z,heal:e.type==='warden'?100:14,life:120});
      if(this.progress.kills>=3&&!this.progress.unlocked.includes('rat')){this.progress.unlocked.push('rat');this.emit('unlock',{form:'rat'});}
      if(e.type==='warden'){this.progress.won=true;this.emit('victory');}
      this.emit('save');
    }
  }
  hurtPlayer(amount){
    const p=this.player;if(p.invulnerable>0)return;
    p.hp-=amount*(this.progress.gentle?.4:1)*(p.shield>0?.25:1);p.invulnerable=.85;p.flash=.3;p.lastHit=this.time;this.emit('damage');
    if(p.hp<=0){p.x=0;p.z=24;p.hp=FORMS[p.form].hp;p.invulnerable=3;p.dash=0;this.emit('respawn');
      for(const e of this.enemies){if(e.alive){e.x=e.homeX;e.z=e.homeZ;e.hp=ENEMIES[e.type].hp;e.state='idle';e.cooldown=2;e.poison=0;}}
      this.projectiles=[];this.effects=[];this.emit('save');
    }
  }
  move(entity,dx,dz,radius=.55){
    const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.35));
    for(let i=0;i<steps;i++){if(walkable(entity.x+dx/steps,entity.z,radius))entity.x+=dx/steps;if(walkable(entity.x,entity.z+dz/steps,radius))entity.z+=dz/steps;}
  }
  nearby(){return LANDMARKS.filter(l=>l.type!=='boss'&&distance(l,this.player)<l.radius&&!(l.type==='chest'&&this.progress.chests.includes(l.id))).sort((a,b)=>distance(a,this.player)-distance(b,this.player))[0];}
  interact(){
    const l=this.nearby();if(!l)return;
    const p=this.progress;
    if(l.id==='mayor'){
      p.metMayor=true;
      if(p.won){p.returned=true;this.emit('dialogue',{speaker:'Mayor Maybe',lines:['Nobody saved everybody. The grammar department is furious.','The lanterns are lit, the roads are safe, and our hero is exactly the right shape. Whatever shape that happens to be.','Thank you for keeping an unfinished promise. Greenfield is yours to wander. There may still be a picnic or two to find.']});}
      else this.emit('dialogue',{speaker:'Mayor Maybe',lines:['Welcome! Our hero request was addressed to Somebody. You are close enough for local government.','Three lanterns have gone out. Light the Hollow, the Watch, and the Tide, and the old Warden will finally wake up.','Start with the creatures by the signpost. Every little victory helps you discover somebody else you can be.']});
    }else if(l.id==='pebble')this.emit('dialogue',{speaker:'Pebble',lines:['I was told to point toward danger. Nobody remembered to tell me when to stop.','That little opening belongs to the Hollow lantern. The Rat will fit. The Knight will mostly complain.','Once you learn a form, you can borrow its art in any other body. A knight with a poison cloud? I am saying nothing to the licensing board.']});
    else if(l.type==='sign')this.emit('dialogue',{speaker:'A surprisingly helpful sign',lines:['GREENFIELD: Town to the south. Hollow to the west. Old Watch to the northeast. Sunwash Coast to the east.','Follow the sandy paths. Change shape whenever one answer fails. Cartwheel through danger. Take a breather by a campfire.','The map marks all three lanterns. There is no time limit. Somebody tried to introduce one. We lost the paperwork.']});
    else if(l.type==='camp'){this.player.hp=FORMS[this.player.form].hp;this.player.special=0;this.emit('toast',{text:'Rested. Hearts and borrowed art restored.'});this.fx('heal',l.x,l.z,1);}
    else if(l.type==='chest'){p.chests.push(l.id);this.player.hp=Math.min(FORMS[this.player.form].hp,this.player.hp+35);this.fx('treasure',l.x,l.z,1);this.emit('treasure',{count:p.chests.length});}
    else if(l.type==='beacon'){
      if(p.beacons.includes(l.id)){this.emit('toast',{text:'This promise is already shining.'});return;}
      if(l.form&&this.player.form!==l.form){this.emit('toast',{text:l.form==='rat'?'A small tunnel. This looks like a job for Rat.':'A heavy seal. Knight can lift it.'});return;}
      p.beacons.push(l.id);this.player.hp=FORMS[this.player.form].hp;this.fx('beacon',l.x,l.z,2);this.emit('beacon',{id:l.id});
      if(l.id==='hollow'&&!p.unlocked.includes('knight')){p.unlocked.push('knight');this.emit('unlock',{form:'knight'});}
      if(p.beacons.length===3)this.emit('awaken');
    }
    this.emit('save');
  }
  quest(){
    const p=this.progress;
    if(p.returned)return {title:'A promise kept.',detail:'Explore, try new combinations, and find the three hidden chests.',count:`${p.chests.length} / 3 secrets found`,target:null};
    if(p.won)return {title:'Somebody should hear about this.',detail:'Return to Mayor Maybe in Sunrise Town.',count:'The Warden is at peace',target:LANDMARKS[0]};
    if(!p.metMayor)return {title:'A town looking for Somebody',detail:'Speak to Mayor Maybe beside the fountain.',count:'Find the golden speech marker',target:LANDMARKS[0]};
    if(!p.unlocked.includes('rat'))return {title:'Find your first new shape',detail:'Defeat 3 creatures on the road north of town.',count:`${Math.min(3,p.kills)} / 3 creatures defeated`,target:{x:1,z:3}};
    if(!p.beacons.includes('hollow'))return {title:'Small enough to make a difference',detail:'Become Rat and light the Hollow lantern in the west.',count:`${p.beacons.length} / 3 lanterns lit`,target:LANDMARKS.find(l=>l.id==='hollow')};
    if(!p.beacons.includes('tower'))return {title:'A little weight behind your words',detail:'Become Knight and lift the seal at the Old Watch.',count:`${p.beacons.length} / 3 lanterns lit`,target:LANDMARKS.find(l=>l.id==='tower')};
    if(!p.beacons.includes('shore'))return {title:'One more light along the coast',detail:'Light the Tide lantern on the eastern shore.',count:'2 / 3 lanterns lit',target:LANDMARKS.find(l=>l.id==='shore')};
    return {title:'Finish an old promise',detail:'Meet the Warden at the northern standing stones. Dodge the red circles.',count:'All three lanterns are shining',target:LANDMARKS.find(l=>l.id==='warden')};
  }
  update(dt,input={x:0,z:0}){
    dt=clamp(dt,0,.05);this.time+=dt;const p=this.player;
    for(const k of ['attack','special','dodge','invulnerable','dash','shield','flash','anim'])p[k]=Math.max(0,p[k]-dt);
    const length=Math.hypot(input.x||0,input.z||0);p.move=Math.min(1,length);
    if(length>.05){p.yaw=Math.atan2(input.x,input.z);if(p.dash===0)this.move(p,input.x/Math.max(1,length)*FORMS[p.form].speed*dt,input.z/Math.max(1,length)*FORMS[p.form].speed*dt,p.form==='rat'?.32:.55);}
    if(p.dash>0){this.move(p,Math.sin(p.yaw)*24*dt,Math.cos(p.yaw)*24*dt);if(p.art==='cartwheel'&&p.special>ARTS.cartwheel.cooldown-.6)for(const e of this.enemies)if(e.alive&&distance(e,p)<2.8&&e.flash<=0)this.hurtEnemy(e,18,0,4);}
    if(this.progress.gentle&&this.time-p.lastHit>6)p.hp=Math.min(FORMS[p.form].hp,p.hp+5*dt);
    for(const e of this.enemies){
      if(!e.alive)continue;const stats=ENEMIES[e.type];
      e.flash=Math.max(0,e.flash-dt);e.cooldown=Math.max(0,e.cooldown-dt);
      if(e.type==='warden'&&this.progress.beacons.length<3)continue;
      if(e.poison>0){e.poison-=dt;e.poisonTick-=dt;if(e.poisonTick<=0){e.poisonTick=.5;this.hurtEnemy(e,4);if(!e.alive)continue;}}
      if(Math.abs(e.knockX)+Math.abs(e.knockZ)>.1){this.move(e,e.knockX*dt,e.knockZ*dt);e.knockX*=Math.exp(-7*dt);e.knockZ*=Math.exp(-7*dt);}
      const d=distance(e,p),home=distance(e,{x:e.homeX,z:e.homeZ});
      if(e.state==='windup'){
        e.timer-=dt;
        if(e.timer<=0){
          if(e.type==='wisp'){
            const dx=e.attackX-e.x,dz=e.attackZ-e.z,m=Math.hypot(dx,dz)||1;this.projectiles.push({id:++this.serial,x:e.x,z:e.z,vx:dx/m*12,vz:dz/m*12,life:3,damage:stats.damage});
          }else{
            if(distance(p,{x:e.attackX,z:e.attackZ})<stats.range+.35)this.hurtPlayer(stats.damage);
            this.fx('slam',e.attackX,e.attackZ,.4,{radius:stats.range,boss:e.type==='warden'});
          }
          e.state='recover';e.timer=.5;e.cooldown=stats.cooldown*(e.type==='warden'&&e.hp<stats.hp/2?.7:1);this.emit('enemy-attack');
        }
      }else if(e.state==='recover'){e.timer-=dt;if(e.timer<=0)e.state='idle';}
      else if(d<stats.aggro&&home<22){
        e.yaw=Math.atan2(p.x-e.x,p.z-e.z);
        if(d<stats.range+.4&&e.cooldown===0){e.state='windup';e.timer=stats.windup;e.attackX=e.type==='wisp'?p.x:e.x;e.attackZ=e.type==='wisp'?p.z:e.z;}
        else if(d>Math.max(1.7,stats.range*.65))this.move(e,(p.x-e.x)/d*stats.speed*dt,(p.z-e.z)/d*stats.speed*dt,stats.radius*.5);
      }else if(home>.3){this.move(e,(e.homeX-e.x)/home*stats.speed*dt,(e.homeZ-e.z)/home*stats.speed*dt);}
    }
    for(const shot of this.projectiles){shot.x+=shot.vx*dt;shot.z+=shot.vz*dt;shot.life-=dt;if(distance(shot,p)<1.2){this.hurtPlayer(shot.damage);shot.life=0;}}
    this.projectiles=this.projectiles.filter(s=>s.life>0);
    for(const f of this.effects){f.life-=dt;if(f.type==='cloud'){f.tick-=dt;if(f.tick<=0){f.tick=.5;for(const e of this.enemies)if(e.alive&&distance(e,f)<f.radius)this.hurtEnemy(e,3,3);}}}
    this.effects=this.effects.filter(f=>f.life>0);
    for(const item of this.pickups){item.life-=dt;const d=distance(item,p);if(d<7){item.x+=(p.x-item.x)*dt*5;item.z+=(p.z-item.z)*dt*5;}if(d<1.4){p.hp=Math.min(FORMS[p.form].hp,p.hp+item.heal);item.life=0;this.fx('heal',p.x,p.z,.6);this.emit('pickup');}}
    this.pickups=this.pickups.filter(i=>i.life>0);
  }
}
