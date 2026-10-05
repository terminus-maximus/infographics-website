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

assert.equal(data.characterBuild, '1.42.166');
assert.equal(data.characters.length, 117);
assert.equal(new Set(data.characters.map(character => character.id)).size, 117);
assert(!/1\.43|marketing|orksWeirdboy|lostaBile|\/Users\/|file:\/\//i.test(dataText));
assert(!/Battle points<|Rules &amp; evidence|Character coverage<|All heroes ranked|Useful requirement intersections|1\.43\.94/i.test(page));
assert.match(page, /<meta name="robots" content="noindex, nofollow, noimageindex"/);
assert.match(page, /High Points Combinations/);
assert.match(page, /src="\/images\/web\/fabius-lre.webp"/);
assert.match(page, /href="\/images\/fabius-lre.png"/);
assert(page.indexOf('Fabius Bile LRE Basics') < page.indexOf('id="tracks-heading"'));
for (const unit of data.characters) assert(existsSync(resolve(root, `public${unit.portrait}`)), `Missing portrait: ${unit.name}`);

const expected = [
  { allowed: 91, counts: [5, 8, 13, 41, 74] },
  { allowed: 79, counts: [10, 59, 8, 9, 45] },
  { allowed: 64, counts: [12, 7, 12, 8, 49] },
];
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

// Search every built page, including hidden recommendation candidates, for leaks.
const htmlFiles = readdirSync(resolve(root, 'dist'), { recursive: true }).filter(path => path.endsWith('.html'));
for (const path of htmlFiles) {
  if (path === 'lre/fabius/index.html') continue;
  assert(!/\/lre\/fabius|fabius-lre|High Points Combinations|orksWeirdboy/i.test(read(`dist/${path}`)), `Unlisted content exposed in ${path}`);
}

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
console.log(`Fabius checks passed: 117 local characters, 15 requirements, combinations, portraits, noindex, and no exposure across ${htmlFiles.length - 1} other pages.`);
