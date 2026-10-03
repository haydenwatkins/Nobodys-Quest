/* Roadside specialists: held tools, expressive faces, and native NPC identity. */
"use strict";
(() => {
  const A = G.authoredPixelArt;
  const colors = {
    errata: { c: "#596383", d: "#e9e2c3", f: "#c98c72", h: "#e3b395", i: "#bbb8cc", j: "#dedbea", o: "#414d69", q: "#8396ae", r: "#906548", t: "#8fc4b3" },
    alias: { c: "#468b78", d: "#f0d9b4", f: "#9b654e", h: "#c08c69", i: "#693f70", j: "#a97792", o: "#385d56", q: "#73b19a", r: "#a16c44", t: "#e3a467" },
    provisional: { c: "#dfdfca", d: "#f7efda", f: "#d6a17c", h: "#edc5a0", i: "#39464a", j: "#657777", o: "#415b5f", q: "#8ca69c", r: "#8c634e", t: "#6da5a0" },
  };

  function make(id) {
    const p = { k: "#35413e", a: "#dab773", b: "#59695d", e: "#b5cfbd", g: "#956a56", l: "#758789", m: "#b9c6b0", n: "#df9f8d", ...colors[id] };
    const s = A.compactSprite(A.authored(36, 44, p, (g, frame) => {
      const bob = frame === 1 ? 1 : 0;
      const work = frame === 2, greet = frame === 3, head = 12 - bob;
      const limb = (x, y, xx, yy, c, w = 3) => {
        g.line(x, y, xx, yy, "k", w + 2);
        g.line(x, y, xx, yy, c, w);
      };
      for (const [x, dx] of [[13, frame === 1 ? -2 : 0], [23, frame === 1 ? 2 : 0]]) {
        limb(x, 34 - bob, x + dx, 40, "o");
        g.ellipse(x + dx, 41, 4, 2, "k");
        g.line(x + dx - 2, 40, x + dx + 2, 40, "r", 1);
      }

      if (id === "errata") {
        // A soft indigo reading robe, tied sleeves, and a folded atlas in hand.
        g.poly([[10, 21 - bob], [26, 21 - bob], [29, 36 - bob], [23, 39 - bob], [12, 39 - bob], [7, 36 - bob]], "k");
        g.poly([[11, 22 - bob], [25, 22 - bob], [27, 35 - bob], [22, 37 - bob], [13, 37 - bob], [9, 35 - bob]], "c");
        g.line(12, 25 - bob, 12, 34 - bob, "q", 2);
        g.line(23, 24 - bob, 25, 35 - bob, "o", 2);
        g.poly([[12, 22 - bob], [18, 26 - bob], [24, 22 - bob], [23, 28 - bob], [18, 30 - bob], [13, 28 - bob]], "t");
        g.rect(15, 34 - bob, 6, 2, "a");
        limb(9, 25 - bob, 8, 31 - bob, "c");
        const by = work ? 29 - bob : 32 - bob;
        g.poly([[8, by - 4], [17, by - 6], [27, by - 4], [27, by + 5], [18, by + 4], [8, by + 6]], "k");
        g.poly([[9, by - 3], [17, by - 4], [17, by + 3], [9, by + 4]], "d");
        g.poly([[19, by - 4], [26, by - 3], [26, by + 3], [19, by + 2]], "e");
        g.line(18, by - 4, 18, by + 3, "r", 1);
        g.line(11, by, 15, by - 1, "t", 1); g.line(21, by - 1, 24, by + 1, "o", 1);
        g.ellipse(8, by + 1, 2, 2, "f");
        const hx = greet ? 31 : work ? 23 : 28, hy = greet ? 19 : work ? by - 2 : by + 1;
        limb(27, 25 - bob, hx, hy, "c");
        if (work) { g.line(hx, hy, hx - 4, hy + 4, "a", 1); g.line(hx + 1, hy - 1, hx + 3, hy - 6, "d", 2); }
        g.ellipse(hx, hy, 2, 2, "f");
      } else if (id === "alias") {
        // Layered cardigan and apron; the work is held fabric, not an orbiting charm.
        g.poly([[9, 22 - bob], [27, 22 - bob], [30, 34 - bob], [25, 38 - bob], [11, 38 - bob], [6, 34 - bob]], "k");
        g.poly([[10, 23 - bob], [26, 23 - bob], [27, 34 - bob], [24, 36 - bob], [12, 36 - bob], [9, 34 - bob]], "c");
        g.poly([[14, 25 - bob], [22, 25 - bob], [24, 35 - bob], [12, 35 - bob]], "d");
        g.rect(13, 30 - bob, 5, 4, "t"); g.rect(20, 29 - bob, 3, 5, "i");
        for (const x of [14, 16]) g.put(x, 31 - bob, "d");
        g.line(11, 24 - bob, 9, 32 - bob, "q", 2);
        g.line(12, 21 - bob, 24, 22 - bob, "t", 3); g.line(23, 23 - bob, 25, 27 - bob, "t", 2);
        limb(9, 25 - bob, 8, 32 - bob, "c");
        const sy = work ? 29 - bob : 33 - bob;
        g.rect(3, sy - 5, 10, 9, "k"); g.rect(4, sy - 4, 8, 7, "i");
        g.rect(3, sy - 5, 10, 2, "a"); g.rect(3, sy + 3, 10, 2, "a");
        g.line(6, sy - 2, 10, sy + 1, "j", 1); g.ellipse(10, sy + 1, 2, 2, "f");
        const hx = greet ? 31 : work ? 22 : 27, hy = greet ? 18 : work ? 29 - bob : 32 - bob;
        limb(27, 25 - bob, hx, hy, "c");
        if (work) {
          g.poly([[13, 28 - bob], [24, 28 - bob], [25, 34 - bob], [15, 35 - bob]], "o");
          g.rect(15, 29 - bob, 8, 4, "t"); g.line(17, 30 - bob, 21, 32 - bob, "d", 1);
          g.line(hx, hy, hx - 4, hy + 3, "l", 1);
        }
        g.ellipse(hx, hy, 2, 2, "f");
      } else {
        // A fitted cream coat, teal vest, neck-loop instrument, and clasped bag.
        g.poly([[10, 22 - bob], [26, 22 - bob], [29, 36 - bob], [22, 38 - bob], [12, 38 - bob], [7, 36 - bob]], "k");
        g.poly([[11, 23 - bob], [25, 23 - bob], [27, 35 - bob], [22, 36 - bob], [13, 36 - bob], [9, 35 - bob]], "c");
        g.poly([[14, 23 - bob], [22, 23 - bob], [21, 35 - bob], [15, 35 - bob]], "t");
        g.poly([[11, 23 - bob], [15, 23 - bob], [17, 29 - bob], [12, 27 - bob]], "d");
        g.poly([[25, 23 - bob], [21, 23 - bob], [19, 29 - bob], [24, 27 - bob]], "d");
        g.line(12, 30 - bob, 12, 34 - bob, "d", 2);
        g.rect(22, 30 - bob, 4, 3, "q"); g.line(23, 29 - bob, 23, 31 - bob, "a", 1);
        g.line(16, 24 - bob, 15, 28 - bob, "o", 1); g.line(15, 28 - bob, 18, 30 - bob, "o", 1);
        g.line(18, 30 - bob, 21, 27 - bob, "o", 1); g.ellipse(21, 28 - bob, 1, 1, "a");
        const by = 33 - bob;
        limb(9, 25 - bob, 7, by - 1, "c");
        g.ellipse(7, by - 1, 2, 2, "f");
        g.rect(4, by - 2, 7, 4, "k"); g.rect(5, by - 1, 5, 2, "a");
        g.poly([[2, by], [12, by], [14, by + 7], [2, by + 7]], "k");
        g.rect(3, by + 1, 9, 5, "r"); g.line(4, by + 1, 11, by + 1, "h", 1); g.rect(7, by + 1, 2, 2, "a");
        const hx = greet ? 31 : work ? 25 : 28, hy = greet ? 18 : work ? 27 - bob : 32 - bob;
        limb(27, 25 - bob, hx, hy, "c");
        if (work) { g.rect(23, 23 - bob, 5, 8, "k"); g.rect(24, 24 - bob, 3, 6, "e"); g.rect(24, 23 - bob, 3, 2, "a"); g.put(25, 28 - bob, "t"); }
        g.ellipse(hx, hy, 2, 2, "f");
      }

      for (const x of [8, 28]) { g.ellipse(x, head + 2, 3, 4, "k"); g.ellipse(x, head + 2, 2, 3, "f"); }
      g.ellipse(18, head, 10, 11, "k"); g.ellipse(18, head, 9, 10, "f"); g.ellipse(15, head - 3, 6, 5, "h");
      if (id === "errata") {
        g.poly([[8, head + 4], [8, head - 7], [13, head - 11], [23, head - 10], [28, head - 5], [28, head + 6], [25, head + 4], [24, head - 3], [20, head - 6], [14, head - 4], [11, head + 4]], "i");
        g.line(12, head - 7, 20, head - 9, "j", 2); g.line(9, head - 2, 10, head + 3, "j", 1);
        for (const x of [13, 23]) { g.rect(x - 3, head, 6, 5, "k"); g.rect(x - 2, head + 1, 4, 3, "a"); g.rect(x - 1, head + 1, 2, 2, "f"); g.put(x, head + 1, "k"); }
        g.line(16, head + 1, 20, head + 1, "a", 1);
      } else if (id === "alias") {
        for (const [x, y] of [[10, head - 5], [14, head - 9], [20, head - 10], [25, head - 7], [27, head - 2]]) {
          g.ellipse(x, y, 4, 4, "k"); g.ellipse(x, y, 3, 3, "i"); g.put(x - 1, y - 1, "j");
        }
        g.line(10, head - 5, 26, head - 5, "t", 2); g.poly([[24, head - 7], [30, head - 5], [26, head - 2]], "t");
        for (const x of [13, 22]) { g.rect(x, head + 1, 2, 3, "k"); g.put(x, head + 1, "d"); }
      } else {
        g.poly([[8, head - 3], [9, head - 8], [15, head - 11], [24, head - 9], [28, head - 4], [27, head], [24, head - 2], [22, head - 5], [17, head - 3], [12, head - 5], [10, head]], "i");
        g.line(12, head - 7, 17, head - 8, "j", 2); g.line(24, head - 6, 26, head - 3, "j", 1);
        for (const x of [13, 22]) { g.rect(x, head, 2, 3, "k"); g.put(x, head, "d"); }
        g.line(12, head - 2, 15, head - 2, "g", 1); g.line(22, head - 2, 25, head - 2, "g", 1);
      }
      g.put(10, head + 5, "n"); g.put(26, head + 5, "n"); g.line(16, head + 7, 20, head + 7, "g", 1);
    }));
    s.integratedEquipment = true;
    s.animations.work = [2, 3, 2, 0];
    s.hd.animations.work = [2, 3, 2, 0];
    return s;
  }
  G.workshopCompanionArtIds = ["errata", "alias", "provisional"];
  for (const id of G.workshopCompanionArtIds) G.NPCS[id].sprite = make(id);
})();
