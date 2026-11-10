import type referenceData from '../data/heroes/reference.json';
import type relicData from '../data/heroes/relics.json';
export type Relic = (typeof relicData.relics)[number];
export type Mode = 'raid' | 'war' | 'horde' | 'popularity';
export type HeroReference = Omit<(typeof referenceData.heroes)[number], 'portrait'|'abilities'> & {
  portrait:{src:string|null;width:number;height:number;source_sha256:string|null};
  abilities:((typeof referenceData.heroes)[number]['abilities'][number] & {icon?:{src:string;width:number;height:number}})[];
  game_version?:string;
  updated_on?:string;
};
export interface Assessment {
  recommended_score: number | null;
  display_score?: number | null;
  short_justification?: string;
  confidence?: string;
  score_status?: string;
  rating_status?: string;
  evidence_score_status?: string;
  status?: string;
  last_updated?: string;
  last_community_research_completed?: string;
  source_captures_end?: string;
  as_of?: string;
  score_basis?: string;
  scoring_revision?: string;
  publication_note?: string;
  score_rationale?: string;
  main_boss_findings?: string;
  prime_side_boss_findings?: string;
  counts?: Record<'S1'|'G1'|'D1'|'D3'|'A2',number|null>;
  measurement_date?: string|null;
  threshold_definition?: string;
}
export interface GuideRelationship {
  category: string; slug: string; title: string; url: string; role: string; status: string;
  appearances?: {label:string;url:string}[];
  evidence: {kind:string;path:string;tracks?:Record<string,string[]>;combinations?:{track:string;requirements:string[];points:number}[]}[];
}
export interface OverallScore {
  unit_id:string;name:string;raid:number|null;war:number|null;horde:number|null;popularity:number|null;
  equal_weight_average:number|null;final_score:number|null;guide_bonus:number;rank:number|null;
  status:string;missing_modes:string[];guide_categories:string[];guides:{category:string;slug:string;title:string;url:string}[];
}
export type Hero = HeroReference & {slug:string;availability_status:string;overall:OverallScore;assessments:Record<Mode,Assessment>;guides:GuideRelationship[];relics:Relic[]};
export type FrozenHero = OverallScore & {slug:string;full_name:string;portrait:HeroReference['portrait'];assessments:Record<Mode,Assessment>};
export interface Release {
  id:string;policy:string;date:string;generated_at:string;rank_convention:string;scores_sha256:string;
  coverage:{roster:number;raid:number;war:number;horde:number;popularity:number;ranked:number;pending:number;bonus:number};
  heroes:OverallScore[];
}
export type Publication = Omit<Release,'heroes'> & {
  month:string;published_date:string;cutoff_count:number;include_cutoff_ties:boolean;heroes:FrozenHero[];
  graphic:null|{src:string;fullSizeSrc:string;thumbnailSrc:string;width:number;height:number;alt:string;month:string;release_id:string;scores_sha256:string;sha256:string;fullSizeSha256:string;thumbnailSha256:string;visual_checked_by:string;visual_checked_date:string};
};
