# Patchling and the Waking Roads

October 7, 2026. This is the public title of the 2D game, previously called Nobody's Quest. Keep the repository, published URL, save keys, Android package and controller bridge identifiers stable.

**Patchling and the Waking Roads** ties the name to both halves of the adventure. Patchling is a small walking coat stitched from an old road map. Taking on the roadkeepers' shapes helps neighbours repair crossings and eventually wake the Worldbearers. Meridian's insistence on one perfect map gives the ending its contrast: the roads can grow because different shapes and different people have something useful to contribute.

The name has a friendly storybook rhythm, an identifiable protagonist and a concrete place to imagine exploring. “A little coat. A world to mend.” is the title-screen line. Use the full name on public listings; **Patchling** is the compact installed-app label. An itch.io name search also surfaced an unrelated puzzle called **Patchlings**, so the full title matters. General web search did not provide reliable results in this environment; this pass does not establish publication clearance. Retain the existing originality/provenance review before a commercial release.

## Shipped identity

- Browser title, accessible title-screen name, app manifest and Apple home-screen label.
- A readable Nunito title lockup. Short landscape composition now keeps the complete title above the adventure cards after controller focus; portrait and landscape tablet layouts retain their storybook composition.
- Home-screen icons, Android launcher icon and TV banner composed from Patchling's actual authored game sprite, stitched canvas and a winding road. Regenerate them with `node tools/render-app-icons.cjs`.
- Android wrapper display/loading strings and the optional PC launcher window lookup. The latter recognizes either public title while cached older installations update.
- README and Ben's builder-guide heading. Historical documents and internal `nobody`/`god` IDs remain useful compatibility records.

The Android resources are source changes; this batch does not publish a rebuilt APK. The web adventure continues using its existing delivery address and saves.

## Design use

Prefer adventures where a shape helps a person and visibly changes the route. A bridge, ferry or lamp should look different after the action, remain useful on a return visit, and give its neighbour something specific to celebrate. The new Bramblebank, Reedbed Ferry and Copperwick Lampyard adventures apply this direction. See [EARLY-FORM-ROADS.md](EARLY-FORM-ROADS.md).
