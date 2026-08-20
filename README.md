# Nobody's Quest

A browser clone of *Nobody Saves the World* built as a family project:
the engine is finished infrastructure; the **forms, abilities, enemies,
and maps are data files designed to be extended by a kid** (see
[FOR-BEN.md](FOR-BEN.md)).

Plain JavaScript + Canvas. **No build tools, no npm, no installs.**

The current campaign includes 24 mixable forms, the late-game Shattercoast and
Worldwake regions, personality-driven three-phase guardian trials, and two
different run systems: a configurable boss gauntlet and branching Manyfold
Expeditions.

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

Sunrise Town now enters the story after the first claimed form, starts with an
affordable house, and grows from ordinary good deeds as well as late-game wins.
The Living Atlas maintains three untimed situations in discovered regions, and
an ordinary creature that knocks Nobody out can become a named Rival that
returns with new readable traits. Manyfold Expeditions unlock with two forms and
provide short roguelite-inspired runs: varied branching routes, combat and rest
rooms, temporary boon/move/form drafts, safe failure, and persistent town
rewards. Campaign position, health, form, and loadouts are protected during a
run, so entering or abandoning one cannot be used as a free heal.

The Map menu contains the **Wayfinder Atlas**, an early-to-late side quest
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

- Desktop: WASD/arrows, J/K/L abilities, tap Q to quick-swap or hold Q and aim to open the paused form wheel; Esc opens the menu; Space or Enter advances dialogue
- iPad/touch: virtual joystick; tap ranged attacks to auto-aim, or drag an attack button and release to aim manually; tap the dialogue box to continue
- Xbox/standard controller: left stick or D-pad moves; A/RT, X/RB, and Y/LB use the three abilities; right stick aims; tap B to quick-swap or hold B for the paused form wheel; View opens the Atlas; Menu pauses. In menus, the left stick/D-pad moves focus with hold-repeat, the right stick scrolls, A confirms, B returns, L1/L2 go left, and R1/R2 go right. This same menu mapping works through the browser Gamepad API on iOS and through the Android TV bridge.

For a TV-like Steam Link launch on Windows, `tools/steam-launch.ps1` opens the
installed Chrome app, raises it above Big Picture, enters fullscreen, and stays
alive until the game closes so Steam keeps the correct game/controller context.

For Google TV / Android TV, [android-tv/](android-tv/) contains a small
sideloadable wrapper app: a fullscreen WebView pointed at the GitHub Pages
build plus a native Xbox-controller bridge feeding the game's existing input
system. Game updates still arrive by `git push` — no APK rebuild. See
[android-tv/README.md](android-tv/README.md).

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
