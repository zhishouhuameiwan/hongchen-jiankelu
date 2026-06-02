#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_FILES = [
    ROOT / 'src' / 'data' / 'cardArt.ts',
    ROOT / 'src' / 'data' / 'characterArt.ts',
    ROOT / 'src' / 'data' / 'locationArt.ts',
    ROOT / 'src' / 'data' / 'itemArt.ts',
]
ASSET_REF = re.compile(r"['\"](/assets/(?:cards|items|locations|statuses|figures/(?:players|enemies|heroines))/[^'\"]+\.svg)['\"]")


def active_asset_paths() -> list[str]:
    paths: set[str] = set()
    for manifest in MANIFEST_FILES:
        paths.update(ASSET_REF.findall(manifest.read_text(encoding='utf-8')))
    return sorted(paths)


def source_path_for(public_path: str) -> Path:
    relative = public_path.removeprefix('/assets/').removesuffix('.svg')
    return ROOT / 'art-source' / 'doubao' / f'{relative}.png'


def main() -> None:
    print('# Active art assets')
    print('# Put Doubao exports under art-source/doubao/ with matching relative paths.')
    for public_path in active_asset_paths():
        print(f'{public_path}\t{source_path_for(public_path).relative_to(ROOT)}')


if __name__ == '__main__':
    main()
