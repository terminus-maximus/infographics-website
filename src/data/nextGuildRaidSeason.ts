import { currentGuildRaidSeasonNumber } from "./guildRaid";
import { resolveNextGuildRaidSeason } from "../lib/guildRaidSeason.mjs";
import seasonSources from './guild-raid/season-sources.json';

// Discover pages without loading their components, scripts, or styles.
const seasonPages = import.meta.glob("../pages/guild-raid/s[0-9]*.astro", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const nextGuildRaidSeason = resolveNextGuildRaidSeason(
  currentGuildRaidSeasonNumber,
  Object.keys(seasonPages),
  seasonSources.seasons.map(season => season.season),
);
