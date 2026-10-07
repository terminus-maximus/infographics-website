// Legacy research reconciliation. For current exports, use import-lre.mjs.
// Usage: node scripts/import-fabius-lre.mjs /path/to/fabius-bile-lre16.html
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

export function readReport(path) {
  const html = readFileSync(path, 'utf8');
  const match = html.match(/const D=(\{[^\n]+\});/);
  assert(match, 'Missing report dataset');
  return JSON.parse(match[1]);
}

export function normalizeReport(report, catalog) {
  assert.equal(report.local_database_snapshot.app_version, '1.42.166');
  assert.equal(report.event.id, 'legendary_hero_event_16');
  const tracks = report.tracks.map(track => ({
    id: track.id,
    name: track.name,
    enemyFaction: track.enemy_faction,
    excludedGroups: [track.excluded_alliance],
    requirements: track.requirements.map(({ id, label, score }) => ({ id, label, points: score })),
  }));
  const characters = report.rosters.local.map(unit => ({
    id: unit.id,
    name: unit.name,
    faction: unit.faction,
    portrait: catalog[unit.id]?.portrait
      ? `/images/heroes/${catalog[unit.id].portrait}`
      : `/images/lre/portraits/${unit.id}.png`,
    eligibility: Object.fromEntries(tracks.map(track => {
      const entry = unit.variants.regular.eligibility[track.id];
      return [track.id, entry.allowed ? entry.matches : null];
    })),
  })).sort((a, b) => a.name.localeCompare(b.name, 'en'));
  assert.equal(characters.length, 117);
  assert(!characters.some(unit => ['lostaBile', 'orksWeirdboy'].includes(unit.id)));
  return { characterBuild: '1.42.166', tracks, characters };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert(process.argv[2], 'Supply the local HTML report path');
  const reportPath = resolve(process.argv[2]);
  const report = readReport(reportPath);
  const catalog = JSON.parse(readFileSync(resolve(root, 'src/data/campaigns/characters.json'), 'utf8')).characters;
  const data = normalizeReport(report, catalog);
  for (const unit of data.characters) {
    const target = resolve(root, `public${unit.portrait}`);
    if (existsSync(target)) continue;
    const source = report.rosters.local.find(row => row.id === unit.id);
    assert(source.portrait.startsWith('assets/round_portraits/'), 'Only local database portraits may be copied');
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(resolve(dirname(reportPath), source.portrait), target);
  }
  const target = resolve(root, 'src/data/lre/fabius.json');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(data, null, 2) + '\n');
  console.log(`Imported ${data.characters.length} characters from ${data.characterBuild} and ${data.tracks.length} tracks.`);
}
