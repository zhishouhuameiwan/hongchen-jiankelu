import type { GameEvent, LocationId } from '../types/game'

export const ordinaryEvents: Record<LocationId, GameEvent> = {
  town: {
    id: 'ordinary_town_errand',
    title: '镇中跑腿',
    phase: 'any',
    locationId: 'town',
    weight: 0,
    requirements: [],
    text: '青石镇人来人往，总有些不惊动江湖的小事需要人搭把手。',
    choices: [
      { id: 'help', text: '替商户跑一趟腿', staminaCost: 1, effects: [{ type: 'gain_silver', value: 4 }] },
    ],
  },
  teahouse: {
    id: 'ordinary_teahouse_rumor',
    title: '茶楼闲谈',
    phase: 'any',
    locationId: 'teahouse',
    weight: 0,
    requirements: [],
    text: '茶香渐淡，说书人今日没有新鲜江湖秘闻，倒是茶客愿与你闲谈几句。',
    choices: [
      { id: 'listen', text: '静听市井消息', staminaCost: 1, effects: [{ type: 'stat', stat: 'mind', value: 1 }] },
    ],
  },
  forest: {
    id: 'ordinary_forest_herbs',
    title: '林间采药',
    phase: 'any',
    locationId: 'forest',
    weight: 0,
    requirements: [],
    text: '黑松林今日没有异动，湿土之间倒长着几株可入药的草叶。',
    choices: [
      { id: 'gather', text: '采些止血草', staminaCost: 1, effects: [{ type: 'heal', value: 6 }] },
    ],
  },
  clinic: {
    id: 'ordinary_clinic_heal',
    title: '医馆调息',
    phase: 'any',
    locationId: 'clinic',
    weight: 0,
    requirements: [],
    text: '百草医馆今日没有牵动江湖的大事，坐堂医师仍愿为你清创敷药。',
    choices: [
      { id: 'rest', text: '请医师调理伤势', staminaCost: 1, effects: [{ type: 'heal', value: 10 }] },
    ],
  },
  sword_house: {
    id: 'ordinary_sword_house_drill',
    title: '别院演武',
    phase: 'any',
    locationId: 'sword_house',
    weight: 0,
    requirements: [],
    text: '剑派别院暂无要事，演武场边仍有弟子愿意与你拆招。',
    choices: [
      { id: 'practice', text: '观摩剑招练基本功', staminaCost: 1, effects: [{ type: 'stat', stat: 'attack', value: 1 }] },
    ],
  },
  ruined_temple: {
    id: 'ordinary_ruined_temple_scavenge',
    title: '破庙拾荒',
    phase: 'any',
    locationId: 'ruined_temple',
    weight: 0,
    requirements: [],
    text: '破庙今夜没有黑市交易，只剩冷风卷着残香与几枚无人认领的铜钱。',
    choices: [
      { id: 'scavenge', text: '翻找可用物资', staminaCost: 1, effects: [{ type: 'gain_silver', value: 5 }] },
    ],
  },
}
