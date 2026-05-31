import { describe, expect, it } from 'vitest'
import { getLocationGuidance } from '../engine/locationGuidanceEngine'
import type { GameState } from '../types/game'
import { makeState } from './helpers'

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...makeState(), ...overrides }
}

describe('getLocationGuidance', () => {
  it('points the first chapter opening to the town notice', () => {
    const state = makeState()

    expect(getLocationGuidance(state, 'town')).toBe('主线：去城镇接镖局急帖')
    expect(getLocationGuidance(state, 'forest')).toBeUndefined()
  })

  it('points players to the forest after taking the escort notice', () => {
    const state = stateWith({ flags: ['ch1_bandit_notice_taken'] })

    expect(getLocationGuidance(state, 'forest')).toBe('主线：去黑松林追查劫匪')
  })

  it('points players back to town after defeating the first bandits', () => {
    const state = stateWith({ flags: ['ch1_bandit_notice_taken', 'ch1_bandit_defeated'] })

    expect(getLocationGuidance(state, 'town')).toBe('主线：回城交差添装')
  })

  it('explains blocked ruined temple conditions before the boss', () => {
    const prepared = stateWith({ flags: ['ch1_bandit_notice_taken', 'ch1_bandit_defeated', 'ch1_prepared_for_boss'] })
    expect(getLocationGuidance(prepared, 'ruined_temple')).toBe('夜晚再去破庙')

    const nightNoSword = stateWith({ ...prepared, phase: 'night' })
    expect(getLocationGuidance(nightNoSword, 'ruined_temple')).toBe('需要装备粗铁剑')

    const nightNoBun = stateWith({ ...nightNoSword, equipment: { ...nightNoSword.equipment, weapon: 'plain_iron_sword' } })
    expect(getLocationGuidance(nightNoBun, 'ruined_temple')).toBe('需要备好蒸饼')

    const ready = stateWith({ ...nightNoBun, itemBag: { steamed_bun: 1 } })
    expect(getLocationGuidance(ready, 'ruined_temple')).toBe('主线：夜探破庙黑市')
  })

  it('guides chapter three locations until the final teahouse choice is available', () => {
    const chapterTwoDone = stateWith({ flags: ['ch1_black_market_boss_defeated', 'blood_river_fragment_found', 'ch2_teahouse_source_found', 'ch2_forest_corruption_seen', 'blood_altar_disrupted'] })
    expect(getLocationGuidance(chapterTwoDone, 'town')).toBe('主线：追查血玉残片')

    const traced = stateWith({ ...chapterTwoDone, flags: [...chapterTwoDone.flags, 'ch3_town_blood_jade_traced'] })
    expect(getLocationGuidance(traced, 'forest')).toBe('主线：截击血河余党')

    const remnantDefeated = stateWith({ ...traced, flags: [...traced.flags, 'ch3_blood_river_remnant_defeated'] })
    expect(getLocationGuidance(remnantDefeated, 'teahouse')).toBe('终局：决定血河经归处')
  })

  it('stops showing chapter one guidance after the boss is defeated', () => {
    const state = stateWith({ flags: ['ch1_black_market_boss_defeated'] })

    expect(getLocationGuidance(state, 'town')).toBeUndefined()
    expect(getLocationGuidance(state, 'ruined_temple')).toBeUndefined()
  })
})
