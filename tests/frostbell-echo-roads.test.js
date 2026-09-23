const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
const bridges=[];for(const y of [18,19,20])for(const x of [15,16,29,30])bridges.push([x,y]);
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
test('Bongle opens both resonant ice crossings on victory and old saves restore them',()=>{
 const r=runtime(),{G}=r;r.load('frostbellTundra');r.drain();
 for(const [x,y]of bridges)assert.equal(solid(G,x,y),true,`${x},${y} before mark`);
 G.events.emit('pickup',{item:'trophy-bell-titan'});
 assert.ok(G.hasWorldMark('echo'));
 for(const [x,y]of bridges)assert.equal(solid(G,x,y),false,`${x},${y} after mark`);
 assert.equal(G.state.grid[19][17].tile,'water');
 r.load('stormspinePeaks');r.drain();r.load('frostbellTundra');r.drain();
 for(const [x,y]of bridges)assert.equal(solid(G,x,y),false,`${x},${y} after return`);
 const old=runtime();old.G.state.worldwake=old.G.normalizeWorldwake(undefined,{items:['trophy-bell-titan'],mapId:'frostbellTundra'});
 old.load('frostbellTundra');old.drain();
 for(const [x,y]of bridges)assert.equal(solid(old.G,x,y),false,`${x},${y} old save`);
});
test('echo crossings shorten both shore routes while keeping Frostbell exits intact',()=>{
 const r=runtime(),{G}=r;r.load('frostbellTundra');r.drain();
 const before=[distance(G,[15,17],[15,21]),distance(G,[29,17],[29,21])];
 G.events.emit('pickup',{item:'trophy-bell-titan'});
 const after=[distance(G,[15,17],[15,21]),distance(G,[29,17],[29,21])];
 for(let i=0;i<2;i++){assert.ok(before[i]>after[i]+5,`${before[i]} to ${after[i]}`);assert.equal(after[i],4);}
 assert.equal(G.state.grid[28][23].portal.map,'shattercoast');
 assert.equal(G.state.grid[14][45].portal.map,'stormspinePeaks');
});
