const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(phase=1){
 const r=runtime(),{G}=r;r.load('mistwood');r.drain();const e=G.state.enemies.find(e=>e.def.id==='ancientTreant');G.state.enemies=[e];Object.assign(G.state.player,{x:e.x-40,y:e.y-16,invuln:0,meleeGuard:0});G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossTelegraphT:.01,bossPendingAction:'rootBloom'});G.updateEnemies(.02);return {...r,e};
}
test('Treant roots warn at fixed positions, then damage only inside their bloom',()=>{
 const {G}=setup(),p=G.state.player,h=G.state.bossHazards[0],damage=p.damageTaken;assert.equal(h.x,p.x);assert.equal(h.y,p.y);
 G.updateBossHazards(.9);assert.equal(p.damageTaken,damage);const x=h.x,y=h.y;p.x-=40;G.updateBossHazards(.08);assert.equal(h.x,x);assert.equal(h.y,y);assert.equal(p.damageTaken,damage);
 p.x=x;p.y=y;G.updateBossHazards(.02);assert.ok(p.damageTaken>damage);const after=p.damageTaken;p.invuln=0;G.updateBossHazards(.02);assert.equal(p.damageTaken,after);
});
test('every Treant phase leaves a full counterattack window after the last root',()=>{
 for(const phase of [1,2,3]){const {G,e}=setup(phase),fields=[...G.state.bossHazards];assert.ok(fields.length>=1&&fields.length<=phase);const end=Math.max(...fields.map(h=>h.warning+h.active));assert.ok(e.bossRecoverT>=end+.84);
  const x=e.x,y=e.y;G.state.player.invuln=100;for(let t=0;t<end+.2;t+=.02){G.updateEnemies(.02);G.updateBossHazards(.02);}assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.6);assert.equal(G.state.bossHazards.length,0);assert.equal(G.state.projectiles.length,0);
 }
});
test('interrupting roots removes the warning and future damage',()=>{
 const {G,e}=setup(3),damage=G.state.player.damageTaken;G.cancelBossHazards(e);G.updateBossHazards(1.1);assert.equal(G.state.bossHazards.length,0);assert.equal(G.state.player.damageTaken,damage);
});
