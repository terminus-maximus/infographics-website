import seasonSources from './guild-raid/season-sources.json';
import { formatGuildRaidStartDate } from '../lib/guildRaidDates';

export const currentGuildRaidSeasonNumber = "113";
const singleImage = seasonSources.seasons.some(season => String(season.season) === currentGuildRaidSeasonNumber);
const imageName = `guild-raid-s${currentGuildRaidSeasonNumber}${singleImage ? '' : '-mythic'}`;

export const currentGuildRaidSeason = {
  seasonNumber: currentGuildRaidSeasonNumber,
  title: "Current Season",
  href: `/guild-raid/s${currentGuildRaidSeasonNumber}`,
  description: "Current Guild Raid season infographics, boss lineups, and team guidance.",
  image: `/images/${imageName}.png`,
  thumbnail: `/images/thumbnails/${imageName}-thumb.png`,
  webImage: `/images/web/${imageName}.webp`,
};

// Numbered Ready guides belong in the archive and contextual news links.
export const readyGuildRaidSeasons = seasonSources.seasons
  .filter(season => season.status === 'Ready')
  .sort((a, b) => a.season - b.season)
  .map(season => ({
    seasonNumber: season.season,
    startDate: season.startDate,
    title: `Season ${season.season}`,
    href: `/guild-raid/s${season.season}`,
    description: `Starts ${formatGuildRaidStartDate(season.startDate)}. Boss maps, teams, and replays.`,
    image: `/images/guild-raid-s${season.season}.png`,
    thumbnail: `/images/thumbnails/guild-raid-s${season.season}-thumb.png`,
    webImage: `/images/web/guild-raid-s${season.season}.webp`,
  }));
