import type { HeroGuide } from "./indomitusGuideContent";
import { getRequiredRecommendationsForCampaign } from "./requiredRecommendations";

const recommendationRows = getRequiredRecommendationsForCampaign("/campaigns/saim-hann");
const recommendationByName = Object.fromEntries(
  recommendationRows.map((recommendation) => [recommendation.terminusName, recommendation]),
);

const investmentRows = recommendationRows.map((recommendation) => ({
  characterId: recommendation.characterId,
  abilityIconName: recommendation.terminusName,
  normal: recommendation.normal,
  elite: recommendation.elite,
}));

const displayTarget = (target: string | null | undefined) => target || "—";

export const overviewContent = {
  timing: {
    paragraphs: [
      "Saim-Hann Normal is a manageable early-to-mid account campaign; late Saim-Hann Elite is the real investment test. Progress Normal with modest Bronze-to-Silver ranks, open the farms you need, and avoid treating immediate Elite completion as mandatory.",
      "Elite repeatedly restricts deployment to Calandis, Aethana, and Eldryon. Supporting Aeldari help on open stages, but they cannot replace investment in the required trio through the final trio-only gate at Elite 36.",
      "Push when the next Elite material or boss-shard node solves an account bottleneck. If the final chapter asks for upgrades that would produce more value elsewhere, farm the nodes already opened and return later.",
    ],
    callout: "Normal is a manageable single-faction campaign, comparable to Indomitus Mirror or Octarius. Elite is widely recognized as the game’s hardest and most investment-heavy Elite campaign.",
  },
  progression: {
    introduction: "Use Saim-Hann as an account-building route, with Eldryon receiving the highest-value long-term investment.",
    steps: [
      "Unlock Calandis, Aethana, and Eldryon and begin Normal.",
      "Raise the trio evenly enough to survive restricted stages, prioritizing Eldryon and Aethana when investment diverges.",
      "Complete Normal and return for missing medals when Elite becomes the next useful goal.",
      "Enter Elite with a maintained Silver core and collect valuable material and shard nodes.",
      "Use Elite 26, 29, and 36 to test the required trio without support.",
      "At Elite 36, target the practical G2 Eldryon, G2 Aethana, and G1 Calandis benchmark.",
      "Use Maugan Ra, Lhykhis, or Jain Zar only where deployment permits them.",
      "Push Elite 39–40 only when the rewards justify the additional investment.",
    ],
    paragraphs: [
      "Eldryon is the Required Carry in resource-efficiency terms. Psychic damage answers armored Rubric Marines, Doom amplifies the formation, and Eldryon remains valuable well beyond this campaign.",
      "Recommended Investment targets are practical planning goals rather than record-low clears. Equipment, badge levels, positioning, critical hits, blocks, and enemy movement can move the true minimum substantially.",
    ],
    callout: "Required Carry: Eldryon first, Aethana second, then only as much Calandis investment as progression and survival require.",
  },
  normalInvestment: investmentRows.map((row) => ({
    characterId: row.characterId,
    rankId: row.normal.rankId,
    abilityIconName: row.abilityIconName,
    active: displayTarget(row.normal.active),
    passive: displayTarget(row.normal.passive),
  })),
  eliteInvestment: investmentRows.map((row) => ({
    characterId: row.characterId,
    rankId: row.elite.rankId,
    abilityIconName: row.abilityIconName,
    active: displayTarget(row.elite.active),
    passive: displayTarget(row.elite.passive),
  })),
  strategyTips: [
    ["Plan Around the Doom Ring", "Choose the enemy that must die, place it exactly two hexes from Eldryon, then route the remaining attacks into that target. Doom positioning is especially valuable against Rubrics and Scarab Occult Terminators."],
    ["Prepare the Overwatch Lane", "Let enemies cross open ground into Calandis rather than moving her every turn. A stationary Calandis gains Heavy Weapon damage and can protect the approach toward Eldryon or Aethana."],
    ["Match Damage to the Enemy", "Use Eldryon’s Psychic and Aethana’s Piercing damage against Rubric Marines. Save Calandis for softer targets, exposed Guard, Pink Horrors, and enemies she can remove safely from range."],
    ["Do Not Line Up for Screamers", "Screamers can dive through several heroes. Spread diagonally, cover likely landing hexes, and avoid placing the fragile required trio in one straight lane."],
    ["Control Revives and Splits", "Occupy a Scarab Occult Terminator’s time-ghost hex before finishing it when possible. Overkill Pink Horrors to prevent Split, and avoid creating Blue Horrors beside a vulnerable hero during the enemy turn."],
    ["Separate Clears From Medals", "A clear can accept a casualty; three medals cannot. Hide the weakest hero when necessary, open the next node first, and return after rank or equipment upgrades make survival repeatable."],
  ] as Array<[string, string]>,
};

