"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({
  console,
  Math,
  Date,
  performance: { now: () => Date.now() },
  window: { matchMedia: () => ({ matches: false }) },
});

function run(file, suffix = "") {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  vm.runInContext(source + suffix, context, { filename: file });
}

run("js/engine/core.js", ";this.G = G;");
const G = context.G;
const sounds = [];
G.sfx = {
  play: (name) => sounds.push(name),
  attack: (kind, type, power) => sounds.push(`attack:${kind}:${type}:${power}`),
  impact: (type, power) => sounds.push(`impact:${type}:${power}`),
};
G.ui = { toast() {}, banner() {}, update() {} };
G.playerForm = () => ({ breaksAnyWard: false, speed: 80, hearts: 3 });
G.world = {
  solid: () => false,
  moveBox(entity, dx, dy) { entity.x += dx; entity.y += dy; },
  checkTriggers() {},
};
G.checkUnlocks = () => {};
G.saveGame = () => {};
run("js/engine/combat.js");

function enemy(x = 10, y = 0) {
  return {
    id: "dummy", x, y, hp: 10, dead: false, flash: 0,
    def: { hp: 10, size: 10, heavy: false },
    h() { return 10; }, kbx: 0, kby: 0, hitKickX: 0, hitKickY: 0,
    ward: null, status: null,
  };
}

function freshState(target) {
  G.fx.length = 0;
  sounds.length = 0;
  G.state = {
    player: { x: 0, y: 0, dir: { x: 1, y: 0 }, mana: 0, manaMax: 10 },
    enemies: target ? [target] : [], projectiles: [], pickups: [], items: [],
    hitStop: 0, shake: 0, cameraKickX: 0, cameraKickY: 0, time: 1,
  };
}

{
  const target = enemy();
  freshState(target);
  G.combat.damageEnemy(target, { damage: 1, type: "blunt", ability: "slap", fromX: 0, fromY: 0 });
  assert.equal(target.hp, 9, "feel pass must not change damage");
  assert.equal(G.state.hitStop, 0.025);
  assert.ok(G.state.shake > 0 && Math.abs(G.state.cameraKickX) > 0);
  assert.ok(G.fx.some((fx) => fx.kind === "impact"));
  assert.ok(sounds.includes("impact:blunt:1"));
}

{
  const target = enemy();
  target.ward = { types: ["light"], hp: 2, hpMax: 2 };
  freshState(target);
  G.combat.damageEnemy(target, { damage: 1, type: "blunt", ability: "slap" });
  assert.equal(target.hp, 10);
  assert.equal(target.ward.hp, 2);
  assert.equal(G.state.hitStop, 0, "wrong ward hit stays a quick deflection");
}

{
  freshState();
  G.combat.shoot(G.state.player, {
    ability: "arrow", speed: 190, range: 140, damage: 1, type: "sharp",
    recoil: 2, trail: 4, hitStop: 0.022,
  });
  const projectile = G.state.projectiles[0];
  assert.equal(projectile.damage, 1);
  assert.equal(projectile.range, 140);
  assert.equal(projectile.trailLength, 4);
  G.combat.updateProjectiles(0.016);
  assert.equal(projectile.trail.length, 1);
  assert.ok(G.state.player.attackPose, "ranged attacks visibly recoil");
}

// Exercise the real ability registry and lock the basic balance numbers.
G.abilities = {};
context.registerAbility = (ability) => { G.abilities[ability.id] = ability; };
run("js/abilities/basics.js");
const expectedBasics = {
  slap: [0, 0.35], bite: [0, 0.3], slash: [0, 0.5], arrow: [0, 0.45],
  curse: [0, 0.55], tongueLash: [0, 0.45], bottleBonk: [0, 0.4],
  stormSpark: [0, 0.45], tailSweep: [0, 0.55], divineSpark: [0, 0.5],
  drillTap: [0, 0.38], bloodBite: [0, 0.34], wildCard: [0, 0.45],
  shellJab: [0, 0.42], quickdraw: [0, 0.4], starNeedle: [0, 0.46], thornLash: [0, 0.47],
};
for (const [id, values] of Object.entries(expectedBasics)) {
  assert.deepEqual([G.abilities[id].mana, G.abilities[id].cooldown], values, `${id} balance changed`);
}
assert.equal(Object.keys(G.abilities).length, 53);

// Directional melee gets a collision-safe six-pixel contact step only when a
// swing would narrowly miss. A landed swing also grants one cast-level mana
// bonus and a tiny separate guard window.
{
  const target = enemy(28, 0);
  freshState(target);
  G.abilities.slap.use(G.state.player);
  assert.equal(target.hp, 9, "contact assist should turn a six-pixel near miss into a hit");
  assert.ok(G.state.player.x > 5.4 && G.state.player.x <= G.MELEE_ASSIST_STEP);
  assert.equal(G.state.player.mana, 2, "melee gets normal hit mana plus one cast-level bonus");
  assert.equal(G.state.player.meleeGuard, G.MELEE_GUARD_SECONDS);
}

