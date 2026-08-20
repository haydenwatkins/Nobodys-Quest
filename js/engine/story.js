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
    title: "Somebody Else's Problem",
    thesis: "A prophecy chose the wrong name. The world may have found the right hero.",
    summary: "Nobody inherits a rescue meant for Somebody and discovers that unfinished promises have begun growing teeth.",
    scene: [
      ["THE STORY", "Long ago, the world wrote a prophecy for Somebody. Somebody never arrived."],
      ["MAYOR MAYBE", "The hero request definitely says Somebody. You are close enough for local government."],
      ["ARCHIVIST ERRATA", "The Unfinished are abandoned duties, vows, and hopes. Left alone, they learned to bite."],
      ["PEBBLE", "Good news: you are not the chosen one. That means you still get to choose."],
    ],
  },
  {
    id: "manyShapes", icon: "✦", color: "#73eff7",
    title: "Many Useful Shapes",
    thesis: "Nobody is not an absence. Nobody is room.",
    summary: "Every recovered form becomes another way to help—and another piece of a hero no prophecy could predict.",
    scene: [
      ["ARCHIVIST ERRATA", "A form is the shape left behind when someone devotes themself to one answer."],
      ["PEBBLE", "You can carry several. Apparently being Nobody comes with excellent storage."],
      ["MAYOR MAYBE", "One hero with many jobs! At last, a staffing plan with no meetings."],
      ["THE STORY", "The blank figure on the prophecy begins filling with borrowed color."],
    ],
  },
  {
    id: "masters", icon: "⚔", color: "#ef7d57",
    title: "Masters of One Thing",
    thesis: "A perfect answer becomes a prison when the question changes.",
    summary: "Nobody challenges masters who mistook excellence for ownership and learns the weakness inside every perfect form.",
    scene: [
      ["ARCHIVIST ERRATA", "The old masters guarded their forms until mastery hardened into possession."],
      ["PEBBLE", "They became perfect. It sounds exhausting."],
      ["THE STORY", "Each master knows one road completely. Nobody survives by changing roads."],
      ["ARCHIVIST ERRATA", "Do not defeat what they are. Show them what they can no longer become."],
    ],
  },
  {
    id: "wakingRoads", icon: "🧭", color: "#ffcd75",
    title: "The Waking Roads",
    thesis: "The oldest roads were never ground. They were promises that carried people forward.",
    summary: "Beyond Greenfield, the Worldwake roads stir and the forgotten giants beneath them begin to stand.",
    scene: [
      ["COURIER PARCEL", "A road moved under my feet. I complained until I realized it was taking me somewhere."],
      ["ARCHIVIST ERRATA", "Worldbearers carried paths on their backs before maps learned to lie flat."],
      ["PEBBLE", "People stopped traveling. The carriers decided nowhere must be sacred."],
      ["THE STORY", "On the eastern horizon, an ancient road takes its first breath."],
    ],
  },
  {
    id: "oldPromises", icon: "🗿", color: "#d9a7ff",
    title: "Six Old Promises",
    thesis: "The Worldbearers do not need to be conquered. They need a reason to carry the future again.",
    summary: "Six World Marks reconnect the horizon as Nobody reminds each ancient carrier why roads exist.",
    scene: [
      ["PEBBLE", "Three marks answered. I think the horizon is starting to remember us."],
      ["ARCHIVIST ERRATA", "The Worldbearers were promised that every road would matter. We broke that promise first."],
      ["THE STORY", "Stone, thread, and sky pull against centuries of stillness."],
      ["PEBBLE", "Let us finish the road. Not because a prophecy says so. Because someone is waiting at the other end."],
    ],
  },
  {
    id: "together", icon: "☀", color: "#fff3c2",
    title: "Nobody, Together",
    thesis: "The world does not need one perfect answer. It needs every good answer willing to change.",
    summary: "With the horizon restored, Nobody faces the impossible ideal that created the prophecy: the God of Every Form.",
    scene: [
      ["THE LAST WORLDBEARER", "I carried every road here for you. I cannot carry the final step."],
      ["ARCHIVIST ERRATA", "The God of Every Form was built from our demand for one answer to every problem."],
      ["PEBBLE", "Fortunately, you have never been one thing for more than a few buttons."],
      ["THE STORY", "At the northern edge of Greenfield, the Final Firmament opens."],
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

G.storyComplete = function () {
  return hasItem("god-spark");
};

G.storyGoal = function () {
  const chapter = G.storyChapter ? G.storyChapter() : 0;
  const act = G.STORY_CHAPTERS[chapter] || G.STORY_CHAPTERS[0];
  const stars = (G.state && G.state.stars) || 0;
  const items = new Set((G.state && G.state.items) || []);
  const marks = (G.state && G.state.worldwake && G.state.worldwake.marks) || [];
  const base = { chapter, act, mapId: "overworld", destination: "Greenfield", complete: false };

  if (G.storyComplete()) return Object.assign(base, {
    complete: true,
    title: "The prophecy has a new ending",
    short: "The world is free to choose what comes next",
    objective: "Return to the roads, finish personal quests, and help Sunrise Town grow.",
    reason: "Nobody proved that a hero can be a collection of lessons instead of one perfect destiny.",
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
        reason: "Meeting a form is only an introduction. Understanding why its answer works is what makes it part of Nobody.",
        progress: storyProgress(ratDone, 1, "RAT MASTERY"),
      });
    }
    if (G.formReady && G.formReady("rat")) return Object.assign(base, {
      guide: "echo", formId: "rat",
      title: "Meet your first new shape", short: "Find the Rat Form Echo",
      objective: "Win a battle, watch for the shape it leaves behind, and approach Rat's echo.",
      reason: "The first form proves that Nobody can carry a life beyond the one the prophecy expected.",
      progress: storyProgress(2, 2, "NOBODY MASTERY"),
    });
    return Object.assign(base, {
      guide: "mastery", formId: "nobody",
      title: "Become more than a blank", short: "Complete two Nobody mastery quests",
      objective: "Explore Greenfield, follow the tutorial, and complete two of Nobody's mastery quests.",
      reason: "Stars record lessons learned. Two lessons reveal the first path into another form.",
      progress: storyProgress(nobodyDone, 2, "NOBODY MASTERY"),
    });
  }

  if (chapter === 1) {
    const masters = [
      { trophy: "trophy-heartwood-crown", name: "Ancient Treant", mapId: "mistwood", destination: "Mistwood", stars: 1 },
      { trophy: "trophy-mire-pearl", name: "Mire Queen", mapId: "sunkenMarsh", destination: "Sunken Marsh", stars: 4 },
      { trophy: "trophy-eclipse-sigil", name: "Eclipse Knight", mapId: "emberRidge", destination: "Ember Ridge", stars: 7 },
    ];
    const defeated = masters.filter((master) => items.has(master.trophy)).length;
    const next = masters.find((master) => !items.has(master.trophy) && stars >= master.stars) ||
      masters.find((master) => !items.has(master.trophy));
    if (next && stars < next.stars) return Object.assign(base, {
      guide: "mastery",
      title: "Learn enough to leave Greenfield", short: `Earn ${next.stars - stars} more ⭐ for ${next.destination}`,
      objective: `Complete form mastery until the road to ${next.destination} opens at ${next.stars} stars.`,
      reason: "Every new route tests whether Nobody can combine the lessons already carried.",
      progress: storyProgress(stars, next.stars, "STARS"),
    });
    return Object.assign(base, {
      guide: "boss",
      mapId: next ? next.mapId : "overworld", destination: next ? next.destination : "Greenfield",
      title: next ? `Challenge the ${next.name}` : "Seek stronger masters",
      short: next ? `Defeat ${next.name} in ${next.destination}` : "Continue mastering forms",
      objective: next ? `Travel to ${next.destination} and defeat the ${next.name}.` : "Complete more form challenges.",
      reason: "The old masters each protect one perfect answer. Your changing loadout is the answer they cannot predict.",
      progress: storyProgress(defeated, 2, "OLD MASTERS"),
    });
  }

  if (chapter === 2) {
    if (stars < 24) return Object.assign(base, {
      guide: "mastery",
      title: "Prepare for the waking horizon", short: `Earn ${24 - stars} more ⭐ to wake Sunstep Road`,
      objective: "Challenge specialist masters, complete form mastery, and reach 24 stars.",
      reason: "Rumors describe an eastern road older than Greenfield. It will answer only a hero with many proven shapes.",
      progress: storyProgress(stars, 24, "STARS"),
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

  const beforeGod = G.formOrder.slice(0, Math.max(0, G.formOrder.indexOf("god")));
  const unmastered = beforeGod.filter((id) => G.formLevel(id) < 5);
  if (unmastered.length) {
    const form = G.forms[unmastered[0]];
    return Object.assign(base, {
      guide: "mastery", formId: unmastered[0],
      title: "Bring every lesson to its ending", short: `Master ${unmastered.length} remaining form${unmastered.length === 1 ? "" : "s"}`,
      objective: `Raise every form to level 5. Begin with ${form ? form.name : unmastered[0]}.`,
      reason: "The Final Firmament tests the complete journey. No borrowed lesson can be left unfinished.",
      progress: storyProgress(beforeGod.length - unmastered.length, beforeGod.length, "MASTERED FORMS"),
    });
  }
  return Object.assign(base, {
    guide: "boss", mapId: "godTrial", destination: "Final Firmament",
    title: "Answer the impossible ideal", short: "Enter the Final Firmament and face God",
    objective: "Find the northern Final Firmament in Greenfield and defeat the God of Every Form.",
    reason: "God is every perfect answer at once. Nobody's final strength is knowing when to become something else.",
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
  const lines = [["PREVIOUSLY IN NOBODY'S QUEST", "The world asked for one perfect Somebody. A persistent Nobody answered instead.", "#f4f4f4"]];
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
    ["THE STORY", "The last borrowed shape falls away. For the first time, Nobody stands before the world as only themself.", "#f4f4f4"],
    ["GOD OF EVERY FORM", "I was every answer at once. You were willing to become the next question.", "#fff3c2"],
    ["ARCHIVIST ERRATA", "The prophecy says: A chosen hero will save the world. I have made one correction.", "#d9a7ff"],
    ["ARCHIVIST ERRATA", "A choosing hero will help the world save itself.", "#d9a7ff"],
    ["PEBBLE", "So Nobody did it.", "#73eff7"],
    ["MAYOR MAYBE", "Exactly. We shall put that on the banner and confuse historians forever.", "#ffcd75"],
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
    <span class="eyebrow">THE PROPHECY, CORRECTED</span><div class="ending-mark">○ ✦ ☀</div>
    <h1>Nobody, Together</h1>
    <p>The world asked for one perfect hero. Nobody answered with every imperfect lesson they were willing to share.</p>
    <div class="ending-stats"><span><strong>${G.state.stars}</strong> stars</span><span><strong>${forms}</strong> forms</span><span><strong>${marks}/6</strong> World Marks</span><span><strong>${residents}</strong> neighbours</span></div>
    <blockquote>“A choosing hero will help the world save itself.”</blockquote>
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
    G.ui.banner("THE END · AND EVERY ROAD AFTER", "The main story is complete. The world, town, mastery, and expeditions remain yours.");
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
