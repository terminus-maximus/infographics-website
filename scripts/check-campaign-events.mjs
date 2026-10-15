import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { assembleCampaignEvents, contentDigest, parseRequiredHeroes, requiredHeroColumns } from '../src/lib/campaign-events-editorial.mjs';
import { classifySupportHero, lowestSeenSupportIds, observationCoverage, qualifiesForThreshold, qualifiesForE30Team, qualifiesForE30Target, validateCampaignEvents } from '../src/lib/campaign-events-validation.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const base = JSON.parse(read('src/data/campaign-events/guides.json'));
const csv = read('src/data/campaign-events/required-heroes.csv');
const data = assembleCampaignEvents(base, csv);
const canonical = JSON.parse(read('src/data/lre/fabius.json'));
// Frozen rule-manifest identities; these are distinct from ordinary campaign requirements.
const requiredByEvent = {
  'dark-angels': ['necroSpyder', 'necroDestroyer', 'necroPlasmancer'],
  sisters: ['worldTerminator', 'worldEightbound', 'worldExecutions'],
  'death-guard': ['adeptRetributor', 'adeptHospitaller', 'adeptCanoness'],
  admech: ['deathBlightlord', 'deathBlightbringer', 'deathPutrifier'],
  tyranids: ['ultraInceptorSgt', 'ultraApothecary', 'ultraTitus'],
  tau: ['genesBiophagus', 'genesMagus', 'genesKelermorph'],
};
assert.deepEqual(validateCampaignEvents(data), [], 'Public guide content must satisfy the evidence contract');
assert.equal(data.snapshot.characterBuild, canonical.characterBuild, 'Roster must identify its canonical character build');
// Hash editorial content only: approval state and later artwork metadata do not alter copy.
assert.equal(data.snapshot.contentHash, contentDigest(data), 'Content hash covers the assembled CSV and guide data');
const researchBuilds = data.events.flatMap(event => event.research.builds);
assert.equal(researchBuilds.filter(build => build.kind === 'clear').length, 21, 'All reviewed attempts remain available');
assert.equal(researchBuilds.filter(build => build.kind === 'clear').flatMap(build => build.heroes).length, 95, 'All visually recovered hero observations remain available');
const creatorRecommendations = researchBuilds.filter(build => build.kind === 'recommendation');
assert.equal(creatorRecommendations.length, 6, 'One infographic panel per event, without duplicate source records');
assert.equal(creatorRecommendations.flatMap(build => build.heroes).length, 31, 'All infographic rows remain available, including the Tyranid support pool');
assert.equal(creatorRecommendations.filter(build => qualifiesForE30Team(build, [])).length, 5, 'Five complete infographic teams are accepted under Dan’s explicit assumption');
assert.equal(creatorRecommendations.filter(build => qualifiesForE30Target(build, [])).length, 5, 'Only the five complete infographic teams can set Lowest Seen');
assert.ok(creatorRecommendations.every(build => build.resultBasis === 'editorial_assumption'), 'Editorial acceptance does not turn an infographic into an observed result');
const tyranidPool = data.events.find(event => event.id === 'tyranids').research.builds.find(build => build.kind === 'recommendation');
assert.equal(tyranidPool.teamComplete, false, 'A six-hero recommendation cannot invent a particular five-hero team');
assert.equal(qualifiesForE30Target(tyranidPool, []), false, 'The six-hero investment pool is an alternative, not Lowest Seen');
assert.ok(researchBuilds.filter(build => build.kind !== 'configuration').flatMap(build => build.heroes).length >= 109, 'Existing reports and profiles remain alongside the packet additions');
for (const event of data.events) {
  assert.ok(event.research.lowestSeen.recordIds.every(id => {
    const build = event.research.builds.find(build => build.id === id);
    return qualifiesForE30Target(build, event.requiredHeroIds);
  }), `${event.id}: headline must use three-medal E30 evidence`);
}
assert.ok(!JSON.stringify(data).includes('Stone 1'), 'The excluded ordinary Stone 1 Azkor victory must not be imported');
const tauResearch = data.events.find(event => event.id === 'tau').research;
assert.equal(tauResearch.builds.find(build => build.stageId === '24').outcome, 'win_only');
assert.ok(tauResearch.lowestSeen.recordIds.every(id => id.includes('e30')), 'Ordinary E24 win cannot become the T’au three-medal benchmark');
const judh = tauResearch.builds.find(build => build.stageId === '30').heroes.find(hero => hero.heroId === 'genesKelermorph');
assert.equal(judh.rank.value, 'D2');
assert.equal(judh.active.value, null, 'An unordered ability pair must not be assigned an active value');
assert.match(judh.unassignedAbilities, /47\/44/);
const xybia = tauResearch.builds.find(build => build.stageId === '30').heroes.find(hero => hero.heroId === 'genesMagus');
assert.equal(xybia.rank.value, 'D2');
assert.equal(xybia.reportedRank.value, 'D1', 'Conflicting written rank stays separately attributed');

