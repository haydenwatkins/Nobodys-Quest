"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ console, Math, Date, Map, Set, WeakMap,
  window: { matchMedia: () => ({ matches: false }) } });
function run(file, suffix = "") {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8") + suffix, context, { filename: file });
}

run("js/engine/core.js", ";this.G = G;");
const G = context.G;
G.sfx = { play() {}, attack() {}, impact() {} };
G.ui = { toast() {}, banner() {}, update() {} };
G.saveGame = () => {};
G.input = { vec: { x: 0, y: 0 }, tapped: () => false, clearTaps() {} };
G.checkCostumeUnlocks = () => [];
run("js/engine/world.js");
run("js/engine/combat.js");
run("js/engine/entities.js");
run("js/engine/forms.js");
run("js/abilities/basics.js");
for (const file of ["nobody", "rat", "knight", "ranger", "wizard", "frog", "alchemist", "stormcaller",
  "dragon", "riftblade", "mole", "vampire", "jester", "turtle", "samurai", "astronomer", "druid",
  "griffin", "golem", "weaver", "bellkeeper", "lantern-wisp", "colossus", "god"])
  run(`js/forms/${file}.js`);
run("js/engine/quests.js");
run("js/engine/passives.js");
run("js/data/enemies.js");
run("js/data/maps.js");
run("js/engine/worldwake.js");
G.validateCrossRefs();

G.state = {
  player: G.makePlayer(), formId: "griffin", stars: 0, items: [], opened: [], known: [],
  claimedForms: G.formOrder.filter((id) => id !== "nobody"), unlockReadyNotified: [], loadouts: {},
  pinnedQuestIds: [], worldwake: G.makeWorldwake(), enemies: [], projectiles: [], pickups: [],
  shake: 0, hitStop: 0, cameraKickX: 0, cameraKickY: 0, time: 5,
};

G.world.load("sunstepPrairie");
assert.deepEqual(Array.from(G.state.worldwake.discovered), ["sunstepPrairie"]);
assert.equal(G.state.mapW, 46);
assert.equal(G.state.mapH, 29);

