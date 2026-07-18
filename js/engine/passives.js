/* ============================================================
   FORM PASSIVES — the rule that stays with a form even when its
   B and C abilities come from somewhere else.

   Passives deliberately change handling, positioning, defense,
   and crowd control instead of mana or blanket damage. The Mix
   screen uses the same ability-style metadata as this engine, so
   a player can see why a borrowed move suits the current form.
   ============================================================ */

"use strict";

G.passives = (() => {
  const STYLE_INFO = {
    melee: { name: "Melee", icon: "⚔️" },
    projectile: { name: "Projectile", icon: "🏹" },
    dash: { name: "Dash", icon: "💨" },
    area: { name: "Area", icon: "💥" },
    chain: { name: "Chain", icon: "⚡" },
  };

  function current(user) {
    if (!G.state || user !== G.state.player || !G.playerForm) return null;
    return G.playerForm().passive || null;
  }

  function ability(abilityId) { return abilityId && G.abilities[abilityId]; }
  function styleOf(abilityId) { return (ability(abilityId) || {}).style || ""; }
  function hasTrait(abilityId, trait) {
    return ((ability(abilityId) || {}).traits || []).includes(trait);
  }
  function isBorrowed(formId, abilityId) {
    const ab = ability(abilityId);
    return !!(ab && ab.nativeForm && ab.nativeForm !== formId);
  }

  function formMatches(form, ab) {
    if (!form || !form.passive || !ab) return false;
    if (form.passive.effects && form.passive.effects[ab.style]) return true;
    const id = form.passive.id;
    if (["scurry", "conductor"].includes(id)) return true;
    if (id === "improviser") return isBorrowed(form.id, ab.id);
    if (["steadfast", "elastic", "unstoppable", "flowingDraw"].includes(id)) return ab.style === "melee";
    if (["clearShot", "trickTrajectory"].includes(id)) return ab.style === "projectile";
    if (["catalyst", "aftershock", "gravityTouch"].includes(id)) return ab.style === "area";
    if (id === "afterimage") return ab.style === "dash";
    if (["hexcraft", "seedbed"].includes(id)) return (ab.traits || []).includes("status");
    return false;
  }

  function synergyText(form, ab) {
    if (!formMatches(form, ab)) return "";
    const id = form.passive.id;
    const text = {
      improviser: "Adaptive handling",
      scurry: "Triggers Scurry",
      steadfast: "Guarded melee",
      clearShot: "Larger, faster shot",
      hexcraft: "Longer status",
      elastic: "Long reach + pull",
      catalyst: "Wider area",
      conductor: "Conductive shove",
      unstoppable: "Bigger sweep",
      afterimage: "Afterimage landing",
      aftershock: "Delayed tremor",
      bloodskin: "Works with Bloodskin",
      trickTrajectory: "Bonus ricochet",
      shellback: "Shellback always active",
      flowingDraw: "Moving draw-step",
      gravityTouch: "Gravity pull",
      seedbed: "Status can spread",
      providence: "Providence always active",
    };
    return text[id] || form.passive.name;
  }

  function prepare(kind, user, original) {
    const passive = current(user);
    if (!passive) return original;
    const o = { ...original };
    const form = G.playerForm();
    const style = styleOf(o.ability);

    // Workshop-friendly declarative effects let a future form create a safe,
    // style-based passive without editing combat code. Special fantasies below
    // still use bespoke hooks when numbers alone would not express the idea.
    const effect = passive.effects && passive.effects[style];
    if (effect) {
      if (effect.rangeScale && ["melee", "projectile", "area", "chain"].includes(kind))
        o.range = (o.range || (kind === "melee" ? 20 : kind === "area" ? 34 : kind === "chain" ? 75 : 130)) * effect.rangeScale;
      if (effect.jumpRangeScale && kind === "chain") o.jumpRange = (o.jumpRange || 48) * effect.jumpRangeScale;
      if (effect.speedScale && kind === "projectile") o.speed = (o.speed || 160) * effect.speedScale;
      if (effect.sizeBonus && kind === "projectile") o.size = (o.size || 3) + effect.sizeBonus;
      if (effect.arcBonus && kind === "melee") o.arcDeg = Math.min(360, (o.arcDeg || 100) + effect.arcBonus);
      if (effect.knockbackScale && (kind === "melee" || kind === "area"))
        o.knockback = (o.knockback === undefined ? 90 : o.knockback) * effect.knockbackScale;
      if (effect.pull && kind === "melee") { o.knockback = 0; o.passivePull = effect.pull; }
      if (effect.pull && kind === "area") o.pull = Math.max(o.pull || 0, effect.pull);
      if (effect.ricochets && kind === "projectile") o.ricochets = (o.ricochets || 0) + effect.ricochets;
      if (effect.guard && kind === "melee") {
        user.meleeGuard = Math.max(user.meleeGuard || 0, effect.guard);
        o.passiveGuard = true;
      }
      if (effect.dashDistanceScale && kind === "dash") o.dist = (o.dist || 60) * effect.dashDistanceScale;
    }

    // Nobody is the mixing specialist: borrowed moves gain usability, never
    // extra damage. Each combat primitive receives an appropriate small perk.
    if (passive.id === "improviser" && isBorrowed(form.id, o.ability)) {
      if (kind === "melee") {
        o.range = (o.range || 20) * 1.12;
        o.arcDeg = Math.min(360, (o.arcDeg || 100) + 12);
      } else if (kind === "projectile") {
        o.speed = (o.speed || 160) * 1.12;
        o.size = (o.size || 3) + 0.5;
      } else if (kind === "dash") {
        o.dist = (o.dist || 60) * 1.08;
      } else if (kind === "area") {
        o.range = (o.range || 34) * 1.1;
      } else if (kind === "chain") {
        o.jumpRange = (o.jumpRange || 48) * 1.1;
      }
    }

    if (passive.id === "steadfast" && style === "melee" && kind === "melee") {
      user.meleeGuard = Math.max(user.meleeGuard || 0, 0.28);
      o.passiveGuard = true;
    }

    if (passive.id === "clearShot" && style === "projectile" && kind === "projectile") {
      o.speed = (o.speed || 160) * 1.22;
      o.range = (o.range || 130) * 1.08;
      o.size = (o.size || 3) + 1;
    }

    if (passive.id === "hexcraft" && hasTrait(o.ability, "status") && o.status) {
      o.status = { ...o.status, dur: (o.status.dur || 3) * 1.45 };
    }

    if (passive.id === "elastic" && style === "melee" && kind === "melee") {
      o.range = (o.range || 20) * 1.22;
      o.knockback = 0;
      o.passivePull = 11;
    }

    if (passive.id === "catalyst" && style === "area") {
      if (kind === "area") o.range = (o.range || 34) * 1.18;
      if (kind === "projectile") {
        o.range = (o.range || 130) * 1.12;
        if (o.explodeRadius) o.explodeRadius *= 1.22;
      }
    }

    if (passive.id === "unstoppable" && style === "melee" && kind === "melee") {
      o.range = (o.range || 20) * 1.08;
      o.arcDeg = Math.min(360, (o.arcDeg || 100) + 30);
      o.knockback = (o.knockback === undefined ? 90 : o.knockback) * 1.25;
      o.weight = Math.max(4, o.weight || 0);
    }

    if (passive.id === "trickTrajectory" && style === "projectile" && kind === "projectile") {
      o.ricochets = (o.ricochets || 0) + 1;
      o.bounceRange = Math.max(70, (o.bounceRange || 62) * 1.15);
    }

    if (passive.id === "flowingDraw" && style === "melee" && kind === "melee" && user.moving) {
      o.passiveSlide = 7;
      o.range = (o.range || 20) * 1.1;
    }

    if (passive.id === "gravityTouch" && style === "area") {
      if (kind === "area") o.pull = Math.max(o.pull || 0, 12);
      if (kind === "projectile" && o.explodeRadius) o.passivePull = 10;
    }

    return o;
  }

  function onAbilityUse(user, abilityId) {
    const passive = current(user);
    if (!passive) return;
    if (passive.id === "scurry") {
      user.passiveHaste = 0.9;
      G.spawnFx({ kind: "puff", x: user.x, y: user.y - 3, color: "#94b0c2", dur: 0.18 });
    }
    if (passive.id === "aftershock" && styleOf(abilityId) === "area") {
      scheduleEcho(user.x, user.y - 3, 34, "#d8b06a", 0.24);
    }
  }

  function onHit(enemy, opts) {
    const p = G.state.player;
    const passive = current(p);
    if (!passive || enemy.dead) return;

    if (passive.id === "conductor") {
      const now = G.state.time || 0;
      if (now >= (p.conductorReadyAt || 0)) {
        let next = null, best = Infinity;
        for (const candidate of G.state.enemies) {
          if (candidate.dead || candidate === enemy) continue;
          const d = G.util.dist(enemy.x, enemy.y, candidate.x, candidate.y);
          if (d <= 46 + candidate.def.size / 2 && d < best) { next = candidate; best = d; }
        }
        if (next) {
          p.conductorReadyAt = now + 0.22;
          const a = G.util.angleTo(enemy.x, enemy.y, next.x, next.y);
          const force = next.def.heavy ? 22 : 70;
          next.kbx = Math.cos(a) * force;
          next.kby = Math.sin(a) * force;
          G.spawnFx({ kind: "bolt", x: enemy.x, y: enemy.y - 5, x2: next.x, y2: next.y - 5, color: "#73eff7", dur: 0.18 });
          G.damageNumber(next.x, next.y - next.h(), "SHOVE!", "#73eff7");
        }
      }
    }

    if (passive.id === "hexcraft" && enemy.status && Object.keys(enemy.status).length) {
      enemy.kbx *= 1.25;
      enemy.kby *= 1.25;
      if (enemy.def.miniboss) enemy.bossStagger = Math.min(G.BOSS_STAGGER_HITS, (enemy.bossStagger || 0) + 0.25);
    }
  }

  function onKill(enemy) {
    const passive = current(G.state.player);
    if (!passive || passive.id !== "seedbed" || !enemy.status) return;
    const statusName = Object.keys(enemy.status).find((name) => enemy.status[name] && enemy.status[name].dur > 0);
    if (!statusName) return;
    let next = null, best = Infinity;
    for (const candidate of G.state.enemies) {
      if (candidate.dead || (candidate.status && candidate.status[statusName])) continue;
      const d = G.util.dist(enemy.x, enemy.y, candidate.x, candidate.y);
      if (d <= 62 + candidate.def.size / 2 && d < best) { next = candidate; best = d; }
    }
    if (!next) return;
    const old = enemy.status[statusName];
    G.combat.applyStatus(next, statusName, { dur: Math.max(0.8, old.dur * 0.7), dps: old.dps });
    G.spawnFx({ kind: "bolt", x: enemy.x, y: enemy.y - 5, x2: next.x, y2: next.y - 5, color: "#a7f070", dur: 0.3 });
    G.damageNumber(next.x, next.y - next.h(), "SPREAD!", "#a7f070");
  }

  function onDashFinish(user) {
    const passive = current(user);
    if (!passive) return;
    if (passive.id === "afterimage") {
      G.combat.forceEnemies(user.x, user.y, 28, 115, "#73eff7");
      G.spawnFx({ kind: "slash", x: user.x, y: user.y - 6, angle: Math.atan2(user.dir.y, user.dir.x) + Math.PI,
        range: 25, arc: Math.PI * 1.4, color: "#73eff7", weight: 4, dur: 0.2 });
    }
    if (passive.id === "aftershock") scheduleEcho(user.x, user.y - 3, 30, "#d8b06a", 0.22);
  }

  function onExplosion(pr) {
    const passive = current(G.state.player);
    if (!passive || styleOf(pr.ability) !== "area") return;
    if (passive.id === "aftershock") scheduleEcho(pr.x, pr.y, pr.explodeRadius, "#d8b06a", 0.22);
  }

  function scheduleEcho(x, y, radius, color, delay) {
    const s = G.state;
    s.passiveEchoes = s.passiveEchoes || [];
    // Multi-projectile area casts can explode together. One echo at nearly
    // the same place is enough and prevents accidental crowd-control spam.
    if (s.passiveEchoes.some((echo) => G.util.dist(x, y, echo.x, echo.y) < 10 && Math.abs(echo.t - delay) < 0.08)) return;
    s.passiveEchoes.push({ x, y, radius, color, t: delay });
    G.spawnFx({ kind: "tell", x, y, radius, color, dur: delay + 0.08 });
  }

  function update(dt) {
    if (!G.state) return;
    const p = G.state.player;
    p.passiveHaste = Math.max(0, (p.passiveHaste || 0) - dt);
    p.passiveBarrierT = Math.max(0, (p.passiveBarrierT || 0) - dt);
    if (p.passiveBarrierT <= 0) p.passiveBarrier = 0;

    const echoes = G.state.passiveEchoes || [];
    for (let i = echoes.length - 1; i >= 0; i--) {
      const echo = echoes[i];
      echo.t -= dt;
      if (echo.t > 0) continue;
      G.combat.forceEnemies(echo.x, echo.y, echo.radius, 95, echo.color, 0.22);
      G.spawnFx({ kind: "ring", x: echo.x, y: echo.y, color: echo.color, radius: echo.radius, dur: 0.28 });
      G.sfx.play("stagger");
      echoes.splice(i, 1);
    }
  }

  function movementScale(user) {
    const passive = current(user);
    return passive && passive.id === "scurry" && user.passiveHaste > 0 ? 1.24 : 1;
  }

  function beforePlayerDamage(dmg, fromX, fromY) {
    const p = G.state.player;
    const passive = current(p);
    const result = { damage: dmg, knockback: true, prevented: false };

    if (p.passiveBarrier > 0) {
      const absorbed = Math.min(result.damage, p.passiveBarrier);
      p.passiveBarrier -= absorbed;
      result.damage -= absorbed;
      result.knockback = result.damage > 0;
      G.damageNumber(p.x, p.y - 18, "BLOODSKIN!", "#ef7d57");
      G.spawnFx({ kind: "ring", x: p.x, y: p.y - 7, color: "#b13e53", radius: 13, dur: 0.28 });
      if (result.damage <= 0) result.prevented = true;
    }

    if (!result.prevented && passive && passive.id === "shellback" && fromX !== undefined) {
      const toSource = G.util.angleTo(p.x, p.y, fromX, fromY);
      const facing = Math.atan2(p.dir.y, p.dir.x);
      if (Math.cos(G.util.angleDiff(facing, toSource)) < -0.25) {
        result.damage = Math.max(0, result.damage - 1);
        result.knockback = false;
        result.prevented = result.damage === 0;
        G.damageNumber(p.x, p.y - 18, "SHELL!", "#a7f070");
        G.spawnFx({ kind: "ring", x: p.x, y: p.y - 7, color: "#6b8e3e", radius: 14, dur: 0.25 });
      }
    }

    if (!result.prevented && passive && passive.id === "providence" &&
        G.playerHp() - result.damage <= 0) {
      const boss = G.state.enemies.find((enemy) => enemy.def.miniboss && !enemy.dead);
      const key = boss ? `${G.state.mapId}:${boss.id}:${boss.bossPhase}` : `${G.state.mapId}:room`;
      if (p.providenceKey !== key) {
        p.providenceKey = key;
        p.damageTaken = Math.max(0, G.playerMaxHearts() - 1);
        p.invuln = Math.max(p.invuln || 0, 1.1);
        const away = fromX === undefined ? Math.atan2(-p.dir.y, -p.dir.x) : G.util.angleTo(fromX, fromY, p.x, p.y);
        G.world.moveBox(p, Math.cos(away) * 18, Math.sin(away) * 18);
        G.damageNumber(p.x, p.y - 20, "PROVIDENCE!", "#ffcd75");
        G.spawnFx({ kind: "ring", x: p.x, y: p.y - 7, color: "#ffcd75", radius: 24, dur: 0.5 });
        G.sfx.play("unlock");
        result.damage = 0;
        result.knockback = false;
        result.prevented = true;
      }
    }
    return result;
  }

  function onHeal(user, amount, healed) {
    const passive = current(user);
    if (!passive || passive.id !== "bloodskin") return;
    const overflow = Math.max(0, amount - healed);
    if (overflow <= 0) return;
    user.passiveBarrier = Math.min(2, (user.passiveBarrier || 0) + overflow);
    user.passiveBarrierT = 8;
    G.damageNumber(user.x, user.y - 18, "BLOODSKIN!", "#ef7d57");
    G.spawnFx({ kind: "ring", x: user.x, y: user.y - 7, color: "#b13e53", radius: 13, dur: 0.3 });
  }

  function onFormChange(user) {
    user.passiveHaste = 0;
    user.passiveBarrier = 0;
    user.passiveBarrierT = 0;
    user.providenceKey = null;
  }

  function styleLabel(style) {
    const info = STYLE_INFO[style];
    return info ? `${info.icon} ${info.name}` : style;
  }

  return {
    STYLE_INFO, styleOf, styleLabel, hasTrait, isBorrowed, formMatches, synergyText,
    prepare, onAbilityUse, onHit, onKill, onDashFinish, onExplosion,
    update, movementScale, beforePlayerDamage, onHeal, onFormChange,
  };
})();
