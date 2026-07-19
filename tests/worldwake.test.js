"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ console, Math, Date, Map, Set, WeakMap,
  window: { matchMedia: () => ({ matches: false }) } });
function run(file, suffix = "") {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8") + suffix, context, { filename: file });
}

run("js/engine/core.js", ";this.G = G;");
const G = context.G;
G.sfx = { play() {}, attack() {}, impact() {} };
G.ui = { toast() {}, banner() {}, update() {} };
G.saveGame = () => {};
G.input = { vec: { x: 0, y: 0 }, tapped: () => false, clearTaps() {} };
G.checkCostumeUnlocks = () => [];
run("js/engine/world.js");
run("js/engine/combat.js");
run("js/engine/entities.js");
run("js/engine/forms.js");
run("js/abilities/basics.js");
for (const file of ["nobody", "rat", "knight", "ranger", "wizard", "frog", "alchemist", "stormcaller",
  "dragon", "riftblade", "mole", "vampire", "jester", "turtle", "samurai", "astronomer", "druid",
  "griffin", "golem", "weaver", "bellkeeper", "lantern-wisp", "colossus", "god"])
  run(`js/forms/${file}.js`);
run("js/engine/quests.js");
run("js/engine/passives.js");
run("js/data/enemies.js");
run("js/data/maps.js");
run("js/engine/worldwake.js");
G.validateCrossRefs();

G.state = {
  player: G.makePlayer(), formId: "griffin", stars: 0, items: [], opened: [], known: [],
  claimedForms: G.formOrder.filter((id) => id !== "nobody"), unlockReadyNotified: [], loadouts: {},
  pinnedQuestIds: [], worldwake: G.makeWorldwake(), enemies: [], projectiles: [], pickups: [],
  shake: 0, hitStop: 0, cameraKickX: 0, cameraKickY: 0, time: 5,
};

G.world.load("sunstepPrairie");
assert.deepEqual(Array.from(G.state.worldwake.discovered), ["sunstepPrairie"]);
assert.equal(G.state.mapW, 46);
assert.equal(G.state.mapH, 29);

for (const region of G.WORLDWAKE_REGIONS) {
  const map = G.maps[region.id];
  const solidChars = new Set(["t", "r", "w", "#"]);
  const seen = new Set();
  const queue = [[map.playerStart.x, map.playerStart.y]];
  while (queue.length) {
    const [x, y] = queue.shift();
    const key = `${x},${y}`;
    if (seen.has(key) || y < 0 || y >= map.tiles.length || x < 0 || x >= map.tiles[y].length) continue;
    if (solidChars.has(map.tiles[y][x])) continue;
    seen.add(key);
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  let walkable = 0;
  for (const row of map.tiles) for (const ch of row) if (!solidChars.has(ch)) walkable++;
  assert.equal(seen.size, walkable, `${region.name} should have no inaccessible pockets or blocked rewards`);
  for (const cell of Object.values(map.legend)) {
    if (cell.portal) assert.ok(G.maps[cell.portal.map], `${region.name} should not point to a missing region`);
  }
}

// The southern horizon is a true shortcut: collision opens when the Sky Mark
// is earned, with no new traversal button or inventory micromanagement.
const southX = 23 * G.TILE + G.TILE / 2;
const southY = 28 * G.TILE + G.TILE / 2;
assert.equal(G.world.solid(southX, southY), true);
G.events.emit("pickup", { item: "trophy-sky-sovereign" });
assert.ok(G.state.worldwake.marks.includes("sky"));
assert.equal(G.world.solid(southX, southY), false);

// Exploration favors remember unique actions rather than rewarding spam.
for (const ability of ["wingbeat", "featherGale", "skyDive", "ghostlight", "stitchline"])
  G.events.emit("abilityUse", { ability, form: "griffin" });
assert.equal(G.state.worldwake.stylesUsed.length, 5);
for (let i = 0; i < 6; i++) G.events.emit("sign", { message: `Caravan story ${i}` });
assert.ok(G.state.worldwake.favorsDone.includes("campfireStories"));
assert.ok(G.state.worldwake.favorsDone.includes("manyWays"));

// Masonry and Safe Light are defensive geometry, not hidden damage boosts.
G.state.formId = "golem";
G.state.player.dir = { x: 1, y: 0 };
G.passives.onAbilityUse(G.state.player, "rampartPulse");
assert.equal(G.state.passiveShelters.length, 1);
const wall = G.state.passiveShelters[0];
G.state.projectiles.push({
  x: wall.x, y: wall.y, vx: 0, vy: 0, speed: 0, damage: 2, size: 3,
  color: "#b13e53", startX: wall.x, startY: wall.y, range: 100,
  fromPlayer: false, armT: 0, trail: [], trailLength: 0,
});
G.combat.updateProjectiles(0.016);
assert.equal(G.state.projectiles.length, 0, "Masonry should swallow a hostile shot without hurting anything");

// The final form remains last and now genuinely includes the whole expansion.
assert.equal(G.formOrder.at(-1), "god");
assert.equal(G.formOrder.length, 24);
assert.equal(G.abilities.worldBreak.damage, undefined, "ability metadata must not smuggle a passive damage bonus");
assert.equal(G.forms.colossus.hearts, 8);
assert.equal(G.forms.colossus.speed, 48);

console.log("worldwake tests passed");
