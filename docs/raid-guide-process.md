# Guild Raid guide process — v2

**November 13 live-data refresh.** S114 is bound to production **1.44.88**, generation `08c5721cbf6ec4ed5e6a`, catalog SHA-256 `aefcf4e455062b2ffb1bf52884d81ac77174048302328a24bf1fdb577c6c8fe4`. All 25 normalized encounter/map fingerprints and the repeat loop match the previous binding. Team selections and damage averages are unchanged. [Audit and validation](game-data-1.44-live-audit.md). On November 14, the guide moved to its permanent route with editorial status `Ready`; this changed no replay evidence or season date.

The season page becomes the complete guide. One graphic summarizes the five loop bosses, displayed in descending order: M3, M2, M1, L5, L4. Both use the same season snapshot; no image is required to build or use the page.

This is the go-forward workflow from S114, implemented by the local `guild_raid_v2` skill at `/Users/danfoster01/.codex/skills/guild_raid_v2/SKILL.md`. S114 is the reference implementation at `/guild-raid/s114/`. The old S114 preview page is removed; Cloudflare redirects its old URL to the permanent guide. Creating a route locally does not publish it or switch the live season. The older `raid_guide_replays` skill remains available for explicitly requested legacy CSV work. V2 does not update the replay master or historical curated CSVs.

## The recurring work

1. **Bind the season to LocalDatabase.** Capture the selected game build with LocalDatabase's `scripts/guild_raids.py` (see below). Register the season and verified start date in `src/data/guild-raid/season-sources.json`, pinning its immutable generation, channel, catalog checksum and configuration fingerprint. Match the actual boss/map lineup; config numbers are local to a game build. There is no Google Sheet input or implicit next-season projection.
2. **Generate the guide snapshot.** Run `node scripts/build-raid-season.mjs --season 114`. This reads the pinned LocalDatabase catalog and reviewed Replay Library master, validates the mapping and assets, then writes the frozen source copy, all 25 lineup slots, guide JSON and compact graphic-summary JSON together. Use `--local-database /absolute/path/LocalDatabase` or `--master /absolute/path/replays_master.csv` when a source moves. The page consumes saved JSON; deploying it requires neither sibling project. `--frozen` explicitly rebuilds from the site's saved catalog; `--check` verifies generated outputs without writing them.
3. **Review exceptions, not every row.** Check the rejected-record list, sparse samples, wrong-map references and the final loop archetypes. Counts and gaps are recalculated on each refresh. Explicit map exceptions live in season-specific `sNNN-evidence-overrides.json` with rationale and approval provenance (see below). Do not hand-edit generated values.
4. **Prepare the one image from the export when artwork is in scope.** Each loop boss supplies its name, boss icon path, map image path, archetype icon path, average and sample size. Carry the source-tier label into a footnote/caption. Aim for two or three options; surface evidence shortages instead of filling them with unsupported teams. No full hero roster needs to be transcribed onto the graphic. Save the full-size artwork to `public/images/guild-raid-sNNN.png`, its web copy to `public/images/web/guild-raid-sNNN.webp`, and its thumbnail to `public/images/thumbnails/guild-raid-sNNN-thumb.png`. The next build replaces the placeholder automatically: WebP displays on the page, image and caption link to the original PNG with the standard analytics, and the thumbnail supplies social-sharing previews. The page reads intrinsic image dimensions to reserve layout space. Discovery/archive cards use the thumbnail when those routes are integrated.
5. **Validate the page and export together.** Run `npm run check:raid-season`, `npm run check`, and `npm run build`; preview mobile and desktop for new routes or UI changes. The normal build also checks frozen source/lineup/guide/graphic agreement without LocalDatabase or the replay master. A release uses the integration steps below and the repository's normal release workflow when publication is part of the request.

A later replay refresh is the same generation command plus an exception review. Do not quietly regenerate published historical averages: save a new dated snapshot and update both page and graphic together, or visibly date a later page refresh so it is clear why the image differs.

## Create a new season

Run site commands from `/Users/danfoster01/Documents/Websites/terminusmaximus`. The sibling projects are `../LocalDatabase` and `../ReplayLibrary`. Substitute relocated paths explicitly. Always supply `--season`; the current generator defaults to 114.

### 1. Choose and verify the game snapshot

Use an existing verified LocalDatabase generation if it contains the requested season. Otherwise capture the explicitly selected installed app using the commands in “LocalDatabase source contract.” Production is the normal baseline; an advance build uses the separate preview channel and is identified as such in provenance. Do not reuse a launcher cache path from an old manifest without checking that the app still exists and is the intended build.

