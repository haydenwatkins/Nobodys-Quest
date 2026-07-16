/* ============================================================
   MAIN — boots the game and runs the loop:
   update the world ~60 times a second, draw it, repeat forever.
   ============================================================ */

"use strict";

(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  /* ---------- fit the screen, keep pixels chunky ---------- */
  function resize() {
    // visualViewport tracks the actually visible area on iOS as Safari's
    // address bar expands/collapses.  innerHeight can lag behind it.
    const viewport = window.visualViewport;
    const viewportWidth = viewport ? viewport.width : window.innerWidth;
    const viewportHeight = viewport ? viewport.height : window.innerHeight;
    const wrap = document.getElementById("game-wrap");
    // iOS can move the visible viewport inside a larger layout viewport when
    // its address bars collapse or the phone rotates. Keep both canvases
    // centered in what is actually visible, not in the hidden layout area.
    wrap.style.left = (viewport ? viewport.offsetLeft : 0) + "px";
    wrap.style.top = (viewport ? viewport.offsetTop : 0) + "px";
    wrap.style.right = "auto";
    wrap.style.bottom = "auto";
    wrap.style.width = viewportWidth + "px";
    wrap.style.height = viewportHeight + "px";
    const scaleX = viewportWidth / G.W;
    const scaleY = viewportHeight / G.H;
    let scale = Math.min(scaleX, scaleY);

    // Integer scaling looks best on roomy desktop displays, but rounding a
    // 390px iPhone down from 1.2x to 1x wastes almost a fifth of its screen.
    // Touch screens use all available space and CSS keeps the pixels crisp.
    const roomyDesktop = !G.input.isTouch && viewportWidth > 700 && viewportHeight > 500;
    if (roomyDesktop && scale > 1) scale = Math.floor(scale);
    canvas.style.width = G.W * scale + "px";
    canvas.style.height = G.H * scale + "px";
    G.ui.resizeOverlay(); // keep the sharp text layer aligned on top
  }
  window.addEventListener("resize", resize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", resize);
    window.visualViewport.addEventListener("scroll", resize);
  }
  document.addEventListener("fullscreenchange", resize);
  document.addEventListener("webkitfullscreenchange", resize);
  resize();

  document.addEventListener("contextmenu", (e) => e.preventDefault());

  /* ---------- boot ---------- */
  G.validateCrossRefs();
  G.ui.showWorkshop();
  const localBuilder = location.hostname === "127.0.0.1" || location.hostname === "localhost";
  const builderParams = localBuilder ? new URLSearchParams(location.search) : null;

  G.state = {
    player: G.makePlayer(),
    formId: "nobody",
    stars: 0,
    items: [],
    opened: [],
    known: [],
    claimedForms: [],
    unlockReadyNotified: [],
    loadouts: {},
    pinnedQuestIds: [],
    town: G.makeTown(),
    shake: 0,
    hitStop: 0,
    cameraKickX: 0,
    cameraKickY: 0,
    time: 0,
    entryPoint: { x: 0, y: 0 },
    lastSign: null,
    mapId: null,
  };

  // bring back the save, if there is one
  const save = G.loadSaveData();
  if (save) {
    const s = G.state;
    s.stars = save.stars || 0;
    s.items = save.items || [];
    s.opened = save.opened || [];
    s.known = save.known || [];
    // Saves from before explicit claiming already earned every known form.
    // Preserve that progress instead of asking the player to re-earn it.
    s.claimedForms = Array.isArray(save.claimedForms) ? save.claimedForms : s.known.slice();
    s.claimedForms = s.claimedForms.filter((id) => G.forms[id] && !G.forms[id].start && !G.forms[id].invalid);
    s.unlockReadyNotified = Array.isArray(save.unlockReadyNotified) ? save.unlockReadyNotified : [];
    s.loadouts = save.loadouts || {};
    s.pinnedQuestIds = Array.isArray(save.pinnedQuestIds) ? save.pinnedQuestIds.slice(0, 3) : [];
    s.town = G.normalizeTown(save.town || save.cult);
    G.questCounts = save.questCounts || {};
    G.questsDone = save.questsDone || [];
    if (save.formId && G.forms[save.formId] && !G.forms[save.formId].invalid) s.formId = save.formId;
    s.known = s.known.filter((id) => G.forms[id] && !G.forms[id].invalid);
  }
  const requestedTestForm = builderParams && builderParams.get("playtestForm");
  if (requestedTestForm && G.forms[requestedTestForm] && !G.forms[requestedTestForm].invalid) {
    if (!G.forms[requestedTestForm].start && !G.state.claimedForms.includes(requestedTestForm))
      G.state.claimedForms.push(requestedTestForm);
    G.state.formId = requestedTestForm;
  }
  // if a form file got edited/broken since last save, fall back safely
  if (!G.formUnlocked(G.state.formId)) {
    G.state.formId = G.unlockedForms()[0] || "nobody";
  }

  // Local-only builder shortcut: ?playtestMap=moleTrial jumps directly to an
  // arena without exposing a cheat on the published game.
  const requestedTestMap = builderParams && builderParams.get("playtestMap");
  const startMap = requestedTestMap && G.maps[requestedTestMap]
    ? requestedTestMap
    : save && G.maps[save.mapId] ? save.mapId : "overworld";
  G.world.load(startMap);
  if (requestedTestMap) {
    const trialBoss = G.state.enemies.find((enemy) => enemy.def.miniboss);
    if (trialBoss) {
      G.state.player.x = trialBoss.x - 125;
      G.state.player.y = trialBoss.y;
      G.state.entryPoint = { x: G.state.player.x, y: G.state.player.y };
      // Local-only transition shortcut: start a boss just inside the chosen
      // phase threshold so its intro flows directly into that phase change.
      const requestedPhase = Number(builderParams.get("playtestBossPhase"));
      if (requestedPhase >= 2 && requestedPhase <= (trialBoss.def.boss.phases || 2)) {
        const thresholds = trialBoss.def.boss.phaseThresholds || [0.5];
        trialBoss.hp = Math.floor(trialBoss.def.hp * thresholds[requestedPhase - 2]);
      }
    }
  }
  if (!requestedTestMap && save && save.mapId === startMap && typeof save.px === "number") {
    const safeSavedSpot = typeof save.py === "number" && G.world.isSafeSpawn(save.px, save.py);
    if (safeSavedSpot) {
      G.state.player.x = save.px;
      G.state.player.y = save.py;
      G.state.entryPoint = { x: save.px, y: save.py };
    }
    G.state.player.damageTaken = save.damageTaken || 0;
    G.state.player.mana = typeof save.mana === "number" ? save.mana : 6;
  }

  G.checkUnlocks(); // quietly registers starting forms as "known"
  G.tutorial.init(save);

  /* ---------- the loop ---------- */
  let last = 0;
  let autosaveT = 0;

  function loop(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
    last = ts;

    if (G.input.tapped("pause")) G.ui.toggleMenu();

    if (!G.ui.menuOpen) {
      update(dt);
    } else {
      G.input.clearTaps(); // don't queue up attacks while in the menu
    }

    draw();
    requestAnimationFrame(loop);
  }

  function update(dt) {
    const s = G.state;
    s.shake = Math.max(0, s.shake - dt);
    s.mapReveal = Math.max(0, (s.mapReveal || 0) - dt);
    s.cameraKickX *= Math.pow(0.002, dt);
    s.cameraKickY *= Math.pow(0.002, dt);
    if (Math.abs(s.cameraKickX) < 0.05) s.cameraKickX = 0;
    if (Math.abs(s.cameraKickY) < 0.05) s.cameraKickY = 0;

    // A very short shared impact pause lets the eye register a hit. Input is
    // deliberately not cleared here, so the player never loses a button tap.
    if (s.hitStop > 0) {
      s.hitStop = Math.max(0, s.hitStop - dt);
      G.updateFx(dt * 0.12);
      G.ui.update(dt);
      return;
    }

    // A lost form trial gets a short readable defeat beat before returning
    // the player outside. Reloading the arena on re-entry restores its boss.
    if (s.knockout) {
      s.time += dt;
      G.updateKnockout(dt);
      G.updateFx(dt * 0.35);
      G.ui.update(dt);
      return;
    }

    // First encounters get a tiny story beat. The world pauses, the boss
    // speaks one or two short lines, and any ability button skips after the
    // opening moment so repeat attempts never feel slow.
    if (s.bossCutscene) {
      s.time += dt;
      G.updateBossCutscene(dt);
      G.updateFx(dt * 0.35);
      G.ui.update(dt);
      return;
    }

    s.time += dt;

    G.updatePlayer(dt);
    G.tutorial.update(dt);
    G.updateEnemies(dt);
    G.combat.updateProjectiles(dt);
    G.updatePickups(dt);
    G.updateFx(dt);
    G.ui.update(dt);

    autosaveT += dt;
    if (autosaveT > 6) { autosaveT = 0; G.saveGame(); }
  }

  /* ---------- drawing ---------- */
  function draw() {
    const s = G.state;
    const p = s.player;

    // camera follows the player, clamped to the map edges
    const maxX = Math.max(0, s.mapW * G.TILE - G.W);
    const maxY = Math.max(0, s.mapH * G.TILE - G.H);
    let camX = Math.round(G.util.clamp(p.x - G.W / 2, 0, maxX));
    let camY = Math.round(G.util.clamp(p.y - G.H / 2 - 4, 0, maxY));
    camX += Math.round(s.cameraKickX);
    camY += Math.round(s.cameraKickY);
    if (s.shake > 0) {
      camX += Math.round((Math.random() - 0.5) * s.shake * 10);
      camY += Math.round((Math.random() - 0.5) * s.shake * 10);
    }

    ctx.fillStyle = "#1a1c2c";
    ctx.fillRect(0, 0, G.W, G.H);
    ctx.save();
    ctx.translate(-camX, -camY);

    G.world.draw(ctx, { x: camX, y: camY }, s.time);
    G.drawPickups(ctx);

    // draw everyone in y-order so closer things overlap farther things
    const drawables = s.enemies.filter((e) => !e.dead).map((e) => ({ y: e.y, fn: () => G.drawEnemy(ctx, e) }));
    drawables.push({ y: p.y, fn: () => G.drawPlayer(ctx) });
    drawables.sort((a, b) => a.y - b.y);
    for (const d of drawables) d.fn();

    G.drawAimGuide(ctx);
    G.drawProjectiles(ctx);
    drawFx();

    ctx.restore();
    if (s.mapReveal > 0) {
      ctx.fillStyle = `rgba(26,28,44,${Math.min(1, s.mapReveal / 0.32)})`;
      ctx.fillRect(0, 0, G.W, G.H);
    }
    G.ui.drawHUD({ x: camX, y: camY }); // text/HUD on the sharp overlay
  }

  function drawFx() {
    ctx.font = "7px 'Courier New', monospace";
    ctx.textBaseline = "top";
    for (const f of G.fx) {
      const prog = f.t / f.dur;
      const alpha = 1 - prog;
      ctx.globalAlpha = Math.max(0, alpha);
      switch (f.kind) {
        case "puff": {
          const r = 1 + prog * 5;
          ctx.fillStyle = f.color;
          ctx.fillRect(Math.round(f.x - r / 2), Math.round(f.y - r / 2), Math.round(r), Math.round(r));
          ctx.fillRect(Math.round(f.x - r), Math.round(f.y), 1, 1);
          ctx.fillRect(Math.round(f.x + r), Math.round(f.y - 2), 1, 1);
          ctx.fillRect(Math.round(f.x), Math.round(f.y - r), 1, 1);
          break;
        }
        // "num" (damage numbers) are drawn by ui.js on the sharp text layer
        case "slash": {
          ctx.strokeStyle = f.color;
          ctx.lineWidth = prog < 0.45 ? (f.weight || 3) : 1;
          const r = f.range * (0.7 + prog * 0.3);
          ctx.beginPath();
          ctx.arc(f.x, f.y, r, f.angle - f.arc / 2, f.angle + f.arc / 2);
          ctx.stroke();
          if (prog < 0.55) {
            ctx.globalAlpha = Math.max(0, alpha * 0.8);
            ctx.strokeStyle = "#f4f4f4";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(f.x, f.y, r + 1, f.angle - f.arc / 2, f.angle - f.arc / 7);
            ctx.stroke();
          }
          break;
        }
        case "ring": {
          ctx.strokeStyle = f.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(f.x, f.y, 3 + prog * (f.radius || 14), 0, Math.PI * 2);
          ctx.stroke();
          if (prog < 0.5) {
            ctx.globalAlpha = alpha * 0.55;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(f.x, f.y, 4 + prog * (f.radius || 14), 0, Math.PI * 2);
            ctx.stroke();
          }
          break;
        }
        case "impact": {
          const r = (f.size || 3) * (0.6 + prog * 0.7);
          ctx.strokeStyle = f.color;
          ctx.lineWidth = prog < 0.5 ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(f.x - r, f.y); ctx.lineTo(f.x + r, f.y);
          ctx.moveTo(f.x, f.y - r); ctx.lineTo(f.x, f.y + r);
          ctx.moveTo(f.x - r * 0.7, f.y - r * 0.7); ctx.lineTo(f.x + r * 0.7, f.y + r * 0.7);
          ctx.moveTo(f.x + r * 0.7, f.y - r * 0.7); ctx.lineTo(f.x - r * 0.7, f.y + r * 0.7);
          ctx.stroke();
          ctx.fillStyle = "#f4f4f4";
          ctx.fillRect(Math.round(f.x), Math.round(f.y), 1, 1);
          break;
        }
        case "tell": {
          ctx.strokeStyle = f.color;
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(f.x2, f.y2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = prog < 0.5 ? "#f4f4f4" : f.color;
          ctx.fillRect(Math.round(f.x2 - 1), Math.round(f.y2 - 1), 3, 3);
          break;
        }
        case "bolt": {
          ctx.globalAlpha = alpha * 0.3;
          ctx.strokeStyle = f.color;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(f.x, f.y);
          ctx.lineTo((f.x + f.x2) / 2, (f.y + f.y2) / 2);
          ctx.lineTo(f.x2, f.y2);
          ctx.stroke();
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = f.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(f.x, f.y);
          const mx = (f.x + f.x2) / 2 + Math.sin(f.t * 70) * 3;
          const my = (f.y + f.y2) / 2 + Math.cos(f.t * 55) * 3;
          ctx.lineTo(mx, my);
          ctx.lineTo(f.x2, f.y2);
          ctx.stroke();
          break;
        }
        case "bubble": {
          ctx.fillStyle = f.color;
          ctx.fillRect(Math.round(f.x), Math.round(f.y), 2, 2);
          break;
        }
        case "spark": {
          ctx.fillStyle = f.color;
          const size = prog < 0.55 ? 2 : 1;
          ctx.fillRect(Math.round(f.x), Math.round(f.y), size, size);
          break;
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  requestAnimationFrame(loop);
})();
