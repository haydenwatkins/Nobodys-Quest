/* ============================================================
   SPRITES — turns text-art into pixel pictures.

   A sprite looks like this in a form/enemy file:

     sprite: {
       palette: { k: "#1a1c2c", w: "#f4f4f4" },   // letter -> color
       frames: [
         [ "..kk..",       // each string is one row of pixels
           ".kwwk.",       // each letter picks a palette color
           "..kk.." ],     // "." means transparent
         [ ...frame 2... ] // more frames = walking animation
       ]
     }

   Ben: you can edit these letter-grids right in the code, or
   draw in Piskel (piskelapp.com) and copy the colors across!
   ============================================================ */

"use strict";

// Build (and cache) a drawable sprite from a definition.
const _spriteCache = new WeakMap();

function hexTone(hex, amount) {
  const raw = String(hex || "").replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(raw)) return hex;
  const value = parseInt(raw, 16);
  const mix = (channel) => Math.max(0, Math.min(255, Math.round(channel + (amount >= 0 ? 255 - channel : channel) * amount)));
  const r = mix(value >> 16), g = mix((value >> 8) & 255), b = mix(value & 255);
  return `#${[r, g, b].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
}

// Build a real two-pixel-density interpretation of existing text art. This is
// intentionally not a nearest-neighbor resize: exposed corners are sculpted,
// lit edges gain one-screen-pixel highlights, and an authored motif adds the
// characteristic detail for each pilot subject. The result occupies exactly
// the same logical world footprint as the source sprite.
G.makeHdSprite2x = function (def, options) {
  const opts = options || {};
  const palette = Object.assign({}, def.palette);
  const highlight = {};
  const used = new Set(Object.keys(palette));
  const candidates = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
  for (const [key, color] of Object.entries(def.palette || {})) {
    if (String(color).toLowerCase() === "#1a1c2c") continue;
    const next = candidates.find((candidate) => !used.has(candidate));
    if (!next) break;
    used.add(next);
    highlight[key] = next;
    palette[next] = hexTone(color, 0.28);
  }
  const accentKey = candidates.find((candidate) => !used.has(candidate)) || "X";
  palette[accentKey] = opts.accent || "#73eff7";

  function upgraded(rows, alternate) {
    const sourceW = rows.reduce((width, row) => Math.max(width, row.length), 1);
    const sourceH = rows.length;
    const grid = Array.from({ length: sourceH * 2 }, () => Array(sourceW * 2).fill("."));
    const sourceAt = (x, y) => y >= 0 && y < sourceH && x >= 0 && x < (rows[y] || "").length ? rows[y][x] : ".";
    const empty = (value) => value === "." || value === " ";
    const put = (x, y, value) => {
      x = Math.round(x); y = Math.round(y);
      if (y >= 0 && y < grid.length && x >= 0 && x < grid[y].length) grid[y][x] = value;
    };
    for (let y = 0; y < sourceH; y++) for (let x = 0; x < sourceW; x++) {
      const pixel = sourceAt(x, y);
      if (empty(pixel)) continue;
      const ox = x * 2, oy = y * 2;
      put(ox, oy, pixel); put(ox + 1, oy, pixel); put(ox, oy + 1, pixel); put(ox + 1, oy + 1, pixel);
      const outline = String((def.palette || {})[pixel]).toLowerCase() === "#1a1c2c";
      if (!outline && highlight[pixel] && (empty(sourceAt(x, y - 1)) || empty(sourceAt(x - 1, y))))
        put(ox, oy, highlight[pixel]);
      if (empty(sourceAt(x, y - 1)) && empty(sourceAt(x - 1, y))) put(ox, oy, ".");
      if (empty(sourceAt(x, y - 1)) && empty(sourceAt(x + 1, y))) put(ox + 1, oy, ".");
      if (empty(sourceAt(x, y + 1)) && empty(sourceAt(x - 1, y))) put(ox, oy + 1, ".");
      if (empty(sourceAt(x, y + 1)) && empty(sourceAt(x + 1, y))) put(ox + 1, oy + 1, ".");
    }

    const w = sourceW * 2, h = sourceH * 2, cx = Math.floor(w / 2);
    if (opts.motif === "hero") {
      put(cx - 1, Math.floor(h * 0.68), accentKey);
      put(cx, Math.floor(h * 0.68) - 1, accentKey);
      if (alternate) put(cx + 1, Math.floor(h * 0.68), accentKey);
    } else if (opts.motif === "slime") {
      put(cx - 5, Math.floor(h * 0.37), accentKey);
      put(cx - 4, Math.floor(h * 0.37) - 1, accentKey);
      put(cx + (alternate ? 5 : 6), Math.floor(h * 0.58), accentKey);
    } else if (opts.motif === "marker") {
      put(cx, Math.floor(h * 0.49), accentKey);
      put(cx, Math.floor(h * 0.49) + 1, accentKey);
      put(cx + 1, Math.floor(h * 0.49) + 1, accentKey);
    } else if (opts.motif === "treant") {
      for (let y = Math.floor(h * 0.38); y < h - 5; y += 5) put(cx + ((y + (alternate ? 2 : 0)) % 6) - 3, y, accentKey);
      put(cx - 9, 3 + (alternate ? 1 : 0), accentKey);
      put(cx + 8, 5, accentKey);
    }
    return grid.map((row) => row.join(""));
  }

  const baseFrames = def.frames.map((rows) => upgraded(rows, false));
  const frames = baseFrames.slice();
  const animations = {};
  if (opts.animate && baseFrames.length >= 2) {
    frames.push(upgraded(def.frames[0], true), upgraded(def.frames[1], true));
    animations.idle = [0, 2];
    animations.walk = [0, 1, 3, 1];
  }
  return { palette, frames, density: 2, animations, hdMotif: opts.motif || "detail" };
};

G.activeSpriteDefinition = function (def) {
  return G.hdPilot && def && def.hd ? def.hd : def;
};

G.makeSprite = function (def) {
  if (_spriteCache.has(def)) return _spriteCache.get(def);

  const density = def.density || 1;
  const frames = def.frames.map((rows) => {
    const h = rows.length;
    const w = Math.max(...rows.map((r) => r.length));
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const c = cv.getContext("2d");
    for (let y = 0; y < h; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === "." || ch === " ") continue;
        c.fillStyle = def.palette[ch] || "#ff00ff"; // hot pink = "oops, unknown letter"
        c.fillRect(x, y, 1, 1);
      }
    }
    return cv;
  });

  // A shared one-pixel silhouette keeps every current and future form legible
  // against busy terrain. It is derived from transparency, so Ben's sprite
  // grids remain the single source of truth and need no duplicate outline art.
  const outlines = frames.map((img) => {
    const cv = document.createElement("canvas");
    cv.width = img.width + density * 2;
    cv.height = img.height + density * 2;
    const c = cv.getContext("2d");
    c.drawImage(img, 0, density);
    c.drawImage(img, density * 2, density);
    c.drawImage(img, density, 0);
    c.drawImage(img, density, density * 2);
    c.globalCompositeOperation = "source-in";
    c.fillStyle = "#1a1c2c";
    c.fillRect(0, 0, cv.width, cv.height);
    c.globalCompositeOperation = "destination-out";
    c.drawImage(img, density, density);
    c.globalCompositeOperation = "source-over";
    return cv;
  });

  const spr = { frames, outlines, w: frames[0].width, h: frames[0].height, density,
    logicalW: frames[0].width / density, logicalH: frames[0].height / density };
  _spriteCache.set(def, spr);
  return spr;
};

// Draw a sprite centered-horizontally at (x, y) where y is the FEET position.
// flip = true mirrors it (for facing left). An optional integer scale keeps
// boss pixels crisp while preserving the exact same art for playable forms.
G.drawSprite = function (ctx, def, frame, x, y, flip, scale) {
  const pixelScale = scale || 1;
  if (pixelScale !== 1) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(pixelScale, pixelScale);
    G.drawSprite(ctx, def, frame, 0, 0, flip, 1);
    ctx.restore();
    return;
  }
  def = G.activeSpriteDefinition(def);
  const spr = G.makeSprite(def);
  const img = spr.frames[frame % spr.frames.length];
  const outline = spr.outlines[frame % spr.outlines.length];
  const d = spr.density;
  const logicalW = spr.w / d, logicalH = spr.h / d;
  const snap = (value) => Math.round(value * d) / d;
  const dx = snap(x - logicalW / 2);
  const dy = snap(y - logicalH);
  if (flip) {
    ctx.save();
    ctx.translate(dx + logicalW, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(outline, 0, 0, outline.width, outline.height, -1, -1, logicalW + 2, logicalH + 2);
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, logicalW, logicalH);
    ctx.restore();
  } else {
    ctx.drawImage(outline, 0, 0, outline.width, outline.height, dx - 1, dy - 1, logicalW + 2, logicalH + 2);
    ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, logicalW, logicalH);
  }
};

G.spriteMetrics = function (def) {
  const made = G.makeSprite(G.activeSpriteDefinition(def));
  return { w: made.logicalW, h: made.logicalH, density: made.density };
};

G.spriteFrame = function (def, mode, tick) {
  const active = G.activeSpriteDefinition(def);
  const choices = active && active.animations && active.animations[mode];
  if (!choices || !choices.length) {
    if (mode === "idle") return 0;
    return Math.floor(tick || 0) % Math.max(1, active.frames.length);
  }
  const pace = mode === "idle" ? 0.7 : 1;
  return choices[Math.floor((tick || 0) * pace) % choices.length];
};
