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
for (const name of ["nobody", "rat", "knight", "ranger", "wizard", "frog", "alchemist", "stormcaller", "dragon", "riftblade", "mole", "vampire", "jester", "turtle", "samurai", "astronomer", "druid", "griffin", "golem", "weaver", "bellkeeper", "lantern-wisp", "colossus", "god"])
  run(`js/forms/${name}.js`);
run("js/engine/quests.js");
G.validateCrossRefs();
assert.equal(G.workshopErrors.length, 0, "new forms must obey Ben's workshop rules");
assert.ok(G.formOrder.every((id) => G.forms[id].hearts >= 5),
  "the registration boundary should guarantee at least five hearts for every present and future form");

// Native specials should keep combat moving. B is the frequent utility move;
// C may be stronger, but never earns a multi-second lockout or an entire mana
// bar by itself.
for (const id of G.formOrder) {
  const form = G.forms[id];
  for (const [index, native] of (form.abilities || []).entries()) {
    const ability = G.abilities[native.id];
    const maxCooldown = index === 0 ? 1.15 : 1.45;
    assert.ok(ability.cooldown <= maxCooldown,
      `${id}'s ${index === 0 ? "B" : "C"} move should recover within ${maxCooldown}s`);
    assert.ok(ability.mana <= 6, `${id}'s native special should not consume more than six mana`);
  }
}
assert.equal(G.abilities.croakBurst.style, "projectile", "Croak Burst should be an aimed sound cone");
assert.equal(G.abilities.encore.style, "projectile", "Encore should be a deliberate ricochet");
assert.equal(G.abilities.constellation.style, "chain", "Constellation should connect actual targets");
assert.doesNotMatch(fs.readFileSync(path.join(root, "js/abilities/basics.js"), "utf8"),
  /spreadDeg\s*=\s*0[^\n]*spreadDeg\s*<\s*360/,
  "player abilities must not regress to arbitrary radial projectile stars");

G.state = {
  player: { damageTaken: 0, dashing: null }, formId: "nobody",
  stars: 0, items: [], known: [], claimedForms: [], unlockReadyNotified: [], loadouts: {},
};
G.questsDone = [];

// Signature skins are authored against the full roster. Validate the actual
// generated text-art, not just the registry metadata, so a motif can never
// introduce an unknown palette key or accidentally miss a newly added form.
G.state.costumeId = "classic";
G.state.costumesUnlocked = ["classic"];
G.state.skinsUnlocked = [];
G.state.skinByForm = {};
run("js/engine/costumes.js");
assert.deepEqual(new Set(G.FORM_SKINS.map((skin) => skin.formId)), new Set(G.formOrder),
  "the signature collection must cover the complete form roster exactly once");
for (const id of G.formOrder) {
  const skin = G.skinForForm(id);
  const source = G.forms[id].sprite;
  const variant = G.signatureSprite(source, skin);
  assert.notDeepEqual(Array.from(variant.frames[0]), Array.from(source.frames[0]),
    `${id}'s signature must change its silhouette`);
  for (const frame of variant.frames) for (const row of frame) for (const pixel of row)
    assert.ok(pixel === "." || pixel === " " || variant.palette[pixel],
      `${skin.name} uses unknown sprite color '${pixel}'`);
}

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
for (const id of ["turtle", "samurai", "astronomer", "druid", "griffin", "golem", "weaver", "bellkeeper", "lanternWisp", "colossus"])
  assert.equal(G.forms[id].unlock.type, "challenge", `${id} should be earned through a guardian challenge`);
for (const id of ["turtle", "samurai", "astronomer", "druid", "griffin", "golem", "weaver", "bellkeeper", "lanternWisp", "colossus"]) {
  const sprite = G.forms[id].sprite;
  for (const frame of sprite.frames) for (const row of frame) for (const pixel of row)
    assert.ok(pixel === "." || pixel === " " || sprite.palette[pixel], `${id} uses unknown sprite color '${pixel}'`);
}

// Mixing a kit is reversible in one action, and restoring never sneaks in a
// native move the form has not earned yet.
G.questsDone.push(...G.forms.rat.quests.map((quest) => quest.id));
G.state.loadouts.rat = ["bite", "meteor", "encore"];
let loadoutSaves = 0;
G.saveGame = () => { loadoutSaves++; };
assert.deepEqual(Array.from(G.defaultLoadout("rat")), ["bite", "squeakDash", "fester"]);
assert.deepEqual(Array.from(G.restoreDefaultLoadout("rat")), ["bite", "squeakDash", "fester"]);
assert.equal(loadoutSaves, 1, "restoring a form's native kit should persist immediately");
G.questsDone = [];
assert.deepEqual(Array.from(G.defaultLoadout("rat")), ["bite", "squeakDash", null],
  "restore defaults must respect native ability levels");

const uiSource = fs.readFileSync(path.join(root, "js/engine/ui.js"), "utf8");
assert.match(uiSource, /data-act="restore-default-loadout"/,
  "the graphical Form Lab should expose native-kit restoration");
assert.doesNotMatch(uiSource, /data-claim/,
  "completed form challenges must not collapse back into a passive menu claim button");
assert.match(uiSource, /data-form-echo-guide/,
  "the Form Lab should complement the world by guiding players to a waiting echo");

console.log("progression tests passed");
