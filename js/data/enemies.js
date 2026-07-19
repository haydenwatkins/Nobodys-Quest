/* ============================================================
   ENEMIES — the baddies.

   Ben: you can add enemies too! Each one needs:
     id, name, hp, speed, damage
     behavior: "wander" | "chase" | "shooter"
     aggro:    how close (in pixels) before it notices you
     ward:     OPTIONAL shield — { types: ["blunt"], hp: 2 }
               means only BLUNT damage can break its shield!
     sprite:   pixel art, same format as forms

   Then put its letter in a map's legend to spawn it.
   ============================================================ */

"use strict";

/* ---- SLIME — squishy, slow, mostly harmless ---- */
registerEnemy({
  id: "slime",
  name: "Slime",
  hp: 3, speed: 22, damage: 1,
  behavior: "chase", aggro: 70,
  size: 12,
  sprite: {
    palette: { k: "#1a1c2c", g: "#38b764", l: "#a7f070", d: "#257179" },
    frames: [
      [
        "............",
        "...kkkkkk...",
        "..kggggggk..",
        ".kglgglgggk.",
        ".kggggggggk.",
        "kggggggggggk",
        "kdggggggggdk",
        ".kkkkkkkkkk.",
      ],
      [
        "............",
        "............",
        "..kkkkkkkk..",
        ".kglgglgggk.",
        "kggggggggggk",
        "kggggggggggk",
        "kdggggggggdk",
        ".kkkkkkkkkk.",
      ],
    ],
  },
});

/* ---- BAT — fast and flappy ---- */
registerEnemy({
  id: "bat",
  name: "Bat",
  hp: 2, speed: 55, damage: 1,
  behavior: "chase", aggro: 90,
  size: 10,
  sprite: {
    palette: { k: "#1a1c2c", v: "#8153c1", d: "#5d275d" },
    frames: [
      [ // wings up
        "..k........k..",
        ".kvk......kvk.",
        ".kvvk....kvvk.",
        "..kvvkkkkvvk..",
        "...kvvvvvvk...",
        "...kvkvvkvk...",
        "....kdvvdk....",
        ".....kkkk.....",
      ],
      [ // wings down
        "..............",
        "...kkk..kkk...",
        "..kvvvkkvvvk..",
        ".kvvvvvvvvvvk.",
        ".kkvvkvvkvvkk.",
        "...kvvvvvvk...",
        "....kdvvdk....",
        ".....kkkk.....",
      ],
    ],
  },
});

/* ---- BONES — has a BLUNT ward. Smash the skeleton! ---- */
registerEnemy({
  id: "bones",
  name: "Bones",
  hp: 4, speed: 32, damage: 1,
  behavior: "chase", aggro: 85,
  size: 13,
  ward: { types: ["blunt"], hp: 2 },
  sprite: {
    palette: { k: "#1a1c2c", w: "#f4f4f4", s: "#94b0c2" },
    frames: [
      [ // a proper skeleton: skull, ribcage, pelvis, bony legs
        "..kkkkkkkk..",
        ".kwwwwwwwwk.",
        ".kwkkwwkkwk.",
        ".kwkkwwkkwk.",
        ".kwwwwwwwwk.",
        "..kwkwwkwk..",
        "....kwwk....",
        "..kwwwwwwk..",
        "..kwkwwkwk..",
        "..kwwwwwwk..",
        "..kwkwwkwk..",
        "...kwkkwk...",
        "...kw..wk...",
        "...kk..kk...",
      ],
      [
        "..kkkkkkkk..",
        ".kwwwwwwwwk.",
        ".kwkkwwkkwk.",
        ".kwkkwwkkwk.",
        ".kwwwwwwwwk.",
        "..kwkwwkwk..",
        "....kwwk....",
        "..kwwwwwwk..",
        "..kwkwwkwk..",
        "..kwwwwwwk..",
        "..kwkwwkwk..",
        "...kwkkwk...",
        "..kw....wk..",
        "..kk....kk..",
      ],
    ],
  },
});

/* ---- WISP — has a LIGHT ward, and shoots! Spooky. ---- */
registerEnemy({
  id: "wisp",
  name: "Wisp",
  hp: 3, speed: 40, damage: 1,
  behavior: "shooter", aggro: 110, shootEvery: 1.8,
  shotColor: "#8153c1",
  size: 11,
  ward: { types: ["light"], hp: 2 },
  sprite: {
    palette: { k: "#1a1c2c", v: "#8153c1", l: "#b58ee6", w: "#f4f4f4" },
    frames: [
      [
        "...kkkk...",
        "..kvlvvk..",
        ".kvkvvkvk.",
        ".kvvvvvvk.",
        ".klvwwvlk.",
        ".kvvvvvvk.",
        "..kvvvvk..",
        ".kvkvkvk..",
        "..k.k.k...",
        "..........",
        "..........",
      ],
      [
        "..........",
        "...kkkk...",
        "..kvlvvk..",
        ".kvkvvkvk.",
        ".kvvvvvvk.",
        ".klvwwvlk.",
        ".kvvvvvvk.",
        "..kvvvvk..",
        "..kvkvkvk.",
        "...k.k.k..",
        "..........",
      ],
    ],
  },
});

/* ---- BRUTE — the dungeon guardian. SHARP ward, hits hard. ---- */
registerEnemy({
  id: "brute",
  name: "Brute",
  hp: 18, speed: 28, damage: 2,
  behavior: "chase", aggro: 100,
  size: 17,
  heavy: true,                       // barely knocked back
  ward: { types: ["sharp"], hp: 6 },
  sprite: {
    palette: { k: "#1a1c2c", o: "#ef7d57", d: "#b13e53", w: "#f4f4f4", b: "#6b4a2b" },
    frames: [
      [
        "......kkkkkk......",
        ".....kooooook.....",
        ".....kokookok.....",
        "....kkoooooookk...",
        "...kokwoooowkook..",
        "..kookoooooookook.",
        "..kook.kddk.kook..",
        "..koo.kddddk.ook..",
        "...k..kddddk..k...",
        "......kddddk......",
        ".....kddddddk.....",
        ".....kbbbbbbk.....",
        ".....kbbkkbbk.....",
        "....kook..kook....",
        "....koo....ook....",
        "....kkk....kkk....",
      ],
      [
        "......kkkkkk......",
        ".....kooooook.....",
        ".....kokookok.....",
        "....kkoooooookk...",
        "...kokwoooowkook..",
        "..kookoooooookook.",
        "..kook.kddk.kook..",
        "..koo.kddddk.ook..",
        "...k..kddddk..k...",
        "......kddddk......",
        ".....kddddddk.....",
        ".....kbbbbbbk.....",
        ".....kbbkkbbk.....",
        "...koo.k..k.ook...",
        "...koo......ook...",
        "...kkk......kkk...",
      ],
    ],
  },
});

/* ---- THORNLING — a skittish plant that spits seeds ---- */
registerEnemy({
  id: "thornling",
  name: "Thornling",
  hp: 5, speed: 34, damage: 1,
  behavior: "shooter", aggro: 120, shootEvery: 1.35,
  shotColor: "#a7f070",
  size: 12,
  sprite: {
    palette: { k: "#1a1c2c", g: "#38b764", l: "#a7f070", b: "#6b4a2b" },
    frames: [
      [
        "....ll....",
        "...lggl...",
        "..kggggk..",
        ".kglgglgk.",
        ".kggkkggk.",
        "..kggggk..",
        "...kbbk...",
        "..kb..bk..",
        ".kk....kk.",
      ],
      [
        "...ll.....",
        "..lggl....",
        ".kggggk...",
        ".kglgglgk.",
        ".kggkkggk.",
        "..kggggk..",
        "...kbbk...",
        ".kb....bk.",
        ".kk....kk.",
      ],
    ],
  },
});

