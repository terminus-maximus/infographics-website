# Site update-date audit — September 23, 2026

Two visible update labels need correction: **Incursion / MoW** and **Uthar LRE**. Other discrepancies mostly come from different date meanings: artwork edition, event start, replay-data revision, and research review.

## Scope and evidence

- Audited all **47 generated routes**, and fetched all 47 corresponding live pages successfully. All **21 displayed update labels** match the local build: 12 “Last Updated,” eight “Replay data updated,” and one “Research updated.” The other 26 routes have no update label.
- Built the current checkout successfully with `npm run build -- --outDir /tmp/terminus-date-audit-20260923/build`; source revision `4409764`.
- Read all 21 corresponding full-size guide PNGs with OCR and visually checked their date markings. Compared relevant Git history, including before/after Uthar artwork.
- Verified SHA-256 equality between local and live copies of all **21 guide PNGs and 21 corresponding WebPs**. The observed issues are in date metadata/copy, not different deployed copies of these assets.
- None of the 21 guide PNGs contains a usable creation/modification date in its inspected EXIF/XMP/text metadata. Filesystem modification times are not treated as authoritative editorial dates. Dates printed in artwork and dates of substantive Git revisions are separate evidence.
- This is a date audit, not a new review of gameplay advice, replay coverage, or future event schedules. Historical event dates and cited discussion dates are not automatically update dates. Archive artwork was not individually OCR-audited because those pages have no update labels to reconcile.
- No website source, artwork, or production deployment was changed. Only this report and its evidence JSON were added.

## Confirmed corrections