Read `../LocalDatabase/data/processed/guild-raids/production.json` (or the explicitly selected preview index) to locate a candidate generation. Inspect its `catalog.json`: `source`, `rotation`, and each configuration's `slots` and `loop`. The index is a discovery aid for a **new** binding, not a moving dependency for a saved season.

Always check the site's `/news` section before asking for season/date confirmation. Read the relevant article source under `src/pages/news/`; the Guild Raid Rotation table in `game-update-1-44.astro`, for example, records S114–S116 dates and loop bosses. A matching published schedule can establish the season/date/loop association even when an older research artifact calls it projected. Record the article path and reviewed facts in the season evidence, and compare the loop with the LocalDatabase configuration. Ask only if the available evidence leaves a material gap or conflict.

Confirm which configuration actually belongs to the requested season from verified lineup/schedule evidence or the user's explicit supplied information. Config numbers and a 14-day calendar projection cannot establish this by themselves. The catalog is authoritative for bosses/maps but does not independently prove the live season/date association. If that association cannot be established, prepare the candidate comparison and ask for that specific missing fact; do not invent a binding.

Save the season/date evidence inside the repository, preferably under `docs/raid-seasons/sNNN/`, or reference existing published artwork when it already proves the association. A short evidence note should record what was verified, its source and observation date; include the reviewed config association. This is build input, not public page copy. Do not copy private Discord content/links or the full raw game configuration into public assets.

### 2. Prepare the binding and review all encounters

Use the following draft recipe; it writes only a temporary binding, leaving the repository unchanged. The values reproduce S114 as an example; replace **all season-specific values** for a new season. `GR_CATALOG` must point to the chosen immutable catalog, not a channel index. `GR_EVIDENCE` is relative to the site root.

```sh
GR_CATALOG='../LocalDatabase/data/processed/guild-raids/generations/08c5721cbf6ec4ed5e6a/catalog.json'
GR_CONFIG='guild_boss_season_config_5'
GR_SEASON='114'
GR_START='2026-11-18'
GR_EVIDENCE='public/images/guild-raid-s113-coming-soon.png'
GR_NOTE='Published S113 coming-soon artwork identifies Season 114 and November 18, 2026; the reviewed lineup matches Config 5.'

node --input-type=module - "$GR_CATALOG" "$GR_CONFIG" "$GR_SEASON" "$GR_START" "$GR_EVIDENCE" "$GR_NOTE" <<'NODE'
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { canonical, sha256, normalizeConfiguration, seasonFromCatalog } from './scripts/raid-season-source.mjs';

const [catalogPath, configId, season, startDate, evidence, note] = process.argv.slice(2);
const text = readFileSync(catalogPath, 'utf8');
const catalog = JSON.parse(text);
const matches = catalog.configurations.filter(c => c.configId === configId);
if (matches.length !== 1) throw new Error('Select exactly one reviewed configuration');
const config = matches[0];
const mappings = JSON.parse(readFileSync('src/data/guild-raid/replay-mappings.json', 'utf8'));
const content = normalizeConfiguration(config, mappings);
const evidencePath = resolve(evidence);
if (relative(process.cwd(), evidencePath).startsWith('..')) throw new Error('Evidence must be inside the site');
if (!note?.trim()) throw new Error('Record the verified season/date association');
const binding = {
  season: Number(season), startDate, status: 'Draft',
  channel: catalog.source.channel,
  generation: sha256(canonical(catalog)).slice(0, 20),
  catalogSha256: sha256(text), appVersion: catalog.source.appVersion,
  configFingerprint: config.fingerprint,
  expectedLineupSha256: sha256(canonical(content)),
  dateEvidence: { kind: 'verified-local-evidence', file: evidence,
    sha256: sha256(readFileSync(evidencePath)), note },
};
seasonFromCatalog(binding, text, mappings);
console.table(content.slots);
console.log('Repeat loop:', content.loop.join(' → '));
const draft = `/tmp/guild-raid-s${binding.season}-binding.json`;
writeFileSync(draft, JSON.stringify(binding, null, 2) + '\n');
console.log('Binding draft:', draft);
NODE
```

Review all normalized tier/boss/variant/map rows against the evidence, then append the draft object to `seasons` in `src/data/guild-raid/season-sources.json`. Preserve other entries and reject duplicate season numbers. An existing season refresh uses its current binding, not this recipe. The example's evidence kind/note may differ from S114's saved binding; do not replace the existing entry just to match the example.

