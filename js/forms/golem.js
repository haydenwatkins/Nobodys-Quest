/* GOLEM — builds cover by casting area abilities. */
"use strict";

registerForm({
  id: "golem", name: "Cobblekin", icon: "🗿",
  tagline: "A patient roadmender whose mossy hands turn loose stones into a way home.",
  speed: 58, hearts: 8, slots: 2,
  passive: { id: "masonry", name: "Masonry",
    description: "Area abilities raise a brief shot-filter field. Enemy shots stop; you, your friends and your shots pass through." },
  basic: "stoneKnuckle",
  abilities: [{ id: "rampartPulse", level: 1 }, { id: "rollingMonolith", level: 2 }],
  unlock: { type: "challenge", hint: "Climb the Old Mason in the Hanging Gardens", requirements: [
    { type: "item", item: "trophy-old-mason", hint: "Awaken the Stone Mark" },
    { type: "formLevel", form: "griffin", level: 2 },
  ] },
  quests: [
    { text: "Land 6 Stone Knuckle hits", event: "hit", match: { ability: "stoneKnuckle" }, count: 6 },
    { text: "Land 6 Rampart Pulse hits", event: "hit", match: { ability: "rampartPulse" }, count: 6 },
    { text: "Roll Monolith through 3 baddies, twice", event: "multiHit", match: { ability: "rollingMonolith", hits: { gte: 3 } }, count: 2 },
    { text: "Break 3 Blunt wards", event: "wardBreak", match: { damageType: "blunt" }, lessonPractice: { mapId: "shattercoast", enemy: "Tide Crabs" }, count: 3 },
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
