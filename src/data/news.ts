export const gameUpdate144 = {
  title: 'Game Update 1.44',
  href: '/news/game-update-1-44/',
  description: 'Ahriman’s Legendary Battle Pass, Daras Carrow, a new Custodes Machine of War, and the November–December event calendar.',
  image: '/images/Game-Update-144.png',
  webImage: '/images/web/Game-Update-144.webp',
  thumbnail: '/images/thumbnails/Game-Update-144-thumb.png',
  thumbnailAlt: 'Game Update 1.44 infographic preview',
  published: '2026-11-09',
  publishedLabel: 'Nov 9, 2026',
  period: 'Nov 15 – Dec 19, 2026',
};

export const skullHarvest = {
  title: 'Skull Harvest',
  href: '/news/skull-harvest/',
  description: 'Chaos Mythic Shop event begins Nov 23',
  image: '/images/skull-harvest-infographic.png',
  webImage: '/images/web/skull-harvest-infographic.webp',
  thumbnail: '/images/thumbnails/skull-harvest-infographic-thumb.webp',
  thumbnailAlt: 'Skull Harvest game banner featuring the World Eaters',
  published: '2026-11-20',
  publishedLabel: 'Nov 20, 2026',
  period: 'Nov 23–29, 2026',
};

export const newsArticles = [skullHarvest, gameUpdate144];
export type NewsArticle = typeof gameUpdate144;
