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

function testProjectile(x, y, fromPlayer) {
  return {
    x, y, vx: 1, vy: 0, speed: 1, damage: 1, type: "sharp", size: 2,
    color: "#f4f4f4", startX: x, startY: y, range: 100,
    fromPlayer, armT: 0, trail: [], trailLength: 0,
  };
}

// Water remains movement terrain, but it must never eat player or enemy shots.
G.world.load("sunkenMarsh");
const waterX = 7 * G.TILE + G.TILE / 2;
const waterY = 4 * G.TILE + G.TILE / 2;
assert.equal(G.world.cellAt(waterX, waterY).tile, "water");
for (const fromPlayer of [true, false]) {
  G.state.projectiles = [testProjectile(waterX, waterY, fromPlayer)];
  G.combat.updateProjectiles(0.016);
  assert.equal(G.state.projectiles.length, 1, "water should allow every projectile to pass");
}
G.world.load("emberRidge");
G.state.projectiles = [testProjectile(G.TILE / 2, G.TILE / 2 + 4, true)];
G.combat.updateProjectiles(0.016);
assert.equal(G.state.projectiles.length, 0, "true walls should still stop projectiles");

// Boss movement uses a padded exit keep-out, while players and ordinary
// enemies retain the normal walkable portal behavior.
G.world.load("windscarCanyon");
const exit = G.state.portalKeepouts.find((portal) => portal.x === G.TILE / 2);
const exitBoss = G.state.enemies.find((enemy) => enemy.def.id === "skySovereign");
const clearance = G.TILE + (exitBoss.def.contactSize || Math.min(exitBoss.def.size, 18)) / 2;
exitBoss.x = exit.x + clearance + 1;
exitBoss.y = exit.y;
const bossBeforeExitMove = exitBoss.x;
G.world.moveBox(exitBoss, -4, 0);
assert.equal(exitBoss.x, bossBeforeExitMove, "a boss must not enter an exit's player trigger footprint");
const ordinaryAtExit = G.makeEnemy("slime", exit.x + clearance + 1, exit.y);
G.world.moveBox(ordinaryAtExit, -4, 0);
assert.ok(ordinaryAtExit.x < exit.x + clearance + 1, "ordinary enemies should not gain an invisible portal wall");

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

// The expansion is one legible, bidirectional road between the two legacy
// world entrances. Every arrival must land beside the portal that returns to
// its source; otherwise holding a direction can silently chain into a loop.
const worldwakeRoute = [
  "sunstepPrairie", "windscarCanyon", "hangingGardens", "rootdeepHollow",
  "glasswaterDesert", "titanGrave", "stormspinePeaks", "frostbellTundra",
];
function mapPortalCells(map) {
  const found = [];
  for (let y = 0; y < map.tiles.length; y++) for (let x = 0; x < map.tiles[y].length; x++) {
    const cell = map.legend[map.tiles[y][x]];
    if (cell && cell.portal) found.push({ x, y, cell });
  }
  return found;
}
for (let i = 0; i < worldwakeRoute.length - 1; i++) {
  const fromId = worldwakeRoute[i], toId = worldwakeRoute[i + 1];
  const forward = mapPortalCells(G.maps[fromId]).find((entry) => entry.cell.portal.map === toId);
  const back = mapPortalCells(G.maps[toId]).find((entry) => entry.cell.portal.map === fromId);
  assert.ok(forward && back, `${fromId} and ${toId} must link in both directions`);
  assert.ok(Math.abs(forward.cell.portal.x - back.x) + Math.abs(forward.cell.portal.y - back.y) <= 2,
    `${fromId} must arrive beside ${toId}'s return path`);
  assert.ok(Math.abs(back.cell.portal.x - forward.x) + Math.abs(back.cell.portal.y - forward.y) <= 2,
    `${toId} must arrive beside ${fromId}'s return path`);
}
const internalEdges = new Set();
const regionIds = new Set(worldwakeRoute);
const outsideWorld = new Set();
for (const mapId of worldwakeRoute) for (const { cell } of mapPortalCells(G.maps[mapId])) {
  if (regionIds.has(cell.portal.map)) internalEdges.add([mapId, cell.portal.map].sort().join(":"));
  else outsideWorld.add(cell.portal.map);
}
assert.equal(internalEdges.size, worldwakeRoute.length - 1, "the new world should not contain a repeating zone cycle");
assert.deepEqual(Array.from(outsideWorld).sort(), ["overworld", "shattercoast"],
  "the Worldwake road must have a clear exit at both ends");

