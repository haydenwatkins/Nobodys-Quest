const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(phase=1,action='gustLanes'){
 const r=runtime(),{G}=r;r.load('windscarCanyon');r.drain();const e=G.state.enemies.find(e=>e.id==='skySovereign'||e.def.id==='skySovereign');G.state.enemies=[e];const p=G.state.player;p.x=e.x-105;p.y=e.y;p.invuln=0;p.meleeGuard=0;
 e.bossEngaged=true;e.bossIntroT=0;e.bossPhase=phase;e.hp=e.def.hp*(phase===3?.3:phase===2?.6:1);e.bossTelegraphT=.01;e.bossPendingAction=action;G.state.bossCutscene=null;G.updateEnemies(.02);return {...r,e,h:G.state.bossHazards[0]};
}
test('every Sovereign gust phase marks walkable refuge and leaves a full recovery window',()=>{
 for(const phase of [1,2,3])for(const action of ['gustLanes','windWall']){const {G,e,h}=setup(phase,action);assert.ok(h.safePoint);assert.ok(G.world.isSafeSpawn(h.safePoint.x,h.safePoint.y));assert.ok(e.bossRecoverT>=h.warning+h.active+.79);
  const p=G.state.player;Object.assign(p,h.safePoint);const damage=p.damageTaken,x=e.x,y=e.y;
  let elapsed=0;while(elapsed<h.warning+h.active+.3){G.updateEnemies(.02);G.updateBossHazards(.02);elapsed+=.02;}
  assert.equal(p.damageTaken,damage);assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.4);assert.equal(e.bossChargeT,0);
 }
});
test('cancelling an interrupted gust removes its warning and damaging field',()=>{
 const {G,e}=setup();G.cancelBossHazards(e);assert.equal(G.state.bossHazards.length,0);const damage=G.state.player.damageTaken;G.updateBossHazards(1);assert.equal(G.state.player.damageTaken,damage);
});
