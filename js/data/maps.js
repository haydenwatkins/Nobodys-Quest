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
  put(0, 65, "Z"); put(1, 65, ".");
  put(W - 1, 70, "P"); put(W - 2, 70, "p");

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
    "Z": { tile: "grass", portal: { map: "shattercoast", x: 2, y: 14 }, stars: 28, portalStyle: "gap" },
    "P": { tile: "path", portal: { map: "sunstepPrairie", x: 2, y: 14 }, stars: 24, portalStyle: "gap", seamless: true },
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

/* ================== SHATTERCOAST EXPANSION ================== */

function makeShattercoastTiles() {
  const w = 48, h = 30;
  const rows = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => (x === 0 || y === 0 || x === w - 1 || y === h - 1) ? "r" : "."));
  const put = (x, y, ch) => { rows[y][x] = ch; };
  // A broad crossroad keeps the five landmarks readable on a phone while
  // tide pools and stone shelves make movement visually measurable.
  for (let x = 1; x < w - 1; x++) for (let y = 13; y <= 15; y++) put(x, y, "p");
  for (let y = 1; y < h - 1; y++) for (let x = 22; x <= 24; x++) put(x, y, "p");
  for (let y = 3; y <= 9; y++) for (let x = 4; x <= 9; x++) put(x, y, "w");
  for (let y = 20; y <= 26; y++) for (let x = 38; x <= 43; x++) put(x, y, "w");
  [[14,4],[17,8],[31,5],[37,10],[9,20],[16,25],[31,22],[35,26]].forEach(([x,y]) => put(x,y,"r"));
  [[8,12,"9"],[14,17,"8"],[19,7,"6"],[29,8,"0"],[35,17,"4"],[40,12,"9"],[25,22,"0"],[7,25,"6"]]
    .forEach(([x,y,ch]) => put(x,y,ch));
  put(0, 14, "x");
  put(w - 1, 14, "F");
  put(11, 5, "T"); put(36, 5, "K"); put(11, 24, "A"); put(36, 24, "D");
  put(23, 14, "G"); put(19, 14, "m"); put(27, 14, "H");
  return rows.map((row) => row.join(""));
}

registerMap({
  id: "shattercoast", name: "Shattercoast", playerStart: { x: 2, y: 14 },
  legend: {
    "x": { tile: "path", portal: { map: "overworld", x: 1, y: 65 } },
    "F": { tile: "path", portal: { map: "frostbellTundra", x: 2, y: 14 }, portalStyle: "gap", seamless: true },
    "4": { tile: "grass", enemy: "wisp" }, "5": { tile: "grass", enemy: "brute" },
    "6": { tile: "grass", enemy: "thornling" }, "7": { tile: "grass", enemy: "pebblebeast" },
    "8": { tile: "grass", enemy: "shade" },
    "9": { tile: "grass", enemy: "tideCrab" }, "0": { tile: "grass", enemy: "starMote" },
    "T": { tile: "path", portal: { map: "turtleTrial", x: 3, y: 8 }, portalStyle: "trial", portalTheme: "turtle" },
    "K": { tile: "path", portal: { map: "samuraiTrial", x: 3, y: 8 }, portalStyle: "trial", portalTheme: "samurai" },
    "A": { tile: "path", portal: { map: "astronomerTrial", x: 3, y: 8 }, portalStyle: "trial", portalTheme: "astronomer" },
    "D": { tile: "path", portal: { map: "druidTrial", x: 3, y: 8 }, portalStyle: "trial", portalTheme: "druid" },
    "G": { tile: "path", portal: { map: "gauntletArena", x: 3, y: 8 }, portalStyle: "trial", portalTheme: "god" },
    "m": { tile: "path", message: "Four guardians teach four new forms. The central coliseum remixes every guardian you have already defeated." },
    "H": { tile: "path", chest: { heal: true, name: "a salt-spark cookie" } },
  },
  tiles: makeShattercoastTiles(),
});

function makeExpansionTrialArena(variant) {
  const rows = makeFormTrialArena(variant).map((row) => row.split(""));
  rows[8][0] = "x"; rows[8][4] = "m"; rows[8][22] = "B";
  return rows.map((row) => row.join(""));
}

