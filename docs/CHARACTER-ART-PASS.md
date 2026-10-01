# Cute character art pass

Requested September 30, 2026. Ben wants cute characters; Hayden wants fairly high fidelity and cool designs without awkward or odd-looking shapes. This is a fresh review of **every form and boss**, including recently upgraded art. Preserve detailed pixel art, recognizable identities, gameplay timing, hitboxes, saves, and phone landscape readability.

Expanded scope: the user wants original characters rather than copied Nobody Saves the World identities, may publish someday, and has added environmental art and eventually every NPC portrait/world sprite. Read `ORIGINAL-IDENTITY.md`. The character ledger below is only the first phase; it does not imply environment or NPC coverage is complete. Art for all of these phases precedes further playthrough upgrades. The resumed loop uses the remaining weekly allowance up to exhaustion; the old 50% stop is superseded and the banked reset remains untouched.

## Direction and acceptance

October 1 user correction: detached character decorations are removed across the roster, including reward ribbons/halos/crowns, global outfit accessories, signature particles and fixed-position legend ornaments. Preserve reward/save mechanics, but keep deliberate clothes and equipment within the authored character silhouette. This supersedes earlier notes deferring cosmetic accessory review.

Use rounded, deliberate silhouettes, expressive eyes with restrained highlights, natural limb attachments, and short readable gestures. Detail should explain cloth, metal, fur, bark, and magic rather than create noisy decorative pixels. Avoid stiff rectangular torsos, hidden faces, spindly ambiguous limbs, and interchangeable stone lumps. Cute bosses can still look powerful through scale, posture, equipment, and clear attack intent. Do not apply one face or identical proportions to the whole roster.

Inspect the actual shipped script order. `opening-art.js`, Ranger, Vampire, Bellkeeper, and delivery overrides supersede parts of the older atlases. Treant has both a normal registry sprite and a larger Orchard battle variant; inspect both. `tools/render-character-review.cjs` makes the current roster sheets with gameplay-size samples. `tools/render-cute-opening.cjs` shows the first batch's directional idle/action poses and larger Treant poses; `--previous` shows the prior opening designs.

Before shipping each batch, inspect at gameplay size and enlarged; inspect all applicable directions and animation poses, both pixel settings, dyes/signature skin compatibility, and a live rendered scene. Test relevant real attack timing and preserve original footprints. Contact sheets and controlled desktop-browser scenes do not establish physical-device performance or ordinary campaign balance.

## September 30 first batch

Nobody now has a rounded coat/head, soft ivory shading, a mint scarf, small boots and clear facial detail. Rat has a pear-shaped fur body, rounded pink ears, a tucked tail curl and visible directional bite poses. Ancient Treant has a rounded leafy crown, bark grain, bright eyes, branch mitts and rooted feet; both sprite variants retain their previous dimensions. No combat timing or boss-warning changes.

All 388 tests pass, including cast-time damage exactly once, real Orchard guardian variant/size, both resolutions, directions, and skin/dye preservation. Chrome at 667x375 showed Rat and the large Treant in Heartwood with no horizontal overflow. That scene was held by the opening dialogue; it is visual inspection, not a boss-balance playthrough. Full pose sheets were inspected too. Signature skins retain the existing five-source-pixel padding in each resolution; this pass did not change that renderer.

## September 30 marsh batch

Frog and Mire Queen now share jade material shading and clear highlighted eyes, with distinct springy and regal silhouettes. Cheeks, attached hind feet, visible tongue gestures, and the Queen's gold/enamel crown and petal collar preserve their identities. Existing 17x13 and 26x19 logical footprints, four pose indices, abilities, ward rules, warnings, and timing remain unchanged. All four enlarged poses were inspected. Chrome at 667x375 displayed the real Marsh scene and Queen sprite without horizontal overflow; this is desktop-browser visual evidence, not physical-device or boss-balance validation.

All 389 tests pass after this batch, including both pixel settings, unchanged footprints, pose indices, dyes/skins, and existing Frog/Queen combat and campaign tests.

## September 30 armored pair

Knight now has rounded steel plates, small boots, a soft cape and clear helmet eyes in all four directions. The same sprite carries through Orchard guards. Eclipse Knight has distinct violet armor, short curved moon horns and a crescent shield. Both swords keep a consistent apparent length through the strike. The 28x24 and 24x24 footprints, Slash windup/damage, guard behavior, boss wards and hazard timing remain unchanged.

