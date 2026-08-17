import type { HeroGuide } from "./indomitusGuideContent";
import { getRequiredRecommendationsForCampaign } from "./requiredRecommendations";

const recommendationRows = getRequiredRecommendationsForCampaign("/campaigns/octarius-mirror");
const recommendationByName = Object.fromEntries(recommendationRows.map((recommendation) => [recommendation.terminusName, recommendation]));
const investmentRows = recommendationRows.map((recommendation) => ({ characterId: recommendation.characterId, abilityIconName: recommendation.terminusName, normal: recommendation.normal, elite: recommendation.elite }));
const targetsFor = (terminusName: string) => {
  const recommendation = recommendationByName[terminusName];
  return {
    characterId: recommendation.characterId,
    rankTargets: { normal: recommendation.normal.rankId, elite: recommendation.elite.rankId },
    abilityTargets: { iconName: terminusName, active: { normal: recommendation.normal.active, elite: recommendation.elite.active }, passive: { normal: recommendation.normal.passive, elite: recommendation.elite.passive } },
  };
};

export const overviewContent = {
  timing: {
    callout: "Clear first. Medal later. Build Burchard first, open useful farming nodes, and let reusable Imperial supports carry as much of Elite as possible.",
    paragraphs: [
      "Octarius Mirror unlocks after Sword Brother Godswyl, Brother Burchard, and Ancient Thoread are obtained. Normal remains comparatively approachable, but several trio-only stages prevent supports from replacing investment in the required Black Templars entirely.",
      "Push Normal for new nodes even when a stage awards fewer than three medals. All 225 Normal medals unlock Elite, but forcing promotions only to perfect a stage is often less efficient than returning after broader account upgrades.",
      "Every Elite battle allows five heroes, so Elite is a flexible account-roster test rather than a required-trio-only campaign. Recommended Investment targets are practical planning goals—not record-low clears that may depend on a Diamond carry, perfect enemy movement, or repeated attempts.",
    ],
  },
  progression: {
    callout: "Required Carry: Burchard. Best Support: Isabella. Pair the trio with a reusable Imperial carry and survival specialist throughout Elite.",
    introduction: "Treat the campaign as a progression loop rather than one uninterrupted completion project.",
    steps: [
      "Unlock Godswyl, Burchard, and Thoread to open Octarius Mirror.",
      "Push Normal and open its efficient farming nodes.",
      "Build Burchard first; raise Godswyl second and Thoread only as survival requires.",
      "Use Bellator, Thaddeus, or Vindicta when Normal deployment allows support.",
      "Bring Isabella whenever she is available and survival is the bottleneck.",
      "Return for all 225 Normal medals when Elite is the next useful goal.",
      "Enter Elite with the Normal-ready trio and the strongest eligible Imperials already on the account.",
      "Upgrade the hero that actual attempts identify as the bottleneck instead of leveling the trio evenly.",
    ],
    paragraphs: [
      "Eligible support factions are Adepta Sororitas, Adeptus Custodes, Adeptus Mechanicus, Astra Militarum, Black Templars, Blood Angels, Dark Angels, Space Wolves, and Ultramarines. Use the campaign's eligible Imperial factions rather than assuming every Imperial release is allowed.",
      "Normal 20–21, 37, 56, and 63 are notable required-trio checks. Elite currently permits five heroes on every stage, creating two support slots throughout the entire mode.",
    ],
  },
  normalInvestment: investmentRows.map((row) => ({ characterId: row.characterId, rankId: row.normal.rankId, abilityIconName: row.abilityIconName, active: row.normal.active, passive: row.normal.passive })),
  eliteInvestment: investmentRows.map((row) => ({ characterId: row.characterId, rankId: row.elite.rankId, abilityIconName: row.abilityIconName, active: row.elite.active, passive: row.elite.passive })),
  strategyTips: [
    ["Build Burchard First", "Burchard is the Required Carry. Use his Gravis durability to anchor the dangerous lane and his repeated area damage to thin packed Orks, Grots, and Tyranids."],
    ["Use Godswyl for Control", "Godswyl's stun and push can remove a dangerous enemy from Thoread's route, change board geometry, and buy an entire round against one priority target."],
    ["Keep Thoread Central and Protected", "Thoread supports nearby allies. Keep him close enough to contribute without making him the easiest target, and raise his survivability only when he is the unit costing medals."],
    ["Start With Isabella", "On open stages, Isabella is the best survival and three-medal support. Keep Burchard and the likely casualty adjacent to her while avoiding unnecessary area-damage exposure."],
    ["Add a Carry, Not Just Power", "Use Bellator for durable summons, Thaddeus for ranged priority removal, or Vindicta for dense low-health packs. Choose the hero that solves the stage's actual weakness."],
    ["Let Summons Take the Hit", "Summoned units can occupy approach hexes and absorb attacks without costing campaign medals. Delay a summon when waiting produces more bodies or better lane control."],
    ["Diagnose Failed Medals", "If a required hero is one-shot, improve that hero's gear or rank. If damage is short, strengthen the carry. If attrition wins, improve healing and positioning before promoting everyone."],
  ] as Array<[string, string]>,
};

