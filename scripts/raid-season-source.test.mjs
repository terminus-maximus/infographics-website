import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadSeasonSource, selectConfiguration, normalizeConfiguration, seasonFromCatalog, sha256, canonical, writeOutputs } from './raid-season-source.mjs';

const registry = JSON.parse(readFileSync('src/data/guild-raid/season-sources.json', 'utf8'));
const binding = registry.seasons.find(s => s.season === 114);
const text = readFileSync(`src/data/guild-raid/sources/${binding.generation}.json`, 'utf8');
const catalog = JSON.parse(text);
const mappings = JSON.parse(readFileSync('src/data/guild-raid/replay-mappings.json', 'utf8'));
const chosen = selectConfiguration(catalog, binding.configFingerprint);

test('S114 production import preserves every pre-migration encounter', () => {
  const { lineup } = loadSeasonSource(114, { frozen: true, localDatabase: '/does-not-exist' });
  assert.equal(lineup.source.appVersion, '1.43.157');
  assert.equal(lineup.source.channel, 'production');
  assert.equal(lineup.config, 'guild_boss_season_config_5');
  assert.equal(sha256(canonical({ loop: lineup.loop, slots: lineup.slots })), binding.expectedLineupSha256);
  assert.deepEqual(lineup, JSON.parse(readFileSync('src/data/guild-raid/s114-lineup.json', 'utf8')));
});

test('configuration identity survives renumbering and reordered config collections', () => {
  const changed = structuredClone(catalog);
  const config = changed.configurations.find(c => c.fingerprint === binding.configFingerprint);
  changed.rotation = changed.rotation.map(id => id === config.configId ? 'guild_boss_season_config_99' : id);
  config.configId = 'guild_boss_season_config_99';
  changed.configurations.reverse();
  assert.equal(selectConfiguration(changed, binding.configFingerprint).configId, 'guild_boss_season_config_99');
});

test('duplicate or missing content matches fail instead of choosing a config number', () => {
  const duplicate = structuredClone(catalog);
  duplicate.configurations.push({ ...structuredClone(chosen), configId: 'duplicate' });
  assert.throws(() => selectConfiguration(duplicate, binding.configFingerprint), /found 2/);
  assert.throws(() => selectConfiguration(catalog, 'f'.repeat(64)), /found 0/);
});

test('corrupt snapshots, changed game records and source-channel swaps are rejected', () => {
  assert.throws(() => seasonFromCatalog(binding, text + ' ', mappings), /checksum/);
  assert.throws(() => seasonFromCatalog({ ...binding, channel: 'preview' }, text, mappings), /source mismatch/);
  assert.throws(() => seasonFromCatalog({ ...binding, appVersion: '1.44.120' }, text, mappings), /build mismatch/);
  const changed = structuredClone(catalog);
  changed.configurations[0].slots[0].boardId = 'different-board';
  assert.throws(() => selectConfiguration(changed, binding.configFingerprint), /Changed configuration/);
});

test('unknown maps, changed tier sets, loops and naming overlays require review', () => {
  const map = structuredClone(chosen); map.slots[0].boardId = 'unmapped';
  assert.throws(() => normalizeConfiguration(map, mappings), /Unmapped/);
  const slots = structuredClone(chosen); slots.slots.pop();
  assert.throws(() => normalizeConfiguration(slots, mappings), /slot structure changed/);
  const loop = structuredClone(chosen); loop.loop.shift();
  assert.throws(() => normalizeConfiguration(loop, mappings), /Repeat loop changed/);
  const renamed = structuredClone(mappings); renamed.mapsByBoss.Tervigon.GB_01 = 'Tervigon_02';
  assert.throws(() => seasonFromCatalog(binding, text, renamed), /lineup changed/);
});

test('unbound seasons and missing snapshots never extrapolate or fall back to the sheet', () => {
  const unboundSeason = Math.max(...registry.seasons.map(s => s.season)) + 1;
  assert.throws(() => loadSeasonSource(unboundSeason, { frozen: true }), /no explicit LocalDatabase binding/);
  assert.throws(() => loadSeasonSource(114, { localDatabase: '/does-not-exist' }), /snapshot missing/);
});

test('output preparation failures preserve the prior generated files', () => {
  const dir = mkdtempSync(join(tmpdir(), 'raid-source-test-'));
  try {
    const first = join(dir, 'first.json'); const blocker = join(dir, 'blocker');
    writeFileSync(first, 'old'); writeFileSync(blocker, 'file');
    assert.throws(() => writeOutputs({ [first]: 'new', [join(blocker, 'second.json')]: 'new' }));
    assert.equal(readFileSync(first, 'utf8'), 'old');
    assert.equal(writeOutputs({ [first]: 'new' }), 1);
    assert.equal(writeOutputs({ [first]: 'new' }), 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
