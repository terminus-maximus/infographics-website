#!/usr/bin/env python3
"""Import released MoW abilities and artwork from the frozen LocalDatabase.

Reads only; does not refresh the game snapshot. Regular ability calculations
use LocalDatabase's existing helper at every promotion, not just every rarity.
Mythic source rows correspond to the four Mythic promotions, with no regular
ability multiplier. See docs/machine-of-war-profiles.md for evidence and limits.
"""
from __future__ import annotations

import argparse
import importlib.util
import io
import json
import os
from pathlib import Path
import re
import sys

sys.dont_write_bytecode = True
SITE = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("hero_reference", SITE / "scripts/hero-reference.py")
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)


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
        raise SystemExit("Pillow is required; use LocalDatabase/.venv/bin/python.")

    read, sha = helpers.read, helpers.sha
    catalog = read(local / "data/processed/catalog.json")
    images = read(local / "data/processed/image-assets.json")
    profiles = read(SITE / "src/data/incursion/machine-profiles.json")
    if len({p["unit_id"] for p in profiles["machines"]}) != len(profiles["machines"]) or len({p["slug"] for p in profiles["machines"]}) != len(profiles["machines"]):
        raise ValueError("Duplicate machine identity or slug")
    if any(p["rating"] is not None and (type(p["rating"]) is not int or not 1 <= p["rating"] <= 5) for p in profiles["machines"]):
        raise ValueError("Ratings must be reviewed 1–5 stars or explicitly unrated")
    if sha(SITE / "public" / profiles["rating_source"].lstrip("/")) != profiles["rating_source_sha256"]:
        raise ValueError("Rating infographic changed; visually review profiles and update their approved source hash first.")
    if catalog["snapshot"]["app_version"] != "1.43.130" or images["snapshot"] != catalog["snapshot"]:
        raise ValueError("Review changes to the production snapshot before importing.")
    units = {c["id"]: c for c in catalog["characters"] if c["kind"] == "machine_of_war"}
    abilities = {a["id"]: a for a in catalog["abilities"]}
    source_files = ["data/processed/catalog.json", "data/processed/image-assets.json", "scripts/build.py"]
    hashes = {name: sha(local / name) for name in source_files}
    spec = importlib.util.spec_from_file_location("local_mow_build", local / "scripts/build.py")
    build = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(build)
    assets = {}

    def asset(group, key):
        source = images[group][key]
        path = (local / "reports" / source["path"]).resolve()
        if not path.is_relative_to(local / "reports") or sha(path) != source["sha256"]:
            raise ValueError(f"Invalid artwork: {group}/{key}")
        with Image.open(path) as original:
            rgba = original.convert("RGBA")
            if rgba.size != (source["width"], source["height"]):
                raise ValueError(f"Invalid artwork dimensions: {key}")
            buffer = io.BytesIO()
            rgba.save(buffer, format="WEBP", lossless=True, method=6, exact=True)
            content = buffer.getvalue()
            with Image.open(io.BytesIO(content)) as converted:
                if converted.convert("RGBA").tobytes() != rgba.tobytes():
                    raise ValueError(f"Artwork pixels changed: {key}")
        src = f"/images/machines/{group}/{key}.webp"
        assets[src] = content
        return {"src": src, "width": source["width"], "height": source["height"],
                "source_sha256": source["sha256"], "sha256": sha_bytes(content)}

    def description(template, values):
        rendered = build.render(template, values, {})
        if not rendered or re.search(r"\{\[.*?\]\}", rendered):
            raise ValueError(f"Unresolved description: {rendered}")
        return rendered

    machines = []
    for profile in profiles["machines"]:
        uid = profile["unit_id"]
        c = units[uid]
        # Membership is explicitly reviewed in profiles, never inferred solely
        # from releaseStatus timestamps or the presence of a datamined record.
        steps = catalog["progression"][uid]
        unlocked = [p for p in steps if p["unlocked"]]
        default = next(p for p in unlocked if p["rarity"] == "Mythic" and p["stars"] == 14)
        mythic_steps = [p for p in unlocked if p["rarity"] == "Mythic"]
        if [p["index"] for p in mythic_steps] != [16, 17, 18, 19] or c["ability_unlock_progression"]["mythic"] != 16:
            raise ValueError(f"Mythic progression mapping requires review: {uid}")
        if len(c["active_ability_ids"]) != 2 or c["passive_ability_ids"] or len(c["mythic_ability_ids"]) != 1:
            raise ValueError(f"Primary/secondary ability structure changed: {uid}")
        records = []
        # Both MoW buttons are activeAbilities in game data. The site's labels
        # follow Dan's infographic: Active = primary; Passive = secondary.
        for kind, aid in zip(("active", "passive"), c["active_ability_ids"]):
            a = abilities[aid]
            if a["index_domain"] != "ability_level":
                raise ValueError(f"Unexpected regular ability domain: {aid}")
            template = a["resolved_template"].replace("{[UnitName]}", c["name"])
            values_by_progression = {}
            for step in unlocked:
                values_by_progression[str(step["index"])] = []
                for level in range(1, 61):
                    values = build.ability_values(a["raw"], level, step["ability_multiplier_pct"])
                    description(template, values)
                    values_by_progression[str(step["index"])].append(values)
            records.append({"id": aid, "kind": kind, "name": a["name"], "icon": asset("abilities", aid),
                            "template": template, "values_by_progression": values_by_progression,
                            "description": description(template, values_by_progression[str(default["index"])][59])})
        aid = c["mythic_ability_ids"][0]
        a = abilities[aid]
        if a["index_domain"] != "mythic_source_entry" or a["variable_lengths"] != [4]:
            raise ValueError(f"Unexpected Mythic ability domain: {aid}")
        template = a["resolved_template"].replace("{[UnitName]}", c["name"])
        mythic_values = {str(step["index"]): {key: values[i] for key, values in a["raw"]["variables"].items()}
                         for i, step in enumerate(mythic_steps)}
        for values in mythic_values.values():
            description(template, values)
        records.append({"id": aid, "kind": "mythic", "name": a["name"], "icon": asset("abilities", aid),
                        "template": template, "values_by_progression": mythic_values,
                        "unlock_progression": 16, "description": description(template, mythic_values[str(default["index"])])})
        machines.append({"unit_id": uid, "name": c["short_name"], "full_name": c["full_name"],
                         "title": c["title"], "description": c["description"],
                         "faction_id": c["faction_id"], "faction": c["faction_name"], "alliance": c["alliance_id"],
                         "portrait": asset("portraits", uid), "default_progression": default["index"],
                         "progression": [{key: p[key] for key in ("index", "rarity", "stars", "max_ability_level", "ability_multiplier_pct")} |
                                         {"star_label": helpers.star_label(p["stars"])} for p in unlocked], "abilities": records})
    result = {"schema_version": 1, "snapshot": catalog["snapshot"], "source_hashes": hashes,
              "rating_source_sha256": sha(SITE / "public" / profiles["rating_source"].lstrip("/")),
              "released_as_of": profiles["released_as_of"], "machines": machines}
    encoded = (json.dumps(result, ensure_ascii=False, separators=(",", ":"), allow_nan=False) + "\n").encode()
    if b"/Users/" in encoded or b"file://" in encoded:
        raise ValueError("Private path in reference payload")
    if hashes != {name: sha(local / name) for name in source_files}:
        raise ValueError("Source changed during import")
    changed = sum(helpers.write_changed(SITE / "public" / path.lstrip("/"), content) for path, content in assets.items())
    data_changed = helpers.write_changed(SITE / "src/data/incursion/machine-reference.json", encoded)
    print(json.dumps({"machines": len(machines), "abilities": sum(len(c["abilities"]) for c in machines),
                      "assets": len(assets), "changed_assets": changed, "reference_changed": data_changed}))


def sha_bytes(content):
    import hashlib
    return hashlib.sha256(content).hexdigest()


if __name__ == "__main__":
    main()
