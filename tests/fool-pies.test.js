const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(phase=1){
 const r=runtime(),{G}=r;r.load('jesterTrial');r.drain();const e=G.state.enemies.find(e=>e.def.id==='royalFool');G.state.enemies=[e];Object.assign(G.state.player,{x:e.x-60,y:e.y,invuln:0,meleeGuard:0});G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossTelegraphT:.01,bossPendingAction:'pieRain'});G.updateEnemies(.02);return {...r,e};
}
test('Fool pies lock their landing sites, warn in order, and permit escape in every phase',()=>{
 for(const phase of [1,2,3]){const {G,e}=setup(phase),pies=G.state.bossHazards.filter(h=>h.kind==='pieRain');assert.equal(pies.length,phase);const x=pies[0].x,y=pies[0].y,damage=G.state.player.damageTaken;
  G.updateBossHazards(.99);assert.equal(G.state.player.damageTaken,damage);G.state.player.x-=30;G.updateBossHazards(.02);assert.equal(pies[0].x,x);assert.equal(pies[0].y,y);assert.equal(G.state.player.damageTaken,damage);
  for(let i=1;i<pies.length;i++)assert.ok(pies[i].warning>pies[i-1].warning);
  const end=Math.max(...pies.map(h=>h.warning+h.active));assert.ok(e.bossRecoverT>=end+.89);
  const cards=G.state.bossHazards.find(h=>h.kind==='stageCards');assert.ok(cards);assert.ok(cards.delay>=end+.44,'cards wait for the complete pie phrase');
 }
});
test('a pie hits once and interrupting the act removes all future splats',()=>{
 const {G,e}=setup(3),damage=G.state.player.damageTaken;G.updateBossHazards(1.01);assert.ok(G.state.player.damageTaken>damage);const after=G.state.player.damageTaken;G.state.player.invuln=0;G.updateBossHazards(.02);assert.equal(G.state.player.damageTaken,after);
 G.cancelBossHazards(e);G.updateBossHazards(.3);assert.equal(G.state.bossHazards.length,0);assert.equal(G.state.player.damageTaken,after);
});
test('Tansy remains open after the actual final card leaves her complete pie-and-card passage',()=>{
 const r=setup(3),{G,e}=r,x=e.x,y=e.y;Object.assign(G.state.player,{x:e.x+60,y:e.y+60});let fired=false,finished=false;
 for(let i=0;i<600;i++){r.step(.02);r.drain();const shots=G.state.projectiles.filter(s=>s.owner===e&&!s.fromPlayer&&!s.dispelled);if(shots.some(s=>s.shape==='card'))fired=true;if(fired&&!shots.length&&!G.state.bossHazards.some(h=>h.owner===e)){finished=true;break;}}
 assert.ok(fired,'the real cards launch after the pies');assert.ok(finished);assert.equal(G.state.player.damageTaken,0);assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.6);assert.equal(G.state.bossHazards.length,0);assert.equal(G.state.projectiles.length,0);
});
