/* ============================================================
   COSTUME WARDROBE — cosmetic progression for every form.

   Costumes remap a form's existing pixel palette and add a tiny accessory.
   They never change combat stats, and new forms inherit every costume
   automatically because the wardrobe dresses the sprite at draw time.
   ============================================================ */

"use strict";

const COSTUME_NEUTRAL = {
  "#f4f4f4": "#fff3c2",
  "#94b0c2": "#d8b06a",
  "#566c86": "#6b4a2b",
  "#38b764": "#a7f070",
  "#41a6f6": "#73eff7",
  "#ef7d57": "#ffcd75",
};

G.COSTUMES = [
  {
    id: "classic", icon: "✨", name: "Classic", tagline: "The original colors of every form.",
    hint: "Available from the beginning.", swatches: ["#f4f4f4", "#94b0c2", "#566c86"],
  },
  {
    id: "trailblazer", icon: "🧣", name: "Trailblazer", tagline: "Road-worn gold with a sky-blue scarf.",
    hint: "Discover 2 major regions.", accessory: "scarf", accent: "#73eff7",
    palette: COSTUME_NEUTRAL, swatches: ["#fff3c2", "#d8b06a", "#73eff7"],
    condition: () => G.wayfinderProgress && G.wayfinderProgress().found >= 2,
  },
  {
    id: "moonberry", icon: "🫐", name: "Moonberry", tagline: "A berry-bright look from the whispering woods.",
    hint: "Find the Whispering Seed.", accessory: "berries", accent: "#f4a6ff",
    palette: {
      "#f4f4f4": "#e8d7ff", "#94b0c2": "#a884d8", "#566c86": "#5d275d",
      "#38b764": "#8153c1", "#41a6f6": "#73eff7", "#ef7d57": "#b13e53", "#ffcd75": "#f4a6ff",
    },
    swatches: ["#e8d7ff", "#8153c1", "#f4a6ff"],
    condition: () => !!(G.state && (G.state.items || []).includes("whispering-seed")),
  },
  {
    id: "mirecloak", icon: "🍃", name: "Mirecloak", tagline: "Moss, lily, and deep-water colors.",
    hint: "Discover the Sunken Marsh.", accessory: "leaf", accent: "#a7f070",
    palette: {
      "#f4f4f4": "#d8e6c3", "#94b0c2": "#7f9b65", "#566c86": "#3c6255",
      "#38b764": "#a7f070", "#41a6f6": "#257179", "#ef7d57": "#c6d66a", "#ffcd75": "#d8e6c3",
    },
    swatches: ["#d8e6c3", "#7f9b65", "#257179"],
    condition: () => G.wayfinderDiscovered && G.wayfinderDiscovered("sunkenMarsh"),
  },
  {
    id: "emberguard", icon: "🔥", name: "Emberguard", tagline: "Coal-dark armor with a living ember trim.",
    hint: "Discover Ember Ridge.", accessory: "ember", accent: "#ffcd75",
    palette: {
      "#f4f4f4": "#ffe0b0", "#94b0c2": "#c45d4f", "#566c86": "#6b2d2d",
      "#38b764": "#ef7d57", "#41a6f6": "#ff9d57", "#ef7d57": "#ffcd75", "#8153c1": "#b13e53",
    },
    swatches: ["#ffe0b0", "#ef7d57", "#6b2d2d"],
    condition: () => G.wayfinderDiscovered && G.wayfinderDiscovered("emberRidge"),
  },
  {
    id: "starstrider", icon: "☄️", name: "Starstrider", tagline: "Midnight blue crossed by orbiting starlight.",
    hint: "Find the Fallen Star Thread in Starfall Ruins.", accessory: "stars", accent: "#73eff7",
    palette: {
      "#f4f4f4": "#f4f4f4", "#94b0c2": "#73eff7", "#566c86": "#3b5dc9",
      "#38b764": "#41a6f6", "#41a6f6": "#73eff7", "#ef7d57": "#8153c1", "#ffcd75": "#fff3c2",
    },
    swatches: ["#f4f4f4", "#73eff7", "#3b5dc9"],
    condition: () => !!(G.state && (
      (G.state.items || []).includes("starfall-thread") ||
      // Before the Thread existed this vault held only a healing cookie.
      // Honor that already-opened chest so an older save is never stranded.
      (G.state.opened || []).includes("starfallRuins:6,4")
    )),
  },
  {
    id: "tidewalker", icon: "🌊", name: "Tidewalker", tagline: "Sea-glass colors and a trail of bright foam.",
    hint: "Discover Shattercoast.", accessory: "foam", accent: "#dff6f5",
    palette: {
      "#f4f4f4": "#dff6f5", "#94b0c2": "#73eff7", "#566c86": "#257179",
      "#38b764": "#38b764", "#41a6f6": "#41a6f6", "#ef7d57": "#73eff7", "#ffcd75": "#a7f070",
    },
    swatches: ["#dff6f5", "#73eff7", "#257179"],
    condition: () => G.wayfinderDiscovered && G.wayfinderDiscovered("shattercoast"),
  },
  {
    id: "guardian", icon: "🏅", name: "Guardian Gold", tagline: "A champion's finish earned from the great guardians.",
    hint: "Collect 3 different miniboss trophies.", accessory: "medal", accent: "#ffcd75",
    palette: {
      "#f4f4f4": "#fff3c2", "#94b0c2": "#ffcd75", "#566c86": "#6b4a2b",
      "#38b764": "#ef7d57", "#41a6f6": "#ffcd75", "#ef7d57": "#b13e53", "#8153c1": "#c45d4f",
    },
    swatches: ["#fff3c2", "#ffcd75", "#b13e53"],
    condition: () => G.guardianCollectionProgress && G.guardianCollectionProgress().found >= 3,
  },
  {
    id: "manyfold", icon: "👑", name: "Manyfold Royal", tagline: "A prismatic victory look for a complete gauntlet.",
    hint: "Defeat every guardian in one gauntlet.", accessory: "prism", accent: "#ffcd75",
    palette: {
      "#f4f4f4": "#fff3c2", "#94b0c2": "#73eff7", "#566c86": "#8153c1",
      "#38b764": "#a7f070", "#41a6f6": "#73eff7", "#ef7d57": "#ef7d57", "#ffcd75": "#ffcd75",
    },
    swatches: ["#ffcd75", "#73eff7", "#8153c1"],
    condition: () => !!(G.state && (G.state.items || []).includes("manyfold-crown")),
  },
];

