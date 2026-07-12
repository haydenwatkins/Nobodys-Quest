/* ============================================================
   ENTITIES — the player, the enemies, and the shiny pickups.
   ============================================================ */

"use strict";

/* ================= PLAYER ================= */

G.makePlayer = function () {
  return {
    x: 0, y: 0,
    dir: { x: 0, y: 1 },       // which way you're facing
    boxW: 9, boxH: 7,          // feet collision box
    anim: 0,
    moving: false,
    invuln: 0,                 // seconds of "can't be hurt"
    damageTaken: 0,            // hearts lost (max hearts comes from the form)
    mana: 6, manaMax: 10,
    cooldowns: {},             // abilityId -> seconds left
    abilityBuffer: {},         // button -> recent tap waiting on cooldown
    attackPose: null,
    swapCd: 0,
    dashing: null,
    lastSafe: null,
  };
};

G.playerForm = function () { return G.forms[G.state.formId]; };
G.playerMaxHearts = function () { return G.playerForm().hearts; };
G.playerHp = function () { return Math.max(0, G.playerMaxHearts() - G.state.player.damageTaken); };

G.autoAimTarget = function (user, maxRange) {
  let best = null, bestDist = Infinity;
  for (const enemy of G.state.enemies) {
    if (enemy.dead) continue;
    const d = G.util.dist(user.x, user.y, enemy.x, enemy.y);
    if (d > maxRange + enemy.def.size / 2 || d >= bestDist) continue;

    // Skip enemies hidden behind walls or trees. Sampling is cheap at this
    // tiny resolution and avoids the frustrating "shoot the wall" lock-on.
    const steps = Math.max(2, Math.ceil(d / 8));
    let visible = true;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (G.world.solid(
        user.x + (enemy.x - user.x) * t,
        user.y - 5 + (enemy.y - user.y) * t,
      )) { visible = false; break; }
    }
    if (!visible) continue;
    best = enemy;
    bestDist = d;
  }
  return best;
};

let touchAimHelpShown = false;

G.damagePlayer = function (dmg, fromX, fromY) {
  const p = G.state.player;
  if (p.invuln > 0 || p.dashing) return;
  p.damageTaken += dmg;
  p.invuln = 1.0;
  G.sfx.play("hurt");
  G.state.shake = 0.25;
  // knock the player back a bit
  if (fromX !== undefined) {
    const a = G.util.angleTo(fromX, fromY, p.x, p.y);
    G.world.moveBox(p, Math.cos(a) * 10, Math.sin(a) * 10);
  }
  if (G.playerHp() <= 0) {
    // Knocked out! Gentle for kids: back to the map entrance, fully healed.
    G.sfx.play("ko");
    p.damageTaken = 0;
    p.invuln = 2;
    p.x = G.state.entryPoint.x;
    p.y = G.state.entryPoint.y;
    G.ui.toast("💫 You got knocked out! ...But you're okay. Try again!", 3);
    G.events.emit("ko", {});
  }
};

