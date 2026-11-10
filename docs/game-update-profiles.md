# Game Version 1.44.120 profiles

Daras (`/heroes/daras/`) and Boudicari (`/incursion-mow/boudicari/`) use the
existing Hero Guide and Machine of War templates. Both are included in their
directories, faction/navigation links and sitemap. The Game Update 1.44 news
article links directly to them.

## Data and editorial ownership

`src/data/updates/1.44.120-reference.json` contains the two approved units from
the local 1.44.120 configuration and full English localization. The importer
verifies the version and source hashes, reuses LocalDatabase's existing
progression, stat and ability helpers, and exports lossless WebP artwork from
the Infographics folder. It checks decoded RGBA equality and records asset
hashes. Public labels read **Game Version 1.44.120**. Internal paths and source
labels are excluded from the generated payload.

`src/data/updates/1.44.120-profiles.json` owns Dan's November 9 instructions:
Daras has Pending overall, Guild Raid, Guild War, Horde and Popularity ratings,
with his full news-page assessment; Boudicari has two stars, the news-page
verdict, Chaos eligibility and Passive investment. The new hero's longer
approved summary is retained instead of shortening it to the usual 15 words.
Boudicari's rating date refers to this editorial review, not the older MoW
overview infographic.

The additions merge in `src/lib/game-update-profiles.mjs`. They leave the
119-hero base reference, existing assessments, ranking release and monthly
Top 10 intact. The live directory now contains 120 heroes (111 ranked and 9
Pending), and the MoW hub contains 12 profiles. Round portraits merge through
`src/lib/hero-round-portraits.mjs`; Daras's ability icons travel with his reference
record, so refreshing the base import cannot erase the addition's artwork map.

Daras retains the standard Mythic wings / Adamantine II default, legal stat
progressions, separate ability levels 1–60, physical melee and Bolter ranged
attacks, and Toxic ability effects. No Relic is assigned in this version.
Boudicari uses the existing Active/Passive/Mythic labels and promotion controls.
His four Mythic entries map to stars 11–14 without applying the regular ability
multiplier a second time. The importer resolves the shared poison hit count and
ability-damage explanation from the same version's full files.

## Refresh and verification

```sh
npm run import:update-144
npm run check:update-144
npm run check:heroes
npm run check:machines
npm run build
node scripts/check-heroes.mjs --built
node scripts/check-machines.mjs --built
```

The importer reads local sources without changing them. Repeating it is
idempotent. Tests cover the requested ratings, preservation of every existing
score, representative stat/ability values, Mythic promotion scaling and WebP
hashes. Existing validators cover all profiles, routes, assets and ability
curves. When a later base import includes these IDs, explicitly reconcile and
retire the corresponding additions; duplicate-ID checks prevent silent overlap.

The built-page validators also accept `TM_BUILD_DIR` for a build produced with
Astro's `--outDir` option. The completed 193-page build passed all profile,
news-link and public-copy checks; 35 focused tests passed. Browser checks
covered both guides at desktop and mobile widths, the controls, portraits and
Mythic lock/reset behavior. The subsequent November 9 typecheck cleanup resolved
all 66 existing errors and the follow-up cleanup resolved all 9 informational
hints. `npm run check` now reports 0 errors, 0 warnings and 0 hints. The
193-page production build, 38 unit tests, seasonal
checks and built Hero/MoW validators pass. Replay sorting and boss filtering
were also verified in the browser.
