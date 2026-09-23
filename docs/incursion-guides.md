# Incursion guides

`src/pages/incursion-mow/[machine].astro` builds the guides registered in
`src/data/incursion/index.ts`. Add a typed `IncursionGuide` data file and register
it there to create the next machine page and its landing-page link. The parent
hub lives at `src/pages/incursion-mow/index.astro`, preserving `/incursion-mow`.
Guides with an infographic also enter the shared `graphics.ts` discovery catalog
automatically, making them candidates for More to Explore and including them in
the home/events listings. More to Explore chooses a random subset on each page
load, so catalog membership does not mean appearing on every visit.

The shared layout uses the existing site Layout, Header, Footer, CampaignHero,
RequiredHeroIcons, Lexend typography, Campaign card patterns, and canonical
`characterReferences` registry. The guide matches the Campaign dark palette:
`#121212` page and inset cards, `#1e1e1e` panels, `#333` borders, and `#d4af37`
gold accents. Its header follows the Campaign title/subtitle/update pattern,
with the infographic and then the table of contents. On the Incursion landing
page, machine-specific guide links appear beneath the featured infographic.

## Final infographic

The finished artwork is configured in `src/data/incursion/biovore.ts`:

```ts
infographic: {
  src: "/images/web/mow-biovore.webp",
  fullSizeSrc: "/images/mow-biovore.png",
  thumbnailSrc: "/images/thumbnails/mow-biovore-thumb.png",
  width: 700,
  height: 391,
  alt: "Biovore Incursion guide with Chaos team cores, flex heroes, tier caps, and shard rewards",
},
```

The page displays the WebP and links to the full-resolution PNG, preserving the
existing infographic analytics convention. Social metadata uses the WebP too.
The Incursion landing-page entry uses the thumbnail. All three assets are
user-supplied files under `public/`; no image generation or conversion is needed.
Future machine guides without an infographic retain the placeholder state.

## Research provenance

Primary curated source, read before implementation:

`/Users/danfoster01/Documents/Campaign YouTube/campaign-video-research/research/incursion_creator_review_2026-09-20/`

- `report.md`: Biovore creator sections, coverage and limitations.
- `transcript_review_notes.json`: Caoryn's two guides and cpunerd's three
  lower-investment guides; power-up choices and team roles.
- `visual_review_ledger.json`: identity and review context for representative sources.

Discovery source:

`/Users/danfoster01/Documents/Campaign YouTube/campaign-video-research/research/incursion_discovery_2026-09-19/`

- `report.md`: discovery coverage and stable-creator counting.
- `discovery_inventory.json`: source IDs, URLs, publisher titles and upload dates.

Creator review supersedes discovery hypotheses. In particular, Ouchkabibbles'
Tier 13 attribution comes from the review; the discovery metadata did not yet
establish the numbered Mythic tier. No new video review or production replay
acceptance is claimed by this website change.

| Strategy | Main evidence | Qualification |
| --- | --- | --- |
| Summoner | Caoryn: `SIF__S0dwHw`, `BYp_nE9I3_0`; same five across 30 result panels | Core heroes: Rotbone/Abraxas/Yazaghor. Caoryn's engine is Abraxas/Yazaghor/Ahriman, with Rotbone and Archimatos alongside it. Both guides combine edited branches. Maladus/Wrask appear in the other documented approaches. |
| Melee / Sustain | cpunerd's 20 Mythic clips (representative `xLHhLaEoo7g`); Ouchkabibbles' 14 clips (`V9NHID-f8rU`, `Uvznm9T_lqI`); Painhawk `vVEoIz7AihI` | Khârn/Maladus/Rotbone occurs across three creators, one finale-only. Abaddon is cpunerd's persistent fourth. Corrodius occurs in 13/14 Ouchkabibbles clips, not all 14. |
| Lower Investment | cpunerd: `AAXe3KLclM8`, `YI66ISIfgm8`, `1yFYrkoSlBM` | Rare/T12 selected routes; T10 ends during battle 9. Wrask is regular at T12. Demonstrated restrictions are not tested minimum costs. |

The page surfaces seven representative videos, including timestamp links for
Caoryn's Lifesteal and cpunerd's T12 Extra Hits. Forty uploads count as four
creators, never forty independent votes. Research dates and upload dates are
distinct. No ranks or ability thresholds are recommended. Sacrificial characters
are not promoted to investment targets. Publisher-attributed power-ups are
labelled as such.

## Tier caps and shard rewards

The optional `tierRewards` guide data renders through `TierCapsRewards.astro`
between Rules for Success and the creator evidence section, with a matching
table-of-contents link. Biovore's 14 rows are transcribed from the user-supplied
`/Users/danfoster01/Desktop/Screenshot 2026-09-23 at 3.56.04 PM.png`.
Rewards are retained exactly, including Mythic shard labels for tiers 13–14.
The cap badges match the existing rank registry: Iron I at tiers 1–2, Bronze I
at 3–4, Silver I at 5–6, Gold I at 7–9, Diamond III at 10–12, and Adamantine II
at 13–14. The shared Campaign `RankBadge` component supplies icons and alt text.
The screenshot itself is not shipped as a page asset.

## Validation

Run `npm run build` and `npm run astro -- check`. Preview
`/incursion-mow/biovore` at desktop and narrow mobile widths. Check the landing
page link, section anchors, native details disclosures, portrait loading, single
H1, canonical metadata, and absence of horizontal overflow. No new client-side
JavaScript or replay database is needed by the guide.

First-pass validation on September 23, 2026: production build passed (47 pages).
Visual checks at 1280, 768, 390, and 320 pixels found no horizontal overflow;
native details, section links, and the landing-page entry worked. Existing
Campaign cards retained their dark styling and portrait layout. Production HTML
checks passed for image paths/alt text, local routes, unique IDs, a single H1,
canonical metadata, and all seven linked videos against the research inventory.
`astro check` reports the same 61 errors and eight hints as an isolated copy of
the unchanged HEAD revision; this change adds no diagnostics.

## Files added or changed

- `src/pages/incursion-mow/[machine].astro`: reusable static route.
- `src/pages/incursion-mow/index.astro`: parent hub and entry links to registered machine guides (moved from `src/pages/incursion-mow.astro`).
- `src/data/graphics.ts`: illustrated machine guides registered in the shared discovery catalog.
- `src/data/incursion/biovore.ts`: recommendations and representative evidence.
- `src/data/incursion/types.ts`: guide data contract using canonical character IDs.
- `src/data/incursion/index.ts`: machine registry.
- `src/components/incursion/IncursionGuidePage.astro`: shared page layout.
- `src/components/incursion/StrategyCard.astro`: core/flex rosters and play pattern.
- `src/components/incursion/PowerUpPriorities.astro`: archetype comparisons.
- `src/components/incursion/ResearchEvidence.astro`: creator cards and disclosures.
- `src/components/incursion/TierCapsRewards.astro`: rank caps and initial-clear/raid rewards.
- `src/components/FeaturedInfographic.astro`: placeholder and final-image states.
- `src/components/FeaturedInfographicPage.astro`: optional machine-guide slot.
- `src/components/campaign/CampaignHero.astro`: optional update label and theme
  variables with existing defaults.
- `src/components/campaign/RequiredHeroIcons.astro`: optional labels, wrapping,
  sizes, and colors with existing defaults.
- `src/data/campaigns/characters.json`: fixes Khârn's corrupted full-name encoding.
- `src/styles/incursion-guide.css`: Campaign-matched presentation and responsive layout.
- `docs/incursion-guides.md`: this implementation and provenance record.
