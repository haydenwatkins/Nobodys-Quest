# Luna implementation brief: The Last Light

Status: proposed story and implementation plan. This document does not change the live game.

## Assignment and roles

Luna implements one complete, polished main-quest opening for Veyr and the Storm Engine. Astra reviews narrative, game design, implementation and evidence before release. Work on a feature branch; create a draft PR and stop for Astra's review. Do not deploy this assignment yourself. Do not spend the budget on unrelated refactoring, a new engine, more side quests, multiplayer or new playable forms.

First inspect the current repository and any applicable AGENTS.md. Read this brief, docs/BATTLE-SYSTEM.md and the current game, scene, dialogue, audio and touch modules. Preserve the existing aesthetic, battle system, controls and progression. Record deviations from this brief with reasons rather than silently substituting a cheaper outcome.

## The player promise

**You are Veyr, a former engine apprentice returning to the only home you have left. Its failing lift engine is stranding the settlement above a storm. Your first repair buys everyone time—but reveals that the machinery is actively resisting rescue. Restore its governor, confront the machine guarding its heart, and reopen the route for the missing crews.**

The opening must answer: Who am I? Who needs me? Why can I help? What am I trying to accomplish? What bigger danger am I heading toward?

This is a proposed narrative revision, not a claim that the current code already establishes this history. Veyr knows the engine and carries its surviving maintenance rig. Sera operates the emergency moorings; leaving her station would abandon the settlement. Other people are helping, but Veyr can reach the damaged machinery. Avoid a generic chosen-one prophecy or a faceless villain explaining everything.

The central dramatic question is **“Can I bring this place—and its people—home?”** The mystery underneath it is **“Why is the engine fighting the people it was built to protect?”**

## Story logic to make consistent

The engine supplies lift. We must free its governor from storm-driven machinery, not switch off the thing keeping everyone alive. The Keelbreaker guards the compromised governor. Defeating it restores stable operation and opens the rescue route; Stormline Rescue follows because the crews can finally return.

Audit Sera, Oren, Iona, quest text, victory messages and map descriptions for contradictions. Replace ambiguous language such as “engine severed” with “governor freed” or “the storm's hold is broken” where appropriate. Keep “engine teeth” as physical governor components if useful, but explain them once in everyday language. Do not claim the three existing field stations are three different mission types unless you actually build those differences.

## The opening: one uninterrupted rescue, roughly 5–8 minutes

Timing below is a pacing target, not an enforced countdown. Players may linger, read slowly, lose a fight or explore without failing the story.

| Beat | What the player does | What the player sees and learns |
| --- | --- | --- |
| 1. Home in trouble, 0:00–0:20 | Begin and take control near the southern landing approach. | A damaged returning skiff, a slack mooring and a faltering settlement light. Frame the huge turbine in the distance. Sera calls Veyr by name. Control returns within 10 seconds; a skip action also returns it immediately. |
| 2. One person to save, 0:20–1:30 | Reach the mooring winch and clear a small, authored mechanical threat. | A visible crew member is stranded on the landing platform. The objective is “Get the landing crew across,” not “Kill three enemies.” No escort pathfinding is required: stage a short crossing after the threat is cleared. |
| 3. A repair that matters, 1:30–2:30 | Interact with the damaged winch coupling, then release its jam with an attack. | Use the existing strike input; every weapon can complete this task. Cutting, thrusting and crushing produce different reactions. A cable tightens, the gangway settles and the crew member crosses into safety. One repair visibly changes the scene. |
| 4. The engine answers, 2:30–3:00 | Remain in control while the local lights recover. | The distant turbine makes one deliberate counter-turn. A low mechanical call interrupts the music; the mooring briefly strains again. The threat is purposeful, not just bad weather. Use a brief optional camera emphasis, no long forced cinematic. |
| 5. A reason to leave safety, 3:00–4:30 | Speak with Sera at the now-stable mooring. | A short exchange establishes Veyr's connection, the temporary nature of this repair and the main mission. The rescued person remains visible at the anchorage. |
| 6. Cross the threshold, 4:30–8:00 | Take the northern exit and choose a route toward a field station. | Reveal the turbine between the mooring pylons. A restrained chapter title appears: “THE LAST LIGHT.” Main quest: “Free the Storm Engine.” Current step: “Reach a field station.” The world opens with a purpose. |

