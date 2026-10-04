# Current cloud roadmap

October 4, 2026. Start here for the 2D game. `CONTINUING-UPGRADES.md` retains the historical record; the art ledgers remain the source of truth for coverage. This handoff records design and workflow decisions, not implemented gameplay changes.

## Active checkpoint

Ben's shared typography upgrade is shipped: self-hosted Nunito, sharp world labels, readable 2D menus/dialogue/HUD, both art settings and touch/TV/tablet layouts. See `TYPOGRAPHY.md` for evidence and limits. Startup optimization is also shipped; its paired Chromium benchmark improved script startup about 38% and page load about 33% (`STARTUP-PERFORMANCE.md`).

Completed coverage: all current named/resident bodies and dialogue portraits; all ten chest identities; all eighteen guardian trophies plus the Tollkeeper gift; Parcel's two completion gifts, Brindle's recipe promise and Prairie's first courier satchel. Marsh's three gifts, Grove's shelter, Ridge/Mistwood/Starfall/Glasswater's five awards and Shattercoast's Tideglass Chronicle now also persist visibly on the ground. Native world restoration/recovery remains immediate; their spirit pays on collection. Starfall's costume waits for collected ownership; Glasswater's Mark gate remains intact. The reward ledger (`GROUND-REWARDS.md`) records the individual contracts, rendered review, test evidence and remaining sources.

Task flow already has the shared current-task view, explicit accept/defer choices, selected-promise persistence and complete beacon/recipe accept-help-return-consequence-revisit paths. See `CURRENT-TASK.md`. Keep extending that foundation; do not add a second quest engine. Shared readability still needs fixed/paper combinations, peripheral actors, Legend relics and hazard/effect contrast.

**Next bounded task:** convert Sunrise's four NPC thank-you spirit rewards to saved, visible gifts while preserving their accomplishment checks, once-only thanks, immediate quay consequences, task selection, later visits and legacy saves. Then continue Worldwake favors, other town currency (including ward-break/deed bonuses), challenge-return rewards and existing relic/echo presentation before broadening Worldwake's NPC loops.

Local heartbeat remains prepared, not activated (`HEARTBEAT-HANDOFF.md`). Active-session development remains authorized; live weekly metering is unavailable through current tools. Resume interrupted working-tree changes first. Preserve the user's 70%-consumed budget policy without inventing readings or unattended scheduling.

## Ownership and current state

The cloud conversation has read the recent handoff from the local conversation **2D Nobody's Quest**. Continue the existing 2D game, its original cast, earned progress, controller/touch mappings, and approachable content authoring. The separate `3d/` game is outside this roadmap.

The cloud handoff baseline is `c9caad0`. Current recorded art coverage: 24/24 forms, 19/19 boss definitions, 40/40 maps, 12/12 wildlife species, 18/18 regular foes, and 13/13 named NPC world sprites after the specialist batch below. All six resident appearances are complete. Current portrait/speaker coverage is complete for the roster; shared readability, cover and item presentation are unfinished.

The user reported that the limit had reset and explicitly renewed active development again on October 4. This is a user-reported reset, not a measured percentage. The prior autonomous authorization has a cap of **70% total weekly usage consumed (30% remaining)** and asked the agent to solve automation. After the metering/scheduler diagnosis, the user explicitly instructed: "okay then just keep working until you hit your limit." Continue active-session development under that latest instruction; the weekly percentage remains unverified. The prior local heartbeat was paused after 71%. Do not treat renewal as evidence of a weekly reset or a current usage reading. No reset credits, purchases or model changes to bypass limits are authorized. The cloud tool set exposes no automation editor or native account-usage reader. CLI diagnostics are recorded below; writing this file does not schedule work.

The user wants the agent to drive development and cannot playtest every upgrade. Routine implementation choices and desktop validation should not require their input. Occasional device/family feedback improves direction; it is not a gate for every batch.

## Design decisions

**Keep the browser delivery and Canvas renderer for now.** Browser delivery suits iPad, Android, and the Android TV WebView. An engine migration is not currently justified by a measured rendering or authoring limitation. The renderer already caches sprite canvases and separates sharper UI from the world; do not propose those as missing features. Preserve the kid-facing form/map/ability workshop.

