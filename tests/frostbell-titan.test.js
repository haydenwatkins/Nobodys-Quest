const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
test('Frostbell causeways connect both exits, camp, belfry, chime and legends',()=>{
 const r=runtime(),{G}=r;r.load('frostbellTundra');r.drain();const s=G.state,q=[[23,27]],seen=new Set(['23,27']);
 for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx<0||ny<0||nx>=s.mapW||ny>=s.mapH||seen.has(k)||G.world.solid(nx*16+8,ny*16+8))continue;seen.add(k);q.push([nx,ny]);}}
 for(const [x,y]of [[23,28],[45,14],[7,20],[35,8],[38,22],[7,8],[17,8],[16,22],[29,22]])assert.ok(seen.has(x+','+y),`${x},${y}`);
 for(const stages of Object.values(G.LEGEND_PATHS))for(const stage of stages.filter(s=>s.mapId==='frostbellTundra')){const p=G.legendSitePoint(stage);assert.ok(seen.has(Math.floor(p.x/16)+','+Math.floor(p.y/16)),stage.name);}
 assert.equal(s.grid[22][38].chest.item,'frostbell-chime');assert.ok(G.world.solid(12*16+8,5*16+8));
});
function setup(phase,action){
 const r=runtime(),{G}=r;r.load('frostbellTundra');r.drain();const e=G.state.enemies.find(e=>e.def.id==='bellTitan');G.state.enemies=[e];Object.assign(G.state.player,{x:e.x-60,y:e.y,invuln:0,meleeGuard:0});G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossTelegraphT:.01,bossPendingAction:action});G.updateEnemies(.02);return {...r,e};
}
test('Bongle separates his notes and commits until the last echo ends in every phase',()=>{
 for(const phase of [1,2,3])for(const action of ['stormGrid','echoCross']){const {G,e}=setup(phase,action),fields=[...G.state.bossHazards];assert.equal(fields.length,phase>=2||action==='echoCross'?2:1);
  const first=fields[0],second=fields[1],end=Math.max(...fields.map(h=>h.delay+h.warning+h.active));
  if(second){assert.ok(second.delay>=first.warning+first.active);assert.notEqual(first.axis,second.axis);assert.equal(second.note,2);}
  assert.ok(e.bossRecoverT>=end+.84);const x=e.x,y=e.y;G.state.player.invuln=100;
  for(let t=0;t<end+.2;t+=.02){G.updateEnemies(.02);}
  assert.equal(G.state.bossHazards.length,0);assert.equal(e.x,x);assert.equal(e.y,y);assert.ok(e.bossRecoverT>.6);assert.equal(G.state.projectiles.length,0);
 }
});
test('both notes have walkable safe ground and interruption cancels the delayed echo',()=>{
 for(const phase of [1,2,3]){const {G,e}=setup(phase,'echoCross'),fields=[...G.state.bossHazards];
  for(const h of fields){const b=h.bounds;let refuge;
   for(let y=b.top+8;y<b.bottom-8;y+=8)for(let x=b.left+8;x<b.right-8;x+=8){const stripe=Math.floor(((h.axis==='y'?y-b.top:x-b.left))/h.cell);if((stripe&1)!==h.parity&&G.world.isSafeSpawn(x,y))refuge={x,y};}
   assert.ok(refuge,'walkable safe strip');Object.assign(G.state.player,refuge);G.state.player.invuln=0;const damage=G.state.player.damageTaken;G.state.bossHazards=[h];h.t=h.delay+h.warning;G.updateBossHazards(.02);assert.equal(G.state.player.damageTaken,damage);
  }
  G.state.bossHazards=fields;G.cancelBossHazards(e);assert.equal(G.state.bossHazards.length,0);G.updateBossHazards(2);assert.equal(G.state.bossHazards.length,0);
 }
});