/* ---- PEBBLEBEAST — slow, heavy, and protected by a blunt ward ---- */
registerEnemy({
  id: "pebblebeast",
  name: "Pebblebeast",
  hp: 8, speed: 25, damage: 2,
  behavior: "chase", aggro: 95,
  size: 15,
  heavy: true,
  ward: { types: ["blunt"], hp: 3 },
  sprite: {
    palette: { k: "#1a1c2c", r: "#566c86", l: "#94b0c2", e: "#ffcd75" },
    frames: [
      [
        "....kkkk....",
        "..kkrrrrkk..",
        ".krrlrrlrrk.",
        "krrrrrrrrrrk",
        "krreerrerrrk",
        "krrrrrrrrrrk",
        ".krrrllrrrk.",
        "..krrrrrrk..",
        "..kk....kk..",
        ".kk......kk.",
      ],
      [
        "....kkkk....",
        "..kkrrrrkk..",
        ".krrlrrlrrk.",
        "krrrrrrrrrrk",
        "krreerrerrrk",
        "krrrrrrrrrrk",
        ".krrrllrrrk.",
        "..krrrrrrk..",
        ".kk......kk.",
        ".kk......kk.",
      ],
    ],
  },
});

/* ---- SHADE — a common DARK-ward foe that makes shadow magic useful ---- */
registerEnemy({
  id: "shade",
  name: "Shade",
  hp: 6, speed: 38, damage: 1,
  behavior: "shooter", aggro: 125, shootEvery: 1.55,
  shotColor: "#5d275d",
  size: 12,
  ward: { types: ["dark"], hp: 2 },
  sprite: {
    palette: { k: "#1a1c2c", d: "#333c57", v: "#5d275d", p: "#b58ee6" },
    frames: [
      [
        "...kkkk...",
        "..kvvvvk..",
        ".kvddddvk.",
        ".kdpddpdk.",
        ".kddddddk.",
        "..kddddk..",
        ".kvkddkvk.",
        "..k....k..",
        ".k......k.",
      ],
      [
        "....kkkk..",
        "...kvvvvk.",
        "..kvddddvk",
        "..kdpddpdk",
        "..kddddddk",
        "...kddddk.",
        "..kvkddkvk",
        ".k......k.",
        "..k....k..",
      ],
    ],
  },
});

/* ---- ANCIENT TREANT — Mistwood miniboss ---- */
registerEnemy({
  id: "ancientTreant",
  name: "Ancient Treant",
  hp: 34, speed: 26, damage: 2,
  behavior: "chase", aggro: 120,
  size: 18, heavy: true, miniboss: true,
  boss: {
    style: "charger", intro: "THE FOREST REMEMBERS",
    color: "#a7f070", specialEvery: 3.6,
    telegraph: 0.65, chargeSpeed: 105, chargeDur: 0.45,
    phases: 3, phaseThresholds: [0.67, 0.34], patterns: ["charge", "briar"],
    introLines: [
      "I was ancient when this path was only an ambitious puddle.",
      "The birds asked me to stop travelers. They were very persuasive.",
      "Watch the roots, little wanderer. The forest always announces itself.",
    ],
    phaseLine: "A strong breeze! Let us see how you fare in a storm of roots.",
    phaseThreeLine: "The oldest trees bend. They do not move out of the way.",
    knockoutLine: "Rest beneath the young branches. Return when yours are steady.",
    defeatLine: "Pass, then. Tell the birds I made this look difficult.",
    rematchLine: "Back so soon? Trees measure soon differently, but still.",
  },
  ward: { types: ["blunt"], hp: 4 },
  trophy: "trophy-heartwood-crown",
  trophyName: "Heartwood Crown",
  location: "Mistwood",
  sprite: {
    palette: { k: "#1a1c2c", b: "#6b4a2b", g: "#257179", l: "#a7f070", e: "#ffcd75" },
    frames: [
      [
        "...l..llll..l...",
        "..lgglgggglggl..",
        ".lggggggggggggl.",
        "...kkbbbbbbkk...",
        "..kbbbbbbbbbbk..",
        ".kbbebbbbbebbbk.",
        ".kbbbbbbbbbbbbk.",
        "..kbbbkkkkbbbk..",
        "...kbbbbbbbbk...",
        "...kbbbbbbbbk...",
        "..kkbbbkkbbbkk..",
        ".kbbbkk..kkbbbk.",
        ".kbbk......kbbk.",
        "..kk........kk..",
      ],
      [
        "..l..llll..l....",
        ".lgglgggglggl...",
        "lggggggggggggl..",
        "...kkbbbbbbkk...",
        "..kbbbbbbbbbbk..",
        ".kbbebbbbbebbbk.",
        ".kbbbbbbbbbbbbk.",
        "..kbbbkkkkbbbk..",
        "...kbbbbbbbbk...",
        "...kbbbbbbbbk...",
        ".kkbbbbkkbbbbkk.",
        "kbbbkk....kkbbbk",
        ".kbk........kbk.",
        "..k..........k..",
      ],
    ],
  },
});

/* ---- MIRE QUEEN — Sunken Marsh miniboss; DARK breaks her veil ---- */
registerEnemy({
  id: "mireQueen",
  name: "Mire Queen",
  hp: 36, speed: 32, damage: 2,
  behavior: "shooter", aggro: 145, shootEvery: 1.15,
  shotColor: "#38b764",
  size: 17, heavy: true, miniboss: true,
  boss: {
    style: "caster", intro: "HER COURT HAS RISEN",
    color: "#8153c1", specialEvery: 3.8,
    phases: 3, phaseThresholds: [0.67, 0.34], telegraph: 0.58,
    chargeSpeed: 0, chargeDur: 0, patterns: ["seeds", "nova"],
    introLines: [
      "Welcome to court. The dress code is damp but distinguished.",
      "My veil is not decorative. Well, it is also decorative.",
      "Break the purple ward, then mind what rises from the water.",
    ],
    phaseLine: "The court recognizes your argument and raises three bubbles.",
    phaseThreeLine: "No more ceremony. The entire marsh will take the stand.",
    knockoutLine: "Court is adjourned. Dry off and file another challenge.",
    defeatLine: "Judgment for the hero. Take the pearl; it clashes with the mud.",
    rematchLine: "Court reconvenes! Somebody find the ceremonial towel.",
  },
  ward: { types: ["dark"], hp: 5 },
  trophy: "trophy-mire-pearl",
  trophyName: "Mire Pearl",
  location: "Sunken Marsh",
  sprite: {
    palette: { k: "#1a1c2c", g: "#257179", l: "#a7f070", v: "#8153c1", w: "#f4f4f4" },
    frames: [
      [
        "...l...l...l...",
        "..lgl.lgl.lgl..",
        "...kkkkkkkkk...",
        "..kvvvvvvvvvk..",
        ".kvvggvvvggvvk.",
        ".kvgwgvvvgwgvk.",
        ".kvvvvvvvvvvvk.",
        "..kvvkkkkkvvk..",
        "...kgggggggk...",
        "..kgglggglggk..",
        ".kgggggggggggk.",
        ".kggkgggggkggk.",
        "..kk..kkk..kk..",
        "...k.......k...",
      ],
      [
        "..l...l...l....",
        ".lgl.lgl.lgl...",
        "...kkkkkkkkk...",
        "..kvvvvvvvvvk..",
        ".kvvggvvvggvvk.",
        ".kvgwgvvvgwgvk.",
        ".kvvvvvvvvvvvk.",
        "..kvvkkkkkvvk..",
        "...kgggggggk...",
        ".kgglggggglggk.",
        "kgggggggggggggk",
        ".kggkgggggkggk.",
        ".kk...kkk...kk.",
        "..k.........k..",
      ],
    ],
  },
});