// Worldbearers are visible inhabitants of the regions they rule. Their old
// worldback maps remain only as migration-safe exits for existing saves.
const openWorldRulers = {
  windscarCanyon: "skySovereign",
  hangingGardens: "oldMason",
  rootdeepHollow: "silkMatriarch",
  frostbellTundra: "bellTitan",
  stormspinePeaks: "lanternKeeper",
  titanGrave: "lastWorldbearer",
};
for (const [mapId, bossId] of Object.entries(openWorldRulers)) {
  const map = G.maps[mapId];
  assert.equal(map.worldBoss.enemy, bossId, `${bossId} should rule ${mapId} directly`);
  assert.equal(map.legend.B.enemy, bossId, `${mapId} must contain its ruler instead of a trial portal`);
  assert.equal(map.legend.B.portal, undefined);
  assert.equal(map.bossTrial.worldBoss, true, "open-world defeats should reset the living region");
}
// Retrying a Worldbearer keeps its living region populated, but never forces
// a second damage-type loadout just to clear the road back to the ruler.
const originalWardTypes = new Map(Object.entries(G.enemies)
  .filter(([, enemy]) => enemy.ward)
  .map(([id, enemy]) => [id, enemy.ward.types.join(",")]));
for (const [mapId, bossId] of Object.entries(openWorldRulers)) {
  G.world.load(mapId);
  const rulerTypes = G.enemies[bossId].ward.types.join(",");
  const ordinaryWarded = G.state.enemies.filter((enemy) => !enemy.def.miniboss && enemy.ward);
  const ordinaryUnwarded = G.state.enemies.filter((enemy) => !enemy.def.miniboss && !enemy.def.ward);
  assert.ok(ordinaryWarded.length > 0, mapId + " should exercise its shared regional ward");
  for (const enemy of ordinaryWarded) {
    assert.equal(enemy.ward.types.join(","), rulerTypes,
      enemy.def.name + " should share " + G.enemies[bossId].name + "'s ward type");
    assert.equal(enemy.ward.hpMax, enemy.def.ward.hp, "regional ward matching must not increase shield strength");
  }
  for (const enemy of ordinaryUnwarded)
    assert.equal(enemy.ward, null, "naturally unwarded enemies should not gain extra retry health");
}
for (const [id, types] of originalWardTypes)
  assert.equal(G.enemies[id].ward.types.join(","), types, id + "'s ward definition must stay map-local");
for (const mapId of ["griffinWorldback", "golemWorldback", "weaverWorldback",
  "bellWorldback", "lanternWorldback", "colossusWorldback"])
  assert.equal(G.maps[mapId].legend.B.enemy, undefined, `${mapId} must not duplicate an open-world ruler`);

G.state.worldwake.marks.push("sky");
G.world.load("windscarCanyon");
assert.equal(G.state.enemies.some((enemy) => enemy.def.id === "skySovereign"), false,
  "a purified Worldbearer must not repeat when its region reloads");
G.state.worldwake.marks = G.state.worldwake.marks.filter((mark) => mark !== "sky");
G.world.load("windscarCanyon");
assert.equal(G.state.enemies.some((enemy) => enemy.def.id === "skySovereign"), true,
  "an undefeated Worldbearer must still inhabit its region");

// Titan Grave's northern road opens only after the Lantern Keeper falls. The
// gate is progression, never a trap: Glasswater's western route stays open.
G.world.load("glasswaterDesert");
const southX = 23 * G.TILE + G.TILE / 2;
const southY = 28 * G.TILE + G.TILE / 2;
assert.equal(G.world.solid(southX, southY), true);
G.events.emit("pickup", { item: "trophy-lantern-keeper" });
assert.ok(G.state.worldwake.marks.includes("light"));
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
  assert.equal(boss.spriteScale, 2, `${id} should render at a crisp boss-only double scale`);
  assert.ok(G.enemies[id].size >= 34 && G.enemies[id].contactSize < G.enemies[id].size,
    `${id} should look and target physically larger without widening its damaging charge body`);
}

