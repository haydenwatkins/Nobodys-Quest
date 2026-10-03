const { test } = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

test('a native Rampart cast creates a passable circular shot filter that expires and resets on travel', () => {
  const r = runtime(), { G } = r; r.load('town'); r.drain(); G.state.enemies = [];
  let spot;
  for (let y = 3; y < G.state.mapH - 2 && !spot; y++) for (let x = 4; x < G.state.mapW - 4 && !spot; x++) {
    const px = x * 16 + 8, py = y * 16 + 8;
    if ([-40, -24, -8, 8, 24, 40].every(dx => !G.world.solid(px + dx, py) && !G.world.solid(px + dx, py - 8))) spot = { x: px, y: py };
  }
  assert.ok(spot);
  G.state.formId = 'golem'; G.state.loadouts.golem = ['stoneKnuckle', 'rampartPulse', 'rollingMonolith'];
  Object.assign(G.state.player, { x: spot.x - 20, y: spot.y + 5, dir: { x: 1, y: 0 }, mana: G.playerMaxMana() });
  r.taps.add('b'); G.updatePlayer(.01);
  const field = G.state.passiveShelters[0]; assert.ok(field); assert.equal(field.radius, 15); assert.equal(field.t, 3.2);
  for (const actor of [{ x: field.x - 24, y: field.y }, G.makeEnemy('slime', field.x - 24, field.y)]) {
    for (let step = 0; step < 48; step++) G.world.moveBox(actor, 1, 0);
    assert.equal(actor.x, field.x + 24, 'native actor movement crosses the field');
  }
  const shot = (x, fromPlayer) => ({ x, y: field.y, startX: x, startY: field.y, vx: 0, vy: 0, traveled: 0,
    range: 100, life: 10, armT: 0, size: 2, damage: 1, type: 'blunt', fromPlayer, trail: [] });
  const friendly = shot(field.x, true), blocked = shot(field.x + 16, false), outside = shot(field.x + 19, false);
  G.state.projectiles = [friendly, blocked, outside]; G.combat.updateProjectiles(.01);
  assert.ok(G.state.projectiles.includes(friendly)); assert.ok(!G.state.projectiles.includes(blocked));
  assert.ok(G.state.projectiles.includes(outside), 'the unchanged radius plus shot size is respected');
  G.passives.update(3.3); assert.equal(G.state.passiveShelters.length, 0);
  G.state.passiveShelters = [field]; r.load('mistwood'); assert.equal(G.state.passiveShelters.length, 0);
});

test('the open field aligns its art with collision in both settings and fades without changing field state', () => {
  const { G } = runtime(), draws = [], c = new Proxy({ globalAlpha: 1 }, { get: (o, k) => o[k] ?? (() => {}), set: (o, k, v) => (o[k] = v, true) });
  G.drawSprite = (ctx, sprite, frame, x, y, flip, scale) => draws.push({ sprite, frame, x, y, scale, alpha: ctx.globalAlpha });
  const field = { x: 150, y: 120, radius: 15, t: 3.2 }; G.state.passiveShelters = [field];
  for (const hd of [true, false]) for (const quiet of [true, false]) {
    G.hdPilot = hd; G.reducedMotion = quiet;
    const active = G.activeSpriteDefinition(G.rampartScreenArt);
    for (const frame of active.frames) {
      for (const row of frame) for (const pixel of row) assert.ok(pixel === '.' || active.palette[pixel]);
      assert.ok(frame.join('').split('.').length > frame.length * frame[0].length / 2, 'open space dominates the field');
    }
    const before = JSON.stringify(field); draws.length = 0; G.passives.drawFields(c);
    assert.equal(JSON.stringify(field), before); assert.equal(draws[0].sprite, G.rampartScreenArt);
    assert.equal(draws[0].x, field.x); assert.equal(draws[0].y, field.y + 16); assert.equal(draws[0].scale, 1);
    assert.equal(draws[0].alpha, .75); if (quiet) assert.equal(draws[0].frame, 0);
  }
  field.t = .2; draws.length = 0; G.passives.drawFields(c); assert.equal(draws[0].alpha, .1);
});
