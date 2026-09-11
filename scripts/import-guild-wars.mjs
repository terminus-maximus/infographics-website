import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, resolve, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const readJSON = path => JSON.parse(readFileSync(path, 'utf8'));
const editorial = readJSON(resolve(root, 'src/data/guild-wars/editorial.json'));
const localCharacters = readJSON(resolve(root, 'src/data/campaigns/characters.json')).characters;
// Explicit canonical portrait aliases. Other support portraits come from the source registry.
const localMows = {
  'mow:adept_exorcist_01': 'Exo',
  'mow:black_forgefiend_01': 'FF',
  'mow:necro_reanimator_01': 'Reanimator',
  'mow:thous_daemonprince_01': 'Zkar',
  'mow:tyran_biovore_01': 'Biovore',
  'mow:ultra_dreadnought_01': 'Galatian',
};
// The source's short_name is Nauseous; use the requested, registry-grounded surname.
const characterNames = { deathRotbone: 'Rotbone' };
// Repair UTF-8 bytes misread as Mac Roman in four registry labels; IDs stay untouched.
const repairName = name => name.replaceAll('√¢', 'â').replaceAll('√Ç', 'Â').replaceAll('√õ', 'Û');
export const fraction = (n, d) => d ? n / d : null;
const sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0);
const keyFor = row => [row.unit || '', [...(row.team || [])].sort().join('|'), row.mow || ''].join('|');
const canonicalCompare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
export const usageOrder = (a, b) => b.attacks - a.attacks || (b.clear_rate ?? -1) - (a.clear_rate ?? -1) || canonicalCompare(keyFor(a), keyFor(b));

