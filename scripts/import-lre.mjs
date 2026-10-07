// Build the site's compact, regular-roster planner datasets from one immutable
// LocalDatabase generation. Builds and browsers do not need the source database.
// Usage: node scripts/import-lre.mjs /path/to/data/processed/lre/index.json
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
export const eventRoutes = {
  farsight: { route: 'farsight', eventId: 'legendary_hero_event_13' },
  uthar: { route: 'uthar', eventId: 'legendary_hero_event_14' },
  lysander: { route: 'lysander', eventId: 'legendary_hero_event_15' },
  'fabius-bile': { route: 'fabius', eventId: 'legendary_hero_event_16' },
};
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

function inside(directory, path) {
  const absolute = resolve(directory, path);
  const local = relative(directory, absolute);
  assert(local && !local.startsWith('..') && !isAbsolute(local), `Invalid export path: ${path}`);
  return absolute;
}

export function readBackend(indexPath) {
  const base = dirname(resolve(indexPath));
  // Read the index once so concurrent backend refreshes cannot mix generations.
  const index = JSON.parse(readFileSync(indexPath, 'utf8'));
  assert.equal(index.schema_version, 2);
  const generationBase = inside(base, index.asset_base);
  const manifest = JSON.parse(readFileSync(inside(base, index.manifest), 'utf8'));
  assert.equal(manifest.generation, index.generation);
  function verifiedFile(path) {
    const absolute = inside(generationBase, path);
    const bytes = readFileSync(absolute);
    assert.equal(hash(bytes), manifest.files[path], `Manifest checksum mismatch: ${path}`);
    return bytes;
  }
  const events = Object.entries(eventRoutes).map(([slug, { route, eventId }]) => {
    const entries = index.events.filter(entry => entry.slug === slug);
    assert.equal(entries.length, 1, `Expected one ${slug} entry`);
    const entry = entries[0];
    const path = relative(generationBase, inside(base, entry.json));
    const bytes = verifiedFile(path);
    assert.equal(hash(bytes), entry.sha256, `${slug}: index checksum mismatch`);
    const source = JSON.parse(bytes);
    assert.equal(source.schema_version, 2);
    assert.equal(source.event.id, eventId);
    assert.equal(entry.event_id, eventId);
    assert.equal(source.event.slug, slug);
    assert.equal(source.source_status, entry.source_status);
    assert.equal(source.manifest.app_version, entry.event_version);
    assert.equal(source.snapshots.local.app_version, index.production_version);
    return { route, entry, source };
  });
  return { index, events, verifiedFile };
}

export function normalizeEvent(source, catalog) {
  assert.equal(source.default_snapshot, 'local', 'Review a change of default roster before importing');
  const roster = source.rosters.local;
  assert.equal(roster.length, source.snapshots.local.character_count);
  assert.equal(new Set(roster.map(unit => unit.id)).size, roster.length);
  assert.deepEqual(source.tracks.map(track => track.id), ['alpha', 'beta', 'gamma']);
  const tracks = source.tracks.map(track => {
    const stages = source.stages.filter(stage => stage.track === track.id);
    assert.equal(stages.length, track.battle_count);
    const factionNames = new Map(track.banned_faction_ids.map((id, i) => [id, track.banned_factions[i]]));
    const excludedGroups = [
      ...track.excluded_alliances,
      ...track.additional_banned_faction_ids.map(id => {
        assert(factionNames.get(id), `Missing banned faction label: ${id}`);
        return factionNames.get(id);
      }),
    ];
    // The text summary and precomputed eligibility must describe the same bans.
    for (const unit of roster) {
      const banned = track.banned_faction_ids.includes(unit.faction_id);
      assert.equal(banned, track.excluded_alliances.includes(unit.alliance)
        || track.additional_banned_faction_ids.includes(unit.faction_id), `${track.id}: incomplete ban summary`);
      assert.equal(unit.variants.regular.eligibility[track.id].allowed, !banned, `${unit.id}: faction ban mismatch`);
    }
    return {
      id: track.id,
      name: track.name,
      enemyFaction: track.enemy_faction,
      excludedGroups,
      requirements: track.requirements.map(requirement => {
        const scores = Object.values(requirement.scores_by_battle);
        assert.equal(scores.length, track.battle_count);
        // The existing UI promises a single per-battle bonus. Refuse a future
        // variable schedule until that UI can represent it accurately.
        assert(scores.length > 0 && scores.every(score => score === requirement.score),
          `${source.event.slug}/${requirement.id}: variable battle scores need planner support`);
        for (const stage of stages) {
          assert.equal(stage.requirement_points[requirement.id], requirement.scores_by_battle[stage.battle]);
        }
        return { id: requirement.id, label: requirement.label, points: requirement.score };
      }),
    };
  });
  const characters = roster.map(unit => ({
    id: unit.id,
    name: unit.name,
    faction: unit.faction,
    portrait: catalog[unit.id]?.portrait
      ? `/images/heroes/${catalog[unit.id].portrait}`
      : `/images/lre/portraits/${unit.id}.png`,
    eligibility: Object.fromEntries(tracks.map(track => {
      const entry = unit.variants.regular.eligibility[track.id];
      assert(entry.matches.every(id => track.requirements.some(requirement => requirement.id === id)),
        `${unit.id}: unknown requirement`);
      return [track.id, entry.allowed ? entry.matches : null];
    })),
  })).sort((a, b) => a.name.localeCompare(b.name, 'en'));
  return { characterBuild: source.snapshots.local.app_version, tracks, characters };
}

export function sourceRecord(index, events) {
  return {
    schemaVersion: index.schema_version,
    generation: index.generation,
    events: Object.fromEntries(events.map(({ route, entry, source }) => [route, {
      eventId: source.event.id,
      eventBuild: source.manifest.app_version,
      eventSource: source.source_status,
      characterBuild: source.snapshots.local.app_version,
      snapshot: 'local',
      mode: 'regular',
      sha256: entry.sha256,
    }])),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert(process.argv[2], 'Supply the LocalDatabase LRE index.json path');
  const { index, events, verifiedFile } = readBackend(process.argv[2]);
  const catalog = JSON.parse(readFileSync(resolve(root, 'src/data/campaigns/characters.json'), 'utf8')).characters;
  const pending = new Map();
  for (const { route, source } of events) {
    const data = normalizeEvent(source, catalog);
    for (const unit of data.characters) {
      const target = resolve(root, `public${unit.portrait}`);
      if (existsSync(target)) continue;
      const original = source.rosters.local.find(row => row.id === unit.id);
      pending.set(target, verifiedFile(original.portrait));
    }
    pending.set(resolve(root, `src/data/lre/${route}.json`), JSON.stringify(data, null, 2) + '\n');
  }
  pending.set(resolve(root, 'src/data/lre/sources.json'), JSON.stringify(sourceRecord(index, events), null, 2) + '\n');
  // Finish source validation for every event before changing any site files.
  for (const [target, bytes] of pending) {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, bytes);
  }
  console.log(`Imported ${events.length} LREs from generation ${index.generation}, using the ${index.production_version} regular roster.`);
}
