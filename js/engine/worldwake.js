/* ============================================================
   WORLDWAKE — the expansion campaign.

   This layer keeps exploration, Worldbearer marks, caravan favors, and
   lasting regional changes data-driven. New regions and guardians can be
   added without inventing another progression system.
   ============================================================ */

"use strict";

G.WORLDWAKE_REGIONS = [
  { id: "sunstepPrairie", name: "Sunstep Prairie", icon: "☀️", clue: "Follow the warm grass beyond Greenfield's eastern reach.", spawn: { x: 3, y: 14 } },
  { id: "windscarCanyon", name: "Windscar Canyon", icon: "🪶", clue: "The prairie trail climbs toward a split in the red cliffs.", spawn: { x: 3, y: 14 } },
  { id: "hangingGardens", name: "Hanging Gardens", icon: "🌿", clue: "Ride the canyon's high road until stone gives way to roots.", spawn: { x: 3, y: 14 } },
  { id: "rootdeepHollow", name: "Rootdeep Hollow", icon: "🕸️", clue: "A living stair curls down beneath the Hanging Gardens.", spawn: { x: 3, y: 14 } },
  { id: "glasswaterDesert", name: "Glasswater Desert", icon: "🔆", clue: "A silver tunnel leaves Rootdeep for a horizon that shines like water.", spawn: { x: 3, y: 14 } },
  { id: "frostbellTundra", name: "Frostbell Tundra", icon: "🔔", clue: "Beyond Shattercoast, follow the shore until every wave turns white.", spawn: { x: 3, y: 14 } },
  { id: "stormspinePeaks", name: "Stormspine Peaks", icon: "⛈️", clue: "The tundra's bells point toward a stair cut into the storm.", spawn: { x: 3, y: 14 } },
  { id: "titanGrave", name: "Titan Grave", icon: "🗿", clue: "Two ancient roads meet where the last Worldbearer sleeps.", spawn: { x: 4, y: 14 } },
];

G.WORLDWAKE_MARKS = {
  "trophy-sky-sovereign": { id: "sky", name: "Sky Mark", icon: "🪶", region: "windscarCanyon" },
  "trophy-old-mason": { id: "stone", name: "Stone Mark", icon: "🪨", region: "hangingGardens" },
  "trophy-silk-matriarch": { id: "thread", name: "Thread Mark", icon: "🕸️", region: "rootdeepHollow" },
  "trophy-bell-titan": { id: "echo", name: "Echo Mark", icon: "🔔", region: "frostbellTundra" },
  "trophy-lantern-keeper": { id: "light", name: "Lantern Mark", icon: "🏮", region: "stormspinePeaks" },
  "trophy-last-worldbearer": { id: "heart", name: "Worldheart Mark", icon: "🗿", region: "titanGrave" },
};

G.WORLDWAKE_FAVORS = [
  { id: "firstFootsteps", name: "First Footsteps", text: "Discover 3 Worldwake regions", kind: "regions", count: 3, stars: 2 },
  { id: "campfireStories", name: "Campfire Stories", text: "Read 6 signs in the new world", kind: "signs", count: 6, stars: 2 },
  { id: "manyWays", name: "Many Ways Forward", text: "Use all 5 ability styles", kind: "styles", count: 5, stars: 2 },
  { id: "gentleGiants", name: "Gentle Giants", text: "Purify 3 Worldbearers", kind: "marks", count: 3, stars: 3 },
  { id: "wholeHorizon", name: "The Whole Horizon", text: "Discover all 8 Worldwake regions", kind: "regions", count: 8, stars: 4, item: "worldwake-cloak" },
  { id: "worldAtPeace", name: "A World at Peace", text: "Purify all 6 Worldbearers", kind: "marks", count: 6, stars: 5, item: "worldwake-crown" },
];

G.makeWorldwake = function () {
  return {
    discovered: [],
    marks: [],
    readSigns: [],
    stylesUsed: [],
    favorsDone: [],
    caravanLevel: 0,
    heardBanter: [],
  };
};

G.normalizeWorldwake = function (saved, legacySave) {
  const fresh = G.makeWorldwake();
  const campaign = Object.assign(fresh, saved || {});
  const regionIds = new Set(G.WORLDWAKE_REGIONS.map((region) => region.id));
  const markIds = new Set(Object.values(G.WORLDWAKE_MARKS).map((mark) => mark.id));
  campaign.discovered = Array.from(new Set((campaign.discovered || []).filter((id) => regionIds.has(id))));
  campaign.marks = Array.from(new Set((campaign.marks || []).filter((id) => markIds.has(id))));
  campaign.readSigns = Array.from(new Set(campaign.readSigns || []));
  campaign.stylesUsed = Array.from(new Set((campaign.stylesUsed || []).filter((style) =>
    ["melee", "projectile", "dash", "area", "chain"].includes(style))));
  campaign.favorsDone = Array.from(new Set((campaign.favorsDone || []).filter((id) =>
    G.WORLDWAKE_FAVORS.some((favor) => favor.id === id))));
  campaign.heardBanter = Array.from(new Set(campaign.heardBanter || []));
  campaign.caravanLevel = campaign.favorsDone.length;

  // Trophy items are the durable source of truth, so old saves and rematches
  // can never lose a World Mark if campaign data changes later.
  for (const item of (legacySave && legacySave.items) || []) {
    const mark = G.WORLDWAKE_MARKS[item];
    if (mark && !campaign.marks.includes(mark.id)) campaign.marks.push(mark.id);
  }
  if (legacySave && regionIds.has(legacySave.mapId) && !campaign.discovered.includes(legacySave.mapId))
    campaign.discovered.push(legacySave.mapId);
  return campaign;
};

