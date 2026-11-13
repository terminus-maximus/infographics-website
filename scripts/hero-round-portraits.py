#!/usr/bin/env python3
"""Map every canonical hero to a true production round portrait in WebP format.

Reuse the site's stable-ID LRE portrait mappings only when their decoded image
matches the canonical round source. Missing or divergent art is converted from
LocalDatabase's original round PNG, never cropped from a rectangular portrait.
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

SITE = Path(__file__).resolve().parents[1]


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


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--local-database", type=Path, default=SITE.parent / "LocalDatabase")
    args = parser.parse_args()
    local = args.local_database.resolve()
    try:
        from PIL import Image, ImageChops, ImageStat
    except ImportError:
        interpreter = local / ".venv/bin/python"
        if interpreter.exists() and Path(sys.executable).absolute() != interpreter.absolute():
            os.execv(str(interpreter), [str(interpreter), str(Path(__file__).resolve()), *sys.argv[1:]])
        raise SystemExit("Pillow is required; use LocalDatabase/.venv/bin/python.")

    catalog = read(local / "data/processed/catalog.json")
    assets = read(local / "data/processed/image-assets.json")
    if catalog["snapshot"] != assets["snapshot"] or catalog["snapshot"]["app_version"] != "1.44.88":
        raise ValueError("Reviewed 1.44.88 snapshot required")
    roster = {hero["id"]: hero for hero in catalog["characters"] if hero["kind"] == "character"}
    if len(roster) != 120:
        raise ValueError("Canonical production roster differs from reviewed 120 heroes")
    existing = defaultdict(lambda: defaultdict(list))
    for file in sorted((SITE / "src/data/lre").glob("*.json")):
        for hero in read(file).get("characters", []):
            if hero.get("id") in roster and hero.get("portrait", "").endswith(".webp"):
                existing[hero["id"]][hero["portrait"]].append(file.relative_to(SITE).as_posix())

    output, generated = {}, {}
    reused = 0
    for uid in sorted(roster):
        if not re.fullmatch(r"[A-Za-z][A-Za-z0-9]*", uid):
            raise ValueError(f"Unsafe canonical hero identifier: {uid}")
        source = assets["round_portraits"][uid]
        png = (local / "reports" / source["path"]).resolve()
        if not png.is_relative_to(local / "reports") or sha(png) != source["sha256"]:
            raise ValueError(f"Round portrait source hash mismatch: {uid}")
        picture = Image.open(png).convert("RGBA")
        if picture.size != (source["width"], source["height"]) or picture.width != picture.height:
            raise ValueError(f"Round portrait dimensions disagree: {uid}")
        # Verify the image-assets ID against the catalog's own visual GUID.
        if source["guid"] != roster[uid]["visual"]["portraits"]["round_portrait"]["guid"]:
            raise ValueError(f"Round portrait identity mismatch: {uid}")
        matches = []
        for relative, mappings in sorted(existing[uid].items()):
            path = (SITE / "public" / relative.lstrip("/")).resolve()
            if not path.is_relative_to(SITE / "public") or not path.is_file():
                continue
            with Image.open(path) as candidate:
                if candidate.format != "WEBP" or candidate.size != picture.size:
                    continue
                candidate = candidate.convert("RGBA")
                rms = ImageStat.Stat(ImageChops.difference(picture, candidate), picture.getchannel("A")).rms
                # Existing lossy WebPs can differ slightly from original RGB
                # and edge alpha. The stable-ID mapping supplies the identity;
                # this check rejects stale/different art and rectangular crops.
                if max(rms[:3]) <= 16 and rms[3] <= 3:
                    matches.append((max(rms), relative, mappings, rms, sha(path)))
        provenance = {"source_sha256": source["sha256"], "source_sprite": source["sprite_name"],
                      "source_guid": source["guid"], "source_kind": "round_portraits",
                      "app_version": catalog["snapshot"]["app_version"]}
        if matches:
            _, relative, mappings, rms, digest = min(matches)
            output[uid] = {"src": relative, "width": picture.width, "height": picture.height,
                "sha256": digest, **provenance, "mapping_method": "canonical hero ID in existing LRE portrait mapping; checked against original round sprite",
                "mapping_sources": mappings, "source_rms": [round(value, 6) for value in rms]}
            reused += 1
        else:
            buffer = io.BytesIO()
            picture.save(buffer, format="WEBP", lossless=True, method=6, exact=True)
            content = buffer.getvalue()
            relative = f"/images/hero-round/{uid}.webp"
            generated[relative] = content
            output[uid] = {"src": relative, "width": picture.width, "height": picture.height,
                "sha256": hashlib.sha256(content).hexdigest(), **provenance,
                "mapping_method": "canonical hero visual GUID to original round sprite; lossless WebP"}

    if set(output) != set(roster):
        raise ValueError("Incomplete canonical round portrait coverage")
    payload = (json.dumps(output, ensure_ascii=False, indent=2) + "\n").encode()
    if b"/Users/" in payload:
        raise ValueError("Local path leaked into portrait metadata")
    changed = sum(write_changed(SITE / "public" / path.lstrip("/"), content) for path, content in generated.items())
    metadata_changed = write_changed(SITE / "src/data/heroes/round-portraits.json", payload)
    print(json.dumps({"heroes": len(output), "reused": reused, "generated": len(generated),
                      "changed_images": changed, "metadata_changed": metadata_changed}))


if __name__ == "__main__":
    main()
