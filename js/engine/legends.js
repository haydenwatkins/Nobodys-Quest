/* ============================================================
   FORM LEGENDS — horizontal mastery after level five.

   Legend I  : choose an alternate handling passive (Facet)
   Legend II : earn a new native B/C technique
   Legend III: awaken a visible Legend Arm and charged ultimate

   No level cap or blanket stat bonus is added. Each reward follows a fixed,
   authored world Echo and only advances inside its explicit trial.
   ============================================================ */

"use strict";

(function () {
  const authored = {
    nobody: ["Open Hand", "Borrowed Comet", "The Unnamed Key", "Every Shape at Once", "balanced"],
    rat: ["Plague Instinct", "Burrow Fever", "Sewer Crownfang", "Kingdom of Teeth", "skirmisher"],
    knight: ["Vanguard", "Banner Charge", "Oathbreaker Greatshield", "Last Bastion", "tank"],
    ranger: ["Ghostline", "Pinning Volley", "Horizon Bow", "One Perfect Horizon", "ranged"],
    wizard: ["Spellweave", "Event Seed", "Eventide Staff", "Event Horizon", "ranged"],
    frog: ["Springheart", "Pondquake", "Worldtongue Charm", "Worldtongue", "skirmisher"],
    alchemist: ["Chain Reaction", "Royal Solvent", "Philosopher Flask", "Grand Transmutation", "ranged"],
    stormcaller: ["Eye of the Storm", "Thunder Road", "Skyfork Spear", "Heaven Split", "ranged"],
    dragon: ["Ancient Furnace", "Comet Wing", "Worldfire Horn", "First Flame", "bruiser"],
    riftblade: ["Foldwalker", "Seam Cut", "Paradox Katana", "Cut Between Moments", "skirmisher"],
    mole: ["Deep Memory", "Fault Rider", "Worldcore Drill", "Turn the World", "bruiser"],
    vampire: ["Red Feast", "Dusk Waltz", "Dawn-Eater Chalice", "Red Eclipse", "skirmisher"],
    jester: ["Perfect Timing", "Curtain Call", "King's Last Joke", "The Punchline", "ranged"],
    turtle: ["Unmoving Tide", "Citadel Roll", "Worldshell Aegis", "The World Holds", "tank"],
    samurai: ["Still Water", "Moon Divide", "Moonfall Blade", "One Draw, Two Horizons", "skirmisher"],
    astronomer: ["Orbital Mind", "Falling Star", "Living Orrery", "Convergence", "ranged"],
    druid: ["Old Root", "Season Turn", "Crown of Seasons", "A Forest Answers", "ranged"],
    griffin: ["High Current", "Skybreaker Dive", "Tempest Talon", "Sovereign Sky", "skirmisher"],
    golem: ["Foundation", "Temple Step", "Heartstone Maul", "Walking Cathedral", "tank"],
    weaver: ["Golden Thread", "Fate Stitch", "Loom of Tomorrow", "Mend the Battlefield", "ranged"],
    bellkeeper: ["Final Resonance", "Procession Bell", "Cathedral Clapper", "The Last Bell", "balanced"],
    lanternWisp: ["Guiding Flame", "Festival Wake", "Sunless Lantern", "All Roads Home", "ranged"],
    colossus: ["Continental Will", "Mountain Walk", "Atlas Fist", "Move the Horizon", "tank"],
    god: ["Merciful Limit", "Creation Spark", "Crown of Every Answer", "Nobody's Answer", "bruiser"],
  };
  const colors = ["#f4f4f4", "#a7f070", "#94b0c2", "#ffcd75", "#d9a7ff", "#73eff7", "#ef7d57", "#41a6f6"];
  const damageTypes = ["blunt", "sharp", "sharp", "light", "dark", "blunt", "dark", "light"];
  const styles = ["melee", "dash", "area", "projectile", "chain"];
  const ultimateKinds = {
    nobody: "nova", rat: "rush", knight: "sanctuary", ranger: "barrage", wizard: "chain", frog: "nova",
    alchemist: "nova", stormcaller: "chain", dragon: "cleave", riftblade: "rush", mole: "nova", vampire: "rush",
    jester: "barrage", turtle: "sanctuary", samurai: "cleave", astronomer: "barrage", druid: "sanctuary",
    griffin: "rush", golem: "cleave", weaver: "chain", bellkeeper: "nova", lanternWisp: "sanctuary",
    colossus: "cleave", god: "nova",
  };
  const survivalCopy = {
    ranged: "DISTANT · deadly from afar, vulnerable when cornered",
    skirmisher: "SWIFT · thrives up close, built to escape",
    balanced: "VERSATILE · ready at any distance",
    bruiser: "BOLD · strongest in the thick of battle",
    tank: "UNYIELDING · made to stand where danger gathers",
  };

  G.FORM_SURVIVAL = {};
  G.LEGEND_DEFS = {};

  function facetEffects(style) {
    if (style === "projectile") return { projectile: { speedScale: 1.16, rangeScale: 1.08 } };
    if (style === "dash") return { dash: { dashDistanceScale: 1.1 } };
    if (style === "area") return { area: { rangeScale: 1.14 } };
    if (style === "chain") return { chain: { jumpRangeScale: 1.14 } };
    return { melee: { guard: 0.18, arcBonus: 18 } };
  }

  function facetDescription(name, style) {
    if (style === "projectile") return `${name} sends every ranged art farther and faster.`;
    if (style === "dash") return `${name} carries every rushing art beyond its usual reach.`;
    if (style === "area") return `${name} widens the circle of every bursting art.`;
    if (style === "chain") return `${name} teaches leaping arts to seek more distant foes.`;
    return `${name} broadens close strikes and guards you through the swing.`;
  }

  function techniqueUse(id, index, style, type, color) {
    return function (user) {
      if (style === "projectile") {
        G.combat.shoot(user, { ability: id, speed: 190, range: 155, size: 4, damage: 2, type,
          color, pierce: index % 2 === 0, explodeRadius: index % 2 ? 18 : 0, explodeDamage: 1 });
      } else if (style === "dash") {
        G.combat.dash(user, { ability: id, dist: 72, speed: 300, damage: 2, type, color,
          endBurst: { range: 24, damage: 1, type, color } });
      } else if (style === "area") {
        G.combat.areaBurst(user, { ability: id, range: 38, damage: 2, type, color, knockback: 105 });
      } else if (style === "chain") {
        G.combat.chain(user, { ability: id, range: 90, jumps: 4, jumpRange: 50, damage: 1, type, color });
      } else {
        G.combat.meleeArc(user, { ability: id, range: 27, arcDeg: 180, damage: 2, type, color,
          knockback: 125, lunge: 5, hitStop: 0.055, shake: 0.18, weight: 5 });
      }
    };
  }

  G.formOrder.forEach((formId, index) => {
    const names = authored[formId];
    if (!names) return;
    const style = styles[index % styles.length];
    const type = damageTypes[index % damageTypes.length];
    const color = colors[index % colors.length];
    const techniqueId = `legend-${formId}-technique`;
    const form = G.forms[formId];
    const facet = {
      id: `legend-${formId}-facet`, name: names[0],
      description: facetDescription(names[0], style),
      effects: facetEffects(style),
    };
    G.LEGEND_DEFS[formId] = {
      formId, facet, techniqueId, techniqueName: names[1], armName: names[2], ultimateName: names[3],
      survival: names[4], survivalText: survivalCopy[names[4]], color, type, style,
      armShape: index, ultimateKind: ultimateKinds[formId], variant: Math.floor(index / 6),
    };
    G.FORM_SURVIVAL[formId] = { role: names[4], text: survivalCopy[names[4]], hearts: form.hearts };
    registerAbility({
      id: techniqueId, name: names[1], icon: form.icon, type, style,
      mana: 3 + (index % 2), cooldown: 0.75 + (index % 3) * 0.12,
      nativeForm: formId, legendTechnique: true,
      use: techniqueUse(techniqueId, index, style, type, color),
    });
  });

  const legendPathData = {
    nobody: [["The Unmarked Crossroads","overworld",60,36,"waypoints","Where Greenfield's roads cross without choosing a hero."],["Hall of Borrowed Footsteps","dungeon",15,6,"sequence","Below the old stones, three forgotten steps answer every shape."],["The Nameless Height","starfallRuins",15,9,"champion","Climb where the fallen stars refuse to name their champion."]],
    rat: [["The Cracked Pantry","dungeon",6,8,"native","A small door in the western dungeon wall bears fresh tooth marks."],["Moonlit Drain","sunkenMarsh",9,8,"mixed","The marsh water circles a dry stone that smells faintly of rain."],["Crownless Burrow","mistwood",23,13,"champion","Roots hide a court too small for anyone but a rat."]],
    knight: [["The Empty Guardpost","dungeon",23,8,"hold","An abandoned post still waits for someone willing to stand there."],["Bannerless Field","overworld",76,50,"sequence","East of the crossroads, an old standard casts no shadow."],["The Broken Oathgate","emberRidge",10,9,"champion","A gate of black stone remembers every promise made before it."]],
    ranger: [["Mistwood Overlook","mistwood",15,7,"native","Find the clearing where three pale arrows hang in the leaves."],["The Long Crossing","overworld",73,39,"waypoints","Beyond Greenfield's eastern road, distant marks face the horizon."],["Horizon Watch","starfallRuins",7,8,"champion","A ruined tower watches a path no ordinary arrow can cross."]],
    wizard: [["The Unfinished Orrery","starfallRuins",15,10,"sequence","At the ruin's center, four stars wait in the wrong order."],["Mireglass Circle","sunkenMarsh",26,8,"mixed","The eastern reeds reflect a sky that is not above them."],["The Eventide Kiln","emberRidge",24,9,"champion","A cold flame burns where Ember Ridge should be hottest."]],
    frog: [["The Stillest Lily","sunkenMarsh",27,9,"waypoints","The marsh's central pool has stopped making ripples."],["Rainroot Hollow","mistwood",8,13,"hold","Beneath the southern roots, rain falls upward."],["The Worldtongue Pool","whispering-grove",8,9,"champion","A moonlit pool repeats every sound except your own."]],
    alchemist: [["The Green Crucible","sunkenMarsh",26,10,"sequence","Three marsh vapors gather around an empty glass seal."],["Ashen Laboratory","emberRidge",10,8,"mixed","A workbench of cooled lava waits for one impossible ingredient."],["The Philosopher's Fall","starfallRuins",23,8,"champion","A golden flask hangs beneath the eastern fallen star."]],
    stormcaller: [["The Quiet Rod","emberRidge",24,8,"hold","A copper spire on the ridge has not sparked in a century."],["Thunder's Reflection","starfallRuins",7,9,"sequence","Lightning moves silently between the western ruins."],["Skyfork Point","shattercoast",38,14,"champion","At the far coast, two storms argue over a single spear."]],
    dragon: [["The Cold Furnace","emberRidge",26,9,"native","The eastern furnace exhales frost instead of smoke."],["Cinderwake Beach","shattercoast",8,14,"waypoints","Black scales wash ashore where the sea meets old fire."],["The First-Flame Crater","starfallRuins",15,9,"champion","A crater beneath the stars holds a flame older than dragons."]],
    riftblade: [["The Crooked Seam","starfallRuins",23,9,"waypoints","The eastern ruin is split by a path visible only from the side."],["Second Door Below","dungeon",23,7,"sequence","A door behind the old dungeon door opens between footsteps."],["Paradox Shore","shattercoast",20,14,"champion","Two tides arrive at the same shore from opposite tomorrows."]],
    mole: [["The Listening Floor","dungeon",6,9,"hold","The western floor hums when no one is walking on it."],["Faultline Crown","emberRidge",26,8,"native","At the ridge's far end, the mountain wears a cracked crown."],["The Worldcore Scar","shattercoast",8,14,"champion","A deep wound in the coast answers every underground knock."]],
    vampire: [["The Sunless Arbor","whispering-grove",8,8,"hold","The western grove casts a shadow even under moonlight."],["Red Constellation","starfallRuins",15,8,"mixed","Five red stars have gathered around an empty cup."],["The Dawnless Court","sunkenMarsh",26,9,"champion","Beyond the eastern reeds, dawn has failed to arrive."]],
    jester: [["The Straight Road","overworld",76,39,"waypoints","One Greenfield road has become suspiciously sensible."],["The Audience of Trees","whispering-grove",20,10,"sequence","At the grove's heart, the trees have arranged their own seats."],["The Last Curtain","shattercoast",38,13,"champion","A salt-stained stage waits at the end of the coast."]],
    turtle: [["The Patient Tide","shattercoast",8,13,"hold","The western tide has paused against an unbroken shell."],["Mirewall Shrine","sunkenMarsh",27,8,"native","The central marsh shrine refuses to sink."],["The Walking Breakwater","dungeon",23,9,"champion","Deep stone remembers the fortress that once walked above it."]],
    samurai: [["The Uncut Banner","dungeon",15,7,"native","A paper banner hangs perfectly still in the dungeon's center."],["Mist on Still Water","mistwood",15,8,"sequence","At the northern pool, mist waits for a single clean answer."],["The Moonfold Shore","shattercoast",23,13,"champion","Moonlight creases the sea like an unfinished letter."]],
    astronomer: [["The Fallen Meridian","starfallRuins",15,9,"waypoints","The ruin's broken meridian points somewhere beneath the sky."],["The Edge of Orbit","shattercoast",38,15,"mixed","At the eastern cliffs, stones circle a point over empty water."],["The Living Zenith","whispering-grove",20,9,"champion","The grove opens one eye directly beneath the highest star."]],
    druid: [["The Root That Walked","whispering-grove",20,10,"native","Fresh footprints end at an ancient root in the grove's heart."],["The Fourth Season","mistwood",8,12,"sequence","A southern clearing holds spring, summer, autumn, and snow."],["Crownseed Terrace","hangingGardens",22,8,"champion","One terrace grows toward a crown buried in the sky."]],
    griffin: [["The Grounded Feather","sunstepPrairie",8,14,"waypoints","A golden feather refuses to rise from the warm prairie."],["The Narrow Sky","windscarCanyon",23,8,"native","Between the canyon walls, the sky narrows to a single road."],["Sovereign Updraft","shattercoast",26,14,"champion","The coast wind climbs toward a throne with no floor."]],
    golem: [["The Stone That Followed","windscarCanyon",36,18,"hold","A canyon marker has moved one step closer every night."],["The Empty Foundation","hangingGardens",8,14,"sequence","The lowest terrace has prepared a foundation for no building."],["Cathedral Heart","rootdeepHollow",23,9,"champion","Below the roots, a stone heartbeat keeps cathedral time."]],
    weaver: [["The Loose Bridge","hangingGardens",36,18,"waypoints","A bridge of roots has begun weaving itself backward."],["The Silver Argument","rootdeepHollow",8,14,"mixed","Two silver threads disagree over which future is true."],["Loom of Tomorrow","glasswaterDesert",23,9,"champion","At the mirrored horizon, tomorrow hangs from a single thread."]],
    bellkeeper: [["The Bell Without Wind","shattercoast",8,15,"hold","A barnacled bell rings only when the sea is silent."],["The Buried Procession","frostbellTundra",23,8,"sequence","Frozen footprints circle a bell beneath the snow."],["The Last Resonance","stormspinePeaks",36,18,"champion","The storm repeats one final note from beyond the peak."]],
    lanternWisp: [["The Light Under Snow","frostbellTundra",8,14,"waypoints","A warm path glows beneath the western snowfield."],["The Unlit Road","stormspinePeaks",23,8,"mixed","Three empty lanterns mark a road the storm cannot see."],["All Roads' Hearth","titanGrave",36,18,"champion","Every lost lantern points toward one small fire under the titan."]],
    colossus: [["The Mirrored Footprint","glasswaterDesert",8,14,"hold","A footprint large as a pond fills with reflected mountains."],["The Kneeling Peak","stormspinePeaks",36,17,"native","One peak has lowered itself as if waiting for a command."],["Atlas Heart","titanGrave",23,9,"champion","At the grave's center, the world takes one slow breath."]],
    god: [["The Smallest Prayer","titanGrave",8,14,"sequence","A prayer too small for any god waits beside the ancient road."],["The Answerless Star","starfallRuins",23,9,"mixed","The eastern star asks a question no prophecy prepared for."],["Nobody's Horizon","overworld",60,36,"champion","Return to the crossroads where the world first chose the wrong name."]],
  };

  const challengeCopy = {
    waypoints: ["Trace the three Legend runes in order.", "Follow the runes without leaving this form."],
    hold: ["Hold the marked ground while the Echo tests your nerve.", "Remain inside the circle until it accepts your resolve."],
    native: ["Defeat the trial shades with this form's own arts.", "Borrowed arts cannot prove this form's name."],
    sequence: ["Answer the altar: native art, borrowed art, native art, borrowed art.", "Perform the four-part answer beside the Echo."],
    mixed: ["Defeat the trial shades by alternating native and borrowed arts.", "The same kind of finishing art cannot answer twice in a row."],
    champion: ["Defeat the keeper of this Legend and return to what remains.", "The Arm will not answer until its keeper yields."],
  };

  G.LEGEND_PATHS = {};
  for (const id of G.formOrder) {
    G.LEGEND_PATHS[id] = (legendPathData[id] || []).map((raw, index) => ({
      rank: index + 1, name: raw[0], mapId: raw[1], tileX: raw[2], tileY: raw[3], kind: raw[4], clue: raw[5],
      objective: challengeCopy[raw[4]][0], rule: challengeCopy[raw[4]][1],
    }));
  }

  const QUEST_VERSION = 2;

  G.makeLegends = function () {
    const out = { questVersion: QUEST_VERSION, ranks: {}, facets: {}, charge: {}, rewards: {}, revealed: {}, rumorsHeard: [], active: null, constellations: {} };
    for (const id of G.formOrder) {
      out.ranks[id] = 0;
      out.facets[id] = "original";
      out.charge[id] = 0;
      out.revealed[id] = 0;
    }
    return out;
  };

  G.normalizeLegends = function (saved) {
    const out = G.makeLegends();
    if (!saved || typeof saved !== "object") return out;
    for (const key of ["ranks", "facets", "charge", "rewards", "revealed", "constellations"])
      if (saved[key] && typeof saved[key] === "object") out[key] = Object.assign({}, saved[key]);
    out.rumorsHeard = Array.isArray(saved.rumorsHeard) ? saved.rumorsHeard.slice() : [];
    const oldAutomaticSystem = saved.questVersion !== QUEST_VERSION;
    if (oldAutomaticSystem) out.rumorsHeard = [];
    for (const id of G.formOrder) {
      out.ranks[id] = oldAutomaticSystem ? 0 : G.util.clamp(Number(out.ranks[id]) || 0, 0, 3);
      out.charge[id] = G.util.clamp(Number(out.charge[id]) || 0, 0, 100);
      out.facets[id] = !oldAutomaticSystem && out.facets[id] === "legend" ? "legend" : "original";
      out.revealed[id] = oldAutomaticSystem ? 0 : G.util.clamp(Number(out.revealed[id]) || 0, 0, 3);
      const reward = Number(out.rewards[id]) || 0;
      if (reward !== out.ranks[id] + 1 || reward > 3) delete out.rewards[id];
    }
    out.questVersion = QUEST_VERSION;
    out.active = null;
    return out;
  };

  function state() { return G.state && G.state.legends; }
  G.legendRank = function (id) { return state() ? Number(state().ranks[id]) || 0 : 0; };
  G.legendCharge = function (id) { return state() ? Number(state().charge[id]) || 0 : 0; };
  G.legendPassiveFor = function (form) {
    const def = form && G.LEGEND_DEFS[form.id];
    return def && G.legendRank(form.id) >= 1 && state().facets[form.id] === "legend" ? def.facet : form.passive;
  };
  G.setLegendFacet = function (formId, choice) {
    if (!state() || G.legendRank(formId) < 1 || !["original", "legend"].includes(choice)) return false;
    state().facets[formId] = choice;
    G.saveGame();
    return true;
  };

  G.legendStage = function (id) {
    const path = G.LEGEND_PATHS[id];
    return path && path[G.legendRank(id)] || null;
  };
  G.legendAvailable = function (id) {
    return !!(state() && G.formUnlocked(id) && G.formLevel(id) >= 5 && G.legendRank(id) < 3 && G.legendStage(id));
  };
  G.legendReady = G.legendAvailable;
  G.legendReadyForms = function () { return G.formOrder.filter((id) => G.legendAvailable(id)); };

  G.legendSitePoint = function (stage) {
    if (!stage) return null;
    let x = stage.tileX * G.TILE + G.TILE / 2;
    let y = stage.tileY * G.TILE + G.TILE / 2;
    if (!G.state || G.state.mapId !== stage.mapId || !G.world || !G.world.isSafeSpawn) return { x, y };
    const offsets = [[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1],[2,0],[-2,0],[0,2],[0,-2]];
    for (const [ox, oy] of offsets) {
      const px = x + ox * G.TILE, py = y + oy * G.TILE;
      if (G.world.isSafeSpawn(px, py)) return { x: px, y: py };
    }
    return { x, y };
  };

  G.legendEchoFor = function (id) {
    if (!G.legendAvailable(id)) return null;
    const stage = G.legendStage(id), point = G.legendSitePoint(stage);
    return Object.assign({ formId: id, reward: Number(state().rewards[id]) === stage.rank }, stage, point);
  };
  G.legendEchoesHere = function () {
    const echo = G.state && G.legendEchoFor(G.state.formId);
    return echo && echo.mapId === G.state.mapId ? [echo] : [];
  };
  G.currentLegendEcho = function (formId) {
    const echo = G.legendEchoFor(formId || (G.state && G.state.formId));
    return echo && G.state && echo.mapId === G.state.mapId ? echo : null;
  };

  function dangerNearEcho() {
    const p = G.state.player;
    return (G.state.enemies || []).some((enemy) => !enemy.dead && !enemy.legendTrial && G.util.dist(p.x, p.y, enemy.x, enemy.y) < 64);
  }
  G.legendEchoCandidate = function () {
    const echo = G.currentLegendEcho();
    if (!echo || !G.state.player || dangerNearEcho() || (G.ui && (G.ui.menuOpen || G.ui.dialogueOpen))) return null;
    return G.util.dist(G.state.player.x, G.state.player.y, echo.x, echo.y) <= 24 ? echo : null;
  };

  function trialEnemy(active, index, champion) {
    const pools = ["slime", "bat", "bones", "wisp", "brute", "thornling", "pebblebeast", "shade"];
    const baseId = pools[(G.formOrder.indexOf(active.formId) + active.rank * 2 + index) % pools.length];
    const angle = index / Math.max(1, active.goal) * Math.PI * 2;
    const point = G.legendSitePoint(G.legendStage(active.formId));
    const enemy = G.makeEnemy(baseId, point.x + Math.cos(angle) * (champion ? 62 : 46), point.y + Math.sin(angle) * (champion ? 42 : 34));
    const def = G.LEGEND_DEFS[active.formId];
    enemy.def = Object.assign({}, enemy.def, {
      name: champion ? `${def.armName} Keeper` : `${G.forms[active.formId].name} Trial Shade`,
      hp: champion ? 28 : 6, damage: 1, heavy: champion, speed: Math.min(74, enemy.def.speed + (champion ? 8 : 0)),
      miniboss: false, boss: null, worldbearer: false,
    });
    enemy.hp = enemy.def.hp;
    enemy.legendTrial = { formId: active.formId, rank: active.rank, serial: index, champion: !!champion };
    enemy.expeditionElite = true;
    enemy.legendColor = def.color;
    return enemy;
  }

  function clearTrialEnemies(formId) {
    G.state.enemies = (G.state.enemies || []).filter((enemy) => !enemy.legendTrial || enemy.legendTrial.formId !== formId);
  }

  function spawnTrial(active) {
    if (["native", "mixed"].includes(active.kind)) {
      active.goal = active.kind === "mixed" ? 4 : 3;
      for (let i = 0; i < active.goal; i++) G.state.enemies.push(trialEnemy(active, i, false));
    } else if (active.kind === "hold") {
      active.goal = 12;
      G.state.enemies.push(trialEnemy(active, 0, false), trialEnemy(active, 1, false));
    } else if (active.kind === "waypoints") {
      active.goal = 3;
      active.runes = [[-42,-24],[44,-18],[0,42]];
    } else if (active.kind === "sequence") {
      active.goal = 4;
      active.sequence = ["native", "borrowed", "native", "borrowed"];
    } else {
      active.goal = 1;
      G.state.enemies.push(trialEnemy(active, 0, true));
    }
  }

  function startLegendChallenge(echo) {
    const active = { formId: echo.formId, rank: echo.rank, mapId: echo.mapId, kind: echo.kind,
      progress: 0, goal: 1, lastFinish: null, startedAt: G.state.time || 0 };
    state().active = active;
    clearTrialEnemies(echo.formId);
    spawnTrial(active);
    G.sfx.play("bossPhase");
    G.spawnFx({ kind: "ring", x: echo.x, y: echo.y - 6, color: G.LEGEND_DEFS[echo.formId].color, radius: 38, dur: 0.65 });
    G.ui.toast(`✦ ${echo.name} · ${echo.objective}`, 4);
    G.saveGame();
  }

  G.abortLegendChallenge = function (reason) {
    const active = state() && state().active;
    if (!active) return false;
    clearTrialEnemies(active.formId);
    state().active = null;
    if (reason && G.ui && G.ui.toast) G.ui.toast(reason, 2.8);
    G.saveGame();
    return true;
  };

  function finishLegendChallenge(active) {
    if (!active || state().active !== active) return;
    clearTrialEnemies(active.formId);
    state().active = null;
    state().rewards[active.formId] = active.rank;
    const echo = G.legendEchoFor(active.formId);
    G.sfx.play("quest");
    G.state.shake = Math.max(G.state.shake || 0, 0.4);
    if (echo) {
      G.spawnFx({ kind: "ring", x: echo.x, y: echo.y - 8, color: G.LEGEND_DEFS[active.formId].color, radius: 46, dur: 0.8 });
      G.ui.dialogue("✦ THE ECHO YIELDS", `The challenge at ${echo.name} is complete. Return to the relic and choose whether to carry what it guarded.`, { accent: G.LEGEND_DEFS[active.formId].color });
    }
    G.saveGame();
  }

  function claimLegendReward(echo) {
    const st = state(), id = echo.formId, rank = echo.rank, def = G.LEGEND_DEFS[id], form = G.forms[id];
    if (Number(st.rewards[id]) !== rank || rank !== G.legendRank(id) + 1) return false;
    delete st.rewards[id];
    st.ranks[id] = rank;
    st.revealed[id] = Math.max(Number(st.revealed[id]) || 0, rank);
    if (rank === 1) st.facets[id] = "legend";
    const title = rank === 1 ? def.facet.name : rank === 2 ? def.techniqueName : def.armName;
    const body = rank === 1 ? def.facet.description : rank === 2
      ? `${def.techniqueName} joins your Known Arts and may be carried by any form.`
      : `${def.armName} answers. Fill the Legend meter to call ${def.ultimateName}.`;
    G.sfx.play(rank === 3 ? "bossPhase" : "unlock");
    G.state.shake = Math.max(G.state.shake || 0, rank === 3 ? 0.8 : 0.45);
    for (let i = 0; i < (rank === 3 ? 32 : 18); i++) {
      const a = i / (rank === 3 ? 32 : 18) * Math.PI * 2;
      G.spawnFx({ kind: "spark", x: echo.x, y: echo.y - 8, vx: Math.cos(a) * (35 + i % 4 * 9), vy: Math.sin(a) * (35 + i % 4 * 9), color: def.color, dur: 0.75 });
    }
    G.ui.dialogue(`${form.icon} LEGEND ${["I","II","III"][rank - 1]} AWAKENED`, title, { accent: def.color });
    G.ui.dialogue(title.toUpperCase(), body, { accent: def.color });
    const next = G.legendStage(id);
    if (next) {
      st.revealed[id] = Math.max(Number(st.revealed[id]) || 0, rank + 1);
      G.ui.dialogue("✦ THE NEXT ECHO", `${next.clue} Seek ${next.name} in ${G.maps[next.mapId] ? G.maps[next.mapId].name : next.mapId}.`, { accent: def.color });
    }
    else G.ui.dialogue("✦ LEGEND COMPLETE", `${form.name} has answered all three calls. ${def.armName} will remain at its side.`, { accent: def.color });
    G.events.emit("legendAwakened", { form: id, rank });
    G.saveGame();
    return true;
  }

  G.tryLegendEcho = function () {
    const echo = G.legendEchoCandidate();
    if (!echo) return false;
    if (echo.formId !== G.state.formId) return false;
    if (echo.reward) {
      claimLegendReward(echo);
    } else if (state().active && state().active.formId === echo.formId) {
      G.ui.dialogue(`✦ ${echo.name.toUpperCase()}`, `${echo.objective} ${echo.rule}`, { accent: G.LEGEND_DEFS[echo.formId].color });
    } else {
      G.ui.dialogue(`${G.forms[echo.formId].icon} LEGEND ${["I","II","III"][echo.rank - 1]}`, echo.clue, { accent: G.LEGEND_DEFS[echo.formId].color });
      G.ui.dialogue(`✦ ${echo.name.toUpperCase()}`, `${echo.objective} ${echo.rule}`, {
        accent: G.LEGEND_DEFS[echo.formId].color, onClose: () => startLegendChallenge(echo),
      });
    }
    if (G.input && G.input.clearTaps) G.input.clearTaps();
    return true;
  };

  G.legendObjective = function (id) {
    const rank = G.legendRank(id), level = G.formLevel(id);
    if (level < 5) return { rank, label: "Master the form", detail: `Reach level 5`, value: level, goal: 5 };
    if (rank >= 3) return { rank, label: "Legend complete", detail: "All three Echoes answered", value: 3, goal: 3 };
    const echo = G.legendEchoFor(id), active = state() && state().active;
    if (echo && echo.reward) return { rank, label: "Claim what remains", detail: `${echo.name} · ${G.maps[echo.mapId]?.name || echo.mapId}`, value: 1, goal: 1 };
    if (active && active.formId === id) return { rank, label: echo.objective, detail: echo.rule, value: active.progress, goal: active.goal };
    return { rank, label: `Seek ${echo.name}`, detail: `${G.maps[echo.mapId]?.name || echo.mapId} · ${echo.clue}`, value: 0, goal: 1 };
  };

  G.legendRumor = function (id) {
    const echo = G.legendEchoFor(id);
    if (!echo) return null;
    return { key: `${id}:${echo.rank}`, text: `People are talking about ${echo.name}. ${echo.clue}`, echo };
  };

  G.guideToLegendEcho = function (id) {
    const echo = G.legendEchoFor(id);
    if (!echo) return false;
    G.formEchoGuide = null;
    G.legendEchoGuide = { formId: id, until: (G.state.time || 0) + 30 };
    return G.requestGuidance ? G.requestGuidance(false) : true;
  };
  G.guidedLegendEcho = function () {
    const guide = G.legendEchoGuide;
    if (!guide || (G.state.time || 0) > guide.until) return null;
    return G.legendEchoFor(guide.formId);
  };

  G.updateLegendQuest = function (dt) {
    const active = state() && state().active;
    if (!active) return;
    if (active.mapId !== G.state.mapId || active.formId !== G.state.formId) {
      G.abortLegendChallenge("The Echo waits for you to return in the form that answered it.");
      return;
    }
    const echo = G.legendEchoFor(active.formId), p = G.state.player;
    if (!echo) return;
    if (active.kind === "waypoints") {
      const rune = active.runes[active.progress];
      if (rune && G.util.dist(p.x, p.y, echo.x + rune[0], echo.y + rune[1]) <= 14) {
        active.progress++;
        G.sfx.play("pickup");
        G.spawnFx({ kind: "ring", x: echo.x + rune[0], y: echo.y + rune[1], color: G.LEGEND_DEFS[active.formId].color, radius: 18, dur: 0.35 });
      }
    } else if (active.kind === "hold" && G.util.dist(p.x, p.y, echo.x, echo.y) <= 48) {
      active.progress = Math.min(active.goal, active.progress + dt);
    }
    if (active.progress >= active.goal) finishLegendChallenge(active);
  };

  G.events.on("abilityUse", (data) => {
    const active = state() && state().active;
    if (!active || active.kind !== "sequence" || data.form !== active.formId) return;
    const echo = G.legendEchoFor(active.formId), ability = G.abilities[data.ability];
    if (!echo || !ability || G.util.dist(G.state.player.x, G.state.player.y, echo.x, echo.y) > 58) return;
    const category = ability.nativeForm === active.formId ? "native" : "borrowed";
    if (category === active.sequence[active.progress]) active.progress++;
    else active.progress = category === active.sequence[0] ? 1 : 0;
    G.sfx.play(active.progress ? "pickup" : "stagger");
    if (active.progress >= active.goal) finishLegendChallenge(active);
  });
  G.events.on("kill", (data) => {
    if (!state()) return;
    const active = state().active;
    if (active && data && data.legendTrial && data.legendTrial.formId === active.formId) {
      if (active.kind === "champion") active.progress = 1;
      else if (["native", "mixed"].includes(active.kind)) {
        const ability = G.abilities[data.ability];
        const category = ability && ability.nativeForm === active.formId ? "native" : "borrowed";
        const valid = active.kind === "native" ? category === "native" : !active.lastFinish || category !== active.lastFinish;
        if (valid) { active.progress++; active.lastFinish = category; }
        else {
          G.state.enemies.push(trialEnemy(active, active.progress + 7, false));
          G.ui.toast(active.kind === "native" ? "The shade reforms. Answer with this form's own art." : "The shade reforms. Alternate native and borrowed finishing arts.", 2.8);
        }
      }
      if (active.progress >= active.goal) finishLegendChallenge(active);
    }
    const id = G.state.formId;
    if (G.legendRank(id) >= 3) state().charge[id] = G.util.clamp(G.legendCharge(id) + (data && data.miniboss ? 24 : 9), 0, 100);
  });
  G.events.on("hit", (data) => {
    if (!state() || data && String(data.ability || "").startsWith("ultimate-")) return;
    const id = G.state.formId;
    if (G.legendRank(id) >= 3) state().charge[id] = G.util.clamp(G.legendCharge(id) + 3, 0, 100);
  });
  G.events.on("playerHurt", () => {
    const active = state() && state().active;
    if (active && active.kind === "hold") active.progress = Math.max(0, active.progress - 2);
  });
  G.events.on("mapEnter", () => {
    if (state() && state().active && state().active.mapId !== G.state.mapId) G.abortLegendChallenge();
    if (!state()) return;
    const id = G.state.formId, stage = G.legendStage(id);
    if (!G.legendAvailable(id) || !stage || state().revealed[id] >= stage.rank) return;
    state().revealed[id] = stage.rank;
    G.ui.dialogue(`${G.forms[id].icon} A LEGEND STIRS`, `${stage.clue} Seek ${stage.name} in ${G.maps[stage.mapId]?.name || stage.mapId}.`, { accent: G.LEGEND_DEFS[id].color });
    G.saveGame();
  });
  G.events.on("swap", (data) => {
    if (state() && state().active && state().active.formId !== data.form) G.abortLegendChallenge("The trial quiets when its form is set aside.");
  });
  G.events.on("questDone", (data) => {
    if (!state() || !data || G.formLevel(data.form) < 5 || state().revealed[data.form] >= 1) return;
    state().revealed[data.form] = 1;
    const echo = G.legendEchoFor(data.form);
    if (echo) G.ui.dialogue(`${G.forms[data.form].icon} A LEGEND STIRS`, `${echo.clue} Seek ${echo.name} in ${G.maps[echo.mapId]?.name || echo.mapId}.`, { accent: G.LEGEND_DEFS[data.form].color });
    G.saveGame();
  });

  function drawRelicShape(ctx, def, scale) {
    ctx.save();
    ctx.scale(scale || 1, scale || 1);
    ctx.strokeStyle = def.color; ctx.fillStyle = def.color; ctx.lineWidth = 2;
    const shape = def.armShape % 6;
    const tier = Math.floor(def.armShape / 6);
    if (shape === 0) { ctx.fillRect(-1, -8, 2, 14); ctx.fillRect(-4, 3, 8, 2); }
    else if (shape === 1) { ctx.beginPath(); ctx.arc(0, -3, 4, 0, Math.PI * 2); ctx.stroke(); ctx.fillRect(-1, 1, 2, 7); }
    else if (shape === 2) { ctx.strokeRect(-5, -6, 10, 12); ctx.fillRect(-2, -2, 4, 4); }
    else if (shape === 3) { ctx.beginPath(); ctx.moveTo(-5, 5); ctx.quadraticCurveTo(6, 0, -4, -8); ctx.stroke(); }
    else if (shape === 4) { ctx.fillRect(-5, -5, 10, 3); ctx.fillRect(-2, -8, 4, 14); }
    else { ctx.beginPath(); ctx.moveTo(-6, 4); ctx.lineTo(0, -8); ctx.lineTo(6, 4); ctx.stroke(); }
    ctx.fillStyle = tier % 2 ? "#fff3c2" : def.color;
    if (tier === 1) { ctx.fillRect(-5, -1, 2, 2); ctx.fillRect(4, -1, 2, 2); }
    else if (tier === 2) { ctx.fillRect(-4, -9, 2, 3); ctx.fillRect(3, -9, 2, 3); ctx.fillRect(-1, -10, 2, 2); }
    else if (tier === 3) { ctx.fillRect(-6, -7, 2, 2); ctx.fillRect(5, 3, 2, 2); ctx.fillRect(-5, 6, 2, 2); }
    ctx.restore();
  }

  G.drawLegendEcho = function (ctx, echo) {
    if (!echo) return;
    const def = G.LEGEND_DEFS[echo.formId], form = G.forms[echo.formId];
    const active = state() && state().active && state().active.formId === echo.formId ? state().active : null;
    const t = (G.state.time || 0) * 2.2, bob = Math.sin(t) * 2;
    ctx.save();
    ctx.globalAlpha = 0.18 + Math.sin(t * 1.4) * 0.05;
    ctx.fillStyle = def.color;
    ctx.beginPath(); ctx.ellipse(echo.x, echo.y + 2, echo.reward ? 20 : 14, echo.reward ? 7 : 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = echo.reward ? 1 : 0.78;
    ctx.shadowColor = def.color; ctx.shadowBlur = echo.reward ? 12 : 6;
    if (echo.rank === 1) G.drawSprite(ctx, form.sprite, Math.floor(t) % form.sprite.frames.length, echo.x, echo.y - 3 + bob, false, 1);
    else if (echo.rank === 2) {
      const art = G.abilities[def.techniqueId];
      ctx.fillStyle = "#fff3c2"; ctx.font = "18px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(art.icon || "✦", echo.x, echo.y - 10 + bob);
    } else {
      ctx.translate(Math.round(echo.x), Math.round(echo.y - 8 + bob));
      drawRelicShape(ctx, def, echo.reward ? 2.4 : 1.8);
      ctx.translate(-Math.round(echo.x), -Math.round(echo.y - 8 + bob));
    }
    ctx.shadowBlur = 0;
    const candidate = G.legendEchoCandidate && G.legendEchoCandidate();
    const selected = !!(candidate && candidate.formId === echo.formId && candidate.rank === echo.rank);
    const prompt = echo.reward ? "AWAKEN" : active ? "TRIAL" : "BEGIN";
    ctx.globalAlpha = 1; ctx.fillStyle = "rgba(26,28,44,.9)";
    const width = selected ? 40 : 12;
    ctx.fillRect(Math.round(echo.x - width / 2), Math.round(echo.y - 31 + bob), width, 9);
    ctx.fillStyle = selected ? "#fff3c2" : def.color; ctx.font = "6px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText(selected ? `${G.input.hasGamepad ? "A " : G.input.isTouch ? "" : "E "}${prompt}` : "✦", Math.round(echo.x), Math.round(echo.y - 30 + bob));

    if (active && active.kind === "waypoints") {
      active.runes.forEach((rune, index) => {
        const reached = index < active.progress;
        ctx.globalAlpha = reached ? 0.24 : index === active.progress ? 0.9 : 0.4;
        ctx.strokeStyle = reached ? "#38b764" : def.color; ctx.lineWidth = index === active.progress ? 2 : 1;
        ctx.beginPath(); ctx.arc(echo.x + rune[0], echo.y + rune[1], 9 + Math.sin(t + index) * 2, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = reached ? "#38b764" : "#fff3c2"; ctx.fillRect(Math.round(echo.x + rune[0] - 1), Math.round(echo.y + rune[1] - 1), 3, 3);
      });
    } else if (active && active.kind === "hold") {
      ctx.globalAlpha = 0.55; ctx.strokeStyle = def.color; ctx.lineWidth = 2; ctx.setLineDash([5,4]);
      ctx.beginPath(); ctx.arc(echo.x, echo.y, 48, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }
    if (active) {
      const progress = active.kind === "hold" ? Math.floor(active.progress) : active.progress;
      const text = `TRIAL ${Math.min(progress, active.goal)}/${active.goal}`;
      ctx.globalAlpha = 1; ctx.font = "6px monospace"; ctx.textAlign = "center";
      const w = ctx.measureText(text).width + 8;
      ctx.fillStyle = "rgba(26,28,44,.92)"; ctx.fillRect(Math.round(echo.x - w / 2), Math.round(echo.y + 13), w, 10);
      ctx.fillStyle = "#fff3c2"; ctx.fillText(text, Math.round(echo.x), Math.round(echo.y + 15));
    }
    ctx.restore();
  };

  G.useLegendUltimate = function () {
    const id = G.state.formId, def = G.LEGEND_DEFS[id], p = G.state.player;
    if (!def || G.legendRank(id) < 3) { G.ui.toast("This form has not awakened its Legend Arm.", 1.7); return false; }
    if (G.legendCharge(id) < 100) { G.ui.toast(`${def.armName} · ${Math.floor(G.legendCharge(id))}%`, 1.4); return false; }
    state().charge[id] = 0;
    p.invuln = Math.max(p.invuln, 1.15);
    G.state.hitStop = Math.max(G.state.hitStop || 0, G.reducedMotion ? 0.08 : 0.24);
    G.state.shake = Math.max(G.state.shake || 0, 0.8);
    G.sfx.play("bossPhase");
    // Manyfold is the one place the authored arms are allowed to become
    // gleefully excessive; the normal world keeps the tighter fair radius.
    const manyfold = !!G.state.expeditionRun;
    const kind = def.ultimateKind;
    const direction = p.dir || { x: 1, y: 0 };
    const facing = Math.atan2(direction.y, direction.x);
    const baseRange = kind === "barrage" ? 175 : kind === "chain" ? 145 : kind === "cleave" ? 132 : kind === "rush" ? 115 : 105;
    const reach = baseRange + def.variant * 6 + (manyfold ? 32 : 0);
    const startX = p.x, startY = p.y;
    const targets = (G.state.enemies || []).filter((enemy) => {
      if (enemy.dead) return false;
      const distance = G.util.dist(startX, startY, enemy.x, enemy.y);
      if (distance > reach) return false;
      if (kind === "cleave") return Math.abs(G.util.angleDiff(facing, G.util.angleTo(startX, startY, enemy.x, enemy.y))) <= Math.PI * 0.42;
      if (kind === "rush") {
        const forward = (enemy.x - startX) * direction.x + (enemy.y - startY) * direction.y;
        const side = Math.abs((enemy.x - startX) * -direction.y + (enemy.y - startY) * direction.x);
        return forward >= -8 && forward <= reach && side <= 28 + def.variant * 3;
      }
      return true;
    });
    if (kind === "rush" && G.world && G.world.moveBox) G.world.moveBox(p, direction.x * 58, direction.y * 58);
    if (kind === "sanctuary") {
      G.healPlayer(1, `ultimate-${id}`);
      p.passiveBarrier = Math.min(2, (p.passiveBarrier || 0) + 1);
      p.passiveBarrierT = 8;
    }
    targets.forEach((enemy) => G.combat.damageEnemy(enemy, {
      damage: enemy.def.miniboss ? Math.max(2, Math.min(4, Math.ceil(enemy.hp * 0.08)))
        : (kind === "barrage" || kind === "cleave" ? 8 : kind === "sanctuary" ? 6 : 7) + (manyfold ? 2 : 0),
      type: def.type, ability: `ultimate-${id}`, breaksAnyWard: true,
      knockback: enemy.def.miniboss ? 0 : kind === "chain" ? 45 : 180,
      status: kind === "chain" ? { name: "stun", dur: 0.65 } : null,
      fromX: startX, fromY: startY, hitStop: 0.08, shake: 0.4,
    }));
    const ringCount = 2 + def.armShape % 4;
    for (let ring = 0; ring < ringCount; ring++) G.spawnFx({ kind: "ring", x: p.x, y: p.y - 6,
      color: ring % 2 ? "#fff3c2" : def.color, radius: 22 + ring * (82 / ringCount), dur: 0.42 + ring * 0.13 });
    const rayCount = 22 + def.armShape % 9;
    for (let i = 0; i < rayCount; i++) {
      const a = i / rayCount * Math.PI * 2 + def.armShape * 0.17;
      const longRay = kind === "chain" || (i + def.armShape) % (3 + def.armShape % 3) === 0;
      G.spawnFx({ kind: longRay ? "bolt" : "spark", x: p.x, y: p.y - 7,
        x2: p.x + Math.cos(a) * (longRay ? 112 : 74), y2: p.y - 7 + Math.sin(a) * (longRay ? 112 : 74),
        vx: Math.cos(a) * (82 + def.armShape % 5 * 9), vy: Math.sin(a) * (82 + def.armShape % 5 * 9),
        color: def.color, dur: 0.42 + (def.armShape % 4) * 0.08 });
    }
    if (kind === "cleave") G.spawnFx({ kind: "slash", x: startX, y: startY - 6, angle: facing,
      range: reach, arc: Math.PI * 0.84, color: def.color, weight: 12, dur: 0.55 });
    if (kind === "barrage" || kind === "chain") targets.forEach((enemy, index) => G.spawnFx({ kind: "bolt",
      x: index ? targets[index - 1].x : startX, y: index ? targets[index - 1].y - 5 : startY - 6,
      x2: enemy.x, y2: enemy.y - 5, color: def.color, dur: kind === "chain" ? 0.7 : 0.4 }));
    G.damageNumber(p.x, p.y - 27, def.ultimateName.toUpperCase(), def.color);
    G.events.emit("legendUltimate", { form: id, targets: targets.length });
    G.saveGame();
    return true;
  };

  G.drawLegendArm = function (ctx, p, form, x, y) {
    const def = G.LEGEND_DEFS[form.id];
    if (!def || G.legendRank(form.id) < 3) return;
    const ready = G.legendCharge(form.id) >= 100, side = p.dir.x < 0 ? -1 : 1;
    ctx.save();
    ctx.translate(Math.round(x + side * 8), Math.round(y - 9));
    if (ready) { ctx.shadowColor = def.color; ctx.shadowBlur = 7; }
    ctx.strokeStyle = def.color; ctx.fillStyle = def.color; ctx.lineWidth = 2;
    const shape = def.armShape % 6;
    const tier = Math.floor(def.armShape / 6);
    if (shape === 0) { ctx.fillRect(-1, -8, 2, 14); ctx.fillRect(-4, 3, 8, 2); }
    else if (shape === 1) { ctx.beginPath(); ctx.arc(0, -3, 4, 0, Math.PI * 2); ctx.stroke(); ctx.fillRect(-1, 1, 2, 7); }
    else if (shape === 2) { ctx.strokeRect(-5, -6, 10, 12); ctx.fillRect(-2, -2, 4, 4); }
    else if (shape === 3) { ctx.beginPath(); ctx.moveTo(-5, 5); ctx.quadraticCurveTo(6, 0, -4, -8); ctx.stroke(); }
    else if (shape === 4) { ctx.fillRect(-5, -5, 10, 3); ctx.fillRect(-2, -8, 4, 14); }
    else { ctx.beginPath(); ctx.moveTo(-6, 4); ctx.lineTo(0, -8); ctx.lineTo(6, 4); ctx.stroke(); }
    // Four authored ornament tiers make all 24 arms different even when two
    // share a weapon family: gem, wings, crown, or orbiting sparks.
    ctx.fillStyle = tier % 2 ? "#fff3c2" : def.color;
    if (tier === 1) { ctx.fillRect(-5, -1, 2, 2); ctx.fillRect(4, -1, 2, 2); }
    else if (tier === 2) { ctx.fillRect(-4, -9, 2, 3); ctx.fillRect(3, -9, 2, 3); ctx.fillRect(-1, -10, 2, 2); }
    else if (tier === 3) { ctx.fillRect(-6, -7, 2, 2); ctx.fillRect(5, 3, 2, 2); ctx.fillRect(-5, 6, 2, 2); }
    ctx.restore();
  };
})();
