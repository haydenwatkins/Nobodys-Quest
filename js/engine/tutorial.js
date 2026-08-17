/* ============================================================
   TUTORIAL — a short, persistent first-adventure guide.

   The prompts react to things the player actually does, so the
   same lesson works with a keyboard or touchscreen.
   ============================================================ */

"use strict";

G.tutorial = (() => {
  const steps = [
    {
      title: "1/5  MOVE",
      desktop: "Use WASD or the arrow keys",
      controller: "Move with the left stick or D-pad",
      touch: "Drag anywhere on the left side",
    },
    {
      title: "2/5  ATTACK",
      desktop: "Press J, Z, or Space to use A",
      controller: "A or RT attacks - right stick aims",
      touch: "Tap to auto-aim · drag to aim",
    },
    {
      title: "3/5  OPEN THE MENU",
      desktop: "Press Esc or Enter",
      controller: "Press the Menu button",
      touch: "Tap the menu button",
    },
    {
      title: "4/5  PIN A QUEST",
      desktop: "Open Quests and choose PIN",
      controller: "Use the D-pad and A in the Quests menu",
      touch: "Open Quests and tap PIN",
    },
    {
      title: "5/5  BREAK A WARD",
      desktop: "Find Bones and use BLUNT damage",
      controller: "Find Bones and use BLUNT damage",
      touch: "Find Bones and use BLUNT damage",
    },
  ];

  let step = 0;
  let done = false;
  let seen = false;
  let visibleFor = 0;
  let startX = 0;
  let startY = 0;

  function init(save) {
    step = save && Number.isInteger(save.tutorialStep) ? save.tutorialStep : 0;
    done = !!(save && save.tutorialDone);
    const previouslySeen = !!(save && save.tutorialSeen);
    seen = true;
    // Existing adventures migrate quietly. A genuinely new adventure gets a
    // brief first hint, then later lessons appear only when they are reached.
    visibleFor = save ? 0 : 7;
    step = G.util.clamp(step, 0, steps.length - 1);
    startX = G.state.player.x;
    startY = G.state.player.y;
    if (!previouslySeen) G.saveGame();
  }

  function advance(expectedStep) {
    if (done || step !== expectedStep) return;
    if (step >= steps.length - 1) {
      done = true;
      G.sfx.play("quest");
      G.ui.banner("TUTORIAL COMPLETE!", "Explore, mix abilities, and finish quests your way.");
    } else {
      step++;
      visibleFor = 5;
      G.sfx.play("pickup");
      G.ui.toast("Tutorial step complete!");
    }
    G.saveGame();
  }

  function update(dt) {
    visibleFor = Math.max(0, visibleFor - (dt || 0));
    if (done || step !== 0 || !G.state) return;
    const p = G.state.player;
    if (G.util.dist(startX, startY, p.x, p.y) >= 20) advance(0);
  }

  function prompt() {
    if (done || visibleFor <= 0) return null;
    const current = steps[step];
    return {
      title: current.title,
      text: G.input.hasGamepad ? current.controller : G.input.isTouch ? current.touch : current.desktop,
    };
  }

  function dismiss() {
    visibleFor = 0;
    G.saveGame();
  }

  function replay() {
    step = 0;
    done = false;
    seen = true;
    visibleFor = 8;
    startX = G.state.player.x;
    startY = G.state.player.y;
    G.saveGame();
  }

  G.events.on("abilityUse", () => advance(1));
  G.events.on("menuOpen", () => advance(2));
  G.events.on("questPin", () => advance(3));
  G.events.on("wardBreak", () => advance(4));

  return {
    init, dismiss, replay,
    update,
    prompt,
    get step() { return step; },
    get done() { return done; },
    get seen() { return seen; },
  };
})();
