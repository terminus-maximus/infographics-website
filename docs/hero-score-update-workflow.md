# Updating Hero scores and local Hero Guides

Current contract: **November 3, 2026**, `overall-popularity-3.0`. Start with [HeroDatabase current context](../../HeroDatabase/CURRENT_CONTEXT.md), [sources.json](../../HeroDatabase/sources.json) and [scoring methodology](../../HeroDatabase/SCORING_METHODOLOGY.md). This workflow applies approved changes locally; it does not deploy the website. The reusable [Hero Score Refresh skill](/Users/danfoster01/.codex/skills/hero-score-refresh/SKILL.md) follows this contract.

## 1. Authority and dependencies

```text
Authored Raid / War / Horde briefs → selected full-roster combat exports
Frozen Planner milestone counts → deterministic Popularity export
Four selected exports + explicit required-guide lists → Overall release
Overall release + selected assessments → website research.json
research.json → directory and individual profiles
research.json → separately created monthly snapshot → Hero Top 10
```

| Input | Authoritative source | Registry selector |
| --- | --- | --- |
| Raid | `heroes/<slug>/community-research/guild-raid.md`, approved breadth review | `latest_guild_raid_export.website_cards` |
| War | `heroes/<slug>/community-research/guild-war.md`, approved supported-role rate review | `latest_guild_war_export.website_cards` |
| Horde | `heroes/<slug>/community-research/horde.md`, approved equal-weight review | `latest_horde_export.cards` |
| Popularity | Frozen S1/G1/D1/D3/A2 counts and `scripts/build_popularity_scores.py` | `latest_popularity_export.cards`, `.data`, `.methodology` |
| Overall / bonus | Four exports, selected policy and required Campaign/Event Campaign lists | `latest_overall_export.scores`, `.configuration`, `.guide_mentions` |

Resolve actual brief paths from `roster.json`; join everything on canonical `unit_id`. Do not select exports by filename sorting. The old `latest_planner_popularity` points to an immutable context import, not the current calculated Popularity score. Public Insights ownership/average ranks do not replace milestone counts.

The November 3 selections are Raid `2026-11-03-breadth-review-v2`, War `2026-11-02-approved-rate-review-v1`, Horde `2026-11-03-approved-equal-weight-v1`, Popularity `2026-11-03-approved-milestones-v1` and Overall `2026-11-03-popularity-v3`. These are frozen outputs, not destinations for the next changed release.

## 2. Scores, precision and presentation

```text
Base = (Raid + War + Horde + Popularity) / 4
Bonus = 0.25 if required in at least one Campaign or Event Campaign guide; otherwise 0
Overall = min(10, Base + Bonus)
```

Require all four scores; missing values leave Overall null/Pending. The bonus does not stack. Incursion, supporting/flex roles and prose/replay mentions do not qualify. Required Campaign membership comes from `requiredHeroContent`; Event Campaign membership comes from `requiredHeroIds`, cross-checked with `requiredHeroes`. Do not count every investment-table row as required.

| Field | Contract |
| --- | --- |
| `recommended_score` | Full stored authoritative number, 1–10 or null; owns ranking/averaging |
| `display_score` | Combat: one decimal; Popularity: two. Presentation only |
| `score_bucket` | Distribution/grouping only; never a ranking input |
| Horde `score` | Compatibility alias; equals `recommended_score` |
| `short_justification` | Visible reviewed explanation, exported verbatim for combat |
| `score_rationale` | Longer reasoning; changing this alone does not change the visible card sentence |
| Confidence, evidence status, completed-research dates | Preserve unless the underlying evidence review changes them |

Combat final scores are exact half-points. Popularity is continuous: normalize each milestone to its column maximum, average five equal components, then linearly map minimum/mean/maximum index to 1/5/10. Store exact-fraction audit fields and full numeric values. Counts are inferred cumulative from the stated 11,000-player ceiling and monotonic rows; administrator query/date and cross-batch cohort alignment remain unconfirmed. Do not sum thresholds or manufacture missing counts.

