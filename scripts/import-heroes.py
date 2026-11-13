#!/usr/bin/env python3
"""Read selected HeroDatabase exports; verify with its original, read-only combiner."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]

def read(path):
    return json.loads(path.read_text())

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def require(condition, message):
    if not condition:
        raise ValueError(message)

def write_changed(path, value):
    text = json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + '\n'
    if path.exists() and path.read_text() == text:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix('.tmp')
    temp.write_text(text)
    temp.replace(path)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--hero-database', type=Path, default=ROOT.parent / 'HeroDatabase')
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    home = args.hero_database.resolve()
    sys.dont_write_bytecode = True
    registry = read(home / 'sources.json')
    selected = registry['latest_overall_export']
    overall = read(home / selected['scores'])
    policy = read(home / selected['configuration'])
    folder = (home / selected['scores']).parent
    manifest = read(folder / 'source-manifest.json')
    guide_export = read(home / selected['guide_mentions'])
    roster = read(home / 'roster.json')['heroes']
    require(policy['version'] == overall['version'] == guide_export['version'] == 'overall-popularity-3.0', 'Incompatible overall policy')
    require(manifest['inputs'] == overall['inputs'], 'Overall manifest inputs disagree')
    require(digest(home / 'roster.json') == overall['inputs']['roster_sha256'], 'Roster changed: regenerate approved overall release')
    require(digest(home / selected['configuration']) == overall['inputs']['policy_sha256'], 'Policy hash mismatch')
    paths = {
        'raid': registry['latest_guild_raid_export']['website_cards'],
        'war': registry['latest_guild_war_export']['website_cards'],
        'horde': registry['latest_horde_export']['cards'],
        'popularity': registry['latest_popularity_export']['cards'],
    }
    modes = {}
    for mode, path in paths.items():
        require(overall['inputs']['mode_exports'][mode] == {'path': path, 'sha256': digest(home / path)}, f'{mode}: selected assessment differs from overall input; regenerate upstream')
        modes[mode] = read(home / path)['heroes']
    # Load only pure functions from the established reproduction pipeline. Never call main().
    spec = importlib.util.spec_from_file_location('approved_overall', home / 'scripts/build_overall_rankings.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    # Independently reproduce Popularity from frozen raw milestone counts.
    pop_spec = importlib.util.spec_from_file_location('approved_popularity', home / 'scripts/build_popularity_scores.py')
    pop_module = importlib.util.module_from_spec(pop_spec)
    pop_spec.loader.exec_module(pop_module)
    pop_export = read(home / paths['popularity'])
    pop_input = home / pop_export['inputs']['source_path']
    require(digest(pop_input) == pop_export['inputs']['source_sha256'], 'Popularity source hash mismatch')
    pop_scores, calibration = pop_module.score_counts(read(pop_input)['heroes'])
    require(calibration == pop_export['calibration'], 'Popularity calibration mismatch')
    require(all(row['recommended_score'] == (float(pop_scores[row['unit_id']]) if row['unit_id'] in pop_scores else None) for row in modes['popularity']), 'Popularity differs from raw counts')
    with zipfile.ZipFile(folder / 'guide-source-snapshot.zip') as archive:
        content = json.loads(archive.read('extracted-content.json'))
        require(json.loads(archive.read('manifest.json')) == manifest, 'Archived manifest mismatch')
        for source in content['source_files']:
            require(hashlib.sha256(archive.read('site/' + source['path'])).hexdigest() == source['sha256'], 'Corrupt frozen guide source: ' + source['path'])
    mentions = module.collect_mentions(content, roster, policy)
    calculated = module.combine(roster, modes, mentions, policy)
    require(calculated == overall['heroes'], 'Approved scores/ranks disagree with original calculation; ranking withheld')
    require({r['unit_id']: r['guides'] for r in guide_export['heroes']} == mentions, 'Guide eligibility export disagrees with frozen required-role evidence')
    live = json.loads(subprocess.check_output(['node', str(home / 'scripts/extract_guide_content.mjs'), str(ROOT)], text=True))
    require(module.collect_mentions(live, roster, policy) == mentions, 'Current required lists differ: regenerate approved overall release before importing')
    ids = {h['unit_id'] for h in roster}
    slugs = [h['folder'].split('/')[-1] for h in roster]
    require(len(ids) == len(roster) == len(set(slugs)), 'Duplicate hero IDs or slugs')
    require(all(re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', s) and s not in {'top-10', 'factions', 'index', 'scoring'} for s in slugs), 'Invalid or reserved hero slug')
    # Relationships are explicit structured roles, never text search or table membership.
    additions = read(ROOT / 'src/data/updates/profile-additions.json')
    relationship_ids = ids | {h['unit_id'] for h in additions['heroes']}
    relationships = {uid: [] for uid in relationship_ids}
    def add(uid, guide, role, evidence, appearances=None):
        require(uid in relationship_ids, f'Unknown relationship identity: {uid}')
        item = {k: guide[k] for k in ('category', 'slug', 'title')}
        item.update(url=guide['url'].removeprefix('https://terminusmaximus.com'), role=role, status='current', evidence=evidence)
        if appearances:
            item['appearances'] = appearances
        if item not in relationships[uid]:
            relationships[uid].append(item)
    for uid, guides in mentions.items():
        for guide in guides:
            add(uid, guide, 'required', guide['evidence'])
    for guide in live['guides']:
        player = guide['player_content']
        if guide['category'] == 'campaign':
            for i, group in enumerate(player.get('supportingHeroGroups', [])):
                for j, hero in enumerate(group['heroes']):
                    add(hero['characterId'], guide, 'supporting', [{'kind': 'structured_role', 'path': f'supportingHeroGroups.{i}.heroes.{j}.characterId'}])
        elif guide['category'] == 'event_campaign':
            for i, uid in enumerate(player['supportingHeroIds']):
                add(uid, guide, 'supporting', [{'kind': 'structured_role', 'path': f'supportingHeroIds.{i}'}])
        elif guide['category'] == 'incursion':
            for i, strategy in enumerate(player['strategies']):
                for field, role in [('core', 'core'), ('flex', 'flex')]:
                    for uid in strategy.get(field, []):
                        add(uid, guide, role, [{'kind': 'structured_role', 'path': f'strategies.{i}.{field}'}])
                if strategy.get('featuredFlex'):
                    add(strategy['featuredFlex']['id'], guide, 'flex', [{'kind': 'structured_role', 'path': f'strategies.{i}.featuredFlex.id'}])
    team_links = json.loads(subprocess.check_output(['node', str(ROOT / 'scripts/hero-team-links.mjs')], text=True))
    for uid, guides in team_links.items():
        for guide in guides:
            add(uid, guide, guide['role'], guide['evidence'], guide['appearances'])
    assessments = {}
    lre_sources = read(ROOT / 'src/data/lre/sources.json')
    lre_matches = json.loads(subprocess.check_output(['node', str(ROOT / 'scripts/hero-lre-links.mjs')], text=True))
    for slug in lre_sources['events']:
        for uid, combinations in lre_matches[slug].items():
            add(uid, {'category':'lre', 'slug':slug, 'title':f'{slug.title()} LRE Guide', 'url':f'/lre/{slug}/'}, 'high points combination', [{'kind':'high_points_combination', 'path':'highPointsCombinations', 'combinations':combinations}])
    keep = ['recommended_score', 'display_score', 'short_justification', 'confidence', 'score_status', 'rating_status', 'evidence_score_status', 'status', 'last_updated', 'last_community_research_completed', 'source_captures_end', 'as_of', 'score_basis', 'scoring_revision', 'publication_note', 'main_boss_findings', 'prime_side_boss_findings', 'counts', 'measurement_date', 'threshold_definition']
    for mode, rows in modes.items():
        for row in rows:
            uid = row['unit_id']
            assessment = {key: row[key] for key in keep if key in row}
            # Preserve authored prose; replace private research links with their labels.
            if row.get('score_rationale'):
                assessment['score_rationale'] = re.sub(r'\[([^\]]+)\]\((?!https?://)[^)]+\)', r'\1', row['score_rationale'])
            assessments.setdefault(uid, {})[mode] = assessment
            if mode in ('raid', 'war', 'popularity'):
                continue  # Related guides use the actual published team memberships above.
            for url in row.get('learn_more_urls', []) + ([row['learn_more_url']] if row.get('learn_more_url') else []):
                require(url.startswith('https://terminusmaximus.com/'), 'Unexpected guide URL')
                add(uid, {'category': mode, 'slug': url.rstrip('/').split('/')[-1], 'title': {'raid':'Guild Raid Boss Meta', 'war':'Guild War ' + ('Attackers' if '/attack/' in url else 'Defenders'), 'horde':'Horde guide'}[mode], 'url':url}, 'reference', [{'kind':'assessment_link','path': 'learn_more_url(s)'}])
    coverage = {'roster': len(roster), **{mode: sum(r['recommended_score'] is not None for r in rows) for mode, rows in modes.items()}, 'ranked': sum(r['final_score'] is not None for r in calculated), 'pending': sum(r['final_score'] is None for r in calculated), 'bonus': sum(r['guide_bonus'] > 0 for r in calculated)}
    if selected['scores'] == 'analysis/overall/2026-11-02-guide-bonus-v2/scores.json':
        require(coverage == {'roster':119,'raid':115,'war':116,'horde':119,'ranked':115,'pending':4,'bonus':39}, 'November 2 reconciliation failure')
        require(overall['summary']['category_hero_counts'] == {'campaign':24,'event_campaign':18}, 'Required category reconciliation failure')
    data = {
        'schema_version':2,
        'identity': [{'unit_id':h['unit_id'], 'slug':s, 'name':h['name'], 'availability_status': h['availability_status']} for h, s in zip(roster, slugs)],
        'assessments': assessments,
        'relationships': {uid: sorted(rows, key=lambda r: (r['category'], r['slug'], r['role'], str(r['evidence']))) for uid,rows in sorted(relationships.items())},
        'release': {'id':folder.name, 'policy':policy['version'], 'date':overall['generated_at'][:10], 'generated_at':overall['generated_at'], 'rank_convention':'competition', 'coverage':coverage, 'inputs':overall['inputs'], 'scores_sha256':digest(home / selected['scores']), 'guide_evidence_sha256':digest(home / selected['guide_mentions']), 'source_manifest_sha256':digest(folder / 'source-manifest.json'), 'heroes':calculated},
    }
    target = ROOT / 'src/data/heroes/research.json'
    if args.check:
        require(read(target) == data, 'Imported research differs: run npm run import:heroes')
    else:
        write_changed(target, data)
    print(json.dumps({'verified': True, 'coverage':coverage, 'release':folder.name, 'relationships':sum(map(len,relationships.values()))}))

if __name__ == '__main__':
    main()
