/* One keepsake from an old guardian: a useful answer with a price. */
"use strict";

G.KEEPSAKES = [
  { id: "heartwood", name: "Heartwood Crown", item: "trophy-heartwood-crown", icon: "♛", color: "#a6d66e",
    region: "Mistwood", guardian: "Ancient Treant", gain: "Melee sweeps gain 25° of arc.",
    price: "Walking speed falls by 10%.", note: "A stubborn answer for crowded roads. Dash arts keep their usual distance." },
  { id: "mire", name: "Mire Pearl", item: "trophy-mire-pearl", icon: "●", color: "#73eff7",
    region: "Sunken Marsh", guardian: "Mire Queen", gain: "Poison from your arts lasts 40% longer.",
    price: "Arts that cost mana cost 1 more.", note: "Leave a little trouble behind. Free basic arts stay free; wards still block poison." },
  { id: "eclipse", name: "Eclipse Sigil", item: "trophy-eclipse-sigil", icon: "◐", color: "#d9a7ff",
    region: "Ember Ridge", guardian: "Eclipse Knight", gain: "Carry 4 more mana.",
    price: "Each mana regeneration tick takes 25% longer.", note: "Save a deeper well for your opening. Successful hits still refill mana normally." },
  { id: "plume", name: "Sovereign's Plume", item: "trophy-sky-sovereign", icon: "🪶", color: "#73eff7",
    region: "Windscar Canyon", guardian: "Sky Sovereign", gain: "Dash arts recover 25% sooner.",
    price: "Area arts take 25% longer to recover.", note: "Keep moving between your openings. Melee, projectile, and chain timing stays unchanged; the Sky Mark can lengthen your dash." },
];

G.normalizeKeepsake = function (id, items) {
  return G.KEEPSAKES.some(k => k.id === id && (items || []).includes(k.item)) ? id : null;
};
G.activeKeepsake = function () {
  return G.state && G.KEEPSAKES.find(k => k.id === G.state.keepsakeId && G.state.items.includes(k.item)) || null;
};
G.abilityManaCost = function (ability) {
  return ability.mana + (ability.mana > 0 && G.activeKeepsake()?.id === "mire" ? 1 : 0);
};
G.abilityCooldown = function (ability) {
  const plume = G.activeKeepsake()?.id === 'plume';
  return ability.cooldown * (plume && ability.style === 'dash' ? .75 : plume && ability.style === 'area' ? 1.25 : 1);
};
// The meter remembers the price at cast time. Changing equipment cannot
// shorten a running cooldown or make its displayed progress jump backwards.
G.cooldownDuration = function (ability) {
  return G.state?.player.cooldownDurations?.[ability.id] || G.abilityCooldown(ability);
};
G.keepsakeManaBonus = function () { return G.activeKeepsake()?.id === "eclipse" ? 4 : 0; };
G.manaRegenSeconds = function () { return G.MANA_REGEN_SECONDS * (G.activeKeepsake()?.id === "eclipse" ? 1.25 : 1); };
G.keepsakeSpeedScale = function () { return G.activeKeepsake()?.id === "heartwood" ? .9 : 1; };

G.carryKeepsake = function (id) {
  if (!G.state || id !== null && G.normalizeKeepsake(id, G.state.items) !== id) return false;
  if (G.state.keepsakeId === id) return false;
  G.state.keepsakeId = id;
  const p = G.state.player;
  p.manaMax = G.playerMaxMana();
  p.mana = Math.min(p.mana, p.manaMax);
  // Changing the well never refills it or releases a stored regeneration tick.
  p.manaRegenProgress = 0;
  G.saveGame();
  return true;
};

G.events.on("pickup", data => {
  const keepsake = G.KEEPSAKES.find(k => k.item === data.item);
  if (keepsake) G.ui.toast(`${keepsake.name} can shape your build. Visit Build / Keepsakes to choose its gift and price.`, 5);
});
