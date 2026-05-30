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
    ROOT / 'src' / 'data' / 'itemArt.ts',
]
ACTIVE_DIRECTORIES = (
    'cards/',
    'figures/players/',
    'figures/enemies/',
    'figures/heroines/',
    'locations/',
    'items/',
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
    'plain_iron_sword': ('粗铁剑', 'equipment', 'equipment', '朴拙铁锋 · 初入江湖', '#5c5f5e', 'sword'),
    'cold_iron_blade': ('寒铁刀', 'equipment', 'equipment', '寒锋出鞘 · 霜声入骨', '#5b7892', 'frost_sword'),
    'woven_bamboo_armor': ('编竹护甲', 'equipment', 'equipment', '竹甲卸力 · 轻身护体', '#7b6b3b', 'armor'),
    'shadowstep_boots': ('踏影靴', 'equipment', 'equipment', '轻履无声 · 夜行踏影', '#4d4148', 'boots'),
    'jade_peace_talisman': ('平安玉符', 'equipment', 'equipment', '温玉护身 · 气血安宁', '#6c9b76', 'talisman'),
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

ITEM_META = {
    'small_healing_pill': ('小还丹', '#8f2e4b', '瓷瓶丹丸，江湖伤药'),
    'dry_ration': ('干粮', '#8a6237', '粗布包裹的行路口粮'),
    'steamed_bun': ('蒸饼', '#c8a26a', '热气麦面蒸饼'),
    'herb_chicken_soup': ('药膳鸡汤', '#9a6a35', '药香鸡汤小盅'),
    'wheat_flour': ('麦粉', '#d4c094', '小袋麦粉'),
    'spring_water': ('山泉水', '#4f8fa8', '清冽水囊'),
    'wild_herb': ('野山草', '#5f9856', '山林草药束'),
    'young_chicken': ('童子鸡', '#b88a55', '小型食材鸡'),
    'qi_recovery_powder': ('回气散', '#4f7663', '回气药散瓷瓶'),
    'blood_jade_fragment': ('血玉残片', '#8e1f2b', '血色碎玉'),
}

SMALL_ART_WIDTH = 120
SMALL_ART_HEIGHT = 160


def esc(s: str) -> str:
    return html.escape(s, quote=True)


def safe_id(s: str) -> str:
    return re.sub(r'[^a-zA-Z0-9_-]', '_', s)


def read_active_asset_paths() -> list[Path]:
    active: set[str] = set()
    asset_ref = re.compile(r"""['"](/assets/(?:cards|items|figures/(?:players|enemies|heroines)|locations|statuses)/[^'"]+\.svg)['"]""")

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

    if rel.startswith('items/'):
        if stem not in ITEM_META:
            raise KeyError(f'Missing item metadata for active asset: {rel}')
        return lambda path: write_item(path, stem, ITEM_META[stem])

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
    content = f'''<svg xmlns="http://www.w3.org/2000/svg" width="120" height="160" viewBox="0 0 120 160" role="img" aria-label="{esc(title)}" data-art-direction="ancient-wuxia" data-kind="card" data-card-id="{esc(cid)}" data-theme="古风武侠江湖水墨">
  <title>{esc(title)}</title>
  <desc>古风武侠江湖水墨小卡插画：{esc(name)}对应招式为{esc(subtitle)}，以飞墨、剑气和卷轴纸纹表现招式气韵。</desc>
  <defs><linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f7ecd2"/><stop offset="0.55" stop-color="{color}"/><stop offset="1" stop-color="#100b09"/></linearGradient></defs>
  <rect width="120" height="160" rx="10" fill="#120c08"/>
  <rect x="5" y="5" width="110" height="150" rx="8" fill="url(#paper)"/>
  <path d="M0 92c18-16 32-14 48-5 16 10 28 10 46 0 12-7 20-7 26 2v71H0z" fill="#050403" opacity=".32"/>
  <g transform="translate(60 63) scale(.16)">{icon}</g>
  <rect x="10" y="112" width="100" height="28" rx="7" fill="#080504" opacity=".72"/>
  <text x="60" y="129" text-anchor="middle" font-family="KaiTi, STKaiti, serif" font-size="12" font-weight="700" fill="#fff1ca">{esc(name)}</text>
  <text x="60" y="145" text-anchor="middle" font-family="KaiTi, STKaiti, serif" font-size="6" fill="#ead8ad">{esc(typ)} · 古风武侠</text>
  <rect x="5" y="5" width="110" height="150" rx="8" fill="none" stroke="#f1d99f" stroke-width="1.5" opacity=".76"/>
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


def write_item(path: Path, iid: str, meta: tuple[str, str, str]) -> None:
    name, color, desc = meta
    content = f'''<svg xmlns="http://www.w3.org/2000/svg" width="120" height="160" viewBox="0 0 120 160" role="img" aria-label="{esc(name)} · 古风武侠道具" data-art-direction="ancient-wuxia-item" data-kind="item" data-item-id="{esc(iid)}" data-theme="古风武侠江湖水墨道具">
  <title>{esc(name)} · 古风武侠道具</title>
  <desc>{esc(desc)}，小尺寸古风武侠道具图标，适用于背包、厨艺与卡片展示。</desc>
  <defs><radialGradient id="g" cx="50%" cy="36%" r="68%"><stop stop-color="#fff2d1"/><stop offset=".56" stop-color="{color}"/><stop offset="1" stop-color="#100805"/></radialGradient></defs>
  <rect width="120" height="160" rx="10" fill="#120c08"/>
  <rect x="6" y="6" width="108" height="148" rx="8" fill="url(#g)"/>
  <path d="M24 106c20-17 50-20 74-4" stroke="#100805" stroke-width="8" stroke-linecap="round" fill="none" opacity=".28"/>
  <circle cx="60" cy="66" r="28" fill="#fff2d1" opacity=".34"/>
  <path d="M38 72c10-24 34-32 48-12 10 14 2 34-23 42-18-6-30-15-25-30z" fill="#100805" opacity=".36"/>
  <text x="60" y="129" text-anchor="middle" font-family="KaiTi, STKaiti, serif" font-size="12" font-weight="700" fill="#fff1ca">{esc(name)}</text>
  <rect x="6" y="6" width="108" height="148" rx="8" fill="none" stroke="#f1d99f" stroke-width="1.5" opacity=".76"/>
</svg>
'''
    path.write_text(content, encoding='utf-8')

def write_status(path: Path, sid: str, meta: tuple[str, str, str]) -> None:
    name, color, desc = meta
    content = f'''<svg xmlns="http://www.w3.org/2000/svg" width="120" height="160" viewBox="0 0 120 160" role="img" aria-label="{esc(name)}状态图标" data-art-direction="ancient-wuxia" data-kind="status" data-theme="古风武侠状态">
  <title>{esc(name)} · 古风武侠状态</title>
  <desc>{esc(desc)}，古风武侠江湖水墨符印状态图标。</desc>
  <defs><radialGradient id="g" cx="50%" cy="38%" r="62%"><stop stop-color="#fff2d1"/><stop offset=".52" stop-color="{color}"/><stop offset="1" stop-color="#100805"/></radialGradient></defs>
  <rect width="120" height="160" rx="10" fill="#120c08"/>
  <rect x="8" y="20" width="104" height="104" rx="28" fill="url(#g)"/>
  <circle cx="60" cy="72" r="38" fill="none" stroke="#fff0c8" stroke-width="4" opacity=".72"/>
  <path d="M34 76c17-22 39-22 58 0M45 50c10 13 24 13 34 0M60 36v72" fill="none" stroke="#100805" stroke-width="7" stroke-linecap="round" opacity=".58"/>
  <text x="60" y="137" text-anchor="middle" font-family="KaiTi, STKaiti, serif" font-size="13" fill="#fff4d8">{esc(name)}</text>
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
    content = f'''<svg xmlns="http://www.w3.org/2000/svg" width="120" height="160" viewBox="0 0 120 160" role="img" aria-label="{esc(title)}" data-art-direction="ancient-wuxia" data-kind="location" data-location-id="{esc(lid)}" data-theme="古风武侠江湖水墨场景">
  <title>{esc(title)}</title>
  <desc>{esc(name)}古风武侠小场景插画：{esc(desc)}。江湖水墨、卷轴纸纹、飞檐、山水留白与古风武侠氛围。</desc>
  <defs><linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f7ecd2"/><stop offset="0.52" stop-color="{color}"/><stop offset="1" stop-color="#100b09"/></linearGradient></defs>
  <rect width="120" height="160" rx="10" fill="#100b08"/>
  <rect x="6" y="6" width="108" height="148" rx="8" fill="url(#paper)"/>
  <path d="M0 98c18-16 30-15 46-6 17 10 30 10 48 0 12-7 20-7 26 2v66H0z" fill="#050403" opacity=".28"/>
  <g transform="translate(0 5) scale(.19 .25)">{location_landmark(kind)}</g>
  <rect x="10" y="112" width="100" height="28" rx="7" fill="#080504" opacity=".72"/>
  <text x="60" y="130" text-anchor="middle" font-family="KaiTi, STKaiti, serif" font-size="12" font-weight="700" fill="#fff1ca">{esc(name)}</text>
  <text x="60" y="145" text-anchor="middle" font-family="KaiTi, STKaiti, serif" font-size="6" fill="#f2d18f" opacity=".88">古风武侠 · 江湖水墨</text>
  <rect x="6" y="6" width="108" height="148" rx="8" fill="none" stroke="#f1d99f" stroke-width="1.5" opacity=".76"/>
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
