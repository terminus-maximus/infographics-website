import seasonSources from '../data/guild-raid/season-sources.json';

// Historical display dates use Dan's confirmed 14-day cadence, anchored to S114.
// This does not establish a game configuration or lineup binding.
export function guildRaidSeasonStartDate(seasonNumber: string | number): string {
  const season = Number(seasonNumber);
  if (!Number.isInteger(season) || season < 1) throw new Error(`Invalid Guild Raid season: ${seasonNumber}`);

  const registered = seasonSources.seasons.find(entry => entry.season === season);
  if (registered) return registered.startDate;

  const anchor = seasonSources.seasons.find(entry => entry.season === 114);
  if (!anchor) throw new Error('Missing S114 Guild Raid date anchor');
  const date = new Date(`${anchor.startDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + (season - anchor.season) * 14);
  return date.toISOString().slice(0, 10);
}

export function formatGuildRaidStartDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric',
  });
}
