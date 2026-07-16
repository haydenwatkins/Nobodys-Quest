/* ============================================================
   MANYFOLD GAUNTLET — configurable rematches with recovery choices.
   The pool only includes defeated bosses, so every new trophy expands it.
   ============================================================ */
"use strict";

G.gauntletBossPool = function () {
  const trophies = new Set((G.state && G.state.items) || []);
  return Object.values(G.enemies)
    .filter((enemy) => enemy.miniboss && enemy.trophy && trophies.has(enemy.trophy))
    .map((enemy) => enemy.id);
};

G.gauntletUnlocked = function () {
  return !!G.state && G.gauntletBossPool().length >= 3;
};

function shuffled(ids) {
  const out = ids.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function spawnGauntletBoss() {
  const s = G.state;
  const run = s.gauntletRun;
  if (!run) return;
  const id = run.bosses[run.index];
  const enemy = G.makeEnemy(id, 22 * G.TILE + G.TILE / 2, 8 * G.TILE + G.TILE / 2);
  s.enemies = [enemy];
  s.projectiles = [];
  s.pickups = [];
  s.player.x = 5 * G.TILE + G.TILE / 2;
  s.player.y = 8 * G.TILE + G.TILE / 2;
  s.player.invuln = Math.max(s.player.invuln, 0.8);
  s.entryPoint = { x: s.player.x, y: s.player.y };
  G.ui.banner(`⚔ GAUNTLET ${run.index + 1}/${run.bosses.length}`, G.enemies[id].name);
  G.spawnFx({ kind: "ring", x: enemy.x, y: enemy.y - 7, color: "#ffcd75", radius: 34, dur: 0.65 });
}

G.startGauntlet = function (requestedCount, recovery) {
  const pool = G.gauntletBossPool();
  if (pool.length < 3) {
    G.ui.toast("Defeat at least 3 guardians to open the gauntlet.", 3);
    return false;
  }
  const count = requestedCount === "all" ? pool.length : Math.min(pool.length, Math.max(3, Number(requestedCount) || 3));
  G.world.load("gauntletArena", { x: 3, y: 8 });
  G.state.gauntletRun = {
    bosses: shuffled(pool).slice(0, count),
    index: 0, wins: 0, recovery: !!recovery,
  };
  G.state.gauntletBetween = { t: 1.1, opening: true };
  G.ui.banner("🏟 MANYFOLD GAUNTLET", `${count} bosses · ${recovery ? "campfire recovery" : "iron run"}`);
  return true;
};

G.gauntletBossDefeated = function (enemy) {
  const s = G.state;
  const run = s.gauntletRun;
  if (!run || s.mapId !== "gauntletArena") return false;
  run.wins++;
  run.index++;
  s.projectiles = [];
  s.pickups = [];
  if (run.recovery) {
    s.player.damageTaken = 0;
    s.player.mana = Math.min(s.player.manaMax, s.player.mana + 3);
  }
  const complete = run.index >= run.bosses.length;
  s.gauntletBetween = { t: complete ? 2.6 : 2.0, complete };
  G.ui.banner(complete ? "🏆 GAUNTLET COMPLETE" : `✓ ROUND ${run.index} CLEARED`,
    complete ? `${run.wins} guardians defeated back-to-back!` :
      (run.recovery ? "Campfire: full health · +3 mana" : "Iron run: no recovery"));
  return true;
};

function finishGauntlet() {
  const s = G.state;
  const run = s.gauntletRun;
  if (!run) return;
  const key = run.recovery ? "gauntletBest" : "gauntletIronBest";
  const oldBest = s[key] || 0;
  const newRecord = run.wins > oldBest;
  s[key] = Math.max(oldBest, run.wins);
  if (newRecord) {
    s.stars++;
    G.sfx.play("quest");
    G.ui.toast(`New ${run.recovery ? "recovery" : "iron"} record: ${run.wins} · +1 ⭐`, 4);
  }
  if (run.wins === G.gauntletBossPool().length && !(s.items || []).includes("manyfold-crown")) {
    s.items.push("manyfold-crown");
    s.player.manaMax = 12;
    s.player.mana = 12;
    G.ui.banner("👑 MANYFOLD CROWN", "+2 maximum mana · one Second Wind in every future gauntlet");
  }
  G.world.load("shattercoast", { x: 23, y: 14 });
  G.saveGame();
};

G.updateGauntlet = function (dt) {
  const between = G.state.gauntletBetween;
  if (!between) return false;
  between.t -= dt;
  if (between.t > 0) return true;
  G.state.gauntletBetween = null;
  if (between.complete) finishGauntlet();
  else spawnGauntletBoss();
  return true;
};

G.cancelGauntlet = function () {
  if (!G.state) return;
  G.state.gauntletRun = null;
  G.state.gauntletBetween = null;
};
