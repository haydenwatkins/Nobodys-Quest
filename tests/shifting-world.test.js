"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ console, Math, Date });
function run(file, suffix = "") {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8") + suffix, context, { filename: file });
}

run("js/engine/core.js", ";this.G = G;");
const G = context.G;
G.sfx = { play() {}, attack() {}, impact() {} };
G.ui = { toast() {}, banner() {}, dialogue() {}, openExpedition() {} };
G.saveGame = () => {};
G.input = { vec: { x: 0, y: 0 }, tapped: () => false, clearTaps() {} };
G.reducedMotion = true;
run("js/engine/world.js");
run("js/engine/combat.js");
run("js/engine/entities.js");
run("js/data/enemies.js");
run("js/data/maps.js");

G.forms.nobody = { id: "nobody", name: "Nobody", icon: "○", hearts: 5, speed: 80, slots: 2, basic: "bonk" };
G.forms.rat = { id: "rat", name: "Rat", icon: "🐀", hearts: 5, speed: 105, slots: 2, basic: "bite" };
G.formOrder = ["nobody", "rat"];
G.abilities.bonk = { id: "bonk", name: "Bonk", icon: "🔨", style: "blunt" };
G.abilities.bite = { id: "bite", name: "Bite", icon: "🦷", style: "sharp" };
G.abilities.dash = { id: "dash", name: "Trail Dash", icon: "➜", style: "sharp" };
G.formUnlocked = (id) => id === "nobody" || G.state.claimedForms.includes(id);
G.unlockedForms = () => G.formOrder.filter(G.formUnlocked);
G.playerForm = () => G.forms[G.state.formId];
G.availableAbilities = () => ["bonk", "bite", "dash"];
G.getLoadout = (id) => {
  G.state.loadouts[id] = G.state.loadouts[id] || [G.forms[id].basic, "dash", "bite"];
  return G.state.loadouts[id];
};
G.setForm = (id) => {
  if (!G.formUnlocked(id) || id === G.state.formId) return false;
  G.state.formId = id;
  G.events.emit("swap", { form: id });
  return true;
};
G.healPlayer = (amount) => { G.state.player.damageTaken = Math.max(0, G.state.player.damageTaken - amount); };
G.ensureWayfinder = () => ({ discovered: ["overworld", "mistwood"] });
G.ensureWorldwake = () => ({ discovered: [] });

run("js/engine/town.js");
run("js/engine/rival.js");
run("js/engine/incidents.js");
run("js/engine/expeditions.js");

G.state = {
  player: G.makePlayer(), formId: "nobody", stars: 0, items: [], opened: [], pantries: {},
  known: ["nobody", "rat"], claimedForms: ["rat"], loadouts: {}, pinnedQuestIds: [],
  town: G.makeTown(), incidents: G.makeIncidents(), rivalState: G.makeRivalState(),
  expedition: G.makeExpeditionProgress(), expeditionRun: null,
  hitStop: 0, shake: 0, cameraKickX: 0, cameraKickY: 0, time: 0,
};
G.world.load("overworld");

// Town building now arrives with the first claimed form and immediately gives
// enough spirit to make a meaningful construction choice.
assert.equal(G.townUnlocked(), true);
assert.equal(G.checkTownIntroduction(true), true);
assert.equal(G.state.town.founded, true);
assert.equal(G.state.town.residents, 2);
assert.equal(G.state.town.spirit, 12);
assert.ok(G.state.town.spirit >= G.townHouseCost(), "the first house should be affordable at introduction");
G.tryBuildTownHouse("north-plot");
assert.deepEqual(Array.from(G.state.town.houses), ["north-plot"]);

