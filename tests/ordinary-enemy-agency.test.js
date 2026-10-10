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

test('all seven ordinary ranged families fire on their native cooldown at the current player position', () => {
  const r = fixture(), { G } = r, p = G.state.player;
  const casters = Object.values(G.enemies).filter(e => !e.miniboss && e.behavior === 'shooter');
  assert.equal(casters.length, 7);
  for (const def of casters) {
    const e = G.makeEnemy(def.id, 224, 144); e.shootT = 0;
    G.state.enemies = [e]; G.state.projectiles = []; p.x = 160; p.y = 144;
    G.updateEnemies(.02);
    assert.equal(G.state.projectiles.length, 1, def.id + ' fires without a stop-and-aim phase');
    const first = G.state.projectiles[0];
    assert.equal(first.size, 3); assert.equal(first.damage, def.damage || 1);
    assert.equal(first.speed, def.projectileSpeed || 90);
    assert.ok(Math.abs(first.vy) < .0001); assert.ok(first.vx < 0);
    p.y += 35; e.shootT = .1; G.updateEnemies(.05);
    assert.equal(G.state.projectiles.length, 1, 'the ordinary cooldown still holds');
    G.updateEnemies(.06);
    const second = G.state.projectiles[1];
    assert.ok(second, def.id); assert.ok(second.vy > 0, 'the next shot uses the new player position');
    assert.equal(e.shotTell, undefined); assert.equal(e.shotRecoverT, undefined);
  }
});

test('ordinary ranged enemies retreat normally and a free hit never invents a cast-interruption pause', () => {
  const { G, e } = fixture(); const p = G.state.player;
  p.x = e.x - 19; const start = e.x; G.updateEnemies(.02);
  assert.ok(e.x > start, 'retreating movement remains available on the firing beat');
  const shot = G.state.projectiles[0], hp = e.hp; G.abilities.slap.use(p);
  assert.ok(e.hp < hp); assert.ok(p.mana > 0);
  assert.ok(G.state.projectiles.includes(shot), 'an already released shot retains its danger');
  assert.equal(e.shotTell, undefined); assert.equal(e.shotRecoverT, undefined);
});

test('ordinary wards retain their actual type and health protection after the aiming rollback', () => {
  const { G, e } = fixture('shade');
  const hit = type => G.combat.damageEnemy(e, { ability: null, damage: 1, type, knockback: 0 });
  assert.equal(hit('blunt'), false); assert.equal(e.ward.hp, 2);
  hit('dark'); assert.equal(e.ward.hp, 1);
  hit('dark'); assert.equal(e.ward.hp, 0); assert.equal(e.hp, e.def.hp);
  hit('dark'); assert.equal(e.hp, e.def.hp - 1);
});

test('stun still pauses movement, shooting and body danger across the ordinary roster', () => {
  const { G } = fixture();
  const ordinary = Object.values(G.enemies).filter(def => !def.miniboss && !def.practice);
  for (const def of ordinary) {
    const foe = G.makeEnemy(def.id, 160, 144); foe.shootT = 0; G.state.enemies = [foe]; G.state.projectiles = [];
    Object.assign(G.state.player, { damageTaken: 0, invuln: 0, x: 160, y: 144 });
    G.combat.applyStatus(foe, 'stun', { dur: .5 }); G.updateEnemies(.2);
    assert.equal(G.state.player.damageTaken, 0, def.id); assert.equal(foe.x, 160); assert.equal(foe.y, 144);
    assert.equal(G.state.projectiles.length, 0, def.id);
  }
  const slime = G.makeEnemy('slime', 160, 144); G.state.enemies = [slime];
  G.combat.applyStatus(slime, 'stun', { dur: .1 }); G.updateEnemies(.2);
  assert.equal(G.state.player.damageTaken, 1, 'ordinary danger resumes after stun expiry');
});

test('painting hostile projectiles changes neither collision nor simulation state', () => {
  const r = fixture(), { G } = r; G.updateEnemies(.02);
  G.state.projectiles.push(...['riftBlade','card','pie','fault','shell','star','seed','wave'].map((shape,i) => ({ ...G.state.projectiles[0], owner: r.e, shape, x: 170+i*10, y: 120 })));
  G.state.projectiles.push({ ...G.state.projectiles[0], fromPlayer: true, ability: 'arrow', owner: undefined });
  const snapshot = () => JSON.stringify(G.state.projectiles.map(({ owner, ...shot }) => ({ ...shot, owner: owner?.id })));
  const before = snapshot(), c = r.context.document.getElementById('game').getContext('2d');
  for (const hd of [true, false]) { G.hdPilot = hd; G.drawProjectiles(c); assert.equal(snapshot(), before); }
  G.world.load('town'); assert.equal(G.state.projectiles.length, 0);
});
