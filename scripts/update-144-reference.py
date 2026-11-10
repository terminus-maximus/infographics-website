#!/usr/bin/env python3
"""Import the two approved Game Version 1.44.120 profiles without replacing the base roster."""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import io
import json
import os
import re
import sys
from pathlib import Path

sys.dont_write_bytecode = True
SITE = Path(__file__).resolve().parents[1]


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--local-database', type=Path, default=SITE.parent / 'LocalDatabase')
    parser.add_argument('--infographics', type=Path, default=Path.home() / 'Documents/Tacticus/Infographics')
    args = parser.parse_args()
    local, info = args.local_database, args.infographics
    try:
        from PIL import Image
        import UnityPy
    except ImportError:
        interpreter = local / '.venv/bin/python'
        if interpreter.exists() and Path(sys.executable).absolute() != interpreter.absolute():
            os.execv(str(interpreter), [str(interpreter), str(Path(__file__).resolve()), *sys.argv[1:]])
        raise SystemExit('Pillow and UnityPy are required; use LocalDatabase/.venv/bin/python.')
    helpers = module('hero_reference', SITE / 'scripts/hero-reference.py')
    build = module('build', local / 'scripts/build.py')
    sys.modules['build'] = build
    catalog = module('catalog', local / 'scripts/catalog.py')
    read, sha = helpers.read, helpers.sha
    config_path = local / 'research/blood-angels-ce/marketing-gameconfig.json'
    terms_path = local / 'research/lysander-update-2026-11-08/preview-localization.json'
    manifest = read(local / 'research/whats-new-1.44/manifest.json')
    assert manifest['build']['build'] == '1.44.120'
    assert sha(config_path) == manifest['config_sha256']
    assert sha(terms_path) == manifest['localization_sha256']
    original, terms = read(config_path), read(terms_path)
    language_path = Path(manifest['build']['localization_path'])
    assert sha(language_path) == manifest['build']['localization_sha256']
    game_data = Path(manifest['build']['app']) / 'Contents/Resources/Data'
    UnityPy.config.FALLBACK_UNITY_VERSION = re.search(rb'\d{4}\.\d+\.\d+[a-z]\d+', (game_data / 'globalgamemanagers').read_bytes()[:128]).group().decode()
    for obj in UnityPy.load(str(language_path)).objects:
        if obj.type.name == 'MonoBehaviour':
            tree = obj.read_typetree()
            for term in tree.get('mSource', {}).get('mTerms', []):
                key, value = term['Term'], term['Languages'][0]
                if key in terms:
                    assert terms[key] == value
                terms[key] = value
    assert original['fullConfigHash'] == manifest['build']['config_full_hash']
    config = original['clientGameConfig']
    balance = config['units']
    rules = read(local / 'research/calculation-rules.json')
    editorial = read(SITE / 'src/data/updates/1.44.120-profiles.json')
    assert [h['unit_id'] for h in editorial['heroes']] == ['lostaFearmonger']
    assert [h['unit_id'] for h in editorial['machines']] == ['custoDreadnought']
    source_hashes = {'configuration': sha(config_path), 'localization': sha(terms_path), 'language_bundle': sha(language_path),
                     'calculations': sha(local / 'scripts/build.py'), 'progression': sha(local / 'scripts/catalog.py')}
    assets = {}

    def image(source, dest):
        with Image.open(source) as picture:
            rgba = picture.convert('RGBA')
            output = io.BytesIO()
            rgba.save(output, format='WEBP', lossless=True, exact=True, method=6)
            content = output.getvalue()
            with Image.open(io.BytesIO(content)) as converted:
                assert converted.convert('RGBA').tobytes() == rgba.tobytes()
            assets[dest] = content
            return {'src': dest, 'width': rgba.width, 'height': rgba.height,
                    'source_sha256': sha(source), 'sha256': hashlib.sha256(content).hexdigest()}

    def description(template, values):
        text = build.render(template, values, {})
        assert text and not re.search(r'\{\[.*?\]\}', text), text
        return text

    def ability(aid, kind, c, steps, icon_name):
        raw = balance['abilities'][aid]
        template = catalog.prepared_template({'raw': raw, 'description_template': terms[f'Abilities/{aid}_CurrentLevelDescription']}, terms)
        # Shared battle constants are referenced by Daras's poison text.
        template = build.render(template, {**config['globalValues']['unitEffectVariables'], 'UnitName': c['name']}, {})
        icon_dir = 'machines/abilities' if c['kind'] == 'machine_of_war' else 'hero-profile/abilities'
        icon = image(info / 'Icons/Abilities' / icon_name, f'/images/{icon_dir}/{aid}.webp')
        result = {'id': aid, 'kind': kind, 'name': build.plain(terms[f'Abilities/{aid}_Name']), 'icon': icon, 'template': template}
        if kind == 'mythic':
            mythic = [p for p in steps if p['rarity'] == 'Mythic']
            assert [p['index'] for p in mythic] == [16, 17, 18, 19]
            assert all(len(v) == 4 for v in raw['variables'].values())
            result['values_by_progression'] = {str(p['index']): {k: v[i] for k, v in raw['variables'].items()} for i, p in enumerate(mythic)}
            result['unlock_progression'] = config['globalValues']['tertiaryAbilityUnlockProgressionRequirementMow']
            result['description'] = description(template, result['values_by_progression']['19'])
            for values in result['values_by_progression'].values():
                description(template, values)
        else:
            assert all(len(v) >= 60 for v in raw['variables'].values())
            curves = {}
            for p in steps:
                if not p['unlocked']:
                    continue
                key = str(p['index']) if c['kind'] == 'machine_of_war' else p['rarity']
                values = [build.ability_values(raw, level, p['ability_multiplier_pct']) for level in range(1, 61)]
                if key in curves:
                    assert curves[key] == values
                curves[key] = values
                for row in values:
                    description(template, row)
            if c['kind'] == 'machine_of_war':
                result['values_by_progression'] = curves
                result['description'] = description(template, curves['19'][59])
            else:
                result.update(level=60, progression_index=19, rarity='Mythic', stars=14,
                              star_label=helpers.star_label(14), available=True,
                              levels_by_rarity=curves, values=curves['Mythic'][59],
                              unlock_progression=config['globalValues'][kind + 'AbilityUnlockProgressionRequirement'])
                result['description'] = description(template, result['values'])
        return result

    heroes, machines = [], []
    for uid, asset_name in [('lostaFearmonger', 'Daras'), ('custoDreadnought', 'Boudicari')]:
        c = build.make_character(uid, balance['lineup'][uid], terms, rules)
        steps = catalog.progression_for(c, balance)
        assert steps[-1]['rarity'] == 'Mythic' and steps[-1]['stars'] == 14 and steps[-1]['index'] == 19
        mow = c['kind'] == 'machine_of_war'
        portrait_dir = 'machines/portraits' if mow else 'heroes'
        record = {'unit_id': uid, 'game_version': '1.44.120', 'name': c['short_name'], 'full_name': c['full_name'],
                  'title': c['title'], 'description': c['description'], 'faction_id': c['faction_id'],
                  'faction': c['faction_name'], 'alliance': c['alliance_id'], 'default_progression': 19,
                  'portrait': image(info / 'Character Portraits' / f'{asset_name}.png', f'/images/{portrait_dir}/{uid}.webp')}
        if mow:
            record['progression'] = [{k: p[k] for k in ['index', 'rarity', 'stars', 'max_ability_level', 'ability_multiplier_pct']} |
                                     {'star_label': helpers.star_label(p['stars'])} for p in steps if p['unlocked']]
            assert c['active_ability_ids'] == ['WrathfulAdvance', 'RelentlessPersecution']
            assert c['mythic_ability_ids'] == ['DefiantToTheLast']
            record['abilities'] = [ability(aid, kind, c, steps, filename) for aid, kind, filename in [
                ('WrathfulAdvance', 'active', 'Boudicari - Active 1 - Wrathful Advance.png'),
                ('RelentlessPersecution', 'passive', 'Boudicari - Active 2 - Relentless Persecution.png'),
                ('DefiantToTheLast', 'mythic', 'Boudicari - Mythic - Defiant to the Last.png')]]
            machines.append(record)
        else:
            record.update(aliases=[c['full_name']], initial_rarity=c['initial_rarity'], movement=c['movement'],
                          equipment=[], equipment_slot_ids=c['equipment_slot_types'], default_rank=19,
                          mythic_ability_status=None, relics=[])
            assert not any(item.get('isRelic') and uid in item.get('allowedUnits', []) for item in config['items'].values())
            record['round_portrait'] = image(info / 'Character Round Portraits/Daras.png', '/images/hero-round/Daras.webp')
            record['progression'] = [{k: p[k] for k in ['index', 'rarity', 'stars', 'unlocked', 'max_ability_level']} |
                {'max_rank': min(19, p['max_rank']), 'star_label': helpers.star_label(p['stars']),
                 'stats': [[rank, *[build.stat_value(c['base_stats'][stat], rank, p['stat_multiplier_pct']) for stat in ['health', 'armor', 'damage']]]
                           for rank in range(min(19, p['max_rank']) + 1)] if p['unlocked'] else []} for p in steps]
            record['traits'] = [{k: t[k] for k in ['id', 'name', 'kind']} |
                {'description': re.sub(r'\{\[.*?\]\}', '[value unavailable]', t['description']), 'unresolved': bool(t['unresolved_variables'])} for t in c['traits']]
            record['weapons'] = [{k: w[k] for k in ['kind', 'hits', 'range']} |
                {'damage_type_id': w['damage_profile'], 'damage_type': build.render(terms[f"UnitDetails/DamageProfile_{w['damage_profile']}_Name"], {}, terms),
                 'pierce': balance['damageProfiles'][w['damage_profile']]['PiercingRatio']} for w in c['weapons']]
            record['abilities'] = [ability(aid, kind, c, steps, filename) for aid, kind, filename in [
                ('ProclivityForMurder', 'active', 'Daras - Active - Proclivity for Murder.png'),
                ('TerrorchemPoison', 'passive', 'Daras - Passive - Terrorchem Poison.png')]]
            heroes.append(record)
    result = {'schema_version': 1, 'game_version': '1.44.120', 'config_full_hash': original['fullConfigHash'],
              'source_hashes': source_hashes, 'heroes': heroes, 'machines': machines}
    encoded = (json.dumps(result, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + '\n').encode()
    assert not re.search(rb'/Users/|file://|marketing|datamine', encoded, re.I)
    assert sha(config_path) == source_hashes['configuration'] and sha(terms_path) == source_hashes['localization']
    changed = sum(helpers.write_changed(SITE / 'public' / path.lstrip('/'), content) for path, content in assets.items())
    updated = helpers.write_changed(SITE / 'src/data/updates/1.44.120-reference.json', encoded)
    print(json.dumps({'heroes': len(heroes), 'machines': len(machines), 'assets': len(assets), 'changed_assets': changed, 'reference_changed': updated}))


if __name__ == '__main__':
    main()
