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
      touch: "Drag anywhere on the left side",
    },
    {
      title: "2/5  ATTACK",
      desktop: "Press J, Z, or Space to use A",
      touch: "Tap your big attack button",
    },
    {
      title: "3/5  OPEN THE MENU",
      desktop: "Press Esc or Enter",
      touch: "Tap the menu button",
    },
    {
      title: "4/5  PIN A QUEST",
      desktop: "Open Quests and choose PIN",
      touch: "Open Quests and tap PIN",
    },
    {
      title: "5/5  BREAK A WARD",
      desktop: "Find Bones and use BLUNT damage",
      touch: "Find Bones and use BLUNT damage",
    },
  ];

  let step = 0;
  let done = false;
  let startX = 0;
  let startY = 0;

  function init(save) {
    step = save && Number.isInteger(save.tutorialStep) ? save.tutorialStep : 0;
    done = !!(save && save.tutorialDone);
    step = G.util.clamp(step, 0, steps.length - 1);
    startX = G.state.player.x;
    startY = G.state.player.y;
  }

  function advance(expectedStep) {
    if (done || step !== expectedStep) return;
    if (step >= steps.length - 1) {
      done = true;
      G.sfx.play("quest");
      G.ui.banner("TUTORIAL COMPLETE!", "Explore, mix abilities, and finish quests your way.");
    } else {
      step++;
      G.sfx.play("pickup");
      G.ui.toast("Tutorial step complete!");
    }
    G.saveGame();
  }

  function update() {
    if (done || step !== 0 || !G.state) return;
    const p = G.state.player;
    if (G.util.dist(startX, startY, p.x, p.y) >= 20) advance(0);
  }

  function prompt() {
    if (done) return null;
    const current = steps[step];
    return {
      title: current.title,
      text: G.input.isTouch ? current.touch : current.desktop,
    };
  }

  G.events.on("abilityUse", () => advance(1));
  G.events.on("menuOpen", () => advance(2));
  G.events.on("questPin", () => advance(3));
  G.events.on("wardBreak", () => advance(4));

  return {
    init,
    update,
    prompt,
    get step() { return step; },
    get done() { return done; },
  };
})();
