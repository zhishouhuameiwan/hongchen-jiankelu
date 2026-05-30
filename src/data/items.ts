import type { ItemDefinition } from '../types/game'

export const items: ItemDefinition[] = [
  { id: 'small_healing_pill', name: '小还丹', category: 'consumable', description: '江湖常见伤药。使用后恢复 12 点气血。', effects: [{ type: 'heal', value: 12 }], source: 'clinic' },
  { id: 'dry_ration', name: '干粮', category: 'food', description: '粗粝耐放的行路口粮。食用后恢复 1 点体力。', effects: [{ type: 'restore_stamina', value: 1 }], source: 'town' },
  { id: 'steamed_bun', name: '蒸饼', category: 'food', description: '热气腾腾的麦面蒸饼。食用后恢复 1 点体力。', effects: [{ type: 'restore_stamina', value: 1 }], source: 'cooking' },
  { id: 'herb_chicken_soup', name: '药膳鸡汤', category: 'food', description: '以草药慢炖的温补鸡汤。食用后恢复 1 点体力与 10 点气血。', effects: [{ type: 'restore_stamina', value: 1 }, { type: 'heal', value: 10 }], source: 'cooking' },
  { id: 'wheat_flour', name: '麦粉', category: 'ingredient', description: '磨好的麦粉，是最常见的面点材料。', effects: [], source: 'town' },
  { id: 'spring_water', name: '山泉水', category: 'ingredient', description: '清冽山泉，可入茶、和面或炖汤。', effects: [], source: 'forest' },
  { id: 'wild_herb', name: '野山草', category: 'ingredient', description: '山林中采来的草药，可作药膳辅料。', effects: [], source: 'forest' },
  { id: 'young_chicken', name: '童子鸡', category: 'ingredient', description: '肉质细嫩的食材，适合煲汤。', effects: [], source: 'town' },
  { id: 'qi_recovery_powder', name: '回气散', category: 'consumable', description: '入口辛辣的散剂。使用后恢复 1 点内力。', effects: [{ type: 'restore_inner_power', value: 1 }], source: 'clinic' },
  { id: 'blood_jade_fragment', name: '血玉残片', category: 'quest', description: '隐约发烫的残玉，似乎与血河经传闻有关。当前不可使用。', effects: [], source: 'blood_river' },
]

export const itemById = Object.fromEntries(items.map((item) => [item.id, item])) as Record<string, ItemDefinition>
