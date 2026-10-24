import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { readReport, normalizeReport, fraction } from './import-guild-wars.mjs';
import { checkObserved } from './check-guild-wars-observed.mjs';
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
assert.equal(new Set(data.teams.flatMap(t => t.core)).size, data.teams.flatMap(t => t.core).length, 'Repeated core heroes');
assert.equal(all(page, /class="panel team-section"/g).length, 10);
assert.equal(all(landing, /class="card"/g).length, 2);
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
assert.equal(data.units.missing_unknown.name, 'MoW not recorded');
assert(!/Heroes exactly|Complete Team exactly|Flex combinations — any four of five|No MoW deployed/.test(page));
assert.equal(data.units.missing_unknown.image, null);
assert.equal(data.units.worldKharn.name, 'Khârn');
assert.equal(data.units.deathRotbone.name, 'Rotbone');
assert(!/[√�]/.test(dataText));
assert(!/\/Users\/|file:\/\/|entry_id|player_id|war_id|source_url|assigned_distribution|boundary_alternatives|snapshot_sha256/.test(dataText + page + landing), 'Private or unneeded source fields leaked');
assert(!page.includes('id="report-data"'));
for (const path of Object.values(editorial.infographic).filter(v => typeof v === 'string')) assert(existsSync(resolve(root, `public${path}`)));
assert.equal(all(page, /data-ga4-infographic-open/g).length, 4); // Three links + shared analytics listener.
assert.equal(all(page, /Team use tips coming soon\./g).length, editorial.teams.filter(team => !team.tips).length);
const methods = page.slice(page.indexOf('<details class="methods-definitions"'), page.indexOf('<nav class="panel team-jump-nav"'));
assert(methods, 'Missing Methods & Definitions disclosure');
assert(strip(methods).startsWith('Methods &amp; Definitions'));
assert.deepEqual(all(methods, /<details class="methods-section"[^>]*>\s*<summary[^>]*>(.*?)<\/summary>/g).map(([, heading]) => heading), ['Criteria', 'Data Sources', 'Metrics Explained', 'Methodology']);
assert(!/Methodology Notes|Methodology Explained|Coming soon/.test(methods));
assert(methods.includes('https://www.tacticus.xyz/'));
assert.equal(all(page, /Shares can add up to more than 100%/g).length, 1);
assert(!/class="scope"|class="usage-note"|Methodology notes coming soon\.|All \d characters included in every result below/.test(page));

for (const [index, meta] of editorial.teams.entries()) {
  const t = data.teams[index];
  assert.equal(t.id, meta.id);
  assert.deepEqual([...t.core].sort(), [...meta.core].sort());
  if (index) assert(data.teams[index - 1].clearRate >= t.clearRate, 'Attack win-rate order');
  const start = page.indexOf(`id="${meta.anchor}"`);
  assert(start > 0 && page.includes(`href="#${meta.anchor}"`));
  const end = index < 9 ? page.indexOf(`id="${editorial.teams[index + 1].anchor}"`) : page.indexOf('</main>');
  const section = page.slice(start, end);
  const bodyText = strip(section);
  assert(bodyText.includes(meta.title));
  const core = section.match(/<div class="core-lineup"[^>]*>([\s\S]*?)<\/div>/)[1];
  assert.deepEqual(all(core, /data-unit-id="([^"]+)"/g).map(([, id]) => id), meta.core, 'Core portrait order');
  const jump = page.match(new RegExp(`<a href="#${meta.anchor}"[^>]*>([\\s\\S]*?)<\\/a>`))[1];
  assert(jump.includes(`src="${data.units[meta.core[0]].image}"`), 'Captain portrait');
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
  for (const [listIndex, candidates, minimum, limit] of [[0, t.flexAnalysis?.flex || t.flex, .038, 5], [1, t.mows.rows, .1, 3]]) {
    const displayed = all(usageLists[listIndex][1], /data-unit-id="([^"]+)"/g).map(([, id]) => id);
    const eligible = candidates.filter(row => row.share !== null && row.share >= minimum).slice(0, limit);
    assert.deepEqual(displayed, eligible.map(row => row.unit), `${meta.title} usage cutoff/order differs`);
    for (const row of eligible) {
      assert(strip(usageLists[listIndex][1]).includes(`${row.attempts.toLocaleString('en-US')} attacks`));
      assert(strip(usageLists[listIndex][1]).includes(percent(row.share)));
    }
  }
  checkObserved(section, t.observed, meta.core, data.units);
  const tables = all(section, /<tbody\b[^>]*>([\s\S]*?)<\/tbody>/g);
  assert.equal(tables.length, 2);
  assert.equal(all(tables[1][1], /<tr\b[^>]*>/g).length, t.contexts.length);
  if (t.flexAnalysis) {
    const f = t.flexAnalysis;
    assert.equal(f.flex.reduce((n,r) => n+r.attempts,0), f.replacementAttempts);
    for (const row of f.flex) assert.equal(row.share,row.attempts/f.attempts);
    assert(bodyText.includes('Each attack counts once.'));
  }
}

