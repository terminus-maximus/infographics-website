import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { calculate, requiredBonus, rankRows, topRows, formatOverall, sortHeroes, matchesHero, validateRelease } from '../src/lib/hero-scoring.mjs';
const required = category => ({category,role:'required',status:'current',evidence:[{kind:'required_hero'}]});
const scores = (raid,war,horde,popularity=7) => ({raid,war,horde,popularity});
test('approved worked examples, pending scores and original precision', () => {
  assert.equal(formatOverall(calculate(scores(8,7,6),0).final),'7.00');
  assert.equal(formatOverall(calculate(scores(8,7,6),requiredBonus([required('campaign')])).final),'7.25');
  assert.equal(calculate(scores(8,7,6),requiredBonus([required('campaign'),required('event_campaign')])).final,7.25);
  assert.equal(calculate(scores(10,10,10,9.5),0.25).final,10);
  assert.equal(calculate(scores(null,7,6),0.25).final,null);
  assert.equal(calculate(scores(8.04,7.04,6.04,7.04),0).final,(8.04+7.04+6.04+7.04)/4);
  assert.equal(formatOverall(calculate(scores(8.04,7.04,6.04,7.04),0).final),'7.04');
});
test('Popularity retains original precision and is required', () => {
  assert.equal(calculate(scores(8,8,8,null),0.25).final,null);
  assert.throws(()=>calculate({raid:8,war:8,horde:8},0));
  const first=calculate(scores(8,8,8,7.00004),0.25).final;
  const second=calculate(scores(8,8,8,8),0).final;
  assert.ok(first>second);
  assert.equal(formatOverall(first),formatOverall(second));
  assert.deepEqual(rankRows([{name:'A',final_score:second},{name:'Z',final_score:first}]).map(r=>r.name),['Z','A']);
});
test('only explicit current required evidence qualifies, never stacking', () => {
  for (const role of ['optional','supporting','flex','prose-only','replay-only','table-only','reference']) assert.equal(requiredBonus([{...required('campaign'),role}]),0);
  assert.equal(requiredBonus([required('incursion')]),0);
  assert.equal(requiredBonus([{...required('campaign'),status:'historical'}]),0);
  assert.equal(requiredBonus([{...required('campaign'),evidence:[{kind:'investment_table'}]}]),0);
  assert.equal(requiredBonus([required('campaign'),required('campaign'),required('event_campaign')]),0.25);
});
test('equivalent mode totals and guide bonuses preserve true competition ties', () => {
  const rows = rankRows([
    {name:'Kharn',final_score:calculate(scores(8,9,8),0).final},
    {name:'Abraxas',final_score:calculate(scores(8,8,8),0.25).final},
    {name:'Archimatos',final_score:calculate(scores(8,8,8),0.25).final},
  ]);
  assert.ok(rows.every(r=>r.final_score === 8 && r.rank === 1));
  assert.equal(topRows(rows,1).length,3);
});
test('accented names have deterministic shared order within ties and Pending', () => {
  const rows = rankRows([{name:'Hollan',final_score:6},{name:'Âmmuk',final_score:6},{name:'Zapspitta',final_score:null},{name:'Ûthar',final_score:null}]);
  assert.deepEqual(rows.map(r=>r.name),['Âmmuk','Hollan','Ûthar','Zapspitta']);
});
test('invalid values fail, including zero, strings, booleans and non-finite numbers', () => {
  for (const value of [0,-1,10.1,NaN,Infinity,-Infinity,'8',true,undefined]) assert.throws(()=>calculate(scores(value,7,6),0));
  assert.throws(()=>calculate(scores(8,7,6),2));
});
test('capped ties share competition ranks; display rounding never determines ties', () => {
  const rows = rankRows([
    {name:'Z',final_score:calculate(scores(10,10,10,9.5),0.25).final},
    {name:'A',final_score:calculate(scores(10,10,10,10),0.25).final},
    {name:'B',final_score:8.004}, {name:'C',final_score:8.003}, {name:'D',final_score:null},
  ]);
  assert.deepEqual(rows.map(r=>r.rank),[1,1,3,4,null]);
  assert.deepEqual(rows.slice(0,2).map(r=>r.name),['A','Z']);
  assert.equal(formatOverall(rows[2].final_score),formatOverall(rows[3].final_score));
});
test('cutoff includes every exact tie with the tenth hero, not ten score groups', () => {
  const rows = Array.from({length:9},(_,i)=>({name:`Hero ${i}`,final_score:10-i/10}));
  rows.push({name:'Z',final_score:9},{name:'A',final_score:9},{name:'Last',final_score:8.9},{name:'Pending',final_score:null});
  assert.equal(topRows(rows).length,11);
  assert.deepEqual(topRows(rows).slice(-2).map(r=>r.name),['A','Z']);
  assert.equal(topRows(rows,10,false).length,10);
  assert.equal(topRows(rows.slice(0,3)).length,3);
});
test('directory defaults alphabetical, sorts original numeric values, missing always last', () => {
  const rows = [{name:'Z',overall:null},{name:'B',overall:8.004},{name:'A',overall:8.003}];
  assert.deepEqual(sortHeroes(rows).map(h=>h.name),['A','B','Z']);
  assert.deepEqual(sortHeroes(rows,'overall','desc').map(h=>h.name),['B','A','Z']);
  assert.deepEqual(sortHeroes(rows,'overall','asc').map(h=>h.name),['A','B','Z']);
});
test('combined filters use OR within, AND across, and search approved aliases', () => {
  const hero = {name:'Tigurius',full_name:'Varro Tigurius',aliases:['Tiggy'],alliance:'Imperial',traits:['Psyker'],damage:['Physical','Psychic']};
  assert.ok(matchesHero(hero,'tiggy',{alliance:['Imperial'],traits:['Healer','Psyker'],damage:['Psychic']}));
  assert.ok(!matchesHero(hero,'tiggy',{alliance:['Chaos'],traits:['Psyker']}));
  assert.ok(!matchesHero(hero,'missing',{}));
  assert.ok(matchesHero(hero,'',{alliance:[],traits:[]}));
});
test('incompatible or corrupt rankings are rejected', () => {
  const row = {unit_id:'test',name:'Test',...scores(8,7,6),equal_weight_average:7,guide_bonus:0,final_score:7,status:'scored',rank:1};
  const release = {policy:'overall-popularity-3.0',rank_convention:'competition',heroes:[row]};
  assert.ok(validateRelease(release,{test:[]}));
  assert.throws(()=>validateRelease({...release,policy:'old-policy'}));
  assert.throws(()=>validateRelease({...release,heroes:[{...row,final_score:8}]}));
  assert.throws(()=>validateRelease({...release,heroes:[{...row,rank:2}]}));
  assert.throws(()=>validateRelease(release,{}));
});
test('monthly publishing freezes original inputs and refuses silent replacement', () => {
  const root = mkdtempSync(join(tmpdir(),'hero-release-test-'));
  const project = resolve(import.meta.dirname,'..');
  try {
    for (const folder of ['scripts','src/lib','src/data/heroes']) mkdirSync(join(root,folder),{recursive:true});
    for (const file of ['scripts/publish-heroes.mjs','src/lib/hero-scoring.mjs','src/data/heroes/research.json','src/data/heroes/reference.json','src/data/heroes/publishing-policy.json']) copyFileSync(join(project,file),join(root,file));
    const run = (...extra) => spawnSync(process.execPath,[join(root,'scripts/publish-heroes.mjs'),'--month','2026-12','--date','2026-12-01',...extra],{encoding:'utf8'});
    assert.equal(run().status,0);
    const frozen = join(root,'src/data/heroes/releases/2026-12.json');
    const original = readFileSync(frozen,'utf8');
    assert.notEqual(run().status,0);
    assert.equal(readFileSync(frozen,'utf8'),original);
    const source = join(root,'src/data/heroes/research.json');
    const changed = JSON.parse(readFileSync(source));
    changed.assessments.custoBladeChampion.raid.short_justification = 'Later editorial revision';
    writeFileSync(source,JSON.stringify(changed));
    assert.equal(readFileSync(frozen,'utf8'),original);
    assert.notEqual(run('--attach-graphic').status,0);
    assert.equal(readFileSync(frozen,'utf8'),original);
    const metadata = join(root,'invalid-graphic.json');
    writeFileSync(metadata,JSON.stringify({month:'2025-12',release_id:'wrong',scores_sha256:'wrong'}));
    assert.notEqual(run('--attach-graphic','--graphic-metadata',metadata).status,0);
    assert.equal(readFileSync(frozen,'utf8'),original);
    assert.ok(!existsSync(frozen+'.tmp'));
  } finally { rmSync(root,{recursive:true,force:true}); }
});
