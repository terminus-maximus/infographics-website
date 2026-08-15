import type { HeroGuide } from "./indomitusGuideContent";
import { getRequiredRecommendationsForCampaign } from "./requiredRecommendations";

const recommendationRows = getRequiredRecommendationsForCampaign("/campaigns/octarius");
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
      "Octarius is a medium-priority campaign overall, but it becomes high priority when its Black Templar shard farms or upgrade nodes solve a current account bottleneck. Push Normal while inexpensive Ork upgrades keep opening useful stages, then pause when the next milestone demands several ranks without an immediate payoff.",
      "Do not let Octarius's old reputation dictate current investment. Boss Gulgortz, Snotflogga, Snappawrecka, and Gibbascrapz have all changed substantially since the oldest guides and completion videos were published.",
      "All 225 Normal medals unlock Octarius Elite. Make that medal cleanup when Elite nodes are useful to your account, then progress only as far as the next farming unlock justifies the cost.",
    ],
    callout: "Push for useful farms. Pause when Ork upgrades become expensive. Return when Elite solves a real account bottleneck.",
  },
  progression: {
    introduction: "Build Octarius around one Required Carry, two survival-focused Required Heroes, and Snotflogga whenever deployment allows him.",
    steps: [
      "Build Boss Gulgortz first as the Required Carry.",
      "Keep Gibbascrapz close enough to repair and protect the formation.",
      "Raise Snappawrecka only as much as survival and specific damage checks require.",
      "Unlock Snotflogga and use him as the default fourth or fifth Ork.",
      "Open Black Templar shard farms and useful Normal material nodes.",
      "Return for all 225 medals when Octarius Elite is the next valuable goal.",
      "Test Elite immediately, prioritizing efficient material and boss-shard nodes.",
      "Escalate Boss and Snot before spreading resources evenly across all five Orks.",
    ],
    paragraphs: [
      "Boss Gulgortz, Gibbascrapz, and Snappawrecka are mandatory. Snotflogga and Tanksmasha are the only supporting Ork characters, and several Normal and Elite stages restrict deployment to the required trio or four heroes.",
      "Current evidence supports concentrated investment rather than a flat roster. Boss does the killing, Gibba creates the bunker, Snot creates expendable targets, and Snappa shoots from behind them.",
    ],
    callout: "Required Carry: Boss Gulgortz. Best Support: Snotflogga. Keep Gibba and Snappa alive rather than leveling every Ork evenly.",
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
    ["Build Boss First", "Boss Gulgortz is the Required Carry. Give him the strongest defensive equipment, level WAAAGH! first, and use his durability, summons, mobility, and follow-up damage to protect the weaker compulsory Orks."],
    ["Plan WAAAGH! Before Moving", "Boss cannot use WAAAGH! after he has moved. Set up the charge one turn ahead, keep two summon hexes free, activate first, and only then reposition the rest of the formation."],
    ["Use Summons Defensively", "Ork Boyz, the Grot Tank, and Snot's Grots absorb attacks, close lanes, and keep enemies away from Snappa and Gibba. A summon that saves a medal has already done its job."],
    ["Build the Gibba Bunker", "Keep vulnerable required heroes adjacent to Gibbascrapz when the enemy is about to connect. His repairs and Kustom Force Field are most valuable when the formation stays together."],
    ["Repair Snappa Before Attacking", "At full health, Snappa's normal attack gains its stronger effect, and every repair also increases the eventual hit count of DAKKA! DAKKA! DAKKA!."],
    ["Protect the Third Medal", "When the battle is won, hide an injured required hero and let Boss, Snot, and summons clean up. Do not spend Snappa's self-damaging active for inconsequential damage."],
  ] as Array<[string, string]>,
};

