const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

function sixMarkTraveler() {
  const r = runtime(), { G } = r;
  G.state.opening.complete = true;
  G.state.delivery.complete = true;
  G.state.stars = 60;
  G.state.worldwake.marks = ['sky', 'stone', 'thread', 'echo', 'light', 'heart'];
  G.state.claimedForms = G.formOrder.filter(id => !['nobody', 'god', 'turtle'].includes(id));
  G.questsDone = G.formOrder.filter(id => !['god', 'turtle'].includes(id))
    .flatMap(id => G.forms[id].quests.slice(0, 2).map(quest => quest.id));
  r.load('overworld'); r.drain();
  return r;
}

test('final preparation follows a missing guardian, its parent lesson, then the form echo', () => {
  const { G } = sixMarkTraveler();
  assert.equal(G.storyChapter(), 5);
  assert.deepEqual(Array.from(G.finalExamMastery().missingBreadth), ['turtle']);
  let goal = G.storyGoal();
  assert.equal(goal.guide, 'boss');
  assert.equal(goal.mapId, 'turtleTrial');
  assert.match(goal.objective, /Admiral Tortoise/);
  assert.equal(G.bossPreparation().enemy, 'Admiral Tortoise');
  assert.equal(G.guidanceRoute('overworld', goal.mapId).locks, 0);
  assert.equal(G.guidanceTarget().cell.portal.map, 'shattercoast');

  G.state.items.push('tide-shell');
  goal = G.storyGoal();
  assert.equal(goal.guide, 'mastery');
  assert.equal(goal.formId, 'knight');
  assert.ok(goal.questId);
  assert.ok(!G.guidanceTarget().text.includes('Shell Jab'), 'locked Turtle arts cannot be recommended');
  const lesson = G.questById(goal.questId).quest;
  for (let i = 0; i < lesson.count; i++) G.events.emit(lesson.event, { ability: lesson.match.ability, status: lesson.match.status });
  assert.equal(G.formLevel('knight'), 4);
  assert.equal(G.formReady('turtle'), true);
  goal = G.storyGoal();
  assert.equal(goal.guide, 'echo');
  assert.equal(goal.formId, 'turtle');
  assert.match(G.guidanceTarget().text, /win a battle/i);
  const echo = G.leaveReadyFormEchoAt(G.state.player.x + 40, G.state.player.y, 'battle');
  assert.equal(echo.formId, 'turtle');
  assert.match(G.guidanceTarget().destination, /Turtle/);
  assert.equal(G.claimForm('turtle'), true);
  goal = G.storyGoal();
  assert.equal(goal.guide, 'mastery');
  assert.equal(goal.formId, 'turtle');
  assert.ok(goal.questId);
});

test('a locked form with no known trial never sends field guidance to its unavailable quest', () => {
  const { G } = sixMarkTraveler();
  G.state.items.push('tide-shell');
  G.questsDone = G.questsDone.filter(id => id !== G.forms.knight.quests[1].id);
  // The Knight has an unfinished level, so a real Knight lesson is offered.
  assert.equal(G.storyGoal().formId, 'knight');
  // If no immediately borrowable lesson remains, the fallback still explains
  // the locked form rather than claiming its basic art is equipable.
  const oldLessons = G.masteryLessons;
  G.masteryLessons = () => [];
  const goal = G.storyGoal();
  assert.equal(goal.formId, 'turtle');
  assert.equal(goal.questId, undefined);
  const target = G.guidanceTarget();
  assert.equal(target.spatial, false);
  assert.match(target.text, /Awaken Turtle/);
  assert.ok(!target.text.includes('Shell Jab'));
  G.masteryLessons = oldLessons;
});
