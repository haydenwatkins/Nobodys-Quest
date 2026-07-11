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
     G.combat.dash(user, {...})      — zoom forward, hurting things
     G.combat.applyStatus(enemy, "poison", {...})
   See js/abilities/basics.js for examples of each.
   ============================================================ */

"use strict";

G.combat = (() => {
  /* ---------- dealing damage to an enemy ---------- */
  function breaksAnyWard(user) {
    return user === G.state.player && G.playerForm && G.playerForm().breaksAnyWard;
  }

  function damageEnemy(enemy, opts) {
    // opts: {damage, type, ability, fromX, fromY, knockback, status}
    if (enemy.dead) return false;
    const type = opts.type || "blunt";

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
      G.sfx.play("hit");
      G.damageNumber(enemy.x, enemy.y - enemy.h(), overrulesWard ? "GOD!" : opts.damage, wardHitColor);
      knockback(enemy, opts, 0.7);
      if (enemy.ward.hp <= 0) {
        G.sfx.play("wardBreak");
        G.state.shake = Math.max(G.state.shake, 0.18);
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
    G.state.shake = Math.max(G.state.shake, 0.06);
    G.sfx.play("hit");
    burst(enemy.x, enemy.y - enemy.h() / 2, G.DAMAGE_TYPES[type].color, 3);
    G.damageNumber(enemy.x, enemy.y - enemy.h(), opts.damage, G.DAMAGE_TYPES[type].color);
    knockback(enemy, opts, 1);

    // Attacking is how you refill mana (just like the real game —
    // it keeps players aggressive instead of hiding).
    if (!opts.noMana) {
      const p = G.state.player;
      if (p.mana < p.manaMax) { p.mana = Math.min(p.manaMax, p.mana + 1); }
    }

    G.events.emit("hit", {
      enemy: enemy.id,
      ability: opts.ability,
      damageType: type,
      dist: G.util.dist(G.state.player.x, G.state.player.y, enemy.x, enemy.y),
    });

    if (opts.status) applyStatus(enemy, opts.status.name, opts.status);

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
    if (enemy.def.miniboss) awardMinibossTrophy(enemy);
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
    G.ui.banner(`🏆 MINIBOSS DEFEATED: ${enemy.def.name}!`, `${enemy.def.trophyName} found · +1 ⭐`);
    G.events.emit("pickup", { item: trophy });
    G.checkUnlocks();
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

  // A melee swing in front of you.
  // {range, arcDeg, damage, type, ability, knockback, status, color}
  function meleeArc(user, o) {
    const range = o.range || 20;
    const arc = ((o.arcDeg || 100) * Math.PI) / 180;
    const facing = Math.atan2(user.dir.y, user.dir.x);
    let hits = 0;
    for (const e of G.state.enemies) {
      if (e.dead) continue;
      const d = G.util.dist(user.x, user.y, e.x, e.y);
      if (d > range + e.def.size / 2) continue;
      const a = G.util.angleTo(user.x, user.y, e.x, e.y);
      if (Math.abs(G.util.angleDiff(facing, a)) > arc / 2 && d > 10) continue;
      if (damageEnemy(e, {
        damage: o.damage, type: o.type, ability: o.ability,
        knockback: o.knockback, status: o.status,
        breaksAnyWard: breaksAnyWard(user),
        fromX: user.x, fromY: user.y,
      })) hits++;
    }
    G.spawnFx({
      kind: "slash", x: user.x, y: user.y - 6,
      angle: facing, range, arc,
      color: o.color || G.DAMAGE_TYPES[o.type || "blunt"].color,
      dur: 0.15,
    });
    if (hits >= 2) G.events.emit("multiHit", { ability: o.ability, hits });
    return hits;
  }

  // Fire a projectile in the direction you're facing.
  // {speed, damage, type, ability, range, size, color, pierce, status, spreadDeg}
  function shoot(user, o) {
    const facing = Math.atan2(user.dir.y, user.dir.x) + ((o.spreadDeg || 0) * Math.PI) / 180;
    G.state.projectiles.push({
      x: user.x, y: user.y - 6,
      vx: Math.cos(facing) * (o.speed || 160),
      vy: Math.sin(facing) * (o.speed || 160),
      damage: o.damage || 1,
      type: o.type || "sharp",
      ability: o.ability,
      size: o.size || 3,
      color: o.color || G.DAMAGE_TYPES[o.type || "sharp"].color,
      pierce: !!o.pierce,
      status: o.status,
      breaksAnyWard: breaksAnyWard(user),
      startX: user.x, startY: user.y,
      range: o.range || 130,
      fromPlayer: true,
    });
    G.sfx.play("shoot");
  }

  // Zoom forward! Brief invincibility, damages anything you pass through.
  // {dist, damage, type, ability, color}
  function dash(user, o) {
    user.dashing = {
      left: o.dist || 60,
      speed: o.speed || 260,
      dirX: user.dir.x, dirY: user.dir.y,
      damage: o.damage || 0,
      type: o.type || "blunt",
      ability: o.ability,
      breaksAnyWard: breaksAnyWard(user),
      hitSet: new Set(),
      color: o.color || "#f4f4f4",
    };
    user.invuln = Math.max(user.invuln, 0.3);
    G.sfx.play("dash");
  }

  /* ---------- projectiles flying around ---------- */
  function updateProjectiles(dt) {
    const s = G.state;
    for (let i = s.projectiles.length - 1; i >= 0; i--) {
      const pr = s.projectiles[i];
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;

      let gone = false;
      if (G.util.dist(pr.startX, pr.startY, pr.x, pr.y) > pr.range) gone = true;
      else if (G.world.solid(pr.x, pr.y - 4)) {
        gone = true;
        G.spawnFx({ kind: "puff", x: pr.x, y: pr.y, color: pr.color, dur: 0.2 });
      } else if (pr.fromPlayer) {
        for (const e of s.enemies) {
          if (e.dead) continue;
          if (G.util.dist(pr.x, pr.y, e.x, e.y - 4) < pr.size + e.def.size / 2) {
            damageEnemy(e, {
              damage: pr.damage, type: pr.type, ability: pr.ability,
              status: pr.status, breaksAnyWard: pr.breaksAnyWard,
              fromX: pr.startX, fromY: pr.startY,
            });
            if (!pr.pierce) { gone = true; break; }
          }
        }
      } else {
        // enemy projectile hitting the player
        const p = s.player;
        if (G.util.dist(pr.x, pr.y, p.x, p.y - 5) < pr.size + 5) {
          G.damagePlayer(pr.damage, pr.x, pr.y);
          gone = true;
        }
      }
      if (gone) s.projectiles.splice(i, 1);
    }
  }

  return { damageEnemy, applyStatus, updateStatuses, meleeArc, shoot, dash, updateProjectiles };
})();
