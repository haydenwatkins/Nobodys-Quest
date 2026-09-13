"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const taps = {};
const pointerHandlers = {};
const sounds = [];

function fakeContext() {
  return {
    fillStyle: "", font: "", globalAlpha: 1, textBaseline: "top",
    setTransform() {}, clearRect() {}, fillRect() {}, fillText() {},
    measureText(text) { return { width: String(text).length * 5 }; },
  };
}

const uiCanvas = {
  style: {}, width: 320, height: 180,
  getContext: fakeContext,
  addEventListener(type, handler) { pointerHandlers[type] = handler; },
};
const gameCanvas = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 180 }) };
const menu = {
  classList: { add() {}, remove() {} },
  querySelectorAll: () => [], querySelector: () => null,
};
const elements = { ui: uiCanvas, game: gameCanvas, menu };
const context = vm.createContext({
  console,
  window: { devicePixelRatio: 1, matchMedia: () => ({ matches: false }) },
  document: { getElementById: (id) => elements[id] || { classList: { add() {}, remove() {} } } },
  Event: function Event(type) { this.type = type; },
  G: {
    W: 320, H: 180,
    input: {
      isTouch: false, hasGamepad: false,
      tapped(button) { if (!taps[button]) return false; taps[button] = false; return true; },
    },
    sfx: { ensure() {}, play(name) { sounds.push(name); } },
    state: {
      player: { mana: 6, manaMax: 6, cooldowns: {}, passiveBarrier: 0 },
      enemies: [], stars: 0, formId: "nobody", mapId: "overworld",
      mapDef: { name: "Overworld" }, mapW: 0, mapH: 0, grid: [], time: 0,
      bossCutscene: null,
    },
    fx: [], abilities: {}, DAMAGE_TYPES: {},
    playerForm: () => ({ id: "nobody", icon: "?", name: "Nobody" }),
    playerMaxHearts: () => 4, playerHp: () => 4, formLevel: () => 1,
    pinnedQuests: () => [], getLoadout: () => [],
  },
});

vm.runInContext(fs.readFileSync(path.join(root, "js/engine/ui.js"), "utf8"), context, { filename: "ui.js" });
const G = context.G;

let closed = 0;
G.ui.dialogue("Pebble", "A deliberately readable line.", { onClose() { closed++; } });
assert.equal(G.ui.dialogueOpen, true);
assert.equal(G.ui.dialogueQueueLength, 1);
assert.equal(uiCanvas.style.pointerEvents, "auto", "dialogue should capture easy full-screen touch input");
assert.doesNotThrow(() => G.ui.drawHUD({ x: 0, y: 0 }), "the dialogue box should render on the real HUD path");

// An early action reveals the complete typewriter line without dismissing it.
taps.a = true;
G.ui.update(0.2);
assert.equal(G.ui.dialogueOpen, true, "the first action should finish the line, not skip it");
assert.equal(closed, 0);

// A separate, deliberate action advances after the full line is visible.
taps.a = true;
G.ui.update(0.2);
assert.equal(G.ui.dialogueOpen, false);
assert.equal(closed, 1);
assert.equal(uiCanvas.style.pointerEvents, "none");

// Conversations queue in order and remain modal until every line is read.
G.ui.dialogue("Boss", "First line");
G.ui.dialogue("Boss", "Second line");
assert.equal(G.ui.dialogueQueueLength, 2);
G.ui.update(1);
pointerHandlers.pointerdown({ preventDefault() {} });
G.ui.update(0.2);
assert.equal(G.ui.dialogueQueueLength, 1, "touch should advance exactly one completed line");
assert.equal(G.ui.dialogueOpen, true);

assert.ok(sounds.includes("menu"), "dialogue should provide an audible opening/advance cue");

for (const file of ["npcs.js", "world.js", "entities.js", "combat.js", "worldwake.js"]) {
  const source = fs.readFileSync(path.join(root, "js/engine", file), "utf8");
  assert.match(source, /G\.ui\.dialogue/, `${file} should route story interactions through the dialogue box`);
}

console.log("dialogue tests passed");
