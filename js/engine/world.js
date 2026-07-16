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

  function portalMasteryMet(cell) {
    if (!cell.mastery) return true;
    const end = cell.mastery.before ? G.formOrder.indexOf(cell.mastery.before) : G.formOrder.length;
    return G.formOrder.slice(0, end < 0 ? G.formOrder.length : end).every((id) => {
      const form = G.forms[id];
      return !form || form.invalid || G.formLevel(id) >= cell.mastery.level;
    });
  }

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
    s.bossCutscene = null;
    // A quick world-only fade makes doors feel intentional without delaying
    // control or covering the HTML HUD. Reduced-motion players skip it.
    s.mapReveal = G.reducedMotion ? 0 : 0.32;
    G.fx.length = 0;

    const p = s.player;
    const at = spawn || def.playerStart || { x: 1, y: 1 };
    p.x = at.x * G.TILE + G.TILE / 2;
    p.y = at.y * G.TILE + G.TILE / 2;
    p.dashing = null;
    p.lastSafe = { x: p.x, y: p.y };
    s.entryPoint = { x: p.x, y: p.y };
    // Do not let a held stick/key carry straight back through an arrival
    // portal. Requiring one neutral input is reliable for touch and keyboard.
    s.portalNeedsRelease = true;
    s.portalGrace = 0.35;

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
    if (cell.portal) return !!((cell.stars && G.state.stars < cell.stars) || !portalMasteryMet(cell));
    if (SOLID[cell.tile]) return true;
    return false;
  }

  function isSafeSpawn(px, py) {
    const cell = cellAt(px, py);
    if (!cell || cell.portal || SOLID[cell.tile]) return false;
    return !solid(px, py);
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
    s.portalGrace = Math.max(0, (s.portalGrace || 0) - dt);
    const move = G.input.vec;
    if (s.portalNeedsRelease && !p.dashing && Math.abs(move.x) < 0.08 && Math.abs(move.y) < 0.08)
      s.portalNeedsRelease = false;

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

    // Town house plots
    if (cell.townPlot && G.tryBuildTownHouse) {
      if (s.lastTownPlot !== cell.townPlot) {
        s.lastTownPlot = cell.townPlot;
        G.tryBuildTownHouse(cell.townPlot);
      }
    } else {
      s.lastTownPlot = null;
    }

    // Rest spots restore you once when you step onto them.
    if (cell.rest) {
      if (s.lastRest !== cell) {
        s.lastRest = cell;
        p.damageTaken = 0;
        p.mana = p.manaMax;
        G.sfx.play("pickup");
        G.spawnFx({ kind: "ring", x: p.x, y: p.y - 8, color: "#a7f070", dur: 0.55 });
        G.ui.toast(cell.restText || "Rested up. HP and mana restored.", 2.5);
        G.saveGame();
      }
    } else {
      s.lastRest = null;
    }

    // Doors / portals
    if (cell.portal) {
      const need = cell.stars || 0;
      const masteryReady = portalMasteryMet(cell);
      if (s.stars >= need && masteryReady && !s.portalNeedsRelease && s.portalGrace <= 0) {
        G.sfx.play("door");
        load(cell.portal.map, { x: cell.portal.x, y: cell.portal.y });
        G.saveGame();
        return;
      } else if (s.stars < need && doorMsgCooldown <= 0) {
        doorMsgCooldown = 2;
        G.ui.toast(`🔒 This door needs ${need} ⭐ — you have ${s.stars}. Finish quests to earn stars!`, 3);
      } else if (!masteryReady && doorMsgCooldown <= 0) {
        doorMsgCooldown = 2;
        G.ui.toast(`🔒 Final trial: every earlier form must reach level ${cell.mastery.level}.`, 3);
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
  function groundColor(kind, x, y) {
    // Staggered 4x4/5x4 regions read as broad natural patches instead of a
    // checkerboard. Their subtle contrast gives motion a reference point.
    const patchX = Math.floor((x + (Math.floor(y / 4) % 2) * 2) / 5);
    const patchY = Math.floor(y / 4);
    const patch = G.util.hash2(patchX + 71, patchY + 43);
    if (kind === "path") return patch < 0.3 ? "#cfaa66" : patch > 0.76 ? "#e0b874" : "#d8b06a";
    if (kind === "floor") return patch < 0.3 ? "#4f627c" : patch > 0.76 ? "#60738d" : "#566c86";
    return patch < 0.27 ? "#31ad60" : patch > 0.78 ? "#42bd6a" : "#38b764";
  }

  const TRIAL_TILE_PALETTES = {
    riftblade: {
      floor: ["#494f76", "#525b83", "#45486d"], wall: "#292746", seam: "#17182b", accent: "#73eff7",
    },
    mole: {
      floor: ["#695b4d", "#756553", "#5e5147"], wall: "#493627", seam: "#2d211c", accent: "#d8b06a",
    },
    vampire: {
      floor: ["#4b3b56", "#55415d", "#403549"], wall: "#2d1b2e", seam: "#1a1c2c", accent: "#b13e53",
    },
    jester: {
      floor: ["#4b5c82", "#56698e", "#514d79"], wall: "#302d57", seam: "#1a1c2c", accent: "#ffcd75",
    },
    god: {
      floor: ["#69738b", "#768198", "#606980"], wall: "#474e66", seam: "#292d43", accent: "#fff3c2",
    },
  };

  function trialTilePalette() {
    const theme = G.state.mapDef && G.state.mapDef.visualTheme;
    if (!theme) return null;
    return TRIAL_TILE_PALETTES[theme] || TRIAL_TILE_PALETTES.riftblade;
  }

  function trialFloorColor(palette, x, y) {
    const patch = G.util.hash2(Math.floor(x / 4) + 19, Math.floor(y / 3) + 31);
    return palette.floor[patch < 0.28 ? 0 : patch > 0.76 ? 2 : 1];
  }

  function drawTile(ctx, cell, x, y, time) {
    const T = G.TILE;
    const px = x * T, py = y * T;
    const rnd = G.util.hash2(x, y);

    switch (cell.tile) {
      case "grass": {
        ctx.fillStyle = groundColor("grass", x, y);
        ctx.fillRect(px, py, T, T);
        if (rnd > 0.75) { // scattered tufts
          ctx.fillStyle = "#a7f070";
          const tx = px + 3 + Math.floor(rnd * 9);
          const ty = py + 3 + Math.floor(G.util.hash2(y, x) * 9);
          ctx.fillRect(tx, ty, 1, 2);
          ctx.fillRect(tx + 2, ty + 1, 1, 1);
        }
        if (rnd > 0.945) { // rare flowers make large fields easier to read
          const fx = px + 5 + Math.floor(G.util.hash2(x + 9, y) * 6);
          const fy = py + 5 + Math.floor(G.util.hash2(x, y + 11) * 6);
          ctx.fillStyle = rnd > 0.975 ? "#ffcd75" : "#f4f4f4";
          ctx.fillRect(fx - 1, fy, 3, 1);
          ctx.fillRect(fx, fy - 1, 1, 3);
          ctx.fillStyle = "#1e5f4e";
          ctx.fillRect(fx, fy + 2, 1, 2);
        }
        break;
      }
      case "path": {
        ctx.fillStyle = groundColor("path", x, y);
        ctx.fillRect(px, py, T, T);
        if (rnd > 0.7) {
          ctx.fillStyle = "#c09858";
          ctx.fillRect(px + Math.floor(rnd * 12), py + Math.floor(G.util.hash2(y, x) * 12), 2, 2);
        }
        break;
      }
      case "tree": {
        ctx.fillStyle = groundColor("grass", x, y);
        ctx.fillRect(px, py, T, T);
        ctx.fillStyle = "rgba(26,28,44,0.28)";
        ctx.fillRect(px + 2, py + 12, 13, 3);
        ctx.fillRect(px + 5, py + 14, 8, 2);
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
        if (rnd > 0.62) {
          ctx.fillStyle = "#38b764";
          ctx.fillRect(px + 9, py + 5, 2, 2);
          ctx.fillStyle = rnd > 0.86 ? "#ffcd75" : "#a7f070";
          ctx.fillRect(px + 11, py + 8, 1, 1);
        }
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
        if (rnd < 0.28) {
          ctx.fillStyle = "#5fcde4";
          ctx.fillRect(px + 9 - wave, py + 11, 3, 1);
        }
        break;
      }
      case "wall": {
        const trial = trialTilePalette();
        ctx.fillStyle = trial ? trial.wall : "#333c57";
        ctx.fillRect(px, py, T, T);
        ctx.fillStyle = trial ? trial.seam : "#1a1c2c"; // brick seams
        ctx.fillRect(px, py + 7, T, 1);
        ctx.fillRect(px + (y % 2 ? 4 : 10), py, 1, 7);
        ctx.fillRect(px + (y % 2 ? 10 : 4), py + 8, 1, 8);
        ctx.fillStyle = trial ? trial.accent : "#566c86"; // top highlight
        if (trial) ctx.globalAlpha = 0.48;
        ctx.fillRect(px, py, T, 2);
        ctx.globalAlpha = 1;
        if (rnd > 0.78) {
          ctx.fillStyle = "#94b0c2";
          ctx.fillRect(px + 3, py + 3, 3, 1);
          ctx.fillStyle = "#1a1c2c";
          ctx.fillRect(px + 9, py + 11, 3, 1);
        }
        break;
      }
      case "floor": {
        const trial = trialTilePalette();
        ctx.fillStyle = trial ? trialFloorColor(trial, x, y) : groundColor("floor", x, y);
        ctx.fillRect(px, py, T, T);
        ctx.fillStyle = trial ? trial.seam : "#333c57";
        ctx.fillRect(px, py, T, 1);
        ctx.fillRect(px, py, 1, T);
        if (rnd > 0.82) {
          ctx.fillStyle = "rgba(148,176,194,0.35)";
          ctx.fillRect(px + 5, py + 5, 3, 1);
          ctx.fillRect(px + 8, py + 6, 1, 2);
        }
        break;
      }
      case "rock": {
        const trial = cell.on === "floor" ? trialTilePalette() : null;
        ctx.fillStyle = trial ? trialFloorColor(trial, x, y) : groundColor(cell.on === "floor" ? "floor" : "grass", x, y);
        ctx.fillRect(px, py, T, T);
        ctx.fillStyle = "rgba(26,28,44,0.32)";
        ctx.fillRect(px + 3, py + 11, 11, 4);
        ctx.fillStyle = "#94b0c2";
        ctx.fillRect(px + 3, py + 5, 10, 9);
        ctx.fillRect(px + 5, py + 3, 6, 12);
        ctx.fillStyle = "#f4f4f4";
        ctx.fillRect(px + 5, py + 5, 3, 2);
        ctx.fillStyle = "#566c86";
        ctx.fillRect(px + 10, py + 10, 2, 3);
        break;
      }
      default: {
        ctx.fillStyle = groundColor("grass", x, y);
        ctx.fillRect(px, py, T, T);
      }
    }

    drawTerrainEdges(ctx, cell, x, y);

    /* extra decorations on top of the base tile */
    if (cell.portal) {
      const locked = (cell.stars && G.state.stars < cell.stars) || !portalMasteryMet(cell);
      if (cell.portalStyle === "trial") {
        const glow = 0.45 + 0.25 * Math.sin(time * 4);
        ctx.fillStyle = "#1a1c2c";
        ctx.fillRect(px + 2, py + 2, T - 4, T - 2);
        ctx.fillStyle = locked ? "#6b4a2b" : `rgba(115,239,247,${glow})`;
        ctx.fillRect(px + 4, py + 4, T - 8, T - 4);
      } else if (cell.portalStyle === "gap") {
        ctx.fillStyle = "#d8b06a";
        ctx.fillRect(px + 2, py + 6, T - 4, 4);
        ctx.fillStyle = locked ? "#6b4a2b" : "#ffcd75";
        ctx.fillRect(px + 3, py + 9, T - 6, 2);
        if (locked) {
          ctx.fillStyle = "#1a1c2c";
          ctx.fillRect(px + 6, py + 5, 4, 6);
          ctx.fillStyle = "#ffcd75";
          ctx.fillRect(px + 7, py + 7, 2, 2);
        } else {
          ctx.fillStyle = "rgba(255,205,117,0.45)";
          ctx.fillRect(px + 5, py + 5, T - 10, 6);
        }
      } else {
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
    if (cell.townPlot) {
      const built = G.townHouseBuilt && G.townHouseBuilt(cell.townPlot);
      if (built) {
        ctx.fillStyle = "#6b4a2b";
        ctx.fillRect(px - 3, py + 7, T + 6, 9);
        ctx.fillStyle = "#8a6538";
        ctx.fillRect(px - 1, py + 9, T + 2, 7);
        ctx.fillStyle = "#b13e53";
        ctx.fillRect(px - 5, py + 4, T + 10, 4);
        ctx.fillRect(px - 2, py + 2, T + 4, 3);
        ctx.fillStyle = "#ffcd75";
        ctx.fillRect(px + 5, py + 11, 5, 5);
        ctx.fillStyle = "#f4f4f4";
        ctx.fillRect(px + 1, py + 9, 3, 3);
        ctx.fillRect(px + 12, py + 9, 3, 3);
        ctx.fillStyle = "#1a1c2c";
        ctx.fillRect(px + 7, py + 13, 1, 3);
      } else {
        ctx.fillStyle = "#d8b06a";
        ctx.fillRect(px + 3, py + 4, 10, 9);
        ctx.fillStyle = "#6b4a2b";
        ctx.fillRect(px + 3, py + 4, 10, 1);
        ctx.fillRect(px + 3, py + 12, 10, 1);
        ctx.fillRect(px + 3, py + 4, 1, 9);
        ctx.fillRect(px + 12, py + 4, 1, 9);
      }
    }
  }

  function neighborTile(x, y) {
    const s = G.state;
    if (y < 0 || x < 0 || y >= s.mapH || x >= s.mapW) return null;
    return s.grid[y][x].tile;
  }

  // One-pixel borders make terrain shapes legible while leaving the tile map,
  // collision, and navigation data completely untouched.
  function drawTerrainEdges(ctx, cell, x, y) {
    const T = G.TILE;
    const px = x * T, py = y * T;
    if (cell.tile === "water") {
      ctx.fillStyle = "#73eff7";
      if (neighborTile(x, y - 1) !== "water") ctx.fillRect(px, py, T, 1);
      if (neighborTile(x - 1, y) !== "water") ctx.fillRect(px, py, 1, T);
      ctx.fillStyle = "#293a9b";
      if (neighborTile(x, y + 1) !== "water") ctx.fillRect(px, py + T - 1, T, 1);
      if (neighborTile(x + 1, y) !== "water") ctx.fillRect(px + T - 1, py, 1, T);
    } else if (cell.tile === "path") {
      ctx.fillStyle = "#b8874d";
      if (neighborTile(x, y - 1) === "grass") ctx.fillRect(px, py, T, 1);
      if (neighborTile(x - 1, y) === "grass") ctx.fillRect(px, py, 1, T);
      if (neighborTile(x, y + 1) === "grass") ctx.fillRect(px, py + T - 1, T, 1);
      if (neighborTile(x + 1, y) === "grass") ctx.fillRect(px + T - 1, py, 1, T);
    } else if (cell.tile === "floor") {
      ctx.fillStyle = "rgba(26,28,44,0.55)";
      if (neighborTile(x, y - 1) === "wall") ctx.fillRect(px, py, T, 2);
      if (neighborTile(x - 1, y) === "wall") ctx.fillRect(px, py, 2, T);
    }
  }

  // Each form trial has a low-contrast floor crest. It is purely decorative:
  // arenas keep exactly the same tiles, rocks, spawns, and collision.
  function drawTrialFloor(ctx, time) {
    const s = G.state;
    const theme = s.mapDef && s.mapDef.visualTheme;
    if (!theme) return;
    const styles = {
      riftblade: { dark: "#3b2f73", light: "#73eff7" },
      mole: { dark: "#6b4a2b", light: "#ffcd75" },
      vampire: { dark: "#2d1b2e", light: "#b13e53" },
      jester: { dark: "#3b5dc9", light: "#ffcd75" },
      god: { dark: "#8153c1", light: "#fff3c2" },
    };
    const style = styles[theme] || styles.riftblade;
    const cx = Math.floor(s.mapW * G.TILE / 2);
    const cy = Math.floor(s.mapH * G.TILE / 2);
    const pulse = 0.16 + Math.sin(time * 2.2) * 0.035;

    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = style.dark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 66, 0, Math.PI * 2);
    ctx.arc(cx, cy, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = style.light;
    ctx.lineWidth = 1;

    if (theme === "mole") {
      ctx.beginPath();
      ctx.moveTo(cx - 48, cy + 20); ctx.lineTo(cx - 22, cy - 12); ctx.lineTo(cx, cy + 8);
      ctx.lineTo(cx + 25, cy - 18); ctx.lineTo(cx + 52, cy + 17); ctx.stroke();
      ctx.fillStyle = style.light;
      ctx.fillRect(cx - 13, cy - 35, 7, 5); ctx.fillRect(cx - 3, cy - 41, 7, 11);
      ctx.fillRect(cx + 7, cy - 35, 7, 5); ctx.fillRect(cx - 13, cy - 30, 27, 3);
    } else if (theme === "vampire") {
      ctx.beginPath();
      ctx.arc(cx, cy, 28, Math.PI * 0.2, Math.PI * 1.8);
      ctx.moveTo(cx - 56, cy); ctx.lineTo(cx + 56, cy);
      ctx.moveTo(cx, cy - 56); ctx.lineTo(cx, cy + 56); ctx.stroke();
      ctx.fillStyle = style.dark;
      ctx.fillRect(cx - 7, cy - 7, 14, 14);
      ctx.fillStyle = style.light;
      ctx.fillRect(cx - 2, cy - 8, 4, 16); ctx.fillRect(cx - 8, cy - 2, 16, 4);
    } else if (theme === "jester") {
      ctx.fillStyle = style.light;
      for (let i = -3; i <= 3; i++) {
        const x = cx + i * 18;
        ctx.save(); ctx.translate(x, cy); ctx.rotate(Math.PI / 4);
        ctx.fillRect(-4, -4, 8, 8); ctx.restore();
      }
      ctx.fillStyle = style.dark;
      for (let i = -2; i <= 2; i++) {
        const y = cy + i * 18;
        ctx.save(); ctx.translate(cx, y); ctx.rotate(Math.PI / 4);
        ctx.fillRect(-3, -3, 6, 6); ctx.restore();
      }
    } else if (theme === "god") {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        ctx.moveTo(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18);
        ctx.lineTo(cx + Math.cos(a) * 62, cy + Math.sin(a) * 62);
      }
      ctx.stroke();
      ctx.fillStyle = style.light;
      ctx.fillRect(cx - 3, cy - 12, 6, 24); ctx.fillRect(cx - 12, cy - 3, 24, 6);
    } else {
      ctx.beginPath();
      ctx.moveTo(cx - 58, cy + 30); ctx.lineTo(cx - 14, cy - 23);
      ctx.lineTo(cx + 3, cy - 8); ctx.lineTo(cx + 55, cy - 35);
      ctx.moveTo(cx - 42, cy - 33); ctx.lineTo(cx - 5, cy + 11);
      ctx.lineTo(cx + 16, cy - 6); ctx.lineTo(cx + 48, cy + 33); ctx.stroke();
    }
    ctx.restore();
  }

  function drawAmbientDetails(ctx, cam, time) {
    if (G.reducedMotion) return;
    const s = G.state;
    const theme = s.mapDef && s.mapDef.visualTheme;
    const color = theme === "vampire" ? "#b13e53" : theme === "mole" ? "#ffcd75" :
      theme === "jester" ? "#73eff7" : theme === "god" ? "#fff3c2" : "#a7f070";
    ctx.save();
    ctx.globalAlpha = theme ? 0.45 : 0.22;
    ctx.fillStyle = color;
    for (let i = 0; i < 7; i++) {
      const seedX = G.util.hash2(i + 91, s.mapW) * Math.max(G.W, s.mapW * G.TILE);
      const seedY = G.util.hash2(s.mapH, i + 37) * Math.max(G.H, s.mapH * G.TILE);
      const drift = theme ? Math.sin(time * (0.35 + i * 0.03) + i) * 10 : time * (2 + i * 0.2);
      const x = Math.round((seedX + drift) % (s.mapW * G.TILE));
      const y = Math.round((seedY - drift * 0.5 + s.mapH * G.TILE) % (s.mapH * G.TILE));
      if (x < cam.x - 2 || x > cam.x + G.W + 2 || y < cam.y - 2 || y > cam.y + G.H + 2) continue;
      ctx.fillRect(x, y, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
    }
    ctx.restore();
  }

  function drawChest(ctx, ch, time) {
    const T = G.TILE;
    const px = ch.x * T, py = ch.y * T;
    ctx.fillStyle = "rgba(26,28,44,0.35)";
    ctx.fillRect(px + 1, py + 12, 14, 3);
    ctx.fillStyle = "#6b4a2b";
    ctx.fillRect(px + 2, py + 5, 12, 9);
    ctx.fillStyle = ch.opened ? "#1a1c2c" : "#8a6538";
    ctx.fillRect(px + 3, py + 6, 10, 3);
    ctx.fillStyle = "#ffcd75";
    ctx.fillRect(px + 7, py + 8, 2, 3);
    if (!ch.opened) {
      ctx.fillStyle = "#ffcd75";
      ctx.fillRect(px + 2, py + 9, 12, 1);
      if (Math.sin(time * 3 + ch.x) > 0.72) {
        ctx.fillStyle = "#fff3c2";
        ctx.fillRect(px + 11, py + 6, 2, 1);
        ctx.fillRect(px + 12, py + 5, 1, 3);
      }
    }
  }

  // Trial portals are landmarks rather than anonymous doors. Each theme uses
  // a tiny code-drawn facade so new trials only need a portalTheme in maps.js.
  function drawTrialLandmark(ctx, cell, x, y, time) {
    if (cell.portalStyle !== "trial") return;
    const T = G.TILE;
    const inwardX = x === 0 ? 8 : x === G.state.mapW - 1 ? -8 : 0;
    const inwardY = y === 0 ? 8 : y === G.state.mapH - 1 ? -8 : 0;
    const cx = x * T + T / 2 + inwardX;
    const cy = y * T + T / 2 + inwardY;
    const locked = (cell.stars && G.state.stars < cell.stars) || !portalMasteryMet(cell);
    const pulse = 0.55 + Math.sin(time * 4) * 0.18;

    ctx.save();
    ctx.globalAlpha = locked ? 0.62 : 1;
    ctx.fillStyle = "rgba(26,28,44,0.35)";
    ctx.fillRect(cx - 22, cy + 9, 44, 5);

    if (cell.portalTheme === "mole") {
      ctx.fillStyle = "#6b4a2b";
      ctx.fillRect(cx - 22, cy - 2, 44, 14);
      ctx.fillRect(cx - 16, cy - 8, 32, 20);
      ctx.fillStyle = "#8a6538";
      ctx.fillRect(cx - 18, cy - 5, 36, 5);
      ctx.fillStyle = "#1a1c2c";
      ctx.fillRect(cx - 7, cy, 14, 13);
      ctx.fillStyle = "#ffcd75";
      ctx.fillRect(cx - 8, cy - 13, 4, 5);
      ctx.fillRect(cx - 2, cy - 16, 4, 8);
      ctx.fillRect(cx + 4, cy - 13, 4, 5);
      ctx.fillRect(cx - 8, cy - 9, 16, 3);
    } else if (cell.portalTheme === "vampire") {
      ctx.fillStyle = "#2d1b2e";
      ctx.fillRect(cx - 19, cy - 14, 7, 28);
      ctx.fillRect(cx + 12, cy - 14, 7, 28);
      ctx.fillStyle = "#5d275d";
      ctx.fillRect(cx - 16, cy - 18, 32, 5);
      ctx.fillRect(cx - 12, cy - 22, 24, 5);
      ctx.fillStyle = "#1a1c2c";
      ctx.fillRect(cx - 9, cy - 12, 18, 26);
      ctx.fillStyle = "#b13e53";
      ctx.fillRect(cx - 3, cy - 17, 6, 6);
      ctx.fillRect(cx - 14, cy - 20, 3, 3);
      ctx.fillRect(cx + 11, cy - 20, 3, 3);
    } else if (cell.portalTheme === "jester") {
      ctx.fillStyle = "#b13e53";
      ctx.fillRect(cx - 20, cy - 12, 40, 7);
      ctx.fillRect(cx - 16, cy - 5, 7, 19);
      ctx.fillStyle = "#3b5dc9";
      ctx.fillRect(cx - 6, cy - 12, 12, 7);
      ctx.fillRect(cx + 9, cy - 5, 7, 19);
      ctx.fillStyle = "#1a1c2c";
      ctx.fillRect(cx - 8, cy - 4, 16, 18);
      ctx.fillStyle = "#ffcd75";
      ctx.fillRect(cx - 20, cy - 16, 4, 4);
      ctx.fillRect(cx - 2, cy - 18, 4, 4);
      ctx.fillRect(cx + 16, cy - 16, 4, 4);
      ctx.fillRect(cx - 18, cy - 7, 36, 2);
    } else if (cell.portalTheme === "god") {
      ctx.fillStyle = "#f4f4f4";
      ctx.fillRect(cx - 20, cy - 14, 6, 28);
      ctx.fillRect(cx + 14, cy - 14, 6, 28);
      ctx.fillRect(cx - 20, cy - 16, 40, 4);
      ctx.fillStyle = "#1a1c2c";
      ctx.fillRect(cx - 9, cy - 10, 18, 24);
      ctx.strokeStyle = `rgba(255,205,117,${pulse})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy - 18, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#ffcd75";
      ctx.fillRect(cx - 1, cy - 23, 3, 11);
      ctx.fillRect(cx - 5, cy - 19, 11, 3);
    } else {
      // Riftblade's split crystal gate is the default trial facade.
      ctx.fillStyle = "#3b2f73";
      ctx.fillRect(cx - 20, cy - 10, 7, 24);
      ctx.fillRect(cx + 13, cy - 10, 7, 24);
      ctx.fillStyle = "#73eff7";
      ctx.fillRect(cx - 18, cy - 17, 4, 12);
      ctx.fillRect(cx + 14, cy - 17, 4, 12);
      ctx.fillStyle = "#1a1c2c";
      ctx.fillRect(cx - 9, cy - 8, 18, 22);
      ctx.strokeStyle = `rgba(115,239,247,${pulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 11, cy + 8);
      ctx.lineTo(cx + 10, cy - 10);
      ctx.stroke();
    }

    if (locked) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#1a1c2c";
      ctx.fillRect(cx - 5, cy + 1, 10, 10);
      ctx.fillStyle = "#ffcd75";
      ctx.fillRect(cx - 3, cy + 4, 6, 6);
      ctx.fillRect(cx - 2, cy + 1, 4, 4);
    }
    ctx.restore();
  }

  function drawPlayerHouse(ctx) {
    const s = G.state;
    if (!s.grid) return;
    let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
    for (let y = 0; y < s.mapH; y++) {
      for (let x = 0; x < s.mapW; x++) {
        if (!s.grid[y][x].playerHouse) continue;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
    if (maxX < 0) return;

    const T = G.TILE;
    const px = minX * T;
    const py = minY * T;
    const w = (maxX - minX + 1) * T;
    const h = (maxY - minY + 1) * T;

    ctx.fillStyle = "#6b4a2b";
    ctx.fillRect(px + 3, py + 11, w - 6, h + 5);
    ctx.fillStyle = "#8a6538";
    ctx.fillRect(px + 6, py + 15, w - 12, h + 1);
    ctx.fillStyle = "#b13e53";
    ctx.fillRect(px - 4, py + 7, w + 8, 8);
    ctx.fillRect(px + 3, py + 3, w - 6, 5);
    ctx.fillStyle = "#ef7d57";
    ctx.fillRect(px + 6, py + 6, w - 12, 2);
    ctx.fillStyle = "#ffcd75";
    ctx.fillRect(px + Math.floor(w / 2) - 4, py + h + 2, 8, 14);
    ctx.fillStyle = "#f4f4f4";
    ctx.fillRect(px + 10, py + 17, 7, 6);
    ctx.fillRect(px + w - 17, py + 17, 7, 6);
    ctx.fillStyle = "#1a1c2c";
    ctx.fillRect(px + Math.floor(w / 2) - 1, py + h + 8, 2, 4);
    ctx.fillStyle = "#ffcd75";
    ctx.fillRect(px + Math.floor(w / 2) - 2, py, 4, 3);
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
    drawTrialFloor(ctx, time);
    drawAmbientDetails(ctx, cam, time);
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++)
        drawTrialLandmark(ctx, s.grid[y][x], x, y, time);
    drawPlayerHouse(ctx);
    for (const ch of s.chests) drawChest(ctx, ch, time);
  }

  return { load, solid, moveBox, checkTriggers, draw, cellAt, isSafeSpawn };
})();
