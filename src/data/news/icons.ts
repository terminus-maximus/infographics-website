import research from '../heroes/research.json';
import portraits from '../heroes/round-portraits.json';

export interface NewsIcon {
  label: string;
  src: string;
  href?: string;
}

const roundPortraits: Record<string, { src: string }> = portraits;

export function heroIcon(slug: string, label?: string): NewsIcon {
  const hero = research.identity.find(hero => hero.slug === slug);
  const portrait = hero && roundPortraits[hero.unit_id];
  if (!hero || !portrait) throw new Error(`Missing news hero portrait: ${slug}`);
  return { label: label || hero.name, src: portrait.src, href: `/heroes/${slug}/` };
}

export const darasIcon: NewsIcon = { label: 'Daras Carrow', src: '/images/hero-round/Daras.webp', href: '/heroes/daras/' };
export const boudicariIcon: NewsIcon = { label: 'Boudicari Feldorus', src: '/images/machines/round/Boudicari.webp', href: '/incursion-mow/boudicari/' };
export const tsonjiIcon: NewsIcon = { label: 'Tson’ji (Machine of War)', src: '/images/machines/round/tauBroadside.webp', href: '/incursion-mow/tsonji/' };

const factionFiles: Record<string, string> = {
  'Adeptus Mechanicus': 'AdeptusMechanicus',
  'Astra Militarum': 'AstraMilitarum',
  'Adepta Sororitas': 'Sisterhood',
  'Adeptus Custodes': 'Custodes',
  'Ultramarines': 'Ultramarines',
  'Adeptus Astartes': 'AdeptusAstartes',
  'Leagues of Votann': 'LeaguesOfVotann',
  'Blood Angels': 'BloodAngels',
  'Black Templars': 'BlackTemplars',
  'Dark Angels': 'DarkAngels',
  'Space Wolves': 'SpaceWolves',
  'Orks': 'Orks',
  'T’au Empire': 'Tau',
  'Tyranids': 'Tyranids',
  'Genestealer Cults': 'Genestealers',
  'Necrons': 'Necrons',
  'Aeldari': 'Aeldari',
  'Black Legion': 'BlackLegion',
  'Thousand Sons': 'ThousandSons',
  'Death Guard': 'DeathGuard',
  'World Eaters': 'WorldEaters',
};

export function factionIcon(name: string): NewsIcon {
  const file = factionFiles[name];
  if (!file) throw new Error(`Missing news faction icon: ${name}`);
  return { label: name, src: `/images/faction-game/${file}.webp` };
}

const bossFiles: Record<string, string> = {
  'Ghazghkull': 'Ghaz', 'Mortarion': 'Mortarion', 'Szarekh': 'Szarekh',
  'Lion El’Jonson': 'Lion', 'Magnus': 'Magnus', 'Riptide': 'Riptide',
  'Belisarius Cawl': 'Cawl', 'Rogal Dorn': 'Dorn', 'Avatar of Khaine': 'Avatar',
};

export function bossIcon(name: string): NewsIcon {
  const file = bossFiles[name];
  if (!file) throw new Error(`Missing news boss icon: ${name}`);
  return { label: name, src: `/images/replay-library/bosses/${file}.webp` };
}

const rewardLabels: Record<string, string> = {
  'coins': 'Coins', 'ability-badge-draft': 'Ability-badge draft',
  'claimed-skulls': 'Claimed Skulls', 'imperial-equipment': 'Imperial equipment',
  'requisition': 'Requisition Order', 'blessed-requisition': 'Blessed Requisition', 'energy': 'Energy',
};

export function rewardIcon(key: string): NewsIcon {
  const label = rewardLabels[key];
  if (!label) throw new Error(`Missing news reward icon: ${key}`);
  return { label, src: `/images/news/rewards/${key}.webp` };
}

export const ancientInscription: NewsIcon = { label: 'Ancient Inscription', src: '/images/campaign-events/rewards/upgHpM003.webp' };
export const mutantForm: NewsIcon = { label: 'Mutant Form', src: '/images/campaign-events/rewards/upgHpM002.webp' };
export const relicBoltPistol: NewsIcon = { label: 'Relic Bolt Pistol', src: '/images/hero-profile/relics/R_Crit_RelicBoltPistol.webp' };
