import characterData from '../data/campaigns/characters.json';
import { machines, machineHref } from './machines.mjs';

// The campaign character catalog already carries Char_XREF's Terminus_name.
const characters: Record<string, { shortName: string }> = characterData.characters;
export const terminusHeroName = (unitId: string, fallback: string) => characters[unitId]?.shortName || fallback;

const machineLabels: Record<string, string> = {
  tyranBiovore: 'Bio', adeptExorcist: 'Exo', blackForgefiend: 'FF',
  ultraDreadnought: 'Gala', astraOrdnanceBattery: 'MRL', deathCrawler: 'PBC',
  necroReanimator: 'Rean', orksRukkatrukk: 'Rukka', darkaStormSpeeder: 'SS',
  tauBroadside: 'Tson', thousDaemonPrince: 'Zkar',
};
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const machinesByToken = new Map(machines.flatMap(machine =>
  [machine.name, machine.full_name, machine.slug, machine.unit_id, machineLabels[machine.unit_id]]
    .filter(Boolean).map(token => [normalize(token), machine] as const)
));

export function replayMachineGuide(token: string) {
  const machine = machinesByToken.get(normalize(token));
  if (!machine) throw new Error(`Missing Incursion guide for MoW: ${token}`);
  return { name: machine.name, label: machineLabels[machine.unit_id] || machine.name, href: machineHref(machine) };
}
