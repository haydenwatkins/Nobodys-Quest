# NPC art coverage

October 1, 2026. This is a primary-source inventory and handoff, not completed art. Finish the remaining seven regular foes first. Then review every named character, every resident appearance and every dialogue speaker. Keep native IDs, placement, routines, interactions and saved progress. Detailed, cute, original bodies and recognizable faces should replace generic shared silhouettes; deliberate equipment belongs in the authored sprite.

## Named world sprites: 0/13 fresh reviews complete

| ID | Visible name | Logical footprint | Native placement maps | Status |
|---|---|---|---|---|
| pebble | Pebble | 9x10 | overworld, shattercoast, town, mistwood, emberRidge, starfallRuins, sunstepPrairie, windscarCanyon, frostbellTundra, titanGrave, orchardRoad, sunriseQuay | Pending |
| mayorMaybe | Mayor Maybe | 10x10 | overworld, town | Pending |
| errata | Archivist Errata | 9x10 | dungeon, mistwood, starfallRuins, rootdeepHollow, glasswaterDesert, titanGrave | Pending |
| parcel | Courier Parcel | 9x10 | overworld, shattercoast, sunkenMarsh, sunstepPrairie, glasswaterDesert, frostbellTundra, orchardRoad, lanternReach, sunriseQuay | Pending |
| pending | Sir Pending | 10x10 | dungeon, town, emberRidge, hangingGardens, orchardRoad | Pending |
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