// Accepted October V9: full-core counts and independent four-of-five cohorts.
if (editorial.edition === 'October 2026') {
  assert.equal(new Set(data.teams.flatMap(t => t.core)).size, 41);
  assert.deepEqual(data.scope, { seasons: [25, 26, 27], tiers: [4, 5], wars: 162, eligibleAttacks: 69521 });
  assert.deepEqual(data.teams.map(t => [t.clears, t.attempts]), [[2353,2473],[180,198],[813,897],[305,348],[2086,2381],[1416,1622],[330,388],[1855,2237],[814,1036],[1698,2204]]);
  assert.deepEqual(editorial.teams.filter((_, i) => data.teams[i].flexAnalysis).map(t => t.title), ['GSC', 'Blood Angels', 'Orks']);
  assert.equal(data.units['mow:death_crawler_01'].name, 'PBC');
  assert.equal(data.units.thousSekhetar.name, 'Sekhetar');
}

// September 12 refresh: independently verified raw death states, Medicae buffs and lineups.
// Evidence: V4 exports/validation.json and exports/core_win_metrics.csv.
if (editorial.edition === 'September 2026') {
  const genes = data.teams[0], howl = data.teams[2];
  assert.deepEqual([genes.clears, genes.attempts, genes.perfect, genes.metrics.meds_up.numerator, genes.metrics.meds_up.denominator, genes.metrics.perfect_meds_up.numerator], [2886,3033,2024,1846,1965,1237]);
  const blood = data.teams.find(t => t.core.includes('bloodDante'));
  assert.deepEqual([blood.clears,blood.attempts,blood.perfect,blood.metrics.meds_up.numerator,blood.metrics.meds_up.denominator,blood.metrics.perfect_meds_up.numerator],[1839,2115,982,1134,1348,548]);
  assert.deepEqual([blood.flexAnalysis.attempts,blood.flexAnalysis.clears,blood.flexAnalysis.failures,blood.flexAnalysis.completeCoreAttempts,blood.flexAnalysis.replacementAttempts],[2930,2510,420,2115,815]);
  assert.deepEqual(blood.flexAnalysis.flex[0],{unit:'bloodTerminator',attempts:236,share:236/2930});
  assert.deepEqual(howl.flex.slice(0,3).map(r => [data.units[r.unit].name,r.attempts,r.share]), [['Khârn',1215,1215/2199],['Kariyan',1004,1004/2199],['Bellator',575,575/2199]]);
}

if (process.argv[2]) {
  const report = readReport(resolve(process.argv[2]));
  assert.deepEqual(normalizeReport(report), data, 'Generated dataset differs from the explicit accepted report');
  const bad = { ...report, cards: report.cards.slice(1) };
  assert.throws(() => normalizeReport(bad), /Editorial mapping required/);
  assert.throws(() => normalizeReport({ ...report, cards: [...report.cards, { ...report.cards[0], core_id: 'unexpected_core' }] }), /Editorial mapping required/);
  const badFlex = structuredClone(report);
  badFlex.cards.find(c => c.flex_analysis).flex_analysis.variants[0].attacks *= 5;
  assert.throws(() => normalizeReport(badFlex), 'Counting a full-core battle five times must fail');
  // Check exact co-occurrence and all row metrics directly against source records.
  for (const t of data.teams) {
    const raw = report.cards.find(c => c.core_id === t.id);
    for (const [cohort, sourceCohort] of [[t,raw], ...(t.flexAnalysis ? [[t.flexAnalysis,raw.flex_analysis]] : [])]) {
    for (const [key, sourceKey] of [['combinations','variants'],['mows','mows'],['teamMows','exact']]) {
      const identity = r => JSON.stringify([r.team || [], r.unit || '', r.mow || '']);
      const ordered = [...sourceCohort[sourceKey]].sort((a,b) => b.attacks-a.attacks || (b.clear_rate ?? -1)-(a.clear_rate ?? -1) || (identity(a)<identity(b)?-1:identity(a)>identity(b)?1:0));
      // Source team arrays are canonical. A tie uses unit, team, support; within each table this is the same ordering.
      for (const [i,row] of cohort[key].rows.entries()) {
        const source = ordered[i];
        assert.deepEqual([row.team,row.unit,row.mow,row.attempts,row.clears,row.failures,row.perfect,row.clearRate], [source.team,source.unit,source.mow,source.attacks,source.clears,source.failures,source.outcomes.Perfect,source.clear_rate]);
      }
    }
    }
  }
  console.log('Accepted report reconciled; changed-core rejection and exact co-occurrence checks passed.');
}
console.log(`Guild Wars checks passed: 10 cores, ${new Set(data.teams.flatMap(t => t.core)).size} distinct heroes, 20 rendered tables, single observed disclosure per core, up to ten rate-ranked configurations, counts, denominators, assets, and labels.`);
