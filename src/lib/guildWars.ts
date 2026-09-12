import source from '../data/guild-wars/attackers.json';
import editorial from '../data/guild-wars/editorial.json';

export interface Unit { name: string; kind: string; image: string | null }
export interface Counts { attempts: number; clears: number; failures: number; perfect: number; withDeaths: number; wars: number; clearRate: number | null }
export interface Usage { unit: string; attempts: number; share: number | null }
export interface Evidence extends Counts { share: number | null; team?: string[]; unit?: string; mow?: string; omittedCore?: string[] }
export interface EvidenceSet { total: number; rows: Evidence[] }
export interface Metric { numerator: number; denominator: number; rate: number | null }
export interface Team extends Counts {
  id: string; core: string[]; interval: number[] | null; perfectPerAttempt: number | null;
  metrics: Record<string, Metric>;
  contexts: (Counts & { map: string; medicae: string })[];
  flex: Usage[]; combinations: EvidenceSet; mows: EvidenceSet; teamMows: EvidenceSet;
  flexAnalysis?: Counts & {
    mode: string; minimumCoreMembers: number; completeCoreAttempts: number; replacementAttempts: number;
    metrics: Record<string, Metric>; contexts: (Counts & { map: string; medicae: string })[];
    flex: Usage[]; combinations: EvidenceSet; mows: EvidenceSet; teamMows: EvidenceSet;
  };
}
export const units = source.units as Record<string, Unit>;
export const scope = source.scope;
export const teams = editorial.teams.map(meta => {
  const data = (source.teams as Team[]).find(team => team.id === meta.id);
  if (!data) throw new Error(`Missing Guild Wars data for ${meta.id}; run the explicit importer.`);
  return { ...data, ...meta };
});
export type GuideTeam = typeof teams[number];
export { number, percent, ratio } from './guildWarsFormat.mjs';
export const medicaeLabels: Record<string, string> = { up: 'Meds Up', down_provisional: 'No Meds Buff', unknown: 'Unknown' };
export const mapLabels: Record<string, string> = { hard: 'Hard map', normal: 'Normal map', unknown: 'Unknown map' };
