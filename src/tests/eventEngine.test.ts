import { describe, expect, it } from 'vitest'
import { applyChoice, getAvailableEvents } from '../engine/eventEngine'
import { events } from '../data/events'
import { makeState } from './helpers'

describe('eventEngine', () => {
  it('finds teahouse rumor event', () => {
    const found = getAvailableEvents(makeState(), events, 'teahouse')
    expect(found[0].id).toBe('teahouse_blood_river_rumor_01')
  })

  it('does not mark chapter three remnant flags when choosing the combat entrance', () => {
    const state = {
      ...makeState(),
      flags: ['ch3_town_blood_jade_traced'],
      currentEventId: 'ch3_forest_blood_river_remnant_01',
      currentLocationId: 'forest' as const,
      screen: 'event' as const,
    }
    const event = events.find((item) => item.id === 'ch3_forest_blood_river_remnant_01')!
    const duelChoice = event.choices.find((choice) => choice.id === 'duel')!

    const afterChoice = applyChoice(state, duelChoice)

    expect(afterChoice.screen).toBe('combat')
    expect(afterChoice.currentCombat?.enemyId).toBe('blood_river_puppet')
    expect(afterChoice.flags).not.toContain('ch3_blood_river_remnant_defeated')
    expect(afterChoice.flags).not.toContain('blood_river_complete_scroll_found')
    expect(afterChoice.flags).toContain('seen_ch3_forest_blood_river_remnant_01')
  })
})
