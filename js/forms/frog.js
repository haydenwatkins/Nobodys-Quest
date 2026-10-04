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
  hearts: 5,
  slots: 2,
  passive: { id: "elastic", name: "Elastic",
    description: "Melee abilities reach farther and pull enemies in instead of knocking them away." },

  basic: "tongueLash",
  abilities: [
    { id: "hopCrash", level: 1 },
    { id: "croakBurst", level: 2 },
  ],

  unlock: { type: "challenge", hint: "Build a varied little roster", requirements: [
    { type: "stars", stars: 9 },
    { type: "claimedForms", count: 4 },
    { type: "formLevel", form: "ranger", level: 2, openingOnly: true },
  ] },

  quests: [
    { text: "Land 6 Tongue Lash hits", event: "hit", match: { ability: "tongueLash" }, count: 6 },
    { text: "Land 4 Hop Crash hits", event: "hit", match: { ability: "hopCrash" }, count: 4 },
    { text: "Land 6 Croak Burst hits", event: "hit", match: { ability: "croakBurst" }, count: 6 },
    { text: "Defeat 4 baddies with Blunt damage", event: "kill", match: { damageType: "blunt" }, count: 4 },
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
