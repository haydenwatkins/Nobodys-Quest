/* ============================================================
   APPEARANCE SYSTEM — dyes plus form-specific signature skins.

   Legacy costumes remain as global dyes so old saves stay intact. Signature
   skins rebuild the actual text-art frames with a new silhouette, palette,
   and effect. Neither system changes combat stats.
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
  {
    id: "worldwalker", icon: "🌍", name: "Worldwalker", tagline: "Sunlit cloth and horizon-blue trim from the roaming caravan.",
    hint: "Complete The Whole Horizon caravan favor.", accessory: "scarf", accent: "#73eff7",
    palette: {
      "#f4f4f4": "#fff3c2", "#94b0c2": "#d8b06a", "#566c86": "#6b4a2b",
      "#38b764": "#a7f070", "#41a6f6": "#73eff7", "#ef7d57": "#ffcd75", "#8153c1": "#3b5dc9",
    },
    swatches: ["#fff3c2", "#d8b06a", "#73eff7"],
    condition: () => !!(G.state && (G.state.items || []).includes("worldwake-cloak")),
  },
  {
    id: "worldheart", icon: "🗿", name: "Worldheart", tagline: "Ancient stone, warm embers, and six tiny orbiting lights.",
    hint: "Complete A World at Peace caravan favor.", accessory: "stars", accent: "#ef7d57",
    palette: {
      "#f4f4f4": "#d8b06a", "#94b0c2": "#8a7f68", "#566c86": "#4b4541",
      "#38b764": "#ef7d57", "#41a6f6": "#ffcd75", "#ef7d57": "#b13e53", "#8153c1": "#6b4a2b",
    },
    swatches: ["#d8b06a", "#ef7d57", "#4b4541"],
    condition: () => !!(G.state && (G.state.items || []).includes("worldwake-crown")),
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
  if (sprite.hd && G.makeHdSprite2x) variant.hd = G.makeHdSprite2x(variant, {
    accent: costume.accent || "#73eff7", motif: sprite.hd.hdMotif || "detail", animate: true,
  });
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

/* ---------- Signature skins ----------
   Every form owns one authored alternate identity. These are deliberately
   more than palette swaps: the motif builder adds hats, horns, capes,
   branches, machinery, or orbiting shapes directly to every animation frame.
   Level 3 is the mastery threshold: two form quests is meaningful, while the
   reward still arrives early enough to enjoy through the rest of the game. */

