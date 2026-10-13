'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup({phase=1,encore=false,help=false,distance=60,originX=null}={}){
 const r=runtime(),{G}=r;r.load('jesterTrial');r.drain();const e=G.state.enemies.find(e=>e.id==='royalFool');G.state.enemies=[e];G.state.bossCutscene=null;if(originX!==null)e.x=originX;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),tansyEncore:encore,bossTelegraphT:.01,bossPendingAction:'pieRain'});G.setComfortSetting('bossAssistance',help);Object.assign(G.state.player,{x:e.x-distance,y:e.y,mana:0,manaRegenDelay:100,damageTaken:0,invuln:0});G.updateEnemies(.02);
 for(let i=0;i<12&&!G.state.enemies.some(c=>c.custardPie?.owner===e);i++){r.step(.025);r.drain();}return {...r,e};
}
function splash(r,pie){const p=r.G.state.player;Object.assign(p,{x:pie.x-20,y:pie.y,dir:{x:1,y:0}});r.G.input.takeAim=()=>({x:1,y:0,dragged:true});r.taps.add('a');for(let i=0;i<12&&!pie.dead;i++){r.step(.025);r.drain();}assert.ok(pie.dead);}
test('a native pie splash opens a real card passage instead of stopping Tansy or unrelated pressure',()=>{
 const r=setup(),{G,e}=r,c=G.state.enemies.find(c=>c.custardPie?.owner===e),ward=e.ward.hp,hp=e.hp;
 const other=G.makeEnemy('slime',100,80),shot={owner:other,fromPlayer:false,x:100,y:80,vx:0,vy:0,range:500,startX:100,startY:80,size:2,damage:1};G.state.projectiles.push(shot);
 splash(r,c);assert.equal(e.stageCounters,1);assert.equal(e.bossStaggerT,0);assert.equal(e.ward.hp,ward);assert.equal(e.hp,hp);assert.ok(G.state.projectiles.includes(shot));
 assert.ok(G.state.bossHazards.some(h=>h.owner===e&&h.kind==='stageCards'),'the cards continue after the splash');
 for(let i=0;i<160&&!G.state.projectiles.some(s=>s.owner===e&&s.shape==='card');i++){r.step(.025);r.drain();}
 const cards=G.state.projectiles.filter(s=>s.owner===e&&s.shape==='card');assert.ok(cards.length>0,'remaining cards actually launch');
 G.input.vec={x:1,y:0};for(let i=0;i<32;i++){r.step(.025);r.drain();}G.input.vec={x:0,y:0};assert.ok(G.state.player.x>e.x-24,'the walking opening permits an approach');assert.equal(G.state.player.damageTaken,0);assert.equal(G.state.player.mana,0);
});
test('choosing a side pie opens that walking approach while an untouched pie still bursts',()=>{
 const r=setup({phase:3}),{G,e}=r;
 const pies=G.state.enemies.filter(c=>c.custardPie?.owner===e),side=pies.find(c=>c.y>e.y+30);assert.ok(side);
 splash(r,side);assert.ok(G.state.bossHazards.some(h=>h.kind==='pieRain'&&h.y===e.y),'the first pie remains dangerous');
 const p=G.state.player;Object.assign(p,{x:e.x-60,y:e.y});for(let i=0;i<50&&!p.damageTaken;i++){r.step(.025);r.drain();}assert.ok(p.damageTaken>0,'splashing a different pie does not erase this impact');
 Object.assign(p,{x:side.x-20,y:side.y,damageTaken:0});
 for(let i=0;i<160&&!G.state.projectiles.some(s=>s.owner===e&&s.shape==='card');i++){r.step(.025);r.drain();}
 p.invuln=0;const before=Math.hypot(p.x-e.x,p.y-e.y),dx=e.x-p.x,dy=e.y-1-p.y,d=Math.hypot(dx,dy);G.input.vec={x:dx/d,y:dy/d};
 for(let i=0;i<30;i++){r.step(.025);r.drain();}G.input.vec={x:0,y:0};assert.ok(Math.hypot(p.x-e.x,p.y-e.y)<before-40);assert.equal(p.damageTaken,0,'actual moving cards respect the chosen side passage');
});
test('Card Encore waits for actually slowed cards to leave, then reuses the chosen passage',()=>{
 const r=setup({phase:3,encore:true,help:true}),{G,e}=r;G.state.guidance.bossRetries.jesterTrial=5;
 splash(r,G.state.enemies.find(c=>c.custardPie?.owner===e&&Math.abs(c.y-e.y)<2));const p=G.state.player;Object.assign(p,{x:e.x-80,y:e.y});
 let firstLaunch=false,encoreLaunch=false;
 for(let i=0;i<400&&!encoreLaunch;i++){
  r.step(.025);r.drain();const shots=G.state.projectiles.filter(s=>s.owner===e&&!s.dispelled),second=G.state.bossHazards.find(h=>h.kind==='stageEncore');
  if(shots.some(s=>s.stagePassage?.kind==='stageCards'))firstLaunch=true;
  if(second&&second.t>=second.delay)assert.ok(!shots.some(s=>s.stagePassage?.kind==='stageCards'),'second warning has no first-flight overlap');
  if(shots.some(s=>s.stagePassage?.kind==='stageEncore'))encoreLaunch=true;
 }
 assert.ok(firstLaunch);assert.ok(encoreLaunch);assert.equal(p.damageTaken,0);assert.equal(e.bossStaggerT,0);
});
test('a close-range side pie still changes actual cards rather than drawing an unused path outside the fan',()=>{
 const r=setup({phase:2,distance:0,originX:280}),{G,e}=r,side=G.state.enemies.find(c=>c.custardPie?.owner===e&&Math.abs(c.y-e.y)>30),fan=G.state.bossHazards.find(h=>h.kind==='stageCards');assert.ok(side);const count=fan.shots.length;
 splash(r,side);assert.ok(fan.shots.length<count,'every landed choice removes actual pressure');assert.ok(fan.shots.length>0,'the other cards stay active');
});
