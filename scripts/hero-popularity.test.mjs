import test from 'node:test';
import assert from 'node:assert/strict';
import { heroes, publication } from '../src/lib/heroes.mjs';
import { popularityBenchmark, popularityInsight } from '../src/lib/hero-popularity.mjs';

test('current and monthly insights use the largest full-roster milestone', () => {
  for (const roster of [heroes, publication.heroes]) {
    const benchmark = popularityBenchmark(roster);
    assert.deepEqual(benchmark, {count:10456,hero:'Bellator',milestone:'S1',label:'Silver I'});
    const insight = popularityInsight({counts:{G1:8992,D1:7416,D3:4182,A2:2936}},benchmark);
    assert.match(insight,/86\.0% at Gold I/);
    assert.match(insight,/40\.0% at Diamond III or higher/);
    assert.match(insight,/28\.1% at Adamantine II\.$/);
    assert.doesNotMatch(insight,/8,992|Five equally weighted|Compared with|benchmark|Adamantine II or higher/);
  }
});

test('the benchmark follows its supplied edition and can be another hero or milestone', () => {
  const frozen = [{name:'First',assessments:{popularity:{counts:{S1:100,G1:80}}}}];
  const current = [...frozen,{name:'Second',assessments:{popularity:{counts:{G1:200}}}}];
  assert.equal(popularityBenchmark(frozen).count,100);
  assert.deepEqual(popularityBenchmark(current),{count:200,hero:'Second',milestone:'G1',label:'Gold I'});
});

test('missing counts stay pending and small positive counts do not display as zero', () => {
  const benchmark = popularityBenchmark(heroes);
  assert.match(popularityInsight({counts:{G1:0,D1:1,D3:null,A2:0}},benchmark),/pending/);
  assert.match(popularityInsight({counts:{G1:1,D3:0,A2:0}},benchmark),/<0\.1% at Gold I.*0\.0% at Diamond III or higher/);
  assert.equal(popularityBenchmark([{name:'Missing',assessments:{popularity:{counts:{S1:null}}}}]),null);
});
