import type { HeroGuide } from "./indomitusGuideContent";
import { getRequiredRecommendationsForCampaign } from "./requiredRecommendations";

const recommendationRows = getRequiredRecommendationsForCampaign("/campaigns/fall-of-cadia");
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
      "Fall of Cadia is a medium-high early priority once Angrax, Archimatos, and Haarken are unlocked. It opens Chaos upgrade nodes, the three characters required for Fall of Cadia Mirror, and one of the game’s best mission-farming stages.",
      "Advance through Normal even when a battle awards only one or two medals. Boss nodes for Kut, Sibyll, Thaddeus, Celestine, and Creed are more valuable than forcing every third medal as soon as it becomes available.",
      "Return for all 225 Normal medals when Elite farming becomes the next useful account goal. Test Elite immediately after it unlocks, then stop at an efficient material or shard breakpoint if full completion would demand excessive campaign-only investment.",
    ],
    callout: "Advance first, collect missing medals later, and invest when the next farming node or campaign unlock justifies the cost.",
  },
  progression: {
    introduction: "Use Fall of Cadia as an account-building loop rather than a single uninterrupted project.",
    steps: [
      "Unlock Angrax, Archimatos, and Haarken through normal progression.",
      "Push Normal and open useful Chaos material and boss-shard nodes.",
      "Invest first in Angrax, then Archimatos, then Haarken.",
      "Add Abraxas for offensive summon pressure and Rotbone for medal protection.",
      "Return for all 225 medals when Elite becomes a useful objective.",
      "Attempt Elite immediately and farm the efficient nodes you can reach.",
      "Strengthen the required trio for restricted three-character stages.",
      "Pursue all 120 Elite medals only when the late nodes justify the investment.",
    ],
    paragraphs: [
      "Fall of Cadia 40 is unusually valuable for kill, damage, ability, and Angrax-passive missions because its Vox-Casters can continually call Guardsmen. Avoid killing or frightening away the Vox-Casters when using the stage for farming.",
      "Restricted Elite stages prevent optional carries from replacing investment in the Black Legion trio. Abraxas and Rotbone are the best general open-stage pair, but Angrax, Archimatos, and Haarken still need enough durability to survive on their own.",
    ],
    callout: "The efficient five-character team is Angrax, Archimatos, Haarken, Abraxas, and Rotbone.",
  },
  normalInvestment: investmentRows.map((row) => ({ characterId: row.characterId, rankId: row.normal.rankId, abilityIconName: row.abilityIconName, active: row.normal.active, passive: row.normal.passive })),
  eliteInvestment: investmentRows.map((row) => ({ characterId: row.characterId, rankId: row.elite.rankId, abilityIconName: row.abilityIconName, active: row.elite.active, passive: row.elite.passive })),
  strategyTips: [
    ["Deploy for Survival", "Inspect ranges and elevation before starting. Keep Archimatos outside clean mortar and lascannon attacks, put Angrax on the dangerous approach, and save Haarken’s mobility for a priority backliner."],
    ["Force Heavy Weapons to Move", "Stationary lascannons are most dangerous. Engage them, block their preferred firing hex with a summon, or deny elevation before trading damage with ordinary Guardsmen."],
    ["Summon With a Purpose", "Bloodletters and Screamers should engage a priority target, absorb attacks, block routes, or occupy high ground. Their deaths do not reduce the campaign medal rating."],
    ["Protect the Weak Link", "The AI often prefers an available kill. A tank or summon must block the route, occupy the firing hex, or offer an attractive alternative—not merely stand closer."],
    ["Keep Rotbone Adjacent", "Rotbone’s resurrection requires adjacency when lethal damage is received. Place him beside the hero most likely to die while avoiding clustered area damage and Valkyrie markers."],
    ["Use Haarken After Contact", "Let tanks and summons absorb the opening, then send Haarken to finish a weakened mortar, lascannon, Vox-Caster, or boss. Do not use him as the primary tank."],
    ["Diagnose Before Upgrading", "A one-shot suggests rank or defensive gear; weak summons suggest ability levels; attrition suggests Rotbone or positioning; an unreachable mortar suggests mobility or target-order problems."],
  ] as Array<[string, string]>,
};

