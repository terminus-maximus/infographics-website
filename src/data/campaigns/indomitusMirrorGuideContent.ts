import type { HeroGuide } from "./indomitusGuideContent";
import { getRequiredRecommendationsForCampaign } from "./requiredRecommendations";

const recommendationRows = getRequiredRecommendationsForCampaign("/campaigns/indomitus-mirror");
const recommendationByName = Object.fromEntries(
  recommendationRows.map((recommendation) => [recommendation.terminusName, recommendation]),
);

const investmentRows = recommendationRows.map((recommendation) => ({
  characterId: recommendation.characterId,
  abilityIconName: recommendation.terminusName,
  normal: recommendation.normal,
  elite: recommendation.elite,
}));

export const overviewContent = {
  timing: {
    paragraphs: [
      "Indomitus Mirror is one of the highest-value early campaigns because Mirror nodes generally offer better material drop rates than their Normal counterparts. It is also a more expensive campaign than Indomitus: expect the practical Normal and Elite investment targets to rise accordingly.",
      "Progress as far as your current Necrons can comfortably take you, then return after account-wide upgrades. Opening a valuable farming node is usually more important than forcing three medals immediately.",
      "All Normal medals eventually unlock Indomitus Mirror Elite, where the campaign adds excellent Elite material nodes and the long-term goal of farming Marneus Calgar shards.",
    ],
    callout: "Clear first. Medal later. Push for farming nodes, then build toward Elite when its next unlock is worth the investment.",
  },
  progression: {
    introduction: "Use Indomitus Mirror as an account-building loop, not a one-time completion project.",
    steps: [
      "Advance until the next battle becomes expensive.",
      "Farm the newly opened Mirror upgrade nodes.",
      "Build the Required Carry first: put the majority of early resources into Aleph-Null.",
      "Raise Imospekh and Makhotep enough to survive and contribute.",
      "Return for missing medals after the roster improves.",
      "Unlock Elite and test the opening stages immediately.",
      "Develop two optional Necrons for full-roster Elite battles.",
      "Push toward Elite materials and Marneus Calgar shard farming.",
    ],
    paragraphs: [
      "The campaign is Necron-restricted. Aleph-Null, Imospekh, and Makhotep are required, while Anuphet, Thothmek, and Thutmose can fill the remaining deployment slots when the map allows them.",
      "Elite rewards concentrated investment. Aleph-Null can carry the battle, but three medals still require every deployed Necron to survive the burst turns. Recommended Investment targets are practical, repeatable goals—not minimum clears that may rely on exact crits, blocks, enemy movement, or many attempts.",
    ],
    callout: "Required Carry: build Aleph-Null first. Scarabs, repairs, Living Metal, and strong survivability drive the campaign.",
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
    ["Build the Required Carry First", "Aleph-Null should receive the majority of early gear and ability investment. Scarabs absorb attacks, block routes, and preserve medals while Fabricator Claw Array repairs keep the formation intact."],
    ["Use Summons as Geometry", "Scarabs and Necron Warriors do not need to survive to create value. Place them where they consume enemy attacks, block an approach, or protect a fragile required hero."],
    ["Stay Inside Repair Range", "Keep a compact formation without clustering into area damage. Aleph-Null should be able to reach the forward unit, and Makhotep should remain close enough to support damaged Mechanical allies."],
    ["Claim High Ground, Then Set the Lane", "When the map allows it, move Imospekh onto a safe High Ground hex one turn before enemies advance. The elevation boosts his Overwatch on the following turn; then use terrain and summons to force enemies through that stronger firing lane."],
    ["Invest in Survival", "Defensive equipment belongs on the Necron that repeatedly dies first. Another damage upgrade rarely fixes a one-turn casualty or a missing third medal."],
    ["Focus One Threat", "Finish one enemy instead of leaving several nearly dead. Prioritize anything that can bypass the front line, attack multiple times, heal, summon, or reach a fragile hero."],
    ["Return Later", "A two-medal clear that opens a useful node is progress. Come back for difficult medals after new ranks, equipment, or optional heroes make the attempt cheaper."],
  ] as Array<[string, string]>,
};

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

