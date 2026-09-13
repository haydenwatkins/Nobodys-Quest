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
G.ui = {
  menuOpen: false, dialogueOpen: false, toast() {}, banner() {},
  dialogue(_speaker, _text, options) { if (options && options.onClose) options.onClose(); },
};
G.input = { hasGamepad: false, isTouch: false, clearTaps() {} };
G.saveGame = () => {};
G.makeTown = () => ({});
G.spawnFx = () => {};
G.world = { isSafeSpawn: () => true };
G.makeEnemy = (id, x, y) => ({ id, x, y, hp: 3, dead: false, anim: 0, def: { name: id, hp: 3, damage: 1, size: 12, speed: 30 } });
run("js/engine/forms.js");
run("js/abilities/basics.js");
for (const name of ["nobody", "rat", "knight", "ranger", "wizard", "frog", "alchemist", "stormcaller", "dragon", "riftblade", "mole", "vampire", "jester", "turtle", "samurai", "astronomer", "druid", "griffin", "golem", "weaver", "bellkeeper", "lantern-wisp", "colossus", "god"])
  run(`js/forms/${name}.js`);
run("js/engine/quests.js");
G.validateCrossRefs();
run("js/engine/legends.js");

assert.equal(Object.keys(G.LEGEND_DEFS).length, 24, "every form needs an authored Legend path");
assert.equal(Object.keys(G.LEGEND_PATHS).length, 24, "every form needs an authored world questline");
for (const id of G.formOrder) {
  const pathStages = G.LEGEND_PATHS[id];
  assert.equal(pathStages.length, 3, `${id} needs three deliberate phases`);
  assert.equal(new Set(pathStages.map((stage) => stage.mapId)).size, 3,
    `${id}'s three phases must happen in three different places`);
  for (const stage of pathStages) {
    assert.ok(stage.name && stage.clue && stage.objective && Number.isFinite(stage.tileX) && Number.isFinite(stage.tileY),
      `${id} needs an authored site, clue, challenge, and fixed world coordinates`);
    G.maps[stage.mapId] = G.maps[stage.mapId] || { name: stage.mapId };
  }
}
assert.equal(new Set(Object.values(G.LEGEND_DEFS).map((def) => def.armName)).size, 24,
  "every Legend Arm needs its own identity");
assert.equal(new Set(Object.values(G.LEGEND_DEFS).map((def) => def.ultimateName)).size, 24,
  "every ultimate needs its own name");

G.state = {
  formId: "ranger", claimedForms: ["ranger", "nobody"], known: ["ranger", "nobody"], mapId: "overworld",
  legends: G.makeLegends(), player: { x: 0, y: 0, invuln: 0, dir: { x: 1, y: 0 } },
  enemies: [], shake: 0, hitStop: 0, time: 0, pinnedQuestIds: [], items: [], stars: 0,
};
G.questsDone = G.forms.ranger.quests.map((quest) => quest.id);
assert.equal(G.formLevel("ranger"), 5);
assert.equal(G.legendRank("ranger"), 0);
assert.equal(G.legendAvailable("ranger"), true, "level five should reveal the first world Echo");

for (let i = 0; i < 30; i++) {
  G.events.emit("abilityUse", { form: "ranger", ability: G.forms.ranger.basic });
  G.events.emit("kill", { form: "ranger", ability: G.forms.ranger.basic, miniboss: i % 5 === 0 });
}
assert.equal(G.legendRank("ranger"), 0, "ordinary fighting must never award a Legend phase");
assert.equal(G.state.legends.active, null, "ordinary fighting must never begin a Legend trial");
assert.equal(G.state.legends.rewards.ranger, undefined, "ordinary fighting must never leave a Legend reward");

const first = G.legendEchoFor("ranger");
assert.equal(first.name, "Mistwood Overlook");
assert.equal(first.mapId, "mistwood", "the Echo must be at its authored site, not the player's current position");
assert.notEqual(first.x, G.state.player.x);
G.state.mapId = first.mapId;
const site = G.legendEchoFor("ranger");
G.state.player.x = site.x;
G.state.player.y = site.y;
assert.equal(G.legendEchoCandidate().name, "Mistwood Overlook", "approaching the physical Echo should expose an interaction");
assert.equal(G.tryLegendEcho(), true, "interacting with the Echo should begin its side quest");
assert.equal(G.state.legends.active.kind, "native");
assert.equal(G.state.enemies.filter((enemy) => enemy.legendTrial).length, 3, "the trial should create world opponents at the site");

for (let i = 0; i < 3; i++) G.events.emit("kill", {
  form: "ranger", ability: G.forms.ranger.basic,
  legendTrial: { formId: "ranger", rank: 1, serial: i },
});
assert.equal(G.legendRank("ranger"), 0, "finishing the trial should still leave the reward for an explicit interaction");
assert.equal(G.legendEchoFor("ranger").reward, true, "a relic should remain at the challenge site");
assert.equal(G.tryLegendEcho(), true);
assert.equal(G.legendRank("ranger"), 1, "returning to the relic should deliberately awaken Legend I");
assert.equal(G.legendEchoFor("ranger").mapId, "overworld", "Legend II must lead to its own authored place");

G.state.legends.ranks.ranger = 3;
let ultimateHits = 0;
G.state.enemies = [{ dead: false, x: G.state.player.x + 10, y: G.state.player.y, hp: 20, def: { size: 10, miniboss: true } }];
G.state.legends.charge.ranger = 100;
G.combat = { damageEnemy(_enemy, options) { ultimateHits++; assert.ok(options.damage <= 4); return true; } };
assert.equal(G.useLegendUltimate(), true);
assert.equal(ultimateHits, 1);
assert.equal(G.legendCharge("ranger"), 0, "using an ultimate must consume its meter");

const automaticEra = G.makeLegends();
delete automaticEra.questVersion;
automaticEra.ranks.ranger = 2;
automaticEra.facets.ranger = "legend";
automaticEra.charge.ranger = 47;
const migrated = G.normalizeLegends(automaticEra);
assert.equal(migrated.ranks.ranger, 0, "the unplayed automatic system should reset only its Legend rewards");
assert.equal(migrated.facets.ranger, "original");
assert.equal(migrated.charge.ranger, 47, "migration must preserve the earned Legend meter");
assert.equal(migrated.questVersion, 2, "the migration should only run once");

const ui = fs.readFileSync(path.join(root, "js/engine/ui.js"), "utf8");
assert.ok(ui.includes("data-legend-guide") && !ui.includes("data-awaken-legend"),
  "the Legends journal may guide the player but must not grant world rewards");
console.log("form legend tests passed");
