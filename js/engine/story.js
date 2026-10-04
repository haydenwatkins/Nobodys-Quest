/* ============================================================
   MAIN STORY — one dramatic spine through every existing system.

   Forms, old masters, Worldwake, and the final exam were already connected
   mechanically. This layer makes that connection explicit: chapter scenes,
   a persistent objective, a recap, route guidance, and a real ending.
   ============================================================ */

"use strict";

G.STORY_CHAPTERS = [
  {
    id: "somebodysProblem", icon: "○", color: "#f4f4f4",
    title: "A Stitch in the Road",
    thesis: "The road to Sunrise is blocked, and Parcel needs help with the waiting deliveries.",
    summary: "Patchling, a coat stitched from an old road map, sets out to help Parcel reach the people beyond the orchard.",
    scene: [
      ["THE STORY", "Patchling was stitched from an old road map. When the roads began closing, the little coat set off to see who needed help."],
      ["MAYOR MAYBE", "A walking map! I'm glad you're here. Some of our neighbours can't get home, and Parcel's deliveries are stuck in the orchard."],
      ["ARCHIVIST ERRATA", "Those little creatures are called the Unfinished. They appeared where old promises were forgotten. I'm worried they've been left alone too long."],
      ["PEBBLE", "That courier needs a hand. We can worry about the rest of your map after breakfast."],
    ],
  },
  {
    id: "manyShapes", icon: "✦", color: "#73eff7",
    title: "Many Useful Shapes",
    thesis: "Each shape gives you a new way to help the people along the road.",
    summary: "The orchard is open again. Patchling brings Parcel's deliveries to Sunrise and learns what the neighbours need next.",
    scene: [
      ["ARCHIVIST ERRATA", "That coat is made from our old road map! The shapes you’ve found belonged to people who used to look after these roads. I’m glad their skills can help again."],
      ["PEBBLE", "A pocket for every talent. Please leave one for lunch."],
      ["MAYOR MAYBE", "One hero with many jobs! At last, a staffing plan with no meetings."],
      ["THE STORY", "With the orchard open, Parcel can bring the waiting deliveries to Sunrise."],
    ],
  },
  {
    id: "masters", icon: "⚔", color: "#ef7d57",
    title: "Masters of One Thing",
    thesis: "The guardians have blocked the roads for their own reasons. Find out what happened and help reopen them.",
    summary: "Patchling searches the marsh and nearby roads for people stranded by guardians, then prepares to reach the Worldbearers.",
    scene: [
      ["ARCHIVIST ERRATA", "The Treant closed the orchard because he was frightened. The Mire Queen flooded the marsh to keep her court to herself. Now people can’t get home. We need to talk some sense into the other guardians too."],
      ["PEBBLE", "They became perfect. It sounds exhausting."],
      ["THE STORY", "The roads have different dangers. Patchling can choose a shape and a move that will help with each one."],
      ["ARCHIVIST ERRATA", "I’m worried about the people beyond those blocked roads. Please check on them when you can."],
    ],
  },
  {
    id: "wakingRoads", icon: "🧭", color: "#ffcd75",
    title: "The Waking Roads",
    thesis: "Six sleeping Worldbearers have left distant villages without safe roads.",
    summary: "Parcel needs a way across the moving roads. Patchling follows Sunstep Road to find the first Worldbearer at Windscar Canyon.",
    scene: [
      ["COURIER PARCEL", "The road moved under my feet! I nearly dropped the post. There are still people waiting on the far side, but I can't get across."],
      ["ARCHIVIST ERRATA", "Those roads rest on six enormous Worldbearers. They've been asleep for years. I'm worried the villages beyond them will be cut off for good."],
      ["PEBBLE", "Let's find the first one at Windscar Canyon. Maybe we can help it wake up. Parcel, keep the letters safe!"],
      ["THE STORY", "Beyond Sunstep Road, the path to Windscar Canyon begins to move."],
    ],
  },
  {
    id: "oldPromises", icon: "🗿", color: "#d9a7ff",
    title: "Six Old Promises",
    thesis: "Every World Mark reopens a route people have been missing.",
    summary: "Three Worldbearers are awake. Patchling travels west through Shattercoast to help the remaining three reopen their roads.",
    scene: [
      ["PEBBLE", "Three Worldbearers are awake! I love seeing people use those roads again. We've still got three sleepy giants to visit."],
      ["ARCHIVIST ERRATA", "When the old routes closed, people stopped visiting. The Worldbearers thought nobody needed them anymore. I wish we'd checked on them sooner."],
      ["THE STORY", "The western road opens toward Shattercoast. Three more Worldbearers wait beyond it."],
      ["PEBBLE", "Let's go west. I want the people there to get their roads back too."],
    ],
  },
  {
    id: "together", icon: "☀", color: "#fff3c2",
    title: "Every Road Home",
    thesis: "Meridian closed roads that didn't fit his map. Help everyone find their way home.",
    summary: "All six Worldbearers are awake. Patchling practices a varied set of favorite shapes before facing Meridian at the Final Firmament.",
    scene: [
      ["THE LAST WORLDBEARER", "Our roads are joined again. Thank you for coming back for us. But Meridian is still keeping the last crossing shut."],
      ["ARCHIVIST ERRATA", "We asked Meridian to make a perfect map. He started closing any road that didn't fit his plan. People lost their way home. We have to stop him."],
      ["PEBBLE", "You've helped so many people with your different shapes. Pick the ones you love, practice their moves, and we'll face him together."],
      ["THE STORY", "The Final Firmament waits at the northern edge of Greenfield."],
    ],
  },
];

