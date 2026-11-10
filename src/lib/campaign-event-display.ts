import ranks from '../data/campaigns/ranks.json';
import { eventCharacters } from './campaign-events';
import { heroById } from './heroes.mjs';
import profileIcons from '../data/heroes/profile-icons.json';
import type { ResearchBuild } from '../data/campaign-events/research-types';

export function rankDisplay(value: string | number | null) {
  const raw = String(value ?? '');
  const expanded = raw.replace(/^D(?=\d)/, 'Diamond').replace(/^A(?=\d)/, 'Adamantine').replace(/^G(?=\d)/, 'Gold').replace(/^S(?=\d)/, 'Silver').replace(/^B(?=\d)/, 'Bronze').replace(/\s/g, '');
  const rank = (ranks.ranks as Record<string, { name: string; badge: string }>)[expanded];
  return { label: raw || '—', name: rank?.name || raw || 'Not recorded', src: rank ? `/images/ranks/${rank.badge}` : null };
}
export function abilityIcon(heroId: string, kind: 'Active' | 'Passive') {
  // New roster portraits may be PNGs outside the legacy /heroes/ alias library.
  if (!eventCharacters[heroId].portrait.startsWith('/images/heroes/')) {
    const ability = heroById.get(heroId)?.abilities.find(ability => ability.kind === kind.toLowerCase());
    const icon = ability && (profileIcons.abilities as Record<string, { src: string }>)[ability.id];
    if (icon) return icon.src;
    throw new Error(`Missing ${kind} ability icon for ${heroId}`);
  }
  return eventCharacters[heroId].portrait.replace('/heroes/', '/abilities/').replace('.webp', `-${kind}.webp`);
}
export const buildLabel = (build: ResearchBuild) => build.kind === 'recommendation' ? 'Community recommendation' : build.kind === 'player_report' ? 'Player report' : 'Replay';
export const environmentLabel = (build: ResearchBuild) => build.environmentKind === 'qa' ? 'QA footage' : build.environmentKind === 'test_server' ? 'Test server' : null;
export const buildAction = (build: ResearchBuild) => build.kind === 'clear' ? 'Watch replay' : build.kind === 'recommendation' ? 'View recommendation' : 'Read player report';
