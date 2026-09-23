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
});
