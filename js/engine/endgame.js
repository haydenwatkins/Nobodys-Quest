/* ============================================================
   ENDGAME — guardian collection rewards and repeatable Hero Board jobs.

   Contracts reuse the whole world and the ability-mixing rules instead of
   asking players to grind one room. New guardians automatically join the
   collection requirement because the trophy list comes from enemy data.
   ============================================================ */

"use strict";

const HERO_CONTRACTS = [
  {
    id: "world-patrol", name: "World Patrol", icon: "🗺️",
    text: "Defeat 15 ordinary enemies across 3 different regions.",
    event: "kill", goal: 15, uniqueGoal: 3, unique: "maps",
    accepts(data) { return !(G.enemies[data.enemy] && G.enemies[data.enemy].miniboss); },
    uniqueValue() { return G.state.mapId; },
  },
  {
    id: "mixed-arsenal", name: "Mixed Arsenal", icon: "🧰",
    text: "Use 10 different abilities. Build a loadout, then swap forms to reach the rest.",
    event: "abilityUse", goal: 10, uniqueGoal: 10, unique: "abilities",
    accepts() { return true; },
    uniqueValue(data) { return data.ability; },
  },
  {
    id: "ward-study", name: "Ward Study", icon: "💥",
    text: "Break 6 wards using at least 3 damage types.",
    event: "wardBreak", goal: 6, uniqueGoal: 3, unique: "types",
    accepts() { return true; },
    uniqueValue(data) { return data.damageType; },
  },
  {
    id: "many-faces", name: "Many Faces", icon: "🎭",
    text: "Defeat 12 ordinary enemies while wearing 4 different forms.",
    event: "kill", goal: 12, uniqueGoal: 4, unique: "forms",
    accepts(data) { return !(G.enemies[data.enemy] && G.enemies[data.enemy].miniboss); },
    uniqueValue() { return G.state.formId; },
  },
  {
    id: "grand-tour", name: "Grand Tour", icon: "🧭",
    text: "Visit 5 different regions, trials, or dungeons.",
    event: "mapEnter", goal: 5, uniqueGoal: 5, unique: "maps",
    accepts(data) { return data.map !== "town" && data.map !== "playerHouse"; },
    uniqueValue(data) { return data.map; },
  },
  {
    id: "encore", name: "Guardian Encore", icon: "👑",
    text: "Win 3 guardian rematches. Trials and gauntlet rounds both count.",
    event: "kill", goal: 3,
    accepts(data) { return !!(G.enemies[data.enemy] && G.enemies[data.enemy].miniboss); },
  },
];

G.makeHeroBoard = function () {
  return { renown: 0, completed: 0, sequence: 0, active: null };
};

G.normalizeHeroBoard = function (saved) {
  const board = Object.assign(G.makeHeroBoard(), saved || {});
  board.renown = Math.max(0, Number(board.renown) || 0);
  board.completed = Math.max(0, Number(board.completed) || 0);
  board.sequence = Math.max(0, Number(board.sequence) || 0);
  if (board.active) {
    const valid = HERO_CONTRACTS.some((contract) => contract.id === board.active.id);
    if (!valid) board.active = null;
    else {
      board.active.count = Math.max(0, Number(board.active.count) || 0);
      if (!Array.isArray(board.active.seen)) board.active.seen = [];
    }
  }
  return board;
};

G.ensureHeroBoard = function () {
  if (!G.state.heroBoard) G.state.heroBoard = G.makeHeroBoard();
  return G.state.heroBoard;
};

G.guardianTrophies = function () {
  return Array.from(new Set(Object.values(G.enemies)
    .filter((enemy) => enemy.miniboss && enemy.trophy)
    .map((enemy) => enemy.trophy)));
};

G.guardianCollectionProgress = function () {
  const items = new Set((G.state && G.state.items) || []);
  const trophies = G.guardianTrophies();
  return { found: trophies.filter((trophy) => items.has(trophy)).length, total: trophies.length };
};

G.heroBoardUnlocked = function () {
  return !!(G.state && (G.state.items || []).includes("guardian-compass"));
};

