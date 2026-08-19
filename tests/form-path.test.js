"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ console, Math, Date, Map, Set, window: { matchMedia: () => ({ matches: false }) } });
function run(file, suffix = "") {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8") + suffix, context, { filename: file });
}

run("js/engine/core.js", ";this.G=G;");
const G = context.G;
G.sfx = { play() {} };
G.ui = { toast() {}, banner() {} };
G.saveGame = () => {};
run("js/engine/forms.js");
run("js/abilities/basics.js");
for (const name of ["nobody", "rat", "knight", "ranger", "wizard", "frog", "alchemist", "stormcaller", "dragon", "riftblade", "mole", "vampire", "jester", "turtle", "samurai", "astronomer", "druid", "griffin", "golem", "weaver", "bellkeeper", "lantern-wisp", "colossus", "god"])
  run(`js/forms/${name}.js`);
run("js/engine/quests.js");

G.state = {
  formId: "frog", stars: 20, items: ["mole-crown"],
  known: ["nobody", "rat", "knight", "wizard", "frog"],
  claimedForms: ["rat", "knight", "wizard", "frog"], unlockReadyNotified: [],
};
G.questsDone = [];
run("js/engine/form-path.js");

const tiered = G.FORM_PATH_TIERS.flat().filter((id) => !id.startsWith("@"));
assert.deepEqual(new Set(tiered), new Set(G.formOrder), "the curated DAG must contain the complete roster");
assert.equal(tiered.length, new Set(tiered).size, "every form should appear exactly once in the DAG");
const layout = G.formPathLayout();
for (const edge of G.FORM_PATH_EDGES) {
  assert.ok(layout.positions[edge.from] && layout.positions[edge.to], `${edge.from} → ${edge.to} must point to real nodes`);
  assert.ok(layout.positions[edge.from].row < layout.positions[edge.to].row,
    `${edge.from} → ${edge.to} must preserve top-to-bottom DAG order`);
}
assert.equal(Object.keys(G.FORM_PATH_GATES).length, 2,
  "whole-roster hyperedges should be summarized by truthful mastery gates instead of a misleading pair of form lines");

const moleSteps = G.formUnlockSteps("mole");
assert.equal(moleSteps.length, 2);
assert.equal(moleSteps[0].kind, "trophy");
assert.equal(moleSteps[0].met, true, "the defeated boss gate should be visibly complete");
assert.equal(moleSteps[1].kind, "mastery");
assert.equal(moleSteps[1].met, false);
assert.match(moleSteps[1].label, /Frog mastery/);
assert.equal(moleSteps[1].detail, "Level 1/3");
assert.deepEqual(JSON.parse(JSON.stringify(G.formPathProgress("mole"))), { done: 1, total: 2, complete: false });
let update = G.formPathItemUpdate("mole-crown");
assert.match(update.text, /1\/2 complete/);
assert.match(update.text, /Still needed: Frog mastery — Level 1\/3/,
  "the boss reward explanation should name the exact remaining requirement");

G.questsDone.push(G.forms.frog.quests[0].id, G.forms.frog.quests[1].id);
assert.equal(G.formReady("mole"), true);
update = G.formPathItemUpdate("mole-crown");
assert.equal(update.complete, true);
assert.match(update.text, /Form Echo can now emerge/);

const stormChoice = G.formUnlockSteps("stormcaller").find((step) => step.kind === "choice");
assert.equal(stormChoice.options.length, 2);
assert.match(stormChoice.detail, /Wizard Lv/);
assert.match(stormChoice.detail, /Ranger Lv/);

const ui = fs.readFileSync(path.join(root, "js/engine/ui.js"), "utf8");
const css = fs.readFileSync(path.join(root, "css/style.css"), "utf8");
const combat = fs.readFileSync(path.join(root, "js/engine/combat.js"), "utf8");
assert.match(ui, /data-form-path-map/);
assert.match(ui, /AWAKENING ROUTE/);
assert.match(ui, /form-route-next/);
assert.match(css, /\.form-path-edge\.choice/);
assert.match(css, /\.form-path-edge\.all/);
assert.match(css, /\.form-path-scroll\s*\{[^}]*overflow:\s*auto/s,
  "the full DAG should pan cleanly on iPhone-sized screens");
assert.match(combat, /FORM PATH UPDATED/,
  "relevant boss victories should explain partial progression immediately");

console.log("form path tests passed");
