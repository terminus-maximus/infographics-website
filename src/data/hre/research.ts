// Editorial content lives outside the generated datamine. Stable native mission
// IDs keep these notes attached to the correct quest when imports are refreshed.
export interface MissionResearch {
  sections: {
    title: string;
    paragraphs: string[];
    links?: { label: string; href: string }[];
  }[];
}

// Reviewed November 15, 2026. Community methods come from earlier HREs;
// mission requirements remain owned by the Daras datamine.
export const missionResearch: Record<string, MissionResearch> = {
  hre2_q7: {
    sections: [{
      title: 'Save your Salvage Runs',
      paragraphs: [
        'Plan to have two Salvage Runs available when you reach this mission. Avoid spending your last token just beforehand; waiting for both to recharge can hold up the next mission too.',
        'Use Chaos actives during manual farming while your tokens recharge.',
      ],
      links: [{ label: 'Reddit · Salvage and Guild Raid timing', href: 'https://www.reddit.com/r/WH40KTacticus/comments/1oo8esh/' }],
    }],
  },
  hre2_q8: {
    sections: [{
      title: 'Check the Guild Raid timer',
      paragraphs: [
        'Keep two Guild Raid attempts available and check when the season ends. Reaching this mission during the break means waiting for the next season, even with tokens ready.',
        'Push through the earlier missions if the break is close; otherwise, follow your usual farming plan.',
      ],
      links: [{ label: 'YouTube · Chaos Undivided on raid timing (2:05)', href: 'https://www.youtube.com/watch?v=6WpDm9wr_2c&t=125s' }],
    }],
  },
  hre2_q11: {
    sections: [
      {
        title: 'Work on both objectives together',
        paragraphs: ['Manually play Indomitus nodes that drop upgrades you need. Aim for Lightning Victories while collecting Necron kills.'],
        links: [{ label: 'Reddit · Mission 11 routes', href: 'https://www.reddit.com/r/WH40KTacticus/comments/1u0124t/any_way_to_complete_this_fast/' }],
      },
      {
        title: 'Farm the remaining Necron kills',
        paragraphs: ['Let scarabs multiply in Indomitus 45, then clear them. If using Ulf, hold him back until the board fills. This helps with kills; a long farming run will miss the Lightning timer.'],
        links: [{ label: 'Reddit · Scarab farming and Ulf', href: 'https://www.reddit.com/r/WH40KTacticus/comments/1u0124t/any_way_to_complete_this_fast/' }],
      },
      {
        title: 'Use Campaign Event Lightning raids',
        paragraphs: ['Players report that Campaign Event Lightning raids count toward this objective. Earn a Lightning Victory on the node first, then choose the two-ticket raid option. Ordinary campaign raids do not count.'],
        links: [{ label: 'Reddit · Lightning raid confirmations', href: 'https://www.reddit.com/r/WH40KTacticus/comments/1kllxb0/favorite_battles_for_hre_mission_completion/' }],
      },
    ],
  },
  hre2_q12: {
    sections: [{
      title: 'Keep an Onslaught token ready',
      paragraphs: ['Save one Onslaught attempt as you approach this mission to avoid waiting for a recharge after finishing the healing objective.'],
      links: [{ label: 'Reddit · Planning your tokens', href: 'https://www.reddit.com/r/WH40KTacticus/comments/1onx2ec/' }],
    }],
  },
  hre2_q13: {
    sections: [{
      title: 'Bring five Chaos characters',
      paragraphs: ['Choose Chaos campaign nodes with five character slots and upgrades you need. Use every active before finishing the battle. Baraqiel’s repeatable active will not help here: these uses must come from Chaos characters.'],
      links: [{ label: 'YouTube · Farming useful upgrades (3:38)', href: 'https://www.youtube.com/watch?v=RmpwFj9FuOI&t=218s' }],
    }],
  },
  hre2_q15: {
    sections: [
      {
        title: 'Start with your Arena battles',
        paragraphs: ['Use as many actives as you can in the four Arena battles, then finish the remaining uses through manual farming. Any alliance counts here; normal Heal and Repair actions do not.'],
      },
      {
        title: 'Repeat actives against scarabs',
        paragraphs: [
          'Bring Baraqiel, a healer and durable supports to Indomitus 45. Let scarabs multiply, then use his active whenever it is ready. Adding Aesoth gives you another repeatable active.',
          'Preserve glowing scarabs: they can still reproduce. Titus’s passive counter helps track ability uses. This saves energy, but expect a long battle.',
        ],
        links: [{ label: 'YouTube · Repeatable actives setup (1:09)', href: 'https://www.youtube.com/watch?v=RmpwFj9FuOI&t=69s' }],
      },
    ],
  },
  hre2_q18: {
    sections: [
      {
        title: 'Set up a ranged kill farm',
        paragraphs: [
          'In Indomitus 45, shelter Burchard, Lucien or Thaddeus behind durable characters and a healer. Let scarabs multiply and preserve the glowing ones. Keep enemies out of melee range of your shooters.',
          'Octarius Mirror 44 is another option. Leave enough Grots alive to keep multiplying, and avoid causing the whole group to flee.',
        ],
        links: [{ label: 'Reddit · Ranged kill setups', href: 'https://www.reddit.com/r/WH40KTacticus/comments/1m6mnz3/' }],
      },
      {
        title: 'Finish the ability damage',
        paragraphs: [
          'Use damaging actives in Arena or Onslaught, or farm Vox-caster reinforcements in Fall of Cadia 40. Keep the Vox-casters alive and leave kills for your ranged attackers.',
          'Players report that Angrax’s passive counts as ability damage, but his kills are melee. Check your progress after a short run; not every passive or Overwatch attack counts as ability damage.',
        ],
        links: [{ label: 'Reddit · Ability damage and Fall of Cadia 40', href: 'https://www.reddit.com/r/WH40KTacticus/comments/1bisbl9/' }],
      },
    ],
  },
};
