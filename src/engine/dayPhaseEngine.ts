import type { GameState } from '../types/game'
import { maxDays } from '../data/world'
import { chooseEnding } from './endingEngine'
import { endings } from '../data/endings'

export function spendStamina(state: GameState, amount: number): GameState {
  if (state.stamina < amount) throw new Error('体力不足')
  return { ...state, stamina: state.stamina - amount }
}

export function advancePhase(state: GameState): GameState {
  if (state.phase === 'day') {
    const recoveredStamina = Math.min(state.maxStamina, state.stamina + Math.ceil(state.maxStamina / 2))
    return { ...state, screen: 'map', phase: 'night', stamina: recoveredStamina, currentEventId: undefined, currentLocationId: undefined, log: [...state.log, '夜色渐深，江湖暗流浮现。'] }
  }
  const nextDay = state.day + 1
  if (nextDay > maxDays) {
    const ending = chooseEnding(state, endings)
    return { ...state, endingId: ending.id, screen: 'ending', log: [...state.log, '三十日已尽，江湖给出了答案。'] }
  }
  return { ...state, day: nextDay, phase: 'day', stamina: state.maxStamina, player: { ...state.player, stats: { ...state.player.stats, innerPower: state.player.stats.maxInnerPower } }, currentEventId: undefined, currentLocationId: undefined, log: [...state.log, `第 ${nextDay} 天，晨光照入窗棂。`] }
}
