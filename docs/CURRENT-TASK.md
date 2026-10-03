# One current task

The selected promise now supplies the field headline, Journey's first card and the atlas callout. Both standard fields and Sunrise's paper layout show an actionable step: find the pearl, collect the defeated Queen's ground gift, then return to Pebble. The headline remains while followed, and yields to nearby actors, important notices or encounters. Brindle, Pip and Mara use the same view with their actual accomplishment and return checks.

The journey card names the person, promise, next action, reason and existing thanks. It contains Show the way, Set aside and Follow the main story; the duplicate promise card is removed. Automatic form mastery remains its separate card. Story so far retains the campaign chapters rather than presenting a town request as a new act.

`G.sunriseRequestTask()` reads existing request/accomplishment/ground-gift ownership. Its two-step progress is a presentation of helping and returning, with no saved counter. `G.currentTask()` preserves guidance's existing priority: explicitly guided Form Echo, Legend Echo, selected promise, followed Mark field note, then the campaign. Expedition runs suspend town tasks. No request is selected merely by talking to someone, no reward source is moved into this view, and the existing save remains sufficient.

Three new native task cases passed: actual Queen ward/victory/ground collection/save/once-only return, all four promises in both HUD layouts and the journey/atlas, and temporary Echo/field-note/expedition priority. Seven existing request cases and three status cases passed. Eight opening/art/menu/field-note checks passed. Four existing feedback cases passed during the standard-layout integration; some task cases were repeated while correcting fixture escaping and draining genuine map-entry dialogue/celebrations. No complete-suite claim is made.

Four controlled Chromium cases passed and thirty-two touch/TV views were inspected in both art settings. The browser review follows through the native menu, verifies a headline after timed guidance expires, reloads a real save, uses native attacks against a deliberately weakened Queen, collects by movement and returns through the native NPC interaction for exactly one reward. It checks actual HUD painting and journal/atlas text. Touch movement uses keyboard steering; touch buttons and the TV pad bridge are native. Controller menu fixtures set the existing menu controller's focus and use native A to select, so they do not establish a full directional-navigation walkthrough. Fixtures travel directly between authored maps and do not prove full-fight balance or physical-device behavior.

Reproduce with a static server and optional developer Playwright/Chromium:

```
node tools/review-current-task.cjs [baseURL] [outputDirectory]
node tools/render-review-sheet.cjs [captureDirectory] [outputDirectory]
```

`REVIEW_MODE=touch` or `REVIEW_MODE=controller` limits a repeat to one input mode. The next bounded step is an explicit accept/defer choice when hearing an NPC's request, preserving whichever task the player already chose.
