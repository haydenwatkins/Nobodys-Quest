/* ============================================================
   FORMS — the soul of this game.

   THE RULES OF THE FORM WORKSHOP
   (These are what make the game GOOD. The game checks every
    form against them and explains any problems on screen.)

   1. EVERY FORM IS A FANTASY. It needs a name, an icon, a
      tagline, and its own look. Playing it should FEEL
      different from every other form.
   2. ABILITIES ARE SHARED. Every form must bring at least one
      special ability, and every form has open slots where the
      player can equip OTHER forms' abilities. Mixing is the
      whole game — your new form makes every old form cooler.
   3. QUESTS TEACH THE FUN. Every form must ship with at least
      2 quests. Quests are how forms level up, and they should
      push players to try what's cool about the form.
   4. DAMAGE TYPES MATTER. Every ability declares sharp, blunt,
      light, or dark. Warded enemies force players to mix.
   5. FAIR IS FUN. Speed, hearts, damage and mana costs have
      limits — a form that breaks the game isn't fun for long.
   ============================================================ */

"use strict";

/* ---------- registering abilities ---------- */
function registerAbility(def) {
  const err = (msg) => G.workshopErrors.push({ where: `ability "${def.id || def.name || "???"}"`, msg });

  if (!def.id) { err("It needs an id — a short lowercase name like \"fireball\"."); return; }
  if (G.abilities[def.id]) { err(`There are TWO abilities with the id "${def.id}"! Each id must be unique.`); return; }
  if (!def.name) err("It needs a name the player will see, like \"Fireball\".");
  if (!def.icon) err("It needs an icon — pick a fun emoji! 🔥");
  if (!G.DAMAGE_TYPES[def.type])
    err(`Its damage type is "${def.type}" — it must be one of: sharp, blunt, light, dark. (Rule 4: damage types are how wards work!)`);
  if (typeof def.mana !== "number" || def.mana < 0 || def.mana > 8)
    err("Its mana cost must be a number from 0 to 8.");
  if (typeof def.cooldown !== "number" || def.cooldown < 0.15)
    err("It needs a cooldown of at least 0.15 seconds — machine-gun moves melt the game (Rule 5: fair is fun).");
  if (typeof def.use !== "function")
    err("It needs a use(user) function — that's the code that actually does the move. Copy one from basics.js!");

  G.abilities[def.id] = def;
}

/* ---------- registering forms ---------- */
function registerForm(def) {
  const who = def.name || def.id || "???";
  const err = (msg) => { def.invalid = true; G.workshopErrors.push({ where: `form "${who}"`, msg }); };

  if (!def.id) { err("It needs an id — short and lowercase, like \"wizard\"."); return; }
  if (G.forms[def.id]) { err(`There are TWO forms with the id "${def.id}"! Each id must be unique.`); return; }
  if (!def.name) err("It needs a name!");
  if (!def.icon) err("It needs an icon emoji — this shows in the HUD and menus. 🧙");
  if (!def.tagline)
    err("It needs a tagline — ONE sentence that says what's cool about being this form. (Rule 1: every form is a fantasy!)");

  if (!def.sprite || !def.sprite.palette || !def.sprite.frames || !def.sprite.frames.length)
    err("It needs a sprite with a palette and at least 1 frame. Copy the rat's sprite and change the pixels!");
  else if (def.sprite.frames.length < 2)
    err("Its sprite only has 1 frame — add a second one so it animates when walking. (Even swapping two pixels works!)");

  if (typeof def.speed !== "number" || def.speed < 40 || def.speed > 140)
    err(`Its speed is ${def.speed} — keep it between 40 (slow tank) and 140 (zoomy). (Rule 5: fair is fun.)`);
  if (typeof def.hearts !== "number" || def.hearts < 1 || def.hearts > 8)
    err(`It has ${def.hearts} hearts — keep it between 1 and 8. (Rule 5!)`);

  if (!def.basic)
    err("It needs a basic attack (the A button) — set basic: \"someAbilityId\". Basics cost 0 mana.");
  if (!Array.isArray(def.abilities) || def.abilities.length < 1)
    err("It must bring at least ONE special ability of its own — mixing abilities between forms is the whole game! (Rule 2)");

  if (typeof def.slots !== "number" || def.slots < 1 || def.slots > 2)
    def.slots = 2; // B and C buttons

  if (!Array.isArray(def.quests) || def.quests.length < 2)
    err("It needs at least 2 quests! Quests are how players discover what's fun about your form, and how the form levels up. (Rule 3)");
  else {
    def.quests.forEach((q, i) => {
      if (!q.text) err(`Quest #${i + 1} needs a text, like "Poison 8 baddies".`);
      if (!q.event) err(`Quest #${i + 1} needs an event to listen for: kill, hit, status, wardBreak, multiHit, sign, or pickup.`);
      if (typeof q.count !== "number" || q.count < 1) err(`Quest #${i + 1} needs a count (how many times).`);
      q.id = q.id || `${def.id}-q${i}`;
    });
  }

  if (!def.start && !def.unlock)
    err("It needs an unlock rule so players can earn it! Like unlock: { type: \"level\", form: \"rat\", level: 2 } — or start: true to begin with it.");

  G.forms[def.id] = def;
  G.formOrder.push(def.id);
}

