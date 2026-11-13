// Pure selection/aggregation shared by the season page and infographic export.
export const TIERS = ['C1', 'C2', 'C3', 'C4', 'U1', 'U2', 'U3', 'U4', 'R1', 'R2', 'R3', 'R4', 'E1', 'E2', 'E3', 'E4', 'E5', 'L1', 'L2', 'L3', 'L4', 'L5', 'M1', 'M2', 'M3'];
export const POLICY = { minimumSample: 5, maximumTierDistance: 2, maximumArchetypes: 3 };

export function parseCsv(text) {
  const rows = []; let row = []; let value = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"' && quoted && text[i + 1] === '"') { value += '"'; i++; }
    else if (c === '"') quoted = !quoted;
    else if (c === ',' && !quoted) { row.push(value); value = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) {
      if (value || row.length) { rows.push([...row, value]); row = []; value = ''; }
      if (c === '\r' && text[i + 1] === '\n') i++;
    } else value += c;
  }
  if (value || row.length) rows.push([...row, value]);
  const headers = rows.shift() || [];
  if (new Set(headers).size !== headers.length) throw new Error('Duplicate CSV headers');
  return rows.map(values => Object.fromEntries(headers.map((h, i) => [h, values[i] || ''])));
}

const members = value => value.map(x => x.trim()).filter(Boolean).sort().join('|');
const splitTeam = value => (value || '').split(',').map(x => x.trim()).filter(Boolean);
export function normalizeReplays(rows) {
  const replays = []; const rejected = []; const ids = new Set();
  for (const r of rows) {
    if (r.review_status !== 'VALID_REPLAY') continue;
    const damageText = String(r.damage_final || '').replaceAll(',', '').trim();
    const heroes = [r.hero_1, r.hero_2, r.hero_3, r.hero_4, r.hero_5].map(x => (x || '').trim());
    const ordered = splitTeam(r['Team (no MoW)']);
    const full = splitTeam(r.Team);
    const key = (r.team_key || '').split('|');
    let reason = '';
    if (!/^\d+$/.test(damageText) || Number(damageText) <= 0) reason = 'Missing reviewed damage';
    else if (!TIERS.includes(r.tier_final) || !r.boss_final || !r.map || !r.team_archetype || !r.creator) reason = 'Missing reviewed metadata';
    else if (heroes.some(x => !x) || new Set(heroes).size !== 5) reason = 'Incomplete five-hero team';
    else if (members(heroes) !== members(ordered) || members(heroes) !== members(key) || members(heroes) !== members(full.slice(0, 5))) reason = 'Conflicting team fields';
    else if (full.length !== 6 || !r.MoW || full[5] !== r.MoW) reason = 'Missing or conflicting MoW';
    else if (!/^[\w-]{11}$/.test(r.video_id || '')) reason = 'Invalid video ID';
    else if (ids.has(r.video_id)) reason = 'Duplicate video ID';
    if (reason) { rejected.push({ videoId: r.video_id, reason }); continue; }
    ids.add(r.video_id);
    replays.push({ videoId: r.video_id, url: `https://www.youtube.com/watch?v=${r.video_id}`, boss: r.boss_final,
      tier: r.tier_final, map: r.map, archetype: r.team_archetype, damage: Number(damageText), heroes: ordered,
      mow: r.MoW, teamText: r.Team, teamKey: members(heroes), creator: r.creator, publishedAt: r.published_at });
  }
  return { replays, rejected };
}

