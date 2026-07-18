/* ============================================================
   ABILITIES — the shared toybox of moves.

   Ben: every move in the game lives here. To make a new one,
   copy an existing ability, change the numbers, give it a new
   id — and then any form can use it!

   The combat building blocks (from js/engine/combat.js):
     G.combat.meleeArc(user, {...})  close-up swing
     G.combat.shoot(user, {...})    fire a projectile
     G.combat.chain(user, {...})    lightning-style jumps
     G.combat.dash(user, {...})     zoom forward

   Projectiles can also use explodeRadius / explodeDamage for
   impact bursts, or share a hitGroup so a cone cannot shotgun.

   Every ability needs:
     id        short lowercase name, must be unique
     name      what players see
     icon      an emoji
     type      "sharp" | "blunt" | "light" | "dark"  (Rule 4!)
     mana      0 to 8 (basic attacks MUST be 0)
     cooldown  seconds between uses (at least 0.15)
     use(user) the code that does the thing
   ============================================================ */

"use strict";

/* ----------------- NOBODY's moves ----------------- */

registerAbility({
  id: "slap",
  name: "Slap",
  icon: "👋",
  type: "blunt",
  style: "melee",
  mana: 0,
  cooldown: 0.35,
  use(user) {
    G.combat.meleeArc(user, {
      ability: "slap",
      range: 17, arcDeg: 110,
      damage: 1, type: "blunt",
      knockback: 110,
      lunge: 3, hitStop: 0.03, shake: 0.11, weight: 3,
    });
  },
});

registerAbility({
  id: "cartwheel",
  name: "Cartwheel",
  icon: "🤸",
  type: "blunt",
  style: "dash",
  mana: 2,
  cooldown: 1.0,
  use(user) {
    G.combat.dash(user, {
      ability: "cartwheel",
      dist: 55, speed: 240,
      damage: 1, type: "blunt",
      color: "#f4f4f4",
    });
  },
});

/* ----------------- RAT's moves ----------------- */

registerAbility({
  id: "bite",
  name: "Bite",
  icon: "🦷",
  type: "sharp",
  style: "melee",
  traits: ["status"],
  mana: 0,
  cooldown: 0.3,
  use(user) {
    G.combat.meleeArc(user, {
      ability: "bite",
      range: 14, arcDeg: 90,
      damage: 1, type: "sharp",
      knockback: 60,
      lunge: 3, hitStop: 0.024, shake: 0.09, weight: 2,
      // the germs are the point:
      status: { name: "poison", dur: 3, dps: 1 },
    });
  },
});

registerAbility({
  id: "squeakDash",
  name: "Squeak Zoom",
  icon: "💨",
  type: "blunt",
  style: "dash",
  mana: 2,
  cooldown: 0.8,
  use(user) {
    G.combat.dash(user, {
      ability: "squeakDash",
      dist: 70, speed: 300,
      damage: 1, type: "blunt",
      color: "#94b0c2",
    });
  },
});

registerAbility({
  id: "fester",
  name: "Fester",
  icon: "🤢",
  type: "sharp",
  style: "area",
  traits: ["status"],
  mana: 4,
  cooldown: 1.4,
  use(user) {
    // a gross burst of germs all around you
    G.combat.meleeArc(user, {
      ability: "fester",
      range: 28, arcDeg: 360,
      damage: 1, type: "sharp",
      knockback: 40,
      status: { name: "poison", dur: 4, dps: 1 },
      color: "#a7f070",
    });
  },
});

/* ----------------- KNIGHT's moves ----------------- */

registerAbility({
  id: "slash",
  name: "Sword Slash",
  icon: "⚔️",
  type: "sharp",
  style: "melee",
  mana: 0,
  cooldown: 0.5,
  use(user) {
    G.combat.meleeArc(user, {
      ability: "slash",
      range: 23, arcDeg: 150,
      damage: 2, type: "sharp",
      knockback: 120,
      lunge: 3, hitStop: 0.045, shake: 0.16, weight: 4,
    });
  },
});

