# Nobody's Quest

A browser clone of *Nobody Saves the World* built as a family project:
the engine is finished infrastructure; the **forms, abilities, enemies,
and maps are data files designed to be extended by a kid** (see
[FOR-BEN.md](FOR-BEN.md)).

Plain JavaScript + Canvas. **No build tools, no npm, no installs.**

The current campaign includes 18 mixable forms, the late-game Shattercoast
region, personality-driven three-phase guardian trials, and a configurable
boss gauntlet with optional between-round recovery.

Every form carries an exclusive passive identity in addition to its basic
attack and stats. All 53 abilities declare a combat style, and form passives
remix matching borrowed abilities through reach, movement, defense, ricochet,
pulls, aftershocks, status spreading, and other utility rather than blanket
damage or mana bonuses. The Mix menu marks these combinations with a star.
Dash abilities are invulnerable for their complete travel and landing.

The endgame continues beyond form collection. Finding every guardian earns the
Guardian Compass and opens a repeatable Hero Board with rotating patrol,
exploration, ward, ability-mixing, form-mixing, and rematch contracts. Contracts
build renown and the player's town, while a full Manyfold Gauntlet clear awards
a functional Crown with extra mana and one Second Wind per future run.

The Explore menu contains the **Wayfinder Journal**, an early-to-late side quest
that tracks eight major regions and reveals trials only after discovery. Unknown
regions provide directional and star-requirement clues instead of spoilers.
Completing the region list awards three stars and a Wayfinder Whistle for safe-
area fast travel between previously discovered regions.

The **Style** menu is a cosmetic progression track that starts immediately and
grows through exploration, keepsakes, guardian trophies, and the full gauntlet.
Its nine costumes recolor and accessorize every form without changing combat
stats or difficulty; future forms automatically inherit the complete wardrobe.

## Run it

Double-click `index.html`. Works from the plain filesystem — no server needed.

- Desktop: WASD/arrows, J/K/L abilities, Q swap, Esc menu
- iPad/touch: virtual joystick; tap ranged attacks to auto-aim, or drag an attack button and release to aim manually

## Project layout

```
index.html          page + script list (new form files get added here)
css/style.css       layout, touch buttons, menus
js/engine/          THE ENGINE — kids don't need to touch this
js/abilities/       the shared pool of moves (very copy-paste friendly)
js/forms/           one file per form ← where Ben adds classes
js/data/            enemies + maps (ASCII tilemaps)
FOR-BEN.md          the kid-facing guide
```

Design rules from the original game (ability mixing, mandatory quests,
damage-type wards, stat limits) are **enforced by a validator** in
`js/engine/forms.js` — breaking one shows a friendly "Form Workshop"
screen explaining the fix instead of a crash.

## Publish to GitHub Pages (so iPads can play it)

One-time setup:

1. Create a repo on github.com (public), e.g. `nobodys-quest`.
2. In this folder:
   ```
   git init
   git add -A
   git commit -m "Nobody's Quest v1"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/nobodys-quest.git
   git push -u origin main
   ```
3. On GitHub: repo → **Settings → Pages** → Source: **Deploy from a
   branch** → Branch: `main`, folder `/ (root)` → Save.
4. Wait ~1 minute. The game is live at
   `https://YOUR-USERNAME.github.io/nobodys-quest/`

Every future update is just:

```
git add -A
git commit -m "Added the Wizard"
git push
```

...and the live site refreshes itself in about a minute. Share the URL
with anyone.

### On the iPads

Open the URL in Safari → Share button → **Add to Home Screen**.
It gets its own icon and launches fullscreen like a real app.
Saves are per-device (localStorage), so Ben and Lily each have their own.

## Credits

Game design pillars borrowed with admiration from Drinkbox Studios'
*Nobody Saves the World*. This is a fan-made learning project.
