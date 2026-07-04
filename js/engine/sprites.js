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

  const spr = { frames, w: frames[0].width, h: frames[0].height };
  _spriteCache.set(def, spr);
  return spr;
};

// Draw a sprite centered-horizontally at (x, y) where y is the FEET position.
// flip = true mirrors it (for facing left).
G.drawSprite = function (ctx, def, frame, x, y, flip) {
  const spr = G.makeSprite(def);
  const img = spr.frames[frame % spr.frames.length];
  const dx = Math.round(x - spr.w / 2);
  const dy = Math.round(y - spr.h);
  if (flip) {
    ctx.save();
    ctx.translate(dx + spr.w, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  } else {
    ctx.drawImage(img, dx, dy);
  }
};
