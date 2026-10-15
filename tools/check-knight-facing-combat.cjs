#!/usr/bin/env node
'use strict';
// Earned-form checkpoint, original Knight and all seven regional foes.
// Learn one native shield response in each phase; no HP/ward/AI/guard edits.
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs'),collect=require('../tests/helpers/collect-treasure.cjs');
const cases=[];for(const form of ['wizard','colossus'])for(const crescent of [false,true])for(const heart of [false,true])for(const guardian of [false,true])cases.push({form,crescent,heart,guardian});
cases.push({form:'wizard',crescent:false,heart:true,guardian:false,first:true});cases.push({form:'wizard',crescent:false,heart:false,guardian:false,first:true,walking:true});
for(const {form,crescent,heart,guardian,first=false,walking=false} of (process.argv.includes('--baseline-only')?cases.slice(0,1):process.argv.includes('--first-only')?cases.filter(c=>c.first&&!c.walking):process.argv.includes('--walking-only')?cases.filter(c=>c.walking):cases)){
 const r=runtime(),{G}=r;
 Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.state.items.push('trophy-mire-pearl');G.ensureTown().requests.push('beacon');G.state.claimedForms.push('wizard',form);G.setForm(form);assert.equal(G.state.formId,form);if(form==='colossus')G.state.loadouts.colossus=['pillarFist','curse'];
 if(!first){G.state.items.push('trophy-eclipse-sigil');G.ensureTown().requests.push('ridge-watch');}Object.assign(G.state.guardianChallenges.knight,{counterLearned:!first,crescent});G.setComfortSetting('easyMode',heart);G.setComfortSetting('bossAssistance',guardian);
 r.load('emberRidge');r.drain();if(!first)assert.ok(G.beginEclipseRematch());const e=G.state.enemies.find(e=>!e.dead&&e.id==='eclipseKnight'),p=G.state.player;
 Object.assign(p,{x:e.x+50,y:e.y,mana:0,manaRegenDelay:1000});G.input.takeAim=()=>({...G.input.aim,dragged:true});
 const native={hp:e.hp,ward:e.ward.hp,speed:e.def.speed},startStars=G.state.stars,startItems=[...G.state.items],byPhase={},pairedByPhase={};let earned=0,gifts=0,seconds=0,paid=0,actualDamage=0;G.events.on('playerHurt',a=>{actualDamage+=a.damage;if(process.argv.includes('--trace'))console.log(JSON.stringify({hurt:true,seconds,phase:e.bossPhase,p:{x:p.x,y:p.y},e:{x:e.x,y:e.y},source:a,fields:G.state.bossHazards.filter(h=>h.owner===e).map(h=>({angle:h.angle,x:h.x,y:h.y,t:h.t,warning:h.warning,delay:h.delay,active:h.active})),pairedByPhase}));});
 G.events.on('questDone',()=>earned++);G.events.on('pickup',a=>{if(a.item==='trophy-eclipse-sigil')gifts++;});G.events.on('abilityUse',({ability})=>{if(G.abilityManaCost(G.abilities[ability])>0)paid++;});G.events.on('guardianCounter',a=>{if(a.guardian==='eclipseKnight'){byPhase[e.bossPhase]=(byPhase[e.bossPhase]||0)+1;if(G.state.bossHazards.some(h=>h.owner===e&&h.kind==='eclipseSweep'&&h.delay>0))pairedByPhase[e.bossPhase]=true;}});
 for(let i=0;i<14000&&!e.dead;i++){
  const dt=.025,fields=G.state.bossHazards.filter(h=>h.owner===e),h=fields.find(h=>h.t>=(h.delay||0)),raised=G.eclipseShieldRaised(e),dist=Math.hypot(e.x-p.x,e.y-p.y),dx=e.x-p.x,dy=e.y-p.y,d=dist||1;G.input.aim={x:dx/d,y:dy/d};r.taps.clear();
  const side=e.x>405?-1:1;let target={x:e.x+side*30,y:e.y};
  if(h){const first=fields.find(f=>!f.delay),next=fields.find(f=>f.delay>0),choice=!walking&&first&&next&&!pairedByPhase[e.bossPhase]&&h===first&&h.t<h.warning-.1,angle=h.angle+(choice?Math.PI/3:Math.PI/2);target={x:e.x+Math.cos(angle)*(form==='wizard'?38:24),y:e.y+Math.sin(angle)*(form==='wizard'?38:24)};if((walking||choice||e.bossPhase===1||pairedByPhase[e.bossPhase])&&(!walking||Math.abs(G.util.angleDiff(Math.atan2(p.y-e.y,p.x-e.x),h.angle))>70*Math.PI/180)&&dist<=(form==='wizard'?52:31))r.taps.add(choice?'a':form==='wizard'?'a':e.ward.hp>0?'b':'a');}
  else if(raised){const angle=Math.atan2(e.bossChargeY,e.bossChargeX)+Math.PI/2;target={x:e.x+Math.cos(angle)*26,y:e.y+Math.sin(angle)*26};if(!walking&&!byPhase[e.bossPhase]&&dist<=(form==='wizard'?52:30))r.taps.add('a');}
  else if((walking||(e.bossPhase===1?byPhase[e.bossPhase]:pairedByPhase[e.bossPhase]))&&dist<=53)r.taps.add(form==='wizard'?'a':e.ward.hp>0?'b':'a');
  if(!G.world.isSafeSpawn(target.x,target.y))target=G.world.safeArrival(target.x,target.y);
  const vx=target.x-p.x,vy=target.y-p.y,m=Math.hypot(vx,vy),desired=m>1.5?{x:vx/m,y:vy/m}:{x:0,y:0};
  const shots=G.state.projectiles.filter(s=>!s.fromPlayer&&!s.dispelled),speed=G.forms[form].speed;
  const choices=[desired,{x:0,y:0},...Array.from({length:16},(_,j)=>({x:Math.cos(j*Math.PI/8),y:Math.sin(j*Math.PI/8)}))];
  const score=v=>{let cost=Math.hypot(p.x+v.x*speed*.3-target.x,p.y+v.y*speed*.3-target.y);
   for(let j=1;j<=8;j++){const t=j*.1,toward=m>0?(v.x*vx+v.y*vy)/m:0,travel=toward>.99?Math.min(speed*t,m):speed*t,x=p.x+v.x*travel,y=p.y+v.y*travel;if(!G.world.isSafeSpawn(x,y))cost+=1000;
    for(const s of shots){if(t<s.armT)continue;const scale=G.guidanceProjectileScale?.(s)??1,dist=Math.hypot(x-s.x-s.vx*t*scale,y-5-s.y-s.vy*t*scale);cost+=Math.max(0,(s.size||3)+11-dist)**2*15;}
    for(const b of G.state.enemies){if(b.dead||b.def.practice||b.def.miniboss)continue;const dx=x-b.x,dy=y-b.y,d=Math.hypot(dx,dy)||1,walk=b.def.behavior==='chase'?Math.min(d,b.def.speed*t):0;cost+=Math.max(0,b.def.size/2+9-(d-walk))**2*20;}
    for(const field of fields){const age=field.t+t-(field.delay||0);if(age>=field.warning-.1&&age<field.warning+field.active&&Math.abs(G.util.angleDiff(Math.atan2(y-field.y,x-field.x),field.angle))<=field.halfAngle+.08)cost+=Math.max(0,field.radius+7-Math.hypot(x-field.x,y-field.y))**2*25;}
    const pending=e.bossPendingAction==='charge',charging=e.bossChargeT>0,start=charging?0:e.bossTelegraphT,duration=charging?e.bossChargeT:e.def.boss.chargeDur;
    if((pending||charging)&&t>=start&&t<=start+duration){const ghost={...e};G.world.moveBox(ghost,e.bossChargeX*e.def.boss.chargeSpeed*Math.min(duration,Math.max(0,t-start)),e.bossChargeY*e.def.boss.chargeSpeed*Math.min(duration,Math.max(0,t-start)));cost+=Math.max(0,22-Math.hypot(x-ghost.x,y-ghost.y))**2*50;}

   }return cost;};choices.sort((a,b)=>score(a)-score(b));G.input.vec=choices[0];r.step(dt);r.drain();seconds+=dt;
  assert.ok(!G.state.knockout,JSON.stringify({form,crescent,heart,guardian,seconds,hp:e.hp,ward:e.ward.hp,damage:p.damageTaken,counters:e.eclipseCounters,byPhase,x:p.x,y:p.y}));
 }
 assert.equal(e.dead,true,JSON.stringify({form,crescent,heart,guardian,seconds,hp:e.hp,ward:e.ward.hp,counters:e.eclipseCounters,damage:p.damageTaken,byPhase}));assert.equal(e.bossPhase,3);if(!walking)for(const phase of [2,3])assert.ok(pairedByPhase[phase],JSON.stringify({form,crescent,heart,guardian,pairedByPhase}));assert.equal(paid,0);if(!walking)for(const phase of [1,2,3])assert.ok(byPhase[phase]>=1);else assert.equal(e.eclipseCounters||0,0);
 assert.equal(G.state.stars,startStars+earned);assert.equal(gifts,0);assert.deepEqual([...G.state.items],startItems);
 if(first){assert.ok(G.groundRewardFor('trophy-eclipse-sigil'));G.input.vec={x:0,y:0};collect(r,'trophy-eclipse-sigil');assert.equal(G.state.stars,startStars+earned+1);assert.equal(gifts,1);assert.equal(G.eclipseVisitReady(),false);}else assert.equal(G.groundRewardFor('trophy-eclipse-sigil'),null);
 assert.equal(G.state.guardianChallenges.knight.crescentCleared,crescent);assert.equal(G.comfortSetting('easyMode'),heart);assert.equal(G.comfortSetting('bossAssistance'),guardian);
 console.log(JSON.stringify({form,crescent,heart,guardian,first,walking,seconds:+seconds.toFixed(2),counters:e.eclipseCounters,byPhase,damage:p.damageTaken,mana:p.mana,paidCasts:paid,native,actualDamage,pairedByPhase,respawns:0,regionalEnemies:7,ai:'original'}));
}
