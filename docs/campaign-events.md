# Campaign Event guides

The hub is `/campaign-event/`; six static guides live at `/campaign-event/{slug}/`. The hub, Events page, and related CE links use the alphabetical catalog in `src/data/campaign-events/catalog.ts`. CE Guides lives inside Menu, between Campaign Guides and Guild Raid, with AdMech, Tyranids, and Explore All Guides linking to the hub. The homepage features three standard cards: AdMech CE, Tyranids CE, and Explore All CE with the overview graphic. Individual guide cards on the homepage and in More to Explore have a thumbnail, short gold title, and three required-hero portraits. The CE overview keeps all six expanded cards.

## Maintaining content

- `src/data/campaign-events/required-heroes.csv` owns all Lowest Seen and Safe Bet ranks and active/passive levels for 30 heroes: three required heroes and two supports per event. Keep the column headers. Blank values stay blank; never fill them from an older research estimate.
- `guides.json` retains the research, individual replay builds, provenance, support eligibility, and rewards. The original evidence is preserved even when maintained guide values differ. Keep the original five-hero configurations together. Tyranids’ six-hero community recommendation is an explicitly labelled support pool.
- The legacy research field `recommendation.relic` names the event's final Mythic upgrade reward, not equipment used by the team. Keep it in the imported record, but do not display it as a team requirement; the correctly labelled item appears in Rewards.
- `presentation.ts` contains concise player-facing team summaries and Battle Tips. Each summary beneath the investment table draws only on tips that apply to the five Lowest Seen heroes; keep alternate-team tactics in their own context. Update it when a support pair or strategy changes. Numerical tables come from the CSV, not this prose.
- Artwork uses `public/images/ce-{slug}.png`, `public/images/web/ce-{slug}.webp`, and `public/images/thumbnails/ce-{slug}-thumb.png`.
- Faction icons were copied from the existing local campaign-event research asset library. Character, ability, and rank icons reuse the website’s existing assets.
- Reward equipment and upgrade icons in `public/images/campaign-events/rewards/` are original assets copied from `LocalDatabase/research/campaign-events/assets/`. `reward-icons.json` maps the localized reward names using that project's `analysis.json` and `assets.json` (game version 1.43.130). Chest rewards reuse character portraits.
- `snapshot.updatedAt` in `guides.json` is the content revision shown on the guides. The overview retains its PNG revision date through the existing site component.

The shared layout renders the infographic, maintained team targets, alternate E30 builds, earlier-stage replays, support tiers, battle tips, rewards, and collapsed credits. QA/test-server footage stays labelled. The UI does not repeat per-field provenance links, but those remain in the data. Current pages are indexable and included in the discovery catalog; a local build does not publish them.

Each individual CE guide ends with one Related Guides section: the CE overview first, then the other five CE guides in alphabetical order. These pages omit More to Explore and the duplicate CE link list. Other site pages retain their existing discovery sections.

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
