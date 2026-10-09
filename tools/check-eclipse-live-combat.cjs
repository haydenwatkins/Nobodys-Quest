#!/usr/bin/env node
'use strict';
// Earned-form checkpoint, original Knight and all seven regional foes.
// Learn one native shield response in each phase; no HP/ward/AI/guard edits.
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs'),collect=require('../tests/helpers/collect-treasure.cjs');
const cases=[];for(const form of ['wizard','colossus'])for(const crescent of [false,true])for(const heart of [false,true])for(const guardian of [false,true])cases.push({form,crescent,heart,guardian});
cases.push({form:'wizard',crescent:false,heart:true,guardian:false,first:true});
for(const {form,crescent,heart,guardian,first=false} of (process.argv.includes('--first-only')?cases.filter(c=>c.first):cases)){
 const r=runtime(),{G}=r;let seed=0x12345678;r.context.Math=Object.create(Math);r.context.Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.state.items.push('trophy-mire-pearl');G.ensureTown().requests.push('beacon');G.state.claimedForms.push('wizard',form);G.setForm(form);if(form==='colossus')G.state.loadouts.colossus=['pillarFist','curse'];
 if(!first){G.state.items.push('trophy-eclipse-sigil');G.ensureTown().requests.push('ridge-watch');}Object.assign(G.state.guardianChallenges.knight,{counterLearned:!first,crescent});G.setComfortSetting('easyMode',heart);G.setComfortSetting('bossAssistance',guardian);
 r.load('emberRidge');r.drain();if(!first)assert.ok(G.beginEclipseRematch());const e=G.state.enemies.find(e=>!e.dead&&e.id==='eclipseKnight'),p=G.state.player;
 Object.assign(p,{x:e.x+50,y:e.y,mana:0,manaRegenDelay:1000});G.input.takeAim=()=>({...G.input.aim,dragged:true});
 const startStars=G.state.stars,startItems=[...G.state.items],byPhase={};let earned=0,gifts=0,seconds=0,paid=0;
 G.events.on('questDone',()=>earned++);G.events.on('pickup',a=>{if(a.item==='trophy-eclipse-sigil')gifts++;});G.events.on('abilityUse',({ability})=>{if(G.abilityManaCost(G.abilities[ability])>0)paid++;});G.events.on('guardianCounter',a=>{if(a.guardian==='eclipseKnight')byPhase[e.bossPhase]=(byPhase[e.bossPhase]||0)+1;});
 for(let i=0;i<14000&&!e.dead;i++){
  const dt=.025,h=G.state.bossHazards.find(h=>h.owner===e),raised=G.eclipseShieldRaised(e),dist=Math.hypot(e.x-p.x,e.y-p.y),dx=e.x-p.x,dy=e.y-p.y,d=dist||1;G.input.aim={x:dx/d,y:dy/d};
  const side=e.x>405?-1:1;let target={x:e.x+side*45,y:e.y};
  if(h||e.bossPendingAction==='eclipseSweep'){const field=h||{x:e.x,y:e.y,radius:56+e.bossPhase*8};const points=Array.from({length:32},(_,j)=>{const a=j*Math.PI/16;return{x:field.x+Math.cos(a)*(field.radius+15),y:field.y+Math.sin(a)*(field.radius+15)};}).filter(a=>G.world.isSafeSpawn(a.x,a.y)&&Array.from({length:8},(_,i)=>({x:p.x+(a.x-p.x)*(i+1)/8,y:p.y+(a.y-p.y)*(i+1)/8})).every(a=>G.world.isSafeSpawn(a.x,a.y)));points.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));target=points[0]||{x:p.x,y:p.y};}
  else if(raised){target={x:e.x+side*18,y:e.y};if(dist<=(form==='wizard'?52:30))r.taps.add('a');}
  else if((byPhase[e.bossPhase]||0)>0&&dist<=53){r.taps.add(form==='wizard'?(e.ward.hp<=0&&e.status?.poison?.dur>0&&p.mana>=3?'b':'a'):'b');}
  const vx=target.x-p.x,vy=target.y-p.y,m=Math.hypot(vx,vy),desired=m>1.5?{x:vx/m,y:vy/m}:{x:0,y:0};
  const shots=G.state.projectiles.filter(s=>!s.fromPlayer&&!s.dispelled),speed=G.forms[form].speed;
  const choices=[desired,{x:0,y:0},...Array.from({length:16},(_,j)=>({x:Math.cos(j*Math.PI/8),y:Math.sin(j*Math.PI/8)}))];
  const score=v=>{let cost=Math.hypot(p.x+v.x*speed*.3-target.x,p.y+v.y*speed*.3-target.y);
   for(let j=1;j<=8;j++){const t=j*.1,x=p.x+v.x*speed*t,y=p.y+v.y*speed*t;if(!G.world.isSafeSpawn(x,y))cost+=1000;
    for(const s of shots){if(t<s.armT)continue;const scale=G.guidanceProjectileScale?.(s)??1,dist=Math.hypot(x-s.x-s.vx*t*scale,y-5-s.y-s.vy*t*scale);cost+=Math.max(0,(s.size||3)+11-dist)**2*15;}
    for(const b of G.state.enemies){if(b.dead||b.def.practice||b.def.miniboss)continue;const dx=x-b.x,dy=y-b.y,d=Math.hypot(dx,dy)||1,walk=b.def.behavior==='chase'?Math.min(d,b.def.speed*t):0;cost+=Math.max(0,b.def.size/2+9-(d-walk))**2*20;}
    if(h){const age=h.t+t;if(age>=h.warning&&age<h.warning+h.active&&Math.abs(G.util.angleDiff(Math.atan2(y-h.y,x-h.x),h.angle))<=h.halfAngle)cost+=Math.max(0,h.radius+7-Math.hypot(x-h.x,y-h.y))**2*20;}
   }return cost;};choices.sort((a,b)=>score(a)-score(b));G.input.vec=choices[0];r.step(dt);r.drain();seconds+=dt;
  assert.ok(!G.state.knockout,JSON.stringify({form,crescent,heart,guardian,seconds,hp:e.hp,ward:e.ward.hp,damage:p.damageTaken,counters:e.eclipseCounters,byPhase,x:p.x,y:p.y}));
 }
 assert.equal(e.dead,true,JSON.stringify({form,crescent,heart,guardian,seconds,hp:e.hp,ward:e.ward.hp,counters:e.eclipseCounters,damage:p.damageTaken,byPhase}));assert.equal(e.bossPhase,3);for(const phase of [1,2,3])assert.ok(byPhase[phase]>=1);
 assert.equal(G.state.stars,startStars+earned);assert.equal(gifts,0);assert.deepEqual([...G.state.items],startItems);
 if(first){assert.ok(G.groundRewardFor('trophy-eclipse-sigil'));G.input.vec={x:0,y:0};collect(r,'trophy-eclipse-sigil');assert.equal(G.state.stars,startStars+earned+1);assert.equal(gifts,1);assert.equal(G.eclipseVisitReady(),false);}else assert.equal(G.groundRewardFor('trophy-eclipse-sigil'),null);
 assert.equal(G.state.guardianChallenges.knight.crescentCleared,crescent);assert.equal(G.comfortSetting('easyMode'),heart);assert.equal(G.comfortSetting('bossAssistance'),guardian);
 console.log(JSON.stringify({form,crescent,heart,guardian,first,seconds:+seconds.toFixed(2),counters:e.eclipseCounters,byPhase,damage:p.damageTaken,mana:p.mana,paidCasts:paid,respawns:0,regionalEnemies:7,ai:'original'}));
}
