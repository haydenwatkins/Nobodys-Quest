const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

function setup(phase = 1, form = 'colossus', crown = true) {
  const r = runtime(), { G } = r;
  r.load('tollCourt'); r.drain();
  G.state.opening.complete = true; G.state.delivery.started = true;
  G.state.claimedForms.push(form); G.state.formId = form;
  if (crown) {
    G.state.items.push('trophy-heartwood-crown'); G.carryKeepsake('heartwood');
  }
  const e = G.state.enemies.find(e => e.id === 'tollkeeper');
  G.state.enemies = [e]; G.state.bossCutscene = null;
  Object.assign(e, { bossEngaged: true, bossIntroT: 0, bossRecoverT: 0, bossPhase: phase,
    hp: e.def.hp * (phase === 3 ? .3 : phase === 2 ? .6 : 1), openingTimer: 0 });
  return { ...r, e };
}

test('every Tollkeeper flood leaves time to walk from the real entrance, including a weighted slow form', () => {
  for (const phase of [1, 2, 3]) {
    const r = setup(phase), { G, e } = r, p = G.state.player;
    G.updateOrchardBoss(e, p, .01);
    const h = G.state.openingHazards[0], damage = p.damageTaken;
    assert.ok(h.safeRoute.length > 1);
    assert.ok(G.world.isSafeSpawn(h.safePoint.x, h.safePoint.y));
    assert.equal(G.openingHazardHits(h, h.safePoint.x, h.safePoint.y), false);
    assert.ok(h.warn > 1.65, 'the old fixed warning cannot cover the entrance approach');
    function step(dt) { G.updatePlayer(dt); G.updateEnemies(dt); G.updateOpening(dt); r.drain(); }
    // Give the player a reaction beat before walking with actual collision.
    step(.3);
    const speed = G.forms.colossus.speed * G.keepsakeSpeedScale();
    for (const next of h.safeRoute.slice(1)) {
      let limit = 0;
      while (Math.hypot(next.x - p.x, next.y - p.y) > .001) {
        assert.ok(++limit < 50, 'the marked step is reachable by ordinary walking');
        const dx = next.x - p.x, dy = next.y - p.y, distance = Math.hypot(dx, dy);
        G.input.vec = { x: dx / distance, y: dy / distance };
        step(Math.min(.02, distance / speed));
      }
    }
    G.input.vec = { x: 0, y: 0 };
    assert.ok(h.t < h.warn, 'walking reaches shelter before the flood rises');
    while (h.t < h.warn + h.active) step(.02);
    assert.equal(p.damageTaken, damage);
    assert.equal(e.openingBeat, 1, 'a longer warning cannot overlap the next sweep');
    assert.ok(e.openingTimer > 1.2, 'the ebb leaves a counterattack window');
  }
});

test('nearby shelter keeps the original rhythm and optional assistance still adds a warning beat', () => {
  const { G, e } = setup(1, 'nobody', false), p = G.state.player;
  p.x = e.x; p.y = e.y + 12;
  G.updateOrchardBoss(e, p, .01);
  assert.equal(G.state.openingHazards[0].warn, 1.65);
  assert.ok(Math.abs(e.openingTimer - 3.6) < .0001);
  G.state.openingHazards = []; e.openingTimer = 0; e.openingBeat = 0;
  G.setComfortSetting('bossAssistance', true);
  G.updateOrchardBoss(e, p, .01);
  assert.equal(G.state.openingHazards[0].warn, 2.05);
  G.cancelBossHazards(e);
  assert.equal(G.state.openingHazards.length, 0);
});
