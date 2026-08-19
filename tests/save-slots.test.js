"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
function storage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    values,
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
}

const legacy = JSON.stringify({ formId: "rat", stars: 7, claimedForms: ["rat"], items: [], mapId: "overworld" });
const localStorage = storage({ "nobodys-quest-save-v1": legacy });
const sessionStorage = storage();
let reloads = 0;
const context = vm.createContext({
  console, Math, Date, Map, Set, localStorage, sessionStorage,
  location: { reload() { reloads++; } },
  G: {
    state: null, forms: { nobody: { name: "Nobody", icon: "○" }, rat: { name: "Rat", icon: "🐀" } },
    maps: { overworld: { name: "Greenfield" } },
    events: { emit() {} }, questCounts: {}, questsDone: [],
  },
});
vm.runInContext(fs.readFileSync(path.join(root, "js/engine/save.js"), "utf8"), context, { filename: "save.js" });
const G = context.G;

assert.equal(JSON.stringify(G.loadSaveData(1)), legacy, "legacy progress should migrate into Slot 1");
assert.equal(localStorage.getItem("nobodys-quest-save-v1"), legacy, "migration should retain a recovery copy");
assert.equal(G.saveSlotSummaries().length, 3);
assert.equal(G.saveSlotSummaries()[0].stars, 7);
assert.equal(G.saveSlotSummaries()[1].empty, true);

G.state = {
  player: { x: 12, y: 14, damageTaken: 0, mana: 8 }, formId: "nobody", costumeId: "classic",
  stars: 2, items: [], opened: [], pantries: {}, known: [], claimedForms: [], unlockReadyNotified: [],
  loadouts: {}, npcTalk: {}, pinnedQuestIds: [], playSeconds: 125, story: { lastChapter: 0 }, mapId: "overworld",
};
G.tutorial = { step: 1, done: false, seen: true };
G.saveGame();
assert.equal(G.loadSaveData(1).playSeconds, 125);
assert.equal(JSON.stringify(G.loadSaveData(1).story), '{"lastChapter":0}');

G.selectSaveSlot(2, true);
assert.equal(G.activeSaveSlot, 2);
assert.equal(sessionStorage.getItem("nobodys-quest-auto-start"), "1");
assert.equal(reloads, 1);
G.state.stars = 19;
G.saveGame();
assert.equal(G.loadSaveData(1).stars, 2, "saving Slot 2 must not change Slot 1");
assert.equal(G.loadSaveData(2).stars, 19);
G.resetSave();
assert.equal(G.loadSaveData(2), null, "reset should delete only the active adventure");
assert.equal(G.loadSaveData(1).stars, 2, "other adventures must survive reset");

const overlay = {
  html: "", classList: { add() {}, remove() {} },
  set innerHTML(value) { this.html = value; }, get innerHTML() { return this.html; },
  querySelectorAll() { return []; },
  querySelector(selector) { return selector === ".save-slot-card" ? { focus() {} } : null; },
};
context.document = { activeElement: null, addEventListener() {}, removeEventListener() {},
  getElementById: (id) => id === "save-slots" ? overlay : null };
assert.equal(G.showSaveSlotScreen(true), true);
assert.match(overlay.html, /class="title-world-hero"/, "the selector should open inside the unified game world");
assert.match(overlay.html, /The prophecy chose the wrong name/);
assert.match(overlay.html, /class="title-transform-stage"/, "Nobody's form changing should be part of the title composition");
assert.match(overlay.html, /data-title-form="nobody"/, "Nobody should be the source of the title transformation");
assert.match(overlay.html, /class="title-chapter-panel"/);
assert.doesNotMatch(overlay.html, /stained-window|living-prophecy|title-archive/,
  "the discarded layered title scene should not survive the rebuild");
assert.equal((overlay.html.match(/data-save-slot=/g) || []).length, 3, "the storybook needs exactly three live chapters");

