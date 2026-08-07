import { getRequiredRecommendationsForCampaign } from "./requiredRecommendations";

const recommendationRows = getRequiredRecommendationsForCampaign("/campaigns/indomitus");
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
      "Indomitus is available immediately and introduces the core systems every new player will use throughout Tacticus. It should remain your main early campaign, but it does not need to be completed in one uninterrupted push.",
      "Advance as far as your current roster can comfortably take you. When another Normal or Mirror campaign unlocks, begin working there as well—especially when it offers useful characters, better upgrade nodes, or an easier path around your current resource bottleneck.",
      "You do not need three medals on every stage before moving forward. Opening new nodes is often more valuable than forcing a perfect clear. Return for missing medals after account-wide upgrades make those stages cheaper and easier.",
      "All Normal medals are eventually required to unlock Indomitus Elite. Make the final medal cleanup when Elite becomes your next useful progression goal, not simply because an unfinished stage is visible.",
    ],
    callout: "Push until progress becomes expensive, then branch out. Indomitus should anchor your early account without preventing progress in other campaigns.",
  },
  progression: {
    introduction: "Treat Campaign progress as an account-building loop rather than a single checklist.",
    steps: [
      "Advance through Indomitus and open new farming nodes.",
      "Upgrade the required trio and useful shared Imperial heroes.",
      "Begin newly unlocked Normal and Mirror campaigns.",
      "Return for unfinished Indomitus medals after your roster improves.",
      "Unlock Elite once all Normal medals are complete.",
      "Push Elite until your existing roster reaches a serious wall.",
      "Strengthen Bellator and the broader Imperial roster elsewhere.",
      "Return when additional Elite nodes or full completion justify the investment.",
    ],
    paragraphs: [
      "Mirror campaigns deserve special attention because their upgrade nodes generally provide better material-per-energy returns. Imperial Mirror campaigns can also allow stronger Imperial characters to support their required units.",
      "When Elite first unlocks, try it immediately. The opening stages may be accessible with the roster that completed Normal, and even partial progress can unlock valuable farming nodes. However, do not assume the automatic starter five are expected to complete all 120 Elite medals without additional Imperial support.",
    ],
    callout: "Clear first. Medal later. Invest when the next unlock is worth it.",
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
    ["Build Around Bellator", "Bellator’s active, Death from Above, is the campaign’s most important ability. It summons one Inceptor for each round that has begun, so waiting can create a larger force—but delaying is not always correct when Scarabs, Deathmarks, or a backline breach require an immediate answer."],
    ["Protect Varro and Certus", "In late Elite, Varro and Certus are often survival objectives rather than frontline damage dealers. Keep them behind Bellator, durable supports, summons, terrain, or Isabella’s healing formation. Do not expose Certus for a marginally better shot."],
    ["Move Your Best Armor", "Near the recommended minimum, defensive items are not a minor optimization. Move your strongest available armor or pauldrons onto Varro and Certus before difficult three-character stages. A single equipment upgrade may determine whether they survive one attack."],
    ["Preserve Burst Damage", "Do not spend every active ability on the first enemies you see. Save area damage or high-damage abilities for multiplying Scarabs, emerging Ophydian Destroyers, Anuphet’s summoned Warriors, or another threat that must die immediately."],
    ["Manipulate Enemy Targeting", "Bellator, Yarrick, and Mataneo create additional bodies that can block movement, occupy preferred attack hexes, and redirect enemy attacks. Many low-investment Elite clears work because enemies never reach the mandatory backline."],
    ["Finish Necrons Completely", "Living Metal allows damaged Necrons to recover. Focus attacks and finish enemies instead of leaving several targets barely alive. Multiplying Scarabs are the main exception: remove the entire spawning swarm before it creates another unit."],
    ["Separate Winning From Three Medals", "A team may be capable of defeating a stage while still losing Certus or Varro. Three-medal clears often require stronger armor, safer positioning, a healer, or several attempts for better enemy movement."],
  ],
};

