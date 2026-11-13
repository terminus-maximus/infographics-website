# Campaign Event guides

**November 13 live-data refresh.** All seven guides now use production **1.44.88**: 231 Extremis stage rules, eligibility, shard farms, chest tracks and equipment rewards were rebuilt from live data. Blood Angels no longer carries preview-configuration warnings. Its Lowest Seen and Safe Bet gaps remain evidence gaps. Maintained investments and every observed clear are preserved. The historical sections below retain their original dates. [Audit and validation](game-data-1.44-live-audit.md).

The hub is `/campaign-event/`; seven static guides live at `/campaign-event/{slug}/`. The hub, Events page, and related CE links use the alphabetical catalog in `src/data/campaign-events/catalog.ts`. CE Guides lives inside Menu, between Campaign Guides and Guild Raid, with AdMech, Blood Angels, Tyranids, and Explore All Guides linking to the hub. The homepage features three standard cards: Blood Angels CE, Tyranids CE, and Explore All CE with the overview graphic. Individual guide cards on the homepage and in More to Explore have a thumbnail, short gold title, and three required-hero portraits. The CE overview keeps all seven expanded cards.

## Maintaining content

- `src/data/campaign-events/required-heroes.csv` owns all Lowest Seen and Safe Bet ranks and active/passive levels for 35 heroes: three required heroes and two supports per event. Keep the column headers. Blank values stay blank; never fill them from an older research estimate.
- `guides.json` retains the research, individual replay builds, provenance, support eligibility, and rewards. The original evidence is preserved even when maintained guide values differ. Keep the original five-hero configurations together. Tyranids’ six-hero community recommendation is an explicitly labelled support pool.
- The legacy research field `recommendation.relic` names the event's final Mythic upgrade reward, not equipment used by the team. Keep it in the imported record, but do not display it as a team requirement; the correctly labelled item appears in Rewards.
- `presentation.ts` contains concise player-facing team summaries and Battle Tips. Each summary beneath the investment table draws only on tips that apply to the five Lowest Seen heroes; keep alternate-team tactics in their own context. Update it when a support pair or strategy changes. Numerical tables come from the CSV, not this prose.
- Artwork uses `public/images/ce-{slug}.png`, `public/images/web/ce-{slug}.webp`, and `public/images/thumbnails/ce-{slug}-thumb.png`.
- The hub and individual guides follow the existing guide-page preview standard: centered WebP images with `width: 100%`, `max-width: 700px`, and automatic height. This matches the 700-pixel-wide preview assets, avoids desktop upscaling, and lets previews shrink on mobile. Clicking the image or full-size link opens the original PNG.
- Faction icons use `/images/faction-clear/{factionId}.webp`. This shared library contains all 23 factions, converted losslessly from `Tacticus/Infographics/Icons/Faction Clear` with original dimensions and transparency. The current Campaign Event pages use 13 of these icons. The matching Game-style library is `/images/faction-game/`, using the same faction IDs; see `docs/hero-guides.md` for source and conversion details. Character, ability, and rank icons reuse the website’s existing assets.
- Reward equipment and upgrade icons in `public/images/campaign-events/rewards/` are original assets copied from `LocalDatabase/research/campaign-events/assets/`. `reward-icons.json` maps the localized reward names using that project's `analysis.json` and `assets.json` (game version 1.43.130). Chest rewards reuse character portraits.
- `snapshot.updatedAt` in `guides.json` is the content revision shown on the guides. The overview retains its PNG revision date through the existing site component.
- When new evidence replaces a headline team, retain the old build in `research.e30Teams` and `research.builds`, and list its ID in `research.previousLowestSeenRecordIds`. It renders first under Alternate Options with a Previous Lowest Seen label. Set the guide's `evidenceUpdatedAt` when the table has newer evidence than the infographic; the caption links readers to the updated table while the artwork keeps its actual revision date.

The shared layout renders the infographic, maintained team targets, alternate E30 builds, earlier-stage replays, support tiers, battle tips, rewards, and collapsed credits. QA/test-server footage stays labelled. The UI does not repeat per-field provenance links, but those remain in the data. Current pages are indexable and included in the discovery catalog; a local build does not publish them.

Each individual CE guide ends with one Related Guides section: the CE overview first, then the other six CE guides in alphabetical order. These pages omit More to Explore and the duplicate CE link list. Other site pages retain their existing discovery sections.

## Verification

Run `npm run build` followed by `npm run check:campaign-events`. The check preserves the research project’s data tests and verifies the built pages, all image paths, five maintained heroes per guide, navigation ordering, anchors, and discovery integration.

