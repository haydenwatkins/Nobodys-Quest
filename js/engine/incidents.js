/* ============================================================
   LIVING ATLAS INCIDENTS — rotating, action-driven world events.

   Incidents never expire on a clock. They point back into discovered regions,
   scale gently with progress, and turn ordinary play into town growth.
   ============================================================ */

"use strict";

const INCIDENT_TYPES = ["infestation", "arsenal", "manyFaces", "wardStorm"];

G.makeIncidents = function () {
  return { unlocked: false, sequence: 0, completed: 0, active: [] };
};

G.normalizeIncidents = function (saved) {
  const state = Object.assign(G.makeIncidents(), saved || {});
  state.unlocked = !!state.unlocked;
  state.sequence = Math.max(0, Number(state.sequence) || 0);
  state.completed = Math.max(0, Number(state.completed) || 0);
  state.active = Array.isArray(state.active) ? state.active.filter((incident) =>
    incident && incident.id && G.maps[incident.mapId] &&
    INCIDENT_TYPES.concat("rivalTrail").includes(incident.type)) : [];
  for (const incident of state.active) {
    incident.count = Math.max(0, Number(incident.count) || 0);
    incident.seen = Array.isArray(incident.seen) ? incident.seen : [];
  }
  return state;
};

G.ensureIncidents = function () {
  if (!G.state.incidents) G.state.incidents = G.makeIncidents();
  return G.state.incidents;
};

G.incidentsUnlocked = function () {
  return !!(G.state && G.townUnlocked && G.townUnlocked());
};

function discoveredIncidentMaps() {
  const found = new Set(["overworld"]);
  if (G.ensureWayfinder) for (const id of G.ensureWayfinder().discovered || []) found.add(id);
  if (G.ensureWorldwake) for (const id of G.ensureWorldwake().discovered || []) found.add(id);
  return Array.from(found).filter((id) => {
    const map = G.maps[id];
    return map && id !== "town" && id !== "playerHouse" && !(map.bossTrial && !map.bossTrial.worldBoss);
  });
}

function incidentDefinition(type, mapId, sequence) {
  const stars = (G.state && G.state.stars) || 0;
  const unlockedForms = G.unlockedForms ? G.unlockedForms().length : 1;
  const mapName = G.maps[mapId] ? G.maps[mapId].name : mapId;
  const common = { id: `incident-${sequence}`, type, mapId, count: 0, seen: [] };
  if (type === "infestation") return Object.assign(common, {
    icon: "⚔", name: "Creature Surge", goal: 4 + Math.min(4, Math.floor(stars / 6)),
    text: `Calm the creature surge in ${mapName}.`, event: "kill",
  });
  if (type === "arsenal") return Object.assign(common, {
    icon: "🧰", name: "Field Test", goal: Math.min(5, Math.max(3, unlockedForms + 1)),
    text: `Use different abilities while helping ${mapName}.`, event: "abilityUse", unique: true,
  });
  if (type === "manyFaces") return Object.assign(common, {
    icon: "🎭", name: "Many Hands", goal: Math.min(4, Math.max(2, unlockedForms)),
    text: `Use different forms in ${mapName}.`, event: "swap", unique: true,
  });
  if (type === "wardStorm") return Object.assign(common, {
    icon: "💥", name: "Ward Storm", goal: stars >= 10 ? 3 : 2,
    text: `Break unstable wards in ${mapName}.`, event: "wardBreak",
  });
  return Object.assign(common, {
    icon: "★", name: "Rival Trail", goal: 1,
    text: `Your Rival has been sighted in ${mapName}.`, event: "kill",
  });
}

function mapSupportsWardIncident(mapId) {
  const map = G.maps[mapId];
  if (!map || !map.legend) return false;
  const used = new Set((map.tiles || []).join(""));
  return Object.entries(map.legend).some(([symbol, cell]) => {
    const enemy = cell && cell.enemy && G.enemies[cell.enemy];
    return used.has(symbol) && enemy && enemy.ward && !enemy.miniboss;
  });
}

