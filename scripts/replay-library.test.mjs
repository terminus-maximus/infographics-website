import test from 'node:test';
import assert from 'node:assert/strict';
import { createReplayLibraryData, parseReplayDamage, formatReplayDamage } from '../src/lib/replayLibrary.ts';

test('damage values and fallback estimates are normalized to numbers', () => {
  assert.equal(parseReplayDamage('1,190,000', '942000'), 1190000);
  assert.equal(parseReplayDamage(1190000, 942000), 1190000);
  assert.equal(parseReplayDamage('', '942,000'), 942000);
  assert.equal(parseReplayDamage(null, '942000'), 942000);
  assert.equal(parseReplayDamage(undefined, 942000), 942000);
  assert.equal(parseReplayDamage(' 1 190 000 ', null), 1190000);
  assert.equal(formatReplayDamage(parseReplayDamage('', '942,000')), '942K');
});

test('invalid, negative and non-finite damage cannot produce a positive score', () => {
  for (const invalid of [undefined, null, '', 'unknown', '-100', -100, '12.3.4', '1.2M', 'NaN', NaN, Infinity, 'Infinity']) {
    assert.equal(parseReplayDamage(invalid), 0);
    assert.equal(parseReplayDamage(invalid, '1,234'), 1234);
    assert.equal(parseReplayDamage('', invalid), 0);
  }
  assert.equal(parseReplayDamage(0, '1234'), 1234);
  assert.equal(parseReplayDamage('0', '1234'), 1234);
});

test('the public replay model handles nullable slots, filters invalid records and sorts numeric fallback damage', () => {
  const valid = {review_status:'VALID_REPLAY',boss_final:'Boss',team_archetype:'Team',tier_final:'M1'};
  const data = createReplayLibraryData([
    {...valid,video_url:'https://youtu.be/fallback',damage_final:'',damage_guess:'9,000',hero_1:'Hero',hero_2:null,MoW:null},
    {...valid,video_url:'https://youtu.be/confirmed',damage_final:'10,000',damage_guess:'100000',hero_1:'Hero',map:'Map 1'},
    {...valid,video_url:'https://youtu.be/unreviewed',damage_final:'50000',review_status:'NEEDS_REVIEW'},
    {...valid,video_url:'https://youtu.be/invalid',damage_final:'invalid',damage_guess:null},
    {...valid,video_url:'https://youtu.be/unknown',damage_final:'8000',boss_final:''},
    {...valid,damage_final:'8000'},
  ], [{Boss:'Boss','Long Name':'Full Boss Name'}], [{hero_name:'Hero',Team:'X'}],
  [{boss_name:'Boss',map_name:'Map 1'}], [{team_archetype:'Team'}]);
  assert.deepEqual(data.replays.map(replay=>[replay.videoId,replay.damage,replay.damageLabel]),
    [['confirmed',10000,'10K'],['fallback',9000,'9K']]);
  assert.deepEqual(data.replays[1].heroes,['Hero']);
  assert.equal(data.replays[1].mow,'');
  assert.equal(data.replays[1].map,'Unmapped');
  assert.equal(data.replays[1].bossLongName,'Full Boss Name');
  assert.equal(data.archivedReplayCount,2);
  assert.deepEqual(data.bosses,[{value:'Boss',label:'Boss'}]);
  assert.deepEqual(data.heroesByTeam,{Team:['Hero']});
});