export const requiredHeroContent: HeroGuide[] = [
  {
    heading: "Angrax",
    role: "Terminator tank, deep-strike controller, and reaction attacker.",
    ...targetsFor("Angrax"),
    paragraphs: [
      "Angrax is the best long-term investment among the required trio. Terminator Armour blunts the first qualifying attack each turn, while Hateful Assault punishes adjacent enemies that move away and excels beside reinforcement or wave-entry hexes.",
      "Use him to force lascannons to move, occupy dangerous elevation, and draw attacks away from Archimatos. His post-2025 damage improvements make him a real contributor rather than only a shield.",
      "Prioritize rank and defensive equipment. His passive has the strongest long-term badge value, especially for Onslaught, Survival, Legendary Events, and other wave modes.",
    ],
    callout: "Highest required-hero priority: make Angrax the target the enemy wants to attack.",
    featured: true,
  },
  {
    heading: "Archimatos",
    role: "Ranged psyker, summoner, and board-control specialist.",
    ...targetsFor("Archi"),
    paragraphs: [
      "Archimatos’s Bloodletters create damage, absorb attacks, restrict movement, occupy elevation, and engage heavy weapons. His Psychic damage also extends Abraxas summon chains.",
      "Place summons where they change targeting or movement. Low-level Bloodletters can disappear before contributing, so the active is the main campaign badge priority even though Archimatos’s own defensive gear remains essential.",
      "Silver I is a practical Normal target and Gold I is the initial Elite target. Protect him from concentrated mortar and lascannon fire; he remains an attractive AI target despite his rework.",
    ],
    callout: "Best tactical force multiplier: level the active and leave room for useful Bloodletter placements.",
  },
  {
    heading: "Haarken Worldclaimer",
    role: "Mobile melee finisher and kill-based damage snowball.",
    ...targetsFor("Haarken"),
    paragraphs: [
      "Haarken’s mobility lets him reach lascannons, mortars, Vox-Casters, and weakened backliners that the other required heroes cannot. Feed him safe finishing attacks so Head-Claimer can build momentum.",
      "Do not overextend him on turn one. He remains less durable than Angrax and performs poorly when sent alone into full-health Elite enemies.",
      "He is third in required-character investment priority. Build enough rank and defensive equipment to survive restricted stages, then raise him further only when those stages or a broader roster role demand it.",
    ],
    callout: "Keep him safe through the opening exchange, then use his mobility to finish the real threat.",
  },
];

export const primarySupportingHeroes: HeroGuide[] = [
  {
    characterId: "thousInfernalMaster", heading: "Abrax", role: "Premier offensive carry and summon engine.", featured: true,
    paragraphs: ["Abraxas is the strongest offensive support for unrestricted stages. Psychic damage from Archimatos and Abraxas can rapidly fill the field with Screamers that absorb attacks, block routes, and overwhelm priority targets.", "Give his active open adjacent hexes; narrow corridors sharply reduce its ceiling. Silver I–II is useful for Normal, while Gold I–II with an active around 35 or higher is the practical Elite target.", "The investment compounds because Abraxas is required for Saim-Hann Mirror and remains valuable in psychic teams, Tournament Arena, Guild War, and events."],
    callout: "Best unrestricted-stage offensive carry and the first optional hero to build.",
  },
  {
    characterId: "deathRotbone", heading: "Rotbone", role: "Chaos healer, resurrection support, and medal protector.", featured: true,
    paragraphs: ["Rotbone has the greatest effect on three-medal reliability. Keep him adjacent to Archimatos or Haarken when a lethal hit is likely so his passive can revive them.", "Silver I is already useful in Normal. For Elite, Gold I–II with the passive near 35 is an excellent target; health and armor help him remain present to heal and resurrect the team.", "He is also one of the best Chaos investments for Legendary Events, Survival, Onslaught, and Guild War."],
    callout: "Best survival support: convert fragile wins into reliable three-medal clears.",
  },
];

