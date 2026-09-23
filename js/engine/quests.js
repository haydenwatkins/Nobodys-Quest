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
  const chosen = G.masteryLessons && G.masteryLessons(1, null, true)[0];
  if (chosen && (!chosen.ability || chosen.slot >= 0)) return chosen;
  return G.relevantMasteryQuests(1)[0] || null;
};

// The finale asks for breadth and a chosen set of deep specializations. The
// same snapshot drives the gate, story guidance, and God's unlock condition.
G.finalExamMastery = function () {
  const godIndex = G.formOrder.indexOf("god");
  const forms = G.formOrder.slice(0, godIndex < 0 ? G.formOrder.length : godIndex)
    .filter((id) => G.forms[id] && !G.forms[id].invalid);
  const levels = forms.map((id) => ({ id, level: G.formLevel(id) }));
  const missingBreadth = levels.filter((entry) => entry.level < 3).map((entry) => entry.id);
  const specialists = levels.filter((entry) => entry.level >= 5).length;
  const specialistGoal = Math.min(6, forms.length);
  return { total: forms.length, broad: forms.length - missingBreadth.length,
    missingBreadth, specialists, specialistGoal,
    ready: !missingBreadth.length && specialists >= specialistGoal };
};

// The lesson book only offers arts already earned. Borrowing advances the
// source form's quest, so a favorite body can carry several other lessons.
G.masteryLessons = function (limit, formId, chosenOnly) {
  if (!G.state) return [];
  const available = new Set(G.availableAbilities());
  const body = G.forms[G.state.formId];
  const loadout = G.getLoadout(body.id);
  const entries = [];
  for (const id of G.unlockedForms()) {
    if (formId && id !== formId) continue;
    for (const quest of G.forms[id].quests || []) {
      if (G.questsDone.includes(quest.id)) continue;
      if (chosenOnly && quest.id !== G.state.lessonQuestId) continue;
      const match = quest.match || {};
      // A damage-type kill lesson accepts any finishing art of that type.
      // Offer one the player already carries first, then another earned art
      // they can borrow into the current build.
      const damageType = quest.event === "kill" && Object.keys(match).length === 1 ? match.damageType : null;
      const ability = match.ability || (damageType ? (loadout.find(id => G.abilities[id]?.type === damageType) ||
        [...available].find(id => G.abilities[id]?.type === damageType)) : null);
      if (ability && (!available.has(ability) || (match.form && match.form !== body.id))) continue;
      // General lessons are offered only when their event has no hidden
      // equipment condition. Status/ward lessons remain in the full journal.
      if (!ability && (Object.keys(match).length || !["sign", "pickup", "kill"].includes(quest.event))) continue;
      const slot = ability ? loadout.indexOf(ability) : -1;
      if (ability && slot < 0 && !body.slots) continue;
      const progress = G.questProgress(quest);
      const form = G.forms[id], level = G.formLevel(id);
      const nextArt = (form.abilities || []).find(a => a.level === level + 1 && G.abilities[a.id]);
      const synergy = ability && G.passives ? G.passives.synergyText(body, G.abilities[ability]) : "";
      const reward = nextArt ? `Unlock ${G.abilities[nextArt.id].name} · +1 star` : `${form.name} level ${level + 1} · +1 star`;
      const score = (quest.id === G.state.lessonQuestId ? 1000 : 0) + (slot >= 0 ? 100 : 0) +
        progress / Math.max(1, quest.count) * 60 + (synergy ? 20 : 0) + (id === body.id ? 10 : 0);
      entries.push({ form, quest, ability, slot, progress, reward, synergy, score });
    }
  }
  entries.sort((a, b) => b.score - a.score);
  return entries.slice(0, limit === undefined ? 3 : limit);
};

G.prepareMasteryLesson = function (questId, slot) {
  const lesson = G.masteryLessons(Infinity).find(entry => entry.quest.id === questId);
  if (!lesson) return false;
  const formId = G.state.formId, lo = G.getLoadout(formId);
  if (lesson.ability && !lo.includes(lesson.ability)) {
    if (!Number.isInteger(slot) || slot < 1 || slot > G.forms[formId].slots) return false;
    // Keep the pre-experiment mix on the first unused card, once.
    const recipes = G.mixRecipes(formId);
    const empty = [0, 1, 2].find(i => !recipes[i]);
    const slots = Array.from({length: G.forms[formId].slots + 1}, (_, i) => i);
    if (empty !== undefined && !recipes.some(r => r && slots.every(i => (r[i] || null) === (lo[i] || null)))) G.saveMixRecipe(formId, empty);
    lo[slot] = lesson.ability;
  }
  G.state.lessonQuestId = questId;
  G.saveGame();
  return true;
};

// One immediate lesson and the concrete move it is leading toward. Uses the
// actual quest/ability registries, so borrowed arts and edited forms stay true.
G.fieldMasteryReward = function () {
  const entry=G.fieldMasteryQuest();if(!entry)return null;
  const level=G.formLevel(entry.form.id),next=level+1;
  const move=(entry.form.abilities||[]).find(a=>a.level===next&&G.abilities[a.id]);
  let reward=move?'Next: '+G.abilities[move.id].name:entry.form.name+' Lv '+next+' + 1 star';
  if(!move&&G.formUnlockSteps){
    const child=G.formOrder.find(id=>!G.formUnlocked(id)&&G.formUnlockSteps(id).some(step=>(step.options||[]).some(o=>o.formId===entry.form.id&&!o.met&&o.target===next)));
    if(child)reward='Toward '+G.forms[child].name+' + 1 star';
  }
  return {...entry,reward,total:Math.max(1,entry.quest.count),progress:Math.min(entry.quest.count,entry.progress)};
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
