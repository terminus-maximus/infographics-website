/**
 * Resolve the next guide from the season pages present at build time.
 * Without that guide, use the current season's preview of upcoming bosses.
 * @param {string} currentSeasonNumber
 * @param {string[]} seasonPagePaths
 * @param {(string | number)[]} singleImageSeasons
 */
export function resolveNextGuildRaidSeason(currentSeasonNumber, seasonPagePaths, singleImageSeasons = []) {
  const seasonNumber = String(Number(currentSeasonNumber) + 1);
  const pagePath = seasonPagePaths.find((path) => {
    const match = path.match(/\/s(\d+)\.astro$/);
    return match && Number(match[1]) === Number(seasonNumber);
  });
  const fullGuideHref = pagePath
    ? `/guild-raid/${pagePath.split("/").at(-1).replace(/\.astro$/, "")}`
    : null;
  const imageSeason = fullGuideHref ? seasonNumber : currentSeasonNumber;
  const imageKind = fullGuideHref ? "mythic" : "coming-soon";
  const singleImage = Boolean(fullGuideHref && singleImageSeasons.map(String).includes(seasonNumber));
  const imageName = `guild-raid-s${imageSeason}${singleImage ? '' : `-${imageKind}`}`;

  return {
    title: "Next Season",
    description: "Prepare for the next season with boss lineups, maps, and more",
    seasonNumber,
    fullGuideHref,
    href: fullGuideHref || "/guild-raid/next-season",
    image: `/images/${imageName}.png`,
    webImage: `/images/web/${imageName}.webp`,
    thumbnail: singleImage ? `/images/thumbnails/${imageName}-thumb.png` : `/images/web/${imageName}.webp`,
    imageAlt: fullGuideHref
      ? `Guild Raid Season ${seasonNumber}${singleImage ? '' : ' Mythic Bosses'} Infographic`
      : `Guild Raid Season ${currentSeasonNumber} Coming Soon Infographic`,
  };
}
