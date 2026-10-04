const assert=require('node:assert/strict');
// Native feet collision, triggers, world interactions and collection. Callers
// provide authored waypoints; this helper never changes player coordinates.
module.exports=function walkRoad(r,points){
 const {G}=r,p=G.state.player;
 for(const [tx,ty]of points){const x=tx*G.TILE+8,y=ty*G.TILE+8;
  for(let i=0;i<1000&&Math.hypot(x-p.x,y-p.y)>1;i++){
   const dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy),amount=Math.min(1.5,d);
   G.input.vec={x:dx/d,y:dy/d};G.world.moveBox(p,dx/d*amount,dy/d*amount);
   G.state.time+=.02;G.updateOpening(.02);G.world.checkTriggers(.02);G.updatePickups(.02);r.drain();
  }
  assert.ok(Math.hypot(x-p.x,y-p.y)<=1,`walk reaches ${tx},${ty}`);
 }
 G.input.vec={x:0,y:0};
};
