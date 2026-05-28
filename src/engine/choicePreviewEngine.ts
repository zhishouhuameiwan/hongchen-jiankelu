import type { Choice, Effect } from '../types/game'

const heroineEffects = new Set<Effect['type']>(['heroine_affection', 'heroine_belief', 'heroine_stage', 'lock_route'])

export function getChoiceOutcomeTags(choice: Choice): string[] {
  const tags: string[] = []
  const add = (tag: string) => { if (!tags.includes(tag)) tags.push(tag) }

  for (const effect of choice.effects) {
    if (heroineEffects.has(effect.type)) add('红颜')
    if (effect.type === 'gain_card') add('获卡')
    if (effect.type === 'start_combat') add('战斗')
    if (effect.type === 'gain_silver') add(effect.value < 0 ? '花费' : '银两')
    if (effect.type === 'heal') add('疗伤')
    if (effect.type === 'damage') add('受伤')
    if (effect.type === 'stat' || effect.type === 'increase_max_stamina') add('属性')
    if (effect.type === 'end_game') add('结局')
  }

  return tags
}
