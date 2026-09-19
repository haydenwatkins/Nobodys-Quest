const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(phase=1){
 const r=runtime(),{G}=r;r.load('emberRidge');r.drain();const e=G.state.enemies.find(e=>e.def.id==='eclipseKnight');G.state.enemies=[e];Object.assign(G.state.player,{x:e.x-40,y:e.y,invuln:0,meleeGuard:0});G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossTelegraphT:.01,bossPendingAction:'eclipseSweep'});G.updateEnemies(.02);return {...r,e,h:G.state.bossHazards[0]};
}
test('Eclipse crescent locks its direction and leaves a safe rear in all phases',()=>{
 for(const phase of [1,2,3]){const {G,e,h}=setup(phase),damage=G.state.player.damageTaken,angle=h.angle;assert.ok(h.halfAngle<Math.PI/2);G.updateBossHazards(.84);assert.equal(G.state.player.damageTaken,damage);
  G.state.player.x=e.x+30;G.updateBossHazards(.02);assert.equal(h.angle,angle);assert.equal(G.state.player.damageTaken,damage);
  G.state.player.x=e.x-30;G.updateBossHazards(.02);assert.ok(G.state.player.damageTaken>damage);const after=G.state.player.damageTaken;G.state.player.invuln=0;G.updateBossHazards(.02);assert.equal(G.state.player.damageTaken,after);
 }
});
test('leaving the crescent radius or dashing avoids its hit; interruptions cancel it',()=>{
 for(const answer of ['range','dash','stagger']){const {G,e,h}=setup(3),damage=G.state.player.damageTaken;
  if(answer==='range')G.state.player.x=h.x-h.radius-8;else if(answer==='dash')G.state.player.dashing={};else G.cancelBossHazards(e);
  G.updateBossHazards(.86);assert.equal(G.state.player.damageTaken,damage);if(answer==='stagger')assert.equal(G.state.bossHazards.length,0);
 }
});
test('Knight commits to the marked sweep and leaves a recovery opening',()=>{
 const {G,e,h}=setup(3),x=e.x,y=e.y;G.state.player.invuln=100;assert.ok(e.bossRecoverT>=h.warning+h.active+.89);
 for(let t=0;t<1.3;t+=.02){G.updateEnemies(.02);}assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.6);assert.equal(G.state.bossHazards.length,0);assert.equal(G.state.projectiles.length,0);
});