/* ---------- checks that need EVERYTHING loaded ----------
   (a form might mention an ability that's defined in a later
    file, so we check cross-references at boot time)          */
G.validateCrossRefs = function () {
  for (const id of G.formOrder) {
    const f = G.forms[id];
    const err = (msg) => { f.invalid = true; G.workshopErrors.push({ where: `form "${f.name || id}"`, msg }); };

    if (f.basic) {
      const b = G.abilities[f.basic];
      if (!b) err(`Its basic attack is "${f.basic}" but no ability with that id exists. Typo?`);
      else if (b.mana !== 0) err(`Its basic attack "${f.basic}" costs mana — basics must cost 0, they're how you REFILL mana!`);
    }
    if (Array.isArray(f.abilities)) {
      for (const a of f.abilities) {
        if (!G.abilities[a.id]) err(`It lists ability "${a.id}" but no ability with that id exists. Typo?`);
        if (typeof a.level !== "number" || a.level < 1) a.level = 1;
      }
    }
    if (f.unlock) {
      const u = f.unlock;
      if (u.type === "level" && !G.forms[u.form]) err(`Its unlock rule points at form "${u.form}" which doesn't exist.`);
      if (["allFormsLevel", "previousFormsLevel"].includes(u.type) && (typeof u.level !== "number" || u.level < 1))
        err("Its mastery unlock rule needs a number level, like unlock: { type: \"previousFormsLevel\", level: 3 }.");
      if (!["level", "item", "stars", "allFormsLevel", "previousFormsLevel"].includes(u.type))
        err(`Its unlock type is "${u.type}" — use "level", "item", "stars", "previousFormsLevel", or "allFormsLevel".`);
    }
  }

  // Friendly roster-wide tips (not errors — ideas!)
  G.workshopTips = [];
  const covered = new Set();
  for (const id in G.abilities) covered.add(G.abilities[id].type);
  for (const t in G.DAMAGE_TYPES) {
    if (!covered.has(t))
      G.workshopTips.push(`${G.DAMAGE_TYPES[t].icon} Nobody in the whole roster deals ${G.DAMAGE_TYPES[t].name} damage yet... a new form could be the first! 😉`);
  }
};

/* ---------- unlocking ---------- */
G.formUnlocked = function (id) {
  const f = G.forms[id];
  if (!f || f.invalid) return false;
  if (f.start) return true;
  const u = f.unlock;
  if (!u) return false;
  if (u.type === "level") return G.formLevel(u.form) >= u.level;
  if (u.type === "item") return G.state.items.includes(u.item);
  if (u.type === "stars") return G.state.stars >= u.stars;
  if (u.type === "allFormsLevel") {
    return G.formOrder.every((otherId) => {
      if (otherId === id) return true;
      const other = G.forms[otherId];
      return other && !other.invalid && G.formLevel(otherId) >= u.level;
    });
  }
  if (u.type === "previousFormsLevel") {
    const targetIndex = G.formOrder.indexOf(id);
    return G.formOrder.slice(0, targetIndex).every((otherId) => {
      const other = G.forms[otherId];
      return other && !other.invalid && G.formLevel(otherId) >= u.level;
    });
  }
  return false;
};

