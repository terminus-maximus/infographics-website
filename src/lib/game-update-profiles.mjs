import reference from '../data/updates/1.44.120-reference.json' with { type: 'json' };
import profiles from '../data/updates/1.44.120-profiles.json' with { type: 'json' };
import { assert, MODES } from './hero-scoring.mjs';

assert(reference.game_version === profiles.game_version, 'Game update profile version mismatch');
const pending = Object.fromEntries(MODES.map(mode => [mode, null]));
/** Additions are separate from the frozen scoring release until they are assessed. */
export const updateHeroes = profiles.heroes.map(profile => {
  const ref = reference.heroes.find(hero => hero.unit_id === profile.unit_id);
  assert(ref && profile.summary.trim(), `Missing game update hero: ${profile.unit_id}`);
  return {...ref, slug:profile.slug, availability_status:'game_version_1_44', updated_on:profiles.reviewed_on,
    overall:{unit_id:ref.unit_id,name:ref.name,...pending,equal_weight_average:null,final_score:null,
      guide_bonus:0,rank:null,status:'pending',missing_modes:MODES,guide_categories:[],guides:[]},
    assessments:Object.fromEntries(MODES.map(mode => [mode,{recommended_score:null,display_score:null,
      short_justification:'Assessment pending.',score_status:'pending',last_updated:profiles.reviewed_on}])),
    guides:[]};
});
export const updateHeroSummaries = Object.fromEntries(profiles.heroes.map(hero => [hero.unit_id,{tone:'pending',text:hero.summary}]));
export const updateMachines = profiles.machines.map(profile => {
  const ref = reference.machines.find(machine => machine.unit_id === profile.unit_id);
  assert(ref, `Missing game update machine: ${profile.unit_id}`);
  return {...ref,...profile,rating_updated_on:profiles.reviewed_on};
});
assert(updateHeroes.length === reference.heroes.length && updateMachines.length === reference.machines.length, 'Unregistered game update profile');
