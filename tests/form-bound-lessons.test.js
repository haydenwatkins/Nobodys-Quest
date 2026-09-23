const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

test('Knight guard and riposte lessons switch to the form that can perform them', () => {
  const r = runtime(), { G } = r;
  G.state.opening.complete = true;
  G.state.claimedForms = ['knight'];
  r.load('overworld'); r.drain();
  G.getLoadout('nobody')[1] = 'slash';
  const [parry, riposte] = G.forms.knight.quests;
  const lessons = G.masteryLessons(Infinity, 'knight');
  assert.equal(lessons[0].quest.id, parry.id, 'the guard lesson teaches the riposte first');
  assert.ok(lessons.some(entry => entry.quest.id === riposte.id));
  assert.ok(lessons.slice(0, 2).every(entry => entry.requiredForm === 'knight'));
  assert.notEqual(G.fieldMasteryQuest()?.quest.id, riposte.id, 'borrowed Slash cannot produce a Knight riposte');

  G.storyGoal = () => ({ guide: 'mastery', formId: 'knight', questId: riposte.id });
  let guide = G.guidanceTarget();
  assert.equal(guide.spatial, false);
  assert.match(guide.text, /become Knight/);
  assert.equal(G.prepareMasteryLesson(riposte.id, 1), true);
  assert.equal(G.state.formId, 'knight');
  assert.equal(G.getLoadout('knight')[0], 'slash');
  assert.equal(G.state.lessonQuestId, riposte.id);
  assert.equal(G.fieldMasteryQuest().quest.id, riposte.id);
  guide = G.guidanceTarget();
  assert.equal(guide.kind, 'form');
  assert.notEqual(guide.spatial, false);
  assert.match(guide.text, /Oathblade ripostes/);
  G.setForm('nobody');
  assert.notEqual(G.fieldMasteryQuest()?.quest.id, riposte.id, 'the followed form lesson sleeps when Knight is set aside');
  assert.ok(!G.relevantMasteryQuests(Infinity).some(entry => entry.quest.id === G.forms.knight.quests[2].id),
    'an unequipped Shield Advance is not active field mastery');
});

test('a blocked swap cannot silently follow a form-bound lesson', () => {
  const r = runtime(), { G } = r;
  G.state.claimedForms = ['knight'];
  r.load('overworld'); r.drain();
  G.state.player.performance = { ability: 'slash', fired: false };
  const quest = G.forms.knight.quests[0];
  assert.equal(G.prepareMasteryLesson(quest.id, 1), false);
  assert.equal(G.state.formId, 'nobody');
  assert.notEqual(G.state.lessonQuestId, quest.id);
});
