/* Saved lens alignment selects mounted glass and spindle indicators. */
"use strict";
(()=>{
 const here=()=>G.state&&G.state.mapId==='starfallRuins',S=G.starfallScenery;
 const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 G.drawStarfallTile=(c,cell,x,y)=>{if(!here()||!['floor','wall','rock'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x+129,y+97)*2,patch=G.util.hash2(Math.floor(x/4)+27,Math.floor(y/4)+43)*2;
  if(cell.tile==='wall')G.drawSprite(c,S.wall,Math.floor(r*4),px+8,py+16,false);
  else{const hall=x>=13&&x<=17,cols=hall?['#626c88','#68738e','#5d6682']:['#555d79','#5a627e','#505973'];rect(c,px,py,16,16,cols[Math.floor(patch*3)]);if(r>.57){rect(c,px+3,py+7,4,1,'#76819a');rect(c,px+10,py+12,3,1,'#434c68');}if(hall&&(x===13||x===17))rect(c,px+7,py+3,1,5,'#929393');if(cell.tile==='rock')G.drawSprite(c,S.fallenStone,Math.floor(r*4),px+8,py+16,false);}
  return true;
 };
 G.drawStarfallNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;G.drawSprite(c,S.notice,0,x*16+8,y*16+16,false);return true;};
 G.drawStarfallPortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;G.drawSprite(c,S.returnStep,0,x*16+8,y*16+16,false);return true;};
 G.drawStarfallPost=(c,post,awake,near)=>{if(!here())return false;G.drawSprite(c,G.greenfieldScenery[awake?'postAwake':'postSleeping'],0,Math.round(post.x),Math.round(post.y)+6,false);if(near){rect(c,post.x-9,post.y-20,18,1,'#bec8cd');rect(c,post.x-9,post.y-20,1,4,'#bec8cd');rect(c,post.x+8,post.y-20,1,4,'#bec8cd');}return true;};
 G.drawStarfallPantry=(c,ch)=>{if(!here()||!ch.food)return false;G.drawSprite(c,G.homeScenery[ch.opened?'pantryEmpty':'pantryReady'],0,ch.x*16+8,ch.y*16+16,false);if(ch.opened){const p=1-Math.min(1,Math.max(0,(ch.readyAt||0)-Date.now())/G.PANTRY_REFILL_MS);rect(c,ch.x*16+3,ch.y*16+14,10,1,'#2f3348');rect(c,ch.x*16+3,ch.y*16+14,Math.round(p*10),1,'#8996a7');}return true;};
 G.drawStarfallMechanism=(c,l,done,center,lenses)=>{if(!here())return false;const x=l.x*16+8,bottom=l.y*16+18;G.drawSprite(c,S[center?'starSpindle':({'starfall-dawn':'dawnLens','starfall-dusk':'duskLens','starfall-midnight':'midnightLens'})[l.id]],done?1:0,x,bottom,false);if(center)for(let i=0;i<lenses.length;i++){const lit=G.state.items.includes(lenses[i].id);rect(c,x-12.5+i*10,bottom-36.5,3,1.5,lit?lenses[i].color:'#464b66');}return true;};
})();
