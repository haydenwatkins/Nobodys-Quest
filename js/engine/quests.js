/* ============================================================
   QUESTS — how forms level up and how you earn stars.

   Every quest listens for an EVENT and counts matches:

     { text: "Poison 8 baddies",
       event: "status", match: { status: "poison" }, count: 8 }

   Events the engine emits (with the info each carries):
     "kill"      { enemy, ability, damageType, poisoned }
     "hit"       { enemy, ability, damageType, dist }
     "status"    { status, enemy }
     "wardBreak" { damageType, ability, enemy }
     "multiHit"  { ability, hits, combo } (one swing, many bonks; combo is optional)
     "sign"      { message }
     "pickup"    { item }
     "parry"     { form, perfect, fromX, fromY }

   MATCH RULES: every key in `match` must line up with the event.
     match: { ability: "bite" }      -> exactly "bite"
     match: { dist: { gte: 100 } }   -> 100 or more
   No match at all? Then EVERY event of that type counts.

   Finishing a quest = +1 ⭐ and +1 level for that form.
   IMPORTANT: quests count no matter which form you're wearing —
   so you can do Rat quests as the Knight with Bite equipped.
   That's on purpose. Mixing is the whole game!
   ============================================================ */

"use strict";

G.questCounts = {};   // questId -> progress number   (saved)
G.questsDone = [];    // questIds completed           (saved)

G.formLevel = function (formId) {
  const f = G.forms[formId];
  if (!f || !f.quests) return 1;
  let done = 0;
  for (const q of f.quests) if (G.questsDone.includes(q.id)) done++;
  return 1 + done;
};

G.questProgress = function (q) {
  if (G.questsDone.includes(q.id)) return q.count;
  return G.questCounts[q.id] || 0;
};

G.questById = function (questId) {
  for (const fid of G.formOrder) {
    const form = G.forms[fid];
    const quest = form && form.quests && form.quests.find((q) => q.id === questId);
    if (quest) return { form, quest };
  }
  return null;
};

G.isQuestPinned = function (questId) {
  return !!(G.state && G.state.pinnedQuestIds.includes(questId));
};

G.toggleQuestPin = function (questId) {
  const pins = G.state.pinnedQuestIds;
  const index = pins.indexOf(questId);
  if (index >= 0) {
    pins.splice(index, 1);
    G.ui.toast("Quest no longer tracked");
  } else {
    if (!G.questById(questId)) return;
    if (pins.length >= 3) pins.shift();
    pins.push(questId);
    G.sfx.play("pickup");
    G.ui.toast("Quest pinned to the HUD!");
    G.events.emit("questPin", { quest: questId });
  }
  G.saveGame();
};

G.clearQuestPins = function () {
  if (!G.state || !G.state.pinnedQuestIds.length) return;
  G.state.pinnedQuestIds.length = 0;
  G.ui.toast("No quests are being tracked");
  G.saveGame();
};

G.pinnedQuests = function () {
  if (!G.state) return [];
  // Old or edited form files can make a saved quest id disappear.
  G.state.pinnedQuestIds = G.state.pinnedQuestIds.filter((id) => G.questById(id));
  return G.state.pinnedQuestIds.map((id) => G.questById(id));
};

// Field mastery is automatic. The most useful unfinished lesson is chosen
// from the form being worn and the arts currently equipped, so routine play
// never depends on visiting a menu and manually managing a tracker.
G.relevantMasteryQuests = function (limit) {
  if (!G.state || !G.state.formId) return [];
  const formId = G.state.formId;
  const loadout = G.getLoadout ? G.getLoadout(formId) : [];
  const equipped = new Map(loadout.map((ability, slot) => [ability, slot]));
  const candidates = [];
  for (let formIndex = 0; formIndex < G.formOrder.length; formIndex++) {
    const id = G.formOrder[formIndex];
    if (!G.formUnlocked(id)) continue;
    const form = G.forms[id];
    for (let questIndex = 0; questIndex < (form.quests || []).length; questIndex++) {
      const quest = form.quests[questIndex];
      if (G.questsDone.includes(quest.id)) continue;
      const match = quest.match || {};
      const slot = match.ability && equipped.has(match.ability) ? equipped.get(match.ability) : -1;
      const progress = G.questProgress(quest);
      let score = id === formId ? 60 : 0;
      if (slot >= 0) score += 90 + (slot === 0 ? 2 : 4 - slot);
      if (match.form === formId) score += 70;
      if (progress > 0) score += 25 + Math.min(12, progress / Math.max(1, quest.count) * 12);
      // Keep unlocked but unrelated forms available as a final fallback,
      // while strongly preferring lessons the player's current build can do.
      candidates.push({ form, quest, progress, slot, score, formIndex, questIndex });
    }
  }
  candidates.sort((a, b) => b.score - a.score || a.formIndex - b.formIndex || a.questIndex - b.questIndex);
  return candidates.slice(0, limit === undefined ? 3 : Math.max(0, limit));
};

G.fieldMasteryQuest = function () {
  return G.relevantMasteryQuests(1)[0] || null;
};

function questMatches(match, data) {
  if (!match) return true;
  for (const key in match) {
    const want = match[key];
    if (want && typeof want === "object" && "gte" in want) {
      if (!(data[key] >= want.gte)) return false;
    } else if (data[key] !== want) {
      return false;
    }
  }
  return true;
}

// Listen to EVERYTHING and check every form's quests.
G.events.on("*", (type, data) => {
  if (!G.state) return;
  for (const fid of G.formOrder) {
    const f = G.forms[fid];
    if (f.invalid || !f.quests) continue;
    // you can only progress quests for forms you've unlocked
    if (!G.formUnlocked(fid)) continue;

    for (const q of f.quests) {
      if (q.event !== type) continue;
      if (G.questsDone.includes(q.id)) continue;
      if (!questMatches(q.match, data)) continue;

      // multiHit counts as done in one go if hits >= the match
      G.questCounts[q.id] = (G.questCounts[q.id] || 0) + 1;
      const prog = G.questCounts[q.id];
      G.state.masteryHudPulse = 1.4;

      if (prog >= q.count) {
        G.questsDone.push(q.id);
        const pinIndex = G.state.pinnedQuestIds.indexOf(q.id);
        if (pinIndex >= 0) G.state.pinnedQuestIds.splice(pinIndex, 1);
        G.state.stars += 1;
        G.sfx.play("quest");
        G.ui.banner(`⭐ QUEST DONE! ${f.icon} ${f.name} is now level ${G.formLevel(fid)}!`, q.text);
        G.events.emit("questDone", { quest: q.id, form: fid });
        G.checkUnlocks();
        G.saveGame();
      }
    }
  }
});
