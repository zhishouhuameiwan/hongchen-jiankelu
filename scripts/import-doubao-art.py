#!/usr/bin/env python3
from __future__ import annotations

import argparse
import base64
import html
import io
import re
import sys
from pathlib import Path
from xml.etree import ElementTree as ET

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / "art-source" / "doubao"
ASSET_ROOT = ROOT / "public" / "assets"
SUPPORTED_SOURCE_SUFFIXES = (".png", ".webp", ".jpg", ".jpeg")
MANIFEST_FILES = [
    ROOT / "src" / "data" / "cardArt.ts",
    ROOT / "src" / "data" / "characterArt.ts",
    ROOT / "src" / "data" / "locationArt.ts",
    ROOT / "src" / "data" / "itemArt.ts",
]
ASSET_REF = re.compile(r"['\"](/assets/(?:cards|items|locations|statuses|figures/(?:players|enemies|heroines))/[^'\"]+\.svg)['\"]")
SMALL_PREFIXES = ("cards/", "items/", "locations/", "statuses/")
FIGURE_PREFIXES = ("figures/players/", "figures/enemies/", "figures/heroines/")


def active_asset_paths() -> list[str]:
    paths: set[str] = set()
    for manifest in MANIFEST_FILES:
        paths.update(ASSET_REF.findall(manifest.read_text(encoding="utf-8")))
    return sorted(paths)


def relative_asset_path(public_path: str) -> str:
    return public_path.removeprefix("/assets/")


def source_stem_for(public_path: str) -> Path:
    return SOURCE_ROOT / relative_asset_path(public_path).removesuffix(".svg")


def find_source(public_path: str) -> Path | None:
    stem = source_stem_for(public_path)
    for suffix in SUPPORTED_SOURCE_SUFFIXES:
        candidate = stem.with_suffix(suffix)
        if candidate.exists():
            return candidate
    return None


def expected_size(relative: str) -> tuple[int, int]:
    if relative.startswith(SMALL_PREFIXES):
        return 120, 160
    if relative.startswith(FIGURE_PREFIXES):
        return 360, 480
    raise ValueError(f"Unsupported asset path: {relative}")


def classify_kind(relative: str) -> str:
    if relative.startswith("cards/"):
        return "card"
    if relative.startswith("items/"):
        return "item"
    if relative.startswith("locations/"):
        return "location"
    if relative.startswith("statuses/"):
        return "status"
    if relative.startswith("figures/players/"):
        return "player"
    if relative.startswith("figures/heroines/"):
        return "heroine"
    if relative.startswith("figures/enemies/"):
        return "enemy"
    return "asset"


def title_from_path(relative: str) -> str:
    return Path(relative).stem.replace("_", " ")


def resize_to_cover(source: Path, width: int, height: int) -> bytes:
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        image = ImageOps.fit(image, (width, height), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
        buffer = io.BytesIO()
        image.save(buffer, format="PNG", optimize=True)
        return buffer.getvalue()


def write_svg_wrapper(public_path: str, source: Path) -> None:
    relative = relative_asset_path(public_path)
    width, height = expected_size(relative)
    kind = classify_kind(relative)
    png_bytes = resize_to_cover(source, width, height)
    encoded = base64.b64encode(png_bytes).decode("ascii")
    label = title_from_path(relative)
    source_note = source.relative_to(ROOT).as_posix()
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-label="{html.escape(label)} · 豆包生成古风武侠图像" data-art-direction="ancient-wuxia" data-kind="{kind}" data-generated-by="doubao" data-source="{html.escape(source_note)}">
  <title>{html.escape(label)} · 豆包生成古风武侠图像</title>
  <desc>由本地豆包软件按 docs/doubao-image-prompts.md 的深化提示词生成，并由 scripts/import-doubao-art.py 裁切为 3:4 后嵌入。古风武侠，江湖水墨。</desc>
  <image href="data:image/png;base64,{encoded}" x="0" y="0" width="{width}" height="{height}" preserveAspectRatio="xMidYMid slice" />
</svg>
'''
    target = ASSET_ROOT / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(svg, encoding="utf-8")


def validate_svg(public_path: str) -> None:
    relative = relative_asset_path(public_path)
    target = ASSET_ROOT / relative
    if not target.exists():
        raise FileNotFoundError(f"Missing asset: {target.relative_to(ROOT)}")
    text = target.read_text(encoding="utf-8")
    ET.fromstring(text)
    width, height = expected_size(relative)
    viewbox = f'viewBox="0 0 {width} {height}"'
    if viewbox not in text:
        raise ValueError(f"{target.relative_to(ROOT)} should keep {viewbox}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Import Doubao raster exports into stable SVG asset wrappers.")
    parser.add_argument("--check", action="store_true", help="Validate existing assets and report pending Doubao exports without writing.")
    parser.add_argument("--strict-sources", action="store_true", help="Fail if any active asset lacks a Doubao source image.")
    args = parser.parse_args()

    paths = active_asset_paths()
    imported = 0
    missing_sources: list[str] = []
    for public_path in paths:
        validate_svg(public_path)
        source = find_source(public_path)
        if source is None:
            missing_sources.append(str(source_stem_for(public_path).relative_to(ROOT)) + ".{png,webp,jpg,jpeg}")
            continue
        if not args.check:
            write_svg_wrapper(public_path, source)
            validate_svg(public_path)
        imported += 1

    if args.strict_sources and missing_sources:
        print("Missing Doubao source image(s):", file=sys.stderr)
        for item in missing_sources:
            print(f"  - {item}", file=sys.stderr)
        return 1

    if args.check:
        print(f"Validated {len(paths)} active SVG assets. Doubao source images present: {imported}. Pending sources: {len(missing_sources)}.")
    else:
        print(f"Imported {imported} Doubao source image(s) into stable SVG wrappers. Pending sources: {len(missing_sources)}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