G.updatePlayer = function (dt) {
  const p = G.state.player;
  const form = G.playerForm();

  p.invuln = Math.max(0, p.invuln - dt);
  p.swapCd = Math.max(0, p.swapCd - dt);
  if (p.attackPose) {
    p.attackPose.t -= dt;
    if (p.attackPose.t <= 0) p.attackPose = null;
  }
  for (const k in p.cooldowns) p.cooldowns[k] = Math.max(0, p.cooldowns[k] - dt);

  /* --- dashing overrides normal movement --- */
  if (p.dashing) {
    const d = p.dashing;
    const step = Math.min(d.left, d.speed * dt);
    const beforeX = p.x, beforeY = p.y;
    G.world.moveBox(p, d.dirX * step, d.dirY * step);
    d.left -= step;
    G.spawnFx({ kind: "puff", x: p.x, y: p.y - 4, color: d.color, dur: 0.2 });
    // hurt things we zoom through
    if (d.damage > 0) {
      for (const e of G.state.enemies) {
        if (e.dead || d.hitSet.has(e)) continue;
        if (G.util.dist(p.x, p.y, e.x, e.y) < 6 + e.def.size / 2) {
          d.hitSet.add(e);
          G.combat.damageEnemy(e, {
            damage: d.damage, type: d.type, ability: d.ability,
            breaksAnyWard: d.breaksAnyWard,
            fromX: beforeX, fromY: beforeY,
            hitStop: d.hitStop, shake: d.shake,
          });
        }
      }
    }
    const stuck = p.x === beforeX && p.y === beforeY;
    if (d.left <= 0 || stuck) p.dashing = null;
  } else {
    /* --- normal movement --- */
    const v = G.input.vec;
    p.moving = v.x !== 0 || v.y !== 0;
    if (p.moving) {
      p.dir = { x: v.x, y: v.y };
      const spd = form.speed;
      G.world.moveBox(p, v.x * spd * dt, v.y * spd * dt);
      p.anim += dt * (spd / 14);
    }
  }

  /* --- abilities: A / B / C --- */
  const loadout = G.getLoadout(G.state.formId);
  const buttons = ["a", "b", "c"];
  // A tap just before cooldown ends waits briefly instead of disappearing.
  // This makes a fast rhythm reliable on both touchscreens and keyboards.
  for (const button of buttons) {
    if (G.input.tapped(button)) {
      p.abilityBuffer[button] = { t: 0.12, aim: G.input.takeAim(button) };
    } else if (p.abilityBuffer[button]) {
      p.abilityBuffer[button].t -= dt;
      if (p.abilityBuffer[button].t <= 0) delete p.abilityBuffer[button];
    }
  }
  for (let slot = 0; slot < buttons.length; slot++) {
    const button = buttons[slot];
    const buffered = p.abilityBuffer[button];
    if (!buffered) continue;
    const touchAim = buffered.aim;
    const abilityId = loadout[slot];
    if (!abilityId) { delete p.abilityBuffer[button]; continue; }
    const ab = G.abilities[abilityId];
    if (!ab) { delete p.abilityBuffer[button]; continue; }
    if ((p.cooldowns[abilityId] || 0) > 0) continue;
    if (touchAim && touchAim.dragged) {
      p.dir = { x: touchAim.x, y: touchAim.y };
    } else if (touchAim && ab.autoAim) {
      const target = G.autoAimTarget(p, ab.aimRange || 170);
      if (target) {
        const angle = G.util.angleTo(p.x, p.y - 5, target.x, target.y - 4);
        p.dir = { x: Math.cos(angle), y: Math.sin(angle) };
        G.spawnFx({ kind: "ring", x: target.x, y: target.y - 4, color: "#73eff7", radius: 6, dur: 0.18 });
      }
      if (!touchAimHelpShown) {
        touchAimHelpShown = true;
        G.ui.toast("🎯 Tap ranged attacks to auto-aim · drag to aim yourself", 3.5);
      }
    }
    if (ab.mana > p.mana) {
      G.ui.toast("💧 Not enough mana — smack things with A to refill!", 1.5);
      delete p.abilityBuffer[button];
      continue;
    }
    delete p.abilityBuffer[button];
    p.mana -= ab.mana;
    p.cooldowns[abilityId] = ab.cooldown;
    ab.use(p);
    G.events.emit("abilityUse", { ability: abilityId, form: G.state.formId });
  }

  /* --- quick-swap forms --- */
  if (G.input.tapped("swap") && p.swapCd <= 0) {
    const unlocked = G.unlockedForms();
    if (unlocked.length > 1) {
      const i = unlocked.indexOf(G.state.formId);
      G.setForm(unlocked[(i + 1) % unlocked.length]);
      p.swapCd = 0.4;
    }
  }

  G.world.checkTriggers(dt);
};

/* ================= ENEMIES ================= */

function registerEnemy(def) {
  if (!def.id) { console.error("An enemy needs an id!", def); return; }
  def.size = def.size || 12;
  G.enemies[def.id] = def;
}

G.makeEnemy = function (id, x, y) {
  const def = G.enemies[id];
  if (!def) { console.error("No enemy called " + id); return { dead: true, def: { size: 0 }, h: () => 0 }; }
  return {
    id, def,
    x, y,
    hp: def.hp,
    ward: def.ward ? { types: def.ward.types.slice(), hp: def.ward.hp, hpMax: def.ward.hp } : null,
    boxW: Math.min(12, def.size - 2), boxH: 6,
    dir: { x: 0, y: 1 },
    anim: Math.random() * 10,
    wanderT: 0, wanderDir: { x: 0, y: 0 },
    shootT: 1 + Math.random(),
    touchCd: 0,
    kbx: 0, kby: 0,
    hitKickX: 0, hitKickY: 0,
    flash: 0,
    dead: false,
    status: null,
    h() { return this.def.size; },
  };
};

