"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
function storage(seed) {
  const values = new Map(Object.entries(seed || {}));
  return {
    values,
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
}
function makeContext(localStorage) {
  const context = vm.createContext({
    console, Math, Date, Map, Set, localStorage,
    window: { matchMedia: () => ({ matches: false }) },
  });
  vm.runInContext(fs.readFileSync(path.join(root, "js/engine/core.js"), "utf8") + ";this.G = G;", context);
  vm.runInContext(fs.readFileSync(path.join(root, "js/engine/comfort.js"), "utf8"), context);
  return context.G;
}

const settingsStore = storage();
const G = makeContext(settingsStore);
G.state = { player: { x: 10, y: 12, damageTaken: 3, easyRegenDelay: 0, easyRegenProgress: 0 } };
G.sfx = { play() {} };
G.damageNumber = () => {};

assert.equal(G.comfortSetting("bossAssistance"), false, "boss assistance must be off for every new installation");
assert.equal(G.comfortSetting("easyMode"), false, "easy mode must be opt-in");
G.updateComfortRecovery(60);
assert.equal(G.state.player.damageTaken, 3, "hearts must not regenerate while easy mode is off");

assert.equal(G.setComfortSetting("easyMode", true), true);
assert.equal(JSON.parse(settingsStore.getItem("nobodys-quest-comfort-v1")).easyMode, true,
  "comfort choices should persist across adventure slots and reloads");
G.updateComfortRecovery(2);
assert.equal(G.state.player.damageTaken, 3, "the two-second safety breather should not count as regeneration time");
G.updateComfortRecovery(5.9);
assert.equal(G.state.player.damageTaken, 3);
assert.equal(G.updateComfortRecovery(0.1), 1);
assert.equal(G.state.player.damageTaken, 2, "easy mode should restore exactly one heart per six seconds");
assert.equal(G.updateComfortRecovery(12), 2);
assert.equal(G.state.player.damageTaken, 0, "regeneration should stop cleanly at full health");

G.state.player.damageTaken = 2;
G.state.player.easyRegenDelay = 0;
G.state.player.easyRegenProgress = 5;
G.delayEasyModeRecovery();
assert.equal(G.state.player.easyRegenProgress, 5, "taking damage must retain earned regeneration progress");
G.updateComfortRecovery(2.9);
assert.equal(G.state.player.damageTaken, 2, "taking damage should pause recovery for two seconds");
G.updateComfortRecovery(0.1);
assert.equal(G.state.player.damageTaken, 1);

G.setComfortSetting("easyMode", false);
G.updateComfortRecovery(60);
assert.equal(G.state.player.damageTaken, 1, "turning easy mode off should immediately restore the original rules");

G.playerMaxHearts = () => G.comfortSetting("bossAssistance") ? 7 : 5;
G.setComfortSetting("bossAssistance", true);
G.state.player.damageTaken = 6;
G.setComfortSetting("bossAssistance", false);
assert.equal(G.state.player.damageTaken, 4,
  "removing temporary boss hearts should leave the player safely alive");

const reloaded = makeContext(settingsStore);
assert.equal(reloaded.comfortSetting("easyMode"), false);
assert.equal(reloaded.comfortSetting("bossAssistance"), false);
const corrupt = makeContext(storage({ "nobodys-quest-comfort-v1": "not-json" }));
assert.equal(corrupt.comfortSetting("easyMode"), false, "invalid old preferences should fail safely to off");

const ui = fs.readFileSync(path.join(root, "js/engine/ui.js"), "utf8");
const save = fs.readFileSync(path.join(root, "js/engine/save.js"), "utf8");
for (const control of ["boss-assistance", "easy-mode"])
  assert.ok(ui.includes(`data-act="${control}"`), `${control} should be available in the in-game settings`);
for (const control of ["data-title-boss-assistance", "data-title-easy-mode"])
  assert.ok(save.includes(control), `${control} should be available before choosing an adventure`);
const entities = fs.readFileSync(path.join(root, "js/engine/entities.js"), "utf8");
assert.ok(entities.includes("G.delayEasyModeRecovery") && entities.includes("G.updateComfortRecovery"),
  "damage and the player loop should both honor easy-mode recovery timing");

console.log("comfort mode tests passed");
