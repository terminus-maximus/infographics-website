# Shared LRE guides

Farsight, Uthar, Lysander and Fabius Bile use `src/components/LreGuidePage.astro` and the same `LrePlanner.astro`. The page order is infographic, event overview with collapsed More Event Details, High Points Combinations, Tracks & Filters, then any existing resource links and recommendations. Lucius remains the legacy guide; the supplied backend covers only the four events above.

Both track selectors stay synchronized. Each track retains its own AND filters; Clear only resets the active track. Combinations use at least two requirements and three eligible characters, sort by bonus points then pool size, and show at most 12 results. Applying a combination selects its filters and moves focus to its track. Requirements sort by descending points. Pools show portraits in a two-row scrolling area; combinations with at most ten characters show portraits too. The initial HTML includes Alpha combinations and all track rosters, with unavailable controls hidden or disabled until JavaScript loads.

## Backend import

Run from the site repository:

```sh
npm run import:lre -- /path/to/LocalDatabase/data/processed/lre/index.json
npm run build
npm run check:lre -- /path/to/LocalDatabase/data/processed/lre/index.json
node scripts/check-fabius-lre.mjs
```

The importer reads the schema-version-2 index once, resolves paths relative to it, and verifies each event JSON against both the index and its generation manifest. It validates all four events before writing. The resulting compact files in `src/data/lre/` contain only the local production roster's regular eligibility, requirement scores, enemy labels and restriction summaries. Builds and browsers use these committed files and need no LocalDatabase checkout or runtime fetch.

This is a build-time adapter to Fabius's existing compact planner contract, rather than a public mirror of the full export. The SQLite database, raw evidence, absolute source paths, alternate ability modes, Marketing roster, battle tables and coverage rankings are not copied to the website. Existing hero portraits are reused by game unit ID; new portraits resolve against the index's `asset_base` and are checked against the generation manifest before copying. `src/data/lre/sources.json` records generation, event and character builds, source status and checksums for maintenance; it is not loaded into the planner.

The October 7, 2026 import uses generation `3f34a218c37c08ed2202`:

| Guide | Event configuration | Character roster |
| --- | --- | --- |
| Farsight | Production 1.42.166 | Production 1.42.166, 117 characters |
| Uthar | Production 1.42.166 | Production 1.42.166, 117 characters |
| Lysander | Production 1.42.166 | Production 1.42.166, 117 characters |
| Fabius Bile | Marketing preview 1.43.94 | Production 1.42.166, 117 characters |

Fabius's requirements, scores and character eligibility are unchanged from the previously approved report. Regular eligibility includes unlocked active/passive abilities and excludes relic effects. Event dates are not imported or inferred from this snapshot.

Faction bans come from `banned_faction_ids` and are checked against each character's precomputed `allowed` flag. Restriction text combines `excluded_alliances` with the localized names of `additional_banned_faction_ids`. Farsight Gamma therefore says “No Chaos or Orks characters,” and excludes both groups even when no filters are checked. Do not use the nullable legacy `excluded_alliance` field or infer bans from lane order.

The current interface shows requirement bonuses per battle, excluding kill/clear bonuses. Import validates `scores_by_battle` against each stage's actual `requirement_points`, without assuming a battle count, objective count or total score. If a future export varies a requirement's score by battle, import stops with a request to update the UI; it must not silently show the first score as universal. Full-event rankings are outside this interface and would need `event_coverage_points` if added later.

## Verification

`check:lre` checks all four built layouts, collapsed details, descending requirement order, portraits, restriction text, scores and combination ordering. With the index argument it also compares all 384 current filter states and every qualifying intersection against the backend, including Farsight's additional Ork ban. It checks that a variable score schedule cannot silently import. The independent Fabius check retains its known pool counts and public navigation/discovery assertions. Its optional frozen HTML-report argument still supports historical reconciliation; use `import:lre` for current imports.

The October 7 production build generates 49 pages. Repository-wide `astro check` still reports 61 existing errors in other/shared site code; the LRE routes, shared guide, planner and planner types have no diagnostics.

Browser checks passed for all four guides: collapsed details, combination application and heading focus, synchronized track selectors, retained per-track selections, and Clear. Farsight additionally verifies keyboard checkbox activation, an empty result, and the combined Chaos/Orks restriction. All three updated guides were checked at 390px width with a single column of combinations and no horizontal overflow. Selected portraits load and no browser console errors were observed.
