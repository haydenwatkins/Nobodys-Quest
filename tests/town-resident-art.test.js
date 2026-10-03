const { test } = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

test('all town neighbours retain saved counts, safe homes, paired chatter, routines and distinct appearances', () => {
  const r = runtime(), { G } = r;
  G.state.opening.complete = G.state.delivery.complete = true;
  Object.assign(G.state.town, { founded: true, introduced: true, residents: 16 });
  r.load('town'); r.drain();
  const residents = G.state.npcs.filter(n => n.ambientOnly);
  assert.equal(residents.length, 16);
  assert.equal(new Set(residents.map(n => n.def.sprite)).size, 6);
  for (const [i, n] of residents.entries()) {
    assert.equal(n.id, `resident-${i}`);
    assert.equal(n.def.sprite, G.townResidentArt[i % 6]);
    assert.equal(G.world.solid(n.x, n.y), false);
    assert.ok(n.anchors.length > 1);
    assert.equal(G.state.grid[n.home.y][n.home.x].portal, undefined);
    assert.equal(n.def.name, 'Town Resident');
  }
  G.startNpcExchange(residents[0], residents[1], 0);
  assert.equal(residents[0].bubble.text, 'Lovely day!');
  assert.equal(residents[1].bubble.text, 'For something.');
  G.state.enemies = []; G.state.npcArrivalGrace = 0; G.state.bossCutscene = null;
  Object.assign(G.state.player, { x: 0, y: 0 });
  const n = residents[0]; n.bubble = null; n.routineT = 0;
  G.updateNpcs(.05);
  assert.ok(n.path.length > 0, 'the actual town neighbour plans a native route');
  const before = { x: n.x, y: n.y }; G.updateNpcs(.5);
  assert.ok(n.x !== before.x || n.y !== before.y, 'the native routine actually moves');
  assert.equal(G.world.solid(n.x, n.y), false);
  G.saveGame(); const save = G.loadSaveData();
  assert.equal(save.town.residents, 16);
  assert.equal(save.town.founded, true);
  G.state.town = G.normalizeTown(save.town); r.load('town'); r.drain();
  assert.equal(G.state.npcs.filter(n => n.ambientOnly).length, 16);
});

test('resident actions use held tools in both settings/facings, with stable quiet poses and no render mutations', () => {
  const r = runtime(), { G } = r;
  Object.assign(G.state.town, { founded: true, introduced: true, residents: 6 });
  r.load('town'); r.drain(); G.state.enemies = []; G.state.bossCutscene = null;
  const c = new Proxy({}, { get: () => () => {} }), draws = [];
  G.drawSprite = (ctx, sprite, frame, x, y, flip) => draws.push({ sprite, frame, x, y, flip });
  for (const n of G.state.npcs.filter(n => n.ambientOnly)) for (const hd of [true, false]) {
    G.hdPilot = hd;
    assert.equal(G.spriteMetrics(n.def.sprite).w, 14); assert.equal(G.spriteMetrics(n.def.sprite).h, 18);
    const active = G.activeSpriteDefinition(n.def.sprite);
    assert.equal(active.frames.length, 9);
    for (const frame of active.frames) for (const row of frame) for (const pixel of row)
      assert.ok(pixel === '.' || active.palette[pixel]);
    for (const [activity, frame] of [['sweep', 4], ['garden', 6], ['parcel', 8]]) for (const left of [true, false]) {
      G.reducedMotion = true;
      Object.assign(n, { x: 200, y: 150, activity, facingLeft: left, path: [] });
      Object.assign(G.state.player, { x: 0, y: 0 });
      const before = JSON.stringify(n); draws.length = 0;
      G.drawNpc(c, n);
      assert.equal(JSON.stringify(n), before);
      assert.equal(draws[0].sprite, n.def.sprite); assert.equal(draws[0].frame, frame);
      assert.equal(draws[0].flip, left); assert.equal(draws[0].y, n.y);
    }
  }
});
