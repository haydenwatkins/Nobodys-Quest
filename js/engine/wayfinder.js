/* ============================================================
   WAYFINDER ATLAS — orientation, discovery, and staged fast travel.

   The world map is always available. Regional posts teach fast travel early;
   the Whistle later makes those routes available from any safe area. Trials
   and dens reveal their names only after entry.
   ============================================================ */

"use strict";

G.WAYFINDER_REGIONS = [
  {
    id: "overworld", name: "Greenfield", icon: "🌱", stars: 0,
    clue: "Your journey begins at Greenfield's central crossroads.",
    spawn: { x: 60, y: 45 },
  },
  {
    id: "whispering-grove", name: "Whispering Grove", icon: "🌙", stars: 0,
    clue: "Search Greenfield's southern edge, west of the crossroads.",
    spawn: { x: 2, y: 10 },
  },
  {
    id: "mistwood", name: "Mistwood", icon: "🌲", stars: 1,
    clue: "A narrow trail leaves Greenfield through its northern forest.",
    spawn: { x: 2, y: 1 },
  },
  {
    id: "dungeon", name: "The Old Dungeon", icon: "🗝️", stars: 3,
    clue: "Follow Greenfield's central road north to a sealed stone door.",
    spawn: { x: 15, y: 14 },
  },
  {
    id: "sunkenMarsh", name: "Sunken Marsh", icon: "🪷", stars: 4,
    clue: "Greenfield's western road ends where the ground turns to water.",
    spawn: { x: 4, y: 9 },
  },
  {
    id: "emberRidge", name: "Ember Ridge", icon: "🔥", stars: 7,
    clue: "Take Greenfield's eastern road toward the hot, broken stone.",
    spawn: { x: 2, y: 1 },
  },
  {
    id: "starfallRuins", name: "Starfall Ruins", icon: "☄️", stars: 10,
    clue: "Search Greenfield's southern edge, east of the crossroads.",
    spawn: { x: 2, y: 1 },
  },
  {
    id: "shattercoast", name: "Shattercoast", icon: "🌊", stars: 28,
    clue: "A salt-wind passage waits along Greenfield's southwest edge.",
    spawn: { x: 2, y: 14 },
  },
];

// Atlas coordinates are deliberately schematic. Nobody's Quest uses separate
// local grids, so a legible route diagram is more honest than pretend global
// geography. The Worldwake road visibly joins both sides of the old world.
G.WAYFINDER_ATLAS_NODES = [
  { id: "overworld", x: 18, y: 48 },
  { id: "mistwood", x: 18, y: 12 },
  { id: "dungeon", x: 31, y: 26 },
  { id: "sunkenMarsh", x: 5, y: 43 },
  { id: "whispering-grove", x: 5, y: 69 },
  { id: "emberRidge", x: 31, y: 48 },
  { id: "starfallRuins", x: 31, y: 71 },
  { id: "shattercoast", x: 18, y: 88 },
  { id: "sunstepPrairie", x: 44, y: 48 },
  { id: "windscarCanyon", x: 56, y: 28 },
  { id: "hangingGardens", x: 69, y: 13 },
  { id: "rootdeepHollow", x: 82, y: 28 },
  { id: "glasswaterDesert", x: 92, y: 49 },
  { id: "titanGrave", x: 82, y: 72 },
  { id: "stormspinePeaks", x: 68, y: 87 },
  { id: "frostbellTundra", x: 45, y: 88 },
];

G.WAYFINDER_ATLAS_EDGES = [
  ["overworld", "mistwood"], ["overworld", "dungeon"],
  ["overworld", "sunkenMarsh"], ["overworld", "whispering-grove"],
  ["overworld", "emberRidge"], ["overworld", "starfallRuins"],
  ["overworld", "shattercoast"], ["overworld", "sunstepPrairie"],
  ["sunstepPrairie", "windscarCanyon"], ["windscarCanyon", "hangingGardens"],
  ["hangingGardens", "rootdeepHollow"], ["rootdeepHollow", "glasswaterDesert"],
  ["glasswaterDesert", "titanGrave"], ["titanGrave", "stormspinePeaks"],
  ["stormspinePeaks", "frostbellTundra"], ["frostbellTundra", "shattercoast"],
];

