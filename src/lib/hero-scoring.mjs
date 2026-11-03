// Website validation mirrors the approved combiner; the importer also executes
// HeroDatabase's original combine/collect_mentions functions against frozen inputs.
export const POLICY = 'overall-popularity-3.0';
/** @type {import('./hero-types').Mode[]} */
export const MODES = ['raid', 'war', 'horde', 'popularity'];
export const modeNames = { raid: 'Guild Raid', war: 'Guild War', horde: 'Horde', popularity: 'Popularity' };
// Shared with the Python exporter: accent-insensitive codepoint ordering.
const nameKey = value => value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();
export const nameOrder = (a, b) => { const x = nameKey(a.name), y = nameKey(b.name); return x < y ? -1 : x > y ? 1 : 0; };
export const formatOverall = value => value === null ? 'Pending' : value.toFixed(2);
export const formatMode = value => value === null ? 'Pending' : value.toFixed(1);
export function assert(condition, message) { if (!condition) throw new Error(message); }
export function validScore(value) {
  assert(value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 10), `Invalid score: ${value}`);
}
export function requiredBonus(relationships) {
  return 0.25 * Number(relationships.some(r => r.status === 'current' && r.role === 'required' && ['campaign', 'event_campaign'].includes(r.category) && r.evidence?.some(e => e.kind === 'required_hero')));
}
export function calculate(scores, bonus) {
  MODES.forEach(mode => validScore(scores[mode]));
  assert(bonus === 0 || bonus === 0.25, 'Bonus must be 0 or 0.25');
  const total = MODES.reduce((sum, mode) => sum + scores[mode], 0);
  const base = MODES.some(mode => scores[mode] === null) ? null : total / 4;
  // Preserve stored precision. Display rounding never determines averages or ranks.
  return { base, final: base === null ? null : Math.min(10, (total + 4 * bonus) / 4) };
}
export function rankRows(rows) {
  const sorted = [...rows].sort((a,b) => compareValues(a.final_score,b.final_score,'desc') || nameOrder(a,b));
  return sorted.map(row => ({ ...row, rank: row.final_score === null ? null : 1 + rows.filter(other => other.final_score !== null && other.final_score > row.final_score).length }));
}
export function topRows(rows, count = 10, includeCutoffTies = true) {
  assert(Number.isInteger(count) && count > 0, 'Invalid cutoff');
  const eligible = rankRows(rows).filter(r => r.final_score !== null);
  const cutoff = eligible[count - 1]?.final_score;
  return eligible.filter((row, i) => i < count || (includeCutoffTies && row.final_score === cutoff));
}
export function compareValues(a, b, direction) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  const result = typeof a === 'number' ? a - b : a.localeCompare(b, 'en');
  return direction === 'desc' ? -result : result;
}
export function sortHeroes(rows, field = 'name', direction = 'asc') {
  return [...rows].sort((a,b) => compareValues(a[field], b[field], direction) || nameOrder(a,b));
}
export function matchesHero(hero, query, filters) {
  const text = [hero.name, hero.full_name, ...(hero.aliases || [])].join(' ').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase();
  const search = query.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().trim();
  return text.includes(search) && Object.entries(filters).every(([key, values]) => !values.length || values.some(value => (Array.isArray(hero[key]) ? hero[key] : [hero[key]]).includes(value)));
}
export function validateRelease(release, relationships) {
  assert(release.policy === POLICY && release.rank_convention === 'competition', 'Incompatible ranking policy');
  assert(new Set(release.heroes.map(h => h.unit_id)).size === release.heroes.length, 'Duplicate release identity');
  for (const row of release.heroes) {
    const computed = calculate(row, row.guide_bonus);
    assert(row.equal_weight_average === computed.base && row.final_score === computed.final, `Formula mismatch: ${row.unit_id}`);
    assert((row.final_score === null) === (row.status === 'pending'), `Pending status mismatch: ${row.unit_id}`);
    if (relationships) {
      assert(Array.isArray(relationships[row.unit_id]), `Unresolved eligibility: ${row.unit_id}`);
      assert(row.guide_bonus === requiredBonus(relationships[row.unit_id]), `Bonus mismatch: ${row.unit_id}`);
    }
  }
  const sorted = rankRows(release.heroes);
  assert(sorted.every((row,i) => row.unit_id === release.heroes[i].unit_id && row.rank === release.heroes[i].rank), 'Ranking order/shared ranks mismatch');
  return true;
}
