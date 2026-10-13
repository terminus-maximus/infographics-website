# Related Discussions

Confirmed Reddit discussions are maintained in `src/data/relatedDiscussions.json`. `posts` contains publication timestamps, labels, titles, and canonical URLs. `pages` maps each canonical route to explicitly reviewed post IDs. Update this data for future additions; page-local `resources` arrays are reserved for other resources.

`RelatedDiscussions.astro` is rendered before Related Guides by the shared `RecommendationSections.astro`. It excludes posts older than 18 calendar months and rejected page/post pairs, deduplicates post IDs, sorts by publication timestamp descending, and displays at most five. Pages without confirmed assignments render no discussion section. Labels use posting dates in America/Los_Angeles; HRE labels also identify the character.

## October 13, 2026 application

- Applied the [initial audit](reddit-related-links-2026-10-13.md): **43 additions**, retaining all 15 existing discussion links, for **58 links across 36 pages** (51 distinct submissions).
- Replaced the existing Reddit resource blocks with the shared Related Discussions section and standardized their date labels.
- Kept the original audit and post evidence as a pre-change snapshot. The [application validation](reddit-related-links-2026-10-13-applied.json) records the rendered checks.
- Kept Guild War inline community citations unchanged.
- No specific Biovore post was found, so that page has no discussion section.
- Validation covers the local build; it does not verify the deployed site.

## Age limit and closed candidates — October 13, 2026

Only discussions published within the last **18 calendar months** are eligible. The cutoff uses the run/build date in America/Los_Angeles, subtracts 18 months with month-end clamping, and includes posts published on the cutoff date. On October 13, 2026, that means **April 13, 2025 onward**. Publication dates, not dates of comments or events, determine age.

`src/data/relatedDiscussionPolicy.json` is the shared policy for the website and audit helper. The website enforces it at build time through `src/lib/relatedDiscussions.mjs`; the static output updates on the next build. The audit helper uses today's client date (or an explicit `--as-of` date), even when reading an older evidence snapshot. Apply eligibility before the newest-five selection, so an expired link never occupies a slot or appears as a review suggestion.

Dan abandoned all five initially ambiguous page/post matches. They are recorded as persistent rejections and must not be proposed again:

- Boss Meta: `1jzw9ml`, `1ibdnnb`, `1haefd7`, and `1fibqh1`.
- Next Season: `1wxjgky`. This is a rejected association only; the same post remains a confirmed discussion on the Season 111 page.

There are **no pending ambiguous matches** from the initial audit. Explicit rejections also cover candidates that have not yet aged out. The original dated audit and its evidence remain a historical snapshot, superseded by this policy for future selections.

All 58 published links across 36 pages remain within the age limit on October 13, 2026; the oldest is June 18, 2025. No existing published discussion needs removal today.

Validation: `node scripts/check-related-discussions.mjs`, the Python audit helper with `--as-of 2026-10-13`, and `npm run build`.
