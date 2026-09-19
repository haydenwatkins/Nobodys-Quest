const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(phase=1){
 const r=runtime(),{G}=r;r.load('samuraiTrial');r.drain();const e=G.state.enemies.find(e=>e.def.id==='paperRonin');G.state.enemies=[e];Object.assign(G.state.player,{x:e.x-60,y:e.y,invuln:0,meleeGuard:0});G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossTelegraphT:.01,bossPendingAction:'foldCuts'});G.updateEnemies(.02);return {...r,e};
}
test('Ronin marks fixed sequential cuts with time between strokes in every phase',()=>{
 for(const phase of [1,2,3]){const {G,e}=setup(phase),cuts=[...G.state.bossHazards];assert.equal(cuts.length,phase);
  for(let i=1;i<cuts.length;i++)assert.ok(cuts[i].warning>=cuts[i-1].warning+cuts[i-1].active+.1);
  const x=cuts[0].x,y=cuts[0].y,damage=G.state.player.damageTaken;G.state.player.y+=40;assert.ok(G.world.isSafeSpawn(G.state.player.x,G.state.player.y));const end=cuts.at(-1).warning+cuts.at(-1).active;
  for(let t=0;t<end+.2;t+=.02){G.updateEnemies(.02);}assert.equal(G.state.player.damageTaken,damage);assert.equal(cuts[0].x,x);assert.equal(cuts[0].y,y);assert.ok(e.bossRecoverT>.6);assert.equal(G.state.bossHazards.length,0);
 }
});
test('fold collision matches its narrow rectangle, warns, and hits once',()=>{
 const {G}=setup(),h=G.state.bossHazards[0],damage=G.state.player.damageTaken;G.updateBossHazards(.94);assert.equal(G.state.player.damageTaken,damage);
 G.state.player.y=h.y+10;G.updateBossHazards(.02);assert.equal(G.state.player.damageTaken,damage);G.state.player.y=h.y;G.updateBossHazards(.02);assert.ok(G.state.player.damageTaken>damage);const after=G.state.player.damageTaken;G.state.player.invuln=0;G.updateBossHazards(.02);assert.equal(G.state.player.damageTaken,after);
});
test('interrupting the first cut removes the remaining sequence',()=>{
 const {G,e}=setup(3);G.cancelBossHazards(e);const damage=G.state.player.damageTaken;G.updateBossHazards(1.6);assert.equal(G.state.bossHazards.length,0);assert.equal(G.state.player.damageTaken,damage);
});
