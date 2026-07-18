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
  const gamepadVec = { x: 0, y: 0 };
  const releasedAims = {};
  const gamepadControls = {};
  let liveAim = null;
  let controllerAim = null;
  let controllerAimButton = "a";
  let gamepadIndex = null;
  let gamepadName = "";
  let gamepadNoticeShown = false;

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

  /* ---------- gamepad: Xbox layout + Steam Link standard mapping ---------- */
  const GAMEPAD_DEAD_ZONE = 0.22;
  const GAMEPAD_NAV_THRESHOLD = 0.62;

  function stickVector(x, y, deadZone) {
    const len = Math.sqrt(x * x + y * y);
    if (len <= deadZone) return { x: 0, y: 0 };
    const magnitude = Math.min(1, (len - deadZone) / (1 - deadZone));
    return { x: x / len * magnitude, y: y / len * magnitude };
  }

  function gamepadButton(pad, index, threshold = 0.5) {
    const button = pad.buttons && pad.buttons[index];
    return !!button && (button.pressed || button.value > threshold);
  }

  function prepareControllerAim(btn) {
    controllerAimButton = btn;
    releasedAims[btn] = controllerAim
      ? { x: controllerAim.x, y: controllerAim.y, dragged: true }
      : { x: 0, y: 0, dragged: false };
  }

  function syncGamepadControl(id, down, action) {
    const previous = gamepadControls[id] || { down: false, action: null };
    if (previous.down && (!down || previous.action !== action) && previous.action) {
      release(previous.action);
    }
    if (down && (!previous.down || previous.action !== action) && action) {
      if (action === "a" || action === "b" || action === "c") prepareControllerAim(action);
      press(action);
    }
    gamepadControls[id] = { down, action };
  }

  function resetGamepad() {
    for (const control of Object.values(gamepadControls)) {
      if (control.down && control.action) release(control.action);
    }
    for (const id in gamepadControls) delete gamepadControls[id];
    gamepadVec.x = gamepadVec.y = 0;
    controllerAim = null;
    gamepadIndex = null;
    gamepadName = "";
  }

  function updateGamepad() {
    if (!navigator.getGamepads) return;
    let pads;
    try { pads = navigator.getGamepads() || []; }
    catch (error) { return; }
    let pad = gamepadIndex === null ? null : pads[gamepadIndex];
    if (!pad || !pad.connected) {
      pad = Array.from(pads).find((candidate) => candidate && candidate.connected) || null;
    }
    if (!pad) {
      if (gamepadIndex !== null) resetGamepad();
      return;
    }

    gamepadIndex = pad.index;
    gamepadName = pad.id || "Gamepad";
    if (!gamepadNoticeShown && G.ui && G.ui.toast) {
      gamepadNoticeShown = true;
      G.ui.toast("Controller ready - left stick moves - right stick aims", 3.2);
    }

    const menuOpen = !!(G.ui && G.ui.menuOpen);
    const axes = pad.axes || [];
    const left = stickVector(axes[0] || 0, axes[1] || 0, GAMEPAD_DEAD_ZONE);
    const right = stickVector(axes[2] || 0, axes[3] || 0, 0.28);
    const dpadX = (gamepadButton(pad, 15) ? 1 : 0) - (gamepadButton(pad, 14) ? 1 : 0);
    const dpadY = (gamepadButton(pad, 13) ? 1 : 0) - (gamepadButton(pad, 12) ? 1 : 0);

    if (menuOpen) {
      gamepadVec.x = gamepadVec.y = 0;
    } else {
      gamepadVec.x = dpadX || left.x;
      gamepadVec.y = dpadY || left.y;
      const moveLen = Math.sqrt(gamepadVec.x * gamepadVec.x + gamepadVec.y * gamepadVec.y);
      if (moveLen > 1) {
        gamepadVec.x /= moveLen;
        gamepadVec.y /= moveLen;
      }
    }
    controllerAim = right.x || right.y
      ? { btn: controllerAimButton, x: right.x, y: right.y, dragged: true }
      : null;

    // Face buttons follow the labels players see in the HUD. Triggers and
    // bumpers duplicate combat actions so either grip feels comfortable.
    syncGamepadControl("a", gamepadButton(pad, 0), menuOpen ? "confirm" : "a");
    syncGamepadControl("b", gamepadButton(pad, 1), menuOpen ? "back" : "swap");
    syncGamepadControl("x", gamepadButton(pad, 2), menuOpen ? null : "b");
    syncGamepadControl("y", gamepadButton(pad, 3), menuOpen ? null : "c");
    syncGamepadControl("lb", gamepadButton(pad, 4), menuOpen ? "tabPrev" : "c");
    syncGamepadControl("rb", gamepadButton(pad, 5), menuOpen ? "tabNext" : "b");
    syncGamepadControl("lt", gamepadButton(pad, 6, 0.35), menuOpen ? null : "c");
    syncGamepadControl("rt", gamepadButton(pad, 7, 0.35), menuOpen ? "confirm" : "a");
    syncGamepadControl("view", gamepadButton(pad, 8), menuOpen ? "back" : "swap");
    syncGamepadControl("menu", gamepadButton(pad, 9), "pause");
    syncGamepadControl("rightStick", gamepadButton(pad, 11), menuOpen ? "confirm" : "a");

    const navUp = gamepadButton(pad, 12) || left.y < -GAMEPAD_NAV_THRESHOLD;
    const navDown = gamepadButton(pad, 13) || left.y > GAMEPAD_NAV_THRESHOLD;
    const navLeft = gamepadButton(pad, 14) || left.x < -GAMEPAD_NAV_THRESHOLD;
    const navRight = gamepadButton(pad, 15) || left.x > GAMEPAD_NAV_THRESHOLD;
    syncGamepadControl("navUp", menuOpen && navUp, "menuUp");
    syncGamepadControl("navDown", menuOpen && navDown, "menuDown");
    syncGamepadControl("navLeft", menuOpen && navLeft, "menuLeft");
    syncGamepadControl("navRight", menuOpen && navRight, "menuRight");
  }

  window.addEventListener("gamepadconnected", (event) => {
    gamepadIndex = event.gamepad.index;
    gamepadName = event.gamepad.id || "Gamepad";
  });
  window.addEventListener("gamepaddisconnected", (event) => {
    if (event.gamepad.index === gamepadIndex) resetGamepad();
  });
  window.addEventListener("blur", resetGamepad);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) resetGamepad();
  });

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
      e.preventDefault();
      joyId = e.pointerId;
      // Safari can refuse capture while another finger is using an ability.
      // Window-level release listeners below still make that case safe.
      try { zone.setPointerCapture(e.pointerId); } catch (error) { /* fall back to window events */ }
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
    const resetJoy = () => {
      const capturedId = joyId;
      joyId = null;
      joyVec.x = joyVec.y = 0;
      base.style.display = knob.style.display = "none";
      // Releasing explicitly prevents a stale capture from surviving an
      // orientation/fullscreen transition. Null the id first because release
      // itself may synchronously dispatch lostpointercapture.
      try {
        if (capturedId !== null && zone.hasPointerCapture && zone.hasPointerCapture(capturedId))
          zone.releasePointerCapture(capturedId);
      } catch (error) { /* capture was already lost */ }
    };
    const endJoy = (e) => {
      if (joyId === null || e.pointerId !== joyId) return;
      resetJoy();
    };
    zone.addEventListener("pointerup", endJoy);
    zone.addEventListener("pointercancel", endJoy);
    zone.addEventListener("lostpointercapture", endJoy);
    // iPad Safari occasionally routes the final event to window after a
    // multi-touch boss interaction, even though the zone requested capture.
    window.addEventListener("pointerup", endJoy);
    window.addEventListener("pointercancel", endJoy);
    // System gestures, app switching, rotation, and fullscreen changes may
    // end a touch without any final pointer event. Stopping is always safer
    // than preserving an old direction after the player has lifted a finger.
    window.addEventListener("blur", resetJoy);
    window.addEventListener("pagehide", resetJoy);
    window.addEventListener("orientationchange", resetJoy);
    document.addEventListener("fullscreenchange", resetJoy);
    document.addEventListener("webkitfullscreenchange", resetJoy);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) resetJoy();
    });
    window.addEventListener("touchend", (e) => {
      if (!e.touches || e.touches.length === 0) resetJoy();
    }, { passive: true });
    window.addEventListener("touchcancel", resetJoy, { passive: true });

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
      let x = keyVec.x + joyVec.x + gamepadVec.x;
      let y = keyVec.y + joyVec.y + gamepadVec.y;
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
    get aiming() { return liveAim || controllerAim; },
    clearTaps() {
      for (const k in taps) taps[k] = false;
      for (const k in releasedAims) delete releasedAims[k];
    },
    update: updateGamepad,
    get hasGamepad() { return gamepadIndex !== null; },
    get gamepadName() { return gamepadName; },
    isTouch,
  };
})();
