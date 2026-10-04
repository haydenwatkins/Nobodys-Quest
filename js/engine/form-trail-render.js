/* Keep the outings visibly part of their neighbouring regions. Existing
   authored scenery supplies landmarks, notices, rest and picnic furniture. */
"use strict";
(() => {
  const scenery = () => {
    if (!G.state?.mapDef?.formTrail) return null;
    return {
      windscar: [G.windscarScenery, "scarp"], gardens: [G.gardensScenery, "topiary"],
      rootdeep: [G.rootdeepScenery, "rootCluster"], frostbell: [G.frostbellScenery, "pine"],
      stormspine: [G.stormspineScenery, "spire"], titan: [G.titanScenery, "rib"],
    }[G.state.mapDef.biome];
  };
  function prop(ctx, sprite, x, y, frame=0) {
    const metrics = G.spriteMetrics(sprite);
    const behind = actor => actor && Math.abs(actor.x-x) < metrics.w/2+8 && actor.y > y-metrics.h-2 && actor.y < y+4;
    ctx.save();
    if ([G.state.player, ...(G.state.npcs || []), ...(G.state.enemies || []).filter(e=>!e.dead)].some(behind)) ctx.globalAlpha *= .35;
    G.drawSprite(ctx, sprite, frame, x, y, false);
    ctx.restore();
  }
  const notice = G.drawWorldbackNotice;
  G.drawWorldbackNotice = (ctx, cell, x, y) => {
    const scene = scenery();
    if (!scene || !cell.message) return notice?.(ctx, cell, x, y) || false;
    prop(ctx, scene[0].notice, x*16+8, y*16+16);
    return true;
  };
  const cache = G.drawDungeonCache;
  G.drawDungeonCache = (ctx, chest) => {
    if (!scenery() || !chest.food) return cache?.(ctx, chest) || false;
    prop(ctx, G.dungeonScenery.biscuitCrate, chest.x*16+8, chest.y*16+16, chest.opened?1:0);
    return true;
  };
  const previous = G.openingDrawables;
  G.openingDrawables = ctx => {
    const list = previous(ctx), scene = scenery();
    if (!scene) return list;
    for (const [x,y] of [[14,11],[27,13]]) {
      const at = {x:x*16+8,y:y*16+16};
      list.push({y:at.y-1,fn:()=>prop(ctx,scene[0][scene[1]],at.x,at.y)});
    }
    list.push({y:20*16+15,fn:()=>prop(ctx,G.prairieScenery.hearth,6*16+8,20*16+16,
      G.reducedMotion?0:Math.floor(G.state.time*2)%4)});
    list.push({y:21*16+15,fn:()=>prop(ctx,G.prairieScenery.desk,38*16+8,21*16+16)});
    return list;
  };
})();