Overall and Popularity display two decimals. Sort full values, use competition ranks, and include exact ties at the Top 10 cutoff. Never add jitter, rounded ties or an arbitrary epsilon. The campaign bonus is exactly 0.25, not 0.33 or a full point. Guild War's separate +0.5 Attack Meta and +0.5 Defense Meta bonuses are already inside its component score.

Site order is **Overall, Raid, War, Horde, Popularity, Bonus**. Popularity uses the existing Energy/stamina blue beaker `/images/ranks/energy.webp`, configured in `src/data/heroes/profile-icons.json`; `scripts/hero-profile-assets.py` preserves that mapping.

## 3. Archive and apply the approved batch

Record canonical ID, affected mode, prior full-precision value, new value, explanation review, reason, date and user authorization. Freeze the current registry, policy, selected exports, affected briefs, generated website research and intended monthly draft with SHA-256 hashes before changing them. Use a new dated run and export directory, preserving unrelated edits.

For combat changes, synchronize authored metadata, score heading, `## Short justification`, recommendation and assessment history. Score-only or copy-only work does not advance completed-research dates. If making a score Pending, clear raw/display fields and Horde's alias together. A status label alone cannot remove a number.

Generate complete roster exports for affected modes, preserving every untouched score and explanation. Keep registry export/review entries coherent. Historical scripts such as `apply_manual_review.py`, `revise_mechanical_raid.py`, `export_guild_war_calibration.py` and the dated Raid/War/Horde apply runners are pinned to their original inputs and revisions. Adapt a new batch runner; do not use them as generic refresh commands or remove their preservation guards.

For new accepted Popularity evidence, freeze the raw source and canonical count join in a new input directory; recalculate the full roster because normalization maxima and the mean can change. The following uses intentional placeholders, which must be replaced with unused paths:

```sh
python3 scripts/build_popularity_scores.py --input data/planner-popularity/NEW_REVISION/heroes.json --output analysis/popularity/NEW_REVISION --activate
```

Run from HeroDatabase. `--activate` selects the accepted export; omit it for a proposal. Retain all-null records as Pending, reject partial/malformed/duplicate records, and preserve measurement uncertainty. Do not overwrite the original 88-row handoff or use the pinned context importer as the fourth-score calculator.

## 4. Rebuild Overall and import the website

After selected mode exports are ready, run from HeroDatabase with a fresh output directory and the selected policy:

```sh
python3 scripts/build_overall_rankings.py --site-root ../terminusmaximus --policy config/overall-popularity-v3.json --output analysis/overall/NEW_REVISION
```

Always choose an explicit unused output for changed inputs. The builder writes scores, required-guide evidence, source manifest/archive, ranking and verification, and updates `latest_overall_export`. Run it even for copy-only changes: the selected card hash changed. Do not hand-edit totals or ranks. Review manifest dates and generated README prose for the actual release.

Then run from the website:

```sh
python3 scripts/import-heroes.py --hero-database ../HeroDatabase
npm run check:heroes:sources
npm run check:heroes
```

The minimal importer writes `src/data/heroes/research.json` after independently checking selected sources, Popularity calculations, Overall and required-guide eligibility. It also refreshes Supporting Evidence relationships. `npm run import:heroes` additionally rebuilds game reference data and assets; ordinary score/copy updates do not need that broader command.

Review the separate website editorial summaries in `src/data/heroes/overall-summaries.json` after score or assessment changes. Each profile's Overall Hero Rating sentence must stay within 15 words and match the tone of its unrounded overall score; the catalog check rejects tone-band crossings until the copy and recorded tone are reviewed. [Tone bands and ownership](hero-guides.md#overall-summaries-across-all-profiles--november-3-2026) are separate from the source-owned mode justifications. A change only to this website editorial copy does not alter selected card hashes and needs no upstream export, Overall rebuild or monthly scoring snapshot replacement.

## 5. Refresh the intended Hero Top 10 edition

Directory and profile pages read current `research.json`. `/heroes/top-10/` reads the month selected by `src/data/heroes/publication.json` from `src/data/heroes/releases/`. Its snapshot freezes the **whole roster**, scores, ranks, bonus, identities, portraits and assessment copy. Import/build alone do not refresh it.

