type ReplayRecord = {
  creator?: string;
  video_id?: string;
  video_url?: string;
  tier_final?: string;
  boss_final?: string;
  damage_guess?: number;
  damage_final?: string | number;
  published_at?: string;
  review_status?: string;
  agent_review?: "LEGACY_REVIEW" | "STRONG_RESULT" | "NEED_HUMAN";
  map?: string | null;
  team_archetype?: string;
  hero_1?: string;
  hero_2?: string;
  hero_3?: string;
  hero_4?: string;
  hero_5?: string;
  MoW?: string;
};

type BossRecord = {
  Boss: string;
  "Long Name"?: string;
};

type CharacterRecord = {
  hero_name: string;
  [teamArchetype: string]: string | null;
};

type MapRecord = {
  boss_name: string;
  map_name: string;
};

type TeamTemplateRecord = {
  team_archetype: string;
  [key: string]: string;
};

export type ReplayLibraryReplay = {
  id: string;
  videoId: string;
  boss: string;
  bossLongName: string;
  team: string;
  map: string;
  tier: string;
  damage: number;
  damageLabel: string;
  heroes: string[];
  mow: string;
  creator: string;
  videoUrl: string;
  publishedAt: string;
  publishedAtLabel: string;
  publishedAtTimestamp: number;
};

export type ReplayLibraryData = {
  replays: ReplayLibraryReplay[];
  archivedReplayCount: number;
  bosses: { value: string; label: string }[];
  mapsByBoss: Record<string, string[]>;
  teams: string[];
  tiers: string[];
  heroesByTeam: Record<string, string[]>;
};

export function parseReplayDamage(value: string | number | undefined, fallback?: number) {
  if (typeof value === "number") return value;
  const parsed = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback || 0;
}

export function formatReplayDamage(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${Math.floor(value / 1_000)}K`;
  return String(value);
}

export function parseReplayPublishedAt(value: string | undefined) {
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function formatReplayPublishedAt(value: string | undefined) {
  const timestamp = parseReplayPublishedAt(value);
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()}`;
}

export function getReplayIconPath(type: "bosses" | "heroes" | "mow" | "maps" | "tier", value: string) {
  const normalizedValue = type === "bosses" || type === "maps" ? value.replaceAll(" ", "_") : value;
  return `/images/replay-library/${type}/${normalizedValue}.webp`;
}

export function createReplayLibraryData(
  replayRows: ReplayRecord[],
  bossRows: BossRecord[],
  characterRows: CharacterRecord[],
  mapRows: MapRecord[],
  teamTemplateRows: TeamTemplateRecord[]
): ReplayLibraryData {
  const bossLongNames = Object.fromEntries(
    bossRows.map((boss) => [boss.Boss, boss["Long Name"] || boss.Boss])
  );

  const replays = replayRows
    .filter((replay) => replay.review_status === "VALID_REPLAY")
    .map((replay, index) => {
      const damage = parseReplayDamage(replay.damage_final, replay.damage_guess);
      const publishedAt = replay.published_at || "";
      const heroes = [replay.hero_1, replay.hero_2, replay.hero_3, replay.hero_4, replay.hero_5]
        .filter((hero): hero is string => Boolean(hero));

      return {
        id: `${replay.video_url || "replay"}-${index}`,
        videoId: replay.video_id || extractYouTubeVideoId(replay.video_url || "") || "",
        boss: replay.boss_final || "Unknown",
        bossLongName: bossLongNames[replay.boss_final || ""] || replay.boss_final || "Unknown",
        team: replay.team_archetype || "Unknown",
        map: replay.map || "Unmapped",
        tier: replay.tier_final || "",
        damage,
        damageLabel: formatReplayDamage(damage),
        heroes,
        mow: replay.MoW || "",
        creator: replay.creator || "Unknown",
        videoUrl: replay.video_url || "#",
        publishedAt,
        publishedAtLabel: formatReplayPublishedAt(publishedAt),
        publishedAtTimestamp: parseReplayPublishedAt(publishedAt)
      };
    })
    .filter((replay) => replay.boss !== "Unknown" && replay.damage > 0 && replay.videoUrl !== "#")
    .sort((a, b) => b.damage - a.damage);

  const replayBosses = new Set(replays.map((replay) => replay.boss));
  const bosses = bossRows
    .filter((boss) => replayBosses.has(boss.Boss))
    .map((boss) => ({
      value: boss.Boss,
      label: boss.Boss
    }))
    .sort((a, b) => a.value.localeCompare(b.value));

  const mapsByBoss = mapRows.reduce<Record<string, string[]>>((maps, map) => {
    if (!replayBosses.has(map.boss_name)) return maps;
    maps[map.boss_name] ||= [];
    maps[map.boss_name].push(map.map_name);
    return maps;
  }, {});

  Object.keys(mapsByBoss).forEach((boss) => {
    mapsByBoss[boss] = [...new Set(mapsByBoss[boss])].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  });

  const teams = teamTemplateRows
    .map((team) => team.team_archetype)
    .filter((team) => replays.some((replay) => replay.team === team))
    .sort((a, b) => a.localeCompare(b));

  const tierOrder = ["M3", "M2", "M1", "L5", "L4", "L3", "L2", "L1"];
  const tiers = tierOrder.filter((tier) => replays.some((replay) => replay.tier === tier));

  const heroesByTeam = Object.fromEntries(
    teams.map((team) => [
      team,
      characterRows
        .filter((character) => character[team] === "X")
        .map((character) => character.hero_name)
        .sort((a, b) => a.localeCompare(b))
    ])
  );

  return {
    replays,
    archivedReplayCount: replays.length,
    bosses,
    mapsByBoss,
    teams,
    tiers,
    heroesByTeam
  };
}

export function extractYouTubeVideoId(url: string) {
  if (!url) return "";
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch?.[1]) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([^?&/]+)/);
  return shortMatch?.[1] || "";
}
