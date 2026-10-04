const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

function fixture() {
  const r = runtime(), { G } = r;
  r.load('emberRidge'); r.drain();
  G.state.opening.complete = true;
  G.state.enemies = []; G.state.projectiles = [];
  G.state.items.push(...G.KEEPSAKES.map(k => k.item));
  Object.assign(G.state.player, { x: 160, y: 144, dir: { x: 1, y: 0 }, manaRegenDelay: 100 });
  return r;
}
function foe(G, dx = 16, dy = 0) {
  const e = G.makeEnemy('slime', G.state.player.x + dx, G.state.player.y + dy);
  e.hp = 50; G.state.enemies.push(e); return e;
}

test('guardian keepsakes are optional, owned by trophies, and saved without silently changing old builds', () => {
  const { G } = fixture();
  assert.equal(G.activeKeepsake(), null);
  assert.equal(G.normalizeKeepsake(undefined, G.state.items), null);
  assert.equal(G.normalizeKeepsake('missing', G.state.items), null);
  assert.equal(G.normalizeKeepsake('mire', []), null);
  G.state.items = [];
  assert.equal(G.carryKeepsake('mire'), false);
  const pearl = G.KEEPSAKES.find(k => k.id === 'mire');
  G.state.items.push(pearl.item); G.events.emit('pickup', { item: pearl.item });
  assert.equal(G.carryKeepsake('mire'), true);
  assert.equal(G.activeKeepsake().id, 'mire');
  G.saveGame();
  const save = G.loadSaveData();
  assert.equal(G.normalizeKeepsake(save.keepsakeId, save.items), 'mire');
  assert.equal(G.carryKeepsake(null), true);
  assert.equal(G.activeKeepsake(), null);
});

test('Heartwood actually reaches an extra foe while paying for it in walking speed', () => {
  const { G } = fixture(), p = G.state.player;
  const angle = Math.PI / 3, e = foe(G, Math.cos(angle) * 20, Math.sin(angle) * 20);
  const swing = { ability: 'slap', type: 'blunt', damage: 1, range: 25, arcDeg: 110, knockback: 0, contactAssist: false, lunge: 0 };
  G.combat.meleeArc(p, swing);
  assert.equal(e.hp, 50);
  G.carryKeepsake('heartwood');
  G.combat.meleeArc(p, swing);
  assert.equal(e.hp, 49);
  G.state.enemies = [];
  G.input.vec = { x: 1, y: 0 };
  const x = p.x;
  G.updatePlayer(.05);
  const weighted = p.x - x;
  p.x = x; G.carryKeepsake(null); G.updatePlayer(.05);
  assert.ok(Math.abs(weighted / (p.x - x) - .9) < .0001);
  const normalDash = G.passives.prepare('dash', p, { ability: 'cartwheel', dist: 55 }).dist;
  G.carryKeepsake('heartwood');
  assert.equal(G.passives.prepare('dash', p, { ability: 'cartwheel', dist: 55 }).dist, normalDash);
  G.state.worldwake.marks.push('stone'); G.attuneWorldMark('stone');
  assert.equal(G.passives.prepare('melee', p, swing).arcDeg, 155, 'Mark and keepsake combine, with the walking price intact');
});

test('Mire extends real poison, preserves ward protection, and charges its price at the input boundary', () => {
  const r = fixture(), { G } = r, p = G.state.player, e = foe(G);
  G.carryKeepsake('mire');
  G.abilities.bite.use(p);
  assert.ok(Math.abs(e.status.poison.dur - 4.2) < .0001);
  const warded = foe(G); warded.ward = { types: ['sharp'], hp: 10 };
  G.abilities.bite.use(p);
  assert.equal(warded.status?.poison, undefined);
  assert.equal(G.abilityManaCost(G.abilities.bite), 0);
  G.questsDone.push(G.forms.nobody.quests[0].id);
  G.state.loadouts.nobody = ['slap', 'cartwheel'];
  p.mana = 2; r.taps.add('b'); G.updatePlayer(.02);
  assert.equal(p.mana, 2);
  assert.equal(p.cooldowns.cartwheel || 0, 0, 'the art cannot start on its old cheaper cost');
  p.mana = 3; r.taps.add('b'); G.updatePlayer(.02);
  assert.equal(p.mana, 0);
  assert.ok(p.cooldowns.cartwheel > 0);
  G.state.claimedForms.push('wizard'); G.state.formId = 'wizard';
  const opts = G.passives.prepare('projectile', p, { ability: 'curse', status: { name: 'poison', dur: 2 } });
  assert.ok(Math.abs(opts.status.dur - 2 * 1.45 * 1.4) < .0001, 'Hexcraft combines with the Pearl');
  const hostile = G.passives.prepare('projectile', e, { ability: 'curse', status: { name: 'poison', dur: 2 } });
  assert.equal(hostile.status.dur, 2, 'the player keepsake does not enhance enemy attacks');
});

