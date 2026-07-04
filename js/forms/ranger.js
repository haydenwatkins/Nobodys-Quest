/* ============================================================
   RANGER — hits things from WAY over there.
   The only form (so far!) with Light damage.
   ============================================================ */

"use strict";

registerForm({
  id: "ranger",
  name: "Ranger",
  icon: "🏹",
  tagline: "Why walk up to danger when arrows can do the walking?",

  speed: 85,
  hearts: 3,
  slots: 2,

  basic: "arrow",
  abilities: [
    { id: "luckyArrow", level: 1 },
    { id: "tripleShot", level: 2 },
  ],

  unlock: { type: "level", form: "knight", level: 2 },

  quests: [
    { text: "Hit baddies from far away, 8 times", event: "hit", match: { dist: { gte: 100 } }, count: 8 },
    { text: "Defeat 6 baddies with Light damage", event: "kill", match: { damageType: "light" }, count: 6 },
  ],

  sprite: {
    palette: {
      k: "#1a1c2c",   // outline
      h: "#38b764",   // green hood
      d: "#257179",   // dark green cloak
      f: "#e8b796",   // face
      b: "#6b4a2b",   // bow
    },
    frames: [
      [ // frame 1
        ".....kk.....",
        "....khhk....",
        "...khhhhk...",
        "..khhhhhhk..",
        "..khkffkhk..",
        "..khkffkhk..",
        "...khffhk...",
        "..kddddddk.b",
        ".khdddddhkb.",
        ".khdddddhkb.",
        "..kdddddkb..",
        "..kddddddk..",
        "...kd..dk...",
        "...kk..kk...",
      ],
      [ // frame 2 — striding
        ".....kk.....",
        "....khhk....",
        "...khhhhk...",
        "..khhhhhhk..",
        "..khkffkhk..",
        "..khkffkhk..",
        "...khffhk...",
        "..kddddddk.b",
        ".khdddddhkb.",
        ".khdddddhkb.",
        "..kdddddkb..",
        "..kddddddk..",
        "..kd....dk..",
        "..kk....kk..",
      ],
    ],
  },
});
