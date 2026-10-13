# Infographic date audit — October 13, 2026

This is the **pre-change audit snapshot**. The subsequent agreed policy and local implementation are documented in [Infographic update dates](infographic-dates.md); the original findings below are retained as evidence.

**13 pages are directly in scope: 8 compliant and 5 out of compliance.** Another **9 infographic pages use replay or research dates** and need a policy decision before their labels can be reconciled with artwork dates. The broader labeled-infographic inventory is therefore **22 pages**.

Dan confirmed that the authoritative date should be the **PNG revision date from Git history**, rather than the event date printed inside the artwork or filesystem modification time. This audit applies that rule to both older and newer displayed dates. Existing month-only labels count as matches at month precision; four of the eight compliant pages match exactly to the day, and four match by month.

## Coverage and verification

- Built and scanned **49 routes** from revision `e6f5677446900aab03218e5280edefe1e01cae1e`.
- Fetched all **49 live routes**, followed same-site navigation, and found no additional live-only routes. All displayed date labels and linked PNG paths agree with the local build.
- Verified live/local SHA-256 equality for **22 PNGs and 22 displayed WebPs** on the labeled pages. These checks establish deployed-file parity; they do not establish that a WebP is a fresh rendering of its PNG.
- **13 generic Last Updated pages = 8 matches + 5 mismatches + 0 unverified.**
- **9 other semantic date pages = 8 Replay data updated + 1 Research updated.** These are not counted as compliant or noncompliant with the PNG rule.
- **27 remaining routes = 16 undated Guild Raid infographic routes + 10 other pages/hubs + 1 redirect.**
- Used commit timestamps in `America/Los_Angeles`. Followed byte-identical copies/renames to the preceding content revision. Git's first addition is the earliest available repository date, not proof of the original artwork authoring date.
- No website source, artwork, commit, push, or deployment was changed. The new local skill and these audit documents are the deliverables.

Machine-readable route, commit, and asset evidence: [date-audit-2026-10-13-evidence.json](date-audit-2026-10-13-evidence.json).

## Five mismatches