[
  { id: "turtleTrial", name: "The Breakwater Bastion", theme: "turtle", boss: "admiralTortoise", variant: 0,
    exit: { x: 11, y: 5 }, sign: "The Admiral's shell volleys leave lanes. Brace, reposition, then answer the charge." },
  { id: "samuraiTrial", name: "The Folded Dojo", theme: "samurai", boss: "paperRonin", variant: 1,
    exit: { x: 36, y: 5 }, sign: "Three deliberate cuts beat one frantic swing. Watch the pause before the draw." },
  { id: "astronomerTrial", name: "The Crooked Observatory", theme: "astronomer", boss: "professorPerihelion", variant: 2,
    exit: { x: 11, y: 24 }, sign: "Orbits are patterns, not walls. Cross a ring after it passes and close the distance." },
  { id: "druidTrial", name: "The Walking Garden", theme: "druid", boss: "grandmotherBriar", variant: 3,
    exit: { x: 36, y: 24 }, sign: "Seeds spread wide; briars leave narrow gaps. Keep moving and prune from the edges." },
].forEach((trial) => registerMap({
  id: trial.id, name: trial.name, visualTheme: trial.theme, playerStart: { x: 3, y: 8 },
  bossTrial: { exit: { map: "shattercoast", x: trial.exit.x, y: trial.exit.y }, delay: 1.7 },
  legend: {
    "x": { tile: "floor", portal: { map: "shattercoast", x: trial.exit.x, y: trial.exit.y } },
    "B": { tile: "floor", enemy: trial.boss }, "m": { tile: "floor", message: trial.sign },
    "H": { tile: "floor", chest: { heal: true, name: "a guardian's travel biscuit" } },
    "R": { tile: "rock", on: "floor" },
  },
  tiles: makeExpansionTrialArena(trial.variant),
}));

