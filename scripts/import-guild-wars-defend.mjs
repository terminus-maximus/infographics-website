import assert from 'node:assert/strict';
import { createReadStream, readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { createGunzip } from 'node:zlib';
import { createInterface } from 'node:readline';
import { dirname, resolve, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readReport, fraction } from './import-guild-wars.mjs';
import { observedTeams } from './guild-wars-observed.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const readJSON = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const editorial = readJSON('src/data/guild-wars/defend-editorial.json');
const attackEditorial = readJSON('src/data/guild-wars/editorial.json');
const attackData = readJSON('src/data/guild-wars/attackers.json');
const characters = readJSON('src/data/campaigns/characters.json').characters;
const canonical = heroes => [...heroes].sort().join('|');
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const empty = () => ({ attempts: 0, clears: 0, failures: 0, perfect: 0, withDeaths: 0, wars: new Set() });
const add = (stats, row) => {
  stats.attempts++;
  stats.wars.add(row.war_id);
  if (row.outcome === 'Failure') stats.failures++;
  else {
    stats.clears++;
    if (row.outcome === 'Perfect') stats.perfect++;
    else stats.withDeaths++;
  }
};
const finish = row => ({ ...row, wars: row.wars.size,
  failureRate: fraction(row.failures, row.attempts), clearRate: fraction(row.clears, row.attempts),
  perfectPerAttempt: fraction(row.perfect, row.attempts), perfectPerClear: fraction(row.perfect, row.clears) });
function reconcile(actual, source, label) {
  for (const [key, field] of Object.entries({ attempts: 'n', clears: 'clears', failures: 'failures', perfect: 'perfect', withDeaths: 'successful_with_deaths', wars: 'wars', failureRate: 'failure_rate', clearRate: 'clear_rate', perfectPerAttempt: 'perfect_rate', perfectPerClear: 'perfect_share_of_clears' })) {
    assert.equal(actual[key], source[field], `${label}: ${key} differs from saved report`);
  }
}

export function recordsPathFor(reportPath) {
  const reportDir = reportPath.endsWith('.json') ? resolve(dirname(reportPath), '..') : dirname(reportPath);
  const candidates = ['inputs/attacks.jsonl.gz', 'extraction/exports/attacks.jsonl.gz'].map(path => resolve(reportDir, path));
  const recordsPath = candidates.find(path => existsSync(path));
  assert(recordsPath, 'Missing frozen battle records beside the accepted report');
  return recordsPath;
}

export async function normalizeDefendReport(report, recordsPath) {
  assert.equal(report.defenders.length, 10);
  assert.equal(report.attackers.length, attackEditorial.teams.length);
  assert.equal(report.cells.length, report.defenders.length * report.attackers.length);
  assert.equal(new Set(report.cells.map(c => `${c.defender_id}|${c.attacker_core_id}`)).size, report.cells.length);
  assert(report.config.seasons.length && report.config.battlefields.length, 'Missing report scope');
  const heroUses = new Map();
  for (const team of editorial.teams) for (const hero of team.heroes) heroUses.set(hero, (heroUses.get(hero) || 0) + 1);
  for (const count of heroUses.values()) assert(count <= (report.config.max_hero_uses ?? 1), 'Defender hero-use cap exceeded');
  for (const [i, team] of editorial.teams.entries()) for (const other of editorial.teams.slice(i + 1)) {
    assert(team.heroes.filter(hero => other.heroes.includes(hero)).length <= (report.config.max_shared_heroes ?? 0), 'Defender overlap cap exceeded');
  }
  assert.equal(new Set(editorial.teams.map(t => t.anchor)).size, 10);
  const attackers = attackEditorial.teams.map(meta => {
    const source = report.attackers.find(a => a.core_id === meta.id);
    assert(source, `Missing Attack core: ${meta.title}`);
    assert.equal(canonical(source.heroes), canonical(meta.core), `Attack membership changed: ${meta.title}`);
    assert.equal(source.name, meta.title, `Attack name changed: ${meta.id}`);
    if (source.captain) assert.deepEqual(source.heroes, meta.core, `Attack portrait order changed: ${meta.id}`);
    return meta;
  });
  const defenders = editorial.teams.map(meta => {
    const source = report.defenders.find(d => d.defender_id === meta.id);
    assert(source, `Missing defense: ${meta.id}`);
    assert.equal(canonical(source.heroes), canonical(meta.heroes), `Defender membership changed: ${meta.title}`);
    assert.equal(source.name, meta.title, `Defender name changed: ${meta.id}`);
    if (source.captain) {
      assert.deepEqual(source.heroes, meta.heroes, `Defender portrait order changed: ${meta.id}`);
      assert.equal(meta.heroes[0], source.captain);
    }
    const flex = (source.flex_alternatives || []).map(alternative => {
      assert.equal(new Set(alternative.heroes).size, 5, 'Flex must be an exact five-hero lineup');
      assert.deepEqual(meta.heroes.filter(h => !alternative.heroes.includes(h)), [alternative.removed_hero], 'Incorrect outgoing flex hero');
      assert.deepEqual(alternative.heroes.filter(h => !meta.heroes.includes(h)), [alternative.added_hero], 'Incorrect incoming flex hero');
      assert.equal(canonical(alternative.shared_heroes), canonical(meta.heroes.filter(h => h !== alternative.removed_hero)));
      assert(alternative.passes_support && alternative.n >= report.config.support.attacks && alternative.wars >= report.config.support.wars && alternative.guilds >= report.config.support.guilds, 'Unsupported defender flex');
      assert(alternative.max_war_share <= report.config.support.max_war_share && alternative.max_guild_share <= report.config.support.max_guild_share, 'Flex concentration cap exceeded');
      return { source: alternative, overall: empty(), occurrences: 0, mows: new Map() };
    });
    assert.equal(new Set(flex.map(f => f.source.team_id)).size, flex.length, 'Duplicate flex lineup');
    return { source, meta, overall: empty(), medsUp: empty(), flex, observed: new Map(),
      tiers: report.config.battlefields.map(tier => ({ tier, overall: empty(), medsUp: empty() })),
      counters: attackers.map(a => ({ id: a.id, overall: empty(), medsUp: empty() })),
      occurrences: 0, unknownMows: 0, mows: new Map() };
  });
  const exactByHeroes = new Map(defenders.map(d => [canonical(d.meta.heroes), d]));
  const flexByHeroes = new Map();
  for (const d of defenders) for (const flex of d.flex) {
    const key = canonical(flex.source.heroes);
    if (!flexByHeroes.has(key)) flexByHeroes.set(key, []);
    flexByHeroes.get(key).push(flex);
  }
  const seen = new Set();
  const wars = new Set();
  let eligible = 0;
  // Read only the frozen extraction. Joint BF × Medicae counts are absent from the report.
  const lines = createInterface({ input: createReadStream(recordsPath).pipe(createGunzip()), crlfDelay: Infinity });
  for await (const line of lines) {
    const row = JSON.parse(line);
    assert(report.config.seasons.includes(row.season) && report.config.battlefields.includes(row.tier), 'Out-of-scope record');
    assert(!seen.has(row.attack_key), 'Duplicate observation');
    seen.add(row.attack_key);
    wars.add(row.war_id);
    const exact = exactByHeroes.get(canonical(row.defender_team));
    const alternatives = flexByHeroes.get(canonical(row.defender_team)) || [];
    const mow = row.defender_mow_state === 'observed' && row.defender_mows.length === 1 ? row.defender_mows[0] : null;
    if (exact) {
      exact.occurrences++;
      if (mow) exact.mows.set(mow, (exact.mows.get(mow) || 0) + 1);
      else exact.unknownMows++;
    }
    for (const alternative of alternatives) {
      alternative.occurrences++;
      if (mow) alternative.mows.set(mow, (alternative.mows.get(mow) || 0) + 1);
    }
    if (!row.eligible) continue;
    assert(row.debuff === null && row.debuff_raw === '—' && row.debuff_quality === 'initial_convention');
    assert(['Failure', 'Perfect', 'Successful with deaths'].includes(row.outcome));
    assert.equal(new Set(row.attacker_team).size, 5);
    assert.equal(new Set(row.defender_team).size, 5);
    eligible++;
    // Exploratory exact configurations include one-hero swaps and every recorded MoW,
    // independently of the stricter selected-defense/modal-MoW headline population.
    assert(mow || (row.defender_mow_state === 'missing_unknown' && row.defender_mows.length === 0), 'Review ambiguous observed defense support');
    const observedMow = mow || 'missing_unknown';
    for (const target of defenders) {
      if (target.meta.heroes.filter(h => row.defender_team.includes(h)).length < 4) continue;
      const key = `${canonical(row.defender_team)}|${observedMow}`;
      if (!target.observed.has(key)) target.observed.set(key, { team: [...row.defender_team], mow: observedMow, ...empty() });
      add(target.observed.get(key), row);
    }
    const up = row.medicae === 'up';
    for (const alternative of alternatives) if (mow === alternative.source.mow) add(alternative.overall, row);
    if (exact && mow === exact.source.mow) {
      const tier = exact.tiers.find(t => t.tier === row.tier);
      add(exact.overall, row);
      add(tier.overall, row);
      if (up) { add(exact.medsUp, row); add(tier.medsUp, row); }
    }
    // Related-defense populations can overlap; count once in every matching cell.
    const targets = defenders.filter(d => d.meta.heroes.filter(h => row.defender_team.includes(h)).length >= 3);
    for (const target of targets) for (const attacker of attackers) {
      if (!attacker.core.every(h => row.attacker_team.includes(h))) continue;
      const cell = target.counters.find(c => c.id === attacker.id);
      add(cell.overall, row);
      if (up) add(cell.medsUp, row);
    }
  }
  assert.equal(seen.size, report.summary.scoped_records);
  assert.equal(wars.size, report.summary.source_wars);
  assert.equal(eligible, report.summary.counter_eligible_records);
  const teams = defenders.map(d => {
    const overall = finish(d.overall), medsUp = finish(d.medsUp);
    reconcile(overall, d.source.overall, `${d.meta.title} overall`);
    reconcile(medsUp, d.source.meds_up, `${d.meta.title} Meds Up`);
    const tiers = d.tiers.map(t => {
      const stats = finish(t.overall);
      reconcile(stats, d.source.contexts[`tier:${t.tier}`], `${d.meta.title} BF${t.tier}`);
      return { tier: t.tier, ...stats, share: fraction(stats.attempts, overall.attempts), medsUp: finish(t.medsUp) };
    });
    const counters = d.counters.map(c => {
      const source = report.cells.find(row => row.defender_id === d.meta.id && row.attacker_core_id === c.id);
      const stats = finish(c.overall), medsUp = finish(c.medsUp);
      reconcile(stats, source.overall, `${d.meta.title} / ${c.id}`);
      reconcile(medsUp, source.meds_up, `${d.meta.title} / ${c.id} Meds Up`);
      const evidence = !stats.attempts ? 'No data' : stats.attempts >= report.config.matchup_support.attacks && stats.wars >= report.config.matchup_support.wars ? 'Supported' : 'Low support';
      assert.equal(evidence, source.evidence);
      return { id: c.id, ...stats, medsUp, evidence };
    // Website request: total clear count is primary, regardless of support label.
    }).sort((a, b) => b.clears - a.clears || b.attempts - a.attempts || b.wars - a.wars || compare(a.id, b.id));
    assert.equal(d.occurrences, d.source.mow_usage.denominator);
    assert.equal(d.unknownMows, d.source.mow_usage.unknown_count);
    assert.equal(d.mows.size, d.source.mow_usage.frequencies.length);
    const mows = d.source.mow_usage.frequencies.map(m => {
      assert.equal(d.mows.get(m.mow), m.count);
      assert.equal(m.share, fraction(m.count, d.occurrences));
      return { unit: m.mow, attempts: m.count, share: m.share };
    }).sort((a, b) => b.attempts - a.attempts || compare(a.unit, b.unit));
    assert.equal(d.mows.get(d.source.mow), mows[0].attempts, 'Selected MoW must be most common');
    const flex = d.flex.map(alternative => {
      const source = alternative.source, stats = finish(alternative.overall);
      reconcile(stats, source, `${d.meta.title} flex ${source.team_id}`);
      assert.equal(alternative.occurrences, source.occurrences, 'Flex occurrence count');
      assert.equal(alternative.mows.get(source.mow), source.modal_occurrences, 'Flex modal MoW count');
      assert.equal(source.modal_occurrences, Math.max(...alternative.mows.values()), 'Flex MoW must be most common');
      return { id: source.team_id, heroes: d.meta.heroes.map(h => h === source.removed_hero ? source.added_hero : h),
        removedHero: source.removed_hero, addedHero: source.added_hero, mow: source.mow, ...stats };
    }).sort((a, b) => (b.failureRate ?? -1) - (a.failureRate ?? -1) || b.attempts - a.attempts || b.wars - a.wars || compare(a.id, b.id));
    const observed = observedTeams([...d.observed.values()].map(row => ({ team: row.team, mow: row.mow, attempts: row.attempts, wins: row.failures, wars: row.wars.size })));
    return { id: d.meta.id, heroes: d.meta.heroes, mow: d.source.mow, ...overall, medsUp, tiers, counters, observed,
      mowOccurrences: d.occurrences, unknownMows: d.unknownMows, mows, flex };
  }).sort((a, b) => (b.failureRate ?? -1) - (a.failureRate ?? -1) || b.attempts - a.attempts || compare(a.id, b.id));
  assert.equal(teams.reduce((n, t) => n + t.attempts, 0), report.summary.selected_attempts);
  assert.equal(teams.reduce((n, t) => n + t.flex.length, 0), report.summary.flex_alternative_count ?? 0);
  const usedUnits = new Set([...teams.flatMap(t => [...t.heroes, t.mow, ...t.mows.filter(m => m.share >= .05).map(m => m.unit), ...t.flex.flatMap(f => [...f.heroes, f.mow]), ...t.observed.rows.flatMap(row => [...row.team, row.mow])]), ...attackers.flatMap(a => a.core)]);
  const units = Object.fromEntries([...usedUnits].sort().map(id => {
    if (id === 'missing_unknown') return [id, { name: 'MoW not recorded', image: null, kind: 'no_support' }];
    const source = report.registry[id];
    assert(source?.image, `Missing identity/portrait: ${id}`);
    const existing = attackData.units[id];
    const localImage = characters[id] ? `/images/heroes/${characters[id].portrait}` : null;
    const image = existing?.image || (localImage && existsSync(resolve(root, `public${localImage}`)) ? localImage : `/images/guild-wars/${basename(source.image)}`);
    const overrides = { deathRotbone: 'Rotbone', 'mow:necro_reanimator_01': 'Reanimator', 'mow:death_crawler_01': 'PBC' };
    const name = (overrides[id] || existing?.name || source.short_name || source.name).replaceAll('√¢', 'â').replaceAll('√Ç', 'Â').replaceAll('√õ', 'Û');
    return [id, { name, image, kind: source.kind }];
  }));
  return { schemaVersion: 2, scope: { seasons: report.config.seasons, tiers: report.config.battlefields, wars: wars.size, records: seen.size, eligibleAttacks: eligible, exactDefenseAttempts: report.summary.selected_attempts }, units, teams };
}

async function main() {
  const [input, output = 'src/data/guild-wars/defenders.json'] = process.argv.slice(2);
  assert(input, 'Usage: node scripts/import-guild-wars-defend.mjs /explicit/report/index.html [output.json]');
  const reportPath = resolve(input), report = readReport(reportPath);
  const reportDir = reportPath.endsWith('.json') ? resolve(dirname(reportPath), '..') : dirname(reportPath);
  const data = await normalizeDefendReport(report, recordsPathFor(reportPath));
  const destination = resolve(root, output);
  assert(relative(root, destination) && !relative(root, destination).startsWith('..'), 'Output must be inside website');
  const copies = Object.entries(data.units).filter(([, unit]) => unit.image && !existsSync(resolve(root, `public${unit.image}`))).map(([id, unit]) => {
    const source = resolve(reportDir, report.registry[id].image);
    assert(!relative(reportDir, source).startsWith('..') && existsSync(source), `Missing portrait: ${id}`);
    return [source, resolve(root, `public${unit.image}`)];
  });
  for (const [source, target] of copies) { mkdirSync(dirname(target), { recursive: true }); copyFileSync(source, target); }
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, JSON.stringify(data, null, 2) + '\n');
  console.log(`Imported ten defenses, 100 counters and ${data.teams.reduce((n, t) => n + t.flex.length, 0)} flex choices; reconciled ${data.scope.records} records, ${data.teams.length * data.scope.tiers.length} Battlefield/Medicae breakdowns, and all MoW shares. Copied ${copies.length} portraits.`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
