/* Pilgrim art follows native memorials, the Memory cache and Worldheart return. */
"use strict";
(()=>{
 const here=()=>G.state&&G.state.mapId==='titanGrave',S=G.titanScenery,rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 G.drawTitanTile=(c,cell,x,y)=>{if(!here()||!['grass','path','rock'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x+401,y+211)*2,patch=G.util.hash2(Math.floor(x/5)+101,Math.floor(y/4)+181)*2;rect(c,px,py,16,16,cell.tile==='path'?['#bab2a3','#c6beb0','#b0a89c'][Math.floor(patch*3)]:['#96998b','#a1a493','#8c8f84'][Math.floor(patch*3)]);if(cell.tile==='rock')G.drawSprite(c,S.shelf,Math.floor(r*4),px+8,py+16,false);else if(cell.tile==='grass'&&r>.96)G.drawSprite(c,S.moss,Math.floor(r*4),px+8,py+16,false);else if(r>.7){rect(c,px+3,py+8,6,1,'#cbd0b5');rect(c,px+8,py+9,3,1,'#aaaf9d');}return true;};
 G.drawTitanPortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;c.save();c.translate(x*16+8,y*16+8);if(y===0)c.rotate(Math.PI/2);if(y===28)c.rotate(-Math.PI/2);G.drawSprite(c,S.roadStep,0,0,8,false);c.restore();return true;};
 G.drawTitanNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;G.drawSprite(c,S.notice,0,x*16+8,y*16+16,false);return true;};
 G.drawTitanCache=(c,ch)=>{if(!here()||ch.chest?.item!=='titan-memory')return false;G.drawSprite(c,S.cache,ch.opened?1:0,ch.x*16+8,ch.y*16+16,false);return true;};
 G.drawTitanPost=(c,post,awake,near)=>{if(!here())return false;G.drawSprite(c,G.greenfieldScenery[awake?'postAwake':'postSleeping'],0,Math.round(post.x),Math.round(post.y)+6,false);if(near){rect(c,post.x-9,post.y-20,18,1,'#ddd9b7');rect(c,post.x-9,post.y-20,1,4,'#ddd9b7');rect(c,post.x+8,post.y-20,1,4,'#ddd9b7');}return true;};
 G.drawTitanFence=(c,fence)=>here()?G.drawCaravanFence(c,fence):false;
 G.drawTitanCamp=(c,time)=>here()?G.drawCaravanCamp(c,time):false;
 const old=G.openingDrawables;
 G.openingDrawables=c=>{const list=old(c);if(!here())return list;for(const [tx,ty]of [[9,4],[18,4],[14,26],[28,26]])if(G.state.grid[ty][tx].tile==='rock'){const x=tx*16+8,y=ty*16+8;list.push({y,fn:()=>{c.save();const hidden=a=>a&&Math.abs(a.x-x)<28&&a.y<y&&a.y>y-48;if(hidden(G.state.player)||(G.state.npcs||[]).some(hidden))c.globalAlpha=Math.min(c.globalAlpha,.35);G.drawSprite(c,S.rib,G.reducedMotion?0:Math.floor(G.state.time*.2+tx)%4,x,y+4,false);c.restore();}});}return list;};
})();
