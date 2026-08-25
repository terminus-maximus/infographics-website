import type { HeroGuide } from "./indomitusGuideContent";
import { getRequiredRecommendationsForCampaign } from "./requiredRecommendations";

const recommendationRows = getRequiredRecommendationsForCampaign("/campaigns/saim-hann-mirror");
const recommendationByName = Object.fromEntries(
  recommendationRows.map((recommendation) => [recommendation.terminusName, recommendation]),
);

const investmentRows = recommendationRows.map((recommendation) => ({
  characterId: recommendation.characterId,
  abilityIconName: recommendation.terminusName,
  normal: recommendation.normal,
  elite: recommendation.elite,
}));

const targetsFor = (terminusName: string) => {
  const recommendation = recommendationByName[terminusName];
  return {
    characterId: recommendation.characterId,
    rankTargets: { normal: recommendation.normal.rankId, elite: recommendation.elite.rankId },
    abilityTargets: {
      iconName: terminusName,
      active: { normal: recommendation.normal.active, elite: recommendation.elite.active },
      passive: { normal: recommendation.normal.passive, elite: recommendation.elite.passive },
    },
  };
};

export const overviewContent = {
  timing: {
    paragraphs: [
      "Unlock and three-medal Normal in the early-to-mid game once Yazaghor, Abraxas, and Toth are available. Mirror nodes are already efficient farms, so Normal completion has value even if Elite is not yet realistic.",
      "Progress Elite while existing Chaos supports can carry unrestricted stages. Stop when the next required-trio gate demands disproportionate Toth or Yazaghor investment, then return as Abraxas and the wider Chaos roster grow naturally.",
      "Elite becomes most valuable for rare and legendary materials, character shards, and a wider selection of efficient farms. Full completion is a mid-to-late-game efficiency project rather than an urgent early-account requirement.",
    ],
    callout: "Complete Normal for efficient Mirror farming. Push Elite to useful nodes, but do not over-invest until you truly need to progress.",
  },
  progression: {
    introduction: "Treat Saim-Hann Mirror as an Abraxas campaign on restricted stages and a shared Chaos campaign everywhere else.",
    steps: [
      "Unlock Yazaghor, Abraxas, and Toth through Saim-Hann progression.",
      "Build Abraxas first, especially Malefic Maelstrom, then add only enough Toth and Yazaghor durability to preserve medals.",
      "Complete Normal and collect all 225 medals to unlock Elite.",
      "Use Rotbone for survival and Archimatos for psychic summon pressure on unrestricted stages.",
      "Test Elite 1–2, 11, 17, and 28 as required-trio investment checks.",
      "Prepare Abraxas's summon geometry and Yazaghor swap sequence for the final trio-only gate at Elite 38.",
      "After Elite 38, bring the strongest justified Chaos supports to Elite 39–40.",
      "Pursue full completion only when the farming nodes or Maugan Ra shards justify the cost.",
    ],
    paragraphs: [
      "Recommended Investment targets are practical planning goals, not universal minimums. Replay clears vary with ability levels, equipment, summon placement, enemy movement, and exact turn order.",
      "The most efficient cross-campaign core is Abraxas, Archimatos, and Rotbone. Archimatos overlaps directly with Fall of Cadia, while Rotbone protects underbuilt required heroes wherever support slots are open.",
    ],
    callout: "Required Carry: Abraxas. Investment priority: Abraxas first, Toth second, and Yazaghor only as high as restricted-stage survival demands.",
  },
  normalInvestment: investmentRows.map((row) => ({
    characterId: row.characterId,
    rankId: row.normal.rankId,
    abilityIconName: row.abilityIconName,
    active: row.normal.active,
    passive: row.normal.passive,
  })),
  eliteInvestment: investmentRows.map((row) => ({
    characterId: row.characterId,
    rankId: row.elite.rankId,
    abilityIconName: row.abilityIconName,
    active: row.elite.active,
    passive: row.elite.passive,
  })),
  strategyTips: [
    ["Reserve Summon Hexes", "Position Abraxas where several adjacent hexes are open and new Screamers can immediately attack. A crowded starting position can waste most of Malefic Maelstrom's value."],
    ["Sequence Psychic Damage", "Activate Malefic Maelstrom before the turn's useful Psychic attacks. Let Abraxas, Yazaghor, Archimatos, or Ahriman trigger Screamers while the effect remains active."],
    ["Preserve the Yazaghor Swap", "Keep an enemy in Yazaghor's range and do not spend Sorcerous Facade too early. Swapping Abraxas into a second open area can create another cluster of summons in the same turn."],
    ["Let Toth Hold the Line", "Use Toth's durability, Suppressive Fire, and Time Flux to protect Yazaghor and Abraxas. His passive is the important medal-preservation investment when restricted stages become lethal."],
    ["Control Wraithguard", "Suppress Elite Wraithguard with Toth or Volk to remove Overwatch, or engage them with an expendable summon. Avoid lining required heroes up for Wraithcannon splash."],
    ["Remove the Warlock System", "Warlocks improve nearby Aeldari survival and accuracy. Prioritize them when their support is making Guardians or other threats harder to remove."],
    ["Sacrifice the Summons", "Summons are successful when they absorb attacks or block dangerous routes. Keep Rotbone adjacent to the required hero most likely to die on open-deployment stages."],
  ] as Array<[string, string]>,
};

