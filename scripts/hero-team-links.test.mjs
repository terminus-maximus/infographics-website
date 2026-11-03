import test from 'node:test';
import assert from 'node:assert/strict';
import { heroResolver, teamGuideRelationships, loadTeamGuideRelationships } from './hero-team-links.mjs';

test('hero tokens resolve explicitly and unknown or ambiguous names fail',()=>{
  const heroes=[{unit_id:'tauCrisis',name:'Re’vas',aliases:['Revas']},{unit_id:'admecDominus',name:'Vitruvius'}];
  const resolve=heroResolver(heroes);
  assert.equal(resolve('RE’VAS'),'tauCrisis');
  assert.equal(resolve('Vit'),'admecDominus');
  assert.throws(()=>resolve('Unknown'),/Unresolved/);
  assert.throws(()=>heroResolver([...heroes,{unit_id:'another',name:'Revas'}])('Revas'),/ambiguous/);
});

test('memberships follow published teams, choices and visible flex limits',()=>{
  const heroes=Array.from({length:12},(_,i)=>({unit_id:`h${i}`,name:`Hero ${i}`}));
  const row=(boss,choice,hero)=>({boss_clean:boss,meta_choice:choice,...Object.fromEntries([1,2,3,4,5].map(i=>[`hero_${i}`,hero]))});
  const result=teamGuideRelationships({heroes,bosses:[{Boss:'Hive Tyrant'}],
    bossTeams:[row('Hive Tyrant','META','h0'),row('Hive Tyrant','META','h1'),row('Hive Tyrant','ALTERNATE','h0'),row('Unknown Boss','META','h1')],
    attackData:{teams:[{id:'a',core:['h1'],flex:[{unit:'h1',share:1}],flexAnalysis:{flex:[
      {unit:'h2',share:null},{unit:'h3',share:.0379},...[4,5,6,7,8,9].map(i=>({unit:`h${i}`,share:.038})),
    ]},observed:[{heroes:['h10']}]},{id:'unpublished',core:['h11'],flex:[]}]},
    attackEditorial:{teams:[{id:'a',title:'Example',anchor:'example',core:['h0']}]},
    defendData:{teams:[{id:'d',heroes:['h1'],flex:[{heroes:['h10']}],counters:[{heroes:['h11']}]}]},
    defendEditorial:{teams:[{id:'d',title:'Defense',anchor:'defense',heroes:['h0']}]},
  });
  assert.deepEqual(result.h0[0].appearances,[
    {label:'Meta on Hive Tyrant',url:'/guild-raid/boss-meta/#hive-tyrant-meta-team'},
    {label:'Alternate on Hive Tyrant',url:'/guild-raid/boss-meta/#hive-tyrant-alternate-team'},
  ]);
  assert.equal(result.h0[1].appearances[0].label,'Example Attack Team');
  assert.equal(result.h0[2].appearances[0].label,'Defense Defense Team');
  assert.deepEqual(Object.keys(result).sort(),['h0','h4','h5','h6','h7','h8']);
  assert.deepEqual(result.h4[0].appearances,[{label:'Example Attack Team — Flex',url:'/guild-wars/attack/#example-flex'}]);
});

test('current Re’vas and Abaddon memberships retain multiple named roles',()=>{
  const links=loadTeamGuideRelationships();
  const war=id=>links[id]?.filter(g=>g.category==='war').flatMap(g=>g.appearances.map(a=>a.label));
  assert.deepEqual(war('tauCrisis'),['Revas OW Attack Team','AdMech Attack Team — Flex','CRIMJ Defense Team','Mechs Defense Team']);
  assert.deepEqual(war('blackAbaddon'),['Death Guard Attack Team','DG Ranged Defense Team']);
  assert.equal(links.emperKakophonist,undefined);
  assert.equal(links.blackAbaddon.find(g=>g.category==='raid').appearances[0].label,'Alternate on Avatar');
});
