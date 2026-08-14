import type { HeroGuide } from "./indomitusGuideContent";
import { getRequiredRecommendationsForCampaign } from "./requiredRecommendations";

const recommendationRows = getRequiredRecommendationsForCampaign("/campaigns/fall-of-cadia-mirror");
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
    callout: "Clear first. Medal later. Complete Normal relatively early, farm its efficient nodes, and return to Elite when the guaranteed drops justify the investment.",
    paragraphs: [
      "Fall of Cadia Mirror becomes available after Kut Skoden, Sibyll Devine, and Thaddeus Noble are unlocked through the original Fall of Cadia campaign. It is a useful early-to-midgame project because Mirror nodes offer efficient, specialized farming.",
      "Push Normal for new nodes even when a stage awards fewer than three medals. Earning all 225 Normal medals unlocks Elite, but forcing expensive promotions solely to reach Elite can be a poor trade for a developing account.",
      "Elite becomes more attractive once the account has a strong shared Imperial support core. Its guaranteed first upgrade copy makes several Astra Militarum and general progression nodes especially valuable. Recommended Investment targets are practical, repeatable goals—not minimum clears that may depend on favorable crits, blocks, enemy movement, or many attempts.",
    ],
  },
  progression: {
    callout: "Required Carry: Thaddeus. Kut screens, Sibyll stays protected, and Isabella is the Best Support whenever supports are permitted.",
    introduction: "Treat the campaign as a progression loop rather than one uninterrupted completion project.",
    steps: [
      "Unlock Kut, Sibyll, and Thaddeus through Fall of Cadia.",
      "Push Normal and open its efficient farming nodes.",
      "Build the Required Carry first: Thaddeus instead of equalizing the required trio.",
      "Use Kut as the forward screen and keep Sibyll protected.",
      "Bring Isabella whenever the deployment rules allow her.",
      "Return for all 225 Normal medals when Elite is the next useful goal.",
      "Strengthen the required trio for Elite 2, 12, 29, and 36.",
      "Add shared-account Imperial supports for the remaining Elite stages.",
    ],
    paragraphs: [
      "The current documented support list is Adepta Sororitas, Adeptus Custodes, Adeptus Mechanicus, Astra Militarum, Black Templars, Blood Angels, Dark Angels, Space Wolves, and Ultramarines. Do not assume every Imperial faction is eligible.",
      "Normal mixes three-, four-, and five-character deployments. Elite 2, 12, 29, and 36 allow only Kut, Sibyll, and Thaddeus, so no support hero can replace investment in the required trio.",
    ],
  },
  normalInvestment: investmentRows.map((row) => ({ characterId: row.characterId, rankId: row.normal.rankId, abilityIconName: row.abilityIconName, active: row.normal.active, passive: row.normal.passive })),
  eliteInvestment: investmentRows.map((row) => ({ characterId: row.characterId, rankId: row.elite.rankId, abilityIconName: row.abilityIconName, active: row.elite.active, passive: row.elite.passive })),
  strategyTips: [
    ["Use a Screened Ranged Wedge", "Put Kut on the forward collision hex, keep Thaddeus one layer behind with clear range-three lines, and place Sibyll on a protected lateral or back hex."],
    ["Build the Required Carry First", "Thaddeus carries. Use Basilisk Barrage for priority targets, protected clusters, and Havoc Suppression. Preserve clear firing lanes and avoid committing him before the Barrage decision is made."],
    ["Keep Sibyll Protected", "Sibyll supplies Psychic damage and lets adjacent allies begin the turn with Infiltrate. She should enable safe movement through Overwatch, not walk into the lane herself."],
    ["Start With the Best Support", "On unrestricted stages, start with Isabella. Position her behind the frontline and adjacent to the heroes most likely to take damage; her healing and resurrection create the safest three-medal margin."],
    ["Solve Havoc Overwatch First", "Suppress Havocs with Thaddeus before moving, cross with an ally that began beside Sibyll, or reposition and bait. Do not force an exposed move through an active lane."],
    ["Keep Bloodletters Off Sibyll", "Bloodletters gain extra pressure into Psykers. Let Kut or another durable frontliner receive the charge while Sibyll remains screened."],
    ["Clear First, Medal Later", "If one hero dies, diagnose the exact failure before promoting everyone. Positioning, defensive gear, Isabella, or one focused Thaddeus upgrade may add the needed margin more efficiently."],
  ] as Array<[string, string]>,
};

