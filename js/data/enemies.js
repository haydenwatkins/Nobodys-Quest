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
