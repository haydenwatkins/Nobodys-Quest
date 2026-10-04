# One current task

The selected promise now supplies the field headline, Journey's first card and the atlas callout. Both standard fields and Sunrise's paper layout show an actionable step: find the pearl, collect the defeated Queen's ground gift, then return to Pebble. The headline remains while followed, and yields to nearby actors, important notices or encounters. Brindle, Pip and Mara use the same view with their actual accomplishment and return checks.

The journey card names the person, promise, next action, reason and existing thanks. It contains Show the way, Set aside and Follow the main story; the duplicate promise card is removed. Automatic form mastery remains its separate card. Story so far retains the campaign chapters rather than presenting a town request as a new act.

`G.sunriseRequestTask()` reads existing request/accomplishment/ground-gift ownership. Its two-step progress is a presentation of helping and returning, with no saved counter. `G.currentTask()` preserves guidance's existing priority: explicitly guided Form Echo, Legend Echo, selected promise, followed Mark field note, then the campaign. Expedition runs suspend town tasks. A request is selected only by the explicit conversation choice or the existing follow button, no reward source is moved into this view, and the existing save remains sufficient.

Three new native task cases passed: actual Queen ward/victory/ground collection/save/once-only return, all four promises in both HUD layouts and the journey/atlas, and temporary Echo/field-note/expedition priority. Seven existing request cases and three status cases passed. Eight opening/art/menu/field-note checks passed. Four existing feedback cases passed during the standard-layout integration; some task cases were repeated while correcting fixture escaping and draining genuine map-entry dialogue/celebrations. No complete-suite claim is made.

Four controlled Chromium cases passed and thirty-two touch/TV views were inspected in both art settings. The browser review follows through the native menu, verifies a headline after timed guidance expires, reloads a real save, uses native attacks against a deliberately weakened Queen, collects by movement and returns through the native NPC interaction for exactly one reward. It checks actual HUD painting and journal/atlas text. Touch movement uses keyboard steering; touch buttons and the TV pad bridge are native. Controller menu fixtures set the existing menu controller's focus and use native A to select, so they do not establish a full directional-navigation walkthrough. Fixtures travel directly between authored maps and do not prove full-fight balance or physical-device behavior.

Reproduce with a static server and optional developer Playwright/Chromium:

```
node tools/review-current-task.cjs [baseURL] [outputDirectory]
node tools/render-review-sheet.cjs [captureDirectory] [outputDirectory]
```

`REVIEW_MODE=touch` or `REVIEW_MODE=controller` limits a repeat to one input mode. NPC offers are now complete, as described below.


## Accepting an NPC promise

After hearing an unfinished request, children can choose **I'll help** or **Maybe later**. Touch choices are large buttons in the existing portrait dialogue; tapping outside them has no effect. TV uses A to accept and B to defer; keyboard uses Enter and Escape. The choice appears after the spoken request, so the tap that finishes reading cannot also accept it. Accepting follows/saves the promise and points out its next action; it awards no completion credit. Deferring leaves the previous task alone. Already followed requests, ready accomplishments and completed promises retain normal conversations and native thanks/revisit behavior.

This adds an optional transient `offer` to the existing dialogue queue, shared by paper and standard portrait layouts. It does not add an accepted-request save schema or another NPC engine. Each authored request supplies its title/person and the same `followSunriseRequest` action used by Home. Previous accomplishments still qualify without having accepted beforehand.

Three final offer cases passed, plus four existing dialogue/portrait checks and ten current-task/request regression cases; some new cases were repeated after adding standard-layout callback coverage. They verify deferral with no save/reward, all four actual NPC acceptances with real saved selection, no repeat acceptance for an already followed task, ready/completed thanks once and ordinary queued dialogue callbacks. Four browser cases passed and twenty-four touch/TV views were inspected in both art settings, covering all four native NPC offers, accept/defer, outside-button tap protection and real save boot. Conversation positions and earned-form fixture state are controlled; this is not a full walking campaign or physical-device test.

Reproduce with `node tools/review-promise-offers.cjs [baseURL] [outputDirectory]` and the existing review-sheet tool. The next source audit returns to unconverted specialist trial gifts and their native return roads, re-entry rules and relic/form consumers.

## Brindle’s recovered book

The recipe promise now follows the saved physical book: Rat entry, collection, return to Brindle, native thanks and later bakery visit. Leaving the isolated pocket before collection routes back to its bank drain and preserves Rat re-entry after save boot. Inside, breadcrumbs reach the actual book tile. Legacy salvage readiness remains. See `GROUND-REWARDS.md` and `tools/review-recipe-promise.cjs` for evidence and fixture limits.
