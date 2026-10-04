# Opening roads you can walk

October 4, 2026. The opening journey now uses connected roads and visible Rat passages. Speaking to a friend gives directions and leaves the player in place.

Orchard Road's east branch leads through a real boundary exit into Lantern Reach. The return exit reaches the same branch. Lantern Reach, the Old Toll Bridge, Sunrise Quay and Town Green retain their native two-way road exits and directional camera transitions. Greenfield and Heartwood retain their existing entrances. Parcel's departure post is a route conversation; the cart no longer jumps the player to Lantern Reach or from Sunrise back to the orchard. Walking east without another conversation starts the delivery at its first lamp. The Atlas and breadcrumbs use actual authored portal cells, with no synthetic cart edges.

The east road opens after helping Parcel reopen the orchard. A saved delivery already in progress keeps access even if older opening flags are missing. Lamps and the Tollkeeper still gate their own stretches. This changes traversal, not the sequence of fights or the earned form/lesson contracts.

Rat physically walks beneath the roots along four narrow cells. The lever on the far bank opens the existing bridge and saves its checkpoint; the player stays at the lever, without the old fade. Larger bodies can then walk back across the bridge. Guidance continues toward the lever once Rat enters the passage. The first briar stands two tiles farther along the bank, leaving the actual lever clear of its interaction exclusion radius; all three poison opportunities remain. Mill briars hold their authored posts while idle, so time spent reading or exploring cannot move one into the lever prompt. Native shooting/retreat remain, and the relocated first briar retains its old saved defeat identity.

The recipe pocket has two visible Rat-only drain cells. Directions at the mouth do not move the player or award salvage. Walking into the dry pocket reveals the existing physical book; collection still pays three spirit, and Brindle's later native thanks still pays five. Walking north returns to the bank. Leaving an uncollected book, saving, re-entering and collecting preserve the same object and once-only credit. Legacy immediate salvage/owned-book saves remain supported. Changing into a larger body is blocked while inside a low passage, with a plain instruction to walk out first. No new save schema is needed.

These roads use the existing collision grid, save system and Canvas renderer. Normal chapter traversal has no interaction-driven relocation. Gentle knockout recovery and already introduced optional travel keep their existing purposes.

## Verification

The final full Node suite passed **601 cases**, zero failed/skipped. Twenty-two focused native cases passed, including five new connected-road/passage cases; the five were also repeated after fixture corrections. These overlap the full suite. The native suite covers fresh and partial saves, actual collision/triggers, no movement on dialogue/lever use, passage body restrictions, route gates, pending gifts, collection and native returns.

`tools/review-connected-opening.cjs` serves the real repository at a simulated published origin and uses the native title/save slot, touch A and TV controller bridge. After controlled earned checkpoints it walks the culvert, saves inside both drains, operates the lever, walks the connected road through Town Green and back to the orchard, collects the saved book once and reloads at home. Each road boundary captures the native pan and safe arrival. All four touch/controller × HD/base cases passed, with 116 final captures inspected across eight case-part sheets and selected full-size passage/return views. The updated opening and recipe-promise scenarios also passed all eight cases; their 24 and 40 final captures and four sheets were inspected. Together these are twelve browser cases and 180 views, with no page errors or horizontal overflow. Touch steering uses keyboard movement; TV steering uses the native pad bridge. Encounter earnings/gates are deliberately supplied for the long navigation segment; it is not an uninterrupted balanced fight or elapsed-pacing playtest. Physical Android TV and Safari remain device checks.

Reproduce with developer Playwright and Chromium:

```
node --test --test-concurrency=6 tests/*.test.js
node tools/review-connected-opening.cjs [baseURL] [captureDirectory]
node tools/review-early-experience.cjs [baseURL] [captureDirectory]
node tools/review-recipe-promise.cjs [baseURL] [captureDirectory]
node tools/render-review-sheet.cjs [captureDirectory] [sheetDirectory]
```

The scenarios simulate a published host and need no running static server. `CHROMIUM_EXECUTABLE_PATH` can override Chromium. Keep captures outside the repository. Earlier cart/instant-drain evidence in the historical reward ledger describes the superseded implementation; the current traversal contract is this document.
