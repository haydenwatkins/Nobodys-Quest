/* Earned ground gifts: recognizable objects with a sharp purpose cue. */
"use strict";
(() => {
  const A = G.authoredPixelArt;
  G.treasureInfo = {
    "trophy-heartwood-crown": { name: "Heartwood Crown", purpose: "+1 star · choose a Keepsake in Build", shape: "crown" },
    "trophy-mire-pearl": { name: "Mire Pearl", purpose: "+1 star · light Pebble's beacon", shape: "pearl" },
    "trophy-eclipse-sigil": { name: "Eclipse Sigil", purpose: "+1 star · choose a Keepsake in Build", shape: "sigil" },
    "trophy-sky-sovereign": { name: "Sky Mark", purpose: "+1 star · awakens the wind lifts", shape: "plume" },
    "trophy-old-mason": { name: "Stone Mark", purpose: "+1 star · raises garden crossings", shape: "plumbline" },
    "trophy-silk-matriarch": { name: "Thread Mark", purpose: "+1 star · opens woven passages", shape: "spindle" },
    "trophy-bell-titan": { name: "Echo Mark", purpose: "+1 star · bridges the frozen lakes", shape: "echoBell" },
    "trophy-lantern-keeper": { name: "Lantern Mark", purpose: "+1 star · lights the ridge passages", shape: "lamp" },
    "trophy-last-worldbearer": { name: "Worldheart Mark", purpose: "+1 star · opens the road home", shape: "heartstone" },
    "knights-crest": { name: "Knight's Crest", purpose: "Discover the Knight", shape: "crest" },
    "whispering-seed": { name: "Whispering Seed", purpose: "Plant at the shelter stump", shape: "seed" },
    "sunstep-ribbon": { name: "Sunstep Ribbon", purpose: "A memento of Sunstep", shape: "ribbon" },
    "windscar-feather": { name: "Windscar Feather", purpose: "A memento of Windscar", shape: "feather" },
    "garden-keystone": { name: "Garden Keystone", purpose: "A memento of the gardens", shape: "stone" },
    "rootdeep-silk": { name: "Rootdeep Silk", purpose: "A memento of Rootdeep", shape: "silk" },
    "glasswater-prism": { name: "Glasswater Prism", purpose: "Fit into the northern sundial", shape: "prism" },
    "frostbell-chime": { name: "Frostbell Chime", purpose: "A memento of Frostbell", shape: "bell" },
    "stormglass-lantern": { name: "Stormglass Lantern", purpose: "A memento of Stormspine", shape: "lantern" },
    "titan-memory": { name: "Titan's Smallest Memory", purpose: "A memento of Titan Grave", shape: "memory" },
  };
  G.treasureArt = {};
  const palette = { k: "#35413e", a: "#f4d39c", b: "#b58151", c: "#fff0dd", d: "#76bdbe", e: "#46758b", f: "#a0cb79", g: "#4c7955", h: "#d7aed2", i: "#96769c", j: "#ee947c" };
  for (const shape of [...new Set(Object.values(G.treasureInfo).map(info => info.shape)), "parcel"])
    G.treasureArt[shape] = A.compactSprite(A.authored(28, 32, shape === "plumbline" ? { ...palette, d: "#b5c8bd", e: "#718b82" } : palette, (g, frame) => {
      if (shape === "heartstone") {
        g.poly([[4, 10], [6, 4], [11, 2], [14, 5], [17, 2], [22, 4], [24, 10], [22, 20], [14, 28], [6, 20]], "k");
        g.poly([[6, 10], [8, 5], [11, 4], [14, 8], [17, 4], [20, 5], [22, 10], [20, 19], [14, 25], [8, 19]], "b");
        g.poly([[8, 10], [9, 6], [11, 6], [14, 10], [17, 6], [19, 7], [20, 11], [18, 18], [14, 22], [10, 18]], "j");
        g.line(9, 10, 10, 8, "c", 2); g.line(10, 8, 12, 10, "c", 1);
        g.line(14, 13, 14, 18, "a", 2); g.line(12, 15, 16, 15, "a", 2);
        g.poly([[7, 26], [21, 26], [24, 30], [4, 30]], "k"); g.line(7, 28, 21, 28, "a", 2);
      } else if (shape === "spindle") {
        g.rect(12, 1, 4, 29, "k"); g.rect(13, 2, 2, 27, "b");
        g.ellipse(14, 7, 10, 4, "k"); g.ellipse(14, 6, 8, 2, "a");
        g.ellipse(14, 26, 10, 4, "k"); g.ellipse(14, 25, 8, 2, "b");
        g.rect(7, 8, 14, 17, "k"); g.rect(9, 9, 10, 15, "h");
        for (const y of [10, 14, 18, 22]) g.line(9, y, 18, y + 1, "c", 2);
        g.line(19, 14, 23, 17, "d", 2); g.line(23, 17, 23, 22, "d", 2);
        g.line(23, 22, 20, 24, "d", 2); g.put(13, 5, "c");
      } else if (shape === "echoBell") {
        g.poly([[10, 1], [18, 1], [19, 4], [16, 11], [12, 11], [9, 4]], "k");
        g.rect(12, 3, 4, 7, "b"); g.line(12, 3, 15, 3, "a", 1);
        g.poly([[9, 10], [19, 10], [22, 22], [26, 24], [25, 28], [3, 28], [2, 24], [6, 22]], "k");
        g.poly([[10, 12], [18, 12], [20, 22], [23, 25], [5, 25], [8, 22]], "a");
        g.line(11, 13, 9, 21, "c", 2); g.line(17, 13, 19, 23, "b", 2);
        g.line(5, 26, 23, 26, "b", 2); g.rect(12, 26, 4, 5, "k"); g.rect(13, 27, 2, 3, "c");
      } else if (shape === "lamp") {
        g.ellipse(14, 7, 7, 6, "k"); g.ellipse(14, 7, 5, 4, "a"); g.ellipse(14, 7, 3, 3, "k");
        g.poly([[6, 10], [22, 10], [25, 15], [25, 25], [21, 30], [7, 30], [3, 25], [3, 15]], "k");
        g.rect(6, 14, 16, 12, "b"); g.rect(8, 15, 12, 9, "j");
        g.poly([[14, 13], [18, 19], [17, 24], [11, 24], [10, 20]], "a");
        g.poly([[14, 17], [16, 21], [14, 24], [12, 22]], "c");
        g.line(6, 12, 22, 12, "a", 2); g.line(7, 28, 21, 28, "a", 2);
        g.line(7, 15, 7, 24, "c", 1); g.line(21, 15, 21, 24, "a", 1);
      } else if (shape === "plumbline") {
        // A mason's hanging weight: fitted grey stone, moss and an inset arch.
        g.line(14, 1, 14, 8, "k", 4); g.line(14, 2, 14, 7, "a", 2);
        g.poly([[10, 7], [18, 7], [25, 19], [14, 30], [3, 19]], "k");
        g.poly([[11, 9], [17, 9], [22, 19], [14, 27], [6, 19]], "e");
        g.poly([[11, 9], [14, 10], [14, 27], [6, 19]], "d");
        g.line(9, 19, 9, 16, "k", 2); g.line(9, 16, 14, 13, "k", 2);
        g.line(14, 13, 19, 16, "k", 2); g.line(19, 16, 19, 19, "k", 2);
        g.line(10, 18, 10, 16, "c", 1); g.line(10, 16, 14, 14, "c", 1);
        g.line(14, 14, 18, 16, "a", 1); g.line(18, 16, 18, 18, "a", 1);
        g.line(12, 22, 14, 24, "c", 1); g.line(14, 24, 17, 21, "a", 1);
        g.rect(6, 18, 3, 3, "g"); g.line(7, 18, 8, 20, "f", 1);
      } else if (shape === "plume") {
        g.poly([[5, 24], [3, 16], [6, 7], [15, 1], [20, 2], [20, 10], [14, 20]], "k");
        g.poly([[6, 19], [6, 12], [10, 5], [16, 3], [18, 4], [17, 10], [12, 19]], "d");
        g.poly([[12, 25], [13, 15], [21, 6], [25, 6], [26, 13], [21, 24]], "k");
        g.poly([[15, 22], [16, 16], [22, 9], [24, 9], [24, 13], [20, 22]], "e");
        g.line(8, 26, 16, 5, "c", 2); g.line(15, 27, 23, 11, "d", 2);
        g.poly([[5, 23], [18, 22], [20, 28], [7, 30]], "k");
        g.poly([[7, 25], [17, 24], [18, 27], [8, 28]], "a"); g.put(12, 26, "c");
      } else if (shape === "sigil") {
        // A small metal medallion, with its eclipse inset into the face.
        g.ellipse(14, 6, 4, 5, "k"); g.ellipse(14, 6, 2, 3, "a");
        g.ellipse(14, 19, 12, 11, "k"); g.ellipse(14, 19, 10, 9, "b");
        g.ellipse(14, 18, 9, 8, "a"); g.ellipse(14, 18, 7, 6, "i");
        g.ellipse(11, 16, 4, 4, "h"); g.ellipse(14, 15, 4, 4, "i");
        g.line(18, 14, 20, 16, "c", 1); g.line(9, 25, 19, 25, "b", 2);
      } else if (shape === "pearl") {
        g.ellipse(14, 19, 11, 11, "k"); g.ellipse(14, 19, 9, 9, "e");
        g.ellipse(13, 17, 8, 8, "d"); g.ellipse(11, 15, 4, 4, "c");
        g.line(12, 25, 19, 23, "h", 2); g.line(17, 12, 20, 17, "a", 1);
      } else if (shape === "crown") {
        g.poly([[3, 9], [8, 16], [14, 7], [20, 16], [25, 9], [24, 28], [4, 28]], "k");
        g.poly([[5, 14], [8, 19], [14, 11], [20, 19], [23, 14], [22, 26], [6, 26]], "b");
        g.line(7, 24, 21, 24, "a", 2); g.ellipse(14, 21, 2, 2, "d");
        g.poly([[3, 8], [2, 4], [5, 3], [9, 7], [7, 11]], "g");
        g.poly([[12, 7], [11, 2], [15, 1], [18, 5], [15, 9]], "g");
        g.poly([[21, 10], [20, 6], [24, 3], [27, 5], [25, 10]], "g");
        g.line(3, 5, 6, 8, "f", 2); g.line(13, 3, 15, 6, "f", 2); g.line(24, 5, 23, 8, "f", 2);
      } else if (shape === "crest") {
        g.poly([[4, 3], [14, 1], [24, 3], [23, 20], [14, 29], [5, 20]], "k");
        g.poly([[6, 5], [14, 3], [22, 5], [21, 19], [14, 26], [7, 19]], "a");
        g.poly([[9, 7], [19, 7], [18, 18], [14, 22], [10, 18]], "e");
        g.line(14, 8, 14, 19, "c", 2); g.line(10, 12, 18, 12, "c", 2);
      } else if (shape === "seed") {
        g.poly([[7, 13], [14, 9], [21, 13], [23, 23], [18, 29], [10, 29], [5, 23]], "k");
        g.ellipse(14, 21, 7, 7, "b"); g.line(14, 17, 14, 26, "a", 2);
        g.line(14, 14, 13, 6, "g", 2); g.poly([[13, 8], [6, 4], [4, 6], [9, 11], [13, 11]], "f");
        g.poly([[14, 7], [20, 1], [24, 2], [22, 7], [15, 10]], "f");
      } else if (shape === "ribbon") {
        g.poly([[5, 2], [23, 2], [23, 17], [20, 17], [24, 28], [17, 26], [14, 30], [10, 26], [4, 28], [8, 17], [5, 17]], "k");
        g.rect(7, 4, 14, 11, "j"); g.rect(10, 4, 3, 11, "c");
        g.poly([[10, 15], [17, 15], [21, 25], [17, 23], [14, 27], [10, 23], [7, 25]], "j");
        g.ellipse(14, 10, 4, 4, "a"); g.put(14, 9, "c");
      } else if (shape === "feather") {
        g.poly([[8, 24], [5, 16], [8, 8], [18, 1], [24, 3], [22, 13], [15, 22]], "k");
        g.poly([[8, 17], [10, 9], [19, 3], [22, 4], [20, 12], [13, 21], [9, 22]], "d");
        g.line(8, 29, 20, 5, "c", 2); g.line(11, 20, 18, 16, "c", 1); g.line(15, 12, 11, 10, "e", 1);
      } else if (shape === "stone") {
        g.poly([[4, 6], [24, 6], [21, 27], [7, 27]], "k");
        g.poly([[6, 8], [22, 8], [19, 25], [9, 25]], "b"); g.line(7, 9, 21, 9, "a", 2);
        g.line(13, 13, 13, 21, "c", 2); g.line(13, 13, 18, 12, "c", 2); g.ellipse(11, 22, 3, 2, "c");
      } else if (shape === "silk") {
        g.poly([[4, 8], [10, 3], [22, 3], [25, 8], [22, 27], [5, 27]], "k");
        g.poly([[6, 9], [11, 5], [21, 5], [23, 9], [20, 25], [7, 25]], "h");
        g.line(9, 11, 20, 10, "c", 2); g.line(10, 18, 20, 17, "i", 2); g.line(10, 23, 19, 22, "c", 2);
      } else if (shape === "prism") {
        g.poly([[14, 1], [25, 15], [17, 29], [4, 22]], "k");
        g.poly([[14, 4], [22, 15], [16, 26], [7, 21]], "d");
        g.poly([[14, 4], [15, 16], [7, 21]], "c"); g.poly([[15, 16], [22, 15], [16, 26]], "e");
      } else if (shape === "bell") {
        g.ellipse(14, 6, 4, 5, "k"); g.ellipse(14, 6, 2, 3, "a");
        g.poly([[8, 10], [20, 10], [22, 21], [25, 24], [25, 27], [3, 27], [3, 24], [6, 21]], "k");
        g.poly([[10, 12], [18, 12], [20, 22], [22, 24], [6, 24], [8, 22]], "d");
        g.line(10, 13, 9, 21, "c", 2); g.ellipse(14, 28, 3, 2, "a");
      } else if (shape === "lantern") {
        g.ellipse(14, 6, 6, 5, "k"); g.ellipse(14, 6, 4, 3, "a");
        g.rect(6, 9, 16, 21, "k"); g.rect(8, 12, 12, 15, "e");
        g.rect(10, 14, 8, 11, "d"); g.poly([[14, 15], [17, 21], [14, 24], [11, 21]], "a");
        g.line(7, 10, 20, 10, "a", 2); g.line(7, 28, 20, 28, "a", 2);
      } else if (shape === "memory") {
        g.poly([[8, 3], [17, 2], [23, 8], [23, 24], [18, 29], [6, 26], [3, 15]], "k");
        g.poly([[9, 5], [16, 4], [21, 9], [21, 23], [17, 27], [8, 24], [5, 15]], "h");
        g.line(9, 10, 17, 10, "i", 2); g.line(9, 17, 16, 17, "i", 2); g.line(12, 9, 12, 23, "c", 2);
      } else {
        g.rect(3, 8, 22, 21, "k"); g.rect(5, 10, 18, 17, "b"); g.rect(12, 10, 4, 17, "a"); g.rect(5, 15, 18, 3, "a");
      }
      // A surface glint, never a detached character ornament.
      if (frame === 2) g.put(17, 14, "c");
    }));

  G.drawGroundReward = (ctx, reward) => {
    const info = G.groundRewardInfo(reward), sprite = G.treasureArt[info.shape] || G.treasureArt.parcel;
    const t = G.state.time || 0;
    ctx.save(); G.drawShadow(ctx, reward.x, reward.y, 11);
    G.drawSprite(ctx, sprite, G.spriteFrame(sprite, "idle", G.reducedMotion ? 0 : t), reward.x, reward.y + 2, false);
    ctx.restore();
  };
})();
