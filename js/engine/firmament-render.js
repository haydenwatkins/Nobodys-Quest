/* Four folded-map cases keep the Final Firmament's native solid cover. */
"use strict";
(()=>{
 const here=()=>G.state&&G.state.mapId==='godTrial',S=G.firmamentScenery,rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 G.drawFirmamentTile=(c,cell,x,y)=>{if(!here()||!['floor','wall','rock'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x+227,y+461)*2,patch=G.util.hash2(Math.floor(x/4)+173,Math.floor(y/3)+293)*2;rect(c,px,py,16,16,['#75838f','#7d8b96','#6d7c88'][Math.floor(patch*3)]);if(cell.tile==='wall')G.drawSprite(c,S.wall,Math.floor(r*4),px+8,py+16,false);else{if(y%3===0)rect(c,px,py,16,1,'#647381');if(x%4===0)rect(c,px,py,1,16,'#647381');if(r>.82){rect(c,px+4,py+10,5,1,'#94a1a8');rect(c,px+9,py+11,3,1,'#6f7e8a');}}return true;};
 G.drawFirmamentPortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;G.drawSprite(c,S.returnStep,0,x*16+8,y*16+16,false);return true;};
 G.drawFirmamentNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;G.drawSprite(c,S.notice,0,x*16+8,y*16+16,false);return true;};
 G.drawFirmamentCache=(c,ch)=>{if(!here())return false;const x=ch.x*16+8,y=ch.y*16+16;G.drawSprite(c,S.cookieFolio,ch.opened?1:0,x,y,false);if(ch.food&&ch.opened){const progress=1-Math.min(1,Math.max(0,(ch.readyAt||0)-Date.now())/G.PANTRY_REFILL_MS);rect(c,x-10,y-5,20,1,'#394453');rect(c,x-10,y-5,Math.round(20*progress),1,'#a8c7b5');}return true;};
 const old=G.openingDrawables;
 G.openingDrawables=c=>{const list=old(c);if(!here())return list;const prop=(id,x,y,depth)=>list.push({y:depth,fn:()=>{c.save();const m=G.spriteMetrics(S[id]),hidden=a=>a&&Math.abs(a.x-x)<m.w/2+12&&a.y<y+4&&a.y>y-m.h-2;if(hidden(G.state.player)||(G.state.npcs||[]).some(hidden))c.globalAlpha*=.35;G.drawSprite(c,S[id],0,x,y,false);c.restore();}});for(let ty=0;ty<G.state.mapH;ty++)for(let tx=0;tx<G.state.mapW;tx++)if(G.state.grid[ty][tx].tile==='rock')prop('routeCase',tx*16+8,ty*16+16,ty*16+15);for(const [id,tx,bottom]of [['routeArchive',6,40],['blankChart',13,38],['routeArchive',20,40]])prop(id,tx*16+8,bottom,16);return list;};
})();
