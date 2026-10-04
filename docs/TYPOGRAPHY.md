# Readable storybook lettering

October 4, 2026. Ben asked for less pixelated, more readable text throughout the 2D game.

The game now uses self-hosted **Nunito**: rounded letterforms fit the sewn characters and warm paper journal, while regular and stronger weights keep paragraphs and labels distinct. The variable font is 101,212 bytes and lives in `fonts/nunito-variable.woff2`; its SIL Open Font License and copyright are included in `fonts/Nunito-OFL.txt`. The source is Google Fonts’ `ofl/nunito/Nunito[wght].ttf`, compressed to WOFF2 with FontTools/Brotli. Playing makes no third-party font requests. Smooth Trebuchet/sans-serif fallbacks remain available while it loads.

Menus, title/save slots, controls, ending, dialogue, choices, HUD, notices, signs, echo labels and combat cues use the readable family. Tiny legacy menu font sizes were raised, dialogue line spacing increased, headings strengthened and stacked pixel shadows softened. The Build introduction and tabs wrap across rows on tablets instead of squeezing the introduction into a narrow column; the portrait roster has three columns on tablets and two on phones, with status labels checked for clipping.

`js/engine/typography.js` supplies the shared Canvas family and captures world lettering during the normal draw. The existing full-resolution HUD canvas paints those labels before the HUD, preserving the real camera transform, rotation, alignment, color and opacity. Arena clipping is explicitly preserved. Labels fade during map reveal and hide during scrolling transitions. World art retains its original canvas dimensions, nearest-neighbour rendering and both graphics settings; no new game engine, second text canvas or save format was introduced. Standalone developer canvases retain immediate text painting.

Validation includes eight task/recipe/paper/interaction cases; ten dialogue/portrait/feedback/type cases; eleven existing progression, resolution, menu, wardrobe and world integration checks; eight title/boss/type cases; and three final typography cases, with overlap. The last case rasterizes a clipped combat label and verifies that ink stays inside the transformed arena. A standalone dialogue fixture now loads the real typography dependency. No full-suite claim is made.

Six final typography browser cases cover landscape touch, TV and iPad-sized portrait touch, both art settings, at device pixel ratio 2. They verify that Nunito actually loaded, that signs/labels do not paint into the pixel canvas, the sharp overlay’s resolution, a native combat warning, long dialogue in paper/standard layouts, menu/tab bounds, title/save slots and visible ending return. Sixty final views were inspected. Review caught the narrow tablet Build introduction and its overflowing tabs; the final layouts and assertions cover that failure. The initial combat fixture called the arena-pattern helper instead of the guardian-action dispatcher; the final fixture invokes the real `resolveBossAction` after settling its entry conversation.

The existing Brindle promise’s four browser cases and 32 views also passed with the new type, along with four native finale/collection/ending cases and 20 views. Those retain native touch/TV actions and actual save reload. Dedicated typography menus/title/ending use existing public APIs and DOM controls to isolate presentation. Combat is a controlled warning fixture; the finale uses a weakened final-blow fixture. These desktop checks do not establish physical-device compatibility or balanced full fights.

Reproduce with a static server and developer Playwright/Chromium:

```
node tools/review-typography.cjs [baseURL] [outputDirectory]
node tools/render-review-sheet.cjs [captureDirectory] [outputDirectory]
node --test tests/typography.test.js tests/dialogue.test.js tests/dialogue-portraits.test.js tests/field-feedback.test.js
```

Continue the reward-source roadmap in `CLOUD-ROADMAP.md`; the remaining regional/currency sources have not been declared complete.