/* ---------- controller navigation (Android TV has no keyboard/pointer) ----------
   main.js calls G.updateSaveSlotInput once per frame while the title screen
   is open; it converts G.input menu taps into DOM focus moves and clicks. */

const tvDoc = {
  activeElement: null,
  addEventListener() {}, removeEventListener() {},
  getElementById: (id) => id === "save-slots" ? tvOverlay : null,
};

function fakeButton(name, dataset = {}) {
  return {
    name, dataset, listeners: {},
    addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); },
    click() { for (const fn of this.listeners.click || []) fn({}); },
    focus() { tvDoc.activeElement = this; },
  };
}

const slots = [1, 2, 3].map((n) => fakeButton(`slot${n}`, { saveSlot: String(n) }));
const opener = fakeButton("settings-opener");
const returnBtn = fakeButton("return");
const panel = {
  hiddenClass: true,
  buttons: [fakeButton("music"), fakeButton("sound"), fakeButton("done")],
  classList: {
    contains(c) { return c === "hidden" ? panel.hiddenClass : false; },
    add(c) { if (c === "hidden") panel.hiddenClass = true; },
    remove(c) { if (c === "hidden") panel.hiddenClass = false; },
  },
  querySelectorAll(sel) { return sel === "button" ? panel.buttons : []; },
  querySelector(sel) { return sel === "button" ? panel.buttons[0] : null; },
};
const tvOverlay = {
  html: "",
  set innerHTML(value) { this.html = value; }, get innerHTML() { return this.html; },
  classList: { add() {}, remove() {}, toggle() {} },
  style: {},
  querySelectorAll: (sel) => sel === "[data-save-slot]" ? slots : [],
  querySelector(sel) {
    if (sel.startsWith(".save-slot-card")) {
      const bySlot = sel.match(/data-save-slot="(\d)"/);
      return bySlot ? slots[Number(bySlot[1]) - 1] : slots[0];
    }
    if (sel === "[data-title-settings-panel]") return panel;
    if (sel === "[data-title-return]") return returnBtn;
    if (sel === "[data-title-settings]") return opener;
    return null;
  },
};

const taps = {};
const tap = (btn) => { taps[btn] = true; };
context.G.input = {
  tapped(btn) {
    if (taps[btn]) { taps[btn] = false; return true; }
    return false;
  },
};
const emitted = [];
context.G.events.emit = (name) => emitted.push(name);

context.document = tvDoc;
assert.equal(G.showSaveSlotScreen(true), true);
assert.equal(typeof G.updateSaveSlotInput, "function", "the title screen should expose a controller updater");
assert.equal(tvDoc.activeElement, slots[1], "the active adventure should start highlighted");

tap("menuDown");
G.updateSaveSlotInput();
assert.equal(tvDoc.activeElement, slots[2], "controller down should move the chapter highlight");

tap("menuRight");
G.updateSaveSlotInput();
assert.equal(tvDoc.activeElement, opener, "the controller should be able to reach Settings");

tap("confirm");
G.updateSaveSlotInput();
assert.equal(panel.hiddenClass, false, "confirm should open the settings panel");
assert.equal(tvDoc.activeElement, panel.buttons[0], "focus should follow into the settings panel");

tap("menuDown");
G.updateSaveSlotInput();
assert.equal(tvDoc.activeElement, panel.buttons[1], "the controller should navigate settings buttons");

tap("back");
G.updateSaveSlotInput();
assert.equal(panel.hiddenClass, true, "B should close the settings panel");
assert.equal(tvDoc.activeElement, slots[0], "closing settings should return focus to the chapters");

slots[1].focus();
tap("confirm");
G.updateSaveSlotInput();
assert.equal(G.saveSlotScreenOpen, false, "confirming the active adventure should start the game");
assert.ok(emitted.includes("saveSlotReady"), "starting an adventure should announce the chosen save");
assert.equal(G.updateSaveSlotInput, null, "the controller updater should be released with the screen");

console.log("save slot tests passed");
