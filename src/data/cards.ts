import type { CardDefinition } from '../types/game'

export const cards: CardDefinition[] = [
  { id: 'basic_slash', name: '劈风斩', type: 'attack', costInnerPower: 0, description: '造成 6 点伤害。', effects: [{ type: 'damage', amount: 6 }], source: 'starter' },
  { id: 'basic_guard', name: '横剑格挡', type: 'defense', costInnerPower: 0, description: '获得 6 点格挡。', effects: [{ type: 'block', amount: 6 }], source: 'starter' },
  { id: 'basic_breath', name: '调息', type: 'inner', costInnerPower: 0, description: '恢复 2 点内力。', effects: [{ type: 'gain_inner_power', amount: 2 }], source: 'starter' },
  { id: 'cloud_step', name: '流云步', type: 'movement', costInnerPower: 0, description: '获得 4 点格挡，抽 1 张牌。', effects: [{ type: 'block', amount: 4 }, { type: 'draw', amount: 1 }], source: 'town' },
  { id: 'iron_cloth', name: '铁布衫', type: 'defense', costInnerPower: 1, description: '获得 12 点格挡。', effects: [{ type: 'block', amount: 12 }], source: 'forest' },
  { id: 'qingshuang_sword', name: '青霜一剑', type: 'attack', costInnerPower: 1, description: '造成 10 点伤害。', effects: [{ type: 'damage', amount: 10 }], source: 'shen_qingshuang' },
  { id: 'stand_together', name: '并肩御敌', type: 'defense', costInnerPower: 1, description: '获得 8 点格挡，并获得反击。', effects: [{ type: 'block', amount: 8 }, { type: 'apply_status', status: 'counter', amount: 2 }], source: 'shen_qingshuang' },
  { id: 'frost_seal', name: '霜河封脉', type: 'attack', costInnerPower: 2, description: '造成 12 点伤害，并施加 2 层封脉。', effects: [{ type: 'damage', amount: 12 }, { type: 'apply_status', status: 'sealed', amount: 2 }], source: 'shen_qingshuang' },
  { id: 'red_lotus_poison', name: '红莲蚀骨', type: 'trick', costInnerPower: 1, description: '施加 4 层中毒。', effects: [{ type: 'apply_status', status: 'poison', amount: 4 }], source: 'luo_hongling' },
  { id: 'night_escape', name: '夜奔', type: 'movement', costInnerPower: 1, description: '获得 10 点格挡。', effects: [{ type: 'block', amount: 10 }], source: 'luo_hongling' },
  { id: 'red_lotus_bloom', name: '红莲绽夜', type: 'trick', costInnerPower: 2, description: '造成 8 点伤害，并施加 5 层中毒。', effects: [{ type: 'damage', amount: 8 }, { type: 'apply_status', status: 'poison', amount: 5 }], source: 'luo_hongling' },
  { id: 'silver_needle', name: '银针续命', type: 'romance', costInnerPower: 1, description: '恢复 10 点气血。', effects: [{ type: 'heal', amount: 10 }], source: 'bai_zhi' },
  { id: 'clear_mind_powder', name: '清心散', type: 'romance', costInnerPower: 1, description: '清心定神，恢复内力。', effects: [{ type: 'gain_inner_power', amount: 2 }], source: 'bai_zhi' },
  { id: 'life_returning_needle', name: '回命十三针', type: 'romance', costInnerPower: 2, description: '恢复 16 点气血，获得 6 点格挡。', effects: [{ type: 'heal', amount: 16 }, { type: 'block', amount: 6 }], source: 'bai_zhi' },
  { id: 'blood_river_strike', name: '血河逆流', type: 'demonic', costInnerPower: 2, description: '造成 16 点伤害，魔心 +1。', effects: [{ type: 'damage', amount: 16 }, { type: 'gain_demon_heart', amount: 1 }], source: 'blood_river' },
  { id: 'plain_iron_sword', name: '粗铁剑', type: 'equipment', costInnerPower: 0, description: '装备：攻击 +2。朴拙沉稳，适合初入江湖防身。', effects: [], source: 'equipment', equipmentSlot: 'weapon', bonuses: [{ stat: 'attack', value: 2 }] },
  { id: 'cold_iron_blade', name: '寒铁刀', type: 'equipment', costInnerPower: 0, description: '装备：攻击 +3。刀身透寒，出鞘时似有霜声。', effects: [], source: 'equipment', equipmentSlot: 'weapon', bonuses: [{ stat: 'attack', value: 3 }] },
  { id: 'woven_bamboo_armor', name: '编竹护甲', type: 'equipment', costInnerPower: 0, description: '装备：防御 +2。竹片以麻绳层层编缀，轻便却能卸力。', effects: [], source: 'equipment', equipmentSlot: 'armor', bonuses: [{ stat: 'defense', value: 2 }] },
  { id: 'shadowstep_boots', name: '踏影靴', type: 'equipment', costInnerPower: 0, description: '装备：身法 +1。轻履无声，便于夜行脱身。', effects: [], source: 'equipment', equipmentSlot: 'boots', bonuses: [{ stat: 'agility', value: 1 }] },
  { id: 'jade_peace_talisman', name: '平安玉符', type: 'equipment', costInnerPower: 0, description: '装备：气血上限 +6。温润旧玉贴身而佩，能稳住气血。', effects: [], source: 'equipment', equipmentSlot: 'accessory', bonuses: [{ stat: 'maxHp', value: 6 }] },
]

export const starterDeck = ['basic_slash', 'basic_slash', 'basic_guard', 'basic_guard', 'basic_breath']
export const cardById = Object.fromEntries(cards.map((card) => [card.id, card])) as Record<string, CardDefinition>
