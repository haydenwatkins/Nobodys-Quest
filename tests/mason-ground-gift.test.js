const { test } = require('node:test'), assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');
const collect = require('./helpers/collect-treasure.cjs'), cross = require('./helpers/cross-road.cjs');

test('Mason leaves a saved Stone Mark that raises both crossings on collection and remains earned on peaceful revisits', () => {
  const r = runtime(), { G } = r, item = 'trophy-old-mason', p = G.state.player;
  G.state.opening.complete = G.state.delivery.complete = true;
  G.state.stars = 24; G.state.items = ['trophy-heartwood-crown', 'trophy-sky-sovereign'];
  G.state.worldwake = G.normalizeWorldwake(undefined, { items: G.state.items });
  G.questsDone = Object.values(G.forms).flatMap(form => form.quests.map(q => q.id));
  r.load('hangingGardens'); r.drain(); G.state.bossCutscene = null;
  const steps = [[15,10],[16,10],[15,11],[16,11],[15,18],[16,18],[15,19],[16,19]];
  const solid = ([x,y]) => G.world.solid(x * 16 + 8, y * 16 + 8);
  assert.ok(steps.every(solid));
  Object.assign(p, { x: 248, y: 152 });
  for (let i = 0; i < 24; i++) G.world.moveBox(p, 0, 2);
  assert.ok(p.y < 160, 'the unrestored channel blocks actual movement');
  const boss = G.state.enemies.find(e => e.def.id === 'oldMason');
  const victoryPoint = { x: boss.x, y: boss.y }, stars = G.state.stars;
  boss.bossIntroT = 0; boss.bossEngaged = true;
  const strike = { ability: 'slap', type: 'blunt', fromX: boss.x - 20, fromY: boss.y, knockback: 0 };
  G.combat.damageEnemy(boss, { ...strike, damage: boss.ward.hp }); assert.equal(boss.ward.hp, 0);
  G.combat.damageEnemy(boss, { ...strike, damage: boss.hp + 10 }); r.drain();
  assert.ok(boss.dead); assert.equal(G.activeWorldbearer(), null);
  assert.equal(G.hasWorldMark('stone'), false); assert.ok(steps.every(solid));
  assert.equal(G.state.stars, stars); assert.equal(G.carryKeepsake('plumbline'), false);
  assert.equal(G.storyGoal().itemId, item); assert.equal(G.guidanceTarget().reward, G.groundRewardFor(item));
  const saved = G.loadSaveData(); assert.ok(saved.groundRewards.some(reward => reward.item === item));
  assert.ok(!saved.items.includes(item)); assert.ok(!saved.worldwake.marks.includes('stone'));
  cross(r, 'windscarCanyon'); cross(r, 'hangingGardens');
  cross(r, 'rootdeepHollow'); cross(r, 'hangingGardens');
  assert.ok(!G.state.enemies.some(e => e.def.id === 'oldMason'));
  assert.ok(G.groundRewardFor(item)); assert.equal(G.hasWorldMark('stone'), false);
  const beforeClaim = G.state.stars; // Separate region-discovery favors remain native.
  Object.assign(p, victoryPoint); collect(r, item);
  assert.equal(G.state.stars, beforeClaim + 1); assert.equal(G.ensureWorldwake().marks.filter(id => id === 'stone').length, 1);
  assert.ok(steps.every(step => !solid(step))); assert.equal(G.worldwakePurified('hangingGardens'), true);
  assert.equal(G.activeWorldMarkDiscipline(), null); assert.equal(G.activeKeepsake(), null);
  assert.equal(G.storyGoal().mapId, 'rootdeepHollow');
  // Test physical collision through each new shortcut in both directions.
  for (const startY of [152, 280]) {
    Object.assign(p, { x: 248, y: startY });
    for (let i = 0; i < 24; i++) G.world.moveBox(p, 0, 2);
    assert.equal(p.y, startY + 48);
    for (let i = 0; i < 24; i++) G.world.moveBox(p, 0, -2);
    assert.equal(p.y, startY);
  }
  r.load('hangingGardens'); r.drain();
  assert.equal(G.state.restorationDetails.length, 28); assert.ok(steps.every(step => !solid(step)));
  assert.ok(!G.state.enemies.some(e => e.def.id === 'oldMason'));
  G.state.enemies.push(G.makeEnemy('oldMason', victoryPoint.x, victoryPoint.y));
  const rematch = G.state.enemies.find(e => e.def.id === 'oldMason'); rematch.ward.hp = 0; rematch.bossIntroT = 0;
  G.combat.damageEnemy(rematch, { ...strike, damage: rematch.hp + 10 }); r.drain();
  assert.equal(G.state.stars, beforeClaim + 1); assert.equal(G.groundRewardFor(item), null);
  G.state.groundRewards = G.normalizeGroundRewards(saved.groundRewards);
  assert.equal(G.state.groundRewards.length, 0, 'legacy owned Stone Mark cannot replay its saved gift');
  assert.equal(G.ensureWorldwake().marks.filter(id => id === 'stone').length, 1);
});
