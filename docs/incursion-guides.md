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
Machine guides without an infographic begin with the table of contents and use
the guide's `updatedAt` date. They do not show an unfinished-art placeholder.
Infographic-backed pages retain their existing image-revision date behaviour.

## Z’Kar and Plagueburst Crawler (October 26, 2026)

The registered pages are `/incursion-mow/zkar/` and
`/incursion-mow/plagueburst-crawler/`. They reuse the Biovore page structure,
three strategy cards, hero portraits, power-up cards, rules, and creator evidence.
The existing hub lists both automatically; they link to each other and Biovore.
The supplied `mow-zkar` and `mow-pbc` asset sets are now registered: 700 × 392
WebPs on the guides and in social previews, full-size PNG links with the existing
analytics attributes, and 600 × 336 thumbnails on the Incursion hub, homepage,
and Events listing. Their catalog entries also make them eligible for More to
Explore via the corresponding WebPs. Artwork was not regenerated or edited.

Both supplied PNGs show matching 14-row tier-cap and shard-reward tables. These
were visually transcribed into `xenosTierRewards` and displayed through the same
table component used by Biovore. The earlier table-availability caveats have
been replaced with the supplied-artwork provenance.

The two new PNGs and the refreshed Incursion overview PNG are committed in
`8feacfb126a95f76984793c18e5b7de29a0dcfa1`. Their registry dates use that commit's
October 26, 2026 timestamp in America/Los_Angeles. All three headers now read
`Last updated on Oct 26, 2026`. See `docs/infographic-dates.md`.

Curated research directory:

`/Users/danfoster01/Documents/Campaign YouTube/campaign-video-research/research/xenos_incursion_2026-10-26/`

- `research_dossier.html` and `build_report.py`: synthesized conclusions and caveats.
- `video_source_ledger.json`, `fresh_visual_review.json`: inherited September review
  plus the fresh Caoryn Z’Kar and Enquiring Newt PBC review.
- `stage_advice_index.json`: 15 timestamped stage notes per track. Public wording
  is adapted in `xenos-stages.ts`; the source tier is explicit on each link.
- `discord_source_notes.json`, `web_source_ledger.json`: community reports and
  current mechanics references, with direct links retained in the guides.

Z’Kar covers 15 uploads from five creators. Caoryn's `AJpIaqgXnmE` shows
Re’vas/Aleph/Boss/Snot/Sho in all 15 result panels, but includes follow-up attempts
for stages 5 and 9. `Oo4XhkPoRBo` is the older Tier 10 comparison. Ten cpunerd
uploads contain nine distinct fights; the duplicated finale is not independent
evidence. Kaiser Arctan's `DhdHWVagHcI` is a 12-fight Tier 13 route with roster
rotation. AureLuck's `zikovHuKZv0` stops at an Uncommon unlock; Snorri's
`TJm3d4KXCTc` is a Tier 11 finale only.

PBC covers two uploads from two creators. Caoryn's `Ig0Wjv0H7D8` shows the
mechanical trio plus Calandis/Maugan across 15 Legendary result panels, including
an alternate stage 6 branch. Enquiring Newt's `PhSav7_wc3Q` shows the same organic
five across 20 fights on two Common routes and an unlock after Tier 2 battle 7.
Both videos are from March 2025. Snot/Gibba Mythic II and Grot-taunt advice are
later written reports, labelled separately instead of counted as reviewed videos.

Shared content in `xenos.ts` covers repair, summons, overwatch, run preservation,
and power-ups. Mechanical status, repairability from relics, contamination hexes,
and contagion auras remain distinct. Mythic relic effects are not assumed below
Mythic. The guides do not claim minimum ranks or that Sho's drones inherit his
Extra Hits buff. Their reward tables come from the new, machine-specific PNGs.

`StageTips.astro` adds a battle index and native disclosures, with four priority
maps expanded per guide. The optional research `reports` and `references` fields
render written community evidence and mechanics links. Biovore does not opt in
to these sections. `powerUps.comparisonLabel` keeps its Havoc label specific to
Biovore while the Xenos guides name their own options.

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

October 26, 2026 validation: production build passed (58 pages). Before/after
`astro check` each reported 66 existing errors, zero warnings, and eight hints;
the diagnostic lists are identical. Built HTML checks passed for both new guides,
Biovore, and the hub: single H1, unique IDs, valid section anchors and local
routes, present image assets and alt attributes, and canonical metadata. Each new
guide contains 15 battle disclosures. All linked gameplay video IDs are in the
review ledger. Browser checks found no horizontal overflow at 320, 390, 768,
and 1100 pixels for both new guides, or at 320 pixels for Biovore and the hub.
The Z’Kar three-hero and four-hero cards, PBC title, chapter disclosures, and
table-of-contents navigation were checked visually or interactively. No new
client-side JavaScript is needed for these sections.

Artwork integration validation on October 26: the 58-page build passed; the
type-check diagnostic list remained unchanged (66 existing errors, eight hints).
Both pages have the correct WebP, two tracked full-resolution PNG links, matching
social image metadata, and 14 reward rows. The home, Events, and Incursion hub
contain both thumbnails; More to Explore's candidate pool contains both WebPs.
Built asset bytes match the supplied files. Browser checks confirmed the artwork
and no horizontal overflow at 320/390 pixels. The four LRE checks and all 384
filter states passed after the shared date-renderer change.

Release validation on October 26: after committing the artwork and resolving
its three revision dates, all 30 infographic dates pass the local Git-history
audit. The temporary unverified-date renderer has been removed; the existing
strict committed-date contract is preserved. The 58-page production build and
all four LRE checks pass, with no new type-check diagnostics.

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
