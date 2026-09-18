const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(phase=1,action='mireVolley'){
 const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();const e=G.state.enemies.find(e=>e.def.id==='mireQueen');G.state.enemies=[e];Object.assign(G.state.player,{x:e.x-60,y:e.y,invuln:100});G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossTelegraphT:.01,bossPendingAction:action});G.updateEnemies(.02);return {...r,e};
}
test('Queen warns a fixed fan before releasing exactly one volley in every phase',()=>{
 for(const phase of [1,2,3]){const {G,e}=setup(phase),h=G.state.bossHazards[0];assert.equal(G.state.projectiles.length,0);assert.equal(h.count,phase*2+1);
  G.updateBossHazards(.84);assert.equal(G.state.projectiles.length,0);G.state.player.y-=70;G.updateBossHazards(.02);assert.equal(G.state.projectiles.length,h.count);
  const middle=G.state.projectiles[(h.count-1)/2];assert.ok(middle.vx<0);assert.ok(Math.abs(middle.vy)<.001,'fan stays aimed at the warned point');
  G.updateBossHazards(.02);assert.equal(G.state.projectiles.length,h.count);const x=e.x,y=e.y;
  for(let t=0;t<2.7;t+=.02)G.updateEnemies(.02);assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.4);
 }
});
test('stagger or travel cancels the pending volley before any shots appear',()=>{
 for(const cancel of ['stagger','travel']){const {G,e}=setup(3);if(cancel==='stagger')G.cancelBossHazards(e);else G.world.load('overworld');G.updateBossHazards(.9);assert.equal(G.state.bossHazards.length,0);assert.equal(G.state.projectiles.length,0);}
});
test('Queen holds through the nova travel time and leaves a melee opening',()=>{
 const {G,e}=setup(3,'nova');assert.equal(G.state.projectiles.length,20);assert.ok(e.bossRecoverT>=155/82+.64);const x=e.x,y=e.y;
 for(let t=0;t<2;t+=.02)G.updateEnemies(.02);assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.5);
});
