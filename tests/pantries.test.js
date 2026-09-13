"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({
  console, Math, Date, Map, Set, WeakMap,
  window: { matchMedia: () => ({ matches: false }) },
});
function run(file, suffix = "") {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8") + suffix, context, { filename: file });
}

run("js/engine/core.js", ";this.G = G;");
const G = context.G;
G.sfx = { play() {}, attack() {}, impact() {} };
G.ui = { toast() {}, banner() {}, update() {} };
G.saveGame = () => {};
G.checkUnlocks = () => {};
G.input = {
  vec: { x: 0, y: 0 }, tapped: () => false, clearTaps() {}, takeAim: () => null,
};
G.getLoadout = () => [];
G.formLevel = () => 1;

run("js/engine/world.js");
run("js/engine/entities.js");
run("js/data/enemies.js");
run("js/data/maps.js");

G.forms.nobody = { id: "nobody", name: "Nobody", icon: "?", speed: 80, hearts: 4, slots: 1 };
G.state = {
  player: G.makePlayer(), formId: "nobody", opened: [], pantries: {}, items: [], stars: 0,
  enemies: [], projectiles: [], pickups: [], shake: 0, hitStop: 0,
  cameraKickX: 0, cameraKickY: 0, time: 0,
};

G.world.load("overworld");
let pantry = G.state.chests.find((chest) => chest.food);
assert.ok(pantry, "ordinary healing chests should become renewable trail pantries");
assert.equal(pantry.opened, false);

// Legacy saves may still list the old one-time cookie key as opened. It must
// no longer seal the converted pantry forever.
G.state.opened.push(pantry.key);
G.world.load("overworld");
pantry = G.state.chests.find((chest) => chest.key === pantry.key);
assert.equal(pantry.opened, false, "legacy opened keys must not suppress renewable food");

const p = G.state.player;
p.x = pantry.x * G.TILE + G.TILE / 2;
p.y = pantry.y * G.TILE + G.TILE / 2;
p.damageTaken = 3;
G.world.checkTriggers({ x: 0, y: 0 });
const record = G.state.pantries[pantry.key];
assert.ok(record && record.servings === 1);
assert.ok(record.readyAt - Date.now() > 88000, "pantry should begin a real ninety-second refill");
assert.equal(G.playerHp(), G.playerMaxHearts(), "every trail treat should fully heal");
assert.equal(G.state.opened.filter((key) => key === pantry.key).length, 1,
  "renewable servings must not add more permanent opened entries");
assert.equal([
  p.pantryGuard > 0, p.pantryHasteT > 0, p.pantryQuickT > 0, p.pantryMagnetT > 0,
].filter(Boolean).length, 1, "a serving should grant exactly one rotating treat effect");

// Refilling under the player's feet should never auto-consume the next meal.
record.readyAt = Date.now() - 1;
pantry.readyAt = record.readyAt;
G.world.checkTriggers({ x: 0, y: 0 });
assert.equal(record.servings, 1);
assert.equal(pantry.needsLeave, true);
p.x = 0; p.y = 0;
G.world.checkTriggers({ x: 0, y: 0 });
assert.equal(pantry.needsLeave, false);
p.x = pantry.x * G.TILE + G.TILE / 2;
p.y = pantry.y * G.TILE + G.TILE / 2;
G.world.checkTriggers({ x: 0, y: 0 });
assert.equal(record.servings, 2, "leaving and returning should serve the replenished treat");

// Wardcake is a true one-hit guard, and Quickjam changes recovery speed rather
// than damage. These fields are shared by every form without changing it.
p.pantryGuard = 1;
p.invuln = 0;
p.damageTaken = 0;
assert.equal(G.damagePlayer(1, p.x + 10, p.y), false);
assert.equal(p.damageTaken, 0);
assert.equal(p.pantryGuard, 0);
p.pantryQuickT = 2;
p.cooldowns = { testMove: 2 };
G.updatePlayer(0.2);
assert.ok(p.cooldowns.testMove < 1.74, "Quickjam should recover cooldowns thirty-five percent faster");

console.log("pantry tests passed");
