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
const dialogues = [];
G.sfx = { play() {} };
G.ui = {
  dialogue(title, text) { dialogues.push({ title, text }); },
  toast() {},
};
G.input = { vec: { x: 0, y: 0 } };
G.saveGame = () => {};
G.makeEnemy = (id, x, y) => ({ id, x, y, dead: false });
G.formOrder = ["nobody", "rat", "god"];
G.forms = {
  nobody: { id: "nobody", name: "Nobody" },
  rat: { id: "rat", name: "Rat" },
  god: { id: "god", name: "God" },
};
const levels = { nobody: 5, rat: 2, god: 1 };
G.formLevel = (id) => levels[id] || 1;
G.WORLDWAKE_MARKS = {
  lantern: { id: "light", name: "Lantern Mark", region: "stormspinePeaks" },
};
G.hasWorldMark = () => false;
run("js/engine/world.js");

G.maps.destination = {
  id: "destination", name: "The Useful Dungeon", playerStart: { x: 1, y: 1 },
  tiles: ["###", "#.#", "###"],
};
G.maps.stormspinePeaks = { id: "stormspinePeaks", name: "Stormspine Peaks" };

G.state = { stars: 1 };
const combined = G.world.portalBlockReason({
  portal: { map: "destination", x: 1, y: 1 },
  stars: 3,
  mastery: { before: "god", level: 5 },
  mark: "light",
});
assert.equal(combined.title, "🔒 THE USEFUL DUNGEON", "the message should name the blocked destination");
assert.match(combined.text, /Earn 2 more stars/);
assert.match(combined.text, /3 required; 1 held/);
assert.match(combined.text, /form quests/);
assert.match(combined.text, /Rat \(level 2\).*level 5/);
assert.match(combined.text, /Forms menu/);
assert.match(combined.text, /Worldbearer in Stormspine Peaks/);
assert.match(combined.text, /Lantern Mark/);

// A locked tile is solid, so contact must be recognized from the adjacent
// walkable tile. The dialogue should fire once per attempt, not every frame.
G.maps.gateTest = {
  id: "gateTest", name: "Gate Test", playerStart: { x: 1, y: 1 },
  legend: {
    D: { tile: "path", portal: { map: "destination", x: 1, y: 1 }, stars: 3 },
  },
  tiles: ["####", "#.D#", "####"],
};
G.state = {
  player: { x: 0, y: 0, dashing: null, dir: { x: 1, y: 0 }, lastSafe: null },
  stars: 1, items: [], opened: [], pantries: {}, worldwake: { marks: [] },
  gauntletRun: null, knockout: null, bossCutscene: null,
};
G.world.load("gateTest");
G.state.portalNeedsRelease = false;
G.state.portalGrace = 0;
G.input.vec = { x: 1, y: 0 };
assert.equal(G.world.solid(2 * G.TILE + G.TILE / 2, G.TILE + G.TILE / 2), true);
G.world.checkTriggers(0.016);
assert.equal(dialogues.length, 1, "pressing against a locked dungeon should explain the lock");
assert.match(dialogues[0].text, /Earn 2 more stars/);
G.world.checkTriggers(0.016);
assert.equal(dialogues.length, 1, "holding against the entrance should not repeat the message every frame");

G.input.vec = { x: 0, y: 0 };
G.world.checkTriggers(0.016);
G.input.vec = { x: 1, y: 0 };
G.world.checkTriggers(0.016);
assert.equal(dialogues.length, 2, "leaving and trying the entrance again should show the help again");

console.log("portal message tests passed");
