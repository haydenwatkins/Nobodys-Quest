/* Materials and fitted furniture follow the native vault, cache and atlas states. */
"use strict";
(()=>{
 const here=()=>G.state?.mapId==='dungeon',S=G.dungeonScenery;
 const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 const yieldAt=(c,sprite,x,y,fn)=>{c.save();const m=G.spriteMetrics(sprite),hidden=a=>a&&Math.abs(a.x-x)<m.w/2+9&&a.y>y-m.h-2&&a.y<y+4;if(hidden(G.state.player)||(G.state.npcs||[]).some(hidden))c.globalAlpha*=.35;fn();c.restore();};
 G.drawDungeonTile=(c,cell,x,y)=>{if(!here()||!['floor','wall','rock'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x+401,y+113)*2,patch=G.util.hash2(Math.floor(x/4)+71,Math.floor(y/3)+163)*2;rect(c,px,py,16,16,['#878d81','#8d9286','#818a7e'][Math.floor(patch*3)]);if(cell.tile==='wall')G.drawSprite(c,S.wall,Math.floor(r*4),px+8,py+16,false);else{if(y%3===0)rect(c,px,py+15,16,1,'#788175');if(r>.87){rect(c,px+4,py+10,5,1,'#a6ac96');rect(c,px+9,py+11,3,1,'#737f71');}}return true;};
 G.drawDungeonPortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;G.drawSprite(c,S.returnStep,0,x*16+8,y*16+16,false);return true;};
 G.drawDungeonNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;const px=x*16+8,py=y*16+16;yieldAt(c,S.notice,px,py,()=>G.drawSprite(c,S.notice,0,px,py,false));return true;};
 G.drawDungeonCache=(c,ch)=>{if(!here())return false;const x=ch.x*16+8,y=ch.y*16+16,sprite=ch.food?S.biscuitCrate:S.crestChest;yieldAt(c,sprite,x,y,()=>{G.drawSprite(c,sprite,ch.opened?1:0,x,y,false);if(ch.food&&ch.opened){const progress=1-Math.min(1,Math.max(0,(ch.readyAt||0)-Date.now())/G.PANTRY_REFILL_MS);rect(c,x-8,y-4,16,1,'#3e4947');rect(c,x-8,y-4,Math.round(16*progress),1,'#bad0b6');}});return true;};
 G.drawDungeonPost=(c,post,awake,near)=>{if(!here())return false;const x=Math.round(post.x),y=Math.round(post.y)+6;yieldAt(c,S.roadAtlas,x,y,()=>{G.drawSprite(c,S.roadAtlas,awake?1:0,x,y,false);if(near){rect(c,x-9,y-31,18,1,'#e7c489');rect(c,x-9,y-31,1,4,'#e7c489');rect(c,x+8,y-31,1,4,'#e7c489');}});return true;};
 const old=G.openingDrawables;
 G.openingDrawables=c=>{const list=old(c);if(!here())return list;const prop=(id,x,y,depth)=>list.push({y:depth,fn:()=>yieldAt(c,S[id],x,y,()=>G.drawSprite(c,S[id],0,x,y,false))});for(let y=0;y<G.state.mapH;y++)for(let x=0;x<G.state.mapW;x++)if(G.state.grid[y][x].tile==='rock')prop('brokenPillar',x*16+8,y*16+16,y*16+15);prop('bracketLamp',3*16+8,88,79);prop('bracketLamp',22*16+8,88,79);return list;};
})();
