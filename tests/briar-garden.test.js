const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(phase=1){
 const r=runtime(),{G}=r;r.load('druidTrial');r.drain();const e=G.state.enemies.find(e=>e.def.id==='grandmotherBriar');G.state.enemies=[e];Object.assign(G.state.player,{x:e.x-64,y:e.y,invuln:0,meleeGuard:0});G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossTelegraphT:.01,bossPendingAction:'gardenBeds'});G.updateEnemies(.02);return {...r,e};
}
test('Briar plants only on usable ground and leaves open gaps and a safe center',()=>{
 for(const phase of [1,2,3]){const {G,e}=setup(phase),beds=[...G.state.bossHazards];assert.ok(beds.length>=2&&beds.length<=phase+3);
  for(const h of beds){assert.ok(G.world.isSafeSpawn(h.x,h.y));assert.ok(Math.hypot(h.x-e.x,h.y-e.y)-h.radius>=41);}
  for(let i=0;i<beds.length;i++)for(let j=i+1;j<beds.length;j++)assert.ok(Math.hypot(beds[i].x-beds[j].x,beds[i].y-beds[j].y)>beds[i].radius+beds[j].radius+15);
  G.state.player.x=e.x-20;const damage=G.state.player.damageTaken,x=e.x,y=e.y;
  for(let t=0;t<2.1;t+=.02){G.updateEnemies(.02);G.updateBossHazards(.02);}assert.equal(G.state.player.damageTaken,damage);assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.6);assert.equal(G.state.bossHazards.length,0);
 }
});
test('flowerbeds warn before blooming, hit once, and can be interrupted',()=>{
 const {G,e}=setup(3),h=G.state.bossHazards[0];Object.assign(G.state.player,{x:h.x,y:h.y});const damage=G.state.player.damageTaken;
 G.updateBossHazards(1.09);assert.equal(G.state.player.damageTaken,damage);G.updateBossHazards(.02);assert.ok(G.state.player.damageTaken>damage);const after=G.state.player.damageTaken;G.state.player.invuln=0;G.updateBossHazards(.02);assert.equal(G.state.player.damageTaken,after);
 G.cancelBossHazards(e);assert.equal(G.state.bossHazards.length,0);
});
