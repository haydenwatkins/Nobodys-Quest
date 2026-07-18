/* ============================================================
   STORMCALLER — chains lightning through crowds and controls space.
   ============================================================ */

"use strict";

registerForm({
  id: "stormcaller",
  name: "Stormcaller",
  icon: "🌩️",
  tagline: "Carries thunder in both hands and absolutely no umbrella.",

  speed: 85,
  hearts: 3,
  slots: 2,
  passive: { id: "conductor", name: "Conductor",
    description: "Successful hits arc a harmless shock that shoves a nearby enemy." },

  basic: "stormSpark",
  abilities: [
    { id: "chainLightning", level: 1 },
    { id: "thunderclap", level: 2 },
  ],

  unlock: { type: "challenge", hint: "Bring magic or marksmanship to level 3", requirements: [
    { type: "stars", stars: 16 },
    { type: "any", options: [
      { type: "formLevel", form: "wizard", level: 3 },
      { type: "formLevel", form: "ranger", level: 3 },
    ] },
  ] },

  quests: [
    { text: "Zap 12 baddies with Storm Spark", event: "hit", match: { ability: "stormSpark" }, count: 12 },
    { text: "Chain lightning through 15 baddies", event: "hit", match: { ability: "chainLightning" }, count: 15 },
    { text: "Chain across 3 baddies, three times", event: "multiHit", match: { ability: "chainLightning", hits: { gte: 3 } }, count: 3 },
    { text: "Thunderclap 10 nearby baddies", event: "hit", match: { ability: "thunderclap" }, count: 10 },
  ],

  sprite: {
    palette: { k: "#1a1c2c", b: "#41a6f6", l: "#73eff7", w: "#f4f4f4", d: "#333c57", y: "#ffcd75" },
    frames: [
      [
        "..w..www..w...",
        ".wwwwwwwwwww..",
        "..wkkkkkkkw...",
        "...klllllk....",
        "..klklllkkl...",
        "..klyllylk....",
        "...kllllk.....",
        "..kkbbbbkk....",
        ".kbkbbbbkbk...",
        "kllkbbbbkllk..",
        "kk.kddddk.kk..",
        "...kddddk.....",
        "...kd..dk.....",
        "...kk..kk.....",
      ],
      [
        ".w..www..w....",
        "wwwwwwwwwww...",
        ".wkkkkkkkw....",
        "..klllllk.....",
        ".klklllkkl....",
        ".klyllylk.....",
        "..kllllk......",
        ".kkbbbbkk.....",
        "kbkbbbbkbk....",
        "llkbbbbkllk...",
        "k..kddddk..k..",
        "...kddddk.....",
        "..kd....dk....",
        "..kk....kk....",
      ],
    ],
  },
});
