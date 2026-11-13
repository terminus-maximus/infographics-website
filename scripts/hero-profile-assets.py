#!/usr/bin/env python3
"""Import Hero Stats and mode tokens using the LocalDatabase production registry.

Existing rarity and rank WebPs retain their public paths. Ability WebPs are
reused only with a canonical name/legacy alias match and verified image content.
All new images retain their source dimensions and alpha in lossless WebP.
"""
from __future__ import annotations

import argparse
from collections import defaultdict
import hashlib
import io
import json
import os
from pathlib import Path
import re
import sys
import tempfile
import unicodedata
import warnings

SITE = Path(__file__).resolve().parents[1]
RARITIES = ("Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic")
STAR_SPRITES = {
    "gold": "ui_icon_star_herodetail_01",
    "red": "ui_icon_star_herodetail_epic_01",
    "blue": "ui_icon_star_legendary_01",
    "mythic-wings": "ui_icon_star_mythic_large_01",
}
MODE_SPRITES = {
    "raid": "ui_icon_resource_token_battle_guildboss",
    "war": "ui_icon_resource_token_guildwars",
    "horde": "ui_icon_resource_token_battle_waves",
}
WAR_BUNDLE = "ui/guild_war/currency"


def read(path):
    return json.loads(path.read_text())


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_changed(path, data):
    if path.exists() and path.read_bytes() == data:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as handle:
        handle.write(data)
        temporary = Path(handle.name)
    temporary.replace(path)
    return True


def normalize(value):
    return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFKD", value).lower())


