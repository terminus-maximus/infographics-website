# Infographic date audit — November 15, 2026

Source revision: `6e30359ab7b4662c53235198c2a869ffc6b9bfb1` plus this chat’s local hygiene edits. America/Los_Angeles. Local and live routes were checked; nothing was committed or deployed.

**195 HTML routes scanned. All 33 direct-scope infographic pages are compliant in the final local build: zero mismatches, zero missing labels, zero unverified revisions.** The initial local and live audit had 32 compliant pages and one missing label. No existing date needed correction.

| Scope | Count | Result |
| --- | ---: | --- |
| Dedicated infographic pages | 33 | Local: 33 compliant. Live: 32 compliant, Game Update 1.44 label still missing. |
| Excluded Guild Raid routes | 20 | S097–S115 plus Next Season; all undated. Next Season is a redirect to S114. |
| Individual hero profiles | 120 | No dedicated PNG; rating publication labels are outside infographic-date scope. |
| Machine profiles without unlock graphics | 9 | No dedicated PNG. Boudicari’s rating date is a separate label, not an infographic date. |
| Hubs and utilities | 12 | No dedicated infographic/update label required. |
| Other redirect | 1 | `/event-campaign/` redirects to Campaign Event. |

## Correction

| Route | Previous label | PNG | Effective revision | Commit | Local correction |
| --- | --- | --- | --- | --- | --- |
| `/news/game-update-1-44/` | Missing locally and live | `/images/Game-Update-144.png` | Nov 10, 2026 | `01f3d53b1dd67b888789952ba49095325a5fc26a` | Added shared `InfographicUpdated` and registry entry: **Last updated on Nov 10, 2026**. |

The PNG author and committer timestamps are both `2026-11-10T03:46:41-08:00`. Its local/live SHA-256 matches. The existing article publication date, Nov 9, remains a separately identified publication date. The new infographic label is local and awaits deployment.

## Evidence and validation

All 33 full-size PNGs are committed and match live bytes. The initial helper checked 32 labeled guides and their preview assets; the supplemental check verified the previously unlabeled News PNG. No HTTP, asset, or Git-history failures occurred. Farsight still follows its unchanged copy from `lre.png` back to May 30, 2026. Numbered unreferenced artwork copies were excluded.

All four LRE guides show **Roster data as of Version 1.44.88**, matching their datasets and source manifest, locally and live. Lucius has no roster backend and no invented version line. The existing LRE checks pass all 384 filter states.

The production build and discussion checks pass. Browser review confirmed the new News label and discussion section. The final local date audit is clean. Hero and Boudicari rating labels were reviewed as separate concepts rather than mistaken for missing PNGs.

- [Initial live evidence](date-audit-2026-11-15-live-before.json)
- [Initial local evidence](date-audit-2026-11-15-local-before.json)
- [Final local evidence](date-audit-2026-11-15-local-after.json)
- [News PNG and LRE version verification](date-audit-2026-11-15-supplement.json)

## Final direct-scope inventory

