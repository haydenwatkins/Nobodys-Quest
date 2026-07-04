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
  id: "rat",
  name: "Rat",
  icon: "🐀",
  tagline: "Small, fast, and absolutely covered in germs.",

  speed: 105,                  // zoomy! (limit is 140)
  hearts: 2,                   // but fragile
  slots: 2,

  basic: "bite",               // A button — poisons enemies!
  abilities: [
    { id: "squeakDash", level: 1 },
    { id: "fester", level: 2 },
  ],

  // How do you earn the Rat? Get Nobody to level 2.
  unlock: { type: "level", form: "nobody", level: 2 },

  quests: [
    { text: "Poison 8 baddies", event: "status", match: { status: "poison" }, count: 8 },
    { text: "Defeat 5 baddies while they're poisoned", event: "kill", match: { poisoned: true }, count: 5 },
  ],

  sprite: {
    palette: {
      k: "#1a1c2c",   // outline
      g: "#94b0c2",   // gray fur
      d: "#566c86",   // darker fur
      p: "#ef7d57",   // pink ears, nose & tail
    },
    frames: [
      [ // frame 1
        "..............",
        "..kk......kk..",
        ".kpgk....kgpk.",
        ".kggkkkkkkggk.",
        "..kggggggggk..",
        "pk.kgkggkgk...",
        ".kpkggggggkk..",
        "..kdggggggdkp.",
        "...kkkkkkkk...",
        "...kk....kk...",
      ],
      [ // frame 2 — scurrying
        "..............",
        "..kk......kk..",
        ".kpgk....kgpk.",
        ".kggkkkkkkggk.",
        "..kggggggggk..",
        ".pkkgkggkgk...",
        "kp.kggggggkk..",
        "..kdggggggdkp.",
        "...kkkkkkkk...",
        "..kk......kk..",
      ],
    ],
  },
});