function nextIncident(state) {
  const maps = discoveredIncidentMaps();
  if (!maps.length) return null;
  const rival = G.activeRival && G.activeRival();
  const useRival = rival && !rival.resolved && !state.active.some((incident) => incident.type === "rivalTrail") &&
    state.sequence % 4 === 3;
  const typePool = INCIDENT_TYPES.filter((type) => type !== "wardStorm" || G.state.stars >= 4);
  let type = useRival ? "rivalTrail" : typePool[state.sequence % typePool.length];
  let eligibleMaps = type === "wardStorm" ? maps.filter(mapSupportsWardIncident) : maps;
  if (!eligibleMaps.length) {
    type = "infestation";
    eligibleMaps = maps;
  }
  const occupied = new Set(state.active.map((incident) => incident.mapId));
  let mapId = useRival && rival.region && eligibleMaps.includes(rival.region)
    ? rival.region : eligibleMaps[state.sequence % eligibleMaps.length];
  for (let offset = 0; offset < eligibleMaps.length && occupied.has(mapId); offset++)
    mapId = eligibleMaps[(state.sequence + offset + 1) % eligibleMaps.length];
  state.sequence += 1;
  if (useRival && G.assignRivalRegion) G.assignRivalRegion(mapId);
  return incidentDefinition(type, mapId, state.sequence);
}

G.refreshIncidents = function (quiet) {
  if (!G.incidentsUnlocked()) return false;
  const state = G.ensureIncidents();
  const firstUnlock = !state.unlocked;
  state.unlocked = true;
  let changed = firstUnlock;
  while (state.active.length < 3) {
    const incident = nextIncident(state);
    if (!incident) break;
    state.active.push(incident);
    changed = true;
  }
  if (firstUnlock && !quiet) G.ui.banner("⚑ LIVING ATLAS", "Three nearby situations have appeared on the world map.");
  if (changed) G.saveGame();
  return changed;
};

G.incidentsForMap = function (mapId) {
  return G.ensureIncidents().active.filter((incident) => incident.mapId === mapId);
};

G.incidentProgressLabel = function (incident) {
  const progress = incident.unique ? incident.seen.length : incident.count;
  return `${Math.min(progress, incident.goal)}/${incident.goal}`;
};

function finishIncident(incident) {
  const state = G.ensureIncidents();
  state.active = state.active.filter((entry) => entry.id !== incident.id);
  state.completed += 1;
  const spirit = 5 + Math.min(5, Math.floor(state.completed / 2));
  const resident = state.completed % 2 === 0 ? 1 : 0;
  if (state.completed % 3 === 0) G.state.stars += 1;
  G.sfx.play("quest");
  G.ui.banner(`⚑ ${incident.name.toUpperCase()} RESOLVED`,
    `+${spirit} town spirit${resident ? " · +1 resident" : ""}${state.completed % 3 === 0 ? " · +1 ⭐" : ""}`);
  if (G.addTownReward) G.addTownReward(spirit, resident, incident.name, true);
  G.events.emit("incidentComplete", { type: incident.type, map: incident.mapId });
  G.refreshIncidents(true);
  G.saveGame();
}

function trackIncident(event, data) {
  if (!G.state || !G.incidentsUnlocked()) return;
  G.refreshIncidents(true);
  for (const incident of G.ensureIncidents().active.slice()) {
    if (incident.event !== event || incident.mapId !== G.state.mapId) continue;
    if (incident.type === "infestation" && data.enemy && G.enemies[data.enemy] && G.enemies[data.enemy].miniboss) continue;
    if (incident.type === "rivalTrail" && !data.rival) continue;
    if (incident.unique) {
      const value = event === "swap" ? data.form : data.ability;
      if (value && !incident.seen.includes(value)) incident.seen.push(value);
    } else {
      incident.count += 1;
    }
    const progress = incident.unique ? incident.seen.length : incident.count;
    if (progress >= incident.goal) finishIncident(incident);
    else if (progress === 1 || progress === incident.goal - 1)
      G.ui.toast(`${incident.icon} ${incident.name}: ${G.incidentProgressLabel(incident)}`, 2);
  }
}

for (const event of ["kill", "abilityUse", "swap", "wardBreak"])
  G.events.on(event, (data) => trackIncident(event, data));

G.events.on("mapEnter", (data) => {
  if (!G.incidentsUnlocked()) return;
  G.refreshIncidents(true);
  const here = G.incidentsForMap(data.map);
  if (here.length) G.ui.toast(`⚑ ${here.map((incident) => incident.name).join(" · ")}`, 2.8);
});
