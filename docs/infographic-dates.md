# Infographic update dates

Every dedicated infographic guide page uses the PNG's Git revision date and the same public wording, for example: **Last updated on Oct 26, 2026**. Month names are Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sept, Oct, Nov, Dec. Dates always include the day and year. Explicitly uncommitted artwork remains unverified until its content revision is committed.

This policy was selected by Dan on October 13, 2026. It intentionally replaces campaign replay-data, Biovore research, and LRE page-update dates in the header. Those underlying provenance fields remain available in their source datasets; the public header consistently refers to the infographic.

## Shared source and rendering

`src/data/infographicRevisions.json` stores `{ updatedOn, commit }` for each full-size PNG URL. Dates are ISO `YYYY-MM-DD`; the commit records the evidence behind the date. `src/lib/infographicDates.ts` validates the dates and supplies the shared abbreviation format. `InfographicUpdated.astro` renders the label and `<time datetime>` consistently across featured pages, campaign/Biovore heroes, Campaign Event guides, Guild Wars and Boss Meta. Missing registry entries fail the build.

The October 26 Z’Kar, PBC, and refreshed Incursion overview PNGs are committed in
`8feacfb126a95f76984793c18e5b7de29a0dcfa1`. Its committer timestamp is
`2026-10-26T16:12:34-07:00` (America/Los_Angeles), so all three registry entries use
`2026-10-26`. The temporary unverified preview state is resolved. The shared date
renderer again requires committed dates for all registered artwork.

Final October 26 local audit: all 58 routes built. All 30 direct-scope dates
match their committed PNG revisions and standard wording, with zero mismatches
or unverified dates. The 17 season/preview exclusions, ten other undated routes,
and one redirect remain unchanged. All four LRE roster-version checks and 384
filter states passed. Live deployment is verified separately after pushing.

When replacing an infographic, inspect its PNG history after committing the asset, update its registry entry to the content commit's date in America/Los_Angeles, and rebuild. Follow byte-identical copies or renames back to the prior content revision. Do not use WebP/thumbnail conversion dates, event dates printed inside the image, filesystem timestamps, or the build date. Farsight's registry date follows the unchanged copy back to the May 30 original tracked content. The public site uses committed metadata and does not require Git history on the deployment host.

## LRE roster versions

The four active LRE planner datasets (`farsight`, `uthar`, `lysander`, `fabius`) currently contain `characterBuild: "1.44.88"`, matching their entries in `src/data/lre/sources.json`. Their hero's second line reads **Roster data as of Version 1.44.88**. The version comes directly from the same dataset that powers that page's planner, so subsequent imports update the label without separate page edits. It is the character roster build, not necessarily the event-configuration build.

Lucius has no roster backend or planner, so no roster version is displayed on its legacy page. Its infographic update date is standardized with the others.

## Guild Raid exclusions

Season guides (`/guild-raid/sNNN/`) and the next-season preview (`/guild-raid/next-season/`) intentionally have no update date, including future seasons. They are time-bound, short-lived guides. The evergreen Boss Meta guide remains dated. Home-page previews and hubs do not gain dates merely because they link to a dated guide.

## Validation

Run `npm run build` and `npm run check:lre`. The LRE check verifies that each displayed roster version equals the planner dataset's `characterBuild`.

The personal `update_the_update_date` skill includes an audit helper:

```sh
python3 /Users/danfoster01/.codex/skills/update_the_update_date/scripts/audit_dates.py \
  --repo "$PWD" --build "$PWD/dist" \
  --output /tmp/terminus-date-audit-local.json
```

Add `--live-base https://terminusmaximus.com` to inspect deployment separately. The helper checks the exact date and wording, distinguishes unchanged copies, and explicitly excludes season/next-season guides. A local pass does not mean the changes have been deployed.

The pre-change findings are retained in [the October 13 audit](date-audit-2026-10-13.md). Its five mismatches and nine date-meaning exceptions describe the prior site, not the standardized implementation.

October 24 local validation: 56 routes built, all 28 evergreen guide dates match PNG history and standard wording. The six individual Campaign Event guides now use the shared header component and registry; their dates remain Oct 15, 2026. Boss Meta reflects its newly committed Oct 24 graphic. All 17 season/preview exclusions and all four roster-version labels were preserved. See [the October 24 audit](date-audit-2026-10-24.md). This refresh is prepared locally and has not been pushed.

October 13 local validation: all 49 routes built; all 22 dates matched PNG history and standardized wording; 16 season/preview routes remained undated. The four roster-version lines matched their datasets and all 384 LRE filter states passed existing checks. Browser review confirmed the LRE two-line header and matching date typography on campaign, Biovore, and Guild War layouts. [Validation inventory](date-standardization-2026-10-13-validation.json). These changes have not been deployed.


November 9 Campaign Event preview: `/images/campaign-event.png` and
`/images/ce-blood-angels.png` are new, uncommitted artwork revisions. Their registry
entries use `{ updatedOn: null, commit: null, status: "unverified" }`, rendered as
**Infographic update date unverified** with no invented `<time>` value. Once the
actual PNG revisions are committed, replace these entries with the content
commit and its Los Angeles revision date. Other registry entries retain their
committed evidence. Missing entries and incomplete non-preview entries still fail.

The local November 9 audit scanned 189 routes: 27 committed infographic dates
matched, these two new revisions were unverified, and two pre-existing labels
(Death Guard and Tyranids) still showed Oct 15 against Nov 8 PNG revisions.
Those separate guide-date corrections were not included in this launch update.
The audit also identified 18 excluded season/preview routes, one redirect, 20
routes without an update label, and 119 hero pages without a dedicated PNG.

The subsequent [full November 9 audit](date-audit-2026-11-09.md) corrected Death
Guard and Tyranids to Nov 8, 2026, and added the missing Top 10 infographic date,
Nov 3, 2026. Its ranking publication date remains separate. All 189 local routes
were checked: 32 direct-scope pages, of which 30 dates match committed PNG
revisions and two new artwork revisions remain unverified. All four LRE roster
versions match their source manifests, and all 18 Guild Raid exclusions remain
undated. Live findings and revision evidence are retained in the linked report.


After Dan authorized committing the two new PNGs, commit
`b2b061dae7dcdb6aaab660275a2a507cba25b509` recorded both at
`2026-11-09T14:55:43-08:00`. Their unverified entries are now resolved to
**Last updated on Nov 9, 2026**. The final local audit covers all 189 routes:
32 compliant infographic dates, zero mismatches and zero unverified revisions;
18 excluded Guild Raid routes and 139 other routes. Build, CE and LRE checks
pass. Only the two PNGs were committed; no push or deployment was performed.

November 10 release: the updated Daras HRE and Lysander PNGs are committed in
`01f3d53b1dd67b888789952ba49095325a5fc26a`. Both registry entries now use
`2026-11-10`, the content commit’s date in America/Los_Angeles.
