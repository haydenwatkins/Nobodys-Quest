/* ASTRONOMER — align every fourth needle and collapse crowds inward. */
"use strict";

registerForm({
  id: "astronomer", name: "Astronomer", icon: "🔭",
  tagline: "Charts six impossible stars and politely asks gravity to tidy the battlefield.",
  speed: 86, hearts: 3, slots: 2,
  passive: { id: "gravityTouch", name: "Gravity Touch",
    description: "Area bursts and explosions draw enemies toward their center." },
  basic: "starNeedle",
  abilities: [{ id: "constellation", level: 1 }, { id: "gravityWell", level: 2 }],
  unlock: { type: "challenge", hint: "Correct Professor Perihelion's orbit", requirements: [
    { type: "item", item: "orrery-key", hint: "Win the Orrery Key" },
    { type: "formLevel", form: "stormcaller", level: 4 },
  ] },
  quests: [
    { text: "Land 24 Star Needles", event: "hit", match: { ability: "starNeedle" }, count: 24 },
    { text: "Pierce 2 baddies with one aligned needle, 4 times", event: "multiHit", match: { ability: "starNeedle", hits: { gte: 2 } }, count: 4 },
    { text: "Map 18 baddies with Constellation", event: "hit", match: { ability: "constellation" }, count: 18 },
    { text: "Pull 4 baddies into one Gravity Well, twice", event: "multiHit", match: { ability: "gravityWell", hits: { gte: 4 } }, count: 2 },
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
