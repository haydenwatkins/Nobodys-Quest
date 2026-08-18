"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = (file) => fs.readFileSync(path.join(root, file), "utf8");

const ui = source("js/engine/ui.js");
const input = source("js/engine/input.js");
const audio = source("js/engine/audio.js");
const world = source("js/engine/world.js");
const index = source("index.html");

assert.ok(ui.includes("getBoundingClientRect") && ui.includes("backingW = cssW * previewDensity"),
  "Form Lab previews should match their real CSS box instead of stretching a fixed canvas");
assert.ok(ui.includes("SETTINGS & HELP") && ui.includes("Adventure slots") && ui.includes("Delete current adventure"));
assert.ok(!/menu-footer[\s\S]{0,240}data-act="reset"/.test(ui), "reset must stay out of the permanent footer");
assert.ok(index.includes('id="form-wheel"') && input.includes("SWAP_HOLD_MS"));
assert.ok(ui.includes("for (let i = 0; i < forms.length; i += 8)"), "the wheel should scale as stable pages of eight");
assert.ok(ui.includes("G.saveGame();") && ui.includes("commitFormWheel"));

const cueMatches = audio.match(/^\s{4}[a-z]+:\s+\[/gm) || [];
assert.ok(cueMatches.length >= 16, "the adaptive score should provide a broad regional cue library");
for (const layer of ["melody", "harmony", "bass", "percussion"])
  assert.ok(audio.includes(layer), `the score documentation should retain its ${layer} layer`);
for (const biome of ["sunbursts", "strata", "petals", "spores", "shards", "snow", "lightning", "runes"])
  assert.ok(world.includes(`\"${biome}\"`), `world rendering should include the ${biome} texture grammar`);
assert.ok(world.includes("BIOME_MATERIALS") && world.includes("drawHdWorldDetail"));

let scheduledMusic = null;
let oscillatorCount = 0;
let bufferSourceCount = 0;
const audioStore = new Map();
class FakeParam {
  setValueAtTime() {} exponentialRampToValueAtTime() {} cancelScheduledValues() {} setTargetAtTime() {}
}
class FakeNode {
  constructor() {
    this.gain = new FakeParam(); this.frequency = new FakeParam(); this.playbackRate = new FakeParam();
    this.type = "sine"; this.buffer = null;
  }
  connect(next) { return next; } start() {} stop() {}
}
class FakeBuffer {
  constructor(channels, length, rate) {
    this.duration = length / rate;
    this.channels = Array.from({ length: channels }, () => new Float32Array(length));
  }
  getChannelData(index) { return this.channels[index]; }
}
class FakeAudioContext {
  constructor() { this.state = "running"; this.currentTime = 0; this.sampleRate = 8000; this.destination = new FakeNode(); audioContext = this; }
  createGain() { return new FakeNode(); }
  createOscillator() { oscillatorCount++; return new FakeNode(); }
  createBuffer(channels, length, rate) { return new FakeBuffer(channels, length, rate); }
  createBufferSource() { bufferSourceCount++; return new FakeNode(); }
  resume() { this.state = "running"; }
}
let audioContext = null;
const audioVm = vm.createContext({ console, Math, Date,
  localStorage: { getItem: (key) => audioStore.get(key) || null, setItem: (key, value) => audioStore.set(key, value) },
  setInterval(fn) { scheduledMusic = fn; return 1; },
  document: { hidden: false },
  window: { AudioContext: FakeAudioContext },
  G: { state: { mapId: "sunstepPrairie", mapDef: { biome: "sunstep" }, enemies: [] } },
});
vm.runInContext(audio, audioVm, { filename: "audio.js" });
audioVm.G.sfx.ensure();
scheduledMusic();
assert.ok(bufferSourceCount >= 4, "one adaptive music beat should layer organic melody, bass, harmony, and rhythm samples");
assert.equal(oscillatorCount, 0, "regional music should no longer use steady synth oscillators");
assert.equal(audioVm.G.sfx.musicTheme, "sunstep");
audioVm.G.state.mapDef.biome = "frostbell";
audioContext.currentTime = 1;
scheduledMusic();
assert.equal(audioVm.G.sfx.musicTheme, "frostbell", "music should follow the active biome without reloading audio");

class FakeClassList {
  constructor() { this.values = new Set(["hidden"]); }
  add(value) { this.values.add(value); }
  remove(value) { this.values.delete(value); }
  contains(value) { return this.values.has(value); }
  toggle(value, force) { if (force) this.add(value); else this.remove(value); }
}
class FakeButton {
  constructor(dataset = {}) { this.dataset = dataset; this.classList = new FakeClassList(); this.listeners = {}; }
  addEventListener(type, fn) { this.listeners[type] = fn; }
}
class FakeOverlay {
  constructor() {
    this.classList = new FakeClassList(); this.style = { setProperty() {} }; this.attrs = {}; this.html = "";
  }
  set innerHTML(value) { this.html = value; }
  get innerHTML() { return this.html; }
  setAttribute(key, value) { this.attrs[key] = value; }
  choices() {
    return Array.from(this.html.matchAll(/data-wheel-form="([^"]+)" data-wheel-index="(\d+)"/g),
      (match) => new FakeButton({ wheelForm: match[1], wheelIndex: match[2] }));
  }
  querySelectorAll(selector) {
    if (selector === "[data-wheel-form]" || selector === "[data-wheel-index]") return this.choices();
    if (selector === "[data-wheel-page]")
      return Array.from(this.html.matchAll(/data-wheel-page="([^"]+)"/g), (match) => new FakeButton({ wheelPage: match[1] }));
    return [];
  }
  querySelector(selector) {
    if (selector === "[data-wheel-cancel]" || selector === ".form-wheel-ring") return new FakeButton();
    return null;
  }
}
const fakeUiCanvas = { style: {}, addEventListener() {}, getContext: () => ({}) };
const fakeMenu = new FakeOverlay();
const fakeWheel = new FakeOverlay();
const uiVm = vm.createContext({ console, Math, Date, Map, Set,
  window: { innerWidth: 800, innerHeight: 450, devicePixelRatio: 2, matchMedia: () => ({ matches: false }) },
  document: {
    fullscreenElement: null, documentElement: { clientWidth: 800, clientHeight: 450 },
    getElementById(id) { return id === "ui" ? fakeUiCanvas : id === "menu" ? fakeMenu : id === "form-wheel" ? fakeWheel : null; },
  },
  navigator: { standalone: false }, screen: {}, confirm: () => false,
});
vm.runInContext(source("js/engine/core.js") + ";this.G=G;", uiVm, { filename: "core.js" });
const wheelForms = Array.from({ length: 10 }, (_, i) => `form${i}`);
uiVm.G.forms = Object.fromEntries(wheelForms.map((id, i) => [id, { id, name: `Form ${i}`, icon: String(i) }]));
uiVm.G.state = { formId: "form0", player: {}, stars: 0 };
uiVm.G.unlockedForms = () => wheelForms;
uiVm.G.formUnlocked = (id) => wheelForms.includes(id);
uiVm.G.setForm = (id) => { uiVm.G.state.formId = id; };
uiVm.G.saveGame = () => {};
uiVm.G.sfx = { play() {} };
uiVm.G.input = { hasGamepad: false, vec: { x: 0, y: 0 }, clearTaps() {}, tapped: () => false };
vm.runInContext(ui, uiVm, { filename: "ui.js" });
assert.equal(uiVm.G.ui.openFormWheel({ x: 400, y: 220 }), true);
assert.equal(uiVm.G.ui.formWheelOpen, true);
assert.equal(uiVm.G.ui.aimFormWheel(500, 220), true);
assert.equal(uiVm.G.ui.commitFormWheel(), true);
assert.equal(uiVm.G.state.formId, "form2", "rightward radial aim should choose the right-hand wedge");
assert.equal(uiVm.G.ui.formWheelOpen, false);

