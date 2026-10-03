/* Ordinary drops use recognizable health hearts and blue mana flasks. */
"use strict";
(() => {
  const A = G.authoredPixelArt;
  G.pickupArt = {};
  const palette = { k: "#35413e", a: "#f4d39c", b: "#d66379", c: "#f39a9c", d: "#fff0dd", e: "#ab485f", f: "#498ca7", g: "#86c8d1", h: "#cee8df", i: "#527087" };
  for (const kind of ["heart", "mana"]) G.pickupArt[kind] = A.compactSprite(A.authored(24, 24, palette, (g, frame) => {
    if (kind === "heart") {
      g.poly([[3, 5], [6, 2], [10, 3], [12, 6], [15, 3], [19, 2], [22, 5], [23, 10], [20, 15], [12, 23], [4, 15], [1, 10]], "k");
      g.poly([[4, 6], [7, 4], [10, 5], [12, 8], [15, 5], [19, 4], [21, 6], [21, 10], [18, 14], [12, 20], [6, 14], [3, 10]], "b");
      g.poly([[4, 6], [7, 4], [10, 5], [11, 8], [8, 11], [5, 10]], "c");
      g.line(8, 15, 12, 19, "e", 2); g.line(12, 19, 18, 13, "e", 2);
      g.line(6, 6, 8, 5, "d", 2); if (frame === 2) g.put(17, 7, "d");
    } else {
      g.poly([[8, 4], [16, 4], [16, 9], [21, 13], [22, 18], [19, 23], [5, 23], [2, 18], [3, 13], [8, 9]], "k");
      g.poly([[10, 6], [14, 6], [14, 10], [19, 14], [20, 18], [17, 21], [7, 21], [4, 18], [5, 14], [10, 10]], "g");
      g.poly([[5, 15], [19, 15], [19, 18], [17, 20], [7, 20], [5, 18]], "f");
      g.line(7, 15, 17, 15, "h", 1); g.line(7, 12, 6, 16, "h", 2);
      g.put(10 + frame % 2, 18, "g"); g.put(15, 17, "g");
      g.rect(8, 1, 8, 5, "k"); g.rect(9, 2, 6, 3, "a"); g.line(10, 2, 13, 2, "d", 1);
    }
  }));
  G.drawPickupArt = (ctx, pickup) => {
    const sprite = G.pickupArt[pickup.kind]; if (!sprite) return false;
    const t = pickup.t || 0, quiet = G.reducedMotion;
    if (!quiet && t > 9 && Math.floor(t * 8) % 2 === 0) return true;
    const bob = quiet ? 0 : Math.sin(t * 5) * 2;
    ctx.save(); if (quiet) ctx.globalAlpha *= Math.min(1, Math.max(0, (12 - t) / 3));
    G.drawShadow(ctx, pickup.x, pickup.y, 9);
    G.drawSprite(ctx, sprite, G.spriteFrame(sprite, "idle", quiet ? 0 : t), pickup.x, pickup.y + 1 + bob, false);
    ctx.restore(); return true;
  };
})();
