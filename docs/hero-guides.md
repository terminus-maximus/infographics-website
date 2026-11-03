# Hero Guides: sources, maintenance and launch checks

**Maintenance entry points:** [current scoring contract](../../HeroDatabase/CURRENT_CONTEXT.md), [score-update workflow](hero-score-update-workflow.md), and [Hero Score Refresh skill](/Users/danfoster01/.codex/skills/hero-score-refresh/SKILL.md). Follow the source registry rather than dated path examples.

## Applied Popularity fourth score — November 3, 2026

The active policy is **`overall-popularity-3.0`**: Raid, War, Horde and Popularity each carry 25%; qualifying required Campaign/Event Campaign heroes receive **+0.25 overall**, once, capped at 10. All four scores are required. Unrounded values determine averages, sorting and Top 10 selection. Popularity and Overall display two decimals; combat scores display one. The 118 measured Popularity heroes cover all 111 ranked heroes; eight overall scores remain Pending.

Use `sources.json.latest_popularity_export.cards` for the calculated Popularity export and `latest_overall_export.scores` for current overall. Current paths are `analysis/popularity/2026-11-03-approved-milestones-v1/website-cards.json` and `analysis/overall/2026-11-03-popularity-v3/scores.json`. The raw counts and `scripts/build_popularity_scores.py` own Popularity; the three combat assessments retain their authored source files. [Method and maintenance](../../HeroDatabase/research/popularity/2026-11-03-approved-milestones-v1/METHODOLOGY.md) · [Pre-change archive](../../HeroDatabase/history/2026-11-03-before-popularity-v1/README.md).

The directory and profile/Top 10 presentation order is **Overall, Raid, War, Horde, Popularity, Bonus**. Popularity reuses the blue Energy/Stamina beaker at `/images/ranks/energy.webp`; the profile asset builder retains that mapping. The November draft is refreshed locally. Its previous active snapshot and a pre-existing duplicate are preserved under `docs/hero-score-history/*before-popularity-v1.json`. No online deployment. This section supersedes historical revision statements below.

Implemented locally on November 2, 2026. No push or deployment is included.

For multi-hero score and justification QA, follow [Updating Hero scores and scoring justifications](hero-score-update-workflow.md). It covers authored inputs, versioned exports, import validation and the separate pre-publication Top 10 refresh.

The November 3 Horde review applies equal Survival/LRE/Onslaught weighting and exact half-point final ratings. All local Hero Guides, overall scores and the November Top 10 draft use that approved review. Prior scores and the November draft are preserved in the linked update workflow.

The later November 3 Raid refinement tightens first-choice coverage bands and refreshes the current overall ranking and November Top 10. Horde and War retain their approved values.

## Public routes and code

- `/heroes/`: static alphabetical roster table, enhanced numeric/text sorting, alias search and combined alliance/faction/trait/normal-attack damage/initial-rarity filters. Fragment state is shareable; filtered states have the clean canonical and are absent from the sitemap.
- `/heroes/[slug]/`: one statically rendered identity, assessment, reference-stat and related-guide page per canonical roster hero. Existing HeroDatabase folder slugs are retained.
- `/heroes/top-10/`: manually frozen monthly snapshot with full-precision ranking, shared competition ranks and accessible HTML. The November infographic uses `/images/web/top-10.webp` as its preview, linking to the full-resolution `/images/top-10.png`. The directory and homepage card use `/images/thumbnails/top-10-thumb.png`.

The shared template is `src/layouts/HeroLayout.astro`; components are in `src/components/heroes/`; styles are in `src/styles/heroes.css`. `src/lib/heroes.mjs` joins the independently sourced domains, and `hero-scoring.mjs` centralizes validation, formatting, ordering, cutoff selection and directory predicates. `hero-types.ts` documents the normalized public contract.

The header dropdown links to Hero Guides between Guild Wars and Incursion, with All Heroes, Monthly Top 10 and How Scoring Works nested beneath it. New Player also links to Hero Guides as its fourth option after Campaign Guides. There is no standalone Hero Guides header button or Hero Guides/Top 10 footer link. Campaign, Event Campaign, Incursion, Guild War, Boss Meta and four LRE guides include reusable backlinks. The existing layout still owns analytics. `/sitemap.xml` includes existing static pages, existing dynamic guides and all hero pages. `robots.txt` advertises it. No rating/review structured data is added; breadcrumbs and ordinary metadata are used.

