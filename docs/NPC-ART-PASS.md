# NPC art coverage

October 2, 2026. This tracks completed and pending NPC art against the primary-source roster. The final orchard foe batch is complete; regular foes now have 18/18 authored bodies. Review every named character, every resident appearance and every dialogue speaker next. Keep native IDs, placement, routines, interactions and saved progress. Detailed, cute, original bodies and recognizable faces should replace generic shared silhouettes; deliberate equipment belongs in the authored sprite.

## Named world sprites: 13/13 fresh reviews complete

| ID | Visible name | Logical footprint | Native placement maps | Status |
|---|---|---|---|---|
| pebble | Pebble | 18x22 | overworld, shattercoast, town, mistwood, emberRidge, starfallRuins, sunstepPrairie, windscarCanyon, frostbellTundra, titanGrave, orchardRoad, sunriseQuay | Complete |
| mayorMaybe | Mayor Maybe | 18x22 | overworld, town | Complete |
| errata | Archivist Errata | 18x22 | dungeon, mistwood, starfallRuins, rootdeepHollow, glasswaterDesert, titanGrave | Complete |
| parcel | Courier Parcel | 18x22 | overworld, shattercoast, sunkenMarsh, sunstepPrairie, glasswaterDesert, frostbellTundra, orchardRoad, lanternReach, sunriseQuay | Complete |
| pending | Sir Pending | 18x22 | dungeon, town, emberRidge, hangingGardens, orchardRoad | Complete |
| alias | Auntie Alias | 18x22 | overworld, dungeon, town, whispering-grove, hangingGardens, stormspinePeaks | Complete |
| provisional | Dr. Provisional | 18x22 | overworld, shattercoast, sunkenMarsh, emberRidge, windscarCanyon, rootdeepHollow | Complete |
| moss | Groundskeeper Moss | 18x22 | overworld, mistwood, sunkenMarsh, whispering-grove, sunstepPrairie, hangingGardens, rootdeepHollow | Complete |
| lastminute | Captain Lastminute | 18x22 | shattercoast, windscarCanyon, frostbellTundra, stormspinePeaks, titanGrave | Complete |
| probably | Oracle Probably | 18x22 | starfallRuins, whispering-grove, glasswaterDesert, stormspinePeaks, titanGrave | Complete |
| quayBaker | Baker Brindle | 21x24 | sunriseQuay | Complete |
| quayMara | Mara | 21x24 | sunriseQuay | Complete |
| quayPip | Pip | 21x24 | sunriseQuay | Complete |

The runtime registry and actual map loads confirm thirteen named definitions. Ten base characters come from body/robe/wide templates in `js/data/npcs.js`; generic HD detail conversion does not constitute an authored review. Baker Brindle, Mara and Pip have newer delivery art and still require the same fresh review. Their physical roles, materials, face shapes, clothing and carried tools should distinguish them. Current four-frame counts are recorded from the active runtime, not assumed from the base source.

## Town residents: 6/6 appearances complete

A founded town still creates up to `resident-0` through `resident-15`. Six distinct authored 14x18 appearances replace the shared 7x9 template: short brown hair/green neckerchief, pale braid/blue apron, dark hair/plum vest, silver bun/olive apron and spectacles, warm curls/purple scarf, and pale bob/navy jacket. Nine poses include joined sweeping, watering and parcel-carrying tools, plus idle, walk and greeting. The existing resident IDs, count cap, safe homes, routes, ambient exchanges and town save data are preserved. Both settings/facings and all poses have been inspected.

## Portraits and dialogue identity: complete current roster

All thirteen NPCs have separately composed 32x32 bust portraits. Paper opening/delivery and standard dialogue now share the same explicit resolver. All twenty-four forms and nineteen guardians use their reviewed authored identity cards; no new guardian/form body art is claimed. Native aliases, chapter/rumor suffixes, domain intros, decorated names, phase headings and Atlas’s final-chapter alias are covered. Narration, objects, announcements and unmatched headings receive a neutral journal rather than an unrelated character. See [the speaker inventory and evidence](DIALOGUE-SPEAKERS.md).

All portrait/card sheets were inspected in both settings. Thirty final controlled phone/tablet/TV dialogue views cover both styles, long names, narration, guardian identity and actual touch/native-bridge continuation. Existing queue/callback, art, conversation/save, input/controller and status-HUD checks passed. These are desktop checks, not physical hardware or a full balance playthrough. Shared HUD readability, effects, cover and ground-item presentation remain queued.

## Primary visual and speaker audit (October 2)

A rendered sheet of all thirteen current NPC bodies in both settings confirms that the ten base characters still share mostly faceless silhouettes; the three quay characters are larger and have authored faces. Their fresh pose/routine/portrait review remains pending. The first bounded character batch should distinguish Pebble, Courier Parcel and Sir Pending through their guide, delivery and guard roles. Keep their IDs, original dialogue personalities and placements; make hands, clothing and any carried tools belong to the character. Generic activity rectangles currently sit beside their feet and should not be superimposed over deliberately authored equipment. Functional talk and guidance markers must remain readable above the actual head.

