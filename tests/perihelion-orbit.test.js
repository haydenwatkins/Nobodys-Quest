const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(phase=1){
 const r=runtime(),{G}=r;r.load('astronomerTrial');r.drain();const e=G.state.enemies.find(e=>e.def.id==='professorPerihelion');G.state.enemies=[e];Object.assign(G.state.player,{x:e.x-60,y:e.y,invuln:0,meleeGuard:0});G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossTelegraphT:.01,bossPendingAction:'orbitalBand'});G.updateEnemies(.02);return {...r,e,h:G.state.bossHazards[0]};
}
test('every orbit has walkable refuge, stays fixed, and leaves a counterattack opening',()=>{
 for(const phase of [1,2,3]){const {G,e,h}=setup(phase);let safe;
  for(let y=24;y<G.state.mapH*16-24;y+=8)for(let x=24;x<G.state.mapW*16-24;x+=8){const d=Math.hypot(x-h.x,y-h.y);if(d>h.inner+8&&d<h.outer-8&&G.world.isSafeSpawn(x,y))safe={x,y};}
  assert.ok(safe);Object.assign(G.state.player,safe);const damage=G.state.player.damageTaken,x=e.x,y=e.y;
  for(let t=0;t<h.warning+h.active+.2;t+=.02){G.updateEnemies(.02);G.updateBossHazards(.02);}
  assert.equal(G.state.player.damageTaken,damage);assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.6);assert.equal(G.state.bossHazards.length,0);
 }
});
test('orbit warns before damaging its center or outside and hits only once',()=>{
 for(const where of ['center','outside']){const {G,h}=setup();Object.assign(G.state.player,{x:h.x+(where==='center'?0:h.outer+10),y:h.y});const damage=G.state.player.damageTaken;
  G.updateBossHazards(1.59);assert.equal(G.state.player.damageTaken,damage);G.updateBossHazards(.02);assert.ok(G.state.player.damageTaken>damage);const after=G.state.player.damageTaken;G.state.player.invuln=0;G.updateBossHazards(.02);assert.equal(G.state.player.damageTaken,after);
 }
});
test('stagger cancels the Professor orbit before damage',()=>{
 const {G,e,h}=setup(3);G.state.player.x=h.x;const damage=G.state.player.damageTaken;G.cancelBossHazards(e);G.updateBossHazards(1.7);assert.equal(G.state.bossHazards.length,0);assert.equal(G.state.player.damageTaken,damage);
});
