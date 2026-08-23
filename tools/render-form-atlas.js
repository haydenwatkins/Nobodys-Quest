#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ console, Math, Date, window: { matchMedia: () => ({ matches: false }) } });
function run(file, suffix = "") {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8") + suffix, context, { filename: file });
}

run("js/engine/core.js", ";this.G=G;");
const G = context.G;
G.sfx = { play() {} };
G.ui = { toast() {}, banner() {} };
G.saveGame = () => {};
G.makeTown = () => ({});
run("js/engine/forms.js");
run("js/abilities/basics.js");
for (const name of ["nobody", "rat", "knight", "ranger", "wizard", "frog", "alchemist", "stormcaller", "dragon", "riftblade", "mole", "vampire", "jester", "turtle", "samurai", "astronomer", "druid", "griffin", "golem", "weaver", "bellkeeper", "lantern-wisp", "colossus", "god"])
  run(`js/forms/${name}.js`);
run("js/data/form-art-hd.js");

const useBase = process.argv.includes("--base");
const useSkins = process.argv.includes("--skins");
if (useSkins) {
  G.state = { costumeId: "classic", costumesUnlocked: ["classic"], skinsUnlocked: [], skinByForm: {} };
  run("js/engine/costumes.js");
}
const columns = 4, cellW = 340, cellH = 160, scale = useBase ? 6 : 3;
const width = columns * cellW, height = Math.ceil(G.formOrder.length / columns) * cellH;
const output = process.argv.slice(2).find((arg) => !arg.startsWith("--"));

if (output && output.endsWith(".ppm")) {
  const pixels = Buffer.alloc(width * height * 3);
  const rgb = (hex) => {
    const value = parseInt(String(hex).replace("#", ""), 16);
    return [value >> 16, (value >> 8) & 255, value & 255];
  };
  const fill = (x, y, w, h, color) => {
    const [r, green, b] = rgb(color);
    for (let yy = Math.max(0, y); yy < Math.min(height, y + h); yy++) for (let xx = Math.max(0, x); xx < Math.min(width, x + w); xx++) {
      const offset = (yy * width + xx) * 3;
      pixels[offset] = r; pixels[offset + 1] = green; pixels[offset + 2] = b;
    }
  };
  fill(0, 0, width, height, "#101421");
  G.formOrder.forEach((id, index) => {
    const col = index % columns, row = Math.floor(index / columns), x = col * cellW, y = row * cellH;
    const form = G.forms[id];
    const appearance = useSkins ? G.signatureSprite(form.sprite, G.skinForForm(id)) : form.sprite;
    const sprite = useBase ? appearance : appearance.hd;
    fill(x + 6, y + 6, cellW - 12, cellH - 12, "#1b2234");
    fill(x + 6, y + 6, cellW - 12, 4, Object.values(sprite.palette)[3] || "#f4d47c");
    [0, 2].forEach((frameIndex, pose) => {
      const rows = sprite.frames[frameIndex], frameW = Math.max(...rows.map((line) => line.length));
      const originX = Math.round(x + (pose ? 245 : 90) - frameW * scale / 2), originY = y + 24;
      for (let py = 0; py < rows.length; py++) for (let px = 0; px < rows[py].length; px++) {
        const key = rows[py][px];
        if (key !== "." && key !== " ") fill(originX + px * scale, originY + py * scale, scale, scale, sprite.palette[key]);
      }
    });
  });
  fs.writeFileSync(output, Buffer.concat([Buffer.from(`P6\n${width} ${height}\n255\n`), pixels]));
  process.exit(0);
}

const xml = [`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
  `<rect width="100%" height="100%" fill="#101421"/>`];

function drawFrame(sprite, frameIndex, originX, originY) {
  const rows = sprite.frames[frameIndex];
  const w = Math.max(...rows.map((row) => row.length));
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
    const key = rows[y][x];
    if (key === "." || key === " ") continue;
    xml.push(`<rect x="${originX + x * scale}" y="${originY + y * scale}" width="${scale}" height="${scale}" fill="${sprite.palette[key]}"/>`);
  }
  return w * scale;
}

G.formOrder.forEach((id, index) => {
  const col = index % columns, row = Math.floor(index / columns);
  const x = col * cellW, y = row * cellH, form = G.forms[id];
  const appearance = useSkins ? G.signatureSprite(form.sprite, G.skinForForm(id)) : form.sprite;
  const sprite = useBase ? appearance : appearance.hd;
  xml.push(`<rect x="${x + 6}" y="${y + 6}" width="${cellW - 12}" height="${cellH - 12}" rx="10" fill="#1b2234" stroke="#42506a" stroke-width="2"/>`);
  xml.push(`<text x="${x + 18}" y="${y + 28}" fill="#f4d47c" font-family="monospace" font-size="18" font-weight="bold">${form.name}</text>`);
  const artY = y + 42;
  const idleW = Math.max(...sprite.frames[0].map((line) => line.length)) * scale;
  drawFrame(sprite, 0, x + 90 - idleW / 2, artY);
  drawFrame(sprite, 2, x + 245 - idleW / 2, artY);
  xml.push(`<text x="${x + 90}" y="${y + 146}" text-anchor="middle" fill="#8996ad" font-family="monospace" font-size="12">IDLE</text>`);
  xml.push(`<text x="${x + 245}" y="${y + 146}" text-anchor="middle" fill="#8996ad" font-family="monospace" font-size="12">ACTION</text>`);
});

xml.push("</svg>");
if (output) fs.writeFileSync(output, xml.join("\n"));
else process.stdout.write(xml.join("\n"));
