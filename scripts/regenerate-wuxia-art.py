#!/usr/bin/env python3
from __future__ import annotations

import html
import re
from pathlib import Path
from typing import Callable

ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / 'public' / 'assets'
MANIFEST_FILES = [
    ROOT / 'src' / 'data' / 'cardArt.ts',
    ROOT / 'src' / 'data' / 'characterArt.ts',
    ROOT / 'src' / 'data' / 'locationArt.ts',
]
ACTIVE_DIRECTORIES = (
    'cards/',
    'figures/players/',
    'figures/enemies/',
    'figures/heroines/',
    'locations/',
    'statuses/',
)

CARD_META = {
    'basic_slash': ('劈风斩', 'attack', 'starter', '山道狂风 · 白刃破空', '#8f2e1f', 'sword'),
    'basic_guard': ('横剑格挡', 'defense', 'starter', '横剑如门 · 铁壁迎锋', '#496072', 'shield'),
    'basic_breath': ('调息', 'inner', 'starter', '松下吐纳 · 丹田回春', '#2c6c58', 'breath'),
    'cloud_step': ('流云步', 'movement', 'town', '踏瓦逐云 · 身似游龙', '#3d6d91', 'boots'),
    'iron_cloth': ('铁布衫', 'defense', 'forest', '金钟护体 · 铁衣不破', '#6b583f', 'armor'),
    'qingshuang_sword': ('青霜一剑', 'attack', 'shen_qingshuang', '霜华一线 · 剑心无尘', '#5e8ab8', 'frost_sword'),
    'stand_together': ('并肩御敌', 'defense', 'shen_qingshuang', '双影并肩 · 同守江湖', '#6f86aa', 'two_swords'),
    'frost_seal': ('霜河封脉', 'attack', 'shen_qingshuang', '寒脉凝霜 · 一剑封喉', '#78a8c9', 'ice'),
    'red_lotus_poison': ('红莲蚀骨', 'trick', 'luo_hongling', '红莲暗香 · 毒入骨髓', '#9b2436', 'lotus'),
    'night_escape': ('夜奔', 'movement', 'luo_hongling', '月下飞檐 · 红影无踪', '#4d314f', 'moon'),
    'red_lotus_bloom': ('红莲绽夜', 'trick', 'luo_hongling', '莲火照夜 · 魅影夺魂', '#b22142', 'fire_lotus'),
    'silver_needle': ('银针续命', 'romance', 'bai_zhi', '素手银针 · 起死回生', '#b9c6ba', 'needle'),
    'clear_mind_powder': ('清心散', 'romance', 'bai_zhi', '药香清心 · 云散月明', '#81a98a', 'herb'),
    'life_returning_needle': ('回命十三针', 'romance', 'bai_zhi', '十三针落 · 命火重燃', '#c7b98f', 'needles'),
    'blood_river_strike': ('血河逆流', 'demonic', 'blood_river', '血河倒卷 · 魔心噬天', '#7d1021', 'blood_wave'),
}

PLAYER_META = {
    'wandering_swordsman': ('无名侠客', '江湖浪客', '#38556b', '斗笠青衫，腰悬长剑'),
    'fallen_noble': ('没落贵胄', '锦衣孤剑', '#70513c', '旧族玉佩，锦袍藏锋'),
    'medicine_apprentice': ('医馆学徒', '药囊少年', '#547756', '药箱银针，仁心入江湖'),
    'street_survivor': ('市井孤儿', '短刃游侠', '#5e4c3d', '破衣短刃，街巷身法'),
}

ENEMY_META = {
    'bandit': ('山道劫匪', '山匪刀客', '#6a3d27', '粗布蒙面，环首刀寒'),
    'sword_house_disciple': ('青霜剑派弟子', '剑派门人', '#486f8f', '青衣束发，剑势森然'),
    'forest_iron_monk': ('铁衣苦行僧', '铁衣僧', '#706044', '铁衣僧袍，铜杖护身'),
    'mad_martial_artist': ('走火入魔的江湖客', '疯魔武者', '#74323c', '乱发赤目，真气翻涌'),
    'black_market_master': ('黑市高手', '黑市刺客', '#2f2539', '黑衣面具，袖藏毒刃'),
    'blood_river_puppet': ('血河傀儡', '血河魔傀', '#641120', '血纹傀儡，魔气缠身'),
}

