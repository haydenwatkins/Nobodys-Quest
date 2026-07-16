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

function makeGreenfieldTiles() {
  const W = 120;
  const H = 80;
  const rows = Array.from({ length: H }, () => Array(W).fill("."));
  const put = (x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) rows[y][x] = ch; };
  const box = (x0, y0, x1, y1, ch) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, ch);
  };

  for (let x = 0; x < W; x++) { put(x, 0, "t"); put(x, H - 1, "t"); }
  for (let y = 0; y < H; y++) { put(0, y, "t"); put(W - 1, y, "t"); }

  // Roads.
  for (let y = 1; y < H - 1; y++) put(60, y, "p");
  for (let x = 1; x < W - 1; x++) put(x, 40, "p");
  for (let y = 40; y <= 58; y++) put(32, y, "p");
  for (let x = 32; x <= 60; x++) put(x, 58, "p");

  // Forests and water.
  box(6, 3, 28, 13, "t");
  box(82, 4, 113, 16, "t");
  box(5, 61, 28, 76, "t");
  box(90, 61, 114, 76, "t");
  box(7, 25, 24, 34, "w");
  box(12, 23, 20, 36, "w");
  box(83, 28, 101, 35, "w");
  box(88, 25, 96, 38, "w");

  // Clear paths through big terrain chunks.
  for (let y = 3; y <= 13; y++) put(20, y, ".");
  for (let y = 4; y <= 16; y++) put(100, y, ".");
  for (let y = 61; y <= 76; y++) put(18, y, ".");
  for (let y = 61; y <= 76; y++) put(102, y, ".");
  for (let x = 7; x <= 24; x++) put(x, 30, ".");
  for (let x = 83; x <= 101; x++) put(x, 32, ".");

  // Side entrances: gaps in the outer wall.
  put(20, 0, "M"); put(20, 1, ".");
  put(60, 0, "D"); put(60, 1, ".");
  put(0, 30, "S"); put(1, 30, ".");
  put(W - 1, 45, "E"); put(W - 2, 45, ".");
  put(90, H - 1, "V"); put(90, H - 2, ".");
  put(30, H - 1, "W"); put(30, H - 2, ".");
  put(W - 1, 18, "R"); put(W - 2, 18, ".");
  put(40, 0, "L"); put(40, 1, ".");
  put(50, H - 1, "U"); put(50, H - 2, ".");
  put(W - 1, 60, "F"); put(W - 2, 60, ".");
  put(110, 0, "Y"); put(110, 1, ".");

  // Landmarks.
  put(57, 44, "s");
  put(25, 57, "C");
  put(79, 13, "G");
  put(74, 18, "r");
  put(76, 18, "r");
  put(34, 47, "r");
  put(92, 47, "r");
  put(99, 58, "r");

  // Enemy pockets spread across the larger overworld.
  [
    [42, 35, "1"], [48, 50, "1"], [25, 45, "1"], [20, 56, "1"], [72, 50, "1"], [108, 54, "1"],
    [36, 30, "2"], [52, 27, "2"], [70, 35, "2"], [86, 43, "2"], [105, 24, "2"], [18, 67, "2"],
    [75, 20, "3"], [78, 22, "3"], [94, 50, "3"], [101, 52, "3"], [45, 66, "3"],
    [86, 11, "4"], [90, 13, "4"], [98, 17, "4"], [90, 34, "4"], [99, 33, "4"], [111, 67, "4"],
  ].forEach(([x, y, ch]) => put(x, y, ch));

  return rows.map((row) => row.join(""));
}

/* ================== THE OVERWORLD (120 x 80) ================== */

