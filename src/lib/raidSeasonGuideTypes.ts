export interface SeasonReplay {
  videoId: string;
  url: string;
  boss: string;
  tier: string;
  map: string;
  archetype: string;
  damage: number;
  heroes: string[];
  mow: string;
  creator: string;
  publishedAt: string;
}

export interface SeasonRecommendation {
  archetype: string;
  kind: string;
  sample: number;
  average: number;
  maximum: number;
  tiers: string[];
  maps: string[];
  team: { heroes: string[]; mow: string };
  examples: SeasonReplay[];
}

export interface SeasonEncounter {
  tier: string;
  rarity: string;
  boss: string;
  map: string;
  loop: boolean;
  recommendations: SeasonRecommendation[];
}

export interface RaidSeasonGuide {
  season: number;
  startDate: string;
  slots: SeasonEncounter[];
  policy: { minimumSample: number; maximumTierDistance: number };
}

