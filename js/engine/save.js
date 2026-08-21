/* ============================================================
   SAVE — three independent adventures on this device.

   Old one-save browsers migrate safely into Slot 1. The legacy value is
   deliberately left untouched as a recovery copy; a migration marker keeps
   it from reappearing after the player later clears Slot 1.
   ============================================================ */

"use strict";

const LEGACY_SAVE_KEY = "nobodys-quest-save-v1";
const SLOT_KEY_PREFIX = "nobodys-quest-save-v2-slot-";
const ACTIVE_SLOT_KEY = "nobodys-quest-active-slot";
const MIGRATION_KEY = "nobodys-quest-slots-migrated";
const AUTO_START_KEY = "nobodys-quest-auto-start";
const SAVE_SLOT_COUNT = 3;
let titleViewportCleanup = null;

function bindTitleViewport(overlay) {
  if (titleViewportCleanup) titleViewportCleanup();
  if (typeof window === "undefined") return () => {};

  let settleTimers = [];
  const sync = () => {
    const viewport = window.visualViewport;
    const width = Math.round(viewport ? viewport.width : window.innerWidth);
    const height = Math.round(viewport ? viewport.height : window.innerHeight);
    const left = Math.round(viewport ? viewport.offsetLeft : 0);
    const top = Math.round(viewport ? viewport.offsetTop : 0);
    const portrait = height > width;

    overlay.classList.toggle("title-portrait", portrait);
    overlay.classList.toggle("title-landscape", !portrait);
    overlay.classList.toggle("title-short-landscape", !portrait && height <= 430);
    overlay.style.left = `${left}px`;
    overlay.style.top = `${top}px`;
    overlay.style.right = "auto";
    overlay.style.bottom = "auto";
    overlay.style.width = `${width}px`;
    overlay.style.height = `${height}px`;
    overlay.style.setProperty("--title-vh", `${height}px`);
  };
  const settle = () => {
    sync();
    window.requestAnimationFrame(() => {
      sync();
      window.requestAnimationFrame(sync);
    });
    settleTimers.forEach(window.clearTimeout);
    settleTimers = [window.setTimeout(sync, 80), window.setTimeout(sync, 240)];
  };

  sync();
  window.addEventListener("resize", settle);
  window.addEventListener("orientationchange", settle);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", settle);
    window.visualViewport.addEventListener("scroll", sync);
  }
  titleViewportCleanup = () => {
    window.removeEventListener("resize", settle);
    window.removeEventListener("orientationchange", settle);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener("resize", settle);
      window.visualViewport.removeEventListener("scroll", sync);
    }
    settleTimers.forEach(window.clearTimeout);
    titleViewportCleanup = null;
  };
  return titleViewportCleanup;
}

function slotNumber(value) {
  const slot = Number(value);
  return Number.isInteger(slot) && slot >= 1 && slot <= SAVE_SLOT_COUNT ? slot : 1;
}

function slotKey(slot) {
  return SLOT_KEY_PREFIX + slotNumber(slot);
}

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function migrateLegacySave() {
  try {
    if (localStorage.getItem(MIGRATION_KEY)) return;
    const anySlot = Array.from({ length: SAVE_SLOT_COUNT }, (_, index) =>
      localStorage.getItem(slotKey(index + 1))).some(Boolean);
    const legacy = localStorage.getItem(LEGACY_SAVE_KEY);
    if (!anySlot && legacy) localStorage.setItem(slotKey(1), legacy);
    localStorage.setItem(MIGRATION_KEY, "1");
  } catch (error) {
    // Storage can be blocked in private browsing. The game remains playable.
  }
}

migrateLegacySave();

G.activeSaveSlot = (() => {
  try { return slotNumber(localStorage.getItem(ACTIVE_SLOT_KEY)); }
  catch (error) { return 1; }
})();
G.saveSlotScreenOpen = false;

