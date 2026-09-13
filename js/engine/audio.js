/* ============================================================
   AUDIO — tiny retro effects plus an organic regional score.
   Effects use quick oscillator recipes. Music uses prebuilt PCM samples that
   model plucked strings, breath, wooden mallets, and hand percussion.
   ============================================================ */

"use strict";

G.sfx = (() => {
  let ctx = null;
  let musicTimer = null;
  let musicStep = 0;
  let nextMusicTime = 0;
  let currentTheme = "";
  let musicGain = null;
  let musicSamples = null;
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
      musicGain.gain.value = musicEnabled ? 0.34 : 0.0001;
      musicGain.connect(ctx.destination);
      musicSamples = buildMusicSamples();
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

  // Each cue is an original two-bar composition. The third value chooses an
  // organic lead voice; melody, harmony, bass, and percussion are all rendered
  // from short PCM instrument samples rather than steady oscillator tones.
  const MUSIC = {
    overworld:  [102, 55, "lute",     [0,2,4,7,4,2,9,7, 0,4,5,9,7,5,2,4], [0,0,5,0]],
    forest:     [86,  52, "flute",    [0,3,7,10,7,3,null,5, 0,3,8,7,5,3,2,null], [0,5,3,7]],
    marsh:      [74,  46, "lute",     [0,null,3,1,0,6,3,null, 0,1,3,8,6,3,1,null], [0,3,6,1]],
    ember:      [118, 55, "dulcimer", [0,7,5,3,7,10,8,7, 0,3,5,7,12,10,8,5], [0,8,5,7]],
    coast:      [94,  58, "flute",    [0,4,7,11,9,7,4,2, 0,2,4,9,7,4,2,null], [0,7,9,4]],
    ruins:      [78,  49, "harp",     [0,null,7,6,3,null,10,7, 0,3,6,10,8,6,3,null], [0,6,3,8]],
    town:       [96,  65, "lute",     [0,4,7,9,7,4,2,4, 5,9,7,4,2,0,2,null], [0,5,7,4]],
    dungeon:    [82,  44, "dulcimer", [0,null,1,6,null,3,1,null, 0,1,6,8,6,3,1,null], [0,1,6,3]],
    sunstep:    [108, 58, "lute",     [0,4,7,12,9,7,4,2, 5,9,12,14,12,9,7,4], [0,5,9,7]],
    windscar:   [112, 49, "dulcimer", [0,7,10,7,5,3,5,7, 0,3,7,12,10,7,5,3], [0,10,5,7]],
    gardens:    [92,  62, "flute",    [0,2,7,9,11,9,7,4, 2,4,9,11,9,7,4,2], [0,7,2,9]],
    rootdeep:   [72,  41, "harp",     [0,null,6,3,1,null,8,6, 0,1,3,6,10,8,6,null], [0,6,1,8]],
    glasswater: [100, 60, "harp",     [0,5,9,12,16,12,9,5, 2,7,11,14,11,7,5,2], [0,9,2,7]],
    frostbell:  [84,  69, "wood",     [0,3,7,12,10,7,3,null, 0,5,8,12,8,5,3,null], [0,8,5,10]],
    stormspine: [122, 46, "dulcimer", [0,7,3,10,7,12,10,7, 0,3,7,15,12,10,7,3], [0,3,10,7]],
    titan:      [68,  43, "lute",     [0,null,1,7,6,null,3,1, 0,6,10,7,6,3,1,null], [0,1,6,10]],
    boss:       [132, 41, "dulcimer", [0,1,7,6,10,7,13,12, 0,3,7,10,15,13,12,7], [0,6,10,1]],
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

  function pcmSample(seconds, render) {
    const rate = Math.max(8000, ctx.sampleRate || 44100);
    const buffer = ctx.createBuffer(1, Math.ceil(seconds * rate), rate);
    const data = buffer.getChannelData(0);
    render(data, rate);
    let peak = 0;
    for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
    const scale = peak > 0.001 ? 0.86 / peak : 1;
    for (let i = 0; i < data.length; i++) data[i] *= scale;
    return buffer;
  }

  function seededNoise(seed) {
    let value = seed >>> 0;
    return () => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 2147483648 - 1;
    };
  }

  // Karplus–Strong feedback produces a struck string's evolving body rather
  // than a waveform that stays electronically perfect for the whole note.
  function pluckedString(root, seconds, damping, brightness, seed) {
    return pcmSample(seconds, (data, rate) => {
      const period = Math.max(3, Math.round(rate / root));
      const ring = new Float32Array(period);
      const noise = seededNoise(seed);
      for (let i = 0; i < period; i++) ring[i] = noise() * (0.72 + 0.28 * Math.sin(Math.PI * i / period));
      let index = 0;
      const own = 0.38 + brightness * 0.28;
      for (let i = 0; i < data.length; i++) {
        const value = ring[index];
        const next = ring[(index + 1) % period];
        ring[index] = (value * own + next * (1 - own)) * damping;
        data[i] = value;
        index = (index + 1) % period;
      }
    });
  }

  function buildMusicSamples() {
    const twoPi = Math.PI * 2;
    const flute = pcmSample(2.8, (data, rate) => {
      const noise = seededNoise(7127);
      let breath = 0;
      for (let i = 0; i < data.length; i++) {
        const t = i / rate;
        const attack = Math.min(1, t / 0.11);
        const release = t > 2.25 ? Math.max(0, (2.8 - t) / 0.55) : 1;
        const vibrato = Math.sin(twoPi * 5.1 * t) * 0.012;
        const phase = twoPi * 220 * t + vibrato;
        breath = breath * 0.92 + noise() * 0.08;
        data[i] = attack * release * (Math.sin(phase) * 0.68 + Math.sin(phase * 2) * 0.17 +
          Math.sin(phase * 3) * 0.07 + breath * 0.055);
      }
    });
    const dulcimer = pcmSample(1.9, (data, rate) => {
      const noise = seededNoise(991);
      for (let i = 0; i < data.length; i++) {
        const t = i / rate;
        const env = Math.exp(-2.8 * t);
        const phase = twoPi * 220 * t;
        const strike = noise() * Math.exp(-38 * t) * 0.28;
        data[i] = env * (Math.sin(phase) * 0.55 + Math.sin(phase * 2.01) * 0.31 +
          Math.sin(phase * 3.98) * 0.15) + strike;
      }
    });
    const wood = pcmSample(1.15, (data, rate) => {
      const noise = seededNoise(4401);
      for (let i = 0; i < data.length; i++) {
        const t = i / rate;
        const phase = twoPi * 220 * t;
        data[i] = Math.exp(-5.2 * t) * (Math.sin(phase) * 0.64 + Math.sin(phase * 2.72) * 0.28 +
          Math.sin(phase * 4.18) * 0.12) + noise() * Math.exp(-55 * t) * 0.2;
      }
    });
    const drum = pcmSample(0.62, (data, rate) => {
      const noise = seededNoise(303);
      let skin = 0;
      for (let i = 0; i < data.length; i++) {
        const t = i / rate;
        const fallingPhase = twoPi * (92 * t - 31 * t * t);
        skin = skin * 0.76 + noise() * 0.24;
        data[i] = Math.sin(fallingPhase) * Math.exp(-8.2 * t) + skin * Math.exp(-18 * t) * 0.32;
      }
    });
    const shaker = pcmSample(0.2, (data, rate) => {
      const noise = seededNoise(5150);
      let previous = 0;
      for (let i = 0; i < data.length; i++) {
        const t = i / rate;
        const current = noise();
        data[i] = (current - previous) * Math.exp(-23 * t);
        previous = current;
      }
    });
    return {
      lute: { buffer: pluckedString(220, 2.4, 0.9962, 0.38, 1801), root: 220 },
      harp: { buffer: pluckedString(220, 3.2, 0.9981, 0.78, 2657), root: 220 },
      bass: { buffer: pluckedString(110, 3.1, 0.9974, 0.2, 3907), root: 110 },
      flute: { buffer: flute, root: 220 },
      dulcimer: { buffer: dulcimer, root: 220 },
      wood: { buffer: wood, root: 220 },
      drum: { buffer: drum, root: 1 },
      shaker: { buffer: shaker, root: 1 },
    };
  }

  function musicVoice(instrument, freq, start, duration, volume) {
    const sample = musicSamples && musicSamples[instrument];
    if (!musicEnabled || !musicGain || !sample) return;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const rate = Math.max(0.18, freq / sample.root);
    source.buffer = sample.buffer;
    source.playbackRate.setValueAtTime(rate, start);
    const audible = Math.max(0.04, Math.min(duration, sample.buffer.duration / rate));
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.025, audible / 3));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + audible);
    source.connect(gain).connect(musicGain);
    source.start(start); source.stop(start + audible + 0.025);
  }

  function scheduleMusicStep(theme, step, at) {
    const [bpm, root, lead, melody, bass] = theme;
    const beat = 30 / bpm;
    const note = melody[step % melody.length];
    if (note !== null) musicVoice(lead, frequency(root * 4, note), at, beat * 0.92, 0.15);
    if (step % 2 === 0)
      musicVoice("bass", frequency(root, bass[Math.floor(step / 4) % bass.length]), at, beat * 1.8, 0.17);
    if (step % 4 === 0) {
      const chord = bass[Math.floor(step / 4) % bass.length];
      musicVoice("harp", frequency(root * 2, chord + 7), at, beat * 3.5, 0.06);
      musicVoice("harp", frequency(root * 2, chord + 12), at + 0.035, beat * 3.3, 0.045);
      musicVoice("drum", 1, at, beat * 0.72, 0.15);
    }
    if (step % 4 === 2) musicVoice("wood", 220 * (1.1 + (step % 8) * 0.03), at, beat * 0.55, 0.075);
    if (step % 2 === 1) musicVoice("shaker", 1, at, beat * 0.34, 0.045);
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
      musicGain.gain.setTargetAtTime(musicEnabled ? 0.34 : 0.0001, c.currentTime, 0.08);
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