{
  const behind = enemy(-28, 0);
  freshState(behind);
  G.abilities.slap.use(G.state.player);
  assert.equal(behind.hp, 10, "contact assist must never target behind the player");
  assert.equal(G.state.player.x, 0);
  assert.equal(G.state.player.mana, 0, "whiffs grant neither mana nor protection");
  assert.equal(G.state.player.meleeGuard || 0, 0);
}

{
  const blocked = enemy(28, 0);
  freshState(blocked);
  const realMoveBox = G.world.moveBox;
  G.world.moveBox = () => {};
  G.abilities.slap.use(G.state.player);
  G.world.moveBox = realMoveBox;
  assert.equal(blocked.hp, 10, "world collision must be able to block the contact step");
  assert.equal(G.state.player.x, 0);
}

{
  const outsideBurst = enemy(39, 0);
  freshState(outsideBurst);
  G.abilities.fester.use(G.state.player);
  assert.equal(outsideBurst.hp, 10, "360-degree bursts must not magnetize toward targets");
  assert.equal(G.state.player.x, 0);
}

// Six genuine melee connections stagger an engaged boss, cancel its current
// attack, then start a resistance window that prevents stun-locking.
{
  const guardian = enemy(10, 0);
  guardian.hp = guardian.def.hp = 100;
  guardian.def.miniboss = true;
  guardian.def.boss = { color: "#ffcd75" };
  guardian.bossEngaged = true;
  guardian.bossIntroT = 0;
  guardian.bossStagger = 0;
  guardian.bossStaggerT = 0;
  guardian.bossStaggerResistT = 0;
  guardian.bossTelegraphT = 0.4;
  guardian.bossChargeT = 0.3;
  guardian.bossPendingAction = "charge";
  guardian.bossAfterCharge = "quake";
  freshState(guardian);
  for (let i = 0; i < G.BOSS_STAGGER_HITS; i++) G.abilities.slap.use(G.state.player);
  assert.equal(guardian.bossStaggerT, G.BOSS_STAGGER_SECONDS);
  assert.equal(guardian.bossStaggerResistT, G.BOSS_STAGGER_RESIST_SECONDS);
  assert.equal(guardian.bossTelegraphT, 0);
  assert.equal(guardian.bossChargeT, 0);
  assert.equal(guardian.bossPendingAction, null);
  assert.ok(sounds.includes("stagger"));
  G.abilities.slap.use(G.state.player);
  assert.equal(guardian.bossStagger, 0, "the resistance window must reject new stagger build-up");
}

// The menu's declared type is the contract for every damaging part of a move.
// This catches nested payload drift such as a DARK dash ending in a BLUNT burst.
{
  const builderNames = ["meleeArc", "shoot", "chain", "areaBurst", "dash"];
  const realBuilders = Object.fromEntries(builderNames.map((name) => [name, G.combat[name]]));
  for (const ability of Object.values(G.abilities)) {
    freshState();
    const payloads = [];
    for (const name of builderNames) {
      G.combat[name] = (user, opts) => {
        payloads.push({ name, opts });
        if (name === "dash") user.dashing = { ...opts };
        return 0;
      };
    }
    assert.doesNotThrow(() => ability.use(G.state.player), `${ability.id} type audit should execute`);
    assert.ok(payloads.length, `${ability.id} should use a combat damage builder`);
    for (const payload of payloads) {
      assert.equal(payload.opts.type, ability.type, `${ability.id} ${payload.name} must stay ${ability.type}`);
      if (payload.opts.endBurst)
        assert.equal(payload.opts.endBurst.type, ability.type, `${ability.id} end burst must stay ${ability.type}`);
    }
  }
  Object.assign(G.combat, realBuilders);
}

for (const ability of Object.values(G.abilities)) {
  freshState();
  G.state.player.invuln = 0;
  assert.doesNotThrow(() => ability.use(G.state.player), `${ability.id} should execute`);
}

{
  freshState();
  G.abilities.shellCounter.use(G.state.player);
  assert.equal(G.state.player.meleeGuard, 0.58, "Shell Counter should provide a short deliberate guard window");
}

{
  const target = enemy(40, 0);
  freshState(target);
  const before = target.x;
  G.abilities.gravityWell.use(G.state.player);
  assert.equal(target.hp, 8);
  assert.ok(target.x < before, "Gravity Well should pull a target toward its caster");
}

{
  freshState();
  G.state.player.starBeat = 3;
  G.abilities.starNeedle.use(G.state.player);
  assert.equal(G.state.projectiles[0].pierce, true, "every fourth Star Needle should align and pierce");
}