export const requiredHeroContent: HeroGuide[] = [
  {
    heading: "Yazaghor",
    role: "Mobile psychic enabler, Abraxas repositioner, and required-trio survivor.",
    ...targetsFor("Yaz"),
    paragraphs: [
      "Yazaghor's four movement and Flying let him reach the square that unlocks the campaign's signature combo. Sorcerous Facade attacks and then swaps him with a friendly Psyker, allowing Abraxas to continue Malefic Maelstrom from a second cluster of open hexes.",
      "The swap works without heavy ability investment, so Yazaghor is the best candidate for deliberate under-investment. Raise him when a required-trio stage proves that he cannot reach the needed position and survive.",
      "Reality Unbound is secondary for campaign progression. Prioritize defensive equipment and careful post-swap placement before adding badges or an entire rank solely for more damage.",
    ],
    callout: "Keep Yazaghor cheap, mobile, and alive; preserve Sorcerous Facade until it can relocate Abraxas safely.",
  },
  {
    heading: "Abraxas",
    role: "Required Carry, psychic summon engine, and board-control specialist.",
    ...targetsFor("Abrax"),
    paragraphs: [
      "Abraxas is the Required Carry. Malefic Maelstrom creates immediate damage, fills routes with expendable bodies, and turns later Psychic attacks into Screamers while free adjacent hexes remain.",
      "Ability level matters independently of character rank because the active directly controls summon health and damage. Prioritize Malefic Maelstrom and plan the turn around open hexes, available Psychic attacks, and the Yazaghor swap.",
      "Abraxas remains the safest long-term investment of the required trio. His summon engine supports other Chaos teams and game modes, while excess Yazaghor or Toth ranks are more campaign-specific.",
    ],
    callout: "Required Carry: fund his Abilities heavily and treat open adjacent hexes as a limited resource.",
    featured: true,
  },
  {
    heading: "Toth",
    role: "Terminator tank, ranged suppressor, and self-reviving survival piece.",
    ...targetsFor("Toth"),
    paragraphs: [
      "Toth is the trio's natural front line. Terminator Armour blunts an opening hit, Suppressive Fire helps control Wraithguard Overwatch, and Time Flux can heal or revive him from his time ghost.",
      "Use Hellfyre Missile Rack after Psychic damage has marked useful targets. For low-investment medal clears, however, Time Flux and defensive equipment matter more because Toth's job is to survive while Abraxas and the summons clear the map.",
      "Raise Toth when restricted stages outgrow his durability. On unrestricted stages, Rotbone, summons, and stronger Chaos frontliners can reduce the need for campaign-only investment.",
    ],
    callout: "Build Toth as the immovable survival piece that keeps pressure away from Yazaghor and Abraxas.",
  },
];

export const bestSupportingHero: HeroGuide = {
  characterId: "deathRotbone",
  heading: "Rotbone",
  role: "Best — Chaos healer, adjacent reviver, and three-medal protector.",
  paragraphs: [
    "Rotbone is the best overall support when the objective is three medals. His healing and adjacent revive directly protect an underbuilt required hero after summons and positioning are no longer enough.",
    "Keep him beside Yazaghor or Abraxas when lethal damage is likely, while avoiding a formation that gives Guardians, Harlequins, or Wraithguard efficient multi-target attacks.",
    "He cannot enter trio-only stages, including Elite 38. Build him for unrestricted-stage reliability and his wider value in Fall of Cadia, events, Onslaught, and Guild War.",
  ],
  callout: "Best: bring Rotbone when survival and the third medal are the problem.",
  featured: true,
};

