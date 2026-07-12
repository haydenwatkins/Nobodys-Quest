/* ============================================================
   FROG — long reach, springy movement, and room-filling croaks.
   ============================================================ */

"use strict";

registerForm({
  id: "frog",
  name: "Frog",
  icon: "🐸",
  tagline: "A spring-loaded swamp hero with a tongue longer than good sense.",

  speed: 105,
  hearts: 3,
  slots: 2,

  basic: "tongueLash",
  abilities: [
    { id: "hopCrash", level: 1 },
    { id: "croakBurst", level: 2 },
  ],

  unlock: { type: "challenge", hint: "Build a varied little roster", requirements: [
    { type: "stars", stars: 9 },
    { type: "claimedForms", count: 4 },
  ] },

  quests: [
    { text: "Lash 12 baddies from tongue range", event: "hit", match: { ability: "tongueLash" }, count: 12 },
    { text: "Hop Crash through 8 baddies", event: "hit", match: { ability: "hopCrash" }, count: 8 },
    { text: "Rattle 12 baddies with Croak Burst", event: "hit", match: { ability: "croakBurst" }, count: 12 },
    { text: "Defeat 10 baddies with Blunt damage", event: "kill", match: { damageType: "blunt" }, count: 10 },
  ],

  sprite: {
    palette: { k: "#1a1c2c", g: "#38b764", l: "#a7f070", d: "#257179", w: "#f4f4f4", p: "#ef7d57" },
    frames: [
      [
        "...kk....kk...",
        "..kgk....kgk..",
        ".kglgkkkkglgk.",
        ".kggggggggggk.",
        "kggwggggwgggk",
        "kggkggggkgggk",
        ".kgggppggggk..",
        "..kggggggk...",
        ".kkddddddkk...",
        "kggkddddkggk.",
        "kgggkkkkgggk.",
        ".kkk....kkk..",
      ],
      [
        "..kk....kk....",
        ".kgk....kgk...",
        "kglgkkkkglgk..",
        "kggggggggggk..",
        "kggwggggwgggk.",
        "kggkggggkgggk.",
        ".kgggppggggk..",
        "..kggggggk...",
        "..kkddddddkk..",
        ".kggkddddkggk.",
        "kgggkkkkgggk..",
        "kkkk......kkkk",
      ],
    ],
  },
});
