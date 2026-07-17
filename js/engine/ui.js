/* ============================================================
   UI — hearts, mana, toasts, banners, and the pause menu
   (which is where you switch forms, read quests, and MIX
   abilities between forms).

   HOW TEXT STAYS SHARP: the game world draws on a tiny 320x180
   canvas that gets stretched big (that's what makes the pixels
   chunky). Text stretched like that turns to mush — so all text
   and HUD draw on a SECOND canvas (#ui) that is the full size
   of your screen. Same coordinates, sharp letters.
   ============================================================ */

"use strict";

G.ui = (() => {
  const toasts = [];           // {text, t, dur}
  let bannerData = null;       // {title, sub, t}
  let menuOpen = false;
  let btnCache = "";

  /* ---------- the full-resolution overlay canvas ---------- */
  const uiCanvas = document.getElementById("ui");
  const uiCtx = uiCanvas.getContext("2d");
  let uiScale = 4;

  const FONT_HEAD = '"Press Start 2P", "Courier New", monospace';
  const FONT_BODY = '"VT323", "Courier New", monospace';

  function resizeOverlay() {
    const gameCanvas = document.getElementById("game");
    const rect = gameCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    uiCanvas.width = Math.max(1, Math.round(rect.width * dpr));
    uiCanvas.height = Math.max(1, Math.round(rect.height * dpr));
    uiCanvas.style.left = rect.left + "px";
    uiCanvas.style.top = rect.top + "px";
    uiCanvas.style.width = rect.width + "px";
    uiCanvas.style.height = rect.height + "px";
    uiScale = uiCanvas.width / G.W;
  }

  /* ---------- toasts & banners ---------- */
  function toast(text, dur) {
    // don't stack the exact same message
    if (toasts.length && toasts[toasts.length - 1].text === text) return;
    toasts.push({ text, t: 0, dur: dur || 2 });
    if (toasts.length > 3) toasts.shift();
  }

  function banner(title, sub) {
    bannerData = { title, sub: sub || "", t: 0 };
  }

  function update(dt) {
    for (let i = toasts.length - 1; i >= 0; i--) {
      toasts[i].t += dt;
      if (toasts[i].t > toasts[i].dur) toasts.splice(i, 1);
    }
    if (bannerData) {
      bannerData.t += dt;
      if (bannerData.t > 3.2) bannerData = null;
    }
    syncButtons();
  }

  function wrapText(c, text, maxW) {
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (c.measureText(test).width > maxW && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function fitText(c, text, maxW) {
    if (c.measureText(text).width <= maxW) return text;
    let out = text;
    while (out.length > 4 && c.measureText(out + "…").width > maxW) out = out.slice(0, -1);
    return out + "…";
  }

  function drawLocationChip(c) {
    if (G.input.isTouch) return;
    const s = G.state;
    const name = s.mapDef && s.mapDef.name ? s.mapDef.name : s.mapId;
    c.font = `6px ${FONT_HEAD}`;
    const enemies = s.enemies.filter((e) => !e.dead).length;
    const label = `${name}  enemies:${enemies}`;
    const w = c.measureText(label).width + 8;
    c.fillStyle = "rgba(26,28,44,0.72)";
    c.fillRect(Math.round(G.W / 2 - w / 2), 5, w, 11);
    c.fillStyle = "#c8d8e0";
    c.fillText(label, Math.round(G.W / 2 - w / 2) + 4, 8);
  }

  function drawAbilityBar(c, p) {
    if (G.input.isTouch) return;
    const lo = G.getLoadout(G.state.formId);
    const labels = ["A", "B", "C"];
    c.font = `6px ${FONT_HEAD}`;
    for (let i = 0; i < 3; i++) {
      const ab = G.abilities[lo[i]];
      const x = 6 + i * 34;
      const y = G.H - 20;
      c.fillStyle = "rgba(26,28,44,0.72)";
      c.fillRect(x, y, 29, 15);
      c.fillStyle = "#566c86";
      c.fillRect(x, y, 29, 1);
      c.fillRect(x, y + 14, 29, 1);
      c.fillRect(x, y, 1, 15);
      c.fillRect(x + 28, y, 1, 15);
      c.fillStyle = "#ffcd75";
      c.fillText(labels[i], x + 3, y + 5);
      if (!ab) {
        c.fillStyle = "#94b0c2";
        c.fillText("-", x + 17, y + 5);
        continue;
      }
      const ready = (p.cooldowns[lo[i]] || 0) <= 0 && ab.mana <= p.mana;
      c.fillStyle = ready ? "#f4f4f4" : "#566c86";
      c.fillText(ab.icon || "*", x + 16, y + 5);
      if (!ready) {
        const cd = Math.max(p.cooldowns[lo[i]] || 0, ab.mana > p.mana ? 1 : 0);
        c.fillStyle = "rgba(26,28,44,0.75)";
        c.fillRect(x + 1, y + 1, 27, Math.min(13, Math.ceil(cd / Math.max(0.1, ab.cooldown || 1) * 13)));
      }
    }
  }

  function drawMinimap(c) {
    if (G.input.isTouch) return;
    const s = G.state;
    if (!s.grid || s.mapW <= 0 || s.mapH <= 0) return;
    const w = 62;
    const h = 42;
    const x0 = G.W - w - 5;
    const y0 = 21;
    const step = Math.max(1, Math.ceil(Math.max(s.mapW / (w - 4), s.mapH / (h - 4))));
    const sx = (w - 4) / s.mapW;
    const sy = (h - 4) / s.mapH;

    c.fillStyle = "rgba(26,28,44,0.78)";
    c.fillRect(x0, y0, w, h);
    c.fillStyle = "#566c86";
    c.fillRect(x0, y0, w, 1);
    c.fillRect(x0, y0 + h - 1, w, 1);
    c.fillRect(x0, y0, 1, h);
    c.fillRect(x0 + w - 1, y0, 1, h);

    for (let y = 0; y < s.mapH; y += step) {
      for (let x = 0; x < s.mapW; x += step) {
        const cell = s.grid[y][x];
        if (cell.portal) c.fillStyle = cell.stars && s.stars < cell.stars ? "#6b4a2b" : "#ffcd75";
        else if (cell.tile === "tree") c.fillStyle = "#257179";
        else if (cell.tile === "water") c.fillStyle = "#3b5dc9";
        else if (cell.tile === "wall" || cell.tile === "rock") c.fillStyle = "#566c86";
        else if (cell.tile === "floor") c.fillStyle = "#4a5b74";
        else c.fillStyle = "#38b764";
        c.fillRect(x0 + 2 + Math.floor(x * sx), y0 + 2 + Math.floor(y * sy), Math.max(1, Math.ceil(step * sx)), Math.max(1, Math.ceil(step * sy)));
      }
    }

    c.fillStyle = "#b13e53";
    for (const e of s.enemies) {
      if (e.dead) continue;
      c.fillRect(x0 + 2 + Math.floor((e.x / G.TILE) * sx), y0 + 2 + Math.floor((e.y / G.TILE) * sy), 2, 2);
    }
    c.fillStyle = "#f4f4f4";
    c.fillRect(x0 + 1 + Math.floor((s.player.x / G.TILE) * sx), y0 + 1 + Math.floor((s.player.y / G.TILE) * sy), 3, 3);
  }

  function drawQuestTracker(c) {
    const pins = G.pinnedQuests();
    if (!pins.length) return;
    const boxW = 108;
    const x = G.W - boxW - 5;
    const lineH = 9;
    const y = G.input.isTouch ? 45 : 67;

    c.fillStyle = "rgba(26,28,44,0.78)";
    c.fillRect(x, y, boxW, 7 + pins.length * lineH);
    c.fillStyle = "#ffcd75";
    c.fillRect(x, y, boxW, 1);
    c.font = `4px ${FONT_HEAD}`;
    c.fillText("PINNED QUESTS", x + 3, y + 2);

    c.font = `7px ${FONT_BODY}`;
    pins.forEach(({ form, quest }, i) => {
      const done = G.questsDone.includes(quest.id);
      const progress = G.questProgress(quest);
      const suffix = done ? "✓" : `${progress}/${quest.count}`;
      const suffixW = c.measureText(suffix).width;
      const label = fitText(c, `${form.icon} ${quest.text}`, boxW - suffixW - 10);
      const rowY = y + 7 + i * lineH;
      c.fillStyle = done ? "#a7f070" : "#f4f4f4";
      c.fillText(label, x + 3, rowY);
      c.fillStyle = done ? "#a7f070" : "#ffcd75";
      c.fillText(suffix, x + boxW - suffixW - 3, rowY);
    });
  }

  function drawTutorial(c) {
    const prompt = G.tutorial && G.tutorial.prompt();
    if (!prompt) return;
    const touch = G.input.isTouch;
    const boxW = touch ? 158 : 184;
    const boxH = touch ? 20 : 24;
    const x = touch ? 5 : Math.round((G.W - boxW) / 2);
    const y = touch ? 38 : G.H - boxH - 26;
    c.fillStyle = "rgba(26,28,44,0.9)";
    c.fillRect(x, y, boxW, boxH);
    c.fillStyle = "#73eff7";
    c.fillRect(x, y, boxW, 1);
    c.font = `${touch ? 5 : 6}px ${FONT_HEAD}`;
    c.fillStyle = "#73eff7";
    c.fillText(prompt.title, x + 5, y + 4);
    c.font = `${touch ? 8 : 9}px ${FONT_BODY}`;
    c.fillStyle = "#f4f4f4";
    c.fillText(fitText(c, prompt.text, boxW - 10), x + 5, y + (touch ? 10 : 12));
  }

  function drawWardHint(c, cam) {
    const p = G.state.player;
    let nearest = null;
    let nearestDist = Infinity;
    for (const enemy of G.state.enemies) {
      if (enemy.dead || !enemy.ward || enemy.ward.hp <= 0) continue;
      const dist = G.util.dist(p.x, p.y, enemy.x, enemy.y);
      if (dist < 115 && dist < nearestDist) {
        nearest = enemy;
        nearestDist = dist;
      }
    }
    if (!nearest) return;
    const type = G.DAMAGE_TYPES[nearest.ward.types[0]];
    const label = `${type.icon} ${type.name.toUpperCase()}`;
    c.font = `7px ${FONT_BODY}`;
    const w = c.measureText(label).width + 6;
    const x = Math.round(G.util.clamp(nearest.x - cam.x - w / 2, 2, G.W - w - 2));
    const y = Math.round(G.util.clamp(nearest.y - cam.y - nearest.def.size - 18, 2, G.H - 12));
    c.fillStyle = "rgba(26,28,44,0.85)";
    c.fillRect(x, y, w, 10);
    c.fillStyle = type.color;
    c.fillRect(x, y, 2, 10);
    c.fillText(label, x + 4, y + 1);
  }

  function drawBossBar(c) {
    const boss = G.state.enemies.find((enemy) => enemy.def.miniboss && enemy.bossEngaged && !enemy.dead);
    if (!boss) return false;
    const w = 150;
    const x = Math.round((G.W - w) / 2);
    const y = 4;
    const color = (boss.def.boss && boss.def.boss.color) || "#ffcd75";
    const phaseLabel = ["I", "II", "III"][boss.bossPhase - 1] || String(boss.bossPhase);
    const round = G.state.gauntletRun
      ? ` · ${Math.min(G.state.gauntletRun.index + 1, G.state.gauntletRun.bosses.length)}/${G.state.gauntletRun.bosses.length}`
      : "";
    const label = `${boss.def.name.toUpperCase()}  ${phaseLabel}${round}`;
    const frac = Math.max(0, boss.hp / boss.def.hp);

    c.fillStyle = "rgba(26,28,44,0.88)";
    c.fillRect(x, y, w, 17);
    c.fillStyle = color;
    c.fillRect(x, y, w, 1);
    c.font = `5px ${FONT_HEAD}`;
    c.fillStyle = "#f4f4f4";
    const labelW = c.measureText(label).width;
    c.fillText(label, Math.round(G.W / 2 - labelW / 2), y + 3);
    c.fillStyle = "#333c57";
    c.fillRect(x + 5, y + 11, w - 10, 3);
    c.fillStyle = boss.bossPhase >= 2 ? "#b13e53" : color;
    c.fillRect(x + 5, y + 11, Math.round((w - 10) * frac), 3);
    const staggerFrac = boss.bossStaggerT > 0
      ? 1
      : Math.max(0, (boss.bossStagger || 0) / G.BOSS_STAGGER_HITS);
    c.fillStyle = "#333c57";
    c.fillRect(x + 5, y + 15, w - 10, 1);
    if (staggerFrac > 0) {
      c.fillStyle = boss.bossStaggerT > 0 ? "#fff3c2" : "#ffcd75";
      c.fillRect(x + 5, y + 15, Math.round((w - 10) * staggerFrac), 1);
    }
    return true;
  }

  /* ---------- the on-screen HUD ---------- */
  function drawHUD(cam) {
    const c = uiCtx;
    // Work in the same 320x180 coordinates as the game world —
    // the transform blows it up to full screen resolution.
    c.setTransform(uiScale, 0, 0, uiScale, 0, 0);
    c.clearRect(0, 0, G.W, G.H);
    c.textBaseline = "top";

    const p = G.state.player;
    const form = G.playerForm();

    /* floating damage numbers (world things, drawn sharp up here) */
    c.font = `5px ${FONT_HEAD}`;
    for (const f of G.fx) {
      if (f.kind !== "num") continue;
      c.globalAlpha = Math.max(0, 1 - f.t / f.dur);
      const sx = f.x - cam.x - c.measureText(f.text).width / 2;
      const sy = f.y - cam.y;
      c.fillStyle = "#1a1c2c";
      c.fillText(f.text, sx + 0.7, sy + 0.7);
      c.fillStyle = f.color;
      c.fillText(f.text, sx, sy);
      c.globalAlpha = 1;
    }

    /* hearts */
    const maxH = G.playerMaxHearts();
    const hp = G.playerHp();
    for (let i = 0; i < maxH; i++) {
      const x = 6 + i * 9, y = 6;
      c.fillStyle = i < hp ? "#b13e53" : "#333c57";
      c.fillRect(x, y + 1, 3, 3);
      c.fillRect(x + 4, y + 1, 3, 3);
      c.fillRect(x + 1, y + 3, 5, 3);
      c.fillRect(x + 2, y + 5, 3, 2);
      if (i < hp) { c.fillStyle = "#f4f4f4"; c.fillRect(x + 1, y + 2, 1, 1); }
    }

    /* mana bar */
    c.fillStyle = "#1a1c2c";
    c.fillRect(6, 16, 42, 5);
    const manaW = Math.round(40 * (p.mana / p.manaMax));
    c.fillStyle = "#29366f";
    c.fillRect(7, 17, 40, 3);
    c.fillStyle = "#41a6f6";
    c.fillRect(7, 17, manaW, 3);
    if (p.mana < p.manaMax && p.manaRegenDelay <= 0) {
      const pulse = 0.45 + 0.45 * Math.sin(G.state.time * 8);
      c.fillStyle = `rgba(115,239,247,${pulse})`;
      c.fillRect(Math.min(46, 7 + manaW), 17, 1, 3);
    }

    /* current form chip */
    c.font = `6px ${FONT_HEAD}`;
    const label = `${form.icon} ${form.name} Lv${G.formLevel(form.id)}`;
    const chipW = c.measureText(label).width + 6;
    c.fillStyle = "rgba(26,28,44,0.65)";
    c.fillRect(5, 24, chipW, 11);
    c.fillStyle = "#f4f4f4";
    c.fillText(label, 8, 27);

    if (!drawBossBar(c)) drawLocationChip(c);

    /* stars (top right) */
    const starTxt = `⭐${G.state.stars}`;
    const sw = c.measureText(starTxt).width + 6;
    c.fillStyle = "rgba(26,28,44,0.65)";
    c.fillRect(G.W - sw - 4, 5, sw, 11);
    c.fillStyle = "#ffcd75";
    c.fillText(starTxt, G.W - sw - 1, 8);

    if (!G.state.bossCutscene) {
      drawMinimap(c);
      drawQuestTracker(c);
      drawWardHint(c, cam);
      drawTutorial(c);
      drawAbilityBar(c, p);
    }

    /* toasts (word-wrapped so long messages fit) */
    c.font = `9px ${FONT_BODY}`;
    let ty = G.input.isTouch ? 5 : (G.pinnedQuests().length ? 105 : 67);
    for (const t of G.state.bossCutscene ? [] : toasts) {
      const alpha = t.t > t.dur - 0.3 ? (t.dur - t.t) / 0.3 : 1;
      c.globalAlpha = Math.max(0, alpha) * 0.95;
      for (const line of wrapText(c, t.text, G.W - 40)) {
        const w = c.measureText(line).width + 8;
        c.fillStyle = "#1a1c2c";
        c.fillRect(Math.round(G.W / 2 - w / 2), ty, w, 11);
        c.fillStyle = "#f4f4f4";
        c.fillText(line, Math.round(G.W / 2 - w / 2) + 4, ty + 1);
        ty += 12;
      }
      c.globalAlpha = 1;
      ty += 2;
    }

    /* banner (quest done / new form!) */
    if (bannerData) {
      const b = bannerData;
      const alpha = b.t < 0.2 ? b.t / 0.2 : b.t > 2.7 ? (3.2 - b.t) / 0.5 : 1;
      c.globalAlpha = Math.max(0, alpha);

      c.font = `8px ${FONT_HEAD}`;
      const titleLines = wrapText(c, b.title, G.W - 24);
      c.font = `10px ${FONT_BODY}`;
      const subLines = b.sub ? wrapText(c, b.sub, G.W - 24) : [];
      const boxH = 10 + titleLines.length * 12 + subLines.length * 10;
      const boxY = Math.round((G.H - boxH) / 2 - 12);

      c.fillStyle = "rgba(26,28,44,0.88)";
      c.fillRect(0, boxY, G.W, boxH);
      c.fillStyle = "#ffcd75";
      c.fillRect(0, boxY, G.W, 1);
      c.fillRect(0, boxY + boxH - 1, G.W, 1);

      let by = boxY + 6;
      c.font = `8px ${FONT_HEAD}`;
      c.fillStyle = "#ffcd75";
      for (const line of titleLines) {
        c.fillText(line, Math.round(G.W / 2 - c.measureText(line).width / 2), by);
        by += 12;
      }
      c.font = `10px ${FONT_BODY}`;
      c.fillStyle = "#c8d8e0";
      for (const line of subLines) {
        c.fillText(line, Math.round(G.W / 2 - c.measureText(line).width / 2), by);
        by += 10;
      }
      c.globalAlpha = 1;
    }
    if (G.state.bossCutscene) {
      const skip = "TAP AN ABILITY FOR NEXT";
      c.font = `5px ${FONT_HEAD}`;
      const skipW = c.measureText(skip).width;
      c.fillStyle = "rgba(26,28,44,0.8)";
      c.fillRect(Math.round(G.W / 2 - skipW / 2 - 4), G.H - 17, skipW + 8, 10);
      c.fillStyle = "#94b0c2";
      c.fillText(skip, Math.round(G.W / 2 - skipW / 2), G.H - 14);
    }
  }

  /* ---------- keep touch buttons showing the right icons ---------- */
  function syncButtons() {
    if (!G.input.isTouch || !G.state) return;
    const lo = G.getLoadout(G.state.formId);
    const p = G.state.player;
    const ids = ["btn-a", "btn-b", "btn-c"];
    let sig = "";
    const labels = ids.map((elId, i) => {
      const ab = G.abilities[lo[i]];
      if (!ab) return "·";
      const ready = (p.cooldowns[lo[i]] || 0) <= 0 && ab.mana <= p.mana;
      sig += lo[i] + ready;
      return ab.icon;
    });
    if (sig === btnCache) return;
    btnCache = sig;
    labels.forEach((txt, i) => {
      const el = document.getElementById(ids[i]);
      el.textContent = txt;
      const ab = G.abilities[lo[i]];
      el.style.opacity = ab && (ab.mana > p.mana) ? 0.4 : 1;
    });
  }

  /* ---------- pause menu ---------- */
  const menuEl = document.getElementById("menu");

  function dmgChip(type) {
    const t = G.DAMAGE_TYPES[type];
    return `<span class="dmg-chip" style="background:${t.color}">${t.name}</span>`;
  }

  function abilityLabel(id) {
    const ab = G.abilities[id];
    if (!ab) return id;
    return `${ab.icon} ${ab.name} (${G.DAMAGE_TYPES[ab.type].name}${ab.mana ? ", " + ab.mana + " mana" : ""})`;
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;",
    }[ch]));
  }

  let activeTab = "forms";

  function openMenu() {
    menuOpen = true;
    buildMenu();
    menuEl.classList.remove("hidden");
    menuEl.scrollTop = 0;
    G.events.emit("menuOpen", {});
  }
  function closeMenu() {
    menuOpen = false;
    menuEl.classList.add("hidden");
    G.input.clearTaps();
  }
  function toggleMenu() { menuOpen ? closeMenu() : openMenu(); }

  async function enterFullscreen() {
    // Close immediately so the button never leaves a large menu covering the
    // game while Android enters fullscreen or iOS shows its fallback tip.
    closeMenu();
    const alreadyStandalone = window.matchMedia && window.matchMedia("(display-mode: fullscreen)").matches;
    if (document.fullscreenElement || navigator.standalone || alreadyStandalone) {
      toast("Already running full screen", 2);
      return;
    }

    const root = document.documentElement;
    const request = root.requestFullscreen || root.webkitRequestFullscreen;
    if (!request) {
      toast("iPad: Share → Add to Home Screen for full screen", 4);
      return;
    }

    try {
      await request.call(root);
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock("landscape").catch(() => {});
      }
    } catch (error) {
      toast("Use Share → Add to Home Screen for full screen", 4);
    }
  }

  function buildMenu() {
    const tabs = [
      ["forms", "Forms"],
      ["style", "Style"],
      ["quests", "Quests"],
      ["explore", "Explore"],
      ["mix", "Mix"],
    ];
    if (G.townUnlocked && G.townUnlocked()) tabs.push(["town", "Town"]);
    if (G.gauntletUnlocked && G.gauntletUnlocked()) tabs.push(["gauntlet", "Gauntlet"]);
    if (G.heroBoardUnlocked && G.heroBoardUnlocked()) tabs.push(["board", "Hero Board"]);
    if (activeTab === "town" && !(G.townUnlocked && G.townUnlocked())) activeTab = "forms";
    if (activeTab === "gauntlet" && !(G.gauntletUnlocked && G.gauntletUnlocked())) activeTab = "forms";
    if (activeTab === "board" && !(G.heroBoardUnlocked && G.heroBoardUnlocked())) activeTab = "forms";
    let html = `<h1>Nobody's Quest</h1>
      <div class="stars">⭐ ${G.state.stars} stars</div>
      <div class="menu-tabs">${tabs.map(([id, label]) =>
        `<button data-tab="${id}" class="${activeTab === id ? "active" : ""}">${label}</button>`).join("")}
      </div>
      <div class="menu-body">`;

    if (activeTab === "forms") html += buildFormsTab();
    if (activeTab === "style") html += buildCostumesTab();
    if (activeTab === "quests") html += buildQuestsTab();
    if (activeTab === "explore") html += buildWayfinderTab();
    if (activeTab === "mix") html += buildMixTab();
    if (activeTab === "town") html += buildTownTab();
    if (activeTab === "gauntlet") html += buildGauntletTab();
    if (activeTab === "board") html += buildHeroBoardTab();

    html += `</div>
      <div class="menu-footer">
        <button data-act="resume">▶ Resume</button>
        <button data-act="fullscreen" class="fullscreen-btn">⛶ Fullscreen</button>
        <button data-act="reset" class="danger" title="Erase this device's save">Reset</button>
      </div>`;

    menuEl.innerHTML = html;

    // wire up clicks
    menuEl.querySelectorAll("[data-tab]").forEach((b) =>
      b.addEventListener("click", () => { activeTab = b.dataset.tab; buildMenu(); menuEl.scrollTop = 0; }));
    menuEl.querySelectorAll("[data-pin]").forEach((b) =>
      b.addEventListener("click", () => { G.toggleQuestPin(b.dataset.pin); buildMenu(); }));
    const clearPins = menuEl.querySelector('[data-act="clear-pins"]');
    if (clearPins) clearPins.addEventListener("click", () => { G.clearQuestPins(); buildMenu(); });
    menuEl.querySelectorAll("[data-become]").forEach((b) =>
      b.addEventListener("click", () => { G.setForm(b.dataset.become); buildMenu(); }));
    menuEl.querySelectorAll("[data-claim]").forEach((b) =>
      b.addEventListener("click", () => { G.claimForm(b.dataset.claim); buildMenu(); }));
    menuEl.querySelectorAll("[data-costume]").forEach((b) =>
      b.addEventListener("click", () => { G.selectCostume(b.dataset.costume); buildMenu(); }));
    menuEl.querySelectorAll("select[data-slot]").forEach((sel) =>
      sel.addEventListener("change", () => {
        const lo = G.getLoadout(G.state.formId);
        lo[parseInt(sel.dataset.slot, 10)] = sel.value;
        btnCache = "";
        G.saveGame();
      }));
    const foundTown = menuEl.querySelector('[data-act="found-town"]');
    if (foundTown) foundTown.addEventListener("click", () => {
      const town = G.ensureTown();
      const name = prompt("Name your town:", town.name || "Sunrise Town");
      G.foundTown(name || town.name);
      buildMenu();
    });
    const renameTown = menuEl.querySelector('[data-act="rename-town"]');
    if (renameTown) renameTown.addEventListener("click", () => {
      const town = G.ensureTown();
      const name = prompt("Rename your town:", town.name);
      if (name) G.renameTown(name);
      buildMenu();
    });
    const festival = menuEl.querySelector('[data-act="festival"]');
    if (festival) festival.addEventListener("click", () => {
      G.holdTownFestival();
      buildMenu();
    });
    const visitTown = menuEl.querySelector('[data-act="visit-town"]');
    if (visitTown) visitTown.addEventListener("click", () => {
      G.world.load("town", { x: 15, y: 14 });
      G.saveGame();
      closeMenu();
    });
    const startGauntlet = menuEl.querySelector('[data-act="start-gauntlet"]');
    if (startGauntlet) startGauntlet.addEventListener("click", () => {
      const count = menuEl.querySelector('[data-gauntlet-count]').value;
      const recovery = menuEl.querySelector('[data-gauntlet-recovery]').checked;
      if (G.startGauntlet(count, recovery)) closeMenu();
    });
    const acceptContract = menuEl.querySelector('[data-act="accept-contract"]');
    if (acceptContract) acceptContract.addEventListener("click", () => {
      G.startHeroContract();
      buildMenu();
    });
    menuEl.querySelectorAll("[data-travel-region]").forEach((button) =>
      button.addEventListener("click", () => {
        if (G.travelToWayfinderRegion(button.dataset.travelRegion)) closeMenu();
      }));
    const resume = menuEl.querySelector('[data-act="resume"]');
    if (resume) resume.addEventListener("click", closeMenu);
    const fullscreen = menuEl.querySelector('[data-act="fullscreen"]');
    if (fullscreen) fullscreen.addEventListener("click", enterFullscreen);
    const reset = menuEl.querySelector('[data-act="reset"]');
    if (reset) reset.addEventListener("click", () => {
      if (confirm("Really erase the save and start over?")) G.resetSave();
    });
  }

  function buildCostumesTab() {
    const wardrobe = G.ensureCostumes();
    const selected = G.costumeById(wardrobe.selected);
    let html = `<div class="form-card wardrobe-intro">
      <h2>🧵 Wardrobe · ${selected.icon} ${selected.name}</h2>
      <div class="tagline">One outfit dresses every form — including forms added later.</div>
      <div class="cosmetic-note">Cosmetic only: outfits never change health, speed, damage, or difficulty.</div>
    </div>`;
    for (const costume of G.COSTUMES) {
      const unlocked = wardrobe.unlocked.includes(costume.id);
      const wearing = wardrobe.selected === costume.id;
      const swatches = costume.swatches.map((color) =>
        `<span class="costume-swatch" style="background:${color}"></span>`).join("");
      html += `<div class="form-card costume-card ${wearing ? "current" : ""} ${unlocked ? "" : "locked"}">
        <div class="costume-heading">
          <h2>${costume.icon} ${costume.name}${wearing ? ` <span class="wearing-label">WEARING</span>` : ""}</h2>
          <span class="costume-swatches" aria-label="Costume colors">${swatches}</span>
        </div>
        <div class="tagline">${costume.tagline}</div>
        ${unlocked
          ? `<button data-costume="${costume.id}" ${wearing ? "disabled" : ""}>${wearing ? "Equipped" : "Wear on every form"}</button>`
          : `<div class="unlock-progress">🔒 ${costume.hint}</div>`}
      </div>`;
    }
    return html;
  }

  function buildFormsTab() {
    let html = "";
    for (const id of G.formOrder) {
      const f = G.forms[id];
      if (f.invalid) continue;
      const unlocked = G.formUnlocked(id);
      const ready = G.formReady(id);
      const current = id === G.state.formId;
      if (unlocked) {
        html += `<div class="form-card ${current ? "current" : ""}">
          <h2>${f.icon} ${f.name} <span class="lvl">Lv${G.formLevel(id)}</span></h2>
          <div class="tagline">${f.tagline}</div>
          <div>❤️ ${f.hearts} &nbsp; 👟 ${f.speed} &nbsp; ${dmgChip(G.abilities[f.basic] ? G.abilities[f.basic].type : "blunt")}</div>
          <button data-become="${id}" ${current ? "disabled" : ""}>${current ? "You are this!" : "Become " + f.name}</button>
        </div>`;
      } else if (ready) {
        html += `<div class="form-card ready">
          <h2>${f.icon} ${f.name} <span class="ready-label">CHALLENGE COMPLETE</span></h2>
          <div class="tagline">${f.tagline}</div>
          <div class="unlock-progress">${G.unlockHint(id)}</div>
          <button data-claim="${id}">Claim ${f.name}</button>
        </div>`;
      } else {
        html += `<div class="form-card locked">
          <h2>❓ ???</h2>
          <div class="tagline">Form challenge</div>
          <div class="unlock-progress">${G.unlockHint(id)}</div>
        </div>`;
      }
    }
    return html;
  }

  function buildQuestsTab() {
    const pins = G.pinnedQuests();
    let html = pins.length ? `<div class="form-card pin-summary">
      <h2>📌 ${pins.length} quest${pins.length === 1 ? "" : "s"} on the HUD</h2>
      <button data-act="clear-pins" class="clear-pins">✕ Unpin all</button>
    </div>` : "";
    for (const id of G.unlockedForms()) {
      const f = G.forms[id];
      html += `<div class="form-card"><h2>${f.icon} ${f.name} <span class="lvl">Lv${G.formLevel(id)}</span></h2>`;
      for (const q of f.quests) {
        const prog = G.questProgress(q);
        const done = G.questsDone.includes(q.id);
        html += `<div class="quest-row ${done ? "done" : ""}">
          <span>${done ? "✅" : "⬜"} ${q.text}</span>
          <span class="quest-actions">
            <span class="prog">${done ? "⭐" : prog + "/" + q.count}</span>
            ${done ? "" : `<button data-pin="${q.id}" class="pin-btn ${G.isQuestPinned(q.id) ? "pinned" : ""}">${G.isQuestPinned(q.id) ? "✕ UNPIN" : "PIN"}</button>`}
          </span>
        </div>`;
      }
      html += `</div>`;
    }
    const bosses = Object.values(G.enemies).filter((enemy) => enemy.miniboss);
    if (bosses.length) {
      const found = bosses.filter((enemy) => (G.state.items || []).includes(enemy.trophy)).length;
      html += `<div class="form-card trophy-card"><h2>🏆 Miniboss trophies ${found}/${bosses.length}</h2>`;
      for (const boss of bosses) {
        const collected = (G.state.items || []).includes(boss.trophy);
        html += `<div class="quest-row ${collected ? "done" : ""}">
          <span>${collected ? "✅ " + boss.trophyName : "⬜ ???"}</span>
          <span class="trophy-place">${boss.location}</span>
        </div>`;
      }
      if (found === bosses.length) {
        html += `<div class="quest-row done"><span>🧭 Guardian Compass</span><span class="prog">Hero Board unlocked</span></div>`;
      } else {
        html += `<div class="tagline">Collect every trophy to earn the Guardian Compass, bonus stars, town spirit, and repeatable Hero Board contracts.</div>`;
      }
      html += `</div>`;
    }
    html += `<div style="text-align:center;color:#94b0c2;font-size:18px;margin-top:8px">
      Quests count no matter which form you're wearing — mix abilities to finish them faster!</div>`;
    return html;
  }

  function buildMixTab() {
    const fid = G.state.formId;
    const f = G.forms[fid];
    const lo = G.getLoadout(fid);
    const avail = G.availableAbilities();
    const letters = ["A", "B", "C"];

    let html = `<div class="form-card current"><h2>${f.icon} ${f.name}'s moves</h2>
      <div class="tagline">Slot A is ${f.name}'s own attack. B and C can hold ANY ability you've unlocked — from any form!</div>`;
    html += `<div class="slot-row"><span class="slot-label">A (basic)</span><span class="fixed">${abilityLabel(lo[0])}</span></div>`;
    for (let s = 1; s <= f.slots; s++) {
      html += `<div class="slot-row"><span class="slot-label">${letters[s]}</span>
        <select data-slot="${s}">
          ${avail.map((id) => `<option value="${id}" ${lo[s] === id ? "selected" : ""}>${abilityLabel(id)}</option>`).join("")}
        </select></div>`;
    }
    html += `</div>`;

    html += `<div class="form-card"><h2>🧪 Your ability collection</h2>` +
      avail.map((id) => `<div class="quest-row"><span>${abilityLabel(id)}</span></div>`).join("") +
      `</div>`;
    return html;
  }

  function buildWayfinderTab() {
    const progress = G.wayfinderProgress();
    const journal = G.ensureWayfinder();
    const travelUnlocked = G.wayfinderTravelUnlocked();
    const canTravel = G.canWayfinderTravel();
    let html = `<div class="form-card current">
      <h2>🧭 The Long Way Around</h2>
      <div class="tagline">Discover every major region. Unknown entries give directions without revealing the destination.</div>
      <div class="quest-row"><span>Major regions</span><span class="prog">${progress.found}/${progress.total}</span></div>
      <div class="quest-row"><span>Hidden landmarks</span><span class="prog">${progress.landmarksFound}/${progress.landmarksTotal}</span></div>
    </div>`;

    for (const region of G.WAYFINDER_REGIONS) {
      const found = journal.discovered.includes(region.id);
      const here = G.state.mapId === region.id;
      html += `<div class="form-card ${found ? "current" : "wayfinder-unknown"}">
        <h2>${found ? `✅ ${region.icon} ${region.name}` : "⬜ Undiscovered region"}</h2>
        <div class="tagline">${found ? "Entered and recorded in the Journal." : region.clue}</div>
        ${found ? `<div class="quest-row"><span>Entrance requirement</span><span class="prog">${region.stars ? `${region.stars} ⭐` : "Open"}</span></div>` :
          `<div class="quest-row"><span>Trail requirement</span><span class="prog">${region.stars ? `${region.stars} ⭐` : "Open"}</span></div>`}
        ${found && travelUnlocked ? `<button class="travel-btn" data-travel-region="${region.id}" ${here || !canTravel ? "disabled" : ""}>${here ? "You are here" : `Travel to ${region.name}`}</button>` : ""}
      </div>`;
    }

    const landmarks = G.discoveredWayfinderLandmarks();
    html += `<div class="form-card"><h2>📍 Discovered landmarks</h2>`;
    if (landmarks.length) {
      for (const map of landmarks) html += `<div class="quest-row done"><span>✅ ${map.name}</span><span class="prog">Recorded</span></div>`;
    } else {
      html += `<div class="tagline">Trials, dens, and the coliseum reveal themselves only after you enter them.</div>`;
    }
    html += `</div><div class="form-card ${journal.rewardClaimed ? "current" : ""}">
      <h2>🎁 Explorer reward</h2>
      <div class="tagline">${journal.rewardClaimed ? "Wayfinder Whistle earned. Fast travel is available from safe areas." : "Discover every major region to earn +3 stars and the Wayfinder Whistle."}</div>
      ${journal.rewardClaimed ? `<div class="quest-row done"><span>🎵 Wayfinder Whistle</span><span class="prog">Fast travel unlocked</span></div>` : ""}
      ${travelUnlocked && !canTravel ? `<div class="tagline">Fast travel pauses during boss trials, gauntlets, and story moments.</div>` : ""}
    </div>`;
    return html;
  }

  function buildTownTab() {
    const town = G.ensureTown();
    const townName = escapeHtml(town.name);
    if (!town.founded) {
      return `<div class="form-card current">
        <h2>☀️ Found Your Town</h2>
        <div class="tagline">God is unlocked. Start a town, then defeat baddies as God to attract new residents.</div>
        <button data-act="found-town">Found town</button>
      </div>`;
    }

    return `<div class="form-card current">
      <h2>☀️ ${townName}</h2>
      <div class="tagline">Defeat baddies as God to attract residents. Break wards as God to raise town spirit.</div>
      <div class="quest-row"><span>Town level</span><span class="prog">${G.townLevel ? G.townLevel() : 1}</span></div>
      <div class="quest-row"><span>Residents</span><span class="prog">${town.residents}</span></div>
      <div class="quest-row"><span>Capacity</span><span class="prog">${G.townCapacity ? G.townCapacity() : "?"}</span></div>
      <div class="quest-row"><span>Town spirit</span><span class="prog">${town.spirit}</span></div>
      <div class="quest-row"><span>Houses</span><span class="prog">${town.houses.length}</span></div>
      <div class="quest-row"><span>Next house cost</span><span class="prog">${G.townHouseCost()} spirit</span></div>
      <div class="quest-row"><span>Festivals held</span><span class="prog">${town.festivals}</span></div>
      <div class="quest-row"><span>Hero renown</span><span class="prog">${G.ensureHeroBoard ? G.ensureHeroBoard().renown : 0}</span></div>
      <button data-act="visit-town">Visit town</button>
      <button data-act="festival">Hold festival</button>
      <button data-act="rename-town">Rename town</button>
    </div>
    <div class="form-card">
      <h2>🏠 Town rules</h2>
      <div class="quest-row"><span>Visit town</span><span class="prog">walk onto empty plots</span></div>
      <div class="quest-row"><span>Build house</span><span class="prog">spend town spirit</span></div>
      <div class="quest-row"><span>Kill as God</span><span class="prog">+1 resident, +2 spirit</span></div>
      <div class="quest-row"><span>Break ward as God</span><span class="prog">+1 spirit</span></div>
      <div class="quest-row"><span>Hold festival</span><span class="prog">+residents spirit</span></div>
      ${(G.state.items || []).includes("sunrise-banner") ? `<div class="quest-row done"><span>🚩 Sunrise Banner</span><span class="prog">festival spirit ×2</span></div>` : ""}
    </div>`;
  }

  function buildGauntletTab() {
    const pool = G.gauntletBossPool();
    const current = G.state.gauntletRun;
    if (current) {
      return `<div class="form-card current">
        <h2>🏟 Gauntlet in progress</h2>
        <div class="tagline">Round ${Math.min(current.index + 1, current.bosses.length)}/${current.bosses.length} · ${current.recovery ? "campfire recovery" : "iron run"}</div>
        <div class="quest-row"><span>Guardians defeated</span><span class="prog">${current.wins}</span></div>
      </div>`;
    }
    const choices = [3, 5, 8].filter((count) => count <= pool.length);
    const options = choices.map((count) => `<option value="${count}">${count} bosses</option>`).join("") +
      `<option value="all">All ${pool.length} defeated bosses</option>`;
    return `<div class="form-card current">
      <h2>🏟 Manyfold Gauntlet</h2>
      <div class="tagline">Choose how many previously defeated guardians to fight back-to-back. The order changes every run.</div>
      <div class="quest-row"><span>Available guardians</span><span class="prog">${pool.length}</span></div>
      <div class="quest-row"><span>Recovery record</span><span class="prog">${G.state.gauntletBest || 0}</span></div>
      <div class="quest-row"><span>Iron record</span><span class="prog">${G.state.gauntletIronBest || 0}</span></div>
      <div class="slot-row"><span class="slot-label">Run length</span><select data-gauntlet-count>${options}</select></div>
      <label class="quest-row"><span>Campfire between rounds<br><small>Restore all health and 3 mana</small></span><input data-gauntlet-recovery type="checkbox" checked></label>
      <button data-act="start-gauntlet">Enter the gauntlet</button>
    </div>
    <div class="form-card">
      <h2>🏆 Records</h2>
      <div class="tagline">A longer personal best awards one star. A full-roster clear earns the Manyfold Crown: +2 maximum mana, a visible crown, and one Second Wind in every future gauntlet.</div>
      ${(G.state.items || []).includes("manyfold-crown") ? `<div class="quest-row done"><span>👑 Manyfold Crown</span><span class="prog">12 mana · Second Wind ready</span></div>` : ""}
    </div>`;
  }

  function buildHeroBoardTab() {
    const board = G.ensureHeroBoard();
    const progress = G.heroContractProgress();
    const milestones = [
      [3, "🎗 Wayfarer Ribbon", "visible travel trail"],
      [6, "🚩 Sunrise Banner", "double festival spirit"],
      [10, "✨ Heroic Halo", "visible in every form"],
    ];
    let html = `<div class="form-card current">
      <h2>🧭 Hero Board</h2>
      <div class="tagline">Repeatable adventures that reward exploring the world, mixing abilities, changing forms, and revisiting guardians.</div>
      <div class="quest-row"><span>Renown</span><span class="prog">${board.renown}</span></div>
      <div class="quest-row"><span>Contracts completed</span><span class="prog">${board.completed}</span></div>`;
    if (progress) {
      html += `<div class="quest-row"><span>${progress.def.icon} ${progress.def.name}</span><span class="prog">${progress.label}</span></div>
        <div class="tagline">${progress.def.text}</div>`;
    } else {
      html += `<div class="tagline">The next job rotates through patrols, exploration, ward breaking, ability variety, form variety, and guardian rematches.</div>
        <button data-act="accept-contract">Accept next contract</button>`;
    }
    html += `</div><div class="form-card"><h2>🏅 Renown rewards</h2>`;
    for (const [at, name, effect] of milestones) {
      html += `<div class="quest-row ${board.renown >= at ? "done" : ""}"><span>${name}</span><span class="prog">${board.renown >= at ? effect : `${board.renown}/${at}`}</span></div>`;
    }
    html += `<div class="tagline">Every contract also awards +1 star and 11–20 town spirit. Contracts continue after the milestone rewards.</div></div>`;
    return html;
  }

  /* ---------- Form Workshop error panel ---------- */
  function showWorkshop() {
    if (!G.workshopErrors.length) return;
    const el = document.getElementById("workshop-errors");
    el.innerHTML = `<div class="panel">
      <h1>🛠 The Form Workshop found some problems!</h1>
      <p>These forms/abilities are benched until they follow the rules
      (the rules are at the top of <b>js/engine/forms.js</b>):</p>
      <ul>${G.workshopErrors.map((e) => `<li><b>${e.where}:</b> ${e.msg}</li>`).join("")}</ul>
      <button id="workshop-ok">Got it — play anyway with the working forms ▶</button>
    </div>`;
    el.classList.remove("hidden");
    document.getElementById("workshop-ok").addEventListener("click", () => el.classList.add("hidden"));
  }

  return {
    toast, banner, update, drawHUD, resizeOverlay,
    openMenu, closeMenu, toggleMenu, showWorkshop,
    get menuOpen() { return menuOpen; },
  };
})();
