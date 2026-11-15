import seasonSources from './guild-raid/season-sources.json';

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