export const requiredHeroContent: HeroGuide[] = [
  {
    heading: "Boss Gulgortz",
    role: "Primary Required Carry, frontline tank, mobile damage dealer, and Ork Boy summoner.",
    ...targetsFor("Boss"),
    paragraphs: [
      "Boss is the required hero most capable of converting concentrated rank and badge investment into campaign progress. His current kit combines durability, melee pressure, ranged follow-up damage, mobility, and two summon bodies.",
      "WAAAGH! is the first ability priority. Position Boss on the previous turn, preserve the charge target and summon hexes, then activate before moving him. Light 'Im Up deserves meaningful investment once Boss is carrying because it adds damage after every normal attack.",
      "Move the best available block equipment onto Boss for difficult medals. His job is to take the dangerous approach, keep enemies away from Gibba and Snappa, and create the decisive turn for the rest of the formation.",
    ],
    callout: "Required Carry: build Boss first and activate WAAAGH! before moving.",
    featured: true,
  },
  {
    heading: "Gibbascrapz",
    role: "Required repair support, formation armor, and Grot Tank summoner.",
    ...targetsFor("Gibba"),
    paragraphs: [
      "Gibba is the center of the Ork bunker rather than the primary damage carry. His Kustom Force Field rewards adjacency, while repairs preserve required heroes and strengthen Snappa's next attack.",
      "Summon the Grot Tank where it can immediately attack a priority target. Even when it does not secure a kill, the extra body can absorb pressure and reshape the enemy's approach.",
      "Keep Gibba near the minimum rank that survives, then add investment when his own durability becomes the reason a restricted-trio stage fails.",
    ],
    callout: "Build for survival, repairs, the armor field, and a consequential Grot Tank placement.",
  },
  {
    heading: "Snappawrecka",
    role: "Required ranged damage, armor reduction, and priority-target burst.",
    ...targetsFor("Snappa"),
    paragraphs: [
      "Snappa should normally receive the lowest rank investment of the mandatory trio. Keep him behind Boss, Snot, summons, and the Grot Tank so his range and armor reduction can contribute without exposing him.",
      "Repair Snappa before a normal attack when practical to restore his stronger full-health effect and build extra hits for his active. Treat the self-damaging active as a finisher, not a button that must be pressed every battle.",
      "Add rank only when Snappa repeatedly dies on a compulsory stage or when a specific damage threshold is blocking progress.",
    ],
    callout: "Keep Snappa near the survival minimum and spend his self-damaging active only when the burst matters.",
  },
];

export const bestSupportingHero: HeroGuide = {
  characterId: "orksRuntherd",
  heading: "Snotflogga",
  role: "Best Support; durable summoner, Taunt control, and expendable board presence.",
  paragraphs: [
    "Snotflogga is the strongest optional campaign support. His Grots attack immediately, Taunt enemies they hit, occupy approach hexes, absorb attacks, and can continue spawning at the end of later turns.",
    "Set up his active where several adjacent free hexes also touch enemies. A position that creates three useful Grots is usually worth more than an isolated attack that creates only one.",
    "Build Snot after Boss and use him as the default fourth or fifth hero whenever the stage allows support. Current late-Elite evidence consistently treats Boss and Snot as the two Orks worth escalating above the required baseline.",
  ],
  callout: "Best Support: build Snot after Boss and turn enemy approach lanes into Grot-filled traffic jams.",
  featured: true,
};

export const optionalSupportingHero: HeroGuide = {
  characterId: "orksNob",
  heading: "Tanksmasha",
  role: "Optional mobile damage and control.",
  paragraphs: [
    "Tanksmasha offers four movement, a straight-line charge, displacement, Suppression, and damage reduction after moving. He can be useful when already developed for other modes.",
    "Octarius evidence does not justify building him ahead of Snotflogga, and restricted-trio stages remove him entirely. Treat Tanksmasha as a roster luxury rather than the solution to campaign progression.",
  ],
  callout: "Optional: use Tank if already developed; do not build him primarily for Octarius.",
};