export type HeroGuide = {
  characterId: string;
  heading: string;
  role: string;
  rankTargets?: { normal: string; elite: string };
  abilityTargets?: {
    iconName: string;
    active: { normal: string; elite: string };
    passive: { normal: string; elite: string };
  };
  paragraphs: string[];
  callout: string;
  featured?: boolean;
};

export const requiredHeroContent: HeroGuide[] = [
  {
    heading: "Varro Tigurius",
    role: "Psychic area damage and clustered-enemy removal.",
    ...targetsFor("Tiggy"),
    paragraphs: [
      "Varro’s active deals Psychic damage to a target and adjacent enemies, making it one of the starter team’s best answers to clustered Necron Warriors and other armored targets. It is especially useful when several enemies can be damaged together or when lower-pierce attacks are struggling to finish a target.",
      "For Normal, Bronze I is a comfortable target rather than a requirement. For Elite, Silver I provides a reproducible survival baseline without assuming Isabella or a much stronger Diamond carry.",
      "Varro should normally remain behind Bellator or another durable Imperial. In the final Elite chapters, exposing him for an ordinary attack is rarely worth the risk of losing a medal.",
    ],
    callout: "Ability priority: Bellator active first, Varro active second.",
  },
  {
    heading: "Certus",
    role: "Long-range damage, tactical displacement, and backline support.",
    ...targetsFor("Certus"),
    paragraphs: [
      "Certus contributes long-range Heavy Round damage and can push a target one hex with his active. The displacement can break formations, alter movement, or move an enemy into Varro’s or Vindicta’s area damage.",
      "His abilities are not the main campaign investment. Certus usually benefits more from rank, rarity, and defensive equipment than from heavy badge spending. His passive can remain low unless badges are abundant and other priorities are already covered.",
      "In Elite, protect Certus aggressively. Deathmarks, Flayed Ones, and Ophydian Destroyers can bypass the frontline or remove him in a single attack. Keep escape routes open and avoid stepping forward for minor damage unless the threat will certainly die.",
    ],
    callout: "Build Certus to survive—not to carry.",
  },
  {
    heading: "Bellator",
    role: "Primary carry, frontline tank, multi-hit attacker, and summon engine.",
    ...targetsFor("Bella"),
    paragraphs: [
      "Bellator is the campaign MVP. His active summons one Inceptor for each round that has begun, giving the team damage, extra bodies, route blocking, and safer targets for enemy attacks.",
      "Bellator and his Inceptors are also the starter roster’s default answer to Scarab Swarms because their high hit counts can remove a full swarm before it multiplies. On restricted three-character stages, the summoned Inceptors often provide the frontline that Varro and Certus cannot.",
      "Keep Death from Above near the highest practical level allowed by Bellator’s rarity. An active around level 35 is a strong Elite target, while summon-focused late clears may justify levels around 40 or higher.",
      "Silver I is unnecessary for Normal alone, but it is valuable preparation for Elite and many other game modes. Gold I is the most defensible Elite recommendation because it does not depend on owning a rare healer or Diamond carry.",
    ],
    callout: "Best overall campaign investment: Bellator rank and Death from Above.",
    featured: true,
  },
];