registerAbility({
  id: "shieldBash",
  name: "Shield Bash",
  icon: "🛡️",
  type: "blunt",
  style: "melee",
  mana: 3,
  cooldown: 1.0,
  use(user) {
    G.combat.meleeArc(user, {
      ability: "shieldBash",
      range: 18, arcDeg: 120,
      damage: 2, type: "blunt",
      knockback: 240,                          // sends 'em FLYING
      status: { name: "stun", dur: 1.3 },      // and leaves 'em dizzy
      color: "#ef7d57",
    });
  },
});

registerAbility({
  id: "spinSlash",
  name: "Spin Slash",
  icon: "🌀",
  type: "sharp",
  style: "area",
  mana: 4,
  cooldown: 1.2,
  use(user) {
    G.combat.meleeArc(user, {
      ability: "spinSlash",
      range: 26, arcDeg: 360,                  // all the way around!
      damage: 2, type: "sharp",
      knockback: 150,
    });
  },
});

/* ----------------- RANGER's moves ----------------- */

registerAbility({
  id: "arrow",
  name: "Arrow",
  icon: "🏹",
  type: "sharp",
  style: "projectile",
  mana: 0,
  cooldown: 0.45,
  autoAim: true, aimRange: 140,
  use(user) {
    G.combat.shoot(user, {
      ability: "arrow",
      speed: 190, range: 140,
      damage: 1, type: "sharp",
      recoil: 2, trail: 4, hitStop: 0.022, shake: 0.09,
    });
  },
});

registerAbility({
  id: "luckyArrow",
  name: "Lucky Arrow",
  icon: "🌟",
  type: "light",                               // the only Light move so far!
  style: "projectile",
  mana: 2,
  cooldown: 0.7,
  autoAim: true, aimRange: 160,
  use(user) {
    G.combat.shoot(user, {
      ability: "luckyArrow",
      speed: 210, range: 160,
      damage: 2, type: "light",
      pierce: true,                            // flies through enemies
      color: "#ffcd75",
    });
  },
});

registerAbility({
  id: "tripleShot",
  name: "Triple Shot",
  icon: "🎯",
  type: "sharp",
  style: "projectile",
  mana: 4,
  cooldown: 1.2,
  autoAim: true, aimRange: 130,
  use(user) {
    // three arrows in a fan — just call shoot three times!
    for (const spread of [-16, 0, 16]) {
      G.combat.shoot(user, {
        ability: "tripleShot",
        speed: 180, range: 130,
        damage: 1, type: "sharp",
        spreadDeg: spread,
      });
    }
  },
});

registerAbility({
  id: "shadowBolt",
  name: "Shadow Bolt",
  icon: "🌑",
  type: "dark",
  style: "projectile",
  mana: 3,
  cooldown: 0.8,
  autoAim: true, aimRange: 150,
  use(user) {
    G.combat.shoot(user, {
      ability: "shadowBolt",
      speed: 170, range: 150,
      damage: 2, type: "dark",
      color: "#8153c1",
    });
  },
});

registerAbility({
  id: "dark matter",
  name: "Dark Matter",
  icon: "🌑",
  type: "dark",
  style: "area",
  mana: 5,
  cooldown: 1.5,
  autoAim: true, aimRange: 185,
  use(user) {
    G.combat.shoot(user, {
      ability: "dark matter",
      speed: 125, range: 185,
      damage: 3, type: "dark",
      pierce: true,
      size: 5, color: "#333c57",
    });
  },
});

registerAbility({
  id: "curse",
  name: "Curse",
  icon: "🌑",
  type: "dark",
  style: "projectile",
  traits: ["status"],
  mana: 0,
  cooldown: 0.55,
  autoAim: true, aimRange: 135,
  use(user) {
    G.combat.shoot(user, {
      ability: "curse",
      speed: 165, range: 135,
      damage: 1, type: "dark",
      color: "#290063",
      recoil: 1.5, trail: 5, hitStop: 0.025, shake: 0.1,
    });
  },
});

/* ----------------- FROG's moves ----------------- */

