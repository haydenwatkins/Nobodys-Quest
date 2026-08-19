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
G.ui = { toast() {}, banner() {}, dialogue() {} };
G.input = { vec: { x: 0, y: 0 } };
G.saveGame = () => {};
G.spawnFx = () => {};
G.formOrder = [];
G.formLevel = () => 5;
G.forms.god = { id: "god", name: "God" };
G.formUnlocked = () => true;
G.makeEnemy = (id, x, y) => ({ id, x, y, dead: false, def: { id, name: id } });

run("js/engine/world.js");
run("js/engine/town.js");
run("js/data/maps.js");
run("js/engine/worldwake.js");
run("js/data/npcs.js");
run("js/engine/npcs.js");
run("js/engine/living-world.js");

function state() {
  return {
    player: {
      x: 0, y: 0, dashing: null, dir: { x: 1, y: 0 }, lastSafe: null,
      damageTaken: 0, mana: 6, manaMax: 6,
    },
    formId: "god", stars: 50, items: [], opened: [], pantries: {},
    claimedForms: [], npcTalk: {}, gauntletRun: null, knockout: null, bossCutscene: null,
    worldwake: G.makeWorldwake(),
    town: Object.assign(G.makeTown(), {
      founded: true, residents: 6, spirit: 30, houses: ["a", "b"], festivalUntil: Date.now() + 60000,
    }),
    time: 0,
  };
}

G.state = state();
G.world.load("town");
const named = G.state.npcs.filter((npc) => !npc.ambientOnly);
const residents = G.state.npcs.filter((npc) => npc.ambientOnly);
assert.equal(named.length, G.NPC_PLACEMENTS.town.length, "the recurring cast should remain in town");
assert.equal(residents.length, 6, "each early town resident should become a visible character");
assert.ok(residents.every((npc) => npc.anchors.length >= 2), "residents should have places to go");
assert.equal(G.state.townDecorations.length, 4, "each built home should gain a mailbox and garden");
assert.equal(G.townFestivalActive(), true);

G.state.town.projects.lanternWalk = true;
G.state.town.projects.hallOfForms = true;
G.state.town.beautifications = 2;
const upgradedTown = G.makeTownDecorations(G.state.grid, G.state.mapW, G.state.mapH);
assert.ok(upgradedTown.some((detail) => detail.kind === "lantern"), "the Lantern Walk should appear in town");
assert.ok(upgradedTown.some((detail) => detail.kind === "monument"), "the Hall of Forms should add its monument");
assert.ok(upgradedTown.length > G.state.townDecorations.length, "beautification spending should visibly fill the town");

G.startNpcExchange(residents[0], residents[1], 0);
assert.equal(residents[0].bubble.text, "Lovely day!");
assert.equal(residents[1].bubble.text, "For something.");
assert.ok(residents[1].bubble.delay > 0, "ambient replies should be staggered instead of modal");
assert.ok(residents[0].bubble.duration <= 2.5, "ambient comments should clear promptly");

// A routine should produce actual travel rather than an in-place idle loop.
const walker = named[0];
G.state.player.x = 28 * G.TILE;
G.state.player.y = 16 * G.TILE;
walker.routineT = 0;
const before = { x: walker.x, y: walker.y };
for (let i = 0; i < 160; i++) {
  G.state.time += 0.05;
  G.updateNpcs(0.05);
}
assert.ok(Math.hypot(walker.x - before.x, walker.y - before.y) > 3,
  "named NPCs should visibly travel between routine anchors");

// Wildlife should be biome-specific and react immediately to a nearby dash.
G.state = state();
G.world.load("sunkenMarsh");
assert.ok(G.state.wildlife.some((creature) => creature.kind === "frog"));
assert.ok(G.state.wildlife.some((creature) => creature.kind === "fish"));
assert.ok(G.state.wildlife.slice(0, 3).some((creature) =>
  Math.hypot(creature.x / G.TILE - G.maps.sunkenMarsh.playerStart.x,
    creature.y / G.TILE - G.maps.sunkenMarsh.playerStart.y) < 11),
  "some wildlife should be encountered near the route instead of disappearing into the full map");
