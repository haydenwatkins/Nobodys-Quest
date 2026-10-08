# Warm flowers and a little puppet show

October 8, 2026. Velvetwing and Pocket Trouper now have two connected road adventures, four permanent routes and two optional neighbour promises. Nine earlier specialists have bespoke world opportunities; Harborback, Foldstep Fox, Skylens Mapper and Hedgehare remain.

| Adventure | First use | Variation | Lasting expansion |
| --- | --- | --- | --- |
| Duskmallow Walk, north from Sunken Marsh column 27 | Mara misses the ferry families stopping for a chat. Close Blood Bites earn real healing near a shut dusk flower and wake a warm garden path. Full hearts work through the same ordinary overflow. | The second flower faces a sideways stream. Actual crowds support Crimson Waltz, bite recovery and the optional Blood Moon lesson. | Two garden crossings stay open for every shape. After Mara's thanks, cushions arrive by the picnic, with a tiny bat cushion on top. |
| Applause Bend, west from Greenfield row 45 | Pip worries his dragon puppet will miss its show. One Wild Card strikes a stage bell and ricochets around a real hedge to the other. | The upper pair bends the other way. Different real crowds demonstrate card follow-ups and Punchline Pie. | Two stage gate passages stay open. After Pip's thanks, the picnic puppet curtain opens to a little wooden dragon wearing a bow. |

Both roads retain an open longer route, camp, renewable picnic, safe stationary neighbour, note and distinct revisits. Their conversations connect the ferry families, Moss, Mara and Pip rather than adding anonymous objective givers. Requests wait for form ownership and explicit acceptance; existing Journey selection and Set aside preserve player choice. A selected completed promise leaves room for the good-news return before another discovery. No new forms, stars, currencies, dependencies, lesson quotas or save schema are introduced.

## Native action contracts

Dusk flowers are world props rather than practice actors. Only actual Velvetwing combat healing from Blood Bite or Blood Moon supplies a warmth pulse; a picnic, empty bite or borrowed bite in another body does not. The pulse respects distance and terrain. Healing restores missing hearts normally; extra healing retains the original Bloodskin armor cap and duration. The road never requires taking damage, restoring three hearts or staying below full health. Clearing all of a flower's original creatures also opens its path, so overlooking the healing opportunity or clearing in another body cannot demand a respawn.

Bell pairs use inert world mechanisms and the actual travelling card. Contacts live on that projectile, require Wild Card thrown by Pocket Trouper and a genuine ricochet, and cannot combine separate casts. The projectile retains its source body after a swap and is cleared on map exit with other transient projectiles. Terrain, target range and travel range remain native. Touch auto-aim recognizes the first bell; real creatures still receive ordinary aim priority by distance. Mechanisms cannot award hit, ricochet, kill, mastery or mana credit.

Both adventures extend recognized IDs in `roadworks.opened` and use the existing optional request engine. Drawing reads the state; it cannot repair anything. Repairs change per-save grid cells, not shared legends. The existing outing still needs any two worn-body lessons, two native arts and two separated encounter wins. Neither draining missing hearts nor a particular combo lesson becomes mandatory.

The actual TV browser review found a one-tile doorway that could catch the feet-box when the player approached slightly above center. Specialist openings and their approach lanes now span three tiles, with one central portal and original neighbouring exits preserved. The same geometry works at north, south and side entrances; it does not teleport the player or relax collision globally.

## Art and prose

A muted dusk garden and petal paving frame the flowers; a warm little theatre yard frames the bell pairs. Native authored art adds shut/open dusk flowers, quiet/ringing bells, petal paving, folded/full cushions and a closed/open puppet stage. All poses have HD/base art. The puppet has ears, an eye, a tail and a bow. Props yield over actors and do not obscure their bodies; text retains sharp Nunito.

Mara expresses missing her neighbours, then enjoys their long visit and remembers Pip's tiny cushion. Pip is excited about his show, worried the audience will leave and delighted that the dragon takes too many bows. Essential actions remain in the current task and notice when dialogue is skipped.

## Verification

- The final complete 2D regression run passes **636 tests**, zero failed, cancelled or skipped (`node --test --test-concurrency=6 tests/*.test.js`). The focused cases below overlap that run.
- Five native integration cases cover actual bite recovery/overflow, excluded picnic/empty/borrowed healing, wall-blocked warmth, already-cleared recovery, same-card bell contacts, source identity after swapping, actual traversable repairs, selection/save/return memory, unchanged payouts/outing quotas and read-only rendering in both densities. Six original-AI 12-second entry/note/camp pauses grant no free protection.
- The 21-case focused road/outing/campaign run passes. An added shared route case crosses all nine specialist entrances and returns with deliberately off-center feet boxes through native collision/triggers. Original coastal, Worldwake and finale routing is also checked.
- `tools/check-early-form-roads.cjs` completes all nine outings with native inputs, original health/wards/collision, normal mana/cooldowns and no respawns. Velvetwing takes 13 casts / level 3 / five defeats; Pocket Trouper takes 8 casts / level 3 / five defeats. Held-still enemy AI isolates lesson availability; these are not human duration or difficulty ratings.
- `tools/check-velvetwing-trouper-live.cjs` seeds 903 and 904 each finish both repairs, two lessons, two native arts, separate encounter victories and NPC returns with original AI and no knockouts or respawns. Velvetwing genuinely wakes both flowers with healing, restores one missing heart and generates four hearts of ordinary overflow while clearing twelve foes. Trouper clears eight real foes. Scripted simulation duration is 36 / 28 seconds respectively. These are bounded newly-owned-form checkpoints, not trial acquisition or a fresh timed campaign.
- `tools/review-early-form-roads.cjs` passes four final touch / actual Android TV pad bridge × HD/base cases at 667 × 375 / 1280 × 720. The 104 captures cover full painted concerns/choices/thanks/revisits, native repair inputs, walked crossings, actual save reboot, Journal return, saved picnic changes and physical exits. All eight story/world sheets and selected full-size phone/TV dialogue were inspected. Earned protected checkpoints and stationary foes isolate input/save/layout; the live simulations above cover original AI separately.
- Four additional saved-consequence browser render cases pass. All eight full-size dusk-garden/puppet-stage views and the complete five-prop × two-pose × two-density sheet were inspected. These isolated scenery fixtures clear actors for art review, rather than proving combat progress.
- Progression audit retains 24 forms / 96 valid lessons, no dependency cycles or Workshop errors and the existing eight-learned-body / three-favorite finale contract.

Physical iPad/Android/TV performance, audio and fresh guardian-to-guardian Worldwake pacing remain unmeasured. Next: Harborback's shell protection and Foldstep Fox's mobile cuts, followed by Skylens Mapper/Hedgehare. Legend/Mark/Manyfold introductions and seven caravan ground gifts remain on the roadmap.
