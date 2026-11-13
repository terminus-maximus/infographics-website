# Production 1.44 game-data audit — November 13, 2026

All active game-data imports now target the installed **production 1.44.88** app. The previous 1.43 base and 1.44.120 preview overlay are retired from the active website pipeline. The site has **120 hero profiles and 12 Machine of War profiles** from one canonical generation.

This report records the source and build audit prepared for the November 13 release. Online deployment is verified separately against the release commit. Original infographic artwork is retained with its real revision dates; the Incursion pages explicitly direct readers to the corrected live reward tables.

## Authoritative source and recovery

- Production bundle: `com.snowprintstudios.tacticus`, app build `1.44.88`, Unity `6000.3.13f1`.
- Embedded configuration full hash: `9bdc534d9850e21cd133d4951d9e46b6`.
- Embedded JSON SHA-256: `64367f2feeafea9c610cad71d2ccc3d9c34e9d0aafa4cc00e3b1efcd76678400`.
- Site comparison baseline: `2a7b0f1` (the pre-refresh checkout).
- [Reproducible machine-readable audit](../../LocalDatabase/research/live-1.44.88/audit.json), [audit program](../../LocalDatabase/research/live-1.44.88/audit.py), and [preview-to-live field diff](../../LocalDatabase/research/live-1.44.88/preview-to-live-diff.json).
- Prior LocalDatabase data, reports and current research packages are preserved under `LocalDatabase/research/live-1.44.88/before/`. Prior immutable LRE/raid generations remain available. Hero score inputs and the published monthly snapshot were archived in `HeroDatabase/history/2026-11-13-before-live-144/` before the refresh.

The production build number is lower than the QA build number. Bundle identity and the installed production files determine the source; numeric version ordering is not used to choose between QA and production.

## Dependency inventory

| Site domain | Audited live coverage | Result |
| --- | --- | --- |
| Hero identity, traits, stats and abilities | 120 heroes; 240 regular abilities; levels 1–60; 25,233 public rank-stat rows | Rebuilt from live catalog; shared poison constants resolved from the same configuration |
| Relics and equipment compatibility | 35 relics, 68 compatible hero owners | Rebuilt from live item definitions, localization and art |
| Machines of War | 12 profiles, 36 abilities, promotion-dependent curves | Boudicari joined the canonical import; editorial rating remains two stars |
| Native profile and shared artwork | 611 validated catalog PNGs; 23 faction badges; 116 legacy hero URLs; 51 Replay Library portraits | Live native sources, hashes and lossless RGBA checks; current HRE/news portraits use canonical records |
| LRE planners | Farsight, Uthar, Lysander, Fabius; 120 heroes each | Live generation `0b8762223d00ef057331`; all 384 filter states reconciled |
| Campaign Events | 7 events; 462 backend battle records; 231 site Extremis rules; 105 backend shard-farm records; 11 relic rewards | Rebuilt rules, eligibility, timers, boards, chest tracks and equipment rewards; every guide exposes its live rule table |
| Incursion | 12 machines × 14 tiers; all configured enhancements | Machine-specific route reward calculations replace the shared static reward array |
| S114 Guild Raid | 25 encounters/maps and the repeat loop | Production generation `08c5721cbf6ec4ed5e6a`; encounter fingerprints, selected teams and damage averages unchanged |
| Game Update 1.44 news | Announced battle pass, event rewards, Survival, quests, requisition rosters and raid projections | Revalidated against live config/localization/GlobalGameConfig; published gameplay values agree |
| Current hero ranking | Existing Raid/War/Horde/Popularity assessments plus required-hero bonus dependency | New `2026-11-13-live-144` Overall release; three newly eligible bonuses; published November edition preserved |
| Ordinary campaign guides | 8 guide datasets, investment/energy inputs, equipment recommendations and replay evidence | Live progression and upgrade definitions compared; historical evidence retained; native portraits refreshed |
| Guild War / Boss Meta / Replay Library observations | Seasonal results, team evidence, video links, old damage results and map captures | Historical evidence retained; no source relabelling or invented current results |

The ordinary campaign changes in the production config are Octarius Mirror battle 75 (power 19,146 → 18,316; XP 139 → 136) and its Elite battle 40 (252,055 → 248,020; XP 503 → 499). Those enemy power/XP fields are not displayed in the site's replay datasets. Upgrade definitions and hero progression tables are unchanged from the prior production source. Planner-derived energy estimates retain their actual Planner commit and calculation assumptions.

## Corrections visible on the site

### Campaign Event deployment limits

The audit replaces 15 incorrect stored limits. These are corrections against the live config, not a claim that all 15 changed in this patch.

| Event | Extremis stage | Previous → live hero limit |
| --- | --- | --- |
| Dark Angels | 3B | 4 → 5 |
| AdMech | 18 | 5 → 4 |
| Tyranids | 1, 2, 3, 21 | 5 → 3 |
| Tyranids | 4, 5, 7, 8, 9, 10, 26, 27 | 5 → 4 |
| Tau | 20 | 3 → 5 |

The older six guides also gain their previously missing native board IDs and lightning timers. Their shard/chest/equipment reward values agree with the live build. Blood Angels' existing gameplay values match live, so its preview warnings are removed while its provisional team targets and missing-clear evidence remain explicit. Historical wiki/replay references are preserved as evidence; live stage configuration is attributed to the recorded production version/hash.

### Incursion rewards

Initial-clear values now represent the maximum shards from **one legal route**, including all star rewards and route chests. Mutually exclusive branches are alternatives, not additive. The export also retains the minimum across all-star routes. Raid-only values come directly from each tier's `raidAllChestId`.

