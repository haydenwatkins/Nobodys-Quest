# Storm Engine chapter

The root URL redirects here. All current game content is implemented in this directory; there is no playable legacy mode in the current release.

- `world-data.mjs`: authored terrain, collisions, encounters, weapon definitions, landmarks.
- `game.mjs`: deterministic simulation, directional combat, posture, pressure, quests and saves.
- `scene.mjs`: procedural meshes, instancing, weapon animation, effects and curved-world camera.
- `main.mjs`: touch, keyboard and controller input, menus, chart, audio synthesis and autosave.
- `index.html` / `style.css`: original field interface.
- `vendor/`: Three.js 0.170.0 and its MIT license.
- `tests/`: simulation and reachability verification.

Tests can run from the root with `node --test 3d/tests/game.test.mjs`. The renderer also requires a real WebGL2 browser; simulation tests alone do not prove rendering or mobile performance.
