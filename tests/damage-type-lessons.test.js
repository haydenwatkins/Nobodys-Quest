const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

test('damage-type finishing quests offer earned arts that really advance mastery', () => {
  const r = runtime(), { G } = r;
  G.state.claimedForms = G.formOrder.filter(id => id !== 'nobody' && id !== 'god');
  G.questsDone = G.formOrder.filter(id => id !== 'god')
    .flatMap(id => G.forms[id].quests.slice(0, 3).map(quest => quest.id));
  r.load('overworld'); r.drain();
  for (const id of ['frog', 'griffin', 'weaver', 'lanternWisp', 'colossus']) {
    const entry = G.masteryLessons(Infinity, id)[0];
    assert.equal(entry?.quest.id, G.forms[id].quests[3].id, `${id} has a followable final lesson`);
    assert.equal(G.abilities[entry.ability].type, entry.quest.match.damageType);
  }

  const griffin = G.forms.griffin.quests[3];
  const art = G.masteryLessons(Infinity, 'griffin')[0].ability;
  assert.equal(G.prepareMasteryLesson(griffin.id, 1), true);
  assert.equal(G.getLoadout('nobody')[1], art);
  assert.equal(G.fieldMasteryQuest().quest.id, griffin.id);
  const stars = G.state.stars;
  G.events.emit('kill', { ability: art, damageType: 'blunt' });
  assert.equal(G.questProgress(griffin), 0);
  for (let i = 0; i < griffin.count; i++) G.events.emit('kill', { ability: art, damageType: 'sharp' });
  assert.equal(G.formLevel('griffin'), 5);
  assert.equal(G.state.stars, stars + 1);
  assert.ok(G.questsDone.includes(griffin.id));

  const original = G.availableAbilities;
  G.availableAbilities = () => ['slap'];
  assert.equal(G.masteryLessons(Infinity, 'weaver').length, 0, 'an unearned Dark art is not offered');
  G.availableAbilities = original;
});
