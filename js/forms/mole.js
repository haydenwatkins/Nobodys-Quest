/* ============================================================
   MOLE — disappear under danger, choose the landing, erupt.
   ============================================================ */

"use strict";

registerForm({
  id: "mole",
  name: "Tunneltuft",
  icon: "🐹",
  tagline: "A soft-furred tunnel scout who listens for lost roads beneath the roots.",

  speed: 75,
  hearts: 6,
  slots: 2,
  passive: { id: "aftershock", name: "Aftershock",
    description: "Area abilities and dash landings echo as delayed stunning tremors." },

  basic: "drillTap",
  abilities: [
    { id: "burrowBlitz", level: 1 },
    { id: "faultLine", level: 2 },
  ],

  unlock: { type: "challenge", hint: "Outdig Bram, Tunnelwarden", requirements: [
    { type: "item", item: "mole-crown", hint: "Win the Copper Root Crown" },
    { type: "formLevel", form: "frog", level: 3 },
  ] },

  quests: [
    { text: "Land 18 Drill Taps", event: "hit", match: { ability: "drillTap" }, count: 18 },
    { text: "Stun 3 baddies with a third Drill Tap", event: "multiHit", match: { ability: "drillTap", combo: "eruption", hits: { gte: 3 } }, count: 3 },
    { text: "Erupt into 12 baddies with Burrow Blitz", event: "hit", match: { ability: "burrowBlitz" }, count: 12 },
    { text: "Rip one Fault Line through 3 baddies, twice", event: "multiHit", match: { ability: "faultLine", hits: { gte: 3 } }, count: 2 },
  ],

  sprite: {
    palette: { k: "#1a1c2c", b: "#6b4a2b", t: "#8a6538", s: "#c09858", p: "#ef7d57", w: "#f4f4f4", y: "#ffcd75" },
    frames: [
      [
        ".....kkkkkk.......",
        "...kkttttttkk.....",
        "..kttssssssttk....",
        ".kttskwsswksttk...",
        ".kttsskkkksssttk..",
        "ktttssppsssttttk..",
        "kbbbttttttttbbbk..",
        ".kbbttttttttbbk...",
        "..kkttttttttkk....",
        "...ktttyytttk.....",
        "...kbbbyybbbk.....",
        "..kbbbbbbbbbbk....",
        ".kbbbkkbbkkbbbk....",
        "..kkk......kkk....",
        ".yyy........yyy....",
        "yyyyy......yyyyy...",
      ],
      [
        "......kkkkkk......",
        "....kkttttttkk....",
        "...kttssssssttk...",
        "..kttskwsswksttk..",
        "..kttsskkkksssttk.",
        ".ktttssppsssttttk.",
        ".kbbbttttttttbbbk.",
        "..kbbttttttttbbk..",
        "...kkttttttttkk...",
        "....ktttyytttk....",
        "....kbbbyybbbk....",
        "...kbbbbbbbbbbk...",
        "..kbbbkkbbkkbbbk..",
        "...kkk......kkk...",
        "yyyy..........yyyy",
        ".yyy..........yyy..",
      ],
    ],
  },
});