Runtime chapter scenes contain six distinct speaker strings: THE STORY, MAYOR MAYBE, ARCHIVIST ERRATA, PEBBLE, COURIER PARCEL and THE LAST WORLDBEARER. Opening/delivery also use PARCEL, PARCEL, FROM THE OTHER SIDE, SER PENDING, PATCHLING, THE ANCIENT TREANT and THE TOLLKEEPER. Short Parcel aliases and Ser Pending do not match the current full NPC names. Sunrise requests use Brindle, Mara, Pip and Pebble; Brindle also needs an explicit Baker Brindle alias.

The portrait phase must distinguish people from narration and interactive objects. Native producers include chapter/recap headings, NPC names with icons/chapter or rumor suffixes, boss domain introductions and name-based rematch/victory headings, phase/fall headings, form discoveries, World Mark announcements, route advice, signs, chests, pantry items and regional mechanisms. Resolve known speakers explicitly, use appropriate authored object/narration treatment for the latter group, and leave an unknown speaker neutral instead of inventing a Treant identity. Review standard dialogue as well as the opening/delivery crop. This producer audit is evidence for implementation; it does not mark any portrait complete.

## First road companions complete (October 2)

Pebble now has a warm rounded face, silver hair, blue guide coat and held bound notebook. Courier Parcel has a rust jacket, fitted cap/strap/satchel and a parcel held in both hands. Sir Pending has a warm face, fitted rounded armor and a hand-held ceremonial blade. Their authored 18x22 bodies add readable detail to the former 9x10/10x10 templates while leaving physical placement, talk ranges, routines, personalities, native IDs and saved conversation keys unchanged. Four idle/walk/work poses support both pixel settings and mirrored facing. Tools belong to the authored sprite; generic activity shapes and the old extra pointing-arm stamp no longer paint over these three. Functional talk/guidance markers remain above their heads and clear one another. Reduced motion holds still frames/bob. Incidental speech also accounts for these authored heads.

Opening/delivery portrait matching now recognizes Pebble, Parcel/Courier Parcel (including the other-side subtitle), and Ser/Sir Pending. Long speaker headers show an ellipsis. These three opening crops are reviewed; the standard dialogue has no portrait yet, and other speaker/narration/object matching remains pending. Do not equate this alias repair with complete portrait coverage.

Fifteen final focused art/talk/save/routine/opening/delivery/dialogue/chatter/HUD/scenery checks pass. All four poses, both facings and both settings were inspected at native size and enlarged; twelve final held Chrome 667x375 scenes cover all native bodies in both settings, actual conversations for all three, both classic short aliases, guidance/talk clearance and incidental speech. The first held guide placement crowded the talk label and the traveller stood under a tree; these were corrected before the final review. No final errors or overflow appeared, the fixture is removed and viewport reset. Latest broad evidence is the preceding orchard 536/537 full run plus five passing fixture-repair checks; no new full-run claim is made for this trio. Physical devices/ordinary playthrough balance remain untested. Next review Mayor Maybe, Archivist Errata and Auntie Alias, then the remaining four base people, three quay people and six resident appearances; finish all portrait coverage before campaign work.

## Mayor Maybe complete (October 2)

Mayor Maybe now has round spectacles, a warm moustached face, plum coat, fitted waistcoat and a hand-held civic agenda. Four 18x22 poses include writing and a joined waving arm; both pixel settings and mirrored facings share the authored identity. The former 10x10 drawn template grows without changing native road/town placement, personalities, routine/talk rules, chapter selection or saved conversation keys. Its tools use the existing integrated-equipment path. The opening speaker crop resolves the existing full name; standard dialogue remains text-only pending the full portrait phase.

Top-clamped or stacked incidental speech now yields if it would cover an integrated character's own head, as well as the traveller. Timers continue and clear speech returns. Fourteen final focused art/dialogue/chatter/routine/save/HUD checks pass, including all four integrated people at clipped and readable positions. All four Mayor poses, both facings and both settings were inspected at native size and enlarged; ten final Chrome 667x375 views cover native road/town bodies in both settings, native conversations, a controlled opening portrait and clipped/readable speech. An initially transient-looking classic conversation header was rechecked in a fresh, font-loaded capture and was clear. No final errors or overflow appeared; the fixture is removed and viewport reset. Some peripheral NPCs can still sit behind optional mastery cards; retain that for the shared readability audit. Latest broad evidence remains the preceding orchard run and five passing fixture-repair checks; this single-person batch uses focused validation. Physical hardware/ordinary playthrough balance remain untested.

That historical checkpoint has been completed by the October 3 batch below. Next: Groundskeeper Moss, Captain Lastminute and Oracle Probably, then all three quay people and six resident appearances. Finish full portrait/speaker coverage and shared readability/effects before campaign work.