registerAbility({
  id: "tongueLash",
  name: "Tongue Lash",
  icon: "👅",
  type: "blunt",
  style: "melee",
  mana: 0,
  cooldown: 0.45,
  use(user) {
    G.combat.meleeArc(user, {
      ability: "tongueLash", range: 32, arcDeg: 70,
      damage: 1, type: "blunt", knockback: 65,
      color: "#ef7d57",
      lunge: 2.5, hitStop: 0.032, shake: 0.11, weight: 3,
    });
  },
});

registerAbility({
  id: "hopCrash",
  name: "Hop Crash",
  icon: "🐸",
  type: "blunt",
  style: "dash",
  mana: 3,
  cooldown: 1.0,
  use(user) {
    G.combat.dash(user, {
      ability: "hopCrash", dist: 52, speed: 260,
      damage: 1, type: "blunt", color: "#a7f070",
    });
  },
});

registerAbility({
  id: "croakBurst",
  name: "Croak Burst",
  icon: "📣",
  type: "blunt",
  style: "area",
  mana: 4,
  cooldown: 1.25,
  use(user) {
    const hitGroup = {};
    for (let spreadDeg = 0; spreadDeg < 360; spreadDeg += 45) {
      G.combat.shoot(user, {
        ability: "croakBurst", speed: 125, range: 62,
        damage: 1, type: "blunt", spreadDeg, hitGroup,
        size: 4, color: "#73eff7",
      });
    }
  },
});

/* ----------------- ALCHEMIST's moves ----------------- */

registerAbility({
  id: "bottleBonk",
  name: "Bottle Bonk",
  icon: "🍾",
  type: "blunt",
  style: "melee",
  mana: 0,
  cooldown: 0.4,
  use(user) {
    G.combat.meleeArc(user, {
      ability: "bottleBonk", range: 18, arcDeg: 105,
      damage: 1, type: "blunt", knockback: 100,
      color: "#73eff7",
      lunge: 2.5, hitStop: 0.03, shake: 0.11, weight: 3,
    });
  },
});

registerAbility({
  id: "volatileFlask",
  name: "Volatile Flask",
  icon: "💥",
  type: "blunt",
  style: "area",
  mana: 4,
  cooldown: 1.4,
  autoAim: true, aimRange: 115,
  use(user) {
    G.combat.shoot(user, {
      ability: "volatileFlask", speed: 135, range: 115,
      damage: 2, explodeDamage: 2, explodeRadius: 27,
      type: "blunt", size: 5, color: "#ef7d57",
    });
  },
});

registerAbility({
  id: "miasmaFlask",
  name: "Miasma Flask",
  icon: "🧪",
  type: "dark",
  style: "area",
  traits: ["status"],
  mana: 5,
  cooldown: 1.8,
  autoAim: true, aimRange: 105,
  use(user) {
    G.combat.shoot(user, {
      ability: "miasmaFlask", speed: 115, range: 105,
      damage: 1, explodeDamage: 1, explodeRadius: 34,
      type: "dark", size: 5, color: "#8153c1",
      status: { name: "poison", dur: 4, dps: 1 },
    });
  },
});

/* ----------------- STORMCALLER's moves ----------------- */

registerAbility({
  id: "stormSpark",
  name: "Storm Spark",
  icon: "⚡",
  type: "light",
  style: "projectile",
  mana: 0,
  cooldown: 0.45,
  autoAim: true, aimRange: 125,
  use(user) {
    G.combat.shoot(user, {
      ability: "stormSpark", speed: 215, range: 125,
      damage: 1, type: "light", color: "#73eff7",
      recoil: 1.5, trail: 5, hitStop: 0.024, shake: 0.1,
    });
  },
});

registerAbility({
  id: "chainLightning",
  name: "Chain Lightning",
  icon: "🌩️",
  type: "light",
  style: "chain",
  mana: 5,
  cooldown: 1.5,
  autoAim: true, aimRange: 78,
  use(user) {
    G.combat.chain(user, {
      ability: "chainLightning", range: 78, jumpRange: 48,
      maxTargets: 4, damage: 1, type: "light",
      color: "#73eff7",
    });
  },
});