const targetsFor = (terminusName: string) => {
  const recommendation = recommendationByName[terminusName];
  return {
    characterId: recommendation.characterId,
    rankTargets: { normal: recommendation.normal.rankId, elite: recommendation.elite.rankId },
    abilityTargets: {
      iconName: terminusName,
      active: {
        normal: displayTarget(recommendation.normal.active),
        elite: displayTarget(recommendation.elite.active),
      },
      passive: {
        normal: displayTarget(recommendation.normal.passive),
        elite: displayTarget(recommendation.elite.passive),
      },
    },
  };
};

export const requiredHeroContent: HeroGuide[] = [
  {
    heading: "Calandis",
    role: "Range-three sniper, Overwatch lane control, and mobile survivor.",
    ...targetsFor("Calandis"),
    paragraphs: [
      "Calandis controls open lanes with range-three Overwatch and Heavy Weapon damage. Let enemies approach whenever possible; constant movement gives up part of the stationary damage that makes her effective.",
      "Fire and Reposition is best when the extra movement prevents retaliation or preserves a medal. Wireweave Net punishes the first normal melee attacker, but neither ability should become a badge sink solely for this campaign.",
      "Her Energy attack is inefficient into Rubric Marines because of All is Dust. Aim Calandis at softer targets and let Eldryon or Aethana handle armor. Current late-Elite evidence supports keeping Calandis below the other two required heroes when resources are tight.",
    ],
    callout: "Build Calandis to control lanes and survive; do not force her into the anti-armor carry role.",
  },
  {
    heading: "Aethana",
    role: "Mobile flanker, formation support, and critical-hit amplifier.",
    ...targetsFor("Aethana"),
    paragraphs: [
      "Aethana’s movement, Flying, and Deep Strike solve awkward terrain and deployment, while Path of Command strengthens nearby allies. Keep the aura relevant without making Aethana the closest exposed target.",
      "Prioritize Path of Command before Swooping Hawk. The aura improves the formation every turn; the active is most valuable for alignment, reaching a protected enemy, or cleaning up several weakened targets.",
      "Late Elite turns Aethana’s survival into a real constraint. Her mobility should preserve formation and escape routes rather than invite an unsupported charge into the enemy line.",
    ],
    callout: "Use movement to preserve the formation, not to overextend beyond it.",
  },
  {
    heading: "Eldryon",
    role: "Required Carry, Psychic anti-armor damage, and formation-wide amplification.",
    ...targetsFor("Eldy"),
    paragraphs: [
      "Eldryon is the best home for scarce account resources. Psychic damage bypasses the low-pierce problem presented by Rubric Marines, while Doom raises the damage of attacks against enemies exactly two hexes away.",
      "Plan each important turn backward from the Doom target. Place Eldryon first, then choose Calandis, Aethana, or a supporting hero’s attack route. Doom is the clear badge priority; Executioner is secondary campaign burst.",
      "Investment beyond the campaign breakpoint can still be worthwhile because Eldryon has strong account-wide use. Treat those higher levels as an Eldryon investment, not a cost Saim-Hann universally requires.",
    ],
    callout: "Required Carry: prioritize Eldryon’s rank and Doom.",
    featured: true,
  },
];

