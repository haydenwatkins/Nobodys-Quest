#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ console, Math, Date, window: { matchMedia: () => ({ matches: false }) } });
function run(file, suffix = "") { vm.runInContext(fs.readFileSync(path.join(root, file), "utf8") + suffix, context, { filename: file }); }
run("js/engine/core.js", ";this.G=G;");
const G = context.G;
G.sfx = { play() {} }; G.ui = { toast() {}, banner() {} }; G.saveGame = () => {}; G.makeTown = () => ({});
run("js/engine/forms.js"); run("js/abilities/basics.js");
for (const name of ["nobody", "rat", "knight", "ranger", "wizard", "frog", "alchemist", "stormcaller", "dragon", "riftblade", "mole", "vampire", "jester", "turtle", "samurai", "astronomer", "druid", "griffin", "golem", "weaver", "bellkeeper", "lantern-wisp", "colossus", "god"]) run(`js/forms/${name}.js`);
run("js/data/form-art-hd.js"); context.registerEnemy = (definition) => { G.enemies[definition.id] = definition; };
run("js/data/enemies.js"); run("js/data/boss-art-hd.js");

const bosses = Object.values(G.enemies).filter((enemy) => enemy.miniboss);
const columns = 3, cellW = 420, cellH = 210, scale = 3;
const width = columns * cellW, height = Math.ceil(bosses.length / columns) * cellH;
const output = process.argv[2] || path.join("/tmp", "nobodys-quest-boss-atlas.ppm");
const pixels = Buffer.alloc(width * height * 3);
const rgb = (hex) => { const value = parseInt(String(hex).replace("#", ""), 16); return [value >> 16, (value >> 8) & 255, value & 255]; };
const fill = (x, y, w, h, color) => {
  const [r, green, b] = rgb(color);
  for (let yy = Math.max(0, Math.round(y)); yy < Math.min(height, Math.round(y + h)); yy++) for (let xx = Math.max(0, Math.round(x)); xx < Math.min(width, Math.round(x + w)); xx++) {
    const offset = (yy * width + xx) * 3; pixels[offset] = r; pixels[offset + 1] = green; pixels[offset + 2] = b;
  }
};
const glyphs = {
  A:["01110","10001","11111","10001","10001"], B:["11110","10001","11110","10001","11110"], C:["01111","10000","10000","10000","01111"], D:["11110","10001","10001","10001","11110"], E:["11111","10000","11110","10000","11111"], F:["11111","10000","11110","10000","10000"], G:["01111","10000","10111","10001","01111"], H:["10001","10001","11111","10001","10001"], I:["11111","00100","00100","00100","11111"], J:["00111","00010","00010","10010","01100"], K:["10001","10010","11100","10010","10001"], L:["10000","10000","10000","10000","11111"], M:["10001","11011","10101","10001","10001"], N:["10001","11001","10101","10011","10001"], O:["01110","10001","10001","10001","01110"], P:["11110","10001","11110","10000","10000"], Q:["01110","10001","10101","10010","01101"], R:["11110","10001","11110","10010","10001"], S:["01111","10000","01110","00001","11110"], T:["11111","00100","00100","00100","00100"], U:["10001","10001","10001","10001","01110"], V:["10001","10001","10001","01010","00100"], W:["10001","10001","10101","11011","10001"], X:["10001","01010","00100","01010","10001"], Y:["10001","01010","00100","00100","00100"], Z:["11111","00010","00100","01000","11111"], " ":["0","0","0","0","0"], ",":["0","0","0","1","1"], "-":["0","0","111","0","0"]
};
function label(text, x, y) { let ox = x; for (const ch of text.toUpperCase()) { const rows = glyphs[ch] || glyphs[" "]; for (let yy=0;yy<rows.length;yy++) for(let xx=0;xx<rows[yy].length;xx++) if(rows[yy][xx]==="1") fill(ox+xx*2,y+yy*2,2,2,"#f2ce77"); ox += 13; } }
function draw(sprite, index, cx, y) {
  const rows = sprite.frames[index], w = rows[0].length;
  const left = Math.round(cx - w * scale / 2);
  for (let py=0;py<rows.length;py++) for(let px=0;px<rows[py].length;px++) { const key=rows[py][px]; if(key!=="."&&key!==" ") fill(left+px*scale,y+py*scale,scale,scale,sprite.palette[key]); }
}
bosses.forEach((enemy, index) => {
  const col=index%columns,row=Math.floor(index/columns),x=col*cellW,y=row*cellH,sprite=enemy.sprite.hd;
  fill(x+5,y+5,cellW-10,cellH-10,"#182033"); fill(x+5,y+5,cellW-10,3,enemy.boss.color);
  label(enemy.name,x+17,y+17); draw(sprite,0,x+115,y+42); draw(sprite,2,x+305,y+42);
});
fs.writeFileSync(output, Buffer.concat([Buffer.from(`P6\n${width} ${height}\n255\n`), pixels]));
console.log(output);
