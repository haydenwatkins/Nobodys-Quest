#!/usr/bin/env node
// Make review sheets from native browser captures; originals remain untouched.
// Usage: node tools/render-review-sheet.cjs [captureDirectory] [outputDirectory]
const fs = require('node:fs'), path = require('node:path');
const { createCanvas, loadImage } = require(require.resolve('@napi-rs/canvas', {
  paths: [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || 'node_modules'],
}));
const input = path.resolve(process.argv[2] || '.'), output = path.resolve(process.argv[3] || input);
const stages = ['ground','work','journal','atlas','restored','collect','collected','ending','owned-boot','return','return-journal','kept','lift-up','lift-down','road-home','road-back','crossing-upper','crossing-lower','crossing-western','crossing-eastern'];
(async () => {
  fs.mkdirSync(output, { recursive:true });
  for (const mode of ['touch','controller']) {
    const captures = fs.readdirSync(input).flatMap(name => {
      const match = name.match(new RegExp(`^${mode}-(hd|base)-(.+)\\.png$`));
      return match ? [{ name, setting:match[1], stage:match[2] }] : [];
    }).sort((a,b) => (a.setting === 'hd' ? 0 : 1) - (b.setting === 'hd' ? 0 : 1) ||
      (stages.indexOf(a.stage) < 0 ? 99 : stages.indexOf(a.stage)) - (stages.indexOf(b.stage) < 0 ? 99 : stages.indexOf(b.stage)) || a.name.localeCompare(b.name));
    if (!captures.length) continue;
    const columns = Math.min(3,captures.length), width = 667, height = 375;
    const canvas = createCanvas(columns * width, Math.ceil(captures.length / columns) * height), ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.imageSmoothingEnabled = false;
    for (let i=0;i<captures.length;i++) {
      const picture = await loadImage(path.join(input,captures[i].name));
      ctx.drawImage(picture,i % columns * width,Math.floor(i / columns) * height,width,height);
    }
    const filename = path.join(output,`${path.basename(input)}-${mode}-review.png`);
    fs.writeFileSync(filename,canvas.toBuffer('image/png')); console.log(filename);
    console.log(captures.map(capture=>capture.name).join('\n'));
  }
})().catch(error => { console.error(error); process.exitCode=1; });
