#!/usr/bin/env node
'use strict';
// Earned checkpoint; original AI, full health/ward, timers and vulnerability.
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs'),collect=require('../tests/helpers/collect-treasure.cjs');
const cases=[];for(const form of ['nobody','colossus'])for(const rumble of [false,true])for(const heart of [false,true])for(const guardian of [false,true])cases.push({form,rumble,heart,guardian});cases.push({form:'nobody',rumble:false,heart:true,guardian:false,first:true});cases.push({form:'nobody',rumble:true,heart:false,guardian:false,lure:true});
for(const {form,rumble,heart,guardian,first=false,lure=false} of (process.argv.includes('--first-only')?cases.filter(c=>c.first):process.argv.includes('--lure-only')?cases.filter(c=>c.lure):cases)){
 const r=runtime(),{G}=r;let seed=0x12345678;r.context.Math=Object.create(Math);r.context.Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.state.items.push('trophy-mire-pearl');G.ensureTown().requests.push('beacon');G.state.claimedForms.push('ranger','frog',form);G.questsDone.push(...G.forms.frog.quests.slice(0,2).map(q=>q.id));
 if(!first){G.state.items.push('mole-crown');G.state.claimedForms.push('mole');}Object.assign(G.state.guardianChallenges.bram,{counterLearned:!first,rootRumble:rumble});G.setComfortSetting('easyMode',heart);G.setComfortSetting('bossAssistance',guardian);G.setForm(form);
 r.load('moleTrial');r.drain();if(!first)assert.ok(G.beginBurrowRematch());const e=G.state.enemies.find(e=>!e.dead&&e.id==='moleMonarch'),p=G.state.player;
 Object.assign(p,{x:e.x-65,y:e.y,mana:0,manaRegenDelay:1000});G.input.takeAim=()=>({...G.input.aim,dragged:true});
 const startStars=G.state.stars,startItems=[...G.state.items],byPhase={},burrowByPhase={};let earned=0,gifts=0,seconds=0,paid=0,burrowAnswers=0;
 G.events.on('questDone',()=>earned++);G.events.on('pickup',a=>{if(a.item==='mole-crown')gifts++;});G.events.on('abilityUse',({ability})=>{if(G.abilityManaCost(G.abilities[ability])>0)paid++;});G.events.on('guardianCounter',a=>{if(a.guardian==='moleMonarch'){byPhase[e.bossPhase]=(byPhase[e.bossPhase]||0)+1;if(a.kind==='burrowTrip'){burrowAnswers++;burrowByPhase[e.bossPhase]=(burrowByPhase[e.bossPhase]||0)+1;}}});
 for(let i=0;i<18000&&!e.dead;i++){
  const dt=.025,root=G.state.enemies.find(m=>!m.dead&&m.burrowPlug?.owner===e),fields=G.state.bossHazards.filter(h=>h.owner===e),charge=(e.bossPendingAction==='burrow'&&e.bossTelegraphT>0)||e.bossChargeT>0;
  let target={x:e.x+(e.x>224?-65:65),y:e.y},aim=e,attack=false;
  if(root){const a=Math.atan2(root.y-e.y,root.x-e.x),d=lure?75:20;target={x:root.x+Math.cos(a)*d,y:root.y+Math.sin(a)*d};aim=root;if(!lure&&fields.length&&Math.hypot(p.x-root.x,p.y-root.y)<(form==='colossus'?30:25))attack=true;}
  else if(charge){const nx=-e.bossChargeY,ny=e.bossChargeX,side=(p.x-e.x)*nx+(p.y-e.y)*ny>=0?1:-1;target={x:e.x+nx*side*65,y:e.y+ny*side*65};}
  else if(!fields.length&&(byPhase[e.bossPhase]||0)>0){target={x:e.x+(p.x<e.x?-18:18),y:e.y};if(Math.hypot(p.x-e.x,p.y-e.y)<(form==='colossus'?35:26))attack=true;}
  if(!G.world.isSafeSpawn(target.x,target.y))target=G.world.safeArrival(target.x,target.y);
  const dx=aim.x-p.x,dy=aim.y-p.y,d=Math.hypot(dx,dy)||1;G.input.aim={x:dx/d,y:dy/d};if(attack)r.taps.add('a');
  const vx=target.x-p.x,vy=target.y-p.y,m=Math.hypot(vx,vy),desired=m>2?{x:vx/m,y:vy/m}:{x:0,y:0},speed=G.forms[form].speed;
  const choices=[desired,{x:0,y:0},...Array.from({length:16},(_,j)=>({x:Math.cos(j*Math.PI/8),y:Math.sin(j*Math.PI/8)}))];
  const score=v=>{let cost=Math.hypot(p.x+v.x*speed*.2-target.x,p.y+v.y*speed*.2-target.y);
   for(let j=1;j<=6;j++){const t=j*.08,x=p.x+v.x*speed*t,y=p.y+v.y*speed*t;if(!G.world.isSafeSpawn(x,y))cost+=1000;
    for(const h of fields){const ht=h.t+t-(h.delay||0);if(ht>=h.warning&&ht<h.warning+h.active&&(!attack||lure))cost+=Math.max(0,h.radius+10-Math.hypot(x-h.x,y-h.y))**2*12;}
    if(charge&&!(root&&lure)){const wait=e.bossChargeT>0?0:e.bossTelegraphT,travel=e.def.boss.chargeSpeed*Math.min(Math.max(0,t-wait),e.bossChargeT>0?e.bossChargeT:e.def.boss.chargeDur);const bx=e.x+e.bossChargeX*travel,by=e.y+e.bossChargeY*travel;cost+=Math.max(0,24-Math.hypot(x-bx,y-by))**2*20;}
   }return cost;};choices.sort((a,b)=>score(a)-score(b));G.input.vec=choices[0];r.step(dt);r.drain();seconds+=dt;
  assert.ok(!G.state.knockout,JSON.stringify({form,rumble,heart,guardian,lure,seconds,hp:e.hp,ward:e.ward.hp,damage:p.damageTaken,byPhase,x:e.x,y:e.y,px:p.x,py:p.y,pending:e.bossPendingAction}));
 }
 assert.equal(e.dead,true,JSON.stringify({form,rumble,heart,guardian,lure,seconds,hp:e.hp,ward:e.ward.hp,damage:p.damageTaken,byPhase,x:e.x,y:e.y,px:p.x,py:p.y}));assert.equal(e.bossPhase,3);for(const phase of [1,2,3])assert.ok(byPhase[phase]>=1);assert.equal(paid,0);assert.equal(G.state.stars,startStars+earned);assert.equal(gifts,0);assert.deepEqual([...G.state.items],startItems);
 if(first){assert.ok(G.groundRewardFor('mole-crown'));G.input.vec={x:0,y:0};collect(r,'mole-crown');assert.equal(G.state.stars,startStars+earned+1);assert.equal(gifts,1);assert.equal(G.burrowVisitReady(),false);assert.ok(G.formReady('mole'));assert.ok(G.formEchoFor('mole'));assert.ok(!G.state.claimedForms.includes('mole'));}else assert.equal(G.groundRewardFor('mole-crown'),null);
 assert.equal(G.state.guardianChallenges.bram.rootRumbleCleared,rumble);assert.equal(G.comfortSetting('easyMode'),heart);assert.equal(G.comfortSetting('bossAssistance'),guardian);if(lure)for(const phase of [1,2,3])assert.ok(burrowByPhase[phase]>=1);
 console.log(JSON.stringify({form,rumble,heart,guardian,first,lure,seconds:+seconds.toFixed(2),counters:e.burrowCounters,burrowAnswers,burrowByPhase,byPhase,damage:p.damageTaken,mana:p.mana,paidCasts:paid,respawns:0,ai:'original'}));
}
