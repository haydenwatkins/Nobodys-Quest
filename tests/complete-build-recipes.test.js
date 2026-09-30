const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

function fixture() {
  const r = runtime(), { G } = r;
  r.load('overworld'); r.drain();
  G.state.claimedForms = ['knight', 'rat'];
  G.state.formId = 'knight';
  G.state.worldwake.marks = ['sky', 'stone'];
  G.attuneWorldMark('sky');
  const quest = G.forms.rat.quests.find(q => q.match?.ability === 'bite');
  G.prepareMasteryLesson(quest.id, 1);
  G.saveMixRecipe('knight', 2);
  return { ...r, quest };
}

test('a folded build restores its body, arts, Mark and lesson after save serialization', () => {
  const { G, quest } = fixture();
  G.saveGame();
  const save = G.loadSaveData();
  assert.equal(save.mixRecipes.knight[2].mark, 'sky');
  assert.equal(save.mixRecipes.knight[2].lesson, quest.id);
  G.state.mixRecipes = G.normalizeMixRecipes(JSON.parse(JSON.stringify(save.mixRecipes)));
  G.setForm('rat');
  G.attuneWorldMark('stone');
  G.state.lessonQuestId = null;
  G.restoreDefaultLoadout('knight');
  const mana = G.state.player.mana;
  assert.equal(G.recallMixRecipe('knight', 2), true);
  assert.equal(G.state.formId, 'knight');
  assert.equal(G.getLoadout('knight')[0], G.forms.knight.basic);
  assert.equal(G.getLoadout('knight')[1], 'bite');
  assert.equal(G.activeWorldMarkDiscipline().id, 'sky');
  assert.equal(G.state.lessonQuestId, quest.id);
  assert.equal(G.state.player.mana, mana);
  G.events.emit('hit', { ability: 'bite' });
  assert.equal(G.questProgress(quest), 1, 'the recalled borrowed art advances the source lesson');
});

test('missing Marks and blocked form changes reject a whole build without partial changes', () => {
  const { G, quest } = fixture();
  G.setForm('rat'); G.attuneWorldMark('stone');
  G.state.worldwake.marks = ['stone'];
  const before = JSON.stringify(G.state.loadouts);
  assert.equal(G.mixRecipeDetails('knight', 2).ready, false);
  assert.match(G.mixRecipeDetails('knight', 2).reason, /World Mark/);
  assert.equal(G.recallMixRecipe('knight', 2), false);
  assert.equal(G.state.formId, 'rat');
  assert.equal(G.activeWorldMarkDiscipline().id, 'stone');
  assert.equal(G.state.lessonQuestId, quest.id);
  assert.equal(JSON.stringify(G.state.loadouts), before);
  G.state.worldwake.marks.push('sky');
  G.state.player.performance = { ability: 'bite', fired: false };
  assert.equal(G.recallMixRecipe('knight', 2), false);
  assert.equal(G.state.formId, 'rat');
  assert.equal(G.activeWorldMarkDiscipline().id, 'stone');
  assert.equal(JSON.stringify(G.state.loadouts), before);
});

test('arts-only cards preserve old behavior; completed lessons and no-Mark builds recall cleanly', () => {
  const { G, quest } = fixture();
  const arts = [...G.getLoadout('knight')];
  G.state.mixRecipes = G.normalizeMixRecipes({ knight: [arts] });
  G.setForm('rat'); G.attuneWorldMark('stone');
  assert.equal(G.recallMixRecipe('knight', 0), true);
  assert.equal(G.state.formId, 'rat');
  assert.equal(G.activeWorldMarkDiscipline().id, 'stone');
  assert.equal(G.state.lessonQuestId, quest.id);
  G.setForm('knight'); G.attuneWorldMark(null);
  G.saveMixRecipe('knight', 1);
  G.questsDone.push(quest.id);
  G.attuneWorldMark('sky');
  assert.equal(G.recallMixRecipe('knight', 1), true);
  assert.equal(G.activeWorldMarkDiscipline(), null);
  assert.equal(G.state.lessonQuestId, null, 'a completed lesson returns to automatic field mastery');
});

test('experiment backups distinguish the same arts with different carried Marks', () => {
  const { G } = fixture();
  G.restoreDefaultLoadout('knight'); G.attuneWorldMark('stone');
  const quest = G.forms.rat.quests.find(q => q.match?.ability === 'bite');
  assert.equal(G.prepareMasteryLesson(quest.id, 1), true);
  assert.equal(G.mixRecipes('knight')[0].mark, 'sky');
  assert.equal(G.mixRecipes('knight')[1].mark, 'stone');
  const clean = G.normalizeMixRecipes({ knight: [{ version: 2, arts: ['fake', 'missing'], mark: 'fake', lesson: 'missing' }] });
  G.state.mixRecipes = clean;
  assert.equal(G.mixRecipeDetails('knight', 0).ready, false);
  assert.equal(clean.knight[0].arts[0], G.forms.knight.basic);
});

test('a card carries only lessons its saved form and arts can practice', () => {
  const { G } = fixture();
  G.state.claimedForms.push('wizard', 'golem', 'ranger');
  G.state.lessonQuestId = G.forms.knight.quests[0].id;
  G.saveMixRecipe('rat', 1);
  assert.equal(G.mixRecipes('rat')[1].lesson, null, 'Knight guard practice does not follow a Rat build');
  G.state.loadouts.knight = ['slash', 'bite', 'arrow'];
  G.state.lessonQuestId = G.forms.golem.quests[3].id;
  G.saveMixRecipe('knight', 1);
  assert.equal(G.mixRecipes('knight')[1].lesson, null, 'Blunt ward practice needs a saved Blunt art');
  G.state.loadouts.knight[2] = 'stoneKnuckle';
  G.saveMixRecipe('knight', 1);
  assert.equal(G.mixRecipes('knight')[1].lesson, G.forms.golem.quests[3].id);
});