export const otherSupportingHeroes: HeroGuide[] = [
  { characterId: "thousTzaangor", heading: "Yazaghor", role: "Abraxas-combo enabler and psyker repositioner.", paragraphs: ["Yazaghor can switch positions with a friendly psyker and add Psychic damage, expanding Abraxas summon sequences on maps with safe spacing.", "Bronze to Silver investment can enable the combo. Abraxas already works alone, so do not force Yazaghor onto a map where repositioning exposes the required trio."], callout: "A high-ceiling Abraxas partner, not a campaign requirement." },
  { characterId: "thousTerminator", heading: "Toth", role: "Self-sustaining Terminator tank and ranged controller.", paragraphs: ["Toth can absorb the first lascannon attack and add a durable body without relying on summons. Silver I is useful for Normal and Gold I is a sensible Elite target.", "He is required for Saim-Hann Mirror, so campaign investment can serve two progression paths."], callout: "A durable cross-campaign investment when another tank is needed." },
  { characterId: "deathBlightlord", heading: "Maladus", role: "Durable attrition tank with multi-target damage.", paragraphs: ["Maladus is slow but extremely durable, applies Battle Fatigue pressure, and pairs exceptionally well with Rotbone. Silver I is enough for Normal support; Gold I is appropriate for Elite.", "Choose him when raw durability and a stable front line matter more than mobility."], callout: "The accessible attrition choice, especially beside Rotbone." },
  { characterId: "blackObliterator", heading: "Volk", role: "Ranged damage, Suppression, and clustered-enemy clearing.", paragraphs: ["Volk’s 2025 rework substantially improved his health and armor and added Heavy Weapon, making older glass-cannon advice obsolete.", "Use him around Silver I–II in Normal or Gold I in Elite when ranged control is needed, but he remains more situational than Abraxas or Rotbone."], callout: "A legitimate post-rework ranged option when you already value his wider roster role." },
  { characterId: "blackAbaddon", heading: "Abaddon", role: "Terminator tank and Chaos buffer.", paragraphs: ["Abaddon’s rework made him a credible frontliner whose buffs can improve Chaos allies and summon-heavy turns. Silver I–II can help Normal; Gold I is the Elite target when already owned.", "Do not unlock or build him solely for Fall of Cadia, but older advice dismissing him is now outdated."], callout: "Useful after his rework, though still a broader-roster choice rather than a campaign necessity." },
  { characterId: "worldKharn", heading: "Khârn", role: "Premium melee damage carry and priority-target remover.", paragraphs: ["Khârn can delete lascannons, bosses, and clustered threats, but his mechanics demand careful ally positioning and his investment cost is excessive for a beginner campaign project.", "Use an existing Gold-or-higher build when Khârn is already a competitive-roster priority."], callout: "Exceptional damage for an established roster; unnecessary as a campaign-specific build." },
];