export const requiredHeroContent: HeroGuide[] = [
  {
    heading: "Sword Brother Godswyl", role: "Melee damage, stun and push control, and permanent armor reduction.", ...targetsFor("Godswyl"),
    paragraphs: ["Godswyl is the trio's mobile single-target specialist. Thunderous Assault pushes and stuns a dangerous enemy, then advances him into the vacated space when possible.", "Champion of the Feast adds Power damage after movement and permanently reduces armor, making Godswyl an excellent opener for Burchard or an external Imperial carry.", "His main risk is exposure. Use the stun to protect Thoread or break a dangerous lane, and prioritize defensive equipment when he is dying after committing to melee."],
    callout: "Godswyl controls the most dangerous target; use his movement to reshape the fight, not merely chase damage.",
  },
  {
    heading: "Brother Burchard", role: "Required Carry, durable frontline anchor, area damage, and Suppression.", ...targetsFor("Burchard"),
    paragraphs: ["Burchard is the safest Required Hero to over-invest in. Mk X Gravis, melee and ranged attacks, area damage, Suppressive Fire, Fragstorm, and Boltstorm let him absorb pressure while clearing dense enemy packs.", "Place him on or beside the first safe engagement hex and let clustered enemies enter his short-range splash geometry. His job is to keep pressure away from Godswyl and Thoread while contributing every turn.", "Prioritize Boltstorm for repeatable value, then Fragstorm as resources permit. Give him the strongest practical defensive item when campaign survival is the deciding factor."],
    callout: "Required Carry: Burchard. Build his durability and repeatable area damage first.", featured: true,
  },
  {
    heading: "Ancient Thoread", role: "Protected defensive support and melee force multiplier.", ...targetsFor("Thoread"),
    paragraphs: ["Thoread is a support fighter rather than the natural carry. Unbreakable Duty reduces damage for him and nearby allies, while Astartes Banner adds a melee hit to nearby friendly units.", "Keep him central enough to support Burchard and Godswyl but off the obvious enemy route. Sending him to an isolated target gives up much of his value and makes a lost medal more likely.", "He is the clearest required hero to hold near minimum viable survivability. Invest further when trio-only Normal stages or actual Elite attempts show that he is the limiting factor."],
    callout: "Build Thoread to survive and amplify the team—not to become the primary damage dealer.",
  },
];

export const bestSupportingHero: HeroGuide = {
  characterId: "adeptHospitaller", heading: "Isabella", role: "Best Support, healing, resurrection, and three-medal protection.",
  paragraphs: ["Isabella is the clear Best Support for Octarius Mirror when owned.", "Keep Burchard and the required hero most likely to take damage adjacent to her. Her passive sustains adjacent non-Mechanical allies, while her active can heal the formation and resurrect a defeated Imperial hero to rescue a three-medal attempt.", "She cannot prevent an initial lethal hit, so a required hero still needs enough rank and equipment to survive contact. Every Elite stage allows her, making the Isabella formation especially valuable throughout the mode."],
  callout: "Best Support: start with Isabella when survival or three medals are the problem.", featured: true,
};

