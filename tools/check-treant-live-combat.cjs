#!/usr/bin/env node
'use strict';
// Earned-body checkpoint, original AI/HP/wards and native movement/free art.
// This is encounter evidence, not a fresh campaign or a human playtest.
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs'),collect=require('../tests/helpers/collect-treasure.cjs');
const scenarios=[];
for(const form of ['nobody','colossus'])for(const branching of [false,true])for(const heart of [false,true])for(const guardian of [false,true])scenarios.push({form,branching,heart,guardian});
scenarios.push({form:'nobody',branching:false,heart:false,guardian:false,first:true});
for(const {form,branching,heart,guardian,first=false} of scenarios){
 const r=runtime(),{G}=r;Object.assign(G.state.opening,{started:true,complete:!first});G.state.delivery.complete=!first;
 if(!first)G.state.items.push('trophy-heartwood-crown');G.state.guardianChallenges.treant.counterLearned=!first;G.state.guardianChallenges.treant.branching=branching;
 G.setComfortSetting('easyMode',heart);G.setComfortSetting('bossAssistance',guardian);G.state.claimedForms.push(form);G.setForm(form);r.load('heartwood');r.drain();
 if(!first)assert.ok(G.beginTreantRematch());const e=G.state.enemies.find(e=>!e.dead&&e.def.id==='ancientTreant'),p=G.state.player;
 Object.assign(p,{x:e.x,y:e.y+80,mana:0,manaRegenDelay:1000});G.input.takeAim=()=>({...G.input.aim,dragged:true});
 const startingStars=G.state.stars,startingItems=[...G.state.items];let learned=0,crownPickups=0;
 G.events.on('questDone',()=>learned++);G.events.on('pickup',e=>{if(e.item==='trophy-heartwood-crown')crownPickups++;});
 let maxPhase=0,seconds=0,roots=0;
 for(let i=0;i<20000&&!e.dead;i++){
  const dt=.025;seconds+=dt;
  const fields=G.state.openingHazards.filter(h=>h.owner===e&&!h.treantEcho),root=G.state.enemies.find(a=>!a.dead&&a.treantRoot?.owner===e);
  let target;
  if(root){target={x:root.x+18,y:root.y};if(Math.hypot(root.x-p.x,root.y-p.y)<=23){G.input.aim={x:root.x-p.x,y:root.y-p.y};const d=Math.hypot(G.input.aim.x,G.input.aim.y)||1;G.input.aim.x/=d;G.input.aim.y/=d;r.taps.add('a');}}
  else if(fields.length){
   const h=fields[0];
   // Exit a branch sideways; exit a bloom downward. Targets stay committed.
   target=h.kind==='branch'?{x:h.x+h.dx*80-h.dy*34,y:h.y+h.dy*80+h.dx*34}:{x:h.x,y:h.y+32};
  }else if(e.bossStaggerT>0||(!e.openingTimer&&e.bossRecoverT>0)){
   target={x:e.x,y:e.y+22};if(Math.hypot(e.x-p.x,e.y-p.y)<=28){G.input.aim={x:0,y:-1};r.taps.add('a');}
  }else target={x:e.x,y:e.y+75};
  const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy);G.input.vec=d>2?{x:dx/d,y:dy/d}:{x:0,y:0};
  r.step(dt);r.drain();maxPhase=Math.max(maxPhase,e.bossPhase||0);roots=e.treantCounters||0;
  assert.ok(!G.state.knockout,JSON.stringify({form,branching,heart,guardian,seconds,hp:e.hp,ward:e.ward?.hp,damage:p.damageTaken,roots,x:p.x,y:p.y}));
 }
 assert.equal(e.dead,true,JSON.stringify({form,branching,heart,guardian,seconds,hp:e.hp,ward:e.ward?.hp,roots,damage:p.damageTaken}));
 assert.equal(G.state.stars,startingStars+learned);assert.equal(crownPickups,0);assert.deepEqual([...G.state.items],startingItems);if(first){assert.ok(G.groundRewardFor('trophy-heartwood-crown'));G.input.vec={x:0,y:0};collect(r,'trophy-heartwood-crown');assert.equal(G.state.stars,startingStars+learned+1);assert.equal(crownPickups,1);assert.equal(G.treantVisitReady(),false);}else assert.equal(G.groundRewardFor('trophy-heartwood-crown'),null);
 assert.equal(maxPhase,3);assert.ok(roots>=4);assert.equal(G.state.guardianChallenges.treant.branchingCleared,branching);
 assert.equal(G.comfortSetting('easyMode'),heart);assert.equal(G.comfortSetting('bossAssistance'),guardian);
 console.log(JSON.stringify({form,branching,heart,guardian,first,seconds:+seconds.toFixed(2),roots,phases:maxPhase,damage:p.damageTaken,mana:p.mana,respawns:0,ai:'original'}));
}
