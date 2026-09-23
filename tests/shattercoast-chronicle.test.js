const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

test('the four coastal lessons give one persistent cairn reward, including on an older save', () => {
  const r = runtime(), { G } = r;
  G.state.opening.complete = true;
  G.state.delivery.complete = true;
  G.state.stars = 28;
  r.load('shattercoast'); r.drain();
  Object.assign(G.state.player, { x: 26 * 16 + 8, y: 10 * 16 + 8 });
  assert.equal(G.shattercoastChronicle().gathered, 0);
  assert.equal(G.openingInteractionCandidate().kind, 'tideglass-chronicle',
    'the normal coastal enemies should not permanently silence the cairn');
  assert.equal(G.tryOpeningInteraction(), true);
  assert.match(r.messages.at(-1).text, /4 empty hollows|0\/4 keepsakes/);
  r.drain();
  const trophies = ['tide-shell', 'paper-crane', 'orrery-key', 'elder-acorn'];
  G.state.items.push(...trophies);
  assert.equal(G.shattercoastChronicle().gathered, 4);
  const stars = G.state.stars, spirit = G.state.town.spirit;
  assert.equal(G.tryOpeningInteraction(), true);
  assert.equal(G.state.stars, stars + 1);
  assert.equal(G.state.town.spirit, spirit + 8);
  assert.equal(G.state.items.filter(item => item === 'shattercoast-tideglass-chronicle').length, 1);
  r.drain();
  assert.equal(G.tryOpeningInteraction(), true);
  assert.equal(G.state.stars, stars + 1);
  assert.equal(G.state.town.spirit, spirit + 8);
  r.load('overworld'); r.drain();
  r.load('shattercoast'); r.drain();
  assert.equal(G.shattercoastChronicle().complete, true);
  assert.equal(G.state.items.filter(item => item === 'shattercoast-tideglass-chronicle').length, 1);
});

test('Shattercoast keeps each trial approach and the northern road actionable', () => {
  const r = runtime(), { G } = r;
  G.state.opening.complete = true;
  G.state.delivery.complete = true;
  G.state.stars = 28;
  r.load('shattercoast'); r.drain();
  const cells = G.state.grid;
  for (const [x, y, destination, plaque] of [
    [11, 5, 'turtleTrial', [11, 9]], [36, 5, 'samuraiTrial', [36, 9]],
    [11, 24, 'astronomerTrial', [11, 20]], [36, 24, 'druidTrial', [36, 20]],
  ]) {
    assert.equal(cells[y][x].portal.map, destination);
    assert.match(cells[plaque[1]][plaque[0]].message, /ward|blunt|sharp|Light|Dark/);
    assert.equal(G.world.portalBlockReason(cells[y][x]), null);
    const startY = y < 14 ? y + 1 : y - 1;
    Object.assign(G.state.player, { x: x * 16 + 8, y: startY * 16 + 8 });
    G.state.portalNeedsRelease = false; G.state.portalGrace = 0;
    G.input.vec = { x: 0, y: y < 14 ? -1 : 1 };
    for (let step = 0; step < 40 && G.state.mapId === 'shattercoast'; step++) {
      G.world.moveBox(G.state.player, 0, G.input.vec.y * 1.5);
      G.world.checkTriggers(.02); r.drain();
    }
    assert.equal(G.state.mapId, destination);
    assert.ok(G.world.isSafeSpawn(G.state.player.x, G.state.player.y));
    r.load('shattercoast'); r.drain();
  }
  assert.equal(G.guidanceRoute('shattercoast', 'frostbellTundra').locks, 0);
  const from = G.state.mapId;
  Object.assign(G.state.player, { x: 23 * 16 + 8, y: 1 * 16 + 8 });
  G.state.portalNeedsRelease = false; G.state.portalGrace = 0;
  G.input.vec = { x: 0, y: -1 };
  for (let step = 0; step < 40 && G.state.mapId === from; step++) {
    G.world.moveBox(G.state.player, 0, -1.5);
    G.world.checkTriggers(.02); r.drain();
  }
  assert.equal(G.state.mapId, 'frostbellTundra');
  assert.ok(G.world.isSafeSpawn(G.state.player.x, G.state.player.y));
});