**Make helping people the campaign's organizing structure.** The desired Stardew-like quality is remembering people, understanding their requests, going out with a purpose, returning with good news, and seeing the place improve. Retain optional exploration and build depth. Do not add farming, daily deadlines, missed-day penalties, or a relationship grind to obtain this structure.

Sunrise already has four authored requests, route guidance, followed-request persistence, once-only thanks, and visible local consequences in `js/engine/sunrise-requests.js`. Develop that foundation instead of adding a second generic quest engine. Form mastery remains a distinct automatic learning/reward system.

The shared `G.currentTask()` view presents the selected promise or campaign step in both field layouts, the journey headline and atlas; route guidance and NPC readiness reuse the same existing request state. Temporary Form/Legend Echo guidance and followed field notes retain priority. `G.storyGoal()` still owns campaign chapter/portfolio progress. No new save format or second quest engine was added. See `CURRENT-TASK.md`.

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

1. Audit shared effects, fixed/paper HUD combinations and other barrier contracts. Optional regular-HUD clearance for nearby NPCs is complete with eight focused checks and six inspected native layout views. Cobblekin cover is complete: its circular shot-filter field now looks passable and retains native collision/cost/lifetime.
2. Complete shared HUD/effects readability; optional cards still obscure peripheral actors. All thirteen named bodies, six resident appearances and current dialogue identity/portrait coverage are complete; do not redo them.
3. Complete the ground-item/reward-source audit. Dropped items must be recognizable on the ground, persist safely, and explain their use without requiring dialogue. Do not silently exempt reward categories.
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

Authorized ongoing policy: stop at 70% total-weekly consumption, complete an already-started bounded batch safely at the threshold, then pause. Check live usage before a substantive batch and after shipping. If live usage cannot be read, do not claim to enforce the percentage cap or launch unattended runs; preserve a bounded completed checkpoint and resolve metering before launching an unattended loop. The subsequent user instruction authorizes continuing the active session until its available limit; do not claim to measure a weekly threshold. Never use future reset credits or switch models to bypass a limit.

A cloud filesystem and saved startup instructions do not create an always-running worker. A scheduler must invoke the task against this environment. The previous local heartbeat does not automatically move to the cloud. If scheduled-run configuration is unavailable, state that once and supply the resumable run brief; do not imply that this chat will work after its turn ends.

## Reusable scheduled-run brief

> Continue the 2D Nobody's Quest roadmap in `/workspace/Nobodys-Quest`. Read `docs/CLOUD-ROADMAP.md`, the relevant coverage ledger, and the working-tree state. Resume incomplete work, then deliver the next bounded playable improvement in the recorded priority order. Own design, implementation, meaningful tests, rendered review, save compatibility, and the established authorized shipping workflow. Preserve touch/controller support, original cute characters, kid-friendly authoring, and existing earned progress. Do not request routine approval or wait for a user playtest. Record a short resumable checkpoint and continue while the explicitly configured budget permits. Stop only for a real blocker, an unresolved regression that needs outside action, or the usage limit. Keep scheduled runs serialized so two workers cannot edit or ship the same checkpoint. Report shipped milestones and concrete blockers; do not promise unverified hardware behavior.

## October 3 evidence and checkpoint

The cloud environment has Node, Chromium, Playwright, and canvas tooling; no game dependency install is needed. During onboarding, 48 focused checks passed, and browser smoke checks exercised the root game and the separate 3D game. The broad test run was deliberately interrupted and is not recorded as a full pass.

This design review loaded the actual 2D opening at 667x375 with touch, 1024x768 with touch, and 1280x720 without touch. All three reported no script errors or horizontal overflow. Screenshots were inspected. These are desktop Chromium layout checks, not physical-device playtests or a complete opening walkthrough.

