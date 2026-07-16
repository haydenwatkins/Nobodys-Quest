/* DRUID — poisonous reach, bursting seeds, and a crowd-rooting garden. */
"use strict";

registerForm({
  id: "druid", name: "Druid", icon: "🌳",
  tagline: "Plants first, asks questions later, and considers every arena excellent soil.",
  speed: 82, hearts: 5, slots: 2,
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
    { text: "Lash 24 baddies with thorns", event: "hit", match: { ability: "thornLash" }, count: 24 },
    { text: "Poison 14 baddies", event: "status", match: { status: "poison" }, count: 14 },
    { text: "Burst seeds onto 16 baddies", event: "hit", match: { ability: "seedBurst" }, count: 16 },
    { text: "Root 4 baddies in one Wild Growth, twice", event: "multiHit", match: { ability: "wildGrowth", hits: { gte: 4 } }, count: 2 },
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