HEROINE_META = {
    'shen_qingshuang': ('沈青霜', '剑派大师姐', '#6c9ec8', '漂亮红颜，霜衣剑女，清冷端庄，长剑映雪'),
    'luo_hongling': ('洛红绫', '红莲圣女', '#b4213d', '漂亮红颜，红衣圣女，明艳张扬，莲火绕袖'),
    'bai_zhi': ('白芷', '药王谷医女', '#7fb48b', '漂亮红颜，青衣医女，温柔坚定，药香银针'),
}

STATUS_META = {
    'poison': ('中毒', '#4f8b43', '毒雾青蛇'),
    'bleed': ('流血', '#a21f2d', '血痕飞溅'),
    'sealed': ('封脉', '#6ea7c8', '寒霜封穴'),
    'vulnerable': ('易伤', '#c07a36', '裂甲破绽'),
    'counter': ('反击', '#d1aa52', '剑环反击'),
}

LOCATION_META = {
    'town': ('青石镇', '#6f4d32', '青石街巷、客栈幡旗、镖局门楼、市井江湖消息与远山晨雾', 'town'),
    'teahouse': ('听雨茶楼', '#7a5635', '临水茶楼、雨帘竹影、醒木说书、茶盏热雾与江湖密谈', 'teahouse'),
    'forest': ('黑松林', '#315842', '黑松古林、山风雾气、草药石径、伏兵刀影与飞鸟惊枝', 'forest'),
    'clinic': ('百草医馆', '#5f7d54', '古风武侠医馆，百草医馆药柜、药香、银针、药炉、诊案与医馆灯火', 'clinic'),
    'sword_house': ('青霜剑派别院', '#4f7898', '青石演武场、剑架霜光、松风山门、门规石碑与白衣弟子', 'sword_house'),
    'ruined_temple': ('破庙黑市', '#563c48', '荒废破庙、残佛断梁、黑市灯火、暗摊兵器与亡命江湖客', 'ruined_temple'),
}


def esc(s: str) -> str:
    return html.escape(s, quote=True)


def safe_id(s: str) -> str:
    return re.sub(r'[^a-zA-Z0-9_-]', '_', s)


def read_active_asset_paths() -> list[Path]:
    active: set[str] = set()
    asset_ref = re.compile(r"""['"](/assets/(?:cards|figures/(?:players|enemies|heroines)|locations|statuses)/[^'"]+\.svg)['"]""")

    for manifest_file in MANIFEST_FILES:
        text = manifest_file.read_text(encoding='utf-8')
        active.update(match.removeprefix('/assets/') for match in asset_ref.findall(text))

    unsupported = sorted(path for path in active if not path.startswith(ACTIVE_DIRECTORIES))
    if unsupported:
        raise ValueError(f'Unsupported active SVG asset path(s): {unsupported}')

    return [Path(path) for path in sorted(active)]


def metadata_for_active_path(relative_path: Path) -> Callable[[Path], None]:
    rel = relative_path.as_posix()
    stem = relative_path.stem

    if rel.startswith('cards/'):
        if stem not in CARD_META:
            raise KeyError(f'Missing card metadata for active asset: {rel}')
        return lambda path: write_card(path, stem, CARD_META[stem])

    if rel.startswith('figures/players/'):
        if stem not in PLAYER_META:
            raise KeyError(f'Missing player metadata for active asset: {rel}')
        return lambda path: write_figure(path, stem, *PLAYER_META[stem], kind='player')

    if rel.startswith('figures/enemies/'):
        if stem not in ENEMY_META:
            raise KeyError(f'Missing enemy metadata for active asset: {rel}')
        return lambda path: write_figure(path, stem, *ENEMY_META[stem], kind='enemy')

    if rel.startswith('figures/heroines/'):
        if stem not in HEROINE_META:
            raise KeyError(f'Missing heroine metadata for active asset: {rel}')
        return lambda path: write_figure(path, stem, *HEROINE_META[stem], kind='heroine')

    if rel.startswith('locations/'):
        if stem not in LOCATION_META:
            raise KeyError(f'Missing location metadata for active asset: {rel}')
        return lambda path: write_location(path, stem, LOCATION_META[stem])

    if rel.startswith('statuses/'):
        if stem not in STATUS_META:
            raise KeyError(f'Missing status metadata for active asset: {rel}')
        return lambda path: write_status(path, stem, STATUS_META[stem])

    raise ValueError(f'Unsupported active SVG asset path: {rel}')


