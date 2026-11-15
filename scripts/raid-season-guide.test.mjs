import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { normalizeReplays, evidencePool, buildSeasonGuide, parseCsv, graphicEligible, validateEvidenceOverrides, selectionPolicyVersion } from '../src/lib/raidSeasonGuide.mjs';

const raw = (changes = {}) => ({ review_status: 'VALID_REPLAY', video_id: '12345678901', boss_final: 'Cawl', tier_final: 'L5', map: 'Cawl_04', team_archetype: 'Laviscus', creator: 'Creator', damage_final: '1,000,000', hero_1: 'A', hero_2: 'B', hero_3: 'C', hero_4: 'D', hero_5: 'E', 'Team (no MoW)': 'A, B, C, D, E', Team: 'A, B, C, D, E, Biovore', team_key: 'A|B|C|D|E', MoW: 'Biovore', ...changes });
const replay = (tier, damage = 100, changes = {}) => ({ boss: 'Cawl', map: 'Cawl_04', tier, damage, ...changes });
const slot = { boss: 'Cawl', map: 'Cawl_04', tier: 'L5' };

test('eligibility excludes guesses, conflicting teams, unreviewed rows and repeated videos', () => {
  const result = normalizeReplays([raw(), raw(), raw({ video_id: '22345678901', damage_final: '', damage_guess: '2,000,000' }), raw({ video_id: '32345678901', 'Team (no MoW)': 'A, B, C, D, Z' }), raw({ review_status: 'PENDING', video_id: '42345678901' })]);
  assert.equal(result.replays.length, 1);
  assert.equal(result.replays[0].damage, 1000000);
  assert.equal(result.rejected.length, 3);
});

test('nearby pooling retains every exact result, includes both adjacent tiers, and stops once sufficient', () => {
  const rows = [replay('L5'), replay('L5'), replay('L4'), replay('M1'), replay('M1'), replay('L3', 99999999), replay('L5', 99999999, { boss: 'Lion' }), replay('L5', 99999999, { map: 'Cawl_01' })];
  const pool = evidencePool(rows, slot);
  assert.equal(pool.kind, 'pooled'); assert.equal(pool.rows.length, 5); assert.equal(pool.radius, 1);
  assert.ok(pool.rows.every(r => r.damage === 100));
});

test('sufficient exact evidence is never diluted by nearby high damage', () => {
  const pool = evidencePool([...Array.from({ length: 5 }, () => replay('L5')), replay('M1', 99999999)], slot);
  assert.equal(pool.kind, 'exact'); assert.equal(pool.rows.length, 5);
});

test('wrong-map and far-tier evidence remain references; Epic retains higher-tier provenance', () => {
  assert.equal(evidencePool([replay('L1')], slot).kind, 'distant-tier');
  assert.equal(evidencePool([replay('L5', 100, { map: 'Cawl_01' })], slot).kind, 'other-map');
  assert.equal(evidencePool([replay('L1')], { ...slot, tier: 'E5' }).kind, 'distant-tier');
  assert.equal(evidencePool([replay('M1', 100, { boss: 'Lion' })], slot).kind, 'missing');
});

test('means use all eligible records, not just the selected highest-damage examples', () => {
  const rows = [100, 200, 900].map((damage, i) => raw({ video_id: `${i}2345678901`, damage_final: String(damage) }));
  const result = buildSeasonGuide({ slots: [slot], loop: ['L5'] }, rows);
  assert.equal(result.slots[0].recommendations[0].average, 400);
  assert.equal(result.slots[0].recommendations[0].sample, 3);
  assert.equal(result.slots[0].recommendations[0].examples[0].damage, 900);
});

const overrideLineup = { season: 115, slots: [{ tier: 'M2', boss: 'Ghaz', map: 'Ghaz_01', rarity: 'Mythic' }, { tier: 'E5', boss: 'Ghaz', map: 'Ghaz_02', rarity: 'Epic' }], loop: ['M2'] };
const evidenceOverrides = { schemaVersion: 1, season: 115, encounters: [{ tier: 'M2', boss: 'Ghaz', map: 'Ghaz_01', scope: 'all-maps-exact-tier', reason: 'Requested other-map M2 averages', approvedBy: 'Dan', approvedOn: '2026-11-14', instruction: 'Ignore the map restriction for M2 Ghaz' }] };

test('all-map exception includes every eligible exact-tier variant and preserves the scheduled map', () => {
  const rows = [100, 200, 900].map((damage, i) => raw({ video_id: `${i}2345678901`, boss_final: 'Ghaz', tier_final: 'M2', map: ['Ghaz_01', 'Ghaz_02', 'Ghaz_05'][i], damage_final: String(damage) }));
  rows[2] = { ...rows[2], hero_5: 'F', 'Team (no MoW)': 'A, B, C, D, F', Team: 'A, B, C, D, F, Galatian', team_key: 'A|B|C|D|F', MoW: 'Galatian' };
  rows.push(raw({ video_id: '32345678901', boss_final: 'Ghaz', tier_final: 'M1', map: 'Ghaz_02', damage_final: '99000000' }), raw({ video_id: '42345678901', boss_final: 'Lion', tier_final: 'M2', damage_final: '99000000' }));
  const result = buildSeasonGuide(overrideLineup, rows, evidenceOverrides);
  const rec = result.slots[0].recommendations[0];
  assert.equal(result.slots[0].map, 'Ghaz_01');
  assert.equal(rec.kind, 'cross-map'); assert.equal(rec.sample, 3); assert.equal(rec.average, 400);
  assert.equal(rec.exactSample, 1); assert.deepEqual(rec.tiers, ['M2']);
  assert.deepEqual(rec.maps, ['Ghaz_01', 'Ghaz_02', 'Ghaz_05']);
  assert.deepEqual(rec.team.heroes, ['A', 'B', 'C', 'D', 'F']); assert.equal(rec.team.mow, 'Galatian');
  assert.equal(rec.examples.length, 1); assert.equal(rec.evidenceVideoIds.length, 3);
  assert.deepEqual(result.slots[1], buildSeasonGuide(overrideLineup, rows).slots[1]);
  assert.equal(graphicEligible(rec), true);
  assert.equal(selectionPolicyVersion(evidenceOverrides), 2); assert.equal(selectionPolicyVersion(null), 1);
});