export function readReport(path) {
  const raw = readFileSync(path, 'utf8');
  if (path.endsWith('.json')) return JSON.parse(raw);
  const embedded = raw.match(/<script\b[^>]*\bid=["']report-data["'][^>]*>([\s\S]*?)<\/script>/i);
  assert(embedded, 'Expected embedded report-data JSON in the explicit source report.');
  return JSON.parse(embedded[1]);
}

function checkRate(rate, numerator, denominator, label) {
  const expected = fraction(numerator, denominator);
  assert(expected === null ? rate === null : Number.isFinite(rate) && Math.abs(rate - expected) < 1e-12, `Invalid ${label} denominator or rate`);
}

function stats(row) {
  const perfect = row.outcomes.Perfect;
  const withDeaths = row.outcomes['Successful with deaths'];
  for (const n of [row.attacks, row.clears, row.failures, row.wars, perfect, withDeaths]) assert(Number.isInteger(n) && n >= 0, 'Invalid outcome count');
  assert.equal(row.denominator, row.attacks);
  assert.equal(row.clears + row.failures, row.attacks);
  assert.equal(perfect + withDeaths, row.clears);
  assert.equal(row.outcomes.Failure, row.failures);
  assert.equal(row.outcomes.Cleanup || 0, 0);
  assert.equal(row.outcomes['Other/Incomplete'] || 0, 0);
  checkRate(row.clear_rate, row.clears, row.attacks, 'clear rate');
  return { attempts: row.attacks, clears: row.clears, failures: row.failures, perfect, withDeaths, wars: row.wars, clearRate: row.clear_rate };
}

export function normalizeReport(report, mapping = editorial) {
  assert(Array.isArray(report.cards) && report.registry && report.audit && report.discovery, 'Expected a complete report-data object (HTML or JSON export).');
  const cards = new Map(report.cards.map(c => [c.core_id, c]));
  const expected = mapping.teams.map(t => t.id);
  assert.equal(cards.size, report.cards.length, 'Duplicate source core IDs');
  assert.equal(new Set(expected).size, expected.length, 'Duplicate editorial core IDs');
  const missing = expected.filter(id => !cards.has(id));
  const added = [...cards.keys()].filter(id => !expected.includes(id));
  assert(!missing.length && !added.length, `Editorial mapping required. Missing cores: ${missing.join(', ') || 'none'}; added cores: ${added.join(', ') || 'none'}`);
  assert.equal(new Set(mapping.teams.map(t => t.anchor)).size, expected.length, 'Duplicate section anchors');
  const usedUnits = new Set();
  const teams = mapping.teams.map(meta => {
    const card = cards.get(meta.id);
    assert.deepEqual([...meta.core].sort(), [...card.core].sort(), `Core membership changed: ${meta.id}`);
    assert.equal(meta.id, `c_${[...card.core].sort().join('_')}`);
    const base = stats(card);
    checkRate(card.perfect_rate, base.perfect, base.attempts, 'Perfect / all attempts');
    assert.equal(card.win_profile.wins, base.clears);
    assert.equal(card.win_profile.counts.perfect, base.perfect);
    assert.equal(card.win_profile.denominators.perfect, base.clears);
    const metrics = Object.fromEntries(['perfect', 'meds_up', 'perfect_meds_up'].map(key => {
      const numerator = card.win_profile.counts[key];
      const denominator = card.win_profile.denominators[key];
      const rate = card.win_profile.rates[key];
      assert(numerator >= 0 && numerator <= denominator);
      checkRate(rate, numerator, denominator, key);
      return [key, { numerator, denominator, rate }];
    }));
    assert.equal(metrics.meds_up.denominator, card.meds_up);
    assert.equal(metrics.perfect_meds_up.denominator, metrics.meds_up.numerator);
    assert.equal(card.win_profile.meds_up_failures, metrics.meds_up.denominator - metrics.meds_up.numerator);
    const contexts = card.contexts.map(row => {
      assert(['hard', 'normal', 'unknown'].includes(row.map_class), `Unexpected map class: ${row.map_class}`);
      assert(['up', 'down_provisional', 'unknown'].includes(row.medicae), `Unexpected Medicae class: ${row.medicae}`);
      return { map: row.map_class, medicae: row.medicae, ...stats(row) };
    });
    for (const key of ['attempts', 'clears', 'failures', 'perfect', 'withDeaths']) assert.equal(sum(contexts, key), base[key], `Context totals: ${meta.id} ${key}`);
    const up = contexts.filter(row => row.medicae === 'up');
    assert.equal(sum(up, 'attempts'), metrics.meds_up.denominator);
    assert.equal(sum(up, 'clears'), metrics.meds_up.numerator);
    assert.equal(sum(up, 'perfect'), metrics.perfect_meds_up.numerator);
    const flex = [...card.individual_flex].sort(usageOrder).map(row => {
      stats(row);
      assert(!card.core.includes(row.unit), 'Core member listed as flex');
      usedUnits.add(row.unit);
      return { unit: row.unit, attempts: row.attacks, share: fraction(row.attacks, base.attempts) };
    });
    assert.equal(new Set(flex.map(r => r.unit)).size, flex.length);
    assert.equal(sum(flex, 'attempts'), (5 - card.core.length) * base.attempts, 'Flex slot totals');
    const evidence = (rows, kind) => {
      const normalized = [...rows].sort(usageOrder).map(row => {
        const result = { ...stats(row), share: fraction(row.attacks, base.attempts) };
        if (kind !== 'mows') {
          assert.equal(new Set(row.team).size, 5, 'An observed lineup must contain five distinct characters');
          assert(card.core.every(id => row.team.includes(id)), 'Observed lineup does not contain its core');
          if (row.flex) assert.deepEqual([...row.flex].sort(), row.team.filter(id => !card.core.includes(id)).sort());
          result.team = [...row.team].sort();
        }
        if (kind === 'mows') result.unit = row.unit;
        if (kind === 'exact') result.mow = row.mow;
        return result;
      });
      for (const key of ['attempts', 'clears', 'failures', 'perfect', 'withDeaths']) assert.equal(sum(normalized, key), base[key], `${kind} partition: ${meta.id} ${key}`);
      const shown = normalized.slice(0, 25);
      for (const row of shown) for (const id of [...(row.team || []), row.unit, row.mow].filter(Boolean)) usedUnits.add(id);
      return { total: normalized.length, rows: shown };
    };
    // Variants are exact five-character teams independent of MoW. Exact adds support.
    const combinations = evidence(card.variants, 'variants');
    const mows = evidence(card.mows, 'mows');
    const teamMows = evidence(card.exact, 'exact');
    card.core.forEach(id => usedUnits.add(id));
    assert(card.interval === null || (card.interval.length === 2 && card.interval.every(n => Number.isFinite(n) && n >= 0 && n <= 1)));
    return { id: card.core_id, core: [...card.core], ...base, interval: card.interval, perfectPerAttempt: card.perfect_rate, metrics, contexts, flex, combinations, mows, teamMows };
  });
  const units = Object.fromEntries([...usedUnits].sort().map(id => {
    if (id === 'missing_unknown') return [id, { name: 'No MoW deployed', kind: 'no_support', image: null }];
    const unit = report.registry[id];
    assert(unit && unit.image, `Unmapped unit or support category: ${id}. Add an explicit editorial mapping; do not label it No MoW deployed.`);
    assert(['character', 'machine_of_war'].includes(unit.kind), `Unsupported identity kind: ${id}`);
    if (characterNames[id]) assert(unit.name.includes(characterNames[id]), 'Character label must be grounded in registry');
    let image = localCharacters[id] ? `/images/heroes/${localCharacters[id].portrait}` : localMows[id] ? `/images/replay-library/mow/${localMows[id]}.webp` : null;
    if (image && !existsSync(resolve(root, `public${image}`))) image = null;
    if (!image) image = `/images/guild-wars/${basename(unit.image)}`;
    return [id, { name: repairName(characterNames[id] || unit.short_name || unit.name), kind: unit.kind, image }];
  }));
  const scopeRows = report.audit.by_season_tier;
  assert.equal(sum(scopeRows, 'eligible'), report.discovery.eligible);
  return {
    schemaVersion: 1,
    scope: { seasons: [...new Set(scopeRows.map(r => r.season))].sort((a,b) => a-b), tiers: [...new Set(scopeRows.map(r => r.tier))].sort((a,b) => a-b), wars: report.audit.war_count, eligibleAttacks: report.discovery.eligible },
    units, teams,
  };
}

function main() {
  const [input, output = 'src/data/guild-wars/attackers.json'] = process.argv.slice(2);
  assert(input, 'Usage: node scripts/import-guild-wars.mjs /explicit/path/to/index.html [output.json]');
  const reportPath = resolve(input);
  const report = readReport(reportPath);
  const data = normalizeReport(report);
  // Validate every planned copy before writing data or assets. Never write into the source project.
  const copies = Object.entries(data.units).filter(([,u]) => u.image?.startsWith('/images/guild-wars/')).map(([id, unit]) => {
    const source = resolve(dirname(reportPath), report.registry[id].image);
    assert(!relative(dirname(reportPath), source).startsWith('..'), 'Portrait must be a sibling report asset');
    assert(existsSync(source), `Missing canonical portrait: ${id}`);
    return [source, resolve(root, `public${unit.image}`)];
  });
  const destination = resolve(root, output);
  assert(relative(root, destination) && !relative(root, destination).startsWith('..'), 'Output must be inside the website repository');
  for (const [source, target] of copies) { mkdirSync(dirname(target), { recursive: true }); copyFileSync(source, target); }
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, JSON.stringify(data, null, 2) + '\n');
  console.log(`Imported ${data.teams.length} teams, ${Object.keys(data.units).length} identities; copied ${copies.length} portraits. Source unchanged.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
