/* ============================================================
   NPCS - the people, rumors, and very questionable civic advice
   that turn Nobody's route through the world into a story.

   Dialogue is grouped by story chapter. The engine chooses the newest
   chapter the player has reached, so returning to familiar people pays off.
   ============================================================ */

"use strict";

(function () {
  const bodyFrames = [
    [
      "...hhh...", "..hhhhh..", "..hffff..", "...ffff..", "...cccc..",
      "..cccccc.", ".acccccca", "..cccccc.", "...c..c..", "..bb..bb.",
    ],
    [
      "...hhh...", "..hhhhh..", "..hffff..", "...ffff..", "...cccc..",
      ".acccccc.", "..cccccca", "..cccccc.", "..c....c.", "...bb..bb",
    ],
  ];
  const robeFrames = [
    [
      "..h...h..", ".hhhhhhh.", "..hffff..", "...ffff..", "...aaaa..",
      "..acccca.", "..cccccc.", ".cccccccc", ".cccccccc", "..bb..bb.",
    ],
    [
      ".h.....h.", ".hhhhhhh.", "..hffff..", "...ffff..", "...aaaa..",
      "..acccca.", ".ccccccc.", "cccccccc.", ".cccccccc", ".bb....bb",
    ],
  ];
  const wideFrames = [
    [
      "..hhhhhh..", ".hhhhhhhh.", "..hffffh..", "...ffff...", "..aaaaaa..",
      ".cccccccc.", "acccccccca", ".cccccccc.", "..cc..cc..", ".bbb..bbb.",
    ],
    [
      "..hhhhhh..", ".hhhhhhhh.", "..hffffh..", "...ffff...", "..aaaaaa..",
      "acccccccc.", ".cccccccca", ".cccccccc.", ".cc....cc.", "..bbb..bbb",
    ],
  ];

  function npc(name, icon, colors, chapters, shape) {
    return {
      name, icon, chapters,
      sprite: {
        palette: {
          h: colors.hair, f: colors.skin, c: colors.coat,
          a: colors.accent, b: colors.boot || "#352b42",
        },
        frames: shape === "robe" ? robeFrames : shape === "wide" ? wideFrames : bodyFrames,
      },
    };
  }

  G.NPCS = {
    pebble: npc("Pebble", "*", {
      hair: "#ddd4ba", skin: "#f2c7a5", coat: "#6377a8", accent: "#d9b45d",
    }, {
      0: [
        "I’ve been waiting for someone to help Parcel. The road’s full of roots, and he can’t get his cart through.",
        "I’m coming with you! I brought snacks. Well, one snack. We can share.",
      ],
      1: [
        "That Rat shape is so quick! I can barely keep up. Let me know before you dash off again.",
        "People are starting to use the road again. That makes me happy. I missed having someone to walk with.",
      ],
      3: [
        "The roads woke up grumpy. In fairness, people have been walking all over them.",
        "Worldbearers used to carry travelers. Now they carry grudges. Much lighter, apparently.",
      ],
      5: [
        "A perfect hero would have arrived sooner. Good thing we got a persistent one.",
        "A little map brought everyone home. The cartographers are trying to give it a medal.",
      ],
    }),

    mayorMaybe: npc("Mayor Maybe", "?", {
      hair: "#70493e", skin: "#e7ad88", coat: "#8f4f71", accent: "#f3d56b",
    }, {
      0: [
        "Welcome! I’m Mayor Maybe. People haven’t been able to reach their friends for weeks. I’m so glad you’ve come to help.",
        "I promised everyone we’d get the roads open. I don’t quite know how yet. Please tell me if you find a way.",
        "The root creatures have been getting bolder. Stay close to the paths until you’re ready to face them.",
      ],
      1: [
        "Parcel made it to Sunrise! I’m relieved. I was running out of reassuring things to say.",
        "We’ve got one road open. Let’s help the people along it before we rush off to the next.",
      ],
      2: [
        "Those guardians guarded old promises. Mostly from anyone trying to keep them.",
        "Your trophy shelf is now more qualified than the town council.",
      ],
      5: [
        "You defeated the expectation of one perfect hero. I always opposed expectations, officially.",
        "I hereby name you Citizen of the Whenever This Year Is.",
      ],
    }, "wide"),

    errata: npc("Archivist Errata", "E", {
      hair: "#b7b1c9", skin: "#c98c72", coat: "#4f577e", accent: "#8fd3c8",
    }, {
      0: [
        "I stitched your coat from an old map. Some of its roads are blocked now. I’d love to see people traveling them again.",
        "We call those root creatures the Unfinished. They’ve spread across roads that nobody has looked after. Watch out for the ones that spit!",
      ],
      1: [
        "Your coat can turn a roadkeeper’s memory into a shape. Rat can slip through drains; Knight can stop a swing with its shield.",
        "Once Ser Pending shows you Quick Mix, you can carry a move from another shape. You still learn levels by wearing the shape itself.",
      ],
      2: [
        "The guardians used to protect travelers. I’m sad to see them blocking the roads instead.",
        "You’ve already helped the Treant change his mind. I hope the other guardians will listen too. Be careful around their wards.",
      ],
      3: [
        "Worldbearers carried roads before maps were flat enough to fold. They remember every destination.",
        "When people stopped going anywhere, the great carriers concluded that nowhere must be sacred.",
      ],
      5: [
        "Meridian, the Perfect Map, was built from our demand for one answer to every problem.",
        "You joined the broken paths together. I have left room on the map for whatever grows next.",
      ],
    }, "robe"),

    parcel: npc("Courier Parcel", ">", {
      hair: "#4e372f", skin: "#d99a73", coat: "#b45b46", accent: "#f0c45c",
    }, {
      0: [
        "I’ve got flour, a letter, and a birthday present for Sunrise. I hate keeping people waiting.",
        "Follow the worn path. If we get separated, I’ll wait with the cart.",
      ],
      1: [
        "Brindle waved me over as soon as she saw the flour. You should have seen her smile!",
        "I tried changing into a courier form. Turns out this is already my final form. Distressing.",
      ],
      3: [
        "The road ahead changes without a door. Please enjoy our new premium service: continuity.",
        "Windscar signed for this parcel with a gust. Legally binding, physically unhelpful.",
      ],
      4: [
        "Three Worldbearer marks? Your loyalty card now entitles you to one ominous mountain.",
        "I deliver the future one warning at a time. The future keeps marking them RETURN TO SENDER.",
      ],
    }),

    pending: npc("Sir Pending", "!", {
      hair: "#d6d8dc", skin: "#bc8168", coat: "#6b6f7b", accent: "#d7a446",
    }, {
      0: [
        "I’m trying to keep the watchmen off this road. I’ll be honest: their big swings make me nervous.",
        "A shield helps when you face the swing. Don’t rush at a watchman while it’s winding up!",
      ],
      1: [
        "Look at that crest! The mill keeper would have been proud. Give that shield a try.",
        "I’ll watch the road behind you. You’ve got enough to worry about up ahead.",
      ],
      2: [
        "The guardians don’t always listen at first. Keep your shield up and give them time to calm down.",
        "You’ve been brave out there. Rest before the next fight; I’ll keep watch.",
      ],
      4: [
        "The old order wanted one perfect champion. It got me, so it built a god instead.",
        "Permission to save the world is hereby granted retroactively, pending success.",
      ],
    }, "wide"),

    alias: npc("Auntie Alias", "~", {
      hair: "#6d3c6f", skin: "#9b654e", coat: "#3f8b78", accent: "#e99f68",
    }, {
      0: [
        "Come here, dear. Your coat’s caught on a thorn. There! I won’t have you setting off with a loose stitch.",
        "That coat has room for all sorts of shapes. Try each new one for a while. You might find a favourite.",
      ],
      1: [
        "You’re still our Patchling, even with paws. You look happy in that little Rat shape.",
        "Ser Pending can show you how to borrow a move in Quick Mix. Wearing a shape is how you learn its levels, though.",
      ],
      2: [
        "The guardians used to visit us. I miss them. I hope you can help them open their roads again.",
        "Each shape feels different to wear. Don’t worry about finding one perfect outfit. Pick what feels useful and fun.",
      ],
      5: [
        "You did not become everything. You let everything become useful together.",
        "Wear the victory costume. Or the rat costume. History needs better portraits.",
      ],
    }, "robe"),

    provisional: npc("Dr. Provisional", "+", {
      hair: "#3b414f", skin: "#d6a17c", coat: "#e5e4d2", accent: "#65a0a0",
    }, {
      0: [
        "Let me see those scratches. The root creatures have been causing trouble all along the road. I’m worried about our travelers.",
        "Find a campfire when you need a rest. I’d rather patch your coat than patch you!",
      ],
      1: [
        "You seem quite comfortable changing shape! Try your new moves somewhere quiet before the next big fight.",
        "If a special move won’t work, let your mana refill. Your basic attack is free, so you can keep defending yourself.",
      ],
      3: [
        "Worldbearers have chronic destiny retention. Treatment involves six marks and vigorous dodging.",
        "Do not use a campfire during a guardian fight. The guardian finds wellness culture insulting.",
      ],
      4: [
        "The symptoms point toward Titan Grave. The mountain refuses a second opinion.",
        "You are medically cleared to confront metaphors larger than a house.",
      ],
    }),

    moss: npc("Groundskeeper Moss", "#", {
      hair: "#547446", skin: "#b87f60", coat: "#657b43", accent: "#b9c96b",
    }, {
      0: [
        "The orchard’s roots have grown right across the road. I can’t prune them back on my own.",
        "I’m worried about the old trees. They’ve never been this restless before.",
      ],
      1: [
        "The Treant’s letting travelers through again! Thank you. I’ll start clearing the smaller paths.",
        "Mind the flowers by the path. I planted those for the people coming home.",
      ],
      2: [
        "The Queen has flooded the marsh around her court. I worry about the people whose paths went through there.",
        "Watch the ground when a guardian gets angry. Its warning marks give you time to find a safe gap.",
      ],
      3: [
        "Rootdeep remembers when roots held the world together. It mentions this constantly.",
        "The new lands have weather, history, and absolutely no respect for my pruning schedule.",
      ],
    }, "wide"),

    lastminute: npc("Captain Lastminute", "^", {
      hair: "#2f405c", skin: "#8f5f4c", coat: "#426080", accent: "#e6b75e",
    }, {
      0: [
        "I’m Captain Lastminute. We’ve been waiting for news from the inland roads. Are people getting home again?",
        "The coast is rough, but we look after each other. There’s always room for one more at the camp.",
      ],
      2: [
        "I hear you helped the orchard. Good work! Take a rest before heading farther out.",
        "We’ve got more difficult challenges for experienced travelers. No rush—you’ve plenty to explore first.",
      ],
      3: [
        "Six Worldbearers once held the horizon steady. Then the horizon stopped sending thank-you notes.",
        "The great beasts rule in the open. Doors could not contain them, and hinges cost extra.",
      ],
      4: [
        "Learn the gusts, floor grids, and charges. Panic is not a pattern, despite its popularity.",
        "If Titan Grave moves, move faster. That is my entire strategic doctrine.",
      ],
    }, "wide"),

    probably: npc("Oracle Probably", "O", {
      hair: "#f2e4a8", skin: "#694b67", coat: "#493e75", accent: "#d68bd4",
    }, {
      0: [
        "Oh! You’re the traveler I saw in my dream. I’m Oracle Probably. I’m glad you made it here safely.",
        "I dreamed the road was open again. I hope it comes true. My other dream was mostly about soup.",
      ],
      1: [
        "A new shape! How exciting. Wear it and try its moves—you’ll learn what it’s good at.",
        "I’m happy to see people visiting again. Come back and tell me how your travels go.",
      ],
      3: [
        "Beyond the waking roads waits a grave for a titan that has neglected to be dead.",
        "Six marks open the last path. Or decorate a very intimidating loyalty card.",
      ],
      4: [
        "Meridian is not divine. The Perfect Map is everyone wishing for a hero who never needs help.",
        "Perfection has no friends, no spare answers, and a truly exhausting temper.",
      ],
      5: [
        "The future survived. It is untidy, overgrown, and already requesting help.",
        "Patchling mended the roads. Everybody else can start cleaning up after lunch.",
      ],
    }, "robe"),
  };

  // Pebble is the conversation pilot: the denser sprite gives the recurring
  // companion finer hair, coat lighting, and a readable little quest badge.
  if (G.makeHdSprite2x) G.NPCS.pebble.sprite.hd = G.makeHdSprite2x(G.NPCS.pebble.sprite, {
    accent: "#ffcd75", motif: "marker", animate: true,
  });

  // Coordinates are preferences, not promises. The NPC engine searches nearby
  // for a safe open tile, which lets Ben change map art without burying anyone.
  G.NPC_PLACEMENTS = {
    overworld: [
      ["mayorMaybe", 58, 44], ["pebble", 63, 45], ["parcel", 52, 49],
      ["provisional", 68, 41], ["alias", 34, 48], ["moss", 78, 19],
    ],
    town: [["mayorMaybe", 7, 6], ["alias", 10, 8], ["pending", 4, 9], ["pebble", 12, 5]],
    mistwood: [["moss", 13, 16], ["pebble", 22, 10], ["errata", 6, 5]],
    sunkenMarsh: [["provisional", 17, 9], ["parcel", 25, 10], ["moss", 9, 10]],
    emberRidge: [["pending", 2, 7, {stationary:true}], ["pebble", 20, 8], ["provisional", 25, 15]],
    dungeon: [["errata", 6, 12], ["pending", 23, 12], ["alias", 15, 8]],
    starfallRuins: [["errata", 14, 1], ["probably", 22, 15], ["pebble", 8, 17]],
    "whispering-grove": [["moss", 19, 2], ["alias", 8, 8], ["probably", 23, 14]],
    shattercoast: [["lastminute", 31, 14], ["parcel", 42, 15], ["pebble", 22, 12], ["provisional", 18, 17]],
    sunstepPrairie: [["parcel", 7, 14], ["pebble", 19, 12], ["moss", 34, 18]],
    windscarCanyon: [["provisional", 8, 14], ["pebble", 25, 11], ["lastminute", 36, 16]],
    hangingGardens: [["pending", 8, 14], ["moss", 24, 17], ["alias", 36, 10]],
    rootdeepHollow: [["errata", 8, 14], ["moss", 24, 17], ["provisional", 36, 9]],
    glasswaterDesert: [["probably", 8, 14], ["parcel", 24, 17], ["errata", 36, 10]],
    frostbellTundra: [["lastminute", 22, 23], ["pebble", 32, 14], ["parcel", 9, 10]],
    stormspinePeaks: [["lastminute", 8, 14], ["alias", 23, 17], ["probably", 36, 9]],
    titanGrave: [["probably", 8, 14], ["errata", 23, 17], ["pebble", 34, 11], ["lastminute", 19, 9]],
  };
})();
