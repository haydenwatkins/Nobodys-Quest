/* A passable shot-filter field: flat seals and an open, translucent boundary. */
"use strict";
(() => {
  const A = G.authoredPixelArt;
  const s = A.compactSprite(A.authored(64, 64, {
    k: "#43594d", c: "#899780", d: "#c8ccb0", r: "#64735e", a: "#e4c98a", e: "#b8d1ba", q: "#81aaa0",
  }, (g, frame) => {
    for (let i = 0; i < 96; i++) {
      const angle = i * Math.PI / 48;
      const x = Math.round(32 + Math.cos(angle) * 30), y = Math.round(32 + Math.sin(angle) * 30);
      g.put(x, y, (i + frame * 3) % 16 < 3 ? "a" : "q");
    }
    // Gaps show the ground through the field; it never reads as a stone wall.
    for (let y = 16; y <= 48; y += 8) for (let x = 16; x <= 48; x += 8)
      if (Math.hypot(x - 32, y - 32) < 25 && (x / 8 + y / 8 + frame) % 3 === 0) g.line(x, y, x + 2, y, "e", 1);
    for (const [x, y] of [[14, 14], [50, 14], [14, 50], [50, 50]]) {
      g.poly([[x - 4, y], [x - 2, y - 3], [x + 3, y - 2], [x + 4, y + 1], [x + 2, y + 3], [x - 3, y + 2]], "k");
      g.poly([[x - 3, y], [x - 1, y - 2], [x + 2, y - 1], [x + 3, y + 1], [x + 1, y + 2], [x - 2, y + 1]], "c");
      g.line(x - 1, y - 1, x + 1, y, "d", 1); g.put(x, y + 1, "r");
      g.put(x + (frame % 2), y, "a");
    }
  }));
  s.animations.idle = [0, 1, 2, 3];
  G.rampartScreenArt = s;
  G.drawRampartScreen = (ctx, field) => {
    const frame = G.spriteFrame(s, "idle", G.reducedMotion ? 0 : G.state.time || 0);
    // The artwork is centred on the same circular field used by projectile
    // collision. Actors render later, so their bodies remain unobscured.
    const scale = field.radius / 15;
    G.drawSprite(ctx, s, frame, field.x, field.y + 16 * scale, false, scale);
  };
})();
