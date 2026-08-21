"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({
  console, Math, Date, Map, Set,
  window: { matchMedia: () => ({ matches: false }) },
});
function run(file, suffix = "") {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8") + suffix, context, { filename: file });
}

run("js/engine/core.js", ";this.G=G;");
const G = context.G;
const dialogues = [];
const banners = [];
const toasts = [];
let saves = 0;
let spriteDraws = 0;
let changed = 0;
G.ui = {
  menuOpen: false, dialogueOpen: false,
  dialogue(speaker, text, options) { dialogues.push({ speaker, text, options: options || {} }); },
  banner(title, text) { banners.push({ title, text }); },
  toast(text) { toasts.push(text); },
};
G.sfx = { play() {} };
G.saveGame = () => { saves++; };
G.world = { isSafeSpawn: () => true };
G.maps = { field: { id: "field", name: "Greenfield" }, cave: { id: "cave", name: "Old Dungeon" } };
G.drawSprite = () => { spriteDraws++; };
G.playerMaxMana = () => 12;

run("js/engine/forms.js");
run("js/abilities/basics.js");
run("js/forms/nobody.js");
run("js/forms/rat.js");
run("js/engine/quests.js");

G.questsDone = G.forms.nobody.quests.slice(0, 2).map((quest) => quest.id);
G.state = {
  time: 0, mapId: "field", stars: 0, items: [], known: [], claimedForms: [],
  unlockReadyNotified: [], formEchoes: [], formId: "nobody", hitStop: 0, shake: 0,
  player: { x: 40, y: 40, damageTaken: 0, mana: 8, dashing: null },
};
G.playerMaxHearts = () => G.forms[G.state.formId].hearts;
G.passives = { onFormChange() { changed++; } };
run("js/engine/form-echo.js");

assert.equal(G.formReady("rat"), true);
G.checkUnlocks();
assert.equal(G.formUnlocked("rat"), false, "challenge completion should remain a world encounter");
assert.match(toasts.at(-1), /Win a battle and watch for its Form Echo/);

const echo = G.leaveReadyFormEchoAt(40, 40, "battle");
assert.equal(echo.formId, "rat");
assert.equal(echo.mapId, "field");
assert.equal(echo.needsLeave, true, "a drop under the player must not auto-collect during the killing blow");
assert.equal(G.formEchoFor("rat"), echo);

G.state.player.x = 80;
G.updateFormEcho();
assert.equal(echo.needsLeave, false, "stepping away should arm the deliberate return interaction");
G.state.player.x = 40;
G.updateFormEcho();
assert.equal(dialogues.length, 3, "a form meeting should breathe across discovery, description, and choice");
assert.match(dialogues[0].text, /not as a trophy/);
assert.match(dialogues[1].text, /swift and fights at close range/);
assert.match(dialogues[1].text, /Bite carries .*Sharp damage/);
assert.match(dialogues[1].text, /Scurry:/);
assert.match(dialogues[2].text, /carry what it knows/);

dialogues[2].options.onClose();
assert.equal(G.formUnlocked("rat"), true);
assert.equal(G.state.formId, "rat", "finishing the ceremony should transform Nobody into the new form");
assert.equal(G.formEchoFor("rat"), null, "collected echoes must be removed from the save");
assert.equal(changed, 1, "the new form passive should initialize as part of the transformation");
assert.match(banners.at(-1).title, /RAT AWAKENED/);
assert.ok(saves >= 3, "placement, arming, and collection should all persist");

const normalized = G.normalizeFormEchoes([
  { formId: "missing", mapId: "field", x: 1, y: 1 },
  { formId: "rat", mapId: "field", x: 2, y: 2 },
]);
assert.equal(normalized.length, 0, "migration should discard invalid and already-unlocked echoes");

G.state.claimedForms = [];
G.state.formId = "nobody";
G.state.formEchoes = [{ formId: "rat", mapId: "field", x: 40, y: 40, source: "battle", needsLeave: false, interacting: false }];
const ctx = {
  globalAlpha: 1, fillStyle: "", font: "", textAlign: "",
  save() {}, restore() {}, beginPath() {}, ellipse() {}, fill() {}, fillText() {},
};
assert.doesNotThrow(() => G.drawFormEcho(ctx, G.currentFormEcho()));
assert.equal(spriteDraws, 2, "the apparition should layer a ghost silhouette behind the readable form sprite");

console.log("form echo tests passed");