/* ---- ECLIPSE KNIGHT — Ember Ridge miniboss ---- */
registerEnemy({
  id: "eclipseKnight",
  name: "Eclipse Knight",
  hp: 42, speed: 40, damage: 2,
  behavior: "chase", aggro: 135,
  size: 17, heavy: true, miniboss: true,
  boss: {
    style: "duelist", intro: "THE LAST LIGHT FADES",
    color: "#b58ee6", specialEvery: 3.0,
    telegraph: 0.48, chargeSpeed: 145, chargeDur: 0.3,
    phases: 3, phaseThresholds: [0.67, 0.34], patterns: ["charge", "crescent"],
    introLines: [
      "I guarded the last light until it became awkward to leave.",
      "The armor is mostly shadow. The squeaking is entirely real.",
      "Dark breaks dark here. Yes, the naming committee regrets it.",
    ],
    phaseLine: "A spark remains. I shall make it considerably less convenient.",
    phaseThreeLine: "Eclipse complete. Fight by memory, not by brightness.",
    knockoutLine: "The light returns outside. Follow it, then return stronger.",
    defeatLine: "Dawn wins again. It is becoming insufferably confident.",
    rematchLine: "Another eclipse? Fine. I had not removed the armor.",
  },
  ward: { types: ["dark"], hp: 6 },
  trophy: "trophy-eclipse-sigil",
  trophyName: "Eclipse Sigil",
  location: "Ember Ridge",
  sprite: {
    palette: { k: "#1a1c2c", a: "#333c57", v: "#5d275d", p: "#b58ee6", e: "#ffcd75" },
    frames: [
      [
        ".....kkkkkk.....",
        "....kaaaaavk....",
        "...kaaaaaavvk...",
        "...kaapppaavk...",
        "...kaapepaaak...",
        "..kkaaaaaaaakk..",
        ".kavkaaaaaakvak.",
        "kav.kaaaaaak.vak",
        "kk..kaaaaaak..kk",
        "....kavvvak.....",
        "....kavvvak.....",
        "...kkaak..kaakk...",
        "...kaak..kaak...",
        "...kkk....kkk...",
      ],
      [
        ".....kkkkkk.....",
        "....kvaaaaak....",
        "...kvvaaaaaak...",
        "...kvaapppaak...",
        "...kaaapepaak...",
        "..kkaaaaaaaakk..",
        ".kavkaaaaaakvak.",
        "kav.kaaaaaak.vak",
        "kk..kaaaaaak..kk",
        "....kavvvak.....",
        "....kavvvak.....",
        "..kkaak..kaakk..",
        "..kaak....kaak..",
        "..kkk......kkk..",
      ],
    ],
  },
});

/* ---- RIFTBLADE ADEPT — defeat the form before becoming it ---- */
/* ---- SHATTERCOAST WILDLIFE ---- */
registerEnemy({
  id: "tideCrab", name: "Tide Crab", hp: 7, speed: 30, damage: 1,
  behavior: "chase", aggro: 100, size: 14, heavy: true,
  ward: { types: ["blunt"], hp: 2 },
  sprite: {
    palette: { k: "#1a1c2c", c: "#ef7d57", r: "#b13e53", w: "#f4f4f4", b: "#41a6f6" },
    frames: [[
      "k............k", "ck..........kc", ".ck..kkkk..kc.", "..kccwwwwcck..", ".kccwkkkkwcck.",
      "kcccrwkkwrccck", "kccccwwwwccck.", ".kkcccccccckk..", "..kcck..kcck..", ".kkk......kkk.",
    ], [
      ".k..........k.", "kck........kck", "..ck..kkkk..kc", "...kccwwwwcck.", "..kccwkkkkwcck",
      ".kcccrwkkwrccc", ".kccccwwwwccck", "..kkcccccccckk", ".kcck......kcck", "kkk..........kkk",
    ]],
  },
});

registerEnemy({
  id: "starMote", name: "Star Mote", hp: 5, speed: 43, damage: 1,
  behavior: "shooter", aggro: 130, shootEvery: 1.45, shotColor: "#ffcd75", size: 12,
  ward: { types: ["light"], hp: 2 },
  sprite: {
    palette: { k: "#1a1c2c", y: "#ffcd75", c: "#73eff7", w: "#f4f4f4", p: "#8153c1" },
    frames: [[
      "......y......", "..y...y...y..", "...c..y..c...", "....kyyyk....", ".yykywwwykyy.",
      "....ywpwy....", "..ccywwwycc..", "....kyyyk....", "...c..y..c...", "..y...y...y..", "......y......",
    ], [
      "..y.......y..", "....c.y.c....", ".....kyk.....", "...yywwwyy...", "..cywwpwwyc..",
      "...yywwwyy...", ".....kyk.....", "....c.y.c....", "..y.......y..", "......y......", ".............",
    ]],
  },
});

registerEnemy({
  id: "riftbladeAdept",
  name: "Riftblade Adept",
  hp: 52, speed: 56, damage: 2,
  behavior: "chase", aggro: 170,
  size: 18, heavy: true, miniboss: true,
  ward: { types: ["sharp"], hp: 5 },
  boss: {
    style: "riftblade", intro: "FOLLOW THE BLADE — THEN BREAK THE RHYTHM",
    phases: 3, phaseThresholds: [0.66, 0.33],
    color: "#73eff7", specialEvery: 2.35,
    telegraph: 0.48, chargeSpeed: 175, chargeDur: 0.34,
    antiKiteRange: 104, chaseScale: 1.34,
    introLines: [
      "The blade always returns. My library books do not.",
      "Move with the throw, or become part of the lesson.",
      "Three beats, one opening. Tap an ability when you are ready.",
    ],
    phaseLine: "Better. Now follow three blades and one terrible metaphor.",
    phaseThreeLine: "Final lesson: every blade comes home. Try not to be there.",
    knockoutLine: "The rhythm broke. Catch your breath and begin again.",
    defeatLine: "The rhythm is yours. Please return it by Tuesday.",
    rematchLine: "Again? Good. The blade was getting bored.",
  },
  trophy: "riftblade-sigil",
  trophyName: "Riftblade Sigil",
  location: "Riftblade Trial",
  sprite: {
    palette: {
      k: "#1a1c2c", v: "#3b2f73", p: "#8153c1", c: "#73eff7",
      b: "#41a6f6", w: "#f4f4f4", s: "#94b0c2", y: "#ffcd75",
      r: "#b13e53",
    },
    frames: [
      [
        "c.................c",
        ".c.......yy......c.",
        "..c....ykkkk....c..",
        "...c..kwwsswk..c...",
        "....ckwc..cwkc.....",
        "...kkkwwwwwwkkk....",
        "..kppkkwsswkkppk...",
        ".kppvvkkwwkkvvppk..",
        "kppvvvvkkkkvvvvppk.",
        "krrpvvvkkkkvvvprrk.",
        ".krrppvvvvvvpprrk..",
        "..kkppvvvvppkk.....",
        "...kkpvkkvpkk......",
        "....kkv..vkk.......",
        "...cckk..kkcc......",
        "..cb........bc.....",
      ],
      [
        "..c.............c..",
        ".c.......yy.......c.",
        "c......ykkkky......c",
        ".c....kwwsswwk....c.",
        "..c..kwc....cwk..c..",
        "...ckkwwwwwwwwkkc...",
        "..kppkkwwsswwkkppk..",
        ".kppvvkkwwwwkkvvppk.",
        "kppvvvvkkkkkkvvvvppk",
        ".krrpvvvkkkkvvvprrk.",
        "..krrppvvvvvvpprrk..",
        "...kkppvvvvppkk.....",
        "....kkpvkkvpkk......",
        ".....kkv..vkk.......",
        "....cckk..kkcc......",
        "...cb........bc.....",
      ],
    ],
  },
});

