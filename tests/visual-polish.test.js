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

context.document = {
  createElement() {
    const canvas = {
      width: 0, height: 0,
      getContext() {
        return {
          drawImage() {}, fillRect() {},
          fillStyle: "", globalCompositeOperation: "source-over",
        };
      },
    };
    return canvas;
  },
};
run("js/engine/sprites.js");

const testSprite = {
  palette: { x: "#f4f4f4" },
  frames: [[".x.", "xxx"]],
};
const builtSprite = G.makeSprite(testSprite);
assert.equal(builtSprite.outlines.length, 1, "sprites should receive a shared outline frame");
assert.equal(builtSprite.outlines[0].width, builtSprite.frames[0].width + 2);
assert.equal(builtSprite.outlines[0].height, builtSprite.frames[0].height + 2);

const expectedThemes = {
  riftbladeTrial: "riftblade",
  moleTrial: "mole",
  vampireTrial: "vampire",
  jesterTrial: "jester",
  godTrial: "god",
  turtleTrial: "turtle",
  samuraiTrial: "samurai",
  astronomerTrial: "astronomer",
  druidTrial: "druid",
  gauntletArena: "god",
};
for (const [mapId, theme] of Object.entries(expectedThemes)) {
  assert.equal(G.maps[mapId].visualTheme, theme, `${mapId} needs its own arena art`);
  assert.equal(G.maps[mapId].tiles.length, 17, `${mapId} geometry height changed`);
  assert.ok(G.maps[mapId].tiles.every((row) => row.length === 28), `${mapId} geometry width changed`);
}

const fenceScenes = {
  town: 8,
  sunkenMarsh: 4,
  shattercoast: 2,
  sunstepPrairie: 3,
  windscarCanyon: 3,
  hangingGardens: 3,
  rootdeepHollow: 3,
  glasswaterDesert: 3,
  frostbellTundra: 3,
  stormspinePeaks: 3,
  titanGrave: 3,
};
for (const [mapId, expectedRuns] of Object.entries(fenceScenes)) {
  const map = G.maps[mapId];
  assert.equal(map.fences.length, expectedRuns, mapId + " should use its restrained fence layout");
  const width = Math.max(...map.tiles.map((row) => row.length));
  for (const fence of map.fences) {
    assert.ok(["h", "v"].includes(fence.dir), mapId + " fence needs a valid direction");
    assert.ok(fence.length > 0, mapId + " fence needs visible length");
    const endX = fence.x + (fence.dir === "h" ? fence.length : 0);
    const endY = fence.y + (fence.dir === "v" ? fence.length : 0);
    assert.ok(fence.x >= 0 && fence.y >= 0 && endX < width && endY < map.tiles.length,
      mapId + " fence must stay inside the map");
  }
}
for (const mapId of Object.keys(fenceScenes).filter((id) => G.maps[id].worldwake)) {
  const fences = G.maps[mapId].fences;
  assert.equal(fences.filter((fence) => fence.dir === "h").length, 1,
    mapId + " camp should keep its south side visibly open");
  assert.equal(fences.filter((fence) => fence.dir === "v").length, 2,
    mapId + " camp needs two welcoming side rails");
}

function fakeCanvas() {
  let depth = 0;
  const ctx = {
    save() { depth++; },
    restore() { depth--; assert.ok(depth >= 0, "canvas restore underflow"); },
    fillRect() {}, beginPath() {}, arc() {}, stroke() {}, moveTo() {}, lineTo() {},
    translate() {}, rotate() {}, scale() {}, setLineDash() {}, drawImage() {},
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

const spriteCtx = fakeCanvas();
assert.doesNotThrow(() => G.drawSprite(spriteCtx, testSprite, 0, 20, 20, false));
assert.doesNotThrow(() => G.drawSprite(spriteCtx, testSprite, 0, 20, 20, true));
assert.doesNotThrow(() => G.drawSprite(spriteCtx, testSprite, 0, 20, 20, false, 2));
spriteCtx.assertBalanced();

console.log("visual polish tests passed");
