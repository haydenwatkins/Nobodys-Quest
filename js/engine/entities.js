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
    meleeGuard: 0,             // tiny hit-confirm grace; never granted on a whiff
    damageTaken: 0,            // hearts lost (max hearts comes from the form)
    mana: 6, manaMax: 10,
    manaRegenDelay: 0,
    manaRegenProgress: 0,
    cooldowns: {},             // abilityId -> seconds left
    abilityBuffer: {},         // button -> recent tap waiting on cooldown
    attackPose: null,
    swapCd: 0,
    dashing: null,
    passiveBarrier: 0,
    passiveBarrierT: 0,
    passiveHaste: 0,
    pantryGuard: 0,
    pantryHasteT: 0,
    pantryQuickT: 0,
    pantryMagnetT: 0,
    lastSafe: null,
  };
};

G.playerForm = function () { return G.forms[G.state.formId]; };
G.playerMaxHearts = function () { return G.playerForm().hearts; };
G.playerHp = function () { return Math.max(0, G.playerMaxHearts() - G.state.player.damageTaken); };
G.playerMaxMana = function () {
  return 10 + (G.state && (G.state.items || []).includes("manyfold-crown") ? 2 : 0);
};

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
  if (p.invuln > 0 || p.meleeGuard > 0 || p.dashing) return false;
  if (p.pantryGuard > 0) {
    p.pantryGuard--;
    p.invuln = Math.max(p.invuln, 0.3);
    G.sfx.play("stagger");
    G.damageNumber(p.x, p.y - 18, "WARDCAKE!", "#ffcd75");
    G.spawnFx({ kind: "ring", x: p.x, y: p.y - 7, color: "#ffcd75", radius: 16, dur: 0.34 });
    return false;
  }
  const passiveResult = G.passives
    ? G.passives.beforePlayerDamage(dmg, fromX, fromY)
    : { damage: dmg, knockback: true, prevented: false };
  if (passiveResult.prevented) return false;
  dmg = passiveResult.damage;
  p.damageTaken += dmg;
  p.invuln = 1.0;
  G.sfx.play("hurt");
  G.state.shake = 0.25;
  // knock the player back a bit
  if (fromX !== undefined && passiveResult.knockback) {
    const a = G.util.angleTo(fromX, fromY, p.x, p.y);
    G.world.moveBox(p, Math.cos(a) * 10, Math.sin(a) * 10);
  }
  if (G.playerHp() <= 0) {
    const run = G.state.gauntletRun;
    if (run && (G.state.items || []).includes("manyfold-crown") && !run.crownRescueUsed) {
      run.crownRescueUsed = true;
      p.damageTaken = Math.max(0, G.playerMaxHearts() - 1);
      p.invuln = 2;
      p.dashing = null;
      G.state.projectiles = [];
      G.sfx.play("unlock");
      G.spawnFx({ kind: "ring", x: p.x, y: p.y - 8, color: "#ffcd75", radius: 30, dur: 0.65 });
      G.ui.banner("👑 CROWN'S SECOND WIND", "Back on your feet with one heart. It recharges next run.");
      return;
    }
    G.sfx.play("ko");
    const trial = G.state.mapDef && G.state.mapDef.bossTrial;
    if (trial) {
      const bossEnemy = G.state.enemies.find((enemy) => enemy.def.miniboss && !enemy.dead);
      const bossName = bossEnemy ? bossEnemy.def.name : "The guardian";
      const bossLine = bossEnemy && bossEnemy.def.boss && bossEnemy.def.boss.knockoutLine;
      p.dashing = null;
      p.invuln = 3;
      G.state.projectiles = [];
      G.state.bossHazards = [];
      G.state.bossCutscene = null;
      G.state.knockout = {
        t: trial.delay || 1.5,
        exit: trial.exit,
        bossName,
      };
      G.ui.banner("💫 TRIAL LOST", bossLine || `${bossName} sends you back outside. Breathe, then try again.`);
      G.events.emit("ko", { trial: G.state.mapId, boss: bossEnemy && bossEnemy.id });
      return;
    }
    // Ordinary knockouts stay gentle: return to the map entrance, fully healed.
    p.damageTaken = 0;
    p.invuln = 2;
    p.x = G.state.entryPoint.x;
    p.y = G.state.entryPoint.y;
    G.ui.toast("💫 You got knocked out! ...But you're okay. Try again!", 3);
    G.events.emit("ko", {});
  }
  return true;
};

G.updateKnockout = function (dt) {
  const ko = G.state.knockout;
  if (!ko) return false;
  ko.t -= dt;
  if (ko.t > 0) return true;

  const p = G.state.player;
  const exit = ko.exit;
  p.damageTaken = 0;
  p.invuln = 1;
  p.dashing = null;
  p.mana = Math.max(G.MANA_RESERVE, p.mana);
  p.manaRegenDelay = 0;
  p.manaRegenProgress = 0;
  p.cooldowns = {};
  G.state.knockout = null;
  G.world.load(exit.map, { x: exit.x, y: exit.y });
  G.ui.toast(`⚔ ${ko.bossName} is back at full strength.`, 2.5);
  G.saveGame();
  return false;
};

