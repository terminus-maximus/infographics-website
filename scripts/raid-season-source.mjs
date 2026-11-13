import { readFileSync, existsSync, mkdirSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TIERS } from '../src/lib/raidSeasonGuide.mjs';

export const SITE = fileURLToPath(new URL('../', import.meta.url));
export const sha256 = value => createHash('sha256').update(value).digest('hex');
export const canonical = value => JSON.stringify(Array.isArray(value) ? value.map(v => JSON.parse(canonical(v)))
  : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(k => [k, JSON.parse(canonical(value[k]))])) : value);
const require = (condition, message) => { if (!condition) throw new Error(message); };
const readJson = path => JSON.parse(readFileSync(path, 'utf8'));
const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];
const PREFIXES = ['C', 'U', 'R', 'E', 'L', 'M'];
const BUNDLES = { production: 'com.snowprintstudios.tacticus', preview: 'com.snowprintstudios.loki.qa' };

export function selectConfiguration(catalog, fingerprint) {
  require(catalog.schemaVersion === 1 && Array.isArray(catalog.configurations), 'Unsupported LocalDatabase raid catalog');
  require(Array.isArray(catalog.rotation) && new Set(catalog.rotation).size === catalog.rotation.length, 'Invalid config rotation');
  require(new Set(catalog.configurations.map(c => c.configId)).size === catalog.configurations.length, 'Duplicate configuration IDs');
  for (const c of catalog.configurations) {
    require(c.fingerprint === sha256(canonical({ slots: c.slots, loop: c.loop })), `Changed configuration content: ${c.configId}`);
  }
  const matches = catalog.configurations.filter(c => c.fingerprint === fingerprint);
  require(matches.length === 1, `Expected one matching configuration; found ${matches.length}. Review the season binding.`);
  require(catalog.rotation.includes(matches[0].configId), 'Selected configuration is outside the rotation');
  return matches[0];
}

export function normalizeConfiguration(config, mappings) {
  require(mappings.schemaVersion === 1, 'Unsupported Replay Library mapping schema');
  const slots = config.slots.map(s => {
    require(Number.isInteger(s.tierIndex) && Number.isInteger(s.setIndex) && s.setIndex >= 0, 'Invalid tier/set index');
    const boss = mappings.bossTypes[s.bossType];
    const map = mappings.mapsByBoss[boss]?.[s.boardId];
    require(boss && map, `Unmapped boss/map: ${s.bossType} / ${s.boardId}. Add a reviewed Replay Library mapping.`);
    return { tier: `${PREFIXES[s.tierIndex]}${s.setIndex + 1}`, rarity: RARITIES[s.tierIndex], boss, bossVariant: s.bossType, map };
  });
  require(JSON.stringify(slots.map(s => s.tier)) === JSON.stringify(TIERS), 'Season slot structure changed; review the template before import');
  const loop = config.loop.map(s => `${PREFIXES[s.tierIndex]}${s.setIndex + 1}`).reverse();
  require(JSON.stringify(loop) === JSON.stringify(['M3', 'M2', 'M1', 'L5', 'L4']), 'Repeat loop changed; review the template before import');
  return { loop, slots };
}

export function seasonFromCatalog(binding, catalogText, mappings) {
  require(Number.isInteger(binding.season) && binding.season > 0, 'Invalid season number');
  require(/^\d{4}-\d{2}-\d{2}$/.test(binding.startDate) && new Date(`${binding.startDate}T00:00:00Z`).toISOString().slice(0, 10) === binding.startDate, 'Invalid season date');
  require(sha256(catalogText) === binding.catalogSha256, 'LocalDatabase catalog checksum mismatch');
  const catalog = JSON.parse(catalogText);
  require(sha256(canonical(catalog)).slice(0, 20) === binding.generation, 'Pinned generation mismatch');
  require(catalog.source.channel === binding.channel && catalog.source.bundleId === BUNDLES[binding.channel], 'Production/preview source mismatch');
  require(catalog.source.appVersion === binding.appVersion, 'Application build mismatch');
  const config = selectConfiguration(catalog, binding.configFingerprint);
  const content = normalizeConfiguration(config, mappings);
  require(sha256(canonical(content)) === binding.expectedLineupSha256, 'Boss/map/loop lineup changed. Review differences before updating the season binding.');
  return {
    season: binding.season, startDate: binding.startDate, status: binding.status,
    config: config.configId,
    source: { system: 'LocalDatabase', schemaVersion: 1, channel: binding.channel, appVersion: binding.appVersion,
      generation: binding.generation, catalogSha256: binding.catalogSha256, configFingerprint: binding.configFingerprint,
      mappingsSha256: sha256(canonical(mappings)), seasonBindingSha256: sha256(canonical(binding)) },
    ...content,
  };
}