export const alsoGoodSupportingHero: HeroGuide = {
  characterId: "blackPossession",
  heading: "Archimatos",
  role: "Also Good —accessible Psyker, summon support, and Fall of Cadia crossover.",
  paragraphs: [
    "Archimatos is the most efficient offensive support for many accounts. His Psychic attacks can feed Malefic Maelstrom, while Bloodletters add damage, block routes, and draw attacks away from the required trio.",
    "Sequence his Psychic attack while Abraxas's active is live, and place Bloodletters where they preserve useful summon hexes rather than crowding the second Abraxas position.",
    "Because Archimatos is required for Fall of Cadia, every useful campaign rank advances two Chaos campaigns. That makes him a better dedicated project than a luxury Legendary support.",
  ],
  callout: "Psychic Friend: the strongest accessible offensive crossover and Abraxas summon partner.",
  featured: true,
};

export const otherSupportingHeroes: HeroGuide[] = [
  {
    characterId: "blackTerminator", heading: "Angrax", role: "Durable Fall of Cadia crossover and route-blocking tank.",
    paragraphs: ["Angrax supplies the raw durability that the required trio lacks. Deep Strike, Terminator Armour, and his reaction attacks let him occupy a dangerous approach while Abraxas prepares the summon turn.", "He is mandatory for Fall of Cadia, so use an existing build whenever a map needs another frontliner. He protects less directly than Rotbone and contributes less to the psychic engine than Archimatos."],
    callout: "A high-efficiency crossover tank when the map needs a durable body.",
  },
  {
    characterId: "blackObliterator", heading: "Volk", role: "Ranged control, Suppressive Fire, and Wraithguard counter.",
    paragraphs: ["Volk's reworked durability, range-three attack, Heavy Weapon, and Suppressive Fire make older glass-cannon advice obsolete. Suppression removes Overwatch, giving him a specific job against Elite Wraithguard.", "Use him when ranged control is the failure point and he already fits the wider roster. Rotbone and Archimatos remain the more general campaign choices."],
    callout: "The specialist ranged-control option for Wraithguard-heavy Elite maps.",
  },
  {
    characterId: "thousAhriman", heading: "Ahriman", role: "Luxury psychic damage and Psychic/Flame amplification.",
    paragraphs: ["Ahriman has excellent direct synergy with Abraxas: he supplies Psychic attacks, mobile damage, and amplification for Psychic and Flame-heavy turns.", "His Legendary acquisition and investment cost make him a luxury solution. Use an already-developed Ahriman, but do not build him solely to replace the accessible Archimatos option."],
    callout: "Powerful psychic synergy for an established roster, not an efficiency-first unlock.",
  },
  {
    characterId: "worldKharn", heading: "Khârn", role: "Premium melee damage and priority-target deletion.",
    paragraphs: ["Khârn can remove dangerous Aeldari quickly on unrestricted stages, but he does not heal, shield, summon, or add Psychic triggers to the Abraxas engine.", "Bring an existing high-rank Khârn when raw damage solves the map. Campaign progress alone does not justify his cost, and he cannot help at Elite 38."],
    callout: "Exceptional damage when already built; unnecessary as a campaign-specific investment.",
  },
];

