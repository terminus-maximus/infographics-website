import { currentGuildRaidSeason } from "./guildRaid";

export const graphics = [
    {
      title: "Beginner Guide",
      href: "/beginner-guide",
      description: "New player priorities and Normal Campaign progression.",
      image: "/images/beginner-guide.png",
      thumbnail: "/images/thumbnails/beginner-guide-thumb.png",
      category: "start"
    },
    {
      title: "Elite Campaigns",
      href: "/elite-campaigns",
      description: "Elite Campaign minimum investment guide.",
      image: "/images/elite-campaigns.png",
      thumbnail: "/images/thumbnails/elite-campaigns-thumb.png",
      badge: "Updated",
      category: "start"
    },
    {
      title: "Current Season",
      href: currentGuildRaidSeason.href,
      description: currentGuildRaidSeason.description,
      image: currentGuildRaidSeason.image,
      thumbnail: currentGuildRaidSeason.thumbnail,
      category: "raid"
    },
    {
      title: "Season 105",
      href: "/guild-raid/s105",
      description: "Get ready for triple Primarchs on July 15th",
      image: "/images/guild-raid-s105-mythic.png",
      thumbnail: "/images/thumbnails/guild-raid-s105-mythic-thumb.png",
      badge: "New",
      category: "raid"
    },
    {
      title: "Boss Meta Guide",
      description: "Meta and alternate teams for every Guild Raid boss, backed by replay research.",
      href: "/guild-raid/boss-meta",
      image: "/images/boss-meta.png",
      thumbnail: "/images/thumbnails/boss-meta-thumb.png",
      category: "raid"
    },
    {
      title: "Replay Library",
      href: "/replay-library",
      description: "Web exclusive feature! Search replays by Boss, Map, Team, or even specific Heroes",
      image: "/images/ReplayLibraryBanner.png",
      thumbnail: "/images/thumbnails/ReplayLibraryBanner-thumb.png",
      badge: "New",
      category: "raid"
    },
    {
      title: "Guild Raid Archive",
      href: "/guild-raid/archive",
      description: "Browse past Guild Raid seasons and infographic archives.",
      image: "/images/guild-raid-archive.png",
      thumbnail: "/images/thumbnails/guild-raid-s97-mythic-thumb.png",
      category: "raid"
    },
    {
      title: "Lucius LRE",
      href: "/lre/lucius",
      description: "Lucius Legendary Release Event teams, requirements, and planning.",
      image: "/images/lucius-lre.png",
      thumbnail: "/images/thumbnails/lucius-lre-thumb.png",
      badge: "Coming Soon",
      category: "legendary"
    },
    {
      title: "Uthar LRE",
      href: "/lre/uthar",
      description: "Uthar Legendary Release Event teams, requirements, and planning.",
      image: "/images/uthar-lre.png",
      thumbnail: "/images/thumbnails/uthar-lre-thumb.png",
      category: "legendary"
    },
    {
      title: "Farsight LRE",
      href: "/lre/farsight",
      description: "Farsight Legendary Release Event teams, requirements, and planning.",
      image: "/images/lre.png",
      thumbnail: "/images/thumbnails/lre-thumb.png",
      category: "legendary"
    },
    {
      title: "Campaign Event",
      href: "/campaign-event",
      description: "Event details, required characters, and rewards.",
      image: "/images/campaign-event.png",
      thumbnail: "/images/thumbnails/campaign-event-thumb.png",
      category: "event"
    },
    {
      title: "Hero Release Events",
      href: "/hre",
      description: "Mission guides designed to maximize unlock chances.",
      image: "/images/hre.png",
      thumbnail: "/images/thumbnails/hre-thumb.png",
      category: "event"
    },
    {
      title: "Incursion / MoW",
      href: "/incursion-mow",
      description: "Machine of War recommendations and Incursion basics.",
      image: "/images/incursion-mow.png",
      thumbnail: "/images/thumbnails/incursion-mow-thumb.png",
      category: "event"
    },
    {
      title: "About Me",
      href: "/about",
      description: "More about Terminus Maximus.",
      image: "/images/terminus-maximus.png",
      thumbnail: "/images/thumbnails/about-thumb.png",
      category: "about"
    },
  ];
