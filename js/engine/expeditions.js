/* ============================================================
   MANYFOLD EXPEDITIONS — short roguelite-inspired branching runs.

   Routes, encounters, and drafts are temporary. Discoveries limit the pool,
   failure never damages the campaign save, and success feeds Sunrise Town.
   ============================================================ */

"use strict";

const EXPEDITION_ENEMIES = [
  "slime", "bat", "bones", "wisp", "brute", "thornling", "pebblebeast", "shade",
  "tideCrab", "starMote", "sunHopper", "loomling", "mirageSkater", "bellMoth", "cairnWalker",
];

const EXPEDITION_BOONS = {
  heartThread: { icon: "❤️", name: "Heart Thread", text: "+1 maximum heart for this run and heal one heart" },
  deepWell: { icon: "💧", name: "Deep Well", text: "+2 maximum mana for this run" },
  quickBoots: { icon: "👟", name: "Quick Boots", text: "+10% movement speed for this run" },
  wardCake: { icon: "🛡", name: "Ward Cake", text: "Block the first hit in every remaining room" },
};

// The menu renders the same catalogue used by the run logic. Exposing this
// read-only reference keeps names and descriptions from drifting apart.
G.EXPEDITION_BOONS = EXPEDITION_BOONS;

G.makeExpeditionProgress = function () {
  return { runs: 0, victories: 0, bestRoom: 0, longestWin: 0, boonsSeen: [] };
};

G.normalizeExpeditionProgress = function (saved) {
  const progress = Object.assign(G.makeExpeditionProgress(), saved || {});
  for (const key of ["runs", "victories", "bestRoom", "longestWin"])
    progress[key] = Math.max(0, Number(progress[key]) || 0);
  progress.boonsSeen = Array.isArray(progress.boonsSeen) ? progress.boonsSeen.filter((id) => EXPEDITION_BOONS[id]) : [];
  return progress;
};

G.normalizeExpeditionRun = function (saved) {
  if (!saved || !saved.backup || !["route", "battle", "reward"].includes(saved.phase)) return null;
  const run = Object.assign({ room: 0, wins: 0, length: 5, seed: 1, bonusSpirit: 0,
    boons: {}, routeChoices: [], draftOptions: [] }, saved);
  run.length = Math.max(3, Math.min(9, Number(run.length) || 5));
  run.room = Math.max(0, Math.min(run.length, Number(run.room) || 0));
  run.wins = Math.max(0, Number(run.wins) || 0);
  run.seed = Math.max(1, Math.floor(Number(run.seed) || 1));
  run.bonusSpirit = Math.max(0, Math.floor(Number(run.bonusSpirit) || 0));
  run.boons = run.boons && typeof run.boons === "object" ? run.boons : {};
  run.routeChoices = Array.isArray(run.routeChoices) ? run.routeChoices : [];
  run.draftOptions = Array.isArray(run.draftOptions) ? run.draftOptions : [];
  run.encounterIds = Array.isArray(run.encounterIds) ? run.encounterIds.filter((id) => G.enemies[id]) : [];
  return run;
};

G.ensureExpeditionProgress = function () {
  if (!G.state.expedition) G.state.expedition = G.makeExpeditionProgress();
  return G.state.expedition;
};

G.expeditionUnlocked = function () {
  return !!(G.state && G.townUnlocked && G.townUnlocked() && G.unlockedForms && G.unlockedForms().length >= 2);
};

G.expeditionHeartBonus = function () {
  const run = G.state && G.state.expeditionRun;
  return run ? (run.boons.heartThread || 0) : 0;
};

G.expeditionManaBonus = function () {
  const run = G.state && G.state.expeditionRun;
  return run ? (run.boons.deepWell || 0) * 2 : 0;
};

G.expeditionSpeedScale = function () {
  const run = G.state && G.state.expeditionRun;
  return run ? 1 + (run.boons.quickBoots || 0) * 0.1 : 1;
};

function expeditionPool() {
  const breadth = Math.min(EXPEDITION_ENEMIES.length, 4 + (G.unlockedForms ? G.unlockedForms().length : 1) +
    Math.floor(((G.state && G.state.stars) || 0) / 4));
  return EXPEDITION_ENEMIES.slice(0, breadth).filter((id) => G.enemies[id] && !G.enemies[id].miniboss);
}

function chooseFrom(array, index) {
  return array.length ? array[Math.abs(index) % array.length] : null;
}

function runIndex(run, salt) {
  // A saved seed makes a run varied but deterministic across reloads.
  const value = Math.sin((run.seed + salt * 9973) * 0.0174533) * 43758.5453;
  return Math.floor(Math.abs(value - Math.floor(value)) * 1000000);
}

