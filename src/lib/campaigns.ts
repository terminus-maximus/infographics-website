// The project does not currently include @types/node, though Astro executes this module at build time.
// @ts-expect-error Node's runtime module is available during the Astro build.
import { existsSync } from "node:fs";
// @ts-expect-error Node's runtime module is available during the Astro build.
import { resolve } from "node:path";

import characterSource from "../data/campaigns/characters.json";
import rankSource from "../data/campaigns/ranks.json";
import replaySource from "../data/campaigns/indomitus_replays.json";

declare const process: { cwd: () => string };

export interface CharacterReference {
  id: string;
  name: string;
  shortName: string;
  portrait: string;
}

export interface RankReference {
  id: string;
  name: string;
  sort: number;
  badge: string;
}

export interface CampaignVideo {
  title: string;
  creator: string;
  url: string;
}

export interface CampaignEvidence {
  videoId: string;
  roster: Array<{
    characterId: string;
    rankId: string;
    role?: "required" | "optional";
  }>;
  timestamp?: string;
  timestampSeconds?: number;
  notes?: string;
}

export interface CampaignStage {
  number: number;
  evidence: CampaignEvidence[];
}

export interface CampaignMode {
  id: "normal" | "elite" | string;
  name: string;
  stages: CampaignStage[];
}

export interface CampaignGuideData {
  id: string;
  name: string;
  updatedAt: string;
  featuredImage?: string;
  modes: CampaignMode[];
  videos: Record<string, CampaignVideo>;
}

const MODE_LIMITS: Record<string, { minimumStage: number; maximumStage: number }> = {
  normal: { minimumStage: 1, maximumStage: 75 },
  elite: { minimumStage: 1, maximumStage: 40 },
};

const REQUIRED_CHARACTER_ALIASES: Record<string, string> = {
  varro: "ultraTigurius",
  certus: "ultraEliminatorSgt",
  bellator: "ultraInceptorSgt",
};

function requireObject(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  return value as Record<string, unknown>;
}