If normalization reports an unknown boss or board, review the source pair and add its canonical Replay Library mapping to `replay-mappings.json`. Ensure the map exists in `src/data/replay-library/maps_directory.json` and its artwork is in `public/images/replay-library/maps/`; boss artwork belongs in `public/images/replay-library/bosses/`. Do not guess map suffixes, substitute a similar map or use a private image URL. New archetypes also need a valid icon in `team_archetype.json`. A changed tier count or repeat loop needs a deliberate template/parser update, not a bypass of the validation.

### 3. Generate data and create the route

```sh
node scripts/build-raid-season.mjs --season "$GR_SEASON"
node scripts/build-raid-season.mjs --season "$GR_SEASON" --check
```

The generator validates first and writes these together:

| Artifact | Purpose |
| --- | --- |
| `src/data/guild-raid/sources/<generation>.json` | Frozen normalized game catalog for portable builds |
| `src/data/guild-raid/sNNN-lineup.json` | Bound season/date and all normalized encounters |
| `src/data/guild-raid/sNNN-guide.json` | Teams, averages, replay examples, evidence IDs and provenance |
| `public/data/guild-raid/sNNN-graphic-summary.json` | Five loop bosses and eligible compact archetype summaries |

Add `src/pages/guild-raid/sNNN.astro`, using S114's thin wrapper and replacing its JSON import with the new season. The wrapper uses `../../components/guild-raid/SeasonGuide.astro`, `../../data/guild-raid/sNNN-guide.json`, and `<SeasonGuide guide={guide} />`. Review locally at the permanent path before release. There is no separate preview route or preview prop. The route enters the sitemap automatically. Do not copy all the component markup into each route. No image is needed; the placeholder is intentional until artwork is supplied.

When the user supplies a season promo, save its explicit code and ordered rewards in `src/data/guild-raid/sNNN-promo.json` and pass it as `promo` to `SeasonGuide`. S114 uses `TERMINUS114`, 25 Ramus shards (`/images/heroes/Ramus.webp`), then 25 energy (`/images/news/rewards/energy.webp`, sourced from the stamina resource icon). Each amount appears to the left of its icon. Keep the code and rewards season-specific; do not infer a future code or reward. The copy button confirms success only after the clipboard write succeeds.

## Refresh an existing season

1. Read the existing source binding and saved guide's provenance. Preserve the prior generated files in a dated local archive or an identifiable repository revision before replacing published data. Capture the before/after comparison from these snapshots; do not depend on shell scrollback.
2. Use the latest **reviewed master** at `../ReplayLibrary/data/replays_master.csv`, or the user's explicit replacement. The website's curated CSV/JSON exports are not the master. A refresh reads it; it does not discover, re-review, repair or overwrite source records.
3. Run the generator for only the requested season. It recalculates archetype pools, averages, demonstrated teams, replay examples, and graphic-summary data together. Leave the game binding unchanged unless a separate lineup correction was requested.

```sh
# Site root; example for S114.
node scripts/build-raid-season.mjs --season 114
node scripts/build-raid-season.mjs --season 114 --check

# Explicit alternative when LocalDatabase is unavailable but its pinned catalog is saved:
node scripts/build-raid-season.mjs --season 114 --frozen --master '../ReplayLibrary/data/replays_master.csv'
node scripts/build-raid-season.mjs --season 114 --frozen --master '../ReplayLibrary/data/replays_master.csv' --check
```

`--frozen` freezes only the **game catalog source**. It still reads the specified replay master. Never substitute a newer current-index generation when the pinned snapshot is missing. `--check` is read-only and fails on missing or stale outputs; it does not refresh anything. With identical inputs and outputs, the generator preserves `generatedAt` and avoids rewriting the files.

4. Compare before/after hashes and counts, added/removed archetypes, selected hero teams/MoW, averages, sample sizes, source-tier mixes, fallback kinds and replay IDs. Unchanged boss/map data should remain unchanged. Investigate unexpectedly missing recommendations or large shifts using the evidence IDs and reviewed master; do not silently alter policy to restore an old result. Report rejected `VALID_REPLAY` rows separately from ordinary unreviewed rows, which are simply outside the eligible pool.
5. Validate using the commands below. Keep the image consistent with its data: regenerate artwork when that work is requested, or visibly date a later page refresh if its averages differ from an existing published image. The generator refreshes the graphic **JSON**, not the image, and currently does not add a public refresh-date label automatically. Do not claim the artwork was refreshed by a data run alone.

