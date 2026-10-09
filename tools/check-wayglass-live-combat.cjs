#!/usr/bin/env node
'use strict';
// Earned checkpoint; native AI, health, ward, attack timers and vulnerability.
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs'),collect=require('../tests/helpers/collect-treasure.cjs');
const cases=[];for(const form of ['ranger','colossus'])for(const double of [false,true])for(const heart of [false,true])for(const guardian of [false,true])cases.push({form,double,heart,guardian});cases.push({form:'ranger',double:false,heart:true,guardian:false,first:true});
for(const {form,double,heart,guardian,first=false} of (process.argv.includes('--first-only')?cases.filter(c=>c.first):cases)){
 const r=runtime(),{G}=r;let seed=0x12345678;r.context.Math=Object.create(Math);r.context.Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.state.items.push('trophy-mire-pearl');G.ensureTown().requests.push('beacon');G.state.claimedForms.push('ranger','dragon',form);G.questsDone.push(...G.forms.dragon.quests.slice(0,2).map(q=>q.id));
 if(!first){G.state.items.push('riftblade-sigil');G.state.claimedForms.push('riftblade');}Object.assign(G.state.guardianChallenges.mira,{counterLearned:!first,doubleReturn:double});G.setComfortSetting('easyMode',heart);G.setComfortSetting('bossAssistance',guardian);G.setForm(form);if(form==='colossus')G.state.loadouts.colossus=['pillarFist','arrow'];
 r.load('riftbladeTrial');r.drain();if(!first)assert.ok(G.beginWayglassRematch());const e=G.state.enemies.find(e=>!e.dead&&e.id==='riftbladeAdept'),p=G.state.player;
 Object.assign(p,{x:e.x-65,y:e.y,mana:0,manaRegenDelay:1000});G.input.takeAim=()=>({...G.input.aim,dragged:true});
 const startStars=G.state.stars,startItems=[...G.state.items],byPhase={};let earned=0,gifts=0,seconds=0,paid=0;
 G.events.on('questDone',()=>earned++);G.events.on('pickup',a=>{if(a.item==='riftblade-sigil')gifts++;});G.events.on('abilityUse',({ability})=>{if(G.abilityManaCost(G.abilities[ability])>0)paid++;});G.events.on('guardianCounter',a=>{if(a.guardian==='riftbladeAdept')byPhase[e.bossPhase]=(byPhase[e.bossPhase]||0)+1;});
 for(let i=0;i<18000&&!e.dead;i++){
  const dt=.025,mirror=G.state.enemies.find(m=>!m.dead&&m.wayglassReflector?.owner===e),fields=G.state.bossHazards.filter(h=>h.owner===e),charge=(e.bossPendingAction==='charge'&&e.bossTelegraphT>0)||e.bossChargeT>0;
  let target={x:e.x+(e.x>224?-65:65),y:e.y},aim=e,attack=null;
  if(charge){const nx=-e.bossChargeY,ny=e.bossChargeX;const side=(p.x-e.x)*nx+(p.y-e.y)*ny>=0?1:-1;target={x:e.x+nx*side*65,y:e.y+ny*side*65};}
  else if(mirror){
   const a=Math.atan2(mirror.y-e.y,mirror.x-e.x),nx=-Math.sin(a),ny=Math.cos(a);const side=(p.x-mirror.x)*nx+(p.y-mirror.y)*ny>=0?1:-1;
   target={x:mirror.x+nx*side*(mirror.wayglassReflector.armed?65:18),y:mirror.y+ny*side*(mirror.wayglassReflector.armed?65:18)};aim=mirror;
   if(!G.world.isSafeSpawn(target.x,target.y))target={x:mirror.x-nx*side*(mirror.wayglassReflector.armed?65:18),y:mirror.y-ny*side*(mirror.wayglassReflector.armed?65:18)};
   if(!mirror.wayglassReflector.armed&&Math.hypot(p.x-mirror.x,p.y-mirror.y)<(form==='ranger'?85:30))attack='a';
  }else if(fields.length){const h=fields[0],a=Math.atan2(h.y-e.y,h.x-e.x),nx=-Math.sin(a),ny=Math.cos(a),side=(p.x-e.x)*nx+(p.y-e.y)*ny>=0?1:-1;target={x:e.x+nx*side*80,y:e.y+ny*side*80};}
  else if(!fields.length&&(byPhase[e.bossPhase]||0)>0&&Math.hypot(p.x-e.x,p.y-e.y)<100)attack=form==='ranger'?'a':'b';
  const dx=aim.x-p.x,dy=aim.y-p.y,d=Math.hypot(dx,dy)||1;G.input.aim={x:dx/d,y:dy/d};if(attack)r.taps.add(attack);
  const vx=target.x-p.x,vy=target.y-p.y,m=Math.hypot(vx,vy),desired=m>2?{x:vx/m,y:vy/m}:{x:0,y:0},speed=G.forms[form].speed,shots=G.state.projectiles.filter(s=>!s.fromPlayer&&!s.dispelled&&!s.wayglassPractice);
  const choices=[desired,{x:0,y:0},...Array.from({length:16},(_,j)=>({x:Math.cos(j*Math.PI/8),y:Math.sin(j*Math.PI/8)}))];
  const score=v=>{let cost=Math.hypot(p.x+v.x*speed*.3-target.x,p.y+v.y*speed*.3-target.y);
   for(let j=1;j<=8;j++){const t=j*.1,x=p.x+v.x*speed*t,y=p.y+v.y*speed*t;if(!G.world.isSafeSpawn(x,y))cost+=1000;
    for(const s of shots){const scale=G.guidanceProjectileScale?.(s)??1,flight=s.speed*scale*t;let sx=s.x,sy=s.y;
     if(s.returning){const a=Math.atan2(e.y-6-s.y,e.x-s.x);sx+=Math.cos(a)*flight;sy+=Math.sin(a)*flight;}
     else{const toTurn=Math.max(0,s.outboundRange-(s.travel||0)),out=Math.min(flight,toTurn);sx+=s.vx/s.speed*out;sy+=s.vy/s.speed*out;if(flight>out){const a=Math.atan2(e.y-6-sy,e.x-sx);sx+=Math.cos(a)*(flight-out);sy+=Math.sin(a)*(flight-out);}}
     cost+=Math.max(0,s.size+10-Math.hypot(x-sx,y-5-sy))**2*15;
    }
    if(charge){const origin={x:e.x,y:e.y};if(e.bossChargeT>0){origin.x+=e.bossChargeX*e.def.boss.chargeSpeed*Math.min(t,e.bossChargeT);origin.y+=e.bossChargeY*e.def.boss.chargeSpeed*Math.min(t,e.bossChargeT);}else if(t>=e.bossTelegraphT){origin.x+=e.bossChargeX*e.def.boss.chargeSpeed*Math.min(t-e.bossTelegraphT,e.def.boss.chargeDur);origin.y+=e.bossChargeY*e.def.boss.chargeSpeed*Math.min(t-e.bossTelegraphT,e.def.boss.chargeDur);}cost+=Math.max(0,20-Math.hypot(x-origin.x,y-origin.y))**2*20;}
   }return cost;};choices.sort((a,b)=>score(a)-score(b));G.input.vec=choices[0];r.step(dt);r.drain();seconds+=dt;
  assert.ok(!G.state.knockout,JSON.stringify({form,double,heart,guardian,seconds,hp:e.hp,ward:e.ward.hp,damage:p.damageTaken,byPhase,x:e.x,y:e.y,px:p.x,py:p.y,mirror:mirror&&{x:mirror.x,y:mirror.y,armed:mirror.wayglassReflector.armed},fields:fields.map(h=>({x:h.x,y:h.y,t:h.t,warning:h.warning,delay:h.delay})),pending:e.bossPendingAction}));
 }
 assert.equal(e.dead,true,JSON.stringify({form,double,heart,guardian,seconds,hp:e.hp,ward:e.ward.hp,damage:p.damageTaken,byPhase,x:e.x,y:e.y,px:p.x,py:p.y}));assert.equal(e.bossPhase,3);for(const phase of [1,2,3])assert.ok(byPhase[phase]>=1);assert.equal(paid,0);assert.equal(G.state.stars,startStars+earned);assert.equal(gifts,0);assert.deepEqual([...G.state.items],startItems);
 if(first){assert.ok(G.groundRewardFor('riftblade-sigil'));G.input.vec={x:0,y:0};collect(r,'riftblade-sigil');assert.equal(G.state.stars,startStars+earned+1);assert.equal(gifts,1);assert.equal(G.wayglassVisitReady(),false);assert.ok(G.formReady('riftblade'));assert.ok(G.formEchoFor('riftblade'));assert.ok(!G.state.claimedForms.includes('riftblade'));}else assert.equal(G.groundRewardFor('riftblade-sigil'),null);
 assert.equal(G.state.guardianChallenges.mira.doubleReturnCleared,double);assert.equal(G.comfortSetting('easyMode'),heart);assert.equal(G.comfortSetting('bossAssistance'),guardian);
 console.log(JSON.stringify({form,double,heart,guardian,first,seconds:+seconds.toFixed(2),counters:e.wayglassCounters,byPhase,damage:p.damageTaken,mana:p.mana,paidCasts:paid,respawns:0,ai:'original'}));
}
