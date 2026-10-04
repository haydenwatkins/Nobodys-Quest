/* LANTERN WISP — leaves pockets of safety in projectile-heavy fights. */
"use strict";

registerForm({
  id: "lanternWisp", name: "Wickling", icon: "🏮",
  tagline: "A warm little hearth light who carries a safe place through the mountain storm.",
  speed: 108, hearts: 4, slots: 2,
  passive: { id: "safeLight", name: "Safe Light",
    description: "Area abilities and dash landings leave brief lantern circles that swallow hostile projectiles." },
  basic: "wickLash",
  abilities: [{ id: "ghostlight", level: 1 }, { id: "lanternDrift", level: 2 }],
  unlock: { type: "challenge", hint: "Find the warm eye inside Stormspine's storm", requirements: [
    { type: "item", item: "trophy-lantern-keeper", hint: "Awaken the Lantern Mark" },
    { type: "formLevel", form: "bellkeeper", level: 2 },
  ] },
  quests: [
    { text: "Land 6 Wick Lash hits", event: "hit", match: { ability: "wickLash" }, count: 6 },
    { text: "Land 6 Ghostlight hits", event: "hit", match: { ability: "ghostlight" }, count: 6 },
    { text: "Land 6 Lantern Drift hits", event: "hit", match: { ability: "lanternDrift" }, count: 6 },
    { text: "Defeat 6 baddies with Light damage", event: "kill", match: { damageType: "light" }, count: 6 },
  ],
  sprite: {
    palette: { k: "#1a1c2c", y: "#ffcd75", w: "#fff3c2", o: "#ef7d57", p: "#8153c1", v: "#3b2f73", c: "#73eff7" },
    frames: [[
      "......yyyy......", "....yykkkkyy....", "...ykwwwwwwky...", "..ykwyyyyyywky..",
      "..kwoooooooowk..", ".kkoywwwwwwyokk.", ".kvokwwwwwwkovk.", "kvvvkoooooookvvvk",
      ".kvvvkkkkkkvvvk.", "..kvvvvvvvvvvk..", "...kkvvvvvvkk...", "....kvv..vvk....",
      "...cckk..kkcc...", "..ccc......ccc..", ".cc..........cc.", "c..............c",
    ], [
      ".....yyyy.......", "...yykkkkyy.....", "..ykwwwwwwky....", ".ykwyyyyyywky....",
      ".kwoooooooowk....", "kkoywwwwwwyokk...", "kvokwwwwwwkovk...", "vvvkoooooookvvvk.",
      "kvvvkkkkkkvvvk...", ".kvvvvvvvvvvk.....", "..kkvvvvvvkk......", "...kvv..vvk.......",
      "..cckk..kkcc......", ".ccc......ccc......", "cc..........cc.....", "..................",
    ]],
  },
});