/* ---- FORM TRIAL BOSSES — each teaches the form it guards ---- */
registerEnemy({
  id: "moleMonarch", name: "Mole Monarch",
  hp: 56, speed: 52, damage: 2, behavior: "chase", aggro: 175,
  size: 19, heavy: true, miniboss: true,
  ward: { types: ["blunt"], hp: 6 },
  boss: {
    style: "mole", color: "#d8b06a", specialEvery: 2.45,
    phases: 3, phaseThresholds: [0.66, 0.33],
    telegraph: 0.52, chargeSpeed: 190, chargeDur: 0.38,
    antiKiteRange: 108, chaseScale: 1.28,
    patterns: ["burrow", "quake"],
    intro: "THIS WAS A PRIVATE TUNNEL",
    introLines: [
      "You tracked mud into my private tunnel.",
      "I respect the technique. I object to the visitor.",
      "When the floor glows, move. When I surface, answer loudly.",
    ],
    phaseLine: "Fine. I am filing a noise complaint from below!",
    phaseThreeLine: "Royal decree: the entire floor is now a tunnel!",
    knockoutLine: "Back to the surface with you. My tunnel, my rules.",
    defeatLine: "Take the crown. It was terrible for digging anyway.",
    rematchLine: "The surface person is back. Everybody look busy.",
  },
  trophy: "mole-crown", trophyName: "Mole Crown", location: "The Royal Burrow",
  sprite: {
    palette: { k: "#1a1c2c", b: "#6b4a2b", t: "#8a6538", s: "#d8b06a", y: "#ffcd75", w: "#f4f4f4", p: "#ef7d57" },
    frames: [[
      "....yyy....yyy....", "...yyyyyyyyyyyy...", "..kkkttttttttkkk..", ".ktttsssssssstttk.",
      "kttsskwsssswkssttk", "kttssskkkkkksssttk", "kbbtttssppsstttbbk", ".kbbbttttttttbbbk.",
      "..kkttttttttttkk..", "...kttttttttttk...", "..kkbbbbbbbbbbkk..", ".kbbbbbbbbbbbbbbk.",
      "kbbbkkbbbbbbkkbbbk", ".kkk..kkkkkkkk..kkk", "yyy....kkkk....yyy", "yyyy..........yyyy",
    ], [
      "...yyy......yyy...", "..yyyyyyyyyyyyyy..", ".kkkttttttttttkkk.", "ktttssssssssstttk.",
      "kttsskwsssswkssttk", "kttssskkkkkksssttk", ".kbbttssppssttbbk.", "..kbbbttttttbbbk..",
      "...kkttttttttkk...", "....kttttttttk....", "...kkbbbbbbbbkk...", "..kbbbbbbbbbbbbk..",
      ".kbbbkkbbbbkkbbbk.", "..kkk..kkkk..kkk..", "yyyy....kk....yyyy", ".yyy..........yyy.",
    ]],
  },
});

registerEnemy({
  id: "countessCarmine", name: "Countess Carmine",
  hp: 58, speed: 65, damage: 2, behavior: "chase", aggro: 180,
  size: 19, heavy: true, miniboss: true,
  ward: { types: ["dark"], hp: 6 },
  boss: {
    style: "vampire", color: "#b13e53", specialEvery: 2.25,
    phases: 3, phaseThresholds: [0.66, 0.33],
    telegraph: 0.44, chargeSpeed: 225, chargeDur: 0.28,
    antiKiteRange: 112, chaseScale: 1.25,
    patterns: ["vampireDash", "bloodBurst"],
    intro: "MIDNIGHT HAS EXCELLENT TIMING",
    introLines: [
      "Welcome. I would offer refreshments, but that feels threatening.",
      "Try not to bleed on the cape. It is already very committed.",
      "Keep pace with the waltz; hesitation is how midnight catches you.",
    ],
    phaseLine: "I have counted to two. Conveniently, this is phase two!",
    phaseThreeLine: "Now this is a proper midnight dance. Do keep up.",
    knockoutLine: "A dramatic faint! Excellent form. Try the door again later.",
    defeatLine: "A fine performance. Nine out of ten. Lost one point for sunlight.",
    rematchLine: "Back already? Delightful. I barely finished brooding.",
  },
  trophy: "crimson-seal", trophyName: "Crimson Seal", location: "Carmine Court",
  sprite: {
    palette: { k: "#1a1c2c", d: "#2d1b2e", v: "#5d275d", r: "#b13e53", c: "#ef7d57", w: "#f4f4f4", s: "#94b0c2" },
    frames: [[
      "kkk............kkk", "kddkk........kkddk", ".kdddkkkkkkkkdddk.", "..kddwsssssswddk..",
      "...kwswkkkkwswk...", "...kwwk....kwwk...", "..kkwwwrrrrwwwkk..", ".kvvkkwwwwwwkkvvk.",
      "kvvvvrkkkkkkrvvvvk", "kvvrrrkkkkkkrrrvvk", ".kvrrrvvvvvvrrrvk.", "..krrvvvvvvvvrrk..",
      "...krrvvvvvvrrk...", "....krrvvvvrrk....", "...kkkv....vkkk...", "..kddk......kddk..",
    ], [
      ".kkk..........kkk.", ".kddkk......kkddk.", "..kdddkkkkkkdddk..", "...kddwsssswddk...",
      "....kwswkkwswk....", "....kwwk..kwwk....", "...kkwwwrrwwwkk...", "..kvvkkwwwwkkvvk..",
      ".kvvvvrkkkkrvvvvk.", ".kvvrrrkkkkrrrvvk.", "..kvrrvvvvvvrrvk..", "...krrvvvvvvrrk...",
      "....krrvvvvrrk....", ".....krrvvrrk.....", "....kkkv..vkkk....", "...kddk....kddk...",
    ]],
  },
});

registerEnemy({
  id: "royalFool", name: "The Royal Fool",
  hp: 54, speed: 54, damage: 1, behavior: "shooter", shootEvery: 1.65, aggro: 185,
  shotColor: "#ffcd75", size: 19, heavy: true, miniboss: true,
  ward: { types: ["sharp"], hp: 6 },
  boss: {
    style: "jester", color: "#ffcd75", specialEvery: 2.2,
    phases: 3, phaseThresholds: [0.66, 0.33],
    telegraph: 0.5, chargeSpeed: 0, chargeDur: 0,
    patterns: ["cards", "pie", "cards", "nova"],
    intro: "THE COURT IS NOW IN SILLY SESSION",
    introLines: [
      "Why did the hero cross the arena? Poor boundary awareness.",
      "No refunds. The pie is a combat pie.",
      "Count the cards. The third punchline always travels farther.",
    ],
    phaseLine: "Intermission is cancelled due to excessive competence!",
    phaseThreeLine: "Final act! More cards, fewer sensible decisions!",
    knockoutLine: "That is a wrap! Please exit through the embarrassing door.",
    defeatLine: "You win. My final joke is the repair bill.",
    rematchLine: "Same hero, new material. Let us both pretend to be surprised.",
  },
  trophy: "jester-bell", trophyName: "Jester Bell", location: "The Crooked Court",
  sprite: {
    palette: { k: "#1a1c2c", r: "#b13e53", b: "#3b5dc9", y: "#ffcd75", w: "#f4f4f4", p: "#8153c1" },
    frames: [[
      "rrr............bbb", "ryyr..........byyb", ".ryyrkkkkkkkkbyyb.", "..rrkwwwwwwkbb...",
      "...kwkwkkwkwk....", "...kwwp..pwwk....", "..kkwwwwwwwwkk...", ".krrkkwwwwkkbbk...",
      "krrrrykkkkkkybbbk", ".krrryyyyyyyybbbk.", "..krrryyyyyybbbk..", "...krryyyyyybbk...",
      "..kkrryyyyyybbkk..", ".krrkk......kkbbk.", "kkk..........kkk.", "yyy..........yyy.",
    ], [
      ".rrr..........bbb.", ".ryyr........byyb.", "..ryyrkkkkkkbyyb..", "...rrkwwwwkbb....",
      "....kwkwwkwk.....", "....kwwppwwk.....", "...kkwwwwwwkk....", "..krrkkwwkkbbk...",
      ".krrrrykkkybbbk...", "..krrryyyyybbbk...", "...krryyyyybbbk...", "....krryyyyybbk...",
      "...kkrryyyybbkk...", "..krrkk....kkbbk..", ".kkk........kkk...", "yyy..........yyy..",
    ]],
  },
});

