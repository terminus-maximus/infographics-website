import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { machines, machineReference, machineRatingSource, machineHref } from '../src/lib/machines.mjs';
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');
assert.equal(sha(`public${machineRatingSource}`),machineReference.rating_source_sha256,'Rating infographic changed: visually review ratings before re-importing');
for(const machine of machines) {
  for(const asset of [machine.portrait,...machine.abilities.map(a=>a.icon)]) {
    assert.ok(existsSync(`public${asset.src}`),`Missing ${asset.src}`);
    assert.equal(sha(`public${asset.src}`),asset.sha256,`Changed ${asset.src}`);
  }
}
if(process.argv.includes('--built')) {
  const hub=readFileSync('dist/incursion-mow/index.html','utf8');
  const sitemap=readFileSync('dist/sitemap.xml','utf8');
  for(const machine of machines) {
    const path=machineHref(machine), html=readFileSync(`dist${path}index.html`,'utf8');
    assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,`${path} H1 count`);
    assert.equal((html.match(/data-machine-ability=/g)||[]).length,3,`${path} ability count`);
    assert.equal((html.match(/type="range"/g)||[]).length,2,`${path} slider count`);
    assert.ok(html.includes(`href="https://terminusmaximus.com${path}"`),`${path} canonical`);
    assert.ok(html.includes(machine.rating === null ? 'Not yet rated' : `${machine.rating} out of 5 stars`),`${path} rating`);
    assert.ok(hub.includes(`href="${path}"`) && sitemap.includes(`https://terminusmaximus.com${path}`),`${path} discovery`);
    const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(ids.length,new Set(ids).size,`${path} duplicate ID`);
    for(const [,anchor] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(anchor),`${path} missing #${anchor}`);
    for(const [,src] of html.matchAll(/(?:src|href)="(\/images\/[^"]+)"/g)) assert.ok(existsSync(`public${src}`),`${path} missing ${src}`);
    assert.ok(!/\/Users\/|file:\/\//.test(html),`${path} private paths`);
    assert.ok(!/\{\[/.test(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'')),`${path} unresolved visible text`);
    const hasGuide=['biovore','plagueburst-crawler','zkar'].includes(machine.slug);
    assert.equal(ids.includes('unlock-guide'),hasGuide,`${path} featured unlock infographic`);
    if(hasGuide) for(const id of ['overview','strategies','power-ups','rules','tier-caps-rewards','research']) assert.ok(ids.includes(id),`${path} preserved ${id}`);
    if(['zkar','plagueburst-crawler'].includes(machine.slug)) assert.ok(ids.includes('stage-tips'),`${path} stage tips`);
  }
}
console.log(`Validated ${machines.length} Machine of War profiles, ${machines.length*3} abilities and ${machines.length*4} artwork files${process.argv.includes('--built') ? ', including built pages, unlock sections and sitemap' : ''}.`);
