# News page conventions

News lives at `/news/`; each update has its own page under `/news/game-update-<version>/`.
Register articles in `src/data/news.ts` to reuse their card on the News landing page, homepage, and discovery catalog.

Use `src/components/news/NewsIcons.astro` and `src/data/news/icons.ts` for article artwork:

- Heroes use actual round portrait artwork in WebP, resolved through the existing hero portrait catalog. Link to an existing Hero Guide when available.
- New hero round portraits belong in `public/images/hero-round/`; Machine of War round portraits belong in `public/images/machines/round/`. Preserve transparency when converting original artwork to WebP.
- Factions use `public/images/faction-game/`, with small labels beneath the icons. Use the game’s faction membership, including Adeptus Astartes where eligible.
- Campaign Event required heroes use labeled round portraits.
- Character Quest rows show the hero, eligible faction icons, enemy faction icons, and material artwork with names. Omit stage, rarity and drop-chance annotations.
- Home Screen Events have a reward artwork column immediately before the reward descriptions. Shared reward icons live in `public/images/news/rewards/`; reuse existing material and relic WebPs.
- Blessed Requisition pools show six round unit portraits, with accessible names and hover titles instead of visible name lists.
- Use “Guild Raid Rotation” as the section heading, positioned immediately after Character Quests and before Home Screen Events. Use the existing Replay Library boss WebPs and omit the closing season carried in from the preceding update. Keep Guild War in its own section after Blessed Requisitions.
- Survival eligibility uses faction icons and the “No Machines of War” rule; omit the extra Adeptus Astartes roster and summoned-Guardsmen explanation.
- Omit Crusade coverage.

Keep event dates in UTC, distinguish event endings from the article’s coverage window, and keep the infographic’s full-resolution link. Public copy must not include internal report provenance, local file links, or tooling details.

Write direct, authoritative player-facing copy. Remove reporting methodology, repetitive caveats, and unnecessary explanations of what is excluded. Keep actionable rules such as roster eligibility, event deadlines, and reward-tier requirements. Present editorial evaluations as “My take” and distinguish genuinely unconfirmed information once, without repeating the qualification throughout a section.

After changes, run `npm run build`, confirm all referenced assets and links exist, and inspect the portrait/faction groups and horizontally scrollable tables on desktop and mobile.
