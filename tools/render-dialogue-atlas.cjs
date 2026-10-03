const fs = require('node:fs'), path = require('node:path');
const { createCanvas } = require(require.resolve('@napi-rs/canvas', { paths: [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || 'node_modules'] }));
const { G } = require('./lib/classic-runtime.cjs')(createCanvas);
const out = process.argv[2]; if (!out) throw Error('Usage: node tools/render-dialogue-atlas.cjs OUTPUT_DIRECTORY');
fs.mkdirSync(out, { recursive: true });
const speakers = process.argv.includes('--all')
  ? [...Object.values(G.NPCS).map(n => n.name), ...Object.values(G.forms).map(f => f.name),
     ...Object.values(G.enemies).filter(e => e.miniboss).map(e => e.name), 'The Story', 'Sign', 'The Last Worldbearer']
  : [...Object.values(G.NPCS).map(n => n.name), 'The Story', 'Sign', 'The Ancient Treant', 'Rat', 'Patchling'];
for (const hd of [true, false]) for (let start = 0; start < speakers.length; start += 20) {
  const page = speakers.slice(start, start + 20);
  G.hdPilot = hd;
  const c = createCanvas(960, Math.ceil(page.length / 5) * 190), ctx = c.getContext('2d');
  ctx.fillStyle = '#24353a'; ctx.fillRect(0, 0, c.width, c.height); ctx.imageSmoothingEnabled = false;
  for (const [i, speaker] of page.entries()) {
    const x = (i % 5) * 192, y = Math.floor(i / 5) * 190;
    ctx.save(); ctx.translate(x + 34, y + 10); ctx.scale(3, 3);
    G.drawDialoguePortrait(ctx, speaker, 0, 0, 39); ctx.restore();
    ctx.font = '13px monospace'; ctx.fillStyle = '#eed9b1'; ctx.fillText(speaker, x + 6, y + 145);
    const identity = G.resolveDialogueSpeaker(speaker);
    ctx.font = '12px monospace'; ctx.fillStyle = '#a6c9bd'; ctx.fillText(`${identity.kind} · ${hd ? 'HD' : 'BASE'}`, x + 6, y + 167);
  }
  fs.writeFileSync(path.join(out, `${hd ? 'hd' : 'base'}-${start / 20}.png`), c.toBuffer('image/png'));
}