registerAbility({
  id: "thunderclap",
  name: "Thunderclap",
  icon: "👏",
  type: "blunt",
  style: "area",
  traits: ["status"],
  mana: 6,
  cooldown: 1.8,
  use(user) {
    G.combat.meleeArc(user, {
      ability: "thunderclap", range: 31, arcDeg: 360,
      damage: 2, type: "blunt", knockback: 190,
      status: { name: "stun", dur: 0.75 },
      color: "#73eff7",
    });
  },
});

/* ----------------- DRAGON's moves ----------------- */

registerAbility({
  id: "tailSweep",
  name: "Tail Sweep",
  icon: "🐉",
  type: "blunt",
  style: "melee",
  mana: 0,
  cooldown: 0.55,
  use(user) {
    G.combat.meleeArc(user, {
      ability: "tailSweep", range: 28, arcDeg: 220,
      damage: 1, type: "blunt", knockback: 135,
      color: "#38b764",
      lunge: 2, hitStop: 0.04, shake: 0.15, weight: 4,
    });
  },
});

registerAbility({
  id: "fireBreath",
  name: "Fire Breath",
  icon: "🔥",
  type: "light",
  style: "area",
  mana: 4,
  cooldown: 1.2,
  autoAim: true, aimRange: 78,
  use(user) {
    const hitGroup = {}; // one breath can hit a foe once, never five times
    for (const spreadDeg of [-28, -14, 0, 14, 28]) {
      G.combat.shoot(user, {
        ability: "fireBreath", speed: 155, range: 78,
        damage: 2, type: "light", spreadDeg, hitGroup,
        size: 4, color: "#ef7d57",
      });
    }
  },
});

registerAbility({
  id: "meteor",
  name: "Meteor",
  icon: "☄️",
  type: "light",
  style: "area",
  mana: 7,
  cooldown: 2.3,
  autoAim: true, aimRange: 145,
  use(user) {
    G.combat.shoot(user, {
      ability: "meteor", speed: 105, range: 145,
      damage: 3, explodeDamage: 3, explodeRadius: 35,
      type: "light", size: 7, color: "#ffcd75",
    });
  },
});

/* ----------------- RIFTBLADE's moves ----------------- */

registerAbility({
  id: "riftCut",
  name: "Rift Cut",
  icon: "🗡️",
  type: "sharp",
  style: "melee",
  mana: 0,
  cooldown: 0.36,
  use(user) {
    // Quick cuts flow into a wide third beat. It never adds damage; good
    // timing earns safer crowd coverage instead of a balance-breaking spike.
    const lastCut = typeof user.riftCutAt === "number" ? user.riftCutAt : -10;
    const chained = G.state.time - lastCut < 0.72;
    user.riftCutCombo = chained ? (user.riftCutCombo || 0) % 3 + 1 : 1;
    user.riftCutAt = G.state.time;
    const finisher = user.riftCutCombo === 3;
    G.combat.meleeArc(user, {
      ability: "riftCut",
      range: finisher ? 27 : 21,
      arcDeg: finisher ? 230 : 125,
      damage: 1, type: "sharp", knockback: finisher ? 145 : 85,
      color: finisher ? "#73eff7" : "#b58ee6",
      lunge: finisher ? 3.5 : 2.5,
      hitStop: finisher ? 0.038 : 0.024,
      shake: finisher ? 0.14 : 0.09,
      weight: finisher ? 4 : 3,
      combo: finisher ? "finisher" : "flow",
    });
    if (finisher) {
      G.spawnFx({ kind: "ring", x: user.x, y: user.y - 6, color: "#73eff7", radius: 13, dur: 0.22 });
    }
  },
});

registerAbility({
  id: "riftRush",
  name: "Rift Rush",
  icon: "💫",
  type: "dark",
  style: "dash",
  mana: 3,
  cooldown: 1.0,
  use(user) {
    G.combat.dash(user, {
      ability: "riftRush",
      dist: 72, speed: 330,
      damage: 2, type: "dark",
      color: "#8153c1",
      hitStop: 0.04, shake: 0.14,
    });
  },
});