G.costumeById = function (id) {
  return G.COSTUMES.find((costume) => costume.id === id) || G.COSTUMES[0];
};

G.normalizeCostumes = function (unlocked, selected) {
  const valid = new Set(G.COSTUMES.map((costume) => costume.id));
  const owned = Array.isArray(unlocked) ? Array.from(new Set(unlocked.filter((id) => valid.has(id)))) : [];
  if (!owned.includes("classic")) owned.unshift("classic");
  return { unlocked: owned, selected: owned.includes(selected) ? selected : "classic" };
};

G.ensureCostumes = function () {
  const normalized = G.normalizeCostumes(G.state.costumesUnlocked, G.state.costumeId);
  G.state.costumesUnlocked = normalized.unlocked;
  G.state.costumeId = normalized.selected;
  return normalized;
};

G.costumeUnlocked = function (id) {
  return !!(G.state && G.ensureCostumes().unlocked.includes(id));
};

G.selectCostume = function (id) {
  if (!G.costumeUnlocked(id) || G.state.costumeId === id) return false;
  G.state.costumeId = id;
  const costume = G.costumeById(id);
  if (G.sfx) G.sfx.play("pickup");
  if (G.ui) G.ui.toast(`${costume.icon} Wearing ${costume.name}`, 2.2);
  G.saveGame();
  return true;
};

G.checkCostumeUnlocks = function (quiet) {
  if (!G.state) return [];
  const wardrobe = G.ensureCostumes();
  const unlocked = [];
  for (const costume of G.COSTUMES) {
    if (!costume.condition || wardrobe.unlocked.includes(costume.id)) continue;
    if (costume.condition()) {
      wardrobe.unlocked.push(costume.id);
      unlocked.push(costume);
    }
  }
  if (!unlocked.length) return unlocked;
  if (!quiet && G.ui) {
    if (G.sfx) G.sfx.play("unlock");
    G.state.shake = Math.max(G.state.shake || 0, 0.2);
    const names = unlocked.map((costume) => `${costume.icon} ${costume.name}`).join(" · ");
    G.ui.banner(unlocked.length > 1 ? "🧵 WARDROBE EXPANDED" : "🧵 COSTUME UNLOCKED", names);
  }
  G.saveGame();
  return unlocked;
};

// Main leaves this true while it reconstructs an older save. Unlocks inferred
// during the first map load are awarded silently, then future discoveries get
// the full banner.
G.costumeBooting = true;
for (const event of ["mapEnter", "pickup", "questDone", "formUnlock"]) {
  G.events.on(event, () => G.checkCostumeUnlocks(G.costumeBooting));
}

