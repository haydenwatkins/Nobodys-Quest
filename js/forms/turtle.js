/* TURTLE — build a three-hit brace, roll through danger, then counter. */
"use strict";

registerForm({
  id: "turtle", name: "Turtle", icon: "🐢",
  tagline: "Turns patience into momentum and incoming trouble into somebody else's problem.",
  speed: 62, hearts: 7, slots: 2,
  basic: "shellJab",
  abilities: [{ id: "shellRoll", level: 1 }, { id: "shellCounter", level: 2 }],
  unlock: { type: "challenge", hint: "Crack Admiral Tortoise's perfect defense", requirements: [
    { type: "item", item: "tide-shell", hint: "Win the Tide Shell" },
    { type: "formLevel", form: "knight", level: 4 },
  ] },
  quests: [
    { text: "Land 24 Shell Jabs", event: "hit", match: { ability: "shellJab" }, count: 24 },
    { text: "Brace through 2 baddies with a third Shell Jab, 4 times", event: "multiHit", match: { ability: "shellJab", combo: "brace" }, count: 4 },
    { text: "Roll through 14 baddies", event: "hit", match: { ability: "shellRoll" }, count: 14 },
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
