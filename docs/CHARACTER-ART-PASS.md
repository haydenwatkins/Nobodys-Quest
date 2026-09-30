# Cute character art pass

Requested September 30, 2026. Ben wants cute characters; Hayden wants fairly high fidelity and cool designs without awkward or odd-looking shapes. This is a fresh review of **every form and boss**, including recently upgraded art. Preserve detailed pixel art, recognizable identities, gameplay timing, hitboxes, saves, and phone landscape readability.

## Direction and acceptance

Use rounded, deliberate silhouettes, expressive eyes with restrained highlights, natural limb attachments, and short readable gestures. Detail should explain cloth, metal, fur, bark, and magic rather than create noisy decorative pixels. Avoid stiff rectangular torsos, hidden faces, spindly ambiguous limbs, and interchangeable stone lumps. Cute bosses can still look powerful through scale, posture, equipment, and clear attack intent. Do not apply one face or identical proportions to the whole roster.

Inspect the actual shipped script order. `opening-art.js`, Ranger, Vampire, Bellkeeper, and delivery overrides supersede parts of the older atlases. Treant has both a normal registry sprite and a larger Orchard battle variant; inspect both. `tools/render-character-review.cjs` makes the current roster sheets with gameplay-size samples. `tools/render-cute-opening.cjs` shows the first batch's directional idle/action poses and larger Treant poses; `--previous` shows the prior opening designs.

Before shipping each batch, inspect at gameplay size and enlarged; inspect all applicable directions and animation poses, both pixel settings, dyes/signature skin compatibility, and a live rendered scene. Test relevant real attack timing and preserve original footprints. Contact sheets and controlled desktop-browser scenes do not establish physical-device performance or ordinary campaign balance.

## September 30 first batch

Nobody now has a rounded coat/head, soft ivory shading, a mint scarf, small boots and clear facial detail. Rat has a pear-shaped fur body, rounded pink ears, a tucked tail curl and visible directional bite poses. Ancient Treant has a rounded leafy crown, bark grain, bright eyes, branch mitts and rooted feet; both sprite variants retain their previous dimensions. No combat timing or boss-warning changes.

All 388 tests pass, including cast-time damage exactly once, real Orchard guardian variant/size, both resolutions, directions, and skin/dye preservation. Chrome at 667x375 showed Rat and the large Treant in Heartwood with no horizontal overflow. That scene was held by the opening dialogue; it is visual inspection, not a boss-balance playthrough. Full pose sheets were inspected too. Signature skins retain the existing five-source-pixel padding in each resolution; this pass did not change that renderer.

## September 30 marsh batch

Frog and Mire Queen now share jade material shading and clear highlighted eyes, with distinct springy and regal silhouettes. Cheeks, attached hind feet, visible tongue gestures, and the Queen's gold/enamel crown and petal collar preserve their identities. Existing 17x13 and 26x19 logical footprints, four pose indices, abilities, ward rules, warnings, and timing remain unchanged. All four enlarged poses were inspected. Chrome at 667x375 displayed the real Marsh scene and Queen sprite without horizontal overflow; this is desktop-browser visual evidence, not physical-device or boss-balance validation.

All 389 tests pass after this batch, including both pixel settings, unchanged footprints, pose indices, dyes/skins, and existing Frog/Queen combat and campaign tests.

## Coverage ledger

The initial contact-sheet audit inspected all 24 forms and 19 boss definitions, plus the separate Orchard Treant. This is a baseline audit, not acceptance of every remaining frame. Each pending entry needs the detailed design/pose pass above. Continue early forms and their corresponding regional guardians before late regions; campaign/balance work resumes after this art priority.

| Form | Fresh pass |
|---|---|
| Nobody | Shipped September 30 |
| Rat | Shipped September 30 |
| Knight | Pending: softer armored proportions; clear helmet expression |
| Ranger | Pending: friendly hooded face; articulated bow poses |
| Wizard | Pending: face visibility, rounded robe, convincing hands/staff |
| Frog | Shipped September 30: sculpted cheeks/body, eyes, feet and tongue |
| Alchemist | Pending: clear face/goggles, satchel and bottle-hand anatomy |
| Stormcaller | Pending: softer mantle, face and natural casting arms |
| Dragon | Pending: cute strong muzzle, coherent wings/feet/tail |
| Riftblade | Pending: readable face, less angular coat, paired blades |
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
| Eclipse Knight | Pending: rounded powerful armor, clear helmet/arms/shield |
| Riftblade Adept | Pending: approachable masked duelist, coherent throwing pose |
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