G.saveGame = function () {
  if (!G.state) return;
  const s = G.state;
  try {
    localStorage.setItem(slotKey(G.activeSaveSlot), JSON.stringify({
      savedAt: Date.now(),
      playSeconds: Math.max(0, Number(s.playSeconds) || 0),
      story: s.story,
      guidance: s.guidance,
      formId: s.formId,
      costumeId: s.costumeId,
      costumesUnlocked: s.costumesUnlocked,
      skinsUnlocked: s.skinsUnlocked,
      skinByForm: s.skinByForm,
      mapId: s.mapId,
      px: Math.round(s.player.x),
      py: Math.round(s.player.y),
      damageTaken: s.player.damageTaken,
      mana: s.player.mana,
      stars: s.stars,
      items: s.items,
      opened: s.opened,
      pantries: s.pantries,
      known: s.known,
      claimedForms: s.claimedForms,
      unlockReadyNotified: s.unlockReadyNotified,
      formEchoes: s.formEchoes,
      loadouts: s.loadouts,
      npcTalk: s.npcTalk,
      town: s.town,
      heroBoard: s.heroBoard,
      wayfinder: s.wayfinder,
      worldwake: s.worldwake,
      incidents: s.incidents,
      rivalState: s.rivalState,
      expedition: s.expedition,
      expeditionRun: s.expeditionRun,
      legends: s.legends,
      gauntletBest: s.gauntletBest || 0,
      gauntletIronBest: s.gauntletIronBest || 0,
      questCounts: G.questCounts,
      questsDone: G.questsDone,
      pinnedQuestIds: s.pinnedQuestIds,
      tutorialStep: G.tutorial ? G.tutorial.step : 0,
      tutorialDone: G.tutorial ? G.tutorial.done : false,
      tutorialSeen: G.tutorial ? G.tutorial.seen : false,
    }));
    localStorage.setItem(ACTIVE_SLOT_KEY, String(G.activeSaveSlot));
  } catch (error) {
    // storage full or blocked — the game still plays, just won't remember
  }
};

G.loadSaveData = function (slot) {
  return readJson(slotKey(slot === undefined ? G.activeSaveSlot : slot));
};

function derivedChapter(save) {
  if (!save) return 0;
  if (save.story && Number.isInteger(save.story.lastChapter)) return save.story.lastChapter;
  const items = new Set(save.items || []);
  const campaign = save.worldwake || {};
  const marks = Array.isArray(campaign.marks) ? campaign.marks.length : 0;
  const discovered = Array.isArray(campaign.discovered) ? campaign.discovered.length : 0;
  const trophies = Array.from(items).filter((item) => item.indexOf("trophy-") === 0).length;
  if (items.has("god-spark") || marks >= 6) return 5;
  if (marks >= 3) return 4;
  if (discovered > 0) return 3;
  if (trophies >= 2 || (save.stars || 0) >= 10) return 2;
  if ((save.claimedForms || []).length >= 2 || (save.stars || 0) >= 3) return 1;
  return 0;
}

function playtimeLabel(seconds) {
  const minutes = Math.floor(Math.max(0, Number(seconds) || 0) / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

G.saveSlotSummaries = function () {
  const chapterNames = [
    "Somebody Else's Problem", "Many Useful Shapes", "Masters of One Thing",
    "The Waking Roads", "Six Old Promises", "Nobody, Together",
  ];
  return Array.from({ length: SAVE_SLOT_COUNT }, (_, index) => {
    const slot = index + 1;
    const save = G.loadSaveData(slot);
    if (!save) return { slot, empty: true, active: slot === G.activeSaveSlot };
    const chapter = derivedChapter(save);
    const complete = (save.items || []).includes("god-spark");
    return {
      slot, empty: false, active: slot === G.activeSaveSlot,
      chapter, chapterName: chapterNames[chapter] || chapterNames[0], complete,
      stars: save.stars || 0,
      forms: 1 + (Array.isArray(save.claimedForms) ? save.claimedForms.length : 0),
      formId: save.formId || "nobody",
      mapId: save.mapId || "overworld",
      playtime: playtimeLabel(save.playSeconds),
    };
  });
};

G.selectSaveSlot = function (slot, autoStart) {
  G.activeSaveSlot = slotNumber(slot);
  try {
    localStorage.setItem(ACTIVE_SLOT_KEY, String(G.activeSaveSlot));
    if (autoStart && typeof sessionStorage !== "undefined") sessionStorage.setItem(AUTO_START_KEY, "1");
  } catch (error) {}
  if (typeof location !== "undefined" && location.reload) location.reload();
};

G.resetSave = function () {
  try { localStorage.removeItem(slotKey(G.activeSaveSlot)); } catch (error) {}
  if (typeof location !== "undefined" && location.reload) location.reload();
};

G.deleteSaveSlot = function (slot) {
  try { localStorage.removeItem(slotKey(slot)); } catch (error) {}
};

function consumeAutoStart() {
  try {
    if (typeof sessionStorage === "undefined" || sessionStorage.getItem(AUTO_START_KEY) !== "1") return false;
    sessionStorage.removeItem(AUTO_START_KEY);
    return true;
  } catch (error) {
    return false;
  }
}

function titleEscape(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[character]));
}