/* ---- SHATTERCOAST GUARDIANS — the expansion's four form teachers ---- */
registerEnemy({
  id: "admiralTortoise", name: "Admiral Tortoise",
  hp: 72, speed: 46, damage: 2, behavior: "chase", aggro: 185,
  size: 21, heavy: true, miniboss: true,
  ward: { types: ["blunt"], hp: 7 },
  boss: {
    style: "turtle", color: "#a7f070", specialEvery: 2.3,
    phases: 3, phaseThresholds: [0.67, 0.34],
    telegraph: 0.58, chargeSpeed: 175, chargeDur: 0.42,
    antiKiteRange: 112, chaseScale: 1.18,
    patterns: ["shells", "charge", "shells"],
    intro: "THE TIDE HAS FILED A FORMAL COMPLAINT",
    introLines: [
      "I have defended this beach for two hundred years.",
      "Admittedly, most of those years were against seagulls.",
      "Strike the shell, watch the counter, and mind the tide.",
    ],
    phaseLine: "A respectable opening. Deploy the emergency shell formation!",
    phaseThreeLine: "Full speed ahead! Yes, this is full speed. Be polite.",
    knockoutLine: "Retreat is a maneuver, not an embarrassment. I checked.",
    defeatLine: "Defense is yours. Please use it against the seagulls.",
    rematchLine: "Back on deck? Excellent. I have finished turning around.",
  },
  trophy: "tide-shell", trophyName: "Tide Shell", location: "The Breakwater Bastion",
  sprite: {
    palette: { k: "#1a1c2c", g: "#6b8e3e", l: "#a7f070", b: "#8a6538", w: "#f4f4f4", y: "#ffcd75", c: "#73eff7" },
    frames: [[
      "....yyy....yyy....", "...yyyyyyyyyyyy...", "..kkkggggggggkkk..", ".kgggllllllllgggk.",
      "kggllkwllllwkllggk", "kgglllkkkkkklllggk", "kbbggllllllllggbbk", ".kbbbggggggggbbbk.",
      "..kkggggggggggkk..", "...kbbbbbbbbbbk...", "..kkbbbyyyybbbkk..", ".kbbbbbbbbbbbbbbk.",
      "kbbbkkbbbbbbkkbbbk", ".kkk..kkkkkkkk..kkk", "ccc....kkkk....ccc", "cccc..........cccc",
    ], [
      "...yyy......yyy...", "..yyyyyyyyyyyyyy..", ".kkkggggggggggkkk.", "kgggllllllllllgggk",
      "kggllkwllllwkllggk", "kgglllkkkkkklllggk", ".kbbggllllllllggbbk.", "..kbbbggggggggbbbk..",
      "...kkggggggggkk...", "....kbbbbbbbbk....", "...kkbbbyybbbkk...", "..kbbbbbbbbbbbbk..",
      ".kbbbkkbbbbkkbbbk.", "..kkk..kkkk..kkk..", "cccc....kk....cccc", ".ccc..........ccc.",
    ]],
  },
});

registerEnemy({
  id: "paperRonin", name: "The Paper Ronin",
  hp: 68, speed: 71, damage: 2, behavior: "chase", aggro: 190,
  size: 19, heavy: true, miniboss: true,
  ward: { types: ["sharp"], hp: 7 },
  boss: {
    style: "duelist", color: "#f4f4f4", specialEvery: 2.05,
    phases: 3, phaseThresholds: [0.67, 0.34],
    telegraph: 0.43, chargeSpeed: 235, chargeDur: 0.3,
    antiKiteRange: 116, chaseScale: 1.34,
    patterns: ["charge", "crescent", "charge", "blades"],
    intro: "ONE DUEL REMAINS UNFINISHED",
    introLines: [
      "I folded one thousand cranes while waiting for a worthy rival.",
      "Crane nine hundred and twelve looked suspiciously like a sandwich.",
      "Three cuts. The silence between them is the dangerous part.",
    ],
    phaseLine: "Your rhythm has edges. Let us see whether it has patience.",
    phaseThreeLine: "No more warm-up. Draw the moon before I do.",
    knockoutLine: "A duel may pause. It does not end until both agree.",
    defeatLine: "The final crane is yours. It is definitely not a sandwich.",
    rematchLine: "The paper remembers every crease. I remember every cut.",
  },
  trophy: "paper-crane", trophyName: "Thousandth Paper Crane", location: "The Folded Dojo",
  sprite: {
    palette: { k: "#1a1c2c", w: "#f4f4f4", s: "#94b0c2", r: "#b13e53", d: "#2d1b2e", y: "#ffcd75", c: "#73eff7" },
    frames: [[
      ".....yyyyyyyy.....", "...yykkkkkkkkyy...", "..kkddddddddddkk..", ".kdwwsssssssswwdk.",
      ".kdwskkkkkkkkswdk.", "..kwwk......kwwk..", ".kkwwwwwwwwwwwwkk.", "krrkkwwwwwwwwkkrrk",
      "krrrrkkkkkkkkrrrrk", ".krrrddddddddrrrk.", "..krrddddddddrrk..", "...kkddddddddkk...",
      "....kddkkkddk.....", "...kkdk...kdkk....", "..ccc.......ccc...", ".ccccc.....ccccc..",
    ], [
      "....yyyyyyyy......", "..yykkkkkkkkyy....", ".kkddddddddddkk....", "kdwwsssssssswwdk...",
      "kdwskkkkkkkkswdk...", ".kwwk......kwwk....", "kkwwwwwwwwwwwwkk...", "rrkkwwwwwwwwkkrrk..",
      "rrrrkkkkkkkkrrrrk...", "krrrddddddddrrrk...", ".krrddddddddrrk....", "..kkddddddddkk.....",
      "...kddkkkddk......", "..kkdk...kdkk.....", ".ccc.........ccc...", "ccccc.......ccccc..",
    ]],
  },
});

