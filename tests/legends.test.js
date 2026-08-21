"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ console, Math, Date, window: { matchMedia: () => ({ matches: false }) } });
function run(file, suffix = "") {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8") + suffix, context, { filename: file });
}

run("js/engine/core.js", ";this.G=G;");
const G = context.G;
G.sfx = { play() {} };
G.ui = { toast() {}, banner() {}, dialogue() {} };
G.saveGame = () => {};
G.makeTown = () => ({});
G.spawnFx = () => {};
run("js/engine/forms.js");
run("js/abilities/basics.js");
for (const name of ["nobody", "rat", "knight", "ranger", "wizard", "frog", "alchemist", "stormcaller", "dragon", "riftblade", "mole", "vampire", "jester", "turtle", "samurai", "astronomer", "druid", "griffin", "golem", "weaver", "bellkeeper", "lantern-wisp", "colossus", "god"])
  run(`js/forms/${name}.js`);
run("js/engine/quests.js");
G.validateCrossRefs();
run("js/engine/legends.js");

assert.equal(Object.keys(G.LEGEND_DEFS).length, 24, "every form needs an authored Legend path");
assert.equal(new Set(Object.values(G.LEGEND_DEFS).map((def) => def.armName)).size, 24,
  "every Legend Arm needs its own identity");
assert.equal(new Set(Object.values(G.LEGEND_DEFS).map((def) => def.ultimateName)).size, 24,
  "every ultimate needs its own name");
assert.equal(new Set(Object.values(G.LEGEND_DEFS).map((def) => def.ultimateKind)).size, 6,
  "Legend Arms should cover six mechanically distinct ultimate families");

G.state = {
  formId: "ranger", claimedForms: ["ranger", "nobody"], known: ["ranger", "nobody"],
  legends: G.makeLegends(), player: { x: 0, y: 0, invuln: 0 }, enemies: [], shake: 0, hitStop: 0,
};
G.questsDone = G.forms.ranger.quests.map((quest) => quest.id);
for (let i = 0; i < 12; i++) G.events.emit("abilityUse", { form: "ranger", ability: G.forms.ranger.basic });
assert.equal(G.legendRank("ranger"), 1, "native practice should awaken the alternate Facet");
for (let i = 0; i < 10; i++) G.events.emit("abilityUse", { form: "ranger", ability: "slap" });
assert.equal(G.legendRank("ranger"), 2, "mixing a borrowed move should awaken the Technique");
assert.ok(G.availableAbilities().includes(G.LEGEND_DEFS.ranger.techniqueId), "the Technique should enter the shared tray");
G.events.emit("kill", { miniboss: true });
assert.equal(G.legendRank("ranger"), 3, "a guardian victory should awaken the Legend Arm");

let ultimateHits = 0;
G.state.enemies = [{ dead: false, x: 10, y: 0, hp: 20, def: { size: 10, miniboss: true } }];
G.state.legends.charge.ranger = 100;
G.combat = { damageEnemy(enemy, options) { ultimateHits++; assert.ok(options.damage <= 4); return true; } };
assert.equal(G.useLegendUltimate(), true);
assert.equal(ultimateHits, 1);
assert.equal(G.legendCharge("ranger"), 0, "using an ultimate must consume its meter");

const old = G.normalizeLegends(null);
assert.equal(old.ranks.ranger, 0, "old saves should receive a safe empty Legend path");
console.log("form legend tests passed");
