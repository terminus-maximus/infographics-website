import { currentGuildRaidSeason } from "./guildRaid";
import characterSource from "./campaigns/characters.json";
import requiredRecommendations from "./campaigns/required-recs.json";

export interface RequiredHeroIcon {
  name: string;
  portrait: string;
}

export type ContentLifecycle = "active" | "retired";

export interface Graphic {
  title: string;
  href: string;
  description: string;
  image: string;
  thumbnail: string;
  recommendationImage: string;
  category: string;
  lifecycle: ContentLifecycle;
  requiredHeroes?: RequiredHeroIcon[];
}

const characters = Object.values(characterSource.characters);

const getRequiredHeroes = (campaignUrl: string): RequiredHeroIcon[] =>
  requiredRecommendations
    .filter((recommendation) => recommendation.URL === campaignUrl)
    .map((recommendation) => {
      const character = characters.find(
        (candidate) => candidate.shortName === recommendation.terminus_name,
      );

      if (!character) {
        throw new Error(
          `Missing character portrait for required hero ${recommendation.terminus_name}`,
        );
      }

      return {
        name: character.name,
        portrait: `/images/heroes/${character.portrait}`,
      };
    });

type GraphicDefinition = Omit<Graphic, "recommendationImage" | "lifecycle"> & {
  lifecycle?: ContentLifecycle;
};

const graphicDefinitions: GraphicDefinition[] = [
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
      category: "start"
    },
    {
      title: "Indomitus Campaign Guide",
      href: "/campaigns/indomitus/",
      description: "Stage-by-stage Indomitus teams, character ranks, and replay evidence.",
      image: "/images/indomitus.png",
      thumbnail: "/images/thumbnails/indomitus-thumb.png",
      category: "campaign",
      requiredHeroes: getRequiredHeroes("/campaigns/indomitus")
    },
    {
      title: "Indomitus Mirror Guide",
      href: "/campaigns/indomitus-mirror/",
      description: "Necron teams, investment targets, difficult stages, and replay evidence for Indomitus Mirror.",
      image: "/images/indomitus-mirror.png",
      thumbnail: "/images/thumbnails/indomitus-mirror-thumb.png",
      category: "campaign",
      requiredHeroes: getRequiredHeroes("/campaigns/indomitus-mirror")
    },
    {
      title: "Explore All Campaign Guides",
      href: "/campaigns/",
      description: "Indomitus, Fall of Cadia, Octarius, and Saim-Hann. Normal, Elite, and Mirror.",
      image: "/images/CampaignGuideBanner.png",
      thumbnail: "/images/thumbnails/CampaignGuideBanner-thumb.png",
      category: "campaign"
    },
    {
      title: "Fall of Cadia Campaign Guide",
      href: "/campaigns/fall-of-cadia/",
      description: "Chaos teams, investment targets, difficult stages, and replay evidence for Fall of Cadia.",
      image: "/images/fall-of-cadia.png",
      thumbnail: "/images/thumbnails/fall-of-cadia-thumb.png",
      category: "campaign",
      requiredHeroes: getRequiredHeroes("/campaigns/fall-of-cadia")
    },
    {
      title: "Fall of Cadia Mirror Guide",
      href: "/campaigns/fall-of-cadia-mirror/",
      description: "Imperial teams, investment targets, difficult stages, and replay evidence for Fall of Cadia Mirror.",
      image: "/images/fall-of-cadia-mirror.png",
      thumbnail: "/images/thumbnails/fall-of-cadia-mirror-thumb.png",
      category: "campaign",
      requiredHeroes: getRequiredHeroes("/campaigns/fall-of-cadia-mirror")
    },
    {
      title: "Octarius Campaign Guide",
      href: "/campaigns/octarius/",
      description: "Ork teams, investment targets, difficult stages, and replay evidence for Octarius.",
      image: "/images/octarius.png",
      thumbnail: "/images/thumbnails/octarius-thumb.png",
      category: "campaign",
      requiredHeroes: getRequiredHeroes("/campaigns/octarius")
    },
    {
      title: "Octarius Mirror Guide",
      href: "/campaigns/octarius-mirror/",
      description: "Imperial teams, investment targets, difficult stages, and replay evidence for Octarius Mirror.",
      image: "/images/octarius-mirror.png",
      thumbnail: "/images/thumbnails/octarius-mirror-thumb.png",
      category: "campaign",
      requiredHeroes: getRequiredHeroes("/campaigns/octarius-mirror")
    },
    {
      title: "Saim-Hann Campaign Guide",
      href: "/campaigns/saim-hann/",
      description: "Aeldari teams, investment targets, difficult stages, and replay evidence for Saim-Hann.",
      image: "/images/saim-hann.png",
      thumbnail: "/images/thumbnails/saim-hann-thumb.png",
      category: "campaign",
      requiredHeroes: getRequiredHeroes("/campaigns/saim-hann")
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
      category: "raid"
    },
    {
      title: "Guild Raid Archive",
      href: "/guild-raid/archive",
      description: "Browse past Guild Raid seasons and infographic archives.",
      image: currentGuildRaidSeason.image,
      thumbnail: "/images/thumbnails/guild-raid-s97-mythic-thumb.png",
      category: "raid"
    },
    {
      title: "Lysander LRE",
      href: "/lre/lysander",
      description: "Unlock the 1st Captain on Aug 29th",
      image: "/images/lysander-lre.png",
      thumbnail: "/images/thumbnails/lysander-lre-thumb.png",
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
      title: "Lucius LRE",
      href: "/lre/lucius",
      description: "Plan teams and requirements for the Lucius Legendary Release Event.",
      image: "/images/lucius-lre.png",
      thumbnail: "/images/thumbnails/lucius-lre-thumb.png",
      category: "legendary",
      lifecycle: "retired"
    },
    {
      title: "Farsight LRE",
      href: "/lre/farsight",
      description: "Be ready for the Tau Legendary on Nov 15th",
      image: "/images/farsight-lre.png",
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

export const graphics: Graphic[] = graphicDefinitions.map((graphic) => ({
  ...graphic,
  lifecycle: graphic.lifecycle ?? "active",
  recommendationImage: graphic.image
    .replace(/^\/images\//, "/images/web/")
    .replace(/\.[^.]+$/, ".webp"),
}));

export const discoveryGraphics: Graphic[] = graphics.filter(
  (graphic) => graphic.lifecycle === "active",
);
