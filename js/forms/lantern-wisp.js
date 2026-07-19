/* LANTERN WISP — leaves pockets of safety in projectile-heavy fights. */
"use strict";

registerForm({
  id: "lanternWisp", name: "Lantern Wisp", icon: "🏮",
  tagline: "A brave little light that carries its own safe place through even the worst storm.",
  speed: 108, hearts: 3, slots: 2,
  passive: { id: "safeLight", name: "Safe Light",
    description: "Area abilities and dash landings leave brief lantern circles that swallow hostile projectiles." },
  basic: "wickLash",
  abilities: [{ id: "ghostlight", level: 1 }, { id: "lanternDrift", level: 2 }],
  unlock: { type: "challenge", hint: "Find the warm eye inside Stormspine's storm", requirements: [
    { type: "item", item: "trophy-lantern-keeper", hint: "Awaken the Lantern Mark" },
    { type: "formLevel", form: "bellkeeper", level: 2 },
  ] },
  quests: [
    { text: "Lash 22 baddies with Wick Lash", event: "hit", match: { ability: "wickLash" }, count: 22 },
    { text: "Light up 18 baddies with Ghostlight", event: "hit", match: { ability: "ghostlight" }, count: 18 },
    { text: "Land Lantern Drift on 12 baddies", event: "hit", match: { ability: "lanternDrift" }, count: 12 },
    { text: "Defeat 10 baddies with Light damage", event: "kill", match: { damageType: "light" }, count: 10 },
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
