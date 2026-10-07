// Run after npm run build. Add a backend index path for full source reconciliation.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eligibleCharacters, highPointsCombinations, selectedPoints } from '../src/lib/lrePlanner.ts';
import { eventRoutes, readBackend, normalizeEvent, sourceRecord } from './import-lre.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFileSync(resolve(root, path), 'utf8');
const ids = units => units.map(unit => unit.id).sort();
const key = requirements => [...requirements].sort().join(' ');
const catalog = JSON.parse(read('src/data/campaigns/characters.json')).characters;
const backend = process.argv[2] ? readBackend(process.argv[2]) : null;
if (backend) assert.deepEqual(JSON.parse(read('src/data/lre/sources.json')), sourceRecord(backend.index, backend.events));
let filterStates = 0;

for (const { route } of Object.values(eventRoutes)) {
  const text = read(`src/data/lre/${route}.json`);
  const data = JSON.parse(text);
  const page = read(`dist/lre/${route}/index.html`);
  const source = backend?.events.find(event => event.route === route).source;
  assert.equal(new Set(ids(data.characters)).size, data.characters.length);
  assert(!/\/Users\/|file:\/\//.test(text), 'Do not ship local source paths');
  if (source) assert.deepEqual(data, normalizeEvent(source, catalog));
  for (const character of data.characters) {
    assert(existsSync(resolve(root, `public${character.portrait}`)), `${route}: missing portrait for ${character.name}`);
  }

  assert(!/<meta name="robots"[^>]*noindex/.test(page));
  const sectionOrder = ['Featured Infographic', 'LRE Basics', 'More Event Details', 'id="combinations-heading"', 'id="tracks-heading"'];
  if (route !== 'fabius') sectionOrder.push('Other Resources');
  for (const [i, title] of sectionOrder.entries()) {
    assert(page.includes(title), `${route}: missing ${title}`);
    if (i) assert(page.indexOf(sectionOrder[i - 1]) < page.indexOf(title), `${route}: misplaced ${title}`);
  }
  assert.match(page, /<details class="event-details"[^>]*>.*?Event Goal.*?Long-Term Strategy.*?<\/details>/s);
  assert(!/<details class="event-details"[^>]*\bopen\b/.test(page), 'Event details should start collapsed');
  assert(page.includes(`src="/images/web/${route}-lre.webp"`));
  assert(page.includes(`href="/images/${route}-lre.png"`));
  assert.equal([...page.matchAll(/data-select-track="/g)].length, data.tracks.length * 2);
  const payload = page.match(/<script[^>]*data-planner-data[^>]*>(.*?)<\/script>/s);
  assert(payload, `${route}: missing interactive planner data`);
  const renderedData = JSON.parse(payload[1]);
  assert.deepEqual(ids(renderedData.characters), ids(data.characters));
  for (const track of renderedData.tracks) {
    assert.deepEqual(track.requirements.map(r => r.points), track.requirements.map(r => r.points).sort((a, b) => b - a));
  }

  for (const track of data.tracks) {
    assert(page.includes(`No ${track.excludedGroups.join(' or ')} characters`));
    const combinations = highPointsCombinations(data.characters, track);
    const allCombinations = [];
    for (let mask = 0; mask < 2 ** track.requirements.length; mask++) {
      const selected = track.requirements.filter((_, i) => mask & (1 << i));
      const requirementIds = selected.map(r => r.id);
      const pool = eligibleCharacters(data.characters, track.id, requirementIds);
      const points = selected.reduce((sum, requirement) => sum + requirement.points, 0);
      assert.equal(selectedPoints(track, requirementIds), points);
      if (selected.length >= 2 && pool.length >= 3) allCombinations.push({ requirementIds, pool, points });
      if (source) {
        // Reconcile every state against the backend's authoritative bans and matches.
        const sourceTrack = source.tracks.find(row => row.id === track.id);
        const expected = source.rosters.local.filter(unit => {
          const entry = unit.variants.regular.eligibility[track.id];
          return !sourceTrack.banned_faction_ids.includes(unit.faction_id)
            && entry.allowed && requirementIds.every(id => entry.matches.includes(id));
        });
        assert.deepEqual(ids(pool), ids(expected), `${route}/${track.id}: ${key(requirementIds)}`);
      }
      filterStates++;
    }
    assert.equal(combinations.length, Math.min(12, allCombinations.length));
    assert.deepEqual(combinations.map(combo => [combo.points, combo.characters.length]),
      allCombinations.sort((a, b) => b.points - a.points || b.pool.length - a.pool.length)
        .slice(0, 12).map(combo => [combo.points, combo.pool.length]));
    if (source) {
      const intersections = source.intersections.local.regular[track.id];
      assert.equal(allCombinations.length, intersections.length);
      for (const combo of allCombinations) {
        const expected = intersections.find(row => key(row.requirement_ids) === key(combo.requirementIds));
        assert(expected, `${route}/${track.id}: missing backend combination`);
        assert.equal(combo.points, expected.points);
        assert.deepEqual(ids(combo.pool), [...expected.unit_ids].sort());
      }
    }
  }
  if (route === 'farsight') {
    const gamma = data.tracks.find(track => track.id === 'gamma');
    assert.deepEqual(gamma.excludedGroups, ['Chaos', 'Orks']);
    const pool = eligibleCharacters(data.characters, 'gamma');
    assert(!pool.some(unit => ['Orks', 'Black Legion', 'Death Guard', 'Thousand Sons', 'World Eaters', "Emperor's Children"].includes(unit.faction)));
  }
  console.log(`${route}: layout, portraits, restrictions, filters and combinations passed${source ? ' against backend' : ''}.`);
}

if (backend) {
  const changed = structuredClone(backend.events[0].source);
  changed.tracks[0].requirements[0].scores_by_battle['2'] += 1;
  assert.throws(() => normalizeEvent(changed, catalog), /variable battle scores/, 'Do not silently flatten changed battle scores');
}
console.log(`All four LRE pages passed; ${filterStates} filter states checked.`);
