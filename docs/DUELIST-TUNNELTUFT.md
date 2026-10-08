# A little parade and a basket of books

October 8, 2026. Wayglass Duelist and Tunneltuft now have two connected road adventures, four permanent repairs and two optional neighbour promises. Their signature passives change a place through actual play. Six earlier specialists remain without bespoke world opportunities.

| Road | Purpose and first use | Variation | Lasting change |
| --- | --- | --- | --- |
| Ribbonwind Arcade, west from Greenfield row 60 | Ser Pending worries that the children's paper banners will tear at the stuck gates. A Duelist dash landing turns a glass vane. | The lower vane needs a sideways approach; the upper vane faces a hedge and a northward approach. Separate real crowds support flowing cuts and wide third beats. | Two direct arcade passages open. After returning, parade bunting hangs near the picnic. |
| Rootbell Cutting, west from Greenfield row 70 | Errata wants dry pages for the burrow children's books. Tunneltuft lands near packed soil, then a genuine delayed tremor loosens it. | The second patch is reached from the far side of the root shelf. Real groups demonstrate Drill Tap's rhythm and aimed Burrow Blitz landings. | Two dry paths open. After returning, the empty picnic basket fills with books and a leaf bookmark. |

Both roads have physical entrances/returns, a longer route that stays open, stationary neighbours, a camp and a renewable picnic. Original foes hold their posts while idle and pursue when approached. No extra star tolls, currencies or form roster entries are added; repairs pay no numeric reward and add no mandatory completion quota. Requests require owned forms and deliberate acceptance; the existing Journey selection, return pacing and Set aside action remain.

## Action and save contracts

The new vanes and soil are world props, not artificial enemies. Ordinary cuts do not turn the vane. The actual Afterimage landing pulse must reach it through a clear line. A Rift Rush borrowed by a different body lacks that passive, whereas an earned borrowed dash worn by Duelist still expresses its normal identity.

Soil responds when the actual Aftershock runs, after its delay. The queued tremor retains its source body if the player changes form; leaving the map clears it with the existing transient effects. Distance and solid terrain still constrain either pulse. Starting an empty or distant cast cannot repair a path. Props grant no hit, kill, multi-hit, mana refund or mastery credit.

Four recognized IDs extend the existing `roadworks.opened` state. A saved repaired grid belongs to its adventure rather than a shared map legend. Existing ownership, mastery, waiting echoes and old repair IDs remain earned; no retroactive outing obligation is introduced. The existing outing contract still asks for any two worn-body lessons, two native arts and two separate encounter wins. It does not require completing a particular combo lesson.

New road authoring refuses to replace an existing entrance tile or portal letter. The new burrow spur uses row 70; Greenfield's original row-65 coast exit, its star gate, the Worldwake roads and final preparation routes retain their native layout and guidance.

## Art and dialogue

Lilac paving and leafy courtyard hedges distinguish the arcade; amber earth, root walls and timber-edged dry paths distinguish the cutting. Native authored art adds two visible glass-vane poses, packed/loose soil, joined paving, dry paths and empty/full book baskets. Existing bunting supplies the parade consequence. Large props yield over travellers; drawing cannot award progress. Both art densities retain the sharp Nunito dialogue/HUD.

Pending talks about the children and banners, then celebrates the cheering with a small helmet joke. Errata worries about muddy pages, thanks the player for clean books and remembers the children's leaf bookmarks. Their actual portraits, full concerns, choices, thanks and revisit prose fit the existing touch/TV dialogue layouts.

## Verification

- The final complete 2D regression run passes **630 tests**, zero failed, cancelled or skipped (`node --test --test-concurrency=6 tests/*.test.js`). The focused cases below overlap that run.
- Five new native integration cases cover actual landing timing, a borrowed dash in the wrong body, wall-blocked pulses, delayed tremors, form switching, clearing effects on map exit, deliberate task selection, saved help/returns, zero additional payouts, separate saves and read-only rendering of all new terrain/prop poses in both densities. Six live 12-second entry/notice/camp pauses grant no protection.
- The 21-case focused road/campaign/finale run passes. It includes both-way road entrances, longer walking routes, preserved coastal gates, Worldwake routing, final preparation and the new contracts.
- `node tools/check-early-form-roads.cjs` completes all seven specialist outings in one visit using original health/wards, native inputs, cooldowns and mana, with no respawns. Duelist completes two repairs and the outing in 8 casts / level 3 / four defeats; Tunneltuft in 9 casts / level 3 / four defeats. This holds enemy AI still to isolate lesson availability. Untouched authored crowds support three beats with normal timing; a Burrow Blitz aimed from farther away demonstrates its landing rather than overshooting a close target. These counts are not human duration or difficulty ratings.
- `node tools/check-duelist-tunneltuft-live.cjs 901` and seed `902` each complete both roads' repairs, native outing requirements and NPC returns with original AI, normal damage/mana/cooldowns, native movement and recovery. Both runs finish with zero knockouts or respawns: Duelist learns three lessons and defeats seven foes; Tunneltuft learns two and defeats nine. The scripted simulations take 26 and 40 seconds respectively. These are bounded newly-owned-form checkpoints, not trial acquisition, children's difficulty or an uninterrupted campaign.
- `tools/review-early-form-roads.cjs` passes all four actual touch / Android TV pad bridge × HD/base cases at 667 × 375 / 1280 × 720. The final two-road review produces 104 captures and checks complete painted concerns/thanks/memories, explicit acceptance, native repair inputs, walked crossings, real save reboot, Journal return, picnic consequences and physical exits. All eight story/world sheets, selected full-size phone/TV dialogue and the complete new-prop pose sheet were inspected. Four additional saved-consequence render cases pass; all eight parade/basket views were inspected. Earned protected checkpoints and stationary foes isolate input/save/layout; the live simulation above checks original combat AI separately.
- Progression audit retains 24 forms, 96 valid lessons, no dependency cycles or Workshop errors and the eight-learned-body / three-favorite finale contract.

Physical iPad/Android/TV performance, audio and fresh guardian-to-guardian Worldwake pacing remain unmeasured. Velvetwing/Pocket Trouper subsequently gain bespoke garden/stage adventures (`VELVETWING-TROUPER.md`). Four earlier specialists remain: Harborback, Foldstep Fox, Skylens Mapper and Hedgehare. The Legend/Mark/Manyfold introductions and seven caravan ground gifts remain on the roadmap.
