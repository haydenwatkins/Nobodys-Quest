const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
test('garden bridges connect both exits, camp, guardian, cache and legend sites',()=>{
 const r=runtime(),{G}=r;r.load('hangingGardens');r.drain();const s=G.state,q=[[2,14]],seen=new Set(['2,14']);
 for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx<0||ny<0||nx>=s.mapW||ny>=s.mapH||seen.has(k)||G.world.solid(nx*16+8,ny*16+8))continue;seen.add(k);q.push([nx,ny]);}}
 for(const [x,y]of [[0,14],[45,14],[7,20],[35,8],[38,24],[23,10],[34,18]])assert.ok(seen.has(x+','+y));
 for(const stages of Object.values(G.LEGEND_PATHS))for(const stage of stages.filter(s=>s.mapId==='hangingGardens')){const p=G.legendSitePoint(stage);assert.ok(seen.has(Math.floor(p.x/16)+','+Math.floor(p.y/16)),stage.name);}
 assert.equal(s.grid[24][38].chest.item,'garden-keystone');assert.ok(G.world.solid(16*16+8,10*16+8));
});
test('Mason commits through each arena attack and remains open afterward in all phases',()=>{
 for(const phase of [1,2,3])for(const action of ['faultGrid','collapseRing']){const r=runtime(),{G}=r;r.load('hangingGardens');r.drain();const e=G.state.enemies.find(e=>e.def.id==='oldMason');G.state.enemies=[e];G.state.player.x=e.x-60;G.state.player.y=e.y;G.state.bossCutscene=null;
  Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossTelegraphT:.01,bossPendingAction:action});G.updateEnemies(.02);const h=G.state.bossHazards[0];assert.ok(e.bossRecoverT>=h.warning+h.active+.89);
  const x=e.x,y=e.y;let elapsed=0;while(elapsed<h.warning+h.active+.3){G.updateEnemies(.02);elapsed+=.02;}assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.5);assert.equal(e.bossChargeT,0);
 }
});