export const requiredHeroContent: HeroGuide[] = [
  {
    heading: "Kut Skoden",
    role: "Frontline screen, durable collision point, and backline protector.",
    ...targetsFor("Kut"),
    paragraphs: [
      "Kut's primary contribution is often the attack that Sibyll or Thaddeus never receives. Put him on the forward collision hex, block direct routes into the backline, and let enemies spend their opening pressure on him.",
      "His physical bulk is especially important on restricted stages where Isabella and other supports cannot deploy. Move the best available defensive equipment onto him when the trio is failing to survive an enemy turn.",
      "Do not judge Kut only by damage. Screening, body-blocking, and controlling who the enemy can reach are the foundation of the campaign's safest formation.",
    ],
    callout: "Kut screens: make him the safe answer to the enemy's first contact.",
  },
  {
    heading: "Sibyll Devine",
    role: "Protected Psychic damage, Infiltrate utility, and armored-target pressure.",
    ...targetsFor("Sibyll"),
    paragraphs: [
      "Sibyll's Psychic damage is valuable into Chaos Terminators and other armored enemies, while her adjacency utility can let a key ally begin the turn with Infiltrate and cross a Havoc Overwatch lane safely.",
      "Keep her on a protected lateral or rear hex. Bloodletters gain additional pressure into Psykers, and an underbuilt Sibyll should never be the character used to test an Overwatch lane.",
      "On trio-only stages, preserve her first and use Kut's position to control contact. Her utility matters most when she survives long enough to shape several turns.",
    ],
    callout: "Protect Sibyll instead of trying to make her a tank.",
  },
  {
    heading: "Thaddeus Noble",
    role: "Primary carry, long-range damage, Suppression, and priority-target removal.",
    ...targetsFor("Thad"),
    paragraphs: [
      "Thaddeus is the Required Carry. His range lets him work behind Kut, while Basilisk Barrage can soften or remove a priority target anywhere on the map when he has not moved.",
      "Suppressive Fire makes him the campaign's best answer to Elite Havocs: Barrage the Overwatch threat or its protected cluster before exposing vulnerable allies to the lane.",
      "If damage is the bottleneck, invest in Thaddeus first. On late trio-only stages, a stronger Thaddeus can compensate for more modest Kut and Sibyll investment more effectively than equal promotions across all three.",
    ],
    callout: "Required Carry: Thaddeus. Preserve his firing lanes and invest where the damage bottleneck actually is.",
    featured: true,
  },
];

export const bestSupportingHero: HeroGuide = {
  characterId: "adeptHospitaller",
  heading: "Isabella",
  role: "Best Support, healing, resurrection, and three-medal protection.",
  paragraphs: [
    "Isabella is the clear Best Support for Fall of Cadia Mirror.",
    "Keep her behind the frontline and adjacent to the characters most likely to absorb the enemy turn. Kut's screening and the campaign's compact formation give her passive healing ideal conditions, while her active can rescue a medal by resurrecting a defeated Imperial hero.",
    "She cannot deploy on Elite 2, 12, 29, or 36. Isabella makes the campaign dramatically easier without eliminating the need to build Kut, Sibyll, and Thaddeus.",
  ],
  callout: "Best Support: if Isabella is allowed on the map, start team-building with her.",
  featured: true,
};

