import { cardById } from '../data/cards'
import { heroines } from '../data/world'
import type { Choice, Effect, HeroineId, StatKey } from '../types/game'

const statLabels: Record<StatKey, string> = {
  hp: '气血',
  maxHp: '气血上限',
  innerPower: '内力',
  maxInnerPower: '内力上限',
  attack: '攻击',
  defense: '防御',
  agility: '身法',
  mind: '心性',
  reputation: '名声',
  demonHeart: '魔心',
  silver: '银两',
}

function signed(value: number): string {
  return value > 0 ? `+${value}` : `${value}`
}

function heroineName(id: HeroineId): string {
  return heroines.find((heroine) => heroine.id === id)?.name ?? id
}

function describeEffect(effect: Effect): string | undefined {
  if (effect.type === 'gain_silver') return `银两 +${effect.value}`
  if (effect.type === 'gain_card') return `卡牌「${cardById[effect.cardId]?.name ?? effect.cardId}」`
  if (effect.type === 'heal') return `气血 +${effect.value}`
  if (effect.type === 'damage') return `气血 -${effect.value}`
  if (effect.type === 'stat') return `${statLabels[effect.stat]} ${signed(effect.value)}`
  if (effect.type === 'heroine_affection') return `${heroineName(effect.heroine)}好感 ${signed(effect.value)}`
  if (effect.type === 'heroine_belief') return `${heroineName(effect.heroine)}信念 ${signed(effect.value)}`
  if (effect.type === 'heroine_stage') return `${heroineName(effect.heroine)}缘线阶段 ${effect.value}`
  if (effect.type === 'lock_route') return `缘线锁定：${heroineName(effect.heroine)}`
  if (effect.type === 'increase_max_stamina') return `体力上限 +${effect.value}`
  return undefined
}

export function describeChoiceEffects(choice: Choice): string | undefined {
  const descriptions = choice.effects.map(describeEffect).filter((item): item is string => Boolean(item))
  return descriptions.length ? `获得：${descriptions.join('、')}` : undefined
}
