import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { Marked } from 'marked';
import referenceData from '../data/heroes/reference.json' with { type: 'json' };
import relicData from '../data/heroes/relics.json' with { type: 'json' };
import researchData from '../data/heroes/research.json' with { type: 'json' };
import { updateHeroes } from './game-update-profiles.mjs';
import { assert, validateRelease, nameOrder, MODES } from './hero-scoring.mjs';
const dataRoot = resolve(process.cwd(), 'src/data/heroes');
const read = name => JSON.parse(readFileSync(resolve(dataRoot,name),'utf8'));
export const research = researchData;
/** @type {typeof import('../data/heroes/reference.json')} */
export const reference = referenceData;
/** @type {import('./hero-types').Release} */
export const currentRelease = research.release;
validateRelease(currentRelease, research.relationships);
assert(reference.snapshot.app_version === '1.44.88', 'Unexpected reference version');
assert(relicData.snapshot.app_version === reference.snapshot.app_version && relicData.snapshot.config_full_hash === reference.snapshot.config_full_hash, 'Relic/reference snapshot mismatch');
const referenceById = new Map(reference.heroes.map(h => [h.unit_id,h]));
assert(referenceById.size === reference.heroes.length, 'Duplicate reference identities');
assert(referenceById.size === research.identity.length + updateHeroes.length, 'Reference/research roster mismatch');
const scoresById = new Map(currentRelease.heroes.map(h => [h.unit_id,h]));
/** @type {import('./hero-types').Hero[]} */
export const heroes = research.identity.map(identity => {
  const ref = referenceById.get(identity.unit_id);
  const score = scoresById.get(identity.unit_id);
  assert(ref && score && research.assessments[identity.unit_id], `Missing hero: ${identity.unit_id}`);
  for (const mode of MODES) assert(research.assessments[identity.unit_id][mode].recommended_score === score[mode], `Current mode mismatch: ${identity.unit_id}/${mode}`);
  return { ...ref, ...identity, relics:relicData.relics.filter(relic => relic.hero_ids.includes(identity.unit_id)), overall:score, assessments:research.assessments[identity.unit_id], guides:research.relationships[identity.unit_id] };
}).concat(updateHeroes).sort(nameOrder);
assert(new Set(heroes.map(h => h.unit_id)).size === heroes.length, 'Duplicate hero ID across game versions');
assert(new Set(heroes.map(h => h.slug)).size === heroes.length && heroes.every(h => !['top-10','factions','index','scoring'].includes(h.slug)), 'Duplicate/reserved slugs');
export const heroById = new Map(heroes.map(h => [h.unit_id,h]));
export const heroHref = hero => `/heroes/${hero.slug}/`;
export const heroHrefById = unitId => {
  const hero = heroById.get(unitId);
  assert(hero, `Missing Hero Guide for character ${unitId}`);
  return heroHref(hero);
};
/** @type {import('./hero-types').Publication|null} */
export const publication = existsSync(resolve(dataRoot,'publication.json')) ? read(`releases/${read('publication.json').month}.json`) : null;
if (publication) validateRelease(publication);
const graphic = publication?.graphic;
export const graphicValid = Boolean(graphic && graphic.month === publication.month && graphic.release_id === publication.id && graphic.scores_sha256 === publication.scores_sha256 && graphic.visual_checked_by && graphic.visual_checked_date && [
  [graphic.src, graphic.sha256],
  [graphic.fullSizeSrc, graphic.fullSizeSha256],
  [graphic.thumbnailSrc, graphic.thumbnailSha256],
].every(([src, hash]) => typeof src === 'string' && src.startsWith('/images/') && !src.includes('..') && existsSync(resolve(process.cwd(),'public',src.slice(1))) && createHash('sha256').update(readFileSync(resolve(process.cwd(),'public',src.slice(1)))).digest('hex') === hash));
export const publicationGraphic = graphicValid ? graphic : null;
export const readableDate = value => value ? new Intl.DateTimeFormat('en-US', { year:'numeric',month:'short',day:'numeric',timeZone:'UTC' }).format(new Date(value.slice(0,10)+'T12:00:00Z')) : null;
export const monthLabel = value => new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(value+'-01T12:00:00Z'));
export const statusLabel = value => value?.replace(/_/g,' ');
export function publicMarkdown(text = '') {
  const escape = value => value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  return new Marked({ renderer: {
    html: ({text}) => escape(text),
    link({ href, tokens }) { const label = this.parser.parseInline(tokens); return /^https?:\/\//.test(href) ? `<a href="${escape(href)}" rel="noopener noreferrer">${label}</a>` : label; },
    image: ({text}) => escape(text),
  }}).parse(text);
}
