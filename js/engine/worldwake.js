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

// A World Mark can also teach one combat discipline. Only one answer can be
// carried at a time; this is a build choice, not a permanent stat increase.
G.WORLD_MARK_DISCIPLINES = [
  { id: "sky", name: "Open Sky", style: "Dash", icon: "🪶", color: "#73eff7", effect: "Dashes travel 18% farther.", note: "Cross gaps, escape a field, or turn a dash art into an approach." },
  { id: "stone", name: "Patient Stone", style: "Melee", icon: "🪨", color: "#d8b06a", effect: "Melee sweeps gain 20° of arc.", note: "Hold a crowd in front of you and make each close strike count." },
  { id: "thread", name: "Silver Thread", style: "Projectile", icon: "🕸️", color: "#d9a7ff", effect: "Projectiles ricochet to one extra target.", note: "Angle a shot through clustered enemies and narrow roads." },
  { id: "echo", name: "Clear Echo", style: "Chain", icon: "🔔", color: "#b9ddf4", effect: "Chain arts jump 25% farther.", note: "Carry a note from one enemy to the next." },
  { id: "light", name: "Lantern Circle", style: "Area", icon: "🏮", color: "#ffcd75", effect: "Bursts and blast zones cover 18% more ground.", note: "Make room around you when a formation closes in." },
  { id: "heart", name: "Worldheart", style: "Melee + Area", icon: "🗿", color: "#f29c8d", effect: "Close and area arts push 22% harder.", note: "Move a dangerous foe before it can control the road." },
];

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
    attunedMark: null,
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
  const attuned = saved && saved.attunedMark;
  campaign.attunedMark = markIds.has(attuned) && campaign.marks.includes(attuned) ? attuned : null;
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

G.activeWorldMarkDiscipline = function () {
  const campaign = G.state && G.ensureWorldwake();
  return campaign && campaign.marks.includes(campaign.attunedMark)
    ? G.WORLD_MARK_DISCIPLINES.find((mark) => mark.id === campaign.attunedMark) || null : null;
};

G.attuneWorldMark = function (id) {
  if (!G.state) return false;
  const campaign = G.ensureWorldwake();
  if (id !== null && (!campaign.marks.includes(id) || !G.WORLD_MARK_DISCIPLINES.some((mark) => mark.id === id))) return false;
  if (campaign.attunedMark === id) return false;
  campaign.attunedMark = id;
  G.sfx.play("pickup");
  G.ui.toast(id ? `${G.WORLD_MARK_DISCIPLINES.find((mark) => mark.id === id).name} carried into battle.` : "World Mark discipline set aside.", 3);
  G.saveGame();
  return true;
};

G.worldwakePurified = function (mapId) {
  const region = G.worldwakeRegion(mapId);
  if (!region) return false;
  return Object.values(G.WORLDWAKE_MARKS).some((mark) => mark.region === mapId && G.hasWorldMark(mark.id));
};

G.travelToWorldwakeRegion = function (id) {
  const region = G.worldwakeRegion(id);
  const campaign = G.ensureWorldwake();
  if (!region || !campaign.discovered.includes(id) ||
      !G.wayfinderPostActivated || !G.wayfinderPostActivated(id) ||
      !G.canWayfinderTravel || !G.canWayfinderTravel()) return false;
  if (G.state.mapId === id) {
    G.ui.toast(`Already in ${region.name}.`, 2);
    return false;
  }
  G.world.load(id, region.spawn);
  G.sfx.play("door");
  G.spawnFx({ kind: "ring", x: G.state.player.x, y: G.state.player.y - 8, color: "#ffcd75", radius: 28, dur: 0.55 });
  G.ui.toast(`Wayfinder route: ${region.name}`, 2.5);
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
    const banter = WORLDWAKE_BANTER[data.map].replace(/^Pebble:\s*/, "");
    const discovery = `${region.icon} ${region.name} · ${campaign.discovered.length}/${G.WORLDWAKE_REGIONS.length}. ${banter}`;
    if (G.ui.dialogue) G.ui.dialogue("🪨 PEBBLE · NEW REGION", discovery, { accent: "#73eff7" });
    else G.ui.banner("WORLDWAKE REGION DISCOVERED", discovery);
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
    const awakening = mark.id === "sky"
      ? "Aurelia lowers her wings. The wind is a road again. Feather pennants beside Windscar's caravan camp and on the northern high road now carry you between them. Walk up and interact when both landings are clear."
      : mark.id === "stone"
        ? "The Old Mason lays his tools down. Stone steps rise through both western garden channels, joining the caravan side to the upper terraces and southern promenade. His roads will hold whenever you return."
        : mark.id === "thread"
          ? "Tess gathers her broken web and begins again. Woven passages now join Rootdeep's lower chambers across both root walls. Follow the pale crossing threads toward the eastern road; they will be here when you return."
        : mark.id === "echo"
          ? "Bongle rings one clear note across Frostbell. Resonant ice now bridges both southern lakes from shore to causeway. Follow the golden chimes through the water; the crossings will answer whenever you return."
        : mark.id === "light"
          ? "Mallow gathers the storm into one lantern. Every brass lamp along Stormspine's passes wakes, and two lit cuts open through the southern ridges. Follow their gold marks between the high road and lower trail whenever you return."
        : mark.id === "heart"
          ? "The Last Worldbearer gives the road back to everyone. A heartlit arch opens at Titan Grave's southern edge and answers another beside the Final Firmament in Greenfield. Walk through to return to the first horizon."
        : "The region changes, and a new World Path answers you.";
    const news = `${awakening} Its fighting lesson is ready in Form Lab / Marks.`;
    if (G.ui.dialogue) G.ui.dialogue(`${mark.icon} ${mark.name.toUpperCase()} AWAKENED`, news, { accent: mark.color || "#ffcd75" });
    else G.ui.banner(`${mark.icon} ${mark.name.toUpperCase()} AWAKENED`, news);
  }
  G.checkWorldwakeFavors(false);
});
