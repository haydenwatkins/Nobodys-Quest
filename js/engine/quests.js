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
     "multiHit"  { ability, hits }        (one swing, many bonks)
     "sign"      { message }
     "pickup"    { item }

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

      if (prog >= q.count) {
        G.questsDone.push(q.id);
        G.state.stars += 1;
        G.sfx.play("quest");
        G.ui.banner(`⭐ QUEST DONE! ${f.icon} ${f.name} is now level ${G.formLevel(fid)}!`, q.text);
        G.events.emit("questDone", { quest: q.id, form: fid });
        G.checkUnlocks();
        G.saveGame();
      } else {
        // little progress nudge (not too spammy — every hit at low
        // counts, every ~25% for big counts)
        if (q.count <= 5 || prog % Math.ceil(q.count / 4) === 0) {
          G.ui.toast(`${f.icon} ${q.text} — ${prog}/${q.count}`);
        }
      }
    }
  }
});
