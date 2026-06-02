# 《红尘剑客录》豆包图像生成提示词清单

> 目标：用本地 Doubao.app 逐一生成并替换当前 `public/assets/**` 中的游戏图像。当前游戏内使用的有效资源共 55 张：卡牌 20、主角出身 4、红颜 3、敌人 7、地点 6、物品 10、状态图标 5。`public/icons.svg` 与 `public/favicon.svg` 属于站点图标，暂不纳入本轮替换。

## 统一规格

- 项目：古风武侠文字卡牌 RPG《红尘剑客录》
- 总体风格：国风武侠、半写实游戏立绘/卡牌插画，水墨质感，克制电影感光影，细节清晰，适合小尺寸 UI。
- 色彩：低饱和宣纸底色 + 主题点色；避免现代霓虹、科幻、二次元夸张大眼、Q 版。
- 画幅：3:4 竖图。
- 输出建议：尽量生成 120×160 或可裁切为 3:4 的图片；人物为半身/三分之二身，物品为居中小静物。
- 通用负面词：现代服饰、现代建筑、枪械、科幻、赛博朋克、Q版、卡通贴纸、欧美奇幻盔甲、过度裸露、文字、水印、logo、UI 边框、低清、畸形手、多余手指、面部崩坏。

## 豆包使用模板

把每一条的「主体提示词」与下面统一补充合并发送：

```text
3:4竖图，古风武侠游戏美术，半写实国风插画，水墨宣纸质感，电影感柔和光影，细节清晰，适合120x160小尺寸UI图标/卡牌使用。不要文字，不要水印，不要logo，不要现代元素，不要Q版，不要科幻。
```

## A. 主角出身立绘 `/assets/figures/players/*.svg`

| ID | 名称 | 主体提示词 |
|---|---|---|
| `wandering_swordsman` | 江湖游侠 | 年轻无名剑客，旧青布劲装，斗笠半遮眉眼，背负长剑，衣摆沾尘，站在山道暮色中，神情沉静警觉，侠客漂泊感。 |
| `fallen_noble` | 落魄世家 | 落魄贵胄少年，旧锦袍外罩素色披风，腰间残玉与短剑，衣料精致但磨损，站在雨后青石巷，眼神克制倔强，有家族衰败后的孤傲。 |
| `medicine_apprentice` | 医馆学徒 | 温和清瘦的医馆学徒，淡青短袍，背药箱，手持银针包和草药，身后隐约药柜与灯火，神情专注仁善但带江湖戒备。 |
| `street_survivor` | 市井孤儿 | 机敏的市井少年/少女，灰褐短打，袖中藏小刀，腰挂破布钱袋，站在夜市暗巷边缘，眼神灵动警惕，身形轻捷。 |

## B. 红颜立绘 `/assets/figures/heroines/*.svg`

| ID | 名称 | 主体提示词 |
|---|---|---|
| `shen_qingshuang` | 沈青霜，剑派大师姐 | 清冷克制的正道剑派大师姐，白蓝剑袍，发髻利落，手持寒光长剑，剑气如霜，背景为青石演武场与薄雪，气质端正疏离但眼神有温度。 |
| `luo_hongling` | 洛红绫，红莲圣女 | 张扬危险的魔教红莲圣女，红黑纱衣但不暴露，金铃与红莲纹饰，手拈毒针或红莲火光，夜色寺庙背景，笑意锋利，艳丽而危险。 |
| `bai_zhi` | 白芷，药王谷医女 | 温柔坚定的药王谷医女，浅绿白衣，手持药碗与银针，身旁药草、药柜、暖灯，眼神仁心但坚定，画面有清苦药香和安静力量。 |

## C. 敌人立绘 `/assets/figures/enemies/*.svg`