| Page | Current displayed date | PNG revision date | Evidence and interpretation |
| --- | --- | --- | --- |
| [Campaign Event](https://terminusmaximus.com/campaign-event/) | Sept 6, 2026 | **October 11, 2026** | `campaign-event.png`, `dcf2df79`, “CE Guide.” The printed Oct 15 is the event date. The label is stale. |
| [HRE](https://terminusmaximus.com/hre/) | Sept 6, 2026 | **October 12, 2026** | `hre.png`, `88fdfb32`, “HRE Guide.” The printed Oct 18 is the event date. The label is stale. |
| [Farsight LRE](https://terminusmaximus.com/lre/farsight/) | October 7, 2026 | **May 30, 2026** | `farsight-lre.png` was copied unchanged from `lre.png` on June 1 (`C100`, `6af06ae`). Its content entered Git May 30 (`7d601b2f`). October 7 reflects the LRE page update. |
| [Lysander LRE](https://terminusmaximus.com/lre/lysander/) | October 7, 2026 | **July 26, 2026** | `lysander-lre.png`, `9e859ca1`, “revised s106 and lysander assets.” October 7 reflects the LRE page update. |
| [Uthar LRE](https://terminusmaximus.com/lre/uthar/) | October 7, 2026 | **September 9, 2026** | `uthar-lre.png`, `745f0105`, “Sekehtar Uthar LRE.” October 7 reflects the LRE page update. |

The three LRE labels were changed in the October 7 “LRE glow up” commit `c00e0cd7`. Their page dates are evidence of real page work, but they are not PNG revision dates. Under the agreed rule they are mismatches; this does not mean the planner content is stale. A separate page/planner date would preserve that useful distinction.

Correction locations: `src/pages/campaign-event.astro:10`, `src/pages/hre.astro:10`, and `src/pages/lre/{farsight,lysander,uthar}.astro:9`. For a direct PNG-date correction, use the full dates in the table. Farsight's May 30 date means its earliest tracked artwork revision, not a newly verified original creation date.

## Eight compliant pages

| Page | Displayed date | PNG revision date | Precision | Commit |
| --- | --- | --- | --- | --- |
| [Beginner Guide](https://terminusmaximus.com/beginner-guide/) | June 2026 | June 4, 2026 | Month | `e9d939e5` |
| [Elite Campaigns](https://terminusmaximus.com/elite-campaigns/) | July 2026 | July 8, 2026 | Month | `2bf9344c` |
| [Guild Raid Boss Meta](https://terminusmaximus.com/guild-raid/boss-meta/) | September 25, 2026 | September 25, 2026 | Day | `8d37761f` |
| [Guild War Attack](https://terminusmaximus.com/guild-wars/attack/) | Sept 2026 | September 12, 2026 | Month | `f5087d43` |
| [Guild War Defend](https://terminusmaximus.com/guild-wars/defend/) | Sept 2026 | September 13, 2026 | Month | `27e70d03` |
| [Incursion / MoW](https://terminusmaximus.com/incursion-mow/) | September 23, 2026 | September 23, 2026 | Day | `44097643` |
| [Fabius Bile LRE](https://terminusmaximus.com/lre/fabius/) | October 5, 2026 | October 5, 2026 | Day | `3cf365ba` |
| [Lucius LRE](https://terminusmaximus.com/lre/lucius/) | June 23, 2026 | June 23, 2026 | Day | `323bc2d2` |

The four month-only labels are consistent, but less precise than the others. Full month names and full Git-backed dates would make the site uniform without changing the underlying date rule. Lucius is still a generated, reachable route, so it is included even though it is absent from the main discovery catalog.

## Nine pages requiring a date-meaning decision

| Page | Current label | PNG revision date | PNG commit |
| --- | --- | --- | --- |
| [Indomitus](https://terminusmaximus.com/campaigns/indomitus/) | Replay data updated: August 12, 2026 | August 4, 2026 | `8c28ff64` |
| [Indomitus Mirror](https://terminusmaximus.com/campaigns/indomitus-mirror/) | Replay data updated: August 6, 2026 | August 5, 2026 | `f785c0cf` |
| [Fall of Cadia](https://terminusmaximus.com/campaigns/fall-of-cadia/) | Replay data updated: August 12, 2026 | September 16, 2026 | `8c657629` |
| [Fall of Cadia Mirror](https://terminusmaximus.com/campaigns/fall-of-cadia-mirror/) | Replay data updated: August 12, 2026 | August 10, 2026 | `7f4614d0` |
| [Octarius](https://terminusmaximus.com/campaigns/octarius/) | Replay data updated: August 15, 2026 | August 15, 2026 | `b368e777` |
| [Octarius Mirror](https://terminusmaximus.com/campaigns/octarius-mirror/) | Replay data updated: August 19, 2026 | August 17, 2026 | `f59ca5ef` |
| [Saim-Hann](https://terminusmaximus.com/campaigns/saim-hann/) | Replay data updated: August 19, 2026 | August 19, 2026 | `5f900418` |
| [Saim-Hann Mirror](https://terminusmaximus.com/campaigns/saim-hann-mirror/) | Replay data updated: August 23, 2026 | September 16, 2026 | `8c657629` |
| [Biovore](https://terminusmaximus.com/incursion-mow/biovore/) | Research updated: September 20, 2026 | September 23, 2026 | `44097643` |

Recommended treatment: preserve each replay/research label and add **Infographic updated: Month D, YYYY** by the featured artwork. A shared date happening to match, as on Octarius and Saim-Hann, does not make replay and artwork dates interchangeable. This audit records their displayed values; it does not certify the underlying replay/research freshness.

Campaign labels come from `CampaignHero.astro` and campaign replay JSON. The PNG paths come from `src/data/campaigns/campaignCatalog.ts`. Biovore's explicit research label comes from `IncursionGuidePage.astro` and `src/data/incursion/biovore.ts`. These fields should not be overwritten with PNG dates.

## Pages without update labels

**16 Guild Raid routes have full-size infographic links but no update label:** `/guild-raid/s097/` through `/guild-raid/s111/` (15 season guides) and `/guild-raid/next-season/` (one preview). Most season pages contain multiple PNGs, so adding one page date requires a policy choice. Prefer dates per infographic if these routes join the skill's scope; a single maximum date can hide older images. Their individual PNG dates were not audited because there is no displayed freshness label to compare.

The other 10 undated routes are `/`, `/about/`, `/campaigns/`, `/events/`, `/feedback/`, `/guild-raid/`, `/guild-raid/archive/`, `/guild-wars/`, `/lre/`, and `/replay-library/`. The homepage shows featured infographic previews linking to their guide pages, but has no update label of its own. The remaining route, `/event-campaign/`, redirects to `/campaign-event` and is not an additional guide.

## Skill created and validation

Created `/Users/danfoster01/.codex/skills/update_the_update_date/` with `SKILL.md`, UI metadata, and a reusable read-only `scripts/audit_dates.py` helper. It retains the exact requested underscore name and records the agreed Git-date rule. Audit requests produce findings; authorized correction requests can change unambiguous local labels. Replay/research policy remains open.

The helper was run against the complete live site. A temporary test repository verified identical-copy history, month-precision comparisons, and refusal to mark an uncommitted PNG compliant. The website built successfully; two existing Season 103 replay-ID warnings were unrelated to this audit. The standard skill validator rejects underscores in names; the exact user-requested name was preserved, and the remaining structure was checked using a temporary copy with only its name normalized for validation.

Suggested decisions before standardizing the site:

1. Use **Infographic updated** consistently for PNG dates and display full month/day/year values.
2. Preserve replay/research dates and add the infographic date beside them.
3. Preserve October 7 as an explicitly named LRE page/planner update if desired, while showing the older artwork date separately.
4. Decide whether the 16 undated Guild Raid routes should enter scope, and whether to use one label per infographic.

These are recommendations, not yet implemented site changes.
