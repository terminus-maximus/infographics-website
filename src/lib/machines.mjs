import source from '../data/incursion/machine-reference.json' with { type: 'json' };
import profiles from '../data/incursion/machine-profiles.json' with { type: 'json' };
import { machineAbilityDescription } from './machine-reference.mjs';

export const machineReference = source;
export const machineRatingSource = profiles.rating_source;
/** @type {import('./machine-types').Machine[]} */
export const machines = profiles.machines.map(profile => {
  const reference = source.machines.find(machine => machine.unit_id === profile.unit_id);
  if (!reference) throw new Error(`Missing released MoW: ${profile.unit_id}`);
  return {...reference, ...profile};
}).sort((a, b) => a.name.localeCompare(b.name, 'en'));
export const machineHref = machine => `/incursion-mow/${machine.slug}/`;

if (new Set(machines.map(m => m.unit_id)).size !== machines.length ||
    new Set(machines.map(m => m.slug)).size !== machines.length ||
    source.machines.length !== machines.length) throw new Error('Duplicate or unregistered MoW');
for (const machine of machines) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(machine.slug)) throw new Error('Invalid MoW slug');
  if (machine.rating !== null && (!Number.isInteger(machine.rating) || machine.rating < 1 || machine.rating > 5)) throw new Error('Invalid My Rating stars');
  const initial = machine.progression.find(p => p.index === machine.default_progression);
  if (initial?.rarity !== 'Mythic' || initial.stars !== 14 || initial.max_ability_level !== 60) throw new Error('Invalid MoW default');
  if (machine.abilities.map(a => a.kind).join(',') !== 'active,passive,mythic') throw new Error('Missing MoW abilities');
  for (const ability of machine.abilities) {
    if (machineAbilityDescription(ability, machine.default_progression) !== ability.description) throw new Error('MoW default description mismatch');
  }
}
