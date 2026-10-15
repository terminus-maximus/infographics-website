/** Semantic checks shared by the static build and the content check command. */
/** Explicit editorial acceptance is retained separately from inspected or reported results. */
export function hasApprovedE30Assumption(build) {
  return Boolean(build?.kind === 'recommendation' &&
    build.sourceUrl === 'https://discord.com/channels/874393406531596419/1478398043106578624/1536387096716124242' &&
    build.e30Acceptance?.basis === 'user_approved_assumption' && build.e30Acceptance.approvedBy === 'Dan' &&
    /^\d{4}-\d{2}-\d{2}$/.test(build.e30Acceptance.approvedAt) &&
    build.stageId === '30' && build.outcome === 'three_medal' &&
    build.stageBasis === 'editorial_assumption' && build.resultBasis === 'editorial_assumption');
}
/** Named support use can qualify without a fully transcribed five-hero roster. */
function qualifiesForE30Support(build) {
  const accepted = hasApprovedE30Assumption(build);
  return Boolean(build && (['clear', 'player_report'].includes(build.kind) || accepted) && build.stageId === '30' && build.outcome === 'three_medal' &&
    (['observed', 'player_reported'].includes(build.resultBasis) || accepted) &&
    (accepted || ['observed', 'player_reported'].includes(build.stageBasis) ||
      build.stageBasis === 'inferred' && Boolean(build.applicabilityNote)));
}
/** A complete E30 three-medal team; inferred stage labels require visible context. */
export function qualifiesForE30Team(build, requiredHeroIds) {
  return Boolean(qualifiesForE30Support(build) && build.teamComplete && build.heroes.length === 5 &&
    requiredHeroIds.every(id => build.heroes.some(hero => hero.heroId === id)));
}
export function qualifiesForE30Target(build, requiredHeroIds) {
  // A six-hero investment pool remains an option, but cannot set Lowest Seen.
  return qualifiesForE30Team(build, requiredHeroIds) &&
    (hasApprovedE30Assumption(build) || ['observed', 'player_reported'].includes(build.stageBasis));
}
/** Use the complete accepted Lowest Seen team to identify the editable support pair. */
export function lowestSeenSupportIds(guide) {
  return [...new Set(guide.research.builds
    .filter(build => guide.research.lowestSeen.recordIds.includes(build.id) && qualifiesForE30Target(build, guide.requiredHeroIds))
    .flatMap(build => build.heroes.map(hero => hero.heroId).filter(id => !guide.requiredHeroIds.includes(id))))];
}

/** Apply Dan's support-tier hierarchy to existing records, without estimating hero strength. */
export function classifySupportHero(guide, heroId) {
  const includesHero = build => build.heroes.some(hero => hero.heroId === heroId);
  const lowest = guide.research.builds.filter(build => guide.research.lowestSeen.recordIds.includes(build.id) && qualifiesForE30Target(build, guide.requiredHeroIds) && includesHero(build));
  const e30 = guide.research.builds.filter(build => qualifiesForE30Support(build) && includesHero(build));
  const earlier = guide.research.builds.filter(build => {
    if (!includesHero(build) || !['clear', 'player_report'].includes(build.kind) || build.stageId === '30' ||
      !['observed', 'player_reported'].includes(build.resultBasis)) return false;
    // Retain attributed historical/progression use without inventing a stage or medal result.
    if (!build.stageId) return build.kind === 'player_report' && build.resultBasis === 'player_reported';
    return (['observed', 'player_reported'].includes(build.stageBasis) || build.stageBasis === 'inferred' && Boolean(build.applicabilityNote)) &&
      ['three_medal', 'win_only', 'lightning_only'].includes(build.outcome);
  });
  const records = lowest.length ? lowest : e30.length ? e30 : earlier;
  const tier = lowest.length ? 'S' : e30.length ? 'A' : earlier.length ? 'B' : 'C';
  const stages = [...new Set(earlier.filter(build => build.stageId).map(build => `E${build.stageId}`))].join(', ');
  const rationale = tier === 'S' ? 'Appears in the Lowest Seen team.'
    : tier === 'A' ? e30.every(build => build.recommendation?.supportPool)
      ? 'Listed in an accepted E30 three-medal support pool; the deployed pair is unspecified.'
      : 'Appears in another E30 three-medal team.'
    : tier === 'B' ? stages ? `Appears in clear evidence for ${stages}.`
      : 'Reported Extremis support use; exact stage and medal result are unresolved.'
    : 'No qualifying clear in the current evidence.';
  return { tier, basis: 'editorial', provisional: false, rationale, tierRecordIds: records.map(build => build.id), sourceIds: [] };
}
/**
 * @param {import('../data/campaign-events/types').ClearObservation | undefined} observation
 * @param {string[]} requiredHeroIds
 */
