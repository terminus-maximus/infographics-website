import test from 'node:test';
import assert from 'node:assert/strict';
import { summaryTone, overallSummary } from '../src/lib/hero-summaries.mjs';

test('summary tone follows precise score boundaries, including the gaps between requested bands',()=>{
  for (const [score,tone] of [[10,'powerful'],[8,'powerful'],[7.999,'optimistic'],[6,'optimistic'],[5.999,'measured'],[5,'measured'],[4.999,'cautious'],[4,'cautious'],[3.999,'guarded'],[3,'guarded'],[2.999,'weak'],[2,'weak'],[1.999,'poor'],[1,'poor']]) {
    assert.equal(summaryTone(score),tone,`Score ${score}`);
  }
});

test('pending stays neutral and invalid scores cannot become pessimistic ratings',()=>{
  assert.equal(summaryTone(null),'pending');
  for(const invalid of [undefined,NaN,Infinity,-1,0,10.01,'8']) assert.throws(()=>summaryTone(invalid));
  assert.match(overallSummary('lostaBile',null),/under review/);
});

test('missing copy and score-band changes require an editorial review',()=>{
  assert.match(overallSummary('custoBladeChampion',9.5),/powerhouse/);
  assert.throws(()=>overallSummary('custoBladeChampion',5),/score band change/);
  assert.throws(()=>overallSummary('lostaBile',7),/score band change/);
  assert.throws(()=>overallSummary('unknown',7),/1–15 words/);
});