G.ensureWorldwake = function () {
  if (!G.state.worldwake) G.state.worldwake = G.makeWorldwake();
  return G.state.worldwake;
};

G.worldwakeRegion = function (id) {
  return G.WORLDWAKE_REGIONS.find((region) => region.id === id) || null;
};

G.worldwakeFavorProgress = function (favor) {
  const campaign = G.ensureWorldwake();
  if (favor.kind === "regions") return campaign.discovered.length;
  if (favor.kind === "marks") return campaign.marks.length;
  if (favor.kind === "signs") return campaign.readSigns.length;
  if (favor.kind === "styles") return campaign.stylesUsed.length;
  return 0;
};

G.checkWorldwakeFavors = function (quiet) {
  if (!G.state) return false;
  const campaign = G.ensureWorldwake();
  let changed = false;
  for (const favor of G.WORLDWAKE_FAVORS) {
    if (campaign.favorsDone.includes(favor.id) || G.worldwakeFavorProgress(favor) < favor.count) continue;
    campaign.favorsDone.push(favor.id);
    campaign.caravanLevel = campaign.favorsDone.length;
    G.state.stars += favor.stars;
    if (favor.item && !G.state.items.includes(favor.item)) G.state.items.push(favor.item);
    changed = true;
    if (!quiet) {
      G.sfx.play("quest");
      G.state.shake = Math.max(G.state.shake, 0.38);
      G.ui.banner(`CARAVAN FAVOR: ${favor.name.toUpperCase()}`, `${favor.stars} stars earned${favor.item ? " · a keepsake joined your wardrobe" : ""}`);
    }
  }
  if (changed) {
    if (G.checkCostumeUnlocks) G.checkCostumeUnlocks(quiet);
    if (G.checkUnlocks) G.checkUnlocks();
    G.saveGame();
  }
  return changed;
};

G.hasWorldMark = function (id) {
  return !!(G.state && G.ensureWorldwake().marks.includes(id));
};

G.worldwakePurified = function (mapId) {
  const region = G.worldwakeRegion(mapId);
  if (!region) return false;
  return Object.values(G.WORLDWAKE_MARKS).some((mark) => mark.region === mapId && G.hasWorldMark(mark.id));
};

G.travelToWorldwakeRegion = function (id) {
  const region = G.worldwakeRegion(id);
  const campaign = G.ensureWorldwake();
  if (!region || !campaign.discovered.includes(id) || !G.canWayfinderTravel || !G.canWayfinderTravel()) return false;
  if (G.state.mapId === id) {
    G.ui.toast(`Already in ${region.name}.`, 2);
    return false;
  }
  G.world.load(id, region.spawn);
  G.sfx.play("door");
  G.spawnFx({ kind: "ring", x: G.state.player.x, y: G.state.player.y - 8, color: "#ffcd75", radius: 28, dur: 0.55 });
  G.ui.toast(`Wayfinder Whistle: ${region.name}`, 2.5);
  G.saveGame();
  return true;
};

const WORLDWAKE_BANTER = {
  sunstepPrairie: "Pebble: That horizon is enormous. Try not to trip over it.",
  windscarCanyon: "Pebble: Something up there is using the whole sky as a nest.",
  hangingGardens: "Pebble: The stairs are growing. That feels helpful and suspicious.",
  rootdeepHollow: "Pebble: If a web has a front door, are we guests or snacks?",
  glasswaterDesert: "Pebble: Do not drink the horizon. I checked. It is mostly sand.",
  frostbellTundra: "Pebble: The ice is singing. Good news: it has excellent rhythm.",
  stormspinePeaks: "Pebble: I counted the lightning. The lightning counted back.",
  titanGrave: "Pebble: We came a long way. Whatever wakes up, we wake up together.",
};

G.events.on("mapEnter", (data) => {
  if (!G.state) return;
  const region = G.worldwakeRegion(data.map);
  if (!region) return;
  const campaign = G.ensureWorldwake();
  const first = !campaign.discovered.includes(data.map);
  if (first) {
    campaign.discovered.push(data.map);
    campaign.heardBanter.push(data.map);
    G.ui.banner("WORLDWAKE REGION DISCOVERED",
      `${region.icon} ${region.name} · ${campaign.discovered.length}/${G.WORLDWAKE_REGIONS.length} · ${WORLDWAKE_BANTER[data.map]}`);
  } else {
    G.ui.toast(`🗺 ${region.name}`, 2.2);
  }
  G.checkWorldwakeFavors(false);
  G.saveGame();
});

G.events.on("sign", (data) => {
  if (!G.state || !G.worldwakeRegion(G.state.mapId)) return;
  const campaign = G.ensureWorldwake();
  const key = `${G.state.mapId}:${data.message}`;
  if (!campaign.readSigns.includes(key)) campaign.readSigns.push(key);
  G.checkWorldwakeFavors(false);
});

G.events.on("abilityUse", (data) => {
  if (!G.state || !G.worldwakeRegion(G.state.mapId)) return;
  const ability = G.abilities[data.ability];
  if (!ability) return;
  const campaign = G.ensureWorldwake();
  if (!campaign.stylesUsed.includes(ability.style)) campaign.stylesUsed.push(ability.style);
  G.checkWorldwakeFavors(false);
});

G.events.on("pickup", (data) => {
  if (!G.state) return;
  const mark = G.WORLDWAKE_MARKS[data.item];
  if (!mark) return;
  const campaign = G.ensureWorldwake();
  if (!campaign.marks.includes(mark.id)) {
    campaign.marks.push(mark.id);
    G.ui.banner(`${mark.icon} ${mark.name.toUpperCase()} AWAKENED`, "The region changes, and a new World Path answers you.");
  }
  G.checkWorldwakeFavors(false);
});
