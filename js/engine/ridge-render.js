/* Rendering only: watchfire victories still come from the native guard fight. */
"use strict";
(()=>{
 const here=()=>G.state&&G.state.mapId==='emberRidge',S=G.ridgeScenery;
 const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 G.drawRidgeTile=(c,cell,x,y)=>{if(!here()||!['floor','wall','rock'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x+161,y+93)*2,patch=G.util.hash2(Math.floor(x/5)+39,Math.floor(y/3)+61)*2;
  if(cell.tile==='wall'){G.drawSprite(c,S.cliff,Math.floor(r*4),px+8,py+16,false);}
  else{const road=y>=8&&y<=10,ground=road?['#897063','#927867','#826a60']:['#665258','#6b575a','#625057'];rect(c,px,py,16,16,ground[Math.floor(patch*3)]);if(r>.5){rect(c,px+3,py+8,3,1,road?'#b2997a':'#80676a');rect(c,px+10,py+11,2,1,'#51444c');}if(cell.tile==='rock')G.drawSprite(c,S.basalt,Math.floor(r*4),px+8,py+16,false);else if((x===21||x===27)&&y>=6&&y<=12)rect(c,px+7,py+4,2,4,'#9d8168');}
  return true;
 };
 G.drawRidgeNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;G.drawSprite(c,S.notice,0,x*16+8,y*16+16,false);return true;};
 G.drawRidgePortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;G.drawSprite(c,S.returnStep,0,x*16+8,y*16+16,false);return true;};
 G.drawRidgePantry=(c,ch)=>{if(!here()||!ch.food)return false;G.drawSprite(c,G.homeScenery[ch.opened?'pantryEmpty':'pantryReady'],0,ch.x*16+8,ch.y*16+16,false);if(ch.opened){const p=1-Math.min(1,Math.max(0,(ch.readyAt||0)-Date.now())/G.PANTRY_REFILL_MS);rect(c,ch.x*16+3,ch.y*16+14,10,1,'#302d35');rect(c,ch.x*16+3,ch.y*16+14,Math.round(p*10),1,'#b2957a');}return true;};
 G.drawRidgePost=(c,post,awake,near)=>{if(!here())return false;G.drawSprite(c,G.greenfieldScenery[awake?'postAwake':'postSleeping'],0,Math.round(post.x),Math.round(post.y)+6,false);if(near){rect(c,post.x-9,post.y-20,18,1,'#d4bd96');rect(c,post.x-9,post.y-20,1,4,'#d4bd96');rect(c,post.x+8,post.y-20,1,4,'#d4bd96');}return true;};
 G.drawRidgeFire=(c,fire,lit,fighting)=>{if(!here())return false;G.drawSprite(c,S.watchfire,lit?(G.reducedMotion?2:2+Math.floor(G.state.time*3)%2):fighting?1:0,fire.x*16+8,fire.y*16+18,false);return true;};
 G.drawRidgeStandard=(c,tx,ty)=>{if(!here())return false;G.drawSprite(c,S.standard,0,tx*16+8,ty*16+12,false);return true;};
})();
