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
assert.ok(index.includes("style.css?v=20260818d") && index.includes("save.js?v=20260818d"),
  "published clients must receive the new title screen instead of cached files");
assert.match(css, /grid-template-rows:\s*repeat\(4,auto\)/,
  "portrait cards should grow four independent text rows without overlapping the next chapter");
assert.match(css, /min-height:\s*154px/,
  "portrait chapter cards should reserve room for wrapped act names and save statistics");
const panorama = path.join(root, "assets/title-world-panorama.webp");
assert.ok(fs.existsSync(panorama) && fs.statSync(panorama).size > 100000,
  "the title screen should ship its detailed production panorama");
assert.match(css, /title-world-panorama\.webp/,
  "the visible title world should use the approved pixel-art panorama");
assert.doesNotMatch(css, /\.living-prophecy\s*\{[^}]*clip-path/,
  "the panorama container must not clip every landmark into a jagged strip");
assert.match(save, /visualViewport/, "iPhone rotation should follow the live visual viewport");
assert.ok(save.includes("title-portrait") && save.includes("title-short-landscape"),
  "rotation should select a complete title composition without waiting on Safari media queries");

console.log("title screen tests passed");