For review: `npm run dev -- --host 127.0.0.1 --port 4324`, then open `/campaign-event/`. Check narrow and wide layouts, dropdown keyboard handling, full-size artwork, replay links, and expandable details.

### Final review — October 15, 2026

- All six guides passed. All 180 Lowest Seen / Safe Bet rank and ability values match the maintained CSV and final artwork, including the approved Pestillian correction below.
- Checked the displayed stats, team sizes, and destinations of all 25 alternate/replay cards. All 21 reviewed video clears remain accessible from a card or the main team link. All nine unique YouTube videos returned valid public metadata. QA/test-server labels, T’au's ordinary E24 victory, and Tyranids' six-hero support pool retain their proper distinctions.
- Main team replay links now prefer the recorded battle/result timestamp over the earlier team-profile timestamp. Original research observations remain unchanged.
- Verified all shard stages, chest totals/repeats, equipment milestones, and final upgrades against LocalDatabase. All 16 reward asset hashes match the original game assets; team, ability, rank, reward, and related-guide images loaded successfully in the browser.
- Each guide has exactly the CE overview plus the other five CEs alphabetically, with no self-link, duplicate CE list, or More to Explore section. Other site discovery sections remain intact.
- Tested phone layouts at effective CSS widths of 291 and 341 pixels, and desktop at 1280 pixels. No horizontal overflow or clipped cards/tables. Replay disclosures and the CE submenu work with keyboard controls; Escape closes the menu.
- `npm run build` (55 pages), `npm run check:campaign-events`, and `git diff --check` pass. The CE check now compares every value in the correct investment column and protects replay destinations and CE-only related guides.

Public Reddit report pages were available through web retrieval after direct automated requests were blocked. The Discord recommendation link resolves to Discord; viewing the message still depends on the reader's login and server access. These are the supplied community source links, not newly published messages.

## Artwork reconciliation — October 15, 2026

The six supplied infographics were compared visually with all 180 maintained rank and ability values. Dan's corrected AdMech PNG, WebP, and thumbnail now show Khârn at **55/55**, matching the website. The final review also found Pestillian's Safe Bet at **35/35** in the artwork versus **33/33** in the CSV. Dan explicitly selected **35/35** on October 15; the maintained CSV and webpage now match the artwork. No artwork edits were made by this review. Older `ce-admech 2` assets are not linked by these pages.

The T’au guide deliberately retains the maintained Xybia D1 value. The original QA replay observation preserves D2, with the creator's D1 report in its build notes. Do not overwrite the original replay observation. Keep raw unordered ability pairs unassigned in alternate builds.

Production deployment has not been performed by this integration.

## Lower-investment E30 updates — November 7, 2026

Both new submissions replace the complete Lowest Seen team. Each guide now has four alternate cards: the previous benchmark first, followed by all three existing alternatives. Existing research builds, Safe Bet values, and the other four guides are preserved.