registerEnemy({
  id: "professorPerihelion", name: "Professor Perihelion",
  hp: 66, speed: 48, damage: 2, behavior: "shooter", shootEvery: 1.5, aggro: 195,
  shotColor: "#73eff7", size: 19, heavy: true, miniboss: true,
  ward: { types: ["light"], hp: 7 },
  boss: {
    style: "caster", color: "#ffcd75", specialEvery: 2.25,
    phases: 3, phaseThresholds: [0.67, 0.34],
    telegraph: 0.54, chargeSpeed: 0, chargeDur: 0,
    antiKiteRange: 118, chaseScale: 1.2,
    patterns: ["stars", "orbit", "nova"],
    intro: "THE ORRERY REFUSES TO BE WRONG",
    introLines: [
      "My calculations predicted a hero at precisely... yesterday.",
      "Do not touch the brass planets. They are mostly glue.",
      "Follow the orbit, then stand where the stars are not.",
    ],
    phaseLine: "A fascinating error! I shall solve it with additional stars.",
    phaseThreeLine: "Gravity, kindly stop being theoretical and grab our guest.",
    knockoutLine: "The result is reproducible. Rest, then challenge the data.",
    defeatLine: "Peer review accepted. Please take the key and fix my calendar.",
    rematchLine: "A second data point! Try to be statistically dramatic.",
  },
  trophy: "orrery-key", trophyName: "Orrery Key", location: "The Crooked Observatory",
  sprite: {
    palette: { k: "#1a1c2c", v: "#3b2f73", p: "#8153c1", b: "#41a6f6", c: "#73eff7", y: "#ffcd75", w: "#f4f4f4", s: "#94b0c2" },
    frames: [[
      "y.......y.......y", ".c.....c.c.....c.", "...yyyyyyyyyy....", "..kkpvvvvvvpkk...",
      ".kpvwsssssswvpk..", ".kvwskkkkkkswvk..", "..kwwc....cwwk...", ".kkwwwwwwwwwwkk..",
      "kpvkkwwwwwwkkvpk.", "kpvvvkkkkkkvvvpk.", ".kpvvvvvvvvvvpk...", "..kpvvvvvvvvpk....",
      "...kkpvkkvpkk.....", "....kkv..vkk......", "..ccc......ccc....", ".ccccc....ccccc...",
    ], [
      ".......y.......y.", "c.....c.c.....c..", "..yyyyyyyyyy.....", ".kkpvvvvvvpkk.....",
      "kpvwsssssswvpk....", "kvwskkkkkkswvk....", ".kwwc....cwwk.....", "kkwwwwwwwwwwkk....",
      "pvkkwwwwwwkkvpk...", "pvvvkkkkkkvvvpk...", "kpvvvvvvvvvvpk....", ".kpvvvvvvvvpk.....",
      "..kkpvkkvpkk......", "...kkv..vkk.......", ".ccc........ccc....", "ccccc......ccccc...",
    ]],
  },
});

registerEnemy({
  id: "grandmotherBriar", name: "Grandmother Briar",
  hp: 74, speed: 53, damage: 2, behavior: "shooter", shootEvery: 1.55, aggro: 190,
  shotColor: "#a7f070", size: 21, heavy: true, miniboss: true,
  ward: { types: ["dark"], hp: 8 },
  boss: {
    style: "caster", color: "#38b764", specialEvery: 2.3,
    phases: 3, phaseThresholds: [0.67, 0.34],
    telegraph: 0.56, chargeSpeed: 160, chargeDur: 0.34,
    antiKiteRange: 112, chaseScale: 1.22,
    patterns: ["seeds", "briar", "charge"],
    intro: "THE GARDEN HAS DECIDED TO GARDEN BACK",
    introLines: [
      "Shoes off, dear. The moss has standards.",
      "I planted one defensive hedge. It developed ambitions.",
      "Mind the seeds. They become opinions when crowded.",
    ],
    phaseLine: "Lovely footwork. Terrible for the begonias, but lovely.",
    phaseThreeLine: "Very well, dear. The whole arena is a flowerpot now.",
    knockoutLine: "A little compost, a little rest, and you may try again.",
    defeatLine: "Take the acorn. Plant something kinder than my hedge.",
    rematchLine: "Tea is not ready, but the briars certainly are.",
  },
  trophy: "elder-acorn", trophyName: "Elder Acorn", location: "The Walking Garden",
  sprite: {
    palette: { k: "#1a1c2c", g: "#38b764", l: "#a7f070", b: "#6b4a2b", t: "#8a6538", w: "#f4f4f4", y: "#ffcd75" },
    frames: [[
      "..l....llll....l..", ".lgl..llggll..lgl.", "..l..kkggggkk..l..", "....kttttttttk....",
      "...ktwllllllwtk...", "...ktwlkkkklwtk...", "..kktttwwwwtttkk..", ".kggkkttttttkkggk.",
      "kggggkkttttkkggggk", ".kgggbbbbbbbbgggk.", "..kggbbbbbbbbggk..", "...kkbbbbbbbbkk...",
      "....kbbk..kbbk....", "...kkbk....kbkk...", "..lll......lll....", ".lllll....lllll...",
    ], [
      ".l....llll....l...", "lgl..llggll..lgl..", ".l..kkggggkk..l...", "...kttttttttk.....",
      "..ktwllllllwtk....", "..ktwlkkkklwtk....", ".kktttwwwwtttkk....", "kggkkttttttkkggk...",
      ".kggggkkttttkkggggk", "..kgggbbbbbbbbgggk", "...kggbbbbbbbbggk.", "....kkbbbbbbbbkk..",
      ".....kbbk..kbbk...", "....kkbk....kbkk..", ".lll........lll...", "lllll......lllll..",
    ]],
  },
});

/* ---- WORLDWAKE WORLDBEARERS ----
   These guardians are deliberately longer than ordinary form trials, not
   more damaging. Three readable phases change the pattern while body contact
   remains safe outside telegraphed charges, preserving melee viability. */

registerEnemy({
  id: "sunHopper", name: "Sun Hopper",
  hp: 4, speed: 72, damage: 1, behavior: "chase", aggro: 105, size: 11,
  sprite: {
    palette: { k: "#1a1c2c", y: "#ffcd75", o: "#ef7d57", w: "#f4f4f4" },
    frames: [[
      "..yy......yy..", ".ykyy....yyky.", "..kykkkkkkyk..", ".kkyyyyyyyykk.",
      "kyykwyyyywkyyk", ".kyyyyyyyyyyk.", "..kkoooooook..", ".kkok....kokk.",
      "kko........okk", "..............",
    ], [
      "....yy..yy....", "..yykyyykyyy..", ".kkykkkkkkykk.", "kyyyyyyyyyyyyk",
      "kyykwyyyywkyyk", ".kyyyyyyyyyyk.", "..kkoooooook..", "...kok..kok...",
      "..okk....kko..", "..............",
    ]],
  },
});

registerEnemy({
  id: "loomling", name: "Loomling",
  hp: 4, speed: 44, damage: 1, behavior: "shooter", aggro: 125, shootEvery: 1.9,
  shotColor: "#d9a7ff", size: 12, ward: { types: ["dark"], hp: 2 },
  sprite: {
    palette: { k: "#1a1c2c", p: "#8153c1", s: "#d9a7ff", w: "#f4f4f4" },
    frames: [[
      "s..........s", ".s..kkkk..s.", "..kppppppk..", ".kpkpwwpkwpk.",
      "kppppppppppk", ".kppkkkkppk.", "s.kkppppkk.s", ".s.kp..pk.s.",
      "s..k....k..s", "............",
    ], [
      ".s........s.", "s...kkkk...s", ".kppppppk...", "kpkpwwpkwpk.",
      "kppppppppppk", ".kppkkkkppk.", ".skkppppkks.", "s..kp..pk..s",
      ".s.k....k.s.", "............",
    ]],
  },
});

registerEnemy({
  id: "mirageSkater", name: "Mirage Skater",
  hp: 5, speed: 82, damage: 1, behavior: "chase", aggro: 115, size: 10,
  sprite: {
    palette: { k: "#1a1c2c", c: "#73eff7", y: "#d8b06a", w: "#f4f4f4" },
    frames: [[
      "c..........c", ".c..kkkk..c.", "..kcyyyyck..", ".kcykwwkyck.",
      "kccyyyyyycck", ".kkcccccckk.", "...ky..yk...", "..ky....yk..",
      ".cc......cc.", "............",
    ], [
      "..c......c..", "c...kkkk...c", ".kcyyyyck...", "kcykwwkyck..",
      "kccyyyyyycck", ".kkcccccckk.", "..ky....yk..", ".ky......yk.",
      "cc........cc", "............",
    ]],
  },
});

