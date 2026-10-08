/* New shapes need lived experience before another discovery takes the stage.
   Readiness remains true; owned forms, borrowed arts and old saves stay earned.
   Encounters are credited at their spawn sites, not wherever a kited foe dies. */
"use strict";

(() => {
  G.FORM_ROLES = {
    nobody: { role: "Mix an answer for the road", mapId: "overworld" },
    rat: { role: "Reach the places bigger friends cannot", mapId: "orchardRoad", opening: true },
    knight: { role: "Stand your ground and answer a charge", mapId: "orchardRoad", opening: true },
    wizard: { role: "Open a Dark ward from a safe distance", mapId: "lanternReach", opening: true },
    ranger: { role: "Reach across the creek with your bow", mapId: "bramblebank" },
    frog: { role: "Pull the ferry pontoons into place", mapId: "reedbedFerry" },
    alchemist: { role: "Clear a crowded lamp stand with one flask", mapId: "copperwickYard" },
    stormcaller: { role: "Carry lightning through the copper relays", mapId: "rainbellSteps" },
    dragon: { role: "Sweep the fallen branches off the cart road", mapId: "hearthsideTurn" },
    riftblade: { role: "Rush through a crowded approach", mapId: "overworld" },
    mole: { role: "Scatter a group with a ground tremor", mapId: "overworld" },
    vampire: { role: "Recover while keeping close to foes", mapId: "sunkenMarsh" },
    jester: { role: "Bounce a card through a pair of foes", mapId: "overworld" },
    turtle: { role: "Hold a busy road behind your shell", mapId: "shattercoast" },
    samurai: { role: "Cut past a foe without stopping", mapId: "overworld" },
    astronomer: { role: "Gather scattered foes into an orbit", mapId: "starfallRuins" },
    druid: { role: "Let one afflicted foe seed the next", mapId: "mistwood" },
    griffin: { role: "Carry a tailwind through the postroad", mapId: "galecrestPostroad", feature: "slipstream" },
    golem: { role: "Make cover on the exposed brook road", mapId: "cobblekinBrook", feature: "masonry" },
    weaver: { role: "Bring the tangled road's foes together", mapId: "silkstepGrove", feature: "lifeline" },
    bellkeeper: { role: "Make space by changing your song", mapId: "chimeletWalk", feature: "resonance" },
    lanternWisp: { role: "Make a safe place amid flying sparks", mapId: "wicklingCauseway", feature: "safeLight" },
    colossus: { role: "Push through the heavy procession", mapId: "cragbackMeadow", feature: "worldweight" },
    god: { role: "Bring your favorite answers home", mapId: "overworld" },
  };

  G.makeFormOutings = () => ({ active: null, features: [] });
  G.normalizeFormOutings = saved => {
    const out = G.makeFormOutings(), raw = saved?.active;
    out.features = [...new Set((Array.isArray(saved?.features) ? saved.features : [])
      .filter(id => G.FORM_ROLES[id]?.feature && G.formUnlocked(id)))];
    if (raw && G.FORM_ROLES[raw.formId] && G.formUnlocked(raw.formId) && !G.FORM_ROLES[raw.formId].opening && raw.formId !== "god") {
      out.active = { formId: raw.formId, arts: [...new Set((Array.isArray(raw.arts) ? raw.arts : []).filter(id => G.abilities[id]?.nativeForm === raw.formId))], scenes: (Array.isArray(raw.scenes) ? raw.scenes : [])
        .filter(s => G.maps[s.mapId] && Number.isFinite(s.x) && Number.isFinite(s.y)).slice(0, 2) };
    }
    return out;
  };
  const state = () => G.state.formOutings || (G.state.formOutings = G.makeFormOutings());
  G.activeFormOuting = () => G.state && state().active;
  G.formReturnPromise = () => {
    if(!G.state?.opening?.started || G.state.opening.version<2)return null;
    const promise=G.followedSunriseRequest?.();
    return promise?.ready && /^(road-|trail-)/.test(promise.id) ? promise : null;
  };
  G.formDiscoveryAllowed = () => !G.activeFormOuting() && !G.formReturnPromise();
  G.formDiscoveryOrder = () => {
    const guardian = (G.FORM_TRAILS || []).find(t => G.hasWorldMark?.(t.mark) && G.formReady(t.formId));
    return guardian ? [guardian.formId, ...G.formOrder.filter(id => id !== guardian.formId)] : G.formOrder;
  };

  function finishIfReady() {
    const outing = G.activeFormOuting();
    if (!outing || outing.scenes.length < 2 || outing.arts.length < 2 || G.formLevel(outing.formId) < 3) return;
    state().active = null;
    G.state.quietFormVictory = true;
    G.state.quietFormEchoTime = G.state.time;
    // The next victory reveals an echo. Never place a competing discovery on
    // the hit that finished this outing, or announce a whole ready roster.
    G.saveGame();
  }

  G.noteFormOutingHit = (enemy, abilityId) => {
    const outing = G.activeFormOuting(), ability = G.abilities[abilityId];
    if (!outing || G.state.formId !== outing.formId || ability?.nativeForm !== outing.formId || enemy.def.practice) return;
    enemy.outingForm = outing.formId;
    if (!outing.arts.includes(abilityId)) { outing.arts.push(abilityId); G.saveGame(); }
    finishIfReady();
  };
  G.noteFormOutingVictory = enemy => {
    const outing = G.activeFormOuting();
    if (!outing || G.state.formId !== outing.formId || enemy.outingForm !== outing.formId || enemy.def.practice || G.state.expeditionRun) return;
    const scene = { mapId: G.state.mapId, x: enemy.outingSpawnX ?? enemy.x, y: enemy.outingSpawnY ?? enemy.y };
    if (outing.scenes.length < 2 && outing.scenes.every(old => old.mapId !== scene.mapId || Math.hypot(old.x - scene.x, old.y - scene.y) >= 160)) {
      outing.scenes.push(scene);
      G.saveGame();
    }
    finishIfReady();
  };

  G.formOutingGoal = () => {
    const outing = G.activeFormOuting();
    if (!outing) return null;
    const roadGoal=G.roadworkOutingGoal?.(outing);
    if(roadGoal)return roadGoal;
    const firstUse=G.formTrailFirstUseGoal?.(outing);
    if(firstUse)return firstUse;
    const form = G.forms[outing.formId], role = G.FORM_ROLES[outing.formId];
    const trail = G.FORM_TRAILS?.find(t => t.formId === outing.formId);
    // A trophy may have been earned on an earlier visit. Suggest its trail
    // only when its connecting road is actually open.
    const mapId = trail && G.hasWorldMark(trail.mark) ? role.mapId
      : (G.state.enemies || []).some(e => !e.dead && !e.def.miniboss && !e.def.practice) ? G.state.mapId : role.mapId;
    const lesson = G.masteryLessons(Infinity, outing.formId).find(l => l.ability && G.abilities[l.ability]?.nativeForm === outing.formId);
    return { guide: "outing", formId: outing.formId, mapId, destination: G.maps[mapId].name,
      title: `An outing with ${form.name}`, short: role.role,
      objective: G.state.formId !== outing.formId ? `Become ${form.name} and explore its new possibilities.`
        : G.formLevel(outing.formId) < 3 && lesson ? `${G.abilities[lesson.ability].name}: ${lesson.quest.text}. Try it on the road.`
          : outing.arts.length < 2 ? "Try a second art belonging to this shape against the road’s foes."
          : "Explore another clearing and try this shape against a different group.",
      reason: "There is room to enjoy this new shape before the next discovery.",
      progress: { value: Number(G.formLevel(outing.formId) >= 3) + Number(outing.arts.length >= 2) + Number(outing.scenes.length >= 2), total: 3, label: "NEW SHAPE" } };
  };

  G.events.on("formUnlock", ({ form }) => {
    // Existing adventures retain all earned access. Only future discoveries
    // in the introduced campaign start an outing; no roster-wide replay.
    if (!G.FORM_ROLES[form] || !G.state.opening?.started || G.state.opening.version < 2 || G.FORM_ROLES[form]?.opening || form === "god") return;
    state().active = { formId: form, scenes: [], arts: [] };
  });
  G.events.on("questDone", finishIfReady);
  G.events.on("formFeature", ({ feature }) => {
    const id = G.state?.formId;
    if (!id || G.FORM_ROLES[id]?.feature !== feature || state().features.includes(id)) return;
    state().features.push(id);
    if (G.applyFormTrailShortcut?.()) G.ui.toast("A short way home opens!",3);
    G.saveGame();
  });
  G.events.on("projectileBlock", ({ kind }) => G.events.emit("formFeature", { feature: kind }));
})();
