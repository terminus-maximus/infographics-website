export interface MachineIcon { src: string; width: number; height: number; count?: number; }
export interface MachineProgression {
  index: number; rarity: string; stars: number; star_label: string;
  max_ability_level: number; ability_multiplier_pct: number;
}
export interface MachineAbility {
  id: string; kind: 'active' | 'passive' | 'mythic'; name: string; icon: MachineIcon;
  template: string; description: string; unlock_progression?: number;
  values_by_progression: Record<string, Record<string, string | number> | Record<string, string | number>[]>;
}
export interface Machine {
  game_version?: string; rating_updated_on?: string;
  unit_id: string; slug: string; name: string; full_name: string; title: string;
  description: string; faction_id: string; faction: string; alliance: string;
  portrait: MachineIcon; rating: number | null; verdict: string; unlock_with: string; invest_in: string;
  default_progression: number; progression: MachineProgression[]; abilities: MachineAbility[];
}