| Guide | Source | Lowest Seen team (rank, active/passive) |
| --- | --- | --- |
| Death Guard (Sisters vs Death Guard) | [cpunerd / Kharnage walkthrough](https://starlit-blini-47a3c3.netlify.app/) · [E30 replay](https://tacticus-raidman.com/public/replays/4dc8cb1b7a2248d91f17bdbdd1c964e22b5f6fc2d5fdeee07b87cecb0f4bb045) | Vindicta D3 50/50; Isabella D3 44/50; Roswitha G1 48/35; Celestine G1 35/35; Helbrecht D3 44/50 |
| Tyranids | [MtZ3r0's six-image clear report](https://www.reddit.com/r/WH40KTacticus/comments/1x83ctp/tyranids_ce_extremis_30_cleared/) | Bellator D3 50/36; Incisus D3 45/44; Titus G2 41/41; Dante D3 44/53; Mephiston D3 44/50 |

The Death Guard walkthrough labels E30 and reports three medals plus lightning. The Raidman replay was inspected through its final move: Mortarion is defeated and a victory is recorded. The replay identifies cpunerd (kharnage), game version 1.43.94.5464; no QA label is shown. Rank icons and abilities match the walkthrough's E30 roster. The earlier QA Godswyl replay remains a separate alternative. The previous ForgottenSaber / Hyojin recommendation retains its original investment and attribution.

The Tyranids gallery shows the final Hive Tyrant stage with three medals, followed by profiles for Titus, Incisus, Bellator, Dante and Mephiston. The screenshots establish the values; the author's report associates those five with the clear. No replay is supplied, so the page labels it Player report. The later D1 Lucien / second-crown edit does not supply a complete team and is not folded into the benchmark. The author's southwest-corner advice answers an E24 question and is not presented as an E30 tactic. Caoryn's previous E30 replay remains the first alternate, with its original build and result timestamp.

The supplied PNG/WebP artwork is unchanged. Both captions explicitly identify the newer team evidence and link to the maintained tables. Existing Safe Bet targets are retained, including Roswitha's D3 46/50 recommendation; these are editorial targets, not a field-by-field maximum of reported builds.

Validation: the 180-page build and `npm run check:campaign-events` pass. Checks cover all ten submitted hero profiles, source links, first-alternate ordering and retention of all existing cards. A comparison against the prior revision confirms every existing research build and Safe Bet value is unchanged. Browser review at 1280px, 390px and 320px found no horizontal overflow, missing team images or console errors. `git -c core.whitespace=cr-at-eol diff --check` passes with the existing CSV line endings. Changes are local; no deployment was performed.


## Blood Angels / Armageddon launch preview — November 9, 2026

Added `/campaign-event/blood-angels/` using the shared CE template, with the supplied PNG, WebP and thumbnail. Discovery, the Events hub, homepage, menu, sitemap and related-guide lists include the seventh guide. The overview uses the refreshed artwork. Its eighth “What if?” panel is explicitly speculative and does not create another route.

The required trio is Snotflogga, Tanksmasha and Zapspitta. The supplied Safe Bet targets are D3 50/50, D3 1/36 and D3 50/50 respectively, with Gulgortz A2 60/60 and Gibbascrapz D3 50/50 as planned supports. All fifteen Lowest Seen fields remain null. `evidenceStatus: awaiting-clears` and `plannedSupportHeroIds` support launch previews without inventing a build, source, observed clear or S-tier placement. These CSV targets remain provisional. Snappawrecka is the third eligible support. Remove the awaiting-clears status and provide a complete qualified E30 build when real evidence establishes a headline team.

Rules and rewards were checked against `LocalDatabase/research/blood-angels-ce/marketing-gameconfig.json`, **Marketing / QA 1.44.120**, event `eventCampaign7`. Configuration SHA-256: `f5f8dda968d7ef0a71d7c1a156948d0ee03126bbbde3bdb89a0ad6ff2614023a`. The 29 pointers in that research directory's `source-records.json` matched the configuration. The website labels this material as a preview, not verified live behavior. The shared roster snapshot remains 1.43.130; all six existing Orks are eligible in the 1.44 event configuration.

- 33 Extremis stages: 30 main plus 3B, 13B and 25B. Caps are Epic E1–11, Legendary E12–22 and Mythic E23–30, including the corresponding branches. The expandable table retains each deployment limit and lightning timer. E23 and E26 require the trio; E24 permits five heroes.
- Regular/Mythic shard farms: Mataneo E6/E25, Lucien E11/E26, Nicodemus E17/E27, Cezare E22/E28, Mephiston E24/E29.
- Progress chests: 290 Mephiston shards across 14 initial chests through 2,200 points, then 10 per 500 points.
- E25B gold milestone: Relic Power Fist, absent from the supplied infographic. E30 gold milestone: Vitarus, Mephiston's relic. E30 repeatable drop: Ancient Inscription. The two new relic icons were copied from the research assets; Ancient Inscription reuses the existing matching asset.
- E30's configured boss is Yarrick, supported by a Malleus Rocket Launcher and mixed Imperial units. Blood Angels is the guide/reward-faction label; Armageddon is the in-game campaign name.

Dan supplied corrected Blood Angels artwork on November 9: the full-size PNG, 700 × 392 WebP preview and 600 × 336 PNG thumbnail all show “Blood Angels CE Guide” in the top banner. The existing page and discovery paths use these corrected assets; all three were visually checked against the new full-size artwork and copied into the rebuilt site. Dan subsequently authorized a local commit of the two full-size PNGs: `b2b061dae7dcdb6aaab660275a2a507cba25b509`, committed Nov 9, 2026 at 14:55:43 America/Los_Angeles. Both page dates now read **Last updated on Nov 9, 2026** and cite that commit.

Validation: the 189-page build and Campaign Event checks pass. The check covers all 35 maintained heroes, blank preview thresholds, provisional targets, preview rewards, navigation, related guides, image paths and preserved replay destinations. The prior six guide records and all their CSV values are unchanged. Browser checks covered desktop and phone layouts, stage-table expansion, reward and hero images, and console errors. Only the two approved full-size PNGs have been committed locally. The page and date updates remain uncommitted; no push or deployment was performed.