export const supportingHeroes: HeroGuide[] = [
  {
    characterId: "eldarMauganRa",
    heading: "Best — Maugan Ra",
    role: "Proven late-Elite ranged damage, Overwatch, and multi-hit Doom synergy.",
    paragraphs: [
      "Maugan Ra is the best demonstrated Saim-Hann support. His six-hit range-three attack, Heavy Weapon, and Overwatch combine naturally with Doom and Aethana’s buffs, and current player evidence says he materially eases Elite 37–40.",
      "He cannot participate in trio-only gates such as Elite 36. Use him when he is already owned and developed for the wider account; do not pursue a 500-shard Legendary primarily to solve this campaign.",
    ],
    callout: "Best: the strongest proven offensive support for the final Elite stretch.",
    featured: true,
  },
  {
    characterId: "eldarLhykhis",
    heading: "New — Lhykhis",
    role: "New mobile, high-pierce support with promising but unproven campaign value.",
    paragraphs: [
      "Lhykhis is now available through Crusade Shop. Her movement, multi-hit eligibility, and Molecular damage appear well matched to Saim-Hann’s armored and mobile enemies.",
      "Campaign evidence is still too new to show that she lowers reliable minimum ranks or displaces Maugan Ra. She may become excellent on unrestricted Elite stages, but she cannot change the required-trio floor at Elite 36 and earlier gates.",
    ],
    callout: "New: mechanically promising, but very few players have tried her in Saim-Hann yet.",
  },
  {
    characterId: "eldarJainZar",
    heading: "Last Resort — Jain Zar",
    role: "Mobile defensive disruption, Infiltrate, and Screamer control.",
    paragraphs: [
      "Jain Zar offers defensive utility rather than Maugan Ra’s ranged deletion. Infiltrate crosses Overwatch safely, while Terror’s Lament reduces adjacent enemy damage and melee hit count; players specifically value that control against Screamer dives.",
      "Like Maugan Ra, she is a Legendary support who cannot enter trio-only stages. Use an already-developed Jain Zar when control and survival matter more than raw damage, but do not acquire her for Saim-Hann alone.",
    ],
    callout: "Last Resort: useful control when already built, but not an efficient campaign-specific project.",
  },
];

export const difficultStageGroups = [
  {
    id: "difficult-normal-stages",
    modeId: "normal",
    title: "Normal",
    stages: [
      {
        number: 75,
        title: "Ahriman",
        why: "The Normal finale allows the full Aeldari roster, but Ahriman and the surrounding Thousand Sons still turn a straightforward clear into a required-hero survival test.",
        strategy: [
          "Use the best Aeldari already owned; do not chase a Legendary support for Normal.",
          "Set Calandis’s Overwatch lane before moving Aethana or Eldryon into the threat zone.",
          "Use Eldryon’s Doom ring and Psychic damage to focus armored targets efficiently.",
          "Protect the weakest required hero once the decisive threats are removed.",
        ],
        closing: "Bronze-to-Silver investment should be treated as a planning range, not a universal minimum. Positioning and equipment can matter as much as one additional promotion.",
      },
    ],
  },
  {
    id: "difficult-elite-stages",
    modeId: "elite",
    title: "Elite",
    stages: [
      {
        number: 18,
        title: "Required Trio, Imperial Matchup",
        why: "Elite 18 removes supporting heroes and changes the usual Thousand Sons armor puzzle to an Imperial enemy set.",
        strategy: [
          "Use Calandis’s range more aggressively against the less armor-focused targets.",
          "Keep Aethana and Eldryon behind the opening firing lane.",
          "Treat the stage as an independent test of the required trio’s survival.",
        ],
        closing: "A support-led roster can hide a weak required hero elsewhere; this stage cannot.",
      },
      {
        number: 26,
        title: "Chapter Four Trio Gate",
        why: "Elite 26 is one of the late required-trio checks where optional Aeldari cannot compensate for a fragile core.",
        strategy: [
          "Plan the opening around Doom and a stationary Calandis lane.",
          "Use Aethana’s mobility to maintain aura coverage without becoming the nearest target.",
          "Move the best defensive equipment onto whichever required hero dies first.",
        ],
        closing: "If success requires repeated favorable movement, build toward the recommended core rather than relying on an outlier clear.",
      },
      {
        number: 29,
        title: "Final-Chapter Preparation",
        why: "Elite 29 repeats the trio-only restriction and exposes whether the core is ready for the final campaign page.",
        strategy: [
          "Focus one Doom-marked threat instead of leaving several enemies damaged.",
          "Avoid lining up the trio for Screamer movement and area pressure.",
          "Preserve escape hexes for Aethana and Calandis during cleanup.",
        ],
        closing: "Clearing 29 is a stronger readiness signal than success on an unrestricted stage with a powerful support.",
      },
      {
        number: 36,
        title: "The Required-Core Benchmark",
        why: "Elite 36 is the final required-trio stage. No support can enter, so it establishes the true investment floor for Calandis, Aethana, and Eldryon.",
        strategy: [
          "Use G2 Eldryon, G2 Aethana, and G1 Calandis as a practical current three-medal benchmark—not a guaranteed minimum.",
          "Build the Doom turn first and protect the lowest-rank hero from unnecessary retaliation.",
          "Check equipment and ability priorities before adding another full character rank.",
        ],
        closing: "Once Elite 36 is complete, decide separately whether the rewards in 37–40 justify more core investment or an already-owned support.",
      },
      {
        number: 39,
        title: "Late-Elite Difficulty Spike",
        why: "Current players describe Elite 39 as a major step up even for rosters that three-medaled through 38. Five deployment slots return, but incoming pressure remains severe.",
        strategy: [
          "Bring the strongest support already justified by the account; Maugan Ra is the proven offensive choice.",
          "Use overlapping Doom, aura, and Overwatch coverage instead of splitting damage.",
          "Do not assume a comfortable Elite 38 clear means the roster is ready.",
        ],
        closing: "Replay evidence does not support one exact minimum. Invest only when this node or full completion solves a meaningful account goal.",
      },
      {
        number: 40,
        title: "Ahriman",
        why: "The final boss allows five Aeldari, turning support quality and coordinated burst into the deciding factors after the trio-only campaign gates are finished.",
        strategy: [
          "Set the Doom target and firing lanes before committing the mobile heroes.",
          "Use Maugan Ra if already developed; use Jain Zar for control or Lhykhis cautiously if her current rank and performance justify the slot.",
          "Preserve required-hero survival during cleanup rather than chasing marginal damage.",
        ],
        closing: "Elite 40 is a full-roster problem. It should not be used to justify overbuilding Calandis, Aethana, or Eldryon before they have cleared Elite 36.",
      },
    ],
  },
];

