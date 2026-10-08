# People behind the reopened Worldwake roads

October 8, 2026. Each of the six Worldwake form trails now has a familiar neighbour with a concrete concern, an optional promise, native help, a return conversation and a later memory. The useful action restores the existing short crossing; thanking the neighbour leaves a saved picnic detail. This gives a new body a purpose beyond finishing its lesson counters.

| Body / road | Neighbour's concern | Actual help | Detail after returning |
| --- | --- | --- | --- |
| Galecrest / Postroad | Parcel wants birthday letters home today | Moving attacks make Slipstream push a foe | Birthday bunting |
| Cobblekin / Brook | Moss worries about carrying workers' soup past flying sparks | Masonry stops an incoming shot | A mint planter |
| Silkstep / Grove | Provisional wants the sewing circle to get home before dark | Lifeline binds two different living foes | A silk lamp at the turning |
| Chimelet / Walk | Pip and Thimble want to deliver biscuits without the long icy walk | Changing attack styles makes Resonance push a foe | A bench for the children |
| Wickling / Causeway | Oracle Probably worries about storm-watchers losing their way | Safe Light stops a shot | A roadside lantern |
| Cragback / Meadow | Mara wants tired roadmenders to get home | Worldweight pushes a heavy foe | A bench facing the road |

The cast speaks about people, food and practical worries, then reacts with relief and small jokes. There is no extra reward currency, new cast member, timer or relationship quota. Existing portraits and native scenery supply the presentation.

## A pause before and after the outing

The neighbour stands still near the entry notice and fire. The first foes now wait farther along the road and hold their posts while idle. Approaching them still starts their original pursuit/combat; all twelve authored foes, health, wards and damage remain. This prevents an enemy from wandering into a conversation or camp pause.

First-use guidance describes the body's signature action until its existing saved passive feature is demonstrated. Empty casts cannot open the crossing. A single subdued notice confirms that a short way home has opened. This adds no completion quota: the established two lessons, two native arts and two separate encounters still govern the outing.

A deliberately selected, ready road or trail promise reserves room for bringing back the good news before another discovery. This applies to the five earlier specialist roads too. Form Lab explains the waiting path without assuming an active outing. Return to the neighbour, or choose **Set aside** in Journey, to release discovery. Unaccepted promises do not impose this pause or replace another selected task. Previously placed echoes and completed paths remain earned; owned forms and version-1 adventures retain access.

Live combat exposed a border problem: native knockback could put a traveller on the exit and sideways movement could immediately change maps. The six form-trail border exits now wait for outward walking or an outward dash. Damage and knockback remain native; interior portals and other maps retain their rules.

## State and compatibility

`trail-promises.js` registers with the shared Sunrise request engine. Ownership controls availability; `town.followedRequest` records deliberate selection, `formOutings.features` records real crossing help, and `town.requests` records the return. Earlier genuine passive use counts. Consequence drawing reads those states without modifying terrain or progress, yields over actors and restores canvas state. Return pays no extra stars or spirit. No save-schema extension or second quest engine is introduced.

## Verification

- The final complete 2D regression run passed **625 tests**, zero failed, cancelled or skipped (`node --test --test-concurrency=6 tests/*.test.js`). The six focused cases below overlap that run.
- Six new integration cases cover eighteen live 12-second entry/notice/camp pauses without protection grants, all six native signature effects, empty casts, stable guidance, ownership/selection, saved returns, portraits, zero additional payouts, both scenery densities, legacy access and discovery holds. A real damage call reproduces border knockback, verifies stationary/sideways movement stays on the road, and outward movement exits safely.
- `node tools/check-form-outing-lessons.cjs` completes all six existing outing contracts in one visit, using original health/wards and native casts, without respawning. Its stationary-AI fixture isolates lesson availability, rather than difficulty.
- `node tools/check-worldwake-live-outings.cjs 817` and seed `818` complete six consecutive discoveries, all six native passive effects and all six NPC returns in one runtime per run, with original enemy AI, normal cooldowns/mana and actual walking. They take 319 and 331 simulated seconds. Each run has two native gentle knockouts and zero respawns; normal camps/picnics provide recovery. A bounded knockout assertion prevents an unlimited retry loop.
- These continuous runs start from an earned late checkpoint: all six guardian Marks, earlier introductory mastery and Wayfinder travel are already earned; all six Worldwake forms are initially unclaimed. They do **not** establish fresh guardian-to-guardian campaign pacing, children's difficulty or human play duration. Borrowed, already earned ward counters can help leave an earlier road.
- `tools/review-trail-promises.cjs` passes four published-host browser cases: 667 × 375 touch and the actual Android TV pad bridge at 1280 × 720, each in HD/base art. The 172 captures cover six roads' arrival, complete concerns, explicit choices, native help, saved return thanks, revisit memory and picnic details, plus startup. All eight final contact sheets and selected full-size phone/TV dialogue and consequence views were inspected. Full prose paint is asserted, rather than capturing incomplete typewriter text. Protected earned checkpoints and isolated native-effect foes separate presentation from the live-AI check above.
- `tools/review-form-return.cjs` passes the same four combinations, checking the waiting inspector, readable return explanation, actual Journey **Set aside** button and restored discovery access. Menu scrolling exposes the complete explanation.
- Progression audit retains 24 forms, 96 valid lessons, no dependency cycles or Workshop errors, and the eight-learned-body / three-favorite finale contract.

Physical iPad/Android/TV behavior remains unmeasured. Eight earlier specialists still need bespoke opportunities, starting with Wayglass Duelist and Tunneltuft. A fresh continuous Worldwake guardian session, Legend/Mark/Manyfold introductions and the seven caravan ground gifts remain on the roadmap.