G.updateEnemies = function (dt) {
  const s = G.state;
  const p = s.player;

  for (let i = s.enemies.length - 1; i >= 0; i--) {
    const e = s.enemies[i];
    if (e.dead) { s.enemies.splice(i, 1); continue; }

    e.flash = Math.max(0, e.flash - dt);
    e.hitKickX *= Math.pow(0.001, dt);
    e.hitKickY *= Math.pow(0.001, dt);
    if (Math.abs(e.hitKickX) < 0.05) e.hitKickX = 0;
    if (Math.abs(e.hitKickY) < 0.05) e.hitKickY = 0;
    e.touchCd = Math.max(0, e.touchCd - dt);
    e.anim += dt * 4;
    G.combat.updateStatuses(e, dt);
    if (e.dead) { s.enemies.splice(i, 1); continue; } // poison may have finished it

    // knockback slides
    if (e.kbx || e.kby) {
      G.world.moveBox(e, e.kbx * dt, e.kby * dt);
      e.kbx *= Math.pow(0.002, dt);
      e.kby *= Math.pow(0.002, dt);
      if (Math.abs(e.kbx) < 4 && Math.abs(e.kby) < 4) e.kbx = e.kby = 0;
    }

    const stunned = e.status && e.status.stun;
    const d = G.util.dist(e.x, e.y, p.x, p.y);

    if (!stunned) {
      const beh = e.def.behavior || "wander";
      let mx = 0, my = 0;

      if (beh === "chase" && d < (e.def.aggro || 80)) {
        const a = G.util.angleTo(e.x, e.y, p.x, p.y);
        mx = Math.cos(a); my = Math.sin(a);
      } else if (beh === "shooter" && d < (e.def.aggro || 110)) {
        // keep a comfy distance and pew pew
        const a = G.util.angleTo(e.x, e.y, p.x, p.y);
        if (d < 60) { mx = -Math.cos(a); my = -Math.sin(a); }
        e.shootT -= dt;
        if (e.shootT <= 0) {
          e.shootT = e.def.shootEvery || 1.6;
          s.projectiles.push({
            x: e.x, y: e.y - 6,
            vx: Math.cos(a) * 90, vy: Math.sin(a) * 90,
            damage: e.def.damage || 1, size: 3,
            color: e.def.shotColor || "#b13e53",
            startX: e.x, startY: e.y, range: 140,
            fromPlayer: false,
          });
        }
      } else {
        // amble around
        e.wanderT -= dt;
        if (e.wanderT <= 0) {
          e.wanderT = 0.8 + Math.random() * 1.6;
          e.wanderDir = Math.random() < 0.35
            ? { x: 0, y: 0 }
            : (() => { const a = Math.random() * Math.PI * 2; return { x: Math.cos(a), y: Math.sin(a) }; })();
        }
        mx = e.wanderDir.x * 0.5; my = e.wanderDir.y * 0.5;
      }

      if (mx || my) {
        e.dir = { x: mx, y: my };
        G.world.moveBox(e, mx * e.def.speed * dt, my * e.def.speed * dt);
      }
    }

    // bonk the player on contact
    if (e.touchCd <= 0 && d < 7 + e.def.size / 2) {
      e.touchCd = 0.6;
      G.damagePlayer(e.def.damage || 1, e.x, e.y);
    }
  }
};

/* ================= PICKUPS ================= */

G.updatePickups = function (dt) {
  const s = G.state;
  const p = s.player;
  for (let i = s.pickups.length - 1; i >= 0; i--) {
    const pk = s.pickups[i];
    pk.t += dt;
    const d = G.util.dist(pk.x, pk.y, p.x, p.y);
    if (d < 30) { // magnet!
      const a = G.util.angleTo(pk.x, pk.y, p.x, p.y);
      pk.x += Math.cos(a) * 90 * dt;
      pk.y += Math.sin(a) * 90 * dt;
    }
    if (d < 8) {
      if (pk.kind === "heart") {
        p.damageTaken = Math.max(0, p.damageTaken - 1);
        G.sfx.play("pickup");
      } else {
        p.mana = Math.min(p.manaMax, p.mana + 3);
        G.sfx.play("mana");
      }
      s.pickups.splice(i, 1);
      continue;
    }
    if (pk.t > 12) s.pickups.splice(i, 1); // fades away eventually
  }
};