G.updatePlayer = function (dt) {
  const p = G.state.player;
  const form = G.playerForm();

  p.manaMax = G.playerMaxMana();
  p.mana = Math.min(p.mana, p.manaMax);

  p.invuln = Math.max(0, p.invuln - dt);
  p.meleeGuard = Math.max(0, (p.meleeGuard || 0) - dt);
  p.swapCd = Math.max(0, p.swapCd - dt);
  p.pantryHasteT = Math.max(0, (p.pantryHasteT || 0) - dt);
  p.pantryQuickT = Math.max(0, (p.pantryQuickT || 0) - dt);
  p.pantryMagnetT = Math.max(0, (p.pantryMagnetT || 0) - dt);
  if (G.passives) G.passives.update(dt);
  if (p.attackPose) {
    p.attackPose.t -= dt;
    if (p.attackPose.t <= 0) p.attackPose = null;
  }
  const cooldownRate = p.pantryQuickT > 0 ? 1.35 : 1;
  for (const k in p.cooldowns) p.cooldowns[k] = Math.max(0, p.cooldowns[k] - dt * cooldownRate);

  // Mana now regenerates all the way to the true maximum. Successful hits
  // remain a faster bonus route, rewarding close engagement without making
  // any high-cost move depend on farming basic attacks.
  p.manaRegenDelay = Math.max(0, (p.manaRegenDelay || 0) - dt);
  if (p.mana < p.manaMax && p.manaRegenDelay <= 0) {
    p.manaRegenProgress = (p.manaRegenProgress || 0) + dt;
    while (p.manaRegenProgress >= G.MANA_REGEN_SECONDS && p.mana < p.manaMax) {
      p.manaRegenProgress -= G.MANA_REGEN_SECONDS;
      p.mana = Math.min(p.manaMax, p.mana + 1);
    }
  } else if (p.mana >= p.manaMax) {
    p.manaRegenProgress = 0;
  }

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
    if (d.left <= 0 || stuck) {
      p.dashing = null;
      G.combat.finishDash(p, d);
    }
  } else {
    /* --- normal movement --- */
    const v = G.input.vec;
    p.moving = v.x !== 0 || v.y !== 0;
    if (p.moving) {
      p.dir = { x: v.x, y: v.y };
      const pantrySpeed = p.pantryHasteT > 0 ? 1.18 : 1;
      const spd = form.speed * (G.passives ? G.passives.movementScale(p) : 1) * pantrySpeed;
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
      G.ui.toast("💧 Mana is recharging — land hits to fill it even faster!", 1.8);
      delete p.abilityBuffer[button];
      continue;
    }
    delete p.abilityBuffer[button];
    p.mana -= ab.mana;
    if (ab.mana > 0) {
      p.manaRegenDelay = G.MANA_CAST_DELAY;
      p.manaRegenProgress = 0;
    }
    p.cooldowns[abilityId] = ab.cooldown;
    ab.use(p);
    if (G.passives) G.passives.onAbilityUse(p, abilityId);
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
    bossEngaged: false,
    bossIntroT: 0,
    bossPhase: 1,
    bossSpecialT: def.boss ? def.boss.specialEvery : 0,
    bossTelegraphT: 0,
    bossChargeT: 0,
    bossRecoverT: 0,
    bossStrafeDir: Math.random() < 0.5 ? -1 : 1,
    bossStrafeT: 1 + Math.random(),
    bossPattern: 0,
    bossPendingAction: null,
    bossAfterCharge: null,
    bossStagger: 0,
    bossStaggerT: 0,
    bossStaggerResistT: 0,
    bossStaggerDecayT: 0,
    touchCd: 0,
    kbx: 0, kby: 0,
    hitKickX: 0, hitKickY: 0,
    flash: 0,
    dead: false,
    status: null,
    h() { return this.def.size; },
  };
};

function bossBurst(e, color, count) {
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count;
    G.spawnFx({
      kind: "spark", x: e.x, y: e.y - e.def.size / 2,
      vx: Math.cos(a) * (24 + (i % 3) * 8),
      vy: Math.sin(a) * (24 + (i % 3) * 8),
      color, dur: 0.45,
    });
  }
}

function engageBoss(e) {
  e.bossEngaged = true;
  const boss = e.def.boss;
  const rematch = (G.state.items || []).includes(e.def.trophy);
  const lines = boss.introLines && boss.introLines.length ? boss.introLines : [boss.intro];
  e.bossIntroT = rematch ? 0.35 : Math.max(G.BOSS_CUTSCENE_LINE_SECONDS, lines.length * G.BOSS_CUTSCENE_LINE_SECONDS);
  e.shootT = Math.max(e.shootT, e.bossIntroT + 0.35);
  G.state.hitStop = Math.max(G.state.hitStop || 0, rematch ? 0.03 : 0.08);
  G.state.shake = Math.max(G.state.shake, rematch ? 0.16 : 0.38);
  G.sfx.play("bossIntro");
  G.spawnFx({ kind: "ring", x: e.x, y: e.y - 7, color: boss.color, radius: 22, dur: 0.65 });
  G.spawnFx({ kind: "ring", x: e.x, y: e.y - 7, color: "#ffcd75", radius: 13, dur: 0.4 });
  bossBurst(e, boss.color, rematch ? 8 : 16);
  if (rematch) {
    G.ui.toast(`⚔ ${boss.rematchLine || e.def.name + " returns!"}`, 2);
  } else {
    const ward = e.ward && G.DAMAGE_TYPES[e.ward.types[0]];
    const wardText = ward ? ` · ${ward.icon} ${ward.name.toUpperCase()} breaks its ward` : "";
    G.state.bossCutscene = {
      enemy: e,
      lines,
      index: 0,
      lineT: G.BOSS_CUTSCENE_LINE_SECONDS,
      elapsed: 0,
      wardText,
    };
    G.ui.banner(`⚔ ${e.def.name.toUpperCase()} ⚔`, `${lines[0]}${wardText}`);
  }
}

G.updateBossCutscene = function (dt) {
  const scene = G.state.bossCutscene;
  if (!scene) return;
  const e = scene.enemy;
  scene.elapsed += dt;
  scene.lineT -= dt;
  e.bossIntroT = Math.max(0, e.bossIntroT - dt);

  const advance = scene.elapsed > 0.35 && ["a", "b", "c", "pause"].some((button) => G.input.tapped(button));
  const nextLine = advance || scene.lineT <= 0;
  if (nextLine && scene.index < scene.lines.length - 1) {
    scene.index++;
    scene.lineT = G.BOSS_CUTSCENE_LINE_SECONDS;
    scene.elapsed = 0;
    G.sfx.play("bossPhase");
    G.ui.banner(`⚔ ${e.def.name.toUpperCase()} ⚔`, scene.lines[scene.index]);
    G.state.shake = Math.max(G.state.shake, 0.16);
    G.spawnFx({ kind: "ring", x: e.x, y: e.y - 7, color: e.def.boss.color, radius: 18, dur: 0.38 });
    G.input.clearTaps();
    return;
  }
  if ((advance && scene.index === scene.lines.length - 1) || e.bossIntroT <= 0) {
    e.bossIntroT = 0;
    G.state.bossCutscene = null;
    G.state.shake = Math.max(G.state.shake, 0.22);
    G.input.clearTaps();
  }
};

