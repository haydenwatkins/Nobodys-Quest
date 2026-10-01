/* Purchases and festival timers belong to town.js; this layer only paints. */
"use strict";
(() => {
  const here = () => G.state && G.state.mapId === 'town';
  G.drawTownPortal = (c,cell,x,y) => {
    if(!here() || !cell.portal) return false;
    if(cell.portal.map === 'playerHouse') return true; // The authored porch is the entrance.
    if(cell.portal.map === 'sunriseQuay') {
      G.drawSprite(c,G.townScenery.quayStep,0,x*G.TILE+8,y*G.TILE+12,false);
      return true;
    }
    if(cell.portal.map !== 'overworld') return false;
    G.drawSprite(c,G.townScenery.exitGate,0,x*G.TILE+8,y*G.TILE+16,false);
    return true;
  };
  G.drawTownFence = (c,fence) => {
    if(!here() || fence.style !== 'town' || fence.dir === 'v') return false;
    const length = Math.max(1,Math.floor(fence.length||1)), x=fence.x*G.TILE, y=fence.y*G.TILE+10;
    c.save(); c.fillStyle='rgba(26,28,44,0.28)'; c.fillRect(x-2,y+5,length*G.TILE+4,4);
    for(let i=0;i<length;i++) G.drawSprite(c,G.townScenery.fenceRail,0,x+i*G.TILE+8,y+8,false);
    for(let i=0;i<=length;i++) G.drawSprite(c,G.townScenery.fencePost,0,x+i*G.TILE+.5,y+10,false);
    c.restore(); return true;
  };
  G.drawTownDetail = (c,detail) => {
    if(!here()) return false;
    const id = detail.kind === 'sign' ? (detail.x === 8*G.TILE ? 'builderSign':'welcomeSign') : detail.kind;
    const sprite = G.townScenery[id]; if(!sprite) return false;
    const variant = detail.color === '#d9a7ff' || detail.color === '#73eff7' ? 1 : 0;
    // Native cottage details were placed beside the old eight-pixel house.
    // Keep them beside the authored 42-pixel cottage rather than under its wall.
    const sideOffset = detail.kind === 'mailbox' ? -14 :
      detail.kind === 'garden' && detail.y % G.TILE === 13 ? 16 : 0;
    G.drawSprite(c,sprite,variant,Math.round(detail.x)+sideOffset,Math.round(detail.y)+(detail.kind==='bench'?4:2),false);
    return true;
  };
  G.drawTownFestival = c => {
    if(!here() || !G.townFestivalActive()) return false;
    const width=G.state.mapW*G.TILE-6*G.TILE, y=7*G.TILE;
    c.fillStyle='#785e4c'; c.fillRect(3*G.TILE,y,width,1);
    for(let i=0;i<24;i++) G.drawSprite(c,G.townScenery.bunting,i%4,3*G.TILE+i*Math.floor(width/24)+4,y+8,false);
    return true;
  };
})();
