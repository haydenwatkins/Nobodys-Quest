/* WIZARD — lay a curse, hold the crowd, then collect the debt. */

"use strict";

registerForm({
  id: "wizard",                      // lowercase, no spaces
  name: "Wizard",
  icon: "🧙",
  tagline: "Old, wise, and slightly explosive.",


  speed: 70,                  // zoomy! (limit is 140)
  hearts: 4,                   // long-range power trades away staying power
  slots: 2,
  passive: { id: "hexcraft", name: "Hexcraft",
    description: "Status abilities last longer and shove afflicted enemies harder." },

  basic: "curse",               // A button — poisons enemies!
  abilities: [
    { id: "shadowBolt", level: 1 },
    { id: "dark matter", level: 2 },
  ],

  // Study Rat’s poison lessons before learning to cash them in.
  unlock: { type: "challenge", hint: "Gather experience and study a quick form", requirements: [
    { type: "stars", stars: 5 },
    { type: "formLevel", form: "rat", level: 2 },
  ] },

  quests: [
    { text: "Defeat 10 baddies as a magic user", event: "kill", count: 10 },
    { text: "Break 2 wards", event: "wardBreak", lessonArt: "curse", lessonPractice: { mapId: "sunkenMarsh", enemy: "Shades" }, count: 2 },
    { text: "Hit 8 baddies with Shadow Bolt", event: "hit", match: { ability: "shadowBolt" }, count: 8 },
    { text: "Hit 8 baddies with Dark Matter", event: "hit", match: { ability: "dark matter" }, count: 8 },
  ],

  sprite: {
    palette: {
      a: "#0643b1",
      b: "#94b0c2",
      c: "#ef7d57",
      d: "#1a1c2c",
      e: "#566c86",
    },
    frames: [
    [ //frame 1 - dads floppy hat wizard rat guy
      ".......aaaa...",
      "......aa......",
      ".....aaaa..a..",
      "....aaaaaa....",
      "....bbbbbb....",
      "cd.dbdbbdbd...",
      ".dcdbbbbbbdd..",
      "..debbbbbbedc.",
      "...dddddddd...",
      "...dd....dd...",
    ],
      [ // frame 2 — scurrying
        "...aaaa.......",
      "......aa......",
      "..a..aaaa.....",
      "....aaaaaa....",
      "....bbbbbb....",
      "cd.dbdbbdbd...",
      ".dcdbbbbbbdd..",
      "..debbbbbbedc.",
      "...dddddddd...",
      "...dd....dd...",
      ],
    ],
  },
});
