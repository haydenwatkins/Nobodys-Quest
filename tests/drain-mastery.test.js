const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

function fixture(body = 'vampire') {
  const r = runtime(), { G } = r;
  r.load('sunkenMarsh'); r.drain();
  G.state.opening.complete = true; G.state.delivery.complete = true;
  G.state.claimedForms = ['vampire']; G.state.formId = body;
  G.state.enemies = []; G.state.projectiles = [];
  const p = G.state.player;
  Object.assign(p, { x: 240, y: 152, dir: { x: 1, y: 0 } });
  const q = G.forms.vampire.quests[1];
  G.storyGoal = () => ({ guide: 'mastery', formId: 'vampire', questId: q.id });
  if (body !== 'vampire') G.getLoadout(body)[1] = 'bloodBite';
  function foe() { const e = G.makeEnemy('slime', 253, 152); e.hp = 50; G.state.enemies.push(e); return e; }
  return { ...r, p, q, foe };
}

test('a real crowd bite earns every restored heart, preserves old credit, and completes once', () => {
  const { G, p, q, foe } = fixture();
  G.questCounts[q.id] = 1;
  p.damageTaken = 3; p.bloodPips = 9; foe();
  G.abilities.bloodBite.use(p);
  assert.equal(p.damageTaken, 1);
  assert.equal(G.questProgress(q), 3);
  assert.ok(G.questsDone.includes(q.id));
  assert.equal(G.state.stars, 1);
  G.healPlayer(1, 'bloodBite');
  assert.equal(G.state.stars, 1, 'the reward is only earned once');
  G.saveGame();
  assert.ok(G.loadSaveData().questsDone.includes(q.id));
});

test('borrowed bites count only actual healing; pickups, Blood Moon, and overflow do not count', () => {
  const { G, p, q, foe } = fixture('nobody');
  p.damageTaken = 1; p.bloodPips = 14; foe();
  G.abilities.bloodBite.use(p);
  assert.equal(p.damageTaken, 0);
  assert.equal(G.questProgress(q),0,'borrowed healing helps the current body but cannot level unworn Velvetwing');
  p.damageTaken = 1; G.healPlayer(1, 'heart-pickup');
  p.damageTaken = 1; G.healPlayer(1, 'bloodMoon');
  assert.equal(G.questProgress(q), 0);
  p.bloodPips = 4; G.abilities.bloodBite.use(p);
  assert.equal(G.questProgress(q), 0, 'full-health healing cannot produce credit');
  G.events.emit('selfHeal', { ability: 'bloodBite', amount: 0 });
  G.events.emit('selfHeal', { ability: 'bloodBite', amount: NaN });
  assert.equal(G.questProgress(q), 0);
});

test('drain guidance reflects health, bite progress, and ward-protected practice foes', () => {
  const { G, p, foe } = fixture();
  const e = foe();
  assert.equal(G.guidanceTarget().spatial, false);
  assert.match(G.guidanceTarget().text, /Practice another lesson/);
  p.damageTaken = 2; p.bloodPips = 3;
  assert.equal(G.guidanceTarget().x, e.x);
  assert.match(G.guidanceTarget().text, /2 more hits to the next drain/);
  e.ward = { hp: 2, types: ['dark'] };
  assert.equal(G.guidanceTarget().spatial, false);
  assert.match(G.guidanceTarget().text, /break a ward first/);
  p.bloodPips = 0;
  G.abilities.bloodBite.use(p);
  assert.equal(p.bloodPips, 0, 'a blocked bite cannot build the suggested drain');
  e.ward.types = ['sharp']; p.bloodPips = 4;
  assert.equal(G.guidanceTarget().x, e.x, 'matching ward hits can feed Blood Bite');
  G.abilities.bloodBite.use(p);
  assert.equal(p.damageTaken, 1);
  p.bloodPips = 0;
  e.ward = null;
  G.abilities.bloodBite.use(p);
  assert.equal(p.bloodPips, 1);
  assert.match(G.guidanceTarget().text, /4 more hits/);
  G.state.enemies = [];
  assert.equal(G.guidanceTarget().spatial, false);
});
