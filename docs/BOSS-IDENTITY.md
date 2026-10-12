# Distinct guardian experiences

October 12, 2026. The family's direction is that every boss should feel unique. This is an implementation audit of all 19 registered guardian definitions and the nine recent responses, not a human verdict that they already do. Shared controls, readable warnings, help, retry and reward bookkeeping are useful. Shared optimal play is the problem.

## Authoring gate

Describe a fight without its name, colors, ward or prop. What does the player choose, where do they move, when do they act, and what changes because they succeeded? Compare that answer with nearby encounters. If it still reads “hit an object, cancel everything, hit a stunned boss,” a different object has not made a new fight.

A new encounter needs a recognizable decision and a different consequence. Useful consequences include carrying defense into the next attack, changing safe ground, choosing where the boss arrives, redirecting one threat, moving cover or rescuing a route. Choose what suits that character; these are examples, not a compulsory list. Do not add currency, controls, a named mode or a mandatory checklist to manufacture novelty. More bullets, a smaller safe space or one following attack alone do not establish a richer rematch.

Teach the signature in the standard encounter before developing it. Keep walking, favorite bodies, zero-mana responses, independent help, honest collision and equal rewards. A final encounter may deliberately combine learned ideas in short phrases; preserve their learned rules instead of making a random attack sampler. A short opening encounter may reuse a basic move to teach it, with an explicitly different purpose.

## Roster audit and authored directions

The first column records what currently exists. The direction is queued unless marked implemented; it is not a claim that every row has shipped.

| Guardian | Actual current decisions / overlap | Direction and remaining work |
| --- | --- | --- |
| Treant | Guide a charge, leave a root target, snap it for a ward chip and a global opening. Branching adds a follower. | Preserve the first roadside teaching beat. Develop useful root ground in the later encounter rather than repeating a larger charge-and-stun duel. |
| Tollkeeper | Charge/rootBloom reuses Treant's vocabulary in a short delivery encounter, without a ward. | Keep the short shield-timing purpose and delivery consequence. Do not expand it into another full Treant rematch. |
| Queen | Walk among mire bubbles or crack a nearby crust to interrupt; optional follower volley. | Backfill a persistent usable channel through her moving court. Prioritize positional choice over another interrupt reward; preserve ferry/Pearl pacing. |
| Knight | Read charge/sweep, ring a raised shield; optional following crescent. | Retain shield timing. Develop facing and flanking as the duel's decision rather than the same prop/stun loop. |
| Mira | Prepare a reflector and place it for an actual returning blade; Double Return repeats throws. | Returning flight and placement are genuinely distinct inputs. Preserve them; review the blanket cancellation payoff and whether two returns add a new decision. |
| Bram | Pop a stomp plug or prepare an old root and guide the actual burrow through it. | Preserve baiting a committed route. Give the old route a lasting arena use instead of relying only on a stagger. |
| Vesper | Uncover light, then let her committed dash enter it; following waltz. | Develop moving between lit shelter and open dancing ground. Avoid the same prepare/intercept/stun payoff as Marlo. |
| Tansy | Splash a landed pie before its burst; optional following fan. Generic cards/nova overlap other casters. | Next backfill: make the splash alter how the next card passage behaves, with a readable walking alternative. A new card count alone is insufficient. |
| Marlo | Open a gate for an actual current catch; perpendicular following tide. | Develop choosing and carrying a channel through tide geometry. Preserve the reachable refuge and actual-current ownership; do not simply add a third tide. |
| Sumi | Strike paper, then make a real outward step; crossing follower. Charges/crescents overlap Knight. | Keep follow-through as her identity. Develop unfolding a route through cuts rather than every success erasing the whole sequence. |
| Nell | **Implemented this batch:** endure the safe orbit to earn three carried planets; actual incoming shots spend them while Nell stays active. A single committed comet replaces her generic nova. | Position, carry defense, then choose the approach or walk clear of the comet. No attack prop, ward bypass, blanket cancellation or bespoke counter stun. Standard chosen practice only; do not clone a following-comet mode. |
| Grandmother Briar | Seed fan, fixed garden beds and charge; overlaps casters and chargers. | Make pruning change a lasting path through that garden. A useful safe gap should outlive one generic stagger. |
| Aurelia | Wind lanes/wall mixed with charge, crescent and stars. | Use wind to choose a landing and approach; preserve control and a walking refuge. Subtract redundant fan attacks when the signature works. |
| Pillar | Grid/collapse mixed with charge, quake and shell burst. | Move or release cover to select protection and a route through the masonry. Preserve visible solid geometry; do not erase the entire grid with one peg. |
| Tess | Tether/web grid mixed with cards, seed burst and nova. | Free a bound route or cut a connection to recover movement while the remaining web stays meaningful. Remove unrelated projectile families once that loop carries the encounter. |
| Bongle | Storm grid/echo cross mixed with orbit, charge and shells. | Answer readable beats and choose which echo to silence, with visual timing sufficient on mute. Develop rhythm, not another delayed identical burst. |
| Mallow | Safe light mixed with grid, dash, stars and orbit. | Relocate or grow shelter to choose the next safe route; keep world actions and no inventory task. Differentiate shelter placement from Nell's carried consumable cover. |
| Atlas | World grid/collapse/wind/charge/quake/storm/nova sampler. | Rebuild useful ground through successive regional changes. Combine a small number of learned spatial decisions; subtract attacks that do not support that identity. |
| Meridian | Eight familiar attack families in a rotation, with dual ward. | Deliberately remix learned answers in paired phrases, including their actual payoffs. A rotation of graphics alone is not the promised final demonstration. |

## What this batch changes and what remains

Nell breaks the shared payoff template in shipped code. Her orbit comes first so its carried defense has an immediate use in the star shower. The single comet introduces a separate approach/escape decision. Native interception keeps terrain, lifetime, arming, ownership and moving swept contact; unused planets are replaced at the next orbit and never travel or reload with the player. Light still answers the original seven-point ward. Her health, movement and ordinary shooter rules remain; her former final radial nova is intentionally replaced.

The previous nine local challenges remain playable and their earned records survive. Their different trigger actions are real, but they frequently share a 1.6-second global opening and an added follower. They remain **partial** against this stronger identity requirement. Next implementation is Tansy's card-passage consequence, then Queen's usable mire channel, alongside the remaining authored roster. Read `PLAYER-EXPERIENCE-RULES.md`, the application ledger and ordered roadmap; this audit does not replace the pacing, four specialist roads, collecting, sustained build or reward obligations.

Automated verification establishes actual input, lifecycle, collision and victories. Family playtesting still decides whether those distinct decisions are readable and enjoyable over a continuous campaign.
