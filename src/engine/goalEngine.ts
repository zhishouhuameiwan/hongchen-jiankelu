import { heroines } from '../data/world'
import type { GameState } from '../types/game'

export function getCurrentGoal(state: GameState): string {
  const hasNoticeProgress = state.flags.includes('ch1_bandit_notice_taken') || state.flags.includes('ch1_bandit_defeated') || state.flags.includes('ch1_prepared_for_boss') || state.flags.includes('ch1_black_market_boss_defeated')
  const hasBanditProgress = state.flags.includes('ch1_bandit_defeated') || state.flags.includes('ch1_prepared_for_boss') || state.flags.includes('ch1_black_market_boss_defeated')
  const hasBossPreparation = state.flags.includes('ch1_prepared_for_boss') || state.flags.includes('ch1_black_market_boss_defeated')

  if (!hasNoticeProgress) {
    return '第一章：去青石镇接镖局悬赏，攒银两添置兵器。'
  }

  if (!hasBanditProgress) {
    return '第一章：前往黑松林追查劫匪，收集食材与横练法门。'
  }

  if (!hasBossPreparation) {
    return '第一章：回青石镇交差，购买并装备粗铁剑。'
  }

  if (!state.flags.includes('ch1_black_market_boss_defeated')) {
    return '第一章：夜探破庙，击败黑市高手，打开血河经主线。'
  }

  if (state.flags.includes('ch1_black_market_boss_defeated') && state.flags.includes('blood_river_fragment_found')) {
    if (!state.flags.includes('ch2_teahouse_source_found')) {
      return '第二章：去茶馆查问残页墨痕，确认血河经异动源头。'
    }

    if (!state.flags.includes('ch2_forest_corruption_seen')) {
      return '第二章：前往黑松林追查血河失控的江湖客。'
    }

    if (!state.flags.includes('blood_altar_disrupted')) {
      return '第二章：入破庙夜探血坛，决定镇压或窃习血河异法。'
    }
  }

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