function routeChoices(run) {
  if (run.room === run.length - 1) {
    const finale = [
      { id: "wardedChampion", icon: "🛡", name: "Warded Champion", risk: "Final room · one-hit ward", reward: "Expedition victory" },
      { id: "frenziedChampion", icon: "🔥", name: "Frenzied Champion", risk: "Final room · faster pursuit", reward: "Expedition victory" },
    ];
    if (runIndex(run, run.room + 809) % 2) finale.reverse();
    return finale;
  }
  const pairs = [
    [
      { id: "skirmish", icon: "⚔", name: "Crossroads Skirmish", risk: "Three ordinary foes", reward: "Choose one draft" },
      { id: "elite", icon: "◆", name: "Elite Trail", risk: "Two strengthened foes", reward: "Stronger draft choice" },
    ],
    [
      { id: "ambush", icon: "‼", name: "Crowded Shortcut", risk: "Five quick foes", reward: "Extra town spirit on victory" },
      { id: "camp", icon: "🔥", name: "Quiet Camp", risk: "No combat", reward: "Full heal, then draft" },
    ],
    [
      { id: "elite", icon: "◆", name: "Marked Trail", risk: "Two strengthened foes", reward: "Stronger draft choice" },
      { id: "cache", icon: "🎁", name: "Unfinished Cache", risk: "No healing", reward: "Choose from four drafts" },
    ],
  ];
  const pair = pairs[(run.room + runIndex(run, run.room + 1)) % pairs.length].slice();
  if (runIndex(run, run.room + 71) % 2) pair.reverse();
  return pair;
}

function draftOptions(run, bonusChoice) {
  const options = [];
  const boonIds = Object.keys(EXPEDITION_BOONS);
  const boonId = chooseFrom(boonIds, runIndex(run, run.room + run.wins + 101));
  options.push(Object.assign({ kind: "boon", id: boonId }, EXPEDITION_BOONS[boonId]));

  const abilities = G.availableAbilities ? G.availableAbilities() : [];
  const currentLoadout = new Set(G.getLoadout(G.state.formId));
  const abilityIds = abilities.filter((id) => !currentLoadout.has(id));
  const abilityId = chooseFrom(abilityIds, runIndex(run, run.room * 3 + run.wins + 211));
  if (abilityId) {
    const ability = G.abilities[abilityId];
    options.push({ kind: "ability", id: abilityId, icon: ability.icon, name: ability.name,
      text: `Temporarily equip this ${ability.style} move in your last mix slot` });
  } else {
    options.push({ kind: "recovery", id: "recovery", icon: "🍪", name: "Trail Biscuit",
      text: "Recover two hearts and three mana" });
  }

  const forms = G.unlockedForms().filter((id) => id !== G.state.formId);
  const formId = chooseFrom(forms, runIndex(run, run.room + run.wins + 307));
  if (formId) {
    const form = G.forms[formId];
    options.push({ kind: "form", id: formId, icon: form.icon, name: `Form Surge: ${form.name}`,
      text: "Become this form and recover two hearts" });
  } else {
    options.push({ kind: "recovery", id: "recovery", icon: "🍪", name: "Trail Biscuit", text: "Recover two hearts and three mana" });
  }

  if (bonusChoice) {
    const extraId = chooseFrom(boonIds.filter((id) => id !== boonId), runIndex(run, run.room + 401));
    options.push(Object.assign({ kind: "boon", id: extraId }, EXPEDITION_BOONS[extraId]));
  }
  return options;
}

function expeditionEnemy(id, x, y, routeId, champion) {
  const enemy = G.makeEnemy(id, x, y);
  const base = enemy.def;
  const elite = routeId === "elite" || champion;
  const hpScale = champion ? 3.5 : elite ? 1.7 : 1;
  enemy.def = Object.assign({}, base, {
    name: champion ? `Manyfold ${base.name}` : elite ? `Marked ${base.name}` : base.name,
    hp: Math.max(2, Math.round(base.hp * hpScale)),
    size: base.size + (champion ? 5 : elite ? 2 : 0),
    speed: Math.min(125, base.speed * (routeId === "frenziedChampion" ? 1.28 : elite ? 1.08 : 1)),
    damage: Math.min(2, Math.max(1, base.damage || 1)),
    heavy: champion || elite || base.heavy,
  });
  enemy.hp = enemy.def.hp;
  enemy.expeditionElite = elite;
  enemy.expeditionChampion = !!champion;
  if (routeId === "wardedChampion") enemy.ward = { hp: 1, maxHp: 1, types: ["sharp", "blunt", "light", "dark"] };
  return enemy;
}

