import { cardById } from '../data/cards'
import type { EquipmentSlot, GameState, StatKey } from '../types/game'

const statLabels: Record<Exclude<StatKey, 'silver'>, string> = {
  hp: '气血',
  maxHp: '最大气血',
  innerPower: '内力',
  maxInnerPower: '最大内力',
  attack: '攻击',
  defense: '防御',
  agility: '身法',
  mind: '心性',
  reputation: '名声',
  demonHeart: '魔心',
}

export const equipmentSlotLabels: Record<EquipmentSlot, string> = {
  weapon: '武器',
  armor: '护具',
  boots: '步履',
  accessory: '饰物',
}

export function equipEquipmentCard(state: GameState, cardId: string): GameState {
  const card = cardById[cardId]
  if (!card || card.type !== 'equipment' || !card.equipmentSlot) return structuredClone(state)
  const next: GameState = structuredClone(state)
  next.equipment = { ...(next.equipment ?? {}), [card.equipmentSlot]: cardId }
  next.equipmentBag = next.equipmentBag?.includes(cardId) ? next.equipmentBag : [...(next.equipmentBag ?? []), cardId]
  next.deck = next.deck.filter((id) => id !== cardId)
  next.log = [...next.log, `装备：${card.name}。`]
  return next
}

export function unequipEquipmentCard(state: GameState, slot: EquipmentSlot): GameState {
  const next: GameState = structuredClone(state)
  const cardId = next.equipment?.[slot]
  if (!cardId) return next
  const { [slot]: _removed, ...equipment } = next.equipment
  next.equipment = equipment
  next.log = [...next.log, `卸下：${cardById[cardId]?.name ?? cardId}。`]
  return next
}

export function getEquippedStatBonus(state: GameState, stat: Exclude<StatKey, 'silver'>): number {
  return Object.values(state.equipment ?? {}).reduce((total, cardId) => {
    const card = cardId ? cardById[cardId] : undefined
    return total + (card?.bonuses ?? []).filter((bonus) => bonus.stat === stat).reduce((sum, bonus) => sum + bonus.value, 0)
  }, 0)
}

export function getEquipmentBonusText(cardId: string): string {
  const bonuses = cardById[cardId]?.bonuses ?? []
  return bonuses.map((bonus) => `${statLabels[bonus.stat]} +${bonus.value}`).join('、')
}
