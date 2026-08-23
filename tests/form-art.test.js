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

assert.equal(G.formOrder.length, 24);
for (const id of G.formOrder) {
  const base = G.forms[id].sprite;
  const sprite = base.hd;
  assert.ok(base.rebuilt, `${id} needs a redesigned base-resolution silhouette too`);
  assert.equal(base.frames.length, sprite.frames.length, `${id}'s complete animation set should survive original resolution`);
  assert.ok(sprite && sprite.authored, `${id} needs authored dense art`);
  assert.equal(sprite.density, 2, `${id} should use half-pixel world detail`);
  assert.ok(sprite.frames.length >= 4, `${id} needs idle, stride, action, and alternate stride poses`);
  assert.ok(Object.keys(sprite.palette).length >= 8, `${id} needs a richer character palette`);
  assert.deepEqual(Array.from(sprite.animations.attack), [2], `${id}'s action silhouette should be deliberate`);
  const width = sprite.frames[0][0].length, height = sprite.frames[0].length;
  assert.ok(width >= 30 && height >= 24, `${id}'s source art should no longer be trapped in the old tiny grid`);
  for (const frame of sprite.frames) {
    assert.equal(frame.length, height, `${id}'s animation frames must share a height`);
    for (const row of frame) {
      assert.equal(row.length, width, `${id}'s animation frames must share a width`);
      for (const pixel of row) assert.ok(pixel === "." || pixel === " " || sprite.palette[pixel], `${id} uses unknown art key '${pixel}'`);
    }
  }
}

const dragon = G.forms.dragon.sprite.hd.frames[0];
const occupiedDragonRows = dragon.filter((row) => /[^. ]/.test(row)).length;
assert.ok(G.forms.dragon.sprite.hd.frames[0][0].length / 2 >= 20 && occupiedDragonRows / 2 <= 17,
  "Dragon should read as a long creature rather than a face squeezed into a humanoid tile");

G.state = { costumeId: "trailblazer", costumesUnlocked: ["classic", "trailblazer"], skinsUnlocked: [], skinByForm: {} };
run("js/engine/costumes.js");
for (const id of G.formOrder) {
  const dyed = G.costumedSprite(G.forms[id].sprite);
  assert.ok(dyed.hd && dyed.hd.authored && dyed.hd.frames.length === 4,
    `${id}'s dense art must survive global dyes`);
  const skin = G.skinForForm(id), signature = G.signatureSprite(G.forms[id].sprite, skin);
  assert.ok(signature.hd && signature.hd.authored && signature.hd.frames.length === 4,
    `${skin.name} must be built on the authored form rather than the old enlargement`);
}

console.log("form art tests passed");