export const supportingHeroGroups: Array<{ id: string; title: string; heroes: HeroGuide[] }> = [
  {
    id: "early-game-heroes",
    title: "Early Game",
    heroes: [
      { characterId: "ultraApothecary", heading: "Incisus", role: "Accessible healer and emergency stabilizer.", paragraphs: ["Incisus is the starter roster’s most accessible source of healing. His active restores health to himself and adjacent allies, with stronger healing for Imperial characters, making him useful when attrition—not a clean one-shot—is threatening a medal.", "Iron III to Bronze I is enough for most Normal use. He can continue contributing in Elite when a fourth or fifth deployment slot is available, but he cannot help on mandatory-trio stages. Heavy investment in Incisus therefore does not solve the central late-campaign problem of keeping Varro and Certus alive.", "For Elite use, Silver I is a reasonable ceiling unless Incisus is also part of your broader plans. Prioritize his active healing; improve the passive only as resources permit."], callout: "Accessible and useful, but not an equal substitute for Isabella." },
      { characterId: "adeptRetributor", heading: "Vindicta", role: "Area damage, anti-Scarab attacks, and clustered-enemy clearing.", paragraphs: ["Vindicta’s active deals Flame damage and immediately allows another attack. This makes her excellent against clustered Warriors, adjacent Scarab Swarms, and formations that require more than one attack to dismantle.", "Bronze I is a sensible Normal target. For late Elite, she becomes more stat-dependent and may need Gold I investment to remain effective.", "Her Flame hexes can also obstruct your own movement. Before using the active, check whether the resulting terrain will block Bellator, trap a vulnerable hero, or close an intended escape route."], callout: "Excellent early damage—just watch the fire." },
    ],
  },
  {
    id: "mid-game-heroes",
    title: "Mid Game",
    heroes: [
      { characterId: "astraOrdnance", heading: "Thaddeus Noble", role: "Long-range priority-target removal.", paragraphs: ["Thaddeus is most valuable when a dangerous ranged enemy cannot be reached safely. His active can strike anywhere on the map when he has not moved, making him a practical answer to Deathmarks, exposed Destroyers, or another threat targeting the backline.", "He is not required for Normal. For a serious Elite push, Silver III to Gold I is a practical target, with the active around levels 26–35.", "His bombardment is powerful but variable. Do not write or play around the assumption that it will always remove the selected target. Use it to soften a threat when a guaranteed kill is not available."], callout: "Best used to solve threats your frontline cannot safely reach." },
      { characterId: "templAggressor", heading: "Brother Burchard", role: "Durable frontliner, body-blocker, and multi-target damage.", paragraphs: ["Brother Burchard is one of the best broadly obtainable Elite supports because he addresses several problems at once. He can stand in front of Varro and Certus, absorb sustained attacks, block routes into the backline, and distribute Blast damage across packed enemies.", "Silver II to Gold I is a practical Elite range, with both abilities around levels 26–35 if he is becoming a long-term roster character.", "Unlike Certus, both of Burchard’s abilities have meaningful campaign value. Invest more evenly, especially when his durability and adjacent damage are helping control the center of the map."], callout: "One of the strongest non-luxury Imperial protectors." },
    ],
  },
  {
    id: "elite-heroes",
    title: "Elite Heroes",
    heroes: [
      { characterId: "adeptHospitaller", heading: "Isabella", role: "Passive healing, formation support, and resurrection.", paragraphs: ["Isabella has the greatest effect on three-medal reliability in the reviewed evidence. Her passive heals adjacent allies each round, while her active can resurrect a defeated character and rescue an attempt that would otherwise lose a medal.", "Silver II to Silver III can be enough for early Elite. Gold I is a comfortable late-Elite target. Prioritize the passive around level 35 or higher; an active around levels 26–35 is usually sufficient unless Isabella is a major account-wide project.", "Use her inside a compact formation with Bellator or another tank on the front edge. She cannot protect characters standing outside her healing zone, and she does not prevent a clean one-shot. On certain maps, it may be strategically acceptable to let one mandatory hero die during the opening and resurrect them after the most dangerous turn."], callout: "Strongest overall campaign support for reliable three-medal clears.", featured: true },
      { characterId: "ultraCalgar", heading: "Marneus Calgar", role: "Durable frontline wall, area damage, and adjacent ally support.", paragraphs: ["Calgar combines exceptional durability with area damage and strong support for adjacent allies. In Indomitus Elite, he can occupy the dangerous hexes that would otherwise allow Flayed Ones, Warriors, or Destroyers to reach Varro and Certus.", "Silver II can contribute, but Gold I or above is preferable for the final chapter. Both abilities merit investment around levels 30–35 when Calgar is part of the player’s wider roster.", "Calgar is also farmable after defeating him at the end of Indomitus Mirror, though reaching that point is itself a substantial progression milestone."], callout: "Premium protection with meaningful damage of his own." },
      { characterId: "custoBladeChampion", heading: "Kariyan", role: "High-investment carry and frontline support.", paragraphs: ["The reviewed campaign evidence contains successful clears using Diamond-rank Kariyan as a major supporting carry. Those examples show that an extremely strong helper can compensate for an underbuilt mandatory hero, but they do not establish a practical beginner investment target for Kariyan.", "Kariyan is an option for players who already have him heavily developed, not a character someone should build specifically to complete Indomitus Elite."], callout: "Use him when already built; do not treat him as a required campaign project." },
      { characterId: "bloodDeathCompany", heading: "Lucien", role: "Mobile damage carry and multi-kill threat remover.", paragraphs: ["Lucien contributes through direct pressure rather than healing or defensive support. His mobility and charge damage allow him to reach exposed Scarabs, Warriors, or ranged enemies before they attack. Community reports describe him removing multiple vulnerable targets in one turn.", "Gold I is a meaningful middle-to-late Elite target. Gold II is more appropriate when he is expected to function as the primary final-chapter carry. Abilities around levels 30–35 are sufficient unless Lucien is a broader roster priority.", "He cannot revive or passively protect the mandatory trio, but he can reduce incoming damage by removing threats quickly."], callout: "A fast offensive solution when survival improves by killing first." },
      { characterId: "bloodIntercessor", heading: "Mataneo", role: "Mobility, temporary bodies, and enemy-targeting disruption.", paragraphs: ["Mataneo’s campaign value comes from tempo and artificial-intelligence manipulation. His mobility allows him to reach priority targets, while his additional bodies can block routes, occupy attack hexes, and redirect enemy attention away from Varro and Certus.", "Gold I to Gold II is the practical Elite range. Abilities around levels 30–35 are appropriate, emphasizing whichever ability controls or strengthens the accompanying units.", "Mataneo is not a healer. His value depends on placing the extra bodies where they actually absorb an attack or obstruct a dangerous route."], callout: "Creates safer turns by changing where enemies can move and attack." },
      { characterId: "astraDreir", heading: "Marshal Dreir", role: "Durable charging frontliner and self-sustaining threat.", paragraphs: ["Marshal Dreir’s charge damage and health regeneration make him well suited to pushing directly into the Necron formation. He can occupy the spaces that Flayed Ones, Warriors, or Destroyers would otherwise use to approach the mandatory backline.", "Gold I is a practical late-Elite target, with abilities around levels 30–35. His charge and regeneration passive is especially relevant to the campaign role.", "Dreir is a strong alternative when Isabella is unavailable. He cannot heal or resurrect Varro and Certus, but he can reduce the number of attacks that ever reach them."], callout: "A durable alternative that protects through pressure and positioning." },
    ],
  },
];

