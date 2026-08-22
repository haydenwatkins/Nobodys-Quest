/* KNIGHT — read the blow, meet it, and answer with an oath. */
"use strict";

registerForm({
  id: "knight", name: "Knight", icon: "🛡️",
  tagline: "Meets danger shield-first, then answers with the one cut it earned.",
  speed: 60, hearts: 7, slots: 2,
  passive: { id: "oathguard", name: "Oathguard",
    description: "Starting a melee art raises a brief frontal guard. Turn aside one blow to ready an Oathblade riposte." },
  basic: "slash",
  abilities: [{ id: "shieldBash", level: 1 }, { id: "spinSlash", level: 2 }],
  unlock: { type: "challenge", hint: "Recover a knight's lost crest", requirements: [
    { type: "item", item: "knights-crest", hint: "Find the Knight's Crest" },
  ] },
  quests: [
    { text: "Turn aside 8 attacks with Oathguard", event: "parry", match: { form: "knight" }, count: 8 },
    { text: "Land 6 golden Oathblade ripostes", event: "hit", match: { ability: "slash", combo: "riposte" }, count: 6 },
    { text: "Stun 10 baddies with Shield Advance", event: "status", match: { ability: "shieldBash", status: "stun" }, count: 10 },
    { text: "Drive back 3 baddies with one Hold the Line, 3 times", event: "multiHit", match: { ability: "spinSlash", combo: "hold-line", hits: { gte: 3 } }, count: 3 },
  ],
  sprite: {
    palette: { k: "#1a1c2c", s: "#94b0c2", w: "#f4f4f4", d: "#566c86", r: "#b13e53", y: "#ffcd75" },
    animations: { idle: [0], walk: [0, 1], attack: [3] },
    frames: [
      [
        ".......rr.......", "......krrk......", ".....kssssk.....", "....kssssssk....",
        "....kskksksk....", "....kssssssk....", ".....kyyyyk.....", "....kddddddk....",
        "...ksddddddsk...", "...ksddyyddsk...", "...kkddddddkk...", "....kddddddk....",
        ".....kdkkdk.....", ".....kd..dk.....", ".....kk..kk.....",
      ],
      [
        ".......rr.......", "......krrk......", ".....kssssk.....", "....kssssssk....",
        "....kskksksk....", "....kssssssk....", ".....kyyyyk.....", "....kddddddk....",
        "...ksddddddsk...", "...ksddyyddsk...", "...kkddddddkk...", "....kddddddk....",
        "....kdk..kdk....", "....kd....dk....", "....kk....kk....",
      ],
      [
        ".......rr.......", "......krrk......", ".....kssssk.....", "....kssssssk....",
        "..kkkkkksksk....", ".ksyyyykssssk...", ".ksyssyksksk....", ".ksyyyykssssk...",
        "..kkkkkkkyyk....", "....kddddddk....", "...ksddyyddsk...", "...kkddddddkk...",
        "....kddddddk....", ".....kdkkdk.....", ".....kk..kk.....",
      ],
      [
        ".....rr.........", "....krrk........", "...kssssk.......", "..kssssssk......",
        "..kskksksk......", "..kssssssk......", "...kyyyyk.......", "..kddddddk......",
        ".ksddddddsk.....", ".ksddyyddskyyyyy", ".kkddddddkkyssss", "..kddddddk......",
        "...kdkkdk.......", "...kd..dk.......", "...kk..kk.......",
      ],
    ],
  },
});