export const difficultStageGroups = [
  {
    id: "difficult-normal-stages",
    modeId: "normal",
    title: "Normal",
    stages: [
      { number: 62, title: "Required-Trio Check", why: "This very late three-character battle removes both optional supports, exposing any weakness in Boss, Gibba, or Snappa.", strategy: ["Let Boss take the forward lane and preserve WAAAGH! for the decisive engagement.", "Keep Snappa protected inside Gibba's field.", "Use the Grot Tank to create a fourth target and pressure the most dangerous ranged enemy.", "Move defensive equipment to whichever required hero is being eliminated first."], closing: "Optional investment cannot solve Normal 62; the required trio must survive on its own." },
      { number: 66, title: "Four-Ork Restriction", why: "Late-campaign scaling combines with a four-character cap, so the fifth roster slot cannot cover weak positioning.", strategy: ["Bring Snot as the fourth hero unless a developed Tanksmasha solves a specific control problem.", "Build the formation around Gibba before enemies connect.", "Use Grots and Ork Boyz to keep pressure away from Snappa.", "Finish one threat completely instead of spreading damage."], closing: "Snot is the default fourth Ork, but Boss still carries the damage and durability check." },
      { number: 67, title: "Restricted Tyranid Wave", why: "A four-character limit and fast Tyranid pressure can expose the required backline before the formation is established.", strategy: ["Use expendable summons to close approach lanes.", "Do not advance Snappa beyond Gibba's protection for a marginal shot.", "Remove full-health spawning or multiplying targets before they snowball.", "Preserve Boss's active until its movement and summons change the whole turn."], closing: "Control the approach first; chase damage only after the required heroes are safe." },
    ],
  },
  {
    id: "difficult-elite-stages",
    modeId: "elite",
    title: "Elite",
    stages: [
      { number: 5, title: "First Required-Trio Gate", why: "Elite 5 is the first pure Boss, Gibba, and Snappa investment check, with no Snot support available.", strategy: ["Center the plan on Boss's survival and WAAAGH! turn.", "Keep Gibba adjacent to the expected targets.", "Use the Grot Tank where its immediate shot matters.", "Hide Snappa after he contributes ranged damage."], closing: "If Elite 5 fails consistently, improve the required trio rather than optional heroes." },
      { number: 10, title: "Second Required-Trio Gate", why: "The same three-character restriction returns after Elite scaling has increased, punishing a roster carried only by Snot.", strategy: ["Transfer the best defensive gear onto the required trio.", "Repair Snappa before his attack when possible.", "Keep summon hexes open before using WAAAGH!.", "Accept a pause if both weak required heroes need several upgrades."], closing: "Elite 10 confirms whether the required core—not the open-stage roster—is ready to progress." },
      { number: 34, title: "Late Four-Ork Restriction", why: "Four slots near the end of Elite remove the comfort of deploying every available Ork.", strategy: ["Default to Snot as the fourth hero.", "Use Grots to deny routes into the required backline.", "Keep Boss and Snot outward-facing with Gibba and Snappa protected.", "Save burst for enemies that bypass the bunker."], closing: "Do not write or play this stage as if a fifth hero will cover the formation." },
      { number: 35, title: "Final Restricted Roster", why: "Another late four-character battle tests the same compact roster against higher damage and less room for mistakes.", strategy: ["Start from the safest compact formation.", "Create multiple targets before the enemy's strongest turn.", "Retreat an injured required hero instead of trading damage.", "Change deployment when the same opening repeatedly kills one character."], closing: "Three medals come from protecting the weakest required hero, not from racing the clear." },
      { number: 36, title: "The Final-Five Wall", why: "Current player evidence identifies Elite 36–40 as the point where a Gold I Boss and Snot with Silver I required supports can stall.", strategy: ["Treat Gold II Boss and Snot as the first evidence-backed late-clear escalation.", "Keep Gibba and Snappa near their survival floor until a failure identifies the next upgrade.", "Move the strongest block and armor equipment before each attempt.", "Use replays as team-composition evidence, not proof of a universal minimum."], closing: "Escalate the two carries first; spread investment only when survival evidence demands it." },
      { number: 40, title: "High Marshal Helbrecht", why: "The final boss combines Helbrecht with dangerous supporting fire, including lascannons that can remove an underbuilt required hero.", strategy: ["Deploy the Grot Tank where its immediate shot pressures a lascannon.", "Use Snot on the opposite side to create several Grots and divide targeting.", "Group around Gibba's field after the opening engagement.", "Remove dangerous supporting fire before committing to Helbrecht.", "Preserve Boss or Snot burst for the controlled finish."], closing: "Absorb the opening with summons, neutralize the lascannons, then collapse on Helbrecht without exposing the required backline." },
    ],
  },
];

export const bossContent = [
  { characterId: "templAggressor", heading: "Brother Burchard", appearances: ["Normal 15", "Elite 8"], paragraphs: ["Do not feed several Orks into his close-range pressure at once.", "Use summons to occupy the approach while Boss creates the decisive melee turn.", "Keep Gibba and Snappa behind the outward-facing units."] },
  { characterId: "templSwordBrother", heading: "Sword Brother Godswyl", appearances: ["Normal 30", "Elite 16"], paragraphs: ["Respect his single-target burst against underbuilt required heroes.", "Offer Boss, Snot, or an expendable summon as the reachable target.", "Finish the engagement quickly once his support units are controlled."] },
  { characterId: "templAncient", heading: "Ancient Thoread", appearances: ["Normal 45", "Elite 24"], paragraphs: ["Do not split damage across a formation that benefits from Thoread's support.", "Use ranged pressure and summons to isolate priority enemies.", "Keep Snappa protected while Boss closes the distance."] },
  { characterId: "templChampion", heading: "Brother Jaeger", appearances: ["Normal 60", "Elite 32"], paragraphs: ["Avoid feeding summons into a position where they create no defensive value.", "Use Boss to anchor the engagement and attack from outside Jaeger's preferred lane.", "Preserve weak required heroes once the battle is under control."] },
  { characterId: "templHelbrecht", heading: "High Marshal Helbrecht", appearances: ["Normal 75", "Elite 40"], paragraphs: ["Do not automatically boss-rush while lascannons or other supporting threats can reach Gibba and Snappa.", "Divide enemy attention with the Grot Tank, Grots, and Ork Boyz, then regroup around Gibba.", "Commit Boss and Snot only after the dangerous supporting fire is controlled."] },
];
