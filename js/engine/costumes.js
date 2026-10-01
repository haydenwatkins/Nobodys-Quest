/* ============================================================
   APPEARANCE SYSTEM — dyes plus form-specific signature skins.

   Legacy costumes remain as global dyes so old saves stay intact. Signature
   skins recolor the authored material pixels without adding generic shapes.
   Neither system changes combat stats.
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
    id: "trailblazer", icon: "🧣", name: "Trailblazer", tagline: "Road-worn gold and sky-blue colors.",
    hint: "Discover 2 major regions.", accent: "#73eff7",
    palette: COSTUME_NEUTRAL, swatches: ["#fff3c2", "#d8b06a", "#73eff7"],
    condition: () => G.wayfinderProgress && G.wayfinderProgress().found >= 2,
  },
  {
    id: "moonberry", icon: "🫐", name: "Moonberry", tagline: "A berry-bright look from the whispering woods.",
    hint: "Find the Whispering Seed.", accent: "#f4a6ff",
    palette: {
      "#f4f4f4": "#e8d7ff", "#94b0c2": "#a884d8", "#566c86": "#5d275d",
      "#38b764": "#8153c1", "#41a6f6": "#73eff7", "#ef7d57": "#b13e53", "#ffcd75": "#f4a6ff",
    },
    swatches: ["#e8d7ff", "#8153c1", "#f4a6ff"],
    condition: () => !!(G.state && (G.state.items || []).includes("whispering-seed")),
  },
  {
    id: "mirecloak", icon: "🍃", name: "Mirecloak", tagline: "Moss, lily, and deep-water colors.",
    hint: "Discover the Sunken Marsh.", accent: "#a7f070",
    palette: {
      "#f4f4f4": "#d8e6c3", "#94b0c2": "#7f9b65", "#566c86": "#3c6255",
      "#38b764": "#a7f070", "#41a6f6": "#257179", "#ef7d57": "#c6d66a", "#ffcd75": "#d8e6c3",
    },
    swatches: ["#d8e6c3", "#7f9b65", "#257179"],
    condition: () => G.wayfinderDiscovered && G.wayfinderDiscovered("sunkenMarsh"),
  },
  {
    id: "emberguard", icon: "🔥", name: "Emberguard", tagline: "Coal-dark armor with a living ember trim.",
    hint: "Discover Ember Ridge.", accent: "#ffcd75",
    palette: {
      "#f4f4f4": "#ffe0b0", "#94b0c2": "#c45d4f", "#566c86": "#6b2d2d",
      "#38b764": "#ef7d57", "#41a6f6": "#ff9d57", "#ef7d57": "#ffcd75", "#8153c1": "#b13e53",
    },
    swatches: ["#ffe0b0", "#ef7d57", "#6b2d2d"],
    condition: () => G.wayfinderDiscovered && G.wayfinderDiscovered("emberRidge"),
  },
  {
    id: "starstrider", icon: "☄️", name: "Starstrider", tagline: "Midnight blue and bright starlight colors.",
    hint: "Find the Fallen Star Thread in Starfall Ruins.", accent: "#73eff7",
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
    id: "tidewalker", icon: "🌊", name: "Tidewalker", tagline: "Sea-glass colors and bright foam-white trim.",
    hint: "Discover Shattercoast.", accent: "#dff6f5",
    palette: {
      "#f4f4f4": "#dff6f5", "#94b0c2": "#73eff7", "#566c86": "#257179",
      "#38b764": "#38b764", "#41a6f6": "#41a6f6", "#ef7d57": "#73eff7", "#ffcd75": "#a7f070",
    },
    swatches: ["#dff6f5", "#73eff7", "#257179"],
    condition: () => G.wayfinderDiscovered && G.wayfinderDiscovered("shattercoast"),
  },
  {
    id: "guardian", icon: "🏅", name: "Guardian Gold", tagline: "A champion's finish earned from the great guardians.",
    hint: "Collect 3 different miniboss trophies.", accent: "#ffcd75",
    palette: {
      "#f4f4f4": "#fff3c2", "#94b0c2": "#ffcd75", "#566c86": "#6b4a2b",
      "#38b764": "#ef7d57", "#41a6f6": "#ffcd75", "#ef7d57": "#b13e53", "#8153c1": "#c45d4f",
    },
    swatches: ["#fff3c2", "#ffcd75", "#b13e53"],
    condition: () => G.guardianCollectionProgress && G.guardianCollectionProgress().found >= 3,
  },
  {
    id: "manyfold", icon: "👑", name: "Manyfold Royal", tagline: "A prismatic victory look for a complete gauntlet.",
    hint: "Defeat every guardian in one gauntlet.", accent: "#ffcd75",
    palette: {
      "#f4f4f4": "#fff3c2", "#94b0c2": "#73eff7", "#566c86": "#8153c1",
      "#38b764": "#a7f070", "#41a6f6": "#73eff7", "#ef7d57": "#ef7d57", "#ffcd75": "#ffcd75",
    },
    swatches: ["#ffcd75", "#73eff7", "#8153c1"],
    condition: () => !!(G.state && (G.state.items || []).includes("manyfold-crown")),
  },
  {
    id: "worldwalker", icon: "🌍", name: "Worldwalker", tagline: "Sunlit cloth and horizon-blue trim from the roaming caravan.",
    hint: "Complete The Whole Horizon caravan favor.", accent: "#73eff7",
    palette: {
      "#f4f4f4": "#fff3c2", "#94b0c2": "#d8b06a", "#566c86": "#6b4a2b",
      "#38b764": "#a7f070", "#41a6f6": "#73eff7", "#ef7d57": "#ffcd75", "#8153c1": "#3b5dc9",
    },
    swatches: ["#fff3c2", "#d8b06a", "#73eff7"],
    condition: () => !!(G.state && (G.state.items || []).includes("worldwake-cloak")),
  },
  {
    id: "worldheart", icon: "🗿", name: "Worldheart", tagline: "Ancient stone, warm embers, and sunlit gold.",
    hint: "Complete A World at Peace caravan favor.", accent: "#ef7d57",
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

function colorBrightness(hex) {
  const value = parseInt(String(hex || "#000000").replace("#", ""), 16);
  return ((value >> 16) * 299 + ((value >> 8) & 255) * 587 + (value & 255) * 114) / 1000;
}

// Authored dense sprites keep their contours and animation when dyed. The
// old path regenerated them from the tiny legacy sprite, quietly throwing
// away every hand-drawn pixel as soon as an outfit was equipped.
function dyeAuthoredSprite(def, costume) {
  const tones = (costume.swatches || ["#f4f4f4", "#94b0c2", "#566c86"])
    .slice().sort((a, b) => colorBrightness(a) - colorBrightness(b));
  const visible = Object.entries(def.palette || {}).filter(([, color]) => String(color).toLowerCase() !== "#151522");
  const values = visible.map(([, color]) => colorBrightness(color));
  const low = Math.min(...values), high = Math.max(...values);
  const palette = {};
  for (const [key, color] of Object.entries(def.palette || {})) {
    if (String(color).toLowerCase() === "#151522") { palette[key] = color; continue; }
    const t = high === low ? 0.5 : (colorBrightness(color) - low) / (high - low);
    palette[key] = t < 0.34 ? tones[0] : t < 0.72 ? tones[Math.floor((tones.length - 1) / 2)] : tones[tones.length - 1];
  }
  // Preserve one magical highlight so dyes remain a costume rather than
  // erasing a form's readable focus (eyes, rune, flame, blade, etc.).
  const brightest = visible.sort((a, b) => colorBrightness(b[1]) - colorBrightness(a[1]))[0];
  if (brightest && costume.accent) palette[brightest[0]] = costume.accent;
  return {
    palette, frames: def.frames, density: def.density || 2,
    animations: def.animations, authored: def.authored, directional: def.directional,
  };
}

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
  const variant = { palette, frames: sprite.frames, animations: sprite.animations, directional: sprite.directional };
  if (sprite.hd && sprite.hd.authored) variant.hd = dyeAuthoredSprite(sprite.hd, costume);
  else if (sprite.hd && G.makeHdSprite2x) variant.hd = G.makeHdSprite2x(variant, {
    accent: costume.accent || "#73eff7", motif: sprite.hd.hdMotif || "detail", animate: true,
  });
  variants.set(costume.id, variant);
  return variant;
};

/* ---------- Signature skins ----------
   Earned alternate material colors retain each authored silhouette and pose.
   Generic hats, horns, capes and orbiting shapes are deliberately removed.
   Level 3 remains the mastery threshold, with all existing skin/save IDs. */