| ID | 名称 | 主体提示词 |
|---|---|---|
| `bandit` | 山道劫匪 | 粗犷山匪，破皮甲，乱发胡茬，手持砍刀，山道荒草与破旗背景，表情凶狠贪婪，动作前扑。 |
| `ch1_black_market_boss` | 黑市小头目 | 破庙黑市小头目，黑衣短褂，腰挂账册与短刀，脸上阴狠狡猾，背后昏黄灯笼、摊位和影影绰绰的亡命徒。 |
| `sword_house_disciple` | 青霜剑派弟子 | 年轻剑派弟子，青白练功服，持标准制式长剑，姿态规整，背景为剑派别院，气质守规矩但略带傲气。 |
| `forest_iron_monk` | 铁衣苦行僧 | 高大苦行僧，旧铁片缝入僧衣，手持沉重禅杖，黑松林雾气背景，面容坚忍冷硬，防御压迫感强。 |
| `mad_martial_artist` | 走火入魔的江湖客 | 走火入魔的江湖客，散乱长发，衣袍破碎，双眼泛红，周身混乱内力气流，背景为荒野残碑，痛苦且危险。 |
| `black_market_master` | 黑市高手 | 黑市深处的武林高手，深色长袍，袖中暗器与毒雾，站在破庙灯影下，神情从容阴冷，像幕后强敌。 |
| `blood_river_puppet` | 血河傀儡 | 被血河邪功操控的傀儡武者，苍白面孔，暗红血纹沿手臂蔓延，姿态僵硬却杀气极重，黑松林血雾背景，诡异压迫。 |

## D. 地点图 `/assets/locations/*.svg`

| ID | 名称 | 主体提示词 |
|---|---|---|
| `town` | 青石镇 | 古代江南边镇青石街，客栈、镖局旗帜、市井摊贩，远处山影，白天微雨后石板反光，江湖消息汇集的热闹感。 |
| `teahouse` | 听雨茶楼 | 古风茶楼内景，木窗外细雨，茶盏、醒木、说书台，暖色灯火，客人低声谈江湖秘闻，安静但暗藏线索。 |
| `forest` | 黑松林 | 黑松密林，山雾、枯枝、血迹般的暗红落叶，远处有若隐若现的人影，压抑危险，适合奇遇与追杀。 |
| `clinic` | 百草医馆 | 古代医馆内景，药柜、药炉、银针、诊案、晾晒草药，暖灯与清苦药香，门外有求医江湖客。 |
| `sword_house` | 青霜剑派别院 | 青石演武场，剑架、门派匾额、霜色旗帜，山风吹动白蓝长幡，规矩森严的正道剑派氛围。 |
| `ruined_temple` | 破庙黑市 | 荒废古庙夜景，残佛像、破幡、黑市摊位、红灯笼与烟雾，亡命徒剪影交易，危险隐秘。 |

## E. 卡牌图 `/assets/cards/*.svg`

| ID | 名称 | 主体提示词 |
|---|---|---|
| `basic_slash` | 劈风斩 | 一道凌厉剑光斜劈破风，青灰背景，剑气卷起尘叶，表现基础但干净的攻击招式。 |
| `basic_guard` | 横剑格挡 | 武者横剑挡下袭来的刀光，火星飞溅，姿态稳固，表现防御与格挡。 |
| `basic_breath` | 调息 | 盘膝调息的侠客剪影，丹田微光，周围水墨气流缓缓环绕，宁静恢复内力。 |
| `cloud_step` | 流云步 | 侠客踏云般掠过屋脊，衣摆与云气流动，身法轻盈，背景留白有速度感。 |
| `iron_cloth` | 铁布衫 | 武者沉肩立桩，皮肤与衣袍泛铁灰光泽，拳脚刀影被震开，厚重防御感。 |
| `qingshuang_sword` | 青霜一剑 | 冰蓝剑气从长剑上爆发，一剑如霜河横过画面，清冷锋锐，正道剑法。 |
| `stand_together` | 并肩御敌 | 两名侠客背靠背并肩防守，剑光与护体气劲形成圆弧，强调羁绊与共同御敌。 |
| `frost_seal` | 霜河封脉 | 冰霜剑气化作细线封住敌人经脉，蓝白寒气与符纹，冷冽控制感。 |
| `red_lotus_poison` | 红莲蚀骨 | 暗红莲花在毒雾中绽放，细针或毒粉飞散，诡艳危险，表现中毒。 |
| `night_escape` | 夜奔 | 黑夜屋檐上疾奔的红衣身影，月色、瓦片与追兵灯火在下方掠过，逃脱感。 |
| `red_lotus_bloom` | 红莲绽夜 | 夜色中巨大红莲火光/毒雾绽放，花瓣如暗器散开，华丽而致命。 |
| `silver_needle` | 银针续命 | 医者手中银针泛光，刺入穴位，暖色生命光点浮现，表现急救续命。 |
| `clear_mind_powder` | 清心散 | 青白药粉从瓷瓶中洒出，化作清风与莲叶纹，驱散暗红杂念，清心恢复。 |
| `life_returning_needle` | 回命十三针 | 十三枚银针悬浮成阵，暖金光护住伤者心脉，药香与医术神妙。 |
| `blood_river_strike` | 血河逆流 | 暗红血河般的邪异刀/掌劲逆流而上，力量强但危险，魔心气息明显。 |
| `plain_iron_sword` | 粗铁剑 | 朴素粗铁长剑置于旧木桌上，剑身有磨痕，旁边粗布剑鞘，初入江湖的实用武器。 |
| `cold_iron_blade` | 寒铁刀 | 寒铁长刀半出鞘，刀身凝霜，冷蓝反光，背景暗色，锋利沉重。 |
| `woven_bamboo_armor` | 编竹护甲 | 竹片与麻绳编成的轻便护甲挂在木架上，竹纹清晰，朴素耐用。 |
| `shadowstep_boots` | 踏影靴 | 黑色轻靴置于屋檐阴影中，鞋底轻薄，旁有月光和影子，表现夜行无声。 |
| `jade_peace_talisman` | 平安玉符 | 温润旧玉符悬在红绳上，玉面有细小平安纹，柔和暖光，护身安神。 |

