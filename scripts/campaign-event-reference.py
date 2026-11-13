#!/usr/bin/env python3
"""Refresh game-owned CE fields; preserve maintained investments and clear evidence."""
import hashlib
import json
from pathlib import Path
import shutil

SITE = Path(__file__).resolve().parents[1]
LOCAL = SITE.parent / 'LocalDatabase'
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()


def main():
    pack = LOCAL / 'research/campaign-events'
    analysis = read(pack / 'analysis.json')
    source = analysis['source']
    manifest = read(LOCAL / 'data/raw/manifest.json')
    assert source['app_version'] == manifest['app_version'] == '1.44.88'
    assert source['config_full_hash'] == manifest['config_full_hash']
    config_path = Path(source['config_path'])
    assert sha(config_path) == source['config_sha256']
    config = read(config_path)['clientGameConfig']
    campaigns = {c['id']: c for c in config['battles']['campaigns']['Event']}
    catalog = read(LOCAL / 'data/processed/catalog.json')
    units = {h['id']: h for h in catalog['characters'] if h['kind'] == 'character'}
    portraits = read(SITE / 'src/data/heroes/round-portraits.json')
    path = SITE / 'src/data/campaign-events/guides.json'
    data = read(path)
    before = json.loads(json.dumps(data))
    data['snapshot'].update(characterBuild=source['app_version'], updatedAt='2026-11-13', contentHash=None)
    for uid, hero in data['characters'].items():
        assert uid in units
        hero['portrait'] = portraits[uid]['src']
    icons = {}
    assets = read(pack / 'assets.json')['assets']
    copies = {}

    def icon(item):
        src = pack / item['icon']
        record = assets[item['icon'].removeprefix('assets/').removesuffix('.png')]
        assert sha(src) == record['sha256']
        dest = '/images/campaign-events/rewards/' + src.name
        icons[item['name']] = dest
        copies[dest] = src

    for event in data['events']:
        campaign_id = event['rewards']['source']['campaignId']
        game = next(c for c in analysis['campaigns'] if c['event_id'] == campaign_id)
        assert set(event['requiredHeroIds']) == {h['unit_id'] for h in game['required_heroes']}
        eligible = {h['unit_id'] for faction in game['eligible_factions'] for h in faction['heroes']}
        assert set(event['supportingHeroIds']) == eligible - set(event['requiredHeroIds'])
        track = game['tracks']['extremis']
        raw_battles = {b['battleId']: b for b in campaigns[track['campaign_id']]['battles']}
        event['stageRules'] = []
        for b in track['battles']:
            sid = b['stage'].lstrip('0')
            raw = raw_battles[b['stage']]
            event['stageRules'].append({
                'stageId': sid, 'branch': 'B' if sid.endswith('B') else 'main',
                'rarityCap': b['rarity_cap'], 'deploymentLimit': raw['spawnpoints'],
                'lightningVictoryRounds': raw['lightningVictory'], 'boardId': raw['BoardId'],
                # The shared game version/hash below owns these configuration
                # values. Do not attribute refreshed fields to historical wiki text.
                'sourceIds': [],
            })
        farms = {}
        for row in track['shard_farms']:
            uid = row['hero']['unit_id']
            farms.setdefault(uid, {'hero': data['characters'].get(uid, {}).get('name', row['hero']['name'])})
            farms[uid]['regularStage' if row['resource'] == 'shards' else 'mythicStage'] = row['stage'].lstrip('0')
        chests = game['chest_shards']
        finite = [c for c in chests if not c.get('endless')]
        repeat = [c for c in chests if c.get('endless')]
        assert len(repeat) == 1
        equipment = []
        for reward in game['relic_rewards'] + game['other_mythic_equipment_rewards']:
            if reward['track'] != 'extremis':
                continue
            item = reward['item']
            icon(item)
            equipment.append({'name': item['name'], 'stage': reward['stage'].lstrip('0'),
                              'kind': 'relic' if item['is_relic'] else 'mythic_equipment',
                              'exclusiveHero': item['allowed_heroes'][0]['name'] if item['is_unique_relic'] else None})
        equipment.sort(key=lambda item: (int(item['stage'].rstrip('B')), item['stage']))
        upgrade = game['final_upgrade_farm']['upgrade']
        icon(upgrade)
        event['rewards'] = {
            'source': {'gameVersion': source['app_version'], 'verifiedAt': '2026-11-13',
                       'configSha256': source['config_sha256'], 'campaignId': campaign_id, 'preview': False},
            'shardFarms': list(farms.values()),
            'chestShards': [{'hero': data['characters'].get(t['hero']['unit_id'], {}).get('name', t['hero']['name']),
                            'initialTotal': t['regular'], 'repeatQuantity': sum(s['quantity'] for s in repeat[0]['shards'] if s['hero']['unit_id'] == t['hero']['unit_id'] and s['resource'] == 'shards')}
                           for t in game['finite_chest_shard_totals']],
            'chestTrack': {'initialChestCount': len(finite), 'finalChestPoints': finite[-1]['requiredProgress'], 'repeatPoints': repeat[0]['requiredProgress']},
            'equipment': equipment, 'finalUpgrade': upgrade['name'],
        }
        event['ruleNote'] = 'Eligibility, deployment limits, rarity caps and rewards are verified against production game data 1.44.88.'
        event['rosterNote'] = 'All eligible supports for the playable factions in character build 1.44.88 are listed. Machines of War are excluded.'
        event['versionNote'] = event['versionNote'].replace('exact current game build is not established.', 'the stage rules below use production 1.44.88.')
        if event['id'] == 'blood-angels':
            event['ruleNote'] += ' Lowest Seen remains unknown until clear evidence is available.'
    for old, new in zip(before['events'], data['events']):
        # No game refresh can turn a historical observation into a new result.
        for field in ['research', 'observations', 'requiredHeroes', 'supportingHeroes']:
            assert old[field] == new[field]
        # This resolved source limitation is not a battle observation.
        new['research']['gaps'] = [gap for gap in new['research']['gaps']
                                  if gap != 'Configuration is from Marketing / QA 1.44.120; verify against the live event.']
    for dest, src in copies.items():
        target = SITE / 'public' / dest.lstrip('/')
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists() or target.read_bytes() != src.read_bytes():
            shutil.copyfile(src, target)
    for target, value in [(path, data), (SITE / 'src/data/campaign-events/reward-icons.json', icons)]:
        target.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'campaigns': len(data['events']), 'stage_rules': sum(len(e['stageRules']) for e in data['events']), 'reward_icons': len(icons), 'game_version': source['app_version']}))


if __name__ == '__main__':
    main()