function spawnEncounter(run) {
  const routeId = run.currentRoute;
  const champion = routeId === "wardedChampion" || routeId === "frenziedChampion";
  const count = champion ? 1 : routeId === "ambush" ? 5 : routeId === "elite" ? 2 : 3;
  const pool = expeditionPool();
  if (!run.encounterIds.length) {
    for (let i = 0; i < count; i++)
      run.encounterIds.push(chooseFrom(pool, runIndex(run, run.room * 17 + i * 7 + run.wins + 503)));
  }
  const spots = [[19, 8], [15, 5], [15, 11], [22, 4], [22, 12]];
  G.state.enemies = run.encounterIds.map((id, index) => {
    const spot = spots[index % spots.length];
    return expeditionEnemy(id, spot[0] * G.TILE + G.TILE / 2, spot[1] * G.TILE + G.TILE / 2, routeId, champion);
  });
  G.state.projectiles = [];
  G.state.pickups = [];
  G.state.player.x = 6 * G.TILE + G.TILE / 2;
  G.state.player.y = 8 * G.TILE + G.TILE / 2;
  G.state.entryPoint = { x: G.state.player.x, y: G.state.player.y };
  G.state.player.invuln = Math.max(G.state.player.invuln, 0.8);
  if (run.boons.wardCake) G.state.player.pantryGuard = Math.max(G.state.player.pantryGuard, 1);
  G.ui.banner(champion ? "★ FINAL MANYFOLD ROOM" : `◇ EXPEDITION ROOM ${run.room + 1}/${run.length}`,
    champion ? G.state.enemies[0].def.name : `${G.state.enemies.length} foes · ${run.currentRoute.replace(/([A-Z])/g, " $1")}`);
}

G.startManyfoldExpedition = function (length) {
  if (!G.expeditionUnlocked() || G.state.expeditionRun || G.state.gauntletRun || G.state.knockout) return false;
  const progress = G.ensureExpeditionProgress();
  const p = G.state.player;
  const runLength = Math.max(3, Math.min(9, Number(length) || 5));
  const run = {
    length: runLength, room: 0, wins: 0, phase: "route", boons: {}, bonusSpirit: 0,
    seed: Math.max(1, Math.floor((Date.now() + progress.runs * 7919) % 2147483647)),
    routeChoices: [], draftOptions: [], encounterIds: [], currentRoute: null,
    backup: {
      mapId: G.state.mapId, px: p.x, py: p.y, formId: G.state.formId,
      damageTaken: p.damageTaken, mana: p.mana,
      loadouts: JSON.parse(JSON.stringify(G.state.loadouts || {})),
    },
  };
  run.routeChoices = routeChoices(run);
  G.state.expeditionRun = run;
  progress.runs += 1;
  G.world.load("manyfoldExpedition", { x: 6, y: 8 });
  p.damageTaken = 0;
  p.mana = G.playerMaxMana();
  G.sfx.play("unlock");
  G.ui.banner("◇ MANYFOLD EXPEDITION", `${runLength} rooms · temporary drafts · failure is safe`);
  G.saveGame();
  return true;
};

function finishNonCombatRoute(run, routeId) {
  run.room += 1;
  run.wins += 1;
  if (routeId === "camp") {
    G.state.player.damageTaken = 0;
    G.state.player.mana = G.playerMaxMana();
  }
  run.phase = "reward";
  run.draftOptions = draftOptions(run, routeId === "cache");
  run.routeChoices = [];
  G.saveGame();
}

G.chooseExpeditionRoute = function (routeId) {
  const run = G.state.expeditionRun;
  if (!run || run.phase !== "route" || !run.routeChoices.some((route) => route.id === routeId)) return false;
  run.currentRoute = routeId;
  run.encounterIds = [];
  if (routeId === "camp" || routeId === "cache") {
    finishNonCombatRoute(run, routeId);
    return true;
  }
  run.phase = "battle";
  spawnEncounter(run);
  G.saveGame();
  return true;
};

function rememberBoon(progress, id) {
  if (!progress.boonsSeen.includes(id)) progress.boonsSeen.push(id);
}

