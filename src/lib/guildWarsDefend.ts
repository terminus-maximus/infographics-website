import source from '../data/guild-wars/defenders.json';
import editorial from '../data/guild-wars/defend-editorial.json';
import attackEditorial from '../data/guild-wars/editorial.json';
import type { Unit } from './guildWars';

export const units = source.units as Record<string, Unit>;
export const scope = source.scope;
export const teams = source.teams.map(data => {
  const meta = editorial.teams.find(team => team.id === data.id);
  if (!meta) throw new Error(`Missing defender metadata for ${data.id}`);
  const counters = data.counters.map(counter => {
    const attack = attackEditorial.teams.find(team => team.id === counter.id);
    if (!attack) throw new Error(`Missing Attack page link for ${counter.id}`);
    return { ...counter, title: attack.title, heroes: attack.core, href: `/guild-wars/attack/#${attack.anchor}` };
  });
  const tiers = [...data.tiers].sort((a, b) => a.tier - b.tier);
  const commonTier = tiers.reduce((mostCommon, tier) => tier.attempts > mostCommon.attempts ? tier : mostCommon);
  return { ...data, ...meta, counters, tiers, commonTier };
});
export type DefendTeam = typeof teams[number];
export { number, percent, ratio } from './guildWarsFormat.mjs';
