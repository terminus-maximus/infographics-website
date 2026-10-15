import { createHash } from 'node:crypto';
import { classifySupportHero, lowestSeenSupportIds } from './campaign-events-validation.mjs';

export const requiredHeroColumns = ['Campaign', 'Hero', 'LowestSeenRank', 'LowestSeenActive', 'LowestSeenPassive', 'LowestSeenScope', 'LowestSeenSource', 'SafeBetRank', 'SafeBetActive', 'SafeBetPassive', 'SafeBetNotes'];

/** Small RFC-4180 reader: quoted commas, escaped quotes, CRLF and multiline notes. */
export function parseRequiredHeroes(csv) {
  const rows = [];
  let row = [], cell = '', quoted = false, closed = false;
  const text = csv.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') { quoted = false; closed = true; }
      else cell += char;
    } else if (char === '"') {
      if (cell || closed) throw new Error('Unexpected quote in required-heroes.csv');
      quoted = true;
    } else if (char === ',' || char === '\n' || char === '\r') {
      row.push(cell.trim()); cell = ''; closed = false;
      if (char !== ',') {
        if (row.some(Boolean)) rows.push(row);
        row = [];
        if (char === '\r' && text[i + 1] === '\n') i++;
      }
    } else {
      if (closed && char.trim()) throw new Error('Unexpected text after a quoted CSV field');
      if (!closed) cell += char;
    }
  }
  if (quoted) throw new Error('Unclosed quote in required-heroes.csv');
  if (cell || row.length) { row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); }
  const header = rows.shift() || [];
  if (header.length !== requiredHeroColumns.length || requiredHeroColumns.some((name, index) => header[index] !== name)) {
    throw new Error('Keep the required-heroes.csv column headers unchanged');
  }
  return rows.map((values, index) => {
    if (values.length !== header.length) throw new Error(`CSV row ${index + 2}: expected ${header.length} columns`);
    return Object.fromEntries(header.map((name, i) => [name, values[i]]));
  });
}

export function contentDigest(data) {
  const canonicalize = value => Array.isArray(value) ? value.map(canonicalize) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalize(value[key])])) : value;
  const payload = { characters: data.characters, events: data.events.map(({ infographic, ...event }) => event) };
  return createHash('sha256').update(JSON.stringify(canonicalize(payload))).digest('hex');
}

/** CSV owns the required trio and Lowest Seen support pair. Blank cells clear maintained values. */
export function assembleCampaignEvents(base, csv) {
  const data = structuredClone(base);
  const rows = parseRequiredHeroes(csv);
  const remaining = new Map();
  for (const row of rows) {
    const key = `${row.Campaign}\0${row.Hero}`;
    if (remaining.has(key)) throw new Error(`Duplicate CSV hero: ${row.Campaign} / ${row.Hero}`);
    remaining.set(key, row);
  }
  const unknown = () => ({ value: null, status: 'unknown', scope: null, scopeKind: null, stageIds: [], sourceIds: [], clearIds: [], note: null });
  const ability = (value, label) => {
    if (!value) return null;
    if (/^[1-9]\d*\+$/.test(value)) return value;
    if (!/^[1-9]\d*$/.test(value)) throw new Error(`${label}: use a positive whole number, optionally followed by +, or leave blank`);
    return Number(value);
  };
  for (const event of data.events) {
    const supportIds = lowestSeenSupportIds(event);
    if (supportIds.length !== 2) throw new Error(`${event.displayTitle}: Lowest Seen must identify exactly two support heroes for the CSV`);
    const csvHeroes = [...event.requiredHeroes, ...supportIds.map(id => event.supportingHeroes.find(hero => hero.heroId === id))];
    for (const hero of csvHeroes) {
      if (!hero) throw new Error(`${event.displayTitle}: Lowest Seen support hero is missing from the eligible roster`);
      const name = data.characters[hero.heroId].name;
      const key = `${event.displayTitle}\0${name}`;
      const row = remaining.get(key);
      if (!row) throw new Error(`Missing CSV hero: ${event.displayTitle} / ${name}`);
      remaining.delete(key);
      let sourceId = null;
      if (row.LowestSeenSource) {
        let url;
        try { url = new URL(row.LowestSeenSource); } catch { throw new Error(`${name}: LowestSeenSource must be a public HTTPS URL`); }
        if (url.protocol !== 'https:' || /\s/.test(row.LowestSeenSource)) throw new Error(`${name}: LowestSeenSource must be one public HTTPS URL without spaces`);
        const existing = event.sources.find(source => source.url === row.LowestSeenSource);
        sourceId = existing?.id || `editorial-${hero.heroId}`;
        if (!existing) event.sources.push({ id: sourceId, title: `${name} investment source`, url: row.LowestSeenSource, kind: 'community', author: null, publishedAt: null });
      }
      const investment = category => Object.fromEntries(['rank', 'active', 'passive'].map(field => {
        const column = category + field[0].toUpperCase() + field.slice(1);
        const value = field === 'rank' ? row[column] || null : ability(row[column], `${event.displayTitle} / ${name} / ${column}`);
        if (value === null) return [field, unknown()];
        if (category === 'LowestSeen' && !row.LowestSeenScope) throw new Error(`${name}: supply LowestSeenScope alongside Lowest Seen values`);
        const reference = [...(event.research.safeBetProposal?.heroes || []), ...(event.research.supportSafeBetProposal?.heroes || [])].find(entry => entry.heroId === hero.heroId)?.[field];
        const inferred = category === 'SafeBet' && reference?.basis === 'inferred' && String(reference.value) === String(value);
        return [field, { ...unknown(), value, status: 'editorial', note: inferred ? reference.rationale : null, scope: category === 'LowestSeen' ? row.LowestSeenScope : null, sourceIds: category === 'LowestSeen' && sourceId ? [sourceId] : [] }];
      }));
      hero.lowestSeen = investment('LowestSeen');
      const safeBet = investment('SafeBet');
      hero.safeBetScenarios = (Object.values(safeBet).some(field => field.value !== null) || row.SafeBetNotes) ? [{ id: `dan-${hero.heroId}`, label: '', objective: '', teamIds: [], conditions: row.SafeBetNotes ? [row.SafeBetNotes] : [], investment: safeBet, rationale: '', provisional: Object.values(safeBet).some(field => Boolean(field.note)) }] : [];
    }
    for (const hero of event.supportingHeroes) Object.assign(hero, classifySupportHero(event, hero.heroId));
  }
  if (remaining.size) throw new Error(`Unknown campaign/hero CSV rows: ${[...remaining.keys()].map(key => key.replace('\0', ' / ')).join(', ')}`);
  data.snapshot.contentHash = contentDigest(data);
  data.snapshot.id = `${base.snapshot.id}-${data.snapshot.contentHash.slice(0, 8)}`;
  return data;
}