registerAbility({
  id: "returningStar",
  name: "Returning Star",
  icon: "✦",
  type: "light",
  style: "projectile",
  mana: 4,
  cooldown: 1.25,
  autoAim: true, aimRange: 100,
  use(user) {
    // The return path follows the thrower. Move or Rift Rush after throwing
    // to bend the second pass through a different group of enemies.
    G.combat.shoot(user, {
      ability: "returningStar",
      speed: 180, range: 235, outboundRange: 96,
      damage: 1, type: "light", pierce: true,
      boomerang: true, shape: "riftBlade",
      size: 5, color: "#73eff7", trail: 6,
      recoil: 2, hitStop: 0.024, shake: 0.1,
    });
  },
});

/* ----------------- MOLE's moves ----------------- */

registerAbility({
  id: "drillTap",
  name: "Drill Tap",
  icon: "⛏️",
  type: "blunt",
  style: "melee",
  traits: ["status"],
  mana: 0,
  cooldown: 0.38,
  use(user) {
    const last = typeof user.drillTapAt === "number" ? user.drillTapAt : -10;
    const chained = G.state.time - last < 0.7;
    user.drillTapCombo = chained ? (user.drillTapCombo || 0) % 3 + 1 : 1;
    user.drillTapAt = G.state.time;
    const eruption = user.drillTapCombo === 3;
    G.combat.meleeArc(user, {
      ability: "drillTap", range: eruption ? 29 : 20,
      arcDeg: eruption ? 175 : 82, damage: 1, type: "blunt",
      knockback: eruption ? 155 : 70,
      status: eruption ? { name: "stun", dur: 0.28 } : null,
      color: eruption ? "#ffcd75" : "#8a6538",
      lunge: 3, weight: eruption ? 5 : 3,
      hitStop: eruption ? 0.04 : 0.024,
      combo: eruption ? "eruption" : "drill",
    });
  },
});

registerAbility({
  id: "burrowBlitz",
  name: "Burrow Blitz",
  icon: "🕳️",
  type: "dark",
  style: "dash",
  mana: 3,
  cooldown: 1.15,
  use(user) {
    G.combat.dash(user, {
      ability: "burrowBlitz", dist: 70, speed: 340,
      damage: 0, type: "dark", color: "#5d275d",
      endBurst: {
        ability: "burrowBlitz", range: 27, damage: 2,
        type: "dark", knockback: 165, color: "#8153c1",
        status: { name: "stun", dur: 0.3 }, weight: 5,
      },
    });
  },
});

registerAbility({
  id: "faultLine",
  name: "Fault Line",
  icon: "〰️",
  type: "blunt",
  style: "area",
  mana: 5,
  cooldown: 1.55,
  autoAim: true, aimRange: 130,
  use(user) {
    G.combat.shoot(user, {
      ability: "faultLine", speed: 125, range: 130,
      damage: 2, explodeDamage: 2, explodeRadius: 27,
      type: "blunt", size: 6, color: "#d8b06a", pierce: true,
      shape: "fault", trail: 5, recoil: 3,
    });
  },
});

/* ----------------- VAMPIRE's moves ----------------- */

registerAbility({
  id: "bloodBite",
  name: "Blood Bite",
  icon: "🦇",
  type: "sharp",
  style: "melee",
  mana: 0,
  cooldown: 0.34,
  use(user) {
    const hits = G.combat.meleeArc(user, {
      ability: "bloodBite", range: 19, arcDeg: 95,
      damage: 1, type: "sharp", knockback: 62,
      color: "#b13e53", lunge: 3.2, weight: 3,
      hitStop: 0.026,
    });
    if (!hits) return;
    user.bloodPips = Math.min(5, (user.bloodPips || 0) + hits);
    if (user.bloodPips >= 5) {
      user.bloodPips = 0;
      G.healPlayer(1, "bloodBite");
      G.sfx.play("pickup");
      G.spawnFx({ kind: "ring", x: user.x, y: user.y - 7, color: "#b13e53", radius: 18, dur: 0.4 });
      G.damageNumber(user.x, user.y - 18, "DRAIN!", "#ef7d57");
    }
  },
});

