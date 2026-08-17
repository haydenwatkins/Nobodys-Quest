"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ console, Math, Date, Map, Set,
  window: { matchMedia: () => ({ matches: false }) } });
function run(file, suffix = "") {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8") + suffix, context, { filename: file });
}

run("js/engine/core.js", ";this.G = G;");
const G = context.G;
G.sfx = { play() {} };
G.ui = { toast() {}, banner() {}, dialogue() {} };
G.saveGame = () => {};
G.checkUnlocks = () => {};
G.checkCostumeUnlocks = () => {};
run("js/engine/world.js");
run("js/data/maps.js");
run("js/engine/wayfinder.js");
run("js/engine/worldwake.js");

const regionIds = new Set(G.WAYFINDER_REGIONS.concat(G.WORLDWAKE_REGIONS).map((region) => region.id));
assert.equal(regionIds.size, 16);
assert.deepEqual(new Set(G.WAYFINDER_ATLAS_NODES.map((node) => node.id)), regionIds,
  "every major region should appear exactly once on the unified Atlas");
for (const [from, to] of G.WAYFINDER_ATLAS_EDGES) {
  assert.ok(regionIds.has(from) && regionIds.has(to), `Atlas edge ${from} → ${to} must connect real regions`);
}

// Every map node must be reachable from Greenfield in the displayed route
// graph, including the Worldwake road's return through Shattercoast.
const adjacent = new Map(Array.from(regionIds, (id) => [id, []]));
for (const [from, to] of G.WAYFINDER_ATLAS_EDGES) {
  adjacent.get(from).push(to);
  adjacent.get(to).push(from);
}
const reached = new Set(["overworld"]);
const queue = ["overworld"];
while (queue.length) {
  const id = queue.shift();
  for (const next of adjacent.get(id)) if (!reached.has(next)) { reached.add(next); queue.push(next); }
}
assert.equal(reached.size, regionIds.size, "the displayed Atlas must be one connected world");

// Migration uses durable discovery records to awaken old and new-world posts.
const migrated = G.normalizeWayfinder({ discovered: ["overworld", "mistwood"] }, {
  items: [], worldwake: { discovered: ["sunstepPrairie", "windscarCanyon"] },
});
for (const id of ["overworld", "mistwood", "sunstepPrairie", "windscarCanyon"])
  assert.ok(migrated.posts.includes(id), `migration should awaken the recorded ${id} post`);

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const input = fs.readFileSync(path.join(root, "js/engine/input.js"), "utf8");
const css = fs.readFileSync(path.join(root, "css/style.css"), "utf8");
assert.ok(index.includes('id="btn-map"'));
assert.ok(input.includes('m: "map", M: "map"'));
assert.ok(css.includes(".atlas-world") && css.includes("#local-atlas-canvas"));

console.log("atlas tests passed");