const startled = G.state.wildlife[0];
G.state.player.x = startled.x + 3;
G.state.player.y = startled.y;
G.state.player.dashing = { t: 0.1 };
G.updateLivingWorld(0.016);
assert.ok(startled.fleeT > 1, "wildlife should scatter from a nearby dash");

// Entering the Old Dungeon should feel like arriving in a room, not stepping
// into a stack of props and automatic conversations.
G.state = state();
G.world.load("dungeon");
assert.ok(G.state.npcs.every((npc) => Math.hypot(npc.x - G.state.player.x, npc.y - G.state.player.y) > G.TILE * 5),
  "the dungeon cast should live beyond the arrival foyer");
let arrivalDialogues = 0;
G.ui.dialogue = () => { arrivalDialogues++; };
G.state.enemies = [];
const arrivalNpc = G.state.npcs[0];
arrivalNpc.x = G.state.player.x + 5;
arrivalNpc.y = G.state.player.y;
arrivalNpc.near = false;
G.events.emit("mapEnter", { map: "dungeon" });
G.updateNpcs(2);
assert.equal(arrivalDialogues, 0, "a nearby character must not ambush the player with dialogue on arrival");
G.state.player.x += 100;
G.updateNpcs(0.1);
G.state.player.x -= 100;
G.updateNpcs(0.1);
assert.equal(arrivalDialogues, 1, "stepping away and deliberately returning should restore normal conversation");

// Purification must visibly repopulate a region, not merely remove its boss.
G.state = state();
G.world.load("windscarCanyon");
const sleepingCount = G.state.wildlife.length;
assert.equal(G.state.restorationDetails.length, 0);
G.state.worldwake.marks.push("sky");
G.world.load("windscarCanyon");
assert.ok(G.state.wildlife.length >= sleepingCount + 5, "restored regions should attract more wildlife");
assert.ok(G.state.restorationDetails.length >= 20, "restored regions should visibly bloom and relight");

// Earlier victories should also remain legible in the landscape. Returning to
// an old boss region is a wordless recap of what this save has accomplished.
G.state = state();
G.world.load("mistwood");
const hauntedCount = G.state.wildlife.length;
assert.equal(G.state.restorationDetails.length, 0);
G.state.items.push("trophy-heartwood-crown");
G.world.load("mistwood");
assert.ok(G.state.wildlife.length >= hauntedCount + 5, "an early boss victory should repopulate its region");
assert.ok(G.state.restorationDetails.length >= 20, "an early boss victory should permanently restore its landscape");

const ctx = {
  fillStyle: "", globalAlpha: 1,
  save() {}, restore() {}, fillRect() {},
};
assert.doesNotThrow(() => G.drawLivingWorldGround(ctx, { x: 0, y: 0 }, 2));
assert.doesNotThrow(() => G.drawWildlife(ctx, G.state.wildlife[0]));

// Smoke the largest map for several simulated seconds. The population stays
// intentionally bounded for iPad while routines, fleeing, and wildlife all run.
G.state = state();
G.world.load("overworld");
G.state.player.x = 2 * G.TILE;
G.state.player.y = 2 * G.TILE;
assert.ok(G.state.wildlife.length >= 20 && G.state.wildlife.length <= 30);
assert.doesNotThrow(() => {
  for (let i = 0; i < 240; i++) {
    G.state.time += 0.025;
    G.updateNpcs(0.025);
    G.updateLivingWorld(0.025);
  }
});

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
assert.ok(index.indexOf("js/engine/living-world.js") < index.indexOf("js/engine/main.js"),
  "the living-world systems must load before the game boots");
const npcSource = fs.readFileSync(path.join(root, "js/engine/npcs.js"), "utf8");
const uiSource = fs.readFileSync(path.join(root, "js/engine/ui.js"), "utf8");
assert.ok(!npcSource.includes('ctx.font = "5px monospace"'),
  "ambient comments should not be rasterized into the low-resolution world canvas");
assert.ok(uiSource.includes("function drawNpcChatter"),
  "ambient comments should render on the crisp screen-space text layer");
assert.ok(npcSource.includes("s.npcChatterT = 21"),
  "ambient exchanges should leave enough quiet time to feel incidental");

console.log("living world tests passed");