The full 389-test suite passed; after the final sword/horn geometry refinement, targeted opening-art tests passed again, including real Slash damage once and skin/dye/direction compatibility. Enlarged directional idle/strike sheets and the actual Ember Ridge introduction in Chrome at 667x375 were inspected with no horizontal overflow. Combat was paused by dialogue for the live visual check; ordinary fight pacing and physical hardware remain untested.

## Bramble Scout and Starwick Sage

The former Ranger now has rounded boots/torso, a generous leaf hood and visible eyes/cheeks. His front/rear drawing hand meets the bow rather than extending away from its grip; the existing fixed-aim draw/release timing, once-only arrow, travel cancellation and shifting rules remain. The former Wizard becomes a soft-robed old sage with a visible face/beard, felt cap and walnut starlight staff. All four directions now have idle, six walking beats and three casting beats (48 frames). Native Curse still fires immediately with real recoil and no new windup, displacement or mana cost. Both original footprints remain.

All 391 tests pass, including immediate real Curse casting and the existing Scout draw/release checks. All directional poses and their signature-skin variants were rendered and inspected. Chrome at 667x375 showed both actual Lantern Reach appearances and their new names without horizontal overflow. A first local load omitted early script resources and failed to boot; reloading fetched the missing resources and rendered successfully. No persistent implementation fault reproduced. These dialogue-paused scenes are visual checks, not campaign balance or physical-device evidence.

## Coverage ledger

### Hearthdrake and the Wayglass Court (October 1)

Hearthdrake has copper-red scales, a rounded muzzle, short ivory horns, distinct membranous wings, four feet and a tapered tail. Its 48 directional frames distinguish belly plates from back scales. Wayglass Duelist has a visible face, rounded travel cap, folded scarf and paired glass knives; Mira, Wayglass Keeper has a woven hood, copper-bound braid and larger knives. Their 28x19, 19x19 and 25x24 world footprints, native cast timing, three-cut rhythm, ward, returning blades, arena routes and rewards remain unchanged. Visible names, sigil and court text follow the original roadkeeper identities; internal IDs remain stable.

The full 395-test suite passed, including all guardian phases and returning-blade recovery. A live portrait check then revealed Errata matching RAT inside her name; exact leading-name matching fixes it, and the four focused art/portrait/opening checks pass afterward. Default and signature 48-pose sheets and all four Mira indices were inspected. Chrome at 667x375 rendered Hearthdrake and Mira's real court introduction, then the Duelist at Lantern Reach, with no horizontal overflow. Dialogue paused the combat checks; this does not establish ordinary fight balance or physical-device performance. Existing cosmetic accessories remain for later review.

### Copperwick Brewer and Cloudcap Conductor

Both now have 48 directional idle/walk/cast/guard frames. Brewer has forehead goggles that leave the face visible, a copper apron pocket, herb satchel and a glass flask held by an attached hand. Conductor has a cloud-soft cap, warm face, violet mantle, brass cuffs and an illuminated casting gesture. Their existing 18x18 and 19x19 world footprints, ability IDs, passive rules and immediate cast behavior remain unchanged. The field identity panel now makes room for longer calling names while preserving the level and space beside boss/story guidance.

All 393 tests pass; after the final HUD width adjustment, focused art and opening progression tests pass again. Default and signature full-pose sheets were inspected. Chrome at 667x375 rendered both real Lantern Reach appearances; an actual keyboard flask cast produced the flask and recovery indicator. No horizontal overflow appeared. These are desktop-browser checks, not physical-device or ordinary encounter-balance evidence. Existing skin accessory treatments remain for the cosmetic review.

### Patchling: an original protagonist

The starting traveller now has a folded canvas hood with stitching, a copper map patch, repaired teal coat, small boots and mint scarf. All 48 directional poses retain the existing 28x24 footprint and Slap performance. The opening road, six chapter scenes, recap, ending, NPC references and save labels use the living-map premise; the legacy `nobody` ID, chapter IDs/numbers, quest IDs, cosmetic IDs and rewards remain unchanged. Pip's wooden dragon is Thimble.

All 391 tests pass, including opening/delivery progression and legacy-save checks, chapter/ending scenes, save slots and real Slap timing. Full directional/default and signature-skin pose sheets were inspected. Chrome at 667x375 displayed the actual Orchard opening, Patchling's name and matching dialogue portrait without horizontal overflow. This is desktop-browser visual evidence, not a physical phone or ordinary combat-balance playthrough. Existing signature accessory designs remain for the later cosmetic review.

