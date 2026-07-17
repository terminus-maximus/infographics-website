import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../..");
const replayDirectory = path.join(repositoryRoot, "src/data/replay-library");
const manifestPath = path.join(replayDirectory, "replay-library-export-manifest.json");
const outputDirectory = path.join(repositoryRoot, "analytics/generated");
const outputPath = path.join(outputDirectory, "dim_replay.csv");
const summaryPath = path.join(outputDirectory, "dim_replay-summary.json");

const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const replayPath = path.join(replayDirectory, manifest.replays_filename);
const sourceRows = JSON.parse(await fs.readFile(replayPath, "utf8"));

const normalizeString = (value) => {
  const normalized = String(value ?? "").trim();
  return normalized || null;
};

const parseInteger = (value) => {
  const normalized = String(value ?? "").replaceAll(",", "").trim();
  if (!normalized) return null;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseSourceDate = (value) => {
  const match = String(value ?? "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return null;
  const [, month, day, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const csvValue = (value) => {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (!/[",\n\r]/.test(stringValue)) return stringValue;
  return `"${stringValue.replaceAll('"', '""')}"`;
};

const headers = [
  "video_id", "youtube_url", "creator", "boss", "tier", "guild_raid_season",
  "team_archetype", "hero_1", "hero_2", "hero_3", "hero_4", "hero_5", "mow",
  "map", "damage", "published_date", "review_status", "is_valid_replay",
  "source_exported_at"
];

const validRows = sourceRows
  .filter((row) => row.review_status === "VALID_REPLAY")
  .map((row) => ({
    video_id: normalizeString(row.video_id),
    youtube_url: normalizeString(row.video_url),
    creator: normalizeString(row.creator),
    boss: normalizeString(row.boss_final),
    tier: normalizeString(row.tier_final),
    guild_raid_season: null,
    team_archetype: normalizeString(row.team_archetype),
    hero_1: normalizeString(row.hero_1),
    hero_2: normalizeString(row.hero_2),
    hero_3: normalizeString(row.hero_3),
    hero_4: normalizeString(row.hero_4),
    hero_5: normalizeString(row.hero_5),
    mow: normalizeString(row.MoW),
    map: normalizeString(row.map),
    damage: parseInteger(row.damage_final),
    published_date: parseSourceDate(row.published_at),
    review_status: row.review_status,
    is_valid_replay: true,
    source_exported_at: normalizeString(manifest.exported_at)
  }));

const missingRequired = validRows.filter((row) => !row.video_id || !row.youtube_url);
const videoCounts = new Map();
for (const row of validRows) {
  videoCounts.set(row.video_id, (videoCounts.get(row.video_id) ?? 0) + 1);
}
const duplicateVideoIds = [...videoCounts.entries()]
  .filter(([, count]) => count > 1)
  .map(([videoId, count]) => ({ video_id: videoId, count }));

if (missingRequired.length || duplicateVideoIds.length) {
  throw new Error(JSON.stringify({
    message: "Replay dimension validation failed.",
    missing_required_rows: missingRequired.length,
    duplicate_video_ids: duplicateVideoIds
  }, null, 2));
}

const csvLines = [
  headers.join(","),
  ...validRows.map((row) => headers.map((header) => csvValue(row[header])).join(","))
];

const summary = {
  source_file: path.relative(repositoryRoot, replayPath),
  source_exported_at: manifest.exported_at,
  source_rows: sourceRows.length,
  valid_replay_rows: validRows.length,
  excluded_non_valid_rows: sourceRows.length - validRows.length,
  duplicate_video_ids: duplicateVideoIds.length,
  missing_required_rows: missingRequired.length,
  rows_missing_damage: validRows.filter((row) => row.damage === null).length,
  rows_missing_published_date: validRows.filter((row) => row.published_date === null).length,
  guild_raid_season_note: "The canonical source does not contain a season field, so the dimension leaves it null."
};

await fs.mkdir(outputDirectory, { recursive: true });
await fs.writeFile(outputPath, `${csvLines.join("\n")}\n`, "utf8");
await fs.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
