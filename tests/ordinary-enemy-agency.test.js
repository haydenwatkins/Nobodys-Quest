const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

function fixture(id = 'thornling') {
  const r = runtime(), { G } = r;
  r.load('emberRidge'); r.drain();
  G.state.opening.complete = true;
  G.state.enemies = []; G.state.projectiles = [];
  Object.assign(G.state.player, { x: 160, y: 144, dir: { x: 1, y: 0 }, mana: 0, manaRegenDelay: 100 });
  const e = G.makeEnemy(id, 224, 144); e.shootT = 0;
  G.state.enemies.push(e);
  return { ...r, e };
}

test('all seven ordinary caster families warn, commit to a place and recover without chasing it', () => {
  const r = fixture(), { G } = r, p = G.state.player;
  const casters = Object.values(G.enemies).filter(e => !e.miniboss && e.behavior === 'shooter');
  assert.equal(casters.length, 7);
  for (const def of casters) {
    const e = G.makeEnemy(def.id, 224, 144); e.shootT = 0;
    G.state.enemies = [e]; G.state.projectiles = []; p.x = 160; p.y = 144;
    G.updateEnemies(.02);
    assert.equal(G.state.projectiles.length, 0, def.id);
    assert.ok(e.shotTell?.left >= .6, `${def.id} offers a full warning`);
    const duration = e.shotTell.duration, target = { x: e.shotTell.x, y: e.shotTell.y };
    p.y += 40; G.updateEnemies(duration - .02);
    assert.equal(G.state.projectiles.length, 0, 'the cast cannot release early');
    assert.equal(e.shotTell.x, target.x); assert.equal(e.shotTell.y, target.y);
    assert.equal(e.x, 224); assert.equal(e.y, 144);
    G.updateEnemies(.03);
    const shot = G.state.projectiles[0];
    assert.ok(shot && !shot.fromPlayer && shot.owner === e);
    assert.ok(Math.abs(Math.atan2(shot.vy, shot.vx) - G.util.angleTo(e.x, e.y - 6, target.x, target.y)) < .0001);
    assert.ok(e.shotRecoverT >= .45);
    G.updateEnemies(.3); assert.equal(e.x, 224); assert.equal(e.y, 144);
    assert.equal(G.state.projectiles.length, 1, 'recovery cannot cast another shot');
    let crossed = false;
    for (let i = 0; i < 20; i++) {
      G.combat.updateProjectiles(.05);
      crossed ||= G.state.projectiles.some(pr => pr.owner === e && G.util.dist(pr.x, pr.y, target.x, target.y) < 8);
    }
    assert.ok(crossed, 'the actual shot reaches the old target; terrain did not manufacture a safe dodge');
    assert.equal(p.damageTaken, 0, 'ordinary sideways walking avoids the committed shot');
  }
});

test('free landed melee interrupts a real cast and buys an opening at zero mana', () => {
  const { G, e } = fixture(); const p = G.state.player;
  G.updateEnemies(.02); p.x = e.x - 18;
  const hp = e.hp; G.abilities.slap.use(p);
  assert.equal(e.shotTell, null); assert.ok(e.hp < hp); assert.ok(e.shotRecoverT >= .45);
  assert.ok(p.mana > 0, 'the successful basic replenishes an answer');
  G.updateEnemies(.3); assert.equal(G.state.projectiles.length, 0);
  assert.ok(e.shotRecoverT > 0);
});

test('wrong wards and partial chips preserve a cast; breaking the right ward interrupts it', () => {
  const { G, e } = fixture('shade');
  G.updateEnemies(.02); const tell = e.shotTell;
  const hit = type => G.combat.damageEnemy(e, { ability: null, damage: 1, type, knockback: 0 });
  assert.equal(hit('blunt'), false); assert.equal(e.shotTell, tell); assert.equal(e.ward.hp, 2);
  hit('dark'); assert.equal(e.shotTell, tell); assert.equal(e.ward.hp, 1);
  hit('dark'); assert.equal(e.shotTell, null); assert.equal(e.ward.hp, 0);
  assert.equal(e.hp, e.def.hp, 'ward breaking does not invent health damage');
  assert.ok(e.shotRecoverT >= .45); G.updateEnemies(.3);
  assert.equal(G.state.projectiles.length, 0);
});

test('stun cancels pending casts immediately and safely pauses contact across the ordinary roster', () => {
  const { G, e } = fixture();
  G.updateEnemies(.02); G.combat.applyStatus(e, 'stun', { dur: .5 });
  assert.equal(e.shotTell, null, 'stunning after the enemy turn clears its warning immediately');
  const ordinary = Object.values(G.enemies).filter(def => !def.miniboss && !def.practice);
  for (const def of ordinary) {
    const foe = G.makeEnemy(def.id, 160, 144); G.state.enemies = [foe];
    G.state.player.damageTaken = 0; G.state.player.invuln = 0;
    G.state.player.x = 160; G.state.player.y = 144;
    G.combat.applyStatus(foe, 'stun', { dur: .5 });
    G.updateEnemies(.2); assert.equal(G.state.player.damageTaken, 0, def.id);
    assert.equal(foe.x, 160); assert.equal(foe.y, 144);
  }
  const slime = G.makeEnemy('slime', 160, 144); G.state.enemies = [slime];
  G.combat.applyStatus(slime, 'stun', { dur: .1 }); G.updateEnemies(.2);
  assert.equal(G.state.player.damageTaken, 1, 'ordinary danger resumes after the stun, rather than permanently pacifying a foe');
});

test('casters wait for an unobstructed view, and world travel discards old commitments', () => {
  const { G, e } = fixture();
  const original = G.combat.clearArc; G.combat.clearArc = () => false;
  G.updateEnemies(.02); assert.equal(e.shotTell, null); assert.equal(G.state.projectiles.length, 0);
  G.combat.clearArc = original; G.updateEnemies(.02); assert.ok(e.shotTell);
  G.world.load('town'); G.updateEnemies(1);
  assert.equal(G.state.enemies.includes(e), false);
  assert.equal(G.state.projectiles.some(p => p.owner === e), false);
});