| Page | Current label | Evidence | Recommended label |
| --- | --- | --- | --- |
| [Incursion / MoW](https://terminusmaximus.com/incursion-mow/) | Last Updated: August 2026 | [PNG](../public/images/incursion-mow.png) is visibly stamped “Sept 2026”; the current artwork was committed September 23 in `4409764`, “MoW update and Biovore guide.” | **September 23, 2026** if the label means the site's last substantive revision; **September 2026** if retaining artwork-edition precision. |
| [Uthar LRE](https://terminusmaximus.com/lre/uthar/) | Last Updated: Sept 6, 2026 | [PNG](../public/images/uthar-lre.png), WebP, and thumbnail changed September 9 in `745f010`, “Sekehtar Uthar LRE.” Visual comparison confirms a substantive recommendation change: Xybia replaces Sekhetar in the main Psychic + Ranged team, with Sekhetar moved among alternates. | **September 9, 2026**. The artwork's “October 4” is the event date, not the update date. |

Edit locations: `src/pages/incursion-mow/index.astro:11` and `src/pages/lre/uthar.astro:11`.

## Complete inventory: generic update labels

| Page | Live “Last Updated” | PNG date marking / revision evidence | Assessment |
| --- | --- | --- | --- |
| `/beginner-guide/` | June 2026 | June 2026; latest PNG revision June 4 (`e9d939e`) | Aligned at month precision. |
| `/elite-campaigns/` | July 2026 | July 2026; latest PNG revision July 8 (`2bf9344`) | Aligned at month precision. |
| `/guild-raid/boss-meta/` | July 2026 | July 2026; PNG revision July 14 (`53cfa27`); team-summary/map data last revised July 13 | Aligned with artwork/curated guide edition. A separate replay-library refresh is not automatically a new guide edition. |
| `/guild-wars/attack/` | Sept 2026 | Sept 2026; PNG revision September 12 (`f5087d4`) | Aligned at month precision. |
| `/guild-wars/defend/` | Sept 2026 | Sept 2026; PNG revision September 13 (`27e70d0`) | Aligned. September 6 capture and September 12 extraction dates in the methodology refer to different events. |
| `/incursion-mow/` | August 2026 | Sept 2026; substantive PNG revision September 23 | **Stale; correct as above.** |
| `/campaign-event/` | Sept 6, 2026 | Artwork says Sept 10 (event start); PNG committed September 5, label explicitly refreshed September 6 (`bc85835`) | No demonstrated stale update label. The event date need not equal the update date. |
| `/hre/` | Sept 6, 2026 | Artwork says Sept 13 (event start); PNG committed September 5, label explicitly refreshed September 6 (`bc85835`) | No demonstrated stale update label. |
| `/lre/farsight/` | May 20, 2026 | Artwork says June 21; image originally added as `lre.png` May 30 and copied unchanged to `farsight-lre.png` June 1 (`C100` in Git history) | Exact May 20 authoring date cannot be independently verified from repository history. June 1 was a copy, not an artwork revision; do not automatically bump the label. Artwork refers to an earlier event. |
| `/lre/lysander/` | July 28, 2026 | Artwork says August 29; latest PNG revision July 26 (`9e859ca`) | No newer PNG revision contradicts July 28. Artwork event date is older than the future event promoted on the site. |
| `/lre/lucius/` | June 23, 2026 | Artwork says July 2026; latest PNG revision June 23 (`323bc2d`, “Refreshed Lucius graphic”) | June 23 is supported by the revision history. July artwork edition is not proof of a later update. Retired from discovery in `graphics.ts`; preserve historical context. |
| `/lre/uthar/` | Sept 6, 2026 | Artwork says October 4; substantive PNG revision September 9 | **Stale; correct as above.** |

## Replay and research dates

All eight campaign dates agree with the date of the latest commit affecting the corresponding replay JSON. A newer infographic does not imply the replay dataset was refreshed.

| Page | Live replay-data date | PNG edition | Latest PNG commit | Assessment |
| --- | --- | --- | --- | --- |
| `/campaigns/indomitus/` | August 12, 2026 | August 2026 | August 4 | Retain replay date. |
| `/campaigns/indomitus-mirror/` | August 6, 2026 | August 2026 | August 5 | Retain replay date. |
| `/campaigns/fall-of-cadia/` | August 12, 2026 | **Sept 2026** | **September 16** (`8c65762`) | Retain replay date; add **Infographic updated: September 16, 2026** beside the artwork. |
| `/campaigns/fall-of-cadia-mirror/` | August 12, 2026 | August 2026 | August 10 | Retain replay date. |
| `/campaigns/octarius/` | August 15, 2026 | August 2026 | August 15 | Retain replay date. |
| `/campaigns/octarius-mirror/` | August 19, 2026 | August 2026 | August 17 | Retain replay date. |
| `/campaigns/saim-hann/` | August 19, 2026 | August 2026 | August 19 | Retain replay date. |
| `/campaigns/saim-hann-mirror/` | August 23, 2026 | **Sept 2026** | **September 16** (`8c65762`) | Retain replay date; add **Infographic updated: September 16, 2026** beside the artwork. |

Biovore (`/incursion-mow/biovore/`) says **Research updated: September 20, 2026**. This agrees with the creator-review provenance documented in `docs/incursion-guides.md`. The PNG is stamped Sept 2026 and was added September 23; the tier-cap/reward section also came from a September 23 screenshot. Retain September 20 for the creator research and add **Infographic updated: September 23, 2026** (and a guide-content date if the whole page needs one). Do not imply a new creator review happened on September 23.

## Related date presentation problems

1. **Expired “Next” wording.** As of September 23, the shared catalog still says “Next CE begins Sept 10” and “Next HRE begins Sept 13.” These appear on the live homepage and event discovery surfaces. Source: `src/data/graphics.ts:234` and `:242`. Replace with neutral descriptions or correctly maintained event status; do not guess the next occurrence. These are separate from the September 6 update labels.
2. **Older event dates embedded in active LRE artwork.** Farsight's PNG still says June 21 while its shared card promotes Nov 8 or Dec 13; Lysander's PNG says August 29 while its card promotes Dec 13 or Jan 17. Those future dates are existing site claims, not independently verified by this audit. Mark the artwork's event edition clearly, or review/reissue the art for the next confirmed event. Do not merely bump “Last Updated” to make old artwork look current.
3. **Date meaning is inconsistent.** `FeaturedInfographicPage.astro` accepts free-form `lastUpdated` strings; Boss Meta hard-codes its own label; Guild Wars stores free-form dates in two JSON files. Campaigns and Biovore already use ISO dates and meaningful labels through `CampaignHero.astro`. This fragmentation allows an image update to ship without a matching label change.
4. **Some data-rich pages expose no freshness date.** The Replay Library has a usable `exported_at` value of `2026-09-21T21:09:23` in `src/data/replay-library/replay-library-export-manifest.json`, but no visible data-refresh label. All 14 Guild Raid season pages also omit update labels, even though their artwork can be revised. Consider an explicit per-infographic revision date for current season guides; preserve historical dates on archived seasons.

## Recommended approach

1. Make the two confirmed label corrections and remove the two expired “Next” claims first.
2. Keep separate fields for **infographic revision**, **replay-data revision**, **research review**, and **event start**. Store an artwork edition separately when its printed date is only a month or refers to an event. Page/header, homepage cards, and recommendations should consume the same relevant record.
3. Reuse one date formatter and semantic `<time datetime="…">` markup. Store full dates as `YYYY-MM-DD`; preserve month-only precision as `YYYY-MM` where that is all the evidence supports. Display months consistently, e.g. “September,” rather than mixing “Sept” and full names.
4. Add an asset-update check: when a full-size PNG changes, require a metadata review and regeneration/verification of the corresponding WebP and thumbnail. Record whether the change is substantive or merely a conversion. An asset hash can detect a change; it cannot establish the editorial date by itself.
5. Do not generate editorial dates from today's build date, deployment time, or filesystem modification time. Use an explicitly recorded revision date, supported by the PNG's edition and substantive source history. Current asset Git dates are a reasonable proposed site-revision baseline, not proof of original authoring time.

## Routes without update labels

These were included in the 47-page sweep; there is no update label to align on them:

- `/about/`
- `/campaigns/`
- `/event-campaign/` — redirect to `/campaign-event`.
- `/events/`
- `/feedback/`
- `/guild-raid/archive/`
- `/guild-raid/`
- `/guild-raid/next-season/`
- `/guild-raid/s097/`
- `/guild-raid/s098/`
- `/guild-raid/s099/`
- `/guild-raid/s100/`
- `/guild-raid/s101/`
- `/guild-raid/s102/`
- `/guild-raid/s103/`
- `/guild-raid/s104/`
- `/guild-raid/s105/`
- `/guild-raid/s106/`
- `/guild-raid/s107/`
- `/guild-raid/s108/`
- `/guild-raid/s109/`
- `/guild-raid/s110/`
- `/guild-wars/`
- `/`
- `/lre/`
- `/replay-library/`

The home page itself has no “Updated” label. Its Incursion feature and shared card both advertise September 28; the stale August label is on the destination guide.

Machine-readable supporting evidence: [date-audit-2026-09-23-evidence.json](date-audit-2026-09-23-evidence.json).
