import type { IncursionGuide } from "./types";
import { mechanicalCore, mechanicalCoreSummary, xenosRules, xenosPowerNotes, xenosMechanics, xenosTierRewards } from "./xenos";
import { pbcStages } from "./xenos-stages";

// Source review and coverage qualifications: docs/incursion-guides.md.
export const plagueburstCrawlerGuide: IncursionGuide = {
  slug: "plagueburst-crawler",
  machine: "Plagueburst Crawler",
  alliance: "Xenos",
  portrait: "/images/replay-library/mow/PBC.webp",
  title: "Plagueburst Crawler Incursion Guide",
  seoTitle: "Plagueburst Crawler / PBC Incursion Guide | Tacticus | Terminus Maximus",
  description: "Build a Xenos team for the Plagueburst Crawler Incursion with mechanical sustain, ranged and organic summon options, power-up priorities, and tips for all 15 battles.",
  subtitle: "Xenos team cores, flex characters, and battle-by-battle tips for the Plagueburst Crawler / PBC Incursion.",
  updatedAt: "2026-10-26",
  infographic: {
    src: "/images/web/mow-pbc.webp",
    fullSizeSrc: "/images/mow-pbc.png",
    thumbnailSrc: "/images/thumbnails/mow-pbc-thumb.png",
    width: 700,
    height: 392,
    alt: "Plagueburst Crawler Incursion unlock guide with Xenos team cores, flex heroes, tier caps, and shard rewards",
  },
  overview: {
    headline: "Repair the frontline. Protect the back line. Control the contagion.",
    text: "Re’vas, Aleph-Null, and Boss Gulgortz are a strong shared starting point with Z’Kar. For PBC, the main challenge is preserving that team through grenades, spreading contagion, and dangerous support characters. Add Snotflogga for summons and control, then choose a fifth that fits your investment. A separate organic summon team also has a recorded Common-tier unlock.",
    principles: [
      { title: "Use mechanical sustain", text: "Aleph can repair Re’vas and Boss between enemy attacks. Keep space to rotate a damaged unit out of the firing line." },
      { title: "Separate the hazards", text: "Mechanical units avoid the contamination hex’s armour penalty. They still suffer the Contagions of Nurgle aura; they are not immune to the track’s hazards." },
      { title: "Remove the support", text: "Rotbone prolongs fights, Corrodius changes enemy reach, and Typhus punishes exposed characters. Solve those threats before chasing incidental damage." },
    ],
  },
  strategies: [
    {
      id: "mechanical-summons", name: "Mechanical / Summons", tag: "Start here", recommended: true,
      fit: "Reuse the Xenos core and add bodies that protect it.",
      core: mechanicalCore, coreSummary: mechanicalCoreSummary,
      featuredFlex: { id: "orksRuntherd", label: "Leading fourth · summons + taunt" },
      flex: ["orksBigMek", "tauMarksman"],
      flexSummary: "Snot is the leading fourth. Gibbascrapz completes a reported Mythic II clear; Sho is a piercing-damage option if already developed. Sho’s role is inferred from the shared Xenos toolkit, not established by the reviewed PBC full-stage video.",
      principle: "Let the summons take the dangerous turn.",
      explanation: "Screen the mechanical core with scarabs, Boyz, and Grots. Use Re’vas to punish an approach and Aleph to repair survivors. Snot can control a priority enemy when his taunt is available. At Mythic, the right relics expand the repair plan; below Mythic, protect organic Orks instead of assuming Aleph can sustain them.",
      evidence: "Caoryn demonstrates Re’vas, Aleph, and Boss throughout the Tier 12 stage collection. A separate Reddit report clears Mythic II with those three plus Snot and Gibba; that modern five is self-reported rather than video-verified here.",
      evidenceCreator: "caoryn",
      caveat: "The Mythic report uses developed characters and relics. Snot’s Supa-Cybork Body allows repair but does not make him Mechanical or exempt him from contamination. Do not carry that relic-dependent sustain plan into a lower rarity cap.",
    },
    {
      id: "ranged-support", name: "Ranged Support", tag: "Recorded Legendary template",
      fit: "Use developed Aeldari shooters behind the repairable core.",
      core: mechanicalCore, coreSummary: mechanicalCoreSummary,
      flex: ["eldarRanger", "eldarMauganRa"],
      flexSummary: "Calandis and Maugan Ra complete the exact five in Caoryn’s Tier 12 guide. They add ranged damage, but neither can rely on Aleph for repairs.",
      principle: "Tank with repairable units. Shoot from safety.",
      explanation: "Use scarabs, Boss, and Re’vas to draw attacks while Calandis and Maugan work from safe positions. Keep the shooters out of grenade splash behind the bait unit. Account for deep-striking terminators and Corrodius’s movement support before choosing a firing hex.",
      evidence: "Re’vas, Aleph, Boss, Calandis, and Maugan appear in all 15 result panels of Caoryn’s March 2025 Tier 12 guide. The route demonstrates Extra Hits on Calandis.",
      evidenceCreator: "caoryn",
      caveat: "This footage predates later character changes and Mythic relics. Use it for positioning, attack order, and the demonstrated team; do not assume the same damage thresholds in the current game.",
    },
    {
      id: "organic-summons", name: "Organic Summons", tag: "Recorded Common unlock",
      fit: "An alternative for an account with Genestealers and Tyranids.",
      core: ["genesMagus", "genesPrimus", "genesBiophagus"],
      coreSummary: "Xybia + Isaak + Hollan",
      flex: ["tyranWingedPrime", "tyranParasite"],
      flexSummary: "Winged Prime and Parasite complete the recorded five. This is a distinct organic team with Hollan for healing, rather than an Aleph repair composition.",
      principle: "Flood the approaches. Heal the actual roster.",
      explanation: "Use the team’s summons to absorb attacks and hold space while Hollan supports the organic characters. Additional Harlequins strengthen the disposable screen. This path makes sense when those characters and their abilities are already developed; the mechanical core is not a prerequisite for unlocking PBC.",
      evidence: "Enquiring Newt uses the same five across 20 recorded battles in two Common routes. Starting from zero shards, the video reaches 42/40 and unlocks PBC after Tier 2 battle 7, then continues the route.",
      evidenceCreator: "enquiring-newt",
      caveat: "This demonstrates a Common unlock on that account. It is not evidence for a Legendary or Mythic clear, nor proof of minimum ability levels or the cheapest investment path.",
    },
  ],
  powerUps: {
    introduction: "Pick for the roster and damage it is taking. PBC has recorded examples of Extra Hits on Calandis, Restoration on an alternate branch, and repeated Harlequin picks on Common routes. Recovery becomes more valuable when the next fight would otherwise start with exposed survivors.",
    comparisonLabel: "Compare Extra Hits, Piercing, recovery, and Harlequins",
    approaches: [
      {
        strategyId: "mechanical-summons", heading: "Mechanical / Summons", focus: "Keep the core functional",
        text: "Take recovery when your roster needs it; add damage only if the team can survive to use it. Caoryn’s alternate battle 6 branch has Restoration, a useful example of choosing immediate recovery over another offensive bonus.",
        link: { label: "Watch the Restoration branch", url: "https://www.youtube.com/watch?v=Ig0Wjv0H7D8&t=1159s" },
      },
      {
        strategyId: "ranged-support", heading: "Ranged Support", focus: "Extra Hits on Calandis",
        text: "The Tier 12 guide gives Calandis Extra Hits, strengthening a normally single-hit attack. Keep her out of splash damage so the offensive upgrade continues paying off across later battles.",
        link: { label: "Watch the Calandis pick", url: "https://www.youtube.com/watch?v=Ig0Wjv0H7D8&t=1758s" },
      },
      {
        strategyId: "organic-summons", heading: "Organic Summons", focus: "Harlequins + Hollan sustain",
        text: "Enquiring Newt selects two Harlequins in each recorded Common route. More disposable bodies complement the summons and keep pressure away from the characters Hollan needs to sustain.",
        link: { label: "See the Common unlock routes", url: "https://www.youtube.com/watch?v=PhSav7_wc3Q" },
      },
    ],
    notes: xenosPowerNotes,
  },
  rules: [
    ...xenosRules,
    { title: "Give grenades empty splash hexes", text: "Do not line up fragile shooters behind the character or summon taking the grenade. Pestillian’s death explosion is another reason to leave space. Preserve organics instead of assuming all damage is repairable." },
    { title: "Watch contagion and support", text: "The contagion aura expands as the fight continues and enables PBC pressure. Mechanical status does not prevent its armour reduction. Remove Rotbone when practical, check Corrodius’s reach boost, and use summons to absorb Typhus’s dangerous opening." },
  ],
  stageTips: {
    introduction: "These 15 notes follow Caoryn’s Tier 12 / Legendary III stage collection. Battles 7, 9, 12, and 15 are expanded for their priority threats. Each entry links directly to the corresponding recorded fight.",
    caveat: "The March 2025 source uses Re’vas, Aleph, Boss, Calandis, and Maugan. Battle 6 is an inserted alternate branch with Restoration. Apply the positioning lessons to your current roster and map; these are not verified current-Mythic openings.",
    stages: pbcStages,
  },
  tierRewards: xenosTierRewards,
  relatedGuides: [
    { label: "← Incursion & Machine of War basics", url: "/incursion-mow" },
    { label: "Shared Xenos core: Z’Kar →", url: "/incursion-mow/zkar/" },
    { label: "Chaos alternative: Biovore →", url: "/incursion-mow/biovore/" },
  ],
  research: {
    summary: "The reviewed PBC gameplay consists of two uploads from two creators: a Legendary collection covering all 15 numbered battles and two Common routes showing an unlock. Later Reddit and Discord reports add Mythic options without being counted as additional video proof.",
    findings: [
      "Re’vas, Aleph, and Boss form the durable core of the Legendary demonstration. Calandis and Maugan complete that recorded five.",
      "A later Mythic II player report replaces the ranged pair with Snot and Gibba, supported by substantial investment and relics.",
      "The organic Common unlock uses neither Re’vas nor Aleph nor Boss. An established summon roster is a real alternative, while its high-tier ceiling remains unverified here.",
    ],
    creators: [
      {
        id: "caoryn", name: "Caoryn", uploads: 1, tiers: "Tier 12 / Legendary III · all 15 numbered battles", supports: "Mechanical core + Ranged Support + stage tips",
        observation: "The March 18, 2025 guide shows Boss, Re’vas, Aleph, Calandis, and Maugan in all 15 result panels. It includes a Calandis Extra Hits pick and an alternate branch using Restoration.",
        limitation: "Battle 6 is inserted from another branch. The collection is not one continuous run, and the footage predates later reworks and Mythic relics. It does not validate a current Mythic team or minimum investment.",
        links: [{ label: "Tier 12 guide", url: "https://www.youtube.com/watch?v=Ig0Wjv0H7D8" }],
      },
      {
        id: "enquiring-newt", name: "Enquiring Newt", uploads: 1, tiers: "Tiers 1–2 / Common · 20 recorded battles", supports: "Organic Summons unlock",
        observation: "The March 19, 2025 video shows Xybia, Isaak, Hollan, Winged Prime, and Parasite throughout both ten-battle routes. Each visits battles 1, 3, 4, 5, 7, 8, 9, 10, 11, and 12. PBC unlocks after Tier 2 battle 7.",
        limitation: "The two routes are one creator’s evidence. Developed abilities matter even under the Common rank cap. This does not establish a minimum-cost unlock or performance above Common.",
        links: [{ label: "Common routes", url: "https://www.youtube.com/watch?v=PhSav7_wc3Q" }, { label: "Unlock result", url: "https://www.youtube.com/watch?v=PhSav7_wc3Q&t=1599s" }],
      },
    ],
    reports: [
      {
        title: "Snot + Gibba at Mythic II",
        text: "LeFlyt reports all three-medal clears with Re’vas, Aleph, Boss, Snot, and Gibba. The account had D3 Re’vas and Aleph, Adamantine II Boss, roughly D2.5 Snot and Gibba, and multiple Mythic relics. These are the reported investments, not a minimum recommendation.",
        link: { label: "Read the Mythic II Reddit report", url: "https://www.reddit.com/r/WH40KTacticus/comments/1uhy0fm/best_xenos_for_incursion/" },
      },
      {
        title: "Grot taunt against Typhus",
        text: "BunsBunsCat’s August 2026 Mythic I discussion describes using a Grot taunt to deny Typhus his active. Try it when the opening, spawn hexes, and enemy order allow it; do not assume Typhus always moves first on every tier or setup.",
        link: { label: "Tacticus Discord tip · server access required", url: "https://discord.com/channels/874393406531596419/1288160193989050428/1542920619199570050" },
      },
    ],
    references: [...xenosMechanics, { label: "Contagions of Nurgle", url: "https://tacticus.wiki.gg/wiki/Contagions_of_Nurgle" }, { label: "Contamination & other hex effects", url: "https://tacticus.wiki.gg/wiki/Hex_Effect" }, { label: "Plague Marines", url: "https://tacticus.wiki.gg/wiki/Plague_Marine_%28NPC%29" }],
    limitations: "Research checked October 26, 2026. The reviewed videos are from March 2025; later Mythic claims are written community reports. Positioning and roster-preservation lessons are better supported than current damage breakpoints. No minimum ranks, guaranteed openings, or universal five are established. The tier-cap and shard-reward table is transcribed from the supplied PBC infographic.",
  },
};
