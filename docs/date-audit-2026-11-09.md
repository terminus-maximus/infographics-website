# Infographic date audit — November 9, 2026

Audited 189 local routes and their live counterparts at `terminusmaximus.com` using the `update_the_update_date` skill. Dates use PNG content commits and committer timestamps in America/Los_Angeles. [Evidence](date-audit-2026-11-09.json) retains the PNG hashes, author and committer timestamps, labels, exclusions and live responses.

## Local result

There are 32 direct-scope infographic pages: **32 compliant, zero mismatched, zero unverified** after corrections and the authorized PNG commit. The remaining 157 routes comprise 18 excluded Guild Raid season/preview pages, 119 hero profiles with score dates but no dedicated infographic, 19 hubs/reference pages without a dedicated infographic date, and one redirect. These are page counts, not image counts.

| Route | Previous HTML label | Linked PNG | Verified revision / commit | Local correction |
| --- | --- | --- | --- | --- |
| `/campaign-event/death-guard/` | Last updated on Oct 15, 2026 | `/images/ce-death-guard.png` | Nov 8, 2026 · `d016f6654c39791fe558124650a2e9a19f2d57c4` | Last updated on Nov 8, 2026 |
| `/campaign-event/tyranids/` | Last updated on Oct 15, 2026 | `/images/ce-tyranids.png` | Nov 8, 2026 · `d016f6654c39791fe558124650a2e9a19f2d57c4` | Last updated on Nov 8, 2026 |
| `/heroes/top-10/` | No infographic date; ranking publication date only | `/images/top-10.png` | Nov 3, 2026 · `90b68877619b63fdf296fe9a63ededfba7fa1335` | Added Last updated on Nov 3, 2026 using the shared component |
| `/campaign-event/blood-angels/` | Infographic update date unverified | `/images/ce-blood-angels.png` | Nov 9, 2026 · `b2b061dae7dcdb6aaab660275a2a507cba25b509` | Last updated on Nov 9, 2026 |
| `/campaign-event/` | Infographic update date unverified | `/images/campaign-event.png` | Nov 9, 2026 · `b2b061dae7dcdb6aaab660275a2a507cba25b509` | Last updated on Nov 9, 2026 |

The two Nov 8 PNG revisions have author and committer timestamps `2026-11-08T12:24:29-08:00`. Top 10 has author and committer timestamps `2026-11-03T15:04:55-08:00`. The Top 10 ranking publication date remains separate and unchanged: it dates the frozen rankings, while the new label dates the linked infographic. The Top 10 page has a dedicated PNG and is not covered by the season-guide exclusion.

Dan authorized a local commit of exactly the Blood Angels and campaign-overview PNGs. Commit `b2b061dae7dcdb6aaab660275a2a507cba25b509` has author and committer timestamps `2026-11-09T14:55:43-08:00`, so both labels now use Nov 9, 2026. The earlier overview commit described its previous artwork. Upload time, filesystem time and the date printed inside the graphic were not substituted. The date registry, HTML and report updates remain uncommitted; the asset commit contains only the two approved PNGs.

## Live result

The live comparison, captured before the local asset commit and not re-fetched afterward, found **27 compliant** infographic dates, **two stale** CE dates, **one missing** Top 10 infographic date, **one unverified** overview revision because its live image differs from the local replacement, and **one not-yet-deployed** Blood Angels guide. All 189 route requests completed without network errors, and discovery found no additional live-only routes.

The Blood Angels URL returns HTTP 200 with homepage fallback HTML and a root canonical URL, not the new guide. It is not counted as a compliant or successfully deployed guide. Its image endpoints also do not match the new local assets. The campaign overview PNG and WebP differ between local and live. The Top 10 PNG was checked separately because its live page lacks an infographic date; it matches the local committed PNG exactly. No asset requests failed at the HTTP/network level.

The live Death Guard and Tyranids pages still read Oct 15; their PNGs match the local Nov 8 revisions. The local corrections above have not been deployed. Other hero-score dates and Machine of War references to the shared Incursion overview were inspected and retained; they do not represent additional dedicated infographic dates.

## LRE versions and verification

All four planners—Farsight, Uthar, Lysander and Fabius—display **Roster data as of Version 1.43.130** locally and live. Each version matches its dataset's `characterBuild` and `src/data/lre/sources.json`. Lucius has no roster-version line locally or live. No roster versions were changed.

The 189-page build, `npm run check:lre` (all four planners and 384 filter states), `npm run check:campaign-events`, and whitespace checks pass. A fresh local date audit confirms all five corrected labels, all 18 Guild Raid exclusions, and zero unverified PNG revisions. Source review covered the shared date renderer, campaign headers, CE pages, LRE pages, Incursion guide images, Guild War pages and Boss Meta. No push or deployment was performed.
