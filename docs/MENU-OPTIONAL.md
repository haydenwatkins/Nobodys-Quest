# Menu-optional play

October 8, 2026. Family direction: Lily needs short, visual choices; Ben enjoys collecting, comparing and working toward treasured things. Common play should stay on the road, as Forms and Quick Mix already do.

## Play contract

- Turn common configuration into a familiar action with an immediate, visible result. A help lantern lights; a guardian gift goes in Patchling's pocket. Returning to the object uses the same button.
- Introduce one idea through a friendly, short invitation and a picture. Help is available before the first fight. Never require a quest, currency, defeat or reading test to receive it.
- Looking, scrolling and comparing never change equipment. Choosing changes exactly the named thing and returns to play. Existing ownership, save keys, effects and rewards remain authoritative.
- Use American spelling in player-facing prose. Footnotes belong only where they offer useful, actionable help. Show an empty carried-gift pocket and the actual carried treasure visually.
- Show the benefit and its tradeoff together. Short field language comes first; exact values are optional and accessible with controller as well as touch. Souvenirs say that their reward has already been earned.
- Add no permanent HUD button for each new system. Reuse Forms/Quick Mix for related quick choices and physical camp/town objects for less frequent actions. A pause menu can remain a reference and accessibility fallback.
- World interactions yield to danger and existing story interactions. No flashing attention bubbles, automatic quest accumulation, equipment churn, capacity limits, sorting chores or random loot grind.
- Preserve the player's choice across visits. No automatic equipping or lighting, no reduced reward for taking help, no difficulty shame. Both lights start unlit on a new installation; existing preferences remain respected.

## Shipped foundation

Pebble says, “Psst, Patchling! Want a little help? Try my lanterns!” after the opening greeting. A once-only visual invitation presents two large lanterns. It can be closed with Done or controller B without enabling anything. An interrupted arrival can resume the invitation; late saves are left to their existing adventure.

**Heart Lantern** grows back one heart every six seconds after the existing short breather, including during battle. **Guardian Lantern** retains extra retry hearts and slower boss shots after repeated tries, plus longer warnings throughout guardian fights. Its description does not promise a universal damage reduction. These names also appear in the optional title/pause settings and feedback; internal preference names stay compatible. Lighting help does not award progress or change rewards.

Two actual lamps stand beside Pebble on Orchard Road. Every existing rest spot throughout the registered maps receives reachable lamps and a camp bag on ordinary safe neighbouring ground. Both lamps also stand outside all 22 current dungeon/guardian-zone/trial approaches, including the five coastal challenges. They use connected safe ground away from authored enemy attention, with the Heartwood pair below the locked Orchard roots. Worldwake guardians use their existing outdoor caravan camps. A complete, stable world prompt explains the effect before switching. A/tap switches an individual lamp directly, without opening another screen; its stable glow reflects the saved choice. Nearby fighting, hostile shots and an engaged Worldbearer prevent a world interaction from consuming an attack. Story interactions retain priority, and a closer NPC retains the talk button.

Camp bags and the Pockets choice inside the existing Quick Mix open the same compact field selector. It contains collected guardian gifts and authored treasures, with the carried gift as the starting preview and a visible empty/carried gift slot. Guardian gifts show a short benefit, price, optional exact values, and Carry/Set aside. Choosing returns immediately to play. Souvenirs use the authored item purpose, have no Carry action and cannot repay a reward. Real treasure art, ownership and keepsake mechanics are reused; there is no second inventory economy. Quick Mix still opens with R3/F or a held touch B/C.

Native touch review also found a real Quick Mix input defect: the release click from the hold that opened it could select an art newly drawn beneath the finger. The opening release now cannot select; a fresh press can. Controller and keyboard selection retain their existing behavior.

## Remaining work and order

This is a foundation, not a completed conversion of every system.

First follow the latest voluntary-difficulty priority in `GUARDIAN-CHALLENGES.md`: develop the Treant counter and its optional branching fight before showing an actionable challenge lamp. Keep help independent and rewards equal. Hard patterns remain unimplemented in the preparation batch.

1. Give Ben a deliberate treasure pursuit using the existing single-current-task system. Let him compare meaningful future gifts at a physical collection display, choose one aspiration, and see one practical next action. Avoid spoilers, compulsory shopping, universal best-stat tiers or a new quest counter. Existing guardian gifts offer different strengths and prices; cosmetic memories should never pretend to be upgrades.
2. Put saved mix recipes, Mark attunement and form natures within the existing field selectors or clearly introduced camp objects. Changes must preserve ownership, paid recovery and the appropriate Manyfold build rules. Do not turn advanced systems into early-game chores.
3. Audit town projects, reports, Manyfold entry and travel. Prefer visible people, boards, doors and preparation props with clear return paths. Keep their current progress/acceptance state rather than another quest engine.
4. Review device-only settings separately. Sound, display and save management must remain immediately accessible; whimsical theming must not make an essential accessibility control harder to find.
5. Resume Harborback/Foldstep Fox, then Skylens Mapper/Hedgehare road opportunities under this interaction contract, alongside the open fresh Worldwake pacing review.