export const difficultStageGroups = [
  { id: "difficult-normal-stages", modeId: "normal", title: "Normal", stages: [
    { number: 60, title: "Thutmose", why: "Normal 60 is the first major raw-stat and burst-damage checkpoint. Thutmose can remove one or more starter heroes quickly while also feeling unusually durable against ordinary attacks.", strategy: ["Spread the formation so one attack cannot compromise several heroes.", "Offer Bellator, an Inceptor, or the most durable available support as the first target.", "Keep Varro and Certus outside immediate retaliation range.", "Combine Varro’s active, Vindicta’s attacks, Certus’s shot, and Bellator’s damage rather than attacking piecemeal.", "Use Incisus only when healing will prevent a death; healing cannot rescue a hero from a clean one-shot."], closing: "Iron-rank clears are documented. Treat Stage 60 as a tactical breakpoint with an optional rank solution—not proof that every hero must be Bronze I." },
    { number: 74, title: "Scarab Control", why: "Stage 74 becomes chaotic when Scarab Swarms multiply faster than the team can remove them. The problem gets worse when enemy attacks eliminate Bellator or Vindicta—the heroes best equipped to produce enough hits.", strategy: ["Identify which Scarab unit can still multiply and remove the entire unit in one turn.", "Preserve Bellator and Vindicta rather than exposing them for early damage.", "Use Bellator’s high hit count and Inceptors as the default Scarab answer.", "Use Vindicta’s active and immediate follow-up attack when several Swarms are adjacent.", "Do not spread attacks across several Scarabs if the original spawning unit will survive."], closing: "This stage punishes teams that rely on only one multi-hit answer. Position Bellator and Vindicta so the enemy cannot remove both before the Scarabs are controlled." },
    { number: 75, title: "Anuphet", why: "Normal 75 is less often an absolute progression wall than a three-medal survival test. Anuphet, his summoned Warriors, and the surrounding enemies create competing priorities while every deployed hero must remain alive.", strategy: ["Use controlled deployment rather than rushing toward Anuphet.", "Remove enemies with direct access to Varro, Certus, or another weak starter hero.", "Let Bellator hold the center and absorb the initial pressure.", "Begin damaging Anuphet before the number of summoned Warriors becomes unmanageable.", "Preserve healing and burst abilities for the turn when several threats appear together.", "Hide a damaged hero during cleanup rather than risking the final medal for marginal damage."], closing: "Starter-only Iron-rank clears are documented, proving that order of operations and positioning matter more than one universal rank threshold." },
  ]},
  { id: "difficult-elite-stages", modeId: "elite", title: "Elite", stages: [
    { number: 24, title: "Aleph-Null", why: "Elite 24 combines Aleph-Null, multiplying Scarabs, high-armor Destroyers, and restrictive bridge positioning. The team must control several threat types without exposing Varro and Certus.", strategy: ["Kill Aleph-Null before the Scarab situation becomes self-sustaining.", "If Aleph summons, focus the original multiplying swarm rather than scattering damage.", "Direct Bellator’s Inceptors toward Scarabs while the main team pressures Aleph.", "Use the bridge to concentrate attacks and limit enemy movement.", "Expect the Destroyers to remain dangerous after Aleph dies.", "Do not leave Certus on a hex where a Destroyer can emerge beside him."], closing: "The battle is not over when the boss dies. Preserve enough positioning and damage to handle the remaining Destroyers." },
    { number: 35, title: "Mandatory-Hero Survival", why: "Elite 35 is a late three-character survival and equipment check. Successful teams vary widely: some use balanced Silver and Gold investment, while others concentrate almost every resource into Bellator.", strategy: ["Move your best defensive gear onto Varro and Certus.", "Keep both mandatory backliners behind Bellator whenever possible.", "Use summons to occupy attack hexes and redirect enemy movement.", "Do not assume one specific rank combination is required.", "Expect low-rank clears to depend on equipment, critical hits, exact deployment, or favorable enemy behavior.", "Restarting for a better opening may be more efficient than adding several marginal upgrades."], closing: "Stage 35 can be solved through balanced investment or through a heavily developed Bellator. It is not governed by one clean rank threshold." },
    { number: 37, title: "Deathmark and Ophydian Pressure", why: "Elite 37 produces some of the strongest frustration reports in the campaign. Deathmarks and Ophydian Destroyers can one-shot Varro, Certus, and even Bellator’s summoned Inceptors.", strategy: ["Deny Deathmarks a stationary, elevated firing position.", "Use terrain, another hero, or a summon to block line of sight.", "Keep Varro and Certus away from isolated Ophydian landing zones.", "Occupy useful destination hexes with Bellator, a durable support, or summons.", "Preserve Varro’s active or another burst tool for the turn an Ophydian emerges.", "Counter-snipe with Certus only when the Deathmark will certainly die and Certus will remain safe."], closing: "This stage is often won during deployment. The safest opening may involve hiding the mandatory heroes and forcing enemies to move into less favorable attack positions." },
    { number: 40, title: "Anuphet", why: "Elite 40 is frequently the final stage preventing 120/120 completion. Anuphet, Warriors, Flayed Ones, Scarabs, and Destroyers create several simultaneous priorities, and one exposed mandatory hero can end the attempt.", strategy: ["Clear one side of the map to create a safe retreat area.", "Anticipate where the first Destroyer will emerge.", "Move Certus and other vulnerable heroes before that emergence turn.", "Preserve multiple active abilities to burst the Destroyer immediately.", "Use Bellator’s Inceptors or another summon to block the second Destroyer.", "Place the most durable hero in front of Anuphet and the Warriors.", "Pressure Anuphet once the immediate Destroyer threat is controlled.", "Hide any damaged mandatory hero during cleanup."], closing: "Elite 40 rewards a turn plan more than a damage race. Decide before the battle which side you will clear, where vulnerable heroes will retreat, and which abilities are reserved for the Destroyers." },
  ]},
];

