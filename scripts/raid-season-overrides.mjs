import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SITE, sha256 } from './raid-season-source.mjs';
import { validateEvidenceOverrides } from '../src/lib/raidSeasonGuide.mjs';

export function loadEvidenceOverrides(lineup, { site = SITE } = {}) {
  const path = resolve(site, `src/data/guild-raid/s${lineup.season}-evidence-overrides.json`);
  if (!existsSync(path)) return { overrides: null, overridesSha256: null };
  const text = readFileSync(path, 'utf8');
  const overrides = JSON.parse(text);
  validateEvidenceOverrides(lineup, overrides);
  return { overrides, overridesSha256: sha256(text) };
}
