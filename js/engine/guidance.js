/* ============================================================
   INVISIBLE GUIDANCE — the world explains the adventure first.

   Gold marks the active story, blue marks travel, purple teaches form
   changing, and red identifies immediate danger. Guidance begins as a
   quiet physical cue, becomes clearer only when progress stalls, and can
   always be requested without opening a menu.
   ============================================================ */

"use strict";

(function () {
  G.GUIDANCE_COLORS = {
    story: "#ffcd75",
    travel: "#73eff7",
    form: "#d9a7ff",
    danger: "#ef7d57",
    home: "#a7f070",
  };

  G.makeGuidance = function () {
    return {
      bossRetries: {},
      seenSignals: [],
      helpRequests: 0,
    };
  };

  G.normalizeGuidance = function (saved) {
    const guidance = Object.assign(G.makeGuidance(), saved || {});
    if (!guidance.bossRetries || typeof guidance.bossRetries !== "object" || Array.isArray(guidance.bossRetries))
      guidance.bossRetries = {};
    if (!Array.isArray(guidance.seenSignals)) guidance.seenSignals = [];
    guidance.seenSignals = Array.from(new Set(guidance.seenSignals.map(String))).slice(-40);
    guidance.helpRequests = Math.max(0, Number(guidance.helpRequests) || 0);
    return guidance;
  };

  G.ensureGuidance = function () {
    if (!G.state.guidance) G.state.guidance = G.makeGuidance();
    return G.state.guidance;
  };

  const runtime = {
    activeUntil: 0,
    cardUntil: 0,
    target: null,
    targetKey: "",
    path: [],
    recalcAt: 0,
    lastDistance: null,
    stagnantFor: 0,
    autoStage: 0,
    manualCount: 0,
    ward: null,
  };

  function now() {
    return G.state ? Number(G.state.time) || 0 : 0;
  }

  function mapPortalCells(mapId) {
    const def = G.maps && G.maps[mapId];
    if (!def) return [];
    const cells = [];
    for (let y = 0; y < def.tiles.length; y++) for (let x = 0; x < def.tiles[y].length; x++) {
      const cell = def.legend && def.legend[def.tiles[y][x]];
      if (cell && cell.portal) cells.push({ x, y, cell });
    }
    return cells;
  }

  function nextMapToward(start, destination) {
    if (!start || !destination || start === destination) return null;
    const queue = [start];
    const parent = new Map([[start, null]]);
    for (let head = 0; head < queue.length && head < 120; head++) {
      const mapId = queue[head];
      for (const portal of mapPortalCells(mapId)) {
        const next = portal.cell.portal.map;
        if (!next || parent.has(next)) continue;
        parent.set(next, mapId);
        if (next === destination) {
          let step = destination;
          while (parent.get(step) && parent.get(step) !== start) step = parent.get(step);
          return step;
        }
        queue.push(next);
      }
    }
    return null;
  }

  function nearest(list, x, y) {
    let best = null;
    let distance = Infinity;
    for (const item of list) {
      const d = G.util.dist(x, y, item.x, item.y);
      if (d < distance) { best = item; distance = d; }
    }
    return best;
  }

  function gridTargets(predicate) {
    const s = G.state;
    const found = [];
    if (!s || !s.grid) return found;
    for (let y = 0; y < s.mapH; y++) for (let x = 0; x < s.mapW; x++) {
      const cell = s.grid[y] && s.grid[y][x];
      if (cell && predicate(cell, x, y)) found.push({
        x: x * G.TILE + G.TILE / 2,
        y: y * G.TILE + G.TILE / 2,
        tileX: x, tileY: y, cell,
      });
    }
    return found;
  }

  function routeTarget(goal) {
    const s = G.state;
    const nextMap = nextMapToward(s.mapId, goal.mapId);
    if (!nextMap) return null;
    const candidates = gridTargets((cell) => cell.portal && cell.portal.map === nextMap);
    const target = nearest(candidates, s.player.x, s.player.y);
    if (!target) return null;
    const destination = G.maps[nextMap] && G.maps[nextMap].name || goal.destination || nextMap;
    const travel = goal.guide === "travel";
    return Object.assign(target, {
      kind: travel ? "travel" : "story",
      color: travel ? G.GUIDANCE_COLORS.travel : G.GUIDANCE_COLORS.story,
      icon: travel ? "↗" : "◇",
      destination,
      text: `Follow the ${travel ? "blue" : "gold"} trail toward ${destination}.`,
    });
  }

  function firstOpenQuest(formId) {
    const order = formId && G.forms[formId] ? [formId] : (G.unlockedForms ? G.unlockedForms() : G.formOrder || []);
    for (const id of order) {
      const form = G.forms[id];
      const open = form && (form.quests || []).filter((entry) => !G.questsDone.includes(entry.id));
      const quest = open && (open.find((entry) => entry.event === "sign") || open[0]);
      if (quest) return { form, quest };
    }
    return null;
  }

  function masteryTarget(goal) {
    const s = G.state;
    const lesson = firstOpenQuest(goal.formId);
    if (!lesson) return null;
    const quest = lesson.quest;
    let target = null;
    if (quest.event === "sign") {
      target = nearest(gridTargets((cell) => !!cell.message), s.player.x, s.player.y);
    } else if (quest.event === "pickup") {
      const chests = (s.chests || []).filter((chest) => !chest.opened).map((chest) => ({
        x: chest.x * G.TILE + G.TILE / 2, y: chest.y * G.TILE + G.TILE / 2,
        tileX: chest.x, tileY: chest.y,
      }));
      target = nearest(chests, s.player.x, s.player.y);
    } else {
      const enemies = (s.enemies || []).filter((enemy) => !enemy.dead && !enemy.def.miniboss);
      target = nearest(enemies, s.player.x, s.player.y);
    }
    const text = `${lesson.form.icon} ${quest.text} — try it here in the world.`;
    if (!target) return {
      kind: "form", color: G.GUIDANCE_COLORS.form, icon: "✦",
      destination: lesson.form.name, text, spatial: false,
    };
    return Object.assign({}, target, {
      kind: quest.event === "sign" ? "story" : "form",
      color: quest.event === "sign" ? G.GUIDANCE_COLORS.story : G.GUIDANCE_COLORS.form,
      icon: quest.event === "sign" ? "◇" : lesson.form.icon,
      destination: quest.event === "sign" ? "the nearby sign" : "a safe practice fight",
      text,
    });
  }

  G.guidanceTarget = function () {
    const s = G.state;
    if (!s || !s.player || !G.storyGoal) return null;
    const goal = G.storyGoal();
    if (!goal || goal.complete) return null;

    if (goal.guide === "claim") return {
      kind: "form", color: G.GUIDANCE_COLORS.form, icon: "✦", spatial: false,
      destination: `${goal.formId ? G.forms[goal.formId].name : "a new form"}`,
      text: `${goal.formId ? G.forms[goal.formId].name : "A new form"} is ready. Open the Form Lab and claim the glowing portrait.`,
    };
    if (goal.guide === "mastery") return masteryTarget(goal);

    if (goal.mapId && goal.mapId !== s.mapId) return routeTarget(goal);

    if (goal.guide === "boss" || goal.mapId === s.mapId) {
      const bosses = (s.enemies || []).filter((enemy) => !enemy.dead && enemy.def.miniboss);
      const boss = nearest(bosses, s.player.x, s.player.y);
      if (boss) return {
        x: boss.x, y: boss.y, entity: boss,
        tileX: Math.floor(boss.x / G.TILE), tileY: Math.floor(boss.y / G.TILE),
        kind: "danger", color: G.GUIDANCE_COLORS.danger, icon: "!",
        destination: boss.def.name,
        text: `${boss.def.name} is ahead. Watch its tells; there is no penalty for learning the fight.`,
      };
    }
    return null;
  };

  function targetKey(target) {
    if (!target) return "";
    return [G.state.mapId, target.kind, target.destination, target.tileX, target.tileY].join(":");
  }

  function passable(x, y, target) {
    const s = G.state;
    if (x === target.tileX && y === target.tileY) return true;
    if (x < 0 || y < 0 || x >= s.mapW || y >= s.mapH) return false;
    const cell = s.grid[y] && s.grid[y][x];
    return !!cell && !["tree", "water", "wall", "rock"].includes(cell.tile) &&
      (!cell.portal || !G.world.solid(x * G.TILE + G.TILE / 2, y * G.TILE + G.TILE / 2));
  }

  function pathTo(target) {
    const s = G.state;
    if (!target || target.spatial === false || target.tileX == null || !s.grid) return [];
    const sx = Math.floor(s.player.x / G.TILE), sy = Math.floor(s.player.y / G.TILE);
    const startKey = `${sx},${sy}`;
    const endKey = `${target.tileX},${target.tileY}`;
    if (startKey === endKey) return [];
    const queue = [[sx, sy]];
    const parent = new Map([[startKey, null]]);
    let found = false;
    for (let head = 0; head < queue.length && head < 12000; head++) {
      const point = queue[head];
      for (const step of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const x = point[0] + step[0], y = point[1] + step[1];
        const key = `${x},${y}`;
        if (parent.has(key) || !passable(x, y, target)) continue;
        parent.set(key, `${point[0]},${point[1]}`);
        if (key === endKey) { found = true; break; }
        queue.push([x, y]);
      }
      if (found) break;
    }
    if (!found) return [];
    const path = [];
    let key = endKey;
    while (key && key !== startKey) {
      const parts = key.split(",").map(Number);
      path.push({ x: parts[0] * G.TILE + G.TILE / 2, y: parts[1] * G.TILE + G.TILE / 2 });
      key = parent.get(key);
    }
    return path.reverse();
  }

  function directionFrom(x, y, target) {
    if (!target || target.spatial === false) return "nearby";
    const dx = target.x - x, dy = target.y - y;
    if (Math.abs(dx) > Math.abs(dy) * 1.35) return dx > 0 ? "east" : "west";
    if (Math.abs(dy) > Math.abs(dx) * 1.35) return dy > 0 ? "south" : "north";
    return `${dy > 0 ? "south" : "north"}${dx > 0 ? "east" : "west"}`;
  }

  function refreshTarget(force) {
    const target = G.guidanceTarget();
    const key = targetKey(target);
    if (key !== runtime.targetKey) {
      runtime.targetKey = key;
      runtime.target = target;
      runtime.path = [];
      runtime.lastDistance = null;
      runtime.stagnantFor = 0;
      runtime.autoStage = 0;
      runtime.manualCount = 0;
      runtime.recalcAt = 0;
    } else if (target && runtime.target && target.entity) {
      runtime.target.x = target.x;
      runtime.target.y = target.y;
    } else {
      runtime.target = target;
    }
    // Large regions can contain thousands of tiles. Rebuild a route only while
    // its breadcrumbs are visible (or when help was explicitly requested), so
    // an idle phone never spends frames solving an invisible path.
    if (target && target.spatial !== false &&
        (force || (runtime.activeUntil > now() && now() >= runtime.recalcAt))) {
      runtime.path = pathTo(target);
      runtime.recalcAt = now() + 0.8;
    }
    return runtime.target;
  }

  G.requestGuidance = function (automatic) {
    const target = refreshTarget(true);
    if (!target) {
      if (!automatic && G.ui && G.ui.toast) G.ui.toast("◇ Explore freely — the next story path will reveal itself when it is ready.", 3);
      return false;
    }
    runtime.activeUntil = now() + (automatic ? 8 : 13);
    runtime.cardUntil = now() + (automatic ? 4 : 7);
    if (!automatic) {
      runtime.manualCount += 1;
      const guidance = G.ensureGuidance();
      guidance.helpRequests += 1;
      if (target.spatial !== false) {
        const dx = target.x - G.state.player.x, dy = target.y - G.state.player.y;
        const length = Math.hypot(dx, dy) || 1;
        G.state.player.dir = { x: dx / length, y: dy / length };
      }
      if (G.sfx && G.sfx.play) G.sfx.play("pickup");
      if (G.spawnFx) G.spawnFx({ kind: "ring", x: G.state.player.x, y: G.state.player.y - 7,
        color: target.color, radius: 18, dur: 0.5 });
      if (G.ui && G.ui.toast) G.ui.toast(`${target.icon} ${target.text}`, 4.5);
      if (runtime.manualCount >= 3 && G.ui && G.ui.dialogue) {
        G.ui.dialogue("◇ PEBBLE'S BEST GUESS", target.text, { accent: target.color });
        runtime.manualCount = 0;
      }
      if (G.saveGame) G.saveGame();
    }
    return true;
  };

  G.guidanceShowStoryCard = function () {
    return runtime.cardUntil > now();
  };

  G.guidanceNeedsHint = function () {
    return runtime.autoStage >= 2 || runtime.activeUntil > now();
  };

  G.guidanceNpcHint = function (npc) {
    if (!npc || npc.ambientOnly || !["pebble", "mayorMaybe", "errata", "parcel", "moss", "probably", "lastminute"].includes(npc.id)) return "";
    const target = refreshTarget(false);
    if (!target) return "";
    if (target.spatial === false) return target.text;
    const signal = target.kind === "danger" ? "red warning" :
      target.kind === "form" ? "purple lesson" : target.kind === "travel" ? "blue trail" : "gold trail";
    return `The ${signal} leads ${directionFrom(npc.x, npc.y, target)} toward ${target.destination}.`;
  };

  G.applyGuidanceToNpc = function (npc, player) {
    npc.guidancePoint = false;
    if (!npc || npc.ambientOnly || !player || G.util.dist(npc.x, npc.y, player.x, player.y) > 58) return;
    const hint = G.guidanceNpcHint(npc);
    const target = runtime.target;
    if (!hint || !target || target.spatial === false) return;
    npc.guidancePoint = true;
    npc.facingLeft = target.x < npc.x;
  };

  G.guidanceFormForType = function (type) {
    const forms = G.unlockedForms ? G.unlockedForms() : [];
    for (const id of forms) {
      const form = G.forms[id];
      const native = G.abilities[form.basic];
      if (native && native.type === type) return form;
    }
    for (const id of forms) {
      const form = G.forms[id];
      const loadout = G.getLoadout ? G.getLoadout(id) : [];
      if (loadout.some((abilityId) => G.abilities[abilityId] && G.abilities[abilityId].type === type)) return form;
    }
    return null;
  };

  G.guidanceWardSuggestion = function (enemy) {
    if (!runtime.ward || !enemy || runtime.ward.enemy !== enemy || runtime.ward.until <= now()) return null;
    return runtime.ward;
  };

  G.guidanceAssistHearts = function () {
    if (!G.comfortSetting || !G.comfortSetting("bossAssistance")) return 0;
    if (!G.state || !G.state.guidance) return 0;
    const retries = Number(G.state.guidance.bossRetries[G.state.mapId]) || 0;
    return retries >= 4 ? 2 : retries >= 2 ? 1 : 0;
  };

  G.guidanceProjectileScale = function (projectile) {
    if (!G.comfortSetting || !G.comfortSetting("bossAssistance")) return 1;
    if (!projectile || projectile.fromPlayer || !projectile.owner || !projectile.owner.def || !projectile.owner.def.miniboss) return 1;
    const retries = Number(G.ensureGuidance().bossRetries[G.state.mapId]) || 0;
    return retries >= 5 ? 0.78 : retries >= 3 ? 0.88 : 1;
  };

  G.updateGuidance = function (dt) {
    const s = G.state;
    if (!s || !s.player || !s.grid || s.bossCutscene || s.knockout) return;
    const target = refreshTarget(false);
    const swap = typeof document !== "undefined" && document.getElementById ? document.getElementById("btn-swap") : null;
    const mapButton = typeof document !== "undefined" && document.getElementById ? document.getElementById("btn-map") : null;
    if (swap && swap.classList) swap.classList.toggle("suggested", !!(runtime.ward && runtime.ward.until > now()));
    if (mapButton && mapButton.classList) mapButton.classList.toggle("guidance-ready", runtime.activeUntil > now());
    if (!target || target.spatial === false || (G.ui && (G.ui.menuOpen || G.ui.dialogueOpen))) return;
    const danger = (s.enemies || []).some((enemy) => !enemy.dead && G.util.dist(enemy.x, enemy.y, s.player.x, s.player.y) < 65);
    const distance = G.util.dist(s.player.x, s.player.y, target.x, target.y);
    if (runtime.lastDistance == null || distance < runtime.lastDistance - 10) {
      runtime.lastDistance = distance;
      runtime.stagnantFor = 0;
      runtime.autoStage = 0;
    } else if (!danger) {
      runtime.stagnantFor += dt || 0;
      runtime.lastDistance = Math.min(runtime.lastDistance, distance);
    }
    const thresholds = [18, 40, 72];
    if (!danger && runtime.autoStage < thresholds.length && runtime.stagnantFor >= thresholds[runtime.autoStage]) {
      runtime.autoStage += 1;
      runtime.activeUntil = now() + 8;
      runtime.cardUntil = now() + 4;
      if (runtime.autoStage === 2 && G.ui && G.ui.toast)
        G.ui.toast(`${target.icon} ${target.text}`, 4);
      if (runtime.autoStage === 3 && G.ui && G.ui.dialogue)
        G.ui.dialogue("◇ PEBBLE NOTICES", target.text, { accent: target.color });
    }
  };

  G.drawWorldGuidance = function (ctx, cam, time) {
    const target = refreshTarget(false);
    if (!target || target.spatial === false) return;
    const active = runtime.activeUntil > now();
    ctx.save();
    if (active && runtime.path.length) {
      const stride = Math.max(1, Math.floor(runtime.path.length / 11));
      for (let i = stride; i < runtime.path.length; i += stride) {
        const point = runtime.path[i];
        const pulse = 0.4 + 0.35 * Math.sin((time || 0) * 5 - i * 0.7);
        ctx.globalAlpha = pulse;
        ctx.fillStyle = target.color;
        ctx.save();
        ctx.translate(Math.round(point.x), Math.round(point.y - 2));
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-2, -2, 4, 4);
        ctx.restore();
      }
    }
    const onScreen = target.x >= cam.x - 12 && target.x <= cam.x + G.W + 12 &&
      target.y >= cam.y - 12 && target.y <= cam.y + G.H + 12;
    if (onScreen) {
      const pulse = 0.55 + Math.sin((time || 0) * 4) * 0.18;
      ctx.globalAlpha = active ? 0.9 : 0.34;
      ctx.strokeStyle = target.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(Math.round(target.x), Math.round(target.y - 5), 10 + pulse * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = target.color;
      ctx.fillRect(Math.round(target.x - 1), Math.round(target.y - 25 - pulse * 3), 3, 3);
    }
    ctx.restore();
  };

  G.drawGuidanceHud = function (ctx, cam) {
    const target = refreshTarget(false);
    if (!target) return;
    const active = runtime.activeUntil > now();
    if (target.spatial === false) {
      if (!active) return;
      ctx.font = "5px 'Press Start 2P', monospace";
      const label = `✦ ${String(target.destination).toUpperCase()}`;
      const width = ctx.measureText(label).width + 10;
      ctx.fillStyle = "rgba(26,28,44,0.88)";
      ctx.fillRect(Math.round((G.W - width) / 2), G.H - 45, width, 12);
      ctx.fillStyle = target.color;
      ctx.fillText(label, Math.round((G.W - width) / 2) + 5, G.H - 41);
      return;
    }
    const sx = target.x - cam.x, sy = target.y - cam.y;
    const onScreen = sx >= 10 && sx <= G.W - 10 && sy >= 16 && sy <= G.H - 20;
    if (onScreen && !active) return;
    const centerX = G.W / 2, centerY = G.H / 2;
    const angle = Math.atan2(sy - centerY, sx - centerX);
    const radiusX = G.W / 2 - 14, radiusY = G.H / 2 - 22;
    const scale = Math.min(Math.abs(radiusX / (Math.cos(angle) || 0.001)), Math.abs(radiusY / (Math.sin(angle) || 0.001)));
    const x = onScreen ? G.util.clamp(sx, 12, G.W - 12) : centerX + Math.cos(angle) * scale;
    const y = onScreen ? G.util.clamp(sy - 18, 20, G.H - 28) : centerY + Math.sin(angle) * scale;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.rotate(angle + Math.PI / 2);
    ctx.globalAlpha = active ? 1 : 0.64;
    ctx.fillStyle = "rgba(26,28,44,0.84)";
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(7, 6); ctx.lineTo(-7, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = target.color;
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(4, 4); ctx.lineTo(-4, 4); ctx.closePath(); ctx.fill();
    ctx.restore();
    if (active) {
      ctx.font = "5px 'Press Start 2P', monospace";
      const label = `${target.icon} ${String(target.destination).toUpperCase()}`;
      const width = Math.min(G.W - 30, ctx.measureText(label).width + 10);
      ctx.fillStyle = "rgba(26,28,44,0.86)";
      ctx.fillRect(Math.round((G.W - width) / 2), G.H - 45, width, 12);
      ctx.fillStyle = target.color;
      ctx.fillText(label, Math.round((G.W - width) / 2) + 5, G.H - 41);
    }
  };

  G.events.on("mapEnter", (data) => {
    runtime.activeUntil = now() + 7;
    runtime.cardUntil = now() + 4;
    runtime.targetKey = "";
    runtime.recalcAt = 0;
    const retries = Number(G.ensureGuidance().bossRetries[data.map]) || 0;
    if (G.comfortSetting && G.comfortSetting("bossAssistance") && retries >= 2 && G.ui && G.ui.toast) {
      const hearts = retries >= 4 ? 2 : 1;
      G.ui.toast(`♥ Pebble's courage: +${hearts} retry heart${hearts === 1 ? "" : "s"} for this challenge`, 4);
    }
  });

  for (const event of ["questDone", "pickup", "formUnlock", "wardBreak", "mapEnter"]) {
    G.events.on(event, () => {
      runtime.lastDistance = null;
      runtime.stagnantFor = 0;
      runtime.autoStage = 0;
      runtime.targetKey = "";
      if (event !== "mapEnter") {
        runtime.activeUntil = now() + 7;
        runtime.cardUntil = now() + 4;
      }
    });
  }

  G.events.on("wardBlocked", (data) => {
    const count = runtime.ward && runtime.ward.enemy === data.enemy ? runtime.ward.count + 1 : 1;
    const form = G.guidanceFormForType(data.damageType);
    runtime.ward = { enemy: data.enemy, damageType: data.damageType, form, count, until: now() + 9 };
    if (count === 2 && form && G.ui && G.ui.toast)
      G.ui.toast(`⇄ ${form.name} carries ${G.DAMAGE_TYPES[data.damageType].name} damage — hold the form button to choose it.`, 4);
  });

  G.events.on("swap", () => { runtime.ward = null; });
  G.events.on("wardBreak", () => { runtime.ward = null; });

  G.events.on("ko", (data) => {
    if (!data || !data.trial) return;
    const guidance = G.ensureGuidance();
    guidance.bossRetries[data.trial] = Math.min(9, (Number(guidance.bossRetries[data.trial]) || 0) + 1);
  });

  G.events.on("kill", (data) => {
    const enemy = data && G.enemies && G.enemies[data.enemy];
    if (!enemy || !enemy.miniboss || !G.state || !G.state.guidance) return;
    G.state.guidance.bossRetries[G.state.mapId] = 0;
  });
})();
