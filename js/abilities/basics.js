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
  mana: 0,
  cooldown: 0.35,
  use(user) {
    G.combat.meleeArc(user, {
      ability: "slap",
      range: 17, arcDeg: 110,
      damage: 1, type: "blunt",
      knockback: 110,
    });
  },
});

registerAbility({
  id: "cartwheel",
  name: "Cartwheel",
  icon: "🤸",
  type: "blunt",
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
  mana: 0,
  cooldown: 0.3,
  use(user) {
    G.combat.meleeArc(user, {
      ability: "bite",
      range: 14, arcDeg: 90,
      damage: 1, type: "sharp",
      knockback: 60,
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
  mana: 0,
  cooldown: 0.5,
  use(user) {
    G.combat.meleeArc(user, {
      ability: "slash",
      range: 23, arcDeg: 150,
      damage: 2, type: "sharp",
      knockback: 120,
    });
  },
});

registerAbility({
  id: "shieldBash",
  name: "Shield Bash",
  icon: "🛡️",
  type: "blunt",
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
  mana: 0,
  cooldown: 0.45,
  use(user) {
    G.combat.shoot(user, {
      ability: "arrow",
      speed: 190, range: 140,
      damage: 1, type: "sharp",
    });
  },
});

registerAbility({
  id: "luckyArrow",
  name: "Lucky Arrow",
  icon: "🌟",
  type: "light",                               // the only Light move so far!
  mana: 2,
  cooldown: 0.7,
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
  mana: 4,
  cooldown: 1.2,
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
  mana: 3,
  cooldown: 0.8,
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
  mana: 5,
  cooldown: 1.5,
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
  mana: 0,
  cooldown: 0.55,
  use(user) {
    G.combat.shoot(user, {
      ability: "curse",
      speed: 165, range: 135,
      damage: 1, type: "dark",
      color: "#290063",
    });
  },
});

/* ----------------- FROG's moves ----------------- */

registerAbility({
  id: "tongueLash",
  name: "Tongue Lash",
  icon: "👅",
  type: "blunt",
  mana: 0,
  cooldown: 0.45,
  use(user) {
    G.combat.meleeArc(user, {
      ability: "tongueLash", range: 32, arcDeg: 70,
      damage: 1, type: "blunt", knockback: 65,
      color: "#ef7d57",
    });
  },
});

registerAbility({
  id: "hopCrash",
  name: "Hop Crash",
  icon: "🐸",
  type: "blunt",
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
  mana: 0,
  cooldown: 0.4,
  use(user) {
    G.combat.meleeArc(user, {
      ability: "bottleBonk", range: 18, arcDeg: 105,
      damage: 1, type: "blunt", knockback: 100,
      color: "#73eff7",
    });
  },
});

registerAbility({
  id: "volatileFlask",
  name: "Volatile Flask",
  icon: "💥",
  type: "blunt",
  mana: 4,
  cooldown: 1.4,
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
  mana: 5,
  cooldown: 1.8,
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
  mana: 0,
  cooldown: 0.45,
  use(user) {
    G.combat.shoot(user, {
      ability: "stormSpark", speed: 215, range: 125,
      damage: 1, type: "light", color: "#73eff7",
    });
  },
});

registerAbility({
  id: "chainLightning",
  name: "Chain Lightning",
  icon: "🌩️",
  type: "light",
  mana: 5,
  cooldown: 1.5,
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
  mana: 0,
  cooldown: 0.55,
  use(user) {
    G.combat.meleeArc(user, {
      ability: "tailSweep", range: 28, arcDeg: 220,
      damage: 1, type: "blunt", knockback: 135,
      color: "#38b764",
    });
  },
});

registerAbility({
  id: "fireBreath",
  name: "Fire Breath",
  icon: "🔥",
  type: "light",
  mana: 4,
  cooldown: 1.2,
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
  mana: 7,
  cooldown: 2.3,
  use(user) {
    G.combat.shoot(user, {
      ability: "meteor", speed: 105, range: 145,
      damage: 3, explodeDamage: 3, explodeRadius: 35,
      type: "light", size: 7, color: "#ffcd75",
    });
  },
});

/* ----------------- GOD's moves ----------------- */

registerAbility({
  id: "divineSpark",
  name: "Divine Spark",
  icon: "☀️",
  type: "light",
  mana: 0,
  cooldown: 0.5,
  use(user) {
    G.combat.shoot(user, {
      ability: "divineSpark",
      speed: 230, range: 170,
      damage: 2, type: "light",
      color: "#ffcd75",
    });
  },
});

registerAbility({
  id: "judgmentRing",
  name: "Judgment Ring",
  icon: "⚖️",
  type: "light",
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
  mana: 5,
  cooldown: 1.7,
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
