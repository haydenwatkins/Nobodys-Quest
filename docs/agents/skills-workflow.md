# Matt Pocock skills for Patchling's Quest

Installed October 13, 2026 from [mattpocock/skills](https://github.com/mattpocock/skills), inspected at commit `49dd158d1076134a641b33efb035946536778336`. The upstream README documents both a Codex plugin and editable project-local installation. This project uses only the latter; no global plugin was installed.

## Installation and discovery

The documented editable-file installer was run in the project:

```sh
npx --yes skills@latest add mattpocock/skills -a codex -s '*' -y
```

The recursive installer also selected eleven miscellaneous/in-progress skills. Those were removed with the installer's `remove` command. The retained library comprises the 20 engineering and seven productivity skills listed in the upstream README, including `setup-matt-pocock-skills`. Installed files are in `.agents/skills/`; `skills-lock.json` records their upstream paths and hashes. Matt's MIT notice is preserved in `.agents/matt-pocock-LICENSE`.

The installer list and Codex's native app-server `skills/list`, with this project's working directory and `forceReload: true`, both discovered all 27. Native results: enabled, repository scope, no discovery errors. This verifies Codex discovery, not a live refresh of this chat's initial skill catalog. This conversation can read and follow the installed files directly; a fresh Codex session can discover them normally.

Recheck without starting a model turn:

```sh
npx --yes skills@latest list -a codex --json
python tools/check-agent-skills.py
```

Updates are manual with this installation. Use `npx skills@latest update --project`, inspect the diff and recheck discovery. Avoid an unfiltered wildcard reinstall: it also imports upstream experimental/miscellaneous skills. To restore only the retained set, use `npx skills@latest experimental_install` from the committed lockfile.

## Working on the game

In Codex, name a skill with `$`, for example: `$grill-with-docs Help me choose a useful card passage for Tansy; infer settled decisions from the game docs.` You can also name it in plain language in this conversation. After the design is settled, `$implement` owns the bounded build; its TDD and review steps do not require you to run separate commands or manage the tests.

1. **Brief design conversation:** use `grill-with-docs`, which combines `grilling` and `domain-modeling`. First read the game rules, application ledger, current roadmap and relevant feature docs/code. Ask only unresolved player-experience decisions, recommend a concrete answer and explain the tradeoff. Existing family decisions are facts to recover from docs. Record settled vocabulary in the glossary; use an ADR only for a costly, surprising tradeoff.
2. **Choose a delivery size:** a bounded change such as Tansy's next card passage goes directly to `implement` in the same conversation. A larger change spanning sessions can use `to-spec` and `to-tickets` to publish self-contained GitHub work with dependencies. Read those skills before using them. Do not manufacture tickets or extra workflow stages for a small change.
3. **Own implementation:** use `implement` and `tdd` for one behavior at a time: a failing observable-behavior test, the smallest change, then the next slice. Reuse the native runtime/input boundary and browser workflows already established by the game. The agent owns routine test selection under the user's standing authorization; there is no separate approval prompt for every seam or engineering choice. Plain JavaScript/Canvas remains the active game.
4. **Review and verify:** use `code-review` against the captured starting commit and agreed design. The skill asks for separate Standards and Spec review agents. Use focused/native checks while behavior is changing, address review findings, then freeze runtime code for the final appropriate regression and inspect changed touch/controller layouts. An interrupted preliminary run is not a full-suite pass. A gameplay release additionally requires exact-SHA Pages verification and public runtime checks. Keep evidence separate from physical-device or family playtesting.
5. **Leave a resumable checkpoint:** update the application ledger and active roadmap, preserving broader obligations and the next actual gap. Commit and push under the user's existing authorization. Use `retro` when a session exposes useful workflow improvements, after reading it.

Skill defaults do not override the user's authorization or the game contract. Keep the requested interview short; infer settled decisions and own routine work. No new difficulty chooser, progression currency, quest engine, compulsory menu work or form-unlock cascade follows from installing this library.

## First design exercise: boss distinctness

Nell's shipped carried planets demonstrate a useful consequence while the boss keeps acting. They do not prove the other bosses are distinct. Before this exercise, Tansy’s splash cancelled all owned pressure and created a global stagger. The user chose a visible passage through the next card fan, preserving a walking alternative and Sharp’s ward purpose; that backfill is now shipped.

Queen’s follow-through now uses the same workflow with a different payoff: lasting useful ground while the boss continues. [Issue #48](https://github.com/haydenwatkins/Nobodys-Quest/issues/48) holds its self-contained spec. The roadmap’s next gameplay ticket is [Briar’s garden path (#49)](https://github.com/haydenwatkins/Nobodys-Quest/issues/49); [Worldwake acquisition (#50)](https://github.com/haydenwatkins/Nobodys-Quest/issues/50) keeps the continuous-session milestone independently actionable. Priority order is separate from genuine code dependencies. Menu-optional collecting and form-unlock pacing remain obligations in the same roadmap.
