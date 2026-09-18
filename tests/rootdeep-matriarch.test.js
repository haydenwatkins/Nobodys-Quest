const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
test('root chambers connect both exits, camp, guardian, cache and legend sites',()=>{
 const r=runtime(),{G}=r;r.load('rootdeepHollow');r.drain();const s=G.state,q=[[2,14]],seen=new Set(['2,14']);
 for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx<0||ny<0||nx>=s.mapW||ny>=s.mapH||seen.has(k)||G.world.solid(nx*16+8,ny*16+8))continue;seen.add(k);q.push([nx,ny]);}}
 for(const [x,y]of [[0,14],[45,14],[7,20],[35,8],[37,23],[15,7],[28,23]])assert.ok(seen.has(x+','+y));
 for(const stages of Object.values(G.LEGEND_PATHS))for(const stage of stages.filter(s=>s.mapId==='rootdeepHollow')){const p=G.legendSitePoint(stage);assert.ok(seen.has(Math.floor(p.x/16)+','+Math.floor(p.y/16)),stage.name);}
 assert.equal(s.grid[23][37].chest.item,'rootdeep-silk');assert.ok(G.world.solid(15*16+8,10*16+8));
});
test('Matriarch commits through each arena attack and remains open afterward in all phases',()=>{
 for(const phase of [1,2,3])for(const action of ['webGrid','silkTether']){const r=runtime(),{G}=r;r.load('rootdeepHollow');r.drain();const e=G.state.enemies.find(e=>e.def.id==='silkMatriarch');G.state.enemies=[e];G.state.player.x=e.x-60;G.state.player.y=e.y;G.state.bossCutscene=null;
  Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossTelegraphT:.01,bossPendingAction:action});G.updateEnemies(.02);const h=G.state.bossHazards[0];assert.ok(e.bossRecoverT>=h.warning+h.active+.74);
  const x=e.x,y=e.y;let elapsed=0;while(elapsed<h.warning+h.active+.3){G.updateEnemies(.02);elapsed+=.02;}assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.3);assert.equal(e.bossChargeT,0);
 }
});
