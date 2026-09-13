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
      title: "3/5  READ THE WORLD",
      desktop: "Follow the gold motes to the nearby sign",
      controller: "Follow the gold motes to the nearby sign",
      touch: "Follow the gold motes to the nearby sign",
    },
    {
      title: "4/5  CHANGE YOUR ANSWER",
      desktop: "Tap Q to swap · hold Q for any form",
      controller: "Tap B to swap · hold B for any form",
      touch: "Tap ⇄ to swap · hold ⇄ for any form",
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
  let hintsShown = new Set();

  function init(save) {
    step = save && Number.isInteger(save.tutorialStep) ? save.tutorialStep : 0;
    done = !!(save && save.tutorialDone);
    const previouslySeen = !!(save && save.tutorialSeen);
    hintsShown = new Set(save && Array.isArray(save.tutorialHints) ? save.tutorialHints : []);
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
      G.ui.banner("FIRST LESSONS COMPLETE", "Explore freely, mix unlikely arts, and choose your own road.");
    } else {
      step++;
      visibleFor = 5;
      G.sfx.play("pickup");
      G.ui.toast("Lesson learned.");
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
    if (step === 3 && G.unlockedForms && G.unlockedForms().length < 2) return null;
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
    hintsShown.clear();
    startX = G.state.player.x;
    startY = G.state.player.y;
    G.saveGame();
  }

  // Combat already communicates through meters, colors, sounds and hit text.
  // These explanatory toasts exist only for a first adventure (or an explicit
  // tutorial replay), and each topic appears once so coaching never becomes a
  // second permanent HUD.
  function hint(key, text, duration) {
    if (done || hintsShown.has(key) || !G.ui || !G.ui.toast) return false;
    hintsShown.add(key);
    G.ui.toast(text, duration || 2.8);
    G.saveGame();
    return true;
  }

  function coaching(topic) {
    if (done) return false;
    if (topic === "ward") return step === 4;
    return true;
  }

  G.events.on("abilityUse", () => advance(1));
  G.events.on("sign", () => advance(2));
  G.events.on("swap", () => advance(3));
  G.events.on("wardBreak", () => advance(4));
  G.events.on("formUnlock", () => { if (!done && step === 3) visibleFor = 8; });

  return {
    init, dismiss, replay, hint, coaching,
    update,
    prompt,
    get step() { return step; },
    get done() { return done; },
    get seen() { return seen; },
    get hintsShown() { return Array.from(hintsShown); },
  };
})();