let saved = 0;
const tutorialContext = vm.createContext({ console, Math, Date, G: {
  util: { clamp: (n, lo, hi) => Math.max(lo, Math.min(hi, n)), dist: () => 0 },
  state: { player: { x: 0, y: 0 } }, input: { hasGamepad: false, isTouch: true },
  sfx: { play() {} }, ui: { banner() {}, toast() {} },
  saveGame() { saved++; }, events: { on() {} },
} });
vm.runInContext(source("js/engine/tutorial.js"), tutorialContext, { filename: "tutorial.js" });
tutorialContext.G.tutorial.init({ tutorialStep: 2, tutorialDone: false });
assert.equal(tutorialContext.G.tutorial.prompt(), null, "existing saves should migrate without reopening the tutorial HUD");
assert.equal(tutorialContext.G.tutorial.seen, true);
assert.ok(saved > 0, "the quiet tutorial migration should persist immediately");
tutorialContext.G.tutorial.replay();
assert.ok(tutorialContext.G.tutorial.prompt(), "Help should deliberately replay tutorial hints");

// Ember Ridge once placed its normal arrival on a wall and contained isolated
// one-tile floor pockets. Every apparently walkable cell must now lead back to
// the entrance, so neither a portal arrival nor a recovery spawn can trap Ben.
const mapVm = vm.createContext({ console, Math, Date });
vm.runInContext(source("js/engine/core.js") + ";this.G=G;", mapVm, { filename: "core.js" });
vm.runInContext(source("js/engine/world.js"), mapVm, { filename: "world.js" });
vm.runInContext(source("js/data/maps.js"), mapVm, { filename: "maps.js" });
const ember = mapVm.G.maps.emberRidge;
const blocked = (x, y) => {
  const symbol = ember.tiles[y] && ember.tiles[y][x];
  const cell = ember.legend[symbol];
  return symbol === "#" || !!(cell && ["wall", "rock", "tree", "water"].includes(cell.tile));
};
assert.equal(blocked(ember.playerStart.x, ember.playerStart.y), false, "Ember Ridge must not spawn the player inside stone");
const emberRoad = mapVm.G.maps.overworld.legend.E.portal;
assert.equal(emberRoad.x, ember.playerStart.x);
assert.equal(emberRoad.y, ember.playerStart.y);
assert.equal(blocked(emberRoad.x, emberRoad.y), false, "Greenfield's Ember Ridge road must arrive on open floor");
const queue = [[ember.playerStart.x, ember.playerStart.y]];
const reached = new Set();
while (queue.length) {
  const [x, y] = queue.shift();
  const key = `${x},${y}`;
  if (reached.has(key) || y < 0 || y >= ember.tiles.length || x < 0 || x >= ember.tiles[y].length || blocked(x, y)) continue;
  reached.add(key);
  queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}
let walkable = 0;
for (let y = 0; y < ember.tiles.length; y++)
  for (let x = 0; x < ember.tiles[y].length; x++) if (!blocked(x, y)) walkable++;
assert.equal(reached.size, walkable, "every Ember Ridge floor tile should connect to its entrance");
assert.ok(!blocked(7, 9) && !blocked(8, 9) && !blocked(9, 11) && !blocked(10, 11),
  "the central stone ruin should keep two-tile escape lanes");

console.log("world polish tests passed");
