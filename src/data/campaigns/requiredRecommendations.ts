import characterSource from "./characters.json";
import requiredRecommendationsSource from "./required-recs.json";

type RequiredRecommendationRow = {
  Campaign: string;
  URL: string;
  Reference: string;
  terminus_name: string;
  Rank_Normal: string;
  Rank_Elite: string;
  Active_Normal: string;
  Active_Elite: string;
  Passive_Normal: string;
  Passive_Elite: string;
};

export type RequiredRecommendation = {
  reference: string;
  terminusName: string;
  characterId: string;
  normal: { rankId: string; active: string; passive: string };
  elite: { rankId: string; active: string; passive: string };
};

export type RequiredRecommendationCampaign = {
  name: string;
  url: string;
  recommendations: RequiredRecommendation[];
};

const characterIdByShortName = Object.fromEntries(
  Object.entries(characterSource.characters).map(([characterId, character]) => [character.shortName, characterId]),
) as Record<string, string>;

const rankId = (rank: string) => rank.replaceAll(" ", "");

export const getRequiredRecommendationsForCampaign = (campaignUrl: string): RequiredRecommendation[] =>
  (requiredRecommendationsSource as RequiredRecommendationRow[])
    .filter((row) => row.URL === campaignUrl)
    .sort((left, right) => left.Reference.localeCompare(right.Reference))
    .map((row) => ({
      reference: row.Reference,
      terminusName: row.terminus_name,
      characterId: characterIdByShortName[row.terminus_name],
      normal: {
        rankId: rankId(row.Rank_Normal),
        active: row.Active_Normal,
        passive: row.Passive_Normal,
      },
      elite: {
        rankId: rankId(row.Rank_Elite),
        active: row.Active_Elite,
        passive: row.Passive_Elite,
      },
    }));

export const getRequiredRecommendationCampaigns = (): RequiredRecommendationCampaign[] => {
  const campaigns = new Map<string, { name: string; url: string }>();

  (requiredRecommendationsSource as RequiredRecommendationRow[]).forEach((row) => {
    if (!campaigns.has(row.URL)) campaigns.set(row.URL, { name: row.Campaign, url: row.URL });
  });

  return [...campaigns.values()].map((campaign) => ({
    ...campaign,
    recommendations: getRequiredRecommendationsForCampaign(campaign.url),
  }));
};
