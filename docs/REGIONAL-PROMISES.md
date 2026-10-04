# Ridge and Starfall: helping friends along the road

October 4, 2026. This batch applies the [experience rules](PLAYER-EXPERIENCE-RULES.md) to existing Ember Ridge and Starfall activities. The aim is a remembered person and one useful next action, followed by returning with good news. It adds no new progression currency, deadline or required guardian gate.

## The playable sequence

| Person / moment | Concern and immediate action | Native consequence / return |
| --- | --- | --- |
| Ser Pending, Ridge entrance | The Eclipse Knight is frightening travellers while guarding the last watchfire. Pending explains Wizard's Dark attacks and the marked crescent's recovery window. The Ash watchfire remains optional practice. | Hear three short pages, then choose **I'll help** or **Maybe later**. Deferring preserves the previously selected promise. |
| Eclipse Knight, eastern court | An anxious protector worries the last fire will go out. He acknowledges Pending's concern, then explains his ward and swing. | His native ward, patterns, stats, Sigil and victory reward are unchanged. Defeat dialogue lowers his sword; later fights are described as practice. |
| Sigil and Pending | The selected promise follows the ground Sigil before telling Pending the good news. | Pending records thanks only after collected ownership. He recommends Errata. His later conversation remembers travellers passing the court. No extra spirit or star is awarded on return. |
| Errata, observatory entrance | Travellers have lost their night road because three lenses slipped out of place. Errata names the northwest, northeast and southeast galleries, then the southern instrument. | Three pages precede the explicit choice. The promise follows remaining lenses in any order, using their actual state and locations. |
| Star instrument and Errata | All three lenses must shine before using the instrument. The next action is collecting its Fallen Star Thread, then returning. | Existing lights and recovery happen immediately; existing 8 spirit pays once on collection. Errata is relieved to read the eastern road toward Sunstep. Her later conversation mentions Parcel's request for a map. Return awards no second payout. |

Pebble, Provisional and Oracle Probably now react to these particular problems and offer concrete encouragement. Starfall's old notes retain their warmth while each lens clearly reports restored light and the southern instrument. Errata's short spoken name now resolves to her existing character portrait; object headings such as ‘Errata’s desk’ remain neutral. These are regional changes; other later characters still need their own prose/session review.

## Shared task and compatibility

The two IDs, `ridge-watch` and `starfall-lights`, reuse `town.requests` and `town.followedRequest`. Home, Journey, Atlas, field text, NPC markers and native conversations use the same registry. No new accepted-quest format or duplicate task engine was added. Existing rewards remain in the ground-item system.

Regional markers wait for introduced side adventures and a visited region. Starfall's unfinished request follows the Ridge accomplishment. Already owned rewards, completed requests and saved selections retain access. Previous accomplishments qualify without accepting first; older saves need neither another fight nor repeated lens work. Return targets follow the live NPC position, collection targets follow the actual ground gift, and travel uses the existing route finder.

For new adventures, campaign guidance recommends Pending and then Errata after the harbour return, while the Worldwake road is still ahead. Explicitly selected mastery lessons retain priority. The 18-star road remains open without requiring these promises, and optional exploration and borrowed combat arts remain available.

The authored Ridge entrance was unsafe for its request: Pending's old position was within the nearby guard's interaction-blocking range, and that guard could notice the player immediately on arrival. Pending now watches from a stationary post at the western entrance. The same guard stands farther down the road, outside its aggro range at arrival. Ridge guards and shades hold authored posts while idle; they still chase, shoot, retreat, take knockback and receive status effects through their native rules when approached. The lower bat perches farther along the southern road. Combat and watchfire practice remain ahead. Native entry coverage forces nearby foes to wander toward the entrance for six seconds, verifies no damage and a readable request, then proves the posted guard still pursues an approaching player. Other regions and dynamically awakened watchfire guards keep their existing roaming behavior. The optional map-cell `guardPost` flag records this authoring choice; Pending's optional NPC-placement `stationary` flag keeps one routine anchor.

## Deliberate optional reports

New version-2 adventures no longer acquire three incident cards automatically when home becomes available. After the harbour return, Home explains **Local reports**, their familiar-road activities, optional nature and lack of deadlines. **Show local reports** deliberately opens the existing Atlas section and saves the existing `incidents.unlocked` flag. It preserves the selected promise.

Already introduced reports and version-1/pre-opening adventures retain access. Native report goals, completion payouts and replacement reports remain. Ordinary first/penultimate progress and map-entry lists no longer produce extra task toasts. Completion feedback still appears after introduction; broader announcement priority remains on the roadmap.

## Evidence and reproduction

`tests/regional-promises.test.js` exercises the authored safe arrival, actual dialogue choices, decline/accept persistence, native Dark-ward victory, pending Sigil save/re-entry, ground collection, live return targeting, once-only thanks, any-order lenses, instrument prerequisites, native thread payout, older accomplishments, selected lesson/road priorities, explicit report introduction and native incident completion.

The full regression run passed **596 cases**, zero failed/skipped. Final portrait/dialogue/regional checks passed **12 overlapping cases**, including the short-name alias correction. The earlier selected-task/region/thanks integration passed 30 overlapping cases; the entrance/pursuit/route checks passed 16. These are not additional unique tests.

All four final published-host touch/controller × HD/base browser cases passed. All **68 final captures** were inspected in four case sheets, with complete phone return text, TV report controls and TV collection instructions also checked at full size.

`tools/review-regional-promises.cjs` serves the real repository through the simulated published origin, selects the actual title/save slot, and uses native touch actions or the Android TV pad bridge. It follows offers, guardian intro/attacks, collection, real reloads, Journey, Home/Atlas, lenses and both return/revisit responses in HD and base art settings. A pending guardian gift prevents a repeat fight before collection; collected guardians retain their existing practice-rematch behavior.

These are controlled chapter scenarios. They position the player at authored interactions, weaken/isolate the guardian for native final blows, save at regional entrances, remove surrounding foes and approach gifts for collection/lens-state checks, and use controller focus fixtures for menu selection. The authored Ridge entrance and its request are checked with the actual map enemies; collection and return checks isolate task/save behavior from the remainder of each fight. Touch steering uses keyboard movement; touch actions and offer buttons are actual touch input. They do not establish full-fight balance, uninterrupted elapsed pacing, every later NPC's dialogue, physical Android TV viewing-distance readability, real controller navigation or Safari behavior.

```sh
node --test --test-concurrency=6 tests/*.test.js
node tools/review-regional-promises.cjs [baseURL] [captureDirectory]
node tools/render-review-sheet.cjs [captureDirectory] [sheetDirectory]
```

`REVIEW_MODE=touch` or `REVIEW_MODE=controller` limits a review to one input mode. The default browser capture directory is `/tmp/nq-regional-promises-review`; Playwright and Chromium are developer dependencies. Next: review remaining Legend/Mark/Manyfold introductions, then measure a continuous Worldwake session before broadening its NPC promises and caravan gifts.
