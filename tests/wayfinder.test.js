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
G.sfx = { play() {} };
G.ui = { toast() {}, banner() {} };
G.saveGame = () => {};
G.checkUnlocks = () => {};
G.makeEnemy = (id, x, y) => ({ id, x, y, dead: false });
run("js/engine/world.js");
run("js/data/maps.js");
run("js/engine/wayfinder.js");

assert.equal(G.WAYFINDER_REGIONS.length, 8, "the Journal should track the eight major adventure regions");
assert.equal(new Set(G.WAYFINDER_REGIONS.map((region) => region.id)).size, G.WAYFINDER_REGIONS.length);
for (const region of G.WAYFINDER_REGIONS) {
  assert.ok(G.maps[region.id], `${region.id} must refer to a real map`);
  assert.ok(region.clue && region.spawn, `${region.id} needs a clue and safe travel point`);
  if (region.id !== "overworld") {
    const entrance = Object.values(G.maps.overworld.legend).find((cell) => cell.portal && cell.portal.map === region.id);
    assert.ok(entrance, `${region.id} needs a Greenfield entrance`);
    assert.equal(entrance.stars || 0, region.stars, `${region.id} Journal requirement must match its door`);
  }
}
assert.equal(G.wayfinderLandmarkIds().length, 16, "all fifteen guardian trials and the coliseum are landmarks");

// Starfall's western vault and lore room used to be sealed on all four sides.
// Verify the permanent reward and both signs are reachable without a wall-skip.
{
  const map = G.maps.starfallRuins;
  const solid = (x, y) => {
    const char = map.tiles[y] && map.tiles[y][x];
    const cell = (map.legend && map.legend[char]) || ({ "#": { tile: "wall" }, R: { tile: "rock" } })[char];
    return !char || !!(cell && ["wall", "rock", "tree", "water"].includes(cell.tile));
  };
  const found = new Set();
  const queue = [[map.playerStart.x, map.playerStart.y]];
  while (queue.length) {
    const [x, y] = queue.shift();
    const key = `${x},${y}`;
    if (found.has(key) || solid(x, y)) continue;
    found.add(key);
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  const locate = (char) => {
    for (let y = 0; y < map.tiles.length; y++) {
      const x = map.tiles[y].indexOf(char);
      if (x >= 0) return `${x},${y}`;
    }
    return null;
  };
  for (const char of ["H", "m", "s"])
    assert.ok(found.has(locate(char)), `Starfall '${char}' must be reachable by ordinary movement`);
  assert.equal(map.legend.H.chest.item, "starfall-thread");
  assert.equal(map.legend.H.chest.heal, true, "the difficult vault should also restore the player");
  assert.ok(map.tiles.every((row) => row.length === 30), "Starfall rows should keep a consistent width");
}

const migrated = G.normalizeWayfinder(null, {
  mapId: "emberRidge",
  opened: ["starfallRuins:6,4", "not-a-map:1,1"],
  items: ["trophy-heartwood-crown", "trophy-mire-pearl", "whispering-seed", "tide-shell"],
});
for (const id of ["overworld", "emberRidge", "starfallRuins", "mistwood", "sunkenMarsh", "whispering-grove", "shattercoast"])
  assert.ok(migrated.discovered.includes(id), `legacy evidence should recover ${id}`);
assert.ok(!migrated.discovered.includes("not-a-map"));
for (const id of migrated.discovered)
  assert.ok(migrated.posts.includes(id), `legacy visit evidence should awaken ${id}'s migrated post`);

G.state = {
  player: { x: 0, y: 0, dashing: null, lastSafe: null },
  stars: 0, items: [], opened: [], wayfinder: G.makeWayfinder(),
  gauntletRun: null, knockout: null, bossCutscene: null, shake: 0,
};
G.world.load("overworld");
assert.ok(G.wayfinderDiscovered("overworld"), "Greenfield records itself on a new save");
assert.equal(G.wayfinderProgress().found, 1);
assert.ok(G.wayfinderPostActivated("overworld"), "the arrival post awakens on the first visit");
assert.ok(G.nearWayfinderPost(), "regional arrivals place the player beside their post");
assert.equal(G.canWayfinderTravel(), true, "an awakened post allows early station travel");

G.discoverWayfinderMap("mistwood", true);
assert.equal(G.travelToWayfinderRegion("mistwood"), false, "a destination needs an awakened post");
G.activateWayfinderPost("mistwood", true);
assert.equal(G.travelToWayfinderRegion("mistwood"), true, "posts allow travel before the Whistle");
assert.equal(G.state.mapId, "mistwood");
assert.equal(G.state.player.x, 2 * G.TILE + G.TILE / 2);
assert.equal(G.state.player.y, 1 * G.TILE + G.TILE / 2);
assert.equal(G.travelToWayfinderRegion("mistwood"), false, "traveling to the current region is a no-op");

for (const id of ["dungeon", "sunkenMarsh"]) G.discoverWayfinderMap(id, true);
assert.equal(G.wayfinderProgress().found, 4);
assert.ok(G.state.items.includes("wayfinder-whistle"), "four regions earn anywhere-safe travel");
assert.equal(G.state.wayfinder.whistleClaimed, true);

for (const region of G.WAYFINDER_REGIONS) {
  G.discoverWayfinderMap(region.id, true);
  G.activateWayfinderPost(region.id, true);
}
assert.equal(G.wayfinderProgress().found, 8);
assert.equal(G.state.stars, 3, "finishing The Long Way Around awards three stars exactly once");
assert.ok(G.state.items.includes("wayfinder-whistle"));
assert.equal(G.state.wayfinder.rewardClaimed, true);
assert.equal(G.checkWayfinderCompletion(true), false, "the completion reward cannot repeat");
assert.equal(G.wayfinderLandmarkTravelUnlocked(), true, "full exploration unlocks landmark travel");

G.world.load("riftbladeTrial");
assert.equal(G.canWayfinderTravel(), false, "the Whistle cannot escape a guardian trial");
assert.equal(G.discoveredWayfinderLandmarks().length, 1, "landmarks reveal only after entry");
G.state.mapDef = { bossTrial: { worldBoss: true } };
G.state.enemies = [{ dead: false, def: { miniboss: true }, bossEngaged: true }];
G.state.projectiles = [{ fromPlayer: false }];
assert.equal(G.canWayfinderTravel(), true, "an engaged open-world boss must not close fast travel");
assert.match(G.wayfinderTravelReason(), /combat does not close/i);
G.state.mapDef = G.maps.overworld;
G.state.gauntletRun = { wins: 1 };
assert.equal(G.canWayfinderTravel(), false, "the Whistle cannot escape a gauntlet");

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
assert.ok(index.indexOf("js/engine/wayfinder.js") < index.indexOf("js/engine/main.js"));
assert.ok(index.includes('id="btn-map"'), "touch players need a dedicated map button");
const ui = fs.readFileSync(path.join(root, "js/engine/ui.js"), "utf8");
for (const text of ["Wayfinder Atlas", "Undiscovered region", "YOU ARE HERE", "Discovered landmarks", "WORLD", "LOCAL"])
  assert.ok(ui.includes(text), `Atlas UI should include '${text}'`);
assert.equal(G.WAYFINDER_ATLAS_NODES.length, 16, "the Atlas should show both eight-region journeys together");
assert.equal(G.WAYFINDER_ATLAS_EDGES.length, 16, "the route diagram should connect the Worldwake road at both ends");

console.log("wayfinder tests passed");
