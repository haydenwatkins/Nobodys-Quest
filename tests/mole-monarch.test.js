const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(phase=1,action='royalStomp'){
 const r=runtime(),{G}=r;r.load('moleTrial');r.drain();const e=G.state.enemies.find(e=>e.def.id==='moleMonarch');G.state.enemies=[e];Object.assign(G.state.player,{x:e.x-40,y:e.y,invuln:0,meleeGuard:0});G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossTelegraphT:.01,bossPendingAction:action,bossChargeX:-1,bossChargeY:0});G.updateEnemies(.02);return {...r,e};
}
test('every royal stomp warns, lets the player move out, and leaves recovery',()=>{
 for(const phase of [1,2,3]){const {G,e}=setup(phase),h=G.state.bossHazards[0],damage=G.state.player.damageTaken;
  G.updateBossHazards(.84);assert.equal(G.state.player.damageTaken,damage);G.state.player.x=h.x-h.radius-10;assert.ok(G.world.isSafeSpawn(G.state.player.x,G.state.player.y));G.updateBossHazards(.02);assert.equal(G.state.player.damageTaken,damage);
  const x=e.x,y=e.y;for(let t=0;t<1.3;t+=.02)G.updateEnemies(.02);assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.6);
 }
});
test('burrow finishes with a fresh warning instead of an immediate radial hit',()=>{
 const {G,e}=setup(3,'burrow');G.state.player.invuln=100;assert.equal(G.state.bossHazards?.length||0,0);
 for(let t=0;t<.4;t+=.02)G.updateEnemies(.02);assert.equal(G.state.projectiles.length,0);const h=G.state.bossHazards[0];assert.equal(h.kind,'royalStomp');assert.equal(h.x,e.x);assert.equal(h.y,e.y);assert.ok(e.bossRecoverT>=h.warning+h.active+.8);
 G.cancelBossHazards(e);assert.equal(G.state.bossHazards.length,0);
});
test('remaining inside a stomp takes one hit and dash immunity still applies',()=>{
 for(const dodge of [false,true]){const {G}=setup(),damage=G.state.player.damageTaken;if(dodge)G.state.player.dashing={};G.updateBossHazards(.86);
  if(dodge)assert.equal(G.state.player.damageTaken,damage);else{assert.ok(G.state.player.damageTaken>damage);const after=G.state.player.damageTaken;G.state.player.invuln=0;G.updateBossHazards(.02);assert.equal(G.state.player.damageTaken,after);}
 }
});