## Authoritative local inputs

Research root: `/Users/danfoster01/Documents/Websites/HeroDatabase` (override with `--hero-database`). The importer reads `sources.json`, `SOURCE_CONTRACT.md`/`SCORING_METHODOLOGY.md` policy context and the selected exports. It never chooses by modification time.

The selected launch inputs are:

| Domain | Path relative to HeroDatabase |
| --- | --- |
| Stable IDs and slugs | `roster.json` |
| Raid | `analysis/guild-raid-community/2026-11-03-breadth-review-v2/website-cards.json` |
| War | `analysis/guild-war/2026-11-02-approved-rate-review-v1/website-cards.json` |
| Horde | `analysis/horde/2026-11-03-approved-equal-weight-v1/website-cards.json` |
| Popularity | `analysis/popularity/2026-11-03-approved-milestones-v1/website-cards.json` |
| Overall | `analysis/overall/2026-11-03-popularity-v3/scores.json` |
| Eligibility | Same overall directory, `guide-mentions.json` |
| Provenance | Same directory, `source-manifest.json` and `guide-source-snapshot.zip` |
| Policy | `config/overall-popularity-v3.json` |

Reference root: `/Users/danfoster01/Documents/Websites/LocalDatabase` (override with `--local-database`). Inputs are `data/processed/character-xref.json`, `catalog.json`, `image-assets.json`, `legacy-aliases.json`, `tacticus.sqlite`, the documented calculation helpers/rules, and original rectangle PNGs in `reports/assets/portraits/`. The snapshot is production build **1.43.130**. Import does not refresh or modify LocalDatabase.

The 119 new portraits use stable-ID paths such as `/images/heroes/ultraTigurius.webp`; existing short-name/round assets retain their paths. Conversion is lossless and retains source dimensions and transparency. No artwork is downloaded or generated.

The directory's faction, trait and damage filters use 84 lossless WebP icons under `/images/hero-filters/`, mapped by `src/data/heroes/filter-icons.json`. Trait and damage icons follow `image-assets.json`; faction icons come from the completed datamine manifest and staged PNGs. The importer checks that the faction manifest matches the reference catalog's game version and config hash, and verifies all source hashes and dimensions. The results table shows Hero, Overall, Raid, War, Horde, Popularity and Bonus; faction and alliance remain available as filters.

## Domains and ownership

- `src/data/heroes/reference.json`: normalized game identity, aliases, traits, weapons, progression contexts, stored stat rows, ability values for levels 1–60 and source hashes. Regenerated only from LocalDatabase.
- `src/data/heroes/research.json`: separate `identity`, `assessments`, `relationships` and current `release` objects. Authored mode text and exact numbers are copied from selected exports, never reauthored or recalibrated. Relative private research links become plain labels; local filesystem paths and the full research corpus never enter public HTML or browser payloads.
- `src/data/heroes/releases/YYYY-MM.json`: immutable published scoring/identity/assessment snapshot, including all original inputs, complete results, ranks, publication date, cutoff policy and graphic association.
- `src/data/heroes/publication.json`: explicit featured-month pointer. Imports never change this pointer or monthly files.
- `src/data/heroes/publishing-policy.json`: website cutoff setting copied into a new snapshot. Default: first ten eligible heroes plus everyone exactly tied with the tenth score. This is a website default, not a research-policy claim.

Required eligibility comes exclusively from approved required-role evidence, rederived with HeroDatabase's original extractor/combiner. Current site required lists are checked against the frozen evidence. Supporting/flex/core roles are taken from explicit structured guide fields; Boss Meta and Guild War links come from the teams currently displayed in those guides, with a separate linked line for each appearance. LRE links require membership in a High Points Combination shown by the planner, across any track. They do not imply a recommendation or general effectiveness. All relationships retain canonical IDs, categories, roles and supporting field paths.

## Commands

Run from the website checkout:

```sh
npm run import:heroes
npm run check:heroes
npm run check:heroes:sources
npm run build
node scripts/check-heroes.mjs --built
```

Individual source roots can be overridden:

