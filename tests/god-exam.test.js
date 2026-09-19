const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(phase,action){
 const r=runtime(),{G}=r;r.load('godTrial');r.drain();const e=G.state.enemies.find(e=>e.def.id==='godAvatar');G.state.enemies=[e];Object.assign(G.state.player,{x:e.x-60,y:e.y,invuln:100});G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossTelegraphT:.01,bossPendingAction:action});G.updateEnemies(.02);return {...r,e};
}
test('the final exam reuses readable lessons and commits through each field in every phase',()=>{
 for(const phase of [1,2,3])for(const action of ['foldCuts','tideWall','eclipseSweep','orbitalBand','gardenBeds']){
  const {G,e}=setup(phase,action),fields=[...G.state.bossHazards];assert.ok(fields.length>0,action);const end=Math.max(...fields.map(h=>h.delay+h.warning+h.active));assert.ok(e.bossRecoverT>=end+.89,action);
  if(action==='tideWall'){const h=fields[0];assert.ok(h.safePoint);assert.ok(G.world.isSafeSpawn(h.safePoint.x,h.safePoint.y));assert.ok(Math.hypot(h.safePoint.x-G.state.player.x,h.safePoint.y-G.state.player.y)<16);Object.assign(G.state.player,h.safePoint);G.state.player.invuln=0;}
  const damage=G.state.player.damageTaken,x=e.x,y=e.y;for(let t=0;t<end+.2;t+=.02)G.updateEnemies(.02);
  assert.equal(G.state.player.damageTaken,damage);assert.equal(G.state.bossHazards.length,0);assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.6);assert.equal(G.state.projectiles.length,0);
 }
});
test('interrupting the final exam removes every pending lesson',()=>{
 for(const action of ['foldCuts','tideWall','eclipseSweep','orbitalBand','gardenBeds']){const {G,e}=setup(3,action);G.cancelBossHazards(e);G.updateBossHazards(1.6);assert.equal(G.state.bossHazards.length,0);}
});
