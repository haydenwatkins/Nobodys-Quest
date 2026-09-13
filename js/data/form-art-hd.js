/* ============================================================
   AUTHORED FORM ART — the high-density character collection.

   These are deliberately drawn from independent silhouettes instead of
   enlarging the old text grids. Each form owns four real poses: a breathing
   idle, two different strides, and a signature attack/readiness pose.
   The recipes still resolve to the game's tiny, inspectable pixel grids, so
   no save data or gameplay measurements depend on an image-file pipeline.
   ============================================================ */

"use strict";

(() => {
  const K = "k";

  function grid(width, height) {
    const cells = Array.from({ length: height }, () => Array(width).fill("."));
    const put = (x, y, color) => {
      x = Math.round(x); y = Math.round(y);
      if (x >= 0 && x < width && y >= 0 && y < height) cells[y][x] = color;
    };
    const rect = (x, y, w, h, color) => {
      for (let yy = Math.round(y); yy < Math.round(y + h); yy++)
        for (let xx = Math.round(x); xx < Math.round(x + w); xx++) put(xx, yy, color);
    };
    const line = (x0, y0, x1, y1, color, weight) => {
      const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
      const radius = Math.max(0, Math.floor((weight || 1) / 2));
      for (let n = 0; n <= steps; n++) {
        const x = x0 + (x1 - x0) * n / steps, y = y0 + (y1 - y0) * n / steps;
        for (let yy = -radius; yy <= radius; yy++) for (let xx = -radius; xx <= radius; xx++) put(x + xx, y + yy, color);
      }
    };
    const ellipse = (cx, cy, rx, ry, color) => {
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
        for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
          if (((x - cx) * (x - cx)) / (rx * rx) + ((y - cy) * (y - cy)) / (ry * ry) <= 1) put(x, y, color);
    };
    const poly = (points, color) => {
      const minY = Math.floor(Math.min(...points.map((p) => p[1]))), maxY = Math.ceil(Math.max(...points.map((p) => p[1])));
      for (let y = minY; y <= maxY; y++) {
        const cuts = [];
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
          const a = points[j], b = points[i];
          if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y))
            cuts.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
        }
        cuts.sort((a, b) => a - b);
        for (let i = 0; i + 1 < cuts.length; i += 2) for (let x = Math.ceil(cuts[i]); x <= Math.floor(cuts[i + 1]); x++) put(x, y, color);
      }
    };
    return { width, height, cells, put, rect, line, ellipse, poly, rows: () => cells.map((row) => row.join("")) };
  }

  function palette(colors) {
    return Object.assign({ k: "#151522" }, colors);
  }

  function feet(g, cx, frame, leftColor, rightColor) {
    const stride = frame === 1 ? 2 : frame === 3 ? -2 : 0;
    g.line(cx - 3, g.height - 9, cx - 3 - stride, g.height - 3, leftColor, 2);
    g.line(cx + 3, g.height - 9, cx + 3 + stride, g.height - 3, rightColor || leftColor, 2);
    g.rect(cx - 6 - stride, g.height - 3, 6, 2, K);
    g.rect(cx + 1 + stride, g.height - 3, 6, 2, K);
  }

  function face(g, cx, y, skin, eye, mood) {
    g.ellipse(cx, y, 5, 5, K);
    g.ellipse(cx, y, 4, 4, skin);
    g.rect(cx - 3, y - 1, 2, 2, eye);
    g.rect(cx + 2, y - 1, 2, 2, eye);
    if (mood === "mask") g.rect(cx - 3, y + 2, 7, 2, K);
    else if (mood === "fang") { g.put(cx - 2, y + 3, "g"); g.put(cx + 2, y + 3, "g"); }
  }

  function humanoid(g, frame, opts) {
    const cx = opts.cx || Math.floor(g.width / 2), bob = frame === 3 ? 1 : 0;
    feet(g, cx, frame, opts.legs || "a", opts.legs2);
    g.poly([[cx - 7, 17 + bob], [cx + 7, 17 + bob], [cx + 6, g.height - 8], [cx - 6, g.height - 8]], K);
    g.poly([[cx - 6, 18 + bob], [cx + 6, 18 + bob], [cx + 5, g.height - 9], [cx - 5, g.height - 9]], opts.body || "b");
    g.rect(cx - 4, 20 + bob, 8, 3, opts.trim || "c");
    face(g, cx, 12 + bob, opts.skin || "f", opts.eye || "g", opts.mood);
    return { cx, bob };
  }

  function authored(width, height, paletteDef, draw) {
    const frames = [];
    for (let frame = 0; frame < 4; frame++) {
      const g = grid(width, height);
      draw(g, frame);
      frames.push(g.rows());
    }
    return {
      palette: paletteDef,
      frames,
      density: 2,
      authored: true,
      animations: { idle: [0, 0, 3, 0], walk: [0, 1, 0, 3], attack: [2] },
    };
  }

  function compactSprite(dense) {
    const frames = dense.frames.map((rows) => {
      const height = Math.ceil(rows.length / 2), width = Math.ceil(rows[0].length / 2);
      const out = [];
      for (let y = 0; y < height; y++) {
        let row = "";
        for (let x = 0; x < width; x++) {
          const count = new Map();
          for (let yy = 0; yy < 2; yy++) for (let xx = 0; xx < 2; xx++) {
            const key = rows[y * 2 + yy] && rows[y * 2 + yy][x * 2 + xx] || ".";
            if (key !== "." && key !== " ") count.set(key, (count.get(key) || 0) + (key === K ? 0.9 : 1));
          }
          row += count.size ? Array.from(count).sort((a, b) => b[1] - a[1])[0][0] : ".";
        }
        out.push(row);
      }
      return out;
    });
    return { palette: dense.palette, frames, animations: dense.animations, hd: dense, rebuilt: true };
  }

  // World-sized characters (bosses, set-piece guardians) use the same authored
  // pixel grammar as the forms. Keeping one renderer prevents the roster and
  // its enemies from drifting into visibly different art styles.
  G.authoredPixelArt = { grid, palette, authored, compactSprite, ink: K };

  const art = {
    nobody: () => authored(30, 34, palette({ a: "#596275", b: "#f6f0e8", c: "#ffffff", d: "#79d6d2", e: "#c6cbd5", f: "#ece5dc", g: "#293243", h: "#a9f0e7" }), (g, f) => {
      const { cx, bob } = humanoid(g, f, { body: "b", trim: "e", legs: "a", skin: "b", eye: "g" });
      g.ellipse(cx, 11 + bob, 6, 6, K); g.ellipse(cx, 11 + bob, 5, 5, "b");
      g.rect(cx - 3, 10 + bob, 2, 3, "g"); g.rect(cx + 2, 10 + bob, 2, 3, "g");
      g.put(cx, 16 + bob, "d"); g.put(cx + 1, 17 + bob, "h");
      if (f === 2) { g.line(cx - 6, 21, cx - 12, 16, "d", 2); g.line(cx + 6, 21, cx + 12, 16, "d", 2); }
    }),

    rat: () => authored(32, 24, palette({ a: "#435265", b: "#73869b", c: "#aebdca", d: "#f08b8b", e: "#ffd0ba", f: "#edf3f4", g: "#283342", h: "#d15c73" }), (g, f) => {
      const run = f === 1 ? 2 : f === 3 ? -2 : 0;
      g.line(7, 15, f === 2 ? 1 : 3, f === 2 ? 7 : 11, "d", 2);
      g.ellipse(17, 14, 10, 6, K); g.ellipse(17, 14, 9, 5, "b");
      g.ellipse(24, 10, 6, 6, K); g.ellipse(24, 10, 5, 5, "c");
      g.ellipse(21, 5, 4, 4, K); g.ellipse(21, 5, 3, 3, "d");
      g.ellipse(27, 5, 4, 4, K); g.ellipse(27, 5, 3, 3, "d");
      g.rect(25, 9, 2, 2, "g"); g.rect(29, 11, 2, 2, "e");
      g.line(12, 18, 10 - run, 22, K, 2); g.line(21, 18, 23 + run, 22, K, 2);
      g.rect(10, 13, 3, 2, "a"); if (f === 2) { g.line(27, 14, 31, 17, "f", 1); g.line(27, 15, 31, 14, "f", 1); }
    }),

    knight: () => authored(34, 36, palette({ a: "#39465d", b: "#71849c", c: "#aebdcc", d: "#e8f0ee", e: "#d64f62", f: "#ffc857", g: "#ffffff", h: "#263047", i: "#8dd9e8" }), (g, f) => {
      const { cx } = humanoid(g, f, { body: "a", trim: "f", legs: "h", skin: "c", eye: "g", mood: "mask" });
      g.ellipse(cx, 11, 8, 7, K); g.ellipse(cx, 11, 7, 6, "b"); g.rect(cx - 6, 11, 12, 3, "h");
      g.rect(cx - 4, 12, 2, 2, "i"); g.rect(cx + 3, 12, 2, 2, "i");
      g.line(cx, 5, cx + (f === 3 ? -3 : 3), 0, "e", 3);
      const shieldX = f === 2 ? cx + 8 : cx - 9;
      g.ellipse(shieldX, 23, 6, 8, K); g.ellipse(shieldX, 23, 5, 7, "e"); g.rect(shieldX - 1, 18, 2, 10, "f");
      g.line(cx + 7, 21, f === 2 ? cx + 16 : cx + 10, f === 2 ? 11 : 27, "d", 2);
    }),

    ranger: () => authored(34, 36, palette({ a: "#173c35", b: "#28634c", c: "#57a85b", d: "#a5d66f", e: "#684c37", f: "#dba77d", g: "#f5e1bc", h: "#e9f5d0", i: "#98d8b2" }), (g, f) => {
      const cx = 16, bob = f === 3 ? 1 : 0;
      feet(g, cx, f, "a");
      g.poly([[cx - 7, 13 + bob], [cx, 4 + bob], [cx + 8, 14 + bob], [cx + 5, 31], [cx - 6, 31]], K);
      g.poly([[cx - 6, 14 + bob], [cx, 6 + bob], [cx + 6, 14 + bob], [cx + 4, 29], [cx - 5, 29]], "b");
      face(g, cx, 13 + bob, "f", "h"); g.rect(cx - 5, 17, 10, 3, "c");
      const bowX = f === 2 ? 29 : 26; g.line(bowX, 10, bowX + (f === 2 ? 2 : 0), 29, "e", 2); g.line(bowX, 10, bowX - 5, 20, "h", 1); g.line(bowX - 5, 20, bowX, 29, "h", 1);
      if (f === 2) g.line(cx + 3, 20, 32, 20, "d", 1);
      g.line(cx - 6, 20, cx - 12, 27, "d", 2);
    }),

    wizard: () => authored(36, 38, palette({ a: "#182452", b: "#294a91", c: "#536fcb", d: "#8ca6ff", e: "#f0c86e", f: "#d8a67c", g: "#ffffff", h: "#72e3ff", i: "#8d66d9" }), (g, f) => {
      const cx = 17, bob = f === 3 ? 1 : 0;
      feet(g, cx, f, "a");
      g.poly([[cx - 8, 18], [cx + 7, 18], [cx + 9, 33], [cx - 9, 33]], K); g.poly([[cx - 6, 19], [cx + 5, 19], [cx + 7, 32], [cx - 7, 32]], "b");
      face(g, cx, 15 + bob, "f", "g");
      g.poly([[4, 12 + bob], [cx - 1, 1 + bob], [cx + 7, 12 + bob]], K); g.poly([[7, 10 + bob], [cx - 1, 3 + bob], [cx + 4, 11 + bob]], "c");
      g.rect(4, 11 + bob, 22, 4, K); g.rect(6, 11 + bob, 18, 2, "a"); g.put(cx + 1, 6 + bob, "e");
      const staffX = f === 2 ? 31 : 28; g.line(staffX, 10, staffX - 2, 34, "e", 2); g.ellipse(staffX, 8, 4, 4, K); g.ellipse(staffX, 8, 3, 3, "h"); g.put(staffX, 7, "g");
    }),

    frog: () => authored(34, 26, palette({ a: "#185044", b: "#2f8f58", c: "#55c667", d: "#a6e66f", e: "#f0e98a", f: "#f47d8d", g: "#ffffff", h: "#253648", i: "#79e4c1" }), (g, f) => {
      const crouch = f === 2 ? 2 : 0;
      g.ellipse(17, 15 + crouch, 12, 8, K); g.ellipse(17, 15 + crouch, 11, 7, "c");
      g.ellipse(10, 8 + crouch, 5, 5, K); g.ellipse(10, 8 + crouch, 4, 4, "d");
      g.ellipse(24, 8 + crouch, 5, 5, K); g.ellipse(24, 8 + crouch, 4, 4, "d");
      g.rect(9, 7 + crouch, 2, 3, "h"); g.rect(23, 7 + crouch, 2, 3, "h");
      g.line(8, 19 + crouch, f === 1 ? 1 : 4, 23, "b", 3); g.line(26, 19 + crouch, f === 3 ? 33 : 30, 23, "b", 3);
      g.rect(11, 18 + crouch, 12, 2, "e"); g.rect(14, 20 + crouch, 6, 2, "f");
      if (f === 2) g.line(17, 19, 32, 14, "f", 2);
    }),

    alchemist: () => authored(36, 36, palette({ a: "#283448", b: "#4f6577", c: "#8aa7a6", d: "#e1b85a", e: "#f4df8b", f: "#d69b72", g: "#ffffff", h: "#5ad4c8", i: "#bd5d6d" }), (g, f) => {
      const { cx } = humanoid(g, f, { body: "b", trim: "d", legs: "a", skin: "f", eye: "g" });
      g.ellipse(cx, 10, 7, 6, K); g.rect(cx - 8, 5, 16, 4, "c"); g.rect(cx - 6, 8, 5, 4, K); g.rect(cx + 2, 8, 5, 4, K); g.rect(cx - 5, 9, 3, 2, "h"); g.rect(cx + 3, 9, 3, 2, "h");
      g.rect(cx - 10, 19, 5, 10, K); g.rect(cx - 9, 20, 3, 8, "d");
      const flaskX = f === 2 ? cx + 13 : cx + 9; g.line(cx + 5, 20, flaskX, 16, "c", 2); g.ellipse(flaskX, 14, 4, 5, K); g.ellipse(flaskX, 15, 3, 3, "h"); g.rect(flaskX - 1, 9, 2, 3, "e");
      if (f === 2) { g.put(flaskX + 4, 9, "i"); g.put(flaskX + 6, 6, "h"); }
    }),

    stormcaller: () => authored(38, 38, palette({ a: "#23264f", b: "#41478c", c: "#6f78d2", d: "#b9c0ff", e: "#ffe45d", f: "#c8d8df", g: "#ffffff", h: "#5de1ff", i: "#7c4bb3" }), (g, f) => {
      const cx = 19, lift = f === 1 ? 1 : f === 3 ? -1 : 0;
      g.poly([[cx - 8, 16 + lift], [cx + 8, 16 + lift], [cx + 11, 32 + lift], [cx, 35 + lift], [cx - 11, 32 + lift]], K);
      g.poly([[cx - 6, 17 + lift], [cx + 6, 17 + lift], [cx + 8, 31 + lift], [cx, 33 + lift], [cx - 8, 31 + lift]], "b");
      face(g, cx, 13 + lift, "d", "h");
      g.ellipse(cx, 6 + lift, 10, 6, K); g.ellipse(cx - 5, 6 + lift, 5, 4, "f"); g.ellipse(cx + 4, 5 + lift, 6, 5, "d");
      g.line(9, 6, 4, 1, "e", 2); g.line(29, 5, 35, 0, "h", 2);
      const reach = f === 2 ? 17 : 11; g.line(cx - 6, 20, cx - reach, 18, "c", 3); g.line(cx + 6, 20, cx + reach, 18, "c", 3);
      g.put(cx - reach - 1, 17, "e"); g.put(cx + reach + 1, 17, "e");
    }),

    dragon: () => authored(56, 38, palette({ a: "#352033", b: "#6d3045", c: "#a83f50", d: "#db5a54", e: "#ef8b58", f: "#ffd58a", g: "#fff5dc", h: "#432a55", i: "#65d4d0" }), (g, f) => {
      const flap = f === 1 ? -3 : f === 3 ? 2 : 0;
      const stride = f === 1 ? 2 : f === 3 ? -2 : 0;
      // Long, tapered reptile tail — deliberately not a mammal's curled tail.
      g.line(20, 24, 10, 27, K, 7); g.line(11, 27, 3, 34, K, 5); g.line(20, 24, 10, 27, "c", 4); g.line(10, 27, 3, 34, "d", 2); g.put(1, 35, "f");
      // Far wing and far legs sit behind the torso.
      g.poly([[28, 20], [20, 4 + flap], [13, 1 + flap], [16, 13 + flap], [7, 9 + flap], [14, 24]], K);
      g.poly([[27, 20], [20, 7 + flap], [15, 4 + flap], [18, 16 + flap], [10, 12 + flap], [16, 22]], "h");
      g.line(19, 6 + flap, 18, 18 + flap, "e", 2); g.line(11, 11 + flap, 22, 20, "e", 2);
      g.line(22, 27, 19 + stride, 35, "a", 4); g.line(34, 27, 32 - stride, 35, "a", 4);
      // Low barrel chest and armored belly.
      g.ellipse(31, 23, 14, 8, K); g.ellipse(31, 23, 13, 7, "b");
      g.ellipse(35, 24, 8, 5, "c"); g.line(23, 27, 40, 28, "e", 2);
      // Four independent legs: rear haunches and forward, clawed forelegs.
      g.line(24, 27, 22 - stride, 35, "c", 4); g.line(36, 27, 39 + stride, 35, "d", 4);
      for (const x of [18 + stride, 21 - stride, 31 - stride, 38 + stride]) { g.line(x, 35, x + 4, 35, K, 2); g.put(x + 4, 34, "f"); }
      // S-curved neck, long snout, brow horns and jaw give a dragon profile.
      g.line(39, 22, 43, 12, K, 8); g.line(40, 21, 44, 12, "c", 6);
      g.ellipse(47, 10, 7, 5, K); g.ellipse(47, 10, 6, 4, "d");
      g.poly([[49, 9], [55, 11], [54, 15], [47, 14]], K); g.poly([[49, 10], [54, 11], [53, 13], [48, 13]], "e");
      g.line(43, 7, 39, 1, "f", 2); g.line(48, 6, 50, 0, "f", 2); g.put(49, 9, "g"); g.put(53, 12, "a");
      g.poly([[39, 17], [36, 14], [40, 13]], "f"); g.poly([[40, 21], [36, 19], [40, 17]], "e");
      if (f === 2) { g.poly([[54, 12], [55, 9], [55, 15]], "f"); g.put(53, 8, "i"); g.put(55, 6, "i"); g.put(51, 5, "e"); }
    }),

    riftblade: () => authored(38, 38, palette({ a: "#1e2142", b: "#38356f", c: "#6851ad", d: "#cf4ecf", e: "#54e1e6", f: "#e9b574", g: "#ffffff", h: "#202a54", i: "#ff8ae8" }), (g, f) => {
      const { cx } = humanoid(g, f, { body: "b", trim: "d", legs: "a", skin: "f", eye: "e", mood: "mask" });
      g.rect(cx - 10, 6, 20, 3, K); g.rect(cx - 8, 5, 16, 2, "h"); g.poly([[cx - 5, 5], [cx, 0], [cx + 5, 5]], "c");
      g.line(cx - 7, 20, cx - 11, 31, "i", 2);
      const endX = f === 2 ? 35 : 30, endY = f === 2 ? 9 : 26; g.line(cx + 5, 22, endX, endY, K, 3); g.line(cx + 7, 20, endX, endY, "e", 1); g.put(endX, endY, "g");
      g.line(cx - 4, 31, cx - 8, 35, "d", 2); g.line(cx + 3, 31, cx + 8, 35, "e", 2);
    }),

    mole: () => authored(38, 30, palette({ a: "#302b3b", b: "#55465c", c: "#836a72", d: "#c39b72", e: "#f0c77b", f: "#f19391", g: "#ffffff", h: "#90b5bd", i: "#d9eff1" }), (g, f) => {
      const dig = f === 2 ? 4 : 0;
      g.ellipse(19, 17, 11, 10, K); g.ellipse(19, 17, 10, 9, "b");
      g.ellipse(19, 10, 8, 7, K); g.ellipse(19, 10, 7, 6, "c");
      g.rect(12, 5, 14, 3, "d"); g.rect(15, 3, 8, 3, "e"); g.rect(18, 1, 3, 3, "i");
      g.rect(15, 10, 2, 2, "g"); g.rect(23, 10, 2, 2, "g"); g.ellipse(19, 14, 3, 2, "f");
      g.line(11, 17, 3, 21 - dig, "d", 4); g.line(27, 17, 35, 21 - dig, "d", 4);
      for (let x = 1; x <= 5; x += 2) g.line(x, 19 - dig, x - 1, 15 - dig, "i", 1);
      for (let x = 33; x <= 37; x += 2) g.line(x, 19 - dig, x + 1, 15 - dig, "i", 1);
      g.rect(12 + (f === 1 ? -2 : 0), 25, 7, 3, K); g.rect(21 + (f === 3 ? 2 : 0), 25, 7, 3, K);
    }),

    vampire: () => authored(40, 40, palette({ a: "#24182e", b: "#442348", c: "#752d53", d: "#b33e5c", e: "#ee7180", f: "#e6c5b5", g: "#ffffff", h: "#15111d", i: "#9b78d1" }), (g, f) => {
      const cx = 20, spread = f === 2 ? 5 : 0;
      feet(g, cx, f, "a");
      g.poly([[cx - 5, 18], [cx - 15 - spread, 11], [cx - 12, 34], [cx, 29], [cx + 12, 34], [cx + 15 + spread, 11], [cx + 5, 18]], K);
      g.poly([[cx - 5, 19], [cx - 12 - spread, 14], [cx - 9, 31], [cx, 27], [cx + 9, 31], [cx + 12 + spread, 14], [cx + 5, 19]], "c");
      g.rect(cx - 6, 19, 12, 13, "a"); face(g, cx, 13, "f", "d", "fang");
      g.poly([[cx - 7, 9], [cx - 4, 4], [cx, 8], [cx + 4, 4], [cx + 7, 9]], "h");
      g.rect(cx - 2, 21, 4, 6, "g"); g.put(cx, 24, "e");
      if (f === 2) { g.line(cx - 13, 13, 2, 7, "i", 2); g.line(cx + 13, 13, 38, 7, "i", 2); }
    }),

    jester: () => authored(40, 40, palette({ a: "#282047", b: "#55347c", c: "#8d4fb0", d: "#cf4d8f", e: "#f3c35c", f: "#e5b07a", g: "#ffffff", h: "#45c8bf", i: "#ff84b7" }), (g, f) => {
      const { cx } = humanoid(g, f, { body: "b", trim: "d", legs: f === 3 ? "h" : "c", legs2: f === 3 ? "c" : "h", skin: "f", eye: "g" });
      g.poly([[cx, 7], [cx - 8, 0], [cx - 6, 10], [cx, 5], [cx + 9, 1], [cx + 6, 11]], K);
      g.poly([[cx, 6], [cx - 6, 2], [cx - 5, 8], [cx, 4], [cx + 7, 3], [cx + 5, 9]], f % 2 ? "d" : "c");
      g.ellipse(cx - 8, 1, 2, 2, "e"); g.ellipse(cx + 9, 2, 2, 2, "e");
      g.rect(cx - 6, 19, 6, 12, "c"); g.rect(cx, 19, 6, 12, "d");
      const hand = f === 2 ? 16 : 10; g.line(cx - 5, 21, cx - hand, 14, "h", 2); g.line(cx + 5, 21, cx + hand, 14, "i", 2);
      g.ellipse(cx - hand, 13, 3, 3, "e"); g.ellipse(cx + hand, 13, 3, 3, "e");
    }),

    turtle: () => authored(42, 32, palette({ a: "#253b35", b: "#386b4a", c: "#5ba85b", d: "#9bd269", e: "#6c5038", f: "#a87b48", g: "#f3ebc6", h: "#d9a944", i: "#7de39a" }), (g, f) => {
      const roll = f === 2;
      g.ellipse(20, roll ? 18 : 16, roll ? 12 : 14, roll ? 12 : 11, K); g.ellipse(20, roll ? 18 : 16, roll ? 11 : 13, roll ? 11 : 10, "e");
      g.ellipse(20, roll ? 18 : 16, roll ? 8 : 10, roll ? 8 : 8, "f");
      g.line(13, 11, 27, 22, "h", 2); g.line(27, 11, 13, 22, "h", 2); g.rect(18, 8, 4, 17, "d");
      if (!roll) { g.ellipse(34, 16, 7, 6, K); g.ellipse(34, 16, 6, 5, "c"); g.rect(36, 14, 2, 2, "g"); }
      const stride = f === 1 ? 2 : f === 3 ? -2 : 0; g.line(11, 22, 7 - stride, 29, "b", 3); g.line(29, 22, 33 + stride, 29, "b", 3);
      if (roll) { g.put(6, 22, "i"); g.put(3, 18, "i"); }
    }),

    samurai: () => authored(40, 40, palette({ a: "#1e2537", b: "#303d59", c: "#596a82", d: "#a9364d", e: "#df5b61", f: "#e2b178", g: "#ffffff", h: "#e9d39a", i: "#73d4df" }), (g, f) => {
      const { cx } = humanoid(g, f, { body: "a", trim: "d", legs: "b", skin: "f", eye: "g", mood: "mask" });
      g.line(cx - 12, 8, cx + 12, 8, K, 3); g.poly([[cx - 9, 7], [cx, 1], [cx + 9, 7]], "h"); g.rect(cx - 10, 7, 20, 2, "d");
      g.poly([[cx - 7, 24], [cx, 20], [cx + 7, 24], [cx + 10, 33], [cx - 10, 33]], "b");
      const drawn = f === 2; g.line(cx + 5, 23, drawn ? 37 : cx + 14, drawn ? 9 : 31, K, 3); g.line(cx + 7, 21, drawn ? 37 : cx + 14, drawn ? 9 : 31, "i", 1);
      g.line(cx - 5, 23, cx - 12, 31, "d", 3);
    }),

    astronomer: () => authored(42, 40, palette({ a: "#182440", b: "#263b68", c: "#49679a", d: "#719bc2", e: "#d6ad58", f: "#f2d785", g: "#ffffff", h: "#5de0dc", i: "#a77bd9" }), (g, f) => {
      const { cx } = humanoid(g, f, { body: "b", trim: "e", legs: "a", skin: "d", eye: "g" });
      g.ellipse(cx, 9, 9, 8, K); g.ellipse(cx, 9, 8, 7, "a"); g.ellipse(cx, 9, 6, 5, "c"); g.put(cx + 3, 6, "g");
      g.ellipse(cx, 9, 13, 5, "e"); g.ellipse(cx, 9, 11, 3, "a"); g.ellipse(cx + (f === 3 ? -10 : 10), 7, 3, 3, "h");
      const arm = f === 2 ? 15 : 9; g.line(cx - 6, 21, cx - arm, 15, "d", 2); g.line(cx + 6, 21, cx + arm, 15, "d", 2);
      g.ellipse(cx - arm, 14, 2, 2, "i"); g.ellipse(cx + arm, 14, 2, 2, "f");
    }),

    druid: () => authored(42, 40, palette({ a: "#26362f", b: "#3f6245", c: "#65984e", d: "#91c75a", e: "#6f4d33", f: "#b9844d", g: "#edf4d0", h: "#eaa65d", i: "#8de4b3" }), (g, f) => {
      const { cx } = humanoid(g, f, { body: "b", trim: "d", legs: "e", skin: "f", eye: "i" });
      g.ellipse(cx, 11, 7, 7, K); g.ellipse(cx, 11, 6, 6, "a");
      g.line(cx - 4, 6, cx - 11, 0, "e", 2); g.line(cx - 8, 3, cx - 13, 5, "e", 2); g.line(cx + 4, 6, cx + 11, 0, "e", 2); g.line(cx + 8, 3, cx + 13, 5, "e", 2);
      g.ellipse(cx - 12, 5, 3, 2, "h"); g.ellipse(cx + 12, 4, 3, 2, "d");
      g.line(cx - 6, 21, cx - 12, 29, "c", 3); g.line(cx + 6, 21, cx + 12, 29, "c", 3);
      if (f === 2) { g.line(cx + 8, 21, 39, 8, "e", 2); g.ellipse(39, 7, 3, 4, "i"); }
    }),

    griffin: () => authored(56, 38, palette({ a: "#342d39", b: "#6a4c48", c: "#a86e4b", d: "#d69a58", e: "#f0c76d", f: "#f4e7ca", g: "#ffffff", h: "#738fa0", i: "#72d4dc" }), (g, f) => {
      const wing = f === 1 ? -3 : f === 3 ? 2 : 0;
      const stride = f === 1 ? 2 : f === 3 ? -2 : 0;
      // Lion tail and tuft, behind the hindquarters.
      g.line(20, 24, 8, 28, K, 4); g.line(8, 28, 4, 23, "c", 2); g.ellipse(3, 22, 3, 4, K); g.ellipse(3, 22, 2, 3, "b");
      // A broad layered eagle wing, each lower point a separate flight feather.
      g.poly([[29, 21], [21, 3 + wing], [15, 1 + wing], [16, 12 + wing], [10, 6 + wing], [12, 18 + wing], [5, 14 + wing], [13, 27]], K);
      g.poly([[28, 20], [21, 6 + wing], [17, 4 + wing], [19, 15 + wing], [13, 10 + wing], [15, 21 + wing], [9, 18 + wing], [15, 25]], "f");
      g.line(20, 6 + wing, 18, 22, "h", 2); g.line(14, 11 + wing, 19, 23, "e", 2); g.line(9, 17 + wing, 16, 25, "d", 2);
      // Golden lion body and haunches.
      g.ellipse(30, 24, 14, 7, K); g.ellipse(29, 24, 13, 6, "c"); g.ellipse(22, 24, 7, 7, "b");
      // Far hind paw and far eagle foreleg.
      g.line(22, 28, 19 + stride, 35, "b", 4); g.line(38, 27, 36 - stride, 35, "e", 3);
      // Eagle ruff and unmistakably hooked beak.
      g.poly([[36, 22], [39, 12], [45, 7], [51, 11], [48, 20], [42, 25]], K);
      g.poly([[37, 21], [40, 13], [45, 9], [49, 11], [47, 18], [42, 23]], "f");
      g.poly([[48, 11], [55, 13], [51, 17], [47, 16]], K); g.poly([[49, 12], [54, 13], [51, 15], [48, 15]], "e");
      g.poly([[40, 11], [37, 6], [43, 9]], "h"); g.put(46, 11, "a"); g.put(47, 11, "g");
      // Lion hind leg ends in a paw; eagle foreleg ends in three long talons.
      g.line(25, 28, 24 - stride, 35, "c", 4); g.rect(21 - stride, 34, 8, 3, K);
      g.line(40, 26, 42 + stride, 34, "e", 3);
      for (const x of [39 + stride, 42 + stride, 45 + stride]) g.line(42 + stride, 34, x, 36, "e", 1);
      g.line(36 - stride, 35, 33 - stride, 36, "e", 1);
      if (f === 2) { g.line(38, 15, 32, 7, "i", 2); g.poly([[17, 9], [8, 2], [12, 15]], "g"); }
    }),

    golem: () => authored(44, 42, palette({ a: "#303d42", b: "#4f6264", c: "#718283", d: "#9ba59c", e: "#c8c5aa", f: "#6fa84e", g: "#e8f3dc", h: "#55d6c2", i: "#bd84e6" }), (g, f) => {
      const cx = 22, lean = f === 1 ? -1 : f === 3 ? 1 : 0;
      g.poly([[cx - 9 + lean, 5], [cx + 8 + lean, 3], [cx + 12, 15], [cx + 9, 36], [cx - 10, 38], [cx - 13, 17]], K);
      g.poly([[cx - 7 + lean, 7], [cx + 6 + lean, 5], [cx + 9, 16], [cx + 7, 34], [cx - 8, 36], [cx - 10, 17]], "b");
      g.poly([[cx - 8, 7], [cx - 1, 5], [cx - 3, 18], [cx - 10, 17]], "c"); g.rect(cx + 1, 9, 7, 5, "d");
      g.rect(cx - 5, 14, 3, 3, "h"); g.rect(cx + 4, 13, 3, 3, "h"); g.line(cx, 17, cx, 28, "i", 2); g.line(cx - 5, 23, cx + 5, 23, "i", 2);
      const reach = f === 2 ? 19 : 13; g.line(cx - 9, 18, cx - reach, 29, "c", 5); g.line(cx + 9, 18, cx + reach, 29, "c", 5);
      g.rect(cx - 9, 36, 8, 4, K); g.rect(cx + 2, 35, 9, 5, K); g.ellipse(cx - 7, 9, 3, 3, "f");
    }),

    weaver: () => authored(46, 38, palette({ a: "#241e3f", b: "#403064", c: "#68438a", d: "#a1529b", e: "#da72b1", f: "#ead6e9", g: "#ffffff", h: "#5bd6d0", i: "#d9a5f2" }), (g, f) => {
      const cx = 23, flex = f === 1 ? 2 : f === 3 ? -2 : 0;
      g.ellipse(cx, 21, 10, 9, K); g.ellipse(cx, 21, 9, 8, "b");
      g.ellipse(cx, 10, 7, 7, K); g.ellipse(cx, 10, 6, 6, "c");
      g.rect(cx - 4, 9, 2, 2, "h"); g.rect(cx + 3, 9, 2, 2, "h"); g.put(cx - 2, 13, "g"); g.put(cx + 2, 13, "g");
      for (let side of [-1, 1]) for (let n = 0; n < 4; n++) {
        const y = 17 + n * 4, kneeX = cx + side * (12 + n * 2), footX = cx + side * (20 + flex * (n % 2 ? 1 : -1));
        g.line(cx + side * 7, y, kneeX, y - 5 + n, "d", 2); g.line(kneeX, y - 5 + n, footX, 29 + n, n === 0 ? "i" : "e", 2);
      }
      if (f === 2) { g.line(cx, 14, cx, 0, "f", 1); g.ellipse(cx, 2, 4, 3, "i"); }
    }),

    bellkeeper: () => authored(42, 40, palette({ a: "#242a39", b: "#3e4a5c", c: "#657486", d: "#9aa6ae", e: "#c89f50", f: "#f0d27d", g: "#ffffff", h: "#73d7df", i: "#b65f78" }), (g, f) => {
      const cx = 21, sway = f === 1 ? -2 : f === 3 ? 2 : 0;
      g.poly([[cx - 5, 5], [cx + 5, 5], [cx + 13, 29], [cx + 16, 32], [cx - 16, 32], [cx - 13, 29]], K);
      g.poly([[cx - 4, 7], [cx + 4, 7], [cx + 11, 28], [cx + 13, 30], [cx - 13, 30], [cx - 11, 28]], "b");
      g.rect(cx - 7, 11, 14, 3, "e"); g.rect(cx - 4, 15, 3, 3, "h"); g.rect(cx + 2, 15, 3, 3, "h");
      g.line(cx, 28, cx + sway, 37, "e", 2); g.ellipse(cx + sway, 37, 4, 3, "f");
      g.line(cx - 11, 22, cx - (f === 2 ? 19 : 15), 29, "c", 3); g.line(cx + 11, 22, cx + (f === 2 ? 19 : 15), 29, "c", 3);
      g.rect(cx - 2, 1, 4, 5, "i");
    }),

    lanternWisp: () => authored(38, 40, palette({ a: "#322448", b: "#63365e", c: "#a04466", d: "#e35f68", e: "#f5a75e", f: "#ffe29a", g: "#ffffff", h: "#6bd5d1", i: "#d98cdf" }), (g, f) => {
      const cx = 19, bob = f === 1 ? 1 : f === 3 ? -1 : 0;
      g.line(cx, 1, cx, 5 + bob, "e", 2); g.rect(cx - 6, 4 + bob, 12, 3, K);
      g.poly([[cx - 8, 7 + bob], [cx + 8, 7 + bob], [cx + 11, 22 + bob], [cx + 5, 28 + bob], [cx - 5, 28 + bob], [cx - 11, 22 + bob]], K);
      g.poly([[cx - 6, 8 + bob], [cx + 6, 8 + bob], [cx + 8, 21 + bob], [cx + 4, 26 + bob], [cx - 4, 26 + bob], [cx - 8, 21 + bob]], "d");
      g.ellipse(cx, 17 + bob, 6, 8, "f"); g.rect(cx - 3, 15 + bob, 2, 3, "a"); g.rect(cx + 2, 15 + bob, 2, 3, "a");
      const flare = f === 2 ? 5 : 0; g.line(cx - 5, 27, cx - 9 - flare, 38, "i", 2); g.line(cx, 28, cx, 39, "h", 2); g.line(cx + 5, 27, cx + 9 + flare, 38, "e", 2);
    }),

    colossus: () => authored(50, 46, palette({ a: "#28343b", b: "#41555c", c: "#617279", d: "#879496", e: "#b9b69e", f: "#5e8f58", g: "#edf2dc", h: "#65d9cf", i: "#c384e8" }), (g, f) => {
      const cx = 25, shift = f === 1 ? -1 : f === 3 ? 1 : 0;
      g.poly([[cx - 10 + shift, 2], [cx + 7 + shift, 5], [cx + 14, 18], [cx + 12, 40], [cx - 14, 42], [cx - 17, 18]], K);
      g.poly([[cx - 8 + shift, 4], [cx + 5 + shift, 7], [cx + 11, 19], [cx + 9, 38], [cx - 12, 40], [cx - 14, 19]], "b");
      g.poly([[cx - 12, 8], [cx - 2, 3], [cx - 5, 22], [cx - 14, 19]], "c"); g.poly([[cx + 3, 8], [cx + 10, 14], [cx + 8, 27], [cx, 20]], "d");
      g.rect(cx - 6, 13, 4, 4, "h"); g.rect(cx + 4, 14, 4, 4, "h"); g.line(cx, 19, cx - 1, 31, "i", 3);
      const reach = f === 2 ? 23 : 17; g.line(cx - 13, 19, cx - reach, 36, "c", 7); g.line(cx + 11, 19, cx + reach, 35, "d", 7);
      g.rect(cx - 14, 39, 12, 5, K); g.rect(cx + 2, 38, 13, 6, K); g.ellipse(cx - 10, 8, 4, 3, "f"); g.ellipse(cx + 9, 26, 3, 3, "i");
    }),

    god: () => authored(52, 48, palette({ a: "#171731", b: "#292854", c: "#48417c", d: "#7365b1", e: "#b08bdd", f: "#f0d681", g: "#ffffff", h: "#63ded7", i: "#f08ba8" }), (g, f) => {
      const cx = 26, bob = f === 1 ? 1 : f === 3 ? -1 : 0;
      g.ellipse(cx, 17 + bob, 18, 14, "d"); g.ellipse(cx, 17 + bob, 16, 12, "a");
      g.ellipse(cx, 18 + bob, 11, 11, K); g.ellipse(cx, 18 + bob, 9, 9, "g");
      g.rect(cx - 5, 16 + bob, 3, 4, "a"); g.rect(cx + 3, 16 + bob, 3, 4, "a"); g.put(cx, 23 + bob, "h");
      g.poly([[cx - 8, 27 + bob], [cx + 8, 27 + bob], [cx + 13, 42], [cx, 46], [cx - 13, 42]], K); g.poly([[cx - 6, 28 + bob], [cx + 6, 28 + bob], [cx + 10, 41], [cx, 44], [cx - 10, 41]], "g");
      for (let n = 0; n < 8; n++) { const a = n * Math.PI / 4 + f * 0.18; const x = cx + Math.cos(a) * 22, y = 18 + bob + Math.sin(a) * 16; g.ellipse(x, y, 2, 2, n % 3 === 0 ? "f" : n % 2 ? "h" : "i"); }
      const reach = f === 2 ? 21 : 13; g.line(cx - 7, 31, cx - reach, 25, "e", 2); g.line(cx + 7, 31, cx + reach, 25, "h", 2);
    }),
  };

  for (const [id, build] of Object.entries(art)) {
    if (G.forms[id] && typeof build === "function") G.forms[id].sprite = compactSprite(build());
  }
})();
