# Ability Feel Inventory and Benchmark

## What the game has

Nobody's Quest currently has 32 interchangeable abilities. Eleven are zero-mana
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
