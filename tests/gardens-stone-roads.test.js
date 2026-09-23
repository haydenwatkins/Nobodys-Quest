const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
const crossing=[[15,10],[16,10],[15,11],[16,11],[15,18],[16,18],[15,19],[16,19]];
const solid=(G,x,y)=>G.world.solid(x*16+8,y*16+8);
test('Mason raises both western channel crossings on victory and old-save revisits',()=>{
 const r=runtime(),{G}=r;r.load('hangingGardens');r.drain();
 for(const [x,y] of crossing)assert.equal(solid(G,x,y),true,`water before mark ${x},${y}`);
 G.state.worldwake.marks.push('stone');G.events.emit('pickup',{item:'trophy-old-mason'});
 for(const [x,y] of crossing){assert.equal(G.state.grid[y][x].tile,'path');assert.equal(solid(G,x,y),false,`raised step ${x},${y}`);}
 assert.equal(G.state.grid[10][17].tile,'water');
 r.load('windscarCanyon');r.drain();r.load('hangingGardens');r.drain();
 for(const [x,y] of crossing)assert.equal(solid(G,x,y),false,`revisited step ${x},${y}`);
 const old=runtime();old.G.state.worldwake=old.G.normalizeWorldwake(undefined,{items:['trophy-old-mason'],mapId:'hangingGardens'});
 old.load('hangingGardens');old.drain();for(const [x,y] of crossing)assert.equal(solid(old.G,x,y),false,`old save ${x},${y}`);
});
test('the raised steps connect upper, middle and lower roads without opening a new edge exit',()=>{
 const r=runtime(),{G}=r;G.ensureWorldwake().marks.push('stone');r.load('hangingGardens');r.drain();
 const seen=new Set(['15,7']),q=[[15,7]];
 for(let i=0;i<q.length;i++)for(const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1]]){
  const [x,y]=q[i],nx=x+dx,ny=y+dy,key=nx+','+ny;
  if(nx<1||ny<1||nx>=45||ny>=28||seen.has(key)||solid(G,nx,ny))continue;
  seen.add(key);q.push([nx,ny]);
 }
 for(const point of ['15,14','15,23','7,20','35,8','38,24'])assert.ok(seen.has(point),point);
 for(const [x,y] of crossing)assert.ok(seen.has(`${x},${y}`));
});
