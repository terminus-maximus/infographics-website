# Adding a Campaign Guide

Campaign spreadsheets are authoring inputs. The website must consume only the JSON produced by the Jupyter conversion pipeline.

## Data workflow

1. Maintain and review campaign data in Google Sheets.
2. Export the relevant sheets as CSV.
3. Run the Jupyter validation/conversion notebook outside this repository.
4. Copy the validated JSON outputs into `src/data/campaigns/`.
5. Add the guide content, page integration, and assets described below.
6. Run `npm run build` and review the generated campaign page.

Do not import campaign CSV files from website code or commit CSV exports as runtime data. CSV remains an input to the notebook; JSON is the website's runtime source of truth.

## Required JSON data

Each campaign needs:

- A campaign replay JSON file in `src/data/campaigns/`, following the structure of `indomitus_replays.json` or `indomitus-mirror.json`. It contains campaign metadata, Normal and Elite stage evidence, rosters, timestamps, and video metadata.
- Three campaign rows in `src/data/campaigns/required-recs.json` for the required heroes' rank, active ability, and passive ability recommendations.
- Equipment rows in `src/data/campaigns/equip_recs.json` for the required heroes' Normal and Elite equipment recommendations.

The shared files below only need updates when the new campaign introduces a character, rank, alias, or energy record that is not already present:

- `src/data/campaigns/characters.json`
- `src/data/campaigns/ranks.json`
- `src/data/campaigns/character_rank_energy.json`

Use the same campaign URL in `required-recs.json`, `equip_recs.json`, and the website route. The current convention omits the trailing slash in data URLs, for example `/campaigns/indomitus-mirror`.

## Guide content and page integration

1. Create a campaign guide-content file in `src/data/campaigns/`. Keep editorial prose, progression advice, hero explanations, difficult-stage strategy, and boss advice in TypeScript. Load structured required-hero recommendations through `getRequiredRecommendationsForCampaign()`.
2. Add the replay JSON import and validated campaign export in `src/lib/campaigns.ts`.
3. Create the campaign-specific guide component in `src/components/campaign/`.
4. Create the route at `src/pages/campaigns/<slug>/index.astro`, following one of the existing campaign pages.
5. Add page metadata and artwork paths to `src/data/campaigns/campaignCatalog.ts`.
6. Add the campaign card to `src/data/graphics.ts`. Required-hero portraits are derived from `required-recs.json` and `characters.json`.
7. Add the campaign link to the Campaign Guides submenu in `src/components/Header.astro`.

There is currently no separate campaign registry. The explicit entries above keep the two campaign-specific pages and their editorial content easy to follow.

## Images and assets

Add:

- The full-size infographic at `public/images/<slug>.png`.
- The web-optimized infographic at `public/images/web/<slug>.webp`.
- The campaign-card thumbnail at `public/images/thumbnails/<slug>-thumb.png`.
- Any missing hero portraits referenced by `characters.json` under `public/images/heroes/`.
- Any missing equipment icons referenced by `equip_recs.json` under `public/images/equipment/`.

Rank badges and equipment frames are shared assets and normally do not need campaign-specific additions.

## Final checks

- Search the campaign source for accidental `.csv` imports.
- Confirm the page displays the JSON rank, ability, and equipment targets.
- Confirm stage filters, replay links, roster ranks, and energy totals render correctly.
- Run `npm run build` and resolve any campaign-data or missing-asset error before publishing.
