"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const playerFacingFiles = [
  "js/data/maps.js",
  "js/data/npcs.js",
  "js/engine/endgame.js",
  "js/engine/expeditions.js",
  "js/engine/legends.js",
  "js/engine/save.js",
  "js/engine/story.js",
  "js/engine/ui.js",
];
const source = playerFacingFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n").toLowerCase();
const designNotes = [
  "not raw damage",
  "without raising the level cap",
  "invalidating early battles",
  "shared ability tray",
  "cosmetic only · stats unchanged",
  "roguelite-inspired adventure",
  "campaign is safe",
  "run-only power",
  "original boss rules",
  "normal healing",
  "quest marker",
  "large health bar",
  "final phase",
  "requesting a sequel",
  "js/engine/forms.js",
];

for (const phrase of designNotes)
  assert.equal(source.includes(phrase), false, `player-facing copy must not expose design-note language: ${phrase}`);

console.log("copy tone tests passed");
