const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

test('group mastery asks for enough live targets before drawing a field trail', () => {
  const r = runtime(), { G } = r;
  G.state.opening.complete = true;
  G.state.delivery.complete = true;
  G.state.claimedForms = ['knight'];
  G.questsDone = G.forms.knight.quests.slice(0, 3).map(quest => quest.id);
  G.state.formId = 'knight';
  r.load('overworld'); r.drain();
  G.getLoadout('knight')[1] = 'spinSlash';
  const quest = G.forms.knight.quests[3];
  G.storyGoal = () => ({ guide: 'mastery', formId: 'knight', questId: quest.id });
  const x = G.state.player.x, y = G.state.player.y;
  G.state.enemies = [G.makeEnemy('slime', x + 40, y)];
  let target = G.guidanceTarget();
  assert.equal(target.spatial, false);
  assert.match(target.text, /Only 1\/3 baddies remain/);
  assert.match(target.text, /Hold the Line/);

  G.state.enemies.push(G.makeEnemy('slime', x + 55, y + 20), G.makeEnemy('slime', x + 70, y - 15));
  target = G.guidanceTarget();
  assert.equal(target.spatial, undefined);
  assert.ok(target.x > x);
  assert.match(target.text, /Draw 3 baddies together/);
  assert.match(target.text, /Hold the Line/);
  G.state.enemies[0].dead = true;
  target = G.guidanceTarget();
  assert.equal(target.spatial, false, 'dead foes must not count toward a group lesson');
  assert.match(target.text, /Only 2\/3/);

  G.requestGuidance(false);
  let labelDraws = 0;
  const ctx = {
    font: '', fillStyle: '', measureText: () => ({ width: 120 }),
    fillRect() { labelDraws++; }, fillText() { labelDraws++; },
  };
  G.drawGuidanceHud(ctx, { x: 0, y: 0 });
  assert.equal(labelDraws, 0, 'the nonspatial label waits while its help toast is visible');
  G.state.time += 4.6;
  G.drawGuidanceHud(ctx, { x: 0, y: 0 });
  assert.ok(labelDraws > 0, 'the label returns after the toast clears');
});

test('combo-only multi-hit lessons need two foes, and Mole requires the three it promises', () => {
  const r = runtime(), { G } = r;
  G.state.opening.complete = true;
  G.state.delivery.complete = true;
  G.state.claimedForms = ['turtle', 'mole'];
  G.questsDone = [G.forms.turtle.quests[0].id, G.forms.mole.quests[0].id];
  G.state.formId = 'turtle';
  r.load('overworld'); r.drain();
  const turtle = G.forms.turtle.quests[1];
  G.storyGoal = () => ({ guide: 'mastery', formId: 'turtle', questId: turtle.id });
  const x = G.state.player.x, y = G.state.player.y;
  G.state.enemies = [G.makeEnemy('slime', x + 40, y)];
  assert.match(G.guidanceTarget().text, /Only 1\/2 baddies remain/);
  G.state.enemies.push(G.makeEnemy('slime', x + 50, y));
  assert.match(G.guidanceTarget().text, /Draw 2 baddies together/);

  G.state.formId = 'mole';
  const mole = G.forms.mole.quests[1];
  G.storyGoal = () => ({ guide: 'mastery', formId: 'mole', questId: mole.id });
  assert.match(G.guidanceTarget().text, /Only 2\/3 baddies remain/);
  G.events.emit('multiHit', { ability: 'drillTap', combo: 'eruption', hits: 2 });
  assert.equal(G.questProgress(mole), 0, 'two hits cannot satisfy the stated three-target lesson');
  G.state.enemies.push(G.makeEnemy('slime', x + 60, y));
  assert.match(G.guidanceTarget().text, /Draw 3 baddies together/);
  G.events.emit('multiHit', { ability: 'drillTap', combo: 'eruption', hits: 3 });
  assert.equal(G.questProgress(mole), 1);
});