const WAYFINDER_REGION_IDS = new Set(G.WAYFINDER_REGIONS.map((region) => region.id));
const WAYFINDER_LEGACY_ITEMS = {
  "knights-crest": "dungeon",
  "whispering-seed": "whispering-grove",
  "trophy-heartwood-crown": "mistwood",
  "trophy-mire-pearl": "sunkenMarsh",
  "trophy-eclipse-sigil": "emberRidge",
  "starfall-thread": "starfallRuins",
  "tide-shell": "shattercoast",
  "paper-crane": "shattercoast",
  "orrery-key": "shattercoast",
  "elder-acorn": "shattercoast",
};

G.makeWayfinder = function () {
  return {
    discovered: [],
    posts: [],
    introSeen: false,
    whistleClaimed: false,
    rewardClaimed: false,
  };
};

G.wayfinderLandmarkIds = function () {
  return Object.values(G.maps)
    .filter((map) => map.bossTrial || map.id === "gauntletArena")
    .map((map) => map.id);
};

G.wayfinderAllIds = function () {
  return G.WAYFINDER_REGIONS.map((region) => region.id).concat(G.wayfinderLandmarkIds());
};

G.normalizeWayfinder = function (saved, legacySave) {
  const hadPostData = !!(saved && Array.isArray(saved.posts));
  const journal = Object.assign(G.makeWayfinder(), saved || {});
  const valid = new Set(G.wayfinderAllIds());
  journal.discovered = Array.isArray(journal.discovered)
    ? Array.from(new Set(journal.discovered.filter((id) => valid.has(id))))
    : [];
  journal.rewardClaimed = !!journal.rewardClaimed;
  journal.whistleClaimed = !!(journal.whistleClaimed || journal.rewardClaimed ||
    ((legacySave && legacySave.items) || []).includes("wayfinder-whistle"));
  journal.introSeen = hadPostData ? !!journal.introSeen : false;

  // Saves made before the Journal existed still remember enough evidence to
  // reconstruct most visits without falsely revealing untouched locations.
  const old = legacySave || {};
  const infer = (id) => { if (valid.has(id) && !journal.discovered.includes(id)) journal.discovered.push(id); };
  infer("overworld");
  if (old.mapId) infer(old.mapId);
  for (const opened of old.opened || []) infer(String(opened).split(":")[0]);
  for (const item of old.items || []) if (WAYFINDER_LEGACY_ITEMS[item]) infer(WAYFINDER_LEGACY_ITEMS[item]);
  const postIds = new Set(G.wayfinderAllPostIds());
  journal.posts = Array.isArray(journal.posts)
    ? Array.from(new Set(journal.posts.filter((id) => postIds.has(id))))
    : [];
  // Existing saves should not have to revisit every region merely because
  // posts were added later. A recorded visit is enough migration evidence.
  for (const id of journal.discovered) if (postIds.has(id) && !journal.posts.includes(id)) journal.posts.push(id);
  for (const id of (old.worldwake && old.worldwake.discovered) || [])
    if (postIds.has(id) && !journal.posts.includes(id)) journal.posts.push(id);
  return journal;
};

G.ensureWayfinder = function () {
  if (!G.state.wayfinder) G.state.wayfinder = G.makeWayfinder();
  return G.state.wayfinder;
};

G.wayfinderRegion = function (id) {
  return G.WAYFINDER_REGIONS.find((region) => region.id === id) || null;
};

G.wayfinderRegionInfo = function (id) {
  return G.wayfinderRegion(id) || (G.worldwakeRegion && G.worldwakeRegion(id)) || null;
};

G.wayfinderAllPostIds = function () {
  const worldwake = (G.WORLDWAKE_REGIONS || []).map((region) => region.id);
  return G.WAYFINDER_REGIONS.map((region) => region.id).concat(worldwake);
};

G.wayfinderPostActivated = function (id) {
  return G.ensureWayfinder().posts.includes(id);
};

