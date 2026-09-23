/* Four teachers left more than trophies on the shore. */
"use strict";
(() => {
  const map = "shattercoast", reward = "shattercoast-tideglass-chronicle";
  const x = 26 * G.TILE + 8, y = 10 * G.TILE + 8;
  const keepsakes = [
    { item: "tide-shell", name: "Tide Shell", color: "#a7f070" },
    { item: "paper-crane", name: "Paper Crane", color: "#f4f4f4" },
    { item: "orrery-key", name: "Orrery Key", color: "#73eff7" },
    { item: "elder-acorn", name: "Elder Acorn", color: "#d9a7ff" },
  ];
  const has = item => G.state.items.includes(item);
  G.shattercoastChronicle = () => ({
    gathered: keepsakes.filter(entry => has(entry.item)).length,
    complete: has(reward),
    missing: keepsakes.filter(entry => !has(entry.item)).map(entry => entry.name),
  });
  function candidate() {
    const s = G.state;
    if (s.mapId !== map || s.expeditionRun || s.knockout || s.bossCutscene || G.ui.dialogueOpen ||
        Math.hypot(s.player.x - x, s.player.y - y) > 28) return null;
    if (s.enemies.some(enemy => !enemy.dead && !enemy.def.practice &&
        Math.hypot(enemy.x - s.player.x, enemy.y - s.player.y) < 75)) return null;
    return { kind: "tideglass-chronicle", label: has(reward) ? "Read the Tideglass Chronicle" : "Read the tideglass cairn", x, y };
  }
  const oldCandidate = G.openingInteractionCandidate, oldInteract = G.tryOpeningInteraction;
  G.openingInteractionCandidate = () => candidate() || oldCandidate();
  G.tryOpeningInteraction = () => {
    if (!candidate()) return oldInteract();
    const survey = G.shattercoastChronicle();
    if (survey.complete) {
      G.ui.dialogue("THE TIDEGLASS CHRONICLE", "A shell holds steady, a crane turns, an orrery finds its course, and an acorn takes root. Four answers keep the same shore alive.", { accent: "#73eff7" });
    } else if (survey.gathered < keepsakes.length) {
      G.ui.dialogue("THE TIDEGLASS CAIRN", `Four empty hollows face the guardians' roads. ${survey.gathered}/4 keepsakes answer. Still waiting: ${survey.missing.join(", ")}.`, { accent: "#73eff7" });
    } else {
      G.state.items.push(reward);
      G.state.stars += 1;
      G.ensureTown().spirit += 8;
      G.sfx.play("unlock");
      G.spawnFx({ kind: "ring", x, y: y - 12, color: "#73eff7", radius: 30, dur: .7 });
      G.ui.dialogue("THE TIDEGLASS CHRONICLE", "The four keepsakes catch one wave of light. Defense, precision, curiosity, and care can share a road without becoming the same answer. The coast remembers who taught you.", { accent: "#73eff7" });
      G.ui.banner("FOUR ANSWERS, ONE SHORE", "1 star · 8 town spirit");
      G.checkUnlocks();
      G.saveGame();
    }
    G.input.clearTaps();
    return true;
  };
  const oldDraw = G.openingDrawables;
  G.openingDrawables = c => {
    const list = oldDraw(c);
    if (G.state.mapId !== map) return list;
    const lit = has(reward);
    list.push({ y: y + 4, fn: () => {
      c.save();
      c.fillStyle = "#273c49"; c.fillRect(x - 11, y - 5, 23, 10);
      c.fillStyle = "#8eb4ba"; c.fillRect(x - 9, y - 8, 19, 5);
      c.fillStyle = "#416d82"; c.fillRect(x - 6, y - 20, 13, 12);
      c.fillStyle = lit ? "#b9f4f2" : "#639ca9"; c.fillRect(x - 4, y - 18, 9, 9);
      if (lit) { c.fillStyle = "#fff3c2"; c.fillRect(x - 1, y - 25, 3, 6); }
      keepsakes.forEach((entry, index) => {
        c.fillStyle = has(entry.item) ? entry.color : "#253b48";
        c.fillRect(x - 8 + index * 5, y - 4, 3, 3);
      });
      c.restore();
    } });
    return list;
  };
})();