export const supportingHeroGroups: Array<{ id: string; title: string; heroes: HeroGuide[] }> = [
  {
    id: "campaign-comrades",
    title: "Campaign Comrades",
    heroes: [
      { characterId: "ultraInceptorSgt", heading: "Bellator", role: "Durable frontline support, multi-hit attacker, and summon engine.", paragraphs: ["Bellator reinforces Kut on the frontline and uses Inceptors to add bodies between Chaos enemies and the backline. Those summons can occupy attack hexes, redirect movement, and absorb a Bloodletter charge or Terminator attack.", "He is also a strong account-wide Imperial investment, so campaign resources spent on him continue paying off elsewhere."], callout: "Use Bellator and his Inceptors to make the battlefield crowded in your favor." },
      { characterId: "templAggressor", heading: "Brother Burchard", role: "Durable frontliner, body-blocker, and close-range area damage.", paragraphs: ["Burchard can reinforce Kut, close lanes into the backline, and punish enemies packed around the frontline with Blast damage.", "Choose him when one anchor is not enough and the map allows a second durable body to form a genuine wall in front of Thaddeus and Sibyll."], callout: "Burchard turns one frontline anchor into two." },
      { characterId: "adeptRetributor", heading: "Vindicta", role: "Accessible area damage and clustered-enemy clearing.", paragraphs: ["Vindicta punishes Traitor Guardsmen and Bloodletters that bunch around Kut. She is especially attractive early because many accounts already have her.", "Plan her Flame hexes carefully: burning terrain can interfere with the compact formation Isabella, Kut, and Sibyll want to maintain."], callout: "Let Kut gather the problem; let Vindicta burn the problem." },
    ],
  },
  {
    id: "elite-heroes",
    title: "Elite Heroes",
    heroes: [
      { characterId: "custoBladeChampion", heading: "Kariyan", role: "High-investment carry and durable frontline support.", paragraphs: ["A heavily developed Kariyan can take dangerous forward positions and compensate for weaker required heroes wherever supports are permitted.", "His best use is bringing an existing high-end investment into Cadia, not starting a campaign-specific build."], callout: "Bring the monster you already built; do not build the monster just for Cadia." },
      { characterId: "ultraCalgar", heading: "Marneus Calgar", role: "Premium frontline wall, area damage, and ally support.", paragraphs: ["Calgar fits beside Kut on the dangerous edge of the formation. Their two durable bodies keep Bloodletters and Terminators away from Sibyll and Thaddeus while Calgar contributes meaningful damage."], callout: "Calgar gives Thaddeus room to shoot by making the frontline exceptionally hard to break." },
      { characterId: "bloodDeathCompany", heading: "Lucien", role: "Mobile damage carry and rapid threat removal.", paragraphs: ["Lucien protects the formation by removing dangerous enemies before they act. His mobility is an aggressive answer to an exposed Havoc or backline threat.", "He does not heal or resurrect the required trio, so his offense must become defense."], callout: "Solve incoming damage by deleting its source." },
      { characterId: "bloodIntercessor", heading: "Mataneo", role: "Mobility, temporary bodies, and enemy-targeting disruption.", paragraphs: ["Mataneo reaches priority targets while his additional bodies block routes and change enemy targeting. A well-placed body can absorb a Bloodletter charge, disrupt a Terminator route, or preserve Isabella's healing formation."], callout: "Mataneo wins space, and space keeps the required trio alive." },
      { characterId: "astraDreir", heading: "Lord Marshal Varnan Dreir", role: "Durable charging frontliner and self-sustaining pressure.", paragraphs: ["Dreir pushes the fight away from vulnerable characters. His charge pressure and self-sustain reduce the number of attacks that reach the Astra Militarum backline.", "He cannot replace Isabella's healing, but he can prevent damage through pressure, positioning, and durability."], callout: "Dreir protects the backline by moving the fight somewhere else." },
    ],
  },
];