function titleSceneClass(mapId) {
  if (/ember|rift|volcan/i.test(mapId)) return "ember";
  if (/frost|storm|wind|peak/i.test(mapId)) return "frost";
  if (/marsh|root|mire|hollow/i.test(mapId)) return "mire";
  if (/star|garden|firmament|titan/i.test(mapId)) return "arcane";
  return "greenfield";
}

function drawTitleSprite(canvas, formId) {
  const form = G.forms && G.forms[formId];
  if (!canvas || !form || !form.sprite || !G.drawSprite || !G.spriteMetrics) return;
  const c = canvas.getContext("2d");
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.imageSmoothingEnabled = false;
  const metrics = G.spriteMetrics(form.sprite);
  const scale = Math.max(1, Math.floor(Math.min(
    (canvas.width - 10) / Math.max(1, metrics.w),
    (canvas.height - 8) / Math.max(1, metrics.h)
  )));
  G.drawSprite(c, form.sprite, 0, canvas.width / 2, canvas.height - 3, false, scale);
}

function renderTitleSprites(overlay) {
  overlay.querySelectorAll("canvas[data-title-form]").forEach((canvas) =>
    drawTitleSprite(canvas, canvas.dataset.titleForm));
}

function titleTransformationForms(save) {
  const preferred = ["samurai", "wizard", "frog", "dragon", "rat", "knight", "vampire", "golem", "jester", "ranger", "turtle"];
  const unlocked = new Set([save && save.formId].concat(save && Array.isArray(save.claimedForms) ? save.claimedForms : []).filter(Boolean));
  const featured = preferred.filter((id) => unlocked.has(id) && G.forms && G.forms[id]);
  unlocked.forEach((id) => {
    if (id !== "nobody" && G.forms && G.forms[id] && !featured.includes(id)) featured.push(id);
  });
  preferred.forEach((id) => {
    if (featured.length < 4 && G.forms && G.forms[id] && !featured.includes(id)) featured.push(id);
  });
  return featured.slice(0, 4);
}

function titleTransformationStage(save) {
  const positions = [[-122, -25], [-43, -70], [43, -70], [122, -25]];
  const echoes = titleTransformationForms(save).map((id, index) => {
    const position = positions[index] || [0, -55];
    return `<span class="title-form-echo" style="--echo-x:${position[0]}px;--echo-y:${position[1]}px;--echo-delay:${index * 0.12}s">
      <canvas width="82" height="94" data-title-form="${titleEscape(id)}"></canvas></span>`;
  }).join("");
  const particles = Array.from({ length: 12 }, (_, index) =>
    `<i style="--bit:${index};--bit-x:${((index * 47) % 150) - 75}px;--bit-y:${-32 - ((index * 31) % 92)}px"></i>`).join("");
  return `<div class="title-transform-stage" role="img" aria-label="Nobody changing into many forms">
    <div class="title-form-echoes" aria-hidden="true">${echoes}</div>
    <span class="title-change-burst" aria-hidden="true">${particles}</span>
    <span class="title-nobody" aria-hidden="true"><i></i><canvas width="88" height="102" data-title-form="nobody"></canvas></span>
  </div>`;
}

function titleSlotCard(summary) {
  if (summary.empty) return `<button class="save-slot-card empty ${summary.active ? "active" : ""}" data-save-slot="${summary.slot}">
    <span class="save-slot-number">CHAPTER ${summary.slot}</span>
    <span class="slot-chapter-art unwritten" aria-hidden="true"><i class="title-quill">✦</i></span>
    <strong>Begin a new story</strong>
    <small>The next page belongs to Nobody.</small>
  </button>`;
  const form = G.forms && G.forms[summary.formId];
  const map = G.maps && G.maps[summary.mapId];
  return `<button class="save-slot-card ${summary.active ? "active" : ""}" data-save-slot="${summary.slot}">
    <span class="save-slot-number">CHAPTER ${summary.slot}${summary.complete ? " · COMPLETE" : ""}</span>
    <span class="slot-chapter-art ${titleSceneClass(summary.mapId)}" aria-hidden="true">
      <i class="slot-sun"></i><i class="slot-hill far"></i><i class="slot-hill near"></i>
      <canvas width="64" height="68" data-title-form="${titleEscape(summary.formId)}"></canvas>
    </span>
    <strong>Continue as ${titleEscape(form ? form.name : "Nobody")}</strong>
    <span>ACT ${summary.chapter + 1} · ${titleEscape(summary.chapterName)}</span>
    <small>${titleEscape(map ? map.name : "Greenfield")} · ⭐${summary.stars} · ✦${summary.forms} · ${titleEscape(summary.playtime)}</small>
  </button>`;
}