// Source format does not change tier eligibility; E30 still requires three medals.
const tierCase = structuredClone(data.events.find(event => event.id === 'tau'));
const earlierVideo = tierCase.research.builds.find(build => build.id === 'tau-e24-e2D-4AcrIwY-attempt1');
assert.equal(classifySupportHero(tierCase, 'tyranParasite').tier, 'B', 'Reddit E6 three-medal report promotes Parasite');
assert.ok(classifySupportHero(tierCase, 'tyranParasite').tierRecordIds.includes('tau-e6-mochifujicat'));
assert.equal(classifySupportHero(tierCase, 'tyranTyrantGuard').tier, 'B', 'Attributed progression use retains its unnumbered-stage scope');
assert.equal(classifySupportHero(tierCase, 'tyranWingedPrime').tier, 'B');
assert.equal(classifySupportHero(tierCase, 'genesPrimus').tier, 'S', 'Lowest Seen membership takes precedence over other stages');
// Isolate this record so other genuine Winged Prime reports cannot mask a failed control.
tierCase.research.builds = [earlierVideo];
earlierVideo.kind = 'player_report';
assert.equal(classifySupportHero(tierCase, 'tyranWingedPrime').tier, 'B', 'An attributed report qualifies alongside creator video');
earlierVideo.kind = 'clear'; earlierVideo.outcome = 'unknown';
assert.equal(classifySupportHero(tierCase, 'tyranWingedPrime').tier, 'C');
earlierVideo.outcome = 'win_only'; earlierVideo.stageId = '30';
assert.equal(classifySupportHero(tierCase, 'tyranWingedPrime').tier, 'C', 'An ordinary E30 win is neither A nor B');
earlierVideo.outcome = 'three_medal';
assert.equal(classifySupportHero(tierCase, 'tyranWingedPrime').tier, 'A', 'Another complete E30 three-medal team qualifies for A');
earlierVideo.kind = 'player_report'; earlierVideo.teamComplete = false;
earlierVideo.heroes = earlierVideo.heroes.filter(hero => hero.heroId === 'tyranWingedPrime');
assert.equal(classifySupportHero(tierCase, 'tyranWingedPrime').tier, 'A', 'An explicit E30 three-medal support report need not transcribe all five heroes');
earlierVideo.outcome = 'unknown'; earlierVideo.resultBasis = null;
assert.equal(classifySupportHero(tierCase, 'tyranWingedPrime').tier, 'C', 'A failed or unestablished result cannot create an A tier');
const tyranidTierCase = structuredClone(data.events.find(event => event.id === 'tyranids'));
assert.equal(classifySupportHero(tyranidTierCase, 'ultraCalgar').tier, 'A', 'Calgar remains an E30 alternative outside the five-hero Lowest Seen team');
assert.equal(classifySupportHero(tyranidTierCase, 'bloodIntercessor').tier, 'B', 'Historical community use is retained without assigning a current stage');
assert.deepEqual(tyranidTierCase.research.lowestSeen.recordIds, ['tyranids-e30-131Zxf-1b_E-attempt1']);
tyranidTierCase.research.builds = [tyranidPool];
assert.equal(classifySupportHero(tyranidTierCase, 'ultraCalgar').tier, 'A', 'The accepted infographic pool alone supports A, never S');
assert.match(classifySupportHero(tyranidTierCase, 'ultraCalgar').rationale, /pair is unspecified/);
assert.equal(classifySupportHero(data.events.find(event => event.id === 'admech'), 'worldTerminator').tier, 'C', 'Wrask’s unresolved campaign difficulty does not establish Extremis use');

