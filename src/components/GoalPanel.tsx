import { heroines } from '../data/world'
import type { GameState } from '../types/game'

export function getCurrentGoal(state: GameState): string {
  if (state.day >= 25 && state.flags.includes('blood_river_fragment_found')) {
    return '终局将近：前往破庙黑市处理血河异动，或回茶馆作最终抉择。'
  }

  const lockedRoute = heroines.find((heroine) => state.flags.includes(`route_locked_${heroine.id}`))
  if (lockedRoute) {
    const place = lockedRoute.id === 'bai_zhi' ? '医馆' : lockedRoute.id === 'shen_qingshuang' ? '青霜剑派' : '破庙黑市'
    return `推进${lockedRoute.name}缘线：关注${place}与相关选择。`
  }

  if (!state.flags.includes('blood_river_clue')) {
    return '寻找血河经线索：茶馆与黑松林常有风声。'
  }

  return '积蓄实力：提升卡组、维系缘线，并为三十日终局做准备。'
}

export function GoalPanel({ state }: { state: GameState }) {
  return <section className="panel goal-panel" aria-label="当前目标"><h2>当前目标</h2><p>{getCurrentGoal(state)}</p></section>
}
