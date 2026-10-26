import type { IncursionCharacterId, IncursionGuide, IncursionTierReward } from "./types";

// Shared recommendations from the October 26, 2026 Xenos review.
// Keep machine-specific threats and the strength of each source in its own guide.
export const mechanicalCore: IncursionCharacterId[] = ["tauCrisis", "necroSpyder", "orksWarboss"];
export const mechanicalCoreSummary = "Re’vas + Aleph-Null + Boss Gulgortz";

export const xenosRules: IncursionGuide["rules"] = [
  { title: "Repair before the last kill", text: "Use a safe enemy to buy a repair turn before ending the battle. Aleph sustains mechanical allies; organic shooters such as Sho’syl and Calandis need their own protection or healing." },
  { title: "Make room for summons", text: "Check the available hexes before calling drones, scarabs, Boyz, or Grots. A summon that cannot spawn or reach the enemy cannot protect your roster." },
  { title: "Set up overwatch kills", text: "Re’vas needs kills to keep her overwatch going. Place her where suitable enemies will enter range; a heavily protected first target can stop the chain." },
  { title: "Prepare for the whole run", text: "Health and losses carry forward. Finish upgrades before starting, keep your strongest characters alive, and choose your route and power-ups together. Active abilities are available again in each battle." },
];

export const xenosPowerNotes: IncursionGuide["powerUps"]["notes"] = [
  { name: "Extra Hits", text: "Adds two hits to normal attacks. Favor a character whose basic attack is already doing useful damage. Calandis is a recorded choice in both tracks; do not assume a buff to Sho’syl also buffs every drone attack." },
  { name: "Piercing Ratio", text: "Adds 20 percentage points of normal-attack piercing. Consider it when armour is the obstacle, especially for a low-pierce attacker; more hits alone may still leave each hit doing little damage." },
  { name: "Regeneration", text: "Restores 13% health when a deployed character enters the next battle. It supports an intact roster between fights, but does not replace an immediate repair or revive a fallen character." },
  { name: "Restoration", text: "Fully restores three selected characters. Take the recovery your current roster needs; the recorded PBC alternate branch uses it instead of a damage upgrade." },
  { name: "Harlequin", text: "Available in both Xenos tracks. The extra body can absorb an attack or spend the first hit into terminator protection. Both the Z’Kar Mythic guide and the PBC Common routes demonstrate this option." },
  { name: "Mythic relics", text: "Snotflogga’s Supa-Cybork Body enables repair-based sustain at Mythic. It does not grant the Mechanical trait. Relic effects are disabled below Mythic, so do not build a lower-tier healing plan around them." },
];

export const xenosMechanics = [
  { label: "Incursion rules & power-ups", url: "https://tacticus.wiki.gg/wiki/Incursion" },
  { label: "Re’vas", url: "https://tacticus.wiki.gg/wiki/Re%27vas" },
  { label: "Supa-Cybork Body", url: "https://tacticus.wiki.gg/wiki/Supa-Cybork_Body" },
];

// Matching tables visually transcribed from the user-supplied mow-zkar.png and
// mow-pbc.png on October 26, 2026. Rank caps describe caps, not minimum builds.
export const xenosTierRewards: IncursionTierReward[] = [
  { tier: 14, cap: "Adamantine2", initialClear: 8, raidOnly: 8, shardType: "Mythic" },
  { tier: 13, cap: "Adamantine2", initialClear: 6, raidOnly: 6, shardType: "Mythic" },
  { tier: 12, cap: "Diamond3", initialClear: 48, raidOnly: 33 },
  { tier: 11, cap: "Diamond3", initialClear: 45, raidOnly: 31 },
  { tier: 10, cap: "Diamond3", initialClear: 43, raidOnly: 29 },
  { tier: 9, cap: "Gold1", initialClear: 41, raidOnly: 27 },
  { tier: 8, cap: "Gold1", initialClear: 40, raidOnly: 25 },
  { tier: 7, cap: "Gold1", initialClear: 39, raidOnly: 23 },
  { tier: 6, cap: "Silver1", initialClear: 36, raidOnly: 21 },
  { tier: 5, cap: "Silver1", initialClear: 39, raidOnly: 19 },
  { tier: 4, cap: "Bronze1", initialClear: 34, raidOnly: 18 },
  { tier: 3, cap: "Bronze1", initialClear: 36, raidOnly: 17 },
  { tier: 2, cap: "Iron1", initialClear: 34, raidOnly: 16 },
  { tier: 1, cap: "Iron1", initialClear: 34, raidOnly: 15 },
];
