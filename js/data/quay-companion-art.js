/* Sunrise's neighbours carry the objects that belong to their stories. */
"use strict";
(() => {
  const A = G.authoredPixelArt;
  const colors = {
    quayBaker: { c: "#99716c", d: "#f6ecd5", f: "#cf9978", h: "#f0c9a4", i: "#785344", j: "#b58056", o: "#69514b", q: "#c4a090", r: "#9b6c41", t: "#e3ae61" },
    quayMara: { c: "#577a8b", d: "#e5e3d4", f: "#94694f", h: "#bc8e68", i: "#a8a4ac", j: "#dad3cc", o: "#415c6d", q: "#80a4aa", r: "#88644c", t: "#c794a5" },
    quayPip: { c: "#ab7a59", d: "#f2deb3", f: "#bd8a65", h: "#e0b18a", i: "#664839", j: "#946b4a", o: "#6b5745", q: "#d3a468", r: "#815c44", t: "#9666b7" },
  };
  function make(id) {
    const p = { k: "#35413e", a: "#dab773", b: "#59695d", e: "#b5cfbd", g: "#956a56", l: "#758789", m: "#b9c6b0", n: "#df9f8d", ...colors[id] };
    const s = A.compactSprite(A.authored(42, 48, p, (g, frame) => {
      const kid = id === "quayPip", bob = frame === 1 ? 1 : 0, work = frame === 2, greet = frame === 3;
      const head = (kid ? 25 : 15) - bob;
      const limb = (x, y, xx, yy, c, w = 3) => {
        g.line(x, y, xx, yy, "k", w + 2); g.line(x, y, xx, yy, c, w);
      };
      for (const [x, dx] of [[16, frame === 1 ? -2 : 0], [26, frame === 1 ? 2 : 0]]) {
        limb(x, 39 - bob, x + dx, 44, "o"); g.ellipse(x + dx, 46, 4, 2, "k");
        g.line(x + dx - 2, 45, x + dx + 2, 45, "r", 1);
      }
      if (id === "quayBaker") {
        g.ellipse(21, 33 - bob, 14, 11, "k"); g.ellipse(21, 33 - bob, 13, 10, "c");
        g.poly([[15, 26 - bob], [27, 26 - bob], [30, 41 - bob], [12, 41 - bob]], "d");
        g.line(15, 25 - bob, 17, 30 - bob, "q", 2); g.line(27, 25 - bob, 25, 30 - bob, "q", 2);
        g.rect(17, 35 - bob, 8, 4, "q"); g.put(19, 36 - bob, "d"); g.put(26, 32 - bob, "d");
        // The paddle's handle crosses the working hand and ends in an oval blade.
        const hy = work ? 30 - bob : 35 - bob;
        limb(32, 28 - bob, 33, hy, "c");
        g.line(34, hy + 5, 35, hy - 9, "k", 3); g.line(34, hy + 5, 35, hy - 9, "r", 1);
        g.ellipse(35, hy - 12, 4, 6, "k"); g.ellipse(35, hy - 12, 3, 5, "t"); g.line(35, hy - 15, 35, hy - 10, "r", 1);
        g.ellipse(33, hy, 2, 2, "f");
        const hx = greet ? 8 : 9, by = greet ? 23 : 36 - bob;
        limb(10, 28 - bob, hx, by, "c");
        if (!greet) {
          g.line(3, by + 3, 16, by + 3, "k", 3); g.line(4, by + 3, 15, by + 3, "r", 1);
          g.ellipse(10, by, 6, 4, "k"); g.ellipse(10, by, 5, 3, "t");
          g.line(7, by - 2, 8, by, "d", 1); g.line(11, by - 2, 12, by, "d", 1);
        }
        g.ellipse(hx, by + (greet ? 0 : 3), 2, 2, "f");
      } else if (id === "quayMara") {
        g.poly([[11, 25 - bob], [31, 25 - bob], [34, 39 - bob], [27, 43 - bob], [14, 43 - bob], [8, 39 - bob]], "k");
        g.poly([[12, 26 - bob], [30, 26 - bob], [31, 39 - bob], [26, 41 - bob], [15, 41 - bob], [11, 39 - bob]], "c");
        g.line(15, 31 - bob, 14, 39 - bob, "q", 2); g.line(28, 32 - bob, 29, 39 - bob, "o", 2);
        g.poly([[10, 24 - bob], [20, 29 - bob], [31, 24 - bob], [33, 32 - bob], [24, 35 - bob], [11, 32 - bob]], "t");
        g.line(13, 27 - bob, 22, 31 - bob, "d", 1); g.line(22, 31 - bob, 30, 28 - bob, "d", 1);
        for (const x of [12, 16, 25, 29]) g.line(x, 33 - bob, x, 35 - bob, "q", 1);
        const by = work ? 31 - bob : 35 - bob;
        limb(11, 28 - bob, 10, by, "c");
        g.rect(5, by - 3, 11, 8, "k"); g.rect(6, by - 2, 9, 6, "d");
        g.line(7, by - 1, 10, by + 1, "q", 1); g.line(13, by - 1, 10, by + 1, "q", 1); g.ellipse(10, by + 3, 2, 2, "f");
        const hx = greet ? 35 : work ? 28 : 32, hy = greet ? 21 : work ? 24 - bob : 36 - bob;
        limb(31, 28 - bob, hx, hy, "c");
        if (!greet) {
          g.ellipse(hx + 3, hy - 1, 3, 3, "k"); g.ellipse(hx + 3, hy - 1, 1, 1, "d");
          g.rect(hx - 3, hy - 5, 7, 8, "k"); g.rect(hx - 2, hy - 4, 5, 6, "d"); g.line(hx - 2, hy - 4, hx + 2, hy - 4, "r", 1);
        }
        g.ellipse(hx, hy + (greet ? 0 : 3), 2, 2, "f");
      } else {
        // Pip is visibly shorter; the purple wooden dragon stays in a small hand.
        g.poly([[13, 34 - bob], [28, 34 - bob], [30, 42 - bob], [12, 42 - bob]], "k");
        g.poly([[14, 35 - bob], [27, 35 - bob], [28, 40 - bob], [14, 40 - bob]], "c");
        g.line(15, 34 - bob, 21, 37 - bob, "q", 2); g.line(21, 37 - bob, 26, 34 - bob, "q", 2); g.line(21, 37 - bob, 24, 40 - bob, "q", 2);
        limb(13, 36 - bob, 11, 40 - bob, "c"); g.ellipse(11, 40 - bob, 2, 2, "f");
        const hx = greet ? 32 : work ? 30 : 31, hy = greet ? 27 : work ? 33 - bob : 40 - bob;
        limb(28, 36 - bob, hx, hy, "c");
        if (!greet) {
          g.poly([[hx - 3, hy - 6], [hx + 4, hy - 6], [hx + 4, hy - 10], [hx + 8, hy - 10], [hx + 9, hy - 5], [hx + 5, hy - 3], [hx - 4, hy - 3], [hx - 7, hy - 6]], "k");
          g.rect(hx - 3, hy - 5, 7, 2, "t"); g.rect(hx + 5, hy - 9, 2, 5, "t");
          g.poly([[hx - 1, hy - 5], [hx - 1, hy - 10], [hx + 3, hy - 6]], "t");
          g.line(hx - 2, hy - 2, hx - 2, hy, "a", 1); g.line(hx + 3, hy - 2, hx + 3, hy, "a", 1); g.put(hx + 6, hy - 8, "d");
        }
        g.ellipse(hx, hy, 2, 2, "f");
      }
      for (const x of [11, 31]) { g.ellipse(x, head + 2, 3, 4, "k"); g.ellipse(x, head + 2, 2, 3, "f"); }
      g.ellipse(21, head, 10, 11, "k"); g.ellipse(21, head, 9, 10, "f"); g.ellipse(18, head - 3, 6, 5, "h");
      if (id === "quayBaker") {
        g.poly([[11, head + 2], [12, head - 8], [29, head - 8], [31, head + 2], [28, head + 4], [27, head - 2], [15, head - 2], [14, head + 4]], "i");
        g.rect(12, head - 9, 19, 5, "k"); g.rect(13, head - 8, 17, 3, "d");
        for (const [x, y] of [[14, head - 10], [21, head - 12], [28, head - 10]]) { g.ellipse(x, y, 5, 4, "k"); g.ellipse(x, y, 4, 3, "d"); }
        g.line(14, head - 6, 28, head - 6, "q", 1);
        for (const x of [16, 25]) { g.rect(x, head + 1, 2, 3, "k"); g.put(x, head + 1, "d"); }
        g.line(17, head + 6, 24, head + 6, "i", 2); g.line(19, head + 8, 22, head + 8, "g", 1);
      } else if (id === "quayMara") {
        g.ellipse(29, head - 7, 6, 6, "k"); g.ellipse(29, head - 7, 5, 5, "i");
        g.poly([[11, head + 1], [11, head - 7], [16, head - 11], [27, head - 10], [31, head - 4], [29, head], [25, head - 4], [20, head - 6], [15, head - 3], [13, head + 3]], "i");
        g.line(15, head - 7, 22, head - 9, "j", 2); g.line(28, head - 7, 30, head - 5, "j", 1);
        for (const x of [16, 25]) { g.rect(x, head + 1, 2, 3, "k"); g.put(x, head + 1, "d"); }
        g.line(15, head - 1, 18, head - 1, "r", 1); g.line(25, head - 1, 28, head - 1, "r", 1);
        g.line(19, head + 7, 23, head + 7, "g", 1);
      } else {
        for (const [x, y] of [[12, head - 3], [16, head - 8], [23, head - 9], [29, head - 5]]) {
          g.ellipse(x, y, 4, 4, "k"); g.ellipse(x, y, 3, 3, "i"); g.put(x, y - 1, "j");
        }
        g.poly([[12, head - 6], [16, head - 12], [26, head - 11], [31, head - 6]], "k");
        g.poly([[14, head - 7], [17, head - 10], [25, head - 9], [28, head - 7]], "q"); g.line(11, head - 5, 32, head - 5, "r", 2);
        for (const x of [16, 25]) { g.rect(x, head + 1, 2, 3, "k"); g.put(x, head + 1, "d"); }
        g.line(19, head + 7, 23, head + 7, "g", 1);
      }
      g.put(13, head + 5, "n"); g.put(29, head + 5, "n");
    }));
    s.integratedEquipment = true;
    s.animations.work = [2, 3, 2, 0]; s.hd.animations.work = [2, 3, 2, 0];
    return s;
  }
  G.quayCompanionArtIds = ["quayBaker", "quayMara", "quayPip"];
  for (const id of G.quayCompanionArtIds) G.NPCS[id].sprite = make(id);
  G.quayCompanionSpeaker = speaker => {
    const name = String(speaker || "").toUpperCase().replace(/^[^A-Z]+/, "");
    for (const [alias, id] of [["BRINDLE", "quayBaker"], ["BAKER BRINDLE", "quayBaker"], ["MARA", "quayMara"], ["PIP", "quayPip"]]) {
      if (name === alias || name.startsWith(alias + " ·")) return G.NPCS[id];
    }
    return null;
  };
})();
