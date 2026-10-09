'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');

function prepare(G,id){
 G.state.enemies=[];G.state.projectiles=[];G.state.bossHazards=[];G.state.openingHazards=[];G.state.bossCutscene=null;G.state.knockout=null;
 const e=G.makeEnemy(id,320,240);Object.assign(e,{bossEngaged:true,bossIntroT:0,bossSpecialT:0});G.state.enemies=[e];Object.assign(G.state.player,{x:260,y:240,invuln:100,damageTaken:0});return e;
}

test('every registered guardian clears its old commitment and hostile shots before introducing a new phase',()=>{
 const r=runtime(),{G}=r;r.load('sunkenMarsh');const ids=Object.values(G.enemies).filter(d=>d.miniboss).map(d=>d.id);assert.equal(ids.length,19);
 for(const id of ids){
  const e=prepare(G,id),other=G.makeEnemy('slime',500,240),hostile={owner:e,fromPlayer:false},friendly={owner:e,fromPlayer:true},foreign={owner:other,fromPlayer:false};
  G.state.projectiles=[hostile,friendly,foreign];G.state.bossHazards=[{owner:e,mapId:G.state.mapId,t:0,warning:10,active:1},{owner:other,mapId:G.state.mapId,t:0,warning:10,active:1}];
  G.state.openingHazards=[{owner:e,t:0,warn:10,active:1},{owner:other,t:0,warn:10,active:1}];
  Object.assign(e,{hp:e.def.hp*((e.def.boss.phaseThresholds||[.5])[0]-.01),bossPendingAction:'charge',bossTelegraphT:.5,bossChargeT:.5,bossAfterCharge:'nova',bossContactActive:true});
  G.updateEnemies(.01);assert.equal(e.bossPhase,2,id);assert.equal(e.bossPendingAction,null,id);assert.equal(e.bossTelegraphT,0,id);assert.equal(e.bossChargeT,0,id);assert.equal(e.bossAfterCharge,null,id);assert.equal(e.bossContactActive,false,id);
  assert.equal(hostile.dispelled,true,id);assert.equal(friendly.dispelled,undefined,id);assert.equal(foreign.dispelled,undefined,id);assert.equal(G.state.bossHazards.length,1,id);assert.equal(G.state.openingHazards.length,1,id);r.drain();
 }
});

test('Guardian help lengthens every standard guardian commitment and every authored floor phrase, including early-return patterns',()=>{
 const r=runtime(),{G}=r;r.load('sunkenMarsh');let patterns=0;
 for(const d of Object.values(G.enemies).filter(d=>d.miniboss&&!d.boss.orchard)){
  for(const help of [false,true]){
   G.setComfortSetting('bossAssistance',help);const e=prepare(G,d.id);G.updateEnemies(.01);
   assert.ok(Math.abs(e.bossTelegraphT-(e.bossPendingAction==='charge'?(d.boss.chargeTelegraph??d.boss.telegraph):d.boss.telegraph)-(help?.3:0))<1e-8,d.id);
  }
  for(const action of new Set(d.boss.patterns||(d.boss.style==='riftblade'?['charge','blades']:['charge']))){
   const samples=[];
   for(const help of [false,true]){
    G.setComfortSetting('bossAssistance',help);const e=prepare(G,d.id);Object.assign(e,{bossTelegraphT:.001,bossPendingAction:action});G.updateEnemies(.01);
    const fields=G.state.bossHazards.filter(h=>h.owner===e);samples.push(fields.map(h=>h.warning));
    for(const h of fields)assert.ok(e.bossRecoverT>=(h.delay||0)+h.warning+h.active+.64,`${d.id} ${action} waits for its real warning`);
   }
   assert.equal(samples[1].length,samples[0].length);
   for(let i=0;i<samples[0].length;i++){patterns++;assert.ok(Math.abs(samples[1][i]-samples[0][i]-.3)<1e-8,`${d.id} ${action}`);}
  }
 }
 assert.ok(patterns>=25,'the whole pattern registry, not one demonstration fight');
});

test('actual slowed guardian volleys finish before another attack, with a clear opening after the last shot',()=>{
 const r=runtime(),{G}=r;r.load('sunkenMarsh');G.setComfortSetting('bossAssistance',true);G.state.guidance.bossRetries.sunkenMarsh=5;
 const e=prepare(G,'mireQueen');Object.assign(e,{bossTelegraphT:.001,bossPendingAction:'nova'});G.updateEnemies(.01);
 const shots=G.state.projectiles;assert.ok(shots.length>0);assert.equal(G.guidanceProjectileScale(shots[0]),.78);assert.ok(shots[0].armT>=G.BOSS_PROJECTILE_ARM_SECONDS+.29);
 // Remove terrain/player interception so a volley must reach its native range.
 G.world.blocksProjectile=()=>false;G.state.player.x=40;G.state.player.y=40;const pattern=e.bossPattern;
 for(let i=0;i<400&&G.state.projectiles.some(p=>p.owner===e&&!p.dispelled);i++){
  e.bossSpecialT=0;G.updateEnemies(.02);assert.equal(e.bossPattern,pattern,'lingering shots cannot overlap the next windup');G.combat.updateProjectiles(.02);
 }
 assert.equal(G.state.projectiles.length,0,'the native volley expires');assert.ok(e.bossRecoverT>=.6);
 for(let t=0;t<.4;t+=.02){G.updateEnemies(.02);assert.equal(e.bossPattern,pattern);}
 for(let t=0;t<.4;t+=.02)G.updateEnemies(.02);assert.ok(e.bossPattern>pattern,'recovery finishes; the fight cannot stall');
});

test('other creatures and friendly or dispelled shots cannot hold a guardian in recovery',()=>{
 const r=runtime(),{G}=r;r.load('sunkenMarsh');const e=prepare(G,'eclipseKnight'),other=G.makeEnemy('slime',500,240);
 G.state.projectiles=[{owner:e,fromPlayer:true},{owner:other,fromPlayer:false},{owner:e,fromPlayer:false,dispelled:true}];G.updateEnemies(.01);assert.equal(e.bossPendingAction,'charge');
});
