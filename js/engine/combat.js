/* ============================================================
   COMBAT — where damage, wards, and statuses live.

   THE WARD RULE (a core rule of this game!):
   Some enemies have a WARD — a colored shield. A ward only
   breaks when hit by its matching damage type (sharp / blunt /
   light / dark). While the ward is up, everything else just
   goes *ding*. This is on purpose: it makes players swap forms
   and mix abilities instead of using one move forever.

   HELPERS FOR ABILITY MAKERS (Ben, these are your toys):
     G.combat.meleeArc(user, {...})  — a close-up swing
     G.combat.shoot(user, {...})     — fire a projectile
     G.combat.chain(user, {...})     — jump between nearby foes
     G.combat.dash(user, {...})      — zoom forward, hurting things
     G.combat.applyStatus(enemy, "poison", {...})
   See js/abilities/basics.js for examples of each.
   ============================================================ */

"use strict";

G.combat = (() => {
  let staggerHelpShown = false;

  /* ---------- dealing damage to an enemy ---------- */
  function breaksAnyWard(user) {
    return user === G.state.player && G.playerForm && G.playerForm().breaksAnyWard;
  }

  // An ability has one damage type everywhere it lands. The registry is the
  // authority shown in the menu, so nested bursts and projectiles cannot
  // accidentally drift to a different ward interaction.
  function abilityDamageType(abilityId, requested, fallback) {
    const ability = abilityId && G.abilities[abilityId];
    return ability && G.DAMAGE_TYPES[ability.type] ? ability.type : (requested || fallback);
  }

  function attackPose(user, facing, amount, dur) {
    if (user !== G.state.player) return;
    user.attackPose = {
      x: Math.cos(facing) * amount,
      y: Math.sin(facing) * amount,
      t: dur || 0.09,
      dur: dur || 0.09,
    };
  }

  function impactFeedback(enemy, opts, color) {
    const power = opts.damage || 1;
    const stop = opts.hitStop === undefined
      ? (power >= 3 ? 0.05 : power >= 2 ? 0.038 : 0.025)
      : opts.hitStop;
    const fx = opts.fromX !== undefined ? opts.fromX : G.state.player.x;
    const fy = opts.fromY !== undefined ? opts.fromY : G.state.player.y;
    const a = G.util.angleTo(fx, fy, enemy.x, enemy.y);
    const kick = Math.min(3.2, 1.1 + power * 0.65);

    G.state.hitStop = Math.max(G.state.hitStop || 0, stop);
    G.state.shake = Math.max(G.state.shake, opts.shake === undefined ? 0.09 + power * 0.025 : opts.shake);
    enemy.hitKickX = Math.cos(a) * kick;
    enemy.hitKickY = Math.sin(a) * kick;
    if (!G.reducedMotion) {
      G.state.cameraKickX = G.util.clamp((G.state.cameraKickX || 0) + Math.cos(a) * kick, -4, 4);
      G.state.cameraKickY = G.util.clamp((G.state.cameraKickY || 0) + Math.sin(a) * kick, -4, 4);
    }
    G.sfx.impact(opts.type || "blunt", power);
    G.spawnFx({ kind: "impact", x: enemy.x, y: enemy.y - enemy.h() / 2, color, size: 2 + power, dur: 0.12 });
    burst(enemy.x, enemy.y - enemy.h() / 2, color, 4 + power * 2);
  }

  function damageEnemy(enemy, opts) {
    // opts: {damage, type, ability, fromX, fromY, knockback, status}
    if (enemy.dead) return false;
    if (enemy.def.miniboss && enemy.bossIntroT > 0) return false;
    const type = abilityDamageType(opts.ability, opts.type, "blunt");
    if (opts.type !== type) opts = { ...opts, type };

    // WARD CHECK
    if (enemy.ward && enemy.ward.hp > 0) {
      const overrulesWard = opts.breaksAnyWard && !enemy.ward.types.includes(type);
      const wardHitColor = overrulesWard ? "#ffcd75" : G.DAMAGE_TYPES[type].color;
      if (!opts.breaksAnyWard && !enemy.ward.types.includes(type)) {
        // Wrong damage type — bounces off!
        const needed = G.DAMAGE_TYPES[enemy.ward.types[0]];
        G.sfx.play("wardDing");
        G.damageNumber(enemy.x, enemy.y - enemy.h(), `NEEDS ${needed.name.toUpperCase()}!`, needed.color);
        if (!enemy.wardHintAt || G.state.time - enemy.wardHintAt > 1.5) {
          enemy.wardHintAt = G.state.time;
          G.ui.toast(`${needed.icon} Ward: use ${needed.name.toUpperCase()} damage`, 2);
        }
        knockback(enemy, opts, 0.4);
        return false;
      }
      // Right type — chip the ward
      enemy.ward.hp -= opts.damage;
      G.damageNumber(enemy.x, enemy.y - enemy.h(), overrulesWard ? "GOD!" : opts.damage, wardHitColor);
      knockback(enemy, opts, 0.7);
      impactFeedback(enemy, { ...opts, hitStop: Math.min(opts.hitStop || 0.025, 0.025), shake: 0.08 }, wardHitColor);
      if (enemy.ward.hp <= 0) {
        G.sfx.play("wardBreak");
        G.state.shake = Math.max(G.state.shake, 0.18);
        G.state.hitStop = Math.max(G.state.hitStop, 0.05);
        G.spawnFx({ kind: "ring", x: enemy.x, y: enemy.y - 6, color: wardHitColor, dur: 0.45 });
        burst(enemy.x, enemy.y - 6, wardHitColor, 8);
        G.ui.toast("💥 Ward broken!");
        G.events.emit("wardBreak", { damageType: type, ability: opts.ability, enemy: enemy.id });
      }
      return true;
    }

    // Normal damage
    enemy.hp -= opts.damage;
    enemy.flash = 0.12;
    G.damageNumber(enemy.x, enemy.y - enemy.h(), opts.damage, G.DAMAGE_TYPES[type].color);
    knockback(enemy, opts, 1);
    impactFeedback(enemy, opts, G.DAMAGE_TYPES[type].color);

    // Successful hits accelerate the passive refill, so aggressive players
    // reach their next large move sooner than players who simply wait.
    if (!opts.noMana) {
      const p = G.state.player;
      if (p.mana < p.manaMax) { p.mana = Math.min(p.manaMax, p.mana + 1); }
    }

    G.events.emit("hit", {
      enemy: enemy.id,
      ability: opts.ability,
      damageType: type,
      combo: opts.combo,
      dist: G.util.dist(G.state.player.x, G.state.player.y, enemy.x, enemy.y),
    });

    if (opts.status) applyStatus(enemy, opts.status.name, opts.status);

    if (G.passives) G.passives.onHit(enemy, opts);

    if (enemy.hp <= 0) killEnemy(enemy, opts);
    return true;
  }

  function knockback(enemy, opts, mult) {
    if (enemy.dead || opts.knockback === 0) return;
    const kb = (opts.knockback === undefined ? 90 : opts.knockback) * mult * (enemy.def.heavy ? 0.3 : 1);
    const fx = opts.fromX !== undefined ? opts.fromX : G.state.player.x;
    const fy = opts.fromY !== undefined ? opts.fromY : G.state.player.y;
    const a = G.util.angleTo(fx, fy, enemy.x, enemy.y);
    enemy.kbx = Math.cos(a) * kb;
    enemy.kby = Math.sin(a) * kb;
  }

  function killEnemy(enemy, opts) {
    enemy.dead = true;
    G.sfx.play("defeat");
    G.state.shake = Math.max(G.state.shake, enemy.def.heavy ? 0.3 : 0.14);
    G.spawnFx({ kind: "puff", x: enemy.x, y: enemy.y - 6, color: "#f4f4f4", dur: 0.35 });
    burst(enemy.x, enemy.y - enemy.h() / 2, enemy.def.heavy ? "#ffcd75" : "#f4f4f4", enemy.def.heavy ? 14 : 7);
    G.events.emit("kill", {
      enemy: enemy.id,
      ability: opts.ability,
      damageType: opts.type,
      poisoned: !!(enemy.status && enemy.status.poison),
    });
    if (G.passives) G.passives.onKill(enemy, opts);
    if (enemy.def.miniboss) awardMinibossTrophy(enemy);
    if (enemy.def.miniboss && G.state.gauntletRun && G.gauntletBossDefeated) {
      G.gauntletBossDefeated(enemy);
      return;
    }
    // Little rewards sometimes drop
    if (enemy.def.miniboss) {
      G.state.pickups.push({ kind: "heart", x: enemy.x - 6, y: enemy.y, t: 0 });
      G.state.pickups.push({ kind: "mana", x: enemy.x + 6, y: enemy.y, t: 0 });
      return;
    }
    const r = Math.random();
    if (r < 0.18) G.state.pickups.push({ kind: "heart", x: enemy.x, y: enemy.y, t: 0 });
    else if (r < 0.45) G.state.pickups.push({ kind: "mana", x: enemy.x, y: enemy.y, t: 0 });
  }

  function awardMinibossTrophy(enemy) {
    const trophy = enemy.def.trophy;
    if (!trophy) return;
    G.state.items = G.state.items || [];
    if (G.state.items.includes(trophy)) {
      G.ui.toast(`${enemy.def.name} defeated again!`);
      return;
    }
    G.state.items.push(trophy);
    G.state.stars += 1;
    G.sfx.play("quest");
    G.state.shake = Math.max(G.state.shake, 0.45);
    burst(enemy.x, enemy.y - enemy.h() / 2, "#ffcd75", 24);
    const lastWord = enemy.def.boss && enemy.def.boss.defeatLine ? ` · “${enemy.def.boss.defeatLine}”` : "";
    G.ui.banner(`🏆 MINIBOSS DEFEATED: ${enemy.def.name}!`, `${enemy.def.trophyName} found · +1 ⭐${lastWord}`);
    G.events.emit("pickup", { item: trophy });
    G.checkUnlocks();
    if (G.checkGuardianCollectionReward) G.checkGuardianCollectionReward(false);
    G.saveGame();
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 18 + Math.random() * 32;
      G.spawnFx({
        kind: "spark",
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        dur: 0.25 + Math.random() * 0.25,
      });
    }
  }

  /* ---------- statuses (poison, stun) ---------- */
  function applyStatus(enemy, name, opts) {
    if (enemy.dead) return;
    enemy.status = enemy.status || {};
    const isNew = !enemy.status[name];
    enemy.status[name] = { dur: opts.dur || 3, dps: opts.dps || 0.7, tick: 0 };
    if (isNew) {
      if (name === "poison") G.sfx.play("poison");
      G.events.emit("status", { status: name, enemy: enemy.id });
    }
  }

  function updateStatuses(enemy, dt) {
    if (!enemy.status) return;
    const poison = enemy.status.poison;
    if (poison) {
      poison.dur -= dt;
      poison.tick += dt;
      if (poison.tick >= 1) {
        poison.tick -= 1;
        enemy.hp -= 1;
        G.damageNumber(enemy.x, enemy.y - enemy.h(), 1, "#38b764");
        G.spawnFx({ kind: "bubble", x: enemy.x + (Math.random() * 8 - 4), y: enemy.y - 8, color: "#a7f070", vy: -14, dur: 0.5 });
        if (enemy.hp <= 0) killEnemy(enemy, { ability: "poison", type: "dark" });
      }
      if (poison.dur <= 0) delete enemy.status.poison;
    }
    const stun = enemy.status.stun;
    if (stun) {
      stun.dur -= dt;
      if (stun.dur <= 0) delete enemy.status.stun;
    }
  }

  /* ============================================================
     ABILITY HELPERS — the building blocks for every move.
     ============================================================ */

  function assistMeleeContact(user, range, arc, facing) {
    if (user !== G.state.player || arc >= Math.PI * 1.75) return false;
    const maxStep = G.MELEE_ASSIST_STEP;
    let target = null;
    let targetDist = Infinity;
    let alreadyConnected = false;

    for (const e of G.state.enemies) {
      if (e.dead || (e.def.miniboss && e.bossIntroT > 0)) continue;
      const d = G.util.dist(user.x, user.y, e.x, e.y);
      const reach = range + e.def.size / 2;
      const a = G.util.angleTo(user.x, user.y, e.x, e.y);
      if (Math.abs(G.util.angleDiff(facing, a)) > arc / 2) continue;
      if (d <= reach) { alreadyConnected = true; break; }
      if (d <= reach + maxStep && d < targetDist) { target = e; targetDist = d; }
    }

    // Never shift a swing that was already going to connect. The assist only
    // turns a near miss into contact and cannot pull through map collision.
    if (alreadyConnected || !target) return false;
    const a = G.util.angleTo(user.x, user.y, target.x, target.y);
    const reach = range + target.def.size / 2;
    const step = Math.min(maxStep, Math.max(0, targetDist - reach + 0.5));
    const beforeX = user.x, beforeY = user.y;
    G.world.moveBox(user, Math.cos(a) * step, Math.sin(a) * step);
    const moved = G.util.dist(beforeX, beforeY, user.x, user.y) > 0.25;
    if (moved) {
      G.spawnFx({ kind: "puff", x: beforeX, y: beforeY - 3, color: "#f4f4f4", dur: 0.12 });
    }
    return moved;
  }

  function addBossStagger(enemy, amount) {
    if (!enemy.def.miniboss || !enemy.bossEngaged || enemy.dead) return;
    if (enemy.bossStaggerT > 0 || enemy.bossStaggerResistT > 0) return;
    enemy.bossStagger = Math.min(G.BOSS_STAGGER_HITS, (enemy.bossStagger || 0) + (amount || 1));
    enemy.bossStaggerDecayT = 2.25;
    if (!staggerHelpShown) {
      staggerHelpShown = true;
      G.ui.toast("⚔ Melee pressure fills the gold STAGGER meter!", 2.8);
    }
    if (enemy.bossStagger < G.BOSS_STAGGER_HITS) return;

    enemy.bossStagger = 0;
    enemy.bossStaggerT = G.BOSS_STAGGER_SECONDS;
    enemy.bossStaggerResistT = G.BOSS_STAGGER_RESIST_SECONDS;
    enemy.bossStaggerDecayT = 0;
    enemy.bossTelegraphT = 0;
    enemy.bossChargeT = 0;
    enemy.bossPendingAction = null;
    enemy.bossAfterCharge = null;
    enemy.bossRecoverT = Math.max(enemy.bossRecoverT || 0, 0.2);
    G.state.hitStop = Math.max(G.state.hitStop || 0, 0.075);
    G.state.shake = Math.max(G.state.shake || 0, 0.24);
    G.sfx.play("stagger");
    G.damageNumber(enemy.x, enemy.y - enemy.h() - 3, "STAGGER!", "#fff3c2");
    G.spawnFx({ kind: "ring", x: enemy.x, y: enemy.y - 7, color: "#ffcd75", radius: 25, dur: 0.34 });
    G.spawnFx({ kind: "impact", x: enemy.x, y: enemy.y - 7, color: "#fff3c2", size: 8, dur: 0.2 });
  }

  // A melee swing in front of you.
  // {range, arcDeg, damage, type, ability, knockback, status, color}
  function meleeArc(user, o) {
    if (G.passives) o = G.passives.prepare("melee", user, o);
    const type = abilityDamageType(o.ability, o.type, "blunt");
    const range = o.range || 20;
    const arc = ((o.arcDeg || 100) * Math.PI) / 180;
    const facing = Math.atan2(user.dir.y, user.dir.x);
    if (o.passiveGuard) {
      G.spawnFx({ kind: "ring", x: user.x, y: user.y - 6, color: "#94b0c2", radius: 9, dur: 0.28 });
      G.damageNumber(user.x, user.y - 18, "GUARD", "#94b0c2");
    }
    if (o.contactAssist !== false) assistMeleeContact(user, range, arc, facing);
    attackPose(user, facing, o.lunge === undefined ? 2 : o.lunge, 0.09);
    G.sfx.attack("melee", type, o.damage || 1);
    let hits = 0;
    for (const e of G.state.enemies) {
      if (e.dead) continue;
      const d = G.util.dist(user.x, user.y, e.x, e.y);
      if (d > range + e.def.size / 2) continue;
      const a = G.util.angleTo(user.x, user.y, e.x, e.y);
      if (Math.abs(G.util.angleDiff(facing, a)) > arc / 2 && d > 10) continue;
      if (damageEnemy(e, {
        damage: o.damage, type, ability: o.ability,
        knockback: o.knockback, status: o.status,
        breaksAnyWard: breaksAnyWard(user),
        fromX: user.x, fromY: user.y,
        hitStop: o.hitStop, shake: o.shake,
      })) {
        hits++;
        if (o.passivePull) {
          const d = G.util.dist(e.x, e.y, user.x, user.y);
          const a = G.util.angleTo(e.x, e.y, user.x, user.y);
          const weight = e.def.heavy ? 0.35 : 1;
          const step = Math.min(o.passivePull * weight, Math.max(0, d - 10));
          G.world.moveBox(e, Math.cos(a) * step, Math.sin(a) * step);
        }
        if (user === G.state.player && o.bossStagger !== false) addBossStagger(e, o.stagger || 1);
      }
    }
    G.spawnFx({
      kind: "slash", x: user.x, y: user.y - 6,
      angle: facing, range, arc,
      color: o.color || G.DAMAGE_TYPES[type].color,
      weight: o.weight,
      dur: 0.15,
    });
    if (hits > 0 && user === G.state.player) {
      user.meleeGuard = Math.max(user.meleeGuard || 0, G.MELEE_GUARD_SECONDS);
      if (user.mana < user.manaMax) user.mana = Math.min(user.manaMax, user.mana + 1);
      G.spawnFx({
        kind: "ring", x: user.x, y: user.y - 6,
        color: o.color || G.DAMAGE_TYPES[type].color,
        radius: 7, dur: G.MELEE_GUARD_SECONDS,
      });
      if (o.passiveSlide) {
        G.world.moveBox(user, user.dir.x * o.passiveSlide, user.dir.y * o.passiveSlide);
        G.spawnFx({ kind: "puff", x: user.x, y: user.y - 3, color: "#f4f4f4", dur: 0.12 });
      }
    }
    if (hits >= 2) G.events.emit("multiHit", { ability: o.ability, hits, combo: o.combo });
    return hits;
  }

  // Fire a projectile in the direction you're facing.
  // {speed, damage, type, ability, range, size, color, pierce, status,
  //  spreadDeg, explodeRadius, explodeDamage, hitGroup, boomerang,
  //  outboundRange, shape, ricochets, bounceRange}
  function shoot(user, o) {
    if (G.passives) o = G.passives.prepare("projectile", user, o);
    const type = abilityDamageType(o.ability, o.type, "sharp");
    const facing = Math.atan2(user.dir.y, user.dir.x) + ((o.spreadDeg || 0) * Math.PI) / 180;
    attackPose(user, facing + Math.PI, o.recoil === undefined ? 1.5 : o.recoil, 0.08);
    G.state.projectiles.push({
      x: user.x, y: user.y - 6,
      vx: Math.cos(facing) * (o.speed || 160),
      vy: Math.sin(facing) * (o.speed || 160),
      damage: o.damage || 1,
      type,
      ability: o.ability,
      size: o.size || 3,
      color: o.color || G.DAMAGE_TYPES[type].color,
      pierce: !!o.pierce,
      hitSet: new Set(),
      status: o.status,
      explodeRadius: o.explodeRadius || 0,
      explodeDamage: o.explodeDamage,
      passivePull: o.passivePull || 0,
      hitGroup: o.hitGroup,
      hitStop: o.hitStop,
      shake: o.shake,
      trail: [],
      trailLength: o.trail === undefined ? Math.min(6, 2 + (o.size || 3)) : o.trail,
      shape: o.shape,
      ricochets: o.ricochets || 0,
      ricochetsMax: o.ricochets || 0,
      bounceRange: o.bounceRange || 62,
      boomerang: !!o.boomerang,
      returning: false,
      owner: o.boomerang ? user : null,
      outboundRange: o.outboundRange || Math.max(35, (o.range || 130) * 0.48),
      travel: 0,
      speed: o.speed || 160,
      breaksAnyWard: breaksAnyWard(user),
      startX: user.x, startY: user.y,
      range: o.range || 130,
      fromPlayer: true,
    });
    G.spawnFx({
      kind: "puff",
      x: user.x + Math.cos(facing) * 5,
      y: user.y - 6 + Math.sin(facing) * 5,
      color: o.color || G.DAMAGE_TYPES[type].color,
      dur: 0.12,
    });
    G.sfx.attack("shoot", type, o.damage || 1);
  }

  // Jump to nearby enemies one by one. Low per-target damage keeps this
  // spectacular crowd tool fair when another form borrows it.
  function chain(user, o) {
    if (G.passives) o = G.passives.prepare("chain", user, o);
    const type = abilityDamageType(o.ability, o.type, "light");
    const range = o.range || 75;
    const jumpRange = o.jumpRange || 48;
    const maxTargets = o.maxTargets || 4;
    const color = o.color || G.DAMAGE_TYPES[type].color;
    const facing = Math.atan2(user.dir.y, user.dir.x);
    attackPose(user, facing + Math.PI, 1, 0.08);
    G.sfx.attack("chain", type, o.damage || 1);
    const available = G.state.enemies.filter((e) => {
      if (e.dead) return false;
      const d = G.util.dist(user.x, user.y, e.x, e.y);
      const a = G.util.angleTo(user.x, user.y, e.x, e.y);
      return d <= range + e.def.size / 2 && (d <= 10 || Math.abs(G.util.angleDiff(facing, a)) <= Math.PI * 0.55);
    });
    available.sort((a, b) => G.util.dist(user.x, user.y, a.x, a.y) - G.util.dist(user.x, user.y, b.x, b.y));

    const used = new Set();
    let current = available[0];
    let fromX = user.x, fromY = user.y - 6;
    let hits = 0;
    while (current && used.size < maxTargets) {
      used.add(current);
      if (damageEnemy(current, {
        damage: o.damage || 1, type, ability: o.ability,
        knockback: o.knockback || 35, status: o.status,
        breaksAnyWard: breaksAnyWard(user), fromX, fromY,
        hitStop: o.hitStop === undefined ? 0.02 : o.hitStop,
        shake: o.shake,
      })) hits++;
      G.spawnFx({ kind: "bolt", x: fromX, y: fromY, x2: current.x, y2: current.y - 5, color, dur: 0.22 });
      fromX = current.x; fromY = current.y - 5;
      let next = null, nextDist = Infinity;
      for (const e of G.state.enemies) {
        if (e.dead || used.has(e)) continue;
        const d = G.util.dist(current.x, current.y, e.x, e.y);
        if (d <= jumpRange + e.def.size / 2 && d < nextDist) { next = e; nextDist = d; }
      }
      current = next;
    }
    if (hits >= 2) G.events.emit("multiHit", { ability: o.ability, hits });
    if (!used.size) G.spawnFx({ kind: "ring", x: user.x, y: user.y - 6, color, radius: 8, dur: 0.2 });
    return hits;
  }

  // A readable point-blank burst for wells, counters, and growth effects.
  // Unlike a 360-degree melee swing it can pull targets inward, and it never
  // grants melee clash protection unless the ability supplies its own guard.
  function areaBurst(user, o) {
    if (G.passives) o = G.passives.prepare("area", user, o);
    const type = abilityDamageType(o.ability, o.type, "blunt");
    const range = o.range || 34;
    const color = o.color || G.DAMAGE_TYPES[type].color;
    let hits = 0;
    G.sfx.attack("melee", type, o.damage || 1);
    for (const e of G.state.enemies) {
      if (e.dead || G.util.dist(user.x, user.y, e.x, e.y) > range + e.def.size / 2) continue;
      if (damageEnemy(e, {
        damage: o.damage || 1, type, ability: o.ability,
        knockback: o.pull ? 0 : o.knockback,
        status: o.status, breaksAnyWard: breaksAnyWard(user),
        fromX: user.x, fromY: user.y,
        hitStop: o.hitStop, shake: o.shake,
      })) {
        hits++;
        if (o.pull) {
          const d = G.util.dist(e.x, e.y, user.x, user.y);
          const a = G.util.angleTo(e.x, e.y, user.x, user.y);
          const step = Math.min(o.pull, Math.max(0, d - 10));
          G.world.moveBox(e, Math.cos(a) * step, Math.sin(a) * step);
        }
      }
    }
    G.spawnFx({ kind: "ring", x: user.x, y: user.y - 6, color, radius: range, dur: o.dur || 0.34 });
    if (hits >= 2) G.events.emit("multiHit", { ability: o.ability, hits, combo: o.combo });
    return hits;
  }

  // Zoom forward! Brief invincibility, damages anything you pass through.
  // {dist, damage, type, ability, color}
  function dash(user, o) {
    if (G.passives) o = G.passives.prepare("dash", user, o);
    const type = abilityDamageType(o.ability, o.type, "blunt");
    user.dashing = {
      left: o.dist || 60,
      speed: o.speed || 260,
      dirX: user.dir.x, dirY: user.dir.y,
      damage: o.damage || 0,
      type,
      ability: o.ability,
      breaksAnyWard: breaksAnyWard(user),
      hitSet: new Set(),
      color: o.color || "#f4f4f4",
      hitStop: o.hitStop === undefined ? 0.03 : o.hitStop,
      shake: o.shake,
      endBurst: o.endBurst || null,
    };
    // The entire travel plus its landing belongs to the dash. This duration
    // is derived from the move instead of a fixed guess, so long and short
    // dashes obey the same promise: enemies can be hurt; the dasher cannot.
    user.invuln = Math.max(user.invuln, user.dashing.left / user.dashing.speed + 0.14);
    G.sfx.attack("dash", type, o.damage || 1);
  }

  function finishDash(user, dashData) {
    const burstData = dashData && dashData.endBurst;
    let hits = 0;
    if (burstData) hits = meleeArc(user, {
      ability: burstData.ability || dashData.ability,
      range: burstData.range || 28,
      arcDeg: 360,
      damage: burstData.damage || 1,
      type: burstData.type || dashData.type,
      knockback: burstData.knockback || 135,
      status: burstData.status,
      color: burstData.color || dashData.color,
      weight: burstData.weight || 4,
      hitStop: burstData.hitStop || 0.036,
      shake: burstData.shake || 0.14,
      combo: "dash-finish",
    });
    if (burstData) G.spawnFx({
        kind: "ring", x: user.x, y: user.y - 5,
        color: burstData.color || dashData.color,
        radius: burstData.range || 28, dur: 0.28,
      });
    if (G.passives) G.passives.onDashFinish(user, dashData);
    return hits;
  }

  // Crowd-control-only burst used by form passives. It never deals damage,
  // touches wards, grants mana, or advances quests.
  function forceEnemies(x, y, range, force, color, stunDur) {
    let affected = 0;
    for (const e of G.state.enemies) {
      if (e.dead) continue;
      const d = G.util.dist(x, y, e.x, e.y);
      if (d > range + e.def.size / 2) continue;
      const a = G.util.angleTo(x, y, e.x, e.y);
      const strength = force * (e.def.heavy ? 0.3 : 1);
      e.kbx = Math.cos(a) * strength;
      e.kby = Math.sin(a) * strength;
      if (stunDur && !e.def.miniboss) applyStatus(e, "stun", { dur: stunDur, dps: 0 });
      affected++;
    }
    if (affected) G.spawnFx({ kind: "ring", x, y, color: color || "#f4f4f4", radius: range, dur: 0.24 });
    return affected;
  }

  /* ---------- projectiles flying around ---------- */
  function updateProjectiles(dt) {
    const s = G.state;
    for (let i = s.projectiles.length - 1; i >= 0; i--) {
      const pr = s.projectiles[i];
      // A knockout may clear the projectile list while this loop is already
      // walking it. Never let a stale index stop the entire game loop.
      if (!pr) continue;
      pr.armT = Math.max(0, (pr.armT || 0) - dt);
      if (pr.boomerang && pr.returning && pr.owner) {
        const homeAngle = G.util.angleTo(pr.x, pr.y, pr.owner.x, pr.owner.y - 6);
        pr.vx = Math.cos(homeAngle) * pr.speed;
        pr.vy = Math.sin(homeAngle) * pr.speed;
      }
      pr.trail = pr.trail || [];
      pr.trail.unshift({ x: pr.x, y: pr.y });
      if (pr.trail.length > (pr.trailLength || 3)) pr.trail.length = pr.trailLength || 3;
      const beforeX = pr.x, beforeY = pr.y;
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      pr.travel = (pr.travel || 0) + G.util.dist(beforeX, beforeY, pr.x, pr.y);

      let gone = false;
      if (pr.boomerang) {
        if (!pr.returning && G.util.dist(pr.startX, pr.startY, pr.x, pr.y) >= pr.outboundRange) {
          pr.returning = true;
          if (pr.hitSet) pr.hitSet.clear(); // each foe can be hit once out and once back
          G.spawnFx({ kind: "ring", x: pr.x, y: pr.y - 4, color: pr.color, radius: 6, dur: 0.18 });
        } else if (pr.returning && pr.owner && G.util.dist(pr.x, pr.y, pr.owner.x, pr.owner.y - 6) < 8) {
          gone = true;
        }
        if (pr.travel > pr.range) gone = true; // failsafe if its owner keeps running away
      } else if (pr.ricochetsMax ? pr.travel > pr.range : G.util.dist(pr.startX, pr.startY, pr.x, pr.y) > pr.range) gone = true;

      if (!gone && G.world.solid(pr.x, pr.y - 4)) {
        gone = true;
        G.spawnFx({ kind: "puff", x: pr.x, y: pr.y, color: pr.color, dur: 0.2 });
      } else if (!gone && pr.fromPlayer) {
        for (const e of s.enemies) {
          if (e.dead) continue;
          if (pr.hitSet && pr.hitSet.has(e)) continue;
          if (pr.hitGroup && e.lastProjectileGroup === pr.hitGroup) continue;
          if (G.util.dist(pr.x, pr.y, e.x, e.y - 4) < pr.size + e.def.size / 2) {
            if (pr.explodeRadius) {
              // Piercing shockwaves erupt at every new target and keep going.
              // hitSet makes overlapping eruptions damage each foe only once.
              if (pr.pierce) {
                explodeProjectile(pr);
                continue;
              }
              gone = true;
              break;
            }
            if (pr.hitGroup) e.lastProjectileGroup = pr.hitGroup;
            if (pr.hitSet) pr.hitSet.add(e);
            const hit = damageEnemy(e, {
                damage: pr.damage, type: pr.type, ability: pr.ability,
                status: pr.status, breaksAnyWard: pr.breaksAnyWard,
                fromX: pr.startX, fromY: pr.startY,
                combo: pr.ricochetsMax && pr.ricochets < pr.ricochetsMax ? "ricochet" : undefined,
                hitStop: pr.hitStop, shake: pr.shake,
              });
            if (hit) pr.hitCount = (pr.hitCount || 0) + 1;
            if (!pr.pierce) {
              let next = null, nextDist = Infinity;
              if (pr.ricochets > 0) {
                for (const candidate of s.enemies) {
                  if (candidate.dead || (pr.hitSet && pr.hitSet.has(candidate))) continue;
                  const distance = G.util.dist(pr.x, pr.y, candidate.x, candidate.y - 4);
                  if (distance <= pr.bounceRange + candidate.def.size / 2 && distance < nextDist) {
                    next = candidate;
                    nextDist = distance;
                  }
                }
              }
              if (next) {
                pr.ricochets--;
                const angle = G.util.angleTo(pr.x, pr.y, next.x, next.y - 4);
                pr.vx = Math.cos(angle) * pr.speed;
                pr.vy = Math.sin(angle) * pr.speed;
                G.spawnFx({ kind: "ring", x: pr.x, y: pr.y - 4, color: pr.color, radius: 5, dur: 0.14 });
              } else {
                gone = true;
              }
              break;
            }
          }
        }
      } else if (!gone && pr.armT <= 0) {
        // enemy projectile hitting the player
        const p = s.player;
        if (G.util.dist(pr.x, pr.y, p.x, p.y - 5) < pr.size + 5) {
          G.damagePlayer(pr.damage, pr.x, pr.y);
          // Trial knockouts intentionally clear every shot and start an eject
          // sequence. The old loop indices are invalid after that reset.
          if (s.knockout) return;
          gone = true;
        }
      }
      if (gone && pr.fromPlayer && pr.explodeRadius) explodeProjectile(pr);
      if (gone && pr.fromPlayer && (pr.hitCount || 0) >= 2)
        G.events.emit("multiHit", { ability: pr.ability, hits: pr.hitCount });
      if (gone) s.projectiles.splice(i, 1);
    }
  }

  function explodeProjectile(pr) {
    const damage = pr.explodeDamage === undefined ? pr.damage : pr.explodeDamage;
    let hits = 0;
    for (const e of G.state.enemies) {
      if (e.dead || G.util.dist(pr.x, pr.y, e.x, e.y - 4) > pr.explodeRadius + e.def.size / 2) continue;
      if (pr.hitSet && pr.hitSet.has(e)) continue;
      if (pr.hitSet) pr.hitSet.add(e);
      if (damageEnemy(e, {
        damage, type: pr.type, ability: pr.ability,
        status: pr.status, breaksAnyWard: pr.breaksAnyWard,
        fromX: pr.x, fromY: pr.y,
        knockback: 120,
      })) {
        hits++;
        if (pr.passivePull) {
          const d = G.util.dist(e.x, e.y, pr.x, pr.y);
          const a = G.util.angleTo(e.x, e.y, pr.x, pr.y);
          const step = Math.min(pr.passivePull * (e.def.heavy ? 0.35 : 1), Math.max(0, d - 8));
          G.world.moveBox(e, Math.cos(a) * step, Math.sin(a) * step);
        }
      }
    }
    pr.hitCount = (pr.hitCount || 0) + hits;
    G.state.shake = Math.max(G.state.shake, 0.22);
    G.state.hitStop = Math.max(G.state.hitStop, 0.055);
    G.sfx.play("explosion");
    G.spawnFx({ kind: "ring", x: pr.x, y: pr.y, color: pr.color, radius: pr.explodeRadius, dur: 0.35 });
    burst(pr.x, pr.y, pr.color, 10);
    if (G.passives) G.passives.onExplosion(pr);
    return hits;
  }

  return { damageEnemy, applyStatus, updateStatuses, meleeArc, shoot, chain, areaBurst, dash, finishDash, forceEnemies, updateProjectiles };
})();
