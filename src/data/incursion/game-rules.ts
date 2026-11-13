import data from './game-rules.json';
import type { IncursionTierReward } from './types';

export const incursionGameVersion = data.gameVersion;
export function incursionTierRewards(id: keyof typeof data.machines): IncursionTierReward[] {
  return data.machines[id].tierRewards.map(row => ({...row,
    cap: row.cap as IncursionTierReward['cap'],
    shardType: row.shardType === 'Mythic' ? 'Mythic' : undefined,
  }));
}