{
  const targets = [enemy(38, 0), enemy(74, 0), enemy(110, 0)];
  freshState();
  G.state.enemies = targets;
  G.state.player.cardBeat = 2;
  G.abilities.wildCard.use(G.state.player);
  for (let i = 0; i < 40 && G.state.projectiles.length; i++) G.combat.updateProjectiles(0.03);
  assert.deepEqual(targets.map((target) => target.hp), [9, 9, 9], "third Wild Card should ricochet through new targets once each");
}

{
  const target = enemy(10, 0);
  freshState(target);
  G.state.player.damageTaken = 2;
  for (let i = 0; i < 5; i++) G.abilities.bloodBite.use(G.state.player);
  assert.equal(G.state.player.damageTaken, 1, "five successful bites should restore exactly one heart");
  assert.equal(G.state.player.bloodPips, 0);
}

{
  const targets = [enemy(10, 0), enemy(12, 4)];
  freshState();
  G.state.enemies = targets;
  G.state.player.invuln = 0;
  G.abilities.burrowBlitz.use(G.state.player);
  const dashData = G.state.player.dashing;
  const hits = G.combat.finishDash(G.state.player, dashData);
  assert.equal(hits, 2, "Burrow Blitz should erupt at its chosen endpoint");
  assert.ok(targets.every((target) => target.hp === 8));
}

{
  const darkWard = enemy(10, 0);
  darkWard.ward = { types: ["dark"], hp: 2, hpMax: 2 };
  freshState(darkWard);
  G.abilities.burrowBlitz.use(G.state.player);
  G.combat.finishDash(G.state.player, G.state.player.dashing);
  assert.equal(darkWard.ward.hp, 0, "Burrow Blitz's DARK eruption must break a dark ward");
  assert.equal(darkWard.hp, 10, "breaking the ward should not also damage health");
}

{
  const darkWard = enemy(10, 0);
  darkWard.ward = { types: ["dark"], hp: 2, hpMax: 2 };
  freshState(darkWard);
  G.combat.damageEnemy(darkWard, {
    ability: "burrowBlitz", damage: 2, type: "blunt", fromX: 0, fromY: 0,
  });
  assert.equal(darkWard.ward.hp, 0, "the registry type must override a stale nested payload");
}

{
  freshState();
  G.abilities.returningStar.use(G.state.player);
  const star = G.state.projectiles[0];
  assert.equal(star.boomerang, true);
  assert.equal(star.damage, 1);
  for (let i = 0; i < 7 && !star.returning; i++) G.combat.updateProjectiles(0.1);
  assert.equal(star.returning, true, "Returning Star should turn around after its outward pass");
  const oldVy = star.vy;
  G.state.player.y = 40;
  G.combat.updateProjectiles(0.016);
  assert.notEqual(star.vy, oldVy, "moving the thrower should bend the return path");
}

{
  const target = enemy(50, 0);
  freshState(target);
  G.abilities.returningStar.use(G.state.player);
  for (let i = 0; i < 40 && G.state.projectiles.length; i++) G.combat.updateProjectiles(0.04);
  assert.equal(target.hp, 8, "Returning Star may hit once out and once back, never more");
}

// Fault Line is a traveling shockwave: three spaced targets should each take
// one eruption, and the whole cast should report one three-target multi-hit.
{
  const targets = [enemy(30, 0), enemy(70, 0), enemy(110, 0)];
  freshState();
  G.state.enemies = targets;
  let faultEvent = null;
  G.events.on("multiHit", (data) => { if (data.ability === "faultLine") faultEvent = data; });
  G.abilities.faultLine.use(G.state.player);
  assert.equal(G.state.projectiles[0].pierce, true);
  assert.equal(G.state.projectiles[0].explodeRadius, 27);
  for (let i = 0; i < 80 && G.state.projectiles.length; i++) G.combat.updateProjectiles(0.02);
  assert.deepEqual(targets.map((target) => target.hp), [8, 8, 8], "Fault Line should erupt once per target along its path");
  assert.equal(faultEvent.hits, 3, "Fault Line should aggregate unique hits across the complete wave");
}

// Existing straight piercing projectiles must keep passing through distinct
// enemies after the shared projectile accounting change.
for (const [abilityId, damage] of [["luckyArrow", 2], ["dark matter", 3], ["voidStar", 4]]) {
  const targets = [enemy(40, 0), enemy(85, 0)];
  freshState();
  G.state.enemies = targets;
  G.abilities[abilityId].use(G.state.player);
  assert.equal(G.state.projectiles[0].pierce, true, `${abilityId} should remain piercing`);
  for (let i = 0; i < 100 && G.state.projectiles.length; i++) G.combat.updateProjectiles(0.02);
  assert.deepEqual(targets.map((target) => target.hp), [10 - damage, 10 - damage], `${abilityId} should hit both targets once`);
}