export const supportingHeroGroups: Array<{ id: string; title: string; heroes: HeroGuide[] }> = [
  {
    id: "campaign-comrades", title: "Campaign Comrades", heroes: [
      { characterId: "ultraInceptorSgt", heading: "Bellator", role: "Accessible Imperial carry, durable frontline support, and summon engine.", paragraphs: ["Bellator is the best broadly accessible external carry. He is already a core Indomitus investment, and his Inceptors add bodies, block routes, absorb attacks, and pressure enemy packs without risking campaign medals.", "He complements Isabella rather than competing with her: Bellator supplies action economy and a second durable anchor while Isabella protects the deployed roster."], callout: "Bellator is the account-efficient carry: bring the investment you already need for Indomitus." },
      { characterId: "astraOrdnance", heading: "Thaddeus Noble", role: "Long-range priority removal, area pressure, and Suppression.", paragraphs: ["Thaddeus gives the melee-heavy Black Templars safe ranged reach. Use Basilisk Barrage or his long-range attack to remove Grot Tanks, Termagants, Warriors, or another target that threatens the protected formation.", "He is especially useful when the stage punishes forward movement or when Burchard needs help solving damage before the enemy reaches the line."], callout: "Let the Templars hold space while Thaddeus removes the threat that space cannot contain." },
      { characterId: "adeptRetributor", heading: "Vindicta", role: "Accessible area damage and dense-pack clearing.", paragraphs: ["Vindicta is an inexpensive answer to Grots, Ork Boyz, Hormagaunts, and other enemies that arrive in clusters. Many accounts already have her, so the investment can pay off early.", "Plan Flame hexes around Godswyl and Thoread. Burning terrain can block the compact movement and adjacency that the required trio and Isabella formation need."], callout: "Burn the crowd without burning the formation's escape route." },
    ],
  },
  {
    id: "elite-heroes", title: "Elite Heroes", heroes: [
      { characterId: "custoBladeChampion", heading: "Kariyan", role: "High-investment carry and durable frontline support.", paragraphs: ["A heavily developed Kariyan can hold a dangerous edge, remove priority targets, and compensate for lower required-hero investment throughout Elite.", "His best use is bringing an existing high-end account investment into Octarius Mirror, not starting a campaign-specific build."], callout: "Bring the monster you already built; do not build the monster only for Octarius Mirror." },
      { characterId: "ultraCalgar", heading: "Marneus Calgar", role: "Premium frontline wall, area damage, and ally support.", paragraphs: ["Calgar gives Burchard a second durable body and helps protect Thoread from fast Ork or Tyranid pressure while contributing meaningful area damage.", "He is especially comfortable in an Isabella formation, but should be treated as an established-account option rather than a beginner expectation."], callout: "Calgar makes the frontline exceptionally hard to break while the required trio works safely." },
      { characterId: "bloodDeathCompany", heading: "Lucien", role: "Mobile damage carry and rapid threat removal.", paragraphs: ["Lucien can protect the formation by deleting a dangerous ranged unit, Tyranid Warrior, or exposed boss support before it acts.", "He does not heal or resurrect the required trio, so his offense must prevent more damage than a survival support would restore."], callout: "Solve incoming damage by deleting its source." },
      { characterId: "bloodIntercessor", heading: "Mataneo", role: "Mobility, temporary bodies, and enemy-targeting disruption.", paragraphs: ["Mataneo reaches priority targets while his additional bodies block routes and change enemy targeting. Those bodies are especially useful against dense melee packs and do not cost campaign medals when defeated.", "Use his mobility to preserve the Burchard–Isabella core rather than pulling the formation apart."], callout: "Mataneo wins space, and space keeps Thoread alive." },
      { characterId: "astraDreir", heading: "Lord Marshal Varnan Dreir", role: "Durable charging frontliner and self-sustaining pressure.", paragraphs: ["Dreir moves the fight away from vulnerable required heroes. His charge pressure and self-sustain can contain a dangerous lane or force enemies to turn away from the compact formation.", "He does not replace Isabella's healing, but he can prevent damage through pressure, positioning, and durability."], callout: "Dreir protects the trio by moving the fight somewhere else." },
    ],
  },
];

