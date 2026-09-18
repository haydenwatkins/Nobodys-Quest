const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
test('Windscar shelves keep both exits, guardian, camp, cache and legend sites connected',()=>{
 const r=runtime(),{G}=r;r.load('windscarCanyon');r.drain();const s=G.state,q=[[2,14]],seen=new Set(['2,14']);
 for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx<0||ny<0||nx>=s.mapW||ny>=s.mapH||seen.has(k)||G.world.solid(nx*16+8,ny*16+8))continue;seen.add(k);q.push([nx,ny]);}}
 for(const [x,y]of [[0,14],[45,14],[35,8],[7,20],[37,22],[14,7],[27,21]])assert.ok(seen.has(x+','+y));
 for(const stages of Object.values(G.LEGEND_PATHS))for(const stage of stages.filter(s=>s.mapId==='windscarCanyon')){const p=G.legendSitePoint(stage);assert.ok(seen.has(Math.floor(p.x/16)+','+Math.floor(p.y/16)),stage.name);}
 assert.equal(s.grid[22][37].chest.item,'windscar-feather');assert.equal(s.grid[14][0].portal.map,'sunstepPrairie');assert.equal(s.grid[14][45].portal.map,'hangingGardens');assert.ok(G.world.solid(16*16+8,4*16+8));
});