registerAbility({
  id: "crimsonWaltz",
  name: "Crimson Waltz",
  icon: "🌹",
  type: "dark",
  style: "dash",
  mana: 3,
  cooldown: 1.05,
  use(user) {
    G.combat.dash(user, {
      ability: "crimsonWaltz", dist: 62, speed: 360,
      damage: 1, type: "dark", color: "#b13e53",
      hitStop: 0.028, shake: 0.1,
    });
  },
});

registerAbility({
  id: "bloodMoon",
  name: "Blood Moon",
  icon: "🌕",
  type: "dark",
  style: "area",
  mana: 6,
  cooldown: 1.85,
  use(user) {
    const hits = G.combat.meleeArc(user, {
      ability: "bloodMoon", range: 40, arcDeg: 360,
      damage: 2, type: "dark", knockback: 145,
      color: "#b13e53", weight: 6, hitStop: 0.04, shake: 0.18,
    });
    G.spawnFx({ kind: "ring", x: user.x, y: user.y - 7, color: "#8153c1", radius: 40, dur: 0.42 });
    if (hits >= 3) {
      G.healPlayer(1, "bloodMoon");
      G.damageNumber(user.x, user.y - 18, "FEAST!", "#ef7d57");
    }
  },
});

/* ----------------- JESTER's moves ----------------- */

registerAbility({
  id: "wildCard",
  name: "Wild Card",
  icon: "🃏",
  type: "sharp",
  style: "projectile",
  mana: 0,
  cooldown: 0.45,
  autoAim: true, aimRange: 150,
  use(user) {
    user.cardBeat = (user.cardBeat || 0) % 3 + 1;
    const joker = user.cardBeat === 3;
    G.combat.shoot(user, {
      ability: "wildCard", speed: 215, range: joker ? 260 : 150,
      damage: 1, type: "sharp", size: 5, shape: "card",
      color: joker ? "#ffcd75" : "#f4f4f4",
      ricochets: joker ? 2 : 0, bounceRange: 72,
      trail: joker ? 6 : 3, recoil: 1.6,
    });
  },
});

registerAbility({
  id: "punchlinePie",
  name: "Punchline Pie",
  icon: "🥧",
  type: "blunt",
  style: "area",
  mana: 4,
  cooldown: 1.4,
  autoAim: true, aimRange: 135,
  use(user) {
    G.combat.shoot(user, {
      ability: "punchlinePie", speed: 135, range: 135,
      damage: 2, explodeDamage: 2, explodeRadius: 31,
      type: "blunt", size: 7, shape: "pie",
      color: "#ef7d57", trail: 4, recoil: 3,
    });
  },
});

registerAbility({
  id: "encore",
  name: "Encore!",
  icon: "🎪",
  type: "light",
  style: "area",
  mana: 5,
  cooldown: 1.7,
  use(user) {
    const hitGroup = {};
    for (let spreadDeg = 0; spreadDeg < 360; spreadDeg += 45) {
      G.combat.shoot(user, {
        ability: "encore", speed: 175, range: 92,
        damage: 1, type: "light", spreadDeg,
        size: 5, shape: "card", color: "#ffcd75",
        hitGroup, trail: 4, recoil: 0,
      });
    }
    G.spawnFx({ kind: "ring", x: user.x, y: user.y - 6, color: "#ffcd75", radius: 18, dur: 0.28 });
  },
});

/* ----------------- TURTLE's moves ----------------- */

registerAbility({
  id: "shellJab", name: "Shell Jab", icon: "🐢", type: "blunt", style: "melee",
  mana: 0, cooldown: 0.42,
  use(user) {
    user.shellBeat = (user.shellBeat || 0) % 3 + 1;
    const brace = user.shellBeat === 3;
    const hits = G.combat.meleeArc(user, {
      ability: "shellJab", range: brace ? 25 : 20, arcDeg: brace ? 190 : 105,
      damage: 1, type: "blunt", knockback: brace ? 150 : 80,
      color: brace ? "#a7f070" : "#6b8e3e", weight: brace ? 5 : 3,
      hitStop: brace ? 0.04 : 0.026, combo: brace ? "brace" : "jab",
    });
    if (brace && hits) {
      user.meleeGuard = Math.max(user.meleeGuard || 0, 0.32);
      G.damageNumber(user.x, user.y - 18, "BRACED!", "#a7f070");
    }
  },
});

