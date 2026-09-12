import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { readReport, normalizeReport, fraction } from './import-guild-wars.mjs';
import { percent, ratio } from '../src/lib/guildWarsFormat.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => readFileSync(resolve(root, file), 'utf8');
const dataText = read('src/data/guild-wars/attackers.json');
const data = JSON.parse(dataText);
const editorial = JSON.parse(read('src/data/guild-wars/editorial.json'));
const page = read('dist/guild-wars/attack/index.html');
const landing = read('dist/guild-wars/index.html');
const strip = html => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const all = (html, regex) => [...html.matchAll(regex)];

assert.equal(percent(fraction(0, 0)), '—');
assert.equal(percent(fraction(0, 12)), '0.0%');
assert.equal(percent(fraction(1705, 2525)), '67.5%');
assert.equal(ratio(2808, 4010), '2,808 / 4,010');
assert.equal(data.teams.length, 10);
assert.equal(new Set(data.teams.flatMap(t => t.core)).size, 31);
assert.equal(all(page, /class="panel team-section"/g).length, 10);
assert.equal(all(landing, /class="card"/g).length, 1);
assert(landing.includes('href="/guild-wars/attack/"'));
assert(landing.includes('Guides to Guild Wars - both Attack and Defense, and Counters'));
assert(landing.includes('Guild War Top 10 Attackers based on meta performance'));
assert(!page.includes('class="outcomes"'));
assert(!/More individual flex options|No recorded buff|is provisional/.test(page));
assert(!/<summary[^>]*>Machine of War results/.test(page));
assert(page.includes('No Meds Buff'));
for (const [html, route] of [[landing, '/guild-wars/'], [page, '/guild-wars/attack/']]) {
  assert(html.includes(`rel="canonical" href="https://terminusmaximus.com${route}"`));
  assert(html.includes('data-ga4-nav-section="guild_wars"'));
  assert(!html.includes('aria-label="Breadcrumb"'));
  for (const [,src] of all(html, /<img[^>]*src="([^"]+)"/g)) assert(existsSync(resolve(root, `public${src}`)), `Missing image ${src}`);
}
assert.equal(data.units.missing_unknown.name, 'No MoW deployed');
assert.equal(data.units.missing_unknown.image, null);
assert.equal(data.units.worldKharn.name, 'Khârn');
assert.equal(data.units.deathRotbone.name, 'Rotbone');
assert(!/[√�]/.test(dataText));
assert(!/\/Users\/|file:\/\/|entry_id|player_id|war_id|source_url|assigned_distribution|boundary_alternatives|snapshot_sha256/.test(dataText + page + landing), 'Private or unneeded source fields leaked');
assert(!page.includes('id="report-data"'));
for (const path of Object.values(editorial.infographic).filter(v => typeof v === 'string')) assert(existsSync(resolve(root, `public${path}`)));
assert.equal(all(page, /data-ga4-infographic-open/g).length, 4); // Three links + shared analytics listener.
assert.equal(all(page, /Team use tips coming soon\./g).length, 10);
const methods = page.slice(page.indexOf('<details class="methods-definitions"'), page.indexOf('<nav class="panel team-jump-nav"'));
assert(methods, 'Missing Methods & Definitions disclosure');
assert(strip(methods).startsWith('Methods &amp; Definitions'));
assert.deepEqual(all(methods, /<details class="methods-section"[^>]*>\s*<summary[^>]*>(.*?)<\/summary>/g).map(([, heading]) => heading), ['Data Source', 'Metrics Explained', 'Methodology']);
assert(!/Methodology Notes|Methodology Explained|Coming soon/.test(methods));
assert(methods.includes('https://www.tacticus.xyz/'));
assert.equal(all(page, /Shares can add up to more than 100%/g).length, 1);
assert(!/class="scope"|class="usage-note"|Methodology notes coming soon\.|All \d characters included in every result below/.test(page));

