# 👤 NOBODY'S QUEST — Builder's Guide

Hey Ben! This game is **yours to grow**. The engine is built —
your job is to invent new **forms** (classes), new **abilities**,
new **enemies**, and new **places**. This guide shows you how.

---

## 🎮 How to play it right now

Double-click `index.html` — it opens in your browser. That's it.

| Keys | What they do |
|------|--------------|
| WASD or Arrows | move |
| J / K / L (or Z / X / C, or Space) | abilities A / B / C |
| Q or Tab | quick-swap form |
| Esc or Enter | menu (forms, quests, mixing) |

On an iPad it's all touch — joystick on the left, buttons on the right.
Tap a ranged attack to auto-aim at the nearest visible enemy, or drag
an attack button like an aiming stick and release to fire your way.

---

## 🧙 Make your first form (10 minutes)

Let's make a **Wizard**.

**Step 1.** In the `js/forms/` folder, copy `rat.js` and name the copy `wizard.js`.

**Step 2.** Open `wizard.js` and change things:

```js
registerForm({
  id: "wizard",                      // lowercase, no spaces
  name: "Wizard",
  icon: "🧙",
  tagline: "Old, wise, and slightly explosive.",

  speed: 70,
  hearts: 3,
  slots: 2,

  basic: "slap",                     // borrow Slap for now (or make your own move!)
  abilities: [
    { id: "fester", level: 1 },      // borrow moves until you invent some
  ],

  unlock: { type: "stars", stars: 5 },   // how players EARN it

  quests: [
    { text: "Defeat 10 baddies as a magic user", event: "kill", count: 10 },
    { text: "Break 2 wards", event: "wardBreak", count: 2 },
  ],

  sprite: { ...keep the rat's sprite for now, draw yours later... },
});
```

**Step 3.** Open `index.html` and add one line next to the other forms:

```html
<script src="js/forms/wizard.js"></script>
```

**Step 4.** Refresh the browser. Your Wizard is in the game. 🎉

> 🛠 If you break a rule, the **Form Workshop** screen pops up and
> tells you exactly what's wrong and how to fix it. That's not a
> punishment — that's the game's designer talking to you.

---

## 📜 THE RULES (why the workshop is strict)

This game copies what made *Nobody Saves the World* great. The rules
aren't random — each one protects the FUN:

1. **Every form is a fantasy.** Name, icon, tagline, own look.
   If Wizard feels like Knight-but-blue, it's not done yet.
2. **Abilities are shared.** Your form must bring at least one move
   of its own — and every OLD form can borrow it. Your new form
   makes the whole game bigger, not just one page of it.
3. **Quests teach the fun.** At least 2 per form. A good quest makes
   the player try the thing that's cool about your form.
4. **Damage types matter.** sharp / blunt / light / dark. Warded
   enemies force players to mix. Dark magic is especially useful
   against Shades and the purple wards in later regions.
   One ability keeps its declared type for every hit, including dash
   finishers and projectile explosions; the combat engine enforces this.
5. **Fair is fun.** Speed 40–140, hearts 1–8, mana 0–8, cooldown
   0.15s+. A form that breaks the game is boring in five minutes.

---

## ⚔️ Making a new ability

Open `js/abilities/basics.js` — every move in the game is there,
and there's a ready-to-uncomment **Shadow Bolt** at the bottom.
The combat building blocks:

- `G.combat.meleeArc(user, {...})` — a swing (Slap, Slash, Fester)
- `G.combat.shoot(user, {...})` — a projectile (Arrow, Lucky Arrow)
- `G.combat.chain(user, {...})` — jumps between nearby targets
- `G.combat.dash(user, {...})` — a zoom (Cartwheel, Squeak Zoom)

Projectiles can use `explodeRadius` and `explodeDamage` to burst on
impact. Give every projectile in a fan the same `hitGroup` object when
one cast should only damage each enemy once (Fire Breath does this).
Combining `pierce: true` with an explosion makes a traveling shockwave:
it erupts at each new enemy, keeps moving, and counts unique hits across
the complete cast. Fault Line is the reference example.

Mana naturally recovers all the way to 10 after a short casting delay.
Successful hits add mana faster, so aggressive play reaches the biggest
moves sooner without making waiting players farm enemies forever.

Change `range`, `damage`, `speed`, add a `status` like poison or stun,
or call `shoot` three times like Triple Shot does. Mix and match!

### Making an ability feel good

The combat helpers add a short hit pause, damage-type sound, recoil,
sparks, and camera kick automatically. You can tune the personality of
a move without changing its power:

- Melee: `lunge` (sprite lean), `weight` (arc thickness), `hitStop`, `shake`
- Projectiles: `recoil`, `trail` (2-6 works well), `hitStop`, `shake`

Keep `hitStop` subtle: about `0.02` for quick moves, `0.04` for heavy
moves, and only around `0.05` for the biggest impacts. The goal is a
crisp moment of contact, not a pause the player notices as lag.

