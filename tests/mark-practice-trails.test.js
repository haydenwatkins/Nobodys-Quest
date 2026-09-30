const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

function fixture() {
  const r = runtime(), { G } = r;
  G.state.opening.complete = true; G.state.delivery.complete = true; G.state.stars = 70;
  G.state.claimedForms = ['rat', 'wizard', 'stormcaller'];
  G.questsDone = [G.forms.rat.quests[0].id];
  G.state.worldwake.marks = G.WORLD_MARK_DISCIPLINES.map(mark => mark.id);
  r.load('overworld'); r.drain();
  return r;
}

test('an explicitly traced Mark carries its discipline, persists, and respects earned and completed roads', () => {
  const { G } = fixture(), p = G.state.player;
  const before = JSON.stringify({ x:p.x,y:p.y,hurt:p.damageTaken,mana:p.mana,arts:G.getLoadout('nobody') });
  assert.equal(G.followWorldMarkPractice('fake'), false);
  G.ensureTown().followedRequest = 'beacon';
  assert.equal(G.followWorldMarkPractice('sky'), true);
  assert.equal(G.activeWorldMarkDiscipline().id, 'sky');
  assert.equal(G.followedWorldMarkPractice().id, 'sky');
  assert.equal(G.followedSunriseRequest(), null);
  assert.equal(JSON.stringify({ x:p.x,y:p.y,hurt:p.damageTaken,mana:p.mana,arts:G.getLoadout('nobody') }), before);
  G.saveGame();
  const save = G.loadSaveData();
  assert.equal(G.normalizeWorldwake(save.worldwake, save).practiceMark, 'sky');
  assert.equal(G.normalizeWorldwake(undefined, {items:['trophy-sky-sovereign']}).practiceMark, null);
  assert.equal(G.normalizeWorldwake({marks:['sky'],attunedMark:'sky',practiceMark:'heart'}, {}).practiceMark, null);
  assert.equal(G.normalizeWorldwake({marks:['sky'],attunedMark:'sky',practiceMark:'sky',markPractices:['sky']}, {}).practiceMark, null);
  assert.equal(G.normalizeWorldwake({marks:['sky'],attunedMark:'sky',practiceMark:'sky',favorsDone:['roadLessons']}, {}).practiceMark, null);
  assert.equal(G.followWorldMarkPractice(null), true);
  G.state.worldwake.markPractices.push('sky');
  assert.equal(G.followWorldMarkPractice('sky'), false);
  G.state.worldwake.marks = ['sky'];
  assert.equal(G.followWorldMarkPractice('stone'), false);
  G.state.worldwake.marks.push('stone'); G.state.worldwake.favorsDone.push('roadLessons');
  assert.equal(G.followWorldMarkPractice('stone'), false);
});

test('each restored region offers a real style lead, with missing arts and empty roads explained', () => {
  for (const mark of GRegistry()) {
    const r = fixture(), { G } = r;
    G.followWorldMarkPractice(mark.id);
    let target = G.guidanceTarget();
    assert.ok(target.cell?.portal || target.link, `${mark.id} has a road from Greenfield`);
    assert.match(target.text, /caravan field note/);
    const source = Object.values(G.WORLDWAKE_MARKS).find(entry => entry.id === mark.id);
    r.load(source.region); r.drain();
    const styles = mark.style.toLowerCase().split(' + ');
    const art = G.availableAbilities().find(id => styles.includes(G.abilities[id].style));
    assert.ok(art, 'the fixture has an earned art for this Mark');
    G.getLoadout('nobody')[1] = art;
    const e = G.makeEnemy('slime', G.state.player.x + 40, G.state.player.y); e.hp = 50;
    G.state.enemies = [e];
    target = G.guidanceTarget();
    assert.equal(target.entity, e); assert.match(target.text, /One real hit/);
    const wrong = styles.includes('melee') ? 'shadowBolt' : 'slap';
    G.combat.damageEnemy(e, {ability:wrong,damage:1,type:G.abilities[wrong].type,knockback:0});
    assert.equal(G.followedWorldMarkPractice().id, mark.id);
    G.combat.damageEnemy(e, {ability:art,damage:1,type:G.abilities[art].type,knockback:0});
    assert.equal(G.followedWorldMarkPractice(), null);
    assert.ok(G.state.worldwake.markPractices.includes(mark.id));
    assert.ok(!G.guidanceTarget()?.text.includes('One real hit'), 'normal campaign guidance resumes');
  }
  function GRegistry() { return fixture().G.WORLD_MARK_DISCIPLINES; }
});

test('trace selection explains missing arts and yields to a new lesson or town promise', () => {
  const r = fixture(), { G } = r;
  G.followWorldMarkPractice('echo'); r.load('frostbellTundra'); r.drain();
  G.restoreDefaultLoadout('nobody');
  assert.equal(G.guidanceTarget().spatial, false);
  assert.match(G.guidanceTarget().text, /borrow Chain Lightning/);
  const earned = G.availableAbilities;
  G.availableAbilities = () => ['slap'];
  assert.match(G.guidanceTarget().text, /awakening paths in Form Lab/);
  G.availableAbilities = earned;
  G.getLoadout('nobody')[1] = 'chainLightning'; G.state.enemies = [];
  assert.match(G.guidanceTarget().text, /leave and return/);
  G.state.expeditionRun = {active:true};
  assert.equal(G.followedWorldMarkPractice(), null);
  assert.equal(G.followWorldMarkPractice(null), false, 'a run cannot alter the campaign choice');
  G.state.expeditionRun = null;
  assert.equal(G.prepareMasteryLesson(G.forms.rat.quests[2].id, 1), true);
  assert.equal(G.followedWorldMarkPractice(), null);
  G.followWorldMarkPractice('stone'); G.followSunriseRequest('beacon');
  assert.equal(G.followedWorldMarkPractice(), null);
  G.followWorldMarkPractice('sky'); G.attuneWorldMark('stone');
  assert.equal(G.followedWorldMarkPractice(), null);
});

test('Journey names the optional traced road and retires its card when the note is written', () => {
  const r = fixture(), { G } = r;
  G.followWorldMarkPractice('stone');
  r.run('js/engine/ui.js'); G.ui.openMenu();
  assert.ok(r.nodes.get('menu').innerHTML.includes('Trace Patient Stone home'));
  assert.ok(r.nodes.get('menu').innerHTML.includes('CARAVAN FIELD NOTES'));
  G.followWorldMarkPractice(null); G.ui.openMenu();
  assert.ok(!r.nodes.get('menu').innerHTML.includes('Trace Patient Stone home'));
});
