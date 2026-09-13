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
G.sfx = { play() {} };
G.ui = { toast() {}, banner() {} };
G.saveGame = () => {};
run("js/engine/world.js");
run("js/engine/combat.js");
run("js/engine/entities.js");
run("js/data/enemies.js");
run("js/data/maps.js");
run("js/engine/endgame.js");
run("js/engine/worldwake.js");
run("js/data/npcs.js");
run("js/engine/npcs.js");

function portalCells(map) {
  const found = [];
  for (let y = 0; y < map.tiles.length; y++) {
    for (let x = 0; x < map.tiles[y].length; x++) {
      const cell = map.legend[map.tiles[y][x]];
      if (cell && cell.portal) found.push({ x, y, cell });
    }
  }
  return found;
}

function edgeOf(map, portal) {
  const h = map.tiles.length;
  const w = map.tiles[portal.y].length;
  if (portal.x === 0) return "west";
  if (portal.x === w - 1) return "east";
  if (portal.y === 0) return "north";
  if (portal.y === h - 1) return "south";
  return null;
}

const opposite = { west: "east", east: "west", north: "south", south: "north" };
const checkedPairs = new Set();
for (const [mapId, map] of Object.entries(G.maps)) {
  for (const portal of portalCells(map).filter((entry) => entry.cell.portalStyle === "gap")) {
    const destinationId = portal.cell.portal.map;
    const destination = G.maps[destinationId];
    assert.ok(destination, mapId + " must not lead to missing map " + destinationId);
    const returns = portalCells(destination).filter((entry) =>
      entry.cell.portalStyle === "gap" && entry.cell.portal.map === mapId);
    assert.equal(returns.length, 1, mapId + " and " + destinationId + " need one reciprocal edge path");
    const back = returns[0];
    const fromEdge = edgeOf(map, portal);
    const backEdge = edgeOf(destination, back);
    assert.ok(fromEdge, mapId + "'s gap to " + destinationId + " must sit on the map edge");
    assert.equal(backEdge, opposite[fromEdge],
      mapId + " " + fromEdge + " entry must return from " + destinationId + "'s " + opposite[fromEdge] + " edge");
    assert.ok(Math.abs(portal.cell.portal.x - back.x) + Math.abs(portal.cell.portal.y - back.y) <= 2,
      mapId + " must arrive beside " + destinationId + "'s return edge");
    assert.ok(Math.abs(back.cell.portal.x - portal.x) + Math.abs(back.cell.portal.y - portal.y) <= 2,
      destinationId + " must arrive beside " + mapId + "'s return edge");
    checkedPairs.add([mapId, destinationId].sort().join(":"));
  }
}
assert.ok(checkedPairs.size >= 14, "the regression should cover legacy and Worldwake seams");

const castIds = Object.keys(G.NPCS);
const placementMaps = Object.keys(G.NPC_PLACEMENTS);
const placements = Object.values(G.NPC_PLACEMENTS).flat();
const lines = Object.values(G.NPCS).flatMap((def) => Object.values(def.chapters).flat());
assert.ok(castIds.length >= 10, "the world needs a real recurring cast");
assert.ok(placementMaps.length >= 15, "NPCs should inhabit old and new regions");
assert.ok(placements.length >= 50, "the populated world should not feel like a handful of signs");
assert.ok(lines.length >= 75, "return visits need enough chapter-specific dialogue");
for (const [mapId, entries] of Object.entries(G.NPC_PLACEMENTS)) {
  assert.ok(G.maps[mapId], "NPC placement map " + mapId + " must exist");
  for (const [npcId] of entries) assert.ok(G.NPCS[npcId], mapId + " references unknown NPC " + npcId);
}
for (const [id, def] of Object.entries(G.NPCS)) {
  assert.ok(Object.keys(def.chapters).length >= 4, id + " needs a changing story arc");
  assert.ok(def.sprite.frames.length >= 2, id + " needs an animated sprite");
  for (const frame of def.sprite.frames) for (const row of frame) for (const pixel of row)
    assert.ok(pixel === "." || pixel === " " || def.sprite.palette[pixel],
      id + " uses unknown sprite color '" + pixel + "'");
}

const wholeStory = lines.join(" ");
for (const idea of ["Unfinished", "Somebody", "Worldbearers", "God of Every Form"])
  assert.ok(wholeStory.includes(idea), "the discoverable dialogue must explain " + idea);

G.state = {
  items: [], claimedForms: [], stars: 0,
  worldwake: G.makeWorldwake(), npcTalk: {},
};
assert.equal(G.storyChapter(), 0);
G.state.claimedForms = ["rat", "knight"];
assert.equal(G.storyChapter(), 1);
G.state.stars = 10;
assert.equal(G.storyChapter(), 2);
G.state.worldwake.discovered.push("sunstepPrairie");
assert.equal(G.storyChapter(), 3);
G.state.worldwake.marks.push("sky", "stone", "thread");
assert.equal(G.storyChapter(), 4);
G.state.items.push("god-spark");
assert.equal(G.storyChapter(), 5);
assert.notEqual(G.npcDialogue("pebble", 0, 0), G.npcDialogue("pebble", 5, 0),
  "returning NPCs must react to the completed story");

// Preferred coordinates are resilient to map edits: the placement helper
// searches for safe ground and never stacks two speakers on one tile.
const spawned = G.makeMapNpcs("overworld", (x, y) => x > 0 && y > 0 && x < 119 && y < 79);
assert.equal(spawned.length, G.NPC_PLACEMENTS.overworld.length);
assert.equal(new Set(spawned.map((npc) => npc.x + "," + npc.y)).size, spawned.length);

console.log("narrative tests passed (" + castIds.length + " characters, " + lines.length +
  " lines, " + checkedPairs.size + " world seams)");