test('all-map exception never widens tiers or invents evidence to meet the graphic threshold', () => {
  const row = raw({ boss_final: 'Ghaz', tier_final: 'M1', map: 'Ghaz_02' });
  assert.equal(buildSeasonGuide(overrideLineup, [row], evidenceOverrides).slots[0].recommendations.length, 0);
  const result = buildSeasonGuide(overrideLineup, [{ ...row, tier_final: 'M2' }], evidenceOverrides);
  assert.equal(result.slots[0].recommendations[0].sample, 1);
  assert.equal(graphicEligible(result.slots[0].recommendations[0]), false);
  assert.equal(graphicEligible({ kind: 'other-map', sample: 100 }), false);
  assert.equal(graphicEligible({ kind: 'distant-tier', sample: 100 }), false);
});

test('evidence overrides require the intended season, exact encounter and approval provenance', () => {
  assert.throws(() => validateEvidenceOverrides({ ...overrideLineup, season: 114 }, evidenceOverrides), /season-scoped/);
  for (const change of [{ map: 'Ghaz_02' }, { boss: 'Lion' }, { tier: 'M3' }, { scope: 'all-tiers' }, { reason: '' }, { instruction: '' }, { approvedBy: '' }]) {
    assert.throws(() => validateEvidenceOverrides(overrideLineup, { ...evidenceOverrides, encounters: [{ ...evidenceOverrides.encounters[0], ...change }] }));
  }
  assert.throws(() => validateEvidenceOverrides(overrideLineup, { ...evidenceOverrides, encounters: [...evidenceOverrides.encounters, ...evidenceOverrides.encounters] }), /unique/);
});

test('quoted CSV team text and comma-formatted damage survive import', () => {
  assert.deepEqual(parseCsv('a,b\r\n"one, two","1,234"\r\n'), [{ a: 'one, two', b: '1,234' }]);
});

test('guide snapshots retain canonical map names without source-server or support-map fields', () => {
  const privateSlot = { ...slot, rarity: 'Legendary', sourceMap: 'GB_Belisarius_04', mapUrl: 'https://discord.com/channels/private', primes: [{ side: 'Left', map: 'support_01' }] };
  const result = buildSeasonGuide({ slots: [privateSlot], loop: ['L5'] }, [raw()]);
  assert.equal(result.slots[0].map, 'Cawl_04');
  assert.doesNotMatch(JSON.stringify(result), /discord\.com|GB_|support_01/);
});

test('S114 snapshot and graphic export agree; every slot, asset and example retains its provenance', () => {
  const guide = JSON.parse(readFileSync('src/data/guild-raid/s114-guide.json', 'utf8'));
  const graphic = JSON.parse(readFileSync('public/data/guild-raid/s114-graphic-summary.json', 'utf8'));
  assert.equal(guide.slots.length, 25);
  assert.equal(new Set(guide.slots.map(s => s.tier)).size, 25);
  assert.deepEqual(guide.loop, ['M3', 'M2', 'M1', 'L5', 'L4']);
  assert.deepEqual(graphic.bosses.map(b => b.tier), guide.loop);
  assert.equal(graphic.provenance.masterSha256, guide.provenance.masterSha256);
  assert.doesNotMatch(JSON.stringify(guide), /discord\.com|GB_|"primes"/);
  for (const s of guide.slots) {
    assert.ok(existsSync(`public/images/replay-library/maps/${s.map}.webp`));
    for (const rec of s.recommendations) {
      assert.equal(rec.evidenceVideoIds.length, rec.sample);
      assert.equal(new Set(rec.evidenceVideoIds).size, rec.sample);
      for (const example of rec.examples) {
        assert.equal(example.boss, s.boss);
        assert.ok(rec.evidenceVideoIds.includes(example.videoId));
        assert.deepEqual([...example.heroes].sort(), [...rec.team.heroes].sort());
      }
      if (s.rarity === 'Epic') assert.ok(rec.tiers.every(t => t.startsWith('E')) || ['other-map', 'distant-tier'].includes(rec.kind));
    }
  }
  for (const boss of graphic.bosses) {
    assert.ok(boss.recommendations.length >= 2 && boss.recommendations.length <= 3);
    const source = guide.slots.find(s => s.tier === boss.tier);
    for (const rec of boss.recommendations) {
      assert.equal(rec.averageDamage, source.recommendations.find(r => r.archetype === rec.archetype).average);
      assert.ok(rec.sample >= 3);
      assert.ok(existsSync(`public${rec.archetypeIcon}`));
    }
  }
});
