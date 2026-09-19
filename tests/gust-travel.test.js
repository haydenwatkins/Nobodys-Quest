const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
test('slow forms can walk the marked gust route before damage, including cliff detours',()=>{
 for(const [map,boss]of [['windscarCanyon','skySovereign'],['titanGrave','lastWorldbearer']])for(const phase of [1,2,3]){
  const r=runtime(),{G}=r;r.load(map);r.drain();const e=G.state.enemies.find(e=>e.def.id===boss);G.state.enemies=[e];G.state.formId='colossus';Object.assign(G.state.player,{x:e.x-105,y:e.y,invuln:0,meleeGuard:0});G.state.bossCutscene=null;
  Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossTelegraphT:.01,bossPendingAction:'gustLanes'});G.updateEnemies(.02);
  const h=G.state.bossHazards[0],p=G.state.player,damage=p.damageTaken;assert.ok(h.safeRoute.length);assert.ok(h.warning>=(h.safeRoute.length-1)*8/40+.34);
  for(const next of h.safeRoute.slice(1)){const distance=Math.hypot(next.x-p.x,next.y-p.y);G.world.moveBox(p,next.x-p.x,next.y-p.y);assert.equal(p.x,next.x);assert.equal(p.y,next.y);G.updateEnemies(distance/G.forms.colossus.speed);}
  assert.equal(p.x,h.safePoint.x);assert.equal(p.y,h.safePoint.y);for(let t=h.t;t<h.warning+h.active+.05;t+=.02)G.updateEnemies(.02);assert.equal(p.damageTaken,damage);
 }
});
