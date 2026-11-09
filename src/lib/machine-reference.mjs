import { sourceDescription } from './hero-reference.mjs';

export function machineAbilityDescription(ability, progressionIndex, level = 60) {
  const values = ability.values_by_progression[progressionIndex];
  if (ability.kind === 'mythic') {
    if (progressionIndex < ability.unlock_progression) return 'Unlocks at Mythic rarity.';
    if (!values) throw new Error(`Missing Mythic progression: ${ability.id}/${progressionIndex}`);
    return sourceDescription(ability.template, values);
  }
  if (!Number.isInteger(level) || level < 1 || level > 60 || !values?.[level - 1]) {
    throw new Error(`Missing MoW ability level: ${ability.id}/${progressionIndex}/${level}`);
  }
  return sourceDescription(ability.template, values[level - 1]);
}

export function selectMachineRarity(contexts, current, rarity) {
  const choices = contexts.filter(p => p.rarity === rarity);
  const next = choices.find(p => p.stars === current.stars) ?? choices.at(-1);
  if (!next) throw new Error(`Unknown MoW rarity: ${rarity}`);
  return next;
}

export function machineAbilityNote(ability, context, level) {
  if (ability.kind === 'mythic') return context.index < ability.unlock_progression
    ? 'Ascend this Machine of War to Mythic to unlock this ability.'
    : `Scales with Mythic promotions · ${context.star_label}`;
  return level > context.max_ability_level
    ? `${context.rarity} level cap: ${context.max_ability_level} · showing a level ${level} preview`
    : '';
}