## Evidence

`tests/menu-optional.test.js` exercises first introduction, interrupted/late saves, native A switching versus combat, safe station placement at every registered rest spot, actual owned-item previews and read-only drawing. Existing comfort, keepsake, road return, treasure HUD, controller and TV bridge checks cover retained mechanics.

`tools/review-menu-optional.cjs` uses fresh published-host Chromium contexts for small landscape touch and the actual Android TV pad bridge, each with HD/original art. The same workflow is also checked at portrait tablet size; controller panels use larger text and controls for TV viewing. It walks from the real new-game arrival, lights both options through native controls, switches both off at the world lamps, reloads, opens a camp bag, previews/carries a gift, reloads, uses Quick Mix → Pockets, opens the exact-value disclosure, sets the gift aside, and views a souvenir. The hold uses real Chromium touch events and explicitly verifies that releasing it leaves Quick Mix open. Later treasure ownership is supplied as a controlled collected-chapter fixture; this does not prove a whole collection campaign or physical-device behavior.

Final complete 2D regression: **641 passed**, zero failed/cancelled/skipped (523,180.889952 ms). Focused verification after the interface copy correction passes 12 opening/menu-optional cases, 8 station/shelter cases, and 15 keepsake/treasure cases; those overlap the complete run. Earlier visual review caught and corrected unintended touch-release art selection, a below-fold Carry action, an interrupted-invitation duplicate, and competing NPC interactions. Existing art-count checks now include the three new camp props; the Crown HUD check names its actual Pockets purpose.

Six final kit workflows cover small landscape touch, enlarged TV controls and portrait tablet, each at both art settings. Four additional connected-opening workflows pass physical Rat drains, reciprocal roads and saves. The kit review produced 54 landscape captures, with the enlarged TV pair replacing its 26 TV views, plus 28 portrait tablet captures. All four landscape case sheets and selected full-size touch, TV and tablet views were inspected; actor/world feedback, readable actions and empty/carried state remain clear. Browser-controlled chapter ownership and simulated devices remain the limits: this is not Lily/Ben playtesting, a physical TV/tablet run, or an uninterrupted campaign.

Menu copy uses American spelling. Generic browsing reassurances and “travel light” status text were removed from Pockets and the existing Keepsakes/Journey surfaces. The kit shows an empty pouch or the actual carried gift instead; exact effects remain available under Look closer. Shared rules and the remaining conversion are in `PLAYER-EXPERIENCE-RULES.md` and `CLOUD-ROADMAP.md`.

## Guardian preparation follow-up

The new registry-wide approach check covers all 22 current entrances, both help switches, safe ground, distance from authored threats and the closed Orchard arch. The painted-prompt check covers complete action/effect text, bounded layout and a stable vertical dock through movement/switching on keyboard, touch and controller. The focused opening/connected-road/comfort/prompt/kit run passes **16 tests**.

`tools/review-guardian-lanterns.cjs` passes four touch/controller × HD/base workflows at Orchard, Toll Bridge, coastal guardian/Manyfold approaches and a Worldwake camp. Native A/tap switches help without opening a menu, changing rewards or losing the choice after save/reload. All prompt words are measured inside the actual painted dock, without ellipsis. Chapter state, placement and cleared approach threats are controlled fixtures; the registry simulation separately checks original enemy clearance. These checks do not prove hard-mode combat or a full human campaign.

The existing kit workflow also passes four touch/controller × HD/base cases after the truthful Guardian Lantern copy change, covering first introduction, actual opening-lamp walking, camps, Pockets, native hold/R3 Quick Mix, carrying and reload. The preparation run produced 84 captures and the kit regression produced 54. Final preparation sheets and selected full-size touch/controller views, including both first-choice panels, were inspected. Physical TV viewing, iPad Safari and the new counter proposals remain untested.

The final complete 2D follow-up run passes **643 tests**, zero failed/cancelled/skipped (476,360.94742 ms), including the two new preparation/prompt cases. No 3D files were changed.

## General-principle follow-through

Guardian help now adds warning time across the campaign, including commitments, authored floor patterns and boss shot arming. Opening/delivery extra beats remain. The field card says “More time to react,” describes the real warning/retry effects, and the world prompt names both. Shared recovery respects actual lingering attacks, and phase changes clear the previous guardian commitment. Existing player experience principles now explicitly govern all old and new systems; coverage and remaining work live in `DESIGN-APPLICATION.md`.