registerMap({
  id: "gauntletArena", name: "The Manyfold Coliseum", visualTheme: "god", playerStart: { x: 3, y: 8 },
  bossTrial: { exit: { map: "shattercoast", x: 23, y: 14 }, delay: 1.7 },
  legend: {
    "x": { tile: "floor", portal: { map: "shattercoast", x: 23, y: 14 } },
    "m": { tile: "floor", message: "Open the menu's Gauntlet tab to choose a run. Recovery campfires fully heal you and restore three mana." },
    "R": { tile: "rock", on: "floor" },
  },
  tiles: [
    "############################", "#ffffffffffffffffffffffffff#", "#fffRffffffffffffffffffRfff#",
    "#ffffffffffffffffffffffffff#", "#ffffffffffffffffffffffffff#", "#ffffffffffffffffffffffffff#",
    "#ffffffffffffffffffffffffff#", "#ffffffffffffffffffffffffff#", "xffmfffffffffffffffffffffff#",
    "#ffffffffffffffffffffffffff#", "#ffffffffffffffffffffffffff#", "#ffffffffffffffffffffffffff#",
    "#ffffffffffffffffffffffffff#", "#ffffffffffffffffffffffffff#", "#fffRffffffffffffffffffRfff#",
    "#ffffffffffffffffffffffffff#", "############################",
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
    "B": { tile: "grass", message: "The Hero Board keeps adventures coming after the guardian collection. Open its menu tab to accept a contract." },
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
    "t............B...............t",
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
    "s": { tile: "floor", message: "Starfall tests every ward. Match the four damage colors — or retreat and mix a new loadout." },
    "m": { tile: "floor", message: "A cracked tablet points west: THE FALLEN STAR STILL SHINES. The vault was built with a door, thankfully." },
    "x": { tile: "floor", portal: { map: "overworld", x: 90, y: 78 } },
    "H": { tile: "floor", chest: { item: "starfall-thread", heal: true, name: "the Fallen Star Thread" } },
    "R": { tile: "rock", on: "floor" },
  },

  tiles: [
    "##############################",
    "#xfsff4ffffRffff8ffffffffffff#",
    "#fff#####ffff#####fffffffffff#",
    "#f2f#fff#f3f#fff#f2ffffffffff#",
    "#fff#fHfffffffmf#ffffffffffff#",
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

/* ================== WORLDWAKE EXPANSION ==================
   These broad regions share a reusable layout grammar: readable three-tile
   trails, open combat pockets, memorable camps, and several connections.
   Boundary portals slide directly into the neighboring landscape.          */

function makeWorldwakeRegionTiles(variant, hasGuardian) {
  const w = 46, h = 29;
  const edge = variant === 2 || variant === 5 ? "r" : "t";
  const rows = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => (x === 0 || y === 0 || x === w - 1 || y === h - 1) ? edge : "."));
  const put = (x, y, ch) => { if (x >= 0 && y >= 0 && x < w && y < h) rows[y][x] = ch; };

  // A winding but unmistakable main road. The wide middle crossing keeps
  // touch play from becoming a collision puzzle when several enemies gather.
  for (let x = 1; x < w - 1; x++) for (let y = 13; y <= 15; y++) put(x, y, "p");
  for (let y = 1; y < h - 1; y++) for (let x = 22; x <= 24; x++) put(x, y, "p");
  for (let x = 7; x <= 38; x++) put(x, 7 + Math.round(Math.sin((x + variant) * 0.32) * 2), "p");

  // Large terrain patches establish speed and direction without closing off
  // any destination. Water for lush/cold lands, rock shelves for dry ones.
  const patchChar = ["t", "r", "w", "t", "r", "w", "r", "r"][variant];
  const patches = [[7,4,4,2], [37,5,4,2], [8,23,5,2], [37,23,4,2]];
  for (const [cx, cy, rx, ry] of patches) {
    for (let y = cy - ry; y <= cy + ry; y++) for (let x = cx - rx; x <= cx + rx; x++) {
      const shape = ((x - cx) ** 2) / (rx * rx) + ((y - cy) ** 2) / (ry * ry);
      if (shape < 0.82 + G.util.hash2(x + variant * 17, y + 8) * 0.18) put(x, y, patchChar);
    }
  }

  // Re-open guaranteed loops around every patch.
  for (let x = 3; x <= 42; x++) { put(x, 3, "."); put(x, 25, "."); }
  for (let y = 3; y <= 25; y++) { put(3, y, "."); put(42, y, "."); }

  const enemySets = [
    ["1", "2", "6"], ["2", "3", "7"], ["4", "6", "7"], ["2", "6", "8"],
    ["3", "7", "0"], ["4", "8", "9"], ["2", "5", "0"], ["3", "5", "8"],
  ];
  [[12,5],[31,5],[8,11],[37,11],[10,19],[34,19],[17,24],[29,24]].forEach(([x, y], i) =>
    put(x, y, enemySets[variant][i % 3]));
  put(19, 18, ["a", "a", "b", "b", "c", "d", "d", "e"][variant]);

  put(0, 14, "x"); put(w - 1, 14, "y"); put(23, 0, "n"); put(23, h - 1, "s");
  if (hasGuardian) put(35, 8, "B");
  put(10, 14, "m"); put(27, 14, "H"); put(7, 20, "C");
  return rows.map((row) => row.join(""));
}

const WORLDWAKE_COMMON_ENEMIES = {
  "1": { tile: "grass", enemy: "slime" }, "2": { tile: "grass", enemy: "bat" },
  "3": { tile: "grass", enemy: "bones" }, "4": { tile: "grass", enemy: "wisp" },
  "5": { tile: "grass", enemy: "brute" }, "6": { tile: "grass", enemy: "thornling" },
  "7": { tile: "grass", enemy: "pebblebeast" }, "8": { tile: "grass", enemy: "shade" },
  "9": { tile: "grass", enemy: "tideCrab" }, "0": { tile: "grass", enemy: "starMote" },
  "a": { tile: "grass", enemy: "sunHopper" }, "b": { tile: "grass", enemy: "loomling" },
  "c": { tile: "grass", enemy: "mirageSkater" }, "d": { tile: "grass", enemy: "bellMoth" },
  "e": { tile: "grass", enemy: "cairnWalker" },
  "C": { tile: "path", rest: true, restText: "The caravan campfire restores every heart and all mana." },
};

function worldwakeLegend(extra) {
  const common = {};
  for (const [key, cell] of Object.entries(WORLDWAKE_COMMON_ENEMIES)) common[key] = Object.assign({}, cell);
  return Object.assign(common, extra);
}

[
  {
    id: "sunstepPrairie", name: "Sunstep Prairie", biome: "sunstep", variant: 0,
    message: "The land ahead has no doors. Keep walking and the horizon will carry you into the next region.",
    portals: {
      x: { map: "overworld", x: 118, y: 70 }, y: { map: "windscarCanyon", x: 2, y: 14 },
      n: { map: "windscarCanyon", x: 23, y: 27 }, s: { map: "glasswaterDesert", x: 23, y: 1, mark: "sky" },
    },
    cache: { item: "sunstep-ribbon", name: "the Sunstep Ribbon" },
  },
  {
    id: "windscarCanyon", name: "Windscar Canyon", biome: "windscar", variant: 1,
    message: "Claw marks cross the canyon wall, each one wider than a wagon. Their owner is circling above.",
    portals: {
      x: { map: "sunstepPrairie", x: 43, y: 14 }, y: { map: "hangingGardens", x: 2, y: 14 },
      n: { map: "hangingGardens", x: 23, y: 27 }, s: { map: "sunstepPrairie", x: 23, y: 1 },
    },
    guardian: { id: "skySovereign", retreat: { x: 8, y: 20 } },
    cache: { item: "windscar-feather", name: "a Windscar Feather" },
  },
  {
    id: "hangingGardens", name: "Hanging Gardens", biome: "gardens", variant: 2,
    message: "These terraces are not ruins. The Old Mason is still building them, one patient footstep at a time.",
    portals: {
      x: { map: "windscarCanyon", x: 43, y: 14 }, y: { map: "rootdeepHollow", x: 2, y: 14 },
      n: { map: "rootdeepHollow", x: 23, y: 27, mark: "stone" }, s: { map: "windscarCanyon", x: 23, y: 1 },
    },
    guardian: { id: "oldMason", retreat: { x: 8, y: 20 } },
    cache: { item: "garden-keystone", name: "a singing Garden Keystone" },
  },
  {
    id: "rootdeepHollow", name: "Rootdeep Hollow", biome: "rootdeep", variant: 3,
    message: "The silver threads are roads. Step gently; the Weaver remembers every traveler by name.",
    portals: {
      x: { map: "hangingGardens", x: 43, y: 14 }, y: { map: "glasswaterDesert", x: 2, y: 14 },
      n: { map: "hangingGardens", x: 23, y: 27 }, s: { map: "glasswaterDesert", x: 23, y: 1, mark: "thread" },
    },
    guardian: { id: "silkMatriarch", retreat: { x: 8, y: 20 } },
    cache: { item: "rootdeep-silk", name: "the unbreakable Rootdeep Silk" },
  },
  {
    id: "glasswaterDesert", name: "Glasswater Desert", biome: "glasswater", variant: 4,
    message: "At noon the sand reflects places that do not exist. At dusk it reflects the road to Titan Grave.",
    portals: {
      x: { map: "rootdeepHollow", x: 43, y: 14 }, y: { map: "titanGrave", x: 23, y: 1, mark: "light" },
      n: { map: "rootdeepHollow", x: 23, y: 27 }, s: { map: "sunstepPrairie", x: 23, y: 1, mark: "sky" },
    },
    cache: { item: "glasswater-prism", name: "the Glasswater Prism" },
  },
  {
    id: "frostbellTundra", name: "Frostbell Tundra", biome: "frostbell", variant: 5,
    message: "Every frozen arch rings a different note. The Bell Titan is trying very hard to tune the wind.",
    portals: {
      x: { map: "shattercoast", x: 45, y: 14 }, y: { map: "stormspinePeaks", x: 2, y: 14 },
      n: { map: "stormspinePeaks", x: 23, y: 27, mark: "echo" }, s: { map: "shattercoast", x: 45, y: 14 },
    },
    guardian: { id: "bellTitan", retreat: { x: 8, y: 20 } },
    cache: { item: "frostbell-chime", name: "a Frostbell Chime" },
  },
  {
    id: "stormspinePeaks", name: "Stormspine Peaks", biome: "stormspine", variant: 6,
    message: "The lanterns do not mark a safe road. They are the safe road. Stay near their warm light.",
    portals: {
      x: { map: "frostbellTundra", x: 43, y: 14 }, y: { map: "titanGrave", x: 2, y: 14 },
      n: { map: "titanGrave", x: 23, y: 27, mark: "light" }, s: { map: "frostbellTundra", x: 23, y: 1 },
    },
    guardian: { id: "lanternKeeper", retreat: { x: 8, y: 20 } },
    cache: { item: "stormglass-lantern", name: "the Stormglass Lantern" },
  },
  {
    id: "titanGrave", name: "Titan Grave", biome: "titan", variant: 7,
    message: "The mountain ahead is breathing. Six paths meet at its heart, and it has been waiting for Nobody.",
    portals: {
      x: { map: "stormspinePeaks", x: 43, y: 14 }, y: { map: "glasswaterDesert", x: 43, y: 14 },
      n: { map: "glasswaterDesert", x: 23, y: 27 }, s: { map: "stormspinePeaks", x: 23, y: 1 },
    },
    guardian: { id: "lastWorldbearer", retreat: { x: 8, y: 20 } },
    cache: { item: "titan-memory", name: "the Titan's Smallest Memory" },
  },
].forEach((region) => {
  const p = region.portals;
  const guardian = region.guardian;
  registerMap({
    id: region.id, name: region.name, biome: region.biome, worldwake: true,
    worldBoss: guardian ? { enemy: guardian.id, region: region.name } : null,
    // Losing an open-world guardian fight returns Nobody to that region's
    // caravan fire and reloads the whole living landscape. The guardian and
    // ordinary creatures therefore begin the next attempt at full strength.
    bossTrial: guardian ? {
      worldBoss: true,
      exit: { map: region.id, x: guardian.retreat.x, y: guardian.retreat.y },
      delay: 2.1,
    } : null,
    playerStart: { x: 3, y: 14 },
    legend: worldwakeLegend({
      "x": { tile: "path", portal: p.x, portalStyle: "gap", seamless: true, mark: p.x.mark },
      "y": { tile: "path", portal: p.y, portalStyle: "gap", seamless: true, mark: p.y.mark },
      "n": { tile: "path", portal: p.n, portalStyle: "gap", seamless: true, mark: p.n.mark },
      "s": { tile: "path", portal: p.s, portalStyle: "gap", seamless: true, mark: p.s.mark },
      // The Worldbearer is part of the same simulation as the roads, terrain,
      // caches, and ordinary enemies. There is deliberately no trial door.
      "B": guardian ? { tile: "path", enemy: guardian.id } : { tile: "path" },
      "m": { tile: "path", message: region.message },
      "H": { tile: "path", chest: Object.assign({ heal: true }, region.cache) },
    }),
    tiles: makeWorldwakeRegionTiles(region.variant, !!guardian),
  });
});

function makeWorldbearerArena(variant) {
  const w = 38, h = 23;
  const rows = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) =>
    (x === 0 || y === 0 || x === w - 1 || y === h - 1) ? "#" : "f"));
  const put = (x, y, ch) => { rows[y][x] = ch; };
  put(0, 11, "x"); put(4, 11, "m"); put(31, 11, "B"); put(8, 18, "H");
  const shapes = [
    [[13,4],[21,5],[16,17],[27,17]], [[12,5],[24,4],[15,17],[26,16]],
    [[14,4],[24,7],[12,16],[23,18]], [[11,4],[20,6],[28,5],[18,18]],
    [[14,5],[25,4],[11,17],[27,17]], [[11,5],[19,4],[27,6],[14,17],[25,18]],
  ][variant];
  shapes.forEach(([x, y]) => put(x, y, "R"));
  return rows.map((row) => row.join(""));
}

