"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const canvasCalls = [];
const context = vm.createContext({
  console, Math, Date, WeakMap, Map, Set,
  window: { matchMedia: () => ({ matches: false }) },
  document: {
    createElement() {
      return {
        width: 0, height: 0,
        getContext() {
          return {
            fillStyle: "", globalCompositeOperation: "source-over",
            fillRect() {}, drawImage(...args) { canvasCalls.push(args); },
          };
        },
      };
    },
  },
});

function run(file, suffix = "") {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8") + suffix, context, { filename: file });
}

run("js/engine/core.js", ";this.G = G;");
run("js/engine/sprites.js");
const G = context.G;

const base = {
  palette: { k: "#1a1c2c", w: "#f4f4f4", s: "#94b0c2" },
  frames: [[".kk.", "kwwk", "kssk", ".kk."], [".kk.", "kwwk", ".ss.", "k..k"]],
};
const hd = G.makeHdSprite2x(base, { accent: "#73eff7", motif: "hero", animate: true });
base.hd = hd;

assert.equal(hd.density, 2);
assert.equal(hd.frames[0].length, base.frames[0].length * 2);
assert.equal(hd.frames[0][0].length, base.frames[0][0].length * 2);
assert.ok(hd.frames.length > base.frames.length, "the pilot should add animation beats, not just pixels");
assert.ok(Object.keys(hd.palette).length > Object.keys(base.palette).length, "HD art should add highlight and accent colors");
assert.notEqual(hd.frames[0][0], "..kkkk..", "exposed corners should be sculpted instead of nearest-neighbor blocks");

G.hdPilot = false;
assert.equal(G.activeSpriteDefinition(base), base);
assert.deepEqual(Object.assign({}, G.spriteMetrics(base)), { w: 4, h: 4, density: 1 });
G.hdPilot = true;
assert.equal(G.activeSpriteDefinition(base), hd);
assert.deepEqual(Object.assign({}, G.spriteMetrics(base)), { w: 4, h: 4, density: 2 },
  "HD sprites must occupy the exact same logical footprint");
assert.ok(G.spriteFrame(base, "idle", 2) >= 0);

const draw = {
  save() {}, restore() {}, translate() {}, scale() {}, drawImage(...args) { canvasCalls.push(args); },
};
G.drawSprite(draw, base, 0, 20, 20, false);
const finalDraw = canvasCalls.at(-1);
assert.equal(finalDraw.at(-2), 4);
assert.equal(finalDraw.at(-1), 4, "the denser bitmap should still draw at the original logical size");

const main = fs.readFileSync(path.join(root, "js/engine/main.js"), "utf8");
const ui = fs.readFileSync(path.join(root, "js/engine/ui.js"), "utf8");
const world = fs.readFileSync(path.join(root, "js/engine/world.js"), "utf8");
for (const text of [
  "canvas.width = G.W * G.renderScale",
  "ctx.setTransform(G.renderScale",
  "snapshot.width = canvas.width",
  "G.setHdPilot",
]) assert.ok(main.includes(text), `resolution foundation should include '${text}'`);
assert.ok(ui.includes("RESOLUTION PILOT") && ui.includes("Compare original"));
assert.ok(world.includes("drawHdPilotDetail") && world.includes("0.5"),
  "the world pilot should use detail below the old one-logical-pixel grid");

for (const file of ["js/forms/nobody.js", "js/data/npcs.js", "js/data/enemies.js"]) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  assert.ok(source.includes("makeHdSprite2x"), `${file} should contribute an authored pilot subject`);
}

console.log("HD resolution pilot tests passed");
