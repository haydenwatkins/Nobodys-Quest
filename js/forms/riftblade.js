/* ============================================================
   RIFTBLADE — a mobile spell-sword earned in the Riftblade Trial.
   Throw the Returning Star, move to bend its path home, then dash
   through the opening and finish a three-beat melee sequence.
   ============================================================ */

"use strict";

registerForm({
  id: "riftblade",
  name: "Riftblade",
  icon: "🌀",
  tagline: "Throw the horizon, chase it down, and cut your way back out.",

  speed: 110,
  hearts: 4,
  slots: 2,

  basic: "riftCut",
  abilities: [
    { id: "riftRush", level: 1 },
    { id: "returningStar", level: 2 },
  ],

  // The Riftblade Adept drops this sigil. The boss demonstrates the form's
  // dash-and-return rhythm before the player is allowed to equip it.
  unlock: {
    type: "item", item: "riftblade-sigil",
    hint: "Defeat the Riftblade Adept beyond Greenfield's 18-star east gate",
  },

  quests: [
    { text: "Land 18 flowing Rift Cuts", event: "hit", match: { ability: "riftCut" }, count: 18 },
    { text: "Catch 3 baddies in one wide third cut, twice", event: "multiHit", match: { ability: "riftCut", combo: "finisher", hits: { gte: 3 } }, count: 2 },
    { text: "Rush through 12 baddies", event: "hit", match: { ability: "riftRush" }, count: 12 },
    { text: "Hit 16 baddies with the Returning Star", event: "hit", match: { ability: "returningStar" }, count: 16 },
  ],

  sprite: {
    palette: {
      k: "#1a1c2c", v: "#3b2f73", p: "#8153c1", c: "#73eff7",
      b: "#41a6f6", w: "#f4f4f4", s: "#94b0c2", y: "#ffcd75",
      r: "#b13e53",
    },
    frames: [
      [
        "......c....c......",
        ".....cb....bc.....",
        "...yyckkkkkkcyy...",
        "....ykwwsswwky....",
        ".....kwc..cwk.....",
        "....kkwwwwwwkk....",
        "...kpkkwsswkkpk...",
        "..kppvkkwwkkvppk..",
        ".kppvvvkkkkvvvppk.",
        "krrpvvvkkkkvvvprrk",
        ".krrppvvvvvvpprrk.",
        "..kkppvvvvppkk....",
        "...kkpvkkvpkk.....",
        "....kkv..vkk......",
        "...cckk..kkcc.....",
        "..cb........bc....",
      ],
      [
        ".....c....c.......",
        "....cb....bc......",
        "..yyckkkkkkcyy....",
        "...ykwwsswwky.....",
        "....kwc..cwk......",
        "...kkwwwwwwkk.....",
        "..kpkkwsswkkpk....",
        ".kppvkkwwkkvppk...",
        "kppvvvkkkkvvvppk..",
        ".krrpvvkkkkvvprrk.",
        "..krrppvvvvpprrk..",
        "...kkppvvvvppkk...",
        "....kkpvkkvpkk....",
        ".....kkv..vkk.....",
        "....cckk..kkcc....",
        "...cb........bc...",
      ],
    ],
  },
});