function fireRiftbladeVolley(e, p) {
  const a = G.util.angleTo(e.x, e.y, p.x, p.y);
  const spreads = e.bossPhase >= 3 ? [-28, -14, 0, 14, 28]
    : e.bossPhase === 2 ? [-22, 0, 22] : [-13, 13];
  for (const spread of spreads) {
    enemyShot(G.state, e, a + spread * Math.PI / 180, {
      damage: 1, speed: 120, range: 205, size: 5,
      boomerang: true, outboundRange: 82, shape: "riftBlade",
    });
  }
  G.spawnFx({ kind: "ring", x: e.x, y: e.y - 6, color: e.def.boss.color, radius: 20, dur: 0.3 });
}

function fireBossFan(e, p, count, shape, size, damage) {
  const a = G.util.angleTo(e.x, e.y, p.x, p.y);
  const middle = (count - 1) / 2;
  for (let i = 0; i < count; i++) {
    enemyShot(G.state, e, a + (i - middle) * 14 * Math.PI / 180, {
      damage: damage || 1, speed: 105, range: 175, size: size || 4, shape,
    });
  }
}

function fireBossRadial(e, count, speed, shape, offset) {
  for (let i = 0; i < count; i++) {
    enemyShot(G.state, e, (i / count) * Math.PI * 2 + (offset || 0), {
      damage: 1, speed: speed || 78, range: 155, size: 4, shape,
    });
  }
  G.spawnFx({ kind: "ring", x: e.x, y: e.y - 6, color: e.def.boss.color, radius: 28, dur: 0.32 });
}

/* ---------- Worldbearer arena control ----------
   These patterns make distance a positioning puzzle instead of solving it by
   adding damage or invisible speed. Every dangerous cell gets a generous
   warning, every pattern has stable geometry, and melee stagger clears the
   arena so closing the gap remains the strongest counterplay. */

const BOSS_ARENA_ACTIONS = {
  gustLanes: "GUST LANES",
  windWall: "CROSSWIND",
  faultGrid: "FAULT GRID",
  collapseRing: "CLOSING TERRACE",
  silkTether: "SILK TETHER",
  webGrid: "LOOM GRID",
  stormGrid: "STORM GRID",
  echoCross: "ECHO CROSS",
  safeCircle: "LANTERN CIRCLE",
  worldGrid: "WORLD GRID",
};

function arenaBounds() {
  return {
    left: G.TILE * 1.5,
    top: G.TILE * 1.5,
    right: (G.state.mapW - 1.5) * G.TILE,
    bottom: (G.state.mapH - 1.5) * G.TILE,
  };
}

function spawnBossHazard(e, kind, options) {
  const h = Object.assign({
    kind, owner: e, mapId: G.state.mapId, t: 0, delay: 0,
    warning: 0.82, active: 0.62, color: e.def.boss.color,
    phase: e.bossPhase, hit: false,
  }, options || {});
  G.state.bossHazards = G.state.bossHazards || [];
  G.state.bossHazards.push(h);
  return h;
}

G.cancelBossHazards = function (owner) {
  if (!G.state.bossHazards) return;
  G.state.bossHazards = G.state.bossHazards.filter((h) => owner && h.owner !== owner);
};

function hazardLocalTime(h) { return h.t - (h.delay || 0); }
function hazardIsActive(h) {
  const t = hazardLocalTime(h);
  return t >= h.warning && t < h.warning + h.active;
}

function gridCellDanger(h, x, y) {
  const b = arenaBounds();
  const cell = h.cell || 40;
  const gx = Math.floor((x - b.left) / cell);
  const gy = Math.floor((y - b.top) / cell);
  if (h.grid === "checker") return ((gx + gy) & 1) === h.parity;
  return ((h.axis === "y" ? gy : gx) & 1) === h.parity;
}

function gustLaneDanger(h, x, y) {
  const b = arenaBounds();
  const lanes = h.lanes || 5;
  const span = h.axis === "y" ? b.right - b.left : b.bottom - b.top;
  const at = h.axis === "y" ? x - b.left : y - b.top;
  const lane = Math.max(0, Math.min(lanes - 1, Math.floor(at / (span / lanes))));
  return lane !== h.safeLane;
}

G.updateBossHazards = function (dt) {
  const hazards = G.state.bossHazards || (G.state.bossHazards = []);
  const p = G.state.player;
  for (let i = hazards.length - 1; i >= 0; i--) {
    const h = hazards[i];
    h.t += dt;
    if (h.mapId !== G.state.mapId || !h.owner || h.owner.dead
      || h.t >= (h.delay || 0) + h.warning + h.active) {
      hazards.splice(i, 1);
      continue;
    }
    if (!hazardIsActive(h) || G.state.knockout) continue;

    if (h.kind === "gust") {
      if (!p.dashing && gustLaneDanger(h, p.x, p.y)) {
        const a = G.util.angleTo(p.x, p.y, h.owner.x, h.owner.y);
        const speed = h.push || 58;
        G.world.moveBox(p, Math.cos(a) * speed * dt, Math.sin(a) * speed * dt);
        punishBossHazard(h);
      }
      continue;
    }

    if (h.kind === "tether") {
      const d = G.util.dist(p.x, p.y, h.owner.x, h.owner.y);
      if (!p.dashing && d > h.maxRange) {
        const a = G.util.angleTo(p.x, p.y, h.owner.x, h.owner.y);
        const speed = Math.min(92, (h.pull || 54) + (d - h.maxRange) * 0.45);
        G.world.moveBox(p, Math.cos(a) * speed * dt, Math.sin(a) * speed * dt);
        punishBossHazard(h);
      }
      continue;
    }

    let danger = false;
    if (h.kind === "grid") danger = gridCellDanger(h, p.x, p.y);
    if (h.kind === "ring") danger = G.util.dist(p.x, p.y, h.x, h.y) > h.radius;
    if (!danger) continue;

    if (h.kind === "ring" && !p.dashing) {
      const a = G.util.angleTo(p.x, p.y, h.x, h.y);
      G.world.moveBox(p, Math.cos(a) * 44 * dt, Math.sin(a) * 44 * dt);
    }
    punishBossHazard(h);
  }
};