```sh
python3 scripts/hero-reference.py --local-database ../LocalDatabase
python3 scripts/import-heroes.py --hero-database ../HeroDatabase
```

The reference and icon importers use LocalDatabase’s existing Python environment automatically when needed; profile atlas extraction also uses its UnityPy installation. No package installation is required in this checkout. Outputs are validated before promotion and written only if contents change. Invalid research imports do not replace the prior research catalog. Build-time validation also rejects mismatched identities, scores, rankings, stat contexts, assets and relationships.

To create the next monthly snapshot explicitly, after reviewing/importing approved research:

```sh
npm run publish:heroes -- --month 2026-12 --date 2026-12-01
```

Use the actual selected publication month and date. This is a local snapshot-writing command; it does not deploy. It refuses to overwrite an existing month. The launch snapshot was created with `--month 2026-11 --date 2026-11-02`.

When mode scores or required lists change, regenerate a **new** overall release in HeroDatabase using its existing `scripts/build_overall_rankings.py --output analysis/overall/<new-release>` workflow first. Import then follows `sources.json.latest_overall_export`. Never use an old mode exporter to overwrite approved manual revisions. Current hero pages may advance while a monthly snapshot stays frozen.

### Attaching a monthly infographic

The November 2026 graphic is attached and visually checked against the frozen ranking. Its shared `src/data/graphics.ts` entry makes Top 10 Heroes available in the homepage Hero Guides section and the More to Explore pool. The catalog derives the WebP recommendation image from the PNG path.

Prepare a local metadata JSON with these fields:

```json
{
  "src": "/images/web/top-10.webp",
  "fullSizeSrc": "/images/top-10.png",
  "thumbnailSrc": "/images/thumbnails/top-10-thumb.png",
  "width": 700,
  "height": 393,
  "alt": "November 2026 Tacticus Top 10 hero ranking",
  "month": "2026-11",
  "release_id": "2026-11-03-popularity-v3",
  "scores_sha256": "COPY FROM THE FROZEN NOVEMBER SNAPSHOT",
  "visual_checked_by": "REVIEWER NAME",
  "visual_checked_date": "YYYY-MM-DD"
}
```

Before recording that check, visually compare **names, order, two-decimal scores, shared ranks, month and all cutoff ties** against the frozen HTML snapshot. Metadata validation and image hashing do not inspect embedded image text.

After all three assets and completed metadata exist, use `npm run publish:heroes -- --month YYYY-MM --date YYYY-MM-DD --attach-graphic --graphic-metadata <metadata-file>`, retaining the snapshot's original publication date. This explicit one-time attachment fills an empty graphic association, hashes the WebP, full-resolution PNG and thumbnail, preserves every ranking/assessment field and leaves the featured-month pointer unchanged. For a new month, supply `--graphic-metadata` on initial publication instead. Existing attached graphics cannot be silently replaced. Missing/inconsistent graphic metadata causes the UI to omit the image and preserve valid HTML. Use edition-specific filenames for future editions to preserve attached historical assets, and update the shared card entry to the featured edition's paths.

## Precision, ranks and reference conditions

The import executes the original HeroDatabase `collect_mentions` and `combine` functions without invoking their writing entrypoint. It verifies frozen archive hashes, selected input hashes, original input values, exact results and original competition ranks. JavaScript's shared validator repeats the same binary64 operations in the same order; it never rounds inputs or uses epsilon ties. Overall display uses two decimals and Popularity uses two decimals and combat summaries use the approved one-decimal display value. Sorting always uses unrounded inputs/results.

Hero Stats defaults to Mythic, Mythic wings and Adamantine III for all 119 heroes. Icon pickers expose actual progression rows and valid ranks; switching rarity preserves stars when possible, otherwise selects the highest available stars, and clamps rank to the rarity cap. There is no interpolation or client-side stat arithmetic. Each active/passive ability has an independent level 1–60 slider defaulting to 60. Values for every level and unlocked rarity are calculated by LocalDatabase’s original helper at import time. The browser substitutes those stored values into the source template; it never recalculates scaling. Selections above a rarity’s ability cap or below a passive unlock display a short preview label. Mythic ability entries use a separate four-entry source domain and are not included in the regular level sliders.

