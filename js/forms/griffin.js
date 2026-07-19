/* GRIFFIN — moving attacks paint the battlefield with slipstreams. */
"use strict";

registerForm({
  id: "griffin", name: "Griffin", icon: "🦅",
  tagline: "A sky hunter who turns movement itself into a weapon and never lands quietly.",
  speed: 118, hearts: 4, slots: 2,
  passive: { id: "slipstream", name: "Slipstream",
    description: "Attack while moving to leave a tailwind that speeds you and shoves enemies without adding damage." },
  basic: "wingbeat",
  abilities: [{ id: "featherGale", level: 1 }, { id: "skyDive", level: 2 }],
  unlock: { type: "challenge", hint: "Catch the Sky Sovereign over Windscar Canyon", requirements: [
    { type: "item", item: "trophy-sky-sovereign", hint: "Awaken the Sky Mark" },
    { type: "any", options: [{ type: "formLevel", form: "ranger", level: 3 }, { type: "formLevel", form: "samurai", level: 3 }] },
  ] },
  quests: [
    { text: "Strike 20 baddies with Wingbeat", event: "hit", match: { ability: "wingbeat" }, count: 20 },
    { text: "Cut 24 baddies with Feather Gale", event: "hit", match: { ability: "featherGale" }, count: 24 },
    { text: "Land 10 Sky Dives", event: "hit", match: { ability: "skyDive" }, count: 10 },
    { text: "Defeat 12 baddies with Sharp damage", event: "kill", match: { damageType: "sharp" }, count: 12 },
  ],
  sprite: {
    palette: { k: "#1a1c2c", g: "#d8b06a", y: "#ffcd75", w: "#f4f4f4", c: "#73eff7", b: "#8a6538", r: "#ef7d57" },
    frames: [[
      "c..............c", ".c....yyyy....c.", "..c..ykkkk...c..", "...kkygwwgkk....",
      "..kkgywkkwygkk...", ".kgggwwwwwwgggk..", "kggkkwwwwwwkkggk.", "kggggkkkkkkggggk.",
      ".kgggbbbbbggggk..", "..kggbbbbbbggk...", "...kkbrrrrbkk....", "....kbrrrrbk.....",
      "...kkbb..bbkk....", "..cckk....kkcc...", ".ccc........ccc...", "cc............cc..",
    ], [
      "..c..........c...", "c.....yyyy.....c.", ".c...ykkkk...c...", "..kkkygwwgykk....",
      ".kgggywkkwygggk...", "kgggwwwwwwgggk....", ".kggkkwwwwkkggk...", "..kgggkkkkgggk....",
      "...kggbbbbggk.....", "....kgbbbbggk.....", "...kkbrrrrbkk.....", "..kkbbrrrrbbkk....",
      ".cckkbb..bbkkcc...", "ccc.kk....kk.ccc..", "cc............cc..", "..................",
    ]],
  },
});