| Guide | Tier | Previous → live initial-clear regular shards |
| --- | --- | --- |
| Biovore and Z’Kar | 4 | 34 → 36 |
| Biovore and Z’Kar | 6 | 36 → 37 |
| Plagueburst Crawler | 3 | 36 → 34 |
| Plagueburst Crawler | 5 | 39 → 37 |
| Plagueburst Crawler | 6 | 36 → 37 |
| Plagueburst Crawler | 7 | 39 → 40 |
| Plagueburst Crawler | 8 | 40 → 41 |
| Plagueburst Crawler | 9 | 41 → 42 |
| Plagueburst Crawler | 12 | 48 → 50 |

Mythic tiers retain 6 / 8 Mythic shards and now also show their regular shards: up to 18 / 19 for Biovore and Z’Kar, and 21 / 21 for Plagueburst Crawler. Existing artwork contains the original reward figures; the site marks the live table as current.

Tier rarity and rank limits come from the production configuration. The established website display ceiling remains Adamantine II (index 19), matching Hero Guides. Native Mythic `maxRank` is 20; that distinction is retained in the export rather than described as a native Adamantine II cap.

### Hero bonuses

Blood Angels adds Snotflogga, Tanksmasha and Zapspitta to the existing non-stacking **+0.25** required-Campaign/Event-Campaign bonus. There are now 42 eligible heroes. Individual Raid, War, Horde and Popularity values are byte-for-byte unchanged in the imported assessment objects.

- Snotflogga: Overall 7.145682… → 7.395682…, rank 11 → 8.
- Tanksmasha: Overall 4.309947… → 4.559947…, rank 87 → 80.
- Zapspitta: bonus 0 → 0.25; Overall remains Pending because required mode scores are missing.

Other positions shift only through ranking these corrected final scores. Daras remains Pending. The published `2026-11` monthly Top 10 snapshot is unchanged; current directory/profile scores and historical monthly editions have separate ownership.

## Production and preview comparisons

Against production 1.43.130, the live catalog adds Daras and Boudicari. Existing unit metadata changes affect Kimm's acquisition eligibility, Gulgortz's power multiplier, and Nubari/Lysander release or acquisition flags. Existing ability changes include `WaaaghEnergy`, `MasterOfTheTutelaries`, and the Necrons/Sisterhood faction-summon effects; 16 ability records are added. The Thrydderghyre relic item definition changes and is included in the refreshed relic import.

Against QA 1.44.120, the full comparison records **928 leaf differences**: 540 in Incursion event configuration, 268 in loot (195 Incursion chest fields and 73 Blessed Requisition weights), and 120 in Fabius upgrade-stat increments. The live Fabius increments replace preview placeholder values. Current unit ability/progression definitions otherwise agree between those two 1.44 captures. Announced news rosters and reward summaries remain semantically unchanged; no old drop-rate percentages are presented as live.

For LREs, existing hero eligibility, requirements and maximum scores are unchanged. Daras is added to each 120-hero roster. Farsight and Lysander enemy-stage records change; Uthar and Fabius stage records agree. Maximum battle points remain 24,329 / 24,603 / 24,547 / 24,748 respectively.

S114 keeps all 25 selected slots, teams, damage averages and its loop. The current replay master has 2,226 eligible records versus the previous snapshot's 2,211; this candidate-inventory metadata change does not change any selected result. S114's editorial Design preview status and November 18 date remain separate from the verified production source.

## Retired dependencies and safeguards

Removed the preview reference JSON, preview importer and `import:update-144` command. Version-specific editorial profiles were renamed to `profile-additions.json` and contain no duplicate game mechanics. Removed inactive preview Daras/Boudicari portrait copies and the superseded site raid-source JSON. Recoverable historical evidence remains in Git/local archives, not in current imports.

`npm run check:game-data` checks the shared production version/hash, all roster sizes, live LRE/CE/Incursion provenance, native artwork checksums and absence of retired preview payloads. It runs before production builds. A synthetic branching-route test guards against adding rewards from mutually exclusive Incursion paths. Built Campaign Event checks reconcile every rendered stage row with the live rules. Import instructions and all current source labels were updated; dated historical research notes retain their original versions.

## Verification and boundaries

- LocalDatabase: **54 unit tests passed**; catalog validation and transactional refresh completed.
- Hero tests: **27 passed**; machine tests: **4 passed**; new-profile tests: **4 passed**.
- Raid source/guide tests: **15 passed**; S114 frozen-source check passed.
- All **384 LRE filter states**, Fabius pool/navigation checks, all 120 built hero pages, all 12 built MoW pages and source reconciliation passed.
- Campaign Event evidence/CSV checks passed, including all seven live 33-row stage tables. Replay Library tests passed.
- Astro: **0 errors, 0 warnings, 0 hints**; production build: **194 pages**. Git whitespace check passed.
- Browser review covers live reward figures, native portraits, resolved Daras poison text, Tyranids deployment limits and Boudicari slider/reset controls; no missing images or horizontal overflow at the reviewed 458px width.
- [Validation records and archived logs](../../LocalDatabase/research/live-1.44.88/verification.json). Final hero/MoW page checks used the isolated `/tmp/tacticus-live144-verified-dist` build after generated files disappeared from the shared output folder; all 120 hero and 12 machine pages passed there.

Validation proves consistency with the installed production app and the saved evidence. Server-side hotfixes and new live-battle performance are separate sources. Existing calculation assumptions, authored ratings, video observations and artwork dates have not been promoted to new evidence. No new campaign clears, performance scores, season dates or public announcement scope were invented.