Filter definitions use canonical local character fields and normal attack damage profiles. Exact in-game selection semantics are not supplied. Website behavior is explicitly OR within one filter category, AND across categories. Ability damage does not enter the normal-attack filter. The full roster, profile links, ratings and default reference state remain in initial HTML without JavaScript.

## Launch reconciliation and verification

| Measure | Result |
| --- | ---: |
| Heroes / rectangle WebPs / profile pages | 119 / 119 / 119 |
| Raid / War / Horde / Popularity rated | 115 / 112 / 119 / 118 |
| Overall rated / pending | 111 / 8 |
| Required-guide bonus / no bonus | 39 / 80 |
| Campaign / Event Campaign required heroes | 24 / 18, with 3 shared |
| Valid stored progression/rank stat rows | 25,467 |
| Structured relationship records (before display deduplication) | 635 |
| November featured heroes | 10; all have distinct unrounded scores |

Pending overall: Fabius Bile, Kîmm, Lhykhis, Lysander, Nubari, Ramus, Zapspitta and Ûthar. The selected release contains no capped overall ties; capped ties and near-equal displayed values are covered by fixtures.

Tests cover the supplied worked examples, full precision, non-stacking/role eligibility, missing and invalid scores, competition ties at the cap, cutoff ties, numerical sorting with pending last, combined aliases/filters, rejected corrupt releases, and frozen publication refusal/preservation. A repeated import changed no output bytes or mtimes, preserved November, and left 571 source documents/exports unchanged.

Browser QA covered alias search, combined alliance/trait filters, empty/reset states, keyboard disclosure access, numerical sorting, required-guide evidence, pending/preview states, valid rarity/star/rank selection, and desktop/mobile layouts. Mobile tables scroll inside their region without page overflow. Browser error logs were empty on the checked hero page. Built HTML checks cover every profile/link, internal related route, canonical, breadcrumbs, private-path exclusion and sitemap. Production build renders 180 pages.

The repository-wide `astro check` has 66 errors in existing unrelated code; no changed or new file reports an error. The thirteen Hero Guides tests, source reconciliation, built-page checks, production build, Campaign Event validator, all four LRE checks (384 filter states) and Guild Raid Next Season validator pass. `git diff --check` passes.

## Concrete outstanding inputs

- The November Top 10 infographic is now attached alongside the valid HTML ranking, with WebP preview, full-resolution PNG and thumbnail assets.
- Nineteen trait IDs have unresolved quantities in LocalDatabase. Tooltips use qualitative summaries of that source text, preserving known effects without inventing numbers; the raw reference still preserves the missing-value markers.
- General equipment is omitted from hero profile pages; available Relic abilities appear below Abilities.
- Adamantine stat calculations retain LocalDatabase's live-validation caveat. Exact in-game filter parity is unverified.
- No missing approved research export, manifest, canonical roster identity, portrait, rank-numbering rule or stat progression source blocks this local implementation.

## Hero profile presentation

### Relics — November 3, 2026

The 68 eligible heroes show a **Relics** section immediately below Abilities, using the same cards and slider styling. Each card displays the original item sprite, its localized ability name and description, and an independent **Relic rank 1–10** slider defaulting to **10**. The 51 heroes without a compatible Relic have no empty section. Rank 10 descriptions render without JavaScript; interactive controls appear when initialized.

`npm run import:hero-relics` regenerates `src/data/heroes/relics.json` and 35 lossless WebP item images. It also runs as part of `npm run import:heroes`. The read-only importer uses LocalDatabase's production **1.43.130** embedded GameConfig: `items[*].isRelic`, `allowedUnits`, `abilityId` and the ten item levels. Ability templates and values are checked against the same frozen catalog and balance snapshot as the hero reference. Relic rank maps directly to the corresponding ten-entry ability array; no character rarity multiplier or interpolation applies. This is separate from the four-entry Mythic ability domain discussed above. Relic effects do not change the base Hero Stats panel.

Sprites are resolved by exact item ID through the hash-verified 1.43.130 asset registry, extracted from its named local game bundles, and recorded with GUIDs and source/output SHA-256 hashes. Repeat imports retain the recorded bundle hashes and write only changed files. Source snapshot hashes, hero ownership, equipment-slot compatibility and all ten descriptions are validated before promotion. No LocalDatabase files are modified.

