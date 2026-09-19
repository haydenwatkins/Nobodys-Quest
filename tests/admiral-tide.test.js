const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(phase=1,action='tideWall'){
 const r=runtime(),{G}=r;r.load('turtleTrial');r.drain();const e=G.state.enemies.find(e=>e.def.id==='admiralTortoise');G.state.enemies=[e];Object.assign(G.state.player,{x:e.x-60,y:e.y,invuln:0,meleeGuard:0});G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossTelegraphT:.01,bossPendingAction:action});G.updateEnemies(.02);return {...r,e};
}
test('Admiral tide marks walkable refuge and keeps it safe in every phase',()=>{
 for(const phase of [1,2,3]){const {G,e}=setup(phase),h=G.state.bossHazards[0];assert.equal(h.lanes,phase+2);assert.ok(h.safePoint);assert.ok(G.world.isSafeSpawn(h.safePoint.x,h.safePoint.y));Object.assign(G.state.player,h.safePoint);
  const damage=G.state.player.damageTaken,x=e.x,y=e.y;for(let t=0;t<2.3;t+=.02){G.updateEnemies(.02);G.updateBossHazards(.02);}assert.equal(G.state.player.damageTaken,damage);assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.6);assert.equal(G.state.bossHazards.length,0);
 }
});
test('tide warns before damage and stagger cancels it',()=>{
 const {G,e}=setup(3),h=G.state.bossHazards[0],damage=G.state.player.damageTaken,b=h.bounds||{left:24,top:24,right:(G.state.mapW-1.5)*16,bottom:(G.state.mapH-1.5)*16};
 const lane=(h.safeLane+1)%h.lanes;G.state.player.x=h.axis==='x'?(b.left+b.right)/2:b.left+(lane+.5)*(b.right-b.left)/h.lanes;G.state.player.y=h.axis==='x'?b.top+(lane+.5)*(b.bottom-b.top)/h.lanes:(b.top+b.bottom)/2;
 G.updateBossHazards(1.09);assert.equal(G.state.player.damageTaken,damage);G.updateBossHazards(.02);assert.ok(G.state.player.damageTaken>damage);G.cancelBossHazards(e);assert.equal(G.state.bossHazards.length,0);
});
test('shell volley recovery lasts through its full travel',()=>{
 const {G,e}=setup(3,'shells');assert.equal(G.state.projectiles.length,16);assert.ok(e.bossRecoverT>=155/68+.69);
});
