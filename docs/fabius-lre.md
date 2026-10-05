# Fabius Bile LRE

The `/lre/fabius` page intentionally has no incoming navigation, landing-page, catalog, recommendation, or sitemap links. It uses `noindex, nofollow, noimageindex`. There is no sitemap generator in this repository. This is an unlisted public route, not access control. Keep it out of `graphics.ts`, `Header.astro`, the homepage and the LRE index until Dan explicitly requests discovery links. The supplied thumbnail is not registered as a card.

The page reuses `FeaturedInfographicPage` and `getLreBasicsContent` from Lysander. Its planner is placed after the basics using the optional `after-basics` slot. Event Overview stays visible; Event Goal through Long-Term Strategy are inside a native, initially collapsed More Event Details box, supplied through the optional `basicsDetailsContent` prop. Other pages retain their existing basics presentation. The optional `noIndex` prop defaults to false for all existing pages.

## Data boundary

Dan explicitly approved using the report's Fabius event requirements with **only the 1.42.166 character roster** on October 5, 2026. The 1.42 database does not include this event. The report's event requirements originate in 1.43.94; its local roster uses 1.42.166 character statistics. The dataset exports just the three track definitions and 117 local characters with their regular-state eligibility. Both active and passive abilities are unlocked; no relic effects are included. No Marketing roster, character detail panels, battle tables, coverage rankings, raw research evidence, local file paths or schedule metadata are shipped.

Most portraits reuse existing hero assets. Nubari (`astarEradicator`) is copied from the local report's round portraits because it has no entry in the site's existing portrait catalog.

The supplied artwork has differences from the approved report data: Alpha's enemy is labeled T-SONS in the artwork and Black Legion in the report; artwork callouts show Blast at 85 and Deep Strike at 100, while the report and artwork's top requirement boxes show 95 for each. The planner follows the approved report. The image files were supplied by Dan.

## Maintenance and verification

Import using `node scripts/import-fabius-lre.mjs /path/to/fabius-bile-lre16.html`. The importer accepts the report's local 1.42.166 snapshot and exports a minimal dataset to `src/data/lre/fabius.json`. Builds need only the committed data and assets.

Run `npm run build`, then `node scripts/check-fabius-lre.mjs`. Supplying the source HTML path to the check also reconciles every character and all 96 filter states against the local roster in the report. The check verifies all 15 individual pools, point totals, example intersections, assets, omitted sections, no-index metadata and absence of Fabius content across every other built page.

The planner applies AND logic to selected requirements, with track faction exclusions always applied. Each track is independent. Requirements display in descending point order. Clear resets one track; Reset all clears all three tracks. Matching-character lists show two portrait rows before scrolling. There is no character search or roster/build note in the visible planner. High Points Combinations considers at least two requirements and three characters, orders by bonus points then pool size, and shows up to 12 results. Combinations with ten or fewer eligible characters show portraits with names; larger pools use a text list. Applying a combination selects that track's requirements, keeps the other track selections, and focuses the selected track heading. Counts announce updates to assistive technology; controls remain disabled or hidden without JavaScript while the initial rosters and Alpha combinations remain visible.

Validation on October 5: all 49 pages build; all source reconciliation and unlisted-route checks pass. Browser checks cover desktop and narrow mobile layouts, portraits, keyboard checkbox selection, empty results, reset, track switching, combination application and focus. Follow-up checks verify the collapsed details and keyboard expansion, descending requirement points, two-row scrolling lists, and small-pool portraits in both the initial HTML and dynamically selected combination tracks. No browser errors or horizontal overflow were observed. The repository-wide Astro check reports 61 existing errors in shared/other site code; the new planner and route have no type errors. These checks were completed before deployment.

## Deployment policy

On October 5, Dan authorized normal publication through the public GitHub repository and the existing Cloudflare Pages deployment. Public source history is acceptable. The page must remain absent from Top Nav, the LRE index, the homepage, recommendations and all other site links until Dan explicitly requests promotion. Keep the no-index directive in place for this unlisted release.
