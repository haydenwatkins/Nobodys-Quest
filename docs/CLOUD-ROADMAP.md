# Current cloud roadmap

October 3, 2026. Start here for the 2D game. `CONTINUING-UPGRADES.md` retains the historical record; the art ledgers remain the source of truth for coverage. This handoff records design and workflow decisions, not implemented gameplay changes.

## Ownership and current state

The cloud conversation has read the recent handoff from the local conversation **2D Nobody's Quest**. Continue the existing 2D game, its original cast, earned progress, controller/touch mappings, and approachable content authoring. The separate `3d/` game is outside this roadmap.

The cloud handoff baseline is `c9caad0`. Current recorded art coverage: 24/24 forms, 19/19 boss definitions, 40/40 maps, 12/12 wildlife species, 18/18 regular foes, and 7/13 named NPC world sprites after the specialist batch below. Remaining NPCs, residents, portraits, shared readability, and item presentation are unfinished.

The user renewed autonomous development authorization on October 3 with a cap of **70% total weekly usage consumed (30% remaining)** and asked the agent to solve automation. The prior local heartbeat was paused after 71%. Do not treat renewal as evidence of a weekly reset or a current usage reading. No reset credits, purchases or model changes to bypass limits are authorized. The cloud tool set exposes no automation editor or native account-usage reader. CLI diagnostics are recorded below; writing this file does not schedule work.

The user wants the agent to drive development and cannot playtest every upgrade. Routine implementation choices and desktop validation should not require their input. Occasional device/family feedback improves direction; it is not a gate for every batch.

## Design decisions

**Keep the browser delivery and Canvas renderer for now.** Browser delivery suits iPad, Android, and the Android TV WebView. An engine migration is not currently justified by a measured rendering or authoring limitation. The renderer already caches sprite canvases and separates sharper UI from the world; do not propose those as missing features. Preserve the kid-facing form/map/ability workshop.

**Make helping people the campaign's organizing structure.** The desired Stardew-like quality is remembering people, understanding their requests, going out with a purpose, returning with good news, and seeing the place improve. Retain optional exploration and build depth. Do not add farming, daily deadlines, missed-day penalties, or a relationship grind to obtain this structure.

Sunrise already has four authored requests, route guidance, followed-request persistence, once-only thanks, and visible local consequences in `js/engine/sunrise-requests.js`. Develop that foundation instead of adding a second generic quest engine. Form mastery remains a distinct automatic learning/reward system.

The current main-story HUD reads `G.storyGoal()` while route guidance can prioritize a followed Sunrise request. After the visual queue, introduce a small shared current-task view that presents the selected promise or campaign step consistently in the HUD, journal, route guidance, and NPC prompt. Keep chapter state and reward ownership in their existing systems. Do not force all progression into a new save format.

An NPC request should communicate:

- Who needs help and why, in one short exchange.
- One understandable next action and the necessary form or tool.
- The destination, a recognizable world cue, and route help on request.
- Completion through the actual accomplishment, then a clear return to the person.
- A visible consequence and a distinct later-return reaction.

Essential instructions remain available when dialogue is skipped. Accepted promises must not silently replace a player's deliberately selected task. Preserve credit for previous accomplishments and exactly-once rewards.

**Aim graphics work at expression and readability.** Finish distinctive faces, connected hands/equipment, action poses, portraits, and consistent speaker identity. Keep scenery subordinate to actors, threats, pickups, and interactions. Use restrained contact shadows, depth, sound, and reactive props where they improve the scene; preserve the previous prohibition on detached ornamental character stamps.

Support edited sprite sheets and portraits alongside the existing letter-grid artwork as the asset workflow grows. Export/validate assets with developer tools; players should still receive a simple static site. Prove one representative asset import before any broad art-pipeline conversion. New tools should make Ben's ideas easier to add, not require him to maintain engine infrastructure.

PixiJS is a possible later renderer upgrade for a proven need for GPU batching, lighting, or effects. Phaser could help if scene/animation management becomes the dominant burden. Godot would require a larger rewrite and renewed web-export, save, input, and TV-wrapper validation. None is a prerequisite for the planned visual quality. Evaluate any renderer experiment in one isolated scene with measured startup, memory, and device performance before choosing a migration.

## Ordered implementation queue

1. Next bounded NPC art batch: Groundskeeper Moss, Captain Lastminute, Oracle Probably. Review world sprites, actual conversations, routines, all poses/facings, and both pixel settings. Errata/Alias/Provisional are complete; do not redo them.
2. Complete the three quay people, six resident appearances, and full portrait/speaker coverage. Keep the NPC ledger current; do not repeat finished bodies.
3. Complete shared readability, Cobblekin cover whose appearance matches collision, and the ground-item/reward-source audit. Dropped items must be recognizable on the ground, persist safely, and explain their use without requiring dialogue. Do not silently exempt reward categories.
4. Build one complete NPC promise through the existing request/guidance foundation, with a shared current-task presentation. Use an existing region and existing accomplishments; demonstrate accept/help/return/consequence/revisit before broadening coverage.
5. Apply that pattern to Worldwake: danger-aware requests, immediate victory reactions, later-return dialogue, visible recovery, and authored reasons to revisit. Inventory existing regional activities first.
6. Extend the best proven patterns through the campaign. Prefer stronger sessions and meaningful build decisions to more forms, menus, progression currencies, or procedural filler.

This retains the prior visual-first order. The task-flow design is prepared now for implementation after that queue, unless the user changes priorities.