export const requiredHeroContent: HeroGuide[] = [
  {
    heading: "Makhotep",
    role: "Repair support, movement utility, ranged chip damage, and summon tempo.",
    ...targetsFor("Makho"),
    paragraphs: [
      "Makhotep is the required trio’s utility character. His movement support helps correct deployment, his range lets him contribute without abandoning the formation, and his passive repair improves the team’s staying power.",
      "His active can give Scarabs or Necron Warriors another action, but it is most valuable when the extra movement or attack changes the board immediately. Do not spend it merely because it is available.",
      "Keep Makhotep developed enough to survive, but avoid heavy investment while Aleph-Null still needs upgrades. In difficult Elite maps, strong defensive equipment often matters more than additional chip damage.",
    ],
    callout: "Support the formation and summons; do not try to turn Makhotep into the primary carry.",
  },
  {
    heading: "Imospekh",
    role: "Ranged area denial, Overwatch control, and multi-target pressure.",
    ...targetsFor("Imo"),
    paragraphs: [
      "Imospekh is substantially stronger than older campaign advice suggests. A well-positioned Imospekh can remove several enemies through Overwatch before they reach the Necron formation.",
      "Look one turn ahead for a safe High Ground hex. Moving Imospekh onto elevation before the enemy advances gives his next-turn Overwatch a valuable damage boost, especially when terrain, Scarabs, or Warriors funnel several targets through the same lane.",
      "Once he is set, avoid abandoning the position for a marginal basic attack. Prioritize the passive before spending heavily on the active, and keep enough defensive investment on Imospekh that he can hold the elevated lane without becoming the enemy’s easiest target.",
    ],
    callout: "Claim safe High Ground first, build the lane, then let the enemy enter it.",
  },
  {
    heading: "Aleph-Null",
    role: "Primary carry, Mechanical healer, durable anchor, and Scarab summoner.",
    ...targetsFor("Aleph"),
    paragraphs: [
      "Aleph-Null is the Required Carry and should receive the overwhelming majority of early campaign investment. Scarab Swarms absorb attacks, block movement, occupy firing lanes, and preserve medals for weaker required heroes.",
      "Living Metal, strong defensive stats, and Fabricator Claw Array repairs make Aleph the team’s natural anchor. End turns where Aleph can repair another Necron or remain available to receive the first enemy attacks.",
      "Invest in gear first, then the active, then the passive. The active should remain near the highest practical level allowed by rarity because stronger Scarabs improve both damage and board control.",
    ],
    callout: "Required Carry: prioritize Aleph-Null’s gear, rank, and Scarab active.",
    featured: true,
  },
];

export const supportingHeroes: HeroGuide[] = [
  {
    characterId: "necroOverlord",
    heading: "Anuphet",
    role: "Durable summoner, revival safety net, and Elite board control.",
    paragraphs: [
      "Anuphet is the Best Support for serious Elite progression. His reworked active can revive a defeated Necron while still creating powerful Warrior summons, making mistakes and burst casualties much less punishing.",
      "Delay the active until it creates a meaningful numerical swing. Warriors are most valuable when they replace lost board control, surround an isolated target, or absorb the next wave of attacks.",
      "Combined with Living Metal, Scarabs, Makhotep’s support, and Aleph-Null’s repairs, Anuphet gives Necron teams exceptional staying power in long Elite battles.",
    ],
    callout: "Best Support: revival plus durable Warrior board presence.",
    featured: true,
  },
  {
    characterId: "necroChronomancer",
    heading: "Thothmek",
    role: "Defensive support, Suppression, and adjacent Mechanical protection.",
    paragraphs: [
      "Thothmek is the best defensive alternative when reliable three-medal clears matter more than another summon engine. Suppression reduces enemy pressure, first-hit damage reduction blunts burst turns, and adjacent Mechanical protection helps keep the required trio intact.",
      "Place Thothmek where the defensive effect covers the hero most likely to be attacked without creating an area-damage cluster. The value comes from making enemy turns predictable, not from chasing damage.",
      "Thothmek pairs especially well with Aleph-Null and Anuphet when the map permits a full roster, giving the team multiple layers of sustain and board control.",
    ],
    callout: "Best defensive support for consistent three-medal clears.",
  },
  {
    characterId: "necroPlasmancer",
    heading: "Thutmose",
    role: "Mobile burst damage and exposed-target removal.",
    paragraphs: [
      "Thutmose has become a legitimate damage dealer after recent balance improvements. His mobility and burst can remove an exposed priority target or finish clustered enemies before they retaliate.",
      "He remains fragile. Keep him behind Aleph-Null, summons, or terrain until an attack secures a kill or materially changes the board. Incidental damage is rarely worth exposing him to concentrated fire.",
      "Choose Thutmose when the roster needs offensive reach more than another layer of sustain. He is useful, but Anuphet and Thothmek are usually safer investments for difficult Elite medals.",
    ],
    callout: "A real offensive option—provided the formation can keep him protected.",
  },
];

