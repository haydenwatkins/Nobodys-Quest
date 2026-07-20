/* ============================================================
   NPC STORY ENGINE - safe placement, changing dialogue, and drawing.

   Talking is intentionally proximity-based: it works with keyboard,
   controller, and touch without adding another mobile HUD button.
   Walk up to someone, then step away and return to hear their next line.
   ============================================================ */

"use strict";

(function () {
  const TALK_NEAR = 25;
  const TALK_RESET = 36;

  G.storyChapter = function () {
    const s = G.state || {};
    const items = new Set(s.items || []);
    const campaign = s.worldwake || {};
    const marks = Array.isArray(campaign.marks) ? campaign.marks.length : 0;
    const discovered = Array.isArray(campaign.discovered) ? campaign.discovered.length : 0;
    const trophies = G.guardianTrophies
      ? G.guardianTrophies().filter((item) => items.has(item)).length
      : Array.from(items).filter((item) => item.indexOf("trophy-") === 0).length;
    const forms = Array.isArray(s.claimedForms) ? s.claimedForms.length : 0;

    if (items.has("god-spark") || marks >= 6) return 5;
    if (marks >= 3) return 4;
    if (discovered > 0) return 3;
    if (trophies >= 2 || (s.stars || 0) >= 10) return 2;
    if (forms >= 2 || (s.stars || 0) >= 3) return 1;
    return 0;
  };

  G.storyChapterName = function (chapter) {
    return [
      "Somebody Else's Problem",
      "Many Useful Shapes",
      "Masters of One Thing",
      "The Waking Roads",
      "Six Old Promises",
      "Nobody, Together",
    ][chapter == null ? G.storyChapter() : chapter];
  };

  function nearestOpen(preferredX, preferredY, isOpen, occupied) {
    for (let radius = 0; radius <= 8; radius++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (radius && Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
          const x = preferredX + dx;
          const y = preferredY + dy;
          if (!isOpen(x, y)) continue;
          if (occupied.some((spot) => Math.abs(spot.x - x) + Math.abs(spot.y - y) < 3)) continue;
          return { x, y };
        }
      }
    }
    return null;
  }

  G.makeMapNpcs = function (mapId, isOpen) {
    const placements = (G.NPC_PLACEMENTS && G.NPC_PLACEMENTS[mapId]) || [];
    const occupied = [];
    const result = [];
    for (const placement of placements) {
      const id = placement[0];
      const def = G.NPCS && G.NPCS[id];
      if (!def) continue;
      const tile = nearestOpen(placement[1], placement[2], isOpen, occupied);
      if (!tile) continue;
      occupied.push(tile);
      result.push({
        id,
        def,
        x: tile.x * G.TILE + G.TILE / 2,
        y: tile.y * G.TILE + G.TILE / 2 + 3,
        anim: (tile.x * 0.37 + tile.y * 0.19) % 2,
        near: false,
        facingLeft: false,
      });
    }
    return result;
  };

  function chapterLines(def, chapter) {
    const stages = Object.keys(def.chapters || {})
      .map(Number)
      .filter((stage) => stage <= chapter)
      .sort((a, b) => a - b);
    return stages.length ? def.chapters[stages[stages.length - 1]] : [];
  }

  G.npcDialogue = function (npcId, chapter, index) {
    const def = G.NPCS && G.NPCS[npcId];
    if (!def) return "";
    const lines = chapterLines(def, chapter == null ? G.storyChapter() : chapter);
    return lines.length ? lines[(index || 0) % lines.length] : "";
  };

  function talk(npc) {
    const s = G.state;
    const chapter = G.storyChapter();
    const key = npc.id + ":" + chapter;
    const count = Number(s.npcTalk[key]) || 0;
    const line = G.npcDialogue(npc.id, chapter, count);
    if (!line) return;
    s.npcTalk[key] = count + 1;
    const title = chapter === 0 && count === 0 ? " - " + G.storyChapterName(chapter) : "";
    G.ui.toast(npc.def.icon + " " + npc.def.name + title + ": " + line, 5.8);
    if (G.sfx && G.sfx.play) G.sfx.play("menu");
    if (G.spawnFx) G.spawnFx({
      kind: "ring", x: npc.x, y: npc.y - 8,
      color: npc.def.sprite.palette.a, radius: 9, dur: 0.28,
    });
    G.events.emit("npcTalk", { id: npc.id, chapter, count: count + 1, mapId: s.mapId });
    if (G.saveGame) G.saveGame();
  }

  G.updateNpcs = function (dt) {
    const s = G.state;
    const p = s && s.player;
    const npcs = (s && s.npcs) || [];
    if (!p || !npcs.length) return;
    const blocked = s.bossCutscene || s.zoneTransition || s.playerKnockout || s.gauntletBetween;
    const danger = (s.enemies || []).some((enemy) =>
      !enemy.dead && Math.hypot(enemy.x - p.x, enemy.y - p.y) < 48);
    let candidate = null;
    let candidateDistance = Infinity;

    for (const npc of npcs) {
      npc.anim += dt * 2.2;
      npc.facingLeft = p.x < npc.x;
      const distance = Math.hypot(npc.x - p.x, npc.y - p.y);
      if (distance > TALK_RESET) npc.near = false;
      if (distance <= TALK_NEAR && !npc.near && distance < candidateDistance) {
        candidate = npc;
        candidateDistance = distance;
      }
    }

    if (candidate && !blocked && !danger) {
      // Mark everyone in the same little conversation circle so a crowd does
      // not fire three speeches on consecutive frames.
      for (const npc of npcs) {
        if (Math.hypot(npc.x - p.x, npc.y - p.y) <= TALK_NEAR) npc.near = true;
      }
      talk(candidate);
    }
  };

  G.drawNpc = function (ctx, npc) {
    const p = G.state.player;
    const bob = Math.sin(npc.anim * Math.PI) * 0.45;
    G.drawShadow(ctx, npc.x, npc.y, 10);
    G.drawSprite(ctx, npc.def.sprite, Math.floor(npc.anim) % 2, npc.x, npc.y + bob, npc.facingLeft);
    if (Math.hypot(npc.x - p.x, npc.y - p.y) > 44) return;

    const y = Math.round(npc.y - 18 + bob);
    ctx.save();
    ctx.fillStyle = "rgba(26,28,44,0.9)";
    ctx.fillRect(Math.round(npc.x - 5), y, 10, 8);
    ctx.fillStyle = npc.def.sprite.palette.a;
    ctx.font = "6px monospace";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.fillText("...", Math.round(npc.x), y);
    ctx.restore();
  };
})();
