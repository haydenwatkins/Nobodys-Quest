# Greenfield 3D

A separate, playable first chapter of Nobody’s Quest in a curved 3D world.

Open `/3d/` on the same web server as the classic game. Browser ES modules need
HTTP(S), so use the hosted link or a local static server, not a double-clicked file.
There is no build step and no runtime CDN dependency. Three.js 0.170.0 is vendored
with its MIT license in `vendor/`.

## Preserving the original

- The classic entrypoint, engine, art, and saves are unchanged.
- The 3D experiment lives entirely inside `3d/`.
- Its only browser-storage key is `nobodys-quest.greenfield-3d.v1`.
- “Play original 2D game” returns to the original root URL.
- The pre-3D snapshot is commit `eb9648d657fc755810961d19e98bc90de036569c`,
  preserved on `backup/classic-before-3d-2026-09-06`.
- To remove this experiment, remove `3d/`; no classic save conversion or repair
  is needed. Prefer a new revert commit over rewriting Git history.

## Included in this chapter

Sunrise Town, Greenfield, Briar Hollow, the Old Watch, Sunwash Coast, the orchard,
and the Promise Stones form one walkable continent on a rendered globe. Roads,
landmarks, and an atlas guide the player through three lanterns and the Warden.

Nobody, Rat, and Knight have distinct models, speeds, health, and basic attacks.
Cartwheel, Fester, and Shield sweep can be borrowed by any unlocked form. Slimes,
mushrooms, wisps, and a telegraphing boss provide a complete short combat loop.
Three secret chests, a campfire checkpoint, gentle mode, touch controls, keyboard
controls, controller menus, adjustable graphics, sound, and isolated saves are
included. Returning to the Mayor completes the chapter.

This is not yet the full 24-form campaign. Classic saves are not imported. Other
regions, all remaining forms and abilities, Manyfold, wardrobes, and town-building
are future migration work. The surrounding small islands are scenery.

## Files

- `world-data.mjs`: world coordinates, shared terrain/collision functions, data.
- `game.mjs`: renderer-independent gameplay, progression, and save validation.
- `scene.mjs`: 3D terrain, models, lighting, instancing, animation, and camera.
- `main.mjs`: interface, input, audio, frame loop, and persistence.
- `index.html`, `style.css`: game UI and responsive touch layout.
- `tests/game.test.mjs`: progression, combat, persistence, and collision checks.

Run meaningful logic checks with `node --test 3d/tests/game.test.mjs`.