G.makeStory = function () {
  return {
    prologueSeen: false,
    legacyRecapSeen: false,
    endingSeen: false,
    seenChapters: [],
    lastChapter: 0,
  };
};

G.normalizeStory = function (saved) {
  const story = Object.assign(G.makeStory(), saved || {});
  story.seenChapters = Array.from(new Set((story.seenChapters || [])
    .filter((chapter) => Number.isInteger(chapter) && chapter >= 0 && chapter < G.STORY_CHAPTERS.length)));
  story.prologueSeen = !!story.prologueSeen;
  story.legacyRecapSeen = !!story.legacyRecapSeen;
  story.endingSeen = !!story.endingSeen;
  story.lastChapter = Math.max(0, Math.min(G.STORY_CHAPTERS.length - 1, Number(story.lastChapter) || 0));
  return story;
};

G.ensureStory = function () {
  if (!G.state.story) G.state.story = G.makeStory();
  return G.state.story;
};

function hasItem(id) {
  return !!(G.state && (G.state.items || []).includes(id));
}

function storyProgress(value, total, label) {
  return { value: Math.min(total, Math.max(0, value)), total, label };
}

// A new calling can still need a keepsake, guardian, or parent lesson.
// Resolve an attainable step before recommending an unavailable art.
const trophyChallenges = new Map();
function trophyChallenge(itemId) {
  if (!trophyChallenges.has(itemId)) {
    let found = null;
    for (const [mapId, map] of Object.entries(G.maps || {})) {
      const cell = Object.values(map.legend || {}).find(entry => entry.enemy && G.enemies[entry.enemy]?.trophy === itemId);
      if (cell) { found = { mapId, destination: map.name, enemy: G.enemies[cell.enemy].name,
        prize: G.enemies[cell.enemy].trophyName || "its trophy" }; break; }
    }
    trophyChallenges.set(itemId, found);
  }
  return trophyChallenges.get(itemId);
}

const cacheChallenges = new Map();
function cacheChallenge(itemId) {
  if (!cacheChallenges.has(itemId)) {
    let found = null;
    for (const [mapId, map] of Object.entries(G.maps || {})) {
      const cell = Object.values(map.legend || {}).find(entry => entry.chest?.item === itemId);
      if (cell) { found = { mapId, destination: map.name, prize: cell.chest.name || itemId }; break; }
    }
    cacheChallenges.set(itemId, found);
  }
  return cacheChallenges.get(itemId);
}

