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
    if(cell.roadRepair&&G.roadRepairOpen(cell.roadRepair)){const floor=road().formId==='riftblade'?'pavers':road().formId==='mole'?'dryPath':road().formId==='vampire'?'petalPath':'boards';G.drawSprite(c,G.roadworkScenery[floor],0,x*16+8,y*16+16,false);return true;}
    const calling=road().formId;
    if(['stormcaller','dragon','riftblade','mole','vampire','jester'].includes(calling)&&['grass','path','tree'].includes(cell.tile)){
      const terrace=calling==='stormcaller',r=G.util.hash2(Math.floor(x/4)+31,Math.floor(y/3)+73)*2;
      const colors=calling==='riftblade'?(cell.tile==='path'?['#aaa0b6','#b4aabe','#a398b0']:['#798b7d','#829382','#728677']):calling==='mole'?(cell.tile==='path'?['#ba9b79','#c2a581','#b29574']:['#907b60','#9a8265','#89745c']):terrace?(cell.tile==='path'?['#8a91a0','#939aa8','#868d9c']:['#656f83','#6b7589','#626c7f']):(cell.tile==='path'?['#af8d74','#b7957a','#a98972']:['#81705f','#887663','#7c6b5c']);
      const palette=calling==='vampire'?(cell.tile==='path'?['#958aab','#a095b4','#8f83a6']:['#687e81','#71868a','#62777c']):calling==='jester'?(cell.tile==='path'?['#bb9c7d','#c4a685','#b29677']:['#7c8b75','#85947d','#75856e']):colors;
      c.fillStyle=palette[Math.floor(r*3)];c.fillRect(x*16,y*16,16,16);
      if(cell.tile==='tree')G.drawSprite(c,terrace?G.starfallScenery.wall:calling==='mole'?G.rootdeepScenery.rootWall:G.meadowScenery.hedge,Math.floor(G.util.hash2(x,y)*8),x*16+8,y*16+16,false);
      else if(G.util.hash2(x+73,y+43)>.32){c.fillStyle=terrace?'#a9b3bd':'#d0b192';c.fillRect(x*16+3,y*16+7,4,1);}
      return true;
    }
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
    for(const repair of r.repairs){const done=G.roadRepairOpen(repair.id);
      for(const [tx,ty]of repair.nodes||[[repair.x,repair.y]]){
        const x=tx*16+8,y=ty*16+8;
        list.push({y:y+1,fn:()=>prop(c,G.roadworkScenery[repair.kind],x,y+7,done?1:0)});
      }
    }
    const [sx,sy]=r.start;
    const complete=r.repairs.every(repair=>G.roadRepairOpen(repair.id));
    if(r.formId==='dragon'){
      const [x,y]=complete?[16,9]:[31,21];list.push({y:y*16+15,fn:()=>prop(c,G.roadworkScenery.breadCart,x*16+8,y*16+16)});
    }
    if(r.formId==='stormcaller')list.push({y:21*16+15,fn:()=>prop(c,G.roadworkScenery.kettle,7*16+8,21*16+16,complete?1:0)});
    if(r.formId==='riftblade'&&G.ensureTown().requests.includes('road-riftblade'))list.push({y:5*16+15,fn:()=>prop(c,G.deliveryScenery.bunting,27*16+8,5*16+16)});
    if(r.formId==='mole')list.push({y:6*16+15,fn:()=>prop(c,G.roadworkScenery.bookBasket,29*16+8,6*16+16,G.ensureTown().requests.includes('road-mole')?1:0)});
    if(r.formId==='vampire')list.push({y:6*16+15,fn:()=>prop(c,G.roadworkScenery.cushions,29*16+8,6*16+16,G.ensureTown().requests.includes('road-vampire')?1:0)});
    if(r.formId==='jester')list.push({y:7*16+15,fn:()=>prop(c,G.roadworkScenery.puppetStage,27*16+8,7*16+16,G.ensureTown().requests.includes('road-jester')?1:0)});
    list.push({y:(sy-2)*16+15,fn:()=>prop(c,G.prairieScenery.hearth,(sx-2)*16+8,(sy-2)*16+16,G.reducedMotion?0:Math.floor(G.state.time*2)%4)});
    list.push({y:5*16+15,fn:()=>prop(c,G.prairieScenery.desk,31*16+8,5*16+16)});
    if(r.formId==='stormcaller'){
      for(const [x,y]of [[8,3],[29,14]])list.push({y:y*16+15,fn:()=>prop(c,G.starfallScenery.fallenStone,x*16+8,y*16+16)});
    }else for(const [x,y]of r.formId==='frog'?[[8,3],[29,22]]:[[8,3],[29,13]])list.push({y:y*16+15,fn:()=>prop(c,r.formId==='frog'?G.deliveryScenery.willow:G.mistwoodScenery.tree,x*16+8,y*16+16)});
    return list;
  };
})();