Validation: 21 hero tests pass, including shared-item ownership and independently pinned endpoint/intermediate Relic values; all 350 Relic descriptions and 35 image hashes pass validation. The production build and all 119 built hero pages pass. Browser checks cover keyboard slider endpoints, independence from hero rarity, loaded artwork, and narrow/desktop layouts without overflow or console errors. A repeat import changes no outputs. Repository-wide `astro check` still reports the same 66 pre-existing errors in unrelated files, with none in the changed Hero Guides files. Implemented locally; no push or deployment.

Profiles omit lore and section-jump buttons. Mode cards contain only score and short justification; a fifth Bonus Score card appears for qualifying heroes and links to their required Campaign/Event Campaign guides. The four-score calculation is described above.

`profile-icons.json` maps rarity, stars, ranks, eight stat/combat icons and all 238 active/passive abilities to WebP assets. `hero-profile-assets.py` reuses existing verified assets (including Replay Library rarity badges) and converts missing assets from the frozen 1.43 atlas. Star entries carry a repeat count; Mythic wings uses its own sprite. `guide-thumbnails.json` maps all 24 related-guide routes to their existing page artwork. Traits exclude Hero and appear as visible icon-and-description cards, without sliders or tooltips.

Profile verification: all 119 default contexts, all 238 abilities across every supported rarity and levels 1–60, all 24 guide thumbnails, and conditional Bonus panels are validated. Browser checks include independent slider endpoints, rarity scaling, rank caps, star/rank artwork, visible trait cards, and mobile overflow. The repository-wide type check still reports 66 errors in unrelated existing files; no Hero Guides file reports an error.

The Top 10 page uses the shared `ModeRatings.astro` cards and `RatingGauge.astro` scales from hero profiles: each mode shows its score, gauge and short justification, with a Bonus Score card only when earned and links from the frozen snapshot’s required-guide evidence. Each entry follows the profile identity layout with a larger rectangle portrait, rank badge, white hero heading, faction/alliance, gold title and a guide link. A full-width Overall Hero Rating summary precedes the mode cards. Identity labels come from the canonical reference; rankings, portraits, scores, assessment text and bonus links continue to use the frozen monthly snapshot. The page-specific layout lives in `hero-rankings.css`, while the shared portrait, identity, summary and rating-card styles remain in `heroes.css`.

The November 3 styling review preserved all ten ranked heroes and all 43 mode/bonus cards, including their score text, explanations and links. Desktop and mobile browser checks verify the larger identity headers, all 50 shared rating gauges, and no page overflow. The monthly date remains visible; confidence/status tags, zero-bonus labels, policy metadata and explanatory boilerplate are omitted. The future infographic renders only when a verified image is attached; no missing-image placeholder is shown.

Each Top 10 Overall Hero Rating panel also includes a short, enthusiastic summary of that hero's strengths. `src/data/heroes/top-10-summaries.json` keeps this editorial copy by publication month and canonical hero ID, separately from the detailed assessments. Summaries use at most 15 words and should remain understandable without game-mechanics jargon. When preparing a new monthly lineup, add or review its summaries; the page build requires a nonempty summary within the word limit for every featured hero, including cutoff ties.

### Overall summaries across all profiles — November 3, 2026

Every profile now has an individually authored, user-friendly summary of at most 15 words inside Overall Hero Rating, beneath the score and gauge. Profiles and Top 10 share the same typography and wrapping styles. `src/data/heroes/overall-summaries.json` owns the current profile copy by canonical ID, with the reviewed release and each summary's tone recorded. All 119 heroes are covered: 111 rated, eight Pending. The current ten featured summaries duplicate the approved monthly wording exactly.

Tone follows the **unrounded overall score out of 10**, not the ordinal roster rank: powerful at 8–10, optimistic at 6–under 8, measured at 5–under 6, cautious at 4–under 5, guarded at 3–under 4, pessimistic at 2–under 3, and more firmly negative below 2. Pending copy stays neutral and identifies the need for further evidence. Summaries draw on approved strengths and limitations; detailed mode assessments and all scores remain unchanged.

