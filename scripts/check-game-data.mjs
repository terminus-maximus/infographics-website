import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(readFileSync(path, 'utf8'));
const version = '1.44.88';
const hero = read('src/data/heroes/reference.json');
const machines = read('src/data/incursion/machine-reference.json');
for (const data of [hero, machines, read('src/data/heroes/relics.json')]) {
  assert.equal(data.snapshot.app_version, version);
  assert.equal(data.snapshot.config_full_hash, hero.snapshot.config_full_hash);
  assert.deepEqual(data.snapshot.snapshot_files, hero.snapshot.snapshot_files);
}
assert.equal(hero.heroes.length, 120);
assert.equal(machines.machines.length, 12);
assert.equal(read('src/data/heroes/faction-artwork.json').app_version, version);
assert.equal(read('src/data/heroes/filter-icons.json').app_version, version);
for (const portrait of Object.values(read('src/data/heroes/round-portraits.json'))) assert.equal(portrait.app_version, version);
const sources = read('src/data/lre/sources.json');
for (const [slug, source] of Object.entries(sources.events)) {
  assert.equal(source.characterBuild, version);
  assert.equal(source.eventBuild, version);
  assert.equal(source.eventSource, 'production');
  const data = read(`src/data/lre/${slug}.json`);
  assert.equal(data.characters.length, 120);
}
const ce = read('src/data/campaign-events/guides.json');
assert.equal(ce.snapshot.characterBuild, version);
assert.equal(ce.events.length, 7);
for (const event of ce.events) {
  assert.equal(event.rewards.source.gameVersion, version);
  assert.equal(event.rewards.source.preview, false);
  assert.equal(event.stageRules.length, 33);
  assert.doesNotMatch(event.ruleNote + event.rosterNote, /1\.43|1\.44\.120|Marketing|QA/);
  assert.doesNotMatch(event.research.gaps.join(' '), /1\.44\.120|Marketing \/ QA/);
}
const incursion = read('src/data/incursion/game-rules.json');
assert.equal(incursion.gameVersion, version);
assert.equal(Object.keys(incursion.machines).length, 12);
for (const machine of Object.values(incursion.machines)) {
  assert.equal(machine.tierRewards.length, 14);
  for (const row of machine.tierRewards) assert.ok(row.initialClear >= row.initialClearMinimum);
}
assert.equal(incursion.machines.tyranBiovore.tierRewards.find(r => r.tier === 4).initialClear, 36);
assert.equal(incursion.machines.deathCrawler.tierRewards.find(r => r.tier === 12).initialClear, 50);
for (const source of read('src/data/guild-raid/season-sources.json').seasons) {
  assert.equal(source.appVersion, version);
  assert.equal(source.channel, 'production');
}
const artwork = read('src/data/news/artwork.json');
assert.equal(artwork.game_version, version);
const replayArtwork = read('src/data/replay-library/game-artwork.json');
assert.equal(replayArtwork.game_version, version);
assert.equal(Object.keys(replayArtwork.icons).length, 51);
for (const asset of [...Object.values(artwork.icons), ...Object.values(artwork.clear_factions), ...Object.values(replayArtwork.icons)]) {
  assert.equal(createHash('sha256').update(readFileSync(`public${asset.src}`)).digest('hex'), asset.sha256);
}
for (const path of ['src/data/updates/1.44.120-reference.json', 'src/data/updates/1.44.120-profiles.json', 'scripts/update-144-reference.py']) assert.equal(existsSync(path), false, `Retired preview dependency returned: ${path}`);
console.log(`Production ${version}: 120 heroes, 12 machines, 4 LREs, 7 Campaign Events, Incursion rewards, artwork and raid bindings agree.`);
