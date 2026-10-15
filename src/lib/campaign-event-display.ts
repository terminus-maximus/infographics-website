import ranks from '../data/campaigns/ranks.json';
import { eventCharacters } from './campaign-events';
import type { ResearchBuild } from '../data/campaign-events/research-types';

export function rankDisplay(value: string | number | null) {
  const raw = String(value ?? '');
  const expanded = raw.replace(/^D(?=\d)/, 'Diamond').replace(/^A(?=\d)/, 'Adamantine').replace(/^G(?=\d)/, 'Gold').replace(/^S(?=\d)/, 'Silver').replace(/^B(?=\d)/, 'Bronze').replace(/\s/g, '');
  const rank = (ranks.ranks as Record<string, { name: string; badge: string }>)[expanded];
  return { label: raw || '—', name: rank?.name || raw || 'Not recorded', src: rank ? `/images/ranks/${rank.badge}` : null };
}
export function abilityIcon(heroId: string, kind: 'Active' | 'Passive') {
  return eventCharacters[heroId].portrait.replace('/heroes/', '/abilities/').replace('.webp', `-${kind}.webp`);
}
export const buildLabel = (build: ResearchBuild) => build.kind === 'recommendation' ? 'Community recommendation' : build.kind === 'player_report' ? 'Player report' : 'Replay';
export const environmentLabel = (build: ResearchBuild) => build.environmentKind === 'qa' ? 'QA footage' : build.environmentKind === 'test_server' ? 'Test server' : null;
export const buildAction = (build: ResearchBuild) => build.kind === 'clear' ? 'Watch replay' : build.kind === 'recommendation' ? 'View recommendation' : 'Read player report';
