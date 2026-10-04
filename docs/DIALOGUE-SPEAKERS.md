# Dialogue identity and portrait coverage

October 3, 2026. `js/data/dialogue-portraits.js` is the shared identity resolver and portrait registry. Both paper opening/delivery dialogue and regular dialogue use it. Thirteen NPCs have separately composed 32x32 bust portraits based on their authored faces, with role-specific collars/aprons/armour. Forms and guardians use their existing reviewed authored character cards, fitted without stretching or cropping away parts of the body. Unknown headings receive a neutral open journal, never a borrowed face.

| Native producer | Heading examples | Identity treatment |
|---|---|---|
| NPC conversations and rumors | icon + full name + chapter/rumor suffix | All 13 named NPC portraits |
| Opening/delivery | Parcel; Parcel, From the Other Side; Ser Pending | Courier Parcel; Sir Pending aliases |
| Sunrise requests | Brindle; Mara; Pip; Pebble | Correct quay/guide NPC portraits |
| Route/region advice | Pebble Notices; Pebble · New Region | Pebble portrait |
| Form discoveries and spoken form lines | icon + form name; Rat; Knight; Patchling | All 24 current form identity cards |
| Guardian introductions, rematches and victories | decorated full guardian name; Worldbearer of domain | All 19 current guardian identity cards |
| Guardian phase messages | full name — Phase II / III | The same guardian card |
| Final chapter scene | The Last Worldbearer | Atlas, Last Worldbearer alias |
| Chapter narration/recap and road hints | The Story; The Road | Neutral journal |
| Mechanisms and regional discoveries | The Old Stump; The Blind Sundial; The Star Instrument; Tideglass headings | Neutral journal/object notice |
| Signs, chests, pantry/reward/mark/legend announcements | Sign; Treasure Chest; Form Echo; mark/legend titles | Neutral journal/announcement |
| Recovery headings | Crown's Second Wind; Trial Lost; A Gentle Landing | Neutral recovery notice |
| New or unmatched headings | an unregistered name/title | Neutral journal; no invented identity |

Matching uses complete names, explicit aliases and native suffix forms. It does not search arbitrary substrings: Errata cannot become Rat, Brindleberry cannot become Brindle, and “Mara’s Letter” does not pretend Mara is speaking. Decorative leading/trailing icons are removed. Guardian domains and phase headings are tested against the actual registry. Neutral handling is deliberate for an object or announcement, not evidence that it has a character portrait.

## Evidence

All thirteen busts and all twenty-four form/nineteen guardian cards were inspected in HD/base portrait atlases; Atlas's chapter alias was rechecked after the source audit. Focused tests exercise native identities, aliases, domains/phases, neutral headings, palette validity, the real opening renderer, standard HUD renderer, dialogue queues/callbacks and controller/input regressions. Existing NPC conversation/save and art checks passed as part of the portrait integration.

Thirty final controlled browser captures cover paper Brindle dialogue, standard Errata/Probably dialogue, neutral narration and a guardian card at phone 667x375, tablet 1024x768 and TV 1280x720 in both settings. Phone/tablet continuation uses actual touch events. TV continuation uses the real injected Android TV pad bridge and confirms the controller is recognized. An initial fixture had pending world-entry messages mixed into its deliberately injected message; the final fixture drains those before asserting a single-message queue. All final captures were inspected and reported no page errors or horizontal overflow. This is desktop Chromium/bridge emulation, not physical Safari/Android/TV or viewing-distance evidence.

`node tools/render-dialogue-atlas.cjs OUTPUT_DIRECTORY --all` exports the current complete card audit in pages of twenty, using shipped script order. The default exports NPCs and representative other identities. These review files are developer artifacts; the game remains a static site with no build dependency.

## Regional short names (October 4)

The Ridge/Starfall scene review found that the new `ERRATA` heading used neutral narration despite her existing portrait. It now has an explicit short-name alias to Archivist Errata. Longer unrelated desk/object headings remain neutral, with native resolver/painting regression coverage. `REGIONAL-PROMISES.md` records the regional browser scenes and final validation.
