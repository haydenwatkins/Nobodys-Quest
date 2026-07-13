/* ============================================================
   VAMPIRE — aggression fills the chalice; five bites heal one heart.
   ============================================================ */

"use strict";

registerForm({
  id: "vampire",
  name: "Vampire",
  icon: "🧛",
  tagline: "Polite, relentless, and only one good combo away from feeling better.",

  speed: 105,
  hearts: 3,
  slots: 2,

  basic: "bloodBite",
  abilities: [
    { id: "crimsonWaltz", level: 1 },
    { id: "bloodMoon", level: 2 },
  ],

  unlock: { type: "challenge", hint: "Survive Countess Carmine's midnight recital", requirements: [
    { type: "item", item: "crimson-seal", hint: "Win the Crimson Seal" },
    { type: "formLevel", form: "wizard", level: 3 },
  ] },

  quests: [
    { text: "Bite 20 baddies", event: "hit", match: { ability: "bloodBite" }, count: 20 },
    { text: "Drain back 3 hearts", event: "selfHeal", match: { ability: "bloodBite" }, count: 3 },
    { text: "Waltz through 12 baddies", event: "hit", match: { ability: "crimsonWaltz" }, count: 12 },
    { text: "Catch 3 baddies under one Blood Moon, twice", event: "multiHit", match: { ability: "bloodMoon", hits: { gte: 3 } }, count: 2 },
  ],

  sprite: {
    palette: { k: "#1a1c2c", d: "#2d1b2e", v: "#5d275d", r: "#b13e53", c: "#ef7d57", w: "#f4f4f4", s: "#94b0c2" },
    frames: [
      [
        "..kk..........kk..",
        ".kddk........kddk.",
        "kddddkkkkkkkddddk.",
        ".kddkwsssswkdddk..",
        "..kkwskkkkswkk...",
        "...kwsk..kswk....",
        "...kwwkrrkwwk....",
        "..kkwwwwwwwwkk...",
        ".kvvkkwwwwkkvvk...",
        "kvvvvrkkkkrvvvvk..",
        "kvvrrrkkkkrrrvvk..",
        ".kvrrvvvvvvrrvk...",
        "..krrvvvvvvrrk....",
        "...krrvvvvrrk.....",
        "....krv..vrk......",
        "...kkk....kkk.....",
        "..kddk....kddk....",
        ".kddk......kddk...",
      ],
      [
        ".kk..........kk...",
        "kddk........kddk..",
        ".kddddkkkkkkkddddk",
        "..kddkwsssswkdddk.",
        "...kkwskkkkswkk...",
        "....kwsk..kswk....",
        "....kwwkrrkwwk....",
        "...kkwwwwwwwwkk...",
        "..kvvkkwwwwkkvvk..",
        ".kvvvvrkkkkrvvvvk.",
        ".kvvrrrkkkkrrrvvk.",
        "..kvrrvvvvvvrrvk..",
        "...krrvvvvvvrrk...",
        "....krrvvvvrrk....",
        ".....krv..vrk.....",
        "....kkk....kkk....",
        "...kddk....kddk...",
        "..kddk......kddk..",
      ],
    ],
  },
});
