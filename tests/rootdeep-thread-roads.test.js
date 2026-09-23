const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
const woven=[];for(const y of [19,20])for(const x of [15,16,28,29])woven.push([x,y]);
const blocked=(G,x,y)=>G.world.solid(x*16+8,y*16+8);
test('Tess opens lower root passages on victory and old trophy saves restore them',()=>{
 const r=runtime(),{G}=r;r.load('rootdeepHollow');r.drain();
 for(const [x,y] of woven)assert.equal(blocked(G,x,y),true);
 G.ensureWorldwake().marks.push('thread');G.events.emit('pickup',{item:'trophy-silk-matriarch'});
 for(const [x,y] of woven)assert.equal(blocked(G,x,y),false);
 assert.equal(blocked(G,15,10),true);
 r.load('hangingGardens');r.drain();r.load('rootdeepHollow');r.drain();
 for(const [x,y] of woven)assert.equal(blocked(G,x,y),false);
 const old=runtime();old.G.state.worldwake=old.G.normalizeWorldwake(undefined,{items:['trophy-silk-matriarch'],mapId:'rootdeepHollow'});
 old.load('rootdeepHollow');old.drain();for(const [x,y] of woven)assert.equal(blocked(old.G,x,y),false);
});
test('woven lower passages join all three chambers while edge exits stay unchanged',()=>{
 const r=runtime(),{G}=r;G.ensureWorldwake().marks.push('thread');r.load('rootdeepHollow');r.drain();
 const seen=new Set(['7,20']),q=[[7,20]];
 for(let i=0;i<q.length;i++)for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
  const [x,y]=q[i],nx=x+dx,ny=y+dy,key=nx+','+ny;
  if(nx<1||ny<1||nx>=45||ny>=28||seen.has(key)||blocked(G,nx,ny))continue;
  seen.add(key);q.push([nx,ny]);
 }
 for(const [x,y] of woven)assert.ok(seen.has(`${x},${y}`));
 for(const point of ['14,20','22,20','35,20','37,23','35,8'])assert.ok(seen.has(point),point);
 assert.equal(G.state.grid[14][0].portal.map,'hangingGardens');
 assert.equal(G.state.grid[14][45].portal.map,'glasswaterDesert');
});
