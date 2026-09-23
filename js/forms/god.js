/* ============================================================
   GOD - the final form, earned by learning every path and mastering six.
   ============================================================ */

"use strict";

registerForm({
  id: "god",
  name: "God",
  icon: "☀️",
  tagline: "A blazing final form for players who learned every path and mastered their favorites.",

  speed: 100,
  hearts: 6,
  slots: 2,
  passive: { id: "providence", name: "Providence",
    description: "Once per boss phase or ordinary room, a lethal hit leaves you at one heart and attempts to move you out of danger. Switching forms does not recharge it." },
  breaksAnyWard: true,
  aura: {
    ring: "#b13e53",
    spark: "#ffcd75",
    void: "#8153c1",
  },

  basic: "divineSpark",
  abilities: [
    { id: "judgmentRing", level: 1 },
    { id: "voidStar", level: 2 },
  ],

  unlock: { type: "challenge", maintain: true, hint: "Learn every form, master six favorites, then pass the final exam", requirements: [
    { type: "finalExamMastery" },
    { type: "item", item: "god-spark", hint: "Defeat the God of Every Form" },
  ] },

  quests: [
    { text: "Hit 12 baddies with Divine Spark", event: "hit", match: { ability: "divineSpark" }, count: 12 },
    { text: "Break 4 wards after ascending", event: "wardBreak", count: 4 },
    { text: "Defeat 10 baddies with Light damage", event: "kill", match: { damageType: "light" }, count: 10 },
    { text: "Defeat 6 baddies with Dark damage", event: "kill", match: { damageType: "dark" }, count: 6 },
  ],

  sprite: {
    palette: {
      k: "#1a1c2c",   // outline
      w: "#f4f4f4",   // wool
      s: "#94b0c2",   // wool shade
      y: "#ffcd75",   // crown gold
      o: "#ef7d57",   // ritual glow
      p: "#8153c1",   // void purple
      v: "#3b2f73",   // deep void
      b: "#41a6f6",   // crown eye
      r: "#b13e53",   // red cloak
      d: "#2d1b2e",   // dark fleece
      c: "#c45d4f",   // cloak shade
    },
    frames: [
      [
        "............yyyy............",
        ".........yyb....byy.........",
        ".......ww...kkkk...ww.......",
        "......w....kddddk....w......",
        "..........kkwwwwkk..........",
        ".........kkwddddwkk.........",
        "........kkwddbbddwkk........",
        ".....rrrkkdvvvvvvdkkrrr.....",
        "...rrrkkwwrrccccrrwwkkrrr...",
        "..rrkksswrrccpppccrrwsskrr..",
        ".rrkkwwwrrppvvvvpprrwwwkkrr.",
        "rrkksswwrrpppvvppprrwwsskkrr",
        ".rrkksswwrrrrvvvvrrrrwwsskk.",
        "..kkwwwwrrrrrrrrrrrrwwwwkk..",
        "...kkwwwsswwwwwwwwsswwwkk...",
        "....kkwwrrrccccccrrrwwkk....",
        ".....kkwrrrvvvvvvrrrwkk.....",
        "......kkwwrrrrrrrrwwkk......",
        ".......kkkwwwwwwwwkkk.......",
        ".....oooo..kkkkkk..oooo.....",
        "....ooo..............ooo....",
        "...ooo................ooo...",
        "..oo....................oo..",
        ".oo......................oo.",
      ],
      [
        ".........yyb....byy.........",
        ".......ww...kkkk...ww.......",
        ".....w....rrrrrrrr....w.....",
        "............kkkk............",
        ".........kkwwwwwwkk.........",
        ".......kkwwddddddwwkk.......",
        ".....rrrkwdkkkkkkdwkrrr.....",
        "...rrrkkwwrrrrrrrrwwkkrrr...",
        "..rrkkwwrrccccccccrrwwkkrr..",
        ".rrkksswrrccpppppccrrwsskrr.",
        "rrkksswwrrppvvvvpprrwwsskkrr",
        ".kksswwrrrppvvvvppprrwwsskk.",
        "rrkksswwrrrrvvvvrrrrwwsskkrr",
        ".kkwwwwwrrrrrrrrrrrrwwwwwkk.",
        "..kkwwwwsswwwwwwwwsswwwwkk..",
        "...kkwwwrrrrrrrrrrrrwwwkk...",
        "....kkwrrc........crrwkk....",
        ".....kkwrrrrrrrrrrrrwkk.....",
        "....oo..kkwwwwwwwwkk..oo....",
        "...ooo.....kkkkkk.....ooo...",
        "..ooo..................ooo..",
        ".ooo....................ooo.",
        "oo........................oo",
        "o..........................o",
      ],
    ],
  },
});
