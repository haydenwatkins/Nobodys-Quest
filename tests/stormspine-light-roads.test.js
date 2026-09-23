const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
const passes=[];for(const y of [18,19,20,21])for(const x of [15,16,28,29])passes.push([x,y]);
const solid=(G,x,y)=>!!G.world.solid(x*16+8,y*16+8);
function distance(G,start,goal){
 const q=[[...start,0]],seen=new Set([start.join(',')]);
 for(let i=0;i<q.length;i++){
  const [x,y,d]=q[i];if(x===goal[0]&&y===goal[1])return d;
  for(const [dx,dy]of [[0,1],[0,-1],[1,0],[-1,0]]){
   const nx=x+dx,ny=y+dy,key=nx+','+ny;
   if(nx<1||ny<1||nx>=45||ny>=28||seen.has(key)||solid(G,nx,ny))continue;
   seen.add(key);q.push([nx,ny,d+1]);
  }
 }
 return Infinity;
}
test('Mallow lights two ridge cuts on victory and old trophy saves restore them',()=>{
 const r=runtime(),{G}=r;r.load('stormspinePeaks');r.drain();
 for(const [x,y]of passes)assert.equal(solid(G,x,y),true,`${x},${y} before mark`);
 G.events.emit('pickup',{item:'trophy-lantern-keeper'});
 assert.ok(G.hasWorldMark('light'));
 for(const [x,y]of passes)assert.equal(solid(G,x,y),false,`${x},${y} after mark`);
 assert.equal(G.state.grid[19][17].tile,'rock');
 r.load('frostbellTundra');r.drain();r.load('stormspinePeaks');r.drain();
 for(const [x,y]of passes)assert.equal(solid(G,x,y),false,`${x},${y} after return`);
 const old=runtime();old.G.state.worldwake=old.G.normalizeWorldwake(undefined,{items:['trophy-lantern-keeper'],mapId:'stormspinePeaks'});
 old.load('stormspinePeaks');old.drain();
 for(const [x,y]of passes)assert.equal(solid(old.G,x,y),false,`${x},${y} old save`);
});
test('both lit ridge cuts shorten high-to-low travel without disturbing the Echo gate',()=>{
 const r=runtime(),{G}=r;r.load('stormspinePeaks');r.drain();
 const before=[distance(G,[15,17],[15,22]),distance(G,[28,17],[28,22])];
 G.events.emit('pickup',{item:'trophy-lantern-keeper'});
 const after=[distance(G,[15,17],[15,22]),distance(G,[28,17],[28,22])];
 for(let i=0;i<2;i++){assert.ok(before[i]>=after[i]+3,`${before[i]} to ${after[i]}`);assert.equal(after[i],5);}
 assert.equal(G.state.grid[14][0].portal.map,'frostbellTundra');
 assert.equal(G.state.grid[14][45].portal.map,'titanGrave');
 assert.equal(G.state.grid[14][45].mark,'echo');
});
