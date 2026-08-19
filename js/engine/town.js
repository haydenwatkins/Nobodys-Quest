/* ============================================================
   TOWN — an early home base that grows with the whole adventure.

   Claiming the first new form opens Sunrise Town. Every form can contribute;
   later systems such as incidents, rivals, and expeditions feed it directly.
   ============================================================ */

"use strict";

G.makeTown = function () {
  return {
    founded: false,
    name: "Sunrise Town",
    residents: 0,
    spirit: 0,
    festivals: 0,
    festivalUntil: 0,
    houses: [],
    introduced: false,
    deeds: 0,
    projects: {},
    sponsoredResidents: 0,
    beautifications: 0,
  };
};

G.TOWN_PROJECTS = [
  { id: "welcomeLodge", icon: "🛏️", name: "Welcome Lodge", cost: 12,
    text: "A warm first stop for new neighbours.", effect: "+6 resident capacity" },
  { id: "buildersYard", icon: "🪚", name: "Builders' Yard", cost: 20,
    text: "Shared tools make every future home easier.", effect: "House costs reduced 25%" },
  { id: "festivalStage", icon: "🎪", name: "Festival Stage", cost: 30,
    text: "A proper green for music, food, and dancing.", effect: "Festivals last twice as long and attract +1 resident" },
  { id: "lanternWalk", icon: "🏮", name: "Lantern Walk", cost: 42,
    text: "A glowing path through gardens planted together.", effect: "Permanent town lights and flowers" },
  { id: "hallOfForms", icon: "◇", name: "Hall of Forms", cost: 60,
    text: "Every shape Nobody has worn gets a place of honour.", effect: "+10 resident capacity and a town monument" },
];

G.normalizeTown = function (saved) {
  const town = Object.assign(G.makeTown(), saved || {});
  // Migrate the older cult-shaped save data if it exists.
  if (saved && saved.followers !== undefined) town.residents = saved.followers;
  if (saved && saved.faith !== undefined) town.spirit = saved.faith;
  if (saved && saved.sermons !== undefined) town.festivals = saved.sermons;
  if (!Array.isArray(town.houses)) town.houses = [];
  if (!town.projects || typeof town.projects !== "object" || Array.isArray(town.projects)) town.projects = {};
  town.introduced = !!(town.introduced || town.founded);
  town.deeds = Math.max(0, Number(town.deeds) || 0);
  town.sponsoredResidents = Math.max(0, Number(town.sponsoredResidents) || 0);
  town.beautifications = Math.max(0, Number(town.beautifications) || 0);
  town.festivalUntil = Number(town.festivalUntil) || 0;
  if (!town.name || town.name === "The Little Flock") town.name = "Sunrise Town";
  return town;
};

G.ensureTown = function () {
  if (!G.state.town) G.state.town = G.makeTown();
  return G.state.town;
};

G.townUnlocked = function () {
  if (!G.state) return false;
  const town = G.ensureTown();
  return !!(town.founded || (G.state.claimedForms || []).length >= 1 || G.state.stars >= 2);
};

G.checkTownIntroduction = function (quiet) {
  if (!G.townUnlocked()) return false;
  const town = G.ensureTown();
  if (town.introduced) return false;
  town.introduced = true;
  town.founded = true;
  town.residents = Math.max(town.residents, 2);
  town.spirit = Math.max(town.spirit, 12);
  if (!quiet) {
    G.sfx.play("unlock");
    G.ui.banner("☀️ SUNRISE TOWN", "A little home is waiting · 12 spirit · first house ready");
  }
  if (G.syncTownResidents) G.syncTownResidents();
  G.saveGame();
  return true;
};

G.foundTown = function (name) {
  if (!G.townUnlocked()) return false;
  const town = G.ensureTown();
  if (!town.founded) {
    town.founded = true;
    town.residents = Math.max(town.residents, 1);
    town.spirit = Math.max(town.spirit, 5);
  }
  town.name = (name || town.name || "Sunrise Town").trim().slice(0, 28) || "Sunrise Town";
  G.sfx.play("unlock");
  G.ui.banner("☀️ TOWN FOUNDED!", `${town.name} is your home now.`);
  if (G.syncTownResidents) G.syncTownResidents();
  G.saveGame();
  return true;
};

G.addTownReward = function (spirit, residents, reason, quiet) {
  const town = G.ensureTown();
  if (!town.founded) G.checkTownIntroduction(true);
  const gainedSpirit = Math.max(0, Math.round(spirit || 0));
  const room = Math.max(0, G.townCapacity() - town.residents);
  const gainedResidents = Math.min(room, Math.max(0, Math.round(residents || 0)));
  town.spirit += gainedSpirit;
  town.residents += gainedResidents;
  if (!quiet && (gainedSpirit || gainedResidents)) {
    const parts = [];
    if (gainedSpirit) parts.push(`+${gainedSpirit} town spirit`);
    if (gainedResidents) parts.push(`+${gainedResidents} resident${gainedResidents === 1 ? "" : "s"}`);
    G.ui.toast(`☀️ ${reason || "Town progress"}: ${parts.join(" · ")}`, 3);
  }
  if (G.syncTownResidents) G.syncTownResidents();
  G.saveGame();
  return { spirit: gainedSpirit, residents: gainedResidents };
};