export function qualifiesForThreshold(observation, requiredHeroIds) {
  if (!observation || observation.thresholdEligible !== true || observation.outcome !== 'three_medal' ||
    observation.requiredHeroesDeployed !== true || observation.requiredHeroesSurvived !== true ||
    !requiredHeroIds.every((id) => observation.teamIds.includes(id))) return false;
  return ['observed', 'player_reported'].includes(observation.basis) && ['observed', 'player_reported'].includes(observation.stageIdentity);
}

/** @param {import('../data/campaign-events/types').CampaignEventGuide} guide
 * @param {string} [heroId]
 */
export function observationCoverage(guide, heroId) {
  // Visually reviewed results remain reviewed even when the exact stage is only reported.
  const observations = guide.observations.filter((item) => item.basis === 'observed' && (!heroId || item.teamIds.includes(heroId)));
  const qualifying = observations.filter((item) => qualifiesForThreshold(item, guide.requiredHeroIds));
  return {
    reviewedClears: new Set(observations.map((item) => item.originalClearId)).size,
    threeMedalClears: new Set(qualifying.map((item) => item.originalClearId)).size,
    creators: new Set(qualifying.map((item) => item.creatorId)).size,
    stageIds: [...new Set(qualifying.map((item) => item.stageId))],
  };
}