G.showSaveSlotScreen = function (force) {
  if (typeof document === "undefined") return false;
  const overlay = document.getElementById("save-slots");
  if (!overlay) return false;
  const activeSave = G.loadSaveData();
  if (!force && consumeAutoStart()) {
    G.events.emit("saveSlotReady", { slot: G.activeSaveSlot, save: activeSave, isNew: !activeSave });
    return false;
  }

  const summaries = G.saveSlotSummaries();
  const cards = summaries.map(titleSlotCard).join("");

  overlay.innerHTML = `<main class="save-screen-panel title-world-screen" role="dialog" aria-modal="true" aria-label="Nobody's Quest title screen. Choose an adventure.">
      ${force ? `<button class="title-return" data-title-return aria-label="Return to the current game">← Return</button>` : ""}
      <section class="title-world-hero">
        <header class="title-lockup"><span>Nobody's</span><h1>Quest</h1><p>The prophecy chose the wrong name</p></header>
        ${titleTransformationStage(activeSave)}
      </section>
      <section class="title-chapter-panel" aria-label="Adventure slots">
        <div class="save-slot-grid">${cards}</div>
      </section>
      <footer class="save-screen-foot"><button data-title-settings>⚙ Settings</button><span>Choose a chapter · progress saves automatically</span></footer>
      <aside class="title-settings hidden" data-title-settings-panel aria-label="Title screen settings">
        <div><span class="eyebrow">SETTINGS</span><h2>Make the story comfortable</h2></div>
        <button data-title-music>♫ Music <span>${!G.sfx || G.sfx.musicEnabled !== false ? "ON" : "OFF"}</span></button>
        <button data-title-sound>◖ Sound <span>${!G.sfx || G.sfx.soundEnabled !== false ? "ON" : "OFF"}</span></button>
        <button data-title-detail>✦ World detail <span>${G.hdPilot ? "HD" : "ORIGINAL"}</span></button>
        <button data-title-boss-assistance aria-pressed="${!!(G.comfortSetting && G.comfortSetting("bossAssistance"))}">♥ Boss Assistance <span>${G.comfortSetting && G.comfortSetting("bossAssistance") ? "ON · retry help" : "OFF · original bosses"}</span></button>
        <button data-title-easy-mode aria-pressed="${!!(G.comfortSetting && G.comfortSetting("easyMode"))}">🌱 Easy Mode <span>${G.comfortSetting && G.comfortSetting("easyMode") ? "ON · in-battle heart regeneration" : "OFF · normal healing"}</span></button>
        <button data-title-fullscreen>⛶ Fullscreen</button><button data-title-settings-close>Done</button>
      </aside>
    </main>`;
  const unbindTitleViewport = bindTitleViewport(overlay);
  overlay.classList.remove("hidden");
  G.saveSlotScreenOpen = true;
  renderTitleSprites(overlay);

  const slotButtons = Array.from(overlay.querySelectorAll("[data-save-slot]"));
  const preferred = overlay.querySelector(`.save-slot-card[data-save-slot="${G.activeSaveSlot}"]`) || overlay.querySelector(".save-slot-card");
  if (preferred && preferred.focus) preferred.focus({ preventScroll: true });

  const settingsPanel = overlay.querySelector("[data-title-settings-panel]");
  const returnButton = overlay.querySelector("[data-title-return]");
  const closeTitle = () => {
    unbindTitleViewport();
    overlay.classList.add("hidden");
    G.saveSlotScreenOpen = false;
    G.updateSaveSlotInput = null;
    if (G.menuController) G.menuController.reset(overlay);
    document.removeEventListener("keydown", titleKeys);
  };
  const titleKeys = (event) => {
    if (event.key === "Escape") {
      if (settingsPanel && !settingsPanel.classList.contains("hidden")) settingsPanel.classList.add("hidden");
      else if (returnButton) closeTitle();
      return;
    }
    if (!/^Arrow(Left|Right|Up|Down)$/.test(event.key) || (settingsPanel && !settingsPanel.classList.contains("hidden"))) return;
    const current = Math.max(0, slotButtons.indexOf(document.activeElement));
    const direction = /Left|Up/.test(event.key) ? -1 : 1;
    const next = slotButtons[(current + direction + slotButtons.length) % slotButtons.length];
    if (next) { event.preventDefault(); next.focus(); }
  };
  document.addEventListener("keydown", titleKeys);

  // Controllers drive this screen through G.input's menu taps: main.js calls
  // this once per frame while the title is open. On the TV wrapper there is
  // no keyboard or pointer, so moving focus and clicking IS the interface.
  // Unlike arrow keys, the controller can also reach Settings and Return.
  const titleCycle = () => {
    if (settingsPanel && !settingsPanel.classList.contains("hidden"))
      return Array.from(settingsPanel.querySelectorAll("button"));
    const extras = [];
    const settingsOpener = overlay.querySelector("[data-title-settings]");
    if (settingsOpener) extras.push(settingsOpener);
    if (returnButton) extras.push(returnButton);
    return slotButtons.concat(extras);
  };
  G.updateSaveSlotInput = (dt) => {
    if (!G.saveSlotScreenOpen) return;
    G.menuController.update(overlay, {
      elements: titleCycle,
      preferred,
      onBack: () => {
      if (settingsPanel && !settingsPanel.classList.contains("hidden")) {
        settingsPanel.classList.add("hidden");
        const slot = slotButtons[0];
        if (slot && slot.focus) slot.focus({ preventScroll: true });
      } else if (returnButton) closeTitle();
      },
    }, dt);
  };

  slotButtons.forEach((button) => button.addEventListener("click", () => {
    const slot = slotNumber(button.dataset.saveSlot);
    const save = G.loadSaveData(slot);
    if (slot !== G.activeSaveSlot) {
      G.selectSaveSlot(slot, true);
      return;
    }
    closeTitle();
    G.events.emit("saveSlotReady", { slot, save, isNew: !save });
  }));
  if (returnButton) returnButton.addEventListener("click", closeTitle);
  const openSettings = overlay.querySelector("[data-title-settings]");
  const closeSettings = overlay.querySelector("[data-title-settings-close]");
  if (openSettings) openSettings.addEventListener("click", () => {
    settingsPanel.classList.remove("hidden");
    // Keep the controller/keyboard highlight with the panel it just opened.
    const first = settingsPanel.querySelector("button");
    if (first && first.focus) first.focus({ preventScroll: true });
  });
  if (closeSettings) closeSettings.addEventListener("click", () => {
    settingsPanel.classList.add("hidden");
    const slot = slotButtons[0];
    if (slot && slot.focus) slot.focus({ preventScroll: true });
  });
  const music = overlay.querySelector("[data-title-music]");
  if (music) music.addEventListener("click", () => {
    if (G.sfx && G.sfx.setMusicEnabled) G.sfx.setMusicEnabled(!G.sfx.musicEnabled);
    music.querySelector("span").textContent = G.sfx.musicEnabled ? "ON" : "OFF";
  });
  const sound = overlay.querySelector("[data-title-sound]");
  if (sound) sound.addEventListener("click", () => {
    if (G.sfx && G.sfx.setSoundEnabled) G.sfx.setSoundEnabled(!G.sfx.soundEnabled);
    sound.querySelector("span").textContent = G.sfx.soundEnabled ? "ON" : "OFF";
  });
  const detail = overlay.querySelector("[data-title-detail]");
  if (detail) detail.addEventListener("click", () => {
    if (G.setHdPilot) G.setHdPilot(!G.hdPilot);
    detail.querySelector("span").textContent = G.hdPilot ? "HD" : "ORIGINAL";
    renderTitleSprites(overlay);
  });
  const bossAssistance = overlay.querySelector("[data-title-boss-assistance]");
  if (bossAssistance) bossAssistance.addEventListener("click", () => {
    if (G.setComfortSetting) G.setComfortSetting("bossAssistance", !G.comfortSetting("bossAssistance"));
    const enabled = G.comfortSetting("bossAssistance");
    bossAssistance.setAttribute("aria-pressed", String(enabled));
    bossAssistance.querySelector("span").textContent = enabled ? "ON · retry help" : "OFF · original bosses";
  });
  const easyMode = overlay.querySelector("[data-title-easy-mode]");
  if (easyMode) easyMode.addEventListener("click", () => {
    if (G.setComfortSetting) G.setComfortSetting("easyMode", !G.comfortSetting("easyMode"));
    const enabled = G.comfortSetting("easyMode");
    easyMode.setAttribute("aria-pressed", String(enabled));
    easyMode.querySelector("span").textContent = enabled ? "ON · in-battle heart regeneration" : "OFF · normal healing";
  });
  const fullscreen = overlay.querySelector("[data-title-fullscreen]");
  if (fullscreen) fullscreen.addEventListener("click", () => {
    const root = document.documentElement;
    const request = root.requestFullscreen || root.webkitRequestFullscreen;
    if (request) Promise.resolve(request.call(root)).catch(() => {});
  });
  return true;
};