// Find a clear tile beside the safe arrival point. This keeps posts close to
// every entrance even if Ben reshapes a map without manually moving metadata.
G.wayfinderPostForMap = function (mapId, grid) {
  const region = G.wayfinderRegionInfo(mapId);
  if (!region || !grid || !grid.length) return null;
  const target = region.spawn || (G.maps[mapId] && G.maps[mapId].playerStart);
  if (!target) return null;
  const offsets = [
    [0, -1], [1, 0], [0, 1], [-1, 0], [1, -1], [1, 1], [-1, 1], [-1, -1],
    [0, -2], [2, 0], [0, 2], [-2, 0],
  ];
  for (const [ox, oy] of offsets) {
    const x = target.x + ox;
    const y = target.y + oy;
    const cell = grid[y] && grid[y][x];
    if (!cell || ["tree", "water", "wall", "rock"].includes(cell.tile)) continue;
    if (cell.portal || cell.chest || cell.enemy || cell.message || cell.rest) continue;
    return { mapId, tileX: x, tileY: y, x: x * G.TILE + G.TILE / 2, y: y * G.TILE + G.TILE / 2 };
  }
  return null;
};

G.nearWayfinderPost = function () {
  const s = G.state;
  const post = s && s.wayfinderPost;
  return !!(post && G.wayfinderPostActivated(s.mapId) &&
    G.util.dist(s.player.x, s.player.y, post.x, post.y) <= G.TILE * 2.35);
};

G.activateWayfinderPost = function (mapId, quiet) {
  const journal = G.ensureWayfinder();
  if (!G.wayfinderAllPostIds().includes(mapId)) return false;
  const first = !journal.posts.includes(mapId);
  if (first) journal.posts.push(mapId);
  if (!journal.introSeen) {
    journal.introSeen = true;
    if (!quiet) {
      const copy = "This post remembers roads you have walked. Open MAP beside any awakened post to travel.";
      if (G.ui.dialogue) G.ui.dialogue("🧭 WAYFINDER POST", copy, { accent: "#73eff7" });
      else G.ui.banner("WAYFINDER POST AWAKENED", copy);
    }
  } else if (first && !quiet) {
    const region = G.wayfinderRegionInfo(mapId);
    G.ui.banner("🧭 ROUTE AWAKENED", `${region.icon} ${region.name} joined the Wayfinder network`);
  }
  if (first) G.saveGame();
  return first;
};

G.wayfinderDiscovered = function (id) {
  return G.ensureWayfinder().discovered.includes(id);
};

G.wayfinderProgress = function () {
  const found = G.WAYFINDER_REGIONS.filter((region) => G.wayfinderDiscovered(region.id)).length;
  const landmarks = G.wayfinderLandmarkIds();
  return {
    found, total: G.WAYFINDER_REGIONS.length,
    landmarksFound: landmarks.filter((id) => G.wayfinderDiscovered(id)).length,
    landmarksTotal: landmarks.length,
  };
};

G.discoveredWayfinderLandmarks = function () {
  return G.wayfinderLandmarkIds()
    .filter((id) => G.wayfinderDiscovered(id))
    .map((id) => G.maps[id]);
};

G.checkWayfinderMilestones = function (quiet) {
  if (!G.state) return false;
  const journal = G.ensureWayfinder();
  const progress = G.wayfinderProgress();
  let changed = false;

  if (!journal.whistleClaimed && progress.found >= 4) {
    journal.whistleClaimed = true;
    if (!G.state.items.includes("wayfinder-whistle")) G.state.items.push("wayfinder-whistle");
    changed = true;
    if (!quiet) {
      G.sfx.play("unlock");
      G.state.shake = Math.max(G.state.shake, 0.35);
      G.ui.banner("🎵 WAYFINDER WHISTLE", "Travel to awakened posts from anywhere safe");
    }
  }

  if (journal.rewardClaimed || progress.found < progress.total) {
    if (changed) {
      if (G.checkUnlocks) G.checkUnlocks();
      G.saveGame();
    }
    return changed;
  }

  journal.rewardClaimed = true;
  G.state.stars += 3;
  changed = true;
  if (!quiet) {
    G.sfx.play("unlock");
    G.state.shake = Math.max(G.state.shake, 0.45);
    G.ui.banner("🧭 THE LONG WAY AROUND", "+3 ⭐ · direct landmark travel unlocked");
  }
  if (G.checkUnlocks) G.checkUnlocks();
  G.saveGame();
  return changed;
};

