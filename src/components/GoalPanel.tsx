import type { GameState } from '../types/game'
import { getCurrentGoal } from '../engine/goalEngine'

export function GoalPanel({ state }: { state: GameState }) {
  return <section className="panel goal-panel" aria-label="当前目标"><h2>当前目标</h2><p>{getCurrentGoal(state)}</p></section>
}
