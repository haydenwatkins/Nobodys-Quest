/* ============================================================
   RAT — small, fast, and full of germs.

   BEN: this is the best file to COPY when making a new form!
   It shows everything: stats, abilities, quests, unlock rule,
   and a sprite. Copy it into a new file (like js/forms/wizard.js),
   change the id and everything else, then add ONE line to
   index.html next to the other forms. That's it!
   ============================================================ */

"use strict";

registerForm({
  id: "wizard",                      // lowercase, no spaces
  name: "Wizard",
  icon: "🧙",
  tagline: "Old, wise, and slightly explosive.",


  speed: 70,                  // zoomy! (limit is 140)
  hearts: 3,                   // but fragile
  slots: 2,

  basic: "curse",               // A button — poisons enemies!
  abilities: [
    { id: "shadowBolt", level: 1 },

  ],

  // How do you earn the Rat? Get Nobody to level 2.
  unlock: { type: "stars", stars: "5", level: 2 },

  quests: [
    { text: "Defeat 10 baddies as a magic user", event: "kill", count: 10 },
    { text: "Break 2 wards", event: "wardBreak", count: 2 },
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
