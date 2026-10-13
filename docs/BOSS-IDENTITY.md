# Distinct guardian experiences

October 13, 2026. The family's direction is that every boss should feel unique. This is an implementation audit of all 19 registered guardian definitions and the recent responses, not a human verdict that they already do. Shared controls, readable warnings, help, retry and reward bookkeeping are useful. Shared optimal play is the problem.

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
| Queen | **Implemented:** break nearby landed crust to leave fixed lily ground through her continuing court. Her bubbles/reeds cannot hurt feet on it; other owners and pressure elsewhere continue. Standard bubbles precede reeds; generic radial nova leaves her rotation. | Preserve positional choice, native Dark veil and ferry/Pearl returns. Rippling Mire reuses the ground through a following volley and remains partial as a richer variation. `MIRE-CHANNEL.md` records evidence. |
| Knight | Read charge/sweep, ring a raised shield; optional following crescent. | Retain shield timing. Develop facing and flanking as the duel's decision rather than the same prop/stun loop. |
| Mira | Prepare a reflector and place it for an actual returning blade; Double Return repeats throws. | Returning flight and placement are genuinely distinct inputs. Preserve them; review the blanket cancellation payoff and whether two returns add a new decision. |
| Bram | Pop a stomp plug or prepare an old root and guide the actual burrow through it. | Preserve baiting a committed route. Give the old route a lasting arena use instead of relying only on a stagger. |
| Vesper | Uncover light, then let her committed dash enter it; following waltz. | Develop moving between lit shelter and open dancing ground. Avoid the same prepare/intercept/stun payoff as Marlo. |
| Tansy | **Implemented:** splash a landed pie to choose an actual gap in the following cards, then walk through it toward her. Other pies/lanes continue; no global cancel or bespoke stagger. Standalone cards/nova are removed. | Preserve the chosen route through Card Encore. Its second fan remains a repetition-based variation and is still partial under this stronger rule. Continue continuous-session/family readability review. |
| Marlo | Open a gate for an actual current catch; perpendicular following tide. | Develop choosing and carrying a channel through tide geometry. Preserve the reachable refuge and actual-current ownership; do not simply add a third tide. |
| Sumi | Strike paper, then make a real outward step; crossing follower. Charges/crescents overlap Knight. | Keep follow-through as her identity. Develop unfolding a route through cuts rather than every success erasing the whole sequence. |
| Nell | **Implemented this batch:** endure the safe orbit to earn three carried planets; actual incoming shots spend them while Nell stays active. A single committed comet replaces her generic nova. | Position, carry defense, then choose the approach or walk clear of the comet. No attack prop, ward bypass, blanket cancellation or bespoke counter stun. Standard chosen practice only; do not clone a following-comet mode. |
| Grandmother Briar | **Implemented locally; release verification pending:** clip a planted pink bud to keep its bed absent throughout subsequent blooms in that phase. Other flowers and Briar continue; ordinary walking gaps and the clear middle remain. | Alternating sides and rolling blooms develop the fixed chosen path. Acorn collection and Hedgehare’s useful outing/return precede explicit standard practice. `BRIAR-PRUNING.md` records evidence. |
| Aurelia | Wind lanes/wall mixed with charge, crescent and stars. | Use wind to choose a landing and approach; preserve control and a walking refuge. Subtract redundant fan attacks when the signature works. |
| Pillar | Grid/collapse mixed with charge, quake and shell burst. | Move or release cover to select protection and a route through the masonry. Preserve visible solid geometry; do not erase the entire grid with one peg. |
| Tess | Tether/web grid mixed with cards, seed burst and nova. | Free a bound route or cut a connection to recover movement while the remaining web stays meaningful. Remove unrelated projectile families once that loop carries the encounter. |
| Bongle | Storm grid/echo cross mixed with orbit, charge and shells. | Answer readable beats and choose which echo to silence, with visual timing sufficient on mute. Develop rhythm, not another delayed identical burst. |
| Mallow | Safe light mixed with grid, dash, stars and orbit. | Relocate or grow shelter to choose the next safe route; keep world actions and no inventory task. Differentiate shelter placement from Nell's carried consumable cover. |
| Atlas | World grid/collapse/wind/charge/quake/storm/nova sampler. | Rebuild useful ground through successive regional changes. Combine a small number of learned spatial decisions; subtract attacks that do not support that identity. |
| Meridian | Eight familiar attack families in a rotation, with dual ward. | Deliberately remix learned answers in paired phrases, including their actual payoffs. A rotation of graphics alone is not the promised final demonstration. |

## What this batch changes and what remains

Nell breaks the shared payoff template in shipped code. Her orbit comes first so its carried defense has an immediate use in the star shower. The single comet introduces a separate approach/escape decision. Native interception keeps terrain, lifetime, arming, ownership and moving swept contact; unused planets are replaced at the next orbit and never travel or reload with the player. Light still answers the original seven-point ward. Her health, movement and ordinary shooter rules remain; her former final radial nova is intentionally replaced.

Tansy now also breaks the shared payoff: a landed splash chooses a real card passage while the other dangers continue. The standard show teaches pies before cards in every phase, removing its unrelated standalone fan/nova. `STAGE-CARD-PASSAGE.md` records the chosen design and evidence.

The previous nine local challenges remain playable and their earned records survive. Seven still frequently share a 1.6-second global opening and a follower. Queen’s and Tansy’s standard consequences are distinct; their following volleys remain repetition-based variations. These remain **partial** against the whole-roster requirement. Queen’s usable mire channel now also replaces her global opening. Briar’s lasting garden path is now implemented locally with native/input evidence; publication verification is pending. Aurelia’s chosen landing is being prepared in an isolated checkout while Briar’s release code remains frozen. Continue the remaining authored roster under `BOSS-PROGRESSION-PLAN.md`. Read `PLAYER-EXPERIENCE-RULES.md`, the application ledger and ordered roadmap; this audit does not replace the pacing, four specialist roads, collecting, sustained build or reward obligations.

Automated verification establishes actual input, lifecycle, collision and victories. Family playtesting still decides whether those distinct decisions are readable and enjoyable over a continuous campaign.
