/* ============================================================
   CORE — the heart of the engine.
   Sets up the global `G` object everything else hangs off,
   the event bus (how quests "hear" about what happens in the
   game), damage types, and little math helpers.
   ============================================================ */

"use strict";

const G = {
  // Internal pixel resolution. The canvas is scaled up to fit the screen.
  W: 320,
  H: 180,
  TILE: 16,

  // Registries — filled in by registerForm / registerAbility / etc.
  forms: {},        // id -> form definition
  formOrder: [],    // ids in the order they were registered
  abilities: {},    // id -> ability definition
  enemies: {},      // id -> enemy definition
  maps: {},         // id -> map definition

  // Live game state — created fresh by main.js on boot.
  state: null,

  // Visual effects (particles, floating numbers, slashes)
  fx: [],

  // Problems found while validating forms (shown in the Form Workshop panel)
  workshopErrors: [],
};

/* ---------- THE FOUR DAMAGE TYPES ----------
   This is one of the game's core rules: every attack has a
   damage type, and warded (shielded) enemies can only be
   hurt by the right type. This forces players to swap forms
   and mix abilities — which is the whole point!            */
G.DAMAGE_TYPES = {
  sharp: { name: "Sharp", color: "#94b0c2", icon: "🗡" },
  blunt: { name: "Blunt", color: "#ef7d57", icon: "🔨" },
  light: { name: "Light", color: "#ffcd75", icon: "✨" },
  dark:  { name: "Dark",  color: "#8153c1", icon: "🌑" },
};

/* ---------- EVENT BUS ----------
   G.events.emit("kill", {...}) shouts "something happened!"
   and anyone listening with G.events.on("kill", fn) hears it.
   The quest system listens to these to track progress.      */
G.events = (() => {
  const listeners = {};
  return {
    on(type, fn) {
      (listeners[type] = listeners[type] || []).push(fn);
    },
    emit(type, data) {
      data = data || {};
      const list = listeners[type];
      if (list) for (const fn of list) fn(data);
      const all = listeners["*"];
      if (all) for (const fn of all) fn(type, data);
    },
  };
})();

/* ---------- MATH HELPERS ---------- */
G.util = {
  clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; },
  dist(ax, ay, bx, by) { const dx = bx - ax, dy = by - ay; return Math.sqrt(dx * dx + dy * dy); },
  angleTo(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); },
  // Difference between two angles, wrapped to [-PI, PI]
  angleDiff(a, b) {
    let d = b - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  },
  lerp(a, b, t) { return a + (b - a) * t; },
  // Deterministic pseudo-random from coordinates (used to scatter grass tufts)
  hash2(x, y) {
    let h = (x * 374761393 + y * 668265263) | 0;
    h = (h ^ (h >> 13)) * 1274126177;
    return ((h ^ (h >> 16)) >>> 0) / 4294967295;
  },
};

/* ---------- VISUAL EFFECTS ---------- */
G.spawnFx = function (fx) {
  // fx: {kind, x, y, ...extra}  kinds: "puff", "num", "slash", "ring", "bubble", "spark"
  fx.t = 0;
  fx.dur = fx.dur || 0.4;
  G.fx.push(fx);
};

G.updateFx = function (dt) {
  for (let i = G.fx.length - 1; i >= 0; i--) {
    const f = G.fx[i];
    f.t += dt;
    if (f.vy !== undefined) f.y += f.vy * dt;
    if (f.vx !== undefined) f.x += f.vx * dt;
    if (f.t >= f.dur) G.fx.splice(i, 1);
  }
};

/* ---------- FLOATING DAMAGE NUMBERS & TOASTS ---------- */
G.damageNumber = function (x, y, text, color) {
  G.spawnFx({ kind: "num", x, y, text: String(text), color: color || "#f4f4f4", vy: -22, dur: 0.7 });
};