## Validation and release integration

For generated data and routes:

```sh
npm run check:raid-season
npm run check
npm run build
```

`check:raid-season` covers selection/source regressions and validates every registered season's frozen source, lineup, guide and graphic linkage. The ordinary build runs the portable source check as well. For changed extraction logic, also run LocalDatabase's exporter tests and verify the relevant frozen generation. A successful build does not prove that the correct season/date association was chosen; that evidence review happens before registration.

For new routes or UI changes, inspect desktop and mobile: all 25 boss maps/tiers, M3-first loop, Epic averages with actual source tiers, inline maps, hero and abbreviated MoW links, sortable replay tables, filters and hash links, one open boss at a time, and the ending Damage data → Related Guides → More to Explore. Confirm missing exact evidence is not presented as newly collected source-tier footage. The page contract below is the visual baseline.

When the request includes the public route or release:

- Use the permanent `src/pages/guild-raid/sNNN.astro` route. Mark its registry status `Ready` when approved for the site tree, and keep generated source metadata in sync. A route/status promotion must preserve the selected replay snapshot; do not refresh the master or alter averages unless requested separately.
- Supply the one-image assets if ready. Full-size PNG is required for the standard full-size link; WebP is optional for the page. Set discovery/archive thumbnail references to assets that actually exist.
- Switch `src/data/guildRaid.ts` only when the requested season should become current. Its artwork paths and the next-season hub card recognize v2 seasons through the source registry and use the single-image assets. `src/data/graphics.ts`, the header and recommendations consume this current-season data. Publishing a forthcoming guide does not make it the active season early.
- Homepage and Guild Raid hub season cards must remain **Current Season** and **Next Season**, using the existing current-season pointer and exact-next-season resolver. Do not add individual S114/S115/S116-style cards or expand all Ready seasons into discovery or More to Explore. The Archive is the complete numbered list, newest first. Ready v2 registry entries feed `readyGuildRaidSeasons` in `src/data/guildRaid.ts` for that archive and contextual Game Update 1.44 rotation links; historical pre-v2 archive entries remain in `src/pages/guild-raid/archive.astro`. Verify the artwork, archive, adjacent-season navigation and contextual links when promoting a season. The route's Related Guides are provided automatically by the seasonal rule in `src/data/recommendations.ts`; do not hardcode another card list into the page.
- The v2 template has no Next Season section. Older pages and the legacy hub/standalone next-season routing are separate existing features; do not copy them into new guides or fabricate coming-soon images to satisfy legacy paths. Reconcile those entry points deliberately when migrating the public hub.
- Follow the repository's release instructions and existing authorization. Validate the final public route and images after release. Preserve historical guides unless migration of those seasons was requested.

## LocalDatabase source contract

From the LocalDatabase checkout, capture an explicit installed production app:

```sh
.venv/bin/python scripts/guild_raids.py --app '/path/to/Tacticus.app' --channel production
.venv/bin/python scripts/guild_raids.py --verify --channel production
.venv/bin/python -m unittest discover -s tests -p test_guild_raids.py -v
```

The exporter reads the `GlobalGameConfig` and `GameConfig` TextAssets and application metadata. It writes `data/processed/guild-raids/generations/<generation>/` with a normalized main-boss catalog, frozen original global config and checksummed manifest. `production.json` points to the current production capture; an explicit `--channel preview` writes a separate `preview.json` and rejects a production bundle. Neither changes the character/LRE database. A successful capture switches only its channel index, after validation; old generations stay available even when the launcher removes an old installed app.

The website pins a generation instead of following either current index. It matches a unique content fingerprint over tier/set positions, native boss variants, board IDs, unit IDs and loop positions. The config number is retained as provenance, not used as the identity. `replay-mappings.json` explicitly maps native boss/board pairs to canonical Replay Library names. Unknown maps, missing artwork, duplicate matches, corrupt checksums, channel/build mismatches or changed tier/loop shapes stop generation before outputs are replaced. A reviewed new build can be selected by updating the season binding; it never changes an existing season automatically.

For a new season, inspect its selected catalog configuration, verify the season number and date independently, then add a registry entry using that catalog's `source.appVersion`, channel, generation, file checksum and configuration fingerprint. Save date evidence inside the site and record its checksum. The expected lineup checksum is the SHA-256 of canonical JSON `{loop, slots}` returned by `normalizeConfiguration` in `scripts/raid-season-source.mjs`; review those normalized rows before registering it. The game's old `firstSeasonStart` value is not a reliable live season-number anchor. No future season is inferred by advancing a config index or date.

