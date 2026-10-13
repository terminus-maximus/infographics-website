// Run after npm run build. Optionally supply the source report for full reconciliation.
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eligibleCharacters, highPointsCombinations, selectedPoints } from '../src/lib/lrePlanner.ts';
import { readReport, normalizeReport } from './import-fabius-lre.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFileSync(resolve(root, path), 'utf8');
const dataText = read('src/data/lre/fabius.json');
const data = JSON.parse(dataText);
const page = read('dist/lre/fabius/index.html');

// Keep the original preview-era fixture as well as the reviewed production refresh.
const fixtures = {
  '1.42.166': { characters: 117, pools: [
    { allowed: 91, counts: [5, 8, 13, 41, 74] },
    { allowed: 79, counts: [10, 59, 8, 9, 45] },
    { allowed: 64, counts: [12, 7, 12, 8, 49] },
  ] },
  '1.43.130': { characters: 119, pools: [
    { allowed: 92, counts: [5, 8, 13, 42, 75] },
    { allowed: 80, counts: [10, 60, 8, 9, 46] },
    { allowed: 66, counts: [12, 7, 12, 8, 51] },
  ] },
};
const fixture = fixtures[data.characterBuild];
assert(fixture, `Review pool expectations for character build ${data.characterBuild}`);
assert.equal(data.characters.length, fixture.characters);
assert.equal(new Set(data.characters.map(character => character.id)).size, fixture.characters);
assert(!/marketing|\/Users\/|file:\/\//i.test(dataText));
const sources = JSON.parse(read('src/data/lre/sources.json'));
assert.equal(sources.events.fabius.characterBuild, data.characterBuild);
if (data.characterBuild === '1.43.130') {
  assert.equal(sources.events.fabius.eventBuild, '1.43.130');
  assert.equal(sources.events.fabius.eventSource, 'production');
  for (const id of ['lostaBile', 'orksWeirdboy']) assert(data.characters.some(unit => unit.id === id));
} else {
  assert(!data.characters.some(unit => ['lostaBile', 'orksWeirdboy'].includes(unit.id)));
}
assert(!/Battle points<|Rules &amp; evidence|Character coverage<|All heroes ranked|Useful requirement intersections|1\.43\.94/i.test(page));
assert(!/<meta name="robots"[^>]*noindex/.test(page), 'The public guide must allow indexing');
assert.match(page, /High Points Combinations/);
assert.match(page, /src="\/images\/web\/fabius-lre.webp"/);
assert.match(page, /href="\/images\/fabius-lre.png"/);
assert(page.indexOf('Fabius Bile LRE Basics') < page.indexOf('id="tracks-heading"'));
for (const unit of data.characters) assert(existsSync(resolve(root, `public${unit.portrait}`)), `Missing portrait: ${unit.name}`);

const expected = fixture.pools;
for (const [index, track] of data.tracks.entries()) {
  assert.equal(eligibleCharacters(data.characters, track.id).length, expected[index].allowed);
  assert.deepEqual(track.requirements.map(requirement => eligibleCharacters(data.characters, track.id, [requirement.id]).length), expected[index].counts);
  assert.equal(selectedPoints(track, track.requirements.map(requirement => requirement.id)), 375);
  assert.equal(eligibleCharacters(data.characters, track.id, track.requirements.map(requirement => requirement.id)).length, 0);
  const combinations = highPointsCombinations(data.characters, track);
  for (const [i, combo] of combinations.entries()) {
    assert(combo.characters.length >= 3 && combo.requirements.length >= 2);
    assert.equal(combo.points, combo.requirements.reduce((sum, requirement) => sum + requirement.points, 0));
    assert(i === 0 || combinations[i - 1].points >= combo.points);
  }
}
assert.deepEqual(eligibleCharacters(data.characters, 'alpha', ['alpha_0', 'alpha_2']).map(character => character.name), ['Helbrecht', 'Jaeger', 'Thoread']);
assert.deepEqual(eligibleCharacters(data.characters, 'beta', ['beta_0', 'beta_1', 'beta_4']).map(character => character.name), ['Hascule', 'Incisus', 'Tarvakh', 'Trajann']);
assert(!eligibleCharacters(data.characters, 'alpha').some(character => character.id === 'blackAbaddon'), 'Excluded factions must never appear, even without requirement filters');

// Public promotion: global navigation, ordered landing cards and recommendation eligibility.
const htmlFiles = readdirSync(resolve(root, 'dist'), { recursive: true }).filter(path => path.endsWith('index.html'));
const lreOrder = ['/lre/fabius', '/lre/farsight', '/lre/lysander', '/lre/uthar'];
let navigationPages = 0;
for (const path of htmlFiles) {
  const html = read(`dist/${path}`);
  if (/<meta[^>]*http-equiv="refresh"/i.test(html)) continue; // Redirect documents have no navigation.
  const menu = html.match(/id="lre-menu"[^>]*>([\s\S]*?)<\/div>/)?.[1];
  assert(menu?.includes('href="/lre/fabius"'), `Missing global navigation in ${path}`);
  assert.deepEqual([...menu.matchAll(/href="([^"]+)"/g)].map(match => match[1]), lreOrder, `Wrong LRE navigation order in ${path}`);
  navigationPages++;
}
const home = read('dist/index.html');
const homeSections = [...home.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/g)].map(match => match[1]);
assert(homeSections[1].includes('href="/campaign-event"'));
assert(/<h2\b[^>]*>Fabius Bile LRE Guide<\/h2>/.test(homeSections[3]), 'Fabius must follow Campaign Event and HRE as the fourth homepage block, including the hero');
assert(homeSections[3].includes('Be ready for his first event November 8'));
const legendarySection = homeSections.find(section => section.includes('Legendary Guides'));
assert(legendarySection);
const cardRoutes = html => [...html.matchAll(/<a class="card" href="([^"]+)"/g)].map(match => match[1]);
assert.deepEqual(cardRoutes(legendarySection), lreOrder);
assert.deepEqual(cardRoutes(read('dist/lre/index.html')), lreOrder);
assert(read('dist/lre/lysander/index.html').includes('data-recommendation-route="/lre/fabius"'));
assert(!page.includes('data-recommendation-route="/lre/fabius"'), 'Do not recommend the guide to itself');

if (process.argv[2]) {
  const report = readReport(process.argv[2]);
  const catalog = JSON.parse(read('src/data/campaigns/characters.json')).characters;
  assert.deepEqual(data, normalizeReport(report, catalog));
  // Check all 96 filter states directly against the report's local roster.
  for (const track of data.tracks) {
    for (let mask = 0; mask < 32; mask++) {
      const ids = track.requirements.filter((_, index) => mask & (1 << index)).map(requirement => requirement.id);
      const expectedIds = report.rosters.local.filter(unit => {
        const eligibility = unit.variants.regular.eligibility[track.id];
        return eligibility.allowed && ids.every(id => eligibility.matches.includes(id));
      }).map(unit => unit.id).sort();
      assert.deepEqual(eligibleCharacters(data.characters, track.id, ids).map(unit => unit.id).sort(), expectedIds);
    }
  }
}
console.log(`Fabius checks passed: ${fixture.characters} local characters (${data.characterBuild}), 15 requirements, combinations, portraits, public indexing, homepage/LRE placement, recommendation eligibility, and navigation across ${navigationPages} pages.`);
