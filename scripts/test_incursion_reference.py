import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('incursion_reference', Path(__file__).with_name('incursion-reference.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class RouteRewards(unittest.TestCase):
    def test_exclusive_branches_are_not_added_together(self):
        tier = {'battles': [
            {'battleId': 'a', 'loot': {'star1': 'shards_hero:3'}},
            {'battleId': 'b', 'loot': {'star1': 'shards_hero:7'}},
        ], 'nodes': [
            {'index': 0, 'nodeDepth': 0, 'type': 'incursionEnhancement'},
            {'index': 1, 'nodeDepth': 1, 'type': 'incursionBattle', 'battleId': 'a', 'exclusiveWith': [2], 'unlockedBy': [{'index': 0}]},
            {'index': 2, 'nodeDepth': 1, 'type': 'incursionBattle', 'battleId': 'b', 'exclusiveWith': [1], 'unlockedBy': [{'index': 0}]},
            {'index': 3, 'nodeDepth': 2, 'type': 'chest', 'chestId': 'final', 'unlockedBy': [{'index': 1}, {'index': 2}]},
        ]}
        chests = {'final': [{'rewards': ['shards_hero:2', 'mythicShards_hero:6', 'shards_someoneElse:99']}]}
        self.assertEqual(module.route_rewards(tier, chests, 'hero'), {'shards': [5, 9], 'mythicShards': [6, 6]})


if __name__ == '__main__':
    unittest.main()
