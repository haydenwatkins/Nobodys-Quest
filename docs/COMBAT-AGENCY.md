# Combat choices that preserve enjoyable play

October 8, 2026. This pass applies the shared player-experience principles to old equipment and ordinary enemies, alongside the earlier guardian lifecycle backfill. It does not introduce a challenge-mode switch.

## Equipment audit

The nine existing gifts remain optional, owned-only choices in Pockets. Browsing is read-only; carrying preserves already-paid cooldowns and never refills mana. No item, recipe or backup identity changes.

| Gift | Useful choice | Price and audit outcome |
| --- | --- | --- |
| Heartwood Crown | Add 25 degrees to melee sweeps; keep a group in reach for the next swing. | **Changed:** melee knockback is 40% weaker, after form/Mark modifiers and before the existing heavy/ward reductions. Walking now has its full normal speed. Damage, mana, guard, reach and dash distance remain intact. Choosing crowd coverage trades away some space-making power. |
| Mire Pearl | Longer poison lets a player reposition while an affliction works. | Paid arts cost one more mana. Free basics remain available; wards still block poison. Retained. |
| Eclipse Sigil | A larger reservoir prepares an opening or expensive sequence. | Passive refill takes longer; successful hits still refill normally, and changing gifts never fills the reservoir. Retained. |
| Sovereign's Plume | More frequent dash answers. | Area arts recover more slowly; the cooldown already paid cannot be shortened by swapping. Retained. |
| Mason's Plumbline | A landed melee hit gives longer protection. | Dashes cost more mana. Wrong wards and misses give no protection; form-specific defenses retain their timing. Retained. |
| Tess's Spindle | One more connected foe makes a crowd useful. | Projectile arts recover more slowly. Walls, wards and jump reach remain meaningful. Retained. |
| Bongle's Clapper | A genuine three-foe chain returns extra mana. | Paid area casts cost more. A small group cannot manufacture the benefit; practice props pay nothing. Retained. |
| Mallow's Ember | A paid area cast also removes one nearby active hostile shot. | Chains cost more mana. The snuff requires range and a clear path; it is not immunity to all threats. Retained. |
| Atlas's Lodestone | Matching melee/area hits break a ward sooner. | Dashes recover more slowly. Wrong types cannot bypass wards. Retained. |

Native input verification casts each of the 24 forms' actual basics at zero mana with each gift: 216 combinations. This verifies availability, not the balance of every possible borrowed-art/Mark build. The real Crown swing also retains hit-confirm guard, deals unchanged damage, reaches the extra foe and delivers a shorter shove. A wrong ward still gives neither damage nor guard. Existing gift-specific tests retain their actual cost/benefit/save contracts.

Short Pockets copy now says “Swings push foes less”; optional exact details give the 40% price. Opening any gift's details brings that explanation into view, including short landscape touch screens; the visual check caught an expanded explanation hidden below the fold. The price affects the tool the gift changes, rather than charging for every trip across the world. Preserve that reasoning when adding future gifts; there is no mandate to make every item's price knockback.

## Ordinary encounter backfill

October 10 family playtesting rejected the ordinary enemy aiming change. All seven ordinary ranged types again fire on their native cooldown at the player's position on release and keep their ordinary movement. The stop-and-aim phase, fixed-place commitment, targeting lanes, wind-up ring, cast interruption and added recovery are removed. Actual stun still suppresses movement, firing and body-contact damage; released projectiles retain their danger. Guardian-specific counters and warnings retain their authored rules.

Hostile projectiles now carry a dark edge, pale rim and bright center through the shared renderer. Generic shots stay compact; cards, blades, stars, seeds, shells, waves and fault shots retain their silhouettes and specialized regional art. Collision size, speed, damage, range, lifetime, player shot art and rewards are unchanged. Readability belongs to the traveling shot rather than a line painted across the map.

