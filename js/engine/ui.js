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
    c.fillStyle = "#41a6f6";
    c.fillRect(7, 17, Math.round(40 * (p.mana / p.manaMax)), 3);

    /* current form chip */
    c.font = `6px ${FONT_HEAD}`;
    const label = `${form.icon} ${form.name} Lv${G.formLevel(form.id)}`;
    const chipW = c.measureText(label).width + 6;
    c.fillStyle = "rgba(26,28,44,0.65)";
    c.fillRect(5, 24, chipW, 11);
    c.fillStyle = "#f4f4f4";
    c.fillText(label, 8, 27);

    /* stars (top right) */
    const starTxt = `⭐${G.state.stars}`;
    const sw = c.measureText(starTxt).width + 6;
    c.fillStyle = "rgba(26,28,44,0.65)";
    c.fillRect(G.W - sw - 4, 5, sw, 11);
    c.fillStyle = "#ffcd75";
    c.fillText(starTxt, G.W - sw - 1, 8);

    /* toasts (word-wrapped so long messages fit) */
    c.font = `9px ${FONT_BODY}`;
    let ty = 40;
    for (const t of toasts) {
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

  let activeTab = "forms";

  function openMenu() {
    menuOpen = true;
    buildMenu();
    menuEl.classList.remove("hidden");
  }
  function closeMenu() {
    menuOpen = false;
    menuEl.classList.add("hidden");
    G.input.clearTaps();
  }
  function toggleMenu() { menuOpen ? closeMenu() : openMenu(); }

  function buildMenu() {
    const tabs = [
      ["forms", "Forms"],
      ["quests", "Quests"],
      ["mix", "Mix"],
    ];
    let html = `<h1>Nobody's Quest</h1>
      <div class="stars">⭐ ${G.state.stars} stars</div>
      <div class="menu-tabs">${tabs.map(([id, label]) =>
        `<button data-tab="${id}" class="${activeTab === id ? "active" : ""}">${label}</button>`).join("")}
      </div>
      <div class="menu-body">`;

    if (activeTab === "forms") html += buildFormsTab();
    if (activeTab === "quests") html += buildQuestsTab();
    if (activeTab === "mix") html += buildMixTab();

    html += `</div>
      <div class="menu-footer">
        <button data-act="resume">▶ Back to the game</button><br>
        <button data-act="reset" class="danger">Start over (erases save!)</button>
      </div>`;

    menuEl.innerHTML = html;

    // wire up clicks
    menuEl.querySelectorAll("[data-tab]").forEach((b) =>
      b.addEventListener("click", () => { activeTab = b.dataset.tab; buildMenu(); }));
    menuEl.querySelectorAll("[data-become]").forEach((b) =>
      b.addEventListener("click", () => { G.setForm(b.dataset.become); buildMenu(); }));
    menuEl.querySelectorAll("select[data-slot]").forEach((sel) =>
      sel.addEventListener("change", () => {
        const lo = G.getLoadout(G.state.formId);
        lo[parseInt(sel.dataset.slot, 10)] = sel.value;
        btnCache = "";
        G.saveGame();
      }));
    const resume = menuEl.querySelector('[data-act="resume"]');
    if (resume) resume.addEventListener("click", closeMenu);
    const reset = menuEl.querySelector('[data-act="reset"]');
    if (reset) reset.addEventListener("click", () => {
      if (confirm("Really erase the save and start over?")) G.resetSave();
    });
  }

  function buildFormsTab() {
    let html = "";
    for (const id of G.formOrder) {
      const f = G.forms[id];
      if (f.invalid) continue;
      const unlocked = G.formUnlocked(id);
      const current = id === G.state.formId;
      if (unlocked) {
        html += `<div class="form-card ${current ? "current" : ""}">
          <h2>${f.icon} ${f.name} <span class="lvl">Lv${G.formLevel(id)}</span></h2>
          <div class="tagline">${f.tagline}</div>
          <div>❤️ ${f.hearts} &nbsp; 👟 ${f.speed} &nbsp; ${dmgChip(G.abilities[f.basic] ? G.abilities[f.basic].type : "blunt")}</div>
          <button data-become="${id}" ${current ? "disabled" : ""}>${current ? "You are this!" : "Become " + f.name}</button>
        </div>`;
      } else {
        html += `<div class="form-card locked">
          <h2>❓ ???</h2>
          <div class="tagline">${G.unlockHint(id)}</div>
        </div>`;
      }
    }
    return html;
  }

  function buildQuestsTab() {
    let html = "";
    for (const id of G.unlockedForms()) {
      const f = G.forms[id];
      html += `<div class="form-card"><h2>${f.icon} ${f.name} <span class="lvl">Lv${G.formLevel(id)}</span></h2>`;
      for (const q of f.quests) {
        const prog = G.questProgress(q);
        const done = G.questsDone.includes(q.id);
        html += `<div class="quest-row ${done ? "done" : ""}">
          <span>${done ? "✅" : "⬜"} ${q.text}</span>
          <span class="prog">${done ? "⭐" : prog + "/" + q.count}</span>
        </div>`;
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
