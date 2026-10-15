'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup({phase=1,rumble=false,help=false}={}){
 const r=runtime(),{G}=r;r.load('moleTrial');r.drain();const e=G.state.enemies.find(e=>e.id==='moleMonarch');G.state.enemies=[e];G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bramRootRumble:rumble,bossTelegraphT:.01,bossPendingAction:'royalStomp'});
 G.setComfortSetting('bossAssistance',help);
 Object.assign(G.state.player,{x:e.x-80,y:e.y,dir:{x:1,y:0},mana:0,manaRegenDelay:100});G.updateEnemies(.02);
 return {...r,e,root:G.state.enemies.find(e=>e.burrowPlug)};
}
test('a free art loosens the root while the stomp continues; only a completed actual dig opens separated mouths',()=>{
 const r=setup(),{G,e,root}=r,h=G.state.bossHazards[0],hp=e.hp,ward=e.ward.hp;let counters=0,hits=0;G.events.on('guardianCounter',()=>counters++);G.events.on('hit',()=>hits++);
 Object.assign(G.state.player,{x:root.x-18,y:root.y,dir:{x:1,y:0}});G.input.takeAim=()=>({x:1,y:0,dragged:true});r.taps.add('a');
 for(let i=0;i<12&&!root.burrowPlug.broken;i++){r.step(.025);r.drain();}
 assert.ok(root.burrowPlug.broken,'actual free art loosens root');assert.ok(!root.dead,'loose root remains usable');assert.ok(G.state.bossHazards.includes(h),'stomp continues');assert.equal(e.bossStaggerT,0);assert.equal(e.hp,hp);assert.equal(e.ward.hp,ward);assert.equal(counters,0);assert.equal(hits,0);
 G.state.player.y+=75;for(let i=0;i<60;i++){r.step(.025);r.drain();}
 Object.assign(e,{bossRecoverT:0,bossSpecialT:100,bossTelegraphT:.01,bossPendingAction:'burrow',bossChargeX:-1,bossChargeY:0});
 r.step(.025);r.drain();let crossed=false;
 for(let i=0;i<30&&e.bossChargeT>0;i++){
  r.step(.025);r.drain();
  if(e.x<=root.x){crossed=true;if(e.bossChargeT>0)assert.ok(!root.burrowPlug.passage,'crossing alone cannot finish a route');}
 }
 assert.ok(crossed);assert.ok(root.burrowPlug.passage,'native completed digging opens the actual route');
 const path=root.burrowPlug.passage;assert.ok(Math.hypot(path.to.x-path.from.x,path.to.y-path.from.y)>=18);assert.equal(path.to.x,e.x);assert.equal(path.to.y,e.y);assert.ok(G.state.bossHazards.some(h=>h.owner===e&&h.kind==='royalStomp'),'follow-up stomp continues');assert.equal(counters,0);assert.equal(G.state.guardianChallenges.bram.counterLearned,false);assert.equal(G.state.player.mana,0);
});
function dug(options){
 const r=setup(options),{G,e,root}=r;Object.assign(G.state.player,{x:root.x-18,y:root.y,dir:{x:1,y:0}});G.input.takeAim=()=>({x:1,y:0,dragged:true});r.taps.add('a');
 for(let i=0;i<12&&!root.burrowPlug.broken;i++){r.step(.025);r.drain();}G.state.player.y+=75;for(let i=0;i<60;i++){r.step(.025);r.drain();}
 Object.assign(e,{bossRecoverT:0,bossSpecialT:100,bossTelegraphT:.01,bossPendingAction:'burrow',bossChargeX:-1,bossChargeY:0});
 for(let i=0;i<25&&!root.burrowPlug.passage;i++){r.step(.025);r.drain();}assert.ok(root.burrowPlug.passage);return r;
}
test('only controlled walking through a completed tunnel earns learning and owner-only shelter through its continuing impact',()=>{
 const r=dug(),{G,e,root}=r,path=root.burrowPlug.passage,h=G.state.bossHazards.find(h=>h.owner===e),hp=e.hp,ward=e.ward.hp;
 let counters=0,credits=0;G.events.on('guardianCounter',()=>counters++);for(const event of ['hit','kill'])G.events.on(event,()=>credits++);
 Object.assign(G.state.player,{x:path.from.x,y:path.from.y,invuln:0});r.step(.025);assert.equal(counters,0,'supplied mouth feet are not a traversal');assert.equal(G.burrowShelters?.(G.state.player,e)||false,false);
 G.state.player.x+=10;G.input.vec={x:-1,y:0};let entered=false;
 for(let i=0;i<25&&!counters;i++){r.step(.025);r.drain();entered ||= !!G.state.player.burrowTransit;}
 G.input.vec={x:0,y:0};assert.ok(entered,'walking starts visible transit');assert.equal(counters,1);assert.ok(Math.hypot(G.state.player.x-path.to.x,G.state.player.y-path.to.y)<1);assert.ok(G.burrowShelters(G.state.player,e));assert.equal(G.burrowShelters(G.state.player,G.makeEnemy('moleMonarch',e.x,e.y)),false);assert.equal(e.hp,hp);assert.equal(e.ward.hp,ward);assert.equal(credits,0);assert.equal(G.state.player.mana,0);assert.equal(e.bossStaggerT,0);assert.ok(G.state.bossHazards.includes(h));
 assert.ok(G.loadSaveData().guardianChallenges.bram.counterLearned);assert.equal(G.loadSaveData().guardianChallenges.bram.bestTunnelUses,1);assert.equal(G.loadSaveData().guardianChallenges.bram.bestCounters,0,'old root-pop record retains its original meaning');
 for(let i=0;i<65;i++){r.step(.025);r.drain();}assert.equal(G.state.player.damageTaken,0);assert.equal(G.burrowShelters(G.state.player,e),false,'no permanent camping shelter');assert.ok(root.dead);assert.equal(counters,1);
});
test('the opposite mouth also needs a real controlled approach, and true interruption leaves an unfinished traveler at actual feet without credit',()=>{
 for(const cancel of [false,true]){
  const r=dug(),{G,e,root}=r,path=root.burrowPlug.passage;Object.assign(G.state.player,{x:path.to.x-10,y:path.to.y});G.input.vec={x:1,y:0};
  for(let i=0;i<8&&!G.state.player.burrowTransit;i++){r.step(.025);r.drain();}assert.ok(G.state.player.burrowTransit);
  if(cancel){const before={x:G.state.player.x,y:G.state.player.y};G.cancelBossHazards(e);G.input.vec={x:0,y:0};r.step(.025);assert.equal(G.state.player.x,before.x);assert.equal(G.state.player.y,before.y);assert.equal(G.state.guardianChallenges.bram.bestTunnelUses,0);assert.equal(G.state.player.burrowTransit,null);}
  else{for(let i=0;i<20&&!e.burrowTunnelUses;i++){r.step(.025);r.drain();}assert.equal(e.burrowTunnelUses,1);assert.equal(G.state.player.x,path.from.x);assert.equal(G.state.player.y,path.from.y);}
 }
});
test('harmless practice visibly digs a full connection and saves its mushroom only after controlled travel, with no combat credit',()=>{
 const r=runtime(),{G}=r;r.load('moleTrial');r.drain();const root=G.state.enemies.find(e=>e.burrowPlug&&!e.burrowPlug.owner);let credits=0;for(const event of ['hit','kill','guardianCounter'])G.events.on(event,()=>credits++);
 Object.assign(G.state.player,{x:root.x-18,y:root.y,dir:{x:1,y:0},mana:0,manaRegenDelay:100});G.input.takeAim=()=>({x:1,y:0,dragged:true});r.taps.add('a');
 for(let i=0;i<12&&!root.burrowPlug.broken;i++){r.step(.025);r.drain();}
 assert.ok(root.burrowPlug.broken);assert.equal(G.state.guardianChallenges.bram.practiceCleared,false,'an art alone cannot finish the lesson');
 let diggerMoved=false;for(let i=0;i<60&&!root.burrowPlug.passage;i++){const before=root.burrowPlug.practiceDig?.x;r.step(.025);r.drain();diggerMoved ||= before!==undefined&&root.burrowPlug.practiceDig?.x!==before;}
 assert.ok(diggerMoved,'visible harmless digger moves through real collision');const path=root.burrowPlug.passage;assert.ok(path);assert.equal(G.state.guardianChallenges.bram.practiceCleared,false);
 Object.assign(G.state.player,{x:path.from.x-10,y:path.from.y});G.input.vec={x:1,y:0};for(let i=0;i<35&&!G.state.guardianChallenges.bram.practiceCleared;i++){r.step(.025);r.drain();}
 assert.ok(G.loadSaveData().guardianChallenges.bram.practiceCleared);assert.equal(G.state.player.x,path.to.x);assert.equal(G.state.player.y,path.to.y);assert.equal(credits,0);assert.equal(G.state.player.mana,0);assert.equal(G.state.player.damageTaken,0);assert.equal(G.state.guardianChallenges.bram.counterLearned,false);G.input.vec={x:0,y:0};r.load('moleTrial');assert.ok(!G.state.enemies.some(e=>e.burrowPlug));
});
test('Root Rumble warns the actual arrival mouth then permits a deliberate return; waiting there cannot shelter the second impact',()=>{
 for(const help of [false,true]){
  const r=dug({rumble:true,help}),{G,e,root}=r,path=root.burrowPlug.passage,[first,follow]=root.burrowPlug.threats;
  assert.equal(follow.x,path.to.x);assert.equal(follow.y,path.to.y);assert.equal(follow.radius,18);assert.equal(follow.warning,help?1.2:.9);assert.ok(follow.delay>=first.warning+first.active+.54);
  Object.assign(G.state.player,{x:path.from.x+10,y:path.from.y});G.input.vec={x:-1,y:0};for(let i=0;i<30&&!e.burrowTunnelUses;i++){r.step(.025);r.drain();}G.input.vec={x:0,y:0};assert.equal(e.burrowTunnelUses,1);
  assert.equal(G.burrowShelters(G.state.player,e,follow),false,'its targeted mouth must be left');const target={x:follow.x,y:follow.y};G.input.vec={x:-1,y:0};for(let i=0;i<8;i++){r.step(.025);r.drain();}G.input.vec={x:1,y:0};for(let i=0;i<35&&e.burrowTunnelUses<2;i++){r.step(.025);r.drain();}G.input.vec={x:0,y:0};assert.equal(e.burrowTunnelUses,2);assert.equal(G.state.player.x,path.from.x);assert.equal(G.state.player.y,path.from.y);assert.deepEqual({x:follow.x,y:follow.y},target,'warned impact remains fixed');assert.ok(G.state.bossHazards.includes(follow));assert.equal(e.bossStaggerT,0);
  for(let i=0;i<140;i++){r.step(.025);r.drain();}assert.equal(G.state.player.damageTaken,0);assert.equal(G.state.guardianChallenges.bram.bestTunnelUses,2);
 }
});
test('later phases offer separated bait routes and the final standard stomp commits its next impact to the actual first mouth',()=>{
 const r=setup({phase:2}),{G,e}=r,roots=G.state.enemies.filter(e=>e.burrowPlug&&!e.dead);assert.equal(roots.length,2);assert.ok(Math.hypot(roots[0].x-roots[1].x,roots[0].y-roots[1].y)>35);
 const root=roots[1],angle=Math.atan2(root.y-e.y,root.x-e.x);Object.assign(G.state.player,{x:root.x+Math.cos(angle)*18,y:root.y+Math.sin(angle)*18,dir:{x:-Math.cos(angle),y:-Math.sin(angle)}});G.input.takeAim=()=>({x:-Math.cos(angle),y:-Math.sin(angle),dragged:true});r.taps.add('a');
 for(let i=0;i<12&&!root.burrowPlug.broken;i++){r.step(.025);r.drain();}assert.ok(root.burrowPlug.broken);G.state.player.y+=75;for(let i=0;i<60;i++){r.step(.025);r.drain();}
 Object.assign(e,{bossRecoverT:0,bossSpecialT:100,bossTelegraphT:.01,bossPendingAction:'burrow',bossChargeX:Math.cos(angle),bossChargeY:Math.sin(angle)});for(let i=0;i<25&&!root.burrowPlug.passage;i++){r.step(.025);r.drain();}assert.ok(root.burrowPlug.passage,'actual angled native dig creates the chosen route');assert.ok(Math.abs(root.burrowPlug.passage.to.y-root.burrowPlug.passage.from.y)>15);
 const final=dug({phase:3}),path=final.root.burrowPlug.passage,fields=final.root.burrowPlug.threats;assert.equal(fields.length,2);assert.equal(fields[1].x,path.from.x);assert.equal(fields[1].y,path.from.y);assert.equal(fields[1].radius,18);assert.equal(path.maxUses,2);assert.ok(fields[1].delay>=fields[0].warning+fields[0].active+.54);
});
test('unrelated real knockback interrupts the short dive without turning supplied endpoint feet into a completed trip',()=>{
 for(const endpoint of [false,true]){
  const r=dug(),{G,e,root}=r,path=root.burrowPlug.passage;Object.assign(G.state.player,{x:path.from.x+10,y:path.from.y});G.input.vec={x:-1,y:0};for(let i=0;i<8&&!G.state.player.burrowTransit;i++){r.step(.025);r.drain();}assert.ok(G.state.player.burrowTransit);G.input.vec={x:0,y:0};
  if(endpoint)Object.assign(G.state.player,{x:path.to.x,y:path.to.y});else{G.state.player.invuln=0;assert.ok(G.damagePlayer(1,G.state.player.x+20,G.state.player.y));}
  const feet={x:G.state.player.x,y:G.state.player.y};r.step(.025);assert.equal(G.state.player.burrowTransit,null);assert.equal(G.state.guardianChallenges.bram.bestTunnelUses,0);assert.equal(G.state.player.x,feet.x);assert.equal(G.state.player.y,feet.y);assert.equal(e.burrowTunnelUses,undefined);
 }
});
test('a dive started during the actual impact can finish in its clear breather before the connection retires',()=>{
 const r=dug(),{G,e,root}=r,path=root.burrowPlug.passage,h=root.burrowPlug.threats[0];Object.assign(G.state.player,G.world.safeArrival(e.x,e.y+75));
 while(h.t<h.warning+.12){r.step(.025);r.drain();}assert.ok(G.state.bossHazards.includes(h));Object.assign(G.state.player,{x:path.from.x+8,y:path.from.y,invuln:0});G.input.vec={x:-1,y:0};for(let i=0;i<5&&!G.state.player.burrowTransit;i++){r.step(.025);r.drain();}assert.ok(G.state.player.burrowTransit);
 for(let i=0;i<25&&!e.burrowTunnelUses;i++){r.step(.025);r.drain();}G.input.vec={x:0,y:0};assert.equal(e.burrowTunnelUses,1);assert.equal(G.state.player.x,path.to.x);assert.equal(G.state.player.damageTaken,0);assert.equal(G.burrowShelters(G.state.player,e),false,'clear breather grants no lingering shield');
 for(let i=0;i<40;i++){r.step(.025);r.drain();}assert.ok(root.dead);assert.equal(G.state.guardianChallenges.bram.bestTunnelUses,1);
});