export const difficultStageGroups = [
  { id: "difficult-normal-stages", modeId: "normal", title: "Normal", stages: [
    { number: 63, title: "Required-Trio Check", why: "A late required-trio-only deployment exposes weak required heroes and removes Isabella's safety net.", strategy: ["Build the formation around Kut's screen and Thaddeus's firing lane.", "Keep Sibyll out of direct Bloodletter routes.", "Preserve Basilisk Barrage for the enemy that opens the backline.", "Clear first and return for the third medal after focused upgrades."], closing: "This is the Normal reminder that supports make the campaign easier but cannot replace the required trio." },
    { number: 75, title: "Abaddon", why: "The final Normal boss combines Terminator durability, surrounding Chaos pressure, and a full-team survival requirement.", strategy: ["Control the approach before collapsing on Abaddon.", "Keep Thaddeus behind Kut with a clear line to priority threats.", "Use Isabella when permitted to preserve the three-medal margin.", "Avoid leaving Sibyll exposed during the final cleanup."], closing: "Win the formation battle first; the boss is safer once the routes into the backline are closed." },
  ]},
  { id: "difficult-elite-stages", modeId: "elite", title: "Elite", stages: [
    { number: 2, title: "First Trio-Only Test", why: "The first Elite restriction removes Isabella and every other optional support immediately.", strategy: ["Let Kut own the contact hex.", "Keep Thaddeus stationary until the Barrage decision is made.", "Use Sibyll's adjacency utility without exposing her.", "Treat the stage as a formation test, not proof that one low-rank clear defines the minimum investment."], closing: "This stage asks whether the trio functions without Isabella, not whether your support roster is strong." },
    { number: 12, title: "Trio-Only Formation Check", why: "Another support-free map tests the same compact formation at a higher enemy threshold.", strategy: ["Inspect Overwatch lanes before moving.", "Preserve Kut's health by controlling who can contact him.", "Keep Sibyll protected and let Thaddeus solve the damage bottleneck.", "Do not chase a special minimum rank; strengthen the hero who is actually failing."], closing: "Use the trio principles consistently: Kut screens, Thaddeus carries, Sibyll stays protected." },
    { number: 29, title: "Late Trio-Only Gate", why: "The late restriction exposes weak required heroes, and very low-rank clears are too dependent on execution and RNG to define one useful minimum.", strategy: ["Do not plan around Isabella; she cannot deploy.", "Move the best defensive gear to the hero who dies first.", "Use Kut to deny the cleanest route into Thaddeus or Sibyll.", "Treat extremely low-rank clears as proof of possibility, not a practical recommendation."], closing: "Positioning and concentrated investment matter more than equal ranks across the trio." },
    { number: 36, title: "Final Trio-Only Gate", why: "This is the clearest required-trio investment check in the campaign.", strategy: ["Use Silver-range Kut and Sibyll as protected utility while Gold-range Thaddeus supplies the damage.", "Solve Havoc Overwatch before moving a vulnerable hero.", "Restart an opening that creates an unrecoverable backline breach.", "Add durability only where the actual death occurs."], closing: "Build around Thaddeus rather than promoting the trio equally." },
    { number: 39, title: "Penultimate Support Stage", why: "Supports return, but late-Elite damage and positioning still punish a fragile formation.", strategy: ["Start with Isabella when available.", "Add a durable body or mobile threat remover that already serves the wider account.", "Keep the likely casualty adjacent to Isabella.", "Treat optimized low-rank clears as demonstrations, not Recommended Investment targets."], closing: "Isabella adds enormous leverage here, but she still needs a formation that prevents clean one-shots." },
    { number: 40, title: "Abaddon", why: "The final battle combines a durable boss with Elite enemy pressure while every required hero must survive.", strategy: ["Use Kut and a durable support to hold the dangerous edge.", "Let Thaddeus Suppress or remove the highest-priority ranged threat.", "Keep Isabella adjacent to the likely casualty when she is available.", "Collapse on Abaddon only after the backline is safe."], closing: "Gold I across the trio is more than enough with good supports; focused Thaddeus investment can substitute for excess Sibyll investment." },
  ]},
];

export const bossContent = [
  { characterId: "blackTerminator", heading: "Angrax", appearances: ["Normal 15", "Elite 8"], paragraphs: ["Keep Sibyll out of his contact route and let Kut absorb the approach.", "Use ranged pressure from behind the screen and avoid surrounding him with vulnerable heroes."] },
  { characterId: "blackPossession", heading: "Archimatos", appearances: ["Normal 30", "Elite 16"], paragraphs: ["Burst Archimatos before Bloodletter pressure compounds.", "Protect Sibyll from the summons and deny open adjacent hexes when possible."] },
  { characterId: "blackObliterator", heading: "Volk", appearances: ["Normal 45", "Elite 24"], paragraphs: ["Modern Volk is much bulkier than older guides suggest and benefits from Heavy Weapon.", "Thaddeus's range and Suppression are especially useful while Kut controls the frontline."] },
  { characterId: "blackHaarken", heading: "Haarken Worldclaimer", appearances: ["Normal 60", "Elite 32"], paragraphs: ["Screen his mobile approach and avoid offering Sibyll as an easy finishing target.", "Focus damage once he commits so his pressure cannot build through repeated kills."] },
  { characterId: "blackAbaddon", heading: "Abaddon the Despoiler", appearances: ["Normal 75", "Elite 40"], paragraphs: ["Control the surrounding threats and approach lanes before committing to the boss.", "Use Isabella's compact healing formation where permitted and keep Thaddeus firing safely from behind Kut."] },
];
