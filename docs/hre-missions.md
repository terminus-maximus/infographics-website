# Hero Release Event missions

The `/hre/` page displays Daras Carrow’s 20 missions and final bonus between
Basics and Related Discussions. The requirements match the existing infographic.
Native game icons distinguish objective types and token-based modes. Cards show
only their objectives and rewards. A plus/minus research panel appears only once
editorial research exists for that mission. The cards are rendered at build time
and work without JavaScript.

## Game data

The source is production **1.44.88**, configuration hash
`9bdc534d9850e21cd133d4951d9e46b6`. LocalDatabase follows the event’s `questId`
through successor IDs in the `hre2` quest group. It exports 21 missions, 42
objectives, requirements, rewards, native IDs, source pointers and localized help.
The 20 regular missions each award 100 Dark Blessings; the bonus awards one
Requisition Order. Quest XP remains available in the data export.

The November 22, 2026 date is an announced date, recorded separately from the
embedded configuration; no precise start time is inferred. Bundled English
mission help remains in the data export but is not rendered on the page.

Rebuild the backend from frozen evidence, then import it:

```sh
cd /Users/danfoster01/Documents/Websites/LocalDatabase
.venv/bin/python scripts/hre_quests.py
.venv/bin/python -m unittest discover -s tests -p test_hre_quests.py -v

cd /Users/danfoster01/Documents/Websites/terminusmaximus
npm run import:hre
npm run build
npm run check:hre
```

Use `scripts/hre_quests.py --capture-source` in LocalDatabase to capture again
from the production source selected by its raw manifest. It verifies source
hashes and the featured hero before replacing frozen evidence; changed previous
snapshots are archived. An event slot reused for another hero fails explicitly.
This is an independent HRE workflow; the character/LRE refresh does not
automatically recapture it.

The importer writes `src/data/hre/daras.json` as a build input and icons under
`public/images/hre/missions/`. Do not copy the mission JSON into `public/` or
expose a download link on the site.
It reuses the site’s canonical Daras portrait and damage stat icon. Ordinary
site builds need neither LocalDatabase nor an installed game.

## Adding research

Edit **`src/data/hre/research.ts`**. Keys are native mission IDs (`hre2_q1`
through `hre2_q20`, then `hre2_bonus`). This file is never overwritten by the
importer. A populated entry adds a “Research & tips” panel with nested expandable
sections below the mission objectives and rewards. Each section supports a title,
paragraphs and labeled links. An empty entry renders no panel or expansion control.

```ts
// Shape only; replace with reviewed findings and actual source URLs.
hre2_q6: {
  sections: [{
    title: 'Healing routes',
    paragraphs: ['Add the verified strategy here.'],
    links: [{ label: 'Supporting replay', href: 'https://…' }],
  }],
}
```

Keep gameplay research separate from game-owned objective help. Link directly
to an individual card with `/hre/#mission-6` or `/hre/#mission-bonus`.

The November 15, 2026 research review adds tips to missions 7, 8, 11, 15 and 18,
with short notes for 12 and 13. Reddit discussions and timestamped YouTube guides
support the methods. These are player reports from earlier HREs, matched to the
Daras objectives; passive ability-damage counting remains explicitly qualified.

## Verification

The initial implementation passed the full site build and Astro checks. The
HRE check validates section placement, all 21 cards and 42 objectives, icon
paths, the bonus reward and the absence of a public JSON download. Backend tests
check infographic targets, native chain ordering, cycles, changed event identity,
localization and the queryable SQLite export. Browser QA covers two columns at
desktop size and one column on mobile. The initial native objective-help panels
were removed at Dan’s request; expansions are reserved for completed research.
