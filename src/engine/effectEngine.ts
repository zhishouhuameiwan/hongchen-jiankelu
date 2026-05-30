import type { Effect, GameState } from '../types/game'
import { startCombat } from './combatEngine'
import { enemyById } from '../data/enemies'
import { cardById } from '../data/cards'
import { itemById } from '../data/items'
import { recipeById } from './cookingEngine'
import { heroines } from '../data/world'

export function applyEffect(state: GameState, effect: Effect): GameState {
  const next: GameState = structuredClone(state)
  switch (effect.type) {
    case 'set_flag': if (!next.flags.includes(effect.value)) next.flags.push(effect.value); return next
    case 'remove_flag': next.flags = next.flags.filter((flag) => flag !== effect.value); return next
    case 'gain_silver': next.player.silver += effect.value; return next
    case 'gain_card': {
      const card = cardById[effect.cardId]
      if (card?.type === 'equipment') {
        if (!next.equipmentBag.includes(effect.cardId)) next.equipmentBag.push(effect.cardId)
        return next
      }
      if (!next.deck.includes(effect.cardId)) next.deck.push(effect.cardId)
      const source = card?.source
      const heroine = heroines.find((item) => item.id === source)
      if (heroine) {
        const unlockedCards = next.heroineStates[heroine.id].unlockedCards
        if (!unlockedCards.includes(effect.cardId)) unlockedCards.push(effect.cardId)
      }
      return next
    }
    case 'gain_item': {
      if (!itemById[effect.itemId]) return next
      const amount = effect.amount ?? 1
      if (amount <= 0) return next
      next.itemBag[effect.itemId] = (next.itemBag[effect.itemId] ?? 0) + amount
      return next
    }
    case 'learn_recipe': {
      if (recipeById[effect.recipeId] && !next.cooking.knownRecipes.includes(effect.recipeId)) next.cooking.knownRecipes.push(effect.recipeId)
      return next
    }
    case 'gain_cooking_exp': next.cooking.exp += effect.value; return next
    case 'heal': next.player.stats.hp = Math.min(next.player.stats.maxHp, next.player.stats.hp + effect.value); return next
    case 'damage': next.player.stats.hp = Math.max(0, next.player.stats.hp - effect.value); return next
    case 'stat': {
      if (effect.stat === 'silver') next.player.silver = Math.max(0, next.player.silver + effect.value)
      else next.player.stats[effect.stat] += effect.value
      return next
    }
    case 'heroine_affection': next.heroineStates[effect.heroine].affection += effect.value; return next
    case 'heroine_belief': next.heroineStates[effect.heroine].belief += effect.value; return next
    case 'heroine_stage': next.heroineStates[effect.heroine].routeStage = effect.value; return next
    case 'lock_route': {
      const lockFlag = `route_locked_${effect.heroine}`
      if (!next.flags.includes(lockFlag)) next.flags.push(lockFlag)
      for (const heroine of heroines) next.heroineStates[heroine.id].locked = heroine.id !== effect.heroine
      return next
    }
    case 'start_combat': return startCombat(next, enemyById[effect.enemyId])
    case 'go_to_event': next.currentEventId = effect.eventId; next.screen = 'event'; return next
    case 'increase_max_stamina': next.maxStamina += effect.value; next.stamina += effect.value; return next
    case 'end_game': next.endingId = effect.endingId; next.screen = 'ending'; return next
  }
}

export function applyEffects(state: GameState, effects: Effect[]): GameState {
  return effects.reduce((current, effect) => applyEffect(current, effect), state)
}