G.checkWayfinderCompletion = G.checkWayfinderMilestones;

G.discoverWayfinderMap = function (mapId, quiet) {
  const journal = G.ensureWayfinder();
  const valid = WAYFINDER_REGION_IDS.has(mapId) || G.wayfinderLandmarkIds().includes(mapId);
  if (!valid) return false;
  if (journal.discovered.includes(mapId)) {
    G.checkWayfinderMilestones(quiet);
    return false;
  }
  journal.discovered.push(mapId);

  const region = G.wayfinderRegion(mapId);
  if (!quiet && region && mapId !== "overworld") {
    const progress = G.wayfinderProgress();
    G.sfx.play("pickup");
    G.ui.banner("🧭 REGION DISCOVERED", `${region.icon} ${region.name} · ${progress.found}/${progress.total}`);
  }
  G.checkWayfinderMilestones(quiet);
  G.saveGame();
  return true;
};

G.wayfinderTravelUnlocked = function () {
  return !!(G.state && G.ensureWayfinder().posts.length);
};

G.canWayfinderTravel = function () {
  if (!G.state || !G.wayfinderTravelUnlocked()) return false;
  if (G.state.gauntletRun || G.state.knockout || G.state.bossCutscene) return false;
  if (G.state.mapDef && G.state.mapDef.bossTrial) return false;
  return G.nearWayfinderPost() || (G.state.items || []).includes("wayfinder-whistle");
};

G.wayfinderTravelReason = function () {
  if (!G.state) return "The route is unavailable.";
  if (G.state.gauntletRun) return "Finish or leave the gauntlet before traveling.";
  if (G.state.knockout || G.state.bossCutscene) return "Finish this story moment before traveling.";
  if (G.state.mapDef && G.state.mapDef.bossTrial) return "Guardian trials must be entered and exited on foot.";
  if (!G.wayfinderTravelUnlocked()) return "Awaken a Wayfinder Post to begin traveling.";
  if (!G.nearWayfinderPost() && !(G.state.items || []).includes("wayfinder-whistle"))
    return "Stand beside this region's Wayfinder Post to travel.";
  return "Choose an awakened post.";
};

G.wayfinderLandmarkTravelUnlocked = function () {
  return !!(G.state && G.ensureWayfinder().rewardClaimed);
};

G.travelToWayfinderRegion = function (id) {
  const region = G.wayfinderRegion(id);
  if (!region || !G.wayfinderDiscovered(id) || !G.wayfinderPostActivated(id) || !G.canWayfinderTravel()) return false;
  if (G.state.mapId === id) {
    G.ui.toast(`Already in ${region.name}.`, 2);
    return false;
  }
  G.world.load(id, region.spawn);
  G.sfx.play("door");
  G.spawnFx({ kind: "ring", x: G.state.player.x, y: G.state.player.y - 8, color: "#73eff7", radius: 26, dur: 0.55 });
  G.ui.toast(`🎵 Wayfinder Whistle: ${region.name}`, 2.5);
  G.saveGame();
  return true;
};

G.travelToWayfinderLandmark = function (id) {
  const map = G.maps[id];
  if (!map || !map.bossTrial || !G.wayfinderDiscovered(id) ||
      !G.wayfinderLandmarkTravelUnlocked() || !G.canWayfinderTravel()) return false;
  if (G.state.mapId === id) {
    G.ui.toast(`Already at ${map.name}.`, 2);
    return false;
  }
  G.world.load(id, map.playerStart);
  G.sfx.play("door");
  G.spawnFx({ kind: "ring", x: G.state.player.x, y: G.state.player.y - 8, color: "#ffcd75", radius: 28, dur: 0.55 });
  G.ui.toast(`Wayfinder memory: ${map.name}`, 2.5);
  G.saveGame();
  return true;
};

G.events.on("mapEnter", (data) => {
  if (!G.state) return;
  G.discoverWayfinderMap(data.map, false);
  if (G.wayfinderAllPostIds().includes(data.map)) G.activateWayfinderPost(data.map, false);
});
