/* ============================================================
   SAVE — remembers your adventure in the browser's storage.
   Each device (each iPad) keeps its own save automatically.
   ============================================================ */

"use strict";

const SAVE_KEY = "nobodys-quest-save-v1";

G.saveGame = function () {
  if (!G.state) return;
  const s = G.state;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      formId: s.formId,
      costumeId: s.costumeId,
      costumesUnlocked: s.costumesUnlocked,
      mapId: s.mapId,
      px: Math.round(s.player.x),
      py: Math.round(s.player.y),
      damageTaken: s.player.damageTaken,
      mana: s.player.mana,
      stars: s.stars,
      items: s.items,
      opened: s.opened,
      known: s.known,
      claimedForms: s.claimedForms,
      unlockReadyNotified: s.unlockReadyNotified,
      loadouts: s.loadouts,
      town: s.town,
      heroBoard: s.heroBoard,
      wayfinder: s.wayfinder,
      gauntletBest: s.gauntletBest || 0,
      gauntletIronBest: s.gauntletIronBest || 0,
      questCounts: G.questCounts,
      questsDone: G.questsDone,
      pinnedQuestIds: s.pinnedQuestIds,
      tutorialStep: G.tutorial ? G.tutorial.step : 0,
      tutorialDone: G.tutorial ? G.tutorial.done : false,
    }));
  } catch (e) {
    // storage full or blocked — the game still plays, just won't remember
  }
};

G.loadSaveData = function () {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

G.resetSave = function () {
  localStorage.removeItem(SAVE_KEY);
  location.reload();
};
