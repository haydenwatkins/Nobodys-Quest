# NPC art coverage

October 2, 2026. This tracks completed and pending NPC art against the primary-source roster. The final orchard foe batch is complete; regular foes now have 18/18 authored bodies. Review every named character, every resident appearance and every dialogue speaker next. Keep native IDs, placement, routines, interactions and saved progress. Detailed, cute, original bodies and recognizable faces should replace generic shared silhouettes; deliberate equipment belongs in the authored sprite.

## Named world sprites: 3/13 fresh reviews complete

| ID | Visible name | Logical footprint | Native placement maps | Status |
|---|---|---|---|---|
| pebble | Pebble | 18x22 | overworld, shattercoast, town, mistwood, emberRidge, starfallRuins, sunstepPrairie, windscarCanyon, frostbellTundra, titanGrave, orchardRoad, sunriseQuay | Complete |
| mayorMaybe | Mayor Maybe | 10x10 | overworld, town | Pending |
| errata | Archivist Errata | 9x10 | dungeon, mistwood, starfallRuins, rootdeepHollow, glasswaterDesert, titanGrave | Pending |
| parcel | Courier Parcel | 18x22 | overworld, shattercoast, sunkenMarsh, sunstepPrairie, glasswaterDesert, frostbellTundra, orchardRoad, lanternReach, sunriseQuay | Complete |
| pending | Sir Pending | 18x22 | dungeon, town, emberRidge, hangingGardens, orchardRoad | Complete |
| alias | Auntie Alias | 9x10 | overworld, dungeon, town, whispering-grove, hangingGardens, stormspinePeaks | Pending |
| provisional | Dr. Provisional | 9x10 | overworld, shattercoast, sunkenMarsh, emberRidge, windscarCanyon, rootdeepHollow | Pending |
| moss | Groundskeeper Moss | 10x10 | overworld, mistwood, sunkenMarsh, whispering-grove, sunstepPrairie, hangingGardens, rootdeepHollow | Pending |
| lastminute | Captain Lastminute | 10x10 | shattercoast, windscarCanyon, frostbellTundra, stormspinePeaks, titanGrave | Pending |
| probably | Oracle Probably | 9x10 | starfallRuins, whispering-grove, glasswaterDesert, stormspinePeaks, titanGrave | Pending |
| quayBaker | Baker Brindle | 21x24 | sunriseQuay | Pending |
| quayMara | Mara | 21x24 | sunriseQuay | Pending |
| quayPip | Pip | 21x24 | sunriseQuay | Pending |

The runtime registry and actual map loads confirm thirteen named definitions. Ten base characters come from body/robe/wide templates in `js/data/npcs.js`; generic HD detail conversion does not constitute an authored review. Baker Brindle, Mara and Pip have newer delivery art and still require the same fresh review. Their physical roles, materials, face shapes, clothing and carried tools should distinguish them. Current four-frame counts are recorded from the active runtime, not assumed from the base source.

## Town residents: pending

A founded town with sixteen residents creates `resident-0` through `resident-15`, using six palette appearances, a shared 7x9 footprint and two poses. Default unbuilt-town loading produces none, so an empty initial scene is not evidence of missing or completed coverage. All six looks, both directions/poses, routines and conversation pairs need inspection. Preserve resident counts, safe placement, house routines and saved town state.

## Portraits and dialogue identity: pending

Opening/delivery dialogue currently enlarges world sprites rather than using a dedicated portrait registry. `js/engine/opening-render.js` selects Rat/Knight/Patchling, matches NPC names, recognizes Tollkeeper and otherwise falls back to Ancient Treant. This can give an unmatched story speaker an unrelated face. Story speaker aliases (including Ser Pending versus Sir Pending), guardians, chapter narrators and dynamic Sunrise-request names need an exhaustive separate inventory and an explicit identity mapping before portrait coverage can be marked complete. The standard dialogue canvas currently paints text without a portrait. Do not declare all portraits complete by improving only the opening selector.

