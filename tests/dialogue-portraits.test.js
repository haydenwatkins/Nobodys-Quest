const { test } = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

test('every named speaker, form and guardian resolves by identity, while narration and longer unrelated headings stay neutral', () => {
  const { G } = runtime();
  for (const [id, npc] of Object.entries(G.NPCS)) for (const name of [npc.name, `! ${npc.name} · A RUMOR`]) {
    const speaker = G.resolveDialogueSpeaker(name);
    assert.equal(speaker.kind, 'npc'); assert.equal(speaker.id, id);
    assert.equal(speaker.sprite, G.dialoguePortraits[id]);
    assert.notEqual(speaker.sprite, npc.sprite, 'the portrait is composed separately from the world body');
  }
  for (const [name, id] of [['ERRATA', 'errata'], ['PARCEL, FROM THE OTHER SIDE', 'parcel'], ['SER PENDING', 'pending'], ['BRINDLE', 'quayBaker'], ['◇ PEBBLE NOTICES', 'pebble']])
    assert.equal(G.resolveDialogueSpeaker(name).id, id);
  assert.equal(G.resolveDialogueSpeaker('THE LAST WORLDBEARER').id, 'lastWorldbearer');
  for (const [id, form] of Object.entries(G.forms)) {
    const speaker = G.resolveDialogueSpeaker(`${form.icon} ${form.name.toUpperCase()}`);
    assert.equal(speaker.kind, 'form'); assert.equal(speaker.id, id);
  }
  for (const [id, foe] of Object.entries(G.enemies).filter(([, foe]) => foe.miniboss)) {
    const speaker = G.resolveDialogueSpeaker(`🏆 ${foe.name}`);
    assert.equal(speaker.kind, 'guardian'); assert.equal(speaker.id, id);
    for (const title of [`⚔ ${foe.name} ⚔`, `${foe.name} — PHASE II`, `${foe.name} — PHASE III`, ...(foe.boss?.domain ? [`⚔ WORLDBEARER OF ${foe.boss.domain.toUpperCase()} ⚔`] : [])])
      assert.equal(G.resolveDialogueSpeaker(title).id, id, title);
  }
  for (const name of ['THE STORY', '🪧 SIGN', '🎁 TREASURE CHEST', 'BRINDLEBERRY', 'PARCELMAN', 'RATTLE', 'MARA’S LETTER', 'ARCHIVIST ERRATA’S DESK', 'ERRATA’S DESK', 'ERRATUM', 'THE BLIND SUNDIAL']) {
    assert.equal(G.resolveDialogueSpeaker(name).sprite, null, name);
  }
});

test('all portraits are valid in both pixel settings and opening narration never paints a borrowed face', () => {
  const r = runtime(), { G } = r; r.load('orchardRoad'); r.drain();
  const draws = [], c = new Proxy({ measureText: t => ({ width: t.length * 5 }) }, { get: (o, k) => o[k] ?? (() => {}) });
  G.drawSprite = (ctx, sprite) => draws.push(sprite);
  for (const hd of [true, false]) {
    G.hdPilot = hd;
    for (const [id, portrait] of Object.entries(G.dialoguePortraits)) {
      const active = G.activeSpriteDefinition(portrait);
      assert.equal(G.spriteMetrics(portrait).w, 32); assert.equal(G.spriteMetrics(portrait).h, 32);
      for (const row of active.frames[0]) for (const pixel of row) assert.ok(pixel === '.' || active.palette[pixel], id);
      draws.length = 0;
      G.drawOpeningDialogue(c, { speaker: G.NPCS[id].name, text: 'Hello, neighbour.', shown: 99 }, (ctx, text) => [text]);
      assert.equal(draws[0], portrait);
    }
    for (const name of ['THE STORY', 'SIGN', 'THE ROAD', 'THE OLD STUMP', 'SOME NEW SPEAKER']) {
      draws.length = 0;
      G.drawOpeningDialogue(c, { speaker: name, text: 'An old road opens.', shown: 99 }, (ctx, text) => [text]);
      assert.equal(draws.length, 0);
    }
  }
});

test('standard dialogue draws the same portrait and preserves queued touch/controller advancement and callbacks', () => {
  const r = runtime(), { G } = r; r.load('town'); r.drain(); r.run('js/engine/ui.js');
  const draws = [], text = [], c = r.nodes.get('ui').getContext('2d');
  G.drawSprite = (ctx, sprite) => draws.push(sprite); c.fillText = label => text.push(label);
  let closed = 0;
  G.ui.dialogue('BRINDLE', 'The first loaf is yours.', { onClose: () => closed++ });
  G.ui.dialogue('THE STORY', 'The road opens.');
  G.ui.update(1); G.ui.drawHUD({ x: 0, y: 0 });
  assert.ok(draws.includes(G.dialoguePortraits.quayBaker)); assert.ok(text.includes('The first loaf is yours.'));
  assert.equal(G.ui.dialogueQueueLength, 2);
  r.taps.add('a'); G.ui.update(.2);
  assert.equal(closed, 1); assert.equal(G.ui.dialogueQueueLength, 1);
  G.ui.update(1); G.input.hasGamepad = true;
  draws.length = text.length = 0; G.ui.drawHUD({ x: 0, y: 0 });
  assert.ok(!draws.some(sprite => Object.values(G.dialoguePortraits).includes(sprite)));
  assert.ok(text.includes('A  CONTINUE'));
  r.taps.add('a'); G.ui.update(.2);
  assert.equal(G.ui.dialogueOpen, false); assert.equal(closed, 1);
});
