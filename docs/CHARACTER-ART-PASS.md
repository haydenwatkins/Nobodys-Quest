# Cute character art pass

Requested September 30, 2026. Ben wants cute characters; Hayden wants fairly high fidelity and cool designs without awkward or odd-looking shapes. This is a fresh review of **every form and boss**, including recently upgraded art. Preserve detailed pixel art, recognizable identities, gameplay timing, hitboxes, saves, and phone landscape readability.

Expanded scope: the user wants original characters rather than copied Nobody Saves the World identities, may publish someday, and has added environmental art and eventually every NPC portrait/world sprite. Read `ORIGINAL-IDENTITY.md`. The character ledger below is only the first phase; it does not imply environment or NPC coverage is complete. Art for all of these phases precedes further playthrough upgrades. The user raised the resumed loop to approximately 70% total weekly usage consumed (30% remaining), including other tasks; this supersedes the former 50% consumed target. Leave future reset credits untouched.

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

The fresh form/boss phase is complete. Track the separate 40-map environment phase in [ENVIRONMENT-ART-PASS.md](ENVIRONMENT-ART-PASS.md); its first Orchard/Heartwood foliage/ground batch is partial, with structures/props and all other regions pending. Every NPC world sprite and portrait still needs a fresh review after environments.

### Tollkeeper (October 1)

The Tollkeeper is now a riveted bronze river-otter with round ears, warm muzzle/whiskers, rolled rain hood, rounded fitted coat, receipts tucked into sewn pockets, joined tail, bound leather ledger and a lantern held on a short chain. Its 52x55 footprint, four guardian indices, hitbox, warning pose, flood/sweep/refuge clocks and delivery/save rewards remain stable. Shared-module quay NPCs remain for their separate later review.

All 426 regression checks pass. Every pose and both pixel settings were inspected at gameplay size and enlarged; the real flood warning selects the raised lantern, and cancellation returns to rest. Delivery and walking-refuge checks pass. Chrome at 667x375 displayed the actual Tollkeeper with Patchling through a save-disabled local fixture without overflow or console errors. Story recap pauses combat; ordinary balance and physical-device checks remain outstanding. Fresh character coverage is now 24/24 forms and 19/19 boss definitions, including the normal/Orchard Treant variants. Environments across all regions and every NPC world sprite/portrait still need their fresh pass before returning to playthrough work; this is not a completed originality/publication review.

### Wayheart and Meridian (October 1)

The final calling now appears as Wayheart, Patchling's completed living map: a warm folded-canvas face, stitched teal route coat, carried map and brass route quill. Meridian, the Perfect Map, has a pale folded face, meticulous indigo chart coat, map ledger and an attached compass staff. The impossible-ideal story role remains: demanding one perfect answer sealed the roads. Chapter recap, NPC lore, final guidance and ending use the original identity. No floating halo, crown or orbiting ornaments remain. Their 26x24/29x27 footprints, 48 directional player poses/four guardian indices, internal IDs, mastery gate, Providence, any-ward rule and every exam warning/recovery remain stable.

All 424 regression checks pass, including real-input immediate Waylight, an unmatched ward opening once, paid light/dark arts, Providence across form changes/phases and all final-exam lesson fields. Default/signature sheets and both pixel settings were inspected at gameplay size and enlarged. Chrome at 667x375 displayed actual Wayheart and Meridian through a save-disabled local fixture without overflow or console errors. Story recap pauses combat; ordinary balance and physical-device checks remain outstanding. Coverage is now 24/24 forms and 18/19 boss definitions. Tollkeeper remains before environment/NPC work.

### Cragback and Atlas (October 1)

Colossus now appears as Cragback, a gentle basalt cliff-bear with rounded ears, soft carved muzzle, broad joined paws, rooted shoulder moss and a coral worldheart seam. Atlas has older russet stone, pale brows/muzzle and larger paws. A single clear head and joined bear anatomy replace the old overhead globe/body-face. The 48 directional player poses/four guardian indices retain 25x23/30x28 footprints, stable IDs, immediate Pillar Fist, Worldweight, shoulder/break, Worldheart/Lodestone and Titan grid/refuge/recovery.

