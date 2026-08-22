"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = (file) => fs.readFileSync(path.join(root, file), "utf8");
const context = vm.createContext({ console, Math, Date, Map, Set });
const run = (file, suffix = "") => vm.runInContext(source(file) + suffix, context, { filename: file });

run("js/engine/core.js", ";this.G = G;");
const G = context.G;
const toasts = [];
let saves = 0;
G.state = { player: { x: 0, y: 0 } };
G.input = { hasGamepad: false, isTouch: false };
G.ui = { toast(text) { toasts.push(text); }, banner() {} };
G.sfx = { play() {} };
G.saveGame = () => { saves++; };
run("js/engine/tutorial.js");

G.tutorial.init({ tutorialDone: false, tutorialStep: 0, tutorialSeen: true, tutorialHints: [] });
assert.equal(G.tutorial.hint("mana", "Mana lesson"), true);
assert.equal(G.tutorial.hint("mana", "Mana lesson"), false);
assert.deepEqual(toasts, ["Mana lesson"], "each onboarding topic should appear only once");
assert.ok(saves > 0, "shown coaching should persist so a reload cannot repeat it");

G.tutorial.init({ tutorialDone: true, tutorialStep: 4, tutorialSeen: true, tutorialHints: [] });
assert.equal(G.tutorial.hint("ward", "Ward lesson"), false);
assert.equal(toasts.length, 1, "completed tutorials should never emit routine combat coaching");

const combat = source("js/engine/combat.js");
const entities = source("js/engine/entities.js");
const ui = source("js/engine/ui.js");
assert.ok(!combat.includes('G.ui.toast("💥 Ward broken!') && !entities.includes('G.ui.toast("💧 Mana is recharging'),
  "obvious combat states should rely on their existing effects and meters after onboarding");
assert.match(ui, /function drawWardHint\(c, cam\) \{\s*if \(!G\.tutorial \|\| !G\.tutorial\.coaching\("ward"\)\) return;/,
  "the persistent ward callout should exist only during the ward lesson");

console.log("notification policy tests passed");
