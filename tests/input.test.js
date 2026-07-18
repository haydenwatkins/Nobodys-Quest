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

const context = vm.createContext({
  console, Math,
  G: { sfx: { ensure() {} } },
  window: windowTarget,
  document: documentTarget,
  navigator: { maxTouchPoints: 5 },
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

console.log("input tests passed");
