/* ============================================================
   COMFORT SETTINGS — optional help that never changes progression.

   Both switches are deliberately off for new players. They live outside an
   adventure slot so a child can keep the same comfortable setup everywhere.
   ============================================================ */

"use strict";

(function () {
  const STORAGE_KEY = "nobodys-quest-comfort-v1";
  const DEFAULTS = { bossAssistance: false, easyMode: false };

  G.EASY_HEART_REGEN_DELAY = 4;
  G.EASY_HEART_REGEN_SECONDS = 6;

  function readSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return {
        bossAssistance: !!(saved && saved.bossAssistance === true),
        easyMode: !!(saved && saved.easyMode === true),
      };
    } catch (error) {
      return Object.assign({}, DEFAULTS);
    }
  }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(G.comfortSettings)); }
    catch (error) {}
  }

  G.comfortSettings = readSettings();

  G.comfortSetting = function (name) {
    return !!(G.comfortSettings && G.comfortSettings[name] === true);
  };

  G.setComfortSetting = function (name, enabled) {
    if (!(name in DEFAULTS)) return false;
    const next = !!enabled;
    if (G.comfortSettings[name] === next) return false;
    G.comfortSettings[name] = next;
    persist();
    if (name === "easyMode" && G.state && G.state.player) {
      G.state.player.easyRegenDelay = next ? G.EASY_HEART_REGEN_DELAY : 0;
      G.state.player.easyRegenProgress = 0;
    }
    if (name === "bossAssistance" && !next && G.state && G.state.player && G.playerMaxHearts) {
      // Removing temporary retry hearts in the pause menu must never turn a
      // living player into a zero-heart edge case.
      G.state.player.damageTaken = Math.min(G.state.player.damageTaken,
        Math.max(0, G.playerMaxHearts() - 1));
    }
    G.events.emit("comfortSettingChanged", { name, enabled: next });
    if (G.state && G.ui && G.ui.toast) {
      const label = name === "easyMode" ? "Easy Mode" : "Boss Assistance";
      G.ui.toast(`${label}: ${next ? "ON" : "OFF"}`, 2.2);
    }
    return true;
  };

  G.delayEasyModeRecovery = function () {
    const p = G.state && G.state.player;
    if (!p) return;
    p.easyRegenDelay = G.EASY_HEART_REGEN_DELAY;
    p.easyRegenProgress = 0;
  };

  G.updateComfortRecovery = function (dt) {
    const p = G.state && G.state.player;
    if (!p) return 0;
    if (!G.comfortSetting("easyMode") || p.damageTaken <= 0) {
      p.easyRegenProgress = 0;
      if (p.damageTaken <= 0) p.easyRegenDelay = 0;
      return 0;
    }
    let elapsed = Math.max(0, dt || 0);
    const delay = Math.max(0, p.easyRegenDelay || 0);
    if (delay > 0) {
      const waiting = Math.min(delay, elapsed);
      p.easyRegenDelay = delay - waiting;
      elapsed -= waiting;
      if (p.easyRegenDelay > 0) return 0;
    }
    p.easyRegenProgress = (p.easyRegenProgress || 0) + elapsed;
    let healed = 0;
    while (p.easyRegenProgress >= G.EASY_HEART_REGEN_SECONDS && p.damageTaken > 0) {
      p.easyRegenProgress -= G.EASY_HEART_REGEN_SECONDS;
      healed += G.healPlayer(1, "easy-mode");
    }
    if (healed > 0) {
      if (G.sfx && G.sfx.play) G.sfx.play("pickup");
      if (G.damageNumber) G.damageNumber(p.x, p.y - 18, "+♥", "#a7f070");
      if (G.spawnFx) G.spawnFx({ kind: "ring", x: p.x, y: p.y - 7,
        color: "#a7f070", radius: 13, dur: 0.35 });
    }
    return healed;
  };
})();