export const difficultStageGroups = [
  {
    id: "difficult-normal-stages",
    modeId: "normal",
    title: "Normal",
    stages: [
      { number: 30, title: "Formation Check", why: "The first major checkpoint punishes teams that expose several Necrons to the opening attack while Aleph-Null is too far away to repair them.", strategy: ["Begin outside overlapping threat ranges unless advancing immediately removes a dangerous ranged attacker.", "Keep Imospekh one hex behind the anchor and preserve a useful Overwatch lane.", "Use Scarabs to block more than one approach or redirect multiple attacks.", "Overload one side of the map instead of fighting the full enemy formation centrally.", "Move defensive equipment to whichever required Necron dies first."], closing: "A compact, repairable group that controls one approach is safer than a fast but dispersed attack." },
      { number: 45, title: "Controlled Attrition", why: "Enemy damage now exposes neglected health, armor, and defensive equipment. Early summons can also pull the team beyond repair range.", strategy: ["Create a repairable triangle around Aleph-Null.", "Let enemies enter Imospekh’s lane instead of exposing him centrally.", "Use Scarabs as a lateral screen and focus one enemy at a time.", "Delay Anuphet’s Warriors until they replace lost board control or surround an isolated threat.", "Use Makhotep’s mobility support only when it corrects deployment or secures a kill."], closing: "Reduce the number of enemy attacks each turn while keeping the formation inside repair range." },
      { number: 60, title: "Threat-Range Puzzle", why: "Exposed heroes may now be removed before healing matters. Reach, elevation, and attacks around the tank are more dangerous than the closest enemy.", strategy: ["Identify every enemy that can reach a fragile Necron after one move.", "Kill or obstruct long-reach attackers before slow durable blockers.", "Occupy landing hexes and chokepoints with summons.", "Maintain repair access without clustering into area damage.", "Hold Thutmose until his attack secures a kill or seriously damages multiple targets."], closing: "Deny the enemy with the best access to the back line before attacking the most convenient target." },
      { number: 74, title: "Ability Preservation", why: "The penultimate mission is often winnable but difficult to three-star after every active is spent in the opening exchange.", strategy: ["Protect the least-developed required Necron during deployment.", "Separate the fight into opening contact and final cleanup.", "Move toward an edge or obstacle that prevents the anchor from being surrounded.", "Repair before chasing unless the target can kill a hero next turn.", "Re-form before the last kill instead of taking an aggressive shortcut."], closing: "Winning one turn later with the full roster alive is better than a fast two-star clear." },
      { number: 75, title: "Marneus Calgar", why: "The final battle combines boss pressure with supporting enemies. Tunneling onto Calgar or ignoring him for too long can both collapse the formation.", strategy: ["Decide whether Calgar can be isolated, blocked, or burst before choosing the first target.", "Remove supports first when they add healing, multi-target damage, or back-line access.", "Block Calgar’s approach with Scarabs or Warriors.", "Keep the boss tank inside Aleph-Null’s repair path.", "Hold a burst ability for the turn Calgar becomes exposed."], closing: "Separate the battle into support clearance and a controlled boss exchange with repairs, blockers, and burst damage ready." },
    ],
  },
  {
    id: "difficult-elite-stages",
    modeId: "elite",
    title: "Elite",
    stages: [
      { number: 24, title: "Weak-Link Survival", why: "This progression wall exposes the weak link: total damage does not matter if the weakest required Necron dies early.", strategy: ["Make Aleph-Null or another durable unit the best opening target.", "Avoid entering overlapping attack ranges on turn one.", "Use Scarabs primarily to redirect attacks and restrict movement.", "Cover an approach with Imospekh without exposing him to every ranged enemy.", "Improve the armor or defensive item of the character that repeatedly dies first.", "Delay Anuphet’s Warriors until they create a meaningful numerical swing."], closing: "Deny the clean opening volley and use summons as protective geometry." },
      { number: 25, title: "Cautious Reconnaissance", why: "The first battle after a major checkpoint punishes players who assume the next chapter begins gently.", strategy: ["Recheck movement and attack ranges instead of relying on the Normal map.", "Advance with one repairable anchor while the rest stay outside concentrated fire.", "Target enemies by projected next-turn damage.", "Keep a ranged finisher ready for low-health threats.", "Use terrain so only one or two enemies can reach the anchor."], closing: "Force the enemy to reveal its approach, then collapse on the first separated unit." },
      { number: 30, title: "Fight One Flank", why: "Overlapping enemy ranges make a central advance produce more damage than Aleph-Null can repair.", strategy: ["Choose one flank during deployment and commit the roster to it.", "Reveal the first attack with the toughest Necron.", "Kill high-damage ranged enemies before durable blockers when access permits.", "Use summons to delay the opposite side.", "Rotate injured units backward and preserve Imospekh’s strongest Overwatch lane."], closing: "Create local superiority while summons and terrain postpone the rest of the enemy formation." },
      { number: 31, title: "Ability Economy", why: "Spending actives like this is the chapter-ending battle can leave the roster exposed during the final wave.", strategy: ["Use basic attacks for guaranteed kills and save actives for consequential thresholds.", "Summon only when the units alter targeting, movement, or numbers.", "Keep retreat hexes open behind forward units.", "Repair before attacking when a damaged hero cannot survive another activation.", "Regroup instead of chasing the final targets into exposed terrain."], closing: "Let positioning do work that would otherwise require raw statistics or early abilities." },
      { number: 32, title: "Chapter Boss Priority", why: "The decisive turns require choosing between support threats and the main target without splitting damage inefficiently.", strategy: ["Determine whether the boss can be removed in one concentrated turn.", "Redirect the first major activation into a summon.", "Remove healers, summoners, multi-attack units, and back-line threats first.", "Keep Aleph-Null within repair range of the intended tank.", "Time Anuphet’s Warriors for the transition from support clearance to boss focus."], closing: "Clear whatever amplifies the enemy’s next turn, then synchronize healing and burst damage on the boss." },
      { number: 37, title: "Defensive Optimization", why: "Late Elite exposes the difference between a lucky clear and a roster durable enough to survive poor targeting.", strategy: ["Move the best defensive items to the two likely targets.", "Stay within a compact repair radius until ranged threats are gone.", "Use summons to deny access to fragile units.", "Move an injured damage dealer completely out of combat when necessary.", "Change deployment or the first target when the same enemy activation repeatedly ends the run."], closing: "Reduce the need for lucky targeting through defense, compact positioning, and better control of enemy routes." },
      { number: 39, title: "Three-Star Discipline", why: "The final pre-boss mission is often lost after the battle is effectively won because a damaged required hero remains exposed during cleanup.", strategy: ["Keep an exit route toward Aleph-Null.", "Save summons, repositioning, or burst tools that can protect a unit.", "Remove enemies that can reach past the tank.", "Repair to a safe threshold before the final enemy group.", "Reposition the damaged roster before chasing the last kill."], closing: "Knowing when to stop advancing prevents avoidable two-star completions." },
      { number: 40, title: "Final Boss Sequence", why: "Maximum campaign stats combine with a boss-priority problem, and the wrong order of summons, repairs, and burst abilities can cost the third medal.", strategy: ["Choose the boss tank before the first move and preserve Aleph-Null’s repair path.", "Separate support clearance from the boss commitment.", "Block access to the back line with Scarabs or Warriors.", "Remove healers, summoners, multi-attackers, and tank-bypass threats first.", "Preserve one burst active for the isolated boss.", "Confirm that no surviving enemy can retaliate before the final hit."], closing: "Absorb the opening, remove support threats, isolate the boss, and finish with repair and burst resources available." },
    ],
  },
];