Build the landing area into the existing settlement instead of creating a disconnected tutorial map. Inspect terrain and collision before choosing coordinates. Keep the route readable through light, cable direction, landmarks and camera framing. Use a subtle objective marker as backup. A decorative object that looks solid must have appropriate collision, or be placed outside the traversable route.

## Dialogue script and delivery

Keep these as the baseline. Luna may shorten for fit but must preserve the meaning and character. Do not add paragraphs of lore. Use the existing illustrated dialogue treatment for conversations. Urgent calls during movement need a small readable speaker caption that does not pause play, cover attacks or disappear before it can be read; important information must also remain in the objective or conversation history.

Opening call, Sera: **“Veyr! The landing winch—get them across!”**

After the rescue, Sera: **“You still remember how she works.”**

Veyr: **“She never used to pull against us.”**

Sera: **“That bought us time. The engine is still dragging us down.”**

Veyr: **“Then I go to the heart.”**

Sera: **“The governor broke into three pieces. The field crews took them out before the machines turned. Bring them back, and your rig can open the heart.”**

Veyr: **“And the crews?”**

Sera: **“Still out there. I keep the anchorage standing. You make them a way home.”**

Veyr: **“Keep a light for us.”**

At the exit, Sera's final call: **“West, east, or the high road. Your choice. Come back with all three.”**

Support Veyr's replies with an original portrait or a deliberate helmet silhouette matching the in-world hero. Do not accidentally display the fallback crew portrait as Veyr. Existing noninteractive props such as the field chart should receive a journal illustration, not a random human face. Reuse the portrait pipeline, not an external copyrighted character.

Do not force a reply-selection menu for a single fixed response. First press reveals a line, next advances; controller and touch must agree. Full text remains accessible and reduced motion skips letter animation. Cinematic skip is distinct from skipping the entire mission: it must leave playable objectives intact.

## Main-quest presentation after the opening

Maintain one stable main-quest identity: **Free the Storm Engine**. Its current step changes underneath it. Survey cases and equipment notes should not visually compete with that mission.

After each governor component, show a brief concrete development: the recovered component seats into the rig, one governor segment illuminates on the chart, and Sera acknowledges progress with a different short line. These are visible progress signals, not an extra reward popup stack. The third piece establishes the confrontation with the Keelbreaker. Its victory pays off the opening with steadier lights and relaxed mooring strain. Use restrained existing systems; no additional boss or campaign is needed for this assignment.

The handoff to Iona is about the missing crews promised in the opening, not a fresh unrelated errand. Preserve the current relay and Harrow content and rewards.

## Implementation boundaries