Inspect native and enlarged world sprites, directions/poses, dialogue crops and actual interaction scenes in both pixel settings. Include phone landscape, long names and incidental speech. Behavior checks must preserve talk/routine timing and save IDs; held Chrome fixtures do not establish physical hardware or ordinary playthrough balance.

## Primary visual and speaker audit (October 2)

A rendered sheet of all thirteen current NPC bodies in both settings confirms that the ten base characters still share mostly faceless silhouettes; the three quay characters are larger and have authored faces. Their fresh pose/routine/portrait review remains pending. The first bounded character batch should distinguish Pebble, Courier Parcel and Sir Pending through their guide, delivery and guard roles. Keep their IDs, original dialogue personalities and placements; make hands, clothing and any carried tools belong to the character. Generic activity rectangles currently sit beside their feet and should not be superimposed over deliberately authored equipment. Functional talk and guidance markers must remain readable above the actual head.

Runtime chapter scenes contain six distinct speaker strings: THE STORY, MAYOR MAYBE, ARCHIVIST ERRATA, PEBBLE, COURIER PARCEL and THE LAST WORLDBEARER. Opening/delivery also use PARCEL, PARCEL, FROM THE OTHER SIDE, SER PENDING, PATCHLING, THE ANCIENT TREANT and THE TOLLKEEPER. Short Parcel aliases and Ser Pending do not match the current full NPC names. Sunrise requests use Brindle, Mara, Pip and Pebble; Brindle also needs an explicit Baker Brindle alias.

The portrait phase must distinguish people from narration and interactive objects. Native producers include chapter/recap headings, NPC names with icons/chapter or rumor suffixes, boss domain introductions and name-based rematch/victory headings, phase/fall headings, form discoveries, World Mark announcements, route advice, signs, chests, pantry items and regional mechanisms. Resolve known speakers explicitly, use appropriate authored object/narration treatment for the latter group, and leave an unknown speaker neutral instead of inventing a Treant identity. Review standard dialogue as well as the opening/delivery crop. This producer audit is evidence for implementation; it does not mark any portrait complete.

## First road companions complete (October 2)

Pebble now has a warm rounded face, silver hair, blue guide coat and held bound notebook. Courier Parcel has a rust jacket, fitted cap/strap/satchel and a parcel held in both hands. Sir Pending has a warm face, fitted rounded armor and a hand-held ceremonial blade. Their authored 18x22 bodies add readable detail to the former 9x10/10x10 templates while leaving physical placement, talk ranges, routines, personalities, native IDs and saved conversation keys unchanged. Four idle/walk/work poses support both pixel settings and mirrored facing. Tools belong to the authored sprite; generic activity shapes and the old extra pointing-arm stamp no longer paint over these three. Functional talk/guidance markers remain above their heads and clear one another. Reduced motion holds still frames/bob. Incidental speech also accounts for these authored heads.

Opening/delivery portrait matching now recognizes Pebble, Parcel/Courier Parcel (including the other-side subtitle), and Ser/Sir Pending. Long speaker headers show an ellipsis. These three opening crops are reviewed; the standard dialogue has no portrait yet, and other speaker/narration/object matching remains pending. Do not equate this alias repair with complete portrait coverage.

Fifteen final focused art/talk/save/routine/opening/delivery/dialogue/chatter/HUD/scenery checks pass. All four poses, both facings and both settings were inspected at native size and enlarged; twelve final held Chrome 667x375 scenes cover all native bodies in both settings, actual conversations for all three, both classic short aliases, guidance/talk clearance and incidental speech. The first held guide placement crowded the talk label and the traveller stood under a tree; these were corrected before the final review. No final errors or overflow appeared, the fixture is removed and viewport reset. Latest broad evidence is the preceding orchard 536/537 full run plus five passing fixture-repair checks; no new full-run claim is made for this trio. Physical devices/ordinary playthrough balance remain untested. Next review Mayor Maybe, Archivist Errata and Auntie Alias, then the remaining four base people, three quay people and six resident appearances; finish all portrait coverage before campaign work.