`src/lib/hero-summaries.mjs` validates word limits and requires editorial review when a hero crosses a tone boundary. After a score refresh, review affected wording and update its recorded tone; do not merely relabel stale copy. The catalog check requires exact roster coverage and matching Top 10/profile summaries when their overall scores match. Historical monthly copy can remain frozen after current scores change. Built-page checks confirm every summary is rendered.

## Profile names, rating gauges and related-guide roles

Profile headings/titles, portrait labels and directory results use the canonical short name, while full names remain searchable. Overall and three mode rating gauges use the original numeric score on a 1–10 gray-to-gold scale with a gold marker. Pending ratings have no gauge. The compact header score and directory table retain their numeric display.

Related-guide role labels use Proper Capitalization and the hero’s original circular portrait. `round-portraits.json` covers all 119 canonical IDs; `hero-round-portraits.py` reuses 99 verified WebPs and converts 20 source 1.43 round portraits. Directory/profile rectangle portraits remain unchanged.

The research importer calls `scripts/hero-lre-links.mjs`, which uses the exact shared `highPointsCombinations` planner function: at least two requirements, at least three eligible heroes, and only the displayed twelve highest combinations per track. Links retain track, requirement IDs and points as evidence. This removed 122 broad LRE links (867 total relationship records at that stage), with no change to required-guide bonuses, overall scores or monthly publications. Build validation recomputes the displayed combinations to reject stale relationships after an LRE data update.

## Specific Boss Meta and Guild War appearances

`scripts/hero-team-links.mjs` reads the same published team data as the guide pages. Boss Meta uses the five hero slots in each first META/ALTERNATE summary for a known boss, resolving approved identity aliases plus the explicit Replay Library tokens `Vit` and `Lhykis`. Each line says “Meta on [boss]” or “Alternate on [boss]” and links to that exact lineup.

Guild War attack links use the editorial cores and the displayed flex choices (share at least 3.8%, first five, preferring `flexAnalysis.flex`). Defense links use each editorial main lineup. Team names retain the guide’s capitalization; flex lines are labeled. Raw observed lineups, defense counter tables and Machines of War do not establish membership. All appearance lines use the existing circular WebP hero portrait.

The importer replaces the former assessment-only Raid/War references with 125 guide cards containing 249 specific appearances (120 Boss Meta, 79 attack, 50 defense). Heroes without a current named lineup do not receive a generic card. Total relationship records are now 635; ratings, required-guide bonuses and frozen monthly publications are unchanged. Validation recomputes memberships and checks every rendered appearance link and target anchor in the built site.

Related-guide cards display Guild Raid first, then Guild War (attack before defense), Horde when available, LRE, Campaign/Event Campaign, and Incursion. Boss Meta appearances put all Meta choices before Alternate choices, preserving the boss order within each group. This is presentation-only sorting; the source relationships and scores remain unchanged.

## Mode entry tokens

Guild Raid, Guild War and Horde labels use original game entry-token medallions, converted losslessly to transparent WebP under `public/images/hero-profile/modes/`. Horde uses the red Onslaught token (`ui_icon_resource_token_battle_waves`); Raid uses the purple guild-boss token; War uses the blue Guild War token, not the separate shop currency.

`hero-profile-assets.py` resolves exact sprite names/GUIDs through LocalDatabase’s hash-verified 1.43.130 asset registry. Raid and Horde come from its frozen main atlas. War’s separately bundled sprite is imported from the 1.43.157 local game cache, with the reviewed bundle SHA-256 pinned and its source version recorded explicitly in `profile-icons.json`. No LocalDatabase data is changed.

`ModeLabel.astro` and `ModeText.astro` apply the same assets to roster column labels, profile/Top 10 ratings and descriptions, related-guide titles, navigation links and scoring explanations. Labels remain readable text; decorative images have empty alt text. Icon size adapts to headings, table cells and inline prose.

## Approved Guild War refresh — November 2, 2026

All 119 War assessments now use the approved five-season BF-balanced Meds Up review, with +0.5 per Meta role and exact half-point scores. The prior scores and monthly draft were archived before replacement. The current overall formula and mode weights remain unchanged; a common numerator now prevents mathematically equal bonus-adjusted totals from splitting into different ranks. Khârn, Abraxas and Archimatos share third place. Current scores, all profiles and the local November Top 10 are refreshed together. No deployment occurred.
