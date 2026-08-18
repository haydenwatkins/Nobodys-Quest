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
  const cards = summaries.map((summary) => {
    if (summary.empty) return `<button class="save-slot-card empty ${summary.active ? "active" : ""}" data-save-slot="${summary.slot}">
      <span class="save-slot-number">SLOT ${summary.slot}</span><strong>＋ New Adventure</strong>
      <small>A prophecy with room for a different answer.</small>
    </button>`;
    const form = G.forms && G.forms[summary.formId];
    const map = G.maps && G.maps[summary.mapId];
    return `<button class="save-slot-card ${summary.active ? "active" : ""}" data-save-slot="${summary.slot}">
      <span class="save-slot-number">SLOT ${summary.slot}${summary.complete ? " · STORY COMPLETE" : ""}</span>
      <strong>${form ? form.icon : "👤"} ${form ? form.name : "Nobody"} · ${summary.stars} ⭐</strong>
      <span>ACT ${summary.chapter + 1} · ${summary.chapterName}</span>
      <small>${map ? map.name : "Greenfield"} · ${summary.forms} forms · ${summary.playtime}</small>
    </button>`;
  }).join("");

  overlay.innerHTML = `<div class="save-screen-sky" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
    <main class="save-screen-panel" role="dialog" aria-modal="true" aria-label="Choose an adventure">
      <div class="save-screen-mark">○</div><span class="eyebrow">A STORY ABOUT EVERY WAY FORWARD</span>
      <h1>Nobody's Quest</h1>
      <p>The world wrote its prophecy for Somebody. Choose who answers.</p>
      <div class="save-slot-grid">${cards}</div>
      <div class="save-screen-foot">Progress saves automatically in the selected slot.${force ? " Choose the current slot to return." : ""}</div>
    </main>`;
  overlay.classList.remove("hidden");
  G.saveSlotScreenOpen = true;

  overlay.querySelectorAll("[data-save-slot]").forEach((button) => button.addEventListener("click", () => {
    const slot = slotNumber(button.dataset.saveSlot);
    const save = G.loadSaveData(slot);
    if (slot !== G.activeSaveSlot) {
      G.selectSaveSlot(slot, true);
      return;
    }
    overlay.classList.add("hidden");
    G.saveSlotScreenOpen = false;
    G.events.emit("saveSlotReady", { slot, save, isNew: !save });
  }));
  return true;
};