**S114 migration:** all 25 boss variants/maps and the five loop positions match production **1.43.157, Config 5**. The site's former input was Config Joiner from advance 1.44 data. Its lineup is identical; the replay selections and averages were verified unchanged. November 18 remains anchored to the published S113 coming-soon artwork, whose hash is in the season registry. The legacy LocalDatabase character snapshot remains 1.43.130; the independent raid export identifies its own 1.43.157 source explicitly. Migration hashes are recorded in `docs/raid-source-migration.json`.

Config 1 differs between production 1.43.157 and preview 1.44.120, demonstrating why a config number alone is insufficient. The new guide template has no Next Season section, data input or automatic future rotation.

## Damage and team-selection policy

- Require `VALID_REPLAY`, positive reviewed `damage_final`, known boss/tier/map/archetype/creator, five distinct consistent heroes, and a consistent recorded MoW. Never substitute guessed damage. Deduplicate by video ID. Compare unordered membership across `hero_1`–`hero_5`, `team_key`, `Team (no MoW)` and `Team`; retain source display order.
- Calculate an ordinary arithmetic mean across every eligible replay in the selected archetype pool, including different five-hero compositions and MoW. It is an observed library average, not expected player damage or a benchmark controlling for rank, equipment, encounter conditions, patch or creator.
- Start with exact boss + map + tier. If an archetype has fewer than five replays, expand symmetrically one tier step, then two, stopping once five are available. Include all rows from each admitted tier; do not take only the top five. L5 and M1 are adjacent. Legendary/Mythic may cross their boundary; Epic and lower restrict this nearby search to their own rarity. Higher-tier fallbacks retain their actual source labels.
- With no usable nearby evidence, show the nearest same-map source tier (higher on a tie). When the map has no evidence, use the same boss on another map. These distant-tier and other-map examples are references and do not enter the graphic export.
- Epic summaries display the selected sample's average damage even when it comes from a higher tier, with source tiers and sample sizes retained. Omit the “Reference” label in Epic summaries and team headers; do not recalculate or relabel the source records as Epic.
- Display source tiers, replay counts and damage summaries. Keep samples below five visibly marked. The graphic requires at least three replays per archetype and an exact or nearby pool. Thresholds of five and three are editorial defaults, not statistical confidence measures.
- Prioritize exact evidence, then nearby evidence, then distant-tier references, then other-map references; within each group prefer samples of at least three and then average damage. Show up to three archetypes. Different archetypes can draw on different source-tier mixes: this ranking is a useful browse order, not proof of superiority.
- The demonstrated five-hero lineup comes from the highest-damage replay in the selected pool. An optional second video uses exactly those five heroes. Prefer a different creator only within competition ranks 1–3 and at least 85% of the true highest damage for that composition; otherwise retain the natural runner-up. Every example displays its actual source tier, map and MoW.

The old skill's stronger-team exception, fixed Mythic pairs and season-wide creator optimization do not apply to v2. Fixed row counts are replaced by up to three browseable archetypes and one or two examples each. If a separate editorial override for an emerging composition is requested later, it should affect the demonstrated team without silently altering the average's evidence pool. Selection policy changes require updating the implementation, tests, documentation and provenance policy version together.

### Explicit season map exceptions

Before reporting a loop boss as reference-only or leaving its infographic options empty, inspect eligible exact-tier evidence across maps. Report candidate archetypes, sample counts and source maps so a scheduled-map gap is not mistaken for an absence of usable boss/tier records. Check existing overrides and conversation authorization first. Reuse an authorized exception without redundant confirmation; for a new unapproved encounter, present the concrete cross-map option with the coverage review. Previous encounter-specific exceptions do not automatically apply to other bosses or seasons, and collecting new footage is not the only remedy.

When the user requests ignoring a map restriction, `src/data/guild-raid/sNNN-evidence-overrides.json` can authorize an `all-maps-exact-tier` pool for an exact season/tier/boss/scheduled-map tuple. The input uses schema version 1 and records `reason`, `approvedBy`, `approvedOn` and the user’s `instruction`. The generator validates that tuple against the pinned lineup and hashes the file into both guide and graphic provenance. Removing, changing or misapplying an override fails portable checks until the requested season is regenerated.

