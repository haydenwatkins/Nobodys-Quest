/* The shelter and blossoms are views of the saved planting reward. */
"use strict";
(()=>{
 const here=()=>G.state&&G.state.mapId==='whispering-grove',S=G.groveScenery,water=['#4f7278','#7b9b98','#bccbc0'];
 const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 G.groveWaterColors=()=>here()?water:null;
 G.drawGroveTile=(c,cell,x,y,time)=>{if(!here()||!['grass','path','tree','water'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x+133,y+73)*2,patch=G.util.hash2(Math.floor(x/4)+87,Math.floor(y/4)+31)*2;
  if(cell.tile==='water'){rect(c,px,py,16,16,patch>.65?'#547a7e':water[0]);if(r>.67){const drift=G.reducedMotion?0:Math.floor(time*.5+r*3)%3;rect(c,px+3+drift,py+8,6,1,water[1]);rect(c,px+10,py+10,2,1,water[2]);}if(r>.94)G.drawSprite(c,G.marshScenery.lily,Math.floor(G.util.hash2(x+181,y+67)*8),px+8,py+14,false);}
  else{rect(c,px,py,16,16,cell.tile==='path'?['#af9e7a','#b6a682','#a69876'][Math.floor(patch*3)]:['#78947a','#809b7c','#738f77'][Math.floor(patch*3)]);if(cell.tile==='tree')G.drawSprite(c,S.hedge,Math.floor(r*4),px+8,py+16,false);else if(cell.tile==='path'&&r>.5){rect(c,px+3,py+6,5,1,'#cfbd98');rect(c,px+10,py+11,2,1,'#8a8d70');}else if(cell.tile==='grass'&&r>.92)G.drawSprite(c,G.mistwoodScenery.fern,Math.floor(G.util.hash2(x+151,y+53)*8),px+8,py+16,false);}
  return true;
 };
 G.drawGroveNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;G.drawSprite(c,S.notice,0,x*16+8,y*16+16,false);return true;};
 G.drawGrovePortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;G.drawSprite(c,S.returnStep,0,x*16+8,y*16+16,false);return true;};
 G.drawGroveSeedCache=(c,ch)=>{if(!here()||ch.chest?.item!=='whispering-seed')return false;G.drawSprite(c,S.seedBox,ch.opened?1:0,ch.x*16+8,ch.y*16+16,false);return true;};
 G.drawGrovePantry=(c,ch)=>{if(!here()||!ch.food)return false;G.drawSprite(c,G.homeScenery[ch.opened?'pantryEmpty':'pantryReady'],0,ch.x*16+8,ch.y*16+16,false);if(ch.opened){const p=1-Math.min(1,Math.max(0,(ch.readyAt||0)-Date.now())/G.PANTRY_REFILL_MS);rect(c,ch.x*16+3,ch.y*16+14,10,1,'#334b43');rect(c,ch.x*16+3,ch.y*16+14,Math.round(p*10),1,'#ae8d62');}return true;};
 G.drawGrovePost=(c,post,awake,near)=>{if(!here())return false;G.drawSprite(c,G.greenfieldScenery[awake?'postAwake':'postSleeping'],0,Math.round(post.x),Math.round(post.y)+6,false);if(near){rect(c,post.x-9,post.y-20,18,1,'#d7ba82');rect(c,post.x-9,post.y-20,1,4,'#d7ba82');rect(c,post.x+8,post.y-20,1,4,'#d7ba82');}return true;};
 const behind=(a,x,y)=>a&&Math.abs(a.x-x)<24&&a.y<y-12&&a.y>y-60;
 function tree(c,x,y){c.save();if(behind(G.state.player,x,y)||(G.state.npcs||[]).some(a=>behind(a,x,y)))c.globalAlpha=Math.min(c.globalAlpha,.35);G.drawSprite(c,S.shelterTree,G.reducedMotion?0:Math.floor(G.state.time*.6+x)%4,x,y+6,false);c.restore();}
 G.drawGroveShelter=(c,x,y,planted)=>{if(!here())return false;if(planted)tree(c,x,y);else G.drawSprite(c,S.stump,0,x,y+12,false);return true;};
 G.drawGroveFlower=(c,x,y)=>{if(!here())return false;G.drawSprite(c,S.flower,Math.floor(G.util.hash2(x,y)*8),x,y+5,false);return true;};
 const old=G.openingDrawables;
 G.openingDrawables=c=>{const list=old(c);if(!here())return list;for(const [tx,ty]of [[0,4],[29,4],[0,13],[29,13],[9,17],[20,17]])if(G.state.grid[ty][tx].tile==='tree'){const x=tx*16+8,y=ty*16+8;list.push({y,fn:()=>tree(c,x,y)});}return list;};
})();
