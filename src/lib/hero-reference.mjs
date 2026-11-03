/** Render source-derived values; array index zero is ability level one. */
export function abilityDescription(ability, rarity, level) {
  const levelValues = ability.levels_by_rarity[rarity]?.[level - 1];
  if (!Number.isInteger(level) || level < 1 || level > 60 || !levelValues) throw new Error(`Unavailable ability level: ${ability.id}/${rarity}/${level}`);
  return sourceDescription(ability.template, levelValues);
}

/** Relic ranks are their own ten source entries, independent of hero rarity. */
export function relicDescription(relic, rank) {
  const values = relic.ranks[rank - 1];
  if (!Number.isInteger(rank) || rank < 1 || rank > 10 || !values) throw new Error(`Unavailable Relic rank: ${relic.id}/${rank}`);
  return sourceDescription(relic.template, values);
}

function sourceDescription(template, sourceValues) {
  const values = Object.fromEntries(Object.entries(sourceValues).map(([key,value]) => [key.trim(),value]));
  let text = template;
  for (let pass = 0; pass < 8; pass++) {
    const rendered = text.replace(/\{\[(.*?)\]\}/g, (token, key) => {
      const indexed = key.match(/^(.+)\[(\d+)\]$/);
      if (indexed && indexed[1] in values) return String(values[indexed[1]]).split(',')[Number(indexed[2])] ?? token;
      return key in values ? String(values[key]) : token;
    });
    if (text === rendered) break;
    text = rendered;
  }
  return text.replace(/<[^>]*>/g, '').trim();
}

// Qualitative summaries of the frozen source text where numeric constants are
// absent. Keep unknown numbers out of the public tooltip rather than inventing them.
const traitSummaries = {
  HeavyWeapon: 'Deals extra damage with ranged attacks when this unit has not moved this turn.',
  TerminatorArmour: 'Reduces damage from the first attack each turn, except Psychic and Direct hits. This unit cannot be Suppressed.',
  CrushingStrike: 'Deals extra damage with normal melee attacks when this unit has not moved this turn.',
  LetTheGalaxyBurn: 'Attacks can score an additional hit and add Despoiled Ground to the target’s hex. Against a target already on a hex effect, the additional hit is guaranteed and no Despoiled Ground is added.',
  Terrifying: 'Reduces damage taken from melee attacks.',
  Daemon: 'Has an additional chance to block damage. The amount blocked scales with this unit’s current Damage stat.',
  RapidAssault: 'Has +1 Movement until it makes a melee or ranged attack. Its first attack each battle, and subsequent attacks that turn, deal extra damage.',
  Parry: 'Reduces the number of hits from incoming melee multi-hit attacks, to a minimum of one hit.',
  MartialKatah: 'Takes reduced damage from normal attacks and deals extra damage against Summons.',
  BeastSlayer: 'Deals extra melee damage to Big Targets and Vehicles. Has an additional chance to block damage equal to its current Armour.',
  ContagionsOfNurgle: 'An expanding aura reduces enemy Armour. Overlapping enemy auras strengthen the effect. Range: 1 in rounds 1–2, 2 in rounds 3–4, and 3 from round 5.',
  PutridExplosion: 'Explodes when defeated, dealing Toxic damage based on its maximum Health to adjacent units, except Death Guard units.',
  ThrillSeekers: 'Becomes Thrilled when it loses Health or targets an enemy at full Health. While Thrilled, its Crit Chance increases and enemies defeated by a critical hit are always overkilled.',
  LivingMetal: 'Regenerates a portion of its maximum Health at the start of the player’s turn. This unit is also Mechanical.',
  GetStuckIn: 'Every two hits against an enemy within range 2 can produce an additional hit. The chance increases when at least two friendly Orks or four friendly units are adjacent to the target.',
  RangedSpecialist: 'Deals extra damage with ranged attacks if this unit did not start its turn adjacent to an enemy.',
  ShadowInTheWarp: 'Nearby enemy Psykers deal reduced Psychic damage. Does not affect Tyranid Psykers.',
  PrioritisedEfficiency: 'Deals extra damage and takes reduced damage. Moving across three or more hexes removes this effect until the start of its next turn.',
  BlessingsOfKhorne: 'Gains extra damage and reduced incoming Psychic damage as units are defeated in melee during the battle, up to a cap.',
};
export const traitDescription = trait => trait.unresolved ? (traitSummaries[trait.id] || trait.description) : trait.description;
export const rankName = rank => rank.name.replace(' Rank', '');
