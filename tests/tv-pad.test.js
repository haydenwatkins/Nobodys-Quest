/* Tests the Android TV wrapper integration in js/engine/input.js:
   the UA platform signal must suppress the iPad touch UI, and the native
   controller bridge must drive the game through the SAME Xbox mapping the
   browser Gamepad API uses. See android-tv/README.md for the other half. */
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
    this.classes = new Set();
    this.classList = {
      add: (name) => this.classes.add(name),
      remove: (name) => this.classes.delete(name),
      contains: (name) => this.classes.has(name),
    };
  }
  addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); }
  dispatch(type, data = {}) {
    const event = Object.assign({
      type, target: this, cancelable: true, preventDefault() {},
    }, data);
    for (const fn of this.listeners[type] || []) fn(event);
  }
  closest() { return null; }
}

const elements = {};
for (const id of ["touch-ui", "joy-zone", "btn-a", "btn-b", "btn-c", "btn-swap", "btn-map", "btn-pause", "btn-ultimate"])
  elements[id] = new FakeTarget(id);

const windowTarget = new FakeTarget("window");
// The wrapper's WebView misleadingly reports touch support, like real TVs do.
windowTarget.ontouchstart = null;

// Fake of the object androidx.webkit's WebMessageListener injects at
// document creation, before any page script runs.
const postedToNative = [];
windowTarget.nqTvBridge = {
  onmessage: null,
  postMessage: (text) => postedToNative.push(text),
};

const documentTarget = new FakeTarget("document");
documentTarget.hidden = false;
documentTarget.body = { appendChild() {} };
documentTarget.getElementById = (id) => elements[id];
documentTarget.createElement = (tag) => new FakeTarget(tag);

let inputClock = 0;
let wheelOpened = 0;
let wheelCommitted = 0;

const context = vm.createContext({
  console, Math, JSON, Array, Object,
  performance: { now: () => inputClock },
  G: { sfx: { ensure() {} }, requestGuidance() { return true; }, ui: {
    menuOpen: false, formWheelOpen: false, toast() {},
    openFormWheel() { wheelOpened++; this.formWheelOpen = true; return true; },
    commitFormWheel() { wheelCommitted++; this.formWheelOpen = false; return true; },
    closeFormWheel() { this.formWheelOpen = false; },
  } },
  window: windowTarget,
  document: documentTarget,
  navigator: {
    maxTouchPoints: 5, // misleading, as on some TV WebViews
    userAgent: "Mozilla/5.0 (Linux; Android 12; TV) AppleWebKit/537.36 Chrome/126 Safari/537.36 NobodysQuestTV/1.0",
    // No getGamepads at all: the native shell consumes controller events,
    // so WebView's Gamepad API never activates.
  },
});
const root = path.resolve(__dirname, "..");
vm.runInContext(fs.readFileSync(path.join(root, "js/engine/input.js"), "utf8"), context, { filename: "input.js" });
const G = context.G;

/* ---------- platform signal ---------- */
assert.equal(G.input.isTV, true, "the UA suffix should identify the TV wrapper");
assert.equal(G.input.isTouch, false, "TV must not count as a touch device despite maxTouchPoints");
assert.notEqual(elements["touch-ui"].style.display, "block", "iPad touch buttons must stay hidden on TV");

/* ---------- bridge handshake ---------- */
assert.deepEqual(postedToNative, ["ready"], "input.js should hand native the reply channel");
assert.equal(typeof windowTarget.nqTvBridge.onmessage, "function", "input.js should listen for native messages");
assert.equal(typeof windowTarget.__nqTvPad, "function", "the evaluateJavascript fallback entry point should exist");

function nativeSend(obj) { windowTarget.nqTvBridge.onmessage({ data: JSON.stringify(obj) }); }
function state(axes, buttonMap = {}) {
  const b = Array.from({ length: 17 }, (_, i) => buttonMap[i] || 0);
  nativeSend({ t: "s", a: axes, b });
}

/* ---------- state before connect is ignored ---------- */
state([1, 0, 0, 0]);
G.input.update();
assert.equal(G.input.hasGamepad, false, "state before a connect message must be ignored");
assert.equal(G.input.vec.x, 0, "no movement before the controller announces itself");

/* ---------- connect + movement ---------- */
nativeSend({ t: "c", id: "Xbox Wireless Controller" });
G.input.update();
assert.equal(G.input.hasGamepad, true, "a connect message should register the controller");
assert.equal(G.input.tvPadActive, true, "the virtual pad should report active");
assert.equal(G.input.gamepadName, "Xbox Wireless Controller", "the real controller name should surface");

state([0.9, 0, 0, 0]);
G.input.update();
assert.ok(G.input.vec.x > 0.75, "the left stick should move the player");
state([0, 0, 0, 0]);
G.input.update();
assert.equal(G.input.vec.x, 0, "centering the stick must stop movement");

state([0, 0, 0, 0], { 15: 1 });
G.input.update();
assert.equal(G.input.vec.x, 1, "the D-pad should move the player");
state([0, 0, 0, 0]);
G.input.update();

