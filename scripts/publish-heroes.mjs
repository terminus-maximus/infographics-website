import { readFileSync, existsSync, mkdirSync, writeFileSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { assert, validateRelease, topRows } from '../src/lib/hero-scoring.mjs';
const args = process.argv.slice(2);
const get = key => args[args.indexOf(key) + 1];
const month = args.includes('--month') ? get('--month') : null;
const date = args.includes('--date') ? get('--date') : null;
assert(/^\d{4}-(0[1-9]|1[0-2])$/.test(month || '') && /^\d{4}-\d{2}-\d{2}$/.test(date || '') && date.startsWith(month), 'Provide explicit --month YYYY-MM --date YYYY-MM-DD');
assert(new Date(date).toISOString().slice(0,10) === date, 'Invalid publication date');
const root = resolve(import.meta.dirname, '..');
const research = JSON.parse(readFileSync(resolve(root,'src/data/heroes/research.json')));
validateRelease(research.release, research.relationships);
const reference = JSON.parse(readFileSync(resolve(root,'src/data/heroes/reference.json')));
const cutoffPolicy = JSON.parse(readFileSync(resolve(root,'src/data/heroes/publishing-policy.json')));
assert(cutoffPolicy.cutoff_count === 10 && typeof cutoffPolicy.include_cutoff_ties === 'boolean', 'Invalid Top 10 publishing policy');
const target = resolve(root, `src/data/heroes/releases/${month}.json`);
const attachGraphic = args.includes('--attach-graphic');
assert(attachGraphic ? existsSync(target) : !existsSync(target), attachGraphic ? `No snapshot for ${month}` : `Frozen publication exists: ${month}. Retain it; choose a new release month.`);
const snapshot = attachGraphic ? JSON.parse(readFileSync(target)) : {
  schema_version: 1, month, published_date: date, ...cutoffPolicy,
  ...research.release,
  heroes: research.release.heroes.map(row => {
    const id = research.identity.find(h => h.unit_id === row.unit_id);
    const ref = reference.heroes.find(h => h.unit_id === row.unit_id);
    assert(id && ref, `Missing snapshot identity: ${row.unit_id}`);
    return { ...row, slug:id.slug, full_name:ref.full_name, portrait:ref.portrait, assessments:research.assessments[row.unit_id] };
  }),
  graphic: null,
};
if (attachGraphic) {
  validateRelease(snapshot);
  assert(!snapshot.graphic && args.includes('--graphic-metadata'), 'Attach only to a snapshot with no graphic, with explicit --graphic-metadata');
  assert(snapshot.published_date === date, 'Keep the original publication date when attaching its graphic');
}
if (args.includes('--graphic-metadata')) {
  const graphic = JSON.parse(readFileSync(resolve(get('--graphic-metadata'))));
  assert(graphic.month === month && graphic.release_id === snapshot.id && graphic.scores_sha256 === snapshot.scores_sha256, 'Graphic association mismatch');
  assert(graphic.alt && graphic.visual_checked_by && /^\d{4}-\d{2}-\d{2}$/.test(graphic.visual_checked_date), 'Complete the documented visual graphic check first');
  assert(Number.isInteger(graphic.width) && graphic.width > 0 && Number.isInteger(graphic.height) && graphic.height > 0, 'Provide preview image dimensions');
  for (const [field, hashField, extension] of [['src','sha256','.webp'],['fullSizeSrc','fullSizeSha256','.png'],['thumbnailSrc','thumbnailSha256','.png']]) {
    const src = graphic[field];
    assert(typeof src === 'string' && src.startsWith('/images/') && !src.includes('..') && src.endsWith(extension) && existsSync(resolve(root,'public',src.slice(1))), `Missing graphic asset: ${field}`);
    graphic[hashField] = createHash('sha256').update(readFileSync(resolve(root,'public',src.slice(1)))).digest('hex');
  }
  snapshot.graphic = graphic;
}
mkdirSync(resolve(root,'src/data/heroes/releases'), { recursive: true });
if (attachGraphic) {
  writeFileSync(target+'.tmp', JSON.stringify(snapshot,null,2)+'\n');
  renameSync(target+'.tmp',target);
} else writeFileSync(target, JSON.stringify(snapshot,null,2)+'\n', { flag: 'wx' });
const pointer = resolve(root,'src/data/heroes/publication.json');
if (!attachGraphic) {
  writeFileSync(pointer+'.tmp', JSON.stringify({month},null,2)+'\n');
  renameSync(pointer+'.tmp',pointer);
}
console.log(`Frozen ${month}: ${topRows(snapshot.heroes).length} featured heroes. ${snapshot.graphic ? 'Graphic associated.' : 'HTML ranking only; infographic not yet available.'}`);