/** @param {import('../data/campaign-events/types').CampaignEventData} data */
export function validateCampaignEvents(data) {
  const errors = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  const unique = (items) => new Set(items).size === items.length;
  const expected = ['dark-angels', 'sisters', 'death-guard', 'admech', 'tyranids', 'tau'];
  const expectedStageIds = [...Array.from({ length: 30 }, (_, i) => String(i + 1)), '3B', '13B', '25B'];
  const publicUrl = (value) => {
    // Dan explicitly supplied this infographic citation for use on the guides.
    // This exception does not claim the message was accessed or allow other private links.
    if (value === 'https://discord.com/channels/874393406531596419/1478398043106578624/1536387096716124242') return true;
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password &&
        !/^(localhost|127\.|0\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname) &&
        !/\.(local|internal)$/.test(url.hostname) &&
        !/(^|\.)(discord(app)?\.com|discord\.gg|drive\.google\.com|docs\.google\.com)$/.test(url.hostname);
    } catch { return false; }
  };
  const hasPrivatePath = (value) => typeof value === 'string' &&
    /(?:file:\/\/|\/Users\/|\/home\/|\/private\/|\/Volumes\/|[A-Z]:\\|localhost:|skill:\/\/|codex:\/\/)/i.test(value);
  const visit = (value) => {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === 'object') Object.values(value).forEach(visit);
    else check(!hasPrivatePath(value), 'Public data contains a local/private path');
  };
  visit(data);
  check(data.schemaVersion === 'ce-public-1.1', 'Unexpected public schema version');
  check(['editorial_pending', 'approved'].includes(data.snapshot.status), 'Invalid snapshot status');
  check(Boolean(data.snapshot.id), 'Snapshot ID is required');
  check(data.snapshot.status !== 'approved' || /^[a-f0-9]{64}$/.test(data.snapshot.contentHash || ''), 'Approved snapshot needs a content hash');
  check(data.events.length === 6 && expected.every((id) => data.events.some((g) => g.id === id)), 'Exactly six expected events are required');
  check(unique(data.events.map((g) => g.slug)), 'Guide slugs must be unique');
  for (const guide of data.events) {
    const label = guide.id;
    check(guide.slug === guide.id && expected.includes(guide.slug), `${label}: unexpected route`);
    const eligibleIds = [...guide.requiredHeroIds, ...guide.supportingHeroIds];
    const research = guide.research;
    check(research?.eventId === guide.id, `${label}: investment research must match its event`);
    if (research) {
      check(unique(research.builds.map((build) => build.id)), `${label}: duplicate research build`);
      for (const build of research.builds) {
        check(publicUrl(build.sourceUrl), `${label}: research needs a public source URL`);
        if (build.resultSourceUrl) check(publicUrl(build.resultSourceUrl), `${label}: result needs a public source URL`);
        check(unique(build.heroes.map((hero) => hero.heroId)), `${label}: duplicate hero in a research build`);
        if (build.kind === 'recommendation') {
          const recommendation = build.recommendation;
          check(Boolean(recommendation?.creditedPlayer && recommendation?.updatedLabel && recommendation?.relic && recommendation?.comparison), `${label}: creator recommendation needs attribution and context`);
          const accepted = hasApprovedE30Assumption(build);
          check(accepted || !build.e30Acceptance && build.stageId === null && build.stageBasis === null && build.outcome === null && build.resultBasis === null, `${label}: recommendation stage/result needs explicit editorial acceptance`);
          check(build.lightning === null && !build.resultSourceUrl, `${label}: infographic does not establish lightning or an inspected result screen`);
          if (recommendation?.supportPool) check(!build.teamComplete && build.heroes.length === 6 && Boolean(build.dependencyNote), `${label}: support pool must not become an invented five-hero team`);
          check(Array.isArray(recommendation?.relatedRecordIds) && unique(recommendation.relatedRecordIds) && recommendation.relatedRecordIds.every(id => id !== build.id && research.builds.some(record => record.id === id && record.kind !== 'recommendation')), `${label}: recommendation comparisons must reference existing evidence`);
        }
        for (const hero of build.heroes) {
          check(eligibleIds.includes(hero.heroId), `${label}: ineligible research hero ${hero.heroId}`);
          for (const field of [hero.rank, hero.active, hero.passive, hero.reportedRank].filter(Boolean)) {
            if (field.value !== null) check((build.kind === 'recommendation' ? field.basis === 'creator_recommended' : ['observed', 'player_reported', 'inferred'].includes(field.basis)) && publicUrl(field.sourceUrl), `${label}/${hero.heroId}: numerical research needs independent field provenance`);
          }
        }
      }
      check(typeof research.safeBetApproved === 'boolean' && (!research.safeBetApproved || research.safeBetProposal), `${label}: approved Safe Bet needs a source-backed recommendation`);
      check(Array.isArray(research.e30Teams) && unique((research.e30Teams || []).map(team => team.id)), `${label}: E30 team groups must have unique identities`);
      for (const team of research.e30Teams || []) {
        check(Boolean(team.title) && Boolean(team.context) && team.recordIds.length > 0 && unique(team.recordIds), `${label}: E30 team needs context and distinct records`);
        for (const id of team.recordIds) {
          check(qualifiesForE30Team(research.builds.find(build => build.id === id), guide.requiredHeroIds), `${label}: E30 team must retain a complete three-medal final-stage build (${id})`);
        }
      }
      for (const target of [research.lowestSeen, research.safeBetProposal, research.supportSafeBetProposal].filter(Boolean)) {
        const supportTarget = target === research.supportSafeBetProposal;
        const editorial = target !== research.lowestSeen;
        const adjustment = field => editorial && (field.basis === 'editorial' || field.basis === 'inferred' && Boolean(field.rationale?.trim()));
        check(target.recordIds.length > 0 && Boolean(target.scope) && Boolean(target.context), `${label}: research target needs scope and team context`);
        const records = target.recordIds.map((id) => research.builds.find((build) => build.id === id));
        check(records.every((record) => qualifiesForE30Target(record, guide.requiredHeroIds)), `${label}: target must retain a three-medal E30 source with qualifying provenance`);
        const targetIds = supportTarget ? lowestSeenSupportIds(guide) : guide.requiredHeroIds;
        check(target.heroes.length === (supportTarget ? 2 : 3) && unique(target.heroes.map((hero) => hero.heroId)) && target.heroes.every((hero) => targetIds.includes(hero.heroId)), `${label}: research target must include ${supportTarget ? 'the Lowest Seen support pair' : 'the required trio'}`);
        for (const hero of target.heroes) for (const key of ['rank', 'active', 'passive']) {
          const field = hero[key];
          if (field.value !== null) {
            check(publicUrl(field.sourceUrl), `${label}/${hero.heroId}: target field needs a public source`);
            check(adjustment(field) || records.some((record) => record?.heroes.some((entry) => entry.heroId === hero.heroId && JSON.stringify(entry[key]) === JSON.stringify(field))), `${label}/${hero.heroId}: target field must match its source build or identify an editorial Safe Bet adjustment with rationale`);
          }
        }
        check(records.some(record => target.heroes.every(hero => ['rank', 'active', 'passive'].every(key => hero[key].value === null || adjustment(hero[key]) || record?.heroes.some(entry => entry.heroId === hero.heroId && JSON.stringify(entry[key]) === JSON.stringify(hero[key]))))), `${label}: target cannot combine minima from different teams`);
      }
    }
    check(guide.requiredHeroIds.length === 3, `${label}: three required heroes are required`);
    check(unique(eligibleIds), `${label}: hero eligibility overlaps or duplicates`);
    const canonicalEligible = Object.values(data.characters).filter((hero) => guide.playableFactions.includes(hero.faction)).map((hero) => hero.id);
    check(canonicalEligible.length === eligibleIds.length && canonicalEligible.every((id) => eligibleIds.includes(id)), `${label}: eligible roster must cover every hero from playable factions`);
    for (const id of eligibleIds) {
      const character = data.characters[id];
      check(Boolean(character) && guide.playableFactions.includes(character?.faction), `${label}: ineligible or unknown hero ${id}`);
    }
    for (const [rows, ids] of [[guide.requiredHeroes, guide.requiredHeroIds], [guide.supportingHeroes, guide.supportingHeroIds]]) {
      check(rows.length === ids.length && unique(rows.map((row) => row.heroId)) && rows.every((row) => ids.includes(row.heroId)), `${label}: investment rows must exactly match eligibility`);
    }
    check(unique(guide.sources.map((source) => source.id)), `${label}: duplicate source IDs`);
    guide.sources.forEach((source) => check(publicUrl(source.url), `${label}: source must be a public HTTPS URL (${source.id})`));
    const sources = new Set(guide.sources.map((source) => source.id));
    const refs = (ids, context) => ids.forEach((id) => check(sources.has(id), `${label}: missing source ${id} in ${context}`));
    const stageIds = new Set(guide.stageRules.map((stage) => stage.stageId));
    check(guide.stageRules.length === 33 && unique([...guide.stageRules.map((stage) => stage.stageId)]) && expectedStageIds.every((id) => stageIds.has(id)), `${label}: expected 30 main stages and 3 B stages`);
    for (const rule of guide.stageRules) {
      check(rule.branch === (rule.stageId.endsWith('B') ? 'B' : 'main'), `${label}: incorrect stage branch ${rule.stageId}`);
      check(Number.isInteger(rule.deploymentLimit) && rule.deploymentLimit >= 3 && rule.deploymentLimit <= 5, `${label}: invalid deployment limit`);
      refs(rule.sourceIds, 'stage rules');
    }
    check(unique(guide.observations.map((item) => item.id)), `${label}: duplicate observation IDs`);
    check(unique(guide.observations.map((item) => item.originalClearId)), `${label}: cross-posts cannot count as independent clears`);
    for (const observation of guide.observations) {
      check(stageIds.has(observation.stageId), `${label}: unknown observed stage`);
      check(['observed', 'player_reported'].includes(observation.basis), `${label}: invalid observation basis`);
      check(observation.stageIdentity === undefined || ['observed', 'player_reported', 'inferred'].includes(observation.stageIdentity), `${label}: invalid stage identity basis`);
      check(observation.thresholdEligible === undefined || typeof observation.thresholdEligible === 'boolean', `${label}: threshold eligibility must be boolean`);
      check(observation.exclusionReason == null || typeof observation.exclusionReason === 'string', `${label}: invalid exclusion reason`);
      if (observation.thresholdEligible === true) {
        check(qualifiesForThreshold(observation, guide.requiredHeroIds), `${label}: threshold-eligible observation requires explicit observed/reported stage identity, three medals and surviving required heroes`);
      }
      check(['three_medal', 'win_only', 'lightning_only', 'unknown'].includes(observation.outcome), `${label}: invalid outcome`);
      check(Boolean(observation.creatorId) && Boolean(observation.originalClearId) && Boolean(observation.scope), `${label}: incomplete observation identity/scope`);
      check(observation.sourceIds.length > 0, `${label}: observations require sources`);
      refs(observation.sourceIds, 'observation');
      observation.teamIds.forEach((id) => check(eligibleIds.includes(id), `${label}: ineligible observed hero ${id}`));
      // A visible medal result can be retained even when stage/team identity is
      // unresolved. Only explicitly eligible observations may support targets.
    }
    const validateInvestment = (investment, category, heroId) => {
      for (const key of ['rank', 'active', 'passive']) {
        const field = investment[key];
        check(field.value !== undefined, `${label}/${heroId}/${key}: unknown values must be null`);
        refs(field.sourceIds, `${heroId}/${key}`);
        field.stageIds.forEach((id) => check(stageIds.has(id), `${label}/${heroId}: unknown scope stage ${id}`));
        if (field.value === null) {
          check(field.status === 'unknown', `${label}/${heroId}/${key}: null value must have unknown status`);
          continue;
        }
        check(key === 'rank' ? typeof field.value === 'string' && field.value.trim().length > 0 : (Number.isInteger(field.value) && field.value > 0 || typeof field.value === 'string' && /^[1-9]\d*\+$/.test(field.value)), `${label}/${heroId}/${key}: invalid investment value`);
        if (field.status === 'editorial') {
          check(category === 'safeBet' || [...guide.requiredHeroIds, ...lowestSeenSupportIds(guide)].includes(heroId), `${label}/${heroId}: editable Lowest Seen values belong to the required trio and Lowest Seen support pair`);
          check(category === 'safeBet' || Boolean(field.scope), `${label}/${heroId}: Lowest Seen needs its CSV scope`);
          continue;
        }
        check(category !== 'safeBet', `${label}/${heroId}: Safe Bet comes from Dan’s editorial CSV`);
        check(Boolean(field.scope) && ['stage', 'full_event'].includes(field.scopeKind) && field.stageIds.length > 0 && field.sourceIds.length > 0, `${label}/${heroId}/${key}: populated value requires exact scope and provenance`);
        if (field.scopeKind === 'full_event') check(stageIds.size === new Set(field.stageIds).size && [...stageIds].every((id) => field.stageIds.includes(id)), `${label}/${heroId}: full-event scope requires every stage including B branches`);
        check(['observed', 'player_reported'].includes(field.status), `${label}/${heroId}: ${category} has wrong evidence status`);
        check(field.clearIds.length > 0, `${label}/${heroId}: ${category} needs qualifying original clears`);
        const observations = field.clearIds.map((id) => guide.observations.find((item) => item.id === id));
        for (const observation of observations) {
          check(qualifiesForThreshold(observation, guide.requiredHeroIds) && observation.teamIds.includes(heroId), `${label}/${heroId}: excluded, unconfirmed-stage or ineligible clear cannot support ${category}`);
        }
        check(field.stageIds.every((id) => observations.some((item) => item?.stageId === id)), `${label}/${heroId}: investment scope exceeds its qualifying clears`);
      }
    };
    for (const hero of [...guide.requiredHeroes, ...guide.supportingHeroes]) {
      validateInvestment(hero.lowestSeen, 'lowestSeen', hero.heroId);
      check(!('lowestReported' in hero), `${label}/${hero.heroId}: use the single Lowest Seen category`);
      for (const scenario of hero.safeBetScenarios) {
        scenario.teamIds.forEach((id) => check(eligibleIds.includes(id), `${label}: ineligible Safe Bet hero ${id}`));
        validateInvestment(scenario.investment, 'safeBet', hero.heroId);
      }
    }
    for (const hero of guide.supportingHeroes) {
      const expectedTier = classifySupportHero(guide, hero.heroId);
      check(['S', 'A', 'B', 'C'].includes(hero.tier), `${label}: invalid support tier`);
      check(hero.tier === expectedTier.tier && JSON.stringify(hero.tierRecordIds) === JSON.stringify(expectedTier.tierRecordIds), `${label}/${hero.heroId}: support tier must follow Lowest Seen, other E30, earlier video clear, then other heroes`);
      check(hero.rationale === expectedTier.rationale && hero.basis === 'editorial' && hero.provisional === false, `${label}/${hero.heroId}: support tier must identify the approved evidence rule`);
      refs(hero.sourceIds, 'support tier');
    }
    for (const stage of guide.stages) {
      check(stageIds.has(stage.stageId) && stage.branch === (stage.stageId.endsWith('B') ? 'B' : 'main'), `${label}: invalid advice stage/branch`);
      check(['three_medal', 'lightning'].includes(stage.objective), `${label}: stage advice must separate objective`);
      check(Boolean(stage.problem) && Boolean(stage.tactic) && stage.sourceIds.length > 0, `${label}: stage advice requires actionable text and source`);
      stage.supportingPairIds.forEach((id) => check(guide.supportingHeroIds.includes(id), `${label}: invalid supporting pair`));
      refs(stage.sourceIds, 'stage advice');
    }
    if (guide.infographic) {
      check(guide.infographic.snapshotId === data.snapshot.id, `${label}: infographic and guide snapshots differ`);
      check(guide.infographic.fullSizeSrc !== '/images/campaign-event.png', `${label}: overview art is not event-specific art`);
    }
  }
  return errors;
}
