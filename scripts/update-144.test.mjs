import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { heroes, currentRelease } from '../src/lib/heroes.mjs';
import { machines } from '../src/lib/machines.mjs';
import { abilityDescription } from '../src/lib/hero-reference.mjs';
import { machineAbilityDescription } from '../src/lib/machine-reference.mjs';
import { overallSummary } from '../src/lib/hero-summaries.mjs';
import reference from '../src/data/updates/1.44.120-reference.json' with { type:'json' };
const daras = heroes.find(hero => hero.slug === 'daras');
const boudicari = machines.find(machine => machine.slug === 'boudicari');

test('Daras has five Pending ratings and does not change the frozen scoring release', () => {
  assert.equal(daras.game_version,'1.44.120');
  for (const key of ['final_score','raid','war','horde','popularity','rank']) assert.equal(daras.overall[key],null);
  for (const assessment of Object.values(daras.assessments)) assert.equal(assessment.recommended_score,null);
  assert.equal(daras.overall.guide_bonus,0);
  assert.match(overallSummary(daras.unit_id,null),/Poison and anti-heal pressure.*Guild Wars.*Damage reduction.*Guild Raids/s);
  assert.equal(currentRelease.heroes.some(hero => hero.unit_id === daras.unit_id),false);
  for (const frozen of currentRelease.heroes) assert.deepEqual(heroes.find(hero => hero.unit_id === frozen.unit_id).overall,frozen);
});

test('Daras has valid progression, normal attack profiles and independently scaled ability curves', () => {
  assert.deepEqual(daras.progression[3].stats[0],[0,108,25,37]);
  assert.deepEqual(daras.progression[19].stats.at(-1),[19,12017,2804,4139]);
  assert.deepEqual(daras.weapons.map(w=>[w.kind,w.damage_type,w.hits,w.range]),[['melee','Physical',3,1],['ranged','Bolter',1,2]]);
  assert.match(abilityDescription(daras.abilities[0],'Mythic',60),/3x 3394-4046 Toxic Damage/);
  assert.match(abilityDescription(daras.abilities[1],'Uncommon',1),/1x 17-26 Toxic Damage.*-20% Damage.*60%/s);
  assert.match(abilityDescription(daras.abilities[1],'Mythic',60),/1x 1828-2872 Toxic Damage.*-30% Damage.*80%/s);
});

test('Boudicari keeps the approved two-star rating and scales all three abilities correctly', () => {
  assert.equal(boudicari.game_version,'1.44.120');
  assert.equal(boudicari.rating,2);
  assert.equal(boudicari.unlock_with,'Chaos');
  assert.equal(boudicari.invest_in,'Passive');
  const [active,passive,mythic] = boudicari.abilities;
  assert.match(machineAbilityDescription(active,19,60),/19576 Health.*3262 Damage.*3916 Armour/s);
  assert.match(machineAbilityDescription(passive,19,60),/5872-7178 Las Damage.*\+1958 Damage/s);
  assert.match(machineAbilityDescription(passive,0,1),/45-55 Las Damage.*\+15 Damage/s);
  assert.equal(machineAbilityDescription(mythic,15),'Unlocks at Mythic rarity.');
  for (const [step,percent] of [[16,10],[17,13],[18,16],[19,20]]) assert.match(machineAbilityDescription(mythic,step),new RegExp(`\\+${percent}% Damage`));
});

test('new portraits and ability icons are hashed WebP assets and public data contains no private source labels', () => {
  for (const unit of [...reference.heroes,...reference.machines]) {
    for (const asset of [unit.portrait,unit.round_portrait,...unit.abilities.map(a=>a.icon)].filter(Boolean)) {
      const bytes=readFileSync(`public${asset.src}`);
      assert.equal(bytes.subarray(8,12).toString(),'WEBP');
      assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
    }
  }
  assert.doesNotMatch(JSON.stringify(reference),/marketing|datamine|\/Users\/|file:\/\//i);
});
