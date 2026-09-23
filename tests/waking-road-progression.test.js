const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

test('the road to Worldwake keeps unfinished guardians actionable without making them a new gate', () => {
  const r = runtime(), {G} = r;
  r.load('overworld'); r.drain();
  G.state.opening.complete = true;
  G.state.delivery.complete = true;
  G.state.claimedForms = ['rat', 'knight'];
  G.state.items.push('trophy-heartwood-crown');
  G.state.stars = 10;

  let goal = G.storyGoal();
  assert.equal(G.storyChapter(), 2);
  assert.equal(goal.guide, 'boss');
  assert.equal(goal.mapId, 'sunkenMarsh');
  assert.equal(G.guidanceRouteTarget(goal).cell.portal.map, 'sunkenMarsh');
  assert.equal(G.bossPreparation().enemy, 'Mire Queen');
  assert.match(goal.objective, /14 more stars/);

  G.state.items.push('trophy-mire-pearl');
  goal = G.storyGoal();
  assert.equal(goal.mapId, 'emberRidge');
  assert.equal(G.guidanceRouteTarget(goal).cell.portal.map, 'emberRidge');
  assert.equal(G.bossPreparation().enemy, 'Eclipse Knight');

  G.state.items.push('trophy-eclipse-sigil');
  goal = G.storyGoal();
  assert.equal(goal.guide, 'mastery');
  assert.ok(goal.questId, 'the remaining stars have a concrete earned lesson');

  G.state.stars = 24;
  G.state.items.pop(); // The last guardian remains optional once the road opens.
  goal = G.storyGoal();
  assert.equal(goal.guide, 'travel');
  assert.equal(goal.mapId, 'sunstepPrairie');
  assert.equal(G.guidanceRouteTarget(goal).cell.portal.map, 'sunstepPrairie');
});

test('a 24-star traveler crosses into Worldwake, meets the first guardian, and earns the next lead', () => {
  const r = runtime(), {G} = r;
  r.load('overworld'); r.drain();
  G.state.opening.complete = true;
  G.state.delivery.complete = true;
  G.state.stars = 24;
  G.state.items.push('trophy-heartwood-crown');

  function cross(to) {
    const from = G.state.mapId;
    const cells = [];
    for (let y = 0; y < G.state.mapH; y++) for (let x = 0; x < G.state.mapW; x++) {
      if (G.state.grid[y][x]?.portal?.map === to) cells.push([x, y]);
    }
    const approach = cells.map(([x, y]) => {
      const start = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]
        .find(([sx, sy]) => G.world.isSafeSpawn(sx * 16 + 8, sy * 16 + 8));
      return start && { x, y, start };
    }).find(Boolean);
    assert.ok(approach, `${from} has a safe approach to ${to}`);
    const [sx, sy] = approach.start;
    Object.assign(G.state.player, { x: sx * 16 + 8, y: sy * 16 + 8 });
    G.input.vec = { x: 0, y: 0 };
    G.world.checkTriggers(.5); r.drain();
    const dx = approach.x - sx, dy = approach.y - sy;
    G.input.vec = { x: dx, y: dy };
    for (let step = 0; step < 40 && G.state.mapId === from; step++) {
      G.world.moveBox(G.state.player, dx * 1.5, dy * 1.5);
      G.world.checkTriggers(.02); r.drain();
    }
    assert.equal(G.state.mapId, to);
    assert.ok(G.world.isSafeSpawn(G.state.player.x, G.state.player.y));
  }

  assert.equal(G.storyGoal().mapId, 'sunstepPrairie');
  cross('sunstepPrairie');
  assert.equal(G.storyChapter(), 3);
  assert.equal(G.storyGoal().mapId, 'windscarCanyon');
  cross('windscarCanyon');
  const boss = G.state.enemies.find(enemy => enemy.id === 'skySovereign');
  assert.ok(boss);
  boss.bossIntroT = 0;
  boss.bossEngaged = true;
  G.combat.damageEnemy(boss, { ability: 'slash', damage: 7, type: 'sharp', knockback: 0, fromX: boss.x - 20, fromY: boss.y });
  assert.equal(boss.ward.hp, 0);
  G.combat.damageEnemy(boss, { ability: 'slash', damage: 100, type: 'sharp', knockback: 0, fromX: boss.x - 20, fromY: boss.y });
  r.drain();
  assert.ok(G.state.items.includes('trophy-sky-sovereign'));
  assert.ok(G.hasWorldMark('sky'));
  assert.equal(G.storyGoal().mapId, 'hangingGardens');
});
