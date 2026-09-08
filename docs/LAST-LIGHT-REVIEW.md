# The Last Light review and release

Reviewed September 8, 2026. Terra implemented the opening and scene revisions; the primary agent reviewed and integrated them. The user explicitly requested fixes and publication after the findings.

## Findings resolved

- Chapter restart invokes the playable rescue entry point and clears input and presentation state.
- Prologue enemy meshes follow their encounter gate after reload; inactive dock threats stay hidden.
- Passenger travels on the boat, descends the visible gangway, and follows a sampled collision-clear ground route. The reel only turns while pulling and retains its final angle.
- Engine response has an audible mechanical call, music ducking, a brief light dip, faltering lift exhaust and optional tremor. Boat safety is established before this separate island threat.
- Regulator pieces seat on the suit, persist across load and weapon changes, illuminate a three-piece chart assembly, and receive distinct Sera acknowledgements. Engine victory steadies illumination and relaxes cable strain. Followup dialogue no longer implies the lift engine was switched off.

## Validation

Run `node --test 3d/tests/*.test.mjs` and `node tools/package-release.mjs` from a clean output directory. Added regression checks exercise actual main-module restart/preview/dialogue handlers with DOM and renderer doubles, old-save migration, all tools repairing the jam, safe-before-engine ordering, idempotent collection, crew movement continuity, collision clearance and visibility. Scene checks cover both 390×844 and 844×390 dimensions for finite transforms. These are simulations, not device playtests or visual layout certification.

The cloud browser cannot open the local development server. No uncut WebGL walkthrough, iOS hardware run, or actual phone dialogue-layout evidence was available for this release. Do not describe this as production-ready based on automated tests. The public preview permits the owner to play without replacing the main save.

## Scope and rollback

No forced introductory movie or new camera lock was added, so there is no cinematic skip dependency; movement stays available during the rescue. Dialogues retain reveal/advance and can be reopened if dismissed. The opening is a compact authored rescue; the original 5–8 minute estimate has not been validated in a human playthrough.

The pre-release main commit is `dbafbd5af1bb9670c975e228b617da17f70295fc`. Preserve it remotely as `backup/before-last-light-prologue` before merging. The existing game save key is unchanged. `?preview=last-light` uses separate session storage and returns to the main adventure through the title-screen link.
