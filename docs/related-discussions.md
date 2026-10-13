# Related Discussions

Confirmed Reddit discussions are maintained in `src/data/relatedDiscussions.json`. `posts` contains publication timestamps, labels, titles, and canonical URLs. `pages` maps each canonical route to explicitly reviewed post IDs. Update this data for future additions; page-local `resources` arrays are reserved for other resources.

`RelatedDiscussions.astro` is rendered before Related Guides by the shared `RecommendationSections.astro`. It deduplicates post IDs, sorts by publication timestamp descending, and displays at most five. Pages without confirmed assignments render no discussion section. Labels use posting dates in America/Los_Angeles; HRE labels also identify the character.

## October 13, 2026 application

- Applied the [initial audit](reddit-related-links-2026-10-13.md): **43 additions**, retaining all 15 existing discussion links, for **58 links across 36 pages** (51 distinct submissions).
- Replaced the existing Reddit resource blocks with the shared Related Discussions section and standardized their date labels.
- Kept the original audit and post evidence as a pre-change snapshot. The [application validation](reddit-related-links-2026-10-13-applied.json) records the rendered checks.
- Kept Guild War inline community citations unchanged.
- No specific Biovore post was found, so that page has no discussion section.
- Validation covers the local build; it does not verify the deployed site.

## Ambiguous matches for Dan to review

These five page/post associations have **not** been applied. Authorship and dates are verified; topic relevance is the open question.

### Guild Raid Boss Meta

The two explicit Boss Meta guide posts from September and July 2026 have been added. Decide whether the earlier general raid-meta overviews belong here as historical discussions:

| Posted | Candidate | Why review is needed |
| --- | --- | --- |
| Apr 15, 2025 | [Raid Meta, April 2025](https://www.reddit.com/r/WH40KTacticus/comments/1jzw9ml/raid_meta_april_2025/) | Broad raid-meta overview; confirm its content fits the current boss-by-boss guide. |
| Jan 27, 2025 | [Raid Meta — Overview & Best Teams, according to PoH Word Bearers](https://www.reddit.com/r/WH40KTacticus/comments/1ibdnnb/raid_meta_overview_best_teams_according_to_poh/) | Earlier PoH overview; confirm it is useful history for this page's topic. |
| Dec 9, 2024 | [Guild Raid Meta, December 2024](https://www.reddit.com/r/WH40KTacticus/comments/1haefd7/guild_raid_meta_december_2024_according_to_poh/) | Earlier PoH framework; same relevance question. |
| Sept 16, 2024 | [Guild Raid Meta, Season 57](https://www.reddit.com/r/WH40KTacticus/comments/1fibqh1/guild_raid_meta_season_57_according_to_poh_word/) | Season-labelled historical meta overview; confirm it belongs with Boss Meta rather than a season guide. |

If all four qualify, the newest three would join the two confirmed 2026 discussions; the September 2024 post would remain outside the five-link cap.

### Next Season (currently Season 112)

[Guild Raid Guide Season 111 — who has missed MAGNUS?](https://www.reddit.com/r/WH40KTacticus/comments/1wxjgky/infographic_guild_raid_guide_season_111_who_has/) — posted **Oct 4, 2026**.

This is linked on the Season 111 page. Its fourth image previews Season 112, but the post explicitly says the lineup was provisional pending the patch. Decide whether that preview is useful on the rolling Next Season page. No link has been added there, and the target season must be rechecked before any later approval is applied.
