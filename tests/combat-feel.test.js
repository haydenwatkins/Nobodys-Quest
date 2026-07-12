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
};
for (const [id, values] of Object.entries(expectedBasics)) {
  assert.deepEqual([G.abilities[id].mana, G.abilities[id].cooldown], values, `${id} balance changed`);
}
assert.equal(Object.keys(G.abilities).length, 29);
for (const ability of Object.values(G.abilities)) {
  freshState();
  G.state.player.invuln = 0;
  assert.doesNotThrow(() => ability.use(G.state.player), `${ability.id} should execute`);
}

// Verify a tap shortly before cooldown completion is not lost.
run("js/engine/entities.js");
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

console.log("combat-feel tests passed");
