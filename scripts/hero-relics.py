#!/usr/bin/env python3
"""Import build 1.43.130 Relics and original item sprites, without changing LocalDatabase."""
from __future__ import annotations

import argparse
import importlib.util
import io
import json
import os
from pathlib import Path
import re
import sys
import warnings

SITE = Path(__file__).resolve().parents[1]


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--local-database", type=Path, default=SITE.parent / "LocalDatabase")
    args = parser.parse_args()
    local = args.local_database.resolve()
    sys.dont_write_bytecode = True
    try:
        import UnityPy
    except ImportError:
        interpreter = local / ".venv/bin/python"
        if interpreter.exists() and Path(sys.executable).absolute() != interpreter.absolute():
            os.execv(str(interpreter), [str(interpreter), str(Path(__file__).resolve()), *sys.argv[1:]])
        raise SystemExit("Use LocalDatabase/.venv/bin/python; UnityPy and Pillow are required.")

    assets = module("hero_assets", SITE / "scripts/hero-profile-assets.py")
    build = module("local_build", local / "scripts/build.py")
    read, sha = assets.read, assets.sha
    source_files = ["data/raw/manifest.json", "data/raw/balance.json", "data/raw/localization.en.json",
                    "data/processed/catalog.json", "scripts/build.py"]
    source_hashes = {name: sha(local / name) for name in source_files}
    manifest = read(local / "data/raw/manifest.json")
    catalog = read(local / "data/processed/catalog.json")
    reference = read(SITE / "src/data/heroes/reference.json")
    if catalog["snapshot"] != reference["snapshot"] or manifest["app_version"] != "1.43.130":
        raise ValueError("Relics require the same reviewed 1.43.130 snapshot as the hero reference")
    for key in ("app_version", "config_full_hash", "extracted_at"):
        if manifest[key] != catalog["snapshot"][key]:
            raise ValueError(f"Relic snapshot mismatch: {key}")
    for name in ("balance.json", "localization.en.json"):
        if sha(local / "data/raw" / name) != catalog["snapshot"]["snapshot_files"][name]:
            raise ValueError(f"Frozen snapshot hash mismatch: {name}")
    sources = {row["role"]: row for row in manifest["sources"]}
    config = read(assets.frozen_file(sources["balance"]))["clientGameConfig"]
    balance = read(local / "data/raw/balance.json")
    terms = read(local / "data/raw/localization.en.json")
    definitions = {a["id"]: a for a in catalog["abilities"]}
    heroes = {h["unit_id"]: h for h in reference["heroes"]}
    items = {key: value for key, value in config["items"].items() if value.get("isRelic")}
    if len(items) != 35:
        raise ValueError("Reviewed 1.43.130 Relic inventory changed")

    warnings.filterwarnings("ignore", message="No valid Unity version found.*")
    UnityPy.config.FALLBACK_UNITY_VERSION = manifest["unity_version"]
    registry_file = assets.frozen_file(sources["asset_references"])
    wanted = {("ui_icon_item_" + iid).casefold(): iid for iid in items}
    registry = {}
    for obj in UnityPy.load(str(registry_file)).objects:
        if obj.type.name != "MonoBehaviour":
            continue
        for entry in obj.read_typetree().get("references", []):
            name = entry["subAssetName"] or entry["assetName"]
            if name.casefold() in wanted:
                iid = wanted[name.casefold()]
                if iid in registry:
                    raise ValueError(f"Ambiguous Relic sprite: {iid}")
                registry[iid] = entry
    if set(registry) != set(items):
        raise ValueError("Missing Relic sprite in the frozen 1.43.130 registry")

    output = SITE / "src/data/heroes/relics.json"
    # Retain the first reviewed bundle hashes across future cache relocations.
    previous = read(output) if output.exists() else {}
    pinned_icons = {r["id"]: r["icon"] for r in previous.get("relics", [])}
    relics, generated, assigned = [], {}, set()
    for iid, item in sorted(items.items()):
        aid = item["abilityId"]
        ability = definitions[aid]
        raw = ability["raw"]
        if raw != balance["abilities"][aid] or raw != config["units"]["abilities"][aid]:
            raise ValueError(f"Relic ability differs from the frozen config: {aid}")
        if item["rarity"] != "Mythic" or len(item["levels"]) != 10 or ability["variable_lengths"] != [10]:
            raise ValueError(f"Unreviewed Relic rank domain: {iid}")
        if raw.get("variablesAffectedByRarityBonus"):
            raise ValueError(f"Unexpected rarity scaling for Relic: {iid}")
        owners = item["allowedUnits"]
        if not owners or len(set(owners)) != len(owners) or not set(owners) <= heroes.keys():
            raise ValueError(f"Invalid Relic hero mapping: {iid}")
        if assigned.intersection(owners):
            raise ValueError("Reviewed roster has at most one compatible Relic per hero")
        for uid in owners:
            if item["itemType"] not in heroes[uid]["equipment_slot_ids"]:
                raise ValueError(f"Relic slot does not match hero: {iid}/{uid}")
        assigned.update(owners)
        ranks = [build.ability_values(raw, rank, 100) for rank in range(1, 11)]
        template = ability["resolved_template"]
        descriptions = [build.render(template, values, {}) for values in ranks]
        if not all(descriptions) or any(re.search(r"\{\[.*?\]\}", text) for text in descriptions):
            raise ValueError(f"Unresolved Relic description: {iid}")

        entry = registry[iid]
        bundle = entry["assetBundleName"]
        name = entry["subAssetName"] or entry["assetName"]
        candidates = list(registry_file.parent.glob(bundle + "_*.resource"))
        pinned = pinned_icons.get(iid)
        if pinned:
            candidates = [p for p in candidates if sha(p) == pinned["source_sha256"]]
        if len(candidates) != 1:
            raise ValueError(f"Missing or ambiguous original Relic bundle: {bundle}")
        bundle_file = candidates[0]
        pictures = []
        for obj in UnityPy.load(str(bundle_file)).objects:
            if obj.type.name == "Sprite":
                sprite = obj.read()
                if sprite.m_Name == name:
                    pictures.append(sprite.image.convert("RGBA"))
        if len(pictures) != 1 or not pictures[0].getbbox():
            raise ValueError(f"Missing or ambiguous original Relic image: {iid}")
        picture = pictures[0]
        buffer = io.BytesIO()
        picture.save(buffer, format="WEBP", lossless=True, method=6, exact=True)
        relative = f"/images/hero-profile/relics/{iid}.webp"
        generated[relative] = buffer.getvalue()
        icon = {"src": relative, "width": picture.width, "height": picture.height,
                "sha256": assets.hashlib.sha256(buffer.getvalue()).hexdigest(),
                "sprite_name": name, "guid": entry["guid"], "source_bundle": bundle,
                "source_sha256": sha(bundle_file), "mapping_method": "Exact item ID in frozen 1.43.130 sprite registry"}
        relics.append({"id": iid, "ability_id": aid,
                       "name": build.plain(terms.get(f"Items/{iid}_name", ability["name"])),
                       "rarity": item["rarity"], "unique": item["isUniqueRelic"], "hero_ids": owners,
                       "rank": 10, "template": template, "ranks": ranks, "description": descriptions[-1],
                       "icon": icon, "source_pointer": f"/clientGameConfig/items/{iid}"})

    if len(assigned) != 68:
        raise ValueError("Reviewed 1.43.130 Relic hero coverage changed")
    result = {"schema_version": 1, "snapshot": catalog["snapshot"], "source_hashes": source_hashes,
              "game_config_sha256": sources["balance"]["sha256"],
              "asset_registry_sha256": sources["asset_references"]["sha256"],
              "rank_policy": "Ranks 1–10 use corresponding Relic ability entries without character rarity multipliers; default rank 10.",
              "coverage": {"relics": len(relics), "heroes": len(assigned)}, "relics": relics}
    payload = (json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False) + "\n").encode()
    if b"/Users/" in payload or b"file://" in payload:
        raise ValueError("Private path in public Relic data")
    if source_hashes != {name: sha(local / name) for name in source_files}:
        raise ValueError("Source changed during Relic import")
    changed = sum(assets.write_changed(SITE / "public" / path.lstrip("/"), content)
                  for path, content in generated.items())
    metadata_changed = assets.write_changed(output, payload)
    print(json.dumps({**result["coverage"], "changed_images": changed, "metadata_changed": metadata_changed}))


if __name__ == "__main__":
    main()