// Ordinary impact blasts still stop and report their clustered hit count.
{
  const targets = [enemy(50, -12), enemy(50, 0), enemy(50, 12)];
  freshState();
  G.state.enemies = targets;
  let flaskEvent = null;
  G.events.on("multiHit", (data) => { if (data.ability === "volatileFlask") flaskEvent = data; });
  G.abilities.volatileFlask.use(G.state.player);
  for (let i = 0; i < 80 && G.state.projectiles.length; i++) G.combat.updateProjectiles(0.02);
  assert.deepEqual(targets.map((target) => target.hp), [8, 8, 8]);
  assert.equal(flaskEvent.hits, 3, "non-piercing explosions should retain clustered multi-hit events");
}

{
  freshState();
  G.state.enemies = [enemy(10, -2), enemy(11, 0), enemy(10, 2)];
  let finisherEvent = null;
  G.events.on("multiHit", (data) => { if (data.ability === "riftCut") finisherEvent = data; });
  for (let beat = 0; beat < 3; beat++) {
    G.state.time = beat * 0.2;
    G.abilities.riftCut.use(G.state.player);
  }
  assert.equal(G.state.player.riftCutCombo, 3);
  assert.equal(finisherEvent.combo, "finisher");
  assert.equal(finisherEvent.hits, 3);
  assert.ok(G.fx.some((fx) => fx.kind === "ring" && fx.color === "#73eff7"));
}

// Verify a tap shortly before cooldown completion is not lost.
run("js/engine/entities.js");
run("js/data/enemies.js");
assert.deepEqual(
  [G.enemies.ancientTreant.boss.style, G.enemies.mireQueen.boss.style, G.enemies.eclipseKnight.boss.style, G.enemies.riftbladeAdept.boss.style,
    G.enemies.moleMonarch.boss.style, G.enemies.countessCarmine.boss.style, G.enemies.royalFool.boss.style, G.enemies.godAvatar.boss.style],
  ["charger", "caster", "duelist", "riftblade", "mole", "vampire", "jester", "god"],
);
for (const id of ["riftbladeAdept", "moleMonarch", "countessCarmine", "royalFool", "godAvatar",
  "admiralTortoise", "paperRonin", "professorPerihelion", "grandmotherBriar"]) {
  assert.ok(G.enemies[id].boss.introLines.length >= 3, `${id} needs a personality-driven introduction`);
  assert.ok(G.enemies[id].hp >= 50, `${id} needs enough durability for players to learn its patterns`);
  assert.equal(G.enemies[id].boss.phases, 3, `${id} should have a three-act fight`);
  assert.ok(G.enemies[id].boss.phaseLine && G.enemies[id].boss.phaseThreeLine && G.enemies[id].boss.defeatLine);
  assert.ok(G.enemies[id].boss.knockoutLine, `${id} needs a personality-driven knockout line`);
}

// Clash grace blocks one immediate trade but is independent from normal hurt
// invulnerability and expires on its own player timer.
{
  G.forms.nobody = { id: "nobody", speed: 80, hearts: 3 };
  G.state = {
    formId: "nobody", mapDef: null,
    player: G.makePlayer(), enemies: [], projectiles: [], pickups: [], items: [],
    entryPoint: { x: 0, y: 0 }, hitStop: 0, shake: 0, cameraKickX: 0, cameraKickY: 0,
  };
  G.state.player.meleeGuard = G.MELEE_GUARD_SECONDS;
  G.damagePlayer(1, 20, 0);
  assert.equal(G.state.player.damageTaken, 0, "melee guard should prevent an immediate contact trade");
  G.state.player.meleeGuard = 0;
  G.damagePlayer(1, 20, 0);
  assert.equal(G.state.player.damageTaken, 1, "ordinary damage resumes after melee guard expires");
}

// Bosses invite close-range play between telegraphed attacks. Their passive
// body is safe, while ordinary enemies and active boss charges still collide.
{
  const guardian = G.makeEnemy("moleMonarch", 6, 0);
  guardian.bossEngaged = true;
  guardian.bossIntroT = 0;
  guardian.bossRecoverT = 1;
  G.state = {
    formId: "nobody", mapDef: null,
    player: G.makePlayer(), enemies: [guardian], projectiles: [], pickups: [], items: [],
    entryPoint: { x: 0, y: 0 }, hitStop: 0, shake: 0, cameraKickX: 0, cameraKickY: 0, time: 1,
  };
  G.updateEnemies(0.016);
  assert.equal(G.state.player.damageTaken, 0, "an idle boss body should be safe at melee range");
}

{
  const slime = G.makeEnemy("slime", 6, 0);
  G.state = {
    formId: "nobody", mapDef: null,
    player: G.makePlayer(), enemies: [slime], projectiles: [], pickups: [], items: [],
    entryPoint: { x: 0, y: 0 }, hitStop: 0, shake: 0, cameraKickX: 0, cameraKickY: 0, time: 1,
  };
  G.updateEnemies(0.016);
  assert.equal(G.state.player.damageTaken, 1, "ordinary enemy contact should remain dangerous");
}

