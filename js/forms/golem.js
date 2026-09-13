/* GOLEM — builds cover by casting area abilities. */
"use strict";

registerForm({
  id: "golem", name: "Golem", icon: "🗿",
  tagline: "A walking fortress whose loudest spells leave something useful standing behind.",
  speed: 58, hearts: 8, slots: 2,
  passive: { id: "masonry", name: "Masonry",
    description: "Area abilities raise a short-lived stone screen that blocks enemy projectiles but never your own." },
  basic: "stoneKnuckle",
  abilities: [{ id: "rampartPulse", level: 1 }, { id: "rollingMonolith", level: 2 }],
  unlock: { type: "challenge", hint: "Climb the Old Mason in the Hanging Gardens", requirements: [
    { type: "item", item: "trophy-old-mason", hint: "Awaken the Stone Mark" },
    { type: "formLevel", form: "griffin", level: 2 },
  ] },
  quests: [
    { text: "Hit 24 baddies with Stone Knuckle", event: "hit", match: { ability: "stoneKnuckle" }, count: 24 },
    { text: "Hit 18 baddies with Rampart Pulse", event: "hit", match: { ability: "rampartPulse" }, count: 18 },
    { text: "Roll Monolith through 3 baddies, three times", event: "multiHit", match: { ability: "rollingMonolith", hits: { gte: 3 } }, count: 3 },
    { text: "Break 8 Blunt wards", event: "wardBreak", match: { damageType: "blunt" }, count: 8 },
  ],
  sprite: {
    palette: { k: "#1a1c2c", s: "#6b6f70", l: "#94b0c2", y: "#ffcd75", m: "#38b764", d: "#4b4f52", b: "#8a6538" },
    frames: [[
      "....kksssskk....", "...ksllllllsk...", "..ksllkkkkllsk..", "..kslky..yklsk..",
      ".kkssllllllsskk.", "kssskssssssksssk", "kssskmmmmmmksssk", ".ksskmmkkmmkssk.",
      "..kssmmmmmmssk..", "...ksssssssssk...", "..kkdddssdddkk..", ".kddddkssskddddk.",
      "kdddddk..kdddddk", ".kkdddk..kdddkk.", "..kbbb....bbbk..", ".bbbb......bbbb.",
    ], [
      "...kksssskk.....", "..ksllllllsk....", ".ksllkkkkllsk....", ".kslky..yklsk....",
      "kkssllllllsskk...", "ssskssssssksssk...", "ssskmmmmmmksssk...", "ksskmmkkmmkssk....",
      ".kssmmmmmmssk.....", "..ksssssssssk.....", ".kkdddssdddkk.....", "kddddkssskddddk...",
      "dddddk..kdddddk...", "kkdddk..kdddkk....", ".kbbb....bbbk.....", "bbbb......bbbb....",
    ]],
  },
});
