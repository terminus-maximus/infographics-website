import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { normalizeReplays, evidencePool, buildSeasonGuide, parseCsv } from '../src/lib/raidSeasonGuide.mjs';

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
