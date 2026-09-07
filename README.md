# Veyr and the Storm Engine

**Working title.** An original 3D action-adventure prototype about a salvage runner returning to a falling island. Recover three governor teeth, break the Keelbreaker, and bring the scattered crews home.

[Play the chapter](https://haydenwatkins.github.io/Nobodys-Quest/3d/)

A copper visor, a torn red scarf, storm-blue machinery, and an angular field interface establish the new direction. Veyr stays one character. Three mechanical weapons are fitted from the start: a three-cut blade, a piercing lance, and a heavy hammer. Each has a physical windup, contact, and recovery. Hits build pressure; vent it through the equipped weapon. Heavy blows break posture for a damage window. Late evades reward pressure.

The chapter includes three field stations in any order, four mechanical enemy types, a boss with a second-phase projectile pattern, two crew characters, three hidden rig upgrades, a repair bench, and a curved island you can survey from above.

## Play

Keyboard: WASD/arrows move, J strike, K vent, Space evade, E interact, 1–3 or Q change weapon, M chart, I weapon briefing, Escape pause. Drag the world to look; scroll to zoom.

Touch: left stick to move; right buttons to strike, vent, and evade; bottom weapon selector. Gamepad: left stick move, A/RT strike, X vent, B evade, Y interact, LB/RB weapon, right stick camera, View chart, Menu pause.

Progress saves on this browser/device. The new chapter has its own save key and does not load or erase previous versions' saves. Gentle mode reduces damage and restores health out of combat. Impact shake and sound can be disabled; low graphics disables shadows.

## Develop and verify

No package install or build required. Use a static HTTP server from the repository root (for example `python -m http.server 4173`), then open `/3d/`. A current WebGL2 browser is required.

Run `node --test 3d/tests/game.test.mjs`. Run `node tools/package-release.mjs` to create the distributable `dist/` folder with only approved runtime files and dependency notices. Do not package an older repository archive or backup branch.

This is one playable prototype chapter, not a finished commercial release. Physical phone/controller performance and subjective combat balance still need player testing.

## Rollback

Two preserved branches retain earlier work:

- `backup/classic-before-3d-2026-09-06`: the pre-3D game.
- `backup/greenfield-before-original-reboot`: the first 3D prototype and classic game, commit `cef76fec114b95d48b9adb0e58fc37e1271306e7`.

Ask Codex to restore either version; it can create a restoration commit without losing subsequent work. Restoring those versions also restores their old content, so they are development backups, not commercially cleared releases. Git history and backups remain public wherever this repository is public.

See [the originality and provenance record](docs/ORIGINALITY.md) for what was replaced, retained, and still requires commercial review. The repository address retains its historical name to preserve existing links; it is not the new product title.