registerMap({
  id: "overworld",
  name: "Greenfield",
  playerStart: { x: 60, y: 45 },

  legend: {
    "1": { tile: "grass", enemy: "slime" },
    "2": { tile: "grass", enemy: "bat" },
    "3": { tile: "grass", enemy: "bones" },
    "4": { tile: "grass", enemy: "wisp" },
    "s": { tile: "grass", message: "Welcome, little Nobody! Smack baddies with A. Quests live in the ☰ menu!" },
    "G": { tile: "grass", message: "Beware the wisp grove... wisps only fear the LIGHT." },
    "D": { tile: "tree", portal: { map: "dungeon", x: 15, y: 14 }, stars: 3 },
    "M": { tile: "grass", portal: { map: "mistwood", x: 2, y: 1 }, stars: 1, portalStyle: "gap" },
    "S": { tile: "grass", portal: { map: "sunkenMarsh", x: 4, y: 9 }, stars: 4, portalStyle: "gap" },
    "E": { tile: "grass", portal: { map: "emberRidge", x: 2, y: 1 }, stars: 7, portalStyle: "gap" },
    "V": { tile: "grass", portal: { map: "starfallRuins", x: 2, y: 1 }, stars: 10, portalStyle: "gap" },
    "W": { tile: "grass", portal: { map: "whispering-grove", x: 2, y: 10 }, stars: 0, portalStyle: "gap" },
    "R": { tile: "grass", portal: { map: "riftbladeTrial", x: 2, y: 8 }, stars: 18, portalStyle: "trial", portalTheme: "riftblade" },
    "L": { tile: "grass", portal: { map: "moleTrial", x: 3, y: 8 }, stars: 20, portalStyle: "trial", portalTheme: "mole" },
    "U": { tile: "grass", portal: { map: "vampireTrial", x: 3, y: 8 }, stars: 22, portalStyle: "trial", portalTheme: "vampire" },
    "F": { tile: "grass", portal: { map: "jesterTrial", x: 3, y: 8 }, stars: 24, portalStyle: "trial", portalTheme: "jester" },
    "Y": { tile: "grass", portal: { map: "godTrial", x: 3, y: 8 }, stars: 0, mastery: { before: "god", level: 5 }, portalStyle: "trial", portalTheme: "god" },
    "C": { tile: "grass", chest: { heal: true, name: "a giant cookie" } },
  },

  tiles: makeGreenfieldTiles(),
});

/* ================== RIFTBLADE TRIAL (28 x 17) ================== */

registerMap({
  id: "riftbladeTrial",
  name: "Riftblade Trial",
  visualTheme: "riftblade",
  playerStart: { x: 2, y: 8 },
  bossTrial: { exit: { map: "overworld", x: 118, y: 18 }, delay: 1.5 },

  legend: {
    "x": { tile: "floor", portal: { map: "overworld", x: 118, y: 18 } },
    "B": { tile: "floor", enemy: "riftbladeAdept" },
    "m": { tile: "floor", message: "The Adept bends every returning blade by moving. Watch the path out — then dodge the path home." },
    "H": { tile: "floor", chest: { heal: true, name: "a perfectly folded star-cookie" } },
    "R": { tile: "rock", on: "floor" },
  },

  tiles: [
    "############################",
    "#ffffffffffffffffffffffffff#",
    "#fffRffffffffffffffffffRfff#",
    "#ffffffffffffffffffffffffff#",
    "#ffffffffffffffffffffffffff#",
    "#ffffffffffffRfffffffffffff#",
    "#ffffffffffffffffffffffffff#",
    "#ffffHfffffffffffffffffffff#",
    "xffmfffffffffffffffffBfffff#",
    "#ffffffffffffffffffffffffff#",
    "#ffffffffffffffffffffffffff#",
    "#ffffffffffffRfffffffffffff#",
    "#ffffffffffffffffffffffffff#",
    "#ffffffffffffffffffffffffff#",
    "#fffRffffffffffffffffffRfff#",
    "#ffffffffffffffffffffffffff#",
    "############################",
  ],
});

/* ================== FORM TRIALS (28 x 17) ================== */

function makeFormTrialArena(variant) {
  const w = 28, h = 17;
  const rows = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => (x === 0 || y === 0 || x === w - 1 || y === h - 1) ? "#" : "f"));
  const put = (x, y, ch) => { rows[y][x] = ch; };
  put(0, 8, "x"); put(4, 8, "m"); put(6, variant % 2 ? 5 : 11, "H"); put(22, 8, "B");
  const rocks = [
    [[8,3],[17,4],[13,12],[23,14]],
    [[10,3],[19,3],[14,13],[23,11]],
    [[8,4],[16,3],[12,13],[21,13]],
    [[9,3],[18,3],[9,13],[18,13]],
  ][variant % 4];
  rocks.forEach(([x, y]) => put(x, y, "R"));
  return rows.map((row) => row.join(""));
}

registerMap({
  id: "moleTrial", name: "The Royal Burrow", playerStart: { x: 3, y: 8 },
  visualTheme: "mole",
  bossTrial: { exit: { map: "overworld", x: 40, y: 1 }, delay: 1.5 },
  legend: {
    "x": { tile: "floor", portal: { map: "overworld", x: 40, y: 1 } },
    "B": { tile: "floor", enemy: "moleMonarch" },
    "m": { tile: "floor", message: "A tiny plaque reads: PLEASE KNOCK. The next line reads: TOO LATE." },
    "H": { tile: "floor", chest: { heal: true, name: "an underground shortbread" } },
    "R": { tile: "rock", on: "floor" },
  },
  tiles: makeFormTrialArena(0),
});

