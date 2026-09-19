const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
test('Titan pilgrim roads connect both returns, camp, heart chamber, memory and legends',()=>{
 const r=runtime(),{G}=r;r.load('titanGrave');r.drain();const s=G.state,q=[[2,14]],seen=new Set(['2,14']);
 for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx<0||ny<0||nx>=s.mapW||ny>=s.mapH||seen.has(k)||G.world.solid(nx*16+8,ny*16+8))continue;seen.add(k);q.push([nx,ny]);}}
 for(const [x,y]of [[0,14],[23,0],[7,20],[35,8],[38,24],[10,24],[18,24],[25,24],[32,24],[39,24]])assert.ok(seen.has(x+','+y),`${x},${y}`);
 for(const stages of Object.values(G.LEGEND_PATHS))for(const stage of stages.filter(s=>s.mapId==='titanGrave')){const p=G.legendSitePoint(stage);assert.ok(seen.has(Math.floor(p.x/16)+','+Math.floor(p.y/16)),stage.name);}
 assert.equal(s.grid[24][38].chest.item,'titan-memory');assert.equal(s.grid[0][23].portal.map,'glasswaterDesert');assert.equal(s.grid[14][0].portal.map,'stormspinePeaks');
});
test('Worldbearer fields never overlap the next attack and inverted grids leave time to move',()=>{
 for(const phase of [1,2,3])for(const action of ['worldGrid','collapseRing','gustLanes','stormGrid']){
  const r=runtime(),{G}=r;r.load('titanGrave');r.drain();const e=G.state.enemies.find(e=>e.def.id==='lastWorldbearer');G.state.enemies=[e];Object.assign(G.state.player,{x:e.x-60,y:e.y,invuln:100});G.state.bossCutscene=null;
  Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossTelegraphT:.01,bossPendingAction:action});G.updateEnemies(.02);
  const fields=[...G.state.bossHazards],end=Math.max(...fields.map(h=>h.delay+h.warning+h.active));assert.ok(e.bossRecoverT>=end+.89);const x=e.x,y=e.y;
  if(action==='worldGrid'&&phase===3){assert.equal(fields.length,2);assert.notEqual(fields[0].parity,fields[1].parity);assert.ok(fields[1].delay>=fields[0].warning+fields[0].active);}
  if(action==='gustLanes'){const h=fields[0];assert.ok(h.safePoint);assert.ok(G.world.isSafeSpawn(h.safePoint.x,h.safePoint.y));Object.assign(G.state.player,h.safePoint);G.state.player.invuln=0;}
  const damage=G.state.player.damageTaken;
  for(let t=0;t<end+.2;t+=.02){G.updateEnemies(.02);}
  assert.equal(G.state.player.damageTaken,damage);assert.equal(G.state.bossHazards.length,0);assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.6);assert.equal(G.state.projectiles.length,0);
 }
});
