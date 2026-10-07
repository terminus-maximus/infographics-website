export interface LreRequirement {
  id: string;
  label: string;
  points: number;
}

export interface LreTrack {
  id: string;
  name: string;
  enemyFaction: string;
  excludedGroups: string[];
  requirements: LreRequirement[];
}

export interface LreCharacter {
  id: string;
  name: string;
  faction: string;
  portrait: string;
  // null means the character's faction is excluded from this track.
  eligibility: Record<string, string[] | null>;
}

export interface LrePlannerData {
  characterBuild: string;
  tracks: LreTrack[];
  characters: LreCharacter[];
}

export function eligibleCharacters(characters: LreCharacter[], trackId: string, requirements: string[] = []) {
  return characters.filter(character => {
    const matches = character.eligibility[trackId];
    return matches != null
      && requirements.every(id => matches.includes(id));
  });
}

export function selectedPoints(track: LreTrack, requirements: string[]) {
  return track.requirements.filter(requirement => requirements.includes(requirement.id))
    .reduce((total, requirement) => total + requirement.points, 0);
}

export function highPointsCombinations(characters: LreCharacter[], track: LreTrack) {
  const combinations = [];
  for (let mask = 1; mask < 2 ** track.requirements.length; mask++) {
    const requirements = track.requirements.filter((_, index) => mask & (1 << index));
    if (requirements.length < 2) continue;
    const ids = requirements.map(requirement => requirement.id);
    const pool = eligibleCharacters(characters, track.id, ids);
    if (pool.length < 3) continue;
    combinations.push({ requirements, characters: pool, points: selectedPoints(track, ids) });
  }
  return combinations.sort((a, b) => b.points - a.points || b.characters.length - a.characters.length).slice(0, 12);
}
