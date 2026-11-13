# Game update profiles: production 1.44

Daras (`/heroes/daras/`) and Boudicari (`/incursion-mow/boudicari/`) now use the same **production 1.44.88** imports as the rest of the roster. The former 1.44.120 reference payload and importer have been removed. See the [full live-data audit](game-data-1.44-live-audit.md).

## Data ownership

`src/data/heroes/reference.json` contains all 120 heroes; `src/data/incursion/machine-reference.json` contains all 12 Machines of War. These exports use the live LocalDatabase catalog, localization, calculation helpers and native artwork, with matching source hashes. Shared poison constants now resolve from the production configuration. There is no version-specific gameplay overlay.

`src/data/updates/profile-additions.json` contains only Dan's November 9 editorial instructions: Daras remains Pending in all rating categories with his approved assessment; Boudicari keeps two stars, his verdict, Chaos eligibility and Passive investment. The review date remains November 9. Production build provenance is separate from an editorial review or an event availability date.

`src/lib/game-update-profiles.mjs` joins those editorial fields to canonical live reference records, portraits, relics and guide relationships. The scoring roster remains 119 assessed records, with Daras added as Pending: 120 rendered heroes, 111 ranked and 9 Pending. The current Overall release is `2026-11-13-live-144`; the published November Top 10 edition remains frozen.

Daras retains the standard Mythic wings / Adamantine II default, separate ability levels 1–60 and no assigned Relic. Boudicari uses the standard Active/Passive/Mythic controls and promotion scaling. Artwork is exported losslessly from the production app and checked by source/output hashes and decoded RGBA equality. News, HRE and Replay Library portraits use the same live generation.

## Refresh order

First refresh LocalDatabase from the verified production app. Regenerate its Campaign Event package before site reward/artwork imports. From the website checkout, use the LocalDatabase virtual environment for Python commands that require UnityPy/Pillow:

```sh
../LocalDatabase/.venv/bin/python scripts/hero-reference.py
../LocalDatabase/.venv/bin/python scripts/hero-profile-assets.py
../LocalDatabase/.venv/bin/python scripts/hero-relics.py
../LocalDatabase/.venv/bin/python scripts/mow-reference.py
../LocalDatabase/.venv/bin/python scripts/game-artwork.py
../LocalDatabase/.venv/bin/python scripts/hero-round-portraits.py
python3 scripts/campaign-event-reference.py
python3 scripts/incursion-reference.py
npm run import:lre -- ../LocalDatabase/data/processed/lre/index.json
python3 scripts/import-heroes.py
npm run check:game-data
npm run check:update-144
npm run check:heroes
npm run check:machines
npm run check
npm run build
node scripts/check-heroes.mjs --built
node scripts/check-machines.mjs --built
npm run check:campaign-events
```

A future build changes the reviewed source guards deliberately. Compare raid encounter fingerprints before changing a season binding. Refresh required-hero bonus evidence in a new Overall release when Campaign/Event Campaign membership changes; do not manufacture new performance ratings or overwrite a published monthly edition. Prebuild now rejects mixed current source versions and restored preview dependencies.
