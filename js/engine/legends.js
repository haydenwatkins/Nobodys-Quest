/* ============================================================
   FORM LEGENDS — horizontal mastery after level five.

   Legend I  : choose an alternate handling passive (Facet)
   Legend II : earn a new native B/C technique
   Legend III: awaken a visible Legend Arm and charged ultimate

   No level cap or blanket stat bonus is added. Old saves receive an empty,
   valid record and begin these lessons naturally.
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

  G.makeLegends = function () {
    const out = { ranks: {}, progress: {}, facets: {}, charge: {}, constellations: {} };
    for (const id of G.formOrder) {
      out.ranks[id] = 0;
      out.progress[id] = { origin: 0, mix: 0, trial: 0 };
      out.facets[id] = "original";
      out.charge[id] = 0;
    }
    return out;
  };
  G.normalizeLegends = function (saved) {
    const out = G.makeLegends();
    if (!saved || typeof saved !== "object") return out;
    for (const key of ["ranks", "progress", "facets", "charge", "constellations"])
      if (saved[key] && typeof saved[key] === "object") out[key] = Object.assign({}, saved[key]);
    for (const id of G.formOrder) {
      out.ranks[id] = G.util.clamp(Number(out.ranks[id]) || 0, 0, 3);
      out.charge[id] = G.util.clamp(Number(out.charge[id]) || 0, 0, 100);
      const p = out.progress[id] || {};
      out.progress[id] = { origin: Math.max(0, Number(p.origin) || 0), mix: Math.max(0, Number(p.mix) || 0), trial: Math.max(0, Number(p.trial) || 0) };
      out.facets[id] = out.facets[id] === "legend" ? "legend" : "original";
    }
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

  G.legendObjective = function (id) {
    const rank = G.legendRank(id), p = state() ? state().progress[id] : { origin: 0, mix: 0, trial: 0 };
    if (G.formLevel(id) < 5) return { rank, label: "Master the form", value: G.formLevel(id), goal: 5 };
    if (rank < 1) return { rank, label: "Use its native moves", value: p.origin, goal: 12 };
    if (rank < 2) return { rank, label: "Use borrowed moves in this form", value: p.mix, goal: 10 };
    if (rank < 3) return { rank, label: "Defeat a guardian in this form", value: p.trial, goal: 1 };
    return { rank, label: "Legend complete", value: 1, goal: 1 };
  };

  function awaken(id, rank) {
    const st = state(), def = G.LEGEND_DEFS[id], form = G.forms[id];
    if (!st || !def || rank <= G.legendRank(id)) return;
    st.ranks[id] = rank;
    if (rank === 1) st.facets[id] = "legend";
    const title = rank === 1 ? `LEGEND I · ${def.facet.name}` : rank === 2 ? `LEGEND II · ${def.techniqueName}` : `LEGEND III · ${def.armName}`;
    const body = rank === 1 ? def.facet.description : rank === 2 ? "A secret technique may now be carried by any form." : `${def.ultimateName} awakened. Fill the Legend meter and set it free.`;
    G.state.shake = Math.max(G.state.shake || 0, rank === 3 ? 0.65 : 0.3);
    G.sfx.play(rank === 3 ? "bossPhase" : "unlock");
    for (let i = 0; i < (rank === 3 ? 28 : 14); i++) {
      const a = i / (rank === 3 ? 28 : 14) * Math.PI * 2;
      G.spawnFx({ kind: "spark", x: G.state.player.x, y: G.state.player.y - 8,
        vx: Math.cos(a) * (30 + i % 4 * 8), vy: Math.sin(a) * (30 + i % 4 * 8), color: def.color, dur: 0.65 });
    }
    if (G.ui.dialogue) G.ui.dialogue(`${form.icon} ${title}`, body, { accent: def.color });
    else G.ui.banner(title, body);
    G.saveGame();
  }

  function check(id) {
    if (!state() || !G.formUnlocked(id) || G.formLevel(id) < 5) return;
    const o = G.legendObjective(id);
    if (o.value >= o.goal && o.rank < 3) awaken(id, o.rank + 1);
  }

  G.events.on("abilityUse", (data) => {
    if (!state() || !data || !G.LEGEND_DEFS[data.form] || G.formLevel(data.form) < 5) return;
    const id = data.form, p = state().progress[id], ab = G.abilities[data.ability];
    if (G.legendRank(id) < 1 && ab && ab.nativeForm === id) p.origin++;
    else if (G.legendRank(id) === 1 && ab && ab.nativeForm && ab.nativeForm !== id) p.mix++;
    check(id);
  });
  G.events.on("kill", (data) => {
    if (!state()) return;
    const id = G.state.formId, rank = G.legendRank(id), p = state().progress[id];
    if (rank === 2 && data && (data.miniboss || data.rival || data.expeditionChampion)) { p.trial = 1; check(id); }
    if (rank >= 3) state().charge[id] = G.util.clamp(G.legendCharge(id) + (data && data.miniboss ? 24 : 9), 0, 100);
  });
  G.events.on("hit", (data) => {
    if (!state()) return;
    if (data && String(data.ability || "").startsWith("ultimate-")) return;
    const id = G.state.formId;
    if (G.legendRank(id) >= 3) state().charge[id] = G.util.clamp(G.legendCharge(id) + 3, 0, 100);
  });

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
