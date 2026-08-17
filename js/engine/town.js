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
  };
};

G.normalizeTown = function (saved) {
  const town = Object.assign(G.makeTown(), saved || {});
  // Migrate the older cult-shaped save data if it exists.
  if (saved && saved.followers !== undefined) town.residents = saved.followers;
  if (saved && saved.faith !== undefined) town.spirit = saved.faith;
  if (saved && saved.sermons !== undefined) town.festivals = saved.sermons;
  if (!Array.isArray(town.houses)) town.houses = [];
  town.introduced = !!(town.introduced || town.founded);
  town.deeds = Math.max(0, Number(town.deeds) || 0);
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
  return 5 + town.houses.length * 3;
};

G.townHouseBuilt = function (plotId) {
  const town = G.ensureTown();
  return town.houses.includes(plotId);
};

G.townLevel = function () {
  const town = G.ensureTown();
  if (!town.founded) return 0;
  return 1 + Math.floor(town.houses.length / 2) + Math.floor(town.festivals / 3);
};

G.townCapacity = function () {
  const town = G.ensureTown();
  if (!town.founded) return 0;
  return 4 + town.houses.length * 4 + G.townLevel() * 2;
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
  if (G.state.mapId === "town" && G.makeTownDecorations)
    G.state.townDecorations = G.makeTownDecorations(G.state.grid, G.state.mapW, G.state.mapH);
  G.saveGame();
};

G.townFestivalActive = function (now) {
  const town = G.ensureTown();
  return !!town.founded && town.festivalUntil > (now === undefined ? Date.now() : now);
};

G.holdTownFestival = function () {
  const town = G.ensureTown();
  if (!town.founded) return false;
  if (G.townFestivalActive()) {
    G.ui.toast(`${town.name} is already celebrating.`, 2.5);
    return false;
  }
  town.festivals += 1;
  const multiplier = (G.state.items || []).includes("sunrise-banner") ? 2 : 1;
  const earned = Math.max(1, town.residents) * multiplier;
  town.spirit += earned;
  town.festivalUntil = Date.now() + 5 * 60 * 1000;
  G.sfx.play("quest");
  G.ui.toast(`🎉 Festival held! ${town.name} will celebrate for five minutes. +${earned} town spirit${multiplier > 1 ? " · Banner bonus!" : ""}`);
  if (G.celebrateTown) G.celebrateTown();
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
