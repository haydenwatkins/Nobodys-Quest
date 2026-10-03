const { test } = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

test('real health/mana drops preserve healing, caps, collection and lifetime while explaining their effect', () => {
  const r = runtime(), { G } = r; r.load('town'); r.drain();
  const p = G.state.player, notices = []; G.ui.toast = text => notices.push(text);
  p.damageTaken = 2; p.mana = 0;
  G.state.pickups = [{ kind: 'heart', x: p.x, y: p.y, t: 0 }, { kind: 'mana', x: p.x, y: p.y, t: 0 }];
  G.updatePickups(.01);
  assert.equal(p.damageTaken, 1); assert.equal(p.mana, 3); assert.equal(G.state.pickups.length, 0);
  assert.ok(notices.includes('Heart restored')); assert.ok(notices.includes('Mana restored'));
  p.damageTaken = 0; p.mana = p.manaMax;
  G.state.pickups = [{ kind: 'heart', x: p.x, y: p.y, t: 0 }, { kind: 'mana', x: p.x, y: p.y, t: 0 }];
  G.updatePickups(.01); assert.equal(p.damageTaken, 0); assert.equal(p.mana, p.manaMax);
  assert.ok(notices.includes('Hearts full')); assert.ok(notices.includes('Mana full'));
  G.state.pickups = [{ kind: 'heart', x: p.x + 100, y: p.y, t: 11.99 }]; G.updatePickups(.02);
  assert.equal(G.state.pickups.length, 0, 'the existing ordinary-drop expiry remains');
});

test('both settings use grounded pickup art and quiet drawing avoids bob/blink without mutating drops', () => {
  const { G } = runtime(), draws = [], c = new Proxy({ globalAlpha: 1 }, { get: (o, k) => o[k] ?? (() => {}), set: (o, k, v) => (o[k] = v, true) });
  G.drawSprite = (ctx, sprite, frame, x, y) => draws.push({ sprite, frame, x, y });
  for (const kind of ['heart', 'mana']) for (const hd of [true, false]) {
    G.hdPilot = hd; const sprite = G.pickupArt[kind], active = G.activeSpriteDefinition(sprite);
    assert.equal(G.spriteMetrics(sprite).w, 12); assert.equal(G.spriteMetrics(sprite).h, 12);
    for (const frame of active.frames) for (const row of frame) for (const pixel of row) assert.ok(pixel === '.' || active.palette[pixel]);
    G.reducedMotion = true; const pickup = { kind, x: 150, y: 120, t: 9.1 }; G.state.pickups = [pickup];
    const before = JSON.stringify(pickup); draws.length = 0; G.drawPickups(c);
    assert.equal(JSON.stringify(pickup), before); assert.equal(draws.length, 1);
    assert.equal(draws[0].sprite, sprite); assert.equal(draws[0].frame, 0); assert.equal(draws[0].y, 121);
  }
});