def frame_defs(primary: str, accent: str = '#f3dfb7') -> str:
    return f'''  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f7ecd2"/><stop offset="0.52" stop-color="{primary}"/><stop offset="1" stop-color="#100b09"/></linearGradient>
    <radialGradient id="halo" cx="50%" cy="28%" r="62%"><stop stop-color="{accent}" stop-opacity=".55"/><stop offset="1" stop-color="#050403" stop-opacity=".62"/></radialGradient>
    <filter id="ink"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="17"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .16"/></feComponentTransfer></filter>
    <pattern id="cloud" width="96" height="44" patternUnits="userSpaceOnUse"><path d="M5 29c18-20 40-20 56 0 10-8 23-9 34 0" fill="none" stroke="{accent}" stroke-width="2" opacity=".20"/></pattern>
  </defs>'''


def write_card(path: Path, cid: str, meta: tuple[str, str, str, str, str, str]) -> None:
    name, typ, source, subtitle, color, motif = meta
    title = f'{name} · 古风武侠卡牌'
    icon = motif_shape(motif)
    content = f'''<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1008" viewBox="0 0 720 1008" role="img" aria-label="{esc(title)}" data-art-direction="ancient-wuxia" data-kind="card" data-card-id="{esc(cid)}" data-theme="古风武侠江湖水墨">
  <title>{esc(title)}</title>
  <desc>古风武侠江湖水墨卡牌插画：{esc(name)}对应招式为{esc(subtitle)}，以山水留白、飞墨、剑气和卷轴纸纹表现招式气韵。</desc>
{frame_defs(color)}
  <rect width="720" height="1008" rx="48" fill="#120c08"/>
  <rect x="26" y="26" width="668" height="956" rx="38" fill="url(#paper)"/>
  <rect x="26" y="26" width="668" height="956" rx="38" fill="url(#cloud)"/>
  <rect x="26" y="26" width="668" height="956" rx="38" filter="url(#ink)"/>
  <path d="M0 555c92-80 154-78 236-25 76 49 143 55 235 6 93-50 157-45 249 34v438H0z" fill="#050403" opacity=".36"/>
  <path d="M76 280c126-72 276-72 408-14 58 25 103 21 161-18" fill="none" stroke="#fff1cd" stroke-width="8" stroke-linecap="round" opacity=".20"/>
  <path d="M96 678c140-72 360-38 526-116" fill="none" stroke="#fff1cd" stroke-width="6" stroke-linecap="round" opacity=".18"/>
  <g transform="translate(360 375)">{icon}</g>
  <rect x="68" y="712" width="584" height="196" rx="30" fill="#080504" opacity=".70"/>
  <text x="360" y="780" text-anchor="middle" font-family="KaiTi, STKaiti, serif" font-size="58" font-weight="700" fill="#fff1ca">{esc(name)}</text>
  <text x="360" y="836" text-anchor="middle" font-family="KaiTi, STKaiti, serif" font-size="28" fill="#f2d18f">{esc(subtitle)}</text>
  <text x="360" y="882" text-anchor="middle" font-family="KaiTi, STKaiti, serif" font-size="22" fill="#ead8ad">{esc(typ.upper())} · {esc(source)} · 古风武侠</text>
  <text x="58" y="82" font-family="Georgia, serif" font-size="24" fill="#fff4d8" opacity=".84">江湖</text>
  <rect x="26" y="26" width="668" height="956" rx="38" fill="url(#halo)"/>
  <rect x="26" y="26" width="668" height="956" rx="38" fill="none" stroke="#f1d99f" stroke-width="3" opacity=".76"/>
</svg>
'''
    path.write_text(content, encoding='utf-8')