function formJourneyLead(formId, progress, seen = new Set(), horizon = false) {
  if (seen.has(formId) || !G.forms[formId]) return null;
  seen.add(formId);
  const form = G.forms[formId];
  if (G.formReady(formId)) {
    const echo = G.formEchoFor && G.formEchoFor(formId);
    return { guide: "echo", formId, mapId: echo?.mapId || G.state.mapId,
      destination: echo ? G.maps[echo.mapId].name : G.maps[G.state.mapId].name,
      title: `Meet the ${form.name} Form Echo`, short: echo ? `Approach ${form.name}'s echo` : `Reveal ${form.name}'s echo in battle`,
      objective: echo ? `Approach ${form.name}'s Form Echo in ${G.maps[echo.mapId].name}.` : `Win a battle to reveal ${form.name}'s Form Echo, then approach it.`,
      reason: horizon ? `${form.name}'s path is complete. A new shape brings new arts and lessons for the waking road.` : `${form.name}'s path is complete. Its answer is ready to join Patchling's final portfolio.`, progress };
  }
  const steps = G.formUnlockSteps ? G.formUnlockSteps(formId).filter(step => !step.met) : [];
  const trophy = steps.find(step => step.kind === "trophy" && trophyChallenge(step.itemId));
  if (trophy) {
    const fight = trophyChallenge(trophy.itemId);
    return { guide: "boss", mapId: fight.mapId, destination: fight.destination,
      title: `Recover ${form.name}'s missing lesson`, short: `Face ${fight.enemy} in ${fight.destination}`,
      objective: `Defeat ${fight.enemy} in ${fight.destination} to claim ${fight.prize} for ${form.name}.`,
      reason: horizon ? `${form.name}'s guardian holds a new answer for the journey. Its other requirements remain visible in Form Lab.` : `${form.name}'s guardian still holds one answer needed for the final portfolio. Other mastery requirements remain visible in Form Lab.`, progress };
  }
  const cache = steps.find(step => step.kind === "trophy" && cacheChallenge(step.itemId));
  if (cache) {
    const lead = cacheChallenge(cache.itemId);
    return { guide: "item", itemId: cache.itemId, mapId: lead.mapId, destination: lead.destination,
      title: `Recover ${form.name}'s missing lesson`, short: `Find ${lead.prize} in ${lead.destination}`,
      objective: `Search ${lead.destination} for ${lead.prize} to awaken ${form.name}.`,
      reason: `${form.name}'s path still needs a keepsake hidden on an older road.`, progress };
  }
  for (const step of steps) {
    const options = step.options ? step.options.filter(option => !option.met).map(option => ({ id: option.formId, target: option.target })) :
      step.formIds ? step.formIds.filter(id => G.formLevel(id) < step.target).map(id => ({ id, target: step.target })) : [];
    for (const option of options) {
      if (!G.formUnlocked(option.id)) continue;
      const lesson = G.masteryLessons && G.masteryLessons(Infinity, option.id)[0];
      if (!lesson) continue;
      const source = G.forms[option.id];
      return { guide: "mastery", formId: option.id, questId: lesson.quest.id,
        title: `Learn the path to ${form.name}`, short: `Raise ${source.name} to level ${option.target} for ${form.name}`,
        objective: `${lesson.quest.text} (${lesson.progress}/${lesson.quest.count}). ${lesson.reward}. ${source.name} needs level ${option.target} to awaken ${form.name}.`,
        reason: `${form.name}'s path begins with a lesson from ${source.name}. Wear each form to earn its mastery; borrowed arts still help in combat.`, progress };
    }
    for (const option of options) if (!G.formUnlocked(option.id)) {
      const earlier = formJourneyLead(option.id, progress, seen, horizon);
      if (earlier) return earlier;
    }
    if (step.kind === "stars") {
      const lesson = G.masteryLessons && G.masteryLessons(1)[0];
      if (lesson) return { guide: "mastery", formId: lesson.form.id, questId: lesson.quest.id,
        title: `Learn the path to ${form.name}`, short: `Earn more stars for ${form.name}`,
        objective: `${lesson.quest.text} (${lesson.progress}/${lesson.quest.count}). ${lesson.reward}. ${form.name}'s path needs more stars.`,
        reason: horizon ? "A completed lesson opens another calling on the way to Sunstep Road." : "A completed lesson opens another path into the final portfolio.", progress };
    }
  }
  return { guide: "mastery", formId,
    title: `Find the path to ${form.name}`, short: `Awaken ${form.name}`,
    objective: `Awaken ${form.name}. ${G.unlockHint(formId)} Review its remaining steps in Form Lab.`,
    reason: horizon ? "Another calling can turn the lessons ahead into new ways to travel and fight." : "Choose different shapes to practice, then master the favorites you want to bring to Meridian.", progress };
}

G.storyComplete = function () {
  return hasItem("god-spark");
};

