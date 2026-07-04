/* ============================================================
   WORLD — maps, tiles, collision, doors, chests, signs.

   Maps are drawn with TEXT! Each character is one tile:

     registerMap({
       id: "overworld",
       tiles: [
         "tttttttt",
         "t..1...t",     // "." grass, "t" tree, "1" spawns a slime
         "tttttttt",
       ],
       legend: { "1": { tile: "grass", enemy: "slime" } },
       playerStart: { x: 2, y: 1 },
     })

   Built-in tile letters (work in every map):
     .  grass       t  tree (solid)     w  water (solid)
     p  path        #  wall (solid)     f  stone floor
     r  rock (solid)
   Anything else you define in the map's own legend.
   ============================================================ */

"use strict";

function registerMap(def) {
  if (!def.id) { console.error("A map needs an id!", def); return; }
  G.maps[def.id] = def;
}

G.world = (() => {
  const BASE_LEGEND = {
    ".": { tile: "grass" },
    "t": { tile: "tree" },
    "w": { tile: "water" },
    "p": { tile: "path" },
    "#": { tile: "wall" },
    "f": { tile: "floor" },
    "r": { tile: "rock" },
  };

  const SOLID = { tree: true, water: true, wall: true, rock: true };

  /* ---------- loading a map ---------- */
  function load(mapId, spawn) {
    const def = G.maps[mapId];
    if (!def) { console.error("No map called " + mapId); return; }

    const legend = Object.assign({}, BASE_LEGEND, def.legend || {});
    const rows = def.tiles;
    const h = rows.length;
    const w = Math.max(...rows.map((r) => r.length));

    const grid = [];      // grid[y][x] = legend cell for that tile
    const enemies = [];
    const chests = [];

    for (let y = 0; y < h; y++) {
      grid[y] = [];
      for (let x = 0; x < w; x++) {
        const ch = rows[y][x] || ".";
        let cell = legend[ch];
        if (!cell) {
          console.warn(`Map "${mapId}" uses unknown tile letter "${ch}" — treating as grass.`);
          cell = BASE_LEGEND["."];
        }
        grid[y][x] = cell;

        const cx = x * G.TILE + G.TILE / 2;
        const cy = y * G.TILE + G.TILE / 2;
        if (cell.enemy) enemies.push(G.makeEnemy(cell.enemy, cx, cy));
        if (cell.chest) {
          const key = `${mapId}:${x},${y}`;
          chests.push({ x, y, key, chest: cell.chest, opened: G.state.opened.includes(key) });
        }
      }
    }

    const s = G.state;
    s.mapId = mapId;
    s.mapDef = def;
    s.grid = grid;
    s.mapW = w;
    s.mapH = h;
    s.enemies = enemies;
    s.chests = chests;
    s.projectiles = [];
    s.pickups = [];
    G.fx.length = 0;

    const p = s.player;
    const at = spawn || def.playerStart || { x: 1, y: 1 };
    p.x = at.x * G.TILE + G.TILE / 2;
    p.y = at.y * G.TILE + G.TILE / 2;
    p.lastSafe = { x: p.x, y: p.y };
    s.entryPoint = { x: p.x, y: p.y };

    if (def.name) G.ui.toast("🗺 " + def.name);
    G.events.emit("mapEnter", { map: mapId });
  }

  /* ---------- collision ---------- */
  function cellAt(px, py) {
    const s = G.state;
    const tx = Math.floor(px / G.TILE);
    const ty = Math.floor(py / G.TILE);
    if (tx < 0 || ty < 0 || tx >= s.mapW || ty >= s.mapH) return BASE_LEGEND["t"]; // off-map = solid
    return s.grid[ty][tx];
  }

  function solid(px, py) {
    const cell = cellAt(px, py);
    // Doors: solid while locked, walkable once you have the stars —
    // even if the door is drawn on a normally-solid tile like a tree.
    if (cell.portal) return !!(cell.stars && G.state.stars < cell.stars);
    if (SOLID[cell.tile]) return true;
    return false;
  }

  // Move an entity (with a small feet-box) through the world, one
  // axis at a time so you slide along walls instead of sticking.
  function moveBox(e, dx, dy) {
    const hw = (e.boxW || 10) / 2;
    const bh = e.boxH || 8;
    function blocked(x, y) {
      return (
        solid(x - hw, y) || solid(x + hw, y) ||
        solid(x - hw, y - bh) || solid(x + hw, y - bh)
      );
    }
    if (dx !== 0 && !blocked(e.x + dx, e.y)) e.x += dx;
    if (dy !== 0 && !blocked(e.x, e.y + dy)) e.y += dy;
  }

  /* ---------- things you step on ---------- */
  let doorMsgCooldown = 0;

  function checkTriggers(dt) {
    const s = G.state;
    const p = s.player;
    const cell = cellAt(p.x, p.y);
    doorMsgCooldown = Math.max(0, doorMsgCooldown - dt);

    // Signs
    if (cell.message) {
      if (s.lastSign !== cell) {
        s.lastSign = cell;
        G.ui.toast("🪧 " + cell.message, 3.5);
        G.events.emit("sign", { message: cell.message });
      }
    } else {
      s.lastSign = null;
    }

    // Doors / portals
    if (cell.portal) {
      const need = cell.stars || 0;
      if (s.stars >= need) {
        G.sfx.play("door");
        load(cell.portal.map, { x: cell.portal.x, y: cell.portal.y });
        G.saveGame();
        return;
      } else if (doorMsgCooldown <= 0) {
        doorMsgCooldown = 2;
        G.ui.toast(`🔒 This door needs ${need} ⭐ — you have ${s.stars}. Finish quests to earn stars!`, 3);
      }
    }

    // Chests
    for (const ch of s.chests) {
      if (ch.opened) continue;
      const cx = ch.x * G.TILE + G.TILE / 2;
      const cy = ch.y * G.TILE + G.TILE / 2;
      if (G.util.dist(p.x, p.y, cx, cy) < 14) {
        ch.opened = true;
        s.opened.push(ch.key);
        G.sfx.play("unlock");
        G.spawnFx({ kind: "ring", x: cx, y: cy - 8, color: "#ffcd75", dur: 0.5 });
        if (ch.chest.item) {
          s.items.push(ch.chest.item);
          G.ui.toast("🎁 You found: " + (ch.chest.name || ch.chest.item) + "!", 3.5);
          G.events.emit("pickup", { item: ch.chest.item });
          G.checkUnlocks();
        }
        if (ch.chest.heal) {
          s.player.damageTaken = 0;
          G.ui.toast("🍪 " + (ch.chest.name || "A snack") + "! Fully healed!", 3);
        }
        G.saveGame();
      }
    }
  }

  /* ---------- drawing ----------
     Tiles are painted with code (no image files) so the whole
     game works from a single folder with zero downloads.      */
  function drawTile(ctx, cell, x, y, time) {
    const T = G.TILE;
    const px = x * T, py = y * T;
    const rnd = G.util.hash2(x, y);

    switch (cell.tile) {
      case "grass": {
        ctx.fillStyle = "#38b764";
        ctx.fillRect(px, py, T, T);
        if (rnd > 0.75) { // scattered tufts
          ctx.fillStyle = "#a7f070";
          const tx = px + 3 + Math.floor(rnd * 9);
          const ty = py + 3 + Math.floor(G.util.hash2(y, x) * 9);
          ctx.fillRect(tx, ty, 1, 2);
          ctx.fillRect(tx + 2, ty + 1, 1, 1);
        }
        break;
      }
      case "path": {
        ctx.fillStyle = "#d8b06a";
        ctx.fillRect(px, py, T, T);
        if (rnd > 0.7) {
          ctx.fillStyle = "#c09858";
          ctx.fillRect(px + Math.floor(rnd * 12), py + Math.floor(G.util.hash2(y, x) * 12), 2, 2);
        }
        break;
      }
      case "tree": {
        ctx.fillStyle = "#38b764";
        ctx.fillRect(px, py, T, T);
        ctx.fillStyle = "#6b4a2b"; // trunk
        ctx.fillRect(px + 6, py + 11, 4, 5);
        ctx.fillStyle = "#1e5f4e"; // canopy shadow (rounded blob)
        ctx.fillRect(px + 2, py + 3, 12, 9);
        ctx.fillRect(px + 4, py + 1, 8, 13);
        ctx.fillStyle = "#257179"; // canopy body
        ctx.fillRect(px + 3, py + 3, 10, 7);
        ctx.fillRect(px + 5, py + 1, 6, 11);
        ctx.fillStyle = "#2e9e6b"; // leafy highlight
        ctx.fillRect(px + 5, py + 2, 4, 2);
        ctx.fillRect(px + 4, py + 4, 2, 3);
        break;
      }
      case "water": {
        ctx.fillStyle = "#3b5dc9";
        ctx.fillRect(px, py, T, T);
        const wave = Math.floor((time * 2 + rnd * 4) % 4);
        if (rnd > 0.5) {
          ctx.fillStyle = "#41a6f6";
          ctx.fillRect(px + 2 + wave, py + 4 + Math.floor(rnd * 8), 4, 1);
        }
        break;
      }
      case "wall": {
        ctx.fillStyle = "#333c57";
        ctx.fillRect(px, py, T, T);
        ctx.fillStyle = "#1a1c2c"; // brick seams
        ctx.fillRect(px, py + 7, T, 1);
        ctx.fillRect(px + (y % 2 ? 4 : 10), py, 1, 7);
        ctx.fillRect(px + (y % 2 ? 10 : 4), py + 8, 1, 8);
        ctx.fillStyle = "#566c86"; // top highlight
        ctx.fillRect(px, py, T, 2);
        break;
      }
      case "floor": {
        ctx.fillStyle = "#566c86";
        ctx.fillRect(px, py, T, T);
        ctx.fillStyle = "#4a5b74";
        if ((x + y) % 2 === 0) ctx.fillRect(px, py, T, T);
        ctx.fillStyle = "#333c57";
        ctx.fillRect(px, py, T, 1);
        ctx.fillRect(px, py, 1, T);
        break;
      }
      case "rock": {
        ctx.fillStyle = cell.on === "floor" ? "#566c86" : "#38b764";
        ctx.fillRect(px, py, T, T);
        ctx.fillStyle = "#94b0c2";
        ctx.fillRect(px + 3, py + 5, 10, 9);
        ctx.fillRect(px + 5, py + 3, 6, 12);
        ctx.fillStyle = "#f4f4f4";
        ctx.fillRect(px + 5, py + 5, 3, 2);
        break;
      }
      default: {
        ctx.fillStyle = "#38b764";
        ctx.fillRect(px, py, T, T);
      }
    }

    /* extra decorations on top of the base tile */
    if (cell.portal) {
      const locked = cell.stars && G.state.stars < cell.stars;
      // dark doorway with a frame
      ctx.fillStyle = "#94b0c2";
      ctx.fillRect(px + 1, py, T - 2, T);
      ctx.fillStyle = locked ? "#1a1c2c" : "#5d275d";
      ctx.fillRect(px + 3, py + 3, T - 6, T - 3);
      if (locked) {
        ctx.fillStyle = "#ffcd75"; // little lock
        ctx.fillRect(px + 6, py + 8, 4, 4);
        ctx.fillRect(px + 7, py + 6, 2, 2);
      } else {
        const glow = 0.5 + 0.5 * Math.sin(time * 4);
        ctx.fillStyle = `rgba(129,83,193,${0.3 + glow * 0.3})`;
        ctx.fillRect(px + 4, py + 4, T - 8, T - 5);
      }
    }
    if (cell.message) { // signpost
      ctx.fillStyle = "#6b4a2b";
      ctx.fillRect(px + 7, py + 7, 2, 7);
      ctx.fillStyle = "#d8b06a";
      ctx.fillRect(px + 3, py + 3, 10, 6);
      ctx.fillStyle = "#6b4a2b";
      ctx.fillRect(px + 5, py + 5, 6, 1);
      ctx.fillRect(px + 5, py + 7, 4, 1);
    }
  }

  function drawChest(ctx, ch) {
    const T = G.TILE;
    const px = ch.x * T, py = ch.y * T;
    ctx.fillStyle = "#6b4a2b";
    ctx.fillRect(px + 2, py + 5, 12, 9);
    ctx.fillStyle = ch.opened ? "#1a1c2c" : "#8a6538";
    ctx.fillRect(px + 3, py + 6, 10, 3);
    ctx.fillStyle = "#ffcd75";
    ctx.fillRect(px + 7, py + 8, 2, 3);
    if (!ch.opened) {
      ctx.fillStyle = "#ffcd75";
      ctx.fillRect(px + 2, py + 9, 12, 1);
    }
  }

  function draw(ctx, cam, time) {
    const s = G.state;
    const T = G.TILE;
    const x0 = Math.max(0, Math.floor(cam.x / T));
    const y0 = Math.max(0, Math.floor(cam.y / T));
    const x1 = Math.min(s.mapW - 1, Math.ceil((cam.x + G.W) / T));
    const y1 = Math.min(s.mapH - 1, Math.ceil((cam.y + G.H) / T));
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++)
        drawTile(ctx, s.grid[y][x], x, y, time);
    for (const ch of s.chests) drawChest(ctx, ch);
  }

  return { load, solid, moveBox, checkTriggers, draw, cellAt };
})();