for (const [index, meta] of editorial.teams.entries()) {
  const t = data.teams[index];
  assert.equal(t.id, meta.id);
  assert.deepEqual([...t.core].sort(), [...meta.core].sort());
  const start = page.indexOf(`id="${meta.anchor}"`);
  assert(start > 0 && page.includes(`href="#${meta.anchor}"`));
  const end = index < 9 ? page.indexOf(`id="${editorial.teams[index + 1].anchor}"`) : page.indexOf('</main>');
  const section = page.slice(start, end);
  const bodyText = strip(section);
  assert(bodyText.includes(meta.title));
  assert.equal(t.clears + t.failures, t.attempts);
  assert.equal(t.perfect + t.withDeaths, t.clears);
  assert.equal(t.clearRate, fraction(t.clears, t.attempts));
  assert.equal(t.metrics.perfect.denominator, t.clears);
  assert.equal(t.metrics.perfect.numerator, t.perfect);
  assert.equal(t.perfectPerAttempt, fraction(t.perfect, t.attempts));
  for (const metric of Object.values(t.metrics)) {
    assert.equal(metric.rate, fraction(metric.numerator, metric.denominator));
    assert(bodyText.includes(ratio(metric.numerator, metric.denominator)));
    assert(bodyText.includes(percent(metric.rate)));
  }
  for (const row of t.flex) assert.equal(row.share, row.attempts / t.attempts);
  assert.equal(t.flex.reduce((n,r) => n + r.attempts,0), (5-t.core.length)*t.attempts);
  const usageLists = all(section, /<ul class="usage-options"[^>]*>([\s\S]*?)<\/ul>/g);
  assert.equal(usageLists.length, 2);
  for (const [listIndex, candidates, minimum, limit] of [[0, t.flex, .038, 5], [1, t.mows.rows, .1, 3]]) {
    const displayed = all(usageLists[listIndex][1], /data-unit-id="([^"]+)"/g).map(([, id]) => id);
    const eligible = candidates.filter(row => row.share !== null && row.share >= minimum).slice(0, limit);
    assert.deepEqual(displayed, eligible.map(row => row.unit), `${meta.title} usage cutoff/order differs`);
    for (const row of eligible) {
      assert(strip(usageLists[listIndex][1]).includes(`${row.attempts.toLocaleString('en-US')} attacks`));
      assert(strip(usageLists[listIndex][1]).includes(percent(row.share)));
    }
  }
  const tables = all(section, /<tbody\b[^>]*>([\s\S]*?)<\/tbody>/g);
  assert.equal(tables.length, 3);
  for (const [tableIndex, key] of ['combinations', 'teamMows'].entries()) {
    const evidence = t[key];
    assert.equal(evidence.rows.length, Math.min(25, evidence.total));
    const rows = all(tables[tableIndex][1], /<tr\b[^>]*>([\s\S]*?)<\/tr>/g);
    assert.equal(rows.length, Math.min(5, evidence.total));
    for (const [i, row] of evidence.rows.slice(0, 5).entries()) {
      assert.equal(row.share, row.attempts / t.attempts);
      assert.equal(row.clears + row.failures, row.attempts);
      const cells = all(rows[i][1], /<td[^>]*>([\s\S]*?)<\/td>/g).map(([,html]) => strip(html));
      const numbers = key === 'teamMows' ? cells.slice(1) : cells;
      assert.deepEqual(numbers, [row.attempts.toLocaleString('en-US'), percent(row.share), row.clears.toLocaleString('en-US'), percent(row.clearRate), row.perfect.toLocaleString('en-US'), row.failures.toLocaleString('en-US')]);
      const ids = all(rows[i][1], /data-unit-id="([^"]+)"/g).map(([,id]) => id);
      const expected = key === 'mows' ? [row.unit] : [...meta.core, ...row.team.filter(id => !meta.core.includes(id)), ...(row.mow ? [row.mow] : [])];
      assert.deepEqual(ids, expected, 'Rendered lineup/support differs from normalized evidence');
    }
  }
  assert.equal(all(tables[2][1], /<tr\b[^>]*>/g).length, t.contexts.length);
}

// Frozen September 2026 regression examples supplied with the brief.
if (editorial.edition === 'September 2026') {
  const genes = data.teams[0], howl = data.teams[2];
  assert.deepEqual([genes.clears, genes.attempts, genes.perfect, genes.metrics.meds_up.numerator, genes.metrics.meds_up.denominator, genes.metrics.perfect_meds_up.numerator], [4010,4229,2808,2525,2692,1705]);
  assert.deepEqual(howl.flex.slice(0,3).map(r => [data.units[r.unit].name,r.attempts,r.share]), [['Khârn',1215,1215/2199],['Kariyan',1004,1004/2199],['Bellator',575,575/2199]]);
}

if (process.argv[2]) {
  const report = readReport(resolve(process.argv[2]));
  assert.deepEqual(normalizeReport(report), data, 'Generated dataset differs from the explicit accepted report');
  const bad = { ...report, cards: report.cards.slice(1) };
  assert.throws(() => normalizeReport(bad), /Editorial mapping required/);
  assert.throws(() => normalizeReport({ ...report, cards: [...report.cards, { ...report.cards[0], core_id: 'unexpected_core' }] }), /Editorial mapping required/);
  // Check exact co-occurrence and all row metrics directly against source records.
  for (const t of data.teams) {
    const raw = report.cards.find(c => c.core_id === t.id);
    for (const [key, sourceKey] of [['combinations','variants'],['mows','mows'],['teamMows','exact']]) {
      const identity = r => JSON.stringify([r.team || [], r.unit || '', r.mow || '']);
      const ordered = [...raw[sourceKey]].sort((a,b) => b.attacks-a.attacks || (b.clear_rate ?? -1)-(a.clear_rate ?? -1) || (identity(a)<identity(b)?-1:identity(a)>identity(b)?1:0));
      // Source team arrays are canonical. A tie uses unit, team, support; within each table this is the same ordering.
      for (const [i,row] of t[key].rows.entries()) {
        const source = ordered[i];
        assert.deepEqual([row.team,row.unit,row.mow,row.attempts,row.clears,row.failures,row.perfect,row.clearRate], [source.team,source.unit,source.mow,source.attacks,source.clears,source.failures,source.outcomes.Perfect,source.clear_rate]);
      }
    }
  }
  console.log('Accepted report reconciled; changed-core rejection and exact co-occurrence checks passed.');
}
console.log('Guild Wars checks passed: methods disclosure, flex/MoW cutoffs, 10 cores, 30 rendered tables, five-row lineup limits, counts, denominators, assets, and labels.');
