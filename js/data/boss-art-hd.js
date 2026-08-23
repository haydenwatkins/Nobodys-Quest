/* ============================================================
   AUTHORED BOSS ART — unique, animated silhouettes for every guardian.

   Bosses deliberately do not borrow form sprites. Their scale, profile and
   action pose should announce a set piece before the health bar appears.
   ============================================================ */

"use strict";

(() => {
  const A = G.authoredPixelArt;
  if (!A) return;
  const K = A.ink;
  const P = (colors) => A.palette(colors);
  const boss = (w, h, colors, draw) => A.compactSprite(A.authored(w, h, P(colors), draw));
  const stride = (f) => f === 1 ? 2 : f === 3 ? -2 : 0;
  const eyes = (g, x, y, color = "g") => { g.rect(x - 4, y, 3, 2, color); g.rect(x + 2, y, 3, 2, color); };
  const crown = (g, x, y, color = "e") => {
    g.poly([[x - 7, y + 6], [x - 7, y], [x - 3, y + 3], [x, y - 2], [x + 3, y + 3], [x + 7, y], [x + 7, y + 6]], K);
    g.poly([[x - 6, y + 5], [x - 6, y + 2], [x - 2, y + 4], [x, y], [x + 2, y + 4], [x + 6, y + 2], [x + 6, y + 5]], color);
  };
  const claw = (g, x, y, dir, color = "f") => {
    g.line(x, y, x + dir * 5, y, K, 3);
    for (let n = -1; n <= 1; n++) g.line(x + dir * 3, y, x + dir * 6, y + n * 2, color, 1);
  };

  const art = {
    ancientTreant: () => boss(54, 48, { a: "#2b2b27", b: "#4a392b", c: "#725037", d: "#9b7046", e: "#b89c58", f: "#476b3d", g: "#b6ed6a", h: "#69a34f", i: "#d7f0a0" }, (g, f) => {
      const reach = f === 2 ? 6 : 0, sway = stride(f);
      g.line(21, 39, 13 - sway, 47, K, 7); g.line(33, 39, 41 + sway, 47, K, 7);
      g.line(22, 40, 14 - sway, 46, "c", 4); g.line(32, 40, 40 + sway, 46, "c", 4);
      g.poly([[19, 14], [35, 14], [39, 40], [27, 44], [15, 39]], K); g.poly([[21, 15], [33, 15], [36, 38], [27, 42], [18, 38]], "b");
      g.line(27, 18, 25, 38, "d", 3); g.line(24, 28, 31, 34, "e", 2); eyes(g, 27, 22, "g");
      g.line(19, 21, 5 - reach, 12, K, 7); g.line(35, 21, 49 + reach, 12, K, 7); g.line(18, 21, 6 - reach, 12, "c", 4); g.line(36, 21, 48 + reach, 12, "c", 4);
      for (const [x, y] of [[8, 8], [16, 5], [25, 7], [36, 5], [46, 8], [12, 16], [42, 15]]) { g.ellipse(x, y, 7, 5, K); g.ellipse(x, y, 6, 4, (x + y) % 2 ? "f" : "h"); }
      g.line(7 - reach, 12, 2 - reach, 5, "d", 3); g.line(47 + reach, 12, 52 + reach, 4, "d", 3); g.put(27, 31, "g");
    }),

    mireQueen: () => boss(52, 38, { a: "#27362d", b: "#3f6846", c: "#609454", d: "#8abe5d", e: "#d9c95d", f: "#7b4f83", g: "#fff1b0", h: "#bc72b7", i: "#69d7c3" }, (g, f) => {
      const jump = f === 2 ? -3 : 0, s = stride(f);
      g.ellipse(27, 25 + jump, 18, 11, K); g.ellipse(27, 25 + jump, 17, 10, "b");
      g.ellipse(15, 17 + jump, 7, 7, K); g.ellipse(39, 17 + jump, 7, 7, K); g.ellipse(15, 17 + jump, 5, 5, "d"); g.ellipse(39, 17 + jump, 5, 5, "d");
      g.rect(13, 16 + jump, 3, 3, "g"); g.rect(38, 16 + jump, 3, 3, "g");
      g.ellipse(27, 24 + jump, 13, 7, "c"); g.line(20, 27 + jump, 34, 27 + jump, "a", 2); g.put(22, 29 + jump, "g"); g.put(32, 29 + jump, "g");
      crown(g, 27, 6 + jump, "e"); g.ellipse(27, 12 + jump, 11, 3, "h");
      g.line(13, 29 + jump, 5 - s, 35, "c", 5); g.line(41, 29 + jump, 49 + s, 35, "c", 5);
      if (f === 2) { g.line(27, 28 + jump, 27, 37, "h", 4); g.ellipse(27, 37, 4, 2, "i"); }
    }),

    eclipseKnight: () => boss(48, 48, { a: "#171a2d", b: "#292b49", c: "#474768", d: "#777594", e: "#b18bdd", f: "#e4c464", g: "#ffffff", h: "#442653", i: "#7560bb" }, (g, f) => {
      const s = stride(f), attack = f === 2;
      g.line(19, 38, 16 - s, 46, "c", 5); g.line(29, 38, 32 + s, 46, "c", 5);
      g.poly([[15, 17], [33, 17], [36, 39], [24, 43], [12, 38]], K); g.poly([[17, 18], [31, 18], [33, 37], [24, 40], [15, 37]], "b");
      g.ellipse(24, 13, 10, 11, K); g.poly([[16, 12], [24, 3], [32, 12], [29, 21], [19, 21]], "c");
      g.poly([[20, 10], [27, 10], [30, 15], [18, 15]], "a"); eyes(g, 24, 12, "e"); g.poly([[18, 7], [14, 1], [22, 5]], "i"); g.poly([[30, 7], [34, 1], [26, 5]], "i");
      g.ellipse(10, 26, 9, 11, K); g.ellipse(10, 26, 7, 9, "h"); g.ellipse(10, 26, 5, 7, "e"); g.ellipse(10, 26, 3, 5, "a");
      g.line(32, 21, attack ? 46 : 39, attack ? 5 : 38, K, 4); g.line(33, 21, attack ? 46 : 39, attack ? 5 : 38, "f", 2); g.put(24, 27, "e");
    }),

    riftbladeAdept: () => boss(50, 48, { a: "#18203b", b: "#2c315d", c: "#51437e", d: "#a447a4", e: "#e655ba", f: "#52dce1", g: "#ffffff", h: "#dbab65", i: "#7543b5" }, (g, f) => {
      const s = stride(f), attack = f === 2;
      g.line(20, 38, 17 - s, 46, "a", 5); g.line(30, 38, 33 + s, 46, "b", 5);
      g.poly([[16, 18], [34, 18], [37, 39], [25, 42], [13, 38]], K); g.poly([[18, 19], [32, 19], [34, 37], [25, 40], [16, 37]], "b");
      g.ellipse(25, 14, 8, 8, K); g.ellipse(25, 14, 7, 7, "h"); g.rect(18, 13, 14, 4, "a"); eyes(g, 25, 13, "f");
      g.line(10, 8, 40, 8, K, 5); g.poly([[14, 7], [25, 0], [37, 7]], "c"); g.line(25, 1, 25, 8, "e", 2);
      g.line(18, 23, attack ? 2 : 9, attack ? 8 : 34, K, 4); g.line(18, 23, attack ? 2 : 9, attack ? 8 : 34, "e", 2);
      g.line(32, 23, attack ? 48 : 41, attack ? 8 : 34, K, 4); g.line(32, 23, attack ? 48 : 41, attack ? 8 : 34, "f", 2); g.put(25, 28, "g");
    }),

    moleMonarch: () => boss(52, 42, { a: "#292735", b: "#50445b", c: "#7d6670", d: "#bc8a6b", e: "#e3b860", f: "#f09a91", g: "#ffffff", h: "#77b8bd", i: "#cfe9df" }, (g, f) => {
      const dig = f === 2 ? -5 : 0, s = stride(f);
      g.ellipse(26, 25, 15, 14, K); g.ellipse(26, 25, 14, 13, "b"); g.ellipse(26, 17, 11, 9, "c");
      crown(g, 26, 3, "e"); eyes(g, 26, 16, "g"); g.ellipse(26, 21, 4, 3, "f");
      g.line(15, 25, 4 - s, 29 + dig, "d", 7); g.line(37, 25, 48 + s, 29 + dig, "d", 7);
      claw(g, 5 - s, 29 + dig, -1, "i"); claw(g, 47 + s, 29 + dig, 1, "i");
      g.rect(15 - s, 37, 10, 4, K); g.rect(28 + s, 37, 10, 4, K); g.put(26, 29, "h");
    }),

    countessCarmine: () => boss(50, 50, { a: "#1d1427", b: "#38203e", c: "#67264d", d: "#a63755", e: "#dc5262", f: "#e8b6a5", g: "#ffffff", h: "#11101b", i: "#a278d2" }, (g, f) => {
      const spread = f === 2 ? 6 : 0, s = stride(f);
      g.poly([[21, 16], [9 - spread, 8], [3, 41], [20, 34], [25, 47], [30, 34], [47, 41], [41 + spread, 8], [29, 16]], K);
      g.poly([[21, 18], [11 - spread, 12], [7, 37], [21, 31], [25, 43], [29, 31], [43, 37], [39 + spread, 12], [29, 18]], "c");
      g.poly([[18, 18], [32, 18], [36, 43], [25, 47], [14, 43]], "a"); g.poly([[21, 19], [29, 19], [31, 42], [25, 45], [19, 42]], "b");
      g.ellipse(25, 13, 8, 9, K); g.ellipse(25, 13, 7, 8, "f"); g.poly([[17, 10], [21, 2], [25, 7], [30, 1], [33, 11]], "h");
      eyes(g, 25, 12, "e"); g.put(22, 17, "g"); g.put(28, 17, "g"); g.rect(22 + s, 46, 7, 3, K);
      if (f === 2) { g.line(8, 18, 0, 13, "i", 2); g.line(42, 18, 49, 13, "i", 2); }
    }),

    royalFool: () => boss(50, 50, { a: "#242042", b: "#50316f", c: "#8843a0", d: "#cf4385", e: "#f0bd50", f: "#e8aa72", g: "#ffffff", h: "#3fc7b7", i: "#fa7cb0" }, (g, f) => {
      const s = stride(f), reach = f === 2 ? 8 : 0;
      g.line(20, 39, 16 - s, 48, "c", 5); g.line(30, 39, 34 + s, 48, "h", 5);
      g.poly([[14, 19], [36, 19], [33, 42], [25, 38], [17, 42]], K); g.poly([[16, 20], [25, 20], [25, 37], [18, 40]], "c"); g.poly([[25, 20], [34, 20], [32, 40], [25, 37]], "d");
      g.ellipse(25, 15, 8, 8, K); g.ellipse(25, 15, 7, 7, "f"); eyes(g, 25, 14, "g"); g.line(21, 18, 29, 18, "a", 2);
      g.poly([[25, 8], [12, 0], [16, 12], [25, 5], [39, 0], [34, 13]], K); g.poly([[24, 7], [15, 2], [17, 9], [25, 3], [36, 2], [33, 10]], "b");
      g.ellipse(13, 1, 2, 2, "e"); g.ellipse(39, 1, 2, 2, "e");
      g.line(17, 24, 4 - reach, 14, "h", 3); g.line(33, 24, 46 + reach, 14, "i", 3); g.ellipse(4 - reach, 14, 3, 3, "e"); g.ellipse(46 + reach, 14, 3, 3, "e");
    }),

    admiralTortoise: () => boss(58, 42, { a: "#203b3a", b: "#35645b", c: "#57966c", d: "#8fc474", e: "#614936", f: "#9f7045", g: "#f3e6b8", h: "#d8a94c", i: "#70d5d2" }, (g, f) => {
      const s = stride(f), broadside = f === 2;
      g.ellipse(28, 25, 20, 14, K); g.ellipse(28, 25, 19, 13, "e"); g.ellipse(28, 25, 15, 10, "f");
      g.line(16, 17, 40, 33, "h", 2); g.line(40, 17, 16, 33, "h", 2); g.rect(25, 12, 6, 26, "d");
      g.ellipse(49, 23, 9, 7, K); g.ellipse(49, 23, 8, 6, "c"); eyes(g, 50, 21, "g");
      g.poly([[42, 17], [49, 10], [57, 17]], K); g.rect(44, 14, 11, 4, "a"); g.put(50, 10, "h");
      g.line(15, 31, 9 - s, 39, "b", 5); g.line(41, 31, 47 + s, 39, "b", 5);
      const cannon = broadside ? 12 : 7; g.line(25, 18, 25, 18 - cannon, K, 5); g.line(25, 17, 25, 18 - cannon, "i", 3); if (broadside) g.ellipse(25, 3, 4, 3, "g");
    }),

    paperRonin: () => boss(50, 50, { a: "#252435", b: "#5d5a68", c: "#aaa49d", d: "#e5ded0", e: "#c44c58", f: "#e1b55d", g: "#ffffff", h: "#678a9a", i: "#79dce1" }, (g, f) => {
      const s = stride(f), attack = f === 2;
      g.line(20, 39, 15 - s, 48, "b", 4); g.line(30, 39, 35 + s, 48, "c", 4);
      g.poly([[15, 18], [35, 18], [39, 42], [25, 38], [11, 42]], K); g.poly([[17, 20], [25, 18], [33, 20], [35, 39], [25, 36], [15, 39]], "d");
      g.line(25, 19, 25, 38, "e", 2); g.ellipse(25, 14, 8, 8, K); g.poly([[18, 11], [30, 8], [32, 18], [20, 20]], "c"); eyes(g, 25, 13, "a");
      g.poly([[7, 9], [25, 1], [45, 10], [26, 13]], K); g.poly([[11, 8], [25, 3], [41, 9], [26, 11]], "f");
      g.line(32, 23, attack ? 48 : 41, attack ? 7 : 38, K, 4); g.line(32, 23, attack ? 48 : 41, attack ? 7 : 38, "i", 2);
      g.poly([[13, 23], [5, 20], [11, 30]], "d");
    }),

    professorPerihelion: () => boss(52, 50, { a: "#17213a", b: "#26385f", c: "#46618c", d: "#7192b3", e: "#d0a64c", f: "#f0d078", g: "#ffffff", h: "#5ed9d5", i: "#9d70cf" }, (g, f) => {
      const orbit = stride(f) * 2;
      g.poly([[17, 20], [35, 20], [40, 47], [12, 47]], K); g.poly([[19, 21], [33, 21], [37, 45], [15, 45]], "b");
      g.ellipse(26, 15, 8, 8, K); g.ellipse(26, 15, 7, 7, "d"); eyes(g, 26, 14, "g");
      g.ellipse(26, 13, 20, 7, "e"); g.ellipse(26, 13, 17, 5, "a"); g.ellipse(8 + orbit, 10, 4, 4, "h"); g.ellipse(44 - orbit, 16, 3, 3, "i");
      g.line(35, 25, 47, 4, K, 4); g.line(36, 25, 47, 4, "f", 2); g.ellipse(47, 4, 4, 4, "g");
      g.rect(22, 26, 8, 3, "e"); g.line(26, 29, 26, 40, "h", 2); if (f === 2) g.ellipse(26, 30, 12, 12, "i");
    }),

    grandmotherBriar: () => boss(54, 50, { a: "#27302a", b: "#3e573d", c: "#62804a", d: "#8aaa52", e: "#684731", f: "#a67543", g: "#e9efbc", h: "#d97868", i: "#70d59b" }, (g, f) => {
      const reach = f === 2 ? 7 : 0, s = stride(f);
      g.poly([[18, 19], [35, 18], [41, 47], [11, 47]], K); g.poly([[20, 20], [33, 20], [38, 45], [14, 45]], "b");
      g.ellipse(27, 15, 8, 8, K); g.ellipse(27, 15, 7, 7, "f"); eyes(g, 27, 14, "i"); g.line(23, 19, 31, 19, "a", 2);
      g.line(21, 9, 12, 0, "e", 3); g.line(33, 9, 42, 0, "e", 3); g.line(15, 3, 9, 7, "e", 2); g.line(39, 3, 46, 7, "e", 2);
      g.ellipse(10, 7, 4, 3, "h"); g.ellipse(45, 7, 4, 3, "c");
      g.line(36, 24, 49 + reach, 8, K, 4); g.line(36, 24, 49 + reach, 8, "e", 2); g.line(48 + reach, 9, 52 + reach, 4, "c", 2);
      g.line(18, 43, 14 - s, 48, "e", 4); g.line(35, 43, 39 + s, 48, "e", 4); g.put(26, 29, "h");
    }),

    skySovereign: () => boss(60, 44, { a: "#263647", b: "#45617a", c: "#7595aa", d: "#b5c8d0", e: "#e5b85e", f: "#f5e7c4", g: "#ffffff", h: "#67d7df", i: "#8b72c5" }, (g, f) => {
      const flap = f === 1 ? -4 : f === 3 ? 3 : 0, s = stride(f);
      g.ellipse(32, 29, 15, 8, K); g.ellipse(32, 29, 14, 7, "e"); g.ellipse(24, 29, 8, 8, "b");
      g.poly([[34, 26], [24, 3 + flap], [17, 0 + flap], [18, 15 + flap], [8, 7 + flap], [12, 24 + flap], [1, 18 + flap], [18, 34]], K);
      g.poly([[32, 25], [24, 6 + flap], [20, 4 + flap], [21, 18 + flap], [12, 11 + flap], [15, 27 + flap], [6, 22 + flap], [19, 32]], "f");
      g.line(24, 6 + flap, 21, 28, "c", 2); g.line(13, 12 + flap, 20, 31, "h", 2);
      g.poly([[39, 27], [43, 14], [50, 8], [56, 12], [53, 24], [47, 31]], K); g.poly([[41, 26], [45, 15], [50, 10], [54, 12], [52, 22], [47, 29]], "f");
      g.poly([[53, 12], [60, 14], [55, 18], [51, 17]], "e"); g.put(51, 12, "g"); crown(g, 49, 2, "h");
      g.line(25, 34, 21 - s, 42, "b", 4); g.line(34, 34, 37 + s, 42, "e", 4); g.line(43, 31, 45 - s, 40, "e", 3); claw(g, 45 - s, 40, 1, "e");
      g.line(20, 30, 7, 38, "b", 3); g.ellipse(5, 38, 4, 3, "c");
    }),

    oldMason: () => boss(56, 52, { a: "#2f383b", b: "#4b5a5b", c: "#687777", d: "#929b91", e: "#c2bda2", f: "#789c50", g: "#eef0d7", h: "#62d5c4", i: "#d0a45a" }, (g, f) => {
      const reach = f === 2 ? 5 : 0, s = stride(f);
      g.poly([[15, 12], [41, 12], [47, 43], [37, 49], [19, 49], [9, 43]], K); g.poly([[17, 14], [39, 14], [44, 41], [35, 46], [21, 46], [12, 41]], "b");
      g.poly([[17, 14], [22, 4], [34, 4], [40, 14]], "d"); g.rect(23, 13, 10, 9, "a"); eyes(g, 28, 16, "h");
      g.line(28, 22, 28, 39, "h", 3); g.line(19, 31, 37, 31, "i", 2);
      g.line(13, 24, 2 - reach, 37, "c", 8); g.line(43, 24, 54 + reach, 37, "c", 8); g.rect(0, 35, 10, 8, K); g.rect(46, 35, 10, 8, K);
      g.rect(15 - s, 45, 12, 6, K); g.rect(30 + s, 45, 12, 6, K); g.ellipse(17, 12, 4, 4, "f"); g.ellipse(39, 11, 3, 5, "e");
    }),

    silkMatriarch: () => boss(60, 46, { a: "#201b38", b: "#3b2c5b", c: "#624080", d: "#96508e", e: "#d26ca8", f: "#e8d4e6", g: "#ffffff", h: "#5ed5cf", i: "#c79be5" }, (g, f) => {
      const flex = stride(f), attack = f === 2;
      g.ellipse(31, 30, 13, 11, K); g.ellipse(31, 30, 12, 10, "b"); g.ellipse(31, 17, 9, 9, K); g.ellipse(31, 17, 8, 8, "c");
      crown(g, 31, 4, "i"); eyes(g, 31, 16, "h"); g.put(27, 20, "g"); g.put(35, 20, "g");
      for (const side of [-1, 1]) for (let n = 0; n < 4; n++) {
        const sy = 22 + n * 5, knee = 13 + n * 2, foot = 27 + n * 3;
        g.line(31 + side * 8, sy, 31 + side * knee, sy - 7 + n, n === 0 ? "i" : "d", 3);
        g.line(31 + side * knee, sy - 7 + n, 31 + side * (foot + flex * (n % 2 ? 1 : -1)), 35 + n * 2, "e", 2);
      }
      g.ellipse(31, 30, 7, 6, "d"); if (attack) { g.line(31, 12, 31, 0, "f", 2); g.ellipse(31, 3, 5, 4, "h"); }
    }),

    bellTitan: () => boss(54, 52, { a: "#222838", b: "#3a4657", c: "#627080", d: "#98a2a8", e: "#b8893e", f: "#e3c068", g: "#ffffff", h: "#6ed4dc", i: "#b65870" }, (g, f) => {
      const sway = stride(f), ring = f === 2 ? 5 : 0;
      g.rect(21, 2, 12, 7, K); g.rect(24, 0, 6, 5, "h");
      g.poly([[18, 7], [36, 7], [45 + ring, 40], [50, 44], [4, 44], [9 - ring, 40]], K);
      g.poly([[20, 9], [34, 9], [42 + ring, 39], [46, 42], [8, 42], [12 - ring, 39]], "b");
      g.rect(17, 13, 20, 4, "e"); g.poly([[15, 23], [27, 15], [39, 23], [35, 38], [19, 38]], "c"); eyes(g, 27, 23, "h");
      g.line(27, 37, 27 + sway, 50, "e", 3); g.ellipse(27 + sway, 49, 6, 4, "f");
      g.line(12, 28, 2 - ring, 37, "d", 5); g.line(42, 28, 52 + ring, 37, "d", 5); if (f === 2) { g.put(1, 17, "g"); g.put(52, 15, "g"); }
    }),

    lanternKeeper: () => boss(52, 52, { a: "#2b2140", b: "#563354", c: "#963d5c", d: "#dc555d", e: "#f29250", f: "#ffda83", g: "#ffffff", h: "#5fd2cc", i: "#c57cca" }, (g, f) => {
      const bob = stride(f), flare = f === 2 ? 5 : 0;
      g.line(26, 0, 26, 7 + bob, "e", 3); g.rect(18, 5 + bob, 16, 4, K);
      g.poly([[14 - flare, 9 + bob], [38 + flare, 9 + bob], [45, 36 + bob], [35, 47 + bob], [17, 47 + bob], [7, 36 + bob]], K);
      g.poly([[16 - flare, 11 + bob], [36 + flare, 11 + bob], [41, 35 + bob], [33, 44 + bob], [19, 44 + bob], [11, 35 + bob]], "b");
      g.rect(15, 16 + bob, 22, 3, "e"); g.line(15, 16 + bob, 19, 42 + bob, "h", 2); g.line(37, 16 + bob, 33, 42 + bob, "h", 2);
      g.poly([[26, 40 + bob], [17, 31 + bob], [22, 17 + bob], [26, 23 + bob], [31, 15 + bob], [35, 31 + bob]], "d"); g.poly([[26, 37 + bob], [21, 30 + bob], [26, 22 + bob], [31, 30 + bob]], "f");
      eyes(g, 26, 28 + bob, "g"); if (f === 2) { g.line(10, 31, 0, 25, "i", 2); g.line(42, 31, 51, 25, "i", 2); }
    }),

    lastWorldbearer: () => boss(60, 56, { a: "#292c36", b: "#4b4e58", c: "#6e6f70", d: "#969083", e: "#c4ad78", f: "#7c754e", g: "#fff0c0", h: "#e06b55", i: "#68cbb9" }, (g, f) => {
      const s = stride(f), lift = f === 2 ? -4 : 0;
      g.ellipse(30, 11 + lift, 13, 11, K); g.ellipse(30, 11 + lift, 12, 10, "f"); g.poly([[20, 10 + lift], [30, 1 + lift], [40, 10 + lift], [36, 17 + lift], [24, 17 + lift]], "i");
      g.poly([[16, 20], [44, 20], [49, 49], [36, 54], [24, 54], [11, 49]], K); g.poly([[18, 22], [42, 22], [46, 47], [35, 51], [25, 51], [14, 47]], "b");
      g.ellipse(30, 27, 9, 9, K); g.ellipse(30, 27, 8, 8, "d"); eyes(g, 30, 26, "g"); g.line(30, 32, 30, 43, "h", 3);
      g.line(18, 25, 7, 12 + lift, "c", 8); g.line(42, 25, 53, 12 + lift, "c", 8); g.line(7, 12 + lift, 18, 8 + lift, "e", 5); g.line(53, 12 + lift, 42, 8 + lift, "e", 5);
      g.rect(17 - s, 49, 11, 6, K); g.rect(33 + s, 49, 11, 6, K); g.put(30, 8 + lift, "h");
    }),

    godAvatar: () => boss(58, 54, { a: "#1c2034", b: "#353b5b", c: "#60698b", d: "#9aa5c1", e: "#e3b85d", f: "#efe7dc", g: "#ffffff", h: "#65d8d3", i: "#b778d3" }, (g, f) => {
      const orbit = stride(f) * 2, reach = f === 2 ? 7 : 0;
      g.ellipse(29, 13, 17, 10, "e"); g.ellipse(29, 13, 14, 7, "a"); g.ellipse(29, 13, 10, 5, "i");
      g.poly([[19, 19], [39, 19], [45, 49], [29, 53], [13, 49]], K); g.poly([[21, 21], [37, 21], [41, 47], [29, 50], [17, 47]], "b");
      g.ellipse(29, 17, 9, 9, K); g.ellipse(29, 17, 8, 8, "f"); eyes(g, 29, 16, "a"); g.put(29, 22, "h");
      g.line(18, 26, 4 - reach, 18, "c", 5); g.line(40, 26, 54 + reach, 18, "d", 5);
      g.ellipse(5 + orbit, 7, 4, 4, "h"); g.ellipse(53 - orbit, 10, 4, 4, "i"); g.ellipse(9 - orbit, 40, 3, 3, "e"); g.ellipse(49 + orbit, 41, 3, 3, "g");
      g.line(24, 48, 20 - stride(f), 53, "c", 4); g.line(34, 48, 38 + stride(f), 53, "c", 4); if (f === 2) g.ellipse(29, 34, 8, 8, "h");
    }),
  };

  for (const [id, build] of Object.entries(art)) {
    if (G.enemies[id]) G.enemies[id].sprite = build();
  }
  G.authoredBossArtIds = Object.keys(art);
})();