G.unlockedForms = function () {
  return G.formOrder.filter((id) => G.formUnlocked(id));
};

// Describe how to unlock a form, for the menu ("Reach Rat level 2")
G.unlockHint = function (id) {
  const u = G.forms[id].unlock;
  if (!u) return "";
  if (u.type === "level") return `Get ${G.forms[u.form] ? G.forms[u.form].name : u.form} to level ${u.level}`;
  if (u.type === "item") return "Find a special treasure...";
  if (u.type === "stars") return `Earn ${u.stars} ⭐`;
  if (u.type === "allFormsLevel") return `Get every other form to level ${u.level}`;
  if (u.type === "previousFormsLevel") return `Get every previous form to level ${u.level}`;
  return "";
};

// Call after quests complete / items found: announces new forms.
G.checkUnlocks = function () {
  for (const id of G.formOrder) {
    if (G.formUnlocked(id) && !G.state.known.includes(id)) {
      G.state.known.push(id);
      const f = G.forms[id];
      if (!f.start) {
        G.sfx.play("unlock");
        G.ui.banner(`${f.icon} NEW FORM: ${f.name.toUpperCase()}!`, f.tagline);
        G.events.emit("formUnlock", { form: id });
      }
      G.saveGame();
    }
  }
};

/* ---------- switching forms ---------- */
G.setForm = function (id) {
  if (!G.formUnlocked(id) || id === G.state.formId) return;
  G.state.formId = id;
  const p = G.state.player;
  // never let a swap knock you out — you always keep at least 1 heart
  p.damageTaken = Math.min(p.damageTaken, G.playerMaxHearts() - 1);
  p.dashing = null;
  G.sfx.play("swap");
  G.spawnFx({ kind: "ring", x: p.x, y: p.y - 6, color: "#f4f4f4", dur: 0.35 });
  G.events.emit("swap", { form: id });
};

/* ---------- ability loadouts (the MIXING system) ----------
   Each form has: slot A = its own basic attack (locked — that's
   the form's identity), plus open slots B and C where you can
   equip ANY ability you've unlocked from ANY form.            */

G.getLoadout = function (formId) {
  const f = G.forms[formId];
  const st = G.state;
  st.loadouts[formId] = st.loadouts[formId] || [];
  const lo = st.loadouts[formId];
  lo[0] = f.basic; // slot A is always the form's own basic

  // A progression update can re-lock a late form. Do not let an old save
  // keep borrowing abilities that are no longer earned.
  const earned = new Set(G.availableAbilities());
  for (let s = 1; s <= f.slots; s++) {
    if (lo[s] && !earned.has(lo[s])) lo[s] = null;
  }

  // auto-fill empty slots with the form's own abilities as they unlock
  const lvl = G.formLevel(formId);
  const natives = (f.abilities || []).filter((a) => a.level <= lvl && G.abilities[a.id]).map((a) => a.id);
  for (let s = 1; s <= f.slots; s++) {
    if (!lo[s]) {
      const next = natives.find((id) => !lo.includes(id));
      if (next) lo[s] = next;
    }
  }
  return lo;
};

// Every ability the player has earned, across all unlocked forms.
G.availableAbilities = function () {
  const out = [];
  for (const fid of G.unlockedForms()) {
    const f = G.forms[fid];
    const lvl = G.formLevel(fid);
    if (G.abilities[f.basic] && !out.includes(f.basic)) out.push(f.basic);
    for (const a of f.abilities || []) {
      if (a.level <= lvl && G.abilities[a.id] && !out.includes(a.id)) out.push(a.id);
    }
  }
  return out;
};