const distance = (a, b) => Math.abs(TIERS.indexOf(a) - TIERS.indexOf(b));
const byDamage = (a, b) => b.damage - a.damage || a.videoId.localeCompare(b.videoId);
export function evidencePool(rows, slot, policy = POLICY) {
  const sameMap = rows.filter(r => r.boss === slot.boss && r.map === slot.map);
  // Legendary/Mythic may pool across their boundary. Epic and lower stay in
  // their own rarity; a Legendary example must not imply Epic damage evidence.
  const nearby = /^[LM]/.test(slot.tier) ? sameMap.filter(r => /^[LM]/.test(r.tier)) : sameMap.filter(r => r.tier[0] === slot.tier[0]);
  let pool = sameMap.filter(r => r.tier === slot.tier);
  let radius = 0;
  while (pool.length < policy.minimumSample && radius < policy.maximumTierDistance) {
    radius++;
    pool = nearby.filter(r => distance(r.tier, slot.tier) <= radius);
  }
  if (pool.length) return { rows: pool, kind: pool.every(r => r.tier === slot.tier) ? 'exact' : 'pooled', radius };
  // Fallback means retain their source tiers; they are not target-tier estimates.
  const candidates = sameMap.length ? sameMap : rows.filter(r => r.boss === slot.boss);
  if (!candidates.length) return { rows: [], kind: 'missing', radius: null };
  const nearest = Math.min(...candidates.map(r => distance(r.tier, slot.tier)));
  const nearestTiers = candidates.filter(r => distance(r.tier, slot.tier) === nearest);
  const preferredTier = nearestTiers.sort((a, b) => TIERS.indexOf(b.tier) - TIERS.indexOf(a.tier))[0].tier;
  return { rows: candidates.filter(r => r.tier === preferredTier), kind: sameMap.length ? 'distant-tier' : 'other-map', radius: nearest };
}

function summarizeArchetype(rows, slot, archetype) {
  const evidence = evidencePool(rows.filter(r => r.archetype === archetype), slot);
  if (!evidence.rows.length) return null;
  const sorted = [...evidence.rows].sort(byDamage);
  const lead = sorted[0];
  const sameTeam = sorted.filter(r => r.teamKey === lead.teamKey);
  // A second example is optional. A creator substitution retains the exact five heroes.
  const alternative = sameTeam.slice(1).find(r => r.creator !== lead.creator && r.damage >= lead.damage * .85 && 1 + sameTeam.filter(x => x.damage > r.damage).length <= 3);
  const companion = alternative || sameTeam[1];
  const tiers = [...new Set(sorted.map(r => r.tier))].sort((a, b) => TIERS.indexOf(a) - TIERS.indexOf(b));
  const maps = [...new Set(sorted.map(r => r.map))].sort();
  return { archetype, kind: evidence.kind, sample: sorted.length, exactSample: sorted.filter(r => r.tier === slot.tier && r.map === slot.map).length,
    average: Math.round(sorted.reduce((sum, r) => sum + r.damage, 0) / sorted.length), minimum: Math.min(...sorted.map(r => r.damage)), maximum: lead.damage,
    tiers, maps, creatorCount: new Set(sorted.map(r => r.creator)).size,
    tierCounts: Object.fromEntries(tiers.map(t => [t, sorted.filter(r => r.tier === t).length])),
    team: { heroes: lead.heroes, mow: lead.mow, sourceVideoId: lead.videoId, sample: sameTeam.length },
    examples: [lead, ...(companion ? [companion] : [])], evidenceVideoIds: sorted.map(r => r.videoId),
    maxDistance: Math.max(...sorted.map(r => distance(r.tier, slot.tier))) };
}

export function buildSeasonGuide(lineup, rows) {
  const { replays, rejected } = normalizeReplays(rows);
  const kinds = { exact: 0, pooled: 1, 'distant-tier': 2, 'other-map': 3 };
  const slots = lineup.slots.map(slot => {
    const candidates = replays.filter(r => r.boss === slot.boss);
    const recommendations = [...new Set(candidates.map(r => r.archetype))]
      .map(a => summarizeArchetype(candidates, slot, a)).filter(Boolean)
      .sort((a, b) => kinds[a.kind] - kinds[b.kind] || (b.sample >= 3 ? 1 : 0) - (a.sample >= 3 ? 1 : 0) || b.average - a.average)
      .slice(0, POLICY.maximumArchetypes);
    const exactCount = candidates.filter(r => r.map === slot.map && r.tier === slot.tier).length;
    // Only public season fields enter the guide snapshot. Map artwork is served
    // from the Replay Library; source-server links and support maps stay out.
    return { tier: slot.tier, rarity: slot.rarity, boss: slot.boss, map: slot.map,
      loop: lineup.loop.includes(slot.tier), exactCount, recommendations };
  });
  return { ...lineup, policy: POLICY, eligibleReplayCount: replays.length, rejected, slots };
}
