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

Change `range`, `damage`, `speed`, add a `status` like poison or stun,
or call `shoot` three times like Triple Shot does. Mix and match!

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

---

## 💡 Idea shelf (steal these!)

- 🐹 **Mole** — burrows under danger and erupts underneath it?
- 🧛 **Vampire** — DARK damage, heals when it bites
- 🐢 **Turtle** — 8 hearts, speed 40, reflects arrows?
- 🤖 **Robot** — shoots in all 4 directions at once
- 👻 **Ghost** — walks through enemies without getting hurt
- 🌋 A volcano map · 🏰 a castle map · 👑 a boss with TWO wards

The best ideas are yours, though. What form have you always wanted to be?
