/* ============================================================
   AUDIO — tiny retro sound effects, made from pure math.
   No sound files needed! Each effect is a little recipe:
   a wave shape, a starting pitch, an ending pitch, and a length.
   ============================================================ */

"use strict";

G.sfx = (() => {
  let ctx = null;

  // iPads refuse to play sound until the player touches the screen,
  // so we create the audio engine on the first input.
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // recipe: [wave, startPitch, endPitch, seconds, volume]
  const recipes = {
    hit:       ["square",   220, 110, 0.08, 0.25],
    hurt:      ["sawtooth", 160, 60,  0.22, 0.3],
    pickup:    ["sine",     520, 880, 0.12, 0.3],
    mana:      ["sine",     380, 600, 0.08, 0.2],
    swap:      ["triangle", 300, 500, 0.12, 0.3],
    wardDing:  ["square",   700, 700, 0.05, 0.15],
    wardBreak: ["sawtooth", 500, 120, 0.25, 0.35],
    quest:     ["sine",     523, 784, 0.3,  0.35],
    unlock:    ["triangle", 392, 784, 0.5,  0.4],
    shoot:     ["square",   400, 250, 0.07, 0.15],
    dash:      ["sawtooth", 200, 400, 0.1,  0.2],
    poison:    ["triangle", 250, 150, 0.15, 0.2],
    door:      ["triangle", 150, 300, 0.4,  0.35],
    ko:        ["sawtooth", 300, 50,  0.6,  0.4],
  };

  function play(name) {
    const c = ensure();
    if (!c) return;
    const r = recipes[name];
    if (!r) return;
    const [wave, f0, f1, dur, vol] = r;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(f0, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), c.currentTime + dur);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + dur + 0.02);
  }

  return { play, ensure };
})();
