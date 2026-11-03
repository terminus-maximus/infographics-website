import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const normalize = value => value.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'');
// These Replay Library tokens differ from the LocalDatabase identity aliases.
const replayAliases = {Vit:'admecDominus',Lhykis:'eldarLhykhis'};

export function heroResolver(heroes) {
  const aliases = new Map();
  for (const hero of heroes) {
    const extra = Object.entries(replayAliases).filter(([,id])=>id===hero.unit_id).map(([alias])=>alias);
    for (const value of [hero.unit_id,hero.name,hero.full_name,...(hero.aliases || []),...extra].filter(Boolean)) {
      const key = normalize(value);
      if (!aliases.has(key)) aliases.set(key,new Set());
      aliases.get(key).add(hero.unit_id);
    }
  }
  return value => {
    const matches = aliases.get(normalize(value));
    if (matches?.size !== 1) throw new Error(`Unresolved or ambiguous guide hero: ${value}`);
    return [...matches][0];
  };
}

/** Use only the lineups rendered by BossMetaResults and the Guild War team sections. */
export function teamGuideRelationships({heroes,bosses,bossTeams,attackData,attackEditorial,defendData,defendEditorial}) {
  const relationships = {};
  const ids = new Set(heroes.map(hero=>hero.unit_id));
  const resolveHero = heroResolver(heroes);
  function add(id,guide,appearance,path) {
    if (!ids.has(id)) throw new Error(`Unknown guide team member: ${id}`);
    const links = relationships[id] ??= [];
    let link = links.find(link=>link.url===guide.url);
    if (!link) {
      link = {...guide,role:'team',appearances:[],evidence:[]};
      links.push(link);
    }
    if (!link.appearances.some(row=>row.url===appearance.url)) {
      link.appearances.push(appearance);
      link.evidence.push({kind:'published_team',path});
    }
  }

  const raidGuide = {category:'raid',slug:'boss-meta',title:'Guild Raid Boss Meta',url:'/guild-raid/boss-meta/'};
  const knownBosses = new Set(bosses.map(boss=>boss.Boss));
  for (const boss of new Set(bossTeams.map(team=>team.boss_clean))) {
    if (!knownBosses.has(boss)) continue;
    for (const choice of ['META','ALTERNATE']) {
      // The guide uses the first summary when a boss/choice is duplicated.
      const index = bossTeams.findIndex(team=>team.boss_clean===boss && team.meta_choice===choice);
      if (index<0) continue;
      const team = bossTeams[index];
      const appearance = {
        label:`${choice==='META' ? 'Meta' : 'Alternate'} on ${boss}`,
        url:`${raidGuide.url}#${boss.toLowerCase().replaceAll(' ','-')}-${choice.toLowerCase()}-team`,
      };
      for (let slot=1;slot<=5;slot++) {
        add(resolveHero(team[`hero_${slot}`]),raidGuide,appearance,`src/data/BossMeta_TeamSummary.json[${index}].hero_${slot}`);
      }
    }
  }

  const attackGuide = {category:'war',slug:'attack',title:'Guild War Attackers',url:'/guild-wars/attack/'};
  for (const [index,meta] of attackEditorial.teams.entries()) {
    const dataIndex = attackData.teams.findIndex(team=>team.id===meta.id);
    if (dataIndex<0) throw new Error(`Missing attack team: ${meta.id}`);
    const team = {...attackData.teams[dataIndex],...meta};
    for (const id of team.core) add(id,attackGuide,{
      label:`${team.title} Attack Team`,url:`${attackGuide.url}#${team.anchor}`,
    },`src/data/guild-wars/editorial.json.teams[${index}].core`);
    const flexField = team.flexAnalysis?.flex ? 'flexAnalysis.flex' : 'flex';
    const flex = (team.flexAnalysis?.flex || team.flex).filter(option=>option.share!==null && option.share>=0.038).slice(0,5);
    for (const option of flex) add(option.unit,attackGuide,{
      label:`${team.title} Attack Team — Flex`,url:`${attackGuide.url}#${team.anchor}-flex`,
    },`src/data/guild-wars/attackers.json.teams[${dataIndex}].${flexField}`);
  }

  const defendGuide = {category:'war',slug:'defend',title:'Guild War Defenders',url:'/guild-wars/defend/'};
  for (const [index,data] of defendData.teams.entries()) {
    const metaIndex = defendEditorial.teams.findIndex(team=>team.id===data.id);
    if (metaIndex<0) throw new Error(`Missing defense editorial team: ${data.id}`);
    const meta = defendEditorial.teams[metaIndex];
    const team = {...data,...meta};
    const source = meta.heroes ? `defend-editorial.json.teams[${metaIndex}]` : `defenders.json.teams[${index}]`;
    for (const id of team.heroes) add(id,defendGuide,{
      label:`${team.title} Defense Team`,url:`${defendGuide.url}#${team.anchor}`,
    },`src/data/guild-wars/${source}.heroes`);
  }
  return relationships;
}

export function loadTeamGuideRelationships() {
  const root = resolve(import.meta.dirname,'../src/data');
  const read = path => JSON.parse(readFileSync(resolve(root,path),'utf8'));
  return teamGuideRelationships({
    heroes:read('heroes/reference.json').heroes,
    bosses:read('replay-library/bosses.json'),bossTeams:read('BossMeta_TeamSummary.json'),
    attackData:read('guild-wars/attackers.json'),attackEditorial:read('guild-wars/editorial.json'),
    defendData:read('guild-wars/defenders.json'),defendEditorial:read('guild-wars/defend-editorial.json'),
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url)===resolve(process.argv[1])) {
  console.log(JSON.stringify(loadTeamGuideRelationships()));
}
