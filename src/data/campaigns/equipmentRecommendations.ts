import equipmentRecommendationsCsv from "./equip_recs.csv?raw";
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

const parseCsv = (csv: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];

    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && csv[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (quoted) throw new Error("equip_recs.csv contains an unterminated quoted field.");
  return rows;
};

const rows = parseCsv(equipmentRecommendationsCsv);
const headers = rows.shift();

if (!headers) throw new Error("equip_recs.csv is empty.");

const requiredHeaders = [
  "URL",
  "Reference",
  "terminus_name",
  "Normal_1_Icon",
  "Normal_1_Rank",
  "Normal_2_Icon",
  "Normal_2_Rank",
  "Elite_1_Icon",
  "Elite_1_Rank",
  "Elite_2_Icon",
  "Elite_2_Rank",
] as const;

for (const header of requiredHeaders) {
  if (!headers.includes(header)) throw new Error(`equip_recs.csv is missing the ${header} column.`);
}

const equipmentFrom = (row: Record<string, string>, iconColumn: string, rankColumn: string): EquipmentTarget => {
  const icon = row[iconColumn]?.trim();
  const rankValue = row[rankColumn]?.trim();
  const match = icon?.match(/^[^-]+-[123]-(Uncommon|Rare|Epic|Legendary)-(.+)\.webp$/);

  if (!match) throw new Error(`Invalid equipment filename in ${iconColumn}: ${icon || "(empty)"}`);

  const rank = Number(rankValue);
  if (!Number.isInteger(rank) || rank < 1) {
    throw new Error(`Invalid numeric equipment rank in ${rankColumn}: ${rankValue || "(empty)"}`);
  }

  return {
    icon,
    rank,
    rarity: match[1] as EquipmentTarget["rarity"],
    name: match[2].replaceAll("-", " "),
  };
};

export const indomitusEquipmentRecommendations: EquipmentRecommendation[] = rows
  .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])))
  .filter((row) => row.URL.trim() === "/campaigns/indomitus")
  .map((row) => ({
    reference: row.Reference.trim(),
    terminusName: row.terminus_name.trim(),
    normal: {
      weapon: equipmentFrom(row, "Normal_1_Icon", "Normal_1_Rank"),
      defense: equipmentFrom(row, "Normal_2_Icon", "Normal_2_Rank"),
    },
    elite: {
      weapon: equipmentFrom(row, "Elite_1_Icon", "Elite_1_Rank"),
      defense: equipmentFrom(row, "Elite_2_Icon", "Elite_2_Rank"),
    },
  }));

export const indomitusEquipmentByTerminusName = Object.fromEntries(
  indomitusEquipmentRecommendations.map((recommendation) => [recommendation.terminusName, recommendation]),
) as Record<string, EquipmentRecommendation>;

export const getIndomitusEquipmentRecommendation = (terminusName: string) => {
  const recommendation = indomitusEquipmentByTerminusName[terminusName];
  if (!recommendation) {
    throw new Error(`equip_recs.csv has no Indomitus equipment recommendation for ${terminusName}.`);
  }
  return recommendation;
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

export const indomitusMirrorEquipmentByTerminusName = Object.fromEntries(
  getEquipmentRecommendationsForCampaign("/campaigns/indomitus-mirror").map((recommendation) => [
    recommendation.terminusName,
    recommendation,
  ]),
) as Record<string, EquipmentRecommendation>;

export const getIndomitusMirrorEquipmentRecommendation = (terminusName: string) => {
  const recommendation = indomitusMirrorEquipmentByTerminusName[terminusName];
  if (!recommendation) {
    throw new Error(`equip_recs.json has no Indomitus Mirror equipment recommendation for ${terminusName}.`);
  }
  return recommendation;
};