export const difficultStageGroups = [
  {
    id: "difficult-normal-stages", modeId: "normal", title: "Normal", stages: [
      { number: 26, title: "Required-Trio Check", why: "Limited supporting slots expose weak required heroes and unstable Battle Fatigue outcomes.", strategy: ["Protect Archimatos from the opening attack.", "Let Angrax absorb the first high-value hit.", "Use Haarken only after a safe finishing target appears.", "Restart when flee behavior produces an unrecoverable opening."], closing: "Bronze clears are challenge minima; consistent progress depends on summon levels, defensive gear, and careful deployment." },
      { number: 45, title: "Thaddeus Noble", why: "Mortar pressure reaches protected backliners while lascannons punish an exposed opening.", strategy: ["Advance or deep strike Angrax toward the central threat.", "Use Bloodletters to absorb fire and engage heavy weapons.", "Send Haarken toward reachable artillery rather than directly at Thaddeus.", "Do not leave a stationary lascannon on elevation."], closing: "Remove the firing lanes before committing to the boss." },
      { number: 60, title: "Celestine", why: "Celestine’s durability and Geminae create misleading burst opportunities.", strategy: ["Control the escorts before committing every active.", "Preserve summons or burst for the decisive Celestine turn.", "Avoid clustering where supporting fire can reach several heroes.", "Keep the weakest required hero outside the easiest kill route."], closing: "Treat Celestine as a sequence, not a single burst target." },
      { number: 61, title: "Mandatory Survival", why: "Premium supports cannot compensate when an underbuilt Haarken or Archimatos is exposed.", strategy: ["Move the best defensive gear to the vulnerable hero.", "Use Angrax to draw the first attack.", "Accept a slower clear rather than exposing Haarken.", "Use summons to block attacks instead of maximizing damage."], closing: "This stage checks the mandatory roster, not the strength of optional supports." },
      { number: 69, title: "Mandatory Survival", why: "Another restricted deployment makes weak required heroes the AI’s easiest targets.", strategy: ["Deploy for safe attack routes rather than opening damage.", "Force heavy weapons to move before exposing Archimatos.", "Preserve Haarken for cleanup.", "Hide damaged heroes during the final turns."], closing: "Survival and target control matter more than finishing quickly." },
      { number: 75, title: "Creed", why: "Vox reinforcements, heavy weapons, and the boss create competing priorities while every hero must survive.", strategy: ["Establish a safe side of the map.", "Remove lascannons and Vox-Casters that threaten the backline.", "Use summons to isolate firing lanes.", "Collapse on Creed only after the crossfire is controlled."], closing: "Do not chase Creed through an active firing lane." },
    ],
  },
  {
    id: "difficult-elite-stages", modeId: "elite", title: "Elite", stages: [
      { number: 26, title: "Required Trio Only", why: "The restriction removes both Rotbone’s healing and Abraxas’s summon carry.", strategy: ["Enter with Gold I Archimatos and Angrax and Haarken near Gold I.", "Use Bloodletters to create the missing fourth and fifth bodies.", "Protect Haarken until a safe finisher opens.", "Restart an opening that exposes Archimatos to lethal fire."], closing: "Optional heroes cannot solve this stage; invest in the required trio and Archimatos’s active." },
      { number: 33, title: "Final-Chapter Stat Check", why: "A final-chapter stat spike combines with another three-character restriction.", strategy: ["Treat Gold I as a challenge baseline, not a guarantee.", "Move the best defensive equipment onto the likely target.", "Use Angrax to deny elevation and firing lanes.", "Restart if the opening mortar or lascannon attack creates an unrecoverable death."], closing: "Gold II Archimatos and Angrax substantially reduce the stage’s variance." },
      { number: 35, title: "Competing Firing Lanes", why: "Dense late-Elite threats often make this one of the final missing-medal stages.", strategy: ["Use Abraxas and Rotbone as the safest general pairing.", "Place Abraxas where several summon hexes remain free.", "Keep Rotbone adjacent to the hero at one-shot risk.", "Without Abraxas, use Maladus or Toth to block approaches while Bloodletters absorb attacks."], closing: "Control both damage and survival; an extra weak support only gives the AI an easier kill." },
      { number: 40, title: "Creed", why: "The final boss combines mortars, lascannons, reinforcements, and intense survival pressure.", strategy: ["Lure or engage the lascannon before committing to Creed.", "Use Haarken to reach mortars after the opening exchange.", "Isolate Creed with summons and a durable frontliner.", "Preserve Rotbone adjacency and keep Archimatos from becoming the easiest target."], closing: "Remove the crossfire, isolate Creed, and finish with the mandatory trio protected." },
    ],
  },
];

export const bossContent = [
  { characterId: "astraBullgryn", heading: "Kut Skoden", appearances: ["Normal 15", "Elite 8"], paragraphs: ["Use summons to block Kut’s approach while the required trio removes his support.", "Do not let a vulnerable hero become the easiest melee target.", "Collapse on Kut only after the dangerous firing lane is controlled."] },
  { characterId: "astraPrimarisPsy", heading: "Sibyll Devine", appearances: ["Normal 30", "Elite 16"], paragraphs: ["Spread enough to limit clustered Psychic damage while keeping Rotbone adjacency when needed.", "Use summons to occupy approach hexes and redirect attacks.", "Remove heavy weapons before committing the required trio to Sibyll."] },
  { characterId: "astraOrdnance", heading: "Thaddeus Noble", appearances: ["Normal 45", "Elite 24"], paragraphs: ["Thaddeus and mortar pressure can reach protected backliners, so deployment matters immediately.", "Engage lascannons with Angrax or summons and send Haarken toward reachable artillery.", "Attack the boss after the long-range threats can no longer remove Archimatos."] },
  { characterId: "adeptCelestine", heading: "Celestine", appearances: ["Normal 60", "Elite 32"], paragraphs: ["Account for the Geminae and Celestine’s survival mechanics before spending every active.", "Preserve summon pressure or burst damage for the decisive boss turn.", "Avoid creating an exposed cluster while controlling her escorts."] },
  { characterId: "astraCreed", heading: "Castellan Creed", appearances: ["Normal 75", "Elite 40"], paragraphs: ["Control lascannons, mortars, and Vox reinforcements before chasing Creed.", "Use summons and a durable frontliner to isolate the boss from the firing line.", "Keep Rotbone beside the likely casualty and protect Archimatos through the final cleanup."] },
];