G.FORM_SKINS = [
  ["nobody", "cardboardHero", "📦", "Cardboard Hero", "A box-built champion with a heroic red cape.", "boxhero", ["#7b4f2c", "#c58b55", "#f2c879", "#ef5b5b"], "paper"],
  ["rat", "sewerKing", "👑", "Sewer King", "A bottle-cap crown and royal scrap-cloak.", "crowncape", ["#352746", "#72506f", "#c9957a", "#ffd166"], "spark"],
  ["knight", "hollowBlackguard", "🛡️", "Hollow Blackguard", "A horned helm wrapped in a void-black mantle.", "horncape", ["#11131f", "#323852", "#70799a", "#a779e9"], "void"],
  ["ranger", "mossStalker", "🍃", "Moss Stalker", "A deep hood, leaf mantle, and living bow-string.", "hoodleaf", ["#173b32", "#2f6b4f", "#8fbd62", "#d7ef8a"], "leaf"],
  ["wizard", "starSage", "🌠", "Star Sage", "A towering night-sky hat with a comet brim.", "starhat", ["#1b234a", "#394c98", "#94bfff", "#fff0a8"], "orbit"],
  ["frog", "poisonPrince", "🪷", "Poison Prince", "A lily crown and bright warning-color mantle.", "lilycrown", ["#17463d", "#2c8f5b", "#8be04e", "#f15bb5"], "bubble"],
  ["alchemist", "brassBrewer", "⚗️", "Brass Brewer", "Goggles, copper tanks, and a bubbling shoulder flask.", "goggles", ["#49311f", "#a46434", "#e0b35a", "#73eff7"], "bubble"],
  ["stormcaller", "thunderIdol", "⚡", "Thunder Idol", "A lightning crown built to hold a living storm.", "thundercrown", ["#25214a", "#594da8", "#b9abff", "#fff36b"], "lightning"],
  ["dragon", "frostbone", "❄️", "Frostbone", "Ice antlers and ancient pale-blue armor plates.", "icehorns", ["#193448", "#356c88", "#b9e7ef", "#ffffff"], "snow"],
  ["riftblade", "neonRonin", "🌈", "Neon Ronin", "A razor hat and impossible magenta afterimage.", "ronin", ["#17152d", "#38306b", "#56d6d2", "#ff4fd8"], "afterimage"],
  ["mole", "drillBaron", "⛏️", "Drill Baron", "A brass mining helm with a mechanical crown-drill.", "drillhelm", ["#34291f", "#755633", "#d8a84e", "#ffef9a"], "spark"],
  ["vampire", "daybreaker", "☀️", "Daybreaker", "A sun halo, high collar, and white-gold coat.", "sunhalo", ["#4a2031", "#9d3d4d", "#f1d3b3", "#ffd95a"], "sun"],
  ["jester", "puppetKing", "🎭", "Puppet King", "A tall split crown with dangling marionette strings.", "puppetcrown", ["#35205a", "#7d45a5", "#ef6f9a", "#ffd166"], "ribbon"],
  ["turtle", "volcanoShell", "🌋", "Volcano Shell", "An obsidian shell split by glowing magma vents.", "volcanoshell", ["#241d1d", "#5a3630", "#db553a", "#ffcf55"], "ember"],
  ["samurai", "moonRonin", "🌙", "Moon Ronin", "A crescent crest and midnight traveling cloak.", "mooncrest", ["#151d3a", "#314b79", "#83a6d8", "#e9efff"], "moon"],
  ["astronomer", "livingOrrery", "🪐", "Living Orrery", "A brass observatory with tiny worlds in orbit.", "orrery", ["#27304a", "#596b8b", "#d2b36c", "#73eff7"], "orbit"],
  ["druid", "autumnAncient", "🍂", "Autumn Ancient", "Great branch antlers crowned in ember-red leaves.", "antlers", ["#3b2d25", "#765137", "#c97941", "#f2c14e"], "leaf"],
  ["griffin", "stormRoc", "🪶", "Storm Roc", "A crested sky-hunter with sweeping electric plumage.", "feathercrest", ["#293653", "#4b72a6", "#d9edf2", "#ffe45e"], "lightning"],
  ["golem", "overgrownRuin", "🏛️", "Overgrown Ruin", "A walking shrine split by roots, moss, and flowers.", "ruin", ["#36433d", "#697869", "#b3b79b", "#8ed15c"], "leaf"],
  ["weaver", "clockworkSpider", "⚙️", "Clockwork Spider", "A many-legged brass machine with a wound key.", "clockwork", ["#332d2b", "#806044", "#d9a441", "#77e0d4"], "gear"],
  ["bellkeeper", "cathedralBell", "⛪", "Cathedral Bell", "A vaulted iron crown with stained-glass light.", "cathedral", ["#23283b", "#555f79", "#c3c8d4", "#ef5b8c"], "chime"],
  ["lanternWisp", "festivalSpirit", "🎐", "Festival Spirit", "A ribboned lantern dancing with warm festival fire.", "lanternribbons", ["#45254b", "#a33f5f", "#ff9b62", "#fff2a8"], "ribbon"],
  ["colossus", "crystalTitan", "💎", "Crystal Titan", "A mountain split open by enormous living crystals.", "crystaltitan", ["#293544", "#536879", "#9ad5d8", "#c08cff"], "crystal"],
  ["god", "cosmicNobody", "🌌", "Cosmic Nobody", "The little blank someone, containing every horizon.", "cosmichalo", ["#16142e", "#41366f", "#8f7ee7", "#fff36b"], "cosmos"],
].map(([formId, id, icon, name, tagline, motif, colors, effect]) => ({
  formId, id, icon, name, tagline, motif, colors, effect, unlockLevel: 3,
}));

G.skinById = function (id) {
  return G.FORM_SKINS.find((skin) => skin.id === id) || null;
};

G.skinForForm = function (formId) {
  return G.FORM_SKINS.find((skin) => skin.formId === formId) || null;
};

G.normalizeSkins = function (unlocked, equipped) {
  const valid = new Set(G.FORM_SKINS.map((skin) => skin.id));
  const owned = Array.isArray(unlocked) ? Array.from(new Set(unlocked.filter((id) => valid.has(id)))) : [];
  const selected = {};
  if (equipped && typeof equipped === "object") {
    for (const [formId, id] of Object.entries(equipped)) {
      const skin = G.skinById(id);
      if (skin && skin.formId === formId && owned.includes(id)) selected[formId] = id;
    }
  }
  return { unlocked: owned, equipped: selected };
};