G.chooseExpeditionDraft = function (index) {
  const run = G.state.expeditionRun;
  const option = run && run.phase === "reward" ? run.draftOptions[index] : null;
  if (!option) return false;
  if (option.kind === "boon") {
    run.boons[option.id] = (run.boons[option.id] || 0) + 1;
    rememberBoon(G.ensureExpeditionProgress(), option.id);
    if (option.id === "heartThread") G.state.player.damageTaken = Math.max(0, G.state.player.damageTaken - 1);
    if (option.id === "deepWell") G.state.player.mana = Math.min(G.playerMaxMana(), G.state.player.mana + 2);
  } else if (option.kind === "ability") {
    const form = G.playerForm();
    const slot = Math.max(1, Math.min(form.slots || 1, 2));
    G.getLoadout(G.state.formId)[slot] = option.id;
  } else if (option.kind === "form") {
    G.setForm(option.id);
    G.healPlayer(2, "expedition-form-surge");
  } else {
    G.healPlayer(2, "expedition-biscuit");
    G.state.player.mana = Math.min(G.playerMaxMana(), G.state.player.mana + 3);
  }
  run.phase = "route";
  run.currentRoute = null;
  run.encounterIds = [];
  run.draftOptions = [];
  run.routeChoices = routeChoices(run);
  G.sfx.play("pickup");
  G.saveGame();
  return true;
};

function restoreCampaign(run, refill) {
  const backup = run.backup;
  G.state.loadouts = backup.loadouts || {};
  if (G.forms[backup.formId] && G.formUnlocked(backup.formId)) G.state.formId = backup.formId;
  G.state.expeditionRun = null;
  G.world.load(G.maps[backup.mapId] ? backup.mapId : "overworld", {
    x: (backup.px - G.TILE / 2) / G.TILE,
    y: (backup.py - G.TILE / 2) / G.TILE,
  });
  G.state.player.damageTaken = refill ? 0 : Math.min(G.playerMaxHearts() - 1, Math.max(0, Number(backup.damageTaken) || 0));
  G.state.player.mana = refill ? G.playerMaxMana() : Math.min(G.playerMaxMana(), Math.max(0, Number(backup.mana) || 0));
  G.state.player.cooldowns = {};
}

function completeExpedition(run) {
  const length = run.length;
  const progress = G.ensureExpeditionProgress();
  progress.victories += 1;
  progress.bestRoom = Math.max(progress.bestRoom, run.room);
  const record = length > progress.longestWin;
  progress.longestWin = Math.max(progress.longestWin, length);
  const spirit = 8 + length * 2 + (run.bonusSpirit || 0);
  if (record) G.state.stars += 1;
  restoreCampaign(run, true);
  if (G.addTownReward) G.addTownReward(spirit, length >= 7 ? 2 : 1, "Manyfold victory", true);
  G.sfx.play("quest");
  G.ui.banner("◇ EXPEDITION COMPLETE", `+${spirit} town spirit · +${length >= 7 ? 2 : 1} resident${length >= 7 ? "s" : ""}${record ? " · +1 ⭐ record" : ""}`);
  G.events.emit("expeditionComplete", { length });
  if (G.refreshIncidents) G.refreshIncidents(true);
  G.saveGame();
}

G.failManyfoldExpedition = function (message, abandoned) {
  const run = G.state.expeditionRun;
  if (!run) return false;
  const progress = G.ensureExpeditionProgress();
  progress.bestRoom = Math.max(progress.bestRoom, run.room);
  const consolation = abandoned ? 0 : Math.min(6, run.wins);
  restoreCampaign(run, false);
  if (consolation && G.addTownReward) G.addTownReward(consolation, 0, "Expedition lessons", true);
  G.sfx.play(abandoned ? "door" : "stagger");
  G.ui.banner(abandoned ? "◇ EXPEDITION LEFT" : "◇ EXPEDITION ENDED",
    message || (abandoned ? "The route will rearrange for next time." : `The town remembers ${run.wins} cleared room${run.wins === 1 ? "" : "s"}.`));
  G.saveGame();
  return true;
};

G.resumeManyfoldExpedition = function () {
  const run = G.state.expeditionRun;
  if (!run || G.state.mapId !== "manyfoldExpedition") return false;
  if (run.phase === "battle") spawnEncounter(run);
  else if (G.ui && G.ui.openExpedition) G.ui.openExpedition();
  return true;
};

G.events.on("kill", () => {
  const run = G.state && G.state.expeditionRun;
  if (!run || run.phase !== "battle" || G.state.mapId !== "manyfoldExpedition") return;
  if (G.state.enemies.some((enemy) => !enemy.dead)) return;
  run.room += 1;
  run.wins += 1;
  if (run.currentRoute === "ambush") run.bonusSpirit = (run.bonusSpirit || 0) + 2;
  if (run.room >= run.length) {
    completeExpedition(run);
    return;
  }
  run.phase = "reward";
  run.draftOptions = draftOptions(run, run.currentRoute === "elite");
  run.routeChoices = [];
  G.state.projectiles = [];
  G.state.pickups = [];
  G.saveGame();
  if (G.ui && G.ui.openExpedition) G.ui.openExpedition();
});
