/* Slate art follows the native lamp stations, cache and earned Lantern passes. */
"use strict";
(()=>{
 const here=()=>G.state&&G.state.mapId==='stormspinePeaks',S=G.stormspineScenery,rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 G.drawStormspineTile=(c,cell,x,y)=>{if(!(here()||(G.state?.mapDef?.formTrail&&G.state.mapDef.biome==='stormspine'))||!['grass','path','rock'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x+367,y+191)*2,patch=G.util.hash2(Math.floor(x/5)+93,Math.floor(y/4)+173)*2;rect(c,px,py,16,16,cell.tile==='path'?['#9aabaf','#a8b6b7','#909fa8'][Math.floor(patch*3)]:['#7b8f98','#859b9f','#73868f'][Math.floor(patch*3)]);if(cell.tile==='rock')G.drawSprite(c,S.shelf,Math.floor(r*4),px+8,py+16,false);else if(cell.tile==='grass'&&r>.96)G.drawSprite(c,S.tuft,Math.floor(r*4),px+8,py+16,false);else if(r>.7){rect(c,px+3,py+8,6,1,'#b9c5bb');rect(c,px+8,py+9,3,1,'#9badac');}return true;};
 G.drawStormspinePortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;G.drawSprite(c,x===45?S.echoGate:S.roadStep,x===45&&G.hasWorldMark('echo')?1:0,x*16+(x===45?0:8),y*16+16,false);return true;};
 G.drawStormspineNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;G.drawSprite(c,S.notice,0,x*16+8,y*16+16,false);return true;};
 G.drawStormspineCache=(c,ch)=>{if(!here()||ch.chest?.item!=='stormglass-lantern')return false;G.drawSprite(c,S.cache,ch.opened?1:0,ch.x*16+8,ch.y*16+16,false);return true;};
 G.drawStormspinePost=(c,post,awake,near)=>{if(!here())return false;G.drawSprite(c,G.greenfieldScenery[awake?'postAwake':'postSleeping'],0,Math.round(post.x),Math.round(post.y)+6,false);if(near){rect(c,post.x-9,post.y-20,18,1,'#ddd9b7');rect(c,post.x-9,post.y-20,1,4,'#ddd9b7');rect(c,post.x+8,post.y-20,1,4,'#ddd9b7');}return true;};
 G.drawStormspineFence=(c,fence)=>here()?G.drawCaravanFence(c,fence):false;
 G.drawStormspineCamp=(c,time)=>here()?G.drawCaravanCamp(c,time):false;
 const old=G.openingDrawables;
 G.openingDrawables=c=>{const list=old(c);if(!here())return list;for(const [tx,ty]of [[12,4],[25,4],[13,24],[31,24]])if(G.state.grid[ty][tx].tile==='rock'){const x=tx*16+8,y=ty*16+8;list.push({y,fn:()=>{c.save();const hidden=a=>a&&Math.abs(a.x-x)<25&&a.y<y&&a.y>y-52;if(hidden(G.state.player)||(G.state.npcs||[]).some(hidden))c.globalAlpha=Math.min(c.globalAlpha,.35);G.drawSprite(c,S.spire,G.reducedMotion?0:Math.floor(G.state.time*.2+tx)%4,x,y+4,false);c.restore();}});}return list;};
})();
