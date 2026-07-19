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

run("js/engine/core.js", ";this.G = G;");
const G = context.G;
G.sfx = { play() {}, attack() {}, impact() {} };
G.ui = { toast() {}, banner() {}, update() {} };
G.saveGame = () => {};
G.checkUnlocks = () => {};
G.input = { vec: { x: 0, y: 0 }, tapped: () => false, takeAim: () => null };
G.world = {
  solid: () => false,
  moveBox(entity, dx, dy) { entity.x += dx; entity.y += dy; },
  checkTriggers() {},
};
run("js/engine/combat.js");
run("js/engine/entities.js");
run("js/engine/forms.js");
run("js/abilities/basics.js");
const formIds = ["nobody", "rat", "knight", "ranger", "wizard", "frog", "alchemist", "stormcaller",
  "dragon", "riftblade", "mole", "vampire", "jester", "turtle", "samurai", "astronomer", "druid", "god"];
for (const id of formIds) run(`js/forms/${id}.js`);
run("js/engine/passives.js");
G.validateCrossRefs();

assert.equal(G.workshopErrors.length, 0, "the complete passive roster must satisfy the Form Workshop");
assert.equal(new Set(formIds.map((id) => G.forms[id].passive.id)).size, formIds.length,
  "every form needs an exclusive passive identity");
assert.equal(new Set(formIds.map((id) => G.forms[id].passive.name)).size, formIds.length,
  "every passive needs an exclusive player-facing name");
for (const ability of Object.values(G.abilities)) {
  assert.ok(G.passives.STYLE_INFO[ability.style], `${ability.id} needs a recognized combat style`);
  assert.ok(ability.nativeForm && G.forms[ability.nativeForm], `${ability.id} needs a native form for mixing rules`);
}

function enemy(x, y) {
  return {
    id: `dummy-${x}-${y}`, x, y, hp: 8, dead: false, flash: 0,
    def: { hp: 8, size: 10, heavy: false }, ward: null, status: null,
    kbx: 0, kby: 0, hitKickX: 0, hitKickY: 0,
    h() { return 10; },
  };
}

function useForm(formId, enemies = []) {
  G.state = {
    formId, player: G.makePlayer(), enemies, projectiles: [], pickups: [], items: [],
    loadouts: {}, claimedForms: formIds.filter((id) => id !== "nobody"), known: formIds.slice(),
    stars: 99, time: 10, hitStop: 0, shake: 0, cameraKickX: 0, cameraKickY: 0,
    mapId: "test", passiveEchoes: [], entryPoint: { x: 0, y: 0 },
  };
  G.state.player.x = 0;
  G.state.player.y = 0;
  G.state.player.dir = { x: 1, y: 0 };
  return G.state.player;
}

// Mixing changes handling rather than damage.
let p = useForm("nobody");
let mixed = G.passives.prepare("projectile", p, { ability: "arrow", speed: 100, size: 3, damage: 2 });
assert.equal(mixed.damage, 2);
assert.ok(mixed.speed > 100 && mixed.size > 3, "Nobody should adapt a borrowed projectile");
const native = G.passives.prepare("melee", p, { ability: "slap", range: 20, damage: 1 });
assert.equal(native.range, 20, "Improviser must only transform borrowed abilities");

// Nobody adds half a pixel to borrowed shots. Shadow Bolt used to derive a
// fractional trail length from that size and freeze the main loop on iOS when
// JavaScript rejected it as an Array.length.
G.abilities.shadowBolt.use(p);
const improvisedShadowBolt = G.state.projectiles[0];
assert.ok(Number.isInteger(improvisedShadowBolt.trailLength),
  "improvised Shadow Bolt needs an integer trail length");
assert.doesNotThrow(() => {
  for (let i = 0; i < 12; i++) G.combat.updateProjectiles(0.016);
}, "Nobody firing Shadow Bolt must not freeze the update loop");

p = useForm("ranger");
mixed = G.passives.prepare("projectile", p, { ability: "arrow", speed: 100, range: 100, size: 3, damage: 1 });
assert.deepEqual([mixed.speed, mixed.range, mixed.size, mixed.damage], [122, 108, 4, 1]);

p = useForm("knight");
mixed = G.passives.prepare("melee", p, { ability: "slash", range: 20, damage: 1 });
assert.ok(p.meleeGuard >= 0.28 && mixed.passiveGuard, "Knight should be protected during borrowed melee commitment");

p = useForm("wizard");
mixed = G.passives.prepare("projectile", p, {
  ability: "curse", speed: 100, status: { name: "poison", dur: 2, dps: 1 }, damage: 1,
});
assert.equal(mixed.status.dur, 2.9, "Wizard should extend status abilities without changing damage");

p = useForm("frog");
mixed = G.passives.prepare("melee", p, { ability: "slash", range: 20, knockback: 100, damage: 2 });
assert.ok(mixed.range > 24 && mixed.passivePull > 0 && mixed.knockback === 0);
assert.equal(mixed.damage, 2);

p = useForm("alchemist");
mixed = G.passives.prepare("projectile", p, { ability: "meteor", range: 100, explodeRadius: 30, damage: 3 });
assert.ok(mixed.range > 110 && mixed.explodeRadius > 36, "Alchemist should broaden borrowed area attacks");

