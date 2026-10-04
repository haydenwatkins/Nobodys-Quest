/* Authored root craft keeps Tess's native chambers and woven-road state. */
"use strict";
(()=>{
 const here=()=>G.state&&G.state.mapId==='rootdeepHollow',S=G.rootdeepScenery,rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 G.drawRootdeepTile=(c,cell,x,y)=>{if(!(here()||(G.state?.mapDef?.formTrail&&G.state.mapDef.biome==='rootdeep'))||!['grass','path','tree'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x+251,y+181)*2,patch=G.util.hash2(Math.floor(x/5)+43,Math.floor(y/4)+113)*2;rect(c,px,py,16,16,cell.tile==='path'?['#8e8091','#968997','#857987'][Math.floor(patch*3)]:['#52665b','#566c61','#4d6259'][Math.floor(patch*3)]);if(cell.tile==='tree')G.drawSprite(c,S.rootWall,Math.floor(r*4),px+8,py+16,false);else if(cell.tile==='grass'&&r>.94)G.drawSprite(c,S.fern,Math.floor(r*4),px+8,py+16,false);else if(cell.tile==='path'&&r>.6){rect(c,px+3,py+8,7,1,'#b4a0ae');rect(c,px+11,py+11,2,1,'#776778');}return true;};
 G.drawRootdeepPortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;c.save();if(x===0){c.translate(x*16+8,y*16+16);c.scale(-1,1);G.drawSprite(c,S.roadStep,0,0,0,false);}else G.drawSprite(c,S.roadStep,0,x*16+8,y*16+16,false);c.restore();return true;};
 G.drawRootdeepNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;G.drawSprite(c,S.notice,0,x*16+8,y*16+16,false);return true;};
 G.drawRootdeepCache=(c,ch)=>{if(!here()||ch.chest?.item!=='rootdeep-silk')return false;G.drawSprite(c,S.cache,ch.opened?1:0,ch.x*16+8,ch.y*16+16,false);return true;};
 G.drawRootdeepPost=(c,post,awake,near)=>{if(!here())return false;G.drawSprite(c,G.greenfieldScenery[awake?'postAwake':'postSleeping'],0,Math.round(post.x),Math.round(post.y)+6,false);if(near){rect(c,post.x-9,post.y-20,18,1,'#d5b9c4');rect(c,post.x-9,post.y-20,1,4,'#d5b9c4');rect(c,post.x+8,post.y-20,1,4,'#d5b9c4');}return true;};
 G.drawRootdeepFence=(c,fence)=>here()?G.drawCaravanFence(c,fence):false;
 G.drawRootdeepCamp=(c,time)=>here()?G.drawCaravanCamp(c,time):false;
 function yielding(c,id,x,y,range,height){c.save();const behind=a=>a&&Math.abs(a.x-x)<range&&a.y<y&&a.y>y-height;if(behind(G.state.player,x,y)||(G.state.npcs||[]).some(behind))c.globalAlpha=Math.min(c.globalAlpha,.35);G.drawSprite(c,S[id],G.reducedMotion?0:Math.floor(G.state.time*.25+x)%4,x,y,false);c.restore();}
 G.drawRootdeepDoor=(c,x,y)=>{if(!here())return false;yielding(c,'doorway',x,y+8,24,43);return true;};
 G.drawRootdeepLamp=(c,x,y)=>{if(!here())return false;yielding(c,'silkLamp',x,y+4,11,35);return true;};
 G.drawRootdeepWovenStep=(c,x,y)=>{if(!here())return false;G.drawSprite(c,S.wovenStep,0,x,y+8,false);return true;};
 const old=G.openingDrawables;
 G.openingDrawables=c=>{const list=old(c);if(!here())return list;for(const [tx,ty]of [[4,3],[20,3],[10,25],[39,25]])if(G.state.grid[ty][tx].tile==='tree'){const x=tx*16+8,y=ty*16+8;list.push({y,fn:()=>yielding(c,'rootCluster',x,y+6,23,51)});}return list;};
})();