The initial contact-sheet audit inspected all 24 forms and 19 boss definitions, plus the separate Orchard Treant. This is a baseline audit, not acceptance of every remaining frame. Each pending entry needs the detailed design/pose pass above. Continue early forms and their corresponding regional guardians before late regions; campaign/balance work resumes after this art priority.

| Form | Fresh pass |
|---|---|
| Nobody / Patchling | Shipped September 30: original canvas traveller, seams/map patch, repaired coat and matching opening story |
| Rat | Shipped September 30 |
| Knight | Shipped September 30: rounded steel plates, clear helmet eyes, all directions |
| Ranger / Bramble Scout | Shipped September 30: generous leaf hood, clear face, articulated bow |
| Wizard / Starwick Sage | Shipped September 30: old sage face/beard, soft robe, directional staff casting |
| Frog | Shipped September 30: sculpted cheeks/body, eyes, feet and tongue |
| Alchemist / Copperwick Brewer | Shipped September 30: forehead goggles, warm face, field apron, herb satchel and articulated glass flask |
| Stormcaller / Cloudcap Conductor | Shipped September 30: soft cloud cap, warm face, violet mantle, brass cuffs and directional casting |
| Dragon / Hearthdrake | Shipped October 1: rounded muzzle, horns, four feet, wings, tapered tail and directional scale/belly detail |
| Riftblade / Wayglass Duelist | Shipped October 1: visible face, travel cap, folded scarf and paired glass knives in all directions |
| Mole | Pending: rounded fur, separate paws and digging intent |
| Vampire | Pending: charming face, coherent cape/arms in all directions |
| Jester | Pending: expressive face, soft fabric and playful gestures |
| Turtle | Pending: sculpted shell/feet/head, defensive poses |
| Samurai | Pending: cute face under hat, coherent robe and sword grip |
| Astronomer | Pending: readable face, rounded coat, deliberate instrument |
| Druid | Pending: face distinct from branches, organic costume/gesture |
| Griffin | Pending: coherent eagle/lion anatomy, soft beak and proud wings |
| Golem | Pending: rounded stone body with separate limbs and expression |
| Weaver | Pending: friendly spider face, attached readable legs |
| Bellkeeper | Pending: rounded bell silhouette and charming face, all casts |
| Lantern Wisp | Pending: flame expression, clear cage and soft wisps |
| Colossus | Pending: powerful friendly anatomy, distinct from Golem |
| God | Pending: charming regal silhouette, clear mantle/halo/arms |

| Boss | Fresh pass |
|---|---|
| Ancient Treant | Shipped September 30, registry and Orchard variants |
| Mire Queen | Shipped September 30: regal jade frog, crown/petal collar, feet and tongue |
| Eclipse Knight | Shipped September 30: violet armor, moon horns, crescent shield |
| Riftblade Adept / Mira, Wayglass Keeper | Shipped October 1: visible face, woven hood, braid, soft mantle and articulated knife gesture |
| Mole Monarch | Pending: cute royal mole, clear digging paws |
| Countess Carmine | Pending: charming countess, shaped cape and casting arms |
| Royal Fool | Pending: playful expressive face, natural pie/card poses |
| Admiral Tortoise | Pending: proud naval turtle with sculpted shell and limbs |
| Paper Ronin | Pending: clear cute face, folded robe and sword grip |
| Professor Perihelion | Pending: scholarly face, clear instruments and coat |
| Grandmother Briar | Pending: kind powerful gardener, readable face/hands |
| Aurelia, Sky Sovereign | Pending: cute regal griffin, coherent wings and talons |
| Pillar, Old Mason | Pending: rounded stone mason, distinct arm/body shapes |
| Tess, Silk Matriarch | Pending: friendly silk guardian, attached readable limbs |
| Bongle, Bell Titan | Pending: powerful round bell, expression and metal detail |
| Mallow, Lantern Keeper | Pending: charming flame/cage guardian, readable casting pose |
| Atlas, Last Worldbearer | Pending: strong gentle face and worldheart stone anatomy |
| God of Every Form | Pending: cute final guardian with regal, coherent gestures |
| Tollkeeper | Pending: charming clockwork coat/face, clear staff and mechanisms |
