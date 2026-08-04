import equipmentRecommendationsCsv from "./equip_recs.csv?raw";

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
