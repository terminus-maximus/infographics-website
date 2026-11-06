#!/usr/bin/env python3
"""Import the local 1.43 character reference and rectangle portraits, read-only.

Rank statistics come from LocalDatabase's materialized rank_stat table. Ability
descriptions use its existing renderer and ability_values implementation. This
script does not refresh game data or implement a competing progression formula.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import re
import sqlite3
import sys
import tempfile

SITE = Path(__file__).resolve().parents[1]


def read(path):
    return json.loads(path.read_text())


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def unique(rows, key, label):
    result = {}
    for row in rows:
        value = row[key]
        if not value or value in result:
            raise ValueError(f"Duplicate or empty {label}: {value}")
        result[value] = row
    return result


def star_label(n):
    # Same public display convention as LocalDatabase/reports/catalog.js.
    special = {11: "One blue star", 12: "Two blue stars", 13: "Three blue stars", 14: "Mythic wings"}
    if n in special:
        return special[n]
    if n > 5:
        return f"{n - 5} red star{'s' if n != 6 else ''}"
    return f"{n} star{'s' if n != 1 else ''}"


def write_changed(path, content):
    if path.exists() and path.read_bytes() == content:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as handle:
        handle.write(content)
        temporary = Path(handle.name)
    temporary.replace(path)
    return True


def filter_icon_assets(local, catalog, images, characters, image_module):
    """Keep reviewed faction badges and frozen trait/damage artwork on refresh."""
    # Faction artwork is an independent presentation choice. Reuse the committed
    # lossless Game badges rather than restoring the datamine's Clear symbols.
    faction_artwork = read(SITE / "src/data/heroes/faction-artwork.json")
    factions = faction_artwork["icons"]
    wanted = {"faction": {}, "traits": {}, "damage": {}}
    for hero in characters.values():
        wanted["faction"][hero["faction_id"]] = hero["faction_name"]
        for trait in hero["traits"]:
            if trait["id"] != "Hero":
                wanted["traits"][trait["id"]] = trait["name"]
        for weapon in hero["weapons"]:
            key = weapon["damage_profile"]
            wanted["damage"][key] = catalog["damage_profiles"][key]["name"]
    icons, assets = {}, {}
    for category, entries in wanted.items():
        icons[category] = {}
        for key, label in sorted(entries.items()):
            folder = "faction-game" if category == "faction" else f"hero-filters/{category}"
            web_path = f"/images/{folder}/{key}.webp"
            if category == "faction":
                source = factions[key]
                if source["src"] != web_path:
                    raise ValueError(f"Faction badge path disagrees: {key}")
                path, digest = SITE / "public" / web_path.lstrip("/"), source["sha256"]
            else:
                source = images["traits" if category == "traits" else "damage_profiles"][key]
                path, digest = local / "reports" / source["path"], source["sha256"]
            if sha(path) != digest:
                raise ValueError(f"Icon source hash mismatch: {category}/{key}")
            with image_module.open(path) as picture:
                if picture.size != (source["width"], source["height"]):
                    raise ValueError(f"Icon dimensions disagree: {category}/{key}")
                if category == "faction":
                    if picture.format != "WEBP":
                        raise ValueError(f"Expected a reviewed WebP faction badge: {key}")
                    assets[web_path] = path.read_bytes()
                else:
                    buffer = io.BytesIO()
                    picture.convert("RGBA").save(buffer, format="WEBP", lossless=True, method=6, exact=True)
                    assets[web_path] = buffer.getvalue()
            if label in icons[category]:
                raise ValueError(f"Ambiguous filter label: {category}/{label}")
            icons[category][label] = {"id": key, "src": web_path, "width": source["width"],
                                      "height": source["height"],
                                      "source_sha256": source["source_sha256"] if category == "faction" else digest}
            if category == "faction":
                icons[category][label].update(source_app_version=faction_artwork["app_version"],
                                              sprite_name=source["sprite_name"])
    return {"app_version": catalog["snapshot"]["app_version"], "icons": icons}, assets


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--local-database", type=Path, default=SITE.parent / "LocalDatabase")
    args = parser.parse_args()
    local = args.local_database.resolve()
    try:
        from PIL import Image
    except ImportError:
        interpreter = local / ".venv/bin/python"
        if interpreter.exists() and Path(sys.executable).absolute() != interpreter.absolute():
            os.execv(str(interpreter), [str(interpreter), str(Path(__file__).resolve()), *sys.argv[1:]])
        raise SystemExit("Pillow is required; use LocalDatabase/.venv/bin/python to run this importer.")

    processed = local / "data/processed"
    catalog = read(processed / "catalog.json")
    xref = read(processed / "character-xref.json")
    images = read(processed / "image-assets.json")
    aliases = read(processed / "legacy-aliases.json")["aliases"]
    if catalog["snapshot"]["app_version"] != "1.43.130":
        raise ValueError("This importer is reviewed for production build 1.43.130; review a new build explicitly.")
    for name, value in (("identities", xref), ("images", images)):
        if value["snapshot"] != catalog["snapshot"]:
            raise ValueError(f"Reference snapshot disagreement: {name}")
    characters = unique([row for row in catalog["characters"] if row["kind"] == "character"], "id", "character ID")
    identities = unique([row for row in xref["characters"] if row["kind"] == "character"], "unit_id", "xref ID")
    if characters.keys() != identities.keys():
        raise ValueError("Catalog and identity roster differ")
    abilities = unique(catalog["abilities"], "id", "ability ID")
    filter_icons, filter_assets = filter_icon_assets(local, catalog, images, characters, Image)
    ranks = catalog["ranks"]
    if [row["index"] for row in ranks] != list(range(len(ranks))):
        raise ValueError("Non-contiguous rank dimension requires review")
    # The source includes unreleased ranks; the guides stop at the available A2.
    max_rank = next(row["index"] for row in ranks if row["name"] == "Adamantine Rank II")
    ranks = [row for row in ranks if row["index"] <= max_rank]

    # Import pure existing calculation helpers without writing source pycache.
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location("local_reference_build", local / "scripts/build.py")
    build = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(build)

    source_files = ["data/processed/catalog.json", "data/processed/character-xref.json",
                    "data/processed/image-assets.json", "data/processed/legacy-aliases.json",
                    "data/processed/tacticus.sqlite", "scripts/build.py", "reports/catalog.js",
                    "research/calculation-rules.json"]
    source_hashes = {name: sha(local / name) for name in source_files}
    db = sqlite3.connect((processed / "tacticus.sqlite").as_uri() + "?mode=ro&immutable=1", uri=True)
    db.row_factory = sqlite3.Row
    metadata = db.execute("SELECT value_json FROM metadata WHERE key='provenance'").fetchone()
    if not metadata:
        raise ValueError("SQLite reference has no provenance")
    provenance = json.loads(metadata[0])
    for field in ("app_version", "config_full_hash", "extracted_at", "snapshot_files"):
        if provenance.get(field) != catalog["snapshot"][field]:
            raise ValueError(f"SQLite reference snapshot disagrees: {field}")
    heroes, assets, unresolved_traits = [], {}, set()
    for uid in sorted(characters):
        c, identity = characters[uid], identities[uid]
        if not re.fullmatch(r"[A-Za-z][A-Za-z0-9]*", uid):
            raise ValueError(f"Unsafe canonical asset ID: {uid}")
        if any((c[field] != identity[target]) for field, target in
               (("short_name", "short_name"), ("full_name", "display_name"), ("faction_id", "faction_id"), ("alliance_id", "alliance"))):
            raise ValueError(f"Catalog identity differs from xref: {uid}")
        asset = images["portraits"].get(uid)
        source_image = (local / "reports" / asset["path"]).resolve() if asset else None
        portrait = {"src": None, "width": 175, "height": 230, "source_sha256": None}
        if source_image and source_image.exists():
            if not source_image.is_relative_to(local / "reports") or sha(source_image) != asset["sha256"]:
                raise ValueError(f"Mismatched rectangle portrait: {uid}")
            with Image.open(source_image) as picture:
                if picture.size != (asset["width"], asset["height"]):
                    raise ValueError(f"Portrait dimensions disagree: {uid}")
                buffer = io.BytesIO()
                picture.convert("RGBA").save(buffer, format="WEBP", lossless=True, method=6, exact=True)
                image_bytes = buffer.getvalue()
            with Image.open(io.BytesIO(image_bytes)) as converted:
                if converted.size != (asset["width"], asset["height"]):
                    raise ValueError(f"WebP conversion dimensions disagree: {uid}")
            assets[uid] = image_bytes
            portrait = {"src": f"/images/heroes/{uid}.webp", "width": asset["width"],
                        "height": asset["height"], "source_sha256": asset["sha256"]}
        else:
            print(f"Portrait unavailable; neutral fallback: {uid}", file=sys.stderr)

        progression = []
        steps = catalog["progression"][uid]
        if [step["index"] for step in steps] != list(range(len(steps))):
            raise ValueError(f"Non-contiguous progression dimension: {uid}")
        for step in steps:
            rows = db.execute("SELECT rank_index, health, armor, damage FROM rank_stat WHERE character_id=? AND progression_index=? AND available=1 ORDER BY rank_index", (uid, step["index"])).fetchall()
            expected = list(range(step["max_rank"] + 1)) if step["unlocked"] else []
            if [row["rank_index"] for row in rows] != expected:
                raise ValueError(f"Invalid or missing rank statistics: {uid}/{step['index']}")
            if any(not isinstance(value, int) or value < 0 for row in rows for value in row):
                raise ValueError(f"Invalid rank statistic: {uid}/{step['index']}")
            progression.append({key: step[key] for key in ("index", "rarity", "stars", "unlocked", "max_rank", "max_ability_level")} | {
                "max_rank": min(step["max_rank"], max_rank),
                "star_label": star_label(step["stars"]), "stats": [list(row) for row in rows if row["rank_index"] <= max_rank]})
        unlocked = [step for step in steps if step["unlocked"]]
        if unlocked[0]["index"] != c["initial_progression_index"]:
            raise ValueError(f"Initial progression disagrees: {uid}")
        default = next(step for step in unlocked if step["rarity"] == "Mythic" and step["stars"] == 14)
        if default["max_rank"] < max_rank:
            raise ValueError(f"Adamantine II is missing from the default progression: {uid}")
        reference_abilities = []
        for kind in ("active", "passive"):
            for aid in c[f"{kind}_ability_ids"]:
                ability = abilities[aid]
                values = build.ability_values(ability["raw"], 60, default["ability_multiplier_pct"])
                description = build.render(ability["resolved_template"], {"UnitName": c["name"], **values}, {})
                if re.search(r"\{\[.*?\]\}", description):
                    raise ValueError(f"Unresolved regular ability description: {uid}/{aid}")
                levels_by_rarity = {}
                for rarity in dict.fromkeys(step["rarity"] for step in unlocked):
                    multipliers = {step["ability_multiplier_pct"] for step in unlocked if step["rarity"] == rarity}
                    if len(multipliers) != 1:
                        raise ValueError(f"Ability multiplier varies within rarity: {uid}/{rarity}")
                    multiplier = next(iter(multipliers))
                    levels_by_rarity[rarity] = []
                    for level in range(1, 61):
                        level_values = build.ability_values(ability["raw"], level, multiplier)
                        rendered = build.render(ability["resolved_template"], {"UnitName": c["name"], **level_values}, {})
                        if re.search(r"\{\[.*?\]\}", rendered):
                            raise ValueError(f"Unresolved ability level: {uid}/{aid}/{rarity}/{level}")
                        levels_by_rarity[rarity].append(level_values)
                reference_abilities.append({"id": aid, "name": ability["name"], "kind": kind, "level": 60,
                    "progression_index": default["index"], "rarity": default["rarity"], "stars": default["stars"],
                    "star_label": star_label(default["stars"]),
                    "available": default["index"] >= c["ability_unlock_progression"][kind],
                    "description": description, "values": values,
                    "template": ability["resolved_template"].replace("{[UnitName]}", c["name"]),
                    "levels_by_rarity": levels_by_rarity, "unlock_progression": c["ability_unlock_progression"][kind]})
        traits = []
        for trait in c["traits"]:
            if trait["unresolved_variables"]:
                unresolved_traits.add(trait["id"])
            traits.append({"id": trait["id"], "name": trait["name"], "kind": trait["kind"],
                "description": re.sub(r"\{\[.*?\]\}", "[value unavailable]", trait["description"]),
                "unresolved": bool(trait["unresolved_variables"])})
        weapons = []
        for weapon in c["weapons"]:
            damage = catalog["damage_profiles"][weapon["damage_profile"]]
            weapons.append({key: weapon[key] for key in ("kind", "hits", "range")} | {
                "damage_type_id": weapon["damage_profile"], "damage_type": damage["name"], "pierce": damage["PiercingRatio"]})
        heroes.append({"unit_id": uid, "name": c["short_name"], "full_name": c["full_name"], "title": c["title"],
            "description": c["description"], "faction_id": c["faction_id"], "faction": c["faction_name"], "alliance": c["alliance_id"],
            "aliases": sorted(aliases.get(uid, {})), "portrait": portrait,
            "initial_rarity": c["initial_rarity"], "movement": c["movement"], "traits": traits, "weapons": weapons,
            "equipment": [], "equipment_slot_ids": c["equipment_slot_types"],
            "default_progression": default["index"], "default_rank": max_rank, "progression": progression,
            "abilities": reference_abilities, "mythic_ability_status": "Not evaluated" if c["mythic_ability_ids"] else None})
    db.close()
    result = {"schema_version": 2, "snapshot": catalog["snapshot"], "source_hashes": source_hashes,
        "ranks": ranks, "stat_columns": ["rank", "health", "armor", "damage"],
        "default_policy": "Mythic, Mythic wings and Adamantine II. Available ranks stop at Adamantine II. Active and passive abilities default to level 60, with source-derived values for levels 1–60 at each unlocked rarity.",
        "limitations": [catalog["calculation_note"], "Rank arithmetic is the documented reference model, not extracted executable game logic. Conditional battle effects are excluded.",
            "Ability levels above the selected rarity's cap and locked passives are previews. Mythic ability source entries are not mapped to the regular 1–60 ability scale.",
            "Some trait quantities are unresolved in the local source and are shown as value unavailable.",
            "Equipment slot IDs are preserved; localized slot labels are unavailable and no equipment targets are supplied."],
        "coverage": {"heroes": len(heroes), "portraits": len(assets), "stat_contexts": sum(len(h["progression"]) for h in heroes),
            "stat_rows": sum(len(p["stats"]) for h in heroes for p in h["progression"]),
            "unresolved_trait_ids": sorted(unresolved_traits)}, "heroes": heroes}
    encoded = (json.dumps(result, ensure_ascii=False, separators=(",", ":"), allow_nan=False) + "\n").encode()
    if b"/Users/" in encoded or b"file://" in encoded:
        raise ValueError("Local path found in public reference payload")
    # Validate the entire generation before replacing any published inputs.
    if source_hashes != {name: sha(local / name) for name in source_files}:
        raise ValueError("Source changed during import")
    changed_assets = sum(write_changed(SITE / "public/images/heroes" / f"{uid}.webp", content) for uid, content in assets.items())
    changed_data = write_changed(SITE / "src/data/heroes/reference.json", encoded)
    changed_icons = sum(write_changed(SITE / "public" / path.lstrip("/"), content) for path, content in filter_assets.items())
    write_changed(SITE / "src/data/heroes/filter-icons.json", (json.dumps(filter_icons, ensure_ascii=False, indent=2) + "\n").encode())
    print(json.dumps({"heroes": len(heroes), "portraits": len(assets), "changed_portraits": changed_assets,
        "filter_icons": len(filter_assets), "changed_icons": changed_icons,
        "reference_changed": changed_data, "stat_rows": result["coverage"]["stat_rows"], "reference_bytes": len(encoded)}))


if __name__ == "__main__":
    main()
