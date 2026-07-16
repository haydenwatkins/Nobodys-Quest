# Ability Feel Inventory and Benchmark

## What the game has

Nobody's Quest currently has 53 interchangeable abilities. Eighteen are zero-mana
basic attacks; those are the moves players repeat most, so they received
individual tuning in this pass.

| Form | Basic (type, cooldown) | Other mechanics |
|---|---|---|
| Nobody | Slap (blunt, 0.35s) | Cartwheel damage dash |
| Rat | Bite (sharp, 0.30s) | poison bite, damage dash, 360-degree poison burst |
| Knight | Sword Slash (sharp, 0.50s) | stun/knockback bash, 360-degree slash |
| Ranger | Arrow (sharp, 0.45s) | piercing light arrow, three-arrow fan |
| Wizard | Curse (dark, 0.55s) | dark bolt, large piercing Dark Matter |
| Frog | Tongue Lash (blunt, 0.45s) | damage dash, radial projectile burst |
| Alchemist | Bottle Bonk (blunt, 0.40s) | explosive flask, poison-area flask |
| Stormcaller | Storm Spark (light, 0.45s) | four-target chain, 360-degree stun/knockback |
| Dragon | Tail Sweep (blunt, 0.55s) | five-shot breath cone, explosive meteor |
| Riftblade | Rift Cut (sharp, 0.36s) | three-beat wide combo, damage dash, path-bending returning blade |
| Mole | Drill Tap (blunt, 0.38s) | endpoint eruption dash, traveling fault-line shockwave |
| Vampire | Blood Bite (dark, 0.34s) | five-hit healing rhythm, dash, large blood-moon burst |
| Jester | Wild Card (sharp, 0.45s) | third-card ricochet, pie fan, chaotic encore |
| Turtle | Shell Jab (blunt, 0.42s) | third-hit brace, damage roll, defensive counter |
| Samurai | Quickdraw (sharp, 0.40s) | three-cut rhythm, flash dash, 300-degree draw-cut |
| Astronomer | Star Needle (light, 0.46s) | fourth-shot pierce, radial stars, pulling gravity well |
| Druid | Thorn Lash (dark, 0.47s) | poisonous reach, bursting seed, stunning growth field |
| God | Divine Spark (light, 0.50s) | 360-degree judgment, piercing dark star |

Before this pass, attacks already had a white hit flash, modest random camera
shake, knockback, three sparks, damage numbers, and one generic hit tone. The
important gaps were: no contact pause, no buffered input, no attack pose, one
sound for every material, very thin melee arcs, and projectiles with almost no
motion trail.

## What other games and players point to

