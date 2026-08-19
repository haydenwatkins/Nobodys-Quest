/* ============================================================
   LIVING WORLD — harmless wildlife, restored landscapes, and
   the small unscripted motions that make a place feel inhabited.

   Nothing here affects combat or progression. Creatures regenerate on map
   entry, react to nearby movement, and stay deliberately inexpensive for
   mobile browsers.
   ============================================================ */

"use strict";

(function () {
  const SPECIES = {
    butterfly: { color: "#ffcd75", accent: "#d9a7ff", speed: 15, flying: true },
    bird: { color: "#f4f4f4", accent: "#94b0c2", speed: 22, flying: true },
    firefly: { color: "#fff3c2", accent: "#a7f070", speed: 9, flying: true },
    rabbit: { color: "#d8b06a", accent: "#f4f4f4", speed: 18, ground: true },
    frog: { color: "#73c26d", accent: "#a7f070", speed: 12, ground: true, hopping: true },
    dragonfly: { color: "#73eff7", accent: "#f4f4f4", speed: 20, flying: true },
    bat: { color: "#8153c1", accent: "#d9a7ff", speed: 20, flying: true },
    crab: { color: "#ef7d57", accent: "#ffcd75", speed: 10, ground: true },
    fish: { color: "#73eff7", accent: "#f4f4f4", speed: 13, aquatic: true },
    snowbird: { color: "#f4f4f4", accent: "#73eff7", speed: 19, flying: true },
    embermoth: { color: "#ef7d57", accent: "#ffcd75", speed: 13, flying: true },
    spirit: { color: "#fff3c2", accent: "#73eff7", speed: 11, flying: true },
  };

  const MAP_LIFE = {
    overworld: ["butterfly", "rabbit", "bird"],
    town: ["butterfly", "bird", "rabbit"],
    mistwood: ["firefly", "butterfly", "bird"],
    sunkenMarsh: ["frog", "dragonfly", "fish"],
    emberRidge: ["embermoth", "bird"],
    starfallRuins: ["spirit", "firefly"],
    "whispering-grove": ["firefly", "rabbit", "spirit"],
    shattercoast: ["bird", "crab", "dragonfly"],
    dungeon: ["bat", "firefly"],
  };

  const BIOME_LIFE = {
    sunstep: ["butterfly", "rabbit", "bird"],
    windscar: ["bird", "butterfly"],
    gardens: ["butterfly", "bird", "spirit"],
    rootdeep: ["firefly", "bat", "frog"],
    glasswater: ["dragonfly", "spirit", "bird"],
    frostbell: ["snowbird", "spirit"],
    stormspine: ["snowbird", "firefly", "spirit"],
    titan: ["spirit", "bird", "firefly"],
  };

  function lifeFor(mapId) {
    const map = G.maps[mapId] || {};
    if (MAP_LIFE[mapId]) return MAP_LIFE[mapId];
    if (BIOME_LIFE[map.biome]) return BIOME_LIFE[map.biome];
    if (map.visualTheme) return ["bat", "spirit"];
    return ["butterfly", "bird"];
  }

  const OLD_REGION_TROPHIES = {
    mistwood: "trophy-heartwood-crown",
    sunkenMarsh: "trophy-mire-pearl",
    emberRidge: "trophy-eclipse-sigil",
  };

  function regionRestored(mapId) {
    if (G.worldwakePurified && G.worldwakePurified(mapId)) return true;
    const trophy = OLD_REGION_TROPHIES[mapId];
    return !!(trophy && G.state && (G.state.items || []).includes(trophy));
  }

  function cellSupports(cell, species) {
    if (!cell || cell.portal || cell.chest || cell.message || cell.rest || cell.playerHouse || cell.townPlot) return false;
    if (species.aquatic) return cell.tile === "water";
    return cell.tile === "grass" || cell.tile === "path" || cell.tile === "floor";
  }

  function findHabitat(grid, w, h, species, seed) {
    const total = Math.max(1, w * h);
    let index = Math.floor(G.util.hash2(seed + 17, seed * 3 + 41) * total);
    for (let checked = 0; checked < total; checked++) {
      const x = index % w;
      const y = Math.floor(index / w);
      const cell = grid[y] && grid[y][x];
      if (x > 1 && y > 1 && x < w - 2 && y < h - 2 && cellSupports(cell, species)) return { x, y };
      index = (index + 37) % total;
    }
    return null;
  }

  function findHabitatNear(grid, w, h, species, entry, seed) {
    if (!entry) return null;
    const candidates = [];
    for (let y = Math.max(2, entry.y - 7); y <= Math.min(h - 3, entry.y + 7); y++) {
      for (let x = Math.max(2, entry.x - 7); x <= Math.min(w - 3, entry.x + 7); x++) {
        const cell = grid[y] && grid[y][x];
        if (cellSupports(cell, species)) candidates.push({ x, y });
      }
    }
    if (!candidates.length) return null;
    return candidates[Math.floor(G.util.hash2(seed + 47, seed + 89) * candidates.length)];
  }

  G.makeWildlife = function (mapId, grid, w, h, entry) {
    if (mapId === "playerHouse") return [];
    const map = G.maps[mapId] || {};
    const purified = regionRestored(mapId);
    const residentBonus = mapId === "town" && G.townVisibleResidentCount
      ? Math.floor(G.townVisibleResidentCount() / 4) : 0;
    const areaBonus = Math.min(16, Math.floor(w * h / 600));
    const desired = (map.visualTheme ? 4 : map.worldwake ? 7 : 6) + areaBonus +
      (purified ? 5 : 0) + residentBonus;
    const pool = lifeFor(mapId);
    const creatures = [];
    for (let i = 0; i < desired; i++) {
      const kind = pool[i % pool.length];
      const def = SPECIES[kind];
      const seed = i + mapId.length * 13;
      const tile = (i < 3 && findHabitatNear(grid, w, h, def, entry, seed)) ||
        findHabitat(grid, w, h, def, seed);
      if (!tile) continue;
      const jitterX = 3 + Math.floor(G.util.hash2(i + 3, mapId.length + 7) * 10);
      const jitterY = 3 + Math.floor(G.util.hash2(mapId.length + 11, i + 19) * 10);
      const x = tile.x * G.TILE + jitterX;
      const y = tile.y * G.TILE + jitterY;
      creatures.push({
        kind, def, x, y, homeX: x, homeY: y,
        vx: 0, vy: 0, phase: G.util.hash2(i + 71, mapId.length + 29) * Math.PI * 2,
        chooseT: 0.4 + G.util.hash2(i + 5, mapId.length + 31) * 2.4,
        fleeT: 0, facingLeft: i % 2 === 0,
        boxW: 4, boxH: 3,
      });
    }
    return creatures;
  };

  function canOccupy(creature, x, y) {
    const s = G.state;
    if (x < 3 || y < 3 || x >= s.mapW * G.TILE - 3 || y >= s.mapH * G.TILE - 3) return false;
    if (creature.def.flying) return true;
    const cell = G.world.cellAt(x, y);
    return cellSupports(cell, creature.def);
  }

  function chooseDirection(creature) {
    const homeAngle = Math.atan2(creature.homeY - creature.y, creature.homeX - creature.x);
    const farFromHome = Math.hypot(creature.x - creature.homeX, creature.y - creature.homeY) > 54;
    const angle = farFromHome ? homeAngle : Math.random() * Math.PI * 2;
    const speed = creature.def.speed * (0.35 + Math.random() * 0.35);
    creature.vx = Math.cos(angle) * speed;
    creature.vy = Math.sin(angle) * speed;
    creature.chooseT = 1.1 + Math.random() * 2.6;
  }

  function nearbyThreat(creature, player, projectiles) {
    const playerDistance = Math.hypot(player.x - creature.x, player.y - creature.y);
    if (playerDistance < (player.dashing ? 64 : 22)) return { x: player.x, y: player.y };
    return projectiles.find((shot) => shot.fromPlayer && Math.hypot(shot.x - creature.x, shot.y - creature.y) < 28) || null;
  }

  G.updateLivingWorld = function (dt) {
    const s = G.state;
    if (!s || !s.wildlife) return;
    const player = s.player;
    for (const creature of s.wildlife) {
      creature.phase += dt * (creature.fleeT > 0 ? 12 : 4);
      const threat = nearbyThreat(creature, player, s.projectiles || []);
      if (threat) {
        let dx = creature.x - threat.x;
        let dy = creature.y - threat.y;
        const length = Math.hypot(dx, dy) || 1;
        dx /= length; dy /= length;
        creature.vx = dx * creature.def.speed * 1.9;
        creature.vy = dy * creature.def.speed * 1.9;
        creature.fleeT = 1.15;
      }
      creature.fleeT = Math.max(0, creature.fleeT - dt);
      creature.chooseT -= dt;
      if (creature.chooseT <= 0 && creature.fleeT <= 0) chooseDirection(creature);

      const hop = creature.def.hopping ? Math.max(0.2, Math.abs(Math.sin(creature.phase))) : 1;
      const dx = creature.vx * dt * hop;
      const dy = creature.vy * dt * hop;
      const nx = creature.x + dx;
      const ny = creature.y + dy;
      if (canOccupy(creature, nx, ny)) {
        if (creature.def.ground) G.world.moveBox(creature, dx, dy);
        else { creature.x = nx; creature.y = ny; }
      } else {
        creature.vx *= -1;
        creature.vy *= -1;
        creature.chooseT = 0.2;
      }
      creature.facingLeft = creature.vx < 0;
      if (creature.fleeT <= 0) {
        creature.vx *= Math.pow(0.91, dt * 10);
        creature.vy *= Math.pow(0.91, dt * 10);
      }
    }
  };

  G.drawWildlife = function (ctx, creature) {
    const x = Math.round(creature.x);
    const bob = creature.def.aquatic ? 0 : Math.round(Math.sin(creature.phase) * (creature.def.flying ? 2 : 1));
    const y = Math.round(creature.y + bob);
    const flap = Math.sin(creature.phase * 1.7) > 0;
    ctx.save();
    if (creature.def.ground) {
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = "#1a1c2c";
      ctx.fillRect(x - 4, y + 2, 8, 2);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = creature.def.color;
    if (creature.kind === "butterfly" || creature.kind === "embermoth") {
      ctx.fillRect(x - (flap ? 4 : 3), y - 2, 3, 3); ctx.fillRect(x + 2, y - 2, 3, 3);
      ctx.fillStyle = creature.def.accent; ctx.fillRect(x, y - 1, 1, 3);
    } else if (creature.kind === "dragonfly") {
      ctx.fillStyle = creature.def.accent;
      ctx.fillRect(x - 4, y - (flap ? 3 : 2), 4, 2); ctx.fillRect(x + 1, y - (flap ? 3 : 2), 4, 2);
      ctx.fillStyle = creature.def.color; ctx.fillRect(x, y - 3, 1, 7); ctx.fillRect(x - 1, y - 3, 3, 2);
    } else if (creature.kind === "bird" || creature.kind === "snowbird") {
      ctx.fillRect(x - 3, y, 6, 2); ctx.fillRect(x - (flap ? 5 : 4), y - (flap ? 2 : 1), 3, 1);
      ctx.fillRect(x + 2, y - (flap ? 2 : 1), 3, 1);
      ctx.fillStyle = creature.def.accent; ctx.fillRect(creature.facingLeft ? x - 4 : x + 3, y, 2, 1);
    } else if (creature.kind === "firefly" || creature.kind === "spirit") {
      ctx.globalAlpha = 0.45 + Math.abs(Math.sin(creature.phase)) * 0.5;
      ctx.fillStyle = creature.def.accent; ctx.fillRect(x - 2, y - 2, 5, 5);
      ctx.globalAlpha = 1; ctx.fillStyle = creature.def.color; ctx.fillRect(x, y, 1, 2);
    } else if (creature.kind === "rabbit") {
      ctx.fillRect(x - 3, y - 2, 6, 4); ctx.fillRect(x + (creature.facingLeft ? -3 : 1), y - 5, 2, 4);
      ctx.fillStyle = creature.def.accent; ctx.fillRect(creature.facingLeft ? x + 3 : x - 4, y - 1, 2, 2);
    } else if (creature.kind === "frog") {
      ctx.fillRect(x - 3, y - 2, 7, 4); ctx.fillStyle = creature.def.accent;
      ctx.fillRect(x - 2, y - 3, 2, 2); ctx.fillRect(x + 2, y - 3, 2, 2);
    } else if (creature.kind === "bat") {
      ctx.fillRect(x - 1, y - 1, 3, 3);
      ctx.fillRect(x - (flap ? 5 : 4), y - (flap ? 2 : 0), 4, 2);
      ctx.fillRect(x + 2, y - (flap ? 2 : 0), 4, 2);
    } else if (creature.kind === "crab") {
      ctx.fillRect(x - 3, y - 2, 7, 4); ctx.fillRect(x - 5, y - 3, 2, 2); ctx.fillRect(x + 4, y - 3, 2, 2);
      ctx.fillStyle = creature.def.accent; ctx.fillRect(x - 2, y - 3, 1, 1); ctx.fillRect(x + 2, y - 3, 1, 1);
    } else if (creature.kind === "fish") {
      ctx.globalAlpha = 0.75; ctx.fillRect(x - 3, y - 1, 6, 2);
      ctx.fillRect(creature.facingLeft ? x + 3 : x - 4, y - 2, 2, 4);
      ctx.fillStyle = creature.def.accent; ctx.fillRect(creature.facingLeft ? x - 2 : x + 1, y - 1, 1, 1);
    } else {
      ctx.fillRect(x - 2, y - 2, 5, 4); ctx.fillStyle = creature.def.accent; ctx.fillRect(x, y - 3, 1, 2);
    }
    ctx.restore();
  };

  function findDetailSpot(grid, w, h, seed) {
    const total = Math.max(1, w * h);
    let index = Math.floor(G.util.hash2(seed + 101, seed * 5 + 17) * total);
    for (let checked = 0; checked < total; checked++) {
      const x = index % w;
      const y = Math.floor(index / w);
      const cell = grid[y] && grid[y][x];
      if (x > 1 && y > 1 && x < w - 2 && y < h - 2 && cell && !cell.portal && !cell.message &&
          (cell.tile === "grass" || cell.tile === "path")) return { x, y };
      index = (index + 29) % total;
    }
    return null;
  }

  G.makeRestorationDetails = function (mapId, grid, w, h) {
    if (!regionRestored(mapId)) return [];
    const details = [];
    for (let i = 0; i < 28; i++) {
      const tile = findDetailSpot(grid, w, h, i + mapId.length * 23);
      if (!tile) continue;
      details.push({
        x: tile.x * G.TILE + 3 + Math.floor(G.util.hash2(i + 7, 43) * 10),
        y: tile.y * G.TILE + 4 + Math.floor(G.util.hash2(59, i + 11) * 9),
        kind: i % 7 === 0 ? "lantern" : i % 3 === 0 ? "sprout" : "flower",
        color: i % 2 ? "#fff3c2" : "#a7f070",
      });
    }
    return details;
  };

  G.makeTownDecorations = function (grid, w, h) {
    if (!G.state.town || !G.state.town.founded) return [];
    const town = G.state.town;
    const projects = town.projects || {};
    const details = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const cell = grid[y] && grid[y][x];
      if (!cell || !cell.townPlot || !G.townHouseBuilt(cell.townPlot)) continue;
      const side = details.length % 2 ? 1 : -1;
      details.push({ kind: "mailbox", x: x * G.TILE + 8 + side * 10, y: y * G.TILE + 13 });
      details.push({ kind: "garden", x: x * G.TILE + 8 - side * 10, y: y * G.TILE + 13,
        color: details.length % 3 ? "#ffcd75" : "#d9a7ff" });
    }
    if (projects.welcomeLodge) {
      details.push({ kind: "sign", x: 17 * G.TILE, y: 4 * G.TILE, color: "#fff3c2" });
      details.push({ kind: "bench", x: 13 * G.TILE, y: 4 * G.TILE, color: "#8a6538" });
    }
    if (projects.buildersYard) {
      details.push({ kind: "crates", x: 9 * G.TILE, y: 5 * G.TILE, color: "#d9aa68" });
      details.push({ kind: "sign", x: 8 * G.TILE, y: 5 * G.TILE, color: "#ffcd75" });
    }
    if (projects.festivalStage)
      details.push({ kind: "stage", x: 15 * G.TILE, y: 8 * G.TILE, color: "#b13e53" });
    if (projects.lanternWalk) {
      for (let y = 5; y <= 15; y += 2) {
        details.push({ kind: "lantern", x: 13 * G.TILE, y: y * G.TILE, color: y % 4 ? "#73eff7" : "#ffcd75" });
        details.push({ kind: "lantern", x: 17 * G.TILE, y: y * G.TILE, color: y % 4 ? "#d9a7ff" : "#a7f070" });
      }
    }
    if (projects.hallOfForms) {
      details.push({ kind: "monument", x: 15 * G.TILE, y: 6 * G.TILE, color: "#73eff7" });
      details.push({ kind: "banner", x: 12 * G.TILE, y: 6 * G.TILE, color: "#ffcd75" });
      details.push({ kind: "banner", x: 18 * G.TILE, y: 6 * G.TILE, color: "#d9a7ff" });
    }
    const beautySpots = [
      ["garden", 10, 3], ["bench", 20, 4], ["lantern", 3, 9], ["banner", 26, 9],
      ["garden", 10, 9], ["bench", 20, 10], ["lantern", 8, 13], ["banner", 22, 13],
      ["garden", 11, 16], ["bench", 19, 16], ["lantern", 2, 16], ["banner", 27, 16],
    ];
    for (let i = 0; i < Math.min(town.beautifications || 0, beautySpots.length); i++) {
      const spot = beautySpots[i];
      details.push({ kind: spot[0], x: spot[1] * G.TILE, y: spot[2] * G.TILE,
        color: ["#ffcd75", "#73eff7", "#d9a7ff", "#a7f070"][i % 4] });
    }
    return details;
  };

  G.drawLivingWorldGround = function (ctx, cam, time) {
    const s = G.state;
    for (const detail of s.restorationDetails || []) {
      const x = Math.round(detail.x), y = Math.round(detail.y);
      if (x < cam.x - 8 || x > cam.x + G.W + 8 || y < cam.y - 8 || y > cam.y + G.H + 8) continue;
      if (detail.kind === "lantern") {
        ctx.fillStyle = "#6b4a2b"; ctx.fillRect(x, y - 5, 2, 7);
        ctx.globalAlpha = 0.35 + Math.sin(time * 3 + x) * 0.12;
        ctx.fillStyle = "#fff3c2"; ctx.fillRect(x - 2, y - 7, 6, 5); ctx.globalAlpha = 1;
        ctx.fillStyle = "#ffcd75"; ctx.fillRect(x, y - 6, 2, 3);
      } else if (detail.kind === "sprout") {
        ctx.fillStyle = "#1e5f4e"; ctx.fillRect(x, y - 2, 1, 4);
        ctx.fillStyle = "#a7f070"; ctx.fillRect(x - 2, y - 3, 2, 2); ctx.fillRect(x + 1, y - 4, 2, 2);
      } else {
        ctx.fillStyle = "#1e5f4e"; ctx.fillRect(x, y - 1, 1, 3);
        ctx.fillStyle = detail.color; ctx.fillRect(x - 1, y - 3, 3, 2);
      }
    }

    for (const detail of s.townDecorations || []) {
      const x = Math.round(detail.x), y = Math.round(detail.y);
      if (detail.kind === "mailbox") {
        ctx.fillStyle = "#6b4a2b"; ctx.fillRect(x, y - 5, 2, 7);
        ctx.fillStyle = "#b13e53"; ctx.fillRect(x - 2, y - 8, 7, 5);
        ctx.fillStyle = "#f4f4f4"; ctx.fillRect(x + 3, y - 7, 1, 2);
      } else if (detail.kind === "garden") {
        ctx.fillStyle = "#493829"; ctx.fillRect(x - 5, y - 2, 10, 3);
        ctx.fillStyle = detail.color; ctx.fillRect(x - 3, y - 4, 2, 2); ctx.fillRect(x + 1, y - 5, 2, 3);
        ctx.fillStyle = "#a7f070"; ctx.fillRect(x - 1, y - 3, 2, 2);
      } else if (detail.kind === "lantern") {
        ctx.fillStyle = "#493829"; ctx.fillRect(x - 1, y - 11, 2, 13); ctx.fillRect(x - 3, y - 11, 6, 2);
        ctx.globalAlpha = 0.35; ctx.fillStyle = detail.color; ctx.fillRect(x - 5, y - 10, 10, 9); ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff3c2"; ctx.fillRect(x - 2, y - 9, 5, 6); ctx.fillStyle = detail.color; ctx.fillRect(x - 1, y - 8, 3, 4);
      } else if (detail.kind === "sign") {
        ctx.fillStyle = "#6b4a2b"; ctx.fillRect(x - 1, y - 8, 2, 10); ctx.fillRect(x - 7, y - 11, 14, 7);
        ctx.fillStyle = detail.color; ctx.fillRect(x - 5, y - 9, 10, 2);
      } else if (detail.kind === "bench") {
        ctx.fillStyle = "#493829"; ctx.fillRect(x - 8, y - 5, 16, 3); ctx.fillRect(x - 7, y - 1, 14, 2);
        ctx.fillRect(x - 6, y + 1, 2, 3); ctx.fillRect(x + 4, y + 1, 2, 3);
        ctx.fillStyle = detail.color; ctx.fillRect(x - 7, y - 4, 14, 1);
      } else if (detail.kind === "crates") {
        ctx.fillStyle = "#6b4a2b"; ctx.fillRect(x - 8, y - 9, 10, 10); ctx.fillRect(x + 2, y - 6, 8, 7);
        ctx.fillStyle = detail.color; ctx.fillRect(x - 6, y - 7, 6, 1); ctx.fillRect(x - 6, y - 3, 6, 1); ctx.fillRect(x + 4, y - 4, 4, 1);
      } else if (detail.kind === "stage") {
        ctx.fillStyle = "#493829"; ctx.fillRect(x - 24, y - 6, 48, 8); ctx.fillRect(x - 22, y + 2, 4, 4); ctx.fillRect(x + 18, y + 2, 4, 4);
        ctx.fillStyle = detail.color; ctx.fillRect(x - 23, y - 8, 46, 3);
        ctx.fillStyle = "#ffcd75"; for (let i = -18; i <= 18; i += 9) ctx.fillRect(x + i, y - 7, 3, 2);
      } else if (detail.kind === "banner") {
        ctx.fillStyle = "#493829"; ctx.fillRect(x - 1, y - 14, 2, 16); ctx.fillRect(x - 2, y - 14, 7, 2);
        ctx.fillStyle = detail.color; ctx.fillRect(x + 1, y - 12, 7, 8); ctx.fillStyle = "#fff3c2"; ctx.fillRect(x + 3, y - 10, 3, 3);
      } else if (detail.kind === "monument") {
        ctx.fillStyle = "#566c86"; ctx.fillRect(x - 10, y - 5, 20, 6); ctx.fillRect(x - 7, y - 10, 14, 5);
        ctx.fillStyle = "#94b0c2"; ctx.fillRect(x - 4, y - 17, 8, 8); ctx.fillRect(x - 7, y - 14, 14, 3);
        ctx.fillStyle = detail.color; ctx.fillRect(x - 1, y - 15, 3, 3);
      }
    }

    if (s.mapId === "town" && G.townFestivalActive && G.townFestivalActive()) {
      const worldWidth = s.mapW * G.TILE;
      ctx.fillStyle = "#6b4a2b";
      ctx.fillRect(3 * G.TILE, 7 * G.TILE, worldWidth - 6 * G.TILE, 1);
      const colors = ["#ffcd75", "#73eff7", "#b13e53", "#a7f070", "#d9a7ff"];
      for (let i = 0; i < 24; i++) {
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(3 * G.TILE + i * Math.floor((worldWidth - 6 * G.TILE) / 24), 7 * G.TILE + 1, 4, 4);
      }
      if (!G.reducedMotion) for (let i = 0; i < 18; i++) {
        const x = Math.round((G.util.hash2(i + 31, 17) * worldWidth + time * (4 + i % 3)) % worldWidth);
        const y = Math.round((G.util.hash2(11, i + 73) * s.mapH * G.TILE + time * 6) % (s.mapH * G.TILE));
        ctx.fillStyle = colors[i % colors.length]; ctx.fillRect(x, y, 2, 2);
      }
    }
  };
})();
