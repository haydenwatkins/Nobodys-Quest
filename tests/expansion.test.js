"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ console, Math, Date, window: { matchMedia: () => ({ matches: false }) } });
function run(file, suffix = "") {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8") + suffix, context, { filename: file });
}

run("js/engine/core.js", ";this.G = G;");
const G = context.G;
G.sfx = { play() {}, attack() {}, impact() {} };
G.ui = { toast() {}, banner() {}, update() {} };
G.saveGame = () => {};
G.checkUnlocks = () => {};
G.input = { vec: { x: 0, y: 0 }, tapped: () => false, clearTaps() {} };
G.reducedMotion = false;
run("js/engine/world.js");
run("js/engine/combat.js");
run("js/engine/entities.js");
run("js/data/enemies.js");
run("js/data/maps.js");
run("js/engine/gauntlet.js");

for (const id of ["ancientTreant", "mireQueen", "eclipseKnight", "riftbladeAdept", "moleMonarch",
  "countessCarmine", "royalFool", "admiralTortoise", "paperRonin", "professorPerihelion",
  "grandmotherBriar", "godAvatar"]) {
  assert.equal(G.enemies[id].boss.phases, 3, `${id} should have a three-act fight`);
  assert.ok(G.enemies[id].boss.introLines.length >= 3, `${id} should have a readable three-line introduction`);
}
assert.deepEqual(Array.from(G.enemies.godAvatar.boss.patterns.slice(3, 7)), ["shells", "crescent", "stars", "briar"]);
assert.ok(G.maps.shattercoast.tiles.every((row) => row.length === 48));
for (const id of ["turtleTrial", "samuraiTrial", "astronomerTrial", "druidTrial", "gauntletArena"])
  assert.ok(G.maps[id] && G.maps[id].tiles.every((row) => row.length === 28), `${id} should be a valid arena`);

// Every walkable Shattercoast tile connects to the arrival point. Solid tide
// pools must never leave tiny grass islands that look reachable but are not.
{
  const map = G.maps.shattercoast;
  const solid = new Set(["r", "w", "t", "#"]);
  const seen = new Set();
  const queue = [[map.playerStart.x, map.playerStart.y]];
  while (queue.length) {
    const [x, y] = queue.shift();
    const key = `${x},${y}`;
    if (seen.has(key) || y < 0 || y >= map.tiles.length || x < 0 || x >= map.tiles[y].length) continue;
    if (solid.has(map.tiles[y][x])) continue;
    seen.add(key);
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  let walkable = 0;
  for (const row of map.tiles) for (const ch of row) if (!solid.has(ch)) walkable++;
  assert.equal(seen.size, walkable, "every open Shattercoast tile should be reachable");
}

for (const id of ["tideCrab", "starMote", "admiralTortoise", "paperRonin", "professorPerihelion", "grandmotherBriar"]) {
  const sprite = G.enemies[id].sprite;
  for (const frame of sprite.frames) for (const row of frame) for (const pixel of row)
    assert.ok(pixel === "." || pixel === " " || sprite.palette[pixel], `${id} uses unknown sprite color '${pixel}'`);
}

G.forms.nobody = { id: "nobody", hearts: 4, speed: 80 };
G.playerForm = () => G.forms.nobody;
G.state = {
  player: G.makePlayer(), formId: "nobody", stars: 0,
  items: ["tide-shell", "paper-crane", "orrery-key", "elder-acorn", "mole-crown"],
  opened: [], known: [], claimedForms: [], loadouts: {}, pinnedQuestIds: [],
  hitStop: 0, shake: 0, cameraKickX: 0, cameraKickY: 0, time: 0,
};
G.world.load("overworld");

assert.equal(G.gauntletUnlocked(), true);
assert.equal(G.gauntletBossPool().length, 5);
assert.equal(G.startGauntlet(3, true), true);
assert.equal(G.state.mapId, "gauntletArena");
assert.equal(G.state.gauntletRun.bosses.length, 3);
assert.equal(new Set(G.state.gauntletRun.bosses).size, 3, "a run should not repeat a guardian");

G.updateGauntlet(1.2);
assert.equal(G.state.enemies.length, 1);
assert.equal(G.state.enemies[0].def.miniboss, true);
G.state.player.damageTaken = 2;
G.state.player.mana = 1;
G.gauntletBossDefeated(G.state.enemies[0]);
assert.equal(G.state.player.damageTaken, 1, "recovery runs restore one heart");
assert.equal(G.state.player.mana, 4, "recovery runs restore three mana");
G.updateGauntlet(2.1);
assert.equal(G.state.gauntletRun.index, 1);
assert.equal(G.state.enemies.length, 1);
assert.equal(G.state.enemies[0].hp, G.state.enemies[0].def.hp, "every round starts with a full-health boss");

G.gauntletBossDefeated(G.state.enemies[0]);
G.updateGauntlet(2.1);
G.gauntletBossDefeated(G.state.enemies[0]);
G.updateGauntlet(2.7);
assert.equal(G.state.mapId, "shattercoast");
assert.equal(G.state.gauntletBest, 3);
assert.equal(G.state.stars, 1, "a longer gauntlet record awards exactly one star");
assert.equal(G.state.gauntletRun, null);

console.log("expansion tests passed");