registerAbility({
  id: "shellRoll", name: "Shell Roll", icon: "🛞", type: "blunt", style: "dash",
  mana: 3, cooldown: 1.1,
  use(user) {
    G.combat.dash(user, {
      ability: "shellRoll", dist: 62, speed: 300, damage: 1, type: "blunt",
      color: "#a7f070", hitStop: 0.03, shake: 0.11,
      endBurst: { ability: "shellRoll", range: 24, damage: 1, type: "blunt", knockback: 150, color: "#a7f070" },
    });
  },
});

registerAbility({
  id: "shellCounter", name: "Shell Counter", icon: "🛡️", type: "blunt", style: "area",
  mana: 4, cooldown: 2.1,
  use(user) {
    user.meleeGuard = Math.max(user.meleeGuard || 0, 0.58);
    G.combat.areaBurst(user, {
      ability: "shellCounter", range: 29, damage: 1, type: "blunt",
      knockback: 190, color: "#a7f070", hitStop: 0.038, shake: 0.16, combo: "counter",
    });
    G.damageNumber(user.x, user.y - 18, "GUARD!", "#f4f4f4");
  },
});

/* ----------------- SAMURAI's moves ----------------- */

registerAbility({
  id: "quickdraw", name: "Quickdraw", icon: "⚔️", type: "sharp", style: "melee",
  mana: 0, cooldown: 0.4,
  use(user) {
    const last = typeof user.drawAt === "number" ? user.drawAt : -10;
    user.drawBeat = G.state.time - last < 0.76 ? (user.drawBeat || 0) % 3 + 1 : 1;
    user.drawAt = G.state.time;
    const final = user.drawBeat === 3;
    G.combat.meleeArc(user, {
      ability: "quickdraw", range: final ? 32 : 22, arcDeg: final ? 255 : 82,
      damage: 1, type: "sharp", knockback: final ? 165 : 68,
      color: final ? "#ffcd75" : "#f4f4f4", lunge: final ? 4 : 3,
      weight: final ? 5 : 2, hitStop: final ? 0.045 : 0.022,
      combo: final ? "draw-finish" : "draw",
    });
  },
});

registerAbility({
  id: "flashStep", name: "Flash Step", icon: "💨", type: "sharp", style: "dash",
  mana: 3, cooldown: 0.95,
  use(user) {
    G.combat.dash(user, {
      ability: "flashStep", dist: 78, speed: 410, damage: 1, type: "sharp",
      color: "#f4f4f4", hitStop: 0.026, shake: 0.1,
    });
  },
});

registerAbility({
  id: "crescentDraw", name: "Crescent Draw", icon: "🌙", type: "sharp", style: "area",
  mana: 6, cooldown: 1.75,
  use(user) {
    G.combat.meleeArc(user, {
      ability: "crescentDraw", range: 40, arcDeg: 300,
      damage: 2, type: "sharp", knockback: 185,
      color: "#73eff7", lunge: 4, weight: 7, hitStop: 0.048, shake: 0.2,
    });
  },
});

/* ----------------- ASTRONOMER's moves ----------------- */

registerAbility({
  id: "starNeedle", name: "Star Needle", icon: "✨", type: "light", style: "projectile",
  mana: 0, cooldown: 0.46, autoAim: true, aimRange: 165,
  use(user) {
    user.starBeat = (user.starBeat || 0) % 4 + 1;
    const aligned = user.starBeat === 4;
    G.combat.shoot(user, {
      ability: "starNeedle", speed: 225, range: aligned ? 230 : 165,
      damage: 1, type: "light", pierce: aligned, size: aligned ? 5 : 3,
      color: aligned ? "#ffcd75" : "#73eff7", trail: aligned ? 6 : 4,
      recoil: 1.5, hitStop: 0.026,
    });
  },
});