registerMap({
  id: "vampireTrial", name: "Carmine Court", playerStart: { x: 3, y: 8 },
  visualTheme: "vampire",
  bossTrial: { exit: { map: "overworld", x: 50, y: 78 }, delay: 1.5 },
  legend: {
    "x": { tile: "floor", portal: { map: "overworld", x: 50, y: 78 } },
    "B": { tile: "floor", enemy: "countessCarmine" },
    "m": { tile: "floor", message: "The invitation says FORMAL COMBAT. Capes optional. Dramatic entrances mandatory." },
    "H": { tile: "floor", chest: { heal: true, name: "a suspiciously red velvet cookie" } },
    "R": { tile: "rock", on: "floor" },
  },
  tiles: makeFormTrialArena(1),
});

registerMap({
  id: "jesterTrial", name: "The Crooked Court", playerStart: { x: 3, y: 8 },
  visualTheme: "jester",
  bossTrial: { exit: { map: "overworld", x: 118, y: 60 }, delay: 1.5 },
  legend: {
    "x": { tile: "floor", portal: { map: "overworld", x: 118, y: 60 } },
    "B": { tile: "floor", enemy: "royalFool" },
    "m": { tile: "floor", message: "Tonight only: one hero, several pies, absolutely no responsible adults." },
    "H": { tile: "floor", chest: { heal: true, name: "a custard-proof cookie" } },
    "R": { tile: "rock", on: "floor" },
  },
  tiles: makeFormTrialArena(2),
});

