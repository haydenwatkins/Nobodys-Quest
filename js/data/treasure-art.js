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
    "tide-shell": { name: "Tide Shell", purpose: "+1 star · Harborback path · coastal cairn", shape: "shell" },
    "paper-crane": { name: "Wayfold Crane", purpose: "+1 star · Foldstep Fox path · coastal cairn", shape: "crane" },
    "orrery-key": { name: "Orrery Key", purpose: "+1 star · Skylens Mapper path · coastal cairn", shape: "orbitKey" },
    "elder-acorn": { name: "Elder Acorn", purpose: "+1 star · Hedgehare path · coastal cairn", shape: "acorn" },
    "riftblade-sigil": { name: "Wayglass Sigil", purpose: "+1 star · Wayglass Duelist path", shape: "wayglass" },
    "mole-crown": { name: "Copper Root Crown", purpose: "+1 star · Tunneltuft path", shape: "copperCrown" },
    "crimson-seal": { name: "Duskflower Seal", purpose: "+1 star · Velvetwing path", shape: "waxSeal" },
    "jester-bell": { name: "Curtain Bell", purpose: "+1 star · Pocket Trouper path", shape: "curtainBell" },
    "god-spark": { name: "Spark of Every Form", purpose: "+1 star · Roadlight path · story ending", shape: "livingSpark" },
    "keeper-lantern": { name: "Keeper's Lantern", purpose: "+1 star · a keepsake of the opened bridge", shape: "bridgeLamp" },
    "orchard-ribbon": { name: "Orchard Ribbon", purpose: "+5 town spirit · a keepsake of Parcel's open road", shape: "orchardBow" },
    "sunrise-seal": { name: "Sunrise Seal", purpose: "+8 town spirit · a keepsake of three deliveries", shape: "sunriseSeal" },
    "brindles-recipes": { name: "Brindle's Recipes", purpose: "+3 town spirit · return to Brindle", shape: "recipeBook" },
    "sunstep-courier": { name: "Courier Satchel", purpose: "+6 town spirit · a keepsake of your courier circuit", shape: "courierSatchel" },
    "marsh-north-sluice": { name: "North Waterway Bundle", purpose: "+2 town spirit · the sluice is already open", shape: "reedBundle" },
    "marsh-south-sluice": { name: "South Waterway Bundle", purpose: "+2 town spirit · the sluice is already open", shape: "reedBundle" },
    "marsh-ferry-token": { name: "Old Ferry Token", purpose: "+6 town spirit · a keepsake of one last crossing", shape: "ferryToken" },
    "grove-home-tree": { name: "Shelter Keepsake", purpose: "+6 town spirit · shelter and shortcut restored", shape: "homeSprig" },
    "ridge-coal-watch": { name: "Coal Watch Lantern", purpose: "+3 town spirit · the watchfire is already lit", shape: "watchLantern" },
    "ridge-ash-watch": { name: "Ash Watch Lantern", purpose: "+3 town spirit · the watchfire is already lit", shape: "watchLantern" },
    "mistwood-middle-road": { name: "Trail Bell Keepsake", purpose: "+6 town spirit · the middle road is open", shape: "trailBell" },
    "starfall-thread": { name: "Fallen Star Thread", purpose: "+8 town spirit · unlocks the Starstrider look", shape: "starThread" },
    "glasswater-meridian": { name: "Meridian Keepsake", purpose: "+6 town spirit · the meridian road is open", shape: "sunDialToken" },
    "shattercoast-tideglass-chronicle": { name: "Tideglass Chronicle", purpose: "+1 star · +8 town spirit · four coastal lessons", shape: "tideBook" },
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
    G.treasureArt[shape] = A.compactSprite(A.authored(28, 32, shape === "plumbline" ? { ...palette, d: "#b5c8bd", e: "#718b82" } : shape === "tideBook" ? { ...palette, b: "#438d94", e: "#285464", f: "#dfb979" } : palette, (g, frame) => {
      if (shape === "watchLantern") {
        g.ellipse(14,6,6,5,"k");g.ellipse(14,6,4,3,"b");g.ellipse(14,6,2,2,"k");
        g.poly([[7,10],[21,10],[24,15],[23,29],[5,29],[4,15]],"k");
        g.poly([[8,12],[20,12],[22,16],[6,16]],"b");g.line(8,12,19,12,"a",1);
        g.rect(7,17,14,10,"e");g.rect(9,18,10,8,"a");
        g.poly([[14,18],[17,23],[15,26],[11,25],[11,22]],"j");g.line(14,22,14,25,"c",2);
        g.line(6,17,6,27,"b",2);g.line(21,17,21,27,"b",2);g.line(7,29,21,29,"b",2);
      } else if (shape === "trailBell") {
        g.line(14,5,14,11,"b",3);g.ellipse(14,5,4,3,"k");g.ellipse(14,5,2,1,"a");
        g.poly([[9,10],[19,10],[22,21],[25,25],[24,28],[4,28],[3,25],[6,21]],"k");
        g.poly([[10,12],[18,12],[20,22],[22,25],[6,25],[8,22]],"b");
        g.line(11,13,9,23,"a",2);g.line(7,25,21,25,"a",1);g.ellipse(14,29,3,2,"a");
        g.poly([[8,13],[3,11],[2,5],[6,6],[10,10]],"k");g.poly([[7,11],[4,9],[4,7],[7,9]],"f");
        g.poly([[18,13],[25,10],[26,5],[21,6],[17,10]],"k");g.poly([[20,11],[23,9],[24,7],[21,9]],"g");
        g.line(14,15,14,22,"c",1);g.put(13,18,"a");
      } else if (shape === "starThread") {
        g.ellipse(14,5,11,4,"k");g.ellipse(14,4,9,2,"a");g.rect(7,7,14,20,"k");
        g.rect(8,8,12,16,"e");g.line(9,10,19,10,"d",2);g.line(9,14,19,14,"h",2);g.line(9,18,19,18,"a",2);g.line(9,22,18,22,"d",2);
        g.line(9,9,9,22,"c",1);g.ellipse(14,27,11,4,"k");g.ellipse(14,26,9,2,"b");g.line(7,27,19,27,"a",1);
        g.line(20,13,24,16,"d",1);g.line(24,16,23,23,"d",1);g.line(23,23,20,25,"d",1);
        g.poly([[21,23],[22,26],[26,27],[23,29],[22,31],[20,28],[18,27]],"k");g.put(22,27,"c");g.put(22,28,"a");
      } else if (shape === "sunDialToken") {
        g.poly([[9,2],[19,2],[26,9],[26,22],[19,29],[9,29],[2,22],[2,9]],"k");
        g.ellipse(14,15,11,12,"b");g.ellipse(14,14,9,9,"a");g.ellipse(14,14,7,7,"e");
        for(const [x,y]of [[14,4],[24,14],[14,25],[4,14]])g.put(x,y,"c");
        g.line(8,21,20,9,"k",2);g.line(9,20,19,10,"d",1);
        g.poly([[14,7],[18,14],[14,21],[10,14]],"k");g.poly([[14,9],[16,14],[14,18],[12,14]],"d");g.line(14,10,14,15,"c",1);
        g.line(7,25,11,27,"a",1);g.put(20,24,"c");
      } else if (shape === "homeSprig") {
        // A roof carved into warm wood, with the shelter's first small leaves.
        g.poly([[4,14],[14,7],[24,14],[24,29],[4,29]],"k");g.rect(7,16,14,11,"b");
        g.poly([[6,14],[14,9],[22,14]],"a");g.line(8,15,20,15,"k",1);
        g.rect(12,20,5,7,"k");g.rect(13,21,3,6,"a");g.put(14,22,"c");
        g.line(8,18,8,24,"a",1);g.line(7,28,21,28,"a",1);
        g.line(15,8,18,3,"k",3);g.line(15,7,18,3,"b",1);
        g.poly([[17,5],[17,1],[22,1],[24,4],[21,7]],"k");g.poly([[19,3],[21,2],[22,4],[20,5]],"f");
        g.poly([[15,7],[11,6],[9,2],[14,1],[17,4]],"k");g.poly([[13,3],[14,3],[15,5],[13,5]],"g");
        g.line(6,13,10,10,"c",1);g.line(18,11,22,14,"b",1);
      } else if (shape === "reedBundle") {
        // River stones tucked into soft reeds, tied with the old ferry cord.
        g.poly([[3,9],[10,11],[12,4],[16,3],[20,10],[25,7],[23,20],[20,29],[7,30],[3,22]],"k");
        g.poly([[5,12],[10,16],[13,7],[16,6],[20,15],[22,12],[21,23],[18,27],[8,28],[5,22]],"g");
        g.line(6,15,9,25,"f",2);g.line(13,9,12,25,"f",1);g.line(20,16,18,25,"f",1);
        g.ellipse(10,19,5,6,"k");g.ellipse(10,18,3,4,"d");g.put(9,16,"c");
        g.ellipse(18,20,5,6,"k");g.ellipse(18,19,3,4,"e");g.line(17,17,19,17,"d",1);
        g.line(5,24,22,24,"b",3);g.line(6,23,21,23,"a",1);
        g.ellipse(14,24,3,3,"k");g.line(12,24,16,24,"a",1);g.line(14,25,16,29,"b",2);
      } else if (shape === "ferryToken") {
        // A worn brass ferry fare with a little boat stamped into its face.
        g.poly([[10,2],[18,2],[24,7],[26,14],[25,23],[19,29],[9,30],[3,25],[1,16],[3,8]],"k");
        g.ellipse(14,16,11,13,"b");g.ellipse(14,15,9,10,"a");g.ellipse(14,15,7,8,"b");
        g.line(8,8,16,6,"c",1);g.put(20,9,"c");g.line(6,24,11,28,"a",1);
        g.poly([[7,17],[21,17],[18,21],[10,21]],"k");g.line(10,18,19,18,"a",1);
        g.line(14,9,14,17,"k",1);g.poly([[15,9],[20,14],[15,14]],"a");
        g.line(9,24,19,24,"e",1);g.put(8,23,"d");g.put(21,23,"d");
      } else if (shape === "courierSatchel") {
        g.poly([[5,12],[5,6],[9,2],[19,2],[23,6],[23,12],[20,12],[20,7],[18,5],[10,5],[8,7],[8,12]],"k");
        g.line(7,10,7,7,"b",2);g.line(8,6,11,4,"a",2);g.line(12,4,18,4,"a",2);g.line(20,6,21,10,"b",2);
        g.poly([[10,7],[21,8],[20,16],[9,15]],"k");g.rect(11,9,8,6,"c");g.line(13,11,17,11,"b",1);
        g.poly([[3,12],[24,12],[26,16],[25,28],[21,31],[6,31],[2,27],[2,16]],"k");
        g.rect(5,15,18,12,"g");g.line(6,17,6,26,"f",1);g.line(7,29,20,29,"b",1);
        g.poly([[4,14],[24,14],[22,21],[17,23],[10,23],[5,20]],"j");g.line(6,15,22,15,"a",1);
        g.rect(12,20,5,6,"k");g.rect(13,21,3,3,"a");g.put(14,22,"c");
        for(const x of [8,11,19,22])g.put(x,18,"c");
      } else if (shape === "tideBook") {
        g.rect(5, 8, 18, 20, 'k'); g.rect(6, 9, 16, 18, 'b');
        g.rect(7, 9, 3, 17, 'e'); g.rect(10, 10, 11, 14, 'b');
        g.rect(10, 25, 11, 2, 'c'); g.rect(11, 25, 9, 1, 'd');
        g.rect(12, 13, 6, 1, 'd'); g.rect(11, 15, 3, 1, 'c');
        g.rect(14, 16, 3, 1, 'c'); g.rect(17, 15, 3, 1, 'c');
        g.rect(12, 19, 6, 1, 'e'); g.rect(13, 20, 4, 1, 'c');
        g.rect(21, 16, 3, 5, 'k'); g.rect(21, 17, 2, 3, 'f');
        g.rect(22, 17, 1, 1, frame % 2 ? 'd' : 'c');
      } else if (shape === "recipeBook") {
        g.poly([[4,2],[24,2],[26,26],[23,31],[5,31],[2,28],[2,6]],"k");
        g.rect(5,5,18,20,"e");g.rect(4,5,4,20,"g");g.line(6,6,6,22,"f",1);
        g.rect(9,7,11,14,"a");g.ellipse(14,14,4,4,"b");g.ellipse(14,14,2,2,"j");g.put(13,13,"c");
        g.line(11,9,17,9,"c",1);g.line(11,19,17,19,"b",1);
        g.poly([[5,26],[23,26],[22,29],[5,29]],"c");g.line(6,28,21,28,"b",1);
        g.rect(18,23,3,8,"h");g.line(18,24,20,24,"i",1);
      } else if (shape === "orchardBow") {
        g.poly([[4,3],[11,4],[14,10],[17,4],[24,3],[25,14],[19,16],[22,29],[17,26],[14,30],[11,26],[6,29],[9,16],[3,14]],"k");
        g.poly([[6,5],[10,6],[12,11],[10,14],[5,12]],"j");g.poly([[18,6],[22,5],[23,12],[18,14],[16,11]],"a");
        g.poly([[11,15],[14,17],[12,25],[8,26]],"j");g.poly([[14,17],[17,15],[20,26],[16,25]],"b");
        g.ellipse(14,12,4,4,"k");g.ellipse(14,12,2,2,"f");g.put(13,11,"c");g.line(7,7,9,10,"c",1);
      } else if (shape === "sunriseSeal") {
        g.poly([[10,2],[18,2],[24,7],[26,14],[24,23],[18,28],[10,28],[4,23],[2,14],[4,7]],"k");
        g.ellipse(14,15,10,11,"b");g.ellipse(14,14,8,8,"a");g.line(7,18,21,18,"k",2);
        g.ellipse(14,15,4,4,"j");g.line(9,20,19,20,"c",1);g.line(14,5,14,8,"c",2);
        g.line(7,9,9,11,"c",1);g.line(19,11,21,9,"c",1);g.put(7,15,"c");g.put(21,15,"c");
        g.rect(11,27,6,3,"k");g.rect(12,28,4,1,"h");
      } else if (shape === "bridgeLamp") {
        // A weathered road lantern with a tiny bridge arch in its warm pane.
        g.ellipse(14,6,7,5,"k");g.ellipse(14,6,5,3,"b");g.ellipse(14,6,3,2,"k");
        g.poly([[6,10],[22,10],[25,14],[24,28],[20,31],[8,31],[4,28],[3,14]],"k");
        g.line(6,12,22,12,"a",2);g.rect(6,15,16,12,"b");g.rect(8,16,12,9,"a");
        g.line(9,24,9,21,"e",2);g.line(9,21,14,18,"e",2);g.line(14,18,19,21,"e",2);g.line(19,21,19,24,"e",2);
        g.line(10,21,14,19,"c",1);g.line(7,28,21,28,"b",2);g.put(8,16,"c");
      } else if (shape === "livingSpark") {
        // A sewn glass flame: all roads meet inside one tangible keepsake.
        g.poly([[14,1],[18,7],[24,12],[25,20],[21,25],[7,25],[3,20],[4,12],[10,7]],"k");
        g.poly([[14,4],[17,10],[21,13],[22,19],[18,23],[10,23],[6,19],[7,13],[11,10]],"a");
        g.poly([[14,7],[14,15],[8,18],[8,13],[12,11]],"d");
        g.poly([[14,7],[17,12],[20,14],[20,19],[14,15]],"h");
        g.poly([[14,15],[19,20],[17,22],[11,22],[8,19]],"j");
        g.line(14,8,14,20,"c",2);g.line(10,13,18,17,"c",1);g.put(9,12,"c");
        g.rect(10,24,8,3,"k");g.rect(11,25,6,1,"b");
        g.poly([[9,27],[19,27],[23,31],[5,31]],"k");g.line(9,29,19,29,"a",2);
      } else if (shape === "wayglass") {
        g.ellipse(14, 5, 5, 4, "k");g.ellipse(14, 5, 3, 2, "a");
        g.poly([[4, 9], [11, 6], [12, 16], [10, 26], [2, 18]], "k");
        g.poly([[6, 10], [9, 9], [10, 16], [9, 22], [5, 18]], "d");g.line(6, 11, 6, 17, "c", 1);
        g.poly([[17, 6], [25, 10], [26, 18], [17, 28], [15, 17]], "k");
        g.poly([[19, 9], [23, 12], [23, 17], [18, 23], [17, 17]], "e");g.line(20, 11, 21, 16, "d", 2);
        g.line(12, 15, 15, 15, "a", 2);g.line(12, 20, 15, 20, "a", 1);g.put(18, 13, "c");
      } else if (shape === "copperCrown") {
        g.poly([[2, 9], [8, 13], [14, 3], [20, 13], [26, 9], [24, 28], [4, 28]], "k");
        g.poly([[5, 13], [9, 17], [14, 8], [19, 17], [23, 13], [22, 25], [6, 25]], "b");
        g.line(7, 23, 21, 23, "j", 2);g.line(7, 26, 21, 26, "a", 1);
        g.line(14, 11, 14, 20, "a", 2);g.line(14, 16, 10, 19, "a", 1);g.line(14, 16, 18, 19, "a", 1);
        g.ellipse(14, 22, 3, 2, "g");g.put(13, 21, "f");
      } else if (shape === "waxSeal") {
        g.poly([[7, 18], [14, 19], [11, 31], [7, 27], [3, 29]], "k");g.poly([[9, 20], [12, 21], [10, 27], [7, 25], [6, 26]], "h");
        g.poly([[14, 19], [21, 18], [25, 29], [21, 27], [17, 31]], "k");g.poly([[16, 21], [19, 20], [22, 26], [19, 25], [18, 27]], "j");
        for(const [x,y]of [[9,8],[18,8],[6,15],[21,15],[14,20]]){g.ellipse(x,y,6,6,"k");g.ellipse(x,y,4,4,"j");}
        g.ellipse(14,13,7,7,"k");g.ellipse(14,13,5,5,"h");g.ellipse(14,13,3,3,"j");
        g.line(12,11,15,11,"c",1);g.line(15,11,16,14,"i",1);g.line(16,14,13,16,"i",1);g.put(13,13,"a");
      } else if (shape === "curtainBell") {
        g.ellipse(14,9,5,5,"k");g.ellipse(14,9,3,3,"a");
        g.poly([[5,2],[12,3],[14,6],[16,3],[23,2],[23,9],[17,9],[14,7],[11,9],[5,9]],"k");
        g.poly([[7,4],[11,5],[13,6],[10,7],[7,7]],"h");g.poly([[17,5],[21,4],[21,7],[18,7],[15,6]],"i");g.put(14,6,"c");
        g.poly([[9,12],[19,12],[22,23],[25,26],[24,29],[4,29],[3,26],[6,23]],"k");
        g.poly([[11,14],[17,14],[20,24],[22,26],[6,26],[8,24]],"a");g.line(11,16,10,23,"c",2);g.line(17,16,19,24,"b",2);
        g.line(6,27,22,27,"j",1);g.rect(12,28,4,3,"k");g.rect(13,29,2,1,"a");
      } else if (shape === "shell") {
        g.poly([[2, 18], [3, 10], [8, 4], [14, 2], [21, 5], [25, 12], [25, 20], [20, 27], [10, 29], [4, 25]], "k");
        g.poly([[4, 18], [5, 11], [9, 6], [14, 4], [20, 7], [23, 13], [23, 20], [18, 25], [10, 27], [6, 23]], "f");
        g.line(7, 19, 8, 12, "c", 2); g.line(8, 12, 14, 8, "c", 2);
        g.line(14, 8, 20, 12, "g", 2); g.line(20, 12, 20, 20, "g", 2); g.line(20, 20, 13, 23, "g", 2);
        g.line(13, 23, 10, 18, "g", 2); g.line(10, 18, 13, 14, "g", 2); g.line(13, 14, 16, 16, "g", 2);
        g.line(6, 23, 11, 25, "d", 2);
      } else if (shape === "crane") {
        g.poly([[1, 12], [12, 17], [14, 21], [22, 8], [23, 3], [27, 6], [24, 8], [24, 15], [20, 24], [11, 27], [5, 22]], "k");
        g.poly([[3, 14], [12, 19], [14, 23], [21, 12], [22, 7], [25, 6], [23, 9], [22, 15], [19, 22], [11, 25], [7, 21]], "c");
        g.poly([[5, 3], [13, 10], [19, 22], [12, 23]], "k"); g.poly([[7, 6], [12, 11], [16, 20], [13, 21]], "h");
        g.line(7, 15, 11, 22, "d", 1); g.line(11, 25, 19, 22, "e", 1); g.put(23, 7, "k");
      } else if (shape === "orbitKey") {
        g.ellipse(14, 10, 11, 9, "k"); g.ellipse(14, 10, 9, 7, "a"); g.ellipse(14, 10, 6, 5, "k");
        g.ellipse(14, 10, 4, 3, "d"); g.line(7, 6, 19, 14, "c", 1); g.put(8, 7, "c");
        g.rect(12, 17, 5, 14, "k"); g.rect(13, 18, 3, 11, "b"); g.line(13, 19, 13, 27, "a", 1);
        g.rect(16, 23, 6, 4, "k"); g.rect(16, 24, 4, 2, "a"); g.rect(16, 28, 5, 3, "k"); g.rect(16, 29, 3, 1, "a");
      } else if (shape === "acorn") {
        g.poly([[4, 14], [24, 14], [23, 24], [17, 30], [12, 30], [6, 24]], "k");
        g.poly([[6, 15], [22, 15], [21, 23], [16, 28], [13, 28], [8, 23]], "b");
        g.line(9, 17, 10, 23, "a", 2); g.line(13, 26, 16, 26, "j", 1);
        g.poly([[3, 15], [5, 9], [11, 6], [19, 6], [24, 10], [26, 15]], "k");
        g.poly([[5, 13], [7, 10], [12, 8], [18, 8], [22, 11], [24, 13]], "h");
        for(const x of [8,13,18])g.line(x, 10, x+2, 12, "i", 1);
        g.line(14, 7, 14, 2, "k", 3); g.poly([[15, 4], [20, 1], [23, 3], [20, 6], [15, 6]], "g"); g.line(16, 4, 20, 3, "f", 1);
      } else if (shape === "heartstone") {
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
