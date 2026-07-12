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
  hp: 16, speed: 24, damage: 2,
  behavior: "chase", aggro: 120,
  size: 18, heavy: true, miniboss: true,
  boss: {
    style: "charger", intro: "THE FOREST REMEMBERS",
    color: "#a7f070", specialEvery: 3.6,
    telegraph: 0.65, chargeSpeed: 105, chargeDur: 0.45,
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
  hp: 18, speed: 29, damage: 2,
  behavior: "shooter", aggro: 145, shootEvery: 1.15,
  shotColor: "#38b764",
  size: 17, heavy: true, miniboss: true,
  boss: {
    style: "caster", intro: "HER COURT HAS RISEN",
    color: "#8153c1", specialEvery: 3.8,
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
  hp: 22, speed: 34, damage: 2,
  behavior: "chase", aggro: 135,
  size: 17, heavy: true, miniboss: true,
  boss: {
    style: "duelist", intro: "THE LAST LIGHT FADES",
    color: "#b58ee6", specialEvery: 3.0,
    telegraph: 0.48, chargeSpeed: 145, chargeDur: 0.3,
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
registerEnemy({
  id: "riftbladeAdept",
  name: "Riftblade Adept",
  hp: 20, speed: 42, damage: 2,
  behavior: "chase", aggro: 170,
  size: 18, heavy: true, miniboss: true,
  ward: { types: ["sharp"], hp: 5 },
  boss: {
    style: "riftblade", intro: "FOLLOW THE BLADE — THEN BREAK THE RHYTHM",
    color: "#73eff7", specialEvery: 2.8,
    telegraph: 0.52, chargeSpeed: 150, chargeDur: 0.32,
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