export const bossContent = [
  { characterId: "necroWarden", heading: "Makhotep", appearances: ["Normal 15", "Elite 8"], paragraphs: ["Makhotep is primarily an early lesson in positioning and target priority. Remove any Scarab or Warrior creating an immediate numbers problem, prevent Makhotep from gaining a clean shot on the weakest hero, and allow Bellator to absorb the central pressure.", "The encounter is forgiving enough that Bellator can often delay Death from Above and generate additional Inceptors.", "Treat Elite 8 as a diagnostic for basic survivability. Push through it when possible, but do not overlevel the entire team simply to force the first Elite page."] },
  { characterId: "necroDestroyer", heading: "Imospekh", appearances: ["Normal 30", "Elite 16"], paragraphs: ["Imospekh punishes heroes who enter his firing lane carelessly. Force him to move, engage him with Bellator or a summon, or remain behind terrain until the team can attack together.", "Elite 16 is an early point where supporting heroes begin to meaningfully change the solution. Isabella, Yarrick, Thaddeus, Incisus, and Vindicta all appear in successful approaches.", "Bellator plus healing can compensate for a severely underbuilt Certus at this stage, but positioning remains more important than simply adding another support."] },
  { characterId: "necroSpyder", heading: "Aleph-Null", appearances: ["Normal 45", "Elite 24"], paragraphs: ["Kill Aleph-Null before the Scarab situation becomes self-sustaining. If Aleph summons first, eliminate the original multiplying swarm rather than spreading attacks across every nearby unit.", "At Elite 24, direct Bellator’s Inceptors toward Scarabs while the main heroes use the bridge to pressure Aleph.", "Do not relax after the boss falls. Destroyers remain capable of bypassing the frontline, and Certus should not finish the boss turn on an exposed emergence hex."] },
  { characterId: "necroPlasmancer", heading: "Thutmose", appearances: ["Normal 60", "Elite 32"], paragraphs: ["Thutmose is the first major damage-and-survival checkpoint. He can rapidly remove starter heroes while resisting piecemeal attacks.", "Spread the formation, offer a durable first target, and combine the team’s strongest abilities into one coordinated burst. Keep Varro and Certus outside immediate retaliation range.", "Elite 32 repeats the same lesson at a higher stat threshold. Preserve enough burst damage to remove Thutmose before surrounding enemies create several simultaneous attack lanes."] },
  { characterId: "necroOverlord", heading: "Anuphet", appearances: ["Normal 75", "Elite 40"], paragraphs: ["Anuphet is the campaign’s most complex boss because his value increases as additional Warriors enter the battle. Players must balance pressure on the boss with immediate threats from Flayed Ones, Scarabs, Deathmarks, and Destroyers.", "On Normal 75, protect the weakest starter heroes, let Bellator hold the center, and begin damaging Anuphet before the summon count becomes overwhelming.", "On Elite 40, control the Destroyers first, establish a safe retreat area, and preserve several active abilities for the key emergence turn. Once the immediate threat is contained, place the most durable hero in front and finish Anuphet without exposing a damaged mandatory character."] },
];