## 🎨 Drawing sprites

A sprite is just letters — each letter is a pixel, `.` is see-through:

```js
sprite: {
  palette: { k: "#1a1c2c", w: "#f4f4f4" },
  frames: [ [ "..kk..", ".kwwk.", "..kk.." ], [ ...frame 2... ] ],
}
```

Draw right in the code, or use [Piskel](https://www.piskelapp.com)
(free, in the browser) to sketch it visually. Two frames = walking
animation. Keep a dark outline — it's what makes sprites pop.

**Want to start from an existing sprite instead of a blank canvas?**
Open [tools/sprite-lab.html](tools/sprite-lab.html) (double-click it,
just like index.html) — pick any character, download it as a picture,
edit it in Piskel, then upload your edit back in and it hands you the
game code to paste in. Your Wizard is currently wearing the Rat's
sprite — that's a perfect one to grab and make your own!

## 👹 New enemies & new places

- Enemies live in `js/data/enemies.js`. Copy one, change it. Give it
  a `ward` to force players to think!
- Maps live in `js/data/maps.js`. They're drawn with LETTERS. Add
  rooms to the dungeon, or a whole new map with a door leading to it.

### Forms earned from bosses

Riftblade and the later trials demonstrate boss-earned forms. Unlock rules are
challenges, and finishing one makes the form ready to **claim** in the Forms menu:

```js
unlock: {
  type: "challenge",
  hint: "Defeat the Riftblade Adept",
  requirements: [
    { type: "item", item: "riftblade-sigil", hint: "Win the Riftblade Sigil" },
    { type: "formLevel", form: "dragon", level: 2 },
  ],
}
```

The matching miniboss has `trophy: "riftblade-sigil"`. Defeating it awards the
item, checks form unlocks immediately, and presents the new form. The boss should
demonstrate the form's signature rhythm with fair telegraphs, so earning the form
also teaches the player how to enjoy it.

Bosses can have short personalities without adding a dialogue engine. Put
`introLines`, `phaseLine`, `phaseThreeLine`, `knockoutLine`, `defeatLine`, and
`rematchLine` inside `boss`. Set `phases: 3` and `phaseThresholds: [0.66, 0.33]`
for a three-act fight. The
first encounter pauses briefly for the lines, and an ability button skips them.
Keep each line short enough to read during an action game.

A boss arena can opt into the retry loop with
`bossTrial: { exit: { map: "overworld", x: 40, y: 1 }, delay: 1.5 }` on its map.
A knockout pauses on the boss's line, ejects the player, and rebuilding the arena
on re-entry guarantees a full-health boss. Overworld entrances use
`portalStyle: "trial"` plus a `portalTheme` (`riftblade`, `mole`, `vampire`,
`jester`, or `god`) to draw a recognizable landmark without new image files.

The current boss-earned examples deliberately teach different jobs:

- Mole Monarch: reposition underground, then erupt in a crowd.
- Countess Carmine: stay aggressive to earn carefully limited healing.
- Royal Fool: count attacks and set up a third-card ricochet.
- God of Every Form: combines learned patterns as the final mastery exam.

### The Shattercoast expansion

Shattercoast is a late-game region containing four more guardian-earned forms:
Turtle, Samurai, Astronomer, and Druid. Their scripts still follow the same
Workshop rules as every form Ben makes; they are examples, not engine exceptions.
Because their scripts load before `god.js`, God's `previousFormsLevel` challenge
automatically includes them and will keep including any future form placed there.

The Manyfold Gauntlet unlocks after three miniboss trophies. Its menu lets the
player choose a run length and whether a campfire restores all health and three
mana between rounds. The pool is built from collected trophies, so adding a new
miniboss with a trophy automatically adds it to future gauntlets after defeat.

The same data-driven trophy list controls the endgame collection reward. When
every current miniboss trophy is owned, the Guardian Compass unlocks the Hero
Board. Adding another trophy-bearing miniboss automatically extends both the
collection requirement and future full-roster gauntlets. Hero Board contracts
live in `js/engine/endgame.js`; keep additions focused on varied play across
maps, forms, abilities, and damage types rather than raw repetition.

Boss introductions use three short lines with 2.2 seconds per line. Tapping an
ability advances to the next line; it no longer discards the complete scene.
Rematches remain quick.

---

## 💡 Idea shelf (steal these!)

- 🐹 **Mole** — burrows under danger and erupts underneath it?
- 🧛 **Vampire** — DARK damage, heals when it bites
- 🐢 **Turtle** — 8 hearts, speed 40, reflects arrows?
- 🤖 **Robot** — shoots in all 4 directions at once
- 👻 **Ghost** — walks through enemies without getting hurt
- 🌋 A volcano map · 🏰 a castle map · 👑 a boss with TWO wards

The best ideas are yours, though. What form have you always wanted to be?
