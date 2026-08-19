"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = (file) => fs.readFileSync(path.join(root, file), "utf8");
const save = source("js/engine/save.js");
const css = source("css/style.css");
const index = source("index.html");

for (const feature of ["title-world-screen", "title-world-hero", "title-lockup", "title-transform-stage", "title-nobody", "title-form-echo", "title-chapter-panel", "slot-chapter-art"])
  assert.ok(save.includes(feature) && css.includes(feature), `${feature} should have real structure and presentation`);
for (const control of ["data-title-settings", "data-title-music", "data-title-sound", "data-title-detail", "data-title-boss-assistance", "data-title-easy-mode", "data-title-fullscreen"])
  assert.ok(save.includes(control), `the title screen should expose ${control}`);
assert.ok(save.includes("G.drawSprite") && save.includes("data-title-form"),
  "Nobody, transformation echoes, and chapter art should render the game's real form sprites");
assert.match(css, /prefers-reduced-motion:\s*reduce/, "title animation should honor reduced-motion preferences");
assert.match(css, /orientation:\s*portrait/, "the storybook needs a dedicated portrait composition");
assert.match(css, /orientation:\s*landscape[^}]*max-height:\s*430px/, "short landscape devices need a compact composition");
assert.ok(index.includes("style.css?v=20260819g") && index.includes("save.js?v=20260819e"),
  "published clients must receive the new title screen instead of cached files");
assert.match(css, /grid-template-rows:\s*repeat\(4,auto\)/,
  "portrait cards should grow four independent text rows without overlapping the next chapter");
assert.match(css, /min-height:\s*154px/,
  "portrait chapter cards should reserve room for wrapped act names and save statistics");
for (const asset of ["title-world-landscape-v2.webp", "title-world-portrait-v2.webp"]) {
  const file = path.join(root, "assets", asset);
  assert.ok(fs.existsSync(file) && fs.statSync(file).size > 100000,
    `${asset} should be a production-quality pixel-art world plate`);
  assert.ok(css.includes(asset), `${asset} should be used by the responsive title composition`);
}
assert.match(save, /titleTransformationForms/, "the title should select real forms for Nobody's transformation");
assert.match(css, /@keyframes\s+title-form-rise/, "form changing should animate out of Nobody");
assert.match(css, /title-world-portrait-v2\.webp/, "portrait should use its own art-directed world plate");
assert.match(css, /title-portrait \.title-world-hero\s*\{[^}]*min-height:\s*460px/,
  "portrait should keep the world and chapters in a balanced single-screen proportion");
assert.match(css, /title-short-landscape \.title-world-hero\s*\{[^}]*min-height:\s*230px/,
  "short landscape should reserve most of its height for the title world");
assert.match(css, /title-short-landscape \.save-slot-card\s*\{[^}]*min-height:\s*100px/,
  "short landscape chapters should stay compact enough to avoid crushing the hero scene");
assert.doesNotMatch(save + css, /stained-window|living-prophecy|title-archive|title-world-panorama\.webp/,
  "the failed multi-layered title composition should be fully removed");
assert.match(save, /visualViewport/, "iPhone rotation should follow the live visual viewport");
assert.ok(save.includes("title-portrait") && save.includes("title-landscape") && save.includes("title-short-landscape"),
  "rotation should select a complete title composition without waiting on Safari media queries");

console.log("title screen tests passed");
