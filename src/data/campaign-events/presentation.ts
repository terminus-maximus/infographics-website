/** Team summaries draw only on Battle Tips that apply to the five Lowest Seen heroes. Numerical investment stays in required-heroes.csv. */
export const eventNotes: Record<string, { teamSummary: string; tips: { stage: string; title: string; text: string }[] }> = {
  'blood-angels': {
    teamSummary: 'Start with Snotflogga, Tanksmasha, and Zapspitta. The infographic recommends Gulgortz and Gibbascrapz as supports; these targets remain provisional until a complete E30 clear is available.',
    tips: [
      { stage: 'Getting started', title: 'Own the required trio for Extremis', text: 'Finish Normal and own Snotflogga, Tanksmasha, and Zapspitta before starting Extremis. Borrowed heroes are available only on Normal.' },
      { stage: 'E23 / E26', title: 'Prepare for three-hero battles', text: 'Both stages allow only the required trio at the Mythic rarity cap. Supports cannot join these battles. E24 allows five heroes in this campaign.' },
      { stage: 'E25B / E30', title: 'Relics require the gold milestone', text: 'The configured Lightning Victory limits are four rounds at E25B and five at E30. Finish within the limit with no characters lost to earn the Relic Power Fist or Vitarus.' },
      { stage: 'E30', title: 'Yarrick leads the final fight', text: 'The configured boss is Yarrick, with a Malleus Rocket Launcher supporting the enemy. The roster includes Nubari and other Imperial units. Opening moves and ability timing still await replay evidence.' },
    ],
  },
  admech: {
    teamSummary: 'Keep Corrodius and Pestillian behind Maladus and Rotbone. Group your Death Guard around Rotbone while Khârn advances on Cawl.',
    tips: [
      { stage: 'E28–29', title: 'Protect the back line', text: 'Let Khârn handle the lower enemy group. Keep Corrodius and Pestillian away from the front line while Maladus and Rotbone hold the formation.' },
      { stage: 'E30', title: 'Stay close to Rotbone', text: 'Group your Death Guard around Rotbone while Khârn advances on Cawl. If the required heroes keep falling, raise their ranks before chasing a faster clear.' },
    ],
  },
  'dark-angels': {
    teamSummary: 'Let enemies approach before sending in Aleph-Null’s scarabs, and look for high ground for Imospekh’s active. Keep Aleph-Null, Imospekh, and Thutmose alive through the fight.',
    tips: [
      { stage: 'E24', title: 'The required trio has to stand alone', text: 'This battle only allows three characters. Practise keeping Aleph-Null, Imospekh, and Thutmose alive together; stronger supports cannot help here.' },
      { stage: 'E25B / E30', title: 'Make the most of your summons', text: 'With Makhotep, keep the scarabs you want to reactivate next to him. The E30 replay lets enemies approach first, then uses scarabs and high ground for Imospekh’s active.' },
    ],
  },
  'death-guard': {
    teamSummary: 'Keep Vindicta and Roswitha close to Isabella, using Vindicta’s fire to control the approach. Save Helbrecht’s melee buff for the attack on Mortarion.',
    tips: [
      { stage: 'E25–26', title: 'Fight from a healing formation', text: 'Keep the required trio close to Isabella. Approach from the right and use Vindicta’s fire to limit the routes enemies can take into your team.' },
      { stage: 'E30', title: 'Set up your burst turn', text: 'In cpunerd’s Celestine + Helbrecht replay, clear the opening enemies and reposition before attacking Mortarion. Use Roswitha’s active, then Vindicta’s active and attack; activate Helbrecht’s buff before Isabella and Celestine attack.' },
    ],
  },
  sisters: {
    teamSummary: 'Let Khârn and Archimatos provide damage and summons while you protect the required trio. Build Wrask’s shields with opening kills and keep Tarvakh out of danger.',
    tips: [
      { stage: 'E22', title: 'Let damage and summons carry', text: 'Khârn and Archimatos provide the damage and extra bodies. Keep your required trio out of unnecessary danger.' },
      { stage: 'E24', title: 'Practise with just the trio', text: 'All three required heroes need to survive this restricted battle. Support upgrades will not solve this stage.' },
      { stage: 'E30', title: 'Build shields before trading hits', text: 'In the Abaddon replay, opening kills establish Wrask’s shields. Keep Tarvakh protected and build Abaddon’s damage buff before the next exchange.' },
    ],
  },
  tau: {
    teamSummary: 'Build Neuroparasite stacks on the Riptide while keeping Xybia and Neurothrope safe. Use Hollan to buff Judh before committing him to the attack.',
    tips: [
      { stage: 'E6', title: 'Work around Re’vas’s overwatch', text: 'With Winged Prime + Parasite, shelter at the bottom and buff Judh with Hollan. Send hybrids into overwatch before committing your team, then use Judh’s active and bring the warrior into melee.' },
      { stage: 'E24', title: 'Survival comes before speed', text: 'Keep Judh and your supports alive before chasing the lightning timer. The linked E24 replay is a one-medal victory, useful for the opening rather than a three-medal team.' },
      { stage: 'E30', title: 'Build Neuroparasite stacks', text: 'Keep Xybia and Neurothrope safe so you can maintain psychic pressure on the Riptide. The available E30 replay was recorded on a QA account.' },
    ],
  },
  tyranids: {
    teamSummary: 'Use Dante and Mephiston as your mobile pair while Bellator brings summons. Keep Incisus in healing range of the required trio through the final fight.',
    tips: [
      { stage: 'E30', title: 'Stay mobile, keep the trio healthy', text: 'Use Dante and Mephiston as your mobile pair while Bellator brings summons. Keep Incisus close enough to heal the required heroes through the final fight.' },
    ],
  },
};