G.storyGoal = function () {
  if (G.openingGoal) { const opening = G.openingGoal(); if (opening) return opening; }
  const chapter = G.storyChapter ? G.storyChapter() : 0;
  const act = G.STORY_CHAPTERS[chapter] || G.STORY_CHAPTERS[0];
  const stars = (G.state && G.state.stars) || 0;
  const items = new Set((G.state && G.state.items) || []);
  const marks = (G.state && G.state.worldwake && G.state.worldwake.marks) || [];
  const base = { chapter, act, mapId: "overworld", destination: "Greenfield", complete: false };

  const gift = (G.state.groundRewards || []).find(reward => reward.source === "guardian" && !items.has(reward.item));
  if (gift) return Object.assign(base, {
    guide: "item", itemId: gift.item, mapId: gift.mapId, destination: G.maps[gift.mapId].name,
    title: "A guardian left a gift", short: `Collect the ${G.groundRewardInfo(gift).name}`,
    objective: "The guardian is defeated. Walk over its gift on the ground to collect it.",
    reason: "Your victory is safe. Its gift waits for you even if you leave the road.",
    progress: storyProgress(0, 1, "GUARDIAN GIFT"),
  });

  if (G.storyComplete()) return Object.assign(base, {
    complete: true,
    title: "The map has room to grow",
    short: "The world is free to choose what comes next",
    objective: "Return to the roads, finish personal quests, and help Sunrise Town grow.",
    reason: "Patchling's living map grows wherever people help each other find a way home.",
    progress: storyProgress(1, 1, "STORY COMPLETE"),
  });

  if (chapter === 0) {
    const nobodyDone = G.forms.nobody ? G.forms.nobody.quests.filter((quest) => G.questsDone.includes(quest.id)).length : 0;
    if ((G.state.claimedForms || []).includes("rat")) {
      const ratDone = G.forms.rat ? G.forms.rat.quests.filter((quest) => G.questsDone.includes(quest.id)).length : 0;
      return Object.assign(base, {
        guide: "mastery", formId: "rat",
        title: "Live inside a borrowed answer", short: "Complete one Rat mastery quest",
        objective: "Become Rat, use its speed and poison, and complete one Rat mastery quest.",
        reason: "Meeting a form is only an introduction. Understanding why its answer works is what makes it part of Patchling.",
        progress: storyProgress(ratDone, 1, "RAT MASTERY"),
      });
    }
    if (G.formReady && G.formReady("rat")) return Object.assign(base, {
      guide: "echo", formId: "rat",
      title: "Meet your first new shape", short: "Find the Rat Form Echo",
      objective: "Win a battle, watch for the shape it leaves behind, and approach Rat's echo.",
      reason: "The first living patch carries a roadkeeper's memory and a new way through the world.",
      progress: storyProgress(2, 2, "PATCHLING MASTERY"),
    });
    return Object.assign(base, {
      guide: "mastery", formId: "nobody",
      title: "Learn your first stitches", short: "Complete two Patchling mastery quests",
      objective: "Explore Greenfield, follow the gold motes, and complete two of Patchling's mastery quests.",
      reason: "Stars record lessons learned. Two lessons reveal the first path into another form.",
      progress: storyProgress(nobodyDone, 2, "PATCHLING MASTERY"),
    });
  }

  const masters = [
    { trophy: "trophy-heartwood-crown", name: "Ancient Treant", mapId: "mistwood", destination: "Mistwood", stars: 1 },
    { trophy: "trophy-mire-pearl", name: "Mire Queen", mapId: "sunkenMarsh", destination: "Sunken Marsh", stars: 4 },
    { trophy: "trophy-eclipse-sigil", name: "Eclipse Knight", mapId: "emberRidge", destination: "Ember Ridge", stars: 7 },
  ];
  if (G.state.opening?.started && G.state.opening.version>=2 && G.state.delivery?.complete && !G.state.items.includes('trophy-mire-pearl') && !G.followedSunriseRequest?.()) {
    const recipes=G.ensureTown().requests?.includes('recipes');
    const lesson=!G.formUnlocked('wizard')&&recipes?formJourneyLead('wizard',storyProgress(0,1,'MAGIC FOR THE MARSH')):null;
    if(lesson)return Object.assign(base,lesson);
    return Object.assign(base,{guide:'opening',mapId:'sunriseQuay',point:recipes?[22,20]:[12,12],
      title:recipes?'Help the harbour':'A friend at home',short:recipes?'Talk to Pebble about the harbour':'Ask Brindle about her recipe book',
      objective:recipes?'Visit Pebble at the centre of Sunrise Quay. He is worried about boats getting lost in the fog.':'Talk to Brindle beside the bakery on Sunrise Quay. You can choose to help her find the cinnamon recipes.',
      reason:'The deliveries are arriving again. Help the neighbours get their home back.',progress:storyProgress(0,1,'SUNRISE FRIENDS')});
  }
  if (chapter === 1) {
    const defeated = masters.filter((master) => items.has(master.trophy)).length;
    const next = masters.find((master) => !items.has(master.trophy) && stars >= master.stars) ||
      masters.find((master) => !items.has(master.trophy));
    if (next && stars < next.stars) return Object.assign(base, {
      guide: "mastery",
      title: "Learn enough to leave Greenfield", short: `Earn ${next.stars - stars} more ⭐ for ${next.destination}`,
      objective: `Complete form mastery until the road to ${next.destination} opens at ${next.stars} stars.`,
      reason: "Every new route tests whether Patchling can combine the lessons already carried.",
      progress: storyProgress(stars, next.stars, "STARS"),
    });
    return Object.assign(base, {
      guide: "boss",
      mapId: next ? next.mapId : "overworld", destination: next ? next.destination : "Greenfield",
      title: next ? `Challenge the ${next.name}` : "Seek stronger masters",
      short: next ? `Defeat ${next.name} in ${next.destination}` : "Continue mastering forms",
      objective: next ? `Travel to ${next.destination} and defeat the ${next.name}.` : "Complete more form challenges.",
      reason: "The old masters each protect one perfect answer. Your changing arts are the answer they cannot predict.",
      progress: storyProgress(defeated, 2, "OLD MASTERS"),
    });
  }

  if (chapter === 2) {
    const wakeStars=G.PACING.worldwakeStars;
    const lesson = G.masteryLessons && G.masteryLessons(1)[0];
    const unfinishedMaster = masters.find((master) => !items.has(master.trophy) && stars >= master.stars);
    if (stars < wakeStars && unfinishedMaster) return Object.assign(base, {
      guide: "boss", mapId: unfinishedMaster.mapId, destination: unfinishedMaster.destination,
      title: `Answer the ${unfinishedMaster.name}'s challenge`,
      short: `Face ${unfinishedMaster.name} in ${unfinishedMaster.destination}`,
      objective: `The ${unfinishedMaster.name} still holds an old road in ${unfinishedMaster.destination}. Face this guardian while gathering ${wakeStars - stars} more stars for Sunstep Road.`,
      reason: "The waking horizon asks for lessons from the roads already traveled. An unfinished guardian is a stronger answer than another empty tally.",
      progress: storyProgress(stars, wakeStars, "STARS TO SUNSTEP"),
    });
    if (stars < wakeStars && !G.masteryLessons(1, null, true).length) {
      // Introduce the early roster during the long mastery stretch, rather
      // than reserving its missing paths for the final portfolio. This is a
      // lead, never an additional gate. A player's followed lesson wins.
      const dragon = G.formOrder.indexOf("dragon");
      const callings = G.formOrder.slice(0, dragon < 0 ? 8 : dragon + 1)
        .filter(id => G.forms[id] && !G.forms[id].invalid && !G.formUnlocked(id));
      const next = callings.find(id => G.formReady(id)) || callings[0];
      if (next) {
        const progress = storyProgress(stars, wakeStars, "STARS TO SUNSTEP");
        const lead = formJourneyLead(next, progress, new Set(), true);
        if (lead) return Object.assign(base, lead, {
          objective: `${lead.objective} Sunstep Road opens at ${wakeStars} stars (${stars}/${wakeStars}).`,
        });
      }
    }
    if (stars < wakeStars) return Object.assign(base, {
      guide: "mastery",
      questId: lesson && lesson.quest.id,
      title: "Prepare for the waking horizon", short: `Earn ${wakeStars - stars} more ⭐ to wake Sunstep Road`,
      objective: lesson ? `${lesson.quest.text} (${lesson.progress}/${lesson.quest.count}). ${lesson.reward}. Complete lessons in your travels to reach ${wakeStars} stars.` : `Challenge specialist masters, complete form mastery, and reach ${wakeStars} stars.`,
      reason: "Rumors describe an eastern road older than Greenfield. It will answer only a hero with many proven shapes.",
      progress: storyProgress(stars, wakeStars, "STARS"),
    });
    return Object.assign(base, {
      guide: "travel", mapId: "sunstepPrairie", destination: "Sunstep Prairie",
      title: "Find the road that breathes", short: "Take Greenfield's eastern road to Sunstep Prairie",
      objective: "Cross the eastern edge of Greenfield and enter Sunstep Prairie.",
      reason: "The Worldwake has begun. Something beneath the oldest roads is waiting to see who still travels them.",
      progress: storyProgress(1, 1, "ROAD OPEN"),
    });
  }

  const worldbearers = [
    { mark: "sky", name: "Sky Sovereign", mapId: "windscarCanyon", destination: "Windscar Canyon" },
    { mark: "stone", name: "Old Mason", mapId: "hangingGardens", destination: "Hanging Gardens" },
    { mark: "thread", name: "Silk Matriarch", mapId: "rootdeepHollow", destination: "Rootdeep Hollow" },
    { mark: "echo", name: "Bell Titan", mapId: "frostbellTundra", destination: "Frostbell Tundra" },
    { mark: "light", name: "Lantern Keeper", mapId: "stormspinePeaks", destination: "Stormspine Peaks" },
    { mark: "heart", name: "Last Worldbearer", mapId: "titanGrave", destination: "Titan Grave" },
  ];

  if (chapter === 3 || chapter === 4) {
    const range = chapter === 3 ? worldbearers.slice(0, 3) : worldbearers.slice(3);
    const next = range.find((guardian) => !marks.includes(guardian.mark)) || worldbearers.find((guardian) => !marks.includes(guardian.mark));
    // Only the western return road adds a late star gate; avoid searching the
    // whole map graph for a goal the HUD may request every frame.
    const route = chapter === 4 && stars < G.PACING.coastStars && next && G.state.mapId && G.guidanceRoute &&
      G.guidanceRoute(G.state.mapId, next.mapId);
    const firstGate = route && route.steps.find((step) => step.reason);
    if (firstGate && firstGate.cell.stars > stars && !firstGate.cell.mark && !firstGate.cell.mastery && !firstGate.cell.masteryPortfolio) {
      const road = G.maps[firstGate.to]?.name || firstGate.to;
      const lesson = G.masteryLessons && G.masteryLessons(1)[0];
      return Object.assign(base, {
        guide: "mastery", questId: lesson && lesson.quest.id,
        title: `Open the road to ${road}`, short: `Earn ${firstGate.cell.stars - stars} more ⭐ for ${road}`,
        objective: lesson ? `${lesson.quest.text} (${lesson.progress}/${lesson.quest.count}). ${lesson.reward}. Then cross ${road} toward ${next.destination}.`
          : `Complete form lessons to open ${road}, then continue toward ${next.destination}.`,
        reason: `The path to ${next.destination} runs through ${road}. The Worldbearer beyond it can wait while Patchling learns one more answer.`,
        progress: storyProgress(stars, firstGate.cell.stars, "STARS"),
      });
    }
    return Object.assign(base, {
      guide: "boss",
      mapId: next ? next.mapId : "titanGrave", destination: next ? next.destination : "Titan Grave",
      title: next ? `Wake the ${next.name}` : "Carry the six marks to Titan Grave",
      short: next ? `Purify ${next.name} in ${next.destination}` : "Follow the completed World Path",
      objective: next ? `Reach ${next.destination}, confront the ${next.name}, and awaken its World Mark.` : "Return to the final Worldbearer.",
      reason: "Each guardian is an old promise made motionless. Victory means giving it a reason to carry travelers again.",
      progress: storyProgress(marks.length, 6, "WORLD MARKS"),
    });
  }

  const exam = G.finalExamMastery();
  if (!exam.ready) {
    const focus = exam.broad < exam.breadthGoal ? exam.missingBreadth :
      G.formOrder.filter((id) => id !== "god" && G.forms[id] && !G.forms[id].invalid && G.formLevel(id) < 5);
    const lessons = G.masteryLessons ? G.masteryLessons(Infinity).filter(entry => focus.includes(entry.form.id)) : [];
    // During specialization, complete a nearly mastered form before sending
    // the traveler into another level-three path. An explicit followed lesson
    // remains the player's choice even when another form is closer to five.
    const lesson = lessons.find(entry => entry.quest.id === G.state.lessonQuestId) ||
      (exam.broad >= exam.breadthGoal && lessons.find(entry => G.formLevel(entry.form.id) === 4)) || lessons[0];
    const progress = storyProgress(Math.min(exam.broad,exam.breadthGoal) + Math.min(exam.specialists, exam.specialistGoal), exam.breadthGoal + exam.specialistGoal, "FINAL PREPARATION");
    const locked = focus.find(id => !G.formUnlocked(id));
    if (!lesson && locked) {
      const lead = formJourneyLead(locked, progress);
      return Object.assign(base, lead, {
        objective: `${lead.objective} Bring ${exam.breadthGoal} chosen forms to level 3 and ${exam.specialistGoal} favorites to level 5.`,
      });
    }
    const form = lesson ? lesson.form : G.forms[focus[0]];
    const step = lesson ? `${lesson.quest.text} (${lesson.progress}/${lesson.quest.count}). ${lesson.reward}.` :
      G.formUnlocked && !G.formUnlocked(form.id) ? `Awaken ${form.name}. ${G.unlockHint(form.id)}` : `Practice ${form.name}'s remaining lessons.`;
    return Object.assign(base, {
      guide: "mastery", formId: form.id, questId: lesson && lesson.quest.id,
      title: "Practice different shapes, master your favorites", short: `${Math.min(exam.broad,exam.breadthGoal)}/${exam.breadthGoal} forms at level 3 · ${Math.min(exam.specialists,exam.specialistGoal)}/${exam.specialistGoal} mastered`,
      objective: `${step} Bring ${exam.breadthGoal} chosen forms to level 3 and ${exam.specialistGoal} favorites to level 5. Wear each form to earn its mastery; borrowed arts still help in combat.`,
      reason: "You have helped reopen the roads. A varied set of familiar shapes and three favorites will prepare you to face Meridian.",
      progress,
    });
  }
  return Object.assign(base, {
    guide: "boss", mapId: "godTrial", destination: "Final Firmament",
    title: "Answer the impossible ideal", short: "Enter the Final Firmament and face Meridian",
    objective: "Find the northern Final Firmament in Greenfield and defeat Meridian, the Perfect Map.",
    reason: "Meridian demands one perfect answer to every road. Patchling's final strength is knowing when to become something else.",
    progress: storyProgress(1, 1, "FINAL EXAM READY"),
  });
};

