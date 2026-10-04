/* ============================================================
   DRAGON — a slow, sturdy master form with wide arcs and costly fire.
   ============================================================ */

"use strict";

registerForm({
  id: "dragon",
  name: "Hearthdrake",
  icon: "🐉",
  tagline: "A sturdy hearth dragon who warms waystations and keeps a little fire for the road.",

  speed: 65,
  hearts: 7,
  slots: 2,
  passive: { id: "unstoppable", name: "Unstoppable",
    description: "Melee abilities sweep wider, reach farther, and throw enemies harder." },

  basic: "tailSweep",
  abilities: [
    { id: "fireBreath", level: 1 },
    { id: "meteor", level: 2 },
  ],

  unlock: { type: "challenge", hint: "Study four earlier shapes and practice an advanced calling", requirements: [
    { type: "previousFormsLevel", level: 3, count: 4 },
    { type: "any", options: [
      { type: "formLevel", form: "alchemist", level: 2 },
      { type: "formLevel", form: "stormcaller", level: 2 },
    ] },
  ] },

  quests: [
    { text: "Land 6 Tail Sweep hits", event: "hit", match: { ability: "tailSweep" }, count: 6 },
    { text: "Tail-sweep 3 baddies at once, twice", event: "multiHit", match: { ability: "tailSweep", hits: { gte: 3 } }, count: 2 },
    { text: "Land 6 Fire Breath hits", event: "hit", match: { ability: "fireBreath" }, count: 6 },
    { text: "Catch 3 baddies in a Meteor, twice", event: "multiHit", match: { ability: "meteor", hits: { gte: 3 } }, count: 2 },
  ],

  sprite: {
    palette: { k: "#1a1c2c", r: "#b13e53", o: "#ef7d57", y: "#ffcd75", g: "#38b764", w: "#f4f4f4", d: "#5d275d" },
    frames: [
      [
        "y....kkkk....y..",
        ".y..krrrrk..y...",
        "..ykkrrrrkky....",
        "...krrwwrrk.....",
        "..kkrrkkrrkk....",
        ".kdkrrrrrrkdk....",
        "kddkrooorrrkdk..",
        "kk.krrrrrrk.kk..",
        "...krryyrrk.....",
        "..kkrrrrrrkk....",
        ".krrkkrrkkrrk...",
        "krrk.krrk.krrk..",
        "kkk..krrk..kkk..",
        ".....krrk.......",
        "....kk..kk......",
      ],
      [
        ".y....kkkk....y.",
        "..y..krrrrk..y..",
        "...ykkrrrrkky...",
        "....krrwwrrk....",
        "...kkrrkkrrkk...",
        "..kdkrrrrrrkdk..",
        ".kddkrooorrrkdk.",
        ".kk.krrrrrrk.kk.",
        "....krryyrrk....",
        "...kkrrrrrrkk...",
        "..krrkkrrkkrrk..",
        ".krrk.krrk.krrk.",
        ".kkk..krrk..kkk.",
        ".....krrk.......",
        "...kk....kk.....",
      ],
    ],
  },
});