// Aurelia announces a stable safe wind lane and warns before it activates.
// Ignoring it costs one heart and mends the boss, so tanking the mechanic makes
// the fight longer without increasing its burst damage.
G.world.load("windscarCanyon");
let arenaBoss = G.state.enemies.find((enemy) => enemy.def.id === "skySovereign");
const ordinaryEnemies = G.state.enemies.filter((enemy) => !enemy.def.miniboss).length;
G.state.player.x = arenaBoss.x - 105;
G.state.player.y = arenaBoss.y;
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
arenaBoss.hp -= 10;
arenaBoss.bossStagger = 3;
const beforeMend = arenaBoss.hp;
G.updateBossHazards(0.4);
assert.equal(G.state.player.x, beforeGust.x, "gust lane must not move during its warning");
G.updateBossHazards(0.5);
assert.ok(G.state.player.x > beforeGust.x, "an unsafe gust lane should push a distant player inward");
assert.equal(G.state.player.damageTaken, beforeGust.damage + 1, "ignoring a gust lane should cost one heart");
assert.equal(arenaBoss.hp, beforeMend + 2, "failed Phase I arena control should mend two boss health");
assert.equal(arenaBoss.bossStagger, 2, "a failed pattern should also release a little melee pressure");
assert.equal(G.state.enemies.filter((enemy) => !enemy.def.miniboss).length, ordinaryEnemies,
  "ordinary biome enemies must remain present during a Worldbearer fight");
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
G.world.load("frostbellTundra");
arenaBoss = G.state.enemies.find((enemy) => enemy.def.id === "bellTitan");
G.state.player.x = arenaBoss.x - 105;
G.state.player.y = arenaBoss.y;
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
assert.equal(stormCell.hit, false, "a successful dash must not consume the grid's one failure check");
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

// The regional fire is preparation and a retry point, not an infinite heal
// during the fight. A knockout reloads the biome and restores its ruler.
G.world.load("windscarCanyon");
arenaBoss = G.state.enemies.find((enemy) => enemy.def.id === "skySovereign");
arenaBoss.bossEngaged = true;
const fire = { x: 7 * G.TILE + G.TILE / 2, y: 20 * G.TILE + G.TILE / 2 };
G.state.player.x = fire.x;
G.state.player.y = fire.y;
G.state.player.damageTaken = 2;
G.world.checkTriggers(0.016);
assert.equal(G.state.player.damageTaken, 2, "an engaged Worldbearer must command and lock the regional campfire");

arenaBoss.hp = 1;
G.state.player.damageTaken = G.playerMaxHearts() - 1;
G.state.player.invuln = 0;
G.damagePlayer(1, arenaBoss.x, arenaBoss.y);
assert.ok(G.state.knockout && G.state.knockout.exit.map === "windscarCanyon");
G.updateKnockout(2.2);
arenaBoss = G.state.enemies.find((enemy) => enemy.def.id === "skySovereign");
assert.equal(G.state.mapId, "windscarCanyon");
assert.equal(arenaBoss.hp, arenaBoss.def.hp, "a failed attempt must restore the open-world ruler to full health");
assert.ok(G.util.dist(G.state.player.x, G.state.player.y, fire.x, fire.y) < G.TILE * 2,
  "the caravan should carry a defeated player back to the regional fire");

// The overworld boundary transition uses two moving room buffers, linear
// motion, and roughly twice the former lockout to match the NES Zelda cadence.
const mainSource = fs.readFileSync(path.join(root, "js/engine/main.js"), "utf8");
assert.match(mainSource, /scrollDuration:\s*0\.96/);
assert.match(mainSource, /duration:\s*1\.12/);
assert.match(mainSource, /ctx\.drawImage\(tr\.incoming, newX, newY\)/);
assert.doesNotMatch(mainSource, /1 - Math\.pow\(1 - raw, 3\)/,
  "classic room scrolling should be linear rather than eased");

console.log("worldwake tests passed");
