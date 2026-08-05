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
      badge: "Popular",
      category: "start"
    },
    {
      title: "Campaign Guides",
      href: "/campaigns/",
      description: "Replay-backed teams and character ranks for Normal and Elite Campaign stages.",
      image: "/images/CampaignGuideBanner.png",
      thumbnail: "/images/thumbnails/CampaignGuideBanner-thumb.png",
      category: "start"
    },
    {
      title: "Indomitus Campaign Guide",
      href: "/campaigns/indomitus/",
      description: "Stage-by-stage Indomitus teams, character ranks, and replay evidence.",
      image: "/images/indomitus.png",
      thumbnail: "/images/thumbnails/indomitus-thumb.png",
      badge: "New",
      category: "campaign"
    },
    {
      title: "Indomitus Mirror Campaign Guide",
      href: "/campaigns/indomitus-mirror/",
      description: "Necron teams, investment targets, difficult stages, and replay evidence for Indomitus Mirror.",
      image: "/images/indomitus-mirror.png",
      thumbnail: "/images/thumbnails/indomitus-mirror-thumb.png",
      badge: "New",
      category: "campaign"
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
      title: "Boss Meta Guide",
      description: "Meta and alternate teams for every Guild Raid boss, backed by replay research.",
      href: "/guild-raid/boss-meta/",
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
      badge: "Popular",
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
      title: "Lysander LRE",
      href: "/lre/lysander",
      description: "Unlock the 1st Captain on Aug 29th",
      image: "/images/lysander-lre.png",
      thumbnail: "/images/thumbnails/lysander-lre-thumb.png",
      badge: "New",
      category: "legendary"
    },
    {
      title: "Uthar LRE",
      href: "/lre/uthar",
      description: "Be ready for the Votann Legendary on Oct 3rd",
      image: "/images/uthar-lre.png",
      thumbnail: "/images/thumbnails/uthar-lre-thumb.png",
      category: "legendary"
    },
    {
      title: "Farsight LRE",
      href: "/lre/farsight",
      description: "Be ready for the Farsight Legendary on Nov 15th",
      image: "/images/lre.png",
      thumbnail: "/images/thumbnails/lre-thumb.png",
      category: "legendary"
    },
    {
      title: "Campaign Event",
      href: "/campaign-event",
      description: "Next CE begins Aug 6",
      image: "/images/campaign-event.png",
      thumbnail: "/images/thumbnails/campaign-event-thumb.png",
      category: "event"
    },
    {
      title: "Hero Release Events",
      href: "/hre",
      description: "Next HRE begins Aug 9",
      image: "/images/hre.png",
      thumbnail: "/images/thumbnails/hre-thumb.png",
      category: "event"
    },
    {
      title: "Incursion / MoW",
      href: "/incursion-mow",
      description: "Next Incursion begins Aug 24",
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
