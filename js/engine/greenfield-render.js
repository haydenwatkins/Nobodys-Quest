/* Rendering reads the actual post, gate and pantry state; it never awards anything. */
"use strict";
(() => {
  const here=()=>G.state&&G.state.mapId==='overworld';
  const colors=['#42646f','#5f8590','#91b0b2'];
  const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
  G.greenfieldWaterColors=()=>here()?colors:null;
  G.drawGreenfieldTile=(c,cell,x,y,time)=>{
    if(!here()||!['rock','water'].includes(cell.tile))return false;
    const px=x*G.TILE,py=y*G.TILE,r=G.util.hash2(x,y)*2;
    if(cell.tile==='rock'){rect(c,px,py,16,16,G.meadowGroundColor('grass',x,y));G.drawSprite(c,G.greenfieldScenery.rock,Math.floor(r*4),px+8,py+16,false);}
    else{const patch=G.util.hash2(Math.floor(x/4)+91,Math.floor(y/3)+21)*2;rect(c,px,py,16,16,patch>.68?'#4b707b':colors[0]);const wave=G.reducedMotion?0:Math.floor(time*.8+r*3)%3;if(r>.65){rect(c,px+3+wave,py+7,6,G.hdPilot?.5:1,colors[1]);rect(c,px+8+wave,py+8,2,G.hdPilot?.5:1,colors[2]);}}
    return true;
  };
  const thresholds={mistwood:'forestStep',sunkenMarsh:'marshStep',emberRidge:'emberStep','whispering-grove':'groveStep',starfallRuins:'starStep',shattercoast:'coastStep',sunstepPrairie:'prairieStep',titanGrave:'titanStep',orchardRoad:'orchardStep',dungeon:'dungeonGate'};
  G.drawGreenfieldPortal=(c,cell,x,y,locked)=>{
    if(!here()||!cell.portal||cell.portalStyle==='trial')return false;
    const id=thresholds[cell.portal.map];if(!id)return false;
    G.drawSprite(c,G.greenfieldScenery[id],locked?1:0,x*G.TILE+8,y*G.TILE+(id==='dungeonGate'?18:16),false);return true;
  };
  G.drawGreenfieldPost=(c,post,awake,near)=>{
    if(!here())return false;G.drawSprite(c,G.greenfieldScenery[awake?'postAwake':'postSleeping'],0,Math.round(post.x),Math.round(post.y)+6,false);
    if(near){rect(c,post.x-9,post.y-20,18,1,'#dad8b8');rect(c,post.x-9,post.y-20,1,4,'#dad8b8');rect(c,post.x+8,post.y-20,1,4,'#dad8b8');}return true;
  };
  G.drawGreenfieldPantry=(c,ch)=>{
    if(!here()||!ch.food)return false;G.drawSprite(c,G.homeScenery[ch.opened?'pantryEmpty':'pantryReady'],0,ch.x*16+8,ch.y*16+16,false);
    if(ch.opened){const progress=1-Math.min(1,Math.max(0,(ch.readyAt||0)-Date.now())/G.PANTRY_REFILL_MS);rect(c,ch.x*16+3,ch.y*16+14,10,1,'#30383c');rect(c,ch.x*16+3,ch.y*16+14,Math.round(10*progress),1,'#90a4ac');}return true;
  };
})();
