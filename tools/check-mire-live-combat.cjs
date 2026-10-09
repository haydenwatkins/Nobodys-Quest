#!/usr/bin/env node
'use strict';
// Earned-body checkpoint; original Queen and all nine regional enemies.
// Deliberately learn a counter in each phase; timings are not speedrun balance.
// Wizard spends naturally earned mana; Cragback borrows the free Curse.
// No HP, ward, AI, timers or invulnerability changes during combat.
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs'),collect=require('../tests/helpers/collect-treasure.cjs');
const cases=[];
for(const form of ['wizard','colossus'])for(const rippling of [false,true])for(const heart of [false,true])for(const guardian of [false,true])cases.push({form,rippling,heart,guardian});
cases.push({form:'wizard',rippling:false,heart:true,guardian:false,first:true});
for(const {form,rippling,heart,guardian,first=false} of (process.argv.includes('--first-only')?cases.filter(c=>c.first):cases)){
 const r=runtime(),{G}=r;let seed=0x12345678;r.context.Math=Object.create(Math);r.context.Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;
 G.state.claimedForms.push('wizard',form);G.setForm(form);if(form==='colossus')G.state.loadouts.colossus=['pillarFist','curse'];
 if(!first){G.state.items.push('trophy-mire-pearl');G.ensureTown().requests.push('beacon');}
 Object.assign(G.state.guardianChallenges.queen,{counterLearned:!first,rippling});G.setComfortSetting('easyMode',heart);G.setComfortSetting('bossAssistance',guardian);
 r.load('sunkenMarsh');r.drain();if(!first)assert.ok(G.beginMireRematch());
 const e=G.state.enemies.find(e=>!e.dead&&e.id==='mireQueen'),p=G.state.player;
 Object.assign(p,{x:e.x-60,y:e.y,mana:0,manaRegenDelay:1000});G.input.takeAim=()=>({...G.input.aim,dragged:true});
 const startStars=G.state.stars,startItems=[...G.state.items];let earned=0,pearls=0,seconds=0,maxPhase=0,paid=0,avoid=null;
 const byPhase={};G.events.on('abilityUse',({ability})=>{if(G.abilityManaCost(G.abilities[ability])>0)paid++;});G.events.on('questDone',()=>earned++);G.events.on('pickup',e=>{if(e.item==='trophy-mire-pearl')pearls++;});
 G.events.on('guardianCounter',({guardian})=>{if(guardian==='mireQueen')byPhase[e.bossPhase]=(byPhase[e.bossPhase]||0)+1;});
 function aim(x,y){const dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy)||1;G.input.aim={x:dx/d,y:dy/d};}
 for(let i=0;i<20000&&!e.dead;i++){
  const dt=.025;seconds+=dt;const root=G.state.enemies.find(a=>!a.dead&&a.mireCrust?.owner===e),fields=G.state.bossHazards.filter(h=>h.owner===e),primary=fields.filter(h=>h.kind==='mirePool');
  let target={x:e.x-60,y:e.y};
  if(root){target={x:root.x+18,y:root.y};if(Math.hypot(root.x-p.x,root.y-p.y)<=23){aim(root.x,root.y);r.taps.add('a');}}
  else if(primary.length){const at=primary.find(h=>h.mireAftermath)?.mireAftermath||primary[0];target={x:at.x-27,y:at.y};}
  else if((byPhase[e.bossPhase]||0)>0&&(!fields.length&&e.bossIntroT<=0)&&!G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&s.owner===e)){
   target={x:e.x-48,y:e.y};if(Math.hypot(e.x-p.x,e.y-p.y)<=68){aim(e.x,e.y);r.taps.add(form==='wizard'?(e.ward.hp<=0&&e.status?.poison?.dur>0&&p.mana>=3?'b':'a'):'b');}
  }else if(fields.some(h=>h.kind==='mireVolley')){
   const h=fields.find(h=>h.kind==='mireVolley'),a=Math.atan2(h.y-e.y,h.x-e.x);avoid={x:h.x-Math.sin(a)*52,y:h.y+Math.cos(a)*52};target=avoid;
  }else if(G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&s.owner===e)&&avoid){target=avoid;
  }else if(e.bossPendingAction==='nova'||G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&s.owner===e)){
   // Stand halfway between native radial spokes; fan shots keep their old target.
   const n=e.bossPhase>=3?20:e.bossPhase===2?16:12,a=Math.PI+Math.PI/n;
   target={x:e.x+100*Math.cos(a),y:e.y+100*Math.sin(a)};avoid=null;
  }
  if((byPhase[e.bossPhase]||0)>0&&!root&&!primary.length&&Math.hypot(e.x-p.x,e.y-p.y)<125){aim(e.x,e.y);r.taps.add(form==='wizard'?(e.ward.hp<=0&&e.status?.poison?.dur>0&&p.mana>=3?'b':'a'):'b');}
  const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy),desired=d>1.5?{x:dx/d,y:dy/d}:{x:0,y:0};
  const shots=G.state.projectiles.filter(s=>!s.fromPlayer&&!s.dispelled),speed=G.forms[form].speed*G.mireWalkingScale(p);
  const choices=[desired,{x:0,y:0},...Array.from({length:16},(_,j)=>({x:Math.cos(j*Math.PI/8),y:Math.sin(j*Math.PI/8)}))];
  const score=v=>{let cost=Math.hypot(p.x+v.x*speed*.3-target.x,p.y+v.y*speed*.3-target.y);
   for(let j=1;j<=8;j++){const t=j*.1,x=p.x+v.x*speed*t,y=p.y+v.y*speed*t;if(!G.world.isSafeSpawn(x,y))cost+=1000;
    for(const s of shots){if(t<s.armT)continue;const scale=G.guidanceProjectileScale?.(s)??1,sx=s.x+s.vx*t*scale,sy=s.y+s.vy*t*scale,dist=Math.hypot(x-sx,y-5-sy);cost+=Math.max(0,(s.size||3)+11-dist)**2*15;}
    for(const h of primary){const age=h.t+t;if(age>=h.delay+h.warning&&age<h.delay+h.warning+h.active)cost+=Math.max(0,h.radius+6-Math.hypot(x-h.x,y-h.y))**2*20;}
   }return cost;};choices.sort((a,b)=>score(a)-score(b));G.input.vec=choices[0];r.step(dt);r.drain();maxPhase=Math.max(maxPhase,e.bossPhase||0);
  assert.ok(!G.state.knockout,JSON.stringify({form,rippling,heart,guardian,seconds,hp:e.hp,ward:e.ward.hp,damage:p.damageTaken,counters:e.mireCounters,byPhase,x:p.x,y:p.y}));
 }
 assert.equal(e.dead,true,JSON.stringify({form,rippling,heart,guardian,seconds,hp:e.hp,ward:e.ward.hp,counters:e.mireCounters,damage:p.damageTaken,byPhase}));
 assert.equal(maxPhase,3);for(const phase of [1,2,3])assert.ok(byPhase[phase]>=1);assert.equal(G.state.guardianChallenges.queen.counterLearned,true);assert.equal(G.state.stars,startStars+earned);assert.equal(pearls,0);assert.deepEqual([...G.state.items],startItems);
 if(first){assert.ok(G.groundRewardFor('trophy-mire-pearl'));G.input.vec={x:0,y:0};collect(r,'trophy-mire-pearl');assert.equal(G.state.stars,startStars+earned+1);assert.equal(pearls,1);assert.equal(G.mireVisitReady(),false);}else assert.equal(G.groundRewardFor('trophy-mire-pearl'),null);
 assert.equal(G.state.guardianChallenges.queen.ripplingCleared,rippling);assert.equal(G.comfortSetting('easyMode'),heart);assert.equal(G.comfortSetting('bossAssistance'),guardian);
 console.log(JSON.stringify({form,rippling,heart,guardian,first,seconds:+seconds.toFixed(2),counters:e.mireCounters,byPhase,phases:maxPhase,damage:p.damageTaken,mana:p.mana,paidCasts:paid,respawns:0,ai:'original',regionalEnemies:9}));
}