All 422 regression checks pass, including real-input fist damage once and Worldweight preserving position/pose while retaining incoming damage, alongside shoulder, ward, travel and three-phase field coverage. Default/signature sheets, guardian indices and both pixel settings were inspected at gameplay size and enlarged. Chrome at 667x375 displayed actual Cragback and Atlas through a save-disabled local fixture without horizontal overflow or console errors. Story recap pauses combat; ordinary encounter balance and physical-device checks remain outstanding. Coverage is 23/24 forms and 17/19 boss definitions. The final calling/guardian and Tollkeeper remain before environment/NPC work.

### Wickling and Mallow (October 1)

Lantern Wisp now appears as Wickling, with a warm flame face inside rounded storm glass, bowed copper ribs, hinged shutters and joined handles/feet. Mallow has a broader weathered lantern with a warm older flame face. Loose ornamental wisps are absent. The 48 directional player poses/four guardian indices preserve 19x20/26x26 footprints, stable IDs, native dark Wick Lash/light burst, Safe Light, drift, Lantern Mark/Ember and storm refuge/recovery.

All 420 regression checks pass. Default/signature sheets, all guardian indices and both pixel settings were inspected at gameplay size and enlarged. Native lash/light-circle, drift, Stormspine route/refuge/recovery and Ember checks pass. Chrome at 667x375 displayed actual Wickling and Mallow through a save-disabled local fixture without horizontal overflow or console errors. Story recap pauses combat; ordinary encounter balance and physical-device checks remain outstanding. Coverage is now 22/24 forms and 16/19 boss definitions. Continue Colossus/Atlas in Titan Grave, then final calling/guardian and Tollkeeper before environments/NPCs.

### Chimelet and Bongle (October 1)

Bellkeeper now appears as Chimelet: rounded hammered bronze, warm eyes/cheeks, joined cast-metal loop/handles, engraved rim and attached swinging clapper. Bongle has older teal metal, a broad bronze lip and a warm face. The old frayed ribbon is absent. All 72 directional ringing/peal/silence player frames and four guardian indices retain 21x20/27x26 footprints, stable IDs, third peal, Resonance, silence, Echo Mark/Clapper and delayed-echo warning/recovery.

All 418 regression checks pass. Complete default/signature sheets and all guardian indices were inspected, including both pixel settings at gameplay scale and enlarged. Real-input peal/recovery, silence, Resonance, Clapper and three-phase echo/refuge/recovery checks pass. Chrome at 667x375 displayed actual Chimelet and Bongle through a save-disabled local fixture without horizontal overflow. Story recap pauses combat; ordinary encounter balance and physical-device checks remain outstanding. Coverage is now 21/24 forms and 15/19 boss definitions. Continue Lantern Wisp/Mallow in Stormspine, then remaining characters, environments and NPCs.

### Silkstep and Tess (October 1)

Weaver now appears as Silkstep, a soft spider stitcher with a warm jumping-spider face, eight joined legs, fitted woven work-wrap and a needle carried in a forepaw. Tess has an older ivory face, cranberry silk, copper wrap clasp and a held needle/reel. The fresh pose review corrected a clipped needle tip/foot edges and kept tools attached during walking. The player has 48 directional poses; the guardian keeps four indices. Their 23x19/30x23 footprints, stable IDs, Thread Mark/Spindle, Lifeline, chain/cocoon, restored passages and guardian warning/recovery remain unchanged. The detached crown is absent.

All 418 regression checks pass, with four focused art/decoration/native checks passing after the final dark-pupil refinement. Default/signature sheets and all guardian indices were inspected in both pixel settings at gameplay scale and enlarged. Chrome at 667x375 displayed the actual player and guardian through a temporary local fixture, without horizontal overflow or console errors. The regular builder inherited all regional marks and removed defeated guardians, so its earlier region screenshots show form echoes, not both encounter participants. The fixture clears only its in-memory marks and disables saving. Story recap pauses combat; ordinary balance and physical-device checks remain outstanding. Coverage is now 20/24 forms and 14/19 boss definitions. Continue Bellkeeper with Bongle, then remaining characters, environments and NPCs.