| Route | Final local label | Full-size PNG | Content commit |
| --- | --- | --- | --- |
| `/beginner-guide/` | Last updated on Jun 4, 2026 | `/images/beginner-guide.png` | `e9d939e56c91` |
| `/campaign-event/admech/` | Last updated on Oct 15, 2026 | `/images/ce-admech.png` | `3bef96f57358` |
| `/campaign-event/blood-angels/` | Last updated on Nov 9, 2026 | `/images/ce-blood-angels.png` | `b2b061dae7dc` |
| `/campaign-event/dark-angels/` | Last updated on Oct 15, 2026 | `/images/ce-dark-angels.png` | `3bef96f57358` |
| `/campaign-event/death-guard/` | Last updated on Nov 8, 2026 | `/images/ce-death-guard.png` | `d016f6654c39` |
| `/campaign-event/` | Last updated on Nov 9, 2026 | `/images/campaign-event.png` | `b2b061dae7dc` |
| `/campaign-event/sisters/` | Last updated on Oct 15, 2026 | `/images/ce-sisters.png` | `3bef96f57358` |
| `/campaign-event/tau/` | Last updated on Oct 15, 2026 | `/images/ce-tau.png` | `3bef96f57358` |
| `/campaign-event/tyranids/` | Last updated on Nov 8, 2026 | `/images/ce-tyranids.png` | `d016f6654c39` |
| `/campaigns/fall-of-cadia/` | Last updated on Sept 16, 2026 | `/images/fall-of-cadia.png` | `8c65762982fa` |
| `/campaigns/fall-of-cadia-mirror/` | Last updated on Aug 10, 2026 | `/images/fall-of-cadia-mirror.png` | `7f4614d021cd` |
| `/campaigns/indomitus/` | Last updated on Aug 4, 2026 | `/images/indomitus.png` | `8c28ff641a7f` |
| `/campaigns/indomitus-mirror/` | Last updated on Aug 5, 2026 | `/images/indomitus-mirror.png` | `f785c0cfc2db` |
| `/campaigns/octarius/` | Last updated on Aug 15, 2026 | `/images/octarius.png` | `b368e7775caa` |
| `/campaigns/octarius-mirror/` | Last updated on Aug 17, 2026 | `/images/octarius-mirror.png` | `f59ca5efffd1` |
| `/campaigns/saim-hann/` | Last updated on Aug 19, 2026 | `/images/saim-hann.png` | `5f9004188af3` |
| `/campaigns/saim-hann-mirror/` | Last updated on Sept 16, 2026 | `/images/saim-hann-mirror.png` | `8c65762982fa` |
| `/elite-campaigns/` | Last updated on Jul 8, 2026 | `/images/elite-campaigns.png` | `2bf9344c81ca` |
| `/guild-raid/boss-meta/` | Last updated on Oct 24, 2026 | `/images/boss-meta.png` | `e0184bf309c1` |
| `/guild-wars/attack/` | Last updated on Oct 19, 2026 | `/images/guild-wars-attack.png` | `0b124029e4e1` |
| `/guild-wars/defend/` | Last updated on Oct 19, 2026 | `/images/guild-wars-defend.png` | `0b124029e4e1` |
| `/heroes/top-10/` | Last updated on Nov 3, 2026 | `/images/top-10.png` | `90b68877619b` |
| `/hre/` | Last updated on Nov 10, 2026 | `/images/hre.png` | `01f3d53b1dd6` |
| `/incursion-mow/biovore/` | Last updated on Sept 23, 2026 | `/images/mow-biovore.png` | `44097643468c` |
| `/incursion-mow/` | Last updated on Oct 26, 2026 | `/images/incursion-mow.png` | `8feacfb126a9` |
| `/incursion-mow/plagueburst-crawler/` | Last updated on Oct 26, 2026 | `/images/mow-pbc.png` | `8feacfb126a9` |
| `/incursion-mow/zkar/` | Last updated on Oct 26, 2026 | `/images/mow-zkar.png` | `8feacfb126a9` |
| `/lre/fabius/` | Last updated on Oct 5, 2026 | `/images/fabius-lre.png` | `3cf365ba851e` |
| `/lre/farsight/` | Last updated on May 30, 2026 | `/images/farsight-lre.png` | `7d601b2f99c7` |
| `/lre/lucius/` | Last updated on Jun 23, 2026 | `/images/lucius-lre.png` | `323bc2d238c1` |
| `/lre/lysander/` | Last updated on Nov 10, 2026 | `/images/lysander-lre.png` | `01f3d53b1dd6` |
| `/lre/uthar/` | Last updated on Sept 9, 2026 | `/images/uthar-lre.png` | `745f01051f78` |
| `/news/game-update-1-44/` | Last updated on Nov 10, 2026 | `/images/Game-Update-144.png` | `01f3d53b1dd6` |

## Excluded Guild Raid routes

`/guild-raid/next-season/`, `/guild-raid/s097/`, `/guild-raid/s098/`, `/guild-raid/s099/`, `/guild-raid/s100/`, `/guild-raid/s101/`, `/guild-raid/s102/`, `/guild-raid/s103/`, `/guild-raid/s104/`, `/guild-raid/s105/`, `/guild-raid/s106/`, `/guild-raid/s107/`, `/guild-raid/s108/`, `/guild-raid/s109/`, `/guild-raid/s110/`, `/guild-raid/s111/`, `/guild-raid/s112/`, `/guild-raid/s113/`, `/guild-raid/s114/`, `/guild-raid/s115/`.

Full route inventory, raw helper classifications, author timestamps, content commits, copy history, and local/live hashes are retained in the evidence JSON. The raw `label_without_png` classifications cover 120 hero profiles and Boudicari’s rating label; the reviewed scope above resolves them without changing those ratings.
