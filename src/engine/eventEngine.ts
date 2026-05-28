import type { Choice, GameEvent, GameState } from '../types/game'
import { checkRequirements } from './conditionEngine'
import { applyEffects } from './effectEngine'
import { spendStamina } from './dayPhaseEngine'
import { describeChoiceEffects } from './rewardSummaryEngine'

export function getAvailableEvents(state: GameState, events: GameEvent[], locationId: string): GameEvent[] {
  return events.filter((event) => event.locationId === locationId && (event.phase === 'any' || event.phase === state.phase) && checkRequirements(state, event.requirements)).sort((a, b) => b.weight - a.weight)
}

export function pickEventForLocation(state: GameState, events: GameEvent[], locationId: string): GameEvent | undefined {
  const available = getAvailableEvents(state, events, locationId)
  if (available.length <= 1) return available[0]
  return available.find((event) => !state.flags.includes(`seen_${event.id}`)) ?? available[0]
}

export function canChooseChoice(state: GameState, choice: Choice): boolean {
  return state.stamina >= choice.staminaCost && checkRequirements(state, choice.requirements ?? [])
}

export function applyChoice(state: GameState, choice: Choice): GameState {
  if (!canChooseChoice(state, choice)) throw new Error('无法选择该选项')
  const next = applyEffects(spendStamina(state, choice.staminaCost), choice.effects)
  const seenFlag = state.currentEventId ? `seen_${state.currentEventId}` : undefined
  const flags = seenFlag && !next.flags.includes(seenFlag) ? [...next.flags, seenFlag] : next.flags
  const rewardSummary = describeChoiceEffects(choice)
  return { ...next, flags, currentEventId: next.currentEventId, screen: next.currentCombat ? 'combat' : next.screen === 'ending' ? 'ending' : 'map', log: [...next.log, `选择：${choice.text}`, ...(rewardSummary ? [rewardSummary] : [])] }
}