{
  const guardian = G.makeEnemy("moleMonarch", 6, 0);
  guardian.bossEngaged = true;
  guardian.bossIntroT = 0;
  guardian.bossChargeT = 0.2;
  guardian.bossChargeX = 0;
  guardian.bossChargeY = 0;
  G.state = {
    formId: "nobody", mapDef: null,
    player: G.makePlayer(), enemies: [guardian], projectiles: [], pickups: [], items: [],
    entryPoint: { x: 0, y: 0 }, hitStop: 0, shake: 0, cameraKickX: 0, cameraKickY: 0, time: 1,
  };
  G.updateEnemies(0.016);
  assert.equal(G.state.player.damageTaken, guardian.def.damage, "an active boss charge should still hurt on contact");
}

// Boss projectiles are visible briefly before they can hurt a nearby player;
// regular shooters retain immediate projectile collision.
{
  const queen = G.makeEnemy("mireQueen", 15, 0);
  queen.bossEngaged = true;
  queen.bossIntroT = 0;
  queen.bossSpecialT = 99;
  queen.shootT = 0;
  G.state = {
    formId: "nobody", mapDef: null,
    player: G.makePlayer(), enemies: [queen], projectiles: [], pickups: [], items: [],
    entryPoint: { x: 0, y: 0 }, hitStop: 0, shake: 0, cameraKickX: 0, cameraKickY: 0, time: 1,
  };
  G.updateEnemies(0.016);
  assert.equal(G.state.projectiles.length, 1);
  assert.equal(G.state.projectiles[0].armT, G.BOSS_PROJECTILE_ARM_SECONDS);
  G.combat.updateProjectiles(0.05);
  G.combat.updateProjectiles(0.05);
  assert.equal(G.state.player.damageTaken, 0, "a new boss shot should not hit during its warning window");
  G.combat.updateProjectiles(0.03);
  assert.equal(G.state.player.damageTaken, queen.def.damage, "the boss shot should become dangerous after arming");
}

{
  const shooter = G.makeEnemy("thornling", 15, 0);
  shooter.shootT = 0;
  G.state = {
    formId: "nobody", mapDef: null,
    player: G.makePlayer(), enemies: [shooter], projectiles: [], pickups: [], items: [],
    entryPoint: { x: 0, y: 0 }, hitStop: 0, shake: 0, cameraKickX: 0, cameraKickY: 0, time: 1,
  };
  G.updateEnemies(0.016);
  assert.equal(G.state.projectiles[0].armT, 0, "ordinary enemy projectile timing should stay unchanged");
}

{
  const guardian = G.makeEnemy("moleMonarch", 10, 0);
  guardian.bossEngaged = true;
  guardian.bossIntroT = 0;
  guardian.bossStaggerT = G.BOSS_STAGGER_SECONDS;
  guardian.bossStaggerResistT = G.BOSS_STAGGER_RESIST_SECONDS;
  guardian.bossPendingAction = "burrow";
  G.state = {
    formId: "nobody", mapDef: null,
    player: G.makePlayer(), enemies: [guardian], projectiles: [], pickups: [], items: [],
    entryPoint: { x: 0, y: 0 }, hitStop: 0, shake: 0, cameraKickX: 0, cameraKickY: 0, time: 1,
  };
  G.updateEnemies(0.4);
  assert.ok(guardian.bossStaggerT > 0, "a staggered boss should remain action-locked for the full window");
  assert.equal(guardian.bossPendingAction, "burrow", "the stagger timer should freeze boss logic");
  assert.equal(G.state.player.damageTaken, 0, "a staggered boss must not deal contact damage");
  guardian.x = 80;
  G.updateEnemies(0.4);
  assert.equal(guardian.bossStaggerT, 0);
  G.updateEnemies(0.1);
  assert.ok(guardian.bossStaggerResistT < G.BOSS_STAGGER_RESIST_SECONDS, "resistance should count down after stagger ends");
}

