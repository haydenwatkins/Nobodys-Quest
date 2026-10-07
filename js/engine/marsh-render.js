/* The optional ferry mechanisms select art from actual saved items. */
"use strict";
(()=>{
 const here=()=>G.state&&(G.state.mapId==='sunkenMarsh'||G.state.mapDef?.earlyFormRoad==='frog'),S=G.marshScenery,colors=['#426773','#658c91','#a0bcb6'];
 const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 G.marshWaterColors=()=>here()?colors:null;
 G.drawMarshTile=(c,cell,x,y,time)=>{
  if(!here()||!['grass','path','tree','water'].includes(cell.tile))return false;
  const px=x*16,py=y*16,r=G.util.hash2(x+91,y+43)*2,patch=G.util.hash2(Math.floor(x/4)+57,Math.floor(y/3)+39)*2;
  if(cell.tile==='water'){rect(c,px,py,16,16,patch>.7?'#4b7079':colors[0]);if(r>.64){const drift=G.reducedMotion?0:Math.floor(time*.7+r*3)%3;rect(c,px+2+drift,py+8,7,G.hdPilot?.5:1,colors[1]);rect(c,px+9+drift,py+9,2,G.hdPilot?.5:1,colors[2]);}if(r>.92)G.drawSprite(c,S.lily,Math.floor(G.util.hash2(x+177,y+83)*8),px+8,py+14,false);}
  else{rect(c,px,py,16,16,cell.tile==='path'?['#a0977b','#a79f83','#a19a7e'][Math.floor(patch*3)]:['#64796a','#69806d','#6c816f'][Math.floor(patch*3)]);if(cell.tile==='tree')G.drawSprite(c,S.hedge,Math.floor(r*4),px+8,py+16,false);else if(cell.tile==='path'&&r>.45){rect(c,px+3,py+5,5,1,'#c5baa0');rect(c,px+9,py+10,2,1,'#838774');}else if(cell.tile==='grass'&&r>.6&&[[0,-1],[1,0],[0,1],[-1,0]].some(([dx,dy])=>G.state.grid[y+dy]?.[x+dx]?.tile==='water'))G.drawSprite(c,G.deliveryScenery.reed,G.reducedMotion?0:Math.floor(time*.7)%4,px+8,py+16,false);}
  return true;
 };
 G.drawMarshNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;G.drawSprite(c,G.deliveryScenery.milepost,0,x*16+8,y*16+16,false);return true;};
 G.drawMarshPortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;G.drawSprite(c,S.wetStep,0,x*16+8,y*16+16,false);return true;};
 G.drawMarshPost=(c,post,awake,near)=>{if(!here())return false;G.drawSprite(c,G.greenfieldScenery[awake?'postAwake':'postSleeping'],0,Math.round(post.x),Math.round(post.y)+6,false);if(near){rect(c,post.x-9,post.y-20,18,1,'#dad8b8');rect(c,post.x-9,post.y-20,1,4,'#dad8b8');rect(c,post.x+8,post.y-20,1,4,'#dad8b8');}return true;};
 G.drawMarshPantry=(c,ch)=>{if(!here()||!ch.food)return false;G.drawSprite(c,G.homeScenery[ch.opened?'pantryEmpty':'pantryReady'],0,ch.x*16+8,ch.y*16+16,false);if(ch.opened){const p=1-Math.min(1,Math.max(0,(ch.readyAt||0)-Date.now())/G.PANTRY_REFILL_MS);rect(c,ch.x*16+3,ch.y*16+14,10,1,'#30383c');rect(c,ch.x*16+3,ch.y*16+14,Math.round(10*p),1,'#90a4ac');}return true;};
 G.drawMarshMechanism=(c,stop,done)=>{if(!here())return false;G.drawSprite(c,S[stop.id==='marsh-ferry-token'?'salvageWreck':'sluice'],done?1:0,stop.x*16+8,stop.y*16+18,false);return true;};
 G.drawMarshFence=(c,f)=>{if(!here()||f.style!=='marsh'||f.dir==='v')return false;const x=f.x*16,y=f.y*16+10,span=f.length*16;rect(c,x,y,span,3,'#4d423d');rect(c,x,y,span,1,'#a48c68');rect(c,x,y+5,span,3,'#4d423d');rect(c,x,y+5,span,1,'#786450');for(let i=0;i<=f.length;i++)G.drawSprite(c,S.fencePost,0,x+i*16,y+10,false);return true;};
 const oldDraw=G.openingDrawables;
 G.openingDrawables=c=>{const list=oldDraw(c);if(!here())return list;const s=G.state;for(const [tx,ty]of [[0,4],[29,4],[0,14],[29,14],[6,18],[23,18]]){const x=tx*16+8,y=ty*16+8;if(s.grid[ty][tx].tile!=='tree')continue;list.push({y,fn:()=>{const behind=a=>a&&Math.abs(a.x-x)<32&&a.y<y&&a.y>y-53;c.save();if(behind(s.player)||(s.npcs||[]).some(behind))c.globalAlpha=Math.min(c.globalAlpha,.35);G.drawSprite(c,G.deliveryScenery.willow,G.reducedMotion?0:Math.floor(s.time*.6+tx)%4,x,y+3,false);c.restore();}});}return list;};
})();