### Cobblekin and Pillar (October 1)

Golem now appears as Cobblekin, a friendly stone roadmender with rounded joined limbs, clear carved face, a mossy forelock and quartz keystone fitted into the chest. Older Pillar has weathered pale stone, a canvas mason's apron, a held trowel and broad grounded casting palms. The player has 48 directional poses; the guardian retains four indices. Their 22x21/28x26 footprints, stable IDs, native third-punch rhythm, Masonry cover, monolith, Stone Mark/Plumbline and three-phase terrace recovery remain unchanged.

All 416 regression checks pass. Complete default/signature sheets and all guardian indices were inspected, including both pixel settings at gameplay scale and enlarged. Real-input third-punch and paid Rampart/hostile-only cover, monolith, garden routes, terrace recovery and Plumbline checks pass. The initial Chrome region check inherited a completed mark and showed the form echo. A later 667x375 save-disabled local fixture rendered actual Cobblekin and Pillar without horizontal overflow. Story recap pauses combat; ordinary encounter balance and physical-device checks remain outstanding. Coverage at shipping was 19/24 forms and 13/19 boss definitions. Continue Weaver with Tess in Rootdeep, before remaining character, environment and NPC art.

### Galecrest Courier and Aurelia (October 1)

Griffin now appears as Galecrest Courier, a feathered cliffpost courier with rounded lion haunches, a soft expressive eagle face, layered honey wings, fitted teal neckcloth and leather dispatch pouch. Aurelia's older ivory ruff, broad blue feather fan and copper chest harness distinguish the guardian. The courier has 48 directional idle/walk/strike/guard frames; Aurelia retains four guardian indices. Their 28x19/30x22 footprints, save IDs, Sky Mark/Plume, combat timing, gust escape/recovery, ward and regional unlock remain unchanged. No detached crown or ornament returns.

All 413 regression checks pass. Complete default/signature sheets and all guardian indices were inspected, including both pixel settings at gameplay scale and enlarged. Real-input immediate Wingbeat/Slipstream shove, fan/dive, gust and Plume checks pass. The initial Chrome region check inherited a completed mark and showed the form echo. A later 667x375 save-disabled local fixture rendered actual Galecrest Courier and Aurelia without horizontal overflow. Story recap pauses combat; ordinary encounter-balance and physical-device validation remain outstanding. Coverage at shipping was 18/24 forms and 12/19 boss definitions. Continue Golem with its Hanging Gardens guardian next, before remaining character, environment and NPC art.

### Hedgehare and Grandmother Briar (October 1)

The former Druid now appears as Hedgehare, a soft-furred garden neighbour with one folded ear, clear muzzle/eyes, a fitted sage apron, a seedling basket and pruning cane carried in its paws. Briar has a warm older face, silver braid, straw hat with a sewn flower, work apron and carried basket/cane. Their 21x20/27x25 footprints, 48 directional player poses/four guardian indices, internal IDs, Elder Acorn, poison/Seedbed, rooting and flowerbed warning/refuge/recovery remain unchanged. Equipment belongs to their authored silhouettes; no detached decorative layer is added.

All 411 regression checks pass. Complete default/signature sheets, all guardian indices, and both pixel settings at gameplay scale and enlarged were inspected. Real-input Thorn Lash hits immediately once, retains poison attribution and recovers without a second melee hit. Existing status spread, ward rejection, rooting and three-phase flowerbed escape checks pass. Chrome at 667x375 displayed both in the actual Walking Garden without horizontal overflow. Story recap paused combat; physical-device and ordinary encounter-balance validation remain outstanding. Continue Griffin with its regional guardian next, before remaining character, environment and NPC art.