const costumeSpriteCache = new WeakMap();

G.costumedSprite = function (sprite) {
  if (!sprite || !G.state || !G.state.costumeId || G.state.costumeId === "classic") return sprite;
  const costume = G.costumeById(G.state.costumeId);
  if (!costume.palette) return sprite;
  let variants = costumeSpriteCache.get(sprite);
  if (!variants) {
    variants = new Map();
    costumeSpriteCache.set(sprite, variants);
  }
  if (variants.has(costume.id)) return variants.get(costume.id);
  const palette = {};
  for (const [key, color] of Object.entries(sprite.palette || {})) {
    palette[key] = costume.palette[String(color).toLowerCase()] || color;
  }
  const variant = { palette, frames: sprite.frames };
  variants.set(costume.id, variant);
  return variant;
};

G.drawCostumeAccessory = function (ctx, p, form, drawX, drawY) {
  if (!G.state || G.state.costumeId === "classic") return;
  const costume = G.costumeById(G.state.costumeId);
  if (!costume.accessory || !form || !form.sprite || !form.sprite.frames.length) return;
  const rows = form.sprite.frames[0];
  const height = rows.length;
  const width = rows.reduce((best, row) => Math.max(best, row.length), 1);
  const left = Math.round(drawX - width / 2);
  const top = Math.round(drawY - height);
  const mid = top + Math.max(3, Math.floor(height * 0.48));
  const facing = p.dir.x < 0 ? -1 : 1;
  const t = (G.state.time || 0);
  ctx.save();
  ctx.fillStyle = costume.accent || "#ffcd75";
  if (costume.accessory === "scarf") {
    const tail = left + (facing > 0 ? -3 : width + 1);
    ctx.fillRect(tail, mid, 4, 2);
    ctx.fillRect(tail - facing * 2, mid + 2 + Math.round(Math.sin(t * 8)), 3, 2);
  } else if (costume.accessory === "berries") {
    ctx.fillRect(Math.round(drawX - 4), top, 2, 2);
    ctx.fillRect(Math.round(drawX + 2), top + 1, 2, 2);
    ctx.fillStyle = "#a7f070";
    ctx.fillRect(Math.round(drawX - 1), top - 1, 2, 2);
  } else if (costume.accessory === "leaf") {
    ctx.fillRect(Math.round(drawX - 1), top - 2, 3, 2);
    ctx.fillRect(Math.round(drawX + 1), top - 3, 3, 2);
  } else if (costume.accessory === "ember") {
    ctx.fillRect(left - 2, Math.round(drawY - 3 - (t * 4) % 4), 2, 2);
    ctx.fillStyle = "#ef7d57";
    ctx.fillRect(left + width + 1, Math.round(drawY - 6 - (t * 5) % 5), 2, 2);
  } else if (costume.accessory === "stars") {
    const orbitX = Math.round(Math.cos(t * 3) * (width / 2 + 4));
    const orbitY = Math.round(Math.sin(t * 3) * 4);
    ctx.fillRect(Math.round(drawX + orbitX), mid + orbitY, 2, 2);
    ctx.fillStyle = "#fff3c2";
    ctx.fillRect(Math.round(drawX - orbitX), mid - orbitY, 1, 1);
  } else if (costume.accessory === "foam") {
    const step = Math.round((t * 12) % 5);
    ctx.fillRect(left - 2 - step, Math.round(drawY - 2), 3, 2);
    ctx.fillRect(left + width + 1 + step, Math.round(drawY - 1), 2, 1);
  } else if (costume.accessory === "medal") {
    ctx.fillStyle = "#b13e53";
    ctx.fillRect(Math.round(drawX - 1), mid, 3, 3);
    ctx.fillStyle = "#ffcd75";
    ctx.fillRect(Math.round(drawX), mid + 1, 1, 1);
  } else if (costume.accessory === "prism") {
    const colors = ["#ffcd75", "#73eff7", "#a7f070", "#ef7d57"];
    for (let i = 0; i < colors.length; i++) {
      const angle = t * 2.4 + i * Math.PI / 2;
      ctx.fillStyle = colors[i];
      ctx.fillRect(Math.round(drawX + Math.cos(angle) * (width / 2 + 4)), Math.round(mid + Math.sin(angle) * 5), 2, 2);
    }
  }
  ctx.restore();
};