for (const region of G.WORLDWAKE_REGIONS) {
  const map = G.maps[region.id];
  const solidChars = new Set(["t", "r", "w", "#"]);
  const seen = new Set();
  const queue = [[map.playerStart.x, map.playerStart.y]];
  while (queue.length) {
    const [x, y] = queue.shift();
    const key = `${x},${y}`;
    if (seen.has(key) || y < 0 || y >= map.tiles.length || x < 0 || x >= map.tiles[y].length) continue;
    if (solidChars.has(map.tiles[y][x])) continue;
    seen.add(key);
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  let walkable = 0;
  for (const row of map.tiles) for (const ch of row) if (!solidChars.has(ch)) walkable++;
  assert.equal(seen.size, walkable, `${region.name} should have no inaccessible pockets or blocked rewards`);
  for (const cell of Object.values(map.legend)) {
    if (cell.portal) assert.ok(G.maps[cell.portal.map], `${region.name} should not point to a missing region`);
  }
}

// The southern horizon is a true shortcut: collision opens when the Sky Mark
// is earned, with no new traversal button or inventory micromanagement.
const southX = 23 * G.TILE + G.TILE / 2;
const southY = 28 * G.TILE + G.TILE / 2;
assert.equal(G.world.solid(southX, southY), true);
G.events.emit("pickup", { item: "trophy-sky-sovereign" });
assert.ok(G.state.worldwake.marks.includes("sky"));
assert.equal(G.world.solid(southX, southY), false);

// Exploration favors remember unique actions rather than rewarding spam.
for (const ability of ["wingbeat", "featherGale", "skyDive", "ghostlight", "stitchline"])
  G.events.emit("abilityUse", { ability, form: "griffin" });
assert.equal(G.state.worldwake.stylesUsed.length, 5);
for (let i = 0; i < 6; i++) G.events.emit("sign", { message: `Caravan story ${i}` });
assert.ok(G.state.worldwake.favorsDone.includes("campfireStories"));
assert.ok(G.state.worldwake.favorsDone.includes("manyWays"));

// Masonry and Safe Light are defensive geometry, not hidden damage boosts.
G.state.formId = "golem";
G.state.player.dir = { x: 1, y: 0 };
G.passives.onAbilityUse(G.state.player, "rampartPulse");
assert.equal(G.state.passiveShelters.length, 1);
const wall = G.state.passiveShelters[0];
G.state.projectiles.push({
  x: wall.x, y: wall.y, vx: 0, vy: 0, speed: 0, damage: 2, size: 3,
  color: "#b13e53", startX: wall.x, startY: wall.y, range: 100,
  fromPlayer: false, armT: 0, trail: [], trailLength: 0,
});
G.combat.updateProjectiles(0.016);
assert.equal(G.state.projectiles.length, 0, "Masonry should swallow a hostile shot without hurting anything");

// The final form remains last and now genuinely includes the whole expansion.
assert.equal(G.formOrder.at(-1), "god");
assert.equal(G.formOrder.length, 24);
assert.equal(G.abilities.worldBreak.damage, undefined, "ability metadata must not smuggle a passive damage bonus");
assert.equal(G.forms.colossus.hearts, 8);
assert.equal(G.forms.colossus.speed, 48);

// Worldbearers own arena-control moves instead of merely borrowing the same
// projectile rotation as older bosses. The tighter pursuit only starts at
// genuine kiting distance, while every floor attack remains one damage.
const arenaPatterns = {
  skySovereign: ["gustLanes", "windWall"],
  oldMason: ["faultGrid", "collapseRing"],
  silkMatriarch: ["silkTether", "webGrid"],
  bellTitan: ["stormGrid", "echoCross"],
  lanternKeeper: ["safeCircle", "stormGrid"],
  lastWorldbearer: ["worldGrid", "collapseRing", "gustLanes"],
};
for (const [id, patterns] of Object.entries(arenaPatterns)) {
  const boss = G.enemies[id].boss;
  for (const pattern of patterns)
    assert.ok(boss.patterns.includes(pattern), `${id} needs its ${pattern} arena pattern`);
  assert.ok(boss.antiKiteRange <= 112 && boss.chaseScale >= 1.28,
    `${id} should close only excessive ranged distance decisively`);
}

// Aurelia announces a stable safe wind lane, warns before it moves the player,
// and never deals hidden gust damage.
G.world.load("griffinWorldback");
let arenaBoss = G.state.enemies.find((enemy) => enemy.def.id === "skySovereign");
arenaBoss.bossEngaged = true;
arenaBoss.bossIntroT = 0;
arenaBoss.bossSpecialT = 0;
G.state.bossCutscene = null;
G.updateEnemies(0.016);
assert.equal(arenaBoss.bossPendingAction, "gustLanes");
G.updateEnemies(arenaBoss.def.boss.telegraph + 0.02);
assert.equal(G.state.bossHazards.length, 1);
assert.equal(G.state.bossHazards[0].kind, "gust");
const beforeGust = { x: G.state.player.x, damage: G.state.player.damageTaken };
G.updateBossHazards(0.4);
assert.equal(G.state.player.x, beforeGust.x, "gust lane must not move during its warning");
G.updateBossHazards(0.5);
assert.ok(G.state.player.x > beforeGust.x, "an unsafe gust lane should push a distant player inward");
assert.equal(G.state.player.damageTaken, beforeGust.damage, "wind pressure should reposition, not damage");
const hazardDrawCalls = { lines: 0, evenodd: 0 };
const hazardCtx = {
  save() {}, restore() {}, beginPath() {}, rect() {}, clip() {}, fillRect() {}, strokeRect() {},
  moveTo() {}, lineTo() { hazardDrawCalls.lines++; }, stroke() {}, arc() {}, setLineDash() {},
  fill(rule) { if (rule === "evenodd") hazardDrawCalls.evenodd++; },
};
G.drawBossHazards(hazardCtx);
assert.ok(hazardDrawCalls.lines >= 3, "gust warnings should draw directional arrows toward the boss");

// Bongle's grid alternates full readable floor bands. It can hurt once after
// the warning, but dash invulnerability remains a universal game rule.
G.world.load("bellWorldback");
arenaBoss = G.state.enemies.find((enemy) => enemy.def.id === "bellTitan");
arenaBoss.bossEngaged = true;
arenaBoss.bossIntroT = 0;
arenaBoss.bossSpecialT = 0;
G.state.bossCutscene = null;
G.updateEnemies(0.016);
assert.equal(arenaBoss.bossPendingAction, "stormGrid");
G.updateEnemies(arenaBoss.def.boss.telegraph + 0.02);
const stormCell = G.state.bossHazards.find((hazard) => hazard.kind === "grid" && !hazard.delay);
assert.ok(stormCell && stormCell.warning >= 0.85, "electric floor needs a long readable warning");
G.state.player.x = G.TILE * 1.5 + stormCell.cell + 5; // odd vertical band
G.state.player.y = 11 * G.TILE + G.TILE / 2;
G.state.player.damageTaken = 0;
G.state.player.invuln = 0;
G.state.player.dashing = { left: 20, speed: 200 };
G.updateBossHazards(stormCell.warning + 0.01);
assert.equal(G.state.player.damageTaken, 0, "dash abilities must ignore electric floor damage");
stormCell.hit = false;
G.state.player.dashing = null;
G.state.player.invuln = 0;
G.updateBossHazards(0.01);
assert.equal(G.state.player.damageTaken, 1, "an active unsafe grid cell deals one learnable hit");
G.state.bossHazards.push({
  kind: "ring", owner: arenaBoss, mapId: G.state.mapId, t: 1,
  delay: 0, warning: 0.5, active: 1, color: "#ffcd75",
  x: arenaBoss.x, y: arenaBoss.y, radius: 72,
});
G.drawBossHazards(hazardCtx);
assert.equal(hazardDrawCalls.evenodd, 1, "closing safe zones must shade the exact dangerous area");
G.cancelBossHazards(arenaBoss);
assert.equal(G.state.bossHazards.length, 0, "melee stagger can clear a boss's active arena control");

console.log("worldwake tests passed");