export const difficultStageGroups = [
  { id: "difficult-normal-stages", modeId: "normal", title: "Normal", stages: [
    { number: 63, title: "Late Required-Trio Check", why: "A very late trio-only deployment removes every Imperial support and exposes weak required heroes before the final run.", strategy: ["Put Burchard on the safest exposed engagement hex.", "Use Godswyl's stun and push to keep the most dangerous target away from Thoread.", "Keep Thoread central but off the obvious attack route.", "Move the best defensive equipment to the hero who is actually dying."], closing: "This is the reminder that supports lower investment but cannot replace the required trio everywhere in Normal." },
    { number: 75, title: "Boss Gulgortz", why: "The final Normal boss uses a substantially stronger modern kit than the version shown in many older completion videos.", strategy: ["Control surrounding Ork pressure before committing to the boss.", "Use Burchard and a durable support to hold the dangerous edge.", "Keep Isabella adjacent to the likely casualty when available.", "Save Godswyl's stun for the turn it prevents lethal pressure rather than spending it for marginal damage."], closing: "Treat old videos as map references, not current damage or survival thresholds." },
  ]},
  { id: "difficult-elite-stages", modeId: "elite", title: "Elite", stages: [
    { number: 24, title: "Snotflogga", why: "Summons and board saturation can overwhelm underbuilt required heroes even with two support slots.", strategy: ["Bring area damage or crowd control.", "Use summons to contest approach hexes before enemy bodies fill them.", "Keep Thoread inside the protected core.", "Clear dangerous accumulations before focusing entirely on the boss."], closing: "Control the board first; Burchard's repeatable area damage is more valuable than scattered single-target attacks." },
    { number: 30, title: "Tyranid Swarm", why: "A dense twelve-enemy Tyranid wave rewards sustained area damage, durable chokepoints, and healing.", strategy: ["Funnel melee bodies into Burchard.", "Use Bellator summons to create artificial chokepoints.", "Burst Tyranid Warriors before cleaning up weaker gaunts.", "Avoid splitting the Isabella formation across multiple lanes."], closing: "Enemy count is the pressure: make each action remove or delay more than one threat." },
    { number: 32, title: "Tanksmasha", why: "Fast melee pressure can bypass a loose frontline and remove the weakest required hero.", strategy: ["Keep Thoread off the obvious engagement lane.", "Use Godswyl's stun and push to buy a full round when possible.", "Focus the boss only after the backline is protected.", "Use Isabella or another survival support to preserve the medal margin."], closing: "Control the boss's first contact; do not let speed decide the target for you." },
    { number: 39, title: "Late Tyranid Survival Check", why: "Late-Elite Tyranid pressure makes formation integrity and three-medal survival more important than speed.", strategy: ["Bring the strongest reusable Imperial carry already on the account.", "Keep a healer or survival support beside the likely casualty.", "Use area damage and summons to prevent surrounds.", "Raise only the required hero who actual attempts show is failing."], closing: "Do not pre-build the trio evenly; let the failed attempt identify the next upgrade." },
    { number: 40, title: "Boss Gulgortz", why: "Modern Gulgortz combines a durable boss profile with WAAAGH-era Ork Boy pressure and late-Elite damage.", strategy: ["Bring the strongest carry plus Isabella or another survival specialist.", "Control the summoned and surrounding Orks before they open the formation.", "Let Burchard anchor the dangerous lane while Thoread stays protected.", "Collapse on Gulgortz only when the required trio can survive the cleanup."], closing: "A pre-rework OME 40 clear does not define a 2026 minimum; build for the current fight and your own support roster." },
  ]},
];

export const bossContent = [
  { characterId: "orksKillaKan", heading: "Snappawrecka", appearances: ["Normal 15", "Elite 8"], paragraphs: ["Modern Snappawrecka is tougher and more dangerous than the early version found in old videos.", "Use Burchard to absorb pressure and focus him before his damage compounds across the formation."] },
  { characterId: "orksBigMek", heading: "Gibbascrapz", appearances: ["Normal 30", "Elite 16"], paragraphs: ["His summon-oriented fight rewards board management and decisive target priority.", "Do not spend so long on peripheral bodies that additional units take over the deployment space."] },
  { characterId: "orksRuntherd", heading: "Snotflogga", appearances: ["Normal 45", "Elite 24"], paragraphs: ["Expect summon and board-saturation pressure.", "Burchard's area damage and Bellator's disposable summons provide more safety than forcing extra investment into Thoread."] },
  { characterId: "orksNob", heading: "Tanksmasha", appearances: ["Normal 60", "Elite 32"], paragraphs: ["Keep the weakest required hero off his obvious engagement lane.", "Use Godswyl's stun and push when it buys a round of safety rather than merely adding damage."] },
  { characterId: "orksWarboss", heading: "Boss Gulgortz", appearances: ["Normal 75", "Elite 40"], paragraphs: ["His modern kit is materially stronger than the boss shown in pre-2024 campaign videos.", "Control WAAAGH-era Ork Boy pressure, protect the required trio, and commit to the boss only after the formation is stable."] },
];
