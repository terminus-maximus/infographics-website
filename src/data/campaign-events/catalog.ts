/** Shared alphabetical navigation and discovery metadata. */
export const campaignEventCatalog = [
  { slug: 'admech', name: 'AdMech', icon: 'AdeptusMechanicus', factions: ['Death Guard', 'World Eaters'], description: 'Let Rotbone and Khârn carry the fight while your required trio stays safe.' },
  { slug: 'dark-angels', name: 'Dark Angels', icon: 'DarkAngels', factions: ['Necrons'], description: 'Build around Necron healing, summons, and a strong supporting pair.' },
  { slug: 'death-guard', name: 'Death Guard', icon: 'DeathGuard', factions: ['Adepta Sororitas', 'Black Templars'], description: 'Keep Isabella close, control the battlefield with fire, and take down Mortarion.' },
  { slug: 'sisters', name: 'Sisters', icon: 'Sisterhood', factions: ['World Eaters', 'Black Legion'], description: 'Protect your required trio with shields, summons, and Khârn’s damage.' },
  { slug: 'tau', name: 'T’au', icon: 'Tau', factions: ['Genestealer Cults', 'Tyranids'], description: 'Keep your Cult alive and build Neuroparasite stacks to bring down the Riptide.' },
  { slug: 'tyranids', name: 'Tyranids', icon: 'Tyranids', factions: ['Ultramarines', 'Blood Angels'], description: 'Bring Bellator’s summons, Incisus’s healing, and a mobile damage pair.' },
] as const;

export const factionIcons: Record<string, string> = {
  'Death Guard': 'DeathGuard', 'World Eaters': 'WorldEaters', Necrons: 'Necrons',
  'Adepta Sororitas': 'Sisterhood', 'Black Templars': 'BlackTemplars', 'Black Legion': 'BlackLegion',
  'Genestealer Cults': 'Genestealers', Tyranids: 'Tyranids', Ultramarines: 'Ultramarines', 'Blood Angels': 'BloodAngels',
};