registerEnemy({
  id: "bellMoth", name: "Bell Moth",
  hp: 4, speed: 52, damage: 1, behavior: "shooter", aggro: 130, shootEvery: 1.75,
  shotColor: "#fff3c2", size: 11, ward: { types: ["light"], hp: 2 },
  sprite: {
    palette: { k: "#1a1c2c", w: "#fff3c2", c: "#73eff7", y: "#ffcd75" },
    frames: [[
      "w..........w", ".wk........kw.", ".kwk..yy..kwk.", "kcckkkkkkkkcck",
      "kccckwwwwkccck", ".kkkwwkkwwkkk.", "...kwwwwk....", "....kyyk.....",
      ".....kk......", ".............",
    ], [
      ".............", "..www....www..", ".wkcck..kcckw.", "kwccckkkkcccwk",
      ".kkkwwwwwwkkk.", "...kwwkkwwk...", "....kwwwwk....", ".....kyyk.....",
      "......kk.....", ".............",
    ]],
  },
});

registerEnemy({
  id: "cairnWalker", name: "Cairn Walker",
  hp: 7, speed: 36, damage: 1, behavior: "chase", aggro: 100,
  size: 15, heavy: true, ward: { types: ["blunt"], hp: 3 },
  sprite: {
    palette: { k: "#1a1c2c", d: "#4b4541", s: "#6f665b", o: "#ef7d57", m: "#38b764" },
    frames: [[
      "....kkkk....", "...ksssskk..", "..ksddddssk.", ".ksdo....odsk",
      "kssddddddddsk", ".kssmmmmsssk.", "..ksssssssk..", ".kkdddssdddkk.",
      "kddddk..kddddk", ".kkddk..kddkk.", "..kmm....mmk..", "..............",
    ], [
      "...kkkk.....", "..ksssskk...", ".ksddddssk...", "ksdo....odsk.",
      "ssddddddddsk.", "kssmmmmsssk..", ".ksssssssk...", "kkdddssdddkk..",
      "ddddk..kddddk.", "kkddk..kddkk..", ".kmm....mmk...", "..............",
    ]],
  },
});

const WORLDBEARER_FALLBACK_SPRITE = {
  palette: { k: "#1a1c2c", s: "#6b665b", l: "#d8b06a", w: "#f4f4f4", y: "#ffcd75" },
  frames: [[
    "...yy..yy...", "..ykkkkkky..", ".yksllllsky.", "kklsw..wslkk",
    "kssllllllssk", ".ksskkkkssk.", "..kssssssk..", ".kksssssskk.",
    "ksskksskkssk", "kssk....kssk", ".kk......kk.", "............",
  ], [
    "..yy..yy....", ".ykkkkkky...", "yksllllsky..", "klsw..wslkk.",
    "ssllllllsskk", "ksskkkkssk..", ".kssssssk...", "kksssssskk..",
    "sskksskkssk.", "ssk....kssk.", "kk......kk..", "............",
  ]],
};

registerEnemy({
  id: "skySovereign", name: "Aurelia, Sky Sovereign",
  hp: 88, speed: 66, damage: 2, behavior: "chase", aggro: 205,
  size: 24, heavy: true, miniboss: true,
  ward: { types: ["sharp"], hp: 7 },
  boss: {
    style: "duelist", color: "#73eff7", specialEvery: 2.15,
    phases: 3, phaseThresholds: [0.68, 0.34], telegraph: 0.5,
    chargeSpeed: 210, chargeDur: 0.32, antiKiteRange: 124, chaseScale: 1.25,
    patterns: ["shells", "charge", "stars", "crescent"],
    intro: "THE HORIZON FOLDS ITS WINGS",
    introLines: [
      "Tiny walker! You climbed onto my back without an appointment.",
      "I admire the confidence. I question the landing strategy.",
      "Follow my feathers through the gaps, then meet me where the wind ends.",
    ],
    phaseLine: "Good! The sky likes you. Unfortunately, I am the sky's landlord.",
    phaseThreeLine: "One last dive. If we miss, tell the canyon it owes me a nest.",
    knockoutLine: "The wind sets you down gently. I will pretend that was my idea.",
    defeatLine: "Take my mark. You move like a storm that remembered to laugh.",
    rematchLine: "Back for another flight? Excellent. Try not to shed on the canyon.",
  },
  trophy: "trophy-sky-sovereign", trophyName: "Sky Mark", location: "The Sky Sovereign's Back",
  sprite: (G.forms.griffin && G.forms.griffin.sprite) || WORLDBEARER_FALLBACK_SPRITE,
});

registerEnemy({
  id: "oldMason", name: "Pillar, the Old Mason",
  hp: 96, speed: 49, damage: 2, behavior: "chase", aggro: 205,
  size: 26, heavy: true, miniboss: true,
  ward: { types: ["blunt"], hp: 8 },
  boss: {
    style: "charger", color: "#ffcd75", specialEvery: 2.35,
    phases: 3, phaseThresholds: [0.68, 0.34], telegraph: 0.62,
    chargeSpeed: 175, chargeDur: 0.44, antiKiteRange: 120, chaseScale: 1.16,
    patterns: ["quake", "charge", "shells", "quake"],
    intro: "THE GARDEN STANDS UP",
    introLines: [
      "Careful with the petunias. They took three centuries to stop arguing.",
      "I build slowly because mountains have dreadful handwriting.",
      "When my palms glow, choose a gap. When I kneel, make your answer count.",
    ],
    phaseLine: "A crack! Wonderful. Every good wall needs somewhere for ivy.",
    phaseThreeLine: "The final terrace goes here. Please stand somewhere else.",
    knockoutLine: "A fallen stone is still useful. Rest. Then become a better arch.",
    defeatLine: "Carry the Stone Mark. Build doors more often than walls.",
    rematchLine: "Inspection day again? Fine. I have reinforced the petunias.",
  },
  trophy: "trophy-old-mason", trophyName: "Stone Mark", location: "The Old Mason's Crown",
  sprite: (G.forms.golem && G.forms.golem.sprite) || WORLDBEARER_FALLBACK_SPRITE,
});

registerEnemy({
  id: "silkMatriarch", name: "Tess, Silk Matriarch",
  hp: 90, speed: 57, damage: 2, behavior: "shooter", shootEvery: 1.7, aggro: 210,
  shotColor: "#d9a7ff", size: 23, heavy: true, miniboss: true,
  ward: { types: ["dark"], hp: 8 },
  boss: {
    style: "caster", color: "#d9a7ff", specialEvery: 2.2,
    phases: 3, phaseThresholds: [0.68, 0.34], telegraph: 0.55,
    chargeSpeed: 165, chargeDur: 0.32, antiKiteRange: 125, chaseScale: 1.2,
    patterns: ["cards", "briar", "seeds", "nova"],
    intro: "THE LOOM HAS EIGHT HANDS AND ONE OPINION",
    introLines: [
      "Welcome, Nobody. I knew you were coming; the web was gossiping.",
      "Do not worry. I only eat rude guests, and you wiped your feet.",
      "Watch where one thread ends and the next begins. That is your opening.",
    ],
    phaseLine: "You cut my favorite thread. It was load-bearing and emotionally important.",
    phaseThreeLine: "No more neat stitches. Let us make something gloriously tangled.",
    knockoutLine: "The web catches you. See? Hospitality, not lunch.",
    defeatLine: "Take the Thread Mark. Every lonely road deserves a connection.",
    rematchLine: "The web said you were back. It used three exclamation marks.",
  },
  trophy: "trophy-silk-matriarch", trophyName: "Thread Mark", location: "The Loom Below",
  sprite: (G.forms.weaver && G.forms.weaver.sprite) || WORLDBEARER_FALLBACK_SPRITE,
});

