/* ============================================================
   ALCHEMIST — careful spacing, impact explosions, and poison clouds.
   ============================================================ */

"use strict";

registerForm({
  id: "alchemist",
  name: "Alchemist",
  icon: "⚗️",
  tagline: "Every bottle is labeled, and every label says probably explosive.",

  speed: 75,
  hearts: 4,
  slots: 2,

  basic: "bottleBonk",
  abilities: [
    { id: "volatileFlask", level: 1 },
    { id: "miasmaFlask", level: 2 },
  ],

  unlock: { type: "level", form: "frog", level: 3 },

  quests: [
    { text: "Bonk 10 baddies with a bottle", event: "hit", match: { ability: "bottleBonk" }, count: 10 },
    { text: "Blast 12 baddies with Volatile Flask", event: "hit", match: { ability: "volatileFlask" }, count: 12 },
    { text: "Catch 3 baddies in one flask blast, twice", event: "multiHit", match: { ability: "volatileFlask", hits: { gte: 3 } }, count: 2 },
    { text: "Infect 10 baddies with Miasma Flask", event: "hit", match: { ability: "miasmaFlask" }, count: 10 },
  ],

  sprite: {
    palette: { k: "#1a1c2c", c: "#94b0c2", d: "#566c86", f: "#e8b796", g: "#38b764", v: "#8153c1", y: "#ffcd75" },
    frames: [
      [
        "......kk......",
        "....kkcckk....",
        "...kcccccck...",
        "..kcckkkkcck..",
        "..kcfyyyyfck..",
        "..kcfkkkkfck..",
        "...kffffffk...",
        "..kkddddddkk..",
        ".kdddkggkdddk.",
        ".kdddkvvkdddk.",
        "..kddkkkkddk..",
        "..kddddddddk..",
        "...kd....dk...",
        "...kk....kk...",
      ],
      [
        ".....kk.......",
        "...kkcckk.....",
        "..kcccccck....",
        ".kcckkkkcck....",
        ".kcfyyyyfck....",
        ".kcfkkkkfck....",
        "..kffffffk....",
        ".kkddddddkk....",
        "kdddkggkdddk..",
        "kdddkvvkdddk..",
        ".kddkkkkddk....",
        "..kddddddddk...",
        "..kd......dk...",
        "..kk......kk...",
      ],
    ],
  },
});
