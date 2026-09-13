/* BELLKEEPER — rewards switching between ability styles. */
"use strict";

registerForm({
  id: "bellkeeper", name: "Bellkeeper", icon: "🔔",
  tagline: "A wandering musician who makes every different kind of move answer the last one.",
  speed: 78, hearts: 6, slots: 2,
  passive: { id: "resonance", name: "Resonance",
    description: "Following one ability style with another releases a harmless shockwave that shoves nearby enemies." },
  basic: "handbell",
  abilities: [{ id: "echoOrb", level: 1 }, { id: "silenceRing", level: 2 }],
  unlock: { type: "challenge", hint: "Answer the Walking Belfry across Frostbell Tundra", requirements: [
    { type: "item", item: "trophy-bell-titan", hint: "Awaken the Echo Mark" },
    { type: "formLevel", form: "weaver", level: 2 },
  ] },
  quests: [
    { text: "Ring 20 baddies with Handbell", event: "hit", match: { ability: "handbell" }, count: 20 },
    { text: "Bounce Echo Orb through 3 baddies, three times", event: "multiHit", match: { ability: "echoOrb", hits: { gte: 3 } }, count: 3 },
    { text: "Silence 4 baddies at once, twice", event: "multiHit", match: { ability: "silenceRing", hits: { gte: 4 } }, count: 2 },
    { text: "Break 8 Light wards", event: "wardBreak", match: { damageType: "light" }, count: 8 },
  ],
  sprite: {
    palette: { k: "#1a1c2c", y: "#ffcd75", w: "#fff3c2", b: "#8a6538", c: "#73eff7", s: "#94b0c2", p: "#8153c1" },
    frames: [[
      ".....yyyyyy.....", "....ykkkkkky....", "...ykwwsswwky...", "...kwc....cwk...",
      "..kkwwwwwwwwkk..", ".kyykkwwwwkkyyk.", "kyyyyykkkkyyyyyk", ".kyyybbbbbbbyyyk.",
      "..kybbbbbbbbyk..", "...kkbbbbbbkk...", "....kbbkkbbk....", "...kkbk..kbkk...",
      "..kppk....kppk..", ".kppk......kppk.", "..kk........kk..", "................",
    ], [
      "......yyyyyy....", ".....ykkkkkky...", "....ykwwsswwky..", "....kwc....cwk..",
      "...kkwwwwwwwwkk.", "..kyykkwwwwkkyyk", ".kyyyyykkkkyyyyyk", "..kyyybbbbbbbyyyk",
      "...kybbbbbbbbyk.", "....kkbbbbbbkk..", "...kkbbkkbbk....", "..kkkbk..kbkk...",
      ".kpppk....kppk...", "kpppk......kppk..", ".kk..........kk..", "................",
    ]],
  },
});