// CSV owns the required trio and Lowest Seen support pair; edits and blanks survive.
const serialize = rows => [requiredHeroColumns, ...rows.map(row => requiredHeroColumns.map(key => row[key]))].map(row => row.map(value => /[",\r\n]/.test(value) ? '"' + value.replaceAll('"', '""') + '"' : value).join(',')).join('\r\n') + '\r\n';
const rows = parseRequiredHeroes(csv);
assert.equal(rows.length, 30);
for (const event of data.events) {
  const supportIds = lowestSeenSupportIds(event);
  const eventRows = rows.filter(row => row.Campaign === event.displayTitle);
  assert.equal(supportIds.length, 2);
  assert.equal(eventRows.length, 5, `${event.id}: three required plus two Lowest Seen supports`);
  assert.deepEqual(eventRows.map(row => row.Hero).sort(), [...event.requiredHeroIds, ...supportIds].map(id => data.characters[id].name).sort());
  for (const id of supportIds) {
    const hero = event.supportingHeroes.find(hero => hero.heroId === id);
    const row = eventRows.find(row => row.Hero === data.characters[id].name);
    for (const field of ['rank', 'active', 'passive']) {
      const suffix = field[0].toUpperCase() + field.slice(1);
      assert.equal(String(hero.lowestSeen[field].value ?? ''), row[`LowestSeen${suffix}`], `${event.id}/${id}: CSV owns the support field`);
      assert.equal(String(hero.safeBetScenarios[0]?.investment[field].value ?? ''), row[`SafeBet${suffix}`], `${event.id}/${id}: CSV owns the support estimate`);
    }
  }
}
const supportEdit = structuredClone(rows);
const firstSupport = supportEdit.find(row => row.Campaign === 'Dark Angels' && row.Hero === 'Thothmek');
Object.assign(firstSupport, {LowestSeenRank:'D2', LowestSeenActive:'', SafeBetRank:'A1', SafeBetActive:'51', SafeBetPassive:'', SafeBetNotes:'Use with Anuphet.'});
const supportEdited = assembleCampaignEvents(base, serialize(supportEdit));
const changedSupport = supportEdited.events[0].supportingHeroes.find(hero => hero.heroId === 'necroChronomancer');
assert.equal(changedSupport.lowestSeen.rank.value,'D2');
assert.equal(changedSupport.lowestSeen.active.value,null,'A blank support field must not fall back to research');
assert.equal(changedSupport.safeBetScenarios[0].investment.rank.value,'A1');
assert.equal(changedSupport.safeBetScenarios[0].investment.active.value,51);
assert.equal(changedSupport.safeBetScenarios[0].investment.passive.value,null);
assert.equal(changedSupport.safeBetScenarios[0].provisional,false,'Edited support values replace inferred seeds');
assert.deepEqual(supportEdited.events[0].requiredHeroes,data.events[0].requiredHeroes,'Support edits preserve required-hero values');
assert.deepEqual(validateCampaignEvents(supportEdited),[]);
assert.notEqual(supportEdited.snapshot.contentHash,data.snapshot.contentHash);
assert.equal(assembleCampaignEvents(base, serialize([...rows].reverse())).snapshot.contentHash,data.snapshot.contentHash,'CSV row order must not change the assembled result');
assert.throws(() => assembleCampaignEvents(base, serialize(rows.filter(row => row.Hero !== 'Thothmek'))), /Missing CSV hero/);
assert.throws(() => assembleCampaignEvents(base, serialize([...rows,{...firstSupport,Hero:'Makhotep'}])), /Unknown campaign\/hero/);
const edit = structuredClone(rows);
edit[0].SafeBetRank = 'Gold 1';
edit[0].SafeBetActive = '35+';
edit[0].SafeBetPassive = '26';
edit[0].SafeBetNotes = 'With Anuphet, use \"summons\"\nthen repair.';
const edited = assembleCampaignEvents(base, serialize(edit));
const scenario = edited.events[0].requiredHeroes[0].safeBetScenarios[0];
assert.equal(scenario.investment.rank.value, 'Gold 1');
assert.equal(scenario.investment.active.value, '35+');
assert.equal(scenario.investment.passive.value, 26);
assert.equal(scenario.conditions[0], edit[0].SafeBetNotes);
assert.deepEqual(validateCampaignEvents(edited), []);
assert.deepEqual(edited.events[0].requiredHeroes[1].safeBetScenarios, data.events[0].requiredHeroes[1].safeBetScenarios, 'Editing one hero preserves the others');
assert.equal(scenario.provisional, false, 'Changed CSV values replace the initial inferred placeholders');
assert.equal(data.events[0].requiredHeroes[0].safeBetScenarios[0].provisional, true, 'Unedited inferred placeholders remain distinguishable from approved values');
assert.notEqual(edited.snapshot.contentHash, data.snapshot.contentHash);
const cleared = structuredClone(rows);
for (const row of cleared) for (const field of ['LowestSeenRank','LowestSeenActive','LowestSeenPassive']) row[field] = '';
assert.ok(assembleCampaignEvents(base, serialize(cleared)).events.every(event => event.requiredHeroes.every(hero => Object.values(hero.lowestSeen).every(field => field.value === null))));
assert.throws(() => assembleCampaignEvents(base, serialize([...rows, rows[0]])), /Duplicate CSV/);
assert.throws(() => assembleCampaignEvents(base, serialize(rows.slice(1))), /Missing CSV/);
const invalid = structuredClone(rows); invalid[0].SafeBetActive = '0';
assert.throws(() => assembleCampaignEvents(base, serialize(invalid)), /positive whole number/);
const incomplete = structuredClone(rows); incomplete[0].LowestSeenRank = 'Gold 1'; incomplete[0].LowestSeenScope = '';
assert.throws(() => assembleCampaignEvents(base, serialize(incomplete)), /LowestSeenScope/);
const multiSource = structuredClone(rows); multiSource[0].LowestSeenSource += ' ; https://example.com/other';
assert.throws(() => assembleCampaignEvents(base, serialize(multiSource)), /one public HTTPS URL/);

const asset = (path) => {
  assert.match(path, /^\/images\/[a-zA-Z0-9_./-]+$/, `Asset must use a local public image path: ${path}`);
  assert.ok(!path.includes('..') && existsSync(resolve(root, `public${path}`)), `Missing asset: ${path}`);
};
for (const hero of Object.values(data.characters)) {
  const source = canonical.characters.find((item) => item.id === hero.id);
  assert.ok(source, `Unknown canonical hero ${hero.id}`);
  for (const key of ['name', 'faction', 'portrait']) assert.equal(hero[key], source[key], `${hero.id}: canonical ${key}`);
  asset(hero.portrait);
}
for (const guide of data.events) {
  assert.deepEqual([...guide.requiredHeroIds].sort(), [...requiredByEvent[guide.id]].sort(), `${guide.id}: required heroes must match the event rule manifest`);
  const expected = canonical.characters.filter((hero) => guide.playableFactions.includes(hero.faction)).map((hero) => hero.id).sort();
  assert.deepEqual([...guide.requiredHeroIds, ...guide.supportingHeroIds].sort(), expected, `${guide.id}: complete eligible roster`);
  if (guide.infographic) {
    asset(guide.infographic.src);
    asset(guide.infographic.fullSizeSrc);
    assert.ok(guide.infographic.width > 0 && guide.infographic.height > 0, 'Infographic dimensions required');
  }
}
asset('/images/campaign-event.png');
asset('/images/web/campaign-event.webp');

// Negative controls guard evidence failures that would produce misleading guidance.
const rejected = (label, mutate, pattern) => {
  const copy = structuredClone(data);
  mutate(copy);
  assert.ok(validateCampaignEvents(copy).some((message) => pattern.test(message)), label);
};
rejected('A required hero cannot come from an enemy faction', (copy) => copy.events[0].requiredHeroIds[0] = 'ultraInceptorSgt', /ineligible|eligibility|exactly match/);
for (const tier of ['D', 'F', null]) rejected(`Support tier ${tier} is not allowed`, copy => {
  copy.events[0].supportingHeroes[0].tier = tier;
}, /invalid support tier/);
rejected('A local research path cannot leak into public data', (copy) => copy.events[0].ruleNote = '/Users/research/private/frame.png', /local\/private/);
rejected('A private Discord channel cannot become a public source', (copy) => copy.events[0].sources[0].url = 'https://discord.com/channels/1/2/3', /public HTTPS/);
rejected('A creator recommendation cannot masquerade as an observed rank', copy => {
  copy.events[0].research.builds.find(build => build.kind === 'recommendation').heroes[0].rank.basis = 'observed';
}, /independent field provenance/);
rejected('Removing editorial acceptance disqualifies an infographic target', copy => {
  delete copy.events[0].research.builds.find(build => build.kind === 'recommendation').e30Acceptance;
}, /three-medal E30/);
rejected('An accepted six-hero pool cannot become a complete alternate team', copy => {
  const guide = copy.events.find(event => event.id === 'tyranids');
  const pool = guide.research.builds.find(build => build.kind === 'recommendation');
  pool.teamComplete = true;
  guide.research.e30Teams[0].recordIds.push(pool.id);
}, /three-medal final-stage|support pool/);
rejected('An accepted six-hero pool cannot set Lowest Seen', copy => {
  const guide = copy.events.find(event => event.id === 'tyranids');
  guide.research.lowestSeen.recordIds = [tyranidPool.id];
}, /target must retain a three-medal E30 source/);
rejected('Adding a result label cannot promote an infographic into an E30 clear', copy => {
  const guide = copy.events[0];
  const recommendation = guide.research.builds.find(build => build.kind === 'recommendation');
  Object.assign(recommendation, { stageId: '30', stageBasis: 'observed', outcome: 'three_medal', resultBasis: 'observed' });
  guide.research.e30Teams[0].recordIds.push(recommendation.id);
}, /three-medal final-stage/);
rejected('A populated ability cannot lack field provenance', copy => {
  Object.assign(copy.events[0].requiredHeroes[0].lowestSeen.active, { value: 35, status: 'observed', scope: null, scopeKind: null, stageIds: [], sourceIds: [], clearIds: [] });
}, /scope and provenance/);
rejected('An inferred Safe Bet needs its reasoning', copy => {
  delete copy.events[0].research.safeBetProposal.heroes[0].active.rationale;
}, /adjustment with rationale/);
for (const outcome of ['win_only', 'lightning_only', 'unknown']) rejected(`${outcome} cannot qualify as an E30 target or alternate team`, copy => {
  const guide = copy.events.find(event => event.id === 'tyranids');
  guide.research.builds.find(build => build.id === guide.research.lowestSeen.recordIds[0]).outcome = outcome;
}, /three-medal.*E30|three-medal final-stage/);
rejected('An earlier-stage three-medal clear cannot set the E30 headline', copy => {
  const guide = copy.events.find(event => event.id === 'tyranids');
  guide.research.builds.find(build => build.id === guide.research.lowestSeen.recordIds[0]).stageId = '24';
}, /three-medal.*E30|three-medal final-stage/);
rejected('A recommendation buffer cannot be presented as an observed source value', copy => {
  const guide = copy.events.find(event => event.id === 'admech');
  const hero = guide.research.safeBetProposal.heroes.find(hero => hero.heroId === 'deathPutrifier');
  hero.rank.basis = 'observed';
}, /target field must match/);
rejected('Different team minima cannot form an alleged intact Lowest Seen build', copy => {
  const guide = copy.events.find(event => event.id === 'tyranids');
  const other = guide.research.builds.find(build => build.id === 'tyranids-e30-seventhsolar');
  guide.research.lowestSeen.recordIds.push(other.id);
  guide.research.lowestSeen.heroes.find(hero => hero.heroId === 'ultraApothecary').active = structuredClone(other.heroes.find(hero => hero.heroId === 'ultraApothecary').active);
}, /cannot combine minima/);
const pilotField = (copy, outcome) => {
  const guide = copy.events.find((event) => event.id === 'tau');
  // Isolate the regression fixture from future production observation ordering.
  const pilot = { id: 'regression-win-only', originalClearId: 'regression-win-only', creatorId: 'regression-creator', stageId: '24', scope: 'Extremis 24 only', basis: 'observed', stageIdentity: 'observed', thresholdEligible: false, exclusionReason: null, outcome, lightning: null, requiredHeroesDeployed: true, requiredHeroesSurvived: false, teamIds: guide.requiredHeroIds, sourceIds: [guide.sources[0].id], summary: 'Synthetic regression case', conditions: [] };
  guide.observations = [pilot];
  guide.requiredHeroes[0].lowestSeen.rank = { value: 'Gold 2', status: 'observed', scope: 'Extremis 24 only', scopeKind: 'stage', stageIds: ['24'], sourceIds: pilot.sourceIds, clearIds: [pilot.id], note: null };
};
// The known pilot is a win-only clear with required-hero deaths.
rejected('Win-only clear cannot become Lowest Seen', (copy) => pilotField(copy, 'win_only'), /cannot support lowestSeen/);
rejected('Lightning-only clear cannot become Lowest Seen', (copy) => pilotField(copy, 'lightning_only'), /cannot support lowestSeen/);
rejected('Three-medal label cannot hide required-hero deaths', (copy) => pilotField(copy, 'three_medal'), /cannot support lowestSeen/);
rejected('A single stage cannot establish full-event investment', (copy) => {
  pilotField(copy, 'three_medal');
  const guide = copy.events.find((event) => event.id === 'tau');
  guide.observations[0].requiredHeroesSurvived = true;
  guide.observations[0].thresholdEligible = true;
  guide.requiredHeroes[0].lowestSeen.rank.scopeKind = 'full_event';
}, /full-event scope/);
rejected('Duplicate uploads cannot inflate the clear sample', (copy) => {
  pilotField(copy, 'win_only');
  const guide = copy.events.find((event) => event.id === 'tau');
  guide.observations.push({ ...guide.observations[0], id: 'cross-post' });
}, /cross-posts/);

const eligibleCase = (copy) => {
  pilotField(copy, 'three_medal');
  const guide = copy.events.find((event) => event.id === 'tau');
  guide.observations[0].requiredHeroesSurvived = true;
  guide.observations[0].thresholdEligible = true;
  return guide;
};
rejected('Missing stage identity cannot establish Lowest Seen', (copy) => {
  const guide = eligibleCase(copy);
  delete guide.observations[0].stageIdentity;
}, /cannot support lowestSeen/);
rejected('False threshold eligibility cannot establish Lowest Seen', (copy) => {
  eligibleCase(copy).observations[0].thresholdEligible = false;
}, /cannot support lowestSeen/);
rejected('Missing threshold eligibility cannot establish Lowest Seen', (copy) => {
  delete eligibleCase(copy).observations[0].thresholdEligible;
}, /cannot support lowestSeen/);
// Positive and coverage controls distinguish visible result review from target eligibility.
const evidenceCase = structuredClone(data);
const evidenceGuide = eligibleCase(evidenceCase);
const observation = evidenceGuide.observations[0];
assert.deepEqual(validateCampaignEvents(evidenceCase), [], 'An explicitly eligible, observed exact-stage clear supports Lowest Seen');
assert.equal(observationCoverage(evidenceGuide).threeMedalClears, 1);
observation.stageIdentity = 'player_reported';
assert.equal(observationCoverage(evidenceGuide).reviewedClears, 1, 'Visually reviewed result with reported stage remains in reviewed count');
assert.equal(observationCoverage(evidenceGuide).threeMedalClears, 1, 'Eligible reports share Lowest Seen');
assert.equal(qualifiesForThreshold(observation, evidenceGuide.requiredHeroIds), true);
evidenceGuide.requiredHeroes[0].lowestSeen.rank.status = 'player_reported';
assert.deepEqual(validateCampaignEvents(evidenceCase), [], 'Eligible reported evidence uses the same Lowest Seen category');
observation.stageIdentity = 'inferred';
assert.ok(validateCampaignEvents(evidenceCase).some(error => /cannot support lowestSeen/.test(error)), 'An inferred stage is still not an attributed report');
observation.stageIdentity = 'player_reported';
observation.thresholdEligible = false;
assert.ok(validateCampaignEvents(evidenceCase).some(error => /cannot support lowestSeen/.test(error)));
// Legacy pilot defaults are adapted in memory only; the lead-owned JSON is never written.
const legacyCase = structuredClone(data);
pilotField(legacyCase, 'win_only');
const legacyGuide = legacyCase.events.find((event) => event.id === 'tau');
assert.equal(legacyGuide.observations[0].stageIdentity, 'observed');
assert.equal(legacyGuide.observations[0].thresholdEligible, false);
assert.equal(observationCoverage(legacyGuide).reviewedClears, 1);
assert.equal(observationCoverage(legacyGuide).threeMedalClears, 0);

if (process.argv.includes('--built')) {
  const hub = read('dist/campaign-event/index.html');
  const alphabetical = [...data.events].sort((a, b) => a.displayTitle.localeCompare(b.displayTitle, 'en'));
  const menu = hub.match(/id="ce-guides-menu"[^>]*>([\s\S]*?)<\/div>/)?.[1] || '';
  const menuLinks = [...menu.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map((match) => [match[1], match[2].trim()]);
  assert.deepEqual(menuLinks, [
    ['/campaign-event/admech/', 'AdMech'],
    ['/campaign-event/tyranids/', 'Tyranids'],
    ['/campaign-event/', 'Explore All Guides'],
  ]);
  const homepageCards = read('dist/index.html').match(/id="ce-guides"[^>]*>([\s\S]*?)<\/section>/)?.[1] || '';
  assert.deepEqual([...homepageCards.matchAll(/<a[^>]+href="([^"]+)"/g)].map(match => match[1]), [
    '/campaign-event/admech/', '/campaign-event/tyranids/', '/campaign-event',
  ]);
  for (const guide of alphabetical) {
    const html = read(`dist/campaign-event/${guide.slug}/index.html`);
    for (const id of ['lowest-seen', 'alternates', 'replays', 'supports', 'tactics', 'rewards']) assert.ok(html.includes(`id="${id}"`), `${guide.id}: section ${id}`);
    assert.ok(html.includes(`/images/web/ce-${guide.slug}.webp`), `${guide.id}: event artwork`);
    assert.ok(html.includes(`/images/ce-${guide.slug}.png`), `${guide.id}: original artwork`);
    assert.ok(!html.includes('noindex'), `${guide.id}: ready for site discovery`);
    assert.equal(html.split('data-investment-hero=').length - 1, 5, `${guide.id}: exactly five maintained heroes`);
    for (const hero of [...guide.requiredHeroes, ...lowestSeenSupportIds(guide).map(id => guide.supportingHeroes.find(hero => hero.heroId === id))]) {
      const row = html.split(`data-investment-hero="${hero.heroId}"`)[1]?.split('data-investment-hero=')[0];
      assert.ok(row, `${guide.id}: hero ${hero.heroId}`);
      for (const [column, investment] of [['lowest', hero.lowestSeen], ['safe', hero.safeBetScenarios[0].investment]]) {
        const cell = row.match(new RegExp(`data-investment="${column}"[^>]*>([\\s\\S]*?)</div>`))?.[1] || '';
        const values = [...cell.matchAll(/<strong[^>]*>([^<]*)<\/strong>/g)].map(match => match[1]);
        assert.deepEqual(values, ['rank', 'active', 'passive'].map(field => String(investment[field].value ?? '—')), `${guide.id}/${hero.heroId}: exact ${column} rank and abilities`);
      }
    }
    const primaryBuild = guide.research.builds.find(build => guide.research.lowestSeen.recordIds.includes(build.id));
    const primaryCredit = html.match(/class="team-credit"[^>]*>([\s\S]*?)<\/div>/)?.[1] || '';
    const encodedHref = build => (build.resultSourceUrl || build.sourceUrl).replaceAll('&', '&amp;');
    assert.ok(primaryCredit.includes(`href="${encodedHref(primaryBuild)}"`), `${guide.id}: main team links to the clear`);
    for (const build of guide.research.builds.filter(build => build.kind === 'clear')) {
      const card = guide.research.lowestSeen.recordIds.includes(build.id) ? primaryCredit : html.split(`data-build="${build.id}"`)[1]?.split('</article>')[0] || '';
      assert.ok(card.includes(`href="${encodedHref(build)}"`), `${guide.id}/${build.id}: reviewed replay remains linked at its clear timestamp`);
    }
    const related = html.match(/<section id="related-guides"[^>]*>([\s\S]*?)<\/section>/)?.[1] || '';
    assert.deepEqual([...related.matchAll(/data-recommendation-route="([^"]+)"/g)].map(match => match[1]), ['/campaign-event', ...alphabetical.filter(other => other.slug !== guide.slug).map(other => `/campaign-event/${other.slug}/`)], `${guide.id}: overview and five alphabetical CE guides`);
    assert.ok(!/<section[^>]*data-recommendation-section="more-to-explore"/.test(html), `${guide.id}: no extra discovery section`);
    assert.equal(html.split('data-reward="character-shards"').length - 1, 5);
    for (const match of html.matchAll(/(?:src|href)="(\/images\/[^"#?]+)"/g)) asset(decodeURI(match[1]));
    for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(html.includes(`id="${match[1]}"`), `${guide.id}: broken anchor ${match[1]}`);
    assert.ok(!/file:\/\/|\/Users\/|\/private\//i.test(html), `${guide.id}: private reference`);
    assert.ok(hub.includes(`/campaign-event/${guide.slug}/`));
    assert.ok(read('dist/beginner-guide/index.html').includes(`data-recommendation-route="/campaign-event/${guide.slug}/"`));
  }
}
console.log('Campaign Events: research invariants, 30 maintained heroes, complete teams, artwork, navigation, discovery, and built-page checks passed.');
