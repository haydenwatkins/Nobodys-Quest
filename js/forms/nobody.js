/* ============================================================
   NOBODY — the form you start as. A little blank someone.
   ============================================================ */

"use strict";

registerForm({
  id: "nobody",
  name: "Nobody",
  icon: "👤",
  tagline: "A little blank someone with a big future.",
  start: true,                 // the only form that starts unlocked

  speed: 80,
  hearts: 3,
  slots: 2,
  passive: { id: "improviser", name: "Improviser",
    description: "Borrowed abilities gain extra reach, speed, or control based on their style." },

  basic: "slap",
  abilities: [
    { id: "cartwheel", level: 2 },   // unlocks when Nobody hits level 2
  ],

  quests: [
    { text: "Slap 10 baddies", event: "hit", match: { ability: "slap" }, count: 10 },
    { text: "Read a signpost", event: "sign", count: 1 },
    { text: "Defeat 15 baddies (any way you like!)", event: "kill", count: 15 },
    { text: "Crash into 6 baddies with Cartwheel", event: "hit", match: { ability: "cartwheel" }, count: 6 },
  ],

  sprite: {
    palette: {
      k: "#1a1c2c",   // outline
      w: "#f4f4f4",   // chalk-white body
      s: "#94b0c2",   // shading
    },
    frames: [
      [ // frame 1 — standing
        "....kkkk....",
        "..kkwwwwkk..",
        ".kwwwwwwwwk.",
        ".kwwwwwwwwk.",
        ".kwkkwwkkwk.",
        ".kwkkwwkkwk.",
        ".kwwwwwwwwk.",
        "..kwwsswwk..",
        "..kkwwwwkk..",
        "...kwwwwk...",
        "..kwwwwwwk..",
        "..kswwwwsk..",
        "...kw..wk...",
        "...kk..kk...",
      ],
      [ // frame 2 — walking
        "....kkkk....",
        "..kkwwwwkk..",
        ".kwwwwwwwwk.",
        ".kwwwwwwwwk.",
        ".kwkkwwkkwk.",
        ".kwkkwwkkwk.",
        ".kwwwwwwwwk.",
        "..kwwsswwk..",
        "..kkwwwwkk..",
        "...kwwwwk...",
        "..kwwwwwwk..",
        "..kswwwwsk..",
        "..kw....wk..",
        "..kk....kk..",
      ],
    ],
  },
});
