/* ============================================================
   JESTER — count the cards: every third throw finds two encores.
   ============================================================ */

"use strict";

registerForm({
  id: "jester",
  name: "Pocket Trouper",
  icon: "🃏",
  tagline: "A travelling player with a pocket of cards and a welcome for every roadside audience.",

  speed: 90,
  hearts: 4,
  slots: 2,
  passive: { id: "trickTrajectory", name: "Trick Trajectory",
    description: "Projectile abilities ricochet to one extra target." },

  basic: "wildCard",
  abilities: [
    { id: "punchlinePie", level: 1 },
    { id: "encore", level: 2 },
  ],

  unlock: { type: "challenge", hint: "Share the stage with Tansy, Caravan Star", requirements: [
    { type: "item", item: "jester-bell", hint: "Win the Curtain Bell" },
    { type: "any", options: [
      { type: "formLevel", form: "alchemist", level: 3 },
      { type: "formLevel", form: "riftblade", level: 3 },
    ] },
  ] },

  quests: [
    { text: "Land 6 Wild Card hits", event: "hit", match: { ability: "wildCard" }, count: 6 },
    { text: "Land 4 ricochet follow-ups", event: "hit", match: { ability: "wildCard", combo: "ricochet" }, count: 4 },
    { text: "Land 6 Punchline Pie hits", event: "hit", match: { ability: "punchlinePie" }, count: 6 },
    { text: "Land 8 Encore hits", event: "hit", match: { ability: "encore" }, count: 8 },
  ],

  sprite: {
    palette: { k: "#1a1c2c", r: "#b13e53", b: "#3b5dc9", y: "#ffcd75", w: "#f4f4f4", s: "#94b0c2", p: "#8153c1" },
    frames: [
      [
        "..rrr........bbb..",
        ".ryyr......byyb...",
        "rryyrkkkkkbyybb...",
        ".rrkkwwswwkkbb....",
        "...kwskkkswk......",
        "...kwwp.pwwk......",
        "..kkwwwwwwwkk.....",
        ".krrkwwwwwkbbk.....",
        "krrrkkwwwkkbbbk...",
        ".krrrykkkybbbk....",
        "..krrryyybbbk.....",
        "...krryyybbk......",
        "..kkrryyybbkk.....",
        ".krrkk...kkbbk.....",
        ".kkk.......kkk.....",
        "..y.........y......",
        ".yyy.......yyy.....",
        "yyyyy.....yyyyy....",
      ],
      [
        ".rrr........bbb...",
        "ryyr......byyb....",
        ".ryyrkkkkkbyybb....",
        "..rrkkwwswwkkbb....",
        "....kwskkkswk.......",
        "....kwwp.pwwk.......",
        "...kkwwwwwwwkk......",
        "..krrkwwwwwkbbk.....",
        ".krrrkkwwwkkbbbk....",
        "..krrrykkkybbbk.....",
        "...krrryyybbbk......",
        "....krryyybbk.......",
        "...kkrryyybbkk......",
        "..krrkk...kkbbk.....",
        "..kkk.......kkk.....",
        ".y...........y......",
        "yyy.........yyy.....",
        ".yyy.......yyy......",
      ],
    ],
  },
});
