import type { GameState, LocationId } from '../types/game'

export function getLocationGuidance(state: GameState, locationId: LocationId): string | undefined {
  if (state.flags.includes('blood_altar_disrupted')) {
    if (!state.flags.includes('ch3_town_blood_jade_traced')) return locationId === 'town' ? '主线：追查血玉残片' : undefined
    if (!state.flags.includes('ch3_blood_river_remnant_defeated')) return locationId === 'forest' ? '主线：截击血河余党' : undefined
    if (!state.endingId) return locationId === 'teahouse' ? '终局：决定血河经归处' : undefined
    return undefined
  }

  if (state.flags.includes('ch1_black_market_boss_defeated')) return undefined

  if (!state.flags.includes('ch1_bandit_notice_taken')) {
    return locationId === 'town' ? '主线：去城镇接镖局急帖' : undefined
  }

  if (!state.flags.includes('ch1_bandit_defeated')) {
    return locationId === 'forest' ? '主线：去黑松林追查劫匪' : undefined
  }

  if (!state.flags.includes('ch1_prepared_for_boss')) {
    return locationId === 'town' ? '主线：回城交差添装' : undefined
  }

  if (locationId !== 'ruined_temple') return undefined

  if (state.phase !== 'night') return '夜晚再去破庙'
  if (state.equipment.weapon !== 'plain_iron_sword') return '需要装备粗铁剑'
  if ((state.itemBag.steamed_bun ?? 0) < 1) return '需要备好蒸饼'
  return '主线：夜探破庙黑市'
}