G.checkGuardianCollectionReward = function (quiet) {
  if (!G.state) return false;
  const progress = G.guardianCollectionProgress();
  if (!progress.total || progress.found < progress.total || G.heroBoardUnlocked()) return false;
  G.state.items.push("guardian-compass");
  G.state.stars += 3;
  const town = G.ensureTown();
  town.spirit += 20;
  if (!quiet) {
    G.sfx.play("unlock");
    G.state.shake = Math.max(G.state.shake, 0.5);
    G.ui.banner("🧭 GUARDIAN COMPASS", "Every guardian found! Hero Board unlocked · +3 ⭐ · +20 town spirit");
  }
  G.saveGame();
  return true;
};

G.heroContractDef = function (id) {
  return HERO_CONTRACTS.find((contract) => contract.id === id) || null;
};

G.startHeroContract = function () {
  if (!G.heroBoardUnlocked()) return false;
  const board = G.ensureHeroBoard();
  if (board.active) return false;
  const def = HERO_CONTRACTS[board.sequence % HERO_CONTRACTS.length];
  board.sequence += 1;
  board.active = { id: def.id, count: 0, seen: [] };
  G.sfx.play("pickup");
  G.ui.toast(`${def.icon} Contract accepted: ${def.name}`, 3);
  G.saveGame();
  return true;
};

G.heroContractProgress = function () {
  const active = G.ensureHeroBoard().active;
  if (!active) return null;
  const def = G.heroContractDef(active.id);
  if (!def) return null;
  const primary = `${Math.min(active.count, def.goal)}/${def.goal}`;
  const unique = def.uniqueGoal ? ` · ${Math.min(active.seen.length, def.uniqueGoal)}/${def.uniqueGoal} ${def.unique}` : "";
  return { def, active, label: primary + unique };
};

function awardHeroMilestones(board) {
  const milestones = [
    { at: 3, item: "wayfarer-ribbon", title: "WAYFARER RIBBON", text: "A bright trail now follows your adventures." },
    { at: 6, item: "sunrise-banner", title: "SUNRISE BANNER", text: "Town festivals now earn double spirit." },
    { at: 10, item: "heroic-halo", title: "HEROIC HALO", text: "Your renown is visible in every form." },
  ];
  for (const reward of milestones) {
    if (board.renown < reward.at || G.state.items.includes(reward.item)) continue;
    G.state.items.push(reward.item);
    G.ui.banner(`🏅 ${reward.title}`, reward.text);
  }
}

function completeHeroContract(def) {
  const board = G.ensureHeroBoard();
  board.active = null;
  board.completed += 1;
  board.renown += 1;
  G.state.stars += 1;
  const spirit = 10 + Math.min(10, board.renown);
  G.ensureTown().spirit += spirit;
  G.sfx.play("quest");
  G.state.shake = Math.max(G.state.shake, 0.35);
  G.ui.banner(`🏅 CONTRACT COMPLETE: ${def.name}`, `+1 renown · +1 ⭐ · +${spirit} town spirit`);
  awardHeroMilestones(board);
  G.saveGame();
}

function trackHeroContract(type, data) {
  if (!G.state || !G.heroBoardUnlocked()) return;
  const board = G.ensureHeroBoard();
  const active = board.active;
  const def = active && G.heroContractDef(active.id);
  if (!def || def.event !== type || !def.accepts(data)) return;

  if (def.uniqueGoal) {
    const value = def.uniqueValue(data);
    if (value !== undefined && value !== null && !active.seen.includes(value)) active.seen.push(value);
  }
  // Unique-only contracts advance once per new discovery. Mixed contracts
  // still count every valid action while separately checking variety.
  if (def.goal === def.uniqueGoal) active.count = active.seen.length;
  else active.count += 1;

  const enoughVariety = !def.uniqueGoal || active.seen.length >= def.uniqueGoal;
  if (active.count >= def.goal && enoughVariety) completeHeroContract(def);
  else if (active.count === 1 || active.count % 5 === 0) {
    const progress = G.heroContractProgress();
    G.ui.toast(`${def.icon} ${def.name}: ${progress.label}`, 2);
  }
}

G.events.on("kill", (data) => trackHeroContract("kill", data));
G.events.on("wardBreak", (data) => trackHeroContract("wardBreak", data));
G.events.on("abilityUse", (data) => trackHeroContract("abilityUse", data));
G.events.on("mapEnter", (data) => trackHeroContract("mapEnter", data));

