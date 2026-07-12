# Ability Feel Inventory and Benchmark

## What the game has

Nobody's Quest currently has 29 interchangeable abilities. Ten are zero-mana
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
