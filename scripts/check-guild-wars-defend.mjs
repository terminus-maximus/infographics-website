import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { readReport, fraction } from './import-guild-wars.mjs';
import { normalizeDefendReport } from './import-guild-wars-defend.mjs';
import { percent, ratio } from '../src/lib/guildWarsFormat.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => readFileSync(resolve(root, file), 'utf8');
const dataText = read('src/data/guild-wars/defenders.json'), data = JSON.parse(dataText);
const meta = JSON.parse(read('src/data/guild-wars/defend-editorial.json'));
const attackMeta = JSON.parse(read('src/data/guild-wars/editorial.json'));
const page = read('dist/guild-wars/defend/index.html');
const attack = read('dist/guild-wars/attack/index.html');
const landing = read('dist/guild-wars/index.html'), home = read('dist/index.html');
const all = (html, re) => [...html.matchAll(re)];
const strip = html => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
assert(page.includes(meta.title) && page.includes(meta.description));
assert.equal(data.units['mow:death_crawler_01'].name, 'PBC');
assert(!page.includes('Foetid Bloat-Drone'));
assert(page.includes('rel="canonical" href="https://terminusmaximus.com/guild-wars/defend/"'));
assert(!/Heroes exactly|Complete Team exactly|Hard Maps|Popular flex options/.test(page));
assert.equal(all(page, /Team Tips coming soon/g).length, 10);
assert.equal(data.teams.length, 10);
assert.equal(new Set(data.teams.flatMap(t => t.heroes)).size, 50);
assert.equal(data.teams.reduce((n, t) => n + t.attempts, 0), 3494);
assert.deepEqual(data.teams.map(t => t.id), ['D1', 'D2', 'D4', 'D5', 'D3', 'D6', 'D7', 'D8', 'D9', 'D10']);
assert.equal(data.teams.find(t => t.id === 'D7').failureRate, 42 / 195);
assert.equal(data.teams.find(t => t.id === 'D7').medsUp.failureRate, 34 / 133);
assert(!/\/Users\/|file:\/\/|entry_id|player_id|war_id|source_url|snapshot_id|portrait_source|[√�]/.test(dataText + page), 'Private/unneeded fields or broken text');
for (const [, src] of all(page, /<img[^>]*src="([^"]+)"/g)) assert(existsSync(resolve(root, `public${src}`)), `Missing image ${src}`);
for (const path of Object.values(meta.infographic).filter(v => typeof v === 'string')) assert(existsSync(resolve(root, `public${path}`)));

