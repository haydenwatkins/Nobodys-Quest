/* Mistwood art hooks read native terrain, bell, pantry and post records. */
"use strict";
(()=>{
 const here=()=>G.state&&G.state.mapId==='mistwood',S=G.mistwoodScenery;
 const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 G.drawMistwoodTile=(c,cell,x,y)=>{
  if(!here()||!['grass','path','tree'].includes(cell.tile))return false;
  const px=x*16,py=y*16,r=G.util.hash2(x+51,y+23)*2,patch=G.util.hash2(Math.floor(x/4)+31,Math.floor(y/3)+71)*2;
  rect(c,px,py,16,16,cell.tile==='path'?'#9a9276':['#536d5f','#587362','#5d7865'][Math.floor(patch*3)]);
  if(cell.tile==='tree')G.drawSprite(c,S.hedge,Math.floor(r*4),px+8,py+16,false);
  else if(cell.tile==='grass'&&r>.88)G.drawSprite(c,S.fern,Math.floor(G.util.hash2(x+123,y+43)*8),px+8,py+16,false);
  else if(cell.tile==='path'){rect(c,px+3,py+6,8,1,'#b7ae8a');rect(c,px+7,py+10,3,1,'#7d7d62');}
  return true;
 };
 G.drawMistwoodNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;G.drawSprite(c,S.notice,0,x*16+8,y*16+16,false);return true;};
 G.drawMistwoodPortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;G.drawSprite(c,S.exitStep,0,x*16+8,y*16+16,false);return true;};
 G.drawMistwoodPost=(c,post,awake,near)=>{if(!here())return false;G.drawSprite(c,G.greenfieldScenery[awake?'postAwake':'postSleeping'],0,Math.round(post.x),Math.round(post.y)+6,false);if(near){rect(c,post.x-9,post.y-20,18,1,'#dad8b8');rect(c,post.x-9,post.y-20,1,4,'#dad8b8');rect(c,post.x+8,post.y-20,1,4,'#dad8b8');}return true;};
 G.drawMistwoodPantry=(c,ch)=>{if(!here()||!ch.food)return false;G.drawSprite(c,G.homeScenery[ch.opened?'pantryEmpty':'pantryReady'],0,ch.x*16+8,ch.y*16+16,false);if(ch.opened){const p=1-Math.min(1,Math.max(0,(ch.readyAt||0)-Date.now())/G.PANTRY_REFILL_MS);rect(c,ch.x*16+3,ch.y*16+14,10,1,'#30383c');rect(c,ch.x*16+3,ch.y*16+14,Math.round(10*p),1,'#90a4ac');}return true;};
 G.drawMistwoodBell=(c,bell,lit)=>{if(!here())return false;const id=bell.id.includes('west')?'fernBell':bell.id.includes('east')?'mothBell':'rootBell';G.drawSprite(c,S[id],lit?1:0,bell.x*16+8,bell.y*16+12,false);return true;};
 const oldDraw=G.openingDrawables;
 G.openingDrawables=c=>{const list=oldDraw(c);if(!here())return list;const s=G.state;
  for(let y=3;y<s.mapH-2;y+=4)for(let x=3;x<s.mapW-2;x+=4){if(s.grid[y][x].tile!=='tree')continue;const px=x*16+8,py=y*16+8;list.push({y:py,fn:()=>{const behind=a=>a&&Math.abs(a.x-px)<19&&a.y<py&&a.y>py-43;c.save();if(behind(s.player)||(s.npcs||[]).some(behind))c.globalAlpha=Math.min(c.globalAlpha,.35);G.drawSprite(c,S.tree,G.reducedMotion?0:Math.floor(s.time*.55+x+y)%4,px,py+3,false);c.restore();}});}
  // The one-tile root ridge gets deliberate larger trunks rather than foliage noise.
  for(const y of [3,8,12,15])if(s.grid[y][14].tile==='tree'){const px=14*16+8,py=y*16+8;list.push({y:py,fn:()=>{const behind=a=>a&&Math.abs(a.x-px)<19&&a.y<py&&a.y>py-43;c.save();if(behind(s.player)||(s.npcs||[]).some(behind))c.globalAlpha=Math.min(c.globalAlpha,.35);G.drawSprite(c,S.tree,G.reducedMotion?0:Math.floor(s.time*.55+y)%4,px,py+3,false);c.restore();}});}
  return list;
 };
})();
