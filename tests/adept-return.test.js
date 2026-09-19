const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(phase=1){
 const r=runtime(),{G}=r;r.load('riftbladeTrial');r.drain();const e=G.state.enemies.find(e=>e.def.id==='riftbladeAdept');G.state.enemies=[e];Object.assign(G.state.player,{x:e.x-60,y:e.y,invuln:100});G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossTelegraphT:.01,bossPendingAction:'blades'});G.updateEnemies(.02);return {...r,e};
}
test('Adept warns fixed throws, lets every blade return, and remains open afterward',()=>{
 for(const phase of [1,2,3]){const {G,e}=setup(phase),h=G.state.bossHazards[0];assert.equal(G.state.projectiles.length,0);G.updateEnemies(.79);assert.equal(G.state.projectiles.length,0);G.state.player.y+=50;G.updateEnemies(.02);assert.equal(G.state.projectiles.length,phase===1?2:phase===2?3:5);
  assert.ok(G.state.projectiles.every(p=>p.vx<0&&p.boomerang));const x=e.x,y=e.y;let returning=false;G.world.blocksProjectile=()=>false;
  for(let t=0;t<1.8;t+=.02){G.updateEnemies(.02);G.combat.updateProjectiles(.02);returning ||= G.state.projectiles.some(p=>p.returning);}
  assert.ok(returning);assert.equal(G.state.projectiles.length,0);assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.25);assert.equal(h.x,e.x-60);
 }
});
test('interrupting the throw warning prevents every returning blade',()=>{
 const {G,e}=setup(3);G.cancelBossHazards(e);G.updateBossHazards(.81);assert.equal(G.state.projectiles.length,0);assert.equal(G.state.bossHazards.length,0);
});
