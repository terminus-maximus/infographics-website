import test from 'node:test';
import assert from 'node:assert/strict';
import { heroes, reference } from '../src/lib/heroes.mjs';
import { abilityDescription, relicDescription } from '../src/lib/hero-reference.mjs';
import { highPointsHeroMatches } from './hero-lre-links.mjs';
const abaddon = reference.heroes.find(hero=>hero.unit_id==='blackAbaddon');
const active = abaddon.abilities.find(ability=>ability.id==='Drachnyen');

test('ability slider endpoints use the frozen source level and rarity values',()=>{
  // 1.43 Drach’nyen base health: 65 at level 1, 4241 at level 60.
  // Mythic multiplier: 200%; Legendary: 180%, rounded half-up.
  assert.match(abilityDescription(active,'Mythic',1),/set to 130 Health/);
  assert.match(abilityDescription(active,'Mythic',60),/set to 8482 Health/);
  assert.match(abilityDescription(active,'Legendary',60),/set to 7634 Health/);
  assert.match(abilityDescription(active,'Mythic',60),/3x 1566-1958 Piercing/);
  assert.throws(()=>abilityDescription(active,'Mythic',0));
  assert.throws(()=>abilityDescription(active,'Mythic',61));
  const thutmose=reference.heroes.find(hero=>hero.unit_id==='necroPlasmancer').abilities.find(ability=>ability.id==='HarbingerOfDestruction');
  assert.match(abilityDescription(thutmose,'Mythic',60),/up to 5 enemies/);
});
test('compound source variables keep indexed values and chained substitutions',()=>{
  const ability={id:'fixture',template:'{[hits]} hits: {[damage[0]]}–{[damage[1]]}; {[label]}',levels_by_rarity:{Mythic:[{hits:3,damage:'12,24',label:'{[hits]} targets'}]}};
  assert.equal(abilityDescription(ability,'Mythic',1),'3 hits: 12–24; 3 targets');
});

test('Relic ranks use the ten item ability entries without hero rarity scaling',()=>{
  const helspear=heroes.find(hero=>hero.unit_id==='blackHaarken').relics[0];
  assert.equal(helspear.name,'Helspear');
  assert.match(relicDescription(helspear,1),/ignores 685 Armour/);
  assert.match(relicDescription(helspear,1),/defeats 8 enemy units/);
  assert.match(relicDescription(helspear,5),/ignores 833 Armour/);
  assert.match(relicDescription(helspear,5),/defeats 6 enemy units/);
  assert.match(relicDescription(helspear,10),/ignores 1018 Armour/);
  assert.match(relicDescription(helspear,10),/defeats 4 enemy units/);
  const helm=heroes.find(hero=>hero.unit_id==='darkaAzrael').relics[0];
  assert.match(relicDescription(helm,1),/50% chance/);
  assert.match(relicDescription(helm,8),/90% chance/);
  assert.match(relicDescription(helm,10),/100% chance/);
  for (const invalid of [0,11,1.5,NaN]) assert.throws(()=>relicDescription(helspear,invalid));
});

test('shared Relics follow allowed hero IDs and unsupported heroes have none',()=>{
  const titus=heroes.find(hero=>hero.unit_id==='ultraTitus').relics;
  const bellator=heroes.find(hero=>hero.unit_id==='ultraInceptorSgt').relics;
  assert.equal(titus.length,1);
  assert.equal(titus[0].id,'R_Crit_RelicBoltPistol');
  assert.deepEqual(titus,bellator);
  assert.match(relicDescription(titus[0],1),/\+590 Crit Damage/);
  assert.match(relicDescription(titus[0],10),/\+877 Crit Damage/);
  assert.deepEqual(heroes.find(hero=>hero.unit_id==='lostaBile').relics,[]);
  assert.equal(heroes.filter(hero=>hero.relics.length).length,68);
  assert.equal(new Set(heroes.flatMap(hero=>hero.relics.map(relic=>relic.id))).size,35);
});

test('LRE guide links require a displayed combination, not a single requirement or a two-hero pool',()=>{
  const characters=[
    ...['first','second','third'].map(id=>({id,eligibility:{alpha:['a','b']}})),
    {id:'single',eligibility:{alpha:['a']}},
    {id:'small-pool-1',eligibility:{alpha:['a','c']}},
    {id:'small-pool-2',eligibility:{alpha:['a','c']}},
    {id:'excluded',eligibility:{alpha:null}},
  ];
  const tracks=[{id:'alpha',requirements:[{id:'a',points:100},{id:'b',points:90},{id:'c',points:80}]}];
  const matches=highPointsHeroMatches({characters,tracks});
  assert.deepEqual(Object.keys(matches),['first','second','third']);
  assert.deepEqual(matches.first,[{track:'alpha',requirements:['a','b'],points:190}]);
});

test('LRE matching preserves the planner’s twelve displayed combinations per track',()=>{
  const ids=['a','b','c','d','e'];
  const characters=['first','second','third'].map(id=>({id,eligibility:{alpha:ids}}));
  const tracks=[{id:'alpha',requirements:ids.map((id,i)=>({id,points:100-i*10}))}];
  const matches=highPointsHeroMatches({characters,tracks});
  assert.equal(matches.first.length,12);
  assert.deepEqual(matches.first[0],{track:'alpha',requirements:ids,points:400});
});
