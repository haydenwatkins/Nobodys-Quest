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

test('following Rat mastery wears Rat and preserves the Knight mix; borrowed Bite gives no Rat credit', () => {
  const r=fixture(),{G}=r;
  const quest=G.forms.rat.quests.find(q=>q.match?.ability==='bite');
  G.getLoadout('knight')[2]='bite';const old=[...G.getLoadout('knight')];
  const e=G.makeEnemy('slime',G.state.player.x+10,G.state.player.y);e.hp=999;
  G.state.enemies.push(e);
  G.combat.damageEnemy(e,{ability:'bite',damage:1,type:'dark',fromX:e.x-10,fromY:e.y});
  assert.equal(G.questProgress(quest),0,'a borrowed move cannot level an unworn body');
  assert.ok(G.prepareMasteryLesson(quest.id,2));assert.equal(G.state.formId,'rat');
  assert.deepEqual([...G.getLoadout('knight')],old,'choosing a lesson leaves the previous build intact');
  assert.equal(G.fieldMasteryQuest().quest.id,quest.id);
  const stars=G.state.stars,level=G.formLevel('rat');
  for(let i=0;i<quest.count;i++)G.combat.damageEnemy(e,{ability:'bite',damage:1,type:'dark',fromX:e.x-10,fromY:e.y});
  assert.ok(G.questsDone.includes(quest.id));assert.equal(G.state.stars,stars+1);
  assert.equal(G.formLevel('rat'),level+1);assert.equal(G.state.formId,'rat');
  G.setForm('knight');assert.deepEqual([...G.getLoadout('knight')],old);
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
  assert.equal(G.prepareMasteryLesson(bite.id, 0), true,'following a native basic selects its form without replacing A');
  assert.equal(G.getLoadout('rat')[0],G.forms.rat.basic);
  G.questsDone.push(bite.id);
  assert.equal(G.prepareMasteryLesson(bite.id, 1), false);
  assert.ok(G.masteryLessons(Infinity).every(e => !e.ability || G.availableAbilities().includes(e.ability)));
});

test('campaign star gate and final exam name an earned lesson instead of sending players to an unavailable art', () => {
  const {G} = fixture();
  G.openingGoal = () => null;
  G.storyChapter = () => 2;
  G.state.stars = 15;
  G.state.items.push('trophy-heartwood-crown', 'trophy-mire-pearl', 'trophy-eclipse-sigil');
  let goal = G.storyGoal();
  assert.ok(goal.questId);
  assert.ok(goal.objective.includes(G.questById(goal.questId).quest.text));
  G.storyChapter = () => 5;
  goal = G.storyGoal();
  assert.ok(G.formUnlocked(goal.formId));
  assert.ok(G.masteryLessons(Infinity).some(e => e.quest.id === goal.questId));
});
