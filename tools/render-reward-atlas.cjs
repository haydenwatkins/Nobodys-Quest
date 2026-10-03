#!/usr/bin/env node
// Review every ordinary drop and authored chest object at native size and 3x.
const fs = require('node:fs'), path = require('node:path');
const { createCanvas } = require(require.resolve('@napi-rs/canvas', {
  paths: [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || 'node_modules'],
}));
const { G } = require('./lib/classic-runtime.cjs')(createCanvas);
const entries = Object.entries(G.pickupArt).concat(Object.entries(G.treasureArt));
const columns = 5, cellW = 180, cellH = 165, rows = Math.ceil(entries.length * 2 / columns);
const canvas = createCanvas(columns * cellW, rows * cellH), ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#30484b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
let index = 0;
for (const hd of [true, false]) {
  G.hdPilot = hd;
  for (const [name, sprite] of entries) {
    const x = index % columns * cellW, y = Math.floor(index / columns) * cellH;
    ctx.fillStyle = '#f4d39c'; ctx.font = '12px monospace'; ctx.fillText(`${name} ${hd ? 'HD' : 'BASE'}`, x + 5, y + 16);
    const frames = G.activeSpriteDefinition(sprite).frames;
    for (let frame = 0; frame < frames.length; frame++) {
      const px = x + 20 + frame * 44;
      G.drawSprite(ctx, sprite, frame, px, y + 40, false);
      ctx.save(); ctx.translate(px, y + 128); ctx.scale(3, 3);
      G.drawSprite(ctx, sprite, frame, 0, 0, false); ctx.restore();
    }
    index++;
  }
}
const output = path.resolve(process.argv[2] || '/tmp/nobodys-quest-reward-atlas.png');
fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, canvas.toBuffer('image/png'));
console.log(output);
