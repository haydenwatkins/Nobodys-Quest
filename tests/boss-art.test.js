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
G.ui = { toast() {}, banner() {} };
G.saveGame = () => {};
G.makeTown = () => ({});
run("js/engine/forms.js");
run("js/abilities/basics.js");
for (const name of ["nobody", "rat", "knight", "ranger", "wizard", "frog", "alchemist", "stormcaller", "dragon", "riftblade", "mole", "vampire", "jester", "turtle", "samurai", "astronomer", "druid", "griffin", "golem", "weaver", "bellkeeper", "lantern-wisp", "colossus", "god"])
  run(`js/forms/${name}.js`);
run("js/data/form-art-hd.js");
context.registerEnemy = (definition) => { G.enemies[definition.id] = definition; };
run("js/data/enemies.js");
run("js/data/boss-art-hd.js");

const bosses = Object.values(G.enemies).filter((enemy) => enemy.miniboss);
assert.equal(bosses.length, 18, "the complete boss collection should be covered");
assert.equal(G.authoredBossArtIds.length, bosses.length);
for (const enemy of bosses) {
  const base = enemy.sprite, sprite = base.hd;
  assert.ok(base.rebuilt && sprite && sprite.authored, `${enemy.name} needs authored boss art`);
  assert.equal(sprite.density, 2, `${enemy.name} should share the roster's pixel density`);
  assert.equal(sprite.frames.length, 4, `${enemy.name} needs a complete four-pose animation`);
  assert.ok(Object.keys(sprite.palette).length >= 9, `${enemy.name} needs a boss-grade palette`);
  assert.deepEqual(Array.from(sprite.animations.attack), [2], `${enemy.name} needs a deliberate action pose`);
  const width = sprite.frames[0][0].length, height = sprite.frames[0].length;
  assert.ok(width >= 48 && height >= 38, `${enemy.name}'s source silhouette is too constrained`);
  for (const frame of sprite.frames) {
    assert.equal(frame.length, height);
    for (const row of frame) {
      assert.equal(row.length, width);
      for (const pixel of row) assert.ok(pixel === "." || pixel === " " || sprite.palette[pixel], `${enemy.name} uses unknown art key '${pixel}'`);
    }
  }
}

for (const [bossId, formId] of [["skySovereign", "griffin"], ["oldMason", "golem"], ["silkMatriarch", "weaver"], ["bellTitan", "bellkeeper"], ["lanternKeeper", "lanternWisp"], ["lastWorldbearer", "colossus"]])
  assert.notEqual(G.enemies[bossId].sprite, G.forms[formId].sprite, `${bossId} must not be an enlarged player form`);

console.log("boss art tests passed");