### Skylens Mapper and Nell, Starpath Keeper (October 1)

The former Astronomer and Professor Perihelion now appear as visible-faced night-route scholars. Skylens Mapper has soft dark hair, warm skin, brass spectacles, a blue field coat and a segmented telescope held in the hand. Older Nell has ivory curls, stitched star-chart details and a larger instrument. Their faces replace the oversized orbital head rings. The Starpath Observatory retains its arena ID; their 21x20/26x25 footprints, 48 directional player poses/four guardian indices, save IDs, Orrery Key, fourth-shot alignment and three-phase orbital-band safety remain unchanged.

All 409 regression checks pass; focused art/decoration checks pass after the final pupil refinement. Complete default/signature sheets, every guardian index, and both pixel settings at gameplay scale and enlarged were inspected. Real input launches exactly one needle immediately; only the fourth passes through a second foe, and each foe takes damage once per shot. Existing gravity, orbital warning/refuge/recovery and interruption checks pass. Chrome at 667x375 displayed the pair in the actual observatory without horizontal overflow. Story recap paused combat; physical-device and ordinary encounter-balance checks remain outstanding. Continue Druid with its Shattercoast guardian next, before remaining character, environment and NPC art.

### Foldstep Fox and Sumi, Foldroad Keeper (October 1)

The former Samurai and Paper Ronin now appear as warm-faced fox routekeepers. Foldstep Fox wears a short indigo wrap coat, mint belt and map case; older Sumi has silver fur, a teal pleated coat and coral/ivory collar. Their tails join their bodies and their hands hold the blades through every pose. The Foldroad Hall, Wayfold Crane and Moonfold appearance preserve the existing arena, reward and skin IDs. Their 20x20/25x25 footprints, 48 directional player poses/four guardian indices, timed third draw, dash, wards and marked fold-cut escape/recovery remain unchanged.

All 407 regression checks pass, with the focused Shattercoast checks passing after the final keepsake-label update. Full default/signature sheets, every guardian index, and both pixel settings at gameplay scale and enlarged were inspected. Real-input cuts damage once on the input frame, recover visually and preserve the three-beat rhythm and pause reset. Existing three-phase cut warnings, narrow collision, interruption and escape checks pass. Chrome at 667x375 rendered both in the actual hall without horizontal overflow; a brief inspection timeout under the test load cleared on the next screenshot. The story recap paused combat, so this is browser appearance evidence, not ordinary encounter-balance or physical-device validation. Continue Astronomer with its Shattercoast guardian next.

### Harborback and Marlo, Breakwater Keeper (October 1)

Harborback now has a rounded sea-worn shell with joined copper scutes, an expressive terrapin face, four attached flippers and a fitted neck cloth. Marlo wears a rolled dock cap and work bib; a rope harness follows his larger shell. These are shorekeepers who help little boats and travellers get home, rather than naval caricatures. Their 21x16/29x21 footprints, 48 directional player poses/four guardian indices, internal IDs, Tide Shell reward and arena routes remain unchanged.

Default/signature full pose sheets, every guardian index, and both pixel settings at gameplay scale and enlarged were inspected. All 405 checks pass across the full run and a focused rerun of updated guardian/form naming assertions. Real-input jabs retain immediate damage, short ordinary guard and the third-hit brace; existing counter, travel expiry, tide refuge/warning and shell recovery checks pass. Chrome at 667x375 displayed the pair in the actual Breakwater Bastion without horizontal overflow. Story recap paused the scene, so this is browser visual evidence, not ordinary encounter-balance or physical-device validation. Continue Samurai with its regional guardian next.

### Pocket Trouper and Tansy, Caravan Star (October 1)

The former Jester now has a rounded plum stage coat, teal neckcloth, fitted beret, clear warm face, small boots and a fan of cards gripped in an articulated hand. Tansy's teal coat, copper-tied braid and hand-held pie distinguish the guardian. Their 20x20/25x25 footprints, 48 directional player poses/four boss indices, save IDs, card/ricochet rhythm, pie warnings, escape times and recovery remain intact. The Wayward Stage and Curtain Bell retain the existing arena/reward IDs.