## F. 物品图 `/assets/items/*.svg`

> 物品图尽量小、主体居中、背景简单，适合背包格子。仍按 3:4 输出，主体占画面 60–70%。

| ID | 名称 | 主体提示词 |
|---|---|---|
| `small_healing_pill` | 小还丹 | 小瓷瓶与数枚棕红药丸，旁有药包纸和一点药粉，古代伤药，背景简洁宣纸。 |
| `dry_ration` | 干粮 | 粗布包着的干粮饼，边缘干裂，旁有行囊绳结，朴素耐放的路上口粮。 |
| `steamed_bun` | 蒸饼 | 热气腾腾的麦面蒸饼放在竹蒸笼里，白雾轻升，简单温暖。 |
| `herb_chicken_soup` | 药膳鸡汤 | 小砂锅中炖着鸡汤，草药、枸杞、热气，温补药膳感，主体清晰。 |
| `wheat_flour` | 麦粉 | 小布袋中盛着麦粉，旁有麦穗和木勺，浅黄粉末细节清楚。 |
| `spring_water` | 山泉水 | 竹筒或小陶瓶盛清冽山泉，水面反光，旁有青石与一片绿叶。 |
| `wild_herb` | 野山草 | 一束刚采的山草药，根部带泥，叶片细长，系着草绳，药草特征明显。 |
| `young_chicken` | 童子鸡 | 适合作食材的处理干净童子鸡，放在竹篮或案板上，旁有姜片，不血腥。 |
| `qi_recovery_powder` | 回气散 | 小药纸包与辛辣药粉，粉末呈淡黄，旁有小瓷勺，表现恢复内力的散剂。 |
| `blood_jade_fragment` | 血玉残片 | 暗红残玉碎片，边缘不规则，内部像有血色微光流动，放在黑布上，神秘发烫。 |

## G. 状态图标 `/assets/statuses/*.svg`

> 状态图标需要更抽象、更清晰，生成后可裁切成小图标。

| ID | 名称 | 主体提示词 |
|---|---|---|
| `poison` | 中毒 | 绿色毒雾缠绕一滴毒液和小蛇纹，暗色背景，高对比，图标化。 |
| `bleed` | 流血 | 暗红血滴与裂开的伤痕形状，锐利动势，图标化，不血腥过度。 |
| `sealed` | 封脉 | 蓝白冰霜符纹锁住经脉线条，寒气环绕，图标化，清楚表达封印。 |
| `vulnerable` | 破绽 | 金色裂纹出现在护盾或盔甲片上，中心有破口，表现易伤破绽。 |
| `counter` | 反击 | 两道交叉剑光形成回旋箭头，火星飞溅，表现蓄势反击。 |

