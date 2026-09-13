"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ console, Math, Date, WeakMap, Map, Set, window: { matchMedia: () => ({ matches: false }) } });
function run(file, suffix = "") {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8") + suffix, context, { filename: file });
}

run("js/engine/core.js", ";this.G = G;");
const G = context.G;
let found = 1;
const discovered = new Set(["overworld"]);
let trophies = 0;
let saved = 0;
const banners = [];
G.wayfinderProgress = () => ({ found, total: 8 });
G.wayfinderDiscovered = (id) => discovered.has(id);
G.guardianCollectionProgress = () => ({ found: trophies, total: 12 });
G.sfx = { play() {} };
G.ui = { toast() {}, banner(title, text) { banners.push({ title, text }); } };
G.saveGame = () => { saved++; };
G.state = {
  costumeId: "classic", costumesUnlocked: ["classic"], skinsUnlocked: [], skinByForm: {},
  items: [], opened: [], shake: 0, time: 0,
};
run("js/engine/costumes.js");

assert.equal(G.COSTUMES.length, 11, "the wardrobe should launch with a meaningful progression of looks");
assert.deepEqual(Array.from(G.ensureCostumes().unlocked), ["classic"]);
assert.ok(G.COSTUMES.every((costume) => !["damage", "health", "hearts", "speed", "mana"].some((key) => key in costume)),
  "costumes must remain mechanically neutral");
assert.equal(G.FORM_SKINS.length, 24, "every launch form should receive a signature skin");
assert.equal(new Set(G.FORM_SKINS.map((skin) => skin.formId)).size, 24,
  "signature skins should belong to distinct forms rather than being global palette swaps");
assert.ok(G.FORM_SKINS.every((skin) => skin.unlockLevel === 3), "skin mastery should use one legible rule");
assert.ok(G.FORM_SKINS.every((skin) => !["damage", "health", "hearts", "speed", "mana"].some((key) => key in skin)),
  "signature skins must remain mechanically neutral");

const nobodySkin = G.skinById("cardboardHero");
const tinyNobody = { palette: { k: "#1a1c2c", w: "#f4f4f4" }, frames: [[".kk.", "kwwk", ".kk."]] };
const signature = G.signatureSprite(tinyNobody, nobodySkin);
assert.notEqual(signature, tinyNobody);
assert.notDeepEqual(Array.from(signature.frames[0]), Array.from(tinyNobody.frames[0]),
  "a signature skin should rebuild the frame silhouette, not merely remap colors");
assert.ok(signature.frames[0].length > tinyNobody.frames[0].length, "signature silhouettes need room for authored accessories");
assert.equal(G.signatureSprite(tinyNobody, nobodySkin), signature, "signature sprites should be cached");

const normalizedSkins = G.normalizeSkins(["cardboardHero", "fake", "cardboardHero"], {
  nobody: "cardboardHero", rat: "cardboardHero", wizard: "fake",
});
assert.deepEqual(Array.from(normalizedSkins.unlocked), ["cardboardHero"]);
assert.deepEqual(Object.assign({}, normalizedSkins.equipped), { nobody: "cardboardHero" },
  "save migration should reject skins equipped to the wrong form");

found = 2;
let unlocked = G.checkCostumeUnlocks(false);
assert.deepEqual(Array.from(unlocked, (costume) => costume.id), ["trailblazer"],
  "the first earned costume should arrive after only two regions");
assert.ok(banners.at(-1).text.includes("Trailblazer"));
assert.equal(G.selectCostume("trailblazer"), true);
assert.equal(G.state.costumeId, "trailblazer");
assert.equal(G.selectCostume("manyfold"), false, "locked costumes cannot be equipped");

const base = { palette: { light: "#f4f4f4", outline: "#1a1c2c" }, frames: [["lo"]] };
const dressed = G.costumedSprite(base);
assert.notEqual(dressed, base);
assert.equal(dressed.palette.light, "#fff3c2");
assert.equal(dressed.palette.outline, "#1a1c2c", "unmapped outline colors should stay readable");
assert.equal(base.palette.light, "#f4f4f4", "dressing a form must not mutate Ben's source sprite");
assert.equal(G.costumedSprite(base), dressed, "costume sprites should be cached rather than rebuilt every frame");

G.state.items.push("whispering-seed");
G.events.emit("pickup", { item: "whispering-seed" });
assert.ok(G.costumeUnlocked("moonberry"));
for (const id of ["sunkenMarsh", "emberRidge", "starfallRuins", "shattercoast"]) discovered.add(id);
G.events.emit("mapEnter", { map: "shattercoast" });
for (const id of ["mirecloak", "emberguard", "tidewalker"])
  assert.ok(G.costumeUnlocked(id), `${id} should grow naturally from exploration`);
assert.equal(G.costumeUnlocked("starstrider"), false, "entering the hard zone should not award its vault prize");
G.state.items.push("starfall-thread");
G.events.emit("pickup", { item: "starfall-thread" });
assert.ok(G.costumeUnlocked("starstrider"), "the Fallen Star Thread should unlock Starstrider");
trophies = 3;
G.events.emit("pickup", { item: "third-trophy" });
assert.ok(G.costumeUnlocked("guardian"));
G.state.items.push("manyfold-crown");
G.checkCostumeUnlocks(false);
assert.ok(G.costumeUnlocked("manyfold"));

G.state.costumeId = "starstrider";
const calls = [];
const ctx = {
  fillStyle: "", save() { calls.push("save"); }, restore() { calls.push("restore"); },
  fillRect(x, y, w, h) { calls.push([x, y, w, h]); },
};
G.drawCostumeAccessory(ctx, { dir: { x: 1 } }, { sprite: base }, 20, 30);
assert.ok(calls.some(Array.isArray), "the scalable accessory layer should draw on any form sprite");

const normalized = G.normalizeCostumes(["classic", "fake", "trailblazer", "trailblazer"], "fake");
assert.deepEqual(Array.from(normalized.unlocked), ["classic", "trailblazer"]);
assert.equal(normalized.selected, "classic");
assert.ok(saved > 0, "wardrobe progress should be saved as it grows");

G.state = {
  costumeId: "classic", costumesUnlocked: ["classic"], skinsUnlocked: [], skinByForm: {}, items: [],
  opened: ["starfallRuins:6,4"], shake: 0, time: 0,
};
G.checkCostumeUnlocks(true);
assert.ok(G.costumeUnlocked("starstrider"), "legacy saves that opened the old cookie chest keep its new reward");

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
assert.ok(index.indexOf("js/engine/costumes.js") < index.indexOf("js/engine/main.js"));
const ui = fs.readFileSync(path.join(root, "js/engine/ui.js"), "utf8");
for (const text of ["Form Lab", "Forms", "Arts", "Looks", "KNOWN ARTS", "Classic dyes"])
  assert.ok(ui.includes(text), `graphical form UI should include '${text}'`);
assert.ok(!ui.includes('["style", "Style"]'), "the old standalone Style list should leave the main navigation");
assert.ok(!ui.includes('["mix", "Mix"]'), "the old dropdown Mix tab should leave the main navigation");

console.log("costume tests passed");
