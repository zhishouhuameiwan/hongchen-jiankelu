import type { GameEvent } from '../types/game'

export const events: GameEvent[] = [
  { id: 'ch1_town_bandit_notice_01', title: '第一章·镖局急帖', phase: 'day', locationId: 'town', weight: 260, requirements: [{ type: 'flag_missing', value: 'ch1_bandit_notice_taken' }, { type: 'flag_missing', value: 'ch1_bandit_defeated' }, { type: 'flag_missing', value: 'ch1_prepared_for_boss' }, { type: 'flag_missing', value: 'ch1_black_market_boss_defeated' }], text: '青石镇镖局门前围满行人，急帖上写着黑松林劫匪截走药材与粮袋。总镖头缺人手，只问你敢不敢接下第一趟江湖差事。', choices: [
    { id: 'accept', text: '接下悬赏，追查黑松林劫匪', staminaCost: 1, effects: [{ type: 'set_flag', value: 'ch1_bandit_notice_taken' }, { type: 'gain_silver', value: 6 }, { type: 'gain_item', itemId: 'dry_ration' }] },
    { id: 'ask_supply', text: '先问清补给与兵器价钱', staminaCost: 1, effects: [{ type: 'set_flag', value: 'ch1_bandit_notice_taken' }, { type: 'gain_silver', value: 4 }, { type: 'gain_item', itemId: 'spring_water' }] },
  ] },
  { id: 'ch1_forest_bandit_trail_01', title: '第一章·黑松林匪踪', phase: 'day', locationId: 'forest', weight: 250, requirements: [{ type: 'flag', value: 'ch1_bandit_notice_taken' }, { type: 'flag_missing', value: 'ch1_bandit_defeated' }, { type: 'flag_missing', value: 'ch1_black_market_boss_defeated' }], text: '黑松林湿雾沉沉，断枝旁散着麦粉与药草。劫匪的脚印通向旧猎棚，棚中还留着几袋可用食材。', choices: [
    { id: 'ambush', text: '伏击劫匪，夺回补给', staminaCost: 2, effects: [{ type: 'start_combat', enemyId: 'bandit' }, { type: 'set_flag', value: 'ch1_bandit_defeated' }, { type: 'gain_item', itemId: 'wheat_flour' }, { type: 'gain_item', itemId: 'spring_water' }, { type: 'gain_item', itemId: 'wild_herb' }] },
    { id: 'endure_training', text: '循踪前先练横练护身', staminaCost: 2, effects: [{ type: 'set_flag', value: 'ch1_bandit_defeated' }, { type: 'gain_card', cardId: 'iron_cloth' }, { type: 'gain_item', itemId: 'wheat_flour' }, { type: 'gain_item', itemId: 'spring_water' }] },
  ] },
  { id: 'ch1_town_reward_and_supply_01', title: '第一章·交差添装', phase: 'day', locationId: 'town', weight: 240, requirements: [{ type: 'flag', value: 'ch1_bandit_defeated' }, { type: 'flag_missing', value: 'ch1_prepared_for_boss' }, { type: 'flag_missing', value: 'ch1_black_market_boss_defeated' }], text: '总镖头验过夺回的补给，递来赏银，又指向街口兵器摊：夜里若要查破庙黑市，至少得有一柄称手兵器与一口热食。', choices: [
    { id: 'buy_sword_and_cook', text: '买粗铁剑，再备蒸饼夜探', staminaCost: 1, requirements: [{ type: 'silver_min', value: 12 }], effects: [{ type: 'gain_silver', value: 12 }, { type: 'gain_card', cardId: 'plain_iron_sword' }, { type: 'gain_item', itemId: 'wheat_flour' }, { type: 'gain_item', itemId: 'spring_water' }, { type: 'set_flag', value: 'ch1_prepared_for_boss' }] },
    { id: 'take_supplies', text: '换取食材与黑市口信', staminaCost: 1, effects: [{ type: 'gain_silver', value: 6 }, { type: 'gain_item', itemId: 'wheat_flour' }, { type: 'gain_item', itemId: 'spring_water' }, { type: 'learn_recipe', recipeId: 'steamed_bun' }, { type: 'set_flag', value: 'ch1_prepared_for_boss' }] },
  ] },
  { id: 'ch1_ruined_temple_black_market_boss_01', title: '第一章·破庙黑市', phase: 'night', locationId: 'ruined_temple', weight: 320, requirements: [{ type: 'flag', value: 'ch1_bandit_notice_taken' }, { type: 'flag', value: 'ch1_bandit_defeated' }, { type: 'flag', value: 'ch1_prepared_for_boss' }, { type: 'has_equipped', cardId: 'plain_iron_sword' }, { type: 'has_item', itemId: 'steamed_bun', amount: 1 }, { type: 'phase', value: 'night' }, { type: 'flag_missing', value: 'ch1_black_market_boss_defeated' }], text: '破庙黑市灯火如豆，戴斗笠的黑市高手拦在残碑前。他看见你腰间粗铁剑与行囊热食，冷笑道：看来青石镇来了个真敢赴约的人。', choices: [
    { id: 'duel', text: '拔剑挑战黑市高手', staminaCost: 2, effects: [{ type: 'start_combat', enemyId: 'ch1_black_market_boss' }, { type: 'set_flag', value: 'blood_river_clue' }] },
    { id: 'observe', text: '借蒸饼摊贩身份探听血河线索', staminaCost: 1, effects: [{ type: 'set_flag', value: 'blood_river_clue' }, { type: 'set_flag', value: 'ch1_black_market_boss_defeated' }, { type: 'gain_card', cardId: 'blood_river_strike' }] },
  ] },
  { id: 'teahouse_blood_river_rumor_01', title: '血河传闻', phase: 'day', locationId: 'teahouse', weight: 100, requirements: [{ type: 'flag_missing', value: 'heard_blood_river_rumor' }], text: '说书人醒木一拍，说起失传百年的《血河经》重现破庙黑市。满堂茶客忽然安静。', choices: [
    { id: 'listen', text: '细听传闻', staminaCost: 1, effects: [{ type: 'set_flag', value: 'heard_blood_river_rumor' }, { type: 'set_flag', value: 'blood_river_clue' }] },
    { id: 'ask', text: '打赏说书人追问线索', staminaCost: 1, effects: [{ type: 'set_flag', value: 'heard_blood_river_rumor' }, { type: 'gain_silver', value: -5 }, { type: 'set_flag', value: 'temple_opened' }] },
  ] },
  { id: 'teahouse_blood_river_investigation_02', title: '残页墨痕', phase: 'day', locationId: 'teahouse', weight: 145, requirements: [{ type: 'flag', value: 'heard_blood_river_rumor' }, { type: 'flag_missing', value: 'blood_river_fragment_found' }], text: '说书人散场后，茶博士悄悄递来一张被雨水泡开的旧纸。墨痕里反复出现“血河不在经中，在人心中”几个字。', choices: [
    { id: 'trace', text: '循墨痕追查残页来历', staminaCost: 2, effects: [{ type: 'set_flag', value: 'blood_river_fragment_found' }, { type: 'set_flag', value: 'blood_river_clue' }, { type: 'stat', stat: 'mind', value: 1 }] },
    { id: 'burn', text: '当众焚去残页稳住人心', staminaCost: 1, effects: [{ type: 'set_flag', value: 'blood_river_fragment_found' }, { type: 'stat', stat: 'reputation', value: 2 }] },
  ] },
  { id: 'town_bandit_notice_01', title: '镖局悬赏', phase: 'day', locationId: 'town', weight: 20, requirements: [], text: '镖局贴出悬赏：黑松林劫匪近日频繁出没。', choices: [
    { id: 'accept', text: '接下悬赏', staminaCost: 2, effects: [{ type: 'start_combat', enemyId: 'bandit' }] },
    { id: 'work', text: '帮忙搬运货物', staminaCost: 1, effects: [{ type: 'gain_silver', value: 6 }, { type: 'gain_item', itemId: 'dry_ration' }, { type: 'gain_item', itemId: 'wheat_flour' }] },
  ] },
  { id: 'town_weapon_stall_01', title: '街口兵器摊', phase: 'day', locationId: 'town', weight: 34, requirements: [{ type: 'flag_missing', value: 'visited_weapon_stall' }], text: '镇口铁匠支起兵器摊，粗铁剑、寒铁刀、编竹护甲、踏影靴与平安玉符并排摆着，价钱写在木牌上。', choices: [
    { id: 'buy_sword', text: '买下粗铁剑（12 两）', staminaCost: 1, requirements: [{ type: 'silver_min', value: 12 }], effects: [{ type: 'gain_silver', value: -12 }, { type: 'gain_card', cardId: 'plain_iron_sword' }, { type: 'set_flag', value: 'visited_weapon_stall' }] },
    { id: 'trade_blade', text: '咬牙购入寒铁刀（20 两）', staminaCost: 1, requirements: [{ type: 'silver_min', value: 20 }], effects: [{ type: 'gain_silver', value: -20 }, { type: 'gain_card', cardId: 'cold_iron_blade' }, { type: 'set_flag', value: 'visited_weapon_stall' }] },
    { id: 'buy_armor', text: '添置编竹护甲（14 两）', staminaCost: 1, requirements: [{ type: 'silver_min', value: 14 }], effects: [{ type: 'gain_silver', value: -14 }, { type: 'gain_card', cardId: 'woven_bamboo_armor' }, { type: 'set_flag', value: 'visited_weapon_stall' }] },
    { id: 'try_boots', text: '试走踏影靴（10 两）', staminaCost: 1, requirements: [{ type: 'silver_min', value: 10 }], effects: [{ type: 'gain_silver', value: -10 }, { type: 'gain_card', cardId: 'shadowstep_boots' }, { type: 'set_flag', value: 'visited_weapon_stall' }] },
    { id: 'buy_talisman', text: '请下平安玉符（16 两）', staminaCost: 1, requirements: [{ type: 'silver_min', value: 16 }], effects: [{ type: 'gain_silver', value: -16 }, { type: 'gain_card', cardId: 'jade_peace_talisman' }, { type: 'set_flag', value: 'visited_weapon_stall' }] },
  ] },
  { id: 'sword_house_morning_drill_01', title: '晨钟试步', phase: 'day', locationId: 'sword_house', weight: 28, requirements: [{ type: 'flag_missing', value: 'learned_cloud_step' }], text: '剑派晨钟初响，弟子们踏着松影练轻功。掌事邀你入阵试步。', choices: [
    { id: 'spar', text: '入阵切磋身法', staminaCost: 2, effects: [{ type: 'start_combat', enemyId: 'sword_house_disciple' }, { type: 'set_flag', value: 'learned_cloud_step' }, { type: 'gain_card', cardId: 'cloud_step' }] },
    { id: 'observe', text: '旁观记下步法', staminaCost: 1, effects: [{ type: 'set_flag', value: 'learned_cloud_step' }, { type: 'gain_card', cardId: 'cloud_step' }] },
  ] },
  { id: 'forest_iron_body_trial_01', title: '铁衣试炼', phase: 'day', locationId: 'forest', weight: 32, requirements: [{ type: 'flag_missing', value: 'learned_iron_cloth' }], text: '林中苦行僧赤臂迎风，称要以木棍试你根骨。若能撑住三合，便传你横练法门。', choices: [
    { id: 'endure', text: '硬接三合', staminaCost: 2, effects: [{ type: 'start_combat', enemyId: 'forest_iron_monk' }, { type: 'set_flag', value: 'learned_iron_cloth' }, { type: 'gain_card', cardId: 'iron_cloth' }] },
    { id: 'pay', text: '以香火钱换口诀', staminaCost: 1, effects: [{ type: 'gain_silver', value: -6 }, { type: 'set_flag', value: 'learned_iron_cloth' }, { type: 'gain_card', cardId: 'iron_cloth' }] },
  ] },
  { id: 'sword_house_shen_intro_01', title: '青霜试剑', phase: 'day', locationId: 'sword_house', weight: 90, requirements: [{ type: 'heroine_stage', heroine: 'shen_qingshuang', value: 0 }, { type: 'flag_missing', value: 'route_locked_luo_hongling' }, { type: 'flag_missing', value: 'route_locked_bai_zhi' }], text: '沈青霜在演武场收剑回身，剑锋停在你喉前三寸。她问：你为何学剑？', choices: [
    { id: 'protect', text: '为护弱者', staminaCost: 2, effects: [{ type: 'heroine_affection', heroine: 'shen_qingshuang', value: 12 }, { type: 'heroine_belief', heroine: 'shen_qingshuang', value: 10 }, { type: 'heroine_stage', heroine: 'shen_qingshuang', value: 1 }, { type: 'gain_card', cardId: 'qingshuang_sword' }] },
    { id: 'win', text: '为胜天下人', staminaCost: 2, effects: [{ type: 'heroine_affection', heroine: 'shen_qingshuang', value: 4 }, { type: 'stat', stat: 'attack', value: 1 }] },
  ] },
  { id: 'sword_house_shen_route_02', title: '同守剑碑', phase: 'day', locationId: 'sword_house', weight: 130, requirements: [{ type: 'heroine_stage', heroine: 'shen_qingshuang', value: 1 }, { type: 'heroine_affection_min', heroine: 'shen_qingshuang', value: 10 }, { type: 'flag_missing', value: 'route_locked_luo_hongling' }, { type: 'flag_missing', value: 'route_locked_bai_zhi' }], text: '剑派祖碑前，沈青霜要你陪她守一夜剑。她说，真正的剑意不是胜负，而是仍愿相信人间。', choices: [
    { id: 'vow', text: '立誓同守正道', staminaCost: 2, effects: [{ type: 'heroine_affection', heroine: 'shen_qingshuang', value: 14 }, { type: 'heroine_belief', heroine: 'shen_qingshuang', value: 12 }, { type: 'heroine_stage', heroine: 'shen_qingshuang', value: 2 }, { type: 'lock_route', heroine: 'shen_qingshuang' }, { type: 'gain_card', cardId: 'stand_together' }] },
    { id: 'doubt', text: '追问正道代价', staminaCost: 1, effects: [{ type: 'heroine_affection', heroine: 'shen_qingshuang', value: 6 }, { type: 'stat', stat: 'mind', value: 1 }] },
  ] },
  { id: 'sword_house_shen_route_03', title: '霜刃封河', phase: 'day', locationId: 'sword_house', weight: 180, requirements: [{ type: 'heroine_stage', heroine: 'shen_qingshuang', value: 2 }, { type: 'heroine_affection_min', heroine: 'shen_qingshuang', value: 24 }, { type: 'heroine_belief_min', heroine: 'shen_qingshuang', value: 20 }, { type: 'flag', value: 'blood_river_clue' }, { type: 'flag', value: 'route_locked_shen_qingshuang' }], text: '沈青霜带你入剑冢，旧剑齐鸣。她愿与你以霜刃镇压血河残卷，但此后你们会成为魔道眼中钉。', choices: [
    { id: 'seal', text: '与她练成封河剑阵', staminaCost: 2, effects: [{ type: 'heroine_affection', heroine: 'shen_qingshuang', value: 10 }, { type: 'set_flag', value: 'blood_river_sealed' }, { type: 'gain_card', cardId: 'frost_seal' }, { type: 'stat', stat: 'reputation', value: 5 }, { type: 'heroine_stage', heroine: 'shen_qingshuang', value: 3 }, { type: 'end_game', endingId: 'shen_qingshuang_good' }] },
    { id: 'alone', text: '独自承担魔道追杀', staminaCost: 2, effects: [{ type: 'heroine_affection', heroine: 'shen_qingshuang', value: 4 }, { type: 'start_combat', enemyId: 'blood_river_puppet' }] },
  ] },
  { id: 'temple_luo_intro_01', title: '破庙夜雨', phase: 'night', locationId: 'ruined_temple', weight: 100, requirements: [{ type: 'heroine_stage', heroine: 'luo_hongling', value: 0 }, { type: 'flag_missing', value: 'route_locked_shen_qingshuang' }, { type: 'flag_missing', value: 'route_locked_bai_zhi' }], text: '夜雨如线，红衣女子倚在供桌旁，肩头血迹未干。她笑问你是来救人，还是来杀人。', choices: [
    { id: 'help', text: '替她挡下追兵', staminaCost: 2, effects: [{ type: 'heroine_affection', heroine: 'luo_hongling', value: 12 }, { type: 'heroine_belief', heroine: 'luo_hongling', value: 8 }, { type: 'heroine_stage', heroine: 'luo_hongling', value: 1 }, { type: 'gain_card', cardId: 'red_lotus_poison' }, { type: 'start_combat', enemyId: 'black_market_master' }] },
    { id: 'watch', text: '暗中观察', staminaCost: 1, effects: [{ type: 'set_flag', value: 'luo_secret_seen' }] },
  ] },
  { id: 'temple_luo_route_02', title: '红莲密信', phase: 'night', locationId: 'ruined_temple', weight: 135, requirements: [{ type: 'heroine_stage', heroine: 'luo_hongling', value: 1 }, { type: 'heroine_affection_min', heroine: 'luo_hongling', value: 10 }, { type: 'flag_missing', value: 'route_locked_shen_qingshuang' }, { type: 'flag_missing', value: 'route_locked_bai_zhi' }], text: '洛红绫把一封染血密信递给你。她说自己既不是圣女，也不是叛徒，只是不想再做棋子。', choices: [
    { id: 'trust', text: '信她一次', staminaCost: 2, effects: [{ type: 'heroine_affection', heroine: 'luo_hongling', value: 14 }, { type: 'heroine_belief', heroine: 'luo_hongling', value: 10 }, { type: 'heroine_stage', heroine: 'luo_hongling', value: 2 }, { type: 'lock_route', heroine: 'luo_hongling' }, { type: 'gain_card', cardId: 'night_escape' }] },
    { id: 'bargain', text: '要她交出黑市线索', staminaCost: 1, effects: [{ type: 'set_flag', value: 'black_market_clue' }, { type: 'heroine_affection', heroine: 'luo_hongling', value: 5 }] },
  ] },
  { id: 'temple_luo_route_03', title: '夜奔之前', phase: 'night', locationId: 'ruined_temple', weight: 190, requirements: [{ type: 'heroine_stage', heroine: 'luo_hongling', value: 2 }, { type: 'heroine_affection_min', heroine: 'luo_hongling', value: 24 }, { type: 'heroine_belief_min', heroine: 'luo_hongling', value: 16 }, { type: 'flag', value: 'blood_river_clue' }, { type: 'flag', value: 'route_locked_luo_hongling' }], text: '正魔两道都在找她。洛红绫站在破庙门口问你：若今夜离开，你可还敢回头？', choices: [
    { id: 'run', text: '与她踏入红尘夜色', staminaCost: 2, effects: [{ type: 'heroine_affection', heroine: 'luo_hongling', value: 10 }, { type: 'set_flag', value: 'escaped_with_luo' }, { type: 'gain_card', cardId: 'red_lotus_bloom' }, { type: 'heroine_stage', heroine: 'luo_hongling', value: 3 }] },
    { id: 'ambush', text: '先解决追兵', staminaCost: 2, effects: [{ type: 'start_combat', enemyId: 'blood_river_puppet' }, { type: 'heroine_affection', heroine: 'luo_hongling', value: 5 }] },
  ] },
  { id: 'clinic_baizhi_intro_01', title: '银针灯火', phase: 'day', locationId: 'clinic', weight: 90, requirements: [{ type: 'heroine_stage', heroine: 'bai_zhi', value: 0 }, { type: 'flag_missing', value: 'route_locked_shen_qingshuang' }, { type: 'flag_missing', value: 'route_locked_luo_hongling' }], text: '白芷正在救治一名走火入魔者。她手很稳，眼神却藏着疲惫。', choices: [
    { id: 'assist', text: '帮她按住病人', staminaCost: 1, effects: [{ type: 'heroine_affection', heroine: 'bai_zhi', value: 10 }, { type: 'heroine_belief', heroine: 'bai_zhi', value: 10 }, { type: 'heroine_stage', heroine: 'bai_zhi', value: 1 }, { type: 'gain_card', cardId: 'silver_needle' }] },
    { id: 'heal', text: '请她疗伤', staminaCost: 1, effects: [{ type: 'heal', value: 12 }, { type: 'gain_item', itemId: 'small_healing_pill' }, { type: 'heroine_affection', heroine: 'bai_zhi', value: 4 }] },
  ] },
  { id: 'clinic_baizhi_route_02', title: '药香问心', phase: 'day', locationId: 'clinic', weight: 132, requirements: [{ type: 'heroine_stage', heroine: 'bai_zhi', value: 1 }, { type: 'heroine_affection_min', heroine: 'bai_zhi', value: 10 }, { type: 'flag_missing', value: 'route_locked_shen_qingshuang' }, { type: 'flag_missing', value: 'route_locked_luo_hongling' }], text: '白芷把脉后沉默许久。她说血河经不是武学，而是一种会传染人心的病。', choices: [
    { id: 'study', text: '帮她整理医案', staminaCost: 2, effects: [{ type: 'heroine_affection', heroine: 'bai_zhi', value: 14 }, { type: 'heroine_belief', heroine: 'bai_zhi', value: 12 }, { type: 'heroine_stage', heroine: 'bai_zhi', value: 2 }, { type: 'lock_route', heroine: 'bai_zhi' }, { type: 'gain_card', cardId: 'clear_mind_powder' }, { type: 'learn_recipe', recipeId: 'herb_chicken_soup' }] },
    { id: 'medicine', text: '购买清心药材', staminaCost: 1, effects: [{ type: 'gain_silver', value: -8 }, { type: 'heal', value: 18 }, { type: 'gain_item', itemId: 'qi_recovery_powder' }, { type: 'gain_item', itemId: 'young_chicken' }, { type: 'heroine_affection', heroine: 'bai_zhi', value: 4 }] },
  ] },
  { id: 'clinic_baizhi_route_03', title: '药谷解方', phase: 'day', locationId: 'clinic', weight: 188, requirements: [{ type: 'heroine_stage', heroine: 'bai_zhi', value: 2 }, { type: 'heroine_affection_min', heroine: 'bai_zhi', value: 24 }, { type: 'heroine_belief_min', heroine: 'bai_zhi', value: 20 }, { type: 'flag', value: 'blood_river_clue' }, { type: 'flag', value: 'route_locked_bai_zhi' }], text: '白芷终于写出解方，但需要有人以内力引毒。她看着你，第一次露出害怕失去的神情。', choices: [
    { id: 'cure', text: '以内力试药', staminaCost: 2, effects: [{ type: 'heroine_affection', heroine: 'bai_zhi', value: 10 }, { type: 'set_flag', value: 'blood_river_cured' }, { type: 'gain_card', cardId: 'life_returning_needle' }, { type: 'stat', stat: 'mind', value: 2 }, { type: 'heroine_stage', heroine: 'bai_zhi', value: 3 }] },
    { id: 'refuse', text: '劝她别冒险', staminaCost: 1, effects: [{ type: 'heroine_affection', heroine: 'bai_zhi', value: 4 }, { type: 'heal', value: 10 }] },
  ] },
  { id: 'forest_mad_warrior_01', title: '失控江湖客', phase: 'day', locationId: 'forest', weight: 40, requirements: [], text: '一名江湖客双眼赤红，口中反复念着血河二字。', choices: [
    { id: 'fight', text: '拔剑制止', staminaCost: 2, effects: [{ type: 'start_combat', enemyId: 'mad_martial_artist' }, { type: 'gain_card', cardId: 'blood_river_strike' }] },
    { id: 'avoid', text: '避开此人', staminaCost: 1, effects: [{ type: 'damage', value: 3 }] },
  ] },
  { id: 'forest_inner_power_trial_01', title: '寒潭运功', phase: 'day', locationId: 'forest', weight: 36, requirements: [{ type: 'flag_missing', value: 'completed_inner_power_trial' }], text: '黑松林深处有一口寒潭，老渔翁说若能在潭边行功一周天，便能拓宽经脉，但稍有不慎就会寒气入体。', choices: [
    { id: 'meditate', text: '冒寒运功拓宽经脉', staminaCost: 2, effects: [{ type: 'set_flag', value: 'completed_inner_power_trial' }, { type: 'stat', stat: 'maxInnerPower', value: 1 }, { type: 'stat', stat: 'innerPower', value: 1 }, { type: 'damage', value: 6 }] },
    { id: 'camp', text: '稳妥扎营恢复脚力', staminaCost: 1, effects: [{ type: 'set_flag', value: 'completed_inner_power_trial' }, { type: 'increase_max_stamina', value: 1 }, { type: 'heal', value: 6 }, { type: 'gain_item', itemId: 'spring_water' }, { type: 'gain_item', itemId: 'wild_herb' }] },
  ] },
  { id: 'ruined_temple_black_market_ambush_01', title: '黑市截杀', phase: 'night', locationId: 'ruined_temple', weight: 75, requirements: [{ type: 'flag_missing', value: 'black_market_ambush_resolved' }], text: '破庙黑市灯火摇曳，几名蒙面客盯上你腰间的钱袋。夜路有利可图，也有血光。', choices: [
    { id: 'fight_back', text: '拔剑反截这笔黑吃黑', staminaCost: 2, effects: [{ type: 'set_flag', value: 'black_market_ambush_resolved' }, { type: 'start_combat', enemyId: 'black_market_master' }, { type: 'gain_silver', value: 30 }] },
    { id: 'pay_toll', text: '破财消灾保住性命', staminaCost: 1, effects: [{ type: 'set_flag', value: 'black_market_ambush_resolved' }, { type: 'gain_silver', value: -12 }, { type: 'damage', value: 4 }] },
  ] },
  { id: 'ruined_temple_blood_altar_01', title: '血坛夜鸣', phase: 'night', locationId: 'ruined_temple', weight: 260, requirements: [{ type: 'day_min', value: 25 }, { type: 'flag', value: 'blood_river_fragment_found' }, { type: 'flag_missing', value: 'blood_altar_disrupted' }], text: '破庙深处，残页墨痕与地上血纹遥相呼应。血河经似乎不再只是传闻，它正在借人心苏醒。', choices: [
    { id: 'disrupt', text: '斩碎血坛引出幕后傀儡', staminaCost: 2, effects: [{ type: 'set_flag', value: 'blood_altar_disrupted' }, { type: 'start_combat', enemyId: 'blood_river_puppet' }] },
    { id: 'read', text: '冒险默记血纹逆流法', staminaCost: 2, effects: [{ type: 'set_flag', value: 'blood_altar_disrupted' }, { type: 'gain_card', cardId: 'blood_river_strike' }, { type: 'gain_item', itemId: 'blood_jade_fragment' }, { type: 'stat', stat: 'demonHeart', value: 2 }] },
  ] },
  { id: 'main_final_choice', title: '最终抉择', phase: 'any', locationId: 'teahouse', weight: 1000, requirements: [{ type: 'day_min', value: 25 }, { type: 'flag', value: 'blood_river_clue' }], text: '三十日将近，《血河经》完整残卷就在眼前。你必须选择它的归宿。', choices: [
    { id: 'seal', text: '与沈青霜封印血河经', staminaCost: 1, effects: [{ type: 'set_flag', value: 'blood_river_sealed' }, { type: 'stat', stat: 'reputation', value: 5 }, { type: 'end_game', endingId: 'righteous_rising' }] },
    { id: 'escape', text: '与洛红绫夜奔', staminaCost: 1, effects: [{ type: 'set_flag', value: 'escaped_with_luo' }, { type: 'end_game', endingId: 'luo_hongling_good' }] },
    { id: 'cure', text: '交给白芷研究解法', staminaCost: 1, effects: [{ type: 'set_flag', value: 'blood_river_cured' }, { type: 'end_game', endingId: 'bai_zhi_good' }] },
    { id: 'practice', text: '私自修炼', staminaCost: 1, effects: [{ type: 'stat', stat: 'demonHeart', value: 10 }, { type: 'end_game', endingId: 'demon_fall' }] },
  ] },
]
