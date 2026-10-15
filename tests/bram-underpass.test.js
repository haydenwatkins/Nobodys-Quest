'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(){
 const r=runtime(),{G}=r;r.load('moleTrial');r.drain();const e=G.state.enemies.find(e=>e.id==='moleMonarch');G.state.enemies=[e];G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:1,bossTelegraphT:.01,bossPendingAction:'royalStomp'});
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
function dug(){
 const r=setup(),{G,e,root}=r;Object.assign(G.state.player,{x:root.x-18,y:root.y,dir:{x:1,y:0}});G.input.takeAim=()=>({x:1,y:0,dragged:true});r.taps.add('a');
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
