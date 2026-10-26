import type characters from "../campaigns/characters.json";
import type ranks from "../campaigns/ranks.json";

export type IncursionCharacterId = keyof typeof characters.characters;

export interface GuideLink {
  label: string;
  url: string;
}

export interface InfographicAsset {
  src: string;
  fullSizeSrc: string;
  thumbnailSrc?: string;
  width?: number;
  height?: number;
  alt: string;
}

export interface IncursionStrategy {
  id: string;
  name: string;
  tag: string;
  recommended?: boolean;
  fit: string;
  core: IncursionCharacterId[];
  coreSummary: string;
  flex: IncursionCharacterId[];
  featuredFlex?: { id: IncursionCharacterId; label: string };
  flexSummary: string;
  principle: string;
  explanation: string;
  evidence: string;
  evidenceCreator: string;
  caveat?: string;
  otherOptions?: { ids: IncursionCharacterId[]; note: string };
}

export interface IncursionCreator {
  id: string;
  name: string;
  uploads: number;
  tiers: string;
  supports: string;
  observation: string;
  limitation: string;
  links: GuideLink[];
}

export interface IncursionTierReward {
  tier: number;
  cap: keyof typeof ranks.ranks;
  initialClear: number;
  raidOnly: number;
  shardType?: "Mythic";
}

export interface IncursionStageTip {
  stage: number;
  title: string;
  advice: string;
  link: GuideLink;
  highlighted?: boolean;
}

export interface IncursionGuide {
  slug: string;
  machine: string;
  alliance: string;
  portrait: string;
  title: string;
  seoTitle: string;
  description: string;
  subtitle: string;
  updatedAt: string;
  infographic?: InfographicAsset;
  overview: { headline: string; text: string; principles: { title: string; text: string }[] };
  strategies: IncursionStrategy[];
  powerUps: {
    introduction: string;
    comparisonLabel?: string;
    approaches: { strategyId: string; heading: string; focus: string; text: string; link: GuideLink }[];
    notes: { name: string; text: string }[];
  };
  rules: { title: string; text: string }[];
  stageTips?: {
    introduction: string;
    caveat: string;
    stages: IncursionStageTip[];
  };
  tierRewards?: IncursionTierReward[];
  relatedGuides: GuideLink[];
  research: {
    summary: string;
    findings: string[];
    creators: IncursionCreator[];
    reports?: { title: string; text: string; link: GuideLink }[];
    references?: GuideLink[];
    limitations: string;
  };
}
