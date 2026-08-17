/* ============================================================
   NPC STORY ENGINE - safe placement, changing dialogue, and drawing.

   Talking is intentionally proximity-based: it works with keyboard,
   controller, and touch without adding another mobile HUD button.
   Walk up to someone, then step away and return to hear their next line.
   ============================================================ */

"use strict";

(function () {
  const TALK_NEAR = 25;
  const TALK_RESET = 36;
  const ROUTINE_OFFSETS = [
    [[3, 0], [1, 3], [-2, 2]],
    [[-3, 0], [-1, -3], [2, -2]],
    [[0, 3], [3, 1], [-2, -2]],
    [[0, -3], [-3, 1], [2, 2]],
  ];
  const AMBIENT_EXCHANGES = [
    ["Lovely day!", "For something."],
    ["Road clear?", "Clear enough."],
    ["Need a hand?", "Always."],
    ["Hear that?", "The world waking."],
    ["Going far?", "Eventually."],
    ["Nice outfit.", "It's borrowed."],
  ];
  const SOLO_BARKS = ["Hmm...", "All clear.", "♪", "Busy day.", "Oh, hello!", "Good road." ];
  const ROLE_ACTIVITIES = {
    pebble: ["watch", "notes"], mayorMaybe: ["notes", "wave"], errata: ["read", "notes"],
    parcel: ["parcel", "map"], pending: ["polish", "watch"], alias: ["sew", "wave"],
    provisional: ["mix", "notes"], moss: ["water", "garden"], lastminute: ["map", "watch"],
    probably: ["glow", "read"],
  };

  const residentFrames = [
    [
      "..hhh..", ".hhhhh.", ".hfff..", "..fff..", "..ccc..",
      ".accca.", "..ccc..", "..c.c..", ".bb.bb.",
    ],
    [
      ".hhhh..", ".hhhhh.", "..fffh.", "..fff..", "..ccc..",
      "acccc..", "..ccca.", ".c...c.", "..b..bb",
    ],
  ];
  const residentColors = [
    ["#6b4a2b", "#e0a17c", "#3b7d6a", "#ffcd75"],
    ["#d8b06a", "#9b654e", "#596fa3", "#73eff7"],
    ["#493829", "#c98c72", "#985f79", "#f4f4f4"],
    ["#b7b1c9", "#d6a17c", "#6f7042", "#a7f070"],
    ["#70493e", "#8f5f4c", "#8153c1", "#d9a7ff"],
    ["#f2e4a8", "#694b67", "#426080", "#ef7d57"],
  ];
  const residentDefs = [];

  G.storyChapter = function () {
    const s = G.state || {};
    const items = new Set(s.items || []);
    const campaign = s.worldwake || {};
    const marks = Array.isArray(campaign.marks) ? campaign.marks.length : 0;
    const discovered = Array.isArray(campaign.discovered) ? campaign.discovered.length : 0;
    const trophies = G.guardianTrophies
      ? G.guardianTrophies().filter((item) => items.has(item)).length
      : Array.from(items).filter((item) => item.indexOf("trophy-") === 0).length;
    const forms = Array.isArray(s.claimedForms) ? s.claimedForms.length : 0;

    if (items.has("god-spark") || marks >= 6) return 5;
    if (marks >= 3) return 4;
    if (discovered > 0) return 3;
    if (trophies >= 2 || (s.stars || 0) >= 10) return 2;
    if (forms >= 2 || (s.stars || 0) >= 3) return 1;
    return 0;
  };

  G.storyChapterName = function (chapter) {
    return [
      "Somebody Else's Problem",
      "Many Useful Shapes",
      "Masters of One Thing",
      "The Waking Roads",
      "Six Old Promises",
      "Nobody, Together",
    ][chapter == null ? G.storyChapter() : chapter];
  };

  function nearestOpen(preferredX, preferredY, isOpen, occupied) {
    for (let radius = 0; radius <= 8; radius++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (radius && Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
          const x = preferredX + dx;
          const y = preferredY + dy;
          if (!isOpen(x, y)) continue;
          if (occupied.some((spot) => Math.abs(spot.x - x) + Math.abs(spot.y - y) < 3)) continue;
          return { x, y };
        }
      }
    }
    return null;
  }

  function seedFor(text) {
    let seed = 0;
    for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) >>> 0;
    return seed;
  }

  function routineAnchors(home, isOpen, seed) {
    const anchors = [home];
    const offsets = ROUTINE_OFFSETS[seed % ROUTINE_OFFSETS.length];
    for (const [dx, dy] of offsets) {
      const spot = nearestOpen(home.x + dx, home.y + dy, isOpen, anchors);
      if (spot && !anchors.some((anchor) => anchor.x === spot.x && anchor.y === spot.y)) anchors.push(spot);
    }
    return anchors;
  }

  function activitiesFor(id, ambientOnly) {
    return ambientOnly ? ["sweep", "garden", "parcel"] : ROLE_ACTIVITIES[id] || ["watch"];
  }

  function makeNpc(id, def, tile, isOpen, ambientOnly) {
    const seed = seedFor(id);
    const activities = activitiesFor(id, ambientOnly);
    return {
      id,
      def,
      x: tile.x * G.TILE + G.TILE / 2,
      y: tile.y * G.TILE + G.TILE / 2 + 3,
      anim: (tile.x * 0.37 + tile.y * 0.19) % 2,
      near: false,
      facingLeft: false,
      ambientOnly: !!ambientOnly,
      home: tile,
      anchors: routineAnchors(tile, isOpen, seed),
      anchorIndex: 0,
      routineT: 1.5 + (seed % 7) * 0.35,
      path: [],
      bubble: null,
      activity: activities[seed % activities.length],
      seed,
    };
  }

  function residentDef(index) {
    if (residentDefs[index]) return residentDefs[index];
    const colors = residentColors[index % residentColors.length];
    const def = {
      name: "Town Resident",
      icon: "•",
      chapters: {},
      sprite: {
        palette: { h: colors[0], f: colors[1], c: colors[2], a: colors[3], b: "#352b42" },
        frames: residentFrames,
      },
    };
    residentDefs[index] = def;
    return def;
  }

  function townPlotTiles() {
    const map = G.maps && G.maps.town;
    const plots = {};
    if (!map) return plots;
    for (let y = 0; y < map.tiles.length; y++) for (let x = 0; x < map.tiles[y].length; x++) {
      const cell = map.legend[map.tiles[y][x]];
      if (cell && cell.townPlot) plots[cell.townPlot] = { x, y };
    }
    return plots;
  }

  G.townVisibleResidentCount = function () {
    const town = G.state && G.state.town;
    return town && town.founded ? Math.min(16, Math.max(0, town.residents || 0)) : 0;
  };

  function makeTownResidents(isOpen, occupied) {
    const count = G.townVisibleResidentCount();
    if (!count) return [];
    const town = G.state.town;
    const plots = townPlotTiles();
    const homes = (town.houses || []).map((id) => plots[id]).filter(Boolean);
    if (!homes.length) homes.push({ x: 14, y: 3 });
    const residents = [];
    const residentOpen = (x, y) => {
      if (!isOpen(x, y)) return false;
      const row = G.maps.town.tiles[y];
      const cell = row && G.maps.town.legend[row[x]];
      return !(cell && cell.townPlot && G.townHouseBuilt && G.townHouseBuilt(cell.townPlot));
    };
    for (let i = 0; i < count; i++) {
      const home = homes[i % homes.length];
      const ring = 2 + Math.floor(i / Math.max(1, homes.length));
      const preferred = {
        x: home.x + (i % 2 ? ring : -ring),
        y: home.y + (i % 3 === 0 ? 2 : i % 3 === 1 ? -2 : 0),
      };
      const tile = nearestOpen(preferred.x, preferred.y, residentOpen, occupied);
      if (!tile) continue;
      occupied.push(tile);
      residents.push(makeNpc(`resident-${i}`, residentDef(i), tile, residentOpen, true));
    }
    return residents;
  }

  G.makeMapNpcs = function (mapId, isOpen) {
    const placements = (G.NPC_PLACEMENTS && G.NPC_PLACEMENTS[mapId]) || [];
    const occupied = [];
    const result = [];
    for (const placement of placements) {
      const id = placement[0];
      const def = G.NPCS && G.NPCS[id];
      if (!def) continue;
      const tile = nearestOpen(placement[1], placement[2], isOpen, occupied);
      if (!tile) continue;
      occupied.push(tile);
      result.push(makeNpc(id, def, tile, isOpen, false));
    }
    if (mapId === "town") result.push(...makeTownResidents(isOpen, occupied));
    return result;
  };

  function npcTileOpen(x, y) {
    const s = G.state;
    if (x < 1 || y < 1 || x >= s.mapW - 1 || y >= s.mapH - 1) return false;
    const cell = s.grid[y] && s.grid[y][x];
    if (!cell || cell.portal || cell.chest || cell.message || cell.rest) return false;
    if (cell.townPlot && G.townHouseBuilt && G.townHouseBuilt(cell.townPlot)) return false;
    return !G.world.solid(x * G.TILE + G.TILE / 2, y * G.TILE + G.TILE / 2);
  }

  function pathTo(npc, target) {
    const start = { x: Math.floor(npc.x / G.TILE), y: Math.floor(npc.y / G.TILE) };
    const startKey = `${start.x},${start.y}`;
    const targetKey = `${target.x},${target.y}`;
    if (startKey === targetKey) return [];
    const queue = [start];
    const parent = new Map([[startKey, null]]);
    let found = false;
    for (let head = 0; head < queue.length && head < 700; head++) {
      const point = queue[head];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const next = { x: point.x + dx, y: point.y + dy };
        const key = `${next.x},${next.y}`;
        if (parent.has(key) || !npcTileOpen(next.x, next.y)) continue;
        parent.set(key, `${point.x},${point.y}`);
        if (key === targetKey) { found = true; break; }
        queue.push(next);
      }
      if (found) break;
    }
    if (!found) return [];
    const path = [];
    let key = targetKey;
    while (key && key !== startKey) {
      const [x, y] = key.split(",").map(Number);
      path.push({ x: x * G.TILE + G.TILE / 2, y: y * G.TILE + G.TILE / 2 + 3 });
      key = parent.get(key);
    }
    return path.reverse();
  }

  function setBubble(npc, text, delay) {
    const wait = delay || 0;
    npc.bubble = { text, delay: wait, t: 2.25 + wait, duration: 2.25 };
  }

  G.startNpcExchange = function (first, second, index) {
    if (!first) return false;
    if (!second) {
      setBubble(first, SOLO_BARKS[(index == null ? first.seed : index) % SOLO_BARKS.length], 0);
      return true;
    }
    const exchange = AMBIENT_EXCHANGES[(index == null ? first.seed + second.seed : index) % AMBIENT_EXCHANGES.length];
    setBubble(first, exchange[0], 0);
    setBubble(second, exchange[1], 1.7);
    first.facingLeft = second.x < first.x;
    second.facingLeft = first.x < second.x;
    return true;
  };

  function updateRoutine(npc, dt, player, threats) {
    const closeThreat = threats.find((enemy) => Math.hypot(enemy.x - npc.x, enemy.y - npc.y) < 66);
    if (closeThreat) {
      npc.activity = null;
      const angle = Math.atan2(npc.y - closeThreat.y, npc.x - closeThreat.x);
      G.world.moveBox(npc, Math.cos(angle) * 28 * dt, Math.sin(angle) * 28 * dt);
      npc.facingLeft = Math.cos(angle) < 0;
      npc.anim += dt * 7;
      if (!npc.bubble) setBubble(npc, "!", 0);
      return;
    }

    const playerDistance = Math.hypot(player.x - npc.x, player.y - npc.y);
    if (playerDistance < TALK_RESET) {
      npc.facingLeft = player.x < npc.x;
      return;
    }

    if (npc.path.length) {
      npc.activity = null;
      const target = npc.path[0];
      const dx = target.x - npc.x;
      const dy = target.y - npc.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 2) {
        npc.path.shift();
        if (!npc.path.length) {
          npc.routineT = 2.2 + (npc.seed % 9) * 0.35;
          const activities = activitiesFor(npc.id, npc.ambientOnly);
          npc.activity = activities[(npc.anchorIndex + npc.seed) % activities.length];
        }
        return;
      }
      const speed = npc.ambientOnly ? 14 : 12;
      const step = Math.min(distance, speed * dt);
      G.world.moveBox(npc, dx / distance * step, dy / distance * step);
      npc.facingLeft = dx < 0;
      npc.anim += dt * 6;
      return;
    }

    npc.anim += dt * 0.8;
    npc.routineT -= dt;
    if (npc.routineT > 0 || npc.anchors.length < 2) return;
    npc.anchorIndex = (npc.anchorIndex + 1 + (npc.seed % Math.max(1, npc.anchors.length - 1))) % npc.anchors.length;
    npc.path = pathTo(npc, npc.anchors[npc.anchorIndex]);
    if (!npc.path.length) npc.routineT = 2.5;
  }

  G.syncTownResidents = function () {
    const s = G.state;
    if (!s || s.mapId !== "town" || !s.grid) return;
    const named = (s.npcs || []).filter((npc) => !npc.ambientOnly);
    const occupied = named.map((npc) => ({ x: Math.floor(npc.x / G.TILE), y: Math.floor(npc.y / G.TILE) }));
    const isOpen = (x, y) => npcTileOpen(x, y);
    s.npcs = named.concat(makeTownResidents(isOpen, occupied));
  };

  G.celebrateTown = function () {
    if (!G.state || G.state.mapId !== "town") return;
    const p = G.state.player;
    const residents = (G.state.npcs || []).filter((npc) => npc.ambientOnly)
      .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))
      .slice(0, 3);
    for (let i = 0; i < residents.length; i++)
      setBubble(residents[i], i === 0 ? "Hooray!" : i === 1 ? "♪" : "♥", i * 0.75);
  };

  function chapterLines(def, chapter) {
    const stages = Object.keys(def.chapters || {})
      .map(Number)
      .filter((stage) => stage <= chapter)
      .sort((a, b) => a - b);
    return stages.length ? def.chapters[stages[stages.length - 1]] : [];
  }

  G.npcDialogue = function (npcId, chapter, index) {
    const def = G.NPCS && G.NPCS[npcId];
    if (!def) return "";
    const lines = chapterLines(def, chapter == null ? G.storyChapter() : chapter);
    return lines.length ? lines[(index || 0) % lines.length] : "";
  };

  function talk(npc) {
    const s = G.state;
    const chapter = G.storyChapter();
    const key = npc.id + ":" + chapter;
    const count = Number(s.npcTalk[key]) || 0;
    const line = G.npcDialogue(npc.id, chapter, count);
    if (!line) return;
    s.npcTalk[key] = count + 1;
    const chapterTitle = chapter === 0 && count === 0 ? " · " + G.storyChapterName(chapter) : "";
    const speaker = npc.def.icon + " " + npc.def.name + chapterTitle;
    if (G.ui.dialogue) G.ui.dialogue(speaker, line, { accent: npc.def.sprite.palette.a });
    else G.ui.toast(speaker + ": " + line, 5.8);
    if (G.sfx && G.sfx.play) G.sfx.play("menu");
    if (G.spawnFx) G.spawnFx({
      kind: "ring", x: npc.x, y: npc.y - 8,
      color: npc.def.sprite.palette.a, radius: 9, dur: 0.28,
    });
    G.events.emit("npcTalk", { id: npc.id, chapter, count: count + 1, mapId: s.mapId });
    if (G.saveGame) G.saveGame();
  }

  G.updateNpcs = function (dt) {
    const s = G.state;
    const p = s && s.player;
    const npcs = (s && s.npcs) || [];
    if (!p || !npcs.length) return;
    const blocked = s.bossCutscene || s.zoneTransition || s.playerKnockout || s.gauntletBetween;
    const danger = (s.enemies || []).some((enemy) =>
      !enemy.dead && Math.hypot(enemy.x - p.x, enemy.y - p.y) < 48);
    let candidate = null;
    let candidateDistance = Infinity;
    const threats = (s.enemies || []).filter((enemy) => !enemy.dead);

    for (const npc of npcs) {
      updateRoutine(npc, dt, p, threats);
      if (npc.bubble) {
        npc.bubble.t -= dt;
        npc.bubble.delay = Math.max(0, npc.bubble.delay - dt);
        if (npc.bubble.t <= 0) npc.bubble = null;
      }
      const distance = Math.hypot(npc.x - p.x, npc.y - p.y);
      if (distance > TALK_RESET) npc.near = false;
      if (!npc.ambientOnly && distance <= TALK_NEAR && !npc.near && distance < candidateDistance) {
        candidate = npc;
        candidateDistance = distance;
      }
    }

    s.npcChatterT = (s.npcChatterT == null ? 12 + ((s.time || 0) % 5) : s.npcChatterT) - dt;
    if (s.npcChatterT <= 0 && !blocked && !danger) {
      const nearby = npcs.filter((npc) => Math.hypot(npc.x - p.x, npc.y - p.y) < 108 && !npc.bubble);
      let pair = null;
      for (let i = 0; i < nearby.length && !pair; i++) for (let j = i + 1; j < nearby.length; j++) {
        if (Math.hypot(nearby[i].x - nearby[j].x, nearby[i].y - nearby[j].y) < 70) {
          pair = [nearby[i], nearby[j]];
          break;
        }
      }
      if (pair) G.startNpcExchange(pair[0], pair[1]);
      else if (nearby.length && Math.floor(s.time || 0) % 2 === 0) G.startNpcExchange(nearby[0], null);
      s.npcChatterT = 21 + ((s.time || 0) % 8);
    }

    if (candidate && !blocked && !danger) {
      // Mark everyone in the same little conversation circle so a crowd does
      // not fire three speeches on consecutive frames.
      for (const npc of npcs) {
        if (Math.hypot(npc.x - p.x, npc.y - p.y) <= TALK_NEAR) npc.near = true;
      }
      talk(candidate);
    }
  };

  G.drawNpc = function (ctx, npc) {
    const p = G.state.player;
    const bob = Math.sin(npc.anim * Math.PI) * 0.45;
    G.drawShadow(ctx, npc.x, npc.y, 10);
    G.drawSprite(ctx, npc.def.sprite, Math.floor(npc.anim) % 2, npc.x, npc.y + bob, npc.facingLeft);
    if (npc.activity) {
      const side = npc.facingLeft ? -7 : 6;
      const ax = Math.round(npc.x + side), ay = Math.round(npc.y + 1 + bob);
      ctx.save();
      if (npc.activity === "water") {
        ctx.fillStyle = "#566c86"; ctx.fillRect(ax - 2, ay - 2, 5, 4); ctx.fillRect(ax + 2, ay - 4, 3, 1);
        ctx.fillStyle = "#73eff7"; ctx.fillRect(ax + 5, ay - 2, 1, 1); ctx.fillRect(ax + 7, ay, 1, 1);
      } else if (npc.activity === "garden") {
        ctx.fillStyle = "#1e5f4e"; ctx.fillRect(ax, ay - 3, 1, 5);
        ctx.fillStyle = "#a7f070"; ctx.fillRect(ax - 2, ay - 5, 5, 2);
      } else if (npc.activity === "parcel") {
        ctx.fillStyle = "#8a6538"; ctx.fillRect(ax - 3, ay - 3, 7, 6);
        ctx.fillStyle = "#ffcd75"; ctx.fillRect(ax, ay - 3, 1, 6); ctx.fillRect(ax - 3, ay - 1, 7, 1);
      } else if (npc.activity === "sweep" || npc.activity === "polish") {
        ctx.fillStyle = npc.activity === "sweep" ? "#6b4a2b" : "#94b0c2";
        ctx.fillRect(ax, ay - 7, 1, 9); ctx.fillRect(ax - 2, ay + 1, 5, 2);
      } else if (npc.activity === "glow" || npc.activity === "mix") {
        ctx.globalAlpha = 0.55 + Math.sin(npc.anim * 3) * 0.2;
        ctx.fillStyle = npc.activity === "glow" ? "#d9a7ff" : "#73eff7"; ctx.fillRect(ax - 2, ay - 5, 5, 5);
      } else if (npc.activity === "wave") {
        ctx.fillStyle = npc.def.sprite.palette.f; ctx.fillRect(ax, ay - 7, 2, 4);
      } else {
        ctx.fillStyle = "#f4f4f4"; ctx.fillRect(ax - 3, ay - 5, 7, 6);
        ctx.fillStyle = npc.def.sprite.palette.a; ctx.fillRect(ax - 2, ay - 4, 5, 1); ctx.fillRect(ax - 2, ay - 2, 4, 1);
      }
      ctx.restore();
    }
    const distance = Math.hypot(npc.x - p.x, npc.y - p.y);
    if (npc.ambientOnly || distance > 44) return;

    const y = Math.round(npc.y - 18 + bob);
    ctx.save();
    ctx.fillStyle = "rgba(26,28,44,0.9)";
    ctx.fillRect(Math.round(npc.x - 5), y, 10, 8);
    ctx.fillStyle = npc.def.sprite.palette.a;
    ctx.font = "6px monospace";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.fillText("...", Math.round(npc.x), y);
    ctx.restore();
  };
})();
