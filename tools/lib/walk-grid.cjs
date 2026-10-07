// Find a real feet-safe approach, then walk every tile through native
// collision/triggers. No coordinate changes, teleports or terrain grants.
const assert=require('node:assert/strict'),walk=require('../../tests/helpers/walk-road.cjs');
module.exports=function walkGrid(r,x,y){
 const {G}=r,start=[Math.floor(G.state.player.x/16),Math.floor(G.state.player.y/16)],queue=[start],parents=new Map([[start.join(','),null]]);
 for(let i=0;i<queue.length&&!parents.has(x+','+y);i++){const [px,py]=queue[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
  const nx=px+dx,ny=py+dy,key=nx+','+ny;if(parents.has(key)||!G.world.isSafeSpawn(nx*16+8,ny*16+8))continue;parents.set(key,[px,py]);queue.push([nx,ny]);}}
 assert.ok(parents.has(x+','+y),'a walked approach exists');const path=[];let point=[x,y];
 while(point){path.unshift(point);point=parents.get(point.join(','));}walk(r,path);
};
