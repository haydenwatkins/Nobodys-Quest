"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({
  console, Math, Date,
  window: { matchMedia: () => ({ matches: false }) },
});

function run(file, suffix = "") {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8") + suffix, context, { filename: file });
}

run("js/engine/core.js", ";this.G = G;");
const G = context.G;
G.makeEnemy = (id, x, y) => ({ id, x, y, dead: false });
G.ui = { toast() {} };
G.formOrder = [];
G.forms = {};
G.formLevel = () => 0;
G.state = {
  opened: [], items: [], stars: 0,
  player: { x: 0, y: 0, dashing: null },
};

run("js/engine/world.js");
run("js/data/maps.js");

const expectedThemes = {
  riftbladeTrial: "riftblade",
  moleTrial: "mole",
  vampireTrial: "vampire",
  jesterTrial: "jester",
  godTrial: "god",
};
for (const [mapId, theme] of Object.entries(expectedThemes)) {
  assert.equal(G.maps[mapId].visualTheme, theme, `${mapId} needs its own arena art`);
  assert.equal(G.maps[mapId].tiles.length, 17, `${mapId} geometry height changed`);
  assert.ok(G.maps[mapId].tiles.every((row) => row.length === 28), `${mapId} geometry width changed`);
}

function fakeCanvas() {
  let depth = 0;
  const ctx = {
    save() { depth++; },
    restore() { depth--; assert.ok(depth >= 0, "canvas restore underflow"); },
    fillRect() {}, beginPath() {}, arc() {}, stroke() {}, moveTo() {}, lineTo() {},
    translate() {}, rotate() {}, setLineDash() {},
    assertBalanced() { assert.equal(depth, 0, "canvas state leaked between frames"); },
  };
  return new Proxy(ctx, {
    set(target, property, value) { target[property] = value; return true; },
  });
}

// Render several viewports of every map. This exercises every terrain edge,
// portal landmark, and trial crest without needing a browser canvas in CI.
for (const mapId of Object.keys(G.maps)) {
  G.world.load(mapId);
  assert.equal(G.state.mapReveal, 0.32, `${mapId} should use the short reveal`);
  const ctx = fakeCanvas();
  const maxX = Math.max(0, G.state.mapW * G.TILE - G.W);
  const maxY = Math.max(0, G.state.mapH * G.TILE - G.H);
  for (const cam of [
    { x: 0, y: 0 },
    { x: Math.floor(maxX / 2), y: Math.floor(maxY / 2) },
    { x: maxX, y: maxY },
  ]) {
    assert.doesNotThrow(() => G.world.draw(ctx, cam, 2.5), `${mapId} should render at ${cam.x},${cam.y}`);
    ctx.assertBalanced();
  }
}

G.reducedMotion = true;
G.world.load("overworld");
assert.equal(G.state.mapReveal, 0, "reduced motion should skip the map reveal");

console.log("visual polish tests passed");
