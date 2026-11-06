import type { HeroGuide } from '../data/campaigns/indomitusGuideContent';
import type { CampaignEventGuide } from '../data/campaign-events/types';
import * as indomitus from '../data/campaigns/indomitusGuideContent';
import * as indomitusMirror from '../data/campaigns/indomitusMirrorGuideContent';
import * as fallOfCadia from '../data/campaigns/fallOfCadiaGuideContent';
import * as fallOfCadiaMirror from '../data/campaigns/fallOfCadiaMirrorGuideContent';
import * as octarius from '../data/campaigns/octariusGuideContent';
import * as octariusMirror from '../data/campaigns/octariusMirrorGuideContent';
import * as saimHann from '../data/campaigns/saimHannGuideContent';
import * as saimHannMirror from '../data/campaigns/saimHannMirrorGuideContent';
import { heroById } from './heroes.mjs';
import { lowestSeenSupportIds } from './campaign-events-validation.mjs';

export interface HeroProfileRow {
  heroId: string;
  name?: string;
  role: string;
  context?: string;
  featured?: boolean;
}

export interface HeroProfileGroup {
  id: string;
  title: string;
  tier?: string;
  collapsed?: boolean;
  rows: HeroProfileRow[];
}

type SupportGroup = { title: string; heroes: HeroGuide[] };
const supports = (heroes: HeroGuide[], title = ''): SupportGroup => ({ title, heroes });
const featuredFirst = (a: { featured?: boolean }, b: { featured?: boolean }) => Number(Boolean(b.featured)) - Number(Boolean(a.featured));

function campaignGroups(required: HeroGuide[], supporting: SupportGroup[], requiredOrder?: string[]): HeroProfileGroup[] {
  const orderedRequired = [...required].sort(requiredOrder
    ? (a, b) => requiredOrder.indexOf(a.characterId) - requiredOrder.indexOf(b.characterId)
    : featuredFirst);
  return [
    {
      id: 'required', title: 'Required heroes',
      rows: orderedRequired.map(hero => ({ heroId: hero.characterId, name: hero.heroName || hero.heading, role: hero.featured ? 'Required carry' : 'Required', featured: hero.featured })),
    },
    {
      id: 'supporting', title: 'Supporting heroes',
      // Promote the guide's featured supports, then retain its authored group and hero order.
      rows: supporting.flatMap(group => group.heroes.map(hero => ({
        heroId: hero.characterId, name: hero.heroName || hero.heading,
        role: hero.featured ? 'Top support' : 'Supporting', featured: hero.featured,
        context: hero.heroName && hero.heading.includes(' — ') ? hero.heading.split(' — ')[0] : group.title,
      }))).sort(featuredFirst),
    },
  ];
}

export const campaignHeroProfileGroups: Record<string, HeroProfileGroup[]> = {
  indomitus: campaignGroups(indomitus.requiredHeroContent, indomitus.supportingHeroGroups),
  'indomitus-mirror': campaignGroups(indomitusMirror.requiredHeroContent, [supports(indomitusMirror.supportingHeroes)]),
  'fall-of-cadia': campaignGroups(fallOfCadia.requiredHeroContent, [supports(fallOfCadia.primarySupportingHeroes), supports(fallOfCadia.otherSupportingHeroes, 'Other options')]),
  'fall-of-cadia-mirror': campaignGroups(fallOfCadiaMirror.requiredHeroContent, [supports([fallOfCadiaMirror.bestSupportingHero]), ...fallOfCadiaMirror.supportingHeroGroups]),
  octarius: campaignGroups(octarius.requiredHeroContent, [supports([octarius.bestSupportingHero]), supports([octarius.optionalSupportingHero], 'Optional')]),
  'octarius-mirror': campaignGroups(octariusMirror.requiredHeroContent, [supports([octariusMirror.bestSupportingHero]), ...octariusMirror.supportingHeroGroups]),
  // These overviews also give an explicit investment order for the two non-carry heroes.
  'saim-hann': campaignGroups(saimHann.requiredHeroContent, [supports(saimHann.supportingHeroes)], ['eldarFarseer', 'eldarAutarch', 'eldarRanger']),
  'saim-hann-mirror': campaignGroups(saimHannMirror.requiredHeroContent, [supports([saimHannMirror.bestSupportingHero]), supports([saimHannMirror.alsoGoodSupportingHero], 'Also good'), supports(saimHannMirror.otherSupportingHeroes, 'Other options')], ['thousInfernalMaster', 'thousTerminator', 'thousTzaangor']),
};

export function eventHeroProfileGroups(guide: CampaignEventGuide): HeroProfileGroup[] {
  const selectedSupports: string[] = lowestSeenSupportIds(guide);
  const tiers = [
    ['S', 'Lowest Seen E30 team'], ['A', 'Other E30 three-medal options'],
    ['B', 'Other Extremis use'], ['C', 'Other eligible heroes'],
  ];
  return [
    { id: 'required', title: 'Required heroes', rows: guide.requiredHeroes.map(hero => ({ heroId: hero.heroId, role: 'Required' })) },
    ...tiers.map(([tier, title]) => ({
      id: `tier-${tier.toLowerCase()}`, title, tier, collapsed: tier === 'C',
      rows: guide.supportingHeroes.filter(hero => hero.tier === tier)
        .sort((a, b) => tier === 'S'
          ? selectedSupports.indexOf(a.heroId) - selectedSupports.indexOf(b.heroId)
          : heroById.get(a.heroId)!.name.localeCompare(heroById.get(b.heroId)!.name))
        .map(hero => ({ heroId: hero.heroId, role: tier === 'C' ? 'Eligible' : 'Supporting', featured: tier === 'S' })),
    })),
  ].filter(group => group.rows.length);
}