for (const [index, team] of data.teams.entries()) {
  const editorial = meta.teams.find(t => t.id === team.id);
  const start = page.indexOf(`id="${editorial.anchor}"`);
  const next = index < 9 ? meta.teams.find(t => t.id === data.teams[index + 1].id).anchor : null;
  const section = page.slice(start, next ? page.indexOf(`id="${next}"`) : page.indexOf('</main>'));
  assert(start > 0 && page.includes(`href="#${editorial.anchor}"`));
  assert.equal(team.heroes.length, 5);
  assert.equal(team.attempts, team.failures + team.clears);
  assert.equal(team.failureRate, fraction(team.failures, team.attempts));
  const grid = section.match(/<dl class="rate-grid"[^>]*>([\s\S]*?)<\/dl>/)[1];
  assert.equal(all(grid, /<dt\b/g).length, 3);
  assert(strip(grid).includes(percent(team.failureRate)) && strip(grid).includes(ratio(team.failures, team.attempts)));
  assert(strip(grid).includes(percent(team.medsUp.failureRate)) && strip(grid).includes(ratio(team.medsUp.failures, team.medsUp.attempts)));
  const tiers = [...team.tiers].sort((a, b) => a.tier - b.tier);
  const commonTier = [...tiers].sort((a, b) => b.attempts - a.attempts || a.tier - b.tier)[0];
  assert(strip(grid).includes(`BF${commonTier.tier} ${percent(commonTier.share)}`));
  const core = section.match(/<div class="core-lineup"[^>]*>([\s\S]*?)<\/div>/)[1];
  assert.deepEqual(all(core, /data-unit-id="([^"]+)"/g).map(([, id]) => id), editorial.heroes);
  const usage = section.match(/<ul class="usage-options"[^>]*>([\s\S]*?)<\/ul>/)[1];
  const options = team.mows.filter(m => m.share >= .05);
  assert.deepEqual(all(usage, /data-unit-id="([^"]+)"/g).map(([, id]) => id), options.map(m => m.unit));
  for (const option of options) {
    assert.equal(option.share, fraction(option.attempts, team.mowOccurrences));
    assert(strip(usage).includes(percent(option.share)));
  }
  assert.equal(team.mows.reduce((n, m) => n + m.attempts, team.unknownMows), team.mowOccurrences);
  const tables = all(section, /<tbody[^>]*>([\s\S]*?)<\/tbody>/g);
  assert.equal(tables.length, 2);
  const counterRows = all(tables[0][1], /<tr\b[^>]*>([\s\S]*?)<\/tr>/g);
  assert.equal(counterRows.length, 10);
  for (const [i, counter] of team.counters.entries()) {
    if (i) assert(team.counters[i - 1].clears >= counter.clears, 'Counter clear-count order');
    const row = counterRows[i][0];
    assert(row.includes(`data-counter-id="${counter.id}"`));
    const linked = attackMeta.teams.find(t => t.id === counter.id);
    assert(row.includes(`href="/guild-wars/attack/#${linked.anchor}"`));
    assert(attack.includes(`id="${linked.anchor}"`));
    assert.equal(counter.perfectPerAttempt, fraction(counter.perfect, counter.attempts));
    assert.equal(counter.perfectPerClear, fraction(counter.perfect, counter.clears));
    assert.deepEqual(all(row, /<td[^>]*>([\s\S]*?)<\/td>/g).map(([, cell]) => strip(cell)), [
      `${percent(counter.clearRate)} ${ratio(counter.clears, counter.attempts)}`,
      `${percent(counter.medsUp.clearRate)} ${ratio(counter.medsUp.clears, counter.medsUp.attempts)}`,
      `${percent(counter.perfectPerAttempt)} ${ratio(counter.perfect, counter.attempts)}`,
      `${percent(counter.perfectPerClear)} ${ratio(counter.perfect, counter.clears)}`,
    ]);
  }
  const tierRows = all(tables[1][1], /<tr\b[^>]*>([\s\S]*?)<\/tr>/g);
  assert.equal(tierRows.length, 5);
  for (const key of ['attempts', 'failures', 'clears', 'perfect', 'withDeaths']) {
    assert.equal(tiers.reduce((n, t) => n + t[key], 0), team[key]);
    assert.equal(tiers.reduce((n, t) => n + t.medsUp[key], 0), team.medsUp[key]);
  }
  for (const [i, tier] of tiers.entries()) {
    const row = tierRows[i][0];
    assert(row.includes(`data-tier="${tier.tier}"`));
    assert.equal(tier.share, fraction(tier.attempts, team.attempts));
    assert.equal(tier.medsUp.failureRate, fraction(tier.medsUp.failures, tier.medsUp.attempts));
    assert.deepEqual(all(row, /<td[^>]*>([\s\S]*?)<\/td>/g).map(([, cell]) => strip(cell)), [
      `${percent(tier.share)} ${ratio(tier.attempts, team.attempts)} attempts`,
      `${percent(tier.failureRate)} ${ratio(tier.failures, tier.attempts)} failures / attempts`,
      `${percent(tier.medsUp.failureRate)} ${ratio(tier.medsUp.failures, tier.medsUp.attempts)} failures / Meds Up attempts`,
    ]);
  }
}
const noData = data.teams.flatMap(t => t.counters).filter(c => c.evidence === 'No data');
assert.equal(noData.length, 1);
assert.equal(noData[0].clearRate, null);
assert.equal(percent(noData[0].clearRate), '—');
assert.equal(percent(0), '0.0%');
const methods = page.slice(page.indexOf('<details class="methods-definitions"'), page.indexOf('<nav class="panel team-jump-nav"'));
assert.deepEqual(all(methods, /<summary[^>]*>(.*?)<\/summary>/g).map(([, heading]) => heading), ['Methods &amp; Definitions', 'Criteria', 'Data Sources', 'Metrics Explained', 'Methodology']);
assert.deepEqual(all(landing, /class="card" href="([^"]+)"/g).map(([, href]) => href), ['/guild-wars/attack/', '/guild-wars/defend/']);
const homeWars = home.match(/<h2[^>]*>Guild Wars<\/h2>([\s\S]*?)<\/section>/)[1];
assert.deepEqual(all(homeWars, /class="card" href="([^"]+)"/g).slice(0, 2).map(([, href]) => href), ['/guild-wars/attack/', '/guild-wars/defend/']);
const menu = home.match(/id="guild-wars-menu"[^>]*>([\s\S]*?)<\/div>/)[1];
assert.deepEqual(all(menu, /href="([^"]+)"/g).map(([, href]) => href), ['/guild-wars/attack/', '/guild-wars/defend/']);
assert(attack.includes('data-recommendation-route="/guild-wars/defend/"'));
assert(!page.includes('data-recommendation-route="/guild-wars/defend/"'));
if (process.argv[2]) {
  const sourcePath = resolve(process.argv[2]);
  const reportDir = sourcePath.endsWith('.json') ? resolve(dirname(sourcePath), '..') : dirname(sourcePath);
  assert.deepEqual(data, await normalizeDefendReport(readReport(sourcePath), resolve(reportDir, 'extraction/exports/attacks.jsonl.gz')));
}
console.log('Defend checks passed: 10 teams, 100 linked counters with four rates, 50 Battlefield/Medicae rows, usage cutoffs, all navigation placements and source reconciliation when supplied.');