/* ================= DRAWING ================= */

G.drawShadow = function (ctx, x, y, w) {
  ctx.fillStyle = "rgba(26,28,44,0.35)";
  ctx.fillRect(Math.round(x - w / 2), Math.round(y - 2), w, 3);
};

G.drawPlayerAura = function (ctx, p, form) {
  const aura = form.aura;
  if (!aura) return;
  const t = G.state.time;
  const pulse = 0.5 + Math.sin(t * 4) * 0.5;
  ctx.save();
  ctx.globalAlpha = 0.25 + pulse * 0.15;
  ctx.strokeStyle = aura.ring || "#ffcd75";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(p.x, p.y - 12, 12 + pulse * 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = aura.void || "#8153c1";
  ctx.beginPath();
  ctx.arc(p.x, p.y - 12, 6 + (1 - pulse) * 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.85;
  for (let i = 0; i < 6; i++) {
    const a = t * 1.8 + i * Math.PI / 3;
    const r = 14 + ((i % 2) * 4) + pulse;
    ctx.fillStyle = i % 2 ? aura.spark || "#41a6f6" : aura.ring || "#ffcd75";
    ctx.fillRect(Math.round(p.x + Math.cos(a) * r), Math.round(p.y - 12 + Math.sin(a) * r), 2, 2);
  }
  ctx.restore();
};

G.drawPlayer = function (ctx) {
  const p = G.state.player;
  const form = G.playerForm();
  if (p.invuln > 0 && Math.floor(p.invuln * 12) % 2 === 0 && !p.dashing) return; // hurt blink
  G.drawPlayerAura(ctx, p, form);
  G.drawShadow(ctx, p.x, p.y, 10);
  const frame = p.moving || p.dashing ? Math.floor(p.anim) % 2 : 0;
  const poseScale = p.attackPose ? p.attackPose.t / p.attackPose.dur : 0;
  const drawX = p.x + (p.attackPose ? p.attackPose.x * poseScale : 0);
  const drawY = p.y + (p.attackPose ? p.attackPose.y * poseScale : 0);
  G.drawSprite(ctx, form.sprite, frame, drawX, drawY, p.dir.x < 0);
};

G.drawAimGuide = function (ctx) {
  const aim = G.input.aiming;
  if (!aim || !aim.dragged || !G.state) return;
  const p = G.state.player;
  const slot = { a: 0, b: 1, c: 2 }[aim.btn];
  const abilityId = G.getLoadout(G.state.formId)[slot];
  const ability = G.abilities[abilityId];
  const color = ability && G.DAMAGE_TYPES[ability.type]
    ? G.DAMAGE_TYPES[ability.type].color
    : "#73eff7";
  const length = Math.min(90, (ability && ability.aimRange) || 70);
  const x2 = p.x + aim.x * length;
  const y2 = p.y - 5 + aim.y * length;

  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y - 5);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x2 - 2), Math.round(y2 - 2), 5, 1);
  ctx.fillRect(Math.round(x2), Math.round(y2 - 4), 1, 5);
  ctx.restore();
};