## Roadside specialists complete (October 3, cloud)

Archivist Errata now has silver-lilac hair, square reading glasses, an indigo robe and a folded working atlas; a quill belongs to the writing hand. Auntie Alias has warm features, plum curls, a tied headband, a green cardigan and patchwork apron, with a held spool and fabric-working pose. Dr. Provisional has dark hair, a fitted cream coat, teal vest, attached neck-loop instrument, clasped medical bag and a held inspection vial. Their four authored 18x22 poses support both facings and pixel settings. Clothes and equipment belong to the body; none adds detached ornaments.

Native NPC definitions, chapter lines, talk keys, placements and interaction rules remain. The existing integrated-equipment path suppresses generic activity stamps and keeps talk/guidance above their larger drawn heads. Existing full-name speaker matching uses these sprites in the opening treatment. Standard dialogue is still text-only; this batch does not complete dedicated portraits or speaker coverage.

Ten focused checks passed across specialist/native conversations, save round trips, render-state preservation, mirrored routines, reduced motion, head markers, opening speaker resolution, previous road/civic art and incidental speech. Current art sheets were inspected at native/enlarged sizes for all four poses, both facings and both settings. Twelve final controlled Chromium 667x375 touch scenes cover native Mistwood/Town/Marsh placements and actual conversations in both settings; all reported no script errors or horizontal overflow. Initial entry banners obscured the world captures; the final review advances past those banners. Fixtures use fresh contexts and disable saving; they are not ordinary balance playthroughs or physical-device tests. Existing peripheral actors under optional cards remain in the shared readability queue.

`node tools/render-npc-atlas.cjs OUTPUT_DIRECTORY [NPC_ID ...]` now provides a reusable review sheet using the shipped script order. Coverage is 7/13 named world sprites. No full regression pass is claimed for this batch.

## Field companions complete (October 3, cloud)

Moss wears a straw hat and practical apron with a held watering can; Lastminute wears a captain’s cap and brass-button coat with a folded map and telescope; Probably has a pale side braid, purple cape with an attached crescent clasp, and a held forecast chart. All have four authored 18x22 poses in both facings and pixel settings. Native dialogue, map placement, routine state, talk keys and saved conversations are preserved.

Ten focused checks passed, including native conversations/save round trips for all six new cloud companions, mirrored/quiet routine drawing, clear head markers, previous road/civic art and incidental speech. All pose sheets and twelve controlled touch-landscape world/talk captures were inspected. Native Mistwood/Shattercoast/Starfall scenes reported no script errors or horizontal overflow. Standard dialogue remains text-only; peripheral actors behind optional cards remain queued for shared readability. No full-suite or physical-device pass is claimed. Named world coverage is 10/13; next are Brindle, Mara and Pip.

## Quay neighbours and town residents complete (October 3, cloud)

Brindle now has a flour-coloured chef’s hat and apron, warm moustached face, held loaf/tray and bread paddle. Mara has a silver bun, teal coat, fringed rose shawl, held letter and cup. Pip is visibly shorter, with a little cap, warm scarf and held wooden dragon. Their four 21x24 poses preserve native delivery/request identity. The real Brindle request exposed the old short-name fallback to Treant; an explicit quay alias resolver now shows Brindle correctly and rejects unrelated longer names.

Delivery/request regressions and cloud companion art: 11 passing checks. Growing-town placement/routines/save/drawing/chatter/spending: 8 passing checks. Final alias/dialogue/road regressions: 7 passing checks. These are focused runs with some repeated cases, not a full regression result. All quay pose sheets, all six nine-pose resident sheets, twelve actual quay world/request views and twelve founded-town world views were inspected in both settings at 667x375 touch landscape. Brindle’s final corrected request portrait was reviewed again in both settings. No script errors or horizontal overflow appeared. Town scene fixtures preserve all sixteen native residents; their paired chatter is verified by simulation, not by claiming an ambient resident opens a conversation. Physical devices remain untested.

Named world sprites are 13/13, town appearances 6/6. Dedicated portraits, explicit speaker classification, standard-dialogue portraits and shared readability are next. Some optional HUD cards still obscure peripheral actors; keep that shared audit queued.

## Portrait integration complete (October 3, cloud)

The composed NPC busts keep their canonical faces and role clothing. Standard dialogue reserves a clear portrait column and fits long speaker headers, while preserving the full message text, typewriter behaviour, deliberate advancement, queue and callbacks. Paper dialogue preserves its visual style while using the same identity. The source audit caught guardian domain/phase headings, trailing decoration and Atlas’s Last Worldbearer alias; all now resolve explicitly. Unknown/object/narrator headings never show Treant by default. Validation and limitations are recorded in `DIALOGUE-SPEAKERS.md`. Next: shared readability, Cobblekin cover and visible ground items before campaign changes.
