"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = (file) => fs.readFileSync(path.join(root, file), "utf8");
const save = source("js/engine/save.js");
const css = source("css/style.css");
const index = source("index.html");

for (const feature of ["stained-window", "prophecy-form", "prophecy-hero", "title-lockup", "living-prophecy", "prophecy-book", "slot-chapter-art"])
  assert.ok(save.includes(feature) && css.includes(feature), `${feature} should have real structure and presentation`);
for (const control of ["data-title-settings", "data-title-music", "data-title-sound", "data-title-detail", "data-title-fullscreen"])
  assert.ok(save.includes(control), `the title screen should expose ${control}`);
assert.ok(save.includes("G.drawSprite") && save.includes("data-title-form"),
  "stained glass and chapter art should render the game's real form sprites");
assert.match(css, /prefers-reduced-motion:\s*reduce/, "title animation should honor reduced-motion preferences");
assert.match(css, /orientation:\s*portrait/, "the storybook needs a dedicated portrait composition");
assert.match(css, /orientation:\s*landscape[^}]*max-height:\s*430px/, "short landscape devices need a compact composition");
assert.ok(index.includes("style.css?v=20260818a") && index.includes("save.js?v=20260818a"),
  "published clients must receive the new title screen instead of cached files");

console.log("title screen tests passed");
