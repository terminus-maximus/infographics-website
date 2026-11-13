import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { heroes, reference, research, currentRelease, publication, graphicValid } from '../src/lib/heroes.mjs';
import { assert, validateRelease, topRows } from '../src/lib/hero-scoring.mjs';
import { abilityDescription, relicDescription, traitDescription } from '../src/lib/hero-reference.mjs';
import { overallSummaries, overallSummary } from '../src/lib/hero-summaries.mjs';
import { popularityBenchmark, popularityInsight } from '../src/lib/hero-popularity.mjs';
import topSummaries from '../src/data/heroes/top-10-summaries.json' with { type: 'json' };
import { highPointsHeroMatches } from './hero-lre-links.mjs';
import { loadTeamGuideRelationships } from './hero-team-links.mjs';
import roundPortraits from '../src/lib/hero-round-portraits.mjs';
const root = resolve(import.meta.dirname,'..');
const buildRoot = process.env.TM_BUILD_DIR || resolve(root,'dist');
const built = process.argv.includes('--built');
const sha = value => createHash('sha256').update(value).digest('hex');
const pathForUrl = url => resolve(buildRoot,url.split('#')[0].replace(/^\//,''),'index.html');
const coverage = {roster:heroes.length,ranked:heroes.filter(h=>h.overall.final_score!==null).length,pending:heroes.filter(h=>h.overall.final_score===null).length,bonus:heroes.filter(h=>h.overall.guide_bonus>0).length};
const icons = JSON.parse(readFileSync(resolve(root,'src/data/heroes/profile-icons.json'),'utf8'));
const relicData = JSON.parse(readFileSync(resolve(root,'src/data/heroes/relics.json'),'utf8'));
assert(isDeepStrictEqual(relicData.snapshot,reference.snapshot),'Relic snapshot mismatch');
assert(new Set(relicData.relics.map(relic=>relic.id)).size===relicData.coverage.relics,'Duplicate Relic IDs or wrong coverage');
const relicOwners = relicData.relics.flatMap(relic=>relic.hero_ids);
assert(relicOwners.length===new Set(relicOwners).size && relicOwners.length===relicData.coverage.heroes,'Relic owner coverage mismatch');
assert(relicOwners.every(id=>heroes.some(hero=>hero.unit_id===id)),'Unknown Relic owner');
for (const relic of relicData.relics) {
  assert(relic.rank===10 && relic.ranks.length===10 && relicDescription(relic,10)===relic.description,`Wrong Relic default: ${relic.id}`);
  for(let rank=1;rank<=10;rank++) assert(!/\{\[|undefined|<[^>]*>/.test(relicDescription(relic,rank)),`Unresolved Relic rank: ${relic.id}/${rank}`);
  assert(relic.icon.src.startsWith('/images/hero-profile/relics/') && relic.icon.src.endsWith('.webp') && !relic.icon.src.includes('..'),`Invalid Relic icon path: ${relic.id}`);
  assert(sha(readFileSync(resolve(root,'public',relic.icon.src.slice(1))))===relic.icon.sha256,`Relic icon hash mismatch: ${relic.id}`);
}
const thumbnails = JSON.parse(readFileSync(resolve(root,'src/data/heroes/guide-thumbnails.json'),'utf8'));
const lreSources = JSON.parse(readFileSync(resolve(root,'src/data/lre/sources.json'),'utf8'));
const lreMatches = Object.fromEntries(Object.keys(lreSources.events).map(slug=>[slug,highPointsHeroMatches(JSON.parse(readFileSync(resolve(root,`src/data/lre/${slug}.json`),'utf8')))]));
const teamLinks = loadTeamGuideRelationships();
const builtGuideCache = new Map();
const benchmark = popularityBenchmark(heroes);
assert(reference.ranks.at(-1).name === 'Adamantine Rank II' && reference.ranks.at(-1).index === 19,'Available ranks must stop at Adamantine II');
assert(isDeepStrictEqual(Object.keys(icons.ranks),reference.ranks.map(rank=>String(rank.index))),'Rank icon choices differ from available ranks');
for (const group of ['rarities','stars','ranks','stats','abilities','modes']) for (const icon of Object.values(icons[group])) {
  assert(icon.src.endsWith('.webp') && existsSync(resolve(root,'public',icon.src.slice(1))),`Missing WebP icon: ${icon.src}`);
}
assert(heroes.length === reference.coverage.heroes, 'Reference coverage mismatch');
assert(isDeepStrictEqual(Object.keys(overallSummaries).sort(),heroes.map(hero=>hero.unit_id).sort()),'Overall summary roster mismatch');
for (const hero of heroes) {
  overallSummary(hero.unit_id,hero.overall.final_score);
  assert(roundPortraits[hero.unit_id]?.src.endsWith('.webp') && existsSync(resolve(root,'public',roundPortraits[hero.unit_id].src.slice(1))),`Missing circular portrait: ${hero.unit_id}`);
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(hero.slug),`Invalid slug: ${hero.slug}`);
  if (hero.portrait?.src) assert(existsSync(resolve(root,'public',hero.portrait.src.slice(1))), `Missing mapped portrait: ${hero.unit_id}`);
  else console.warn(`Portrait unavailable: ${hero.unit_id}; neutral fallback will render.`);
  assert(hero.portrait.width>0 && hero.portrait.height>0, `Invalid portrait dimensions: ${hero.unit_id}`);
  const contexts = hero.progression.filter(p=>p.unlocked);
  const initial = contexts.find(p=>p.index===hero.default_progression);
  assert(initial?.rarity === 'Mythic' && initial.stars === 14 && hero.default_rank === 19 && initial.stats.some(row=>row[0]===19), `Missing Adamantine II default stat state: ${hero.unit_id}`);
  assert(new Set(contexts.map(p=>p.index)).size===contexts.length,`Duplicate stat context: ${hero.unit_id}`);
  for (const p of contexts) {
    assert(p.max_rank<=19 && p.stats.length===p.max_rank+1,`Unavailable or missing ranks: ${hero.unit_id}`);
    assert(new Set(p.stats.map(row=>row[0])).size===p.stats.length,`Duplicate rank: ${hero.unit_id}`);
    for (const row of p.stats) assert(row.length===4 && row.every(Number.isFinite) && row[0]<=p.max_rank && row.slice(1).every(n=>n>=0),`Invalid stat row: ${hero.unit_id}`);
  }
  for (const g of hero.guides) {
    assert(g.url.startsWith('/') && !g.url.includes('..') && g.evidence.length,`Invalid relationship: ${hero.unit_id}`);
    if (built) assert(existsSync(pathForUrl(g.url)),`Guide route missing: ${g.url}`);
    assert(thumbnails[g.url] && existsSync(resolve(root,'public',thumbnails[g.url].src.slice(1))),`Guide thumbnail missing: ${g.url}`);
    for (const appearance of g.appearances || []) {
      assert(appearance.label && appearance.url.startsWith(`${g.url}#`),`Invalid team appearance: ${hero.unit_id}`);
      if (built) {
        if (!builtGuideCache.has(g.url)) builtGuideCache.set(g.url,readFileSync(pathForUrl(g.url),'utf8'));
        assert(builtGuideCache.get(g.url).includes(`id="${appearance.url.split('#')[1]}"`),`Missing team anchor: ${appearance.url}`);
      }
    }
  }
  const actualTeamLinks=hero.guides.filter(g=>['raid','war'].includes(g.category)).map(({status,...link})=>link);
  assert(isDeepStrictEqual(actualTeamLinks,teamLinks[hero.unit_id] || []),`Stale team guide relationships: ${hero.unit_id}`);
  for (const [slug,matches] of Object.entries(lreMatches)) {
    const links=hero.guides.filter(g=>g.category==='lre' && g.slug===slug);
    assert(links.length===(matches[hero.unit_id] ? 1 : 0),`Wrong High Points Combination links: ${hero.unit_id}/${slug}`);
    if(links.length) assert(links[0].role==='high points combination' && JSON.stringify(links[0].evidence[0].combinations)===JSON.stringify(matches[hero.unit_id]),`Wrong LRE combination evidence: ${hero.unit_id}/${slug}`);
  }
  for (const ability of hero.abilities) {
    assert(ability.icon ?? icons.abilities[ability.id],`Ability icon missing: ${ability.id}`);
    assert(ability.level === 60 && abilityDescription(ability,'Mythic',60) === ability.description,`Wrong default ability: ${ability.id}`);
    for (const rarity of new Set(contexts.map(p=>p.rarity))) {
      assert(ability.levels_by_rarity[rarity]?.length === 60,`Incomplete ability levels: ${ability.id}/${rarity}`);
      for (let level=1;level<=60;level++) assert(!/\{\[|undefined/.test(abilityDescription(ability,rarity,level)),`Unresolved ability: ${ability.id}/${rarity}/${level}`);
    }
  }
  for (const trait of hero.traits) assert(!traitDescription(trait).includes('[value unavailable]'),`Unresolved tooltip: ${trait.id}`);
}
validateRelease(currentRelease,research.relationships);
if(publication) for(const hero of topRows(publication.heroes,publication.cutoff_count,publication.include_cutoff_ties)) {
  const current = heroes.find(row=>row.unit_id===hero.unit_id);
  // A historical edition can keep its frozen verdict after current scores change.
  if(current.overall.final_score===hero.final_score) assert(overallSummary(hero.unit_id,current.overall.final_score)===topSummaries[publication.month]?.[hero.unit_id],`Profile/Top 10 summary mismatch: ${hero.unit_id}`);
}
const releases = resolve(root,'src/data/heroes/releases');
for (const name of readdirSync(releases).filter(n=>n.endsWith('.json'))) {
  const release = JSON.parse(readFileSync(resolve(releases,name)));
  validateRelease(release);
  assert(name===`${release.month}.json` && release.published_date.startsWith(release.month),'Invalid monthly association');
  for (const row of release.heroes) assert(row.slug && row.assessments && row.portrait,'Incomplete frozen snapshot');
  if (release.graphic) {
    const g = release.graphic;
    const valid = g.release_id===release.id && g.month===release.month && g.scores_sha256===release.scores_sha256 && [[g.src,g.sha256],[g.fullSizeSrc,g.fullSizeSha256],[g.thumbnailSrc,g.thumbnailSha256]].every(([src,hash]) => typeof src==='string' && src.startsWith('/images/') && !src.includes('..') && existsSync(resolve(root,'public',src.slice(1))) && sha(readFileSync(resolve(root,'public',src.slice(1))))===hash);
    if (!valid) console.warn(`Publishing issue: inconsistent graphic for ${release.month}; omit image and retain HTML.`);
  }
}
if (!graphicValid) console.log('Publishing note: monthly infographic is not available; HTML ranking retained.');
if (built) {
  const index = readFileSync(pathForUrl('/heroes/'),'utf8');
  const sitemap = readFileSync(resolve(buildRoot,'sitemap.xml'),'utf8');
  for (const hero of heroes) {
    const url = `/heroes/${hero.slug}/`;
    assert(index.includes(`href="${url}"`),`Not crawlable in directory: ${url}`);
    assert(sitemap.includes(`https://terminusmaximus.com${url}</loc>`),`Missing sitemap entry: ${url}`);
    const html = readFileSync(pathForUrl(url),'utf8');
    assert(html.includes(`href="https://terminusmaximus.com${url}"`),`Wrong canonical: ${url}`);
    assert(html.includes('BreadcrumbList') && html.includes('application/ld+json') && html.includes('Hero Stats') && html.includes('Mode ratings'),`Missing hero content: ${url}`);
    assert(html.includes('Mythic wings') && html.includes('Adamantine II') && !html.includes('Adamantine III') && !html.includes('Adamantine Rank III') && html.includes('max="60"'),`Wrong initial controls: ${url}`);
    assert(!html.includes('Five equally weighted milestones') && html.includes(popularityInsight(hero.assessments.popularity,benchmark).replaceAll('<','&lt;')),`Wrong Popularity insight: ${url}`);
    const disclosures = [...html.matchAll(/<details\b[^>]*class="[^"]*reference-disclosure[^>]*>/g)];
    assert(disclosures.length===1+hero.traits.filter(trait=>trait.id!=='Hero').length+hero.abilities.length+hero.relics.length && disclosures.every(([tag])=>! /\sopen(?:\s|=|>)/.test(tag)),`Reference cards must start collapsed: ${url}`);
    const factionCards = [...html.matchAll(/<details\b[^>]*\bdata-hero-faction\b[^>]*>[\s\S]*?<\/details>/g)];
    assert(factionCards.length===1,`Missing or duplicate faction card: ${url}`);
    const factionCard = factionCards[0][0];
    const factionMembers = heroes.filter(member=>member.faction_id===hero.faction_id);
    assert(isDeepStrictEqual([...factionCard.matchAll(/href="([^"]+)"/g)].map(match=>match[1]),factionMembers.map(member=>`/heroes/${member.slug}/`)),`Wrong faction guide links: ${url}`);
    assert(factionCard.includes(`/images/faction-game/${hero.faction_id}.webp`),`Wrong faction badge: ${url}`);
    assert(factionCard.includes(`href="${url}" aria-current="page"`) && (factionCard.match(/aria-current="page"/g)||[]).length===1,`Wrong current faction member: ${url}`);
    for (const member of factionMembers) assert(factionCard.includes(roundPortraits[member.unit_id].src),`Missing faction portrait: ${url}/${member.unit_id}`);
    const factionPosition = html.indexOf('id="faction-heading"');
    assert(factionPosition>html.indexOf('class="combat-grid"') && (hero.traits.every(trait=>trait.id==='Hero') || factionPosition<html.indexOf('<h3>Traits</h3>')),`Faction must follow combat stats and precede Traits: ${url}`);
    const summary=overallSummary(hero.unit_id,hero.overall.final_score).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll("'",'&#39;').replaceAll('"','&quot;');
    assert(html.includes(`class="overall-summary-copy" data-overall-summary>${summary}</p>`),`Missing overall summary: ${url}`);
    assert((html.match(/ data-relic(?:\s|>)/g)||[]).length===hero.relics.length,`Wrong Relic cards: ${url}`);
    assert(html.includes('id="relics-heading"')===(hero.relics.length>0),`Wrong Relic section visibility: ${url}`);
    for (const relic of hero.relics) {
      assert(html.indexOf('id="relics-heading"')>html.indexOf('<h3>Abilities</h3>'),`Relics must follow Abilities: ${url}`);
      assert(html.includes(`id="relic-rank-${relic.id}" aria-label="${relic.name.replaceAll('&','&amp;').replaceAll('"','&quot;')} relic rank" min="1" max="10" step="1" value="10"`),`Wrong Relic slider: ${url}`);
      assert(html.includes(relic.icon.src),`Missing Relic image: ${url}`);
    }
    assert(html.includes('class="mode-panel bonus-panel"') === (hero.overall.guide_bonus > 0),`Wrong bonus panel: ${url}`);
    const expectedGauges=Number(hero.overall.final_score!==null)+['raid','war','horde','popularity'].filter(mode=>hero.assessments[mode].recommended_score!==null).length;
    assert((html.match(/role="meter"/g)||[]).length===expectedGauges,`Wrong rating gauges: ${url}`);
    assert(!html.includes('role="tooltip"') && !html.includes('Roles describe the linked guide.'),`Old profile presentation: ${url}`);
    assert(!html.includes('/Users/') && !html.includes('../../../research/'),`Private source path leaked: ${url}`);
    assert(!html.includes('AggregateRating'),`Authored rating misrepresented: ${url}`);
    for (const g of hero.guides) for (const appearance of g.appearances || []) assert(html.includes(`href="${appearance.url}"`),`Missing rendered team link: ${url}/${appearance.label}`);
  }
  assert(!/<loc>[^<]*[?#]/.test(sitemap), 'Filter URLs in sitemap');
  const top = readFileSync(pathForUrl('/heroes/top-10/'),'utf8');
  const frozenBenchmark = popularityBenchmark(publication.heroes);
  assert(!top.includes('Five equally weighted milestones'),'Old Popularity boilerplate in Top 10');
  assert((top.match(/class="mode-hero-portrait"/g)||[]).length===topRows(publication.heroes).length*4,'Missing Top 10 mode portraits');
  for (const hero of topRows(publication.heroes)) {
    assert(top.includes(popularityInsight(hero.assessments.popularity,frozenBenchmark).replaceAll('<','&lt;')),`Wrong Top 10 Popularity insight: ${hero.unit_id}`);
    assert(top.includes(`/heroes/${hero.slug}/`),'Missing Top 10 hero');
    assert(top.includes(`class="overall-summary-copy" data-overall-summary>${topSummaries[publication.month][hero.unit_id]}</p>`),`Missing Top 10 summary: ${hero.unit_id}`);
  }
  console.log(`Built coverage: ${heroes.length} crawlable profiles, related routes, metadata, breadcrumbs and sitemap checked.`);
}
console.log(JSON.stringify({verified:true,coverage,reference_build:reference.snapshot.app_version,release:currentRelease.id,monthly:publication?.month}));