G.ensureSkins = function () {
  const normalized = G.normalizeSkins(G.state.skinsUnlocked, G.state.skinByForm);
  G.state.skinsUnlocked = normalized.unlocked;
  G.state.skinByForm = normalized.equipped;
  return normalized;
};

G.skinUnlocked = function (id) {
  return !!(G.state && G.ensureSkins().unlocked.includes(id));
};

G.selectedFormSkin = function (formId) {
  if (!G.state) return null;
  return G.skinById(G.ensureSkins().equipped[formId]) || null;
};

G.selectFormSkin = function (formId, id) {
  if (!G.state || !G.forms[formId]) return false;
  const skins = G.ensureSkins();
  if (id === "classic") delete skins.equipped[formId];
  else {
    const skin = G.skinById(id);
    if (!skin || skin.formId !== formId || !skins.unlocked.includes(id)) return false;
    skins.equipped[formId] = id;
  }
  if (G.sfx) G.sfx.play("pickup");
  if (G.ui) G.ui.toast(id === "classic" ? `✨ ${G.forms[formId].name}: Classic` : `${G.skinById(id).icon} ${G.skinById(id).name} equipped`, 2.2);
  G.saveGame();
  return true;
};

G.checkSkinUnlocks = function (quiet) {
  if (!G.state) return [];
  const skins = G.ensureSkins();
  const earned = G.FORM_SKINS.filter((skin) => !skins.unlocked.includes(skin.id) &&
    G.formUnlocked(skin.formId) && G.formLevel(skin.formId) >= skin.unlockLevel);
  if (!earned.length) return earned;
  for (const skin of earned) skins.unlocked.push(skin.id);
  if (!quiet && G.ui) {
    if (G.sfx) G.sfx.play("unlock");
    const names = earned.map((skin) => `${skin.icon} ${skin.name}`).join(" · ");
    G.ui.banner(earned.length > 1 ? "✨ SIGNATURE SKINS UNLOCKED" : "✨ SIGNATURE SKIN UNLOCKED", names);
  }
  G.saveGame();
  return earned;
};

for (const event of ["questDone", "formUnlock"]) {
  G.events.on(event, () => G.checkSkinUnlocks(G.costumeBooting));
}

const signatureSpriteCache = new WeakMap();

function skinPalette(sprite, skin) {
  const palette = { K: "#151522", X: skin.colors[3], Y: skin.colors[2] };
  const entries = Object.entries(sprite.palette || {});
  const brightness = (hex) => {
    const n = parseInt(String(hex).replace("#", ""), 16);
    return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000;
  };
  const values = entries.map(([, color]) => brightness(color));
  const min = Math.min(...values), max = Math.max(...values);
  for (const [key, color] of entries) {
    if (String(color).toLowerCase() === "#1a1c2c") palette[key] = "#151522";
    else {
      const t = max === min ? 0.5 : (brightness(color) - min) / (max - min);
      palette[key] = t > 0.68 ? skin.colors[2] : t > 0.33 ? skin.colors[1] : skin.colors[0];
    }
  }
  return palette;
}

