# Player experience principles

October 9, 2026. Apply this contract when changing the 2D game. The parent's playtest through Mire Queen takes priority over the previous reward-audit queue. Ben wants readable text and NPC quests; the game should feel friendly, purposeful and playful.

## How design feedback becomes game-wide work

October 8 direction: interpret the intent behind the parent's advice, generalize it into this shared contract, and apply it to existing content as well as future work. Examples illustrate a problem or opportunity; they are not the boundaries of the request or compulsory literal mechanics. A tar-pit example implies interactive, recoverable restrictions and interesting decisions across combat, equipment and traversal. It does not require tar in every fight.

For every substantial design observation:

1. Record the desired player experience and the underlying principle here. Preserve earlier requirements; reconcile actual conflicts explicitly. Do not create a fresh competing rulebook for each feature.
2. Scan the affected old and new systems: early campaign, later regions, optional content, rewards/builds, world interactions, feedback, saves and all supported inputs. Identify shared code and authored exceptions. An illustrative prototype is not whole-game application.
3. Implement safe shared improvements and backfill authored content in reviewable batches. Add uncovered work to the existing roadmap with a concrete next action. Keep one active priority and preserve the remaining obligations.
4. Track each area as **verified**, **partial** or **queued**, with evidence and the next gap in `DESIGN-APPLICATION.md`. A documented rule, a registry check and a human campaign playtest establish different things. Do not mark an area complete because one example works.
5. Revisit the ledger whenever a shared change or new system lands. Later work must obey the accumulated principles, and older content remains part of the improvement queue. Report what changed in play and what still needs implementation.

## General experience contract

| Principle | Intent and application |
| --- | --- |
| Preserve the pleasure of playing | Responsive movement, useful abilities, exploration and short retries are the baseline. Put difficulty and tradeoffs in interesting choices and recoverable situations. Audit permanent movement taxes, resource starvation, compulsory menu work and long repeated walks. Apply this to ordinary enemies, bosses, gear, roads and optional runs. |
| Turn danger into agency | A threat should offer a readable response with a satisfying consequence: interrupt, reposition, rescue, create useful ground, protect an ally or open a strike. Use multiple viable answers. Added complexity must give the player more to do with their tools, rather than merely more punishment to endure. |
| Teach through useful play | Introduce a system through a meaningful world action, let the player enjoy it, then develop and combine it. Availability follows introduction. Every form and upgrade needs an immediate use and space to discover its value; mastery records actual use. Apply this beyond the opening to Marks, Legends, recipes, items and optional challenges. |
| Keep a coherent purpose | Give the player one clear chosen next action, understandable causes and consequences, and a physical route. Optional requests require acceptance. Avoid quest floods, disconnected chores, abrupt travel and unlock cascades throughout the campaign. |
| Make people feel like people | Dialogue conveys an identifiable person's feelings, concrete stakes and a useful next action. Warm reactions acknowledge the player's help. Apply the prose rules below to later guardians, signs, menus and return conversations, not just opening NPCs. |
| Make the world the main interface | Common configuration and collection actions belong in legible world objects and existing quick controls. Menus remain an accessible fallback. Show the state and effect where the player acts; minimize reading, screen clutter, sorting and repeated setup. Themed controls must remain discoverable. |
| Preserve a complete adventure for every skill level | Help supports learning and experimentation without withholding story, power, forms or treasure opportunities. Encourage improvement through demonstrated success, interesting optional variations and personal expression. Players choose scaffolding; never silently promote them or shame a helped clear. |
| Make presentation trustworthy | Text fits, warnings match collision, targets stop moving when committed, and helpers hold a readable position. Effects and scenery yield to actors and hazards. Sharp text and cute art serve comprehension on touch devices and TV, not only screenshots or a PC viewport. |
| Make progress feel earned and lasting | Reward purposeful actions, give their consequences room to register, and preserve them across saves and revisits. Collection pays once. Avoid meaningless grind, random inventory churn, slot clutter and back-to-back priorities that bury an achievement. |
| Say only what helps | Use plain, friendly American English. UI copy tells the player what an action changes or how to proceed. Show self-evident state visually; remove filler assurances and unexplained thematic claims. The same standard applies to future interfaces. |

`DESIGN-APPLICATION.md` is the current coverage ledger; `CLOUD-ROADMAP.md` orders implementation. Feature specifications explain how they satisfy this contract and cannot limit it to their illustrative mechanic.

