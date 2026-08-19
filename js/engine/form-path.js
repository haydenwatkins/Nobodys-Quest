/* ============================================================
   FORM PATH — truthful progression data for the Form Lab.

   The rules below remain the source of truth. Chapters provide a calm,
   authored reading order for small screens; the legacy edge data remains
   useful to tests and other systems that need the actual dependency DAG.
   ============================================================ */

"use strict";

(function () {
  G.FORM_PATH_CHAPTERS = [
    { id: "origin", number: "I", title: "The First Spark", note: "Every path begins as Nobody.", forms: ["nobody"] },
    { id: "first-shapes", number: "II", title: "First Shapes", note: "Two simple lessons open the world.", forms: ["rat", "knight"] },
    { id: "callings", number: "III", title: "Choose a Calling", note: "Magic, precision, or transformation.", forms: ["wizard", "ranger", "frog"] },
    { id: "crossed-lessons", number: "IV", title: "Crossed Lessons", note: "Combine what the early forms taught you.", forms: ["alchemist", "stormcaller", "dragon"] },
    { id: "hidden-crowns", number: "V", title: "Hidden Crowns", note: "Boss trophies reveal secret paths.", forms: ["mole", "vampire", "turtle", "druid"] },
    { id: "masters-beyond", number: "VI", title: "Masters Beyond", note: "Specialists awaken from deeper victories.", forms: ["riftblade", "jester", "samurai", "astronomer"] },
    { id: "waking-road", number: "VII", title: "The Waking Road", note: "One guardian leads to the next.", forms: ["griffin", "golem", "weaver"] },
    { id: "last-bells", number: "VIII", title: "The Last Bells", note: "Carry the guardian chain to its end.", forms: ["bellkeeper", "lanternWisp", "colossus"] },
    { id: "whole-roster", number: "IX", title: "The Whole Roster", note: "Master every shape to approach the final form.", forms: ["god"] },
  ];

  G.FORM_PATH_TIERS = [
    ["nobody"],
    ["rat", "knight"],
    ["wizard", "ranger", "frog"],
    ["alchemist", "stormcaller"],
    ["@earlyMastery"],
    ["dragon", "mole", "vampire", "turtle", "druid"],
    ["riftblade"],
    ["jester", "samurai", "astronomer"],
    ["griffin"],
    ["golem"],
    ["weaver"],
    ["bellkeeper"],
    ["lanternWisp"],
    ["colossus"],
    ["@wholeRoster"],
    ["god"],
  ];

  G.FORM_PATH_GATES = {
    "@earlyMastery": { target: "dragon", label: "ALL EARLIER FORMS", short: "EARLY MASTERY" },
    "@wholeRoster": { target: "god", label: "THE COMPLETE ROSTER", short: "FINAL MASTERY" },
  };

  // "choice" means either parent can satisfy the mastery gate. "all"
  // represents a curated convergence from a larger whole-roster rule.
  G.FORM_PATH_EDGES = [
    { from: "nobody", to: "rat" },
    { from: "rat", to: "wizard" },
    { from: "knight", to: "ranger" },
    { from: "frog", to: "alchemist" },
    { from: "wizard", to: "stormcaller", kind: "choice" },
    { from: "ranger", to: "stormcaller", kind: "choice" },
    { from: "nobody", to: "@earlyMastery", kind: "all", level: 3 },
    { from: "rat", to: "@earlyMastery", kind: "all", level: 3 },
    { from: "knight", to: "@earlyMastery", kind: "all", level: 3 },
    { from: "wizard", to: "@earlyMastery", kind: "all", level: 3 },
    { from: "ranger", to: "@earlyMastery", kind: "all", level: 3 },
    { from: "frog", to: "@earlyMastery", kind: "all", level: 3 },
    { from: "alchemist", to: "@earlyMastery", kind: "all", level: 3 },
    { from: "stormcaller", to: "@earlyMastery", kind: "all", level: 3 },
    { from: "@earlyMastery", to: "dragon", kind: "gate" },
    { from: "frog", to: "mole" },
    { from: "wizard", to: "vampire" },
    { from: "knight", to: "turtle" },
    { from: "frog", to: "druid", kind: "choice" },
    { from: "wizard", to: "druid", kind: "choice" },
    { from: "dragon", to: "riftblade" },
    { from: "alchemist", to: "jester", kind: "choice" },
    { from: "riftblade", to: "jester", kind: "choice" },
    { from: "riftblade", to: "samurai" },
    { from: "stormcaller", to: "astronomer" },
    { from: "ranger", to: "griffin", kind: "choice" },
    { from: "samurai", to: "griffin", kind: "choice" },
    { from: "griffin", to: "golem" },
    { from: "golem", to: "weaver" },
    { from: "weaver", to: "bellkeeper" },
    { from: "bellkeeper", to: "lanternWisp" },
    { from: "lanternWisp", to: "colossus" },
    { from: "jester", to: "@wholeRoster", kind: "all", level: 5 },
    { from: "turtle", to: "@wholeRoster", kind: "all", level: 5 },
    { from: "samurai", to: "@wholeRoster", kind: "all", level: 5 },
    { from: "astronomer", to: "@wholeRoster", kind: "all", level: 5 },
    { from: "druid", to: "@wholeRoster", kind: "all", level: 5 },
    { from: "colossus", to: "@wholeRoster", kind: "all", level: 5 },
    { from: "@wholeRoster", to: "god", kind: "gate" },
  ];

  function rules(form) {
    if (!form || !form.unlock) return [];
    return form.unlock.type === "challenge" ? (form.unlock.requirements || []) : [form.unlock];
  }

  function masteryOption(rule) {
    const form = G.forms[rule.form];
    const current = G.formLevel(rule.form);
    return {
      formId: rule.form,
      name: form ? form.name : rule.form,
      current,
      target: rule.level,
      met: current >= rule.level,
    };
  }

  function stepFor(rule, targetId) {
    if (rule.type === "formLevel" || rule.type === "level") {
      const option = masteryOption(rule);
      return {
        kind: "mastery", icon: "◆", label: `${option.name} mastery`,
        detail: `Level ${Math.min(option.current, option.target)}/${option.target}`,
        met: option.met, formId: option.formId, options: [option],
      };
    }
    if (rule.type === "item") {
      const met = (G.state.items || []).includes(rule.item);
      return {
        kind: "trophy", icon: "♛", label: rule.hint || "Find the key item",
        detail: met ? "Boss reward secured" : "Boss reward missing",
        met, itemId: rule.item,
      };
    }
    if (rule.type === "stars") {
      const current = G.state.stars || 0;
      return {
        kind: "stars", icon: "★", label: "Lessons learned",
        detail: `${Math.min(current, rule.stars)}/${rule.stars} stars`, met: current >= rule.stars,
      };
    }
    if (rule.type === "claimedForms") {
      const current = (G.state.claimedForms || []).length;
      return {
        kind: "roster", icon: "⬡", label: "Awaken different forms",
        detail: `${Math.min(current, rule.count)}/${rule.count} forms`, met: current >= rule.count,
      };
    }
    if (rule.type === "any") {
      const options = (rule.options || []).filter((option) => option.type === "formLevel" || option.type === "level").map(masteryOption);
      return {
        kind: "choice", icon: "◇", label: "Choose one mastery path",
        detail: options.map((option) => `${option.name} Lv ${Math.min(option.current, option.target)}/${option.target}`).join("  OR  "),
        met: options.some((option) => option.met), options,
      };
    }
    if (rule.type === "previousFormsLevel" || rule.type === "allFormsLevel") {
      const targetIndex = G.formOrder.indexOf(targetId);
      const ids = rule.type === "previousFormsLevel"
        ? G.formOrder.slice(0, targetIndex)
        : G.formOrder.filter((id) => id !== targetId && G.forms[id] && !G.forms[id].invalid);
      const done = ids.filter((id) => G.formLevel(id) >= rule.level).length;
      return {
        kind: "all", icon: "✦", label: rule.type === "previousFormsLevel" ? "Master every earlier form" : "Master the whole roster",
        detail: `${done}/${ids.length} forms at level ${rule.level}`,
        met: ids.length > 0 && done === ids.length,
        formIds: ids, target: rule.level,
      };
    }
    return { kind: "unknown", icon: "?", label: "Unknown path", detail: "Requirement unavailable", met: false };
  }

  G.formUnlockSteps = function (formId) {
    const form = G.forms[formId];
    return rules(form).map((rule) => stepFor(rule, formId));
  };

  G.formPathProgress = function (formId) {
    if (G.forms[formId] && G.forms[formId].start) return { done: 1, total: 1, complete: true };
    const steps = G.formUnlockSteps(formId);
    const done = steps.filter((step) => step.met).length;
    return { done, total: steps.length, complete: !!steps.length && done === steps.length };
  };

  G.formPathEdgeMet = function (edge) {
    if (edge.kind === "gate") {
      const gate = G.FORM_PATH_GATES[edge.from];
      const step = gate && G.formUnlockSteps(gate.target).find((entry) => entry.kind === "all");
      return !!(step && step.met);
    }
    if (edge.kind === "all") return G.formLevel(edge.from) >= edge.level;
    for (const step of G.formUnlockSteps(edge.to)) {
      for (const option of step.options || []) if (option.formId === edge.from) return option.met;
    }
    return G.formUnlocked(edge.to);
  };

  G.formPathLayout = function () {
    const top = 24, rowGap = 88, nodeHeight = 62;
    const positions = {};
    for (let row = 0; row < G.FORM_PATH_TIERS.length; row++) {
      const tier = G.FORM_PATH_TIERS[row];
      for (let index = 0; index < tier.length; index++) {
        positions[tier[index]] = {
          x: ((index + 1) / (tier.length + 1)) * 1000,
          y: top + row * rowGap,
          row,
        };
      }
    }
    return { positions, width: 1000, height: top + (G.FORM_PATH_TIERS.length - 1) * rowGap + nodeHeight + 24, nodeHeight };
  };

  G.formPathItemUpdate = function (itemId) {
    for (const id of G.formOrder) {
      if (G.formUnlocked(id)) continue;
      const steps = G.formUnlockSteps(id);
      if (!steps.some((step) => step.itemId === itemId && step.met)) continue;
      const progress = G.formPathProgress(id);
      const next = steps.find((step) => !step.met);
      return {
        formId: id,
        complete: progress.complete,
        text: progress.complete
          ? `${G.forms[id].name}'s path is complete. Its Form Echo can now emerge from this victory.`
          : `${G.forms[id].name} path: ${progress.done}/${progress.total} complete. Still needed: ${next.label} — ${next.detail}.`,
      };
    }
    return null;
  };
})();
