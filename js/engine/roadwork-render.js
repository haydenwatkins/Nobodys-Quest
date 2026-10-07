/* World rendering reads repairs; it cannot award them. Large props yield
   to nearby travellers. Text uses the existing sharp dialogue/HUD layer. */
"use strict";
(() => {
  const road=()=>G.EARLY_FORM_ROADS.find(r=>r.id===G.state?.mapId);
  const waterColors=G.greenfieldWaterColors;
  G.greenfieldWaterColors=()=>road()?['#42646f','#72949a','#a5bfba']:waterColors();
  const tile=G.drawGreenfieldTile;
  G.drawGreenfieldTile=(c,cell,x,y,time)=>{
    if(!road())return tile(c,cell,x,y,time);
    if(cell.roadRepair&&G.roadRepairOpen(cell.roadRepair)){G.drawSprite(c,G.roadworkScenery.boards,0,x*16+8,y*16+16,false);return true;}
    if(cell.tile==='water'){
      const r=G.util.hash2(x+91,y+43)*2;c.fillStyle=r>.7?'#4b707b':'#42646f';c.fillRect(x*16,y*16,16,16);
      if(r>.64){const drift=G.reducedMotion?0:Math.floor(time*.7+r*3)%3;c.fillStyle='#72949a';c.fillRect(x*16+2+drift,y*16+8,7,G.hdPilot?.5:1);c.fillStyle='#a5bfba';c.fillRect(x*16+9+drift,y*16+9,2,G.hdPilot?.5:1);}
      return true;
    }
    return false;
  };
  const notice=G.drawWorldbackNotice;
  G.drawWorldbackNotice=(c,cell,x,y)=>{
    if(!road()||!cell.message)return notice?.(c,cell,x,y)||false;
    G.drawSprite(c,G.mistwoodScenery.notice,0,x*16+8,y*16+16,false);return true;
  };
  const cache=G.drawDungeonCache;
  G.drawDungeonCache=(c,chest)=>{
    if(!road()||!chest.food)return cache?.(c,chest)||false;
    G.drawSprite(c,G.dungeonScenery.biscuitCrate,chest.opened?1:0,chest.x*16+8,chest.y*16+16,false);return true;
  };
  function prop(c,sprite,x,y,frame=0){
    const metrics=G.spriteMetrics(sprite),behind=a=>a&&Math.abs(a.x-x)<metrics.w/2+7&&a.y>y-metrics.h&&a.y<y+4;
    c.save();if([G.state.player,...G.state.npcs,...G.state.enemies.filter(e=>!e.dead&&!e.roadMechanism)].some(behind))c.globalAlpha*=.35;
    G.drawSprite(c,sprite,frame,x,y,false);c.restore();
  }
  const draw=G.openingDrawables;
  G.openingDrawables=c=>{
    const list=draw(c),r=road();if(!r)return list;
    for(const repair of r.repairs){const x=repair.x*16+8,y=repair.y*16+8,done=G.roadRepairOpen(repair.id);
      list.push({y:y+1,fn:()=>prop(c,G.roadworkScenery[repair.kind],x,y+7,done?1:0)});
    }
    const [sx,sy]=r.start;
    list.push({y:(sy-2)*16+15,fn:()=>prop(c,G.prairieScenery.hearth,(sx-2)*16+8,(sy-2)*16+16,G.reducedMotion?0:Math.floor(G.state.time*2)%4)});
    list.push({y:5*16+15,fn:()=>prop(c,G.prairieScenery.desk,31*16+8,5*16+16)});
    for(const [x,y]of r.formId==='frog'?[[8,3],[29,22]]:[[8,3],[29,13]])list.push({y:y*16+15,fn:()=>prop(c,r.formId==='frog'?G.deliveryScenery.willow:G.mistwoodScenery.tree,x*16+8,y*16+16)});
    return list;
  };
})();
