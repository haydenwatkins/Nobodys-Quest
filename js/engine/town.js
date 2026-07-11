/* ============================================================
   TOWN - a post-God-unlock home base.

   Once the God form is unlocked, the player can found a town
   from the pause menu. Defeating enemies as God attracts residents.
   ============================================================ */

"use strict";

G.makeTown = function () {
  return {
    founded: false,
    name: "Sunrise Town",
    residents: 0,
    spirit: 0,
    festivals: 0,
    houses: [],
  };
};

G.normalizeTown = function (saved) {
  const town = Object.assign(G.makeTown(), saved || {});
  // Migrate the older cult-shaped save data if it exists.
  if (saved && saved.followers !== undefined) town.residents = saved.followers;
  if (saved && saved.faith !== undefined) town.spirit = saved.faith;
  if (saved && saved.sermons !== undefined) town.festivals = saved.sermons;
  if (!Array.isArray(town.houses)) town.houses = [];
  if (!town.name || town.name === "The Little Flock") town.name = "Sunrise Town";
  return town;
};

G.ensureTown = function () {
  if (!G.state.town) G.state.town = G.makeTown();
  return G.state.town;
};

G.townUnlocked = function () {
  return !!(G.forms.god && G.formUnlocked("god"));
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
  G.saveGame();
  return true;
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
  G.saveGame();
};

G.holdTownFestival = function () {
  const town = G.ensureTown();
  if (!town.founded) return;
  town.festivals += 1;
  town.spirit += Math.max(1, town.residents);
  G.sfx.play("quest");
  G.ui.toast(`🎉 Festival held! +${Math.max(1, town.residents)} town spirit`);
  G.saveGame();
};

G.events.on("kill", () => {
  if (!G.state || !G.townUnlocked()) return;
  const town = G.ensureTown();
  if (!town.founded || G.state.formId !== "god") return;
  const capacity = G.townCapacity();
  const addedResident = town.residents < capacity;
  if (addedResident) town.residents += 1;
  town.spirit += 2;
  if (addedResident && (town.residents <= 5 || town.residents % 5 === 0)) {
    G.ui.toast(`🏠 A resident moves to ${town.name}! ${town.residents} total`);
  } else if (!addedResident) {
    G.ui.toast(`${town.name} is full. Build houses to welcome more residents.`, 2.5);
  }
  G.saveGame();
});

G.events.on("wardBreak", () => {
  if (!G.state || !G.townUnlocked()) return;
  const town = G.ensureTown();
  if (!town.founded || G.state.formId !== "god") return;
  town.spirit += 1;
  G.saveGame();
});

G.events.on("formUnlock", (data) => {
  if (data.form === "god") {
    G.ui.toast("☀️ Town tab unlocked in the menu!", 4);
  }
});
