# Ground rewards: source audit and collection contract

October 3, 2026. This is a working source audit, not a claim that all rewards have been converted. The user wants every dropped item to be visible and understandable without reading dialogue. Preserve earned progress and exactly-once rewards.

## Current source families

| Source | Existing behavior | Remaining work |
|---|---|---|
| Ordinary combat hearts/mana (`entities.js`, `combat.js`) | Real temporary ground drops, native magnet/collection, twelve-second lifetime | Art and result feedback complete; intentionally distinct from durable earned rewards |
| Miniboss/guardian trophies (`combat.js`) | Trophy and star go straight to inventory on defeat; unlocks and later story react immediately | Durable trophy bundle, visible purpose, safe pending ownership, collection-triggered credit |
| Treasure chests (`world.js`) | Open box reveals durable ground contents; walking over them grants the unique item and its native bundled heal | Complete for all ten current chest item identities; new authored items have parcel/purpose fallback |
| Regional mechanisms and quest gifts | Direct item grants in opening, delivery, prairie, grove, marsh, ridge, mistwood, starfall, glasswater and shattercoast | Inspect each native trigger and purpose before conversion; protect return dialogue and route gates |
| Worldwake favors, marks and final rewards (`worldwake.js`, `endgame.js`) | Persisted accomplishments and immediate item/star/spirit grants | Separate accomplished task from uncollected gift; no replay of legacy thanks |
| Town, incidents, Sunrise requests, mastery | Spirit/stars and completion credit awarded by their existing systems | Audit presentation and reward ownership; do not silently exempt currency rewards |
| Rival, expedition, gauntlet and Wayfinder | Records/contracts may restore campaign location before granting reward | Place durable rewards in the correct restored location; avoid stranding them in temporary arenas |
| Form echoes | Existing visible world lesson/claim system | Retain its native ownership, legacy migration and automatic mastery credit |
| Legend relics (`legends.js`) | Persisted pending rewards with real ground relic and explicit awakening | Retain and inspect the existing pattern; avoid a duplicate reward engine |
| Save migrations (`main.js` and subsystem normalization) | Recover legacy earned items/forms quietly | Preserve existing ownership; never manufacture a second grant from migration |

The item-producing files above are identified by inventory writes. The table groups sources; individual trigger/purpose coverage is still unfinished. Items, stars, spirit, form echoes, marks and temporary health/mana must all be accounted for before declaring the audit complete.

## Durable collection contract

1. Record the accomplishment once when it happens. Record its uncollected reward separately, with a stable source ID, map, safe ground location and explicit effect bundle. Save both together.
2. Show a recognizable object on the ground with a short purpose cue available without dialogue. Claim through the established movement/interaction controls; confirm the actual benefit.
3. Pending earned rewards survive travel, save/reload and defeat. They never inherit the ordinary twelve-second despawn. Temporary arenas return their rewards to an accessible campaign location.
4. Claim changes inventory/currency and clears pending ownership together. Unlock checks and pickup events run once after credit. Reopening a chest, repeating a boss, or revisiting an NPC cannot duplicate the same grant.
5. Old saves retain all already-owned items and awarded currencies. An already-owned unique item cannot become a new pending copy through another source. Source completion remains distinct from inventory ownership when required for repeats and dialogue.
6. Route exits and boss respawns must recognize a defeated source with pending loot. Do not require fighting a defeated boss again or lock the reward behind its own unclaimed item.
7. Do not decorate the ground with a fake pickup after already granting the benefit. The visible object must represent an actual claimable reward.

## Chest contents complete

All ten current chest item identities have authored ground objects: Crest, Seed, Ribbon, Feather, Keystone, Silk, Prism, Chime, Lantern and Memory. Opening records the empty chest and a pending item rather than silently granting inventory. The short reveal beat keeps the object visible; actual movement within eight pixels claims it. Earned contents have no despawn or combat magnet. Their name, purpose and collection instruction appear on the sharp HUD near the reward. Optional regular cards yield to that cue and the ground object; the paper HUD temporarily replaces its optional lesson card. Essential actor/control checks remain. The original bundled heal happens only on claim.

The Crest explains Knight discovery, the Seed names the shelter stump, and the Prism names the northern sundial. The seven current souvenirs explicitly say they are regional mementos; they do not promise an invented combat effect. Unknown newly authored chest items use a parcel and a general journey-purpose cue until given specific art.

Pending ownership is saved separately from temporary drops and survives travel, real browser reload and gentle knockout. Rebuilt cache locations restore their opened state and place the contents beside the current box on safe ground. Already-owned legacy items and rewards awarded by another source cannot pay or heal again. The Crest's opening/campaign guidance follows the revealed object; pickup events, unlock checks and treasure Form Echo placement occur after actual collection.

Validation: 30 regional/item/ordinary-drop checks passed, and a final 12-check save/opening/HUD/chatter/pending suite passed after the UI integration; some cases overlap. Twenty existing progression/save/HUD cases also passed in the earlier integration run whose two new-fixture failures were corrected and rerun in the later suites. No full-suite claim is made. The pending tests exercise all ten native producers, no-expiry, actual collision movement, once-only item/heal/event credit, real save data, travel, a genuinely moved cache, native gentle knockout, legacy/external ownership, Crest guidance/echo and render-state preservation. Existing progression tests now walk over the revealed contents before asserting rewards.

Thirty-six final controlled browser views were inspected: dungeon Crest, Glasswater Prism and Orchard mill Crest, each at ground/reloaded/collected stages, in both settings with touch layout and the actual TV pad bridge. The browser reload executes real main/save normalization, and actual movement collects each item once. These fixtures clear combat and advance campaign state to isolate the native chests. Temporary town-introduction overlays initially obscured the reloaded fixture; final captures settle those existing announcements before inspecting the stable cue. No page errors or horizontal overflow appeared. Desktop checks do not prove physical-device behavior.

Developer atlas: `node tools/render-reward-atlas.cjs /tmp/reward-atlas.png` reviews every ordinary/chest sprite, all poses and both settings at gameplay size and enlarged size. All current poses were inspected.

## Next bounded implementation

Trace miniboss trophy ownership before converting its producer: defeat must remain recorded while its item/star bundle is uncollected, repeated/reloaded encounters must not duplicate it, and exit/story/Worldwake triggers must remain reachable. Extend the existing pending-content contract only after those native consumers are identified. Regional gifts, town/request/currency rewards, challenge return rewards and existing relic/echo systems remain explicitly unconverted/audit-pending.
