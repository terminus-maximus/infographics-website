import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { highPointsCombinations } from '../src/lib/lrePlanner.ts';

/** Match only the combinations actually offered by each LRE planner track. */
export function highPointsHeroMatches(data) {
  const matches = {};
  for (const track of data.tracks) {
    for (const combination of highPointsCombinations(data.characters,track)) {
      const evidence = {track:track.id,requirements:combination.requirements.map(requirement=>requirement.id),points:combination.points};
      for (const character of combination.characters) (matches[character.id] ??= []).push(evidence);
    }
  }
  return matches;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const root=resolve(import.meta.dirname,'../src/data/lre');
  const read=name=>JSON.parse(readFileSync(resolve(root,name),'utf8'));
  const sources=read('sources.json');
  console.log(JSON.stringify(Object.fromEntries(Object.keys(sources.events).map(slug=>[slug,highPointsHeroMatches(read(`${slug}.json`))]))));
}
