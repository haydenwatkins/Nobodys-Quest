# Environment art pass

October 1, 2026. The fresh character pass covers all 24 forms and 19 boss definitions. This ledger starts the separate environment pass across all 40 runtime maps; NPC world sprites and portraits follow before campaign/playthrough work. Original living-road identity, cute detailed pixel art, readable routes/interaction cues and preserved saves remain required. Shared materials do not count as a completed region review.

Completed first environments: **Orchard Road, Heartwood, Lantern Reach, the Toll Bridge, Sunrise Quay, the player house and Sunrise Town, Greenfield, Mistwood and Sunken Marsh (10/40 maps)**. Layered pixel canopies, bark grain, grown roots, apples, broad grass patches, herbs, gravel and wet shore edges now accompany patched-canvas carts, timber/plaster mill and eight-pose waterwheel, copper bell station, rooted arches, sluice, stone culvert, root barrier, bridge boards, notices, camps, fences, stumps, memory stones and the practice target. Interactive states remain recognizable; the wheel moves only with flowing water, and reduced motion holds still frames. Canopies fade near travellers and NPCs. Collision, routes, gates, interactions and rewards are unchanged. Guardian ground fields remain readable gameplay warnings.

The river chapter adds layered weeping willows, reeds, copper/glass lamps, linked gate chains, broad causeway slabs, wet shore edges, boats/wrecks, storm drain, satchel, notice boards, well, benches, flower boxes and stitched bunting. Shared cart/camp/fence/apple materials are integrated explicitly. The bakery, letter house and birthday home have authored timber, tiled roofs, arched windows and their own mounted details; deliveries warm their windows and reveal fresh bread, a letter and a wooden wheeled toy. Departure/trailhead stations remain legible. All lamp/gate/parcel states, moving cart checkpoints, flood/sweep warning geometry and gameplay stay unchanged.

The home now has a timber floor, uninterrupted wall panelling, fitted windows, a quilted bed, map-writing desk, bookshelf, woven route rug, marked exit mat and a refillable cookie hamper. Town housing has a stitched-map home with its doorway aligned to the native entrance, four distinct cottage designs and clear empty plot stakes; Town/Greenfield now also share muted meadow patches, quiet gravel, authored herbs, layered tile-sized hedges and detailed notice boards. Town now also has carved split rails, curved mailboxes and flower boxes beside the wider cottages, copper/glass lanterns, bed/tool signs, benches, working crates, a stitched stage, mounted route banners and an open-atlas monument. Fixed sewn festival bunting retires with the native festival timer; generic falling confetti is absent. An authored timber exit gate and worn quay steps align with the existing travel tiles; the home entrance uses its authored porch. Town environment art is complete; Greenfield now also has teal ponds, mossy rocks, an activated atlas post, a refillable hamper, regional floor thresholds and a native locked/open stone dungeon arch. Its five trial facades now use rooted earth, dusk stained glass, sewn stage cloth, bronze/glass and folded-stone atlas materials. The Heart Road arch has authored stone, attached lamps and a real Worldheart lock; inset facade bounds, worn approach boards and yielding roofs preserve the native routes. Nonessential HUD cards clear during an entrance approach, restoring away from it. Greenfield is complete. Mistwood now has layered woodland hedges and rooted trees, sparse ferns/fungi, broad shaded ground, fitted notices, a worn return step and three authored copper bell stations with fern/moth/root details. Restored plaques follow saved bell state; crowns yield around travellers and NPCs, with still poses under reduced motion. Its road atlas and pantry explicitly share authored materials. Native routes, the restored shortcut and all one-time rewards remain unchanged.

Validation: all 441 regression checks pass, plus the final 12 woodland/Treant/court checks after depth and HUD refinements. Engaged guardians clear nonessential map/mastery/story cards and ambient chatter so root warnings remain visible; essential combat information stays. Cards/chatter return after victory in both desktop and touch HUD layouts. Native third-phase root-warning renders and Chrome 667x375 clearing/restored-road/held-warning scenes were inspected without overflow or console errors. The global hash and gameplay randomness are unchanged. Native dungeon locking/travel, water/rock collision, atlas activation and renewable pantry state are exercised. Controlled Chrome 667x375 landscape and 1024x768 tablet-size scenes show the authored entrances with the actual HUD, without overflow or console errors. Native building spends spirit once; rest, furniture collision, cookies/refill timer and house exit/return remain intact. Every authored foliage/prop/house frame was inspected in both pixel settings at gameplay size and enlarged; native before/after scenes and save-disabled Chrome landscape fixtures at 667x375 were reviewed without overflow or console errors. Fixtures hold simulation and suppress review-blocking dialogue; physical devices and ordinary playthrough balance remain untested. NPC sprites and portraits are a later phase.

Final Marsh validation: 444/445 full checks passed; the isolated-dialogue optional-world guard was then fixed and all 10 final affected checks pass.

Sunken Marsh now carries weathered ferry works and quiet pools: authored sluices, wreck hatch, lily pads, wetland hedges, fence posts and worn return boards, with explicit reuse of river willows/reeds and road notices/post/pantry. Closed/open art follows native saved items; ward changes and the Rat reward still occur only through gameplay. All six assets and both pixel settings were inspected at gameplay size and enlarged, with real third-phase reed-warning renders and controlled Chrome landscape scenes. Entrance HUD focus now follows every native portal, clearing nonessential cards during approach and restoring them away. Physical hardware and ordinary encounter balance remain untested.

## Direction and omissions

Ground should remain quieter than characters and hazard tells. Use clustered leaves, sculpted wood/stone, worn route materials and deliberate regional landmarks. Preserve interaction recognition, doors/returns, landmark positions and warning hierarchy. Review every terrain family, structure, vegetation, prop, interior, trial and Worldback; runtime terrain inventory below supplements rather than replaces inspection of renderer-specific landmarks and procedural details.

