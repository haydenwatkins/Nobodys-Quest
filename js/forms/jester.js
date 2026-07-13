/* ============================================================
   JESTER — count the cards: every third throw finds two encores.
   ============================================================ */

"use strict";

registerForm({
  id: "jester",
  name: "Jester",
  icon: "🃏",
  tagline: "Wins every argument by throwing the punchline at somebody else.",

  speed: 90,
  hearts: 3,
  slots: 2,

  basic: "wildCard",
  abilities: [
    { id: "punchlinePie", level: 1 },
    { id: "encore", level: 2 },
  ],

  unlock: { type: "challenge", hint: "Get the last laugh from the Royal Fool", requirements: [
    { type: "item", item: "jester-bell", hint: "Win the Jester Bell" },
    { type: "any", options: [
      { type: "formLevel", form: "alchemist", level: 3 },
      { type: "formLevel", form: "riftblade", level: 3 },
    ] },
  ] },

  quests: [
    { text: "Deal 20 Wild Cards", event: "hit", match: { ability: "wildCard" }, count: 20 },
    { text: "Land 8 ricochet follow-ups", event: "hit", match: { ability: "wildCard", combo: "ricochet" }, count: 8 },
    { text: "Pie 12 baddies", event: "hit", match: { ability: "punchlinePie" }, count: 12 },
    { text: "Hit 18 baddies with Encore", event: "hit", match: { ability: "encore" }, count: 18 },
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
