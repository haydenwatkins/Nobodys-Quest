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

G.makeSprite = function (def) {
  if (_spriteCache.has(def)) return _spriteCache.get(def);

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
    cv.width = img.width + 2;
    cv.height = img.height + 2;
    const c = cv.getContext("2d");
    c.drawImage(img, 0, 1);
    c.drawImage(img, 2, 1);
    c.drawImage(img, 1, 0);
    c.drawImage(img, 1, 2);
    c.globalCompositeOperation = "source-in";
    c.fillStyle = "#1a1c2c";
    c.fillRect(0, 0, cv.width, cv.height);
    c.globalCompositeOperation = "destination-out";
    c.drawImage(img, 1, 1);
    c.globalCompositeOperation = "source-over";
    return cv;
  });

  const spr = { frames, outlines, w: frames[0].width, h: frames[0].height };
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
  const spr = G.makeSprite(def);
  const img = spr.frames[frame % spr.frames.length];
  const outline = spr.outlines[frame % spr.outlines.length];
  const dx = Math.round(x - spr.w / 2);
  const dy = Math.round(y - spr.h);
  if (flip) {
    ctx.save();
    ctx.translate(dx + spr.w, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(outline, -1, -1);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  } else {
    ctx.drawImage(outline, dx - 1, dy - 1);
    ctx.drawImage(img, dx, dy);
  }
};
