import type { EndingDefinition, GameState } from '../types/game'
import { checkRequirements } from './conditionEngine'

export function chooseEnding(state: GameState, endings: EndingDefinition[]): EndingDefinition {
  return endings.filter((ending) => checkRequirements(state, ending.requirements)).sort((a, b) => b.priority - a.priority)[0]
}
