import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { SITE, loadSeasonSource, sha256 } from './raid-season-source.mjs';
import { loadEvidenceOverrides } from './raid-season-overrides.mjs';
import { graphicEligible, selectionPolicyVersion } from '../src/lib/raidSeasonGuide.mjs';

const read = name => JSON.parse(readFileSync(resolve(SITE, name), 'utf8'));
const registry = read('src/data/guild-raid/season-sources.json');
for (const { season } of registry.seasons) {
  const { lineup } = loadSeasonSource(season, { frozen: true });
  const { overrides, overridesSha256 } = loadEvidenceOverrides(lineup);
  const prefix = `src/data/guild-raid/s${season}`;
  const lineupText = readFileSync(resolve(SITE, `${prefix}-lineup.json`), 'utf8');
  const saved = JSON.parse(lineupText);
  const guide = read(`${prefix}-guide.json`);
  const graphic = read(`public/data/guild-raid/s${season}-graphic-summary.json`);
  const same = (a, b, label) => { if (!isDeepStrictEqual(a, b)) throw new Error(`S${season}: stale ${label}; run build-raid-season.mjs`); };
  same(saved, lineup, 'LocalDatabase lineup');
  for (const key of ['season', 'startDate', 'status', 'config', 'source', 'loop']) same(guide[key], lineup[key], key);
  same(guide.provenance.lineupSha256, sha256(lineupText), 'lineup hash');
  same(guide.provenance.lineupSource, lineup.source, 'lineup provenance');
  same(guide.evidenceOverrides ?? null, overrides, 'evidence overrides');
  same(guide.provenance.evidenceOverridesSha256 ?? null, overridesSha256, 'evidence override hash');
  same(guide.provenance.policyVersion, selectionPolicyVersion(overrides), 'selection policy version');
  same(guide.slots.map(({ tier, rarity, boss, map }) => ({ tier, rarity, boss, map })),
    lineup.slots.map(({ tier, rarity, boss, map }) => ({ tier, rarity, boss, map })), 'guide encounters');
  for (const encounter of guide.slots) {
    const overridden = overrides?.encounters.some(o => o.tier === encounter.tier);
    for (const rec of encounter.recommendations) {
      same(rec.kind === 'cross-map', Boolean(overridden), 'cross-map exception scope');
      if (overridden) same(rec.tiers, [encounter.tier], 'cross-map source tier');
    }
  }
  same(graphic.provenance, guide.provenance, 'graphic provenance');
  same(graphic.bosses.map(b => b.tier), lineup.loop, 'graphic rotation');
  for (const boss of graphic.bosses) {
    const encounter = guide.slots.find(s => s.tier === boss.tier);
    same([boss.boss, boss.map], [encounter.boss, encounter.map], 'graphic encounter');
    same(boss.recommendations.map(({ archetypeIcon, ...rec }) => rec),
      encounter.recommendations.filter(graphicEligible).map(rec => ({
        archetype: rec.archetype, averageDamage: rec.average, sample: rec.sample, sourceTiers: rec.tiers, kind: rec.kind,
        ...(rec.kind === 'cross-map' ? { sourceMaps: rec.maps, sourceLabel: 'Other maps' } : {}),
      })), 'graphic recommendations');
  }
}
console.log(`Validated ${registry.seasons.length} pinned LocalDatabase raid season(s); no external database needed.`);
