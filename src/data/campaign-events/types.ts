/** Public guide content only. Research evidence and local paths stay outside this contract. */
import type { EventResearch } from './research-types';
export type EvidenceStatus = "unknown" | "observed" | "player_reported" | "inferred" | "editorial";
export type Outcome = "three_medal" | "win_only" | "lightning_only" | "unknown";
export interface InvestmentField {
  value: string | number | null;
  status: EvidenceStatus;
  scope: string | null;
  scopeKind: "stage" | "full_event" | null;
  stageIds: string[];
  sourceIds: string[];
  clearIds: string[];
  note: string | null;
}
export interface Investment {
  rank: InvestmentField;
  active: InvestmentField;
  passive: InvestmentField;
}
export interface SafeBetScenario {
  id: string;
  label: string;
  objective: string;
  teamIds: string[];
  conditions: string[];
  investment: Investment;
  rationale: string;
  provisional: boolean;
}
export interface HeroInvestment {
  heroId: string;
  lowestSeen: Investment;
  safeBetScenarios: SafeBetScenario[];
}
export interface SupportingHero extends HeroInvestment {
  tier: "S" | "A" | "B" | "C";
  basis: EvidenceStatus;
  provisional: boolean;
  rationale: string;
  sourceIds: string[];
  tierRecordIds: string[];
}
export interface PublicSource {
  id: string;
  title: string;
  url: string;
  kind: "rules" | "patch" | "clear" | "community";
  author: string | null;
  publishedAt: string | null;
}
export interface ClearObservation {
  id: string;
  originalClearId: string;
  creatorId: string;
  stageId: string;
  scope: string;
  basis: "observed" | "player_reported";
  /** Exact stage identity is distinct from visibly reviewing the battle/result. */
  stageIdentity?: "observed" | "player_reported" | "inferred";
  /** Explicit opt-in; absent/false never supports investment thresholds. */
  thresholdEligible?: boolean;
  exclusionReason?: string | null;
  outcome: Outcome;
  lightning: boolean | null;
  requiredHeroesDeployed: boolean | null;
  requiredHeroesSurvived: boolean | null;
  teamIds: string[];
  sourceIds: string[];
  summary: string;
  conditions: string[];
}
export interface StageAdvice {
  id: string;
  stageId: string;
  branch: "main" | "B";
  objective: "three_medal" | "lightning";
  problem: string;
  supportingPairIds: string[];
  tactic: string;
  lowerInvestmentAlternative: string | null;
  conditions: string[];
  basis: EvidenceStatus;
  provisional: boolean;
  sourceIds: string[];
}
export interface StageRule {
  stageId: string;
  branch: "main" | "B";
  rarityCap: string;
  deploymentLimit: number;
  sourceIds: string[];
}
export interface Infographic {
  src: string;
  fullSizeSrc: string;
  alt: string;
  width: number;
  height: number;
  snapshotId: string;
}
export interface EventRewards {
  source: { gameVersion: string; verifiedAt: string; configSha256: string; campaignId: string };
  shardFarms: { hero: string; regularStage: string; mythicStage: string }[];
  chestShards: { hero: string; initialTotal: number; repeatQuantity: number }[];
  chestTrack: { initialChestCount: number; finalChestPoints: number; repeatPoints: number };
  equipment: { name: string; stage: string; kind: "relic" | "mythic_equipment"; exclusiveHero: string | null }[];
  finalUpgrade: string;
}
export interface CampaignEventGuide {
  research: EventResearch;
  rewards: EventRewards;
  id: string;
  slug: string;
  title: string;
  displayTitle: string;
  enemyFaction: string;
  playableFactions: string[];
  requiredHeroIds: string[];
  supportingHeroIds: string[];
  objective: string;
  ruleNote: string;
  rosterNote: string;
  versionNote: string;
  requiredHeroes: HeroInvestment[];
  supportingHeroes: SupportingHero[];
  stageRules: StageRule[];
  stages: StageAdvice[];
  observations: ClearObservation[];
  sources: PublicSource[];
  infographic: Infographic | null;
}
export interface CampaignEventData {
  schemaVersion: "ce-public-1.1";
  snapshot: {
    id: string;
    status: "editorial_pending" | "approved";
    updatedAt: string;
    characterBuild: string;
    contentHash: string | null;
  };
  characters: Record<string, { id: string; name: string; faction: string; portrait: string }>;
  events: CampaignEventGuide[];
}