export const difficultStageGroups = [
  {
    id: "difficult-normal-stages", modeId: "normal", title: "Normal", stages: [
      { number: 67, title: "Final Required-Trio Gate", why: "The last Normal trio-only restriction removes Rotbone and Archimatos, exposing any required hero that has been carried through open stages.", strategy: ["Open enough hexes for Abraxas before using Malefic Maelstrom.", "Preserve an enemy in Yazaghor's range for Sorcerous Facade.", "Use Toth to cover the most dangerous approach.", "Hide the weakest required hero once summons control the board."], closing: "Use this stage—not a support-carried boss fight—to judge whether the Normal trio is durable enough." },
      { number: 75, title: "Maugan Ra", why: "The Normal finale restores support slots, but the boss and surrounding Aeldari can still remove an exposed required hero and cost the final medal.", strategy: ["Bring Rotbone for survival or Archimatos for offensive summon pressure.", "Remove Warlock support before committing to Maugan Ra.", "Use summons to absorb attacks and restrict Battle Focus movement.", "Protect the lowest-rank required hero during cleanup."], closing: "Complete Normal for Maugan Ra shard access and the efficient Mirror farming map; do not overbuild the trio for this open-deployment fight." },
    ],
  },
  {
    id: "difficult-elite-stages", modeId: "elite", title: "Elite", stages: [
      { number: 11, title: "Required Trio Returns", why: "Support slots disappear after early Elite stages have encouraged reliance on the wider Chaos roster.", strategy: ["Recheck equipment on Yazaghor and Toth before adding a full rank.", "Build the turn around Abraxas's open summon hexes.", "Let Toth absorb the first qualifying attack.", "Preserve Sorcerous Facade until it creates a safer second summon position."], closing: "This is the first reminder that optional Chaos heroes cannot set the final investment floor." },
      { number: 17, title: "Mid-Elite Trio Check", why: "A second restricted wall tests whether Abraxas's summon quality and the other two heroes' survival have kept pace with Elite damage.", strategy: ["Use one Doom-style focus target rather than spreading Psychic damage without purpose.", "Keep Yazaghor out of the easiest direct attack route after the swap.", "Use Toth's suppression on an Overwatch threat when available.", "Treat every enemy attack redirected into a summon as successful medal protection."], closing: "Raise Abraxas first; add Toth or Yazaghor investment only when survival is the actual failure." },
      { number: 28, title: "Late Required-Trio Wall", why: "Elite 28 is the last restricted checkpoint before the final chapter and exposes support-heavy rosters that have postponed the required trio.", strategy: ["Enter with strong defensive equipment on the hero the AI targets first.", "Do not crowd Abraxas before Malefic Maelstrom.", "Save Yazaghor's swap until the second position has useful adjacent spaces.", "Avoid lining heroes up for Wraithcannon splash."], closing: "Clearing 28 is a better readiness signal for Elite 38 than success on an unrestricted stage." },
      { number: 38, title: "The Required-Core Benchmark", why: "Elite 38 allows only Yazaghor, Abraxas, and Toth. Rotbone, Archimatos, Volk, and every other modern support shortcut disappear against a seven-enemy fight.", strategy: ["Maximize usable adjacent hexes before activating Malefic Maelstrom.", "Keep an enemy in Yazaghor's range so Sorcerous Facade remains available.", "Use the swap to move Abraxas into a second open summon cluster.", "Let Toth cover the line most dangerous to Yazaghor and suppress Overwatch where possible.", "Avoid exposing the trio in lines that amplify Wraithcannon damage."], closing: "No exact universal active-level breakpoint is proven. Higher Malefic Maelstrom levels steadily improve summon survival and damage; execution and equipment still matter." },
      { number: 40, title: "Maugan Ra", why: "Support slots return for the final boss, turning the finale back into a broader Chaos roster test after Elite 38 established the required-trio floor.", strategy: ["Bring Rotbone for medal reliability and Archimatos when additional psychic summons solve the opening.", "Use Volk if Wraithguard Overwatch is the central problem.", "Focus the Warlock-supported threat system before collapsing on Maugan Ra.", "Move damaged required heroes out of danger during cleanup."], closing: "Elite 40 justifies broader account investments; it should not be used to overstate what Toth or Yazaghor needed at Elite 38." },
    ],
  },
];

export const bossContent = [
  { characterId: "eldarRanger", heading: "Calandis", appearances: ["Normal 15", "Elite 8"], paragraphs: ["Control Calandis's long firing lane with summons and terrain before exposing Yazaghor.", "Use Toth to absorb the dangerous opening and collapse once her escape space is restricted."] },
  { characterId: "eldarAutarch", heading: "Aethana", appearances: ["Normal 30", "Elite 16"], paragraphs: ["Aethana's mobility can reach fragile required heroes and strengthen nearby Aeldari.", "Screen her approach with summons and avoid swapping Yazaghor into an unsupported kill route."] },
  { characterId: "eldarFarseer", heading: "Eldryon", appearances: ["Normal 45", "Elite 24"], paragraphs: ["Eldryon's Psychic damage and amplification reward removing nearby attackers before they can focus a required hero.", "Use summon bodies to disrupt the formation, then commit to Eldryon once the most dangerous attack lanes are controlled."] },
  { characterId: "eldarJainZar", heading: "Jain Zar", appearances: ["Normal 60", "Elite 32"], paragraphs: ["Jain Zar crosses Overwatch safely and punishes exposed clusters at close range.", "Spread the required heroes, screen her with summons, and use Rotbone adjacency when support slots are available."] },
  { characterId: "eldarMauganRa", heading: "Maugan Ra", appearances: ["Normal 75", "Elite 40"], paragraphs: ["Maugan Ra is an open-deployment boss, so use the strongest justified Chaos support roster rather than adding unnecessary required-hero ranks.", "Control Wraithguard and Warlock support first, then focus the boss while damaged required heroes withdraw from the easiest firing lanes."] },
];