// Trial defeats pause, eject to the declared overworld position, and reset the
// player. Re-entering calls the normal map loader, which creates a fresh boss.
{
  const guardian = G.makeEnemy("moleMonarch", 20, 0);
  let ejected = null;
  const oldLoad = G.world.load;
  G.world.load = (map, spawn) => { ejected = { map, spawn }; };
  G.forms.nobody = { id: "nobody", speed: 80, hearts: 3 };
  G.state = {
    formId: "nobody",
    mapId: "moleTrial",
    mapDef: { bossTrial: { exit: { map: "overworld", x: 40, y: 1 }, delay: 1.5 } },
    player: G.makePlayer(), enemies: [guardian], projectiles: [{}], pickups: [], items: [],
    entryPoint: { x: 0, y: 0 }, hitStop: 0, shake: 0, cameraKickX: 0, cameraKickY: 0,
  };
  G.state.player.damageTaken = 2;
  G.damagePlayer(1);
  assert.ok(G.state.knockout && G.state.knockout.t === 1.5);
  assert.equal(G.state.projectiles.length, 0, "enemy shots should clear when the trial is lost");
  G.updateKnockout(1.51);
  assert.equal(ejected.map, "overworld");
  assert.equal(ejected.spawn.x, 40);
  assert.equal(ejected.spawn.y, 1);
  assert.equal(G.state.player.damageTaken, 0);
  assert.ok(G.state.player.mana >= G.MANA_RESERVE);
  G.world.load = oldLoad;
}

// A Phase II fan can land the final hit while several sibling projectiles are
// still in the array. Trial KO clears that array mid-update; stale indices must
// not throw and freeze the animation loop.
{
  const guardian = G.makeEnemy("royalFool", 80, 0);
  guardian.bossEngaged = true;
  guardian.bossIntroT = 0;
  guardian.hp = Math.floor(guardian.def.hp * guardian.def.boss.phaseThresholds[0]);
  G.state = {
    formId: "nobody",
    mapId: "jesterTrial",
    mapDef: { bossTrial: { exit: { map: "overworld", x: 118, y: 60 }, delay: 1.5 } },
    player: G.makePlayer(), enemies: [guardian], projectiles: [],
    pickups: [], items: [], entryPoint: { x: 0, y: 0 },
    hitStop: 0, shake: 0, cameraKickX: 0, cameraKickY: 0, time: 1,
  };
  G.updateEnemies(0.016);
  assert.equal(guardian.bossPhase, 2);
  guardian.bossRecoverT = 0;
  guardian.shootT = 0;
  G.updateEnemies(0.016);
  assert.equal(G.state.projectiles.length, 3, "Jester Phase II should create its three-card fan");
  for (const shot of G.state.projectiles) {
    shot.x = 0; shot.y = -5; shot.vx = 0; shot.vy = 0; shot.armT = 0;
  }
  G.state.player.damageTaken = 2;
  assert.doesNotThrow(() => G.combat.updateProjectiles(0.016), "a trial KO during a projectile fan must not freeze the game loop");
  assert.ok(G.state.knockout, "the defeat eject sequence should still begin");
  assert.equal(G.state.projectiles.length, 0, "all sibling shots should clear on defeat");
}

{
  const monarch = G.makeEnemy("moleMonarch", 70, 0);
  G.state = {
    player: { x: 0, y: 0, dir: { x: 1, y: 0 }, invuln: 0 },
    enemies: [monarch], projectiles: [], pickups: [], items: [],
    hitStop: 0, shake: 0, cameraKickX: 0, cameraKickY: 0,
  };
  let spoken = "";
  G.ui.banner = (title, sub) => { spoken = sub || title; };
  G.input = { tapped: () => false, clearTaps() {} };
  G.updateEnemies(0.016);
  assert.equal(G.state.bossCutscene.lines.length, 3);
  G.updateBossCutscene(G.BOSS_CUTSCENE_LINE_SECONDS + 0.01);
  assert.match(spoken, /respect the technique/i, "boss cutscene should advance through personality lines");
  G.state.bossCutscene = null;
}

G.maps = {};
context.registerMap = (map) => { G.maps[map.id] = map; };
run("js/data/maps.js");
assert.ok(G.maps.riftbladeTrial);
assert.ok(G.maps.riftbladeTrial.tiles.every((row) => row.length === 28), "Riftblade arena rows must stay aligned");
for (const id of ["moleTrial", "vampireTrial", "jesterTrial", "godTrial"])
  assert.ok(G.maps[id].tiles.length === 17 && G.maps[id].tiles.every((row) => row.length === 28), `${id} must stay aligned`);
for (const id of ["riftbladeTrial", "moleTrial", "vampireTrial", "jesterTrial", "godTrial"])
  assert.ok(G.maps[id].bossTrial && G.maps[id].bossTrial.exit.map === "overworld", `${id} needs a safe retry exit`);
for (const portal of ["R", "L", "U", "F", "Y"]) {
  assert.equal(G.maps.overworld.legend[portal].portalStyle, "trial");
  assert.ok(G.maps.overworld.legend[portal].portalTheme, `${portal} needs a recognizable landmark theme`);
}
assert.equal(G.maps.overworld.legend.Y.mastery.before, "god");
assert.equal(G.maps.overworld.legend.Y.mastery.level, 5, "the final trial must require full prior mastery");
{
  const map = G.maps.overworld;
  const solidChars = new Set(["t", "w", "r", "#"]);
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
  for (const portal of ["L", "U", "F", "Y"]) {
    let found = false;
    map.tiles.forEach((row, y) => {
      const x = row.indexOf(portal);
      if (x >= 0 && seen.has(`${x},${y}`)) found = true;
    });
    assert.equal(found, true, `${portal} trial entrance must be reachable from Greenfield`);
  }
}
assert.ok(G.maps.sunkenMarsh.tiles.every((row) => row.length === 30), "Marsh rows must stay aligned");

