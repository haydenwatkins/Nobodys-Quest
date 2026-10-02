/* Render the current generated chamber; never rebuild or mutate its routes. */
"use strict";
(()=>{
 const here=()=>G.state?.mapId==='manyfoldExpedition',S=G.shiftingScenery;
 const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 const hidden=(sprite,x,y,a)=>{const m=G.spriteMetrics(sprite);return a&&Math.abs(a.x-x)<m.w/2+8&&a.y>y-m.h-2&&a.y<y+4;};
 const yielding=(c,sprite,x,y,fn)=>{c.save();if(hidden(sprite,x,y,G.state.player)||(G.state.npcs||[]).some(a=>hidden(sprite,x,y,a)))c.globalAlpha*=.35;fn();c.restore();};
 G.drawShiftingTile=(c,cell,x,y)=>{if(!here()||!['floor','wall','rock'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x+373,y+151)*2,patch=G.util.hash2(Math.floor(x/5)+53,Math.floor(y/4)+97)*2;rect(c,px,py,16,16,['#858d87','#8b928a','#7e8883'][Math.floor(patch*3)]);if(cell.tile==='wall')G.drawSprite(c,S.wall,Math.floor(r*4),px+8,py+16,false);else if(r>.85){rect(c,px+4,py+10,5,1,'#a2a799');rect(c,px+9,py+11,3,1,'#737f7b');}return true;};
 G.drawShiftingNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;const px=x*16+8,py=y*16+16;yielding(c,S.notice,px,py,()=>G.drawSprite(c,S.notice,0,px,py,false));return true;};
 const old=G.openingDrawables;
 G.openingDrawables=c=>{const list=old(c);if(!here())return list;const prop=(id,x,y,depth)=>list.push({y:depth,fn:()=>yielding(c,S[id],x,y,()=>{const run=G.state.expeditionRun,lit=id==='hearth'&&run?.phase==='reward'&&run.currentRoute==='camp';G.drawSprite(c,S[id],lit?(G.reducedMotion?1:1+2*(Math.floor(G.state.time*4)%2)):0,x,y,false);if(id==='trailRack'&&run){c.fillStyle='#ead093';c.font='4px monospace';c.textAlign='left';c.fillText(run.phase==='reward'?'DRAFT':run.phase==='route'?'ROUTE':'BATTLE',x-17,y-30);c.fillText((run.phase==='reward'?'NEXT ':'ROOM ')+Math.min(run.length,run.room+1)+'/'+run.length,x-17,y-24);}})});
  for(let y=0;y<G.state.mapH;y++)for(let x=0;x<G.state.mapW;x++)if(G.state.grid[y][x].tile==='rock')prop('guideStone',x*16+8,y*16+16,y*16+15);
  prop('foldChart',8*16+8,40,16);prop('trailRack',20*16+8,42,16);prop('hearth',3*16+8,80,79);return list;};
})();
