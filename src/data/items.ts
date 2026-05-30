import type { ItemDefinition } from '../types/game'

export const items: ItemDefinition[] = [
  { id: 'small_healing_pill', name: '小还丹', category: 'consumable', description: '江湖常见伤药。使用后恢复 12 点气血。', effects: [{ type: 'heal', value: 12 }], source: 'clinic' },
  { id: 'dry_ration', name: '干粮', category: 'consumable', description: '粗粝耐放的行路口粮。使用后恢复 1 点体力。', effects: [{ type: 'restore_stamina', value: 1 }], source: 'town' },
  { id: 'qi_recovery_powder', name: '回气散', category: 'consumable', description: '入口辛辣的散剂。使用后恢复 1 点内力。', effects: [{ type: 'restore_inner_power', value: 1 }], source: 'clinic' },
  { id: 'blood_jade_fragment', name: '血玉残片', category: 'quest', description: '隐约发烫的残玉，似乎与血河经传闻有关。当前不可使用。', effects: [], source: 'blood_river' },
]

export const itemById = Object.fromEntries(items.map((item) => [item.id, item])) as Record<string, ItemDefinition>