All default/signature directional poses and Tansy's four indices were inspected. All 403 tests pass, including real-input joker, wardrobe/decoration, ricochet and three-phase pie-warning/recovery checks; focused art/guidance checks also pass after the final naming copy. Chrome at 667x375 rendered both in the real Wayward Stage without horizontal overflow. The scene was dialogue-paused; it is visual browser evidence, not ordinary fight pacing or physical-device validation. Next: Turtle and its Shattercoast guardian.

### Velvetwing and Vesper, Dusk Host (October 1)

The former Vampire is now an original bat roadkeeper with expressive ears, a warm muzzle, plum waistcoat and folded membranes attached to shoulders and thumbs. Vesper has a rose coat, soft ivory ruff, sewn duskflower brooch and larger casting wings. Their 20x20 and 25x25 footprints, 48 directional player poses/four boss indices, internal IDs, bite/healing, dash and waltz rules remain intact. The renamed Dusk Court and Duskflower Seal retain their routes and save keys.

The signature review exposed halo/cape ornaments still stamped into the sprite grids. That generic builder is removed across all 24 looks: each now retains the exact source poses, occupied pixels, footprint and feet, using its earned material palette. Unlock/save IDs and wardrobe choices remain. Descriptions now name colors instead of removed ornament shapes. This supersedes older notes about five-pixel signature padding and deferred accessory review. `tools/render-character-review.cjs --skins` can inspect the complete wardrobe.

All 48 default/signature poses and four Vesper indices were inspected, along with the three-page wardrobe sheet covering every signature look. All 401 tests pass, including real immediate bite/pose, healing/overflow, wardrobe/save progression, guardian warning/escape/recovery and all-form decoration checks. Chrome at 667x375 showed both characters in the actual Dusk Court without horizontal overflow. An additional paused local fixture displayed Daybreaker on the real player. The live world was dialogue-paused; this is visual browser evidence, not physical-device or ordinary encounter-balance validation. Next: Jester and its regional guardian.

### Tunneltuft and Bram, Tunnelwarden (October 1)

Tunneltuft has rounded soft fur, a warm muzzle, fitted headlamp band, small neckerchief and articulated digging paws in 48 directional poses. Bram wears a copper root crown attached to its band and a work bib, with broader attached paws and a clear face. Their 19x15 and 26x21 footprints, internal IDs, native cast timing, third-tap eruption, Burrow Blitz, Aftershock, wards and boss warnings remain unchanged. Visible names and Copper Root Crown now describe keepers of the roads beneath the roots.

Default/signature directional sheets and all four Bram indices were inspected. All 399 checks pass across the full run and the focused rerun of an updated dialogue assertion, including the real-input three-tap rhythm, immediate damage, stun, appearance compatibility and existing boss escape/recovery tests. Chrome at 667x375 rendered both in The Royal Burrow, with no horizontal overflow; the first local load missed a legends script, and a reload rendered successfully. These dialogue-paused browser checks do not establish ordinary encounter balance or physical-device performance. Continue Vampire with its regional guardian next.

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
| Mole / Tunneltuft | Shipped October 1: soft fur, warm muzzle, fitted headlamp and 48 directional digging poses |
| Vampire / Velvetwing | Shipped October 1: velvet ears, warm muzzle, fitted waistcoat and attached directional membrane wings |
| Jester / Pocket Trouper | Shipped October 1: rounded stage coat, beret, warm face and 48 directional hand-held card poses |
| Turtle / Harborback | Shipped October 1: rounded scuted shell, expressive terrapin face, attached flippers and fitted neck cloth in all directions |
| Samurai / Foldstep Fox | Shipped October 1: warm fox face, indigo wrap coat, map case, joined tail and held blade in every direction |
| Astronomer / Skylens Mapper | Shipped October 1: warm face, brass spectacles, blue field coat and held segmented telescope in every direction |
| Druid / Hedgehare | Shipped October 1: soft hare face, folded ear, sage apron and basket/pruning cane carried in every direction |
| Griffin / Galecrest Courier | Shipped October 1: rounded lion/eagle anatomy, expressive beak, layered joined wings, dispatch pouch and 48 directional poses |
| Golem / Cobblekin | Shipped October 1: friendly carved face, moss rooted in stone, separate rounded joints and 48 directional poses |
| Weaver / Silkstep | Shipped October 1: warm spider face, eight joined legs, fitted woven wrap, held needle and 48 directional poses |
| Bellkeeper / Chimelet | Shipped October 1: rounded bronze metalwork, warm face, joined loop/handles/clapper and all 72 directional cast poses |
| Lantern Wisp / Wickling | Shipped October 1: warm flame face, rounded storm glass, bowed copper frame, joined handles/feet, hinged shutters and 48 directional poses |
| Colossus / Cragback | Shipped October 1: soft basalt bear face, round ears, broad joined paws, rooted moss, worldheart seam and 48 directional poses |
| God / Wayheart | Shipped October 1: warm folded canvas face, stitched teal route coat, carried map/quill and 48 directional poses; no halo or orbit ornaments |

