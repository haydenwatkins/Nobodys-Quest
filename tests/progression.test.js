"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({
  console, Math, Date,
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
G.playerMaxHearts = () => 3;
G.makeTown = () => ({});
run("js/engine/forms.js");
run("js/abilities/basics.js");
for (const name of ["nobody", "rat", "knight", "ranger", "wizard", "frog", "alchemist", "stormcaller", "dragon", "riftblade", "god"])
  run(`js/forms/${name}.js`);
run("js/engine/quests.js");

G.state = {
  player: { damageTaken: 0, dashing: null }, formId: "nobody",
  stars: 0, items: [], known: [], claimedForms: [], unlockReadyNotified: [], loadouts: {},
};
G.questsDone = [];

assert.equal(G.formUnlocked("rat"), false);
G.questsDone.push(G.forms.nobody.quests[0].id, G.forms.nobody.quests[1].id);
assert.equal(G.formLevel("nobody"), 3);
assert.equal(G.formReady("rat"), true, "meeting requirements should only make a form ready");
G.checkUnlocks();
assert.equal(G.formUnlocked("rat"), false, "checking unlocks must never surprise-claim a form");
assert.equal(G.claimForm("rat"), true);
assert.equal(G.formUnlocked("rat"), true, "a deliberate claim unlocks the form");

G.state.stars = 20;
assert.match(G.unlockHint("stormcaller"), /One of:/, "unlock hints should describe alternate challenge paths");
assert.equal(G.formReady("stormcaller"), false, "stars alone do not bypass a composite challenge");

console.log("progression tests passed");