export const bossContent = [
  { characterId: "ultraInceptorSgt", heading: "Bellator", appearances: ["Normal 15", "Elite 8"], paragraphs: ["Use Scarabs to block Bellator and his Inceptors instead of racing them for damage.", "Keep the required backline outside charge routes while Aleph-Null anchors the first exchange.", "Finish Bellator only after his summons can no longer reach a fragile Necron."] },
  { characterId: "ultraEliminatorSgt", heading: "Certus", appearances: ["Normal 30", "Elite 16"], paragraphs: ["Respect Certus’s range and use terrain to force movement before entering his firing lane.", "Offer a summon or durable anchor as the first legal target, then collapse with ranged pressure.", "Do not expose Imospekh merely to trade one shot with Certus."] },
  { characterId: "ultraTigurius", heading: "Varro Tigurius", appearances: ["Normal 45", "Elite 24"], paragraphs: ["Avoid clustering several Necrons where Varro’s psychic area damage can compromise the entire formation.", "Use Scarabs to obstruct the approach while the main roster attacks from separate but repairable positions.", "Elite 24 is a survival check: protect the weakest required Necron before maximizing damage."] },
  { characterId: "ultraApothecary", heading: "Incisus", appearances: ["Normal 60", "Elite 32"], paragraphs: ["Prioritize Incisus before committing fully to the other enemies; repeated healing can erase unfocused damage.", "Deny safe repair targets by finishing one enemy at a time.", "Hold Thutmose or another burst option for the turn Incisus becomes reachable."] },
  { characterId: "ultraCalgar", heading: "Marneus Calgar", appearances: ["Normal 75", "Elite 40"], paragraphs: ["Clear the supporting enemies that amplify pressure, then surround and burst Calgar in a controlled exchange.", "Use Scarabs or Warriors to block his route to the weakest Necron and keep the chosen tank within Aleph-Null’s repair path.", "Elite 40 rewards a turn plan more than a damage race: preserve summons and burst damage for the decisive boss turn."] },
];