G.renameTown = function (name) {
  const town = G.ensureTown();
  if (!town.founded) return;
  town.name = (name || town.name).trim().slice(0, 28) || town.name;
  G.saveGame();
};

G.townHouseCost = function () {
  const town = G.ensureTown();
  const base = 5 + town.houses.length * 3;
  return town.projects.buildersYard ? Math.max(3, Math.ceil(base * 0.75)) : base;
};

G.townProjectBuilt = function (id) {
  return !!G.ensureTown().projects[id];
};

G.townProjectCount = function () {
  return G.TOWN_PROJECTS.reduce((count, project) => count + (G.townProjectBuilt(project.id) ? 1 : 0), 0);
};

G.townHouseBuilt = function (plotId) {
  const town = G.ensureTown();
  return town.houses.includes(plotId);
};

G.townLevel = function () {
  const town = G.ensureTown();
  if (!town.founded) return 0;
  return 1 + Math.floor(town.houses.length / 2) + Math.floor(town.festivals / 3) +
    G.townProjectCount() + Math.floor(town.beautifications / 4);
};

G.townCapacity = function () {
  const town = G.ensureTown();
  if (!town.founded) return 0;
  return 4 + town.houses.length * 4 + G.townLevel() * 2 +
    (town.projects.welcomeLodge ? 6 : 0) + (town.projects.hallOfForms ? 10 : 0);
};

G.refreshTownDecorations = function () {
  if (G.state.mapId === "town" && G.makeTownDecorations)
    G.state.townDecorations = G.makeTownDecorations(G.state.grid, G.state.mapW, G.state.mapH);
};

G.buyTownProject = function (id) {
  const town = G.ensureTown();
  const project = G.TOWN_PROJECTS.find((entry) => entry.id === id);
  if (!town.founded || !project || town.projects[id]) return false;
  if (town.spirit < project.cost) {
    G.ui.toast(`${project.icon} Need ${project.cost} town spirit for ${project.name}.`);
    return false;
  }
  town.spirit -= project.cost;
  town.projects[id] = true;
  G.sfx.play("unlock");
  if (G.spawnFx && G.state.player)
    G.spawnFx({ kind: "ring", x: G.state.player.x, y: G.state.player.y - 8, color: "#ffcd75", radius: 24, dur: 0.6 });
  G.ui.banner(`${project.icon} ${project.name.toUpperCase()}`, project.effect);
  G.refreshTownDecorations();
  if (G.syncTownResidents) G.syncTownResidents();
  G.saveGame();
  return true;
};

G.townSponsorCost = function () {
  return 8 + Math.min(20, G.ensureTown().sponsoredResidents * 2);
};

G.sponsorTownResident = function () {
  const town = G.ensureTown();
  const cost = G.townSponsorCost();
  if (!town.founded) return false;
  if (town.residents >= G.townCapacity()) {
    G.ui.toast("🏠 Build more capacity before inviting another neighbour.", 2.5);
    return false;
  }
  if (town.spirit < cost) {
    G.ui.toast(`📨 Need ${cost} town spirit to sponsor a newcomer.`);
    return false;
  }
  town.spirit -= cost;
  town.residents += 1;
  town.sponsoredResidents += 1;
  G.sfx.play("quest");
  G.ui.toast(`📨 A new neighbour is moving to ${town.name}!`, 3);
  if (G.syncTownResidents) G.syncTownResidents();
  G.saveGame();
  return true;
};

G.TOWN_BEAUTIFICATION_LIMIT = 12;

G.townBeautificationCost = function () {
  return 8 + G.ensureTown().beautifications * 3;
};

G.beautifyTown = function () {
  const town = G.ensureTown();
  if (!town.founded || town.beautifications >= G.TOWN_BEAUTIFICATION_LIMIT) return false;
  const cost = G.townBeautificationCost();
  if (town.spirit < cost) {
    G.ui.toast(`🌷 Need ${cost} town spirit for the next town improvement.`);
    return false;
  }
  town.spirit -= cost;
  town.beautifications += 1;
  G.sfx.play("pickup");
  G.ui.toast(`🌷 Town improvement ${town.beautifications}/${G.TOWN_BEAUTIFICATION_LIMIT} complete!`, 3);
  G.refreshTownDecorations();
  G.saveGame();
  return true;
};

