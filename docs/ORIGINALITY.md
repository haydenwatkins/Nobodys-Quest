# Original direction and release provenance

Record date: 2026-09-07. Working product title: **Veyr and the Storm Engine**.

## Design change

The owner requested a distinct hero adventure and removal of identifiable borrowing from *Nobody Saves the World*. This revision replaces the earlier blank protagonist, animal/class transformation progression, borrowed-ability system, lighthearted character writing, and fantasy settlement presentation.

The current chapter follows Veyr, an armored salvage runner with an asymmetric rig, copper visor and torn red scarf. Tools stay mechanical: Cinder edge, Arc lance, and Keel hammer. Pressure generation, weapon-specific vent attacks, posture breaks, deliberate attack timing and evades define combat. The crew, dialogue, mechanical enemies, governor mission and storm machinery presentation were authored for this revision with AI assistance. The broad ideas of an action adventure, weapon switching, a boss and a curved world are not represented as inventions or exclusive property.

## Current distribution inventory

| Component | Origin and treatment |
| --- | --- |
| Hero, NPCs, enemies, weapons, shelters, machinery and effects | Procedural geometry authored in this project; no imported character models or source-game artwork |
| Dialogue, names, objectives and interface copy | Rewritten for this direction; title remains provisional |
| Audio | Oscillator/noise synthesis and a short musical pattern authored in `main.mjs`; no sampled recordings |
| Fonts | Browser/system fonts; no font files distributed |
| Terrain, collision/camera utilities, input and saving infrastructure | Adapted from this repository's earlier 3D prototype; not independently clean-room reimplemented |
| Three.js 0.170.0 | MIT-licensed renderer, unchanged; copyright and permission notice included |
| Old 2D content and native wrapper | Removed from current tree and release: sprites, icons, backgrounds, fonts, forms, dialogue, docs, Android-TV wrapper and manifest |
| Old repository title/address | Historical URL retained to avoid breaking links; absent from game branding |

`tools/package-release.mjs` copies only the explicitly listed current runtime files and notices, and checks for selected legacy names. That scan catches known strings; it is not a comprehensive similarity or rights assessment. The current game loads no external artwork, music, fonts, telemetry or asset CDN.

## Preservation and boundaries

Rollback branches and Git history still contain prior material. This change does not purge public history, old downloads, forks, browser caches, store listings or previously distributed builds. They must not be treated as approved release packages. The owner requested reversibility, so history was deliberately preserved. Existing legacy browser saves are left intact, but the new game never reads them.

No third-party warranty of ownership, exclusivity, noninfringement or sale-readiness is made. This is a practical redesign and asset removal pass, not legal clearance. No comprehensive trademark, trade dress, patent, international-law or substantial-similarity review was performed. AI assistance also does not establish copyright protection or exclusive ownership of every output.

Before commercial naming/launch, obtain a proper title and trademark clearance search and have qualified IP counsel review the final assets, overall presentation, provenance and intended markets. A limited web search did not establish that the working title is available. Human art direction and further distinctive writing/visual development should remain documented.

The U.S. Copyright Office distinguishes game ideas/methods from potentially protected literary and pictorial expression: https://www.copyright.gov/register/tx-games.html . USPTO guidance describes a broader search covering similar marks, registrations/applications and common-law uses: https://www.uspto.gov/trademarks/search/comprehensive-clearance-search-similar-trademarks . These sources explain why renaming alone would not resolve the owner's request and why this revision is not a legal guarantee.