function skinFrame(rows, motif) {
  const sourceW = rows.reduce((width, row) => Math.max(width, row.length), 1);
  const sourceH = rows.length;
  const pad = 5;
  const w = sourceW + pad * 2;
  const h = sourceH + pad * 2;
  const grid = Array.from({ length: h }, () => Array(w).fill("."));
  for (let y = 0; y < sourceH; y++) for (let x = 0; x < rows[y].length; x++)
    if (rows[y][x] !== "." && rows[y][x] !== " ") grid[y + pad][x + pad] = rows[y][x];
  const cx = Math.floor(w / 2), top = pad, bottom = pad + sourceH - 1;
  const put = (x, y, ch = "X") => {
    x = Math.round(x); y = Math.round(y);
    if (x >= 0 && x < w && y >= 0 && y < h) grid[y][x] = ch;
  };
  const line = (x1, y1, x2, y2, ch = "X") => {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
    for (let i = 0; i <= steps; i++) put(Math.round(x1 + (x2 - x1) * i / steps), Math.round(y1 + (y2 - y1) * i / steps), ch);
  };
  const crown = (wide) => { for (let x = cx - wide; x <= cx + wide; x++) put(x, top - 1, "X"); put(cx - wide, top - 2, "Y"); put(cx, top - 3, "Y"); put(cx + wide, top - 2, "Y"); };
  const cape = () => { line(pad - 1, top + 5, pad - 2, bottom - 1, "X"); line(w - pad, top + 5, w - pad + 1, bottom - 1, "X"); };
  switch (motif) {
    case "boxhero":
      for (let x = cx - 5; x <= cx + 5; x++) { put(x, top - 2, "K"); put(x, top + 2, "K"); }
      for (let y = top - 1; y <= top + 1; y++) { put(cx - 5, y, "K"); put(cx + 5, y, "K"); }
      put(cx - 2, top, "Y"); put(cx + 2, top, "Y"); cape(); break;
    case "crowncape": crown(4); cape(); break;
    case "horncape": line(cx - 4, top, cx - 6, top - 4, "Y"); line(cx + 4, top, cx + 6, top - 4, "Y"); cape(); break;
    case "hoodleaf": line(cx - 5, top + 3, cx, top - 3, "X"); line(cx, top - 3, cx + 5, top + 3, "X"); put(cx + 4, top - 2, "Y"); put(cx + 5, top - 3, "Y"); break;
    case "starhat": line(cx - 6, top, cx + 6, top, "X"); line(cx - 3, top - 1, cx, top - 5, "X"); line(cx, top - 5, cx + 3, top - 1, "X"); put(cx + 1, top - 4, "Y"); break;
    case "lilycrown": crown(3); put(cx - 5, top - 1, "Y"); put(cx + 5, top - 1, "Y"); break;
    case "goggles": line(cx - 5, top + 2, cx + 5, top + 2, "K"); put(cx - 3, top + 2, "Y"); put(cx + 3, top + 2, "Y"); put(cx + 6, top + 5, "X"); put(cx + 7, top + 6, "X"); break;
    case "thundercrown": crown(4); line(cx - 6, top, cx - 8, top - 3, "Y"); line(cx + 6, top, cx + 8, top - 3, "Y"); break;
    case "icehorns": line(cx - 4, top, cx - 7, top - 4, "Y"); line(cx + 4, top, cx + 7, top - 4, "Y"); put(cx - 8, top - 3, "X"); put(cx + 8, top - 3, "X"); break;
    case "ronin": line(cx - 7, top, cx + 7, top, "X"); line(cx - 3, top - 1, cx, top - 4, "Y"); line(cx, top - 4, cx + 3, top - 1, "Y"); cape(); break;
    case "drillhelm": line(cx - 5, top, cx + 5, top, "X"); line(cx, top - 1, cx + 5, top - 5, "Y"); put(cx + 6, top - 6, "X"); break;
    case "sunhalo": for (let x = cx - 5; x <= cx + 5; x += 2) put(x, top - 4 + Math.abs(cx - x) / 3, "Y"); cape(); break;
    case "puppetcrown": crown(5); line(cx - 6, top - 2, cx - 7, top + 5, "X"); line(cx + 6, top - 2, cx + 7, top + 5, "X"); break;
    case "volcanoshell": for (let x = cx - 6; x <= cx + 6; x += 3) line(x, top + 5, x + 1, top + 1, "X"); put(cx - 3, bottom - 4, "Y"); put(cx + 3, bottom - 6, "Y"); break;
    case "mooncrest": line(cx - 5, top, cx + 5, top, "X"); line(cx, top - 1, cx + 3, top - 5, "Y"); put(cx + 1, top - 5, "Y"); cape(); break;
    case "orrery": line(cx - 6, top - 2, cx + 6, top - 2, "X"); put(cx - 6, top - 3, "Y"); put(cx + 6, top - 1, "Y"); put(cx, top - 4, "Y"); break;
    case "antlers": line(cx - 3, top, cx - 7, top - 5, "X"); line(cx + 3, top, cx + 7, top - 5, "X"); put(cx - 8, top - 4, "Y"); put(cx + 8, top - 4, "Y"); break;
    case "feathercrest": line(cx - 4, top, cx + 4, top - 5, "Y"); line(cx, top - 1, cx + 6, top - 3, "X"); break;
    case "ruin": line(cx - 6, top + 2, cx - 7, bottom - 2, "X"); line(cx + 6, top + 2, cx + 7, bottom - 2, "X"); put(cx - 6, top - 1, "Y"); put(cx + 5, top - 2, "Y"); put(cx + 7, top, "Y"); break;
    case "clockwork": crown(3); put(cx + 6, top + 2, "X"); put(cx + 7, top + 1, "Y"); put(cx + 7, top + 3, "Y"); line(pad - 2, bottom - 3, pad + 2, bottom - 5, "X"); line(w - pad + 1, bottom - 3, w - pad - 2, bottom - 5, "X"); break;
    case "cathedral": line(cx - 5, top + 2, cx, top - 5, "X"); line(cx, top - 5, cx + 5, top + 2, "X"); put(cx, top - 3, "Y"); put(cx - 2, top - 1, "Y"); put(cx + 2, top - 1, "Y"); break;
    case "lanternribbons": crown(4); line(cx - 5, top + 1, cx - 8, bottom - 2, "X"); line(cx + 5, top + 1, cx + 8, bottom - 2, "Y"); break;
    case "crystaltitan": for (let x = cx - 7; x <= cx + 7; x += 4) line(x, top + 3, x + (x < cx ? -2 : 2), top - 4, x === cx - 3 ? "Y" : "X"); break;
    case "cosmichalo": crown(5); put(cx - 7, top - 4, "Y"); put(cx + 7, top - 3, "Y"); put(cx, top - 5, "Y"); cape(); break;
  }
  return grid.map((row) => row.join(""));
}

