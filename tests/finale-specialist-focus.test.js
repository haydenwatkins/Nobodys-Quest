const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

function readyForSpecialists() {
  const r = runtime(), { G } = r;
  G.state.opening.complete = true;
  G.state.delivery.complete = true;
  G.state.stars = 70;
  G.state.worldwake.marks = ['sky', 'stone', 'thread', 'echo', 'light', 'heart'];
  G.state.claimedForms = G.formOrder.filter(id => id !== 'nobody' && id !== 'god');
  G.questsDone = G.formOrder.filter(id => id !== 'god')
    .flatMap(id => G.forms[id].quests.slice(0, 2).map(quest => quest.id));
  r.load('overworld'); r.drain();
  assert.equal(G.finalExamMastery().broad, 23);
  return r;
}

test('final Journey guidance finishes an available level-four specialty before starting another', () => {
  const { G } = readyForSpecialists();
  let goal = G.storyGoal();
  assert.equal(goal.formId, 'nobody');
  G.questsDone.push(goal.questId);
  assert.equal(G.formLevel('nobody'), 4);
  goal = G.storyGoal();
  assert.equal(goal.formId, 'nobody');
  assert.equal(goal.questId, G.forms.nobody.quests[2].id);

  // A followed lesson is a deliberate build choice and remains in charge.
  const rat = G.masteryLessons(Infinity, 'rat')[0];
  assert.ok(rat);
  G.state.lessonQuestId = rat.quest.id;
  goal = G.storyGoal();
  assert.equal(goal.questId, rat.quest.id);
  assert.equal(goal.formId, 'rat');
  G.state.lessonQuestId = null;

  for (let step = 0; step < 18 && !G.finalExamMastery().ready; step++) {
    goal = G.storyGoal();
    assert.ok(goal.questId, `step ${step + 1} has an available lesson`);
    assert.ok(!G.questsDone.includes(goal.questId));
    G.questsDone.push(goal.questId);
  }
  assert.equal(G.finalExamMastery().specialists, 6);
  assert.equal(G.finalExamMastery().ready, true);
  assert.equal(G.storyGoal().mapId, 'godTrial');
});
