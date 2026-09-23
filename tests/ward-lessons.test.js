const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

function specialist(id) {
  const r = runtime(), { G } = r;
  G.state.opening.complete = true;
  G.state.delivery.complete = true;
  G.state.stars = 70;
  G.state.worldwake.marks = ['sky', 'stone', 'thread', 'echo', 'light', 'heart'];
  G.state.claimedForms = G.formOrder.filter(form => form !== 'nobody' && form !== 'god');
  G.questsDone = G.formOrder.filter(form => form !== 'god')
    .flatMap(form => G.forms[form].quests.slice(0, 3).map(quest => quest.id));
  r.load('overworld'); r.drain();
  const quest = G.forms[id].quests[3];
  const lesson = G.masteryLessons(Infinity, id)[0];
  assert.equal(lesson?.quest.id, quest.id);
  assert.equal(G.abilities[lesson.ability].type, quest.match.damageType);
  assert.equal(G.prepareMasteryLesson(quest.id, 1), true);
  assert.equal(G.storyGoal().questId, quest.id);
  assert.ok(G.getLoadout(G.state.formId).includes(lesson.ability));
  return { r, G, quest, lesson };
}

for (const [formId, enemyId] of [['golem', 'tideCrab'], ['bellkeeper', 'starMote']]) {
  test(`${formId} can follow a real ward-breaking specialty from road to fight`, () => {
    const { r, G, quest, lesson } = specialist(formId);
    G.state.enemies = [];
    let guide = G.guidanceTarget();
    assert.equal(guide.cell.portal.map, 'shattercoast');
    assert.match(guide.text, new RegExp(enemyId === 'tideCrab' ? 'Tide Crabs' : 'Star Motes'));

    r.load('shattercoast'); r.drain();
    assert.ok(G.state.enemies.some(enemy => enemy.id === enemyId), 'the named coastal practice foe exists');
    guide = G.guidanceTarget();
    assert.ok(guide.ward?.hp > 0, 'the trail picks a warded foe rather than an arbitrary creature');
    assert.ok(guide.ward.types.includes(quest.match.damageType));
    const wrong = quest.match.damageType === 'blunt' ? 'sharp' : 'blunt';
    G.combat.damageEnemy(guide, { ability: wrong === 'sharp' ? 'bite' : 'slap', type: wrong, damage: 3, knockback: 0 });
    assert.equal(G.questProgress(quest), 0);
    G.combat.damageEnemy(guide, { ability: lesson.ability, type: quest.match.damageType, damage: 3, knockback: 0 });
    assert.equal(G.questProgress(quest), 1);
    G.state.enemies = [];
    assert.match(G.guidanceTarget().text, /Leave and return/);
    r.load('overworld'); r.drain(); r.load('shattercoast'); r.drain();
    assert.ok(G.state.enemies.some(enemy => enemy.id === enemyId && enemy.ward?.hp > 0), 'zone return restores a matching ward');
    for (let i = 1; i < quest.count; i++) G.events.emit('wardBreak', { ability: lesson.ability, damageType: quest.match.damageType });
    assert.equal(G.formLevel(formId), 5);
    assert.ok(G.questsDone.includes(quest.id));
  });
}

test('an unearned matching art never creates a false ward lesson', () => {
  const { G } = specialist('bellkeeper');
  G.restoreDefaultLoadout('nobody');
  assert.equal(G.guidanceTarget().spatial, false);
  assert.match(G.guidanceTarget().text, /equip .*\./);
  G.availableAbilities = () => ['slap'];
  assert.equal(G.masteryLessons(Infinity, 'bellkeeper').length, 0);
});

test('Wizard learns to break accessible Dark wards before the Worldwake road', () => {
  const r = runtime(), { G } = r;
  G.state.opening.complete = true;
  G.state.stars = 5;
  G.state.claimedForms = ['rat', 'wizard'];
  G.questsDone = [G.forms.wizard.quests[0].id];
  r.load('overworld'); r.drain();
  const quest = G.forms.wizard.quests[1];
  const lesson = G.masteryLessons(Infinity, 'wizard').find(entry => entry.quest.id === quest.id);
  assert.equal(lesson?.ability, 'curse');
  assert.equal(G.prepareMasteryLesson(quest.id, 1), true);
  G.storyGoal = () => ({ guide: 'mastery', formId: 'wizard', questId: quest.id });
  let guide = G.guidanceTarget();
  assert.equal(guide.cell.portal.map, 'sunkenMarsh');
  assert.match(guide.text, /Shades/);
  r.load('sunkenMarsh'); r.drain();
  guide = G.guidanceTarget();
  assert.equal(guide.id, 'shade');
  G.combat.damageEnemy(guide, { ability: 'curse', type: 'dark', damage: 2, knockback: 0 });
  assert.equal(G.questProgress(quest), 1);
});