// Every walkable marsh tile must connect to the arrival point. This catches
// accidental tree/water rings and narrow roadblocks as the layout evolves.
{
  const map = G.maps.sunkenMarsh;
  const solidChars = new Set(["t", "w", "r", "#"]);
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
  assert.equal(seen.size, walkable, "Every open part of Sunken Marsh should be reachable");
  assert.ok(map.playerStart.x >= 4, "Marsh arrival needs breathing room from its exit");
}

assert.ok(G.enemies.riftbladeAdept.speed >= 55, "Riftblade Adept must be able to pressure ranged forms");
assert.ok(G.enemies.riftbladeAdept.boss.antiKiteRange, "Riftblade Adept needs explicit anti-kite movement");

// Bosses introduce themselves, change phase, and use telegraphed movement.
let bossBanner = "";
G.ui.banner = (title) => { bossBanner = title; };
G.enemies.testBoss = {
  id: "testBoss", name: "Test Titan", hp: 10, speed: 30, damage: 2,
  behavior: "chase", aggro: 120, size: 16, heavy: true, miniboss: true,
  trophy: "test-trophy", ward: { types: ["blunt"], hp: 2 },
  boss: {
    style: "charger", intro: "IT HAS AWAKENED", color: "#ffcd75",
    specialEvery: 0.2, telegraph: 0.05, chargeSpeed: 100, chargeDur: 0.1,
  },
};
{
  const titan = G.makeEnemy("testBoss", 20, 0);
  G.state = {
    player: { x: 0, y: 0, dir: { x: 1, y: 0 }, invuln: 0 },
    enemies: [titan], projectiles: [], pickups: [], items: [],
    hitStop: 0, shake: 0, cameraKickX: 0, cameraKickY: 0,
  };
  G.damagePlayer = () => {};
  G.updateEnemies(0.016);
  assert.equal(titan.bossEngaged, true);
  assert.match(bossBanner, /TEST TITAN/);
  assert.ok(titan.bossIntroT > 0);

  titan.bossIntroT = 0;
  titan.hp = 5;
  G.updateEnemies(0.016);
  assert.equal(titan.bossPhase, 2);

  titan.bossRecoverT = 0;
  titan.bossSpecialT = 0;
  G.updateEnemies(0.016);
  assert.ok(titan.bossTelegraphT > 0, "charge must be telegraphed");
  assert.ok(G.fx.some((fx) => fx.kind === "tell"), "charge direction must be visible");
  titan.bossTelegraphT = 0.001;
  G.updateEnemies(0.016);
  const beforeChargeX = titan.x;
  G.updateEnemies(0.02);
  assert.notEqual(titan.x, beforeChargeX, "boss charge should move it decisively");
}

{
  const monarch = G.makeEnemy("moleMonarch", 45, 0);
  monarch.bossEngaged = true;
  monarch.bossIntroT = 0;
  monarch.bossPhase = 2;
  monarch.hp = 18;
  G.state = {
    player: { x: 0, y: 0, dir: { x: 1, y: 0 }, invuln: 0 },
    enemies: [monarch], projectiles: [], pickups: [], items: [],
    hitStop: 0, shake: 0, cameraKickX: 0, cameraKickY: 0,
  };
  G.updateEnemies(0.016);
  assert.equal(monarch.bossPhase, 3, "form bosses need a distinct final phase");
  assert.match(bossBanner, /PHASE III/);
}

G.enemies.testCaster = {
  id: "testCaster", name: "Test Caster", hp: 10, speed: 30, damage: 2,
  behavior: "shooter", aggro: 140, shootEvery: 1, shotColor: "#8153c1",
  size: 16, heavy: true, miniboss: true, trophy: "caster-trophy",
  boss: { style: "caster", intro: "RISE", color: "#8153c1", specialEvery: 3 },
};
{
  const caster = G.makeEnemy("testCaster", 75, 0);
  caster.bossEngaged = true;
  caster.bossPhase = 2;
  caster.shootT = 0;
  G.state = {
    player: { x: 0, y: 0, dir: { x: 1, y: 0 }, invuln: 0 },
    enemies: [caster], projectiles: [], pickups: [], items: [],
    hitStop: 0, shake: 0, cameraKickX: 0, cameraKickY: 0,
  };
  G.updateEnemies(0.016);
  assert.equal(G.state.projectiles.length, 3, "phase-two caster should fire a readable fan");
  assert.ok(G.state.projectiles.every((shot) => shot.damage === 1), "fan must not spike damage");
}

