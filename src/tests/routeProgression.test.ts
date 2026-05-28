import { describe, expect, it } from 'vitest'
import { events } from '../data/events'
import { getAvailableEvents } from '../engine/eventEngine'
import { makeState } from './helpers'

describe('route progression content', () => {
  it('unlocks heroine middle and final route events from prior stage and affinity', () => {
    const shenStage1 = {
      ...makeState(),
      phase: 'day' as const,
      heroineStates: {
        ...makeState().heroineStates,
        shen_qingshuang: { ...makeState().heroineStates.shen_qingshuang, affection: 12, belief: 10, routeStage: 1 },
      },
    }
    expect(getAvailableEvents(shenStage1, events, 'sword_house').some((event) => event.id === 'sword_house_shen_route_02')).toBe(true)

    const luoStage2 = {
      ...makeState(),
      phase: 'night' as const,
      flags: ['blood_river_clue', 'route_locked_luo_hongling'],
      heroineStates: {
        ...makeState().heroineStates,
        luo_hongling: { ...makeState().heroineStates.luo_hongling, affection: 24, belief: 16, routeStage: 2 },
      },
    }
    expect(getAvailableEvents(luoStage2, events, 'ruined_temple').some((event) => event.id === 'temple_luo_route_03')).toBe(true)
  })

  it('keeps competing heroine routes unavailable once a route is locked', () => {
    const state = {
      ...makeState(),
      phase: 'day' as const,
      flags: ['route_locked_shen_qingshuang'],
      heroineStates: {
        ...makeState().heroineStates,
        bai_zhi: { ...makeState().heroineStates.bai_zhi, affection: 18, belief: 16, routeStage: 1 },
      },
    }

    expect(getAvailableEvents(state, events, 'clinic').some((event) => event.id === 'clinic_baizhi_route_02')).toBe(false)
  })
})
