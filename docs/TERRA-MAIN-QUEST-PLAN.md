# Terra implementation brief: The Last Light

Status: revised after the user's terminology feedback. Terra codes; Astra reviews. Planning only; implementation has not begun.

## Assignment and roles

Terra implements one complete, polished main-quest opening for Veyr and the Storm Engine. Astra reviews narrative, game design, implementation and evidence before release. Work on a feature branch; create a draft PR and stop for Astra's review. Do not deploy this assignment yourself. Do not spend the budget on unrelated refactoring, a replacement game engine, more side quests, multiplayer or new playable forms.

First inspect the current repository and any applicable AGENTS.md. Read this brief, docs/BATTLE-SYSTEM.md and the current game, scene, dialogue, audio and touch modules. Preserve the existing aesthetic, battle system, controls and progression. Record deviations from this brief with reasons rather than silently substituting a cheaper outcome.

## The player promise

**You are Veyr, a mechanic returning to your home on a floating island. A huge machine keeps the island in the air. It is failing, the island is sinking toward the storm, and the flying boats carrying your neighbors cannot get safely back to the dock. Save the people within reach, then fix the machine keeping everyone alive.**

The opening must answer: Who am I? Who needs me? Why can I help? What am I trying to accomplish? What bigger danger am I heading toward?

This is a proposed narrative revision, not a claim that the current code already establishes this history. Veyr helped maintain the island's machinery and still has the protective suit and tools needed to reach it. Sera is holding the rescue boats at the dock; leaving the cable controls would put their crews in danger. Other people are helping, but Veyr can reach the damaged machinery. Avoid a generic chosen-one prophecy or a faceless villain explaining everything.

The central dramatic question is **“Can I bring this place—and its people—home?”** The mystery underneath it is **“Why is the engine fighting the people it was built to protect?”**

## Establish the world before naming its machinery

The player cannot be expected to know what a fictional machine does. These are proposed world rules to establish in the opening, not facts the current game has already communicated:

| Term | Meaning in this story | First presentation to the player |
| --- | --- | --- |
| Storm Engine | The enormous machine that draws power from the storm and keeps the island floating. The large wheel is a visible part of it. This is a fantasy mechanism, not a real engineering claim. | Show the floating island above storm clouds, the machine, and a visible change in the island's support when it falters. Sera: “That machine keeps our island in the air. If it stops, we fall into the storm.” Only then name it. |
| Dock / landing platform | Where flying boats arrive and people cross onto the island. | Show a boat, a short crossing and people trying to come ashore together. Use “dock” in objectives. |
| Mooring | A rope or cable fastening a boat to the dock so it cannot drift away. It does not hold the island in the sky. | Show a cable running continuously from boat to dock. Say “Hold their boat steady” or “Secure the boat.” Save “mooring” for later optional dialogue. |
| Winch | A powered reel that winds in the cable and pulls the boat toward the dock. | Show the drum turning, cable shortening and boat moving together. Initially call it the “cable reel.” |
| Governor | The regulator that keeps the engine's power steady and controllable. | Describe it as “the part that keeps the engine steady.” Show a simple three-segment sketch or socket assembly. Keep “governor” optional until then. |
| Rig | Veyr's protective suit and tools. | Show the same helmet, suit and weapons the player wears. Say “your suit” or “your tools” first. |
| Anchorage / skiff / engine teeth | The harbor settlement, a small flying boat, and the three missing regulator pieces. | Keep The Last Anchorage as a place name; use “home,” “boat” and “regulator pieces” in opening instructions. |

First playable objective: **Help the people at the dock.** First main-quest purpose: **Save the island.** After Sera shows what the Storm Engine is, the mission can adopt **Free the Storm Engine**, retaining the plain-language purpose in the journal.

Show function before vocabulary. No glossary popup, lore lecture or diagram quiz is needed. A boat drifts because its cable is loose; the boat comes closer when the reel turns; the island's lights and lift pulse with the distant engine. An illustration may supplement the physical staging, but cannot replace it.

The rescue changes the boat's safety; it does not fix the island's lift. The engine's failure threatens the whole island. Keep these causal chains distinct: the local repair lets the crew cross; the later engine tremor shows the island is still in trouble.

## Story logic to make consistent

The engine keeps the island in the air. We must restore control over its regulator, not switch off the thing keeping everyone alive. The Keelbreaker guards the compromised governor. Defeating it restores stable operation and opens the rescue route; Stormline Rescue follows because the crews can finally return.

Audit Sera, Oren, Iona, quest text, victory messages and map descriptions for contradictions. Replace ambiguous language such as “engine severed” with “governor freed” or “the storm's hold is broken” where appropriate. Call these quest objects “regulator pieces” in the opening and objectives. “Engine teeth” can be a later nickname once their shape and purpose have been shown. Do not claim the three existing field stations are three different mission types unless you actually build those differences.

## The opening: one uninterrupted rescue, roughly 5–8 minutes

Timing below is a pacing target, not an enforced countdown. Players may linger, read slowly, lose a fight or explore without failing the story.

