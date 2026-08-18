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

console.log("save slot tests passed");