This exception uses **every eligible replay at the exact target tier across all maps**, including hero/MoW variants. It does not widen tiers or change the scheduled map. The demonstrated team and replay examples still follow the normal highest-damage/composition/creator rules; they do not define the arithmetic-mean pool. The evidence IDs, source tiers and source maps remain recorded. These entries have kind `cross-map`, show numeric averages with an **Other maps** label on the page, and carry `sourceMaps` and `sourceLabel` in the graphic export. The minimum of three records for a graphic option remains unchanged. Ordinary unapproved other-map/distant-tier fallbacks remain excluded.

On November 14, 2026, Dan requested this exception for **S115 M2 Ghaz / Ghaz_01**. Its exact-M2 evidence includes other maps; the page and export must not present those averages as Ghaz_01-specific damage. On November 15, Dan requested the same treatment for **S116 M3 Magnus / Magnus_04**. All 23 eligible M3 records were considered, and Custodes, Battlesuits and AdMech each met the graphic threshold. In this case the previous other-map references already used the same exact-M3 pools: the exception changed their labels and graphic eligibility, while their means, demonstrated teams and replay examples remained unchanged. [S116 before/after audit](raid-seasons/s116/m3-all-maps-review.json).

For each exception, archive the prior snapshot and regenerate the requested season's guide and graphic export together. Validate complete exact-tier pools, arithmetic means, source maps/tiers and page/export labels; compare unaffected encounters and preserve the source binding, scheduled lineup and replay master. Preserve authorized overrides during later refreshes. Seasons with exceptions use selection policy version **2**; seasons without them retain version **1** and their existing snapshots. No demonstrated-team override is implemented.

## Page experience

- Season headers use a small gray start date, with white `S115 starts Dec 2, 2026` captions on archive cards. Both use `src/lib/guildRaidDates.ts` for formatting; registered seasons keep their verified dates. On November 15, 2026, Dan confirmed the exact 14-day cadence for historical display dates, anchored to S114 on November 18, 2026 (S113: November 4; S97: March 25). This display calculation does not establish lineup/configuration bindings.
- `SeasonGuide.astro` supplies the reusable page; a season route passes only its saved guide. The page follows the existing Guild Raid title, typography, gold accent, gray panels and spacing.
- All 25 encounters remain available. Display the loop M3, M2, M1, L5, L4, then earlier Legendary, Epic and early tiers in descending order. Search and filters narrow the list.
- Collapsed rows contain boss icon/name, season tier, the canonical map name and thumbnail, and archetype averages with source tiers and sample sizes. Early tiers use lighter rows.
- Keep the clean collapsed summaries: no extra “Avg” label and no extra “1 replay” badge for Cawl. Existing sample counts and expanded source labels remain available.
- Expanded bosses show an inline map, then the shared `BossMetaTeamSummary.astro` header, full five-hero lineup and MoW, damage statistics, and existing sortable `CuratedReplayTable.astro`. Gold titles include “vs” and the short boss name. Hero labels use the campaign character catalog's `shortName` (from `Terminus_name`) and link to Hero Guides; abbreviated MoW labels link to their Incursion guides. Each table row retains its actual tier, map and MoW.
- Maps use local Replay Library artwork directly in expanded encounters, without source-image links. Keep private Discord/source-server links and Prime/support maps out of both the display and generated guide data.
- Use brief source-tier and small-sample labels; keep calculation detail in the single collapsed Damage data note. Do not add instructional prose, “Example” headings, lineup-selection explanations or authoring JSON to the public page.
- The graphic summary remains a separate generated file for production work. Boss disclosures share the native `details` name `season-boss`: opening a boss closes the previous boss, across all tier sections. The active boss can also be closed, leaving none open. If collapsing a preceding boss moves the new heading off-screen, bring it back into view without animation. Damage data remains independent. Native disclosures work without JavaScript; filters appear only when initialized. Boss anchors open the right encounter even when filters were active.
- The standard Related Guides and More to Explore sections follow Damage data. Each seasonal route receives the Boss Meta Guide, Replay Library and Guild Raid archive as its related guides. Replay metadata is sourced from the library; the build does not claim fresh video playback verification.

## What replaces the four images

| Retired image content | Replacement |
| --- | --- |
| Mythic and Legendary full teams | Expandable boss rows with five heroes, MoW and live links |
| Epic guidance | Epic rows with all maps, average damage and source-tier labels, including clearly identified fallback tiers when needed |
| Coming-soon graphic | Retired; each guide covers its selected season only |
| Repeated team/replay transcription | One generated snapshot used by both site and compact graphic |

Guide creation and refresh do not imply artwork creation, replay discovery, schedules, source-master edits, a live-season switch or publication. Carry out those actions when included in the user's request and covered by existing authorization.