| Boss | Fresh pass |
|---|---|
| Ancient Treant | Shipped September 30, registry and Orchard variants |
| Mire Queen | Shipped September 30: regal jade frog, crown/petal collar, feet and tongue |
| Eclipse Knight | Shipped September 30: violet armor, moon horns, crescent shield |
| Riftblade Adept / Mira, Wayglass Keeper | Shipped October 1: visible face, woven hood, braid, soft mantle and articulated knife gesture |
| Mole Monarch / Bram, Tunnelwarden | Shipped October 1: warm face, broad digging paws, work bib and fitted copper root crown |
| Countess Carmine / Vesper, Dusk Host | Shipped October 1: expressive bat face, ivory ruff, sewn duskflower brooch and attached casting wings |
| Royal Fool / Tansy, Caravan Star | Shipped October 1: teal stage coat, copper-tied braid and attached pie/card gestures |
| Admiral Tortoise / Marlo, Breakwater Keeper | Shipped October 1: rounded harbor turtle, dock cap, fitted bib and shell-following rope harness |
| Paper Ronin / Sumi, Foldroad Keeper | Shipped October 1: silver fox face, pleated teal/coral coat, joined tail and articulated held blade |
| Professor Perihelion / Nell, Starpath Keeper | Shipped October 1: visible older face, ivory curls, brass spectacles, stitched star chart and held telescope |
| Grandmother Briar | Shipped October 1: warm grandmother face, silver braid, straw hat, fitted work apron and carried garden tools |
| Aurelia, Sky Sovereign | Shipped October 1: older ivory ruff, broad blue feather fan, copper chest harness and clear talons; source/indices preserved |
| Pillar, Old Mason | Shipped October 1: weathered pale stone, warm carved face, fitted canvas apron, held trowel and grounded casting palms |
| Tess, Silk Matriarch | Shipped October 1: older ivory spider face, cranberry silk, eight joined legs, fitted wrap, held needle/reel |
| Bongle, Bell Titan | Shipped October 1: rounded teal metalwork, bronze lip, warm face and joined clapper; source/indices preserved |
| Mallow, Lantern Keeper | Shipped October 1: warm older flame face, broad weathered lantern and hinged casting shutters; source/indices preserved |
| Atlas, Last Worldbearer | Shipped October 1: older russet mountain bear, pale brows/muzzle, joined broad paws and worldheart seam; source/indices preserved |
| God of Every Form / Meridian, the Perfect Map | Shipped October 1: pale folded face, indigo chart coat, held map ledger/compass staff and coherent casting arms; source/indices preserved |
| Tollkeeper | Shipped October 1: warm bronze otter face, rolled rain hood, sewn receipt pockets, joined tail and held ledger/lantern; source/indices preserved |
