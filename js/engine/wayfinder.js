/* ============================================================
   WAYFINDER JOURNAL — discovery guidance without a spoiler map.

   Major regions are visible from the start as clue-based goals. Trials and
   dens only reveal their names after entry. Completing the region list earns
   fast travel, which makes late-game contracts and rematches less repetitive.
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

const WAYFINDER_REGION_IDS = new Set(G.WAYFINDER_REGIONS.map((region) => region.id));
const WAYFINDER_LEGACY_ITEMS = {
  "knights-crest": "dungeon",
  "whispering-seed": "whispering-grove",
  "trophy-heartwood-crown": "mistwood",
  "trophy-mire-pearl": "sunkenMarsh",
  "trophy-eclipse-sigil": "emberRidge",
  "tide-shell": "shattercoast",
  "paper-crane": "shattercoast",
  "orrery-key": "shattercoast",
  "elder-acorn": "shattercoast",
};

G.makeWayfinder = function () {
  return { discovered: [], rewardClaimed: false };
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
  const journal = Object.assign(G.makeWayfinder(), saved || {});
  const valid = new Set(G.wayfinderAllIds());
  journal.discovered = Array.isArray(journal.discovered)
    ? Array.from(new Set(journal.discovered.filter((id) => valid.has(id))))
    : [];
  journal.rewardClaimed = !!journal.rewardClaimed;

  // Saves made before the Journal existed still remember enough evidence to
  // reconstruct most visits without falsely revealing untouched locations.
  const old = legacySave || {};
  const infer = (id) => { if (valid.has(id) && !journal.discovered.includes(id)) journal.discovered.push(id); };
  infer("overworld");
  if (old.mapId) infer(old.mapId);
  for (const opened of old.opened || []) infer(String(opened).split(":")[0]);
  for (const item of old.items || []) if (WAYFINDER_LEGACY_ITEMS[item]) infer(WAYFINDER_LEGACY_ITEMS[item]);
  return journal;
};

G.ensureWayfinder = function () {
  if (!G.state.wayfinder) G.state.wayfinder = G.makeWayfinder();
  return G.state.wayfinder;
};

G.wayfinderRegion = function (id) {
  return G.WAYFINDER_REGIONS.find((region) => region.id === id) || null;
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

G.checkWayfinderCompletion = function (quiet) {
  if (!G.state) return false;
  const journal = G.ensureWayfinder();
  const progress = G.wayfinderProgress();
  if (journal.rewardClaimed || progress.found < progress.total) return false;

  journal.rewardClaimed = true;
  if (!G.state.items.includes("wayfinder-whistle")) G.state.items.push("wayfinder-whistle");
  G.state.stars += 3;
  if (!quiet) {
    G.sfx.play("unlock");
    G.state.shake = Math.max(G.state.shake, 0.45);
    G.ui.banner("🧭 THE LONG WAY AROUND", "Wayfinder Whistle earned · +3 ⭐ · fast travel unlocked");
  }
  if (G.checkUnlocks) G.checkUnlocks();
  G.saveGame();
  return true;
};

G.discoverWayfinderMap = function (mapId, quiet) {
  const journal = G.ensureWayfinder();
  const valid = WAYFINDER_REGION_IDS.has(mapId) || G.wayfinderLandmarkIds().includes(mapId);
  if (!valid || journal.discovered.includes(mapId)) return false;
  journal.discovered.push(mapId);

  const region = G.wayfinderRegion(mapId);
  if (!quiet && region && mapId !== "overworld") {
    const progress = G.wayfinderProgress();
    G.sfx.play("pickup");
    G.ui.banner("🧭 REGION DISCOVERED", `${region.icon} ${region.name} · ${progress.found}/${progress.total}`);
  }
  G.checkWayfinderCompletion(quiet);
  G.saveGame();
  return true;
};

G.wayfinderTravelUnlocked = function () {
  return !!(G.state && (G.state.items || []).includes("wayfinder-whistle"));
};

G.canWayfinderTravel = function () {
  if (!G.wayfinderTravelUnlocked() || !G.state) return false;
  if (G.state.gauntletRun || G.state.knockout || G.state.bossCutscene) return false;
  return !(G.state.mapDef && G.state.mapDef.bossTrial);
};

G.travelToWayfinderRegion = function (id) {
  const region = G.wayfinderRegion(id);
  if (!region || !G.wayfinderDiscovered(id) || !G.canWayfinderTravel()) return false;
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

G.events.on("mapEnter", (data) => {
  if (G.state) G.discoverWayfinderMap(data.map, false);
});
