import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { buildSeasonGuide, parseCsv } from '../src/lib/raidSeasonGuide.mjs';
import { SITE, loadSeasonSource, sha256, writeOutputs } from './raid-season-source.mjs';

const { values: args } = parseArgs({ options: {
  season: { type: 'string', default: '114' }, master: { type: 'string' },
  'local-database': { type: 'string' }, frozen: { type: 'boolean', default: false },
  check: { type: 'boolean', default: false },
} });
const season = args.season;
if (!/^\d+$/.test(season)) throw new Error('Season must be numeric');
const { lineup, catalogText, snapshotRelativePath } = loadSeasonSource(season, {
  localDatabase: args['local-database'], frozen: args.frozen,
});
const masterPath = args.master || resolve(SITE, '../ReplayLibrary/data/replays_master.csv');
const master = readFileSync(masterPath, 'utf8');
const lineupText = JSON.stringify(lineup, null, 2) + '\n';
const guide = buildSeasonGuide(lineup, parseCsv(master));
const archetypeIcons = Object.fromEntries(JSON.parse(readFileSync(resolve(SITE, 'src/data/replay-library/team_archetype.json'), 'utf8')).map(r => [r.team_archetype, `/images/replay-library/heroes/${r.team_icon}.webp`]));
const guidePath = resolve(SITE, `src/data/guild-raid/s${season}-guide.json`);
const prior = existsSync(guidePath) ? JSON.parse(readFileSync(guidePath, 'utf8')) : null;
const unchanged = prior?.provenance?.masterSha256 === sha256(master) && prior?.provenance?.lineupSha256 === sha256(lineupText)
  && prior?.provenance?.policyVersion === 1 && JSON.stringify(prior.slots) === JSON.stringify(guide.slots);
guide.provenance = { generatedAt: unchanged ? prior.provenance.generatedAt : new Date().toISOString(),
  masterSha256: sha256(master), lineupSha256: sha256(lineupText), source: 'Reviewed Replay Library master',
  lineupSource: lineup.source, policyVersion: 1 };
const summary = {
  season: guide.season, provenance: guide.provenance, policy: guide.policy,
  note: 'Observed arithmetic means across archetype variants. Pooled tiers are raw observations, not normalized predictions. Carry the source-tier label into the graphic. Only samples of at least three replays appear here; smaller samples remain visible on the page.',
  bosses: guide.loop.map(tier => {
    const slot = guide.slots.find(s => s.tier === tier);
    return { tier, boss: slot.boss, map: slot.map, bossIcon: `/images/replay-library/bosses/${slot.boss.replaceAll(' ', '_')}.webp`, mapImage: `/images/replay-library/maps/${slot.map}.webp`,
      recommendations: slot.recommendations.filter(r => ['exact', 'pooled'].includes(r.kind) && r.sample >= 3).map(r => ({ archetype: r.archetype, archetypeIcon: archetypeIcons[r.archetype], averageDamage: r.average, sample: r.sample, sourceTiers: r.tiers, kind: r.kind })) };
  })
};
const outputs = {
  [resolve(SITE, snapshotRelativePath)]: catalogText,
  [resolve(SITE, `src/data/guild-raid/s${season}-lineup.json`)]: lineupText,
  [guidePath]: JSON.stringify(guide, null, 2) + '\n',
  [resolve(SITE, `public/data/guild-raid/s${season}-graphic-summary.json`)]: JSON.stringify(summary, null, 2) + '\n',
};
if (args.check) {
  for (const [path, expected] of Object.entries(outputs)) {
    if (!existsSync(path) || readFileSync(path, 'utf8') !== expected) throw new Error(`Generated file is stale: ${path}`);
  }
} else writeOutputs(outputs);
console.log(JSON.stringify({ season, eligible: guide.eligibleReplayCount, rejected: guide.rejected, slots: guide.slots.length,
  loop: summary.bosses.map(b => ({ tier: b.tier, boss: b.boss, teams: b.recommendations.map(r => `${r.archetype}: ${r.averageDamage} (${r.sample}, ${r.sourceTiers.join('/')})`) })) }, null, 2));
