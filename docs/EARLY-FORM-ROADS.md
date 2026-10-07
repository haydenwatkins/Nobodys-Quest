# Three shapes that mend the road

October 7, 2026. Bramble Scout, Frog and Copperwick Brewer now have connected local adventures with real repairs, optional neighbour promises and remembered returns. The roster stays at 24 forms and 96 lessons. This first checkpoint left ten earlier specialists. Cloudcap Conductor/Hearthdrake subsequently receive two roads; eight remain. See `CONDUCTOR-HEARTHDRAKE.md`.

| Shape and road | First useful action | Variation and lessons | Lasting benefit |
| --- | --- | --- | --- |
| Bramble Scout · Bramblebank Crossing | Shoot the copper bridge winch across a creek | Another winch upstream; distant Arrow contacts, then Light-warded wisps for Lucky Arrow | Two footbridges shorten Parcel's delivery route for every shape |
| Frog · Reedbed Ferry | Catch a pontoon's towing loop with Tongue Lash | A second loop upstream; real creatures can be pulled close for Hop Crash | Moss's two pontoons restore bank crossings for baskets and return trips |
| Copperwick Brewer · Copperwick Lampyard | Catch the three lamp creatures in a wide Volatile Flask burst | A second clump beyond a perpendicular shelf; Bottle Bonk and new Miasma opportunities remain in the yard | Cleared lamps and two plank paths make a warm route home |

## Route and request rules

These are actual spurs: Bramblebank and the Lampyard leave Greenfield's west edge at rows 50 and 55; the ferry joins the marsh's northern bank. Ordinary movement crosses the same border on the way back. Existing regional entrances remain intact. Every map has an open longer route, a familiar rest camp and a renewable picnic. No form door, teleport, star toll or new currency was added.

The current new-form outing recommends its neighbour's useful action. Bank/perch targets have fixed authored positions, so moving foes cannot make repair guidance jump around. After both repairs, the ordinary native-lesson/clearing outing continues. The existing two-lessons/two-arts/two-clearings discovery rule stays in effect; these optional repairs do not add a mandatory campaign gate.

Parcel worries about wet birthday parcels, Moss misses visits across the water, and Provisional worries about neighbours finding their way after dark. Each uses the existing Sunrise accept/defer, selected-task, help/return/consequence/revisit system. A newly available form makes its own request available; requests never auto-accept or replace a selected promise. Before the shape is owned, the neighbour can explain the local problem and the open long path without starting a new task. Moss and Provisional's short speaker aliases resolve to their existing authored portraits.

Returning shares the good news once, then later dialogue remembers the help. The world repair is its reward; these requests award no new stars or spirit. The repairs and selected/completed promises survive actual save reboot. New request registration updates the existing allowed-ID list used by town normalization.

## Native action and recovery

Winches and towing loops use native projectile/melee geometry as inert world mechanisms. They cannot award hits, kills, mastery or mana. Bow auto-aim uses projectile collision, so water stops feet without blocking a clear shot; trees and walls still block it. Borrowed native arts remain usable while mastery continues to belong to the worn form.

Lamp repairs inspect the successful targets of one actual explosion, rather than combining unrelated hits or reacting to an empty cast. Catching three of that stand's authored creatures opens its path immediately. If a player already defeated part of the clump, guidance asks for the remaining creatures; clearing them also opens the path. Missing an early group opportunity never requires a reload or respawn to finish the request.

`roadworks.opened` saves the six valid repair IDs. Missing old data means no repairs, with existing ownership/mastery unchanged. Restoring a path replaces individual grid cells instead of mutating shared map legends; another adventure slot starts with its own closed crossings. Existing owned forms do not acquire a retroactive outing obligation.

Art has authored waiting/restored winch, pontoon and lamp poses, joined planks, regional ground/water, yielding landmarks and familiar picnic furniture. Drawing reads the saved repair state; it does not award progress. Nunito and the sharp text layer remain the lettering system.

TV ranged-aim coaching now explains the right stick; touch keeps its tap/drag instructions. Location headers show the place name without the former debug enemy count, which also counted inert road mechanisms.

## Verification

Broad integration checkpoint: 614 tests passed, zero failed/skipped. Subsequent recovery, request normalization, portrait and final rendering refinements passed 31 focused native checks. Final save/controller/road checks passed nine cases, and combat/aim/guidance/HUD regressions passed fourteen. These runs overlap; their counts must not be added to the broad suite.

`node tools/check-early-form-roads.cjs` uses actual feet-safe walking, native A/B/C casts, original enemy health/wards, mana and cooldowns. All three roads supply both repairs, two lessons, two native arts and separate encounter victories in one visit, with no respawns: Scout 13 casts, Frog 19, Brewer 7. Enemy AI is held still to establish lesson availability; these numbers are not session-duration or difficulty measurements.

`node tools/review-early-form-roads.cjs` serves the actual repository at a simulated published origin. Touch and the Android TV controller bridge pass in HD/base settings: readable emotional requests, explicit choices, real action repairs, walked crossings, actual save reboot, return, remembered revisit and physical exit. Original health/wards are kept; AI is stationary to isolate this integration contract. Final captures include the new speaker portraits. `node tools/review-game-title.cjs` checks complete title, cards and footer on portrait/landscape tablets in both settings.

The existing Ridge/Starfall regression also exposed an earlier unselected-echo handoff issue. The recommendation to visit Errata now precedes an unselected waiting form echo after Pending's return; deliberately followed echoes still keep their current-task priority. Guardian/gift/outing priorities and the Worldwake form queue remain intact.

Physical iPad/Android/TV performance and a continuous live-AI Worldwake session remain separate work. Cloudcap Conductor/Hearthdrake are subsequently complete. Next: measure Worldwake’s complete combat/travel rhythm, then strengthen the remaining eight earlier specialists.