1. Add a small explicit prologue state machine, separate from presentation timers. Suggested states: arrival, landingThreat, coupling, crossing, briefing, complete. Each transition is idempotent and emits events for the renderer/UI. Save durable milestones, not animation progress. Resuming any milestone reconstructs a safe playable scene.
2. Keep narrative dialogue and beat definitions in a dedicated module. Game owns objectives and completion; scene owns staging/animation; main owns input and dialogue presentation. Do not put quest completion inside a render callback or timeout.
3. Reuse the battle module for the coupling target or provide a clearly bounded attackable-prop adapter. Every current weapon can hit it. Don't add a fake enemy that drops loot or counts toward existing enemy progression.
4. Append new enemy IDs; never reorder the existing SPAWNS. Gate the prologue enemies to its state and keep ambient enemies from invading the staging area. Preserve the windup limit and Gentle mode. Death resets the active encounter safely without replaying completed repairs or duplicating crew.
5. Preserve the current save key. Old saves containing the existing briefing or any substantive progression bypass the prologue. Old unbriefed saves still retain weapon, settings, health and any collected progress. Define and test the migration predicate explicitly. New games get the prologue. Existing players may replay through a separate temporary preview session that never overwrites their live save; if that is too much for this slice, provide a developer preview with isolated storage instead.
6. Give staged cinematics explicit skip, pause, blur and resize handling. No captured joystick, held attack, stuck camera or locked player survives those transitions. No fail countdown, mandatory precision dodge, forced weapon choice or unskippable opening movie.
7. Update release allowlists and asset version queries. Use instancing/shared meshes where possible; no new runtime dependency or large asset download without a reason tied to the result.

## Deliver in three reviewable checkpoints

**A — Playable structure:** state machine, save migration, encounter, coupling repair and quest handoff. Temporary art is acceptable here. Commit separately and report edge cases and test results.

**B — Presentation:** authored staging, rescued crew crossing, visible repair consequence, engine counter-turn, captions, Veyr portrait, dialogue, sound transition and exit reveal. Commit separately. Match gameplay and presentation; do not make a polished film around an unchanged fetch tutorial.

**C — Integration and proof:** main-quest continuity, existing-save regression, device-sized layouts, release package and short uncut walkthrough evidence if a WebGL-capable environment is available. Open a draft PR for Astra. If graphics are unavailable, state that precisely and include the supported checks; do not label a renderer stub a playtest.

Do not seek approval for every routine choice. Complete each bounded checkpoint, record what changed, and proceed unless the brief is contradictory or a real blocker prevents progress. No additional agents are required. Astra handles the final review; do not recursively delegate design decisions to more agents.

## Astra's acceptance review

### Experience gate

- Within 30 seconds, there is an understandable situation and someone to help.
- Within roughly 90 seconds at normal pace, the player has done something consequential using normal controls.
- After the briefing, a new player can explain who Veyr is, why the settlement matters, why Veyr goes, and what completing the main quest will accomplish.
- The winch repair visibly changes at least three connected elements: cable/gangway, crew position and local light or machinery motion. Success cannot exist only in text.
- The engine's reaction is legible and raises a question. It does not introduce another unexplained proper noun.
- The departure feels like entering an adventure. The main quest remains coherent through the existing governor stations, Keelbreaker and rescue followup.

### Engineering gate

- Existing tests pass; new tests cover each state transition, repeated interaction, death, reload at each milestone, old-save migration and cinematic skip.
- Coupling can be completed with all three weapons; distant, rearward and blocked attacks behave consistently with battle rules.
- Touch, keyboard and controller can complete the opening. Verify pause/blur/resize during dialogue, a crossing and camera emphasis.
- All mandatory destinations are reachable. No collision trap, invisible requirement or dialogue-only dependency prevents progression.
- Portrait and text fit 390×844 portrait and 844×390 landscape, including longer lines. Text remains readable over the actual scene. Essential lines are available again if missed.
- Distinguish actual device/browser evidence from simulations. Astra reviews the diff and state graph, then the uncut opening, before approving a merge. If WebGL remains unavailable, identify that outstanding gate explicitly rather than certifying subjective quality.

### Reject and revise if

The result starts with an exposition wall; asks for three items before making the player care; teaches controls through mandatory popup chains; adds a countdown to manufacture urgency; repeats the same objective under several names; merely renames the old quests; or claims cinematic polish from static mockups. Passing tests is necessary, but these experience failures still block approval.

## Handoff report

Give Astra: branch and commit, concise changes by checkpoint, save migration rule, tests and packaging results, walkthrough/screenshots with viewport and evidence type, known problems, and any story deviations. Do not say “production ready” or “high quality” as a substitute for that evidence.
