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
  let nextMusicTime = 0;
  let currentTheme = "";
  let musicGain = null;
  let bossMusicUntil = 0;
  const recent = {};
  const AUDIO_KEY = "nobodys-quest-audio-v2";
  let musicEnabled = true;
  let soundEnabled = true;

  try {
    const pref = JSON.parse(localStorage.getItem(AUDIO_KEY) || "null");
    if (pref) {
      musicEnabled = pref.music !== false;
      soundEnabled = pref.sound !== false;
    }
  } catch (error) {}

  function saveAudioPreference() {
    try { localStorage.setItem(AUDIO_KEY, JSON.stringify({ music: musicEnabled, sound: soundEnabled })); }
    catch (error) {}
  }

  // iPads refuse to play sound until the player touches the screen,
  // so we create the audio engine on the first input.
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      musicGain = ctx.createGain();
      musicGain.gain.value = musicEnabled ? 0.42 : 0.0001;
      musicGain.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    startMusic();
    return ctx;
  }

  function startMusic() {
    if (!ctx || musicTimer) return;
    nextMusicTime = ctx.currentTime + 0.05;
    musicTimer = setInterval(scheduleMusic, 80);
  }

  // Each cue is an original two-bar composition. Four inexpensive synth
  // voices create melody, harmony, bass, and percussion without downloads or
  // licensing, and the map decides which musical identity is active.
  const MUSIC = {
    overworld:  [102, 55, "triangle", [0,2,4,7,4,2,9,7, 0,4,5,9,7,5,2,4], [0,0,5,0]],
    forest:     [86,  52, "sine",     [0,3,7,10,7,3,null,5, 0,3,8,7,5,3,2,null], [0,5,3,7]],
    marsh:      [74,  46, "triangle", [0,null,3,1,0,6,3,null, 0,1,3,8,6,3,1,null], [0,3,6,1]],
    ember:      [118, 55, "square",   [0,7,5,3,7,10,8,7, 0,3,5,7,12,10,8,5], [0,8,5,7]],
    coast:      [94,  58, "sine",     [0,4,7,11,9,7,4,2, 0,2,4,9,7,4,2,null], [0,7,9,4]],
    ruins:      [78,  49, "triangle", [0,null,7,6,3,null,10,7, 0,3,6,10,8,6,3,null], [0,6,3,8]],
    town:       [96,  65, "triangle", [0,4,7,9,7,4,2,4, 5,9,7,4,2,0,2,null], [0,5,7,4]],
    dungeon:    [82,  44, "square",   [0,null,1,6,null,3,1,null, 0,1,6,8,6,3,1,null], [0,1,6,3]],
    sunstep:    [108, 58, "triangle", [0,4,7,12,9,7,4,2, 5,9,12,14,12,9,7,4], [0,5,9,7]],
    windscar:   [112, 49, "square",   [0,7,10,7,5,3,5,7, 0,3,7,12,10,7,5,3], [0,10,5,7]],
    gardens:    [92,  62, "sine",     [0,2,7,9,11,9,7,4, 2,4,9,11,9,7,4,2], [0,7,2,9]],
    rootdeep:   [72,  41, "triangle", [0,null,6,3,1,null,8,6, 0,1,3,6,10,8,6,null], [0,6,1,8]],
    glasswater: [100, 60, "sine",     [0,5,9,12,16,12,9,5, 2,7,11,14,11,7,5,2], [0,9,2,7]],
    frostbell:  [84,  69, "sine",     [0,3,7,12,10,7,3,null, 0,5,8,12,8,5,3,null], [0,8,5,10]],
    stormspine: [122, 46, "sawtooth", [0,7,3,10,7,12,10,7, 0,3,7,15,12,10,7,3], [0,3,10,7]],
    titan:      [68,  43, "triangle", [0,null,1,7,6,null,3,1, 0,6,10,7,6,3,1,null], [0,1,6,10]],
    boss:       [132, 41, "sawtooth", [0,1,7,6,10,7,13,12, 0,3,7,10,15,13,12,7], [0,6,10,1]],
  };

  const BIOME_CUE = {
    sunstep: "sunstep", windscar: "windscar", gardens: "gardens", rootdeep: "rootdeep",
    glasswater: "glasswater", frostbell: "frostbell", stormspine: "stormspine", titan: "titan",
  };

  function desiredTheme() {
    if (G.state && (G.state.enemies || []).some((enemy) =>
      enemy.def.miniboss && !enemy.dead && (enemy.bossEngaged || Date.now() < bossMusicUntil))) return "boss";
    const state = G.state || {};
    const map = state.mapId || "overworld";
    if (map === "town") return "town";
    if (state.mapDef && state.mapDef.visualTheme) return "dungeon";
    if (state.mapDef && BIOME_CUE[state.mapDef.biome]) return BIOME_CUE[state.mapDef.biome];
    if (/mistwood/i.test(map)) return "forest";
    if (/marsh/i.test(map)) return "marsh";
    if (/ember/i.test(map)) return "ember";
    if (/coast/i.test(map)) return "coast";
    if (/starfall/i.test(map)) return "ruins";
    if (/dungeon|trial|vault|hollow/i.test(map)) return "dungeon";
    return "overworld";
  }

  function frequency(root, semitones) { return root * Math.pow(2, semitones / 12); }

  function musicVoice(freq, start, duration, volume, wave) {
    if (!musicEnabled || !musicGain) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(Math.max(24, freq), start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(musicGain);
    osc.start(start); osc.stop(start + duration + 0.03);
  }

  function scheduleMusicStep(theme, step, at) {
    const [bpm, root, wave, melody, bass] = theme;
    const beat = 30 / bpm;
    const note = melody[step % melody.length];
    if (note !== null) musicVoice(frequency(root * 4, note), at, beat * 0.78, 0.075, wave);
    if (step % 2 === 0) musicVoice(frequency(root, bass[Math.floor(step / 4) % bass.length]), at, beat * 1.7, 0.105, "triangle");
    if (step % 4 === 0) {
      const chord = bass[Math.floor(step / 4) % bass.length];
      musicVoice(frequency(root * 2, chord + 7), at, beat * 3.4, 0.032, "sine");
      musicVoice(frequency(root * 2, chord + 12), at, beat * 3.4, 0.024, "sine");
      musicVoice(78, at, beat * 0.34, 0.09, "sine");
    }
    if (step % 2 === 1) musicVoice(1500 + (step % 4) * 280, at, beat * 0.12, 0.018, "square");
  }

  function scheduleMusic() {
    if (!ctx || ctx.state !== "running" || document.hidden || !musicEnabled) return;
    const wanted = desiredTheme();
    if (wanted !== currentTheme) {
      currentTheme = wanted;
      musicStep = 0;
      nextMusicTime = Math.max(nextMusicTime, ctx.currentTime + 0.08);
    }
    const theme = MUSIC[currentTheme] || MUSIC.overworld;
    const beat = 30 / theme[0];
    if (nextMusicTime < ctx.currentTime - beat) nextMusicTime = ctx.currentTime + 0.03;
    while (nextMusicTime < ctx.currentTime + 0.18) {
      scheduleMusicStep(theme, musicStep++, nextMusicTime);
      nextMusicTime += beat;
    }
  }

  function setMusicEnabled(enabled) {
    musicEnabled = !!enabled;
    saveAudioPreference();
    const c = ensure();
    if (c && musicGain) {
      musicGain.gain.cancelScheduledValues(c.currentTime);
      musicGain.gain.setTargetAtTime(musicEnabled ? 0.42 : 0.0001, c.currentTime, 0.08);
      nextMusicTime = c.currentTime + 0.06;
    }
  }

  function setSoundEnabled(enabled) {
    soundEnabled = !!enabled;
    saveAudioPreference();
    if (soundEnabled) play("pickup");
  }

  // recipe: [wave, startPitch, endPitch, seconds, volume]
  const recipes = {
    hit:       ["square",   220, 110, 0.08, 0.25],
    menu:      ["square",   440, 520, 0.04, 0.08],
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
    bossIntro: ["sawtooth",  90, 260, 0.42, 0.28],
    bossPhase: ["square",   180, 480, 0.24, 0.22],
    stagger:   ["square",   420, 85,  0.18, 0.26],
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
    if (name === "bossIntro") bossMusicUntil = Date.now() + 90000;
    if (!soundEnabled) { ensure(); return; }
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
    if (!soundEnabled) return;
    if (!allowed(`attack:${kind}:${type}`)) return;
    const strength = Math.min(1.3, 0.8 + (power || 1) * 0.12);
    tone(attackTones[type] || attackTones.blunt, 1, strength, 0);
    if (kind === "dash") tone(["sawtooth", 160, 420, 0.09, 0.07], 1, strength, 0.012);
  }

  function impact(type, power) {
    if (!soundEnabled) return;
    if (!allowed(`impact:${type}`, 20)) return;
    const strength = Math.min(1.35, 0.72 + (power || 1) * 0.16);
    tone(impactTones[type] || impactTones.blunt, 1, strength, 0);
    tone(["sine", 92, 46, 0.075, 0.11], 1, strength, 0.004);
  }

  return {
    play, ensure, attack, impact, setMusicEnabled, setSoundEnabled,
    get musicEnabled() { return musicEnabled; },
    get soundEnabled() { return soundEnabled; },
    get musicTheme() { return currentTheme || desiredTheme(); },
  };
})();