p = useForm("dragon");
mixed = G.passives.prepare("melee", p, { ability: "slash", range: 20, arcDeg: 100, knockback: 100, damage: 2 });
assert.deepEqual([mixed.arcDeg, mixed.knockback, mixed.damage], [130, 125, 2]);

p = useForm("jester");
mixed = G.passives.prepare("projectile", p, { ability: "arrow", ricochets: 0, damage: 1 });
assert.equal(mixed.ricochets, 1, "Jester should teach any projectile one extra trick bounce");
assert.equal(mixed.damage, 1);

p = useForm("rat");
G.passives.onAbilityUse(p, "meteor");
assert.ok(G.passives.movementScale(p) > 1, "any swapped ability should trigger Rat's Scurry");

G.forms.workshopExample = {
  id: "workshopExample",
  passive: { id: "farCasting", name: "Far Casting", description: "Test",
    effects: { projectile: { speedScale: 1.12, rangeScale: 1.1 } } },
};
p = useForm("workshopExample");
mixed = G.passives.prepare("projectile", p, { ability: "arrow", speed: 100, range: 100, damage: 1 });
assert.ok(Math.abs(mixed.speed - 112) < 0.001,
  "future forms should get safe declarative passive effects without engine edits");
assert.ok(Math.abs(mixed.range - 110) < 0.001);
delete G.forms.workshopExample;

p = useForm("samurai");
p.moving = true;
mixed = G.passives.prepare("melee", p, { ability: "slash", range: 20, damage: 2 });
assert.equal(mixed.passiveSlide, 7, "Samurai should carry moving melee through the target");
assert.equal(mixed.damage, 2);

p = useForm("astronomer");
mixed = G.passives.prepare("area", p, { ability: "gravityWell", range: 30, damage: 2 });
assert.equal(mixed.pull, 12, "Astronomer should pull with borrowed area bursts");

// A dash is safe for its calculated full travel time, even if its old fixed
// 0.3-second invulnerability would have expired.
p = useForm("nobody");
G.combat.dash(p, { ability: "cartwheel", dist: 120, speed: 120, damage: 1, type: "blunt" });
assert.ok(p.invuln > 1, "dash safety must be based on travel duration");
p.invuln = 0;
G.damagePlayer(2, 10, 0);
assert.equal(p.damageTaken, 0, "the dashing state itself must reject all hostile damage");

// Defensive passives are readable, forgiving, and never involve mana.
p = useForm("turtle");
G.damagePlayer(1, -10, 0);
assert.equal(p.damageTaken, 0, "Shellback should block a one-damage hit from behind");
G.damagePlayer(1, 10, 0);
assert.equal(p.damageTaken, 1, "Shellback should not block a frontal hit");

p = useForm("vampire");
G.healPlayer(1, "heart-pickup");
assert.equal(p.passiveBarrier, 1, "overhealing should become Bloodskin");
G.damagePlayer(1, 10, 0);
assert.equal(p.damageTaken, 0, "Bloodskin should absorb hostile damage");
assert.equal(p.passiveBarrier, 0);

// Status and area passives alter follow-up possibilities, not raw damage.
const fallen = enemy(10, 0);
const survivor = enemy(35, 0);
fallen.dead = true;
fallen.status = { poison: { dur: 3, dps: 1, tick: 0 } };
p = useForm("druid", [fallen, survivor]);
G.passives.onKill(fallen);
assert.ok(survivor.status && survivor.status.poison, "Druid should spread a living status on defeat");

const tremorTarget = enemy(12, 0);
p = useForm("mole", [tremorTarget]);
G.passives.onAbilityUse(p, "gravityWell");
assert.equal(tremorTarget.kbx, 0);
G.passives.update(0.25);
assert.notEqual(tremorTarget.kbx, 0, "Mole's delayed aftershock should visibly move nearby enemies");
assert.ok(tremorTarget.status && tremorTarget.status.stun, "Aftershock should briefly interrupt ordinary enemies");

const riftTarget = enemy(12, 0);
p = useForm("riftblade", [riftTarget]);
G.passives.onDashFinish(p, {});
assert.notEqual(riftTarget.kbx, 0, "Riftblade should leave a crowd-shoving afterimage after any dash");
assert.equal(riftTarget.hp, 8, "Afterimage is control, not free damage");

const struck = enemy(10, 0);
const conducted = enemy(30, 0);
p = useForm("stormcaller", [struck, conducted]);
G.passives.onHit(struck, { ability: "slap", damage: 1 });
assert.notEqual(conducted.kbx, 0, "Stormcaller should conduct any successful hit into nearby crowd control");
assert.equal(conducted.hp, 8);

const finalBoss = enemy(40, 0);
finalBoss.def.miniboss = true;
finalBoss.bossPhase = 2;
p = useForm("god", [finalBoss]);
p.damageTaken = G.playerMaxHearts() - 1;
G.damagePlayer(2, finalBoss.x, finalBoss.y);
assert.equal(G.playerHp(), 1, "Providence should prevent one lethal hit per boss phase");
assert.match(p.providenceKey, /:2$/);

console.log("passive identity tests passed");

