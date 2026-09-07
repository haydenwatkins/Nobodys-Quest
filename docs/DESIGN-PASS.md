# Authored world and combat pass — 7 September 2026

The problem was not a shortage of objectives. The world had too little visual hierarchy, the hero's body did not communicate the attacks, and the screen resembled a website dashboard. This pass concentrates on the opening settlement, the routes out of it, physical action, and a quieter interface.

## Direction

Veyr is a salvage runner in a settlement assembled from ship hulls, canvas and turbine parts. An enamel helmet and split brick-red storm coat carry the character silhouette. Pale sailcloth, olive basalt, rust and restrained machinery lights give the environment a common material language. Ribbed roofs, constructed road surfaces and mooring pylons lead toward a broken northern turbine. The title camera introduces the settlement; the globe view remains an optional survey tool.

The implementation uses original code-authored meshes and SVG symbols. It adds no external character art, recordings, fonts or music samples. The procedural score uses a sparse original plucked-string phrase, a low sustained accompaniment and a restrained combat layer. This is a working visual direction, not a claim of commercial clearance or finished production quality.

## Lessons from developer accounts

These references informed design principles, not copied assets, layouts, characters or sequences:

- [Andrew Shouldice, Eric Billingsley and collaborators on Tunic](https://www.gamedeveloper.com/design/designing-content-for-no-one-an-interview-with-the-team-behind-tunic): camera framing and recognizable silhouette. Application: an establishing view, a navigational landmark, a distinctive head and coat, and less permanent screen furniture.
- [Mark Foster on Death's Door](https://eip.gg/deaths-door/news/developer-interview-soul-searching/): quieter exploration gives action room to matter. Application: preserve the anchorage as respite, keep ambient music sparse, and reveal objective detail temporarily rather than maintaining a wall of instructions.
- [Alex Kubodera on Death's Gambit combat readability](https://www.gamedeveloper.com/game-platforms/designing-for-difficulty-readability-in-arpgs): gestures, telegraphs and expectations make difficulty understandable. Application: articulated windup/contact/recovery, physical enemy recoil, short input buffering, nearby injured-enemy health bars, and at most two nearby enemy windups at once.

## Behavior changes

- Blade cuts turn the torso, the lance draws back and thrusts, and the hammer lifts overhead before its downward snap. Knees and elbows articulate; the coat follows movement. Evade has a crouched pose.
- A strike tapped during the last 180 ms of recovery queues one strike. Its deadline pauses during hitstop. A requested vent takes priority over a held strike. Clearing input for menus, blur or resize clears pending buffered input and velocity.
- Movement eases in and settles quickly on release. Evade cooldown is 0.8 seconds. Committed hits retain their recovery restriction.
- Swept projectile motion collides with solid world cover. Added outcrops provide cover along routes. Objective reachability remains covered by a flood-fill test.
- The HUD uses compact weapon symbols and short contextual objective detail. The map uses a paper palette. Touch targets, floating joystick ownership, scoped iOS gesture suppression and scrollable dialogs are retained.

## Verification and limits

28 automated tests pass: combat timing and direction, combo and vent buffering, cover, crowd windups, movement settling, perfect evades, death, both mission chains, reward persistence, old saves, route reachability, floating pointer ownership and gesture behavior. The scene test constructs the real scene graph with an injected renderer stub and exercises weapons, animations, effects, camera modes, health bars and portrait resize, checking finite transforms. It does not execute WebGL shaders or measure GPU performance.

Module syntax, local imports, HTML IDs and SVG references were checked. The release packager includes the two new modules and produces 13 allowlisted files.

Composition studies used the actual scene geometry and camera, exported with `tools/render-study.mjs` and rasterized by `tools/render-study.py`. Inspecting the settlement, title, field and character views led to replacing the old spike/tree horizon, reframing the opening, and correcting roof winding. The software raster uses approximate lighting, fog and shadows; these are not browser screenshots or an exact representation of Three.js rendering.

The available cloud browser reports WebGL disabled. It could load the live page but could not start even the previous renderer. Actual browser gameplay, the revised DOM layout over WebGL, listening to audio and physical iPhone performance still need a device playtest. No claim of a measured frame rate or verified Safari session is made.

Optional composition study dependencies: Python with numpy, Pillow and numba. Run `node tools/render-study.mjs /tmp/veyr-study play`, then `python tools/render-study.py /tmp/veyr-study`. Other modes: `title`, `field`, `hero`. These development tools are excluded from the distributable game.

## Restore the previous build

`backup/before-authored-world-pass` preserves commit `f82347c50cffd202003c1fdb584986f48174c3d9`. Restore its tree in a new main-branch commit to reverse this pass without deleting later history. The existing save key, objective IDs and enemy IDs are unchanged.
