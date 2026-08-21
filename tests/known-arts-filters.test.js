"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ console, Math });
vm.runInContext(fs.readFileSync(path.join(root, "js/engine/core.js"), "utf8") + ";this.G=G;", context);
vm.runInContext(fs.readFileSync(path.join(root, "js/engine/forms.js"), "utf8"), context);

const G = context.G;
const arts = [
  { id: "sunArrow", type: "light", style: "projectile" },
  { id: "moonRush", type: "dark", style: "dash" },
  { id: "shieldBurst", type: "blunt", style: "area" },
];
const matches = (damage, style) => arts.filter((ability) => G.knownArtMatchesFilters(ability, damage, style)).map((ability) => ability.id);

assert.deepEqual(Array.from(matches("all", "all")), ["sunArrow", "moonRush", "shieldBurst"]);
assert.deepEqual(Array.from(matches("light", "all")), ["sunArrow"], "damage can filter independently");
assert.deepEqual(Array.from(matches("all", "dash")), ["moonRush"], "attack style can filter independently");
assert.deepEqual(Array.from(matches("light", "projectile")), ["sunArrow"], "both axes combine with AND logic");
assert.deepEqual(Array.from(matches("light", "dash")), [], "a valid empty combination must remain empty");

const ui = fs.readFileSync(path.join(root, "js/engine/ui.js"), "utf8");
for (const control of ["data-ability-damage", "data-ability-style", "data-ability-boosted", "Damage", "Attack", "Dash", "Chain"])
  assert.ok(ui.includes(control), `Known Arts should expose ${control}`);
assert.equal(ui.includes("data-ability-filter="), false, "the old single-axis filter must not return");

console.log("known arts dual-filter tests passed");
