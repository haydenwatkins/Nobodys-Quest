const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

function fixture() {
  const r = runtime(), {G} = r;
  r.load('overworld'); r.drain();
  G.state.claimedForms = ['rat', 'wizard', 'knight'];
  G.state.formId = 'knight';
  return r;
}

test('borrowed lesson earns the source form mastery and keeps the original mix', () => {
  const {G} = fixture();
  const quest = G.forms.rat.quests.find(q => q.match?.ability === 'bite');
  const old = [...G.getLoadout('knight')];
  assert.ok(G.prepareMasteryLesson(quest.id, 2));
  assert.equal(G.getLoadout('knight')[0], G.forms.knight.basic);
  assert.equal(G.getLoadout('knight')[2], 'bite');
  assert.deepEqual([...G.mixRecipes('knight')[0]], old);
  assert.equal(G.fieldMasteryQuest().quest.id, quest.id);
  G.restoreDefaultLoadout('knight');
  assert.notEqual(G.fieldMasteryQuest()?.quest.id, quest.id, 'a removed art must not keep an impossible field lesson active');
  assert.ok(G.prepareMasteryLesson(quest.id, 2));
  assert.equal(G.mixRecipes('knight').filter(Boolean).length, 1, 'repeated experiments do not duplicate the same backup');
  const stars = G.state.stars, level = G.formLevel('rat');
  for (let i=0; i<quest.count; i++) G.events.emit('hit', {ability:'bite'});
  assert.ok(G.questsDone.includes(quest.id));
  assert.equal(G.state.stars, stars+1);
  assert.equal(G.formLevel('rat'), level+1);
  assert.notEqual(G.fieldMasteryQuest()?.quest.id, quest.id);
  assert.equal(G.state.formId, 'knight');
  assert.ok(G.recallMixRecipe('knight', 0));
  assert.deepEqual([...G.getLoadout('knight')], old);
});

test('recipes and followed lesson survive serialization; malformed or newly locked arts do not equip', () => {
  const {G} = fixture();
  G.getLoadout('knight')[1] = 'bite';
  assert.ok(G.saveMixRecipe('knight', 2));
  const q = G.forms.rat.quests.find(q => q.match?.ability === 'bite');
  G.prepareMasteryLesson(q.id, 1);
  G.saveGame();
  const save = G.loadSaveData();
  G.state.mixRecipes = G.normalizeMixRecipes(save.mixRecipes);
  assert.equal(save.lessonQuestId, q.id);
  G.restoreDefaultLoadout('knight');
  assert.ok(G.recallMixRecipe('knight', 2));
  assert.equal(G.getLoadout('knight')[1], 'bite');
  G.state.claimedForms = ['knight'];
  G.restoreDefaultLoadout('knight');
  const old = [...G.getLoadout('knight')];
  assert.equal(G.recallMixRecipe('knight', 2), false);
  assert.deepEqual([...G.getLoadout('knight')], old);
  assert.equal(G.saveMixRecipe('knight', 3), false);
  const clean = G.normalizeMixRecipes({knight:[42, ['fake', {}, 'missing'], null, ['extra']], ghost:[['x']]});
  assert.equal(clean.knight.length, 3);
  assert.equal(clean.knight[0], null);
  assert.equal(clean.knight[1][0], G.forms.knight.basic);
  assert.equal(clean.knight[1][1], null);
  assert.equal(clean.ghost, undefined);
});

test('lesson choices exclude unearned arts and reject changing A or a completed lesson', () => {
  const {G} = fixture();
  const locked = G.forms.rat.quests.find(q => q.match?.ability === 'fester');
  assert.ok(!G.masteryLessons(Infinity).some(e => e.quest.id === locked.id));
  assert.equal(G.prepareMasteryLesson(locked.id, 1), false);
  const bite = G.forms.rat.quests.find(q => q.match?.ability === 'bite');
  assert.equal(G.prepareMasteryLesson(bite.id, 0), false);
  G.questsDone.push(bite.id);
  assert.equal(G.prepareMasteryLesson(bite.id, 1), false);
  assert.ok(G.masteryLessons(Infinity).every(e => !e.ability || G.availableAbilities().includes(e.ability)));
});

test('campaign star gate and final exam name an earned lesson instead of sending players to an unavailable art', () => {
  const {G} = fixture();
  G.openingGoal = () => null;
  G.storyChapter = () => 2;
  G.state.stars = 15;
  let goal = G.storyGoal();
  assert.ok(goal.questId);
  assert.ok(goal.objective.includes(G.questById(goal.questId).quest.text));
  G.storyChapter = () => 5;
  goal = G.storyGoal();
  assert.ok(G.formUnlocked(goal.formId));
  assert.ok(G.masteryLessons(Infinity).some(e => e.quest.id === goal.questId));
});
