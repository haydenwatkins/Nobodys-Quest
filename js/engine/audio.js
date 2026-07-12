/* ============================================================
   AUDIO — tiny retro sound effects, made from pure math.
   No sound files needed! Each effect is a little recipe:
   a wave shape, a starting pitch, an ending pitch, and a length.
   ============================================================ */

"use strict";

G.sfx = (() => {
  let ctx = null;
  let musicTimer = null;
  let musicStep = 0;
  const recent = {};

  // iPads refuse to play sound until the player touches the screen,
  // so we create the audio engine on the first input.
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    startMusic();
    return ctx;
  }

  function startMusic() {
    if (!ctx || musicTimer) return;
    const notes = [196, 247, 294, 247, 220, 262, 330, 262];
    musicTimer = setInterval(() => {
      if (!ctx || ctx.state !== "running" || document.hidden) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = musicStep % 4 === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(notes[musicStep % notes.length], now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.025, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
      musicStep++;
    }, 560);
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
    defeat:    ["triangle",  180, 520, 0.18, 0.28],
    explosion: ["sawtooth", 120, 45,  0.18, 0.25],
  };

  function tone(recipe, pitch, volumeScale, delay) {
    const c = ensure();
    if (!c) return;
    const [wave, f0, f1, dur, vol] = recipe;
    const osc = c.createOscillator();
    const gain = c.createGain();
    const start = c.currentTime + (delay || 0);
    osc.type = wave;
    osc.frequency.setValueAtTime(f0 * (pitch || 1), start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(f1 * (pitch || 1), 1), start + dur);
    gain.gain.setValueAtTime(vol * (volumeScale || 1), start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  function play(name) {
    const recipe = recipes[name];
    if (recipe) tone(recipe, 0.98 + Math.random() * 0.04, 1, 0);
  }

  function allowed(key, gap) {
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    if (recent[key] && now - recent[key] < (gap || 28)) return false;
    recent[key] = now;
    return true;
  }

  const attackTones = {
    sharp: ["square", 560, 260, 0.055, 0.11],
    blunt: ["triangle", 190, 105, 0.075, 0.14],
    light: ["sine", 620, 920, 0.075, 0.11],
    dark: ["sawtooth", 260, 145, 0.095, 0.10],
  };
  const impactTones = {
    sharp: ["square", 330, 120, 0.065, 0.15],
    blunt: ["triangle", 145, 58, 0.085, 0.19],
    light: ["sine", 740, 390, 0.085, 0.14],
    dark: ["sawtooth", 205, 70, 0.105, 0.14],
  };

  // Attack and impact are separate layers: anticipation says what the move
  // is, while contact supplies weight. Type-specific timbre makes the four
  // ward interactions readable even on a small screen.
  function attack(kind, type, power) {
    if (!allowed(`attack:${kind}:${type}`)) return;
    const strength = Math.min(1.3, 0.8 + (power || 1) * 0.12);
    tone(attackTones[type] || attackTones.blunt, 1, strength, 0);
    if (kind === "dash") tone(["sawtooth", 160, 420, 0.09, 0.07], 1, strength, 0.012);
  }

  function impact(type, power) {
    if (!allowed(`impact:${type}`, 20)) return;
    const strength = Math.min(1.35, 0.72 + (power || 1) * 0.16);
    tone(impactTones[type] || impactTones.blunt, 1, strength, 0);
    tone(["sine", 92, 46, 0.075, 0.11], 1, strength, 0.004);
  }

  return { play, ensure, attack, impact };
})();