export const bossContent = [
  { characterId: "thousTerminator", heading: "Toth", appearances: ["Normal 15", "Elite 8"], paragraphs: ["Toth introduces the campaign’s Thousand Sons durability and rewards focused damage over scattered attacks.", "Build the Doom target first, keep Calandis on a useful firing lane, and avoid exposing Aethana merely to finish a low-priority enemy."] },
  { characterId: "thousInfernalMaster", heading: "Abraxas", appearances: ["Normal 30", "Elite 16"], paragraphs: ["Abraxas increases pressure through summons and clustered threats. Remove the enemies with immediate access to Eldryon or Aethana before the board becomes crowded.", "Save burst for the turn Abraxas becomes reachable, then focus him through Doom rather than spreading damage across the formation."] },
  { characterId: "thousTzaangor", heading: "Yazaghor", appearances: ["Normal 45", "Elite 24"], paragraphs: ["Yazaghor’s mobility punishes loose positioning and can open unexpected attack lines toward the fragile required heroes.", "Use terrain and Calandis’s Overwatch to control the approach, then keep the formation compact enough for Aethana’s aura without creating a straight Screamer lane."] },
  { characterId: "thousSorcerer", heading: "Thaumachus", appearances: ["Normal 60", "Elite 32"], paragraphs: ["Thaumachus turns protection and target order into the central problem. Do not waste the team’s best attacks into the wrong protected enemy.", "Hold the Doom-focused burst until it can remove a decisive target, and use Aethana’s mobility to reach the correct angle without leaving her exposed."] },
  { characterId: "thousAhriman", heading: "Ahriman", appearances: ["Normal 75", "Elite 40"], paragraphs: ["Ahriman is the full-roster finale. The open deployment slots make an already-developed support valuable, especially during the much harder Elite encounter.", "Coordinate Doom, Path of Command, and the best ranged or control support available. Once the main threats fall, move damaged required heroes out of danger to protect the final medal."] },
];
