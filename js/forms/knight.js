/* ============================================================
   KNIGHT — slow, shiny, and very hard to knock over.
   Unlocked by finding the Knight's Crest (it's in the dungeon...)
   ============================================================ */

"use strict";

registerForm({
  id: "knight",
  name: "Knight",
  icon: "🛡️",
  tagline: "Clank clank clank. Big sword, bigger heart(s).",

  speed: 60,                   // slow (the lowest allowed is 40)...
  hearts: 5,                   // ...but SO tanky
  slots: 2,

  basic: "slash",
  abilities: [
    { id: "shieldBash", level: 1 },
    { id: "spinSlash", level: 2 },
  ],

  // Unlocked by TREASURE, not levels — find the Knight's Crest!
  unlock: { type: "item", item: "knights-crest" },

  quests: [
    { text: "Break 3 wards (any damage type)", event: "wardBreak", count: 3 },
    { text: "Hit 3 baddies with ONE swing", event: "multiHit", match: { hits: { gte: 3 } }, count: 1 },
    { text: "Defeat 10 baddies with Sharp damage", event: "kill", match: { damageType: "sharp" }, count: 10 },
  ],

  sprite: {
    palette: {
      k: "#1a1c2c",   // outline
      s: "#94b0c2",   // shiny steel
      d: "#566c86",   // dark steel
      r: "#b13e53",   // plume
      y: "#ffcd75",   // gold trim
    },
    frames: [
      [ // frame 1
        ".....rr.....",
        "....krrk....",
        "...kssssk...",
        "..kssssssk..",
        "..kskksksk..",
        "..kssssssk..",
        "...kyyyyk...",
        "..kddddddk..",
        ".ksddddddsk.",
        ".ksddyyddsk.",
        ".kkddddddkk.",
        "..kddddddk..",
        "...kdkkdk...",
        "...kd..dk...",
        "...kk..kk...",
      ],
      [ // frame 2 — marching
        ".....rr.....",
        "....krrk....",
        "...kssssk...",
        "..kssssssk..",
        "..kskksksk..",
        "..kssssssk..",
        "...kyyyyk...",
        "..kddddddk..",
        ".ksddddddsk.",
        ".ksddyyddsk.",
        ".kkddddddkk.",
        "..kddddddk..",
        "..kdk..kdk..",
        "..kd....dk..",
        "..kk....kk..",
      ],
    ],
  },
});