export function loadSeasonSource(season, { localDatabase = resolve(SITE, '../LocalDatabase'), frozen = false, site = SITE } = {}) {
  const registry = readJson(resolve(site, 'src/data/guild-raid/season-sources.json'));
  require(registry.schemaVersion === 1, 'Unsupported season registry schema');
  require(new Set(registry.seasons.map(s => s.season)).size === registry.seasons.length, 'Duplicate season bindings');
  const binding = registry.seasons.find(s => s.season === Number(season));
  require(binding, `Season ${season} has no explicit LocalDatabase binding. No rotation/date extrapolation is performed.`);
  require(/^[a-f0-9]{20}$/.test(binding.generation), 'Invalid snapshot generation');
  const snapshotRelativePath = `src/data/guild-raid/sources/${binding.generation}.json`;
  const sourcePath = frozen ? resolve(site, snapshotRelativePath)
    : resolve(localDatabase, `data/processed/guild-raids/generations/${binding.generation}/catalog.json`);
  require(existsSync(sourcePath), `Pinned LocalDatabase snapshot missing: ${sourcePath}. Restore that generation; never substitute the current index.`);
  const catalogText = readFileSync(sourcePath, 'utf8');
  const mappings = readJson(resolve(site, 'src/data/guild-raid/replay-mappings.json'));
  const lineup = seasonFromCatalog(binding, catalogText, mappings);
  require(binding.dateEvidence?.file && binding.dateEvidence?.note, 'Missing verified season/date evidence');
  const evidencePath = resolve(site, binding.dateEvidence.file);
  require(!relative(site, evidencePath).startsWith('..'), 'Season evidence must be inside the site');
  require(sha256(readFileSync(evidencePath)) === binding.dateEvidence.sha256, 'Season/date evidence changed; review the binding');
  const maps = readJson(resolve(site, 'src/data/replay-library/maps_directory.json'));
  for (const slot of lineup.slots) {
    require(maps.some(m => m.boss_name === slot.boss && m.map_name.replaceAll(' ', '_') === slot.map), `Map absent from Replay Library: ${slot.map}`);
    for (const asset of [`maps/${slot.map}`, `bosses/${slot.boss.replaceAll(' ', '_')}`]) {
      require(existsSync(resolve(site, `public/images/replay-library/${asset}.webp`)), `Missing artwork: ${asset}`);
    }
  }
  return { lineup, catalogText, snapshotRelativePath };
}

// Validate and prepare all outputs before replacing any. Retain original bytes
// for rollback on an I/O error; unchanged snapshots are not rewritten.
export function writeOutputs(outputs) {
  const id = randomUUID();
  const entries = Object.entries(outputs).filter(([path, text]) => !existsSync(path) || readFileSync(path, 'utf8') !== text)
    .map(([path, text]) => ({ path, text, temporary: `${path}.${id}.tmp`, original: existsSync(path) ? readFileSync(path) : null }));
  const replaced = [];
  try {
    for (const e of entries) { mkdirSync(dirname(e.path), { recursive: true }); writeFileSync(e.temporary, e.text); }
    for (const e of entries) { renameSync(e.temporary, e.path); replaced.push(e); }
  } catch (error) {
    for (const e of replaced.reverse()) {
      if (e.original !== null) { writeFileSync(e.temporary, e.original); renameSync(e.temporary, e.path); }
      else unlinkSync(e.path);
    }
    throw error;
  } finally {
    for (const e of entries) if (existsSync(e.temporary)) unlinkSync(e.temporary);
  }
  return entries.length;
}
