/* ============================================================
   MAPS — the world, drawn with letters!

   Built-in letters:  . grass   t tree   w water   p path
                      # wall    f floor  r rock
   Everything else is defined in each map's own legend below.

   Ben: try editing the overworld! Add a pond, a maze of trees,
   more slimes... just keep every row the SAME LENGTH, and keep
   the border solid so nobody walks off the edge of the world.
   ============================================================ */

"use strict";

/* ================== THE OVERWORLD (40 x 24) ================== */

registerMap({
  id: "overworld",
  name: "Greenfield",
  playerStart: { x: 19, y: 18 },

  legend: {
    "1": { tile: "grass", enemy: "slime" },
    "2": { tile: "grass", enemy: "bat" },
    "3": { tile: "grass", enemy: "bones" },
    "4": { tile: "grass", enemy: "wisp" },
    "s": { tile: "grass", message: "Welcome, little Nobody! Smack baddies with A. Quests live in the ☰ menu!" },
    "G": { tile: "grass", message: "Beware the wisp grove... wisps only fear the LIGHT." },
    "D": { tile: "tree", portal: { map: "dungeon", x: 15, y: 14 }, stars: 3 },
    "E": { tile: "grass", portal: { map: "whispering-grove", x: 2, y: 10 } },
    "C": { tile: "grass", chest: { heal: true, name: "a giant cookie" } },
  },

  tiles: [
    "tttttttttttttttttttttttttttttttttttttttt",
    "tttttttttttttttttttDtttttttttttttttttttt",
    "t..................p.........t.4..4...tt",
    "t..................p....G.............tt",
    "t...2..............p.........t...4....tt",
    "t..................p.........ttttttttttt",
    "t....wwwww.........p...................t",
    "t...wwwwwww........p....1..............t",
    "t...wwwwwww........p............2......t",
    "t....wwwww.........p...................t",
    "t.1................p......r.....33.....t",
    "t..................p...................t",
    "t...1..............p.....1....3.......tt",
    "t..................p..........2.......tt",
    "t......r...........p...1..............tt",
    "t..................p...................t",
    "t.................sp...................t",
    "t..................p...................t",
    "t.................................E....t",
    "ttttt...................1..............t",
    "tC..t..............................1...t",
    "t....1.........1.......................t",
    "ttttt..................................t",
    "tttttttttttttttttttttttttttttttttttttttt",
  ],
});

/* ================== THE OLD DUNGEON (30 x 18) ================== */

registerMap({
  id: "dungeon",
  name: "The Old Dungeon",
  playerStart: { x: 15, y: 14 },

  legend: {
    "2": { tile: "floor", enemy: "bat" },
    "3": { tile: "floor", enemy: "bones" },
    "4": { tile: "floor", enemy: "wisp" },
    "5": { tile: "floor", enemy: "brute" },
    "m": { tile: "floor", message: "A rumble echoes... the Brute guarding the treasure HATES sharp things." },
    "x": { tile: "floor", portal: { map: "overworld", x: 19, y: 2 } },
    "K": { tile: "floor", chest: { item: "knights-crest", name: "the Knight's Crest" } },
    "H": { tile: "floor", chest: { heal: true, name: "a dusty (but delicious) cookie" } },
    "R": { tile: "rock", on: "floor" },
  },

  tiles: [
    "#############################",
    "#KffffffH############fff4fff#",
    "#ffffffff############ff2ffff#",
    "#ffffffff############fffff2f#",
    "#ffffffff############ffffff##",
    "####f################f#######",
    "#fff5fffffffffffffffffffffff#",
    "#ffffff3ffffffffffffff3fffff#",
    "#ffffffffffff2ffffffffffffff#",
    "#ffRffffffffffffffffffffRfff#",
    "#ffffffffffff3ffffffffffffff#",
    "#ffffffffffffffffff2ffffffff#",
    "#fff3ffffffffffffffffff3ffff#",
    "#ffffffffffffffmffffffffffff#",
    "###############f#############",
    "###############f#############",
    "###############x#############",
    "#############################",
  ],
});

/* ================== WHISPERING GROVE (30 x 18) ================== */

registerMap({
  id: "whispering-grove",
  name: "Whispering Grove",
  playerStart: { x: 2, y: 10 },

  legend: {
    "x": { tile: "grass", portal: { map: "overworld", x: 33, y: 18 } },
    "s": { tile: "grass", message: "The grove whispers: ward colors are clues. Match the damage type shown above the enemy!" },
    "2": { tile: "grass", enemy: "bat" },
    "3": { tile: "grass", enemy: "bones" },
    "6": { tile: "grass", enemy: "thornling" },
    "7": { tile: "grass", enemy: "pebblebeast" },
    "C": { tile: "grass", chest: { heal: true, name: "a moonberry pie" } },
    "T": { tile: "grass", chest: { item: "whispering-seed", name: "the Whispering Seed" } },
  },

  tiles: [
    "tttttttttttttttttttttttttttttt",
    "t....6.......tt..............t",
    "t............tt.....6........t",
    "t..wwww......tt..............t",
    "t..wwww..7...tt....2.........t",
    "t..wwww......tt..............t",
    "t............ttttttt..tttttttt",
    "t....3.......................t",
    "t..........s.................t",
    "t...............7............t",
    "tx..........................Ct",
    "t........tttt................t",
    "t..6.....t..t......3.........t",
    "t........t..t................t",
    "t........t..tttttttt.........t",
    "t........t..............T....t",
    "t............................t",
    "tttttttttttttttttttttttttttttt",
  ],
});