The first cloud game batch completed Errata/Alias/Provisional world sprites and a reusable NPC atlas renderer. Ten focused checks and twelve final controlled touch-landscape views passed; all poses/facings/settings were inspected. See `NPC-ART-PASS.md`. That first batch did not implement quests, an engine migration, portraits or scheduled automation. The subsequent field batch completed Moss/Lastminute/Probably with ten focused checks, twelve inspected native world/talk captures and all pose sheets. Brindle/Mara/Pip and all six town resident appearances are subsequently complete. Focused suites passed: 11 delivery/request/art checks, 8 crowd/save/routine checks and 7 final alias/dialogue checks, with some repeated cases. All pose sheets, twelve native quay world/request views and twelve founded-town world views were inspected; Brindle’s short request alias now resolves correctly. The portrait integration is complete: thirteen composed NPC busts, all form/guardian identity cards, explicit native aliases/domain/phase headings and neutral narration in both dialogue styles. Thirty final controlled phone/tablet/TV captures were inspected; touch continuation and the actual TV pad bridge passed. See `DIALOGUE-SPEAKERS.md`. Cobblekin cover subsequently passed six focused checks and six inspected native cast/crossing/fade views in both settings. Optional regular-HUD clearance subsequently passed eight focused checks and six inspected native Mistwood layout views in both settings. Ordinary heart/mana drops are now complete with eight focused checks and four inspected ground/collection views; their native expiry, magnet and amounts remain. All ten chest item identities subsequently gained durable ground contents and sharp purpose/collection cues. Thirty regional/item checks and twelve final pending/save/opening/HUD checks passed; thirty-six final native chest browser views were inspected in both settings with touch layout and TV bridge movement, including real save reload. See `GROUND-REWARDS.md`. The Ancient Treant’s Crown/star is subsequently a durable ground gift, with saved victory/no respawn while pending and collect-then-return task flow. Seventeen integration checks, thirteen path/echo/art checks and twelve inspected native final-blow/reload/claim views passed, with some repetition. The Mire Queen’s Pearl/star and beacon-request consumer are subsequently complete: twenty-two progression checks, twelve HUD/echo/guardian checks and one native-paint cue check passed, with repeated cases; twenty final touch/TV views were inspected. The promise directs collection before returning to Pebble and retains the beacon and later-return response. Optional regular cards now clear nearby Form Echo bodies/markers. The Eclipse Knight’s Sigil/star is subsequently complete with seventeen focused progression/route/Keepsake checks and twelve inspected touch/TV views. A reusable `tools/review-ground-gift.cjs` covers the four converted guardians. Aurelia’s Sky Mark is subsequently a saved ground gift with native Mark/lift awakening and peaceful revisit coverage; twenty final touch/TV views were inspected. Initial existing route/request/lift checks passed and the corrected native Mark fixture passed; eleven final guardian/progression/Worldwake/Form Echo checks passed, with repeated cases. Next bounded batch addresses stacked collection/Build/path feedback, then Old Mason’s Stone Mark and restored crossings. Shared effects/paper HUD combinations remain in scope. See `SHARED-READABILITY.md`.

## Automation and metering diagnosis (October 3)

The installed Codex CLI supports cloud task submission and the app-server protocol, including the documented `account/rateLimits/read` method. CLI login status recognizes ChatGPT authentication; that status alone does not establish access to the usage API. Native task tools expose neither scheduling mutations nor account usage.

The default CLI app-server initially failed because its runtime state is read-only. Redirecting its supported SQLite/log locations into `/workspace/cloud-setup/` still left an installation-state write blocked. An approved escalation allowed the read-only usage probe to initialize without copying or printing credentials. The supported API then returned HTTP 401 from `https://chatgpt.com/backend-api/wham/usage`: authentication could not be parsed. This confirms that the current cloud CLI route cannot read the user's subscription usage with its existing injected login.

The completed probe is `/workspace/cloud-setup/Nobodys-Quest/read-usage.py`; it returns window percentages/status only. It does not launch a model, consume reset credits, submit cloud jobs, edit the user's desktop automation, or schedule a loop. Retry after a supported authentication or native-tool change. Do not request raw account tokens or embed credentials in scripts. A shell timer without authenticated metering would not enforce the authorized budget and has not been launched.

Current outside prerequisite: a supported scheduler plus authenticated account-usage access bound to this cloud task. An unattended loop requires that capability. Active-session work continues under the user's latest instruction; do not confuse a running HTTP server, saved configuration, or a prompt file with an active autonomous build loop.

## Local heartbeat handoff

The user explicitly authorized setting up a heartbeat on the computer and offered to leave it on. The available cloud tools still cannot edit local automation or execute on that host. `HEARTBEAT-HANDOFF.md` contains a concrete prompt for the existing paused local automation, including remote-main synchronization, serialized work and budget handling. It is prepared, not installed or activated. Continue active-session development meanwhile; do not claim that leaving the computer on starts the worker.
