/* Earned contents survive travel separately from temporary combat drops. */
"use strict";
(() => {
  const guardianSources = ["ancientTreant", "mireQueen", "eclipseKnight", "skySovereign", "oldMason", "silkMatriarch", "bellTitan", "lanternKeeper", "lastWorldbearer"];
  function definition(item, source = "chest") {
    if (source === "guardian") {
      // Proven sources; other trophy producers remain on the audit queue.
      const enemy = guardianSources.map(id => G.enemies[id]).find(enemy => enemy && enemy.trophy === item);
      return enemy ? { name: enemy.trophyName, stars: 1 } : null;
    }
    for (const map of Object.values(G.maps || {}))
      for (const cell of Object.values(map.legend || {}))
        if (cell.chest && cell.chest.item === item) return cell.chest;
    return null;
  }
  function rewards() {
    if (!Array.isArray(G.state.groundRewards)) G.state.groundRewards = [];
    return G.state.groundRewards;
  }
  G.normalizeGroundRewards = saved => {
    const seen = new Set(), owned = (G.state && G.state.items) || [];
    return (Array.isArray(saved) ? saved : []).flatMap(raw => {
      if (!raw || !["chest", "guardian"].includes(raw.source) || typeof raw.item !== "string" || !definition(raw.item, raw.source) ||
          owned.includes(raw.item) || seen.has(raw.item) || !G.maps[raw.mapId] ||
          !Number.isFinite(raw.x) || !Number.isFinite(raw.y)) return [];
      seen.add(raw.item);
      return [{ source: raw.source, item: raw.item, mapId: raw.mapId, x: raw.x, y: raw.y }];
    });
  };
  G.groundRewardsHere = () => rewards().filter(reward => reward.mapId === G.state.mapId && !G.state.items.includes(reward.item));
  G.groundRewardFor = item => rewards().find(reward => reward.item === item) || null;
  G.nearGroundReward = () => G.groundRewardsHere().filter(reward =>
    G.util.dist(G.state.player.x, G.state.player.y, reward.x, reward.y) < 64)
    .sort((a, b) => G.util.dist(G.state.player.x, G.state.player.y, a.x, a.y) -
      G.util.dist(G.state.player.x, G.state.player.y, b.x, b.y))[0] || null;

  function revealPoint(x, y) {
    // Reveal beside the open box, on an accessible stretch of the same floor.
    for (const [dx, dy] of [[0, 24], [24, 0], [-24, 0], [0, -24]]) {
      if ([8, 16, 24].every(step => G.world.isSafeSpawn(x + dx * step / 24, y + dy * step / 24)))
        return { x: x + dx, y: y + dy };
    }
    return G.world.safeArrival(x, y);
  }
  G.revealChestReward = chest => {
    const item = chest.chest.item;
    if (!item || G.state.items.includes(item)) return null;
    let reward = G.groundRewardFor(item);
    if (!reward) { reward = { source: "chest", item }; rewards().push(reward); }
    Object.assign(reward, { mapId: G.state.mapId }, revealPoint(chest.x * G.TILE + 8, chest.y * G.TILE + 8));
    // A full visible reveal beat, even if a cramped room places it underfoot.
    reward.revealUntil = (G.state.time || 0) + .45;
    const info = G.groundRewardInfo(reward);
    G.ui.toast(`${info.name} revealed · ${info.purpose} · Walk over it to collect`, 4);
    return reward;
  };
  G.revealGuardianReward = enemy => {
    if (!guardianSources.includes(enemy.def.id) || G.state.items.includes(enemy.def.trophy)) return null;
    const existing = G.groundRewardFor(enemy.def.trophy);
    if (existing) return existing;
    const reward = Object.assign({ source: "guardian", item: enemy.def.trophy, mapId: G.state.mapId,
      revealUntil: (G.state.time || 0) + .45 }, revealPoint(enemy.x, enemy.y));
    rewards().push(reward); G.saveGame(); return reward;
  };
  G.restoreGroundRewards = () => {
    G.state.groundRewards = G.normalizeGroundRewards(rewards());
    for (const reward of G.groundRewardsHere()) {
      const chest = reward.source === "chest" && G.state.chests.find(ch => ch.chest.item === reward.item);
      if (chest) {
        chest.opened = true;
        if (!G.state.opened.includes(chest.key)) G.state.opened.push(chest.key);
        // Follow a redesigned cache rather than leaving treasure in old walls.
        Object.assign(reward, revealPoint(chest.x * G.TILE + 8, chest.y * G.TILE + 8));
      } else Object.assign(reward, G.world.safeArrival(reward.x, reward.y));
      reward.revealUntil = (G.state.time || 0) + .45;
    }
  };
  G.groundRewardInfo = reward => {
    const authored = G.treasureInfo && G.treasureInfo[reward.item];
    return authored || { name: definition(reward.item, reward.source)?.name || reward.item, purpose: "A treasure for your journey" };
  };
  G.updateGroundRewards = () => {
    const s = G.state, p = s.player;
    if (s.knockout || s.zoneTransition || (G.ui && (G.ui.dialogueOpen || G.ui.menuOpen))) return;
    // Remove unique contents awarded by another source while this box was open.
    s.groundRewards = rewards().filter(reward => !s.items.includes(reward.item));
    for (const reward of G.groundRewardsHere()) {
      if ((s.time || 0) < (reward.revealUntil || 0) || G.util.dist(p.x, p.y, reward.x, reward.y) >= 8) continue;
      const prize = definition(reward.item, reward.source);
      s.groundRewards = rewards().filter(other => other.item !== reward.item);
      s.items.push(reward.item);
      if (prize.heal) p.damageTaken = 0;
      s.stars += prize.stars || 0;
      const info = G.groundRewardInfo(reward);
      G.sfx.play(reward.source === "guardian" ? "quest" : "pickup");
      G.ui.toast(`${info.name} · ${info.purpose}${prize.heal ? " · Hearts restored" : ""}`, 4);
      G.events.emit("pickup", { item: reward.item });
      G.checkUnlocks();
      if (G.leaveReadyFormEchoAt) G.leaveReadyFormEchoAt(reward.x, reward.y, reward.source === "guardian" ? "victory" : "treasure");
      if (reward.source === "guardian") {
        const pathUpdate = G.formPathItemUpdate && G.formPathItemUpdate(reward.item);
        if (pathUpdate && G.ui.dialogue) G.ui.dialogue("✦ FORM PATH UPDATED", pathUpdate.text, { accent: "#d9a7ff" });
        if (G.checkGuardianCollectionReward) G.checkGuardianCollectionReward(false);
      }
      G.saveGame();
      // Listeners can change maps or open a modal. Do not claim a second gift there.
      if (s.mapId !== reward.mapId || G.ui.dialogueOpen) break;
    }
  };
})();
