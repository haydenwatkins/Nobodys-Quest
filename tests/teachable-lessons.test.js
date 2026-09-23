const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

for (const [formId, questIndex, artId, event] of [
  ['rat', 0, 'bite', { status: 'poison' }],
  ['rat', 1, 'bite', { poisoned: true }],
  ['ranger', 0, 'arrow', { dist: 110 }],
  ['druid', 1, 'thornLash', { status: 'poison' }],
  ['weaver', 2, 'cocoonField', { status: 'stun' }],
]) {
  test(`${formId} lesson ${questIndex + 1} can be followed with a learned teaching art`, () => {
    const r = runtime(), { G } = r;
    G.state.opening.complete = true;
    G.state.claimedForms = G.formOrder.filter(id => id !== 'nobody' && id !== 'god');
    G.questsDone = G.forms[formId].quests.slice(0, questIndex).map(quest => quest.id);
    r.load('overworld'); r.drain();
    const quest = G.forms[formId].quests[questIndex];
    const lesson = G.masteryLessons(Infinity, formId).find(entry => entry.quest.id === quest.id);
    assert.equal(lesson?.ability, artId);
    assert.equal(G.prepareMasteryLesson(quest.id, 1), true);
    assert.equal(G.getLoadout('nobody')[1], artId);
    assert.equal(G.fieldMasteryQuest().quest.id, quest.id);
    G.events.emit(quest.event, event);
    assert.equal(G.questProgress(quest), 1);
    G.restoreDefaultLoadout('nobody');
    assert.notEqual(G.fieldMasteryQuest()?.quest.id, quest.id, 'an unequipped teaching art is no longer active');
  });
}
