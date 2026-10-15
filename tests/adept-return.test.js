const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(phase=1){
 const r=runtime(),{G}=r;r.load('riftbladeTrial');r.drain();const e=G.state.enemies.find(e=>e.def.id==='riftbladeAdept');G.state.enemies=[e];Object.assign(G.state.player,{x:e.x-60,y:e.y,invuln:100});G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossTelegraphT:.01,bossPendingAction:'blades'});G.updateEnemies(.02);return {...r,e};
}
test('Adept warns fixed throws, lets every blade return, and remains open afterward',()=>{
 for(const phase of [1,2,3]){const r=setup(phase),{G,e}=r,h=G.state.bossHazards[0];assert.equal(G.state.projectiles.length,0);G.updateEnemies(.79);assert.equal(G.state.projectiles.length,0);G.state.player.y+=50;G.updateEnemies(.02);assert.equal(G.state.projectiles.length,phase===1?2:3);
  assert.ok(G.state.projectiles.every(p=>p.vx<0&&p.boomerang));const x=e.x,y=e.y;let returning=false;
  for(let t=0;t<1.8;t+=.02){r.step(.02);r.drain();returning ||= G.state.projectiles.some(p=>p.returning);}
  assert.ok(returning);assert.equal(G.state.projectiles.length,0);assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.25);assert.equal(h.x,e.x-60);if(phase===3){const next=G.state.bossHazards.find(h=>h.owner===e&&h.wayglassFollower),target={x:next.x,y:next.y};G.state.player.x+=25;for(let i=0;i<120&&!next.fired;i++){r.step(.02);r.drain();}assert.ok(next.fired);assert.equal(next.x,target.x);assert.equal(next.y,target.y);assert.equal(G.state.projectiles.length,2,'the last native five are three, then two across the court');assert.ok(G.state.projectiles.every(p=>p.vy<0&&p.boomerang));let secondReturning=false;for(let i=0;i<100&&G.state.projectiles.length;i++){r.step(.02);r.drain();secondReturning ||= G.state.projectiles.some(p=>p.returning);}assert.ok(secondReturning);assert.equal(G.state.projectiles.length,0);assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.25,'the whole crossing return leaves its real recovery');}
 }
});
test('interrupting the throw warning prevents every returning blade',()=>{
 const {G,e}=setup(3);G.cancelBossHazards(e);G.updateBossHazards(.81);assert.equal(G.state.projectiles.length,0);assert.equal(G.state.bossHazards.length,0);
});