[
  { id: "griffinWorldback", name: "The Sky Sovereign's Back", theme: "griffin", boss: "skySovereign", exitMap: "windscarCanyon",
    sign: "The canyon drops away. What looked like an island opens one enormous golden eye." },
  { id: "golemWorldback", name: "The Old Mason's Crown", theme: "golem", boss: "oldMason", exitMap: "hangingGardens",
    sign: "The terraces rise beneath you. You were never climbing a garden; you were climbing its gardener." },
  { id: "weaverWorldback", name: "The Loom Below", theme: "weaver", boss: "silkMatriarch", exitMap: "rootdeepHollow",
    sign: "Each bridge tightens into a silver string. Somewhere in the dark, eight hands begin to applaud." },
  { id: "bellWorldback", name: "The Walking Belfry", theme: "bellkeeper", boss: "bellTitan", exitMap: "frostbellTundra",
    sign: "Snow falls upward as the frozen cathedral takes its first step in a thousand years." },
  { id: "lanternWorldback", name: "The Storm Lantern", theme: "lantern", boss: "lanternKeeper", exitMap: "stormspinePeaks",
    sign: "A warm light moves inside the storm. It turns toward you, hopeful and hungry." },
  { id: "colossusWorldback", name: "The Heart Under Stone", theme: "colossus", boss: "lastWorldbearer", exitMap: "titanGrave",
    sign: "The mountain kneels. Its heartbeat is slow enough to count between thunderclaps." },
].forEach((trial, variant) => registerMap({
  id: trial.id, name: trial.name, visualTheme: trial.theme, worldbearer: true, playerStart: { x: 3, y: 11 },
  // Kept as a safe migration route for saves made inside the old arenas.
  // Their masters now live visibly in the regions outside.
  legend: {
    "x": { tile: "floor", portal: { map: trial.exitMap, x: 34, y: 9 } },
    "B": { tile: "floor" },
    "m": { tile: "floor", message: `${trial.sign} Its master now walks the open region outside.` },
    "H": { tile: "floor", rest: true, restText: "The Worldbearer's quiet breath restores every heart and all mana." },
    "R": { tile: "rock", on: "floor" },
  },
  tiles: makeWorldbearerArena(variant),
}));
