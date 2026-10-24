# Infographic date audit — October 24, 2026

The final local build has **28 compliant evergreen infographic guides** across 56 routes. Each displayed date and wording matches the full PNG's committed content revision in America/Los_Angeles. Dates were not advanced merely because this audit ran.

| Change | Final label | Git evidence |
| --- | --- | --- |
| Boss Meta | Last updated on Oct 24, 2026 | `e0184bf309c11a39f2ff94792320d976f0c83bc8` — approved October PNG/WebP/thumbnail, committed locally for date provenance |
| Six individual Campaign Event guides: AdMech, Dark Angels, Death Guard, Sisters, Tau, Tyranids | Last updated on Oct 15, 2026 | `3bef96f5735844c939ca34d89f3dd2f758110dbb` — CE Extremis Guides launch |

The Campaign Event guides previously showed a separate “Guide updated” label in the image caption, sourced from the research snapshot. They now use `InfographicUpdated` in the page header and the shared PNG revision registry. The underlying research dates remain unchanged. The other 21 evergreen guide dates already complied and remain unchanged.

The 17 time-bound Guild Raid routes (Seasons 97–112 and next-season preview) remain undated by policy. Ten hubs/utilities have no date requirement; `/event-campaign/` is a redirect. All four active LRE roster labels match `characterBuild: 1.43.130` in their datasets and `src/data/lre/sources.json`; Lucius has no roster backend label.

The live pre-change scan covered all 56 routes. Today's corrections have only been verified in the local build; this report does not claim deployment parity after the edits. The date helper did not recognize the old CE caption wording, so those six pages were also inspected directly before standardization.

Evidence: [final local route/asset audit](date-audit-2026-10-24-evidence.json), [live pre-change snapshot](date-audit-2026-10-24-live-before.json).

Validation: production build; LRE layout, portraits, roster labels and 384 filter states; Campaign Event research/artwork/navigation checks; next-season routing checks; visual review of the Boss Meta date and the CE header and discussion section. The LRE check's obsolete “Other Resources” assertion was updated to verify the actual shared Related Discussions selection and ordering.

The combined Boss Meta release was rechecked against the approved frozen review: 24 teams and 195 exact-lineup replay examples, including five supplemental L1–L3 examples. Raw L4–M3 replay counts and damage statistics, hero/MoW icons, and queue order all match. The supplied graphic and replay-library export bytes are preserved.

Two pre-existing Season 103 build warnings remain: `Zz5kvJevkNM` and `vSD_4HZtQUQ` are absent from the Replay Library JSON. No changes were made to that historical guide. Nothing has been pushed as part of this refresh; the local preview is at `http://127.0.0.1:4323/`.
