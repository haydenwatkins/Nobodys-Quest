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

  // Gap portals are world borders, not doors. Preserve the previous frame and
  // slide it away while the neighboring region is already drawn underneath.
  // The tiny 320x180 buffer is deliberately inexpensive on mobile Safari.
  G.beginWorldTransition = function (mapId, spawn, movement) {
    if (!G.maps[mapId]) return false;
    if (G.reducedMotion) {
      G.world.load(mapId, spawn, { seamless: true });
      return true;
    }
    const snapshot = document.createElement("canvas");
    snapshot.width = G.W;
    snapshot.height = G.H;
    snapshot.getContext("2d").drawImage(canvas, 0, 0);
    const move = movement || { x: 1, y: 0 };
    const horizontal = Math.abs(move.x) >= Math.abs(move.y);
    const direction = horizontal
      ? { x: move.x < 0 ? -1 : 1, y: 0 }
      : { x: 0, y: move.y < 0 ? -1 : 1 };
    G.world.load(mapId, spawn, { seamless: true });
    G.state.zoneTransition = { snapshot, direction, t: 0, duration: 0.58 };
    return true;
  };

  /* ---------- boot ---------- */
  G.validateCrossRefs();
  G.ui.showWorkshop();
  const localBuilder = location.hostname === "127.0.0.1" || location.hostname === "localhost";
  const builderParams = localBuilder ? new URLSearchParams(location.search) : null;

  G.state = {
    player: G.makePlayer(),
    formId: "nobody",
    costumeId: "classic",
    costumesUnlocked: ["classic"],
    stars: 0,
    items: [],
    opened: [],
    pantries: {},
    known: [],
    claimedForms: [],
    unlockReadyNotified: [],
    loadouts: {},
    pinnedQuestIds: [],
    town: G.makeTown(),
    heroBoard: G.makeHeroBoard(),
    wayfinder: G.makeWayfinder(),
    worldwake: G.makeWorldwake(),
    gauntletBest: 0,
    gauntletIronBest: 0,
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
    s.pantries = save.pantries && typeof save.pantries === "object" ? save.pantries : {};
    s.known = save.known || [];
    // Saves from before explicit claiming already earned every known form.
    // Preserve that progress instead of asking the player to re-earn it.
    s.claimedForms = Array.isArray(save.claimedForms) ? save.claimedForms : s.known.slice();
    s.claimedForms = s.claimedForms.filter((id) => G.forms[id] && !G.forms[id].start && !G.forms[id].invalid);
    s.unlockReadyNotified = Array.isArray(save.unlockReadyNotified) ? save.unlockReadyNotified : [];
    s.loadouts = save.loadouts || {};
    const wardrobe = G.normalizeCostumes(save.costumesUnlocked, save.costumeId);
    s.costumeId = wardrobe.selected;
    s.costumesUnlocked = wardrobe.unlocked;
    s.pinnedQuestIds = Array.isArray(save.pinnedQuestIds) ? save.pinnedQuestIds.slice(0, 3) : [];
    s.town = G.normalizeTown(save.town || save.cult);
    s.heroBoard = G.normalizeHeroBoard(save.heroBoard);
    s.wayfinder = G.normalizeWayfinder(save.wayfinder, save);
    s.worldwake = G.normalizeWorldwake(save.worldwake, save);
    s.gauntletBest = save.gauntletBest || 0;
    s.gauntletIronBest = save.gauntletIronBest || 0;
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
  // Local-only endgame builder: exposes reward menus and visuals without
  // putting a progression cheat on the published site.
  if (builderParams && builderParams.get("playtestEndgame") === "1") {
    G.state.items = G.guardianTrophies().concat("guardian-compass");
    G.state.claimedForms = G.formOrder.filter((id) => !G.forms[id].start && !G.forms[id].invalid);
    G.state.known = G.state.claimedForms.slice();
    G.questsDone = G.formOrder.flatMap((id) => (G.forms[id].quests || []).map((quest) => quest.id));
    G.state.stars = 50;
    G.state.town.founded = true;
    G.state.town.residents = 8;
    G.state.town.spirit = 20;
    G.state.wayfinder.discovered = G.wayfinderAllIds();
    G.state.wayfinder.rewardClaimed = true;
    if (!G.state.items.includes("wayfinder-whistle")) G.state.items.push("wayfinder-whistle");
  }
  if (builderParams && builderParams.get("playtestWayfinder") === "early") {
    G.state.wayfinder = G.makeWayfinder();
    G.state.items = G.state.items.filter((item) => item !== "wayfinder-whistle");
    G.state.stars = 4;
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

  G.state.player.manaMax = G.playerMaxMana();
  G.state.player.mana = Math.min(G.state.player.mana, G.state.player.manaMax);
  G.checkGuardianCollectionReward(true); // migrates completed collections from older saves
  if (G.state.wayfinder.rewardClaimed && !G.state.items.includes("wayfinder-whistle"))
    G.state.items.push("wayfinder-whistle");
  G.checkWayfinderCompletion(false); // finishes an inferred complete legacy Journal
  G.checkWorldwakeFavors(true); // migrates expansion rewards without replaying banners
  G.checkCostumeUnlocks(true); // migrates wardrobe rewards earned by older saves
  G.costumeBooting = false;

  G.checkUnlocks(); // quietly registers starting forms as "known"
  G.tutorial.init(save);

  /* ---------- the loop ---------- */
  let last = 0;
  let autosaveT = 0;

  function loop(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
    last = ts;

    // The Gamepad API is polling-based. Read it once at the start of every
    // frame so Steam Link input reaches gameplay and menus without latency.
    G.input.update();

    if (G.input.tapped("pause")) G.ui.toggleMenu();

    if (!G.ui.menuOpen) {
      update(dt);
    } else {
      G.ui.updateControllerMenu();
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

    if (s.zoneTransition) {
      s.time += dt;
      s.zoneTransition.t += dt;
      if (s.zoneTransition.t >= s.zoneTransition.duration) s.zoneTransition = null;
      G.updateFx(dt * 0.4);
      G.ui.update(dt);
      G.input.clearTaps();
      return;
    }

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

    // First encounters get a readable story beat. The world pauses between
    // lines, and an ability button advances instead of discarding the scene.
    if (s.bossCutscene) {
      s.time += dt;
      G.updateBossCutscene(dt);
      G.updateFx(dt * 0.35);
      G.ui.update(dt);
      return;
    }

    if (s.gauntletBetween) {
      s.time += dt;
      G.updateGauntlet(dt);
      G.updateFx(dt * 0.45);
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
    if (G.passives && G.passives.drawFields) G.passives.drawFields(ctx);
    if (G.drawBossHazards) G.drawBossHazards(ctx);
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
    if (s.zoneTransition) {
      const tr = s.zoneTransition;
      const raw = Math.min(1, tr.t / tr.duration);
      const eased = 1 - Math.pow(1 - raw, 3);
      const x = Math.round(-tr.direction.x * eased * G.W);
      const y = Math.round(-tr.direction.y * eased * G.H);
      ctx.drawImage(tr.snapshot, x, y);
      // A narrow bright seam makes the motion read as crossing a boundary,
      // not a camera glitch, without hiding either region.
      ctx.fillStyle = "rgba(255,243,194,0.5)";
      if (tr.direction.x) ctx.fillRect(x + (tr.direction.x > 0 ? G.W - 2 : 0), 0, 2, G.H);
      else ctx.fillRect(0, y + (tr.direction.y > 0 ? G.H - 2 : 0), G.W, 2);
    }
    // Pixel-stepped edge shading adds depth without blurring the art or
    // covering the sharp HTML HUD layered above this canvas.
    ctx.fillStyle = "rgba(26,28,44,0.12)";
    ctx.fillRect(0, 0, G.W, 3);
    ctx.fillRect(0, G.H - 4, G.W, 4);
    ctx.fillRect(0, 0, 4, G.H);
    ctx.fillRect(G.W - 4, 0, 4, G.H);
    ctx.fillStyle = "rgba(26,28,44,0.06)";
    ctx.fillRect(4, 3, G.W - 8, 3);
    ctx.fillRect(4, G.H - 7, G.W - 8, 3);
    ctx.fillRect(4, 6, 3, G.H - 13);
    ctx.fillRect(G.W - 7, 6, 3, G.H - 13);
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
