# Battle and conversation pass

The battle module separates move definitions and target geometry from input, game state and rendering. Each move defines a name, shape, range, damage, posture damage, anticipation, recovery and movement. The runner form maps equipment IDs to move sets. Future forms can add entries to COMBAT_FORMS and MOVESETS without replacing controller or touch input; adding their appearance, unlocks and save validation remains separate work. No additional playable transformations are included in this pass.

Blade: three fan-shaped attacks, ending in a broad spin. Lance: three narrow piercing thrusts with increasing range and commitment; contacts at the outer roughly one-third gain 40% damage and 50% posture damage. Hammer: three localized impact disks with escalating radius, damage and recovery. Pressure vents have their own definitions. Switching weapons or cancelling a windup resets the chain. Buffered followups remain supported.

The renderer uses move width for blade trails, a full body turn for the blade finisher, line effects for the lance and localized debris/fractures for hammer impacts. Existing weapon models and sound families are retained. Tests cover target selection, precision spacing, chain lengths and an injected extra form profile, as well as the existing gameplay and touch regression suite.

Conversations use original SVG crew portraits, field-paper edges, printed borders and speaker pennants. Text reveals at 42 characters/second; the first press reveals the current line, the next advances. Reduced motion shows the whole line immediately. Full text is available to assistive technology without announcing each letter. A standalone development page at tools/dialogue-preview.html exercises presentation without needing WebGL and is excluded from the distributable.

The available cloud browser cannot run WebGL, so combat feel and mobile GPU performance still require physical-device testing. Automated geometry/scene tests are not a substitute for that playtest.