G.FORM_SKINS = [
  ["nobody", "cardboardHero", "📦", "Cardboard Hero", "Warm paper, honey leather and red stitching.", "boxhero", ["#7b4f2c", "#c58b55", "#f2c879", "#ef5b5b"], "paper"],
  ["rat", "sewerKing", "👑", "Sewer King", "Plum fur, royal copper and sunlit gold.", "crowncape", ["#352746", "#72506f", "#c9957a", "#ffd166"], "spark"],
  ["knight", "hollowBlackguard", "🛡️", "Hollow Blackguard", "Midnight steel and soft violet trim.", "horncape", ["#11131f", "#323852", "#70799a", "#a779e9"], "void"],
  ["ranger", "mossStalker", "🍃", "Moss Stalker", "Deep forest cloth and fresh leaf-green trim.", "hoodleaf", ["#173b32", "#2f6b4f", "#8fbd62", "#d7ef8a"], "leaf"],
  ["wizard", "starSage", "🌠", "Star Sage", "Night-blue wool and warm comet gold.", "starhat", ["#1b234a", "#394c98", "#94bfff", "#fff0a8"], "orbit"],
  ["frog", "poisonPrince", "🪷", "Poison Prince", "Jade skin and bright petal-pink highlights.", "lilycrown", ["#17463d", "#2c8f5b", "#8be04e", "#f15bb5"], "bubble"],
  ["alchemist", "brassBrewer", "⚗️", "Brass Brewer", "Copper workwear and cool glass highlights.", "goggles", ["#49311f", "#a46434", "#e0b35a", "#73eff7"], "bubble"],
  ["stormcaller", "thunderIdol", "⚡", "Thunder Idol", "Storm-violet wool and bright lightning gold.", "thundercrown", ["#25214a", "#594da8", "#b9abff", "#fff36b"], "lightning"],
  ["dragon", "frostbone", "❄️", "Frostbone", "Frost-blue scales and pale ivory highlights.", "icehorns", ["#193448", "#356c88", "#b9e7ef", "#ffffff"], "snow"],
  ["riftblade", "neonRonin", "🌈", "Neon Ronin", "Dark indigo cloth with mint and magenta trim.", "ronin", ["#17152d", "#38306b", "#56d6d2", "#ff4fd8"], "afterimage"],
  ["mole", "drillBaron", "⛏️", "Drill Baron", "Copper-brown fur and bright lamplight gold.", "drillhelm", ["#34291f", "#755633", "#d8a84e", "#ffef9a"], "spark"],
  ["vampire", "daybreaker", "☀️", "Daybreaker", "Rose velvet, warm ivory and sunlight gold.", "sunhalo", ["#4a2031", "#9d3d4d", "#f1d3b3", "#ffd95a"], "sun"],
  ["jester", "puppetKing", "🎭", "Puppet King", "Plum cloth, petal pink and honey-gold trim.", "puppetcrown", ["#35205a", "#7d45a5", "#ef6f9a", "#ffd166"], "ribbon"],
  ["turtle", "volcanoShell", "🌋", "Volcano Shell", "Obsidian shell and warm magma-red accents.", "volcanoshell", ["#241d1d", "#5a3630", "#db553a", "#ffcf55"], "ember"],
  ["samurai", "moonRonin", "🌙", "Moon Ronin", "Midnight cloth and pale moonlit blue.", "mooncrest", ["#151d3a", "#314b79", "#83a6d8", "#e9efff"], "moon"],
  ["astronomer", "livingOrrery", "🪐", "Living Orrery", "Slate-blue cloth, warm brass and cool glass.", "orrery", ["#27304a", "#596b8b", "#d2b36c", "#73eff7"], "orbit"],
  ["druid", "autumnAncient", "🍂", "Autumn Ancient", "Autumn bark, russet leaves and harvest gold.", "antlers", ["#3b2d25", "#765137", "#c97941", "#f2c14e"], "leaf"],
  ["griffin", "stormRoc", "🪶", "Storm Roc", "Storm-blue feathers and warm electric gold.", "feathercrest", ["#293653", "#4b72a6", "#d9edf2", "#ffe45e"], "lightning"],
  ["golem", "overgrownRuin", "🏛️", "Overgrown Ruin", "Mossy stone and soft leaf-green highlights.", "ruin", ["#36433d", "#697869", "#b3b79b", "#8ed15c"], "leaf"],
  ["weaver", "clockworkSpider", "⚙️", "Clockwork Spider", "Warm brass and cool mint metalwork.", "clockwork", ["#332d2b", "#806044", "#d9a441", "#77e0d4"], "gear"],
  ["bellkeeper", "cathedralBell", "⛪", "Cathedral Bell", "Slate iron with rose-colored glass highlights.", "cathedral", ["#23283b", "#555f79", "#c3c8d4", "#ef5b8c"], "chime"],
  ["lanternWisp", "festivalSpirit", "🎐", "Festival Spirit", "Plum metal, warm copper and festival ivory.", "lanternribbons", ["#45254b", "#a33f5f", "#ff9b62", "#fff2a8"], "ribbon"],
  ["colossus", "crystalTitan", "💎", "Crystal Titan", "Blue-grey stone and soft crystal-violet trim.", "crystaltitan", ["#293544", "#536879", "#9ad5d8", "#c08cff"], "crystal"],
  ["god", "cosmicNobody", "🌌", "Cosmic Patchling", "Midnight cloth, lavender and warm horizon gold.", "cosmichalo", ["#16142e", "#41366f", "#8f7ee7", "#fff36b"], "cosmos"],
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
  if (G.ui) G.ui.toast(id === "classic" ? `✨ ${G.forms[formId].name}: Classic` : `${G.skinById(id).icon} Wearing ${G.skinById(id).name}`, 2.2);
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
  const palette = {};
  const entries = Object.entries(sprite.palette || {});
  const brightness = (hex) => {
    const n = parseInt(String(hex).replace("#", ""), 16);
    return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000;
  };
  const values = entries.map(([, color]) => brightness(color));
  const min = Math.min(...values), max = Math.max(...values);
  const highlight = entries.reduce((best, entry) => brightness(entry[1]) > brightness(best[1]) ? entry : best, entries[0]);
  for (const [key, color] of entries) {
    if (key === "k" || String(color).toLowerCase() === "#1a1c2c") palette[key] = color;
    else {
      const t = max === min ? 0.5 : (brightness(color) - min) / (max - min);
      palette[key] = key === highlight[0] ? skin.colors[3] : t > 0.68 ? skin.colors[2] : t > 0.33 ? skin.colors[1] : skin.colors[0];
    }
  }
  return palette;
}

G.signatureSprite = function (sprite, skin) {
  if (!sprite || !skin) return sprite;
  let variants = signatureSpriteCache.get(sprite);
  if (!variants) { variants = new Map(); signatureSpriteCache.set(sprite, variants); }
  if (variants.has(skin.id)) return variants.get(skin.id);
  const variant = {
    palette: skinPalette(sprite, skin),
    animations: sprite.animations, directional: sprite.directional,
    frames: sprite.frames,
  };
  if (sprite.hd && sprite.hd.authored) variant.hd = {
    palette: skinPalette(sprite.hd, skin),
    frames: sprite.hd.frames,
    density: sprite.hd.density || 2,
    animations: sprite.hd.animations,
    directional: sprite.hd.directional,
    authored: true,
  };
  else if (sprite.hd) variant.hd = { ...sprite.hd, palette: skinPalette(sprite.hd, skin) };
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
