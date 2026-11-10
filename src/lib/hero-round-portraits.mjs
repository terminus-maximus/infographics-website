import portraits from '../data/heroes/round-portraits.json' with { type: 'json' };
import { updateHeroes } from './game-update-profiles.mjs';

export default {
  ...portraits,
  ...Object.fromEntries(updateHeroes.map(hero => [hero.unit_id,hero.round_portrait])),
};