function queueDialogue(lines, onClose) {
  if (!G.ui || !G.ui.dialogue) return;
  lines.forEach((line, index) => G.ui.dialogue(line[0], line[1], {
    accent: line[2] || "#ffcd75",
    onClose: index === lines.length - 1 ? onClose : null,
  }));
}

G.playStoryChapter = function (chapter, replay) {
  const def = G.STORY_CHAPTERS[chapter];
  if (!def) return false;
  const story = G.ensureStory();
  if (!replay && story.seenChapters.includes(chapter)) return false;
  if (!story.seenChapters.includes(chapter)) story.seenChapters.push(chapter);
  story.lastChapter = Math.max(story.lastChapter, chapter);
  if (chapter === 0) story.prologueSeen = true;
  G.ui.banner(`ACT ${chapter + 1} · ${def.title.toUpperCase()}`, def.thesis);
  queueDialogue(def.scene.map((line) => [line[0], line[1], def.color]));
  G.saveGame();
  return true;
};

G.playStoryRecap = function (automatic) {
  const current = G.storyChapter ? G.storyChapter() : 0;
  const lines = [["THE ROAD SO FAR", "A traveller stitched from an old map began mending the paths that people had forgotten.", "#f4f4f4"]];
  for (let chapter = 0; chapter <= current; chapter++) {
    const def = G.STORY_CHAPTERS[chapter];
    lines.push([`ACT ${chapter + 1} · ${def.title}`, def.summary, def.color]);
  }
  const goal = G.storyGoal();
  lines.push([goal.complete ? "THE STORY SO FAR" : "NOW", goal.complete ? goal.reason : goal.objective, goal.act.color]);
  queueDialogue(lines);
  if (automatic) {
    const story = G.ensureStory();
    story.legacyRecapSeen = true;
    G.saveGame();
  }
};

