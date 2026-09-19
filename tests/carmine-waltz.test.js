const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(phase=1,action='crimsonWaltz'){
 const r=runtime(),{G}=r;r.load('vampireTrial');r.drain();const e=G.state.enemies.find(e=>e.def.id==='countessCarmine');G.state.enemies=[e];Object.assign(G.state.player,{x:e.x-60,y:e.y,invuln:100});G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossTelegraphT:.01,bossPendingAction:action,bossChargeX:-1,bossChargeY:0});G.updateEnemies(.02);return {...r,e};
}
test('Carmine warns a fixed opening and every shot stays outside it in all phases',()=>{
 for(const phase of [1,2,3]){const {G,e}=setup(phase),h=G.state.bossHazards[0],angle=h.angle;assert.ok(h.shots.length>=7);G.updateBossHazards(.89);assert.equal(G.state.projectiles.length,0);
  G.state.player.y-=60;G.updateBossHazards(.02);assert.equal(h.angle,angle);assert.equal(G.state.projectiles.length,h.shots.length);
  for(const shot of G.state.projectiles){const a=Math.atan2(shot.vy,shot.vx)-angle;assert.ok(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))>.55);}
  G.updateBossHazards(.02);assert.equal(G.state.projectiles.length,h.shots.length);const x=e.x,y=e.y;for(let t=0;t<2.8;t+=.02)G.updateEnemies(.02);assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.5);
 }
});
test('Carmine dash ends in a fresh waltz warning and interruption cancels its shots',()=>{
 const {G,e}=setup(3,'vampireDash');for(let t=0;t<.3;t+=.02)G.updateEnemies(.02);assert.equal(G.state.projectiles.length,0);assert.equal(G.state.bossHazards[0].kind,'crimsonWaltz');G.cancelBossHazards(e);G.updateBossHazards(.95);assert.equal(G.state.projectiles.length,0);
});
test('holding the marked opening avoids the live volley without invulnerability',()=>{
 for(const phase of [1,2,3]){const {G}=setup(phase);G.state.player.invuln=0;const damage=G.state.player.damageTaken;G.updateBossHazards(.91);
  G.world.blocksProjectile=()=>false;for(let t=0;t<2;t+=.02)G.combat.updateProjectiles(.02);assert.equal(G.state.player.damageTaken,damage);assert.equal(G.state.projectiles.length,0);
 }
});
