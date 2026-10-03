# Authored-art startup checkpoint

October 3, 2026. Baseline: `ff074d3`. This measures the 2D browser game and its developer fixtures; it does not establish physical-device performance.

Profiling a classic-runtime boot put most CPU time in authored pixel placement and dense-to-base conversion. The shared art helper now clips primitive bounds once, fills rectangular/polygon spans directly, reuses an ellipse's row calculation, and picks each compact pixel's stable winning colour without sorting a temporary entry array. The inspectable letter-grid authoring format and Canvas renderer remain.

All **894 generated sprite definitions** matched the baseline exactly, including palette, every frame, density and animation mapping. The combined SHA-256 was `86e1c2f1888f9ab041da02a4b1644441497be62b2ce150254f73170b0b80b5a8` before and after. Seventeen focused form/boss/foe/wildlife/NPC/ground-reward/save checks passed. Four native touch/TV Sigil fixtures passed; their twelve final views were inspected. No new art, gameplay measurements or save fields are introduced.

The final paired benchmark alternates baseline and current art code in fresh Chromium contexts, three times per CPU setting. All other served files remain the current build. Animation is paused; no page errors appeared. Medians:

| Chromium CPU setting | Baseline script time | Current script time | Baseline page load | Current page load |
|---|---:|---:|---:|---:|
| Normal | 1,658 ms | 1,020 ms | 2,023 ms | 1,348 ms |
| Simulated 4× slower CPU | 5,678 ms | 3,499 ms | 6,613 ms | 4,428 ms |

Script startup improved about 38%; total page load improved about 33% in this run. Earlier unpaired samples varied with concurrent cloud work, so use the paired comparison for this checkpoint. A profiled developer boot took 8.7 seconds before; an unprofiled optimized boot took 3.7 seconds. Those differently instrumented single samples are not a controlled speed ratio. Existing fixture cases subsequently ran in roughly 2.4–4.6 seconds instead of the earlier 6–8 seconds, with machine-load variation.

Reproduce against a running static server:

```sh
node tools/measure-startup.cjs http://127.0.0.1:8000/ ff074d3
```

The optional Git ref substitutes only `form-art-hd.js`; it is not a full old-build comparison. Omit the ref to measure the current build alone. Playwright and Chromium are developer dependencies available in the cloud environment; `CHROMIUM_EXECUTABLE_PATH` can select another installed Chromium. The shipped static game has no new dependency or build step. Physical iPad, Android and TV startup, memory, frame pacing and thermal checks remain release-milestone work.