def motif_shape(motif: str) -> str:
    base = 'fill="#f5d99a" stroke="#fff5d8" stroke-width="6" stroke-linejoin="round" opacity=".92"'
    if 'sword' in motif or motif in {'two_swords'}:
        extra = ''
        if motif == 'two_swords':
            extra = '<path d="M-130 130L125-150l32 32L-102 158z" fill="#f5d99a" stroke="#fff5d8" stroke-width="6" stroke-linejoin="round" opacity=".62"/>'
        return extra + f'<path d="M-155 150L118-155l38 38L-120 182z" {base}/><path d="M-190 188l70-28 26 26-28 70z" fill="#5a2a18" opacity=".9"/><circle cx="95" cy="-132" r="33" fill="#fff4d8" opacity=".35"/>'
    if motif in {'shield', 'armor'}:
        return f'<path d="M0-178c74 34 132 40 186 40-6 175-72 274-186 334-114-60-180-159-186-334 54 0 112-6 186-40z" {base}/><path d="M0-134v282M-98-48h196" stroke="#7b2d20" stroke-width="18" opacity=".55"/>'
    if motif in {'lotus', 'fire_lotus'}:
        return f'<path d="M0-150c48 62 50 114 0 178-50-64-48-116 0-178z" {base}/><path d="M-88-92c64 29 91 80 72 153-70-33-94-82-72-153z" {base}/><path d="M88-92c-64 29-91 80-72 153 70-33 94-82 72-153z" {base}/><path d="M-150 50c98 8 198 8 300 0" fill="none" stroke="#fff5d8" stroke-width="12" opacity=".45"/>'
    if motif in {'needle', 'needles', 'herb'}:
        needles = ''.join(f'<path d="M{x} 160L{x+30} -145" stroke="#fff5d8" stroke-width="8" stroke-linecap="round" opacity=".85"/>' for x in (-80, -20, 40))
        return needles + f'<path d="M-150 40c70-112 138-113 184 0-72 10-128 11-184 0z" fill="#85b98c" opacity=".75"/><path d="M34 40c52-98 112-101 166-14-57 25-109 28-166 14z" fill="#85b98c" opacity=".65"/>'
    if motif == 'moon':
        return f'<circle cx="28" cy="-66" r="116" fill="#fff1c9" opacity=".78"/><circle cx="82" cy="-94" r="116" fill="#1c1125" opacity=".94"/><path d="M-150 118c92-30 192-30 300 0" stroke="#fff5d8" stroke-width="12" fill="none" opacity=".45"/>'
    if motif == 'ice':
        return ''.join(f'<path d="M0 0L{x} {y}" stroke="#d8f4ff" stroke-width="12" stroke-linecap="round" opacity=".9"/>' for x, y in [(0,-170),(146,-84),(146,84),(0,170),(-146,84),(-146,-84)]) + '<circle r="58" fill="#d8f4ff" opacity=".55"/>'
    if motif == 'blood_wave':
        return f'<path d="M-180 60c74-112 148-114 220-4 36 55 80 69 140 16-12 80-72 130-148 116C52 172-20 72-180 60z" fill="#b31830" stroke="#ffd0c8" stroke-width="6" opacity=".9"/>'
    return f'<circle r="132" {base}/><path d="M-115 0h230M0-115v230" stroke="#7b2d20" stroke-width="16" opacity=".5"/>'


def write_figure(path: Path, fid: str, name: str, role: str, color: str, desc: str, kind: str) -> None:
    is_heroine = kind == 'heroine'
    title = f'{name} · {role} · 古风武侠人物'
    char_attr = f' data-character="{esc(name)}"' if is_heroine else ''
    beauty = '漂亮红颜，' if is_heroine and '漂亮红颜' not in desc else ''
    portrait_note = '漂亮的古风女性角色，' if is_heroine else '古风武侠人物，'
    content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480" role="img" aria-label="{esc(title)}" data-art-direction="ancient-wuxia" data-kind="{kind}" data-theme="古风武侠江湖水墨人物"{char_attr}>
  <title>{esc(title)}</title>
  <desc>{beauty}{portrait_note}{esc(desc)}。水墨山水背景、江湖侠客气质、古风衣冠、兵刃与武侠身姿。</desc>
{frame_defs(color)}
  <rect width="360" height="480" rx="32" fill="#100b08"/>
  <rect x="14" y="14" width="332" height="452" rx="26" fill="url(#paper)"/>
  <rect x="14" y="14" width="332" height="452" rx="26" fill="url(#cloud)"/>
  <rect x="14" y="14" width="332" height="452" rx="26" filter="url(#ink)"/>
  <path d="M38 402c68-42 218-42 284 0" fill="none" stroke="#050403" stroke-width="24" opacity=".24"/>
  <path d="M95 382c18-105 50-160 85-160s67 55 85 160z" fill="{color}" stroke="#f7e5bd" stroke-width="4" opacity=".96"/>
  <path d="M114 315c44 24 88 24 132 0" fill="none" stroke="#fff3d6" stroke-width="6" opacity=".54"/>
  <path d="M143 222h74l-18 42h-38z" fill="#e7c2a0" opacity=".94"/>
  <circle cx="180" cy="150" r="56" fill="#efc29f"/>
  <path d="M112 152c8-62 40-91 68-91s60 29 68 91c-31-24-105-24-136 0z" fill="#16100c"/>
  <path d="M130 112c22-35 80-38 104 7-34-12-70-12-104-7z" fill="#050403" opacity=".82"/>
  <path d="M149 158c8 8 17 8 25 0M187 158c8 8 17 8 25 0" stroke="#301610" stroke-width="4" stroke-linecap="round" fill="none" opacity=".82"/>
  <path d="M168 190c9 7 18 7 27 0" stroke="#832c32" stroke-width="4" stroke-linecap="round" fill="none"/>
  <path d="M75 95l210 286" stroke="#fff2d1" stroke-width="5" opacity=".45"/>
  <path d="M72 87l25 5-17 17z" fill="#fff2d1" opacity=".68"/>
  <circle cx="286" cy="96" r="32" fill="#050403" opacity=".24"/>
  <text x="286" y="107" text-anchor="middle" font-size="32" font-family="KaiTi, STKaiti, serif" fill="#fff1d1" opacity=".84">侠</text>
  <rect x="38" y="402" width="284" height="42" rx="21" fill="#080504" opacity=".74"/>
  <text x="180" y="427" text-anchor="middle" font-size="24" font-family="KaiTi, STKaiti, serif" fill="#fff1d6">{esc(name)}</text>
  <text x="180" y="54" text-anchor="middle" font-size="19" font-family="KaiTi, STKaiti, serif" fill="#fff1d6" opacity=".88">{esc(role)}</text>
  <rect x="14" y="14" width="332" height="452" rx="26" fill="url(#halo)"/>
  <rect x="14" y="14" width="332" height="452" rx="26" fill="none" stroke="#f1d9a7" stroke-width="3" opacity=".78"/>