let storySessionStarted = false;
let endingQueued = false;

G.beginStorySession = function (save) {
  if (storySessionStarted || !G.state) return;
  storySessionStarted = true;
  const story = G.ensureStory();
  const current = G.storyChapter ? G.storyChapter() : 0;
  story.lastChapter = Math.max(story.lastChapter, current);

  if (G.beginOpening && G.beginOpening()) return;

  if (!save && !story.prologueSeen) {
    G.playStoryChapter(0, false);
    return;
  }
  if (save && !save.story && !story.legacyRecapSeen) {
    for (let chapter = 0; chapter <= current; chapter++) if (!story.seenChapters.includes(chapter)) story.seenChapters.push(chapter);
    story.prologueSeen = true;
    G.playStoryRecap(true);
  } else if (!story.seenChapters.includes(current)) {
    G.playStoryChapter(current, false);
  }
  G.storyCheck();
};

G.storyCheck = function () {
  if (!storySessionStarted || !G.state) return;
  if (G.openingActive && G.openingActive()) return;
  const story = G.ensureStory();
  const current = G.storyChapter ? G.storyChapter() : 0;
  if (story.lastChapter !== current) {
    story.lastChapter = current;
    G.saveGame();
  }
  if (!story.seenChapters.includes(current)) G.playStoryChapter(current, false);
  if (G.storyComplete() && !story.endingSeen && !endingQueued) G.playStoryEnding();
};