registerAbility({
  id: "constellation", name: "Constellation", icon: "🌟", type: "light", style: "area",
  mana: 4, cooldown: 1.35,
  use(user) {
    const hitGroup = {};
    for (let spreadDeg = 0; spreadDeg < 360; spreadDeg += 60) {
      G.combat.shoot(user, {
        ability: "constellation", speed: 155, range: 105,
        damage: 1, type: "light", spreadDeg, hitGroup,
        size: 5, color: "#ffcd75", trail: 5, recoil: 0,
      });
    }
  },
});

registerAbility({
  id: "gravityWell", name: "Gravity Well", icon: "🌀", type: "dark", style: "area",
  mana: 6, cooldown: 1.9,
  use(user) {
    G.combat.areaBurst(user, {
      ability: "gravityWell", range: 46, damage: 2, type: "dark",
      pull: 15, color: "#8153c1", hitStop: 0.04, shake: 0.17, combo: "gravity",
    });
  },
});

/* ----------------- DRUID's moves ----------------- */

registerAbility({
  id: "thornLash", name: "Thorn Lash", icon: "🌿", type: "dark", style: "melee", traits: ["status"],
  mana: 0, cooldown: 0.47,
  use(user) {
    G.combat.meleeArc(user, {
      ability: "thornLash", range: 30, arcDeg: 165, damage: 1, type: "dark",
      knockback: 85, status: { name: "poison", dur: 3, dps: 1 },
      color: "#a7f070", lunge: 2.5, weight: 4, hitStop: 0.03,
    });
  },
});

registerAbility({
  id: "seedBurst", name: "Seed Burst", icon: "🌰", type: "dark", style: "area", traits: ["status"],
  mana: 4, cooldown: 1.35, autoAim: true, aimRange: 145,
  use(user) {
    G.combat.shoot(user, {
      ability: "seedBurst", speed: 145, range: 145,
      damage: 1, explodeDamage: 2, explodeRadius: 30,
      type: "dark", size: 6, color: "#8a6538", trail: 4,
      status: { name: "poison", dur: 4, dps: 1 },
    });
  },
});

registerAbility({
  id: "wildGrowth", name: "Wild Growth", icon: "🌳", type: "dark", style: "area", traits: ["status"],
  mana: 6, cooldown: 1.95,
  use(user) {
    G.combat.areaBurst(user, {
      ability: "wildGrowth", range: 43, damage: 2, type: "dark",
      knockback: 115, color: "#38b764", hitStop: 0.042, shake: 0.18,
      status: { name: "stun", dur: 0.55 }, combo: "overgrowth",
    });
  },
});

/* ----------------- GOD's moves ----------------- */

registerAbility({
  id: "divineSpark",
  name: "Divine Spark",
  icon: "☀️",
  type: "light",
  style: "projectile",
  mana: 0,
  cooldown: 0.5,
  autoAim: true, aimRange: 170,
  use(user) {
    G.combat.shoot(user, {
      ability: "divineSpark",
      speed: 230, range: 170,
      damage: 2, type: "light",
      color: "#ffcd75",
      recoil: 2, trail: 6, hitStop: 0.034, shake: 0.13,
    });
  },
});

registerAbility({
  id: "judgmentRing",
  name: "Judgment Ring",
  icon: "⚖️",
  type: "light",
  style: "area",
  mana: 6,
  cooldown: 1.6,
  use(user) {
    G.combat.meleeArc(user, {
      ability: "judgmentRing",
      range: 34, arcDeg: 360,
      damage: 3, type: "light",
      knockback: 180,
      color: "#f4f4f4",
    });
  },
});

registerAbility({
  id: "voidStar",
  name: "Void Star",
  icon: "✴️",
  type: "dark",
  style: "area",
  mana: 5,
  cooldown: 1.7,
  autoAim: true, aimRange: 190,
  use(user) {
    G.combat.shoot(user, {
      ability: "voidStar",
      speed: 155, range: 190,
      damage: 4, type: "dark",
      pierce: true,
      color: "#8153c1",
    });
  },
});
