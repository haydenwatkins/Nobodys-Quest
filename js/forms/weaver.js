/* WEAVER — binds enemies into shared movement puzzles. */
"use strict";

registerForm({
  id: "weaver", name: "Weaver", icon: "🕷️",
  tagline: "A silk duelist who turns scattered crowds into one beautifully tangled problem.",
  speed: 94, hearts: 4, slots: 2,
  passive: { id: "lifeline", name: "Lifeline",
    description: "Successive hits on two different enemies bind and tug them together; bosses gain stagger instead of being dragged." },
  basic: "silkNeedle",
  abilities: [{ id: "stitchline", level: 1 }, { id: "cocoonField", level: 2 }],
  unlock: { type: "challenge", hint: "Follow the silver roads into Rootdeep Hollow", requirements: [
    { type: "item", item: "trophy-silk-matriarch", hint: "Awaken the Thread Mark" },
    { type: "formLevel", form: "golem", level: 2 },
  ] },
  quests: [
    { text: "Pin 24 baddies with Silk Needle", event: "hit", match: { ability: "silkNeedle" }, count: 24 },
    { text: "Stitch 4 baddies in one line, three times", event: "multiHit", match: { ability: "stitchline", hits: { gte: 4 } }, count: 3 },
    { text: "Cocoon 16 baddies", event: "status", match: { status: "stun" }, count: 16 },
    { text: "Defeat 10 baddies with Dark damage", event: "kill", match: { damageType: "dark" }, count: 10 },
  ],
  sprite: {
    palette: { k: "#1a1c2c", p: "#8153c1", v: "#3b2f73", w: "#f4f4f4", s: "#d9a7ff", r: "#b13e53", c: "#73eff7" },
    frames: [[
      "s..s........s..s", ".s..s..vv..s..s.", "..s..vkkkkv..s..", "...kkvwwwwvkk...",
      "..kvwkr..rkwvk..", ".kvvwwwwwwwwvvk.", "kvvvkkwwwwkkvvvk", ".kvvvvkkkkvvvvk.",
      "..kvvppppppvvk..", "...kvppppppvk...", "s..kkppppppkk..s", ".s.kppk..kppk.s.",
      "s..kpk....kpk..s", "..skk......kks..", ".s............s.", "s..............s",
    ], [
      ".s..s......s..s.", "s..s...vv...s..s", ".s...vkkkkv...s.", "..kkvwwwwvkk....",
      ".kvwkr..rkwvk....", "kvvwwwwwwwwvvk...", ".kvvkkwwwwkkvvvk..", "..kvvvkkkkvvvvk...",
      "...kvppppppvvk....", "..kkvppppppvk.....", ".s.kppppppppkk.s...", "s..kppk..kppk..s..",
      ".s.kpk....kpk.s...", "s..kk......kk..s..", "..s..........s....", ".s............s...",
    ]],
  },
});
