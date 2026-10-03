/* Six neighbours for the growing town; appearances repeat without changing IDs. */
"use strict";
(() => {
  const A = G.authoredPixelArt;
  const profiles = [
    ["#6b4a2b", "#e0a17c", "#3b7d6a", "#ffcd75", "#a7825a"],
    ["#d8b06a", "#9b654e", "#596fa3", "#73c8cd", "#f2ce86"],
    ["#493829", "#c98c72", "#985f79", "#e8ddc6", "#89654b"],
    ["#b7b1c9", "#d6a17c", "#6f7042", "#b2cd80", "#e1d8db"],
    ["#70493e", "#8f5f4c", "#8153a3", "#d9a7d4", "#ac7960"],
    ["#f2e4a8", "#694b67", "#426080", "#e89872", "#fff0c8"],
  ];
  G.townResidentArt = profiles.map(([hair, skin, coat, accent, highlight], index) => {
    const p = { k: "#35413e", i: hair, f: skin, c: coat, a: accent, j: highlight,
      h: ["#f5c9a0", "#c18f69", "#e6b494", "#efc9a4", "#b78767", "#9a738e"][index],
      d: "#f0dec1", o: "#4e514b", r: "#7b5c49", n: "#d69783", q: "#b6c4b0" };
    const draw = (g, frame) => {
      const bob = frame === 1 ? 1 : 0, work = frame === 2 || frame >= 4, greet = frame === 3, head = 10 - bob;
      const limb = (x, y, xx, yy, c, w = 2) => {
        g.line(x, y, xx, yy, "k", w + 2); g.line(x, y, xx, yy, c, w);
      };
      for (const [x, dx] of [[10, frame === 1 ? -2 : 0], [18, frame === 1 ? 2 : 0]]) {
        limb(x, 28 - bob, x + dx, 33, "o"); g.ellipse(x + dx, 34, 3, 1, "k"); g.line(x + dx - 1, 33, x + dx + 1, 33, "r", 1);
      }
      g.poly([[7, 18 - bob], [21, 18 - bob], [23, 28 - bob], [19, 31 - bob], [9, 31 - bob], [5, 28 - bob]], "k");
      g.poly([[8, 19 - bob], [20, 19 - bob], [21, 28 - bob], [18, 29 - bob], [10, 29 - bob], [7, 28 - bob]], "c");
      if (index === 0 || index === 4) {
        g.poly([[9, 18 - bob], [14, 21 - bob], [19, 18 - bob], [17, 23 - bob], [11, 23 - bob]], "a");
        g.line(17, 22 - bob, 19, 26 - bob, "a", 2);
      } else if (index === 1 || index === 3) {
        g.poly([[11, 20 - bob], [17, 20 - bob], [19, 28 - bob], [9, 28 - bob]], "a");
        g.rect(12, 24 - bob, 4, 3, "c");
      } else {
        g.line(10, 19 - bob, 10, 27 - bob, "a", 2); g.line(18, 19 - bob, 18, 27 - bob, "a", 2);
        g.line(9, 28 - bob, 19, 28 - bob, "a", 1);
      }
      limb(7, 21 - bob, work ? 11 : 5, work ? 25 - bob : 27 - bob, "c");
      g.ellipse(work ? 11 : 5, work ? 25 - bob : 27 - bob, 2, 2, "f");
      const hx = greet ? 24 : work ? 17 : 23, hy = greet ? 15 : work ? 25 - bob : 27 - bob;
      limb(21, 21 - bob, hx, hy, "c"); g.ellipse(hx, hy, 2, 2, "f");
      if (frame === 4 || frame === 5) {
        const bx = frame === 4 ? 19 : 21;
        g.line(16, 20, bx, 32, "k", 3); g.line(16, 20, bx, 32, "r", 1);
        g.poly([[bx - 2, 29], [bx + 2, 29], [bx + 4, 34], [bx - 4, 34]], "k");
        g.poly([[bx - 1, 30], [bx + 1, 30], [bx + 2, 33], [bx - 2, 33]], "a");
        g.ellipse(17, 25, 2, 2, "f");
      } else if (frame === 6 || frame === 7) {
        const cy = frame === 6 ? 28 : 29;
        g.ellipse(13, cy - 5, 4, 3, "k"); g.ellipse(13, cy - 5, 2, 1, "d");
        g.rect(9, cy - 3, 9, 6, "k"); g.rect(10, cy - 2, 7, 4, "q");
        g.line(18, cy, 22, cy - 3, "k", 3); g.line(18, cy, 22, cy - 3, "q", 1);
        g.ellipse(12, cy - 5, 2, 2, "f");
      } else if (frame === 8) {
        g.rect(8, 23, 13, 9, "k"); g.rect(9, 24, 11, 7, "r");
        g.rect(14, 24, 2, 7, "d"); g.line(9, 27, 19, 27, "a", 1);
        g.ellipse(9, 28, 2, 2, "f"); g.ellipse(20, 28, 2, 2, "f");
      }
      for (const x of [6, 22]) { g.ellipse(x, head + 2, 2, 3, "k"); g.ellipse(x, head + 2, 1, 2, "f"); }
      if (index === 3) { g.ellipse(22, head - 3, 4, 4, "k"); g.ellipse(22, head - 3, 3, 3, "i"); }
      g.ellipse(14, head, 8, 9, "k"); g.ellipse(14, head, 7, 8, "f"); g.ellipse(11, head - 3, 4, 4, "h");
      if (index === 0 || index === 2) {
        g.poly([[6, head], [7, head - 6], [11, head - 9], [18, head - 8], [22, head - 4], [21, head + 2], [18, head - 1], [15, head - 4], [10, head - 2], [8, head + 3]], "i");
        g.line(10, head - 6, 15, head - 7, "j", 1);
        if (index === 2) { g.line(10, head + 6, 18, head + 6, "i", 2); g.put(14, head + 7, "f"); }
      } else if (index === 1 || index === 5) {
        g.poly([[6, head + 4], [6, head - 5], [11, head - 9], [18, head - 8], [22, head - 3], [22, head + 7], [19, head + 7], [18, head - 1], [14, head - 4], [9, head - 1], [9, head + 6]], "i");
        g.line(10, head - 6, 15, head - 7, "j", 2);
        if (index === 1) { g.line(20, head + 2, 21, head + 7, "j", 1); g.line(19, head + 7, 21, head + 7, "a", 1); }
      } else if (index === 3) {
        g.poly([[6, head], [7, head - 6], [11, head - 9], [18, head - 8], [22, head - 3], [19, head - 1], [15, head - 4], [10, head - 1], [8, head + 2]], "i");
        g.line(10, head - 6, 15, head - 7, "j", 2);
      } else {
        for (const [x, y] of [[7, head - 4], [11, head - 8], [17, head - 8], [21, head - 4]]) {
          g.ellipse(x, y, 4, 4, "k"); g.ellipse(x, y, 3, 3, "i"); g.put(x, y - 1, "j");
        }
        g.line(8, head - 5, 20, head - 5, "a", 1);
      }
      for (const x of [10, 17]) { g.rect(x, head + 1, 2, 2, "k"); g.put(x, head + 1, "d"); }
      if (index === 3) {
        for (const x of [10, 18]) { g.line(x - 2, head, x + 2, head, "o", 1); g.line(x - 2, head + 3, x + 2, head + 3, "o", 1); }
        g.line(13, head + 1, 15, head + 1, "o", 1);
      }
      g.put(8, head + 4, "n"); g.put(20, head + 4, "n");
      if (index !== 2) g.line(12, head + 6, 16, head + 6, "r", 1);
    };
    const dense = A.authored(28, 36, p, draw);
    for (let frame = 4; frame <= 8; frame++) {
      const grid = A.grid(28, 36); draw(grid, frame); dense.frames.push(grid.rows());
    }
    const s = A.compactSprite(dense);
    s.activityAnimations = { sweep: "sweep", garden: "garden", parcel: "parcel" };
    s.animations.sweep = [4, 5]; s.animations.garden = [6, 7]; s.animations.parcel = [8];
    s.integratedEquipment = true;
    s.animations.work = [2, 3, 2, 0]; s.hd.animations.work = [2, 3, 2, 0];
    return s;
  });
})();
