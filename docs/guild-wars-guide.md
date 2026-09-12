# Guild Wars guide maintenance

The local dataset builds independently of the analysis project. Normal `npm run dev` and `npm run build` never read or refresh the research source. No new package is required.

## Files

- `src/pages/guild-wars/index.astro`: one-card landing page, following the LRE guide layout.
- `src/pages/guild-wars/attack.astro`: infographic, Methods & Definitions disclosure (Data Source, Metrics Explained, Methodology Notes, and Methodology Explained), jump links, teams, and existing Explore recommendations. Repeated explanations live in the methodology notes; the detailed methodology defaults to “Coming soon”. Each team jump link uses the first character portrait from its editorial core order.
- `src/components/guild-wars/`: portraits, usage options, evidence tables, and team sections.
- `src/data/guild-wars/editorial.json`: public titles, landing introduction, card description, stable anchors, ordered canonical core IDs, edition, infographic paths/dimensions, ten independent tips, and methodology. Tips and methodology are plain text, preserving newlines. Empty fields show their coming-soon placeholders.
- `src/data/guild-wars/attackers.json`: sanitized generated statistics and identity/portrait references.
- `scripts/import-guild-wars.mjs`: explicit, read-only source adaptation; validates before writing the website dataset and required portraits.
- `scripts/check-guild-wars.mjs`: focused checks against the built pages, optionally with full source reconciliation.
- `src/components/Header.astro`: Explore has six expandable groups: Start Here, Campaign Guides, Guild Raid, Guild Wars, Events, and LRE. Guild Wars links to its landing page with an Attackers child link.
- `src/pages/index.astro`: the Guild Wars card section sits between Guild Raids and Legendary Guides and uses active `guild-war` entries from the shared discovery catalog.
- `src/data/graphics.ts`: discovery/recommendation registration. The Attackers card is eligible for More to Explore on other pages via its WebP recommendation image. This repository has no sitemap generator or sitemap file to extend.

## Import a future accepted report

1. Obtain an accepted report using the same `report-data` schema. Do not run discovery or extraction from this website. The importer accepts the report HTML or a JSON export of that complete object, with `assets/` beside it. Individual research CSVs and `selected_ten.json` are not complete import inputs.
2. Run from the website root, quoting the explicit report path:

   ```sh
   node scripts/import-guild-wars.mjs '/path/to/accepted-report/index.html'
   ```

   An optional second argument selects an output JSON path inside this repository. All input access is read-only. The script does not fetch data. Missing, added, duplicate, or changed core IDs stop import for editorial review; it never silently drops teams. Resolve intentional roster changes in `editorial.json`, preserving anchors where identities remain the same, before rerunning.
3. Update `edition`, infographic paths and true image dimensions in `editorial.json`; update tips and methodology independently. Seasons, tiers, wars, and eligible attacks come from the new report audit. Check the edition, scope, title mapping, and infographic together before publishing. The card array supports future actual guides; don't add speculative cards.
4. Existing character portraits are joined through the website's canonical character registry. The importer has explicit canonical MoW aliases for reused local artwork and copies only otherwise-needed source portraits into `public/images/guild-wars/`. An unmapped/ambiguous category stops import instead of being labeled absent support. Review any new identities/artwork. Four known Mac Roman decoding artifacts in source display names are repaired without changing IDs; Rotbone uses his registry-grounded surname.
5. Build and check:

   ```sh
   npm run build
   node scripts/check-guild-wars.mjs '/path/to/accepted-report/index.html'
   npm run dev
   ```

   Without a source argument, the check uses only committed local data and built HTML. September 2026 regression assertions apply only to that edition. Review desktop/mobile layouts, expanded tables, keyboard disclosure operation, the no-support icon, and full-resolution links after changes. Review the diff and include the infographic files and any new portraits when committing. Import does not push or deploy.

## Data semantics

All team statistics are inclusive: complete-core eligible non-cleanup attacks, including failures. `perfect` counts Perfect clears and `withDeaths` counts other clears. Main Perfect share is Perfect / clears; `perfectPerAttempt` remains in the local dataset but is not displayed. Meds Up metrics use the joint recorded context, never inferred marginal totals. Undefined rates remain `null` and display an em dash. Counts and rates retain source precision; display percentages use one decimal place.

`combinations` represents the source `variants`: actual five-character teams, with MoWs combined. `teamMows` represents source `exact`: full team plus recorded support. `mows` represents actual support categories. The local dataset retains up to 25 rows per evidence table sorted by attacks descending, clear rate descending, then canonical unit/team/support ascending, plus its original category count. The page displays only the first five rows of `combinations` and `teamMows`, under “Heroes exactly” and “Complete Team exactly”. Usage always divides by all matching core attempts, not the displayed rows. Individual flex counts remain in local data. The page displays up to five flex options with at least 3.8% usage and up to three MoW options with at least 10% usage, without a separate support-results table. Cutoffs use unrounded shares, include the exact threshold, and omit undefined shares. The importer checks full partitions before truncation.

Evidence category counts appear in the explanation beneath each disclosure, not in its heading. Map × Medicae rows remain secondary context under “Hard Maps”, with Clear rate as the first column. “Team Tips” uses the same collapsed disclosure styling. The source 95% interval stays in the local dataset but is not displayed.

`missing_unknown` remains the identity key; “No MoW deployed” is only its display label. It has a neutral CSS support slot rather than a portrait. `down_provisional` displays “No Meds Buff”; `up` displays “Meds Up”. Source keys remain unchanged, and any future `unknown` category stays separate. The standalone outcome totals and breadcrumbs are omitted from the pages. No raw battle examples, player identifiers, local source paths, assigned-family data, or research exports enter the public dataset.

## Initial verification

The full static build succeeds. The repository-wide Astro check reports 60 errors in pre-existing infographic, Guild Raid, replay-library, and feedback files; no diagnostics reference the new Guild Wars files. Existing errors were left outside this change's scope.

Focused source-to-built-page checks cover all ten mapped cores and 30 tables, including full-team co-occurrence, counts, denominators, usage-first order, five-row display limits, portrait references, zero-denominator formatting, and private-field exclusion. They also check the revised landing copy and removal of breadcrumbs, outcome totals, additional flex options, and support-results disclosures. Both supplied regression examples match. The source report SHA-256 still matches its accepted fingerprint; no research files were modified.

Browser review covered the landing page and attacker guide, the infographic, 1280px desktop evidence tables, 390px mobile team/evidence layouts, and a 320px guide viewport. No page-level horizontal overflow was observed. The menu and landing card navigate correctly, all ten anchor targets exist, keyboard Enter operates disclosures with visible focus, and ArrowRight scrolls a focused evidence table. Full-team + support and map × Medicae disclosures were inspected, including the neutral no-support icon. Every image reference resolves locally. The final review used the built site (`npm run preview -- --host 127.0.0.1 --port 4321`), avoiding a stale stylesheet in the earlier development preview.

Local routes: `http://127.0.0.1:4321/guild-wars/` and `http://127.0.0.1:4321/guild-wars/attack/`. Restart with the preview command above after a build, or use `npm run dev` while editing. Nothing was pushed or deployed. The pre-existing `.vscode/commands.md` edit and supplied infographic assets were preserved.
