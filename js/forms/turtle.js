/* TURTLE — build a three-hit brace, roll through danger, then counter. */
"use strict";

registerForm({
  id: "turtle", name: "Harborback", icon: "🐢",
  tagline: "A patient shorekeeper with sea-worn shell plates and a heart for stranded travellers.",
  speed: 62, hearts: 8, slots: 2,
  passive: { id: "shellback", name: "Shellback",
    description: "Your shell removes one damage and all knockback from attacks behind you." },
  basic: "shellJab",
  abilities: [{ id: "shellRoll", level: 1 }, { id: "shellCounter", level: 2 }],
  unlock: { type: "challenge", hint: "Crack Marlo's breakwater defense", requirements: [
    { type: "item", item: "tide-shell", hint: "Win the Tide Shell" },
    { type: "formLevel", form: "knight", level: 4 },
  ] },
  quests: [
    { text: "Land 6 Shell Jabs", event: "hit", match: { ability: "shellJab" }, count: 6 },
    { text: "Brace through 2 baddies with a third Shell Jab, twice", event: "multiHit", match: { ability: "shellJab", combo: "brace" }, count: 2 },
    { text: "Land 6 Shell Roll hits", event: "hit", match: { ability: "shellRoll" }, count: 6 },
    { text: "Counter 3 baddies at once, twice", event: "multiHit", match: { ability: "shellCounter", hits: { gte: 3 } }, count: 2 },
  ],
  sprite: {
    palette: { k: "#1a1c2c", g: "#6b8e3e", l: "#a7f070", s: "#38b764", b: "#8a6538", w: "#f4f4f4", y: "#ffcd75" },
    frames: [[
      ".....kkkkkk.....", "...kkggggggkk...", "..kggllllllggk..", ".kgglkssssklggk.",
      "kgglssllllssgglk", "kglslkllllklslkk", "kglsllllllllslgk", ".kgglssssssslggk.",
      "..kkggggggggkk..", "...kbbbbbbbbk...", "..kkbbbyybbbkk..", ".kggkbbbbbbkggk.",
      "kggk.kk..kk.kggk", ".kk..........kk.", "..lll........lll", ".lllll......lllll",
    ], [
      "......kkkkkk....", "....kkggggggkk..", "...kggllllllggk.", "..kgglkssssklggk",
      ".kgglssllllssggl", ".kglslkllllklslkk", ".kglsllllllllslgk", "..kgglssssssslggk",
      "...kkggggggggkk.", "....kbbbbbbbbk..", "...kkbbbyybbbkk.", "..kggkbbbbbbkggk",
      ".kggk.kk..kk.kgg", "..kk..........kk", "llll........llll", ".lll........lll.",
    ]],
  },
});
