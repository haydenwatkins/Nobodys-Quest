const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

test('Worldwake guidance takes the open road instead of a sealed Titan shortcut', () => {
  const r=runtime(), {G}=r;
  G.state.stars=30;
  r.load('rootdeepHollow'); r.drain();
  let route=G.guidanceRoute('rootdeepHollow','stormspinePeaks');
  assert.equal(route.locks,0);
  assert.ok(!route.steps.some(s=>s.to==='titanGrave'));
  assert.equal(route.steps[0].to,'hangingGardens');
  assert.equal(G.guidanceRouteTarget({mapId:'stormspinePeaks',guide:'boss'}).cell.portal.map,'hangingGardens');
  G.state.worldwake.marks.push('light');
  route=G.guidanceRoute('rootdeepHollow','stormspinePeaks');
  assert.equal(route.locks,0);
  assert.equal(route.steps[0].to,'glasswaterDesert');
  assert.ok(route.steps.some(s=>s.to==='titanGrave'));
});

test('sealed destinations explain marks, stars, and mastery instead of promising an open road', () => {
  const r=runtime(), {G}=r;
  G.state.stars=30;r.load('glasswaterDesert');r.drain();
  let target=G.guidanceRouteTarget({mapId:'titanGrave',guide:'boss'});
  assert.equal(target.blocked,true);assert.match(target.text,/Lantern Mark/);
  G.state.worldwake.marks.push('echo');
  const route=G.guidanceRoute('glasswaterDesert','titanGrave');
  assert.equal(route.locks,0);assert.equal(route.steps.at(-1).from,'stormspinePeaks');
  G.state.stars=23;r.load('overworld');r.drain();
  target=G.guidanceRouteTarget({mapId:'sunstepPrairie',guide:'travel'});
  assert.equal(target.blocked,true);assert.match(target.text,/1 more star/);
  G.state.stars=24;
  assert.ok(!G.guidanceRouteTarget({mapId:'sunstepPrairie',guide:'travel'}).blocked);
  target=G.guidanceRouteTarget({mapId:'godTrial',guide:'boss'});
  assert.equal(target.blocked,true);assert.match(target.text,/level 5/);
});

test('the Final Firmament follows all six Worldbearers while completed old saves retain access', () => {
  const r=runtime(), {G}=r;
  G.formLevel=()=>5;
  G.state.stars=100;
  r.load('overworld');r.drain();
  const gate=G.maps.overworld.legend.Y;
  let reason=G.world.portalBlockReason(gate);
  assert.match(reason.text,/Restore all 6 World Marks \(0\/6 awakened\)/);
  assert.match(reason.text,/Windscar Canyon.*Sky Mark/);
  assert.equal(G.guidanceRouteTarget({mapId:'godTrial',guide:'boss'}).blocked,true);
  G.state.worldwake.marks=['sky','stone','thread','echo','light'];
  reason=G.world.portalBlockReason(gate);
  assert.match(reason.text,/5\/6 awakened/);
  assert.match(reason.text,/Titan Grave.*Worldheart Mark/);
  assert.equal(G.world.solid(110*16+8,8),true);
  G.state.worldwake.marks.push('heart');
  assert.equal(G.world.portalBlockReason(gate),null);
  assert.ok(!G.guidanceRouteTarget({mapId:'godTrial',guide:'boss'}).blocked);
  assert.ok(!G.world.solid(110*16+8,8));
  Object.assign(G.state.player,{x:110*16+8,y:16+8});
  G.state.portalNeedsRelease=false;
  G.state.portalGrace=0;
  G.input.vec={x:0,y:-1};
  for(let step=0;step<40&&G.state.mapId==='overworld';step++) {
    G.world.moveBox(G.state.player,0,-1.5);
    G.world.checkTriggers(.02);
  }
  assert.equal(G.state.mapId,'godTrial','the restored entrance should really travel to the finale');

  r.load('overworld');r.drain();
  G.state.worldwake.marks=[];
  G.state.items.push('god-spark');
  assert.equal(G.world.portalBlockReason(gate),null,'a save with the original ending can revisit God');
  assert.ok(!G.world.solid(110*16+8,8));
});

test('the unopened delivery causeway is checked even while planning from another map', () => {
  const r=runtime(), {G}=r;r.load('orchardRoad');r.drain();
  G.state.opening.complete=true;
  const route=G.guidanceRoute('orchardRoad','sunriseQuay');
  assert.ok(route.locks>0);
  assert.match(route.steps.find(s=>s.reason).reason,/lantern|Tollkeeper/);
  G.state.delivery.lamps=[2,2];G.state.delivery.keeper=true;
  assert.equal(G.guidanceRoute('orchardRoad','sunriseQuay').locks,0);
});

test('every Worldwake road crosses with real collision and a safe arrival, without neutral-input bounce', () => {
  const r=runtime(), {G}=r;
  G.state.stars=100;G.state.worldwake.marks=['sky','stone','thread','echo','light','heart'];
  let crossings=0;
  for(const region of G.WORLDWAKE_REGIONS) {
    const def=G.maps[region.id];
    for(let y=0;y<def.tiles.length;y++) for(let x=0;x<def.tiles[y].length;x++) {
      const cell=def.legend[def.tiles[y][x]];
      if(!cell?.portal)continue;
      r.load(region.id);r.drain();
      const start=[[x+1,y],[x-1,y],[x,y+1],[x,y-1]].find(([sx,sy])=>G.world.isSafeSpawn(sx*16+8,sy*16+8));
      assert.ok(start,`${region.id} has an approach to ${cell.portal.map}`);
      Object.assign(G.state.player,{x:start[0]*16+8,y:start[1]*16+8});
      G.input.vec={x:0,y:0};G.world.checkTriggers(.5);r.drain();
      const dx=x-start[0],dy=y-start[1];G.input.vec={x:dx,y:dy};
      for(let step=0;step<40&&G.state.mapId===region.id;step++) {
        G.world.moveBox(G.state.player,dx*1.5,dy*1.5);G.world.checkTriggers(.02);r.drain();
      }
      assert.equal(G.state.mapId,cell.portal.map,`${region.id} → ${cell.portal.map}`);
      assert.ok(G.world.isSafeSpawn(G.state.player.x,G.state.player.y),`${cell.portal.map} safe arrival`);
      G.input.vec={x:0,y:0};G.world.checkTriggers(.5);r.drain();
      assert.equal(G.state.mapId,cell.portal.map,'neutral input cannot return through the arrival');
      crossings++;
    }
  }
  assert.ok(crossings>=16,`covered ${crossings} region exits`);
});
