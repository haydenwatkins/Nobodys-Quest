# Storm Engine chapter

The root URL redirects here. All current game content is implemented in this directory; there is no playable legacy mode in the current release.

- `world-data.mjs`: authored terrain, collisions, encounters, weapon definitions, landmarks.
- `game.mjs`: deterministic simulation, directional combat, posture, pressure, quests and saves.
- `scene.mjs`: procedural meshes, instancing, weapon animation, effects and curved-world camera.
- `main.mjs`: touch, keyboard and controller input, menus, chart, audio synthesis and autosave.
- `touch-controls.mjs`: floating pointer capture and gameplay-scoped iOS gesture protection.
- `index.html` / `style.css`: original field interface.
- `vendor/`: Three.js 0.170.0 and its MIT license.
- `tests/`: simulation and reachability verification.

Tests can run from the root with `node --test 3d/tests/*.test.mjs`. The renderer also requires a real WebGL2 browser; simulation tests alone do not prove rendering or mobile performance.

## The Last Light opening

New games begin with a short dock rescue. Its durable milestones are `arrival`, `landingThreat`, `coupling`, `crossing`, `briefing`, and `complete`; rendering only presents those milestones. Existing saves that already contain a briefing, progress, rewards, or defeated enemies migrate straight to `complete`, preserving their saved position, tool, settings and progress. The opening introduces the boat cable before the term “mooring,” and explains that the Storm Engine keeps the island aloft before asking the player to restore its regulator.

The reviewed opening can be played separately at `3d/?preview=last-light`. This uses session storage with a separate key; main-adventure progress is never overwritten. New games and the chapter restart share the same rescue entry point. The rescue pulls the boat in, lets its passenger cross, then triggers the engine response. Recovered regulator pieces fit into suit sockets and light the chart assembly; Sera's radio acknowledgements remain readable on the chart and in her conversation. Restoring the engine steadies lights and reduces cable strain.
