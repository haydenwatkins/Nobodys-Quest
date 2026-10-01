/* Night flowers occupy the existing cover; mounted shelter fittings add no collision. */
"use strict";
(()=>{
 const here=()=>G.state&&G.state.mapId==='vampireTrial',S=G.duskScenery,rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 G.drawDuskTile=(c,cell,x,y)=>{if(!here()||!['floor','wall','rock'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x+347,y+179)*2,patch=G.util.hash2(Math.floor(x/5)+113,Math.floor(y/4)+71)*2;rect(c,px,py,16,16,['#697888','#637282','#6d7c8c'][Math.floor(patch*3)]);if(cell.tile==='wall')G.drawSprite(c,S.wall,Math.floor(r*4),px+8,py+16,false);else{if(x%3===0)rect(c,px,py,1,16,'#5d6b7b');if(r>.75){rect(c,px+5,py+9,5,1,'#7c8b98');rect(c,px+10,py+10,2,1,'#5d6b7b');}}return true;};
 G.drawDuskPortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;G.drawSprite(c,S.returnStep,0,x*16+8,y*16+16,false);return true;};
 G.drawDuskNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;G.drawSprite(c,S.notice,0,x*16+8,y*16+16,false);return true;};
 G.drawDuskCache=(c,ch)=>{if(!here())return false;const x=ch.x*16+8,y=ch.y*16+16;G.drawSprite(c,S.velvetPantry,ch.opened?1:0,x,y,false);if(ch.food&&ch.opened){const progress=1-Math.min(1,Math.max(0,(ch.readyAt||0)-Date.now())/G.PANTRY_REFILL_MS);rect(c,x-10,y-5,20,1,'#353d50');rect(c,x-10,y-5,Math.round(20*progress),1,'#b1c7a4');}return true;};
 const old=G.openingDrawables;
 G.openingDrawables=c=>{const list=old(c);if(!here())return list;for(let ty=0;ty<G.state.mapH;ty++)for(let tx=0;tx<G.state.mapW;tx++)if(G.state.grid[ty][tx].tile==='rock'){const x=tx*16+8,y=ty*16+16;list.push({y:y-1,fn:()=>{c.save();const hidden=a=>a&&Math.abs(a.x-x)<17&&a.y<y&&a.y>y-38;if(hidden(G.state.player)||(G.state.npcs||[]).some(hidden))c.globalAlpha*=.35;G.drawSprite(c,S.flowerStand,0,x,y,false);c.restore();}});}for(const [id,tx,bottom]of [['window',9,40],['teaShelf',18,32]]){const x=tx*16+8,y=bottom;list.push({y:16,fn:()=>{c.save();const hidden=a=>a&&Math.abs(a.x-x)<26&&a.y<y&&a.y>y-38;if(hidden(G.state.player)||(G.state.npcs||[]).some(hidden))c.globalAlpha*=.35;G.drawSprite(c,S[id],0,x,y,false);c.restore();}});}return list;};
})();
