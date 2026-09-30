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
  { id: "plumbline", name: "Mason's Plumbline", item: "trophy-old-mason", icon: "◆", color: "#d8b06a",
    region: "Hanging Gardens", guardian: "Old Mason", gain: "The brief guard after a melee hit lasts 50% longer.",
    price: "Dash arts cost 1 more mana.", note: "A sure hand in a crowded fight: a landed swing gives 0.18 seconds of guard. Misses and wrong wards give none; longer form-specific defenses keep their timing." },
  { id: 'spindle', name: "Tess's Spindle", item: 'trophy-silk-matriarch', icon: '◇', color: '#d9a7ff',
    region: 'Rootdeep Hollow', guardian: 'Silk Matriarch', gain: 'Chain arts can connect one extra foe.',
    price: 'Projectile arts take 25% longer to recover.', note: 'Gather a crowd for the extra thread. Damage per foe and jump reach stay the same; walls and wards keep their rules.' },
  { id: 'clapper', name: "Bongle's Clapper", item: 'trophy-bell-titan', icon: '♪', color: '#ffcd75',
    region: 'Frostbell Tundra', guardian: 'Bell Titan', gain: 'A chain connecting at least 3 foes returns 1 extra mana.',
    price: 'Paid area arts cost 1 more mana.', note: 'Gather three voices for a returning note. One extra mana per cast, even in a larger crowd; full wells and practice props give none.' },
  { id: 'ember', name: "Mallow's Ember", item: 'trophy-lantern-keeper', icon: '✧', color: '#ef7d57',
    region: 'Stormspine Peaks', guardian: 'Lantern Keeper', gain: 'Paid area casts snuff one nearby hostile shot.',
    price: 'Chain arts cost 1 more mana.', note: 'Catch the nearest active shot within 60 units and a clear path. Free arts, delayed shots, and floor hazards are untouched; Lantern Wisp keeps its lasting circles.' },
];

G.normalizeKeepsake = function (id, items) {
  return G.KEEPSAKES.some(k => k.id === id && (items || []).includes(k.item)) ? id : null;
};
G.activeKeepsake = function () {
  return G.state && G.KEEPSAKES.find(k => k.id === G.state.keepsakeId && G.state.items.includes(k.item)) || null;
};
G.abilityManaCost = function (ability) {
  const id = G.activeKeepsake()?.id;
  const surcharge = ability.mana > 0 && id === 'mire' || ability.style === 'dash' && id === 'plumbline'
    || ability.mana > 0 && ability.style === 'area' && id === 'clapper'
    || ability.style === 'chain' && id === 'ember';
  return ability.mana + (surcharge ? 1 : 0);
};
G.meleeGuardDuration = function () { return G.MELEE_GUARD_SECONDS * (G.activeKeepsake()?.id === 'plumbline' ? 1.5 : 1); };
G.abilityCooldown = function (ability) {
  const id = G.activeKeepsake()?.id;
  const scale = id === 'plume' && ability.style === 'dash' ? .75
    : id === 'plume' && ability.style === 'area' || id === 'spindle' && ability.style === 'projectile' ? 1.25 : 1;
  return ability.cooldown * scale;
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

G.onKeepsakeAbilityUse = function (user, ability) {
  if (user !== G.state.player || G.activeKeepsake()?.id !== 'ember' || ability.style !== 'area' || ability.mana <= 0) return false;
  let chosen = -1, nearest = 60;
  for (let i = 0; i < G.state.projectiles.length; i++) {
    const shot = G.state.projectiles[i];
    if (shot.fromPlayer || shot.armT > 0) continue;
    const distance = G.util.dist(user.x, user.y - 6, shot.x, shot.y);
    if (distance <= nearest && G.combat.clearArc(user.x, user.y - 6, shot.x, shot.y)) {
      chosen = i; nearest = distance;
    }
  }
  if (chosen < 0) return false;
  const shot = G.state.projectiles.splice(chosen, 1)[0];
  G.spawnFx({ kind: 'bolt', x: user.x, y: user.y - 6, x2: shot.x, y2: shot.y, color: '#ffcd75', dur: .28 });
  G.spawnFx({ kind: 'puff', x: shot.x, y: shot.y, color: '#ef7d57', dur: .3 });
  G.damageNumber(shot.x, shot.y - 8, 'SNUFF!', '#fff3c2');
  G.events.emit('projectileBlock', { kind: 'ember', ability: ability.id });
  return true;
};
