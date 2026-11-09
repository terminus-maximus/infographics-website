import test from 'node:test';
import assert from 'node:assert/strict';
import { machines } from '../src/lib/machines.mjs';
import { machineAbilityDescription, machineAbilityNote, selectMachineRarity } from '../src/lib/machine-reference.mjs';

const biovore = machines.find(m => m.unit_id === 'tyranBiovore');
const [active, passive, mythic] = biovore.abilities;

test('MoW stars change regular values within the same rarity; levels remain independent', () => {
  assert.match(machineAbilityDescription(active, 0, 1), /20 Health.*55-66 Toxic/s);
  assert.match(machineAbilityDescription(active, 1, 1), /21 Health.*58-69 Toxic/s);
  assert.match(machineAbilityDescription(active, 19, 60), /2610 Health.*7178-8614 Toxic/s);
  assert.match(machineAbilityDescription(passive, 19, 1), /40 Health.*110-132 Toxic/s);
  assert.throws(() => machineAbilityDescription(active, 19, 61));
  assert.throws(() => machineAbilityDescription(active, 19, 0));
  assert.throws(() => machineAbilityDescription(active, 99, 1));
});

test('Mythic uses promotion entries, not regular scaling or ability level', () => {
  for(const [index,percent] of [[16,10],[17,13],[18,16],[19,20]]) {
    assert.match(machineAbilityDescription(mythic,index,1),new RegExp(`\\+${percent}%`));
    assert.equal(machineAbilityDescription(mythic,index,1),machineAbilityDescription(mythic,index,60));
  }
  assert.equal(machineAbilityDescription(mythic,15),'Unlocks at Mythic rarity.');
  const shield=machines.find(m=>m.unit_id==='adeptExorcist').abilities[2];
  assert.match(machineAbilityDescription(shield,17),/32\.5%/);
  assert.match(machineAbilityDescription(shield,19),/50%/);
});

test('rarity changes select valid promotions and communicate level caps', () => {
  const contexts=biovore.progression;
  const common=selectMachineRarity(contexts,contexts[19],'Common');
  assert.equal(common.index,2);
  assert.equal(selectMachineRarity(contexts,common,'Uncommon').index,3);
  assert.equal(selectMachineRarity(contexts,contexts[15],'Mythic').index,16);
  assert.match(machineAbilityNote(active,common,60),/level cap: 8.*preview/);
  assert.equal(machineAbilityNote(active,common,8),'');
  assert.throws(()=>selectMachineRarity(contexts,common,'Unknown'));
});

test('all released machines have complete, resolved ability data at every promotion and level', () => {
  assert.equal(machines.length,11);
  for(const machine of machines) {
    assert.equal(machine.progression.length,20);
    for(const context of machine.progression) {
      for(const ability of machine.abilities) {
        for(const level of ability.kind==='mythic' ? [60] : Array.from({length:60},(_,i)=>i+1)) {
          const description=machineAbilityDescription(ability,context.index,level);
          assert.ok(description.length>10);
          assert.doesNotMatch(description,/\{\[|undefined|NaN|<style|\/Users\//);
        }
      }
    }
  }
});
