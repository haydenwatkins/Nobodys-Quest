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
assert.ok(ui.includes("SETTINGS & HELP") && ui.includes("Save data") && ui.includes("Erase all progress"));
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
const audioStore = new Map();
class FakeParam {
  setValueAtTime() {} exponentialRampToValueAtTime() {} cancelScheduledValues() {} setTargetAtTime() {}
}
class FakeNode {
  constructor() { this.gain = new FakeParam(); this.frequency = new FakeParam(); this.type = "sine"; }
  connect(next) { return next; } start() {} stop() {}
}
class FakeAudioContext {
  constructor() { this.state = "running"; this.currentTime = 0; this.destination = new FakeNode(); audioContext = this; }
  createGain() { return new FakeNode(); }
  createOscillator() { oscillatorCount++; return new FakeNode(); }
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
assert.ok(oscillatorCount >= 4, "one adaptive music beat should layer melody, bass, harmony, and rhythm");
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

console.log("world polish tests passed");
