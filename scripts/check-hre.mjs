import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFileSync(root + path, 'utf8');
const data = JSON.parse(read('src/data/hre/daras.json'));
assert.ok(!existsSync(root + 'public/data/hre/daras.json'), 'HRE source data must not be published.');
assert.ok(!existsSync(root + 'dist/data/hre/daras.json'), 'Build must not expose the HRE JSON.');
assert.equal(data.missions.length, 21);
assert.equal(data.missions.flatMap(q => q.objectives).length, 42);
assert.equal(new Set(data.missions.map(q => q.id)).size, 21);
for (const mission of data.missions) {
  for (const objective of mission.objectives) {
    assert.ok(objective.help && objective.text);
    assert.ok(existsSync(root + 'public' + data.assets[objective.icon].src));
  }
}
const html = read('dist/hre/index.html');
assert.ok(html.indexOf('Hero Release Event Basics') < html.indexOf('id="missions"'));
assert.ok(html.indexOf('id="missions"') < html.indexOf('id="related-discussions-heading"'));
assert.equal((html.match(/data-mission-id="/g) || []).length, 21);
assert.equal((html.match(/class="objective"/g) || []).length, 42);
assert.match(html, /id="mission-bonus"/);
assert.match(html, /1<\/strong> Requisition Order/);
for (const src of new Set([...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m => m[1]))) {
  if (src.startsWith('/')) assert.ok(existsSync(root + 'public' + src), `Missing image: ${src}`);
}
assert.doesNotMatch(html, /\{\[|\[i2p_/);
assert.doesNotMatch(html, /Download mission data|\/data\/hre\/daras\.json/);
console.log('HRE verified: 21 cards, 42 objectives, icons, bonus reward, section placement and no public JSON download.');
