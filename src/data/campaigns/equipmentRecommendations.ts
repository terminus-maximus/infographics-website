import equipmentRecommendationsJson from "./equip_recs.json";

export type EquipmentTarget = {
  icon: string;
  rank: number;
  rarity: "Uncommon" | "Rare" | "Epic" | "Legendary";
  name: string;
};

export type EquipmentRecommendation = {
  reference: string;
  terminusName: string;
  normal: { weapon: EquipmentTarget; defense: EquipmentTarget };
  elite: { weapon: EquipmentTarget; defense: EquipmentTarget };
};

type EquipmentJsonRow = {
  Campaign: string;
  URL: string;
  Reference: string;
  terminus_name: string;
  Normal_1_Icon: string;
  Normal_1_Rank: number;
  Normal_2_Icon: string;
  Normal_2_Rank: number;
  Elite_1_Icon: string;
  Elite_1_Rank: number;
  Elite_2_Icon: string;
  Elite_2_Rank: number;
};

const equipmentFromJson = (
  row: EquipmentJsonRow,
  iconColumn: keyof EquipmentJsonRow,
  rankColumn: keyof EquipmentJsonRow,
): EquipmentTarget => {
  const icon = String(row[iconColumn]);
  const rank = Number(row[rankColumn]);
  const match = icon.match(/^[^-]+-[123]-(Uncommon|Rare|Epic|Legendary)-(.+)\.webp$/);

  if (!match) throw new Error(`Invalid equipment filename in ${String(iconColumn)}: ${icon}`);
  if (!Number.isInteger(rank) || rank < 1) {
    throw new Error(`Invalid numeric equipment rank in ${String(rankColumn)}: ${rank}`);
  }

  return {
    icon,
    rank,
    rarity: match[1] as EquipmentTarget["rarity"],
    name: match[2].replaceAll("-", " "),
  };
};

export const getEquipmentRecommendationsForCampaign = (campaignUrl: string) =>
  (equipmentRecommendationsJson as EquipmentJsonRow[])
    .filter((row) => row.URL === campaignUrl)
    .map((row): EquipmentRecommendation => ({
      reference: row.Reference,
      terminusName: row.terminus_name,
      normal: {
        weapon: equipmentFromJson(row, "Normal_1_Icon", "Normal_1_Rank"),
        defense: equipmentFromJson(row, "Normal_2_Icon", "Normal_2_Rank"),
      },
      elite: {
        weapon: equipmentFromJson(row, "Elite_1_Icon", "Elite_1_Rank"),
        defense: equipmentFromJson(row, "Elite_2_Icon", "Elite_2_Rank"),
      },
    }));

const equipmentByTerminusNameForCampaign = (campaignUrl: string) =>
  Object.fromEntries(
    getEquipmentRecommendationsForCampaign(campaignUrl).map((recommendation) => [
      recommendation.terminusName,
      recommendation,
    ]),
  ) as Record<string, EquipmentRecommendation>;

const equipmentRecommendationGetter = (campaignUrl: string) => {
  const recommendations = equipmentByTerminusNameForCampaign(campaignUrl);
  return (terminusName: string) => {
    const recommendation = recommendations[terminusName];
    if (!recommendation) {
      throw new Error(`equip_recs.json has no equipment recommendation for ${terminusName} at ${campaignUrl}.`);
    }
    return recommendation;
  };
};

export const getIndomitusEquipmentRecommendation = equipmentRecommendationGetter("/campaigns/indomitus");
export const getIndomitusMirrorEquipmentRecommendation = equipmentRecommendationGetter("/campaigns/indomitus-mirror");
export const getFallOfCadiaEquipmentRecommendation = equipmentRecommendationGetter("/campaigns/fall-of-cadia");
export const getFallOfCadiaMirrorEquipmentRecommendation = equipmentRecommendationGetter("/campaigns/fall-of-cadia-mirror");
export const getOctariusEquipmentRecommendation = equipmentRecommendationGetter("/campaigns/octarius");
export const getOctariusMirrorEquipmentRecommendation = equipmentRecommendationGetter("/campaigns/octarius-mirror");
