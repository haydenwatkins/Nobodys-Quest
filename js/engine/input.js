/* ============================================================
   INPUT — keyboard for computers, touch for iPads.

   Reading input elsewhere in the engine:
     G.input.vec           -> {x, y} movement direction (-1..1)
     G.input.held("a")     -> is the A button held right now?
     G.input.tapped("a")   -> was it pressed THIS frame? (auto-clears)
     G.input.takeAim("a")  -> touch tap/drag aim released with that button
     G.input.aiming         -> live drag direction for the on-screen guide

   Buttons: "a" "b" "c" (abilities), "swap" (change form),
            "map" (Wayfinder Atlas), "pause" (menu)
   ============================================================ */

"use strict";

G.input = (() => {
  const held = {};
  const taps = {};
  const keyVec = { x: 0, y: 0 };
  const joyVec = { x: 0, y: 0 };
  const gamepadVec = { x: 0, y: 0 };
  const menuScrollVec = { x: 0, y: 0 };
  const releasedAims = {};
  const gamepadControls = {};
  let liveAim = null;
  let controllerAim = null;
  let controllerAimButton = "a";
  let gamepadIndex = null;
  let gamepadName = "";
  let gamepadNoticeShown = false;
  let ultimateChordLatched = false;
  let swapPressedAt = 0;
  let swapLongTriggered = false;
  let swapOrigin = null;
  const SWAP_HOLD_MS = 360;
  let mapTouchPressedAt = 0;
  let mapTouchHeld = false;
  let mapTouchLongTriggered = false;
  const MAP_HELP_HOLD_MS = 520;

  function inputNow() {
    return typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
  }

  function press(btn, origin) {
    if (!held[btn]) {
      if (btn === "swap") {
        swapPressedAt = inputNow();
        swapLongTriggered = false;
        swapOrigin = origin || null;
      } else taps[btn] = true;
    }
    held[btn] = true;
    G.sfx.ensure(); // unlock iPad audio on any input
  }
  function release(btn, cancelled) {
    if (btn === "swap" && held[btn]) {
      if (!cancelled && swapLongTriggered && G.ui && G.ui.commitFormWheel) G.ui.commitFormWheel();
      else if (!cancelled && !swapLongTriggered) taps.swap = true;
      else if (cancelled && swapLongTriggered && G.ui && G.ui.closeFormWheel) G.ui.closeFormWheel();
      swapPressedAt = 0;
      swapLongTriggered = false;
      swapOrigin = null;
    }
    held[btn] = false;
  }

  /* ---------- keyboard ---------- */
  const keyMap = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right",
    W: "up", S: "down", A: "left", D: "right",
    j: "a", k: "b", l: "c", J: "a", K: "b", L: "c",
    z: "a", x: "b", c: "c", Z: "a", X: "b", C: "c",
    " ": "a",
    e: "interact", E: "interact",
    r: "ultimate", R: "ultimate",
    q: "swap", Q: "swap", Tab: "swap",
    m: "map", M: "map",
    h: "guide", H: "guide",
    Escape: "pause", p: "pause", P: "pause", Enter: "interact",
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

  /* ---------- Android TV wrapper: native controller bridge ----------
     The Kotlin shell in android-tv/ intercepts Xbox controller input
     (Android WebView never delivers it as browser gamepad events) and
     streams raw standard-gamepad state here. Shaping that state like a
     browser Gamepad object and feeding it through the same updateGamepad()
     path keeps this file the ONE owner of the Xbox action mapping. */
  const isTVWrapper = /\bNobodysQuestTV\//.test(navigator.userAgent || "");
  if (typeof document !== "undefined" && document.documentElement) document.documentElement.classList.toggle("tv-mode", isTVWrapper);
  const virtualPad = {
    id: "Android TV Controller",
    index: 0,
    connected: false,
    mapping: "standard",
    axes: [0, 0, 0, 0],
    buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })),
  };

  function neutralizeVirtualPad() {
    for (let i = 0; i < virtualPad.axes.length; i++) virtualPad.axes[i] = 0;
    for (const button of virtualPad.buttons) { button.pressed = false; button.value = 0; }
  }

  // Native messages: {"t":"c","id":name} connect · {"t":"d"} disconnect ·
  // {"t":"s","a":[lx,ly,rx,ry],"b":[17 button values 0..1]} state snapshot.
  // The pad object is mutated in place so a 60Hz stream allocates nothing.
  function tvPadMessage(text) {
    let msg;
    try { msg = JSON.parse(text); } catch (error) { return; }
    if (!msg || typeof msg !== "object") return;
    if (msg.t === "c") {
      virtualPad.id = typeof msg.id === "string" && msg.id ? msg.id : "Android TV Controller";
      virtualPad.connected = true;
    } else if (msg.t === "d") {
      virtualPad.connected = false;
      neutralizeVirtualPad();
    } else if (msg.t === "s" && virtualPad.connected) {
      const a = msg.a, b = msg.b;
      if (Array.isArray(a)) {
        for (let i = 0; i < virtualPad.axes.length && i < a.length; i++) virtualPad.axes[i] = +a[i] || 0;
      }
      if (Array.isArray(b)) {
        for (let i = 0; i < virtualPad.buttons.length && i < b.length; i++) {
          const value = +b[i] || 0;
          virtualPad.buttons[i].value = value;
          virtualPad.buttons[i].pressed = value >= 0.5;
        }
      }
    }
  }

  // The wrapper injects window.nqTvBridge (a WebMessageListener object)
  // before any page script runs. Posting "ready" hands native the reply
  // channel it needs to start streaming controller state to us.
  if (window.nqTvBridge && window.nqTvBridge.postMessage) {
    try {
      window.nqTvBridge.onmessage = (event) => tvPadMessage(event && event.data);
      window.nqTvBridge.postMessage("ready");
    } catch (error) { /* bridge unavailable; the fallback below still works */ }
  }
  // Fallback entry point for wrapper builds whose WebView lacks
  // WebMessageListener (native calls this via evaluateJavascript).
  window.__nqTvPad = tvPadMessage;

  /* ---------- gamepad: Xbox layout + Steam Link standard mapping ---------- */
  const GAMEPAD_DEAD_ZONE = 0.22;
  const GAMEPAD_NAV_THRESHOLD = 0.62;
  const MENU_REPEAT_DELAY_MS = 360;
  const MENU_REPEAT_INTERVAL_MS = 135;

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

  function syncGamepadControl(id, down, action, repeat) {
    const previous = gamepadControls[id] || { down: false, action: null, repeatAt: 0 };
    const changed = !previous.down || previous.action !== action;
    if (previous.down && (!down || previous.action !== action) && previous.action) {
      release(previous.action);
    }
    if (down && changed && action) {
      if (action === "a" || action === "b" || action === "c") prepareControllerAim(action);
      press(action);
    }
    let repeatAt = previous.repeatAt || 0;
    if (!down || !action) repeatAt = 0;
    else if (changed) repeatAt = inputNow() + MENU_REPEAT_DELAY_MS;
    else if (repeat && repeatAt && inputNow() >= repeatAt) {
      // Gamepads do not emit keyboard-style repeat events. Synthesize a
      // measured repeat so holding the stick/D-pad feels like a console UI
      // without racing through several controls on the first press.
      taps[action] = true;
      repeatAt = inputNow() + MENU_REPEAT_INTERVAL_MS;
    }
    gamepadControls[id] = { down, action, repeatAt };
  }

  function resetGamepad() {
    for (const control of Object.values(gamepadControls)) {
      if (control.down && control.action) release(control.action, true);
    }
    for (const id in gamepadControls) delete gamepadControls[id];
    gamepadVec.x = gamepadVec.y = 0;
    menuScrollVec.x = menuScrollVec.y = 0;
    controllerAim = null;
    ultimateChordLatched = false;
    gamepadIndex = null;
    gamepadName = "";
    // Also drop any TV-bridge state so a blur/app-switch can never leave a
    // button "held". Native re-sends fresh state when the app resumes.
    neutralizeVirtualPad();
  }

  function findBrowserPad() {
    if (!navigator.getGamepads) return null;
    let pads;
    try { pads = navigator.getGamepads() || []; }
    catch (error) { return null; }
    let pad = gamepadIndex === null ? null : pads[gamepadIndex];
    if (!pad || !pad.connected) {
      pad = Array.from(pads).find((candidate) => candidate && candidate.connected) || null;
    }
    return pad;
  }

  function updateGamepad() {
    // The Android TV wrapper's virtual pad wins while it is connected: on TV
    // the native shell consumes controller events before WebView sees them,
    // so the browser Gamepad API stays silent there.
    const pad = virtualPad.connected ? virtualPad : findBrowserPad();
    if (!pad) {
      if (gamepadIndex !== null) resetGamepad();
      return;
    }

    gamepadIndex = pad.index;
    gamepadName = pad.id || "Gamepad";
    if (!gamepadNoticeShown && G.ui && G.ui.toast) {
      gamepadNoticeShown = true;
      G.ui.toast("Controller ready · A select · B back · shoulders change pages", 3.2);
    }

    // The pause menu, the DOM title screen, and the story epilogue all take
    // menu-style controls: A confirms, B backs out, stick/D-pad move the
    // highlight. The DOM screens matter most on TV, where there is no
    // keyboard or pointer to fall back on.
    const menuOpen = !!(G.ui && (G.ui.menuOpen || G.ui.workshopOpen)) ||
      !!G.saveSlotScreenOpen || !!G.storyEndingOpen;
    const wheelOpen = !!(G.ui && G.ui.formWheelOpen);
    const axes = pad.axes || [];
    const left = stickVector(axes[0] || 0, axes[1] || 0, GAMEPAD_DEAD_ZONE);
    const right = stickVector(axes[2] || 0, axes[3] || 0, 0.28);
    const dpadX = (gamepadButton(pad, 15) ? 1 : 0) - (gamepadButton(pad, 14) ? 1 : 0);
    const dpadY = (gamepadButton(pad, 13) ? 1 : 0) - (gamepadButton(pad, 12) ? 1 : 0);

    if (menuOpen) {
      gamepadVec.x = gamepadVec.y = 0;
      // Console menus conventionally reserve the right stick for free
      // scrolling while the left stick/D-pad moves focus item by item.
      menuScrollVec.x = right.x;
      menuScrollVec.y = right.y;
    } else {
      menuScrollVec.x = menuScrollVec.y = 0;
      gamepadVec.x = dpadX || left.x;
      gamepadVec.y = dpadY || left.y;
      const moveLen = Math.sqrt(gamepadVec.x * gamepadVec.x + gamepadVec.y * gamepadVec.y);
      if (moveLen > 1) {
        gamepadVec.x /= moveLen;
        gamepadVec.y /= moveLen;
      }
    }
    controllerAim = !menuOpen && (right.x || right.y)
      ? { btn: controllerAimButton, x: right.x, y: right.y, dragged: true }
      : null;

    // Face buttons follow the labels players see in the HUD. Triggers and
    // bumpers duplicate combat actions so either grip feels comfortable.
    syncGamepadControl("a", gamepadButton(pad, 0), menuOpen || wheelOpen ? "confirm" : "a");
    syncGamepadControl("b", gamepadButton(pad, 1), menuOpen ? "back" : "swap");
    syncGamepadControl("x", gamepadButton(pad, 2), menuOpen || wheelOpen ? null : "b");
    syncGamepadControl("y", gamepadButton(pad, 3), menuOpen || wheelOpen ? null : "c");
    syncGamepadControl("lb", gamepadButton(pad, 4), wheelOpen ? "wheelPrev" : menuOpen ? "pageLeft" : "c", false);
    syncGamepadControl("rb", gamepadButton(pad, 5), wheelOpen ? "wheelNext" : menuOpen ? "pageRight" : "b", false);
    const leftTrigger = gamepadButton(pad, 6, 0.35);
    const rightTrigger = gamepadButton(pad, 7, 0.35);
    const bothTriggers = !menuOpen && !wheelOpen && leftTrigger && rightTrigger;
    if (bothTriggers) ultimateChordLatched = true;
    const suppressChordTriggers = ultimateChordLatched;
    syncGamepadControl("ultimate", bothTriggers, "ultimate");
    syncGamepadControl("lt", leftTrigger && !suppressChordTriggers, menuOpen ? "pageLeft" : wheelOpen ? null : "c", false);
    syncGamepadControl("rt", rightTrigger && !suppressChordTriggers, menuOpen ? "pageRight" : wheelOpen ? "confirm" : "a", false);
    if (!leftTrigger && !rightTrigger) ultimateChordLatched = false;
    syncGamepadControl("view", gamepadButton(pad, 8), menuOpen || wheelOpen ? "back" : "map");
    syncGamepadControl("menu", gamepadButton(pad, 9), wheelOpen ? "back" : "pause");
    syncGamepadControl("leftStick", gamepadButton(pad, 10), menuOpen || wheelOpen ? null : "guide");
    syncGamepadControl("rightStick", gamepadButton(pad, 11), menuOpen || wheelOpen ? null : "a");

    const navUp = gamepadButton(pad, 12) || left.y < -GAMEPAD_NAV_THRESHOLD;
    const navDown = gamepadButton(pad, 13) || left.y > GAMEPAD_NAV_THRESHOLD;
    const navLeft = gamepadButton(pad, 14) || left.x < -GAMEPAD_NAV_THRESHOLD;
    const navRight = gamepadButton(pad, 15) || left.x > GAMEPAD_NAV_THRESHOLD;
    syncGamepadControl("navUp", menuOpen && navUp, "menuUp", true);
    syncGamepadControl("navDown", menuOpen && navDown, "menuDown", true);
    syncGamepadControl("navLeft", menuOpen && navLeft, "menuLeft", true);
    syncGamepadControl("navRight", menuOpen && navRight, "menuRight", true);
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
  // Android TV WebView can report misleading touch capability; the wrapper's
  // UA signal keeps the iPad buttons off the television screen.
  const isTouch = !isTVWrapper && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

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
    const resetAbilityTouches = [];
    for (const [id, btn] of Object.entries(abilityBtns)) {
      const el = document.getElementById(id);
      let pointerId = null, startX = 0, startY = 0;
      const DEAD_ZONE = 12;

      el.addEventListener("pointerdown", (e) => {
        if (pointerId !== null || liveAim !== null) return;
        e.preventDefault();
        pointerId = e.pointerId;
        startX = e.clientX; startY = e.clientY;
        // iPad Safari can reject or later drop capture during multi-touch boss
        // fights. Window/lifecycle fallbacks below remain authoritative.
        try { el.setPointerCapture(e.pointerId); } catch (error) { /* use fallbacks */ }
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
      const resetAim = (fire, e) => {
        if (pointerId === null || (e && e.pointerId !== undefined && e.pointerId !== pointerId)) return;
        if (e && e.cancelable) e.preventDefault();
        const capturedId = pointerId;
        if (fire) {
          releasedAims[btn] = liveAim && liveAim.btn === btn
            ? { x: liveAim.x, y: liveAim.y, dragged: liveAim.dragged }
            : { x: 0, y: 0, dragged: false };
        }
        // Null state before releasing capture because release can dispatch
        // lostpointercapture synchronously in Safari and in the test harness.
        pointerId = null;
        liveAim = null;
        el.classList.remove("held");
        try {
          if (el.hasPointerCapture && el.hasPointerCapture(capturedId))
            el.releasePointerCapture(capturedId);
        } catch (error) { /* capture was already lost */ }
        if (fire) { press(btn); release(btn); }
      };
      resetAbilityTouches.push(() => resetAim(false));
      el.addEventListener("pointerup", (e) => resetAim(true, e));
      el.addEventListener("pointercancel", (e) => resetAim(false, e));
      el.addEventListener("lostpointercapture", (e) => resetAim(false, e));
      // Pointer capture is reliable on current iOS/Android, but this fallback
      // also covers embedded browsers that drop capture during a long drag.
      window.addEventListener("pointerup", (e) => resetAim(true, e));
      window.addEventListener("pointercancel", (e) => resetAim(false, e));
    }

    // A system gesture, rotation, app switch, or fullscreen transition can
    // consume the final pointer event on iOS. Always release the shared aim
    // lock in those cases so one highlighted button cannot disable all attacks.
    const cancelAbilityTouches = () => {
      for (const reset of resetAbilityTouches) reset();
      liveAim = null;
    };
    window.addEventListener("blur", cancelAbilityTouches);
    window.addEventListener("pagehide", cancelAbilityTouches);
    window.addEventListener("orientationchange", cancelAbilityTouches);
    document.addEventListener("fullscreenchange", cancelAbilityTouches);
    document.addEventListener("webkitfullscreenchange", cancelAbilityTouches);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAbilityTouches();
    });
    window.addEventListener("touchend", (e) => {
      if (!e.touches || e.touches.length === 0) cancelAbilityTouches();
    }, { passive: true });
    window.addEventListener("touchcancel", cancelAbilityTouches, { passive: true });

    /* ---------- simple touch buttons fire as soon as they are tapped ---------- */
    const swapButton = document.getElementById("btn-swap");
    if (swapButton) {
      let swapPointerId = null;
      swapButton.addEventListener("pointerdown", (e) => {
        if (swapPointerId !== null) return;
        e.preventDefault();
        swapPointerId = e.pointerId;
        swapButton.classList.add("held");
        try { swapButton.setPointerCapture(e.pointerId); } catch (error) {}
        press("swap", { x: e.clientX, y: e.clientY });
      });
      swapButton.addEventListener("pointermove", (e) => {
        if (e.pointerId !== swapPointerId || !swapLongTriggered || !G.ui || !G.ui.aimFormWheel) return;
        G.ui.aimFormWheel(e.clientX, e.clientY);
      });
      const endSwap = (e, cancelled) => {
        if (swapPointerId === null || (e && e.pointerId !== undefined && e.pointerId !== swapPointerId)) return;
        if (e && e.cancelable) e.preventDefault();
        const id = swapPointerId;
        swapPointerId = null;
        swapButton.classList.remove("held");
        release("swap", cancelled);
        try {
          if (swapButton.hasPointerCapture && swapButton.hasPointerCapture(id)) swapButton.releasePointerCapture(id);
        } catch (error) {}
      };
      swapButton.addEventListener("pointerup", (e) => endSwap(e, false));
      swapButton.addEventListener("pointercancel", (e) => endSwap(e, true));
      swapButton.addEventListener("lostpointercapture", (e) => endSwap(e, true));
      window.addEventListener("pointerup", (e) => endSwap(e, false));
      window.addEventListener("pointercancel", (e) => endSwap(e, true));
      const cancelSwap = () => endSwap(null, true);
      window.addEventListener("blur", cancelSwap);
      window.addEventListener("pagehide", cancelSwap);
      window.addEventListener("orientationchange", cancelSwap);
      document.addEventListener("visibilitychange", () => { if (document.hidden) cancelSwap(); });
    }

    const mapButton = document.getElementById("btn-map");
    if (mapButton) {
      mapButton.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        if (mapTouchHeld) return;
        mapTouchHeld = true;
        mapTouchLongTriggered = false;
        mapTouchPressedAt = inputNow();
        held.map = true;
        mapButton.classList.add("held");
        G.sfx.ensure();
      });
      const endMap = (e, cancelled) => {
        if (!mapTouchHeld) return;
        if (e && e.cancelable) e.preventDefault();
        if (!cancelled && !mapTouchLongTriggered) taps.map = true;
        mapTouchHeld = false;
        held.map = false;
        mapTouchPressedAt = 0;
        mapButton.classList.remove("held");
      };
      mapButton.addEventListener("pointerup", (e) => endMap(e, false));
      mapButton.addEventListener("pointercancel", (e) => endMap(e, true));
      mapButton.addEventListener("lostpointercapture", (e) => endMap(e, true));
      window.addEventListener("blur", () => endMap(null, true));
      window.addEventListener("pagehide", () => endMap(null, true));
      window.addEventListener("orientationchange", () => endMap(null, true));
      document.addEventListener("visibilitychange", () => { if (document.hidden) endMap(null, true); });
    }

    const simpleBtns = { "btn-pause": "pause", "btn-ultimate": "ultimate" };
    for (const [id, btn] of Object.entries(simpleBtns)) {
      const el = document.getElementById(id);
      if (!el) continue;
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

  function updateInput() {
    updateGamepad();
    if (mapTouchHeld && !mapTouchLongTriggered && inputNow() - mapTouchPressedAt >= MAP_HELP_HOLD_MS) {
      mapTouchLongTriggered = !!(G.requestGuidance && G.requestGuidance(false));
      if (mapTouchLongTriggered) taps.map = false;
    }
    if (held.swap && !swapLongTriggered && inputNow() - swapPressedAt >= SWAP_HOLD_MS &&
      G.ui && G.ui.openFormWheel) {
      swapLongTriggered = G.ui.openFormWheel(swapOrigin);
      if (swapLongTriggered) taps.swap = false;
    }
  }

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
    get menuScroll() { return { x: menuScrollVec.x, y: menuScrollVec.y }; },
    clearTaps() {
      for (const k in taps) taps[k] = false;
      for (const k in releasedAims) delete releasedAims[k];
    },
    update: updateInput,
    get hasGamepad() { return gamepadIndex !== null; },
    get gamepadName() { return gamepadName; },
    isTouch,
    isTV: isTVWrapper,
    get tvPadActive() { return virtualPad.connected; },
  };
})();
