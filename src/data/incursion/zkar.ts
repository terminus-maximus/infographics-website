import type { IncursionGuide } from "./types";
import { mechanicalCore, mechanicalCoreSummary, xenosRules, xenosPowerNotes, xenosMechanics, xenosTierRewards } from "./xenos";
import { zkarStages } from "./xenos-stages";

// Source review and coverage qualifications: docs/incursion-guides.md.
export const zkarGuide: IncursionGuide = {
  slug: "zkar",
  machine: "Z’Kar",
  alliance: "Xenos",
  portrait: "/images/replay-library/mow/Zkar.webp",
  title: "Z’Kar Incursion Guide",
  seoTitle: "Z’Kar / Daemon Prince Incursion Guide | Tacticus | Terminus Maximus",
  description: "Unlock and progress Z’Kar with Xenos team cores, Re’vas and Aleph sustain, Boss and Snotflogga summons, flex options, power-ups, and tips for all 15 battles.",
  subtitle: "Xenos team cores, flex characters, and battle-by-battle tips for the Z’Kar / Daemon Prince Incursion.",
  updatedAt: "2026-10-26",
  infographic: {
    src: "/images/web/mow-zkar.webp",
    fullSizeSrc: "/images/mow-zkar.png",
    thumbnailSrc: "/images/thumbnails/mow-zkar-thumb.png",
    width: 700,
    height: 392,
    alt: "Z’Kar Incursion unlock guide with Xenos team cores, flex heroes, tier caps, and shard rewards",
  },
  overview: {
    headline: "Screen the damage. Break the armour. Keep the team alive.",
    text: "Start with Re’vas, Aleph-Null, and Boss Gulgortz if they are already developed. Snotflogga and Sho’syl complete the best-documented recent five. Summons protect the roster, Aleph repairs the mechanical core, and piercing or psychic damage helps against armoured Thousand Sons. Adapt the remaining slots to your account rather than treating one five as mandatory.",
    principles: [
      { title: "Keep a repairable core", text: "Re’vas controls approaches, Boss creates pressure, and Aleph keeps mechanical allies fighting across several battles." },
      { title: "Bring an armour answer", text: "Sho’syl or Neurothrope adds a different damage profile. Do not expect low-pierce basic attacks to solve every Rubric or terminator." },
      { title: "Read the map first", text: "Fire, isolated starting hexes, bridges, and time ghosts can change a good team’s opening. Place summons with the next turn in mind." },
    ],
  },
  strategies: [
    {
      id: "mechanical-summons", name: "Mechanical / Summons", tag: "Start here", recommended: true,
      fit: "The clearest recent five-character template.",
      core: mechanicalCore, coreSummary: mechanicalCoreSummary,
      featuredFlex: { id: "orksRuntherd", label: "Leading fourth · summons + taunt" },
      flex: ["tauMarksman"],
      flexSummary: "Add Snotflogga and Sho’syl to complete the demonstrated five. Snot supplies Grots and control; Sho supplies piercing damage while staying behind the screen.",
      principle: "Spend summons. Repair heroes.",
      explanation: "Use Boss, Snotflogga, and Aleph to put disposable bodies between the enemy and your roster. Set Re’vas where suitable targets can enter overwatch. Keep Sho safe and use his damage against targets that shrug off weaker hits. Leave Aleph a safe repair opportunity before the last original enemy falls.",
      evidence: "Caoryn’s October 2026 Tier 14 guide shows this five in all 15 result panels. cpunerd’s Mythic clips independently demonstrate Re’vas, Aleph, Boss, and Snot as a four-character team.",
      evidenceCreator: "caoryn",
      caveat: "The Tier 14 guide includes follow-up attempts for battles 5 and 9, and reports an earlier Re’vas death. It demonstrates solutions for every numbered battle, not a flawless continuous run. Snot’s repair synergy requires his Mythic relic.",
      otherOptions: {
        ids: ["tauAunShi"],
        note: "Snorri’s Tier 11 finale uses Aun’shi, Aleph, Boss, Snot, and Sho, with no Re’vas. This is a demonstrated finale alternative for an existing Aun’shi roster; it does not establish a full-route substitute.",
      },
    },
    {
      id: "psychic-support", name: "Psychic / Support", tag: "Adapt to heavy armour",
      fit: "A Neurothrope route with flexible repair and damage support.",
      core: ["tauCrisis", "orksRuntherd", "tyranNeurothrope"],
      coreSummary: "Re’vas + Snotflogga + Neurothrope",
      flex: ["necroSpyder", "orksWarboss", "eldarFarseer"],
      flexSummary: "Aleph is the usual fourth for repairs. Boss adds summons and pressure; Eldryon is the damage-support alternative. Choose two flex characters, and change the balance only when the map and roster justify it.",
      principle: "Keep the screen. Change the damage source.",
      explanation: "Use summons and Re’vas to buy Neurothrope safe attacks into armoured targets. Preserve space for Aleph to repair the mechanical frontline. Eldryon is useful when his positioning and damage support improve your attacks; avoid exposing him merely to force the buff into range.",
      evidence: "Kaiser Arctan keeps Re’vas, Snot, and Neurothrope in all 12 fights of the reviewed Tier 13 route. Aleph appears in ten; Boss and Eldryon each appear in six. These are rotations, not a six-character team.",
      evidenceCreator: "kaiser",
      caveat: "That route skips battles 5, 9, and 14. The footage supports a flexible approach, not proof that this exact composition clears every map.",
      otherOptions: {
        ids: ["eldarMauganRa", "tyranWingedPrime"],
        note: "Kaiser uses Maugan Ra once, in battle 4, and Winged Prime once, in battle 10. These are situational swaps from a developed roster, not additional required investments.",
      },
    },
    {
      id: "necron-unlock", name: "Necron-Led Unlock", tag: "Build from campaign progress",
      fit: "A lower-tier example for an account with established Necrons.",
      core: ["necroWarden", "necroSpyder", "necroDestroyer", "tauMarksman"],
      coreSummary: "Makhotep + Aleph-Null + Imospekh + Sho’syl",
      flex: ["tauCrisis"],
      flexSummary: "Use the strongest suitable fifth already on your account. Re’vas joins the recorded battle 8 after earlier supporting characters have fallen.",
      principle: "Reach the unlock with the roster you have.",
      explanation: "Let the Necron core supply movement, repair, and defensive coverage while Sho provides piercing damage. Keep Aleph alive and avoid turning an expendable fifth into a new upgrade project. Stop treating an unlock target as a demand to clear the hardest available tier.",
      evidence: "AureLuck reaches the unlock during a partial Tier 4 / Uncommon route. These four persist through the seven recorded wins: battles 1, 2, 3, 5, 6, 7, and 8.",
      evidenceCreator: "aureluck",
      caveat: "The video stops at the unlock, before the finale. Thutmose dies in battle 5 and Hollan in battle 7. This is an account example, not a tested minimum-rank or casualty-free recipe.",
    },
  ],
  powerUps: {
    introduction: "Support the team that is actually surviving your route. Caoryn’s recent Mythic guide takes Regeneration and a Harlequin; earlier footage demonstrates single-character damage upgrades. There is no proven universal pick order.",
    comparisonLabel: "Compare Extra Hits, Piercing, recovery, and Harlequins",
    approaches: [
      {
        strategyId: "mechanical-summons", heading: "Mechanical / Summons", focus: "Regeneration + Harlequin",
        text: "The Tier 14 guide chooses Regeneration before battle 4 and a Harlequin before battle 8. Recovery preserves the roster; an extra body can draw fire or consume a terminator’s opening protection.",
        link: { label: "Watch the Harlequin pick", url: "https://www.youtube.com/watch?v=AJpIaqgXnmE&t=1153s" },
      },
      {
        strategyId: "psychic-support", heading: "Psychic / Support", focus: "Useful damage, then sustain",
        text: "Choose Extra Hits for an attacker already getting damage through; consider Piercing when armour is stopping a low-pierce unit. Match the choice to your own damage dealer. Caoryn’s earlier route demonstrates Piercing on Boss on an alternate branch.",
        link: { label: "Watch the Boss Piercing pick", url: "https://www.youtube.com/watch?v=Oo4XhkPoRBo&t=763s" },
      },
      {
        strategyId: "necron-unlock", heading: "Necron-Led Unlock", focus: "Protect the remaining roster",
        text: "Prefer recovery or another protective body when losses threaten the unlock. Aleph can sustain mechanical allies, but Sho needs protection. The lower-tier example demonstrates why the fifth slot may change as a run progresses.",
        link: { label: "See the Uncommon unlock route", url: "https://www.youtube.com/watch?v=zikovHuKZv0" },
      },
    ],
    notes: xenosPowerNotes,
  },
  rules: [
    ...xenosRules,
    { title: "Open the armour, then commit", text: "Spend a cheaper attack into terminator protection before your valuable shot. Occupy time-ghost hexes to remove the revival opportunity. Sho’s piercing and Neurothrope’s psychic damage are useful options against heavy armour." },
    { title: "Respect fire and psychic setup", text: "Watch enemy psychic attacks and fire that enable Z’Kar’s cannon. Flying does not make a character immune to burning hexes. Check the end position of a move, not just whether the unit can cross the terrain." },
  ],
  stageTips: {
    introduction: "Use these notes alongside Caoryn’s Tier 14 / Mythic II chapters. Battles 5, 8, 9, and 15 are expanded because their openings deserve particular attention. Select any battle for its tip and video link.",
    caveat: "The source uses Re’vas, Aleph, Boss, Snot, and Sho. Battles 5 and 9 contain inserted follow-up attempts. Enemy strength, your power-ups, and your chosen branch can change the result; copy the positioning idea only after checking your own map.",
    stages: zkarStages,
  },
  tierRewards: xenosTierRewards,
  relatedGuides: [
    { label: "← Incursion & Machine of War basics", url: "/incursion-mow" },
    { label: "Shared Xenos core: Plagueburst Crawler →", url: "/incursion-mow/plagueburst-crawler/" },
    { label: "Chaos alternative: Biovore →", url: "/incursion-mow/biovore/" },
  ],
  research: {
    summary: "The October 2026 review combines 15 Z’Kar uploads from five creators, including Caoryn’s recent Mythic II guide. Creator agreement is counted by creator, not by number of clips. Written Reddit and Discord reports supply additional flex ideas below.",
    findings: [
      "Aleph appears somewhere in all five creators’ footage. Re’vas and Boss each appear in four of the five, with different exceptions; neither is mandatory in every demonstrated team.",
      "Snotflogga is the strongest recurring fourth for the mechanical core. Sho is the fifth in the most recent complete set of numbered-stage solutions.",
      "Neurothrope has a substantial Mythic route demonstration. Necron-led unlock footage and an Aun’shi finale show why roster-specific alternatives belong in the guide.",
    ],
    creators: [
      {
        id: "caoryn", name: "Caoryn", uploads: 2, tiers: "Tier 10 · Tier 14 / Mythic II", supports: "Mechanical / Summons + all 15 stage tips",
        observation: "The October 1, 2026 Tier 14 guide shows Re’vas, Aleph, Boss, Snot, and Sho in all 15 result panels. The December 2025 Tier 10 guide uses Calandis instead of Snot alongside the other four.",
        limitation: "Both are edited collections of all 15 numbered battles. The newer guide includes follow-ups for 5 and 9, an earlier Re’vas death, and recovery between fights. They do not establish minimum investment or an uninterrupted perfect run.",
        links: [{ label: "Tier 14 guide", url: "https://www.youtube.com/watch?v=AJpIaqgXnmE" }, { label: "Tier 10 guide", url: "https://www.youtube.com/watch?v=Oo4XhkPoRBo" }],
      },
      {
        id: "cpunerd", name: "cpunerd / kharnage", uploads: 10, tiers: "Tier 14 · selected battles", supports: "Four-character mechanical / summon core",
        observation: "The reviewed April–May 2026 clips use Re’vas, Aleph, Boss, and Snot as a four-character team, reinforcing the core independently of Caoryn’s fifth-slot choice.",
        limitation: "Ten uploads contain nine distinct fights, not ten independent demonstrations. Two uploads reuse the finale footage, and some titles disagree with the visible battle number. These clips do not cover every stage.",
        links: [{ label: "Battle 1", url: "https://www.youtube.com/watch?v=138XL-WvEg8" }, { label: "Battle 15", url: "https://www.youtube.com/watch?v=umMg5eWCUmE" }],
      },
      {
        id: "kaiser", name: "Kaiser Arctan", uploads: 1, tiers: "Tier 13 / Mythic I · 12-fight route", supports: "Psychic / Support",
        observation: "Re’vas, Snot, and Neurothrope persist in all 12 fights. Aleph appears ten times; Boss and Eldryon each appear six times. Maugan Ra and Winged Prime are single-fight alternatives.",
        limitation: "The selected route omits 5, 9, and 14. The flexible roster must not be presented as one fixed five used throughout every numbered battle.",
        links: [{ label: "Tier 13 route", url: "https://www.youtube.com/watch?v=DhdHWVagHcI" }],
      },
      {
        id: "aureluck", name: "AureLuck", uploads: 1, tiers: "Tier 4 / Uncommon · partial unlock route", supports: "Necron-Led Unlock",
        observation: "Makhotep, Aleph, Imospekh, and Sho persist through seven recorded wins. The fifth changes from Thutmose to Hollan and then Re’vas as losses accumulate.",
        limitation: "The July 2026 upload stops at the unlock after battle 8. It does not show the finale or prove the lowest possible ranks and abilities.",
        links: [{ label: "Uncommon unlock", url: "https://www.youtube.com/watch?v=zikovHuKZv0" }],
      },
      {
        id: "snorri", name: "Snorri", uploads: 1, tiers: "Tier 11 · battle 15 only", supports: "Aun’shi alternative",
        observation: "Aleph, Sho, Snot, Aun’shi, and Boss win the recorded finale without Re’vas.",
        limitation: "One finale shows that this composition can work there. Earlier battles, route choices, and full-run persistence are not established.",
        links: [{ label: "Tier 11 finale", url: "https://www.youtube.com/watch?v=TJm3d4KXCTc" }],
      },
    ],
    reports: [
      {
        title: "Eldryon + Neurothrope at Mythic II",
        text: "Sorcerous reports a clear with D3 Boss, Aleph, Eldryon, Re’vas, and Neurothrope. This supports a damage-support variant without Snot, while the stated ranks describe that player’s account rather than a minimum requirement.",
        link: { label: "September 2026 Reddit discussion", url: "https://www.reddit.com/r/WH40KTacticus/comments/1wpn4zx/what_is_the_best_team_of_xenos_for_zkar_incursion/" },
      },
      {
        title: "Farsight / Anuphet flex",
        text: "In the same discussion, another player reports Re’vas, Aleph, Farsight, Snot, and Anuphet after Anuphet’s August rework. The exact tier is not stated. Treat it as an option for an established roster, not a reason to replace a working core.",
        link: { label: "Read the roster alternatives", url: "https://www.reddit.com/r/WH40KTacticus/comments/1wpn4zx/what_is_the_best_team_of_xenos_for_zkar_incursion/" },
      },
      {
        title: "Summons + Neurothrope against terminators",
        text: "JorEl1’s August Mythic II report emphasizes summons as damage sponges, Re’vas overwatch, and Neurothrope into terminators. It corroborates the role-based approach; it is not a reviewed full-run video.",
        link: { label: "Tacticus Discord report · server access required", url: "https://discord.com/channels/874393406531596419/1195109083750084649/1542623810929430588" },
      },
    ],
    references: [...xenosMechanics, { label: "Z’Kar", url: "https://tacticus.wiki.gg/wiki/Z%27Kar" }, { label: "Fire & other hex effects", url: "https://tacticus.wiki.gg/wiki/Hex_Effect" }],
    limitations: "Research checked October 26, 2026. Footage spans December 2025–October 2026; updates may change damage thresholds and enemy behaviour. Stage notes combine reviewed footage, transcripts, and current mechanics. No source establishes a cheapest team, universal rank threshold, or guaranteed opening. The tier-cap and shard-reward table is transcribed from the supplied Z’Kar infographic.",
  },
};
