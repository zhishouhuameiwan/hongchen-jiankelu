import type { GameState, ItemEffect } from '../types/game'
import { itemById } from '../data/items'

function applyItemEffect(state: GameState, effect: ItemEffect): GameState {
  switch (effect.type) {
    case 'heal':
      return { ...state, player: { ...state.player, stats: { ...state.player.stats, hp: Math.min(state.player.stats.maxHp, state.player.stats.hp + effect.value) } } }
    case 'restore_stamina':
      return { ...state, stamina: Math.min(state.maxStamina, state.stamina + effect.value) }
    case 'restore_inner_power':
      return { ...state, player: { ...state.player, stats: { ...state.player.stats, innerPower: Math.min(state.player.stats.maxInnerPower, state.player.stats.innerPower + effect.value) } } }
  }
}

export function gainItem(state: GameState, itemId: string, amount = 1): GameState {
  if (!itemById[itemId] || amount <= 0) return state
  return { ...state, itemBag: { ...state.itemBag, [itemId]: (state.itemBag[itemId] ?? 0) + amount } }
}

export function useItem(state: GameState, itemId: string): GameState {
  const item = itemById[itemId]
  const count = state.itemBag[itemId] ?? 0
  if (!item || item.category !== 'consumable' || count <= 0) return state
  const afterEffects = item.effects.reduce((current, effect) => applyItemEffect(current, effect), state)
  const nextCount = count - 1
  const itemBag = { ...afterEffects.itemBag }
  if (nextCount > 0) itemBag[itemId] = nextCount
  else delete itemBag[itemId]
  return { ...afterEffects, itemBag, log: [...afterEffects.log, `使用物品：${item.name}。`] }
}
