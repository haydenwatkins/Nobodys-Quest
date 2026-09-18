const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
test('Stormspine passes reach its camp, summit, cache, gate approach and legends',()=>{
 const r=runtime(),{G}=r;r.load('stormspinePeaks');r.drain();const s=G.state,q=[[2,14]],seen=new Set(['2,14']);
 for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx<0||ny<0||nx>=s.mapW||ny>=s.mapH||seen.has(k)||G.world.solid(nx*16+8,ny*16+8))continue;seen.add(k);q.push([nx,ny]);}}
 for(const [x,y]of [[0,14],[44,14],[7,20],[35,8],[38,23],[13,8],[28,23]])assert.ok(seen.has(x+','+y),`${x},${y}`);
 for(const stages of Object.values(G.LEGEND_PATHS))for(const stage of stages.filter(s=>s.mapId==='stormspinePeaks')){const p=G.legendSitePoint(stage);assert.ok(seen.has(Math.floor(p.x/16)+','+Math.floor(p.y/16)),stage.name);}
 assert.equal(s.grid[23][38].chest.item,'stormglass-lantern');assert.equal(s.grid[14][45].portal.mark,'echo');assert.ok(G.world.solid(13*16+8,5*16+8));
});
test('Mallow holds position through every field and leaves time to counterattack',()=>{
 for(const phase of [1,2,3])for(const action of ['safeCircle','stormGrid']){
  const r=runtime(),{G}=r;r.load('stormspinePeaks');r.drain();const e=G.state.enemies.find(e=>e.def.id==='lanternKeeper');G.state.enemies=[e];Object.assign(G.state.player,{x:e.x-35,y:e.y,invuln:100});G.state.bossCutscene=null;
  Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossTelegraphT:.01,bossPendingAction:action});G.updateEnemies(.02);
  const fields=[...G.state.bossHazards],end=Math.max(...fields.map(h=>h.delay+h.warning+h.active));assert.ok(e.bossRecoverT>=end+.79);const x=e.x,y=e.y;
  if(action==='safeCircle'){
   assert.ok(G.world.isSafeSpawn(G.state.player.x,G.state.player.y));G.state.player.invuln=0;
   const damage=G.state.player.damageTaken;for(let t=0;t<end+.2;t+=.02){G.updateEnemies(.02);G.updateBossHazards(.02);}assert.equal(G.state.player.damageTaken,damage);
  }else for(let t=0;t<end+.2;t+=.02){G.updateEnemies(.02);G.updateBossHazards(.02);}
  assert.equal(G.state.bossHazards.length,0);assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.5);assert.equal(G.state.projectiles.length,0);
 }
});