| Beat | What the player does | What the player sees and learns |
| --- | --- | --- |
| 1. Home in trouble, 0:00–0:20 | Begin and take control near the southern landing approach. | A small flying boat arriving at a floating island, a loose cable visibly connecting it to the dock, and people struggling to cross. Establish the island above the storm and the huge machine on it in one short readable view. Sera calls Veyr by name. Control returns within 10 seconds; a skip action also returns it immediately. |
| 2. One person to save, 0:20–1:30 | Reach the dock's cable reel and clear a small, authored mechanical threat. | A visible crew member is stranded on the landing platform. The objective is “Help the people at the dock,” not “Kill three enemies.” No escort pathfinding is required: stage a short crossing after the threat is cleared. |
| 3. A repair that matters, 1:30–2:30 | Inspect the cable reel, then strike the clearly marked scrap jammed in its mechanism. | Use the existing strike input; every weapon can clear the scrap. The target is the obstruction, never the support cable or working reel. Cutting, thrusting and crushing produce different reactions. A cable tightens, the gangway settles and the crew member crosses into safety. One repair visibly changes the scene. |
| 4. The engine answers, 2:30–3:00 | Remain in control while the local lights recover. | The distant wheel makes one deliberate counter-turn. A low mechanical call interrupts the music; island lights dip and a distant lifting vent falters. Sera explains that this machine keeps the island in the air. The rescued boat stays secured. Establish the machine's purpose before implying intention. Use a brief optional camera emphasis, no long forced cinematic. |
| 5. A reason to leave safety, 3:00–4:30 | Speak with Sera beside the secured boat. | A short exchange establishes Veyr's connection, what the engine does, why rescuing one boat has not saved the island, and the main mission. The rescued person remains visible at the anchorage. |
| 6. Cross the threshold, 4:30–8:00 | Take the northern exit and choose a route toward a field station. | Reveal the turbine between the mooring pylons. A restrained chapter title appears: “THE LAST LIGHT.” Main quest: “Free the Storm Engine.” Current step: “Reach a field station.” The world opens with a purpose. |

Build the landing area into the existing settlement instead of creating a disconnected tutorial map. Inspect terrain and collision before choosing coordinates. Keep the route readable through light, cable direction, landmarks and camera framing. Use a subtle objective marker as backup. A decorative object that looks solid must have appropriate collision, or be placed outside the traversable route.

## Dialogue script and delivery

Keep these as the baseline. Terra may shorten for fit but must preserve the meaning and character. Do not add paragraphs of lore. Use the existing illustrated dialogue treatment for conversations. Urgent calls during movement need a small readable speaker caption that does not pause play, cover attacks or disappear before it can be read; important information must also remain in the objective or conversation history.

Opening call, Sera: **“Veyr! Their boat's drifting—help them get ashore!”**

At the jam, Sera, only if needed: **“Scrap's caught in the cable reel. Break it loose!”**

After the rescue, Sera: **“They're safe. Thank you.”**

Veyr: **“The whole island shook. What's happening?”**

Sera, with the distant machine clearly framed: **“That machine keeps our island in the air. If it stops, we fall into the storm.”**

Sera: **“We call it the Storm Engine. You used to help keep it running.”**

Veyr: **“It never used to fight us.”**

Sera: **“The part that keeps its power steady broke apart. The repair crews carried the three pieces to their stations. Then the other machines turned on them.”**

Veyr: **“Bring back the pieces. Get the engine under control.”**

Sera: **“Your suit can get you inside. I have to stay here and bring the boats in.”**

Veyr: **“How many people are still out there?”**

Sera: **“Too many. Save the island, and they'll have somewhere to come home to.”**

Veyr: **“Keep a light for us.”**

At the exit, Sera: **“The repair stations are marked on your map. Take whichever road you trust.”**

Pace this as an exchange with a clear view of the relevant objects. Never stack the entire script onto one panel. When shortening, retain the engine's purpose and the distinction between the local boat rescue and the island-wide problem.

Support Veyr's replies with an original portrait or a deliberate helmet silhouette matching the in-world hero. Do not accidentally display the fallback crew portrait as Veyr. Existing noninteractive props such as the field chart should receive a journal illustration, not a random human face. Reuse the portrait pipeline, not an external copyrighted character.

Do not force a reply-selection menu for a single fixed response. First press reveals a line, next advances; controller and touch must agree. Full text remains accessible and reduced motion skips letter animation. Cinematic skip is distinct from skipping the entire mission: it must leave playable objectives intact.

## Main-quest presentation after the opening

After its purpose has been established, maintain one stable main-quest identity: **Free the Storm Engine**. Its journal summary begins: **“Restore the machine keeping our home in the sky.”** Its current step changes underneath it. Survey cases and equipment notes should not visually compete with that mission.

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

- Within 30 seconds, there is an understandable situation and someone to help. Boat, cable, dock and storm are visually distinguishable.
- A new player can explain in everyday language what the Storm Engine does and what the dock cables do. Confusing them is a review failure.
- No essential opening instruction depends on understanding mooring, winch, governor, rig, skiff or engine teeth before their meanings are established.
- Within roughly 90 seconds at normal pace, the player has done something consequential using normal controls.
- After the briefing, a new player can explain who Veyr is, why the settlement matters, why Veyr goes, and what completing the main quest will accomplish.
- The cable-reel repair visibly changes at least three connected elements: cable/boat/crossing, crew position and local machinery motion. Success cannot exist only in text.
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

The result starts with an exposition wall; asks for three items before making the player care; teaches controls through mandatory popup chains; uses unfamiliar machinery names as if they explain themselves; conflates dock cables with the island's source of lift; adds a countdown to manufacture urgency; repeats the same objective under several names; merely renames the old quests; or claims cinematic polish from static mockups. Passing tests is necessary, but these experience failures still block approval.

## Handoff report

Give Astra: branch and commit, concise changes by checkpoint, save migration rule, tests and packaging results, walkthrough/screenshots with viewport and evidence type, known problems, and any story deviations. Do not say “production ready” or “high quality” as a substitute for that evidence.
