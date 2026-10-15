import type { Outcome } from './types';

export interface ResearchValue {
  value: string | null;
  basis: 'observed' | 'player_reported' | 'inferred' | 'editorial' | 'creator_recommended' | null;
  sourceUrl: string | null;
  rationale?: string;
}
export interface ResearchHero {
  heroId: string;
  rank: ResearchValue;
  active: ResearchValue;
  passive: ResearchValue;
  reportedRank: ResearchValue | null;
  unassignedAbilities: string | null;
  missingAbilities: string | null;
  notes: string[];
  rarity?: 'Epic' | 'Legendary' | 'Mythic';
  stars?: string;
}
export interface ResearchBuild {
  id: string;
  kind: 'clear' | 'player_report' | 'profile' | 'configuration' | 'recommendation';
  title: string;
  stageId: string | null;
  stageBasis: 'observed' | 'player_reported' | 'inferred' | 'editorial_assumption' | null;
  environment: string;
  environmentKind: 'qa' | 'test_server' | 'unverified';
  outcome: Outcome | null;
  resultBasis: 'observed' | 'player_reported' | 'editorial_assumption' | null;
  lightning: boolean | null;
  teamComplete: boolean;
  dependencyNote: string;
  sourceUrl: string;
  sourceLabel: string;
  resultSourceUrl?: string;
  heroes: ResearchHero[];
  notes: string[];
  applicabilityNote?: string;
  e30Acceptance?: { basis: 'user_approved_assumption'; approvedBy: 'Dan'; approvedAt: string };
  recommendation?: {
    creditedPlayer: string;
    updatedLabel: string;
    relic: string;
    comparison: string;
    relatedRecordIds: string[];
    supportPool?: boolean;
  };
}
export interface ResearchTarget {
  scope: string;
  recordIds: string[];
  context: string;
  heroes: ResearchHero[];
}
export interface EventResearch {
  eventId: string;
  lowestSeen: ResearchTarget;
  safeBetProposal: ResearchTarget | null;
  supportSafeBetProposal?: ResearchTarget;
  safeBetApproved: boolean;
  e30Teams: { id: string; title: string; recordIds: string[]; context: string }[];
  safeBetGap: string;
  gaps: string[];
  builds: ResearchBuild[];
}
