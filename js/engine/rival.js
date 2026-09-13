/* ============================================================
   RIVAL — one ordinary enemy remembers the player and grows into a story.

   A creature that knocks Nobody out earns a name. It returns with readable
   traits, retreats after defeats, and eventually becomes a personal victory.
   ============================================================ */

"use strict";

const RIVAL_FIRST = ["Crumpet", "Mittens", "Bramble", "Sprocket", "Puddle", "Turnip", "Pebbleton", "Noodle"];
const RIVAL_TITLES = ["the Prepared", "the Persistent", "the Sideways", "the Loudly Certain", "the Unfinished", "the Surprisingly Fast"];
const RIVAL_TRAITS = [
  { id: "swift", name: "Quickstep", text: "moves faster" },
  { id: "warded", name: "Patchwork Ward", text: "carries a one-hit ward" },
  { id: "shooter", name: "Pocket Projectiles", text: "learned to fight at range" },
  { id: "stubborn", name: "Iron Nerve", text: "returns with extra health" },
];

G.makeRivalState = function () {
  return { sequence: 0, resolved: 0, active: null };
};

G.normalizeRivalState = function (saved) {
  const state = Object.assign(G.makeRivalState(), saved || {});
  state.sequence = Math.max(0, Number(state.sequence) || 0);
  state.resolved = Math.max(0, Number(state.resolved) || 0);
  if (state.active) {
    state.active.level = Math.max(1, Math.min(5, Number(state.active.level) || 1));
    state.active.defeats = Math.max(0, Number(state.active.defeats) || 0);
    state.active.victories = Math.max(0, Number(state.active.victories) || 0);
    state.active.cooldown = Math.max(0, Number(state.active.cooldown) || 0);
    state.active.traits = Array.isArray(state.active.traits) ? state.active.traits : [];
    if (!G.enemies[state.active.baseId] || G.enemies[state.active.baseId].miniboss) state.active = null;
  }
  return state;
};

G.ensureRivalState = function () {
  if (!G.state.rivalState) G.state.rivalState = G.makeRivalState();
  return G.state.rivalState;
};

G.activeRival = function () {
  const rival = G.ensureRivalState().active;
  return rival && !rival.resolved ? rival : null;
};

G.assignRivalRegion = function (mapId) {
  const rival = G.activeRival();
  if (!rival || !G.maps[mapId]) return false;
  rival.region = mapId;
  rival.cooldown = 0;
  G.saveGame();
  return true;
};

function addNextTrait(rival) {
  const trait = RIVAL_TRAITS[Math.min(RIVAL_TRAITS.length - 1, rival.traits.length)];
  if (trait && !rival.traits.includes(trait.id)) rival.traits.push(trait.id);
}

function makeRival(baseId, mapId) {
  const state = G.ensureRivalState();
  const index = state.sequence++;
  const base = G.enemies[baseId];
  const rival = {
    baseId, name: RIVAL_FIRST[index % RIVAL_FIRST.length],
    title: RIVAL_TITLES[(index + baseId.length) % RIVAL_TITLES.length],
    level: 1, defeats: 1, victories: 0, traits: [], cooldown: 1,
    region: mapId, resolved: false,
  };
  addNextTrait(rival);
  state.active = rival;
  G.sfx.play("bossIntro");
  G.ui.banner("★ A RIVAL REMEMBERS", `${rival.name} ${rival.title} · ${base.name} · ${RIVAL_TRAITS[0].name}`);
  G.events.emit("rivalCreated", { enemy: baseId, map: mapId });
  G.saveGame();
  return rival;
}

function eligibleRivalMap(mapId) {
  const map = G.maps[mapId];
  return !!(map && mapId !== "town" && mapId !== "playerHouse" && mapId !== "manyfoldExpedition" &&
    !(map.bossTrial && !map.bossTrial.worldBoss));
}

function rivalSpawnPoint() {
  const p = G.state.player;
  const offsets = [[5, 0], [-5, 0], [0, 5], [0, -5], [4, 3], [-4, 3], [4, -3], [-4, -3]];
  for (const [ox, oy] of offsets) {
    const x = p.x + ox * G.TILE, y = p.y + oy * G.TILE;
    if (G.world.isSafeSpawn(x, y)) return { x, y };
  }
  return { x: p.x + G.TILE * 3, y: p.y };
}