G.playStoryEnding = function (replay) {
  const story = G.ensureStory();
  if (!replay && (story.endingSeen || endingQueued)) return false;
  endingQueued = true;
  const lines = [
    ["THE STORY", "The last borrowed shape folds into the coat. Patchling's map is full of roads, with room at its edges for more.", "#f4f4f4"],
    ["MERIDIAN", "I was every answer at once. You were willing to become the next question.", "#fff3c2"],
    ["ARCHIVIST ERRATA", "The first map ended here. Yours has paths reaching right off the page.", "#d9a7ff"],
    ["ARCHIVIST ERRATA", "A road stays alive when people carry each other home.", "#d9a7ff"],
    ["PEBBLE", "One last stitch. Then breakfast. You promised.", "#73eff7"],
    ["MAYOR MAYBE", "A public breakfast! At last, a civic project with a sensible budget.", "#ffcd75"],
    ["THE STORY", "The roads do not close. They lead home, outward, and everywhere a different answer is needed.", "#f4f4f4"],
  ];
  queueDialogue(lines, () => G.showStoryEnding());
  return true;
};

G.storyEndingOpen = false;
G.showStoryEnding = function () {
  const story = G.ensureStory();
  story.endingSeen = true;
  story.lastChapter = 5;
  endingQueued = false;
  G.saveGame();
  if (typeof document === "undefined") return;
  const overlay = document.getElementById("story-ending");
  if (!overlay) return;
  const marks = (G.state.worldwake && G.state.worldwake.marks || []).length;
  const forms = G.unlockedForms ? G.unlockedForms().length : 1;
  const residents = G.state.town && G.state.town.residents || 0;
  overlay.innerHTML = `<main class="ending-panel" role="dialog" aria-modal="true" aria-label="Story complete">
    <span class="eyebrow">THE LIVING MAP</span><div class="ending-mark">○ ✦ ☀</div>
    <h1>Every Road Home</h1>
    <p>Patchling's coat carries every lesson shared along the way. Beyond its seams, the roads keep growing.</p>
    <div class="ending-stats"><span><strong>${G.state.stars}</strong> stars</span><span><strong>${forms}</strong> forms</span><span><strong>${marks}/6</strong> World Marks</span><span><strong>${residents}</strong> neighbours</span></div>
    <blockquote>“A road stays alive when people carry each other home.”</blockquote>
    <button data-ending-close>Return to the living world</button>
  </main>`;
  overlay.classList.remove("hidden");
  G.storyEndingOpen = true;
  const closeButton = overlay.querySelector("[data-ending-close]");
  if (closeButton.focus) closeButton.focus({ preventScroll: true });
  closeButton.addEventListener("click", () => {
    overlay.classList.add("hidden");
    G.storyEndingOpen = false;
    G.updateStoryEndingInput = null;
    if (G.menuController) G.menuController.reset(overlay);
    G.ui.banner("THE END · AND EVERY ROAD AFTER", "Your map is mended. The roads, the town, and every unfinished promise remain yours.");
  });
  // Controller path (main.js calls this per frame): A or B turns the page —
  // on TV this DOM button can't be reached any other way.
  G.updateStoryEndingInput = (dt) => {
    if (!G.storyEndingOpen) return;
    G.menuController.update(overlay, {
      preferred: closeButton,
      onBack: () => closeButton.click(),
    }, dt);
  };
};