</svg>
'''
    path.write_text(content, encoding='utf-8')


def write_status(path: Path, sid: str, meta: tuple[str, str, str]) -> None:
    name, color, desc = meta
    content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="{esc(name)}状态图标" data-art-direction="ancient-wuxia" data-kind="status" data-theme="古风武侠状态">
  <title>{esc(name)} · 古风武侠状态</title>
  <desc>{esc(desc)}，古风武侠江湖水墨符印状态图标。</desc>
  <defs><radialGradient id="g" cx="50%" cy="38%" r="62%"><stop stop-color="#fff2d1"/><stop offset=".52" stop-color="{color}"/><stop offset="1" stop-color="#100805"/></radialGradient></defs>
  <circle cx="64" cy="64" r="58" fill="url(#g)"/>
  <circle cx="64" cy="64" r="50" fill="none" stroke="#fff0c8" stroke-width="4" opacity=".72"/>
  <path d="M30 70c20-26 46-26 68 0M45 42c10 16 28 16 38 0M64 26v76" fill="none" stroke="#100805" stroke-width="8" stroke-linecap="round" opacity=".58"/>
  <text x="64" y="75" text-anchor="middle" font-family="KaiTi, STKaiti, serif" font-size="30" fill="#fff4d8">{esc(name[0])}</text>
</svg>
'''
    path.write_text(content, encoding='utf-8')