- A study of 5,000 player comments identified 19 contributors to impact feel
  and found that hit-stop, coherent sound, and camera control can be especially
  influential. It also warns that one neglected feedback channel can undermine
  the whole impact: [What Features Influence Impact Feel?](https://arxiv.org/abs/2208.06155)
- Celeste's developers describe tiny input allowances such as coyote time,
  jump buffering, and corner correction. The transferable lesson is not its
  jump mechanic; it is that invisible forgiveness makes intent feel reliable:
  [GameSpot's developer summary](https://www.gamespot.com/articles/celeste-dev-explains-how-they-made-their-game-feel/1100-6474775/)
- Dead Cells was praised for smooth animation, pixel effects, and weapons that
  land with force because their sound supports the visuals:
  [PC Gamer review](https://www.pcgamer.com/dead-cells-review/)
- Hades was praised for the combination of responsive controls, speedy action,
  quick decisions, and positive feedback—not a single oversized effect:
  [RPGamer review](https://rpgamer.com/review/hades-review/)
- Working developers repeatedly recommend short, conservative hit-stop plus
  flash, particles, sound, shake, and enemy reaction. They also warn that long
  pauses feel like lag and that feedback must not override player intent:
  [hit-stop discussion](https://www.reddit.com/r/gamedev/comments/vug4x2/whats_the_easiest_thing_youve_implemented_that/),
  [melee-feel discussion](https://www.reddit.com/r/gamedev/comments/189wuap/for_those_of_you_with_combat_as_a_mechanic_in/)

## Changes made

- Added 20-50ms contact pauses, scaled conservatively by hit weight. Multiple
  hits take the maximum pause instead of adding together.
- Added a 120ms ability-input buffer so a tap just before cooldown completion
  still happens. Input remains live during contact pauses.
- Added brief melee lunges, ranged recoil, directional enemy kick, directional
  camera impulse, thicker early melee arcs, impact crosses, and richer sparks.
- Added real projectile trail history, muzzle puffs, and bright projectile cores.
- Split attack anticipation from contact audio and gave sharp, blunt, light,
  and dark attacks coherent timbres, with a small low-frequency contact layer.
- Tuned every basic independently while preserving all damage, mana, cooldown,
  range, status, ward, and progression rules.
- Respect `prefers-reduced-motion` by disabling directional camera impulse;
  readable sound, particles, flash, and the short contact pause remain.

The intended result is layered and restrained: attacks should be clearer and
more responsive after ten minutes, without any one effect calling attention to
itself in the first ten seconds.

## Boss-form expansion

The Mole, Vampire, and Jester expansion follows two additional lessons. Combat
abilities are more interesting when each has a unique tactical function and a
clear risk/reward tradeoff, and enemies are strongest as teachers for the tools
the player will use ([combat-system design](https://www.gamedeveloper.com/design/the-fundamental-pillars-of-a-combat-system)).
Players also warn that ricochet, chain lightning, and bouncing attacks feel
samey when they only swap visuals; build identity needs mechanical differences
([action-RPG player discussion](https://www.reddit.com/r/rpg_gamers/comments/1freu65)).

- **Mole:** Burrow Blitz is invulnerable repositioning with no travel damage;
  its power only arrives at the chosen endpoint. The boss telegraphs the same
  burrow-and-erupt sequence.
- **Vampire:** Blood Bite heals exactly one heart after five successful hits.
  It rewards aggression but cannot passively erase mistakes or heal on misses.
- **Jester:** the player counts a three-card rhythm. Only the third throw can
  retarget, and it physically travels between unhit enemies rather than using
  the existing instant chain helper.
- **God:** the final boss cycles charge, returning blade, card fan, and radial
  patterns. God remains last and requires both full prior mastery and victory
  in the final trial.

## Full mana recovery

Mana regenerates by one point every 0.7 seconds all the way to the true maximum,
after a 0.4-second delay when spending mana. Hits still grant mana as an extra
accelerator. Waiting can always restore a capstone, while aggressive play gets
there faster.

## Close-quarters advantage

Melee now wins on tempo and control rather than receiving a blanket damage
increase. Directional swings that would miss by at most six pixels take a
collision-safe contact step toward a target already inside the swing's arc.
The step never activates for 360-degree attacks, never pulls through walls,
and never moves a swing that was already going to connect.

A successful melee cast grants 0.12 seconds of clash protection and one bonus
mana, once per cast rather than once per target. Whiffs grant neither benefit.
Engaged bosses also build a six-hit melee stagger meter. A stagger interrupts
the current boss action for 0.72 seconds, then the boss resists further stagger
for 4.5 seconds. Phase transitions clear the meter and always take priority,
preventing stun-locks and preserving each fight's dramatic structure.

Boss bodies are safe to overlap during ordinary movement, recovery, and attack
windups; body contact only hurts during a clearly telegraphed charge. Boss
projectiles also have a 0.12-second arming window at spawn so a close-range
player can read the shot instead of being hit at its origin. Projectile damage,
charge damage, and ordinary-enemy contact damage are unchanged.

## Shattercoast expansion

Four late-game forms sit before God in progression, so the final mastery rule
automatically scales with the larger roster. Each guardian teaches the move that
will become the form's signature without making that move individually dominant:

- **Turtle:** Shell Jab builds to a short brace. Shell Counter spends mana for
  0.58 seconds of deliberate protection and a low-damage knockback burst.
- **Samurai:** Quickdraw rewards maintaining a three-cut rhythm; Crescent Draw
  pays six mana for exceptional arc coverage, not exceptional damage.
- **Astronomer:** every fourth Star Needle pierces. Gravity Well deals two damage
  and pulls nearby targets together, enabling combinations with any shared area move.
- **Druid:** Thorn Lash supplies reliable DARK pressure, while Seed Burst and
  Wild Growth trade immediate speed for poison and crowd setup.

The Manyfold Gauntlet samples only bosses whose trophies are already in the
player's save. Players choose 3, 5, 8, or their complete collected roster and
may enable a campfire that restores one heart and three mana between rounds.
Iron runs keep all attrition. Each longer personal best awards one star, while
clearing the entire known roster awards the Manyfold Crown. Bosses always begin
at full health and no boss repeats inside one run.

First-encounter boss scenes now hold each line for 2.2 seconds. Ability buttons
advance one line at a time after the opening beat instead of skipping the whole
scene, preserving control while giving jokes, mechanics, and personalities time
to land. Rematches retain their short one-line greeting.

## Why the Riftblade works this way

The Riftblade combines patterns that players repeatedly describe as fun without
copying another game's exact class:

- Final Fantasy XIV's Red Mage uses ordered actions, resource balance, and a
  ranged-to-melee transition. Its official guide makes the rhythm explicit:
  [Red Mage job guide](https://na.finalfantasyxiv.com/jobguide/redmage/)
- Diablo players repeatedly point to the Rogue's mobility, active combo rhythm,
  and ability to dive in and disengage as reasons it is fun:
  [player discussion](https://www.reddit.com/r/diablo4/comments/140xrhr)
- Monster Hunter players praise mobile weapons for responsiveness, repositioning,
  and the feeling of dancing with the monster rather than standing in place:
  [weapon discussion](https://www.reddit.com/r/MonsterHunterWilds/comments/1nfg4vw/what_weapon_is_the_most_fun_for_you_and_why/)
- Nobody Saves the World's designers emphasize distinct forms, immediately usable
  rewards, and abilities that remain interesting when mixed across the roster:
  [Drinkbox design interview](https://www.gamedeveloper.com/design/designing-the-many-forms-and-abilities-of-nobody-saves-the-world)

Those ideas become a simple three-part loop: throw Returning Star, move or Rift
Rush to reshape its trip home, then land the wide third beat of Rift Cut. Every
move also remains independently useful when another form borrows it. The
Riftblade Adept alternates the same returning throws and rushes so the unlock
fight teaches the fantasy before awarding it.
