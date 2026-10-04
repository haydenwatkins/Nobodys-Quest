/* DRUID — poisonous reach, bursting seeds, and a crowd-rooting garden. */
"use strict";

registerForm({
  id: "druid", name: "Hedgehare", icon: "🌳",
  tagline: "A gentle hedgeway gardener with a seedling basket and a lively pruning cane.",
  speed: 82, hearts: 4, slots: 2,
  passive: { id: "seedbed", name: "Seedbed",
    description: "Status effects leap to a nearby enemy when their victim falls." },
  basic: "thornLash",
  abilities: [{ id: "seedBurst", level: 1 }, { id: "wildGrowth", level: 2 }],
  unlock: { type: "challenge", hint: "Prune Grandmother Briar's impossible garden", requirements: [
    { type: "item", item: "elder-acorn", hint: "Win the Elder Acorn" },
    { type: "any", options: [
      { type: "formLevel", form: "frog", level: 4 },
      { type: "formLevel", form: "wizard", level: 4 },
    ] },
  ] },
  quests: [
    { text: "Land 6 Thorn Lash hits", event: "hit", match: { ability: "thornLash" }, count: 6 },
    { text: "Poison 6 targets", event: "status", match: { status: "poison" }, lessonArt: "thornLash", count: 6 },
    { text: "Land 6 Seed Burst hits", event: "hit", match: { ability: "seedBurst" }, count: 6 },
    { text: "Root 3 baddies in one Wild Growth", event: "multiHit", match: { ability: "wildGrowth", hits: { gte: 3 } }, count: 1 },
  ],
  sprite: {
    palette: { k: "#1a1c2c", g: "#38b764", l: "#a7f070", b: "#6b4a2b", t: "#8a6538", w: "#f4f4f4", y: "#ffcd75" },
    frames: [[
      "..l....llll....l..", ".lgl..llggll..lgl.", "..l..kkggggkk..l..", "....kttttttttk....",
      "...ktwllllllwtk...", "...ktwlkkkklwtk...", "..kktttwwwwtttkk..", ".kggkkttttttkkggk.",
      "kggggkkttttkkggggk", ".kgggbbbbbbbbgggk.", "..kggbbbbbbbbggk..", "...kkbbbbbbbbkk...",
      "....kbbk..kbbk....", "...kkbk....kbkk...", "..lll......lll....", ".lllll....lllll...",
    ], [
      ".l....llll....l...", "lgl..llggll..lgl..", ".l..kkggggkk..l...", "...kttttttttk.....",
      "..ktwllllllwtk....", "..ktwlkkkklwtk....", ".kktttwwwwtttkk....", "kggkkttttttkkggk...",
      ".kggggkkttttkkggggk", "..kgggbbbbbbbbgggk", "...kggbbbbbbbbggk.", "....kkbbbbbbbbkk..",
      ".....kbbk..kbbk...", "....kkbk....kbkk..", ".lll........lll...", "lllll......lllll..",
    ]],
  },
});
