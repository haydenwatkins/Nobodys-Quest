const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

test('the whole Worldwake road stays passable and hands each victory to the next guardian', () => {
  const r = runtime(), { G } = r;
  G.state.opening.complete = true;
  G.state.delivery.complete = true;
  G.state.stars = 24;
  G.state.items.push('trophy-heartwood-crown');
  G.state.claimedForms = ['knight', 'ranger', 'wizard'];
  r.load('overworld'); r.drain();

  function cross(to) {
    const from = G.state.mapId;
    const cells = [];
    for (let y = 0; y < G.state.mapH; y++) for (let x = 0; x < G.state.mapW; x++)
      if (G.state.grid[y][x]?.portal?.map === to) cells.push([x, y]);
    const approach = cells.map(([x, y]) => {
      const start = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]
        .find(([sx, sy]) => G.world.isSafeSpawn(sx * G.TILE + 8, sy * G.TILE + 8));
      return start && { x, y, start };
    }).find(Boolean);
    assert.ok(approach, `${from} has a safe approach to ${to}`);
    const [sx, sy] = approach.start;
    Object.assign(G.state.player, { x: sx * G.TILE + 8, y: sy * G.TILE + 8 });
    G.input.vec = { x: 0, y: 0 };
    G.world.checkTriggers(.5); r.drain();
    const dx = approach.x - sx, dy = approach.y - sy;
    G.input.vec = { x: dx, y: dy };
    for (let step = 0; step < 50 && G.state.mapId === from; step++) {
      G.world.moveBox(G.state.player, dx * 1.5, dy * 1.5);
      G.world.checkTriggers(.02); r.drain();
    }
    assert.equal(G.state.mapId, to, `${from} physically crosses to ${to}`);
    assert.ok(G.world.isSafeSpawn(G.state.player.x, G.state.player.y));
  }

  const guardians = [
    ['windscarCanyon', 'skySovereign', 'sky'],
    ['hangingGardens', 'oldMason', 'stone'],
    ['rootdeepHollow', 'silkMatriarch', 'thread'],
    ['frostbellTundra', 'bellTitan', 'echo'],
    ['stormspinePeaks', 'lanternKeeper', 'light'],
    ['titanGrave', 'lastWorldbearer', 'heart'],
  ];
  const arts = { sharp: 'slash', blunt: 'slap', dark: 'curse', light: 'luckyArrow' };
  const traveled = [];
  assert.equal(G.storyGoal().mapId, 'sunstepPrairie');
  cross('sunstepPrairie');
  traveled.push('sunstepPrairie');
  for (const [mapId, bossId, mark] of guardians) {
    const goal = G.storyGoal();
    assert.equal(goal.mapId, mapId, `the story points to ${mapId}`);
    const route = G.guidanceRoute(G.state.mapId, mapId);
    assert.equal(route.locks, 0, `${mapId} has an open road at ${G.state.stars} stars`);
    for (const leg of route.steps) {
      assert.equal(leg.from, G.state.mapId);
      assert.ok(!leg.link, 'the campaign road can be walked without fast travel');
      cross(leg.to);
      traveled.push(leg.to);
    }
    const boss = G.state.enemies.find(enemy => enemy.id === bossId);
    assert.ok(boss, `${bossId} is present in ${mapId}`);
    boss.bossIntroT = 0;
    boss.bossEngaged = true;
    const type = boss.ward.types[0], ability = arts[type];
    assert.ok(G.availableAbilities().includes(ability), `${type} is available from an earned form`);
    G.combat.damageEnemy(boss, { ability, type, damage: boss.ward.hp, knockback: 0, fromX: boss.x - 20, fromY: boss.y });
    assert.equal(boss.ward.hp, 0);
    G.combat.damageEnemy(boss, { ability, type, damage: boss.hp + 10, knockback: 0, fromX: boss.x - 20, fromY: boss.y });
    r.drain();
    assert.ok(G.hasWorldMark(mark), `${mark} is awarded after ${bossId}`);
    if (mark === 'thread') assert.ok(G.state.stars >= 28, 'travel and guardian favors naturally open Shattercoast');
  }
  assert.ok(traveled.includes('shattercoast'), 'the western return visits the coastal hub');
  assert.equal(G.storyChapter(), 5);
  assert.equal(G.storyGoal().guide, 'mastery', 'the six marks hand off to the final portfolio');
});