def location_landmark(kind: str) -> str:
    if kind == 'town':
        return '<path d="M88 402V252h126v150M122 252v-72h70v72M78 402h510M424 402V216h120v186M408 216l76-62 76 62" fill="#24160e" stroke="#f4db9f" stroke-width="8" opacity=".86"/><path d="M132 304h46M456 270h56M456 322h56" stroke="#f4db9f" stroke-width="8" opacity=".58"/>'
    if kind == 'teahouse':
        return '<path d="M116 392V210h392v182M88 210h448l-66-58H154z" fill="#26170f" stroke="#f4db9f" stroke-width="8" opacity=".88"/><path d="M188 392V266h74v126M322 392V266h120v126M332 304h100" stroke="#f4db9f" stroke-width="8" opacity=".58"/><path d="M162 176c72 30 128 30 196 0 52-23 100-23 150 0" fill="none" stroke="#d9bd7a" stroke-width="7" opacity=".48"/>'
    if kind == 'forest':
        return '<path d="M128 402l76-270 76 270M292 402l94-306 94 306M70 402l52-196 54 196" fill="#18261b" stroke="#d4c086" stroke-width="8" opacity=".9"/><path d="M110 246h126M322 206h128M82 310h114" stroke="#8fb57c" stroke-width="10" opacity=".54"/><path d="M88 398c118-60 238-70 430-18" fill="none" stroke="#f4db9f" stroke-width="8" opacity=".34"/>'
    if kind == 'clinic':
        return '<path d="M100 396V190h398v206M82 190h436l-48-54H130z" fill="#21170f" stroke="#f4db9f" stroke-width="8" opacity=".9"/><path d="M142 232h148v128H142zM318 232h132v128H318z" fill="#3d2a19" stroke="#f4db9f" stroke-width="7" opacity=".86"/><path d="M162 264h108M162 304h108M338 264h92M338 304h92M338 344h92" stroke="#d9bd7a" stroke-width="6" opacity=".72"/><path d="M230 136c26 58 72 58 98 0M456 150c-52 54-50 104 4 150" fill="none" stroke="#e8efe0" stroke-width="7" opacity=".66"/><path d="M462 156l-64 168" stroke="#fff7d7" stroke-width="6" opacity=".82"/>'
    if kind == 'sword_house':
        return '<path d="M100 392V204h408v188M80 204h448l-84-70H164z" fill="#18202a" stroke="#e5d096" stroke-width="8" opacity=".9"/><path d="M192 392V264h224v128M220 322h168" stroke="#e5d096" stroke-width="8" opacity=".58"/><path d="M160 128l318 270M468 128L150 398" stroke="#f7f0d0" stroke-width="7" opacity=".6"/><circle cx="314" cy="126" r="34" fill="#eaf6ff" opacity=".36"/>'
    return '<path d="M122 398V218h342v180M92 218h402l-62-76H154z" fill="#20161a" stroke="#d9bd7a" stroke-width="8" opacity=".86"/><path d="M206 398V292h80v106M328 398V282h72v116M148 220l84 70M464 222l-98 66" stroke="#d9bd7a" stroke-width="8" opacity=".5"/><path d="M110 354c92-58 186-50 260 6 50 38 92 44 146 16" fill="none" stroke="#f4db9f" stroke-width="7" opacity=".4"/>'


def write_location(path: Path, lid: str, meta: tuple[str, str, str, str]) -> None:
    name, color, desc, kind = meta
    title = f'{name} · 古风武侠场景'
    content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-label="{esc(title)}" data-art-direction="ancient-wuxia" data-kind="location" data-location-id="{esc(lid)}" data-theme="古风武侠江湖水墨场景">
  <title>{esc(title)}</title>
  <desc>{esc(name)}古风武侠场景插画：{esc(desc)}。江湖水墨、卷轴纸纹、飞檐、山水留白与古风武侠氛围。</desc>
{frame_defs(color)}
  <rect width="640" height="360" rx="28" fill="#100b08"/>
  <rect x="12" y="12" width="616" height="336" rx="22" fill="url(#paper)"/>
  <rect x="12" y="12" width="616" height="336" rx="22" fill="url(#cloud)"/>
  <rect x="12" y="12" width="616" height="336" rx="22" filter="url(#ink)"/>
  <path d="M0 244c78-62 138-66 210-24 82 48 156 43 236-2 72-40 132-34 194 22v120H0z" fill="#050403" opacity=".28"/>
  <path d="M38 158c78-64 150-84 242-56 76 23 132 14 214-38 40-25 72-30 108-15" fill="none" stroke="#fff1cd" stroke-width="7" stroke-linecap="round" opacity=".2"/>
  <path d="M58 284c142-50 330-42 522-96" fill="none" stroke="#fff1cd" stroke-width="5" stroke-linecap="round" opacity=".2"/>
  <g>{location_landmark(kind)}</g>
  <rect x="34" y="254" width="256" height="70" rx="18" fill="#080504" opacity=".72"/>
  <text x="162" y="298" text-anchor="middle" font-family="KaiTi, STKaiti, serif" font-size="31" font-weight="700" fill="#fff1ca">{esc(name)}</text>
  <text x="486" y="314" text-anchor="middle" font-family="KaiTi, STKaiti, serif" font-size="20" fill="#f2d18f" opacity=".88">古风武侠 · 江湖水墨</text>
  <rect x="12" y="12" width="616" height="336" rx="22" fill="url(#halo)"/>
  <rect x="12" y="12" width="616" height="336" rx="22" fill="none" stroke="#f1d99f" stroke-width="3" opacity=".76"/>
</svg>
'''
    path.write_text(content, encoding='utf-8')


def main() -> None:
    active_paths = read_active_asset_paths()
    for relative_path in active_paths:
        target = ASSET_ROOT / relative_path
        target.parent.mkdir(parents=True, exist_ok=True)
        metadata_for_active_path(relative_path)(target)

    print('Regenerated ancient wuxia SVG assets:', len(active_paths))


if __name__ == '__main__':
    main()
