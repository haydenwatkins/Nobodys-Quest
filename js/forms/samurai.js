/* SAMURAI — short deliberate cuts build to a room-clearing draw. */
"use strict";

registerForm({
  id: "samurai", name: "Samurai", icon: "⚔️",
  tagline: "Finds the quiet beat inside a crowded fight, then cuts the moon out of it.",
  speed: 104, hearts: 4, slots: 2,
  passive: { id: "flowingDraw", name: "Flowing Draw",
    description: "Moving melee hits slide you through the cut with extra reach." },
  basic: "quickdraw",
  abilities: [{ id: "flashStep", level: 1 }, { id: "crescentDraw", level: 2 }],
  unlock: { type: "challenge", hint: "Finish the Paper Ronin's unfinished duel", requirements: [
    { type: "item", item: "paper-crane", hint: "Win the Paper Crane" },
    { type: "formLevel", form: "riftblade", level: 4 },
  ] },
  quests: [
    { text: "Land 24 Quickdraw cuts", event: "hit", match: { ability: "quickdraw" }, count: 24 },
    { text: "Catch 3 baddies in a third draw, 3 times", event: "multiHit", match: { ability: "quickdraw", combo: "draw-finish", hits: { gte: 3 } }, count: 3 },
    { text: "Flash Step through 15 baddies", event: "hit", match: { ability: "flashStep" }, count: 15 },
    { text: "Crescent Draw through 4 baddies at once", event: "multiHit", match: { ability: "crescentDraw", hits: { gte: 4 } }, count: 1 },
  ],
  sprite: {
    palette: { k: "#1a1c2c", w: "#f4f4f4", s: "#94b0c2", r: "#b13e53", d: "#2d1b2e", y: "#ffcd75", c: "#73eff7" },
    frames: [[
      "......yyyy......", "....yykkkkyy....", "...kkddddddkk...", "..kdwwsssswwdk..",
      "..kdwskkkkswdk..", "...kwwk..kwwk...", "..kkwwwwwwwwkk..", ".krrkkwwwwkkrrk.",
      "krrrrkkkkkkrrrrk", ".krrrddddddrrrk.", "..krrddddddrrk..", "...kkddddddkk...",
      "....kddkkddk....", "...kkdk..kdkk...", "..ccc......ccc..", ".ccccc....ccccc.",
    ], [
      ".....yyyy.......", "...yykkkkyy.....", "..kkddddddkk....", ".kdwwsssswwdk....",
      ".kdwskkkkswdk....", "..kwwk..kwwk....", ".kkwwwwwwwwkk....", "krrkkwwwwkkrrk...",
      ".krrrrkkkkkkrrrrk", "..krrrddddddrrrk", "...krrddddddrrk.", "....kkddddddkk..",
      ".....kddkkddk...", "....kkdk..kdkk..", ".ccc........ccc.", "ccccc......ccccc",
    ]],
  },
});
