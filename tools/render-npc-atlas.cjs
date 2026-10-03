// Inspect current native NPC art, all poses/facings, at both pixel settings.
const fs = require('node:fs'), path = require('node:path');
const { createCanvas } = require(require.resolve('@napi-rs/canvas', {
  paths: [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || 'node_modules'],
}));
const r = require('./lib/classic-runtime.cjs')(createCanvas), { G } = r;
const [out, ...requested] = process.argv.slice(2);
if (!out) throw Error('Usage: node tools/render-npc-atlas.cjs OUTPUT_DIRECTORY [NPC_ID ...]');
const ids = requested.length ? requested : Object.keys(G.NPCS);
const registry = { ...G.NPCS };
if (ids.some(id => id.startsWith('resident-'))) {
  Object.assign(G.state.town, { founded: true, introduced: true, residents: 16 });
  r.load('town'); r.drain();
  for (const n of G.state.npcs.filter(n => n.ambientOnly)) registry[n.id] = n.def;
}
for (const id of ids) if (!registry[id]) throw Error(`Unknown NPC: ${id}`);
fs.mkdirSync(out, { recursive: true });
for (const id of ids) {
  const npc = registry[id], sprite = npc.sprite;
  const bands = Math.ceil(sprite.frames.length / 4), height = 60 + bands * 440;
  const canvas = createCanvas(960, height), c = canvas.getContext('2d');
  c.imageSmoothingEnabled = false; c.fillStyle = '#24353a'; c.fillRect(0, 0, 960, height);
  c.font = '18px monospace'; c.fillStyle = '#eed9b1'; c.fillText(npc.name, 16, 26);
  for (const [row, hd] of [true, false].entries()) {
    G.hdPilot = hd;
    const active = G.activeSpriteDefinition(sprite), y = 50 + row * bands * 220;
    c.font = '14px monospace'; c.fillStyle = '#eed9b1'; c.fillText(hd ? 'HD' : 'BASE', 16, y + 15);
    for (let frame = 0; frame < active.frames.length; frame++) for (const [side, flip] of [false, true].entries()) {
      const x = 55 + ((frame % 4) * 2 + side) * 112, fy = y + Math.floor(frame / 4) * 220;
      c.fillStyle = '#30474a'; c.fillRect(x - 36, fy + 25, 108, 182);
      G.drawSprite(c, sprite, frame, x + 16, fy + 68, flip, 1);
      G.drawSprite(c, sprite, frame, x + 16, fy + 185, flip, 4);
      c.font = '12px monospace'; c.fillStyle = '#c3ceca'; c.fillText(`${frame} ${flip ? 'left' : 'right'}`, x - 24, fy + 202);
    }
  }
  const target = path.join(out, `${id}.png`);
  fs.writeFileSync(target, canvas.toBuffer('image/png'));
  console.log(target);
}