test('Eclipse pays for extra capacity with slower real regeneration and never refills on switching', () => {
  const { G } = fixture(), p = G.state.player;
  p.mana = 4; const damage = p.damageTaken;
  G.carryKeepsake('eclipse');
  assert.equal(p.manaMax, 16);
  assert.equal(p.mana, 4);
  p.manaRegenDelay = 0;
  G.updatePlayer(.7);
  assert.equal(p.mana, 4);
  G.updatePlayer(.2);
  assert.equal(p.mana, 5);
  p.mana = 16; G.carryKeepsake(null);
  assert.equal(p.mana, 12);
  G.carryKeepsake('eclipse');
  assert.equal(p.mana, 12);
  assert.equal(p.damageTaken, damage);
  G.state.items.push('manyfold-crown');
  assert.equal(G.playerMaxMana(), 18, 'the existing earned reservoir remains available');
});

test('new recipe cards restore keepsakes atomically; older cards retain their meaning', () => {
  const { G } = fixture();
  G.state.claimedForms.push('knight');
  G.carryKeepsake('mire'); G.saveMixRecipe('knight', 0);
  G.state.mixRecipes = G.normalizeMixRecipes(G.loadSaveData().mixRecipes);
  assert.equal(G.mixRecipeDetails('knight', 0).keepsake.id, 'mire');
  G.carryKeepsake('heartwood');
  G.state.items = G.state.items.filter(item => item !== 'trophy-mire-pearl');
  assert.equal(G.recallMixRecipe('knight', 0), false);
  assert.equal(G.state.formId, 'nobody');
  assert.equal(G.activeKeepsake().id, 'heartwood');
  assert.match(G.mixRecipeDetails('knight', 0).reason, /keepsake/);
  G.state.items.push('trophy-mire-pearl');
  assert.equal(G.recallMixRecipe('knight', 0), true);
  assert.equal(G.state.formId, 'knight');
  assert.equal(G.activeKeepsake().id, 'mire');
  G.state.mixRecipes.knight[1] = { version: 2, arts: [...G.getLoadout('knight')], mark: null, lesson: null };
  G.carryKeepsake('eclipse');
  assert.equal(G.recallMixRecipe('knight', 1), true);
  assert.equal(G.activeKeepsake().id, 'eclipse', 'a pre-keepsake card must not silently remove it');
  G.carryKeepsake(null); G.saveMixRecipe('knight', 2);
  G.carryKeepsake('mire'); G.recallMixRecipe('knight', 2);
  assert.equal(G.activeKeepsake(), null, 'a new travel-light card explicitly sets the keepsake aside');
});

test('lesson experiments keep separate backups for different keepsake tradeoffs', () => {
  const { G } = fixture();
  G.state.claimedForms.push('knight', 'rat'); G.state.formId = 'knight';
  const quest = G.forms.rat.quests.find(q => q.match?.ability === 'bite');
  G.carryKeepsake('heartwood'); G.saveMixRecipe('knight', 0);
  G.carryKeepsake('mire');
  G.keepCurrentMixRecipe('knight');assert.equal(G.prepareMasteryLesson(quest.id,1),true);
  assert.equal(G.state.formId,'rat');assert.equal(G.mixRecipeDetails('knight', 0).keepsake.id, 'heartwood');
  assert.equal(G.mixRecipeDetails('knight', 1).keepsake.id, 'mire');
});