Maintain the edition's short overall summaries in `src/data/heroes/top-10-summaries.json`, keyed by month and canonical ID. For a new or refreshed draft, duplicate the reviewed current profile summaries for every featured hero, including cutoff ties. The catalog check enforces exact wording while current and monthly overall scores match; an older edition can retain its historical copy after scores diverge.

For an authorized unpublished draft replacement, first validate the current import. Preserve the existing monthly file under a unique archive name **outside** the active releases directory, verify the copy hash, then remove only that active draft and recreate the same month with the actual chosen date. If creation fails, restore the original active file before continuing. Never retain duplicate backup JSONs in active releases: filenames there must match each snapshot's month.

```sh
npm run publish:heroes -- --month YYYY-MM --date YYYY-MM-DD
```

The placeholders must be the intended real edition/date. The writer deliberately refuses to overwrite an existing month. The November 2026 draft was already archived and recreated for the approved fourth-score application; do not repeat it for documentation maintenance. `publish:heroes` creates local data and the month pointer, not an online deployment.

Preserve an already published edition and create a legitimate new edition, or use an explicitly versioned correction workflow. Do not silently rewrite historical editions or choose a false month to bypass protection. A future infographic must bind to the final snapshot's month, release ID and score hash; no infographic currently exists.

## 6. Validate the complete result

After all requested data and draft changes, run from the website:

```sh
npm run check:heroes:sources
npm run check:heroes
npm run build
node scripts/check-heroes.mjs --built
git diff --check
```

Run relevant upstream checks for changed calculation/export code. Avoid repeatedly rebuilding unchanged outputs after checks pass. The build's prebuild catalog check does not replace explicit source reconciliation. Compare every affected score/explanation, untouched modes, canonical roster coverage, raw/display agreement, null behavior, bonus eligibility, full-precision rank order and monthly/current snapshot agreement. Inspect representative changed and Pending profiles, the directory and Top 10 cutoff.

The approved November 3 application passed 95 upstream Python tests, 19 website tests, source reconciliation and the 180-page build with all 119 profiles. These are historical results; report actual checks for each new run. The current dated coverage is 118 Popularity scores, 111 Overall ranks, eight Pending and 39 bonus-eligible heroes. Do not hardcode those totals as future invariants.

Historical one-time application verifiers preserve their original file boundaries. Later authorized context edits may legitimately fall outside those boundaries; use a separate change ledger instead of weakening old checks or resetting their baseline.

## 7. Dates, evidence and troubleshooting

`Score updated` on profiles and `Updated` on the directory use `research.release.date`, derived from the Overall source capture. A new Overall release can advance the displayed date for every hero. This is not a per-hero research date. Top 10 publication date comes from its separate snapshot argument. Keep source measurement, collection, research, score review and publication dates distinct.

Boss Meta, War teams, LRE combinations and other structured guide data own Supporting Evidence links. Membership updates do not automatically rescore combat modes. Required Campaign/Event Campaign membership can change the +0.25 bonus and requires a new Overall/import chain. For a non-bonus link-only change, reimport/rebuild without inventing new assessments. The War Attack/Defense team Top 10 guides use their own method and seasonal window; do not apply the overall hero formula to them.

| Symptom | Resolution |
| --- | --- |
| Brief edited but page unchanged | Export complete selected cards, rebuild Overall and import |
| Selected assessment differs from Overall input | Rebuild into a fresh Overall directory |
| Inputs changed / frozen output refusal | Use a new versioned directory; preserve the original |
| Required lists differ | Rebuild bonus evidence/Overall against this checkout |
| Mode number stale but gauge changed | Check `display_score` versus raw score |
| Visible sentence unchanged | Update/export `Short justification`, not just longer rationale |
| Top 10 stale or frozen publication refusal | Follow the separate draft/new-edition procedure |
| Local dev error after briefly moving a draft | Check the active file was restored/recreated; if the loader cached a missing snapshot, restart the dev server or invalidate its module cache without changing data |

Implementation references: [importer](../scripts/import-heroes.py), [overall builder](../../HeroDatabase/scripts/build_overall_rankings.py), [source contract](../../HeroDatabase/SOURCE_CONTRACT.md), [data loader](../src/lib/heroes.mjs), [snapshot writer](../scripts/publish-heroes.mjs), [maintenance overview](hero-guides.md).
