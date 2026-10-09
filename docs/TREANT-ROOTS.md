# Treant roots and the guardian fire

October 9, 2026. Implements the first authored encounter in `GUARDIAN-CHALLENGES.md`. The shared experience contract remains `PLAYER-EXPERIENCE-RULES.md`; this release covers Treant, not the entire guardian roster.

## What changes in play

In both the opening Heartwood clearing and the original Mistwood encounter, a root strike leaves a cracked root at the player's committed position after the primary strikes finish. Any damaging art snaps it. The root tugs the Treant off balance, cancels his pending danger and creates a 1.6-second opening. The tug chips one point of his existing blunt ward; it does not directly damage his health. Walking clear remains viable. The prop lasts 3.2 seconds and neither blocks movement nor inflicts a status.

All damaging arts work instead of requiring the proposal's illustrative blunt attack. This protects a free zero-mana answer across bodies, including Knight's sharp basic. The actual guardian ward keeps its existing type rules; the root's tug is blunt. The prop grants no hit/kill/mana/guard/mastery credit. A real ward break keeps its normal event and opening.

One harmless cracked root stands beside the entrance. Snapping it makes space for a picnic bench and a little bird, saved for later visits. There is no new quest or repeated quota. The Treant now speaks as a worried road keeper: he blocked the thorns but stranded Parcel's cart, apologizes, and invites friendly practice after the road reopens.

Heartwood now has a fire in clear space west of the arch, both existing help lanterns and a camp bag. After the Crown is collected and the opening return has had its space, the Treant becomes a friendly resident. An explicit interaction starts a full-strength rematch in the original northern clearing. The player stays at the fire and walks north to engage; no encounter teleport.

## Voluntary variation and recognition

A genuine combat root counter unlocks a crossed-branch lantern at this guardian's fire. It starts unlit. The Treant offers the branching trick once; there is no compulsory choice, automatic setting change, quest or repeated attention call.

Lighting **Branching Roots** adds one delayed circle at the same already-committed target after the primary strike. Snapping the first cracked root cancels the follower. Stepping clear also works, with recovery after the entire phrase. Later phases retain the familiar spread; the new twist remains the following root. Guardian help lengthens its warning too.

This local lantern snapshots only an explicitly chosen Heartwood rematch. It never changes the first campaign encounter, original Mistwood fights, Manyfold or Expedition patterns. Standard counters apply to reused Treants without silently opting a run into the alternate rules.

Heart recovery and Guardian help stay independent. All four help combinations are valid. Story, Crown, stars and power have identical availability. A garland at the fire recognizes the counter in either mode, with or without help. A branching clear and best counter count are saved as personal accomplishments, described at the resident's prompt. A rematch thanks the player; the existing owned-trophy consumer prevents another gift or star payout.

The new `guardianChallenges` adventure state normalizes conservatively: no old save opts into branching; an enabled preference requires demonstrated counter knowledge. Interrupted fights record no clear. Travel/reload retires the attempt, keeps choices and returns the friendly resident. Knockout follows the existing nearby outside retry and restores full hearts; another explicit invitation starts a fresh boss. Phase changes, stagger, death and travel clear old roots and threats.

## Verification and limits

`tests/treant-challenge.test.js` exercises actual free A input for the practice and combat root in Patchling, Knight and Cragback; all three Treant phases in both maps; committed positions; ward-only payoff; delayed follower/fallback/recovery; phase/death/travel cancellation; optional preference/snapshot; first-return protection; record normalization/slot isolation and knockout/retry. Existing opening and guardian ground-gift tests retain the campaign reward contract.

`tools/check-treant-live-combat.cjs` completes 16 original-AI rematches: Patchling and Cragback, standard and branching, each with all four help combinations. Native movement and the free A art handle full original health/wards and all three phases, starting at zero mana. No boss health/ward edits, invulnerability overrides or respawns. The runs finish in 22.10–26.87 simulated seconds with six or seven counters and one or two hearts of damage. Actual boss hits replenish mana normally. Owned Crown/star payout remains unchanged; native worn-form mastery still pays its normal lesson stars. An additional original first Heartwood fight finishes in 24.40 simulated seconds with seven counters and no damage, then physically collects the genuine Crown/star bundle and retains first-return protection. Earned chapter/body/ownership and the initial clearing position are controlled checkpoints, not a continuous new-game campaign. This scripted counter strategy does not establish human difficulty or every mixed build's balance.

`tools/review-treant-roots.cjs` covers touch/controller × HD/base: native A practice/counter, painted root/warnings/tug, complete friendly invitation, physical local lantern switching, saved choices, explicit rematch and native cancellation of the following root. Chapter/position/post-victory ownership are controlled fixtures; the workflow does not fabricate a victory as balance evidence. Camp placement and all final captures are reviewed; the old straw-post renderer now excludes root scenery instead of painting a second prop on it. Existing menu-optional/approach workflows verify shared interaction priorities and help access after integration.

The final complete regression passes **667 tests**, zero failed/cancelled/skipped (561,300.63809 ms). Thirteen new cases overlap that run. Twelve touch/controller × HD/base workflows pass: the new Treant flow, retained menu-optional flow and guardian-approach flow. The new flow produces 52 captures; retained workflows produce 138 more. All final Treant views are inspected on four sheets, with full-size invitation, camp, practice and counter views. The late camp placement/straw-post rendering refinements pass their focused checks and final browser flow. Physical Android TV distance, iPad Safari and a family playtest remain open. Mire Queen, Eclipse Knight and all later bespoke variations remain queued; shared guardian timing already applies throughout the roster.
