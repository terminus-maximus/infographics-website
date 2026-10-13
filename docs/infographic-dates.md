# Infographic update dates

All 22 dated guide pages use the PNG's Git revision date and the same public wording: **Last updated on Oct 11, 2026**. Month names are Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sept, Oct, Nov, Dec. Dates always include the day and year.

This policy was selected by Dan on October 13, 2026. It intentionally replaces campaign replay-data, Biovore research, and LRE page-update dates in the header. Those underlying provenance fields remain available in their source datasets; the public header consistently refers to the infographic.

## Shared source and rendering

`src/data/infographicRevisions.json` stores `{ updatedOn, commit }` for each full-size PNG URL. Dates are ISO `YYYY-MM-DD`; the commit records the evidence behind the date. `src/lib/infographicDates.ts` validates the dates and supplies the shared abbreviation format. `InfographicUpdated.astro` renders the label and `<time datetime>` consistently across featured pages, campaign/Biovore heroes, Guild Wars and Boss Meta. Missing dates fail the build.

When replacing an infographic, inspect its PNG history after committing the asset, update its registry entry to the content commit's date in America/Los_Angeles, and rebuild. Follow byte-identical copies or renames back to the prior content revision. Do not use WebP/thumbnail conversion dates, event dates printed inside the image, filesystem timestamps, or the build date. Farsight's registry date follows the unchanged copy back to the May 30 original tracked content. The public site uses committed metadata and does not require Git history on the deployment host.

## LRE roster versions

The four active LRE planner datasets (`farsight`, `uthar`, `lysander`, `fabius`) currently contain `characterBuild: "1.43.130"`, matching their entries in `src/data/lre/sources.json`. Their hero's second line reads **Roster data as of Version 1.43.130**. The version comes directly from the same dataset that powers that page's planner, so subsequent imports update the label without separate page edits. It is the character roster build, not necessarily the event-configuration build.

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

October 13 local validation: all 49 routes built; all 22 dates matched PNG history and standardized wording; 16 season/preview routes remained undated. The four roster-version lines matched their datasets and all 384 LRE filter states passed existing checks. Browser review confirmed the LRE two-line header and matching date typography on campaign, Biovore, and Guild War layouts. [Validation inventory](date-standardization-2026-10-13-validation.json). These changes have not been deployed.
