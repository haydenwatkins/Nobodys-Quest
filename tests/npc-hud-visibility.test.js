const { test } = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

test('optional cards clear nearby named and resident bodies/markers, restore when clear, and preserve NPC and lesson state', () => {
  const r = runtime(), { G } = r;
  G.state.opening.complete = G.state.delivery.complete = true; r.load('overworld'); r.drain(); r.run('js/engine/ui.js');
  G.state.enemies = []; G.state.bossCutscene = null; G.tutorial.prompt = () => null; G.world.nearPortal = () => null;
  G.questCounts[G.forms.nobody.quests[0].id] = 1;
  const cam = { x: 320, y: 160 }, c = r.nodes.get('ui').getContext('2d'), labels = [];
  c.fillText = t => labels.push(String(t));
  const draw = () => { labels.length = 0; G.ui.drawHUD(cam); };
  const defs = [G.NPCS.errata, G.NPCS.quayBaker, { name: 'Town Resident', sprite: G.townResidentArt[0] }];
  for (const hd of [true, false]) for (const mode of ['touch', 'keyboard', 'controller']) for (const def of defs) {
    G.hdPilot = hd; G.input.isTouch = mode === 'touch'; G.input.hasGamepad = mode === 'controller';
    Object.assign(G.state.player, { x: cam.x + 160, y: cam.y + 120 });
    const npc = { id: def.name, def, x: cam.x + 220, y: cam.y + (mode === 'touch' ? 79 : 101),
      ambientOnly: def.name === 'Town Resident', home: { x: 5, y: 5 }, path: [], activity: 'read', anim: .2 };
    G.state.npcs = [npc];
    const before = JSON.stringify({ npc, counts: G.questCounts, p: G.state.player, time: G.state.time });
    draw(); assert.ok(!labels.some(t => t.includes('MASTERY'))); assert.ok(labels.some(t => t.includes(' Lv')));
    assert.equal(JSON.stringify({ npc, counts: G.questCounts, p: G.state.player, time: G.state.time }), before);
    npc.x = cam.x + 310; draw(); assert.ok(labels.some(t => t.includes('MASTERY')), 'a distant resident cannot permanently suppress the lesson');
    npc.x = cam.x + 180; npc.y = cam.y + 150; draw();
    assert.ok(labels.some(t => t.includes('MASTERY')), 'a nearby non-overlapping actor leaves the card visible');
    npc.x = cam.x + 220; npc.y = cam.y + (mode === 'touch' ? 118 : 140); npc.guidancePoint = true;
    draw(); assert.ok(!labels.some(t => t.includes('MASTERY')), 'a marker above the actual head also gets room');
  }
});