function punishBossHazard(h) {
  if (h.hit || !h.owner || h.owner.dead) return false;
  if (!G.damagePlayer(1, h.owner.x, h.owner.y)) return false;
  h.hit = true;
  const recovery = h.phase >= 3 ? 3 : 2;
  const healed = Math.min(recovery, Math.max(0, h.owner.def.hp - h.owner.hp));
  if (healed > 0) {
    h.owner.hp += healed;
    G.damageNumber(h.owner.x, h.owner.y - h.owner.h() - 4, `+${healed} MEND`, "#a7f070");
  }
  h.owner.bossStagger = Math.max(0, (h.owner.bossStagger || 0) - 1);
  G.damageNumber(G.state.player.x, G.state.player.y - 18, "FALTER!", "#ef7d57");
  return true;
}

G.drawBossHazards = function (ctx) {
  const hazards = G.state.bossHazards || [];
  const b = arenaBounds();
  for (const h of hazards) {
    const local = hazardLocalTime(h);
    if (local < 0) continue;
    const active = hazardIsActive(h);
    const pulse = 0.5 + Math.sin((G.state.time || 0) * 12) * 0.5;
    ctx.save();
    ctx.beginPath();
    ctx.rect(b.left, b.top, b.right - b.left, b.bottom - b.top);
    ctx.clip();
    ctx.fillStyle = h.color;
    ctx.strokeStyle = active ? "#f4f4f4" : h.color;
    ctx.lineWidth = active ? 2 : 1;
    ctx.globalAlpha = active ? 0.24 + pulse * 0.1 : 0.08 + pulse * 0.08;

    if (h.kind === "grid") {
      const cell = h.cell || 40;
      for (let y = b.top; y < b.bottom; y += cell) {
        for (let x = b.left; x < b.right; x += cell) {
          if (!gridCellDanger(h, x + 1, y + 1)) continue;
          ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(cell), Math.ceil(cell));
          ctx.strokeRect(Math.round(x) + 1, Math.round(y) + 1, Math.ceil(cell) - 2, Math.ceil(cell) - 2);
          if (active) {
            // A tiny stepped bolt reads at the native 320x180 resolution and
            // distinguishes an electric/fault cell from ordinary decoration.
            ctx.globalAlpha = 0.9;
            ctx.strokeStyle = "#f4f4f4";
            ctx.beginPath();
            ctx.moveTo(Math.round(x + cell * 0.2), Math.round(y + cell * 0.5));
            ctx.lineTo(Math.round(x + cell * 0.42), Math.round(y + cell * 0.35));
            ctx.lineTo(Math.round(x + cell * 0.55), Math.round(y + cell * 0.64));
            ctx.lineTo(Math.round(x + cell * 0.8), Math.round(y + cell * 0.46));
            ctx.stroke();
            ctx.strokeStyle = active ? "#f4f4f4" : h.color;
            ctx.globalAlpha = 0.24 + pulse * 0.1;
          }
        }
      }
    } else if (h.kind === "gust") {
      const lanes = h.lanes || 5;
      const horizontal = h.axis === "x";
      const span = horizontal ? b.bottom - b.top : b.right - b.left;
      const laneSize = span / lanes;
      for (let lane = 0; lane < lanes; lane++) {
        if (lane === h.safeLane) continue;
        const x = horizontal ? b.left : b.left + lane * laneSize;
        const y = horizontal ? b.top + lane * laneSize : b.top;
        const w = horizontal ? b.right - b.left : laneSize;
        const height = horizontal ? laneSize : b.bottom - b.top;
        ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(height));
        const arrowX = horizontal ? (b.left + b.right) / 2 : x + laneSize / 2;
        const arrowY = horizontal ? y + laneSize / 2 : (b.top + b.bottom) / 2;
        ctx.globalAlpha = active ? 0.8 : 0.35;
        const towardX = h.owner.x - arrowX;
        const towardY = h.owner.y - arrowY;
        const mag = Math.max(1, Math.hypot(towardX, towardY));
        const dx = towardX / mag, dy = towardY / mag;
        ctx.beginPath();
        ctx.moveTo(arrowX - dx * 7, arrowY - dy * 7);
        ctx.lineTo(arrowX + dx * 7, arrowY + dy * 7);
        ctx.lineTo(arrowX + dx * 3 - dy * 3, arrowY + dy * 3 + dx * 3);
        ctx.moveTo(arrowX + dx * 7, arrowY + dy * 7);
        ctx.lineTo(arrowX + dx * 3 + dy * 3, arrowY + dy * 3 - dx * 3);
        ctx.stroke();
        ctx.globalAlpha = active ? 0.24 + pulse * 0.1 : 0.08 + pulse * 0.08;
      }
    } else if (h.kind === "ring") {
      // Shade precisely outside the safe circle. The even-odd cutout keeps the
      // picture identical to the collision test, including the four corners.
      ctx.beginPath();
      ctx.rect(b.left, b.top, b.right - b.left, b.bottom - b.top);
      ctx.moveTo(h.x + h.radius, h.y);
      ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
      ctx.fill("evenodd");
      ctx.globalAlpha = active ? 0.9 : 0.55;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (h.kind === "tether") {
      ctx.globalAlpha = active ? 0.9 : 0.45;
      ctx.setLineDash(active ? [4, 2] : [2, 3]);
      ctx.beginPath();
      ctx.moveTo(h.owner.x, h.owner.y - 6);
      ctx.lineTo(G.state.player.x, G.state.player.y - 5);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(h.owner.x, h.owner.y, h.maxRange, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
};

function spawnArenaPattern(e, action) {
  const phase = e.bossPhase;
  const turn = e.bossPattern;
  if (action === "gustLanes" || action === "windWall") {
    const axis = action === "windWall" ? (turn & 1 ? "y" : "x") : (turn & 1 ? "x" : "y");
    spawnBossHazard(e, "gust", {
      axis, lanes: phase >= 3 ? 6 : 5, safeLane: (turn * 2 + phase) % (phase >= 3 ? 6 : 5),
      warning: action === "windWall" ? 0.68 : 0.82, active: phase >= 3 ? 1.1 : 0.92,
      push: action === "windWall" ? 72 : 60, color: "#73eff7",
    });
  }
  if (action === "faultGrid" || action === "webGrid" || action === "worldGrid") {
    const colors = { faultGrid: "#ffcd75", webGrid: "#d9a7ff", worldGrid: "#ef7d57" };
    spawnBossHazard(e, "grid", {
      grid: "checker", parity: turn & 1, cell: phase >= 3 ? 32 : 40,
      warning: 0.88, active: 0.6, color: colors[action],
    });
    if (action === "worldGrid" && phase >= 3) {
      spawnBossHazard(e, "grid", {
        grid: "checker", parity: (turn + 1) & 1, cell: 32,
        delay: 0.78, warning: 0.62, active: 0.48, color: "#ffcd75",
      });
    }
  }
  if (action === "stormGrid" || action === "echoCross") {
    const firstAxis = turn & 1 ? "x" : "y";
    spawnBossHazard(e, "grid", {
      axis: firstAxis, parity: turn & 1, cell: phase >= 2 ? 32 : 40,
      warning: 0.9, active: 0.5, color: action === "echoCross" ? "#fff3c2" : "#73eff7",
    });
    if (phase >= 2 || action === "echoCross") {
      spawnBossHazard(e, "grid", {
        axis: firstAxis === "x" ? "y" : "x", parity: (turn + 1) & 1, cell: phase >= 2 ? 32 : 40,
        delay: 0.72, warning: 0.66, active: 0.48, color: action === "echoCross" ? "#ffcd75" : "#fff3c2",
      });
    }
  }
  if (action === "collapseRing" || action === "safeCircle") {
    const radius = action === "safeCircle"
      ? (phase >= 3 ? 64 : phase === 2 ? 76 : 90)
      : (phase >= 3 ? 68 : phase === 2 ? 82 : 98);
    spawnBossHazard(e, "ring", {
      x: e.x, y: e.y, radius, warning: 0.92, active: 0.92,
      color: action === "safeCircle" ? "#ffcd75" : "#d8b06a",
    });
  }
  if (action === "silkTether") {
    spawnBossHazard(e, "tether", {
      maxRange: phase >= 3 ? 70 : phase === 2 ? 78 : 88,
      warning: 0.68, active: 1.45, pull: 58, color: "#d9a7ff",
    });
  }
}

function resolveBossAction(e, p, action) {
  if (["charge", "burrow", "vampireDash"].includes(action)) {
    e.bossChargeT = e.def.boss.chargeDur;
    e.bossAfterCharge = action === "burrow" ? "quake" : action === "vampireDash" ? "bloodBurst" : null;
    return;
  }
  if (action === "blades") fireRiftbladeVolley(e, p);
  if (action === "cards") fireBossFan(e, p, e.bossPhase >= 3 ? 7 : e.bossPhase === 2 ? 5 : 3, "card", 5, 1);
  if (action === "pie") fireBossFan(e, p, 1, "pie", 8, 2);
  if (action === "quake") fireBossRadial(e, e.bossPhase >= 3 ? 16 : e.bossPhase === 2 ? 12 : 8, 74, "fault");
  if (action === "bloodBurst") fireBossRadial(e, e.bossPhase >= 3 ? 16 : e.bossPhase === 2 ? 12 : 8, 92, null);
  if (action === "nova") fireBossRadial(e, e.bossPhase >= 3 ? 20 : e.bossPhase === 2 ? 16 : 12, 82, null);
  if (action === "shells") fireBossRadial(e, e.bossPhase >= 3 ? 16 : e.bossPhase === 2 ? 12 : 8, 68, "shell", e.bossPattern * 0.17);
  if (action === "crescent") fireBossFan(e, p, e.bossPhase >= 3 ? 7 : 5, "riftBlade", 6, 1);
  if (action === "stars") fireBossRadial(e, e.bossPhase >= 3 ? 18 : e.bossPhase === 2 ? 12 : 6, 104, "star", e.bossPattern * 0.23);
  if (action === "orbit") {
    fireBossRadial(e, e.bossPhase >= 3 ? 12 : 8, 58, "star", e.bossPattern * 0.31);
    fireBossFan(e, p, e.bossPhase >= 3 ? 5 : 3, "star", 5, 1);
  }
  if (action === "seeds") fireBossFan(e, p, e.bossPhase >= 3 ? 7 : e.bossPhase === 2 ? 5 : 3, "seed", 6, 1);
  if (action === "briar") fireBossRadial(e, e.bossPhase >= 3 ? 18 : e.bossPhase === 2 ? 14 : 10, 76, "seed", e.bossPattern * 0.19);
  if (BOSS_ARENA_ACTIONS[action]) spawnArenaPattern(e, action);
  e.bossRecoverT = BOSS_ARENA_ACTIONS[action] ? 0.52 : 0.34;
}

function updateBossState(e, p, dist, dt) {
  const boss = e.def.boss;
  const aggro = e.def.aggro || 120;
  if (!e.bossEngaged) {
    if (dist < aggro) engageBoss(e);
    else return false;
  }

  if (e.bossIntroT > 0) {
    e.bossIntroT = Math.max(0, e.bossIntroT - dt);
    return true;
  }

  const maxPhase = boss.phases || 2;
  const nextPhase = e.bossPhase + 1;
  const thresholds = boss.phaseThresholds || [0.5];
  const nextThreshold = thresholds[e.bossPhase - 1];
  if (e.bossPhase < maxPhase && e.hp <= e.def.hp * nextThreshold) {
    e.bossPhase = nextPhase;
    // Phase changes always get their dramatic beat; a nearly full stagger
    // meter cannot cancel the boss's introduction to its next pattern set.
    e.bossStagger = 0;
    e.bossStaggerT = 0;
    e.bossStaggerDecayT = 0;
    e.bossStaggerResistT = Math.max(e.bossStaggerResistT || 0, 1.4);
    e.bossRecoverT = 0.55;
    e.bossSpecialT = Math.min(e.bossSpecialT, 0.8);
    G.cancelBossHazards(e);
    G.state.hitStop = Math.max(G.state.hitStop || 0, 0.055);
    G.state.shake = Math.max(G.state.shake, 0.3);
    G.sfx.play("bossPhase");
    G.spawnFx({ kind: "ring", x: e.x, y: e.y - 7, color: boss.color, radius: 30, dur: 0.55 });
    bossBurst(e, boss.color, 14);
    const phaseText = nextPhase === 2 ? boss.phaseLine : boss.phaseThreeLine;
    G.ui.banner(`${e.def.name} — PHASE ${nextPhase === 2 ? "II" : "III"}`, phaseText || "The fight changes. Watch its movement!");
    return true;
  }

  if (e.bossStaggerT > 0) {
    e.bossStaggerT = Math.max(0, e.bossStaggerT - dt);
    return true;
  }
  e.bossStaggerResistT = Math.max(0, (e.bossStaggerResistT || 0) - dt);
  if (e.bossStaggerResistT <= 0 && e.bossStagger > 0) {
    e.bossStaggerDecayT = Math.max(0, (e.bossStaggerDecayT || 0) - dt);
    if (e.bossStaggerDecayT <= 0) e.bossStagger = Math.max(0, e.bossStagger - dt * 0.45);
  }

  if (e.bossTelegraphT > 0) {
    e.bossTelegraphT -= dt;
    if (e.bossTelegraphT <= 0) {
      resolveBossAction(e, p, e.bossPendingAction);
      e.bossPendingAction = null;
    }
    return true;
  }

  if (e.bossChargeT > 0) {
    // A boss's body is only dangerous during a clearly telegraphed charge.
    // This flag is reset every frame so recovery and ordinary movement remain
    // safe for close-range forms.
    e.bossContactActive = true;
    const step = boss.chargeSpeed * dt;
    G.world.moveBox(e, e.bossChargeX * step, e.bossChargeY * step);
    e.dir = { x: e.bossChargeX, y: e.bossChargeY };
    e.bossChargeT -= dt;
    G.spawnFx({ kind: "puff", x: e.x, y: e.y - 5, color: boss.color, dur: 0.16 });
    if (e.bossChargeT <= 0) {
      if (e.bossAfterCharge) resolveBossAction(e, p, e.bossAfterCharge);
      e.bossAfterCharge = null;
      e.bossRecoverT = Math.max(e.bossRecoverT, boss.style === "charger" ? 0.55 : 0.38);
    }
    return true;
  }

  if (e.bossRecoverT > 0) {
    e.bossRecoverT = Math.max(0, e.bossRecoverT - dt);
    return true;
  }

  if (boss.patterns || boss.style === "charger" || boss.style === "duelist" || boss.style === "riftblade") {
    e.bossSpecialT -= dt;
    if (e.bossSpecialT <= 0) {
      const a = G.util.angleTo(e.x, e.y, p.x, p.y);
      e.bossChargeX = Math.cos(a);
      e.bossChargeY = Math.sin(a);
      e.bossTelegraphT = boss.telegraph;
      e.bossSpecialT = boss.specialEvery * Math.max(0.78, 1 - (e.bossPhase - 1) * 0.11);
      G.sfx.play("bossPhase");
      G.spawnFx({ kind: "ring", x: e.x, y: e.y - 6, color: boss.color, radius: 18, dur: boss.telegraph });
      const fallback = boss.style === "riftblade" ? ["charge", "blades"] : ["charge"];
      const patterns = boss.patterns || fallback;
      e.bossPendingAction = patterns[e.bossPattern % patterns.length];
      e.bossPattern++;
      if (BOSS_ARENA_ACTIONS[e.bossPendingAction]) {
        G.damageNumber(e.x, e.y - e.h() - 11, BOSS_ARENA_ACTIONS[e.bossPendingAction], boss.color);
      }
      if (["charge", "burrow", "vampireDash"].includes(e.bossPendingAction)) {
        G.spawnFx({
          kind: "tell", x: e.x, y: e.y - 5,
          x2: e.x + e.bossChargeX * 44, y2: e.y - 5 + e.bossChargeY * 44,
          color: boss.color, dur: boss.telegraph,
        });
      }
      return true;
    }
  }
  return false;
}

function bossMoveVector(e, p, dist, dt) {
  const boss = e.def.boss;
  const a = G.util.angleTo(e.x, e.y, p.x, p.y);
  const phaseSpeed = e.bossPhase >= 3 ? 1.28 : e.bossPhase === 2 ? 1.14 : 1;
  if (boss.antiKiteRange && dist > boss.antiKiteRange) {
    return {
      x: Math.cos(a), y: Math.sin(a),
      scale: phaseSpeed * (boss.chaseScale || 1),
    };
  }
  if (boss.style === "caster" || boss.style === "jester") {
    e.bossStrafeT -= dt;
    if (e.bossStrafeT <= 0) {
      e.bossStrafeT = 1.1 + Math.random() * 0.8;
      e.bossStrafeDir *= -1;
    }
    if (dist > 100) return { x: Math.cos(a) * 0.8, y: Math.sin(a) * 0.8, scale: phaseSpeed };
    if (dist < 55) return { x: -Math.cos(a) * 0.85, y: -Math.sin(a) * 0.85, scale: phaseSpeed };
    return { x: -Math.sin(a) * 0.72 * e.bossStrafeDir, y: Math.cos(a) * 0.72 * e.bossStrafeDir, scale: phaseSpeed };
  }
  if (["duelist", "riftblade", "vampire", "god"].includes(boss.style) && dist < 50) {
    return {
      x: Math.cos(a) * 0.2 - Math.sin(a) * 0.75 * e.bossStrafeDir,
      y: Math.sin(a) * 0.2 + Math.cos(a) * 0.75 * e.bossStrafeDir,
      scale: phaseSpeed,
    };
  }
  return { x: Math.cos(a), y: Math.sin(a), scale: phaseSpeed };
}

function enemyShot(state, enemy, angle, opts) {
  state.projectiles.push({
    x: enemy.x, y: enemy.y - 6,
    vx: Math.cos(angle) * (opts.speed || 90),
    vy: Math.sin(angle) * (opts.speed || 90),
    damage: opts.damage, size: opts.size || 3,
    color: enemy.def.shotColor || (enemy.def.boss && enemy.def.boss.color) || "#b13e53",
    startX: enemy.x, startY: enemy.y, range: opts.range || 140,
    speed: opts.speed || 90,
    boomerang: !!opts.boomerang,
    returning: false,
    owner: opts.boomerang ? enemy : null,
    outboundRange: opts.outboundRange || 70,
    travel: 0,
    shape: opts.shape,
    fromPlayer: false,
    // Give melee-range players a readable instant before a boss shot becomes
    // dangerous. Ordinary enemy shots retain their existing timing.
    armT: enemy.def.miniboss ? G.BOSS_PROJECTILE_ARM_SECONDS : 0,
  });
}

G.updateEnemies = function (dt) {
  const s = G.state;
  const p = s.player;

  G.updateBossHazards(dt);

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
    e.bossContactActive = false;
    const bossLocked = e.def.miniboss ? updateBossState(e, p, d, dt) : false;

    if (!stunned && !bossLocked) {
      const beh = e.def.behavior || "wander";
      let mx = 0, my = 0;
      let moveScale = 1;

      if (e.def.miniboss && e.bossEngaged && d < (e.def.aggro || 120)) {
        const move = bossMoveVector(e, p, d, dt);
        mx = move.x; my = move.y; moveScale = move.scale;
      } else if (beh === "chase" && d < (e.def.aggro || 80)) {
        const a = G.util.angleTo(e.x, e.y, p.x, p.y);
        mx = Math.cos(a); my = Math.sin(a);
      } else if (beh === "shooter" && d < (e.def.aggro || 110)) {
        // Normal shooters keep a comfy distance. Boss casters use their
        // dedicated orbit/retreat movement above.
        const a = G.util.angleTo(e.x, e.y, p.x, p.y);
        if (d < 60) { mx = -Math.cos(a); my = -Math.sin(a); }
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

      if (beh === "shooter" && d < (e.def.aggro || 110)) {
        const a = G.util.angleTo(e.x, e.y, p.x, p.y);
        e.shootT -= dt;
        if (e.shootT <= 0) {
          e.shootT = e.def.shootEvery || 1.6;
          if (e.def.miniboss && e.bossPhase >= 2) {
            // A wider-looking second phase without a damage spike: player
            // invulnerability means the fan still lands at most one 1-damage hit.
            const spreads = e.bossPhase >= 3 ? [-28, -14, 0, 14, 28] : [-20, 0, 20];
            for (const spread of spreads) {
              enemyShot(s, e, a + spread * Math.PI / 180, { damage: 1, speed: 100, range: 150 });
            }
          } else {
            enemyShot(s, e, a, { damage: e.def.damage || 1, speed: 90, range: 140 });
          }
        }
      }

      if (mx || my) {
        e.dir = { x: mx, y: my };
        G.world.moveBox(e, mx * e.def.speed * moveScale * dt, my * e.def.speed * moveScale * dt);
      }
    }

    // Normal enemies still bonk on contact. Boss bodies are safe to engage in
    // melee unless their current, telegraphed action explicitly enables it.
    // Recompute after movement so a charge collision uses its current position.
    const contactDist = G.util.dist(e.x, e.y, p.x, p.y);
    const contactDanger = !e.def.miniboss || e.bossContactActive;
    if (contactDanger && !(e.bossStaggerT > 0) && e.touchCd <= 0 && contactDist < 7 + e.def.size / 2) {
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
    const magnetRange = p.pantryMagnetT > 0 ? 120 : 30;
    if (d < magnetRange) { // magnet!
      const a = G.util.angleTo(pk.x, pk.y, p.x, p.y);
      pk.x += Math.cos(a) * 90 * dt;
      pk.y += Math.sin(a) * 90 * dt;
    }
    if (d < 8) {
      if (pk.kind === "heart") {
        G.healPlayer(1, "heart-pickup");
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
  const left = Math.round(x - w / 2);
  ctx.fillStyle = "rgba(26,28,44,0.18)";
  ctx.fillRect(left - 1, Math.round(y - 3), w + 2, 4);
  ctx.fillStyle = "rgba(26,28,44,0.38)";
  ctx.fillRect(left, Math.round(y - 2), w, 3);
  ctx.fillStyle = "rgba(26,28,44,0.5)";
  ctx.fillRect(left + 2, Math.round(y - 1), Math.max(2, w - 4), 2);
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
  if (p.meleeGuard > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.8, p.meleeGuard / G.MELEE_GUARD_SECONDS);
    ctx.strokeStyle = "#fff3c2";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y - 7, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  G.drawShadow(ctx, p.x, p.y, 10);
  const frame = p.moving || p.dashing ? Math.floor(p.anim) % 2 : 0;
  const poseScale = p.attackPose ? p.attackPose.t / p.attackPose.dur : 0;
  const drawX = p.x + (p.attackPose ? p.attackPose.x * poseScale : 0);
  const gaitLift = p.moving && !p.dashing && Math.floor(p.anim) % 2 ? 1 : 0;
  const drawY = p.y + (p.attackPose ? p.attackPose.y * poseScale : 0) - gaitLift;
  const dressedSprite = G.costumedSprite ? G.costumedSprite(form.sprite) : form.sprite;
  G.drawSprite(ctx, dressedSprite, frame, drawX, drawY, p.dir.x < 0);
  if (G.drawCostumeAccessory) G.drawCostumeAccessory(ctx, p, form, drawX, drawY);

  const items = G.state.items || [];
  if (items.includes("wayfarer-ribbon") && p.moving) {
    const sway = Math.round(Math.sin(G.state.time * 9) * 2);
    ctx.fillStyle = "#73eff7";
    ctx.fillRect(Math.round(p.x - p.dir.x * 7 + sway), Math.round(p.y - 4 - p.dir.y * 5), 2, 2);
  }
  if (items.includes("heroic-halo")) {
    ctx.strokeStyle = "#ffcd75";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(Math.round(p.x), Math.round(p.y - 19), 6, 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (items.includes("manyfold-crown")) {
    const cy = Math.round(p.y - 21);
    ctx.fillStyle = "#ffcd75";
    ctx.fillRect(Math.round(p.x - 5), cy, 3, 3);
    ctx.fillRect(Math.round(p.x - 1), cy - 2, 3, 5);
    ctx.fillRect(Math.round(p.x + 3), cy, 3, 3);
    ctx.fillRect(Math.round(p.x - 5), cy + 3, 11, 2);
  }
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
  if (e.bossStaggerT > 0) {
    ctx.fillStyle = "#fff3c2";
    const a = e.anim * 7;
    for (let i = 0; i < 3; i++) {
      const sa = a + i * Math.PI * 2 / 3;
      ctx.fillRect(Math.round(e.x + Math.cos(sa) * 9), Math.round(e.y - e.def.size - 4 + Math.sin(sa) * 3), 2, 2);
    }
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
    ctx.save();
    ctx.globalAlpha = 0.18 + Math.sin(pk.t * 5) * 0.04;
    ctx.fillStyle = pk.kind === "heart" ? "#ef7d57" : "#73eff7";
    ctx.fillRect(x - 4, y - 4, 9, 9);
    ctx.restore();
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
      const trailSize = i < 2 ? 2 : 1;
      ctx.fillRect(Math.round(point.x - trailSize / 2), Math.round(point.y - 4 - trailSize / 2), trailSize, trailSize);
    }
    ctx.restore();
    if (pr.shape !== "card" && pr.shape !== "pie") {
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = pr.color;
      const glow = Math.max(5, (pr.size || 2) + 4);
      ctx.fillRect(Math.round(pr.x - glow / 2), Math.round(pr.y - 4 - glow / 2), glow, glow);
      ctx.restore();
    }
    ctx.fillStyle = pr.color;
    const s = pr.size;
    if (pr.shape === "riftBlade") {
      const x = Math.round(pr.x), y = Math.round(pr.y - 4);
      ctx.fillRect(x - 3, y, 7, 1);
      ctx.fillRect(x - 1, y - 2, 3, 5);
      ctx.fillStyle = "#f4f4f4";
      ctx.fillRect(x, y, 1, 1);
    } else if (pr.shape === "card") {
      const x = Math.round(pr.x), y = Math.round(pr.y - 4);
      ctx.fillRect(x - 2, y - 3, 5, 7);
      ctx.fillStyle = pr.fromPlayer ? "#b13e53" : "#1a1c2c";
      ctx.fillRect(x, y, 1, 1);
    } else if (pr.shape === "pie") {
      const x = Math.round(pr.x), y = Math.round(pr.y - 4);
      ctx.fillRect(x - 3, y - 2, 7, 4);
      ctx.fillStyle = "#f4f4f4";
      ctx.fillRect(x - 2, y - 1, 5, 2);
    } else if (pr.shape === "fault") {
      const x = Math.round(pr.x), y = Math.round(pr.y - 4);
      ctx.fillRect(x - 4, y - 1, 3, 2);
      ctx.fillRect(x - 1, y - 3, 3, 3);
      ctx.fillRect(x + 2, y - 1, 3, 2);
    } else if (pr.shape === "shell") {
      const x = Math.round(pr.x), y = Math.round(pr.y - 4);
      ctx.fillRect(x - 3, y - 2, 7, 5);
      ctx.fillStyle = "#6b8e3e";
      ctx.fillRect(x - 1, y - 1, 3, 3);
    } else if (pr.shape === "star") {
      const x = Math.round(pr.x), y = Math.round(pr.y - 4);
      ctx.fillRect(x - 3, y, 7, 1);
      ctx.fillRect(x, y - 3, 1, 7);
      ctx.fillRect(x - 1, y - 1, 3, 3);
    } else if (pr.shape === "seed") {
      const x = Math.round(pr.x), y = Math.round(pr.y - 4);
      ctx.fillRect(x - 2, y - 2, 5, 5);
      ctx.fillStyle = "#a7f070";
      ctx.fillRect(x + 1, y - 3, 2, 2);
    } else {
      ctx.fillRect(Math.round(pr.x - s / 2), Math.round(pr.y - 4 - s / 2), s, s);
    }
    ctx.fillStyle = "rgba(244,244,244,0.75)";
    ctx.fillRect(Math.round(pr.x), Math.round(pr.y - 4), 1, 1);
  }
};