/* ---------- face buttons run the existing Xbox mapping ---------- */
state([0, 0, 0, 0], { 0: 1 });
G.input.update();
assert.equal(G.input.tapped("a"), true, "Xbox A should fire the primary ability");
state([0, 0, 0, 0]);
G.input.update();

state([0, 0, 0, 0], { 2: 1 });
G.input.update();
assert.equal(G.input.tapped("b"), true, "Xbox X should fire the secondary ability");
state([0, 0, 0, 0]);
G.input.update();

/* ---------- analog triggers use pressure, not just on/off ---------- */
state([0, 0, 0, 0], { 7: 0.4 });
G.input.update();
assert.equal(G.input.tapped("a"), true, "a partial right-trigger pull should still fire (threshold 0.35)");
state([0, 0, 0, 0]);
G.input.update();

/* ---------- right stick aiming ---------- */
state([0, 0, 1, 0], { 0: 1 });
G.input.update();
assert.equal(G.input.tapped("a"), true, "primary should fire while aiming");
const aimedShot = G.input.takeAim("a");
assert.equal(aimedShot.dragged, true, "the right stick should provide manual aim");
assert.ok(aimedShot.x > 0.95, "right-stick aim should preserve direction");
state([0, 0, 0, 0]);
G.input.update();

/* ---------- hold-to-open form wheel still works ---------- */
state([0, 0, 0, 0], { 1: 1 });
G.input.update();
inputClock += 400;
G.input.update();
assert.equal(wheelOpened, 1, "holding Xbox B should open the paused form wheel");
state([0, 0, 0, 0]);
G.input.update();
assert.equal(wheelCommitted, 1, "releasing a held swap should commit the radial choice");

/* ---------- menus ---------- */
G.ui.menuOpen = true;
state([0, 0, 0, 0], { 0: 1 });
G.input.update();
assert.equal(G.input.tapped("confirm"), true, "Xbox A should confirm in menus");
assert.equal(G.input.tapped("a"), false, "menu confirmation must not queue an attack");
state([0, 0, 0, 0]);
G.input.update();
state([0, -1, 0, 0]);
G.input.update();
assert.equal(G.input.tapped("menuUp"), true, "the left stick should navigate menus");
inputClock += 320;
G.input.update();
assert.equal(G.input.tapped("menuUp"), true, "held TV stick input should repeat like a console menu");
state([0, 0, 0, 0]);
G.input.update();
state([0, 0, 0, 0.85]);
G.input.update();
assert.ok(G.input.menuScroll.y > 0.7, "the TV right stick should provide analog menu scrolling");
state([0, 0, 0, 0]);
G.input.update();
state([0, 0, 0, 0], { 5: 1 });
G.input.update();
assert.equal(G.input.tapped("pageRight"), true, "TV R1 should navigate right in menus");
state([0, 0, 0, 0]);
G.input.update();
state([0, 0, 0, 0], { 6: 0.5 });
G.input.update();
assert.equal(G.input.tapped("pageLeft"), true, "TV L2 should navigate left in menus");
state([0, 0, 0, 0]);
G.input.update();
G.ui.menuOpen = false;

/* ---------- the DOM title screen takes menu-style controls ---------- */
G.saveSlotScreenOpen = true;
state([0, 0, 0, 0], { 0: 1 });
G.input.update();
assert.equal(G.input.tapped("confirm"), true, "Xbox A should confirm on the title screen");
assert.equal(G.input.tapped("a"), false, "title confirmation must not queue an attack");
state([0, 0, 0, 0]);
G.input.update();
state([0, 0, 0, 0], { 13: 1 });
G.input.update();
assert.equal(G.input.tapped("menuDown"), true, "the D-pad should move the title highlight");
state([0, 0, 0, 0]);
G.input.update();
state([0, 0, 0, 0], { 1: 1 });
G.input.update();
state([0, 0, 0, 0]);
G.input.update();
assert.equal(G.input.tapped("back"), true, "Xbox B should back out on the title screen");
G.saveSlotScreenOpen = false;

/* ---------- app switch safety: no stuck buttons ---------- */
state([0.9, 0, 0, 0], { 0: 1 });
G.input.update();
windowTarget.dispatch("blur");
G.input.update();
assert.equal(G.input.vec.x, 0, "losing window focus must stop movement");
assert.equal(G.input.held("a"), false, "losing window focus must release held buttons");
assert.equal(G.input.tvPadActive, true, "the controller stays connected across an app switch");

/* ---------- disconnect ---------- */
state([0.9, 0, 0, 0], { 0: 1 });
G.input.update();
nativeSend({ t: "d" });
G.input.update();
assert.equal(G.input.hasGamepad, false, "a disconnect message should clear controller state");
assert.equal(G.input.vec.x, 0, "disconnecting must stop movement");
assert.equal(G.input.held("a"), false, "disconnecting must release held buttons");

/* ---------- garbage from the bridge is harmless ---------- */
windowTarget.__nqTvPad("not json at all");
windowTarget.__nqTvPad("null");
windowTarget.__nqTvPad('{"t":"s"}');
G.input.update();
assert.equal(G.input.hasGamepad, false, "malformed bridge messages must be ignored");

console.log("tv pad tests passed");
