const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

test('caravan field notes require earned, attuned Mark hits in their home regions', () => {
  const r = runtime(), {G} = r;
  r.load('windscarCanyon'); r.drain();
  const campaign = G.ensureWorldwake();
  const hit = (ability) => {
    const enemy = G.makeEnemy('slime', G.state.player.x + 20, G.state.player.y);
    G.state.enemies.push(enemy);
    G.combat.damageEnemy(enemy, { ability, damage: 1, type: G.abilities[ability].type, knockback: 0 });
  };

  G.events.emit('hit', { enemy: 'slime', ability: 'squeakDash' });
  assert.equal(campaign.markPractices.length, 0, 'an unequipped or unearned Mark cannot qualify');
  campaign.marks.push('sky', 'stone', 'thread');
  G.attuneWorldMark('sky');
  G.state.enemies.push({ id: 'practicePost', def: { practice: true } });
  G.events.emit('hit', { enemy: 'practicePost', ability: 'squeakDash' });
  assert.equal(campaign.markPractices.length, 0, 'practice posts cannot stand in for a combat encounter');
  hit('slash');
  assert.equal(campaign.markPractices.length, 0, 'the art must use the carried Mark’s style');
  hit('squeakDash');
  assert.deepEqual([...campaign.markPractices], ['sky']);
  hit('squeakDash');
  assert.equal(campaign.markPractices.length, 1, 'repeated hits cannot farm notes');

  r.load('hangingGardens'); r.drain();
  hit('slash');
  assert.equal(campaign.markPractices.length, 1, 'the wrong Mark in a region does not count');
  G.attuneWorldMark('stone');
  hit('slash');
  assert.deepEqual([...campaign.markPractices], ['sky', 'stone']);

  r.load('rootdeepHollow'); r.drain();
  G.attuneWorldMark('thread');
  const before = G.state.stars;
  hit('shadowBolt');
  assert.deepEqual([...campaign.markPractices], ['sky', 'stone', 'thread']);
  assert.ok(campaign.favorsDone.includes('roadLessons'));
  assert.equal(G.state.stars, before + 2);
  hit('shadowBolt');
  assert.equal(G.state.stars, before + 2, 'the favor pays only once');

  const stored = JSON.parse(JSON.stringify(campaign));
  const restored = G.normalizeWorldwake(stored, { items: [
    'trophy-sky-sovereign', 'trophy-old-mason', 'trophy-silk-matriarch',
  ] });
  assert.deepEqual([...restored.markPractices], ['sky', 'stone', 'thread']);
  assert.ok(restored.favorsDone.includes('roadLessons'));
  assert.deepEqual([...G.normalizeWorldwake({ marks: ['sky'], markPractices: ['sky', 'sky', 'heart', 'fake'] }, { items: [] }).markPractices], ['sky']);
  assert.deepEqual([...G.normalizeWorldwake({ marks: ['sky'], markPractices: 'sky' }, { items: [] }).markPractices], []);
  assert.deepEqual([...G.normalizeWorldwake(undefined, { items: ['trophy-sky-sovereign'] }).markPractices], [],
    'old trophies offer practice without silently claiming it');
});
