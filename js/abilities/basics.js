/* ============================================================
   ABILITIES — the shared toybox of moves.

   Ben: every move in the game lives here. To make a new one,
   copy an existing ability, change the numbers, give it a new
   id — and then any form can use it!

   The three building blocks (from js/engine/combat.js):
     G.combat.meleeArc(user, {...})  close-up swing
     G.combat.shoot(user, {...})    fire a projectile
     G.combat.dash(user, {...})     zoom forward

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
  type: "dark",          // <- pssst... nothing in the game deals
  mana: 3,               //    dark damage yet. Just saying.
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
  id: "curse",
  name: "Curse",
  icon: "🌑",
  type: "dark",          // <- pssst... nothing in the game deals
  mana: 0,               //    dark damage yet. Just saying.
  cooldown: 0.8,
  use(user) {
    G.combat.shoot(user, {
      ability: "curse",
      speed: 140, range: 250,
      damage: 3, type: "dark",
      color: "#290063",
    });
  },
});