function applyRivalTraits(enemy, rival) {
  const base = enemy.def;
  const hp = Math.round(base.hp * (1.45 + rival.level * 0.22));
  enemy.def = Object.assign({}, base, {
    name: `${rival.name} ${rival.title}`,
    hp,
    size: Math.min(22, base.size + 2 + rival.level),
    speed: Math.min(118, base.speed * (rival.traits.includes("swift") ? 1.22 : 1.08)),
    damage: Math.min(2, Math.max(1, base.damage || 1)),
    heavy: rival.traits.includes("stubborn") || base.heavy,
    behavior: rival.traits.includes("shooter") ? "shooter" : base.behavior,
    shootEvery: rival.traits.includes("shooter") ? Math.max(1.25, base.shootEvery || 1.7) : base.shootEvery,
    shotColor: "#d9a7ff",
  });
  enemy.hp = hp;
  enemy.rival = true;
  enemy.rivalLevel = rival.level;
  if (rival.traits.includes("warded")) {
    const types = ["sharp", "blunt", "light", "dark"];
    enemy.ward = { hp: 1, maxHp: 1, types: [types[(rival.level + rival.baseId.length) % types.length]] };
  }
  return enemy;
}

G.spawnActiveRival = function () {
  const rival = G.activeRival();
  if (!rival || rival.region !== G.state.mapId || !eligibleRivalMap(G.state.mapId)) return null;
  if (G.state.enemies.some((enemy) => enemy.rival && !enemy.dead)) return null;
  const point = rivalSpawnPoint();
  const enemy = applyRivalTraits(G.makeEnemy(rival.baseId, point.x, point.y), rival);
  G.state.enemies.push(enemy);
  G.sfx.play("bossIntro");
  const newestId = rival.traits[rival.traits.length - 1];
  const newest = RIVAL_TRAITS.find((trait) => trait.id === newestId);
  G.ui.banner(`★ ${rival.name.toUpperCase()} RETURNS`, `${rival.title} · Level ${rival.level}${newest ? ` · ${newest.name}` : ""}`);
  return enemy;
};

function resolveRivalVictory(rival) {
  const state = G.ensureRivalState();
  rival.victories += 1;
  if (rival.victories >= 3) {
    rival.resolved = true;
    state.resolved += 1;
    if (!G.state.items.includes("rival-keepsake")) G.state.items.push("rival-keepsake");
    G.state.stars += 2;
    G.sfx.play("quest");
    G.ui.banner("★ RIVAL STORY COMPLETE", `${rival.name} finally nods with respect · +2 ⭐ · keepsake found`);
    if (G.addTownReward) G.addTownReward(12, 1, `${rival.name}'s story`, true);
    G.events.emit("rivalResolved", { enemy: rival.baseId, name: rival.name });
    state.active = null;
  } else {
    rival.level = Math.min(5, rival.level + 1);
    addNextTrait(rival);
    rival.cooldown = 2;
    rival.region = null;
    const nextId = rival.traits[rival.traits.length - 1];
    const next = RIVAL_TRAITS.find((trait) => trait.id === nextId);
    G.ui.banner(`★ ${rival.name.toUpperCase()} RETREATS`,
      `Victory ${rival.victories}/3 · next time: ${next ? next.name : "stronger resolve"}`);
    if (G.addTownReward) G.addTownReward(4, 0, "Rival victory", true);
    G.events.emit("rivalDefeated", { enemy: rival.baseId, victories: rival.victories });
  }
  G.saveGame();
}

G.events.on("ko", (data) => {
  if (!G.state || data.expedition || data.boss || data.trial || !data.enemy) return;
  const def = G.enemies[data.enemy];
  if (!def || def.miniboss) return;
  let rival = G.activeRival();
  if (!rival) {
    makeRival(data.enemy, G.state.mapId);
    return;
  }
  if (!data.rival || rival.baseId !== data.enemy) return;
  rival.defeats += 1;
  rival.level = Math.min(5, rival.level + 1);
  addNextTrait(rival);
  G.ui.toast(`★ ${rival.name} remembers that victory. Rival level ${rival.level}.`, 3.5);
  G.saveGame();
});

G.events.on("kill", (data) => {
  if (!data.rival) return;
  const rival = G.activeRival();
  if (rival && rival.baseId === data.enemy) resolveRivalVictory(rival);
});

G.events.on("mapEnter", (data) => {
  const rival = G.activeRival();
  if (!rival || !eligibleRivalMap(data.map)) return;
  if (rival.cooldown > 0) {
    rival.cooldown -= 1;
    if (rival.cooldown > 0) { G.saveGame(); return; }
  }
  if (!rival.region) rival.region = data.map;
  if (rival.region === data.map) G.spawnActiveRival();
});