## Autonomous delivery workflow

Use the existing isolated checkout at `/workspace/Nobodys-Quest`; do not create a Git worktree unless requested. Keep one active checkpoint and a short next action here. Large historical logs should not be read or copied into every run.

At each scheduled run, inspect working-tree changes, the active checkpoint, applicable instructions, and the relevant ledger. Resume interrupted work first. Select a bounded player-visible improvement. The agent owns design, implementation, validation, and the inherited authorized commit/push workflow. Do not wait for a playtest or confirmation of routine choices after a passing batch.

Validate real behavior: current save migration, route access, actual input actions, once-only rewards, and relevant regressions. For visual work, inspect rendered art and actual game scenes at gameplay size. Use saved scenarios and fresh browser contexts rather than leaving test mutations in real player saves.

Run the affected existing tests first. Run broad regression at integration checkpoints or for changes to shared save/input/combat contracts; repeatedly rerunning the entire art suite after every cosmetic refinement wastes time. A passing focused suite is not a claim that the complete suite passed. Do not skip, weaken, or fabricate tests to ship.

Automate representative touch, controller-state, dialogue, pause/resume, resize, and save/reload workflows. Screenshots at corrected resolutions are useful evidence, but they do not establish Safari behavior, physical gamepad compatibility, TV viewing-distance legibility, GPU performance, or thermal behavior. Reserve occasional real iPad/Android/TV checks for major input/rendering changes and release milestones, with a short specific checklist.

After each batch, update this checkpoint and the relevant ledger with the result, evidence, remaining issue, and exact next task. Report compactly when a milestone ships, a regression appears, or an outside action is needed. Continue automatically while the configured usage budget allows it.

Authorized ongoing policy: stop at 70% total-weekly consumption, complete an already-started bounded batch safely at the threshold, then pause. Check live usage before a substantive batch and after shipping. If live usage cannot be read, do not claim to enforce the percentage cap or launch unattended runs; preserve a bounded completed checkpoint and resolve metering before extending the loop. Never use future reset credits or switch models to bypass a limit.

A cloud filesystem and saved startup instructions do not create an always-running worker. A scheduler must invoke the task against this environment. The previous local heartbeat does not automatically move to the cloud. If scheduled-run configuration is unavailable, state that once and supply the resumable run brief; do not imply that this chat will work after its turn ends.

## Reusable scheduled-run brief

> Continue the 2D Nobody's Quest roadmap in `/workspace/Nobodys-Quest`. Read `docs/CLOUD-ROADMAP.md`, the relevant coverage ledger, and the working-tree state. Resume incomplete work, then deliver the next bounded playable improvement in the recorded priority order. Own design, implementation, meaningful tests, rendered review, save compatibility, and the established authorized shipping workflow. Preserve touch/controller support, original cute characters, kid-friendly authoring, and existing earned progress. Do not request routine approval or wait for a user playtest. Record a short resumable checkpoint and continue while the explicitly configured budget permits. Stop only for a real blocker, an unresolved regression that needs outside action, or the usage limit. Keep scheduled runs serialized so two workers cannot edit or ship the same checkpoint. Report shipped milestones and concrete blockers; do not promise unverified hardware behavior.

## October 3 evidence and checkpoint

The cloud environment has Node, Chromium, Playwright, and canvas tooling; no game dependency install is needed. During onboarding, 48 focused checks passed, and browser smoke checks exercised the root game and the separate 3D game. The broad test run was deliberately interrupted and is not recorded as a full pass.

This design review loaded the actual 2D opening at 667x375 with touch, 1024x768 with touch, and 1280x720 without touch. All three reported no script errors or horizontal overflow. Screenshots were inspected. These are desktop Chromium layout checks, not physical-device playtests or a complete opening walkthrough.

The first cloud game batch completed Errata/Alias/Provisional world sprites and a reusable NPC atlas renderer. Ten focused checks and twelve final controlled touch-landscape views passed; all poses/facings/settings were inspected. See `NPC-ART-PASS.md`. No quest feature, engine migration, dedicated portrait system or scheduled automation is implemented by this checkpoint. Next substantive game batch is Moss/Lastminute/Probably.

## Automation and metering diagnosis (October 3)

The installed Codex CLI supports cloud task submission and the app-server protocol, including the documented `account/rateLimits/read` method. CLI login status recognizes ChatGPT authentication; that status alone does not establish access to the usage API. Native task tools expose neither scheduling mutations nor account usage.

The default CLI app-server initially failed because its runtime state is read-only. Redirecting its supported SQLite/log locations into `/workspace/cloud-setup/` still left an installation-state write blocked. An approved escalation allowed the read-only usage probe to initialize without copying or printing credentials. The supported API then returned HTTP 401 from `https://chatgpt.com/backend-api/wham/usage`: authentication could not be parsed. This confirms that the current cloud CLI route cannot read the user's subscription usage with its existing injected login.

The completed probe is `/workspace/cloud-setup/Nobodys-Quest/read-usage.py`; it returns window percentages/status only. It does not launch a model, consume reset credits, submit cloud jobs, edit the user's desktop automation, or schedule a loop. Retry after a supported authentication or native-tool change. Do not request raw account tokens or embed credentials in scripts. A shell timer without authenticated metering would not enforce the authorized budget and has not been launched.

Current outside prerequisite: a supported scheduler plus authenticated account-usage access bound to this cloud task. Continue from the saved next batch once that capability is available; do not confuse a running HTTP server, saved configuration, or a prompt file with an active autonomous build loop.
