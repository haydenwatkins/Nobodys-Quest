"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

class FakeTarget {
  constructor(id) {
    this.id = id;
    this.listeners = {};
    this.style = {};
    this.captured = new Set();
    this.classList = { add() {}, remove() {} };
  }
  addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); }
  dispatch(type, data = {}) {
    const event = Object.assign({
      type, target: this, cancelable: true, preventDefault() {},
    }, data);
    for (const fn of this.listeners[type] || []) fn(event);
  }
  setPointerCapture(id) { this.captured.add(id); }
  hasPointerCapture(id) { return this.captured.has(id); }
  releasePointerCapture(id) {
    if (!this.captured.delete(id)) return;
    this.dispatch("lostpointercapture", { pointerId: id });
  }
  closest() { return null; }
}

const elements = {};
for (const id of ["touch-ui", "joy-zone", "btn-a", "btn-b", "btn-c", "btn-swap", "btn-pause"])
  elements[id] = new FakeTarget(id);
const windowTarget = new FakeTarget("window");
windowTarget.ontouchstart = null;
const documentTarget = new FakeTarget("document");
documentTarget.hidden = false;
documentTarget.body = { appendChild() {} };
documentTarget.getElementById = (id) => elements[id];
documentTarget.createElement = (tag) => new FakeTarget(tag);
const fakeGamepads = [];
const navigatorTarget = { maxTouchPoints: 5, getGamepads: () => fakeGamepads };

const context = vm.createContext({
  console, Math,
  G: { sfx: { ensure() {} }, ui: { menuOpen: false, toast() {} } },
  window: windowTarget,
  document: documentTarget,
  navigator: navigatorTarget,
});
const root = path.resolve(__dirname, "..");
vm.runInContext(fs.readFileSync(path.join(root, "js/engine/input.js"), "utf8"), context, { filename: "input.js" });
const G = context.G;
const zone = elements["joy-zone"];

function startMoving(pointerId = 7) {
  zone.dispatch("pointerdown", { pointerId, clientX: 100, clientY: 100 });
  zone.dispatch("pointermove", { pointerId, clientX: 58, clientY: 100 });
  assert.ok(G.input.vec.x < -0.9, "the test joystick should be moving left");
}

function assertStopped(message) {
  assert.equal(G.input.vec.x, 0, message);
  assert.equal(G.input.vec.y, 0, message);
}

startMoving(7);
zone.dispatch("lostpointercapture", { pointerId: 7 });
assertStopped("lost pointer capture must stop movement");

startMoving(8);
windowTarget.dispatch("pointerup", { pointerId: 8 });
assertStopped("a release routed to window must stop movement");

startMoving(9);
windowTarget.dispatch("pointercancel", { pointerId: 9 });
assertStopped("a window cancellation must stop movement");

for (const lifecycle of ["blur", "pagehide", "orientationchange"]) {
  startMoving(10);
  windowTarget.dispatch(lifecycle);
  assertStopped(`${lifecycle} must clear a stale joystick`);
}

startMoving(11);
documentTarget.hidden = true;
documentTarget.dispatch("visibilitychange");
assertStopped("app switching must clear a stale joystick");
documentTarget.hidden = false;

startMoving(12);
windowTarget.dispatch("touchcancel", { touches: [] });
assertStopped("Safari touch cancellation must clear a stale joystick");

startMoving(13);
windowTarget.dispatch("touchend", { touches: [] });
assertStopped("Safari's final touchend must clear a stale joystick");

function gamepadButton(value = 0) {
  return { pressed: value > 0.5, touched: value > 0, value };
}

const pad = {
  id: "Xbox Wireless Controller",
  index: 0,
  connected: true,
  mapping: "standard",
  axes: [0, 0, 0, 0],
  buttons: Array.from({ length: 17 }, () => gamepadButton()),
};
fakeGamepads[0] = pad;

pad.axes[0] = 0.85;
G.input.update();
assert.equal(G.input.hasGamepad, true, "a standard controller should be detected");
assert.ok(G.input.vec.x > 0.75, "the left stick should move the player");
pad.axes[0] = 0;
G.input.update();
assertStopped("centering the left stick must stop movement");

pad.buttons[15] = gamepadButton(1);
G.input.update();
assert.equal(G.input.vec.x, 1, "the D-pad should move the player");
pad.buttons[15] = gamepadButton();
G.input.update();

pad.buttons[0] = gamepadButton(1);
G.input.update();
assert.equal(G.input.tapped("a"), true, "Xbox A should fire the primary ability");
pad.buttons[0] = gamepadButton();
G.input.update();

pad.buttons[2] = gamepadButton(1);
G.input.update();
assert.equal(G.input.tapped("b"), true, "Xbox X should fire the secondary ability");
pad.buttons[2] = gamepadButton();
G.input.update();

pad.buttons[3] = gamepadButton(1);
G.input.update();
assert.equal(G.input.tapped("c"), true, "Xbox Y should fire the third ability");
pad.buttons[3] = gamepadButton();
G.input.update();

pad.buttons[1] = gamepadButton(1);
G.input.update();
assert.equal(G.input.tapped("swap"), true, "Xbox B should swap forms during gameplay");
pad.buttons[1] = gamepadButton();
G.input.update();

pad.buttons[9] = gamepadButton(1);
G.input.update();
assert.equal(G.input.tapped("pause"), true, "the Xbox Menu button should pause");
pad.buttons[9] = gamepadButton();
G.input.update();

pad.axes[2] = 1;
pad.buttons[0] = gamepadButton(1);
G.input.update();
assert.equal(G.input.tapped("a"), true, "primary should tap again after release");
const aimedShot = G.input.takeAim("a");
assert.equal(aimedShot.dragged, true, "the right stick should provide manual aim");
assert.ok(aimedShot.x > 0.95, "right-stick aim should preserve direction");
pad.buttons[0] = gamepadButton();
pad.axes[2] = 0;
G.input.update();

G.ui.menuOpen = true;
pad.buttons[0] = gamepadButton(1);
G.input.update();
assert.equal(G.input.tapped("confirm"), true, "Xbox A should confirm in menus");
assert.equal(G.input.tapped("a"), false, "menu confirmation must not queue an attack");
pad.buttons[0] = gamepadButton();
G.input.update();

pad.axes[1] = -1;
G.input.update();
assert.equal(G.input.tapped("menuUp"), true, "the left stick should navigate menus");
pad.axes[1] = 0;
G.input.update();

fakeGamepads[0] = null;
G.input.update();
assert.equal(G.input.hasGamepad, false, "disconnecting should clear controller state");
assertStopped("disconnecting a controller must stop movement");

console.log("input tests passed");
