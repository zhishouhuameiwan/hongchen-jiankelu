import { describe, expect, it } from 'vitest'
import { pickEventForLocation } from '../engine/eventEngine'
import { events } from '../data/events'
import { makeState } from './helpers'

describe('pickEventForLocation', () => {
  it('rotates away from already seen events when alternatives are available', () => {
    const state = { ...makeState(), flags: ['seen_event_a'] }
    const townEvent = events.find((event) => event.locationId === 'town')!
    const selected = pickEventForLocation(state, [
      { ...townEvent, id: 'event_a', weight: 100, requirements: [] },
      { ...townEvent, id: 'event_b', weight: 50, requirements: [] },
    ], 'town')

    expect(selected?.id).toBe('event_b')
  })

  it('falls back to a simple clinic healing event when no special clinic event is available', () => {
    const base = makeState()
    const state = { ...base, player: { ...base.player, stats: { ...base.player.stats, hp: 40 } } }

    const selected = pickEventForLocation(state, [], 'clinic')

    expect(selected?.id).toBe('ordinary_clinic_heal')
    expect(selected?.title).toBe('医馆调息')
    expect(selected?.choices[0].effects).toContainEqual({ type: 'heal', value: 10 })
  })

  it('uses an ordinary event instead of repeating a seen special event', () => {
    const clinicEvent = events.find((event) => event.locationId === 'clinic')!
    const base = makeState()
    const state = {
      ...base,
      flags: [`seen_${clinicEvent.id}`],
      player: { ...base.player, stats: { ...base.player.stats, hp: 40 } },
    }

    const selected = pickEventForLocation(state, [{ ...clinicEvent, requirements: [] }], 'clinic')

    expect(selected?.id).toBe('ordinary_clinic_heal')
  })
})