G.events.on("saveSlotReady", (data) => G.beginStorySession(data.save));
for (const event of ["questDone", "formUnlock", "pickup", "mapEnter"])
  G.events.on(event, () => G.storyCheck());


// Meet a new calling through a concrete use, rather than a menu of chores.
G.events.on("formUnlock", ({form}) => {
  const lessons={
    ranger:["SER PENDING","That bow suits you! Hold your basic attack to draw it, then release. Give yourself room and try a shot at a distant baddie. A steady shot is worth more than rushing."],
    frog:["PEBBLE","A Frog! Try your tongue from just outside a baddie’s reach, then Hop Crash through it. I’ll stay back so you have room. Those ponds should feel much less scary now."],
    alchemist:["ARCHIVIST ERRATA","You’ve learned to handle those flasks! Try Volatile Flask when two baddies come close together. I’d like to see the paths cleared, but please keep the bottles away from our picnic."],
    stormcaller:["PEBBLE","Your coat’s crackling! Try Chain Lightning when baddies are close together. We can clear the road without running into the middle of them."],
    dragon:["PEBBLE","Look at those wings! Try a Tail Sweep, then breathe a little fire while the baddies recover. The people at the next camp will be glad to have a warm friend."],
  };
  const line=lessons[form];if(line)G.ui.dialogue(line[0],line[1],{accent:"#ffcd75"});
});
