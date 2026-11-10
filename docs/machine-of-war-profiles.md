# Machine of War profiles

The November 9 Game Version 1.44.120 addition brings the hub to 12 profiles,
including Boudicari with Dan's two-star rating. Its version-specific import and
editorial ownership are documented in [Game update profiles](game-update-profiles.md).
The original 11-profile implementation below remains the base import.

Implemented locally on November 9, 2026. The Incursion hub stays at
`/incursion-mow/`. All 11 released MoWs have profiles beneath it. Biovore,
Plagueburst Crawler and Z’Kar retain their existing URLs, featured unlock
infographics, strategies, power-ups, rewards, stage tips and creator evidence.
Other machines have their identity, rating and abilities without an empty
unlock-guide placeholder. Header navigation, the hub and sitemap cover all 11.

## Sources and ownership

- `src/data/incursion/machine-profiles.json` owns the reviewed released roster,
  stable slugs, My Rating stars, verdicts and investment/unlock labels. All were
  visually transcribed from `public/images/incursion-mow.png`, revision October
  26, 2026. The explicit approved image hash prevents a later infographic
  replacement from silently carrying forward old ratings. Ratings use 1–5
  stars; a future explicitly unrated entry may use `null`. No composite,
  community or game-mode scores are calculated.
- `src/data/incursion/machine-reference.json` is generated from the production
  **1.43.130** LocalDatabase catalog, image manifest and original calculation
  helper. No preview/marketing build records are imported. Roster membership is
  an explicit reviewed list, not an automatic release-timestamp filter.
- `scripts/mow-reference.py` reads LocalDatabase without refreshing or modifying
  it. Source hashes and snapshot identity are retained. It copies 11 rectangle
  portraits and 33 ability icons to `public/images/machines/` as lossless WebP,
  verifying source hashes, dimensions and decoded RGBA pixels.
- The three authored unlock-guide data files and original infographic assets
  are unchanged. Their date labels still use the shared Git-derived revision
  registry. The rating date refers separately to the overview infographic.

## Ability calculations and controls

Regular abilities default to level 60 at Mythic wings. Both MoW button abilities
live in game data's ordered `activeAbilities` list. Website labels follow the
user's infographic: **Active** is the primary ability; **Passive** is the
secondary/free ability. The latter is still player-activated in the game.

The importer evaluates all levels 1–60 at all 20 unlocked MoW progression steps
using LocalDatabase's existing `ability_values` and `render` functions. There
are **26,400 stored regular ability level/context combinations**. MoW ability
multipliers vary within rarity, unlike hero ability multipliers; consequently
the values are keyed by progression index, never just rarity. Only source
variables marked for scaling receive the multiplier and source helper rounding.
Descriptions, cooldowns, munition costs, summon stats and unscaled percentages
come from the game templates. No new combat simulation is implied.

Active and Passive sliders remain independent when rarity/stars change. The
rarity picker preserves stars if that combination exists, otherwise selecting
the highest valid promotion of the requested rarity. As on Hero Guides, a
selected level above that rarity's cap remains an explicitly labelled preview.
Reset restores Mythic wings and both sliders to 60. Default descriptions and
ratings are rendered in HTML even without JavaScript; controls appear only
after initialization.

### Mythic mapping

The production source has four Mythic promotions, at indices 16–19 and stars
11–14, and four entries per Mythic ability. The unlock requirement is 16.
Entries map in order to those promotions and retain their original values;
the regular MoW ability multiplier is **not** applied again. Ten abilities have
10%, 13%, 16%, 20%; Exorcist's shield has 25%, 32.5%, 40%, 50%.

This ordered mapping is inferred from the game configuration and corroborated
by the published [Malleus Mythic promotion table](https://tacticus.wiki.gg/wiki/Malleus_Rocket_Launcher),
which explicitly pairs stars 11/12/13/14 with 10/13/16/20 percent. The
[1.31 patch notes](https://tacticus.wiki.gg/wiki/Patch_Notes_1.31) describe Mythic
abilities unlocking automatically and scaling with promotions. These are
cross-checks of the mapping; all shipped values and descriptions come from the
local game snapshot. This is not independent live-battle validation of every
conditional effect. The older LocalDatabase preview leaves this mapping
unevaluated; its original records have not been changed.

The Mythic card follows the shared promotion picker, has no 1–60 slider, and
shows its unlock state below Mythic. Decimal percentages are preserved.

## Maintenance

```sh
npm run import:machines
npm run check:machines
npm run check:heroes
npm run build
node scripts/check-machines.mjs --built
```

For a future released MoW, review release availability and add its stable game
ID and slug explicitly to `machine-profiles.json`. A new source build requires
reviewing the importer's pinned version and progression/ability assumptions.
Do not include marketing-only records automatically. For a new infographic,
visually update the authored ratings and notes and approved PNG hash before
importing. The importer never invents or recalculates star ratings.

`IncursionGuidePage.astro` composes the profile with an optional registered
unlock guide. `MachineAbilities.astro` reuses Hero Guide pickers and artwork;
`machine-reference.mjs` renders precomputed values in both server and browser
contexts. `machine-profiles.css` scopes layout adjustments to these profiles.

## Verification

- Four focused tests cover within-rarity star scaling, independent level
  selection, Mythic unlocks/promotions, decimal preservation, valid rarity
  transitions, cap notices and every stored ability description.
- Built-page validation covers all 11 routes, 33 ability cards, 22 sliders,
  artwork hashes/paths, ratings, default state, canonicals, sitemap membership,
  duplicate IDs, local anchors, private-path exclusion and retained unlock-guide
  sections. It runs reference/asset checks in `prebuild` as well.
- Repeating the import changes no reference or artwork bytes.
- Browser checks cover independent Active/Passive sliders, star scaling within
  rarity, the Mythic lock below Mythic, Exorcist's 32.5% intermediate shield,
  reset, profiles with/without unlock guides, and the hub at narrow mobile and
  desktop widths. The checked layouts have no horizontal page overflow.
- The production build produces 188 pages. All 27 existing Hero Guide tests
  pass. `astro check` reports 66 existing errors; the new MoW files report no
  errors. The shared infographic component retains its pre-existing resource
  typing diagnostic.
