#!/usr/bin/env python3
"""Refresh shared faction badges and legacy portrait URLs from the production app."""
import hashlib
import io
import json
from pathlib import Path
import sys

import UnityPy
from PIL import Image

SITE = Path(__file__).resolve().parents[1]
LOCAL = SITE.parent / 'LocalDatabase'
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()


def main():
    manifest = read(LOCAL / 'data/raw/manifest.json')
    assert manifest['app_version'] == '1.44.88' and manifest['bundle_id'] == 'com.snowprintstudios.tacticus'
    UnityPy.config.FALLBACK_UNITY_VERSION = manifest['unity_version']
    source = next(s for s in manifest['sources'] if s['role'] == 'asset_references')
    registry_file = Path(source['path'])
    assert sha(registry_file) == source['sha256']
    registry = {}
    for obj in UnityPy.load(str(registry_file)).objects:
        if obj.type.name == 'MonoBehaviour':
            for entry in obj.read_typetree().get('references', []):
                registry[entry['guid']] = entry
    previous = read(SITE / 'src/data/heroes/faction-artwork.json')
    groups = {}
    for fid, icon in previous['icons'].items():
        entry = registry[icon['guid']]
        assert (entry['subAssetName'] or entry['assetName']) == icon['sprite_name']
        groups.setdefault(entry['assetBundleName'], {})[icon['sprite_name']] = fid
    icons, outputs, bundles = {}, {}, {}

    def encode(picture, url):
        picture = picture.convert('RGBA')
        buffer = io.BytesIO()
        picture.save(buffer, format='WEBP', lossless=True, exact=True, method=6)
        outputs[url] = buffer.getvalue()
        assert Image.open(io.BytesIO(outputs[url])).convert('RGBA').tobytes() == picture.tobytes()
        return {'src': url, 'width': picture.width, 'height': picture.height, 'sha256': hashlib.sha256(outputs[url]).hexdigest()}

    for bundle, wanted in groups.items():
        files = list(registry_file.parent.glob(bundle + '_*.resource'))
        assert len(files) == 1
        bundles[bundle] = sha(files[0])
        for obj in UnityPy.load(str(files[0])).objects:
            if obj.type.name != 'Sprite':
                continue
            sprite = obj.read()
            if sprite.m_Name not in wanted:
                continue
            fid = wanted[sprite.m_Name]
            assert fid not in icons
            png = io.BytesIO(); sprite.image.save(png, format='PNG')
            icons[fid] = {**encode(sprite.image, f'/images/faction-game/{fid}.webp'),
                          'source_sha256': hashlib.sha256(png.getvalue()).hexdigest(),
                          'sprite_name': sprite.m_Name, 'guid': previous['icons'][fid]['guid'],
                          'source_bundle': bundle, 'source_bundle_sha256': bundles[bundle]}
    assert icons.keys() == previous['icons'].keys()
    result = {'schema_version': 1, 'style': 'Faction Game', 'app_version': manifest['app_version'],
              'bundle_id': manifest['bundle_id'], 'asset_registry_sha256': source['sha256'], 'icons': icons}
    news_sources = read(SITE / 'scripts/news-artwork-sources.json')
    news_icons = {}
    for key, spec in news_sources.items():
        entry = registry[spec['guid']]
        assert (entry['subAssetName'] or entry['assetName']) == spec['sprite_name']
        files = list(registry_file.parent.glob(entry['assetBundleName'] + '_*.resource'))
        assert len(files) == 1
        pictures = [obj.read() for obj in UnityPy.load(str(files[0])).objects if obj.type.name == 'Sprite']
        pictures = [sprite for sprite in pictures if sprite.m_Name == spec['sprite_name']]
        assert len(pictures) == 1
        news_icons[key] = {**encode(pictures[0].image, f'/images/news/rewards/{key}.webp'), **spec,
                           'source_bundle_sha256': sha(files[0])}
    ce_root = LOCAL / 'research/campaign-events'
    ce_assets = read(ce_root / 'assets.json')['assets']
    clear_icons = {}
    for fid in icons:
        record = ce_assets.get('factions/' + fid)
        if record is None:
            continue  # Other factions are not used by Campaign Events.
        src = ce_root / record['path']
        assert sha(src) == record['sha256']
        with Image.open(src) as picture:
            clear_icons[fid] = {**encode(picture, f'/images/faction-clear/{fid}.webp'), 'source_sha256': record['sha256']}
    for key in ('upgHpM002', 'upgHpM003'):
        record = ce_assets['upgrades/' + key]
        src = ce_root / record['path']
        assert sha(src) == record['sha256']
        with Image.open(src) as picture:
            encode(picture, f'/images/campaign-events/rewards/{key}.webp')
    images = read(LOCAL / 'data/processed/image-assets.json')
    assert images['snapshot']['app_version'] == manifest['app_version']
    campaign = read(SITE / 'src/data/campaigns/characters.json')['characters']
    for uid, hero in campaign.items():
        target = SITE / 'public/images/heroes' / hero['portrait']
        assert target.exists()
        with Image.open(target) as old:
            group = 'round_portraits' if old.width == old.height else 'portraits'
        record = images[group][uid]
        src = LOCAL / 'reports' / record['path']
        assert sha(src) == record['sha256']
        with Image.open(src) as picture:
            encode(picture, '/images/heroes/' + hero['portrait'])
    replay_ids = {hero['shortName']: uid for uid, hero in campaign.items()}
    replay_ids.update(Lhykis='eldarLhykhis', Nubari='astarEradicator', Vit='admecDominus')
    replay_machines = {'Boudi': 'custoDreadnought', 'Exo': 'adeptExorcist', 'FF': 'blackForgefiend',
                       'Reanimator': 'necroReanimator', 'Biovore': 'tyranBiovore', 'PBC': 'deathCrawler',
                       'Zkar': 'thousDaemonPrince', 'Galatian': 'ultraDreadnought'}
    replay_icons = {}
    for kind, mapping in [('heroes', replay_ids), ('mow', replay_machines)]:
        for target in sorted((SITE / 'public/images/replay-library' / kind).glob('*.webp')):
            uid = mapping[target.stem]
            record = images['round_portraits'][uid]
            src = LOCAL / 'reports' / record['path']
            assert sha(src) == record['sha256']
            url = '/' + target.relative_to(SITE / 'public').as_posix()
            with Image.open(src) as picture:
                replay_icons[f'{kind}/{target.stem}'] = {**encode(picture, url), 'unit_id': uid,
                                                       'source_sha256': record['sha256']}
    changed = 0
    for url, content in outputs.items():
        target = SITE / 'public' / url.lstrip('/')
        if not target.exists() or target.read_bytes() != content:
            target.parent.mkdir(parents=True, exist_ok=True); target.write_bytes(content); changed += 1
    (SITE / 'src/data/heroes/faction-artwork.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    (SITE / 'src/data/news/artwork.json').write_text(json.dumps({'game_version': manifest['app_version'], 'icons': news_icons, 'clear_factions': clear_icons}, indent=2) + '\n')
    (SITE / 'src/data/replay-library/game-artwork.json').write_text(json.dumps({'game_version': manifest['app_version'], 'icons': replay_icons}, indent=2) + '\n')
    print(json.dumps({'factions': len(icons), 'legacy_portraits': len(campaign), 'changed_assets': changed}))


if __name__ == '__main__':
    main()