G.drawEnemy = function (ctx, e) {
  G.drawShadow(ctx, e.x, e.y, e.def.size - 2);
  const frame = Math.floor(e.anim) % 2;
  const drawX = e.x + (e.hitKickX || 0);
  const drawY = e.y + (e.hitKickY || 0);

  if (e.flash > 0) {
    // white flash when hurt — redraw sprite silhouette in white
    ctx.save();
    ctx.filter = "brightness(3) grayscale(1)";
    G.drawSprite(ctx, e.def.sprite, frame, drawX, drawY, e.dir.x < 0);
    ctx.restore();
  } else {
    G.drawSprite(ctx, e.def.sprite, frame, drawX, drawY, e.dir.x < 0);
  }

  // poison bubbles tint
  if (e.status && e.status.poison && Math.floor(e.anim * 3) % 3 === 0) {
    ctx.fillStyle = "#a7f070";
    ctx.fillRect(Math.round(e.x - 1), Math.round(e.y - e.def.size - 3), 2, 2);
  }
  // stun stars
  if (e.status && e.status.stun) {
    ctx.fillStyle = "#ffcd75";
    const a = e.anim * 6;
    ctx.fillRect(Math.round(e.x + Math.cos(a) * 6), Math.round(e.y - e.def.size - 2 + Math.sin(a) * 2), 2, 2);
  }

  // WARD RING — colored by the damage type that breaks it
  if (e.ward && e.ward.hp > 0) {
    ctx.strokeStyle = G.DAMAGE_TYPES[e.ward.types[0]].color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6 + 0.3 * Math.sin(e.anim * 2);
    ctx.beginPath();
    ctx.arc(e.x, e.y - e.def.size / 2, e.def.size / 2 + 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Minibosses keep a gold crown and health bar visible so players know
  // they have found something special before the first hit lands.
  if (e.def.miniboss) {
    const cy = Math.round(e.y - e.def.size - 11);
    ctx.fillStyle = "#ffcd75";
    ctx.fillRect(Math.round(e.x - 5), cy, 3, 3);
    ctx.fillRect(Math.round(e.x - 1), cy - 2, 3, 5);
    ctx.fillRect(Math.round(e.x + 3), cy, 3, 3);
    ctx.fillRect(Math.round(e.x - 5), cy + 3, 11, 2);
  }

  // Normal health bars appear once damaged; miniboss bars are always visible.
  if (e.def.miniboss || e.hp < e.def.hp) {
    const w = e.def.miniboss ? Math.max(24, e.def.size + 6) : e.def.size;
    const frac = Math.max(0, e.hp / e.def.hp);
    ctx.fillStyle = "#1a1c2c";
    ctx.fillRect(Math.round(e.x - w / 2), Math.round(e.y - e.def.size - 6), w, 2);
    ctx.fillStyle = "#b13e53";
    ctx.fillRect(Math.round(e.x - w / 2), Math.round(e.y - e.def.size - 6), Math.round(w * frac), 2);
  }
};

G.drawPickups = function (ctx) {
  for (const pk of G.state.pickups) {
    const bob = Math.sin(pk.t * 5) * 2;
    const x = Math.round(pk.x), y = Math.round(pk.y - 5 + bob);
    if (pk.t > 9 && Math.floor(pk.t * 8) % 2 === 0) continue; // blink before vanishing
    if (pk.kind === "heart") {
      ctx.fillStyle = "#b13e53";
      ctx.fillRect(x - 3, y - 2, 3, 3);
      ctx.fillRect(x + 1, y - 2, 3, 3);
      ctx.fillRect(x - 2, y, 5, 3);
      ctx.fillRect(x - 1, y + 2, 3, 2);
      ctx.fillStyle = "#f4f4f4";
      ctx.fillRect(x - 2, y - 1, 1, 1);
    } else {
      ctx.fillStyle = "#41a6f6";
      ctx.fillRect(x - 2, y - 1, 5, 4);
      ctx.fillRect(x - 1, y - 3, 3, 8);
      ctx.fillStyle = "#73eff7";
      ctx.fillRect(x - 1, y - 1, 1, 2);
    }
  }
};

G.drawProjectiles = function (ctx) {
  for (const pr of G.state.projectiles) {
    const trail = pr.trail || [];
    ctx.save();
    for (let i = trail.length - 1; i >= 0; i--) {
      const point = trail[i];
      ctx.globalAlpha = 0.12 + (trail.length - i) / Math.max(1, trail.length) * 0.35;
      ctx.fillStyle = pr.color;
      ctx.fillRect(Math.round(point.x), Math.round(point.y - 4), 1, 1);
    }
    ctx.restore();
    ctx.fillStyle = pr.color;
    const s = pr.size;
    ctx.fillRect(Math.round(pr.x - s / 2), Math.round(pr.y - 4 - s / 2), s, s);
    ctx.fillStyle = "rgba(244,244,244,0.75)";
    ctx.fillRect(Math.round(pr.x), Math.round(pr.y - 4), 1, 1);
  }
};
