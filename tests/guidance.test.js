"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const comfortStore = new Map();
const context = vm.createContext({
  console, Math, Date, Map, Set,
  localStorage: {
    getItem(key) { return comfortStore.has(key) ? comfortStore.get(key) : null; },
    setItem(key, value) { comfortStore.set(key, String(value)); },
  },
  document: { getElementById: () => null },
  window: {},
});
function run(file, suffix = "") {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8") + suffix, context, { filename: file });
}

run("js/engine/core.js", ";this.G = G;");
run("js/engine/comfort.js");
const G = context.G;
const toasts = [];
G.ui = {
  menuOpen: false, dialogueOpen: false,
  toast(text) { toasts.push(text); },
  dialogue() {},
};
G.sfx = { play() {} };
G.spawnFx = () => {};
G.saveGame = () => {};
G.DAMAGE_TYPES = { blunt: { name: "Blunt" } };
G.forms = {
  nobody: { id: "nobody", name: "Nobody", icon: "◇", basic: "poke", quests: [] },
  hammer: { id: "hammer", name: "Hammer", icon: "🔨", basic: "thump", quests: [] },
};
G.abilities = {
  poke: { type: "neutral" },
  thump: { type: "blunt" },
};
G.unlockedForms = () => ["nobody", "hammer"];
G.getLoadout = () => [];
G.questsDone = [];
G.formOrder = ["nobody", "hammer"];
G.world = { solid: () => false };

const open = { tile: "path" };
const portal = { tile: "path", portal: { map: "beta", x: 1, y: 1 } };
G.maps = {
  alpha: {
    id: "alpha", name: "Alpha",
    legend: { ".": open, ">": portal },
    tiles: [".....", "....>", "....."],
  },
  beta: {
    id: "beta", name: "Bright Valley",
    legend: { ".": open, "<": { tile: "path", portal: { map: "alpha", x: 3, y: 1 } } },
    tiles: ["...", "<..", "..."],
  },
};

let goal = { guide: "travel", mapId: "beta", destination: "Bright Valley" };
G.storyGoal = () => goal;
G.state = {
  time: 0, mapId: "alpha", guidance: null,
  mapW: 5, mapH: 3,
  grid: [
    [open, open, open, open, open],
    [open, open, open, open, portal],
    [open, open, open, open, open],
  ],
  player: { x: 1.5 * G.TILE, y: 1.5 * G.TILE, dir: { x: 0, y: 1 } },
  enemies: [], chests: [],
};

run("js/engine/guidance.js");

assert.deepEqual(JSON.parse(JSON.stringify(G.makeGuidance())), {
  bossRetries: {}, seenSignals: [], helpRequests: 0,
});
assert.equal(G.guidanceTarget().kind, "travel", "travel routes should use their own blue visual language");
assert.equal(G.guidanceTarget().color, G.GUIDANCE_COLORS.travel);
assert.equal(G.requestGuidance(false), true, "players should be able to ask the world for a direction");
assert.equal(G.state.guidance.helpRequests, 1, "manual help should persist without changing progression");
assert.ok(G.state.player.dir.x > 0.9, "Nobody should visibly look toward the next route");
assert.match(toasts.at(-1), /Bright Valley/, "the help text should name a physical destination");

let trailMarks = 0;
const ctx = {
  fillStyle: "", strokeStyle: "", lineWidth: 1, globalAlpha: 1, font: "",
  save() {}, restore() {}, translate() {}, rotate() {}, beginPath() {}, arc() {}, stroke() {},
  fillRect() { trailMarks++; }, moveTo() {}, lineTo() {}, closePath() {}, fill() {}, fillText() {},
  measureText(text) { return { width: text.length * 5 }; },
};
assert.doesNotThrow(() => G.drawWorldGuidance(ctx, { x: 0, y: 0 }, 1));
assert.ok(trailMarks > 1, "requested guidance should draw physical breadcrumb motes and a destination marker");
assert.doesNotThrow(() => G.drawGuidanceHud(ctx, { x: 0, y: 0 }));

const warded = { id: "bones" };
G.events.emit("wardBlocked", { enemy: warded, damageType: "blunt" });
G.events.emit("wardBlocked", { enemy: warded, damageType: "blunt" });
assert.equal(G.guidanceWardSuggestion(warded).form.id, "hammer",
  "repeated ward mistakes should recommend an unlocked form with the right damage");
assert.match(toasts.at(-1), /Hammer carries Blunt damage/);

G.state.mapId = "bossRoom";
G.state.guidance.bossRetries.bossRoom = 2;
assert.equal(G.guidanceAssistHearts(), 0, "retry assistance should never activate before the player opts in");
assert.equal(G.guidanceProjectileScale({ owner: { def: { miniboss: true } } }), 1,
  "boss shots should retain authored speed while assistance is off");
G.setComfortSetting("bossAssistance", true);
assert.equal(G.guidanceAssistHearts(), 1, "two failed boss attempts should add one temporary retry heart");
G.state.guidance.bossRetries.bossRoom = 5;
assert.equal(G.guidanceAssistHearts(), 2, "repeated attempts should add at most two temporary hearts");
assert.equal(G.guidanceProjectileScale({ owner: { def: { miniboss: true } } }), 0.78,
  "repeated attempts should slow only boss projectiles");
assert.equal(G.guidanceProjectileScale({ owner: { def: { miniboss: false } } }), 1,
  "ordinary encounters should keep their authored timing");

goal = { guide: "claim", formId: "hammer" };
G.state.mapId = "alpha";
assert.equal(G.requestGuidance(false), true);
assert.match(toasts.at(-1), /Form Lab/, "non-spatial unlock help should explain the complementary menu action");

console.log("guidance tests passed");
