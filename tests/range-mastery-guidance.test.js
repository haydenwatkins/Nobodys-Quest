const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

function fixture() {
  const r = runtime(), { G } = r;
  r.load('emberRidge'); r.drain();
  G.state.opening.complete = true; G.state.delivery.complete = true;
  G.state.claimedForms = ['ranger']; G.state.formId = 'ranger';
  G.state.enemies = []; G.state.projectiles = [];
  const p = G.state.player;
  Object.assign(p, { x: 160, y: 144, dir: { x: 1, y: 0 } });
  const quest = G.forms.ranger.quests[0];
  G.storyGoal = () => ({ guide: 'mastery', formId: 'ranger', questId: quest.id });
  function foe(x) { const e = G.makeEnemy('slime', x, 144); e.hp = 50; G.state.enemies.push(e); return e; }
  return { ...r, p, quest, foe };
}

test('range help teaches the real impact distance and a live Arrow earns its lesson', () => {
  const { G, p, quest, foe } = fixture(), e = foe(280);
  assert.match(G.guidanceTarget().text, /Hold this distance/);
  assert.equal(G.guidanceTarget().practiceDistance, 100);
  G.abilities.arrow.use(p);
  for (let i = 0; i < 20; i++) G.combat.updateProjectiles(.05);
  assert.equal(G.questProgress(quest), 1);
  assert.ok(e.hp < 50);
  p.x = 240;
  assert.match(G.guidanceTarget().text, /Step outside/);
  G.abilities.arrow.use(p);
  for (let i = 0; i < 10; i++) G.combat.updateProjectiles(.05);
  assert.equal(G.questProgress(quest), 1, 'close hits do not count');
  p.x = 160;
  G.abilities.arrow.use(p);
  p.x = 240;
  for (let i = 0; i < 20; i++) G.combat.updateProjectiles(.05);
  assert.equal(G.questProgress(quest), 1, 'closing after release loses range credit');
});

test('the range cue prefers a ready shot, rejects wards and scenery, and refreshes its spacing text', () => {
  const { G, p, foe } = fixture(), close = foe(240), far = foe(280);
  assert.equal(G.guidanceTarget().entity, far);
  far.ward = { hp: 5, types: ['sharp'] };
  assert.equal(G.guidanceTarget().entity, close, 'ward damage is not a distant hit');
  far.ward = null; far.def = { ...far.def, practice: true };
  assert.equal(G.guidanceTarget().entity, close);
  close.dead = true;
  assert.equal(G.guidanceTarget().spatial, false);
  assert.match(G.guidanceTarget().text, /unwarded baddie with a clear shot/);
  close.dead = false;
  const originalArc = G.combat.clearArc;
  G.combat.clearArc = () => false;
  assert.equal(G.guidanceTarget().spatial, false, 'a wall cannot be taught as a clean shot');
  G.combat.clearArc = originalArc;
  close.x = 280; p.x = 200;
  const texts = []; G.ui.toast = text => texts.push(text);
  G.requestGuidance(false);
  assert.match(texts.at(-1), /Step outside/);
  p.x = 160;
  G.requestGuidance(false);
  assert.match(texts.at(-1), /Hold this distance/, 'stationary targets still update current instructions');
  p.x = 120;
  assert.match(G.guidanceTarget().text, /Move within Arrow/);
});

test('range help draws the hit boundary without breadcrumbs that encourage closing', () => {
  const { G, foe } = fixture(); foe(280);
  G.requestGuidance(false);
  const arcs = [], rects = [];
  const ctx = { save() {}, restore() {}, translate() {}, rotate() {}, beginPath() {}, stroke() {},
    arc(x, y, radius) { arcs.push({ x, y, radius }); }, fillRect(...args) { rects.push(args); } };
  G.drawWorldGuidance(ctx, { x: 0, y: 0 }, 1);
  assert.ok(arcs.some(a => a.x === 280 && a.y === 144 && a.radius === 100));
  assert.equal(rects.length, 10, 'two ground ticks and eight boundary pips, without approach breadcrumbs');
  G.state.time += 14; arcs.length = 0;
  G.drawWorldGuidance(ctx, { x: 0, y: 0 }, 1);
  assert.ok(!arcs.some(a => a.radius === 100), 'large practice geometry retires after help expires');
});

test('the rendered mastery tracker keeps a followed range lesson ahead of a busier automatic lesson', () => {
  const r = fixture(), { G, quest } = r, automatic = G.forms.ranger.quests[2];
  G.state.lessonQuestId = quest.id;
  G.questCounts[quest.id] = 1; G.questCounts[automatic.id] = 5;
  assert.equal(G.relevantMasteryQuests(1)[0].quest.id, automatic.id);
  const texts = [];
  const ctx = new Proxy({ measureText: text => ({ width: String(text).length }),
    fillText: text => texts.push(String(text)) }, { get: (obj, key) => obj[key] || (() => {}), set: (obj, key, value) => (obj[key] = value, true) });
  r.context.document.getElementById('ui').getContext = () => ctx;
  r.run('js/engine/ui.js');
  G.guidanceShowStoryCard = () => false;
  G.ui.drawHUD({ x: 0, y: 0 });
  assert.ok(texts.some(text => text.includes(quest.text)));
  assert.ok(texts.includes('1/8'));
  assert.ok(!texts.some(text => text.includes(automatic.text)));
  G.questsDone.push(quest.id); texts.length = 0;
  G.ui.drawHUD({ x: 0, y: 0 });
  assert.ok(texts.some(text => text.includes(automatic.text)), 'completed choices release the tracker to automatic mastery');
});
