/* The dial opens only the native six-cell shortcut; the gate reads its own Mark. */
"use strict";
(()=>{
 const here=()=>G.state&&G.state.mapId==='glasswaterDesert',S=G.glasswaterScenery,rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 G.drawGlasswaterTile=(c,cell,x,y)=>{if(!here()||!['grass','path','rock'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x+283,y+197)*2,patch=G.util.hash2(Math.floor(x/5)+61,Math.floor(y/4)+139)*2;rect(c,px,py,16,16,cell.tile==='path'?['#d0bc9e','#d8c6ab','#c5b097'][Math.floor(patch*3)]:['#bca487','#c6ae91','#b49b83'][Math.floor(patch*3)]);if(cell.tile==='rock'){G.drawSprite(c,S.shelf,Math.floor(r*4),px+8,py+16,false);const rock=(xx,yy)=>G.state.grid[yy]?.[xx]?.tile==='rock';if(!rock(x,y-1))rect(c,px,py,16,1,'#d0bba1');if(!rock(x,y+1))rect(c,px,py+15,16,1,'#8b7772');}else if(cell.tile==='path'&&[19,20].includes(y)&&[22,23,24].includes(x)&&G.glasswaterSurvey().aligned)G.drawSprite(c,S.meridianSlab,0,px+8,py+16,false);else if(cell.tile==='grass'&&r>.95)G.drawSprite(c,S.duneGrass,Math.floor(r*4),px+8,py+16,false);else if(cell.tile==='path'&&r>.65){rect(c,px+3,py+8,7,1,'#e7d5b4');rect(c,px+11,py+11,2,1,'#b29b8c');}return true;};
 G.drawGlasswaterPortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;if(y===28)G.drawSprite(c,S.lanternGate,G.hasWorldMark(cell.mark)?1:0,x*16+8,y*16+16,false);else G.drawSprite(c,S.roadStep,0,x*16+8,y*16+16,false);return true;};
 G.drawGlasswaterNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;G.drawSprite(c,S.notice,0,x*16+8,y*16+16,false);return true;};
 G.drawGlasswaterCache=(c,ch)=>{if(!here()||ch.chest?.item!=='glasswater-prism')return false;G.drawSprite(c,S.cache,ch.opened?1:0,ch.x*16+8,ch.y*16+16,false);return true;};
 G.drawGlasswaterPost=(c,post,awake,near)=>{if(!here())return false;G.drawSprite(c,G.greenfieldScenery[awake?'postAwake':'postSleeping'],0,Math.round(post.x),Math.round(post.y)+6,false);if(near){rect(c,post.x-9,post.y-20,18,1,'#ddbe88');rect(c,post.x-9,post.y-20,1,4,'#ddbe88');rect(c,post.x+8,post.y-20,1,4,'#ddbe88');}return true;};
 G.drawGlasswaterFence=(c,fence)=>here()?G.drawCaravanFence(c,fence):false;
 G.drawGlasswaterCamp=(c,time)=>here()?G.drawCaravanCamp(c,time):false;
 G.drawGlasswaterDial=(c,x,y,aligned)=>{if(!here())return false;G.drawSprite(c,S.sundial,aligned?1:0,x,y+8,false);return true;};
 G.drawGlasswaterMeridian=(c,x,y,aligned)=>{if(!here())return false;G.drawSprite(c,S.meridianStone,aligned?1:0,x,y+7,false);return true;};
 const old=G.openingDrawables;
 G.openingDrawables=c=>{const list=old(c);if(!here())return list;for(const [tx,ty]of [[13,4],[30,5],[17,20],[29,19]])if(G.state.grid[ty][tx].tile==='rock'){const x=tx*16+8,y=ty*16+8;list.push({y,fn:()=>{c.save();const hidden=a=>a&&Math.abs(a.x-x)<28&&a.y<y&&a.y>y-38;if(hidden(G.state.player)||(G.state.npcs||[]).some(hidden))c.globalAlpha=Math.min(c.globalAlpha,.35);G.drawSprite(c,S.glassFin,G.reducedMotion?0:Math.floor(G.state.time*.2+tx)%4,x,y+6,false);c.restore();}});}return list;};
})();