Next: Ember Ridge, then the remaining campaign regions, form courts, Worldbearer regions/Worldbacks, final arena and repeatable arenas. Complete all environmental regions before NPC sprites/portraits. Existing guardian fields and ground marks remain gameplay warnings rather than decorative art.

## Runtime map coverage

| Map | Materials / theme | Terrain inventory | Explicit props | Fresh pass |
|---|---|---|---|---|
| Greenfield (overworld) | shared base | grass, tree, path | renderer landmarks / shared props | Complete: meadow, ponds/rocks, notices/post/pantry, regional exits, five court facades and Heart Road arch |
| Wayglass Court (riftbladeTrial) | riftblade | floor, rock | renderer landmarks / shared props | Pending |
| The Royal Burrow (moleTrial) | mole | floor, rock | renderer landmarks / shared props | Pending |
| The Dusk Court (vampireTrial) | vampire | floor, rock | renderer landmarks / shared props | Pending |
| The Wayward Stage (jesterTrial) | jester | floor, rock | renderer landmarks / shared props | Pending |
| The Final Firmament (godTrial) | god | floor, rock | renderer landmarks / shared props | Pending |
| Shattercoast (shattercoast) | shared base | grass, path | renderer landmarks / shared props | Pending |
| The Breakwater Bastion (turtleTrial) | turtle | floor, rock | renderer landmarks / shared props | Pending |
| The Foldroad Hall (samuraiTrial) | samurai | floor, rock | renderer landmarks / shared props | Pending |
| The Starpath Observatory (astronomerTrial) | astronomer | floor, rock | renderer landmarks / shared props | Pending |
| The Walking Garden (druidTrial) | druid | floor, rock | renderer landmarks / shared props | Pending |
| The Manyfold Coliseum (gauntletArena) | god | floor, rock | renderer landmarks / shared props | Pending |
| The Shifting Path (manyfoldExpedition) | riftblade | floor, rock | renderer landmarks / shared props | Pending |
| The Old Dungeon (dungeon) | shared base | floor, rock | renderer landmarks / shared props | Pending |
| Your Town (town) | shared base | grass, path | homes, plots, project/festival furniture | Complete: housing, meadow, fences, public/festival props and exits |
| Your House (playerHouse) | shared base | floor, rock | authored room, rest, pantry, exit | Complete: interior materials and furniture |
| Mistwood (mistwood) | woodland | grass, tree, restored path | three bell stations, notice, pantry, post, return | Complete: terrain, foliage, bells and shared resting places |
| Sunken Marsh (sunkenMarsh) | ferry wetland | grass, path, tree, water | sluices, wreck, fences, notice, post, pantry, return | Complete: wetland terrain, foliage, ferry works and resting places |
| Ember Ridge (emberRidge) | ember | floor, rock | renderer landmarks / shared props | Pending |
| Starfall Ruins (starfallRuins) | astronomer | floor, rock | renderer landmarks / shared props | Pending |
| Whispering Grove (whispering-grove) | shared base | grass | renderer landmarks / shared props | Pending |
| Sunstep Prairie (sunstepPrairie) | sunstep | grass, path | renderer landmarks / shared props | Pending |
| Windscar Canyon (windscarCanyon) | windscar | grass, path | renderer landmarks / shared props | Pending |
| Hanging Gardens (hangingGardens) | gardens | grass, path | renderer landmarks / shared props | Pending |
| Rootdeep Hollow (rootdeepHollow) | rootdeep | grass, path | renderer landmarks / shared props | Pending |
| Glasswater Desert (glasswaterDesert) | glasswater | grass, path | renderer landmarks / shared props | Pending |
| Frostbell Tundra (frostbellTundra) | frostbell | grass, path | renderer landmarks / shared props | Pending |
| Stormspine Peaks (stormspinePeaks) | stormspine | grass, path | renderer landmarks / shared props | Pending |
| Titan Grave (titanGrave) | titan | grass, path | renderer landmarks / shared props | Pending |
| The Sky Sovereign's Back (griffinWorldback) | griffin | floor, rock | renderer landmarks / shared props | Pending |
| The Old Mason's Crown (golemWorldback) | golem | floor, rock | renderer landmarks / shared props | Pending |
| The Loom Below (weaverWorldback) | weaver | floor, rock | renderer landmarks / shared props | Pending |
| The Walking Belfry (bellWorldback) | bellkeeper | floor, rock | renderer landmarks / shared props | Pending |
| The Storm Lantern (lanternWorldback) | lantern | floor, rock | renderer landmarks / shared props | Pending |
| The Heart Under Stone (colossusWorldback) | colossus | floor, rock | renderer landmarks / shared props | Pending |
| Greenfield · Orchard Road (orchardRoad) | mistwood | path, grass | sign, cart, banner, mill, sluice, bell, camp, arch, stump, apple, fence, stone | Complete: foliage, ground, structures/props |
| Mistwood · The Heartwood (heartwood) | mistwood | path, grass | arch, stone, stump | Complete: foliage, ground, structures/props |
| The Lantern Reach (lanternReach) | sunkenMarsh | path, grass | cart, lantern, camp, rainGate, milepost, willow, reed, wreck, drain, satchel | Complete: terrain, vegetation, structures/props |
| The Old Toll Bridge (tollCourt) | sunkenMarsh | path, grass | tollArch, lantern, ledger, reed | Complete: terrain, vegetation, structures/props |
| Sunrise Town · The Quay (sunriseQuay) | overworld | path, grass | bakery, letterHouse, birthdayHouse, cart, well, camp, lantern, bunting, willow, apple, flowerbed, bench, fence, reed, boat | Complete: terrain, vegetation, structures/props |
