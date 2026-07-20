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
        "I was a quest marker. Then my quest was cancelled. I kept the marker.",
        "If anyone asks, I am a licensed companion. Please do not ask the license.",
      ],
      1: [
        "You change jobs whenever one gets difficult. At last, a management strategy I understand.",
        "Every form fits you because Nobody comes with very generous empty space.",
      ],
      3: [
        "The roads woke up grumpy. In fairness, people have been walking all over them.",
        "Worldbearers used to carry travelers. Now they carry grudges. Much lighter, apparently.",
      ],
      5: [
        "A perfect hero would have arrived sooner. Good thing we got a persistent one.",
        "The story says Nobody saved everyone. The grammar department is furious.",
      ],
    }),

    mayorMaybe: npc("Mayor Maybe", "?", {
      hair: "#70493e", skin: "#e7ad88", coat: "#8f4f71", accent: "#f3d56b",
    }, {
      0: [
        "Welcome! Our hero request was addressed to Somebody. You are close enough for local government.",
        "The town motto is 'Somebody Else Will Handle It.' The second line was never handled.",
        "Monsters are unfinished chores with teeth. This is why I never floss near paperwork.",
      ],
      1: [
        "Every abandoned job left a shape behind. You call them forms. I call them staffing.",
        "Please rescue the world before election day. I have promised the world that you will.",
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
        "History says a chosen hero will rise. The footnote says history was guessing.",
        "The Unfinished began as duties, vows, and one extremely overdue library book.",
      ],
      1: [
        "A form is a story about what someone can be. You borrow the story, not the person.",
        "That makes ability swapping scholarship. Violent, airborne scholarship.",
      ],
      2: [
        "The old guardians were masters who mistook mastery for ownership.",
        "Defeating a form's master proves you understand its weakness, which is awkward but educational.",
      ],
      3: [
        "Worldbearers carried roads before maps were flat enough to fold. They remember every destination.",
        "When people stopped going anywhere, the great carriers concluded that nowhere must be sacred.",
      ],
      5: [
        "The God of Every Form was built from our demand for one answer to every problem.",
        "You won by being many imperfect answers. I have corrected the prophecy in permanent pencil.",
      ],
    }, "robe"),

    parcel: npc("Courier Parcel", ">", {
      hair: "#4e372f", skin: "#d99a73", coat: "#b45b46", accent: "#f0c45c",
    }, {
      0: [
        "I deliver anywhere! Except there, wherever there is, and uphill on Tuesdays.",
        "Road tip: enter at one edge, leave at the opposite edge. Revolutionary, I know.",
      ],
      1: [
        "Your package says 'TO: NOBODY.' Finally, a customer who cannot deny it is theirs.",
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
        "I swore to defend this road as soon as my oath receives final approval.",
        "My sword is ceremonial. The ceremony is hitting monsters, but scheduling is difficult.",
      ],
      1: [
        "You became a knight without seventeen countersignatures. Is that even heroic?",
        "A duty left undone becomes Unfinished. Mine have formed a very orderly queue.",
      ],
      2: [
        "The masters taunt you because asking politely would make a very short boss intro.",
        "A duel is a conversation where every rebuttal has knockback.",
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
        "Names are just tiny costumes for ideas. Mine has pockets.",
        "Nobody sounds lonely until you realize it leaves room for everybody.",
      ],
      1: [
        "Do not ask which form is the real you. Real things are allowed to change clothes.",
        "Borrow one move from another form. Identity is a buffet, not assigned seating.",
      ],
      2: [
        "The form masters became excellent at one thing and suspicious of all other things.",
        "A passive trait is who a form is while no one is pressing buttons. Listen to that part.",
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
        "Diagnosis: the world has acute narrative buildup and several inflamed side quests.",
        "The Unfinished feed on neglected promises. Also crumbs. Mostly promises, but sweep anyway.",
      ],
      1: [
        "Forms are safe when taken as directed. Side effects include heroism and an alarming wardrobe.",
        "Your mana is not exhaustion. It is the abilities taking turns like civilized explosions.",
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
        "Trees do move. Usually upward. Mistwood is showing off.",
        "The slimes eat weeds. The weeds filed a complaint. I composted the paperwork.",
      ],
      1: [
        "Every form leaves a different footprint. Rat prints are mostly punctuation.",
        "The world is not scenery. It is your oldest party member and it never splits the treasure.",
      ],
      2: [
        "Guardians grew around old responsibilities, like moss around a statue with opinions.",
        "Beat them, but pay attention. A good fight is a lesson wearing a large health bar.",
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
        "Shattercoast was discovered yesterday. Naturally, I have commanded it for years.",
        "We named the coast after its rocks, its waves, and our evacuation plan.",
      ],
      2: [
        "Mini-bosses are bosses with efficient branding. Never say that where they can hear.",
        "A gauntlet is several emergencies agreeing to stand in one line.",
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
        "I foresee a hero with no name, many faces, and pockets full of food. Probably you.",
        "My visions are never wrong. Their relationship with reality is merely informal.",
      ],
      1: [
        "The stars do not choose forms. They are stickers on the universe's reward chart.",
        "You will master every shape except punctuality. This prophecy is already complete.",
      ],
      3: [
        "Beyond the waking roads waits a grave for a titan that has neglected to be dead.",
        "Six marks open the last path. Or decorate a very intimidating loyalty card.",
      ],
      4: [
        "The God of Every Form is not divine. It is everyone wishing for a hero who never needs help.",
        "Perfection has no friends, no loadout, and a truly exhausting final phase.",
      ],
      5: [
        "The future survived. It is untidy, overgrown, and requesting a sequel.",
        "Nobody saved the world. Everybody else can start cleaning up after lunch.",
      ],
    }, "robe"),
  };

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
    emberRidge: [["pending", 5, 9], ["pebble", 20, 8], ["provisional", 25, 15]],
    dungeon: [["errata", 11, 14], ["pending", 19, 13], ["alias", 15, 9]],
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
