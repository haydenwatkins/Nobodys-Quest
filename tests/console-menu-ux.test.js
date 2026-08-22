"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const ui = fs.readFileSync(path.join(root, "js/engine/ui.js"), "utf8");
const css = fs.readFileSync(path.join(root, "css/style.css"), "utf8");
const menuController = fs.readFileSync(path.join(root, "js/engine/menu-controller.js"), "utf8");

assert.match(css, /#menu\s*\{[\s\S]*?grid-template-rows:\s*auto minmax\(0,\s*1fr\) auto;[\s\S]*?overflow:\s*hidden;/,
  "the pause interface should be a fixed console shell instead of one long web page");
assert.match(css, /\.menu-body\s*\{[^}]*overflow-y:\s*auto/s,
  "only the active screen should scroll inside the fixed shell");
assert.ok(ui.includes('let formRosterView = "roster"') && ui.includes("console-roster-workbench"),
  "Forms should open on the visual roster rather than the full awakening roadmap");
assert.match(ui, /data-roster-view="path"[^>]*>⌁ Awakening Path/,
  "the awakening roadmap should remain available as a deliberate secondary view");
assert.ok(ui.includes("masteryFormId") && ui.includes("data-mastery-form"),
  "Mastery should show one chosen form instead of dumping every quest at once");
assert.ok(ui.includes("journey-dashboard") && ui.includes("story-chapter-strip"),
  "Journey should use a compact dashboard and act strip");
assert.match(css, /@media \(max-width:\s*600px\)[\s\S]*?\.mastery-picker\s*\{[^}]*flex-direction:\s*row;[^}]*overflow-x:\s*auto/s,
  "touch layouts should keep form selection swipeable rather than copying the TV column");
assert.match(css, /@media \(max-width:\s*600px\)[\s\S]*?\.console-roster-workbench\s*\{[^}]*grid-template-columns:\s*1fr/s,
  "phone and touch layouts should stack the roster and inspector without shrinking tap targets");
assert.match(menuController, /data\.navZone|dataset\.navZone/,
  "controller rows should be explicit navigation zones rather than unrestricted geometry");
assert.ok(ui.includes('data-nav-zone="sections"') && ui.includes('data-nav-zone="footer"'),
  "the console shell should define stable controller rows");
assert.ok(!ui.includes("<details") && !ui.includes("<select") && !ui.includes('type="checkbox"'),
  "pause-menu choices should use the same focusable buttons on controller and touch");
assert.ok(ui.includes('data-nav-zone="dyes"') && ui.includes("data-expedition-length") && ui.includes("data-gauntlet-count"),
  "dyes and run setup should expose explicit controller navigation rows");

console.log("console menu UX tests passed");
