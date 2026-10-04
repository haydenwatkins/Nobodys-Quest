# Campaign progression after worn-form mastery

October 4, 2026. Review of the shipped 2D registry after the parent's Mire Queen playtest. The numerical audit covers **24 forms, 96 mastery lessons, their unlock dependencies, campaign road gates and repeatable ward sources**. This is an implementation review with controlled native encounters, not an uninterrupted or timed campaign playthrough.

## Findings and changes

Removing passive mastery exposed compulsory practice that the older campaign had distributed across borrowed builds. It also left the post-harbour fourth-form requirement able to unlock Frog immediately after Ranger's discovery.

| Milestone | Before this review | Revised behavior |
| --- | --- | --- |
| Frog in a version-2 adventure | Nine stars and four claimed forms could make it ready when Ranger was claimed | Same requirements, plus Ranger level 2; four distant native hits earn Triple Shot first |
| Dragon | All eight earlier shapes at level 3 | Four earlier shapes at level 3, plus Alchemist **or** Stormcaller at level 2 |
| Sunstep / Worldwake entrance | 24 stars | 18 stars |
| Western coastal return | 28 stars | 22 stars; Atlas and actual portal agree |
| Final portfolio | All 23 earlier shapes at level 3, six at level 5 | Eight shapes of the player's choice at level 3, three favorites at level 5 |
| Final victory | All six World Marks and defeat Meridian | Both remain required; opening the road never awards the Spark |
| Later practice quotas | Many first lessons required 15–24 contacts; some group challenges required four simultaneous targets | Usually six first contacts, shorter repetitions and at most three simultaneous targets |

The previous final portfolio structurally required at least `23 × 2 + 6 × 2 = 58` lesson completions. The revised portfolio requires at least `8 × 2 + 3 × 2 = 22`. Specialists also count toward breadth. Neither number includes guardian fights, trophies, route travel or prerequisite access; neither estimates elapsed playtime. The whole roster remains available for optional experimentation and mastery.

Frog still needs a second lesson before Alchemist's path opens. Dragon still needs practice in an advanced calling. The guardian sequence retains its trophies, marks and parent-body levels. The western gate leaves room for one chosen lesson after entering at 18 stars and collecting the first three World Marks. Existing native journey tests exercise that 18 → 21 → 22 sequence, rather than merely checking map constants.

## Lesson calibration across the roster

The first owned-body lesson now asks for four distant Ranger hits, four Wizard defeats, or six native basic contacts in the other later forms. Rat's three poison targets and Knight's three timed guards retain their distinct authored teaching. Patchling's sign and Slap opening remain intact.

Seventy-one lesson quotas changed. Range, matching damage types, timing, combo steps, status application, healing, alignment and group requirements still use the original native events. Repeated contacts count as contacts; the text now says “Land six hits” where the event does not require six different enemies. A first encounter should teach the body's attack and earn its second art. Further specialization asks for another use of that art or a different combat condition, rather than a long tally of the same contact.

The stationary spawn audit found sparse groups on authored roads. AI movement can bring foes together, so spawn spacing is not proof that a group lesson is impossible. Four-target specialization checks now ask for three; repeated demonstrations are shorter. Two-target and third-combo challenges remain distinct. Repeatable Blunt wards exist on Bones, Pebblebeasts, Tide Crabs and Cairn Walkers; Light on Wisps, Star Motes and Bell Moths; Sharp on Brutes; Dark on Shades and Loomlings. Guardian wards are additional opportunities. Native combat regression covers group arts, third strikes, alignment, status attribution and ward breaks.

Ranger, Frog, Alchemist, Stormcaller and Dragon now receive a short companion instruction when their actual claim occurs. No new quest is accepted, currency introduced or scene counter saved. The six chapter summaries and recaps name concrete road problems; the later scenes explain Parcel's stranded post, sleeping Worldbearers and Meridian's closed crossings. The Form Lab, route guidance, finale sign and shared unlock hints agree with the revised rules.

## Save and build contracts

- Mastery still belongs to the worn body. Borrowing an art changes combat options, not its source body's level.
- Claimed forms, completed quest IDs, stars, rewards and partial counters remain. Quotas use existing IDs; an older partial count completes on the next qualifying native action and pays once.
- Version-1/pre-opening adventures keep Frog's original eligibility. New adventures require Ranger practice. Already claimed Dragon stays available.
- Dragon's optional-count rule is validated; a missing count retains the workshop's existing all-earlier-forms behavior. Finale goals cap to a genuinely edited smaller roster.
- Full-roster coverage remains available in the snapshot; it is separate from the chosen breadth goal. Story guidance continues to specialization once eight bodies are learned, even when optional bodies are missing.
- Shared `G.PACING` values drive Worldwake, coast and final portfolio gates. No additional save format, engine or player-facing configuration is needed.

## Validation and reproduction

Run `node tools/audit-progression.cjs` for the current compact registry report, or add `--json` for every unlock and lesson. It reports invalid forms, dependency cycles, portfolio minimum and explicit group size without reading sprite sheets into the conversation. An optional prior form-array JSON compares quotas. The reviewed registry reports 24 valid forms, 96 lessons, no dependency cycles or workshop errors, and a largest explicit group of three.

`tests/post-harbour-pacing.test.js` exercises native distant Arrow projectiles, Tongue Lash, Wingbeat, borrowed-body exclusion, Dragon's chosen breadth and legacy partial-save payout. Finale and route tests exercise the actual portal gate, six Marks, missing optional bodies, native road crossing, specialization guidance and Spark ownership. Existing Crest/parent-handoff scenarios use a genuinely smaller roster when that missing body must still be compulsory; full-roster optional behavior has separate coverage.

`node tools/review-post-harbour.cjs` serves the real repository at a simulated published origin and uses native title selection, touch or TV-pad input, combat, Form Echo claims, menu selection, Journey trail, portal movement and actual save reload. Chapter setup and stationary combat foes are controlled fixtures. Both art settings are exercised at 667×375 touch and 1280×720 controller. Default captures: `/tmp/nq-post-harbour-review`; build sheets after all four cases pass with `node tools/render-review-sheet.cjs /tmp/nq-post-harbour-review /tmp/nq-post-harbour-sheets`.

The final full Node regression passed **588 cases**, zero failed/skipped. Five final story/dialogue checks also passed and overlap that run. All four final browser cases passed; all **28 captures**, both review sheets and full-size portfolio views were inspected. Initial integration/full-suite failures exposed fixtures still assuming the old compulsory roster, gates and quotas; those scenarios retain their native assertions with appropriate new prerequisites. A browser fixture near the final portal correctly suppressed optional HUD cards for entrance focus; the rendered task check now occurs on safe ground farther away, then native movement crosses the actual gate.

Browser checks prove integration and layout in Chromium. They do not measure unmodified encounter difficulty, uninterrupted progression, iPad Safari performance or physical Android TV viewing distance.

## Remaining experience review

The numerical progression changes apply through the finale. The authored early opening and post-harbour discovery sequence have native encounter coverage; the six chapter scenes now provide a clearer shared world problem. This is **not** a completed rewrite of every regional NPC or side activity.

Next, review Ember Ridge / Starfall's local people and guardian transitions as one causal session: introduce the person's concern, practice the useful shape, return with news, then reveal the next reachable problem. Check optional incident cards, Legend/Mark/Manyfold introductions and reward announcements against one recommended task. Follow with a continuous automated session through Worldwake to measure time between useful unlocks, backtracking and repeated encounters. Keep optional mastery challenging without making compulsory progression a roster checklist.
