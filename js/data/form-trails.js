/* Connected, optional outings opened by the Worldbearers' restored roads.
   Two separated clearings give each new body a first use and a variation.
   No star toll, extra quest currency, teleport or compulsory form door. */
"use strict";

(() => {
  G.FORM_TRAILS = [
    { id: "galecrestPostroad", name: "Galecrest Postroad", region: "windscarCanyon", mark: "sky", formId: "griffin", biome: "windscar",
      pair: "sunHopper", crowd: "mirageSkater", edge: "rock", obstacle: "water",
      sign: "POSTROAD · Parcel's little delivery bags are hanging out to dry. The canyon wind is finally carrying them home.", picnic: "Parcel's postroad picnic" },
    { id: "cobblekinBrook", name: "Cobblekin Brook", region: "hangingGardens", mark: "stone", formId: "golem", biome: "gardens",
      pair: "wisp", crowd: "sunHopper", edge: "tree", obstacle: "water",
      sign: "BROOK ROAD · The garden workers left lunch beside the old crossing. They hope to mend the bridge now that Pillar is resting.", picnic: "the gardeners' packed lunch" },
    { id: "silkstepGrove", name: "Silkstep Grove", region: "rootdeepHollow", mark: "thread", formId: "weaver", biome: "rootdeep",
      pair: "mirageSkater", crowd: "sunHopper", edge: "tree", obstacle: "tree",
      sign: "GROVE ROAD · Tess's neighbours can reach their sewing circle again. Someone has already brought a very large cake.", picnic: "the sewing circle's cake" },
    { id: "chimeletWalk", name: "Chimelet Walk", region: "frostbellTundra", mark: "echo", formId: "bellkeeper", biome: "frostbell",
      pair: "wisp", crowd: "sunHopper", edge: "rock", obstacle: "water",
      sign: "BELL WALK · The belfry children used to bring biscuits this way. With Bongle quiet again, they can hear each other laugh.", picnic: "the belfry children's biscuit tin" },
    { id: "wicklingCauseway", name: "Wickling Causeway", region: "stormspinePeaks", mark: "light", formId: "lanternWisp", biome: "stormspine",
      pair: "wisp", crowd: "mirageSkater", edge: "rock", obstacle: "rock",
      sign: "LANTERN WALK · The storm-watchers left warm supper on the far bank. Mallow's light has made the way home visible again.", picnic: "the storm-watchers' warm supper" },
    { id: "cragbackMeadow", name: "Cragback Meadow", region: "titanGrave", mark: "heart", formId: "colossus", biome: "titan",
      pair: "cairnWalker", crowd: "pebblebeast", edge: "rock", obstacle: "rock",
      sign: "MEMORIAL MEADOW · The roadmenders have set out a picnic for everyone coming home. Atlas is awake. The meadow is theirs again.", picnic: "the roadmenders' welcome-home picnic" },
  ];

  for (const trail of G.FORM_TRAILS) {
    const w = 44, h = 25;
    const rows = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) =>
      x === 0 || x === w - 1 || y === 0 || y === h - 1 ? "#" : "."));
    const put = (x, y, letter) => rows[y][x] = letter;
    // A broad horseshoe around the brook/root shelf: the longer way always
    // stays open. Mastering the body's defining action opens the return lane.
    for (let y = 9; y <= 22; y++) for (let x = 20; x <= 22; x++) put(x, y, "R");
    for (let x = 4; x <= 39; x++) for (const y of [6, 7, 8]) put(x, y, "p");
    for (let y = 7; y <= 23; y++) for (const x of [3, 4, 5, 36, 37, 38]) put(x, y, "p");
    for (let x = 4; x <= 38; x++) for (const y of [18, 19, 20]) if (x < 20 || x > 22) put(x, y, "p");
    for (let x = 20; x <= 22; x++) for (const y of [18, 19, 20]) put(x, y, "S");
    for (const [x, y] of [[8, 3], [9, 3], [14, 11], [15, 11], [27, 13], [28, 13], [31, 22], [32, 22]]) put(x, y, "#");
    put(4, 24, "x"); put(5, 22, "m"); put(6, 20, "C"); put(38, 19, "H");
    // Close pairs support binds/resonance; separated shooters ask the player
    // to create cover or safe light while approaching rather than mash a hit.
    // The entry notice and fire are a genuine pause. The first encounter
    // begins farther along the road, beyond every foe's attention radius.
    const pairSites = ["golem", "lanternWisp"].includes(trail.formId)
      ? [[15, 16], [19, 18], [15, 20], [27, 7], [31, 5], [33, 8]]
      : trail.formId === "griffin" ? [[14, 18], [16, 19], [18, 18], [29, 7], [31, 8], [33, 7]]
        : [[14, 18], [16, 18], [15, 16], [29, 7], [31, 7], [30, 5]];
    for (const [x, y] of pairSites) put(x, y, "1");
    for (const [x, y] of [[9, 8], [11, 8], [10, 10], [33, 18], [35, 18], [34, 16]]) put(x, y, "2");
    registerMap({ id: trail.id, name: trail.name, biome: trail.biome, formTrail: trail.formId,
      playerStart: { x: 4, y: 22 },
      fences: [{ x: 35, y: 21, length: 5, dir: "h", style: "camp" }],
      legend: {
        "#": { tile: trail.edge }, "R": { tile: trail.obstacle },
        "S": { tile: trail.obstacle, formTrailShortcut: trail.formId },
        "x": { tile: "path", portal: { map: trail.region, x: 7, y: 2 }, portalStyle: "gap", seamless: true },
        "1": { tile: "path", enemy: trail.pair, guardPost: true }, "2": { tile: "path", enemy: trail.crowd, guardPost: true },
        "m": { tile: "path", message: trail.sign },
        "C": { tile: "path", rest: true, restText: "A quiet camp restores every heart and all mana." },
        "H": { tile: "path", chest: { heal: true, name: trail.picnic } },
      }, tiles: rows.map(row => row.join("")),
    });
    const region = G.maps[trail.region];
    region.legend = Object.assign({}, region.legend, {
      "u": { tile: "path", portal: { map: trail.id, x: 4, y: 22 }, mark: trail.mark, portalStyle: "gap", seamless: true },
    });
    region.tiles = region.tiles.map((row, y) => y <= 3 ? row.slice(0, 7) + (y === 0 ? "u" : "p") + row.slice(8) : row);
  }

  G.applyFormTrailShortcut = () => {
    const s = G.state, id = G.maps[s.mapId]?.formTrail;
    if (!id || !s.formOutings?.features.includes(id)) return false;
    let changed = false;
    for (let y = 0; y < s.mapH; y++) for (let x = 0; x < s.mapW; x++) {
      const cell = s.grid[y][x];
      if (cell.formTrailShortcut === id && cell.tile !== "path") {
        // Grid cells share legend objects. Replace instead of mutating those
        // definitions, so a different save slot cannot inherit this bridge.
        s.grid[y][x] = Object.assign({}, cell, { tile: "path" });
        changed = true;
        G.spawnFx({ kind: "spark", x: x * 16 + 8, y: y * 16 + 8, color: "#a7f070", dur: .45 });
      }
    }
    return changed;
  };
  G.events.on("mapEnter", () => G.applyFormTrailShortcut());
})();