registerMap({
  id: "godTrial", name: "The Final Firmament", playerStart: { x: 3, y: 8 },
  visualTheme: "god",
  bossTrial: { exit: { map: "overworld", x: 110, y: 1 }, delay: 1.7 },
  legend: {
    "x": { tile: "floor", portal: { map: "overworld", x: 110, y: 1 } },
    "B": { tile: "floor", enemy: "godAvatar" },
    "m": { tile: "floor", message: "FINAL EXAM: bring every form. Pencils will not be provided because swords are funnier." },
    "H": { tile: "floor", chest: { heal: true, name: "the last cookie (allegedly)" } },
    "R": { tile: "rock", on: "floor" },
  },
  tiles: makeFormTrialArena(3),
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
    "x": { tile: "floor", portal: { map: "overworld", x: 60, y: 1 } },
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

/* ================== YOUR TOWN (30 x 18) ================== */

registerMap({
  id: "town",
  name: "Your Town",
  playerStart: { x: 15, y: 14 },

  legend: {
    "a": { tile: "grass", townPlot: "a" },
    "b": { tile: "grass", townPlot: "b" },
    "c": { tile: "grass", townPlot: "c" },
    "d": { tile: "grass", townPlot: "d" },
    "e": { tile: "grass", townPlot: "e" },
    "f": { tile: "grass", townPlot: "f" },
    "g": { tile: "grass", townPlot: "g" },
    "h": { tile: "grass", townPlot: "h" },
    "P": { tile: "grass", playerHouse: true },
    "H": { tile: "path", portal: { map: "playerHouse", x: 7, y: 7 } },
    "s": { tile: "grass", message: "Walk onto an empty plot to build a house. Houses cost town spirit." },
    "x": { tile: "grass", portal: { map: "overworld", x: 60, y: 45 } },
  },

  tiles: [
    "tttttttttttttttttttttttttttttt",
    "t............PPPP............t",
    "t....a.......PPPP....b.......t",
    "t.............H..............t",
    "t..tttt......p......tttt.....t",
    "t............p...............t",
    "t....c.......p.......d.......t",
    "t............p...............t",
    "tppppppppppppppppppppppppppppt",
    "t............s...............t",
    "t....e.......p.......f.......t",
    "t............p...............t",
    "t..tttt......p......tttt.....t",
    "t............p...............t",
    "t....g.......p.......h.......t",
    "t............p...............t",
    "t.............x..............t",
    "tttttttttttttttttttttttttttttt",
  ],
});

/* ================== PLAYER HOUSE (15 x 10) ================== */

registerMap({
  id: "playerHouse",
  name: "Your House",
  playerStart: { x: 7, y: 6 },

  legend: {
    "x": { tile: "floor", portal: { map: "town", x: 14, y: 4 } },
    "b": { tile: "floor", rest: true, restText: "Rested at home. HP and mana restored." },
    "c": { tile: "floor", chest: { heal: true, name: "your emergency cookie stash" } },
    "r": { tile: "rock", on: "floor" },
  },

  tiles: [
    "###############",
    "#fffffffffffff#",
    "#ffbfffffffcff#",
    "#fffffffffffff#",
    "#ffffrffffrfff#",
    "#fffffffffffff#",
    "#ffffffxffffff#",
    "#fffffffffffff#",
    "#fffffffffffff#",
    "###############",
  ],
});

/* ================== MISTWOOD (30 x 19) ================== */

registerMap({
  id: "mistwood",
  name: "Mistwood",
  playerStart: { x: 2, y: 1 },

  legend: {
    "1": { tile: "grass", enemy: "slime" },
    "2": { tile: "grass", enemy: "bat" },
    "3": { tile: "grass", enemy: "bones" },
    "A": { tile: "grass", enemy: "ancientTreant" },
    "m": { tile: "grass", message: "Mistwood twists back on itself. Keep moving and the trees will open." },
    "x": { tile: "grass", portal: { map: "overworld", x: 20, y: 1 } },
    "H": { tile: "grass", chest: { heal: true, name: "a berry pie hidden under leaves" } },
  },

  tiles: [
    "tttttttttttttttttttttttttttttt",
    "tx....t....1....t....2.......t",
    "t...t.t.tt.tt.ttt.t.tttt.....t",
    "t...t...t...t.t...t....t.....t",
    "t1..t.tttt.1.t.t.ttt.t.3.....t",
    "t...t......t.t.t...t.t.......t",
    "t..ttt.tt..t...tt..t.tt......t",
    "t.....2.t..ttt.....t..t......t",
    "t.tt....t.....ttt.tt.t.......t",
    "t.t....tttttt.t....1..t......t",
    "t.t.t......H...t.ttttt.......t",
    "t...t.ttt.tt.t.t.....2.......t",
    "t3..t.t........ttttttt.......t",
    "t...t.t......t....1..........t",
    "t.ttt.t....m...tttt.t........t",
    "t.....ttt.tttt....t.3........t",
    "t.1.........t....2.....A.....t",
    "t....2......t......1.........t",
    "tttttttttttttttttttttttttttttt",
  ],
});

/* ================== SUNKEN MARSH (30 x 19) ================== */

function makeSunkenMarshTiles() {
  const w = 30, h = 19;
  const rows = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => (x === 0 || y === 0 || x === w - 1 || y === h - 1) ? "t" : "."));
  const put = (x, y, ch) => { rows[y][x] = ch; };
  const pond = (cx, cy, rx, ry) => {
    for (let y = cy - ry; y <= cy + ry; y++) {
      for (let x = cx - rx; x <= cx + rx; x++) {
        const wobble = G.util.hash2(x + 31, y + 19) * 0.22;
        if (((x - cx) ** 2) / (rx * rx) + ((y - cy) ** 2) / (ry * ry) < 0.72 + wobble) put(x, y, "w");
      }
    }
  };

  // Broad ponds give the marsh a shape without enclosing walkable pockets.
  pond(7, 4, 4, 2);
  pond(22, 4, 4, 2);
  pond(7, 14, 4, 2);
  pond(23, 14, 4, 2);

  // A three-tile causeway and crossing keep every bank connected and make
  // the intended route readable even when enemies crowd it.
  for (let x = 0; x < w - 1; x++) for (let y = 8; y <= 10; y++) put(x, y, "p");
  for (let y = 1; y < h - 1; y++) for (let x = 14; x <= 16; x++) put(x, y, "p");

  [[3,3,"1"],[12,3,"4"],[18,3,"2"],[27,5,"4"],[5,7,"2"],[11,7,"1"],
   [19,7,"8"],[26,7,"1"],[4,12,"1"],[12,12,"4"],[18,12,"2"],[27,12,"8"],
   [11,16,"2"],[19,16,"1"]].forEach(([x, y, ch]) => put(x, y, ch));
  put(0, 9, "x");
  put(8, 9, "m");
  put(12, 15, "H");
  put(23, 9, "Q");
  return rows.map((row) => row.join(""));
}

registerMap({
  id: "sunkenMarsh",
  name: "Sunken Marsh",
  playerStart: { x: 4, y: 9 },

  legend: {
    "1": { tile: "grass", enemy: "slime" },
    "2": { tile: "grass", enemy: "bat" },
    "4": { tile: "grass", enemy: "wisp" },
    "8": { tile: "grass", enemy: "shade" },
    "Q": { tile: "grass", enemy: "mireQueen" },
    "m": { tile: "grass", message: "The Mire Queen's purple veil fears DARK magic. Return with a Wizard's spell if it holds." },
    "x": { tile: "path", portal: { map: "overworld", x: 1, y: 30 } },
    "H": { tile: "grass", chest: { heal: true, name: "a soggy-but-magical cookie" } },
  },

  tiles: makeSunkenMarshTiles(),
});

