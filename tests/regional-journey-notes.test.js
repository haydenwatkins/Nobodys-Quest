const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

for (const [mapId, mark, beforeTitle, afterTitle, combatAdvice] of [
  ['hangingGardens', 'stone', 'Gardens held in patient hands', "The Mason's roads rise again", "Blunt attacks break the Mason's ward"],
  ['rootdeepHollow', 'thread', 'Every chamber has a thread', 'Tess stitches the hollow together', "Dark attacks break Tess's ward"],
  ['frostbellTundra', 'echo', 'Listen for the second note', "Bongle's note holds the ice", 'Bongle waits northeast'],
  ['stormspinePeaks', 'light', 'A promise in every light', 'Mallow lights the long way home', "Dark attacks break Mallow's ward"],
  ['titanGrave', 'heart', 'A heartbeat beneath the stone', 'The last road leads home', "Blunt attacks break his ward"],
]) test(`${mapId} Journey notes change from boss preparation to the restored road`, () => {
  const r = runtime(), { G } = r;
  G.state.opening.complete = true;
  G.state.delivery.complete = true;
  G.state.stars = 70;
  r.load(mapId); r.drain();
  r.run('js/engine/ui.js');
  G.ui.openMenu();
  const menu = r.nodes.get('menu');
  assert.ok(menu.innerHTML.includes(beforeTitle));
  assert.ok(menu.innerHTML.includes(combatAdvice));
  G.ensureWorldwake().marks.push(mark);
  r.load(mapId); r.drain();
  G.ui.openMenu();
  assert.ok(menu.innerHTML.includes(afterTitle));
  assert.ok(!menu.innerHTML.includes(combatAdvice), `${mapId} should retire its completed fight instructions`);
});

test('Glasswater notes recognize the earned Lantern Mark at the southern gate', () => {
  const r = runtime(), { G } = r;
  G.state.opening.complete = true;
  G.state.items.push('glasswater-prism', 'glasswater-meridian');
  r.load('glasswaterDesert'); r.drain(); r.run('js/engine/ui.js');
  G.ui.openMenu();
  const menu = r.nodes.get('menu');
  assert.ok(menu.innerHTML.includes('Lantern Mark is still required'));
  G.ensureWorldwake().marks.push('light');
  G.ui.openMenu();
  assert.ok(menu.innerHTML.includes('Your Lantern Mark opens Titan Grave'));
  assert.ok(!menu.innerHTML.includes('Lantern Mark is still required'));
});

test('Mistwood and Ember Ridge retire defeated guardian directions but keep side activities', () => {
  for (const [mapId, trophy, before, after, side] of [
    ['mistwood', 'trophy-heartwood-crown', "The Treant keeps the southeast clearing", 'The southeast clearing is quiet', 'northwest pantry'],
    ['emberRidge', 'trophy-eclipse-sigil', 'The Knight waits in the eastern court', 'The eastern court is quiet', 'watchfires'],
  ]) {
    const r = runtime(), { G } = r;
    G.state.opening.complete = true;
    if (mapId === 'mistwood') G.state.items.push('mistwood-middle-road');
    r.load(mapId); r.drain(); r.run('js/engine/ui.js');
    G.ui.openMenu();
    const menu = r.nodes.get('menu');
    assert.ok(menu.innerHTML.includes(before));
    G.state.items.push(trophy);
    G.ui.openMenu();
    assert.ok(menu.innerHTML.includes(after));
    assert.ok(menu.innerHTML.includes(side));
    assert.ok(!menu.innerHTML.includes(before));
  }
});