{
  const adept = G.makeEnemy("riftbladeAdept", 72, 0);
  adept.bossEngaged = true;
  adept.bossIntroT = 0;
  adept.bossSpecialT = 0;
  adept.bossPattern = 1; // the alternating Returning Star pattern
  G.state = {
    player: { x: 0, y: 0, dir: { x: 1, y: 0 }, invuln: 0 },
    enemies: [adept], projectiles: [], pickups: [], items: [],
    hitStop: 0, shake: 0, cameraKickX: 0, cameraKickY: 0,
  };
  G.updateEnemies(0.016);
  assert.equal(adept.bossPendingAction, "blades");
  adept.bossTelegraphT = 0.001;
  G.updateEnemies(0.016);
  assert.equal(G.state.projectiles.length, 2);
  assert.ok(G.state.projectiles.every((shot) => shot.boomerang && shot.damage === 1));
}


for (const [id, patternIndex, action, projectileCount] of [
  ["royalFool", 0, "cards", 3],
  ["admiralTortoise", 0, "shells", 8],
  ["paperRonin", 1, "crescent", 5],
  ["professorPerihelion", 0, "stars", 6],
  ["grandmotherBriar", 0, "seeds", 3],
  ["godAvatar", 7, "nova", 12],
]) {
  const boss = G.makeEnemy(id, 80, 0);
  boss.bossEngaged = true;
  boss.bossIntroT = 0;
  boss.bossSpecialT = 0;
  boss.bossPattern = patternIndex;
  G.state = {
    player: { x: 0, y: 0, dir: { x: 1, y: 0 }, invuln: 0 },
    enemies: [boss], projectiles: [], pickups: [], items: [],
    hitStop: 0, shake: 0, cameraKickX: 0, cameraKickY: 0,
  };
  G.updateEnemies(0.016);
  assert.equal(boss.bossPendingAction, action);
  boss.bossTelegraphT = 0.001;
  G.updateEnemies(0.016);
  assert.equal(G.state.projectiles.length, projectileCount, `${id} should fire its readable ${action} pattern`);
  assert.ok(G.state.projectiles.every((shot) => shot.damage <= 1 || action === "pie"));
}

let fired = 0;
G.forms = { nobody: { speed: 80, hearts: 3 } };
G.state = {
  formId: "nobody", player: G.makePlayer(), enemies: [], projectiles: [],
  pickups: [], entryPoint: { x: 0, y: 0 },
};
G.state.player.cooldowns.slap = 0.05;
G.abilities.slap.use = () => { fired++; };
G.getLoadout = () => ["slap"];
let tapped = true;
G.input = {
  vec: { x: 0, y: 0 }, isTouch: false,
  tapped(button) { if (button === "a" && tapped) { tapped = false; return true; } return false; },
  takeAim: () => null,
};
G.updatePlayer(0.016);
G.updatePlayer(0.02);
G.updatePlayer(0.02);
assert.equal(fired, 1, "buffered attack should fire when cooldown ends");

// Passive recovery reaches the true maximum quickly; successful hits remain
// an accelerator rather than a requirement for using the largest abilities.
G.getLoadout = () => [];
G.state.player.mana = 0;
G.state.player.manaRegenDelay = 0;
G.state.player.manaRegenProgress = 0;
G.updatePlayer(0.69);
assert.equal(G.state.player.mana, 0);
G.updatePlayer(0.01);
assert.equal(G.state.player.mana, 1, "one mana should recover every 0.7 seconds");
G.updatePlayer(6.31);
assert.equal(G.state.player.mana, 10, "passive recovery must reach the true maximum");
G.updatePlayer(1.4);
assert.equal(G.state.player.mana, 10, "passive recovery must respect manaMax");

const reserveTarget = enemy(10, 0);
G.state.enemies = [reserveTarget];
G.state.player.mana = 6;
G.state.hitStop = 0;
G.state.shake = 0;
G.state.cameraKickX = 0;
G.state.cameraKickY = 0;
G.combat.damageEnemy(reserveTarget, { damage: 1, type: "blunt", ability: "slap" });
assert.equal(G.state.player.mana, 7, "successful hits must still accelerate recovery");

let castTapped = true;
G.state.enemies = [];
G.state.player.mana = 10;
G.state.player.cooldowns.meteor = 0;
G.getLoadout = () => ["meteor"];
G.input = {
  vec: { x: 0, y: 0 }, isTouch: false,
  tapped(button) { if (button === "a" && castTapped) { castTapped = false; return true; } return false; },
  takeAim: () => null,
};
G.updatePlayer(0.016);
assert.equal(G.state.player.mana, 3);
assert.equal(G.state.player.manaRegenDelay, G.MANA_CAST_DELAY, "mana-spending casts should briefly delay recovery");

console.log("combat-feel tests passed");