def frozen_file(record):
    """Allow the app's cache directory to move; never allow its bytes to change."""
    original = Path(record["path"])
    candidates = [original]
    if "games" in original.parts:
        at = original.parts.index("games")
        root = Path(*original.parts[:at + 1])
        candidates.extend(sorted(root.glob("*/" + "/".join(original.parts[at + 2:]))))
    matches = [path for path in candidates if path.is_file() and sha(path) == record["sha256"]]
    if not matches:
        raise ValueError(f"Frozen game source unavailable or changed: {original.name}")
    return matches[0]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--local-database", type=Path, default=SITE.parent / "LocalDatabase")
    args = parser.parse_args()
    local = args.local_database.resolve()
    try:
        from PIL import Image, ImageChops, ImageStat
        import UnityPy
    except ImportError:
        interpreter = local / ".venv/bin/python"
        if interpreter.exists() and Path(sys.executable).absolute() != interpreter.absolute():
            os.execv(str(interpreter), [str(interpreter), str(Path(__file__).resolve()), *sys.argv[1:]])
        raise SystemExit("Pillow and UnityPy are required; use LocalDatabase/.venv/bin/python.")

    catalog = read(local / "data/processed/catalog.json")
    reference = read(SITE / "src/data/heroes/reference.json")
    if reference["snapshot"] != catalog["snapshot"]:
        raise ValueError("Profile icons and reference snapshot differ; import the reference first")
    images = read(local / "data/processed/image-assets.json")
    manifest = read(local / "data/raw/manifest.json")
    aliases = read(local / "data/processed/legacy-aliases.json")["aliases"]
    if catalog["snapshot"] != images["snapshot"] or catalog["snapshot"]["app_version"] != "1.44.88":
        raise ValueError("Reviewed 1.44.88 reference snapshot required")
    if any(manifest[key] != catalog["snapshot"][key] for key in ("app_version", "config_full_hash")):
        raise ValueError("Raw asset snapshot differs from catalog")
    warnings.filterwarnings("ignore", message="No valid Unity version found.*")
    UnityPy.config.FALLBACK_UNITY_VERSION = manifest["unity_version"]

    generated = {}
    def encode(picture, relative, provenance):
        picture = picture.convert("RGBA")
        buffer = io.BytesIO()
        picture.save(buffer, format="WEBP", lossless=True, method=6, exact=True)
        generated[relative] = buffer.getvalue()
        return {"src": relative, "width": picture.width, "height": picture.height,
                "sha256": hashlib.sha256(buffer.getvalue()).hexdigest(), **provenance}

    def existing(relative, provenance):
        path = SITE / "public" / relative.lstrip("/")
        with Image.open(path) as picture:
            if picture.format != "WEBP":
                raise ValueError(f"Expected WebP: {relative}")
            return {"src": relative, "width": picture.width, "height": picture.height,
                    "sha256": sha(path), **provenance}

    # Registry and atlas are both byte-verified against LocalDatabase's snapshot.
    registry_record = next(s for s in manifest["sources"] if s["role"] == "asset_references")
    registry_file = frozen_file(registry_record)
    main_record = images["bundle_sources"]["atlases/main"]
    war_files = list(registry_file.parent.glob(WAR_BUNDLE + "_*.resource"))
    if len(war_files) != 1:
        raise ValueError("Expected one Guild War token bundle in the selected production app")
    bundle_records = {"atlases/main": main_record, WAR_BUNDLE: {
        "path": str(war_files[0]), "sha256": sha(war_files[0]),
    }}
    needed_sprites = set(STAR_SPRITES.values()) | set(MODE_SPRITES.values()) | {f"ui_icon_checkbox_{r.lower()}" for r in RARITIES[:4]}
    registry = {}
    for obj in UnityPy.load(str(registry_file)).objects:
        if obj.type.name == "MonoBehaviour":
            tree = obj.read_typetree()
            for entry in tree.get("references", []):
                name = entry["subAssetName"] or entry["assetName"]
                if name in needed_sprites:
                    expected_bundle = WAR_BUNDLE if name == MODE_SPRITES["war"] else "atlases/main"
                    if name in registry or entry["assetBundleName"] != expected_bundle:
                        raise ValueError(f"Ambiguous icon registry entry: {name}")
                    registry[name] = entry
    if set(registry) != needed_sprites:
        raise ValueError("Progression icons missing from frozen registry")
    sprites = {}
    for bundle, record in bundle_records.items():
        for obj in UnityPy.load(str(frozen_file(record))).objects:
            if obj.type.name == "Sprite":
                sprite = obj.read()
                if sprite.m_Name in needed_sprites and registry[sprite.m_Name]["assetBundleName"] == bundle:
                    if sprite.m_Name in sprites:
                        raise ValueError(f"Duplicate atlas sprite: {sprite.m_Name}")
                    sprites[sprite.m_Name] = sprite.image
    if set(sprites) != needed_sprites:
        raise ValueError("Progression icons missing from frozen atlas")

    def atlas_icon(name, relative):
        bundle = registry[name]["assetBundleName"]
        return encode(sprites[name], relative, {"sprite_name": name, "guid": registry[name]["guid"],
            "source_bundle": bundle, "source_sha256": bundle_records[bundle]["sha256"],
            "mapping_method": "exact frozen game sprite name"})

    modes = {mode: atlas_icon(name, f"/images/hero-profile/modes/{mode}.webp") for mode, name in MODE_SPRITES.items()}
    modes["war"]["source_app_version"] = manifest["app_version"]
    modes["popularity"] = existing("/images/ranks/energy.webp",
        {"mapping_method": "existing game Energy (Stamina) icon, selected for Popularity"})

    rarities = {}
    for rarity in RARITIES:
        if rarity in ("Legendary", "Mythic"):
            rarities[rarity] = existing(f"/images/replay-library/tier/{rarity.lower()}.webp",
                {"mapping_method": "existing Replay Library rarity icon"})
        else:
            rarities[rarity] = atlas_icon(f"ui_icon_checkbox_{rarity.lower()}",
                f"/images/hero-profile/rarities/{rarity.lower()}.webp")

    star_art = {key: atlas_icon(name, f"/images/hero-profile/stars/{key}.webp") for key, name in STAR_SPRITES.items()}
    stars = {}
    for number in range(15):
        color = "gold" if number <= 5 else "red" if number <= 10 else "blue" if number <= 13 else "mythic-wings"
        count = number if number <= 5 else number - 5 if number <= 10 else number - 10 if number <= 13 else 1
        stars[str(number)] = {**star_art[color], "count": count}
    ranks = {}
    for rank in reference["ranks"]:
        metal, _, roman = rank["name"].split()
        numeral = {"I": 1, "II": 2, "III": 3}[roman]
        ranks[str(rank["index"])] = existing(f"/images/ranks/{metal.lower()}-{numeral}.webp",
            {"name": rank["name"], "mapping_method": "canonical catalog rank name to existing rank icon"})

    def source_picture(record):
        source = local / "reports" / record["path"]
        if sha(source) != record["sha256"]:
            raise ValueError(f"Source PNG hash mismatch: {record['path']}")
        picture = Image.open(source).convert("RGBA")
        if picture.size != (record["width"], record["height"]):
            raise ValueError(f"Source dimensions differ: {record['path']}")
        return picture

    def png_provenance(record):
        return {"source_sha256": record["sha256"], "sprite_name": record["sprite_name"],
            "guid": record["guid"], "mapping_method": record["mapping_method"]}

    stats = {key: encode(source_picture(record), f"/images/hero-profile/stats/{key}.webp", png_provenance(record))
             for key, record in images["stats"].items()}
    existing_abilities = defaultdict(list)
    for file in sorted((SITE / "public/images/abilities").glob("*.webp")):
        existing_abilities[normalize(file.stem)].append(file)
    abilities = {}
    reused = 0
    for hero in catalog["characters"]:
        if hero["kind"] != "character":
            continue
        names = {hero["short_name"], hero["name"], *aliases.get(hero["id"], {})}
        for kind in ("active", "passive"):
            for aid in hero[f"{kind}_ability_ids"]:
                if aid in abilities:
                    continue
                source = images["abilities"][aid]
                picture = source_picture(source)
                candidates = {p for name in names for p in existing_abilities[normalize(name + kind)]}
                matched = []
                for file in sorted(candidates):
                    with Image.open(file) as candidate:
                        candidate = candidate.convert("RGBA")
                        if picture.size != candidate.size or ImageChops.difference(picture.getchannel("A"), candidate.getchannel("A")).getbbox():
                            continue
                        # Lossy WebPs can alter RGB but preserve the source alpha.
                        error = ImageStat.Stat(ImageChops.difference(picture, candidate), picture.getchannel("A")).rms
                        if max(error) <= 16:
                            matched.append((max(error), file))
                if matched:
                    error, file = min(matched)
                    relative = "/" + file.relative_to(SITE / "public").as_posix()
                    abilities[aid] = existing(relative, {**png_provenance(source),
                        "reuse_check": "canonical hero name or recorded legacy alias, matching ability kind, exact alpha and RGB RMS <= 16",
                        "source_rgb_rms": round(error, 6)})
                    reused += 1
                else:
                    if not re.fullmatch(r"[A-Za-z0-9_-]+", aid):
                        raise ValueError(f"Unsafe ability ID: {aid}")
                    abilities[aid] = encode(picture, f"/images/hero-profile/abilities/{aid}.webp", png_provenance(source))

    result = {"schema_version": 1, "app_version": catalog["snapshot"]["app_version"],
              "config_full_hash": catalog["snapshot"]["config_full_hash"],
              "rarities": rarities, "stars": stars, "ranks": ranks, "stats": stats, "abilities": abilities, "modes": modes,
              "notes": ["Legendary/Mythic rarity art reuses Replay Library. Lower rarities use the game's rarity checkbox sprites.",
                        "Stars repeat an original game sprite count times; Mythic wings use their own original sprite.",
                        "No separate range icon is mapped in the source; use the ranged attack icon beside range text.",
                        "GetStuckIn and Unstoppable retain LocalDatabase's generic unknown trait icon."]}
    payload = (json.dumps(result, ensure_ascii=False, indent=2) + "\n").encode()
    if b"/Users/" in payload:
        raise ValueError("Local path leaked into public icon metadata")
    changed = sum(write_changed(SITE / "public" / path.lstrip("/"), content) for path, content in generated.items())
    metadata_changed = write_changed(SITE / "src/data/heroes/profile-icons.json", payload)
    print(json.dumps({"rarities": len(rarities), "stars": len(stars), "ranks": len(ranks), "stats": len(stats),
                      "abilities": len(abilities), "modes": len(modes), "reused_abilities": reused, "generated_images": len(generated),
                      "changed_images": changed, "metadata_changed": metadata_changed}))


if __name__ == "__main__":
    main()
