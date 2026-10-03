const { test } = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');
const placements = [['errata', 'mistwood'], ['alias', 'town'], ['provisional', 'sunkenMarsh']];

test('roadside specialists retain native conversations, placements, and saved talk progress', () => {
  const r = runtime(), { G } = r;
  G.state.opening.complete = true;
  G.state.delivery.complete = true;
  for (const [id, map] of placements) {
    r.load(map); r.drain();
    const npc = G.state.npcs.find(n => n.id === id);
    assert.ok(npc, `${id} has its native placement in ${map}`);
    const home = JSON.stringify(npc.home), chapters = JSON.stringify(npc.def.chapters);
    G.state.npcs = [npc]; G.state.enemies = []; G.state.bossCutscene = null; G.state.npcArrivalGrace = 0;
    Object.assign(G.state.player, { x: npc.x + 12, y: npc.y });
    const key = id + ':' + G.storyChapter(), count = G.state.npcTalk[key] || 0;
    assert.equal(G.npcTalkCandidate(), npc);
    assert.equal(G.tryNpcTalk(), true);
    assert.equal(G.state.npcTalk[key], count + 1);
    assert.equal(JSON.stringify(npc.home), home);
    assert.equal(JSON.stringify(npc.def.chapters), chapters);
    assert.ok(r.messages.some(m => m.text === G.npcDialogue(id, G.storyChapter(), count)));
    r.drain(); G.saveGame();
    assert.equal(G.loadSaveData().npcTalk[key], count + 1);
  }
});

test('authored bodies preserve drawing state, mirrored routines, quiet poses, and clear head markers', () => {
  const r = runtime(), { G } = r;
  r.load('town'); r.drain(); G.state.enemies = []; G.state.bossCutscene = null; G.state.npcArrivalGrace = 0;
  const draws = [], labels = [], markers = [];
  const ctx = new Proxy({
    measureText: text => ({ width: text.length * 5 }),
    fillRect(x, y, w, h) { labels.push({ x, y, w, h }); },
    translate(x, y) { markers.push({ x, y }); },
  }, { get: (o, k) => o[k] ?? (() => {}), set: (o, k, v) => (o[k] = v, true) });
  G.drawSprite = (c, sprite, frame, x, y, flip) => draws.push({ sprite, frame, x, y, flip });
  for (const id of G.workshopCompanionArtIds) {
    const sprite = G.NPCS[id].sprite;
    assert.equal(sprite.integratedEquipment, true);
    for (const hd of [true, false]) {
      G.hdPilot = hd;
      const active = G.activeSpriteDefinition(sprite);
      for (const frame of active.frames) for (const row of frame) for (const pixel of row)
        assert.ok(pixel === '.' || active.palette[pixel], `${id}: valid palette`);
      assert.equal(G.spriteMetrics(sprite).w, 18);
      assert.equal(G.spriteMetrics(sprite).h, 22);
      for (const left of [true, false]) for (const quiet of [true, false]) for (const mode of ['idle', 'walk', 'work']) {
        G.reducedMotion = quiet;
        const npc = { id, def: G.NPCS[id], x: 200, y: 150, seed: 0, anim: .5, facingLeft: left,
          path: mode === 'walk' ? [{ x: 220, y: 150 }] : [], activity: mode === 'work' ? 'notes' : null, guidancePoint: true };
        G.state.npcs = [npc]; Object.assign(G.state.player, { x: 212, y: 150 });
        const before = JSON.stringify(npc);
        draws.length = labels.length = markers.length = 0;
        G.drawNpc(ctx, npc);
        assert.equal(JSON.stringify(npc), before, 'rendering cannot change gameplay state');
        assert.equal(draws[0].sprite, sprite); assert.equal(draws[0].flip, left);
        assert.ok(labels.find(rect => rect.h === 8).y + 8 <= npc.y - 22, 'talk label clears the head');
        assert.ok(markers[0].y + 5 <= npc.y - 22, 'guidance marker clears the head');
        if (quiet) { assert.equal(draws[0].frame, mode === 'work' ? 2 : 0); assert.equal(draws[0].y, npc.y); }
      }
    }
  }
});

test('existing speaker resolution draws each specialist rather than a fallback guardian', () => {
  const r = runtime(), { G } = r;
  r.load('orchardRoad'); r.drain();
  const draws = [], ctx = new Proxy({ measureText: text => ({ width: text.length * 5 }) }, { get: (o, k) => o[k] ?? (() => {}) });
  G.drawSprite = (c, sprite) => draws.push(sprite);
  for (const id of G.workshopCompanionArtIds) for (const hd of [true, false]) {
    G.hdPilot = hd; draws.length = 0;
    assert.equal(G.drawOpeningDialogue(ctx, { speaker: G.NPCS[id].name.toUpperCase() + ' · A RUMOR', text: 'Good roads need good neighbours.', shown: 99 }, (c, text) => [text]), true);
    assert.equal(draws[0], G.NPCS[id].sprite);
  }
});
