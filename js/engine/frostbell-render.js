/* Snow art follows the native belfry, cache and earned Echo crossings. */
"use strict";
(()=>{
 const here=()=>G.state&&G.state.mapId==='frostbellTundra',S=G.frostbellScenery,water=['#527781','#82a0a5','#bccdc9'],rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 G.frostbellWaterColors=()=>here()?water:null;
 G.drawFrostbellTile=(c,cell,x,y,time)=>{if(!(here()||(G.state?.mapDef?.formTrail&&G.state.mapDef.biome==='frostbell'))||!['grass','path','rock','water'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x+331,y+179)*2,patch=G.util.hash2(Math.floor(x/5)+81,Math.floor(y/4)+157)*2;if(cell.tile==='water'){rect(c,px,py,16,16,patch>.65?'#5b7f86':water[0]);if(r>.8){rect(c,px+3,py+7,6,1,water[1]);rect(c,px+8,py+8,2,4,water[1]);rect(c,px+10,py+12,3,1,water[1]);if(!G.reducedMotion&&Math.floor(time*.35+x)%4===0)rect(c,px+4,py+7,2,1,water[2]);}return true;}rect(c,px,py,16,16,cell.tile==='path'?['#b5c2bb','#c0cac0','#adbbb6'][Math.floor(patch*3)]:['#99afb2','#a5b9b9','#93aaae'][Math.floor(patch*3)]);if(cell.tile==='rock')G.drawSprite(c,S.shelf,Math.floor(r*4),px+8,py+16,false);else if(cell.tile==='grass'&&r>.95)G.drawSprite(c,S.shrub,Math.floor(r*4),px+8,py+16,false);else if(r>.7){rect(c,px+3,py+8,6,1,'#cfdbcc');rect(c,px+8,py+9,3,1,'#b7c8c3');}return true;};
 G.drawFrostbellPortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;c.save();c.translate(x*16+8,y*16+16);if(y===28)c.rotate(Math.PI/2);G.drawSprite(c,S.roadStep,0,0,0,false);c.restore();return true;};
 G.drawFrostbellNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;G.drawSprite(c,S.notice,0,x*16+8,y*16+16,false);return true;};
 G.drawFrostbellCache=(c,ch)=>{if(!here()||ch.chest?.item!=='frostbell-chime')return false;G.drawSprite(c,S.cache,ch.opened?1:0,ch.x*16+8,ch.y*16+16,false);return true;};
 G.drawFrostbellPost=(c,post,awake,near)=>{if(!here())return false;G.drawSprite(c,G.greenfieldScenery[awake?'postAwake':'postSleeping'],0,Math.round(post.x),Math.round(post.y)+6,false);if(near){rect(c,post.x-9,post.y-20,18,1,'#ddd9b7');rect(c,post.x-9,post.y-20,1,4,'#ddd9b7');rect(c,post.x+8,post.y-20,1,4,'#ddd9b7');}return true;};
 G.drawFrostbellFence=(c,fence)=>here()?G.drawCaravanFence(c,fence):false;
 G.drawFrostbellCamp=(c,time)=>here()?G.drawCaravanCamp(c,time):false;
 const old=G.openingDrawables;
 G.openingDrawables=c=>{const list=old(c);if(!here())return list;for(const [tx,ty]of [[3,5],[20,24],[42,4]])if(G.state.grid[ty][tx].tile==='grass'){const x=tx*16+8,y=ty*16+8;list.push({y,fn:()=>{c.save();const hidden=a=>a&&Math.abs(a.x-x)<25&&a.y<y&&a.y>y-54;if(hidden(G.state.player)||(G.state.npcs||[]).some(hidden))c.globalAlpha=Math.min(c.globalAlpha,.35);G.drawSprite(c,S.pine,G.reducedMotion?0:Math.floor(G.state.time*.2+tx)%4,x,y+4,false);c.restore();}});}return list;};
})();