registerEnemy({
  id: "bellTitan", name: "Bongle, Bell Titan",
  hp: 94, speed: 52, damage: 2, behavior: "chase", aggro: 205,
  size: 25, heavy: true, miniboss: true,
  ward: { types: ["light"], hp: 8 },
  boss: {
    style: "caster", color: "#fff3c2", specialEvery: 2.25,
    phases: 3, phaseThresholds: [0.68, 0.34], telegraph: 0.58,
    chargeSpeed: 170, chargeDur: 0.36, antiKiteRange: 122, chaseScale: 1.18,
    patterns: ["orbit", "nova", "charge", "shells"],
    intro: "THE TUNDRA RINGS BACK",
    introLines: [
      "BONG. That means hello. Or avalanche. Context is important.",
      "I practiced this song for a thousand winters and forgot the ending.",
      "Change your rhythm when I change mine. Repetition makes the ice grumpy.",
    ],
    phaseLine: "BONG BONG! That means phase two. I am almost certain.",
    phaseThreeLine: "The missing ending! It was louder. Of course it was louder.",
    knockoutLine: "A soft note for the road back. Even heroes need rests.",
    defeatLine: "Take the Echo Mark. Please rhyme responsibly.",
    rematchLine: "Encore! I learned what that word means yesterday.",
  },
  trophy: "trophy-bell-titan", trophyName: "Echo Mark", location: "The Walking Belfry",
  sprite: (G.forms.bellkeeper && G.forms.bellkeeper.sprite) || WORLDBEARER_FALLBACK_SPRITE,
});

registerEnemy({
  id: "lanternKeeper", name: "Mallow, Lantern Keeper",
  hp: 86, speed: 63, damage: 2, behavior: "shooter", shootEvery: 1.55, aggro: 210,
  shotColor: "#ffcd75", size: 23, heavy: true, miniboss: true,
  ward: { types: ["dark"], hp: 8 },
  boss: {
    style: "vampire", color: "#ffcd75", specialEvery: 2.05,
    phases: 3, phaseThresholds: [0.68, 0.34], telegraph: 0.5,
    chargeSpeed: 205, chargeDur: 0.3, antiKiteRange: 126, chaseScale: 1.26,
    patterns: ["stars", "vampireDash", "bloodBurst", "orbit"],
    intro: "A SMALL LIGHT CHALLENGES THE WHOLE STORM",
    introLines: [
      "Oh! A visitor. I would tidy up, but the storm keeps moving everything.",
      "I guard lost travelers. First I must be sure you are difficult to lose.",
      "Stay near the warm gaps. The bright bolts are less friendly than they look.",
    ],
    phaseLine: "You are still here! That is either bravery or excellent boots.",
    phaseThreeLine: "All my lights, together. Let us show the storm it is outnumbered.",
    knockoutLine: "My lantern carries you down. Come back when your spark is steady.",
    defeatLine: "Take the Lantern Mark. A safe place can travel with you.",
    rematchLine: "You found me again! I knew the lantern was working.",
  },
  trophy: "trophy-lantern-keeper", trophyName: "Lantern Mark", location: "The Storm Lantern",
  sprite: (G.forms.lanternWisp && G.forms.lanternWisp.sprite) || WORLDBEARER_FALLBACK_SPRITE,
});

registerEnemy({
  id: "lastWorldbearer", name: "Atlas, Last Worldbearer",
  hp: 104, speed: 51, damage: 2, behavior: "chase", aggro: 215,
  size: 28, heavy: true, miniboss: true,
  ward: { types: ["blunt"], hp: 9 },
  boss: {
    style: "god", color: "#ef7d57", specialEvery: 2.12,
    phases: 3, phaseThresholds: [0.7, 0.36], telegraph: 0.6,
    chargeSpeed: 185, chargeDur: 0.42, antiKiteRange: 126, chaseScale: 1.2,
    patterns: ["quake", "charge", "orbit", "briar", "nova"],
    intro: "THE MOUNTAIN REMEMBERS YOUR NAME",
    introLines: [
      "Nobody. I carried every road here so that one traveler might finish it.",
      "I am tired, but do not mistake tired for fragile. Mountains dislike that.",
      "Bring every lesson you gathered. I will answer with the weight of the world.",
    ],
    phaseLine: "Five marks sing inside you. I can hear each friend who trusted you.",
    phaseThreeLine: "Then carry this final heartbeat. Show me the world will keep moving.",
    knockoutLine: "The mountain lowers you gently. Strength returns; the road remains.",
    defeatLine: "Take the Worldheart. I can finally put the horizon down.",
    rematchLine: "The horizon is lighter today. There is room for one more lesson.",
  },
  trophy: "trophy-last-worldbearer", trophyName: "Worldheart Mark", location: "The Heart Under Stone",
  sprite: (G.forms.colossus && G.forms.colossus.sprite) || WORLDBEARER_FALLBACK_SPRITE,
});

registerEnemy({
  id: "godAvatar", name: "God of Every Form",
  hp: 82, speed: 62, damage: 2, behavior: "chase", aggro: 190,
  size: 22, heavy: true, miniboss: true,
  ward: { types: ["light", "dark"], hp: 10 },
  boss: {
    style: "god", color: "#f4f4f4", specialEvery: 1.95,
    phases: 3, phaseThresholds: [0.67, 0.34],
    telegraph: 0.48, chargeSpeed: 195, chargeDur: 0.34,
    antiKiteRange: 118, chaseScale: 1.3,
    patterns: ["charge", "blades", "cards", "shells", "crescent", "stars", "briar", "nova"],
    intro: "THE FINAL FORM HAS BEEN EXPECTING YOU",
    introLines: [
      "I know everything. Except where I put my keys.",
      "Show me every lesson. I promise to grade on a curve.",
      "I added four pages overnight. This is now an expansion-sized exam.",
    ],
    phaseLine: "Good. I was running out of easy questions.",
    phaseThreeLine: "No more questions. Show me the answer every form discovered.",
    knockoutLine: "Not yet. Mastery waits outside until you are ready.",
    defeatLine: "Excellent. You may be God now. I am taking a lunch break.",
    rematchLine: "Office hours again? Very well. One final final exam.",
  },
  trophy: "god-spark", trophyName: "Spark of Every Form", location: "The Final Firmament",
  sprite: {
    palette: { k: "#1a1c2c", w: "#f4f4f4", s: "#94b0c2", y: "#ffcd75", r: "#b13e53", p: "#8153c1", b: "#41a6f6" },
    frames: [[
      "......yyyyyyyy......", "....yyb......byy....", "...w...kkkkkk...w...", "..w...kwwsswwk...w..",
      ".....kkwkkkkwkk.....", "....kkwwp..pwwkk....", "...rrkkwwwwwwkkrr...", "..rrrkkwwwwwwkkrrr..",
      ".rrrkkwwrrrrwwkkrrr.", "rrrkkwwrrpprrwwkkrrr", ".rrkkwwrpppprwwkkrr.", "..kkwwwrrrrrrwwwkk..",
      "...kkwwwwwwwwwwkk...", "....kkrrvvvvrrkk....", ".....krrvvvvrrk.....", "....kkkrrrrrrkkk....",
      "...yyy..kkkk..yyy...", "..yyyy........yyyy..",
    ], [
      ".....yyyyyyyy........", "...yyb......byy......", "..w...kkkkkk...w.....", ".w...kwwsswwk...w....",
      "....kkwkkkkwkk.......", "...kkwwp..pwwkk......", "..rrkkwwwwwwkkrr.....", ".rrrkkwwwwwwkkrrr....",
      "rrrkkwwrrrrwwkkrrr...", "rrkkwwrrpprrwwkkrr...", ".kkwwrpppprwwkkrr....", "..kkwwwrrrrwwwwkk....",
      "...kkwwwwwwwwkk......", "....kkrrvvvvrrkk.....", ".....krrvvvvrrk......", "....kkkrrrrrrkkk.....",
      "..yyy..kkkk..yyy.....", ".yyyy........yyyy....",
    ]],
  },
});
