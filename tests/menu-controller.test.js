"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const taps = {};
const input = {
  hasGamepad: true,
  menuScroll: { x: 0, y: 0 },
  tapped(action) {
    if (!taps[action]) return false;
    taps[action] = false;
    return true;
  },
};
const classes = () => {
  const values = new Set();
  return { add: (v) => values.add(v), remove: (v) => values.delete(v), contains: (v) => values.has(v) };
};
const doc = { activeElement: null };
function button(name, left, top) {
  return {
    name, dataset: { navId: name }, tagName: "BUTTON", classList: classes(), parentElement: null, clicks: 0,
    getBoundingClientRect: () => ({ left, top, width: 90, height: 40 }),
    focus() { doc.activeElement = this; },
    scrollIntoView() { this.scrolledIntoView = true; },
    click() { this.clicks++; },
  };
}
let buttons = [button("one", 0, 0), button("two", 120, 0), button("three", 0, 70), button("four", 120, 70)];
const root = {
  classList: classes(), scrollTop: 0, scrollLeft: 0, scrollHeight: 900, clientHeight: 240,
  scrollWidth: 500, clientWidth: 300, parentElement: null,
  contains: (element) => element === root || buttons.includes(element),
  querySelectorAll: () => buttons,
};
buttons.forEach((item) => { item.parentElement = root; });
let clock = 0;
const context = vm.createContext({
  console, Math, Date, Event: class {}, document: doc,
  performance: { now: () => clock }, G: { input },
});
const source = fs.readFileSync(path.join(__dirname, "..", "js/engine/menu-controller.js"), "utf8");
vm.runInContext(source, context, { filename: "menu-controller.js" });
const controller = context.G.menuController;

const uiSource = fs.readFileSync(path.join(__dirname, "..", "js/engine/ui.js"), "utf8");
const inputSource = fs.readFileSync(path.join(__dirname, "..", "js/engine/input.js"), "utf8");
const mainSource = fs.readFileSync(path.join(__dirname, "..", "js/engine/main.js"), "utf8");
const cssSource = fs.readFileSync(path.join(__dirname, "..", "css/style.css"), "utf8");
assert.ok(uiSource.includes("updateWorkshopController") && inputSource.includes("G.ui.workshopOpen") &&
  mainSource.includes("G.ui.updateWorkshopController(dt)"),
"the recovery dialog should use the same controller loop as every other menu");
for (const rootId of ["#menu", "#save-slots", "#story-ending", "#workshop-errors"])
  assert.ok(cssSource.includes(`${rootId} .controller-focus`), `${rootId} should expose a visible controller focus`);

controller.focusDefault(root, buttons[0]);
assert.equal(doc.activeElement, buttons[0]);
assert.ok(buttons[0].classList.contains("controller-focus"));

taps.menuRight = true;
controller.update(root, {}, .016);
assert.equal(doc.activeElement, buttons[1], "right should choose the nearest control in that direction");
taps.menuDown = true;
controller.update(root, {}, .016);
assert.equal(doc.activeElement, buttons[3], "down should preserve the current column");
taps.confirm = true;
controller.update(root, {}, .016);
assert.equal(buttons[3].clicks, 1, "A should activate the focused DOM control");

let pages = 0;
taps.pageLeft = true;
controller.update(root, { onPageLeft: () => { pages--; } }, .016);
taps.pageRight = true;
controller.update(root, { onPageRight: () => { pages++; } }, .016);
assert.equal(pages, 0, "shoulder/trigger paging should invoke explicit menu routes");

const memory = controller.snapshot(root);
const rebuilt = buttons.map((item, index) => button(item.name, index % 2 * 120, Math.floor(index / 2) * 70));
buttons = rebuilt;
buttons.forEach((item) => { item.parentElement = root; });
controller.restore(root, memory);
assert.equal(doc.activeElement.name, "four", "a rebuilt menu should restore the same command by stable identity");

taps.menuDown = true;
controller.update(root, {}, .016);
assert.equal(doc.activeElement.name, "four", "focus should stop at a menu edge instead of wrapping to an unrelated header");

input.menuScroll.y = 0.75;
clock += 16;
controller.update(root, {}, .1);
assert.ok(root.scrollTop > 20, "the right stick should continuously scroll the nearest menu viewport");
input.menuScroll.y = 0;

controller.setFocus(root, buttons[0]);
buttons[0].dataset.navZone = "header";
buttons[1].dataset.navZone = "body";
buttons[3].dataset.navZone = "header";
taps.menuRight = true;
controller.update(root, {}, .016);
assert.equal(doc.activeElement, buttons[3], "horizontal navigation should remain inside an explicit console row");

controller.reset(root);
input.hasGamepad = false;
taps.menuLeft = true;
assert.equal(controller.update(root, {}, .016), false, "touch-only use should never invoke controller navigation");
assert.equal(doc.activeElement, buttons[3], "disabling the gamepad should not disturb pointer/touch focus");

console.log("menu controller tests passed");
