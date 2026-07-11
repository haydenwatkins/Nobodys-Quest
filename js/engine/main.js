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
  if (window.visualViewport) window.visualViewport.addEventListener("resize", resize);
  resize();

  document.addEventListener("contextmenu", (e) => e.preventDefault());

  /* ---------- boot ---------- */
  G.validateCrossRefs();
  G.ui.showWorkshop();

  G.state = {
    player: G.makePlayer(),
    formId: "nobody",
    stars: 0,
    items: [],
    opened: [],
    known: [],
    loadouts: {},
    pinnedQuestIds: [],
    town: G.makeTown(),
    shake: 0,
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
    s.loadouts = save.loadouts || {};
    s.pinnedQuestIds = Array.isArray(save.pinnedQuestIds) ? save.pinnedQuestIds.slice(0, 3) : [];
    s.town = G.normalizeTown(save.town || save.cult);
    G.questCounts = save.questCounts || {};
    G.questsDone = save.questsDone || [];
    if (save.formId && G.forms[save.formId] && !G.forms[save.formId].invalid) s.formId = save.formId;
  }
  // if a form file got edited/broken since last save, fall back safely
  if (!G.formUnlocked(G.state.formId)) {
    G.state.formId = G.unlockedForms()[0] || "nobody";
  }

  const startMap = save && G.maps[save.mapId] ? save.mapId : "overworld";
  G.world.load(startMap);
  if (save && save.mapId === startMap && typeof save.px === "number") {
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
    s.time += dt;
    s.shake = Math.max(0, s.shake - dt);

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

    G.drawProjectiles(ctx);
    drawFx();

    ctx.restore();
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
          break;
        }
        // "num" (damage numbers) are drawn by ui.js on the sharp text layer
        case "slash": {
          ctx.strokeStyle = f.color;
          ctx.lineWidth = 2;
          const r = f.range * (0.7 + prog * 0.3);
          ctx.beginPath();
          ctx.arc(f.x, f.y, r, f.angle - f.arc / 2, f.angle + f.arc / 2);
          ctx.stroke();
          break;
        }
        case "ring": {
          ctx.strokeStyle = f.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(f.x, f.y, 3 + prog * 14, 0, Math.PI * 2);
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