G.signatureSprite = function (sprite, skin) {
  if (!sprite || !skin) return sprite;
  let variants = signatureSpriteCache.get(sprite);
  if (!variants) { variants = new Map(); signatureSpriteCache.set(sprite, variants); }
  if (variants.has(skin.id)) return variants.get(skin.id);
  const variant = {
    palette: skinPalette(sprite, skin),
    frames: sprite.frames.map((rows) => skinFrame(rows, skin.motif)),
  };
  if (sprite.hd && G.makeHdSprite2x) variant.hd = G.makeHdSprite2x(variant, {
    accent: skin.colors[3], motif: "hero", animate: true,
  });
  variants.set(skin.id, variant);
  return variant;
};

G.formPreviewSprite = function (formId, skinId) {
  const form = G.forms[formId];
  if (!form) return null;
  const skin = skinId && skinId !== "classic" ? G.skinById(skinId) : null;
  return skin && skin.formId === formId ? G.signatureSprite(form.sprite, skin) : form.sprite;
};

G.playerAppearanceSprite = function (form) {
  const skin = form && G.selectedFormSkin(form.id);
  return skin ? G.signatureSprite(form.sprite, skin) : G.costumedSprite(form.sprite);
};

G.drawFormSkinEffect = function (ctx, p, form, drawX, drawY) {
  const skin = form && G.selectedFormSkin(form.id);
  if (!skin) return false;
  const t = G.state.time || 0;
  const phase = Math.floor(t * 5) % 3;
  ctx.save();
  ctx.fillStyle = skin.colors[3];
  if (["orbit", "cosmos", "orrery"].includes(skin.effect)) {
    ctx.fillRect(Math.round(drawX + Math.cos(t * 2.5) * 12), Math.round(drawY - 10 + Math.sin(t * 2.5) * 5), 2, 2);
    ctx.fillStyle = skin.colors[2];
    ctx.fillRect(Math.round(drawX - Math.cos(t * 2.5) * 10), Math.round(drawY - 10 - Math.sin(t * 2.5) * 4), 1, 1);
  } else if (["leaf", "paper", "ribbon", "snow"].includes(skin.effect)) {
    ctx.fillRect(Math.round(drawX - 9 + phase * 4), Math.round(drawY - 4 - ((t * 7) % 9)), 2, 2);
  } else if (["ember", "sun", "lightning", "spark", "crystal"].includes(skin.effect)) {
    ctx.fillRect(Math.round(drawX - 7), Math.round(drawY - 4 - ((t * 8) % 7)), 2, 2);
    ctx.fillRect(Math.round(drawX + 6), Math.round(drawY - 7 - ((t * 6 + 3) % 6)), 1, 2);
  } else if (["void", "afterimage", "moon"].includes(skin.effect)) {
    ctx.globalAlpha = 0.55;
    ctx.fillRect(Math.round(drawX - p.dir.x * (8 + phase)), Math.round(drawY - 9), 3, 5);
  } else if (skin.effect === "bubble") {
    ctx.globalAlpha = 0.7;
    ctx.fillRect(Math.round(drawX + 8), Math.round(drawY - 8 - ((t * 6) % 8)), 2, 2);
  } else if (skin.effect === "gear" || skin.effect === "chime") {
    ctx.fillRect(Math.round(drawX + Math.cos(t * 4) * 9), Math.round(drawY - 9 + Math.sin(t * 4) * 3), 2, 2);
  }
  ctx.restore();
  return true;
};
