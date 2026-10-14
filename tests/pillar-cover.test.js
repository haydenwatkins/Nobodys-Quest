'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(phase=1){const r=runtime(),{G}=r;Object.assign(G.state.opening,{started:true,complete:true});G.state.delivery.complete=true;G.state.claimedForms.push('wizard');G.setForm('wizard');r.load('hangingGardens');r.drain();const e=G.state.enemies.find(e=>e.id==='oldMason');G.state.enemies=[e];G.state.bossCutscene=null;Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===1?1:phase===2?.6:.3),bossPendingAction:'masonryPassage',bossTelegraphT:.001});Object.assign(G.state.player,{x:e.x-60,y:e.y,mana:0,manaRegenDelay:100});G.updateEnemies(.01);return {...r,e};}
test('a native free fitting hit moves solid cover and opens an actual route without opening Pillar’s ward',()=>{
 const r=setup(),{G,e}=r,handle=G.state.enemies.find(a=>a.guardianProp?.owner===e);assert.ok(handle,'a visible native fitting offers the cover choice');const block={x:e.x-28,y:e.y};const original={x:block.x,y:block.y},hp=e.hp,ward=e.ward.hp,open=[];for(let dx=-80;dx<=80;dx+=4)for(let dy=-60;dy<=60;dy+=4){const x=block.x+dx,y=block.y+dy;if(!G.world.solid(x,y))open.push({x,y});}assert.ok(G.world.solid(block.x,block.y));
 Object.assign(G.state.player,{x:handle.x-18,y:handle.y,dir:{x:1,y:0}});G.input.takeAim=()=>({x:1,y:0,dragged:true});r.taps.add('a');for(let i=0;i<8;i++){r.step(.025);r.drain();}
 assert.equal(G.world.solid(original.x,original.y),false);assert.ok(open.some(at=>G.world.solid(at.x,at.y)),"the visible move makes formerly open ground solid");assert.equal(e.hp,hp);assert.equal(e.ward.hp,ward);assert.equal(e.bossStaggerT||0,0);
});
test('solid masonry stops a real intersecting hostile stone while an uncovered lane and Pillar remain active',()=>{
 const r=setup(),{G,e}=r,b={x:e.x-28,y:e.y};assert.ok(b);Object.assign(G.state.player,{x:b.x-26,y:b.y,invuln:0});const damage=G.state.player.damageTaken;
 const caught=G.fireGuardianProjectile(e,{x:b.x+52,y:b.y},{x:b.x-70,y:b.y},{speed:90,range:140,damage:1,shape:'masonryStone',size:4});
 const other=G.fireGuardianProjectile(e,{x:b.x+52,y:b.y+32},{x:b.x-70,y:b.y+32},{speed:90,range:140,damage:1,shape:'masonryStone',size:4});
 for(let i=0;i<35;i++){r.step(.025);r.drain();}
 assert.ok(!G.state.projectiles.includes(caught));assert.ok(G.state.projectiles.includes(other));assert.equal(G.state.player.damageTaken,damage);assert.equal(e.hp,e.def.hp);assert.equal(e.ward.hp,8);assert.equal(e.bossStaggerT||0,0);
});
test('standard masonry warns before native stones, then crossing lanes and an opened arch develop the placement',()=>{
 for(const phase of [1,2,3]){const r=setup(phase),{G,e}=r,b={x:e.x-28,y:e.y},h=G.state.bossHazards.find(h=>h.owner===e);assert.ok(h,'the standard placement gets its own readable stone warning');assert.equal(G.state.projectiles.filter(p=>p.owner===e).length,0);G.updateBossHazards(h.warning+.01);const rocks=G.state.projectiles.filter(p=>p.owner===e);assert.ok(rocks.length>=2);assert.ok(rocks.every(p=>!p.fromPlayer&&p.shape==='masonryStone'&&p.armT>0));
  if(phase===2)assert.ok(rocks.every(p=>Math.abs(p.vy)>Math.abs(p.vx)),'the next phase crosses the first horizontal stone passage');else assert.ok(rocks.every(p=>Math.abs(p.vx)>Math.abs(p.vy)));
  if(phase===3){assert.ok(G.world.solid(b.x,b.y-24));assert.ok(G.world.solid(b.x,b.y+24));}
 }
});
test('busy masonry waits, and defeat, phase, travel and knockout release its actual footprint',()=>{
 const r=setup(),{G,e}=r,handle=G.state.enemies.find(a=>a.guardianProp?.owner===e),blocked={x:e.x-28,y:e.y},next={x:e.x-28,y:e.y+36};G.state.npcs.push({x:next.x,y:next.y,name:'A resting traveler'});
 Object.assign(G.state.player,{x:handle.x-18,y:handle.y,dir:{x:1,y:0}});G.input.takeAim=()=>({x:1,y:0,dragged:true});r.taps.add('a');for(let i=0;i<8;i++)r.step(.025);assert.ok(G.world.solid(blocked.x,blocked.y),'occupied destination keeps the existing wall');assert.equal(e.masonryMoves||0,0);
 for(const exit of ['phase','defeat','travel','knockout']){const q=setup(),{G,e}=q,at={x:e.x-28,y:e.y};assert.ok(G.world.solid(at.x,at.y));
  if(exit==='phase'){e.hp=55;G.updateEnemies(.01);q.drain();}if(exit==='defeat'){G.combat.damageEnemy(e,{damage:8,type:'blunt',ability:'slap'});G.combat.damageEnemy(e,{damage:1000,type:'blunt',ability:'slap'});}if(exit==='travel')q.load('sunstepPrairie');if(exit==='knockout'){G.state.player.invuln=0;G.damagePlayer(100,e.x,e.y);}G.updateOpening(.01);
  if(exit!=='travel')assert.equal(G.world.solid(at.x,at.y),false,exit);assert.ok(!G.state.enemies.some(a=>G.guardianPropLive(a)&&a.guardianProp.owner===e),exit);
 }
});