/* ================== EMBER RIDGE (30 x 19) ================== */

registerMap({
  id: "emberRidge",
  name: "Ember Ridge",
  playerStart: { x: 2, y: 1 },

  legend: {
    "2": { tile: "floor", enemy: "bat" },
    "3": { tile: "floor", enemy: "bones" },
    "5": { tile: "floor", enemy: "brute" },
    "8": { tile: "floor", enemy: "shade" },
    "N": { tile: "floor", enemy: "eclipseKnight" },
    "m": { tile: "floor", message: "Ember Ridge is brute country. DARK magic cracks the Eclipse Knight's purple ward." },
    "x": { tile: "floor", portal: { map: "overworld", x: 118, y: 45 } },
    "H": { tile: "floor", chest: { heal: true, name: "a warm cinnamon cookie" } },
    "R": { tile: "rock", on: "floor" },
  },

  tiles: [
    "##############################",
    "#xfffffRfffffRfffff5fffffffff#",
    "#ffRfffff3fffffRfffffffffffff#",
    "#f#####f#######f###ffffffffff#",
    "#ffffRffff2ffffRfffffffffffff#",
    "###f###f###f###f###ffffffffff#",
    "#ff3ffffRffff5ffffRffff8fffff#",
    "#fRfff#######ffffRfffffffffff#",
    "#fff2#fffmfff#3ffffffffffffff#",
    "#f###f#f#####f#f###ffffffffff#",
    "#ffff#fffHfff#ffff5ffffffffff#",
    "#ffR#####f#####Rfffffffffffff#",
    "#f3ffffRffffRffff2fffffffffff#",
    "#fff###f###f###ffffffffffffff#",
    "#Nfffff3ffffRffffffffffffffff#",
    "#ffffRffff2ffffRfffffffffffff#",
    "#ffffffff5fffffff8fffffffffff#",
    "#fffRfffffff3ffffffffffffffff#",
    "##############################",
  ],
});

/* ================== STARFALL RUINS (30 x 19) ================== */

registerMap({
  id: "starfallRuins",
  name: "Starfall Ruins",
  playerStart: { x: 2, y: 1 },

  legend: {
    "2": { tile: "floor", enemy: "bat" },
    "3": { tile: "floor", enemy: "bones" },
    "4": { tile: "floor", enemy: "wisp" },
    "5": { tile: "floor", enemy: "brute" },
    "8": { tile: "floor", enemy: "shade" },
    "m": { tile: "floor", message: "The ruins hum like a cracked star. Every damage type matters here." },
    "x": { tile: "floor", portal: { map: "overworld", x: 90, y: 78 } },
    "H": { tile: "floor", chest: { heal: true, name: "a star-sugar cookie" } },
    "R": { tile: "rock", on: "floor" },
  },

  tiles: [
    "##############################",
    "#xffff4ffffRffff8ffffffffffff#",
    "#fff#####ffff#####fffffffffff#",
    "#f2f#fff#f3f#fff#f2ffffffffff#",
    "#fff#fHf#fff#fmf#ffffffffffff#",
    "###f#fff###f#fff###ffffffffff#",
    "#fff#####ffff#####4ffffffffff#",
    "#fRffff8ff5ff4ffffRffffffffff#",
    "#ffff#########fffffffffffffff#",
    "#f4f#fff3fff#f4ffffffffffffff#",
    "#fff#f#####f#fffRffffffffffff#",
    "#f2f#fff5fff#f2ffffffffffffff#",
    "#ffff#########fffffffffffffff#",
    "#fRffff4ffff4ffffRfffffffffff#",
    "#fff#####ffff#####fffffffffff#",
    "#f4ffff3f5f3ffff4ffffffffffff#",
    "#ffffffff8fffffffffffffffffff#",
    "#fff4ffffRffff4ffffffffffffff#",
    "##############################",
  ],
});


/* ================== WHISPERING GROVE (30 x 18) ================== */

registerMap({
  id: "whispering-grove",
  name: "Whispering Grove",
  playerStart: { x: 2, y: 10 },

  legend: {
    "x": { tile: "grass", portal: { map: "overworld", x: 30, y: 77 } },
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