Combat/build application: attach an equipment price to a meaningful choice about its tool, rather than making every journey or basic control worse. Preserve a zero-mana basic answer and verify it at the real input boundary. Threats commit to a readable place; successful interruptions buy an observable opening. Incapacitation must actually suppress the affected actor's body attack, while already-released danger retains its visible rules. Audit these contracts in ordinary creatures and optional runs as well as guardians. `COMBAT-AGENCY.md` records the first equipment/ordinary-enemy backfill and its remaining gaps.


Guardian counter application: separate **personal learning**, **chosen encounter rules** and **reward ownership**. Recognize an actual action even with help; record a clear only after victory; pay a durable gift once. Preserve the player's useful free answer across forms and resources. A richer rematch should develop a response already enjoyed in the standard fight, with an explicit local choice rather than a global difficulty preference silently changing optional runs. Give practice a small lasting world consequence, not a second progression currency or mandatory quota. `TREANT-ROOTS.md` records the first implementation; later encounters must be authored and verified individually.

## Benchmarks consulted

These are document benchmarks, not timed playtests of other games.

- [Christian Nutt’s interview report with Nintendo’s Koichi Hayashida, Game Developer: The secret to Mario level design](https://www.gamedeveloper.com/design/the-secret-to-i-mario-i-level-design). Hayashida describes introducing an idea, developing it, surprising the player with a variation, then letting them demonstrate what they learned. Use that sequence in encounters, rather than counting arbitrary minutes or demanding repeated grinding.
- [Nintendo: Ask the Developer, Super Mario Bros. Wonder, Part 3](https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-11-super-mario-bros-wonder-part-3/). The developers discuss discouragement when difficulty prevents seeing the game, player choice, and Talking Flowers that respond at the right moment and provide companionship. Copy the purposes: generous practice, optional challenges, timely emotional reactions. Avoid overwhelming incidental speech.
- [Stardew Valley Wiki: Quests](https://stardewvalleywiki.com/Quests). Story requests teach actions and lead to later requests; Getting Started precedes Raising Animals, and Introductions precedes How to Win Friends. Item requests account for unlocked access. Borrow causal sequencing, named neighbours, accept/return/reward structure and readable journal details. Do not add farming or timed daily obligations.

## Progression rules

1. Give the player a person, a problem and a reason before a new mechanic. Parcel is worried about people awaiting flour, a letter and a birthday present. Roots have blocked their route; the Treant closed it to protect travelers and made things worse. The Queen took the harbour pearl for her court. These actions explain the current danger without a lore lecture.
2. Keep one recommended task. Optional requests need an explicit choice. Future people can be present without all showing quest markers. Finishing one promise can recommend the next; never auto-accept it.
3. Every unlock needs an immediate use and a stretch to enjoy it. Rat fits the culvert, then poisons three distinct briars on the mill bank; that earns its first mastery level and Fester before the crest is accessible. If the briars were cleared in another body, the straw post accepts native Bite poison with normal expiry so the lesson cannot be missed. Knight practices its shield against committed watchmen and continues using it on the delivery road. Wizard arrives for the marsh's dark ward after delivery and Knight practice. More forms and Manyfold wait for the harbour promise's return.
4. Mastery requires wearing its form. Borrowed arts still support combinations, but never passively level their source form or other unlocked forms. Choosing another form’s lesson changes into that form. Preserve every previously earned level, star, claimed form, reward and request.
5. Tune the first lesson around authored opportunities. Three authored briars and three well-timed parries are concrete learning; respawning foes to meet an inflated opening counter is not. Later bodies usually learn their second art in six native contacts; preserve range, damage-type, group, combo, status and ward conditions in specialization. Do not reduce every later specialization to the same easy counter.
6. Introduce systems in the world before access. The opening explains form changing, Ser Pending explains mixing at the bell, and the delivery's return introduces home and the need for dark magic. Optional local reports wait for the harbour return, a plain Home explanation and a deliberate choice; old introduced reports retain access. The numbered controls guide is available on request; it does not run over the adventure automatically.
7. New state transitions need fresh-start and partial-save coverage. A published-host title selection is part of startup, not a localhost-only test. Existing earned abilities and adventures must remain usable. New adventures use opening version 2; normalized version-1 and pre-opening adventures retain introduced-system access. Newly earned Wizard ownership never bypasses the harbour return.
8. Compulsory progression must reward a varied set of familiar bodies and chosen favorites. It must not require completing the roster after passive mastery is removed. Sunstep opens at 18 stars, the coast at 22; Dragon needs four learned earlier shapes and one practiced advanced calling. The final portfolio asks for eight bodies at level 3 and three favorites at level 5, alongside all six World Marks and Meridian's actual defeat. Use shared `G.PACING` values and preserve optional depth. See `PROGRESSION-REVIEW.md` for the complete registry audit, native evidence and remaining session review.

9. Make ordinary chapter travel physical. Friends explain the route while the player stays in place; authored roads join neighbouring maps. A small-form passage needs visible terrain and actual walking, with its useful action on the far side. Guidance must continue forward once inside, and the same path must provide a safe return. Preserve saved accomplishments and once-only gifts. See `CONNECTED-OPENING.md`.

10. Give a chosen promise's good-news return its own moment. A ready specialist-road or Worldwake-trail request can hold the next discovery until the player returns; Journey's Set aside releases it deliberately. Do not turn unaccepted requests into gates, erase waiting echoes or add counters for this pause. Signature-action guidance should demonstrate a body's practical use, then yield to its existing lessons. See `WORLDWAKE-NEIGHBOURS.md`.

11. Make common play menu-optional. Use physical help switches and introduced field selectors; pictures and a short benefit/price precede exact values. Looking never equips. Default help stays off, choices persist, and rewards stay equal. Reuse Forms/Quick Mix rather than a permanent HUD button per system. See `MENU-OPTIONAL.md` for the shipped lantern/pocket foundation and the remaining conversion.

## Difficulty and skill growth

Difficulty must add an interesting action, an active counter and a satisfying payoff. Preserve ordinary walking speed, responsive controls, clear warnings and nearby retries. Any temporary restriction must be short, local and breakable, with an accessible fallback when a form lacks the preferred counter. Standard fights also need these moments; children's play must be as joyful as adult play.

Heart recovery, guardian help and future authored challenge patterns are independent voluntary choices. Never promote a player automatically or extinguish help. Keep all power, forms, stars, story and treasure pursuits available with help. Encourage a rematch after a demonstrated success, with a friendly invitation and visible personal accomplishment; no difficulty shame, automatically accepted challenge quests or repeated nudges. Harder patterns must earn their appeal through richer play. See `GUARDIAN-CHALLENGES.md` for the family ladder, each guardian's proposed counter, reward contract and implementation gates. Treant’s Branching Roots and Queen’s Rippling Mire are implemented local rematches; the remaining authored patterns are queued.

An accessible counter can clear pressure and open an attack window while preserving the encounter’s distinct tool requirement. Do not make every response bypass every ward. Keep a free answer to temporary restrictions, and teach the guardian’s own ward through previously introduced arts. Derive any local movement restriction from the active prop and the player’s actual feet; leaving, breaking, expiration, phase changes, defeat and travel must clear it without a lingering or stacking penalty. Dash movement and its real resource price stay intact.

Preparation and practice need quiet geography. Place neighbouring creatures on purposeful routes and hold their posts outside attention range; do not let random wandering overwhelm a camp or the next guardian’s teaching beat. An ordinary mishap before engagement must not count as a failed guardian attempt. A chosen rematch waits in its own court and starts through walking and interaction, with independent help and a clean nearby retry.

## Prose rules

Use American spelling. UI footnotes must offer useful, actionable help. Empty/carried equipment belongs in visible object state; omit generic reassurance about browsing and other self-evident interactions.

Write spoken English that a child can follow on first hearing. Every story/request exchange should answer: who is speaking, what they want, how they feel, and what the player can do now.

- Start with a concrete observation or feeling: “I’m worried about the late boat,” “My cinnamon recipes!” or “The bridge is open!”
- Give a specific cause and stake. Name the person, place or object. Explain why it matters before describing a mechanic.
- Prefer short sentences and contractions. Keep one new idea per dialogue page. Split important instructions into pages so they fit; do not squeeze text into tiny type.
- A metaphor or joke may add warmth after the point is clear. No string of aphorisms, detached diagnosis, abstract “answers/questions/promises” or narrator-style speeches in ordinary conversations. Never make a child translate poetry to find the task.
- Let characters disagree, worry, celebrate and change their minds. Guardians have understandable motives and a readable recovery after defeat. Keep setbacks gentle; nobody shames the player for struggling.
- Mechanical instructions name the actual action and target. Keep ability names identical to the interface. “Bite each briar, then duck away while the poison works” tells the player what to try; “become the next answer” does not.
- Return dialogue remembers the help and names its consequence. Thank-you gifts still use the durable ground/collection contract. No invented reward or automatic completion.

| Speaker | Voice and emotional anchor |
| --- | --- |
| Patchling | Curious, eager to help; asks ordinary questions and makes simple plans. |
| Pebble | Friendly companion; attentive to worried neighbours, practical encouragement and occasional snack jokes. |
| Parcel | Busy courier who cares about recipients; relief after each delivery, concrete route knowledge. |
| Ser Pending | Protective and a little nervous; demonstrates shield timing and cheers practice. |
| Errata | Interested archivist; worries about travellers losing the night road, explains one observed event, feels responsible for the old map. |
| Mayor Maybe | Welcoming, worried about residents; mild administrative humour after a clear point. |
| Brindle | Warm baker attached to family recipes; affection, loss and delight expressed through real kitchen details. |
| Mara | Quiet affection and anticipation for her sister; ordinary domestic details. |
| Pip | Excitable child; direct questions and imaginative play with Thimble. |
| Moss | Gentle groundskeeper; cares about neighbours visiting and sharing baskets/soup. |
| Oracle Probably | Gentle and hopeful; worries about wet crossings, celebrates ordinary good news before adding a small prediction joke. |
| Provisional | Curious, careful road-lamp researcher; worries about night travellers, offers a warm supper. |
| Treant | Frightened protector who shut the road; admits his mistake and lifts the branches. |
| Mire Queen | Proud, possessive of her court’s light; reluctantly recognizes the boats need it. |
| Eclipse Knight | Anxious night guard; fears losing the last watchfire, admits he frightened travellers, offers a friendly practice rematch. |

## Guidance rules

Essential task text wraps completely in a fixed, bounded dock. Full purpose, route and controls remain available in Journey. Never silently truncate an essential instruction. Show one current mastery lesson; future lessons belong in the journal.

Incidental NPC speech waits for the player to stop, fades in, and uses stable authored selection. A moving camera must not reshuffle speakers or flicker speech over the player. Quest attention markers can remain in the world; the actual conversation is available through the normal interaction.

A reward/notice chooses a clear position once per lifetime and layout. If an actor needs that space it yields, waits for a settled clear view and returns to the same position. It must not hunt around the screen every frame. Direction arrows stay at the edge for offscreen targets; onscreen targets use the existing world marker, rather than teleporting the screen helper onto their heads. Keep touch corners and controller controls clear.

Validate complete painted text, camera movement, actor clearance, title selection, native reward collection, reloads and legacy ownership. Chromium TV-bridge checks are evidence of layout and input integration; physical Android TV distance, Safari and real controller performance still need device checks.

## Validation for this batch

The full Node run completed with 584 passed, zero failed/skipped cases. Final delivery/dialogue follow-ups passed 11 cases; the final touch/HUD/clearance follow-up passed 20 cases. These overlap the full run and are not additional unique coverage. Earlier integration failures exposed outdated cross-form assumptions, moving-layout fixtures and missing native gift collection; the final cases exercise the revised ownership and actual movement/collection paths.

`node tools/review-early-experience.cjs` passed all four touch/controller × HD/base cases. It serves the real repository at a simulated published origin, selects the native title/save slot, checks the arrival's real painted prose, uses authored enemies and native attacks, approaches Form Echoes, collects the crest, reloads an actual save and measures complete task text over camera movement. All 24 final captures and both review sheets were inspected. Touch buttons advertise forms/mixing only after introduction, and the same form's buttons refresh when mixing becomes available.

Encounter fixtures control positioning/AI and the long-task layout fixture removes actors; separate native tests cover real actor clearance and recipe/Queen/Pebble returns. This proves integration and bounded presentation, not elapsed campaign pacing, unmodified fight balance or physical Android TV/Safari performance. The subsequent full-registry/post-harbour audit is recorded in `PROGRESSION-REVIEW.md`; continue the regional emotional-dialogue and continuous-session review next.

Reproduce logic with `node --test --test-concurrency=6 tests/*.test.js`. Browser review requires developer Playwright and Chromium (`CHROMIUM_EXECUTABLE_PATH` may override the binary). The scenario's default capture directory is `/tmp/nq-early-review`; create review sheets only after all four source cases pass with `node tools/render-review-sheet.cjs /tmp/nq-early-review /tmp/nq-early-sheets`.

## Regional application

Ridge and Starfall now apply the same contract to existing activities: a concerned person, useful advice, an explicit promise, actual victory/lens work, ground collection, return and a changed later conversation. Pending recommends Errata; Errata explains the eastern road. These are recommendations, not new mandatory gates. Dark attacks, the crescent recovery window, any-order lenses and once-only gift payouts keep their native rules. See `REGIONAL-PROMISES.md` for the authored entry check and controlled chapter evidence.

Keep incidental report counts and map-entry lists on the Atlas. Optional background activities must not repeatedly announce extra errands over an accepted promise. Their existing completion feedback remains after deliberate introduction.
