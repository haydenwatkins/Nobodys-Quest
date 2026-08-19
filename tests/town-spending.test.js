"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ console, Math, Date });
function run(file, suffix = "") {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8") + suffix, context, { filename: file });
}

run("js/engine/core.js", ";this.G = G;");
const G = context.G;
G.sfx = { play() {} };
G.ui = { toast() {}, banner() {} };
G.saveGame = () => {};
G.spawnFx = () => {};
G.syncTownResidents = () => {};
G.playerMaxMana = () => 12;
run("js/engine/town.js");

G.state = {
  mapId: "overworld",
  stars: 10,
  items: [],
  claimedForms: ["rat"],
  player: { x: 0, y: 0, damageTaken: 2, mana: 4, manaRegenDelay: 1 },
  town: Object.assign(G.makeTown(), { founded: true, introduced: true, residents: 2, spirit: 300 }),
};

// Old saves gain the new ledgers without losing their existing town.
const migrated = G.normalizeTown({ founded: true, houses: ["a"], spirit: 9 });
assert.deepEqual(Object.keys(migrated.projects), []);
assert.equal(migrated.beautifications, 0);

// Civic projects are one-time purchases with immediate, persistent effects.
const baseCapacity = G.townCapacity();
assert.equal(G.buyTownProject("welcomeLodge"), true);
assert.equal(G.state.town.spirit, 288);
assert.ok(G.townCapacity() >= baseCapacity + 8, "the lodge should add direct capacity and a town level");
assert.equal(G.buyTownProject("welcomeLodge"), false, "a civic project cannot be bought twice");

G.state.town.houses = ["a", "b"];
const undiscountedHouse = G.townHouseCost();
assert.equal(G.buyTownProject("buildersYard"), true);
assert.ok(G.townHouseCost() < undiscountedHouse, "the builders' yard should discount future homes");

// Repeatable purchases consume spirit and stop cleanly at capacity or plan limits.
const sponsorCost = G.townSponsorCost();
const residentsBefore = G.state.town.residents;
assert.equal(G.sponsorTownResident(), true);
assert.equal(G.state.town.residents, residentsBefore + 1);
assert.equal(G.townSponsorCost(), sponsorCost + 2);

const beautyCost = G.townBeautificationCost();
assert.equal(G.beautifyTown(), true);
assert.equal(G.state.town.beautifications, 1);
assert.equal(G.townBeautificationCost(), beautyCost + 3);

// Festivals are now an actual community investment, not a currency generator.
G.state.town.festivalUntil = 0;
const festivalCost = G.townFestivalCost();
const spiritBeforeFestival = G.state.town.spirit;
assert.equal(G.holdTownFestival(), true);
assert.equal(G.state.town.spirit, spiritBeforeFestival - festivalCost);
assert.equal(G.townFestivalActive(), true);

// Recovery can only be purchased in the peaceful town itself.
const spiritBeforeFailedFeast = G.state.town.spirit;
assert.equal(G.hostTownFeast(), false);
assert.equal(G.state.town.spirit, spiritBeforeFailedFeast);
G.state.mapId = "town";
assert.equal(G.hostTownFeast(), true);
assert.equal(G.state.player.damageTaken, 0);
assert.equal(G.state.player.mana, 12);
assert.equal(G.state.town.spirit, spiritBeforeFailedFeast - 5);

console.log("Town spending tests passed.");