Verification: five focused ordinary-enemy cases verify native cooldown/retargeting/retreat, health hits without invented cast interruption, ward behavior, actual stun across the roster and paint-only rendering of eight hostile silhouettes plus a friendly arrow. They are included in the 17-case focused batch. Four native touch/TV × art-setting browser workflows use a controlled Spitter placement and supplied Crown ownership checkpoint to verify native sidestepping, real released-shot travel, free Slap damage, retained movement and exact equipment disclosure. The eight-shot gallery is a stationary visual fixture, not a combat playthrough. All 28 final captures were inspected on two sheets and selected native-size views; the final gallery exposes all eight silhouettes outside the HUD. These checks do not establish uninterrupted campaign balance, every guardian fight or physical-device visibility. The final complete 2D regression passes **711 tests**, zero failed/cancelled/skipped/todo (576,169.723729 ms); the 17 focused cases overlap that run.

The remaining close-range registry inspection identifies these authored gaps:

| Existing creatures | Current useful answer and next review |
| --- | --- |
| Slime / Orchard Tangle | Slow pursuit, ordinary knockback and short free-basic encounters; the Tangle also supports the poison lesson. Keep these approachable rather than adding a compulsory counter to every creature. |
| Bat / Sun Hopper / Mirage Skater | Fast pursuit, low health and ordinary knockback. Stun now buys a safe pause. Review distinct readable approach beats and slow-form escape answers; these are the next close-range pressure cases. |
| Bones | A small blunt ward gives a clear type choice, then ordinary knockback. Review how its matching-ward lesson combines with faster neighbours. |
| Brute | Slow heavy pursuit with a larger sharp ward. Review a purposeful close-range commitment/recovery and low-mana matching answers; stronger ward health alone does not establish an interesting encounter. |
| Pebblebeast / Tide Crab / Cairn Walker | Heavy creatures with smaller blunt wards and different regional settings. Existing shoves have reduced effect. Review their different space-making answers and group combinations rather than treating them as three copies of the same pressure. |
| Orchard Guard | Already holds a post, commits its aimed swing and recovers. Preserve this introductory example; inspect combinations before increasing complexity. |

These observations are a code/registry audit, not newly authored chase patterns or completed human encounter tuning.

## Earlier verification (superseded ordinary aiming behavior) and remaining coverage

Focused native verification passes 13 cases covering the new ordinary behavior, Crown, zero-mana basics and existing ownership/save/recipe contracts. Full regression and browser evidence are recorded below after the integration checkpoint.

The final browser runs pass eight touch/TV-controller × HD/base workflows: four new agency scenarios and four existing menu-optional kit regressions. New scenarios use the actual camp bag and field Carry/Look closer controls, save the Crown without refilling mana, draw a real opening Spitter's warning, sidestep with the touch joystick or Android TV pad bridge, observe its released shot crossing the old position without hurting the moved player, and cancel the next cast with native zero-mana Slap. Exact gift text is fully visible after opening its disclosure.

The new run creates 24 final captures; all four sheets and selected full-size touch/controller warning and exact-detail views were inspected. The kit regression creates 54 captures and checks opening world lamps, native held-touch/R3 Quick Mix, field browsing, actual carrying, souvenirs and reload. Position, ownership, chapter and enemy grouping are controlled fixtures. These prove native input/combat/display/save integration in Chromium at 667×375 touch and 1280×720 TV layouts on the synthetic published-host origin; they do not prove an uninterrupted campaign, physical Android TV distance, iPad Safari or every optional-run balance.

The final complete 2D suite passes **654 tests**, zero failed/cancelled/skipped (495,800.022566 ms). Final focused checks pass 15 kit/keepsake cases, five strengthened caster/trajectory cases and the updated legacy combat suite; these overlap full regression. The legacy combat test now requires a warning before release and retains immediate collision after release.

The caster-family and stun audits cover shared behavior. Fast pursuers, heavy close-range creatures, regional crowd combinations, Mark/form tradeoffs, fresh continuous Worldwake acquisition, physical TV viewing and human difficulty balance still need review. The next authored encounter work remains Treant's active counter and safe demonstration, followed by voluntary richer patterns and Queen/Knight. Preserve the collection, road, prose and advanced-interface obligations in `CLOUD-ROADMAP.md`.
