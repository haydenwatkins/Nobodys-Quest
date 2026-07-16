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
for (const name of ["nobody", "rat", "knight", "ranger", "wizard", "frog", "alchemist", "stormcaller", "dragon", "riftblade", "mole", "vampire", "jester", "turtle", "samurai", "astronomer", "druid", "god"])
  run(`js/forms/${name}.js`);
run("js/engine/quests.js");
G.validateCrossRefs();
assert.equal(G.workshopErrors.length, 0, "new forms must obey Ben's workshop rules");

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
assert.equal(G.formReady("mole"), false);
G.state.items.push("mole-crown");
assert.equal(G.formReady("mole"), false, "a trophy still needs its form-specific training requirement");
assert.ok(G.forms.god.unlock.requirements.some((rule) => rule.item === "god-spark"), "God must require the final boss trophy");
assert.equal(G.formOrder[G.formOrder.length - 1], "god", "God must remain the top form");
for (const id of ["turtle", "samurai", "astronomer", "druid"])
  assert.equal(G.forms[id].unlock.type, "challenge", `${id} should be earned through a guardian challenge`);
for (const id of ["turtle", "samurai", "astronomer", "druid"]) {
  const sprite = G.forms[id].sprite;
  for (const frame of sprite.frames) for (const row of frame) for (const pixel of row)
    assert.ok(pixel === "." || pixel === " " || sprite.palette[pixel], `${id} uses unknown sprite color '${pixel}'`);
}

console.log("progression tests passed");
