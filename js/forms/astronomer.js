/* ASTRONOMER — align every fourth needle and collapse crowds inward. */
"use strict";

registerForm({
  id: "astronomer", name: "Skylens Mapper", icon: "🔭",
  tagline: "Finds homeward paths in the night sky with brass lenses and patient calculations.",
  speed: 86, hearts: 4, slots: 2,
  passive: { id: "gravityTouch", name: "Gravity Touch",
    description: "Area bursts and explosions draw enemies toward their center." },
  basic: "starNeedle",
  abilities: [{ id: "constellation", level: 1 }, { id: "gravityWell", level: 2 }],
  unlock: { type: "challenge", hint: "Trace Nell's quiet orbit", requirements: [
    { type: "item", item: "orrery-key", hint: "Win the Orrery Key" },
    { type: "formLevel", form: "stormcaller", level: 4 },
  ] },
  quests: [
    { text: "Land 6 Star Needles", event: "hit", match: { ability: "starNeedle" }, count: 6 },
    { text: "Pierce 2 baddies with one aligned needle, twice", event: "multiHit", match: { ability: "starNeedle", hits: { gte: 2 } }, count: 2 },
    { text: "Land 6 Constellation hits", event: "hit", match: { ability: "constellation" }, count: 6 },
    { text: "Pull 3 baddies into one Gravity Well, twice", event: "multiHit", match: { ability: "gravityWell", hits: { gte: 3 } }, count: 2 },
  ],
  sprite: {
    palette: { k: "#1a1c2c", v: "#3b2f73", p: "#8153c1", b: "#41a6f6", c: "#73eff7", y: "#ffcd75", w: "#f4f4f4", s: "#94b0c2" },
    frames: [[
      "y.......y.......y", ".c.....c.c.....c.", "...kkkkykkkk....", "..kpvvvvvvvvpk..",
      ".kpvwsssssswvpk.", ".kvwskkkkkkswvk.", "..kwwc....cwwk..", ".kkwwwwwwwwwwkk.",
      "kpvkkwwwwwwkkvpk", "kpvvvkkkkkkvvvpk", ".kpvvvvvvvvvvpk.", "..kpvvvvvvvvpk..",
      "...kkpvkkvpkk...", "....kkv..vkk....", "..ccc......ccc..", ".ccccc....ccccc.",
    ], [
      ".......y.......y.", "c.....c.c.....c..", "..kkkkykkkk......", ".kpvvvvvvvvpk.....",
      "kpvwsssssswvpk....", "kvwskkkkkkswvk....", ".kwwc....cwwk.....", "kkwwwwwwwwwwkk....",
      "pvkkwwwwwwkkvpk...", "pvvvkkkkkkvvvpk...", "kpvvvvvvvvvvpk....", ".kpvvvvvvvvpk.....",
      "..kkpvkkvpkk......", "...kkv..vkk.......", ".ccc........ccc....", "ccccc......ccccc...",
    ]],
  },
});
