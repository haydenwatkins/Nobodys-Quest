# Ground rewards: source audit and collection contract

October 3, 2026. This is a working source audit, not a claim that all rewards have been converted. The user wants every dropped item to be visible and understandable without reading dialogue. Preserve earned progress and exactly-once rewards.

## Current source families

| Source | Existing behavior | Remaining work |
|---|---|---|
| Ordinary combat hearts/mana (`entities.js`, `combat.js`) | Real temporary ground drops, native magnet/collection, twelve-second lifetime | Art and result feedback complete; intentionally distinct from durable earned rewards |
| Miniboss/guardian trophies (`combat.js`) | Trophy and star go straight to inventory on defeat; unlocks and later story react immediately | Durable trophy bundle, visible purpose, safe pending ownership, collection-triggered credit |
| Treasure chests (`world.js`) | World chest opens near the player and directly grants its item/heal | Visible contents, pending reward after opening, unique ownership across sources/reload |
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

## Next bounded implementation

Choose one persistent source and exercise its real producer, collection, travel/reload, repeat, legacy ownership and follow-on progression. Begin with treasure chests if their native interaction permits a clear ground reveal without disrupting boss/exit ownership. Only then broaden the contract to trophy producers and regional gifts. Keep unconverted categories explicitly listed here.
