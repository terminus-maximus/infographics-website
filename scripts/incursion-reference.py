#!/usr/bin/env python3
"""Export production Incursion rewards over legal routes, never summing exclusive branches."""
import hashlib
import json
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
LOCAL = SITE.parent / 'LocalDatabase'
read = lambda p: json.loads(p.read_text())


def route_rewards(tier, chests, uid):
    battles = {b['battleId']: b for b in tier['battles']}
    nodes = {n['index']: n for n in tier['nodes']}
    assert len(nodes) == len(tier['nodes'])
    bounds = {}
    for node in sorted(nodes.values(), key=lambda n: (n['nodeDepth'], n['index'])):
        if node['type'] == 'incursionBattle':
            rewards = [v for k, v in battles[node['battleId']]['loot'].items() if k.startswith('star')]
        elif node['type'] == 'chest':
            rewards = [v for chest in chests[node['chestId']] for v in chest['rewards']]
        else:
            assert node['type'] == 'incursionEnhancement'
            rewards = []
        parents = [bounds[p['index']] for p in node.get('unlockedBy', [])]
        assert all(set(p) == {'index'} for p in node.get('unlockedBy', []))
        values = {}
        for kind in ('shards', 'mythicShards'):
            amount = sum(int(v.split(':')[1]) if ':' in v else 1 for v in rewards if v.split(':')[0] == kind + '_' + uid)
            values[kind] = [min((p[kind][0] for p in parents), default=0) + amount,
                            max((p[kind][1] for p in parents), default=0) + amount]
        bounds[node['index']] = values
    referenced = {p['index'] for n in nodes.values() for p in n.get('unlockedBy', [])}
    ends = set(nodes) - referenced
    assert len(ends) == 1 and nodes[next(iter(ends))]['type'] == 'chest'
    return bounds[next(iter(ends))]


def main():
    manifest = read(LOCAL / 'data/raw/manifest.json')
    source = next(s for s in manifest['sources'] if s['role'] == 'balance')
    config_path = Path(source['path'])
    assert hashlib.sha256(config_path.read_bytes()).hexdigest() == source['sha256']
    assert manifest['app_version'] == '1.44.88' and manifest['bundle_id'] == 'com.snowprintstudios.tacticus'
    config = read(config_path)['clientGameConfig']
    event = next(e for e in config['liveEvents']['idunLiveEventConfigs'] if e['eventName'] == 'mow_event')
    # Native Mythic progression permits index 20. Preserve the site's reviewed
    # playable-rank display ceiling (Adamantine II, index 19).
    rank_names = [f'{name}{step}' for name in ('Stone', 'Iron', 'Bronze', 'Silver', 'Gold', 'Diamond', 'Adamantine') for step in range(1, 4)]
    caps = {}
    for step in config['units']['heroProgressionSteps']:
        caps.setdefault(step['rarity'], set()).add(step['maxRank'])
    assert all(len(values) == 1 for values in caps.values())
    caps = {rarity: next(iter(values)) for rarity, values in caps.items()}
    machines = {}
    for machine in event['mows']:
        uid = machine['unitId']
        rows = []
        assert [t['index'] for t in machine['tiers']] == list(range(14))
        for tier in machine['tiers']:
            rewards = route_rewards(tier, config['loot']['chests'], uid)
            kind = 'mythicShards' if tier['rarity'] == 'Mythic' else 'shards'
            raid_rewards = [v for chest in config['loot']['chests'][tier['raidAllChestId']] for v in chest['rewards']]
            raid = sum(int(v.split(':')[1]) if ':' in v else 1 for v in raid_rewards if v.split(':')[0] == kind + '_' + uid)
            row = {'tier': tier['index'] + 1, 'cap': rank_names[min(caps[tier['rarity']], 19)], 'initialClear': rewards[kind][1],
                   'initialClearMinimum': rewards[kind][0], 'raidOnly': raid}
            if kind == 'mythicShards':
                row.update(shardType='Mythic', extraRegularShards=rewards['shards'][1])
            rows.append(row)
        machines[uid] = {'allowedFactions': machine['allowedFactions'], 'tierRewards': list(reversed(rows))}
    result = {'schemaVersion': 1, 'gameVersion': manifest['app_version'], 'configSha256': source['sha256'],
              'verifiedAt': '2026-11-13', 'capSource': 'Production tier rarity and heroProgressionSteps.maxRank, limited to the established website Adamantine II display ceiling (index 19).',
              'nativeRankCaps': caps, 'displayRankCeiling': 19,
              'rewardBasis': 'Maximum shards along one legal route, including all star rewards and route chests. Exclusive branches are alternatives. Raid-only counts come from raidAllChestId.',
              'machines': machines, 'enhancements': event['enhancements']}
    path = SITE / 'src/data/incursion/game-rules.json'
    path.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({'machines': len(machines), 'tiers': sum(len(m['tierRewards']) for m in machines.values())}))


if __name__ == '__main__':
    main()
