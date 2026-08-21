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
  const dialogueQueue = [];    // deliberate, player-advanced story text
  let dialogueData = null;     // {speaker, text, accent, shown, age, onClose}
  let dialoguePointerAdvance = false;
  let menuOpen = false;
  let workshopOpen = false;
  let btnCache = "";

  /* ---------- the full-resolution overlay canvas ---------- */
  const uiCanvas = document.getElementById("ui");
  const uiCtx = uiCanvas.getContext("2d");
  let uiScale = 4;

  const FONT_HEAD = '"Press Start 2P", "Courier New", monospace';
  const FONT_BODY = '"VT323", "Courier New", monospace';

  // Dialogue sits above the touch controls while it is open, making the
  // entire game view one large, comfortable "continue" target on iPad.
  uiCanvas.addEventListener("pointerdown", (event) => {
    if (!dialogueData) return;
    event.preventDefault();
    dialoguePointerAdvance = true;
    if (G.sfx && G.sfx.ensure) G.sfx.ensure();
  });

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

  function setDialogueCapture(active) {
    uiCanvas.style.pointerEvents = active ? "auto" : "none";
    uiCanvas.style.zIndex = active ? "15" : "5";
  }

  function showNextDialogue() {
    dialogueData = dialogueQueue.shift() || null;
    dialoguePointerAdvance = false;
    if (dialogueData) {
      dialogueData.shown = 0;
      dialogueData.age = 0;
      setDialogueCapture(true);
      if (G.sfx && G.sfx.play) G.sfx.play("menu");
    } else {
      setDialogueCapture(false);
    }
  }

  function dialogue(speaker, text, options) {
    const opts = options || {};
    dialogueQueue.push({
      speaker: String(speaker || ""),
      text: String(text || ""),
      accent: opts.accent || "#ffcd75",
      onClose: typeof opts.onClose === "function" ? opts.onClose : null,
    });
    if (!dialogueData) showNextDialogue();
  }

  function advanceDialogue() {
    if (!dialogueData || dialogueData.age < 0.12) return;
    if (dialogueData.shown < dialogueData.text.length) {
      dialogueData.shown = dialogueData.text.length;
      dialogueData.age = 0;
      if (G.sfx && G.sfx.play) G.sfx.play("menu");
      return;
    }
    const finished = dialogueData;
    dialogueData = null;
    if (finished.onClose) finished.onClose();
    if (!dialogueData) showNextDialogue();
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
    if (dialogueData) {
      dialogueData.age += dt;
      dialogueData.shown = Math.min(
        dialogueData.text.length,
        dialogueData.shown + dt * 48
      );
      const action = dialoguePointerAdvance ||
        ["a", "b", "c", "swap", "map", "pause", "interact"].some((button) => G.input.tapped(button));
      dialoguePointerAdvance = false;
      if (action) advanceDialogue();
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

  function drawDialogue(c) {
    if (!dialogueData) return;
    const d = dialogueData;
    const visible = d.text.slice(0, Math.floor(d.shown));
    const boxX = 7;
    const boxW = G.W - 14;

    c.font = `11px ${FONT_BODY}`;
    const allLines = wrapText(c, d.text, boxW - 18);
    const visibleLines = wrapText(c, visible, boxW - 18);
    const lineCount = Math.max(1, allLines.length);
    const boxH = 27 + lineCount * 11;
    const boxY = G.H - boxH - 7;

    c.fillStyle = "rgba(12,14,25,0.48)";
    c.fillRect(0, 0, G.W, G.H);
    c.fillStyle = "#0f101b";
    c.fillRect(boxX + 3, boxY + 3, boxW, boxH);
    c.fillStyle = "rgba(26,28,44,0.98)";
    c.fillRect(boxX, boxY, boxW, boxH);
    c.fillStyle = d.accent;
    c.fillRect(boxX, boxY, boxW, 2);
    c.fillRect(boxX, boxY + boxH - 2, boxW, 2);
    c.fillRect(boxX, boxY, 2, boxH);
    c.fillRect(boxX + boxW - 2, boxY, 2, boxH);

    c.font = `6px ${FONT_HEAD}`;
    c.fillStyle = d.accent;
    c.fillText(d.speaker.toUpperCase(), boxX + 9, boxY + 7);

    c.font = `11px ${FONT_BODY}`;
    c.fillStyle = "#f4f4f4";
    let y = boxY + 17;
    for (const line of visibleLines) {
      c.fillText(line, boxX + 9, y);
      y += 11;
    }

    if (d.shown >= d.text.length) {
      const prompt = G.input.isTouch ? "TAP TO CONTINUE" : G.input.hasGamepad ? "A  CONTINUE" : "SPACE / ENTER";
      c.font = `5px ${FONT_HEAD}`;
      const promptW = c.measureText(prompt).width;
      c.fillStyle = "#94b0c2";
      c.fillText(prompt, boxX + boxW - promptW - 11, boxY + boxH - 9);
      const blink = Math.floor((d.age || 0) * 3) % 2 === 0;
      if (blink) {
        c.fillStyle = d.accent;
        c.fillRect(boxX + boxW - 8, boxY + boxH - 10, 3, 3);
        c.fillRect(boxX + boxW - 7, boxY + boxH - 7, 1, 1);
      }
    }
  }

  function drawLocationChip(c) {
    const s = G.state;
    const name = s.mapDef && s.mapDef.name ? s.mapDef.name : s.mapId;
    const touch = G.input.isTouch;
    c.font = `${touch ? 5 : 6}px ${FONT_HEAD}`;
    const enemies = s.enemies.filter((e) => !e.dead).length;
    const label = touch ? name.toUpperCase() : `${name}  enemies:${enemies}`;
    const w = c.measureText(label).width + 8;
    c.fillStyle = "rgba(26,28,44,0.72)";
    c.fillRect(Math.round(G.W / 2 - w / 2), 5, w, 11);
    c.fillStyle = touch ? "#73eff7" : "#c8d8e0";
    c.fillText(label, Math.round(G.W / 2 - w / 2) + 4, 8);
  }

  function drawWayfinderHint(c) {
    if (!G.nearWayfinderPost || !G.nearWayfinderPost()) return;
    const label = G.input.isTouch ? "🧭 TAP MAP TO TRAVEL" :
      G.input.hasGamepad ? "🧭 VIEW · WAYFINDER MAP" : "🧭 M · WAYFINDER MAP";
    c.font = `5px ${FONT_HEAD}`;
    const w = c.measureText(label).width + 10;
    const x = Math.round((G.W - w) / 2);
    const y = G.H - 16;
    c.fillStyle = "rgba(26,28,44,0.86)";
    c.fillRect(x, y, w, 11);
    c.fillStyle = "#73eff7";
    c.fillRect(x, y, w, 1);
    c.fillStyle = "#f4f4f4";
    c.fillText(label, x + 5, y + 3);
  }

  function drawNpcChatter(c, cam) {
    if (dialogueData || G.state.bossCutscene) return;
    const p = G.state.player;
    const active = (G.state.npcs || []).filter((npc) => npc.bubble &&
      npc.bubble.delay <= 0 && npc.bubble.t > 0 &&
      G.util.dist(npc.x, npc.y, p.x, p.y) < 125)
      .sort((a, b) => G.util.dist(a.x, a.y, p.x, p.y) - G.util.dist(b.x, b.y, p.x, p.y))
      .slice(0, 2);
    const placed = [];
    for (const npc of active) {
      const bubble = npc.bubble;
      const speaker = npc.ambientOnly ? "RESIDENT" : String(npc.def.name || "NEARBY").toUpperCase();
      c.font = `9px ${FONT_BODY}`;
      const lines = wrapText(c, bubble.text, 86);
      let width = Math.max(c.measureText(speaker).width + 12, 36);
      for (const line of lines) width = Math.max(width, c.measureText(line).width + 12);
      width = Math.min(98, width);
      const height = 13 + lines.length * 9;
      let x = Math.round(G.util.clamp(npc.x - cam.x - width / 2, 4, G.W - width - 4));
      let y = Math.round(G.util.clamp(npc.y - cam.y - height - 23, 37, G.H - height - 34));
      for (const other of placed) {
        const overlaps = x < other.x + other.w + 3 && x + width + 3 > other.x &&
          y < other.y + other.h + 3 && y + height + 3 > other.y;
        if (overlaps) y = Math.max(37, other.y - height - 4);
      }
      placed.push({ x, y, w: width, h: height });

      const remaining = Math.min(bubble.duration || 2.25, bubble.t);
      c.globalAlpha = remaining < 0.28 ? Math.max(0, remaining / 0.28) : 1;
      c.fillStyle = "rgba(15,16,27,0.94)";
      c.fillRect(x + 2, y + 2, width, height);
      c.fillStyle = "rgba(244,244,244,0.97)";
      c.fillRect(x, y, width, height);
      const accent = (npc.def.sprite && npc.def.sprite.palette && npc.def.sprite.palette.a) || "#73eff7";
      c.fillStyle = accent;
      c.fillRect(x, y, 3, height);
      const tailX = Math.round(G.util.clamp(npc.x - cam.x, x + 8, x + width - 8));
      c.fillStyle = "rgba(244,244,244,0.97)";
      c.fillRect(tailX - 2, y + height, 5, 3);
      c.fillRect(tailX - 1, y + height + 3, 3, 2);

      c.font = `4px ${FONT_HEAD}`;
      c.fillStyle = "#566c86";
      c.fillText(speaker, x + 7, y + 4);
      c.font = `9px ${FONT_BODY}`;
      c.fillStyle = "#1a1c2c";
      lines.forEach((line, index) => c.fillText(line, x + 7, y + 11 + index * 9));
      c.globalAlpha = 1;
    }
  }

  function drawAbilityBar(c, p) {
    if (G.input.isTouch) return;
    const lo = G.getLoadout(G.state.formId);
    const labels = G.input.hasGamepad ? ["A", "X", "Y"] : ["A", "B", "C"];
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
      if (i === 0 && G.legendEchoCandidate && G.legendEchoCandidate()) {
        c.fillText("ECHO", x + 10, y + 5);
        continue;
      }
      if (i === 0 && G.npcTalkCandidate && G.npcTalkCandidate()) {
        c.fillText("TALK", x + 10, y + 5);
        continue;
      }
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
    const rank = G.legendRank ? G.legendRank(G.state.formId) : 0;
    if (rank >= 3) {
      const charge = G.legendCharge(G.state.formId), x = 108, y = G.H - 20;
      c.fillStyle = "rgba(26,28,44,0.8)"; c.fillRect(x, y, 53, 15);
      c.fillStyle = charge >= 100 ? "#fff3c2" : "#566c86"; c.fillRect(x + 1, y + 1, Math.round(51 * charge / 100), 13);
      c.fillStyle = charge >= 100 ? "#1a1c2c" : "#f4f4f4";
      c.fillText(G.input.hasGamepad ? "LT+RT ✦" : "R ✦", x + 4, y + 5);
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
    const y = touch ? 60 : G.H - boxH - 26;
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

  function drawStoryTracker(c) {
    if (!G.storyGoal || G.state.bossCutscene || G.ui.dialogueOpen) return;
    if (G.guidanceShowStoryCard && !G.guidanceShowStoryCard()) return;
    const goal = G.storyGoal();
    const boxW = 190;
    const x = 5;
    const y = 38;
    c.fillStyle = "rgba(26,28,44,0.82)";
    c.fillRect(x, y, boxW, 18);
    c.fillStyle = goal.act.color;
    c.fillRect(x, y, 2, 18);
    c.font = `4px ${FONT_HEAD}`;
    c.fillStyle = goal.complete ? "#a7f070" : goal.act.color;
    c.fillText(goal.complete ? "MAIN STORY · COMPLETE" : `ACT ${goal.chapter + 1} · MAIN STORY`, x + 5, y + 3);
    c.font = `7px ${FONT_BODY}`;
    c.fillStyle = "#f4f4f4";
    c.fillText(fitText(c, goal.short, boxW - 10), x + 5, y + 9);
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
    const suggestion = G.guidanceWardSuggestion ? G.guidanceWardSuggestion(nearest) : null;
    const formLabel = suggestion && suggestion.form ? `⇄ ${suggestion.form.name.toUpperCase()}` : "";
    c.font = `7px ${FONT_BODY}`;
    const w = Math.max(c.measureText(label).width, formLabel ? c.measureText(formLabel).width : 0) + 6;
    const x = Math.round(G.util.clamp(nearest.x - cam.x - w / 2, 2, G.W - w - 2));
    const h = formLabel ? 18 : 10;
    const y = Math.round(G.util.clamp(nearest.y - cam.y - nearest.def.size - h - 8, 2, G.H - h - 2));
    c.fillStyle = "rgba(26,28,44,0.85)";
    c.fillRect(x, y, w, h);
    c.fillStyle = type.color;
    c.fillRect(x, y, 2, h);
    c.fillText(label, x + 4, y + 1);
    if (formLabel) {
      c.fillStyle = "#d9a7ff";
      c.fillText(formLabel, x + 4, y + 9);
    }
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
    for (let i = 0; i < (p.passiveBarrier || 0); i++) {
      const x = 7 + maxH * 9 + i * 7, y = 6;
      c.fillStyle = "#73eff7";
      c.fillRect(x + 2, y, 3, 1);
      c.fillRect(x + 1, y + 1, 5, 4);
      c.fillRect(x + 2, y + 5, 3, 2);
      c.fillStyle = "#f4f4f4";
      c.fillRect(x + 2, y + 2, 1, 1);
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

    const pantryBuffs = [];
    if (p.pantryGuard > 0) pantryBuffs.push({ text: "WARD", color: "#ffcd75" });
    if (p.pantryHasteT > 0) pantryBuffs.push({ text: "FAST", color: "#ef7d57" });
    if (p.pantryQuickT > 0) pantryBuffs.push({ text: "QUICK", color: "#73eff7" });
    if (p.pantryMagnetT > 0) pantryBuffs.push({ text: "MAG", color: "#d9a7ff" });
    let pantryX = 8 + chipW;
    c.font = `5px ${FONT_HEAD}`;
    for (const buff of pantryBuffs) {
      const w = c.measureText(buff.text).width + 5;
      c.fillStyle = "rgba(26,28,44,0.72)";
      c.fillRect(pantryX, 24, w, 11);
      c.fillStyle = buff.color;
      c.fillRect(pantryX, 24, 2, 11);
      c.fillText(buff.text, pantryX + 3, 27);
      pantryX += w + 2;
    }

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
      drawStoryTracker(c);
      drawQuestTracker(c);
      drawWardHint(c, cam);
      if (G.drawGuidanceHud) G.drawGuidanceHud(c, cam);
      drawWayfinderHint(c);
      drawTutorial(c);
      drawAbilityBar(c, p);
    }
    drawNpcChatter(c, cam);

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
    if (G.state.bossCutscene && !dialogueData) {
      const skip = "TAP AN ABILITY FOR NEXT";
      c.font = `5px ${FONT_HEAD}`;
      const skipW = c.measureText(skip).width;
      c.fillStyle = "rgba(26,28,44,0.8)";
      c.fillRect(Math.round(G.W / 2 - skipW / 2 - 4), G.H - 17, skipW + 8, 10);
      c.fillStyle = "#94b0c2";
      c.fillText(skip, Math.round(G.W / 2 - skipW / 2), G.H - 14);
    }
    drawDialogue(c);
    if (menuOpen && activeTab === "forms") drawFormPreviews(false);
  }

  /* ---------- keep touch buttons showing the right icons ---------- */
  function syncButtons() {
    if (!G.input.isTouch || !G.state) return;
    const lo = G.getLoadout(G.state.formId);
    const p = G.state.player;
    const ids = ["btn-a", "btn-b", "btn-c"];
    let sig = "";
    const labels = ids.map((elId, i) => {
      if (i === 0 && G.legendEchoCandidate && G.legendEchoCandidate()) {
        sig += "echo";
        return "ECHO";
      }
      if (i === 0 && G.npcTalkCandidate && G.npcTalkCandidate()) {
        sig += "talk";
        return "TALK";
      }
      const ab = G.abilities[lo[i]];
      if (!ab) return "·";
      const ready = (p.cooldowns[lo[i]] || 0) <= 0 && ab.mana <= p.mana;
      sig += lo[i] + ready;
      return ab.icon;
    });
    sig += `legend${G.legendRank ? G.legendRank(G.state.formId) : 0}:${Math.floor(G.legendCharge ? G.legendCharge(G.state.formId) : 0)}`;
    if (sig === btnCache) return;
    btnCache = sig;
    labels.forEach((txt, i) => {
      const el = document.getElementById(ids[i]);
      el.textContent = txt;
      const ab = G.abilities[lo[i]];
      el.style.opacity = ab && (ab.mana > p.mana) ? 0.4 : 1;
    });
    const ultimate = document.getElementById("btn-ultimate");
    if (ultimate) {
      const rank = G.legendRank ? G.legendRank(G.state.formId) : 0;
      const charge = G.legendCharge ? G.legendCharge(G.state.formId) : 0;
      ultimate.style.display = rank >= 3 ? "block" : "none";
      ultimate.style.setProperty("--legend-charge", `${charge}%`);
      ultimate.textContent = charge >= 100 ? "✦" : `${Math.floor(charge)}`;
      ultimate.style.opacity = charge >= 100 ? 1 : 0.62;
    }
  }

  /* ---------- pause menu ---------- */
  const menuEl = document.getElementById("menu");
  const formWheelEl = document.getElementById("form-wheel");

  function dmgChip(type) {
    const t = G.DAMAGE_TYPES[type];
    return `<span class="dmg-chip" style="background:${t.color}">${t.name}</span>`;
  }

  function abilityLabel(id, form) {
    const ab = G.abilities[id];
    if (!ab) return id;
    const style = G.passives ? G.passives.styleLabel(ab.style) : ab.style;
    const synergy = form && G.passives && G.passives.formMatches(form, ab) ? "★ " : "";
    return `${synergy}${ab.icon} ${ab.name} · ${style} · ${G.DAMAGE_TYPES[ab.type].name}${ab.mana ? " · " + ab.mana + " mana" : ""}`;
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

  let activeTab = "story";
  let atlasView = "world";
  let atlasSelectedId = null;
  let formLabView = "roster";
  let formRosterView = "path";
  let settingsOpen = false;
  let labFormId = null;
  let labSlot = 1;
  let labAbilityId = null;
  let labDamageFilter = "all";
  let labStyleFilter = "all";
  let labBoostedOnly = false;
  let labSkinId = "classic";
  let lastFormPreviewDraw = 0;
  let formWheelOpen = false;
  let formWheelPage = 0;
  let formWheelAimIndex = -1;
  let formWheelCenter = { x: 0, y: 0 };

  function wheelPages() {
    const forms = G.unlockedForms ? G.unlockedForms() : [];
    const pages = [];
    for (let i = 0; i < forms.length; i += 8) pages.push(forms.slice(i, i + 8));
    return pages;
  }

  function renderFormWheel() {
    const pages = wheelPages();
    if (!pages.length) return;
    formWheelPage = Math.max(0, Math.min(pages.length - 1, formWheelPage));
    const forms = pages[formWheelPage];
    const choices = forms.map((id, index) => {
      const angle = -Math.PI / 2 + index * Math.PI * 2 / 8;
      const x = 50 + Math.cos(angle) * 34;
      const y = 50 + Math.sin(angle) * 34;
      const form = G.forms[id];
      return `<button class="form-wheel-choice ${id === G.state.formId ? "current" : ""} ${index === formWheelAimIndex ? "aimed" : ""}"
        style="--x:${x}%;--y:${y}%" data-wheel-form="${id}" data-wheel-index="${index}" aria-label="Become ${escapeHtml(form.name)}">
        <span class="icon">${form.icon}</span><span class="name">${escapeHtml(form.name)}</span></button>`;
    }).join("");
    formWheelEl.style.setProperty("--wheel-x", `${formWheelCenter.x}px`);
    formWheelEl.style.setProperty("--wheel-y", `${formWheelCenter.y}px`);
    formWheelEl.innerHTML = `<div class="form-wheel-ring" role="dialog" aria-modal="true" aria-label="Choose a form">
      ${choices}<div class="form-wheel-title"><strong>CHOOSE FORM</strong><span>Aim and release</span></div></div>
      ${pages.length > 1 ? `<div class="form-wheel-pages"><button data-wheel-page="-1" aria-label="Previous forms">◀</button>
        <span>${formWheelPage + 1} / ${pages.length}</span><button data-wheel-page="1" aria-label="Next forms">▶</button></div>` : ""}
      <button class="form-wheel-cancel" data-wheel-cancel aria-label="Close form selector">×</button>`;
    formWheelEl.querySelectorAll("[data-wheel-form]").forEach((button) => {
      button.addEventListener("click", () => chooseWheelForm(button.dataset.wheelForm));
      button.addEventListener("pointerenter", () => {
        formWheelAimIndex = Number(button.dataset.wheelIndex);
        syncWheelAim();
      });
    });
    formWheelEl.querySelectorAll("[data-wheel-page]").forEach((button) => button.addEventListener("click", () => {
      formWheelPage = (formWheelPage + Number(button.dataset.wheelPage) + pages.length) % pages.length;
      formWheelAimIndex = -1;
      renderFormWheel();
      if (G.sfx) G.sfx.play("menu");
    }));
    const cancel = formWheelEl.querySelector("[data-wheel-cancel]");
    if (cancel) cancel.addEventListener("click", closeFormWheel);
    const ring = formWheelEl.querySelector(".form-wheel-ring");
    if (ring) {
      ring.addEventListener("pointermove", (event) => aimFormWheel(event.clientX, event.clientY));
      ring.addEventListener("pointerup", () => commitFormWheel());
    }
  }

  function openFormWheel(origin) {
    if (formWheelOpen || menuOpen || dialogueData || !G.unlockedForms || G.unlockedForms().length < 2) return false;
    const vw = window.innerWidth || document.documentElement.clientWidth || 800;
    const vh = window.innerHeight || document.documentElement.clientHeight || 450;
    const size = Math.min(310, Math.max(224, Math.min(vw, vh) * 0.78));
    const radius = size / 2;
    formWheelCenter.x = G.util.clamp(origin && origin.x || vw / 2, radius + 10, vw - radius - 10);
    formWheelCenter.y = G.util.clamp(origin && origin.y || vh / 2, radius + 10, vh - radius - 55);
    const unlocked = G.unlockedForms();
    formWheelPage = Math.max(0, Math.floor(unlocked.indexOf(G.state.formId) / 8));
    formWheelAimIndex = -1;
    formWheelOpen = true;
    formWheelEl.classList.remove("hidden");
    formWheelEl.setAttribute("aria-hidden", "false");
    renderFormWheel();
    if (G.sfx) G.sfx.play("menu");
    return true;
  }

  function closeFormWheel() {
    if (!formWheelOpen) return;
    formWheelOpen = false;
    formWheelAimIndex = -1;
    formWheelEl.classList.add("hidden");
    formWheelEl.setAttribute("aria-hidden", "true");
    formWheelEl.innerHTML = "";
    if (G.input) G.input.clearTaps();
  }

  function syncWheelAim() {
    if (!formWheelOpen) return;
    formWheelEl.querySelectorAll("[data-wheel-index]").forEach((button) =>
      button.classList.toggle("aimed", Number(button.dataset.wheelIndex) === formWheelAimIndex));
  }

  function aimFormWheel(clientX, clientY) {
    if (!formWheelOpen) return false;
    const dx = clientX - formWheelCenter.x, dy = clientY - formWheelCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 42 || distance > 190) formWheelAimIndex = -1;
    else {
      const angle = Math.atan2(dy, dx) + Math.PI / 2;
      formWheelAimIndex = (Math.round(angle / (Math.PI * 2 / 8)) % 8 + 8) % 8;
      const page = wheelPages()[formWheelPage] || [];
      if (!page[formWheelAimIndex]) formWheelAimIndex = -1;
    }
    syncWheelAim();
    return formWheelAimIndex >= 0;
  }

  function aimFormWheelVector(vector) {
    if (!formWheelOpen || !vector) return false;
    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (magnitude < 0.45) return false;
    return aimFormWheel(formWheelCenter.x + vector.x * 100, formWheelCenter.y + vector.y * 100);
  }

  function chooseWheelForm(id) {
    if (!formWheelOpen || !G.formUnlocked(id)) return false;
    if (id !== G.state.formId) G.setForm(id);
    G.saveGame();
    closeFormWheel();
    return true;
  }

  function commitFormWheel() {
    if (!formWheelOpen || formWheelAimIndex < 0) return false;
    const page = wheelPages()[formWheelPage] || [];
    return page[formWheelAimIndex] ? chooseWheelForm(page[formWheelAimIndex]) : false;
  }

  function updateFormWheel() {
    if (!formWheelOpen) return;
    aimFormWheelVector(G.input.vec);
    if (G.input.tapped("wheelPrev")) {
      formWheelPage = (formWheelPage - 1 + wheelPages().length) % wheelPages().length;
      formWheelAimIndex = -1; renderFormWheel();
    }
    if (G.input.tapped("wheelNext")) {
      formWheelPage = (formWheelPage + 1) % wheelPages().length;
      formWheelAimIndex = -1; renderFormWheel();
    }
    if (G.input.tapped("confirm")) commitFormWheel();
    if (G.input.tapped("back") || G.input.tapped("pause")) closeFormWheel();
  }

  function controllerMenuElements() {
    return G.menuController.elements(menuEl);
  }

  function focusControllerElement(element) {
    G.menuController.setFocus(menuEl, element);
  }

  function focusControllerDefault() {
    const active = menuEl.querySelector("[data-tab].active");
    G.menuController.focusDefault(menuEl, active);
  }

  function cycleControllerTab(direction) {
    const tabs = Array.from(menuEl.querySelectorAll("[data-tab]"));
    if (!tabs.length) return;
    let index = tabs.findIndex((tab) => tab.classList.contains("active"));
    index = (index + direction + tabs.length) % tabs.length;
    tabs[index].click();
    focusControllerDefault();
  }

  function updateControllerMenu(dt) {
    if (!menuOpen) return;
    G.menuController.update(menuEl, {
      preferred: menuEl.querySelector("[data-tab].active"),
      onBack: closeMenu,
      onPageLeft: () => cycleControllerTab(-1),
      onPageRight: () => cycleControllerTab(1),
    }, dt);
  }

  function openMenu() {
    menuOpen = true;
    buildMenu();
    menuEl.classList.remove("hidden");
    menuEl.scrollTop = 0;
    if (G.input.hasGamepad) focusControllerDefault();
    G.events.emit("menuOpen", {});
  }
  function openMap() {
    activeTab = G.state && G.state.expeditionRun ? "expedition" : "map";
    atlasSelectedId = G.state && G.state.mapId;
    openMenu();
  }
  function openExpedition() {
    activeTab = "expedition";
    openMenu();
  }
  function closeMenu() {
    menuOpen = false;
    menuEl.classList.add("hidden");
    G.menuController.reset(menuEl);
    G.input.clearTaps();
  }
  function toggleMenu() { menuOpen ? closeMenu() : openMenu(); }

  function runningFullscreen() {
    const standalone = window.matchMedia && window.matchMedia("(display-mode: fullscreen)").matches;
    return !!(document.fullscreenElement || navigator.standalone || standalone);
  }

  async function enterFullscreen() {
    // Close immediately so the button never leaves a large menu covering the
    // game while Android enters fullscreen or iOS shows its fallback tip.
    closeMenu();
    if (runningFullscreen()) {
      toast("Fullscreen is already on", 2);
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

  function buildStoryTab() {
    const goal = G.storyGoal();
    const story = G.ensureStory();
    const progress = goal.progress || { value: 0, total: 1, label: "JOURNEY" };
    const percent = Math.round(100 * progress.value / Math.max(1, progress.total));
    const chapterCards = G.STORY_CHAPTERS.map((chapter, index) => {
      const reached = index <= goal.chapter || story.seenChapters.includes(index);
      const current = index === goal.chapter;
      return `<article class="story-chapter ${current ? "current" : reached ? "reached" : "locked"}" style="--chapter-color:${chapter.color}">
        <span class="story-chapter-icon" style="--chapter-color:${chapter.color}">${reached ? chapter.icon : "◇"}</span>
        <div><span class="eyebrow">ACT ${index + 1}${current ? " · CURRENT" : reached ? " · REMEMBERED" : " · AHEAD"}</span>
          <h3>${reached || current ? escapeHtml(chapter.title) : "A road not yet taken"}</h3>
          <p>${escapeHtml(reached || current ? chapter.summary : "Keep following the main path to reveal this chapter.")}</p></div>
      </article>`;
    }).join("");
    return `<section class="story-hero" style="--chapter-color:${goal.act.color}">
      <div class="story-act-mark">${goal.act.icon}</div>
      <div class="story-hero-copy"><span class="eyebrow">ACT ${goal.chapter + 1} · MAIN STORY</span>
        <h2>${escapeHtml(goal.act.title)}</h2><p class="story-thesis">${escapeHtml(goal.act.thesis)}</p></div>
      <div class="story-objective">
        <span class="eyebrow">${goal.complete ? "EPILOGUE" : "NEXT STEP"}</span>
        <h3>${escapeHtml(goal.title)}</h3><p>${escapeHtml(goal.objective)}</p>
        <div class="story-why">${escapeHtml(goal.reason)}</div>
        <div class="story-progress"><span style="width:${percent}%"></span></div>
        <div class="story-progress-label"><strong>${escapeHtml(progress.label)}</strong><span>${progress.value}/${progress.total}</span></div>
        <div class="story-actions"><button data-act="story-map">🧭 Show the way</button><button data-act="story-recap">↺ Story recap</button>
          ${goal.complete ? `<button data-act="story-ending-replay">☀ Replay ending</button>` : ""}</div>
      </div>
    </section>
    <div class="story-layout"><section><div class="story-section-heading"><span class="eyebrow">THE JOURNEY</span><h2>One story, six acts</h2></div>
      <div class="story-timeline">${chapterCards}</div></section>
      <aside class="story-sidequests"><span class="eyebrow">THE LIVING WORLD</span><h2>Adventures around the story</h2>
        <p>The main road is marked in gold. These paths are yours to follow whenever curiosity calls.</p>
        <div><strong>⭐ Form Mastery</strong><span>Learn how each shape thinks.</span></div>
        <div><strong>☀ Sunrise Town</strong><span>Build a home from the people you help.</span></div>
        <div><strong>♢ Manyfold</strong><span>Brave a road that changes with every crossing.</span></div>
        <div><strong>⚑ Hero Board</strong><span>Answer the world's changing needs.</span></div>
      </aside>
    </div>`;
  }

  function buildMenu() {
    const previousControllerElements = controllerMenuElements();
    const previousControllerIndex = previousControllerElements.indexOf(G.menuController.current(menuEl));
    let tabs = [
      ["story", "Story"],
      ["forms", "Form Lab"],
      ["quests", "Mastery"],
      ["map", "Map"],
    ];
    if (G.townUnlocked && G.townUnlocked()) tabs.push(["town", "Town"]);
    if (G.expeditionUnlocked && G.expeditionUnlocked()) tabs.push(["expedition", "Expedition"]);
    if (G.gauntletUnlocked && G.gauntletUnlocked()) tabs.push(["gauntlet", "Gauntlet"]);
    if (G.heroBoardUnlocked && G.heroBoardUnlocked()) tabs.push(["board", "Hero Board"]);
    if (G.state.expeditionRun) {
      tabs = [["expedition", "Expedition"]];
      activeTab = "expedition";
    }
    if (activeTab === "town" && !(G.townUnlocked && G.townUnlocked())) activeTab = "forms";
    if (activeTab === "gauntlet" && !(G.gauntletUnlocked && G.gauntletUnlocked())) activeTab = "forms";
    if (activeTab === "expedition" && !(G.expeditionUnlocked && G.expeditionUnlocked())) activeTab = "forms";
    if (activeTab === "board" && !(G.heroBoardUnlocked && G.heroBoardUnlocked())) activeTab = "forms";
    let html = `<h1>Nobody's Quest</h1>
      <div class="stars">⭐ ${G.state.stars} stars</div>
      <div class="menu-tabs">${tabs.map(([id, label]) =>
        `<button data-tab="${id}" class="${activeTab === id ? "active" : ""}">${label}</button>`).join("")}
      </div>
      <div class="menu-body ${activeTab === "map" ? "atlas-body" : activeTab === "forms" ? "form-lab-body" : activeTab === "story" ? "story-body" : ""}">`;

    if (activeTab === "story") html += buildStoryTab();
    if (activeTab === "forms") html += buildFormLab();
    if (activeTab === "quests") html += buildQuestsTab();
    if (activeTab === "map") html += buildWayfinderTab();
    if (activeTab === "town") html += buildTownTab();
    if (activeTab === "gauntlet") html += buildGauntletTab();
    if (activeTab === "expedition") html += buildExpeditionTab();
    if (activeTab === "board") html += buildHeroBoardTab();

    html += `</div>${settingsOpen ? buildSettingsPanel() : ""}
      <div class="menu-footer">
        <button data-act="resume">▶ Resume</button>
        <button data-act="settings" class="settings-btn">⚙ Settings</button>
      </div>`;

    menuEl.innerHTML = html;

    if (activeTab === "map" && atlasView === "local") drawLocalAtlas();
    if (activeTab === "forms") drawFormPreviews(true);

    // wire up clicks
    menuEl.querySelectorAll("[data-tab]").forEach((b) =>
      b.addEventListener("click", () => { activeTab = b.dataset.tab; buildMenu(); menuEl.scrollTop = 0; }));
    const storyMap = menuEl.querySelector('[data-act="story-map"]');
    if (storyMap) storyMap.addEventListener("click", () => {
      const goal = G.storyGoal();
      activeTab = "map";
      atlasView = "world";
      atlasSelectedId = G.wayfinderRegionInfo(goal.mapId) ? goal.mapId : "overworld";
      buildMenu();
      menuEl.scrollTop = 0;
    });
    const storyRecap = menuEl.querySelector('[data-act="story-recap"]');
    if (storyRecap) storyRecap.addEventListener("click", () => {
      closeMenu();
      G.playStoryRecap(false);
    });
    const endingReplay = menuEl.querySelector('[data-act="story-ending-replay"]');
    if (endingReplay) endingReplay.addEventListener("click", () => {
      closeMenu();
      G.playStoryEnding(true);
    });
    menuEl.querySelectorAll("[data-formlab-view]").forEach((button) =>
      button.addEventListener("click", () => {
        formLabView = button.dataset.formlabView;
        if (formLabView === "roster") formRosterView = "path";
        labFormId = G.formUnlocked(labFormId) ? labFormId : G.state.formId;
        labSkinId = G.selectedFormSkin(labFormId)?.id || "classic";
        buildMenu();
      }));
    menuEl.querySelectorAll("[data-roster-view]").forEach((button) =>
      button.addEventListener("click", () => {
        formRosterView = button.dataset.rosterView;
        buildMenu();
        menuEl.scrollTop = 0;
      }));
    menuEl.querySelectorAll("[data-form-select]").forEach((button) =>
      button.addEventListener("click", () => {
        labFormId = button.dataset.formSelect;
        if (formLabView === "roster") formRosterView = "detail";
        labSkinId = G.selectedFormSkin(labFormId)?.id || "classic";
        labAbilityId = null;
        buildMenu();
      }));
    menuEl.querySelectorAll("[data-legend-facet]").forEach((button) =>
      button.addEventListener("click", () => {
        G.setLegendFacet(labFormId, button.dataset.legendFacet);
        G.sfx.play("menu");
        buildMenu();
      }));
    const legendGuide = menuEl.querySelector("[data-legend-guide]");
    if (legendGuide) legendGuide.addEventListener("click", () => {
      const formId = legendGuide.dataset.legendGuide;
      closeMenu();
      G.guideToLegendEcho(formId);
    });
    menuEl.querySelectorAll("[data-loadout-slot]").forEach((button) =>
      button.addEventListener("click", () => { labSlot = Number(button.dataset.loadoutSlot); buildMenu(); }));
    const restoreDefaultLoadout = menuEl.querySelector('[data-act="restore-default-loadout"]');
    if (restoreDefaultLoadout) restoreDefaultLoadout.addEventListener("click", () => {
      const restored = G.restoreDefaultLoadout(labFormId);
      labAbilityId = restored[labSlot] || restored[1] || null;
      btnCache = "";
      G.sfx.play("pickup");
      G.ui.toast(`↺ ${G.forms[labFormId].name}'s own moves restored.`, 2.2);
      buildMenu();
    });
    menuEl.querySelectorAll("[data-ability-damage]").forEach((button) =>
      button.addEventListener("click", () => { labDamageFilter = button.dataset.abilityDamage; buildMenu(); }));
    menuEl.querySelectorAll("[data-ability-style]").forEach((button) =>
      button.addEventListener("click", () => { labStyleFilter = button.dataset.abilityStyle; buildMenu(); }));
    const boostedArts = menuEl.querySelector("[data-ability-boosted]");
    if (boostedArts) boostedArts.addEventListener("click", () => { labBoostedOnly = !labBoostedOnly; buildMenu(); });
    menuEl.querySelectorAll("[data-ability-select]").forEach((button) =>
      button.addEventListener("click", () => { labAbilityId = button.dataset.abilitySelect; buildMenu(); }));
    const equipAbility = menuEl.querySelector('[data-act="equip-ability"]');
    if (equipAbility) equipAbility.addEventListener("click", () => {
      const lo = G.getLoadout(labFormId);
      lo[labSlot] = labAbilityId;
      btnCache = "";
      G.saveGame();
      buildMenu();
    });
    menuEl.querySelectorAll("[data-skin-preview]").forEach((button) =>
      button.addEventListener("click", () => { labSkinId = button.dataset.skinPreview; buildMenu(); }));
    const equipSkin = menuEl.querySelector('[data-act="equip-skin"]');
    if (equipSkin) equipSkin.addEventListener("click", () => {
      G.selectFormSkin(labFormId, labSkinId);
      buildMenu();
    });
    const hdPilot = menuEl.querySelector('[data-act="hd-pilot"]');
    if (hdPilot) hdPilot.addEventListener("click", () => {
      G.setHdPilot(!G.hdPilot);
      buildMenu();
    });
    menuEl.querySelectorAll("[data-atlas-view]").forEach((button) =>
      button.addEventListener("click", () => {
        atlasView = button.dataset.atlasView;
        buildMenu();
      }));
    menuEl.querySelectorAll("[data-map-node]").forEach((button) =>
      button.addEventListener("click", () => {
        atlasSelectedId = button.dataset.mapNode;
        buildMenu();
      }));
    menuEl.querySelectorAll("[data-pin]").forEach((b) =>
      b.addEventListener("click", () => { G.toggleQuestPin(b.dataset.pin); buildMenu(); }));
    const clearPins = menuEl.querySelector('[data-act="clear-pins"]');
    if (clearPins) clearPins.addEventListener("click", () => { G.clearQuestPins(); buildMenu(); });
    menuEl.querySelectorAll("[data-become]").forEach((b) =>
      b.addEventListener("click", () => { G.setForm(b.dataset.become); buildMenu(); }));
    menuEl.querySelectorAll("[data-form-echo-guide]").forEach((b) =>
      b.addEventListener("click", () => {
        const formId = b.dataset.formEchoGuide;
        closeMenu();
        G.guideToFormEcho(formId);
      }));
    menuEl.querySelectorAll("[data-costume]").forEach((b) =>
      b.addEventListener("click", () => { G.selectCostume(b.dataset.costume); buildMenu(); }));
    menuEl.querySelectorAll("select[data-slot]").forEach((sel) =>
      sel.addEventListener("change", () => {
        const lo = G.getLoadout(G.state.formId);
        lo[parseInt(sel.dataset.slot, 10)] = sel.value;
        btnCache = "";
        G.saveGame();
        buildMenu();
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
    menuEl.querySelectorAll("[data-town-project]").forEach((button) =>
      button.addEventListener("click", () => {
        G.buyTownProject(button.dataset.townProject);
        buildMenu();
      }));
    const sponsorResident = menuEl.querySelector('[data-act="sponsor-resident"]');
    if (sponsorResident) sponsorResident.addEventListener("click", () => {
      G.sponsorTownResident();
      buildMenu();
    });
    const beautifyTown = menuEl.querySelector('[data-act="beautify-town"]');
    if (beautifyTown) beautifyTown.addEventListener("click", () => {
      G.beautifyTown();
      buildMenu();
    });
    const townFeast = menuEl.querySelector('[data-act="town-feast"]');
    if (townFeast) townFeast.addEventListener("click", () => {
      G.hostTownFeast();
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
    const startExpedition = menuEl.querySelector('[data-act="start-expedition"]');
    if (startExpedition) startExpedition.addEventListener("click", () => {
      const length = menuEl.querySelector('[data-expedition-length]').value;
      if (G.startManyfoldExpedition(length)) { activeTab = "expedition"; buildMenu(); }
    });
    menuEl.querySelectorAll("[data-expedition-route]").forEach((button) =>
      button.addEventListener("click", () => {
        if (!G.chooseExpeditionRoute(button.dataset.expeditionRoute)) return;
        if (G.state.expeditionRun && G.state.expeditionRun.phase === "battle") closeMenu();
        else buildMenu();
      }));
    menuEl.querySelectorAll("[data-expedition-draft]").forEach((button) =>
      button.addEventListener("click", () => {
        if (G.chooseExpeditionDraft(Number(button.dataset.expeditionDraft))) buildMenu();
      }));
    const abandonExpedition = menuEl.querySelector('[data-act="abandon-expedition"]');
    if (abandonExpedition) abandonExpedition.addEventListener("click", () => {
      G.failManyfoldExpedition("The route will rearrange for next time.", true);
      activeTab = "map";
      closeMenu();
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
    menuEl.querySelectorAll("[data-worldwake-region]").forEach((button) =>
      button.addEventListener("click", () => {
        if (G.travelToWorldwakeRegion(button.dataset.worldwakeRegion)) closeMenu();
      }));
    menuEl.querySelectorAll("[data-travel-landmark]").forEach((button) =>
      button.addEventListener("click", () => {
        if (G.travelToWayfinderLandmark(button.dataset.travelLandmark)) closeMenu();
      }));
    const resume = menuEl.querySelector('[data-act="resume"]');
    if (resume) resume.addEventListener("click", closeMenu);
    const settings = menuEl.querySelector('[data-act="settings"]');
    if (settings) settings.addEventListener("click", () => { settingsOpen = !settingsOpen; buildMenu(); });
    const fullscreen = menuEl.querySelector('[data-act="fullscreen"]');
    if (fullscreen) fullscreen.addEventListener("click", enterFullscreen);
    const tutorial = menuEl.querySelector('[data-act="tutorial"]');
    if (tutorial) tutorial.addEventListener("click", () => {
      G.tutorial.replay();
      closeMenu();
      toast("Tutorial hints restarted", 2.4);
    });
    const music = menuEl.querySelector('[data-act="music"]');
    if (music) music.addEventListener("click", () => {
      if (G.sfx && G.sfx.setMusicEnabled) G.sfx.setMusicEnabled(!G.sfx.musicEnabled);
      buildMenu();
    });
    const sound = menuEl.querySelector('[data-act="sound"]');
    if (sound) sound.addEventListener("click", () => {
      if (G.sfx && G.sfx.setSoundEnabled) G.sfx.setSoundEnabled(!G.sfx.soundEnabled);
      buildMenu();
    });
    const bossAssistance = menuEl.querySelector('[data-act="boss-assistance"]');
    if (bossAssistance) bossAssistance.addEventListener("click", () => {
      if (G.setComfortSetting) G.setComfortSetting("bossAssistance", !G.comfortSetting("bossAssistance"));
      buildMenu();
    });
    const easyMode = menuEl.querySelector('[data-act="easy-mode"]');
    if (easyMode) easyMode.addEventListener("click", () => {
      if (G.setComfortSetting) G.setComfortSetting("easyMode", !G.comfortSetting("easyMode"));
      buildMenu();
    });
    const saveSlots = menuEl.querySelector('[data-act="save-slots"]');
    if (saveSlots) saveSlots.addEventListener("click", () => {
      closeMenu();
      G.showSaveSlotScreen(true);
    });
    const reset = menuEl.querySelector('[data-act="reset"]');
    if (reset) reset.addEventListener("click", () => {
      if (confirm(`Delete Slot ${G.activeSaveSlot}? Other adventure slots will be kept.`)) G.resetSave();
    });
    if (menuOpen && G.input.hasGamepad && !menuEl.classList.contains("hidden")) {
      const rebuiltElements = controllerMenuElements();
      if (previousControllerIndex >= 0 && rebuiltElements.length) {
        focusControllerElement(rebuiltElements[Math.min(previousControllerIndex, rebuiltElements.length - 1)]);
      } else {
        focusControllerDefault();
      }
    }
  }

  function buildSettingsPanel() {
    const canFullscreen = !runningFullscreen();
    const musicOn = !G.sfx || G.sfx.musicEnabled !== false;
    const soundOn = !G.sfx || G.sfx.soundEnabled !== false;
    const bossAssistance = G.comfortSetting && G.comfortSetting("bossAssistance");
    const easyMode = G.comfortSetting && G.comfortSetting("easyMode");
    return `<section class="settings-panel" aria-label="Settings and help">
      <div class="settings-heading"><div><span class="eyebrow">SETTINGS & HELP</span><h2>Make the journey yours</h2></div></div>
      <div class="settings-grid">
        <button data-act="music"><strong>♫ Music</strong><span>${musicOn ? "ON" : "OFF"}</span></button>
        <button data-act="sound"><strong>◖ Sound effects</strong><span>${soundOn ? "ON" : "OFF"}</span></button>
        <button data-act="hd-pilot"><strong>✦ World detail</strong><span>${G.hdPilot ? "HD · 640×360" : "Original · 320×180"}</span></button>
        <button data-act="boss-assistance" aria-pressed="${!!bossAssistance}"><strong>♥ Boss Assistance</strong><span>${bossAssistance ? "ON · extra retry hearts and gentler attacks" : "OFF"}</span></button>
        <button data-act="easy-mode" aria-pressed="${!!easyMode}"><strong>🌱 Easy Mode</strong><span>${easyMode ? "ON · hearts slowly return, even in battle" : "OFF"}</span></button>
        <button data-act="tutorial"><strong>? Tutorial</strong><span>Show the first lessons again</span></button>
        <button data-act="save-slots"><strong>▤ Adventure slots</strong><span>Slot ${G.activeSaveSlot} · switch or begin again</span></button>
        ${canFullscreen ? `<button data-act="fullscreen"><strong>⛶ Fullscreen</strong><span>Use more of this screen</span></button>` : ""}
      </div>
      <details class="save-data"><summary>Delete current adventure</summary><p>This permanently erases Slot ${G.activeSaveSlot}. Your other slots are not affected.</p>
        <button data-act="reset" class="danger" title="Erase the current adventure">Delete Slot ${G.activeSaveSlot}</button></details>
    </section>`;
  }

  function labSelectedForm(requireUnlocked) {
    if (!labFormId || !G.forms[labFormId] || G.forms[labFormId].invalid ||
      (requireUnlocked && !G.formUnlocked(labFormId))) labFormId = G.state.formId;
    return G.forms[labFormId];
  }

  function previewCanvas(formId, skinId, classes, label, locked, useDye) {
    return `<canvas width="160" height="132" class="form-preview ${classes || ""}"
      data-form-preview="${formId}" data-preview-skin="${skinId || "classic"}"
      ${locked ? `data-preview-locked="true"` : ""} ${useDye ? `data-preview-dye="true"` : ""}
      role="img" aria-label="${escapeHtml(label)}"></canvas>`;
  }

  function buildFormLab() {
    const legendReady = G.legendReadyForms && G.legendReadyForms().length > 0;
    const labels = { roster: "Forms", loadout: "Arts", legends: `Legends${legendReady ? " ✦" : ""}`, skins: "Looks" };
    let html = `<div class="form-lab-header">
      <div><h2>⚗ FORM LAB</h2><p>Choose a shape, mix its arts, and make it your own.</p></div>
      <div class="form-lab-tabs">${Object.entries(labels).map(([id, label]) =>
        `<button data-formlab-view="${id}" class="${formLabView === id ? "active" : ""}">${label}</button>`).join("")}</div>
    </div>`;
    if (formLabView === "loadout") return html + buildLoadoutLab();
    if (formLabView === "legends") return html + buildLegendsLab();
    if (formLabView === "skins") return html + buildSkinsLab();
    return html + buildRosterLab();
  }

  function buildLegendsLab() {
    const form = labSelectedForm(true);
    const def = G.LEGEND_DEFS[form.id];
    const rank = G.legendRank(form.id);
    const objective = G.legendObjective(form.id);
    const ready = G.legendAvailable(form.id);
    const echo = ready ? G.legendEchoFor(form.id) : null;
    const active = G.state.legends.active && G.state.legends.active.formId === form.id ? G.state.legends.active : null;
    const percent = Math.min(100, Math.round(100 * objective.value / Math.max(1, objective.goal)));
    const chosen = G.state.legends.facets[form.id] || "original";
    const technique = G.abilities[def.techniqueId];
    const ultimateControl = G.input.hasGamepad ? "Press LT + RT" : G.input.isTouch ? "Tap ✦" : "Press R";
    const stages = G.LEGEND_PATHS[form.id];
    const rewards = [["NATURE", def.facet.name], ["SECRET ART", def.techniqueName], ["LEGEND ARM", def.armName]];
    return `<div class="lab-form-switcher">${G.unlockedForms().map((id) =>
      `<button data-form-select="${id}" class="${id === form.id ? "active" : ""} ${G.legendReady(id) ? "legend-ready" : ""}" aria-label="${escapeHtml(G.forms[id].name)}${G.legendReady(id) ? ", Legend ready" : ""}">${G.forms[id].icon}<span>${escapeHtml(G.forms[id].name)}</span>${G.legendReady(id) ? `<i aria-hidden="true">✦</i>` : ""}</button>`).join("")}</div>
      <section class="legend-hero" style="--legend:${def.color}">
        <div>${previewCanvas(form.id, G.selectedFormSkin(form.id)?.id || "classic", "loadout-preview", form.name, false, !G.selectedFormSkin(form.id))}</div>
        <div><span class="eyebrow">${escapeHtml(def.survivalText)}</span><h2>${form.icon} ${escapeHtml(form.name)} Legend</h2>
          <p>A mastered form still has secrets. Follow its legend to awaken a hidden nature, a forbidden technique, and the arm that remembers its name.</p>
          <div class="legend-objective ${active || echo && echo.reward ? "ready" : ""}"><strong>${escapeHtml(objective.label)}</strong><span>${Math.floor(Math.min(objective.value, objective.goal))}/${objective.goal}</span><i><b style="width:${percent}%"></b></i></div>
        </div>
        <div class="legend-meter"><strong>${Math.floor(G.legendCharge(form.id))}%</strong><span>LEGEND</span></div>
      </section>
      <div class="legend-track" style="--legend:${def.color}">${stages.map((stage, index) => {
        const need = index + 1, known = rank >= need || need === rank + 1;
        return `<article class="${rank >= need ? "earned" : need === rank + 1 ? active || echo && echo.reward ? "next ready" : "next" : "locked"}">
          <span>LEGEND ${["I", "II", "III"][index]} · ${rewards[index][0]}</span><h3>${known ? escapeHtml(rewards[index][1]) : "Unrevealed"}</h3>
          <p>${known ? escapeHtml(stage.name) : "Its place remains hidden."}</p>${rank >= need ? `<strong class="legend-earned">✓ AWAKENED</strong>` : need === rank + 1 && G.formLevel(form.id) >= 5 ? `<strong class="legend-site-name">✦ ${escapeHtml(G.maps[stage.mapId]?.name || stage.mapId)}</strong>` : ""}</article>`;
      }).join("")}</div>
      ${echo ? `<section class="legend-quest-callout" style="--legend:${def.color}"><span class="legend-quest-icon">${echo.reward ? "✦" : form.icon}</span><div><small>${echo.reward ? "RELIC WAITING" : active ? "TRIAL UNDERWAY" : `LEGEND ${["I","II","III"][echo.rank - 1]} SIDE QUEST`}</small>
        <h2>${escapeHtml(echo.name)}</h2><p>${escapeHtml(echo.clue)}</p><strong>${escapeHtml(echo.reward ? "Return and awaken what remains." : active ? `${echo.objective} ${echo.rule}` : `${G.maps[echo.mapId]?.name || echo.mapId} · ${echo.objective}`)}</strong></div>
        <button data-legend-guide="${form.id}">Track this Echo</button></section>` : ""}
      ${rank >= 1 ? `<section class="facet-picker"><div><span class="eyebrow">ACTIVE NATURE</span><h2>Choose what stirs within ${escapeHtml(form.name)}</h2></div>
        <button data-legend-facet="original" class="${chosen === "original" ? "active" : ""}"><strong>◆ ${escapeHtml(form.passive.name)}</strong><span>${escapeHtml(form.passive.description)}</span></button>
        <button data-legend-facet="legend" class="${chosen === "legend" ? "active" : ""}"><strong>✦ ${escapeHtml(def.facet.name)}</strong><span>${escapeHtml(def.facet.description)}</span></button></section>` : ""}
      ${rank >= 2 ? `<section class="legend-reward"><span>${technique.icon}</span><div><small>SECRET ART AWAKENED</small><h2>${escapeHtml(technique.name)}</h2><p>${escapeHtml(G.passives.styleLabel(technique.style))} · ${technique.mana} mana · ${technique.cooldown}s recovery</p></div><button data-formlab-view="loadout">Carry this art</button></section>` : ""}
      ${rank >= 3 ? `<section class="legend-reward ultimate"><span>✦</span><div><small>LEGEND ARM AWAKENED</small><h2>${escapeHtml(def.armName)}</h2><p>${escapeHtml(def.ultimateName)} · Fill the Legend meter in battle. ${ultimateControl} when it shines.</p></div></section>` : ""}`;
  }

  function buildFormPathCard(id) {
    const form = G.forms[id];
    const unlocked = G.formUnlocked(id);
    const ready = !unlocked && G.formReady(id);
    const current = id === G.state.formId;
    const selected = labFormId === id;
    const progress = G.formPathProgress(id);
    const steps = G.formUnlockSteps(id);
    const next = steps.find((step) => !step.met);
    const status = current ? "CURRENT" : ready ? "ECHO READY" : unlocked ? `LEVEL ${G.formLevel(id)}` : `${progress.done}/${progress.total} STEPS`;
    const percent = progress.total ? Math.round(progress.done / progress.total * 100) : 0;
    const action = current ? "This is the shape you wear now."
      : ready ? "The path is complete. Find its echo."
      : unlocked ? `Awakened · mastery level ${G.formLevel(id)}`
      : next ? `${next.label} · ${next.detail}` : "Its path has not yet been revealed.";
    const gates = steps.map((step) => `<span class="${step.met ? "met" : "pending"}" title="${escapeHtml(`${step.label}: ${step.detail}`)}">${step.met ? "✓" : step.icon}</span>`).join("");
    return `<button class="form-path-card ${selected ? "selected" : ""} ${current ? "current" : ""} ${ready ? "ready" : ""} ${unlocked ? "unlocked" : "locked"}"
      data-form-select="${id}" aria-label="${escapeHtml(`${form.name}, ${status}. ${action}`)}">
      <span class="form-path-card-art">${previewCanvas(id, unlocked ? G.selectedFormSkin(id)?.id : "classic", "path-card-preview", form.name, !unlocked, unlocked && !G.selectedFormSkin(id))}</span>
      <span class="form-path-card-copy"><span class="form-path-card-top"><strong>${escapeHtml(form.name)}</strong><em>${status}</em></span>
        <span class="form-path-progress" aria-hidden="true"><i style="width:${percent}%"></i></span>
        <small>${escapeHtml(action)}</small></span>
      ${gates ? `<span class="form-path-card-gates">${gates}</span>` : ""}
      <span class="form-path-card-arrow" aria-hidden="true">›</span>
    </button>`;
  }

  function buildFormRoadmap() {
    const chapters = G.FORM_PATH_CHAPTERS.map((chapter) => {
      const done = chapter.forms.filter((id) => G.formUnlocked(id)).length;
      const active = chapter.forms.includes(labFormId);
      return `<section class="form-path-chapter ${active ? "active" : ""}">
        <div class="form-path-chapter-heading"><span class="form-path-chapter-number">${chapter.number}</span><div><h3>${escapeHtml(chapter.title)}</h3><p>${escapeHtml(chapter.note)}</p></div>
          <strong>${done}/${chapter.forms.length}</strong></div>
        <div class="form-path-card-grid">${chapter.forms.map(buildFormPathCard).join("")}</div>
      </section>`;
    }).join("");
    const total = G.formOrder.filter((id) => G.formUnlocked(id)).length;
    return `<section class="form-path-shell" data-form-path-map>
      <div class="form-path-heading"><div><span class="eyebrow">AWAKENING JOURNEY</span><h2>Every shape leaves a trail</h2></div>
        <div class="form-path-total"><strong>${total}/${G.formOrder.length}</strong><span>FORMS AWAKENED</span></div></div>
      <div class="form-path-scroll">${chapters}</div>
    </section>`;
  }

  function buildUnlockRoute(form) {
    const steps = G.formUnlockSteps(form.id);
    if (!steps.length) return "";
    const progress = G.formPathProgress(form.id);
    const next = steps.find((step) => !step.met);
    return `<section class="form-route-card">
      <div class="form-route-title"><span>AWAKENING ROUTE</span><strong>${progress.done}/${progress.total} COMPLETE</strong></div>
      <p>${escapeHtml(form.unlock.hint || "Complete this form's path")}</p>
      <div class="form-route-steps">${steps.map((step) => `<div class="form-route-step ${step.met ? "met" : "pending"}">
        <span class="route-step-icon">${step.met ? "✓" : step.icon}</span><span><strong>${escapeHtml(step.label)}</strong><small>${escapeHtml(step.detail)}</small></span>
      </div>`).join("")}</div>
      ${next ? `<div class="form-route-next"><span>NEXT</span><strong>${escapeHtml(next.label)}</strong><small>${escapeHtml(next.detail)}</small></div>` : ""}
    </section>`;
  }

  function buildRosterLab() {
    const selected = labSelectedForm(false);
    const selectedPassive = G.legendPassiveFor ? G.legendPassiveFor(selected) : selected.passive;
    const unlocked = G.formUnlocked(selected.id);
    const ready = !unlocked && G.formReady(selected.id);
    const echo = ready && G.formEchoFor ? G.formEchoFor(selected.id) : null;
    const echoMap = echo && G.maps[echo.mapId];
    const current = selected.id === G.state.formId;
    const completed = (selected.quests || []).filter((quest) => G.questsDone.includes(quest.id)).length;
    const skin = unlocked && G.selectedFormSkin(selected.id);
    const inspector = `<section class="form-stage ${unlocked ? "" : "locked"}">
        <button class="form-stage-back" data-roster-view="path">‹ Awakening journey</button>
        <div class="form-stage-art">${previewCanvas(selected.id, skin ? skin.id : "classic", "hero-preview", selected.name, !unlocked, !skin)}</div>
        <div class="form-stage-copy">
          <div class="eyebrow">${current ? "CURRENT FORM" : echo ? "FORM ECHO WAITING" : ready ? "CHALLENGE COMPLETE" : unlocked ? `FORM LEVEL ${G.formLevel(selected.id)}` : "UNDISCOVERED FORM"}</div>
          <h2>${selected.icon} ${escapeHtml(selected.name)}</h2>
          <p class="lab-tagline">${escapeHtml(selected.tagline)}</p>
          ${unlocked ? `<div class="lab-stat-row"><span>❤️ ${selected.hearts}</span><span>👟 ${selected.speed}</span>${dmgChip(G.abilities[selected.basic]?.type || "blunt")}</div>
            <div class="survival-rule">${escapeHtml((G.FORM_SURVIVAL[selected.id] || {}).text || "BALANCED · mixed range and exposure")}</div>
            <div class="passive-rule"><strong>◆ ${escapeHtml(selectedPassive.name)}</strong><span>${escapeHtml(selectedPassive.description)}</span></div>
            <div class="mastery-track"><span>MASTERY</span><span class="mastery-pips">${selected.quests.map((quest) => `<i class="${G.questsDone.includes(quest.id) ? "done" : ""}"></i>`).join("")}</span><span>${completed}/${selected.quests.length}</span></div>
            <div class="lab-actions"><button data-become="${selected.id}" ${current ? "disabled" : ""}>${current ? "Current form" : `Become ${escapeHtml(selected.name)}`}</button>
            <button data-formlab-view="loadout">Mix arts</button><button data-formlab-view="skins">Choose a look</button></div>`
          : `${buildUnlockRoute(selected)}${ready ? echo
            ? `<div class="unlock-panel">✦ ${escapeHtml(selected.name)} is waiting ${echo.mapId === G.state.mapId ? "nearby" : "in " + escapeHtml(echoMap ? echoMap.name : echo.mapId)}. Meet it in the world to unlock it.</div>
              <button data-form-echo-guide="${selected.id}">Guide me to the echo</button>`
            : `<div class="unlock-panel">The lesson is complete. Win a battle and watch what remains.</div>` : ""}`}
        </div>
      </section>`;
    return `<div class="form-roster-mobile-tabs" aria-label="Roster view">
        <button data-roster-view="path" class="${formRosterView === "path" ? "active" : ""}">‹ Journey</button>
        <button data-roster-view="detail" class="${formRosterView === "detail" ? "active" : ""}">${selected.icon} ${escapeHtml(selected.name)}</button>
      </div>
      <div class="form-roster-workbench" data-roster-view="${formRosterView}">
        ${buildFormRoadmap()}${inspector}
      </div>`;
  }

  function buildLoadoutLab() {
    const form = labSelectedForm(true);
    const activePassive = G.legendPassiveFor ? G.legendPassiveFor(form) : form.passive;
    const lo = G.getLoadout(form.id);
    const defaults = G.defaultLoadout(form.id);
    const usingDefaults = defaults.every((abilityId, slot) => lo[slot] === abilityId);
    const slots = [0, 1, 2].filter((slot) => slot === 0 || slot <= form.slots);
    if (!slots.includes(labSlot) || labSlot === 0) labSlot = Math.min(1, form.slots);
    const damageFilters = [["all", "Any"], ["sharp", "Sharp"], ["blunt", "Blunt"], ["light", "Light"], ["dark", "Dark"]];
    const styleFilters = [["all", "Any"], ["melee", "Melee"], ["projectile", "Ranged"], ["dash", "Dash"], ["area", "Area"], ["chain", "Chain"]];
    const all = G.availableAbilities();
    const filtered = all.filter((id) => G.knownArtMatchesFilters(G.abilities[id], labDamageFilter, labStyleFilter) &&
      (!labBoostedOnly || !!(G.passives && G.passives.formMatches(form, G.abilities[id]))));
    if (!labAbilityId || !filtered.includes(labAbilityId)) labAbilityId = lo[labSlot] && filtered.includes(lo[labSlot]) ? lo[labSlot] : filtered[0];
    const selected = G.abilities[labAbilityId];
    const source = selected && G.forms[selected.nativeForm];
    const synergy = selected && G.passives ? G.passives.synergyText(form, selected) : "";
    const skin = G.selectedFormSkin(form.id);
    return `<div class="lab-form-switcher">${G.unlockedForms().map((id) =>
        `<button data-form-select="${id}" class="${id === form.id ? "active" : ""}">${G.forms[id].icon}<span>${escapeHtml(G.forms[id].name)}</span></button>`).join("")}</div>
      <div class="loadout-workbench">
        <section class="loadout-form-panel">
          <div class="eyebrow">MIXING FOR</div><h2>${form.icon} ${escapeHtml(form.name)}</h2>
          ${previewCanvas(form.id, skin ? skin.id : "classic", "loadout-preview", form.name, false, !skin)}
          <div class="passive-rule"><strong>◆ ${escapeHtml(activePassive.name)}</strong><span>${escapeHtml(activePassive.description)}</span></div>
          <button class="restore-loadout" data-act="restore-default-loadout" ${usingDefaults ? "disabled" : ""}>
            <strong>↺ ${usingDefaults ? "Native arts ready" : "Restore native arts"}</strong>
            <span>${usingDefaults ? "This form carries its own arts." : "Return this form's own B and C arts."}</span>
          </button>
        </section>
        <section class="loadout-slots" aria-label="Ability slots">${slots.map((slot) => {
          const ability = G.abilities[lo[slot]];
          const match = ability && G.passives && G.passives.formMatches(form, ability);
          return `<button class="ability-slot ${slot === labSlot ? "selected" : ""} ${slot === 0 ? "fixed" : ""}" ${slot === 0 ? "disabled" : `data-loadout-slot="${slot}"`}>
            <span class="slot-letter">${["A", "B", "C"][slot]}</span><span class="slot-icon">${ability?.icon || "＋"}</span>
            <span class="slot-copy"><strong>${escapeHtml(ability?.name || "Empty")}</strong><small>${slot === 0 ? "NATIVE ART · ALWAYS READY" : match ? "★ NATURE AWAKENED" : "MIXED ART"}</small></span>
          </button>`;
        }).join("")}</section>
      </div>
      <section class="ability-tray">
        <div class="tray-heading"><div><span class="eyebrow">KNOWN ARTS</span><h2>Choose an art for ${["A", "B", "C"][labSlot]}</h2></div>
          <span class="ability-result-count">${filtered.length} of ${all.length} arts</span></div>
        <div class="ability-filter-panel" role="group" aria-label="Known Arts filters">
          <div class="ability-filter-row" role="group" aria-label="Damage type"><strong>Damage</strong><div class="ability-filters">${damageFilters.map(([id, label]) =>
            `<button data-ability-damage="${id}" class="${labDamageFilter === id ? "active" : ""}" aria-pressed="${labDamageFilter === id}">${label}</button>`).join("")}</div></div>
          <div class="ability-filter-row" role="group" aria-label="Attack type"><strong>Attack</strong><div class="ability-filters">${styleFilters.map(([id, label]) =>
            `<button data-ability-style="${id}" class="${labStyleFilter === id ? "active" : ""}" aria-pressed="${labStyleFilter === id}">${label}</button>`).join("")}</div></div>
          <button class="ability-boost-filter ${labBoostedOnly ? "active" : ""}" data-ability-boosted aria-pressed="${labBoostedOnly}">★ ${escapeHtml(activePassive.name)} arts only</button>
        </div>
        <div class="ability-card-grid">${filtered.map((id) => {
          const ability = G.abilities[id];
          const origin = G.forms[ability.nativeForm];
          const match = G.passives && G.passives.formMatches(form, ability);
          return `<button data-ability-select="${id}" class="ability-card ${id === labAbilityId ? "selected" : ""} ${match ? "boosted" : ""}">
            <span class="ability-card-icon">${ability.icon}</span><strong>${escapeHtml(ability.name)}</strong>
            <span>${dmgChip(ability.type)} <small>${escapeHtml(G.passives ? G.passives.styleLabel(ability.style) : ability.style)}</small></span>
            <small>${origin ? `${origin.icon} ${escapeHtml(origin.name)}` : "Found art"}${match ? " · ★" : ""}</small>
          </button>`;
        }).join("")}</div>
        ${selected ? `<div class="ability-inspector">
          <div class="ability-inspector-icon">${selected.icon}</div><div><span class="eyebrow">${source ? `${source.icon} ${escapeHtml(source.name)} ART` : "FOUND ART"}</span>
          <h2>${escapeHtml(selected.name)}</h2><p>${dmgChip(selected.type)} · ${escapeHtml(G.passives ? G.passives.styleLabel(selected.style) : selected.style)}${selected.mana ? ` · ${selected.mana} mana` : " · no mana"} · ${selected.cooldown}s recovery</p>
          <div class="synergy-callout ${synergy ? "good" : ""}">${synergy ? `★ ${escapeHtml(synergy)}` : `A flexible off-style choice. ${escapeHtml(activePassive.name)} will not modify it.`}</div></div>
          <button data-act="equip-ability" ${lo[labSlot] === selected.id ? "disabled" : ""}>${lo[labSlot] === selected.id ? `In slot ${["A", "B", "C"][labSlot]}` : `Equip to ${["A", "B", "C"][labSlot]}`}</button>
        </div>` : `<div class="empty-tray"><strong>No arts found</strong><span>Try another damage or attack combination.</span></div>`}
      </section>`;
  }

  function buildSkinsLab() {
    const form = labSelectedForm(true);
    const signature = G.skinForForm(form.id);
    const owned = signature && G.skinUnlocked(signature.id);
    const equipped = G.selectedFormSkin(form.id);
    if (labSkinId !== "classic" && (!signature || labSkinId !== signature.id)) labSkinId = equipped?.id || "classic";
    const previewSkin = labSkinId === signature?.id ? signature : null;
    const dyes = G.ensureCostumes();
    return `<div class="lab-form-switcher">${G.unlockedForms().map((id) =>
        `<button data-form-select="${id}" class="${id === form.id ? "active" : ""}">${G.forms[id].icon}<span>${escapeHtml(G.forms[id].name)}</span></button>`).join("")}</div>
      <section class="skin-stage">
        <div class="skin-spotlight">${previewCanvas(form.id, previewSkin?.id || "classic", "skin-hero-preview", previewSkin?.name || `${form.name} Classic`, false, !previewSkin)}
          <span>A NEW LOOK · THE SAME FORM WITHIN</span></div>
        <div class="skin-stage-copy"><span class="eyebrow">${previewSkin ? "SIGNATURE LOOK" : dyes.selected === "classic" ? "CLASSIC LOOK" : "CLASSIC LOOK + DYE"}</span>
          <h2>${previewSkin ? `${previewSkin.icon} ${escapeHtml(previewSkin.name)}` : `✨ ${escapeHtml(form.name)} Classic`}</h2>
          <p>${previewSkin ? escapeHtml(previewSkin.tagline) : `The original ${escapeHtml(form.name)} silhouette${dyes.selected === "classic" ? " and colors." : ` wearing the ${escapeHtml(G.costumeById(dyes.selected).name)} dye.`}`}</p>
          ${previewSkin && !owned ? `<div class="unlock-panel">🔒 Reach ${escapeHtml(form.name)} level ${previewSkin.unlockLevel}. Current level: ${G.formLevel(form.id)}.</div>` : ""}
          <button data-act="equip-skin" ${previewSkin && !owned || (previewSkin ? equipped?.id === previewSkin.id : !equipped) ? "disabled" : ""}>${previewSkin && !owned ? "Mastery required" : previewSkin ? equipped?.id === previewSkin.id ? "Signature worn" : "Wear signature" : !equipped ? "Classic worn" : "Wear classic"}</button>
        </div>
      </section>
      <div class="skin-tile-grid">
        <button data-skin-preview="classic" class="skin-tile ${labSkinId === "classic" ? "selected" : ""} ${!equipped ? "equipped" : ""}">
          ${previewCanvas(form.id, "classic", "skin-tile-preview", `${form.name} Classic`, false, true)}<strong>✨ Classic</strong><small>${dyes.selected === "classic" ? "Original colors" : G.costumeById(dyes.selected).name + " dye"}</small></button>
        <button data-skin-preview="${signature.id}" class="skin-tile ${labSkinId === signature.id ? "selected" : ""} ${equipped?.id === signature.id ? "equipped" : ""} ${owned ? "" : "locked"}">
          ${previewCanvas(form.id, signature.id, "skin-tile-preview", signature.name, !owned, false)}<strong>${signature.icon} ${escapeHtml(signature.name)}</strong><small>${owned ? equipped?.id === signature.id ? "WORN" : "Signature look" : `🔒 Level ${signature.unlockLevel}`}</small></button>
      </div>
      <details class="dye-drawer"><summary>🎨 Global dyes <span>${escapeHtml(G.costumeById(dyes.selected).name)} selected</span></summary>
        <p>Dyes recolor each classic shape. Signature looks keep their own colors and silhouette.</p>
        <div class="dye-grid">${G.COSTUMES.map((costume) => {
          const unlocked = dyes.unlocked.includes(costume.id);
          const wearing = dyes.selected === costume.id;
          return `<button data-costume="${costume.id}" class="dye-tile ${wearing ? "selected" : ""}" ${unlocked ? "" : "disabled"}>
            <span>${costume.swatches.map((color) => `<i style="background:${color}"></i>`).join("")}</span><strong>${costume.icon} ${escapeHtml(costume.name)}</strong><small>${unlocked ? wearing ? "SELECTED" : "Apply dye" : `🔒 ${escapeHtml(costume.hint)}`}</small></button>`;
        }).join("")}</div>
      </details>`;
  }

  function drawFormPreviews(force) {
    const now = Date.now();
    if (!force && now - lastFormPreviewDraw < 160) return;
    lastFormPreviewDraw = now;
    const frame = Math.floor(now / 360) % 2;
    menuEl.querySelectorAll("canvas[data-form-preview]").forEach((canvas) => {
      const form = G.forms[canvas.dataset.formPreview];
      if (!form) return;
      let sprite = G.formPreviewSprite(form.id, canvas.dataset.previewSkin);
      if (canvas.dataset.previewDye === "true" && canvas.dataset.previewSkin === "classic") sprite = G.costumedSprite(form.sprite);
      const rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : null;
      const cssW = Math.max(1, Math.round(rect && rect.width ? rect.width : canvas.width));
      const cssH = Math.max(1, Math.round(rect && rect.height ? rect.height : canvas.height));
      const previewDensity = G.hdPilot ? 2 : 1;
      const backingW = cssW * previewDensity, backingH = cssH * previewDensity;
      if (canvas.width !== backingW) canvas.width = backingW;
      if (canvas.height !== backingH) canvas.height = backingH;
      const c = canvas.getContext("2d");
      c.imageSmoothingEnabled = false;
      const w = canvas.width, h = canvas.height;
      const skin = canvas.dataset.previewSkin !== "classic" && G.skinById(canvas.dataset.previewSkin);
      const accent = skin ? skin.colors[3] : (form.sprite.palette.a || form.sprite.palette.w || "#73eff7");
      const gradient = c.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, "#20263b"); gradient.addColorStop(1, "#111522");
      c.fillStyle = gradient; c.fillRect(0, 0, w, h);
      c.globalAlpha = 0.12; c.fillStyle = accent; c.beginPath(); c.arc(w / 2, h * 0.54, w * 0.34, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 0.32; c.fillStyle = accent; c.fillRect(w * 0.23, h - 20, w * 0.54, 2);
      c.globalAlpha = 1;
      const made = G.spriteMetrics ? G.spriteMetrics(sprite) : G.makeSprite(sprite);
      const logicalW = made.logicalW || made.w, logicalH = made.logicalH || made.h;
      const scale = Math.max(2, Math.min(7, Math.floor(Math.min((w - 24) / (logicalW + 2), (h - 28) / (logicalH + 2)))));
      G.drawSprite(c, sprite, frame, w / 2, h - 19, false, scale);
      if (canvas.dataset.previewLocked === "true") {
        c.globalCompositeOperation = "source-atop"; c.fillStyle = "#252a40"; c.fillRect(0, 0, w, h); c.globalCompositeOperation = "source-over";
        c.fillStyle = "rgba(17,21,34,0.56)"; c.fillRect(0, 0, w, h);
        c.font = '28px "Press Start 2P", monospace'; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#94b0c2"; c.fillText("?", w / 2, h / 2);
      }
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
          <div class="passive-rule"><strong>◆ ${f.passive.name}</strong><span>${f.passive.description}</span></div>
          <div>❤️ ${f.hearts} &nbsp; 👟 ${f.speed} &nbsp; ${dmgChip(G.abilities[f.basic] ? G.abilities[f.basic].type : "blunt")}</div>
          <button data-become="${id}" ${current ? "disabled" : ""}>${current ? "You are this!" : "Become " + f.name}</button>
        </div>`;
      } else if (ready) {
        const echo = G.formEchoFor ? G.formEchoFor(id) : null;
        const echoMap = echo && G.maps[echo.mapId];
        html += `<div class="form-card ready">
          <h2>${f.icon} ${f.name} <span class="ready-label">CHALLENGE COMPLETE</span></h2>
          <div class="tagline">${f.tagline}</div>
          <div class="unlock-progress">${G.unlockHint(id)}</div>
          ${echo ? `<div class="unlock-progress">✦ Echo waiting ${echo.mapId === G.state.mapId ? "nearby" : "in " + (echoMap ? echoMap.name : echo.mapId)}</div>
            <button data-form-echo-guide="${id}">Guide me to the echo</button>`
          : `<div class="unlock-progress">Win a battle and watch what remains.</div>`}
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
      <h2>📌 ${pins.length} quest${pins.length === 1 ? "" : "s"} tracked on screen</h2>
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
        html += `<div class="tagline">Collect every trophy to earn the Guardian Compass, bonus stars, town spirit, and a place on the Hero Board.</div>`;
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
    const ranked = avail.slice().sort((a, b) => {
      const aMatch = G.passives && G.passives.formMatches(f, G.abilities[a]) ? 1 : 0;
      const bMatch = G.passives && G.passives.formMatches(f, G.abilities[b]) ? 1 : 0;
      return bMatch - aMatch;
    });
    const letters = ["A", "B", "C"];

    let html = `<div class="form-card current"><h2>${f.icon} ${f.name}'s moves</h2>
      <div class="tagline">B and C can hold any unlocked ability. ★ marks moves transformed by this form.</div>
      <div class="passive-rule"><strong>◆ ${f.passive.name}</strong><span>${f.passive.description}</span></div>`;
    html += `<div class="slot-row"><span class="slot-label">A (basic)</span><span class="fixed">${abilityLabel(lo[0], f)}</span></div>`;
    for (let s = 1; s <= f.slots; s++) {
      const selected = G.abilities[lo[s]];
      const synergy = selected && G.passives ? G.passives.synergyText(f, selected) : "";
      html += `<div class="slot-row"><span class="slot-label">${letters[s]}</span>
        <select data-slot="${s}">
          ${ranked.map((id) => `<option value="${id}" ${lo[s] === id ? "selected" : ""}>${abilityLabel(id, f)}</option>`).join("")}
        </select>${synergy ? `<span class="synergy-note">★ ${synergy}</span>` : `<span class="synergy-note quiet">No passive bonus — still useful for its ward type.</span>`}</div>`;
    }
    html += `</div>`;

    html += `<div class="form-card"><h2>🧪 Your ability collection</h2>` +
      ranked.map((id) => `<div class="quest-row"><span>${abilityLabel(id, f)}</span></div>`).join("") +
      `</div>`;
    return html;
  }

  function atlasRegions() {
    return G.WAYFINDER_REGIONS.concat(G.WORLDWAKE_REGIONS || []);
  }

  function atlasRegionFound(id) {
    const legacy = G.wayfinderRegion(id);
    return legacy ? G.wayfinderDiscovered(id) : G.ensureWorldwake().discovered.includes(id);
  }

  function atlasCurrentRegion() {
    if (G.wayfinderRegionInfo(G.state.mapId)) return G.state.mapId;
    const exit = G.state.mapDef && G.state.mapDef.bossTrial && G.state.mapDef.bossTrial.exit;
    if (exit && G.wayfinderRegionInfo(exit.map)) return exit.map;
    if (G.state.mapId === "town" || G.state.mapId === "playerHouse") return "overworld";
    return "overworld";
  }

  function atlasRegionForMap(mapId) {
    if (G.wayfinderRegionInfo(mapId)) return mapId;
    const map = G.maps[mapId];
    const exit = map && map.bossTrial && map.bossTrial.exit;
    if (exit && G.wayfinderRegionInfo(exit.map)) return exit.map;
    if (mapId === "town" || mapId === "playerHouse" || mapId === "dungeon") return "overworld";
    return "overworld";
  }

  function atlasSelectedRegion() {
    const current = atlasCurrentRegion();
    if (!G.wayfinderRegionInfo(atlasSelectedId)) atlasSelectedId = current;
    return G.wayfinderRegionInfo(atlasSelectedId) || G.wayfinderRegionInfo(current);
  }

  function atlasInboundLock(id) {
    let locked = null;
    let foundRoute = false;
    for (const map of Object.values(G.maps)) for (const cell of Object.values(map.legend || {})) {
      if (!cell.portal || cell.portal.map !== id) continue;
      foundRoute = true;
      const reason = G.world.portalBlockReason(cell);
      if (!reason) return null;
      if (!locked) locked = reason;
    }
    return foundRoute ? locked : null;
  }

  function atlasLandmarksForRegion(id) {
    return G.discoveredWayfinderLandmarks().filter((map) =>
      map.bossTrial && map.bossTrial.exit && map.bossTrial.exit.map === id);
  }

  function buildWorldAtlas() {
    const current = atlasCurrentRegion();
    const selected = atlasSelectedRegion();
    const mainGoal = G.storyGoal ? G.storyGoal() : null;
    const canTravel = G.canWayfinderTravel();
    const legendEcho = G.legendEchoFor && G.legendEchoFor(G.state.formId);
    const legendRegion = legendEcho ? atlasRegionForMap(legendEcho.mapId) : null;
    const nodesById = Object.fromEntries(G.WAYFINDER_ATLAS_NODES.map((node) => [node.id, node]));
    const lines = G.WAYFINDER_ATLAS_EDGES.map(([from, to]) => {
      const a = nodesById[from], b = nodesById[to];
      const open = atlasRegionFound(from) && atlasRegionFound(to);
      return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${open ? "known" : "unknown"}"/>`;
    }).join("");
    const nodes = G.WAYFINDER_ATLAS_NODES.map((node) => {
      const region = G.wayfinderRegionInfo(node.id);
      const found = atlasRegionFound(node.id);
      const here = current === node.id;
      const awake = G.wayfinderPostActivated(node.id);
      const incidentCount = G.incidentsForMap ? G.incidentsForMap(node.id).length : 0;
      const storyRoute = !!(mainGoal && mainGoal.mapId === node.id && !mainGoal.complete);
      const legendRoute = legendRegion === node.id;
      const classes = [found ? "known" : "unknown", here ? "here" : "", awake ? "awake" : "",
        selected.id === node.id ? "selected" : "", incidentCount ? "incident" : "", storyRoute ? "story-route" : "",
        legendRoute ? "legend-route" : ""].filter(Boolean).join(" ");
      return `<button class="atlas-node ${classes}" style="left:${node.x}%;top:${node.y}%" data-map-node="${node.id}"
        aria-label="${found ? escapeHtml(region.name) : "Undiscovered region"}${here ? ", you are here" : ""}">
        <span class="atlas-icon">${found ? region.icon : "?"}</span>
        <span class="atlas-name">${found ? escapeHtml(region.name) : "Unknown"}</span>
        ${incidentCount ? `<span class="atlas-incident-count">⚑${incidentCount}</span>` : ""}
        ${storyRoute ? `<span class="atlas-story-badge">MAIN PATH</span>` : ""}
        ${legendRoute ? `<span class="atlas-legend-badge">✦ LEGEND</span>` : ""}
        ${here ? `<span class="you-are-here">YOU ARE HERE</span>` : ""}
      </button>`;
    }).join("");

    const found = atlasRegionFound(selected.id);
    const here = current === selected.id;
    const awake = G.wayfinderPostActivated(selected.id);
    const isWorldwake = !!(G.worldwakeRegion && G.worldwakeRegion(selected.id));
    const inboundLock = atlasInboundLock(selected.id);
    const requirement = inboundLock ? inboundLock.text : selected.stars ? `${selected.stars} stars required` : "Open road";
    const landmarks = atlasLandmarksForRegion(selected.id);
    const incidents = G.incidentsForMap ? G.incidentsForMap(selected.id) : [];
    const travelAttr = isWorldwake ? `data-worldwake-region="${selected.id}"` : `data-travel-region="${selected.id}"`;
    let action = "";
    if (found && awake) {
      action = `<button class="atlas-travel" ${travelAttr} ${here || !canTravel ? "disabled" : ""}>${here ?
        "You are here" : canTravel ? `Travel to ${escapeHtml(selected.name)}` : "Travel unavailable"}</button>`;
    } else if (found) {
      action = `<div class="atlas-lock">Find this region's glowing Wayfinder Post to add it to the travel network.</div>`;
    } else {
      action = `<div class="atlas-lock">${inboundLock ? escapeHtml(inboundLock.text) : "Discover this region on foot to awaken its route."}</div>`;
    }

    const purification = isWorldwake && G.worldwakePurified(selected.id)
      ? `<span class="atlas-status good">WORLD MARK RESTORED</span>` : "";
    return `<div class="atlas-world" aria-label="World route map">
        <svg class="atlas-routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>
        <div class="atlas-old-label">THE OLD WORLD</div><div class="atlas-wake-label">THE WORLDWAKE ROAD</div>
        ${nodes}
      </div>
      <div class="atlas-detail form-card ${here ? "current" : ""}">
        <div class="atlas-detail-heading"><h2>${found ? `${selected.icon} ${escapeHtml(selected.name)}` : "❔ Undiscovered region"}</h2>
          ${here ? `<span class="atlas-status here">CURRENT REGION</span>` : purification}</div>
        <div class="tagline">${escapeHtml(selected.clue)}</div>
        <div class="atlas-facts">
          <span>🚪 ${escapeHtml(requirement)}</span>
          <span>${awake ? "🧭 Post awakened" : "◇ Post unknown"}</span>
        </div>
        ${landmarks.length ? `<div class="atlas-landmark-chips"><strong>KNOWN LANDMARKS</strong>${landmarks.map((map) =>
          `<span>◆ ${escapeHtml(map.name)}</span>`).join("")}</div>` : ""}
        ${incidents.length ? `<div class="atlas-incidents"><strong>⚑ ACTIVE SITUATIONS</strong>${incidents.map((incident) =>
          `<div class="quest-row"><span>${incident.icon} ${escapeHtml(incident.name)}<small>${escapeHtml(incident.text)}</small></span><span class="prog">${G.incidentProgressLabel(incident)}</span></div>`).join("")}</div>` : ""}
        ${action}
      </div>`;
  }

  function localMapExits() {
    const exits = [];
    const seen = new Set();
    for (const row of G.state.grid || []) for (const cell of row || []) {
      if (!cell || !cell.portal || seen.has(cell.portal.map)) continue;
      seen.add(cell.portal.map);
      exits.push({
        name: (G.maps[cell.portal.map] && G.maps[cell.portal.map].name) || cell.portal.map,
        reason: G.world.portalBlockReason(cell),
      });
    }
    return exits;
  }

  function drawLocalAtlas() {
    const canvas = menuEl.querySelector("#local-atlas-canvas");
    if (!canvas || !G.state.grid) return;
    const width = 900;
    const height = Math.max(260, Math.min(520, Math.round(width * G.state.mapH / G.state.mapW)));
    canvas.width = width;
    canvas.height = height;
    const c = canvas.getContext("2d");
    const sx = width / G.state.mapW;
    const sy = height / G.state.mapH;
    const colors = { tree: "#1e5f4e", water: "#3b5dc9", wall: "#333c57", rock: "#566c86",
      floor: "#4a5b74", path: "#8a6538", grass: "#257179" };
    c.fillStyle = "#1a1c2c";
    c.fillRect(0, 0, width, height);
    for (let y = 0; y < G.state.mapH; y++) for (let x = 0; x < G.state.mapW; x++) {
      const cell = G.state.grid[y][x];
      c.fillStyle = colors[cell.tile] || colors.grass;
      c.fillRect(Math.floor(x * sx), Math.floor(y * sy), Math.ceil(sx) + 1, Math.ceil(sy) + 1);
      if (cell.portal) {
        const blocked = G.world.portalBlockReason(cell);
        c.fillStyle = blocked ? "#b13e53" : "#ffcd75";
        c.fillRect(Math.floor(x * sx), Math.floor(y * sy), Math.max(3, Math.ceil(sx)), Math.max(3, Math.ceil(sy)));
      }
    }
    const post = G.state.wayfinderPost;
    if (post) {
      const x = post.x / G.TILE * sx;
      const y = post.y / G.TILE * sy;
      c.fillStyle = "#73eff7";
      c.beginPath(); c.arc(x, y, Math.max(5, Math.min(sx, sy) * 1.15), 0, Math.PI * 2); c.fill();
      c.strokeStyle = "#f4f4f4"; c.lineWidth = 2; c.stroke();
    }
    const legendEcho = G.currentLegendEcho && G.currentLegendEcho();
    if (legendEcho) {
      const x = legendEcho.x / G.TILE * sx;
      const y = legendEcho.y / G.TILE * sy;
      const color = G.LEGEND_DEFS[legendEcho.formId].color;
      c.save(); c.translate(x, y); c.rotate(Math.PI / 4);
      c.fillStyle = color; c.fillRect(-7, -7, 14, 14);
      c.fillStyle = "#fff3c2"; c.fillRect(-3, -3, 6, 6);
      c.restore();
    }
    const px = G.state.player.x / G.TILE * sx;
    const py = G.state.player.y / G.TILE * sy;
    c.fillStyle = "#f4f4f4";
    c.beginPath(); c.arc(px, py, Math.max(5, Math.min(sx, sy)), 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#ffcd75"; c.lineWidth = 3; c.stroke();
  }

  function buildLocalAtlas() {
    const exits = localMapExits();
    return `<div class="local-atlas form-card current">
      <div class="atlas-detail-heading"><h2>📍 ${escapeHtml(G.state.mapDef.name || G.state.mapId)}</h2><span class="atlas-status here">YOU ARE HERE</span></div>
      <canvas id="local-atlas-canvas" aria-label="Map of the current area"></canvas>
      <div class="local-map-legend"><span><i class="player"></i>You</span><span><i class="legend-echo"></i>Legend Echo</span><span><i class="post"></i>Wayfinder Post</span><span><i class="exit"></i>Open exit</span><span><i class="locked-exit"></i>Locked exit</span></div>
    </div>
    <div class="form-card"><h2>🚪 Routes from here</h2>
      ${exits.length ? exits.map((exit) => `<div class="quest-row ${exit.reason ? "" : "done"}"><span>${exit.reason ? "🔒" : "➜"} ${escapeHtml(exit.name)}</span><span class="prog">${exit.reason ? escapeHtml(exit.reason.text) : "Open"}</span></div>`).join("") :
        `<div class="tagline">This place has no ordinary road out. Use its story exit or return portal.</div>`}
    </div>`;
  }

  function buildJourneyNotes() {
    const progress = G.wayfinderProgress();
    const journal = G.ensureWayfinder();
    const campaign = G.ensureWorldwake();
    const landmarks = G.discoveredWayfinderLandmarks();
    const canTravel = G.canWayfinderTravel();
    let html = `<details class="atlas-journal"><summary>📖 Journey notes and completion</summary>
      <div class="form-card">
        <div class="quest-row"><span>Old-world regions</span><span class="prog">${progress.found}/${progress.total}</span></div>
        <div class="quest-row"><span>Worldwake regions</span><span class="prog">${campaign.discovered.length}/${G.WORLDWAKE_REGIONS.length}</span></div>
        <div class="quest-row"><span>Hidden landmarks</span><span class="prog">${progress.landmarksFound}/${progress.landmarksTotal}</span></div>
        <div class="quest-row"><span>World Marks</span><span class="prog">${campaign.marks.length}/${Object.keys(G.WORLDWAKE_MARKS).length}</span></div>
      </div>
      <div class="form-card"><h2>🎁 Wayfinder milestones</h2>
        <div class="quest-row ${journal.posts.length ? "done" : ""}"><span>Awaken your first post</span><span class="prog">${journal.posts.length ? "Post travel" : "Find one"}</span></div>
        <div class="quest-row ${journal.whistleClaimed ? "done" : ""}"><span>Discover 4 old-world regions</span><span class="prog">${journal.whistleClaimed ? "Whistle earned" : `${Math.min(4, progress.found)}/4`}</span></div>
        <div class="quest-row ${journal.rewardClaimed ? "done" : ""}"><span>Discover all 8 old-world regions</span><span class="prog">${journal.rewardClaimed ? "+3 ⭐ · landmark travel" : `${progress.found}/8`}</span></div>
      </div>
      <div class="form-card"><h2>📍 Discovered landmarks</h2>`;
    if (!landmarks.length) html += `<div class="tagline">Trials, dens, and the coliseum appear here after you enter them.</div>`;
    for (const map of landmarks) {
      html += `<div class="landmark-route"><span>✅ ${escapeHtml(map.name)}</span>${journal.rewardClaimed ?
        `<button class="travel-btn" data-travel-landmark="${map.id}" ${G.state.mapId === map.id || !canTravel ? "disabled" : ""}>${G.state.mapId === map.id ? "You are here" : "Travel"}</button>` :
        `<small>Complete The Long Way Around for direct travel.</small>`}</div>`;
    }
    html += `</div><div class="form-card"><h2>🛶 Caravan favors</h2>`;
    for (const favor of G.WORLDWAKE_FAVORS) {
      const done = campaign.favorsDone.includes(favor.id);
      const value = Math.min(favor.count, G.worldwakeFavorProgress(favor));
      html += `<div class="quest-row ${done ? "done" : ""}"><span>${done ? "✅" : "⬜"} ${escapeHtml(favor.name)}<small>${escapeHtml(favor.text)}</small></span><span class="prog">${value}/${favor.count}</span></div>`;
    }
    return html + `</div></details>`;
  }

  function buildWayfinderTab() {
    const canTravel = G.canWayfinderTravel();
    const goal = G.storyGoal();
    return `<div class="atlas-header">
      <div><h2>🧭 Wayfinder Atlas</h2><div class="tagline">See where you are, follow the roads, and travel between awakened posts.</div></div>
      <div class="atlas-view-tabs">
        <button data-atlas-view="world" class="${atlasView === "world" ? "active" : ""}">WORLD</button>
        <button data-atlas-view="local" class="${atlasView === "local" ? "active" : ""}">LOCAL</button>
      </div>
    </div>
    <div class="atlas-story-callout"><span>${goal.act.icon}</span><div><strong>ACT ${goal.chapter + 1} · ${escapeHtml(goal.short)}</strong><small>${escapeHtml(goal.destination)} is marked as the main path.</small></div></div>
    ${atlasView === "world" ? buildWorldAtlas() : buildLocalAtlas()}
    <div class="atlas-travel-rule ${canTravel ? "ready" : ""}">🧭 ${escapeHtml(G.wayfinderTravelReason())}</div>
    ${buildJourneyNotes()}`;
  }

  function buildTownTab() {
    const town = G.ensureTown();
    const townName = escapeHtml(town.name);
    if (!town.founded) {
      return `<div class="form-card current">
        <h2>☀️ Found Your Town</h2>
        <div class="tagline">Claim your first new form to begin a home that grows with every kind of adventure.</div>
        <button data-act="found-town">Found town</button>
      </div>`;
    }

    const capacity = G.townCapacity();
    const festivalCost = G.townFestivalCost();
    const festivalActive = G.townFestivalActive();
    const projectCards = G.TOWN_PROJECTS.map((project) => {
      const built = G.townProjectBuilt(project.id);
      const affordable = town.spirit >= project.cost;
      return `<article class="town-project ${built ? "built" : affordable ? "affordable" : ""}">
        <div class="town-project-icon">${project.icon}</div>
        <div class="town-project-copy"><h3>${escapeHtml(project.name)}</h3><p>${escapeHtml(project.text)}</p><small>${escapeHtml(project.effect)}</small></div>
        ${built ? `<span class="town-built">BUILT</span>` : `<button data-town-project="${project.id}" ${affordable ? "" : "disabled"}>${project.cost} spirit</button>`}
      </article>`;
    }).join("");
    const beautyComplete = town.beautifications >= G.TOWN_BEAUTIFICATION_LIMIT;
    const feastReady = G.state.mapId === "town" &&
      (G.state.player.damageTaken > 0 || G.state.player.mana < G.playerMaxMana());

    return `<section class="town-hero form-card current">
      <div><span class="eyebrow">A HOME BUILT TOGETHER</span><h2>☀️ ${townName}</h2>
        <div class="tagline">Earn spirit out in the world. Choose what kind of town it becomes.</div></div>
      <div class="town-spirit-purse"><strong>${town.spirit}</strong><span>TOWN SPIRIT</span></div>
      <div class="town-stat-strip">
        <span><strong>LV ${G.townLevel()}</strong> town</span><span><strong>${town.residents}/${capacity}</strong> residents</span>
        <span><strong>${town.houses.length}</strong> houses</span><span><strong>${G.townProjectCount()}/5</strong> projects</span>
      </div>
      <div class="town-main-actions"><button data-act="visit-town">Visit town</button><button data-act="rename-town">Rename</button></div>
    </section>
    <section class="form-card town-works">
      <span class="eyebrow">LANDMARK PROJECTS</span><h2>🏗️ Civic Works</h2>
      <div class="tagline">Each project changes Sunrise Town, helps it flourish, and takes its place among the streets.</div>
      <div class="town-project-grid">${projectCards}</div>
    </section>
    <section class="form-card town-services">
      <span class="eyebrow">FOR THE NEIGHBOURS</span><h2>🤝 Community Fund</h2>
      <div class="town-service-grid">
        <article><div><strong>🎉 Hold a festival</strong><small>${G.townFestivalMinutes()} minutes · attracts ${G.townProjectBuilt("festivalStage") ? 2 : 1} resident${G.townProjectBuilt("festivalStage") ? "s" : ""} · every third raises town level</small></div>
          <button data-act="festival" ${festivalActive || town.spirit < festivalCost ? "disabled" : ""}>${festivalActive ? "Celebrating" : `${festivalCost} spirit`}</button></article>
        <article><div><strong>📨 Sponsor a newcomer</strong><small>${town.residents >= capacity ? "Build more capacity first" : "Welcome a new neighbour to town"}</small></div>
          <button data-act="sponsor-resident" ${town.residents >= capacity || town.spirit < G.townSponsorCost() ? "disabled" : ""}>${G.townSponsorCost()} spirit</button></article>
        <article><div><strong>🌷 Beautify the town</strong><small>${beautyComplete ? "Every planned corner is complete" : `Add lanterns, gardens, benches, and banners · ${town.beautifications}/${G.TOWN_BEAUTIFICATION_LIMIT}`}</small></div>
          <button data-act="beautify-town" ${beautyComplete || town.spirit < G.townBeautificationCost() ? "disabled" : ""}>${beautyComplete ? "Complete" : `${G.townBeautificationCost()} spirit`}</button></article>
        <article><div><strong>🍲 Host a town feast</strong><small>Served at home · fully restores hearts and mana</small></div>
          <button data-act="town-feast" ${!feastReady || town.spirit < 5 ? "disabled" : ""}>5 spirit</button></article>
      </div>
    </section>
    <section class="form-card town-guide">
      <h2>Where spirit flows</h2>
      <div class="quest-row"><span>Build on an empty town plot</span><span class="prog">${G.townHouseCost()} spirit</span></div>
      <div class="quest-row"><span>Five ordinary victories</span><span class="prog">+2 spirit</span></div>
      <div class="quest-row"><span>Claim a form / break a ward</span><span class="prog">+3 / +1</span></div>
      <div class="quest-row"><span>Incidents, Expeditions, Hero Board</span><span class="prog">major rewards</span></div>
      ${(G.state.items || []).includes("sunrise-banner") ? `<div class="quest-row done"><span>🚩 Sunrise Banner</span><span class="prog">festival duration ×2</span></div>` : ""}
    </section>`;
  }

  function buildExpeditionTab() {
    const progress = G.ensureExpeditionProgress();
    const run = G.state.expeditionRun;
    if (!run) {
      const longUnlocked = G.unlockedForms().length >= 5;
      return `<div class="form-card current expedition-intro">
        <span class="eyebrow">THE EVER-CHANGING ROAD</span><h2>◇ Manyfold Expeditions</h2>
        <div class="tagline">Choose a route, overcome each chamber, and gather borrowed forms, arts, and blessings. If the road defeats you, it returns you home unchanged.</div>
        <div class="quest-row"><span>Crossings begun</span><span class="prog">${progress.runs}</span></div>
        <div class="quest-row"><span>Victories</span><span class="prog">${progress.victories}</span></div>
        <div class="quest-row"><span>Farthest chamber</span><span class="prog">${progress.bestRoom}</span></div>
        <div class="quest-row"><span>Longest crossing</span><span class="prog">${progress.longestWin || "—"}</span></div>
        <div class="slot-row"><span class="slot-label">Path length</span><select data-expedition-length>
          <option value="5">Trail · 5 chambers</option>${longUnlocked ? `<option value="7">Deep path · 7 chambers</option>` : ""}
          ${G.unlockedForms().length >= 10 ? `<option value="9">Worldfold · 9 chambers</option>` : ""}
        </select></div>
        <button data-act="start-expedition">Enter the shifting path</button>
      </div><div class="form-card"><h2>Crossing the Manyfold</h2>
        <div class="quest-row"><span>① Choose a route</span><span class="prog">danger and treasure</span></div>
        <div class="quest-row"><span>② Overcome the chamber</span><span class="prog">your adventure is untouched</span></div>
        <div class="quest-row"><span>③ Claim one gift</span><span class="prog">fades when you return</span></div>
        <div class="quest-row"><span>④ Defeat the final champion</span><span class="prog">town rewards</span></div></div>`;
    }

    const boonCatalog = G.EXPEDITION_BOONS || {};
    const boonNames = Object.entries(run.boons).filter(([, count]) => count).map(([id, count]) => {
      const boon = boonCatalog[id];
      return boon ? `${boon.icon} ${boon.name}${count > 1 ? ` ×${count}` : ""}` : id;
    });
    let body = `<div class="form-card current"><span class="eyebrow">CROSSING IN PROGRESS</span>
      <h2>◇ Chamber ${Math.min(run.room + 1, run.length)}/${run.length}</h2>
      <div class="quest-row"><span>Chambers cleared</span><span class="prog">${run.wins}</span></div>
      <div class="tagline">${boonNames.length ? boonNames.join(" · ") : "No gifts yet. The first waits ahead."}</div></div>`;
    if (run.phase === "route") {
      body += `<div class="expedition-choice-grid">${run.routeChoices.map((route) => `<button class="expedition-choice" data-expedition-route="${route.id}">
        <span class="choice-icon">${route.icon}</span><strong>${escapeHtml(route.name)}</strong><small>${escapeHtml(route.risk)}</small><em>${escapeHtml(route.reward)}</em>
      </button>`).join("")}</div>`;
    } else if (run.phase === "reward") {
      body += `<div class="form-card"><h2>Choose one gift</h2><div class="tagline">The Manyfold lends its power only until you return home.</div></div>
        <div class="expedition-choice-grid draft-grid">${run.draftOptions.map((option, index) => `<button class="expedition-choice" data-expedition-draft="${index}">
          <span class="choice-icon">${option.icon}</span><strong>${escapeHtml(option.name)}</strong><small>${escapeHtml(option.text)}</small><em>CLAIM</em>
        </button>`).join("")}</div>`;
    } else {
      body += `<div class="form-card"><h2>The chamber is waiting</h2><div class="tagline">Return to battle. A new gift will appear when the last foe falls.</div></div>`;
    }
    return body + `<div class="form-card"><button data-act="abandon-expedition" class="danger">Return home</button></div>`;
  }

  function buildGauntletTab() {
    const pool = G.gauntletBossPool();
    const current = G.state.gauntletRun;
    if (current) {
      return `<div class="form-card current">
        <h2>🏟 Gauntlet in progress</h2>
        <div class="tagline">Round ${Math.min(current.index + 1, current.bosses.length)}/${current.bosses.length} · ${current.recovery ? "campfires lit" : "unbroken procession"}</div>
        <div class="quest-row"><span>Guardians defeated</span><span class="prog">${current.wins}</span></div>
      </div>`;
    }
    const choices = [3, 5, 8].filter((count) => count <= pool.length);
    const options = choices.map((count) => `<option value="${count}">${count} bosses</option>`).join("") +
      `<option value="all">All ${pool.length} defeated bosses</option>`;
    return `<div class="form-card current">
      <h2>🏟 Manyfold Gauntlet</h2>
      <div class="tagline">Choose how many defeated guardians to face in succession. Their order changes with every procession.</div>
      <div class="quest-row"><span>Available guardians</span><span class="prog">${pool.length}</span></div>
      <div class="quest-row"><span>Recovery record</span><span class="prog">${G.state.gauntletBest || 0}</span></div>
      <div class="quest-row"><span>Iron record</span><span class="prog">${G.state.gauntletIronBest || 0}</span></div>
      <div class="slot-row"><span class="slot-label">Run length</span><select data-gauntlet-count>${options}</select></div>
      <label class="quest-row"><span>Campfire between rounds<br><small>Restore all health and 3 mana</small></span><input data-gauntlet-recovery type="checkbox" checked></label>
      <button data-act="start-gauntlet">Enter the gauntlet</button>
    </div>
    <div class="form-card">
      <h2>🏆 Records</h2>
      <div class="tagline">A new personal best awards one star. Defeat the full procession to earn the Manyfold Crown: +2 maximum mana and one Second Wind in every gauntlet.</div>
      ${(G.state.items || []).includes("manyfold-crown") ? `<div class="quest-row done"><span>👑 Manyfold Crown</span><span class="prog">14 mana · Second Wind ready</span></div>` : ""}
    </div>`;
  }

  function buildHeroBoardTab() {
    const board = G.ensureHeroBoard();
    const progress = G.heroContractProgress();
    const milestones = [
      [3, "🎗 Wayfarer Ribbon", "leaves a shining trail"],
      [6, "🚩 Sunrise Banner", "festivals earn double spirit"],
      [10, "✨ Heroic Halo", "shines above every form"],
    ];
    let html = `<div class="form-card current">
      <h2>🧭 Hero Board</h2>
      <div class="tagline">Answer calls from across the world: explore forgotten roads, mix unlikely arts, change form, and face old guardians anew.</div>
      <div class="quest-row"><span>Renown</span><span class="prog">${board.renown}</span></div>
      <div class="quest-row"><span>Contracts completed</span><span class="prog">${board.completed}</span></div>`;
    if (progress) {
      html += `<div class="quest-row"><span>${progress.def.icon} ${progress.def.name}</span><span class="prog">${progress.label}</span></div>
        <div class="tagline">${progress.def.text}</div>`;
    } else {
      html += `<div class="tagline">A fresh request waits: patrols, lost roads, broken wards, strange combinations, or a guardian seeking another duel.</div>
        <button data-act="accept-contract">Take the next request</button>`;
    }
    html += `</div><div class="form-card"><h2>🏅 Renown rewards</h2>`;
    for (const [at, name, effect] of milestones) {
      html += `<div class="quest-row ${board.renown >= at ? "done" : ""}"><span>${name}</span><span class="prog">${board.renown >= at ? effect : `${board.renown}/${at}`}</span></div>`;
    }
    html += `<div class="tagline">Every completed request awards +1 star and 11–20 town spirit. The board never stays empty for long.</div></div>`;
    return html;
  }

  /* ---------- Form Workshop error panel ---------- */
  function closeWorkshop() {
    const el = document.getElementById("workshop-errors");
    workshopOpen = false;
    el.classList.add("hidden");
    G.menuController.reset(el);
    G.input.clearTaps();
  }

  function showWorkshop() {
    if (!G.workshopErrors.length) return;
    const el = document.getElementById("workshop-errors");
    el.innerHTML = `<div class="panel">
      <h1>🛠 The Form Workshop needs attention</h1>
      <p>Some forms or arts could not awaken. The rest of the adventure is ready:</p>
      <ul>${G.workshopErrors.map((e) => `<li><b>${e.where}:</b> ${e.msg}</li>`).join("")}</ul>
      <button id="workshop-ok">Continue with the forms that are ready ▶</button>
    </div>`;
    workshopOpen = true;
    el.classList.remove("hidden");
    document.getElementById("workshop-ok").addEventListener("click", closeWorkshop);
    if (G.input.hasGamepad) G.menuController.focusDefault(el, document.getElementById("workshop-ok"));
  }

  function updateWorkshopController(dt) {
    if (!workshopOpen) return;
    const el = document.getElementById("workshop-errors");
    G.menuController.update(el, {
      preferred: document.getElementById("workshop-ok"),
      onBack: closeWorkshop,
    }, dt);
  }

  return {
    toast, banner, dialogue, update, drawHUD, resizeOverlay,
    openMenu, openMap, openExpedition, closeMenu, toggleMenu, updateControllerMenu,
    showWorkshop, updateWorkshopController,
    openFormWheel, closeFormWheel, aimFormWheel, commitFormWheel, updateFormWheel,
    get menuOpen() { return menuOpen; },
    get workshopOpen() { return workshopOpen; },
    get formWheelOpen() { return formWheelOpen; },
    get dialogueOpen() { return !!dialogueData; },
    get dialogueQueueLength() { return dialogueQueue.length + (dialogueData ? 1 : 0); },
  };
})();
