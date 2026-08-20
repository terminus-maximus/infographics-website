import { graphics, type Graphic } from "./graphics";
import { currentGuildRaidSeason } from "./guildRaid";

export const normalizeRecommendationPath = (value: string): string => {
  const pathname = value.split(/[?#]/, 1)[0] || "/";
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash === "/" ? "/" : withLeadingSlash.replace(/\/+$/, "");
};

const campaignCompanions = ["/beginner-guide", "/elite-campaigns", "/campaigns"];
const campaignRoutes = [
  "/campaigns/indomitus",
  "/campaigns/indomitus-mirror",
  "/campaigns/fall-of-cadia",
  "/campaigns/fall-of-cadia-mirror",
  "/campaigns/octarius",
  "/campaigns/octarius-mirror",
  "/campaigns/saim-hann",
];

const guildRaidRoutes = {
  currentSeason: currentGuildRaidSeason.href,
  bossMeta: "/guild-raid/boss-meta",
  replayLibrary: "/replay-library",
  archive: "/guild-raid/archive",
};

export const relatedGuideRoutes: Record<string, string[]> = Object.fromEntries([
  ...campaignRoutes.map((route) => [route, campaignCompanions]),
  [guildRaidRoutes.currentSeason, [guildRaidRoutes.bossMeta, guildRaidRoutes.replayLibrary, guildRaidRoutes.archive]],
  [guildRaidRoutes.bossMeta, [guildRaidRoutes.currentSeason, guildRaidRoutes.replayLibrary, guildRaidRoutes.archive]],
  [guildRaidRoutes.replayLibrary, [guildRaidRoutes.currentSeason, guildRaidRoutes.bossMeta, guildRaidRoutes.archive]],
  [guildRaidRoutes.archive, [guildRaidRoutes.currentSeason, guildRaidRoutes.bossMeta, guildRaidRoutes.replayLibrary]],
].map(([route, companions]) => [
  normalizeRecommendationPath(route as string),
  (companions as string[]).map(normalizeRecommendationPath),
]));

const catalogByRoute = new Map(
  graphics.map((graphic) => [normalizeRecommendationPath(graphic.href), graphic]),
);

export const recommendationCatalog: Graphic[] = graphics.filter(
  (graphic) => graphic.recommendationImage.toLowerCase().endsWith(".webp"),
);

export const getRelatedGuides = (pathname: string): Graphic[] => {
  const routes = relatedGuideRoutes[normalizeRecommendationPath(pathname)] || [];
  const guides = routes.map((route) => catalogByRoute.get(route)).filter(Boolean) as Graphic[];

  if (routes.length && guides.length !== 3) {
    throw new Error(`Related Guides mapping for ${pathname} must resolve to exactly 3 catalog cards.`);
  }

  return guides;
};

export const getMoreToExploreCandidates = (
  pathname: string,
  relatedGuides: Graphic[],
): Graphic[] => {
  const excludedRoutes = new Set([
    normalizeRecommendationPath(pathname),
    ...relatedGuides.map((guide) => normalizeRecommendationPath(guide.href)),
  ]);

  return recommendationCatalog.filter(
    (graphic) => !excludedRoutes.has(normalizeRecommendationPath(graphic.href)),
  );
};
