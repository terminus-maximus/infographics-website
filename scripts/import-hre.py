#!/usr/bin/env python3
"""Import the frozen LocalDatabase HRE export without touching editorial research."""
import hashlib
import json
from pathlib import Path
import shutil

SITE = Path(__file__).resolve().parents[1]
LOCAL = SITE.parent / 'LocalDatabase'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    source = LOCAL / 'data/processed/hre/daras.json'
    data = json.loads(source.read_text())
    if data['schema_version'] != 1 or data['event']['hero_id'] != 'lostaFearmonger':
        raise ValueError('Unsupported HRE export')
    if sha(LOCAL / data['source']['frozen_source']) != data['source']['frozen_source_sha256']:
        raise ValueError('Frozen evidence hash mismatch; rebuild LocalDatabase HRE data')
    if len(data['missions']) != 21 or sum(q['bonus'] for q in data['missions']) != 1:
        raise ValueError('Review changed mission chain')
    copies = []
    for key, asset in data['assets'].items():
        origin = LOCAL / 'reports' / asset['path']
        if sha(origin) != asset['sha256']:
            raise ValueError(f'Icon hash mismatch: {key}')
        asset['src'] = f'/images/hre/missions/{key}.png'
        copies.append((origin, SITE / 'public' / asset['src'].lstrip('/')))
    # Existing canonical portrait and stat mappings are more useful at small size.
    portraits = json.loads((SITE / 'src/data/heroes/round-portraits.json').read_text())
    data['assets']['daras'] = {'src': portraits['lostaFearmonger']['src']}
    data['assets']['damage']['src'] = '/images/hero-profile/stats/damage.webp'
    for asset in data['assets'].values():
        if not asset['src'].startswith('/images/hre/') and not (SITE / 'public' / asset['src'].lstrip('/')).is_file():
            raise ValueError(f'Missing shared icon: {asset["src"]}')
    for origin, dest in copies:
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(origin, dest)
    # Keep local machine paths out of the site build input.
    data['source'].pop('frozen_source')
    data['source']['export_sha256'] = sha(source)
    dest = SITE / 'src/data/hre/daras.json'
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    print('Imported Daras: 20 missions + bonus, 42 objectives; editorial research preserved.')


if __name__ == '__main__':
    main()
