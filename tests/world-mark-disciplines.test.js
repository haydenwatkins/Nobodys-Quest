const { test } = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

function setup() {
  const { G } = runtime();
  G.state.formId = 'nobody';
  return G;
}

test('World Marks unlock one selectable discipline and preserve old saves', () => {
  const G = setup();
  let saves = 0;
  G.saveGame = () => { saves++; };
  assert.equal(G.attuneWorldMark('sky'), false, 'an unearned mark cannot be carried');
  assert.equal(G.activeWorldMarkDiscipline(), null);

  G.state.items.push('trophy-sky-sovereign');
  G.events.emit('pickup', { item: 'trophy-sky-sovereign' });
  assert.ok(G.hasWorldMark('sky'));
  assert.equal(G.attuneWorldMark('sky'), true);
  assert.equal(G.activeWorldMarkDiscipline().id, 'sky');
  assert.equal(G.attuneWorldMark('sky'), false, 'reselecting changes nothing');
  assert.equal(saves > 0, true);

  const stored = JSON.parse(JSON.stringify(G.state.worldwake));
  const restored = G.normalizeWorldwake(stored, { items: G.state.items });
  assert.equal(restored.attunedMark, 'sky');
  assert.equal(G.normalizeWorldwake({ marks: [], attunedMark: 'heart' }, { items: [] }).attunedMark, null);
  const old = G.normalizeWorldwake(undefined, { items: ['trophy-sky-sovereign'] });
  assert.ok(old.marks.includes('sky'));
  assert.equal(old.attunedMark, null, 'legacy trophies never silently alter combat');
});

test('each carried lesson changes its combat primitive, and changing marks removes the old effect', () => {
  const G = setup();
  const p = G.state.player;
  const marks = G.state.worldwake.marks = G.WORLD_MARK_DISCIPLINES.map((mark) => mark.id);
  assert.equal(marks.length, 6);
  const prepare = (kind, ability, options) => G.passives.prepare(kind, p, { ability, ...options });
  const dash = { dist: 100 }, melee = { range: 30, arcDeg: 100, knockback: 80 };
  const projectile = { speed: 160, ricochets: 0, bounceRange: 40 };
  const chain = { jumpRange: 48 }, area = { range: 40 };

  const originalDash = prepare('dash', 'cartwheel', dash).dist;
  const originalArea = prepare('area', 'fester', area).range;
  const originalChain = prepare('chain', 'chainLightning', chain).jumpRange;
  assert.equal(G.attuneWorldMark('sky'), true);
  assert.ok(prepare('dash', 'cartwheel', dash).dist > originalDash);
  assert.equal(prepare('area', 'fester', area).range, originalArea);

  assert.equal(G.attuneWorldMark('stone'), true);
  assert.equal(prepare('dash', 'cartwheel', dash).dist, originalDash);
  assert.equal(prepare('melee', 'slap', melee).arcDeg, melee.arcDeg + 20);

  assert.equal(G.attuneWorldMark('thread'), true);
  assert.equal(prepare('projectile', 'arrow', projectile).ricochets, 1);
  assert.equal(prepare('projectile', 'arrow', projectile).bounceRange, 68);

  assert.equal(G.attuneWorldMark('echo'), true);
  assert.equal(prepare('chain', 'chainLightning', chain).jumpRange, originalChain * 1.25);
  assert.equal(prepare('projectile', 'arrow', projectile).ricochets, 0);

  assert.equal(G.attuneWorldMark('light'), true);
  assert.equal(prepare('area', 'fester', area).range, originalArea * 1.18);
  assert.equal(prepare('projectile', 'volatileFlask', { explodeRadius: 30 }).explodeRadius, 30 * 1.18);

  assert.equal(G.attuneWorldMark('heart'), true);
  assert.equal(prepare('melee', 'slap', melee).knockback, melee.knockback * 1.22);
  assert.equal(prepare('area', 'fester', { knockback: 80 }).knockback, 80 * 1.22);
  assert.equal(G.attuneWorldMark(null), true);
  assert.equal(prepare('melee', 'slap', melee).knockback, melee.knockback);
});
