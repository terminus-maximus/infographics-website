import assert from 'node:assert/strict';

const key = row => `${[...row.team].sort().join('|')}|${row.mow}`;
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;

// Select from the complete source population, before any usage-based truncation.
export function observedTeams(rows) {
  assert.equal(new Set(rows.map(key)).size, rows.length, 'Duplicate observed configuration');
  for (const row of rows) {
    assert.equal(new Set(row.team).size, 5);
    assert(row.mow, 'Missing support category');
    assert([row.attempts, row.wins, row.wars].every(n => Number.isInteger(n) && n >= 0));
    assert(row.wins <= row.attempts && row.wars <= row.attempts);
  }
  const eligible = rows.filter(row => row.attempts >= 10)
    .sort((a, b) => b.wins * a.attempts - a.wins * b.attempts
      || b.attempts - a.attempts || b.wars - a.wars || compare(key(a), key(b)));
  return { total: eligible.length, rows: eligible.slice(0, 10).map(row => ({
    team: [...row.team].sort(), mow: row.mow, attempts: row.attempts,
    wins: row.wins, wars: row.wars, rate: row.wins / row.attempts,
    limited: row.attempts < 20,
  })) };
}
