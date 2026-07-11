/* ============================================================
   INPUT — keyboard for computers, touch for iPads.

   Reading input elsewhere in the engine:
     G.input.vec           -> {x, y} movement direction (-1..1)
     G.input.held("a")     -> is the A button held right now?
     G.input.tapped("a")   -> was it pressed THIS frame? (auto-clears)
     G.input.takeAim("a")  -> touch tap/drag aim released with that button
     G.input.aiming         -> live drag direction for the on-screen guide

   Buttons: "a" "b" "c" (abilities), "swap" (change form),
            "pause" (menu)
   ============================================================ */

"use strict";

G.input = (() => {
  const held = {};
  const taps = {};
  const keyVec = { x: 0, y: 0 };
  const joyVec = { x: 0, y: 0 };
  const releasedAims = {};
  let liveAim = null;

  function press(btn) {
    if (!held[btn]) taps[btn] = true;
    held[btn] = true;
    G.sfx.ensure(); // unlock iPad audio on any input
  }
  function release(btn) { held[btn] = false; }

  /* ---------- keyboard ---------- */
  const keyMap = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right",
    W: "up", S: "down", A: "left", D: "right",
    j: "a", k: "b", l: "c", J: "a", K: "b", L: "c",
    z: "a", x: "b", c: "c", Z: "a", X: "b", C: "c",
    " ": "a",
    q: "swap", Q: "swap", Tab: "swap",
    Escape: "pause", p: "pause", P: "pause", Enter: "pause",
  };
  const dirsHeld = { up: false, down: false, left: false, right: false };

  window.addEventListener("keydown", (e) => {
    const b = keyMap[e.key];
    if (!b) return;
    e.preventDefault();
    if (b in dirsHeld) dirsHeld[b] = true;
    else press(b);
    updateKeyVec();
  });
  window.addEventListener("keyup", (e) => {
    const b = keyMap[e.key];
    if (!b) return;
    if (b in dirsHeld) dirsHeld[b] = false;
    else release(b);
    updateKeyVec();
  });
  function updateKeyVec() {
    keyVec.x = (dirsHeld.right ? 1 : 0) - (dirsHeld.left ? 1 : 0);
    keyVec.y = (dirsHeld.down ? 1 : 0) - (dirsHeld.up ? 1 : 0);
  }

  /* ---------- touch: virtual joystick on the left half ---------- */
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  function setupTouch() {
    document.getElementById("touch-ui").style.display = "block";

    const zone = document.getElementById("joy-zone");
    const base = document.createElement("div");
    base.id = "joy-base";
    const knob = document.createElement("div");
    knob.id = "joy-knob";
    document.body.appendChild(base);
    document.body.appendChild(knob);
    base.style.display = knob.style.display = "none";

    let joyId = null, ox = 0, oy = 0;
    const RADIUS = 42;

    zone.addEventListener("pointerdown", (e) => {
      if (joyId !== null) return;
      joyId = e.pointerId;
      zone.setPointerCapture(e.pointerId);
      ox = e.clientX; oy = e.clientY;
      base.style.display = knob.style.display = "block";
      base.style.left = ox - 45 + "px"; base.style.top = oy - 45 + "px";
      moveKnob(ox, oy);
      G.sfx.ensure();
    });
    zone.addEventListener("pointermove", (e) => {
      if (e.pointerId !== joyId) return;
      moveKnob(e.clientX, e.clientY);
    });
    const endJoy = (e) => {
      if (e.pointerId !== joyId) return;
      joyId = null;
      joyVec.x = joyVec.y = 0;
      base.style.display = knob.style.display = "none";
    };
    zone.addEventListener("pointerup", endJoy);
    zone.addEventListener("pointercancel", endJoy);

    function moveKnob(cx, cy) {
      let dx = cx - ox, dy = cy - oy;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > RADIUS) { dx = (dx / len) * RADIUS; dy = (dy / len) * RADIUS; }
      knob.style.left = ox + dx - 20 + "px";
      knob.style.top = oy + dy - 20 + "px";
      // Dead zone so tiny wobbles don't move the player
      joyVec.x = Math.abs(dx) > 8 ? dx / RADIUS : 0;
      joyVec.y = Math.abs(dy) > 8 ? dy / RADIUS : 0;
    }

    /* ---------- touch ability buttons: tap to auto-aim, drag to aim ---------- */
    const abilityBtns = { "btn-a": "a", "btn-b": "b", "btn-c": "c" };
    for (const [id, btn] of Object.entries(abilityBtns)) {
      const el = document.getElementById(id);
      let pointerId = null, startX = 0, startY = 0;
      const DEAD_ZONE = 12;

      el.addEventListener("pointerdown", (e) => {
        if (pointerId !== null || liveAim !== null) return;
        e.preventDefault();
        pointerId = e.pointerId;
        startX = e.clientX; startY = e.clientY;
        el.setPointerCapture(e.pointerId);
        el.classList.add("held");
        liveAim = { btn, x: 0, y: 0, dragged: false };
        G.sfx.ensure();
      });
      el.addEventListener("pointermove", (e) => {
        if (e.pointerId !== pointerId) return;
        let dx = e.clientX - startX, dy = e.clientY - startY;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < DEAD_ZONE) {
          liveAim = { btn, x: 0, y: 0, dragged: false };
          return;
        }
        dx /= len; dy /= len;
        liveAim = { btn, x: dx, y: dy, dragged: true };
      });
      const finishAim = (e, fire) => {
        if (e.pointerId !== pointerId) return;
        if (e.cancelable) e.preventDefault();
        if (fire) {
          releasedAims[btn] = liveAim && liveAim.btn === btn
            ? { x: liveAim.x, y: liveAim.y, dragged: liveAim.dragged }
            : { x: 0, y: 0, dragged: false };
        }
        pointerId = null;
        liveAim = null;
        el.classList.remove("held");
        if (fire) { press(btn); release(btn); }
      };
      el.addEventListener("pointerup", (e) => finishAim(e, true));
      el.addEventListener("pointercancel", (e) => finishAim(e, false));
      // Pointer capture is reliable on current iOS/Android, but this fallback
      // also covers embedded browsers that drop capture during a long drag.
      window.addEventListener("pointerup", (e) => finishAim(e, true));
      window.addEventListener("pointercancel", (e) => finishAim(e, false));
    }

    /* ---------- simple touch buttons fire as soon as they are tapped ---------- */
    const simpleBtns = { "btn-swap": "swap", "btn-pause": "pause" };
    for (const [id, btn] of Object.entries(simpleBtns)) {
      const el = document.getElementById(id);
      el.addEventListener("pointerdown", (e) => { e.preventDefault(); el.classList.add("held"); press(btn); });
      const up = (e) => { e.preventDefault(); el.classList.remove("held"); release(btn); };
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
    }
  }

  if (isTouch) setupTouch();

  // Stop Safari from moving the game page, but leave scrollable overlays alone.
  // Blocking every touchmove also blocks the pause menu on iPhone.
  document.addEventListener("touchmove", (e) => {
    if (e.target.closest("#menu, #workshop-errors")) return;
    e.preventDefault();
  }, { passive: false });

  /* ---------- public API ---------- */
  return {
    get vec() {
      let x = keyVec.x + joyVec.x;
      let y = keyVec.y + joyVec.y;
      const len = Math.sqrt(x * x + y * y);
      if (len > 1) { x /= len; y /= len; }
      return { x, y };
    },
    held: (btn) => !!held[btn],
    tapped(btn) {
      if (taps[btn]) { taps[btn] = false; return true; }
      return false;
    },
    takeAim(btn) {
      const aim = releasedAims[btn] || null;
      delete releasedAims[btn];
      return aim;
    },
    get aiming() { return liveAim; },
    clearTaps() {
      for (const k in taps) taps[k] = false;
      for (const k in releasedAims) delete releasedAims[k];
    },
    isTouch,
  };
})();