// The Atlas always carries three non-timed situations. Resolving one pays the
// town and immediately supplies a replacement instead of starting a timer.
G.refreshIncidents(true);
assert.equal(G.state.incidents.unlocked, true);
assert.equal(G.state.incidents.active.length, 3);
const incident = G.state.incidents.active.find((entry) => entry.type === "infestation");
assert.ok(incident, "the first rotation should include a straightforward creature surge");
G.state.mapId = incident.mapId;
const spiritBeforeIncident = G.state.town.spirit;
for (let i = 0; i < incident.goal; i++) G.events.emit("kill", { enemy: "slime", ability: "bonk" });
assert.equal(G.state.incidents.completed, 1);
assert.equal(G.state.incidents.active.length, 3);
assert.ok(G.state.town.spirit > spiritBeforeIncident);

// An ordinary foe that causes a knockout becomes a named persistent Rival.
G.state.mapId = "overworld";
G.events.emit("ko", { enemy: "slime" });
const rival = G.activeRival();
assert.ok(rival && rival.name && rival.title);
const baseHp = G.enemies.slime.hp;
const rivalEnemy = G.spawnActiveRival();
assert.ok(rivalEnemy && rivalEnemy.rival);
assert.ok(rivalEnemy.hp > baseHp);
assert.equal(G.enemies.slime.hp, baseHp, "Rival scaling must not mutate the ordinary enemy catalogue");
for (let victory = 0; victory < 3; victory++) G.events.emit("kill", { enemy: rival.baseId, rival: true });
assert.equal(G.activeRival(), null);
assert.equal(G.state.rivalState.resolved, 1);
assert.ok(G.state.items.includes("rival-keepsake"));
G.events.emit("ko", { enemy: "bat", expedition: true });
assert.equal(G.activeRival(), null, "expedition defeats should not create a Rival stranded outside the campaign");

// A short Manyfold run branches room-by-room, drafts run-only power, and
// restores the campaign loadout when its final champion falls.
G.state.mapId = "overworld";
G.state.player.x = 60 * G.TILE;
G.state.player.y = 40 * G.TILE;
G.state.loadouts.nobody = ["bonk", "dash", "bite"];
const originalLoadouts = JSON.stringify(G.state.loadouts);
assert.equal(G.expeditionUnlocked(), true);
assert.equal(G.startManyfoldExpedition(3), true);
let guard = 0;
while (G.state.expeditionRun && guard++ < 20) {
  const active = G.state.expeditionRun;
  if (active.phase === "route") {
    const route = active.routeChoices.find((choice) => choice.id === "camp" || choice.id === "cache") || active.routeChoices[0];
    assert.equal(G.chooseExpeditionRoute(route.id), true);
  } else if (active.phase === "battle") {
    const last = G.state.enemies[G.state.enemies.length - 1];
    for (const enemy of G.state.enemies) enemy.dead = true;
    G.events.emit("kill", { enemy: last.id, expeditionChampion: !!last.expeditionChampion });
  } else if (active.phase === "reward") {
    assert.ok(active.draftOptions.length >= 3);
    assert.equal(G.chooseExpeditionDraft(0), true);
  }
}
assert.ok(guard < 20, "the three-room run should reach a conclusion");
assert.equal(G.state.expeditionRun, null);
assert.equal(G.state.expedition.victories, 1);
assert.equal(G.state.mapId, "overworld");
assert.equal(JSON.stringify(G.state.loadouts), originalLoadouts, "drafted moves must remain run-only");

// Leaving a fresh run cannot be used as a free campaign heal.
G.state.player.damageTaken = 3;
G.state.player.mana = 4;
assert.equal(G.startManyfoldExpedition(3), true);
assert.equal(G.state.player.damageTaken, 0, "a run starts on equal footing");
assert.equal(G.failManyfoldExpedition("Test retreat", true), true);
assert.equal(G.state.player.damageTaken, 3);
assert.equal(G.state.player.mana, 4);

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const script of ["rival.js", "incidents.js", "expeditions.js"])
  assert.ok(index.includes(script), `${script} must be loaded before boot`);
const saveSource = fs.readFileSync(path.join(root, "js/engine/save.js"), "utf8");
for (const field of ["incidents", "rivalState", "expedition", "expeditionRun"])
  assert.ok(saveSource.includes(`${field}: s.${field}`), `${field} must be serialized`);

console.log("shifting world tests passed");