function requireString(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be a non-empty string.`);
  return value.trim();
}

function requireInteger(value: unknown, label: string) {
  if (!Number.isInteger(value)) throw new Error(`${label} must be an integer.`);
  return Number(value);
}

function validatePublicAsset(assetPath: string, label: string) {
  const filePath = resolve(process.cwd(), "public", assetPath.replace(/^\//, ""));
  if (!existsSync(filePath)) throw new Error(`${label} asset is missing: ${assetPath}`);
}

function validateYouTubeUrl(videoId: string, videoUrl: string) {
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) throw new Error(`Invalid YouTube video ID "${videoId}".`);
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(videoUrl);
  } catch {
    throw new Error(`Invalid YouTube URL "${videoUrl}".`);
  }
  if (
    !["youtube.com", "www.youtube.com", "m.youtube.com"].includes(parsedUrl.hostname) ||
    parsedUrl.searchParams.get("v") !== videoId
  ) {
    throw new Error(`YouTube URL does not match video ID "${videoId}": ${videoUrl}`);
  }
}

function loadCharacterReferences(source: unknown) {
  const sourceObject = requireObject(source, "Character reference source");
  const characters = requireObject(sourceObject.characters, "Character references");
  const aliases = requireObject(sourceObject.aliases, "Character aliases");
  const references: Record<string, CharacterReference> = {};
  const aliasMap = new Map<string, string>();

  Object.entries(characters).forEach(([id, value]) => {
    const character = requireObject(value, `Character "${id}"`);
    const portraitFile = requireString(character.portrait, `Character "${id}" portrait`);
    const portrait = `/images/heroes/${portraitFile}`;
    validatePublicAsset(portrait, `Character "${id}" portrait`);
    references[id] = {
      id,
      name: requireString(character.name, `Character "${id}" name`),
      shortName: requireString(character.shortName, `Character "${id}" shortName`),
      portrait,
    };
  });

  Object.entries(aliases).forEach(([alias, value]) => {
    const id = requireString(value, `Character alias "${alias}"`);
    if (alias !== alias.toLocaleLowerCase("en-US")) throw new Error(`Character alias "${alias}" must be lowercase.`);
    if (!references[id]) throw new Error(`Character alias "${alias}" references missing character "${id}".`);
    aliasMap.set(alias, id);
  });
  Object.entries(REQUIRED_CHARACTER_ALIASES).forEach(([alias, id]) => {
    if (!references[id]) throw new Error(`Required character alias "${alias}" references missing character "${id}".`);
    aliasMap.set(alias, id);
  });

  return { references, aliasMap, sourceCount: Object.keys(characters).length, aliasCount: aliasMap.size };
}

function loadRankReferences(source: unknown) {
  const sourceObject = requireObject(source, "Rank reference source");
  const ranks = requireObject(sourceObject.ranks, "Rank references");
  const aliases = requireObject(sourceObject.aliases, "Rank aliases");
  const references: Record<string, RankReference> = {};
  const aliasMap = new Map<string, string>();
  const sortOrders = new Set<number>();

  Object.entries(ranks).forEach(([id, value]) => {
    const rank = requireObject(value, `Rank "${id}"`);
    const sort = requireInteger(rank.sort, `Rank "${id}" sort`);
    if (sort < 1 || sortOrders.has(sort)) throw new Error(`Rank "${id}" has invalid or duplicate sort value "${sort}".`);
    sortOrders.add(sort);
    const badgeFile = requireString(rank.badge, `Rank "${id}" badge`);
    const badge = `/images/ranks/${badgeFile}`;
    validatePublicAsset(badge, `Rank "${id}" badge`);
    references[id] = { id, name: requireString(rank.name, `Rank "${id}" name`), sort, badge };
  });

  Object.entries(aliases).forEach(([alias, value]) => {
    const id = requireString(value, `Rank alias "${alias}"`);
    if (alias !== alias.toLocaleLowerCase("en-US")) throw new Error(`Rank alias "${alias}" must be lowercase.`);
    if (!references[id]) throw new Error(`Rank alias "${alias}" references missing rank "${id}".`);
    aliasMap.set(alias, id);
  });

  return { references, aliasMap, sourceCount: Object.keys(ranks).length, aliasCount: aliasMap.size };
}

const characterData = loadCharacterReferences(characterSource);
const rankData = loadRankReferences(rankSource);

export const characterReferences = characterData.references;
export const rankReferences = rankData.references;

function parseTimestamp(timestamp: string) {
  const parts = timestamp.split(":");
  if (![2, 3].includes(parts.length) || parts.some((part) => !/^\d+$/.test(part))) return null;
  const values = parts.map(Number);
  if (values.slice(1).some((value) => value > 59)) return null;
  return values.length === 2 ? values[0] * 60 + values[1] : values[0] * 3600 + values[1] * 60 + values[2];
}

export function validateCampaignGuide(source: unknown): CampaignGuideData {
  const sourceObject = requireObject(source, "Campaign source");
  const id = requireString(sourceObject.id, "Campaign id");
  const name = requireString(sourceObject.name, "Campaign name");
  const updatedAt = requireString(sourceObject.updatedAt, "Campaign updatedAt");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(updatedAt)) throw new Error(`Campaign updatedAt must use YYYY-MM-DD.`);

  const rawVideos = requireObject(sourceObject.videos, "Campaign videos");
  const videos: Record<string, CampaignVideo> = {};
  Object.entries(rawVideos).forEach(([videoId, value]) => {
    const video = requireObject(value, `Video "${videoId}"`);
    const url = requireString(video.url, `Video "${videoId}" URL`);
    validateYouTubeUrl(videoId, url);
    videos[videoId] = {
      title: requireString(video.title, `Video "${videoId}" title`),
      creator: requireString(video.creator, `Video "${videoId}" creator`),
      url,
    };
  });

  if (!Array.isArray(sourceObject.modes)) throw new Error(`Campaign modes must be an array.`);
  const seenModes = new Set<string>();
  const seenObservations = new Set<string>();
  const referencedVideoIds = new Set<string>();
  const modes = sourceObject.modes.map((modeValue, modeIndex): CampaignMode => {
    const mode = requireObject(modeValue, `Campaign mode ${modeIndex + 1}`);
    const modeId = requireString(mode.id, `Campaign mode ${modeIndex + 1} id`);
    if (seenModes.has(modeId)) throw new Error(`Duplicate campaign mode "${modeId}".`);
    seenModes.add(modeId);
    const limits = MODE_LIMITS[modeId];
    if (!limits) throw new Error(`Unsupported campaign mode "${modeId}".`);
    if (!Array.isArray(mode.stages) || !mode.stages.length) throw new Error(`Campaign mode "${modeId}" has no stages.`);

    const seenStages = new Set<number>();
    const stages = mode.stages.map((stageValue, stageIndex): CampaignStage => {
      const stage = requireObject(stageValue, `${modeId} stage ${stageIndex + 1}`);
      const number = requireInteger(stage.number, `${modeId} stage number`);
      if (number < limits.minimumStage || number > limits.maximumStage || seenStages.has(number)) {
        throw new Error(`${modeId} contains invalid or duplicate stage "${number}".`);
      }
      seenStages.add(number);
      if (!Array.isArray(stage.evidence) || !stage.evidence.length) throw new Error(`${modeId} stage ${number} has no evidence.`);

      const evidence = stage.evidence.map((evidenceValue, evidenceIndex): CampaignEvidence => {
        const rawEvidence = requireObject(evidenceValue, `${modeId} stage ${number} evidence ${evidenceIndex + 1}`);
        const videoId = requireString(rawEvidence.videoId, `${modeId} stage ${number} videoId`);
        if (!videos[videoId]) throw new Error(`${modeId} stage ${number} references missing video "${videoId}".`);
        const observationKey = `${modeId}:${number}:${videoId}`;
        if (seenObservations.has(observationKey)) throw new Error(`Duplicate campaign observation "${observationKey}".`);
        seenObservations.add(observationKey);
        referencedVideoIds.add(videoId);

        if (!Array.isArray(rawEvidence.roster) || !rawEvidence.roster.length) {
          throw new Error(`${modeId} stage ${number} video "${videoId}" has no roster.`);
        }
        const seenCharacters = new Set<string>();
        const roster = rawEvidence.roster.map((memberValue, memberIndex) => {
          const member = requireObject(memberValue, `${modeId} stage ${number} roster member ${memberIndex + 1}`);
          const characterId = requireString(member.characterId, `${modeId} stage ${number} characterId`);
          const rankId = requireString(member.rankId, `${modeId} stage ${number} rankId`);
          const role = requireString(member.role, `${modeId} stage ${number} role`);
          if (!characterReferences[characterId]) throw new Error(`${modeId} stage ${number} has unknown character "${characterId}".`);
          if (!rankReferences[rankId]) throw new Error(`${modeId} stage ${number} has unknown rank "${rankId}".`);
          if (!["required", "optional"].includes(role)) throw new Error(`${modeId} stage ${number} has invalid role "${role}".`);
          if (seenCharacters.has(characterId)) throw new Error(`${modeId} stage ${number} video "${videoId}" repeats character "${characterId}".`);
          seenCharacters.add(characterId);
          return { characterId, rankId, role: role as "required" | "optional" };
        });

        const hasTimestamp = rawEvidence.timestamp != null || rawEvidence.timestampSeconds != null;
        let timestamp: string | undefined;
        let timestampSeconds: number | undefined;
        if (hasTimestamp) {
          timestamp = requireString(rawEvidence.timestamp, `${modeId} stage ${number} timestamp`);
          timestampSeconds = requireInteger(rawEvidence.timestampSeconds, `${modeId} stage ${number} timestampSeconds`);
          if (timestampSeconds < 0 || parseTimestamp(timestamp) !== timestampSeconds) {
            throw new Error(`${modeId} stage ${number} has mismatched timestamp "${timestamp}" / ${timestampSeconds}.`);
          }
        }

        return { videoId, roster, timestamp, timestampSeconds };
      });
      evidence.sort((left, right) => videos[left.videoId].creator.localeCompare(videos[right.videoId].creator));
      return { number, evidence };
    });
    stages.sort((left, right) => left.number - right.number);
    return { id: modeId, name: requireString(mode.name, `Campaign mode "${modeId}" name`), stages };
  });

  for (const requiredMode of Object.keys(MODE_LIMITS)) {
    if (!seenModes.has(requiredMode)) throw new Error(`Campaign is missing mode "${requiredMode}".`);
  }
  const unreferencedVideos = Object.keys(videos).filter((videoId) => !referencedVideoIds.has(videoId));
  if (unreferencedVideos.length) throw new Error(`Campaign has unreferenced videos: ${unreferencedVideos.join(", ")}.`);

  return { id, name, updatedAt, featuredImage: "/images/beginner-guide.png", modes, videos };
}

export const indomitusCampaign = validateCampaignGuide(replaySource);

const allEvidence = indomitusCampaign.modes.flatMap((mode) => mode.stages.flatMap((stage) => stage.evidence));
export const campaignAudit = {
  characterReferenceCount: characterData.sourceCount,
  characterAliasCount: characterData.aliasCount,
  rankReferenceCount: rankData.sourceCount,
  rankAliasCount: rankData.aliasCount,
  sourceObservationCount: allEvidence.length,
  normalizedObservationCount: allEvidence.length,
  videoCount: Object.keys(indomitusCampaign.videos).length,
  timestampedObservationCount: allEvidence.filter((evidence) => evidence.timestampSeconds != null).length,
  rosterSizeDistribution: allEvidence.reduce<Record<number, number>>((distribution, evidence) => {
    distribution[evidence.roster.length] = (distribution[evidence.roster.length] || 0) + 1;
    return distribution;
  }, {}),
};

export function getLowestObservedRanks(mode: CampaignMode, role: "required" | "optional" = "required") {
  const lowest = new Map<string, RankReference>();
  mode.stages.forEach((stage) =>
    stage.evidence.forEach((evidence) =>
      evidence.roster.forEach(({ characterId, rankId, role: memberRole }) => {
        if (memberRole !== role) return;
        const rank = rankReferences[rankId];
        const current = lowest.get(characterId);
        if (!current || rank.sort < current.sort) lowest.set(characterId, rank);
      }),
    ),
  );
  return lowest;
}
