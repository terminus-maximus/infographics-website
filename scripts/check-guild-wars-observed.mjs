import assert from 'node:assert/strict';
import { createReadStream, readFileSync } from 'node:fs';
import { createGunzip } from 'node:zlib';
import { createInterface } from 'node:readline';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { percent, ratio } from '../src/lib/guildWarsFormat.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const all = (html, re) => [...html.matchAll(re)];
const strip = html => html.replace(/<[^>]*>/g, ' ').replace(/&#(x[\da-f]+|\d+);/gi, (_, n) => String.fromCodePoint(n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n))).replaceAll('&amp;', '&').replace(/\s+/g, ' ').trim();
const key = row => `${[...row.team].sort().join('|')}|${row.mow}`;

export function checkObserved(section, evidence, core, registry, defense = false) {
  const disclosures = all(section, /<details class="observed-teams"[^>]*>([\s\S]*?)<\/details>/g);
  assert.equal(disclosures.length, 1, 'Exactly one observed disclosure per team');
  const html = disclosures[0][1];
  assert.equal(strip(html.match(/<summary[^>]*>(.*?)<\/summary>/)[1]), defense ? 'Observed Defenses' : 'Observed Teams');
  assert(strip(html).includes('Minimum 10 attempts.'));
  assert(!strip(html).includes('A win defeats all five defenders'));
  assert.equal(evidence.rows.length, Math.min(10, evidence.total));
  assert.equal(new Set(evidence.rows.map(key)).size, evidence.rows.length);
  const rows = all(html, /<tr\b[^>]*>([\s\S]*?)<\/tr>/g).slice(1);
  assert.equal(rows.length, evidence.rows.length);
  if (rows.length) {
    assert.deepEqual(all(html, /<th scope="col"[^>]*>(.*?)<\/th>/g).map(([, cell]) => strip(cell)), ['Complete Team', defense ? 'Hold Rate ↓' : 'Win Rate ↓', defense ? 'Holds / Attempts' : 'Wins / Attempts']);
    assert(strip(html).includes(`Sorted by highest ${defense ? 'hold' : 'win'} rate.`));
    assert(strip(html).includes('Limited sample : fewer than 20 attempts.'));
  }
  for (const [i, row] of evidence.rows.entries()) {
    assert(row.attempts >= 10);
    assert.equal(row.rate, row.wins / row.attempts);
    assert.equal(row.limited, row.attempts < 20);
    assert.equal(new Set(row.team).size, 5);
    const matching = core.filter(id => row.team.includes(id));
    assert(matching.length >= (defense || core.length === 5 ? 4 : core.length));
    const teamCell = rows[i][1].match(/<th scope="row"[^>]*>([\s\S]*?)<\/th>/)[1];
    const ids = all(teamCell, /data-unit-id="([^"]+)"/g).map(([, id]) => id);
    assert.deepEqual(ids, [...matching, ...row.team.filter(id => !core.includes(id)), row.mow], 'Only actual heroes, in approved core order, plus recorded MoW');
    const cells = all(rows[i][1], /<td[^>]*>([\s\S]*?)<\/td>/g).map(([, cell]) => strip(cell));
    assert.deepEqual(cells, [percent(row.rate) + (row.limited ? ' Limited sample' : ''), ratio(row.wins, row.attempts)]);
    const removed = core.filter(id => !row.team.includes(id));
    const added = row.team.filter(id => !core.includes(id));
    if (removed.length) assert(strip(rows[i][1]).includes(`Swap: ${registry[removed[0]].name} → ${added.map(id => registry[id].name).join(', ')}`));
    else assert(!rows[i][1].includes('Swap:'));
    if (i) {
      const previous = evidence.rows[i - 1];
      assert(previous.rate > row.rate || (previous.rate === row.rate && (previous.attempts > row.attempts || (previous.attempts === row.attempts && (previous.wars > row.wars || (previous.wars === row.wars && key(previous) < key(row)))))));
    }
  }
}

// Independently reconstruct every candidate from frozen battles, not from the
// importer or the previously retained 25 most-used rows. This catches omissions
// before the top-ten cut, duplicated full cores, and the wrong outcome direction.
async function checkRecords(path) {
  const attack = JSON.parse(readFileSync(resolve(root, 'src/data/guild-wars/attackers.json')));
  const defense = JSON.parse(readFileSync(resolve(root, 'src/data/guild-wars/defenders.json')));
  const targets = [
    ...attack.teams.map(team => ({ saved: team, side: 'attacker', heroes: team.core, minimum: Math.min(4, team.core.length), groups: new Map() })),
    ...defense.teams.map(team => ({ saved: team, side: 'defender', heroes: team.heroes, minimum: 4, groups: new Map() })),
  ];
  const seen = new Set();
  const lines = createInterface({ input: createReadStream(path).pipe(createGunzip()), crlfDelay: Infinity });
  for await (const line of lines) {
    const row = JSON.parse(line);
    if (!row.eligible) continue;
    assert(attack.scope.seasons.includes(row.season) && attack.scope.tiers.includes(row.tier));
    const identity = `${row.war_id}|${row.entry_id}`;
    assert(!seen.has(identity)); seen.add(identity);
    for (const target of targets) {
      const heroes = [...row[`${target.side}_team`]].sort();
      if (target.heroes.filter(id => heroes.includes(id)).length < target.minimum) continue;
      const mows = row[`${target.side}_mows`];
      const state = row[`${target.side}_mow_state`];
      assert(state === 'observed' && mows.length === 1 || state === 'missing_unknown' && mows.length === 0);
      const mow = state === 'observed' ? mows[0] : 'missing_unknown';
      const groupKey = JSON.stringify([heroes, mow]);
      if (!target.groups.has(groupKey)) target.groups.set(groupKey, { team: heroes, mow, attempts: 0, wins: 0, warIds: new Set() });
      const g = target.groups.get(groupKey);
      g.attempts++;
      g.wins += target.side === 'defender' ? Number(row.outcome === 'Failure') : Number(['Perfect', 'Successful with deaths'].includes(row.outcome));
      g.warIds.add(row.war_id);
    }
  }
  assert.equal(seen.size, attack.scope.eligibleAttacks);
  let configurations = 0;
  for (const target of targets) {
    const candidates = [...target.groups.values()].filter(g => g.attempts >= 10).map(g => ({ team: g.team, mow: g.mow, attempts: g.attempts, wins: g.wins, wars: g.warIds.size, rate: g.wins / g.attempts, limited: g.attempts < 20 }));
    candidates.sort((a, b) => b.rate - a.rate || b.attempts - a.attempts || b.wars - a.wars || (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
    assert.deepEqual(target.saved.observed, { total: candidates.length, rows: candidates.slice(0, 10) }, `${target.side} ${target.saved.id} observed results differ from frozen battles`);
    configurations += candidates.length;
  }
  console.log(`Observed evidence verified independently: ${seen.size} eligible battles, ${configurations} qualifying configurations across 20 sections; full candidate populations, exact outcomes, MoWs, wars, substitutions and top-ten order.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert(process.argv[2], 'Supply the accepted frozen attacks.jsonl.gz path');
  await checkRecords(resolve(process.argv[2]));
}