G.hostTownFeast = function () {
  const town = G.ensureTown();
  const cost = 5;
  if (!town.founded || G.state.mapId !== "town") {
    G.ui.toast("🍲 Town feasts are served at home, away from battle.", 2.5);
    return false;
  }
  const player = G.state.player;
  const needsRest = player.damageTaken > 0 || player.mana < G.playerMaxMana();
  if (!needsRest) {
    G.ui.toast("🍲 You're already ready for the road.", 2);
    return false;
  }
  if (town.spirit < cost) {
    G.ui.toast(`🍲 Need ${cost} town spirit to host a feast.`);
    return false;
  }
  town.spirit -= cost;
  player.damageTaken = 0;
  player.mana = G.playerMaxMana();
  player.manaRegenDelay = 0;
  G.sfx.play("mana");
  G.ui.toast("🍲 The whole town shared a table. Hearts and mana restored!", 3);
  G.saveGame();
  return true;
};

G.tryBuildTownHouse = function (plotId) {
  const town = G.ensureTown();
  if (!town.founded || town.houses.includes(plotId)) return;
  const cost = G.townHouseCost();
  if (town.spirit < cost) {
    G.ui.toast(`🏠 Need ${cost} town spirit to build here.`);
    return;
  }
  town.spirit -= cost;
  town.houses.push(plotId);
  town.residents = Math.min(G.townCapacity(), Math.max(town.residents, town.houses.length + 1));
  G.sfx.play("unlock");
  G.spawnFx({ kind: "ring", x: G.state.player.x, y: G.state.player.y - 8, color: "#ffcd75", dur: 0.55 });
  G.ui.toast(`🏠 Built a house! ${town.houses.length} total`);
  if (G.syncTownResidents) G.syncTownResidents();
  G.refreshTownDecorations();
  G.saveGame();
};

G.townFestivalActive = function (now) {
  const town = G.ensureTown();
  return !!town.founded && town.festivalUntil > (now === undefined ? Date.now() : now);
};

G.townFestivalCost = function () {
  const town = G.ensureTown();
  return 8 + Math.min(18, town.festivals * 2) + Math.floor(town.residents / 4);
};

G.townFestivalMinutes = function () {
  let minutes = G.townProjectBuilt("festivalStage") ? 10 : 5;
  if ((G.state.items || []).includes("sunrise-banner")) minutes *= 2;
  return minutes;
};

G.holdTownFestival = function () {
  const town = G.ensureTown();
  if (!town.founded) return false;
  if (G.townFestivalActive()) {
    G.ui.toast(`${town.name} is already celebrating.`, 2.5);
    return false;
  }
  const cost = G.townFestivalCost();
  if (town.spirit < cost) {
    G.ui.toast(`🎉 Need ${cost} town spirit to hold the next festival.`);
    return false;
  }
  town.spirit -= cost;
  town.festivals += 1;
  const room = Math.max(0, G.townCapacity() - town.residents);
  const welcomed = Math.min(room, G.townProjectBuilt("festivalStage") ? 2 : 1);
  town.residents += welcomed;
  const minutes = G.townFestivalMinutes();
  town.festivalUntil = Date.now() + minutes * 60 * 1000;
  G.sfx.play("quest");
  G.ui.toast(`🎉 Festival held! ${minutes} minutes of celebration${welcomed ? ` · +${welcomed} resident${welcomed === 1 ? "" : "s"}` : ""}.`, 3.5);
  if (G.celebrateTown) G.celebrateTown();
  if (G.syncTownResidents) G.syncTownResidents();
  G.saveGame();
  return true;
};

G.events.on("kill", (data) => {
  if (!G.state) return;
  G.checkTownIntroduction(false);
  if (!G.townUnlocked()) return;
  const town = G.ensureTown();
  if (!town.founded || (data.enemy && G.enemies[data.enemy] && G.enemies[data.enemy].miniboss)) return;
  town.deeds += 1;
  if (town.deeds % 5 !== 0) return;
  const newResident = town.deeds % 10 === 0 && town.residents < G.townCapacity() ? 1 : 0;
  G.addTownReward(2, newResident, newResident ? "Your adventures attract a neighbour" : "Five good deeds");
});

G.events.on("wardBreak", () => {
  if (!G.state) return;
  G.checkTownIntroduction(false);
  if (!G.townUnlocked()) return;
  const town = G.ensureTown();
  if (!town.founded) return;
  town.spirit += 1;
  G.saveGame();
});

G.events.on("formUnlock", (data) => {
  const alreadyFounded = G.ensureTown().founded;
  const introduced = G.checkTownIntroduction(false);
  if (introduced) G.ui.toast("☀️ Town tab unlocked — your first house is affordable now!", 4);
  else if (alreadyFounded) G.addTownReward(3, 1, `${G.forms[data.form].name} joins the town story`);
});
