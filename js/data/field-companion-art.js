/* Field companions: practical silhouettes and equipment held in their hands. */
"use strict";
(() => {
  const A = G.authoredPixelArt;
  const colors = {
    moss: { c: "#657b43", d: "#eee0b2", f: "#b87f60", h: "#dbab7f", i: "#547446", j: "#89a063", o: "#465540", q: "#8eaa5d", r: "#8c6848", t: "#78a5a0" },
    lastminute: { c: "#426080", d: "#eedbb2", f: "#8f5f4c", h: "#b88462", i: "#2f405c", j: "#65788e", o: "#303e50", q: "#7894ae", r: "#795946", t: "#dcaf61" },
    probably: { c: "#69538f", d: "#f5e9c7", f: "#694b67", h: "#966c87", i: "#e5d49c", j: "#fff0be", o: "#493e75", q: "#a280b1", r: "#705668", t: "#d68bd4" },
  };
  function make(id) {
    const p = { k: "#35413e", a: "#dab773", b: "#59695d", e: "#b5cfbd", g: "#956a56", l: "#758789", m: "#b9c6b0", n: "#df9f8d", ...colors[id] };
    const s = A.compactSprite(A.authored(36, 44, p, (g, frame) => {
      const bob = frame === 1 ? 1 : 0, work = frame === 2, greet = frame === 3;
      const head = 12 - bob;
      const limb = (x, y, xx, yy, c, w = 3) => {
        g.line(x, y, xx, yy, "k", w + 2); g.line(x, y, xx, yy, c, w);
      };
      for (const [x, dx] of [[13, frame === 1 ? -2 : 0], [23, frame === 1 ? 2 : 0]]) {
        limb(x, 34 - bob, x + dx, 40, "o");
        g.ellipse(x + dx, 41, 4, 2, "k"); g.line(x + dx - 2, 40, x + dx + 2, 40, "r", 1);
      }
      if (id === "moss") {
        // A broad canvas apron, rolled sleeves, and a little watering can.
        g.ellipse(18, 29 - bob, 13, 10, "k"); g.ellipse(18, 29 - bob, 12, 9, "c");
        g.line(9, 24 - bob, 7, 30 - bob, "q", 3); g.line(27, 24 - bob, 29, 30 - bob, "q", 3);
        g.poly([[12, 22 - bob], [24, 22 - bob], [25, 36 - bob], [11, 36 - bob]], "d");
        g.line(13, 22 - bob, 15, 27 - bob, "r", 2); g.line(23, 22 - bob, 21, 27 - bob, "r", 2);
        g.rect(14, 30 - bob, 8, 5, "q"); g.line(15, 30 - bob, 21, 30 - bob, "o", 1);
        const cy = work ? 31 - bob : 35 - bob;
        limb(9, 25 - bob, 8, cy - 4, "c");
        g.ellipse(7, cy - 3, 4, 4, "k"); g.ellipse(7, cy - 3, 2, 2, "d");
        g.poly([[4, cy - 2], [13, cy - 2], [14, cy + 4], [3, cy + 4]], "k");
        g.rect(4, cy - 1, 9, 4, "t"); g.line(5, cy - 1, 11, cy - 1, "e", 1);
        g.line(13, cy + 1, 17, cy - 3, "k", 3); g.line(13, cy + 1, 17, cy - 3, "t", 1);
        g.ellipse(8, cy - 4, 2, 2, "f");
        const hx = greet ? 31 : 28, hy = greet ? 20 : 32 - bob;
        limb(27, 25 - bob, hx, hy, "c"); g.ellipse(hx, hy, 2, 2, "f");
      } else if (id === "lastminute") {
        // The captain's brass buttons and a telescope attached to a shoulder strap.
        g.poly([[9, 22 - bob], [27, 22 - bob], [30, 35 - bob], [24, 38 - bob], [12, 38 - bob], [6, 35 - bob]], "k");
        g.poly([[10, 23 - bob], [26, 23 - bob], [27, 35 - bob], [23, 36 - bob], [13, 36 - bob], [9, 35 - bob]], "c");
        g.poly([[12, 23 - bob], [18, 26 - bob], [24, 23 - bob], [21, 29 - bob], [15, 29 - bob]], "d");
        g.line(11, 23 - bob, 24, 35 - bob, "r", 2);
        for (const y of [29, 33]) for (const x of [15, 21]) g.rect(x, y - bob, 2, 2, "t");
        limb(9, 25 - bob, 7, 32 - bob, "c");
        g.poly([[3, 29 - bob], [12, 28 - bob], [14, 36 - bob], [4, 37 - bob]], "k");
        g.poly([[4, 30 - bob], [11, 29 - bob], [12, 35 - bob], [5, 36 - bob]], "d");
        g.line(6, 32 - bob, 10, 33 - bob, "q", 1); g.ellipse(7, 33 - bob, 2, 2, "f");
        const hx = greet ? 31 : work ? 27 : 28, hy = greet ? 20 : work ? 18 - bob : 32 - bob;
        limb(27, 25 - bob, hx, hy, "c");
        if (work) { g.line(23, hy - 1, 32, hy - 1, "k", 5); g.line(24, hy - 1, 31, hy - 1, "t", 3); g.rect(31, hy - 3, 3, 5, "d"); }
        else { g.line(24, 30 - bob, 30, 35 - bob, "k", 4); g.line(24, 30 - bob, 30, 35 - bob, "t", 2); }
        g.ellipse(hx, hy + (work ? 2 : 0), 2, 2, "f");
      } else {
        // A crescent clasp joins the cape; the forecast is a real folded chart.
        g.poly([[10, 21 - bob], [26, 21 - bob], [31, 37 - bob], [23, 39 - bob], [12, 39 - bob], [5, 37 - bob]], "k");
        g.poly([[11, 22 - bob], [25, 22 - bob], [29, 36 - bob], [23, 37 - bob], [12, 37 - bob], [7, 36 - bob]], "o");
        g.poly([[14, 23 - bob], [22, 23 - bob], [25, 35 - bob], [11, 35 - bob]], "c");
        g.line(11, 23 - bob, 8, 35 - bob, "q", 2); g.line(25, 23 - bob, 28, 35 - bob, "q", 2);
        g.line(12, 22 - bob, 24, 22 - bob, "t", 2); g.ellipse(18, 24 - bob, 2, 2, "a"); g.put(19, 23 - bob, "o");
        const by = work ? 29 - bob : 33 - bob;
        limb(9, 25 - bob, 8, by, "c");
        g.poly([[7, by - 5], [17, by - 5], [19, by + 4], [9, by + 5]], "k");
        g.poly([[8, by - 4], [16, by - 4], [17, by + 3], [10, by + 4]], "d");
        g.line(10, by - 2, 15, by - 2, "q", 1); g.line(11, by, 15, by + 1, "t", 1); g.put(12, by + 2, "o");
        g.ellipse(8, by + 1, 2, 2, "f");
        const hx = greet ? 31 : work ? 20 : 27, hy = greet ? 19 : work ? by - 1 : 32 - bob;
        limb(27, 25 - bob, hx, hy, "c"); g.ellipse(hx, hy, 2, 2, "f");
      }
      for (const x of [8, 28]) { g.ellipse(x, head + 2, 3, 4, "k"); g.ellipse(x, head + 2, 2, 3, "f"); }
      g.ellipse(18, head, 10, 11, "k"); g.ellipse(18, head, 9, 10, "f"); g.ellipse(15, head - 3, 6, 5, "h");
      if (id === "moss") {
        g.poly([[8, head + 1], [8, head - 7], [13, head - 10], [24, head - 9], [28, head - 4], [28, head + 5], [25, head + 3], [24, head - 3], [12, head - 3], [11, head + 3]], "i");
        g.ellipse(18, head - 8, 10, 4, "k"); g.ellipse(18, head - 8, 9, 3, "d");
        g.line(11, head - 6, 25, head - 6, "r", 2); g.line(5, head - 4, 31, head - 4, "k", 3); g.line(6, head - 4, 30, head - 4, "a", 1);
        for (const x of [13, 22]) { g.rect(x, head + 1, 2, 3, "k"); g.put(x, head + 1, "d"); }
        g.line(14, head + 7, 21, head + 7, "i", 2);
      } else if (id === "lastminute") {
        g.poly([[8, head - 2], [9, head - 8], [26, head - 8], [28, head - 2], [26, head + 3], [24, head], [12, head], [10, head + 4]], "i");
        g.poly([[7, head - 5], [9, head - 10], [25, head - 10], [29, head - 5]], "k");
        g.poly([[9, head - 6], [10, head - 9], [24, head - 9], [27, head - 6]], "c");
        g.line(9, head - 4, 27, head - 4, "t", 2); g.line(10, head - 2, 23, head - 2, "k", 2); g.rect(17, head - 8, 3, 2, "d");
        for (const x of [13, 22]) { g.rect(x, head + 1, 2, 3, "k"); g.put(x, head + 1, "d"); }
        g.poly([[11, head + 6], [15, head + 5], [18, head + 7], [22, head + 5], [25, head + 6], [21, head + 10], [15, head + 10]], "i");
        g.line(16, head + 7, 20, head + 7, "h", 1);
      } else {
        g.poly([[8, head + 4], [8, head - 7], [13, head - 11], [23, head - 10], [28, head - 6], [29, head + 9], [25, head + 11], [23, head - 2], [18, head - 5], [12, head - 2], [11, head + 7]], "i");
        g.line(12, head - 7, 20, head - 9, "j", 2); g.line(26, head, 27, head + 7, "j", 2);
        g.line(26, head + 8, 28, head + 9, "t", 2);
        for (const x of [13, 22]) { g.rect(x, head + 1, 2, 3, "k"); g.put(x, head + 1, "d"); }
        g.line(12, head - 1, 15, head - 1, "o", 1); g.line(22, head - 1, 25, head - 1, "o", 1);
      }
      g.put(10, head + 5, "n"); g.put(26, head + 5, "n");
      if (id !== "lastminute" && id !== "moss") g.line(16, head + 7, 20, head + 7, "g", 1);
    }));
    s.integratedEquipment = true;
    s.animations.work = [2, 3, 2, 0]; s.hd.animations.work = [2, 3, 2, 0];
    return s;
  }
  G.fieldCompanionArtIds = ["moss", "lastminute", "probably"];
  for (const id of G.fieldCompanionArtIds) G.NPCS[id].sprite = make(id);
})();
