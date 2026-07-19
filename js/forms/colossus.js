/* COLOSSUS — commits to attacks and controls space without damage inflation. */
"use strict";

registerForm({
  id: "colossus", name: "Colossus", icon: "⛰️",
  tagline: "A mountain-sized promise: once a swing begins, nothing in the world can make it flinch.",
  speed: 48, hearts: 8, slots: 2,
  passive: { id: "worldweight", name: "Worldweight",
    description: "Attacking prevents knockback and interruption; melee and area moves push farther but deal normal damage." },
  basic: "pillarFist",
  abilities: [{ id: "earthShoulder", level: 1 }, { id: "worldBreak", level: 2 }],
  unlock: { type: "challenge", hint: "Reach the heartbeat beneath Titan Grave", requirements: [
    { type: "item", item: "trophy-last-worldbearer", hint: "Awaken the Worldheart Mark" },
    { type: "formLevel", form: "lanternWisp", level: 3 },
  ] },
  quests: [
    { text: "Hit 24 baddies with Pillar Fist", event: "hit", match: { ability: "pillarFist" }, count: 24 },
    { text: "Shoulder through 3 baddies, four times", event: "multiHit", match: { ability: "earthShoulder", hits: { gte: 3 } }, count: 4 },
    { text: "Break the world under 4 baddies, three times", event: "multiHit", match: { ability: "worldBreak", hits: { gte: 4 } }, count: 3 },
    { text: "Defeat 16 baddies with Blunt damage", event: "kill", match: { damageType: "blunt" }, count: 16 },
  ],
  sprite: {
    palette: { k: "#1a1c2c", d: "#4b4541", s: "#6f665b", l: "#94836d", o: "#ef7d57", y: "#ffcd75", m: "#38b764" },
    frames: [[
      "....kksssskk....", "...ksllllllsk...", "..ksllkkkkllsk..", ".ksllko..okllsk.",
      "kksssllllllssskk", "kssskssssssksssk", "kssskmmoommksssk", ".ksskmmmmmmkssk.",
      "..ksssoooosssk..", ".kksssssssssskk.", "kdddkksssskkdddk", "kddddksssskddddk",
      "kddddkksskkddddk", ".kdddkk..kkdddk.", "..kllk....kllk..", ".llll......llll.",
    ], [
      "...kksssskk.....", "..ksllllllsk....", ".ksllkkkkllsk....", "ksllko..okllsk...",
      "ksssllllllssskk..", "ssskssssssksssk...", "ssskmmoommksssk...", "ksskmmmmmmkssk....",
      ".ksssoooosssk.....", "kksssssssssskk....", "dddkksssskkdddk...", "ddddksssskddddk...",
      "ddddkksskkddddk...", "kdddkk..kkdddk....", ".kllk....kllk.....", "llll......llll....",
    ]],
  },
});
