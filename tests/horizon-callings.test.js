const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

function traveler() {
  const r = runtime(), { G } = r;
  r.load('overworld'); r.drain();
  G.state.opening.complete = true;
  G.state.delivery.complete = true;
  G.state.stars = 10;
  G.state.items.push('trophy-heartwood-crown', 'trophy-mire-pearl', 'trophy-eclipse-sigil');
  G.state.claimedForms = ['rat'];
  G.questsDone = G.forms.nobody.quests.slice(0, 2).map(q => q.id);
  return r;
}

function meet(r, formId) {
  const { G } = r, echo = G.formEchoFor(formId);
  assert.ok(echo);
  Object.assign(G.state.player, { x: echo.x + 40, y: echo.y });
  G.updateFormEcho(); r.drain();
  Object.assign(G.state.player, { x: echo.x, y: echo.y });
  G.updateFormEcho(); r.drain();
  assert.equal(G.formUnlocked(formId), true);
}

test('the horizon leads through the Crest, Knight practice, and a real Ranger echo', () => {
  const r = traveler(), { G } = r;
  assert.equal(G.storyChapter(), 2);
  let goal = G.storyGoal();
  assert.equal(goal.guide, 'item');
  assert.equal(goal.mapId, 'dungeon');
  assert.equal(goal.itemId, 'knights-crest');
  assert.match(goal.objective, /10\/24/);
  assert.equal(G.guidanceRoute('overworld', goal.mapId).locks, 0);
  assert.equal(G.guidanceTarget().cell.portal.map, 'dungeon');
  r.load('dungeon'); r.drain();
  const target = G.guidanceTarget();
  Object.assign(G.state.player, { x: target.x, y: target.y });
  G.world.checkTriggers(.5); r.drain();
  assert.ok(G.state.items.includes('knights-crest'));
  goal = G.storyGoal();
  assert.equal(goal.guide, 'echo');
  assert.equal(goal.formId, 'knight');
  meet(r, 'knight');
  goal = G.storyGoal();
  assert.equal(goal.guide, 'mastery');
  assert.equal(goal.formId, 'knight');
  assert.match(goal.short, /Ranger/);
  assert.equal(goal.questId, G.forms.knight.quests[0].id);
  // Use actual frontal guard contact, not synthetic quest completion.
  const p = G.state.player;
  p.dir = { x: 1, y: 0 };
  for (let i = 0; i < 8; i++) {
    p.invincible = 0; p.knightGuardT = .5; p.knightPerfectT = .2;
    G.damagePlayer(1, p.x + 12, p.y);
  }
  assert.equal(G.formLevel('knight'), 2);
  assert.equal(G.state.stars, 11);
  goal = G.storyGoal();
  assert.equal(goal.guide, 'echo');
  assert.equal(goal.formId, 'ranger');
  assert.match(G.guidanceTarget().text, /win a battle/i);
  G.leaveReadyFormEchoAt(p.x + 40, p.y, 'battle');
  meet(r, 'ranger');
  assert.notEqual(G.storyGoal().formId, 'ranger', 'the calling advances after the ceremony');
});

test('a ready calling wins over another locked path and opens the varied-roster Frog path', () => {
  const r = traveler(), { G } = r;
  G.state.claimedForms.push('knight', 'ranger');
  G.questsDone.push(G.forms.rat.quests[0].id);
  let goal = G.storyGoal();
  assert.equal(goal.guide, 'echo');
  assert.equal(goal.formId, 'wizard');
  G.leaveReadyFormEchoAt(G.state.player.x + 40, G.state.player.y, 'battle');
  G.saveGame();
  G.state.formEchoes = G.normalizeFormEchoes(G.loadSaveData().formEchoes);
  meet(r, 'wizard');
  goal = G.storyGoal();
  assert.equal(goal.guide, 'echo');
  assert.equal(goal.formId, 'frog');
  assert.match(goal.reason, /new arts and lessons/);
  assert.ok(!goal.reason.includes('final portfolio'));
});

test('followed lessons, unfinished guardians, and the open road keep their priorities', () => {
  const { G } = traveler();
  G.state.claimedForms.push('knight');
  G.questsDone.push(G.forms.rat.quests[0].id);
  const bite = G.forms.rat.quests.find(q => q.match?.ability === 'bite');
  assert.equal(G.prepareMasteryLesson(bite.id, 1), true);
  let goal = G.storyGoal();
  assert.equal(goal.guide, 'mastery');
  assert.equal(goal.questId, bite.id, 'an explicit experiment is not replaced by an echo invitation');
  G.state.items = G.state.items.filter(id => id !== 'trophy-eclipse-sigil');
  goal = G.storyGoal();
  assert.equal(goal.guide, 'boss');
  assert.equal(goal.mapId, 'emberRidge');
  G.state.stars = 24;
  goal = G.storyGoal();
  assert.equal(goal.guide, 'travel');
  assert.equal(goal.mapId, 'sunstepPrairie');
  assert.equal(G.guidanceRoute('overworld', goal.mapId).locks, 0);
});

test('Dragon preparation teaches earned parent arts without introducing another road gate', () => {
  const { G } = traveler();
  G.state.claimedForms = G.formOrder.slice(1, G.formOrder.indexOf('dragon'));
  G.state.stars = 22;
  G.questsDone = G.formOrder.slice(0, G.formOrder.indexOf('dragon'))
    .filter(id => id !== 'frog').flatMap(id => G.forms[id].quests.slice(0, 2).map(q => q.id));
  const goal = G.storyGoal();
  assert.equal(goal.guide, 'mastery');
  assert.equal(goal.formId, 'frog');
  assert.match(goal.short, /Dragon/);
  assert.ok(G.masteryLessons(Infinity).some(entry => entry.quest.id === goal.questId));
  assert.ok(!G.guidanceTarget().text.includes('Tail Sweep'));
  G.state.stars = 24;
  assert.equal(G.storyGoal().guide, 'travel');
});