## 替换落地建议

1. 豆包生成原图保存到 `art-source/doubao/<asset-class>/<id>.png`。
2. 用脚本裁切/缩放到 3:4、120×160，并包装/输出到当前 manifest 路径，优先保持 `/assets/.../<id>.svg` 路径不变；如改为 `.png`，必须同步更新 manifest 与资产测试。
3. 每批替换后运行：
   - 资源文件解析/存在性校验
   - `npm test -- --run src/tests/cardArtAssets.test.ts src/tests/characterArtAssets.test.ts src/tests/locationArtAssets.test.ts src/tests/itemArtAssets.test.ts`
   - `npm test`
   - `npm run lint`
   - `npm run build`
   - 浏览器 smoke test

## H. 活跃资源路径对照表

| ID | 当前 manifest 路径 | 豆包导出源文件建议 |
|---|---|---|
| `basic_breath` | `/assets/cards/basic_breath.svg` | `art-source/doubao/cards/basic_breath.png` |
| `basic_guard` | `/assets/cards/basic_guard.svg` | `art-source/doubao/cards/basic_guard.png` |
| `basic_slash` | `/assets/cards/basic_slash.svg` | `art-source/doubao/cards/basic_slash.png` |
| `blood_river_strike` | `/assets/cards/blood_river_strike.svg` | `art-source/doubao/cards/blood_river_strike.png` |
| `clear_mind_powder` | `/assets/cards/clear_mind_powder.svg` | `art-source/doubao/cards/clear_mind_powder.png` |
| `cloud_step` | `/assets/cards/cloud_step.svg` | `art-source/doubao/cards/cloud_step.png` |
| `cold_iron_blade` | `/assets/cards/cold_iron_blade.svg` | `art-source/doubao/cards/cold_iron_blade.png` |
| `frost_seal` | `/assets/cards/frost_seal.svg` | `art-source/doubao/cards/frost_seal.png` |
| `iron_cloth` | `/assets/cards/iron_cloth.svg` | `art-source/doubao/cards/iron_cloth.png` |
| `jade_peace_talisman` | `/assets/cards/jade_peace_talisman.svg` | `art-source/doubao/cards/jade_peace_talisman.png` |
| `life_returning_needle` | `/assets/cards/life_returning_needle.svg` | `art-source/doubao/cards/life_returning_needle.png` |
| `night_escape` | `/assets/cards/night_escape.svg` | `art-source/doubao/cards/night_escape.png` |
| `plain_iron_sword` | `/assets/cards/plain_iron_sword.svg` | `art-source/doubao/cards/plain_iron_sword.png` |
| `qingshuang_sword` | `/assets/cards/qingshuang_sword.svg` | `art-source/doubao/cards/qingshuang_sword.png` |
| `red_lotus_bloom` | `/assets/cards/red_lotus_bloom.svg` | `art-source/doubao/cards/red_lotus_bloom.png` |
| `red_lotus_poison` | `/assets/cards/red_lotus_poison.svg` | `art-source/doubao/cards/red_lotus_poison.png` |
| `shadowstep_boots` | `/assets/cards/shadowstep_boots.svg` | `art-source/doubao/cards/shadowstep_boots.png` |
| `silver_needle` | `/assets/cards/silver_needle.svg` | `art-source/doubao/cards/silver_needle.png` |
| `stand_together` | `/assets/cards/stand_together.svg` | `art-source/doubao/cards/stand_together.png` |
| `woven_bamboo_armor` | `/assets/cards/woven_bamboo_armor.svg` | `art-source/doubao/cards/woven_bamboo_armor.png` |
| `bandit` | `/assets/figures/enemies/bandit.svg` | `art-source/doubao/figures/enemies/bandit.png` |
| `black_market_master` | `/assets/figures/enemies/black_market_master.svg` | `art-source/doubao/figures/enemies/black_market_master.png` |
| `blood_river_puppet` | `/assets/figures/enemies/blood_river_puppet.svg` | `art-source/doubao/figures/enemies/blood_river_puppet.png` |
| `ch1_black_market_boss` | `/assets/figures/enemies/ch1_black_market_boss.svg` | `art-source/doubao/figures/enemies/ch1_black_market_boss.png` |
| `forest_iron_monk` | `/assets/figures/enemies/forest_iron_monk.svg` | `art-source/doubao/figures/enemies/forest_iron_monk.png` |
| `mad_martial_artist` | `/assets/figures/enemies/mad_martial_artist.svg` | `art-source/doubao/figures/enemies/mad_martial_artist.png` |
| `sword_house_disciple` | `/assets/figures/enemies/sword_house_disciple.svg` | `art-source/doubao/figures/enemies/sword_house_disciple.png` |
| `bai_zhi` | `/assets/figures/heroines/bai_zhi.svg` | `art-source/doubao/figures/heroines/bai_zhi.png` |
| `luo_hongling` | `/assets/figures/heroines/luo_hongling.svg` | `art-source/doubao/figures/heroines/luo_hongling.png` |
| `shen_qingshuang` | `/assets/figures/heroines/shen_qingshuang.svg` | `art-source/doubao/figures/heroines/shen_qingshuang.png` |
| `fallen_noble` | `/assets/figures/players/fallen_noble.svg` | `art-source/doubao/figures/players/fallen_noble.png` |
| `medicine_apprentice` | `/assets/figures/players/medicine_apprentice.svg` | `art-source/doubao/figures/players/medicine_apprentice.png` |
| `street_survivor` | `/assets/figures/players/street_survivor.svg` | `art-source/doubao/figures/players/street_survivor.png` |
| `wandering_swordsman` | `/assets/figures/players/wandering_swordsman.svg` | `art-source/doubao/figures/players/wandering_swordsman.png` |
| `blood_jade_fragment` | `/assets/items/blood_jade_fragment.svg` | `art-source/doubao/items/blood_jade_fragment.png` |
| `dry_ration` | `/assets/items/dry_ration.svg` | `art-source/doubao/items/dry_ration.png` |
| `herb_chicken_soup` | `/assets/items/herb_chicken_soup.svg` | `art-source/doubao/items/herb_chicken_soup.png` |
| `qi_recovery_powder` | `/assets/items/qi_recovery_powder.svg` | `art-source/doubao/items/qi_recovery_powder.png` |
| `small_healing_pill` | `/assets/items/small_healing_pill.svg` | `art-source/doubao/items/small_healing_pill.png` |
| `spring_water` | `/assets/items/spring_water.svg` | `art-source/doubao/items/spring_water.png` |
| `steamed_bun` | `/assets/items/steamed_bun.svg` | `art-source/doubao/items/steamed_bun.png` |
| `wheat_flour` | `/assets/items/wheat_flour.svg` | `art-source/doubao/items/wheat_flour.png` |
| `wild_herb` | `/assets/items/wild_herb.svg` | `art-source/doubao/items/wild_herb.png` |
| `young_chicken` | `/assets/items/young_chicken.svg` | `art-source/doubao/items/young_chicken.png` |
| `clinic` | `/assets/locations/clinic.svg` | `art-source/doubao/locations/clinic.png` |
| `forest` | `/assets/locations/forest.svg` | `art-source/doubao/locations/forest.png` |
| `ruined_temple` | `/assets/locations/ruined_temple.svg` | `art-source/doubao/locations/ruined_temple.png` |
| `sword_house` | `/assets/locations/sword_house.svg` | `art-source/doubao/locations/sword_house.png` |
| `teahouse` | `/assets/locations/teahouse.svg` | `art-source/doubao/locations/teahouse.png` |
| `town` | `/assets/locations/town.svg` | `art-source/doubao/locations/town.png` |
| `bleed` | `/assets/statuses/bleed.svg` | `art-source/doubao/statuses/bleed.png` |
| `counter` | `/assets/statuses/counter.svg` | `art-source/doubao/statuses/counter.png` |
| `poison` | `/assets/statuses/poison.svg` | `art-source/doubao/statuses/poison.png` |
| `sealed` | `/assets/statuses/sealed.svg` | `art-source/doubao/statuses/sealed.png` |
| `vulnerable` | `/assets/statuses/vulnerable.svg` | `art-source/doubao/statuses/vulnerable.png` |
